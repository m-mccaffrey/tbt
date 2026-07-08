"""Compile a song into an absolute-time MIDI event list.

Port of the web app's real-time playback loop (legacy-web/TabKit.jsx
~9400-10100), restructured as a pure offline pass: the whole song —
repeats, tuplets, tempo changes, track effects — is flattened into
events with exact timestamps in seconds. Playback backends then only
have to fire pre-computed events, which is what makes timing tight.

One global beat is a 16th note; spb (seconds per beat) = 60 / tempo / 4.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from .model import (
    DEFAULT_TEMPO,
    DEFAULT_TRACK_VELOCITY,
    DRUM_CHOKE_GROUPS,
    build_measure_map,
    harmonic_midi,
    note_midi,
    playback_order,
)

# trkEffect type codes -> MIDI CC numbers (TabKit.jsx applyFx)
_CC_EFFECTS = {86: 7, 80: 10, 77: 1, 69: 11, 82: 91, 67: 93}

# note.effect codes
FX_HARMONIC = 60
FX_PALM_MUTE = 109


@dataclass(frozen=True)
class Event:
    """A single timed MIDI event. kind: on/off/cc/prog/bend/tempo."""
    time: float
    kind: str
    channel: int
    a: int = 0        # note / cc number / program / bend value
    b: int = 0        # velocity / cc value / bank
    track: int = -1   # originating track index (for mute/solo at play time)
    measure: int = -1  # source position (drives the UI playhead)
    beat: int = -1


@dataclass
class CompiledSong:
    events: list[Event] = field(default_factory=list)
    duration: float = 0.0        # last event time + release tail
    tick_times: list[tuple[float, int, int]] = field(default_factory=list)
    # (time, measure, global beat) for every 16th played, for playhead UI


def _match_positions(measure: dict[str, Any], global_bi: int, spb: float
                     ) -> list[tuple[int, float]]:
    """Track beat indices that fall inside one global 16th.

    Tuplets (atrGroup/atrNum) make a track beat cost a fraction of a
    global beat; returns (beat index, sub-beat delay in seconds).
    Mirrors TabKit.jsx lines 9756-9773.
    """
    g_accum = 0.0
    matches: list[tuple[int, float]] = []
    beats = measure.get("beats") or []
    for wi, wb in enumerate(beats):
        g_cost = 1.0
        if wb and (wb.get("atrGroup") or 0) > 1:
            g_cost = (wb.get("atrNum") or 1) / wb["atrGroup"]
        if global_bi <= g_accum < global_bi + 1:
            matches.append((wi, (g_accum - global_bi) * spb))
        g_accum += g_cost
        if g_accum >= global_bi + 1.001:
            break
    if not matches and global_bi < len(beats):
        matches.append((global_bi, 0.0))
    return matches


class _TrackState:
    """Mutable per-track playback state (mirrors the JS closure vars)."""

    def __init__(self, track: dict[str, Any]):
        self.instrument = track.get("instrument") or 0
        self.bank = track.get("bank") or 0
        self.let_ring = bool(track.get("letRing"))
        self.track_velocity = track.get("trackVelocity") or DEFAULT_TRACK_VELOCITY
        # sounding notes per string: string -> list of MIDI pitches (main +
        # doubled/shimmer voices); ring flag per string
        self.active: dict[int, list[int]] = {}
        self.ring: set[int] = set()


def compile_song(song: dict[str, Any], solo_track: int | None = None,
                 tail: float = 1.5) -> CompiledSong:
    """Flatten a song dict into a CompiledSong.

    solo_track limits compilation to one track (the web app's
    single-track play mode). Static mute/solo flags on tracks are
    honored here; live toggling during playback is the engine's job.
    """
    tracks = song["tracks"]
    meas_map = build_measure_map(song)
    order = playback_order(meas_map)
    tempo = song.get("tempo") or DEFAULT_TEMPO
    spb = 60.0 / tempo / 4.0

    out = CompiledSong()
    seq = 0

    def emit(time: float, kind: str, ch: int, a: int = 0, b: int = 0,
             track: int = -1, measure: int = -1, beat: int = -1) -> None:
        nonlocal seq
        out.events.append(Event(round(time, 6), kind, ch, a, b, track, measure, beat))
        seq += 1

    play_tracks = (range(len(tracks)) if solo_track is None else [solo_track])
    any_solo = any(t.get("solo") for t in tracks)
    states = {ti: _TrackState(tracks[ti]) for ti in play_tracks}

    # Initial channel setup
    for ti in play_tracks:
        trk = tracks[ti]
        st = states[ti]
        ch = trk.get("midiChannel", ti)
        emit(0.0, "prog", ch, st.instrument, st.bank, track=ti)
        if trk.get("volume") is not None:
            emit(0.0, "cc", ch, 7, max(0, min(127, trk["volume"])), track=ti)
        if trk.get("pan") is not None:
            emit(0.0, "cc", ch, 10, max(0, min(127, trk["pan"])), track=ti)

    def kill_string(ti: int, ch: int, si: int, time: float) -> None:
        st = states[ti]
        for midi in st.active.pop(si, []):
            emit(time, "off", ch, midi, track=ti)
        st.ring.discard(si)

    t = 0.0
    for mi in order:
        info = meas_map[mi]
        for bi in range(info["beats"]):
            out.tick_times.append((round(t, 6), mi, bi))
            beat_dur = spb

            # Sync pass: tempo changes apply to scheduling math first
            # (TabKit.jsx lines 9775-9787)
            for ti in play_tracks:
                trk = tracks[ti]
                if mi >= len(trk["measures"]):
                    continue
                for wi, _delay in _match_positions(trk["measures"][mi], bi, spb):
                    fx_root = (trk["measures"][mi]["beats"][wi] or {}).get("trkEffect")
                    if not fx_root:
                        continue
                    for fx in [fx_root] + (fx_root.get("multi") or []):
                        if fx.get("type") == 84 and 30 <= fx.get("value", 0) <= 500:
                            spb = 60.0 / fx["value"] / 4.0

            for ti in play_tracks:
                trk = tracks[ti]
                st = states[ti]
                if trk.get("muted") or (any_solo and not trk.get("solo")):
                    continue
                if mi >= len(trk["measures"]):
                    continue
                measure = trk["measures"][mi]
                ch = trk.get("midiChannel", ti)
                is_drum = bool(trk.get("isDrum"))
                matches = _match_positions(measure, bi, spb)

                # First match position containing attacks (for mass-kill)
                first_attack_wi = None
                for wi, _d in matches:
                    beat = measure["beats"][wi] if wi < len(measure["beats"]) else None
                    if beat and any(n and n.get("attack") for n in beat["notes"]):
                        first_attack_wi = wi
                        break

                for wi, delay in matches:
                    if wi >= len(measure["beats"]):
                        continue
                    beat = measure["beats"][wi]
                    if not beat:
                        continue
                    bt = t + delay

                    # Track effects (volume/pan/program/tempo/velocity/…)
                    fx_root = beat.get("trkEffect")
                    if fx_root:
                        for fx in [fx_root] + (fx_root.get("multi") or []):
                            ft, fv = fx.get("type"), fx.get("value", 0)
                            if ft in _CC_EFFECTS:
                                emit(bt, "cc", ch, _CC_EFFECTS[ft],
                                     max(0, min(127, fv)), track=ti)
                            elif ft == 73:
                                st.instrument = fv & 0x7F
                                emit(bt, "prog", ch, st.instrument, st.bank, track=ti)
                                if fx.get("letRing") is not None:
                                    was = st.let_ring
                                    st.let_ring = bool(fx["letRing"])
                                    if was and not st.let_ring and not is_drum:
                                        for ks in range(trk["numStrings"]):
                                            kill_string(ti, ch, ks, bt)
                            elif ft == 66:
                                emit(bt, "bend", ch, fx.get("raw16") or 0, track=ti)
                            elif ft == 200:
                                st.track_velocity = fv
                            # 84 handled in sync pass; pedal fx (201/202/
                            # 204/205) are synth-side effects — Phase 2

                    notes = beat.get("notes") or []
                    has_attack = any(n and n.get("attack") and not n.get("stop")
                                     for n in notes)
                    has_stop = any(n and n.get("attack") and n.get("stop")
                                   for n in notes)

                    # Mass-kill: a strum silences non-ringing strings that
                    # aren't re-attacked (TabKit.jsx lines 9860-9868)
                    if (wi == first_attack_wi and not st.let_ring and not is_drum
                            and (has_attack or has_stop)):
                        for ks in range(trk["numStrings"]):
                            n = notes[ks] if ks < len(notes) else None
                            if (not n or not n.get("attack")) and ks not in st.ring:
                                kill_string(ti, ch, ks, bt)

                    for si, n in enumerate(notes):
                        if not n or not n.get("attack"):
                            continue
                        if n.get("stop"):
                            kill_string(ti, ch, si, bt)
                            continue
                        vel = n.get("vel", st.track_velocity)
                        if n.get("muted"):
                            kill_string(ti, ch, si, bt)
                            mut_vel = round(vel * 0.4)
                            # muted chug plays the open-string pitch
                            midi = note_midi(trk, si, 0)
                            emit(bt, "on", ch, midi, mut_vel, ti, mi, bi)
                            emit(bt + beat_dur * 0.2, "off", ch, midi, track=ti)
                            if trk.get("twelveStringMode") and not is_drum:
                                oct12 = 12 if si < trk["numStrings"] - 2 else 0
                                emit(bt, "on", ch, midi + oct12,
                                     round(mut_vel * 0.75), ti, mi, bi)
                                emit(bt + beat_dur * 0.2, "off", ch, midi + oct12,
                                     track=ti)
                            continue

                        kill_string(ti, ch, si, bt)
                        is_harm = n.get("effect") == FX_HARMONIC and not is_drum
                        midi = (harmonic_midi(trk, si, n["fret"]) if is_harm
                                else note_midi(trk, si, n["fret"]))
                        midi = max(0, min(127, midi))
                        play_vel = round(vel * 0.5) if is_harm else vel
                        pm_dur = beat_dur * 0.3 if n.get("effect") == FX_PALM_MUTE else 0.0

                        sounding = [midi]
                        emit(bt, "on", ch, midi, max(1, min(127, play_vel)),
                             ti, mi, bi)
                        if pm_dur and not is_drum:
                            emit(bt + pm_dur, "off", ch, midi, track=ti)
                            sounding = []
                        if is_harm:
                            shim = min(127, midi + 12)
                            emit(bt, "on", ch, shim, round(vel * 0.5), ti, mi, bi)
                            sounding.append(shim)
                        if trk.get("twelveStringMode") and not is_drum:
                            oct12 = 12 if si < trk["numStrings"] - 2 else 0
                            dbl = min(127, midi + oct12)
                            emit(bt, "on", ch, dbl, round(play_vel * 0.9),
                                 ti, mi, bi)
                            if pm_dur:
                                emit(bt + pm_dur, "off", ch, dbl, track=ti)
                            else:
                                sounding.append(dbl)

                        # Drum choke groups (hi-hat etc.)
                        if is_drum:
                            for group in DRUM_CHOKE_GROUPS:
                                if midi in group:
                                    for csi, pitches in list(st.active.items()):
                                        if csi != si and any(p in group for p in pitches):
                                            kill_string(ti, ch, csi, bt)

                        st.active[si] = sounding
                        if n.get("ring"):
                            st.ring.add(si)
                        else:
                            st.ring.discard(si)

            t += spb

    # Release everything at the end
    for ti in play_tracks:
        trk = tracks[ti]
        ch = trk.get("midiChannel", ti)
        for si in list(states[ti].active):
            kill_string(ti, ch, si, t)

    out.events.sort(key=lambda e: e.time)
    out.duration = t + tail
    return out
