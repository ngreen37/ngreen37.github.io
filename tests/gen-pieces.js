/* gen-pieces.js — Blender piece saves → the Tournament Board's art.  Run:  npm run gen:pieces
 * For each row in PIECES, takes the highest-numbered save and renders a 512x512 RGBA PNG
 * through headless Blender, into the Godot project's pieces/ folder and the private mirror.
 * ⭐ HIS APPROVED LAPTOP FILE FIRST (his 11-24: bishop2, knight3, and the latest pawn): the save
 * named in APPROVED, from ~/Desktop/Blender_Laptop, is that piece for BOTH sides, rendered twice
 * in the 3D board's two materials (LIVERY), as Checker Town's gen_pieces3d.js makes it. Else his
 * September <side><letter>_N.blend in PIECE_DIR (default ~/Desktop/Personal/Blender/Pieces;
 * wp_0.2 beats wp_0.1), in its own material.
 * A row with no .blend yet is a note, not a failure — board_view.gd draws a lettered disc
 * for anything missing and names it in a warning, so a half-finished set is a working board.
 * Overrides: PIECE_DIR=…  LAPTOP_DIR=…  BLENDER=path/to/blender.exe  CHESSWILD_BOARD=…  ELEV=15 */
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const PIECE_DIR = process.env.PIECE_DIR
  || path.join(os.homedir(), 'Desktop', 'Personal', 'Blender', 'Pieces');
const LAPTOP = process.env.LAPTOP_DIR || path.join(os.homedir(), 'Desktop', 'Blender_Laptop');
const WORD = { K: 'king', Q: 'queen', B: 'bishop', N: 'knight', R: 'rook', P: 'pawn' };
// ⛑⛑ A LAPTOP SAVE SHIPS ONLY ONCE HE HAS OKED IT, BY NAME (his 11-25: "I made a queen but don't
// add it yet"). His numbers count iterations: Queen1, Queen2 and King1 sat numbered, unfinished.
// Checker Town's tests/gen_pieces3d.js keeps the same list; test:board3d holds them equal.
const APPROVED = { P: 'pawn4', B: 'bishop2', N: 'knight3', R: 'rook1' };
// ⚠ his knight looks along Blender +Y, straight at this camera: head-on it is a slab with
// notches, a rook. Turned, it shows its profile facing left, as a printed diagram's does.
const TURN = { N: 90 };
// Checker Town's Board3D.LIGHT and DARK (his September bishops' materials), linear as
// Blender holds them — test:board3d holds all three copies equal.
const LIVERY = {
  w: [0.8000229597091675, 0.7936021089553833, 0.45607203245162964],
  b: [0.010219833813607693, 0.0032667412888258696, 0.0024057396221905947],
};

const BOARD = process.env.CHESSWILD_BOARD || 'C:/Users/Nate/Documents/chesswild-board';
const MIRROR = path.join(ROOT, 'private/docs/godot/tournament_board');

// ⚠⚠ TWO GAMES EAT THESE PNGS, and the second one arrived four weeks after the first.
// The Tournament Board fits each frame to a square; the Assembly (piece_art.gd) reads the
// floor line out of the frame and stands the piece on it. Same bytes, same folder name, two
// readings — which is only safe because the camera is a constant. [[accuracy-above-all]]
const TOWN = process.env.CHECKER_TOWN || 'C:/Users/Nate/Documents/checker-town';

// ⚠⚠ THE CAMERA NEVER MOVES; THIS COLUMN IS WHAT MAKES A PAWN SHORTER THAN A KING.
// piece_node.gd fits the LONGEST side of each texture to the square, so art cropped to each
// piece's own bounding box comes out all one height — see the README's correction. Heights
// are canon units, measured off the May 4 script-built set in PIECE_DIR (King.blend is 1.430
// tall, Rook.blend 0.860), which is the only proportion system on disk. They are NOT read
// from his new files: he models each piece in a fresh scene at whatever scale is handy, and
// wp_0.1 is 3.148 units tall standing on z=-1. The render script rescales to this number.
// ⚠ EXCEPT THE ROOK: the May rook's 0.860 is shorter than the pawn, and his rook1 at that height
// read as a lesser piece than its own pawn. 1.070 was picked off the board at 0.86 / 1.00 / 1.07 / 1.14 (11-26).
// Checker Town's gen_pieces3d.js HEIGHT is the same column; test:board3d holds them equal.
const PIECES = [
  { out: 'wK', src: 'wk', h: 1.430 },
  { out: 'wQ', src: 'wq', h: 1.300 },
  { out: 'wB', src: 'wb', h: 1.340 },
  { out: 'wN', src: 'wn', h: 1.278 },
  { out: 'wR', src: 'wr', h: 1.070 },
  { out: 'wP', src: 'wp', h: 0.970 },
  { out: 'bK', src: 'bk', h: 1.430 },
  { out: 'bQ', src: 'bq', h: 1.300 },
  { out: 'bB', src: 'bb', h: 1.340 },
  { out: 'bN', src: 'bn', h: 1.278 },
  { out: 'bR', src: 'br', h: 1.070 },
  { out: 'bP', src: 'bp', h: 0.970 },
];

const ELEV = process.env.ELEV || '15';

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

// ⚠⚠ THE VERSION IS DOTTED, NOT DECIMAL — the same trap gen-models.js documents, where
// parseFloat read 0.10 as smaller than 0.9 and his newest Nate save silently never shipped.
// It bites harder here: the set on disk already mixes schemes (wp_0.1 is [0,1], bp_01 is
// [1]), so the picked version is printed on every line rather than assumed.
function newestSave(name, dir = PIECE_DIR) {
  if (!fs.existsSync(dir)) return null;
  const re = new RegExp('^' + name + '(?:_?(\\d+(?:\\.\\d+)*))?\\.blend$', 'i');
  const ver = (v) => (v || '0').split('.').map(Number);
  const cmp = (a, b) => {
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      const d = (b[i] || 0) - (a[i] || 0);
      if (d) return d;
    }
    return 0;
  };
  const hits = fs.readdirSync(dir)
    .map(f => ({ f, m: f.match(re) })).filter(x => x.m)
    .map(x => ({ f: x.f, v: ver(x.m[1]), t: fs.statSync(path.join(dir, x.f)).mtimeMs }))
    .sort((a, b) => cmp(a.v, b.v) || b.t - a.t);
  return hits.length ? { file: path.join(dir, hits[0].f), v: hits[0].v.join('.') } : null;
}

// ⚠⚠ 512px OF PIECE INTO A 91px SQUARE, AND GODOT IMPORTS PNGS WITHOUT MIPMAPS. Plain
// linear sampling reads four texels of a five-fold minification, so the crown crawls as the
// camera walks — and the editor writes `mipmaps/generate=false` again for every new piece,
// silently, so the knight would arrive worse-looking than the pawn with nothing said.
// Godot names the cache file after the md5 of the RESOURCE path, and fills in a uid itself on
// the next import, so the two lines it really needs are computable here.
function importFile(dir, name) {
  const res = `res://pieces/${name}.png`;
  const ctex = `res://.godot/imported/${name}.png-`
    + crypto.createHash('md5').update(res).digest('hex') + '.ctex';
  return `[remap]

importer="texture"
type="CompressedTexture2D"
path="${ctex}"
metadata={
"vram_texture": false
}

[deps]

source_file="${res}"
dest_files=["${ctex}"]

[params]

compress/mode=0
compress/high_quality=false
compress/lossy_quality=0.7
compress/hdr_compression=1
compress/normal_map=0
compress/channel_pack=0
mipmaps/generate=true
mipmaps/limit=-1
roughness/mode=0
roughness/src_normal=""
process/fix_alpha_border=true
process/premult_alpha=false
process/normal_map_invert_y=false
process/hdr_as_srgb=false
process/hdr_clamp_exposure=false
process/size_limit=0
detect_3d/compress_to=1
`;
}

// Writes the import file beside a freshly placed PNG, or turns mipmaps back on (and sets the
// size limit) in the one that is already there. ⚠ It reports rather than asserting: Godot
// still has to run before the .ctex exists, and until it does piece_art.gd draws the piece
// instead. Returns a note when it changed something.
// ⭐ HIS 11-24 (the size review): Checker Town keeps its pieces at 256px — drawn at most ~157px
// on a 1080p screen, ~314 on 4K — a third of the 512's bytes. The Tournament Board keeps 512:
// it renders a video, where size costs nothing and sharpness is the point.
function mipmap(dir, name, limit) {
  const f = path.join(dir, 'pieces', name + '.png.import');
  if (!fs.existsSync(f)) {
    fs.writeFileSync(f, importFile(dir, name).replace(/^process\/size_limit=0$/m, 'process/size_limit=' + limit));
    return 'new .import';
  }
  const was = fs.readFileSync(f, 'utf8');
  const now = was.replace(/^mipmaps\/generate=false$/m, 'mipmaps/generate=true')
    .replace(/^process\/size_limit=\d+$/m, 'process/size_limit=' + limit);
  if (now === was) return '';
  fs.writeFileSync(f, now);
  return 'import settings set';
}

// the same bytes, in the place Godot loads from. A missing project is a note and not a
// failure: this has to run on a machine with no Tournament Board checked out.
function place(png, name) {
  const notes = [];
  for (const [label, dir, limit] of [['board', BOARD, 0], ['mirror', MIRROR, 0], ['town', TOWN, 256]]) {
    if (!fs.existsSync(dir)) { notes.push(`(no ${label} at ${dir})`); continue; }
    const dest = path.join(dir, 'pieces', name + '.png');
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(png, dest);
    const m = mipmap(dir, name, limit);
    notes.push(`→ ${label}${m ? ' (' + m + ')' : ''}`);
  }
  return notes.join('  ');
}

if (!fs.existsSync(PIECE_DIR)) {
  console.error(`✗ no piece folder at ${PIECE_DIR} — set PIECE_DIR=…`);
  process.exit(1);
}
const blender = findBlender();
const stage = path.join(os.tmpdir(), 'cw-pieces');
fs.mkdirSync(stage, { recursive: true });

// `npm run gen:pieces -- wP bP` renders only those; no argument renders the whole set.
// ⚠ A .blend he is still standing in gets picked up the moment it is saved, and a render
// is a decision about what the board looks like — so a half-finished piece ships because
// the file happened to exist. The filter is how you say which ones you meant.
const only = process.argv.slice(2).map(s => s.toLowerCase());

let done = 0, failed = 0;
const waiting = [];
// his saves not yet OKed: named, never rendered
const held = fs.existsSync(LAPTOP) ? fs.readdirSync(LAPTOP).filter((f) =>
  new RegExp('^(' + Object.values(WORD).join('|') + ')_?\\d+(\\.\\d+)*\\.blend$', 'i').test(f)
  && !Object.values(APPROVED).some((a) => a.toLowerCase() + '.blend' === f.toLowerCase())) : [];
if (held.length) console.log('· waiting for his OK (APPROVED), not rendered: ' + held.join(' '));
for (const p of PIECES) {
  if (only.length && !only.includes(p.out.toLowerCase())) continue;
  const L = p.out[1];
  const okd = APPROVED[L] ? path.join(LAPTOP, APPROVED[L] + '.blend') : null;
  if (okd && !fs.existsSync(okd)) { console.error(`✗ ${APPROVED[L]}.blend is approved but not in ${LAPTOP}`); failed++; continue; }
  const lap = okd ? { file: okd, v: (APPROVED[L].match(/\d+(?:\.\d+)*$/) || ['0'])[0] } : null;
  const src = lap || newestSave(p.src);
  if (!src) { waiting.push(p.out); continue; }
  const png = path.join(stage, p.out + '.png');
  const dress = lap ? [String(TURN[L] || 0), LIVERY[p.out[0]].concat(0.5).join(',')] : [];
  const log = execFileSync(blender, ['-b', src.file, '--factory-startup', '--python',
    path.join(__dirname, 'blender-piece.py'), '--', png, String(p.h), ELEV, ...dress],
    { encoding: 'utf8' });
  // ⚠ a failed render still exits 0 — Blender prints the traceback and says nothing else
  const ok = (log.match(/^PIECE_OK .*$/m) || [''])[0];
  const clip = (log.match(/^PIECE_CLIP .*$/m) || [''])[0];
  if (!ok || !fs.existsSync(png)) {
    console.error(`✗ ${p.out}: render failed\n${log.slice(-1200)}`);
    failed++;
    continue;
  }
  if (clip) console.error(`  ⚠ ${p.out} is cropped by the frame — ${clip.slice(11)}`);
  const kb = (fs.statSync(png).size / 1024).toFixed(1);
  console.log(`✓ ${path.basename(src.file)} (v${src.v}${lap ? ', in ' + (p.out[0] === 'w' ? 'LIGHT' : 'DARK') : ''}) → ${p.out}.png ${kb} KB  `
    + `${ok.split(' ').slice(2).join(' ')}\n    ${place(png, p.out)}`);
  done++;
}
// ⚠⚠ piece_art.gd COPIES FOUR OF THESE NUMBERS AND GDSCRIPT CANNOT READ EITHER FILE. It
// works out from them where the floor crosses the frame and how tall a canon unit is, so a
// render at a different elevation against a stale copy floats every piece in the Assembly a
// tenth of a square — on every square, with nothing printed. This is the one run that can
// invalidate the copy, so it is the run that checks it. [[audit-numbers-can-be-wrong]]
function checkPieceArt() {
  if (!fs.existsSync(TOWN)) return 0;
  const gd = path.join(TOWN, 'art', 'piece_art.gd');   // ⚠ in art/ since the town's folders-by-feature move (10-16)
  if (!fs.existsSync(gd)) {
    console.error(`✗ no piece_art.gd in ${TOWN} — the Assembly stands its pieces on these numbers`);
    return 1;
  }
  const py = fs.readFileSync(path.join(__dirname, 'blender-piece.py'), 'utf8');
  const num = (src, re) => { const m = src.match(re); return m ? parseFloat(m[1]) : NaN; };
  const want = {
    ORTHO: num(py, /^ORTHO\s*=\s*([\d.]+)/m),
    AIM_Z: num(py, /^AIM_Z\s*=\s*([\d.]+)/m),
    ELEV: parseFloat(ELEV),
    KING: (PIECES.find((p) => p.out === 'wK') || {}).h,
  };
  const src = fs.readFileSync(gd, 'utf8');
  let bad = 0;
  for (const [k, v] of Object.entries(want)) {
    const got = num(src, new RegExp(String.raw`^const ${k}\s*:=\s*([\d.]+)`, 'm'));
    // ⚠ NaN LOSES EVERY COMPARISON, so `> 1e-9` on a constant this cannot find passes in
    // silence — which is the one outcome that makes the whole check worthless.
    if (!(Math.abs(got - v) <= 1e-9)) {
      console.error(`✗ piece_art.gd ${k} = ${got}, this render used ${v}`);
      bad++;
    }
  }
  if (bad) console.error(`  Every piece in the Assembly stands on those — ${gd}`);
  return bad;
}
failed += checkPieceArt();

if (waiting.length) {
  console.log(`\n· not approved yet, drawing lettered discs: ${waiting.join(' ')}`);
  console.log(`  a save in ${LAPTOP} ships once it is named in APPROVED (here and in Checker Town's gen_pieces3d.js)`);
}
console.log(`\n${done}/${PIECES.length} rendered at ${ELEV}° elevation.`);
process.exit(failed ? 1 : 0);
