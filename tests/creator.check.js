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

let pass = 0, fail = 0;
const check = (n, c, d) => {
  if (c) { pass++; console.log('  ✓ ' + n + (d !== undefined ? '   ' + d : '')); }
  else { fail++; console.log('  ✗ ' + n + (d !== undefined ? '   ' + d : '')); }
};

console.log('\n── THE IDENTITY FORGE ────────────────────────────────────\n');

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
}

/* ── 3. THE PANEL CANNOT REFLOW ───────────────────────────────────────────────────
   The old grid held emoji, and 🧑 does not measure the same as 🧑🏽 — picking a skin tone
   re-wrapped the picker and shoved every section below it. Fixed cell dimensions are what
   make that impossible, so they are checked as source, not just as behaviour. */
{
  check('the face picker cell is a fixed box', /\.forge-cell--face \.fc-face \{[^}]*width: 46px[^}]*height: 46px/.test(CSS));
  check('…and so is the face inside it', /\.forge-cell--face \.fc-face \.fa-svg \{[^}]*width: 46px/.test(CSS));
  check('a colour click repaints, it does not rebuild',
    /function repaintOp\(\)/.test(CODE) && /if \(heavy\) renderForge\(true\); else repaintOp\(\)/.test(CODE));
}

/* ── 4. THE EYE IS UNIFORM AND TAKES TWO COLOURS ─────────────────────────────── */
{
  check('there is exactly ONE eye routine', (FACE.match(/function eyePair\(/g) || []).length === 1,
    'every face gets the same eyes, in the same place — which is what makes a colour picker honest');
  check('the eye has four concentric parts',
    /fa-sclera/.test(FACE) && /fa-iris-outer/.test(FACE) && /fa-iris-inner/.test(FACE) && /fa-pupil/.test(FACE));
  check('a one-colour eye is the two rings AGREEING, not a second code path',
    /eyeOuter === 'same'\) \? inner :/.test(FACE),
    'so "two-tone" costs nothing to maintain');
  check('two-tone is opt-in', /!o\.eyeOuter \|\| o\.eyeOuter === 'same'/.test(FACE),
    'the default is an ordinary eye');
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
  await page.setRequestInterception(true);
  page.on('request', (r) => r.respond({ status: 200, contentType: 'text/html', body:
    `<!doctype html><html><head><meta charset="utf-8"><style>
      body{margin:0;background:#140c30;font-family:system-ui,sans-serif;color:#f0e6ff}
      :root{--r-sm:8px;--r-md:12px;--r-lg:16px}
      ${CSS.replace(/\/\*[\s\S]*?\*\//g, '')}
     </style></head><body><div id="mount"></div>${scripts}
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
    rows: ['data-hcol', 'data-tone', 'data-eye1', 'data-eye2'].map((a) => document.querySelectorAll('[' + a + ']').length)
  }));
  check('the Base picker is drawn people, not glyphs', shape.cells > 0 && shape.drawn === shape.cells,
    shape.cells + ' cells, ' + shape.drawn + ' drawn');
  check('hair colour / skin / eye / outer-ring rows are all present',
    shape.rows.every((n) => n > 0), shape.rows.join(' · '));

  // ── the regression gate for his actual complaint ──
  await page.evaluate(() => { document.querySelector('.forge-ov').scrollTop = 240; });
  await new Promise((r) => setTimeout(r, 100));
  const probe = () => page.evaluate(() => {
    const ov = document.querySelector('.forge-ov');
    const base = [...document.querySelectorAll('.forge-section')].find((s) => /Base/.test(s.querySelector('h3').textContent));
    return { scroll: ov.scrollTop, top: Math.round(base.getBoundingClientRect().top), h: Math.round(ov.scrollHeight) };
  });
  const before = await probe();
  const CLICKS = ['[data-aura="jade"]', '[data-tone]:nth-of-type(5)', '[data-hcol="ginger"]',
                  '[data-eye1="green"]', '[data-eye2="brown"]', '[data-hair="afro"]',
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
  const look = await page.evaluate(() => {
    const L = PJCCForge.identity();
    return { hair: L.hair, hairColor: L.hairColor, eye: L.eye, eyeOuter: L.eyeOuter, aura: L.aura, hat: L.hat,
             inner: document.querySelector('#forge-prev .fa-iris-inner').getAttribute('fill'),
             outer: document.querySelector('#forge-prev .fa-iris-outer').getAttribute('fill') };
  });
  check('…and every one of those clicks actually took',
    look.hair === 'long' && look.hairColor === 'ginger' && look.eye === 'green' &&
    look.eyeOuter === 'brown' && look.aura === 'jade' && look.hat === 'crown',
    JSON.stringify(look));
  check('the drawn eye is genuinely two colours', look.inner !== look.outer,
    'inner ' + look.inner + ' · outer ' + look.outer + '  (Nate\'s own: green inside, brown outside)');

  // one colour again — the same eye, its rings agreeing
  await page.evaluate(() => document.querySelector('[data-eye2="same"]').click());
  await new Promise((r) => setTimeout(r, 60));
  const one = await page.evaluate(() => ({
    inner: document.querySelector('#forge-prev .fa-iris-inner').getAttribute('fill'),
    outer: document.querySelector('#forge-prev .fa-iris-outer').getAttribute('fill')
  }));
  check('“Matched” gives back a one-colour eye', one.inner === one.outer, one.inner);

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
