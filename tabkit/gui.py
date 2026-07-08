"""Desktop UI (PySide6) — Phase 1 skeleton.

Opens .tkt/.json songs, renders the tablature grid for every track, and
plays through the FluidSynth engine with a live playhead. Editing tools
arrive in Phase 2 (see ROADMAP.md); the layout mirrors the web app:
tracks stacked vertically, one row per string, fret numbers on beats.
"""

from __future__ import annotations

import sys

from PySide6.QtCore import Qt, QTimer, Signal
from PySide6.QtGui import QAction, QColor, QFont, QKeySequence, QPainter, QPen
from PySide6.QtWidgets import (
    QApplication,
    QFileDialog,
    QLabel,
    QMainWindow,
    QMessageBox,
    QScrollArea,
    QToolBar,
    QWidget,
)

from . import tktfile
from .compiler import compile_song
from .model import build_measure_map, measure_global_beats

BEAT_W = 26        # px per 16th position
STRING_H = 22      # px per string line
TRACK_GAP = 46
TOP_PAD = 40
LEFT_PAD = 56


class TabView(QWidget):
    """Paints the tab grid for all tracks; shows the playhead."""

    clicked_beat = Signal(int, int)  # measure, beat

    def __init__(self):
        super().__init__()
        self.song = None
        self.meas_map = []
        self.playhead: tuple[int, int] | None = None  # (measure, global beat)
        self.setMinimumSize(400, 200)

    def set_song(self, song) -> None:
        self.song = song
        self.meas_map = build_measure_map(song) if song else []
        total_w = LEFT_PAD + sum(m["beats"] for m in self.meas_map) * BEAT_W + 40
        total_h = TOP_PAD
        if song:
            for trk in song["tracks"]:
                total_h += trk["numStrings"] * STRING_H + TRACK_GAP
        self.setMinimumSize(max(400, total_w), max(200, total_h))
        self.playhead = None
        self.update()

    def set_playhead(self, measure: int, beat: int) -> None:
        self.playhead = (measure, beat)
        self.update()

    def paintEvent(self, event) -> None:  # noqa: N802 (Qt API)
        p = QPainter(self)
        p.fillRect(self.rect(), QColor("#f0f2f5"))
        if not self.song:
            p.setPen(QColor("#667"))
            p.drawText(self.rect(), Qt.AlignCenter,
                       "File → Open a .tkt or .json song")
            return

        grid_pen = QPen(QColor("#b9c0cf"))
        bar_pen = QPen(QColor("#59617a"), 2)
        note_font = QFont("monospace", 9)
        label_font = QFont("sans-serif", 9, QFont.Bold)

        y = TOP_PAD
        for trk in self.song["tracks"]:
            ns = trk["numStrings"]
            p.setFont(label_font)
            p.setPen(QColor("#333a52"))
            p.drawText(6, y - 6, trk.get("name", "Track"))

            for si in range(ns):
                ly = y + si * STRING_H + STRING_H // 2
                p.setPen(grid_pen)
                p.drawLine(LEFT_PAD, ly, self.minimumWidth() - 20, ly)

            x = LEFT_PAD
            for mi, info in enumerate(self.meas_map):
                p.setPen(bar_pen if info["barLine"] != "single" else grid_pen)
                p.drawLine(x, y + STRING_H // 2,
                           x, y + (ns - 1) * STRING_H + STRING_H // 2)
                measure = trk["measures"][mi] if mi < len(trk["measures"]) else None
                if measure:
                    beats = measure.get("beats") or []
                    bw = info["beats"] * BEAT_W / max(1, len(beats))
                    p.setFont(note_font)
                    for biw, beat in enumerate(beats):
                        for si, n in enumerate(beat.get("notes") or []):
                            if not n or not n.get("attack"):
                                continue
                            label = ("x" if n.get("muted")
                                     else "·" if n.get("stop")
                                     else str(n.get("fret", "")))
                            nx = x + biw * bw + 3
                            ly = y + si * STRING_H + STRING_H // 2
                            p.fillRect(int(nx) - 1, int(ly) - 8,
                                       10 + 6 * (len(label) - 1), 14,
                                       QColor("#f0f2f5"))
                            p.setPen(QColor("#1a1a2e"))
                            p.drawText(int(nx), int(ly) + 4, label)
                x += info["beats"] * BEAT_W
            p.setPen(grid_pen)
            p.drawLine(x, y + STRING_H // 2,
                       x, y + (ns - 1) * STRING_H + STRING_H // 2)
            y += ns * STRING_H + TRACK_GAP

        if self.playhead is not None:
            mi, bi = self.playhead
            if mi < len(self.meas_map):
                px = LEFT_PAD + (self.meas_map[mi]["start"] + bi) * BEAT_W
                p.setPen(QPen(QColor("#e2574c"), 2))
                p.drawLine(px, TOP_PAD - 14, px, y - TRACK_GAP + 8)


class MainWindow(QMainWindow):
    def __init__(self, sf2: str | None = None):
        super().__init__()
        self.setWindowTitle("TabKit")
        self.resize(1100, 640)
        self.sf2 = sf2
        self.song = None
        self.player = None
        self.backend = None

        self.view = TabView()
        scroll = QScrollArea()
        scroll.setWidget(self.view)
        scroll.setWidgetResizable(True)
        self.setCentralWidget(scroll)

        tb = QToolBar()
        self.addToolBar(tb)
        open_act = QAction("Open", self)
        open_act.setShortcut(QKeySequence.Open)
        open_act.triggered.connect(self.open_dialog)
        tb.addAction(open_act)
        self.play_act = QAction("Play", self)
        self.play_act.setShortcut(Qt.Key_Space)
        self.play_act.triggered.connect(self.toggle_play)
        tb.addAction(self.play_act)
        self.status = QLabel("Ready")
        self.statusBar().addWidget(self.status)

        # Playhead updates cross from the audio thread via a queued list
        self._pending_tick: tuple[int, int] | None = None
        self._ui_timer = QTimer(self)
        self._ui_timer.setInterval(16)
        self._ui_timer.timeout.connect(self._flush_tick)
        self._ui_timer.start()

    def open_dialog(self) -> None:
        path, _ = QFileDialog.getOpenFileName(
            self, "Open song", "", "TabKit songs (*.tkt *.json)")
        if path:
            self.load(path)

    def load(self, path: str) -> None:
        try:
            self.song = tktfile.load(path)
        except Exception as exc:  # surface bad files to the user
            QMessageBox.critical(self, "TabKit", f"Could not open:\n{exc}")
            return
        self.view.set_song(self.song)
        self.status.setText(
            f"{self.song.get('title') or path} — "
            f"{self.song.get('tempo', 120)} BPM, "
            f"{len(self.song['tracks'])} tracks")

    def toggle_play(self) -> None:
        if self.player and self.player.playing:
            self.player.stop()
            self.play_act.setText("Play")
            self.view.playhead = None
            self.view.update()
            return
        if not self.song:
            return
        from .engine import FluidSynthBackend, Player

        if self.backend is None:
            try:
                self.backend = FluidSynthBackend(sf2=self.sf2)
            except Exception as exc:
                QMessageBox.critical(self, "TabKit", str(exc))
                return
            for i, trk in enumerate(self.song["tracks"]):
                if trk.get("isDrum"):
                    self.backend.set_drum_channel(trk.get("midiChannel", i))
            self.player = Player(self.backend)
            self.player.on_tick = self._on_tick
            self.player.on_finished = lambda: setattr(
                self, "_pending_tick", ("done", 0))
        compiled = compile_song(self.song)
        self.player.play(compiled)
        self.play_act.setText("Stop")

    def _on_tick(self, _time: float, measure: int, beat: int) -> None:
        self._pending_tick = (measure, beat)

    def _flush_tick(self) -> None:
        tick, self._pending_tick = self._pending_tick, None
        if tick is None:
            return
        if tick[0] == "done":
            self.play_act.setText("Play")
            self.view.playhead = None
            self.view.update()
        else:
            self.view.set_playhead(*tick)

    def closeEvent(self, event) -> None:  # noqa: N802 (Qt API)
        if self.player:
            self.player.stop()
        if self.backend:
            self.backend.close()
        event.accept()


def run_gui(path: str | None = None, sf2: str | None = None) -> int:
    app = QApplication(sys.argv[:1])
    win = MainWindow(sf2=sf2)
    win.show()
    if path:
        win.load(path)
    return app.exec()
