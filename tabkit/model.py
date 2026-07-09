"""Song model helpers and constants, ported from legacy-web/TabKit.jsx.

The song itself stays a plain dict (see tktfile) — these are the pure
functions the web app uses to interpret it.
"""

from __future__ import annotations

from typing import Any

# General MIDI program names (TabKit.jsx `GM`)
GM_PROGRAMS = ["Acoustic Grand Piano", "Bright Acoustic Piano", "Electric Grand Piano", "Honky-tonk Piano", "Electric Piano 1", "Electric Piano 2", "Harpsichord", "Clavinet", "Celesta", "Glockenspiel", "Music Box", "Vibraphone", "Marimba", "Xylophone", "Tubular Bells", "Dulcimer", "Drawbar Organ", "Percussive Organ", "Rock Organ", "Church Organ", "Reed Organ", "Accordion", "Harmonica", "Tango Accordion", "Acoustic Guitar (nylon)", "Acoustic Guitar (steel)", "Electric Guitar (jazz)", "Electric Guitar (clean)", "Electric Guitar (muted)", "Overdriven Guitar", "Distortion Guitar", "Guitar Harmonics", "Acoustic Bass", "Electric Bass (finger)", "Electric Bass (pick)", "Fretless Bass", "Slap Bass 1", "Slap Bass 2", "Synth Bass 1", "Synth Bass 2", "Violin", "Viola", "Cello", "Contrabass", "Tremolo Strings", "Pizzicato Strings", "Orchestral Harp", "Timpani", "String Ensemble 1", "String Ensemble 2", "Synth Strings 1", "Synth Strings 2", "Choir Aahs", "Voice Oohs", "Synth Voice", "Orchestra Hit", "Trumpet", "Trombone", "Tuba", "Muted Trumpet", "French Horn", "Brass Section", "Synth Brass 1", "Synth Brass 2", "Soprano Sax", "Alto Sax", "Tenor Sax", "Baritone Sax", "Oboe", "English Horn", "Bassoon", "Clarinet", "Piccolo", "Flute", "Recorder", "Pan Flute", "Blown Bottle", "Shakuhachi", "Whistle", "Ocarina", "Lead 1", "Lead 2", "Lead 3", "Lead 4", "Lead 5", "Lead 6", "Lead 7", "Lead 8", "Pad 1", "Pad 2", "Pad 3", "Pad 4", "Pad 5", "Pad 6", "Pad 7", "Pad 8", "FX 1", "FX 2", "FX 3", "FX 4", "FX 5", "FX 6", "FX 7", "FX 8", "Sitar", "Banjo", "Shamisen", "Koto", "Kalimba", "Bagpipe", "Fiddle", "Shanai", "Tinkle Bell", "Agogo", "Steel Drums", "Woodblock", "Taiko Drum", "Melodic Tom", "Synth Drum", "Reverse Cymbal", "Guitar Fret Noise", "Breath Noise", "Seashore", "Bird Tweet", "Telephone Ring", "Helicopter", "Applause", "Gunshot"]

# Default drum lane labels / MIDI notes (TabKit.jsx `DLBL` / `DMIDI`)
DRUM_LABELS = ["Bass", "Snare", "C.HH", "O.HH", "Stick", "Crash", "Tom1", "Tom2"]
DRUM_MIDI = [35, 38, 42, 46, 37, 49, 48, 45]

# GM hi-hat etc. choke groups (TabKit.jsx line ~10020)
DRUM_CHOKE_GROUPS = [[42, 44, 46], [80, 81], [78, 79], [86, 87]]

DEFAULT_TEMPO = 120
DEFAULT_TRACK_VELOCITY = 80


_NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]


def midi_note_name(midi: int) -> str:
    """60 -> 'C4' (MIDI octave convention: C4 = 60)."""
    return f"{_NOTE_NAMES[midi % 12]}{midi // 12 - 1}"


def parse_note_name(text: str) -> int:
    """'E2' -> 40; also accepts a bare MIDI number."""
    text = text.strip().upper()
    if text.isdigit():
        value = int(text)
    else:
        for i, name in sorted(enumerate(_NOTE_NAMES), key=lambda p: -len(p[1])):
            if text.startswith(name):
                octave = int(text[len(name):])
                value = (octave + 1) * 12 + i
                break
        else:
            raise ValueError(f"Not a note name: {text!r}")
    if not 0 <= value <= 127:
        raise ValueError(f"Note out of MIDI range: {text!r}")
    return value


def time_sig_beats(num: int, den: int) -> int:
    """Time signature -> number of 16th-note positions per measure."""
    return round(num * (16 / den))


def get_time_sig(measure: dict[str, Any] | None) -> dict[str, int]:
    if measure and measure.get("timeSig"):
        return measure["timeSig"]
    return {"num": 4, "den": 4}


def measure_global_beats(measure: dict[str, Any] | None) -> int:
    """Global 16th positions a measure occupies (header value, else time sig)."""
    if measure:
        if measure.get("globalBeatsPerMeasure"):
            return measure["globalBeatsPerMeasure"]
        ts = get_time_sig(measure)
        return time_sig_beats(ts["num"], ts["den"])
    return 16


def build_measure_map(song: dict[str, Any]) -> list[dict[str, Any]]:
    """Flat 16th-note position map across measures.

    Mirrors the web app's measMap: track 0 is authoritative for bar
    structure; entries carry start position, length, and repeat info.
    """
    tracks = song["tracks"]
    max_meas = max(len(t["measures"]) for t in tracks)
    ref_measures = tracks[0]["measures"]
    meas_map = []
    flat = 0
    for mi in range(max_meas):
        ref_m = ref_measures[mi] if mi < len(ref_measures) else None
        beats = measure_global_beats(ref_m)
        bar_line = "single"
        repeat_count = 0
        if ref_m and ref_m.get("barLine") and ref_m["barLine"] != "single":
            bar_line = ref_m["barLine"]
            repeat_count = ref_m.get("repeatCount") or 0
        meas_map.append({"start": flat, "beats": beats, "barLine": bar_line,
                         "repeatCount": repeat_count})
        flat += beats
    return meas_map


def find_repeat_start(meas_map: list[dict[str, Any]], end_mi: int) -> int:
    """Matching open-repeat measure for a repeat close at end_mi."""
    for i in range(end_mi - 1, -1, -1):
        bl = meas_map[i]["barLine"]
        if bl in ("repeatStart", "repeatBoth"):
            return i
        if bl == "repeatEnd":
            return i + 1  # implied open after previous close
    return 0


def playback_order(meas_map: list[dict[str, Any]]) -> list[int]:
    """Expand repeats into the linear sequence of measure indices played."""
    order: list[int] = []
    played: dict[int, int] = {}
    mi = 0
    guard = 0
    while mi < len(meas_map) and guard < 100_000:
        guard += 1
        order.append(mi)
        bl = meas_map[mi]["barLine"]
        if bl in ("repeatEnd", "repeatBoth"):
            count = meas_map[mi]["repeatCount"] or 2
            played[mi] = played.get(mi, 0) + 1
            if played[mi] < count:
                mi = find_repeat_start(meas_map, mi)
                continue
        mi += 1
    return order


def note_midi(track: dict[str, Any], string_idx: int, fret: int) -> int:
    """MIDI pitch for a fretted note (TabKit.jsx line 9984)."""
    tuning = track.get("tuning") or []
    open_note = tuning[string_idx] if string_idx < len(tuning) else None
    if track.get("isDrum"):
        return (open_note or 0) + fret
    return (open_note or 40) + fret + (track.get("capo") or 0) + (track.get("transpose") or 0)


def find_next_note(track: dict[str, Any], mi: int, bi: int, string_idx: int
                   ) -> dict[str, Any] | None:
    """Next sounding note on a string after (mi, bi), in score order.

    Returns fret/midi/mi/bi and the distance in global beats (tuplet
    aware). Port of TabKit.jsx findNextNote (line 9283).
    """
    measures = track["measures"]
    for lm in range(mi, len(measures)):
        start_bi = bi + 1 if lm == mi else 0
        beats = measures[lm].get("beats") or []
        for lb in range(start_bi, len(beats)):
            notes = beats[lb].get("notes") or []
            ln = notes[string_idx] if string_idx < len(notes) else None
            if ln and ln.get("attack") and not ln.get("stop") and not ln.get("muted"):
                dist = 0.0
                for dm in range(mi, lm + 1):
                    d_start = bi if dm == mi else 0
                    d_end = lb if dm == lm else len(measures[dm].get("beats") or [])
                    for db in range(d_start, d_end):
                        wb = (measures[dm].get("beats") or [])[db]
                        if wb and (wb.get("atrGroup") or 0) > 1:
                            dist += (wb.get("atrNum") or 1) / wb["atrGroup"]
                        else:
                            dist += 1
                return {"fret": ln["fret"], "midi": note_midi(track, string_idx, ln["fret"]),
                        "beats": dist, "mi": lm, "bi": lb}
    return None


def harmonic_midi(track: dict[str, Any], string_idx: int, fret: int) -> int:
    """Natural harmonic pitch table (TabKit.jsx effect 60)."""
    tuning = track.get("tuning") or []
    open_midi = (tuning[string_idx] if string_idx < len(tuning) else 40) \
        + (track.get("capo") or 0) + (track.get("transpose") or 0)
    if fret == 12:
        return open_midi + 12
    if fret in (7, 19):
        return open_midi + 19
    if fret in (5, 24):
        return open_midi + 24
    if fret in (4, 9, 16):
        return open_midi + 28
    if fret == 3:
        return open_midi + 31
    return open_midi + 12 + fret
