/* gen-favicon.js — one-off asset generator for the classic favicon (NOT a test).
 *
 * WHY: the site only shipped favicon.svg. Modern browsers are happy with that, but
 * older ones — and some Safari bookmark / pinned-tab surfaces, and a lot of RSS
 * readers, link-preview bots and "add to bookmarks" flows — can't read an SVG icon and
 * fall back to a blank page glyph. They also request /favicon.ico from the site root by
 * reflex, which currently 404s on every single visit.
 *
 * So this rasterizes the real McPuppy paw mark to PNG at 16/32/48 and packs them into a
 * genuine multi-size favicon.ico (ICO can embed PNG payloads, which is what we do).
 *
 * Run:  node tests/gen-favicon.js
 * Out:  assets/images/favicon-16.png, -32.png, -48.png   +   /favicon.ico (site root)
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { findChrome } = require('./harness');
let puppeteer;
try { puppeteer = require('puppeteer-core'); }
catch (e) { console.error('puppeteer-core not installed. Run `npm install` first.'); process.exit(2); }

const ROOT = path.join(__dirname, '..');
const SVG = fs.readFileSync(path.join(ROOT, 'assets', 'images', 'favicon.svg'), 'utf8');

/* The paw mark is near-black (#111) on transparency — which vanishes against a DARK
 * browser tab. A favicon has to survive both light and dark chrome, so we set it on the
 * brand tile (the same deep purple as the app icon) with the paw knocked out in cream.
 * Same mark, just always visible. */
function faviconHTML(size) {
  let mark = SVG
    .replace(/fill="#111"/g, 'fill="#F5C518"')     // paw -> brand gold (same palette as the app icon)
    .replace(/fill="white"/g, 'fill="#160c33"')    // the "McP" knockout -> the tile colour
    .replace(/width="100" height="100"/, `width="${Math.round(size * 0.82)}" height="${Math.round(size * 0.82)}"`);
  // At 16px the "McP" lettering is illegible mush and just muddies the shape. Drop it and
  // let the paw silhouette carry the identity — simplifying the mark at tiny sizes is the
  // normal move, and the paw alone is still unmistakably McPuppy.
  if (size <= 16) mark = mark.replace(/<text[\s\S]*?<\/text>/g, '');
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    *{margin:0;padding:0}
    html,body{width:${size}px;height:${size}px;overflow:hidden}
    body{display:flex;align-items:center;justify-content:center;
      background:#160c33;border-radius:${Math.round(size * 0.18)}px}
  </style></head><body>${mark}</body></html>`;
}

/* Pack PNGs into a real .ico. ICO supports embedded PNG payloads (Vista+), so we can
 * just wrap the files we already rendered — no BMP encoding needed. */
function buildIco(pngs) {
  const count = pngs.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);        // reserved
  header.writeUInt16LE(1, 2);        // type: 1 = icon
  header.writeUInt16LE(count, 4);    // image count

  const dir = Buffer.alloc(16 * count);
  let offset = 6 + 16 * count;
  pngs.forEach((p, i) => {
    const b = i * 16;
    dir.writeUInt8(p.size >= 256 ? 0 : p.size, b + 0);   // width  (0 means 256)
    dir.writeUInt8(p.size >= 256 ? 0 : p.size, b + 1);   // height
    dir.writeUInt8(0, b + 2);                            // palette count
    dir.writeUInt8(0, b + 3);                            // reserved
    dir.writeUInt16LE(1, b + 4);                         // colour planes
    dir.writeUInt16LE(32, b + 6);                        // bits per pixel
    dir.writeUInt32LE(p.buf.length, b + 8);              // bytes of payload
    dir.writeUInt32LE(offset, b + 12);                   // offset to payload
    offset += p.buf.length;
  });
  return Buffer.concat([header, dir, ...pngs.map((p) => p.buf)]);
}

async function run() {
  const exe = findChrome();
  if (!exe) { console.error('No Chrome/Edge found. Install one or set CHROME_PATH.'); process.exit(2); }
  const browser = await puppeteer.launch({ executablePath: exe, headless: 'new', args: ['--no-sandbox'] });
  const pngs = [];
  try {
    const page = await browser.newPage();
    for (const size of [16, 32, 48]) {
      await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
      await page.setContent(faviconHTML(size), { waitUntil: 'load' });
      const out = path.join(ROOT, 'assets', 'images', `favicon-${size}.png`);
      await page.screenshot({ path: out, omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
      const buf = fs.readFileSync(out);
      pngs.push({ size, buf });
      console.log(`  ✓ favicon-${size}.png  (${buf.length} bytes)`);
    }
  } finally {
    await browser.close();
  }
  const ico = buildIco(pngs);
  fs.writeFileSync(path.join(ROOT, 'favicon.ico'), ico);
  console.log(`  ✓ favicon.ico          (${ico.length} bytes, ${pngs.length} sizes: 16/32/48)`);
  console.log('\nDone. /favicon.ico now answers the request every browser makes by reflex.');
}
run().catch((e) => { console.error(e); process.exit(1); });
