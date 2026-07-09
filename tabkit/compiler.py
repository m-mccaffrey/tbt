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
    find_next_note,
    get_time_sig,
    harmonic_midi,
    note_midi,
    playback_order,
    track_channel,
)

# trkEffect type codes -> MIDI CC numbers (TabKit.jsx applyFx)
_CC_EFFECTS = {86: 7, 80: 10, 77: 1, 69: 11, 82: 91, 67: 93}

# note.effect codes
FX_HARMONIC = 60
FX_PALM_MUTE = 109
FX_BEND = 98
FX_SLIDE_DOWN = 47
FX_SLIDE_UP = 92
FX_RELEASE = 114
FX_VIBRATO = 126
FX_HAMMER = 104
FX_PULL_OFF = 112
_CHAIN_FX = (FX_BEND, FX_SLIDE_DOWN, FX_SLIDE_UP)

# Pitch bends are emitted as 14-bit values against a widened bend range,
# set via RPN 0,0 on every used channel at t=0.
BEND_RANGE_SEMITONES = 12
BEND_CENTER = 8192
# Ramps are rendered as stepped bend events at this interval
BEND_STEP_SEC = 0.015
# Vibrato: ±35 cents square oscillation at 6 Hz for 3 s (synthVibratoNote)
VIB_CENTS = 35
VIB_RATE_HZ = 6.0
VIB_DURATION = 3.0

# Metronome clicks: GM wood blocks on the percussion channel
CLICK_CHANNEL = 9
CLICK_HI = 76   # accented downbeat
CLICK_LO = 77
CLICK_TRACK = -2  # marker so live mute/solo never drops clicks


def get_delay_seconds(delay_time: str, tempo: float) -> float:
    """Echo tap interval (TabKit.jsx getDelayMs)."""
    beat = 60.0 / (tempo or 120)
    return {"4": beat, "8": beat / 2, "8d": beat * 0.75,
            "16": beat / 4, "slap": 0.08}.get(delay_time, beat * 0.75)


def tremolo_hz(speed: str, tempo: float) -> float:
    bpm = tempo or 120
    return {"4": bpm / 60, "8": bpm / 30, "8t": bpm / 20}.get(speed, bpm / 15)


def bend_value(semitones: float) -> int:
    raw = round(BEND_CENTER + semitones / BEND_RANGE_SEMITONES * 8192)
    return max(0, min(16383, raw))


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
        self.volume = track.get("volume")
        self.pan = track.get("pan")
        # sounding notes per string: string -> list of (channel, pitch)
        # voices (main + doubled/shimmer copies); ring flag per string
        self.active: dict[int, list[tuple[int, int]]] = {}
        self.ring: set[int] = set()
        # bend/technique state (mirrors bendState/suppressNext/hammerNext)
        self.bend: dict[int, float] = {}      # semitone offset per string
        self.suppress: dict[int, int] = {}    # skip N chained attacks
        self.hammer: set[int] = set()         # next attack at 90% velocity
        # pedal effect state, seeded from the track, updated by fx 201-205
        self.pedal = {
            "delayOn": bool(track.get("delayOn")),
            "delayTime": track.get("delayTime") or "8d",
            "delayTaps": track.get("delayTaps") or 3,
            "delayMix": track.get("delayMix") or 50,
            "octOn": bool(track.get("octOn")),
            "octShift": track.get("octShift") or -12,
            "octDry": track.get("octDry") if track.get("octDry") is not None else 100,
            "octMix": track.get("octMix") or 50,
            "tremOn": bool(track.get("tremOn")),
            "tremSpeed": track.get("tremSpeed") or "8",
            "tremDepth": track.get("tremDepth") or 70,
            "adt": track.get("adt") or 0,
        }


def compile_song(song: dict[str, Any], solo_track: int | None = None,
                 tail: float = 1.5, metronome: bool = False,
                 count_in: bool = False, speed: float = 1.0) -> CompiledSong:
    """Flatten a song dict into a CompiledSong.

    solo_track limits compilation to one track (the web app's
    single-track play mode). Static mute/solo flags on tracks are
    honored here; live toggling during playback is the engine's job.
    speed scales the whole song's tempo (practice mode).
    """
    tracks = song["tracks"]
    meas_map = build_measure_map(song)
    order = playback_order(meas_map)
    tempo = (song.get("tempo") or DEFAULT_TEMPO) * speed
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

    # Bend channel pool: MIDI pitch bend is per-channel, so notes that
    # will bend are routed round-robin through channels no track claims.
    # Simultaneous bends on different strings then get their own wheels.
    _claimed = {track_channel(t, i) for i, t in enumerate(tracks)}
    _claimed.add(CLICK_CHANNEL)
    bend_pool = [c for c in range(16) if c not in _claimed]
    _pool_state = {"idx": 0, "ready": set()}

    def alloc_bend_channel(ti: int, time: float) -> int | None:
        if not bend_pool:
            return None
        ch = bend_pool[_pool_state["idx"] % len(bend_pool)]
        _pool_state["idx"] += 1
        st = states[ti]
        if ch not in _pool_state["ready"]:
            _pool_state["ready"].add(ch)
            for cc, val in ((101, 0), (100, 0), (6, BEND_RANGE_SEMITONES),
                            (38, 0)):
                emit(0.0, "cc", ch, cc, val, track=ti)
        # mirror the track's current sound onto the pool channel
        emit(time, "prog", ch, st.instrument, st.bank, track=ti)
        if st.volume is not None:
            emit(time, "cc", ch, 7, max(0, min(127, st.volume)), track=ti)
        if st.pan is not None:
            emit(time, "cc", ch, 10, max(0, min(127, st.pan)), track=ti)
        emit_bend(time, ch, 0.0, ti, force=True)
        return ch

    # Last pitch-bend value emitted per channel (bends are per-channel in
    # MIDI, per-voice in the web synth — see note on emit_bend below)
    chan_bend: dict[int, int] = {}

    def emit_bend(time: float, ch: int, semitones: float, ti: int,
                  force: bool = False) -> None:
        val = bend_value(semitones)
        if force or chan_bend.get(ch, BEND_CENTER) != val:
            chan_bend[ch] = val
            emit(time, "bend", ch, val, track=ti)

    def emit_ramp(t0: float, semi0: float, t1: float, semi1: float,
                  ch: int, ti: int) -> None:
        """Linear pitch ramp as stepped bend events (synthChainRamp)."""
        span = max(t1 - t0, 0.05)
        steps = max(2, min(200, int(span / BEND_STEP_SEC)))
        for i in range(1, steps + 1):
            frac = i / steps
            emit_bend(t0 + span * frac, ch, semi0 + (semi1 - semi0) * frac, ti)

    def emit_vibrato(t0: float, center_semi: float, ch: int, ti: int) -> None:
        """±35-cent square oscillation at 6 Hz (synthVibratoNote)."""
        cycles = round(VIB_DURATION * VIB_RATE_HZ)
        offset = VIB_CENTS / 100.0
        for vi in range(cycles):
            emit_bend(t0 + vi / VIB_RATE_HZ, ch, center_semi + offset, ti)
            emit_bend(t0 + vi / VIB_RATE_HZ + 0.5 / VIB_RATE_HZ, ch,
                      center_semi - offset, ti)
        emit_bend(t0 + cycles / VIB_RATE_HZ, ch, center_semi, ti)

    # Initial channel setup
    for ti in play_tracks:
        trk = tracks[ti]
        st = states[ti]
        ch = track_channel(trk, ti)
        emit(0.0, "prog", ch, st.instrument, st.bank, track=ti)
        if not trk.get("isDrum"):
            # RPN 0,0: widen pitch-bend range so bends/slides fit
            emit(0.0, "cc", ch, 101, 0, track=ti)
            emit(0.0, "cc", ch, 100, 0, track=ti)
            emit(0.0, "cc", ch, 6, BEND_RANGE_SEMITONES, track=ti)
            emit(0.0, "cc", ch, 38, 0, track=ti)
        if trk.get("volume") is not None:
            emit(0.0, "cc", ch, 7, max(0, min(127, trk["volume"])), track=ti)
        if trk.get("pan") is not None:
            emit(0.0, "cc", ch, 10, max(0, min(127, trk["pan"])), track=ti)

    def kill_string(ti: int, ch: int, si: int, time: float) -> None:
        st = states[ti]
        for v_ch, v_midi in st.active.pop(si, []):
            emit(time, "off", v_ch, v_midi, track=ti)
        st.ring.discard(si)

    def click(time: float, accent: bool) -> None:
        note = CLICK_HI if accent else CLICK_LO
        emit(time, "on", CLICK_CHANNEL, note, 110 if accent else 85,
             track=CLICK_TRACK)
        emit(time + 0.05, "off", CLICK_CHANNEL, note, track=CLICK_TRACK)

    t = 0.0
    if count_in and order:
        # One measure of clicks at the first measure's time signature
        # (TabKit.jsx 9387-9398)
        ci_ts = get_time_sig(tracks[0]["measures"][order[0]]
                             if order[0] < len(tracks[0]["measures"]) else None)
        c_spb = 60.0 / (song.get("tempo") or DEFAULT_TEMPO) * (4 / (ci_ts.get("den") or 4))
        for ci in range(ci_ts.get("num") or 4):
            click(ci * c_spb, ci == 0)
        t = (ci_ts.get("num") or 4) * c_spb

    for mi in order:
        info = meas_map[mi]
        m_ts = get_time_sig(tracks[0]["measures"][mi]
                            if mi < len(tracks[0]["measures"]) else None)
        click_interval = max(1, round(16 / (m_ts.get("den") or 4)))
        for bi in range(info["beats"]):
            out.tick_times.append((round(t, 6), mi, bi))
            if metronome and bi % click_interval == 0:
                click(t, bi == 0)
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
                ch = track_channel(trk, ti)
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
                                if ft == 86:
                                    st.volume = fv
                                elif ft == 80:
                                    st.pan = fv
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
                            elif ft == 201:
                                for k in ("delayOn", "delayTime", "delayTaps",
                                          "delayMix"):
                                    if fx.get(k) is not None:
                                        st.pedal[k] = fx[k]
                            elif ft == 202:
                                for k in ("octOn", "octShift", "octDry",
                                          "octMix"):
                                    if fx.get(k) is not None:
                                        st.pedal[k] = fx[k]
                            elif ft == 204:
                                for k in ("tremOn", "tremSpeed", "tremDepth"):
                                    if fx.get(k) is not None:
                                        st.pedal[k] = fx[k]
                            elif ft == 205:
                                st.pedal["adt"] = fv
                            # 84 handled in sync pass

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

                    def will_bend(si: int, n: dict) -> bool:
                        """True if this attack will emit pitch bends —
                        by its own effect, or a later technique-only
                        marker before the next attack on the string."""
                        fx = n.get("effect")
                        if fx in _CHAIN_FX or fx == FX_VIBRATO:
                            return True
                        if fx == FX_RELEASE and st.bend.get(si):
                            return True
                        s_mi, s_bi = mi, wi
                        while True:
                            s_bi += 1
                            if s_bi >= len(trk["measures"][s_mi]["beats"]):
                                s_mi, s_bi = s_mi + 1, 0
                                if s_mi >= len(trk["measures"]):
                                    return False
                            nn = (trk["measures"][s_mi]["beats"][s_bi]
                                  .get("notes") or [None] * 16)
                            nn = nn[si] if si < len(nn) else None
                            if not nn:
                                continue
                            if nn.get("attack"):
                                return False
                            if nn.get("techniqueOnly") or nn.get("vibratoOnly"):
                                return True

                    def run_chain(note_ch: int, si: int, source_midi: int,
                                  from_mi: int, from_bi: int,
                                  start_time: float, start_semi: float,
                                  is_bend: bool) -> None:
                        """Bend/slide chain scan (TabKit.jsx 10064-10105):
                        ramp through successive notes on the string,
                        suppressing their attacks."""
                        chain_time = start_time
                        chain_semi = start_semi
                        c_mi, c_bi = from_mi, from_bi
                        for _ in range(20):
                            nxt = find_next_note(trk, c_mi, c_bi, si)
                            if nxt is None:
                                break
                            ramp_semi = nxt["midi"] - source_midi
                            prev_time = chain_time
                            chain_time += nxt["beats"] * spb
                            emit_ramp(prev_time, chain_semi, chain_time,
                                      ramp_semi, note_ch, ti)
                            chain_semi = ramp_semi
                            st.bend[si] = ramp_semi
                            st.suppress[si] = st.suppress.get(si, 0) + 1
                            c_mi, c_bi = nxt["mi"], nxt["bi"]
                            c_notes = (trk["measures"][c_mi]["beats"][c_bi]
                                       .get("notes") or [])
                            c_n = c_notes[si] if si < len(c_notes) else None
                            if not c_n:
                                break
                            if is_bend and c_n.get("effect") == FX_VIBRATO:
                                emit_vibrato(chain_time, ramp_semi, note_ch, ti)
                            if c_n.get("effect") in (FX_RELEASE, *_CHAIN_FX):
                                continue
                            if c_n.get("bendHold"):
                                st.suppress[si] = 0
                            break

                    for si, n in enumerate(notes):
                        if not n:
                            continue
                        if not n.get("attack"):
                            # Technique-only markers act on the ringing note
                            # (TabKit.jsx 9872-9944)
                            if (not (n.get("techniqueOnly") or n.get("vibratoOnly"))
                                    or si not in st.active or is_drum):
                                continue
                            a_ch, active_midi = st.active[si][0]
                            fx = n.get("effect")
                            if fx == FX_VIBRATO and not st.suppress.get(si, 0):
                                emit_vibrato(bt, st.bend.get(si, 0.0), a_ch, ti)
                            elif fx in _CHAIN_FX:
                                run_chain(a_ch, si, active_midi, mi, wi, bt,
                                          st.bend.get(si, 0.0), fx == FX_BEND)
                            elif fx == FX_RELEASE and st.bend.get(si):
                                nxt = find_next_note(trk, mi, wi, si)
                                if nxt:
                                    emit_ramp(bt, st.bend[si],
                                              bt + nxt["beats"] * spb,
                                              nxt["midi"] - active_midi, a_ch, ti)
                                    st.suppress[si] = st.suppress.get(si, 0) + 1
                                st.bend[si] = 0.0
                            continue
                        if n.get("stop"):
                            kill_string(ti, ch, si, bt)
                            continue
                        # Suppressed: this attack is a bend/slide chain target;
                        # the source's pitch ramp already covers it
                        if st.suppress.get(si, 0) > 0 and not n.get("bendHold"):
                            if n.get("ring"):
                                st.ring.add(si)
                            st.suppress[si] -= 1
                            continue
                        st.suppress[si] = 0
                        vel = n.get("vel", st.track_velocity)
                        if si in st.hammer:
                            vel = round(vel * 0.9)
                            st.hammer.discard(si)
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
                        harm_vel = round(vel * 0.5) if is_harm else vel
                        dry = (st.pedal["octDry"] / 100
                               if st.pedal["octOn"] and not is_drum else 1.0)
                        play_vel = max(0, round(harm_vel * dry))
                        pm_dur = beat_dur * 0.3 if n.get("effect") == FX_PALM_MUTE else 0.0

                        # Notes that will bend get a channel from the pool
                        # so simultaneous bends have independent wheels
                        note_ch = ch
                        if not is_drum and will_bend(si, n):
                            pool_ch = alloc_bend_channel(ti, bt)
                            if pool_ch is not None:
                                note_ch = pool_ch
                        # recenter before a fresh attack on a bent channel
                        if not is_drum and note_ch == ch and ch in chan_bend:
                            emit_bend(bt, ch, 0.0, ti, force=True)

                        sounding = []
                        if play_vel > 0:
                            sounding.append((note_ch, midi))
                            emit(bt, "on", note_ch, midi, min(127, play_vel),
                                 ti, mi, bi)
                            if pm_dur and not is_drum:
                                emit(bt + pm_dur, "off", note_ch, midi, track=ti)
                                sounding.remove((note_ch, midi))
                        if is_harm:
                            shim = min(127, midi + 12)
                            emit(bt, "on", note_ch, shim, round(vel * 0.5),
                                 ti, mi, bi)
                            sounding.append((note_ch, shim))
                        if trk.get("twelveStringMode") and not is_drum:
                            oct12 = 12 if si < trk["numStrings"] - 2 else 0
                            dbl = min(127, midi + oct12)
                            emit(bt, "on", note_ch, dbl, round(play_vel * 0.9),
                                 ti, mi, bi)
                            if pm_dur:
                                emit(bt + pm_dur, "off", note_ch, dbl, track=ti)
                            else:
                                sounding.append((note_ch, dbl))

                        # Pedal effects (TabKit.jsx 10001-10052)
                        if not is_drum and play_vel > 0:
                            ped = st.pedal
                            if ped["adt"]:
                                # double-tracked copy, 8-43 ms behind
                                adt_dl = (8 + round(ped["adt"] * 0.35)) / 1000
                                adt_vol = round(play_vel *
                                                (0.6 + ped["adt"] / 200))
                                emit(bt + adt_dl, "on", note_ch, midi,
                                     max(1, min(127, adt_vol)), ti, mi, bi)
                            if ped["octOn"]:
                                ps_note = max(0, min(127, midi + (ped["octShift"] or -12)))
                                ps_vel = round(harm_vel * ped["octMix"] / 100)
                                if ps_vel > 0:
                                    emit(bt, "on", note_ch, ps_note,
                                         min(127, ps_vel), ti, mi, bi)
                                    sounding.append((note_ch, ps_note))
                            if ped["delayOn"]:
                                # echo taps decaying by mix% each repeat
                                tap_dt = get_delay_seconds(
                                    ped["delayTime"], song.get("tempo") or 120)
                                decay = ped["delayMix"] / 100
                                for tap in range(1, (ped["delayTaps"] or 3) + 1):
                                    tv = harm_vel * decay ** tap
                                    if tv < 3:
                                        break
                                    tt = bt + tap_dt * tap
                                    emit(tt, "on", note_ch, midi, round(tv),
                                         ti, mi, bi)
                                    emit(tt + tap_dt * 0.9, "off", note_ch,
                                         midi, track=ti)
                            if ped["tremOn"]:
                                # expression LFO for 3 s (scheduleTremolo)
                                hz = tremolo_hz(ped["tremSpeed"],
                                                song.get("tempo") or 120)
                                lo = round(127 * (1 - ped["tremDepth"] / 100))
                                half = 1 / hz / 2
                                i = 0
                                while i * half <= 3.0:
                                    emit(bt + i * half, "cc", ch, 11,
                                         lo if i % 2 == 0 else 127, track=ti)
                                    i += 1
                                emit(bt + i * half, "cc", ch, 11, 127, track=ti)

                        # Drum choke groups (hi-hat etc.)
                        if is_drum:
                            for group in DRUM_CHOKE_GROUPS:
                                if midi in group:
                                    for csi, voices in list(st.active.items()):
                                        if csi != si and any(p in group
                                                             for _, p in voices):
                                            kill_string(ti, ch, csi, bt)

                        st.active[si] = sounding
                        if n.get("ring"):
                            st.ring.add(si)
                        else:
                            st.ring.discard(si)

                        # Pre-bend state, set before technique processing
                        # (TabKit.jsx 10056-10059)
                        if not is_drum and n.get("preBend") is not None:
                            pb_from = note_midi(trk, si, n["preBend"])
                            st.bend[si] = midi - pb_from

                        # Technique playback (TabKit.jsx 10060-10131)
                        fx = n.get("effect")
                        if not is_drum and fx:
                            if fx == FX_VIBRATO:
                                emit_vibrato(bt, st.bend.get(si, 0.0),
                                             note_ch, ti)
                            if fx in _CHAIN_FX:
                                run_chain(note_ch, si, midi, mi, wi, bt, 0.0,
                                          fx == FX_BEND)
                            if fx == FX_RELEASE and st.bend.get(si):
                                nxt = find_next_note(trk, mi, wi, si)
                                if nxt:
                                    emit_ramp(bt, 0.0, bt + nxt["beats"] * spb,
                                              nxt["midi"] - midi, note_ch, ti)
                                    st.suppress[si] = st.suppress.get(si, 0) + 1
                                st.bend[si] = 0.0
                            if fx in (FX_HAMMER, FX_PULL_OFF):
                                st.hammer.add(si)
                        # Clear stale bend state on plain notes
                        if (not n.get("bendHold") and fx not in
                                (FX_BEND, FX_RELEASE, FX_SLIDE_DOWN, FX_SLIDE_UP)
                                and n.get("preBend") is None):
                            st.bend.pop(si, None)

            t += spb

    # Release everything at the end
    for ti in play_tracks:
        trk = tracks[ti]
        ch = track_channel(trk, ti)
        for si in list(states[ti].active):
            kill_string(ti, ch, si, t)

    out.events.sort(key=lambda e: e.time)
    out.duration = t + tail
    return out
