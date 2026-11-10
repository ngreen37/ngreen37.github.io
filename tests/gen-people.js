#!/usr/bin/env node
/* gen-people.js — the picture whoever sits across the chess rooms' 3D board is drawn from (assets/js/pjcc-board3d.js,
 * his view idea #1): the game's own front bank (art/people_front.png, the probe's `frontsheet` bakes it off nate.glb),
 * copied here byte for byte, so the site's opponent and the game's are the same photograph, dressed the same way.
 * Run:  npm run gen:people      Out: assets/models/people_front.png      (re-bake it in the game first, then this) */
'use strict';
const fs = require('fs');
const path = require('path');

const GAME = process.env.CHECKERTOWN_PROJECT || 'C:/Users/Nate/Documents/checker-town';
const FROM = path.join(GAME, 'art', 'people_front.png');
const OUT = path.join(__dirname, '..', 'assets', 'models', 'people_front.png');
if (!fs.existsSync(FROM)) {
  console.error('✗ not there: ' + FROM);
  process.exit(1);
}
fs.copyFileSync(FROM, OUT);
console.log('people_front → assets/models/people_front.png (' + (fs.statSync(OUT).size / 1024).toFixed(0) + ' KB)');
