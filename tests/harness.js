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
function instrumentToTemp(srcPath, marker, hookCode) {
  const s = fs.readFileSync(srcPath, 'utf8');
  const idx = s.lastIndexOf(marker);
  if (idx < 0) throw new Error('instrument marker not found in ' + srcPath + ': ' + marker);
  const out = s.slice(0, idx) + '\n' + hookCode + '\n' + s.slice(idx);
  const tmp = path.join(os.tmpdir(), 'pjcc_test_' + Date.now() + '_' + path.basename(srcPath));
  fs.writeFileSync(tmp, out);
  return tmp;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function withGame(srcPath, marker, hookCode, drive) {
  const exe = findChrome();
  if (!exe) { console.error('No Chrome/Edge found. Install one or set CHROME_PATH.'); process.exit(2); }
  const tmp = instrumentToTemp(srcPath, marker, hookCode);
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

module.exports = { withGame, report, sleep, findChrome };
