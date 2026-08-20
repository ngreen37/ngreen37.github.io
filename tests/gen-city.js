/* ═══════════════════════════════════════════════════════════════════════════════
 * CHESS CITY — the skyline generator.        `npm run gen:city`
 * -------------------------------------------------------------------------------
 * Writes _includes/town-city.svg, which _includes/town-sky.html includes as the
 * `.ts-city` layer. 2026-08-20, Nate: "the bottom of the screen should have a basic
 * chess city feel to it with skyscrapers reaching toward like the middle of the
 * screen … I'd like them to have a chess-piece feel to them."
 *
 * ⚠ THE SVG IS GENERATED. Edit the NEAR / FAR tables at the bottom of this file and
 * re-run; a hand-edit to town-city.svg is thrown away by the next run. Commit both.
 *
 * SIX SILHOUETTES, five of them a piece: ROOK (crenellated parapet on a flared
 * collar), PAWN (collar ring + round head), BISHOP (tapering shaft, ogive mitre,
 * and the slit), KING (dome + cross finial), QUEEN (a crown of points), and SLAB —
 * the plain tower that is the connective tissue between them. No knight: at
 * silhouette scale a knight-shaped skyscraper is a blob, and a blob in a skyline is
 * just a building you drew badly.
 *
 * ⚠ THE WHOLE RANK IS ONE PATH, under the default nonzero fill rule. That is why the
 * bishop's slit is cut into the OUTLINE rather than drawn as a second subpath: a
 * subpath here would not punch a hole, it would fill itself in. It is also why the
 * ranks are two paths and not forty-five elements — two paint ops, no layers.
 *
 * ⚠ AND WHY FAR PIECES SIT BEHIND NEAR *SLABS*. A far tower whose shaft is hidden by
 * the near rank shows only its crown, and a crown with no building under it reads as
 * a shape floating in the sky. Every distinctive FAR top is parked over a NEAR slab,
 * which is flat-roofed and shorter, so the whole top-plus-collar clears it. This was
 * caught in a render, not in the source: the first draft had a bishop's mitre
 * hovering over a rooftop like a flame.
 * ═══════════════════════════════════════════════════════════════════════════════ */
const VBW = 2800, GROUND = 560;
const n = (v) => Math.round(v * 10) / 10;
const shaft = (x, w, y) => `M${x} ${GROUND} L${x} ${y} L${x + w} ${y} L${x + w} ${GROUND} Z`;

const P = {
  rook(x, w, y, { merlons = 4, mh = 26, collar = 12 } = {}) {
    const cw = w + collar * 2, cx = x - collar, unit = n(cw / (merlons * 2 - 1));
    let d = shaft(x, w, y + 18);
    d += ` M${cx} ${y + 18} L${cx} ${y} L${n(cx + cw)} ${y} L${n(cx + cw)} ${y + 18} Z`;
    for (let i = 0; i < merlons; i++) {
      const mx = n(cx + i * unit * 2);
      d += ` M${mx} ${y} L${mx} ${y - mh} L${n(mx + unit)} ${y - mh} L${n(mx + unit)} ${y} Z`;
    }
    return d;
  },
  pawn(x, w, y, { head = 0.66, collar = 9 } = {}) {
    const r = n(w * head / 2), cx = n(x + w / 2);
    return shaft(x, w, y)
      + ` M${x - collar} ${y} L${x - collar} ${y - 13} L${x + w + collar} ${y - 13} L${x + w + collar} ${y} Z`
      + ` M${n(cx - r)} ${y - 13} A${r} ${r} 0 1 1 ${n(cx + r)} ${y - 13} Z`;
  },
  bishop(x, w, y, { mitre = 52 } = {}) {
    const cx = n(x + w / 2), hw = n(w * 0.74 / 2), m = mitre;
    return `M${x} ${GROUND} L${x} ${y + 46} L${n(cx - hw)} ${y + 12} L${n(cx + hw)} ${y + 12} L${x + w} ${y + 46} L${x + w} ${GROUND} Z`
      + ` M${n(cx - hw - 6)} ${y + 12} L${n(cx - hw - 6)} ${y} L${n(cx + hw + 6)} ${y} L${n(cx + hw + 6)} ${y + 12} Z`
      + ` M${n(cx - hw)} ${y}`
      + ` C${n(cx - hw)} ${n(y - m * .42)} ${n(cx - hw * .72)} ${n(y - m * .7)} ${n(cx - hw * .46)} ${n(y - m * .8)}`
      + ` L${n(cx + hw * .3)} ${n(y - m * .5)} L${n(cx + hw * .1)} ${n(y - m * .38)} L${n(cx - hw * .3)} ${n(y - m * .62)}`
      + ` C${n(cx - hw * .34)} ${n(y - m * .84)} ${n(cx - hw * .2)} ${n(y - m)} ${cx} ${y - m}`
      + ` C${n(cx + hw * .44)} ${n(y - m * .86)} ${n(cx + hw)} ${n(y - m * .4)} ${n(cx + hw)} ${y} Z`;
  },
  king(x, w, y, { cross = 44, arm = 22 } = {}) {
    const cx = n(x + w / 2), dr = n(w * .34), dh = n(w * .3);
    const t = n(y + 8 - dh), a = n(t - cross + arm);
    return shaft(x, w, y + 24)
      + ` M${x - 8} ${y + 24} L${x - 8} ${y + 8} L${x + w + 8} ${y + 8} L${x + w + 8} ${y + 24} Z`
      + ` M${n(cx - dr)} ${y + 8} A${dr} ${dh} 0 0 1 ${n(cx + dr)} ${y + 8} Z`
      + ` M${cx - 6} ${t} L${cx - 6} ${a} L${n(cx - arm / 2 - 6)} ${a} L${n(cx - arm / 2 - 6)} ${a - 12}`
      + ` L${cx - 6} ${a - 12} L${cx - 6} ${t - cross} L${cx + 6} ${t - cross} L${cx + 6} ${a - 12}`
      + ` L${n(cx + arm / 2 + 6)} ${a - 12} L${n(cx + arm / 2 + 6)} ${a} L${cx + 6} ${a} L${cx + 6} ${t} Z`;
  },
  queen(x, w, y, { points = 5, ph = 34, collar = 12 } = {}) {
    const cw = w + collar * 2, x0 = x - collar, step = n(cw / points);
    let d = shaft(x, w, y + 16)
      + ` M${x0} ${y + 16} L${x0} ${y} L${n(x0 + cw)} ${y} L${n(x0 + cw)} ${y + 16} Z`;
    for (let i = 0; i < points; i++) {
      const px = n(x0 + step * i + step / 2);
      d += ` M${n(px - step * .36)} ${y} L${px} ${y - ph} L${n(px + step * .36)} ${y} Z`;
    }
    return d;
  },
  slab(x, w, y, { step = 0 } = {}) {
    if (!step) return shaft(x, w, y);
    return `M${x} ${GROUND} L${x} ${y + step} L${n(x + w * .18)} ${y + step} L${n(x + w * .18)} ${y}`
      + ` L${n(x + w * .82)} ${y} L${n(x + w * .82)} ${y + step} L${x + w} ${y + step} L${x + w} ${GROUND} Z`;
  }
};
const WIN_TOP = { rook: 30, pawn: 14, bishop: 58, king: 36, queen: 28, slab: 12 };

const NEAR = [
  ['slab', -60, 150, 300, { step: 44 }],
  ['pawn', 120, 74, 236],
  ['slab', 228, 92, 316, { step: 34 }],
  ['rook', 354, 124, 180, { merlons: 5, mh: 30, collar: 14 }],
  ['slab', 516, 84, 304],
  ['bishop', 634, 98, 198, { mitre: 54 }],
  ['slab', 768, 78, 318, { step: 30 }],
  ['king', 880, 116, 120],
  ['slab', 1032, 90, 308, { step: 34 }],
  ['pawn', 1158, 70, 244],
  ['slab', 1262, 96, 320],
  ['queen', 1394, 130, 202, { points: 5, ph: 36, collar: 13 }],
  ['slab', 1560, 82, 300, { step: 30 }],
  ['rook', 1676, 112, 190, { merlons: 4, mh: 28, collar: 13 }],
  ['slab', 1822, 88, 316, { step: 34 }],
  ['pawn', 1944, 68, 250],
  ['slab', 2046, 100, 302],
  ['bishop', 2182, 92, 210, { mitre: 50 }],
  ['slab', 2308, 84, 322, { step: 30 }],
  ['queen', 2426, 118, 224, { points: 4, ph: 32, collar: 12 }],
  ['slab', 2578, 94, 296, { step: 36 }],
  ['rook', 2706, 106, 206, { merlons: 4, mh: 26, collar: 12 }]
];
const FAR = [
  ['slab', -40, 130, 322, { step: 30 }],
  ['slab', 100, 78, 302],
  ['rook', 244, 84, 262, { merlons: 4, mh: 20, collar: 10 }],
  ['slab', 390, 96, 306, { step: 26 }],
  ['pawn', 534, 58, 258],
  ['slab', 660, 84, 292],
  ['queen', 778, 76, 254, { points: 4, ph: 24, collar: 9 }],
  ['slab', 920, 70, 300],
  ['bishop', 1046, 66, 262, { mitre: 38 }],
  ['slab', 1180, 92, 296, { step: 28 }],
  ['rook', 1276, 74, 258, { merlons: 3, mh: 20, collar: 9 }],
  ['slab', 1440, 86, 304],
  ['pawn', 1576, 56, 254],
  ['slab', 1720, 90, 298, { step: 26 }],
  ['bishop', 1840, 62, 256, { mitre: 36 }],
  ['slab', 1980, 78, 300],
  ['rook', 2062, 78, 260, { merlons: 3, mh: 20, collar: 9 }],
  ['slab', 2220, 92, 294, { step: 28 }],
  ['queen', 2322, 74, 256, { points: 4, ph: 24, collar: 9 }],
  ['slab', 2470, 84, 302],
  ['pawn', 2594, 58, 250],
  ['slab', 2720, 110, 300, { step: 30 }],
  ['rook', 2840, 90, 264, { merlons: 3, mh: 20, collar: 10 }]
];

const rank = (list) => list.map(([k, x, w, y, o]) => P[k](x, w, y, o)).join(' ');

function windows(list, seed) {
  let r = seed;
  const rnd = () => (r = (r * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  let out = '';
  list.forEach(([k, x, w, y, o]) => {
    const top = y + WIN_TOP[k] + ((o && o.step) || 0);
    for (let yy = top + 16; yy < GROUND - 18; yy += 28)
      for (let xx = x + 11; xx < x + w - 14; xx += 21)
        if (rnd() < 0.22) out += `M${n(xx)} ${n(yy)}h7v11h-7z`;
  });
  return out;
}

const svg = `<svg class="ts-city-art" viewBox="0 0 ${VBW} ${GROUND}" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
<path class="ts-city-far" d="${rank(FAR)}"/>
<path class="ts-city-win ts-city-win--far" d="${windows(FAR, 20260820)}"/>
<path class="ts-city-near" d="${rank(NEAR)}"/>
<path class="ts-city-win ts-city-win--near" d="${windows(NEAR, 77712031)}"/>
</svg>`;
require('fs').writeFileSync(__dirname + '/../_includes/town-city.svg', svg);
console.log(svg.length + ' bytes, ' + (NEAR.length + FAR.length) + ' buildings');
