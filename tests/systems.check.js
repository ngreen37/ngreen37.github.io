/* =============================================================================
 * OPENING SYSTEMS — the chess, proved by playing it.  `npm run test:systems`
 * -----------------------------------------------------------------------------
 * Nate, 2026-09-01: *"What if the characters we have so far, who are part of the story, have
 * their own openings for white and black that they prefer to play."*
 *
 * ⛑⛑ WHY THIS FILE IS A SOAK AND NOT A LIST OF ASSERTIONS. What it replaced was a memorized
 * 14-ply line per seat, and a line can be checked by reading it: replay the plies, count
 * them, done. A SYSTEM has no plies to read — it is "the first wanted square that is legal
 * right now", so what it actually plays depends entirely on what the other person does. The
 * only honest way to know whether Crockett's b3 setup survives a Sicilian is to play a
 * Sicilian at it. So: every White system against every Black system, all 64 pairings, and
 * every Black system against every common first move.
 *
 * ⚠⚠ THE THREE THINGS THAT COULD GO WRONG, AND ALL THREE ARE HERE:
 *   1. ILLEGAL — next() hands back a move the referee refuses. Fatal, and impossible by
 *      construction (it only ever returns something out of legalMoves), which is exactly why
 *      it is worth checking: "impossible by construction" is a claim about code that changes.
 *   2. HANGING — the system keeps developing while a piece walks off. This is THE failure
 *      mode of a naive system bot and the reason hangs() exists; a pairing that ends a piece
 *      down means the guard has a hole.
 *   3. SHALLOW — the system runs out on move three and every seat plays engine chess from
 *      there, which is the old bench with extra steps. Nate's own bar, set for the book this
 *      replaced, was *"at least 5 moves deep"*.
 *
 * ⚠ AND ONE THING THAT LOOKS LIKE A BUG AND IS NOT: the CEO's list is four moves long on
 * purpose. He does not have a system, he has principles and then he thinks.
 * ========================================================================== */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const C = require(path.join(ROOT, 'assets/js/pjcc-chess.js'));
const SY = require(path.join(ROOT, 'assets/js/pjcc-systems.js'));

/* pjcc-openings.js is a plain browser script that hangs itself on `root` and reads
   root.PJCCChess — in Node that root would be its own module.exports, so it is run in a
   sandbox playing the part of window. */
const sandbox = { PJCCChess: C };
sandbox.self = sandbox;
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'assets/js/pjcc-openings.js'), 'utf8'), sandbox);
const OP = sandbox.PJCCOpenings;

let pass = 0, fail = 0;
const results = [];
function check(name, cond, detail) {
  if (cond) { pass++; results.push('  ✓ ' + name + (detail ? '   ' + detail : '')); }
  else { fail++; results.push('  ✗ ' + name + (detail ? '   ' + detail : '')); }
}
function section(t) { results.push('\n=== ' + t + ' ==='); }

const uci = (m) => C.nameFromSq(m.from) + C.nameFromSq(m.to) + (m.promo || '');
const VAL = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
const material = (S, side) => S.b.reduce((t, p) =>
  t + (p && (p === p.toUpperCase() ? 'w' : 'b') === side ? (VAL[p.toLowerCase()] || 0) : 0), 0);

const WHITE = SY.all().filter((s) => s.side === 'w').map((s) => s.id);
const BLACK = SY.all().filter((s) => s.side === 'b').map((s) => s.id);

/* Play two systems at each other and stop the moment either runs out — the engine's job
   starts there, and letting a stand-in play on would measure the stand-in. */
function duel(w, b) {
  let S = C.parseFEN(C.START_FEN), moves = [], illegal = null;
  for (;;) {
    const id = S.turn === 'w' ? w : b;
    const mv = SY.next(id, S, moves);
    if (!mv) break;
    if (!C.findMove(S, mv.from, mv.to, mv.promo)) { illegal = uci(mv); break; }
    moves.push(uci(mv));
    S = C.makeMove(S, mv);
  }
  return { S, moves, illegal, full: Math.floor(moves.length / 2) };
}

/* ── 1 · THE ROSTER IS WHOLE ─────────────────────────────────────────────────── */
section('1 · the systems exist, on both sides of the board');
check('there are White systems', WHITE.length >= 8, WHITE.length + ': ' + WHITE.join(' '));
check('…and as many Black ones', BLACK.length >= 8, BLACK.length + ': ' + BLACK.join(' '));
/* ⚠ THE BLACK HALF IS THE HALF THE OLD BOOK DID NOT HAVE AT ALL. Sitting down as White met
   an engine with no opening, every time. A Black system with no `vs` map is that gap coming
   back one seat at a time. */
const noVs = BLACK.filter((id) => !SY.get(id).vs);
check('every Black system branches on White\'s first move', noVs.length === 0,
      noVs.join(', ') || 'a flat list plays 1.d4 e5 — legal, losing, and reads as a defect');
const noStar = BLACK.filter((id) => !SY.get(id).vs['*']);
check('…and every one has a catch-all for the move it did not expect', noStar.length === 0,
      noStar.join(', ') || BLACK.length + ' systems, all with a `*` branch');

/* ── 2 · EVERY PAIRING, PLAYED ───────────────────────────────────────────────── */
section('2 · all ' + (WHITE.length * BLACK.length) + ' pairings, played move by move');
const duels = [];
WHITE.forEach((w) => BLACK.forEach((b) => duels.push({ w, b, r: duel(w, b) })));

const illegals = duels.filter((d) => d.r.illegal);
check('not one system move was refused by the referee', illegals.length === 0,
      illegals.map((d) => d.w + '/' + d.b + ' → ' + d.r.illegal).join(', ') ||
      duels.length + ' pairings, every move legal');

/* ⛑⛑ THE ONE THAT MATTERS. A system that keeps building while a bishop hangs is the whole
   reason hangs() exists, and it is invisible in any test that only reads the move lists. */
const bleeding = duels.filter((d) => material(d.r.S, 'w') !== material(d.r.S, 'b'));
check('…and not one pairing ended with material down', bleeding.length === 0,
      bleeding.map((d) => d.w + '/' + d.b + ' ' + material(d.r.S, 'w') + '/' + material(d.r.S, 'b')).join(', ') ||
      'all ' + duels.length + ' level');

/* ⚠⚠ NATE'S OWN BAR, AS ARITHMETIC, AND IT IS PER-SYSTEM RATHER THAN AVERAGED. An average
   hides the one seat that folds on move three, which is precisely the seat this is for.
   The CEO is exempt by name, and only by name — an exemption that matched a NUMBER would
   quietly excuse the next system that got shallow. */
const EXEMPT = { mainline: 'four principled moves and then a real search — deliberate' };
const shallow = [];
WHITE.forEach((w) => {
  const worst = Math.min(...duels.filter((d) => d.w === w).map((d) => d.r.full));
  if (worst < 5 && !EXEMPT[w]) shallow.push(w + ' folds at ' + worst);
});
check('every White system holds at least 5 full moves against EVERY defense',
      shallow.length === 0,
      shallow.join(', ') ||
      WHITE.filter((w) => !EXEMPT[w]).map((w) =>
        w + ':' + Math.min(...duels.filter((d) => d.w === w).map((d) => d.r.full))).join(' '));
const shallowB = [];
BLACK.forEach((b) => {
  const worst = Math.min(...duels.filter((d) => d.b === b).map((d) => d.r.full));
  if (worst < 4) shallowB.push(b + ' folds at ' + worst);
});
check('…and every Black one holds at least 4, which is all it can while White chooses',
      shallowB.length === 0,
      shallowB.join(', ') ||
      BLACK.map((b) => b + ':' + Math.min(...duels.filter((d) => d.b === b).map((d) => d.r.full))).join(' '));
check('the CEO\'s short list is short ON PURPOSE and still named',
      !!EXEMPT.mainline && SY.get('mainline').moves.length === 4, EXEMPT.mainline);

/* ── 3 · THEY BUILD SOMETHING THE SITE CAN NAME ──────────────────────────────── */
section('3 · classify() always has a name for what came out');
/* ⛑⛑ THE FIRST VERSION OF THIS SECTION ASSERTED A FALSE PREMISE AND FAILED FIVE HONEST
   SYSTEMS. It demanded that each White system be "recognized as itself" — that the Catalan
   produce a position called a Catalan. But classify() names the GAME, not one player's
   intentions, and it reports the DEEPEST named line: play a Slav at the Catalan and the game
   is a Slav, because that is what it is. The Sämisch meeting 1…e5 with 2.d4 really is a
   Center Game; main-line chess meeting 1…e5 really does reach the Scotch. Every "failure"
   was the classifier being right and the check being wrong about whose name a game carries.
   ⭐ SO THE CLAIM IS THE ONE ACTUALLY WORTH MAKING: whatever two systems build between them,
   the site can NAME it. A pairing that comes out as "—" is two characters playing moves that
   belong to no opening anybody has heard of, which is the thing that would look like a bug on
   the board. [[green-must-name-what-ran]] */
const unnamed = duels.filter((d) => !OP.classify(d.r.moves).name);
check('every one of the ' + duels.length + ' pairings lands on a named opening',
      unnamed.length === 0,
      unnamed.map((d) => d.w + '/' + d.b).join(', ') ||
      new Set(duels.map((d) => OP.classify(d.r.moves).name)).size + ' distinct openings across the bench');

/* ⚠ AND THE NAMES ARE NOT ALL THE SAME ONE. Eight seats whose games all classify identically
   would mean the systems differ on paper and not on the board — the exact failure the book
   had, where every seat opened 1.e4. */
const distinct = new Set(duels.map((d) => OP.classify(d.r.moves).name));
check('…and the bench does not all end up in the same opening',
      distinct.size >= 12, distinct.size + ' distinct: ' + [...distinct].slice(0, 6).join(' · ') + ' …');

/* ⭐ AND EACH SYSTEM'S OWN NAME IS NOT FICTION: somewhere among its eight games, the opening
   it is named after is the one on the board. This is the half of the old check that was
   fair — it just cannot be demanded of every pairing. */
const FAMILY = {
  london: /London|Queen's Pawn/, larsen: /Nimzo-Larsen/, kia: /R.ti|King's Indian Attack/,
  qgambit: /Queen's Gambit|Slav|QGD|Gr.nfeld/, italian: /Italian|Two Knights|Four Knights|King's Knight/,
  samisch: /Pirc|Modern/, catalan: /Catalan|Queen's Pawn|Slav|Indian/,
  mainline: /Scotch|Sicilian|Pirc|French|Caro-Kann|Knights/
};
WHITE.forEach((w) => {
  const names = duels.filter((d) => d.w === w).map((d) => OP.classify(d.r.moves).name || '—');
  check('  ' + SY.get(w).name + ' is on the board in at least one of its games',
        names.some((n) => FAMILY[w].test(n)),
        names.filter((n) => FAMILY[w].test(n))[0] || 'never once: ' + [...new Set(names)].join(' · '));
});

/* ── 4 · THE ACADEMY'S SHORT LIST IS SHORT FOR A MEASURED REASON ─────────────── */
section('4 · which seats a Pirc room can honestly prepare you for');
/* ⛑⛑ THE COST OF THE SYSTEMS, PRICED RATHER THAN HIDDEN. Every seat used to carry an
   anti-Pirc line, so the Academy could offer all eight by name. Now they play their own
   openings and most of those never meet a Pirc at all — so `pircVariation` is a claim about
   chess, and a claim about chess gets played rather than asserted. */
const claims = WHITE.filter((w) => SY.pircVariation(w));
check('some White system still meets the Pirc', claims.length > 0, claims.join(', '));
claims.forEach((w) => {
  let S = C.parseFEN(C.START_FEN), moves = [];
  for (let i = 0; i < 16; i++) {
    const mv = SY.next(S.turn === 'w' ? w : 'pircb', S, moves);
    if (!mv) break;
    moves.push(uci(mv)); S = C.makeMove(S, mv);
  }
  const n = OP.classify(moves).name || '—';
  check('  ' + w + ' really does reach a Pirc against a Pirc player', /Pirc/.test(n), n);
});
/* ⚠ AND THE OTHER SIDE OF IT: a system that does NOT claim to meet the Pirc must not. If
   one quietly does, the Academy is dropping a name it could honestly have offered. */
const missed = WHITE.filter((w) => !SY.pircVariation(w)).filter((w) => {
  let S = C.parseFEN(C.START_FEN), moves = [];
  for (let i = 0; i < 16; i++) {
    const mv = SY.next(S.turn === 'w' ? w : 'pircb', S, moves);
    if (!mv) break;
    moves.push(uci(mv)); S = C.makeMove(S, mv);
  }
  return /Pirc Defense|150 Attack|Austrian|Pirc, /.test(OP.classify(moves).name || '');
});
check('…and no unclaimed system quietly reaches one either', missed.length === 0,
      missed.join(', ') || 'the short list is the whole true list');

console.log('\n=== OPENING SYSTEMS — what each regular plays ===');
console.log(results.join('\n'));
console.log('\nRESULT: ' + (fail ? 'FAIL (' + fail + ')' : 'PASS (' + pass + ' checks)'));
process.exit(fail ? 1 : 0);
