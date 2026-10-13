/* ANALYSIS BOARD — drive the real thing in a real browser.
 * Serves the repo (Stockfish needs a real origin: no Worker or WASM over file://),
 * opens the actual Puzzle Room page — which now loads pjcc-chess.js + pjcc-analysis.js —
 * and checks the board, the moves, the promotion picker and the live eval bar.
 * PASS/FAIL per assertion; exits non-zero on any failure. */
const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const { findChrome, bottomSide, inkAt } = require('./harness');
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

  /* ══ THE GAME STAYS (2026-10-12) ═══════════════════════════════════════════════════
     Nate: "are we able to make it like other sites where you can experiment with other moves at
     any position of the game just played?" Until today a different move CUT the list at the move
     you stood on, and the review's door loaded the game only as far as that move. */
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const GAME = 'e2e4 e7e5 g1f3 b8c6 f1c4 g8f6 f3g5 d7d5 e4d5 c6a5';
  const SANS = 'e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5 exd5 Na5';
  const reopen = async (opts) => {
    await p.evaluate((o) => {
      const x = document.querySelector('.pab-x'); if (x) x.click();
      return PJCCAnalysis.open(o);
    }, opts);
    await sleep(300);
  };
  const view = () => p.evaluate(() => {
    const ov = document.querySelector('.pab-ov'), mine = ov.querySelector('#pab-mine');
    const cells = [...ov.querySelectorAll('#pab-moves span[data-at]')];
    return { game: cells.filter(e => !e.classList.contains('mine')).map(e => e.textContent).join(' '),
             tail: cells.filter(e => e.classList.contains('mine')).map(e => e.textContent).join(' '),
             on: (ov.querySelector('#pab-moves .sel') || {}).textContent || '',
             dots: cells.filter(e => e.classList.contains('has')).map(e => e.textContent).join(' '),
             line: mine.hidden ? null : [...mine.querySelectorAll('[data-s]')].map(e => e.textContent.trim()).join(' '),
             lineOn: mine.hidden ? '' : ((mine.querySelector('.sel') || {}).textContent || '').trim(),
             rejoin: !mine.hidden && !!mine.querySelector('#pab-rejoin'),
             fwdOff: ov.querySelector('#pab-fwd').disabled, backOff: ov.querySelector('#pab-back').disabled,
             status: ov.querySelector('#pab-status').textContent };
  });
  // a tap on the square at (file, row) of the board AS DRAWN, top left = 0,0
  const tap2 = (a, b) => p.evaluate((a, b) => {
    const cv = document.querySelector('#pab-board canvas'), r = cv.getBoundingClientRect(), t = r.width / 8;
    [a, b].forEach(q => cv.dispatchEvent(new MouseEvent('click', { bubbles: true,
      clientX: r.left + q[0] * t + t / 2, clientY: r.top + q[1] * t + t / 2 })));
  }, a, b);
  const press = sel => p.evaluate(s => document.querySelector(s).click(), sel);
  const gameMove = n => p.evaluate(n => document.querySelectorAll('#pab-moves span[data-at]')[n - 1].click(), n);

  const hint = () => p.evaluate(() => {
    const m = document.querySelector('#pab-mine');
    return m.hidden ? 'hidden' : m.querySelector('[data-s]') ? 'a line' : 'the hint';
  });
  ok('a board with no game to leave says nothing about leaving it', (await hint()) === 'hidden');

  await reopen({ moves: GAME, ply: 6, subtitle: 'test' });
  let v = await view();
  ok('opened on move six of ten, ALL ten are listed', v.game === SANS && v.on === 'Nf6', v);
  ok('…so there is a rest of the game to step forward into', v.fwdOff === false, v);
  ok('…and one line says a different move may be tried here', (await hint()) === 'the hint');

  await tap2([3, 6], [3, 5]);                    // 4. d3, where the game played 4. Ng5
  await sleep(250);
  v = await view();
  ok('⛑ a different move leaves every move of the game in the list', v.game === SANS, v.game);
  ok('…and is written down as a line of your own, numbered from where it left',
     v.line === '4. d3' && v.lineOn === '4. d3', v);
  ok('…with the move it left from marked on the game', v.dots === 'Nf6', v.dots);
  ok('…and the engine is now looking at YOUR position', /Black to move/.test(v.status), v.status);
  await tap2([5, 0], [4, 1]);                    // 4… Be7
  await sleep(250);
  v = await view();
  ok('a reply goes on the end of your line', v.line === '4. d3 Be7' && v.lineOn === 'Be7', v);

  await press('#pab-back'); await press('#pab-back');
  await sleep(250);
  v = await view();
  ok('stepping back out of your line lands on the move it left from', v.on === 'Nf6' && v.lineOn === '', v);
  ok('…with the line still there to step back into', v.line === '4. d3 Be7' && v.rejoin === false, v);
  await press('#pab-fwd');
  await sleep(250);
  v = await view();
  ok('forward from there follows the GAME, not your line', v.on === 'Ng5' && v.line === null, v);

  await gameMove(6);
  await p.evaluate(() => document.querySelectorAll('#pab-mine [data-s]')[1].click());
  await sleep(250);
  v = await view();
  ok('a move of your line can be tapped straight back to', v.lineOn === 'Be7' && v.rejoin === true, v);
  await press('#pab-rejoin');
  await sleep(250);
  v = await view();
  ok('"Back to the main line" puts you on the game where you left it', v.on === 'Nf6' && v.lineOn === '', v);
  await tap2([3, 6], [3, 5]);                    // 4. d3 again, from the game
  await sleep(250);
  v = await view();
  ok('playing the first move of your line again steps into it, with the rest still there',
     v.line === '4. d3 Be7' && v.lineOn === '4. d3', v);
  await press('#pab-back');
  await sleep(250);

  await tap2([5, 5], [6, 3]);                    // 4. Ng5: the move the game itself played
  await sleep(250);
  v = await view();
  ok('the game\'s own next move just walks on down the game', v.on === 'Ng5' && v.game === SANS && v.dots === 'Nf6', v);
  await tap2([7, 1], [7, 2]);                    // 4… h6, where the game played 4… d5
  await sleep(250);
  v = await view();
  ok('a line that starts with Black is numbered "4…"', v.line === '4… h6', v.line);
  await gameMove(6);
  await sleep(250);
  v = await view();
  ok('⛑ a second line somewhere else does not cost you the first',
     v.line === '4. d3 Be7' && v.dots === 'Nf6 Ng5', v);

  await gameMove(10);
  await tap2([1, 6], [1, 5]);                    // past the game's last move: 6. b3
  await sleep(250);
  v = await view();
  ok('played on past the last move, yours goes on the end of the same list',
     v.game === SANS && v.tail === 'b3' && v.on === 'b3' && v.line === null, v);
  await tap2([7, 1], [7, 2]);                    // 6… h6
  await p.evaluate(() => document.querySelector('#pab-moves span.mine').click());
  await sleep(250);
  v = await view();
  ok('…and each of those can be tapped back to', v.tail === 'b3 h6' && v.on === 'b3', v);
  await press('#pab-back'); await sleep(150); await press('#pab-fwd');
  await sleep(250);
  v = await view();
  ok('…and from the game\'s last move, forward walks into them', v.on === 'b3', v);

  await press('#pab-reset');
  await sleep(250);
  v = await view();
  ok('Reset drops every line of yours and stands you where the board opened',
     v.game === SANS && v.tail === '' && v.dots === '' && v.on === 'Nf6' && v.line === null, v);
  ok('…and the hint does not come back once a line has been tried', (await hint()) === 'hidden');

  /* ── the puzzle room's door: `ply: 0` stands at the START with the line listed ──
     Its own note has said "the solution is right there in the move list to step into" since
     2026-08-11, and until today the list arrived empty. Black moves first here on purpose. */
  await reopen({ fen: '3r2k1/5ppp/8/8/8/8/5PPP/6K1 b - - 0 1', moves: 'd8d1', ply: 0, flip: true });
  v = await view();
  const row1 = await p.evaluate(() => [...document.querySelector('#pab-moves').children].slice(0, 3)
    .map(e => e.tagName + ':' + e.textContent));
  ok('ply 0 with a line: standing at the start, the line listed and nothing selected',
     v.game === 'Rd1#' && v.on === '' && v.fwdOff === false && v.backOff === true && /Black to move/.test(v.status), v);
  ok('…and a line Black starts leaves White\'s cell of move 1 empty',
     row1.join('|') === 'I:1.|SPAN:|SPAN:Rd1#', row1);

  /* ── which way it faces: read off the PIXELS, never asked of the page ─────────── */
  const barHangs = (bar, fill) => p.evaluate((bar, fill) => {
    const b = document.querySelector(bar).getBoundingClientRect(), f = document.querySelector(fill).getBoundingClientRect();
    return Math.abs(f.top - b.top) < 3 ? 'top' : Math.abs(f.bottom - b.bottom) < 3 ? 'bottom' : 'neither';
  }, bar, fill);
  await reopen({ moves: GAME, flip: true });
  let side = await bottomSide(p, '#pab-board canvas');
  ok('flip: true draws Black\'s pieces nearest you', side.side === 'b', side);
  /* ⚠ AND LEFT FOR RIGHT. Black's knight went to a5: from Black's chair that is the RIGHT edge,
     five rows down. Turned top-for-bottom only, it would stand on the left edge. */
  let knight = [await inkAt(p, '#pab-board canvas', 7, 4), await inkAt(p, '#pab-board canvas', 0, 4)];
  ok('…turned all the way round, not just top for bottom', knight[0].b > 100 && knight[1].b === 0, knight);
  ok('…and the bar turns with the board: White\'s share hangs from the top',
     (await barHangs('.pab-bar', '#pab-fill')) === 'top');
  await press('#pab-flip');
  await sleep(200);
  side = await bottomSide(p, '#pab-board canvas');
  ok('the Flip button turns the board back', side.side === 'w', side);
  ok('…and the bar with it', (await barHangs('.pab-bar', '#pab-fill')) === 'bottom');

  await p.evaluate(() => document.querySelector('.pab-x').click());
  await new Promise(r => setTimeout(r, 200));
  ok('closing removes the overlay', await p.evaluate(() => !document.querySelector('.pab-ov')));
  ok('the page scroll lock is released',
     await p.evaluate(() => document.body.style.overflow !== 'hidden'));
  ok('no page errors anywhere in that run', errs.length === 0, errs.slice(0, 3));

  /* ══ THE REVIEW LOOKS FROM YOUR CHAIR — the Gauntlet's real result card (2026-10-12) ═══
     Nate: "Can we make the board orient always with our pieces starting at the bottom? The review
     had it flipped." The review had no idea which side you played: it drew White below, always.
     ⚠ OVER HTTP, because the review is Stockfish (gauntlet.check.js runs from file://, where no
     Worker loads). Only real exceptions count here: this room's two stylesheets are built by
     Jekyll, there is no Jekyll in this harness, and their 404s are the harness's, not the room's. */
  const g = await b.newPage();
  await g.setViewport({ width: 1100, height: 900 });
  const gerrs = [];
  g.on('pageerror', e => gerrs.push(String(e).slice(0, 140)));
  await g.goto(`http://localhost:${PORT}/assets/games/pjcc_gauntlet.html`, { waitUntil: 'networkidle2' });
  await sleep(600);
  ok('the Gauntlet loads the analysis board beside its review',
     await g.evaluate(() => !!window.PJCCReview && !!window.PJCCAnalysis && PJCCAnalysis.available()));
  /* A rung in the named chair, the moves of a real opening on its scoresheet, resigned: the card
     that comes up is the room's own, and the button pressed is the one a player presses. */
  const finishAs = async (color) => {
    await g.evaluate((color, game) => {
      const ov = document.querySelector('.pgr-ov'); if (ov) ov.querySelector('.pgr-x').click();
      startRung(0, color, null);
      G.uci = game.split(' '); G.log = new Array(G.uci.length).fill('Nf3');
      endGame('resign');
      [...document.querySelectorAll('button')].find(e => /REVIEW GAME/.test(e.textContent)).click();
    }, color, GAME);
    await g.waitForSelector('#pgr-board canvas', { timeout: 60000 });
    await sleep(300);
  };
  const gBar = (bar, fill) => g.evaluate((bar, fill) => {
    const b = document.querySelector(bar).getBoundingClientRect(), f = document.querySelector(fill).getBoundingClientRect();
    return Math.abs(f.top - b.top) < 3 ? 'top' : Math.abs(f.bottom - b.bottom) < 3 ? 'bottom' : 'neither';
  }, bar, fill);

  await finishAs('b');
  side = await bottomSide(g, '#pgr-board canvas');
  ok('⛑ played as Black, the review shows Black\'s pieces nearest you', side.side === 'b', side);
  knight = [await inkAt(g, '#pgr-board canvas', 7, 4), await inkAt(g, '#pgr-board canvas', 0, 4)];
  ok('…turned all the way round: the knight on a5 is on the right edge', knight[0].b > 100 && knight[1].b === 0, knight);
  ok('…and its bar hangs White\'s share from the top', (await gBar('.pgr-bar', '#pgr-evalfill')) === 'top');
  ok('the review offers the analysis board here too', await g.evaluate(() => !!document.getElementById('pgr-analyse')));
  await g.evaluate(() => { document.querySelectorAll('.pgr-cell')[3].click(); document.getElementById('pgr-analyse').click(); });
  await sleep(400);
  side = await bottomSide(g, '#pab-board canvas');
  ok('⛑ …and the analysis board behind it faces the same way', side.side === 'b', side);
  const through = await g.evaluate(() => {
    const cells = [...document.querySelectorAll('#pab-moves span[data-at]')];
    return { n: cells.length, on: (document.querySelector('#pab-moves .sel') || {}).textContent || '',
             fwdOff: document.querySelector('#pab-fwd').disabled };
  });
  ok('⛑ the review\'s door brings the WHOLE game, standing on the move you were looking at',
     through.n === 10 && through.on === 'Nc6' && through.fwdOff === false, through);
  await g.evaluate(() => document.querySelector('.pab-x').click());

  await finishAs('w');
  side = await bottomSide(g, '#pgr-board canvas');
  ok('played as White, the review shows White\'s pieces nearest you', side.side === 'w', side);
  ok('…and its bar stands White\'s share on the bottom', (await gBar('.pgr-bar', '#pgr-evalfill')) === 'bottom');
  await g.evaluate(() => document.getElementById('pgr-analyse').click());
  await sleep(400);
  side = await bottomSide(g, '#pab-board canvas');
  ok('…and so does the analysis board behind it', side.side === 'w', side);
  ok('no script error in the Gauntlet through any of it', gerrs.length === 0, gerrs.slice(0, 3));
  await g.close();

  console.log(`\nRESULT: ${fail ? 'FAIL' : 'PASS'} — ${pass} passed, ${fail} failed`);
  await b.close();
  server.close();
  process.exit(fail ? 1 : 0);
})().catch((e) => {
  /* ⚠ A STEP THAT THROWS IS A FAILED RUN WITH A LAST LINE, not a stack trace and silence: the checks
     that went red before it are the news, and a run with no RESULT reads as "it never ran". */
  console.log('  ✗ FAIL  the run stopped on an error   ' + String(e && e.message || e).slice(0, 200));
  console.log(`\nRESULT: FAIL — ${pass} passed, ${fail + 1} failed (stopped early)`);
  process.exit(1);
});
