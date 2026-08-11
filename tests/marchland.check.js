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
const code = slice('var POS_TOP', 'function posSteps') +
             slice('function posSteps', '/* ── THE MUSTER') +
             slice('function pawnsOf', '/* ── THE ENGINE');
const G = { Math, Array };
vm.createContext(G);
vm.runInContext(code, G);

/* ── 1. THE BOUNDARY — "within three points of maximum" ─────────────────────────────── */
check('the top band is a named constant, not a typed number', G.POS_TOP === 17,
      'POS_TOP = ' + G.POS_TOP + ' (20 - 3, inclusive)');
check('16 does NOT castle — it is four off the maximum', G.posCastles(16) === false);
check('17 DOES castle — three off the maximum is inside his rule', G.posCastles(17) === true);
check('18, 19 and 20 castle', [18, 19, 20].every(d => G.posCastles(d) === true));
check('a low roll never castles', [1, 5, 10, 15].every(d => G.posCastles(d) === false));
check('exactly four faces of the twenty castle', [...Array(20)].filter((_, i) => G.posCastles(i + 1)).length === 4,
      '20% of rolls, not 15%');
check('the attacker\'s second rank rides the SAME band', [16, 17, 20].map(d => G.posTop(d)).join() === 'false,true,true',
      'one constant for the top band, so his 17 cannot half-land');

/* ── 2. IT ACTUALLY MOVES A KING (a boolean is not a castle) ────────────────────────── */
function freshDefender(withRook) {
  const b = new Array(64).fill('');
  b[4] = 'k';
  if (withRook) b[7] = 'r';
  for (let i = 8; i < 16; i++) b[i] = 'p';
  return b;
}
const b17 = freshDefender(true);
const out17 = G.applyDefenderPos(b17, 'b', 17);
check('a 17 really castles on the board', out17.castled === true && b17[6] === 'k' && b17[5] === 'r',
      'king to g8, rook to f8, e8 empty');
const b16 = freshDefender(true);
check('a 16 leaves the king on his square', G.applyDefenderPos(b16, 'b', 16).castled === false && b16[4] === 'k');
const noRook = freshDefender(false);
const nr = G.applyDefenderPos(noRook, 'b', 20);
check('with no rook the roll is spent on the chain, not swallowed', nr.castled === false && nr.chain > 0,
      'chain of ' + nr.chain);

/* ── 3. THE WIRING — his 2026-08-11 answer: the POSITION die, and only that ─────────── */
const call = /applyDefenderPos\(\s*board\s*,\s*[^,]+,\s*([A-Za-z0-9_.]+)\s*\)/.exec(src);
check('the defender\'s castle is fed by the POSITION die', !!call && /\bdPos\b/.test(call[1]),
      call ? 'applyDefenderPos(…, ' + call[1] + ')' : 'CALL SITE NOT FOUND');
check('the MATERIAL die has no path to it', !/applyDefenderPos\([^)]*dMat/.test(src),
      'dMat only ever buys an army');
check('castling is the DEFENDER\'s alone — the attacker\'s half cannot reach it',
      !/posCastles/.test(slice('function applyAttackerPos', 'function applyDefenderPos')));

/* ── 4. THE ROLL SCREEN SAYS THE SAME NUMBER AS THE CODE ────────────────────────────── */
check('the how-it-works screen states 17, not a stale 18', /Roll 17 or better on defense/.test(src),
      'the page and the rule agree');
check('no bare 18 survives as a top-band threshold', !/die\s*>=\s*18|Pos\s*>=\s*18/.test(src),
      'every reader goes through posTop()');

/* ── report ─────────────────────────────────────────────────────────────────────────── */
console.log('\n=== MARCHLAND — HIS DICE RULES ===\n');
let failed = 0;
for (const r of results) {
  if (!r.pass) failed++;
  console.log('  ' + (r.pass ? '✓' : '✗') + ' ' + r.label + (r.detail ? '   ' + r.detail : ''));
}
console.log('\nRESULT: ' + (failed ? 'FAIL (' + failed + ')' : 'PASS (' + results.length + ' checks)') + '\n');
process.exit(failed ? 1 : 0);
