/* sweep.js — the dead-code sweep: CSS classes, @keyframes, and JS files that
 * nothing references any more.
 *
 * Run: npm run sweep        (report only — it never edits anything)
 *
 * THE TRAPS (this is why past hand-sweeps produced false positives — do not
 * "fix" anything this script marks DYNAMIC without reading the code):
 *   1. JS-CONCATENATED names. The engines build class names at runtime:
 *        'town-rain-' + level      → town-rain-light | -med | -heavy
 *        'sky-' + phase            → sky-dawn | sky-day | sky-dusk | sky-night
 *      The literal string never appears anywhere, so a naive grep calls it dead.
 *      We therefore also accept a class whose dash-prefix appears in any .js/.html.
 *   2. LIQUID-COMPUTED names ({{ ... }} inside a class attribute) — same problem.
 *   3. Classes only ever added via classList.add('x') still count as used, because
 *      we search raw source text, not just class="" attributes.
 *
 * So: DEAD  = the name appears nowhere but its own stylesheet (safe to delete).
 *     DYNAMIC = only a prefix matches; a runtime string probably builds it (keep).
 */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const SKIP_DIRS = new Set(['node_modules', '.git', '_site', 'assets/vendor']);
function walk(dir, acc) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = path.relative(ROOT, path.join(dir, e.name)).split(path.sep).join('/');
    if (SKIP_DIRS.has(e.name) || SKIP_DIRS.has(rel)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}
const files = walk(ROOT, []);
const rel = f => path.relative(ROOT, f).split(path.sep).join('/');
const read = f => { try { return fs.readFileSync(f, 'utf8'); } catch (e) { return ''; } };

// stylesheets now live as partials in _sass/ (compiled into one style.css by Jekyll)
const cssFiles = files.filter(f => /\.(scss|css)$/i.test(f) && !/vendor/.test(rel(f)));
// everything a class name could be referenced from (markup, Liquid, and JS)
const srcFiles = files.filter(f => /\.(html|md|js|json|yml)$/i.test(f) && !/vendor/.test(rel(f)));
const srcText = new Map(srcFiles.map(f => [rel(f), read(f)]));
const jsText  = srcFiles.filter(f => /\.(js|html)$/i.test(f)).map(f => read(f)).join('\n');

/* ---- collect declared class selectors + keyframes from the stylesheets ---- */
const declared = new Map();   // class -> stylesheet it's declared in
const keyframes = new Map();
for (const f of cssFiles) {
  const txt = read(f);
  const body = txt.replace(/\/\*[\s\S]*?\*\//g, '');            // drop comments
  for (const m of body.matchAll(/\.(-?[A-Za-z_][\w-]*)/g)) {
    if (!declared.has(m[1])) declared.set(m[1], rel(f));
  }
  for (const m of body.matchAll(/@keyframes\s+([\w-]+)/g)) keyframes.set(m[1], rel(f));
}

/* ---- is a name referenced anywhere OUTSIDE the stylesheets? ---- */
const cssOwn = new Set(cssFiles.map(f => rel(f)));
function usedSomewhere(name) {
  for (const [f, txt] of srcText) {
    if (cssOwn.has(f)) continue;
    if (txt.includes(name)) return f;
  }
  return null;
}
// Markup where a class could be Liquid-interpolated: class="ep-card--accent-{{ accent }}"
const liquidText = srcFiles.filter(f => /\.(html|md)$/i.test(f)).map(f => read(f)).join('\n');

// trap #1: a JS string builds the tail  ('town-' + kind, 'town-rain-' + level)
// trap #2: LIQUID builds the tail       (ep-card--accent-{{ accent }})
// Both make the full literal appear nowhere — deleting them breaks the live site.
// NB: the JS test looks for the prefix as a COMPLETE string literal ('town-rain-'),
// because that is what concatenation actually looks like:  'town-' + kind.
// A loose "starts with" test matches any incidental string (every 'chess-…' literal
// would rescue .chess-clock-wrap) and would hide real dead code.
function builtDynamically(name) {
  const parts = name.split('-');
  for (let i = parts.length - 1; i >= 1; i--) {
    const prefix = parts.slice(0, i).join('-') + '-';
    if (prefix.length < 4) continue;                 // too short to be meaningful
    for (const q of ["'", '"', '`']) {
      if (jsText.includes(q + prefix + q)) return prefix + "' + … (JS)";
    }
    if (liquidText.includes(prefix + '{{')) return prefix + "{{…}} (Liquid)";
  }
  return null;
}

/* ---- the ALLOWLIST of runtime-built class names ------------------------------------
 * Class names assembled at runtime ('town-' + kind, ep-card--accent-{{ i }}) are
 * INVISIBLE to every tool: grep can't find them, this sweep can't verify them, and the
 * next person to tidy up will delete live CSS. They are a trap, so the rule is:
 * DON'T ADD NEW ONES. Build a fixed set of classes and pick between them instead.
 *
 * These two already exist and are legitimate, so they're allowed by name. Anything else
 * that turns up FAILS the sweep — which forces a conscious decision rather than a quiet
 * accumulation of un-checkable CSS. If you truly need another, add it here on purpose.
 */
const ALLOWED_DYNAMIC = [
  'town-',             // pjcc-weather.js:  'town-' + kind, 'town-rain-' + level
  'sky-',              // town-weather.html: 'sky-' + phase
  'cloud-',            // town-weather.html: 'cloud-' + PJCC_TIME.clouds()  (0..3 cover)
  'ep-card--accent-',  // blog.md (Liquid):  ep-card--accent-{{ accent }}
];
const allowedDyn = (cls) => ALLOWED_DYNAMIC.some((p) => cls.startsWith(p));

const dead = [], dynamic = [], unlistedDynamic = [];
for (const [cls, where] of declared) {
  if (usedSomewhere(cls)) continue;
  const dyn = builtDynamically(cls);
  if (!dyn) { dead.push({ cls, where }); continue; }
  dynamic.push({ cls, where, dyn });
  if (!allowedDyn(cls)) unlistedDynamic.push({ cls, where, dyn });
}

const deadFrames = [];
for (const [kf, where] of keyframes) {
  // a keyframe is used if some `animation`/`animation-name` mentions it
  let used = false;
  for (const f of cssFiles) {
    const body = read(f).replace(/@keyframes\s+[\w-]+/g, '');
    if (new RegExp('animation(?:-name)?\\s*:[^;}]*\\b' + kf.replace(/[-]/g, '\\-') + '\\b').test(body)) { used = true; break; }
  }
  if (!used && !usedSomewhere(kf)) deadFrames.push({ kf, where });
}

/* ---- JS files nothing loads ---- */
const jsAssets = files.filter(f => /^assets\/js\/.+\.js$/.test(rel(f)));
const deadJs = jsAssets.filter(f => {
  const base = path.basename(f);
  for (const [name, txt] of srcText) {
    if (name === rel(f)) continue;
    if (txt.includes(base)) return false;
  }
  return true;
});

/* ---- report ---- */
const line = s => console.log(s);
line('\n=== DEAD-CODE SWEEP ===');
line('scanned ' + cssFiles.length + ' stylesheet(s), ' + srcFiles.length + ' source file(s)\n');

line('— CSS classes declared but referenced NOWHERE (safe to delete): ' + dead.length);
dead.sort((a, b) => a.cls.localeCompare(b.cls)).forEach(d => line('    .' + d.cls + '   (' + d.where + ')'));

line('\n— @keyframes never animated (safe to delete): ' + deadFrames.length);
deadFrames.forEach(d => line('    @keyframes ' + d.kf + '   (' + d.where + ')'));

line('\n— JS in assets/js nothing loads: ' + deadJs.length);
deadJs.forEach(f => line('    ' + rel(f)));

line('\n— DYNAMIC (built at runtime — DO NOT DELETE, listed so you know why they look unused): ' + dynamic.length);
dynamic.sort((a, b) => a.cls.localeCompare(b.cls)).forEach(d => line('    .' + d.cls + '   ← built from "' + d.dyn + '"'));

/* ---- verdict: this is a GATE, not just a report --------------------------------
 * It fails on dead code (so "0 dead" actually stays 0 instead of quietly rotting) and
 * on any NEW runtime-built class name (so the un-checkable-CSS trap can't spread). */
const rot = dead.length + deadFrames.length + deadJs.length;
let failed = false;

if (rot > 0) {
  failed = true;
  line('\n✗ FAIL — ' + rot + ' dead thing(s) above. Delete them (git keeps them), or the');
  line('         rot compounds until nobody dares touch the stylesheet again.');
}
if (unlistedDynamic.length) {
  failed = true;
  line('\n✗ FAIL — ' + unlistedDynamic.length + ' NEW runtime-built class name(s):');
  unlistedDynamic.forEach(d => line('    .' + d.cls + '   ← built from "' + d.dyn + '"'));
  line('         Names assembled at runtime are invisible to grep and to this sweep, so the');
  line('         next cleanup deletes live CSS. Prefer a fixed set of classes you switch');
  line('         between. If you really need this one, add its prefix to ALLOWED_DYNAMIC.');
}

line(failed ? '\nRESULT: FAIL\n' : '\nRESULT: PASS — nothing dead, no new un-checkable class names\n');
process.exit(failed ? 1 : 0);
