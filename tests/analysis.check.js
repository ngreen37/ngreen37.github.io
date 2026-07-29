/* ANALYSIS BOARD — drive the real thing in a real browser.
 * Serves the repo (Stockfish needs a real origin: no Worker or WASM over file://),
 * opens the actual Puzzle Room page — which now loads pjcc-chess.js + pjcc-analysis.js —
 * and checks the board, the moves, the promotion picker and the live eval bar.
 * PASS/FAIL per assertion; exits non-zero on any failure. */
const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const { findChrome } = require('./harness');
const ROOT = path.join(__dirname, '..');
const PORT = 8099;
const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.wasm': 'application/wasm',
               '.css': 'text/css', '.json': 'application/json', '.png': 'image/png' };

const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  fs.readFile(p, (e, b) => {
    if (e) { res.writeHead(404); return res.end('nope'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
    res.end(b);
  });
});

let pass = 0, fail = 0;
const ok = (name, cond, extra) => {
  if (cond) { pass++; console.log('  \u2713 PASS  ' + name); }
  else { fail++; console.log('  \u2717 FAIL  ' + name + (extra ? '   ' + JSON.stringify(extra) : '')); }
};

(async () => {
  await new Promise(r => server.listen(PORT, r));
  const b = await puppeteer.launch({ executablePath: findChrome(), args: ['--no-sandbox'] });
  const p = await b.newPage();
  await p.setViewport({ width: 1100, height: 900 });
  const errs = [];
  p.on('pageerror', e => errs.push(String(e).slice(0, 140)));
  p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 140)); });
  await p.goto(`http://localhost:${PORT}/assets/games/pjcc_fork.html`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 800));

  ok('the puzzle page loads the referee + the analysis module',
     await p.evaluate(() => !!window.PJCCChess && !!window.PJCCAnalysis && PJCCAnalysis.available()));
  ok('the Analysis button starts hidden (no puzzle resolved yet)',
     await p.evaluate(() => document.getElementById('analysis-btn').classList.contains('hidden')));

  // ── open the board on a real opening, and check what it built ──────────────────
  const opened = await p.evaluate(() => PJCCAnalysis.open({
    moves: 'e2e4 e7e5 g1f3 b8c6 f1c4 g8f6 f3g5 d7d5 e4d5 c6a5',
    subtitle: 'test'
  }));
  await new Promise(r => setTimeout(r, 400));
  ok('open() returns true', opened === true);

  const built = await p.evaluate(() => {
    const ov = document.querySelector('.pab-ov');
    const spans = ov.querySelectorAll('.pab-moves span[data-at]');
    return { ov: !!ov, canvas: !!ov.querySelector('#pab-board canvas'),
             moveCount: spans.length,
             lastSan: spans[spans.length - 1].textContent,
             status: ov.querySelector('#pab-status').textContent,
             barH: ov.querySelector('#pab-fill').style.height };
  });
  ok('the overlay draws a real canvas board', built.canvas);
  ok('all ten plies are listed', built.moveCount === 10, built);
  ok('the last move is named correctly (Na5)', built.lastSan === 'Na5', built.lastSan);
  ok('it knows whose move it is', /White to move/.test(built.status), built.status);

  // ── the eval bar has to actually MOVE — that was the ask ──────────────────────
  const before = await p.evaluate(() => document.querySelector('#pab-eval').textContent);
  await new Promise(r => setTimeout(r, 6000));            // let a search land
  const after = await p.evaluate(() => ({
    text: document.querySelector('#pab-eval').textContent,
    depth: document.querySelector('#pab-depth').textContent,
    bar: document.querySelector('#pab-fill').style.height,
    pv: document.querySelector('#pab-pvtext').textContent
  }));
  ok('the eval readout fills in', /^[+\u2212M#\u2212]/.test(after.text) || /^\u2212?\d/.test(after.text), after);
  ok('it reports a search depth', /depth \d+/.test(after.depth), after.depth);
  ok('the bar left its 50% resting position', after.bar !== '50%' && after.bar !== '', after.bar);
  ok('a best line is named in SAN', /[A-Za-z]/.test(after.pv) && after.pv !== 'Thinking\u2026', after.pv);
  /* \u26a0 REGRESSION GUARD, and it has to count MOVES, not tokens.
     This Stockfish build's final info line carries a one-move pv plus its own telemetry
     (`pv b5d3 bmc 0.0062`), which used to clobber the real line and leave a bare "8. Bd3"
     on screen for the whole search. Counting raw tokens is what let that through in the
     first place \u2014 `['b5d3','bmc','0.0062']` looks like three of something. So strip the
     move numbers and count what's left. Two is enough to prove the clobber is gone; the
     exact depth of a 2.5s search is not something to assert on. */
  var pvMoves = after.pv.trim().split(/\s+/).filter(function (t) { return !/^\d+[.\u2026]$/.test(t); });
  ok('the best line is a LINE, not one move', pvMoves.length >= 2, { pv: after.pv, moves: pvMoves });
  ok('the position is a known one (White is better after 10...Na5)',
     after.text.indexOf('+') === 0, after.text);

  // ── stepping back has to re-search, not keep the old number ───────────────────
  await p.evaluate(() => document.querySelector('#pab-back').click());
  await new Promise(r => setTimeout(r, 300));
  const stepped = await p.evaluate(() => ({
    status: document.querySelector('#pab-status').textContent,
    sel: !!document.querySelector('.pab-moves span.sel')
  }));
  ok('stepping back flips the side to move', /Black to move/.test(stepped.status), stepped.status);

  // ── play a move by clicking, the way a visitor does ───────────────────────────
  await p.evaluate(() => document.querySelector('#pab-fwd').click());
  await new Promise(r => setTimeout(r, 250));
  const clickMove = await p.evaluate(() => {
    const cv = document.querySelector('#pab-board canvas');
    const r = cv.getBoundingClientRect(), t = r.width / 8;
    // d5-d6 for White: file d = 3, rank 5 -> row 3 ; to rank 6 -> row 2
    function tap(file, row) {
      cv.dispatchEvent(new MouseEvent('click', { bubbles: true,
        clientX: r.left + file * t + t / 2, clientY: r.top + row * t + t / 2 }));
    }
    tap(3, 3); tap(3, 2);
    const spans = document.querySelectorAll('.pab-moves span[data-at]');
    return { n: spans.length, last: spans[spans.length - 1].textContent };
  });
  ok('clicking two squares plays a legal move (d6)', clickMove.last === 'd6', clickMove);
  ok('the move list grew', clickMove.n === 11, clickMove);

  // ── an ILLEGAL click must do nothing at all ───────────────────────────────────
  const illegal = await p.evaluate(() => {
    const cv = document.querySelector('#pab-board canvas');
    const r = cv.getBoundingClientRect(), t = r.width / 8;
    function tap(file, row) {
      cv.dispatchEvent(new MouseEvent('click', { bubbles: true,
        clientX: r.left + file * t + t / 2, clientY: r.top + row * t + t / 2 }));
    }
    tap(4, 0); tap(4, 4);                       // black king e8 -> e4, nonsense
    return document.querySelectorAll('.pab-moves span[data-at]').length;
  });
  ok('an illegal move is refused silently', illegal === 11, { plies: illegal });

  // ── promotion has to ASK, not auto-queen ─────────────────────────────────────
  await p.evaluate(() => {
    document.querySelector('.pab-x').click();
    return PJCCAnalysis.open({ fen: '8/P6k/8/8/8/8/6K1/8 w - - 0 1' });
  });
  await new Promise(r => setTimeout(r, 400));
  const promo = await p.evaluate(() => {
    const cv = document.querySelector('#pab-board canvas');
    const r = cv.getBoundingClientRect(), t = r.width / 8;
    function tap(file, row) {
      cv.dispatchEvent(new MouseEvent('click', { bubbles: true,
        clientX: r.left + file * t + t / 2, clientY: r.top + row * t + t / 2 }));
    }
    tap(0, 1); tap(0, 0);                       // a7 -> a8
    return !!document.querySelector('.pab-promo');
  });
  ok('a pawn reaching the last rank opens the promotion picker', promo);
  const underPromo = await p.evaluate(() => {
    const btn = document.querySelector('.pab-promo [data-p="n"]');
    if (btn) btn.click();
    const spans = document.querySelectorAll('.pab-moves span[data-at]');
    return spans.length ? spans[spans.length - 1].textContent : '(none)';
  });
  ok('under-promotion is honoured (a8=N)', underPromo === 'a8=N', underPromo);

  // ── a finished position must not be handed to the engine ─────────────────────
  await p.evaluate(() => {
    document.querySelector('.pab-x').click();
    return PJCCAnalysis.open({ fen: '7k/5QQ1/8/8/8/8/8/7K b - - 0 1' });   // black is mated
  });
  await new Promise(r => setTimeout(r, 600));
  const mate = await p.evaluate(() => ({
    eval: document.querySelector('#pab-eval').textContent,
    status: document.querySelector('#pab-status').textContent,
    pv: document.querySelector('#pab-pvtext').textContent,
    bar: document.querySelector('#pab-fill').style.height
  }));
  ok('checkmate is named, not evaluated', mate.eval === '#' && /Checkmate/.test(mate.status), mate);
  ok('the bar goes all the way to White', mate.bar === '100%', mate.bar);
  ok('it says there is nothing left to calculate', /nothing left/.test(mate.pv), mate.pv);

  await p.evaluate(() => document.querySelector('.pab-x').click());
  await new Promise(r => setTimeout(r, 200));
  ok('closing removes the overlay', await p.evaluate(() => !document.querySelector('.pab-ov')));
  ok('the page scroll lock is released',
     await p.evaluate(() => document.body.style.overflow !== 'hidden'));
  ok('no page errors anywhere in that run', errs.length === 0, errs.slice(0, 3));

  console.log(`\nRESULT: ${fail ? 'FAIL' : 'PASS'} — ${pass} passed, ${fail} failed`);
  await b.close();
  server.close();
  process.exit(fail ? 1 : 0);
})();
