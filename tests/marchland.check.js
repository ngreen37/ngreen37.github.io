#!/usr/bin/env node
/* ══════════════════════════════════════════════════════════════════════════════════════
   CHESSWILD: CAMPAIGN — HIS RULES, AS A GATE

   TWO PHASES, and the split is the point:

     PHASE 1 (vm)      the pure rules — position die, dice pools, rank caps, the chain,
                       the shape of the map. Sliced straight out of the shipped HTML and
                       run in a vm. Fast, and nothing is stubbed.
     PHASE 2 (browser) the things a vm cannot see, because they live in the DOM and in the
                       clock: the idle-defender exploit, the reveal beat, and whether a
                       clock can grow. Driven with puppeteer against the real page.

   ⚠⚠ PHASE 2 EXISTS BECAUSE PHASE 1 COULD NOT HAVE CAUGHT THE WORST BUG THIS GAME HAD.
   The defending player won every single defense by never touching the board — the
   defender's clock reaching zero WAS the defender's victory, so idling was optimal. No
   amount of checking pure functions finds that. Driving the page found it in 15.1 seconds.
   [[local-dev-and-verification]] — drive the thing, don't look at it.

   RULES THAT ARE HIS AND HAVE BEEN STATED TWICE EACH belong in a test rather than in a
   comment, because a comment cannot disagree with the code — and that is exactly how the
   castling threshold shipped wrong for three days:

     "Castle: within three points of maximum, defenders king is castled."   (2026-08-08)
     "Castling - for the defender rolls, within 3 points of maximum."       (2026-08-11)
     "only the position dice for the castling."                             (2026-08-11)

   ⚠⚠ AND A CHECK CAN PASS ON A COMMENT, WHICH HAPPENED HERE. The old check for "the roll
   screen distinguishes a full castle from a king alone" grepped the WHOLE FILE for the
   phrase "rook hooks around". After the v0.2 rewrite that phrase survived only in a
   comment block explaining the rule — the roll screen itself had stopped saying it — and
   the check would have gone on passing over a screen that no longer told the player
   anything. Every UI-string check below now slices the function that WRITES the string
   and searches only that. [[green-must-name-what-ran]]
   ══════════════════════════════════════════════════════════════════════════════════════ */
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const GAME = path.join(ROOT, 'assets/games/pjcc_marchland.html');
const src = fs.readFileSync(GAME, 'utf8');

const results = [];
function check(label, pass, detail) { results.push({ label, pass: !!pass, detail: detail || '' }); }

/* ── slice the pure code out of the shipped file ────────────────────────────────────── */
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
const code =
  slice('var LAND = [',     '/* ── THE CHAIN') +
  slice('var CHAIN_MIN',    '/* ── DIFFICULTY') +
  slice('var LEVELS = {',   'var G = null;') +
  /* ⚠ STARTS AT `var FACES`, NOT AT `function d20()` — 2026-08-25, and this is the SECOND
     time this exact trap has been sprung on this slice (see the POS_CASTLE note above).
     The d8 change put a new constant ABOVE the function, and a slice that began at the
     function would hand the vm a `d20()` whose FACES does not exist. Same lesson: a slice
     boundary must sit above every name the sliced code reads. */
  slice('var FACES',        '/* ── THE MATERIAL DIE') +
  slice('var MAT_SCALE',    '/* ── THE POSITION DIE') +
  slice('var POS_CASTLE',   'function posSteps') +
  slice('function posSteps', '/* ── THE MUSTER') +
  /* ⚠ ONE SLICE FROM VAL TO THE ENGINE since 11-17: the vanguard reads W_PAWN's files and clearFile the back ranks */
  slice('var VAL = {',      '/* ── THE ENGINE') +
  /* ⚠ THE CLOCK CONSTANTS LIVE FAR DOWN THE FILE and were not in this context at first —
     so the JSON check below compared the generated file against `undefined` and failed
     loudly, which is exactly what it should do. A check that reads a name it was never
     given must not quietly pass. */
  slice('var CLOCK_ATT',    '/* THE REVEAL BEAT');
const G = { Math, Array };
vm.createContext(G);
vm.runInContext(code, G);

/* ══ 1. THE MAP — ten holdings, and an even start ═══════════════════════════════════
   ⚑ His: "Let's add another territory so they are even." He was right and it was worse
   than one territory: the opening was 5 holdings / 14 ranks against 4 / 10. */
check('ten holdings', G.LAND.length === 10, G.LAND.length + ' on the map');
const own = G.START_OWN, rk = G.START_RANKS;
const mine = own.filter((o) => o === 'm').length, theirs = own.filter((o) => o === 't').length;
check('five holdings each', mine === 5 && theirs === 5, mine + ' yours · ' + theirs + ' theirs');
const bMine = rk.reduce((s, v, i) => s + (own[i] === 'm' ? v : 0), 0);
const bTheirs = rk.reduce((s, v, i) => s + (own[i] === 't' ? v : 0), 0);
check('…and the same number of ranks', bMine === 15 && bTheirs === 15,
      bMine + ' yours · ' + bTheirs + ' theirs');
/* ⭐ AND MIRRORED, NOT MERELY EQUAL. Two sides can hold fifteen ranks each and still have
   completely different shapes — one 11-stack against five 3s is "even" and unplayable. */
const shape = (side) => rk.filter((_, i) => own[i] === side).slice().sort((a, b) => a - b).join(',');
check('…in the same shape on both sides', shape('m') === shape('t'),
      'yours ' + shape('m') + ' · theirs ' + shape('t'));

const deg = (id) => G.ADJ[id].length;
check('Sea-Board still borders exactly two — his rule', deg(4) === 2, 'degree ' + deg(4));
check('Shogi Island still borders exactly two — his rule', deg(7) === 2, 'degree ' + deg(7));
check('Checker Town still has five fronts — "tough position"', deg(3) === 5, 'degree ' + deg(3));
check('Chess City still has five — "good position to start"', deg(5) === 5, 'degree ' + deg(5));
/* nothing stranded: a holding nobody can reach is a holding nobody can take */
const seen = new Set([0]); const stack = [0];
while (stack.length) { const n = stack.pop(); G.ADJ[n].forEach((j) => { if (!seen.has(j)) { seen.add(j); stack.push(j); } }); }
check('the map is fully connected', seen.size === G.LAND.length, seen.size + '/' + G.LAND.length + ' reachable');
check('no edge is listed twice', new Set(G.EDGES.map((e) => e.slice().sort().join('-'))).size === G.EDGES.length);
/* ⚠ A NAME PAST ~13 CHARACTERS WRAPS TO A THIRD LINE under a 58px node and crowds its
   neighbors. This is a layout constraint wearing a data check. */
const tooLong = G.LAND.filter((L) => L.nm.length > 13).map((L) => L.nm);
check('every holding name fits under a 58px node', tooLong.length === 0, tooLong.join(', ') || 'longest ' +
      Math.max(...G.LAND.map((L) => L.nm.length)) + ' chars');
/* the slow-rolled locations stay off the map — a key-gated prototype is not where lore leaks */
const banned = ['The Sea', 'Mystery City', 'Chess City Elementary'];
check('no slow-rolled location appears on the map',
      !G.LAND.some((L) => banned.indexOf(L.nm) >= 0), '[[slow-roll-cast]]');

/* ══ 2. RANKS ARE DICE ════════════════════════════════════════════════════════════
   ⚑ His: "Currently, the amount of troops on a territory don't seem to matter much." */
check('two ranks is one die', G.poolFor(2, false) === 1);
check('four ranks is two', G.poolFor(4, false) === 2);
check('eight ranks is four', G.poolFor(8, false) === 4);
check('the pool is capped, so a huge stack is not a certainty',
      G.poolFor(40, false) === G.DICE_CAP, 'cap ' + G.DICE_CAP);
check('a lone rank still rolls something', G.poolFor(1, false) === 1 && G.poolFor(1, true) === 1);
check('the defender rounds UP where the attacker rounds down — nobody stays home on defense',
      G.poolFor(3, true) === 2 && G.poolFor(3, false) === 1, '3 ranks: 2 dice defending, 1 attacking');
check('more ranks is never fewer dice',
      [1,2,3,4,5,6,7,8,9,10].every((b, i, a) => i === 0 || G.poolFor(b, false) >= G.poolFor(a[i-1], false)));
check('bestOf keeps the largest face', G.bestOf([3, 19, 7, 11]) === 19);
check('the ring goes on the FIRST maximum, so two 20s do not both light up',
      G.keptIndex([20, 4, 20]) === 0);
/* ⛑⛑ THIS CHECK EXISTED, WAS GREEN, AND IS THE REASON THE BUG SURVIVED — 2026-08-25.
   It read: dieBand over faces 1..20 spells 11111222223333344444. That is a true statement
   about a TWENTY-sided die, and it stayed true after the die became eight-sided, because
   the function still carried its d20 thresholds. Meanwhile every real roll landed 1-8 and
   painted only b1 or b2. **The gate was testing a die the game no longer rolls.**
   ⭐⭐ A CHECK PINNED TO LITERALS THE CODE ALSO HARD-CODES PROVES ONLY THAT NOBODY EDITED
   EITHER COPY. It cannot notice that the pair went out of step with the GAME. The band
   checks live in §5b now, written against G.FACES, so they follow the die.
   What survives here is the one thing worth keeping from the old line — proof that the new
   formula REPRODUCES the old one exactly, which is what makes it a generalization rather
   than a replacement. dieBand reads FACES from the vm, so the vm is where it is asked. */
check('the band formula still spells the d20 exactly, when the die IS a d20',
      (() => {
        const was = G.FACES;
        try { G.FACES = 20; return [...Array(20)].map((_, i) => G.dieBand(i + 1)).join(''); }
        finally { G.FACES = was; }
      })() === '11111222223333344444',
      '1-5 thin · 6-10 plain · 11-15 strong · 16-20 hot — the version this replaced');
check('…and FACES was restored, so nothing below reads a borrowed die', G.FACES === 8);

/* ══ 3. THE BANNER CAPS ═════════════════════════════════════════════════════════════
   ⚠⚠ MUTATION-TESTED ON PURPOSE. `capsFor(2).q === 0` alone would still pass if muster()
   ignored the caps object entirely — so the real check is BEHAVIORAL: hand a thin holding
   an enormous budget and prove no queen comes out. [[green-must-name-what-ran]] */
check('under three ranks the cap says no queen', G.capsFor(2).q === 0);
check('three ranks unlocks one', G.capsFor(3).q === 1 && G.capsFor(9).q === 1);
let thinQueens = 0, fatQueens = 0;
for (let i = 0; i < 400; i++) {
  if (G.muster(40, G.capsFor(2)).indexOf('q') >= 0) thinQueens++;
  if (G.muster(40, G.capsFor(4)).indexOf('q') >= 0) fatQueens++;
}
check('…and a thin holding NEVER fields one, however big the roll',
      thinQueens === 0, thinQueens + '/400 musters at 40 points');
check('…while a stacked one usually does', fatQueens > 200, fatQueens + '/400');
check('the rook cap climbs with the stack',
      G.capsFor(2).r === 1 && G.capsFor(3).r === 2 && G.capsFor(9).r === 2);
check('a muster never exceeds its own budget',
      [1, 7, 14, 25, 40].every((b) => {
        const a = G.muster(b, G.capsFor(5));
        return a.reduce((s, k) => s + G.VAL[k], 0) <= b;
      }));
check('an empty budget still musters an army rather than nothing at all',
      G.matBudget(1, 1, false) >= 1, 'matBudget floors at 1 point');

/* ══ 4. THE CHAIN ═══════════════════════════════════════════════════════════════════ */
check('two neighbors of your own is a chain', G.CHAIN_MIN === 2);
{
  const o = ['m','m','m','t','t','t','t','t','t','t'];   // 0,1,2 — 0-1, 0-2, 1-3…
  check('a holding with two friendly neighbors is chained', G.chained(o, 0) === true,
        'Sand Mines beside The Fork and Gauntlet Keep');
  const o2 = ['m','t','m','t','t','t','t','t','t','t'];
  check('…with one, it is not', G.chained(o2, 0) === false);
  const o3 = own.slice();
  check('the chain reads the OWNER array it is handed, not a global',
        G.chained(o3, 5) === true && G.chained(['t','t','t','t','t','t','t','t','t','t'], 5) === true);
  /* the map header prints this, so it has to count holdings and not links */
  const o4 = ['m','m','m','t','t','t','t','t','t','t'];
  check('the chain COUNT counts chained holdings of one side',
        G.chainCount(o4, 'm') === 1 && G.chainCount(o4, 't') === 6,
        'of the three, only Sand Mines has two friendly neighbors — and Sea-Board, ' +
        'alone on two borders, is the one holding of theirs that is not chained');
}

/* ══ 4b. THREE ATTACKS A ROUND ══════════════════════════════════════════════════════
   His, 2026-08-25: "User should be able to do up to 3 attacks per phase." Phase 2 proves
   the budget actually falls as you spend it; these are the source-level companions. */
check('the attack budget is three', G.ATTACK_CAP === 3);
check('⚠ the machine cannot out-attack the player',
      Object.keys(G.LEVELS).every(k => Math.min(G.LEVELS[k].maxAtk, G.ATTACK_CAP) <= G.ATTACK_CAP) &&
      /* his #5: a general's style moves the level's count (Wes one fewer, the Seaboard Rep one more) inside the same clamp */
      /Math\.min\(plain \? L\.maxAtk : Math\.max\(1, L\.maxAtk \+ St\.cap\), ATTACK_CAP\)/.test(src) &&
      Object.keys(G.STYLES).every((k) => G.STYLES[k].cap <= 1),
      'Hard already plays 3; the clamp is what keeps that true after the next edit');
check('…and the budget is spent when an attack is COMMITTED, not when it is won',
      /G\.atks--;\s*\n\s*beginBattle\(G\.sel, id, true\)/.test(src),
      'an attack you lose is still one of your three');
{
  /* ⚠ MUTATION-MINDED: three separate places have to agree, so each gets its own check
     rather than one regex that a single surviving site would satisfy. */
  const resetFn = slice('function startYourTurn()', 'function campaignCheck');
  check('a new round hands the budget back', /G\.atks = ATTACK_CAP;/.test(resetFn));
  /* ⚠ THE THIRD SLICE-BOUNDARY CATCH FROM THIS FILE, 2026-08-25 — and the same lesson each
     time. The handler's BODY moved into `function continueOn()` when the battle verdict got
     its own on-board button (`#econt`), so both buttons share one implementation; slicing
     from `$('cont').addEventListener` then captured two one-line listeners and none of the
     logic, and this check went quietly green-adjacent on an empty string. Slice the FUNCTION,
     not the place it happens to be wired up. */
  const contFn = slice('function continueOn()', "$('cont').addEventListener");
  check('spending the last attack moves you on rather than stranding you',
        /G\.atks <= 0[\s\S]{0,120}setPhase\('fortify'\)/.test(contFn),
        'the map still opens first, so you see what you took');
}

/* ══ 5. THE POSITION DIE — EIGHT FACES SINCE 2026-08-25 ═════════════════════════════
   The die went d20 → d8 (Nate: "dramatically lower … keep the same feel"). These checks are
   RE-DERIVED, not rescaled: the rule was always "the top quarter castles, the top band gets
   the rook", and on eight faces that is 7+ and 8. The percentages below are the point of the
   change and the reason they are asserted as COUNTS over the real face range rather than as
   remembered numbers — 25% survived exactly, 15% could not (1/8 is 12.5%) and the check says
   so out loud instead of quietly accepting whatever the code does.
   ⚠ IF FACES MOVES AGAIN, THESE ARE THE NUMBERS TO RE-DERIVE FIRST. */
check('the die has eight faces', G.FACES === 8, 'd20 → d8, 2026-08-25');
check('the two bands are named constants, not typed numbers',
      G.POS_CASTLE === 7 && G.POS_TOP === 8,
      'POS_CASTLE = ' + G.POS_CASTLE + ' (top quarter) · POS_TOP = ' + G.POS_TOP + ' (top face)');
check('6 does NOT castle — outside the top quarter', G.posCastles(6) === false);
check('7 castles — the bottom of the top quarter', G.posCastles(7) === true);
check('…but a 7 does NOT bring the rook',
      G.posCastleFull(7) === false, 'his "they don\'t get the rook"');
check('an 8 brings the rook', G.posCastleFull(8) === true);
check('a low roll never castles', [1, 2, 3, 4].every(d => G.posCastles(d) === false));
check('exactly two faces of the eight castle at all',
      [...Array(8)].filter((_, i) => G.posCastles(i + 1)).length === 2,
      '25% of rolls — the SAME 25% the d20 had');
check('…and exactly one of those gets the full castle',
      [...Array(8)].filter((_, i) => G.posCastleFull(i + 1)).length === 1,
      '12.5% — the d20 was 15%; eighths cannot hit 15 and this is the whole cost of the change');
check('the four position bands are still a clean quarter each',
      [0, 1, 2, 3].every(band =>
        [...Array(8)].filter((_, i) => G.posSteps(i + 1) === band).length === 2),
      '25/25/25/25, identical to the d20 — floor((d-1)/2) over 8 == floor((d-1)/5) over 20');
check('the attacker\'s second rank rides the TOP band, not the wider one',
      [6, 7, 8].map(d => G.posTop(d)).join() === 'false,false,true',
      'the top face is the top reward in both chairs');

/* ══ 5b. THE DIE'S COLOR IS A FUNCTION OF FACES TOO ══════════════════════════════
   ⛑⛑ BANDS 3 AND 4 WERE UNREACHABLE FOR A DAY. `dieBand` kept its d20 thresholds
   (v<=5, v<=10, v<=15) through the change to eight faces, so every roll painted b1 or b2
   and the gold top band — the one with the glow — never appeared once.
   ⭐⭐ IT SLIPPED BECAUSE IT RETURNS A CSS CLASS. Twelve constants were re-derived that day
   by asking "what does this do to the GAME", and the answer for this one is "nothing" — it
   cannot be wrong, only invisible. That is exactly why it needed a check and did not have
   one. `npm run sweep` cannot help: it proves .b4 is REFERENCED, never that it is REACHED.
   ⚠ THE FIRST THREE CHECKS BELOW ARE THE GENERAL ONES — they are written against FACES, so
   they hold at any die size and this cannot happen again on the next change. */
check('every face paints a band in 1..4',
      [...Array(G.FACES)].every((_, i) => { const b = G.dieBand(i + 1); return b >= 1 && b <= 4; }));
check('⚠ all four bands are REACHABLE — the gold top band actually appears',
      new Set([...Array(G.FACES)].map((_, i) => G.dieBand(i + 1))).size === 4,
      'reached: ' + [...new Set([...Array(G.FACES)].map((_, i) => G.dieBand(i + 1)))].join(','));
check('the bands are quarters, within a face',
      [1, 2, 3, 4].every(band => {
        const n = [...Array(G.FACES)].filter((_, i) => G.dieBand(i + 1) === band).length;
        return Math.abs(n - G.FACES / 4) <= 1;
      }),
      [1, 2, 3, 4].map(b => [...Array(G.FACES)].filter((_, i) => G.dieBand(i + 1) === b).length).join('/'));
check('⭐ on the position die the gold band IS the castling set',
      [...Array(G.FACES)].every((_, i) =>
        (G.dieBand(i + 1) === 4) === G.posCastles(i + 1)),
      'b4 = {7,8} = posCastles — the color and the rule agree without being told to');
/* The badge itself: markup, both paint paths, and the stillness guard. */
const diceFns = slice('function paintDice', 'function matVerdict');
check('the castle mark is asked of posCastles(), not of the band',
      /if \(isPos && isDef && posCastles\(v\)\) cls \+= ' castle';/.test(diceFns),
      'one source of truth for what castles — move POS_CASTLE and the badge moves with it');
check('⚠ …and only on the KEPT die — a dropped 7 castles nothing',
      /i === keptIdx[\s\S]{0,160}posCastles\(v\)/.test(diceFns));
check('the tap-to-skip path paints the castle too',
      (slice('function finishRoll()', 'function runRoll()').match(/, true, true\)/g) || []).length === 2,
      'the fortieth battle is played on skip — it must not lose the mark');
check('the slow reveal marks the two POSITION pools and neither material pool',
      /rollStep\('att-pos', p\.aPosPool, false, true,/.test(src) &&
      /rollStep\('def-pos', p\.dPosPool, true, true,/.test(src) &&
      /rollStep\('att-mat', p\.aMatPool, false, false,/.test(src) &&
      /rollStep\('def-mat', p\.dMatPool, true, false,/.test(src));
check('it is a glyph, not the ownership colors',
      /\.die\.castle::before \{ content: '\\265A'/.test(src) &&
      !/\.die\.castle[^{]*\{[^}]*var\(--mine\)/.test(src),
      '--mine/--theirs already answer "whose die is this" on this screen');
check('reduced motion parks the castle mark VISIBLE',
      /\.die\.roll, \.die\.kept, \.die\.kept::after, \.die\.castle::before,/.test(src),
      'it is information, not flourish — stillness costs the picture, never the fact');

/* ══ 5b. THE SECOND QUEEN — 2026-08-25 ════════════════════════════════════
   His: "two-queen-on-perfect-roll-and-if-chain-of-three". Three conditions, and the point of
   the rule is that ALL THREE are needed — so each one is denied on its own here. A single
   check that passed the happy path would stay green if any one condition were dropped, which
   is the exact mutation this rule is vulnerable to. */
check('a perfect roll on a chain of three unlocks the second queen',
      G.capsFor(9, 3, true).q === 2, 'ranks 9 · chained 3 · die 8');
check('…but not without the perfect roll',
      G.capsFor(9, 3, false).q === 1, 'a chain alone is not enough');
check('…and not without the chain',
      G.capsFor(9, 2, true).q === 1, 'a perfect roll alone is not enough');
check('…and never on a holding too thin for even one queen',
      G.capsFor(2, 9, true).q === 0, 'QUEEN_RANKS still comes first');
check('the old call shape still means one queen',
      G.capsFor(9).q === 1, 'capsFor(ranks) alone is unchanged behavior');
check('the chain threshold is a named constant', G.QUEEN2_CHAIN === 3);
check('the other caps did not move',
      G.capsFor(9, 3, true).b === 2 && G.capsFor(9, 3, true).n === 2 &&
      G.capsFor(9, 3, true).r === 2,
      'two bishops, two knights, two rooks — his "never more than 2"');

/* ══ 5c. HIS WORD FOR A HELD ATTACK ═════════════════════════════════════════ */
check('a failed attack reads DEFENDED, not REPULSED',
      /'DEFENDED'/.test(src) && !/'REPULSED'/.test(src),
      'his 2026-08-25 word — and the old one is gone, not merely unused');

/* ══ 5d. THE MATE IS DRAWN ON THE BOARD ══════════════════════════════════
   ⚠ THE RING IS ASKED OF THE REFEREE, NOT RE-DERIVED. If lightMate ever stops calling
   legalMoves it has become a second implementation of chess that can disagree with the
   first — the one thing this game has never allowed. */
check('the mate lighting asks the referee which squares are sealed',
      /function lightMate/.test(src) && /C\.legalMoves\(B\.S\)/.test(slice('function lightMate', 'function showEndcard')),
      'no independent king-move generator');
check('…and it only fires on a real mate',
      /if \(how === 'won-mate'\) lightMate\('b'\);/.test(src) &&
      /else if \(how === 'lost-mate'\) lightMate\('w'\);/.test(src),
      'a win on the clock has no trapped king to draw');
check('…and both mate animations are reduced-motion guarded',
      /@media \(prefers-reduced-motion: reduce\) \{\s*\.sq\.mated \{ animation: none; \}/.test(src),
      'it fires exactly when a player is reading the board');

/* ══ 6. IT ACTUALLY MOVES A KING, A ROOK AND THREE PAWNS ════════════════════════════ */
function freshDefender(withRook, pawnFiles) {
  const b = new Array(64).fill('');
  b[4] = 'k';
  if (withRook) b[7] = 'r';
  (pawnFiles || [0, 1, 2, 3, 4, 5, 6, 7]).forEach(f => { b[8 + f] = 'p'; });
  return b;
}
const F = { f7: 13, g7: 14, h7: 15, g8: 6, f8: 5, e8: 4 };

const b18 = freshDefender(true);
const o18 = G.applyDefenderPos(b18, 'b', 8);
check('an 8 castles the king', o18.castled === true && b18[F.g8] === 'k' && !b18[F.e8]);
check('…and the rook hooks around to f8', o18.rook === true && b18[F.f8] === 'r');
check('…and three pawns stand in front of him', o18.shield === 3 &&
      b18[F.f7] === 'p' && b18[F.g7] === 'p' && b18[F.h7] === 'p');
check('…and the chain never marches a shield pawn away',
      b18[F.f7] === 'p' && b18[F.g7] === 'p' && b18[F.h7] === 'p',
      'the shield is frozen before the chain runs');

const b16 = freshDefender(true);
const o16 = G.applyDefenderPos(b16, 'b', 7);
/* ⛑⛑ A 7 NO LONGER TUCKS HIM IN ALONE — 2026-08-25. Nate, looking at a board he had
   just won: *"The castled King should probably have at least one protective pawn
   (depending on the roll)."* The old rule walked the king into the corner and gave him
   nothing, which made the lower castling band strictly WORSE than not castling: he had
   left the middle of his own back rank to stand on an open file. A reward you can regret
   is a bug, and this check used to assert it. */
check('a 7 tucks the king into the corner', o16.castled === true && b16[F.g8] === 'k');
check('…with NO rook — it is still on h8', o16.rook === false && b16[7] === 'r' && !b16[F.f8]);
check('…and with a shield of exactly ONE, the pawn in front of him',
      o16.shield === 1 && b16[F.g7] === 'p',
      'one, not three — the band is what separates the two castles');
/* ⚠ THE FIRST VERSION OF THIS ALSO ASSERTED f7 AND h7 WERE EMPTY, AND THAT WAS TESTING THE
   WRONG RULE. With a full muster those two squares hold ordinary pawns that the shield never
   touched — the chain simply had no reason to march them. What makes the band ONE is the
   count and the frozen square, not the emptiness of its neighbors. The sparse fixture below
   is what actually proves it: two pawns on the far side, and the 7 pulls exactly one of them
   all the way across to g7 and stops. */
const bOne = freshDefender(true, [0, 1]);
const oOne = G.applyDefenderPos(bOne, 'b', 7);
check('…and a 7 PULLS one pawn across when the g-file is empty',
      oOne.shield === 1 && bOne[F.g7] === 'p' && bOne[F.f7] !== 'p' && bOne[F.h7] !== 'p',
      'one pawn moved, the second stayed where it was — the lower band buys exactly one');

const b15 = freshDefender(true);
check('a 6 leaves the king on e8', G.applyDefenderPos(b15, 'b', 6).castled === false && b15[F.e8] === 'k');

/* the shield is BUILT, not just kept: three center pawns walk across to the king */
const bPull = freshDefender(true, [2, 3, 4]);          // c7 d7 e7 only
const oPull = G.applyDefenderPos(bPull, 'b', 20);
check('a short muster PULLS pawns across to make the shield',
      oPull.shield === 3 && bPull[F.f7] === 'p' && bPull[F.g7] === 'p' && bPull[F.h7] === 'p',
      'three center pawns became the shield');
check('…and it moved them rather than inventing them',
      bPull.filter(x => x === 'p').length === 3, 'still exactly three pawns on the board');

/* ⚑ 11-17, his "it says they get three pawns but they don't have them pictured": THE SHIELD IS GIVEN where the muster
   bought none. The old check here asserted the opposite (a shield of one), and the board kept the promise 0.2% of the time. */
const bThin = freshDefender(true, [0]);                 // one pawn, on a7
const oThin = G.applyDefenderPos(bThin, 'b', 8, '');
check('one pawn and an 8: the one walks across and two more are GIVEN — three in front of him', oThin.shield === 3 &&
      oThin.given === 2 && bThin[F.f7] === 'p' && bThin[F.g7] === 'p' && bThin[F.h7] === 'p',
      'shield of ' + oThin.shield + ', given ' + oThin.given);
const bBare = freshDefender(true, []);
const oBare = G.applyDefenderPos(bBare, 'b', 7, '');
check('…and a 7 with no pawn at all still stands one in front of him', oBare.shield === 1 && oBare.given === 1 && bBare[F.g7] === 'p');
const bSea = freshDefender(true, []);
const oSea = G.applyDefenderPos(bSea, 'b', 8, 'pieces');
check('…but never at sea, where no pawn is', oSea.castled && oSea.rook && oSea.shield === 0 && oSea.given === 0 &&
      bSea.indexOf('p') < 0, 'king and rook only');

const noRook = freshDefender(false);
const nr = G.applyDefenderPos(noRook, 'b', 20);
check('with no rook the king still castles and still gets his shield',
      nr.castled === true && nr.rook === false && nr.shield === 3);

/* ⚑ 11-17: a piece on g steps across to e — the castle ALWAYS happens (it failed 6.7% of 7s, measured) */
const blocked = freshDefender(true);
blocked[F.g8] = 'n';
check('a knight on g8 steps across to e8 and the king castles anyway',
      G.applyDefenderPos(blocked, 'b', 8, '').castled === true && blocked[F.g8] === 'k' && blocked[F.e8] === 'n');
/* ⚑ 11-17: the rook comes round past a piece on f (it came 9% of the times there was one, measured) */
const inWay = freshDefender(false);
inWay[3] = 'r'; inWay[F.f8] = 'b';                   // rook d8, bishop f8: both dark squares
const oWay = G.applyDefenderPos(inWay, 'b', 8, '');
check('an 8 brings the rook round past a bishop on f8, which stands where the rook stood',
      oWay.rook === true && inWay[F.f8] === 'r' && inWay[3] === 'b', 'rook f8 · bishop d8');
const lightRook = freshDefender(false);
lightRook[2] = 'r'; lightRook[F.f8] = 'b';           // rook c8 (light), bishop f8 (dark)
G.applyDefenderPos(lightRook, 'b', 8, '');
const bAt = lightRook.findIndex((c, i) => i < 8 && c === 'b');
check('…and a bishop keeps its color when the rook stood on the other one (his pair rule)',
      lightRook[F.f8] === 'r' && bAt >= 0 && G.sqLight(bAt) === G.sqLight(F.f8), 'bishop on ' + bAt);
/* ⛑ NO BATTLE STARTS IN CHECK (measured 11-17: 9% of battles did, and the attacker's first legal move took the king) */
const seaCheck = freshDefender(true, []);
seaCheck[60] = 'K'; seaCheck[62] = 'R';                // the attacker's rook on g1, the g-file open at sea
G.applyDefenderPos(seaCheck, 'b', 8, 'pieces');
const file = (b, f0) => [1, 2, 3, 4, 5, 6, 7].map((r) => b[r * 8 + f0]).filter(Boolean)[0] || '';
check('at sea the rook at the far end of his open g-file steps aside, so he is not in check',
      seaCheck[F.g8] === 'k' && file(seaCheck, 6) !== 'R' && seaCheck.filter((c) => c === 'R').length === 1);
const eFile = freshDefender(false, [0, 1, 2, 3]);       // nothing on the e-file between the kings
eFile[F.g8] = 'r'; eFile[60] = 'K';
G.applyDefenderPos(eFile, 'b', 7, '');
check('…and a rook that stepped across to e8 never starts with the attacker\'s king in check down the e-file',
      eFile[F.g8] === 'k' && eFile[F.e8] !== 'r' && eFile.filter((c) => c === 'r').length === 1);

/* ══ 7. THE WIRING — his 2026-08-11 answer: the POSITION die, and only that ═════════ */
const call = /applyDefenderPos\(\s*board\s*,\s*[^,]+,\s*([A-Za-z0-9_.]+)\s*,\s*rule\s*\)/.exec(src);
check('the defender\'s castle is fed by the POSITION die', !!call && /\bdPos\b/.test(call[1]),
      call ? 'applyDefenderPos(…, ' + call[1] + ')' : 'CALL SITE NOT FOUND');
check('the MATERIAL die has no path to it', !/applyDefenderPos\([^)]*dMat/.test(src),
      'dMat only ever buys an army');
check('castling is the DEFENDER\'s alone — the attacker\'s half cannot reach it',
      !/posCastles/.test(slice('function applyAttackerPos', 'function applyDefenderPos')));
check('no bare threshold survives outside the two constants',
      !/die\s*>=\s*1[5-9]|Pos\s*>=\s*1[5-9]/.test(src),
      'every reader goes through posTop() / posCastles() / posCastleFull()');

/* ══ 8. THE SCREENS SAY THE SAME NUMBERS AS THE CODE ════════════════════════════════
   ⚠ EACH OF THESE SEARCHES ONLY THE REGION THAT WRITES THE STRING. Grepping the whole
   file lets a check pass on a comment that explains the rule instead of on the screen
   that states it — which is exactly what happened to the "rook hooks around" check. */
/* ══ THE MATE REPLAY: RAYS, ORDER, AND CLEAN-UP ═══════════════════════════
   2026-08-25, Nate: *"progressively explode from nearest square all the way to the king and
   show the controlled lines."* Verified end to end in a browser on the day; these pin the
   four things that would break it silently. */
{
  const lm = slice('function lightMate', 'function showEndcard');
  check('the lines come from the REFEREE, not from geometry re-derived here',
        /C\.attackersOf\(B\.S\.b, tgt, win\)/.test(lm),
        'pjcc-chess.js owns what attacks what — a picture that disagrees with the rules is worse than none');
  check('the king is always the LAST thing to go off',
        /rays\.sort\(function \(a, b2\) \{ return \(a\.king - b2\.king\)/.test(lm) &&
        /pop\[k\] = Math\.max\(/.test(lm),
        'sorted king-last, then the king square is pushed past the longest ray');
  check('a sealed square with no attacker still detonates',
        /if \(pop\[sealed\[i2\]\] == null\) pop\[sealed\[i2\]\] = last;/.test(lm),
        'a square blocked by his OWN piece has no line to draw — dropping it would ring the king with a hole');
  check('every ray declares pathLength="1"',
        /pathLength="1"/.test(src),
        '⚠ without it the dash resolves in pixels and the ray draws DOTTED');
  /* the `.mate-ray` rule, on its own, so a `vector-effect` somewhere else in the file
     cannot fail this and a `vector-effect` INSIDE it cannot hide */
  const rayRule = slice('.mate-ray {', '@keyframes ray-draw');
  check('…and nothing sets vector-effect inside the ray rule',
        !/vector-effect/.test(rayRule),
        'non-scaling-stroke overrules pathLength in Chrome — that is what drew it dotted, twice');
  check('…and the stroke is measured in board squares, not pixels',
        /stroke-width: 0\.0/.test(rayRule),
        'a width in user units scales with the board, which is what non-scaling-stroke was for');
  check('the men paint OVER the rays',
        /\.men \{ position: absolute; inset: 0; pointer-events: none; z-index: 4; \}/.test(src),
        'a ray ends ON the king square; without this it is drawn across the piece it is about');
  check('hideEndcard sweeps the SVG off the board',
        /querySelector\('\.mate-rays'\)[\s\S]{0,90}removeChild/.test(slice('function hideEndcard', 'function resolveLand')),
        'B.mate = null only stops the CLASSES — the lines are real DOM and would hang over the next battle');
  check('reduced motion parks the rays DRAWN, not hidden',
        /\.mate-ray \{ animation: none; stroke-dashoffset: 0; \}/.test(src),
        'this fires while a player is reading the board to find out why they lost');
}

const howScreen = slice('<section class="screen" id="screen-how">', '</section>');
/* ⛑ RE-ANCHORED TO THE TRIMMED COPY — 2026-08-25 (his: "it's too much text it's
   overwhelming"). The screen lost about half its words and not one of its rules, which is
   the only thing these six checks are for: they are what makes a trim safe to make.
   ⭐ AND THE 7-BAND CLAUSE GREW RATHER THAN SHRANK, because the RULE changed the same day —
   a 7 now brings a pawn with the king, so the screen has to say so. */
check('the how-it-works screen states BOTH castling bands',
      /<b>7 or better<\/b> castles your king behind a pawn/.test(howScreen.replace(/\s+/g, ' ')) &&
      /<b>an 8<\/b> brings his rook around and three pawns with him/.test(howScreen.replace(/\s+/g, ' ')),
      'the page and the rule agree, on both halves of it — re-checked when the die shrank');
check('…and the attacker\'s vanguard, given when the muster bought none',
      /your pawns start halfway up the board/.test(howScreen.replace(/\s+/g, ' ')) && /given if you bought none/.test(howScreen.replace(/\s+/g, ' ')));
check('…and that time follows the armies',
      /shared by material:<\/b> the bigger army gets more time/.test(howScreen.replace(/\s+/g, ' ')));
/* ⚠ \s+ BETWEEN THE WORDS, NOT A LITERAL SPACE. This copy is hand-wrapped HTML, so any
   trim that re-flows a line puts a newline and six spaces in the middle of a phrase — and
   three of these checks went red on the 2026-08-25 trim for exactly that, reporting missing
   RULES when nothing but the wrapping had moved. A gate that cannot survive a reflow makes
   editing copy scarier than it should be. */
/* ⚠⚠ COMMENTS STRIPPED FIRST, AND THE FILE HEADER ALREADY WARNED ABOUT THIS. These checks
   ask what the PLAYER reads; an HTML comment is not on the screen. The 2026-08-25 rename
   proved it immediately — "the word rank is gone" went red on the note I had just written
   explaining that the rename happened. Same trap the header describes from the other
   direction (a check PASSING on a comment); this is one FAILING on one. */
const flat = howScreen.replace(/<!--[\s\S]*?-->/g, ' ').replace(/\s+/g, ' ');
/* ⛑ "ranks" → "troops" ON SCREEN, 2026-08-25. The identifier is untouched, which is why
   every check LABEL in this file still says ranks and only the copy regexes moved. */
check('…and it explains that troops are dice',
      /keep the best/i.test(flat) && /one die per two troops/i.test(flat));
check('…and the word "rank" is gone from the player-facing screen',
      !/\brank(s)?\b/i.test(flat),
      'a rank is a ROW in chess, and pjcc-profile.js already owns RANKS for the credit ladder');
check('…and that your own flag is your own loss',
      /Run your own clock out and you lose/i.test(flat),
      'the rule that replaced "either flag goes to the defender"');
check('…and what a chain is',
      /chained/i.test(flat) && /extra die/i.test(flat));
check('…and that you only get three attacks',
      /three attacks a round/i.test(flat), 'his 2026-08-25 rule, stated on the screen');
check('…and that what is left on the board marches in',
      /What's left marches in/.test(flat) && /troops follow your pieces/.test(flat) && /keeps its share/.test(flat),
      'his 2026-11-10 pick, stated on the screen');

/* ══ 8b. HIS VOCABULARY, 2026-08-25 ═════════════════════════════════════════════════
   "change Levy phase to deployment phase… change March phase to attack phase, and night
   march phase to fortify phase… let's go with Ranks instead of Garrisons or banners."
   ⚠ THE PHASE STRIP IS THE ONLY PLACE A PLAYER READS A PHASE NAME, so it is the region
   this slices — not the whole file, where a comment would happily satisfy the regex. */
const phaseBar = slice('<div class="phasebar" id="phasebar">', '</div>');
/* ⛑ THREE CELLS, NOT FOUR — 2026-08-25, Nate: "Take out the 'theirs' box on the top right
   corner - stick to the three phases for each player." The strip is YOUR round.
   ⚠ THE ABSENCE IS ASSERTED, not merely un-asserted. Dropping the `theirs` clause would
   have left a check that passes whether or not the cell is there, which is how a removal
   quietly comes back. The 'theirs' PHASE still exists in the script and still runs. */
check('the phase strip reads Deploy, Attack, Fortify — and nothing for their turn',
      /data-p="deploy">Deploy</.test(phaseBar) && /data-p="attack">Attack</.test(phaseBar) &&
      /data-p="fortify">Fortify</.test(phaseBar) && !/data-p="theirs"/.test(phaseBar),
      phaseBar.replace(/\s+/g, ' ').trim().slice(0, 90));
{
  /* ⚠ TWO CHECKS, BECAUSE THE WORDS LIVE IN TWO PLACES: static markup on the screens, and
     string literals the script prints at runtime. Neither region includes comments, so a
     note that explains the old vocabulary cannot fail this and — more to the point —
     cannot satisfy it either. */
  const RETIRED = /\b(levy|levies|garrison|garrisons|banner|banners)\b/i;
  const markup = slice('<!-- ══ HOME', '<script>').replace(/<!--[\s\S]*?-->/g, '');
  check('⚠ no screen still says levy, garrison or banner', !RETIRED.test(markup),
        'the words he retired, across every screen at once');
  const printable = (src.match(/'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"/g) || [])
    .filter((s) => RETIRED.test(s));
  check('…and nothing the script can print says them either', printable.length === 0,
        printable.slice(0, 3).join(' | ') || 'no string literal carries the old words');
}

/* ══ 8c. THE CHAIN IS PROMOTED, IN FOUR PLACES ══════════════════════════════════════
   His: "The chain is great - let's do it and promote it in-game." A bonus nobody can see
   is a bonus nobody plays for, so each surface gets its own check — one regex over the
   file would stay green with three of the four deleted. */
check('the map header counts your chained holdings',
      /id="t-chain"/.test(slice('<div class="tally">', '</div>')) &&
      /\$\('t-chain'\)\.textContent = chainCount\(G\.own, G\.side\)/.test(src));
check('a chained holding is marked on the map itself',
      /if \(chained\(G\.own, L\.id\) \|\| held\(L\.id\)\) cls \+= ' chained';/.test(slice('function drawMap()', 'function tapLand')) &&
      /\.node\.chained \.disc \{/.test(slice('<style>', '</style>')),
      'a double ring, because .sel/.can/.tgt already own the disc box-shadow');
check('the roll screen says the extra die out loud, not in the fine print',
      /chainchip/.test(slice('function beginBattle(', '/* ── THE ROLL, AS FOUR BEATS')) &&
      /\.chainchip \{/.test(slice('<style>', '</style>')),
      'it used to appear only as ", +1 chained" behind a tap');

/* ══ 8d. THE WALLS ═════════════════════════════════════════════════════════════════
   ⚑ 2026-09-15, his: "let's do siege holding, but keep it limited to one territory each."
   A walled holding takes two won battles in the SAME turn: the first only breaks the walls.
   ⚠⚠ THE INVARIANT THAT MATTERS MOST IS THE LAST CHECK HERE — the walls must not reach the
   battle. ATT_EDGE is tuned against a measured 40-60% attack-failure rate, so a rule that
   changed a die or a clock would invalidate the one number this whole game is balanced on.
   Walls change what a WIN IS WORTH and nothing else. */
{
  const w = G.START_WALLS;
  check('one walled holding a side at the start — "one territory each"',
        w.length === 2 && own[w[0]] === 'm' && own[w[1]] === 't',
        w.map((id) => G.LAND[id].nm + ' (' + own[id] + ')').join(' · '));
  check('…and the two of them border each other', G.ADJ[w[0]].indexOf(w[1]) >= 0,
        'so the first siege either side can lay is on the other side\'s keep');
  check('the how-it-works screen states both halves of the rule',
        /breaks the walls/i.test(flat) && /win again the same turn/i.test(flat) &&
        /a troop a round/i.test(flat),
        'two wins to take it, a troop a round to hold it');
  check('a walled holding is marked on the map, and says so when it cannot be seen in color',
        /if \(walled\(L\.id\)\) cls \+= ' walls'/.test(slice('function drawMap()', 'function tapLand')) &&
        /', walls down' : ', walled'/.test(slice('function drawMap()', 'function tapLand')) &&
        /\.node\.walls \.disc::after \{/.test(slice('<style>', '</style>')),
        'a rook on the disc, and ", walled" / ", walls down" in the spoken label');
  check('the price is said before the attack is committed, and again on the roll screen',
        /siegeHint\(id\)/.test(slice('function tapLand', 'function scout(')) &&
        /wallchip/.test(slice('function beginBattle(', '/* ── THE ROLL, AS FOUR BEATS')),
        'tapping the target SPENDS the attack, so the map has to warn first');
  const resolve = slice('function resolveLand', '/* ── THE RIVAL');
  check('⚑ a won battle at the walls breaks them and takes no ground',
        /if \(sieged\(p\.to\)\) \{\s*G\.down\.push\(p\.to\);[\s\S]{0,240}?return true;\s*\}/.test(resolve) &&
        resolve.indexOf('sieged(p.to)') < resolve.indexOf('G.own[p.to] = G.own[p.from]'),
        'the breach returns BEFORE the transfer — order is the rule here');
  check('…and taking it puts the walls back up for whoever holds it now',
        /G\.down\.indexOf\(p\.to\)[\s\S]{0,120}splice/.test(resolve));
  check('a breach lasts one turn — both turn changes clear it',
        /G\.down = \[\];/.test(slice('function resetTurn()', 'function passTurn')) &&
        /G\.down = \[\];/.test(slice('function theirTurn(', 'function afterTurn(')),
        'yours ends at theirTurn, theirs ends at resetTurn — one of the two is not enough');
  check('holding one pays a troop a round',
        /wallsFor\(side\)/.test(slice('function deployFor', 'function idsOf')),
        'what makes the other side\'s keep worth two of your three attacks');
  const rival = slice('function rivalPlan(', 'function theirTurn');
  check('the machine books a siege as a pair, or not at all',
        /var need = cand\[i\]\.siege \? 2 : 1;/.test(rival) &&
        /if \(attacks\.length \+ need > cap\) continue;/.test(rival),
        'half a siege spends an attack and takes nothing');
  /* ⚠⚠ THE MUSTER (musterBattle, the half of beginBattle that rolls): the dice, the budgets, the armies and the
     board. Anything about the walls appearing in HERE is the balance bug this check exists for. */
  const battleMath = slice('function musterBattle(', 'function beginBattle(');
  check('⚠⚠ the walls never touch a battle — not a die, not a clock, not the edge',
        !/walled\(|breached\(|sieged\(|G\.down/.test(battleMath),
        'ATT_EDGE was measured against a 40-60% failure rate; this is what keeps it true');
}

/* ⚠⚠ SPLIT PER CHAIR, AND A MUTATION TEST IS WHY. This was ONE check over the whole of
   posVerdict() — and the phrase it looked for appears in BOTH branches, so deleting it from
   the defender's half left the attacker's half satisfying the regex and the gate stayed
   green. "A or B" needs two checks or one path can rot unwatched. You read the same
   position from two chairs in this game; both of them have to say the right thing. */
const verdictFn = slice('function posVerdict()', 'function boardCells');
/* the two chairs are the two halves of posVerdict's top-level if/else. Split the sliced
   function rather than anchoring on a brace that occurs all over the file. */
const chairSplit = verdictFn.indexOf('} else {');
const attChair = verdictFn.slice(0, chairSplit);
const defChair = verdictFn.slice(chairSplit);
check('posVerdict really does have two chairs to check', chairSplit > 0 && defChair.length > 200,
      'attacker half ' + attChair.length + ' chars, defender half ' + defChair.length);
/* ⚑ 11-17: CASTLED! in either chair, and the castle's words read off dInfo (his "it says they get three pawns but they
   don't have them pictured") — never a phrase typed for the die */
check('ATTACKING, a castle is CASTLED! in their words, read off the board',
      /if \(p\.dInfo\.castled\)\s*\{ word = 'CASTLED!'; clause = castleWords\(p\.dInfo, 'their'\)/.test(attChair),
      'dInfo.castled, not posCastles(dPos)');
check('DEFENDING, a castle is CASTLED! in yours',
      /if \(p\.dInfo\.castled\)\s*\{ word = 'CASTLED!'; clause = castleWords\(p\.dInfo, 'your'\)/.test(defChair));
check('no castle phrase is typed for the die any more',
      !/three pawns'|no rook, no shield|TUCKS IN|FULL CASTLE/.test(verdictFn), 'the old words described the die, not the board');
{
  const cw = vm.runInNewContext(slice('var NUM = [', 'function posVerdict()') + ';({ castleWords: castleWords, firstFace: firstFace })',
    { FACES: G.FACES, posSteps: G.posSteps });
  check('…and the castle words say what stands there',
        cw.castleWords({ rook: true, shield: 3 }, 'their') === 'their king, rook and three pawns' &&
        cw.castleWords({ rook: false, shield: 1 }, 'your') === 'your king and one pawn' &&
        cw.castleWords({ rook: true, shield: 0 }, 'their') === 'their king and rook' &&
        cw.castleWords({ rook: false, shield: 0 }, 'your') === 'your king alone',
        cw.castleWords({ rook: false, shield: 1 }, 'your'));
  check('…and the fine print\'s faces follow posSteps', cw.firstFace(1) === 3 && cw.firstFace(2) === 5 && cw.firstFace(3) === 7);
}
check('CASTLED! is large and gold, and still under reduced motion',
      /\.vline\.castled > b \{ font-size: 30px;[^}]*color: #ffd66a/.test(src) &&
      /\.die\.roll, \.die\.kept, \.die\.kept::after, \.die\.castle::before, \.vline\.castled > b,/.test(src));

/* ══ 9b. THE VERDICT REPORTS THE BOARD, NOT THE DIE ═════════════════════════════════
   ⛑⛑ 2026-08-25, found by LOOKING at a render. `applyAttackerPos` has always returned how
   many pawns it really advanced, and beginBattle discarded it — so posVerdict re-derived
   the number from the die and announced "PAWNS UP 2" over a board with no pawns, every
   time the muster spent its whole budget on pieces. RE-MEASURE, NEVER RECOMPUTE.
   [[audit-numbers-can-be-wrong]] */
check('the pawns that moved are KEPT, not re-derived',
      /var aMoved = applyAttackerPos\(/.test(src) && /aMoved:aMoved/.test(src),
      'the truth was already being computed and thrown away');
check('ATTACKING, the headline counts what stands up front',
      /van = p\.aMoved/.test(attChair) && !/van = posSteps/.test(attChair),
      'not what the die promised');
check('…and no die is wasted any more: "no pawns to push" is gone from the screen (it was 36% of attacks)',
      !/NO PAWNS TO PUSH|no pawns to push'/.test(attChair) && !/flats/.test(verdictFn));
check('DEFENDING, the chain counts pawns that really dug in',
      /count\(p\.dInfo\.chain, 'pawn'\) \+ ' dug in/.test(defChair) &&
      /NO PAWNS TO DIG IN/.test(defChair),
      'dInfo.chain is the measurement; posSteps is the promise');
/* ══ THE VANGUARD (his 11-17: "for the attacker pawns only are valuable if they start up closer to the defender's end") ══
   The die GIVES what the muster did not buy: "no pawns to push" was 36% of attacks (measured 11-17). */
{
  const noPawns = new Array(64).fill('');
  'RNBQKBNR'.split('').forEach((c, f) => { noPawns[56 + f] = c; });
  check('an all-pieces muster and an 8: three pawns up front, the first nearly through',
        G.applyAttackerPos(noPawns, 'w', 8, '') === 3 && noPawns[20] === 'P' && noPawns[27] === 'P' && noPawns[29] === 'P' &&
        noPawns.filter((c) => c === 'P').length === 3, 'e6 · d5 · f5');
  const four = new Array(64).fill('');
  [48, 49, 50, 51].forEach((i) => { four[i] = 'P'; });
  check('…a 5 with four pawns bought: two up front, the other two on the line beside them',
        G.applyAttackerPos(four, 'w', 5, '') === 2 && four[28] === 'P' && four[27] === 'P' && four[37] === 'P' && four[34] === 'P' &&
        four.filter((c) => c === 'P').length === 4, 'e5 d5 · f4 c4');
  const low = new Array(64).fill('');
  [48, 49].forEach((i) => { low[i] = 'P'; });
  check('…a 1 gives nothing, and the pawns bought still start on the line, halfway up',
        G.applyAttackerPos(low, 'w', 1, '') === 0 && low[36] === 'P' && low[35] === 'P' && low.filter((c) => c === 'P').length === 2);
  const black = new Array(64).fill('');
  check('…from the top, the attacker\'s own ranks: a 3 stands one on e4',
        G.applyAttackerPos(black, 'b', 3, '') === 1 && black[36] === 'p');
  const sea = new Array(64).fill('');
  check('…none at sea', G.applyAttackerPos(sea, 'w', 8, 'pieces') === 0 && sea.indexOf('P') < 0);
  const flatsB = new Array(64).fill('');
  [48, 49, 50, 51].forEach((i) => { flatsB[i] = 'P'; });
  check('…and the Flats get it too (the old push from home lost the race to the castle\'s given shield, measured)',
        G.applyAttackerPos(flatsB, 'w', 3, 'endgame') === 1 && flatsB[28] === 'P' && flatsB.filter((c, i) => c === 'P' && i >= 48).length === 0);
}
/* ══ TIME FOLLOWS THE ARMIES (his 11-17: "reward better the attacker who has a large army advantage, or vice versa") ══ */
{
  const ck = (a, d) => { const c = G.battleClocks(a, d); return c.att + '/' + c.def; };
  check('an even muster is his fifteen each', ck(20, 20) === '15/15' && ck(0, 0) === '15/15');
  check('28 against 12 is 21 seconds against 9, and the other way round', ck(28, 12) === '21/9' && ck(12, 28) === '9/21');
  check('…never under CLOCK_MIN, and always his thirty between them', ck(40, 1) === (30 - G.CLOCK_MIN) + '/' + G.CLOCK_MIN &&
        [[3, 30], [9, 9], [27, 2], [1, 1]].every((x) => { const c = G.battleClocks(x[0], x[1]); return c.att + c.def === G.CLOCK_ATT + G.CLOCK_DEF; }));
  check('the battle runs on the clocks the muster bought',
        /clk: \{ w: attWhite \? p\.clocks\.att : p\.clocks\.def, b: attWhite \? p\.clocks\.def : p\.clocks\.att \}/.test(src) &&
        /var clocks = battleClocks\(material\(board, attWhite \? 'w' : 'b'\), material\(board, attWhite \? 'b' : 'w'\), rule\);/.test(src));
  /* ⚑ his 11-18: "Is it first to make a queen? Then time should be like 15 seconds for each player, right?" */
  const eg = (a, d) => { const c = G.battleClocks(a, d, 'endgame'); return c.att + '/' + c.def; };
  check('⭐ the Flats are fifteen each, whatever the armies (a race to a queen is a race)',
        eg(28, 12) === '15/15' && eg(3, 20) === '15/15' && ck(28, 12) === '21/9');
}
const matFn = slice('function matVerdict()', 'function posVerdict');
check('the material verdict is one bold word plus one clause, not a sum',
      /<b>' \+ word \+ '<\/b><i>' \+ clause \+ '<\/i>/.test(matFn),
      'his "bolder and briefer"');
check('…with the arithmetic still available underneath',
      /class="maths"/.test(matFn), 'briefer, not hidden');

/* ══ 9. THE CLOCK RULE, AT THE SOURCE ═══════════════════════════════════════════════
   The behavioral proof is in phase 2; this is the source-level companion, so a rewrite
   that quietly restores the old mapping fails here even before a browser opens. */
const finishFn = slice('function finish(how)', 'function resolveLand');
check('the ATTACKER\'s flag loses the ground for the attacker',
      /how === 'time-att'[\s\S]{0,140}playerWon = !p\.playerAttacks/.test(finishFn));
check('⚠ the DEFENDER\'s flag now loses the ground for the DEFENDER',
      /how === 'time-def'[\s\S]{0,140}playerWon = p\.playerAttacks/.test(finishFn),
      'this is the fix for the idle-defender exploit — phase 2 proves it in a browser');
check('a draw still goes to the defender',
      /how === 'draw'[\s\S]{0,200}playerWon = !p\.playerAttacks/.test(finishFn));
check('the delay is a BRONSTEIN credit, capped at what the clock read when the move began',
      /Math\.min\(B\.turnStart, B\.clk\[mover\] \+ MOVE_DELAY\)/.test(src),
      'a plain increment would let a fast side gain time forever and the battle never end');

/* == 10. THE SHARED JSON IS NOT STALE ==============================================
   assets/data/marchland.json is DERIVED from this game and is what a Godot build reads.
   A derived file that nobody regenerates is worse than no derived file at all: it looks
   authoritative and quietly describes last week's map. Regenerate with
   `npm run gen:marchland`. */
{
  const gen = require(path.join(ROOT, 'tests/gen-marchland-data.js'));
  const onDisk = fs.existsSync(gen.OUT) ? fs.readFileSync(gen.OUT, 'utf8') : null;
  check('the shared JSON exists', onDisk !== null, 'assets/data/marchland.json');
  if (onDisk !== null) {
    check('...and matches the game it was generated from',
          onDisk === gen.build(), 'stale? run `npm run gen:marchland`');
    const d = JSON.parse(onDisk);
    check('...and carries the map a Godot build needs',
          d.holdings.length === G.LAND.length && d.edges.length === G.EDGES.length &&
          d.start.owner.length === G.LAND.length,
          d.holdings.length + ' holdings, ' + d.edges.length + ' borders, ' +
          Object.keys(d.levels).length + ' levels');
    check('...including every balance dial, so nothing has to be retyped',
          d.balance.attEdge === G.ATT_EDGE && d.balance.clockAtt === G.CLOCK_ATT &&
          d.balance.moveDelay === G.MOVE_DELAY && d.balance.queenRanks === G.QUEEN_RANKS && d.balance.clockMin === G.CLOCK_MIN &&
          d.balance.vanRank === G.VAN_RANK && d.balance.lineRank === G.LINE_RANK,
          'ATT_EDGE ' + d.balance.attEdge + ' - clocks ' + d.balance.clockAtt + '/' +
          d.balance.clockDef + ' - delay ' + d.balance.moveDelay + 's');
  }
}

/* == 11. WHAT'S LEFT ON THE BOARD MARCHES IN (his 11-10, #3) =====================
   The troops follow the pieces. 'win' is the measured rule (sim:campaign): the side that won the ground keeps the share
   of its troops its pieces kept of their points. */
{
  const camp = require(path.join(ROOT, 'tests/campaign-vm.js')).load();
  const run = (rule, attackerWon, kept, aRanks, dRanks, to) => {
    camp.setSurvive(rule);
    camp.newCampaign('medium', 'solo', { fog: true, cards: false });
    const G4 = camp.G; G4.ranks[5] = aRanks; G4.ranks[to == null ? 3 : to] = dRanks;
    const broke = camp.resolveLand({ from: 5, to: to == null ? 3 : to, playerAttacks: true, aRanks: aRanks, dRanks: dRanks }, attackerWon, kept);
    return { from: G4.ranks[5], to: G4.ranks[to == null ? 3 : to], own: G4.own[to == null ? 3 : to], broke: broke, t: G4.troops };
  };
  const shipped = camp.SURVIVE;
  check('⭐ the shipped rule is the measured one: the side that won the ground keeps its share', shipped === 'win', shipped);
  const clean = run('win', true, { a: 1, d: 0, rout: 'def' }, 4, 4);
  const scrappy = run('win', true, { a: 0.5, d: 0, rout: 'def' }, 4, 4);
  check('a clean win marches the whole army in; a scrappy one leaves it thin (4 troops, 3 go: 3, then 2)',
        clean.to === 3 && clean.from === 1 && clean.own === 'm' && scrappy.to === 2 && scrappy.from === 1,
        'clean ' + clean.to + ' · scrappy ' + scrappy.to);
  const held = run('win', false, { a: 0.9, d: 0.5, rout: null }, 4, 4);
  check('a defense that holds keeps its share, and a failed attack still goes home with one',
        held.to === 2 && held.from === 1 && held.own === 't', 'held ' + held.to + ' of 4 · home ' + held.from);
  const breach = run('win', true, { a: 0.4, d: 0.5, rout: null }, 5, 4, 0);
  check('…a breach leaves the attackers where they were and the garrison thinner', breach.broke && breach.from === 5 && breach.to === 2,
        'stack ' + breach.from + ' · garrison ' + breach.to);
  const left = run('win', false, undefined, 4, 4);
  check('a battle left half-way is a withdrawal: the side that left is routed, the other keeps everything',
        left.from === 1 && left.to === 4, 'home ' + left.from + ' · held ' + left.to);
  const old = run('off', true, { a: 0.25, d: 0, rout: 'def' }, 4, 4);
  const oldFail = run('off', false, { a: 0.9, d: 0.25, rout: null }, 4, 4);
  check('…and the old rule is one word away (off): all but one march, a hold keeps everything',
        old.to === 3 && old.from === 1 && oldFail.to === 4 && oldFail.from === 1);
  /* ⚑ his 11-18, the defender's mate: #2 PRISONERS (half that marched, rounded up, join the garrison) and #7 ROUTED! */
  const mated = run('win', false, { a: 0.6, d: 0.5, rout: 'att', mated: true }, 6, 4);
  const flagged = run('win', false, { a: 0.6, d: 0.5, rout: null }, 6, 4);
  const one = run('win', false, { a: 1, d: 1, rout: 'att', mated: true }, 2, 3);
  check('⭐ a defender who MATES the attacker takes half that marched prisoner, rounded up (6 troops, 5 go: 3 join the 2 left)',
        mated.to === 5 && mated.t.taken === 3 && mated.t.stand === 2 && mated.from === 1 && mated.own === 't' &&
        one.to === 4 && one.t.taken === 1, 'mated ' + mated.to + ' (taken ' + mated.t.taken + ') · one went ' + one.t.taken);
  check('…a flag, a draw or a withdrawal takes none', flagged.to === 2 && !flagged.t.taken && left.to === 4);
  const words = slice('function finish(how)', 'function lightMate');
  check('…the card says ROUTED! when the attacker is the one mated, and only then (never the withdrawal `gone` also counts)',
        /var routed = \(how === 'won-mate' \? 'b' : how === 'lost-mate' \? 'w' : ''\) === aCol;/.test(words) &&
        /mated: routed/.test(words) && /if \(routed\) \{ word = 'ROUTED!'; cls = 'routed'; \}/.test(words));
  check('…and says the prisoners: "2 of 4 still stand, and 3 prisoners join them"',
        / still stand, and 3 prisoners join them\./.test(camp.troopsLine({ to: 3 })) || (() => {
          run('win', false, { a: 0.6, d: 0.5, rout: 'att', mated: true }, 6, 4);
          return / still stand, and 3 prisoners join them\./.test(camp.troopsLine({ to: 3 }));
        })(), camp.troopsLine({ to: 3 }));
  camp.setSurvive(shipped);
  const b1 = new Array(64).fill(''), b2 = new Array(64).fill('');
  b1[60] = 'K'; b1[52] = 'P'; b2[60] = 'K'; b2[4] = 'Q';
  check('a promotion never makes troops: the share stops at all of them', camp.keptShare(b1, b2, 'w') === 1);
  check('the share is measured off the board the battle started and ended on (and a drop battle\'s hands)',
        /keptShare\(p\.board, B\.S\.b, aCol, B\.S\.hand\)/.test(slice('function finish(how)', 'function lightMate')) &&
        /line \+ troopsLine\(p\)/.test(slice('function finish(how)', 'function lightMate')),
        'and the verdict says how many marched');
}

/* == 12. MAXWELL COMMANDS RED (his 11-10, #2) ======================================
   The page's whole script in a vm (tests/campaign-vm.js): what he notices, what he says, and what Hard does with it.
   ⭐ His words are one table and HIS; this proves the table is shippable and that nothing he can say has no words. */
{
  const camp = require(path.join(ROOT, 'tests/campaign-vm.js')).load();
  const LINES = camp.MAXWELL_LINES;
  const TOKENS = { record: ['won', 'lost'], habit_open: ['from'], habit_thin: ['at'], declare: ['from', 'to'],
    took: ['to'], lost: ['to'], held: ['to'], repelled: ['to'], breach_his: ['to'], breach_yours: ['to'],
    war: ['holdings', 'generals'], opening: ['from', 'to'] };
  /* ⚠ THE WORDS ARE JOINED HERE, NOT WRITTEN: the house spelling gate reads every source file, this one included */
  const UK = new RegExp('\\b(' + ['colo.ur', 'favo.ur', 'hono.ur', 'behavio.ur', 'reali.s', 'organi.s', 'cent.re', 'defen.ce',
    'offen.ce', 'whil.st'].map((w) => w.replace('.', '')).join('|') + ')', 'i');
  const bad = [];
  Object.keys(LINES).forEach((k) => LINES[k].forEach((s) => {
    const toks = (s.match(/\{(\w+)\}/g) || []).map((t) => t.slice(1, -1));
    if (!/[.?!]["”]?$/.test(s) || s.length > 220 || toks.some((t) => (TOKENS[k] || []).indexOf(t) < 0) ||
        UK.test(s)) bad.push(k + ': ' + s);
  }));
  check('⭐ his lines are shippable: a sentence each, short, American, and only the names the game hands them',
        bad.length === 0 && Object.keys(LINES).length >= 16, bad.join(' · ') || Object.keys(LINES).length + ' kinds');
  const said = new Set();
  for (const m of src.matchAll(/(?:speak|lineFor)\((?:[^()]*\?\s*)?'(\w+)'(?:\s*:\s*'(\w+)')?/g)) {
    [m[1], m[2]].forEach((k) => { if (k && !/_$/.test(k)) said.add(k); });
  }
  /* the first campaign speaks 'teach_' + a step: every step has words too */
  camp.LESSON_STEPS.forEach((s) => said.add('teach_' + s));
  for (const m of src.matchAll(/k:'(\w+)'/g)) said.add(m[1]);
  ['open', 'record', 'habit_open', 'habit_keep', 'habit_thin', 'habit_nofort', 'win', 'lose'].forEach((k) => said.add(k));
  const mute = [...said].filter((k) => !LINES[k] || !LINES[k].length);
  check('…and every kind he can say has words', mute.length === 0 && said.size >= 16, mute.join(', ') || said.size + ' kinds');
  const obs = camp.observeFile({ v: 1, games: 3, won: 1, lost: 2, open: { 5: 3 }, keep: 2, thin: {}, turns: 12, forts: 6 });
  check('what he has noticed comes first, and his record with you last',
        obs[0].kind === 'habit_open' && obs[0].data.from === 'Chess City' && obs.some((o) => o.kind === 'habit_keep') &&
        obs[obs.length - 1].kind === 'record' && camp.observeFile(null).length === 0,
        obs.map((o) => o.kind).join(' > '));
  /* ⭐ HARD PLAYS AGAINST YOUR HABITS: you always open from Chess City, so his first troops face it */
  /* ⚠ ON THE OPENING MAP, ALWAYS: a Daily deals its own, and a dealt start can hand him the holding you open from */
  const plan = (mode, diff, habits) => {
    camp.newCampaign(diff, mode, { fog: true, cards: false });
    const G2 = camp.G; G2.mode = mode; G2.habits = habits;
    G2.own = camp.START_OWN.slice(); G2.ranks = camp.START_RANKS.slice(); G2.walls = camp.START_WALLS.slice();
    return camp.seeded('maxwell-check', () => camp.rivalPlan('t'));
  };
  /* you always open from Pirc Pass (9): Sea-Board (4) and Long Park (6) face it, and his usual first troop is elsewhere */
  const hab = { open: 9, keep: false, thin: -1 };
  const hard = plan('solo', 'hard', hab), usual = plan('solo', 'hard', null);
  check('⭐ on Hard he meets where you always open: his first troops go to the holdings facing it',
        hard.deploy.join() === '4,6' && usual.deploy[0] !== 4, 'deploy ' + hard.deploy.join(',') + ' · without his file ' + usual.deploy.join(','));
  check('⚠ his file never reaches a Daily, or Easy or Medium: the same seed plays the same plan without it',
        JSON.stringify(plan('daily', 'hard', hab)) === JSON.stringify(plan('daily', 'hard', null)) &&
        JSON.stringify(plan('solo', 'medium', hab)) === JSON.stringify(plan('solo', 'medium', null)),
        'a Daily is the same game for everybody');
  camp.newCampaign('medium', 'solo', { fog: true, cards: false });
  camp.store['pjcc.campaign.file.v1'] = undefined; delete camp.store['pjcc.campaign.file.v1'];
  camp.G.log.first = [5, 3]; camp.G.log.keep = true;
  camp.fileCampaign(true);
  const filed = JSON.parse(camp.store['pjcc.campaign.file.v1'] || 'null');
  camp.newCampaign('medium', 'two', { fog: true, cards: false });
  camp.fileCampaign(false);
  const filed2 = JSON.parse(camp.store['pjcc.campaign.file.v1'] || 'null');
  check('a campaign goes into his file when it ends, and a two-player game never does',
        filed && filed.games === 1 && filed.won === 1 && filed.open['5'] === 1 && filed.keep === 1 && filed2.games === 1,
        JSON.stringify(filed));
  /* a war of three or four (11-10): whoever holds the other end sits there; Red's is Maxwell */
  check('he sits across every battle against Red, and nobody sits between two players',
        /seat: function \(\) \{ var g = B && !B\.two \? generalOf\(B\.foeSide\) : null; return g \? \{ who: g\.who, key: g\.key \} : null; \}/.test(src) &&
        camp.generalOf('t').who === 'Maxwell' && camp.generalOf('t').key === camp.RIVAL.key);
}

/* == 13. YOUR DOG MARCHES WITH YOU (his 11-10, #4) =================================
   His gift is the map's, never a battle's: the same law the walls and the cards live under. */
{
  const camp = require(path.join(ROOT, 'tests/campaign-vm.js')).load();
  const fresh = (dogId, dog) => {
    camp.newCampaign('medium', 'solo', { fog: true, cards: false });
    const G2 = camp.G; G2.dogId = dogId; G2.dog = dog; return G2;
  };
  /* Chess City (5, yours, 4) attacks Checker Town (3, theirs, 4) */
  let G2 = fresh('milo', 5);
  camp.resolveLand({ from: 5, to: 3, playerAttacks: true, aRanks: 4, dRanks: 4 }, false, { a: 0.5, d: 0.5, rout: 'att' });
  check('⭐ Milo brings a troop home when an attack from his holding fails',
        G2.ranks[5] === 2 && G2.troops.fetched === 'Milo' && /Milo brings one more home/.test(camp.troopsLine({ to: 3 })),
        'Chess City ' + G2.ranks[5] + ' · ' + camp.troopsLine({ to: 3 }).trim());
  G2 = fresh('milo', 5);
  camp.resolveLand({ from: 5, to: 3, playerAttacks: true, aRanks: 4, dRanks: 4 }, true, { a: 1, d: 0, rout: 'def' });
  const marched = G2.dog;
  G2 = fresh('argus', 5);
  camp.resolveLand({ from: 3, to: 5, playerAttacks: false, aRanks: 6, dRanks: 4 }, true, { a: 1, d: 0, rout: 'def' });
  check('your dog marches in with a win from his holding, and falls back to yours beside it when his holding falls',
        marched === 3 && G2.own[5] === 't' && G2.own[G2.dog] === 'm' && camp.nbrs(5).indexOf(G2.dog) >= 0,
        'won into ' + marched + ' · fell back to ' + G2.dog);
  /* the opening's one hidden holding is The Fork (1), behind Checker Town (3); Chess City (5) borders Checker Town */
  G2 = fresh('argus', 5);
  G2.phase = 'deploy';
  const fogged = camp.LAND.map((L) => L.id).filter((id) => camp.fogged(id));
  const sniffs = camp.LAND.map((L) => L.id).filter((id) => camp.sniffable(id));
  G2.dog = 7;                                   // Shogi Island: nothing hidden one step past its border
  const fromShogi = camp.LAND.map((L) => L.id).filter((id) => camp.sniffable(id));
  check('⭐ Argus sniffs out a hidden holding one step past his border, and nothing further',
        fogged.indexOf(1) >= 0 && sniffs.join() === '1' && fromShogi.length === 0,
        'hidden ' + fogged.join(',') + ' · from Chess City ' + sniffs.join(',') + ' · from Shogi Island ' + (fromShogi.join(',') || 'none'));
  G2.dog = 5; G2.sniffed = true;
  check('…and only once a round', !camp.LAND.some((L) => camp.sniffable(L.id)));
  check('⚠⚠ a dog never touches a battle — not the muster, not the dice',
        !/dog|perk|sniff|fetch/i.test(slice('function musterBattle(', 'function beginBattle(')),
        'the 40-60% band was measured without one');
  check('a Daily with a dog keeps its own record', camp.variantOf('medium', true, true, 'argus') === 'medium-argus' &&
        camp.variantOf('medium', true, true, '') === 'medium', 'honest score slugs');
  G2 = fresh('milo', 5); G2.mode = 'two';
  camp.resolveLand({ from: 5, to: 3, playerAttacks: true, aRanks: 4, dRanks: 4 }, false, { a: 0.5, d: 0.5, rout: 'att' });
  check('two players bring no dogs', G2.ranks[5] === 1 && !G2.troops.fetched);
}

/* == 14. A FIRST CAMPAIGN THAT TEACHES (his 11-10, #5) =============================
   Five holdings, Maxwell teaching one rule at a time, on the same rules: the map is swapped, nothing re-implemented. */
{
  const camp = require(path.join(ROOT, 'tests/campaign-vm.js')).load();
  const F = camp.FIRST_MAP, S0 = camp.FIRST_START;
  camp.useMap(F);
  const reach = new Set([0]), stack2 = [0];
  while (stack2.length) { const n = stack2.pop(); camp.nbrs(n).forEach((j) => { if (!reach.has(j)) { reach.add(j); stack2.push(j); } }); }
  const own0 = S0.own.slice(), took = S0.own.slice(); took[2] = 'm';
  check('⭐ the first campaign is five holdings, all joined, his keep walled',
        F.land.length === 5 && reach.size === 5 && S0.walls.join() === '0' && own0.filter((o) => o === 'm').length === 2,
        F.land.map((L) => L.nm).join(', '));
  check('…its first battle has no chain in it, and the holding it takes is chained: the lesson the map is built for',
        !camp.chained(own0, 2) && camp.chained(took, 2), 'Checker Town ' + camp.nbrs(2).map((j) => F.land[j].nm).join(' · '));
  camp.newCampaign('easy', 'first', { fog: false, cards: false });
  const G3 = camp.G;
  G3.own[2] = 'm'; G3.ranks[2] = 4;
  const r1 = camp.firstPlan();
  G3.round = 2;
  const r2 = camp.firstPlan();
  check('he attacks once, in its first round, on the chained holding, and after that he holds',
        r1.attacks.length === 1 && r1.attacks[0].from === 0 && r1.attacks[0].to === 2 && r2.attacks.length === 0 &&
        r1.deploy.every((id) => id === 0), JSON.stringify(r1));
  G3.log.first = [3, 2];
  delete camp.store['pjcc.campaign.file.v1'];
  camp.fileCampaign(true);
  check('the first campaign never goes into his file', !camp.store['pjcc.campaign.file.v1']);
  camp.useMap(camp.MAIN_MAP);
  check('…and the ten come back after it, borders and all',
        camp.nbrs(3).slice().sort().join() === '0,1,2,5,6' && camp.mapFor('solo') === camp.MAIN_MAP,
        'Checker Town ' + camp.nbrs(3).slice().sort().join(','));
}

/* == 15. A WAR OF THREE OR FOUR (his 11-10, #10) ===================================
   Fifteen holdings for three, sixteen for four, each seat the same sector turned; two machines' battle decided at once at
   odds sim:clash measured; hold ten and it is yours. */
{
  const camp = require(path.join(ROOT, 'tests/campaign-vm.js')).load();
  [['three', camp.WAR3_MAP, 5], ['four', camp.WAR4_MAP, 4]].forEach(([mode, M, k]) => {
    const S0 = camp.WAR_START[mode], n = M.land.length, sides = S0.sides.length;
    const has = new Set(M.edges.map((e) => Math.min(e[0], e[1]) + '-' + Math.max(e[0], e[1])));
    /* ⭐ THE SAME SECTOR TURNED: every border, moved a seat round the table, is a border; every seat the same troops */
    const turned = M.edges.every((e) => { const a = (e[0] + k) % n, b = (e[1] + k) % n; return has.has(Math.min(a, b) + '-' + Math.max(a, b)); });
    const fair = S0.sides.every((s, i) => S0.own.slice(i * k, i * k + k).every((o) => o === s) &&
      S0.ranks.slice(i * k, i * k + k).join() === S0.ranks.slice(0, k).join() && S0.walls[i] === i * k);
    camp.useMap(M);
    const reach = new Set([0]), st = [0];
    while (st.length) { const x = st.pop(); camp.nbrs(x).forEach((j) => { if (!reach.has(j)) { reach.add(j); st.push(j); } }); }
    check('⭐ a war of ' + mode + ': ' + n + ' holdings, all joined, every seat the same sector turned, the same troops and a walled keep each',
          n === sides * k && reach.size === n && turned && fair && M.land.every((L) => L.nm.length >= 8 && L.nm.length <= 13),
          M.land.map((L) => L.nm).join(', '));
    camp.newCampaign('medium', mode, { fog: true, cards: false });
    const G = camp.G;
    check('…it deals ' + sides + ' seats, you first, and a machine passes to the next round the table',
          G.sides.join('') === S0.sides.join('') && camp.nextSide('t') === S0.sides[2] &&
          camp.nextSide(S0.sides[sides - 1]) === '' && Object.keys(G.seen).length === sides);
    camp.useMap(camp.MAIN_MAP);
  });
  /* the odds: never falling as the gap grows, a share in every bin, the ends open */
  const C = camp.CLASH;
  check('⭐ two machines\' battle is decided at odds that never fall as the material gap grows',
        C.p.every((p, i) => i === 0 || p >= C.p[i - 1]) && C.p.length === C.ka.length && C.p.length === C.kd.length &&
        C.p.concat(C.ka, C.kd).every((v) => v > 0 && v < 1) && camp.clashBin(-99) === 0 && camp.clashBin(99) === C.p.length - 1 &&
        camp.clashBin(C.lo) === 0 && camp.clashBin(C.lo + C.bin) === 1, C.p.join(' '));
  /* a clash is a muster (the page's dice, the same draws a played battle takes) and one draw more */
  camp.useMap(camp.WAR4_MAP);
  camp.newCampaign('medium', 'four', { fog: false, cards: false });
  let draws = 0, rows = [];
  camp.setRNG(() => { draws++; return 0.4; });
  const G = camp.G;
  G.ranks[7] = 6;
  const P = camp.clash(7, 11);
  const one = draws;
  draws = 0;
  camp.newCampaign('medium', 'four', { fog: false, cards: false });
  camp.G.ranks[7] = 6;
  camp.musterBattle(7, 11, true);
  check('…a clash is the muster a played battle would have, then one draw against the table',
        one === draws + 1 && P.clash === true && P.playerAttacks === false && typeof P.gap === 'number', one + ' draws vs ' + draws);
  camp.setRNG(null);
  /* the ground answers as a played battle's would: a won clash marches in at the measured share */
  let won = null;
  for (let i = 0; i < 40 && !won; i++) {
    camp.newCampaign('medium', 'four', { fog: false, cards: false });
    camp.G.ranks[7] = 8; camp.G.ranks[11] = 1;
    const Q = camp.clash(7, 11);
    if (Q.won) won = { Q, own: camp.G.own[11], ranks: camp.G.ranks[11], home: camp.G.ranks[7] };
    rows.push(Q.won);
  }
  check('…and a won clash takes the ground, its troops marching in at the share those battles kept',
        won && won.own === 't' && won.home === 1 && won.ranks >= 1 && won.ranks <= 7, JSON.stringify(won && { own: won.own, ranks: won.ranks }));
  /* hold ten */
  camp.newCampaign('medium', 'four', { fog: false, cards: false });
  /* hold ten: played on a war of four, ten yours, ten his, nine each */
  const deal = (mine, his) => { camp.newCampaign('medium', 'four', {}); const G4 = camp.G;
    G4.own = G4.own.map((o, i) => (i < mine ? 'm' : i < mine + his ? 'u' : 'v')); return camp.overFor(); };
  check('⭐ hold ten and the war is yours, and a general who does takes it (three or four)',
        camp.WAR_WIN.three === 10 && camp.WAR_WIN.four === 10 && deal(10, 3) === 'm' && deal(3, 10) === 't' && deal(9, 4) === '' &&
        deal(16, 0) === 'm' && deal(0, 9) === 't' && /var o = overFor\(\);/.test(slice('function campaignCheck()', 'function campaignOver')),
        [deal(10, 3), deal(3, 10), deal(9, 4)].join(','));
  /* the machine: everyone else is the foe, and a war's even choice is a coin toss (a war of two keeps its order) */
  const rv = slice('function rivalPlan(', 'function theirTurn');
  check('a machine\'s foe is everyone else, never one color', !/foe/.test(rv) && /G\.own\[to\] === side/.test(rv));
  check('…a war\'s even choice is a coin toss, and a war of two never draws for one',
        /k: war \? rand\(\) : 0/.test(rv) && /return b\.s - a\.s \|\| a\.k - b\.k;/.test(rv) && /var cand = \[\], war = multi\(\);/.test(rv));
  /* every general's word is shippable, as Maxwell's are */
  const bad = [];
  Object.keys(camp.GENERAL_LINES).forEach((w) => Object.keys(camp.GENERAL_LINES[w]).forEach((k) => camp.GENERAL_LINES[w][k].forEach((s) => {
    const may = ['{to}', '{from}'].concat(k === 'war' ? ['{holdings}', '{generals}'] : []);   // what the game hands them, as Maxwell's
    if (!/[.?!]["”]?$/.test(s) || s.length > 220 || (s.match(/\{(\w+)\}/g) || []).some((t) => may.indexOf(t) < 0)) bad.push(w + '.' + k + ': ' + s);
  })));
  check('the other generals\' words are shippable, and every general you can pick but Maxwell has a book of them (his 11-18)',
        bad.length === 0 && Object.keys(camp.GENERAL_LINES).every((w) => camp.FOES.some((f) => f.who === w && w !== camp.RIVAL.who)) &&
        camp.FOES.every((f) => f.who === camp.RIVAL.who || !!camp.GENERAL_LINES[f.who]),
        bad.join(' · ') || Object.keys(camp.GENERAL_LINES).join(', '));
  camp.useMap(camp.MAIN_MAP);
}

/* == 16. GENERALS FROM YOUR ASSEMBLY (his 11-10, #9) ================================
   One order a campaign from each square you have won, on the map, one a round; never a Daily, two players or the first. */
{
  const camp = require(path.join(ROOT, 'tests/campaign-vm.js')).load();
  const names = ['Matsu', 'Michael', 'Maxwell', 'Vince', 'Robert', 'Murphy', 'Kedar', 'Matsu', 'Nobody'];
  camp.newCampaign('medium', 'solo', { fog: true, cards: false });
  const solo = camp.musterGenerals(names);
  camp.useMap(camp.WAR4_MAP); camp.newCampaign('medium', 'four', { fog: true, cards: false });
  const four = camp.musterGenerals(names);
  camp.useMap(camp.MAIN_MAP);
  const none = ['daily', 'two', 'first'].map((m) => { if (m === 'first') camp.useMap(camp.FIRST_MAP); camp.newCampaign('easy', m, {}); const n = camp.musterGenerals(names).length; camp.useMap(camp.MAIN_MAP); return n; });
  check('⭐ your generals: the Assembly, less anyone across the table, anyone with no order, and nobody twice',
        solo.join() === 'Matsu,Michael,Vince,Robert,Murphy,Kedar' && four.join() === 'Matsu,Michael,Robert,Murphy,Kedar' &&
        none.every((n) => n === 0), solo.join() + ' / ' + four.join());
  check('every general has an order that exists and words to give it with',
        Object.keys(camp.GENERALS).every((n) => camp.ORDERS[camp.GENERALS[n]] && camp.GENERAL_SAY[n]) && !camp.GENERALS.Maxwell &&
        Object.keys(camp.GENERAL_SAY).every((n) => /[.?!]$/.test(camp.GENERAL_SAY[n])), Object.keys(camp.GENERALS).length + ' generals');
  /* each order does what it says, on the map */
  const fresh = (gens) => { camp.newCampaign('medium', 'solo', { fog: true, cards: false }); camp.G.gens = gens; camp.G.phase = 'attack'; return camp.G; };
  let G = fresh(['Matsu', 'Kedar']);
  const before = G.ranks[5];
  const okDrop = camp.giveOrder('Matsu', 5) && G.ranks[5] === before + 2;
  const twice = camp.giveOrder('Kedar');
  check('⭐ Reinforce puts two troops on your holding, and it is one order a round', okDrop && !twice && G.ordered);
  G = fresh(['Matsu']);
  check('…a targeted order needs a holding of yours', !camp.giveOrder('Matsu', 0) && !camp.giveOrder('Matsu') && camp.giveOrder('Matsu', 9));
  G = fresh(['Vince']); const a0 = G.atks;
  check('Forced March: one more attack this round', camp.giveOrder('Vince') && G.atks === a0 + 1);
  G = fresh(['Auston']);
  const hid = camp.LAND.filter((L) => camp.fogged(L.id)).length;
  camp.giveOrder('Auston');
  check('Lookout: no fog for you this round', hid > 0 && camp.LAND.every((L) => !camp.fogged(L.id)), hid + ' hidden before');
  G = fresh(['Seaboard Rep']);
  const far = camp.fortReach(5, 9);
  camp.giveOrder('Seaboard Rep');
  check('Long Roads: fortify along any chain of yours this round', !far && camp.fortReach(5, 9));
  G = fresh(['Michael']); G.own = ['m', 't', 't', 't', 't', 'm', 't', 't', 't', 't']; G.ranks = [3, 3, 3, 3, 3, 4, 3, 3, 3, 3];
  const dice0 = camp.musterBattle(3, 5, false).dChain;
  camp.giveOrder('Michael', 5);
  const dice1 = camp.musterBattle(3, 5, false);
  check('Hold Fast: your holding defends with the chain\'s die, and nothing else of the chain\'s', !dice0 && dice1.dChain === true &&
        !camp.chained(G.own, 5) && camp.chainCount(G.own, 'm') === 0);
  G = fresh(['Robert']); G.walls = [];
  camp.giveOrder('Robert', 7);
  check('Barricade: your holding is walled till your next turn, and pays no troop', camp.walled(7) && camp.sieged(7) && camp.wallsFor('m') === 0);
  G = fresh(['Murphy']); G.ranks[3] = 7; G.ranks[5] = 7;
  camp.giveOrder('Murphy');
  check('Sabotage: every enemy stack of six or more loses one, never yours', G.ranks[3] === 6 && G.ranks[5] === 7);
  G = fresh(['Princess']); G.ranks[7] = 1; G.ranks[8] = 1; G.ranks[3] = 1;
  camp.giveOrder('Princess');
  check('Shore Up: every holding of yours with one troop gains one', G.ranks[7] === 2 && G.ranks[8] === 2 && G.ranks[3] === 1);
  /* the turn they last: your next one */
  G = fresh(['Michael', 'Robert']); G.walls = [];
  camp.giveOrder('Michael', 5);
  const src = slice('function resetTurn()', 'function passTurn');
  check('⭐ an order lasts until your next turn, and a general gives his once a campaign',
        /G\.ordered = false; G\.orderArm = ''; G\.sight = false; G\.roads = false;/.test(src) &&
        /if \(G\.hold && G\.hold\.side === G\.side\) G\.hold = null;/.test(src) && /if \(G\.bar && G\.bar\.side === G\.side\) G\.bar = null;/.test(src) &&
        (G.ordered = false, !camp.canOrder('Michael')) && camp.canOrder('Robert'));
  G = fresh(['Matsu']); G.busy = true;
  const busy = camp.canOrder('Matsu');
  G.busy = false; G.phase = 'theirs';
  check('…and never in a battle or in their turn', !busy && !camp.canOrder('Matsu'));
}

/* == 17. THE WAR, REPLAYED (his 11-10, #7) ==========================================
   A turn keeps the map it left and the battles in it; a mate keeps its board; your best won war is the one framed. */
{
  const camp = require(path.join(ROOT, 'tests/campaign-vm.js')).load();
  camp.newCampaign('hard', 'solo', { fog: false, cards: false });
  const G = camp.G;
  G.started = true;
  camp.warBegin();
  const b = new Array(64).fill(''); b[4] = 'k'; b[12] = 'Q'; b[20] = 'K';
  camp.warNote({ from: 5, to: 3 }, 'm', true, false, b);
  camp.warNote({ from: 9, to: 4 }, 'm', false, false, null);
  camp.warTurn('m');
  camp.warTurn('t');
  G.round = 7;
  const w = camp.warEnd(true);
  const frames = camp.warFrames(w);
  check('⭐ a war keeps every turn\'s map and battles, and a mate its board, 64 letters',
        w.turns.length === 2 && w.turns[0].ev.length === 2 && w.turns[0].ev[0].mate.length === 64 && w.turns[0].ev[0].mate.charAt(4) === 'k' &&
        w.turns[0].ev[1].mate === '' && w.won === true && w.rounds === 7, JSON.stringify(w.turns[0].ev.map((e) => e.r)));
  check('…and plays back as the opening, a beat a turn, and a beat on each mate',
        frames.length === 4 && !!frames[2].mate && /took Checker Town; 1 attack failed\./.test(frames[1].say) && /fought no battles/.test(frames[3].say),
        frames.map((f) => f.say).join(' | '));
  const won = (diff, sides, rounds) => ({ won: true, diff, sides: new Array(sides).fill('x'), rounds, mode: 'solo', start: {}, turns: [] });
  check('⭐ the framed war is your best WON one: the harder level, then the more generals, then the fewer rounds',
        camp.betterWar(won('hard', 2, 20), won('medium', 4, 5)) && camp.betterWar(won('medium', 4, 20), won('medium', 2, 5)) &&
        camp.betterWar(won('medium', 2, 9), won('medium', 2, 10)) && !camp.betterWar(won('medium', 2, 10), won('medium', 2, 10)) &&
        !camp.betterWar(Object.assign(won('hard', 4, 3), { won: false }), null) && camp.betterWar(won('easy', 2, 30), null));
  delete camp.store[camp.BEST_KEY];
  const kept = camp.keepBest(w), daily = camp.keepBest(Object.assign({}, w, { mode: 'daily', diff: 'hard', rounds: 1 }));
  check('…kept from a campaign or a war, never a Daily, and read back whole', kept && !daily && camp.loadBest().rounds === 7 &&
        camp.loadBest().turns.length === 2);
}

/* == 18. PLACES THAT FIGHT THEIR OWN CHESS (his #8, 11-11: "Go with option B") ====================
   Endgame Flats: an endgame on half the points, no queen mustered, won by the first pawn to make one. Shogi Island: a take
   joins the taker's hand and drops back on an empty square. Keyed by name, on every map. */
{
  const camp = require(path.join(ROOT, 'tests/campaign-vm.js')).load();
  const C = camp.C;
  const at = (s) => (8 - +s[1]) * 8 + (s.charCodeAt(0) - 97);
  const empty = () => new Array(64).fill('');
  const rulesOn = (mode) => { camp.newCampaign('medium', mode, { fog: false, cards: false });
    return camp.LAND.map((L, i) => (camp.ruleAt(i) ? L.nm + ':' + camp.ruleAt(i) : '')).filter(Boolean).sort().join(); };
  const solo = rulesOn('solo'), three = rulesOn('three'), four = rulesOn('four'), first = rulesOn('first');
  camp.useMap(camp.mapFor('solo'));
  check('⭐ Shogi Island drops, Endgame Flats fight an endgame, Sea-Board at sea and the Sand Mines in the dark, on the map of ten and on both war maps (keyed by name)',
        solo === 'Endgame Flats:endgame,Sand Mines:dark,Sea-Board:pieces,Shogi Island:drops' && three === solo && four === solo, [solo, three, four].join(' | '));
  check('…and the first campaign teaches the plain rules: nothing on its map, though the Sand Mines are on it', first === '' &&
        camp.FIRST_MAP.land.some((L) => L.nm === 'Sand Mines'), first);
  const keepCaps = { q: 1, r: 2, b: 2, n: 2, p: 8 };
  check('⭐ the Sand Mines\' dark is the picture\'s alone (his: "more decorative than functional"): the plain muster and the plain odds',
        camp.capsOn('dark', Object.assign({}, keepCaps)).p === 8 && camp.capsOn('dark', Object.assign({}, keepCaps)).q === 1 &&
        camp.CLASHES.dark === undefined && !/rule === 'dark'/.test(slice('function musterBattle(', 'function beginBattle(')));
  const dk = slice('var DARK = {', 'function goLive(');
  const DK = JSON.parse(dk.slice(dk.indexOf('{'), dk.indexOf('}') + 1).replace(/(\w+):/g, '"$1":'));
  check('…subtle and slow, never a flicker: a fade in of 300 ms or more, out of 600 or more, held a second at most, seven seconds apart at least, never past 60% dark',
        DK.rise >= 300 && DK.fall >= 600 && DK.hold <= 1000 && DK.every[0] >= 7000 && DK.first[0] >= 3000 && DK.lamp <= 0.6 && DK.dust <= 0.6, JSON.stringify(DK));
  check('…and off with reduced motion, in the code and in the stylesheet',
        /prefers-reduced-motion: reduce/.test(slice('function darkOn(', 'function murkEl(')) &&
        /@media \(prefers-reduced-motion: reduce\) \{ \.murk \{ display: none; \} \}/.test(slice('<style>', '</style>')));

  camp.newCampaign('medium', 'solo', { fog: false, cards: false });
  const G = camp.G;
  let queens = 0, over = 0, plain = 0, buds = [];
  for (let i = 0; i < 200; i++) {
    G.own[5] = 'm'; G.own[8] = 't'; G.ranks[5] = 2 + (i % 8); G.ranks[8] = 1 + (i % 9);
    const P = camp.musterBattle(5, 8, true);
    const n = (a, k) => a.filter((x) => x === k).length;
    queens += n(P.aArmy, 'q') + n(P.dArmy, 'q');
    [P.aArmy, P.dArmy].forEach((a) => { if (n(a, 'r') > 1 || n(a, 'b') > 1 || n(a, 'n') > 1 || n(a, 'p') > 6) over++; });
    if (P.rule !== 'endgame') plain++;
    buds.push(P.aBud);
  }
  check('⭐ the Flats muster an endgame: no queen in 200 battles, a rook, a bishop and a knight at most a side, six pawns',
        queens === 0 && over === 0 && plain === 0 && Math.max(...buds) <= camp.egBudget(15 + 4 + camp.ATT_EDGE), 'queens ' + queens + ', over ' + over + ', top budget ' + Math.max(...buds));
  check('…on three tenths of the points the dice give, a pawn at least (0.3 since 11-18, measured at his fifteen each)', camp.egBudget(20) === 6 && camp.egBudget(1) === 1);
  let even = 0;
  for (let i = 0; i < 60; i++) {
    G.own[5] = 'm'; G.own[8] = 't'; G.ranks[5] = 2 + (i % 8); G.ranks[8] = 1 + (i % 7);
    const P = camp.musterBattle(5, 8, true);
    if (P.clocks.att === camp.CLOCK_ATT && P.clocks.def === camp.CLOCK_DEF) even++;
  }
  check('…and every battle mustered there runs on fifteen each', even === 60, even + ' of 60');
  let seaPawns = 0, seaPlain = 0, seaPieces = 0;
  for (let i = 0; i < 200; i++) {
    G.own[9] = 'm'; G.own[4] = 't'; G.ranks[9] = 2 + (i % 8); G.ranks[4] = 1 + (i % 9);
    const P = camp.musterBattle(9, 4, true);
    seaPawns += P.aArmy.concat(P.dArmy).filter((x) => x === 'p').length + P.board.filter((x) => x === 'P' || x === 'p').length;
    seaPieces += P.aArmy.length;
    if (P.rule !== 'pieces') seaPlain++;
  }
  check('⭐ Sea-Board is fought at sea: not one pawn in 200 armies or on their boards, the dice buying only pieces (his pick, 11-11)',
        seaPawns === 0 && seaPlain === 0 && seaPieces > 200, 'pawns ' + seaPawns + ', attacking pieces ' + seaPieces);
  check('…and the roll screen says so, in both chairs, instead of mourning pawns that were never mustered',
        (slice('function posVerdict(', 'function boardCells(').match(/AT SEA/g) || []).length === 2 &&
        /'no pawns at sea'/.test(slice('function posVerdict(', 'function boardCells(')));

  /* a take, and the drop it buys */
  let b = empty(); b[at('e1')] = 'K'; b[at('d1')] = 'R'; b[at('e8')] = 'k'; b[at('d4')] = 'n';
  let S = camp.battleState({ board: b, attWhite: true, rule: 'drops' });
  check('…a battle for the Island has a hand each side; one for the Flats has none, and knows it is the Flats',
        !!S.hand && !S.eg && !camp.battleState({ board: b, attWhite: true, rule: 'endgame' }).hand && camp.battleState({ board: b, attWhite: true, rule: 'endgame' }).eg === true);
  S = camp.bMake(S, C.legalMoves(S).find((m) => m.from === at('d1') && m.to === at('d4')));
  check('⭐ on Shogi Island a take joins the taker\'s hand as what it was', S.hand.w.n === 1 && S.b[at('d4')] === 'R' && camp.handValue(S.hand.w) === 3);
  check('…a side with nothing in hand has nothing to drop', camp.dropsOf(S, false).length === 0);
  S = camp.bMake(S, C.legalMoves(S).find((m) => m.from === at('e8') && m.to === at('f8')));
  const dr = camp.dropsOf(S, false);
  check('…and on its turn the knight goes down on any empty square, and only an empty one',
        dr.length === 61 && dr.every((m) => !S.b[m.to] && m.drop === 'n' && m.from === -1), dr.length);
  S.hand.w.p = 1;
  const pd = camp.dropsOf(S, false).filter((m) => m.drop === 'p');
  check('…never a pawn on the first rank or the last', pd.length === 47 && pd.every((m) => m.to >= 8 && m.to < 56), pd.length);
  check('…and a piece in hand is still the army\'s: its points, the troops that march, and no draw on the flag',
        camp.material(S.b, 'w', S.hand) === 5 + 3 + 1 && camp.keptShare(S.b, S.b, 'w', S.hand) === 1 && !camp.loneKing(empty(), 'w', S.hand));

  /* a promoted man goes home a pawn, as in shogi */
  b = empty(); b[at('e1')] = 'K'; b[at('a7')] = 'P'; b[at('b8')] = 'r'; b[at('c7')] = 'k';
  S = camp.battleState({ board: b, attWhite: true, rule: 'drops' });
  S = camp.bMake(S, C.legalMoves(S).find((m) => m.from === at('a7') && m.to === at('b8') && m.promo === 'Q'));
  const prom = S.hand.w.r === 1 && !!S.pr[at('b8')];
  S = camp.bMake(S, C.legalMoves(S).find((m) => m.from === at('c7') && m.to === at('b8')));
  check('⭐ a promoted man, taken, goes to the hand a pawn', prom && S.hand.b.p === 1 && S.hand.b.q === 0 && !S.pr[at('b8')], JSON.stringify(S.hand.b));

  /* a check a drop can block is not mate; a drop that mates is */
  b = empty(); b[at('h8')] = 'k'; b[at('g7')] = 'p'; b[at('h7')] = 'p'; b[at('e1')] = 'K'; b[at('a8')] = 'R';
  S = camp.battleState({ board: b, attWhite: false, rule: 'drops' });
  S.hand.b.n = 1;
  const blocks = camp.dropsOf(S, true).map((m) => m.to);
  check('⭐⭐ a check a drop can block is not mate (the referee alone calls it one), and only a block may be dropped',
        C.gameResult(S) === 'checkmate' && camp.bResult(S) === null && blocks.join() === '1,2,3,4,5,6', blocks.join());
  b = empty(); b[at('h8')] = 'k'; b[at('g7')] = 'p'; b[at('h7')] = 'p'; b[at('e1')] = 'K';
  S = camp.battleState({ board: b, attWhite: true, rule: 'drops' });
  S.hand.w.r = 1;
  const mate = camp.bMake(S, { from: -1, to: at('a8'), drop: 'r' });
  const pick = camp.bestMove(S, 1e9, 2, 0, 0);
  check('…a drop that mates is mate, and the machine finds it', camp.bResult(mate) === 'checkmate' && pick && pick.mv.drop === 'r' && pick.mv.to <= 5,
        JSON.stringify(pick && pick.mv));

  /* the Flats' race */
  b = empty(); b[at('e1')] = 'K'; b[at('a7')] = 'P'; b[at('h5')] = 'k';
  S = camp.battleState({ board: b, attWhite: true, rule: 'endgame' });
  const q = camp.bMake(S, C.legalMoves(S).find((m) => m.from === at('a7') && m.to === at('a8') && m.promo === 'Q'));
  const r = camp.bMake(S, C.legalMoves(S).find((m) => m.from === at('a7') && m.to === at('a8') && m.promo === 'R'));
  const pk = camp.bestMove(S, 1e9, 2, 0, 0);
  check('⭐⭐ on the Flats the first pawn to make a queen wins the battle (a rook does not)',
        camp.bResult(S) === null && q.eg && camp.bResult(q) === 'queen-w' && camp.bResult(r) === null);
  check('…and the machine runs that race: it queens when it can', pk && pk.mv.from === at('a7') && pk.mv.promo === 'Q', JSON.stringify(pk && pk.mv));

  /* two machines meeting on a rule's ground: that rule's measured odds */
  const odds = (rule, p) => {
    const T = camp.CLASHES[rule], keep = T.p.slice();
    T.p = T.p.map(() => p);
    camp.newCampaign('medium', 'solo', { fog: false, cards: false });
    camp.G.own[5] = 'm'; camp.G.own[9] = 'm'; camp.G.own[7] = 't'; camp.G.own[8] = 't'; camp.G.own[4] = 't';
    camp.G.ranks[5] = 6; camp.G.ranks[9] = 6;
    const won = rule === 'pieces' ? camp.clash(9, 4).won : camp.clash(5, rule === 'drops' ? 7 : 8).won;
    T.p = keep;
    return won;
  };
  check('⭐ two machines on a rule\'s ground are decided at that rule\'s measured odds',
        ['drops', 'endgame', 'pieces'].every((r) => odds(r, 1) === true && odds(r, 0) === false && camp.CLASHES[r].p.length === 12));
  const how = slice('<section class="screen" id="screen-how">', '</section>');
  check('…and the page says so: the how-to, the roll screen\'s chip, the map\'s tag and the battle\'s first line',
        /Endgame Flats, Shogi Island and Sea-Board<\/b> fight their own chess/.test(how) && /the first pawn to make a queen wins/.test(how) &&
        /no pawns, only pieces/.test(how) &&
        /RULE_SAY\[PEND\.rule\]\.chip/.test(slice('function beginBattle(', 'function sandThrow(')) &&
        /<span class="rtag">/.test(slice('function drawMap(', 'function tapLand(')) && /RULE_SAY\[B\.rule\]\.say/.test(slice('function startBattle(', 'function loneKing(')));
}

/* ══ 19. THE SEA LANE (his 11-16, #7) ══ a front across the water, once a round, and never a road */
{
  const camp = require(path.join(ROOT, 'tests/campaign-vm.js')).load();
  camp.newCampaign('hard', 'solo', { fog: true, cards: false });
  const G = camp.G;
  check('⭐ one sea lane, Sea-Board to Shogi Island, and each still has exactly its two roads (his rule)',
    JSON.stringify(camp.LANES) === '[[4,7]]' && camp.nbrs(4).length === 2 && camp.nbrs(7).length === 2 && !camp.adj(4, 7));
  check('…either strikes the other across the water, once a round',
    camp.strikeOf(7, 4) === 'sea' && camp.strikeOf(4, 7) === 'sea' && camp.strikeOf(7, 5) === 'road' && camp.strikeOf(5, 4) === '' &&
    (G.sailed = true, camp.strikeOf(7, 4) === 'sailed' && camp.strikeOf(7, 5) === 'road'));
  G.sailed = false;
  /* never a road: troops do not fortify over it, and it does not chain */
  G.own[4] = 'm'; G.own[5] = 'm'; G.own[8] = 't';
  check('…but troops never move by sea, and it never chains',
    !camp.fortReach(7, 4) && camp.fortReach(7, 5) && !camp.chained(G.own, 7));
  camp.newCampaign('hard', 'solo', { fog: true, cards: false });
  /* the machine: a crossing when it is worth one, never two in a turn, never half a siege */
  let plans = 0, crossings = 0, twice = 0, halfSiege = 0;
  for (let i = 0; i < 1500; i++) {
    const g = camp.G;
    g.own = camp.START_OWN.slice(); g.ranks = g.ranks.map(() => 1 + Math.floor(Math.random() * 8));
    g.walls = i % 3 === 0 ? [4, 7] : camp.START_WALLS.slice(); g.down = [];
    ['t', 'm'].forEach((side) => {
      const sea = camp.rivalPlan(side).attacks.filter((a) => !camp.adj(a.from, a.to));
      plans++; crossings += sea.length ? 1 : 0;
      if (sea.length > 1) twice++;
      if (sea.some((a) => camp.sieged(a.to))) halfSiege++;
    });
  }
  check('…the machine crosses when it is worth it, never twice in a turn, and never into walls it cannot follow up',
    crossings > 50 && twice === 0 && halfSiege === 0, crossings + ' of ' + plans + ' plans cross · twice ' + twice + ' · into walls ' + halfSiege);
  camp.useMap(camp.mapFor('three')); const w3 = camp.LANES.length;
  camp.useMap(camp.mapFor('first')); const f1 = camp.LANES.length;
  camp.useMap(camp.MAIN_MAP);
  check('…the campaign\'s map only: a war and the first campaign keep their roads', w3 === 0 && f1 === 0 && camp.LANES.length === 1);
  const page = fs.readFileSync(path.join(ROOT, 'assets/games/pjcc_marchland.html'), 'utf8');
  check('…the save carries the spent crossing, and a turn opens the water again',
    /sailed:!!G\.sailed/.test(page) && /sailed:!!o\.sailed/.test(page) && /G\.sailed = false;/.test(slice('function resetTurn(', 'function passTurn(')));
}

/* ══ 20. THE GENERALS PLAY THEIR OWN WAY (his 11-16, #5) ══ on top of the level, and they say so */
{
  const camp = require(path.join(ROOT, 'tests/campaign-vm.js')).load();
  check('⭐ Maxwell takes openings, Vince rushes, Wes digs in; Green plays plain',
    camp.styleOf('t') === 'openings' && camp.styleOf('u') === 'rush' && camp.styleOf('v') === 'dig' && camp.styleOf('m') === '');
  camp.useMap(camp.mapFor('four'));
  const stats = { t: { n: 0, atk: 0, how: {} }, u: { n: 0, atk: 0, how: {} }, v: { n: 0, atk: 0, how: {}, dug: 0 } };
  let stackOk = true, guardOk = true, edgeOk = true, capOk = true;
  for (let i = 0; i < 600; i++) {
    camp.newCampaign('medium', 'four', { fog: false, cards: false });
    const G = camp.G;
    G.ranks = G.ranks.map(() => 1 + Math.floor(Math.random() * 7));
    ['t', 'u', 'v'].forEach((side) => {
      const rk = G.ranks.slice(), p = camp.rivalPlan(side), S = stats[side];
      S.n++; S.atk += p.attacks.length; if (p.dug) S.dug++;
      p.attacks.forEach((a) => { S.how[a.how || 'plain'] = (S.how[a.how || 'plain'] || 0) + 1; });
      const front = camp.idsOf(side).filter((id) => camp.fronts(id).some((j) => G.own[j] !== side));
      if (!front.length || p.deploy.length < 2) return;
      if (side === 'u' && p.deploy[0] !== p.deploy[1]) stackOk = false;     // his first two go where he attacks from
      if (side === 'v') {                                                  // his first goes where he is most threatened
        const worst = Math.max(...front.map((id) => camp.threatOf(id, rk, side)));
        if (camp.threatOf(p.deploy[0], rk, side) !== worst) guardOk = false;
        if (p.attacks.length > 1) capOk = false;                           // Medium's two, less one
        if (p.attacks.some((a) => a.how === 'rush')) edgeOk = false;
      }
      if (side === 't' && p.attacks.some((a) => a.how === 'rush')) edgeOk = false;
    });
  }
  const T = stats.t, U = stats.u, V = stats.v;
  /* the same positions, Maxwell styled and plain: the openings he takes are his, not the level's */
  camp.useMap(camp.MAIN_MAP);
  let styled = 0, plainly = 0, tagged = 0;
  for (let i = 0; i < 1200; i++) {
    camp.newCampaign('medium', 'solo', { fog: false, cards: false });
    const G = camp.G;
    G.ranks = G.ranks.map(() => 1 + Math.floor(Math.random() * 5));
    for (let k = 0; k < 10; k++) if (Math.random() < 0.3) G.own[k] = G.own[k] === 'm' ? 't' : 'm';
    const st = JSON.stringify({ own: G.own, ranks: G.ranks }), ones = (p) => p.attacks.filter((a) => camp.cutOff(a.to)).length;
    const sp = camp.rivalPlan('t');
    styled += ones(sp); tagged += sp.attacks.filter((a) => a.how === 'opening').length;
    Object.assign(G, JSON.parse(st)); const kept = camp.STYLE_OF; camp.setStyleOf({});
    plainly += ones(camp.rivalPlan('t'));
    camp.setStyleOf(kept);
  }
  check('…Maxwell goes for a holding cut off from its own side far more than the level alone would, and says so (opening)',
    tagged > 100 && styled > plainly * 1.3, 'cut-off targets ' + styled + ' styled, ' + plainly + ' plain · said ' + tagged + ' times');
  check('…Vince marches at worse odds than the level would (rush), and stacks his first two troops together',
    (U.how.rush || 0) > 30 && stackOk, JSON.stringify(U.how) + (stackOk ? '' : ' · split his first two'));
  check('…Wes attacks less, once a turn on Medium, reinforces his worst front first, and passes up what Medium would take (dug)',
    V.atk / V.n < U.atk / U.n && V.atk / V.n < T.atk / T.n && capOk && guardOk && edgeOk && V.dug > 30,
    'attacks a plan: Maxwell ' + (T.atk / T.n).toFixed(2) + ' · Vince ' + (U.atk / U.n).toFixed(2) + ' · Wes ' + (V.atk / V.n).toFixed(2) + ' · dug ' + V.dug);
  check('…and each has his words for it, his to write (a style with no line falls back to the plain one)',
    camp.hasLine('opening', 'Maxwell') && camp.hasLine('rush', 'Vince') && camp.hasLine('dig', 'Wes') && !camp.hasLine('rush', 'Wes'));
  const page = fs.readFileSync(path.join(ROOT, 'assets/games/pjcc_marchland.html'), 'utf8');
  check('…said where his way shows: the turn line when he digs in, the declare when he comes for you',
    /k: plan\.dug && hasLine\('dig', generalOf\(side\)\.who\) \? 'dig' : 'turn'/.test(page) &&
    /s\.how && hasLine\(s\.how, generalOf\(who\)\.who\) \? s\.how : 'declare'/.test(page) &&
    /Maxwell goes for holdings cut off from the rest, Vince rushes, Wes\s+digs in/.test(page));
}

/* ══ 21. SCENARIOS WITH STARS (his 11-16, #2) ══ set pieces, the same for everyone, a checklist read at the end */
{
  const camp = require(path.join(ROOT, 'tests/campaign-vm.js')).load();
  const dealt = camp.SCENARIOS.map((sc) => {
    camp.useMap(camp.MAIN_MAP);
    camp.newCampaign('hard', 'scenario', { scen: sc.id, fog: true, cards: true });
    const G = camp.G;
    return G.diff === sc.level && G.fog === false && G.cards === false && G.card === null && G.scen === sc.id &&
      JSON.stringify(G.own) === JSON.stringify(sc.own || camp.START_OWN) && JSON.stringify(G.scenStart) === JSON.stringify(G.own) &&
      G.scenStart !== G.own && G.scenTook === 0;
  });
  check('⭐ four scenarios, each dealt as written: its own map, its own level, no fog and no cards whatever the options say',
    camp.SCENARIOS.length === 4 && dealt.every(Boolean), camp.SCENARIOS.map((s) => s.nm).join(' · '));
  const ls = camp.scenOf('last-stand'), bz = camp.scenOf('blitz'), st0 = ls.own.slice();
  const lost = (o, i, to) => { const x = o.slice(); x[i] = to; return x; };
  check('…a stand: the keep held is one star, Chess City too is two, losing nothing is three; the keep lost is none',
    camp.scenStars(ls, st0, 0, st0) === 3 && camp.scenStars(ls, lost(st0, 7, 't'), 0, st0) === 2 &&
    camp.scenStars(ls, lost(st0, 5, 't'), 0, st0) === 1 && camp.scenStars(ls, lost(st0, 2, 't'), 0, st0) === 0);
  const won = lost(camp.START_OWN, 3, 'm');
  check('…a take: held at the end is one, losing none of yours another, taking it fast the third — and never one without the first',
    camp.scenStars(bz, won, 1, camp.START_OWN) === 3 && camp.scenStars(bz, won, 2, camp.START_OWN) === 2 &&
    camp.scenStars(bz, lost(won, 7, 't'), 1, camp.START_OWN) === 2 && camp.scenStars(bz, lost(won, 7, 't'), 3, camp.START_OWN) === 1 &&
    camp.scenStars(bz, camp.START_OWN, 1, camp.START_OWN) === 0 && camp.scenStars(bz, lost(camp.START_OWN, 8, 't'), 0, camp.START_OWN) === 0);
  /* the run: a take is noted when it falls and does not end there; the last round ends it; a stand ends when the keep falls */
  camp.useMap(camp.MAIN_MAP);
  camp.newCampaign('medium', 'scenario', { scen: 'blitz' });
  camp.G.started = true; camp.G.round = 2; camp.G.own[3] = 'm';
  const goesOn = camp.scenCheck(false) === false && camp.G.scenTook === 2;
  camp.G.round = 3; camp.G.own[3] = 't';
  const stillTook = camp.scenCheck(false) === false && camp.G.scenTook === 2;
  const ends = camp.scenCheck(true) === true;
  camp.newCampaign('medium', 'scenario', { scen: 'last-stand' });
  camp.G.started = true; camp.G.own[2] = 't';
  const standFalls = camp.scenCheck(false) === true;
  check('…a take is noted the round it falls and plays on, the last round ends it, and a stand ends the moment its keep falls',
    goesOn && stillTook && ends && standFalls);
  const page = fs.readFileSync(path.join(ROOT, 'assets/games/pjcc_marchland.html'), 'utf8');
  check('…no save, no file on you, no keepsake: a set piece is not a campaign',
    /if \(!G \|\| !G\.started \|\| G\.mode === 'scenario'\) return;/.test(page) && /G\.mode === 'scenario' \|\| multi\(\) \|\| !G\.log \|\| whoOf\('t'\) !== RIVAL\.who\) return;/.test(page) &&
    /if \(G\.mode === 'scenario' && G\.round >= scen\(\)\.rounds\) \{ scenCheck\(true\); return; \}/.test(page));
}

/* ══ 22. NUMBER OF OPPONENTS (his 11-18) ══ six generals to pick from, a word each, each their own way at the map and
   their own pace at the board */
{
  const camp = require(path.join(ROOT, 'tests/campaign-vm.js')).load();
  const page = fs.readFileSync(path.join(ROOT, 'assets/games/pjcc_marchland.html'), 'utf8');
  check('⭐ six generals, a word each, and six ways the map knows',
    camp.FOES.length === 6 && camp.FOES.every((f) => /^[A-Z][a-z]+$/.test(f.word) && (camp.STYLES[f.style] || f.style === 'adapt')) &&
    new Set(camp.FOES.map((f) => f.style)).size === 6 && new Set(camp.FOES.map((f) => f.word)).size === 6,
    camp.FOES.map((f) => f.who + ' ' + f.word).join(' · '));
  camp.useMap(camp.mapFor('four'));
  camp.newCampaign('medium', 'four', { fog: false, cards: false, foes: ['Seaboard Rep', 'Auston', 'Puzzle Champ'] });
  check('…picked, they sit in the order picked, Red, Blue, Violet, each with their own face in the seat\'s color',
    camp.whoOf('t') === 'Seaboard Rep' && camp.whoOf('u') === 'Auston' && camp.whoOf('v') === 'Puzzle Champ' &&
    camp.generalOf('u').who === 'Auston' && camp.generalOf('u').key === 'auston' && camp.generalOf('u').col === camp.SIDES.u.col &&
    camp.styleOf('t') === 'relentless' && camp.styleOf('u') === 'adapt' && camp.styleOf('v') === 'cunning' && camp.styleOf('m') === '');
  check('…and your Assembly never lends you anyone across the table',
    JSON.stringify(camp.musterGenerals(['Auston', 'Vince', 'Seaboard Rep', 'Puzzle Champ', 'Milo'])) === JSON.stringify(['Vince', 'Milo']));
  camp.useMap(camp.MAIN_MAP);
  camp.newCampaign('medium', 'solo', { fog: false, cards: false });
  const plainSolo = camp.whoOf('t');
  camp.newCampaign('medium', 'two', { fog: false, cards: false });
  check('…a mode with no choice keeps the seats\' own (Maxwell Red), and only a campaign or a war takes your picks',
    plainSolo === 'Maxwell' && camp.whoOf('t') === 'Maxwell' &&
    /foes: mode === 'solo' \|\| WAR_START\[mode\] \? picked : null/.test(page) &&
    /foes:G\.foes \|\| \[\]/.test(page) && /foes:Array\.isArray\(o\.foes\) && o\.foes\.length === sides\.length - 1 \? o\.foes : seatFoes\(o\.mode \|\| 'solo'\)/.test(page));
  check('…a war played back names who fought it, and a war saved before the picking (no foes) names the seats\' own',
    camp.whoOf('u', { mode: 'three', sides: ['m', 't', 'u'], foes: ['Wes', 'Auston'] }) === 'Auston' &&
    camp.whoOf('u', { mode: 'three', sides: ['m', 't', 'u'] }) === 'Vince' && /foes: \(G\.foes \|\| \[\]\)\.slice\(\)/.test(page));

  /* Maxwell's file is about you against Maxwell: a campaign against another general goes into nobody's */
  camp.newCampaign('medium', 'solo', { fog: false, cards: false, foes: ['Vince'] });
  camp.G.log = camp.freshLog(); camp.fileCampaign(true);
  const noFile = camp.loadFile() === null;
  camp.newCampaign('medium', 'solo', { fog: false, cards: false, foes: ['Maxwell'] });
  camp.G.log = camp.freshLog(); camp.fileCampaign(true);
  check('…Maxwell keeps his file on you only from campaigns against him, and plays it only when he sits across',
    noFile && !!camp.loadFile() && camp.loadFile().games === 1 &&
    /G\.diff === 'hard' && whoOf\('t'\) === RIVAL\.who \? G\.habits : null/.test(page) &&
    /if \(whoOf\('t'\) === RIVAL\.who\) openingWords\(\); else speak\('open'\);/.test(page));

  /* ── their ways at the map ── */
  const stats = {};
  const plan = (who, mode, n, deal) => {
    const S = stats[who + mode] = { n: 0, atk: 0, three: 0, most: 0, how: {}, split: 0 };
    camp.useMap(camp.mapFor(mode));
    for (let i = 0; i < n; i++) {
      camp.newCampaign('medium', mode, { fog: false, cards: false, foes: camp.sidesFor(mode).slice(1).map((s, k) => (k ? ['Vince', 'Wes'][k - 1] : who)) });
      const G = camp.G;
      G.ranks = G.ranks.map(() => 1 + Math.floor(Math.random() * 7));
      if (deal) deal(G);
      const p = camp.rivalPlan('t');
      S.n++; S.atk += p.attacks.length; if (p.attacks.length >= 3) S.three++; S.most = Math.max(S.most, p.attacks.length);
      p.attacks.forEach((a) => { S.how[a.how || 'plain'] = (S.how[a.how || 'plain'] || 0) + 1; if (camp.splitsOff(a.to)) S.split++; });
    }
    camp.useMap(camp.MAIN_MAP);
    return S;
  };
  const flip = (G) => { for (let k = 0; k < G.own.length; k++) if (Math.random() < 0.3) G.own[k] = G.own[k] === 'm' ? 't' : 'm'; };
  const pc = plan('Puzzle Champ', 'solo', 800, flip), mx = plan('Maxwell', 'solo', 800, flip);
  check('⭐ the Puzzle Champ goes for the holding whose fall cuts another off from the rest, more than Maxwell does, and says so (split)',
    pc.split > mx.split * 1.3 && (pc.how.split || 0) > 40, 'split targets ' + pc.split + ' vs Maxwell ' + mx.split + ' · said ' + (pc.how.split || 0));
  const sr = plan('Seaboard Rep', 'solo', 800, flip);
  check('…the Seaboard Rep attacks once more a round than Medium lets Maxwell (three), never past the player\'s three',
    sr.three > 20 && mx.three === 0 && sr.atk / sr.n > mx.atk / mx.n, 'plans of three: ' + sr.three + ' vs Maxwell ' + mx.three);
  /* Wes digs in fully only in a war of four; with fewer sides he plays `few` */
  const w4 = (() => {
    camp.useMap(camp.mapFor('four')); let most = 0, n = 0;
    for (let i = 0; i < 400; i++) {
      camp.newCampaign('medium', 'four', { fog: false, cards: false, foes: ['Wes', 'Vince', 'Maxwell'] });
      camp.G.ranks = camp.G.ranks.map(() => 1 + Math.floor(Math.random() * 7));
      const p = camp.rivalPlan('t'); most = Math.max(most, p.attacks.length); n += p.attacks.length;
    }
    camp.useMap(camp.MAIN_MAP); return { most, n };
  })();
  const w1 = plan('Wes', 'solo', 800, flip);
  check('…Wes attacks once a turn on Medium in a war of four, and as often as Medium lets him with fewer sides (few)',
    w4.most === 1 && w1.most === 2 && camp.STYLES.dig.few && camp.STYLES.dig.few.cap === 0,
    'war of four: at most ' + w4.most + ' a plan · one on one: at most ' + w1.most + ', ' + (w1.atk / w1.n).toFixed(2) + ' a plan');
  /* Auston: behind the strongest other side by ADAPT_BY she rushes, ahead she digs in, between she takes openings */
  camp.newCampaign('medium', 'three', { fog: false, cards: false, foes: ['Auston', 'Vince'] });
  camp.useMap(camp.mapFor('three'));
  const deal3 = (t, u) => { const G = camp.G; G.own = G.own.map((o, i) => (i < t ? 't' : i < t + u ? 'u' : 'm')); };
  const by = camp.ADAPT_BY;
  deal3(3, 3 + by); const behind = camp.adaptOf('t');
  deal3(4 + by, 4); const ahead = camp.adaptOf('t');
  deal3(5, 5 + by - 1); const level = camp.adaptOf('t');
  camp.useMap(camp.MAIN_MAP);
  check('…Auston rushes ' + by + ' holdings behind the strongest other side, digs in as far ahead, and takes openings between',
    behind === 'rush' && ahead === 'dig' && level === 'openings' && camp.hasLine('rush', 'Auston') && camp.hasLine('dig', 'Auston'),
    behind + ' · ' + ahead + ' · ' + level);
  check('…every general has the words a campaign and a war ask of them (HIS to write)',
    camp.FOES.every((f) => ['open', 'war', 'turn', 'declare', 'took', 'lost', 'held', 'repelled', 'win', 'lose'].every((k) => camp.hasLine(k, f.who))),
    camp.FOES.filter((f) => !['open', 'war', 'win', 'lose'].every((k) => camp.hasLine(k, f.who))).map((f) => f.who).join(', '));

  /* ── their pace at the board (his: "slightly random and anywhere from 0.5 seconds to 5 seconds") ── */
  const ways = Object.keys(camp.TEMPO).concat(['adapt']);
  let inBounds = true, spread = true, costs = [];
  ['easy', 'medium', 'hard'].forEach((lv) => {
    const L = camp.LEVELS[lv], pay = (L.pace + L.ms) / 1000 - camp.MOVE_DELAY;
    ways.forEach((w) => {
      let sum = 0, lo = 9, hi = 0;
      for (let i = 0; i < 20000; i++) {
        const t = camp.aiPause(w, lv, 99, null);
        if (t < camp.TEMPO_MIN || t > camp.TEMPO_MAX) inBounds = false;
        sum += Math.max(0, t - camp.MOVE_DELAY); lo = Math.min(lo, t); hi = Math.max(hi, t);
      }
      if (hi - lo < 1) spread = false;
      costs.push({ lv, w, pay, got: sum / 20000 });
    });
  });
  const worst = costs.reduce((a, c) => (Math.abs(c.got - c.pay) > Math.abs(a.got - a.pay) ? c : a));
  check('⭐ a machine\'s move comes between half a second and five, and never twice alike (each way spans more than a second)',
    inBounds && spread);
  check('…and a move costs its clock on average what the level\'s old pace did, whoever is thinking (the battles stay as measured)',
    Math.abs(worst.got - worst.pay) < 0.04, 'worst: ' + worst.w + ' on ' + worst.lv + ' ' + worst.got.toFixed(3) + 's vs ' + worst.pay.toFixed(3) + 's');
  check('…in time trouble nobody stares (a third of what is left at most), and Auston answers at your pace',
    camp.aiPause('dig', 'hard', 3, null, [0, 1, 0]) === 1 && camp.aiPause('dig', 'hard', 1, null, [0, 1, 0]) === camp.TEMPO_MIN &&
    camp.aiPause('adapt', 'medium', 15, 3.2) === 3.2 && camp.aiPause('adapt', 'medium', 15, 9) === camp.TEMPO_MAX &&
    camp.aiPause('adapt', 'medium', 15, 0.1) === camp.TEMPO_MIN);
  check('…the pause is the battle\'s, read where the machine is asked to move, and your last move is timed for her',
    /var s = aiPause\(styleOf\(B\.foeSide\), G\.diff, B\.clk\.b, B\.yours\);/.test(page) &&
    /if \(mover === 'w' && !B\.two\) B\.yours = Math\.max\(0, B\.turnStart - B\.clk\.w\);/.test(page));
}

/* ══ 23. THE ODDS (his 11-18: "There should be a chance-to-succeed bar, like an eval bar, after the dice is rolled so it is
   more clear who has the advantage") ══ the measured tables two machines' battles are decided by, read by the gap */
{
  const camp = require(path.join(ROOT, 'tests/campaign-vm.js')).load();
  const page = fs.readFileSync(path.join(ROOT, 'assets/games/pjcc_marchland.html'), 'utf8');
  /* a board with that material gap (pawns against bare kings), the attacker White */
  const P = (gap, rule) => {
    const b = new Array(64).fill(''); b[60] = 'K'; b[4] = 'k';
    for (let i = 0; i < Math.abs(gap); i++) b[gap > 0 ? 40 + i : 16 + i] = gap > 0 ? 'P' : 'p';
    return { board: b, attWhite: true, rule: rule || '' };
  };
  const T = camp.CLASH, mid = (k, t) => t.lo + t.bin * k + (t.bin - 1) / 2;
  const atMid = [3, 4, 5, 6].every((k) => Math.abs(camp.oddsOf(P(mid(k, T))) - Math.max(0.01, Math.min(0.99, T.p[k]))) < 1e-9);
  const g0 = camp.oddsOf(P(0)), g2 = camp.oddsOf(P(2));
  check('⭐ the odds are the measured ones: at the middle of each bin its own share, and between two bins a straight line',
    atMid && Math.abs(g0 - (T.p[3] + (T.p[4] - T.p[3]) * 2 / 3)) < 1e-9 && Math.abs(g2 - (T.p[4] + (T.p[5] - T.p[4]) / 3)) < 1e-9,
    'even ' + Math.round(g0 * 100) + '% · +2 ' + Math.round(g2 * 100) + '% · +4 ' + Math.round(camp.oddsOf(P(4)) * 100) + '%');
  let mono = true, edges = true;
  ['', 'endgame', 'drops', 'pieces', 'dark'].forEach((rule) => {
    let last = 0;
    for (let gap = -20; gap <= 24; gap++) {
      const o = camp.oddsOf(P(Math.max(-15, Math.min(15, gap)), rule));
      if (o < last - 1e-12) mono = false;
      if (o < 0.01 || o > 0.99) edges = false;
      last = o;
    }
  });
  check('…every ground its own table (the Sand Mines the plain one), never falling as the gap grows, and never 0 or 100',
    mono && edges && Math.abs(camp.oddsOf(P(1, 'endgame')) - camp.CLASHES.endgame.p[4]) < 1e-9 && camp.oddsOf(P(1, 'dark')) === camp.oddsOf(P(1)));
  check('…shown with the board on both roads (rolled out, or skipped), hidden while the dice roll',
    /paintPreview\(\);\s*\n\s*paintOdds\(\);\s*\n\s*\$\('preview'\)\.hidden = false;/.test(page) &&
    (page.match(/paintOdds\(\);/g) || []).length === 2 && /\$\('preview'\)\.hidden = true;\s*\n\s*\$\('odds'\)\.hidden = true;/.test(page));
}

/* ── report phase 1, then run phase 2 ────────────────────────────────────────────── */
function report(title) {
  console.log('\n=== ' + title + ' ===\n');
  let failed = 0;
  for (const r of results) {
    if (!r.pass) failed++;
    console.log('  ' + (r.pass ? '✓' : '✗') + ' ' + r.label + (r.detail ? '   ' + r.detail : ''));
  }
  return failed;
}

/* ══════════════════════════════════════════════════════════════════════════════════
   PHASE 2 — DRIVE THE REAL PAGE
   ══════════════════════════════════════════════════════════════════════════════════ */
const http = require('http');
const { findChrome } = require(path.join(ROOT, 'tests/harness.js'));

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
function serve() {
  return new Promise((res) => {
    const srv = http.createServer((req, r) => {
      const p = decodeURIComponent(req.url.split('?')[0]);
      fs.readFile(path.join(ROOT, p), (err, buf) => {
        /* ⚠ /assets/css/vs-aura.css is a Jekyll-compiled .scss and does not exist on disk.
           A 404 here is correct and harmless; the game does not depend on it to run. */
        if (err) { r.writeHead(404); r.end(); return; }
        r.writeHead(200, { 'Content-Type': MIME[path.extname(p).toLowerCase()] || 'text/plain' });
        r.end(buf);
      });
    });
    srv.listen(0, () => res(srv));
  });
}
const isOn = (id) => `document.getElementById('${id}').classList.contains('on')`;
/* ⛑ THE BATTLE'S VERDICT IS ON THE BOARD NOW — 2026-08-25. `screen-result` no longer opens
   when a battle ends (Nate: "leave the message on the board instead"), so every wait that
   used to look for that screen looks for the endcard instead. `screen-result` still exists
   and is still used by the CAMPAIGN ending, which is why it was not deleted. */
const ENDED = "document.getElementById('endcard').classList.contains('on')";

(async () => {
  let pp;
  try { pp = require(path.join(ROOT, 'node_modules/puppeteer-core')); }
  catch (e) { console.log('\n  (phase 2 skipped — puppeteer-core not installed)\n'); process.exit(report('CHESSWILD: CAMPAIGN — RULES (phase 1 only)') ? 1 : 0); }
  const exe = findChrome();
  if (!exe) { console.log('\n  (phase 2 skipped — no Chrome/Edge found; set CHROME_PATH)\n'); process.exit(report('CHESSWILD: CAMPAIGN — RULES (phase 1 only)') ? 1 : 0); }

  const srv = await serve();
  const port = srv.address().port;
  const browser = await pp.launch({ executablePath: exe, headless: 'new',
    args: ['--no-sandbox', '--mute-audio'], protocolTimeout: 0 });
  try {
    const page = await browser.newPage();
    const errs = [];
    page.on('pageerror', (e) => errs.push(e.message));
    await page.goto(`http://127.0.0.1:${port}/assets/games/pjcc_marchland.html`, { waitUntil: 'load' });
    // these are the plain rules: no event card may change the attack count or block a target
    // ⚠ AND THE FLAT MAP: these clicks land where the flat map draws a holding; the sand table (a lens) has its own checks
    await page.evaluate(() => { localStorage.setItem('pjcc.campaign.cards', '0'); localStorage.setItem('pjcc.campaign.map.flat', '1'); });
    await page.reload({ waitUntil: 'load' });

    /* place everything, spend all three attacks, then let them come — the run doubles as
       the attack-budget probe and as the way into a defense */
    await page.click('#go');
    await page.waitForFunction(isOn('screen-map'));
    /* ⚠ BOUNDED BY THE PHASE, NOT BY `.can` — 2026-08-25. Deployment now ends ITSELF on the
       last rank, and `.node.mine.can` is also what the ATTACK phase paints on a holding that
       can attack — so a loop that ran until no `.can` remained kept clicking after the phase
       had turned over, selecting attack sources and spending the budget this run is here to
       measure. It failed as "the counter read 3", which looked like the counter was broken and
       was really this loop playing the next phase for us. */
    const phaseIs = (p) => page.evaluate((q) =>
      document.querySelector('.phasebar span[data-p="' + q + '"].on') !== null, p);
    for (let i = 0; i < 8; i++) {
      if (!(await phaseIs('deploy'))) break;
      const left = await page.evaluate(() => document.querySelectorAll('.node.mine.can').length);
      if (!left) break;
      await page.click('.node.mine.can');
      await new Promise((r) => setTimeout(r, 90));
    }
    /* ── THREE ATTACKS AND NOT A FOURTH ──
       ⚠⚠ THE ONLY HONEST WAY TO CHECK A BUDGET IS TO SPEND IT. Each attack is opened for
       real and then withdrawn from, which is instant and still costs one of the three —
       an attack you lose is one of your three, which is the rule that makes choosing
       matter. Reading the counter after each one proves it falls on COMMIT, not on a win. */
    /* ⛑ NO CLICK HERE ANY MORE — 2026-08-25. Placing the last rank ends deployment by
       itself (Nate: "after deployment phase, let's go straight to attack phase without
       having to hit the yellow button"), so this line used to press the button that now
       means "END your attacks" — which skipped straight to Fortify and left the counter
       reading 3. That is the gate catching a real flow change, not a broken test.
       ⚠ WAIT FOR THE PHASE, do not sleep: the hand-off rides the 420ms placement flash. */
    await page.waitForFunction(
      () => document.querySelector('.phasebar span[data-p="attack"].on') !== null,
      { timeout: 9000 });
    const atkSeen = [await page.$eval('#t-atk', (e) => e.textContent)];
    /* ⚠ EVERY CLICK GOES THROUGH evaluate, NOT AN ELEMENT HANDLE. drawMap() removes and
       rebuilds every node on each tap, so a handle taken one line earlier is detached by
       the time it is used — which is exactly how this first crashed. */
    const tapNth = (sel, i) => page.evaluate((s, n) => {
      const el = document.querySelectorAll(s)[n];
      if (el) el.click();
      return !!el;
    }, sel, i);
    for (let a = 0; a < 3; a++) {
      let opened = false;
      const sources = await page.evaluate(() => document.querySelectorAll('.node.mine.can').length);
      for (let s = 0; s < sources && !opened; s++) {
        if (!(await tapNth('.node.mine.can', s))) break;
        await new Promise((r) => setTimeout(r, 120));
        if (await page.evaluate(() => document.querySelectorAll('.node.tgt').length)) {
          await tapNth('.node.tgt', 0); opened = true;
        } else {
          await tapNth('.node.sel', 0);            // that source borders nobody — put it back
          await new Promise((r) => setTimeout(r, 80));
        }
      }
      if (!opened) break;
      await page.waitForFunction(isOn('screen-roll'), { timeout: 9000 });
      await page.click('#screen-roll');                         // skip the flourish
      await page.waitForFunction(() => !document.getElementById('tobattle').disabled, { timeout: 9000 });
      await page.click('#tobattle');
      await page.waitForFunction(isOn('screen-battle'), { timeout: 9000 });
      await page.click('#resign');                               // arms it…
      await page.click('#resign');                               // …and withdraws
      await page.waitForFunction(ENDED, { timeout: 9000 });
      await page.click('#econt');
      await page.waitForFunction(isOn('screen-map'), { timeout: 9000 });
      atkSeen.push(await page.$eval('#t-atk', (e) => e.textContent));
    }
    check('⚑ three attacks a round, counted down as you spend them',
          atkSeen.join(',') === '3,2,1,0', 'the counter read ' + atkSeen.join(' → '));
    const spent = await page.evaluate(() => ({
      phase: (document.querySelector('.phasebar span.on') || {}).textContent,
      targets: document.querySelectorAll('.node.tgt').length
    }));
    check('…and the fourth is not on offer — spending the last one moves you to Fortify',
          spent.phase === 'Fortify' && spent.targets === 0,
          'the strip reads ' + spent.phase + ', ' + spent.targets + ' enemy holdings offered');

    /* whatever phase the run above left us in, walk it to theirs */
    for (let i = 0; i < 3; i++) {
      /* their turn lights no cell — and #endturn is the hurry button during it, so stop here */
      if (await page.evaluate(() => !document.querySelector('.phasebar span.on'))) break;
      await page.click('#endturn');
      await new Promise((r) => setTimeout(r, 120));
    }

    const gotRoll = await page.waitForFunction(isOn('screen-roll'), { timeout: 20000 })
      .then(() => true).catch(() => false);
    check('their turn reaches an attack the player has to defend', gotRoll === true);
    if (gotRoll) {
      const dl = await page.$eval('#def-label', (e) => e.textContent);
      check('…announced before the roll screen, with you in the defender chair',
            /You defend/.test(dl), dl.trim());

      await page.waitForFunction(() => !document.getElementById('tobattle').disabled, { timeout: 10000 });
      const prev = await page.evaluate(() => ({
        shown: !document.getElementById('preview').hidden,
        men: document.querySelectorAll('#pmen .pc').length,
        kept: document.querySelectorAll('.die.kept').length
      }));
      check('the exact position is previewed before you commit to it',
            prev.shown && prev.men >= 4, prev.men + ' men on the preview board');
      check('one die per pool locks in with a ring', prev.kept === 4, prev.kept + ' rings');

      await page.click('#tobattle');
      await page.waitForFunction(isOn('screen-battle'));

      /* ── THE REVEAL BEAT ── */
      const c1 = await page.$eval('#clock', (e) => e.textContent);
      await new Promise((r) => setTimeout(r, 700));
      const c2 = await page.$eval('#clock', (e) => e.textContent);
      check('⚑ the clock does NOT start with the screen — you get to look first',
            c1 === c2, c1 + ' held for 700ms');

      /* ── THE EXPLOIT ── do nothing at all, and see who wins ── */
      const t0 = Date.now();
      await page.waitForFunction(ENDED, { timeout: 60000 });
      const el = ((Date.now() - t0) / 1000).toFixed(1);
      const res = await page.evaluate(() => ({
        v: document.getElementById('eword').textContent,
        win: /win/.test(document.getElementById('eword').className),
        line: document.getElementById('eline').textContent
      }));
      /* ⚠⚠ THE CHECK THIS WHOLE PHASE EXISTS FOR. Before 2026-08-24 this returned a WIN
         after 15.1 seconds of touching nothing, in every defense in the game. */
      check('⚠⚠ idling through a defense LOSES it',
            res.win === false, el + 's of no input → ' + res.v + ' — "' + res.line.trim() + '"');
      check('…and it ends by the clock rather than hanging',
            +el < 40, 'resolved in ' + el + 's');
    }

    /* ── A CLOCK MUST NEVER EXCEED WHAT IT STARTED WITH ──
       The Bronstein credit is what makes a battle terminate: a plain increment would let a
       side that answers in 180ms gain time forever. Sampled black-box off the readout. */
    await page.click('#econt').catch(() => {});
    const clockProbe = await page.evaluate(async () => {
      const readout = () => {
        const t = document.getElementById('clock').textContent.split('vs');
        return [parseFloat(t[0]), parseFloat(t[1])];
      };
      const seen = [];
      for (let i = 0; i < 40; i++) {
        if (document.getElementById('screen-battle').classList.contains('on')) seen.push(readout());
        await new Promise((r) => setTimeout(r, 120));
      }
      return seen;
    });
    if (clockProbe.length > 4) {
      const maxW = Math.max(...clockProbe.map((c) => c[0]));
      const maxB = Math.max(...clockProbe.map((c) => c[1]));
      check('neither clock ever exceeds its starting value',
            maxW <= 20.01 && maxB <= 20.01, 'peak ' + maxW + ' / ' + maxB);
    }

    /* ══ 18. A DROP, PLAYED ON THE REAL PAGE (his #8) ══ the page's own save, edited so Red holds Shogi Island, resumed and
       attacked; moves clicked until a take; the taken piece pressed out of the hand and clicked onto a lit square */
    {
      const C2 = require(path.join(ROOT, 'assets/js/pjcc-chess.js'));
      const wait = (ms) => new Promise((r) => setTimeout(r, ms));
      await page.evaluate(() => Object.keys(localStorage).filter((k) => k.indexOf('pjcc.campaign.save') === 0).forEach((k) => localStorage.removeItem(k)));
      await page.reload({ waitUntil: 'load' });
      await page.click('#go');
      await page.waitForFunction(isOn('screen-map'));
      for (let i = 0; i < 8; i++) {
        if (!(await phaseIs('deploy'))) break;
        if (!(await page.evaluate(() => document.querySelectorAll('.node.mine.can').length))) break;
        await page.click('.node.mine.can');
        await wait(90);
      }
      await page.waitForFunction(() => document.querySelector('.phasebar span[data-p="attack"].on') !== null, { timeout: 9000 });
      await page.evaluate(() => {
        const k = Object.keys(localStorage).find((x) => x.indexOf('pjcc.campaign.save') === 0);
        const o = JSON.parse(localStorage.getItem(k));
        o.own[7] = 't'; o.ranks[7] = 2; o.ranks[5] = 9;
        localStorage.setItem(k, JSON.stringify(o));
      });
      await page.reload({ waitUntil: 'load' });
      await page.click('#resume');
      await page.waitForFunction(isOn('screen-map'));
      await page.evaluate(() => document.querySelector('.node[data-id="5"]').click());
      await wait(150);
      await page.evaluate(() => document.querySelector('.node[data-id="7"]').click());
      await page.waitForFunction(isOn('screen-roll'), { timeout: 9000 });
      const chip = await page.$eval('#def-label', (e) => e.textContent);
      check('⭐ marching on Shogi Island, the roll screen says its rule', /drops · takes come back/.test(chip), chip);
      await page.click('#screen-roll');
      await page.waitForFunction(() => !document.getElementById('tobattle').disabled, { timeout: 9000 });
      await page.click('#tobattle');
      await page.waitForFunction(isOn('screen-battle'), { timeout: 9000 });
      const rows = await page.evaluate(() => [!document.getElementById('hand-me').hidden, !document.getElementById('hand-opp').hidden,
        document.getElementById('hand-me').textContent, document.getElementById('say').textContent]);
      check('⭐ a battle for the Island has your hand under the board and theirs over it, and its first line says the rule',
            rows[0] && rows[1] && /Your hand/.test(rows[2]) && /Shogi Island: A piece you take is yours to drop/.test(rows[3]), JSON.stringify(rows));
      const board = () => page.evaluate(() => {
        const T = { '♚': 'k', '♛': 'q', '♜': 'r', '♝': 'b', '♞': 'n', '♟': 'p' }, b = new Array(64).fill('');
        document.querySelectorAll('#men .pc').forEach((el) => {
          if (el.classList.contains('gone')) return;
          const t = T[el.textContent.trim()];
          if (t) b[+el.style.getPropertyValue('--r') * 8 + +el.style.getPropertyValue('--f')] = el.classList.contains('w') ? t.toUpperCase() : t;
        });
        return b;
      });
      const press = (i) => page.evaluate((n) => document.querySelector('#sqs [data-i="' + n + '"]').click(), i);
      const mine = () => page.evaluate(() => { const s = document.querySelector('#clock span'); return !!s && s.className === 'run'; });
      await press(0);                                             // a tap skips the reveal
      let took = '', over = false;
      for (let k = 0; k < 14 && !took && !over; k++) {
        for (let w = 0; w < 120 && !(await mine()); w++) {
          if (await page.evaluate(ENDED)) { over = true; break; }
          await wait(100);
        }
        if (over) break;
        const b = await board();
        const ms = C2.legalMoves({ b, turn: 'w', cast: { K: false, Q: false, k: false, q: false }, ep: -1, half: 0, full: 1 })
          .filter((m) => !m.promo && !m.ep);
        /* ⚠ TOWARD THE ENEMY, NOT AT RANDOM (11-17): with no flat edge the armies are small, and a random walk went fourteen
           moves without a take. A capture first, else the move that ends nearest one of theirs. */
        const foes = []; b.forEach((c, i) => { if (c && c === c.toLowerCase()) foes.push(i); });
        const near = (s) => Math.min(...foes.map((e) => Math.max(Math.abs((s >> 3) - (e >> 3)), Math.abs((s & 7) - (e & 7)))));
        const m = ms.find((x) => b[x.to]) || ms.slice().sort((x, y) => near(x.to) - near(y.to) || x.to - y.to)[0];
        if (!m) break;
        await press(m.from); await press(m.to);
        if (b[m.to]) took = b[m.to].toLowerCase();
        await wait(200);
      }
      let drop = { why: over ? 'the battle ended before a take' : 'no take in fourteen moves' };
      for (let tries = 0; took && !over && tries < 4; tries++) {
        for (let w = 0; w < 120 && !(await mine()); w++) {
          if (await page.evaluate(ENDED)) { over = true; break; }
          await wait(100);
        }
        if (over) { drop = { why: 'the battle ended before a drop' }; break; }
        /* ⚠ IN CHECK BY A KNIGHT OR A PAWN NO DROP CAN BLOCK, and the screen rightly lights nothing (1 run in 3 on the 11-17
           starting positions): step out of it, and drop on the next turn */
        const b0 = await board();
        const S0 = { b: b0, turn: 'w', cast: { K: false, Q: false, k: false, q: false }, ep: -1, half: 0, full: 1 };
        if (C2.inCheck(S0, 'w')) {
          const esc = C2.legalMoves(S0).filter((x) => !x.promo)[0];
          if (!esc) break;
          await press(esc.from); await press(esc.to);
          await wait(200);
          continue;
        }
        drop = await page.evaluate((t) => {
          const hb = document.querySelector('#hand-me button[data-t="' + t + '"]');
          if (!hb) return { why: 'no ' + t + ' in the hand row' };
          hb.click();
          const lit = [].slice.call(document.querySelectorAll('#sqs .sq.hint')).map((c) => +c.getAttribute('data-i'));
          const on = !!document.querySelector('#hand-me button.on');
          if (!lit.length) return { why: 'nothing lit', on };
          document.querySelector('#sqs [data-i="' + lit[0] + '"]').click();
          return { on, lit, at: lit[0] };
        }, took);
        break;
      }
      await wait(300);
      const after = await board();
      check('⭐⭐ ON THE REAL PAGE: a piece you took goes into your hand, pressed it lights the empty squares, and a click drops it there',
            !!drop.on && drop.lit && drop.lit.every((i) => !after[i] || i === drop.at) && after[drop.at] === took.toUpperCase() &&
            (took !== 'p' || drop.lit.every((i) => i >= 8 && i < 56)), JSON.stringify(drop) + ' took ' + took);
      try { fs.mkdirSync(path.join(ROOT, 'tests/__shots'), { recursive: true }); } catch (e) {}
      await page.screenshot({ path: path.join(ROOT, 'tests/__shots/marchland-drops.png') }).catch(() => {});
    }

    /* ══ 18b. THE SAND MINES GO DARK, ON THE REAL PAGE ══ a fresh campaign's own opening: Gauntlet Keep marches on the
       Sand Mines next door; tapped live, the murk falls within its first window, over the board and under no finger */
    {
      const wait = (ms) => new Promise((r) => setTimeout(r, ms));
      await page.evaluate(() => Object.keys(localStorage).filter((k) => k.indexOf('pjcc.campaign.save') === 0).forEach((k) => localStorage.removeItem(k)));
      await page.reload({ waitUntil: 'load' });
      await page.click('#go');
      await page.waitForFunction(isOn('screen-map'));
      for (let i = 0; i < 8; i++) {
        if (!(await phaseIs('deploy'))) break;
        if (!(await page.evaluate(() => document.querySelectorAll('.node.mine.can').length))) break;
        await page.click('.node.mine.can');
        await wait(90);
      }
      await page.waitForFunction(() => document.querySelector('.phasebar span[data-p="attack"].on') !== null, { timeout: 9000 });
      const tag = await page.evaluate(() => { const n = document.querySelector('.node[data-id="0"] .rtag'); return n ? n.textContent : ''; });
      await page.evaluate(() => document.querySelector('.node[data-id="2"]').click());
      await wait(150);
      await page.evaluate(() => document.querySelector('.node[data-id="0"]').click());
      await page.waitForFunction(isOn('screen-roll'), { timeout: 9000 });
      await page.click('#screen-roll');
      await page.waitForFunction(() => !document.getElementById('tobattle').disabled, { timeout: 9000 });
      await page.click('#tobattle');
      await page.waitForFunction(isOn('screen-battle'), { timeout: 9000 });
      const say = await page.$eval('#say', (e) => e.textContent);
      await page.evaluate(() => document.querySelector('#sqs [data-i="0"]').click());     // a tap skips the reveal
      let seen = null;
      for (let i = 0; i < 90 && !seen; i++) {
        seen = await page.evaluate(() => {
          const m = document.getElementById('murk');
          if (!m || !m.classList.contains('on')) return null;
          const cs = getComputedStyle(m), b = document.getElementById('board').getBoundingClientRect(), r = m.getBoundingClientRect();
          return { pe: cs.pointerEvents, z: +cs.zIndex, over: Math.abs(r.left - b.left) < 2 && Math.abs(r.width - b.width) < 2 };
        });
        if (!seen) await wait(100);
      }
      check('⭐ the Sand Mines on the map say DARK, and a battle there says the light comes and goes',
            /dark/i.test(tag) && /Sand Mines: Down the mines, the light comes and goes/.test(say), tag + ' · ' + say);
      check('⭐⭐ ON THE REAL PAGE the light fails within the first window: the murk over the board, above its 3D canvas, under no finger',
            !!seen && seen.pe === 'none' && seen.z > 2 && seen.over, JSON.stringify(seen));
      await page.screenshot({ path: path.join(ROOT, 'tests/__shots/marchland-dark.png') }).catch(() => {});
      await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
      const calm = await page.evaluate(() => getComputedStyle(document.getElementById('murk')).display);
      await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
      check('…and with reduced motion there is none to see', calm === 'none', calm);
    }

    check('no page errors during a full round', errs.length === 0, errs.slice(0, 2).join(' | '));
  } finally {
    await browser.close(); srv.close();
  }

  const failed = report('CHESSWILD: CAMPAIGN — HIS RULES, AS A GATE');
  console.log('\nRESULT: ' + (failed ? 'FAIL (' + failed + ')' : 'PASS (' + results.length + ' checks)') +
              '   ·   phase 1 in a vm, phase 2 in a browser\n');
  process.exit(failed ? 1 : 0);
})().catch((e) => {
  /* ⚠⚠ PRINT PHASE 1 BEFORE DYING (2026-08-25). Phase 1 holds its results until the very end,
     so a phase-2 crash used to swallow them whole — a mutation that broke a rule AND broke the
     page reported "TimeoutError: Waiting failed" and never named the rule it had broken. Green
     must name what ran; RED MUST NAME WHAT FAILED. Found by mutation-testing, not by reading. */
  console.error('\nCHECK CRASHED IN PHASE 2: ' + (e && e.message ? e.message.split('\n')[0] : e));
  console.error('  (the page itself may be throwing — phase 1 below still ran in full)');
  report('CHESSWILD: CAMPAIGN — PHASE 1 ONLY, PHASE 2 DID NOT FINISH');
  process.exit(1);
});
