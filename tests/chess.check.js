// Pure-Node regression test for the shared chess engine (assets/js/pjcc-chess.js).
// No browser needed — the engine is a plain UMD module. Guards move generation
// (perft) AND the repetition/threefold logic that powers The Gauntlet + Battle Room.
//
//   node tests/chess.check.js
//
// Notably covers the 2026-07-05 fix: posKey() must not collapse empty squares
// (a bare S.b.join('') dropped every gap and fired FALSE threefold draws).

const C = require('../assets/js/pjcc-chess.js');

let fails = 0;
function ok(cond, msg) { console.log((cond ? '  ✓ PASS  ' : '  ✗ FAIL  ') + msg); if (!cond) fails++; }
function eq(got, want, msg) { ok(got === want, msg + ' (got ' + got + ', want ' + want + ')'); }

console.log('\n=== pjcc-chess: move generation (perft) ===');
let S = C.parseFEN(C.START_FEN);
eq(C.perft(S, 1), 20, 'startpos perft(1)');
eq(C.perft(S, 2), 400, 'startpos perft(2)');
eq(C.perft(S, 3), 8902, 'startpos perft(3)');
eq(C.perft(S, 4), 197281, 'startpos perft(4)');
const KIWI = C.parseFEN('r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1');
eq(C.perft(KIWI, 1), 48, 'Kiwipete perft(1)');
eq(C.perft(KIWI, 2), 2039, 'Kiwipete perft(2)');
eq(C.perft(KIWI, 3), 97862, 'Kiwipete perft(3)');

console.log('\n=== pjcc-chess: posKey (repetition identity) ===');
// The regression: a rook sliding along an otherwise-empty rank is a DIFFERENT position,
// but the old join('') produced an identical key -> phantom threefold.
const A = C.parseFEN('3k4/8/8/8/R7/8/8/3K4 w - - 0 1');   // Ra4
const B = C.parseFEN('3k4/8/8/8/2R5/8/8/3K4 w - - 0 1');  // Rc4
ok(C.posKey(A) !== C.posKey(B), 'Ra4 and Rc4 have distinct keys (no false collision)');
eq(C.posKey(S).split('|')[0].length, 64, 'board field of the key encodes all 64 squares');
// Turn / castling / ep are part of the identity.
ok(C.posKey(A) !== C.posKey(C.parseFEN('3k4/8/8/8/R7/8/8/3K4 b - - 0 1')), 'side-to-move changes the key');

console.log('\n=== pjcc-chess: genuine threefold still fires ===');
(function () {
  let g = C.parseFEN(C.START_FEN);
  const reps = {};
  const bump = () => { const k = C.posKey(g); return (reps[k] = (reps[k] || 0) + 1); };
  bump(); // initial position counts once
  const mv = (from, to) => { g = C.makeMove(g, C.findMove(g, C.sqFromName(from), C.sqFromName(to))); return bump(); };
  // Ng1-f3 Ng8-f6 Nf3-g1 Nf6-g8  (x2) -> start position occurs a 3rd time.
  const seq = [['g1', 'f3'], ['g8', 'f6'], ['f3', 'g1'], ['f6', 'g8'], ['g1', 'f3'], ['g8', 'f6'], ['f3', 'g1'], ['f6', 'g8']];
  let fired = null, count = 0;
  seq.forEach(([f, t]) => { count = mv(f, t); if (!fired && C.gameResult(g, count) === 'threefold') fired = count; });
  eq(count, 3, 'start position reached exactly 3 times after the shuffle');
  eq(fired, 3, 'gameResult reports "threefold" when the count hits 3');
  // And it should NOT fire early (only 2 occurrences).
  ok(C.gameResult(C.parseFEN(C.START_FEN), 2) === null, 'no draw at only 2 occurrences');
})();

console.log('\n=== pjcc-chess: terminal states ===');
eq(C.gameResult(C.parseFEN('rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3'), 1), 'checkmate', "fool's mate = checkmate");
eq(C.gameResult(C.parseFEN('k7/8/1Q6/8/8/8/8/7K b - - 0 1'), 1), 'stalemate', 'K+Q vs K trap = stalemate');
eq(C.gameResult(C.parseFEN('8/8/4k3/8/8/2K5/8/8 w - - 0 1'), 1), 'material', 'K vs K = insufficient material');
eq(C.gameResult(C.parseFEN('8/8/4k3/8/8/2K1B3/8/8 w - - 0 1'), 1), 'material', 'K+B vs K = insufficient material');
ok(C.gameResult(C.parseFEN(C.START_FEN), 1) === null, 'startpos is not terminal');

console.log(fails === 0 ? '\nRESULT: PASS (all engine checks)\n' : '\nRESULT: FAIL (' + fails + ' checks)\n');
process.exit(fails === 0 ? 0 : 1);
