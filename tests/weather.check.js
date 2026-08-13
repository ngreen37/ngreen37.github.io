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

  const CANVAS = fs.readFileSync(path.join(REPO, 'assets/js/pjcc-weather-canvas.js'), 'utf8');
  const mult = CANVAS.match(/var MULT = \{ rain: \[([\d.]+), ([\d.]+), ([\d.]+)\]/);
  ok('heavy rain is 1.17 \u2014 10% off the 1.3 it was', !!mult && +mult[3] === 1.17, mult && mult[3]);
  ok('   and light/medium were left where they were', !!mult && +mult[1] === 0.55 && +mult[2] === 1,
     mult && [mult[1], mult[2]]);

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

  console.log(`\nRESULT: ${fail ? 'FAIL' : 'PASS'} — ${pass} passed, ${fail} failed`);
  await b.close();
  process.exit(fail ? 1 : 0);
})();
