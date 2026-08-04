/* =============================================================================
 * PJCC · THE PERSON, DRAWN AS PARTS            (2026-08-03)
 * -----------------------------------------------------------------------------
 * Nate: "Take away characters like fox, visitor, robot, and fairy. Keep them human.
 * Keep the eye setup uniform so we can change eye color. Can we customize the eyes
 * so that users can choose different color eyes, and if they want, a 2 color eye?
 * For example, my eyes have the pupil in the middle, then a ring of green, then a
 * ring of brown."
 *
 * THIS IS THE OTHER HALF OF THE 2026-07-28 JOB. The companion became parts that day
 * (pjcc-pet-art.js) and the person stayed one of 32 emoji — 🧑 🥷 👸 — which is one
 * picture with no eye to colour, at any level of cleverness. The backlog recorded the
 * trade and left it: drawing the person costs the 32 ready-made characters. The line
 * above is Nate taking that trade.
 *
 * WHAT THE TRADE ACTUALLY BOUGHT, and it is more than it cost: a ninja used to be a
 * whole character you had to PICK INSTEAD OF a princess. Now who you are is hair +
 * skin + eyes + a hat + a title, so you can be a ninja with red hair and green eyes.
 * 12 × 6 × 12 × 11 × 11 is a bigger cast than 32 fixed faces, and every one of them is
 * somebody's rather than the picker's.
 *
 * ── THE EYE, WHICH IS THE POINT ─────────────────────────────────────────────
 * Four concentric parts, drawn outward-in so each covers the last:
 *
 *     sclera   the white
 *     outer    the OUTER iris ring   <- `eyeOuter`
 *     inner    the INNER iris ring   <- `eye`
 *     pupil    the middle
 *     glint    the highlight that stops it looking printed
 *
 * A one-colour eye is the two rings set to the same colour — NOT a separate code
 * path. That is why "two-tone" costs nothing to maintain: there is only ever one
 * eye, and sometimes its two rings agree.
 *
 * ART DIRECTION follows the chess canon (_pjcc-22-chess-canon.scss) and the pet:
 * solid fills, fat outlines, no gradients, no filters. Same sheet of stickers.
 *
 *   PJCCFaceArt.svg({tone, hair, hairColor, eye, eyeOuter, brow, mouth})
 *   PJCCFaceArt.SKIN / HAIR / HAIRCOL / EYES  (+ *_ORDER)  -> the palettes
 * ========================================================================== */
(function () {
  'use strict';

  var LINE = '#2f2440';          // the canon's outline
  var SCLERA = '#fdfbff';
  var PUPIL = '#241b3a';

  /* ── SKIN ────────────────────────────────────────────────────────────────────
     ⚠ THE KEYS ARE THE OLD EMOJI SKIN-TONE MODIFIERS, ON PURPOSE. `tone` has been
     saved as '', '🏻'…'🏿' since the Forge shipped, and keeping the keys means every
     look already on a device keeps its skin without a migration step that could only
     ever go wrong. The values are new — a modifier is not a colour. */
  var SKIN = {
    '':   { n: 'Default', c: '#caa472', s: '#a8814f' },
    '🏻': { n: 'I',       c: '#f7d9bf', s: '#dcb595' },
    '🏼': { n: 'II',      c: '#e9c19a', s: '#c99e74' },
    '🏽': { n: 'III',     c: '#c79b6e', s: '#a4784c' },
    '🏾': { n: 'IV',      c: '#a06a43', s: '#7d4c2c' },
    '🏿': { n: 'V',       c: '#5c3a23', s: '#412714' }
  };
  var SKIN_ORDER = ['', '🏻', '🏼', '🏽', '🏾', '🏿'];

  /* ── HAIR COLOUR — the real ones first, then the three Checker Town allows. ── */
  var HAIRCOL = {
    black:    { n: 'Black',    c: '#241f2e' },
    espresso: { n: 'Espresso', c: '#3d2a1e' },
    brown:    { n: 'Brown',    c: '#6b4423' },
    auburn:   { n: 'Auburn',   c: '#8c3a24' },
    ginger:   { n: 'Ginger',   c: '#c85a1e' },
    sand:     { n: 'Sand',     c: '#c39a5c' },
    blonde:   { n: 'Blonde',   c: '#e3c169' },
    platinum: { n: 'Platinum', c: '#e8e2d0' },
    silver:   { n: 'Silver',   c: '#b9bcc7' },
    jade:     { n: 'Jade',     c: '#4bbd8d' },
    rose:     { n: 'Rose',     c: '#e2749f' },
    azure:    { n: 'Azure',    c: '#5a92d8' }
  };
  var HAIRCOL_ORDER = ['black', 'espresso', 'brown', 'auburn', 'ginger', 'sand',
                       'blonde', 'platinum', 'silver', 'jade', 'rose', 'azure'];

  /* ── EYE COLOUR — the same eight the companion has, plus two. Sharing the list
     matters: "your eyes and your dog's eyes" should be able to be the same green. */
  var EYES = {
    brown:  { n: 'Brown',  c: '#7a4a24' },
    hazel:  { n: 'Hazel',  c: '#a8813c' },
    amber:  { n: 'Amber',  c: '#d9902a' },
    honey:  { n: 'Honey',  c: '#c98b3f' },
    olive:  { n: 'Olive',  c: '#6f7d3a' },
    green:  { n: 'Green',  c: '#4f9a56' },
    blue:   { n: 'Blue',   c: '#4a8fd0' },
    ice:    { n: 'Ice',    c: '#9fd6ee' },
    grey:   { n: 'Grey',   c: '#7b8494' },
    violet: { n: 'Violet', c: '#8a63d2' }
  };
  var EYE_ORDER = ['brown', 'hazel', 'amber', 'honey', 'olive', 'green', 'blue', 'ice', 'grey', 'violet'];

  function n(v) { return Math.round(v * 100) / 100; }
  function darken(hex, k) {
    var m = /^#?([0-9a-f]{6})$/i.exec(hex); if (!m) return hex;
    var v = parseInt(m[1], 16);
    var r = Math.round(((v >> 16) & 255) * k), g = Math.round(((v >> 8) & 255) * k), b = Math.round((v & 255) * k);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  // ---- the head, one shape, every face ------------------------------------
  var CX = 50, CY = 45, HW = 20.5, HH = 23;

  function head(S) {
    // a rounded skull tapering to a soft chin — an ellipse has no jaw
    return '<path class="fa-skin" d="M' + n(CX - HW) + ' ' + n(CY - 2) +
      ' C' + n(CX - HW) + ' ' + n(CY - HH * 1.30) + ' ' + n(CX + HW) + ' ' + n(CY - HH * 1.30) + ' ' + n(CX + HW) + ' ' + n(CY - 2) +
      ' C' + n(CX + HW) + ' ' + n(CY + HH * 0.80) + ' ' + n(CX + HW * 0.46) + ' ' + n(CY + HH * 1.02) + ' ' + CX + ' ' + n(CY + HH * 1.02) +
      ' C' + n(CX - HW * 0.46) + ' ' + n(CY + HH * 1.02) + ' ' + n(CX - HW) + ' ' + n(CY + HH * 0.80) + ' ' + n(CX - HW) + ' ' + n(CY - 2) + 'Z"' +
      ' fill="' + S.c + '" stroke="' + LINE + '" stroke-width="3" stroke-linejoin="round"/>';
  }
  function ears(S) {
    return [-1, 1].map(function (d) {
      return '<ellipse class="fa-skin" cx="' + n(CX + HW * 0.99 * d) + '" cy="' + n(CY + 3) +
        '" rx="3.6" ry="4.8" fill="' + S.c + '" stroke="' + LINE + '" stroke-width="2.4"/>';
    }).join('');
  }
  function neck(S) {
    return '<path d="M' + n(CX - 7) + ' ' + n(CY + HH * 0.86) + ' h14 v8 h-14Z" fill="' + S.s + '" stroke="' + LINE + '" stroke-width="2.4" stroke-linejoin="round"/>';
  }
  function shoulders() {
    // a plain collar in the site's panel purple — the person, not an outfit. The aura
    // ring around the avatar is what carries their colour.
    return '<path d="M' + n(CX - 30) + ' 100 C' + n(CX - 28) + ' ' + n(80) + ' ' + n(CX - 13) + ' ' + n(75) + ' ' + CX + ' ' + n(75) +
      ' C' + n(CX + 13) + ' ' + n(75) + ' ' + n(CX + 28) + ' ' + n(80) + ' ' + n(CX + 30) + ' 100Z"' +
      ' fill="#3a2d6e" stroke="' + LINE + '" stroke-width="3" stroke-linejoin="round"/>';
  }

  /* ── THE EYE ──────────────────────────────────────────────────────────────────
     Uniform: same size, same place, on every single face, which is what Nate meant by
     "keep the eye setup uniform so we can change eye color". A style that moved the
     eyes would mean the colour picker showed you something different per hairstyle. */
  function eyePair(inner, outer) {
    var ey = n(CY + 1.5), ex = n(HW * 0.46), rx = 5.4, ry = 4.6;
    return [-1, 1].map(function (d) {
      var x = n(CX + ex * d);
      return '<g class="fa-eye">' +
        '<ellipse class="fa-sclera" cx="' + x + '" cy="' + ey + '" rx="' + rx + '" ry="' + ry + '" fill="' + SCLERA + '" stroke="' + LINE + '" stroke-width="1.9"/>' +
        // outward-in: each ring covers the one before it, so "two-tone" is just two fills
        /* 3.7 / 2.05 — measured off a render, not chosen. At the first pass (3.5 / 2.25)
           the outer band was 1.25 units wide and a two-tone eye was only legible on the
           104px preview; at avatar size in the nav it read as one muddy colour, which
           would make the whole feature look broken to the person who just set it. The
           band is 1.65 now and the ring survives being 22px across. */
        '<circle class="fa-iris-outer" cx="' + x + '" cy="' + ey + '" r="3.7" fill="' + outer + '"/>' +
        '<circle class="fa-iris-inner" cx="' + x + '" cy="' + ey + '" r="2.05" fill="' + inner + '"/>' +
        '<circle class="fa-pupil" cx="' + x + '" cy="' + ey + '" r="1.15" fill="' + PUPIL + '"/>' +
        '<circle class="fa-glint" cx="' + n(x + 1.5) + '" cy="' + n(ey - 1.6) + '" r="0.95" fill="#ffffff" opacity="0.95"/>' +
        '</g>';
    }).join('');
  }

  // brows carry the expression; `brow` is 0 neutral · 1 raised · -1 set/serious
  function brows(col, mood) {
    var by = n(CY - 5.4 - (mood > 0 ? 1.4 : 0)), ex = n(HW * 0.46), tilt = mood < 0 ? 1.6 : mood > 0 ? -1.1 : 0;
    return [-1, 1].map(function (d) {
      var x = n(CX + ex * d);
      return '<path class="fa-brow" d="M' + n(x - 4.6) + ' ' + n(by + tilt * d * -1) +
        ' q4.6 ' + n(-2.6 + Math.abs(tilt) * 0.2) + ' 9.2 ' + n(tilt * d) + '"' +
        ' fill="none" stroke="' + col + '" stroke-width="2.6" stroke-linecap="round"/>';
    }).join('');
  }
  function nose(S) {
    return '<path d="M' + CX + ' ' + n(CY + 5) + ' q-1.6 4 1.9 4.6" fill="none" stroke="' + S.s + '" stroke-width="1.8" stroke-linecap="round"/>';
  }
  // `mouth` is 1 smile · 0 level · -1 flat/serious
  function mouth(m) {
    var my = n(CY + 14);
    if (m < 0) return '<path d="M' + n(CX - 4.5) + ' ' + my + ' h9" stroke="' + LINE + '" stroke-width="2.2" stroke-linecap="round" fill="none"/>';
    if (m === 0) return '<path d="M' + n(CX - 5) + ' ' + my + ' q5 1.6 10 0" stroke="' + LINE + '" stroke-width="2.2" stroke-linecap="round" fill="none"/>';
    return '<path d="M' + n(CX - 5.6) + ' ' + n(my - 1) + ' q5.6 5.2 11.2 0" stroke="' + LINE + '" stroke-width="2.4" stroke-linecap="round" fill="none"/>';
  }

  /* ── HAIR ─────────────────────────────────────────────────────────────────────
     Each style is {back, front}: `back` paints behind the head (length, volume),
     `front` on top of it (the hairline, a fringe). Splitting them is what lets long
     hair fall behind the ears while the fringe still crosses the forehead.
     The stroke is a darkened version of the fill rather than the flat outline colour,
     so platinum hair doesn't get a black cartoon border. */
  var HAIR = {
    bald:  { n: 'Bald',      f: function () { return { back: '', front: '' }; } },
    buzz:  { n: 'Buzz',      f: function (c, k) { return { back: '',
      front: '<path d="M' + n(CX - HW - 0.6) + ' ' + n(CY - 4) + ' C' + n(CX - HW) + ' ' + n(CY - HH * 1.34) + ' ' + n(CX + HW) + ' ' + n(CY - HH * 1.34) + ' ' + n(CX + HW + 0.6) + ' ' + n(CY - 4) +
        ' q-7 -5 -21 -5 q-14 0 -21 5Z" fill="' + c + '" stroke="' + k + '" stroke-width="2.2" stroke-linejoin="round"/>' }; } },
    crop:  { n: 'Crop',      f: function (c, k) { return { back: '',
      front: '<path d="M' + n(CX - HW - 1.4) + ' ' + n(CY - 2) + ' C' + n(CX - HW - 1) + ' ' + n(CY - HH * 1.42) + ' ' + n(CX + HW + 1) + ' ' + n(CY - HH * 1.42) + ' ' + n(CX + HW + 1.4) + ' ' + n(CY - 2) +
        ' q-2 -8 -8 -9 q-9 4 -20 1 q-8 -1 -12 8Z" fill="' + c + '" stroke="' + k + '" stroke-width="2.4" stroke-linejoin="round"/>' }; } },
    swept: { n: 'Swept',     f: function (c, k) { return { back: '',
      front: '<path d="M' + n(CX - HW - 1.4) + ' ' + n(CY - 3) + ' C' + n(CX - HW - 1) + ' ' + n(CY - HH * 1.44) + ' ' + n(CX + HW + 1) + ' ' + n(CY - HH * 1.44) + ' ' + n(CX + HW + 1.4) + ' ' + n(CY - 1) +
        ' q-6 -6 -16 -6 q-12 0 -16 9 q-3 -6 -9 -3Z" fill="' + c + '" stroke="' + k + '" stroke-width="2.4" stroke-linejoin="round"/>' }; } },
    curls: { n: 'Curls',     f: function (c, k) {
      var out = '';
      [[-16, -16, 8], [-6, -22, 9], [6, -22, 9], [16, -16, 8], [-19, -6, 7], [19, -6, 7]].forEach(function (p) {
        out += '<circle cx="' + n(CX + p[0]) + '" cy="' + n(CY + p[1]) + '" r="' + p[2] + '" fill="' + c + '" stroke="' + k + '" stroke-width="2"/>';
      });
      return { back: '', front: out }; } },
    /* AFRO — a CLUSTER, not a disc. The first version was one big circle behind the head
       plus a front piece, and the render said it plainly: a straight-edged band across
       the forehead reads as a helmet or a headband, never as hair. Overlapping lobes with
       no straight edge anywhere is what makes it read, and the lobes are drawn twice —
       stroked first as a group silhouette, then filled — so the outlines between them
       don't show as a bag of circles. */
    afro:  { n: 'Afro',      f: function (c, k) {
      var L = [[-17, -13, 10], [-9, -21, 11], [3, -23, 11.5], [14, -18, 10.5], [20, -7, 9],
               [-21, -3, 9], [-13, -5, 10], [12, -6, 10]];
      var ring = L.map(function (p) { return '<circle cx="' + n(CX + p[0]) + '" cy="' + n(CY + p[1]) + '" r="' + p[2] + '" fill="' + k + '"/>'; }).join('');
      var fill = L.map(function (p) { return '<circle cx="' + n(CX + p[0]) + '" cy="' + n(CY + p[1]) + '" r="' + n(p[2] - 1.3) + '" fill="' + c + '"/>'; }).join('');
      return { back: ring + fill, front: '' }; } },
    bob:   { n: 'Bob',       f: function (c, k) { return {
      back: '<path d="M' + n(CX - HW - 3.5) + ' ' + n(CY + 12) + ' C' + n(CX - HW - 4) + ' ' + n(CY - HH * 1.5) + ' ' + n(CX + HW + 4) + ' ' + n(CY - HH * 1.5) + ' ' + n(CX + HW + 3.5) + ' ' + n(CY + 12) +
        ' q-5 3 -9 1 q2 -12 -1 -19 h-22 q-3 7 -1 19 q-4 2 -9 -1Z" fill="' + c + '" stroke="' + k + '" stroke-width="2.4" stroke-linejoin="round"/>',
      front: '<path d="M' + n(CX - HW - 1.5) + ' ' + n(CY - 3) + ' C' + n(CX - HW - 1) + ' ' + n(CY - HH * 1.44) + ' ' + n(CX + HW + 1) + ' ' + n(CY - HH * 1.44) + ' ' + n(CX + HW + 1.5) + ' ' + n(CY - 3) +
        ' q-4 -8 -21 -8 q-17 0 -21 8Z" fill="' + c + '" stroke="' + k + '" stroke-width="2.4" stroke-linejoin="round"/>' }; } },
    long:  { n: 'Long',      f: function (c, k) { return {
      back: '<path d="M' + n(CX - HW - 4) + ' 86 C' + n(CX - HW - 6) + ' ' + n(CY - HH * 1.5) + ' ' + n(CX + HW + 6) + ' ' + n(CY - HH * 1.5) + ' ' + n(CX + HW + 4) + ' 86' +
        ' q-7 4 -11 0 q3 -30 -1 -42 h-20 q-4 12 -1 42 q-4 4 -11 0Z" fill="' + c + '" stroke="' + k + '" stroke-width="2.4" stroke-linejoin="round"/>',
      front: '<path d="M' + n(CX - HW - 1.5) + ' ' + n(CY - 2) + ' C' + n(CX - HW - 1) + ' ' + n(CY - HH * 1.44) + ' ' + n(CX + HW + 1) + ' ' + n(CY - HH * 1.44) + ' ' + n(CX + HW + 1.5) + ' ' + n(CY - 2) +
        ' q-3 -9 -13 -9 q-15 3 -21 9Z" fill="' + c + '" stroke="' + k + '" stroke-width="2.4" stroke-linejoin="round"/>' }; } },
    tail:  { n: 'Ponytail',  f: function (c, k) { return {
      back: '<path d="M' + n(CX + HW - 2) + ' ' + n(CY - 14) + ' q16 2 15 20 q-1 16 -9 22 q-3 2 -5 -1 q7 -10 6 -22 q-1 -13 -9 -14Z" fill="' + c + '" stroke="' + k + '" stroke-width="2.4" stroke-linejoin="round"/>',
      front: '<path d="M' + n(CX - HW - 1.5) + ' ' + n(CY - 3) + ' C' + n(CX - HW - 1) + ' ' + n(CY - HH * 1.44) + ' ' + n(CX + HW + 1) + ' ' + n(CY - HH * 1.44) + ' ' + n(CX + HW + 1.5) + ' ' + n(CY - 3) +
        ' q-5 -8 -21 -8 q-16 0 -21 8Z" fill="' + c + '" stroke="' + k + '" stroke-width="2.4" stroke-linejoin="round"/>' }; } },
    braids:{ n: 'Braids',    f: function (c, k) { return {
      back: [-1, 1].map(function (d) {
        return '<path d="M' + n(CX + (HW - 1) * d) + ' ' + n(CY - 8) + ' q' + n(9 * d) + ' 6 ' + n(7 * d) + ' 22 q' + n(-1 * d) + ' 10 ' + n(-6 * d) + ' 12 q' + n(-3 * d) + ' -1 ' + n(-1 * d) + ' -4 q4 -8 3 -18 q-1 -9 -6 -12Z" fill="' + c + '" stroke="' + k + '" stroke-width="2.2" stroke-linejoin="round"/>';
      }).join(''),
      front: '<path d="M' + n(CX - HW - 1.5) + ' ' + n(CY - 3) + ' C' + n(CX - HW - 1) + ' ' + n(CY - HH * 1.44) + ' ' + n(CX + HW + 1) + ' ' + n(CY - HH * 1.44) + ' ' + n(CX + HW + 1.5) + ' ' + n(CY - 3) +
        ' q-6 -9 -21 -9 q-15 0 -21 9Z" fill="' + c + '" stroke="' + k + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M' + CX + ' ' + n(CY - HH * 1.15) + ' v9" stroke="' + k + '" stroke-width="1.8" stroke-linecap="round" fill="none"/>' }; } },
    bun:   { n: 'Top knot',  f: function (c, k) { return {
      back: '<circle cx="' + CX + '" cy="' + n(CY - HH * 1.42) + '" r="8.5" fill="' + c + '" stroke="' + k + '" stroke-width="2.4"/>',
      front: '<path d="M' + n(CX - HW - 1.5) + ' ' + n(CY - 3) + ' C' + n(CX - HW - 1) + ' ' + n(CY - HH * 1.44) + ' ' + n(CX + HW + 1) + ' ' + n(CY - HH * 1.44) + ' ' + n(CX + HW + 1.5) + ' ' + n(CY - 3) +
        ' q-5 -9 -21 -9 q-16 0 -21 9Z" fill="' + c + '" stroke="' + k + '" stroke-width="2.4" stroke-linejoin="round"/>' }; } },
    /* LOCS — the strands start at the CROWN and hang past the jaw. The first version
       started them at ±27 from centre, which is outside the head entirely, so they read
       as earmuffs floating beside a face. Now they fan from inside the hairline (±4 to
       ±19) and every one of them is longer than the chin, which is what makes it hair
       rather than an accessory. */
    locs:  { n: 'Locs',      f: function (c, k) { return {
      back: [-2, -1, 0, 1, 2].map(function (i) {
        var x = n(CX + i * 7.5);
        return '<path d="M' + x + ' ' + n(CY - 18) + ' q' + n(i * 3.5) + ' 20 ' + n(i * 4.5) + ' 38" fill="none" stroke="' + c + '" stroke-width="8" stroke-linecap="round"/>' +
               '<path d="M' + x + ' ' + n(CY - 18) + ' q' + n(i * 3.5) + ' 20 ' + n(i * 4.5) + ' 38" fill="none" stroke="' + k + '" stroke-width="1.5" stroke-linecap="round" opacity="0.45"/>';
      }).join(''),
      front: '<path d="M' + n(CX - HW - 1.5) + ' ' + n(CY - 4) + ' C' + n(CX - HW - 1) + ' ' + n(CY - HH * 1.46) + ' ' + n(CX + HW + 1) + ' ' + n(CY - HH * 1.46) + ' ' + n(CX + HW + 1.5) + ' ' + n(CY - 4) +
        ' q-6 -8 -21 -8 q-15 0 -21 8Z" fill="' + c + '" stroke="' + k + '" stroke-width="2.4" stroke-linejoin="round"/>' }; } }
  };
  var HAIR_ORDER = ['crop', 'swept', 'buzz', 'curls', 'afro', 'bob', 'long', 'tail', 'braids', 'bun', 'locs', 'bald'];

  /* ── the whole face ──────────────────────────────────────────────────────── */
  function svg(o) {
    o = o || {};
    var S = SKIN[o.tone] || SKIN[''];
    var hairStyle = HAIR[o.hair] || HAIR.crop;
    var hc = (HAIRCOL[o.hairColor] || HAIRCOL.brown).c;
    var hk = darken(hc, 0.62);
    var inner = (EYES[o.eye] || EYES.brown).c;
    // 'same' — and the DEFAULT — means a one-colour eye. Two-tone is opt-in, so a
    // player who never opens that row gets an ordinary eye rather than a novelty one.
    var outer = (!o.eyeOuter || o.eyeOuter === 'same') ? inner : (EYES[o.eyeOuter] || EYES[o.eye] || EYES.brown).c;
    var h = hairStyle.f(hc, hk);
    var browCol = o.hair === 'bald' ? darken(S.s, 0.7) : hk;

    return '<svg class="fa-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      h.back +
      shoulders() +
      neck(S) +
      ears(S) +
      head(S) +
      h.front +
      brows(browCol, o.brow == null ? 0 : o.brow) +
      eyePair(inner, outer) +
      nose(S) +
      mouth(o.mouth == null ? 0 : o.mouth) +
      '</svg>';
  }

  window.PJCCFaceArt = {
    svg: svg,
    SKIN: SKIN, SKIN_ORDER: SKIN_ORDER,
    HAIR: HAIR, HAIR_ORDER: HAIR_ORDER,
    HAIRCOL: HAIRCOL, HAIRCOL_ORDER: HAIRCOL_ORDER,
    EYES: EYES, EYE_ORDER: EYE_ORDER
  };
})();
