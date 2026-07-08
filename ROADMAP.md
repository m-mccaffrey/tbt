# TabKit native port — parity roadmap

Goal: local-first tablature editor/sequencer with rock-solid timing.
Web/social features (share links, PWA, mobile) are intentionally dropped.
Reference implementation: `legacy-web/TabKit.jsx` (line numbers below).

## Phase 1 — playback core (done)

- [x] `.tkt` file format read/write, byte-compatible with the web app
- [x] Plain-JSON song read/write
- [x] Measure map, time signatures, tuplets (`atrGroup`/`atrNum`)
- [x] Repeat expansion (`repeatStart`/`repeatEnd`/`repeatBoth`, counts)
- [x] Offline compiler: song → absolute-time MIDI event list
- [x] Tempo changes (fx 84), volume/pan/program/CC track effects
- [x] Note semantics: attack/stop/muted, let-ring, ring flags, mass-kill,
      capo/transpose, natural harmonics (fx 60), palm mute (fx 109),
      12-string doubling, drum choke groups, per-note velocity
- [x] Jitter-free scheduler (measured: < 0.02 ms worst-case onset error)
- [x] FluidSynth audio backend (SoundFont, same gm.sf2 as the web app)
- [x] rtmidi backend with **virtual MIDI port** (`TabKit Out`)
- [x] Standard MIDI file export
- [x] CLI: `tabkit info | play | export | gui`
- [x] GUI skeleton: open song, render all tracks as tab, play/stop, playhead

## Phase 2 — editor parity

- [ ] Note entry/edit (cursor, fret typing, insert/delete note & bar)
- [ ] Selection, copy/paste, undo/redo history
- [ ] Track management (add/delete/duplicate, tuning presets, drum lanes)
- [ ] Bends/slides/vibrato chains (JSX ~9900-10100 chain scan) via MIDI
      pitch-bend ramps — needs channel-per-string voice allocation
- [ ] Hammer-on velocity reduction (`hammerNext`), grace/trill effects
- [ ] Pedal effects: delay taps, pitch shifter, tremolo, ADT (fx 201-205)
      as compiled event patterns instead of the web version's setTimeouts
- [ ] Sections strip, count-in, metronome, practice/loop mode
- [ ] TBT / Guitar Pro import (parsers exist in JSX ~1360-2100)

## Phase 3 — "musician features" (the reason for going native)

- [ ] Virtual MIDI in/out pairs so a DAW can drive TabKit and record it
      (rtmidi backend already opens the out port; add input + MIDI clock)
- [ ] MIDI clock / transport sync (follow or lead the DAW)
- [ ] Low-latency live input monitoring
- [ ] JACK/ASIO device selection for pro audio interfaces
