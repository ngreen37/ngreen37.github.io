/* =============================================================================
 * PERF AUDIT — what each ambient feature actually costs.  `npm run perf`
 * -----------------------------------------------------------------------------
 * Runs the LIVE site in real Chrome and prices every feature by ABLATION: let the page
 * idle, turn one feature off, measure again, diff. The difference is that feature's bill.
 *
 * Getting this to tell the truth took three tries. The traps, so nobody re-walks into them:
 *
 *  1. DON'T RELOAD BETWEEN CONDITIONS. The baseline then runs on a cold cache and a cold
 *     JIT while every later condition runs warm, so EVERY feature looks like it saves 20%.
 *     One settled page, features toggled in place, undone after each measurement.
 *  2. SETTLE FIRST. Fonts, the service worker, profile/lang scripts and leaderboard fetches
 *     all land after `load`. Measuring through that tail prices startup, not idle.
 *  3. DON'T MEASURE MAIN-THREAD WORK UNDER CPU THROTTLING. Chrome implements throttling by
 *     BUSY-WAITING inside the renderer, and that burnt time is attributed to tasks — so
 *     TaskDuration under throttle measures the throttler. (Draft 2 of this file reported a
 *     single opacity pulse costing 236ms/s. It doesn't.) So: throttle for the SMOOTHNESS
 *     number, run unthrottled for the COST number.
 *  4. A CONTROL, repeated and interleaved. Its own spread is the noise floor; a delta
 *     smaller than that is not a finding, it's weather.
 *
 * Features are FOUND, not hardcoded — document.getAnimations() reports what's actually
 * running, so this can't go stale when someone adds a layer.
 *
 * The columns:
 *   smooth      % of frames over 32ms while idling at 6x CPU throttle (≈ a cheap phone).
 *               THE headline. 0% = nobody's phone stutters on this page.
 *   main-thread ms of main-thread work per second of idling, UNTHROTTLED. A compositor-only
 *               animation (transform/opacity) should be near zero. If a feature moves this,
 *               it is doing per-frame work on the main thread and wants rewriting.
 *   texture     Estimated compositor memory the feature holds: every element animating
 *               transform/opacity gets promoted to its own GPU texture, w×h×4×dpr². This is
 *               the honest answer to "what does this feature cost in memory" for CSS layers —
 *               JS heap barely moves for them, but GPU texture does.
 * ========================================================================== */
const puppeteer = require('puppeteer-core');
const { findChrome } = require('./harness');

const ORIGIN = process.env.PERF_ORIGIN || 'https://mcpuppystudios.com';
const THROTTLE = 6;
const SMOOTH_MS = 4000;      // throttled frame-drop window (once per page)
const COST_MS = 2500;        // unthrottled main-thread window
const REPS = 4;              // per condition; median
const SETTLE_MS = 3500;

const PAGES = [
  { name: 'PJCC home',    url: '/' },
  { name: 'Games hall',   url: '/games/' },
  { name: 'McPuppy home', url: '/projects/' },
  { name: 'Splash',       url: '/' },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const median = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
const spread = (a) => Math.max(...a) - Math.min(...a);

/* ── in-page toolkit. Every mutation must hand back its own undo. ──────────── */
const TOOLKIT = () => {
  const px = (window.devicePixelRatio || 1) ** 2;
  window.__perf = {
    /* GPU texture an element set holds once promoted: one RGBA texture each. */
    texture(els) {
      let b = 0;
      for (const e of els) {
        const r = e.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) b += Math.ceil(r.width) * Math.ceil(r.height) * 4 * px;
      }
      return b / 1048576;
    },
    targets(name) {
      const els = [];
      for (const a of document.getAnimations()) {
        if (a.animationName === name && a.effect && a.effect.target) els.push(a.effect.target);
      }
      return els;
    },
    hide(sel) {
      const els = [...document.querySelectorAll(sel)];
      if (!els.length) return null;
      const undo = els.map((e) => [e, e.style.display]);
      els.forEach((e) => { e.style.display = 'none'; });
      return () => undo.forEach(([e, v]) => { e.style.display = v; });
    },
    /* Stop an animation group by PAUSING the Animation objects, not by writing
       `animationName:none` to the target's inline style. That older trick silently fails for
       animations on PSEUDO-ELEMENTS (::before/::after): a.effect.target is the HOST element,
       and inline style on the host doesn't reach the pseudo — so the animation kept running
       and got reported as free. Two of the site's most expensive animations live on pseudos. */
    pauseAnim(name) {
      const hits = document.getAnimations().filter((a) => a.animationName === name);
      if (!hits.length) return null;
      hits.forEach((a) => a.pause());
      return () => hits.forEach((a) => { try { a.play(); } catch (e) {} });
    },
    pauseAll() {
      const all = document.getAnimations();
      if (!all.length) return null;
      all.forEach((a) => a.pause());
      return () => all.forEach((a) => { try { a.play(); } catch (e) {} });
    },
    /* Which CSS properties does this animation actually move? This is the whole ballgame:
       transform/opacity ride the compositor and cost ~nothing; ANYTHING ELSE repaints the
       element every frame on the main thread. Reported so a bad animation outs itself. */
    propsOf(name) {
      const a = document.getAnimations().find((x) => x.animationName === name);
      if (!a || !a.effect || !a.effect.getKeyframes) return [];
      const skip = new Set(['offset', 'computedOffset', 'easing', 'composite']);
      const p = new Set();
      for (const kf of a.effect.getKeyframes()) {
        for (const k of Object.keys(kf)) if (!skip.has(k)) p.add(k);
      }
      return [...p];
    },
    census() {
      const g = {};
      for (const a of document.getAnimations()) {
        const n = a.animationName || '(web-animation)';
        const t = a.effect && a.effect.target;
        const pseudo = (a.effect && a.effect.pseudoElement) || '';
        if (!g[n]) g[n] = { name: n, count: 0, sample: '', mb: 0, props: [] };
        g[n].count++;
        if (t && !g[n].sample) {
          g[n].sample = t.tagName.toLowerCase() +
            (typeof t.className === 'string' && t.className.trim()
              ? '.' + t.className.trim().split(/\s+/)[0] : '') + pseudo;
        }
      }
      const SAFE = new Set(['transform', 'opacity']);
      for (const n of Object.keys(g)) {
        g[n].mb = this.texture(this.targets(n));
        g[n].props = this.propsOf(n);
        g[n].paints = g[n].props.filter((p) => !SAFE.has(p));
      }
      return Object.values(g).sort((a, b) => b.count - a.count);
    },
    frames(ms) {
      return new Promise((resolve) => {
        const d = []; let last = performance.now(); const stop = last + ms;
        function tick(now) {
          d.push(now - last); last = now;
          if (now < stop) requestAnimationFrame(tick); else resolve(d.slice(1));
        }
        requestAnimationFrame(tick);
      });
    },
  };
};

async function metrics(client) {
  const { metrics: m } = await client.send('Performance.getMetrics');
  return Object.fromEntries(m.map((x) => [x.name, x.value]));
}

/* Unthrottled main-thread work while the page just sits there. */
async function cost(page, client) {
  const a = await metrics(client);
  await page.evaluate((ms) => new Promise((r) => setTimeout(r, ms)), COST_MS);
  const b = await metrics(client);
  return {
    mainMs: (1000 * (b.TaskDuration - a.TaskDuration)) / (COST_MS / 1000),
    heapMB: b.JSHeapUsedSize / 1048576,
  };
}

const f1 = (n) => (n >= 0 ? '+' : '') + n.toFixed(1);
const kb = (n) => Math.round(n / 1024) + 'kB';

(async () => {
  const exe = findChrome();
  if (!exe) { console.error('No Chrome/Edge found.'); process.exit(2); }
  const browser = await puppeteer.launch({ executablePath: exe, headless: 'new', args: ['--no-sandbox'] });

  console.log('\n═══ PERF AUDIT — ' + ORIGIN);
  console.log('    smoothness measured at ' + THROTTLE + 'x CPU throttle (a cheap phone).');
  console.log('    cost measured UNTHROTTLED, median of ' + REPS + ', one settled page.\n');

  for (const p of PAGES) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    const client = await page.target().createCDPSession();
    await client.send('Performance.enable');

    const bytes = { js: 0, css: 0, font: 0, img: 0, doc: 0, other: 0 };
    page.on('response', (r) => {
      try {
        const len = +(r.headers()['content-length'] || 0);
        const t = r.request().resourceType();
        const k = t === 'script' ? 'js' : t === 'stylesheet' ? 'css' : t === 'font' ? 'font'
          : t === 'image' ? 'img' : t === 'document' ? 'doc' : 'other';
        bytes[k] += len;
      } catch (e) { /* redirects */ }
    });

    const t0 = Date.now();
    try { await page.goto(ORIGIN + p.url, { waitUntil: 'networkidle2', timeout: 45000 }); }
    catch (e) { console.log('── ' + p.name + ' — FAILED TO LOAD\n'); await page.close(); continue; }
    const loadMs = Date.now() - t0;

    await page.evaluate(TOOLKIT);
    await sleep(SETTLE_MS);

    /* ── smoothness: the one number a visitor actually feels ─────────────────── */
    await client.send('Emulation.setCPUThrottlingRate', { rate: THROTTLE });
    await sleep(600);
    const frames = await page.evaluate((ms) => window.__perf.frames(ms), SMOOTH_MS);
    const longPct = (100 * frames.filter((f) => f > 32).length) / frames.length;
    const worst = Math.max(...frames);
    await client.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    await sleep(600);

    const anims = await page.evaluate(() => window.__perf.census());
    const dom = await client.send('Memory.getDOMCounters');

    console.log('══════════════════════════════════════════════════════════════════════');
    console.log('  ' + p.name.toUpperCase() + '   ' + p.url);
    console.log('══════════════════════════════════════════════════════════════════════');
    console.log('  weight   ' + kb(Object.values(bytes).reduce((a, b) => a + b, 0)) +
      '   js ' + kb(bytes.js) + ' · css ' + kb(bytes.css) + ' · fonts ' + kb(bytes.font) +
      ' · html ' + kb(bytes.doc));
    console.log('  load     ' + loadMs + 'ms to network-idle');
    console.log('  DOM      ' + dom.documents + ' docs · ' + dom.nodes + ' nodes · ' +
      dom.jsEventListeners + ' listeners');
    console.log('  SMOOTH   ' + longPct.toFixed(1) + '% of frames over 32ms at ' + THROTTLE +
      'x throttle   (worst frame ' + worst.toFixed(0) + 'ms)' +
      (longPct < 1 ? '   ← no stutter' : ''));
    console.log('');

    console.log('  ANIMATIONS RUNNING AT IDLE (' + anims.reduce((n, a) => n + a.count, 0) +
      ' elements, ' + anims.length + ' distinct)');
    for (const a of anims.slice(0, 16)) {
      const flag = a.paints.length ? '  ⚠ REPAINTS: ' + a.paints.join(', ') : '';
      console.log('    ' + String(a.count).padStart(3) + ' × ' + a.name.padEnd(23) +
        a.mb.toFixed(1).padStart(5) + 'MB  ' + a.sample.padEnd(24) + flag);
    }
    const dirty = anims.filter((a) => a.paints.length);
    if (dirty.length) {
      console.log('');
      console.log('  ⚠ ' + dirty.length + ' animation(s) move properties that CANNOT be composited.');
      console.log('    Those repaint their element on the main thread every single frame.');
      console.log('    Safe to animate: transform, opacity. Everything else costs.');
    }
    console.log('');

    /* ── conditions ──────────────────────────────────────────────────────────── */
    const conditions = [
      { label: 'CONTROL (nothing off)',  apply: `(function(){ return function(){}; })` },
      { label: 'town sky (whole layer)', apply: `(function(){ return window.__perf.hide('.town-sky'); })` },
      { label: 'weather (rain/mist)',    apply: `(function(){ return window.__perf.hide('.town-weather-overlay'); })` },
      { label: 'news ticker',            apply: `(function(){ return window.__perf.hide('.news-ticker, .ticker'); })` },
      /* every animation that repaints gets priced, plus the biggest groups by element count */
      ...[...new Set([...dirty.map((a) => a.name), ...anims.slice(0, 6).map((a) => a.name)])]
        .map((name) => {
          const a = anims.find((x) => x.name === name);
          return {
            label: '@' + name + ' ×' + a.count + (a.paints.length ? ' ⚠' : ''),
            apply: `(function(){ return window.__perf.pauseAnim(${JSON.stringify(name)}); })`,
          };
        }),
      { label: 'EVERY CSS animation off',
        apply: `(function(){ return window.__perf.pauseAll(); })` },
    ];

    const runs = new Map(conditions.map((c) => [c.label, []]));
    for (let rep = 0; rep < REPS; rep++) {
      for (const c of conditions) {
        if (!runs.has(c.label)) continue;
        const applied = await page.evaluate(
          `(function(){ window.__undo = ${c.apply}(); return !!window.__undo; })()`);
        if (!applied) { runs.delete(c.label); continue; }
        await sleep(300);
        runs.get(c.label).push(await cost(page, client));
        await page.evaluate('if (window.__undo) window.__undo();');
        await sleep(300);
      }
    }

    const ctl = runs.get('CONTROL (nothing off)').map((r) => r.mainMs);
    const cMain = median(ctl);
    const noise = spread(ctl);

    console.log('  IDLE COST  main thread does ' + cMain.toFixed(1) +
      'ms of work per second, unthrottled   (heap ' +
      median(runs.get('CONTROL (nothing off)').map((r) => r.heapMB)).toFixed(1) + 'MB)');
    console.log('  noise      the control itself varied by ' + noise.toFixed(1) +
      'ms/s across reps — smaller deltas than that are meaningless');
    console.log('');
    console.log('  WHAT YOU GET BACK BY TURNING IT OFF');
    console.log('  ' + 'feature'.padEnd(28) + 'main-thread'.padStart(12) + '     verdict');
    console.log('  ' + '─'.repeat(62));
    for (const c of conditions) {
      if (c.label === 'CONTROL (nothing off)' || !runs.has(c.label)) continue;
      const r = runs.get(c.label);
      if (!r.length) continue;
      const d = cMain - median(r.map((x) => x.mainMs));
      const verdict = d > noise ? 'REAL cost' : 'free (inside noise)';
      console.log('  ' + c.label.slice(0, 27).padEnd(28) +
        (f1(d) + 'ms/s').padStart(12) + '     ' + verdict);
    }
    console.log('');
    await page.close();
  }

  await browser.close();
  console.log('Positive = removing it makes the page cheaper.\n');
})();
