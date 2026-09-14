#!/usr/bin/env node
/*! tests/sim-bots.js — DOES A RUNG ACTUALLY PLAY AT ITS RATING?
 *
 * Nate, 2026-09-12, after losing-then-beating a "400" that played the opening like a club
 * player: *"re-calibrate so the bots consistently play at their level, not just
 * best-move-or-blunder."*
 *
 * ⚠⚠ THIS IS A MEASUREMENT, NOT A GATE. It plays bots against each other and prints what it
 * found; it asserts nothing and `npm test` does not run it. That is deliberate — this is the
 * THIRD time an advertised rating has been wrong (the Shogi Sentinel labeled 800 played
 * ~1600 · "Medium" was ~1575 · Maxwell's 400 is skill-0 Stockfish plus dice), and every
 * previous fix was an unmeasured guess that needed fixing again. A number this file prints
 * is a number somebody actually played for.
 *
 * WHAT IT MEASURES, AND WHY THAT AND NOT THE LIVE PATH:
 * the negamax personas in `pjcc-chess-ai.js` — the engine that plays a CONSISTENT weak game.
 * Depth 1 grabs every pawn it can see; depth 4 develops. Stockfish bottoms out around 1350
 * at skill 0, which is exactly why every rung under 1400 currently buys its weakness with a
 * random-move roll instead of with worse judgment. The depth ladder is the candidate fix,
 * so the depth ladder is what has to be priced.
 *
 * ⚠ TIME IS DELIBERATELY NOT THE SHIPPING VALUE. Each persona carries a wall-clock `timeMs`,
 * and honoring it would make every result machine-dependent — a slower laptop searches
 * shallower and prints a different ladder. The harness gives every persona enough time to
 * finish its depth, so what is measured is DEPTH, reproducibly. Pass --time= to override.
 *
 *   node tests/sim-bots.js                  adjacent rungs, 24 games each
 *   node tests/sim-bots.js --games=60       more games = tighter error bars
 *   node tests/sim-bots.js --full           every pairing, not just neighbors
 *   node tests/sim-bots.js --seed=7         a different (still reproducible) run
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const C = require(path.join(ROOT, 'assets/js/pjcc-chess.js'));
const AI = require(path.join(ROOT, 'assets/js/pjcc-chess-ai.js'));

/* ── ARGUMENTS ─────────────────────────────────────────────────────────────── */
const argv = process.argv.slice(2);
const arg = (name, dflt) => {
  const hit = argv.find(a => a.startsWith('--' + name + '='));
  return hit ? hit.slice(name.length + 3) : dflt;
};
const GAMES = Math.max(2, +arg('games', 24));
const SEED = +arg('seed', 1);
/* ⚠ MEASURED, NOT PICKED (2026-09-12): the slowest single negamax move observed at depth 4
   was 502ms, and the average ply cost 96ms. 2000 therefore almost never binds below depth 5,
   which keeps the result reproducible while stopping one deep position eating a minute. */
const THINK = +arg('time', 2000);
const FULL = argv.includes('--full');
/* ⚠⚠ THIS IS THE NUMBER THAT MADE THE FIRST RUN UNFINISHABLE. A wall-clock-capped search
   times 300 plies is a three-minute worst case for ONE game, so 60 games never returned.
   200 plies is 100 moves — past the point any of these personas is still undecided. */
const PLY_CAP = +arg('cap', 200);
const OPEN_PLIES = +arg('open', 6);

/* ── A SEEDED RNG, AND IT REPLACES Math.random ─────────────────────────────────
   ⚠⚠ THE ENGINE ROLLS ITS BLUNDER OFF GLOBAL Math.random. Without this the whole run is
   unrepeatable: the same command prints a different ladder every time, and then nobody can
   tell a real calibration change from noise. Patched once, here, and the seed is printed. */
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
let rng = mulberry32(SEED);
Math.random = () => rng();

/* ── EVERY LINE GOES TO A FILE AS IT HAPPENS ───────────────────────────────────
   ⚠⚠ NOT A CONVENIENCE — THE FIRST RUN LOOKED LIKE A HANG BECAUSE OF THIS. Node
   block-buffers stdout when it is piped, so a sim that takes twenty minutes prints
   nothing at all until it exits, and an empty output file is indistinguishable from
   a crash. The append is synchronous so the file IS the progress bar: tail it.
   ⚠ Deliberately written with process.stdout.write rather than console.log — this file
   rewrites console.log calls into say(), and a say() that called console.log would
   have become a say() that called itself. */
const OUT = arg('out', path.join(__dirname, 'sim-bots.out.txt'));
try { fs.writeFileSync(OUT, ''); } catch (e) { /* a read-only dir must not kill the run */ }
function say(line) {
  const s = line === undefined ? '' : String(line);
  process.stdout.write(s + '\n');
  try { fs.appendFileSync(OUT, s + '\n'); } catch (e) {}
}

/* ── THE ROSTER, READ FROM THE SOURCE — never hand-copied ──────────────────────
   ⭐ HE ASKED FOR THIS TO COVER "any future bots". A hand-kept list in here would be a
   second roster to forget to update, which is the same disease as the hand-set skills that
   made "Medium" a 1575. Both rooms are parsed with the patterns ladders.check.js already
   proves work, so a seat added tomorrow shows up here tomorrow. */
function gauntletFloors() {
  const G = fs.readFileSync(path.join(ROOT, 'assets/games/pjcc_gauntlet.html'), 'utf8');
  /* ⚠⚠ THIS REGEX READ 11 OF 13 FLOORS AND SAID NOTHING (found 2026-09-13).
     The three SECRET floors carry `secret:true` on the same line as `elo:`, so a pattern
     that expected `elo:(\d+),` to be followed straight by the persona lookahead matched
     the ten public floors, caught The Chairman by luck of spacing, and silently dropped
     The CEO (2000) and The Founder (2400).
     ⭐ THE HARNESS CLAIMED "read from the source, not hand-listed" ALL DAY WHILE MISSING
     TWO SEATS — exactly the disease ladders.check.js:401 is written about: a roster check
     that quietly counts six of seven is worse than no roster check at all.
     The count is now cross-checked against an INDEPENDENT signal (persona-block count), so
     a floor this pattern cannot see fails the run instead of vanishing from it. */
  /* ⚠⚠ THE WINDOW IS MEASURED, NOT GUESSED — and guessing it wrong twice is why this
     comment exists. Actual name→persona spans in this file run 245..550 characters (the
     secret floors carry a lore-drop comment between the two, which is what pushes The CEO
     to 531 and The Founder to 550). A 400-char window read 11 of 13; tightening it to 200
     read 6. 600 clears the longest by 50 with no room to swallow an adjacent entry,
     since the shortest gap between floors is far larger than the overshoot. */
  const re = /name:'([^']+)'[\s\S]{0,600}?elo:(\d+)[\s\S]{0,600}?persona:\{([^}]*)\}/g;
  /* ⚠⚠ COUNTED OVER THE CODE, NOT THE FILE — and this guard tripped on its own explanation
     within hours of that rule being quoted at it. A comment added to pjcc_gauntlet.html
     containing the words `persona:{depth:1,` made the file hold 14 blocks where the code
     holds 13, and every verification shard died claiming a floor was invisible.
     ⭐ Same strip, same reason, as ladders.check.js §the-dial-is-read-at-move-time. A check
     that forces the next person to delete a comment to go green is a bad check. */
  const CODE = G.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const declared = (CODE.match(/persona:\{/g) || []).length;
  const out = [];
  let m;
  while ((m = re.exec(G))) {
    const p = {};
    m[3].split(',').forEach(kv => {
      const [k, v] = kv.split(':').map(s => s.trim());
      if (k) p[k] = +v;
    });
    out.push({ room: 'Gauntlet', name: m[1], elo: +m[2], persona: p });
  }
  if (out.length !== declared) {
    say('⛔ ROSTER MISMATCH: ' + declared + ' persona blocks in the Gauntlet, but this ' +
      'pattern parsed ' + out.length + '. A floor is invisible to the harness — fix the ' +
      'regex before trusting any number below.');
    process.exit(1);
  }
  return out;
}
function benchSeats() {
  const PT = fs.readFileSync(path.join(ROOT, 'games/park-tables/index.html'), 'utf8');
  const re = /\{ name: '([^']+)',\s*icon: '.',\s*diff: '([^']+)',\s*elo: (\d+)([^}]*)/g;
  const out = [];
  let m;
  while ((m = re.exec(PT))) {
    const tail = m[4] || '';
    out.push({
      room: 'Park Tables', name: m[1], diff: m[2], elo: +m[3], persona: null,
      adaptive: /adaptive:\s*true/.test(tail), offLadder: /offLadder:\s*true/.test(tail)
    });
  }
  return out;
}

/* ── PLAYING A GAME ────────────────────────────────────────────────────────────
   ⚠ THE RESULT IS CHECKED BEFORE THE SIDE TO MOVE PLAYS, and the repetition count is the
   count of the position ABOUT to be played from. Checking after the move would miss a
   stalemate by one ply and score it as an adjudication. */
function playGame(whitePersona, blackPersona, opening) {
  let S = C.parseFEN(C.START_FEN);
  for (const mv of opening) S = C.makeMove(S, mv);

  const reps = new Map();
  for (let ply = 0; ply < PLY_CAP; ply++) {
    const key = C.posKey(S);
    const seen = (reps.get(key) || 0) + 1;
    reps.set(key, seen);

    const res = C.gameResult(S, seen);
    if (res === 'checkmate') return S.turn === 'w' ? '0-1' : '1-0';
    if (res) return '1/2-1/2';

    const persona = S.turn === 'w' ? whitePersona : blackPersona;
    const mv = AI.bestMove(S, Object.assign({}, persona, { timeMs: THINK }));
    if (!mv) return '1/2-1/2';
    S = C.makeMove(S, mv);
  }
  /* Ran out of plies. Adjudicate on material rather than calling it a draw: two bots
     shuffling in a won position is a win, and scoring it 1/2 flattens the whole ladder. */
  const VAL = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
  let w = 0, b = 0;
  for (let i = 0; i < 64; i++) {
    const pc = S.b[i];
    if (!pc) continue;
    const v = VAL[pc.toLowerCase()] || 0;
    if (pc === pc.toUpperCase()) w += v; else b += v;
  }
  if (w - b >= 3) return '1-0';
  if (b - w >= 3) return '0-1';
  return '1/2-1/2';
}

/* A short random opening, so two deterministic engines do not replay one game forever.
   ⚠ THE SAME OPENING IS USED FOR BOTH COLOR ASSIGNMENTS of a pair — paired openings cut
   the variance a lot, because a freak position is then handed to both sides in turn. */
function randomOpening(plies) {
  let S = C.parseFEN(C.START_FEN);
  const moves = [];
  for (let i = 0; i < plies; i++) {
    const lm = C.legalMoves(S);
    if (!lm.length) break;
    const mv = lm[(rng() * lm.length) | 0];
    moves.push(mv);
    S = C.makeMove(S, mv);
  }
  return moves;
}

/* ── ELO ARITHMETIC ────────────────────────────────────────────────────────────── */
const expectedScore = (ra, rb) => 1 / (1 + Math.pow(10, (rb - ra) / 400));
function eloDiffFromScore(s) {
  const clamped = Math.min(0.995, Math.max(0.005, s));
  return -400 * Math.log10(1 / clamped - 1);
}

/* ── THE RUN ───────────────────────────────────────────────────────────────────── */
const floors = gauntletFloors();
const bench = benchSeats();

/* ⚠ --fit READS FILES; IT DOES NOT PLAY OR PARSE ROSTERS. Printing the 25-line roster
   ahead of its table pushed the actual result off the top of the screen, which is how a
   measurement gets skimmed instead of read. The header belongs to the modes that run games. */
if (!argv.includes('--fit') && !argv.includes('--map')) {
say('BOT LADDER MEASUREMENT');
say('seed ' + SEED + ' · ' + GAMES + ' games per pairing · think ' + THINK +
  'ms · opening ' + OPEN_PLIES + ' random plies · ply cap ' + PLY_CAP);
say('');
say('ROSTER FOUND (read from the source, not hand-listed)');
say('  Gauntlet floors : ' + floors.length);
floors.forEach(f => say('      ' + String(f.elo).padStart(4) + '  ' + f.name.padEnd(36) +
  'depth ' + f.persona.depth + '  blunder ' + f.persona.blunder));
say('  Park Tables     : ' + bench.length + '  (no personas — they run on skill+blunder today)');
bench.forEach(b => say('      ' + String(b.elo).padStart(4) + '  ' + b.name.padEnd(14) +
  b.diff + (b.adaptive ? '  [adaptive]' : '') + (b.offLadder ? '  [off-ladder]' : '')));
say('');
}

/* ══ PRICING MODE — PUT EVERY CANDIDATE SETTING ON ONE SCALE ═══════════════════════════
   Adjacent-pair scoring cannot do this. It tells you that rung N beats rung N-1, which is
   ten separate little scales that do not compose — and it is why the first two runs could
   show "+301" and "+120" for the same advertised +150 without either being wrong.
   Here every candidate plays ONE fixed reference, so every result is a number on the same
   axis and the 18 rungs can be chosen by spacing rather than by hope.

   ⚠ THE REFERENCE IS ARBITRARY AND THAT IS FINE. It anchors nothing to a human rating; it
   only makes the candidates comparable TO EACH OTHER. Anchoring is a separate job. */
/* ══ ROUND ROBIN + MAXIMUM-LIKELIHOOD FIT ══════════════════════════════════════════════
   ⚠⚠ THIS EXISTS BECAUSE PAIRWISE MEASUREMENT WAS THE WRONG INSTRUMENT (2026-09-12).
   A pairing measured on its own carries a ±140 Elo band at 100 games and ±230 at 30 —
   wider than the gaps being measured. Half of one afternoon's "findings" were noise
   wearing a decimal point: "+108, ok" and "-23, INVERTED" were reported as different
   results when their confidence bands almost entirely overlapped.

   In a round robin every game constrains EVERY rating through the network, so the same
   number of games buys much tighter estimates, and one fit puts all candidates on ONE
   scale rather than on ten disconnected pairwise scales that cannot be composed.

   ⭐ THE POOL IS CHOSEN FROM WHAT THE PRICING RUN ACTUALLY FOUND, not from a guess:
   the depth spine (1.5% / 11% / 47% / 77% against a depth-3 reference) is the real
   ladder, and the huge unexplored gap is between d4n0 (77%) and d4n60 (23%) — 54 points
   of score with nothing sampled inside it. Hence fine noise steps at depths 3-5 and
   coarse ones at 1-2, where everything saturates and cannot be ranked anyway. */
const POOL = [
  ['d1n0',   1,   0], ['d2n0',   2,   0], ['d2n30',  2,  30], ['d2n60',  2,  60],
  ['d3n0',   3,   0], ['d3n30',  3,  30], ['d3n60',  3,  60], ['d3n90',  3,  90],
  ['d3n120', 3, 120], ['d4n0',   4,   0], ['d4n15',  4,  15], ['d4n30',  4,  30],
  ['d4n45',  4,  45], ['d4n60',  4,  60], ['d4n90',  4,  90], ['d5n0',   5,   0],
  ['d5n20',  5,  20], ['d5n40',  5,  40]
].map(([label, depth, noise]) => ({
  label, persona: { depth, mat: 1, pst: 1, aggr: 0, blunder: 0, noise }
}));

/* ══ THE GAP POOL — FILLING TWO CRATERS THE FIRST FIT FOUND ════════════════════════════
   The 153-pair fit (9,180 games) left two stretches of the scale with nothing in them:
       -17 .. -330   (313 points)   between d4n0 and d3n0
      -696 .. -1169  (474 points)   between d2n60 and d1n0
   That is 787 of 1,169 total points unpopulated, which forces sixteen rungs into the
   remaining 382 — about 24 points each, inside the ±25 error bar, i.e. not distinguishable.

   ⭐ NOISE IS SAVAGELY STEEP AT THE BOTTOM OF ITS RANGE: d4n0 = -17, d4n15 = -344. Fifteen
   centipawns costs 327 Elo, so the whole upper crater lives between noise 0 and 15 and needs
   sampling at 3/6/10 rather than at 15-point steps.

   ⚠⚠ THE ANCHORS ARE THE POINT. d4n0, d3n0, d2n60 and d1n0 are carried over from the first
   pool deliberately: --fit reads every rr-*.txt, and shared players are what CONNECT two
   tournaments into one network. Drop the anchors and the second run lands on its own
   floating scale that cannot be compared with the first. */
/* ══ THE SHIPPED LADDER — WHAT A PLAYER WILL ACTUALLY MEET ═════════════════════════════
   Phase 4. Every pool above priced CANDIDATE settings; this one is the twelve sub-1400
   rungs exactly as `personaForElo` now returns them, character dials included.
   ⚠⚠ THIS IS THE MEASUREMENT THAT MATTERS. `mat`/`pst`/`aggr` were never priced — they are
   character, assigned conservatively — and they shift strength by an unknown amount. A
   ladder verified on bare depth+noise is not a ladder verified on what ships.
   ⚠ Maxwell carries neverCastle (≈108 Elo at depth 2) and every seat carries its tilt, so
   an inversion here is a REAL inversion a player could feel. */
const SHIPPED_POOL = [
  ['r350',  2, 220, 1.30, 0.30, 4, 0.00, false, 0.05],
  ['r400',  2, 160, 1.00, 1.00, 0, 0.25, true,  0],
  ['r500',  2,  90, 1.25, 0.40, 1, 0.50, false, 0],
  ['r650',  2,  60, 1.00, 1.10, 0, 0.25, false, 0],
  ['r750',  2,  30, 1.00, 0.90, 1, 0.50, false, 0],
  ['r800',  3, 120, 1.00, 1.00, 2, 0.25, false, 0],
  ['r950',  3,  90, 1.00, 1.00, 1, 0.25, false, 0],
  ['r1000', 3,  60, 1.00, 1.00, 1, 0.25, false, 0],
  ['r1100', 4,  45, 1.00, 1.05, 1, 0.00, false, 0],
  ['r1150', 3,  30, 1.00, 1.00, 2, 0.00, false, 0],
  ['r1200', 4,  30, 1.00, 1.00, 2, 0.00, false, 0],
  ['r1250', 4,  15, 1.00, 1.00, 6, 0.00, false, 0]
].map(([label, depth, noise, mat, pst, aggr, tilt, neverCastle, blunder]) => ({
  label, persona: { depth, noise, mat, pst, aggr, tilt, neverCastle, blunder }
}));

const GAP_POOL = [
  ['d4n0',   4,   0], ['d4n3',   4,   3], ['d4n6',   4,   6], ['d4n10',  4,  10],
  ['d5n5',   5,   5], ['d5n10',  5,  10], ['d3n0',   3,   0],
  ['d2n60',  2,  60], ['d2n90',  2,  90], ['d2n120', 2, 120], ['d2n160', 2, 160],
  ['d2n220', 2, 220], ['d1n0',   1,   0]
].map(([label, depth, noise]) => ({
  label, persona: { depth, mat: 1, pst: 1, aggr: 0, blunder: 0, noise }
}));

if (argv.includes('--rr')) {
  const poolName = arg('pool', 'main');
  const USE = poolName === 'gap' ? GAP_POOL
            : poolName === 'shipped' ? SHIPPED_POOL
            : POOL;
  const pairs = [];
  for (let i = 0; i < USE.length; i++)
    for (let j = i + 1; j < USE.length; j++) pairs.push([i, j]);
  const sh = (arg('shard', '1/1') || '1/1').split('/').map(Number);
  const [si, sn] = [sh[0] || 1, sh[1] || 1];
  const mine = pairs.filter((_, k) => (k % sn) === (si - 1));

  say('ROUND ROBIN — ' + mine.length + ' of ' + pairs.length + ' pairs, ' +
    GAMES + ' games each (shard ' + si + '/' + sn + ', seed ' + SEED + ')');
  say('# RESULT lines are machine-read by --fit; do not reformat them.');
  for (const [i, j] of mine) {
    const A = USE[i], B = USE[j];
    let ptsA = 0;
    for (let g = 0; g < GAMES; g++) {
      const opening = randomOpening(OPEN_PLIES);
      const aWhite = (g % 2) === 0;
      const r = aWhite ? playGame(A.persona, B.persona, opening)
                       : playGame(B.persona, A.persona, opening);
      if (r === '1/2-1/2') ptsA += 0.5;
      else if ((r === '1-0') === aWhite) ptsA += 1;
    }
    say('RESULT\t' + A.label + '\t' + B.label + '\t' + ptsA + '\t' + GAMES);
  }
  say('# shard complete');
  process.exit(0);
}

/* Shared by --fit and --map. Reads every rr-*.txt, fits one Bradley-Terry scale over the
   whole connected network, and returns {rating, se} per setting. */
function fitRatings() {
  const files = fs.readdirSync(__dirname).filter(f => /^rr-.*\.txt$/.test(f));
  const agg = new Map(); const players = new Set(); let games = 0;
  for (const f of files) {
    for (const line of fs.readFileSync(path.join(__dirname, f), 'utf8').split('\n')) {
      const c = line.split('\t');
      if (c[0] !== 'RESULT') continue;
      const [, a, b, pts, n] = c;
      players.add(a); players.add(b);
      const k = a + '|' + b;
      const cur = agg.get(k) || { pts: 0, n: 0 };
      cur.pts += +pts; cur.n += +n; agg.set(k, cur); games += +n;
    }
  }
  const names = [...players];
  const R = {}; names.forEach(n => { R[n] = 1500; });
  const Ex = (ra, rb) => 1 / (1 + Math.pow(10, (rb - ra) / 400));
  for (let it = 0; it < 60000; it++) {
    const act = {}, exp = {};
    names.forEach(n => { act[n] = 0; exp[n] = 0; });
    for (const [k, v] of agg) {
      const [a, b] = k.split('|');
      act[a] += v.pts; act[b] += v.n - v.pts;
      exp[a] += v.n * Ex(R[a], R[b]); exp[b] += v.n * Ex(R[b], R[a]);
    }
    let maxd = 0;
    for (const n of names) { const d = 0.5 * (act[n] - exp[n]); R[n] += d; maxd = Math.max(maxd, Math.abs(d)); }
    const mean = names.reduce((s, n) => s + R[n], 0) / names.length;
    names.forEach(n => { R[n] -= mean - 1500; });
    if (maxd < 1e-4) break;
  }
  const LN = Math.LN10 / 400; const info = {}; names.forEach(n => { info[n] = 0; });
  for (const [k, v] of agg) {
    const [a, b] = k.split('|');
    const p = Ex(R[a], R[b]); const i = v.n * p * (1 - p) * LN * LN;
    info[a] += i; info[b] += i;
  }
  const top = Math.max(...names.map(n => R[n]));
  const out = {};
  names.forEach(n => { out[n] = { rating: R[n] - top, se: info[n] > 0 ? 1.96 / Math.sqrt(info[n]) : NaN }; });
  return { ratings: out, games, pairings: agg.size };
}

/* ══ THE MAPPING — ADVERTISED RATING → A MEASURED SETTING ══════════════════════════════
   2026-09-13, Nate on the bottom two rungs: *"we don't lie to the player - go with B"* —
   the 350 and 400 seats SHARE a strength and are told apart by character, because the only
   measured setting below d2n220 is d1n0, 461 points lower with nothing in between.

   ⚠⚠ THE ADVERTISED SPAN IS 2050 POINTS AND THE ENGINE DELIVERS ~780. The labels are not
   human Elo and never were; what this map guarantees is ORDER (a higher rung is never
   weaker) and PROPORTION (the gaps track the advertised gaps). It cannot guarantee that
   two adjacent rungs are separable in a handful of games — see the resolution column. */
if (argv.includes('--map')) {
  const { ratings, games, pairings } = fitRatings();
  const SET = Object.keys(ratings).filter(k => k !== 'd1n0')   // d1n0 is the unreachable floor
    .sort((a, b) => ratings[b].rating - ratings[a].rating);

  const rungs = [];
  gauntletFloors().forEach(f => rungs.push({ room: 'Gauntlet', name: f.name, elo: f.elo }));
  benchSeats().forEach(b => rungs.push({
    room: 'Park Tables', name: b.name, elo: b.elo, adaptive: b.adaptive, offLadder: b.offLadder
  }));
  rungs.sort((a, b) => a.elo - b.elo);

  const loElo = Math.min(...rungs.map(r => r.elo));
  const hiElo = Math.max(...rungs.map(r => r.elo));
  const loM = Math.min(...SET.map(s => ratings[s].rating));
  const hiM = Math.max(...SET.map(s => ratings[s].rating));
  const target = e => loM + (hiM - loM) * (e - loElo) / (hiElo - loElo);

  say('RUNG MAP — ' + rungs.length + ' rungs over ' + SET.length + ' measured settings');
  say('fit: ' + games + ' games, ' + pairings + ' pairings');
  say('advertised span ' + loElo + '..' + hiElo + ' (' + (hiElo - loElo) +
    ' pts)   measured span ' + Math.round(loM) + '..' + Math.round(hiM) +
    ' (' + Math.round(hiM - loM) + ' pts)');
  say('');
  say('  advertised  seat                              setting    measured   gap   separable?');
  say('  ' + '-'.repeat(96));
  let prev = null;
  for (const r of rungs) {
    const t = target(r.elo);
    let best = SET[0];
    for (const s of SET) if (Math.abs(ratings[s].rating - t) < Math.abs(ratings[best].rating - t)) best = s;
    const m = ratings[best].rating;
    const sameRating = prev !== null && prev.elo === r.elo;
    const gap = prev === null ? null : Math.round(m - prev.m);
    /* Two estimates each carrying ~±25 need ~70 points between them before a difference is
       real at 95%. Below that the ORDER still holds; the pair just cannot be told apart in
       a short match — which is fine for a ladder a player climbs, and dishonest to deny. */
    /* ⚠⚠ TWO SEATS MAY SHARE AN ADVERTISED RATING AND THAT IS CORRECT, NOT A FAILURE.
       The rooms overlap on purpose: 1400 is the Vice President AND Kedar, 1800 is the
       Executive Assistant AND Robert, 1200 is Nate AND Auston's seed. Equal ratings MUST
       get equal settings. Reporting those as "same strength" flagged a working design as
       broken and buried the one duplicate that IS a defect. */
    const sep = gap === null ? ''
      : sameRating ? 'same rating by design — must match'
      : (gap >= 70 ? 'yes' : (gap >= 35 ? 'marginal' : 'NO — collision, needs separating'));
    say('  ' + String(r.elo).padStart(8) + '    ' + r.name.slice(0, 32).padEnd(34) +
      best.padEnd(9) + String(Math.round(m)).padStart(8) +
      (gap === null ? '      -' : String(gap).padStart(7)) + '   ' + sep +
      (r.adaptive ? '   [adaptive seed]' : '') + (r.offLadder ? '   [off-ladder]' : ''));
    prev = { m, elo: r.elo };
  }
  say('');
  say('⚠ "NO — same strength" means those two rungs are inside each other\'s error bars.');
  say('  The ORDER is still correct and never inverts. Over three or more rungs the');
  say('  difference is large and real; between adjacent rungs it is not measurable.');
  process.exit(0);
}

if (argv.includes('--fit')) {
  const files = fs.readdirSync(__dirname).filter(f => /^rr-.*\.txt$/.test(f));
  const agg = new Map();
  const players = new Set();
  let games = 0;
  for (const f of files) {
    for (const line of fs.readFileSync(path.join(__dirname, f), 'utf8').split('\n')) {
      const c = line.split('\t');
      if (c[0] !== 'RESULT') continue;
      const [, a, b, pts, n] = c;
      players.add(a); players.add(b);
      const k = a + '|' + b;
      const cur = agg.get(k) || { pts: 0, n: 0 };
      cur.pts += +pts; cur.n += +n; agg.set(k, cur);
      games += +n;
    }
  }
  if (!agg.size) { say('no RESULT lines found in tests/rr-*.txt'); process.exit(1); }

  const names = [...players];
  const R = {}; names.forEach(n => { R[n] = 1500; });
  const Ex = (ra, rb) => 1 / (1 + Math.pow(10, (rb - ra) / 400));

  /* Gradient ascent on the Bradley-Terry likelihood. Small step, many passes, re-centered
     each time — the scale has no absolute anchor, only the SHAPE is identified. */
  for (let it = 0; it < 60000; it++) {
    const act = {}, exp = {};
    names.forEach(n => { act[n] = 0; exp[n] = 0; });
    for (const [k, v] of agg) {
      const [a, b] = k.split('|');
      act[a] += v.pts; act[b] += v.n - v.pts;
      exp[a] += v.n * Ex(R[a], R[b]);
      exp[b] += v.n * Ex(R[b], R[a]);
    }
    let maxd = 0;
    for (const n of names) { const d = 0.5 * (act[n] - exp[n]); R[n] += d; maxd = Math.max(maxd, Math.abs(d)); }
    const mean = names.reduce((s, n) => s + R[n], 0) / names.length;
    names.forEach(n => { R[n] -= mean - 1500; });
    if (maxd < 1e-4) break;
  }

  /* Standard error from the Fisher information — the honest band on each fitted number. */
  const LN = Math.LN10 / 400;
  const info = {}; names.forEach(n => { info[n] = 0; });
  for (const [k, v] of agg) {
    const [a, b] = k.split('|');
    const p = Ex(R[a], R[b]);
    const i = v.n * p * (1 - p) * LN * LN;
    info[a] += i; info[b] += i;
  }

  const order = names.slice().sort((x, y) => R[y] - R[x]);
  const top = R[order[0]];
  say('FITTED RATINGS — ' + games + ' games over ' + agg.size + ' pairings');
  say('⚠ The scale is RELATIVE. It is anchored to nothing human; only the gaps mean anything.');
  say('');
  say('  setting     rating   ±95%     gap to next');
  say('  ' + '-'.repeat(52));
  order.forEach((n, i) => {
    const se = info[n] > 0 ? 1.96 / Math.sqrt(info[n]) : NaN;
    const gap = i + 1 < order.length ? Math.round(R[n] - R[order[i + 1]]) : null;
    say('  ' + n.padEnd(10) + String(Math.round(R[n] - top)).padStart(7) +
      '   ±' + (isFinite(se) ? Math.round(se) : '??').toString().padEnd(5) +
      (gap === null ? '' : '   ' + String(gap).padStart(4)));
  });
  process.exit(0);
}

if (argv.includes('--price')) {
  /* ⚠⚠ THE REFERENCE AND THE GRID ARE BOTH ARGUMENTS NOW, AND THE FIRST RUN IS WHY.
     A single depth-3 reference could not separate the weak end: `d1 n0`, `d1 n120`,
     `d1 n320`, `d2 n200` and `d2 n320` ALL scored between 0% and 2%, which does not mean
     they are equal strength — it means they lose every game to that opponent and a score
     of zero cannot be ranked. Maxwell (400) and the Checker Town champion (350) live in
     exactly that band, so the bottom of the ladder was the part being guessed.
     Price the weak end against a WEAK reference: --ref=1,0 --depths=1,2,3
     ⭐ And the steps are arguments because the interesting range turned out to be 0-120,
     where the original 0/60/120/200/320 grid had only three points. */
  const refArg = (arg('ref', '3,0') || '3,0').split(',').map(Number);
  const REF = { depth: refArg[0] || 3, mat: 1, pst: 1, aggr: 0, blunder: 0,
                noise: refArg[1] || 0 };
  const DEPTHS = (arg('depths', '1,2,3,4,5') || '').split(',').map(Number).filter(Boolean);
  const NOISES = (arg('noises', '0,60,120,200,320') || '').split(',').map(Number)
    .filter(n => !isNaN(n));
  const grid = [];
  for (const d of DEPTHS)
    for (const nz of NOISES)
      grid.push({ label: 'depth ' + d + '  noise ' + String(nz).padStart(3),
                  persona: { depth: d, mat: 1, pst: 1, aggr: 0, blunder: 0, noise: nz } });

  /* --shard=i/n runs only every nth candidate, so several processes can share the work.
     ⚠ Each shard reseeds from SEED so its openings are its own; shards are independent
     measurements against the same reference, never halves of one sample. */
  const sh = (arg('shard', '1/1') || '1/1').split('/').map(Number);
  const [si, sn] = [sh[0] || 1, sh[1] || 1];
  const mine = grid.filter((_, i) => (i % sn) === (si - 1));

  say('PRICING ' + mine.length + ' of ' + grid.length + ' candidates (shard ' + si + '/' + sn + ')');
  say('reference: depth ' + REF.depth + ', noise ' + REF.noise + ', neutral weights · ' +
    GAMES + ' games each');
  /* ⭐ THE CONTROL. A candidate identical to the reference must land near 50%, and on the
     first run `depth 3 noise 0` scored 47.0% — which is what made every other row on that
     table believable. If this row is ever missing from a grid, the run has no control. */
  if (DEPTHS.includes(REF.depth) && NOISES.includes(REF.noise))
    say('control present: "depth ' + REF.depth + '  noise ' + REF.noise +
      '" is the reference playing itself and must land near 50%');
  else
    say('⚠ NO CONTROL IN THIS GRID — add depth ' + REF.depth + ' / noise ' + REF.noise +
      ' to --depths/--noises to keep the run checkable');
  say('');
  say('  candidate              games   score vs ref   implied Δ');
  say('  ' + '-'.repeat(62));
  for (const c of mine) {
    let pts = 0;
    for (let g = 0; g < GAMES; g++) {
      const opening = randomOpening(OPEN_PLIES);
      const candWhite = (g % 2) === 0;
      const r = candWhite ? playGame(c.persona, REF, opening) : playGame(REF, c.persona, opening);
      if (r === '1/2-1/2') pts += 0.5;
      else if ((r === '1-0') === candWhite) pts += 1;
    }
    const score = pts / GAMES;
    say('  ' + c.label.padEnd(22) + String(GAMES).padStart(4) + '   ' +
      (score * 100).toFixed(1).padStart(8) + '%   ' +
      ((eloDiffFromScore(score) >= 0 ? '+' : '') + Math.round(eloDiffFromScore(score))).padStart(7));
  }
  say('');
  say('⚠ Δ is relative to the reference bot, not to a human rating.');
  process.exit(0);
}

/* Only the Gauntlet floors carry personas, so they are what can be priced today. The bench
   is listed above so the roster is visibly complete, and it gets its persona from the curve
   this measurement produces — that is the next step, not this one. */
const field = floors.slice().sort((a, b) => a.elo - b.elo);

const pairs = [];
if (FULL) {
  for (let i = 0; i < field.length; i++)
    for (let j = i + 1; j < field.length; j++) pairs.push([field[i], field[j]]);
} else {
  for (let i = 0; i + 1 < field.length; i++) pairs.push([field[i], field[i + 1]]);
}

say('PAIRINGS (' + pairs.length + ')  — "score" is the STRONGER seat\'s share');
say('');
/* ⚠⚠ A SCORE OUT OF A HANDFUL OF GAMES IS NOT A MEASUREMENT. At 2 games the only
   reachable scores are 0/25/50/75/100%, so "100%" reads as +920 Elo and a 1-1 split reads
   as INVERTED — both of which are the sample size talking, not the bots. The floor below
   is deliberately loud rather than a comment nobody scrolls to. */
if (GAMES < 20) {
  say('  ⚠ ONLY ' + GAMES + ' GAMES PER PAIRING — this is a smoke test, not a measurement.');
  say('    Scores can only land on multiples of ' + (100 / (2 * GAMES)).toFixed(1) +
    '%, so every number below is noise. Use --games=30 or more.');
  say('');
}
say('  lower              upper                games   score    implied Δ   advertised Δ   verdict');
say('  ' + '-'.repeat(104));

const rows = [];
for (const [lo, hi] of pairs) {
  let hiPoints = 0, draws = 0;
  for (let g = 0; g < GAMES; g++) {
    const opening = randomOpening(OPEN_PLIES);
    // paired: the stronger seat plays White on even games, Black on odd
    const hiIsWhite = (g % 2) === 0;
    const r = hiIsWhite ? playGame(hi.persona, lo.persona, opening)
                        : playGame(lo.persona, hi.persona, opening);
    if (r === '1/2-1/2') { hiPoints += 0.5; draws++; }
    else if ((r === '1-0') === hiIsWhite) hiPoints += 1;
  }
  const score = hiPoints / GAMES;
  const implied = eloDiffFromScore(score);
  const advertised = hi.elo - lo.elo;
  const off = implied - advertised;
  let verdict;
  if (score <= 0.5) verdict = 'INVERTED — the lower rung is not weaker';
  else if (Math.abs(off) <= 100) verdict = 'ok';
  else if (off > 0) verdict = 'gap too WIDE by ' + Math.round(off);
  else verdict = 'gap too NARROW by ' + Math.round(-off);

  rows.push({ lo, hi, score, implied, advertised, draws, verdict });
  /* ⚠ THE NAME IS TRIMMED FROM THE FRONT, NOT THE BACK. Every Gauntlet floor starts with
     "The ", so slicing the tail produced "The Sand-Mi" and "The Executi" — eleven rows that
     all began identically and could not be told apart at a glance. */
  const short = s => s.replace(/^The /, '').slice(0, 15);
  say('  ' + String(lo.elo).padStart(4) + '  ' + short(lo.name).padEnd(17) +
    String(hi.elo).padStart(4) + '  ' + short(hi.name).padEnd(17) +
    String(GAMES).padStart(4) + '   ' + (score * 100).toFixed(1).padStart(5) + '%   ' +
    ((implied >= 0 ? '+' : '') + Math.round(implied)).padStart(6) + '      ' +
    ('+' + advertised).padStart(6) + '        ' + verdict);
}

say('');
const inverted = rows.filter(r => r.score <= 0.5);
const wrong = rows.filter(r => r.score > 0.5 && Math.abs(r.implied - r.advertised) > 100);
say('SUMMARY');
say('  pairings measured      : ' + rows.length);
say('  inverted (lower wins)  : ' + inverted.length +
  (inverted.length ? '   <-- these rungs are in the wrong order' : ''));
say('  gap off by >100 Elo    : ' + wrong.length);
say('  draw rate              : ' +
  (100 * rows.reduce((a, r) => a + r.draws, 0) / (rows.length * GAMES)).toFixed(1) + '%');
say('');
say('⚠ An implied Δ is a RELATIVE measurement. It says these two seats are N points');
say('  apart when they play each other; it does not anchor either one to a human');
say('  rating. Anchoring needs a known opponent and is a separate job.');
