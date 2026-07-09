#!/usr/bin/env node
// Precompile the legacy web app so the browser no longer runs Babel standalone.
//
// The app on the `js` branch ships raw JSX (`<script type="text/babel">`),
// which makes every page load transpile ~13.5k lines on the main thread
// before anything renders. This script compiles the JSX ahead of time with
// esbuild and rewrites index.html to load the plain-JS bundle directly.
//
// Usage: node web/build.mjs   (from the repo root or web/)
// Output: web/dist/{index.html,tabkit.js,tabkit.js.map}

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, copyFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "legacy-web");
const dist = join(root, "web", "dist");
mkdirSync(dist, { recursive: true });

// 1. JSX -> plain JS. The source targets React 18 UMD globals, so the
//    classic createElement transform is required (not automatic/jsx-runtime).
execFileSync("npx", [
  "esbuild", join(src, "TabKit.jsx"),
  "--loader:.jsx=jsx",
  "--jsx=transform",
  "--target=es2017",
  "--minify",
  "--sourcemap",
  `--outfile=${join(dist, "tabkit.js")}`,
], { stdio: "inherit" });

// 2. index.html: drop Babel standalone, load the compiled bundle.
let html = readFileSync(join(src, "index.html"), "utf8");
const before = html;
html = html.replace(/^.*babel\.min\.js.*\n/m, "");
html = html.replace(
  /<script type="text\/babel" src="TabKit\.jsx"><\/script>/,
  '<script src="tabkit.js"></script>'
);
if (html === before || /text\/babel/.test(html)) {
  throw new Error("index.html rewrite failed - babel references still present");
}
writeFileSync(join(dist, "index.html"), html);

// 3. Carry over any other static files the page references.
for (const f of [".nojekyll", "manifest.json", "sw.js", "icon-192.png", "icon-512.png"]) {
  if (existsSync(join(src, f))) copyFileSync(join(src, f), join(dist, f));
}

console.log("Built web/dist/");
