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
    /* FLOOR ONE IS A CURTAIN AND OPENS LIKE ONE (2026-08-05) — it GATHERS to the left end
       of its rod instead of traveling, so it has no distance to measure. "Fully open" for
       a gather is how much of the doorway it clears, checked in its own block below. */
    if (label === '[data-grand="0"]') continue;
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

/* ── 5. EVERY COPY IS THE SAME DOOR — the PROPORTION, not the size ─────────────────
   2026-08-04, Nate: "The doors must be uniform. There are three — home page, game page,
   and gauntlet." Three passes of "make the doors match" had already gone by, and the
   in-game door was STILL wrong, because everyone had been checking the size and the outlier
   was the SHAPE: 100×116 is 0.862 where every other copy is 0.78, so the game's arch had a
   shorter straight run under a same-sized dome and read as a squat, different door. Size is
   allowed to vary — it has to, from a 46px card icon to a 100px challenger reveal — so the
   thing to lock is the RATIO. width ÷ height = 0.78 ± 0.02, everywhere it is declared. */
{
  const FILES = ['_sass/_pjcc-21-gauntlet-door.scss', 'games.md', 'index.md',
                 'assets/games/pjcc_gauntlet.html'];
  /* ⚠ TOL 0.02 → 0.01 (2026-08-05). Two copies were living inside the old tolerance —
     the front door at 0.767 and the games hall's phone door at 0.763 — which is to say the
     tolerance had become the place the drift hid. Every declared arch is within 0.004 now,
     so halving it costs nothing today and catches the next slip while it is still one line. */
  const CANON = 0.78, TOL = 0.01;
  const bad = [], seen = [];
  for (const f of FILES) {
    const src = read(f);
    const re = /\.gdoor-arch\s*\{([^}]*)\}/g;
    let m;
    while ((m = re.exec(src))) {
      const w = /width:\s*([\d.]+)px/.exec(m[1]);
      const h = /height:\s*([\d.]+)px/.exec(m[1]);
      if (!w || !h) continue;                       // a color/shadow-only rule; not a size
      const r = +w[1] / +h[1];
      seen.push(`${f} ${w[1]}×${h[1]} = ${r.toFixed(3)}`);
      if (Math.abs(r - CANON) > TOL) bad.push(`${f}  ${w[1]}×${h[1]} → ${r.toFixed(3)}`);
    }
  }
  check('every declared arch holds the canonical proportion', bad.length === 0 && seen.length >= 4,
    bad.length ? bad.join(' | ') + '   ← height should be width ÷ 0.78'
               : seen.length + ' arches, all ' + CANON + ' ± ' + TOL);
}

/* ── 6. THE POLE STAYS STILL — AND SO DOES THE TOP OF THE CLOTH ─────────────────────
   Two of his notes, a day apart, and the second one exists because the first fix was only
   half a fix:

     2026-08-04  "The pole holding the tattered cloth up should stay still and then the
                  tattered cloth should brush to the side naturally."
     2026-08-05  "That bar I asked to stay static up top — it IS static, but the top of the
                  tattered cloth should stay static as well. Think of a sheet being pushed
                  completely to the side."

   The rod was a `border-top` ON the cloth, so it rode the cloth's transform and slid away
   with the fabric; that is asserted below from both sides, because adding the new rod
   without removing the border would simply draw two of them.

   ⭐ THEN THE CLOTH ITSELF GOT `translateX(-145%)`, WHICH MOVES EVERY POINT OF AN ELEMENT —
   the top edge included. The pole stayed and the thing hanging from it flew off to the left.
   So the rule this block really enforces is: **the floor-one leaf may not translate.** It
   gathers (`scaleX`) about the LEFT END OF THE ROD, which is the one point that is nailed
   down, and the gather must clear most of the doorway or the door reads as stuck. */
{
  const cloth = /\.gdoor\[data-grand="0"\] \.gdoor-door \{([\s\S]*?)\n\}/.exec(PARTIAL);
  check('floor one\'s cloth rule was found', !!cloth);
  if (cloth) {
    check('the rod is NOT a border on the cloth', !/border-top:\s*[1-9]/.test(cloth[1]),
      'a border rides its element\'s transform — the pole would slide off with the fabric');
  }
  check('…it is a static element on the arch instead',
    /\.gdoor\[data-grand="0"\] \.gdoor-arch::before \{[^}]*content:/.test(PARTIAL),
    'nothing transforms .gdoor-arch::before, so the pole stays put');

  const open = /@include gd-open\('\[data-grand="0"\]'\)\s*\{([^}]*)\}/.exec(PARTIAL);
  const t = open ? open[1] : '';
  check('the cloth is anchored to the left end of the rod',
    /\.gdoor\[data-grand="0"\] \.gdoor-door \{[\s\S]*?transform-origin:\s*0 0;/.test(PARTIAL),
    'transform-origin: 0 0 — the corner that hangs on the pole');
  check('THE TOP OF THE CLOTH STAYS PUT — no translate on the leaf', !!open && !/translate/.test(t),
    t.trim() || 'no floor-one open rule',
  );
  const sc = /scaleX\(([\d.]+)\)/.exec(t);
  check('…it GATHERS to the side like a sheet being pushed', !!sc, t.trim());
  if (sc) {
    check('…and the gather clears the doorway', +sc[1] <= 0.25,
      'the bunched cloth leaves ' + Math.round((1 - +sc[1]) * 100) + '% of the opening clear (needs ≥ 75%)');
  }
  check('…leaning as it goes, so it reads as fabric and not a shutter', /skewX\(/.test(t), t.trim());
}

/* ── 7. IN THE GAME, THE DOOR HIDES SOMETHING ──────────────────────────────────────
   "The gauntlet in-game is different — remove the pawn." The challenger portrait behind the
   door IS rung.glyph, so painting the same piece on the curtain meant the reveal revealed
   what was already on show. Asserted from both sides: the partial hides it, and the game no
   longer writes to it (a live assignment would be the tell that someone put it back).

   ⚑ AND HE HAD TO SAY IT TWICE (2026-08-05: "the Gauntlet in-game door has a pawn that needs
   to be removed"), because hiding the piece ON the leaf never touched the piece BEHIND it.
   `.gdoor--ingame .gdoor-arch { background:transparent }` used to stand in the partial so the
   portrait would show through the open doorway — which works for nine leaves and fails for
   floor one's TATTERED CLOTH, the one leaf you can see through. A shut door was a glowing
   88px pawn with rags in front of it. The arch is opaque in-game now, like every other copy,
   and the portrait steps THROUGH the doorway once it is open. Both halves are gated: the
   partial may not blank the arch, and the game must own the arrival. */
{
  check('the in-game leaf carries no piece',
    /\.gdoor--ingame \.gdoor-glyph \{[^}]*visibility:\s*hidden/.test(PARTIAL),
    'the portrait behind the door is the same glyph — see .gdoor--ingame');
  const game = read('assets/games/pjcc_gauntlet.html');
  check('…and the game stopped setting it',
    !/^\s*if \(gg\) gg\.textContent/m.test(game),
    'showBossCard no longer writes the boss glyph onto the curtain');

  check('the in-game arch is NOT see-through',
    !/\.gdoor--ingame \.gdoor-arch \{[^}]*background:\s*transparent/.test(PARTIAL),
    'floor one\'s cloth is see-through, so a see-through arch shows the challenger before the reveal');
  check('…so the challenger arrives WITH the door instead of waiting behind it',
    /\.boss-stage\.is-open \.boss-portrait \{[^}]*opacity:\s*1/.test(game) &&
    /\.boss-stage \.boss-portrait \{[^}]*opacity:\s*0/.test(game),
    'hidden while shut, revealed on .boss-stage.is-open');
  check('…and showBossCard actually flips that class', /stage\.classList\.add\('is-open'\)/.test(game),
    'the CSS above is dead without it — the portrait would never appear');
}

/* ── 8. A CALLER MAY SET SIZE AND NOTHING ELSE ──────────────────────────────────────
   2026-08-05, Nate: *"And for the Gauntlet Door Floor 1 (in all three spots — all three
   spots should be automatically assumed)."*

   The arch scaled and the LEAF INSIDE IT DID NOT: `left/right/top` were flat pixels, so the
   gap between the arch's top and the cloth was 14px at EVERY size — 23% of the way down the
   front door's 46px arch and 11% of the way down the Gauntlet's 100px one. Four callers had
   each hand-corrected part of it (three copies of `border-radius`, four of `font-size`),
   which is [[gauntlet-door-one-file]]'s drift arriving one property at a time rather than
   all at once. The partial makes `.gdoor-arch` a container and states the whole leaf in
   `cqw`, so size is genuinely all a caller needs.

   THIS TEST IS THE RULE. A page may write `width` and `height` on `.gdoor-arch`, plus
   layout OUTSIDE the arch (`gap` on `.gdoor`, the pips). Anything else — a radius, a
   font-size, an inset — means somebody is correcting the door by hand again, and the
   correction will be right at exactly one size. */
{
  const CALLERS = ['index.md', 'games.md', 'assets/games/pjcc_gauntlet.html',
    '_layouts/home.html', '_layouts/studio-home.html'];
  const ALLOWED = /^(width|height|gap|column-gap|row-gap|margin|margin-\w+|align-items|justify-content|position|inset|display|top|left|right|bottom|transform|animation|opacity|background|z-index)$/;
  const bad = [];
  for (const f of CALLERS) {
    const src = read(f);
    /* every rule whose selector touches the door's INNER parts, in that file's own CSS */
    const re = /([^{}\n;]*\.gdoor-(?:arch|door|glyph|knob|seam)\b[^{}]*)\{([^}]*)\}/g;
    let m;
    while ((m = re.exec(src))) {
      const sel = m[1].trim();
      if (/^\s*\/\//.test(sel) || sel.includes('*')) continue;
      const inner = /\.gdoor-(door|glyph|knob|seam)\b/.test(sel);
      for (const decl of m[2].split(';')) {
        const prop = (decl.split(':')[0] || '').trim().toLowerCase();
        if (!prop || prop.startsWith('/*')) continue;
        /* the arch may be SIZED; nothing inside it may be touched at all */
        const ok = inner ? false : (prop === 'width' || prop === 'height' || ALLOWED.test(prop));
        if (!ok) bad.push(f + '  ' + sel + ' { ' + prop + ' }');
      }
    }
  }
  check('no page hand-corrects the door — size only', bad.length === 0,
    bad.length ? '\n      ' + bad.slice(0, 10).join('\n      ') +
                 '\n      ← the leaf is cqw off the arch; set width/height and let it scale'
               : CALLERS.length + ' callers, none of them redrawing the leaf');
}

/* ── 9. THE LEAF IS EXPRESSED AS A SHARE OF THE ARCH ────────────────────────────────
   The other half of rule 8: the partial has to actually BE scalable, or rule 8 just bans
   the workaround that was making it look right. Every inner geometry value is in `cqw`,
   which only resolves because the arch declares itself a container. */
{
  check('the arch is a container', /\.gdoor-arch \{[^}]*container-type:\s*inline-size/.test(PARTIAL),
    'without this every cqw below silently falls back to the small viewport');
  const grab = (sel) => (new RegExp(sel.replace(/[.[\]"]/g, '\\$&') + '\\s*\\{([^}]*)\\}').exec(PARTIAL) || [])[1] || '';
  const scales = [
    ['.gdoor-door', ['left', 'right', 'top', 'border-radius']],
    ['.gdoor-glyph', ['font-size']],
    ['.gdoor-knob', ['right', 'width', 'height']],
    ['.gdoor-seam', ['left', 'right', 'height']],
    /* ⚠ RAW selectors — grab() escapes them itself. Pre-escaping here made the regex look
       for a literal backslash and the rule "was not found", which reads exactly like a
       missing rule rather than a bad test. */
    ['.gdoor[data-grand="0"] .gdoor-door', ['left', 'right', 'top']],
    ['.gdoor[data-grand="0"] .gdoor-arch::before', ['left', 'right', 'top', 'height']],
  ];
  const flat = [];
  for (const [sel, props] of scales) {
    const body = grab(sel);
    if (!body) { flat.push(sel + ' (rule not found)'); continue; }
    for (const p of props) {
      const v = (new RegExp('(?:^|;)\\s*' + p + '\\s*:([^;]*)').exec(body) || [])[1];
      if (v && /\d+(\.\d+)?px/.test(v)) flat.push(sel + ' { ' + p + ':' + v.trim() + ' }');
    }
  }
  check('every inner measurement is a share of the arch, not a pixel', flat.length === 0,
    flat.length ? '\n      ' + flat.join('\n      ') + '\n      ← use cqw so one door serves all five sizes'
                : 'door, glyph, knob, seam and floor one\'s cloth + rod all in cqw');
}

console.log(`\n  ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
