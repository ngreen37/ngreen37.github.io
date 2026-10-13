// Shared regression-test harness for the PJCC canvas games.
// Drives the REAL game in headless Chrome (via puppeteer-core, pointed at your
// installed browser) and lets a per-game script assert on live game state.
//
// It never touches the shipped game files: it writes a throwaway INSTRUMENTED copy
// (the original + a tiny window hook that exposes internal state) to the OS temp dir,
// loads it via file://, runs the checks, then deletes it.
//
// Requires: npm install   (installs puppeteer-core)   +   Chrome or Edge installed.
// Override the browser with:  CHROME_PATH=/path/to/chrome  node tests/skyrun.check.js

const fs = require('fs');
const os = require('os');
const path = require('path');

let puppeteer;
try { puppeteer = require('puppeteer-core'); }
catch (e) { console.error('puppeteer-core not installed. Run `npm install` first.'); process.exit(2); }

function findChrome() {
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
  const candidates = [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ];
  return candidates.find(p => fs.existsSync(p)) || null;
}

// Inject `hookCode` just before the LAST occurrence of `marker` (the end of the game's
// inline script), so the hook shares scope with the game's state + functions.
// opts.rewriteAssets (opt-in): rewrite absolute `src="/assets/…"` to file:// paths so a
// game that pulls REAL shared modules (e.g. the chess engine) can load them under file://.
// Off by default — games that stub their renderer instead must not have their 404s "fixed".
function instrumentToTemp(srcPath, marker, hookCode, opts) {
  opts = opts || {};
  let s = fs.readFileSync(srcPath, 'utf8');
  if (opts.rewriteAssets) {
    const root = srcPath.split(/[\\/]assets[\\/]/)[0].replace(/\\/g, '/');
    s = s.replace(/src="\/assets\//g, 'src="file:///' + root + '/assets/');
  }
  const idx = s.lastIndexOf(marker);
  if (idx < 0) throw new Error('instrument marker not found in ' + srcPath + ': ' + marker);
  const out = s.slice(0, idx) + '\n' + hookCode + '\n' + s.slice(idx);
  const tmp = path.join(os.tmpdir(), 'pjcc_test_' + Date.now() + '_' + path.basename(srcPath));
  fs.writeFileSync(tmp, out);
  return tmp;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function withGame(srcPath, marker, hookCode, drive, opts) {
  const exe = findChrome();
  if (!exe) { console.error('No Chrome/Edge found. Install one or set CHROME_PATH.'); process.exit(2); }
  const tmp = instrumentToTemp(srcPath, marker, hookCode, opts);
  const results = [];
  const errors = [];
  const ok = (cond, msg) => results.push({ pass: !!cond, msg });
  const browser = await puppeteer.launch({ executablePath: exe, headless: 'new', args: ['--no-sandbox', '--mute-audio'] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 480, height: 820 });
    // Only real JS exceptions fail the run. (Resource 404s under file:// — e.g. the
    // absolute /assets/* refs or favicon — are console errors, not pageerrors, and are ignored.)
    page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
    await page.goto('file://' + tmp.replace(/\\/g, '/'), { waitUntil: 'load', timeout: 15000 });
    await drive(page, ok, sleep);
  } catch (e) {
    errors.push('HARNESS THREW: ' + e.message);
  } finally {
    await browser.close();
    try { fs.unlinkSync(tmp); } catch (e) {}
  }
  return { results, errors };
}

function report(name, results, errors) {
  console.log('\n=== ' + name + ' ===');
  let fails = 0;
  for (const r of results) { console.log((r.pass ? '  ✓ PASS  ' : '  ✗ FAIL  ') + r.msg); if (!r.pass) fails++; }
  if (errors.length) { console.log('  runtime errors:'); errors.forEach(e => console.log('    - ' + e)); }
  const pass = fails === 0 && errors.length === 0;
  console.log(pass
    ? '\nRESULT: PASS (' + results.length + ' checks, 0 runtime errors)\n'
    : '\nRESULT: FAIL (' + fails + '/' + results.length + ' checks failed, ' + errors.length + ' runtime errors)\n');
  return pass;
}

/* Which army stands on the two rows nearest the player, READ OFF A BOARD CANVAS'S PIXELS.
   ⚠ The page is never asked which way it thinks it is facing: a board that says "flipped" and
   draws White below must fail. Counts pixels of each army's fill color in the top and bottom
   quarters; an early-game position (both armies mostly at home) is what makes it decisive. */
function bottomSide(page, sel) {
  return page.evaluate((sel) => {
    const cv = document.querySelector(sel);
    if (!cv || !cv.width) return { side: '?', why: 'no canvas at ' + sel };
    const rgb = (token, fallback) => {
      const probe = document.createElement('i');
      probe.style.color = 'var(' + token + ', ' + fallback + ')';
      document.body.appendChild(probe);
      const m = getComputedStyle(probe).color.match(/[\d.]+/g).map(Number);
      probe.remove();
      return m;
    };
    const W = rgb('--piece-w-fill', '#fff'), B = rgb('--piece-b-fill', '#4a3585');
    const near = (d, i, c, tol) => Math.abs(d[i] - c[0]) < tol && Math.abs(d[i + 1] - c[1]) < tol && Math.abs(d[i + 2] - c[2]) < tol;
    const count = (y0, y1) => {
      const d = cv.getContext('2d').getImageData(0, y0, cv.width, y1 - y0).data;
      let w = 0, b = 0;
      for (let i = 0; i < d.length; i += 4) { if (near(d, i, W, 12)) w++; else if (near(d, i, B, 24)) b++; }
      return { w, b };
    };
    const q = Math.floor(cv.height / 4), top = count(0, q), bot = count(cv.height - q, cv.height);
    const side = (bot.w > 4 * top.w && top.b > 4 * bot.b) ? 'w'
               : (top.w > 4 * bot.w && bot.b > 4 * top.b) ? 'b' : '?';
    return { side, top, bot };
  }, sel);
}

/* How much of each army's color is drawn in ONE square of a board canvas, (file, row) from the top
   left AS DRAWN. ⚠ bottomSide cannot see a board turned top-for-bottom but not left-for-right: both
   armies are on the right rows and the king and queen have swapped sides. One named piece can. */
function inkAt(page, sel, file, row) {
  return page.evaluate((sel, file, row) => {
    const cv = document.querySelector(sel);
    if (!cv || !cv.width) return { w: -1, b: -1 };
    const rgb = (token, fallback) => {
      const probe = document.createElement('i');
      probe.style.color = 'var(' + token + ', ' + fallback + ')';
      document.body.appendChild(probe);
      const m = getComputedStyle(probe).color.match(/[\d.]+/g).map(Number);
      probe.remove();
      return m;
    };
    const W = rgb('--piece-w-fill', '#fff'), B = rgb('--piece-b-fill', '#4a3585');
    const near = (d, i, c, tol) => Math.abs(d[i] - c[0]) < tol && Math.abs(d[i + 1] - c[1]) < tol && Math.abs(d[i + 2] - c[2]) < tol;
    const t = cv.width / 8;
    const d = cv.getContext('2d').getImageData(Math.round(file * t), Math.round(row * t), Math.round(t), Math.round(t)).data;
    let w = 0, b = 0;
    for (let i = 0; i < d.length; i += 4) { if (near(d, i, W, 12)) w++; else if (near(d, i, B, 24)) b++; }
    return { w, b };
  }, sel, file, row);
}

module.exports = { withGame, report, sleep, findChrome, bottomSide, inkAt };
