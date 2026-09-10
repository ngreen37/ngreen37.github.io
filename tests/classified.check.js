/* tests/classified.check.js — THE ALPINE FILE ENDS WHERE IT ENDS (2026-09-10)
 * 1. No transform/filter animation may sit above the page's position:fixed layers. On body it
 *    pinned the burn wall to the PAGE: 1874px of black under the footer, countdown off-screen.
 *    ⚠ body is its own scroller here, so the void is in body.scrollHeight; the document read 88px.
 * 2. The page's <style> parses before its markup. Below it, a stalled parse painted a stock white
 *    burn button: Nate's "a little white popup" on the way in from the "i".
 * A REPRO: the layout's own body skeleton + the page + the real stylesheet; no local Jekyll.
 *   node tests/classified.check.js        (also runs inside `npm test`) */
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8').replace(/\r\n/g, '\n');
const { findChrome } = require('./harness');

let sass;
try { sass = require('sass'); }
catch (e) { console.error('dart-sass not installed. Run `npm install` first.'); process.exit(2); }

let pass = 0, fail = 0;
const check = (n, c, d) => {
  if (c) { pass++; console.log('  ✓ ' + n + (d !== undefined ? '   ' + d : '')); }
  else { fail++; console.log('  ✗ ' + n + (d !== undefined ? '   ' + d : '')); }
};
const done = () => { console.log('\n  ' + pass + ' passed, ' + fail + ' failed\n'); process.exit(fail === 0 ? 0 : 1); };

console.log('\n── THE ALPINE FILE ENDS WHERE IT ENDS ────────────────────\n');

const LIQUID_COMMENT = /\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\}/g;
const liquid = (s) => s.replace(LIQUID_COMMENT, '')
  .replace(/\{\{\s*'([^']*)'\s*\|\s*relative_url\s*\}\}/g, '$1')
  .replace(/\{%[\s\S]*?%\}/g, '')
  .replace(/\{\{[\s\S]*?\}\}/g, '');
const page = read('classified.md').replace(/^---[\s\S]*?\n---\s*/, '');

const firstTag = (liquid(page).replace(/<!--[\s\S]*?-->/g, '').match(/<([a-z][a-z0-9-]*)/i) || [])[1];
check('⛑ the page <style> parses before any of its markup', firstTag === 'style', 'first tag: <' + firstTag + '>');

(async () => {
  const exe = findChrome();
  if (!exe) { console.log('\n  (no Chrome found — skipping the browser half)'); done(); }
  const siteCss = sass.compileString(
    read('assets/css/style.scss').replace(/^---[\s\S]*?\n---\s*/, ''),
    { loadPaths: [path.join(ROOT, '_sass')], style: 'expanded', silenceDeprecations: ['import'] }).css;
  const layout = read('_layouts/easter-eggs.html');
  const skeleton = liquid(layout.slice(layout.search(/<body[^>]*>/), layout.indexOf('{{ content }}')));
  const tmp = path.join(os.tmpdir(), 'pjcc_classified_' + Date.now() + '.html');
  fs.writeFileSync(tmp, '<!doctype html><html><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
    '<style>' + siteCss + '</style></head>' + skeleton + liquid(page) + '</main></body></html>');

  const puppeteer = require('puppeteer-core');
  const browser = await puppeteer.launch({ executablePath: exe, headless: 'new', args: ['--no-sandbox', '--mute-audio'] });
  const p = await browser.newPage();
  await p.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
  await p.goto('file:///' + tmp.split(path.sep).join('/'), { waitUntil: 'load' });
  const m = await p.evaluate(() => {
    const wall = document.getElementById('burn-overlay');
    const lines = document.querySelector('.classified-scanlines');
    const foot = document.querySelector('.secret-footer');
    if (!wall || !lines || !foot) return null;
    const b = document.body;
    return { vh: innerHeight,
      wallH: Math.round(wall.getBoundingClientRect().height),
      linesH: Math.round(lines.getBoundingClientRect().height),
      bodyVoid: b.scrollHeight - b.clientHeight,
      docVoid: Math.round(document.scrollingElement.scrollHeight - (foot.getBoundingClientRect().bottom + scrollY)) };
  });
  await browser.close();
  fs.unlinkSync(tmp);

  check('the repro has its burn wall, scanlines and footer', !!m,
    m ? undefined : '#burn-overlay, .classified-scanlines or .secret-footer is missing');
  if (m) {
    check('⛑ the burn wall is pinned to the WINDOW, not the page', m.wallH === m.vh,
      m.wallH + 'px tall in a ' + m.vh + 'px window');
    check('⛑ so are the layout\'s scanlines (all five easter-egg pages)', m.linesH === m.vh,
      m.linesH + 'px tall in a ' + m.vh + 'px window');
    check('⛑ nothing scrolls on past the footer', m.bodyVoid <= 1 && m.docVoid <= 120,
      'body scrolls ' + m.bodyVoid + 'px · document ends ' + m.docVoid + 'px under the footer (its padding is 88)');
  }
  done();
})().catch((e) => { console.error(e); process.exit(1); });
