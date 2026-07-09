"""Core tests: file round-trip, measure map, repeats, and the compiler."""

import zlib

import pytest

from tabkit import tktfile
from tabkit.compiler import compile_song
from tabkit.model import (
    build_measure_map,
    harmonic_midi,
    note_midi,
    playback_order,
    time_sig_beats,
)

STD6 = [40, 45, 50, 55, 59, 64]


def make_note(fret, **kw):
    return {"fret": fret, "attack": True, **kw}


def make_measure(num_strings=6, beats=16, **kw):
    return {"beats": [{"notes": [None] * num_strings} for _ in range(beats)],
            "barLine": "single", "timeSig": {"num": 4, "den": 4}, **kw}


def make_song(measures=2, tempo=120):
    return {
        "title": "Test",
        "tempo": tempo,
        "tracks": [{
            "name": "Guitar",
            "numStrings": 6,
            "tuning": list(STD6),
            "instrument": 25,
            "midiChannel": 0,
            "measures": [make_measure() for _ in range(measures)],
        }],
    }


def test_tkt_round_trip(tmp_path):
    song = make_song()
    song["shareId"] = "abc"  # web-only key must be stripped like the JS does
    path = tmp_path / "song.tkt"
    tktfile.save(song, path)
    data = path.read_bytes()
    assert data[:3] == b"TKT" and data[3] == 1
    loaded = tktfile.load(path)
    assert "shareId" not in loaded
    assert loaded["tracks"][0]["tuning"] == STD6
    assert loaded["_tktVersion"] == 1


def test_tkt_reads_webapp_bytes():
    # Byte-for-byte emulation of the JS saveTKT (pako.deflate == zlib)
    import json
    payload = json.dumps(make_song()).encode()
    data = b"TKT\x01" + zlib.compress(payload)
    song = tktfile.loads_tkt(data)
    assert song["tempo"] == 120


def test_time_sig_beats():
    assert time_sig_beats(4, 4) == 16
    assert time_sig_beats(3, 4) == 12
    assert time_sig_beats(6, 8) == 12
    assert time_sig_beats(7, 8) == 14


def test_note_midi_capo_transpose():
    trk = {"tuning": STD6, "capo": 2, "transpose": -1}
    assert note_midi(trk, 0, 3) == 40 + 3 + 2 - 1
    drum = {"tuning": [35, 38], "isDrum": True}
    assert note_midi(drum, 1, 0) == 38  # drums ignore capo/transpose


def test_harmonic_table():
    trk = {"tuning": STD6}
    assert harmonic_midi(trk, 0, 12) == 52   # octave
    assert harmonic_midi(trk, 0, 7) == 59    # octave + fifth
    assert harmonic_midi(trk, 0, 5) == 64    # two octaves


def test_repeat_expansion():
    song = make_song(measures=4)
    ms = song["tracks"][0]["measures"]
    ms[1]["barLine"] = "repeatStart"
    ms[2]["barLine"] = "repeatEnd"
    ms[2]["repeatCount"] = 3
    order = playback_order(build_measure_map(song))
    assert order == [0, 1, 2, 1, 2, 1, 2, 3]


def test_compile_basic_timing():
    song = make_song(measures=1, tempo=120)  # spb = 0.125s
    beats = song["tracks"][0]["measures"][0]["beats"]
    beats[0]["notes"][0] = make_note(3)   # t = 0
    beats[8]["notes"][0] = make_note(5)   # t = 1.0s
    compiled = compile_song(song)
    ons = [e for e in compiled.events if e.kind == "on"]
    assert len(ons) == 2
    assert ons[0].time == pytest.approx(0.0)
    assert ons[0].a == 43 and ons[0].b == 80  # default track velocity
    assert ons[1].time == pytest.approx(1.0)
    assert ons[1].a == 45
    # second attack on the same string kills the first note
    offs = [e for e in compiled.events if e.kind == "off" and e.a == 43]
    assert offs and offs[0].time == pytest.approx(1.0)


def test_compile_tempo_change():
    song = make_song(measures=2, tempo=120)
    ms = song["tracks"][0]["measures"]
    # tempo doubles at start of measure 2 (effect type 84)
    ms[1]["beats"][0]["trkEffect"] = {"type": 84, "value": 240}
    ms[1]["beats"][0]["notes"][0] = make_note(0)
    ms[1]["beats"][8]["notes"][0] = make_note(2)
    compiled = compile_song(song)
    ons = [e for e in compiled.events if e.kind == "on"]
    # measure 1 lasts 16 * 0.125 = 2.0s; at 240bpm each 16th is 0.0625s
    assert ons[0].time == pytest.approx(2.0)
    assert ons[1].time == pytest.approx(2.0 + 8 * 0.0625)


def test_compile_tuplet():
    song = make_song(measures=1)
    beats = song["tracks"][0]["measures"][0]["beats"]
    # triplet: 3 notes over 2 global 16ths (atrNum/atrGroup = 2/3 each)
    for i in range(3):
        beats[i]["atrGroup"] = 3
        beats[i]["atrNum"] = 2
        beats[i]["notes"][0] = make_note(i)
    compiled = compile_song(song)
    ons = [e for e in compiled.events if e.kind == "on"]
    step = 2 * 0.125 / 3
    assert [round(e.time, 4) for e in ons] == \
        [round(i * step, 4) for i in range(3)]


def test_compile_stop_and_mute_flags():
    song = make_song(measures=1)
    song["tracks"].append({
        "name": "Muted", "numStrings": 6, "tuning": list(STD6),
        "instrument": 25, "midiChannel": 1, "muted": True,
        "measures": [make_measure()],
    })
    b = song["tracks"][0]["measures"][0]["beats"]
    b[0]["notes"][0] = make_note(3)
    b[4]["notes"][0] = {"fret": 0, "attack": True, "stop": True}
    song["tracks"][1]["measures"][0]["beats"][0]["notes"][0] = make_note(9)
    compiled = compile_song(song)
    ons = [e for e in compiled.events if e.kind == "on"]
    assert all(e.channel == 0 for e in ons), "muted track must not sound"
    offs = [e for e in compiled.events if e.kind == "off" and e.a == 43]
    assert offs[0].time == pytest.approx(4 * 0.125)


def test_compile_twelve_string_doubling():
    song = make_song(measures=1)
    song["tracks"][0]["twelveStringMode"] = True
    song["tracks"][0]["measures"][0]["beats"][0]["notes"][0] = make_note(0)
    compiled = compile_song(song)
    ons = [e for e in compiled.events if e.kind == "on"]
    assert {e.a for e in ons} == {40, 52}


def test_midi_export(tmp_path):
    from tabkit.midi_export import export_midi
    song = make_song(measures=1)
    song["tracks"][0]["measures"][0]["beats"][0]["notes"][0] = make_note(3)
    compiled = compile_song(song)
    out = tmp_path / "out.mid"
    export_midi(song, compiled, out)
    import mido
    mid = mido.MidiFile(str(out))
    notes = [m for m in mid if m.type == "note_on"]
    assert notes and notes[0].note == 43


def test_bend_chain_suppresses_target():
    song = make_song(measures=1)
    b = song["tracks"][0]["measures"][0]["beats"]
    b[0]["notes"][0] = {"fret": 5, "attack": True, "effect": 98}  # bend
    b[4]["notes"][0] = make_note(7)  # bend target
    compiled = compile_song(song)
    ons = [e for e in compiled.events if e.kind == "on"]
    assert len(ons) == 1, "chain target must not retrigger"
    bends = [e for e in compiled.events if e.kind == "bend"]
    assert bends[-1].time == pytest.approx(4 * 0.125)
    from tabkit.compiler import bend_value
    assert bends[-1].a == bend_value(2.0)  # arrived +2 semitones


def test_slide_uses_pool_channel_leaving_track_channel_clean():
    song = make_song(measures=1)
    b = song["tracks"][0]["measures"][0]["beats"]
    b[0]["notes"][0] = {"fret": 3, "attack": True, "effect": 92}  # slide up
    b[4]["notes"][0] = make_note(8)   # slide target (suppressed)
    b[8]["notes"][0] = make_note(0)   # plain note afterwards
    compiled = compile_song(song)
    ons = [e for e in compiled.events if e.kind == "on"]
    assert [e.a for e in ons] == [43, 40]
    # the sliding note is routed to a free pool channel; the plain note
    # stays on the track channel, which must never see a bend
    slide_ch, plain_ch = ons[0].channel, ons[1].channel
    assert slide_ch != plain_ch and plain_ch == 0
    bend_channels = {e.channel for e in compiled.events if e.kind == "bend"}
    assert bend_channels == {slide_ch}
    # the pool channel mirrors the track's program before the note starts
    progs = [e for e in compiled.events
             if e.kind == "prog" and e.channel == slide_ch]
    assert progs and progs[0].a == 25


def test_simultaneous_bends_get_independent_channels():
    song = make_song(measures=1)
    b = song["tracks"][0]["measures"][0]["beats"]
    b[0]["notes"][0] = {"fret": 5, "attack": True, "effect": 98}
    b[0]["notes"][1] = {"fret": 7, "attack": True, "effect": 98}
    b[4]["notes"][0] = make_note(7)
    b[4]["notes"][1] = make_note(9)
    compiled = compile_song(song)
    ons = [e for e in compiled.events if e.kind == "on"]
    assert len({e.channel for e in ons}) == 2
    from tabkit.compiler import bend_value
    for ch in {e.channel for e in ons}:
        last = [e for e in compiled.events
                if e.kind == "bend" and e.channel == ch][-1]
        assert last.a == bend_value(2.0)  # each arrives at +2 semitones


def test_hammer_on_reduces_next_velocity():
    song = make_song(measures=1)
    b = song["tracks"][0]["measures"][0]["beats"]
    b[0]["notes"][0] = {"fret": 0, "attack": True, "effect": 104}
    b[2]["notes"][0] = make_note(2)
    compiled = compile_song(song)
    ons = [e for e in compiled.events if e.kind == "on"]
    assert ons[0].b == 80 and ons[1].b == 72  # 90% of 80


def test_vibrato_emits_oscillation():
    song = make_song(measures=1)
    b = song["tracks"][0]["measures"][0]["beats"]
    b[0]["notes"][0] = {"fret": 5, "attack": True, "effect": 126}
    compiled = compile_song(song)
    bends = [e for e in compiled.events if e.kind == "bend"]
    assert len(bends) >= 30  # 6 Hz for 3 s, two edges per cycle
    from tabkit.compiler import bend_value
    vals = {e.a for e in bends}
    assert bend_value(0.35) in vals and bend_value(-0.35) in vals


def test_metronome_and_count_in():
    song = make_song(measures=1)
    song["tracks"][0]["measures"][0]["beats"][0]["notes"][0] = make_note(3)
    c = compile_song(song, metronome=True, count_in=True)
    clicks = [e for e in c.events if e.channel == 9 and e.kind == "on"]
    # 4 count-in clicks + 4 quarter-note clicks in the measure
    assert len(clicks) == 8
    assert clicks[0].a == 76 and clicks[1].a == 77  # accent then plain
    ons = [e for e in c.events if e.kind == "on" and e.channel == 0]
    assert ons[0].time == pytest.approx(2.0)  # after 4 beats at 120 BPM


def test_delay_pedal_taps():
    song = make_song(measures=1)
    song["tracks"][0].update({"delayOn": True, "delayMix": 50,
                              "delayTaps": 3, "delayTime": "8"})
    song["tracks"][0]["measures"][0]["beats"][0]["notes"][0] = make_note(5)
    c = compile_song(song)
    ons = [e for e in c.events if e.kind == "on"]
    # main note + taps at eighth-note spacing, halving velocity, <3 dropped
    assert [(round(e.time, 3), e.b) for e in ons] == \
        [(0.0, 80), (0.25, 40), (0.5, 20), (0.75, 10)]


def test_pitch_shifter_pedal():
    song = make_song(measures=1)
    song["tracks"][0].update({"octOn": True, "octShift": -12,
                              "octDry": 100, "octMix": 50})
    song["tracks"][0]["measures"][0]["beats"][0]["notes"][0] = make_note(0)
    c = compile_song(song)
    ons = [e for e in c.events if e.kind == "on"]
    assert {(e.a, e.b) for e in ons} == {(40, 80), (28, 40)}


def test_practice_speed_scales_times():
    song = make_song(measures=1)
    song["tracks"][0]["measures"][0]["beats"][8]["notes"][0] = make_note(0)
    slow = compile_song(song, speed=0.5)
    on = [e for e in slow.events if e.kind == "on"][0]
    assert on.time == pytest.approx(2.0)  # 1.0s at full speed


def _build_tbt(repeat_count=3):
    """Synthesize a minimal TabIt v'r' file: 1 track, 2 measures,
    fret-3 note at beat 0, repeatEnd on measure 2."""
    import struct
    import zlib
    hdr = bytearray(64)
    hdr[0:3] = b"TBT"
    hdr[3] = 0x72
    hdr[5] = 1
    hdr[34:36] = struct.pack("<H", 140)
    hdr[40:42] = struct.pack("<H", 2)
    b1 = bytearray()
    b1 += struct.pack("<I", 32)          # 32 note positions
    b1 += bytes([6, 25 | 0x80, 96, 100, 0])  # strings, inst, vol, pan, mod
    b1 += struct.pack("<h", 0)           # pitch bend
    b1 += bytes([0, 0, 0, 0, 64, 0, 1, 0, 0, 0])
    b1 += bytes([0] * 8) + bytes([0])    # tuning offsets + pad
    b2 = bytearray()
    b2 += struct.pack("<iBB", 16, 0, 0)
    b2 += struct.pack("<iBB", 16, 4, repeat_count)
    pairs = bytes([1, 131, 255, 0, 255, 0, 129, 0])  # RLE: note then zeros
    b2 += struct.pack("<H", len(pairs) // 2) + pairs
    b2 += struct.pack("<I", 0) + struct.pack("<I", 0)
    c1 = zlib.compress(bytes(b1))
    hdr[48:52] = struct.pack("<I", len(c1))
    return bytes(hdr) + c1 + zlib.compress(bytes(b2))


def test_tbt_loader_full_pipeline():
    from tabkit.model import track_channel
    from tabkit.tbtfile import load_tbt
    song = load_tbt(_build_tbt())
    trk = song["tracks"][0]
    assert song["tempo"] == 140
    assert trk["midiChannel"] == 1 and not trk["letRing"]
    assert trk["tuning"] == STD6
    assert track_channel(trk, 0) == 0  # web channels are 1-based
    m0, m1 = trk["measures"]
    assert m0["beats"][0]["notes"][0] == {"fret": 3, "attack": True, "effect": 0}
    assert m1["barLine"] == "repeatEnd" and m1["repeatCount"] == 3
    compiled = compile_song(song)
    ons = [e for e in compiled.events if e.kind == "on"]
    # implicit repeat start at song beginning: 0,1 plays three times
    assert len(ons) == 3 and all(e.a == 43 and e.channel == 0 for e in ons)
    assert len(compiled.tick_times) == 96


def test_drum_channel_normalization():
    from tabkit.model import track_channel
    assert track_channel({"midiChannel": 10, "isDrum": True}, 3) == 9
    assert track_channel({"midiChannel": 1}, 5) == 0
    assert track_channel({"isDrum": True}, 5) == 9  # auto-assign
    assert track_channel({}, 5) == 5


def test_shift_sections():
    from tabkit.model import shift_sections
    song = make_song(measures=6)
    song["sections"] = [{"bar": 1, "bars": 2, "name": "Verse"},
                        {"bar": 4, "bars": 1, "name": "Chorus"}]
    shift_sections(song, 2, 1)  # insert a bar inside Verse
    assert song["sections"][0] == {"bar": 1, "bars": 3, "name": "Verse"}
    assert song["sections"][1]["bar"] == 5
    shift_sections(song, 0, -1)  # delete the first bar
    assert song["sections"][0]["bar"] == 0
    assert song["sections"][1]["bar"] == 4
