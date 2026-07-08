"""Export a compiled song to a standard MIDI file via mido."""

from __future__ import annotations

from pathlib import Path
from typing import Any

import mido

from .compiler import CompiledSong

PPQ = 480


def export_midi(song: dict[str, Any], compiled: CompiledSong,
                path: str | Path) -> None:
    tempo_bpm = song.get("tempo") or 120
    sec_per_tick = (60.0 / tempo_bpm) / PPQ

    mid = mido.MidiFile(ticks_per_beat=PPQ)
    track = mido.MidiTrack()
    mid.tracks.append(track)
    track.append(mido.MetaMessage("set_tempo",
                                  tempo=mido.bpm2tempo(tempo_bpm), time=0))

    last_tick = 0
    for ev in compiled.events:
        tick = round(ev.time / sec_per_tick)
        delta = max(0, tick - last_tick)
        ch = ev.channel & 0x0F
        if ev.kind == "on":
            msg = mido.Message("note_on", channel=ch, note=ev.a,
                               velocity=ev.b, time=delta)
        elif ev.kind == "off":
            msg = mido.Message("note_off", channel=ch, note=ev.a,
                               velocity=0, time=delta)
        elif ev.kind == "cc":
            msg = mido.Message("control_change", channel=ch, control=ev.a,
                               value=ev.b, time=delta)
        elif ev.kind == "prog":
            msg = mido.Message("program_change", channel=ch, program=ev.a,
                               time=delta)
        elif ev.kind == "bend":
            msg = mido.Message("pitchwheel", channel=ch,
                               pitch=ev.a - 8192, time=delta)
        else:
            continue
        track.append(msg)
        last_tick = tick

    mid.save(str(path))
