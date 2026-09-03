#!/usr/bin/env node
/* ══════════════════════════════════════════════════════════════════════════════════════
   gen-checkertown.js  —  npm run gen:checkertown

   Exports the Godot project at Documents/checker-town to a single-threaded Web build and
   copies it into assets/games/checker-town/. The Godot project is the source of truth;
   nothing in the output folder is ever hand-edited.

   ⚠⚠ THREAD SUPPORT MUST STAY OFF. A threaded Godot web build needs SharedArrayBuffer,
   which needs COOP/COEP response headers, which GitHub Pages cannot send. It runs fine on
   localhost and shows a blank canvas on the live site — the worst kind of failure. Godot
   emits `index.worker.js` only for a threaded build, so its ABSENCE is the real check and
   this script fails on it.
   ⚠ The .wasm changes only with the Godot version. The game ships in the .pck, which for an
   all-GDScript project is small — commit the wasm once, iterate on the pck.
   ══════════════════════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'assets/games/checker-town');

const GODOT = process.env.CHECKERTOWN_GODOT ||
  'C:/Users/Nate/Desktop/Godot/Godot_v4.7-stable_win64.exe';
const PROJECT = process.env.CHECKERTOWN_PROJECT ||
  'C:/Users/Nate/Documents/checker-town';

const die = (msg) => { console.error('\ngen:checkertown — ' + msg + '\n'); process.exit(1); };
const kb = (n) => (n / 1024).toFixed(0) + ' kB';
const mb = (n) => (n / 1048576).toFixed(1) + ' MB';

/* ── 1 · the two things that are not in this repo ──────────────────────────────── */
if (!fs.existsSync(GODOT)) {
  die('no Godot at ' + GODOT + '\n  Set CHECKERTOWN_GODOT to the .exe if it moved.');
}
if (!fs.existsSync(path.join(PROJECT, 'project.godot'))) {
  die('no Godot project at ' + PROJECT + '\n  Set CHECKERTOWN_PROJECT if it moved.');
}

/* ── 2 · the export preset, written once so the build is not a GUI state ───────── */
const PRESET = path.join(PROJECT, 'export_presets.cfg');
if (!fs.existsSync(PRESET)) {
  fs.writeFileSync(PRESET, `[preset.0]

name="Web"
platform="Web"
runnable=true
advanced_options=false
dedicated_server=false
custom_features=""
export_filter="all_resources"
include_filter=""
exclude_filter=""
export_path=""
encryption_include_filters=""
encryption_exclude_filters=""
seed=0
encrypt_pck=false
encrypt_directory=false
script_export_mode=2

[preset.0.options]

custom_template/debug=""
custom_template/release=""
variant/extensions_support=false
variant/thread_support=false
vram_texture_compression/for_desktop=false
vram_texture_compression/for_mobile=false
html/export_icon=true
html/custom_html_shell=""
html/head_include=""
html/canvas_resize_policy=2
html/focus_canvas_on_start=true
html/experimental_virtual_keyboard=false
progressive_web_app/enabled=false
`, 'utf8');
  console.log('wrote a Web export preset (single-threaded) to ' + PRESET);
}

const presetSrc = fs.readFileSync(PRESET, 'utf8');
if (!/variant\/thread_support=false/.test(presetSrc)) {
  die('the Web preset has thread support ON.\n' +
      '  GitHub Pages cannot send the COOP/COEP headers SharedArrayBuffer needs, so a\n' +
      '  threaded build is a blank canvas on the live site. Set thread_support=false.');
}

/* ── 3 · export ───────────────────────────────────────────────────────────────── */
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

console.log('exporting ' + PROJECT + ' …');
const r = spawnSync(GODOT, [
  '--headless', '--path', PROJECT, '--export-release', 'Web',
  path.join(OUT, 'index.html')
], { encoding: 'utf8', timeout: 300000 });

const log = (r.stdout || '') + (r.stderr || '');
if (/export.templates/i.test(log) && /not found|missing|no export template/i.test(log)) {
  die('the Web export templates are not installed.\n' +
      '  In Godot: Editor -> Manage Export Templates -> Download and Install. Then re-run.');
}

/* ── 4 · what actually landed ──────────────────────────────────────────────────── */
const wasm = path.join(OUT, 'index.wasm');
const pck = path.join(OUT, 'index.pck');
if (!fs.existsSync(wasm) || !fs.existsSync(pck)) {
  console.error(log.split('\n').slice(-25).join('\n'));
  die('the export produced no index.wasm/index.pck — see Godot output above.');
}
if (fs.existsSync(path.join(OUT, 'index.worker.js'))) {
  die('index.worker.js exists, so this is a THREADED build and will not run on Pages.');
}

const rows = fs.readdirSync(OUT).sort().map((f) => {
  const buf = fs.readFileSync(path.join(OUT, f));
  return { f, raw: buf.length, gz: zlib.gzipSync(buf, { level: 9 }).length };
});
const tot = rows.reduce((a, x) => ({ raw: a.raw + x.raw, gz: a.gz + x.gz }), { raw: 0, gz: 0 });

console.log('\n  file                    on disk    over the wire (gzip)');
for (const x of rows) {
  console.log('  ' + x.f.padEnd(24) + (x.raw > 1048576 ? mb(x.raw) : kb(x.raw)).padStart(9) +
              (x.gz > 1048576 ? mb(x.gz) : kb(x.gz)).padStart(22));
}
console.log('  ' + 'TOTAL'.padEnd(24) + mb(tot.raw).padStart(9) + mb(tot.gz).padStart(22));
console.log('\n  the .pck is the game and is what changes when you edit a .gd file: ' +
            kb(fs.statSync(pck).size));
console.log('  the .wasm is the engine and changes only with the Godot version.\n');
