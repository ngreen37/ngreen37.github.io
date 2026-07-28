/* =============================================================================
 * MOTION BUDGET — how much GPU texture each page holds just by sitting there.
 * `npm run motion`                                        (measures the LIVE site)
 * -----------------------------------------------------------------------------
 * WHY THIS EXISTS. On 2026-07-28 Nate said the PJCC pages felt slow and that pressing
 * "Reduce motion" fixed it instantly, while /projects/ and /blog/ felt fine either way.
 * He was right, and nothing we already had could see it:
 *
 *   · tests/perf.js prices MAIN-THREAD work. Compositor animations (transform/opacity)
 *     cost almost no main-thread time by design — so a page can be drowning in GPU
 *     texture and perf.js reports it as free. It did.
 *   · document.getAnimations() hands back the HOST element for a pseudo-element
 *     animation, so ::before/::after layers get priced at the host's size. That is how
 *     the rain under-reported by 17x.
 *
 * So this walks the DOM and reads `animation-name` off getComputedStyle(el) AND
 * getComputedStyle(el, '::before' / '::after') — the only way to see a pseudo layer at
 * all — keeps only the INFINITE ones (a one-shot entrance animation finishes and hands
 * its layer back), and prices each as w x h x 4 x dpr^2 of GPU texture.
 *
 * THE NUMBER THAT MATTERS is "screens": texture divided by one full viewport. Every
 * always-on layer is a full copy of part of the screen that the compositor re-blends on
 * every frame, forever. What the first run found, at 1536x864 dpr1.5:
 *
 *      /pjcc/     5.84 screens      <- "feels slow"
 *      /games/    2.55 screens
 *      /chess/    1.98 screens
 *      /projects/ 0.77 screens      <- "feels fine"
 *
 * A 7.6x spread, and it lined up exactly with what he felt. That is the whole diagnosis.
 * After the cuts of the same day (043af32), measured live at the same size:
 *
 *      /pjcc/     2.89   (cloud banks quartered; the ribbon's crawl removed)
 *      /games/    1.26   (ribbon + a whole-panel ember pulse)
 *      /chess/    1.22   (ribbon)
 *      /projects/ 0.00   (the ribbon WAS its entire bill)
 *
 * /pjcc/ is knowingly still over budget: what's left there is the rain (1.20), the news
 * ticker (0.84) and the clouds (0.84). The rain and the clouds both go to ~0 when the
 * one-canvas-for-all-weather item in FUTURE-IDEAS gets built; that is the plan, not an
 * oversight. Don't "fix" it by deleting the weather.
 *
 * RUN THIS AT A REAL RESOLUTION. Headless 1280x800 dpr1 on an idle desktop GPU cannot
 * see compositor cost — that is how the rain got declared innocent the first time.
 *
 * BUDGET: keep every page under 2 screens. Under 1 is better. If a number goes up,
 * something was added; find it in the table, it names the element and its size.
 *   ORIGIN=http://localhost:4000 W=1920 H=1080 DPR=2 BUDGET=1.5 npm run motion
 *
 * NOT part of `npm test`, on purpose: it needs the deployed site and a real screen, so it
 * is a tool you run, like `npm run perf` — a non-zero exit is information, not a blocked push.
 * ========================================================================== */
const puppeteer = require('puppeteer-core');
const { findChrome } = require('./harness');

const ORIGIN = process.env.ORIGIN || 'https://mcpuppystudios.com';
const PAGES = process.env.PAGES ? process.env.PAGES.split(',') : ['/chess/', '/pjcc/', '/games/', '/projects/'];
const W = +(process.env.W || 1536), H = +(process.env.H || 864), DPR = +(process.env.DPR || 1.5);

const CENSUS = () => {
  const dpr2 = (window.devicePixelRatio || 1) ** 2;
  const rows = [];
  const seen = new Set();
  const walk = (root) => {
    const all = root.querySelectorAll('*');
    for (const el of all) {
      for (const pseudo of [null, '::before', '::after']) {
        let cs;
        try { cs = getComputedStyle(el, pseudo); } catch (e) { continue; }
        const name = cs.animationName;
        if (!name || name === 'none') continue;
        if (pseudo && cs.content === 'none') continue;
        const play = cs.animationPlayState;
        const iter = cs.animationIterationCount;
        const forever = /infinite/.test(iter);
        /* MEASURE THE LAYOUT BOX, NOT THE PAINTED ONE. getBoundingClientRect() reports the
           box AFTER transforms, and the whole point of the half-resolution trick is that a
           layer is RASTERIZED at its layout size and then scaled up by the compositor. Price
           the rect and a `scale(2)` layer reports its full pre-fix cost forever — which is
           exactly what this file did on its first run, showing the cloud banks unchanged at
           2580x864 after they had genuinely been quartered.
           `offsetWidth/offsetHeight` are pre-transform, which is the number we want.
           (Pseudo-elements have no offset*; their computed width/height are already
           pre-transform, and they're also how a pseudo that overflows its host — inset:-25%
           and friends — gets priced at its own size instead of the host's.) */
        const r = el.getBoundingClientRect();
        let w = el.offsetWidth || r.width, h = el.offsetHeight || r.height;
        if (pseudo) {
          const pw = parseFloat(cs.width), ph = parseFloat(cs.height);
          if (pw > 0) w = pw;
          if (ph > 0) h = ph;
        }
        if (!(w > 0 && h > 0)) continue;
        const props = new Set();
        for (const n of name.split(/,\s*/)) props.add(n);
        rows.push({
          name, pseudo: pseudo || '', play, iter, forever,
          sel: el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className.trim()
            ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''),
          w: Math.round(w), h: Math.round(h),
          mb: (Math.ceil(w) * Math.ceil(h) * 4 * dpr2) / 1048576,
          willChange: cs.willChange,
          filter: cs.filter !== 'none' ? cs.filter.slice(0, 40) : '',
          bd: cs.backdropFilter && cs.backdropFilter !== 'none' ? cs.backdropFilter.slice(0, 30) : '',
        });
      }
    }
  };
  walk(document);
  // also: elements permanently promoted by will-change even without an animation
  const promoted = [];
  for (const el of document.querySelectorAll('*')) {
    const cs = getComputedStyle(el);
    if (cs.willChange && cs.willChange !== 'auto' && cs.animationName === 'none') {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        promoted.push({
          sel: el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className.trim()
            ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''),
          wc: cs.willChange, mb: (Math.ceil(r.width) * Math.ceil(r.height) * 4 * dpr2) / 1048576,
        });
      }
    }
  }
  // backdrop-filter: each one forces a readback of everything beneath it, every frame
  const backdrops = [];
  for (const el of document.querySelectorAll('*')) {
    const cs = getComputedStyle(el);
    const bd = cs.backdropFilter || cs.webkitBackdropFilter;
    if (bd && bd !== 'none') {
      const r = el.getBoundingClientRect();
      backdrops.push({ sel: el.tagName.toLowerCase() + '.' + String(el.className).split(/\s+/)[0], bd, w: Math.round(r.width), h: Math.round(r.height) });
    }
  }
  return { rows, promoted, backdrops, dpr: window.devicePixelRatio, vw: innerWidth, vh: innerHeight };
};

(async () => {
  const browser = await puppeteer.launch({ executablePath: findChrome(), headless: 'new', args: ['--no-sandbox'] });
  const budget = +(process.env.BUDGET || 2.0);
  let worst = 0, worstPage = '';
  for (const url of PAGES) {
    const page = await browser.newPage();
    await page.setViewport({ width: W, height: H, deviceScaleFactor: DPR });
    try { await page.goto(ORIGIN + url, { waitUntil: 'networkidle2', timeout: 45000 }); }
    catch (e) { console.log('FAILED ' + url); await page.close(); continue; }
    await new Promise(r => setTimeout(r, 3000));
    const d = await page.evaluate(CENSUS);

    const screen = (d.vw * d.vh * 4 * d.dpr * d.dpr) / 1048576;
    const by = new Map();
    for (const r of d.rows) {
      const k = r.name + r.pseudo;
      if (!by.has(k)) by.set(k, { k, n: 0, mb: 0, sel: r.sel, dim: r.w + 'x' + r.h, wc: r.willChange, filter: r.filter, forever: r.forever });
      const g = by.get(k); g.n++; g.mb += r.mb;
    }
    const list = [...by.values()].sort((a, b) => b.mb - a.mb);
    const total = list.filter(g => g.forever).reduce((a, b) => a + b.mb, 0);
    const promoTotal = d.promoted.reduce((a, b) => a + b.mb, 0);

    console.log('\n════════════════════════════════════════════════════════════════════');
    console.log('  ' + url + '   @ ' + d.vw + 'x' + d.vh + ' dpr' + d.dpr +
      '   (one full screen = ' + screen.toFixed(1) + 'MB)');
    console.log('════════════════════════════════════════════════════════════════════');
    console.log('  ALWAYS-ON TEXTURE (infinite loops only)  ' + total.toFixed(1) + 'MB  = ' + (total / screen).toFixed(2) + ' screens');
    console.log('  ' + 'animation'.padEnd(30) + '  n'.padStart(4) + '     MB   screens  element / size');
    for (const g of list.slice(0, 22)) {
      console.log('  ' + g.k.slice(0, 29).padEnd(30) + String(g.n).padStart(4) +
        g.mb.toFixed(1).padStart(8) + (g.mb / screen).toFixed(2).padStart(9) + '  ' +
        g.sel.slice(0, 26).padEnd(27) + g.dim + (g.forever ? '' : '   [one-shot, layer released]') + (g.filter ? '  filter:' + g.filter : ''));
    }
    if (d.promoted.length) {
      console.log('\n  PERMANENTLY PROMOTED by will-change, not animating: ' +
        promoTotal.toFixed(1) + 'MB across ' + d.promoted.length);
      for (const p of d.promoted.sort((a, b) => b.mb - a.mb).slice(0, 8)) {
        console.log('    ' + p.mb.toFixed(1).padStart(6) + 'MB  ' + p.sel.slice(0, 34).padEnd(35) + p.wc);
      }
    }
    if (d.backdrops.length) {
      console.log('\n  BACKDROP-FILTER (reads back everything underneath, every frame): ' + d.backdrops.length);
      for (const b of d.backdrops.slice(0, 8)) console.log('    ' + b.sel.slice(0, 32).padEnd(33) + b.bd + '  ' + b.w + 'x' + b.h);
    }
    if (total / screen > worst) { worst = total / screen; worstPage = url; }
    await page.close();
  }
  await browser.close();
  console.log('\n────────────────────────────────────────────────────────────────────');
  console.log('  BUDGET ' + budget.toFixed(1) + ' screens · worst page ' + worstPage +
    ' at ' + worst.toFixed(2));
  if (worst > budget) {
    console.log('  ⚠ OVER BUDGET. Something is holding more GPU texture than it earns.');
    console.log('    Cheapest fixes, in order: (1) does it need to animate at all — a');
    console.log('    5%-opacity crawl is not perceivable; (2) draw it at half size and');
    console.log('    scale(2) in the keyframes — a quarter of the pixels, free for soft');
    console.log('    art like cloud; (3) cap the layer to the part of the screen it can');
    console.log('    actually be seen in.\n');
    process.exitCode = 1;
  } else {
    console.log('  ✓ every page inside budget.\n');
  }
})();
