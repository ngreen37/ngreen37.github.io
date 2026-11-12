// The tilted 3D board and the TV cuts IN EACH CHESS ROOM (his 11-04, of the chess rooms: "add them there too"),
// each room played in a real browser with WebGL, the lens (assets/js/pjcc-board3d.js) over the room's own board.
// Locks in, room by room:
//   - the 3D board comes up over the room's own board, which hides but keeps its squares
//   - every square of it is pressed where it is drawn, and a real click on it plays the room's own move
// and at Park Tables' bot table, a cut stops its clock and the clock starts again after.
// The lens itself (the cuts, the flat view, Reduce Motion, no WebGL) is tests/board3d.check.js's.
//   run:  npm run test:rooms3d        (…  --shots writes each room's picture to tests/__shots)
const http = require('http'), fs = require('fs'), path = require('path');
const puppeteer = require('puppeteer-core');
const { findChrome, report, jekyllPage, siteCss } = require('./harness');

const ROOT = path.join(__dirname, '..');
const SHOTS = process.argv.includes('--shots');
const SHOTDIR = path.join(ROOT, 'tests', '__shots');
const PT_TMP = path.join(ROOT, 'games', 'park-tables', '__pt3d_test.html');
const CSS_TMP = path.join(ROOT, 'assets', 'css', '__pt3d_test.css');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.glb': 'model/gltf-binary', '.webp': 'image/webp',
  '.woff2': 'font/woff2', '.mp3': 'audio/mpeg' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [], errors = [];
const ok = (cond, msg) => results.push({ pass: !!cond, msg });

(async () => {
  const exe = findChrome();
  if (!exe) { console.error('No Chrome/Edge found. Install one or set CHROME_PATH.'); process.exit(2); }
  fs.writeFileSync(PT_TMP, jekyllPage(fs.readFileSync(path.join(ROOT, 'games/park-tables/index.html'), 'utf8'),
    '/assets/css/__pt3d_test.css', 'theme-hall'));
  fs.writeFileSync(CSS_TMP, siteCss());
  if (SHOTS) fs.mkdirSync(SHOTDIR, { recursive: true });
  // ⚠ A ROOM'S /assets/css/*.css CAN BE JEKYLL'S (vs-aura, gauntlet-door), compiled from the .scss beside it: served
  // compiled here, or the rooms are measured without their rails and doors
  const sass = require('sass'), compiled = {};
  const jekyllCss = (u) => {
    const scss = path.join(ROOT, u.replace(/\.css$/, '.scss'));
    if (!/^\/assets\/css\/[\w-]+\.css$/.test(u) || fs.existsSync(path.join(ROOT, u)) || !fs.existsSync(scss)) return null;
    if (!compiled[u]) compiled[u] = sass.compileString(fs.readFileSync(scss, 'utf8').replace(/^---[\s\S]*?---\s*/, ''),
      { loadPaths: [path.join(ROOT, '_sass')], quietDeps: true, logger: sass.Logger.silent }).css;
    return compiled[u];
  };
  const server = http.createServer((req, res) => {
    const u = req.url.split('?')[0];
    if (u === '/games/checker-town/') { res.writeHead(200, { 'Content-Type': MIME['.html'] }); return res.end('<!doctype html><title>town</title>'); }
    const css = jekyllCss(u);
    if (css != null) { res.writeHead(200, { 'Content-Type': MIME['.css'] }); return res.end(css); }
    const f = path.join(ROOT, decodeURIComponent(u));
    if (!f.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
    fs.readFile(f, (e, b) => {
      if (e) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); res.end(b);
    });
  });
  await new Promise((r) => server.listen(0, r));
  const BASE = 'http://localhost:' + server.address().port;
  const browser = await puppeteer.launch({ executablePath: exe, headless: 'new',
    args: ['--no-sandbox', '--mute-audio', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage();
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 160) + ' @ ' + ((m.location() && m.location().url) || '')); });
  await page.setViewport({ width: 1000, height: 1100 });
  const up = async () => {
    for (let i = 0; i < 150; i++) {
      if (await page.evaluate(() => !!(window.PJCCBoard3D && PJCCBoard3D.handles[0] && PJCCBoard3D.handles[0].on()))) return true;
      await sleep(100);
    }
    return false;
  };
  // the lens is over the room's own board, which hides but keeps its squares; every square where it is drawn
  const lens = (sel) => page.evaluate((sel) => {
    const h = PJCCBoard3D.handles[0], b = document.querySelector(sel), c = document.querySelector('canvas.pjcc-board3d');
    if (!b || !c) return { err: 'no ' + (b ? 'canvas' : 'board') };
    const a = c.getBoundingClientRect(), r = b.getBoundingClientRect(), bad = [];
    for (let i = 0; i < 64; i++) { const p = h.pointOf(i), g = h.squareAt(p[0], p[1]); if (g !== i) bad.push(i + '->' + g); }
    const p = h.pointOf(52), el = document.elementFromPoint(p[0], p[1]);
    return { over: Math.abs(a.left - r.left) < 1.5 && Math.abs(a.top - r.top) < 1.5 && Math.abs(a.width - r.width) < 1.5,
      hidden: b.classList.contains('pjcc-b3-on'), squares: b.querySelectorAll('button').length, bad: bad, under: el && el.className };
  }, sel);
  const click = async (sq) => { const p = await page.evaluate((i) => PJCCBoard3D.handles[0].pointOf(i), sq); await page.mouse.click(p[0], p[1]); };
  const shot = async (n) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTDIR, n + '.png') }); };
  try {
    /* ── PARK TABLES: Maxwell's table ── */
    await page.goto(BASE + '/games/park-tables/__pt3d_test.html', { waitUntil: 'networkidle2' });
    await page.evaluate(() => { localStorage.clear(); });
    await page.goto(BASE + '/games/park-tables/__pt3d_test.html', { waitUntil: 'networkidle2' });
    await sleep(400);
    await page.evaluate(() => document.querySelector('.pt-bench-set [data-side="w"]').click());
    await sleep(120);
    await page.evaluate(() => document.querySelector('[data-bot="maxwell"]').click());
    await sleep(800);
    const pt = (await up()) && await lens('.pt-board');
    ok(pt && pt.over && pt.hidden && pt.squares === 64 && pt.under === 'pjcc-board3d',
      'Park Tables: the 3D board comes up over the table\'s own board, which hides but keeps its 64 squares  ' + JSON.stringify(pt && { over: pt.over, hidden: pt.hidden, squares: pt.squares, under: pt.under }));
    ok(pt && pt.bad.length === 0, 'Park Tables: every square of it is pressed where it is drawn  [' + ((pt && pt.bad.join(' ')) || 'all 64') + ']');
    await click(52); await sleep(150); await click(36); await sleep(1500);
    const mv = await page.evaluate(() => (JSON.parse(localStorage.getItem('pjcc.park.bot.v1')) || {}).moves || '');
    ok(/^e2e4 \w{4}/.test(mv.trim()), 'Park Tables: two real clicks on the 3D board play e2-e4, and Maxwell answers  ["' + mv.trim() + '"]');
    const seatOf = () => page.evaluate(() => { const s = PJCCBoard3D.handles[0] && PJCCBoard3D.handles[0].seat(); return s ? { who: s.who, drawn: s.drawn } : null; });
    const ptSeat = await seatOf();
    ok(ptSeat && ptSeat.who === 'Maxwell' && ptSeat.drawn === 'person', 'Park Tables: Maxwell sits across the 3D board, dressed as the town dresses him  ' + JSON.stringify(ptSeat));
    await shot('rooms3d-park-tables');
    // a cut stops the table's clock, and it starts again after
    const clk = () => page.evaluate(() => { const e = document.querySelector('.pt-plate--me [data-clock]'); return e ? e.textContent : null; });
    await page.evaluate(() => PJCCBoard3D.handles[0].cut('mate', 4));
    const t0 = Date.now();
    await sleep(150);
    const c1 = await clk(); await sleep(1100); const c2 = await clk();
    while (await page.evaluate(() => PJCCBoard3D.handles[0].cutting()) && Date.now() - t0 < 8000) await sleep(50);
    const dur = Date.now() - t0;
    const c3 = await clk(); await sleep(1300); const c4 = await clk();
    ok(c1 && c1 === c2 && c3 !== c4 && dur < 2600, 'Park Tables: a cut stops the table\'s clock, and it runs again after  [' + c1 + ' ' + c2 +
      ' | ' + c3 + ' ' + c4 + ', the mate\'s cut lasted ' + dur + ' ms]');

    /* ── MARCHLAND: a battle, reached the way a player reaches one (tests/marchland.check.js's road) ── */
    await page.setViewport({ width: 520, height: 900 });
    await page.goto(BASE + '/assets/games/pjcc_marchland.html', { waitUntil: 'load' });
    await page.evaluate(() => { localStorage.clear(); localStorage.setItem('pjcc.campaign.cards', '0'); });
    await page.reload({ waitUntil: 'load' });
    const isOn = (id) => page.evaluate((s) => document.getElementById(s).classList.contains('on'), id);
    const until = async (f, ms) => { const t = Date.now(); while (Date.now() - t < ms) { if (await f()) return true; await sleep(80); } return false; };
    await page.click('#go');
    await until(() => isOn('screen-map'), 6000);
    for (let i = 0; i < 8; i++) {
      if (!(await page.evaluate(() => !!document.querySelector('.phasebar span[data-p="deploy"].on')))) break;
      if (!(await page.evaluate(() => { const n = document.querySelector('.node.mine.can'); if (n) n.click(); return !!n; }))) break;
      await sleep(90);
    }
    await until(() => page.evaluate(() => !!document.querySelector('.phasebar span[data-p="attack"].on')), 9000);
    let opened = false;
    const nSrc = await page.evaluate(() => document.querySelectorAll('.node.mine.can').length);
    for (let s = 0; s < nSrc && !opened; s++) {
      await page.evaluate((n) => { const el = document.querySelectorAll('.node.mine.can')[n]; if (el) el.click(); }, s);
      await sleep(120);
      if (await page.evaluate(() => document.querySelectorAll('.node.tgt').length)) {
        await page.evaluate(() => document.querySelectorAll('.node.tgt')[0].click()); opened = true;
      } else { await page.evaluate(() => { const el = document.querySelector('.node.sel'); if (el) el.click(); }); await sleep(80); }
    }
    await until(() => isOn('screen-roll'), 9000);
    await page.click('#screen-roll');
    await until(() => page.evaluate(() => !document.getElementById('tobattle').disabled), 9000);
    await page.click('#tobattle');
    const inBattle = await until(() => isOn('screen-battle'), 9000);
    await sleep(300);
    const mc = inBattle && (await up()) && await lens('#board');
    if (!mc || mc.err) errors.push('MARCHLAND road: opened=' + opened + ' battle=' + inBattle + ' lens=' + JSON.stringify(mc));
    ok(opened && mc && mc.over && mc.hidden && mc.bad.length === 0 && mc.under === 'pjcc-board3d',
      'MARCHLAND: the 3D board comes up over the battle board, every square pressed where it is drawn  ' +
      JSON.stringify(mc && { opened: opened, over: mc.over, hidden: mc.hidden, bad: mc.bad.join(' ') || 'all 64', under: mc.under }));
    // a tap on it skips the reveal; then White's first legal move, played by two taps where it is drawn
    await click(28); await sleep(250);
    await until(() => page.evaluate(() => PJCCBoard3D.handles[0].o.read().turn === 'w'), 9000);
    const mvW = await page.evaluate(() => {
      const st = PJCCBoard3D.handles[0].o.read();
      const S = { b: st.b.slice(), turn: 'w', cast: { K: false, Q: false, k: false, q: false }, ep: -1, half: 0, full: 1 };
      const m = PJCCChess.legalMoves(S)[0];
      return m ? [m.from, m.to, st.b[m.from]] : null;
    });
    if (mvW) { await click(mvW[0]); await sleep(150); await click(mvW[1]); await sleep(400); }
    const mcMoved = mvW && await page.evaluate((m) => { const b = PJCCBoard3D.handles[0].o.read().b; return !b[m[0]] && b[m[1]] === m[2]; }, mvW);
    ok(mcMoved, 'MARCHLAND: a tap on the 3D board skips the reveal, and two more play White\'s move by onSquare  ' + JSON.stringify(mvW));
    // ⚠ READ WHILE NOBODY MOVES: a move in the cut is still played, and its delay credit changes a clock honestly.
    // So Black's answer comes first: under a full run's load it landed inside all three tries' reads (11-11).
    await until(() => page.evaluate(() => PJCCBoard3D.handles[0].o.read().turn === 'w'), 9000);
    // …and its own cut is over: a capture's cut was running, the measured one was refused, and White's clock ran on
    await until(() => page.evaluate(() => !PJCCBoard3D.cutting()), 5000);
    const mcRead = () => page.evaluate(() => ({ clk: document.getElementById('clock').textContent,
      pos: PJCCBoard3D.handles[0].o.read().b.join('') }));
    let mk1 = null, mk2 = null;
    for (let tries = 0; tries < 3; tries++) {
      await page.evaluate(() => PJCCBoard3D.handles[0].cut('mate', PJCCBoard3D.handles[0].o.read().b.indexOf('k')));
      await sleep(120);
      mk1 = await mcRead(); await sleep(800); mk2 = await mcRead();
      if (mk1.pos === mk2.pos) break;
      await page.evaluate(() => PJCCBoard3D.handles[0].endCut()); await sleep(300);
    }
    ok(mk1.pos === mk2.pos && mk1.clk === mk2.clk, 'MARCHLAND: the battle clocks stand still through a cut  [' + mk1.clk + ' then ' + mk2.clk + ']');
    const mcSeat = await seatOf();
    ok(mcSeat && mcSeat.who === 'Maxwell' && mcSeat.drawn === 'person', 'MARCHLAND: Maxwell, who commands Red, sits across the battle  ' + JSON.stringify(mcSeat));
    await shot('rooms3d-marchland');
    await page.evaluate(() => PJCCBoard3D.handles[0].endCut());

    /* ── THE DUEL: a trap laid out on the board, watched ── */
    await page.goto(BASE + '/assets/games/pjcc_duel.html', { waitUntil: 'networkidle2' });
    await sleep(300);
    await page.evaluate(() => document.querySelector('#foes button[data-foe]:not([disabled])').click());
    await sleep(200);
    await page.evaluate(() => document.querySelector('#picks button').click());
    const du = (await up()) && await lens('.boardwrap');
    await sleep(2600);
    const duPieces = await page.evaluate(() => {
      const h = PJCCBoard3D.handles[0], b = h.b;
      return b && b.b ? Object.keys(b.pieces).length === b.b.filter(Boolean).length : false;
    });
    ok(du && du.over && du.hidden && du.bad.length === 0 && du.under !== 'pjcc-board3d' && duPieces,
      'the Duel: the 3D board comes up over the board its traps are laid out on, inert (a press goes through), the line played on it  ' +
      JSON.stringify(du && { over: du.over, hidden: du.hidden, bad: du.bad.join(' ') || 'all 64', under: du.under, pieces: duPieces }));
    const duSeat = await seatOf();
    const duFoe = await page.evaluate(() => (typeof duel !== 'undefined' && duel && duel.foe) ? duel.foe.name : document.getElementById('d-them').textContent);
    ok(duSeat && duSeat.who && duSeat.who === duFoe && duSeat.drawn !== '', 'the Duel: the duelist you face sits across the board  ' + JSON.stringify({ seat: duSeat, foe: duFoe }));
    await shot('rooms3d-duel');

    /* ── THE PIRC PROTOCOL: a line, the 3D board drawn into the room's own canvas ── */
    await page.setViewport({ width: 520, height: 760 });
    await page.goto(BASE + '/assets/games/pjcc_pirc.html', { waitUntil: 'load' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'load' });
    await sleep(300);
    await page.evaluate(() => document.getElementById('cram-btn').click());
    const prUp = await up();
    const awaiting = await until(() => page.evaluate(() => !!(G && G.phase === 'await')), 9000);
    const pr = prUp && awaiting && await page.evaluate(() => {
      const h = PJCCBoard3D.handles[0], bad = [];
      for (let i = 0; i < 64; i++) { const p = h.pointOf(i), g = h.squareAt(p[0], p[1]); if (g !== i) bad.push(i + '->' + g); }
      return { bad: bad, view: !!document.querySelector('.p-view') && !document.querySelector('.p-view').hidden };
    });
    ok(pr && pr.bad.length === 0 && pr.view, 'the Pirc Protocol: the 3D board is drawn into the room\'s canvas, every square pressed where it is drawn, its Board button up  ' +
      JSON.stringify(pr && { bad: pr.bad.join(' ') || 'all 64', view: pr.view }));
    const prSeat = await seatOf();
    ok(prSeat && prSeat.who === 'Michael' && prSeat.drawn === 'person', 'the Pirc Protocol: Michael, who teaches the line, sits across it  ' + JSON.stringify(prSeat));
    // the line's own next move, played by two real clicks where its squares are drawn
    const exp = awaiting && await page.evaluate(() => { const e = G.line.plies[G.idx]; return [e.from.y * 8 + e.from.x, e.to.y * 8 + e.to.x, G.idx]; });
    if (exp) { await click(exp[0]); await sleep(150); await click(exp[1]); await sleep(900); }
    const advanced = exp && await page.evaluate((n) => G.idx > n || G.phase !== 'await', exp[2]);
    ok(advanced, 'the Pirc Protocol: two real clicks on the 3D board play the line\'s move, and the line moves on  ' + JSON.stringify(exp));
    await shot('rooms3d-pirc');

    /* ── THE GAUNTLET: the first floor, past its card and its cut-scene, drawn into the room's canvas ── */
    await page.setViewport({ width: 480, height: 860 });
    await page.goto(BASE + '/assets/games/pjcc_gauntlet.html', { waitUntil: 'load' });
    // mid-climb on a floor with a clock (tests/gauntlet.check.js's seed): Continue goes straight to the rival's card
    await page.evaluate(() => { localStorage.clear();
      localStorage.setItem('pjcc.gauntlet.v2', JSON.stringify({ unlocked: 5, beaten: { 0: true, 1: true, 2: true, 3: true, 4: true } })); });
    await page.reload({ waitUntil: 'load' });
    await sleep(300);
    await page.evaluate(() => document.getElementById('play-btn').click());
    await sleep(250);
    await page.evaluate(() => { const b = document.querySelector('#boss-row .btn-gold'); if (b) b.click(); });
    const gOn = await until(() => page.evaluate(() => !!(window.G && G.S && !G.over)), 12000);
    const gUp = gOn && await up();
    const gMine = gUp && await until(() => page.evaluate(() => G.S.turn === G.pc && !G.thinking), 15000);
    if (!gMine) errors.push('Gauntlet road: game=' + gOn + ' up=' + gUp + ' mine=' + gMine + ' ' +
      await page.evaluate(() => JSON.stringify({ G: !!window.G, b3: !!(window.PJCCBoard3D && PJCCBoard3D.handles[0]), on: !!(window.PJCCBoard3D && PJCCBoard3D.handles[0] && PJCCBoard3D.handles[0].on()) })));
    const gt = gMine && await page.evaluate(() => {
      const h = PJCCBoard3D.handles[0], bad = [];
      for (let i = 0; i < 64; i++) { const p = h.pointOf(i), g = h.squareAt(p[0], p[1]); if (g !== i) bad.push(i + '->' + g); }
      const m = G.legal[0];
      return { bad: bad, mv: m ? [m.from, m.to, PJCCChess.nameFromSq(m.from) + PJCCChess.nameFromSq(m.to)] : null,
        view: !!document.querySelector('.g-view') && getComputedStyle(document.querySelector('.g-view')).display !== 'none' };
    });
    ok(gt && gt.bad.length === 0 && gt.view, 'the Gauntlet: the 3D board is drawn into the room\'s canvas in the floor\'s woods, every square pressed where it is drawn, its Board button beside Resign  ' +
      JSON.stringify(gt && { bad: gt.bad.join(' ') || 'all 64', view: gt.view }));
    if (gt && gt.mv) { await click(gt.mv[0]); await sleep(150); await click(gt.mv[1]); await sleep(500); }
    const gPlayed = gt && gt.mv && await page.evaluate((u) => G.uci.indexOf(u) >= 0, gt.mv[2]);
    ok(gPlayed, 'the Gauntlet: two real clicks on the 3D board play the player\'s move  ' + JSON.stringify(gt && gt.mv));
    const gSeat = await seatOf();
    const gFloor = await page.evaluate(() => { const f = LADDER[G.idx]; return f ? (f.seat || f.name) : ''; });
    ok(gSeat && gFloor && gSeat.who === gFloor && gSeat.drawn === (gFloor === 'Argus' ? 'dog' : 'person'),
      'the Gauntlet: the floor\'s own champion sits across the board (on the first floor Argus, as the dog)  ' + JSON.stringify({ seat: gSeat, floor: gFloor }));
    await shot('rooms3d-gauntlet');
    // the floor's clock: a cut banks it and stops it, and the clock the cut stopped starts again after
    const gClock = await until(() => page.evaluate(() => G.clockOn && G.S.turn === G.pc && !G.thinking && !!G.clockTick), 15000);
    const gc = gClock && await page.evaluate(async () => {
      PJCCBoard3D.handles[0].cut('mate', G.S.b.indexOf(G.pc === 'w' ? 'k' : 'K'));
      await new Promise((r) => setTimeout(r, 300));
      const during = { tick: G.clockTick, ms: G.clockMs, held: !!G.cutHeld };
      await new Promise((r) => setTimeout(r, 400));
      const later = G.clockMs;
      PJCCBoard3D.handles[0].endCut();
      await new Promise((r) => setTimeout(r, 100));
      return { during: during, later: later, after: !!G.clockTick, held: !!G.cutHeld };
    });
    ok(gc && gc.during.tick === null && gc.during.held && gc.during.ms === gc.later && gc.after && !gc.held,
      'the Gauntlet: a cut banks the floor\'s clock and stops it, and the clock it stopped runs again after  ' + JSON.stringify(gc));
  } catch (e) {
    errors.push('TEST: ' + e.message);
  } finally {
    await browser.close();
    server.close();
    try { fs.unlinkSync(PT_TMP); fs.unlinkSync(CSS_TMP); } catch (e) {}
  }
  process.exit(report('THE TILTED 3D BOARD IN EACH CHESS ROOM', results, errors) ? 0 : 1);
})();
