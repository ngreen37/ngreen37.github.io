#!/usr/bin/env node
/* The site's chess rules against Stockfish's, position by position.
 *
 * Stockfish is handed the GAME (startpos + every move so far), never the referee's own FEN, so it
 * keeps its own castling rights and en-passant square: a bookkeeping slip in the referee shows up
 * as a different move list the moment it matters.
 * At every position: the legal moves must be the same set, and so must the number of replies to
 * each of them (Stockfish's `go perft 2`).
 *
 * usage: node tests/rules-vs-stockfish.js [games=300] [maxPlies=140] [seed=7] [mutation]      (npm run test:rules)
 *   mutation: none | castle-through | no-ep | rook-capture | pinned | ep-stays | promo-queen-only
 *             (breaks an in-memory COPY of the referee; the repo file is never written) */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.join(__dirname, '..');

const GAMES = +process.argv[2] || 300;
const MAXPLY = +process.argv[3] || 140;
const SEED = +process.argv[4] || 7;
const MUT = process.argv[5] || 'none';

const MUTS = {
  'none': null,
  // castling through an attacked square (white, kingside)
  'castle-through': ["!isAttacked(b,60,'b') && !isAttacked(b,61,'b') && !isAttacked(b,62,'b')) moves.push({from:60,to:62,castle:'K'})",
                     "!isAttacked(b,60,'b') && !isAttacked(b,62,'b')) moves.push({from:60,to:62,castle:'K'})"],
  // en passant is never generated
  'no-ep': ["else if(ni===S.ep) moves.push({from:i,to:ni,ep:true});", ""],
  // a rook taken on its own square leaves the castling right standing
  'rook-capture': ["[m.from,m.to].forEach(function(sq){", "[m.from].forEach(function(sq){"],
  // a pinned piece may move (no legality filter for moves that are not the king's)
  'pinned': ["if(!inCheck({b:ns.b,turn:me},me)) out.push(ps[i]);",
             "if(!inCheck({b:ns.b,turn:me},me) || (S.b[ps[i].from].toLowerCase()==='n' && !inCheck(S,me))) out.push(ps[i]);"],
  // the en-passant square is never cleared
  'ep-stays': ["var ep=-1; if(m.dbl)", "var ep=S.ep; if(m.dbl)"],
  // promotion to a queen only
  'promo-queen-only': ["['q','r','b','n'].forEach(function(pp)", "['q'].forEach(function(pp)"]
};
if (!(MUT in MUTS)) { console.log('unknown mutation ' + MUT); process.exit(2); }

function loadReferee() {
  let src = fs.readFileSync(path.join(ROOT, 'assets/js/pjcc-chess.js'), 'utf8');
  const m = MUTS[MUT];
  if (m) {
    if (src.split(m[0]).length !== 2) { console.log('MUTATION ANCHOR NOT FOUND (or not unique): ' + MUT); process.exit(2); }
    src = src.replace(m[0], m[1]);
  }
  const mod = { exports: {} };
  vm.runInNewContext(src, { module: mod, self: {} });
  return mod.exports;
}
const C = loadReferee();

function rng(seed) {                       // mulberry32: the same games every run
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const uciOf = (m) => C.nameFromSq(m.from) + C.nameFromSq(m.to) + (m.promo ? m.promo.toLowerCase() : '');

/* ── Stockfish, one question at a time ─────────────────────────────────────────────── */
const sf = require(path.join(ROOT, 'assets/vendor/stockfish/stockfish.js'))();
let waiting = null;
sf.onmessage = (l) => { if (waiting) waiting(String(l)); };
function ask(cmds, until, ms) {
  return new Promise((res, rej) => {
    const lines = [];
    const timer = setTimeout(() => { waiting = null; rej(new Error('Stockfish did not answer: ' + cmds.join(' ; '))); }, ms || 20000);
    waiting = (l) => { lines.push(l); if (until(l)) { clearTimeout(timer); waiting = null; res(lines); } };
    cmds.forEach((c) => sf.postMessage(c));
  });
}
async function sfPerft(posCmd, depth) {
  const lines = await ask([posCmd, 'go perft ' + depth], (l) => /^Nodes searched/.test(l), 60000);
  const out = {};
  let total = -1;
  for (const l of lines) {
    const m = /^([a-h][1-8][a-h][1-8][qrbn]?): (\d+)$/.exec(l.trim());
    if (m) out[m[1]] = +m[2];
    const t = /^Nodes searched: (\d+)/.exec(l.trim());
    if (t) total = +t[1];
  }
  return { moves: out, total };
}
async function sfCheckers(posCmd) {       // true when the side to move is in check
  const lines = await ask([posCmd, 'd'], (l) => /^Checkers:/.test(l), 20000);
  const c = lines.find((l) => /^Checkers:/.test(l));
  return c.replace('Checkers:', '').trim().length > 0;
}

const stat = { positions: 0, replies: 0, castles: 0, eps: 0, promos: 0, checks: 0, mates: 0, stales: 0,
               games: 0, sanSets: 0, longest: 0, checkersAsked: 0 };
const bad = [];
function fail(msg) { if (bad.length < 12) bad.push(msg); }

async function compareAt(S, posCmd, label) {
  const legal = C.legalMoves(S);
  const mine = {};
  for (const m of legal) mine[uciOf(m)] = C.legalMoves(C.makeMove(S, m)).length;
  const theirs = (await sfPerft(posCmd, 2)).moves;
  // Stockfish prints nothing per move when a reply count is 0? It prints "move: 0". Depth 1 settles the SET.
  const set1 = (await sfPerft(posCmd, 1)).moves;
  const a = Object.keys(mine).sort().join(' '), b = Object.keys(set1).sort().join(' ');
  stat.positions++;
  if (a !== b) {
    const only = (x, y) => Object.keys(x).filter((k) => !(k in y)).join(',') || '-';
    fail(label + ' MOVES DIFFER  referee only: ' + only(mine, set1) + '  stockfish only: ' + only(set1, mine) + '  fen ' + C.toFEN(S));
    return false;
  }
  for (const k of Object.keys(mine)) {
    stat.replies += mine[k];
    if ((theirs[k] || 0) !== mine[k]) {
      fail(label + ' REPLIES DIFFER after ' + k + '  referee ' + mine[k] + '  stockfish ' + (theirs[k] || 0) + '  fen ' + C.toFEN(S));
      return false;
    }
  }
  // the names: no two legal moves may share one, and + / # must be true of the board
  const sans = legal.map((m) => C.toSAN(S, m));
  if (new Set(sans).size !== sans.length) { fail(label + ' TWO MOVES SHARE A NAME  ' + sans.join(' ') + '  fen ' + C.toFEN(S)); return false; }
  stat.sanSets++;
  for (const m of legal) {
    if (m.castle) stat.castles++;
    if (m.ep) stat.eps++;
    if (m.promo) stat.promos++;
  }
  const chk = C.inCheck(S, S.turn);
  if (chk) stat.checks++;
  if (!legal.length) { if (chk) stat.mates++; else stat.stales++; }
  if (chk || !legal.length || stat.positions % 7 === 0) {
    stat.checkersAsked++;
    const sfChk = await sfCheckers(posCmd);
    if (sfChk !== chk) { fail(label + ' CHECK DIFFERS  referee ' + chk + '  stockfish ' + sfChk + '  fen ' + C.toFEN(S)); return false; }
  }
  return true;
}

(async () => {
  await ask(['uci'], (l) => /^uciok/.test(l));
  await ask(['isready'], (l) => /^readyok/.test(l));
  const t0 = Date.now();
  const rand = rng(SEED);

  /* 1 · the six published perft positions, counted by BOTH, four moves deep */
  const SUITE = [
    ['start', 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', 4],
    ['kiwipete', 'r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1', 4],
    ['position 3', '8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1', 5],
    ['position 4', 'r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1', 4],
    ['position 5', 'rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8', 4],
    ['position 6', 'r4rk1/1pp1qppp/p1np1n2/2b1p1B1/2B1P1b1/P1NP1N2/1PP1QPPP/R4RK1 w - - 0 10', 4]
  ];
  for (const [name, fen, d] of (process.env.SKIP_SUITE ? [] : SUITE)) {   // SKIP_SUITE: judge the games alone
    const mine = C.perft(C.parseFEN(fen), d);
    const theirs = (await sfPerft('position fen ' + fen, d)).total;
    console.log('  ' + (mine === theirs ? 'same' : 'DIFFERENT') + '  ' + name + ' depth ' + d + ': referee ' + mine + ', stockfish ' + theirs);
    if (mine !== theirs) fail('perft ' + name + ' depth ' + d + ': referee ' + mine + ' stockfish ' + theirs);
  }

  /* 2 · whole games, every position of each. Half from the start; the rest from boards where the
        rare rules are close at hand (both castles open, pawns a step from en passant or the last rank,
        bare endings where mate and stalemate actually happen). */
  const STARTS = [
    C.START_FEN, C.START_FEN, C.START_FEN, C.START_FEN, C.START_FEN, C.START_FEN,
    'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1',
    'r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1',
    'r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1',
    'rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8',
    '4k3/p1p1p1p1/8/1P1P1P1P/1p1p1p1p/8/P1P1P1P1/4K3 w - - 0 1',
    '4k3/PPP5/8/8/8/8/ppp5/4K3 w - - 0 1',
    '7k/8/5K2/6Q1/8/8/8/8 w - - 0 1',
    '8/8/8/4k3/8/8/4P3/4K3 w - - 0 1',
    '6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1'
  ];
  for (let g = 0; g < GAMES && !bad.length; g++) {
    const fen0 = STARTS[g % STARTS.length];
    let S = C.parseFEN(fen0);
    const played = [];
    const base = fen0 === C.START_FEN ? 'position startpos' : 'position fen ' + fen0;
    const cmd = () => base + (played.length ? ' moves ' + played.join(' ') : '');
    stat.games++;
    for (let ply = 0; ply < MAXPLY; ply++) {
      if (!(await compareAt(S, cmd(), 'game ' + g + ' ply ' + ply))) break;
      const legal = C.legalMoves(S);
      if (!legal.length) break;
      // the rare moves are the ones that go wrong: take one half the time it is on offer
      const rare = legal.filter((m) => m.castle || m.ep || m.promo);
      const caps = legal.filter((m) => S.b[m.to]);
      const ends = legal.filter((m) => C.legalMoves(C.makeMove(S, m)).length === 0);
      let m;
      const r = rand();
      if (ends.length && r < 0.7) m = ends[Math.floor(rand() * ends.length)];
      else if (rare.length && r < 0.5) m = rare[Math.floor(rand() * rare.length)];
      else if (caps.length && r < 0.62) m = caps[Math.floor(rand() * caps.length)];
      else m = legal[Math.floor(rand() * legal.length)];
      played.push(uciOf(m));
      S = C.makeMove(S, m);
      if (C.insufficientMaterial(S)) { await compareAt(S, cmd(), 'game ' + g + ' end'); break; }
    }
    stat.longest = Math.max(stat.longest, played.length);
  }

  const secs = ((Date.now() - t0) / 1000).toFixed(0);
  console.log('\n  ' + stat.games + ' games (seed ' + SEED + ', longest ' + stat.longest + ' plies), ' + stat.positions + ' positions, ' +
    stat.replies + ' replies counted, ' + secs + 's');
  console.log('  on offer along the way: ' + stat.castles + ' castling moves, ' + stat.eps + ' en passant, ' + stat.promos +
    ' promotions; ' + stat.checks + ' checks, ' + stat.mates + ' checkmates, ' + stat.stales + ' stalemates; check asked of Stockfish ' +
    stat.checkersAsked + ' times');
  if (bad.length) { console.log('\n  ' + bad.join('\n  ')); console.log('\nRESULT: DIFFERENT (mutation: ' + MUT + ')'); process.exit(1); }
  console.log('\nRESULT: SAME EVERYWHERE (mutation: ' + MUT + ')');
  process.exit(0);
})().catch((e) => { console.log('CRASH ' + (e && e.stack || e)); process.exit(3); });
