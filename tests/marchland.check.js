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
  slice('var VAL = {',      '/* Placement:') +
  slice('function pawnsOf', '/* ── THE ENGINE') +
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
/* ⭐ the die bands are the conditional formatting — four bands of five, no gaps, no overlap */
check('every face 1-20 lands in exactly one of four bands',
      [...Array(20)].map((_, i) => G.dieBand(i + 1)).join('') === '11111222223333344444',
      '1-5 thin · 6-10 plain · 11-15 strong · 16-20 hot');

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
      /Math\.min\(L\.maxAtk, ATTACK_CAP\)/.test(src),
      'Hard already plays 3; the clamp is what keeps that true after the next edit');
check('…and the budget is spent when an attack is COMMITTED, not when it is won',
      /G\.atks--;\s*\n\s*beginBattle\(G\.sel, id, true\)/.test(src),
      'an attack you lose is still one of your three');
{
  /* ⚠ MUTATION-MINDED: three separate places have to agree, so each gets its own check
     rather than one regex that a single surviving site would satisfy. */
  const resetFn = slice('function startYourTurn()', 'function campaignCheck');
  check('a new round hands the budget back', /G\.atks = ATTACK_CAP;/.test(resetFn));
  const contFn = slice("$('cont').addEventListener", "newCampaign('medium')");
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
check('a 7 tucks the king in ALONE', o16.castled === true && b16[F.g8] === 'k');
check('…with NO rook — it is still on h8', o16.rook === false && b16[7] === 'r' && !b16[F.f8]);
check('…and NO shield claimed', o16.shield === 0);

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

/* ══ 7. THE WIRING — his 2026-08-11 answer: the POSITION die, and only that ═════════ */
const call = /applyDefenderPos\(\s*board\s*,\s*[^,]+,\s*([A-Za-z0-9_.]+)\s*\)/.exec(src);
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
const howScreen = slice('<section class="screen" id="screen-how">', '</section>');
check('the how-it-works screen states BOTH castling bands',
      /<b>7 or better<\/b> tucks your\s+king into the corner/.test(howScreen) &&
      /<b>an 8<\/b> brings his rook around/.test(howScreen),
      'the page and the rule agree, on both halves of it — re-checked when the die shrank');
check('…and it explains that ranks are dice',
      /keep the best/i.test(howScreen) && /one die per two ranks/i.test(howScreen));
check('…and that your own flag is your own loss',
      /Run your own clock out and you lose/i.test(howScreen),
      'the rule that replaced "either flag goes to the defender"');
check('…and what a chain is',
      /chained/i.test(howScreen) && /extra die/i.test(howScreen));
check('…and that you only get three attacks',
      /three attacks a round/i.test(howScreen), 'his 2026-08-25 rule, stated on the screen');

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
      /\$\('t-chain'\)\.textContent = chainCount\(G\.own, 'm'\)/.test(src));
check('a chained holding is marked on the map itself',
      /if \(chained\(G\.own, L\.id\)\) cls \+= ' chained';/.test(slice('function drawMap()', 'function tapLand')) &&
      /\.node\.chained \.disc \{/.test(slice('<style>', '</style>')),
      'a double ring, because .sel/.can/.tgt already own the disc box-shadow');
check('the roll screen says the extra die out loud, not in the fine print',
      /chainchip/.test(slice('function beginBattle(', '/* ── THE ROLL, AS FOUR BEATS')) &&
      /\.chainchip \{/.test(slice('<style>', '</style>')),
      'it used to appear only as ", +1 chained" behind a tap');

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
check('ATTACKING, the screen tells a full enemy castle from a bare king',
      /THEY CASTLE FULLY[\s\S]{0,90}king, rook and three pawns/.test(attChair) &&
      /THEIR KING TUCKS IN[\s\S]{0,90}no rook, no shield/.test(attChair),
      'a 16 and an 18 do not read identically from the attacker chair');
check('DEFENDING, it tells your own full castle from your own bare king',
      /FULL CASTLE[\s\S]{0,140}king, rook and three pawns/.test(defChair) &&
      /KING IN THE CORNER[\s\S]{0,90}no rook, no shield/.test(defChair),
      'checked in the branch that writes it, not anywhere in the file');
check('…and it names the no-rook case honestly',
      /no rook to bring/.test(defChair),
      'a roll cannot conjure a rook the muster never bought');

/* ══ 9b. THE VERDICT REPORTS THE BOARD, NOT THE DIE ═════════════════════════════════
   ⛑⛑ 2026-08-25, found by LOOKING at a render. `applyAttackerPos` has always returned how
   many pawns it really advanced, and beginBattle discarded it — so posVerdict re-derived
   the number from the die and announced "PAWNS UP 2" over a board with no pawns, every
   time the muster spent its whole budget on pieces. RE-MEASURE, NEVER RECOMPUTE.
   [[audit-numbers-can-be-wrong]] */
check('the pawns that moved are KEPT, not re-derived',
      /var aMoved = applyAttackerPos\(/.test(src) && /aMoved:aMoved/.test(src),
      'the truth was already being computed and thrown away');
check('ATTACKING, the headline counts what MOVED',
      /var st = p\.aMoved/.test(attChair) && !/var st = posSteps/.test(attChair),
      'not what the die promised');
check('…and a wasted die is said out loud rather than dressed up',
      /NO PAWNS TO PUSH/.test(attChair) && /no pawns to push/.test(attChair),
      'the headline and the second clause both stop claiming pawns you do not have');
check('DEFENDING, the chain counts pawns that really dug in',
      /p\.dInfo\.chain \+ ' pawns dug in/.test(defChair) &&
      /NO PAWNS TO DIG IN/.test(defChair),
      'dInfo.chain is the measurement; posSteps is the promise');
{
  /* and prove the premise in the vm: an all-pieces muster cannot advance a pawn, so the
     die really is wasted and the old headline really was describing nothing. */
  const noPawns = new Array(64).fill('');
  'RNBQKBNR'.split('').forEach((c, f) => { noPawns[56 + f] = c; });
  check('an all-pieces muster really does advance zero pawns',
        G.applyAttackerPos(noPawns, 'w', 20) === 0,
        'a 20 on the position die and nothing to spend it on — this is the board that lied');
  const withPawns = new Array(64).fill('');
  [48, 49, 50, 51].forEach((i) => { withPawns[i] = 'P'; });
  check('…while a muster with pawns advances them',
        G.applyAttackerPos(withPawns, 'w', 20) > 0);
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
          d.balance.moveDelay === G.MOVE_DELAY && d.balance.queenRanks === G.QUEEN_RANKS,
          'ATT_EDGE ' + d.balance.attEdge + ' - clocks ' + d.balance.clockAtt + '/' +
          d.balance.clockDef + ' - delay ' + d.balance.moveDelay + 's');
  }
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
      await page.click('#resign');
      await page.waitForFunction(isOn('screen-result'), { timeout: 9000 });
      await page.click('#cont');
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
      const p = await page.evaluate(() => (document.querySelector('.phasebar span.on') || {}).textContent);
      if (p === 'Theirs') break;
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
      await page.waitForFunction(isOn('screen-result'), { timeout: 60000 });
      const el = ((Date.now() - t0) / 1000).toFixed(1);
      const res = await page.evaluate(() => ({
        v: document.getElementById('verdict').textContent,
        win: /win/.test(document.getElementById('verdict').className),
        line: document.getElementById('result-say').textContent
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
    await page.click('#cont').catch(() => {});
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
