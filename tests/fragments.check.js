/* fragments.check.js — the six-slot ledger, and the one bug it cannot see itself.
 *
 *   Run: npm run test:frag        Exits non-zero on any failure.
 *
 * WHY THIS FILE EXISTS, AND IT IS NOT THE OBVIOUS REASON. The ledger
 * (assets/js/pjcc-fragments.js) is small, pure and easy to read; nothing about IT needs a
 * test. What needs a test is the seam between the ledger and the eggs, because every mint
 * call on this site is written defensively:
 *
 *     window.PJCCFrag && PJCCFrag.mint('sky')
 *
 * That guard is correct — an egg must never throw on a page it merely shares — and it is
 * also the quietest failure mode this site can produce. If the ledger is not on the page,
 * the door clicks, nothing throws, nothing logs, and the fragment is simply never counted.
 * An egg you CANNOT win is pixel-identical to an egg you have not won yet. There is no
 * screenshot that shows it and no console line that admits it.
 *
 * ⛑⛑ IT ALREADY HAPPENED, ON DAY ONE, TO THE FLAGSHIP. _layouts/easter-eggs.html is a
 * standalone layout — its own <!DOCTYPE html>, not an extension of _layouts/default.html
 * where the ledger's script tag was added. So /classified/, the Alpine File, FRAGMENT ONE,
 * the entire reason the flickering "i" was moved onto a public page, minted nothing for a
 * day. The comment sitting directly above the broken call read "pjcc-fragments.js is
 * `defer` and has not executed yet" — a precise and confident statement about load ORDER
 * for a file that was not loaded at all.
 *
 * ⭐ SO THE CHECK THAT MATTERS IS #6, AND IT DERIVES ITS OWN LIST. It greps for mint calls
 * rather than being told where they are, so a mint added in a new file fails here until
 * somebody says which page carries it. [[dead-game-links-trap]] — derive the list, never
 * retype it.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

let PASS = 0, FAIL = 0;
const fails = [];
function ok(cond, msg, detail) {
  if (cond) { PASS++; console.log('  ✓ ' + msg); }
  else { FAIL++; fails.push(msg); console.log('  ✗ ' + msg + (detail ? '\n      ' + detail : '')); }
}
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8').replace(/\r\n/g, '\n');
const has = (p) => fs.existsSync(path.join(ROOT, p));

console.log('\n=== THE FRAGMENT LEDGER — six slots, and every door that feeds them ===\n');

/* ── 1 · the ledger, and the shape of a slot ───────────────────────────────────── */
const LEDGER = 'assets/js/pjcc-fragments.js';
ok(has(LEDGER), 'the ledger exists: ' + LEDGER);
const src = read(LEDGER);

const target = (src.match(/var TARGET = (\d+)/) || [])[1];
ok(target === '6', 'TARGET is 6 — six fragments open the world', 'found: ' + target);

/* Parse the SLOTS array out of the file rather than requiring it: this is a browser IIFE
   that touches `document` and `localStorage` at load, so running it under node would need
   a DOM shim, and a shim is a second implementation of the thing being tested. */
const slotBlock = src.slice(src.indexOf('var SLOTS = ['), src.indexOf('var TARGET'));
const SLOTS = [];
const slotRe = /\{\s*id:\s*'([a-z0-9_]+)',\s*flag:\s*'([a-z0-9_]+)',\s*nm:\s*'([^']+)'\s*\}/g;
let m;
while ((m = slotRe.exec(slotBlock)) !== null) SLOTS.push({ id: m[1], flag: m[2], nm: m[3] });

ok(SLOTS.length === 3, 'three slots are filled — alpine · sky · road',
   'found ' + SLOTS.length + ': ' + SLOTS.map(s => s.id).join(' · '));
ok(SLOTS.length < +target,
   'the set is NOT complete — TARGET stays ahead so the count tells the truth about the journey');
ok(new Set(SLOTS.map(s => s.id)).size === SLOTS.length, 'every slot id is unique');
ok(new Set(SLOTS.map(s => s.flag)).size === SLOTS.length, 'every slot flag is unique');
ok(SLOTS.every(s => /^frag_/.test(s.flag)), 'every flag is namespaced frag_*');
ok(SLOTS.every(s => s.nm && s.nm.length > 2), 'every slot has a human name for the reveal');

/* ── 2 · the sticky unlock, and what it must never be called ───────────────────── */
ok(/if \(get\(UNLOCK\)\) return true;/.test(src),
   'the unlock is STICKY — held once, never re-derived from the count');
ok(/API\.count\(\) >= TARGET/.test(src), 'unlocked() also answers true on a live count of six');

/* ── 3 · the pre-overhaul flags stay out of the count ──────────────────────────── */
const RETIRED = ['frag_404', 'frag_archive', 'frag_promotion', 'frag_murphys_law',
                 'frag_subjectzero', 'frag_companion', 'frag_portal', 'frag_eclipse',
                 'frag_konami', 'frag_qd5', 'frag_board_park', 'frag_board_night'];
const enrolled = RETIRED.filter(f => SLOTS.some(s => s.flag === f));
ok(enrolled.length === 0,
   'no pre-overhaul flag is enrolled — a July browser cannot wake up part-way to an unlock',
   'enrolled: ' + enrolled.join(' · '));

/* ── 4 · every mint(...) with a literal argument names a real slot ─────────────── */
/* ⛑⛑ THE FIRST VERSION OF THIS WALKER FOUND NOTHING, AND EVERYTHING BELOW IT PASSED.
   It recursed from `walk('')`, so every path came back with a leading slash — `/assets/js/…`
   — and the filter after it asked `startsWith('assets/js/')`. Zero files. Which made
   `minters` empty, which made §6's per-host loop run zero assertions, which meant THE CHECK
   WRITTEN FOR THE DAY-ONE BUG WAS NOT RUNNING AT ALL. The suite printed 26 green either way.
   ⭐⭐ A DERIVED LIST THAT COMES BACK EMPTY LOOKS EXACTLY LIKE A CLEAN REPO — and in a file
   that scans FOR problems, "found nothing" is the expected result, so nothing about the
   output looked wrong. The scan now asserts its own size out loud: a search is not evidence
   until it proves it searched something. [[green-must-name-what-ran]]
   Caught by mutation-testing, which is the only reason it is not still sitting here. */
const SCAN_DIRS = ['assets/js', 'assets/games', '_layouts', '_includes'];
const scanned = [];
function walk(dir) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return;
  for (const e of fs.readdirSync(abs, { withFileTypes: true })) {
    const rel = dir + '/' + e.name;
    if (e.isDirectory()) walk(rel);
    else if (/\.(js|html)$/.test(e.name) && rel !== LEDGER) scanned.push(rel);
  }
}
SCAN_DIRS.forEach(walk);

const minters = [];           // files that call mint()
const badIds = [];
for (const f of scanned) {
  const body = read(f);
  /* ⚠ A REAL MINT PASSES AN ID — `mint('…')`. Matching the bare `PJCCFrag.mint(` found
     _layouts/default.html, whose COMMENT explains why the ledger loads first: "the eggs call
     PJCCFrag.mint() and a mint against an undefined ledger is a fragment that silently never
     counts". Empty parens, pure prose, counted as a mint site.
     ⭐⭐ THAT IS THE FOURTH TIME IN ONE FILE that a substring test was satisfied by the
     sentence ABOUT the thing instead of the thing — §5 (a filename in a comment), §6 (the
     same), §9 (a restore recipe quoting the markup it retired), and now here. On a codebase
     that documents itself this heavily, prose is not background noise to a grep: it is the
     single most common false positive there is. Match syntax, never a name.
     ⚠ A mint whose id came from a VARIABLE would slip past this. There are none — and the
     dynamic case, front matter, has its own check above. */
  if (!/PJCCFrag\.mint\('/.test(body)) continue;
  minters.push(f);
  const ids = body.match(/PJCCFrag\.mint\('([a-z0-9_]+)'\)/g) || [];
  for (const call of ids) {
    const id = call.match(/'([a-z0-9_]+)'/)[1];
    if (!SLOTS.some(s => s.id === id)) badIds.push(f + ' → ' + id);
  }
}
ok(scanned.length > 40, 'the scan read real files — ' + scanned.length + ' js/html under ' +
   SCAN_DIRS.join(', '), 'an empty scan reports clean and proves nothing');
ok(minters.length === 3, 'three files mint fragments — the eggs, the eggs layout, the puzzle room',
   'found ' + minters.length + ': ' + minters.join(' · '));
ok(badIds.length === 0, 'every mint() with a literal id names a slot that exists',
   badIds.join('\n      '));

/* Pages whose FRONT MATTER is the mint — same failure, different spelling. A typo in
   `fragment_slot:` produces a page that looks like an egg and is not one. */
const pages = fs.readdirSync(ROOT).filter(f => /\.(md|html)$/.test(f));
const slotPages = [];
for (const f of pages) {
  const body = read(f);
  const fm = body.match(/^fragment_slot:\s*([a-z0-9_]+)\s*$/m);
  if (fm) slotPages.push({ file: f, id: fm[1] });
}
ok(slotPages.length >= 1, 'at least one page IS a fragment (front-matter fragment_slot)',
   'found: ' + slotPages.map(p => p.file).join(' · '));
const badPages = slotPages.filter(p => !SLOTS.some(s => s.id === p.id));
ok(badPages.length === 0, 'every fragment_slot in front matter names a real slot',
   badPages.map(p => p.file + ' → ' + p.id).join(' · '));

/* ── 5 · ORDER, where both files are on one page ───────────────────────────────── */
const DEFAULT = read('_layouts/default.html');
/* ⚠ MATCH THE TAG, NOT THE NAME. The first version of this looked for the bare string
   'pjcc-eggs.js' and found it in the PROSE of the comment that explains this very ordering
   — which sits above the tag it describes, so the check failed on correct code. A filename
   inside a comment is not a load. */
const tagAt = (f) => DEFAULT.indexOf("<script src=\"{{ '/assets/js/" + f + "'");
const iFrag = tagAt('pjcc-fragments.js'), iEggs = tagAt('pjcc-eggs.js');
ok(iFrag > -1 && iEggs > -1 && iFrag < iEggs,
   'default.html loads the ledger BEFORE pjcc-eggs.js — both defer, so markup order is run order',
   'ledger tag at ' + iFrag + ', eggs tag at ' + iEggs);

/* ── 6 · ⭐ THE ONE THAT MATTERS: every minter's page actually loads the ledger ─── */
/* Each mint site, and the file that decides whether the ledger is on the page with it.
   A minter that is its OWN host (a standalone game page, a standalone layout) lists
   itself. The assertion below is that this list COVERS every minter found by the grep —
   so a mint added anywhere new fails here until somebody answers the question. */
const HOSTS = {
  'assets/js/pjcc-eggs.js':      { host: '_layouts/default.html',       what: 'the eclipse + rare-sky doors' },
  '_layouts/easter-eggs.html':   { host: '_layouts/easter-eggs.html',   what: 'a page that IS a fragment (/classified/)' },
  'assets/games/pjcc_fork.html': { host: 'assets/games/pjcc_fork.html', what: 'half the road to Chess City' }
};
const unregistered = minters.filter(f => !HOSTS[f]);
ok(unregistered.length === 0,
   'every file that calls mint() is registered with the page that carries it',
   'unregistered: ' + unregistered.join(' · '));

for (const f of minters) {
  const h = HOSTS[f];
  if (!h) continue;
  const hostSrc = read(h.host);
  /* ⚠ A <script> TAG, NOT THE FILENAME. Three files on this site mention
     "pjcc-fragments.js" inside a comment explaining why it has to be there, and a bare
     substring test is satisfied by the explanation instead of by the thing. Third time this
     exact shape has bitten in one sitting — see §5 and §9. */
  ok(/<script[^>]*pjcc-fragments\.js/.test(hostSrc),
     h.what + ': ' + h.host + ' loads the ledger',
     'mint() is guarded, so a miss here is SILENT — the egg is unwinnable and looks unfound');
}

/* ── 7 · the service worker carries it too ─────────────────────────────────────── */
const SW = read('sw.js');
const precache = SW.slice(SW.indexOf('const PRECACHE = ['), SW.indexOf(']', SW.indexOf('const PRECACHE = [')));
ok(precache.includes('/assets/js/pjcc-fragments.js'),
   'sw.js precaches the ledger — offline, pjcc-eggs.js is cached and would mint into nothing');

/* ── 8 · the sky door is armed by CSS, and inert by default ────────────────────── */
const SKY = read('_sass/_pjcc-20-town-sky.scss');
const doorRule = SKY.slice(SKY.indexOf('.ts-sky-door {'), SKY.indexOf('}', SKY.indexOf('.ts-sky-door {')));
ok(/pointer-events:\s*none/.test(doorRule),
   '⚠ .ts-sky-door defaults to pointer-events:none — invert this and a rare fragment is free forever');
const arming = (SKY.match(/^html\.[^\n]*\.ts-sky-door[^\n]*pointer-events:\s*auto/gm) || []);
const armingBlock = SKY.match(/html\.sky-night\.meteor-night \.ts-sky-door,\s*\nhtml\.sky-night\.aurora-night \.ts-sky-door,\s*\nhtml\.eclipse-total\.sky-day\s+\.ts-sky-door \{ pointer-events: auto; \}/);
ok(!!armingBlock,
   'exactly three states arm it — meteor night · aurora night · totality',
   'arming rules found: ' + arming.length);

/* ── 9 · the retired ✦ star stays retired ──────────────────────────────────────── */
const TOWN = read('_includes/town-sky.html');
/* ⚠ THE RESTORE RECIPE QUOTES THE OLD ANCHOR, so scanning the whole file for
   `<a class="ts-secret"` finds the retirement note and reports the door as live. Read the
   WRAP instead — the markup that actually renders — which is the same discipline as
   matching the script tag rather than the filename twenty lines above it. */
const wrapStart = TOWN.indexOf('<div class="ts-secret-wrap">');
const wrap = TOWN.slice(wrapStart, TOWN.indexOf('</div>', wrapStart));
ok(wrapStart > -1 && /<b class="ts-secret"/.test(wrap) && !/<a class="ts-secret"/.test(wrap),
   'the ✦ secret star is a <b>, not an <a> — the star still flies, the door is disarmed');
ok(/pointer-events:\s*none/.test(read('_sass/_pjcc-20-town-sky.scss')
     .slice(read('_sass/_pjcc-20-town-sky.scss').indexOf('.ts-secret-wrap {'),
            read('_sass/_pjcc-20-town-sky.scss').indexOf('}', read('_sass/_pjcc-20-town-sky.scss').indexOf('.ts-secret-wrap {')))),
   'and its wrap is pointer-events:none — belt and braces on a retired door');

/* ── 10 · half the road, in the room that awards it ────────────────────────────── */
const FORK = read('assets/games/pjcc_fork.html');
ok(/const HALF_STEP = JOURNEY_LEN \/ 2;/.test(FORK),
   'HALF_STEP is DERIVED from JOURNEY_LEN — a literal 500 would rot the day the road changes length');
ok(/function saveProg\(p\)\{[^\n]*mintHalfway\(p\.step\);/.test(FORK),
   'the mint hangs off saveProg — every write to `step` is checked, not just the clean solve');
ok(/mintHalfway\(loadProg\(\)\.step\);/.test(FORK),
   'a boot-time catch-up exists — somebody already past 500 does not have to re-earn it');
ok(/run\.step >= HALF_STEP && run\.legStartStep < HALF_STEP/.test(FORK),
   'the summary congratulates only the leg that CROSSED the line, never a milestone passed in July');
ok(FORK.indexOf('pjcc-fragments.js') < FORK.indexOf('const HALF_STEP'),
   'the room loads the ledger in its head, above the game code that mints');

/* ── done ──────────────────────────────────────────────────────────────────────── */
console.log('\n  ' + PASS + ' passed, ' + FAIL + ' failed\n');
if (FAIL) { console.log('  FAILED:\n' + fails.map(f => '   · ' + f).join('\n') + '\n'); process.exit(1); }
