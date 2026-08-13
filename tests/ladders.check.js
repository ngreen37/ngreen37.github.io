/* ═══════════════════════════════════════════════════════════════════════════════════
 * THE TWO LADDERS + THE REPORT PIPE — priority items 1, 2 and 3
 * -----------------------------------------------------------------------------------
 * Three features that share one property: they are all NUMBERS SHOWN TO A PLAYER, and a
 * number that drifts is worse than no number. They also all ship BEFORE the migration
 * that backs them (docs/puzzle-reports-setup.md), so the first thing checked is that
 * every one of them degrades to something honest rather than to a spinner or a throw.
 *
 * WHAT THIS DEFENDS, in order of how expensive the mistake would be:
 *
 *   1. THE CLEARANCE PIP NEVER DEMOTES ANYBODY. It is the MAX of the rating ladder and
 *      the credit ladder precisely so that shipping it could not take a rung off an
 *      existing player. If someone ever "simplifies" it to rating-only, every player who
 *      earned Delta on credits wakes up a Recruit — a takeaway, which is the one thing
 *      this economy's rules forbid ([[sell-back-economy]]).
 *   2. THE PUZZLE ELO CANNOT BE HINTED. A revealed solve plays the winning move FOR you,
 *      so if it scored as a win anybody could reveal their way to a 2000 rating.
 *   3. THE REPORT NEVER THROWS. It resolves {ok:false} so the room can fall back to the
 *      Email/Copy pair instead of swallowing a report in silence.
 *
 *   node tests/ladders.check.js
 * ═══════════════════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SRC = fs.readFileSync(path.join(ROOT, 'assets/js/pjcc-profile.js'), 'utf8');
const FORK = fs.readFileSync(path.join(ROOT, 'assets/games/pjcc_fork.html'), 'utf8').replace(/\r\n/g, '\n');

let pass = 0, fail = 0;
const check = (n, c, d) => {
  if (c) { pass++; console.log('  ✓ ' + n + (d !== undefined ? '   ' + d : '')); }
  else { fail++; console.log('  ✗ ' + n + (d !== undefined ? '   ' + d : '')); }
};

function boot(store) {
  store = store || {};
  const localStorage = {
    getItem: k => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: k => { delete store[k]; }
  };
  const win = { localStorage, location: { search: '', origin: 'https://chesswild.com' } };
  const doc = { createElement: () => ({ setAttribute() {}, appendChild() {}, style: {} }),
                head: { appendChild() {} }, body: { appendChild() {} },
                getElementById: () => null, querySelectorAll: () => [], addEventListener() {} };
  new Function('window', 'document', 'localStorage', 'URLSearchParams', 'navigator', SRC)
    (win, doc, localStorage, URLSearchParams, { userAgent: 'node' });
  return { P: win.PJCC, store };
}

console.log('\n── THE LADDERS ───────────────────────────────────────────\n');
const { P } = boot();

/* ── 1. THE CLEARANCE LADDER ──────────────────────────────────────────────────────── */
/* ⚑ NINE RUNGS SINCE 2026-08-13 (Theta and Sigma inserted mid-ladder; "Above Omega"
   renamed ALPINE CLEARANCE, which now gates /characters/alpine/). The counts below are
   DERIVED from the shipped ladder rather than typed, because a hand-edited number is not a
   test — the assertions that matter are that the two arrays stay aligned, that every rung
   is distinguishable, and that the top of the ladder is the rung the gate names. */
const TOP = P.CLEARANCE[P.CLEARANCE.length - 1];
check('the two ladders are the same height', P.CLEARANCE.length === P.RANKS.length,
  P.CLEARANCE.length + ' clearance rungs · ' + P.RANKS.length + ' credit rungs');
check('…and index-aligned, name for name — the floor depends on it',
  P.CLEARANCE.every((c, i) => c.name === P.RANKS[i].name),
  P.CLEARANCE.map(c => c.name).join(' · '));
check('the top rung is ALPINE CLEARANCE — the one the gate names', TOP.name === 'Alpine Clearance',
  TOP.name + ' @ rating ' + TOP.rating + ' / ' + P.RANKS[P.RANKS.length - 1].min + ' credits');
/* "Above Omega" was retired site-wide, so it must not survive as a rung name anywhere on
   either ladder — the failure it would cause is one phrase meaning two different heights. */
check('…and "Above Omega" is gone from both ladders',
  !P.CLEARANCE.some(c => /above omega/i.test(c.name)) && !P.RANKS.some(r => /above omega/i.test(r.name)));
check('the rating thresholds ascend',
  P.CLEARANCE.every((c, i) => i === 0 || c.rating > P.CLEARANCE[i - 1].rating),
  P.CLEARANCE.map(c => c.rating).join(' '));
check('the credit thresholds ascend too',
  P.RANKS.every((r, i) => i === 0 || r.min > P.RANKS[i - 1].min),
  P.RANKS.map(r => r.min).join(' '));
check('every rung has its own pip glyph',
  new Set(P.CLEARANCE.map(c => c.pip)).size === P.CLEARANCE.length,
  P.CLEARANCE.map(c => c.pip).join(' '));
/* ⚠ A PIP WITH NO COLOR IS INVISIBLE, NOT OBVIOUSLY BROKEN. The class is built as
   'pip-' + level, sweep.js allows the whole prefix, and nothing else on the site would
   notice a rung shipping without its rule — so the stylesheet is read here. */
{
  const SCSS = fs.readFileSync(path.join(ROOT, '_sass/_pjcc-14-profile.scss'), 'utf8');
  const missing = P.CLEARANCE.filter(c => !new RegExp('\\.pip-' + c.level + '\\s*\\{').test(SCSS));
  check('every rung has a .pip-N color in the stylesheet', missing.length === 0,
    missing.length ? 'no rule for ' + missing.map(c => 'pip-' + c.level).join(', ')
                   : 'pip-1 … pip-' + P.CLEARANCE.length);
}
check('a guest reads as Recruit, not as an error', P.clearance(null).level === 1, P.clearance(null).name);
check('the Park Tables starting rating is still Recruit',
  P.clearance({ pjcc_rating: 250, credits: 0 }).level === 1,
  '250 → ' + P.clearance({ pjcc_rating: 250, credits: 0 }).name);
check('a strong rating climbs it', P.clearance({ pjcc_rating: 1350, credits: 0 }).name === 'Omega Clearance',
  '1350 → ' + P.clearance({ pjcc_rating: 1350, credits: 0 }).name);
/* ⚠ THE SEVEN ORIGINAL RUNGS DID NOT MOVE. Inserting Theta and Sigma was supposed to add
   stops, not re-price the ones anybody had already climbed to — so each original name is
   checked at its own original rating, by NAME, since the level numbers legitimately shifted. */
{
  const was = [[0, 'Recruit'], [400, 'Operative'], [600, 'Field Agent'], [800, 'Cipher Clearance'],
               [1000, 'Delta Clearance'], [1300, 'Omega Clearance'], [1600, 'Alpine Clearance']];
  const moved = was.filter(([r, n]) => P.clearance({ pjcc_rating: r, credits: 0 }).name !== n);
  check('every pre-existing rung still sits at the rating it always did', moved.length === 0,
    moved.length ? moved.map(([r, n]) => r + ' should be ' + n).join(', ')
                 : was.map(([r, n]) => r + '→' + n.replace(' Clearance', '')).join(' · '));
}

/* ⚠ THE ONE THAT MATTERS. Rating-only would demote everybody who earned their rung on
   credits. Checked against the REAL credit ladder, rung by rung, at zero rating. */
{
  let demoted = [];
  P.RANKS.forEach((r, i) => {
    const c = P.clearance({ pjcc_rating: 0, credits: r.min });
    if (c.level < i + 1) demoted.push(r.name + ' → ' + c.name);
  });
  check('NOBODY IS DEMOTED — the credit rank is a floor, every rung', demoted.length === 0,
    demoted.join(', ') || 'all seven hold at zero rating');
}
{
  const topRating = TOP.rating, topCredits = P.RANKS[P.RANKS.length - 1].min, top = P.CLEARANCE.length;
  check('and the rating can only ever lift you above that floor',
    P.clearance({ pjcc_rating: topRating, credits: 0 }).level === top &&
    P.clearance({ pjcc_rating: 0, credits: topCredits }).level === top &&
    P.clearance({ pjcc_rating: topRating, credits: topCredits }).level === top,
    'either road reaches ' + TOP.name + ', and both together reach no further');
}
check('it says WHICH ladder gave you the rung', P.clearance({ pjcc_rating: 0, credits: 600 }).fromCredits === true
  && P.clearance({ pjcc_rating: 1350, credits: 0 }).fromCredits === false);
check('`next` and `toNext` are usable, and null at the top',
  P.clearance({ pjcc_rating: 500, credits: 0 }).toNext === 100 &&
  P.clearance({ pjcc_rating: 9999, credits: 0 }).next === null);

/* ⚠ THE FRAGMENTS DID NOT MOVE. rankFor() is the Subject Zero ladder and is credit-keyed;
   clearance is a display rank. If these two are ever merged, unlocked lore gets revoked. */
check('the Subject Zero ladder is untouched and still credit-keyed',
  P.rankFor(0).name === 'Recruit' &&
  P.rankFor(P.RANKS[P.RANKS.length - 1].min).name === TOP.name &&
  !!P.rankFor(600).frag, P.rankFor(600).name);
/* ⚠ A RUNG WITHOUT A FRAGMENT IS A DEAD REWARD. Climbing to it unlocks nothing and says
   nothing, which is worse than the rung not existing — so the two rungs added in the
   middle had to bring their own lore, and any future one does too. */
check('every rung above Recruit hands out a Subject Zero fragment',
  P.RANKS.every(r => typeof r.frag === 'string' && r.frag.length > 20),
  P.RANKS.length + ' rungs, ' + P.RANKS.filter(r => r.frag).length + ' fragments');
check('…and no two rungs hand out the same one',
  new Set(P.RANKS.map(r => r.frag)).size === P.RANKS.length);

/* ── 1b. THE GATE ON /characters/alpine/ ────────────────────────────────────────────
   The first time a clearance rung locks a PAGE rather than decorating a name. Two ways
   this breaks silently, and both are cheap to pin:
     · the page names a rung the ladder does not have  → levelOf() returns null → SEALED
     · someone inserts a rung and the gate was numbered → it re-points without a word     */
{
  const ALPINE = fs.readFileSync(path.join(ROOT, '_characters/alpine.md'), 'utf8');
  const LAYOUT = fs.readFileSync(path.join(ROOT, '_layouts/character.html'), 'utf8');
  const want = (ALPINE.match(/^clearance_required:\s*(.+)$/m) || [])[1];
  check('Bill Alpine\'s file declares the rung it wants, by name', !!want, want);
  check('…and that name resolves to the TOP of the ladder',
    P.levelOf(want) === P.CLEARANCE.length, want + ' → level ' + P.levelOf(want));
  check('…and the file is marked classified with a brief anyone may read',
    /^classified:\s*true/m.test(ALPINE) && /^classified_brief:\s*\S/m.test(ALPINE));
  check('the gate reads the rung NAME from front matter, never a hardcoded level',
    /data-need="\{\{ page\.clearance_required \}\}"/.test(LAYOUT) &&
    !/level\s*>=\s*\d/.test(LAYOUT), 'PJCC.levelOf(need) is the only resolution path');
  /* an unknown name must FAIL CLOSED — the alternative is a classified page hanging open */
  check('an unknown rung name resolves to nothing (so the gate stays sealed)',
    P.levelOf('Bogus Clearance') === null && P.levelOf('') === null && P.levelOf(null) === null);
  check('…while a bare rung word still resolves, since front matter is hand-typed',
    P.levelOf('alpine') === P.CLEARANCE.length && P.levelOf('omega') === P.CLEARANCE.length - 1);
  /* ⚠ THE THREE PAINTS. A profile reaches this page three ways and missing any one shows a
     signed-in operative their own locked door. onChange is the one that gets forgotten. */
  check('the gate paints now, on readiness, AND on sign-in/out',
    /PJCC\.ready\.then\(paint, paint\)/.test(LAYOUT) && /PJCC\.onChange\(paint\)/.test(LAYOUT) &&
    /\n  paint\(\);/.test(LAYOUT));
  check('…and it renders SEALED server-side, so scripting-off shows the lock not the file',
    /<div class="cls-file" id="cls-file" hidden>/.test(LAYOUT));
}

/* ── 2. THE PUZZLE ELO ────────────────────────────────────────────────────────────── */
{
  const { P: Q } = boot();
  check('a new solver starts at ' + Q.PUZZLE_START, Q.puzzleRating().rating === Q.PUZZLE_START);
  check('and has solved nothing', Q.puzzleRating().solved === 0);

  // beating a puzzle well above you must pay MORE than beating one below you — the whole
  // reason to replace the old ±0.34 ratchet with an Elo
  const hard = boot().P.settlePuzzle(1200, 1);
  const easy = boot().P.settlePuzzle(400, 1);
  check('a hard puzzle pays more than an easy one', hard.delta > easy.delta,
    `+${hard.delta} (1200) vs +${easy.delta} (400)`);
  check('and an easy one still pays something', easy.delta > 0, '+' + easy.delta);

  /* ⚑ A MISS COSTS WHAT A SOLVE PAYS (2026-08-10, Nate: "Misses should DECREASE your score
     equally"). This is THE assertion for that request, and it is stated at the player's own
     level because that is where "equally" has a definition: expected = 0.5, so ±k/2.
     ⚠ It must NOT hold at every rating — a win over a harder puzzle is supposed to pay more
     than missing one costs, which is the entire reason there is an expected score. Both
     halves are pinned, or a later "simplification" to a flat ±k would pass the first. */
  const win = boot().P.settlePuzzle(700, 1);
  const miss = boot().P.settlePuzzle(700, 0);
  check('a miss at your own level costs exactly what a solve pays', win.delta === -miss.delta,
    `+${win.delta} vs ${miss.delta}`);
  check('  …and a miss is a LOSS, not a smaller win', miss.delta < 0, miss.delta);
  const hardWin = boot().P.settlePuzzle(1200, 1);
  const hardMiss = boot().P.settlePuzzle(1200, 0);
  check('  …but missing a harder puzzle costs less than beating it pays',
    hardWin.delta > Math.abs(hardMiss.delta), `+${hardWin.delta} vs ${hardMiss.delta}`);
  check('REVEALING A SOLUTION LOSES RATING — you cannot hint your way up', miss.delta < 0, miss.delta);

  // K falls as you settle, or a veteran's rating is noise
  {
    const g = boot().P;
    const first = g.settlePuzzle(700, 1).k;
    for (let i = 0; i < 12; i++) g.settlePuzzle(700, 0.5);
    const mid = g.settlePuzzle(700, 1).k;
    for (let i = 0; i < 45; i++) g.settlePuzzle(700, 0.5);
    const late = g.settlePuzzle(700, 1).k;
    check('K falls as you settle (40 → 24 → 16)', first === 40 && mid === 24 && late === 16,
      `${first} → ${mid} → ${late}`);
  }

  // the seed lifts a returning player and never lowers anyone
  {
    const g = boot().P;
    g.seedPuzzleRating(1100);
    check('a returning player can be seeded UP', g.puzzleRating().rating === 1100);
    check('  …without it counting as a solve', g.puzzleRating().solved === 0, 'solved 0 keeps the seed one-shot');
    g.seedPuzzleRating(400);
    check('  …and a seed can never lower you', g.puzzleRating().rating === 1100, g.puzzleRating().rating);
  }

  // it survives a garbage rating rather than corrupting itself
  {
    const g = boot().P;
    const before = g.puzzleRating().rating;
    const r = g.settlePuzzle(null, 1);
    check('an unrated puzzle moves nothing', r.delta === 0 && g.puzzleRating().rating === before);
  }
}

/* ── 3. THE FORK ROOM WIRES ALL OF IT ─────────────────────────────────────────────── */
check('the room settles the rating on every solve', /PJCC\.settlePuzzle\(G\.p\.rating, score\)/.test(FORK));
/* ⚠ `aced` → `earned` (2026-08-04). The name changed when credit stopped being awarded for
   a hinted solve; these two regexes still named the old variable and went red on a rename
   that changed no behavior. Worth keeping as source assertions anyway — they are what
   pins the SCORES to the numbers written in the comment beside them — but they are now
   pointed at the one name the file actually uses. */
check('the room scores a puzzle 1 or 0 — nothing in between',
  /const score = earned \? 1 : 0;/.test(FORK));
// and the number the player watches while solving is the one the run already carries,
// not a fresh localStorage read on every frame
check('the play screen shows the rating without re-reading storage',
  /run\.stats\.rating \|\| run\.stats\.rating0/.test(FORK) && /ctx\.fillText\('Rating ' \+ myRating/.test(FORK));
check('the difficulty dial is DRIVEN by the rating', /run\.diff = ratingToDiff\(pzMove\.after\)/.test(FORK));
check('the old ±ratchet survives as the no-module fallback',
  /if \(!pzMove\) run\.diff = Math\.max\(1, Math\.min\(10, run\.diff \+ \(earned \? 0\.34 : -0\.7\)\)\)/.test(FORK));
/* ⚑ RE-FITTED 2026-08-10. The old pair (590 + 72d) was DERIVED on paper; this one was
   MEASURED, by sampling the real generator ten deep at each difficulty. That distinction
   is the bug: the derived map put difficulty 10 at a rating of 1310 while the generator's
   difficulty-10 puzzles rated 1490+, so the dial ran out of road and everybody above 1310
   was served the same puzzle forever — which is what "the puzzles seem way too easy" was.
   ⚠ It is a FIT to that generator, not a definition. Move the clutter or the motif mix and
   this goes stale; re-measure, then change both numbers here and in the room. */
check('the rating→difficulty map is the inverse of puzzleRating()',
  /return Math\.max\(1, Math\.min\(10, \(r - 473\) \/ 117\)\)/.test(FORK));

/* the map has to actually LAND on the generator's range, or the whole ladder is stranded
   at one end. Recomputed here from the shipped formula rather than trusted. */
{
  const ratingToDiff = r => Math.max(1, Math.min(10, (r - 473) / 117));
  const at = r => +ratingToDiff(r).toFixed(1);
  /* the top of the range moved with the fit: the hardest puzzles the generator makes now
     rate ~1640, so 1640 is where the dial should peg — not 1300, which is where it used to
     peg while the content kept going. The easy end is unchanged and has to stay that way,
     because "easy at first" is half of what he asked for. */
  check('700 serves an easy puzzle and 1640 serves the hardest', at(700) < 2.5 && at(1640) >= 9.5,
    `700→d${at(700)} · 1000→d${at(1000)} · 1300→d${at(1300)} · 1640→d${at(1640)}`);
}

/* ── 3b. A BOT SAYS WHAT IT IS ──────────────────────────────────────────────────────
   2026-08-05, Nate: "And what ratings are the bots? Not saying it's inaccurate but I kinda
   got smoked by the Medium bot. Perhaps I just played poorly."

   He didn't. The Park Tables regulars carried no rating at all — just Easy/Medium/Hard/Expert
   over hand-picked Stockfish skill numbers — and skill 6 plays ~1575, stronger than the
   Gauntlet's eighth floor. THE SAME BUG HE CAUGHT IN THE OTHER ROOM ON 2026-07-15 ("the Shogi
   Sentinel seems stronger than 800"), which was fixed there by driving skill from the
   ADVERTISED rating and never applied here.

   This section is the reason it cannot happen a third time. It is the ONLY test on the site
   that runs a shipped module for real rather than reading it, because the claim being made is
   about what a FUNCTION returns, not about what a file says. */
{
  const ENG = fs.readFileSync(path.join(ROOT, 'assets/js/pjcc-gauntlet-engine.js'), 'utf8');
  const sandbox = {};
  new Function('self', ENG).call(sandbox, sandbox);
  const E = sandbox.PJCCGauntletEngine;
  check('the engine bridge publishes the calibration', !!(E && E.skillForElo && E.blunderForElo),
    'one curve, in the file both rooms already load');

  /* the ten public floors, read straight out of the Gauntlet — the blunder curve has to
     reproduce the hand-authored personas or it is a second opinion, not the same curve */
  const GAME = fs.readFileSync(path.join(ROOT, 'assets/games/pjcc_gauntlet.html'), 'utf8');
  const rungs = [...GAME.matchAll(/elo:(\d+),[\s\S]{0,400}?persona:\{[^}]*blunder:([\d.]+)/g)]
    .map(m => [+m[1], +m[2]]).slice(0, 10);
  check('found the ten public floors to calibrate against', rungs.length === 10,
    rungs.map(r => r[0]).join(' · '));
  const off = rungs.filter(([elo, b]) => Math.abs(E.blunderForElo(elo) - b) > 0.0005);
  check('blunderForElo reproduces every floor\'s own persona', off.length === 0,
    off.length ? off.map(([e, b]) => e + ' wants ' + b + ', got ' + E.blunderForElo(e)).join(' | ')
               : 'the curve IS the ladder, not a second opinion about it');

  /* the Gauntlet keeps a local copy of skillForElo as its no-bridge fallback; if the two
     ever disagree, the game plays one strength with the engine and another without it */
  const local = /if \(elo < 1400\) return 0;\s*return Math\.min\(20, Math\.round\(3 \+ \(elo - 1400\) \* 0\.017\)\);/;
  check('the Gauntlet\'s fallback copy still matches the shared curve', local.test(GAME),
    'skill 0 under 1400 · 1400→3 · 2400→20');
  check('…and it prefers the shared one when the bridge is up',
    /ENGINE\.skillForElo\) return ENGINE\.skillForElo\(elo\)/.test(GAME));

  /* the park's four seats */
  const PT = fs.readFileSync(path.join(ROOT, 'games/park-tables/index.html'), 'utf8');
  /* ⚠ [^'] NOT \w — the bench has "The Dad" and "The CEO" on it since 2026-08-10, and a
     \w+ name pattern SKIPS a seat with a space in it rather than failing on it. A roster
     check that quietly counts six of seven is worse than no roster check at all: it was
     reporting five names here while seven were shipping. */
  const bots = [...PT.matchAll(/\{ name: '([^']+)',\s*icon: '.',\s*diff: '([^']+)',\s*elo: (\d+)/g)]
    .map(m => ({ name: m[1], diff: m[2], elo: +m[3] }));
  /* ⚑ THE COUNT IS CROSS-CHECKED, NOT HARD-CODED (2026-08-10). It used to assert `=== 7`,
     which had to be edited by hand the moment Auston came back — and a number a human edits
     to make a test pass is not a test. Both sides are now READ from the file by two
     unrelated patterns: the seat KEYS in the BOTS object, and the seats the roster regex
     above actually parsed. They can only agree if the regex saw every seat, which is the
     exact failure this check exists to catch. */
  const seatKeys = (PT.match(/var BOTS = \{[\s\S]*?\n  \};/) || [''])[0]
    .split('\n').filter(l => /^    \w+:\s*\{/.test(l)).length;
  check('the roster regex sees every seat in the BOTS object',
    seatKeys >= 4 && bots.length === seatKeys, bots.length + ' parsed of ' + seatKeys + ' declared');
  check('every park regular declares a rating', bots.length >= 8,
    bots.map(b => b.name + ' ' + b.diff + ' ' + b.elo).join(' · '));
  // ⚠ [^'] here too, for the same reason as the roster pattern above — `\w+` would skip
  //   "The Dad" and "The CEO", so a hand-set skill on either would sail through.
  check('…and none of them hand-sets skill or blunder any more',
    !/\{ name: '[^']+',[^}]*\b(skill|blunder):/.test(PT),
    'the rating is the only dial; skill and blunder are derived from it');
  /* ⚠ derived INSIDE the call that uses the bridge. Read at parse time it would work today
     and break silently the day a `defer` or a reorder lands on the head — every seat falling
     back to one strength, with no error to say so. */
  check('the dial is read at move time, not at parse time',
    /function botDial\(b\)\{[\s\S]{0,220}E\.skillForElo\(b\.elo\)/.test(PT) &&
    /PJCCGauntletEngine\.move\(S, botDial\(bot\)\)/.test(PT),
    'botDial() runs inside the same call that uses the engine');
  check('the ladder actually climbs',
    bots.every((b, i) => i === 0 || b.elo > bots[i - 1].elo),
    bots.map(b => b.elo).join(' → '));

  /* THE REGRESSION ITSELF. A seat labelled Easy or Medium that lands at skill 1 or more is
     1400+ by definition — i.e. stronger than the Gauntlet's Vice President, on a card that
     says "Medium". That is exactly what he ran into. */
  const tooStrong = bots.filter(b => /Easy|Medium/.test(b.diff) && E.skillForElo(b.elo) > 0);
  check('no Easy or Medium seat is secretly 1400+', tooStrong.length === 0,
    tooStrong.length ? tooStrong.map(b => b.name + ' ' + b.diff + ' → skill ' + E.skillForElo(b.elo)).join(', ')
                     : bots.filter(b => /Easy|Medium/.test(b.diff)).map(b => b.name + ' ' + b.elo).join(' · '));
  /* ⚑ THE TOP SEAT MOVED 2026-08-10. Robert came down to 1800 to make room for Princess
     (2100) and the CEO (2400) above him, so "full strength" is the CHAMPION seat now. The
     assertion follows the LADDER rather than the name, which is the whole point of it. */
  check('the top seat is still full strength',
    bots.some(b => b.diff === 'Champion' && E.skillForElo(b.elo) === 20), 'The CEO, 2400 — Nate\'s call');
  /* ⚠ A LOCKED SEAT MUST BE REACHABLE. A `locked` naming a bot that is not on the bench is
     a door with no key — the card renders, says "Beat <nobody>", and never opens. */
  const locks = [...PT.matchAll(/locked: '(\w+)'/g)].map(m => m[1]);
  const ids = [...PT.matchAll(/^ {4}(\w+):\s*\{ name:/gm)].map(m => m[1]);
  check('every locked seat names a bot you can actually beat',
    locks.length > 0 && locks.every(l => ids.indexOf(l) >= 0),
    locks.length ? locks.join(' · ') + '   (bench: ' + ids.join(' ') + ')' : 'no locked seats found');
  check('…and a win is what records the unlock',
    /if \(st\.result === '1-0'\) \{[\s\S]{0,220}markBeaten\(st\.bot\)/.test(PT),
    'botFinish writes the win that opens the next door');

  /* and the number has to be ON SCREEN — an unadvertised rating is what drifted */
  check('the bot card prints the rating', /b\.diff \+ ' · ' \+ b\.elo/.test(PT));
  check('…and so does the nameplate at the table', /bot\.elo \+ ' · ' \+ esc\(bot\.diff\)/.test(PT));
}

/* ── 4. THE REPORT PIPE ───────────────────────────────────────────────────────────── */
{
  const g = boot().P;
  g.reportPuzzle({ fen: '8/8/8/8/8/8/8/K6k w - - 0 1' }).then(r => {
    check('reporting with no database RESOLVES rather than throwing', r && r.ok === false, r && r.reason);

    check('the room sends the engine verdict with the report', /verdict: c \? c\.verdict : 'none'/.test(FORK));
    check('a claimed second mate is captured even though the player was RIGHT',
      /verdict: 'mates'/.test(FORK), 'that is a hole in secondSolution(), not a difference of opinion');
    check('the refutation hands its own numbers to the report',
      /verdict: 'agrees'/.test(FORK) && /verdict: 'refuted'/.test(FORK));
    check('a stale verdict cannot attach to the next puzzle',
      /lastClaim\.for === G\.p/.test(FORK), 'the claim is scoped to the puzzle it was made on');
    check('the Email/Copy pair is kept as the fallback',
      /rep-mail/.test(FORK) && /rep-copy/.test(FORK));
    check('and a failed send SAYS so instead of swallowing it',
      /Could not send it from here/.test(FORK));

    // the four verdicts the room can produce must be exactly the four the SQL documents
    const doc = fs.readFileSync(path.join(ROOT, 'docs/puzzle-reports-setup.md'), 'utf8');
    ['agrees', 'mates', 'refuted', 'none'].forEach(v => {
      check(`the setup doc explains the "${v}" verdict`, doc.indexOf("'" + v + "'") > -1 || doc.indexOf('`' + v + '`') > -1);
    });
    check('the insert is anon-friendly (a stranger may report)', /to anon, authenticated with check \(true\)/.test(doc));
    check('but reading is the Creator alone', /for select to authenticated/.test(doc) && /creator_id/.test(doc));

    console.log(`\n  ${pass} passed, ${fail} failed\n`);
    process.exit(fail ? 1 : 0);
  });
}
