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

## Phase 2 — editor parity (in progress)

- [x] Note entry/edit: cursor (click + arrows, crosses tracks), fret
      typing with two-digit combining, delete, note preview on entry
- [x] Insert/delete bar (Ctrl+B / Ctrl+Shift+B), across all tracks
- [x] Undo/redo history (snapshots, 200 deep)
- [x] New/Open/Save/Save As with dirty tracking
- [x] Play from cursor (Shift+Space)
- [x] Bend/slide chains (fx 98/47/92): full chain scan, target attacks
      suppressed, linear pitch ramps as stepped MIDI bends over an
      RPN-widened ±12-semitone range; bendHold, delayed (technique-only)
      chains, releases (fx 114), pre-bends
- [x] Vibrato (fx 126): ±35-cent 6 Hz oscillation, bend-offset centered
- [x] Hammer-on/pull-off velocity reduction (fx 104/112)
- [x] Selection (shift+arrows / shift+click), cut/copy/paste across
      measures, Escape clears
- [x] Track management: add Guitar/Bass/Drums presets with automatic
      channel allocation, duplicate, rename, delete
- [x] Pedal effects compiled to events: delay taps (decay by mix%, tap
      interval from tempo), pitch shifter (dry/wet + shift), tremolo as
      a CC11 expression LFO, ADT delayed double; fx 201/202/204/205
      update pedal state mid-song
- [x] Metronome (quarter-note clicks, accented downbeats) + one-measure
      count-in; practice speed parameter in the compiler
- [x] Song title/tempo dialogs, MIDI export from the GUI
- [ ] Channel-per-string voice allocation so simultaneous bends on
      different strings don't share one channel's pitch wheel
- [ ] Sections strip, practice/loop mode UI (speed knob, loop region)
- [ ] Tuning editor / drum lane editor
- [ ] TBT / Guitar Pro import (parsers exist in JSX ~1360-2100)

## Phase 3 — "musician features" (the reason for going native)

- [ ] Virtual MIDI in/out pairs so a DAW can drive TabKit and record it
      (rtmidi backend already opens the out port; add input + MIDI clock)
- [ ] MIDI clock / transport sync (follow or lead the DAW)
- [ ] Low-latency live input monitoring
- [ ] JACK/ASIO device selection for pro audio interfaces
