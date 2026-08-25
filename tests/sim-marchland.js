/* =============================================================================
 * sim-marchland.js — how often does an attack actually fail?
 *   npm run sim:marchland
 *   env: N=150 SEC_PER_MOVE=1.7 ENGINE_MS=35 CHAIN_RATE=0.5
 *        SWEEP_LO=-8 SWEEP_HI=16 SWEEP_STEP=2
 *
 * Nate, 2026-08-08: "Attacks SHOULD fail about what… 40% to 60% of the time?
 * We'll hash it out as we go - I'm not too worried about it."
 *
 * He is not worried about it, which is exactly why it needs a number rather than a
 * feeling: "about half" is easy to say and easy to be 20 points wrong about, and the
 * only way anyone would find out is by playing forty battles and keeping score. This
 * does that in a few minutes.
 *
 * ⚑⚑ REWRITTEN 2026-08-24 FOR v0.2, AND IT HAD TO BE — NOT AS A COURTESY. This file was
 * calling `matBudget(d20(), …)` and `muster(budget)` directly, which in v0.2 is no longer
 * how the game musters anybody. A calibration instrument that plays a DIFFERENT game than
 * the one shipping does not report a wrong number, it reports a number about nothing. Four
 * things moved and all four are modeled here now:
 *   · RANKS ARE DICE — one d20 per two ranks, keep the best (poolFor / rollPool / bestOf)
 *   · THE CAPS DEPEND ON THE RANKS — under three, no queen (capsFor)
 *   · THE CHAIN gives a defending holding one extra die
 *   · ⚠⚠ THE WIN CONDITION FLIPPED. It used to be that EITHER flag went to the defender.
 *     That rule handed a defending player a guaranteed win for never touching the board —
 *     confirmed by driving the real page for 15.1 seconds and reading HELD. Each side's
 *     flag is its own loss now, so `flag-def` is an ATTACKER WIN here.
 * Because of that last one, ATT_EDGE was swept from scratch rather than carried over. Do
 * not reason about the old curve; it measured a different game.
 *
 * ⚠⚠ WHAT THIS MEASURES, SAID HONESTLY, BECAUSE THE NUMBER IS ONLY WORTH THE CAVEAT.
 * It plays the REAL game's dice, pools, caps, muster, position dice and board builder —
 * those are called directly out of the shipped page, not reimplemented. But it plays the
 * battle ENGINE vs ENGINE, and the real game is engine vs HUMAN. Three consequences:
 *   · Both sides here play the same strength. A human attacker who is better than the
 *     engine will succeed more often than this says; a weaker one, less.
 *   · The clock cannot be simulated honestly — so it is modeled as a MOVE BUDGET.
 *     ⚑ THE ONE-SECOND DELAY IS IN THAT MODEL NOW: a move only costs you the part of it
 *     that ran over a second, so the budget is CLOCK / (SEC_PER_MOVE - MOVE_DELAY). That
 *     denominator is small, which makes battles much longer than v0.1's — which is the
 *     point of the delay and the single biggest reason the balance moved.
 *   · ⭐ CHAIN_RATE IS AN ASSUMPTION, NOT A MEASUREMENT, and it is printed as one. On the
 *     opening ten-holding map 5 of the 9 frontier holdings are chained, so 0.5 is where it
 *     is set. A defended holding late in a consolidated game is chained more often than
 *     that; one on a ragged front, less.
 * So: a calibration instrument, not a prediction. It tells you which way a constant
 * moves the game and roughly how far, which is all it is being asked for.
 *
 * THE DIALS, all in assets/games/pjcc_marchland.html:
 *   MAT_SCALE   d20 → material points (both sides)
 *   ATT_EDGE    flat points for the attacker  ← the one this sweeps
 *   DEF_EDGE    flat points for the defender
 *   MOVE_DELAY  seconds given back per move
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
/* ⚑ 1.7s, AND THE NUMBER IS NO LONGER A GUESS ABOUT HUMANS. In v0.2 the machine moves at
   a deliberate pace — LEVELS.medium.pace (1500ms) plus its search budget (180ms) — because
   under a one-second delay a side that answers in 180ms never loses clock at all and the
   battle cannot end on time. So engine-vs-engine really is about 1.7s a move. */
const SEC_PER_MOVE = +(process.env.SEC_PER_MOVE || 1.7);
/* ⚠ 35ms, and the whole sweep still takes minutes. Every band is N battles x plies x
   one search, so this number multiplies out hard. It is deliberately weaker than the
   180ms the shipped game gives its engine — this is measuring the SHAPE of the curve
   across the dial, not reproducing a real opponent. */
const ENGINE_MS = +(process.env.ENGINE_MS || 35);
const CHAIN_RATE = +(process.env.CHAIN_RATE || 0.5);
const SWEEP_LO = +(process.env.SWEEP_LO || -8);
const SWEEP_HI = +(process.env.SWEEP_HI || 16);
const SWEEP_STEP = +(process.env.SWEEP_STEP || 2);

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
  poolFor:poolFor, rollPool:rollPool, bestOf:bestOf, capsFor:capsFor,
  CLOCK_ATT:CLOCK_ATT, CLOCK_DEF:CLOCK_DEF, MAT_SCALE:MAT_SCALE, MOVE_DELAY:MOVE_DELAY,
  DICE_CAP:DICE_CAP, QUEEN_RANKS:QUEEN_RANKS,
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

    out = await page.evaluate((N, SEC_PER_MOVE, ENGINE_MS, CHAIN_RATE, LO, HI, STEP) => {
      /* every one of these comes from the page — if a name here goes missing the game
         changed shape and this sim must be re-read, not "fixed" by stubbing it */
      const need = ['d20', 'matBudget', 'muster', 'buildBoard', 'applyAttackerPos',
                    'applyDefenderPos', 'bestMove', 'poolFor', 'rollPool', 'bestOf', 'capsFor',
                    'CLOCK_ATT', 'CLOCK_DEF', 'MAT_SCALE', 'MOVE_DELAY', 'DICE_CAP', 'setEdge'];
      const ML = window.__ML || {};
      const missing = need.filter((k) => typeof ML[k] === 'undefined');
      if (missing.length) return { error: 'the game no longer exposes: ' + missing.join(', ') };
      const { matBudget, muster, buildBoard, applyAttackerPos, applyDefenderPos,
              bestMove, poolFor, rollPool, bestOf, capsFor,
              CLOCK_ATT, CLOCK_DEF, MAT_SCALE, MOVE_DELAY, DICE_CAP } = ML;

      const C = window.PJCCChess;
      /* ⚑ THE DELAY, IN THE MOVE-BUDGET MODEL. A move only costs you the part of it that
         ran past MOVE_DELAY seconds — that is what a Bronstein delay IS — so the effective
         price per move is (pace - delay) and the budget is the clock divided by that. */
      const EFF = Math.max(0.15, SEC_PER_MOVE - MOVE_DELAY);
      const movesAtt = Math.max(1, Math.round(CLOCK_ATT / EFF));
      const movesDef = Math.max(1, Math.round(CLOCK_DEF / EFF));

    function runBand(N, edge) {
      ML.setEdge(edge);
      const res = { edge: edge, attWin: 0, attLose: 0,
                    byMate: 0, byOverrun: 0, held: 0, counterMated: 0, draws: 0,
                    plies: [], budgets: { att: [], def: [] }, queens: { att: 0, def: 0 },
                    movesAtt: movesAtt, movesDef: movesDef,
                    dials: { MAT_SCALE: MAT_SCALE, ATT_EDGE: edge, CLOCK_ATT: CLOCK_ATT,
                             CLOCK_DEF: CLOCK_DEF, MOVE_DELAY: MOVE_DELAY, DICE_CAP: DICE_CAP } };

      for (let g = 0; g < N; g++) {
        /* ranks in the range real play actually produces */
        const aRanks = 2 + ((Math.random() * 4) | 0);       // 2..5
        const dRanks = 1 + ((Math.random() * 4) | 0);       // 1..4
        const dChain = Math.random() < CHAIN_RATE;

        /* ⚑ THE POOLS, exactly as beginBattle() builds them: one pool for material and a
           SEPARATE pool for position, each rolled fresh, each keeping its best. */
        const aDice = poolFor(aRanks, false);
        const dDice = Math.min(DICE_CAP + 1, poolFor(dRanks, true) + (dChain ? 1 : 0));
        const aBud = matBudget(bestOf(rollPool(aDice)), aRanks, false);
        const dBud = matBudget(bestOf(rollPool(dDice)), dRanks, true);
        res.budgets.att.push(aBud); res.budgets.def.push(dBud);

        const aArmy = muster(aBud, capsFor(aRanks));
        const dArmy = muster(dBud, capsFor(dRanks));
        if (aArmy.indexOf('q') >= 0) res.queens.att++;
        if (dArmy.indexOf('q') >= 0) res.queens.def++;

        /* the attacker is White in this sim; the real game only ever swaps which chair
           the PLAYER sits in, and the board is symmetric about that */
        const board = buildBoard(aArmy, dArmy);
        applyAttackerPos(board, 'w', bestOf(rollPool(aDice)));
        applyDefenderPos(board, 'b', bestOf(rollPool(dDice)));

        let S = { b: board, turn: 'w', cast: { K: false, Q: false, k: false, q: false }, ep: -1, half: 0, full: 1 };
        let usedW = 0, usedB = 0, done = null, ply = 0;
        while (!done) {
          const mover = S.turn;
          if (mover === 'w' && usedW >= movesAtt) { done = 'flag-att'; break; }
          if (mover === 'b' && usedB >= movesDef) { done = 'flag-def'; break; }
          const pick = bestMove(S, ENGINE_MS);
          if (!pick || !pick.mv) { done = 'draw'; break; }
          let m = pick.mv;
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
        /* ⚑⚑ EACH SIDE'S FLAG IS ITS OWN LOSS (2026-08-24). `flag-def` — the defense ran
           out of time to think — is an ATTACKER WIN now. Under the old rule it went to the
           defender, which is what made idling a guaranteed defensive win on the real page. */
        if (done === 'mate-att')       { res.attWin++;  res.byMate++; }
        else if (done === 'flag-def')  { res.attWin++;  res.byOverrun++; }
        else {
          res.attLose++;
          if (done === 'draw') res.draws++;
          else if (done === 'flag-att') res.held++;         // the assault ran out of daylight
          else res.counterMated++;                          // the defender mated the attacker
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
      for (let e = LO; e <= HI; e += STEP) bands.push(runBand(N, e));
      ML.setEdge(shippedEdge);
      return { shipped: shipped, bands: bands, movesAtt: movesAtt, movesDef: movesDef, eff: EFF,
               delay: MOVE_DELAY, clockAtt: CLOCK_ATT, clockDef: CLOCK_DEF };
    }, N, SEC_PER_MOVE, ENGINE_MS, CHAIN_RATE, SWEEP_LO, SWEEP_HI, SWEEP_STEP);
  } finally {
    await browser.close(); srv.close();
  }

  if (out.error) { console.error('SIM CANNOT RUN: ' + out.error); process.exit(1); }

  const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
  console.log('\n=== CHESSWILD: CAMPAIGN — ATTACK FAILURE RATE vs THE ATTACKER\'S MATERIAL EDGE ===');
  console.log(`  ${N} battles per band, engine vs engine`);
  console.log(`  clock ${out.clockAtt}s vs ${out.clockDef}s with a ${out.delay}s delay a move;` +
    ` at ${SEC_PER_MOVE}s a move that is ${out.eff.toFixed(2)}s of real cost`);
  console.log(`  → move budget: attacker ${out.movesAtt}, defender ${out.movesDef}` +
    `   ·   chain rate assumed ${CHAIN_RATE} (see the header)`);
  console.log('');
  console.log('   ATT_EDGE   att pts   def pts   plies   att Q%   FAILED    band');
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
      String(((b.queens.att / total) * 100).toFixed(0) + '%').padStart(9) +
      (fail.toFixed(1) + '%').padStart(9) + '    ' + (inBand ? '✓ 40-60' : ''));
  }
  console.log('');
  if (best) {
    console.log(`  the sweep's best is ATT_EDGE = ${best.edge} at ${best.fail.toFixed(1)}% — closest to the middle of the band.`);
  } else {
    console.log('  ✗ NO BAND LANDED IN 40-60%. Widen the sweep (SWEEP_LO/SWEEP_HI), or move CLOCK_ATT / MAT_SCALE / MOVE_DELAY.');
  }

  /* the verdict is about the SHIPPED constant, not about the best one available */
  const s = out.shipped;
  const sTotal = s.attWin + s.attLose;
  const sFail = (s.attLose / sTotal) * 100;
  const ok = sFail >= 40 && sFail <= 60;
  console.log('');
  console.log(`  SHIPPED: ATT_EDGE = ${s.edge} → ${sFail.toFixed(1)}% of attacks fail   (target 40-60%)`);
  console.log(`     the ground changed hands ... ${s.attWin}  (${s.byMate} by checkmate, ${s.byOverrun} the defense overrun on time)`);
  console.log(`     the defender held .......... ${s.attLose}  (${s.held} outlasted the assault, ${s.counterMated} mated the attacker, ${s.draws} drawn)`);
  console.log(`     mean budget: attacker ${mean(s.budgets.att).toFixed(1)} pts · defender ${mean(s.budgets.def).toFixed(1)} pts`);
  console.log(`     a queen was fielded by the attacker in ${((s.queens.att / sTotal) * 100).toFixed(0)}% of battles, the defender ${((s.queens.def / sTotal) * 100).toFixed(0)}%`);
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
