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

## What this does and doesn't fix

Precompiling removes the load-time stall and the ~2.4 MB Babel download,
and frees the main thread sooner. It does **not** change playback timing
accuracy: note onsets are still triggered by `setTimeout`/`setInterval`
callbacks that start notes at whatever `ctx.currentTime` is when the
callback runs (`synthOn` in `TabKit.jsx`), so onsets still jitter with
main-thread load. The metronome already shows the fix — `synthClick`
takes a scheduled audio-clock time (`nextT`). Reliable timing means
threading that same `when` parameter through `synthOn` and starting
sources at the scheduled time; that is the approach the Python port in
this repo was built around.
