/* css.check.js — compile the stylesheet the way GitHub Pages will, and fail loudly
 * if it won't build.
 *
 * Run: npm run test:css
 *
 * WHY THIS EXISTS: the site is built by GitHub Pages (Jekyll) on push, and Jekyll
 * compiles assets/css/style.scss. If that SCSS has a syntax error, the BUILD FAILS and
 * the whole site goes stale — and you only find out from a failed-build email. There
 * was no way to catch it locally (the old workaround was counting braces by hand).
 * Now dart-sass is a devDependency and this compiles the real thing, imports and all.
 *
 * It also prints the compressed size, which is what visitors actually download.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

let sass;
try { sass = require('sass'); }
catch (e) { console.error('dart-sass not installed. Run `npm install` first.'); process.exit(2); }

const entry = path.join(ROOT, 'assets', 'css', 'style.scss');
const src = fs.readFileSync(entry, 'utf8').replace(/^---\s*\n---\s*\n/, '');   // drop Jekyll front matter

let out;
try {
  out = sass.compileString(src, {
    loadPaths: [path.join(ROOT, '_sass')],
    style: 'expanded',
    silenceDeprecations: ['import'],   // Jekyll still uses @import; that's fine
  });
} catch (e) {
  console.error('\n=== CSS CHECK ===');
  console.error('  ✗ FAIL  style.scss does NOT compile — GitHub Pages would fail this build:\n');
  console.error(e.message);
  process.exit(1);
}

const min = sass.compileString(src, {
  loadPaths: [path.join(ROOT, '_sass')],
  style: 'compressed',
  silenceDeprecations: ['import'],
}).css;

const partials = fs.existsSync(path.join(ROOT, '_sass'))
  ? fs.readdirSync(path.join(ROOT, '_sass')).filter((f) => f.endsWith('.scss')).length
  : 0;

/* ══ THE OTHER HALF OF THE SITE'S CSS — ADDED 2026-08-17 ═══════════════════════════
   Everything above compiles `_sass/`. But several rooms carry hundreds of lines of CSS
   in an inline <style> block — the Park Tables alone has ~500 — and NOTHING checked
   those. They are not SCSS, so they never reached the compiler; they are inside HTML, so
   the tag checker walked past them.

   ⚠⚠ THAT GAP SHIPPED A LIVE BUG AND HELD IT FOR FOUR DAYS. A comment in the Park Tables'
   style block was closed twice — once at the end of a paragraph, once again four lines
   later — so a CSS parser read everything between the two closers plus the following
   selector as ONE invalid selector, and DISCARDED the rule attached to it. Measured in a
   real browser: `rulesParsed=0`, `.pt-note` computed `display:block` instead of `flex`.
   Auston's note lost its panel, its left rule, its wash and its entry animation, and
   nothing anywhere errored — a CSS parser recovers by deleting, silently, by design.

   ⭐ WHY SASS IS THE RIGHT INSTRUMENT FOR PLAIN CSS: every valid stylesheet is valid SCSS,
   and dart-sass FAILS where a browser SHRUGS. That asymmetry is the whole value — the
   browser's error recovery is exactly what made this invisible.

   ⚠ Liquid is stripped first. These blocks are Jekyll templates, so `{{ ... }}` and
   `{% ... %}` are legitimate there and are not CSS; leaving them in would produce a wall
   of false failures and this check would be turned off within a week.

   ⚠⚠ AND LIQUID COMMENTS MUST BE STRIPPED WITH THEIR CONTENTS, WHICH IS NOT THE SAME
   RULE. `{% comment %} … {% endcomment %}` deletes everything BETWEEN the tags — that is
   what it is for, and the homepage uses it to park a paragraph of prose inside a <style>
   block. Removing only the two tags leaves that prose sitting in the CSS, and the first
   draft of this check duly reported the homepage as broken twice. It was not: Jekyll
   never ships that text. PROVE THE INSTRUMENT BEFORE BELIEVING ITS FINDING —
   two of this check's first three "failures" were its own. [[audit-numbers-can-be-wrong]] */
const LIQUID_COMMENT = /\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\}/gi;
const LIQUID = /\{\{[\s\S]*?\}\}|\{%[\s\S]*?%\}/g;
const STYLE  = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;

function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '_site' || e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(html|md)$/i.test(e.name)) out.push(p);
  }
  return out;
}

let inlineBlocks = 0, inlineFiles = 0;
const inlineFails = [];
for (const file of walk(ROOT, [])) {
  const text = fs.readFileSync(file, 'utf8');
  let m, found = false;
  STYLE.lastIndex = 0;
  while ((m = STYLE.exec(text)) !== null) {
    const css = m[1].replace(LIQUID_COMMENT, ' ').replace(LIQUID, ' ');
    if (!css.trim()) continue;
    inlineBlocks++; found = true;
    // the line the block starts on, so a failure points at somewhere you can open
    const line = text.slice(0, m.index).split('\n').length;
    try {
      sass.compileString(css, { style: 'compressed', silenceDeprecations: ['import'] });
    } catch (e) {
      inlineFails.push({
        file: path.relative(ROOT, file).replace(/\\/g, '/'),
        line,
        msg: (e.message || '').split('\n').slice(0, 3).join(' / ')
      });
    }
  }
  if (found) inlineFiles++;
}

/* ══ THE FRONT DOOR'S SHEET IS A FOUR-LAYER STACK AND THE LAYERS ARE POSITIONAL ═════
   Added 2026-08-21 with the screen-anchored ramp (_pjcc-25-front-door.scss). `.page-card`
   on `theme-chess` paints three background images — top light · parchment · backlight —
   and now a matching three-item `background-attachment` list, because only the MIDDLE one
   is pinned to the viewport. Two ways that breaks silently, both visual-only:

     1. somebody writes the `background` SHORTHAND, which resets every longhand it does not
        name and erases three layers. The partial has warned about this in prose since
        2026-08-12; prose is not a check.
     2. somebody adds or removes an IMAGE without touching the ATTACHMENT list. The lists
        are matched by position and the shorter one REPEATS, so a fourth image would make
        the top light `fixed` and the parchment `scroll` — the exact inverse of the design,
        with no error anywhere.

   So this asserts the two lists are the same length and that the pinned one is the
   parchment. It reads the COMPILED stylesheet, not the source, and strips comments first —
   a check that can pass on its own documentation is not a check. */
const RULE = /body\.theme-chess\s+\.page-card\s*\{([^}]*)\}/;
const decls = (out.css.replace(/\/\*[\s\S]*?\*\//g, ' ').match(RULE) || [])[1];
const layers = (s) => {
  let d = 0, n = 1;
  for (const ch of s) { if (ch === '(') d++; else if (ch === ')') d--; else if (ch === ',' && !d) n++; }
  return n;
};
const stackFails = [];
if (!decls) stackFails.push('body.theme-chess .page-card has no rule in the compiled CSS');
else {
  const img = (decls.match(/background-image:([^;]*)/) || [])[1];
  const att = (decls.match(/background-attachment:([^;]*)/) || [])[1];
  if (/(^|[;{\s])background\s*:/.test(decls))
    stackFails.push('the `background` shorthand is back on .page-card — it erases the other layers');
  if (!img) stackFails.push('no background-image — the sheet stack is gone');
  if (!att) stackFails.push('no background-attachment — nothing is pinned to the viewport any more');
  if (img && att && layers(img) !== layers(att))
    stackFails.push('background-image has ' + layers(img) + ' layers but background-attachment has ' +
                    layers(att) + ' — the shorter list repeats and pins the wrong layer');
  /* ⚠ the fallback inside `var(--sheet-anchor, scroll)` carries its OWN comma — matching
     this with `[^,]*` fails on the correct value, which is how the first draft of this
     check reported a green stylesheet as broken. Match the parenthesis, not the comma. */
  if (att && !/^\s*scroll\s*,\s*var\(\s*--sheet-anchor\s*,\s*scroll\s*\)\s*,\s*scroll\s*$/.test(att))
    stackFails.push('background-attachment is "' + att.trim() + '" — the PARCHMENT (middle) is the ' +
                    'only layer that may be pinned; the top light and the backlight are measured ' +
                    'from the card\'s own top and must stay `scroll`');
}
/* …and the ramp itself: the viewport anchor and stops cut to the city's 52vh box. Both are
   asserted, because a rule that reads "ramp OR anchor" would stay green with either half
   deleted — and either half alone does nothing at all. */
if (!/@media\s*\(min-width:\s*701px\)\s*\{\s*body\.theme-chess\s*\{[^}]*--sheet-anchor:\s*fixed/.test(
      out.css.replace(/\/\*[\s\S]*?\*\//g, ' ')))
  stackFails.push('no `--sheet-anchor: fixed` above 701px — the ramp would follow the CARD, ' +
                  'which is correct at exactly one scroll position');
if (!/--sheet:\s*linear-gradient\(180deg[^;]*vh[^;]*vh[^;]*\)/.test(
      out.css.replace(/\/\*[\s\S]*?\*\//g, ' ')))
  stackFails.push('no vh-stopped `--sheet` ramp above 701px — the stops are cut to the ' +
                  'city\'s max(52vh, 22vw) box and must stay in the same unit');

console.log('\n=== CSS CHECK ===');
console.log('  ✓ PASS  style.scss compiles (' + partials + ' partials in _sass/)');
if (stackFails.length) {
  console.error('  ✗ FAIL  the front door\'s sheet stack:');
  for (const f of stackFails) console.error('          — ' + f);
  console.error('\n  See the `--surface` note in _sass/_pjcc-25-front-door.scss.');
  console.error('\nRESULT: FAIL\n');
  process.exit(1);
}
console.log('  ✓ PASS  the front door\'s sheet: 3 layers, 3 anchors, only the parchment pinned');
console.log('  ✓ PASS  expanded:   ' + (out.css.length / 1024).toFixed(1) + ' KB');
console.log('  ✓ PASS  compressed: ' + (min.length / 1024).toFixed(1) + ' KB   ← what visitors download');

if (inlineFails.length) {
  console.error('  ✗ FAIL  ' + inlineFails.length + ' of ' + inlineBlocks +
                ' inline <style> blocks do not parse:');
  for (const f of inlineFails) console.error('          ' + f.file + ':' + f.line + '  — ' + f.msg);
  console.error('\n  A browser would not error on these. It would DELETE the affected rule' +
                '\n  and render on, which is why this check exists.');
  console.error('\nRESULT: FAIL\n');
  process.exit(1);
}
console.log('  ✓ PASS  ' + inlineBlocks + ' inline <style> blocks parse (' + inlineFiles + ' files)');
console.log('\nRESULT: PASS\n');
process.exit(0);
