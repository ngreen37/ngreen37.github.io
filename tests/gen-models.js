/* gen-models.js — Blender saves → web models.  Run:  npm run gen:models
 * For each row in MODELS, takes the highest-numbered save (Altar_2 beats Altar_1) from
 * BLEND_DIR (default ~/Desktop/Blender_Laptop) and exports it to GLB through headless Blender.
 * Overrides: BLEND_DIR=…  BLENDER=path/to/blender.exe */
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const BLEND_DIR = process.env.BLEND_DIR || path.join(os.homedir(), 'Desktop', 'Blender_Laptop');

const MODELS = [
  { name: 'Altar', out: 'assets/models/gambit-altar.glb' },
];

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

function newestSave(name) {
  const re = new RegExp('^' + name + '(?:_(\\d+))?\\.blend$', 'i');
  const hits = fs.readdirSync(BLEND_DIR)
    .map(f => ({ f, m: f.match(re) })).filter(x => x.m)
    .sort((a, b) => (+b.m[1] || 0) - (+a.m[1] || 0));
  return hits.length ? path.join(BLEND_DIR, hits[0].f) : null;
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
  console.log(`✓ ${path.basename(src)} → ${m.out} (${(fs.statSync(out).size / 1024).toFixed(1)} KB) ${line.split(' ').slice(2).join(' ')}`);
}
process.exit(failed ? 1 : 0);
