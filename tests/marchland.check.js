#!/usr/bin/env node
/* ══════════════════════════════════════════════════════════════════════════════════════
   MARCHLAND — HIS DICE RULES, AS A GATE

   Two rules that are HIS and have now been stated twice each. A rule he has repeated
   belongs in a test rather than in a comment, because a comment cannot disagree with the
   code — and that is exactly how the first one shipped wrong:

     "Castle: within three points of maximum, defenders king is castled."   (2026-08-08)
     "Castling - for the defender rolls, within 3 points of maximum."       (2026-08-11)
     "only the position dice for the castling."                             (2026-08-11)

   It shipped as `die >= 18` under a comment claiming it was "his rule exactly". 18 is within
   TWO of twenty. Nothing caught it because the only thing checking the number was prose.

   HOW THIS READS THE GAME: the position-die functions are pure — no DOM, no engine — so they
   are sliced out of the shipped HTML and run in a vm. Nothing is stubbed and nothing can pass
   by accident; if the slice stops matching, this file throws rather than quietly testing air.
   The two rules that are about WIRING (which die feeds castling, which side can castle) are
   checked against the real call site in the source, since a pure function cannot see them.
   ══════════════════════════════════════════════════════════════════════════════════════ */
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const GAME = path.join(ROOT, 'assets/games/pjcc_marchland.html');
const src = fs.readFileSync(GAME, 'utf8');

const results = [];
function check(label, pass, detail) { results.push({ label, pass: !!pass, detail: detail || '' }); }

/* ── slice the pure position-die code out of the shipped file ───────────────────────── */
function slice(from, to) {
  const a = src.indexOf(from), b = src.indexOf(to, a);
  if (a < 0) throw new Error('marchland.check: could not find "' + from + '" — the game moved, fix the slice');
  if (b < 0) throw new Error('marchland.check: could not find "' + to + '" after it');
  return src.slice(a, b);
}
/* ⚠ START AT POS_CASTLE, WHICH IS DECLARED FIRST. This slice began at `var POS_TOP` and the
   2026-08-11 refinement added a constant ABOVE it — so the vm got `posCastles` without the
   constant it reads and threw `POS_CASTLE is not defined` on the first call. That is the
   slice guard doing its job: a moved boundary fails loudly here instead of testing nothing. */
const code = slice('var POS_CASTLE', 'function posSteps') +
             slice('function posSteps', '/* ── THE MUSTER') +
             slice('function pawnsOf', '/* ── THE ENGINE');
const G = { Math, Array };
vm.createContext(G);
vm.runInContext(code, G);

/* ── 1. THE TWO BANDS — "within two of max" vs "within four or three of max" ─────────── */
check('the two bands are named constants, not typed numbers',
      G.POS_CASTLE === 16 && G.POS_TOP === 18,
      'POS_CASTLE = ' + G.POS_CASTLE + ' (within four) · POS_TOP = ' + G.POS_TOP + ' (within two)');
check('15 does NOT castle — five off the maximum is outside every band', G.posCastles(15) === false);
check('16 castles — within FOUR of the maximum', G.posCastles(16) === true);
check('17 castles — within three', G.posCastles(17) === true);
check('…but 16 and 17 do NOT bring the rook',
      G.posCastleFull(16) === false && G.posCastleFull(17) === false, 'his "they don\'t get the rook"');
check('18, 19 and 20 bring the rook', [18, 19, 20].every(d => G.posCastleFull(d) === true));
check('a low roll never castles', [1, 5, 10, 14].every(d => G.posCastles(d) === false));
check('exactly five faces of the twenty castle at all',
      [...Array(20)].filter((_, i) => G.posCastles(i + 1)).length === 5, '25% of rolls');
check('…and exactly three of those get the full castle',
      [...Array(20)].filter((_, i) => G.posCastleFull(i + 1)).length === 3, '15% of rolls');
check('the attacker\'s second rank rides the TOP band, not the wider one',
      [17, 18, 20].map(d => G.posTop(d)).join() === 'false,true,true',
      '"within two of maximum" is the top reward in both chairs');

/* ── 2. IT ACTUALLY MOVES A KING, A ROOK AND THREE PAWNS ────────────────────────────── */
function freshDefender(withRook, pawnFiles) {
  const b = new Array(64).fill('');
  b[4] = 'k';
  if (withRook) b[7] = 'r';
  (pawnFiles || [0, 1, 2, 3, 4, 5, 6, 7]).forEach(f => { b[8 + f] = 'p'; });
  return b;
}
const F = { f7: 13, g7: 14, h7: 15, g8: 6, f8: 5, e8: 4 };

const b18 = freshDefender(true);
const o18 = G.applyDefenderPos(b18, 'b', 18);
check('an 18 castles the king', o18.castled === true && b18[F.g8] === 'k' && !b18[F.e8]);
check('…and the rook hooks around to f8', o18.rook === true && b18[F.f8] === 'r');
check('…and three pawns stand in front of him', o18.shield === 3 &&
      b18[F.f7] === 'p' && b18[F.g7] === 'p' && b18[F.h7] === 'p');
check('…and the chain never marches a shield pawn away',
      b18[F.f7] === 'p' && b18[F.g7] === 'p' && b18[F.h7] === 'p',
      'the shield is frozen before the chain runs');

const b16 = freshDefender(true);
const o16 = G.applyDefenderPos(b16, 'b', 16);
check('a 16 tucks the king in ALONE', o16.castled === true && b16[F.g8] === 'k');
check('…with NO rook — it is still on h8', o16.rook === false && b16[7] === 'r' && !b16[F.f8]);
check('…and NO shield claimed', o16.shield === 0);

const b15 = freshDefender(true);
check('a 15 leaves the king on e8', G.applyDefenderPos(b15, 'b', 15).castled === false && b15[F.e8] === 'k');

/* the shield is BUILT, not just kept: three center pawns walk across to the king */
const bPull = freshDefender(true, [2, 3, 4]);          // c7 d7 e7 only
const oPull = G.applyDefenderPos(bPull, 'b', 20);
check('a short muster PULLS pawns across to make the shield',
      oPull.shield === 3 && bPull[F.f7] === 'p' && bPull[F.g7] === 'p' && bPull[F.h7] === 'p',
      'three center pawns became the shield');
check('…and it moved them rather than inventing them',
      bPull.filter(x => x === 'p').length === 3, 'still exactly three pawns on the board');

/* not enough pawns: report the truth, do not fake a shield */
const bThin = freshDefender(true, [0]);                 // one pawn, on a7
const oThin = G.applyDefenderPos(bThin, 'b', 20);
check('one pawn buys a shield of one, not of three', oThin.shield === 1,
      'shield of ' + oThin.shield + ' — a roll cannot conjure material the muster did not buy');

const noRook = freshDefender(false);
const nr = G.applyDefenderPos(noRook, 'b', 20);
check('with no rook the king still castles and still gets his shield',
      nr.castled === true && nr.rook === false && nr.shield === 3);

/* the g-square can be occupied by the muster — then there is no castle at all */
const blocked = freshDefender(true);
blocked[F.g8] = 'n';
check('a knight on g8 blocks the castle rather than overwriting itself',
      G.applyDefenderPos(blocked, 'b', 20).castled === false && blocked[F.g8] === 'n');

/* ── 3. THE WIRING — his 2026-08-11 answer: the POSITION die, and only that ─────────── */
const call = /applyDefenderPos\(\s*board\s*,\s*[^,]+,\s*([A-Za-z0-9_.]+)\s*\)/.exec(src);
check('the defender\'s castle is fed by the POSITION die', !!call && /\bdPos\b/.test(call[1]),
      call ? 'applyDefenderPos(…, ' + call[1] + ')' : 'CALL SITE NOT FOUND');
check('the MATERIAL die has no path to it', !/applyDefenderPos\([^)]*dMat/.test(src),
      'dMat only ever buys an army');
check('castling is the DEFENDER\'s alone — the attacker\'s half cannot reach it',
      !/posCastles/.test(slice('function applyAttackerPos', 'function applyDefenderPos')));

/* ── 4. THE ROLL SCREEN SAYS THE SAME NUMBERS AS THE CODE ───────────────────────────── */
check('the how-it-works screen states BOTH bands',
      /<b>16 or better<\/b> tucks your\s+king into the corner/.test(src) &&
      /<b>18 or better<\/b> brings his rook around/.test(src),
      'the page and the rule agree, on both halves of it');
check('the roll screen distinguishes a full castle from a king alone',
      /rook hooks around/.test(src) && /no rook, no shield/.test(src),
      'a 16 and an 18 no longer read identically');
check('no bare threshold survives outside the two constants',
      !/die\s*>=\s*1[5-9]|Pos\s*>=\s*1[5-9]/.test(src),
      'every reader goes through posTop() / posCastles() / posCastleFull()');

/* ── report ─────────────────────────────────────────────────────────────────────────── */
console.log('\n=== MARCHLAND — HIS DICE RULES ===\n');
let failed = 0;
for (const r of results) {
  if (!r.pass) failed++;
  console.log('  ' + (r.pass ? '✓' : '✗') + ' ' + r.label + (r.detail ? '   ' + r.detail : ''));
}
console.log('\nRESULT: ' + (failed ? 'FAIL (' + failed + ')' : 'PASS (' + results.length + ' checks)') + '\n');
process.exit(failed ? 1 : 0);
