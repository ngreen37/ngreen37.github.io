/* ═══════════════════════════════════════════════════════════════════════════════════
 * THE IDENTITY FORGE — the person is human, drawn, and the panel does not move
 * -----------------------------------------------------------------------------------
 * Nate, 2026-08-03, four things in one message:
 *   "when you change aura or skin tone the base box shifts and vice versa… Also when you
 *    click back in to Base; it goes elsewhere randomly."
 *   "Take away characters like fox, visitor, robot, and fairy. Keep them human."
 *   "Keep the eye setup uniform so we can change eye color."
 *   "…and if they want, a 2 color eye? …pupil in the middle, then a ring of green, then
 *    a ring of brown."
 *
 * Each of those is a check here, and the first one is a MEASUREMENT rather than an
 * opinion: the panel is scrolled, nine different controls are clicked, and the page
 * position of the Base section and the scroll offset are compared before and after. A
 * single pixel of drift fails. That is the only honest way to gate "it's annoying" —
 * you cannot eyeball a two-pixel reflow, and two pixels is what the bug felt like.
 *
 * ⚠ TWO HARNESS TRAPS ARE BAKED IN HERE, both of which produced a confident green run
 * before they were found:
 *   1. page.setContent() loads an OPAQUE origin where localStorage THROWS. Every save
 *      failed silently, every read returned defaults, nothing changed, and "nothing
 *      moved" was trivially true. It serves a real https URL now.
 *   2. Before that, a shadowed variable meant every click after the first threw. Same
 *      symptom, same false pass. So the run below also asserts the look ACTUALLY CHANGED
 *      — a test for movement has to prove there was something to move.
 *
 *   node tests/creator.check.js
 * ═══════════════════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const { findChrome } = require('./harness');
const ROOT = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

const CREATOR = read('assets/js/pjcc-creator.js');
const FACE = read('assets/js/pjcc-face-art.js');
const CSS = read('_sass/_pjcc-16-creator.scss');
const PROFILE = read('assets/js/pjcc-profile.js');

/* ⚠⚠ THE STUB HAS TO CARRY WHAT THE REAL MODULE CARRIES. The aura palette moved into
   pjcc-profile.js on 2026-08-13 and the Forge stopped keeping a copy — correct, and it
   silently made this harness a liar, because the hand-written `window.PJCC` below had no
   `AURAS`. Every aura pick then came back gold and three checks went red describing a bug
   the live page does not have (dossier.md loads the profile at :46, the Forge at :58).
   ⭐ Lifted out of the real source rather than retyped: a second copy of the palette in a
   TEST is the same lie as a second copy in a room, and this one would go stale silently
   while claiming to be the thing that catches staleness. */
const AURA_SRC = (PROFILE.match(/^ {2}var AURAS = \{[\s\S]*?^ {2}\};/m) || [])[0];
const ORDER_SRC = (PROFILE.match(/^ {2}var AURA_ORDER = \[.*?\];/m) || [])[0];
/* ⛑ AND THE EARN TABLE + THE UNLOCK RULE, 2026-08-20 — lifted from the real file for the
   same reason the palette is: a stub that carries its OWN copy of "which colors are earned"
   is a test that passes against itself. `auraUnlocked` is pasted in verbatim, so if the rule
   in pjcc-profile.js changes, the checks below are asking about the new rule. */
const MEAN_SRC = (PROFILE.match(/^ {2}var AURA_MEANING = \{[\s\S]*?^ {2}\};/m) || [])[0];
const STARS_SRC = (PROFILE.match(/^ {2}var PT_STARS_KEY[\s\S]*?^ {2}\}\n(?=  \/\* ⭐ AND THE ACCOUNT)/m) || [])[0];
const UNLOCK_SRC = (PROFILE.match(/^ {4}auraUnlocked: function \(key, prof\) \{[\s\S]*?^ {4}\},/m) || [])[0];
if (!MEAN_SRC || !STARS_SRC || !UNLOCK_SRC) {
  console.log('  ✗ could not lift AURA_MEANING / the star reader / auraUnlocked out of pjcc-profile.js');
  process.exit(1);
}
if (!AURA_SRC || !ORDER_SRC) {
  console.log('\n  ✗ could not lift AURAS/AURA_ORDER out of pjcc-profile.js — the stub would ' +
              'be silently incomplete, which is how this file lied once already\n');
  process.exit(1);
}

let pass = 0, fail = 0;
const check = (n, c, d) => {
  if (c) { pass++; console.log('  ✓ ' + n + (d !== undefined ? '   ' + d : '')); }
  else { fail++; console.log('  ✗ ' + n + (d !== undefined ? '   ' + d : '')); }
};

console.log('\n── THE IDENTITY FORGE ────────────────────────────────────\n');

/* ══ THE DRAWN FACE HAS TO BE ON THE PAGE THAT DRAWS IT ═════════════════════
   ⛑⛑ 2026-08-25, Nate: *"I don't see my headwear or eye color change."* He was right and the
   Forge was innocent. `PJCC.avatarMarkup()` paints the composited character if
   pjcc-face-art.js is loaded and **falls back to a plain emoji if it is not** — and
   _layouts/game.html, a standalone layout, loaded pjcc-profile-bar.js (which draws the nav
   avatar) without it. Every game page showed a face with no hat and no eye color.

   ⭐⭐ THE FALLBACK IS EXACTLY WHY IT LASTED. It renders something plausible, so the bug
   presents as "the Forge didn't save" rather than as anything broken. [[feature-shipped-but-
   never-loaded]]: a fallback must LOOK missing. This one looks like a design decision.
   ⚠ SAME SHAPE AS THE FRAGMENT LEDGER, SAME DAY, DIFFERENT DEPENDENCY — which is why this
   is derived rather than a list of pages: every root layout is asked, so a fourth one added
   next year is asked too. */
{
  const roots = fs.readdirSync(path.join(ROOT, '_layouts'))
    .filter((f) => /\.html$/.test(f))
    .map((f) => '_layouts/' + f)
    .filter((f) => /<!DOCTYPE/i.test(read(f)));
  const resolve = (file, d) => {
    let src = read(file);
    if ((d || 0) > 3) return src;
    let m; const inc = /\{%-?\s*include\s+([A-Za-z0-9_\-./]+\.html)/g;
    while ((m = inc.exec(src)) !== null) {
      const part = path.join(ROOT, '_includes', m[1]);
      if (fs.existsSync(part)) src += '\n' + resolve('_includes/' + m[1], (d || 0) + 1);
    }
    return src;
  };
  /* ⚠ the TAG, not the filename — both names appear in comments explaining this rule */
  const tag = (src, f) => new RegExp('<script[^>]*' + f.replace(/\./g, '\\.')).test(src);
  /* ⛑⛑ TWO DEPENDENCIES NOW, NOT ONE — 2026-08-25, THE DAY AFTER. Nate: *"The companion is
     still not showing on the shoulder… Anywhere there is an avatar."*
     `PJCCFaceArt.avatar()` draws the dog only `if (pet && window.PJCCPetArt)`, and
     pjcc-pet-art.js was loaded by exactly THREE pages. Everywhere else the guard was false
     and the shoulder was silently empty.
     ⭐⭐ I SHIPPED IT KNOWING ABOUT THE TRAP. I fixed the identical bug for pjcc-face-art.js
     the day before, wrote this very check to derive root layouts — and then added a NEW
     optional dependency without asking my own gate about it. **Deriving the PAGES is only
     half of it; the list of DEPENDENCIES was still hand-typed, and the typed half is the half
     that rots** (the same shape as the fragment ledger's host table).
     So the list lives here, once, and every root layout is asked about every entry. */
  const AVATAR_DEPS = [
    ['pjcc-face-art.js', 'avatarMarkup() falls back to a plain emoji — no hat, no eye color'],
    ['pjcc-pet-art.js',  'avatar() skips the companion silently — an empty shoulder']
  ];
  let asked = 0;
  for (const r of roots) {
    const src = resolve(r, 0);
    if (!tag(src, 'pjcc-profile-bar.js') && !tag(src, 'pjcc-profile.js')) continue;
    asked++;
    for (const [dep, why] of AVATAR_DEPS) {
      check(r + ' loads ' + dep, tag(src, dep), 'without it, ' + why);
    }
  }
  check('every root layout that shows an avatar was asked', asked >= 2, asked + ' of ' + roots.length);
  check('…about every optional dependency the compositor guards on',
    AVATAR_DEPS.length === (read('assets/js/pjcc-face-art.js').match(/window\.PJCCPetArt/g) || []).length + 1,
    'one entry per `window.PJCCxxx &&` guard in avatar() — add a guard, add a row');

  /* ⭐ THE SPECIES IS RESOLVED, NOT READ. `companion.pet` is written only by the Den's
     picker, so anybody who never opened it had no field at all and drew no dog — while the
     local save file has defaulted to `dog` since the Den shipped. A default that lives on
     only one side of a sync is not a default. */
  check('the species falls back account → local → dog',
    /var species = c\.pet \|\| \(petLocal\(\) \|\| \{\}\)\.pet \|\| 'dog';/.test(read('assets/js/pjcc-profile.js')),
    'setPet() fires only from the picker — most profiles have never had the field');
  check('⚠ and OFF is a separate flag, not a `none` species',
    /var showPet = c\.petOnAvatar !== false;/.test(read('assets/js/pjcc-profile.js')),
    'hiding the dog from your avatar must not delete the Den');
  check('…defaulting to SHOWN, so an old profile is not silently opted out',
    /!== false/.test(read('assets/js/pjcc-profile.js')));
  check('the Forge offers the choice in the Companion tab',
    /data-avpet="1"/.test(read('assets/js/pjcc-creator.js')) &&
    /data-avpet="0"/.test(read('assets/js/pjcc-creator.js')),
    'beside the thing it is about, not in a settings list nobody opens');
}

/* ══ ONE SHAPE, AND IT SIZES ITSELF ═══════════════════════════════════════
   ⛑⛑ 2026-08-25, Nate: *"it's way too big… it looks like the zoomed-in version."* Measured
   in the real header pill (`#nav-operative`, an inline-flex control built for a text emoji):
   the HATLESS avatar came out **0×0 — invisible** and the HATTED one **300×300 inside a 411px
   pill.** Two DOM shapes from one function, failing two different ways in one container.
   ⭐⭐ THE CAUSE WAS A COMMENT I WROTE CALLING `width: 100%` "self-contained". It is not —
   **a percentage is a demand on the parent**, and that parent had no size to give.
   Fixed at 133×34, identical with or without a hat, and identical again with a companion. */
{
  const ART = read('assets/js/pjcc-face-art.js');
  const CSS16 = read('_sass/_pjcc-16-creator.scss');
  const rule = CSS16.slice(CSS16.indexOf('.av-mini {'), CSS16.indexOf('}', CSS16.indexOf('.av-mini {')));

  check('avatar() ALWAYS returns the wrapper — one shape, never two',
    /return '<span class="av-mini">' \+ svg\(look\) \+ extra \+ '<\/span>';/.test(ART) &&
    !/if \(!c\) return svg\(look\);/.test(ART),
    'a caller cannot style a shape it does not know it will be handed');
  check('⚠ .av-mini sizes itself in em, NEVER in a percentage',
    /--av-size: [\d.]+em;/.test(rule) && !/width: 100%/.test(rule),
    'font-size is the one thing every container already set — they all used to hold an emoji');
  check('…and a fixed circle overrides it with a flat number',
    /\.pjcc-avatar \.av-mini \{ --av-size: 40px; \}/.test(read('_sass/_pjcc-14-profile.scss')));
  check('the companion is ABSOLUTELY positioned — the size must not affect the header',
    /\.av-mini \.av-pet \{[\s\S]{0,40}position: absolute;/.test(CSS16),
    'out of flow means the pill measures the same with a dog on it');
}

/* ══ THE WHOLE COMPANION SYNCS ═══════════════════════════════════════════
   ⛑⛑ 2026-08-25. Nate: *"Of course the companion should sync across all devices… It should
   be obvious that every feature, stat, progress, and collectable is meant to be synced."*
   Yesterday this block asserted the OPPOSITE — that only the species synced — which was a
   true description of a defect, pinned as though it were a rule. **A test can hold a mistake
   in place exactly as firmly as it holds a decision** (the castled king was the same shape
   the day before).

   ⭐⭐ THIS IS THE THIRD TIME: Gauntlet doors (08-19), Park Tables stars (08-20), the
   companion (08-25). [[when-he-repeats-himself]] — a repeat means the defect is one layer
   behind what I fixed. The layer is that local-first with a bolt-on mirror per feature makes
   syncing something you have to REMEMBER. So the merge is tested as a UNIT here, and the
   shape is meant to be copied.
   ⚠ mergePet IS SLICED AND RUN, not grepped for. The merge rules are the part that can be
   subtly wrong — a grep would prove the words exist. */
{
  const PSRC = read('assets/js/pjcc-profile.js');
  const a = PSRC.indexOf('function mergePet(local, remote) {');
  const z = PSRC.indexOf('PJCC.mergePet = mergePet;');
  check('mergePet can be sliced out of pjcc-profile.js', a > -1 && z > a);
  const ctx = { Math, Object };
  require('vm').createContext(ctx);
  require('vm').runInContext(PSRC.slice(a, z), ctx);
  const M = ctx.mergePet;

  const local  = { at: 200, bond: 90, dug: true,  ownedCos: ['none', 'bow'],  names: { dog: 'Biscuit' }, hunger: 40, pet: 'dog' };
  const remote = { at: 100, bond: 30, dug: false, ownedCos: ['none', 'hat'],  names: { cat: 'Mittens' }, hunger: 99, pet: 'cat' };

  const fwd = M(local, remote);

  /* ⛑⛑ THE FIXTURE ABOVE CANNOT PROVE "MAX", AND MUTATION-TESTING SAID SO. In it the fresher
     device also happens to hold the higher bond, so `Math.max(…)` and "the fresher one wins"
     give the same answer — both mutations passed. **A test that cannot tell two rules apart is
     testing neither.** The pair below is the case the rule actually exists for: you bonded to
     90 on a laptop in June, then opened your phone yesterday and it pushed bond 30. The STALE
     device holds the progress. */
  const staleHigh = { at: 100, bond: 90, dug: true,  ownedCos: ['none'], names: {}, hunger: 10 };
  const freshLow  = { at: 900, bond: 30, dug: false, ownedCos: ['none'], names: {}, hunger: 88 };
  const rescue = M(staleHigh, freshLow);
  check('⚠⚠ bond takes the MAX even when the STALE device holds it',
    rescue.bond === 90, 'got ' + rescue.bond + ' — this is the case the rule exists for');
  check('⚠⚠ …and the dig is STICKY even when the fresher device forgot it',
    rescue.dug === true);
  check('…while the fresher device still wins the preference beside it',
    rescue.hunger === 88, 'earned and preference are decided separately, on the same object');

  check('⚠ bond takes the MAX — no device can cost you progress', fwd.bond === 90, 'got ' + fwd.bond);
  check('⚠ the max-bond dig is STICKY once it has happened', fwd.dug === true);
  check('⚠ owned cosmetics UNION — unlocking on one phone keeps the other',
    ['none', 'bow', 'hat'].every((k) => fwd.ownedCos.indexOf(k) >= 0), fwd.ownedCos.join(','));
  check('names are additive — naming a cat does not un-name your dog',
    fwd.names.dog === 'Biscuit' && fwd.names.cat === 'Mittens', JSON.stringify(fwd.names));
  check('the FRESHER stamp wins the preferences', fwd.hunger === 40 && fwd.pet === 'dog');

  /* the same pair, handed over the other way round: earned fields must not care */
  const rev = M(remote, local);
  check('⭐ and the earned fields are direction-INDEPENDENT',
    rev.bond === 90 && rev.dug === true && rev.ownedCos.length === 3,
    'a merge that only works one way is a merge that loses data on the other device');
  check('…while the preferences still follow the stamp', rev.hunger === 40 && rev.pet === 'dog');

  check('a device with nothing local takes the account wholesale', M(null, remote).bond === 30);
  check('…and an account with nothing keeps local untouched', M(local, null).bond === 90);

  check('every save STAMPS and pushes', /s\.at = Date\.now\(\);/.test(read('assets/js/pjcc-companion.js')) &&
    /PJCC\.setPetState\(s\)/.test(read('assets/js/pjcc-companion.js')),
    'without a stamp the only options are "newest wins" (loses progress) and "never overwrite"');
  check('…and the pull runs when the ACCOUNT arrives, not on every load',
    /PJCC\.ready\.then\(pullOnce\)/.test(read('assets/js/pjcc-companion.js')),
    'getProfile() is null until the deferred SDK resolves');
  check('the pet look rides with the person look',
    /PJCC\.setPetLook\(st\.pet\)/.test(read('assets/js/pjcc-creator.js')) &&
    /companion\.petLook/.test(PSRC));
  check('…and the two looks are adopted on SEPARATE clocks',
    /accountPetLook\(\), lp = /.test(read('assets/js/pjcc-creator.js')),
    'dressing the dog on a phone must not drag a stale face down with it');
}

/* ── 1. HUMAN ONLY ────────────────────────────────────────────────────────────────
   ⚠ COMMENTS STRIPPED FIRST. The block explaining what left NAMES what left — Fox,
   Visitor, Robot, Fairy — and a test that cannot tell a rule from the note about the
   rule forces the next person to delete the explanation to make it pass. (Same trap,
   same fix, as gambit.check.js §13 and hidden.check.js.) */
const CODE = CREATOR.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
{
  const GONE = ['Fox', 'Visitor', 'Robot', 'Fairy', 'Ghost', 'Genie', 'Elf', 'Vampire', 'Merfolk'];
  // the MIGRATION table legitimately still holds the old keys — that is how nobody loses
  // their character — so look at the offered list only, not the whole file.
  const faces = /var FACES = \[([\s\S]*?)\n  \];/.exec(CODE);
  check('the offered cast is a list this test can read', !!faces);
  const offered = faces ? faces[1] : '';
  const still = GONE.filter((w) => new RegExp("n:'" + w, 'i').test(offered));
  check('no fox, visitor, robot or fairy is offered', still.length === 0, still.join(', ') || 'all human');
  const emoji = offered.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu) || [];
  check('…and nobody is an emoji any more', emoji.length === 0, emoji.join(' ') || 'all drawn');
}

/* ── 2. NOBODY LOSES THEIR CHARACTER ──────────────────────────────────────────── */
{
  const mig = /var BASE_MIGRATE = \{([\s\S]*?)\n  \};/.exec(CODE);
  check('every old base has a migration', !!mig);
  const table = mig ? eval('({' + mig[1] + '})') : {};
  const keys = Object.keys(table);
  check('all 32 old bases are mapped', keys.length === 32, keys.length + ' keys');
  const hairKeys = (/var HAIR_ORDER = \[([^\]]*)\]/.exec(FACE) || [, ''])[1]
    .split(',').map((s) => s.trim().replace(/'/g, '')).filter(Boolean);
  const bad = keys.filter((k) => hairKeys.indexOf(table[k]) < 0);
  check('…and every one lands on a real hair style', bad.length === 0,
    bad.map((k) => k + '→' + table[k]).join(', ') || hairKeys.length + ' styles');
  check('the four he named all land somewhere human',
    ['fox', 'alien', 'robot', 'fairy'].every((k) => !!table[k]),
    ['fox', 'alien', 'robot', 'fairy'].map((k) => k + '→' + table[k]).join(' · '));

  /* ⚠⚠ THE AURA PALETTE IS BORROWED, AND `sanitize()` VALIDATES SAVED LOOKS AGAINST IT.
     Every other map it checks is declared in the Forge itself and is always there; this one
     comes from pjcc-profile.js by document order. So a stand-in palette is not a harmless
     last resort — it makes every color outside it look invalid and REWRITES a real choice
     into the saved object. `{ gold: '#F5C518' }` stood here for one day and did exactly
     that. Absent has to read as absent. */
  check('the borrowed aura palette has NO stand-in',
    /var AURAS = \(window\.PJCC && PJCC\.AURAS\) \|\| \{\};/.test(CODE) &&
    /var AURA_ORDER = \(window\.PJCC && PJCC\.AURA_ORDER\) \|\| \[\];/.test(CODE),
    'a palette of one draws a picker that works and lies');
  const judged = (CODE.match(/^.*!AURAS\[op\.aura\].*$/gm) || []);
  check('…and no saved aura is overwritten while the palette is unavailable',
    judged.length > 0 && judged.every((l) => /HAVE_AURAS &&/.test(l)),
    judged.length + ' place(s) judge a saved aura; unverified is not the same as wrong');
}

/* ── 3. THE PANEL CANNOT REFLOW ───────────────────────────────────────────────────
   The old grid held emoji, and 🧑 does not measure the same as 🧑🏽 — picking a skin tone
   re-wrapped the picker and shoved every section below it. Fixed cell dimensions are what
   make that impossible, so they are checked as source, not just as behavior. */
{
  check('the face picker cell is a fixed box', /\.forge-cell--face \.fc-face \{[^}]*width: 46px[^}]*height: 46px/.test(CSS));
  check('…and so is the face inside it', /\.forge-cell--face \.fc-face \.fa-svg \{[^}]*width: 46px/.test(CSS));
  check('a color click repaints, it does not rebuild',
    /function repaintOp\(\)/.test(CODE) && /if \(heavy\) renderForge\(true\); else repaintOp\(\)/.test(CODE));
}

/* ── 4. THE EYES ARE UNIFORM, AND THE TWO OF THEM ARE SEPARATE ────────────────────
   2026-08-04: "Forget the outer eye — scrap it — change it to Both eyes as default and then
   an option to modify left-eye and right-eye." The two-tone IRIS is gone; the two colors go
   to the two EYES. */
{
  check('there is exactly ONE eye routine', (FACE.match(/function eyePair\(/g) || []).length === 1,
    'every face gets the same eyes, in the same place — which is what makes a color picker honest');
  check('the eye is sclera · iris · limbal ring · pupil · glint',
    /fa-sclera/.test(FACE) && /fa-iris"/.test(FACE) && /fa-limbal/.test(FACE) && /fa-pupil/.test(FACE) && /fa-glint/.test(FACE));
  check('the two-tone iris is gone', !/fa-iris-inner|fa-iris-outer/.test(FACE),
    'one solid iris per eye — the second color moved to the other eye');
  check('the two eyes take their own color', /function eyePair\(left, right\)/.test(FACE) &&
    /d < 0 \? left : right/.test(FACE), 'd = -1 is the eye on the LEFT of the picture');
  check('a matched pair is the two eyes AGREEING, not a second code path',
    /o\.eyeR === 'same'\) \? left :/.test(FACE), 'so heterochromia costs nothing to maintain');
  check('…and it is the default', /!o\.eyeR \|\| o\.eyeR === 'same'/.test(FACE),
    'a player who never opens Left/Right gets an ordinary face');
  /* The ONLY place `eyeOuter` may still appear is the migration that deletes it — leaving a
     read anywhere else is how `base` used to keep coming back on the next load. */
  const leftovers = (CODE.match(/^.*\beyeOuter\b.*$/gm) || [])
    .filter((l) => !/delete op\.eyeOuter/.test(l));
  check('nothing still READS the retired eyeOuter', leftovers.length === 0,
    leftovers.map((l) => l.trim()).join(' | ') || 'only the line that drops it mentions it');
  check('…and it is dropped from the SAVED object, not just the merged one',
    /delete op\.eyeOuter/.test(CODE), 'or it returns on every load — the lesson `base` taught');
}

/* ── 5. DRIVE IT ──────────────────────────────────────────────────────────────── */
(async () => {
  const exe = findChrome();
  if (!exe) { console.log('\n  (no Chrome found — skipping the browser half)'); return done(); }
  const browser = await puppeteer.launch({ executablePath: exe, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  await page.setViewport({ width: 900, height: 780 });

  const scripts = ['pjcc-face-art.js', 'pjcc-pet-art.js', 'pjcc-creator.js']
    .map((f) => '<script>' + read('assets/js/' + f).split('</script>').join('<\\/script>') + '<\/script>').join('\n');

  /* ⚠⚠ A SIGNED-IN PROFILE, AND ITS ABSENCE IS WHY THE WORST BUG IN THIS FILE'S HISTORY
     SHIPPED. Until 2026-08-04 this harness had no `window.PJCC` at all, so `accountLook()`
     returned null and the account-overlay path in identity() — the one that made every human
     picker land one click behind — was never executed even once. Nate found it by using the
     site. The stub below is deliberately faithful on the ONE property that caused it: the
     account's copy of the look changes only when `setLook` is called, which the Forge does on
     a 600ms debounce, so between a click and that timer the profile is genuinely stale.
     ([[pjcc-profile-system]]: test gated behavior signed OUT *and* signed IN.) */
  const STUB = `<script>
    window.__syncs = 0;
    ${AURA_SRC}
    ${ORDER_SRC}
    ${MEAN_SRC}
    ${STARS_SRC}
    window.PJCC = {
      AURAS: AURAS,
      AURA_ORDER: AURA_ORDER,
      AURA_MEANING: AURA_MEANING,
      auraWord: function (k) { return (AURA_MEANING[k] && AURA_MEANING[k].word) || ''; },
      auraFrom: function (k) { return (AURA_MEANING[k] && AURA_MEANING[k].from) || null; },
      ${UNLOCK_SRC}
      _p: { codename: 'Tester', companion: { look: { hair:'crop', tone:'', hairColor:'brown',
            eye:'brown', eyeR:'same', aura:'gold', hat:'none', emblem:'none' } } },
      currentUser: function () { return { id: 'u1' }; },
      getProfile: function () { return this._p; },
      setLook: function (l) { window.__syncs++; this._p.companion.look = JSON.parse(JSON.stringify(l)); return Promise.resolve(); },
      onChange: function (fn) { (this._l = this._l || []).push(fn); },
      ready: Promise.resolve()
    };
  <\/script>`;

  await page.setRequestInterception(true);
  page.on('request', (r) => r.respond({ status: 200, contentType: 'text/html', body:
    `<!doctype html><html><head><meta charset="utf-8"><style>
      body{margin:0;background:#140c30;font-family:system-ui,sans-serif;color:#f0e6ff}
      :root{--r-sm:8px;--r-md:12px;--r-lg:16px}
      ${CSS.replace(/\/\*[\s\S]*?\*\//g, '')}
     </style></head><body><div id="mount"></div>${STUB}${scripts}
     <script>PJCCForge.renderCard(document.getElementById('mount'));<\/script></body></html>` }));
  // ⚠ a REAL origin — see the harness note at the top of this file
  await page.goto('https://chesswild.com/dossier/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 250));
  await page.evaluate(() => PJCCForge.open('operative'));
  await new Promise((r) => setTimeout(r, 250));

  const shape = await page.evaluate(() => ({
    cells: document.querySelectorAll('[data-hair]').length,
    drawn: document.querySelectorAll('.fc-face .fa-svg').length,
    rows: ['data-hcol', 'data-tone', 'data-eye1', 'data-eyet'].map((a) => document.querySelectorAll('[' + a + ']').length),
    gone: document.querySelectorAll('[data-eye2]').length,
    seg: [...document.querySelectorAll('[data-eyet]')].map((e) => e.textContent).join('|'),
    segOn: (document.querySelector('[data-eyet].on') || {}).textContent
  }));
  check('the Base picker is drawn people, not glyphs', shape.cells > 0 && shape.drawn === shape.cells,
    shape.cells + ' cells, ' + shape.drawn + ' drawn');
  check('hair color / skin / eye rows + the eye target are all present',
    shape.rows.every((n) => n > 0), shape.rows.join(' · '));
  check('the Outer Ring row is gone', shape.gone === 0, 'scrapped 2026-08-04');
  check('the eye target reads Both Eyes · Left · Right', shape.seg === 'Both Eyes|Left|Right', shape.seg);
  check('…and Both Eyes is the default', shape.segOn === 'Both Eyes', String(shape.segOn));

  /* ══ AN AURA YOU HAVE NOT WON ══════════════════════════════════════════
     2026-08-20, Nate: *"I love the 'earn aura' thing. Everyone except Auston since she is
     adaptive."* Eight of the thirteen belong to a park regular and cost a FULL star.

     ⚠⚠ THE STUB'S PROFILE WEARS `gold`, WHICH IS ONE OF THE EIGHT, and that is not a
     mistake in the fixture — it is the grandfather clause under test. An operative already
     wearing an earned color keeps it whatever the stars say, so gold reads as OPEN here
     while the other seven read as locked. A run where all eight locked would mean the
     clause had stopped protecting saved identities. */
  {
    const row = () => page.evaluate(() => {
      const sw = [...document.querySelectorAll('[data-aura]')];
      return { total: sw.length,
        locked: sw.filter((e) => e.getAttribute('data-locked')).map((e) => e.getAttribute('data-aura')).sort(),
        label: (document.querySelector('[data-aura="violet"]') || {}).getAttribute
               ? document.querySelector('[data-aura="violet"]').getAttribute('aria-label') : '',
        caption: (document.getElementById('op-aura-word') || {}).textContent };
    });
    const reopen = async () => {
      await page.evaluate(() => { PJCCForge.close && PJCCForge.close(); PJCCForge.open('operative'); });
      await new Promise((r) => setTimeout(r, 200));
    };

    await page.evaluate(() => localStorage.removeItem('pjcc.pt.stars.v1'));
    await reopen();
    const cold = await row();
    check('the whole palette is SHOWN, locked ones included', cold.total === 13, cold.total + ' swatches');
    check('…with seven locked and gold grandfathered in — the fixture is wearing it',
      cold.locked.length === 7 && !cold.locked.includes('gold') && cold.locked.includes('violet'),
      cold.locked.join(', '));

    /* ⚠⚠ THE GRANDFATHER CLAUSE HAS TWO PATHS AND THE LINE ABOVE ONLY EXERCISES ONE.
       `auraUnlocked` forgives an aura found on the ACCOUNT or in the local `pjcc.identity.v1`,
       and in a driven Forge the local copy is always written — so deleting the account path
       entirely changed nothing and the whole suite stayed green. Mutation-tested, caught,
       and split: each path is now asked on its own, with the other one absent.
       [[green-must-name-what-ran]] */
    const canWear = (key, prof, localAura) => page.evaluate((k, pr, la) => {
      const save = localStorage.getItem('pjcc.identity.v1');
      if (la) localStorage.setItem('pjcc.identity.v1', JSON.stringify({ op: { aura: la } }));
      else localStorage.removeItem('pjcc.identity.v1');
      const out = PJCC.auraUnlocked(k, pr);
      if (save === null) localStorage.removeItem('pjcc.identity.v1');
      else localStorage.setItem('pjcc.identity.v1', save);
      return out;
    }, key, prof, localAura);

    const WEARING_GOLD = { companion: { look: { aura: 'gold' } } };
    check('an ACCOUNT already wearing an earned color keeps it, with nothing saved locally',
      await canWear('gold', WEARING_GOLD, null), 'the account path, on its own');
    check('a LOCAL look already wearing one keeps it, with no account at all',
      await canWear('gold', null, 'gold'), 'a guest who picked it before today');
    check('…and somebody wearing neither is genuinely locked out of it',
      (await canWear('gold', null, 'azure')) === false, 'nothing to grandfather');
    check('…and Auston\'s crimson is never one of them — she is the adaptive seat',
      !cold.locked.includes('crimson'), 'from: null, so it is free for anyone');
    /* ⛑⛑ THE FREQUENCIES CAME OFF AND WENT BACK ON THE SAME DAY, 2026-08-20 — *"I don't
       want the actual text descriptions"*, then *"I take it back."* This check has been
       through both directions; it is back to asserting the word, and the PRICE half never
       moved because that is the half that matters — a locked swatch that will not say what
       it costs is a button that appears broken. */
    check('a locked swatch says the frequency AND the price, in words',
      /certainty/.test(cold.label) && /Robert/.test(cold.label), cold.label);

    /* ⚠⚠ AND EVERY OWNED COLOR ACTUALLY SPEAKS. Nine words reach the screen through TWO
       render sites — the swatch labels and the caption under the row — and a check that
       read only one of them would stay green while the other went silent. That is not
       hypothetical here: both sites were edited twice in one day. So this asks for all
       nine at once, off the rendered page.
       ⭐ The four unowned colors (mono/azure/rose/lime) are NOT in this list and must not
       be: they carry no word on purpose, and their labels fall back to the color's name. */
    const WORDS = ['home', 'gladness', 'the kept word', 'a dream carried for someone else',
                   'love and wisdom', 'certainty', 'appetite', 'nerve'];
    const auraText = await page.evaluate(() =>
      [...document.querySelectorAll('[data-aura]')]
        .map((e) => (e.getAttribute('aria-label') || '') + ' ' + (e.getAttribute('title') || ''))
        .join(' | ').toLowerCase());
    const mute = WORDS.filter((w) => !auraText.includes(w.toLowerCase()));
    check('every owned color says its frequency on the swatch itself', mute.length === 0,
      mute.length ? 'SILENT: ' + mute.join(', ') : WORDS.length + ' of 9 found (the 9th is a curly apostrophe)');
    /* ⚠ THE NINTH IS ASKED SEPARATELY because "the beginner's heart" is written with a
       straight apostrophe in the source and the page may render either — matching on the
       distinctive half avoids a check that fails on punctuation instead of on behavior. */
    check('…including Princess’s, whichever apostrophe it renders with',
      /beginner.{1,3}s heart/.test(auraText), 'matched around the apostrophe');

    /* ⚠ AND THE FOUR FREE COLORS FALL BACK TO A NAME, NEVER A RAW KEY. A swatch labelled
       `mono` reads as a variable that leaked onto the page. */
    check('…while an unowned color is labelled with its NAME, not its key',
      /mono/i.test(auraText) && !/"mono"/.test(auraText) &&
      /Mono|Azure|Rose|Lime/.test(await page.evaluate(() =>
        [...document.querySelectorAll('[data-aura]')].map((e) => e.getAttribute('aria-label') || '').join(' | '))),
      'auraName() covers the four that belong to nobody');

    /* ⚠ AND THE DATA CARRIES BOTH FIELDS, lifted from the real file. `from` without `word`
       is the state he reversed; `word` without `from` would be a color nobody can win. */
    check('AURA_MEANING carries the frequency AND who you take it from',
      /\bword\s*:/.test(MEAN_SRC) && /\bfrom\s*:/.test(MEAN_SRC),
      'word + from');

    /* ⚠⚠ THE REFUSAL IS THE ASSERTION. A dimmed swatch that still applies when tapped is a
       lock that does not lock — and the Forge writes through to the profile, so it would be
       a real grant. Read the SAVED aura back, not the class on the button. */
    const before = await page.evaluate(() => PJCCForge.identity().aura);
    await page.evaluate(() => document.querySelector('[data-aura="violet"]').click());
    await new Promise((r) => setTimeout(r, 150));
    const after = await page.evaluate(() => PJCCForge.identity().aura);
    check('tapping a locked color does not take it', after === before, before + ' -> ' + after);
    check('…and it says what the color costs instead of failing silently',
      /locked/.test((await row()).caption), (await row()).caption);

    /* A HALF star is not a clean win. That distinction is the entire price. */
    await page.evaluate(() => localStorage.setItem('pjcc.pt.stars.v1',
      JSON.stringify({ robert: { b: 'half' } })));
    await reopen();
    check('a HALF star does not open the color — the analysis board was open',
      (await row()).locked.includes('violet'), 'still locked');

    await page.evaluate(() => localStorage.setItem('pjcc.pt.stars.v1',
      JSON.stringify({ robert: { b: 'full' } })));
    await reopen();
    const won = await row();
    check('a FULL star opens exactly that color', !won.locked.includes('violet'), won.locked.join(', '));
    check('…and only that one — nobody else\'s came with it',
      won.locked.length === 6 && won.locked.includes('turquoise'), won.locked.join(', '));
    await page.evaluate(() => document.querySelector('[data-aura="violet"]').click());
    await new Promise((r) => setTimeout(r, 150));
    check('…and now it can actually be worn',
      (await page.evaluate(() => PJCCForge.identity().aura)) === 'violet', 'violet');
    check('…and the caption names who it was won from',
      /won from Robert/.test((await row()).caption), (await row()).caption);

    /* ⚠⚠ THE CAPTION HAS TWO JOBS AND THE SECOND ONE MUST OVERWRITE THE FIRST. It prints
       the selected color's frequency, AND nudgeLocked() prints the PRICE there when you tap
       a color you have not won. If a good pick did not overwrite, the price of a color you
       were REFUSED would sit under the color you are now WEARING, reading as "this one is
       locked too". Both directions are driven, because the bug only exists in one of them.
       ⛑ Found while the words were briefly removed and kept afterward — the removal is
       reverted, this check is not. */
    await page.evaluate(() => document.querySelector('[data-aura="turquoise"]').click());
    await new Promise((r) => setTimeout(r, 150));
    check('tapping a LOCKED color replaces the caption with the price',
      /locked/.test((await row()).caption) && !/won from Robert/.test((await row()).caption),
      (await row()).caption);
    await page.evaluate(() => document.querySelector('[data-aura="violet"]').click());
    await new Promise((r) => setTimeout(r, 150));
    check('…and picking one you HAVE won puts its own word back',
      /won from Robert/.test((await row()).caption) && !/locked/.test((await row()).caption),
      (await row()).caption);

    await page.evaluate(() => localStorage.removeItem('pjcc.pt.stars.v1'));
  }

  /* ══ THE REGRESSION GATE FOR "ONE BUTTON BEHIND" ══════════════════════════════════
     Nate: "You click on one button and it goes to the previous one you picked, then you have
     to click again to get it right." Click, then read the look back IMMEDIATELY — before the
     600ms sync can hide the bug. Every click must be visible in the same tick it happened. */
  {
    const seq = [['[data-hcol="ginger"]', 'hairColor', 'ginger'],
                 ['[data-hcol="black"]',  'hairColor', 'black'],
                 ['[data-eye1="green"]',  'eye',       'green'],
                 ['[data-eye1="blue"]',   'eye',       'blue'],
                 /* ⛑ , NOT  — 2026-08-20. Jade became EARNABLE (it is Nate's, and
                    it costs a clean win) and a locked swatch is REFUSED by design, so this
                    check would have started failing on the lock rather than on the latency
                    bug it exists to catch. Rose belongs to nobody and always will. */
                 ['[data-aura="rose"]',   'aura',      'rose']];
    const lag = [];
    for (const [sel, field, want] of seq) {
      await page.evaluate((s) => { const el = document.querySelector(s); if (el) el.click(); }, sel);
      const got = await page.evaluate((f) => PJCCForge.identity()[f], field);
      if (got !== want) lag.push(sel + ' → ' + got + ' (wanted ' + want + ')');
    }
    check('SIGNED IN, every pick takes on the FIRST click', lag.length === 0,
      lag.length ? lag.join(' | ') + '   ← the stale account look is being painted back over local'
                 : seq.length + ' picks, no lag — the account is a seed, not an authority');
  }

  /* …and the seed still works: an account look that is genuinely NEWER is adopted, because
     losing cross-device sync would be a worse bug than the one just fixed. */
  {
    const adopted = await page.evaluate(() => {
      PJCC._p.companion.look = { hair: 'afro', tone: '', hairColor: 'silver', eye: 'ice',
                                 eyeR: 'same', aura: 'rose', hat: 'none', emblem: 'none',
                                 at: Date.now() + 60000 };
      const took = PJCCForge.adoptAccountLook();
      return { took: took, hair: PJCCForge.identity().hair, eye: PJCCForge.identity().eye };
    });
    check('a NEWER account look still reaches this device',
      adopted.took && adopted.hair === 'afro' && adopted.eye === 'ice', JSON.stringify(adopted));
    const ignored = await page.evaluate(() => {
      document.querySelector('[data-eye1="amber"]').click();          // this device authors now
      PJCC._p.companion.look = { hair: 'bald', eye: 'violet', at: 1 };  // an ancient copy
      return { took: PJCCForge.adoptAccountLook(), eye: PJCCForge.identity().eye };
    });
    check('…but an OLDER one never overwrites what you just picked',
      !ignored.took && ignored.eye === 'amber', JSON.stringify(ignored));
  }

  // ── the regression gate for his actual complaint ──
  await page.evaluate(() => { document.querySelector('.forge-ov').scrollTop = 240; });
  await new Promise((r) => setTimeout(r, 100));
  const probe = () => page.evaluate(() => {
    const ov = document.querySelector('.forge-ov');
    const base = [...document.querySelectorAll('.forge-section')].find((s) => /Base/.test(s.querySelector('h3').textContent));
    return { scroll: ov.scrollTop, top: Math.round(base.getBoundingClientRect().top), h: Math.round(ov.scrollHeight) };
  });
  const before = await probe();
  const CLICKS = ['[data-aura="rose"]', '[data-tone]:nth-of-type(5)', '[data-hcol="ginger"]',
                  '[data-eye1="green"]', '[data-hair="afro"]',
                  '[data-hair="long"]', '[data-tone]:nth-of-type(1)', '[data-hat="crown"]'];
  let drift = 0;
  for (const sel of CLICKS) {
    await page.evaluate((s) => { const el = document.querySelector(s); if (el) el.click(); }, sel);
    await new Promise((r) => setTimeout(r, 60));
    const now = await probe();
    drift = Math.max(drift, Math.abs(now.scroll - before.scroll), Math.abs(now.top - before.top));
  }
  check('nothing moves — not the scroll, not the Base box', drift === 0, drift + 'px of drift across ' + CLICKS.length + ' clicks');

  /* …and it moved because something HAPPENED. Without this, a Forge that threw on every
     click would pass the line above with a perfect score. */
  const irises = () => page.evaluate(() => {
    const g = [...document.querySelectorAll('#forge-prev .fa-iris')].map((e) => e.getAttribute('fill'));
    const L = PJCCForge.identity();
    return { l: g[0], r: g[1], eye: L.eye, eyeR: L.eyeR,
             swatch: (document.querySelector('[data-eye1].on') || {}).getAttribute
                     ? document.querySelector('[data-eye1].on').getAttribute('data-eye1') : null };
  });
  const look = await page.evaluate(() => {
    const L = PJCCForge.identity();
    return { hair: L.hair, hairColor: L.hairColor, eye: L.eye, aura: L.aura, hat: L.hat };
  });
  check('…and every one of those clicks actually took',
    look.hair === 'long' && look.hairColor === 'ginger' && look.eye === 'green' &&
    look.aura === 'rose' && look.hat === 'crown', JSON.stringify(look));

  /* ── BOTH / LEFT / RIGHT, driven end to end ─────────────────────────────────────
     The order matters: aiming at one eye while the pair matches has to CREATE the second
     color, or the next click has nothing to be different from. */
  const both0 = await irises();
  check('the pair starts matched', both0.l === both0.r, both0.l);

  await page.evaluate(() => document.querySelector('[data-eyet="right"]').click());
  await new Promise((r) => setTimeout(r, 60));
  await page.evaluate(() => document.querySelector('[data-eye1="blue"]').click());
  await new Promise((r) => setTimeout(r, 60));
  const split = await irises();
  check('"Right" changes only the right eye',
    split.l !== split.r && split.eye === 'green' && split.eyeR === 'blue',
    'L ' + split.l + ' · R ' + split.r);

  await page.evaluate(() => document.querySelector('[data-eyet="left"]').click());
  await new Promise((r) => setTimeout(r, 60));
  await page.evaluate(() => document.querySelector('[data-eye1="amber"]').click());
  await new Promise((r) => setTimeout(r, 60));
  const left = await irises();
  check('"Left" changes only the left eye — the right one is not dragged along',
    left.eye === 'amber' && left.eyeR === 'blue' && left.l !== left.r,
    'L ' + left.l + ' · R ' + left.r);
  check('…and the swatch ring follows the eye you are aiming at', left.swatch === 'amber', String(left.swatch));

  await page.evaluate(() => document.querySelector('[data-eyet="both"]').click());
  await new Promise((r) => setTimeout(r, 60));
  const one = await irises();
  check('"Both Eyes" re-matches the pair immediately', one.l === one.r && one.eyeR === 'same',
    one.l + '  (a mode switch that changed nothing until the next click would be the same bug wearing a hat)');

  // an old saved character opens as a person who resembles it
  const mig = await page.evaluate(() => {
    localStorage.setItem('pjcc.identity.v1', JSON.stringify({ op: { base: 'fox', tone: '🏽', aura: 'crimson', hat: 'cap' } }));
    const L = PJCCForge.identity();
    return { hair: L.hair, tone: L.tone, aura: L.aura, hat: L.hat, base: L.base };
  });
  check('a saved "Fox" reopens as the person it maps to, keeping everything else',
    mig.hair === 'curls' && mig.aura === 'crimson' && mig.hat === 'cap' && mig.base === undefined,
    JSON.stringify(mig));

  check('no page errors', errs.length === 0, errs.slice(0, 3).join(' | ') || 'clean');
  await browser.close();
  done();
})().catch((e) => { console.error('\nABORT: ' + e.message); process.exit(2); });

function done() {
  console.log(`\n  ${pass} passed, ${fail} failed\n`);
  process.exit(fail ? 1 : 0);
}
