# Precompiled web app

The `js` branch ships the app as raw JSX that Babel standalone transpiles
in the browser on every page load — ~13.5k lines compiled on the main
thread before anything renders. This directory precompiles it ahead of
time instead. Sources stay untouched in `legacy-web/`.

```bash
node web/build.mjs      # needs Node; fetches esbuild via npx on first run
```

Output lands in `web/dist/` (committed): `index.html` with Babel
standalone removed, plus the compiled `tabkit.js` and its sourcemap.
Deploying is copying `web/dist/*` onto the GitHub Pages branch.

Measured in headless Chromium (local static server, cold load):

| Version | Time to first render |
| --- | --- |
| `js` branch (Babel standalone) | ~5.8 s |
| `web/dist` (precompiled) | ~0.16 s |

## Audio-clock note scheduling

Precompiling removes the load-time stall and the ~2.4 MB Babel download,
but on its own it does not change playback timing: the engine originally
started notes at whatever `ctx.currentTime` happened to be when a
`setTimeout` callback fired, so onsets jittered with main-thread load.

`legacy-web/TabKit.jsx` now schedules on the audio clock instead (the
same pattern its metronome always used): beat callbacks fire
`SCHED_LEAD_MS` (80 ms) early, and every onset, kill, bend, vibrato,
tremolo, and delay tap inside them carries an absolute AudioContext
time (`onsetT`) down through `synthOn`/`synthOff`/`killString` and
friends. Timer lateness no longer moves note onsets unless it exceeds
the lead.

Measured in headless Chromium playing `examples/demo.tkt` (tempo 140,
16th-note grid = 107.14 ms) while a busy-loop stalls the main thread
60 ms out of every 150 ms:

| Build | Onset error vs grid (RMS / max) | Scheduling headroom |
| --- | --- | --- |
| before | 49.8 ms / 92.7 ms | ~0 ms |
| after | 0.00 ms / 0.00 ms | ~65 ms mean, 27 ms min |
