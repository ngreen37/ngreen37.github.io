#!/usr/bin/env node
/* ══════════════════════════════════════════════════════════════════════════════════════
   godotgame.check.js  —  npm run test:godotgame  (also runs inside `npm test`)

   Guards `gen-godot-game.js`, the PGN → Godot converter.

   ⚑ WHY A GATE FOR A TOOL NOBODY VISITS. The converter is a THIN SHELL over
   `pjcc-chess.js` — it calls legalMoves, toSAN, makeMove, inCheck, isCheckmate, parseFEN,
   nameFromSq, colorOf and toFEN, and does no chess of its own. That is exactly why it is
   worth checking: rename any one of those exports and the tool dies, silently, until the
   next time it is reached for — which by design is the evening a big game finishes and
   there are about six hours of anybody caring. A gate here costs 80ms and buys the tool
   being there when it is wanted.

   The three cases below are the three the renderer cannot survive getting wrong, and none
   of them is caught by "does the position come out right" — the position is right in all
   three. Only the PICTURE is wrong:

     · CASTLING   two pieces move on one move. Miss the rook and it stands in the corner.
     · EN PASSANT the pawn that dies is NOT on the square the capturer lands on. Assume it
                  is and a ghost pawn sits there for the rest of the game.
     · PROMOTION  the piece that arrives is not the piece that left.
   ══════════════════════════════════════════════════════════════════════════════════════ */
'use strict';

const { convert } = require('./gen-godot-game.js');

let pass = 0, fail = 0;
function ok(cond, what) {
  if (cond) { pass++; return; }
  fail++;
  console.log('  ✗ ' + what);
}
function eq(got, want, what) {
  ok(got === want, what + '   expected ' + JSON.stringify(want) + ', got ' + JSON.stringify(got));
}

console.log('=== PGN → GODOT — the three the picture cannot survive ===');

// ── a whole real game, ending in mate ────────────────────────────────────────────────
const OPERA = [
  '[Event "Paris Opera"] [White "Paul Morphy"] [Black "Duke and Count"] [Result "1-0"]',
  '1.e4 e5 2.Nf3 d6 3.d4 Bg4 4.dxe5 Bxf3 5.Qxf3 dxe5 6.Bc4 Nf6 7.Qb3 Qe7',
  '8.Nc3 c6 9.Bg5 b5 10.Nxb5 cxb5 11.Bxb5+ Nbd7 12.O-O-O Rd8 13.Rxd7 Rxd7',
  '14.Rd1 Qe6 15.Bxd7+ Nxd7 16.Qb8+ Nxb8 17.Rd8# 1-0'
].join('\n');

const g = convert(OPERA);
eq(g.moves.length, 33, 'the Opera Game is 33 plies');
eq(g.white, 'Paul Morphy', 'the White tag survives');
eq(g.start_pieces.length, 32, 'the opening position ships as 32 squares, not a FEN to parse');
ok(g.moves[32].mate === true, 'the last move is flagged as mate');
eq(g.moves[32].san, 'Rd8#', 'and it is Rd8#');
ok(g.moves[20].check === true, '11.Bxb5+ is flagged as check');

// ── CASTLING: the rook has to come along ─────────────────────────────────────────────
const castle = g.moves[22];                                   // 12.O-O-O
eq(castle.san, 'O-O-O', 'ply 23 is the long castle');
eq(castle.from + castle.to, 'e1c1', 'the king goes e1 → c1');
ok(castle.rook !== null, 'the castle carries a rook run');
eq(castle.rook.from + castle.rook.to, 'a1d1', 'and the rook goes a1 → d1');

// ── EN PASSANT: the victim is not on the destination square ──────────────────────────
const ep = convert('[White "a"] [Black "b"]\n1. e4 Nf6 2. e5 d5 3. exd6 e5 4. dxc7 Qd7 5. cxb8=Q Rxb8 *');
const took = ep.moves[4];                                     // 3.exd6, en passant
eq(took.san, 'exd6', 'ply 5 is the en passant');
eq(took.to, 'd6', 'the capturer lands on d6');
ok(took.capture !== null, 'and it is a capture');
eq(took.capture.sq, 'd5', '⚠ THE PAWN THAT DIES IS ON d5, NOT d6 — the whole reason capture.sq exists');
eq(took.capture.piece, 'p', 'and the thing that died is a black pawn');

// ── PROMOTION: the piece that arrives is not the piece that left ─────────────────────
const promo = ep.moves[8];                                    // 5.cxb8=Q
eq(promo.san, 'cxb8=Q', 'ply 9 is the promotion');
eq(promo.piece, 'P', 'a pawn left c7');
eq(promo.promo, 'Q', 'a queen arrives on b8');
eq(promo.capture.piece, 'n', 'taking the knight on the way');

// ── a bad token fails LOUDLY rather than drawing a wrong board ───────────────────────
let threw = '';
try { convert('[White "a"]\n1. e4 e5 2. Qxf7# *'); }
catch (e) { threw = e.message; }
ok(threw.indexOf('ply 3') >= 0, 'an illegal move names the ply it died on');
ok(threw.indexOf('Qxf7') >= 0, 'and names the token');

// ── commentary is stripped, moves are not ────────────────────────────────────────────
const messy = convert('[White "a"]\n1. e4 {a fine move} e5 $1 2. Nf3! (2. f4 exf4) 2... Nc6?! *');
eq(messy.moves.length, 4, 'comments, NAGs, the whole variation and !? are stripped; four real plies remain');
eq(messy.moves[3].san, 'Nc6', 'and the annotation comes off the move');

console.log('  ' + pass + ' passed, ' + fail + ' failed');
if (fail) { console.log('RESULT: FAIL'); process.exit(1); }
console.log('RESULT: PASS (' + pass + ' checks)');
