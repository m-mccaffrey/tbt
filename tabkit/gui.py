"""Desktop UI (PySide6).

Phase 2: an editable tab grid. Click to place the cursor, type fret
numbers (two digits combine, like the web app), arrows to move,
Delete/Backspace to clear, Ctrl+Z/Ctrl+Shift+Z undo/redo, Ctrl+S save,
Ctrl+B / Ctrl+Shift+B insert/delete bar, Space play/stop, Shift+Space
play from the cursor. Layout mirrors the web app: tracks stacked
vertically, one row per string, fret numbers on beats.
"""

from __future__ import annotations

import copy
import sys
from pathlib import Path

from PySide6.QtCore import Qt, QTimer
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
from .model import build_measure_map, get_time_sig, time_sig_beats

BEAT_W = 26        # px per 16th position
STRING_H = 22      # px per string line
TRACK_GAP = 46
TOP_PAD = 40
LEFT_PAD = 56
MAX_FRET = 24
MAX_UNDO = 200


def new_song() -> dict:
    def measure():
        return {"beats": [{"notes": [None] * 6} for _ in range(16)],
                "barLine": "single", "timeSig": {"num": 4, "den": 4}}
    return {"title": "Untitled", "tempo": 120, "tracks": [{
        "name": "Guitar", "numStrings": 6, "tuning": [40, 45, 50, 55, 59, 64],
        "instrument": 25, "midiChannel": 0,
        "measures": [measure() for _ in range(4)],
    }]}


class TabView(QWidget):
    """Paints the tab grid for all tracks; owns cursor and playhead."""

    def __init__(self):
        super().__init__()
        self.song = None
        self.meas_map = []
        self.track_tops: list[int] = []
        self.playhead: tuple[int, int] | None = None  # (measure, global beat)
        self.cursor: dict | None = None  # track/string/measure/beat
        self.on_key = None  # MainWindow's key handler
        self.setFocusPolicy(Qt.StrongFocus)

    def set_song(self, song) -> None:
        self.song = song
        self.refresh_layout()
        self.playhead = None
        if song and self.cursor is None:
            self.cursor = {"track": 0, "string": 0, "measure": 0, "beat": 0}
        self.clamp_cursor()
        self.update()

    def refresh_layout(self) -> None:
        self.meas_map = build_measure_map(self.song) if self.song else []
        total_w = LEFT_PAD + sum(m["beats"] for m in self.meas_map) * BEAT_W + 40
        self.track_tops = []
        y = TOP_PAD
        if self.song:
            for trk in self.song["tracks"]:
                self.track_tops.append(y)
                y += trk["numStrings"] * STRING_H + TRACK_GAP
        self.setMinimumSize(max(400, total_w), max(200, y))

    def clamp_cursor(self) -> None:
        if not (self.song and self.cursor):
            return
        c = self.cursor
        c["track"] = max(0, min(c["track"], len(self.song["tracks"]) - 1))
        trk = self.song["tracks"][c["track"]]
        c["measure"] = max(0, min(c["measure"], len(trk["measures"]) - 1))
        c["string"] = max(0, min(c["string"], trk["numStrings"] - 1))
        beats = trk["measures"][c["measure"]]["beats"]
        c["beat"] = max(0, min(c["beat"], len(beats) - 1))

    def set_playhead(self, measure: int, beat: int) -> None:
        self.playhead = (measure, beat)
        self.update()

    def cursor_note(self):
        c = self.cursor
        if not (self.song and c):
            return None
        beats = self.song["tracks"][c["track"]]["measures"][c["measure"]]["beats"]
        return beats[c["beat"]]["notes"][c["string"]]

    # --- hit testing ---

    def mousePressEvent(self, event) -> None:  # noqa: N802 (Qt API)
        if not self.song:
            return
        x, y = event.position().x(), event.position().y()
        for ti, top in enumerate(self.track_tops):
            trk = self.song["tracks"][ti]
            if not top <= y < top + trk["numStrings"] * STRING_H:
                continue
            si = int((y - top) // STRING_H)
            mx = LEFT_PAD
            for mi, info in enumerate(self.meas_map):
                mw = info["beats"] * BEAT_W
                if mx <= x < mx + mw and mi < len(trk["measures"]):
                    beats = trk["measures"][mi]["beats"]
                    bw = mw / max(1, len(beats))
                    bi = min(len(beats) - 1, int((x - mx) // bw))
                    self.cursor = {"track": ti, "string": si,
                                   "measure": mi, "beat": bi}
                    self.setFocus()
                    self.update()
                    return
                mx += mw

    def keyPressEvent(self, event) -> None:  # noqa: N802 (Qt API)
        if self.on_key and self.on_key(event):
            return
        super().keyPressEvent(event)

    # --- painting ---

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

        for ti, trk in enumerate(self.song["tracks"]):
            y = self.track_tops[ti]
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
                    # cursor cell
                    c = self.cursor
                    if (c and c["track"] == ti and c["measure"] == mi):
                        cx = x + c["beat"] * bw
                        cy = y + c["string"] * STRING_H + STRING_H // 2 - 9
                        p.fillRect(int(cx), int(cy), max(12, int(bw) - 4), 18,
                                   QColor(66, 133, 244, 70))
                        p.setPen(QPen(QColor("#4285f4"), 1))
                        p.drawRect(int(cx), int(cy), max(12, int(bw) - 4), 18)
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

        if self.playhead is not None:
            mi, bi = self.playhead
            if mi < len(self.meas_map):
                px = LEFT_PAD + (self.meas_map[mi]["start"] + bi) * BEAT_W
                p.setPen(QPen(QColor("#e2574c"), 2))
                bottom = self.track_tops[-1] + \
                    self.song["tracks"][-1]["numStrings"] * STRING_H
                p.drawLine(px, TOP_PAD - 14, px, bottom)


class MainWindow(QMainWindow):
    def __init__(self, sf2: str | None = None):
        super().__init__()
        self.resize(1100, 640)
        self.sf2 = sf2
        self.song = new_song()
        self.path: str | None = None
        self.dirty = False
        self.player = None
        self.backend = None
        self._undo: list = []
        self._redo: list = []
        self._pending_fret: str = ""
        self._fret_timer = QTimer(self)
        self._fret_timer.setSingleShot(True)
        self._fret_timer.setInterval(700)
        self._fret_timer.timeout.connect(self._commit_pending_fret)

        self.view = TabView()
        self.view.on_key = self.handle_key
        scroll = QScrollArea()
        scroll.setWidget(self.view)
        scroll.setWidgetResizable(True)
        self.setCentralWidget(scroll)

        tb = QToolBar()
        tb.setMovable(False)
        self.addToolBar(tb)

        def act(text, slot, shortcut=None):
            a = QAction(text, self)
            if shortcut:
                a.setShortcut(shortcut)
            a.triggered.connect(slot)
            tb.addAction(a)
            return a

        act("New", self.new_file, QKeySequence.New)
        act("Open", self.open_dialog, QKeySequence.Open)
        act("Save", self.save, QKeySequence.Save)
        act("Save As", self.save_as, QKeySequence.SaveAs)
        self.play_act = act("Play", self.toggle_play)
        act("Undo", self.undo, QKeySequence.Undo)
        act("Redo", self.redo, QKeySequence("Ctrl+Shift+Z"))
        self.status = QLabel("Ready")
        self.statusBar().addWidget(self.status)

        self._pending_tick: tuple | None = None
        self._ui_timer = QTimer(self)
        self._ui_timer.setInterval(16)
        self._ui_timer.timeout.connect(self._flush_tick)
        self._ui_timer.start()

        self.view.set_song(self.song)
        self._update_title()

    # --- file handling ---

    def _update_title(self) -> None:
        name = Path(self.path).name if self.path else "untitled"
        self.setWindowTitle(f"TabKit — {name}{' *' if self.dirty else ''}")

    def _confirm_discard(self) -> bool:
        if not self.dirty:
            return True
        r = QMessageBox.question(
            self, "TabKit", "Discard unsaved changes?",
            QMessageBox.Discard | QMessageBox.Cancel)
        return r == QMessageBox.Discard

    def new_file(self) -> None:
        if not self._confirm_discard():
            return
        self.song = new_song()
        self.path = None
        self.dirty = False
        self._undo.clear()
        self._redo.clear()
        self.view.cursor = None
        self.view.set_song(self.song)
        self._update_title()

    def open_dialog(self) -> None:
        if not self._confirm_discard():
            return
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
        self.path = path
        self.dirty = False
        self._undo.clear()
        self._redo.clear()
        self.view.cursor = None
        self.view.set_song(self.song)
        self.view.setFocus()
        self.status.setText(
            f"{self.song.get('title') or path} — "
            f"{self.song.get('tempo', 120)} BPM, "
            f"{len(self.song['tracks'])} tracks")
        self._update_title()

    def save(self) -> None:
        if not self.path:
            self.save_as()
            return
        try:
            tktfile.save(self.song, self.path)
        except Exception as exc:
            QMessageBox.critical(self, "TabKit", f"Could not save:\n{exc}")
            return
        self.dirty = False
        self.status.setText(f"Saved {self.path}")
        self._update_title()

    def save_as(self) -> None:
        path, _ = QFileDialog.getSaveFileName(
            self, "Save song", self.path or "song.tkt",
            "TabKit songs (*.tkt *.json)")
        if not path:
            return
        if not path.endswith((".tkt", ".json")):
            path += ".tkt"
        self.path = path
        self.save()

    # --- editing ---

    def _snapshot(self) -> None:
        self._undo.append(copy.deepcopy(self.song))
        if len(self._undo) > MAX_UNDO:
            self._undo.pop(0)
        self._redo.clear()

    def _mutated(self) -> None:
        self.dirty = True
        self.view.refresh_layout()
        self.view.clamp_cursor()
        self.view.update()
        self._update_title()

    def undo(self) -> None:
        if not self._undo:
            return
        self._redo.append(copy.deepcopy(self.song))
        self.song = self._undo.pop()
        self.view.song = self.song
        self._mutated()

    def redo(self) -> None:
        if not self._redo:
            return
        self._undo.append(copy.deepcopy(self.song))
        self.song = self._redo.pop()
        self.view.song = self.song
        self._mutated()

    def _cursor_beats(self):
        c = self.view.cursor
        trk = self.song["tracks"][c["track"]]
        return trk["measures"][c["measure"]]["beats"]

    def _set_fret(self, fret: int) -> None:
        c = self.view.cursor
        self._snapshot()
        self._cursor_beats()[c["beat"]]["notes"][c["string"]] = \
            {"fret": fret, "attack": True}
        self._mutated()
        self._preview_note(fret)

    def _preview_note(self, fret: int) -> None:
        if self.player and self.player.playing:
            return
        backend = self._ensure_backend(quiet=True)
        if backend is None:
            return
        from .compiler import Event
        from .model import note_midi
        c = self.view.cursor
        trk = self.song["tracks"][c["track"]]
        ch = trk.get("midiChannel", c["track"])
        midi = note_midi(trk, c["string"], fret)
        vel = trk.get("trackVelocity") or 80
        backend.send(Event(0, "prog", ch, trk.get("instrument") or 0,
                           trk.get("bank") or 0))
        backend.send(Event(0, "on", ch, midi, vel))
        QTimer.singleShot(600, lambda: backend.send(Event(0, "off", ch, midi)))

    def _clear_note(self) -> None:
        c = self.view.cursor
        if self._cursor_beats()[c["beat"]]["notes"][c["string"]] is None:
            return
        self._snapshot()
        self._cursor_beats()[c["beat"]]["notes"][c["string"]] = None
        self._mutated()

    def insert_bar(self) -> None:
        """Insert an empty measure at the cursor across all tracks
        (port of TabKit.jsx insertBar)."""
        c = self.view.cursor
        self._snapshot()
        ts = get_time_sig(self.song["tracks"][0]["measures"][c["measure"]])
        n_beats = time_sig_beats(ts["num"], ts["den"])
        for trk in self.song["tracks"]:
            trk["measures"].insert(c["measure"], {
                "beats": [{"notes": [None] * trk["numStrings"]}
                          for _ in range(n_beats)],
                "barLine": "single", "beatsPerMeasure": n_beats,
                "globalBeatsPerMeasure": n_beats,
                "timeSig": {"num": ts["num"], "den": ts["den"]},
            })
        self._mutated()
        self.status.setText("Inserted bar")

    def delete_bar(self) -> None:
        c = self.view.cursor
        if len(self.song["tracks"][0]["measures"]) <= 1:
            self.status.setText("Cannot delete last bar")
            return
        self._snapshot()
        for trk in self.song["tracks"]:
            if c["measure"] < len(trk["measures"]):
                trk["measures"].pop(c["measure"])
        self._mutated()
        self.status.setText("Deleted bar")

    def _commit_pending_fret(self) -> None:
        self._pending_fret = ""

    def handle_key(self, event) -> bool:
        c = self.view.cursor
        if not c:
            return False
        key = event.key()
        mods = event.modifiers()

        if key == Qt.Key_Space:
            self.toggle_play(from_cursor=bool(mods & Qt.ShiftModifier))
            return True
        if mods & Qt.ControlModifier:
            if key == Qt.Key_B:
                self.delete_bar() if mods & Qt.ShiftModifier else self.insert_bar()
                return True
            return False

        nav = {Qt.Key_Left: (0, -1), Qt.Key_Right: (0, 1),
               Qt.Key_Up: (-1, 0), Qt.Key_Down: (1, 0)}
        if key in nav:
            ds, db = nav[key]
            self._pending_fret = ""
            trk = self.song["tracks"][c["track"]]
            if db:
                beats = self._cursor_beats()
                c["beat"] += db
                if c["beat"] < 0 and c["measure"] > 0:
                    c["measure"] -= 1
                    c["beat"] = len(trk["measures"][c["measure"]]["beats"]) - 1
                elif c["beat"] >= len(beats) and \
                        c["measure"] < len(trk["measures"]) - 1:
                    c["measure"] += 1
                    c["beat"] = 0
            if ds:
                new_s = c["string"] + ds
                if 0 <= new_s < trk["numStrings"]:
                    c["string"] = new_s
                else:  # cross into the neighboring track
                    nt = c["track"] + (1 if ds > 0 else -1)
                    if 0 <= nt < len(self.song["tracks"]):
                        c["track"] = nt
                        c["string"] = (0 if ds > 0 else
                                       self.song["tracks"][nt]["numStrings"] - 1)
            self.view.clamp_cursor()
            self.view.update()
            return True

        if key in (Qt.Key_Delete, Qt.Key_Backspace):
            self._pending_fret = ""
            self._clear_note()
            return True

        text = event.text()
        if text.isdigit():
            combined = self._pending_fret + text
            fret = int(combined)
            if not self._pending_fret or fret > MAX_FRET:
                fret = int(text)
                self._pending_fret = text
            else:
                self._pending_fret = combined
            self._fret_timer.start()
            self._set_fret(fret)
            return True
        return False

    # --- playback ---

    def _ensure_backend(self, quiet: bool = False):
        if self.backend is None:
            if quiet and getattr(self, "_backend_failed", False):
                return None
            from .engine import FluidSynthBackend, Player
            try:
                self.backend = FluidSynthBackend(sf2=self.sf2)
            except Exception as exc:
                self._backend_failed = True
                if not quiet:
                    QMessageBox.critical(self, "TabKit", str(exc))
                return None
            self.player = Player(self.backend)
            self.player.on_tick = self._on_tick
            self.player.on_finished = lambda: setattr(
                self, "_pending_tick", ("done", 0))
        for i, trk in enumerate(self.song["tracks"]):
            if trk.get("isDrum"):
                self.backend.set_drum_channel(trk.get("midiChannel", i))
        return self.backend

    def toggle_play(self, from_cursor: bool = False) -> None:
        if self.player and self.player.playing:
            self.player.stop()
            self.play_act.setText("Play")
            self.view.playhead = None
            self.view.update()
            return
        if not self.song or self._ensure_backend() is None:
            return
        compiled = compile_song(self.song)
        start = 0.0
        c = self.view.cursor
        if from_cursor and c:
            mm = self.view.meas_map
            flat = mm[c["measure"]]["start"] + c["beat"] if c["measure"] < len(mm) else 0
            for t, mi, bi in compiled.tick_times:
                if mm[mi]["start"] + bi >= flat:
                    start = t
                    break
        self.player.play(compiled, start_time=start)
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
        if not self._confirm_discard():
            event.ignore()
            return
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
