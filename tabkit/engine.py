"""Jitter-free playback engines.

The compiler produces absolute-time events; this module fires them.
Timing strategy: sleep in coarse steps until ~2 ms before the next
event, then busy-wait on time.perf_counter(). That holds onset error
well under a millisecond on an idle core — versus the browser version,
where every note onset rode on a main-thread setTimeout.

Backends:
  FluidSynthBackend — SoundFont audio via libfluidsynth (C audio thread).
  MidiOutBackend    — a real/virtual MIDI port via python-rtmidi. The
                      virtual port ("TabKit Out") is what a DAW patches
                      into later; the sequencer-in-a-DAW story builds on
                      this same backend.
"""

from __future__ import annotations

import threading
import time
from pathlib import Path
from typing import Callable, Iterable

from .compiler import CompiledSong, Event

# Sound font search order for the FluidSynth backend
SF2_SEARCH = [
    Path("gm.sf2"),
    Path("legacy-web/gm.sf2"),
    Path.home() / ".tabkit" / "gm.sf2",
    Path("/usr/share/sounds/sf2/FluidR3_GM.sf2"),
    Path("/usr/share/sounds/sf2/default-GM.sf2"),
]
SF2_URL = "https://musical-artifacts.com/artifacts/1983/gm.sf2"


def find_soundfont(explicit: str | None = None) -> Path:
    candidates = [Path(explicit)] if explicit else SF2_SEARCH
    for p in candidates:
        if p.is_file():
            return p
    raise FileNotFoundError(
        "No SoundFont found. Place gm.sf2 in the working directory or "
        f"~/.tabkit/, or pass --sf2. The web app's default is {SF2_URL}"
    )


class Backend:
    """Minimal interface a playback backend must provide."""

    def send(self, ev: Event) -> None:
        raise NotImplementedError

    def all_off(self) -> None:
        raise NotImplementedError

    def close(self) -> None:
        pass


class FluidSynthBackend(Backend):
    def __init__(self, sf2: str | None = None, driver: str | None = None,
                 gain: float = 0.6):
        import fluidsynth

        self.synth = fluidsynth.Synth(gain=gain)
        self.synth.start(driver=driver) if driver else self.synth.start()
        self.sfid = self.synth.sfload(str(find_soundfont(sf2)))
        self._drum_channels: set[int] = set()

    def set_drum_channel(self, ch: int) -> None:
        # bank 128 is the GM percussion bank in SF2
        self._drum_channels.add(ch)

    def send(self, ev: Event) -> None:
        s = self.synth
        if ev.kind == "on":
            s.noteon(ev.channel, ev.a, ev.b)
        elif ev.kind == "off":
            s.noteoff(ev.channel, ev.a)
        elif ev.kind == "cc":
            s.cc(ev.channel, ev.a, ev.b)
        elif ev.kind == "prog":
            bank = 128 if ev.channel in self._drum_channels else ev.b
            s.program_select(ev.channel, self.sfid, bank, ev.a)
        elif ev.kind == "bend":
            s.pitch_bend(ev.channel, ev.a - 8192)

    def all_off(self) -> None:
        for ch in range(16):
            self.synth.cc(ch, 123, 0)  # All Notes Off
            self.synth.cc(ch, 120, 0)  # All Sound Off

    def close(self) -> None:
        self.synth.delete()


class MidiOutBackend(Backend):
    """Sends events out a MIDI port. With virtual=True, creates a
    virtual port other software (a DAW) can connect to."""

    def __init__(self, port_name: str = "TabKit Out", virtual: bool = True,
                 port_index: int | None = None):
        import rtmidi

        self.out = rtmidi.MidiOut()
        if port_index is not None:
            self.out.open_port(port_index)
        elif virtual:
            self.out.open_virtual_port(port_name)
        else:
            self.out.open_port(0)

    def send(self, ev: Event) -> None:
        ch = ev.channel & 0x0F
        if ev.kind == "on":
            self.out.send_message([0x90 | ch, ev.a, ev.b])
        elif ev.kind == "off":
            self.out.send_message([0x80 | ch, ev.a, 0])
        elif ev.kind == "cc":
            self.out.send_message([0xB0 | ch, ev.a, ev.b])
        elif ev.kind == "prog":
            self.out.send_message([0xC0 | ch, ev.a])
        elif ev.kind == "bend":
            self.out.send_message([0xE0 | ch, ev.a & 0x7F, (ev.a >> 7) & 0x7F])

    def all_off(self) -> None:
        for ch in range(16):
            self.out.send_message([0xB0 | ch, 123, 0])

    def close(self) -> None:
        self.out.close_port()


class Player:
    """Plays a CompiledSong through a backend on a dedicated thread."""

    def __init__(self, backend: Backend):
        self.backend = backend
        self._thread: threading.Thread | None = None
        self._stop = threading.Event()
        self.on_tick: Callable[[float, int, int], None] | None = None
        self.on_finished: Callable[[], None] | None = None
        # Live mute/solo state, checked per note-on at fire time
        self.muted_tracks: set[int] = set()
        self.solo_tracks: set[int] = set()

    @property
    def playing(self) -> bool:
        return self._thread is not None and self._thread.is_alive()

    def play(self, compiled: CompiledSong, start_time: float = 0.0,
             end_time: float | None = None, loop: bool = False) -> None:
        self.stop()
        self._stop.clear()
        self._thread = threading.Thread(
            target=self._run, args=(compiled, start_time, end_time, loop),
            daemon=True)
        self._thread.start()

    def stop(self) -> None:
        self._stop.set()
        if self._thread is not None:
            self._thread.join(timeout=1.0)
            self._thread = None
        self.backend.all_off()

    def _audible(self, ev: Event) -> bool:
        if ev.kind != "on":
            return True
        if ev.track in self.muted_tracks:
            return False
        if self.solo_tracks and ev.track not in self.solo_tracks:
            return False
        return True

    def _run(self, compiled: CompiledSong, start_time: float,
             end_time: float | None, loop: bool) -> None:
        end = end_time if end_time is not None else compiled.duration
        # channel state (programs/CCs/bends) from before the window still
        # applies — replay it once so a mid-song start sounds right
        setup = [e for e in compiled.events
                 if e.time < start_time and e.kind in ("prog", "cc", "bend")]
        events = [e for e in compiled.events if start_time <= e.time < end]
        ticks = [tk for tk in compiled.tick_times if start_time <= tk[0] < end]
        for ev in setup:
            self.backend.send(ev)

        while not self._stop.is_set():
            t0 = time.perf_counter() - start_time
            ei = ti = 0
            while not self._stop.is_set() and (ei < len(events) or ti < len(ticks)):
                next_t = min(events[ei].time if ei < len(events) else float("inf"),
                             ticks[ti][0] if ti < len(ticks) else float("inf"))
                # Coarse sleep, then spin the last 2 ms for precision
                while True:
                    now = time.perf_counter() - t0
                    remaining = next_t - now
                    if remaining <= 0:
                        break
                    if remaining > 0.002:
                        if self._stop.wait(min(remaining - 0.002, 0.05)):
                            return
                    # inside 2 ms: spin
                while ei < len(events) and events[ei].time <= next_t:
                    ev = events[ei]
                    if self._audible(ev):
                        self.backend.send(ev)
                    ei += 1
                while ti < len(ticks) and ticks[ti][0] <= next_t:
                    if self.on_tick:
                        self.on_tick(*ticks[ti])
                    ti += 1
            if self._stop.is_set():
                return
            # wait out the rest of the window so the loop length is exact
            rest = end - (time.perf_counter() - t0)
            if self._stop.wait(max(0.0, rest)):
                return
            if not loop:
                if end_time is not None:
                    self.backend.all_off()  # region cut: silence stragglers
                break
            self.backend.all_off()
        if not self._stop.is_set() and self.on_finished:
            self.on_finished()
