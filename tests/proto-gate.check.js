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
const vm = require('vm');
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
  { slug: 'follow-the-dog', name: 'Follow the Dog', page: 'games/space_run/index.html' },
  { slug: 'chess-city',     name: 'Chess City',     page: 'games/chess-city/index.html' },
  /* The scroller. Not unfinished — SUPERSEDED: the name went to the Godot survivors run on
     2026-08-26 and the game came off the hall rather than being deleted. Same door either
     way, which is the point of there being only one door. */
  { slug: 'murphys-law',    name: "Murphy's Law",   page: 'games/murphys-law/index.html' }
];

/* ⛑⛑ THE OTHER SHAPE OF SHUT DOOR — 2026-09-07. Campaign and Checker Town left the table
   above and moved here: they are ON the games hall now (no `playable:false`, and `cat:'dev'`
   puts them in the workbench row), and the lock is EARNED rather than typed — one flawless
   Notation Blitz run at Medium or better.

   ⚠⚠ THE CONDITION IS NOT WRITTEN ANYWHERE A PLAYER CAN READ IT, by his instruction, which
   is what §6 is for. */
const EARNED = [
  { slug: 'marchland',    name: 'Campaign',     page: 'games/campaign/index.html' },
  { slug: 'checker-town', name: 'Checker Town', page: 'games/checker-town/index.html' }
];
const MARK = 'pjcc.nrun.clean';

const REGISTRY = fs.readFileSync(path.join(ROOT, 'assets/js/pjcc-games-data.js'), 'utf8');

console.log('\n=== SHUT DOORS — ' + PROTOS.length + ' on a typed key, ' + EARNED.length +
  ' on an earned one ===\n');

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

/* ── 5 · the earned doors: on the hall, and shut until the mark is banked ─────── */
const earnedBlocks = [];
for (const p of EARNED) {
  const file = path.join(ROOT, p.page);
  if (!fs.existsSync(file)) { ok(false, p.name + ': ' + p.page + ' is missing'); continue; }
  const src = fs.readFileSync(file, 'utf8');
  const line = REGISTRY.split('\n').find(l => l.includes("slug:'" + p.slug + "'"));

  /* the registry half. `playable:false` would take the card straight back off the hall, and
     that failure has no visible symptom: the page would still open for anyone who had earned
     it, and nobody else would ever learn there was a door. */
  ok(!!line && !/playable:\s*false/.test(line),
     p.name + ': is ON the hall — no playable:false');
  ok(!!line && /cat:'dev'/.test(line),
     p.name + ": files under cat:'dev', so it lands in the workbench row");
  ok(!!line && /gate:'nrun'/.test(line),
     p.name + ': carries the earned gate, so the card wears a padlock');

  const m = src.match(/<script>[\s\S]*?pjcc\.nrun\.clean[\s\S]*?<\/script>/);
  ok(!!m, p.name + ': the page reads the earned mark');
  if (m) earnedBlocks.push({ name: p.name, body: m[0].trim() });

  ok(/id="proto-gate"[^>]*\shidden/.test(src),
     p.name + ': the frame starts HIDDEN — a gate that reveals nothing hides nothing');
  ok(/id="proto-locked"/.test(src) && /class="proto-shut"/.test(src),
     p.name + ': says the shut line, in the shared style');
}
if (earnedBlocks.length) {
  const firstE = earnedBlocks[0];
  const driftedE = earnedBlocks.filter(b => b.body !== firstE.body).map(b => b.name);
  ok(driftedE.length === 0,
     'both earned gates are byte-identical' + (driftedE.length ? '  -> drifted: ' + driftedE.join(', ') : ''));
  ok(firstE.body.includes("var MARK = '" + MARK + "'"),
     "one mark ('" + MARK + "') for the whole set");
  /* ⚠ THE TYPED KEY IS A SECOND OPENER, NOT A REPLACEMENT: he hands these links out on
     stream, and a link that stopped working the day the lock changed is a link he has to
     remember never to send again. `?key=off` must forget the typed key ONLY. */
  ok(/KEY = 'chesswild'/.test(firstE.body) && /localStorage\.getItem\(MARK\) === '1'/.test(firstE.body),
     '…and the typed key still opens them too');
  ok(!/removeItem\(MARK\)/.test(firstE.body),
     '…while ?key=off forgets the typed key and never the earned mark');
}

/* ── 6 · NOTHING SAYS WHAT THE CONDITION IS ────────────────────────────────────
   Nate: *"Both require a flawless run on medium notation blitz, but don't say that
   anywhere."* A hint is the one bug this arrangement exists to avoid, and a hint is exactly
   what a later kindness pass would add — the vault card three lines away in pjcc-hall.js
   already prints its own condition, so the sentence to copy is right there. Hence a test.
   ⚠ Comments are stripped first, or the blocks EXPLAINING the silence fail the check that
   enforces it. */
function stripComments(t) {
  return t.replace(/\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\}/g, ' ')
          .replace(/<!--[\s\S]*?-->/g, ' ')
          .replace(/\/\*[\s\S]*?\*\//g, ' ')
          .replace(/^[ \t]*\/\/.*$/gm, ' ');
}
for (const p of EARNED) {
  const file = path.join(ROOT, p.page);
  if (!fs.existsSync(file)) continue;
  const said = stripComments(fs.readFileSync(file, 'utf8')).match(/notation|flawless|blitz/i);
  ok(!said, p.name + ': the page never names the condition' + (said ? '  -> "' + said[0] + '"' : ''));
}

const HALL = fs.readFileSync(path.join(ROOT, 'assets/js/pjcc-hall.js'), 'utf8');
ok(HALL.includes("nrun: '" + MARK + "'"), 'the hall reads the same mark the game writes');
const descLine = (stripComments(HALL).match(/var descHtml =[\s\S]*?;/) || [''])[0];
ok(descLine !== '' && !/shut\(/.test(descLine),
   '…and a shut card gets a padlock and no sentence', descLine.trim().slice(0, 90));

const NRUN = fs.readFileSync(path.join(ROOT, 'assets/games/notation_run.html'), 'utf8');
const markBlock = (NRUN.match(/if \([^\n]*G\.diff === 'medium'[\s\S]*?\n  \}/) || [''])[0];
ok(/localStorage\.setItem\('pjcc\.nrun\.clean', '1'\)/.test(markBlock),
   'Notation Blitz banks the mark on a clean run');
ok(/rank === 'S'/.test(markBlock) && /G\.diff === 'hard'/.test(markBlock),
   '…on an S at Medium or better, and never on Slow',
   markBlock.split('\n')[0].trim().slice(0, 100));
/* ⛑ THE ONE THING THE BLINDFOLD UNLOCK DIRECTLY ABOVE IT DOES DO. Copying that block and
   changing the key is the obvious way to write this, and it would announce itself on the
   results screen — which is the thing he asked for the absence of. */
ok(!/innerHTML|textContent|getElementById/.test(markBlock),
   '…and says nothing on screen when it does');

/* ── 7 · THE MARK IS EARNED, SO IT SYNCS ───────────────────────────────────────
   2026-09-07, Nate: *"Yes put it on the myStats pull."* A push payload and a merge are two
   halves of one contract and something has to DIFF them, or one half ships alone and the
   feature silently does not sync. [[everything-earned-syncs]] */
const PROF = fs.readFileSync(path.join(ROOT, 'assets/js/pjcc-profile.js'), 'utf8');

/* the two halves, each read out of its own file and compared to the other */
const pushKey = (NRUN.match(/pay\.(\w+) = true/) || [])[1];
ok(!!pushKey, 'Notation Blitz pushes a field for the mark', 'data.' + pushKey);
ok(!!pushKey && new RegExp('nr\\.data\\.' + pushKey + '\\b').test(PROF),
   '…and pjcc-profile.js reads the SAME field back', 'data.' + pushKey);
ok(/r\.game === 'notation-run'/.test(PROF),
   '…off the row the game actually writes');

/* ⚠ THE PUSH ONLY EVER ASSERTS TRUE. Sending `false` from a browser that has never earned it
   is how signing in on a new device wipes the account's mark. */
/* ⚠ the comment above the guard says the word 'false' on purpose — strip prose first */
const push = stripComments((NRUN.match(/var pay = \{[\s\S]*?saveScore\('notation-run'[^\n]*/) || [''])[0]);
ok(/getItem\('pjcc\.nrun\.clean'\) === '1'\)\s*pay\.clean = true/.test(push),
   '…and only asserts it when this browser has actually earned it');
ok(push !== '' && !/false/.test(push),
   '…never the word false, which is the shape that wipes an account');
/* ⛑ AND IT IS BANKED BEFORE THE PUSH. Written after saveScore, the qualifying run would only
   reach the account on the NEXT run — the one place this could be a whole batch late. */
const iMark = NRUN.indexOf("setItem('pjcc.nrun.clean'");
const iPush = NRUN.indexOf("saveScore('notation-run'");
/* ⚠ BOTH HAVE TO EXIST. `-1 < n` is true, so a version of this that only compared the
   two indexes went green when the whole block was deleted. */
ok(iMark > 0 && iPush > 0 && iMark < iPush,
   '…and banked before the push, not after it', 'mark ' + iMark + ' / push ' + iPush);

/* ⛑⛑ `data` IS ONE jsonb BLOB PER (user, game) AND saveScore USED TO REPLACE IT. Every
   ordinary run pushes {mode,diff,rank}; with a replace, the very next run after the good one
   wiped the mark off the account and nothing anywhere said so. */
ok(/data: Object\.assign\(\{\}, prev\.data \|\| \{\}, extras\.data \|\| \{\}\)/.test(PROF),
   'saveScore MERGES the jsonb blob rather than replacing it',
   '⚠ a replace loses every key the caller has not heard of');

/* ⭐ ONE PULL, NOT A SECOND ROUND TRIP. myStats() already returns every row this account
   owns; a pull of its own for one boolean would be a request for data in hand. */
const pulls = (PROF.match(/PJCC\.myStats\(\)/g) || []).length;
ok(pulls === 1, '…and the pull rides the myStats() call that was already there',
   pulls + ' myStats() call(s) in pjcc-profile.js');

/* ⚠ THE HALL HAS TO HEAR ABOUT IT. It issues its own myStats(), so which request lands first
   is a race; both halves of the event name are read from source, never typed twice. */
const HALLSRC = fs.readFileSync(path.join(ROOT, 'assets/js/pjcc-hall.js'), 'utf8');
const evt = (PROF.match(/dispatchEvent\(new Event\('([^']+)'\)\)/) || [])[1];
ok(!!evt && HALLSRC.includes("addEventListener('" + evt + "'"),
   'the hall repaints on the event the merge fires', evt);

/* ── the merge, actually executed ─────────────────────────────────────────────
   ⭐ A merge is a claim about two devices; the only honest check hands it two states.
   Same trick as tests/trainer.check.js §10. */
{
  const src = PROF.slice(PROF.indexOf('var NRUN_KEY ='));
  const cut = src.indexOf('var TOWN_KEY');
  const sandbox = {
    store: {},
    localStorage: {
      getItem(k) { return Object.prototype.hasOwnProperty.call(sandbox.store, k) ? sandbox.store[k] : null; },
      setItem(k, v) { sandbox.store[k] = String(v); },
      removeItem(k) { delete sandbox.store[k]; }
    },
    out: null
  };
  ok(cut > 0, 'the merge was found in pjcc-profile.js  (it sits above var TOWN_KEY)');
  if (cut > 0) {
    try {
      vm.createContext(sandbox);
      vm.runInContext(src.slice(0, cut) + '\n out = { on: nrunClean, merge: nrunCleanMerge };', sandbox);
    } catch (e) { ok(false, 'the merge parses on its own', e.message); }
    const M = sandbox.out;
    ok(!!(M && M.merge), 'and it runs outside a browser');
    if (M && M.merge) {
      sandbox.store = {};
      ok(M.merge(true) === true && M.on() === true,
         'an account that has the mark hands it to a device that does not');
      ok(M.merge(true) === false,
         '…and reports no change the second time  (the hall repaints once, not on every pull)');
      /* ⚠⚠ STICKY TRUE IS THE WHOLE RULE. It is a one-time event: a row that has never heard
         of it must not be able to take it back, or a stale device un-earns your run. */
      ok(M.merge(false) === false && M.on() === true,
         'a remote with no news cannot un-earn it');
      sandbox.store = {};
      ok(M.merge(false) === false && M.on() === false,
         '…and cannot invent it either');
      let survived = true;
      try { M.merge(null); M.merge(undefined); M.merge('nope'); M.merge({}); }
      catch (e) { survived = false; }
      ok(survived, 'and junk from the wire is ignored rather than thrown', 'null · undefined · string · object');
    }
  }
}

console.log('\n' + (FAIL === 0
  ? 'RESULT: PASS (' + PASS + ' checks)\n'
  : 'RESULT: FAIL (' + FAIL + '/' + (PASS + FAIL) + ')\n  ' + fails.join('\n  ') + '\n'));
process.exit(FAIL ? 1 : 0);
