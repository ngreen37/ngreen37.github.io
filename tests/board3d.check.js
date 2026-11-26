// The chess rooms' tilted 3D board and TV cuts, as Checker Town's tables have them (assets/js/pjcc-board3d.js; his
// 11-04 "add them there too"): its numbers against the game's, then played in a real browser on tests/fixtures/
// board3d.html, a room with Park Tables' board.
// Locks in:
//   - every number the game has (the tilt, the lens, the cuts, the card's half second, his pieces' heights)
//   - every square pressed where it is drawn: at rest, in a cut, played as Black, on a phone; a real click on the 3D
//     board plays the room's own move
//   - a capture knocks the taken piece aside (en passant's pawn where it stood), and earns a close-up; a check pushes
//     in on the king and the room's clock stands still through it; a mate circles, its card held half a second at most
//   - a press in a cut lands where the finger was, and ends the cut; flat, the board itself takes the camera, clipped
//     to its frame; V flips the view; Reduce Motion has no cuts; with no 3D the board is flat and still cut
//   - the woods are the flat board's own colors, lit
//   run:  npm run test:board3d
const http = require('http'), fs = require('fs'), path = require('path');
const puppeteer = require('puppeteer-core');
const { findChrome, report } = require('./harness');

const ROOT = path.join(__dirname, '..');
const GAME = process.env.CHECKERTOWN_PROJECT || 'C:/Users/Nate/Documents/checker-town';
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.glb': 'model/gltf-binary', '.css': 'text/css' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [], errors = [];
const ok = (cond, msg) => results.push({ pass: !!cond, msg });

/* ── 1. the site's numbers are the game's ── */
const SRC = fs.readFileSync(path.join(ROOT, 'assets/js/pjcc-board3d.js'), 'utf8');
const gd = (f) => (fs.existsSync(path.join(GAME, f)) ? fs.readFileSync(path.join(GAME, f), 'utf8') : '');
const b3gd = gd('ui/board3d.gd'), ctgd = gd('ui/chess_table.gd');
if (b3gd && ctgd) {
  const js = (n) => +((new RegExp('var ' + n + ' = ([\\d.]+);').exec(SRC) || [])[1]);
  const g = (src, n) => +((new RegExp('const ' + n + ' := ([\\d.]+)').exec(src) || [])[1]);
  const off = ['TILT', 'FOV', 'EDGE', 'TALLEST', 'SIZE', 'ARC', 'TOPPLE'].filter((n) => !(js(n) > 0 && js(n) === g(b3gd, n)))
    .concat(['SLIDE', 'CARD_AFTER'].filter((n) => !(js(n) > 0 && js(n) === g(ctgd, n))));
  for (const k of ['capture', 'check', 'mate']) {
    const a = (new RegExp(k + ': \\{ secs: ([\\d.]+), zoom: ([\\d.]+), push: ([\\d.]+), turn: ([\\d.]+), circle: ([\\d.]+) \\}').exec(SRC) || []).slice(1).map(Number);
    const b = (new RegExp('"' + k + '": \\{ "secs": ([\\d.]+), "zoom": ([\\d.]+), "push": ([\\d.]+), "turn": ([\\d.]+), "circle": ([\\d.]+) \\}').exec(ctgd) || []).slice(1).map(Number);
    if (a.length !== 5 || a.join() !== b.join()) off.push('CUTS.' + k);
  }
  /* ⚠ CUT FOUR TIMES, HIS EACH TIME: a capture's close-up on 11-11, every close-up on 11-20, again on 11-23 ("cut the
     zoom-in effect again by an additional 50%") and on 11-24 ("cut the zoom-in effect in campaign another 33%"): how far
     each comes in past 1, flat and in 3D */
  {
    const cut = (k) => (new RegExp(k + ': \\{ secs: [\\d.]+, zoom: ([\\d.]+), push: ([\\d.]+),').exec(SRC) || []).slice(1).map(Number);
    const cap = cut('capture'), chk = cut('check'), mt = cut('mate');
    ok(cap.join() === '1.025125,1.05234375' && chk.join() === '1.03685,1.0879375' && mt.join() === '1.067,1.125625' &&
       /this\.dist \/ \(1 \+ \(push - 1\) \* a\)/.test(SRC) && /en\.c\.push\)/.test(SRC),
       '⭐ his 11-24: every close-up comes in a third less far than on 11-23, flat and in 3D  [' + [cap, chk, mt].map((c) => c.join(' / ')).join(' · ') + ']');
  }
  for (const L of ['K', 'Q', 'B', 'N', 'R', 'P']) {
    const a = +((new RegExp('\\b' + L + ': ([\\d.]+)').exec((/var TALL = \{([^}]*)\}/.exec(SRC) || [])[1] || '') || [])[1]);
    const b = +((new RegExp('"' + L + '": ([\\d.]+)').exec(b3gd) || [])[1]);
    if (!(a > 0 && a === b)) off.push('TALL.' + L);
  }
  ok(off.length === 0, 'every number is the game\'s: the tilt, the lens, the fit, the cuts, the card\'s half second, his pieces\' heights  [' + (off.join(' ') || 'all equal') + ']');
  /* ⭐ each is one file for both sides: his pawn that bows in defeat (11-18), his bishop and knight (11-24) */
  const glbOff = ['P', 'B', 'N', 'K', 'Q', 'R'].filter((c) => {
    const a = path.join(ROOT, 'assets/models/pieces3d', c + '.glb'), b = path.join(GAME, 'pieces3d', c + '.glb');
    return !fs.existsSync(a) || !fs.existsSync(b) || !fs.readFileSync(a).equals(fs.readFileSync(b));
  });
  ok(glbOff.length === 0, 'his six pieces are the game\'s own, byte for byte (npm run gen:pieces3d)  [' + (glbOff.join(' ') || 'all six') + ']');
  /* ⚠ THE TWO MATERIALS EVERY PIECE WEARS (his September bishops'): the lens's LIGHT and DARK are the game's, digit for digit */
  const linJs = (n) => ((new RegExp('var ' + n + ' = \\[([^\\]]*)\\];').exec(SRC) || [])[1] || '').split(',').map(Number);
  const linGd = (n) => ((new RegExp('const ' + n + ' := Color\\(([^)]*)\\)').exec(b3gd) || [])[1] || '').split(',').map(Number);
  const skinOff = ['LIGHT', 'DARK'].filter((n) => !(linJs(n).length === 3 && linJs(n).every((v, i) => v > 0 && v === linGd(n)[i])));
  ok(skinOff.length === 0 && /new T\.Color\(c\[0\], c\[1\], c\[2\]\), roughness: 0\.5, metalness: 0, side: 2/.test(SRC),
     'every piece wears the game\'s two materials, linear, double-sided, roughness 0.5  [' + (skinOff.join(' ') || 'LIGHT DARK') + ']');
  /* ⭐ HIS 11-24 ("the smooth with half of the faces looks just fine"): every piece ships smooth, with no texture
     coordinates and under the budget; the YouTube board's render prepares it with the same three numbers */
  const py2d = fs.readFileSync(path.join(ROOT, 'tests/blender-piece.py'), 'utf8'), py3d = gd('tests/blender_glb.py');
  const pyExp = fs.readFileSync(path.join(ROOT, 'tests/blender-export.py'), 'utf8');   // the props' export (his checker)
  const pyn = (src, n) => +((new RegExp('^' + n + ' = ([\\d.]+)', 'm').exec(src) || [])[1]);
  const budget = pyn(py3d, 'BUDGET');
  const heavy = ['SMOOTH_ANGLE', 'BUDGET', 'FLOOR'].filter((n) => !(pyn(py2d, n) > 0 && pyn(py2d, n) === pyn(py3d, n)))
    .concat(['BUDGET', 'FLOOR'].filter((n) => !(pyn(pyExp, n) > 0 && pyn(pyExp, n) === pyn(py3d, n))).map((n) => 'export.' + n))
    .concat(['P', 'B', 'N', 'K', 'Q', 'R'].filter((c) => {
      const b = fs.readFileSync(path.join(ROOT, 'assets/models/pieces3d', c + '.glb'));
      const j = JSON.parse(b.slice(20, 20 + b.readUInt32LE(12)).toString());
      let t = 0, uv = false;
      for (const m of j.meshes) for (const p of m.primitives) { t += j.accessors[p.indices].count / 3; uv = uv || p.attributes.TEXCOORD_0 != null; }
      return uv || !(t <= budget);
    }));
  /* ⛑ HIS OK FIRST (11-25: "I made a queen but don't add it yet"): the YouTube board and the 3D boards ship the same
     approved saves, and nothing else of his laptop's */
  const appr = (src) => ((/const APPROVED = \{([^}]*)\};/.exec(src) || [])[1] || '').replace(/\s/g, '');
  const gp2 = fs.readFileSync(path.join(ROOT, 'tests/gen-pieces.js'), 'utf8'), gp3d = gd('tests/gen_pieces3d.js');
  ok(appr(gp2) !== '' && appr(gp2) === appr(gp3d),
     '⛑ his laptop saves ship only once he OKs them by name, the YouTube board and the 3D boards alike  [' + (appr(gp2) || 'no list') + ']');
  /* ⚠ 11-26: his rook at the May set's 0.860 stood shorter than its own pawn, and the height moved in two files */
  const tall2 = {}, tall3 = {};
  for (const m of gp2.matchAll(/\{ out: '([wb])([KQBNRP])', src: '[wb][kqbnrp]', h: ([\d.]+) \}/g)) tall2[m[1] + m[2]] = +m[3];
  for (const m of (((/const HEIGHT = \{([^}]*)\};/.exec(gp3d) || [])[1]) || '').matchAll(/([KQBNRP]): ([\d.]+)/g)) tall3[m[1]] = +m[2];
  const tallOff = ['K', 'Q', 'B', 'N', 'R', 'P'].filter((c) => !(tall3[c] > 0 && tall2['w' + c] === tall3[c] && tall2['b' + c] === tall3[c]));
  ok(tallOff.length === 0 && tall3.R > tall3.P,
     'every piece stands as tall on the YouTube board as on the 3D boards, and the rook over its pawn  [' + (tallOff.join(' ') || 'R ' + tall3.R + ' over P ' + tall3.P) + ']');
  ok(heavy.length === 0 && /export_texcoords=False/.test(py3d) && /shade_smooth\(\)/.test(py2d) && /shade_smooth\(\)/.test(py3d),
     '⭐ every piece ships smooth, with no texture coordinates and at most ' + budget + ' triangles, the YouTube board\'s alike  [' + (heavy.join(' ') || 'all six') + ']');
  const pawn = fs.readFileSync(path.join(ROOT, 'assets/models/pieces3d/P.glb'));
  const pj = JSON.parse(pawn.slice(20, 20 + pawn.readUInt32LE(12)).toString());
  ok((pj.skins || []).length === 1 && (pj.animations || []).length === 1 && pj.animations[0].channels.length > 0,
     '⭐ his pawn is rigged and carries its bow (a skin and one animation)  [' + ((pj.animations || [])[0] || {}).name + ']');
} else ok(true, 'the game is not checked out here: its numbers are not compared');
/* ── 1b. whoever sits across, the room's light and the judge are the game's (his view ideas #1, #4, #5) ── */
if (b3gd) {
  const seatGd = gd('ui/table_seat.gd'), judgeGd = gd('games/chess/table_judge.gd'), pplGd = gd('people/people_sheet.gd'), dogGd = gd('people/dog.gd');
  const gn = (src, n) => +((new RegExp('const ' + n + ' := ([\\d.]+)').exec(src) || [])[1]);
  const jn = (n) => +((new RegExp('var [^;]*\\b' + n + ' = ([\\d.]+)').exec(SRC) || [])[1]);
  const off2 = [['SEAT_TALL', seatGd, 'TALL'], ['SEAT_BACK', seatGd, 'BACK'], ['SEAT_TOP', seatGd, 'TOP'], ['SEAT_WAIST', seatGd, 'WAIST'],
    ['SEAT_KEEP', seatGd, 'KEEP'], ['SEAT_STRIPS', seatGd, 'STRIPS'], ['LEAN', seatGd, 'LEAN'], ['LEAN_SECS', seatGd, 'LEAN_SECS'],
    ['DOG_UP', seatGd, 'DOG_UP'], ['MOOD_FULL', ctgd, 'MOOD_FULL'], ['MOOD_RATE', ctgd, 'MOOD_RATE'], ['MOOD_GLOW', ctgd, 'MOOD_GLOW'],
    ['MOOD_LAMP', b3gd, 'MOOD_LAMP'], ['SWING', judgeGd, 'SWING'], ['KING_AT', judgeGd, 'KING_AT'], ['SIT_TALL', dogGd, 'SIT_TALL'],
    ['FRONT', pplGd, 'FRONT'], ['IDLES', pplGd, 'IDLES']].filter(([j, src, n]) => !(Number.isFinite(jn(j)) && jn(j) === gn(src, n))).map((x) => x[0]);
  const arr = (txt) => (txt || '').split(',').map((x) => x.trim()).filter(Boolean).map(Number);
  ['frown', 'smile'].forEach((k) => {
    const a = arr(((new RegExp(k + ': \\[([^\\]]*)\\]')).exec((/var REACT = \{([^}]*)\}/.exec(SRC) || [])[1] || '') || [])[1]);
    const b = arr(((new RegExp('"' + k + '": \\[([^\\]]*)\\]')).exec(seatGd) || [])[1]);
    if (a.length !== 5 || a.join() !== b.join()) off2.push('REACT.' + k);
  });
  ['GOLD', 'COLD'].forEach((k) => {
    const a = (new RegExp("MOOD_" + k + " = '([0-9a-f]{6})'").exec(SRC) || [])[1], b = (new RegExp('const MOOD_' + k + ' := Color\\("([0-9a-f]{6})"\\)').exec(b3gd) || [])[1];
    if (!a || a !== b) off2.push('MOOD_' + k);
  });
  const vjs = (/var VAL = \{([^}]*)\}/.exec(SRC) || [])[1] || '', vgd = (/const VAL := \{([^}]*)\}/.exec(judgeGd) || [])[1] || '';
  if (['p', 'n', 'b', 'r', 'q', 'k'].some((p) => +((new RegExp('\\b' + p + ': (\\d+)').exec(vjs) || [])[1]) !== +((new RegExp('"' + p + '": (\\d+)').exec(vgd) || [])[1]))) off2.push('VAL');
  ok(off2.length === 0, 'whoever sits across, the room\'s light and the judge are the game\'s numbers: the seat, the lean, the dog\'s size, the answers (his placeholders), the gold and the cold, the swing  [' + (off2.join(' ') || 'all') + ']');
  // their looks: every color table the town dresses people from, and the dogs' coats
  const hexes = (txt) => [...(txt || '').matchAll(/['"]?([\w ]+?)['"]?: ['"]#?([0-9a-f]{6})['"]/g)].map((m) => m[1].trim() + '=' + m[2]).sort().join(' ');
  const lookOff = [];
  [['AURA', 'AURA'], ['OWN', 'OWN']].forEach(([j, g2]) => {
    const a = hexes((new RegExp('var ' + j + ' = \\{([^}]*)\\}').exec(SRC) || [])[1]), b = hexes((new RegExp('const ' + g2 + ' := \\{([^}]*)\\}').exec(pplGd) || [])[1]);
    if (!a || a !== b) lookOff.push(j);
  });
  const hj = ((/var HAIRS = \[([^\]]*)\]/.exec(SRC) || [])[1] || '').replace(/['"\s]/g, ''), hg = ((/const HAIRS := \[([^\]]*)\]/.exec(pplGd) || [])[1] || '').replace(/['"\s]/g, '');
  if (!hj || hj !== hg) lookOff.push('HAIRS');
  [['WIDE', 'WIDE'], ['TALLB', 'TALL']].forEach(([j, g2]) => {
    const a = ((new RegExp('\\b' + j + ' = \\[([^\\]]*)\\]').exec(SRC) || [])[1] || '').replace(/\s/g, ''), b = ((new RegExp('const ' + g2 + ' := Vector2\\(([^)]*)\\)').exec(pplGd) || [])[1] || '').replace(/\s/g, '');
    if (!a || a.split(',').map(Number).join() !== b.split(',').map(Number).join()) lookOff.push(j);
  });
  ['Princess', 'Milo', 'Argus'].forEach((d) => {
    const a = (new RegExp(d + ": \\['([0-9a-f]{6})', '([0-9a-f]{6})', '([0-9a-f]{6})', (true|false)\\]").exec(SRC) || []).slice(1).join();
    const b = (new RegExp('"' + d + '": +\\[Color\\("([0-9a-f]{6})"\\), Color\\("([0-9a-f]{6})"\\), Color\\("([0-9a-f]{6})"\\), (true|false)\\]').exec(dogGd) || []).slice(1).join();
    if (!a || a !== b) lookOff.push('COATS.' + d);
  });
  ok(lookOff.length === 0, '…dressed from the town\'s own tables (the bench\'s colors, their own, the hairs, the builds) and the dogs in their own coats  [' + (lookOff.join(' ') || 'all') + ']');
  const pf = path.join(ROOT, 'assets/models/people_front.png'), pg = path.join(GAME, 'art/people_front.png');
  ok(fs.existsSync(pf) && fs.existsSync(pg) && fs.readFileSync(pf).equals(fs.readFileSync(pg)), '…and drawn from the game\'s own picture, byte for byte (npm run gen:people)');
}
const gen = fs.readFileSync(path.join(ROOT, 'tests/gen-three.js'), 'utf8');
const exported = ((/const EXPORTS = \[([\s\S]*?)\];/.exec(gen) || [])[1] || '').match(/'(\w+)'/g).map((s) => s.slice(1, -1)).concat('GLTFLoader');
const used = [...new Set([...SRC.matchAll(/\bT\.([A-Z]\w+)/g)].map((m) => m[1]))];
const missing = used.filter((n) => !exported.includes(n));
ok(used.length >= 10 && missing.length === 0, 'every three.js class it uses is in the site\'s bundle  [' + (missing.join(' ') || used.length + ' classes') + ']');

(async () => {
  const exe = findChrome();
  if (!exe) { console.error('No Chrome/Edge found. Install one or set CHROME_PATH.'); process.exit(2); }
  const server = http.createServer((req, res) => {
    const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
    if (!f.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
    fs.readFile(f, (e, b) => {
      if (e) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }); res.end(b);
    });
  });
  await new Promise((r) => server.listen(0, r));
  const URL = 'http://localhost:' + server.address().port + '/tests/fixtures/board3d.html';
  const browser = await puppeteer.launch({ executablePath: exe, headless: 'new',
    args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const open = async (opts = {}) => {
    const page = await browser.newPage();
    page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
    // ⚠ the blocked bundle's own failure is the point of that case, not an error
    page.on('console', (m) => {
      if (m.type() === 'error' && !(opts.block && /Failed to load resource/.test(m.text()))) errors.push('console: ' + m.text().slice(0, 160));
    });
    await page.setViewport(opts.view || { width: 560, height: 700 });
    if (opts.calm) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    if (opts.block) {
      await page.setRequestInterception(true);
      page.on('request', (q) => (q.url().includes(opts.block) ? q.abort() : q.continue()));
    }
    await page.goto(URL, { waitUntil: 'load', timeout: 20000 });
    await page.evaluate(() => { try { localStorage.removeItem('pjcc.board.flat'); } catch (e) {} });
    if (!opts.block) for (let i = 0; i < 150 && !(await page.evaluate(() => T3.b3.up())); i++) await sleep(100);
    await sleep(300);
    return page;
  };
  const tapMap = (page) => page.evaluate(() => {
    const out = [];
    for (let i = 0; i < 64; i++) { const p = T3.b3.pointOf(i), g = T3.b3.squareAt(p[0], p[1]); if (g !== i) out.push(i + '->' + g); }
    return out;
  });
  const click = async (page, sq) => { const p = await page.evaluate((i) => T3.b3.pointOf(i), sq); await page.mouse.click(p[0], p[1]); };
  const SQ = (n) => (8 - +n[1]) * 8 + (n.charCodeAt(0) - 97);
  /* ⚠ A CUT IS POLLED FOR, NEVER SAMPLED: it begins when the move's slide lands, 270–340 ms after the move on a busy machine
     (measured 11-18), so a look at 240, 260 or 330 ms caught it some days and not others */
  const cutOf = async (page, want) => {
    let k = '';
    for (let t = 0; t < 60 && k !== want; t++) { await sleep(25); k = await page.evaluate(() => T3.b3.cutKind()); }
    return k;
  };
  try {
    /* ── 2. up, over the board, every square where it is drawn, a real click plays ── */
    let page = await open();
    const up = await page.evaluate(() => {
      const c = document.querySelector('canvas.pjcc-board3d'), b = document.getElementById('board');
      if (!c) return null;
      const a = c.getBoundingClientRect(), r = b.getBoundingClientRect();
      return { on: T3.b3.on(), same: Math.abs(a.left - r.left) < 1 && Math.abs(a.top - r.top) < 1 && Math.abs(a.width - r.width) < 1,
        hidden: b.classList.contains('pjcc-b3-on'), op: getComputedStyle(b.children[0]).opacity, focus: b.children[0].tabIndex >= 0 };
    });
    ok(up && up.on && up.same && up.hidden && up.op === '0' && up.focus,
      'the 3D board comes up over the room\'s own board, which hides but keeps its squares to tab to  ' + JSON.stringify(up));
    let bad = await tapMap(page);
    ok(bad.length === 0, 'every square of the 3D board is pressed where it is drawn  [' + (bad.join(' ') || 'all 64') + ']');
    // ⚠ A PIECE IS A WIDE BODY UNDER A NARROW HEAD: the middle of a square just behind a pawn is that square (one fat
    // post took the presses meant for it — the game's own bug, ui/board3d.gd)
    const behind = await page.evaluate(() => {
      const r = document.getElementById('board').getBoundingClientRect(), out = [];
      for (let i = 40; i < 48; i++) { const p = T3.b3.seenIn(i), g = T3.b3.squareAt(r.left + p[0], r.top + p[1]); if (g !== i) out.push(i + '->' + g); }
      return out;
    });
    ok(behind.length === 0, 'the middle of each square just behind a pawn is that square, not the pawn in front  [' + (behind.join(' ') || 'a3 to h3') + ']');
    const under = await page.evaluate(() => { const p = T3.b3.pointOf(52), el = document.elementFromPoint(p[0], p[1]); return el && el.className; });
    const flights0 = await page.evaluate(() => T3.b3.b.flights || 0);
    await click(page, SQ('e2')); await sleep(120); await click(page, SQ('e4'));
    await sleep(400);
    // ⚠ COUNTED, NOT CAUGHT IN THE AIR: on a slow frame a flight starts and lands inside one
    const flying = await page.evaluate((n) => (T3.b3.b.flights || 0) > n, flights0);
    const played = await page.evaluate(() => T3.S().b[36] === 'P' && T3.S().turn === 'b');
    ok(under === 'pjcc-board3d' && played && flying, 'two real clicks on the 3D board play e2-e4 by the room\'s own hand, and the pawn flies  [under ' +
      under + ', played ' + played + ', flew ' + flying + ']');
    /* ── 3. a capture: the taken piece knocked aside, a close-up ── */
    await page.evaluate(() => T3.setFen('4k3/8/8/3p4/4P3/8/8/4K3 w - - 0 1'));
    /* ⚠ THE LENS MUST SEE THE POSITION BEFORE THE MOVE: it reads a move off the difference between two of its own frames,
       and on a loaded machine a move made before its next frame arrived as a new position, with nothing to knock */
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    await sleep(100);
    const knocks0 = await page.evaluate(() => T3.b3.b.knocks || 0);
    await page.evaluate(() => T3.moveUci('e4d5'));
    // ⚠ COUNTED AND POLLED, NOT SAMPLED: a slow frame knocked the piece and cleared it before a 60 ms look
    let knock = 0, cap = '';
    for (let t = 0; t < 40 && !(knock > 0 && cap === 'capture'); t++) {
      await sleep(30);
      knock = await page.evaluate((n) => (T3.b3.b.knocks || 0) - n, knocks0);
      const k = await page.evaluate(() => T3.b3.cutKind());
      if (k) cap = k;
    }
    ok(knock > 0 && cap === 'capture', 'a capture knocks the taken piece aside, and the camera cuts to a close-up  [' + knock + ' falling, cut ' + cap + ']');
    await sleep(700);
    /* ── 4. en passant: the pawn taken is knocked where it stood ── */
    await page.evaluate(() => T3.setFen('4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1'));
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));   // the capture's rule
    await sleep(100);
    await page.evaluate(() => T3.moveUci('e5d6'));
    /* ⚠ WAITED FOR, NOT SLEPT (11-18): the lens syncs on its next frame, and with his heavier pawn under software GL one
       frame outlasted the old 40 ms; the taken pawn falls for most of a second, so it is caught falling */
    let epAt = null;
    for (let t = 0; t < 40 && !epAt; t++) {
      await sleep(30);
      epAt = await page.evaluate(() => { const f = T3.b3.b.falling[0]; return f ? [Math.round(f.pos.x * 2) / 2, Math.round(f.pos.z * 2) / 2] : null; });
    }
    ok(epAt && epAt[0] === -0.5 && epAt[1] === -0.5, 'en passant\'s pawn is knocked over on d5, where it stood, not on d6  [' + JSON.stringify(epAt) + ']');
    await sleep(800);
    /* ── 5. a check: the push in on the king, the clock standing still, every square pressed where drawn ── */
    await page.evaluate(() => T3.setFen('4k3/8/8/8/8/8/8/R3K3 w - - 0 1'));
    /* ⚠ THE CAPTURE'S RULE, MISSING HERE UNTIL 11-25: twice on a loaded machine the lens had not drawn the new position when
       Ra8+ came, read it as a whole new board rather than a move, and cut nothing ("[; mate …]") */
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    await sleep(100);
    await page.evaluate(() => T3.moveUci('a1a8'));
    const chk = await cutOf(page, 'check');
    bad = await tapMap(page);
    await sleep(700);
    // the clock, read twice in the page while a cut is on (a mate's, long enough that no slow frame ends it between)
    const still = await page.evaluate(async () => {
      T3.b3.cut('mate', 4);
      await new Promise((r) => setTimeout(r, 250));
      const a = [T3.b3.cutKind(), T3.left()];
      await new Promise((r) => setTimeout(r, 400));
      return a.concat([T3.b3.cutKind(), T3.left()]);
    });
    ok(chk === 'check' && still[0] === 'mate' && still[2] === 'mate' && still[1] === still[3],
      'a check pushes in on the king, and the room\'s clock stands still through a cut  [' + chk + '; ' + still.join(' ') + ']');
    ok(bad.length === 0, '…and every square is pressed where it is drawn as the camera moves  [' + (bad.join(' ') || 'all 64') + ']');
    await page.evaluate(() => T3.b3.endCut());
    // a press in the cut (its hold, the camera in close) lands where the finger is, and ends the cut
    await sleep(700);
    await page.evaluate(() => T3.setFen('4k3/8/8/8/8/8/8/R3K3 w - - 0 1'));
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));   // the capture's rule
    await sleep(100);
    /* ⚠ HELD LONG ENOUGH TO PRESS (11-25): a check's cut lasts 0.45 s and holds its push for 0.16, and on a loaded machine
       the two round trips between reading e8's point and clicking it outlasted it — the click met the board at rest
       ("[check → "", sel -1]"). Three seconds for this press alone, then the room's own length again. */
    const secs0 = await page.evaluate(() => { const s = PJCCBoard3D.CUTS.check.secs; PJCCBoard3D.CUTS.check.secs = 3; return s; });
    await page.evaluate(() => T3.moveUci('a1a8'));
    const pre = await cutOf(page, 'check');
    await click(page, SQ('e8'));
    await sleep(100);
    const after = await page.evaluate(() => [T3.b3.cutKind(), T3.b3.b.key.split('|')[2]]);
    await page.evaluate((s) => { PJCCBoard3D.CUTS.check.secs = s; }, secs0);
    ok(pre === 'check' && after[0] === '' && after[1] === String(SQ('e8')),
      'a press in a cut is the square under the finger, and ends the cut  [' + pre + ' → "' + after[0] + '", sel ' + after[1] + ']');
    /* ── 6. a mate: the slow circle, the card held half a second at most ── */
    await page.evaluate(() => T3.setFen('6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1'));
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));   // the capture's rule
    await sleep(100);
    await page.evaluate(() => T3.moveUci('a1a8'));
    /* ⚠ POLLED, NOT SAMPLED: the cut begins when the move's slide lands, 270–340 ms after the move on a busy machine
       (measured 11-18; a look at 240 ms caught it about half the time). The card is held from its first frame. */
    let m1 = ['', false];
    for (let t = 0; t < 60 && m1[0] !== 'mate'; t++) { await sleep(25); m1 = await page.evaluate(() => [T3.b3.cutKind(), T3.b3.cardHeld()]); }
    await sleep(600);
    const m2 = await page.evaluate(() => [T3.b3.cutKind(), T3.b3.cardHeld()]);
    ok(m1[0] === 'mate' && m1[1] && m2[0] === 'mate' && !m2[1], 'a mate circles the king, and holds the game\'s card half a second at most  [' + m1 + ' then ' + m2 + ']');
    await sleep(1200);
    /* ── 7. the woods, lit, are the flat board's ── */
    await page.evaluate(() => T3.setFen('8/8/8/8/8/8/8/8 w - - 0 1'));
    await sleep(300);
    const shot = await page.screenshot({ encoding: 'base64' });
    const px = await page.evaluate(async (b64, pt) => {
      const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
      const g = c.getContext('2d'); g.drawImage(img, 0, 0);
      const p = T3.b3.pointOf(pt), d = g.getImageData(Math.round(p[0]) - 2, Math.round(p[1]) - 2, 5, 5).data;
      let r = 0, gg = 0, bb = 0; for (let i = 0; i < d.length; i += 4) { r += d[i]; gg += d[i + 1]; bb += d[i + 2]; }
      return [r / 25, gg / 25, bb / 25].map(Math.round);
    }, shot, SQ('d5'));
    const lt = [0xe9, 0xd3, 0xa4], worst = Math.max(...px.map((v, i) => Math.abs(v - lt[i]) / lt[i]));
    ok(worst < 0.05, 'a lit light square is the flat board\'s own maple  [' + px.join(',') + ' vs 233,211,164, ' + (worst * 100).toFixed(1) + '% off]');
    /* ── 8. as Black, and on a phone ── */
    await page.evaluate(() => { T3.setFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'); T3.flipTo(true); });
    await sleep(300);
    bad = await tapMap(page);
    ok(bad.length === 0, 'played as Black, the board turns and every square is pressed where it is drawn  [' + (bad.join(' ') || 'all 64') + ']');
    await page.close();
    page = await open({ view: { width: 390, height: 760 } });
    await page.evaluate(() => { document.querySelector('.wrap').style.width = '350px'; });
    await sleep(300);
    bad = await tapMap(page);
    ok(bad.length === 0, 'on a phone, every square is pressed where it is drawn  [' + (bad.join(' ') || 'all 64') + ']');
    /* ── 9. flat: V, the board itself takes the camera, clipped, and a press lands through it ── */
    await page.keyboard.press('v');
    await sleep(150);
    const fl = await page.evaluate(() => ({ flat: PJCCBoard3D.flat(), canvas: getComputedStyle(document.querySelector('canvas.pjcc-board3d')).display,
      cls: document.getElementById('board').classList.contains('pjcc-b3-on'), btn: document.querySelector('.pjcc-board-view').textContent }));
    ok(fl.flat && fl.canvas === 'none' && !fl.cls && fl.btn === 'Board: Flat', 'V lays the board flat, a device preference, and the button says so  ' + JSON.stringify(fl));
    await page.evaluate(() => T3.setFen('4k3/8/8/8/8/8/8/R3K3 w - - 0 1'));
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));   // the capture's rule
    await sleep(100);
    await page.evaluate(() => T3.moveUci('a1a8'));
    /* ⚠ POLLED, NOT SAMPLED, as the mate's above: on a busy machine a look at 260 ms came before the slide had landed */
    let fc = ['', '', ''];
    for (let t = 0; t < 60 && !(fc[0] === 'check' && fc[1] === 'matrix(' && fc[2] === 'polygon('); t++) {
      await sleep(25);
      fc = await page.evaluate(() => { const b = document.getElementById('board'); return [T3.b3.cutKind(), b.style.transform.slice(0, 7), b.style.clipPath.slice(0, 8)]; });
    }
    ok(fc[0] === 'check' && fc[1] === 'matrix(' && fc[2] === 'polygon(', 'flat, a check\'s cut moves the board itself, clipped to its frame  ' + JSON.stringify(fc));
    await page.keyboard.press('v');
    await sleep(100);
    await page.close();
    /* ── 10. Reduce Motion: no cut ── */
    page = await open({ calm: true });
    await page.evaluate(() => T3.setFen('4k3/8/8/8/8/8/8/R3K3 w - - 0 1'));
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));   // the capture's rule
    await sleep(100);
    await page.evaluate(() => T3.moveUci('a1a8'));
    await sleep(300);
    const calm = await page.evaluate(() => [PJCCBoard3D.calm(), T3.b3.cutKind()]);
    // …and a cut a room asks for itself is refused as well
    const asked = await page.evaluate(() => { T3.b3.cut('mate', 4); return T3.b3.cutKind(); });
    ok(calm[0] && calm[1] === '' && asked === '', 'with the device\'s Reduce Motion there is no cut, not even one a room asks for  [' + JSON.stringify(calm) + ' "' + asked + '"]');
    await page.close();
    /* ── 12. whoever sits across, the room's light, and their answer to your move (his view ideas #1, #4, #5) ── */
    const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    page = await open();
    await page.evaluate((f) => { window.SEAT = { who: 'Maxwell', key: 'maxwell' }; T3.setFen(f); }, START);
    let sat = null;
    for (let i = 0; i < 40 && !(sat && sat.drawn === 'person'); i++) {
      await sleep(100);
      sat = await page.evaluate(() => {
        const s = T3.b3.seat(), cv = document.querySelector('canvas.pjcc-board3d-seat');
        const d = cv.getContext('2d').getImageData(0, 0, cv.width, Math.round(cv.height * 0.3)).data;
        let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 200) n++;
        return { who: s.who, drawn: s.drawn, opaque: n, under: !!(cv.nextElementSibling && cv.nextElementSibling.classList.contains('pjcc-board3d')) };
      });
    }
    ok(sat.drawn === 'person' && sat.opaque > 1500 && sat.under, 'Maxwell sits across the board, dressed as the town dresses him, under the board\'s picture  ' + JSON.stringify(sat));
    await page.evaluate(() => { window.SEAT = { who: 'Milo', key: 'crockett' }; });
    await sleep(300);
    const dogAt = await page.evaluate(() => { const s = T3.b3.seat(); return { who: s.who, dog: s.dog, drawn: s.drawn }; });
    ok(dogAt.dog && dogAt.drawn === 'dog', 'and Milo across the board is the dog, never a person in his colors  ' + JSON.stringify(dogAt));
    await page.evaluate(() => { window.SEAT = { who: 'Maxwell', key: 'maxwell' }; T3.moveUci('e2e4'); });
    await sleep(600);
    const leaning = await page.evaluate(() => { const s = T3.b3.seat(); return [s.leanTo, +s.lean.toFixed(2)]; });
    ok(leaning[0] === 1 && leaning[1] === 1, 'while it is their move they lean in over the board  [' + leaning + ']');
    await page.evaluate((f) => T3.setFen(f), START);
    await sleep(200);
    await page.evaluate(() => T3.setFen('4k3/8/8/8/8/8/8/R3K3 w - - 0 1'));
    await sleep(1800);
    const lit = await page.evaluate(() => {
      const s = T3.b3.seat(), cv = document.querySelector('canvas.pjcc-board3d-seat');
      return { mood: +s.mood.toFixed(2), lamp: s.lamp, glow: Array.from(cv.getContext('2d').getImageData(Math.round(cv.width * 0.25), Math.round(cv.height * 0.75), 1, 1).data) };
    });
    const lampRgb = [0, 2, 4].map((i) => parseInt(lit.lamp.slice(i, i + 2), 16)), wantLamp = [252, 238, 186];
    ok(lit.mood === 1 && lampRgb.every((v, i) => Math.abs(v - wantLamp[i]) <= 2) && lit.glow[3] > 12 && lit.glow[0] > lit.glow[2],
      'a rook up, the room goes gold: the lamp a third of the way there, the glow behind the board  ' + JSON.stringify(lit));
    await page.evaluate((f) => T3.setFen(f), START);
    await sleep(200);
    await page.evaluate(() => T3.setFen('4k3/8/8/3q4/8/8/8/3QK3 w - - 0 1'));
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));   // the capture's rule
    await sleep(300);
    await page.evaluate(() => T3.moveUci('d1d5'));
    let acted = '';
    for (let i = 0; i < 50 && !acted; i++) { await sleep(40); acted = await page.evaluate(() => T3.b3.seat().act); }
    ok(acted === 'frown', 'win their queen and they frown, once the capture\'s close-up is over  [' + acted + ']');
    await sleep(1200);
    await page.evaluate((f) => T3.setFen(f), START);
    await sleep(200);
    await page.evaluate(() => T3.setFen('4k3/8/8/8/3r4/8/8/3QK3 w - - 0 1'));
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));   // the capture's rule
    await sleep(300);
    await page.evaluate(() => T3.moveUci('d1d3'));
    acted = '';
    for (let i = 0; i < 50 && !acted; i++) { await sleep(40); acted = await page.evaluate(() => T3.b3.seat().act); }
    ok(acted === 'smile', 'hang your queen and they smile  [' + acted + ']');
    await page.close();
    /* ── 11. no 3D: the board is the room's own, flat, and still cut ── */
    page = await open({ block: 'three.pjcc' });
    await sleep(600);
    await page.evaluate(() => T3.setFen('4k3/8/8/8/8/8/8/R3K3 w - - 0 1'));
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));   // the capture's rule
    await sleep(100);
    await page.evaluate(() => T3.moveUci('a1a8'));
    await sleep(120);
    const down = await page.evaluate(() => ({ canvas: !!document.querySelector('canvas.pjcc-board3d'), up: T3.b3.up(), cut: T3.b3.cutKind(),
      btn: document.querySelector('.pjcc-board-view').hidden, tr: document.getElementById('board').style.transform.slice(0, 7) }));
    ok(!down.canvas && !down.up && down.cut === 'check' && down.btn && down.tr === 'matrix(',
      'with the 3D bundle blocked the room keeps its own flat board, no Board button, and still cuts  ' + JSON.stringify(down));
    await page.close();
    /* ── ⭐ HIS PAWN BOWS IN DEFEAT (his 11-18) ── mated, the loser's pawns play his bow and hold it; a new game, they stand ── */
    page = await open();
    const bones = () => page.evaluate(() => {
      const b = T3.b3.b, out = {};
      for (const k in b.pieces) {
        if (b.pieces[k].code !== 'bP') continue;
        const at = [];
        b.pieces[k].node.updateMatrixWorld(true);
        b.pieces[k].node.traverse((n) => { if (n.isBone) { const v = n.getWorldPosition(new n.position.constructor()); at.push([v.x, v.y, v.z]); } });
        out[k] = at;
      }
      return { at: out, bowed: b.bowed };
    });
    await page.evaluate(() => T3.setFen('6k1/2pp1ppp/8/8/8/8/5PPP/R5K1 w - - 0 1'));
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));   // the capture's rule
    await sleep(500);
    const stand = await bones();
    await page.evaluate(() => T3.moveUci('a1a8'));
    await sleep(2800);
    const bent = await bones();
    let moved = 0, n = 0;
    for (const k in stand.at) {
      if (!bent.at[k]) continue;
      n++;
      const far = Math.max(...stand.at[k].map((p, i) => Math.hypot(p[0] - bent.at[k][i][0], p[1] - bent.at[k][i][1], p[2] - bent.at[k][i][2])));
      if (far > 0.05) moved++;
    }
    ok(bent.bowed === 'b' && n === 5 && moved === 5, '⭐ mated, every pawn of the side that lost bows (his 11-18)  [bowed ' + bent.bowed + ', ' + moved + ' of ' + n + ' pawns bent]');
    await page.evaluate(() => T3.setFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'));
    await sleep(500);
    const again = await bones();
    ok(again.bowed === '' && Object.keys(again.at).length === 8, '…and a new game stands them up again  [bowed \'' + again.bowed + '\', ' + Object.keys(again.at).length + ' black pawns]');
    await page.close();
  } catch (e) {
    errors.push('TEST: ' + e.message);
  } finally {
    await browser.close();
    server.close();
  }
  process.exit(report('THE CHESS ROOMS\' TILTED 3D BOARD AND TV CUTS', results, errors) ? 0 : 1);
})();
