/* REDUCE MOTION HAS TO BE A SWITCH, BOTH WAYS.
 * Nate: "when the page STARTS in reduce motion, and then you try to go back to normal,
 * nothing happens. But when it starts normal, you can toggle the rain back and forth."
 * Serves the repo, grafts the local weather files onto a live page, and drives the real
 * toggle button in both starting states — checking the FRAME LOOP, not just the class,
 * because a canvas hidden by display:none is still drawing. */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const { findChrome } = require('./harness');
const REPO = path.join(__dirname, '..');
const LOCAL = {
  'pjcc-weather-canvas.js': fs.readFileSync(path.join(REPO, 'assets/js/pjcc-weather-canvas.js'), 'utf8'),
  'pjcc-weather.js': fs.readFileSync(path.join(REPO, 'assets/js/pjcc-weather.js'), 'utf8'),
  'pjcc-eggs.js': fs.readFileSync(path.join(REPO, 'assets/js/pjcc-eggs.js'), 'utf8')
};
const URL = 'https://chesswild.com/pjcc/?wx=rain';

let pass = 0, fail = 0;
const ok = (n, c, x) => { if (c) { pass++; console.log('  \u2713 PASS  ' + n); }
                          else { fail++; console.log('  \u2717 FAIL  ' + n + (x ? '   ' + JSON.stringify(x) : '')); } };

/* \u2550\u2550 THE FORECAST'S OWN NUMBERS, AND THE OPT-OUT \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
   Source-read, before the browser half. Three things here are the kind that drift without
   ever throwing: how often it rains, how hard heavy rain falls, and whether a page that
   asked for no weather actually gets none.

   \u26a0 THE RAIN RATE IS A FACE COUNT, NOT A MEASUREMENT. Running the clock over N dates
   samples a hash and lands a few tenths off every time, which is fine for a sanity check
   and useless as an assertion \u2014 so the DIE is what gets pinned. Halving it twice has now
   meant a finer die twice (d10 \u2192 d40 \u2192 d80), and each time every OTHER band had to be
   re-expressed just to stand still. That is the failure this guards: mist has been
   rewritten twice to keep the same 10%, and the pass that forgets it doubles mist silently
   while the release notes say "we changed the rain". */
{
  const CLOCK = fs.readFileSync(path.join(REPO, '_includes/pjcc-time.js'), 'utf8');
  const die = CLOCK.match(/var r(\d+) = daySeed\(\) % (\d+);/);
  const bands = CLOCK.match(/var kind = r\d+ <= (\d+) \? 'rain' : \(r\d+ <= (\d+) \? 'mist' : 'clear'\);/);
  ok('the forecast rolls one die, read from the clock', !!die && !!bands, { die: die && die[2] });

  const faces = die ? +die[2] : 0;
  const wetFaces = bands ? +bands[1] + 1 : 0;              // rain on 0..N inclusive
  const mistFaces = bands ? +bands[2] - +bands[1] : 0;
  const pct = (f) => +((f / faces) * 100).toFixed(4);

  ok('rain is 11.25% of days \u2014 half of the 22.5% it was', pct(wetFaces) === 11.25,
     { faces, wetFaces, pct: pct(wetFaces) + '%' });
  ok('   and mist is still exactly 10%, re-expressed to hold still', pct(mistFaces) === 10,
     { mistFaces, pct: pct(mistFaces) + '%' });
  /* snow is not a second forecast \u2014 it is rain wearing winter, which is why halving rain
     halved snow with no second edit. If this line ever grows its own roll, that breaks. */
  ok('   and snow is still that same rain, not a second roll',
     /if \(kind === 'rain' && season\(\) === 'winter'\) kind = 'snow';/.test(CLOCK));
  /* `roll` is documented 0-9 at the top of the module; the divisor has to track the die or
     a finer die quietly starts reporting 0-19. */
  ok('   and the reported roll still fits its documented 0-9 shape',
     new RegExp('roll: \\(r' + faces + ' / ' + (faces / 10) + '\\) \\| 0').test(CLOCK),
     { faces, divisor: faces / 10 });

  /* ══ HOW HARD IT COMES DOWN ════════════════════════════════════════════
     Six numbers in one table, and every one of them is a thing Nate asked for by name on a
     specific day. They are asserted INDIVIDUALLY rather than as one table match, because a
     single assertion over the whole row cannot say WHICH number moved — and every pass here
     has moved exactly one or two of them while leaving the rest deliberately alone. */
  const CANVAS = fs.readFileSync(path.join(REPO, 'assets/js/pjcc-weather-canvas.js'), 'utf8');
  const table = CANVAS.match(/var MULT = \{ rain: \[([\d.]+), ([\d.]+), ([\d.]+)\], snow: \[([\d.]+), ([\d.]+), ([\d.]+)\]/);
  const R = table && table.slice(1, 4).map(Number), S = table && table.slice(4, 7).map(Number);
  ok('the intensity table still has a rain row and a snow row', !!table, table && { rain: R, snow: S });
  ok('heavy rain is 1.17 \u2014 10% off the 1.3 it was (2026-08-13)', !!R && R[2] === 1.17, R && R[2]);
  ok('   and NORMAL rain is 0.8 \u2014 20% lighter (2026-08-20)', !!R && R[1] === 0.8, R && R[1]);
  ok('   and light rain was left where it was', !!R && R[0] === 0.55, R && R[0]);
  ok('heavy snow is 1.3 \u2014 10% heavier (2026-08-20)', !!S && S[2] === 1.3, S && S[2]);
  ok('   and light/medium snow were left where they were', !!S && S[0] === 0.55 && S[1] === 0.95,
     S && [S[0], S[1]]);
  /* ⚠ THE INVERSION IS INTENTIONAL AND THIS RECORDS IT. Heavy snow now sits ABOVE heavy
     rain, which reverses the 2026-07-28 intent that snow land just under it. He has moved
     snow up twice with rain sitting where it sits, so this asserts the state he asked for
     rather than the older rule — and it will fail the day somebody "fixes" the inversion
     without him. */
  ok('   — and heavy snow is knowingly the loudest weather on the site', !!R && !!S && S[2] > R[2],
     R && S && (S[2] + ' snow vs ' + R[2] + ' rain'));

  /* ══ MIST YOU CAN ACTUALLY SEE ═════════════════════════════════════════
     2026-08-20, Nate: "the mist doesn't appear? I don't really see it." It was drawing the
     whole time — measured at a PEAK canvas alpha of 35/255 across 79% of the screen, under
     the noise floor of the sky it sat on. A number that quiet is exactly the kind that gets
     "tidied" back down by a later perf pass, so the floor is pinned. */
  const mistSpec = CANVAS.match(/mist: \{ n: (\d+), r: \[(\d+), (\d+)\], vx: \[[\d, ]+\], alpha: \[([\d.]+), ([\d.]+)\] \}/);
  ok('mist still has a spec row', !!mistSpec, mistSpec && mistSpec[0]);
  ok('   its alpha floor is at least double the 0.05 nobody could see',
     !!mistSpec && +mistSpec[4] >= 0.10, mistSpec && mistSpec[4]);
  ok('   its alpha ceiling is at least double the 0.13 nobody could see',
     !!mistSpec && +mistSpec[5] >= 0.24, mistSpec && mistSpec[5]);
  ok('   and there are more banks than the 11 there were', !!mistSpec && +mistSpec[1] >= 15,
     mistSpec && mistSpec[1]);

  /* \u26a0 `no_sky` MUST REMOVE THE ENGINE, NOT HIDE THE CANVAS. display:none does not stop a
     rAF loop \u2014 that is why the reduced-motion guard lives inside the engine \u2014 so a page
     that merely hid the weather would still pay for every frame of it. Both halves are
     checked because they own different pixels: the layout owns the sky backdrop, and
     pjcc-weather.js BUILDS the overlay wash, the fall layer and the glass. */
  const LAYOUT = fs.readFileSync(path.join(REPO, '_layouts/default.html'), 'utf8');
  const TW = fs.readFileSync(path.join(REPO, '_includes/town-weather.html'), 'utf8');
  ok('no_sky drops the sky ELEMENT', /\{% unless page\.no_sky %\}\{% include town-sky\.html %\}\{% endunless %\}/.test(LAYOUT));
  ok('   and never loads the weather ENGINE (hiding it would not stop rAF)',
     /\{%-? ?unless page\.no_sky ?-?%\}[\s\S]*pjcc-weather\.js[\s\S]*\{%-? ?endunless ?-?%\}/.test(TW));
  ok('   while the town clock stays on every page \u2014 other modules read it',
     /<script>\{% include pjcc-time\.js %\}<\/script>/.test(TW) &&
     TW.indexOf('pjcc-time.js') < TW.indexOf('unless page.no_sky'));
  /* the two Alpine files are the reason the flag exists; if a rename loses the flag the
     weather comes back and nothing else complains */
  ['_characters/alpine.md', 'classified.md'].forEach((f) => {
    ok('   ' + f + ' opts out', /^no_sky: true$/m.test(fs.readFileSync(path.join(REPO, f), 'utf8')));
  });
  console.log('');
}

/* ══ THE SKY OVER THE WEATHER — 2026-08-20 ═══════════════════════════════════
   Nate, in one message: "the heavy rain and heavy snow should be cloudy because it looks
   weird with clear skies — same with the rain/snow but that could be less cloudy" AND
   "clear should be exactly that. Clear. There are clouds on it currently."

   Those read as opposite complaints. They were the same bug twice: `?wx=` changed what
   FALLS and never touched the cover class, so every preview wore whatever the day had
   rolled — and on top of that the deck was culled by CSS on every page but /pjcc/, so
   rain fell out of a bare sky everywhere else. Neither half throws, neither half shows up
   in a data check, and each half hides the other: measured before the fix, /?wx=rain,heavy
   had `cloud-3` on <html> and `display:none` on the deck at the same time.

   ⚠⚠ SO THE BROWSER HALF BELOW REBUILDS THE PAGE FROM LOCAL SOURCES. The cover class is
   stamped by an INLINED head script and the cull is in the COMPILED stylesheet — both are
   Jekyll-built, so grafting the two weather .js files (which is all the rest of this file
   needs) would have tested the DEPLOYED head and the DEPLOYED CSS against local JS and
   reported green on a change that had not shipped. A gate that cannot see the file it is
   guarding is worse than no gate. ══════════════════════════════════════════ */
const CLOCK_SRC = fs.readFileSync(path.join(REPO, '_includes/pjcc-time.js'), 'utf8');
const SKY_HTML = fs.readFileSync(path.join(REPO, '_includes/town-sky.html'), 'utf8');
const CITY_SVG = fs.readFileSync(path.join(REPO, '_includes/town-city.svg'), 'utf8');
const SKY_SCSS = fs.readFileSync(path.join(REPO, '_sass/_pjcc-20-town-sky.scss'), 'utf8');
const TW_HTML = fs.readFileSync(path.join(REPO, '_includes/town-weather.html'), 'utf8');
const HEAD_JS = (TW_HTML.match(/<script>try\{var T=window\.PJCC_TIME;[\s\S]*?<\/script>/) || [''])[0];

/* Load the REAL clock module into this process, with a stubbed Date so a whole year of
   Checker Town can be walked without waiting for it. */
function loadClock(dateStr) {
  const RealDate = Date;
  const sandbox = { window: {}, Intl: Intl, Math: Math };
  if (dateStr) {
    const fixed = new RealDate(dateStr + 'T15:00:00Z');
    function FakeDate() { return new RealDate(fixed); }
    FakeDate.prototype = RealDate.prototype;
    FakeDate.now = () => fixed.getTime();
    sandbox.Date = FakeDate;
  } else sandbox.Date = RealDate;
  const fn = new Function('window', 'Date', 'Intl', 'Math', CLOCK_SRC + '\nreturn window.PJCC_TIME;');
  return fn(sandbox.window, sandbox.Date, Intl, Math);
}

{
  console.log('\n  the deck follows the weather:');
  const T0 = loadClock();

  /* THE COVER, BRANCH BY BRANCH. Each is its own check on purpose: a single assertion
     covering "heavy is 3 AND light is 2" stays green if the light path is deleted, which
     is the exact failure this pass was built to stop (see the mutation note in the memory
     on gates). Four calls, four checks. */
  ok('heavy rain gets the full deck', T0.clouds('rain', 2) === 3, T0.clouds('rain', 2));
  ok('   heavy snow does too', T0.clouds('snow', 2) === 3, T0.clouds('snow', 2));
  ok('   MEDIUM rain gets broken cloud, not overcast', T0.clouds('rain', 1) === 2, T0.clouds('rain', 1));
  ok('   LIGHT rain gets broken cloud too', T0.clouds('rain', 0) === 2, T0.clouds('rain', 0));
  ok('   light snow gets broken cloud', T0.clouds('snow', 0) === 2, T0.clouds('snow', 0));
  ok('   mist still gets its own broken deck', T0.clouds('mist') === 2, T0.clouds('mist'));
  /* ⚠ A WET DAY MUST NEVER BE BARE. This is the half of Nate's complaint that a
     cover-follows-intensity change could quietly break by letting light rain fall to 1. */
  ok('   and no wet intensity is ever allowed to be a bare sky',
     [0, 1, 2].every((l) => T0.clouds('rain', l) >= 2 && T0.clouds('snow', l) >= 2));

  /* CLEAR MEANS CLEAR. The roll survives — "sometimes it's cloudy, sometimes it's both"
     is his own 2026-07-13 ask — but a CLEAR day may no longer wear a full deck, which is
     what made the word read as a lie. Read from the literal table, so a face that grows
     back cannot hide behind today's seed. */
  const clearTable = CLOCK_SRC.match(/return \[([0-9, ]+)\]\[\(daySeed\(\) >>> 11\) % 10\];/);
  const faces = clearTable ? clearTable[1].split(',').map((n) => +n.trim()) : null;
  ok('the clear-day cover roll is still a ten-face table', !!faces && faces.length === 10, faces);
  ok('   and NO face of it is overcast any more', !!faces && faces.every((f) => f < 3), faces);
  ok('   while it still varies — the roll was not deleted', !!faces && new Set(faces).size > 1, faces);
  ok('   and at least half of clear days are genuinely bare',
     !!faces && faces.filter((f) => f === 0).length >= 5,
     faces && faces.filter((f) => f === 0).length + '/10');

  /* ⚠ THE OPENING INTENSITY WAS NEGATIVE ON HALF THE CALENDAR. daySeed() is a full uint32
     and the old private copy in pjcc-weather.js used a SIGNED `>> 3`, so `% 3` handed back
     -1 or -2 and the caller's clamp turned those days into LIGHT no matter what they
     rolled. Nothing threw. This walks real dates through the SHIPPED function rather than
     recomputing the expression here — a number derived in a test is not a measurement. */
  const seen = new Set();
  let bad = null;
  for (let i = 0; i < 420 && !bad; i++) {
    const d = new Date(Date.UTC(2026, 0, 1 + i));
    const ds = d.toISOString().slice(0, 10);
    const v = loadClock(ds).level();
    seen.add(v);
    if (!(v === 0 || v === 1 || v === 2)) bad = ds + ' -> ' + v;
  }
  ok('the day\'s opening intensity is 0-2 on every date in a year', !bad, bad || '420 dates');
  ok('   and all three levels actually occur', seen.size === 3, [...seen].sort());
}

{
  console.log('\n  Chess City on the horizon:');
  ok('the sky includes the city layer', /<div class="ts-city">\{% include town-city\.svg %\}<\/div>/.test(SKY_HTML));
  ok('   and the city SVG exists', CITY_SVG.length > 2000, CITY_SVG.length + ' bytes');
  /* ⚠ IT IS GENERATED. Re-run the generator into a temp file and compare: a hand-edit to
     town-city.svg survives until the next `npm run gen:city` silently throws it away, and
     that is the same trap as the front-door puzzle pool. */
  {
    const os = require('os');
    const tmp = path.join(os.tmpdir(), 'pjcc_city_' + Date.now() + '.svg');
    const gen = fs.readFileSync(path.join(REPO, 'tests/gen-city.js'), 'utf8')
      .replace(/__dirname \+ '[^']*town-city\.svg'/, JSON.stringify(tmp));
    const say = console.log; console.log = () => {};
    try { new Function('require', '__dirname', gen)(require, path.join(REPO, 'tests')); }
    finally { console.log = say; }
    const fresh = fs.readFileSync(tmp, 'utf8');
    fs.unlinkSync(tmp);
    ok('   and it matches what the generator produces (no hand-edits)', fresh === CITY_SVG,
       fresh === CITY_SVG ? '' : 'run `npm run gen:city` and commit the result');
  }
  /* ⚠⚠ BOTH TERMS OR THE KING LOSES HIS CROSS. `slice` scales the graphic to COVER its
     box, so on a wide monitor a box sized only in `vh` is shorter than the graphic needs
     and the crop eats the tallest towers. The `vw` term is the guard, and it is invisible
     on the machine anybody develops on — which is exactly why it is asserted here. */
  /* ⚠⚠ EVERY `.ts-city` HEIGHT RULE, NOT "the first one the regex happens to find".
     Two drafts of this check failed to catch the deletion it exists for. The first was lazy
     across newlines (`[\s\S]*?`) and ran straight past a vw-less `.ts-city` into the PHONE
     media query below it. Scoping to `[^}]*` did not fix it either: with no `max()` left in
     the desktop rule the engine simply BACKTRACKED to the media query's own `.ts-city {`,
     which does still have both terms, and reported green. **A regex that can match a
     DIFFERENT rule of the same name is not scoped, it is lucky.** So: collect every
     `.ts-city { … }` block that sets a height and require all of them to carry both terms. */
  const cityRules = [...SKY_SCSS.matchAll(/\.ts-city \{([^}]*)\}/g)]
    .map((m) => m[1]).filter((body) => /height:/.test(body));
  ok('there are .ts-city height rules to check', cityRules.length >= 2, cityRules.length + ' rules');
  const cityTerms = cityRules.map((b) => b.match(/height: max\(([\d.]+)vh, ([\d.]+)vw\);/));
  ok('EVERY city box is sized in BOTH vh and vw', cityTerms.every(Boolean),
     cityRules.map((b) => (b.match(/height:[^;]*/) || [''])[0].trim()));
  ok('   and every vw term clears the graphic\'s own aspect (>= 18.3vw)',
     cityTerms.every((m) => m && +m[2] >= 18.3), cityTerms.map((m) => m && m[2] + 'vw'));
  ok('   the monochrome studio pages do not get a chess skyline',
     /body\.theme-bw \.ts-city,\s*\n\s*body\.theme-studio \.ts-city \{ display: none; \}/.test(SKY_SCSS));
  /* It is PAINT, not motion. The moment anything in here grows an animation it starts
     costing a compositor layer on every page of the site, forever. */
  ok('   and nothing in the city layer animates', !/\.ts-city[\w-]*[^{]*\{[^}]*animation:/.test(SKY_SCSS));
}

async function open(browser, startQuiet, opts) {
  opts = opts || {};
  const ctx = await browser.createBrowserContext();
  const p = await ctx.newPage();
  await p.setViewport({ width: 1100, height: 900, deviceScaleFactor: opts.dpr || 1 });
  /* Pretend to be a weaker machine. `hardwareConcurrency` is the only one of the two
     signals that can be faked from here — `deviceMemory` is not settable in Chromium —
     and it is the one that exists in every browser, so it is the one worth pinning. */
  if (opts.cores) {
    await p.evaluateOnNewDocument(n => {
      Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => n });
    }, opts.cores);
  }
  await p.setRequestInterception(true);
  p.on('request', r => {
    const hit = Object.keys(LOCAL).find(k => r.url().includes(k));
    return hit ? r.respond({ status: 200, contentType: 'application/javascript', body: LOCAL[hit] }) : r.continue();
  });
  if (startQuiet) {
    // set the preference BEFORE the page's head script reads it
    await p.evaluateOnNewDocument(() => { try { localStorage.setItem('pjcc.flourish', '0'); } catch (e) {} });
  }
  await p.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 2600));
  return { ctx, p };
}
const state = p => p.evaluate(() => ({
  cls: document.documentElement.classList.contains('reduce-flourish'),
  canvas: !!document.querySelector('.tw-canvas'),
  running: !!(window.PJCCTownWeather && PJCCTownWeather.running()),
  label: (document.getElementById('flourish-toggle') || {}).textContent
}));
const click = async p => { await p.evaluate(() => document.getElementById('flourish-toggle').click());
                           await new Promise(r => setTimeout(r, 900)); };

(async () => {
  const b = await puppeteer.launch({ executablePath: findChrome(), args: ['--no-sandbox'] });

  // ── THE BUG: a page that STARTED quiet ────────────────────────────────────────
  console.log('\n  starting in REDUCE MOTION:');
  let { ctx, p } = await open(b, true);
  let s = await state(p);
  ok('starts quiet — class on, no frame loop', s.cls && !s.running, s);
  ok('no canvas was ever built', !s.canvas, s);
  await click(p);
  s = await state(p);
  ok('→ turning motion ON removes the class', !s.cls, s);
  ok('→ AND BUILDS THE WEATHER (this is the bug)', s.canvas, s);
  ok('→ AND the frame loop is actually running', s.running, s);
  await click(p);
  s = await state(p);
  ok('→ back off: class returns', s.cls, s);
  ok('→ back off: the loop STOPS (not just display:none)', !s.running, s);
  await ctx.close();

  // ── the case that already appeared to work — check the loop, not the class ────
  console.log('\n  starting NORMAL:');
  ({ ctx, p } = await open(b, false));
  s = await state(p);
  ok('starts loud — canvas up and drawing', s.canvas && s.running && !s.cls, s);
  await click(p);
  s = await state(p);
  ok('→ quiet: the loop stops for real', s.cls && !s.running, s);
  await click(p);
  s = await state(p);
  ok('→ loud again: the loop resumes', !s.cls && s.running, s);
  ok('the button label tracks the state', /Reduce motion/.test(s.label || ''), s.label);

  // ── and it must survive a tab switch while quiet ──────────────────────────────
  await click(p);                                    // back to quiet
  await p.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  await new Promise(r => setTimeout(r, 600));
  s = await state(p);
  ok('a visibilitychange while quiet does NOT restart the loop', !s.running, s);
  await ctx.close();

  /* ══ THE THREE COST LEVERS (2026-07-29) ═════════════════════════════════════════
     Nate: "for weather cost, do 2, 3, 4… in general, performance is most important."
     These are cheap to break by accident and impossible to notice: nothing looks wrong
     when a device tier stops being detected, the page is just quietly more expensive on
     the machines least able to pay. So each lever is asserted as a NUMBER. */
  console.log('\n  the cost levers:');
  const dbg = p => p.evaluate(() => PJCCWeather.debug());

  ({ ctx, p } = await open(b, false, { cores: 8, dpr: 1 }));
  let d = await dbg(p);
  const deskDrops = d.near + d.far;
  // #2 — the glass copy's own resolution. 0.4 against the main canvas's 1.5 cap.
  ok('#2 the ghost is stored well under the main canvas', d.ghostDpr <= 0.4 && d.ghostDpr > 0,
     { ghostDpr: d.ghostDpr, ghost: d.ghostW + 'x' + d.ghostH });
  ok('   and 0.3 is NOT used (it beads on a dense screen)', d.ghostDpr > 0.3, d.ghostDpr);
  ok('a normal desktop is neither weak nor dense', !d.weak && !d.dense, d);
  ok('rain on a dpr-1 desktop stores at dpr 1', d.dpr === 1, d.dpr);
  await ctx.close();

  // #3 — a dense screen takes the rain cap from 1.5 down to 1.25
  ({ ctx, p } = await open(b, false, { cores: 8, dpr: 3 }));
  d = await dbg(p);
  ok('#3 a dpr-3 screen is flagged dense', d.dense, d);
  ok('   and caps rain at 1.25 instead of 1.5', d.dpr === 1.25, d.dpr);
  await ctx.close();

  // #4 — a four-core machine gets a thinner field AND a dpr-1 canvas
  ({ ctx, p } = await open(b, false, { cores: 4, dpr: 1 }));
  d = await dbg(p);
  const weakDrops = d.near + d.far;
  ok('#4 four cores is flagged weak', d.weak, { cores: d.cores });
  ok('   and thins the field by ~30%', weakDrops < deskDrops * 0.75 && weakDrops > deskDrops * 0.65,
     `${deskDrops} → ${weakDrops} drops`);
  ok('   and drops the canvas to dpr 1', d.dpr === 1, d.dpr);
  await ctx.close();

  /* ⚠ THE ONE THAT MATTERS MOST: a browser that declines to report its cores must be
     treated as FINE, not as weak. Safari has never shipped `deviceMemory`, and a hardened
     desktop browser can hide both — degrading the weather for them would be a silent,
     permanent downgrade for a large slice of real visitors. */
  ({ ctx, p } = await open(b, false, { cores: 0, dpr: 1 }));
  d = await dbg(p);
  ok('a browser that says NOTHING is not treated as weak', !d.weak, { cores: d.cores, weak: d.weak });
  ok('   and keeps the full field', (d.near + d.far) === deskDrops, `${d.near + d.far} drops`);
  await ctx.close();

  /* ══ AND NOW IN A REAL BROWSER, ON A REBUILT PAGE ══════════════════════════════
     Everything above is source-read, and source-read cannot see the bug that started this:
     `cloud-3` on <html> and `display:none` on the deck, both correct on their own, in the
     same frame. So take the live front door, swap in the LOCAL clock, the LOCAL head
     script, the LOCAL compiled stylesheet and the LOCAL sky markup, and look at what the
     browser actually computed. */
  console.log('\n  what the browser actually renders:');
  const sass = require('sass');
  const CSS_OUT = sass.compileString(
    fs.readFileSync(path.join(REPO, 'assets/css/style.scss'), 'utf8').replace(/^---[\s\S]*?---/, ''),
    { loadPaths: [path.join(REPO, '_sass')], silenceDeprecations: ['import'] }).css;
  const FRONT = 'https://chesswild.com/';
  const rawHtml = await (await fetch(FRONT)).text();
  /* ⚠⚠ THE SKY MARKUP HAS TO BE SWAPPED TOO, AND FORGETTING IT COST A FALSE FAILURE ON THE
     FIRST RUN OF THE AURORA CHECK BELOW. Grafting only the stylesheet measures LOCAL CSS
     against DEPLOYED markup: the ray heights had just been trimmed in town-sky.html, the
     browser was still being served yesterday's, and the gate reported 103.8% on a file that
     says 97%. A harness that mixes two versions of the same feature is testing neither one.
     The include is Liquid on disk, so its comments come out and its one `{% include %}` is
     expanded here — the same reason assets/js/pjcc-time.js has to be a generated copy. */
  const skyLocal = (() => {
    let m = fs.readFileSync(path.join(REPO, '_includes/town-sky.html'), 'utf8');
    m = m.replace(/{%-?\s*comment\s*-?%}[\s\S]*?{%-?\s*endcomment\s*-?%}/g, '');
    m = m.replace(/{%\s*include town-city\.svg\s*%}/, CITY_SVG);
    const a = m.indexOf('<div class="town-sky"');
    const e = m.lastIndexOf('<div class="ts-eclipse"></div>');
    return (a > -1 && e > a) ? m.slice(a, m.indexOf('</div>', e + 30) + 6) : null;
  })();
  const rebuild = () => {
    let h = rawHtml
      .replace(/<script>\/\* =+\r?\n \* PJCC town clock[\s\S]*?<\/script>/, '<script>' + CLOCK_SRC + '</script>')
      .replace(/<script>try\{var T=window\.PJCC_TIME;[\s\S]*?<\/script>/, HEAD_JS)
      .replace('</head>', '<style>' + CSS_OUT + '</style></head>');
    if (skyLocal) {
      const a = h.indexOf('<div class="town-sky"');
      const e = h.indexOf('<div class="ts-eclipse"></div>');
      if (a > -1 && e > a) h = h.slice(0, a) + skyLocal + h.slice(h.indexOf('</div>', e + 30) + 6);
    }
    if (!/class="ts-city"/.test(h))
      h = h.replace('<div class="ts-horizon"></div>',
        '<div class="ts-horizon"></div><div class="ts-city">' + CITY_SVG + '</div>');
    return h;
  };

  async function sky(wx, vp) {
    const c = await b.createBrowserContext();
    const pg = await c.newPage();
    await pg.setViewport(vp || { width: 1280, height: 860 });
    await pg.setRequestInterception(true);
    pg.on('request', (r) => (r.resourceType() === 'document' && r.url().split('?')[0] === FRONT)
      ? r.respond({ status: 200, contentType: 'text/html; charset=utf-8', body: rebuild() })
      : r.continue());
    await pg.goto(FRONT + '?wx=' + wx, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await new Promise((r) => setTimeout(r, 900));
    const out = await pg.evaluate(() => {
      const R = document.documentElement, cl = document.querySelector('.ts-clouds');
      const city = document.querySelector('.ts-city'), near = document.querySelector('.ts-city-near');
      const cb = city && city.getBoundingClientRect(), nb = near && near.getBoundingClientRect();
      return {
        cover: (R.className.match(/cloud-(\d)/) || [])[1],
        deck: cl && getComputedStyle(cl).display,
        cityTop: cb && cb.top, cityH: cb && cb.height,
        nearTop: nb && nb.top, nearBottom: nb && nb.bottom,
        vh: innerHeight, vw: innerWidth
      };
    });
    await c.close();
    return out;
  }

  /* THE TWO COMPLAINTS, MEASURED. Separate checks for the class and for the deck, because
     the whole bug was that those two disagreed while each looked right on its own. */
  let sk = await sky('clear');
  ok('?wx=clear — the sky is genuinely CLEAR', sk.cover === '0', sk);
  ok('   and no deck is drawn over it', sk.deck === 'none', sk.deck);

  sk = await sky('rain%2Cheavy');
  ok('?wx=rain,heavy — overcast', sk.cover === '3', sk);
  ok('   and the deck is really ON a content page (it used to be culled here)',
     sk.deck === 'block', sk.deck);

  sk = await sky('rain%2Clight');
  ok('?wx=rain,light — broken cloud, not overcast', sk.cover === '2', sk);
  ok('   and that deck is drawn too', sk.deck === 'block', sk.deck);

  sk = await sky('snow%2Cheavy');
  ok('?wx=snow,heavy — overcast as well', sk.cover === '3', sk);

  sk = await sky('mist');
  ok('?wx=mist — its own broken deck', sk.cover === '2', sk);
  ok('   and it is drawn', sk.deck === 'block', sk.deck);

  /* CHESS CITY, MEASURED WHERE IT LANDS. `nearTop` is the geometric top of the tallest
     tower in screen coordinates. Two things have to hold and they pull in opposite
     directions: it must REACH the middle, and it must not be CROPPED getting there. */
  sk = await sky('clear');
  ok('the city stands on the bottom of the screen', Math.abs(sk.nearBottom - sk.vh) < 2,
     { nearBottom: Math.round(sk.nearBottom), vh: sk.vh });
  ok('   and its tallest tower reaches toward the middle',
     sk.nearTop / sk.vh <= 0.60 && sk.nearTop / sk.vh >= 0.35,
     (100 * sk.nearTop / sk.vh).toFixed(1) + '% down the screen');
  /* ⚠ THE CROP TEST. `slice` scales to COVER the box, so a box that is too short pushes
     the graphic's top ABOVE the box and the crown is cut off. If nearTop ever climbs above
     cityTop, the king has lost his cross and nothing else on this page would say so. */
  ok('   and nothing is cropped off the top of it', sk.nearTop >= sk.cityTop - 1,
     { nearTop: Math.round(sk.nearTop), cityTop: Math.round(sk.cityTop) });
  /* ⚠⚠ AND THE SAME AT 1920 WIDE, which is where the missing `vw` term used to bite:
     every desktop under about 1240px wide looked perfect while a real monitor decapitated
     the skyline. A check that only runs at the harness's default width cannot see it. */
  sk = await sky('clear', { width: 1920, height: 1000 });
  ok('   — still uncropped on a 1920-wide monitor', sk.nearTop >= sk.cityTop - 1,
     { nearTop: Math.round(sk.nearTop), cityTop: Math.round(sk.cityTop) });
  /* ⚠⚠ AND ON AN ULTRAWIDE, WHICH IS THE ONLY PLACE THE `vw` TERM EVER BINDS. Mutation-tested:
     deleting the vw term and leaving `height: 52vh` passes at 1280, at 1920 and on a phone —
     52% of a 16:9 screen is still taller than the graphic needs. It only crops past about
     2.85:1, so 1920 was a check that could never have caught the thing it was written for. */
  sk = await sky('clear', { width: 3440, height: 1080 });
  ok('   — and on a 3440-wide ultrawide, where a vh-only box crops the crowns',
     sk.nearTop >= sk.cityTop - 1,
     { nearTop: Math.round(sk.nearTop), cityTop: Math.round(sk.cityTop) });
  sk = await sky('clear', { width: 390, height: 844 });
  ok('   — and on a phone, where it crops the SIDES instead', sk.nearTop >= sk.cityTop - 1,
     { nearTop: Math.round(sk.nearTop), cityTop: Math.round(sk.cityTop) });

  /* ══ THE RARE SKY — 2026-08-20 ═════════════════════════════════════════════
     Nate asked for three things to "really pop": the total eclipse, the partial, and the
     aurora — plus slower, more varied meteors. Every one of those is a look, and a look
     cannot be asserted. What CAN be asserted is the four things that would quietly undo
     them, and each of these was a real failure during the build, not a hypothetical. */
  console.log('\n  the rare sky:');

  async function skyPage(query) {
    const c = await b.createBrowserContext();
    const pg = await c.newPage();
    await pg.setViewport({ width: 1280, height: 860 });
    await pg.setRequestInterception(true);
    pg.on('request', (r) => (r.resourceType() === 'document' && r.url().split('?')[0] === FRONT)
      ? r.respond({ status: 200, contentType: 'text/html; charset=utf-8', body: rebuild() })
      : r.url().includes('/assets/css/style.css')
        ? r.respond({ status: 200, contentType: 'text/css; charset=utf-8', body: CSS_OUT })
        : r.continue());
    await pg.goto(FRONT + query, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await new Promise((r) => setTimeout(r, 1200));
    return { c, pg };
  }

  /* ① THE ECLIPSE HAS TO BE ON SCREEN. The window is 13:00-15:00, which is exactly where
     the sun is highest on its arc — orb() puts it at 12.7% of the viewport. A 500px corona
     centered 110px from the top has half of itself above the window, and that is how the
     rarest thing this sky does was staged for a year. `--ecl-y` drops it 20%; if that
     variable is ever dropped or renamed the layout silently reverts and nothing throws. */
  {
    const { c, pg } = await skyPage('?eclipse=1');
    const m = await pg.evaluate(() => {
      const q = (s) => document.querySelector(s);
      const r = (s) => { const e = q(s); return e ? e.getBoundingClientRect() : null; };
      const orb = r('.ts-orb'), cor = r('.ts-ecl-corona'), door = r('.ts-eclipse-door');
      return {
        orbMid: orb && Math.round(orb.top + orb.height / 2),
        corMid: cor && Math.round(cor.top + cor.height / 2),
        doorMid: door && Math.round(door.top + door.height / 2),
        corTop: cor && Math.round(cor.top), corBottom: cor && Math.round(cor.bottom),
        vh: innerHeight
      };
    });
    await c.close();
    ok('the eclipse corona is fully on screen at totality',
       m.corTop >= 0 && m.corBottom <= m.vh, m);
    /* ⚠ ONE VARIABLE, FOUR CONSUMERS — and the one that goes wrong silently is the DOOR,
       an invisible button that stops sitting under the thing it opens. Compare the CENTERS:
       they are three different box sizes, so only the centers can agree. */
    ok('   the orb, the corona and the secret door agree on where the sun is',
       Math.abs(m.orbMid - m.corMid) <= 2 && Math.abs(m.orbMid - m.doorMid) <= 2, m);
  }

  /* ② THE AURORA CANNOT REACH ITS OWN CEILING. The container is `overflow: hidden`, the
     sway scales the rays to 1.12, and the ribbing is a SEPARATE background layer that the
     color gradient's top-fade does not reach. Get any of those wrong and thirteen rays are
     cut off flat across the top of the screen — which is exactly what happened the moment
     the crown was brightened. This measures the COMPUTED geometry, so it fails on a raised
     `--h` in the markup as well as on a lost mask. */
  {
    const { c, pg } = await skyPage('?aurora=1');
    const m = await pg.evaluate(() => {
      const host = document.querySelector('.ts-aurora');
      if (!host) return { none: true };
      const hh = host.getBoundingClientRect().height;
      const rays = [...document.querySelectorAll('.ts-aur')].map((el) => {
        const cs = getComputedStyle(el);
        const foot = parseFloat(cs.bottom), h = parseFloat(cs.height);
        return { reach: +(100 * (foot + h * 1.12) / hh).toFixed(1) };
      });
      const one = document.querySelector('.ts-aur');
      return { n: rays.length, worst: Math.max(...rays.map((r) => r.reach)),
               maskLayers: (getComputedStyle(one).maskImage.match(/gradient\(/g) || []).length,
               hostH: Math.round(hh) };
    });
    await c.close();
    ok('the aurora is drawing rays', !m.none && m.n >= 10, m.n + ' rays');
    ok('   and not one of them can reach the container ceiling', m.worst < 100, m.worst + '% of the box');
    /* the two-layer mask is what fades the RIBS; a browser that dropped it as invalid would
       leave the stripes running through the top edge, and the geometry check above cannot
       see that because the ray's BOX is still inside the box. */
    ok('   and the rib mask survived as two layers', m.maskLayers >= 2, m.maskLayers + ' gradients');
  }

  /* ③ THE METEORS KEEP THEIR THREE SHUTTERS. Speed was welded to frequency — a streak
     crosses inside the first 4% of its cycle, so the only way to slow one down was to make
     it rarer. Three keyframes with different visible windows is the third dial. Collapse
     them back to one and the shower silently goes uniform again at the old speed, with
     every other check still green. */
  {
    const windows = ['ts-shoot-fall', 'ts-shoot-fall-m', 'ts-shoot-fall-s']
      .map((n) => new RegExp('@keyframes ' + n + ' \\{').test(SKY_SCSS));
    ok('all three meteor shutters exist', windows.every(Boolean), windows);
    const { c, pg } = await skyPage('?meteors=1');
    const used = await pg.evaluate(() => {
      const R = document.documentElement;
      ['day', 'dusk', 'dawn'].forEach((q) => R.classList.remove('sky-' + q));
      R.classList.add('sky-night');
      const names = new Set();
      document.querySelectorAll('.ts-shoot').forEach((el) => {
        const n = getComputedStyle(el).animationName;
        if (n && n !== 'none') names.add(n);
      });
      return [...names];
    });
    await c.close();
    ok('   and the streaks actually use more than one of them', used.length >= 3, used);
  }

  console.log(`\nRESULT: ${fail ? 'FAIL' : 'PASS'} — ${pass} passed, ${fail} failed`);
  await b.close();
  process.exit(fail ? 1 : 0);
})();
