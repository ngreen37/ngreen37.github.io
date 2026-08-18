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

console.log('\n=== CSS CHECK ===');
console.log('  ✓ PASS  style.scss compiles (' + partials + ' partials in _sass/)');
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
