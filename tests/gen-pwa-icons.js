/* gen-pwa-icons.js — one-off asset generator for the PWA (NOT a test).
 *
 * Rasterizes a font-independent SVG "PJCC crown" mark into every PNG the web app
 * manifest + Apple meta need, and (best-effort, if online) grabs install-dialog
 * screenshots from the live site. Reuses the test harness's Chrome finder so it
 * runs against your installed Chrome/Edge — no download.
 *
 * Run:  node tests/gen-pwa-icons.js
 * Out:  assets/images/pwa/*.png   (committed; GitHub Pages serves these directly)
 *
 * Re-run any time the mark changes. Lives under tests/ so it stays OUT of the
 * published site and the link gate.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { findChrome } = require('./harness');
let puppeteer;
try { puppeteer = require('puppeteer-core'); }
catch (e) { console.error('puppeteer-core not installed. Run `npm install` first.'); process.exit(2); }

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'assets', 'images', 'pwa');
fs.mkdirSync(OUT, { recursive: true });

/* ── The mark: a five-ish-point royal crown (Princess → PJCC), drawn in a 0..100
 *    box so it scales crisply to any icon size. `pad` shrinks it toward centre for
 *    maskable safe-zone; `mono` renders a flat white silhouette on transparency. ── */
function crownSVG(size, { maskable = false, mono = false } = {}) {
  const scale = maskable ? 0.70 : 1;                 // maskable: keep well inside the safe circle
  const crownFill = mono ? '#ffffff' : 'url(#gold)';
  const bandFill  = mono ? '#ffffff' : 'url(#gold)';
  const bg = mono ? '' : `
    <rect x="0" y="0" width="100" height="100" fill="url(#bg)"/>
    <circle cx="50" cy="47" r="46" fill="url(#glow)"/>`;
  const jewels = mono ? '' : `
    <circle cx="9"  cy="31" r="4.6" fill="#FFF3C8" stroke="#8a6a00" stroke-width="0.6"/>
    <circle cx="50" cy="20" r="5.6" fill="#FF6E8E" stroke="#8a6a00" stroke-width="0.6"/>
    <circle cx="91" cy="31" r="4.6" fill="#FFF3C8" stroke="#8a6a00" stroke-width="0.6"/>
    <circle cx="30" cy="80" r="2.6" fill="#2b1c5e"/>
    <circle cx="50" cy="80" r="2.6" fill="#2b1c5e"/>
    <circle cx="70" cy="80" r="2.6" fill="#2b1c5e"/>`;
  const stroke = mono ? '' : 'stroke="#8a6a00" stroke-width="1"';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#2a1a5e"/>
      <stop offset="0.55" stop-color="#160c33"/>
      <stop offset="1" stop-color="#0a0714"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.45" r="0.5">
      <stop offset="0" stop-color="#F5C518" stop-opacity="0.30"/>
      <stop offset="1" stop-color="#F5C518" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FFE9A8"/>
      <stop offset="0.5" stop-color="#F5C518"/>
      <stop offset="1" stop-color="#C6960C"/>
    </linearGradient>
  </defs>
  ${bg}
  <g transform="translate(50 50) scale(${scale}) translate(-50 -50)">
    <path d="M14 74 L9 33 L31 55 L50 23 L69 55 L91 33 L86 74 Z" fill="${crownFill}" ${stroke} stroke-linejoin="round"/>
    <rect x="12" y="73" width="76" height="13" rx="4" fill="${bandFill}" ${stroke}/>
    ${jewels}
  </g>
</svg>`;
}

// name, size, options
const ICONS = [
  ['icon-192.png',          192, {}],
  ['icon-512.png',          512, {}],
  ['icon-192-maskable.png', 192, { maskable: true }],
  ['icon-512-maskable.png', 512, { maskable: true }],
  ['icon-mono-512.png',     512, { mono: true }],
  ['apple-touch-icon.png',  180, {}],
  ['icon-96.png',            96, {}],   // manifest shortcuts
];

async function run() {
  const exe = findChrome();
  if (!exe) { console.error('No Chrome/Edge found. Install one or set CHROME_PATH.'); process.exit(2); }
  const browser = await puppeteer.launch({ executablePath: exe, headless: 'new', args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    for (const [name, size, opts] of ICONS) {
      const svg = crownSVG(size, opts);
      const html = `<!doctype html><html><head><meta charset="utf-8">
        <style>*{margin:0;padding:0}html,body{width:${size}px;height:${size}px;overflow:hidden}</style>
        </head><body>${svg}</body></html>`;
      await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
      await page.setContent(html, { waitUntil: 'load' });
      await page.screenshot({ path: path.join(OUT, name), omitBackground: !!opts.mono, clip: { x: 0, y: 0, width: size, height: size } });
      console.log('  ✓ ' + name + '  (' + size + 'px)');
    }

    /* Best-effort install-dialog screenshots from the LIVE site (needs network). */
    const shots = [
      ['screenshot-mobile.png', 'https://mcpuppystudios.com/games/', 390, 844],
      ['screenshot-wide.png',   'https://mcpuppystudios.com/pjcc/',  1280, 800],
    ];
    for (const [name, url, w, h] of shots) {
      try {
        await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });
        await new Promise(r => setTimeout(r, 1200));
        await page.screenshot({ path: path.join(OUT, name), clip: { x: 0, y: 0, width: w, height: h } });
        console.log('  ✓ ' + name + '  (live ' + w + 'x' + h + ')');
      } catch (e) {
        console.log('  – skipped ' + name + ' (offline or slow): ' + e.message.split('\n')[0]);
      }
    }
  } finally {
    await browser.close();
  }
  console.log('\nDone → ' + path.relative(ROOT, OUT));
}
run().catch(e => { console.error(e); process.exit(1); });
