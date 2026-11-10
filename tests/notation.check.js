// Notation Run on the beat, as the game has it (assets/games/notation_run.html, his 11-03 "do numbers eight and nine
// and ten"): played in a real browser, the page served over http so its own scripts and art load.
// Locks in:
//   - the board leans back with the tempo (about 5° at Medium, 8° in Fever), and every square, pressed where the
//     leaning board draws it, is that square; a real click on it, on the beat, is a Perfect
//   - the board pulses on the beat, and ten Perfects flood the cabinet with Fever
//   - the device's Reduce Motion settles the board flat and still, every square still pressed where it is
//   run:  npm run test:notation
const http = require('http'), fs = require('fs'), path = require('path');
const puppeteer = require('puppeteer-core');
const { findChrome, report } = require('./harness');

const ROOT = path.join(__dirname, '..');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webp': 'image/webp',
  '.svg': 'image/svg+xml', '.json': 'application/json', '.woff2': 'font/woff2' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
  const port = server.address().port;
  const results = [], errors = [];
  const ok = (cond, msg) => results.push({ pass: !!cond, msg });
  const browser = await puppeteer.launch({ executablePath: exe, headless: 'new',
    args: ['--no-sandbox', '--mute-audio', '--autoplay-policy=no-user-gesture-required'] });
  try {
    const page = await browser.newPage();
    page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
    await page.setViewport({ width: 560, height: 820 });
    await page.goto('http://localhost:' + port + '/assets/games/notation_run.html', { waitUntil: 'load', timeout: 15000 });
    await page.evaluate(() => { const i = document.getElementById('intro-screen'); if (i) i.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); });
    await page.click('#start-btn');
    await sleep(900);
    const deg = await page.evaluate(() => V.lean * 180 / Math.PI);
    ok(deg > 4 && deg < 6.5, 'the board leans back at Medium  [' + deg.toFixed(2) + '°]');
    const tapMap = () => page.evaluate(() => {
      const r = canvas.getBoundingClientRect(), bad = [];
      for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
        const b = boardCenter(x, y), p = leanPt(b.x, b.y);
        const sq = canvasToSquare(r.left + p.x * r.width / W, r.top + p.y * r.height / H);
        if (!sq || sq.x !== x || sq.y !== y) bad.push(x + ',' + y);
      }
      return bad;
    });
    let bad = await tapMap();
    ok(bad.length === 0, 'every square of the leaning board is pressed where it is drawn  [' + (bad.join(' ') || 'all 64') + ']');
    const beat = await page.evaluate(async () => {
      let lo = 9, hi = -1;
      for (let i = 0; i < 120; i++) { await new Promise((r) => requestAnimationFrame(r)); lo = Math.min(lo, V.beat); hi = Math.max(hi, V.beat); }
      return [lo, hi];
    });
    ok(beat[1] > 0.8 && beat[0] < 0.2, 'the board pulses on the beat  [' + beat.map((v) => v.toFixed(2)).join('..') + ']');
    const next = () => page.evaluate(async (click) => {
      let c = null;
      for (let i = 0; i < 600 && !c; i++) { await new Promise((r) => requestAnimationFrame(r)); c = G.calls.find((k) => k.status === 'pending'); }
      if (!c) return -1;
      while (nowSec() < c.hitTime - 0.004) await new Promise((r) => setTimeout(r, 1));
      if (!click) { resolveAt(c.x, c.y); return G.res.perfect; }
      const r = canvas.getBoundingClientRect(), b = boardCenter(c.x, c.y), p = leanPt(b.x, b.y);
      canvas.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: r.left + p.x * r.width / W, clientY: r.top + p.y * r.height / H }));
      return G.res.perfect;
    }, click);
    let click = true;
    const perfect = await next();
    ok(perfect === 1, 'a real click on the leaning board, on the beat, is a Perfect  [perfect=' + perfect + ']');
    click = false;
    for (let n = 0; n < 9; n++) await next();
    await sleep(450);
    const fever = await page.evaluate(() => ({ on: G.feverOn, lv: V.fever, deg: V.lean * 180 / Math.PI }));
    ok(fever.on && fever.lv > 0.9 && fever.deg > 7, 'ten Perfects: Fever floods the cabinet and the board leans further  [flood ' + fever.lv.toFixed(2) + ', ' + fever.deg.toFixed(2) + '°]');
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await sleep(1000);
    const still = await page.evaluate(async () => {
      let hi = -1;
      for (let i = 0; i < 90; i++) { await new Promise((r) => requestAnimationFrame(r)); hi = Math.max(hi, V.beat); }
      return { lean: V.lean, beat: hi };
    });
    ok(still.lean === 0 && still.beat === 0, 'with the device\'s Reduce Motion the board settles flat and still  [' + JSON.stringify(still) + ']');
    bad = await tapMap();
    ok(bad.length === 0, '…and every flat square is pressed where it is  [' + (bad.join(' ') || 'all 64') + ']');

    /* ⭐ EVERY DOG'S OPENING, A CHART (his 11-05, dog idea #7): the chart button pressed again turns to the next dog's
       and round to the first, and the one it shows is the one that plays */
    const chart = await browser.newPage();
    chart.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
    await chart.setViewport({ width: 560, height: 820 });
    await chart.goto('http://localhost:' + port + '/assets/games/notation_run.html', { waitUntil: 'load', timeout: 15000 });
    await chart.evaluate(() => { const i = document.getElementById('intro-screen'); if (i) i.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); });
    const turned = [];
    for (let i = 0; i < 7; i++) {
      await chart.click('#mode-row [data-charts]');
      turned.push(await chart.evaluate(() => { const b = document.querySelector('#mode-row [data-charts]'); return b.dataset.mode + '=' + selMode + ':' + b.textContent; }));
    }
    const want = ['pirc:PircPrincess', 'catalan:CatalanPrincess', 'larsen:LarsenMilo', 'slav:SlavMilo', 'kia:KIAArgus', 'caro:Caro-KannArgus', 'pirc:PircPrincess']
      .map((w) => w.split(':')[0] + '=' + w.split(':')[0] + ':' + w.split(':')[1] + "'s opening");
    ok(turned.join(' | ') === want.join(' | '), 'the chart button, pressed again, turns through every dog\'s opening and round to the first  [' + turned.map((t) => t.split('=')[0]).join(' ') + ']');
    await chart.click('#mode-row [data-charts]');
    await chart.click('#start-btn');
    const first = await chart.evaluate(() => G.mode + ' ' + (G.queue[0] ? G.queue[0].san : 'none') + ' ' + G.total);
    ok(first === 'catalan d4 16', 'the chart it shows is the one that plays: the Catalan, from d4, sixteen calls  [' + first + ']');
    await chart.close();
  } catch (e) {
    errors.push('HARNESS THREW: ' + e.message);
  } finally {
    await browser.close();
    server.close();
  }
  process.exit(report('Notation Run on the beat', results, errors) ? 0 : 1);
})();
