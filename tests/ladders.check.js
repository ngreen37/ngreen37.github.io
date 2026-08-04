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
check('seven rungs, RECRUIT → ABOVE OMEGA', P.CLEARANCE.length === 7,
  P.CLEARANCE.map(c => c.name).join(' · '));
check('the rating thresholds ascend',
  P.CLEARANCE.every((c, i) => i === 0 || c.rating > P.CLEARANCE[i - 1].rating),
  P.CLEARANCE.map(c => c.rating).join(' '));
check('every rung has its own pip glyph',
  new Set(P.CLEARANCE.map(c => c.pip)).size === 7, P.CLEARANCE.map(c => c.pip).join(' '));
check('a guest reads as Recruit, not as an error', P.clearance(null).level === 1, P.clearance(null).name);
check('the Park Tables starting rating is still Recruit',
  P.clearance({ pjcc_rating: 250, credits: 0 }).level === 1,
  '250 → ' + P.clearance({ pjcc_rating: 250, credits: 0 }).name);
check('a strong rating climbs it', P.clearance({ pjcc_rating: 1350, credits: 0 }).level === 6,
  '1350 → ' + P.clearance({ pjcc_rating: 1350, credits: 0 }).name);

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
check('and the rating can only ever lift you above that floor',
  P.clearance({ pjcc_rating: 1600, credits: 0 }).level === 7 &&
  P.clearance({ pjcc_rating: 0, credits: 1200 }).level === 7 &&
  P.clearance({ pjcc_rating: 1600, credits: 1200 }).level === 7);
check('it says WHICH ladder gave you the rung', P.clearance({ pjcc_rating: 0, credits: 600 }).fromCredits === true
  && P.clearance({ pjcc_rating: 1350, credits: 0 }).fromCredits === false);
check('`next` and `toNext` are usable, and null at the top',
  P.clearance({ pjcc_rating: 500, credits: 0 }).toNext === 100 &&
  P.clearance({ pjcc_rating: 9999, credits: 0 }).next === null);

/* ⚠ THE FRAGMENTS DID NOT MOVE. rankFor() is the Subject Zero ladder and is credit-keyed;
   clearance is a display rank. If these two are ever merged, unlocked lore gets revoked. */
check('the Subject Zero ladder is untouched and still credit-keyed',
  P.rankFor(0).name === 'Recruit' && P.rankFor(1200).name === 'Above Omega' &&
  !!P.rankFor(600).frag, P.rankFor(600).name);

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

  // ⚠ THE HINT LOCK
  const aced = boot().P.settlePuzzle(700, 1);
  const tried = boot().P.settlePuzzle(700, 0.6);
  const shown = boot().P.settlePuzzle(700, 0.25);
  check('aced > solved-after-a-wrong-try > revealed', aced.delta > tried.delta && tried.delta > shown.delta,
    `${aced.delta} > ${tried.delta} > ${shown.delta}`);
  check('REVEALING A SOLUTION LOSES RATING — you cannot hint your way up', shown.delta < 0, shown.delta);
  check('  …but solving it after one wrong move does not punish you', tried.delta >= 0, tried.delta);

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
   that changed no behaviour. Worth keeping as source assertions anyway — they are what
   pins the SCORES to the numbers written in the comment beside them — but they are now
   pointed at the one name the file actually uses. */
check('the three scores are the ones documented',
  /const score = earned \? 1 : \(G\.revealed \? 0\.25 : 0\.6\)/.test(FORK));
check('the difficulty dial is DRIVEN by the rating', /run\.diff = ratingToDiff\(pzMove\.after\)/.test(FORK));
check('the old ±ratchet survives as the no-module fallback',
  /if \(!pzMove\) run\.diff = Math\.max\(1, Math\.min\(10, run\.diff \+ \(earned \? 0\.34 : -0\.7\)\)\)/.test(FORK));
check('the rating→difficulty map is the inverse of puzzleRating()',
  /return Math\.max\(1, Math\.min\(10, \(r - 590\) \/ 72\)\)/.test(FORK));

/* the map has to actually LAND on the generator's range, or the whole ladder is stranded
   at one end. Recomputed here from the shipped formula rather than trusted. */
{
  const ratingToDiff = r => Math.max(1, Math.min(10, (r - 590) / 72));
  const at = r => +ratingToDiff(r).toFixed(1);
  check('700 serves an easy puzzle and 1300 serves the hardest', at(700) < 2.5 && at(1300) >= 9.5,
    `700→d${at(700)} · 900→d${at(900)} · 1100→d${at(1100)} · 1300→d${at(1300)}`);
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
