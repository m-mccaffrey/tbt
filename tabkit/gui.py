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

# Track presets (subset of TabKit.jsx INST_PRESETS)
TRACK_PRESETS = {
    "Guitar": {"numStrings": 6, "tuning": [40, 45, 50, 55, 59, 64],
               "instrument": 25},
    "Bass": {"numStrings": 4, "tuning": [28, 33, 38, 43], "instrument": 33},
    "Drums": {"numStrings": 8, "tuning": [35, 38, 42, 46, 37, 49, 48, 45],
              "instrument": 0, "isDrum": True},
}


def empty_measure(num_strings: int, n_beats: int = 16,
                  ts: dict | None = None) -> dict:
    ts = ts or {"num": 4, "den": 4}
    return {"beats": [{"notes": [None] * num_strings} for _ in range(n_beats)],
            "barLine": "single", "beatsPerMeasure": n_beats,
            "globalBeatsPerMeasure": n_beats,
            "timeSig": {"num": ts["num"], "den": ts["den"]}}


def new_song() -> dict:
    # midiChannel follows the web app's 1-based convention (drums = 10)
    return {"title": "Untitled", "tempo": 120, "tracks": [{
        "name": "Guitar", "numStrings": 6, "tuning": [40, 45, 50, 55, 59, 64],
        "instrument": 25, "midiChannel": 1,
        "measures": [empty_measure(6) for _ in range(4)],
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
        self.sel: dict | None = None  # track + (measure, beat) start/end
        self.on_key = None  # MainWindow's key handler
        self.setFocusPolicy(Qt.StrongFocus)

    def sel_range(self) -> tuple[tuple[int, int], tuple[int, int]] | None:
        """Selection as ordered ((mi, bi) start, (mi, bi) end), inclusive."""
        if not self.sel:
            return None
        a, b = self.sel["start"], self.sel["end"]
        return (a, b) if a <= b else (b, a)

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
        if y < 24:  # sections strip: click selects the section's bars
            from .model import section_at
            for mi, info in enumerate(self.meas_map):
                mx = LEFT_PAD + info["start"] * BEAT_W
                if mx <= x < mx + info["beats"] * BEAT_W:
                    sec = section_at(self.song, mi)
                    if sec and self.cursor:
                        end_bar = min(sec["bar"] + (sec.get("bars") or 1) - 1,
                                      len(self.meas_map) - 1)
                        self.cursor.update({"measure": sec["bar"], "beat": 0})
                        self.clamp_cursor()
                        last_beats = len(self.song["tracks"][self.cursor["track"]]
                                         ["measures"][end_bar]["beats"])
                        self.sel = {"track": self.cursor["track"],
                                    "start": (sec["bar"], 0),
                                    "end": (end_bar, last_beats - 1)}
                        self.update()
                    return
            return
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
                    old = self.cursor
                    if (event.modifiers() & Qt.ShiftModifier and old
                            and old["track"] == ti):
                        if not self.sel:
                            self.sel = {"track": ti,
                                        "start": (old["measure"], old["beat"]),
                                        "end": (mi, bi)}
                        else:
                            self.sel["end"] = (mi, bi)
                    else:
                        self.sel = None
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

        # sections strip above the first track
        for sec in self.song.get("sections") or []:
            if sec["bar"] >= len(self.meas_map):
                continue
            sx = LEFT_PAD + self.meas_map[sec["bar"]]["start"] * BEAT_W
            end_bar = min(sec["bar"] + (sec.get("bars") or 1),
                          len(self.meas_map)) - 1
            ex = LEFT_PAD + (self.meas_map[end_bar]["start"]
                             + self.meas_map[end_bar]["beats"]) * BEAT_W
            color = QColor(sec.get("color") or "#3b82f6")
            p.fillRect(int(sx), 4, int(ex - sx) - 2, 16, color)
            p.setFont(label_font)
            p.setPen(QColor("#ffffff"))
            p.drawText(int(sx) + 4, 16, sec.get("name") or "")

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
                    # selection highlight (all strings of the track)
                    rng = self.sel_range()
                    if rng and self.sel["track"] == ti:
                        (smi, sbi), (emi, ebi) = rng
                        if smi <= mi <= emi:
                            b0 = sbi if mi == smi else 0
                            b1 = ebi if mi == emi else len(beats) - 1
                            p.fillRect(int(x + b0 * bw), y + STRING_H // 2 - 9,
                                       int((b1 - b0 + 1) * bw),
                                       (ns - 1) * STRING_H + 18,
                                       QColor(66, 133, 244, 40))
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

        self._clipboard: list | None = None  # copied beats (note arrays)

        def act(menu, text, slot, shortcut=None, checkable=False):
            a = QAction(text, self)
            if shortcut:
                a.setShortcut(shortcut)
            a.setCheckable(checkable)
            a.triggered.connect(slot)
            menu.addAction(a)
            return a

        mb = self.menuBar()
        m_file = mb.addMenu("&File")
        act(m_file, "New", self.new_file, QKeySequence.New)
        act(m_file, "Open…", self.open_dialog, QKeySequence.Open)
        act(m_file, "Save", self.save, QKeySequence.Save)
        act(m_file, "Save As…", self.save_as, QKeySequence.SaveAs)
        m_file.addSeparator()
        act(m_file, "Export MIDI…", self.export_midi)

        m_edit = mb.addMenu("&Edit")
        act(m_edit, "Undo", self.undo, QKeySequence.Undo)
        act(m_edit, "Redo", self.redo, QKeySequence("Ctrl+Shift+Z"))
        m_edit.addSeparator()
        act(m_edit, "Cut", self.cut_selection, QKeySequence.Cut)
        act(m_edit, "Copy", self.copy_selection, QKeySequence.Copy)
        act(m_edit, "Paste", self.paste_clipboard, QKeySequence.Paste)
        m_edit.addSeparator()
        act(m_edit, "Insert Bar", self.insert_bar, QKeySequence("Ctrl+B"))
        act(m_edit, "Delete Bar", self.delete_bar, QKeySequence("Ctrl+Shift+B"))

        m_song = mb.addMenu("&Song")
        act(m_song, "Title…", self.edit_title)
        act(m_song, "Tempo…", self.edit_tempo, QKeySequence("Ctrl+T"))
        m_song.addSeparator()
        self.metro_act = act(m_song, "Metronome", lambda: None,
                             QKeySequence("Ctrl+M"), checkable=True)
        self.count_in_act = act(m_song, "Count-in", lambda: None,
                                checkable=True)
        self.loop_act = act(m_song, "Loop (selection or song)", lambda: None,
                            QKeySequence("Ctrl+L"), checkable=True)
        m_song.addSeparator()
        act(m_song, "Add/Edit Section…", self.edit_section,
            QKeySequence("Ctrl+E"))
        act(m_song, "Remove Section", self.remove_section)

        m_track = mb.addMenu("&Track")
        for preset in TRACK_PRESETS:
            act(m_track, f"Add {preset}",
                lambda _=False, p=preset: self.add_track(p))
        m_track.addSeparator()
        act(m_track, "Properties…", self.track_properties,
            QKeySequence("Ctrl+P"))
        act(m_track, "Duplicate Track", self.duplicate_track)
        act(m_track, "Rename Track…", self.rename_track)
        act(m_track, "Delete Track", self.delete_track)

        tb = QToolBar()
        tb.setMovable(False)
        self.addToolBar(tb)
        self.play_act = QAction("Play", self)
        self.play_act.triggered.connect(self.toggle_play)
        tb.addAction(self.play_act)
        tb.addAction(self.metro_act)
        tb.addAction(self.loop_act)
        from PySide6.QtWidgets import QSpinBox
        tb.addWidget(QLabel("  Speed % "))
        self.speed_box = QSpinBox()
        self.speed_box.setRange(25, 200)
        self.speed_box.setValue(100)
        self.speed_box.setSingleStep(5)
        tb.addWidget(self.speed_box)
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
        from .model import track_channel
        ch = track_channel(trk, c["track"])
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
        from .model import shift_sections
        shift_sections(self.song, c["measure"], 1)
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
        from .model import shift_sections
        shift_sections(self.song, c["measure"], -1)
        self._mutated()
        self.status.setText("Deleted bar")

    def _commit_pending_fret(self) -> None:
        self._pending_fret = ""

    # --- selection / clipboard ---

    def _sel_beats(self) -> list | None:
        """Beats in the selection (falling back to the cursor cell)."""
        c = self.view.cursor
        rng = self.view.sel_range()
        trk = self.song["tracks"][self.view.sel["track"] if rng else c["track"]]
        if not rng:
            rng = ((c["measure"], c["beat"]), (c["measure"], c["beat"]))
        (smi, sbi), (emi, ebi) = rng
        out = []
        for mi in range(smi, min(emi, len(trk["measures"]) - 1) + 1):
            beats = trk["measures"][mi]["beats"]
            b0 = sbi if mi == smi else 0
            b1 = ebi if mi == emi else len(beats) - 1
            out.extend(beats[b0:b1 + 1])
        return out

    def copy_selection(self) -> None:
        beats = self._sel_beats()
        self._clipboard = copy.deepcopy([b["notes"] for b in beats])
        self.status.setText(f"Copied {len(self._clipboard)} beats")

    def cut_selection(self) -> None:
        beats = self._sel_beats()
        self._clipboard = copy.deepcopy([b["notes"] for b in beats])
        self._snapshot()
        for b in beats:
            b["notes"] = [None] * len(b["notes"])
        self._mutated()
        self.status.setText(f"Cut {len(self._clipboard)} beats")

    def paste_clipboard(self) -> None:
        if not self._clipboard:
            return
        c = self.view.cursor
        trk = self.song["tracks"][c["track"]]
        ns = trk["numStrings"]
        self._snapshot()
        mi, bi = c["measure"], c["beat"]
        for notes in self._clipboard:
            if mi >= len(trk["measures"]):
                break
            beats = trk["measures"][mi]["beats"]
            pasted = copy.deepcopy(notes[:ns])
            pasted += [None] * (ns - len(pasted))
            beats[bi]["notes"] = pasted
            bi += 1
            if bi >= len(beats):
                mi, bi = mi + 1, 0
        self._mutated()
        self.status.setText(f"Pasted {len(self._clipboard)} beats")

    # --- song / track management ---

    def edit_title(self) -> None:
        from PySide6.QtWidgets import QInputDialog
        text, ok = QInputDialog.getText(self, "Song title", "Title:",
                                        text=self.song.get("title") or "")
        if ok:
            self._snapshot()
            self.song["title"] = text
            self._mutated()

    def edit_tempo(self) -> None:
        from PySide6.QtWidgets import QInputDialog
        val, ok = QInputDialog.getInt(self, "Tempo", "BPM:",
                                      self.song.get("tempo") or 120, 30, 500)
        if ok:
            self._snapshot()
            self.song["tempo"] = val
            self._mutated()

    def edit_section(self) -> None:
        """Add a section at the cursor bar (or rename the existing one).
        A selection sets the section's bar span."""
        from PySide6.QtWidgets import QInputDialog

        from .model import SECTION_COLORS, section_at
        c = self.view.cursor
        rng = self.view.sel_range()
        bar = rng[0][0] if rng else c["measure"]
        bars = (rng[1][0] - rng[0][0] + 1) if rng else 1
        existing = section_at(self.song, bar)
        name, ok = QInputDialog.getText(
            self, "Section", "Name (e.g. Verse, Chorus):",
            text=existing.get("name", "") if existing else "")
        if not ok or not name:
            return
        self._snapshot()
        if existing:
            existing["name"] = name
            if rng:
                existing["bar"], existing["bars"] = bar, bars
        else:
            sections = self.song.setdefault("sections", [])
            sections.append({
                "bar": bar, "bars": bars, "name": name,
                "color": SECTION_COLORS[len(sections) % len(SECTION_COLORS)]})
            sections.sort(key=lambda s: s["bar"])
        self._mutated()
        self.status.setText(f"Section '{name}' at bar {bar + 1}")

    def remove_section(self) -> None:
        from .model import section_at
        sec = section_at(self.song, self.view.cursor["measure"])
        if not sec:
            self.status.setText("No section at cursor")
            return
        self._snapshot()
        self.song["sections"].remove(sec)
        self._mutated()
        self.status.setText(f"Removed section '{sec.get('name', '')}'")

    def _free_channel(self, drums: bool) -> int:
        """1-based channel like the web app; drums always get 10."""
        if drums:
            return 10
        used = {t.get("midiChannel") or i + 1
                for i, t in enumerate(self.song["tracks"])}
        for ch in range(1, 17):
            if ch != 10 and ch not in used:
                return ch
        return 1

    def add_track(self, preset_name: str) -> None:
        preset = TRACK_PRESETS[preset_name]
        self._snapshot()
        n_meas = len(self.song["tracks"][0]["measures"])
        ns = preset["numStrings"]
        track = {
            "name": preset_name, "numStrings": ns,
            "tuning": list(preset["tuning"]),
            "instrument": preset["instrument"],
            "isDrum": bool(preset.get("isDrum")),
            "midiChannel": self._free_channel(bool(preset.get("isDrum"))),
            "measures": [empty_measure(ns) for _ in range(n_meas)],
        }
        self.song["tracks"].append(track)
        self.view.cursor = {"track": len(self.song["tracks"]) - 1,
                            "string": 0, "measure": 0, "beat": 0}
        self._mutated()
        self.status.setText(f"Added {preset_name} track")

    def duplicate_track(self) -> None:
        c = self.view.cursor
        self._snapshot()
        dup = copy.deepcopy(self.song["tracks"][c["track"]])
        dup["name"] = (dup.get("name") or "Track") + " (copy)"
        if not dup.get("isDrum"):
            dup["midiChannel"] = self._free_channel(False)
        self.song["tracks"].insert(c["track"] + 1, dup)
        self._mutated()
        self.status.setText("Duplicated track")

    def rename_track(self) -> None:
        from PySide6.QtWidgets import QInputDialog
        c = self.view.cursor
        trk = self.song["tracks"][c["track"]]
        text, ok = QInputDialog.getText(self, "Rename track", "Name:",
                                        text=trk.get("name") or "")
        if ok and text:
            self._snapshot()
            trk["name"] = text
            self._mutated()

    def delete_track(self) -> None:
        if len(self.song["tracks"]) <= 1:
            self.status.setText("Cannot delete last track")
            return
        c = self.view.cursor
        self._snapshot()
        self.song["tracks"].pop(c["track"])
        self.view.sel = None
        self._mutated()
        self.status.setText("Deleted track")

    def track_properties(self) -> None:
        """Edit name, instrument, tuning (or drum lanes), capo, transpose."""
        from PySide6.QtWidgets import (QComboBox, QDialog, QDialogButtonBox,
                                       QFormLayout, QLineEdit, QSpinBox)

        from .model import GM_PROGRAMS, midi_note_name, parse_note_name

        c = self.view.cursor
        trk = self.song["tracks"][c["track"]]
        is_drum = bool(trk.get("isDrum"))

        dlg = QDialog(self)
        dlg.setWindowTitle("Track properties")
        form = QFormLayout(dlg)
        name_edit = QLineEdit(trk.get("name") or "")
        form.addRow("Name", name_edit)
        inst_combo = QComboBox()
        inst_combo.addItems(GM_PROGRAMS)
        inst_combo.setCurrentIndex(trk.get("instrument") or 0)
        if not is_drum:
            form.addRow("Instrument", inst_combo)
        tuning = trk.get("tuning") or []
        if is_drum:
            tuning_text = ",".join(str(t) for t in tuning)
            tuning_label = "Drum lanes (MIDI notes)"
        else:
            tuning_text = " ".join(midi_note_name(t) for t in tuning)
            tuning_label = "Tuning (low→high)"
        tuning_edit = QLineEdit(tuning_text)
        form.addRow(tuning_label, tuning_edit)
        capo_spin = QSpinBox()
        capo_spin.setRange(0, 12)
        capo_spin.setValue(trk.get("capo") or 0)
        trans_spin = QSpinBox()
        trans_spin.setRange(-24, 24)
        trans_spin.setValue(trk.get("transpose") or 0)
        vel_spin = QSpinBox()
        vel_spin.setRange(1, 127)
        vel_spin.setValue(trk.get("trackVelocity") or 80)
        if not is_drum:
            form.addRow("Capo", capo_spin)
            form.addRow("Transpose", trans_spin)
        form.addRow("Velocity", vel_spin)
        buttons = QDialogButtonBox(QDialogButtonBox.Ok | QDialogButtonBox.Cancel)
        buttons.accepted.connect(dlg.accept)
        buttons.rejected.connect(dlg.reject)
        form.addRow(buttons)

        if dlg.exec() != QDialog.Accepted:
            return
        try:
            parts = tuning_edit.text().replace(",", " ").split()
            new_tuning = [parse_note_name(p) for p in parts]
        except ValueError as exc:
            QMessageBox.warning(self, "TabKit", str(exc))
            return
        if len(new_tuning) != trk["numStrings"]:
            QMessageBox.warning(
                self, "TabKit",
                f"Need {trk['numStrings']} notes, got {len(new_tuning)}")
            return
        self._snapshot()
        trk["name"] = name_edit.text() or trk.get("name")
        if not is_drum:
            trk["instrument"] = inst_combo.currentIndex()
            trk["capo"] = capo_spin.value()
            trk["transpose"] = trans_spin.value()
        trk["tuning"] = new_tuning
        trk["trackVelocity"] = vel_spin.value()
        self._mutated()
        self.status.setText("Track updated")

    def export_midi(self) -> None:
        from .midi_export import export_midi
        path, _ = QFileDialog.getSaveFileName(
            self, "Export MIDI", "song.mid", "MIDI files (*.mid)")
        if not path:
            return
        compiled = compile_song(self.song)
        try:
            export_midi(self.song, compiled, path)
        except Exception as exc:
            QMessageBox.critical(self, "TabKit", f"Export failed:\n{exc}")
            return
        self.status.setText(f"Exported {path}")

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

        if key == Qt.Key_Escape:
            self.view.sel = None
            self.view.update()
            return True

        nav = {Qt.Key_Left: (0, -1), Qt.Key_Right: (0, 1),
               Qt.Key_Up: (-1, 0), Qt.Key_Down: (1, 0)}
        if key in nav:
            ds, db = nav[key]
            self._pending_fret = ""
            shift_sel = bool(mods & Qt.ShiftModifier) and db
            if shift_sel and not self.view.sel:
                self.view.sel = {"track": c["track"],
                                 "start": (c["measure"], c["beat"]),
                                 "end": (c["measure"], c["beat"])}
            elif not shift_sel:
                self.view.sel = None
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
            if shift_sel:
                self.view.sel["end"] = (c["measure"], c["beat"])
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
                from .model import track_channel
                self.backend.set_drum_channel(track_channel(trk, i))
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
        compiled = compile_song(self.song,
                                metronome=self.metro_act.isChecked(),
                                count_in=(self.count_in_act.isChecked()
                                          and self.metro_act.isChecked()),
                                speed=self.speed_box.value() / 100)
        mm = self.view.meas_map

        def time_at(flat: int, after: float = -1.0) -> float | None:
            for t, mi, bi in compiled.tick_times:
                if t > after and mm[mi]["start"] + bi >= flat:
                    return t
            return None

        start, end = 0.0, None
        loop = self.loop_act.isChecked()
        rng = self.view.sel_range()
        c = self.view.cursor
        if loop and rng:
            # loop the selected region (first pass through it)
            (smi, sbi), (emi, ebi) = rng
            start = time_at(mm[smi]["start"] + sbi) or 0.0
            end = time_at(mm[emi]["start"] + ebi + 1, after=start)
        elif from_cursor and c and c["measure"] < len(mm):
            start = time_at(mm[c["measure"]]["start"] + c["beat"]) or 0.0
        self.player.play(compiled, start_time=start, end_time=end, loop=loop)
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
