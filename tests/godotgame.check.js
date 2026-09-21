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

/* ══ THE WORLD CHAMPIONSHIP BROADCAST (2026-09-21) ═════════════════════════════════════
   His ten Tournament Board picks, against the real 2024 match (tests/fixtures/wc2024.pgn, the
   Lichess broadcast export: clocks and evals on every move). Offline, so it runs in npm test. */
const fs = require('fs');
const path = require('path');
const G = require('./gen-godot-game.js');
const W = require('./gen-broadcast.js');
const WC = W.splitGames(fs.readFileSync(path.join(__dirname, 'fixtures', 'wc2024.pgn'), 'utf8'));
const g1 = G.convert(WC[0]);
eq(WC.length, 14, 'the 2024 fixture holds all fourteen games');
eq(g1.moves[0].clock, 7196, '[%clk 1:59:56] after 1.e4 survives the converter as 7196 seconds');
const qe2 = g1.moves.find((m) => m.move === 17 && m.side === 'w');
ok(qe2 && qe2.spent > 33 * 60 && qe2.spent < 35 * 60, '…and 17.Qe2 took Gukesh 34 minutes — a true fact for the desk');
eq(g1.moves[0].eval, 18, '[%eval 0.18] survives as 18 centipawns for White');
eq(g1.graded_by, 'broadcast evals', 'a game with every eval is graded off the broadcast');
eq(g1.marks, true, '…and may carry marks');
eq([G.shortName('Ding, Liren'), G.shortName('Gukesh D'), G.shortName('Javokhir Sindarov'), G.shortName('Sindarov, Javokhir')].join(' '),
  'Ding Gukesh Sindarov Sindarov', 'short names for a caption');

/* ⭐⭐ THE GRADES ARE THE SITE'S OWN, AND THEY AGREE WITH LICHESS. Lichess writes its verdict into
   the PGN ("Inaccuracy. Rfe1 was best."); on every fully-evaluated game ours must match it —
   "Checkmate is now unavoidable" is Lichess's word for a blunder. */
const verdict = (note) => {
  if (/Checkmate is now unavoidable|Lost forced checkmate/.test(note)) return 'blunder';
  const m = /(Inaccuracy|Mistake|Blunder)\./.exec(note || '');
  return m ? m[1].toLowerCase() : null;
};
let agree = 0, flagged = 0;
const off = [];
WC.forEach((pgn, gi) => {
  const g = G.convert(pgn);
  if (g.graded_by !== 'broadcast evals') return;
  const p = G.readPGN(pgn);
  g.moves.forEach((m, i) => {
    const theirs = verdict(p.notes[i]);
    const ours = ['inaccuracy', 'mistake', 'blunder'].indexOf(m.cls) >= 0 ? m.cls : null;
    if (!theirs && !ours) return;
    flagged++;
    if (theirs === ours) agree++; else off.push('g' + (gi + 1) + ' ' + m.move + '.' + m.san + ' ' + theirs + '/' + ours);
  });
});
ok(flagged >= 25 && agree / flagged >= 0.95,
  'our grade matches Lichess on ' + agree + ' of ' + flagged + ' flagged moves   (' + off.join(', ') + ')');
const src = fs.readFileSync(path.join(__dirname, 'gen-godot-game.js'), 'utf8');
ok(/review\(\)\.grade\(/.test(src) && /function grade\(fens, moves, evals, bests\)/.test(
  fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'pjcc-game-review.js'), 'utf8')),
  'the grading IS the review\'s grade(), not a copy of it');
ok(/game\.marks = by === 'broadcast evals'/.test(src),
  '⚠⚠ a game graded only by our engine carries NO marks — measured: SF10 misgraded 2024 Game 1 at 3s a move');

/* the score comes off the games themselves */
const b3 = W.scoreBefore(WC, 3);
eq(b3['Gukesh D'] + '-' + b3['Ding, Liren'], '0.5-1.5', 'the score before Game 3 is summed from Games 1 and 2');
eq(W.tag(W.pick(WC, null), 'Round'), '14', 'with no game named, the latest finished one');
const bsrc = fs.readFileSync(path.join(__dirname, 'gen-broadcast.js'), 'utf8');
ok(/title: match\.title \|\| 'The World Championship'/.test(bsrc) && !/title:[^\n]*game\.event/.test(bsrc),
  '⚠ the card never prints the PGN\'s Event, which carries the sponsor\'s name');

/* the board side — read out of the mirror, which is what a rebuild restores */
const TB = path.join(__dirname, '..', 'private', 'docs', 'godot', 'tournament_board');
if (fs.existsSync(path.join(TB, 'booth.gd'))) {
  const booth = fs.readFileSync(path.join(TB, 'booth.gd'), 'utf8');
  const cast = fs.readFileSync(path.join(TB, 'broadcast.gd'), 'utf8');
  const seat = fs.readFileSync(path.join(TB, 'seat_model.gd'), 'utf8');
  const main = fs.readFileSync(path.join(TB, 'main.gd'), 'utf8');
  const lines = /const LINES := \{([\s\S]*?)\n\}/.exec(booth);
  const slots = lines ? [...lines[1].matchAll(/\{([a-z]+)\}/g)].map((m) => m[1]) : [];
  const allowed = ['w', 'o', 'san', 'min', 'clock', 'n', 'moves', 'sq'];
  ok(lines && slots.every((s) => allowed.indexOf(s) >= 0),
    '⚠⚠ the desk\'s templates have slots for facts only — no slot a state of mind could go in',
    slots.filter((s) => allowed.indexOf(s) < 0).join(' '));
  ok(lines && !/nerv|rattl|panic|feel|confiden|upset|angry|tired|pressure|scared|shak|emotion|stress/i.test(lines[1]),
    '⚠⚠ …and no line says how a real player FELT');
  ok(/var graded := bool\(game\.get\("marks", false\)\)/.test(booth)
    && /MARK\.has\(cls\) and bool\(game\.get\("marks", false\)\)/.test(cast),
    'the desk and the board both stay quiet about grades the broadcast did not give');
  ok(/ANIMATION_CALLBACK_MODE_PROCESS_MANUAL/.test(seat) && /func advance\(dt: float\)/.test(seat),
    'a character animates on the recorder\'s clock, not the engine\'s');
  ok(/--capture/.test(main) && /_thumbnail\(/.test(main) && /target_seconds/.test(main),
    'the board records from the command line, saves the biggest swing, and fits the clip to a length');
} else ok(false, 'the tournament board mirror is missing its new scripts');

(async () => {
  /* ⭐ A FEW HOLES ARE PATCHED: 2024 Game 7 is missing one eval. It keeps the broadcast's grades. */
  const g7 = await G.gradeWithEngine(G.convert(WC[6]), 300);
  eq(g7.graded_by, 'broadcast evals, 1 filled locally', 'Game 7 fills its one missing eval and keeps the rest');
  ok(g7.marks === true && g7.moves.some((m) => m.cls === 'mistake'), '…and keeps its marks');
  console.log('  ' + pass + ' passed, ' + fail + ' failed');
  if (fail) { console.log('RESULT: FAIL'); process.exit(1); }
  console.log('RESULT: PASS (' + pass + ' checks)');
  process.exit(0);
})();
