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

console.log('\n=== CSS CHECK ===');
console.log('  ✓ PASS  style.scss compiles (' + partials + ' partials in _sass/)');
console.log('  ✓ PASS  expanded:   ' + (out.css.length / 1024).toFixed(1) + ' KB');
console.log('  ✓ PASS  compressed: ' + (min.length / 1024).toFixed(1) + ' KB   ← what visitors download');
console.log('\nRESULT: PASS\n');
process.exit(0);
