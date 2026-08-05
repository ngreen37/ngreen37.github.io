/* =============================================================================
 * gen-front-puzzles.js — the front door's puzzle pool, PROVED before it ships.
 *   npm run gen:puzzles
 * -----------------------------------------------------------------------------
 * Nate, 2026-08-04: "The puzzle on the home page should be completely random."
 *
 * It used to be ONE position (6k1/5ppp/8/8/8/8/5PPP/R5K1, Ra8#), hand-proved once and
 * hard-coded, and the page's own comment explained why: loading a 40KB referee onto the
 * front door to re-derive a fact we already proved is the exact trade that page exists
 * to refuse. That reasoning survives random puzzles intact — it just moves.
 *
 * ⭐ THE PROOF HAPPENS HERE, AT BUILD TIME, AND THE PAGE ONLY CARRIES THE ANSWER.
 * This script builds random positions, hands every one of them to the REAL referee
 * (assets/js/pjcc-chess.js — perft-verified against startpos, Kiwipete and positions
 * 3-5), and keeps a position only when the referee agrees there is EXACTLY ONE
 * checkmate among every legal move White has. The front door then ships a list of
 * (position, from, to) triples and grades a click by comparing two integers. No engine
 * on the page, no claim the engine did not make, and "completely random" costs the
 * visitor nothing. [[accuracy-above-all]] · [[puzzle-room-invariants]]
 *
 * THE HOUSE RULES EVERY CANDIDATE MUST SURVIVE — each one exists to keep the front
 * door's two-click UI honest, because that UI cannot ask a follow-up question:
 *   · White to move, and White is NOT already in check (a mate-in-one found while
 *     dodging a check is a different, harder puzzle than the page is offering).
 *   · Black is NOT in check — with White to move that position is illegal, full stop.
 *   · No castling rights and no en-passant square, so neither can be the answer or a
 *     guess the board would have to interpret.
 *   · NO WHITE PAWN ON THE 7th RANK. Promotion would make the answer ambiguous ("to
 *     which piece?") on a board with no promotion dialog. Removing the pawn from the
 *     rank removes the question instead of answering it.
 *   · Between 4 and 10 legal moves is too few to be a puzzle and too many to scan on a
 *     phone: the band is 8..38, and the mate may never be White's only legal move.
 *   · Both kings on the board, kings never adjacent, no pawn on rank 1 or 8.
 *
 * OUTPUT: it rewrites the marked block in index.md between the two sentinels. That is
 * deliberate — the pool is inline so the board is painted from the first byte with no
 * second request, which is the property the front door was built around. Re-run it and
 * the block is replaced; nothing else in the file is touched.
 * ========================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const C = require(path.join(ROOT, 'assets', 'js', 'pjcc-chess.js'));

const WANT = +(process.env.WANT || 64);
const SEED = +(process.env.SEED || 20260804);

/* mulberry32 — the same tiny PRNG the rest of the site seeds things with, so a re-run
   with the same SEED produces the same pool and the diff is empty when nothing changed */
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(SEED);
const pick = (a) => a[(rnd() * a.length) | 0];
const int = (n) => (rnd() * n) | 0;

const rf = (i) => [(i / 8) | 0, i % 8];
const adjacent = (a, b) => {
  const [ar, af] = rf(a), [br, bf] = rf(b);
  return Math.abs(ar - br) <= 1 && Math.abs(af - bf) <= 1;
};

/* ── build one random position ──────────────────────────────────────────────────
   Not uniformly random over all 64-square arrangements — that produces almost nothing
   but junk. It is random over a SHAPE that mate-in-one actually lives in: a black king
   with some of its own men around it, and a small white attacking force. The shape is
   the prior; the referee is still the judge. */
function candidate() {
  const b = new Array(64).fill('');
  const free = () => { let s; do { s = int(64); } while (b[s]); return s; };

  /* the black king — biased toward an edge, where mate in one is a real pattern rather
     than a fluke, but not exclusively (a smothered or box mate in the middle is the
     nicer puzzle when it turns up) */
  let bk;
  if (rnd() < 0.72) {
    const edge = [];
    for (let i = 0; i < 64; i++) { const [r, f] = rf(i); if (r === 0 || r === 7 || f === 0 || f === 7) edge.push(i); }
    bk = pick(edge);
  } else {
    bk = int(64);
  }
  b[bk] = 'k';

  let wk; let guard = 0;
  do { wk = int(64); } while ((b[wk] || adjacent(wk, bk)) && ++guard < 200);
  if (b[wk] || adjacent(wk, bk)) return null;
  b[wk] = 'K';

  /* the white force: always something that can give mate, plus optional support */
  const heavy = pick(['Q', 'Q', 'R', 'R', 'R', 'Q']);
  const support = ['R', 'B', 'N', 'P', 'Q', 'B', 'N'];
  const white = [heavy];
  const extra = 1 + int(3);
  for (let i = 0; i < extra; i++) white.push(pick(support));

  for (const p of white) {
    let s = free(), tries = 0;
    /* a pawn may not stand on rank 1 or 8, and NEVER on rank 7 — see the header */
    while (p === 'P' && ([1, 7].includes(rf(s)[0]) || rf(s)[0] === 0) && ++tries < 60) s = free();
    if (p === 'P' && (rf(s)[0] === 0 || rf(s)[0] === 7 || rf(s)[0] === 1)) return null;
    b[s] = p;
  }

  /* black's own men — mostly pawns, mostly near their king, because that is what turns
     an escape square into a mate */
  const blacks = int(5);
  for (let i = 0; i < blacks; i++) {
    const p = pick(['p', 'p', 'p', 'p', 'r', 'b', 'n', 'q']);
    let s;
    if (p === 'p' && rnd() < 0.7) {
      const [kr, kf] = rf(bk);
      const dr = kr + (1 + int(2)) * (rnd() < 0.5 ? 1 : -1);
      const df = kf - 1 + int(3);
      if (dr < 1 || dr > 6 || df < 0 || df > 7) continue;
      s = dr * 8 + df;
      if (b[s]) continue;
    } else {
      s = free();
      if (p === 'p' && (rf(s)[0] === 0 || rf(s)[0] === 7)) continue;
    }
    b[s] = p;
  }
  return b;
}

/* ── the referee's verdict ─────────────────────────────────────────────────────── */
function judge(board) {
  const S = { b: board.slice(), turn: 'w', cast: { K: false, Q: false, k: false, q: false }, ep: -1, half: 0, full: 1 };
  if (C.kingSq(S.b, 'w') < 0 || C.kingSq(S.b, 'b') < 0) return null;
  if (C.inCheck(S, 'w')) return null;                       // White dodging a check: not this page's puzzle
  if (C.inCheck(S, 'b')) return null;                       // illegal with White to move

  const moves = C.legalMoves(S);
  if (moves.length < 8 || moves.length > 38) return null;

  const mates = [];
  for (const m of moves) {
    if (m.promo || m.castle) continue;                      // never the answer — see the header
    const N = C.makeMove(S, m);
    if (C.isCheckmate(N)) mates.push(m);
  }
  if (mates.length !== 1) return null;
  if (moves.length === 1) return null;

  /* a promotion or a castle among the OTHER moves is fine as a guess we grade wrong,
     but a promotion that also mates would mean two answers to one click */
  for (const m of moves) {
    if (!m.promo) continue;
    const N = C.makeMove(S, m);
    if (C.isCheckmate(N)) return null;
  }

  const mate = mates[0];
  return { fen: C.toFEN(S).split(' ')[0], from: mate.from, to: mate.to, san: C.toSAN(S, mate), moves: moves.length };
}

/* ── search ─────────────────────────────────────────────────────────────────────── */
const found = [];
const seen = new Set();
let attempts = 0;
while (found.length < WANT && attempts < 4000000) {
  attempts++;
  const b = candidate();
  if (!b) continue;
  const v = judge(b);
  if (!v) continue;
  if (seen.has(v.fen)) continue;
  seen.add(v.fen);
  found.push(v);
}

if (found.length < WANT) {
  console.error(`only found ${found.length}/${WANT} after ${attempts} attempts`);
  process.exit(1);
}

/* ── a second, independent pass over the finished pool ──────────────────────────
   The search above already asked the referee; this asks it again from the SERIALISED
   form, which is what actually ships. A pool that is right in memory and wrong on disk
   is the failure mode worth spending a second on. */
for (const p of found) {
  const S = C.parseFEN(p.fen + ' w - - 0 1');
  const ms = C.legalMoves(S);
  const mates = ms.filter((m) => C.isCheckmate(C.makeMove(S, m)));
  if (mates.length !== 1) throw new Error('pool entry is not a unique mate in one: ' + p.fen);
  if (mates[0].from !== p.from || mates[0].to !== p.to) throw new Error('pool entry has the wrong answer: ' + p.fen);
  /* WHITE pawns only — a black pawn on the 7th rank is just a black pawn, and Black never
     gets a move here. Row 1 of a FEN is the 7th rank; rows 0 and 7 are the 8th and the 1st,
     where no pawn of either color may legally stand. */
  const rows = p.fen.split('/');
  if (/P/.test(rows[1])) throw new Error('a white pawn is on the 7th rank: ' + p.fen);
  if (/[pP]/.test(rows[0]) || /[pP]/.test(rows[7])) throw new Error('a pawn is on rank 1 or 8: ' + p.fen);
}

const lines = found.map((p) => `'${p.fen} ${p.from} ${p.to}'`);
const rows = [];
for (let i = 0; i < lines.length; i += 2) rows.push('    ' + lines.slice(i, i + 2).join(', ') + ',');
const block = rows.join('\n').replace(/,$/, '');

const BEGIN = '  /* ══ POOL — GENERATED, DO NOT EDIT BY HAND · npm run gen:puzzles ══ */';
const END = '  /* ══ END POOL ══ */';

const idxPath = path.join(ROOT, 'index.md');
let idx = fs.readFileSync(idxPath, 'utf8');
const re = new RegExp(
  BEGIN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[\\s\\S]*?' + END.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
);
if (!re.test(idx)) {
  console.error('sentinels not found in index.md — add the POOL block first');
  process.exit(1);
}
idx = idx.replace(re, BEGIN + '\n  var POOL = [\n' + block + '\n  ];\n' + END);
fs.writeFileSync(idxPath, idx);

console.log(`\n=== FRONT-DOOR PUZZLE POOL ===`);
console.log(`  ${found.length} positions, each a UNIQUE mate in one by the site's referee`);
console.log(`  ${attempts} candidates tried · seed ${SEED}`);
console.log(`  median legal moves: ${found.map((p) => p.moves).sort((a, b) => a - b)[found.length >> 1]}`);
console.log(`  sample: ${found.slice(0, 4).map((p) => p.san).join(' · ')}`);
console.log(`  written into index.md between the POOL sentinels\n`);
