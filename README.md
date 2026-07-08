# TabKit

Native guitar tablature editor and sequencer. Python port of the TabKit
web app, prioritizing playback timing (the web version scheduled note
onsets on main-thread timers; this engine holds onset error under 0.02 ms).

The original web app is preserved unmodified in `legacy-web/` as the
feature reference. Progress toward parity: see `ROADMAP.md`.

## Install

```bash
pip install -e .[gui]
# audio needs libfluidsynth: apt install libfluidsynth3 / brew install fluid-synth
```

A General MIDI SoundFont is needed for audio playback. The web app's
default (`gm.sf2`, https://musical-artifacts.com/artifacts/1983/gm.sf2)
works — drop it in the working directory or `~/.tabkit/gm.sf2`.

## Use

```bash
tabkit info song.tkt          # song details
tabkit play song.tkt          # play through FluidSynth
tabkit play song.tkt --midi-out   # play out a virtual MIDI port ("TabKit Out")
tabkit export song.tkt out.mid    # standard MIDI file
tabkit gui [song.tkt]         # desktop app
```

`.tkt` files saved by the web app load directly, and files saved here
open in the web app.

## Tests

```bash
python -m pytest tests/
```
