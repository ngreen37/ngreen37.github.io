/* proto-gate.check.js — the shelved games are all shut the SAME way.
 *
 *   Run: npm run test:proto      Exits non-zero on any failure.
 *
 * WHY THIS FILE EXISTS. The prototypes below (Duel, MARCHLAND, Follow the Dog, Chess City,
 * and since 2026-08-26 the Murphy's Law scroller) are kept off the games hall and opened by
 * one key in the URL. That arrangement is two halves
 * in two different files — `playable:false` in the registry takes the card off the grid, and
 * an inline script on the page reveals the frame — and NEITHER HALF KNOWS ABOUT THE OTHER.
 * Which means each one can be half-done, silently:
 *
 *   · gate on the page, no `playable:false`  → the hall links straight to a shut door
 *   · `playable:false`, no gate on the page  → the game is delisted but wide open to anyone
 *     who guesses the URL, and to Google, which does not guess
 *
 * Both failures render as a perfectly normal-looking page. That is the whole reason this is
 * a test and not a comment. ⚠ The gate is a SOFT gate — it is a "don't stumble in here" sign,
 * not access control, and this file must never be read as proving otherwise.
 *
 * ⭐ AND EVERY COPY MUST STAY ONE COPY. They were four hand-written variants with four
 * different localStorage keys until 2026-08-10, which meant the key had to be typed once per
 * GAME. Now the block is byte-identical everywhere and one key opens all of them; this file
 * fails the moment somebody edits one of them and not the rest.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

let PASS = 0, FAIL = 0;
const fails = [];
function ok(cond, msg) {
  if (cond) { PASS++; console.log('  ✓ ' + msg); }
  else { FAIL++; fails.push(msg); console.log('  ✗ ' + msg); }
}

/* The shelved ones, and the pages they are served from. `slug` is the registry key; `page` is
   the source file, which is NOT always named after the slug — Follow the Dog still builds out
   of games/space_run/ because it used to be Space Run.

   ⚠ THIS TABLE IS THE ONE HAND-TYPED THING IN THE FILE, and it has to be: the page path is
   not derivable from the slug, as Follow the Dog proves. Everything else — the count in the
   banner, the delisted set in §3 — is read out of the repo, so the only way to strand a game
   is to delist it and not add a row here, which is exactly what §3 fails on. */
const PROTOS = [
  { slug: 'duel',           name: 'Duel Mode',      page: 'games/duel/index.html' },
  { slug: 'marchland',      name: 'MARCHLAND',      page: 'games/campaign/index.html' },
  { slug: 'follow-the-dog', name: 'Follow the Dog', page: 'games/space_run/index.html' },
  { slug: 'chess-city',     name: 'Chess City',     page: 'games/chess-city/index.html' },
  /* The scroller. Not unfinished — SUPERSEDED: the name went to the Godot survivors run on
     2026-08-26 and the game came off the hall rather than being deleted. Same door either
     way, which is the point of there being only one door. */
  { slug: 'murphys-law',    name: "Murphy's Law",   page: 'games/murphys-law/index.html' },
  { slug: 'checker-town',   name: 'Checker Town',   page: 'games/checker-town/index.html' }
];

const REGISTRY = fs.readFileSync(path.join(ROOT, 'assets/js/pjcc-games-data.js'), 'utf8');

console.log('\n=== THE PROTOTYPE SOFT GATE — ' + PROTOS.length + ' doors, one key ===\n');

/* ── 1 · both halves, on every prototype ───────────────────────────────────────── */
const blocks = [];
for (const p of PROTOS) {
  const file = path.join(ROOT, p.page);
  if (!fs.existsSync(file)) { ok(false, p.name + ': ' + p.page + ' is missing'); continue; }
  const src = fs.readFileSync(file, 'utf8');

  /* the registry half — read the game's OWN line, not the file, so a `playable:false`
     belonging to some other game can never satisfy this */
  const line = REGISTRY.split('\n').find(l => l.includes("slug:'" + p.slug + "'"));
  ok(!!line && /playable:\s*false/.test(line),
     p.name + ': carries playable:false in the registry, so the hall drops the card');

  /* the page half */
  const m = src.match(/<script>[\s\S]*?pjcc\.proto\.key[\s\S]*?<\/script>/);
  ok(!!m, p.name + ': the page carries the soft gate');
  if (m) blocks.push({ name: p.name, body: m[0].trim() });

  ok(/id="proto-gate"[^>]*\shidden/.test(src),
     p.name + ': the frame starts HIDDEN — a gate that reveals nothing hides nothing');
  ok(/id="proto-locked"/.test(src) && /class="proto-shut"/.test(src),
     p.name + ': says the shut line, in the shared style');
  ok(/^---[\s\S]*?\bsitemap:\s*false[\s\S]*?^---/m.test(src),
     p.name + ': sitemap: false — an unfinished game does not belong in a search result');
}

/* ── 2 · every copy is ONE copy ─────────────────────────────────────────────────── */
if (blocks.length) {
  const first = blocks[0];
  const drifted = blocks.filter(b => b.body !== first.body).map(b => b.name);
  ok(drifted.length === 0,
     'all ' + blocks.length + ' gates are byte-identical' +
     (drifted.length ? '  -> drifted: ' + drifted.join(', ') : ''));
  ok(/var KEY = 'chesswild', STORE = 'pjcc\.proto\.key'/.test(first.body),
     "one key ('chesswild') and one store ('pjcc.proto.key') for the whole set");
  ok(/OLD = \['pjcc\.duel\.key', 'pjcc\.marchland\.key'\]/.test(first.body),
     'the two retired per-game stores are still honored — nobody gets locked out of a door they already opened');
  ok(/q === 'off'/.test(first.body), "?key=off still forgets it");
}

/* ── 3 · nothing else in the registry is delisted without a door ────────────────
   The trap this catches: a fifth prototype gets `playable:false` to take it off the hall,
   and that is where it stops — no gate, no link, and no way in for anyone including him. */
const delisted = REGISTRY.split('\n')
  .filter(l => /playable:\s*false/.test(l) && /cat:'dev'/.test(l))
  .map(l => (l.match(/slug:'([^']+)'/) || [])[1]);
const stranded = delisted.filter(s => !PROTOS.some(p => p.slug === s));
ok(stranded.length === 0,
   'every delisted in-development game has a gated page to reach it' +
   (stranded.length ? '  -> no way in: ' + stranded.join(', ') : ''));

/* ── 4 · the shut line is styled once, centrally ───────────────────────────────── */
const SASS = fs.readFileSync(path.join(ROOT, '_sass/_pjcc-15-games.scss'), 'utf8');
ok(/\.proto-shut\s*\{/.test(SASS), '.proto-shut is defined once in the shared stylesheet');
const localCopies = PROTOS.filter(p => {
  const f = path.join(ROOT, p.page);
  return fs.existsSync(f) && /\.proto-shut\s*\{/.test(fs.readFileSync(f, 'utf8'));
}).map(p => p.name);
ok(localCopies.length === 0,
   'no page keeps its own copy of it' + (localCopies.length ? '  -> ' + localCopies.join(', ') : ''));

console.log('\n' + (FAIL === 0
  ? 'RESULT: PASS (' + PASS + ' checks)\n'
  : 'RESULT: FAIL (' + FAIL + '/' + (PASS + FAIL) + ')\n  ' + fails.join('\n  ') + '\n'));
process.exit(FAIL ? 1 : 0);
