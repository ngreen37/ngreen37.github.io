/* ═══════════════════════════════════════════════════════════════════════════════════
 * THE GAUNTLET DOOR — one source, and every door opens all the way.
 * -----------------------------------------------------------------------------------
 * Nate, 2026-08-04: "Make this door — and all doors — open FULLY. This is important. And
 * also, remember to always make the door uniform inside the Gauntlet and any other page
 * the doors exist. Uniform is key."
 *
 * Both halves are gated here, from source, in a second — no browser needed.
 *
 * THE UNIFORMITY RULE IS THE ONE THAT KEEPS GETTING BROKEN, and always the same way: a page
 * needs the door to behave slightly differently, copies the transforms it needs into its own
 * <style>, and the copy is a twin from that moment on. It has happened three times
 * ([[gauntlet-door-one-file]]) — the home hero and the games hall each carried a full copy
 * labelled "kept in sync" while they had already drifted, and the front door started down
 * the same road on the day this test was written. So: NO FILE except the partial may write a
 * transform for `.gdoor-door`. A page that needs to be the hover target wears `.gdoor-host`.
 *
 *   node tests/doors.check.js        (also runs inside `npm test`)
 * ═══════════════════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

let pass = 0, fail = 0;
const check = (n, c, d) => {
  if (c) { pass++; console.log('  ✓ ' + n + (d !== undefined ? '   ' + d : '')); }
  else { fail++; console.log('  ✗ ' + n + (d !== undefined ? '   ' + d : '')); }
};

console.log('\n── THE GAUNTLET DOOR ─────────────────────────────────────\n');

const PARTIAL = read('_sass/_pjcc-21-gauntlet-door.scss');

/* ── 1. ONE SOURCE ─────────────────────────────────────────────────────────────── */
{
  check('the shared open definition exists', /@mixin gd-open\(/.test(PARTIAL) && /@mixin gd-open-on\(/.test(PARTIAL));
  check('…and it includes a host hook, so a card can be the hover target',
    /\.gdoor-host:hover/.test(PARTIAL), 'any container may wear .gdoor-host');
  check('…and the game\'s timer opening rides the same list', /\.gdoor#\{\$sel\}\.is-open/.test(PARTIAL));

  /* every file that is not the partial, hunting for a hand-copied open transform */
  const SKIP = /(node_modules|[\\/]\.git|[\\/]_site|assets[\\/]vendor|assets[\\/]backups|[\\/]tests[\\/])/;
  const walk = (d, o) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const f = path.join(d, e.name);
      if (SKIP.test(f)) continue;
      if (e.isDirectory()) walk(f, o); else if (/\.(md|html|scss|css)$/.test(e.name)) o.push(f);
    }
    return o;
  };
  const twins = [];
  for (const f of walk(ROOT, [])) {
    const r = path.relative(ROOT, f).split('\\').join('/');
    if (r === '_sass/_pjcc-21-gauntlet-door.scss') continue;
    /* a rule that targets .gdoor-door AND sets a transform on it. Size overrides
       (border-radius, width) are legitimate and deliberately not matched. */
    const re = /\.gdoor-door[^{;]*\{[^}]*transform\s*:/g;
    if (re.test(read(r))) twins.push(r);
  }
  check('no page hand-copies a .gdoor-door transform', twins.length === 0,
    twins.length ? twins.join(', ') + '  ← move it into the partial and use .gdoor-host'
                 : 'the partial is the only place a door decides how it opens');
}

/* ── 2. FULLY MEANS FULLY ──────────────────────────────────────────────────────────
   Pull every transform emitted inside a gd-open block and assert none of them stops
   short. The numbers are the whole point of his note, so they are the assertion. */
{
  const blocks = PARTIAL.match(/@include gd-open\([^)]*\)\s*\{[^}]*\}/g) || [];
  check('every floor uses the shared mixin', blocks.length >= 9, blocks.length + ' open states');

  const short = [];
  for (const b of blocks) {
    const t = (b.match(/transform\s*:\s*([^;}]+)/) || [, ''])[1];
    const label = (b.match(/gd-open\('([^']*)'\)/) || [, 'base'])[1] || 'base';
    // slides and lifts must reach 100%; swings must reach 90deg
    const pcts = (t.match(/translate[XY]\(-?([\d.]+)%\)/g) || []).map((s) => parseFloat(s.replace(/[^\d.]/g, '')));
    const degs = (t.match(/rotateY\(-?([\d.]+)deg\)/g) || []).map((s) => parseFloat(s.replace(/[^\d.]/g, '')));
    if (pcts.some((p) => p < 100) || degs.some((d) => d < 90)) short.push(label + ' → ' + t.trim());
  }
  check('no door stops part-way open', short.length === 0,
    short.length ? short.join(' | ') : 'slides -100% · swings -90deg · the portcullis -100%');

  check('the crowned door can be opened at all',
    /@include gd-open\('\[data-grand="5"\]'\)/.test(PARTIAL),
    'its resting translateX(-10%) is (0,3,0) and used to beat the base hover rule on source order');
}

/* ── 3. FLOOR ONE IS A PAWN, ON EVERY COPY ─────────────────────────────────────────
   The queen was never floor one's piece — it was the STATIC DEFAULT in four separate
   markup copies, shown to every first-time visitor because the hydration only replaced it
   `if (cleared > 0)`. Both halves are checked: the ladder, and the default. */
{
  const COPIES = ['games.md', 'index.md', '_layouts/home.html', '_layouts/studio-home.html'];
  const badLadder = COPIES.filter((f) => !/var GLYPHS\s*=\s*\['♟'/.test(read(f)));
  check('floor one is a pawn in every ladder copy', badLadder.length === 0, badLadder.join(', ') || COPIES.length + ' copies agree');

  const game = read('assets/games/pjcc_gauntlet.html');
  check('…and in the game\'s own ladder',
    /name:'The Checker Town Open Champion', glyph:'♟'/.test(game));

  const stillQueen = COPIES.concat(['assets/games/pjcc_gauntlet.html'])
    .filter((f) => /class="gdoor-glyph"[^>]*>(♛|&#9819;)</.test(read(f)));
  check('no static default still shows a queen', stillQueen.length === 0, stillQueen.join(', ') || 'all pawns');

  const notAlways = COPIES.filter((f) => /\} else if \(cleared > 0\) \{[\s\S]{0,200}?glyph\.textContent/.test(read(f)));
  check('the glyph is applied on EVERY visit, not only mid-climb', notAlways.length === 0,
    notAlways.join(', ') || 'a stale default can no longer show through');
}

/* ── 4. THE FLOOR-ONE CLOTH IS NOT BUNTING ─────────────────────────────────────────
   "It's too symmetrical and the left/right sides are too straight." The fix is a shape,
   so the test is a measurement of that shape rather than a string match. */
{
  const m = /\.gdoor\[data-grand="0"\] \.gdoor-door \{[\s\S]*?clip-path:polygon\(([\s\S]*?)\);/.exec(PARTIAL);
  check('floor one still has a cut hem', !!m);
  if (m) {
    const pts = m[1].replace(/\/\*[\s\S]*?\*\//g, '').split(',')
      .map((s) => s.trim().split(/\s+/).map((v) => parseFloat(v)))
      .filter((p) => p.length === 2 && !isNaN(p[0]) && !isNaN(p[1]));
    /* THE HEM IS THE BOTTOM EDGE ONLY. `p[1] > 40` alone also scoops up the ragged SIDE
       points (x=0 and x=100 step in and out well below 40%), and those are a different
       feature — including them made "the deepest bites are in the middle" fail on two
       points that are not bites at all. The hem is what lies between the two side edges. */
    const hem = pts.filter((p) => p[1] > 40 && p[0] > 3 && p[0] < 97);
    const depths = hem.map((p) => p[1]);
    const spread = Math.max(...depths) - Math.min(...depths);
    check('the hem is irregular, not a row of equal teeth', spread >= 30,
      spread.toFixed(0) + '% between the shallowest tear and the deepest tip (was 22%)');

    // the deepest tears have to be in the MIDDLE — that is what he asked for
    const deepest = [...hem].sort((a, b) => a[1] - b[1]).slice(0, 2);
    check('the deepest bites are in the middle third',
      deepest.every((p) => p[0] > 25 && p[0] < 75),
      deepest.map((p) => 'x=' + p[0] + '% at ' + p[1] + '%').join(' · '));

    // neither side edge may be a straight drop
    const left = pts.filter((p) => p[0] < 15 && p[1] > 5);
    const right = pts.filter((p) => p[0] > 85 && p[1] > 5);
    check('both side edges are ragged', left.length >= 3 && right.length >= 3,
      left.length + ' points down the left, ' + right.length + ' down the right');
  }
}

console.log(`\n  ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
