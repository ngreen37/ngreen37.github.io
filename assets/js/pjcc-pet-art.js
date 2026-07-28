/* =============================================================================
 * PJCC · THE COMPANION, DRAWN AS PARTS        (2026-07-28)
 * -----------------------------------------------------------------------------
 * Four species × three growth stages, built out of named shapes instead of an
 * emoji glyph — so `coat`, `eyes` and `nose` are three separate colours a player
 * can actually choose, which is the whole point.
 *
 * WHY THIS FILE EXISTS. Nate asked for 8 eye colours and a few nose colours, for
 * the pet and the person. That was impossible on 2026-07-28 and the reason was
 * simple: a companion WAS a single emoji. 🐕 is one picture. There is no eye layer
 * to hand a colour to, only pixels — which is why the coat tint had to be a
 * saturation-keyed SVG filter guessing at which pixels were "coat", and why eyes
 * and nose could never be separated at all.
 *
 * Drawn as parts, all of that goes away. No filter, no guessing, no mask: the iris
 * is an element with a `fill`. It also deletes a whole class of bug — the tint
 * filter had to be tuned against a render and re-checked per species.
 *
 * ── HOW IT'S BUILT ──────────────────────────────────────────────────────────
 * One 100×100 viewBox, one geometry function per species, and the STAGE is
 * expressed as numbers rather than as three separate drawings:
 *
 *     head   how big the head is against the body   (babies are top-heavy)
 *     eye    how big the eyes are                   (babies have huge eyes)
 *     snout  how far the muzzle projects            (babies are blunt-faced)
 *     grow   overall size
 *
 * That's not a shortcut, it's how animals actually age — a puppy is not a small
 * dog, it's a differently-proportioned one — and it means "Pup → Hound → Legend
 * Hound" is one drawing read three ways instead of three drawings to keep in sync.
 *
 * ART DIRECTION follows the chess canon (_pjcc-22-chess-canon.scss): solid fills,
 * fat outlines, no gradients, no filters. The companion should look like it was
 * cut from the same sheet of stickers as the pieces.
 *
 *   PJCCPetArt.svg({species, stage, coat, eye, nose})  -> SVG markup string
 *   PJCCPetArt.COATS / EYES / NOSES                    -> the palettes
 * ========================================================================== */
(function () {
  'use strict';

  var LINE = '#2f2440';          // the canon's piece outline
  var SCLERA = '#fdfbff';
  var PUPIL = '#241b3a';

  /* ── the palettes ────────────────────────────────────────────────────────── */
  var COATS = {
    natural: { n: 'Natural', c: '#d0a06a', b: '#f0dcc0' },
    gold:    { n: 'Gold',    c: '#e8b944', b: '#f8e6b0' },
    rose:    { n: 'Rose',    c: '#e88fb8', b: '#ffdfee' },
    azure:   { n: 'Azure',   c: '#6fa8e0', b: '#cfe6ff' },
    jade:    { n: 'Jade',    c: '#66c396', b: '#c9f2dd' },
    violet:  { n: 'Violet',  c: '#a382dd', b: '#e0d2ff' },
    crimson: { n: 'Crimson', c: '#e07070', b: '#ffd5d5' },
    ember:   { n: 'Ember',   c: '#e8944a', b: '#ffdcbb' },
    shadow:  { n: 'Shadow',  c: '#5a5568', b: '#9a94ab' },
    snow:    { n: 'Snow',    c: '#e6e6ee', b: '#ffffff' },
    ink:     { n: 'Ink',     c: '#3d3550', b: '#6b6180' }
  };

  /* EIGHT eye colours, exactly as asked. Real eye colours first (a companion
     should be able to look like an animal you'd meet), then the two that only
     exist in Checker Town. */
  var EYES = {
    brown:  { n: 'Brown',  c: '#7a4a24' },
    amber:  { n: 'Amber',  c: '#d9902a' },
    hazel:  { n: 'Hazel',  c: '#a8813c' },
    green:  { n: 'Green',  c: '#4f9a56' },
    blue:   { n: 'Blue',   c: '#4a8fd0' },
    ice:    { n: 'Ice',    c: '#9fd6ee' },
    grey:   { n: 'Grey',   c: '#7b8494' },
    violet: { n: 'Violet', c: '#8a63d2' }
  };
  var EYE_ORDER = ['brown', 'amber', 'hazel', 'green', 'blue', 'ice', 'grey', 'violet'];

  /* "just a few options" — the four a nose is ever actually made of. */
  var NOSES = {
    black: { n: 'Black', c: '#2f2a3d' },
    liver: { n: 'Liver', c: '#8a5a44' },
    pink:  { n: 'Pink',  c: '#e79aa8' },
    slate: { n: 'Slate', c: '#6d7382' }
  };
  var NOSE_ORDER = ['black', 'liver', 'pink', 'slate'];

  /* ── the stage table (see the header) ────────────────────────────────────── */
  var STAGE = [
    { head: 1.16, eye: 1.22, snout: 0.72, grow: 0.92 },   // 0 · baby
    { head: 1.00, eye: 1.00, snout: 1.00, grow: 1.00 },   // 1 · grown
    { head: 0.94, eye: 0.92, snout: 1.10, grow: 1.07 }    // 2 · elder
  ];

  function n(v) { return Math.round(v * 100) / 100; }

  /* ── shared face parts ───────────────────────────────────────────────────
     cx,cy = the head's centre · r = head radius · s = the stage numbers.
     `spread` is how far apart the eyes sit as a fraction of the head radius. */
  function eyes(cx, cy, r, s, eyeCol, spread, lift) {
    var er = n(r * 0.235 * s.eye);
    var ex = n(r * (spread || 0.42));
    var ey = n(cy - r * (lift == null ? 0.12 : lift));
    var out = '';
    [-1, 1].forEach(function (side) {
      var x = n(cx + ex * side);
      out +=
        '<circle class="pa-sclera" cx="' + x + '" cy="' + ey + '" r="' + er + '" fill="' + SCLERA + '" stroke="' + LINE + '" stroke-width="2"/>' +
        '<circle class="pa-iris" cx="' + x + '" cy="' + ey + '" r="' + n(er * 0.62) + '" fill="' + eyeCol + '"/>' +
        '<circle class="pa-pupil" cx="' + x + '" cy="' + ey + '" r="' + n(er * 0.30) + '" fill="' + PUPIL + '"/>' +
        // the highlight is what makes a drawn eye look alive rather than printed
        '<circle class="pa-glint" cx="' + n(x + er * 0.28) + '" cy="' + n(ey - er * 0.30) + '" r="' + n(er * 0.20) + '" fill="#ffffff" opacity="0.92"/>';
    });
    return out;
  }

  function snoutNose(cx, y, w, h, noseCol) {
    // a rounded triangle — the shape a nose actually is, at any size
    return '<path class="pa-nose" d="M' + n(cx - w) + ' ' + n(y) +
      ' q' + n(w) + ' ' + n(-h * 0.55) + ' ' + n(w * 2) + ' 0' +
      ' q' + n(-w * 0.55) + ' ' + n(h * 1.5) + ' ' + n(-w) + ' ' + n(h * 1.5) +
      ' q' + n(-w * 0.45) + ' 0 ' + n(-w) + ' ' + n(-h * 1.5) + 'Z"' +
      ' fill="' + noseCol + '" stroke="' + LINE + '" stroke-width="1.6" stroke-linejoin="round"/>';
  }

  /* ── the four species ────────────────────────────────────────────────────── */
  var SPECIES = {
    dog: function (s, C, E, N) {
      var g = s.grow, hr = n(21 * s.head * g), cx = 50, cy = n(44 - (s.head - 1) * 6);
      return '' +
        // tail — drawn FIRST so the body covers where it joins, which is what makes it
        // read as a tail rather than as a handle stuck on the side (caught in a render)
        '<path d="M' + n(50 + 11 * g) + ' ' + n(78) + ' q' + n(16 * g) + ' 2 ' + n(15 * g) + ' ' + n(-15 * g) + '" fill="none" stroke="' + LINE + '" stroke-width="8" stroke-linecap="round"/>' +
        '<path d="M' + n(50 + 11 * g) + ' ' + n(78) + ' q' + n(16 * g) + ' 2 ' + n(15 * g) + ' ' + n(-15 * g) + '" fill="none" stroke="' + C.c + '" stroke-width="4.5" stroke-linecap="round"/>' +
        // body
        '<ellipse class="pa-coat" cx="50" cy="' + n(74) + '" rx="' + n(21 * g) + '" ry="' + n(16 * g) + '" fill="' + C.c + '" stroke="' + LINE + '" stroke-width="3"/>' +
        '<ellipse class="pa-belly" cx="50" cy="' + n(79) + '" rx="' + n(12 * g) + '" ry="' + n(9 * g) + '" fill="' + C.b + '"/>' +
        // ears, behind the head
        '<path class="pa-coat" d="M' + n(cx - hr * 0.86) + ' ' + n(cy - hr * 0.42) + ' q' + n(-hr * 0.6) + ' ' + n(hr * 0.5) + ' ' + n(-hr * 0.16) + ' ' + n(hr * 1.16) + ' q' + n(hr * 0.42) + ' ' + n(hr * 0.2) + ' ' + n(hr * 0.62) + ' ' + n(-hr * 0.5) + 'Z" fill="' + C.c + '" stroke="' + LINE + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path class="pa-coat" d="M' + n(cx + hr * 0.86) + ' ' + n(cy - hr * 0.42) + ' q' + n(hr * 0.6) + ' ' + n(hr * 0.5) + ' ' + n(hr * 0.16) + ' ' + n(hr * 1.16) + ' q' + n(-hr * 0.42) + ' ' + n(hr * 0.2) + ' ' + n(-hr * 0.62) + ' ' + n(-hr * 0.5) + 'Z" fill="' + C.c + '" stroke="' + LINE + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        // head
        '<circle class="pa-coat" cx="' + cx + '" cy="' + cy + '" r="' + hr + '" fill="' + C.c + '" stroke="' + LINE + '" stroke-width="3"/>' +
        // muzzle
        '<ellipse class="pa-belly" cx="' + cx + '" cy="' + n(cy + hr * 0.46 * s.snout) + '" rx="' + n(hr * 0.56) + '" ry="' + n(hr * 0.40 * s.snout) + '" fill="' + C.b + '" stroke="' + LINE + '" stroke-width="2"/>' +
        eyes(cx, cy, hr, s, E, 0.44, 0.14) +
        snoutNose(cx, n(cy + hr * 0.30 * s.snout), n(hr * 0.20), n(hr * 0.13), N) +
        '<path d="M' + cx + ' ' + n(cy + hr * 0.52 * s.snout) + ' v' + n(hr * 0.16) + '" stroke="' + LINE + '" stroke-width="1.8" stroke-linecap="round" fill="none"/>';
    },

    cat: function (s, C, E, N) {
      var g = s.grow, hr = n(20 * s.head * g), cx = 50, cy = n(45 - (s.head - 1) * 6);
      return '' +
        '<path d="M' + n(50 + 10 * g) + ' ' + n(80) + ' q' + n(19 * g) + ' 3 ' + n(17 * g) + ' ' + n(-19 * g) + '" fill="none" stroke="' + LINE + '" stroke-width="7.5" stroke-linecap="round"/>' +
        '<path d="M' + n(50 + 10 * g) + ' ' + n(80) + ' q' + n(19 * g) + ' 3 ' + n(17 * g) + ' ' + n(-19 * g) + '" fill="none" stroke="' + C.c + '" stroke-width="4" stroke-linecap="round"/>' +
        '<ellipse class="pa-coat" cx="50" cy="' + n(76) + '" rx="' + n(19 * g) + '" ry="' + n(15 * g) + '" fill="' + C.c + '" stroke="' + LINE + '" stroke-width="3"/>' +
        '<ellipse class="pa-belly" cx="50" cy="' + n(81) + '" rx="' + n(11 * g) + '" ry="' + n(8 * g) + '" fill="' + C.b + '"/>' +
        // pointed ears
        '<path class="pa-coat" d="M' + n(cx - hr * 0.82) + ' ' + n(cy - hr * 0.58) + ' L' + n(cx - hr * 0.98) + ' ' + n(cy - hr * 1.48) + ' L' + n(cx - hr * 0.16) + ' ' + n(cy - hr * 0.92) + 'Z" fill="' + C.c + '" stroke="' + LINE + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path class="pa-coat" d="M' + n(cx + hr * 0.82) + ' ' + n(cy - hr * 0.58) + ' L' + n(cx + hr * 0.98) + ' ' + n(cy - hr * 1.48) + ' L' + n(cx + hr * 0.16) + ' ' + n(cy - hr * 0.92) + 'Z" fill="' + C.c + '" stroke="' + LINE + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<circle class="pa-coat" cx="' + cx + '" cy="' + cy + '" r="' + hr + '" fill="' + C.c + '" stroke="' + LINE + '" stroke-width="3"/>' +
        // whiskers
        [-1, 1].map(function (d) {
          return '<g stroke="' + LINE + '" stroke-width="1.4" stroke-linecap="round" opacity="0.75">' +
            '<path d="M' + n(cx + hr * 0.42 * d) + ' ' + n(cy + hr * 0.34) + ' L' + n(cx + hr * 1.30 * d) + ' ' + n(cy + hr * 0.18) + '"/>' +
            '<path d="M' + n(cx + hr * 0.42 * d) + ' ' + n(cy + hr * 0.46) + ' L' + n(cx + hr * 1.32 * d) + ' ' + n(cy + hr * 0.52) + '"/></g>';
        }).join('') +
        eyes(cx, cy, hr, s, E, 0.42, 0.10) +
        snoutNose(cx, n(cy + hr * 0.36), n(hr * 0.17), n(hr * 0.11), N) +
        '<path d="M' + cx + ' ' + n(cy + hr * 0.55) + ' q' + n(-hr * 0.20) + ' ' + n(hr * 0.18) + ' ' + n(-hr * 0.30) + ' 0 M' + cx + ' ' + n(cy + hr * 0.55) + ' q' + n(hr * 0.20) + ' ' + n(hr * 0.18) + ' ' + n(hr * 0.30) + ' 0" stroke="' + LINE + '" stroke-width="1.8" fill="none" stroke-linecap="round"/>';
    },

    bird: function (s, C, E, N) {
      var g = s.grow, hr = n(18 * s.head * g), cx = 50, cy = n(40 - (s.head - 1) * 5);
      return '' +
        // tail feathers
        '<path class="pa-coat" d="M' + n(50 + 8 * g) + ' ' + n(70) + ' l' + n(22 * g) + ' ' + n(2 * g) + ' l' + n(-16 * g) + ' ' + n(13 * g) + 'Z" fill="' + C.c + '" stroke="' + LINE + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<ellipse class="pa-coat" cx="50" cy="' + n(70) + '" rx="' + n(18 * g) + '" ry="' + n(17 * g) + '" fill="' + C.c + '" stroke="' + LINE + '" stroke-width="3"/>' +
        '<ellipse class="pa-belly" cx="50" cy="' + n(74) + '" rx="' + n(11 * g) + '" ry="' + n(10 * g) + '" fill="' + C.b + '"/>' +
        // wing
        '<path class="pa-belly" d="M' + n(50 - 14 * g) + ' ' + n(66) + ' q' + n(-8 * g) + ' ' + n(10 * g) + ' ' + n(4 * g) + ' ' + n(15 * g) + ' q' + n(8 * g) + ' ' + n(-4 * g) + ' ' + n(6 * g) + ' ' + n(-13 * g) + 'Z" fill="' + C.b + '" stroke="' + LINE + '" stroke-width="2.2" stroke-linejoin="round"/>' +
        // head tuft
        '<path class="pa-coat" d="M' + n(cx - 3) + ' ' + n(cy - hr * 0.95) + ' q' + n(2) + ' ' + n(-hr * 0.7) + ' ' + n(8) + ' ' + n(-hr * 0.45) + ' q' + n(-4) + ' ' + n(hr * 0.3) + ' ' + n(-2) + ' ' + n(hr * 0.5) + 'Z" fill="' + C.c + '" stroke="' + LINE + '" stroke-width="2.2" stroke-linejoin="round"/>' +
        '<circle class="pa-coat" cx="' + cx + '" cy="' + cy + '" r="' + hr + '" fill="' + C.c + '" stroke="' + LINE + '" stroke-width="3"/>' +
        eyes(cx, cy, hr, s, E, 0.40, 0.08) +
        // the BEAK is the bird's nose — same colour control, different shape
        '<path class="pa-nose" d="M' + n(cx - hr * 0.26) + ' ' + n(cy + hr * 0.34) + ' L' + n(cx + hr * 0.26) + ' ' + n(cy + hr * 0.34) + ' L' + cx + ' ' + n(cy + hr * 0.86) + 'Z" fill="' + N + '" stroke="' + LINE + '" stroke-width="2" stroke-linejoin="round"/>' +
        // feet
        '<g stroke="' + LINE + '" stroke-width="2.6" stroke-linecap="round"><path d="M44 ' + n(85) + ' v5"/><path d="M56 ' + n(85) + ' v5"/></g>';
    },

    turtle: function (s, C, E, N) {
      var g = s.grow, hr = n(14 * s.head * g), cx = n(50 - 20 * g), cy = n(58);
      return '' +
        // legs
        '<g fill="' + C.b + '" stroke="' + LINE + '" stroke-width="2.4">' +
        '<ellipse cx="' + n(50 - 12 * g) + '" cy="' + n(80) + '" rx="' + n(7 * g) + '" ry="' + n(5 * g) + '"/>' +
        '<ellipse cx="' + n(50 + 14 * g) + '" cy="' + n(80) + '" rx="' + n(7 * g) + '" ry="' + n(5 * g) + '"/></g>' +
        // the neck FIRST — it has to run under the shell, or it lies across it like a
        // plank (which is exactly what the first render showed)
        '<rect x="' + n(cx) + '" y="' + n(cy - 4) + '" width="' + n(26 * g) + '" height="9" rx="4" fill="' + C.b + '" stroke="' + LINE + '" stroke-width="2.4"/>' +
        // shell — the coat, with plates
        '<path class="pa-coat" d="M' + n(50 - 26 * g) + ' ' + n(72) + ' a' + n(26 * g) + ' ' + n(22 * g) + ' 0 0 1 ' + n(52 * g) + ' 0Z" fill="' + C.c + '" stroke="' + LINE + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M' + n(50 - 26 * g) + ' ' + n(72) + ' h' + n(52 * g) + '" stroke="' + LINE + '" stroke-width="2.4"/>' +
        '<g fill="none" stroke="' + LINE + '" stroke-width="1.6" opacity="0.6">' +
        '<path d="M50 ' + n(50 * 1) + ' V72"/>' +
        '<path d="M' + n(50 - 13 * g) + ' ' + n(57) + ' L' + n(50 - 9 * g) + ' 72"/>' +
        '<path d="M' + n(50 + 13 * g) + ' ' + n(57) + ' L' + n(50 + 9 * g) + ' 72"/></g>' +
        // head, on top of everything
        '<circle class="pa-coat" cx="' + cx + '" cy="' + cy + '" r="' + hr + '" fill="' + C.b + '" stroke="' + LINE + '" stroke-width="3"/>' +
        eyes(cx, cy, hr, s, E, 0.40, 0.16) +
        '<circle class="pa-nose" cx="' + n(cx - hr * 0.62) + '" cy="' + n(cy + hr * 0.22) + '" r="' + n(hr * 0.13) + '" fill="' + N + '"/>' +
        '<path d="M' + n(cx - hr * 0.85) + ' ' + n(cy + hr * 0.55) + ' q' + n(hr * 0.3) + ' ' + n(hr * 0.2) + ' ' + n(hr * 0.6) + ' 0" stroke="' + LINE + '" stroke-width="1.8" fill="none" stroke-linecap="round"/>';
    }
  };

  /* ── the public draw ─────────────────────────────────────────────────────── */
  function svg(o) {
    o = o || {};
    var sp = SPECIES[o.species] ? o.species : 'dog';
    var s = STAGE[Math.max(0, Math.min(2, o.stage | 0))];
    var C = COATS[o.coat] || COATS.natural;
    var E = (EYES[o.eye] || EYES.brown).c;
    var N = (NOSES[o.nose] || NOSES.black).c;
    return '<svg class="pa-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" ' +
      'role="img" aria-hidden="true" focusable="false">' +
      SPECIES[sp](s, C, E, N) + '</svg>';
  }

  window.PJCCPetArt = {
    svg: svg,
    COATS: COATS, EYES: EYES, NOSES: NOSES,
    EYE_ORDER: EYE_ORDER, NOSE_ORDER: NOSE_ORDER,
    COAT_ORDER: ['natural', 'gold', 'ember', 'crimson', 'rose', 'violet', 'azure', 'jade', 'snow', 'shadow', 'ink'],
    SPECIES: Object.keys(SPECIES)
  };
})();
