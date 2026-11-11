// ChessWild: Campaign's SAND TABLE (his 11-10 pick #6): the map as a tilted 3D table, a lens over the flat map, and the
// dice thrown on it.   run: npm run test:sandtable
// ⚠ WebGL by SwiftShader, as test:board3d runs it: a machine with no WebGL is the flat map's, and that is checked too.
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { findChrome } = require('./harness');
const pp = require(path.join(ROOT, 'node_modules/puppeteer-core'));

let PASS = 0, FAIL = 0;
function ok(cond, msg) { if (cond) { PASS++; console.log('  ✓ PASS  ' + msg); } else { FAIL++; console.log('  ✗ FAIL  ' + msg); } }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const GAME = '/assets/games/pjcc_marchland.html';
const MARKER = 'setSound(sndOn);\nnewCampaign(chosenLevel);';
const HOOK = `
window.__mc = { get G() { return G; }, get PEND() { return PEND; }, SAND: SAND, tapLand: tapLand, idsOf: idsOf, nbrs: nbrs,
  pump: pump, LAND: function () { return LAND; } };
`;
const SRC = fs.readFileSync(path.join(ROOT, 'assets/js/pjcc-sandtable.js'), 'utf8');
const PAGE = fs.readFileSync(path.join(ROOT, GAME.slice(1)), 'utf8');

/* ── what the source says, before a browser opens ── */
const gen = fs.readFileSync(path.join(ROOT, 'tests/gen-three.js'), 'utf8');
const exported = ((/const EXPORTS = \[([\s\S]*?)\];/.exec(gen) || [])[1] || '').match(/'(\w+)'/g).map((s) => s.slice(1, -1)).concat('GLTFLoader');
const used = [...new Set([...SRC.matchAll(/\bT\.([A-Z]\w+)/g)].map((m) => m[1]))];
const bundle = fs.readFileSync(path.join(ROOT, 'assets/vendor/three/three.pjcc.min.js'), 'utf8');
const missing = used.filter((n) => !exported.includes(n) || !new RegExp('\\b' + n + ':').test(bundle));
ok(used.length >= 12 && missing.length === 0, 'every three.js class the sand table uses is in the site\'s built bundle  [' + (missing.join(' ') || used.length + ' classes') + ']');
ok(/<script src="\/assets\/js\/pjcc-sandtable\.js"><\/script>/.test(PAGE) && /SAND\.set\(\{ land: LAND, edges: EDGES, nodes: sandNodes, links: sandLinks/.test(PAGE),
   'the Campaign page loads it and drawMap hands it what it drew');
ok(/press: function \(id\) \{ tapLand\(id\); \}/.test(PAGE), 'a press on the sand is the page\'s own tapLand: the rules play every tap');

function serve(block) {
  return new Promise((res) => {
    const srv = http.createServer((req, rsp) => {
      const p = decodeURIComponent(req.url.split('?')[0]);
      if (block && p.indexOf(block) >= 0) { rsp.writeHead(404); rsp.end(); return; }
      fs.readFile(path.join(ROOT, p), (err, buf) => {
        if (err) { rsp.writeHead(404); rsp.end(); return; }
        let body = buf;
        if (p === GAME) { const s = buf.toString('utf8').replace(/\r\n/g, '\n'), i = s.lastIndexOf(MARKER); body = s.slice(0, i) + HOOK + s.slice(i); }
        const type = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
          '.png': 'image/png', '.glb': 'model/gltf-binary' }[path.extname(p)] || 'application/octet-stream';
        rsp.writeHead(200, { 'Content-Type': type }); rsp.end(body);
      });
    });
    srv.listen(0, '127.0.0.1', () => res(srv));
  });
}

(async () => {
  console.log('\n=== ChessWild: Campaign — the sand table ===');
  const exe = findChrome();
  if (!exe) { console.log('No Chrome/Edge found.'); process.exit(2); }
  const browser = await pp.launch({ executablePath: exe, headless: 'new',
    args: ['--no-sandbox', '--mute-audio', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const errs = [];
  let srv = await serve(null);
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 375, height: 740, deviceScaleFactor: 1 });
    page.on('pageerror', (e) => errs.push(e.message));
    const url = `http://127.0.0.1:${srv.address().port}${GAME}`;
    await page.goto(url, { waitUntil: 'load' });
    await page.evaluate(() => { localStorage.setItem('pjcc.campaign.cards', '0'); localStorage.setItem('pjcc.campaign.fog', '0'); localStorage.removeItem('pjcc.campaign.map.flat'); });
    await page.reload({ waitUntil: 'load' });
    await page.click('#four');
    await page.waitForFunction(() => window.__mc && __mc.SAND && __mc.SAND.up(), { timeout: 30000 });
    await sleep(300);
    const up = await page.evaluate(() => ({ on: __mc.SAND.on(), sand: document.getElementById('mapbox').classList.contains('sand-on'),
      canvas: !!document.querySelector('#mapbox canvas.pjcc-sandtable'), btn: document.querySelector('.mapview').textContent,
      hiddenNodes: getComputedStyle(document.querySelector('#mapbox .node')).opacity }));
    ok(up.on && up.sand && up.canvas && up.btn === 'Map: Sand table' && up.hiddenNodes === '0',
       '⭐ the map is a sand table: the canvas over the flat map, the flat map kept under it unseen  [' + up.btn + ']');
    /* every holding is pressed where it is drawn */
    const picks = await page.evaluate(() => __mc.LAND().map((L) => { const p = __mc.SAND.pointOf(L.id); return p ? __mc.SAND.holdingAt(p[0], p[1]) : -9; }));
    ok(picks.every((id, i) => id === i), 'every one of the sixteen holdings is pressed where the camera draws it  [' + picks.join(',') + ']');
    /* a real press on the sand deploys: the page's own tapLand */
    const mine = await page.evaluate(() => { const G = __mc.G; return { id: __mc.idsOf('m')[3], was: G.ranks[__mc.idsOf('m')[3]], left: G.toPlace }; });
    const pt = await page.evaluate((id) => { const p = __mc.SAND.pointOf(id), r = document.getElementById('mapbox').getBoundingClientRect(); return [r.left + p[0], r.top + p[1]]; }, mine.id);
    await page.mouse.click(pt[0], pt[1]);
    await sleep(150);
    const dep = await page.evaluate((id) => ({ now: __mc.G.ranks[id], left: __mc.G.toPlace }), mine.id);
    ok(dep.now === mine.was + 1 && dep.left === mine.left - 1, 'a press on a holding of yours places a troop there, as a tap on the flat map does');
    await page.evaluate(() => { const G = __mc.G; while (G.phase === 'deploy' && G.toPlace > 0) __mc.tapLand(__mc.idsOf('m')[3]); });
    await sleep(500);
    /* the dice: thrown on the table first, the roll screen opening on them rolled */
    const thrown = await page.evaluate(() => {
      const G = __mc.G, from = 3, to = __mc.nbrs(3).filter((j) => G.own[j] !== 'm')[0];
      __mc.tapLand(from); __mc.tapLand(to);
      const P = __mc.PEND;
      return { throwing: __mc.SAND.throwing(), roll: document.getElementById('screen-roll').classList.contains('on'),
        pools: [].concat(P.aMatPool, P.aPosPool, P.dMatPool, P.dPosPool), dice: __mc.SAND.dice().map((d) => d.v) };
    });
    ok(thrown.throwing && !thrown.roll && thrown.dice.join() === thrown.pools.join(),
       '⭐ an attack throws its dice on the table — every die the roll will show, and the roll screen waits  [' + thrown.dice.join(' ') + ']');
    await page.waitForFunction(() => document.getElementById('screen-roll').classList.contains('on'), { timeout: 6000 });
    const rolled = await page.evaluate(() => ({ ready: !document.getElementById('tobattle').disabled, preview: !document.getElementById('preview').hidden,
      dice: document.querySelectorAll('#att-mat .die.kept, #def-mat .die.kept, #att-pos .die.kept, #def-pos .die.kept').length }));
    ok(rolled.ready && rolled.preview && rolled.dice === 4, '…then the roll screen opens on them rolled, nothing rolled twice');
    /* two machines' battle throws its dice too, and waits for nobody */
    const clash = await page.evaluate(() => {
      const G = __mc.G, $ = (id) => document.getElementById(id);
      __mc.G.busy = false;
      ['screen-roll'].forEach((s) => $(s).classList.remove('on')); $('screen-map').classList.add('on');
      G.ranks[11] = 9; G.ranks[15] = 1; G.phase = 'theirs'; G.busy = true; G.acting = 'u';
      G.q = [{ t: 'attack', from: 11, to: 15, side: 'u' }];
      __mc.pump();
      return { throwing: __mc.SAND.throwing(), roll: $('screen-roll').classList.contains('on') };
    });
    ok(clash.throwing && !clash.roll, 'two machines\' battle throws its dice on the table and opens no roll screen');
    /* Map: Flat, and back */
    await page.evaluate(() => { const $ = (id) => document.getElementById(id); $('screen-roll').classList.remove('on'); $('screen-map').classList.add('on'); });
    await page.click('.mapview');
    await sleep(120);
    const flat = await page.evaluate(() => ({ on: __mc.SAND.on(), sand: document.getElementById('mapbox').classList.contains('sand-on'),
      btn: document.querySelector('.mapview').textContent, op: getComputedStyle(document.querySelector('#mapbox .node')).opacity,
      kept: localStorage.getItem('pjcc.campaign.map.flat') }));
    await page.click('.mapview');
    await sleep(120);
    const again = await page.evaluate(() => __mc.SAND.on() && document.querySelector('.mapview').textContent);
    ok(!flat.on && !flat.sand && flat.btn === 'Map: Flat' && flat.op === '1' && flat.kept === '1' && again === 'Map: Sand table',
       '"Map: Flat" puts the flat map back and is kept for this device; pressed again, the sand table');
    /* the eight-sided die: each number on one face, opposite faces adding to nine */
    const faces = await page.evaluate(() => PJCCSand.FACES);
    ok(faces.length === 8 && faces.map((f) => f[3]).sort().join() === '1,2,3,4,5,6,7,8' &&
       faces.every((f) => faces.some((g) => g[0] === -f[0] && g[1] === -f[1] && g[2] === -f[2] && g[3] + f[3] === 9)),
       'the die is a true eight: every number once, opposite faces adding to nine');
    await page.close();

    /* ⚠ NO 3D: the bundle blocked, and the page is the flat map it always was */
    srv.close();
    srv = await serve('three.pjcc');
    const p2 = await browser.newPage();
    await p2.setViewport({ width: 375, height: 740 });
    p2.on('pageerror', (e) => errs.push(e.message));
    await p2.goto(`http://127.0.0.1:${srv.address().port}${GAME}`, { waitUntil: 'load' });
    await p2.click('#four');
    await sleep(1500);
    const none = await p2.evaluate(() => ({ up: __mc.SAND.up(), sand: document.getElementById('mapbox').classList.contains('sand-on'),
      btn: document.querySelector('.mapview').hidden, nodes: document.querySelectorAll('#mapbox .node').length }));
    const roll = await p2.evaluate(() => { const G = __mc.G; while (G.phase === 'deploy' && G.toPlace > 0) __mc.tapLand(__mc.idsOf('m')[3]); return true; });
    await sleep(500);
    const flatRoll = await p2.evaluate(() => { const G = __mc.G; __mc.tapLand(3); __mc.tapLand(__mc.nbrs(3).filter((j) => G.own[j] !== 'm')[0]);
      return document.getElementById('screen-roll').classList.contains('on'); });
    ok(!none.up && !none.sand && none.btn && none.nodes === 16 && roll && flatRoll,
       'with no 3D to show the map stays flat, the switch is not offered, and the roll screen opens straight away');
  } catch (e) {
    FAIL++; console.log('  ✗ FAIL  harness threw: ' + e.message);
  } finally {
    await browser.close(); srv.close();
  }
  ok(errs.length === 0, 'no page errors' + (errs.length ? ' -> ' + errs.slice(0, 3).join(' | ') : ''));
  console.log('\nRESULT: ' + (FAIL ? 'FAIL (' + FAIL + '/' + (PASS + FAIL) + ' checks failed)' : 'PASS (' + PASS + ' checks)'));
  process.exit(FAIL ? 1 : 0);
})();
