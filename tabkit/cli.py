"""TabKit command line: play, inspect, and export songs.

  tabkit info song.tkt
  tabkit play song.tkt [--sf2 gm.sf2] [--track N]
  tabkit play song.tkt --midi-out          # to a virtual MIDI port
  tabkit export song.tkt out.mid
  tabkit gui [song.tkt]
"""

from __future__ import annotations

import argparse
import sys

from . import tktfile
from .compiler import compile_song
from .model import GM_PROGRAMS, build_measure_map


def cmd_info(args: argparse.Namespace) -> int:
    song = tktfile.load(args.file)
    meas_map = build_measure_map(song)
    compiled = compile_song(song)
    print(f"Title:    {song.get('title') or '(untitled)'}")
    print(f"Tempo:    {song.get('tempo', 120)} BPM")
    print(f"Measures: {len(meas_map)}   Duration: {compiled.duration:.1f}s "
          f"({len(compiled.events)} MIDI events)")
    for i, trk in enumerate(song["tracks"]):
        kind = "drums" if trk.get("isDrum") else \
            GM_PROGRAMS[trk.get("instrument") or 0]
        print(f"  [{i}] {trk.get('name', 'Track')} — {trk.get('numStrings')} "
              f"strings, ch {trk.get('midiChannel', i)}, {kind}")
    return 0


def cmd_play(args: argparse.Namespace) -> int:
    from .engine import FluidSynthBackend, MidiOutBackend, Player

    song = tktfile.load(args.file)
    compiled = compile_song(song, solo_track=args.track)

    if args.midi_out:
        backend = MidiOutBackend()
        print("Opened virtual MIDI port 'TabKit Out' — connect a synth/DAW.")
    else:
        backend = FluidSynthBackend(sf2=args.sf2)
        for i, trk in enumerate(song["tracks"]):
            if trk.get("isDrum"):
                backend.set_drum_channel(trk.get("midiChannel", i))

    player = Player(backend)
    done = __import__("threading").Event()
    player.on_finished = done.set
    print(f"Playing {args.file} — {compiled.duration:.1f}s. Ctrl-C to stop.")
    player.play(compiled)
    try:
        done.wait()
    except KeyboardInterrupt:
        print("\nStopped.")
    finally:
        player.stop()
        backend.close()
    return 0


def cmd_export(args: argparse.Namespace) -> int:
    from .midi_export import export_midi

    song = tktfile.load(args.file)
    compiled = compile_song(song, solo_track=args.track)
    export_midi(song, compiled, args.out)
    print(f"Wrote {args.out} ({len(compiled.events)} events)")
    return 0


def cmd_gui(args: argparse.Namespace) -> int:
    from .gui import run_gui

    return run_gui(args.file, sf2=args.sf2)


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(prog="tabkit", description=__doc__)
    sub = p.add_subparsers(dest="cmd", required=True)

    pi = sub.add_parser("info", help="show song details")
    pi.add_argument("file")
    pi.set_defaults(fn=cmd_info)

    pp = sub.add_parser("play", help="play a song")
    pp.add_argument("file")
    pp.add_argument("--sf2", help="path to a SoundFont (.sf2)")
    pp.add_argument("--track", type=int, default=None,
                    help="play a single track")
    pp.add_argument("--midi-out", action="store_true",
                    help="send to a virtual MIDI port instead of audio")
    pp.set_defaults(fn=cmd_play)

    pe = sub.add_parser("export", help="export to a .mid file")
    pe.add_argument("file")
    pe.add_argument("out")
    pe.add_argument("--track", type=int, default=None)
    pe.set_defaults(fn=cmd_export)

    pg = sub.add_parser("gui", help="open the desktop editor")
    pg.add_argument("file", nargs="?", default=None)
    pg.add_argument("--sf2", help="path to a SoundFont (.sf2)")
    pg.set_defaults(fn=cmd_gui)

    args = p.parse_args(argv)
    return args.fn(args)


if __name__ == "__main__":
    sys.exit(main())
