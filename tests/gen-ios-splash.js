/* gen-ios-splash.js — one-off asset generator for the iOS launch screens (NOT a test).
 *
 * WHY: when you tap an installed PWA on iPhone, iOS shows a static image while it boots.
 * If you don't supply one, you get a BLANK WHITE FLASH — the single most obvious "this
 * isn't a real app" tell. Apple wants an exact image per device resolution, matched by a
 * media query, which is why this is generated rather than hand-drawn.
 *
 * Run:  node tests/gen-ios-splash.js
 * Out:  assets/images/pwa/splash/*.png   (+ the <link> list, injected by pwa-register.js)
 *
 * Portrait only: an installed PJCC opens portrait, and covering landscape would double
 * the file count for a screen most people never see.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { findChrome } = require('./harness');
let puppeteer;
try { puppeteer = require('puppeteer-core'); }
catch (e) { console.error('puppeteer-core not installed. Run `npm install` first.'); process.exit(2); }

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'assets', 'images', 'pwa', 'splash');
fs.mkdirSync(OUT, { recursive: true });

/* [cssWidth, cssHeight, dpr] — the CSS size + pixel ratio Apple matches on.
   Covers current iPhones back to the 8/SE, plus the iPad sizes. */
const DEVICES = [
  [440, 956, 3], // iPhone 16 Pro Max
  [402, 874, 3], // iPhone 16 Pro
  [430, 932, 3], // iPhone 15/14 Pro Max, 15 Plus
  [393, 852, 3], // iPhone 15/14 Pro, 15, 14
  [428, 926, 3], // iPhone 14 Plus, 13/12 Pro Max
  [390, 844, 3], // iPhone 13/12, 13/12 Pro
  [375, 812, 3], // iPhone 13 mini, 12 mini, 11 Pro, XS, X
  [414, 896, 3], // iPhone 11 Pro Max, XS Max
  [414, 896, 2], // iPhone 11, XR
  [414, 736, 3], // iPhone 8 Plus
  [375, 667, 2], // iPhone SE, 8, 7, 6s
  [1024, 1366, 2], // iPad Pro 12.9"
  [834, 1194, 2],  // iPad Pro 11"
  [820, 1180, 2],  // iPad Air
  [768, 1024, 2],  // iPad mini / 9.7"
];

// The launch screen: FLAT brand background + the gold crown + the wordmark.
// Flat is deliberate. A smooth radial gradient made these PNGs ~600-900 KB EACH (9 MB
// for the set) because PNG stores gradients terribly. A solid fill compresses to a few
// KB — and a flat launch screen is what Apple's own apps do anyway. It also exactly
// matches `background_color` in manifest.json, so there's no seam when the app paints.
function splashHTML(w, h) {
  const crown = Math.round(Math.min(w, h) * 0.26);
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{width:${w}px;height:${h}px;overflow:hidden}
    body{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${Math.round(h * 0.035)}px;
      background:#0a0714;
      font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;}
    .crown{width:${crown}px;height:${crown}px;filter:drop-shadow(0 ${Math.round(crown * 0.06)}px ${Math.round(crown * 0.18)}px rgba(0,0,0,.55))}
    .name{font-size:${Math.round(Math.min(w, h) * 0.062)}px;font-weight:800;letter-spacing:.16em;color:#F5C518}
    .sub{font-size:${Math.round(Math.min(w, h) * 0.028)}px;letter-spacing:.08em;color:#8f7fc4}
  </style></head><body>
    <svg class="crown" viewBox="0 0 100 100" aria-hidden="true">
      <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#FFE9A8"/><stop offset=".5" stop-color="#F5C518"/><stop offset="1" stop-color="#C6960C"/>
      </linearGradient></defs>
      <path d="M14 74 L9 33 L31 55 L50 23 L69 55 L91 33 L86 74 Z" fill="url(#g)" stroke="#8a6a00" stroke-width="1" stroke-linejoin="round"/>
      <rect x="12" y="73" width="76" height="13" rx="4" fill="url(#g)" stroke="#8a6a00" stroke-width="1"/>
      <circle cx="9" cy="31" r="4.6" fill="#FFF3C8"/><circle cx="50" cy="20" r="5.6" fill="#FF6E8E"/><circle cx="91" cy="31" r="4.6" fill="#FFF3C8"/>
    </svg>
    <div class="name">PJCC</div>
    <div class="sub">McPuppy Studios</div>
  </body></html>`;
}

async function run() {
  const exe = findChrome();
  if (!exe) { console.error('No Chrome/Edge found. Install one or set CHROME_PATH.'); process.exit(2); }
  const browser = await puppeteer.launch({ executablePath: exe, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const links = [];
  let total = 0;
  try {
    for (const [w, h, dpr] of DEVICES) {
      const name = `splash-${w}x${h}@${dpr}x.png`;
      await page.setViewport({ width: w, height: h, deviceScaleFactor: dpr });
      await page.setContent(splashHTML(w, h), { waitUntil: 'load' });
      await page.screenshot({ path: path.join(OUT, name), clip: { x: 0, y: 0, width: w, height: h } });
      const kb = fs.statSync(path.join(OUT, name)).size / 1024;
      total += kb;
      console.log('  ✓ ' + name.padEnd(26) + kb.toFixed(0) + ' KB   (' + (w * dpr) + 'x' + (h * dpr) + ' real px)');
      links.push({
        href: '/assets/images/pwa/splash/' + name,
        media: `(device-width: ${w}px) and (device-height: ${h}px) and (-webkit-device-pixel-ratio: ${dpr}) and (orientation: portrait)`,
      });
    }
  } finally {
    await browser.close();
  }
  fs.writeFileSync(path.join(OUT, 'splash-links.json'), JSON.stringify(links, null, 2));
  console.log('\n' + DEVICES.length + ' launch screens, ' + total.toFixed(0) + ' KB total');
  console.log('link list -> assets/images/pwa/splash/splash-links.json (read by pwa-register.js)');
}
run().catch((e) => { console.error(e); process.exit(1); });
