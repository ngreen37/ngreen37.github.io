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

  /* ══ PART 1b — THE CAST RAIL SLIDES, AND THE PAGE DOES NOT ═══════════════════════════
     2026-08-20, Nate: *"The characters. Let's do two rows and make them slide-able. On the
     phone, it's too much vertical scrolling through the characters."*

     ⚠⚠ THIS IS DELIBERATE HORIZONTAL SCROLLING ON A PAGE WHOSE WHOLE MOBILE STORY IS THAT
     IT MUST NOT SCROLL HORIZONTALLY, so it needs both halves asserted at once: the RAIL has
     to actually overflow (or the feature is not there) and the PAGE still must not. One
     without the other is the bug wearing the feature's clothes.

     ⚠ IT CANNOT USE PART 1's SKELETON. That probe deliberately carries no stylesheet, and
     this behavior IS the stylesheet — a rail measured without `_pjcc-07-characters.scss` is
     a plain grid, and every assertion below would be about a page that does not exist. So
     this one attaches the real compiled CSS and the real page shell (`main.page-content >
     .wrapper > .page-card`). ⭐ THE SHELL IS LOAD-BEARING: `body` is `display:flex`, so a
     bare `.wrapper` is a flex item that shrinks to its contents — measured 346px instead of
     1044px, which made a first pass at this report numbers that were pure harness.

     ⚠⚠ AND `documentElement.scrollWidth` IS USELESS HERE. `html { overflow-x: clip }` is a
     GUARD this site added on 08-19 and its own comment says it hides the bug rather than
     reporting it. So the page half is measured the way Part 1 measures it: the widest
     element whose right edge escapes the viewport and that no scroll container contains. */
  {
    const src = read('characters.md');
    /* The real card markup, lifted from the page rather than retyped — and repeated to the
       real visible count, derived from the collection minus the slow-roll hidden list, so
       this cannot go stale the day a character is revealed. [[slow-roll-cast]] */
    const cardHtml = (liquid(src).match(/<div class="char-flip-card">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/) || [])[0];
    /* ⚠⚠ `\r?\n`, AND THE FIRST VERSION DID NOT HAVE IT. Every file in this repo is CRLF
       (`_config.yml` is 236 CRLF pairs and zero bare LFs), so `^hidden_character_urls:\n`
       matched nothing, the hidden list came back EMPTY, and the probe cheerfully reported
       "12 cards visible of 14" for a cast that is actually 8. It still went green — a rail
       with too many cards is still a rail — which is exactly the kind of pass that teaches
       you nothing. [[audit-numbers-can-be-wrong]] */
    const hidden = (read('_config.yml').match(/^hidden_character_urls:\r?\n((?:[ \t]+-[ \t].*\r?\n)+)/m) || [, ''])[1];
    const all = fs.readdirSync(path.join(ROOT, '_characters')).filter((n) => n.endsWith('.md'));
    const ancillary = all.filter((n) =>
      /^tier:\s*ancillary/m.test(read(path.join('_characters', n))));
    const hiddenCount = all.filter((n) => hidden.indexOf('/characters/' + n.replace(/\.md$/, '') + '/') > -1);
    const visible = all.length - new Set([...ancillary, ...hiddenCount]).size;
    /* ⭐ THE PARSE ITSELF IS ASSERTED, not just its result. `hiddenCount.length > 0` is what
       turns a silently-failed regex into a red line instead of an inflated count — the
       slow-roll list has held names since 07-16 and an empty one means the reader broke,
       never that the cast was revealed. [[slow-roll-cast]] */
    check('the cast rail probe found real card markup and a real count',
      !!cardHtml && visible >= 4 && hiddenCount.length > 0,
      visible + ' of ' + all.length + ' cards visible (' + hiddenCount.length + ' slow-rolled, ' +
      ancillary.length + ' ancillary)');

    if (cardHtml && visible >= 4) {
      const tmp = path.join(os.tmpdir(), 'pjcc_rail_' + Date.now() + '.html');
      fs.writeFileSync(tmp,
        '<!doctype html><html><head><meta charset="utf-8">' +
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
        '<style>' + siteCss + '</style></head><body>' +
        '<main class="page-content"><div class="wrapper"><div class="page-card">' +
        '<div class="char-flip-page"><div class="char-flip-grid char-rail" id="char-flip-grid">' +
        cardHtml.repeat(visible) +
        '</div></div></div></div></main></body></html>');

      const bad = [];
      for (const w of WIDTHS) {
        await page.setViewport({ width: w, height: 900, deviceScaleFactor: 1 });
        await page.goto('file:///' + tmp.split(path.sep).join('/'), { waitUntil: 'load' });
        await new Promise((r) => setTimeout(r, 200));
        const m = await page.evaluate(() => {
          const rail = document.getElementById('char-flip-grid');
          const cs = getComputedStyle(rail);
          const cards = [...rail.querySelectorAll('.char-flip-card')];
          const rows = new Set(cards.map((c) => Math.round(c.getBoundingClientRect().top))).size;
          const vw = document.documentElement.clientWidth;
          let escape = 0, sel = '';
          document.querySelectorAll('*').forEach((el) => {
            const r = el.getBoundingClientRect();
            if (!r.width || r.right <= vw) return;
            if (getComputedStyle(el).position === 'fixed') return;
            for (let n = el.parentElement; n; n = n.parentElement) {
              const o = getComputedStyle(n).overflowX;
              if (o === 'hidden' || o === 'clip' || o === 'auto' || o === 'scroll') return;
            }
            if (r.right - vw > escape) {
              escape = Math.round(r.right - vw);
              sel = el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(' ')[0] : '');
            }
          });
          const rw = Math.round(rail.getBoundingClientRect().width);
          return { rows: rows, chain: cs.overscrollBehaviorX, ox: cs.overflowX,
                   scrolls: rail.scrollWidth - rail.clientWidth,
                   peek: rail.scrollWidth > rail.clientWidth
                     ? Math.round(rw - Math.floor(rw / (cards[0].getBoundingClientRect().width + 12)) *
                         (cards[0].getBoundingClientRect().width + 12)) : 0,
                   escape: escape, sel: sel };
        });
        if (m.rows !== 2) bad.push(w + 'px: ' + m.rows + ' rows, want 2');
        if (m.scrolls <= 0) bad.push(w + 'px: the rail does not scroll at all');
        if (m.chain !== 'contain') bad.push(w + 'px: overscroll-behavior-x=' + m.chain);
        if (m.escape > 0) bad.push(w + 'px: the PAGE pans +' + m.escape + ' (' + m.sel + ')');
        /* ⭐ THE PEEK IS THE ONLY THING THAT ADVERTISES THE GESTURE on a device with no
           hover and no scrollbar. A first cut sized the columns at `46%` and rendered a
           12px hairline; the number is asserted because "it slides" and "anyone can tell
           it slides" are different claims. */
        if (m.peek < 24) bad.push(w + 'px: the next card peeks only ' + m.peek + 'px');
      }
      fs.unlinkSync(tmp);
      check('⚠⚠ the cast rail scrolls sideways and the PAGE still cannot', bad.length === 0,
        bad.length ? bad.join(' · ') : WIDTHS.join(', ') + ': 2 rows, scoped scroll, a real peek');
    }
  }

  /* ══ PART 1c — EVERY PAGE, WITH THE REAL STYLESHEET ══════════════════════════════════
     2026-08-20, Nate, for the second time: *"On mobile, you can slide the WHOLE window left
     to right, and I'd like it to be fixed, since there is no benefit to sliding the whole
     window from left to right."*

     ⚠⚠ HE REPEATED HIMSELF, SO THE DEFECT WAS A LAYER BEHIND THE FIX. Part 1 above is a
     good check that covered exactly ONE page — `PAGES = ['goods.md']`, and its own comment
     said "a page not in PAGES is not covered by this". It was right, and it was read as
     coverage. Sweeping the other 33 found **five** pages that genuinely slid.
     [[when-he-repeats-himself]]

     ⚠⚠ AND IT HAD TO USE THE REAL STYLESHEET. Part 1's SKELETON deliberately carries no
     CSS, which is the right probe for markup-shaped overflow and **structurally blind to
     every one of the five**: a `scale(2.4)` keyframe, a 60px wordmark, a `flex-shrink: 0`
     in a row, an unbreakable ████ run and an inline URL. All five are stylesheet bugs, so a
     stylesheet-free probe cannot see them however many pages it is pointed at.

     ⚠⚠ THE GUARD IS STRIPPED ON PURPOSE. `html { overflow-x: clip }` is the 08-19 guard and
     its own comment says it HIDES the bug rather than reporting it — and Safari only learned
     `clip` in 16, so it was never the whole answer on his phone anyway. The probe forces
     `overflow-x: visible` so overflow SPEAKS. Fix it where it starts; keep the guard for the
     one that gets past this. */
  {
    const ALL = fs.readdirSync(ROOT).filter((f) => f.endsWith('.md') &&
      !/^(README|CONTENT-CLEANUP)/.test(f));
    const slid = [];
    for (const f of ALL) {
      const tmp = path.join(os.tmpdir(), 'pjcc_sweep_' + Date.now() + '_' + f + '.html');
      fs.writeFileSync(tmp,
        '<!doctype html><html><head><meta charset="utf-8">' +
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
        '<style>' + siteCss + '</style>' +
        '<style>html{overflow-x:visible !important}</style></head><body class="theme-hall">' +
        '<main class="page-content"><div class="wrapper"><div class="page-card">' +
        liquid(read(f)) + '</div></div></main></body></html>');
      for (const w of [320, 390]) {
        await page.setViewport({ width: w, height: 800, deviceScaleFactor: 1 });
        await page.goto('file:///' + tmp.split(path.sep).join('/'), { waitUntil: 'load' });
        await new Promise((r) => setTimeout(r, 120));
        const m = await page.evaluate(() => {
          const de = document.documentElement, vw = de.clientWidth;
          const over = Math.max(de.scrollWidth, document.body.scrollWidth) - vw;
          if (over <= 0) return { over: 0 };
          /* ⚠ NAME THE ELEMENT, or the next person re-runs this whole investigation. And
             fall back to a note about transforms/pseudo-elements — the classified stamp
             overflowed through a `scale()` keyframe and the first probe found no element
             at all, which is a real answer and has to read like one. */
          let worst = null;
          document.querySelectorAll('*').forEach((el) => {
            const r = el.getBoundingClientRect();
            if (!r.width || r.right <= vw + 0.5) return;
            if (getComputedStyle(el).position === 'fixed') return;
            for (let n = el.parentElement; n; n = n.parentElement) {
              const o = getComputedStyle(n).overflowX;
              if (o === 'hidden' || o === 'clip' || o === 'auto' || o === 'scroll') return;
            }
            if (!worst || r.right > worst.right) worst = { right: r.right,
              sel: el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') +
                (typeof el.className === 'string' && el.className
                  ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '') };
          });
          return { over: Math.round(over),
                   worst: worst ? worst.sel : '(a transform or a ::before — check both)' };
        });
        if (m.over > 0) { slid.push(f + ' @' + w + 'px +' + m.over + ' [' + m.worst + ']'); break; }
      }
      fs.unlinkSync(tmp);
    }
    check('⚠⚠ NOT ONE page pans sideways at 320 or 390px', slid.length === 0,
      slid.length ? slid.join(' · ') : ALL.length + ' pages swept with the real stylesheet');
  }

  /* ══ PART 1d — THE SITE HEADER, WITH SOMEBODY SIGNED IN ═══════════════════════════
     2026-08-20, Nate, for the THIRD time: *"the window still can slide right and left."*

     ⚠⚠ THE PAGE SWEEPS ABOVE BUILD EVERY PAGE WITH NO HEADER AT ALL. Part 1 and Part 1c
     both open at `<main class="page-content">`, so the one element that is on EVERY page of
     the site — the header row — has never been measured by anything here. It was overflowing
     on every phone, and the reason nobody saw it is the second half:

     ⚠⚠ EVERY PROBE IN THIS REPO IS A SIGNED-OUT VISITOR. The profile pill reads "⬡ Sign in"
     to a blank browser profile and measures 83px; to somebody signed in it carries a codename
     and measures 131 — 48px the three-column header never had. Measured live before the fix:
     +39 at 320, +38 at 360, +24 at 375, +15 at 390, +12 at 393, and a 21-character codename
     slid the window at 500. The narrow-phone ladder in _pjcc-01-core.scss even states the
     assumption out loud ("⌕ + 日本語 + Sign in = 192"). [[local-dev-and-verification]]

     So this renders the REAL `_includes/site-header.html` with the pill filled in — short
     name AND a maximum-length one, because a codename is 24 characters of user input and the
     structural guarantee (`minmax(0, 1fr)` + an ellipsizing pill) is what has to hold, not a
     breakpoint tuned to the length of "Mr. McPuppy".
     ⚠ THE ASSET URLS ARE REWRITTEN BEFORE THE GENERIC LIQUID STRIP. `{{ '/assets/…' |
     relative_url }}` turned into src="x" is a BROKEN IMAGE showing its alt text, and the
     stacked McPuppy wordmark's alt string is far wider than the 28px logo it replaces — the
     probe would then measure a box that does not exist. Same for the @font-face URLs: a
     fallback face renders ~15% wide and invents overflow. */
  {
    const FONTS = siteCss.replace(/\/assets\/fonts\//g, 'file:///' + ROOT.replace(/\\/g, '/') + '/assets/fonts/');
    const hdr = liquid(read('_includes/site-header.html')
      .replace(/\{\{\s*'(\/assets\/[^']+)'\s*\|\s*relative_url\s*\}\}/g,
               'file:///' + ROOT.replace(/\\/g, '/') + '$1'));
    /* ⭐ PROVE THE INSTRUMENT: if the Liquid strip ever eats the control group this check
       goes quietly green on an empty header. */
    check('the header probe is holding a real header',
      /header-top-right/.test(hdr) && /nav-operative/.test(hdr) && /site-mark/.test(hdr),
      hdr.length + ' chars,control group + pill + marks present');

    /* ⛑⛑ THE THIRD ROW IS SIGNED **OUT**, AND ITS ABSENCE HID A REAL BUG FOR ELEVEN DAYS
       (2026-08-31). This block was built on 2026-08-20 to catch a signed-IN header — the pill
       is 48px wider with a codename, and that was the failure of the day — so both rows here
       forced `.in` and a name. **Signed out is the WIDER state on a narrow phone**, and
       nothing ever built it: below 480px the signed-in pill drops the codename and measures
       44px, while "⬡ Sign in" keeps its words and measures 83. So at 320px the ⌕ button sat
       15.41px ON TOP of cW.com, on the default state of every first-time visitor, while this
       check reported the header healthy at 320 twice over.
       ⭐ THE LESSON IS THE SHAPE OF THE LIST, NOT THE MISSING NUMBER. A state toggle is a
       PAIR, and a fixture that only ever builds one side of it proves nothing about the other
       ([[measure-the-real-page]]). `null` means "leave it as the markup ships it", which is
       the one case the harness must not have to construct. */
    const NAMES = [
      ['Mr. McPuppy', 'his own'],
      ['CommanderLongcodename24', 'a 23-char codename'],
      [null, 'SIGNED OUT — the default every visitor arrives in'],
    ];
    const bad = [];
    for (const [nm, why] of NAMES) {
      const tmp = path.join(os.tmpdir(), 'pjcc_hdr_' + Date.now() + '.html');
      fs.writeFileSync(tmp,
        '<!doctype html><html><head><meta charset="utf-8">' +
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
        '<style>' + FONTS + '</style>' +
        '<style>html{overflow-x:visible !important}</style></head><body class="theme-hall">' +
        hdr +
        '<main class="page-content"><div class="wrapper"><div class="page-card">' +
        '<p>a page under the header</p></div></div></main>' +
        /* both branches are copied from pjcc-eggs.js, which is the only thing that writes
           this pill in production — a fixture that renders it any other way is a different
           element (a pinned width, say, cannot ellipsize, and reports overflow the real one
           never has). */
        '<script>(function(){var e=document.getElementById("nav-operative");' +
        'if(!e)return;e.hidden=false;' +
        (nm === null
          ? 'e.classList.remove("in");e.textContent="\\u2B21 Sign in";'
          : 'e.classList.add("in");' +
            'e.innerHTML="\\uD83D\\uDC36 <span class=\\"nav-op-name\\">' + nm + '</span>";') +
        '})();</script>' +
        '</body></html>');
      for (const w of WIDTHS) {
        await page.setViewport({ width: w, height: 800, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
        await page.goto('file:///' + tmp.split(path.sep).join('/'), { waitUntil: 'load' });
        await new Promise((r) => setTimeout(r, 150));
        const m = await page.evaluate(() => {
          const de = document.documentElement, vw = de.clientWidth;
          let escape = 0, sel = '';
          document.querySelectorAll('*').forEach((el) => {
            const r = el.getBoundingClientRect();
            if (!r.width || r.right <= vw + 0.5) return;
            if (getComputedStyle(el).position === 'fixed') return;
            for (let n = el.parentElement; n; n = n.parentElement) {
              const o = getComputedStyle(n).overflowX;
              if (o === 'hidden' || o === 'clip' || o === 'auto' || o === 'scroll') return;
            }
            if (r.right - vw > escape) {
              escape = Math.round(r.right - vw);
              sel = el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') +
                (typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/)[0] : '');
            }
          });
          const pill = document.getElementById('nav-operative');
          const ham = document.querySelector('.nav-toggle');
          /* the three header groups, as boxes, so INTERSECTION can be asserted */
          const groups = ['.header-top-left', '.site-marks', '.header-top-right']
            .map((q) => { const e = document.querySelector(q); if (!e) return null;
              const r = e.getBoundingClientRect();
              return { q, l: Math.round(r.left), r: Math.round(r.right) }; })
            .filter(Boolean).sort((a, c) => a.l - c.l);
          let overlap = '';
          for (let i = 1; i < groups.length; i++)
            if (groups[i].l < groups[i - 1].r - 0.5)
              overlap = groups[i - 1].q + ' (' + groups[i - 1].l + '-' + groups[i - 1].r + ') over ' +
                        groups[i].q + ' (' + groups[i].l + '-' + groups[i].r + ')';
          return { escape, sel, overlap,
            pillW: pill ? Math.round(pill.getBoundingClientRect().width) : 0,
            hamW: ham ? Math.round(ham.getBoundingClientRect().width) : 0,
            /* clipped = the ellipsis is doing the work, i.e. the phone rule is not */
            clipped: pill ? pill.scrollWidth > pill.clientWidth + 1 : false };
        });
        if (m.escape > 0) bad.push(w + 'px/' + why + ': the PAGE pans +' + m.escape + ' (' + m.sel + ')');
        /* ⚠ THE HAMBURGER IS THE OTHER HALF AND IT IS EASY TO BREAK WITH THE SAME FIX. Letting
           the outer tracks shrink would squeeze the ONLY way into the menu on a phone down to
           nothing, and a page that no longer pans because its navigation collapsed is not a
           fix. Track 1 keeps its `auto` minimum for exactly this reason; asserted, not assumed. */
        if (m.hamW < 20) bad.push(w + 'px/' + why + ': the hamburger squeezed to ' + m.hamW + 'px');
        if (m.pillW < 24) bad.push(w + 'px/' + why + ': the profile pill squeezed to ' + m.pillW + 'px');
        /* ⭐⭐ TWO RULES HOLD THIS UP AND EACH NEEDS ITS OWN ASSERTION. The STRUCTURAL one
           (`minmax(0, 1fr)` + an ellipsizing pill) is what the escape check above proves —
           without it the row overflows. The COSMETIC one (below 480px the pill drops the
           codename and shows the avatar alone) is invisible to that check, because a
           truncated pill does not pan the page — it just reads “Mr. McPup…”.
           Delete the phone rule and the escape assertion stays green on a header that looks
           broken, which is exactly the pass that teaches you nothing. So the ellipsis itself
           is the failure: on a phone the pill must never be clipping its own text. */
        if (m.clipped) bad.push(w + 'px/' + why + ': the pill is truncating its own text');
        /* ⭐⭐ THE FAILURE THAT DOES NOT PAN THE PAGE, AND THE REASON THIS LINE EXISTS.
           `1fr auto 1fr` splits free space EQUALLY, not by need — so the control group
           overflows its own too-small track INWARD (it is `justify-self: end`) and lands on
           top of the marks, while `documentElement.scrollWidth` never moves. The first draft
           of this whole check went GREEN under a mutation that restored the buggy tracks,
           for exactly that reason. An escape probe cannot see a collision; only a collision
           probe can. [[green-must-name-what-ran]] */
        if (m.overlap) bad.push(w + 'px/' + why + ': header groups collide — ' + m.overlap);
      }
      fs.unlinkSync(tmp);
    }
    check('⚠⚠ the header fits every phone — signed IN at any codename length, and signed OUT',
      bad.length === 0,
      bad.length ? bad.slice(0, 4).join(' · ')
                 : WIDTHS.join(', ') + 'px × ' + NAMES.length + ' pill states, nothing escapes or collides');
  }

  /* ══ PART 1e — THE TWO NEW SWIPE RAILS ════════════════════════════════════════════
     2026-08-20, Nate: *"The characters are still showing vertical"* (the Park Tables bench)
     and *"I want the achievements to be on one row, slide-able, on the mobile site too."*

     Same contract as the cast rail above, and it is asserted the same way, because the
     failure mode is identical and it is not "the rail does not scroll" — it is a rail that
     scrolls AND takes the document with it. Each one has to satisfy all four at once:
       · it really overflows its own box (otherwise there is nothing to slide)
       · `overscroll-behavior-x: contain`, so a flick off the end does not chain out
       · nothing ESCAPES the viewport with no scroll container between it and <html>
       · a peek wide enough to read as a card, since a phone has no hover and no scrollbar
     ⚠ The markup is lifted out of the SHIPPING source, not retyped here, so a rail that is
     renamed or restructured makes this check fail rather than quietly test a fossil. */
  {
    const bench = read('games/park-tables/index.html');
    const botCard = (bench.match(/'<button class="pt-card pt-bot'[\s\S]{0,400}?<\/span><\/button>'/) || [''])[0];
    const dsr = read('dossier.md');
    const achOwn = (dsr.match(/\.dsr-ach-grid[\s\S]*?\n\}/) || [''])[0];
    /* ⛑⛑ THE BENCH IS TWO RAILS NOW, ONE ROW EACH (2026-08-20). Nate: *"can the rows slide
       separately? and can we re-order the characters so the top row is the easier bots and
       the second row is the harder ones, from left to right?"* So the thing to assert moved
       from `.pt-bots` (one grid, two rows) to `.pt-bots-row` (two grids, one row each) —
       and `rows: 1` here is not a relaxation, it is the ask: a second row inside one of
       these means the shelves have merged back into a grid. */
    const benchCard = (i) =>
      '<button class="pt-card pt-bot" data-bot="b' + i + '" style="--bot:#7ad0a8">' +
      '<span class="pt-card-icon">♜</span><span class="pt-card-t">Maxwell' +
      '<span class="pt-stars"><span class="pt-star pt-star--w pt-star--none"></span>' +
      '<span class="pt-star pt-star--b pt-star--none"></span></span>' +
      '<br><i>Beginner · 400</i></span></button>';
    const RAILS = [
      { name: 'the Park Tables bench — easier shelf', sel: '.pt-bots-row',
        own: (bench.match(/<style>([\s\S]*)<\/style>/) || [, ''])[1],
        rows: 1, n: 4,
        html: (n) => '<div class="pt-actions pt-bots"><div class="pt-bots-row">' +
          Array.from({ length: n }, (_, i) => benchCard(i)).join('') + '</div>' +
          '<div class="pt-bots-row">' +
          Array.from({ length: n }, (_, i) => benchCard(i + n)).join('') + '</div></div>' },
      /* ⭐ THE SECOND SHELF IS ITS OWN ENTRY, NOT AN ASSUMPTION. "Slide separately" is only
         true if there are two scroll containers, so both are measured through selectors
         that cannot resolve to the same element — a single grid wearing the class twice
         would fail the sibling selector outright. */
      { name: 'the Park Tables bench — harder shelf', sel: '.pt-bots-row + .pt-bots-row',
        own: (bench.match(/<style>([\s\S]*)<\/style>/) || [, ''])[1],
        rows: 1, n: 4,
        html: (n) => '<div class="pt-actions pt-bots"><div class="pt-bots-row">' +
          Array.from({ length: n }, (_, i) => benchCard(i)).join('') + '</div>' +
          '<div class="pt-bots-row">' +
          Array.from({ length: n }, (_, i) => benchCard(i + n)).join('') + '</div></div>' },
      { name: 'the dossier trophy shelf', sel: '.dsr-ach-grid',
        own: achOwn ? (dsr.match(/<style>([\s\S]*?)<\/style>/g) || []).map((b) => b.replace(/<\/?style>/g, '')).join('\n') : '',
        rows: 1, n: 12,
        html: (n) => '<div class="dsr-ach-grid">' + Array.from({ length: n }, (_, i) =>
          '<div class="dsr-ach ' + (i < 4 ? 'got' : 'locked') + '"><div class="dsr-ach-icon">⚔</div>' +
          '<div class="dsr-ach-label">Tactician</div>' +
          '<div class="dsr-ach-desc">Solve 25 puzzles</div></div>').join('') + '</div>' },
    ];
    check('the rail probes are holding real card markup',
      !!botCard && !!achOwn,
      (botCard ? 'bench card ' + botCard.length + 'c' : 'NO BENCH CARD') + ' · ' +
      (achOwn ? 'dossier grid rule found' : 'NO DOSSIER RULE'));

    /* ⚠⚠ PROVE THE EXTRACT IS CSS — THIS EXACT PROBE SILENTLY MEASURED JAVASCRIPT FOR ONE
       EDIT (2026-08-20). The bench's stylesheet is lifted with a GREEDY match from the
       first style tag to the last closing one. A comment written into `botsPanel()` on the
       park-tables page happened to contain a literal opening style tag, so the match began
       IN THE MIDDLE OF A FUNCTION and handed the browser 106KB of JavaScript. Chrome parsed
       ZERO rules, the rail rendered as an unstyled div, and nothing here said so — the
       "holding real card markup" check above is about the MARKUP and was perfectly happy.
       ⭐ A probe that assembles its own page has to assert that every part of that page
       arrived, not just the interesting one. [[green-must-name-what-ran]] */
    {
      const own = (bench.match(/<style>([\s\S]*)<\/style>/) || [, ''])[1];
      const tmp = path.join(os.tmpdir(), 'pjcc_cssprobe_' + Date.now() + '.html');
      fs.writeFileSync(tmp, '<!doctype html><meta charset="utf-8"><style>' + own + '</style>');
      await page.goto('file:///' + tmp.split(path.sep).join('/'), { waitUntil: 'load' });
      const m = await page.evaluate(() => {
        try {
          const flat = [];
          (function walk(list) {
            for (const r of list) { flat.push(r); if (r.cssRules) walk([...r.cssRules]); }
          })([...document.styleSheets[0].cssRules]);
          return { n: flat.length,
            rail: flat.filter((r) => /\.pt-bots-row/.test(r.selectorText || '')).length };
        } catch (e) { return { n: -1, rail: 0 }; }
      });
      fs.unlinkSync(tmp);
      /* ⚠ BOTH HALVES, AND THE SECOND IS THE SHARP ONE. The count is a tripwire — the
         failure mode was literally ZERO rules — but a count cannot tell you the RIGHT
         stylesheet arrived. The rail rules are what the two shelf checks below depend on,
         so their presence is the thing worth asserting by name.
         ⭐ 226 is MEASURED (206 top-level + 20 nested), not estimated: the first draft of
         this line guessed a floor of 400 and went red against correct CSS. A number in a
         test is a measurement or it is a bug. [[audit-numbers-can-be-wrong]] */
      check("⚠⚠ the bench's own stylesheet extract really parses as CSS", m.n > 100 && m.rail >= 3,
        m.n + ' rules parsed from ' + own.length + ' chars, ' + m.rail + ' of them the rail' +
        (m.n > 100 && m.rail >= 3 ? '' : '  ← the greedy style-tag match grabbed the wrong thing'));
    }

    for (const rail of RAILS) {
      const tmp = path.join(os.tmpdir(), 'pjcc_rail2_' + Date.now() + '.html');
      fs.writeFileSync(tmp,
        '<!doctype html><html><head><meta charset="utf-8">' +
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
        '<style>' + siteCss + '</style></head><body class="theme-hall">' +
        '<main class="page-content"><div class="wrapper"><div class="page-card">' +
        rail.html(rail.n) + '</div></div></main>' +
        '<style>' + rail.own + '</style></body></html>');
      const bad = [];
      for (const w of WIDTHS) {
        await page.setViewport({ width: w, height: 900, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
        await page.goto('file:///' + tmp.split(path.sep).join('/'), { waitUntil: 'load' });
        await new Promise((r) => setTimeout(r, 180));
        const m = await page.evaluate((sel) => {
          const el = document.querySelector(sel);
          if (!el) return { missing: true };
          const cs = getComputedStyle(el);
          const kids = [...el.children];
          const rows = new Set(kids.map((c) => Math.round(c.getBoundingClientRect().top))).size;
          const vw = document.documentElement.clientWidth;
          let escape = 0, s = '';
          document.querySelectorAll('*').forEach((n2) => {
            const r = n2.getBoundingClientRect();
            if (!r.width || r.right <= vw + 0.5) return;
            if (getComputedStyle(n2).position === 'fixed') return;
            for (let n = n2.parentElement; n; n = n.parentElement) {
              const o = getComputedStyle(n).overflowX;
              if (o === 'hidden' || o === 'clip' || o === 'auto' || o === 'scroll') return;
            }
            if (r.right - vw > escape) {
              escape = Math.round(r.right - vw);
              s = n2.tagName.toLowerCase() + (typeof n2.className === 'string' && n2.className
                ? '.' + n2.className.trim().split(/\s+/)[0] : '');
            }
          });
          const cw = Math.round(el.clientWidth), kw = kids[0].getBoundingClientRect().width;
          const gap = parseFloat(cs.columnGap) || 0;
          const fit = Math.floor((cw + gap) / (kw + gap));
          return { rows, chain: cs.overscrollBehaviorX,
                   scrolls: Math.round(el.scrollWidth - el.clientWidth),
                   peek: Math.round(cw - fit * (kw + gap)), escape, sel: s };
        }, rail.sel);
        if (m.missing) { bad.push(w + 'px: no ' + rail.sel + ' in the probe'); continue; }
        if (m.rows !== rail.rows) bad.push(w + 'px: ' + m.rows + ' rows, want ' + rail.rows);
        if (m.scrolls <= 0) bad.push(w + 'px: the rail does not scroll at all');
        if (m.chain !== 'contain') bad.push(w + 'px: overscroll-behavior-x=' + m.chain);
        if (m.escape > 0) bad.push(w + 'px: the PAGE pans +' + m.escape + ' (' + m.sel + ')');
        if (m.peek < 24) bad.push(w + 'px: the next card peeks only ' + m.peek + 'px');
      }
      fs.unlinkSync(tmp);
      check('⚠⚠ ' + rail.name + ' scrolls sideways and the PAGE still cannot', bad.length === 0,
        bad.length ? bad.slice(0, 4).join(' · ') : WIDTHS.join(', ') + ': ' + rail.rows +
        ' row(s), scoped scroll, a real peek');
    }
  }

  /* ══ PART 1g — THE GAME WINDOW ITSELF ══════════════════════════════════════════
     2026-08-20, Nate, after the page-level slide was fixed: *"The gauntlet game window
     though, still slides left to right unnecessarily. Can we lock that in similarly to the
     full windows of all pages?"*

     ⚠⚠ EVERY OTHER CHECK IN THIS FILE WAS RIGHT TO STAY GREEN, AND SO WAS A LIVE SWEEP.
     A game lives in an iframe whose document sets `html, body { overflow: hidden }`, so the
     game's DOCUMENT can never pan and `scrollWidth - clientWidth` is 0 no matter what goes
     wrong. Measured on the live page at 320/360/390/430, signed out AND with the profile
     bar and the header pill filled in: +0 everywhere. The pan he could feel was one box
     further in.

     ⭐⭐ THE RULE THAT EXPLAINS IT: `overflow-y: auto` DOES NOT LEAVE THE OTHER AXIS ALONE.
     A box with `overflow-y: auto` and no `overflow-x` computes overflow-x to `auto` as well
     — so every full-bleed overlay in every game (the menu, the tower, game over) has always
     been a HORIZONTAL scroll container too. One thing wider than the box and the window
     slides. The Gauntlet's Tower slid 137px at a 320px phone: the secret-floors whisper
     ("the elevator panel has three unmarked buttons") is 44 characters of `white-space:
     nowrap`, 345px wide, inside a 188px stage.

     ⭐ SWEPT, NOT SPOT-FIXED — 18 shells, and the Gauntlet was not alone: PIRC's deck list
     slid 16px and MARCHLAND's home 9px, both only on a 320px phone. [[one-fix-every-instance]]
     ⚠ IT ASKS THE RIGHT QUESTION: not "does the document overflow" but "is there a box that
     IS a scroll container and DOES have somewhere to scroll to". Those are different
     questions and only the second one can see this.
     ⚠ The shells are served over http rather than file:// — several boot a Worker, and a
     worker from a file:// origin never starts. */
  {
    const http = require('http');
    const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.wasm': 'application/wasm',
      '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.jpg': 'image/jpeg' };
    const server = http.createServer((req, res) => {
      const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
      fs.readFile(p, (e, b) => {
        if (e) { res.writeHead(404); return res.end('nope'); }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(p).toLowerCase()] || 'application/octet-stream' });
        res.end(b);
      });
    });
    await new Promise((r) => server.listen(0, r));
    const port = server.address().port;

    const SHELLS = fs.readdirSync(path.join(ROOT, 'assets/games'))
      .filter((f) => f.endsWith('.html')).sort();
    /* ⭐ PROVE THE INSTRUMENT: an empty list is a green run that tested nothing. */
    check('the game-shell sweep found the shells', SHELLS.length >= 15, SHELLS.length + ' shells');

    /* the iframe's INNER width at a 320px and a 390px phone. `.wrapper` is 28px a side and
       `.game-frame-wrap` 14px, and the gauntlet's own rule makes the stage 100vw-84 — all
       three measured on the live page, where the frame came back 232px at 320 and 302 at 390. */
    const STAGES = [232, 302];
    const PANNERS = function () {
      const out = [];
      document.querySelectorAll('*').forEach(function (el) {
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') return;
        const ox = cs.overflowX;
        if (ox !== 'auto' && ox !== 'scroll') return;
        const slide = Math.round(el.scrollWidth - el.clientWidth);
        if (slide <= 1) return;
        /* name what is actually past the edge — a failure has to point at the element or
           the next person re-runs the whole investigation. A text node overflowing its own
           box (an unbreakable word, a trailing letter-spacing) reports NO element, and that
           reads as its own answer rather than as "clean". */
        const br = el.getBoundingClientRect();
        const edge = br.left + el.clientLeft + el.clientWidth - parseFloat(cs.paddingRight || 0);
        let worst = null;
        el.querySelectorAll('*').forEach(function (k) {
          const r = k.getBoundingClientRect();
          if (!r.width || r.right <= edge + 0.5) return;
          if (!worst || r.right > worst.right) worst = { right: r.right,
            sel: k.tagName.toLowerCase() + (k.id ? '#' + k.id : '') +
              (typeof k.className === 'string' && k.className ? '.' + k.className.trim().split(/\s+/)[0] : '') };
        });
        out.push({ slide, box: Math.round(el.clientWidth),
          sel: el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') +
            (typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/)[0] : ''),
          worst: worst ? worst.sel : '(a text run or a ::before — check both)' });
      });
      return out;
    };

    const slid = [];
    for (const shell of SHELLS) {
      for (const w of STAGES) {
        await page.setViewport({ width: w, height: Math.round(w * 1.1364 + 228),
          deviceScaleFactor: 1, isMobile: true, hasTouch: true });
        await page.goto('http://127.0.0.1:' + port + '/assets/games/' + shell, { waitUntil: 'load' });
        await new Promise((r) => setTimeout(r, 500));
        let found = await page.evaluate(PANNERS);
        /* ⚠ THE TOWER IS A SECOND SCREEN AND IT IS THE ONE THAT WAS BROKEN. A shell's home
           screen is not its only overlay, and the bug he reported was one click in. Only
           the Gauntlet is driven — the others have no equivalent list — so this is coverage
           of one extra screen, not of every screen, and saying so is the point. */
        if (/gauntlet/.test(shell) && !found.length) {
          try {
            await page.click('#play-btn');
            await new Promise((r) => setTimeout(r, 450));
            found = await page.evaluate(PANNERS);
          } catch (e) { /* no button on this shell — the home-screen result stands */ }
        }
        if (found.length) {
          slid.push(shell + ' @' + w + 'px: ' + found[0].sel + ' pans ' +
            found[0].slide + 'px [' + found[0].worst + ']');
          break;
        }
      }
    }
    server.close();
    check('⚠⚠ NOT ONE game window can be panned sideways inside its frame', slid.length === 0,
      slid.length ? slid.slice(0, 4).join(' · ')
        : SHELLS.length + ' shells × ' + STAGES.join('/') + 'px stages, + the Gauntlet\'s Tower');
  }

  /* ══ PART 1f — A TABLE CAN LOSE A COLUMN WITHOUT THE WINDOW MOVING ═════════════
     2026-08-20, Nate: *"the Leaderboard isn't fully visible on mobile. You can't see how
     many credits users have."*

     ⚠⚠ EVERY OTHER CHECK IN THIS FILE WAS RIGHT TO STAY GREEN. `document.scrollWidth`
     measured exactly 360 and 390 the whole time — the leaderboard card CLIPS its overflow
     instead of passing it up, so the page never panned by a pixel while the credits column
     sat 72px outside the card. This is the same lesson as the header collision in PART 1d,
     one layer down: **an escape probe cannot see a clip.** A table cannot shrink below the
     sum of its columns' min-content widths; `width: 100%` neither helps nor warns.

     Measured against the DEPLOYED stylesheet before the fix: Overall clipped by 72px at 360
     and 42px at 390, and *Fork in the Road* by 67px and 37px — two boards, not one. So this
     walks EVERY tab rather than the one that was reported.

     ⚠ IT DRIVES THE LIVE PAGE WITH THE LOCAL STYLESHEET GRAFTED IN AT ITS OWN PLACE IN THE
     CASCADE. The rows are built by pjcc-leaderboard.js from real data, and the page carries
     its own <style> that beats anything appended to <head> — a local repro of the markup
     would be a copy of the renderer that drifts from it, and would prove nothing about the
     names actually on the board. Intercepting the stylesheet REQUEST keeps the cascade
     honest. ══════════════════════════════════════════════════════════════════ */
  {
    const LB = 'https://chesswild.com/leaderboards/';
    const LB_WIDTHS = [[320, 720], [360, 780], [390, 844], [430, 900], [844, 390]];
    const bad = [];
    let boards = 0, reached = false;
    for (const [w, h] of LB_WIDTHS) {
      const pg = await browser.newPage();
      await pg.setViewport({ width: w, height: h, hasTouch: true, isMobile: true });
      await pg.setRequestInterception(true);
      pg.on('request', (r) => r.url().includes('/assets/css/style.css')
        ? r.respond({ status: 200, contentType: 'text/css; charset=utf-8', body: siteCss })
        : r.continue());
      try {
        await pg.goto(LB, { waitUntil: 'networkidle2', timeout: 45000 });
        await new Promise((r) => setTimeout(r, 3000));
        const tabs = await pg.evaluate(() =>
          [...document.querySelectorAll('.lb-tab')].map((t) => t.textContent.trim()));
        if (tabs.length) reached = true;
        for (let i = 0; i < tabs.length; i++) {
          await pg.evaluate((n) => document.querySelectorAll('.lb-tab')[n].click(), i);
          await new Promise((r) => setTimeout(r, 1400));
          const res = await pg.evaluate(() => {
            const out = [];
            document.querySelectorAll('.lb-table').forEach((t) => {
              const host = t.parentElement, hr = host.getBoundingClientRect();
              let over = 0;
              /* every CELL, not the table's own box: a table that overflows its container
                 reports its own width happily and it is the right-hand column that is gone. */
              t.querySelectorAll('td, th').forEach((c) => {
                over = Math.max(over, c.getBoundingClientRect().right - hr.right);
              });
              if (over > 0.5) out.push(Math.round(over));
            });
            return out;
          });
          boards++;
          if (res.length) bad.push(w + 'px "' + tabs[i] + '" +' + res.join('/') + 'px past the card');
        }
      } catch (e) { bad.push(w + 'px: ' + e.message); }
      await pg.close();
    }
    /* ⚠ A BOARD THAT NEVER LOADED IS NOT A BOARD THAT FITS. Without this the whole check
       passes on an empty page — the classic gate that goes green because it found nothing. */
    check('the leaderboard actually rendered its boards', reached && boards >= 5,
      boards + ' board renders across ' + LB_WIDTHS.length + ' widths');
    check('⚠⚠ no leaderboard column runs past its card on a phone', bad.length === 0,
      bad.length ? bad.slice(0, 4).join(' · ') : LB_WIDTHS.map((x) => x[0]).join(', ')
        + 'px × every board, credits fully on screen');
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
