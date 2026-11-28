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
/* ⚠⚠ THIS USED TO REQUIRE THE ENTRY TO END RIGHT AFTER `nm`, and it silently found ZERO
   slots the moment a `how:` field was added on 2026-08-26 — which failed FOUR checks at once
   (the slot count, both mint cross-references, and the front-matter one) and pointed at none
   of the real cause. A parser that matches a whole literal shape breaks on every field anyone
   adds; match the FIELDS instead, and let the entry carry whatever else it needs.
   ⭐ `how` IS ASSERTED SEPARATELY BELOW rather than baked in here, so adding the NEXT field
   costs nothing again. */
const slotRe = /\{\s*id:\s*'([a-z0-9_]+)',\s*flag:\s*'([a-z0-9_]+)',[\s\S]*?nm:\s*'([^']+)'/g;
let m;
while ((m = slotRe.exec(slotBlock)) !== null) SLOTS.push({ id: m[1], flag: m[2], nm: m[3] });

/* ⛑ EVERY SLOT SAYS WHAT YOU DID — 2026-08-26 (Nate: "Make sure the fragments display what
   they did to unlock them on the ledger"). A slot with no `how` renders a nameless rock on
   the shelf, which is the one thing the shelf is not for. */
const hows = (slotBlock.match(/how:\s*'[^']+'/g) || []);
ok(hows.length === SLOTS.length,
   'every filled slot carries a `how` — the deed, not just the name',
   hows.length + ' deeds for ' + SLOTS.length + ' slots');
/* ⚠ PAST TENSE, NOT AN INSTRUCTION. "Walked through…" is a record of something you did;
   "Walk through…" is a task list, and the ledger refuses to be a checklist. */
ok(hows.every((h) => !/^how:\s*'(Find|Go|Visit|Solve|Look|Walk|Catch|Get|Click|Tap)\b/.test(h)),
   '…and no deed is phrased as an instruction',
   'a deed is something you already did');

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

/* ── 6 · ⭐⭐ THE ONE THAT MATTERS: EVERY page that can mint also carries the ledger ──
   ⛑⛑ THE FIRST VERSION OF THIS SECTION WAS A HAND-TYPED TABLE OF ONE HOST PER MINTING
   FILE, IT WENT GREEN, AND IT WAS WRONG WITHIN THE HOUR. `pjcc-eggs.js` is loaded from
   THREE files — _layouts/default.html, _layouts/game.html and _includes/site-header.html —
   and the table named only the first. _layouts/game.html includes town-sky.html, so it
   carries BOTH rare-sky doors, and it did not load the ledger: **a meteor shower caught on
   a game page, which is most of the site, minted nothing.**
   ⭐⭐ DERIVING THE MINTERS AND THEN RETYPING THEIR HOSTS IS HALF A DERIVED LIST, AND THE
   HALF THAT IS TYPED IS THE HALF THAT ROTS. [[dead-game-links-trap]] — the rule is not
   "grep for the thing", it is "never write down a list the repo can answer".

   So the model is the real one, and it is small: this site has exactly THREE root layouts
   (the files carrying their own <!DOCTYPE>); everything else sets `layout: default`. For
   each root, resolve its includes, and ask of the resolved page: if it can mint, does it
   carry the ledger? A page-shaped minter (a standalone game file) answers for itself. */

/* every file with its own <!DOCTYPE> under _layouts — the roots of the whole site */
const ROOTS = fs.readdirSync(path.join(ROOT, '_layouts'))
  .filter(f => /\.html$/.test(f))
  .map(f => '_layouts/' + f)
  .filter(f => /<!DOCTYPE/i.test(read(f)));
ok(ROOTS.length === 3, 'three root layouts carry their own <!DOCTYPE> — default · game · easter-eggs',
   ROOTS.join(' · '));

/* resolve {% include x.html %} so a script pulled in by a partial counts as loaded */
function resolved(file, depth) {
  let src = read(file);
  if ((depth || 0) > 3) return src;
  const inc = /\{%-?\s*include\s+([A-Za-z0-9_\-./]+\.html)/g;
  let m;
  while ((m = inc.exec(src)) !== null) {
    const part = '_includes/' + m[1];
    if (has(part)) src += '\n' + resolved(part, (depth || 0) + 1);
  }
  return src;
}
/* ⚠ A <script> TAG, NOT THE FILENAME. Several files on this site mention
   "pjcc-fragments.js" inside the comment explaining why it must be there, and a bare
   substring test is satisfied by the explanation instead of by the thing. */
const loadsTag = (src, file) => new RegExp('<script[^>]*' + file.replace('.', '\\.')).test(src);

/* the minters that are SCRIPTS — they mint on whatever page loads them */
const jsMinters = minters.filter(f => f.startsWith('assets/js/'));
ok(jsMinters.length >= 1, 'at least one minter is a shared script', jsMinters.join(' · '));

for (const rootFile of ROOTS) {
  const src = resolved(rootFile, 0);
  const carried = jsMinters.filter(js => loadsTag(src, js.split('/').pop()));
  if (!carried.length) continue;                 // this root cannot mint; nothing to carry
  ok(loadsTag(src, 'pjcc-fragments.js'),
     rootFile + ' loads the ledger — it carries ' + carried.map(f => f.split('/').pop()).join(' + '),
     'mint() is guarded, so a miss here is SILENT: the egg is unwinnable and looks unfound');
}

/* the minters that are PAGES — a standalone layout or a game file answers for itself */
for (const f of minters.filter(x => !x.startsWith('assets/js/'))) {
  ok(loadsTag(resolved(f, 0), 'pjcc-fragments.js'),
     f + ' is its own page and loads the ledger');
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
/* ⛑ THE DOOR IS VISIBLE NOW (2026-08-26), so the default has a SECOND half to guard: it must
   also start at `opacity: 0`. Before it became a lit doorway on the horizon this was a fully
   transparent button and only `pointer-events` mattered; now a slip in either declaration
   shows a door on an ordinary night, and a door you can see is a door people will press. */
ok(/opacity:\s*0\s*;/.test(doorRule),
   '…and to opacity:0 — the door does not exist on an ordinary night');

/* ⚠⚠ THIS USED TO MATCH THE ARMING BLOCK AS ONE EXACT STRING, whitespace and all, and it
   broke the moment `opacity: 1` joined `pointer-events: auto` in it — a true failure about
   nothing, on a rule whose SUBSTANCE had not changed. Rewritten to check what actually
   matters and nothing else: exactly three selectors arm the door, and they are these three.
   ⭐ A GUARD THAT FAILS ON REFORMATTING TRAINS PEOPLE TO EDIT THE TEST. The count is the real
   safety here — a FOURTH arming rule is how a rare fragment quietly becomes free. */
/* ⚠ MENTIONING THE DOOR IS NOT ARMING IT. A first cut at this counted every `html.*` rule
   that named `.ts-sky-door` and reported FOUR — the fourth being
   `html.reduce-flourish .ts-sky-door { animation: none !important; }`, which is an
   accessibility guard that grants nothing. Only a block that hands back `pointer-events:
   auto` can arm the door, so only those blocks are read. */
const armed = [];
{
  const re = /([^{}]+)\{([^}]*)\}/g;
  let m;
  while ((m = re.exec(SKY)) !== null) {
    if (!/\.ts-sky-door/.test(m[1])) continue;
    if (!/pointer-events:\s*auto/.test(m[2])) continue;
    m[1].split(',').forEach((sel) => {
      const s = sel.replace(/\s+/g, ' ').replace(/\s*\.ts-sky-door.*/, '').trim();
      if (s && armed.indexOf(s) === -1) armed.push(s);
    });
  }
}
const WANT = ['html.sky-night.meteor-night', 'html.sky-night.aurora-night', 'html.eclipse-total.sky-day'];
ok(WANT.every((w) => armed.indexOf(w) !== -1) && armed.length === WANT.length,
   'exactly three states arm it — meteor night · aurora night · totality',
   'states that arm the door: ' + (armed.join(' · ') || 'none'));

/* ⚠ AND THE MOTION HAS AN OFF SWITCH. The door breathes now; `reduce-flourish` is the
   site-wide "hold still" class and it must reach this animation, exactly like the flickering
   "i" and the ✦ before it. A flourish somebody asked not to see is not a flourish. */
ok(/html\.reduce-flourish \.ts-sky-door \{[^}]*animation:\s*none/.test(SKY),
   'reduce-flourish parks the door’s breath — the same off switch every other flourish has');

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

/* ── 11 · ⭐ his 11-27 ("it's also slightly off"): a sky door works only over OPEN SKY ──────────────────────
   In Chrome, on the real door markup and the site's CSS: the horizon door stood ON the page card at most widths and,
   on a phone, over Play Now, taking its taps. */
const doorsDone = (async () => {
  const H = require('./harness.js');
  const http = require('http');
  const pp = require(path.join(ROOT, 'node_modules', 'puppeteer-core'));
  const WRAPS = ['ts-eclipse-wrap', 'ts-sky-door-wrap'].map((c) => (new RegExp('<div class="' + c + '">[\\s\\S]*?</div>').exec(TOWN) || [''])[0]).join('\n');
  const css = H.siteCss();
  const html = (q) => '<!doctype html><html class="' + q.html + '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
    + '<link rel="stylesheet" href="/__site.css"></head><body class="' + q.body + '">' + WRAPS
    + '<main class="page-content"><div class="wrapper"><div class="page-card"><p>The page.</p></div></div></main>'
    + (q.js === '0' ? '' : '<script src="/assets/js/pjcc-eggs.js" defer></script>') + '</body></html>';
  const srv = http.createServer((req, rsp) => {
    const u = new URL(req.url, 'http://x');
    if (u.pathname === '/__site.css') { rsp.writeHead(200, { 'Content-Type': 'text/css' }); rsp.end(css); return; }
    if (u.pathname === '/assets/js/pjcc-eggs.js') { rsp.writeHead(200, { 'Content-Type': 'text/javascript' }); rsp.end(fs.readFileSync(path.join(ROOT, 'assets/js/pjcc-eggs.js'))); return; }
    if (u.pathname === '/t') { rsp.writeHead(200, { 'Content-Type': 'text/html' }); rsp.end(html(Object.fromEntries(u.searchParams))); return; }
    rsp.writeHead(404); rsp.end();
  });
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const browser = await pp.launch({ executablePath: H.findChrome(), headless: 'new', args: ['--no-sandbox'] });
  const errs = [];
  const look = async (w, q, then) => {
    const p = await browser.newPage();
    p.on('pageerror', (e) => errs.push(e.message));
    await p.setViewport({ width: w, height: w > 800 ? 900 : 844 });
    await p.goto('http://127.0.0.1:' + srv.address().port + '/t?' + new URLSearchParams(q), { waitUntil: 'load' });
    await new Promise((r) => setTimeout(r, 150));
    if (then) await then(p);
    const m = await p.evaluate(() => {
      const d = document.getElementById('ts-sky-door'), r = d.getBoundingClientRect(), cs = getComputedStyle(d);
      const c = document.querySelector('.page-card').getBoundingClientRect(), s = d.parentNode.getBoundingClientRect();
      return { shown: cs.visibility === 'visible' && cs.pointerEvents === 'auto', left: Math.round(r.left - s.left), right: Math.round(c.left - r.right),
        over: r.right > c.left && r.left < c.right, ecl: getComputedStyle(document.getElementById('ts-eclipse-door')).pointerEvents };
    });
    await p.close();
    return m;
  };
  try {
    const AUR = { html: 'sky-night aurora-night', body: 'theme-chess nav-collapsed' };
    const wide = await look(1920, AUR), mid = await look(1512, AUR), phone = await look(390, AUR);
    const rail = await look(1920, AUR, async (p) => {
      await p.evaluate(() => document.body.classList.remove('nav-collapsed'));
      await new Promise((r) => setTimeout(r, 500));
    });
    ok(wide.shown && !wide.over && wide.left >= 8 && wide.right >= 8 && Math.abs(wide.left - wide.right) <= 1
       && rail.shown && !rail.over && Math.abs(rail.left - rail.right) <= 1,
       '⭐ an aurora night stands the horizon door centered in the strip of sky left of the page column, and it follows the rail open',
       JSON.stringify({ wide, rail }));
    ok(!phone.shown && (!mid.shown || !mid.over),
       '…and where that strip is too narrow (a phone) there is no door: never drawn over the page, never taking a tap meant for Play Now',
       JSON.stringify({ phone, mid }));
    const plain = await look(1920, { html: 'sky-night', body: 'theme-chess nav-collapsed' }), bare = await look(1920, Object.assign({ js: '0' }, AUR));
    ok(!plain.shown && !bare.shown, '…an ordinary night shows none, and an aurora night shows none until the script has placed it',
       JSON.stringify({ plain, bare }));
    const TOT = { html: 'sky-day eclipse eclipse-total', body: 'theme-chess nav-collapsed' };
    const sunOver = await look(1920, TOT), sunOpen = await look(1920, TOT, async (p) => {
      await p.evaluate(() => { document.documentElement.style.setProperty('--orb-x', '3%'); dispatchEvent(new Event('resize')); });
    });
    ok(sunOver.ecl === 'none' && sunOpen.ecl === 'auto',
       '…and in totality the eclipse door takes no tap while the sun is over the page column, only over open sky',
       JSON.stringify({ sunOver: sunOver.ecl, sunOpen: sunOpen.ecl }));
    ok(errs.length === 0, 'no script error with the doors on the page', errs.join(' | '));
  } finally { await browser.close(); srv.close(); }
})();

/* ── done ──────────────────────────────────────────────────────────────────────── */
doorsDone.catch((e) => { ok(false, 'the open-sky checks ran', String(e && e.stack || e)); }).then(() => {
  console.log('\n  ' + PASS + ' passed, ' + FAIL + ' failed\n');
  if (FAIL) { console.log('  FAILED:\n' + fails.map(f => '   · ' + f).join('\n') + '\n'); process.exit(1); }
});
