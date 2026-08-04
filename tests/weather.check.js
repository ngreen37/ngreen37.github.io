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
