/* ═══════════════════════════════════════════════════════════════════════════════════
 * tests/mobile.check.js — THE PHONE CANNOT SLIDE SIDEWAYS
 *
 * 2026-08-19, Nate: "it shouldn't slide left to right (the whole window)."
 *
 * TWO DIFFERENT BUGS ARE GATED HERE, because one sentence describes both and only one of
 * them is visible in a desktop browser at all:
 *
 *   1. LAYOUT — something wider than the viewport that nothing clips. /goods/ was doing
 *      this on every phone: a grid track written `1fr` is `minmax(auto, 1fr)`, and that
 *      `auto` minimum opens to the item's MIN-CONTENT — a nowrap flex row of three
 *      fixed-width cards, a flat 354px, inside a 292px card. Nothing between there and
 *      <html> clips, so the DOCUMENT gained a horizontal scroll. Measured live: +131px at
 *      320, +61 at 390, +21 at 430, clean from 451 up. Every phone; no desktop.
 *
 *   2. iOS ZOOM — a text field under 16px. Focus one and Safari zooms the whole page to
 *      make it readable; the page is then wider than the window, pans under your thumb, and
 *      STAYS zoomed after the keyboard closes. On the device he actually uses that is
 *      indistinguishable from (1), and NOTHING on a desktop will ever show it to you.
 *
 * ⚠⚠ BOTH HALVES MEASURE, NEITHER PATTERN-MATCHES. The first draft of part 2 read the
 * stylesheet with a regex and reported five false positives on its first run: it could not
 * see that `.cmdk-input` is already 1rem in a different partial, it counted a comment as
 * part of a selector, and it had no way to know whether a rule WINS — which is the entire
 * risk, since four of these fields are styled in a page's own <style>, and a <style> in the
 * body beats a stylesheet on a tie. So it compiles the real stylesheet, assembles each
 * field in the cascade it actually lives in, emulates a coarse pointer, and reads the
 * computed size. [[audit-numbers-can-be-wrong]] — prove the instrument first.
 *
 * ⚠ PART 1 IS STILL A REPRO, AND THE PAGES LIST IS THE COVERAGE. There is no local Jekyll
 * here, so a page's own markup + its own <style> are rendered inside the box the real
 * layout gives it — .wrapper's 28px padding and .page-card's 20px, both MEASURED on the
 * live site, not assumed. It was proved against the live numbers before it was trusted:
 * it reported +130/+90/+60/+20 where the live page reported +131/+91/+61/+21, the 1px being
 * the live page's own rounding. A page not in PAGES is not covered by this.
 *
 *   node tests/mobile.check.js        (also runs inside `npm test`)
 * ═══════════════════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const { findChrome } = require('./harness');

let sass;
try { sass = require('sass'); }
catch (e) { console.error('dart-sass not installed. Run `npm install` first.'); process.exit(2); }

let pass = 0, fail = 0;
const check = (n, c, d) => {
  if (c) { pass++; console.log('  ✓ ' + n + (d !== undefined ? '   ' + d : '')); }
  else { fail++; console.log('  ✗ ' + n + (d !== undefined ? '   ' + d : '')); }
};

console.log('\n── THE PHONE CANNOT SLIDE SIDEWAYS ───────────────────────\n');

const SKIP = /(node_modules|[\\/]\.git|[\\/]_site|assets[\\/]vendor|assets[\\/]backups|[\\/]tests[\\/])/;
const walk = (d, o) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const f = path.join(d, e.name);
    if (SKIP.test(f)) continue;
    if (e.isDirectory()) walk(f, o); else if (/\.(md|html|js)$/.test(e.name)) o.push(f);
  }
  return o;
};
const SOURCES = walk(ROOT, []).map((f) => path.relative(ROOT, f).split('\\').join('/'));

/* Every field a finger can type into. A range slider, a checkbox and a submit button are
   not typed into and iOS never zooms for them, so `type` filters them out rather than an
   allowlist doing it by hand. */
const FIELD = /<(input|textarea)\b([^>]*)>/gi;
const NOZOOM = /type\s*=\s*["'](range|checkbox|radio|hidden|submit|button|color|file|image|reset)["']/i;
const fields = [];
for (const r of SOURCES) {
  const src = read(r);
  let m;
  FIELD.lastIndex = 0;
  while ((m = FIELD.exec(src))) {
    if (NOZOOM.test(m[2])) continue;
    fields.push({ where: r, tag: m[1].toLowerCase(), attrs: m[2] });
  }
}
check('the sweep found the site\'s text fields', fields.length >= 15, fields.length + ' typed-into fields');

/* ⚠ THE STANDALONE GAME SHELLS LOAD NONE OF THE SITE'S CSS — assets/games/*.html are plain
   HTML outside the Jekyll layouts. Their fields must carry 16px themselves, and building
   their probe with the site stylesheet attached would quietly prove the wrong thing. */
const standalone = (f) => /^assets[\\/]games[\\/]/.test(f) || f.indexOf('assets/games/') === 0;
const styleBlocks = (src) => (src.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [])
  .map((b) => b.replace(/^<style[^>]*>/i, '').replace(/<\/style>$/i, '')).join('\n');

const PAGES = ['goods.md'];
const WIDTHS = [320, 360, 390, 430];

(async () => {
  const exe = findChrome();
  if (!exe) {
    console.log('\n  (no Chrome found — skipping the browser half)\n');
    console.log('  ' + pass + ' passed, ' + fail + ' failed\n');
    process.exit(fail === 0 ? 0 : 1);
  }
  const puppeteer = require('puppeteer-core');
  const browser = await puppeteer.launch({ executablePath: exe, headless: 'new', args: ['--no-sandbox', '--mute-audio'] });
  const page = await browser.newPage();

  const siteCss = sass.compileString(
    read('assets/css/style.scss').replace(/^---[\s\S]*?\n---\s*/, ''),
    { loadPaths: [path.join(ROOT, '_sass')], style: 'expanded', silenceDeprecations: ['import'] }).css;

  /* ══ PART 1 — no page pans sideways ══════════════════════════════════════════════ */
  const liquid = (s) => s
    .replace(/^---[\s\S]*?\n---\s*/, '')
    .replace(/\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\}/g, '')
    .replace(/\{\{\s*'([^']*)'\s*\|\s*relative_url\s*\}\}/g, '$1')
    .replace(/\{%[\s\S]*?%\}/g, '')
    .replace(/\{\{[\s\S]*?\}\}/g, '');

  const SKELETON = ':root{--r-lg:14px;--r-sm:8px;--r-md:11px}' +
    '*,*::before,*::after{box-sizing:border-box}' +
    'html,body{margin:0;background:#1a0f3d;color:#fff;font:16px/1.7 system-ui,sans-serif}' +
    '.wrapper{max-width:1100px;margin:0 auto;padding:28px}' +   // MEASURED on the live site
    '.page-card{padding:20px;background:#241452;border-radius:14px}';

  for (const f of PAGES) {
    const tmp = path.join(os.tmpdir(), 'pjcc_mobile_' + Date.now() + '_' + path.basename(f) + '.html');
    fs.writeFileSync(tmp,
      '<!doctype html><html><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
      '<style>' + SKELETON + '</style></head><body>' +
      '<div class="wrapper"><div class="page-card"><div class="page-body">' +
      liquid(read(f)) +
      '</div></div></div></body></html>');

    const slid = [];
    for (const w of WIDTHS) {
      await page.setViewport({ width: w, height: 900, deviceScaleFactor: 1 });
      await page.goto('file:///' + tmp.split(path.sep).join('/'), { waitUntil: 'load' });
      await new Promise((r) => setTimeout(r, 150));
      const m = await page.evaluate(() => {
        const de = document.documentElement, vw = de.clientWidth;
        const over = Math.max(de.scrollWidth, document.body.scrollWidth) - vw;
        if (over <= 0) return { over: 0 };
        /* name the widest unclipped thing — a failure has to point at the element, or the
           next person re-runs this whole investigation from the beginning */
        let worst = null;
        document.querySelectorAll('*').forEach((el) => {
          const r = el.getBoundingClientRect();
          if (!r.width || r.right <= vw) return;
          if (getComputedStyle(el).position === 'fixed') return;
          for (let n = el.parentElement; n; n = n.parentElement) {
            const o = getComputedStyle(n).overflowX;
            if (o === 'hidden' || o === 'clip' || o === 'auto' || o === 'scroll') return;
          }
          if (!worst || r.right > worst.right) {
            worst = { right: r.right, sel: el.tagName.toLowerCase() +
              (el.id ? '#' + el.id : '') +
              (typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '') };
          }
        });
        return { over: over, worst: worst ? worst.sel : '(a transform — check rotate/scale)' };
      });
      if (m.over > 0) slid.push(w + 'px: +' + m.over + ' (' + m.worst + ')');
    }
    fs.unlinkSync(tmp);
    check('/' + f.replace(/\.md$/, '') + '/ never pans sideways on a phone', slid.length === 0,
      slid.length ? slid.join(' · ') : WIDTHS.join(', ') + ' all clean');
  }

  /* ══ PART 2 — nothing iOS would zoom for ═════════════════════════════════════════
     ⚠⚠ THE <style> GOES IN THE BODY, WHERE JEKYLL PUTS IT. A page's own block beats the
     stylesheet on a tie, and that tie is the whole reason the coarse-pointer rule is
     written `input.pt-in` rather than `.pt-in`. Build the probe with the block in the
     head and the check passes on a rule that loses in the real page. */
  /* ⚠ `page.emulateMediaFeatures()` REFUSES `pointer` — puppeteer keeps its own allowlist of
     feature names and that one is not on it ("Unsupported media feature: pointer"). CDP
     itself has no such limit, so the emulation goes in raw.
     ⚠⚠ ORDER MATTERS AND IT COST A RUN. `page.setViewport()` re-sends the whole emulation
     block, which WIPES an Emulation.setEmulatedMedia sent before it — the first attempt put
     the CDP call first and every field came back at its desktop size. The viewport goes
     first, the media override second, and the assertion below is what caught it. */
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const cdp = await page.target().createCDPSession();
  await cdp.send('Emulation.setEmulatedMedia', {
    media: 'screen',
    features: [{ name: 'pointer', value: 'coarse' }, { name: 'any-pointer', value: 'coarse' }] });

  /* ⭐ AND PROVE IT TOOK. Every assertion below is about a rule that only exists inside
     `@media (pointer: coarse)`. If the emulation silently did nothing, the fields would
     measure at their desktop sizes and this check would report the bug it was written to
     catch — as a fact about a browser nobody uses. [[audit-numbers-can-be-wrong]] */
  await page.goto('data:text/html,<meta charset=utf-8>', { waitUntil: 'load' });
  check('the harness is actually emulating a coarse pointer',
    await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
    'without this every size below is a desktop measurement wearing a phone label');

  const byHost = {};
  for (const f of fields) (byHost[f.where] = byHost[f.where] || []).push(f);

  /* ⚠⚠ A FIELD HAS TO BE PROBED INSIDE ITS ANCESTORS, and getting this wrong is what the
     first working run of this check actually reported. Three fields carry no class of their
     own — the Forge's two and the shogi gate's — and they are styled by DESCENDANT rules
     (`.forge-field input`, `.sgate-carve input`). Dropped on a bare <body> they matched
     nothing and measured 13.33px, which is Chrome's DEFAULT input size, not theirs. Two of
     the three were false positives: `.sgate-carve input` is 1.2rem and was never a problem.
     ⭐ A NUMBER THAT HAPPENS TO LAND ON THE RIGHT SIDE OF THE LINE IS STILL NOT A
     MEASUREMENT. [[audit-numbers-can-be-wrong]]

     So each field is wrapped in two nested divs wearing every class its own file mentions.
     That satisfies any `.container input` / `.a .b input` rule the file could be relying on,
     without this test having to parse the page's DOM. It can in principle over-match — a
     class from elsewhere in the same file pulling in a rule this field never sees — and
     that direction is the safe one: it reports something to look at rather than staying
     quiet about a field iOS would zoom for. */
  const classesIn = (src) => {
    const out = {};
    let m; const RE = /class\s*=\s*["']([^"']+)["']/g;
    while ((m = RE.exec(src))) m[1].trim().split(/\s+/).forEach((c) => { if (c && !/[{}<>]/.test(c)) out[c] = 1; });
    return Object.keys(out).slice(0, 400).join(' ');
  };

  const small = [];
  let measured = 0;
  for (const host of Object.keys(byHost)) {
    const own = /\.(md|html)$/.test(host) ? styleBlocks(read(host)) : '';
    const ctx = classesIn(read(host));
    const markup = byHost[host]
      .map((f, i) => '<div class="' + ctx + '"><div class="' + ctx + '">' +
        '<' + f.tag + ' data-probe="' + i + '"' + f.attrs.replace(/\/\s*$/, '') + '>' +
        (f.tag === 'textarea' ? '</textarea>' : '') + '</div></div>')
      .join('');
    const tmp = path.join(os.tmpdir(), 'pjcc_zoom_' + Date.now() + '_' + path.basename(host) + '.html');
    fs.writeFileSync(tmp,
      '<!doctype html><html><head><meta charset="utf-8">' +
      (standalone(host) ? '' : '<style>' + siteCss + '</style>') +
      '</head><body>' + markup +
      (own ? '<style>' + own + '</style>' : '') +
      '</body></html>');
    await page.goto('file:///' + tmp.split(path.sep).join('/'), { waitUntil: 'load' });
    const sizes = await page.evaluate(() => [...document.querySelectorAll('[data-probe]')]
      .map((el) => ({ px: parseFloat(getComputedStyle(el).fontSize),
                      cls: (el.getAttribute('class') || '(no class)') })));
    fs.unlinkSync(tmp);
    measured += sizes.length;
    sizes.forEach((s) => { if (s.px < 16) small.push(host + ' → ' + s.cls + ' @ ' + s.px + 'px'); });
  }

  check('every text field computes to 16px+ with a coarse pointer', small.length === 0,
    small.length ? small.join(' · ') : measured + ' fields measured in their own cascade');

  await browser.close();
  console.log('\n  ' + pass + ' passed, ' + fail + ' failed\n');
  process.exit(fail === 0 ? 0 : 1);
})();
