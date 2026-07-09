"""TabIt (.tbt) binary format loader.

Port of legacy-web/TabKit.jsx loadTBT (line 1389): a 64-byte header
followed by two zlib streams — track metadata, then RLE-compressed
measure/note/effect data. Supports format versions 'e' (0x65) through
'r' (0x72). Read-only: TabKit saves natively as .tkt.
"""

from __future__ import annotations

import zlib
from typing import Any

BPM = 16  # 16th-note positions per default 4/4 measure
STD6 = [40, 45, 50, 55, 59, 64]
DRUM_MIDI = [35, 38, 42, 46, 37, 49, 48, 45]
DRUM_LABELS = ["Bass", "Snare", "C.HH", "O.HH", "Stick", "Crash", "Tom1", "Tom2"]

# Note effect characters: h p / \ ^ b r ~ t s ( < { w m
EFX_CHARS = "hp/\\^br~ts(<{wm"

# Track-effect stream type index -> ASCII effect code (? D U T I V P C R M B)
ETYPE_MAP = {0: 63, 1: 68, 2: 85, 3: 84, 4: 73, 5: 86, 6: 80, 7: 67,
             8: 82, 9: 77, 10: 66}


def is_tbt(data: bytes) -> bool:
    return len(data) >= 64 and data[:3] == b"TBT"


def normalize_efx(b: int) -> int:
    """Effect byte -> ASCII effect code (TabKit.jsx normalizeEfx)."""
    if b == 0:
        return 0
    if chr(b) in EFX_CHARS:
        return b
    if b >= 0x80 and (b - 0x80) < len(EFX_CHARS):
        return ord(EFX_CHARS[b - 0x80])
    if b < len(EFX_CHARS):
        return ord(EFX_CHARS[b])
    return b


def dec_rle(s: bytes, p: int, need: int) -> tuple[bytearray, int]:
    """TabIt run-length decoding (TabKit.jsx decRLE)."""
    o = bytearray(need)
    op = 0
    while op < need and p + 1 < len(s):
        h = s[p] | (s[p + 1] << 8)
        p += 2
        bs = h * 2
        if bs > 0x2000:
            break
        if bs == 0:
            continue
        if p + bs > len(s):
            break
        i = 0
        while i < bs and op < need:
            cnt = s[p + i]
            if cnt == 0:
                if i + 3 > bs:
                    break
                cnt = s[p + i + 1] | (s[p + i + 2] << 8)
                i += 2
            if i + 1 >= bs:
                break
            val = s[p + i + 1]
            i += 2
            end = min(op + cnt, need)
            if val:
                for j in range(op, end):
                    o[j] = val
            op = end
        p += bs
    return o, p


class _Reader:
    def __init__(self, d: bytes):
        self.d = d
        self.p = 0

    def rb(self) -> int:
        v = self.d[self.p] if self.p < len(self.d) else 0
        self.p += 1
        return v

    def rbs(self) -> int:
        v = self.rb()
        return v - 256 if v > 127 else v

    def rw(self) -> int:
        return self.rb() | (self.rb() << 8)

    def rws(self) -> int:
        v = self.rw()
        return v - 65536 if v > 32767 else v

    def ru32(self) -> int:
        return self.rb() | (self.rb() << 8) | (self.rb() << 16) | (self.rb() << 24)

    def rs(self) -> str:
        length = self.rw()
        if not length or self.p + length > len(self.d):
            return ""
        s = self.d[self.p:self.p + length].decode("latin1")
        self.p += length
        return s


def _split_streams(comp: bytes, c1sz: int) -> tuple[bytes, bytes | None]:
    """The payload holds one or two concatenated zlib streams."""
    if 0 < c1sz < len(comp):
        try:
            return zlib.decompress(comp[:c1sz]), zlib.decompress(comp[c1sz:])
        except zlib.error:
            pass
    # decompressobj stops at the first stream's end; the remainder (if
    # any) is the second stream — more robust than the JS header scan
    obj = zlib.decompressobj()
    b1 = obj.decompress(comp)
    rest = obj.unused_data
    if rest:
        try:
            return b1, zlib.decompress(rest)
        except zlib.error:
            return b1, None
    return b1, None


def load_tbt(data: bytes) -> dict[str, Any]:
    if not is_tbt(data):
        raise ValueError("Not a TBT file")
    vb = data[3]
    tc = data[5]
    flags = data[11]
    if not 0x65 <= vb <= 0x72:
        raise ValueError(f"Unsupported TBT version {chr(vb)!r}")
    if not 1 <= tc <= 15:
        raise ValueError(f"Bad track count {tc}")
    has_meta = bool(flags & 1)
    tempo = data[4]
    if vb >= 0x6F:
        tw = data[34] | (data[35] << 8)
        if 0 < tw <= 500:
            tempo = tw
        tw2 = data[46] | (data[47] << 8)
        if 0 < tw2 <= 500:
            tempo = tw2
    if not tempo or tempo > 500:
        tempo = 120

    comp = data[64:]
    c1sz = data[48] | (data[49] << 8) | (data[50] << 16) | (data[51] << 24)
    b1, b2 = _split_streams(comp, c1sz)

    r = _Reader(b1)
    mcs = [r.ru32() for _ in range(tc)] if vb >= 0x70 else []
    ns_a = [r.rb() or 6 for _ in range(tc)]
    inst_b = [r.rb() for _ in range(tc)]
    _vols = [r.rb() for _ in range(tc)]
    pans_b = [r.rb() for _ in range(tc)]
    mods = pbends = []
    if vb >= 0x71:
        mods = [r.rb() for _ in range(tc)]
        pbends = [r.rws() for _ in range(tc)]
    trns = []
    if vb >= 0x6D:
        trns = [r.rbs() for _ in range(tc)]
        for _ in range(tc):
            r.rb()  # transpose direction UI hint (sign is in the value)
    revs = chors = []
    if vb >= 0x6C:
        revs = [r.rb() for _ in range(tc)]
        chors = [r.rb() for _ in range(tc)]
    fk1 = fk2 = []
    if vb >= 0x6B:
        fk1 = [r.rb() for _ in range(tc)]
        fk2 = [r.rb() for _ in range(tc)]
    has_ch = midi_ch0 = []
    if vb >= 0x6A:
        has_ch = [r.rb() for _ in range(tc)]
        midi_ch0 = [r.rbs() for _ in range(tc)]
    has_top = [r.rb() for _ in range(tc)]
    has_bottom = [r.rb() for _ in range(tc)]

    tun_sz = 8 if vb >= 0x6B else 6
    tuns = []
    for i in range(tc):
        raw = [r.rb() for _ in range(tun_sz)]
        t = []
        for j in range(ns_a[i]):
            off = raw[j] - 256 if raw[j] > 127 else raw[j]
            base = STD6[j] if j < 6 else 0
            t.append(max(0, min(127, base + off)))
        tuns.append(t)
    for _ in range(tc):
        r.rb()

    title = artist = album = by = cr = ""
    if has_meta and vb >= 0x6D:
        title, artist, album, by, cr = r.rs(), r.rs(), r.rs(), r.rs(), r.rs()

    if not mcs:
        mc = (data[42] | (data[43] << 8)) if vb >= 0x6F else 4000
        mcs = [mc] * tc
    hdr_mc = ((data[40] | (data[41] << 8)) if vb >= 0x70
              else -(-mcs[0] // BPM))  # ceil division

    tracks: list[dict[str, Any]] = []
    for i in range(tc):
        mch = (midi_ch0[i] + 1) if (has_ch and has_ch[i] and midi_ch0) else 0
        if mch == 0:
            used = {t["midiChannel"] for t in tracks}
            is_drum_guess = tuns[i] and tuns[i][0] == 0 and ns_a[i] >= 4
            if is_drum_guess:
                mch = 10
            else:
                mch = next((c for c in range(1, 17)
                            if c != 10 and c not in used), i + 1)
        is_drum = mch == 10
        tracks.append({
            "name": "Drums" if is_drum else f"Track {i + 1}",
            "numStrings": ns_a[i], "instrument": inst_b[i] & 0x7F,
            "isDrum": is_drum, "midiChannel": mch,
            "volume": pans_b[i] if i < len(pans_b) else 96,
            "pan": fk1[i] if fk1 else 64,
            "reverb": revs[i] if revs else 0,
            "chorus": chors[i] if chors else 0,
            "transpose": trns[i] if trns else 0, "capo": 0,
            "pitchBend": pbends[i] if pbends else 0,
            "modulation": mods[i] if mods else 0,
            "tuning": tuns[i],
            "drumMidi": DRUM_MIDI[:ns_a[i]] if is_drum else None,
            "drumLabels": DRUM_LABELS[:ns_a[i]] if is_drum else None,
            "muted": False, "solo": False,
            "letRing": not is_drum and not (inst_b[i] & 0x80),
            "measures": [],
            "hasTopText": bool(has_top[i]), "hasBottomText": bool(has_bottom[i]),
        })

    if b2 and len(b2) > 4:
        _parse_body(b2, vb, flags, tc, mcs, hdr_mc, tracks)
    else:
        for trk in tracks:
            for _ in range(32):
                trk["measures"].append({
                    "beats": [{"notes": [None] * trk["numStrings"]}
                              for _ in range(BPM)],
                    "barLine": "single"})

    return {"title": title or "Untitled", "artist": artist, "album": album,
            "transcribedBy": by, "copyright": cr, "tempo": tempo,
            "tracks": tracks}


def _parse_body(b2: bytes, vb: int, flags: int, tc: int, mcs: list[int],
                hdr_mc: int, tracks: list[dict[str, Any]]) -> None:
    bp = 0
    alt_bars: dict[int, str] = {}
    alt_staff: dict[int, bool] = {}
    meas_beats: list[int] = []
    alt_extra: list[int] = []

    if vb >= 0x70:
        # 6 bytes per measure header: u32 beat count, flags, extra
        ats = hdr_mc * 6
        if bp + ats <= len(b2):
            for mi in range(hdr_mc):
                o = bp + mi * 6
                at_beats = b2[o] | (b2[o + 1] << 8) | (b2[o + 2] << 16) | (b2[o + 3] << 24)
                fl = b2[o + 4]
                at_ex = b2[o + 5]
                meas_beats.append(at_beats or BPM)
                alt_extra.append(at_ex)
                if (fl & 4) and (fl & 2):
                    alt_bars[mi] = "repeatBoth"
                    alt_extra[mi] = at_ex or 2
                elif fl & 4:
                    alt_bars[mi] = "repeatEnd"
                    alt_extra[mi] = at_ex or 2
                elif fl & 2:
                    alt_bars[mi] = "repeatStart"
                if (fl & 1) and not (fl & 4) and not (fl & 2):
                    db_mi = mi - 1 if mi > 0 else mi
                    if alt_bars.get(db_mi, "single") == "single":
                        alt_bars[db_mi] = "double"
                if fl & 1:
                    alt_staff[mi - 1 if mi > 0 else mi] = True
            bp += ats
    else:
        # one alt-time byte per beat position, lower nibble = bar type
        at_d, bp = dec_rle(b2, bp, mcs[0])
        num_meas_old = -(-mcs[0] // BPM)
        meas_beats = [BPM] * num_meas_old
        alt_extra = [0] * num_meas_old
        for pi, byte in enumerate(at_d):
            btype = byte & 0xF
            upper = byte >> 4
            if not btype:
                continue
            meas_idx, beat_idx = divmod(pi, BPM)
            if btype == 3 and beat_idx == 0:
                alt_bars[meas_idx] = "repeatStart"
            elif btype == 3 and beat_idx == BPM - 1:
                pass  # plain bar line marker
            elif btype == 2:
                alt_bars[meas_idx] = ("repeatBoth"
                                      if alt_bars.get(meas_idx) == "repeatStart"
                                      else "repeatEnd")
                alt_extra[meas_idx] = upper + 1 if upper else 2
            elif btype == 4:
                alt_bars[meas_idx] = "double"

    # note data: 20 bytes per position per track
    all_note_data = []
    for ti in range(tc):
        nd, bp = dec_rle(b2, bp, mcs[ti] * 20)
        all_note_data.append(nd)

    # tuplet (ATR) streams: (numerator, denominator) pairs per position
    track_atr: list[list[tuple[int, int]] | None] = []
    if flags & 0x10:
        for ti in range(tc):
            if bp >= len(b2):
                track_atr.append(None)
                continue
            atr_d, bp = dec_rle(b2, bp, mcs[ti] * 2)
            pairs = [(atr_d[k * 2], atr_d[k * 2 + 1]) for k in range(mcs[ti])]
            has_real = any(1 <= n_ and 1 <= d_ and d_ > n_ for n_, d_ in pairs)
            track_atr.append(pairs if has_real else None)
    else:
        track_atr = [None] * tc

    # separate track-effect stream
    track_fx: list[dict[int, dict]] = []
    for _ in range(tc):
        fx_map: dict[int, dict] = {}
        if bp + 4 <= len(b2):
            fx_bytes = b2[bp] | (b2[bp + 1] << 8) | (b2[bp + 2] << 16) | (b2[bp + 3] << 24)
            bp += 4
            if fx_bytes > 0 and bp + fx_bytes <= len(b2):
                fx_end = bp + fx_bytes
                abs_pos = 0
                while bp + 6 <= fx_end:
                    delta = b2[bp] | (b2[bp + 1] << 8)
                    type_idx = b2[bp + 2] | (b2[bp + 3] << 8)
                    num_vals = b2[bp + 4] | (b2[bp + 5] << 8)
                    bp += 6
                    if bp + num_vals > fx_end:
                        break
                    abs_pos += delta
                    vals = list(b2[bp:bp + num_vals])
                    bp += num_vals
                    e_char = ETYPE_MAP.get(type_idx, 0)
                    if not e_char:
                        continue
                    fx: dict[str, Any] = {"type": e_char,
                                          "value": vals[0] if vals else 0}
                    if e_char == 73 and vals:  # instrument | letRing bit
                        fx["value"] = vals[0] & 0x7F
                        fx["letRing"] = not (vals[0] & 0x80)
                    if e_char == 84 and len(vals) >= 2:  # 16-bit tempo
                        fx["value"] = vals[0] | (vals[1] << 8)
                    if e_char == 66 and len(vals) >= 2:  # 16-bit pitch bend
                        fx["raw16"] = vals[0] | (vals[1] << 8)
                        fx["value"] = fx["raw16"]
                    if abs_pos not in fx_map:
                        fx_map[abs_pos] = fx
                    else:
                        fx_map[abs_pos].setdefault("multi", []).append(fx)
                bp = fx_end
        track_fx.append(fx_map)

    # build measures
    for ti in range(tc):
        nd = all_note_data[ti]
        trk = tracks[ti]
        ns = trk["numStrings"]
        atr = track_atr[ti]
        fx_events = track_fx[ti]
        note_pos = 0

        def parse_note(np: int) -> dict[str, Any]:
            notes: list[dict | None] = [None] * ns
            trk_effect = None
            top_char = bot_char = 0
            if np < mcs[ti]:
                off = np * 20
                for si in range(ns):
                    fb = nd[off + si]
                    if fb == 0:
                        continue
                    efx = normalize_efx(nd[off + 8 + si])
                    if fb >= 128:
                        notes[si] = {"fret": fb - 128, "attack": True,
                                     "effect": efx}
                    elif fb == 17:
                        notes[si] = {"fret": -1, "attack": True,
                                     "effect": efx, "muted": True}
                    elif fb == 18:
                        notes[si] = {"fret": -2, "attack": True,
                                     "effect": efx, "stop": True}
                    elif fb >= 15:
                        notes[si] = {"fret": fb, "attack": False,
                                     "effect": efx}
                etype, evalue = nd[off + 16], nd[off + 19]
                if etype:
                    trk_effect = {"type": etype, "value": evalue}
                top_char, bot_char = nd[off + 17], nd[off + 18]
            if np in fx_events:
                if not trk_effect:
                    trk_effect = fx_events[np]
                else:
                    trk_effect.setdefault("multi", []).append(fx_events[np])
                    for m in fx_events[np].get("multi", []):
                        trk_effect["multi"].append(m)
            return {"notes": notes, "trkEffect": trk_effect,
                    "topChar": top_char, "botChar": bot_char}

        for mi in range(hdr_mc):
            global_bpm = meas_beats[mi] if mi < len(meas_beats) else BPM
            beats: list[dict] = []
            used = 0
            while used < global_bpm and note_pos < mcs[ti]:
                atr_n = atr_d_ = 1
                if atr and note_pos < len(atr):
                    atr_n = atr[note_pos][0] or 1
                    atr_d_ = atr[note_pos][1] or 1
                if atr_d_ > atr_n and atr_d_ <= 16:
                    for _ in range(atr_d_):
                        if note_pos >= mcs[ti]:
                            break
                        parsed = parse_note(note_pos)
                        beat = {"notes": parsed["notes"],
                                "atrGroup": atr_d_, "atrNum": atr_n}
                        for k_src, k_dst in (("trkEffect", "trkEffect"),
                                             ("topChar", "topChar"),
                                             ("botChar", "botChar")):
                            if parsed[k_src]:
                                beat[k_dst] = parsed[k_src]
                        beats.append(beat)
                        note_pos += 1
                    used += atr_n
                else:
                    parsed = parse_note(note_pos)
                    beat = {"notes": parsed["notes"]}
                    for key in ("trkEffect", "topChar", "botChar"):
                        if parsed[key]:
                            beat[key] = parsed[key]
                    beats.append(beat)
                    note_pos += 1
                    used += 1

            bar_type = alt_bars.get(mi, "single")
            repeat_count = (alt_extra[mi] or 2 if bar_type in
                            ("repeatEnd", "repeatBoth") and mi < len(alt_extra)
                            else 0)
            trk["measures"].append({
                "beats": beats, "barLine": bar_type,
                "beatsPerMeasure": len(beats),
                "globalBeatsPerMeasure": global_bpm,
                "isATR": len(beats) != global_bpm,
                "repeatCount": repeat_count,
                "staffBreak": bool(alt_staff.get(mi)),
            })

    # version >= 'q': per-track effect blocks after note+ATR data
    if vb >= 0x71 and bp < len(b2):
        for ti in range(tc):
            if bp + 4 > len(b2):
                break
            blk_sz = b2[bp] | (b2[bp + 1] << 8) | (b2[bp + 2] << 16) | (b2[bp + 3] << 24)
            bp += 4
            if blk_sz == 0 or bp + blk_sz > len(b2):
                bp += min(blk_sz, len(b2) - bp)
                continue
            blk = b2[bp:bp + blk_sz]
            bp += blk_sz
            trk = tracks[ti]
            ep = e_pos = 0
            while ep + 6 <= len(blk):
                pos_off = blk[ep] | (blk[ep + 1] << 8)
                type_idx = blk[ep + 2] | (blk[ep + 3] << 8)
                d_sz = blk[ep + 4] | (blk[ep + 5] << 8)
                ep += 6
                e_pos += pos_off
                if ep + d_sz > len(blk):
                    break
                payload = blk[ep:ep + d_sz]
                ep += d_sz
                e_val = payload[0] if payload else 0
                e_val16 = (payload[0] | (payload[1] << 8)
                           if len(payload) >= 2 else e_val)
                cum = 0
                for emi, meas in enumerate(trk["measures"]):
                    if cum + len(meas["beats"]) > e_pos:
                        fx = {"type": ETYPE_MAP.get(type_idx, 63),
                              "value": e_val, "raw16": e_val16}
                        beat = meas["beats"][e_pos - cum]
                        if not beat.get("trkEffect"):
                            beat["trkEffect"] = fx
                        else:
                            beat["trkEffect"].setdefault("multi", []).append(fx)
                        break
                    cum += len(meas["beats"])
