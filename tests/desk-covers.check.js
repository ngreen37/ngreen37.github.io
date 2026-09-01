/* ═══════════════════════════════════════════════════════════════════════════════════
 * THE DESK COVERS YOU — the gate on one rule (2026-08-13)
 * -----------------------------------------------------------------------------------
 * The town wire reports the visitor's own results. Nate's correction, on the Night Desk
 * getting things slightly wrong: "when the ticker refers to a user's accomplishment or
 * anything about the user, it should be accurate. Random thought ticker notes for the
 * night desk can be slightly wrong." So the overnight employee's personality is TONE
 * only, and every number on the wire is a number somebody really has.
 *
 * ⚠ THIS FILE TESTS THE MECHANISM, NEVER THE WORDING. The lines in `LINES` are his to
 * rewrite whenever he likes, and a test that asserted his phrasing would fail on the
 * first rewrite and teach him that changing his own copy breaks the build. What it does
 * assert is the shape the accuracy rule needs and that no rewrite can quietly undo:
 *
 *   §1  a fact with no record behind it is never spoken
 *   §2  a template placeholder with no value DROPS the line — braces never ship
 *   §3  a lapsed streak, an unsolved puzzle room and a zero best say NOTHING, rather
 *       than saying "0" or reporting the ladder's starting rating as a result
 *   §4  no figure reaches the wire that the record did not put there — on EITHER desk
 *   §5  nobody is at the desk on an away night, so nothing about you is filed
 *   §6  the local pass goes first, so a signed-in player's PLAY is not pushed off the
 *       wire by a credit balance that has not moved all week
 *
 * ⚠ THE REAL BLOCK IS EXTRACTED FROM _layouts/home.html, VERBATIM, not retyped here —
 * same reason as tests/townsky.check.js: a test that reimplements the code it is testing
 * only proves the test works. The block is cut out by its own comment banner and run
 * against stubs for the two things it reaches for outside itself (PJCCTicker and PJCC).
 * ═══════════════════════════════════════════════════════════════════════════════════ */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const { findChrome } = require('./harness');
const ROOT = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

let pass = 0, fail = 0;
const check = (n, c, d) => {
  if (c) { pass++; console.log('  ✓ ' + n + (d !== undefined ? '   ' + d : '')); }
  else { fail++; console.log('  ✗ ' + n + (d !== undefined ? '   ' + d : '')); }
};

console.log('\n── THE DESK COVERS YOU ───────────────────────────────────\n');

const HOME = read('_layouts/home.html');

/* ── the block itself is still on the page, and still wired to the wire ─────────────── */
const a = HOME.indexOf('/* ═══ THE DESK COVERS YOU');
const b = HOME.indexOf('// RECORD WATCH —');
check('the block is still in the home layout', a > -1 && b > a,
  a > -1 ? (b - a) + ' chars' : 'GONE — the feature has been deleted or renamed');
if (a < 0 || b < a) { console.log('\n  ' + pass + ' passed, ' + (fail + 1) + ' failed\n'); process.exit(1); }
const BLOCK = HOME.slice(a, b);

check('it reads the games registry rather than a second list of game names',
  /window\.PJCC_GAMES/.test(BLOCK) && /pjcc-games-data\.js/.test(HOME),
  'the display name, the score key and the unit word all come from one place');
check('a game nobody can reach is never headlined',
  /playable === false/.test(BLOCK) && /locked/.test(BLOCK) && /'terminated'/.test(BLOCK));
check('the wire carries its own class, so the color rule can find it',
  /ticker-item--yours/.test(BLOCK) && /\.ticker-item--yours/.test(read('_sass/_pjcc-07-characters.scss')));

(async () => {
  const exe = findChrome();
  if (!exe) { console.log('\n  (no Chrome found — skipping the browser half)'); return done(); }
  const browser = await puppeteer.launch({ executablePath: exe, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on('request', (r) => r.respond({ status: 200, contentType: 'text/html',
    body: '<!doctype html><html><head><meta charset="utf-8"></head><body></body></html>' }));
  await page.goto('https://chesswild.com/pjcc/', { waitUntil: 'domcontentloaded' });

  /* One run of the shipped block against a stated player, at a stated desk. The stubs
     mirror what the real modules hand back — a stub that carries less than the real
     thing is how a broken feature tests green. */
  const run = (world) => page.evaluate((src, w) => {
    window.__said = [];
    window.PJCCTicker = {
      desk: { on: !!w.night, away: !!w.away },
      seed: () => w.seed || 0,
      span: () => 24,
      slotAhead: () => 3,
      place: (text, cls) => window.__said.push({ text, cls })
    };
    window.__gauntletProg = w.gauntlet || null;
    window.PJCC_GAMES = [
      { slug: 'sky-run', name: 'Sky Run', cat: 'arcade', score: ['sky-run', 'score'] },
      { slug: 'sand-mine-depths', name: 'Sand Mine Depths', cat: 'arcade', score: ['sand-mine-depths', 'points'] },
      { slug: 'battle-room', name: 'The Battle Room', cat: 'terminated', playable: false, score: ['battle-room', 'score'] }
    ];
    window.PJCC = {
      ready: Promise.resolve(true),
      CLEARANCE: [1, 2, 3, 4, 5, 6, 7, 8, 9].map((l) => ({ level: l, name: 'Rung ' + l })),
      getProfile: () => w.profile || null,
      currentUser: () => (w.profile ? { id: 'u1' } : null),
      localBest: (g) => (w.bests && w.bests[g]) || 0,
      myStats: () => Promise.resolve(w.stats || []),
      streakInfo: () => w.streak || { current: 0, best: 0, last: '', playedToday: false },
      puzzleRating: () => w.puzzle || { rating: 700, solved: 0, peak: 700 },
      rankFor: () => ({ name: 'Field Agent' }),
      clearance: () => w.clearanceRung || { level: 1, name: 'Recruit' }
    };
    try {
      localStorage.clear();
      if (w.codename) localStorage.setItem('pjcc.codename', w.codename);
      /* ⚑ 2026-09-01 — the prep-failure record is the first fact this block reads straight
         out of localStorage rather than through a PJCC method, because the Park Tables owns
         it and there is no reader to stub. Seeded here so the digits check below has
         something real to be about. */
      if (w.prep) localStorage.setItem('pjcc.pt.prep.v1', JSON.stringify(w.prep));
    } catch (e) {}
    eval(src);
    return new Promise((res) => setTimeout(() => res(window.__said), 60));
  }, BLOCK, world);

  const PLAYER = {
    gauntlet: { cleared: 3, cur: 3, names: ['One', 'Two', 'Three', 'The Shogi Sentinel', 'Five'] },
    streak: { current: 6, best: 9, last: '2026-08-13', playedToday: true },
    puzzle: { rating: 1042, solved: 37, peak: 1060 },
    bests: { 'sky-run': 812, 'battle-room': 9999 }
  };
  const texts = (said) => said.map((s) => s.text).join(' ∥ ');

  /* ── §1 + §3. NOTHING TO SAY IS SAID AS NOTHING ─────────────────────────────────── */
  let r = await run({});
  check('a first-ever visitor is told nothing about themselves', r.length === 0, texts(r) || '(silent)');

  r = await run({ streak: { current: 0, best: 9, last: '2026-07-01', playedToday: false },
                  puzzle: { rating: 700, solved: 0, peak: 700 }, bests: { 'sky-run': 0 } });
  check('a lapsed streak, an unsolved room and a zero best all say nothing',
    r.length === 0, texts(r) || '(silent — no "0", no starting rating reported as a result)');

  /* ── §2. A PLACEHOLDER WITH NO VALUE DROPS THE LINE ─────────────────────────────── */
  r = await run(PLAYER);
  check('a real player is covered', r.length > 0, r.length + ' line(s)');
  check('…and no unfilled placeholder ever reaches the wire',
    !/[{}]/.test(texts(r)), texts(r).slice(0, 90) + '…');
  check('…each on the personal class, so it reads as being about you',
    r.every((s) => s.cls === 'ticker-item--yours'));
  check('…one subject per line, never the same subject twice',
    new Set(r.map((s) => s.text.replace(/[0-9]+/g, '#'))).size === r.length);

  /* a terminated game's local best is on this device and must never be headlined */
  check('a retired game is not headlined even with a score on file',
    !/BATTLE ROOM/i.test(texts(r)), '9999 on battle-room, and the wire does not mention it');

  /* ── §4. THE NIGHT VOICE IS A DIFFERENT REGISTER, NOT A DIFFERENT RECORD ────────── */
  /* THE ONE RULE, STATED AS A TEST: every figure on a personal line is a figure this
     player actually has. Not "the night says as much as the day" — a terser overnight
     line is fine, and holding the two voices to the same word count would be a rule about
     style rather than truth. What is checked is that no digit reaches the wire that the
     record did not put there, which is exactly what invents or inflates an accomplishment.
     ⚠ If this ever fails on a REWRITE that only added flavor ("two hours left on this
     shift"), the fix is to spell that number as a word — the digits on these lines belong
     to the player. */
  const TRUE_OF_PLAYER = ['3', '5', '6', '1042', '37', '812'];   // cleared·floors·streak·rating·solved·best
  const day = await run(PLAYER);
  const night = await run(Object.assign({ night: true }, PLAYER));
  const invented = (said) => (texts(said).match(/\d+/g) || []).filter((d) => TRUE_OF_PLAYER.indexOf(d) < 0);
  check('the Night Desk speaks in its own voice', texts(day) !== texts(night));
  check('…and the day desk states nothing this player does not have',
    invented(day).length === 0, invented(day).join(',') || 'every figure is theirs');
  check('…and neither does the night desk, however bored it sounds',
    invented(night).length === 0, invented(night).join(',') || 'every figure is theirs');

  /* ── §4b. THE PREP THAT DID NOT HOLD (2026-09-01) ───────────────────────────────
     The one line on this wire that reports something going BADLY, which makes it the one
     with the most ways to be wrong. Three of them are tested: that it is news at all, that
     it stops being news, and that its figures are the record's own. */
  {
    const PREP = { name: 'Pirc, 150 Attack', bot: 'Robert', move: 4, at: Date.now() };
    /* ⚠⚠ ON ITS OWN, NOT ON TOP OF PLAYER, AND THE FIRST VERSION GOT THIS WRONG. The wire
       places LIMIT (3) lines from a seeded rotation, so a sixth fact stacked behind a
       gauntlet climb, a streak, a puzzle rating and two personal bests simply never gets a
       slot — and the check reported "(silent)" as though the feature were broken. It is a
       player who has only played at the tables, which is a real player. */
    const findLine = (rows) => rows.map((s) => s.text).find((t) => /PREP WATCH|DID NOT HOLD/.test(t)) || '';
    let pr = await run({ prep: PREP });
    const pline = findLine(pr);
    check('a defeat inside your own opening reaches the wire', !!pline, pline || '(silent)');
    check('…naming the line, the opponent and where theory ran out',
      !!pline && /150 ATTACK/.test(pline) && /ROBERT/.test(pline) && /\bMOVE 4\b/.test(pline), pline);
    /* the night shift tells the same fact in its own register */
    const pnight = findLine(await run({ prep: PREP, night: true }));
    check('…and the night desk files it too, in its own voice',
      !!pnight && pnight !== pline, pnight.slice(0, 76) + '…');

    /* ⚠⚠ THE OPENING'S NAME CARRIES A DIGIT, AND THAT IS WHY THIS CASE USES IT. "Pirc, 150
       Attack" is a real name in pjcc-openings.js, so 150 lands on the wire without being a
       claim about the player at all — and the blanket rule is "no figure the record did not
       put there". Rather than bless 150 by hand, the allowed set is DERIVED from the record,
       which is what the rule actually means. */
    const allowed = (JSON.stringify(PREP).match(/\d+/g) || [])
      .concat(TRUE_OF_PLAYER).concat([String(PREP.move)]);
    /* ⚠ GUARDED ON THE LINE EXISTING. Run against the empty string this passed unanimously
       and proved nothing — the same shape as the aura check that once reported "1 distinct
       color ✓" over nine nulls. [[green-must-name-what-ran]] */
    const stray = ((pline.match(/\d+/g) || []).filter((d) => allowed.indexOf(d) < 0));
    check('…and every digit on the line came out of the record',
      !!pline && stray.length === 0,
      !pline ? 'NOT ASKED — no line to read' :
        (stray.join(',') || 'the name\'s own 150, the opponent, and move ' + PREP.move));

    /* it is NEWS, and news expires — a fortnight-old defeat on the wire is a grudge */
    pr = await run({ prep: Object.assign({}, PREP, { at: Date.now() - 14 * 864e5 }) });
    check('…and a fortnight-old defeat is not news any more', !findLine(pr), '(silent, correctly)');

    /* ⛑⛑ THE FIRST VERSION OF THIS CHECK PASSED FOR THE WRONG REASON, and a mutation said
       so: dropping the guard in localFacts left it green, because fill() drops any line
       with an EMPTY placeholder and a record with no bot has one. The guard's real job is
       the case fill() cannot see: a move number of 0 is not missing, it is a number, and
       it would print THEORY HELD TO MOVE 0, which is a sentence the player's record does not
       support. That is the case now tested. [[green-must-name-what-ran]] */
    pr = await run({ prep: { name: 'Pirc Defense', bot: 'Robert', move: 0, at: Date.now() } });
    check('…and a move number of ZERO is refused, where a missing one would slip through',
      !findLine(pr), 'fill() sees 0 as a value; MOVE 0 is not a fact anybody has');
    pr = await run({ prep: { name: 'Pirc Defense', at: Date.now() } });
    check('…and a record with no opponent says nothing either',
      !findLine(pr), 'this one fill() would also catch — both doors shut');
  }

  /* ── §5. AN EMPTY DESK FILES NOTHING ────────────────────────────────────────────── */
  r = await run(Object.assign({ night: true, away: true }, PLAYER));
  check('on a night he has left the desk, nothing about you is filed',
    r.length === 0, texts(r) || '(silent)');

  /* ── §6. THE LOCAL PASS GOES FIRST ──────────────────────────────────────────────── */
  r = await run(Object.assign({ codename: 'Vesper',
    profile: { codename: 'Vesper', credits: 730, pjcc_rating: 918, rated_games: 22 },
    clearanceRung: { level: 5, name: 'Theta Clearance' } }, PLAYER));
  check('a signed-in player is named on the wire', /VESPER/.test(texts(r)), texts(r).slice(0, 70) + '…');
  check('…and their PLAY is not pushed off it by their balance',
    /GAUNTLET|DAYS|PUZZLE/i.test(texts(r)),
    'the account pass must not win the slots the local pass fills');

  /* the cross-device rule: this laptop has 812, the account has 1290, the wire says 1290 */
  r = await run({ codename: 'Vesper', profile: { codename: 'Vesper', credits: 0 },
                  bests: { 'sky-run': 812 }, stats: [{ game: 'sky-run', best_score: 1290, plays: 40 }] });
  check('a best set on another device is the one reported',
    /1290/.test(texts(r)) && !/812/.test(texts(r)), texts(r) || '(silent)');

  await browser.close();
  done();
})().catch((e) => { console.error('\nABORT: ' + e.message); process.exit(2); });

function done() {
  console.log('\n  ' + pass + ' passed, ' + fail + ' failed\n');
  process.exit(fail ? 1 : 0);
}
