/* wc-puzzle.js — one puzzle from a World Championship game, for chesswild.com/wc/.
   His 11-26: "a puzzle from each game ... have it present slightly different and general ('Try and solve a puzzle from
   this game's position at chessWild.com')". So the position is the game's, and the question is only "find the best
   move": not "what he missed", which a GM's game seldom has, and which would put words in a real player's mouth.

   ⭐ THE POSITION IS THE ONE WHERE THE BEST MOVE STANDS FURTHEST ABOVE THE NEXT: Stockfish's top two, every position
   from move 9 on, at SCAN_MS; the biggest gap wins, then is searched again at PROVE_MS and kept only if the same move
   still stands GAP_PROVEN clear. A puzzle with two right answers is a coin toss with a board.
   ⚠ NOT A RECAPTURE: after a capture, taking back on that square is "the only move" by a mile and teaches nothing.
   ⚠ NOT A POSITION ALREADY WON OR LOST (|best| over DECIDED): +9 against +6 is not a puzzle, it is a formality.
   ⚠ ONE STOCKFISH PER PROCESS (gen-godot-game.js engine()): it is handed in, never made here. */
'use strict';
const C = require('../assets/js/pjcc-chess.js');

const FROM_PLY = 16;        // the first eight moves each are the openings book, not the players
const SCAN_MS = 500;
const PROVE_MS = 2500;
const GAP = 150;            // centipawns between the best move and the next, to be considered
const GAP_PROVEN = 120;     // …and still, searched five times longer
// ⚠ A QUIET GAME HAS NO 150 (Game 2, a 20-move draw): a second, softer pass before the game goes without a puzzle —
// and a game without one says nothing about a puzzle in its closing (booth.gd SIGN_OFF reads game.puzzle).
const GAP_SOFT = 90;
const GAP_SOFT_PROVEN = 70;
const DECIDED = 700;

/* The game's positions: FEN before each move, and the move as the referee knows it. */
function positions(game) {
  let S = C.parseFEN(game.start || C.START_FEN);
  const out = [];
  for (let i = 0; i < game.moves.length; i++) {
    const m = game.moves[i];
    const from = C.sqFromName(m.from), to = C.sqFromName(m.to);
    const promo = m.promo ? String(m.promo).toLowerCase() : null;
    const mv = C.legalMoves(S).filter((x) => x.from === from && x.to === to && (!promo || (x.promo || '').toLowerCase() === promo))[0];
    if (!mv) throw new Error('move ' + (i + 1) + ' (' + m.san + ') is not legal in ' + C.toFEN(S));
    out.push({ i: i, fen: C.toFEN(S), S: S, mv: mv, san: m.san, side: m.side, move: m.move });
    S = C.makeMove(S, mv);
  }
  return out;
}

function uciOf(S, uci) {
  const from = C.sqFromName(uci.slice(0, 2)), to = C.sqFromName(uci.slice(2, 4)), promo = uci[4] || null;
  return C.legalMoves(S).filter((x) => x.from === from && x.to === to && (!promo || (x.promo || '').toLowerCase() === promo))[0] || null;
}

/* ⚠ "Taking back" is a capture on the square the opponent just captured on. */
function recapture(pos, prev, uci) {
  return !!(prev && prev.mv && prev.S.b[prev.mv.to] && uci.slice(2, 4) === C.nameFromSq(prev.mv.to));
}

async function findPuzzle(game, eng, log) {
  const all = positions(game);
  const scored = [];
  for (const p of all) {
    if (p.i < FROM_PLY) continue;
    const legal = C.legalMoves(p.S);
    if (legal.length < 3) continue;
    const t = await eng.top2(p.fen, SCAN_MS);
    if (!t[0] || !t[1]) continue;
    if (Math.abs(t[0].cp) > DECIDED) continue;
    if (recapture(p, all[p.i - 1], t[0].move)) continue;
    const gap = t[0].cp - t[1].cp;
    if (gap >= GAP_SOFT) scored.push({ p: p, best: t[0].move, gap: gap, cp: t[0].cp });
  }
  scored.sort((a, b) => b.gap - a.gap);
  const tiers = [[scored.filter((c) => c.gap >= GAP), GAP_PROVEN], [scored.filter((c) => c.gap < GAP), GAP_SOFT_PROVEN]];
  for (const [cands, proven] of tiers) for (const c of cands.slice(0, 4)) {
    const t = await eng.top2(c.p.fen, PROVE_MS);
    if (!t[0] || !t[1] || t[0].move !== c.best || t[0].cp - t[1].cp < proven) continue;
    const mv = uciOf(c.p.S, c.best);
    if (!mv) continue;
    const san = C.toSAN(c.p.S, mv);
    if (log) log('  puzzle: ' + c.p.move + (c.p.side === 'w' ? '. ' : '... ') + san + ' stands ' + (t[0].cp - t[1].cp)
      + ' above the next best (game: ' + c.p.san + ')');
    return { ply: c.p.i + 1, move: c.p.move, side: c.p.side, fen: c.p.fen, uci: c.best, san: san,
      played: c.p.san, found: c.p.san.replace(/[+#!?]+$/, '') === san.replace(/[+#!?]+$/, ''), gap: t[0].cp - t[1].cp };
  }
  if (log) log('  puzzle: none — no position with one move ' + GAP_SOFT + ' clear of the rest');
  return null;
}

module.exports = { findPuzzle: findPuzzle, positions: positions, recapture: recapture, FROM_PLY: FROM_PLY, GAP: GAP,
  GAP_PROVEN: GAP_PROVEN, GAP_SOFT: GAP_SOFT, DECIDED: DECIDED };
