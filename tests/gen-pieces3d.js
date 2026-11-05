#!/usr/bin/env node
/* gen-pieces3d.js — his 3D chess pieces for the chess rooms' tilted board (assets/js/pjcc-board3d.js).
 * Run:  npm run gen:pieces3d      Out: assets/models/pieces3d/<code>.glb
 * ⭐ ONE PIPELINE: Checker Town's tests/gen_pieces3d.js makes them from his Blender saves (his pawns and bishops, the
 * May set for the rest), and this copies the game's pieces3d/ here byte for byte, so the site's board and the game's
 * are the same pieces. A piece he models later: run the game's script, then this. */
'use strict';
const fs = require('fs');
const path = require('path');

const GAME = process.env.CHECKERTOWN_PROJECT || 'C:/Users/Nate/Documents/checker-town';
const FROM = path.join(GAME, 'pieces3d');
const OUT = path.join(__dirname, '..', 'assets', 'models', 'pieces3d');
const CODES = ['wP', 'bP', 'wB', 'bB', 'K', 'Q', 'R', 'N'];

const missing = CODES.filter((c) => !fs.existsSync(path.join(FROM, c + '.glb')));
if (missing.length) {
  console.error('✗ not in ' + FROM + ': ' + missing.join(' ') + ' — run the game\'s node tests/gen_pieces3d.js first');
  process.exit(1);
}
fs.mkdirSync(OUT, { recursive: true });
for (const f of fs.readdirSync(OUT)) {
  if (f.endsWith('.glb') && !CODES.includes(f.slice(0, -4))) fs.unlinkSync(path.join(OUT, f));
}
let bytes = 0;
for (const c of CODES) {
  fs.copyFileSync(path.join(FROM, c + '.glb'), path.join(OUT, c + '.glb'));
  bytes += fs.statSync(path.join(OUT, c + '.glb')).size;
}
console.log('pieces3d → ' + path.relative(path.join(__dirname, '..'), OUT) + ' (' + CODES.length + ' models, ' +
  (bytes / 1024).toFixed(0) + ' KB)');
