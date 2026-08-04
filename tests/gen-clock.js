/* ═══════════════════════════════════════════════════════════════════════════════════
 * gen-clock.js — copy the town clock out to a file the games can load
 *   node tests/gen-clock.js      (npm run gen:clock)
 * -----------------------------------------------------------------------------------
 * SOURCE OF TRUTH: _includes/pjcc-time.js. Site pages INLINE it before first paint
 * (_includes/town-weather.html) because the sky classes have to be on <html> before a
 * pixel renders. The game shells are standalone documents in /assets/games/ that Jekyll
 * never touches and that cannot `{% include %}` anything, so they need a URL.
 *
 * ⚠ WHY THIS IS A GENERATOR AND NOT A JEKYLL-BUILT ASSET, which is what shipped first.
 * `assets/js/pjcc-time.js` was originally two lines of front matter and one
 * `{% include pjcc-time.js %}` — correct in production, and broken everywhere else: the
 * file ON DISK was Liquid, not JavaScript. Every local harness serves the repo's own
 * files straight off disk, so the moment the shells started loading it,
 * tests/gauntlet.check.js started reporting eighteen "Uncaught SyntaxError: Invalid or
 * unexpected token" — one per page load — while every one of its assertions still passed.
 * A file that is only valid after a build is a file no test can see.
 *
 * So the copy is committed, real JavaScript, and tests/townsky.check.js fails if it has
 * drifted from the include by one character. Same shape as gen-blocklist / gen-favicon.
 * ═══════════════════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, '_includes/pjcc-time.js');
const OUT = path.join(ROOT, 'assets/js/pjcc-time.js');

const BANNER =
`/* ⚠ GENERATED FILE — DO NOT EDIT. Run \`npm run gen:clock\` after editing the source.
 * Source of truth: _includes/pjcc-time.js (which site pages inline before first paint).
 * This copy exists so the standalone game shells in /assets/games/ can <script src> the
 * same clock instead of carrying a second one. tests/townsky.check.js fails if the two
 * ever differ. Everything below this banner is a byte-for-byte copy. */
`;

const body = fs.readFileSync(SRC, 'utf8');
fs.writeFileSync(OUT, BANNER + body);
console.log(`  wrote assets/js/pjcc-time.js  (banner + ${body.length} bytes of _includes/pjcc-time.js)`);
