/* =============================================================================
 * sim-marchland.js — how often does an attack actually fail?
 *   npm run sim:marchland          (env: N=150 SEC_PER_MOVE=1.4 ENGINE_MS=60)
 * -----------------------------------------------------------------------------
 * Nate, 2026-08-08: "Attacks SHOULD fail about what… 40% to 60% of the time?
 * We'll hash it out as we go - I'm not too worried about it."
 *
 * He is not worried about it, which is exactly why it needs a number rather than a
 * feeling: "about half" is easy to say and easy to be 20 points wrong about, and the
 * only way anyone would find out is by playing forty battles and keeping score. This
 * does that in a few minutes.
 *
 * ⚠⚠ WHAT THIS MEASURES, SAID HONESTLY, BECAUSE THE NUMBER IS ONLY WORTH THE CAVEAT.
 * It plays the REAL game's dice, muster, position dice and board builder — those are
 * called directly out of the shipped page, not reimplemented. But it plays the battle
 * ENGINE vs ENGINE, and the real game is engine vs HUMAN. Two consequences:
 *   · Both sides here play the same strength. A human attacker who is better than the
 *     engine will succeed more often than this says; a weaker one, less.
 *   · The clock cannot be simulated honestly — the engine answers in milliseconds and
 *     would never flag. So the clock is modelled as a MOVE BUDGET: 20s and 15s divided
 *     by SEC_PER_MOVE, a blitz pace. Run out of moves = run out of clock.
 * So: a calibration instrument, not a prediction. It tells you which way a constant
 * moves the game and roughly how far, which is all it is being asked for.
 *
 * THE DIALS, all in assets/games/pjcc_marchland.html:
 *   MAT_SCALE   d20 → material points (both sides)
 *   DEF_EDGE    flat home-ground points for the defender
 *   CLOCK_ATT / CLOCK_DEF   the two clocks
 * Move one, re-run this, keep the failure rate in his 40-60% band.
 * ========================================================================== */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { findChrome } = require(path.join(ROOT, 'tests/harness.js'));
const pp = require(path.join(ROOT, 'node_modules/puppeteer-core'));

const N = +(process.env.N || 60);
const SEC_PER_MOVE = +(process.env.SEC_PER_MOVE || 1.4);
/* ⚠ 35ms, and the whole sweep still takes minutes. Every band is N battles x ~20 plies x
   one search, so this number multiplies out by about 3000. It is deliberately weaker than
   the 180ms the shipped game gives its engine — this is measuring the SHAPE of the curve
   across the dial, not reproducing a real opponent. */
const ENGINE_MS = +(process.env.ENGINE_MS || 35);

/* ⚠ THE GAME IS ONE BIG IIFE, so none of its functions are reachable from the outside —
   which is correct for a shipped page and inconvenient for exactly one caller, this file.
   Rather than punch a permanent hole in the game to suit a test, the source is instrumented
   IN MEMORY: a hook is spliced in just before the closing `})();` so it shares the game's
   scope, and the modified copy is served at the game's own URL. The file on disk is never
   touched and the site ships nothing extra. Same trick as tests/harness.js, over HTTP
   instead of file:// so the game's real /assets/ imports still resolve. */
const GAME = '/assets/games/pjcc_marchland.html';
/* `setEdge` lets one run SWEEP the attacker's material edge instead of me editing a
   constant and re-running four times. It writes the game's own variable, so every battle
   still goes through the shipped matBudget() — the sweep changes the dial, never the
   machine. */
const HOOK = `
window.__ML = { d20:d20, matBudget:matBudget, muster:muster, buildBoard:buildBoard,
  applyAttackerPos:applyAttackerPos, applyDefenderPos:applyDefenderPos, bestMove:bestMove,
  CLOCK_ATT:CLOCK_ATT, CLOCK_DEF:CLOCK_DEF, MAT_SCALE:MAT_SCALE,
  edge: function () { return ATT_EDGE; },
  setEdge: function (v) { ATT_EDGE = v; } };
`;
function instrumented() {
  const src = fs.readFileSync(path.join(ROOT, GAME.slice(1)), 'utf8');
  const at = src.lastIndexOf('})();');
  if (at < 0) throw new Error('could not find the end of the game IIFE — re-read the file');
  return src.slice(0, at) + HOOK + src.slice(at);
}

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
function serve(html) {
  return new Promise((res) => {
    const srv = http.createServer((req, r) => {
      const p = decodeURIComponent(req.url.split('?')[0]);
      if (p === GAME) {
        r.writeHead(200, { 'Content-Type': 'text/html' }); r.end(html); return;
      }
      fs.readFile(path.join(ROOT, p), (err, buf) => {
        if (err) { r.writeHead(404); r.end(); return; }
        r.writeHead(200, { 'Content-Type': MIME[path.extname(p).toLowerCase()] || 'text/plain' });
        r.end(buf);
      });
    });
    srv.listen(0, () => res(srv));
  });
}

(async () => {
  const exe = findChrome();
  if (!exe) { console.error('No Chrome/Edge found. Install one or set CHROME_PATH.'); process.exit(2); }
  const srv = await serve(instrumented());
  const port = srv.address().port;
  /* ⚠ protocolTimeout: 0. The whole sweep runs inside ONE page.evaluate, which puppeteer
     will otherwise abandon after 180s — and it abandons it by throwing, so a long sweep
     failed as a "crash" rather than as a slow success. */
  const browser = await pp.launch({ executablePath: exe, headless: 'new',
    args: ['--no-sandbox', '--mute-audio'], protocolTimeout: 0 });
  let out;
  try {
    const page = await browser.newPage();
    page.on('pageerror', (e) => console.log('  [pageerror] ' + e.message));
    await page.goto(`http://127.0.0.1:${port}${GAME}`, { waitUntil: 'load' });

    out = await page.evaluate((N, SEC_PER_MOVE, ENGINE_MS) => {
      /* every one of these comes from the page — if a name here goes missing the game
         changed shape and this sim must be re-read, not "fixed" by stubbing it */
      const need = ['d20', 'matBudget', 'muster', 'buildBoard', 'applyAttackerPos',
                    'applyDefenderPos', 'bestMove', 'CLOCK_ATT', 'CLOCK_DEF', 'MAT_SCALE', 'setEdge'];
      const ML = window.__ML || {};
      const missing = need.filter((k) => typeof ML[k] === 'undefined');
      if (missing.length) return { error: 'the game no longer exposes: ' + missing.join(', ') };
      const { d20, matBudget, muster, buildBoard, applyAttackerPos, applyDefenderPos,
              bestMove, CLOCK_ATT, CLOCK_DEF, MAT_SCALE } = ML;

      const C = window.PJCCChess;
      const movesAtt = Math.max(1, Math.round(CLOCK_ATT / SEC_PER_MOVE));
      const movesDef = Math.max(1, Math.round(CLOCK_DEF / SEC_PER_MOVE));

    function runBand(N, edge) {
      ML.setEdge(edge);
      const res = { edge: edge, attWin: 0, attLose: 0, byMate: 0, byFlag: 0, held: 0, draws: 0,
                    plies: [], budgets: { att: [], def: [] },
                    movesAtt: movesAtt, movesDef: movesDef,
                    dials: { MAT_SCALE: MAT_SCALE, ATT_EDGE: edge, CLOCK_ATT: CLOCK_ATT, CLOCK_DEF: CLOCK_DEF } };

      for (let g = 0; g < N; g++) {
        /* garrisons in the range real play actually produces */
        const aGar = 2 + ((Math.random() * 4) | 0);       // 2..5
        const dGar = 1 + ((Math.random() * 4) | 0);       // 1..4
        const aBud = matBudget(d20(), aGar, false);
        const dBud = matBudget(d20(), dGar, true);
        res.budgets.att.push(aBud); res.budgets.def.push(dBud);

        /* the attacker is White in this sim; the real game only ever swaps which chair
           the PLAYER sits in, and the board is symmetric about that */
        const board = buildBoard(muster(aBud), muster(dBud));
        applyAttackerPos(board, 'w', d20());
        applyDefenderPos(board, 'b', d20());

        let S = { b: board, turn: 'w', cast: { K: false, Q: false, k: false, q: false }, ep: -1, half: 0, full: 1 };
        let usedW = 0, usedB = 0, done = null, ply = 0;
        while (!done) {
          const mover = S.turn;
          if (mover === 'w' && usedW >= movesAtt) { done = 'flag-att'; break; }
          if (mover === 'b' && usedB >= movesDef) { done = 'flag-def'; break; }
          let m = bestMove(S, ENGINE_MS);
          if (!m) { done = 'draw'; break; }
          const pc = S.b[m.from];
          if (pc && pc.toLowerCase() === 'p' && ((m.to / 8 | 0) === 7 || (m.to / 8 | 0) === 0)) {
            m = { from: m.from, to: m.to, promo: 'q' };
          }
          S = C.makeMove(S, m);
          ply++;
          if (mover === 'w') usedW++; else usedB++;
          const r = C.gameResult(S);
          if (r === 'checkmate') { done = (mover === 'w') ? 'mate-att' : 'mate-def'; break; }
          if (r) { done = 'draw'; break; }
        }
        res.plies.push(ply);
        /* ⚠ THE ATTACKER WINS BY CHECKMATE OR NOT AT ALL. Either flag means the defender
           was still standing when the clock stopped, which is the whole of what the
           defender was asked to do. */
        if (done === 'mate-att') { res.attWin++; res.byMate++; }
        else {
          res.attLose++;
          if (done === 'draw') res.draws++;
          else if (done === 'flag-def') res.held++;      // hung on for the full fifteen
          else res.held++;                               // ran the attacker out, or mated them
        }
      }
      return res;
    }

      /* ⚠ THE SHIPPED VALUE IS MEASURED FIRST, and it is what this run passes or fails on.
         A sweep alone would answer "which edge WOULD land in his band" and never once test
         the number the game actually carries — the same shape of hole as a test that reads
         a file without parsing it. The sweep still runs after, because when the shipped
         value drifts out you want the replacement in the same output. */
      const shippedEdge = ML.edge();
      const shipped = runBand(N, shippedEdge);
      const bands = [];
      for (let e = 4; e <= 16; e += 2) bands.push(runBand(N, e));
      ML.setEdge(shippedEdge);
      return { shipped: shipped, bands: bands, movesAtt: movesAtt, movesDef: movesDef };
    }, N, SEC_PER_MOVE, ENGINE_MS);
  } finally {
    await browser.close(); srv.close();
  }

  if (out.error) { console.error('SIM CANNOT RUN: ' + out.error); process.exit(1); }

  const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
  console.log('\n=== MARCHLAND — ATTACK FAILURE RATE vs THE ATTACKER\'S MATERIAL EDGE ===');
  console.log(`  ${N} battles per band, engine vs engine · the attacker wins by CHECKMATE only`);
  console.log(`  clock modelled as a move budget: attacker ${out.movesAtt}, defender ${out.movesDef}` +
    `  (at ${SEC_PER_MOVE}s a move)`);
  console.log('');
  console.log('   ATT_EDGE   att pts   def pts   plies   FAILED    band');
  let best = null;
  for (const b of out.bands) {
    const total = b.attWin + b.attLose;
    const fail = (b.attLose / total) * 100;
    const inBand = fail >= 40 && fail <= 60;
    if (inBand && (!best || Math.abs(fail - 50) < Math.abs(best.fail - 50))) best = { edge: b.edge, fail: fail };
    console.log(
      '   ' + String(b.edge).padStart(6) +
      String(mean(b.budgets.att).toFixed(1)).padStart(10) +
      String(mean(b.budgets.def).toFixed(1)).padStart(10) +
      String(mean(b.plies).toFixed(1)).padStart(8) +
      (fail.toFixed(1) + '%').padStart(9) + '    ' + (inBand ? '✓ 40-60' : ''));
  }
  console.log('');
  if (best) {
    console.log(`  the sweep's best is ATT_EDGE = ${best.edge} at ${best.fail.toFixed(1)}% — closest to the middle of the band.`);
  } else {
    console.log('  ✗ NO BAND LANDED IN 40-60%. Widen the sweep, or move CLOCK_ATT / MAT_SCALE.');
  }

  /* the verdict is about the SHIPPED constant, not about the best one available */
  const s = out.shipped;
  const sTotal = s.attWin + s.attLose;
  const sFail = (s.attLose / sTotal) * 100;
  const ok = sFail >= 40 && sFail <= 60;
  console.log('');
  console.log(`  SHIPPED: ATT_EDGE = ${s.edge} → ${sFail.toFixed(1)}% of attacks fail   (target 40-60%)`);
  console.log(`     attacker mated it ...... ${s.attWin}`);
  console.log(`     defender held .......... ${s.attLose}  (${s.held} still standing, ${s.draws} drawn)`);
  console.log(`     mean budget: attacker ${mean(s.budgets.att).toFixed(1)} pts · defender ${mean(s.budgets.def).toFixed(1)} pts`);
  /* ⚠ SAY HOW WIDE THE ERROR BARS ARE, because a rate printed to one decimal invites
     everyone to believe the decimal. At N=60 a coin-flip rate carries a ±13-point 95%
     interval — the same ATT_EDGE genuinely measured 43.3% and 53.3% on two runs. Raise N
     if you ever need to tell 48% from 55%; for "is it roughly half" this is plenty. */
  const p = s.attLose / sTotal;
  const margin = 1.96 * Math.sqrt((p * (1 - p)) / sTotal) * 100;
  console.log(`     ±${margin.toFixed(0)} points at 95% confidence on ${sTotal} battles — raise N for a tighter number`);
  console.log('');
  console.log(ok ? '  ✓ the shipped game is inside his band.\n'
    : `  ✗ THE SHIPPED GAME IS OUTSIDE THE BAND. Move ATT_EDGE toward ${best ? best.edge : 'the sweep'}.\n`);
  process.exit(ok ? 0 : 1);
})().catch((e) => { console.error('SIM CRASHED:', e); process.exit(1); });
