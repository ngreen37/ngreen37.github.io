/* gen-models.js — Blender saves → web models.  Run:  npm run gen:models
 * For each row in MODELS, takes the highest-numbered save (Altar_2 beats Altar_1) from
 * BLEND_DIR (default ~/Desktop/Blender_Laptop) and exports it to GLB through headless Blender.
 * A row with `godot` drops the same GLB into the Checker Town project as well — Godot imports
 * it unchanged, so one export serves the web page and the game.
 * Overrides: BLEND_DIR=…  BLENDER=path/to/blender.exe  CHECKERTOWN_PROJECT=… */
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const BLEND_DIR = process.env.BLEND_DIR || path.join(os.homedir(), 'Desktop', 'Blender_Laptop');

// ⚠ `godot` is a path inside the Checker Town project. The private mirror gets the same copy:
// that folder is what a clean checkout of the game is rebuilt from, so a model living only in
// Documents/ is a model the next rebuild loses.
const MODELS = [
  { name: 'Altar', out: 'assets/models/gambit-altar.glb' },
  { name: 'Nate', out: 'assets/models/nate.glb', godot: 'nate.glb' },
];

const CT_PROJECT = process.env.CHECKERTOWN_PROJECT || 'C:/Users/Nate/Documents/checker-town';
const CT_MIRROR = path.join(ROOT, 'private/docs/godot/chess_town');

function findBlender() {
  if (process.env.BLENDER) return process.env.BLENDER;
  const base = 'C:/Program Files/Blender Foundation';
  const vers = fs.existsSync(base) ? fs.readdirSync(base).filter(d => /^Blender \d/.test(d)) : [];
  vers.sort((a, b) => parseFloat(b.slice(8)) - parseFloat(a.slice(8)));
  for (const v of vers) {
    const exe = path.join(base, v, 'blender.exe');
    if (fs.existsSync(exe)) return exe;
  }
  throw new Error('Blender not found — set BLENDER=path/to/blender.exe');
}

// ⚠⚠ THE VERSION IS A NUMBER, NOT AN INTEGER. He saves `Nate_0.6.blend`, which an integer-only
// pattern matched not at all — the row would have reported "no Nate_N.blend" with two of them
// sitting in the folder. parseFloat also keeps 0.10 above 0.9, which a digit compare would not.
function newestSave(name) {
  const re = new RegExp('^' + name + '(?:_(\\d+(?:\\.\\d+)?))?\\.blend$', 'i');
  const hits = fs.readdirSync(BLEND_DIR)
    .map(f => ({ f, m: f.match(re) })).filter(x => x.m)
    .sort((a, b) => (parseFloat(b.m[1]) || 0) - (parseFloat(a.m[1]) || 0));
  return hits.length ? path.join(BLEND_DIR, hits[0].f) : null;
}


// the same bytes, in the place Godot imports from. A missing project is a note and not a
// failure: this script has to run on a machine that has no Checker Town checked out.
function toGodot(out, rel) {
  const notes = [];
  for (const [label, dir] of [['project', CT_PROJECT], ['mirror', CT_MIRROR]]) {
    if (!fs.existsSync(dir)) { notes.push(`(no ${label} at ${dir})`); continue; }
    const dest = path.join(dir, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(out, dest);
    notes.push(`→ ${label}/${rel}`);
  }
  return notes.join('  ');
}

const blender = findBlender();
let failed = 0;
for (const m of MODELS) {
  const src = newestSave(m.name);
  if (!src) { console.error(`✗ ${m.name}: no ${m.name}_N.blend in ${BLEND_DIR}`); failed++; continue; }
  const out = path.join(ROOT, m.out);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const log = execFileSync(blender, ['-b', src, '--factory-startup', '--python',
    path.join(__dirname, 'blender-export.py'), '--', out], { encoding: 'utf8' });
  const line = (log.match(/^EXPORTED .*$/m) || [''])[0];
  // a bad export still exits 0 — Blender only prints the traceback
  if (!line || !fs.existsSync(out)) { console.error(`✗ ${m.name}: export failed\n${log.slice(-1500)}`); failed++; continue; }
  const also = m.godot ? '\n    ' + toGodot(out, m.godot) : '';
  console.log(`✓ ${path.basename(src)} → ${m.out} (${(fs.statSync(out).size / 1024).toFixed(1)} KB) ${line.split(' ').slice(2).join(' ')}${also}`);
}
process.exit(failed ? 1 : 0);
