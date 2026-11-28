/* node tests/wc-title.js <his title .blend> <game> [--fill <watts>]
   ⭐ HIS 11-27: "I added an animated game text for Game four" — his Blender title, rendered to the transparent frames the
   Tournament Board's opening card plays in place of "GAME N" (broadcast.gd `_title_frames`): <board>/titles/<game>/.
   A game with no folder keeps the gold text. Then `npm run wc -- --render` as on any game day.
   ⚠ The folder is cleared of its old t_*.png first: the board reads frames until the first gap, so a shorter new title
     would otherwise play the old one's tail. Frames are renumbered from 1 whatever the scene's first frame is.
   ⚠ The board plays them at 24 fps (TITLE_FPS); a scene at another rate is flagged, not resampled.
   Overrides: BLENDER=path/to/blender.exe  CHESSWILD_BOARD=… */
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const args = process.argv.slice(2);
const blend = args[0], game = parseInt(args[1], 10);
const fi = args.indexOf('--fill'), fill = fi > 0 ? parseFloat(args[fi + 1]) || 0 : 0;
if (!blend || !fs.existsSync(blend) || !(game > 0)) {
  console.error('usage: node tests/wc-title.js <title.blend> <game> [--fill <watts>]');
  process.exit(2);
}
const BOARD = process.env.CHESSWILD_BOARD || 'C:/Users/Nate/Documents/chesswild-board';
const dir = path.join(BOARD, 'titles', String(game));

function findBlender() {
  if (process.env.BLENDER) return process.env.BLENDER;
  const base = 'C:/Program Files/Blender Foundation';
  const vers = fs.existsSync(base) ? fs.readdirSync(base).filter((d) => /^Blender \d/.test(d)) : [];
  vers.sort((a, b) => parseFloat(b.slice(8)) - parseFloat(a.slice(8)));
  for (const v of vers) {
    const exe = path.join(base, v, 'blender.exe');
    if (fs.existsSync(exe)) return exe;
  }
  throw new Error('Blender not found — set BLENDER=path/to/blender.exe');
}

fs.mkdirSync(dir, { recursive: true });
for (const f of fs.readdirSync(dir)) if (/^t_\d+\.png$/.test(f)) fs.unlinkSync(path.join(dir, f));
const t0 = Date.now();
const log = execFileSync(findBlender(), ['-b', path.resolve(blend), '--factory-startup', '--python',
  path.join(__dirname, 'blender-title.py'), '--', dir, String(fill)], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const ok = (log.match(/^TITLE_OK .*$/m) || [''])[0];
const frames = fs.readdirSync(dir).filter((f) => /^t_\d+\.png$/.test(f)).sort((a, b) => parseInt(a.slice(2), 10) - parseInt(b.slice(2), 10));
if (!ok || !frames.length) {
  console.error('✗ the title did not render\n' + log.slice(-1500));
  process.exit(1);
}
frames.forEach((f, i) => fs.renameSync(path.join(dir, f), path.join(dir, '~' + i + '.png')));
frames.forEach((f, i) => fs.renameSync(path.join(dir, '~' + i + '.png'), path.join(dir, 't_' + String(i + 1).padStart(4, '0') + '.png')));
const fps = parseFloat((ok.match(/fps=([\d.]+)/) || [])[1]);
console.log('✓ ' + path.basename(blend) + ' → ' + dir + '  ' + frames.length + ' frames, ' + ok.slice(9) + ', '
  + ((Date.now() - t0) / 1000).toFixed(0) + ' s');
if (fps !== 24) console.log('  ⚠ the scene runs at ' + fps + ' fps; the board plays titles at 24 (broadcast.gd TITLE_FPS)');
