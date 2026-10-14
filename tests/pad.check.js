/* A CONTROLLER A BROWSER DOES NOT KNOW — 2026-10-14.
 * His: "right now Y appears to be Use. Can you make it A?"
 *
 * His pad is a PowerA wired one for the Switch. A browser hands it over RAW, in its maker's order, and
 * assets/js/pjcc-pad.js re-orders it into the standard one before anything reads it. This drives the
 * REAL script in a real browser, around a stand-in pad shaped EXACTLY as his was read off the real
 * thing that day (see RAW below): its name, its 14 buttons, its ten axes, its dial at rest.
 * ⚠ THE STAND-IN IS PUT IN BEFORE THE SCRIPT LOADS, the way a real pad is there before any page: the
 *   script wraps what it finds, and the page then asks the way any page asks.
 * ⚠ HIS REAL PAD MAY BE PLUGGED INTO THIS PC, under the same name. The stand-in replaces what the page
 *   is given, and an event is only counted inside the one call that sends it. */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const { findChrome } = require('./harness');

const ROOT = path.join(__dirname, '..');
const PORT = 8129;
const RAW = { id: 'NSW Spectra Wired Controller (Vendor: 20d6 Product: a714)', mapping: '', buttons: 14,
  axes: [0.004, 0.004, 0.004, 0, 0, 0.004, 0, 0, 0, 3.286] };
/* raw button -> the standard place it belongs in, and what is printed on it */
const PLACE = [[0, 2, 'Y, the left one'], [1, 0, 'B, the bottom one'], [2, 1, 'A, the right one'], [3, 3, 'X, the top one'],
  [4, 4, 'L'], [5, 5, 'R'], [6, 6, 'ZL'], [7, 7, 'ZR'], [8, 8, 'Minus'], [9, 9, 'Plus'], [10, 10, 'the left stick'],
  [11, 11, 'the right stick'], [12, 16, 'Home'], [13, 17, 'Capture']];
/* the dial's eight places and at rest -> which of the four D-pad places (12 up, 13 down, 14 left, 15 right) are down */
const DIAL = [[-1, '12'], [-0.714, '12,15'], [-0.428, '15'], [-0.142, '13,15'], [0.142, '13'], [0.428, '13,14'], [0.714, '14'], [1, '12,14'],
  [3.286, ''], [0, '']];

const SOCKET = `(function () {
  var pad = null;
  navigator.getGamepads = function () { return [pad, null, null, null]; };
  window.__raw = function (id, mapping, n, axes) {
    pad = { id: id, index: 0, connected: true, mapping: mapping, timestamp: 1, axes: axes.slice(),
      buttons: Array.from({ length: n }, function () { return { pressed: false, touched: false, value: 0 }; }) };
  };
  window.__press = function (i, on) { pad.buttons[i] = { pressed: !!on, touched: !!on, value: on ? 1 : 0 }; };
  window.__axis = function (i, v) { pad.axes[i] = v; };
  window.__same = function () { return navigator.getGamepads()[0] === pad; };
  window.__fire = function (type) {
    var got = [], hear = function (e) { got.push(e.gamepad ? e.gamepad.mapping + '|' + e.gamepad.buttons.length : 'no pad'); };
    window.addEventListener(type, hear);
    var e = new Event(type); e.gamepad = pad; window.dispatchEvent(e);
    window.removeEventListener(type, hear);
    return got.join(' ; ');
  };
})();`;

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname === '/__pad.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end('<!doctype html><meta charset="utf-8"><title>pad</title><script src="/assets/js/pjcc-pad.js"></script>' +
      (url.searchParams.get('twice') ? '<script src="/assets/js/pjcc-pad.js?again"></script>' : '') + '<body>pad');
  }
  const p = path.join(ROOT, decodeURIComponent(url.pathname));
  fs.readFile(p, (e, b) => {
    if (e) { res.writeHead(404); return res.end('nope'); }
    res.writeHead(200, { 'Content-Type': p.endsWith('.js') ? 'application/javascript; charset=utf-8' : 'application/octet-stream' });
    res.end(b);
  });
});

let pass = 0, fail = 0;
const ok = (name, cond, extra) => {
  if (cond) { pass++; console.log('  ✓ PASS  ' + name + (extra ? '   [' + extra + ']' : '')); }
  else { fail++; console.log('  ✗ FAIL  ' + name + (extra ? '   [' + extra + ']' : '')); }
};

(async () => {
  console.log('\n=== A CONTROLLER A BROWSER DOES NOT KNOW ===\n');
  const built = fs.readFileSync(path.join(ROOT, 'assets', 'games', 'checker-town', 'index.html'), 'utf8');
  const at = built.indexOf('<script src="/assets/js/pjcc-pad.js"></script>'), engine = built.indexOf('<script src="index.js"></script>');
  ok('⛑ the game\'s own page loads the script, and BEFORE the engine  (the engine decides what a pad is the moment it meets it)',
     at > 0 && engine > at, at < 0 ? 'not in the built page' : 'at ' + at + ', the engine at ' + engine);

  await new Promise((r) => server.listen(PORT, r));
  const b = await puppeteer.launch({ executablePath: findChrome(), args: ['--no-sandbox'] });
  const p = await b.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e).slice(0, 140)));
  await p.evaluateOnNewDocument(SOCKET);
  const open = async (qs) => { await p.goto('http://localhost:' + PORT + '/__pad.html' + (qs || ''), { waitUntil: 'load' }); };
  const plug = (pad) => p.evaluate((r) => window.__raw(r.id, r.mapping, r.buttons, r.axes), pad);
  const seen = () => p.evaluate(() => { const g = navigator.getGamepads()[0]; return g && { id: g.id, mapping: g.mapping, n: g.buttons.length,
    down: g.buttons.map((x, i) => (x.pressed ? i : -1)).filter((i) => i >= 0).join(','), axes: [...g.axes] }; });

  /* ── his pad ── */
  await open();
  await plug(RAW);
  const rest = await seen();
  ok('his pad, as it was read off the real thing, is handed on as a STANDARD one: 18 buttons, 4 axes, nothing down at rest',
     !!rest && rest.mapping === 'standard' && rest.n === 18 && rest.axes.length === 4 && rest.down === '', rest ? rest.mapping + ' ' + rest.n + ' buttons, ' + rest.axes.length + ' axes, down: ' + (rest.down || 'none') : 'no pad');
  ok('⛑ …and its name says "Nintendo Switch layout"  (the name is what tells the game and the program that A is the RIGHT button)',
     !!rest && rest.id === RAW.id + ' (Nintendo Switch layout)', rest ? rest.id : '');
  const wrong = [];
  for (const [raw, std, name] of PLACE) {
    await p.evaluate((i) => window.__press(i, true), raw);
    const s = await seen();
    await p.evaluate((i) => window.__press(i, false), raw);
    if (!s || s.down !== String(std)) wrong.push(name + ' -> ' + (s ? s.down || 'nothing' : 'no pad') + ' (wanted ' + std + ')');
  }
  ok('⛑ every button lands in its standard place: A is the right one, B the bottom one, X the top one, Y the left one',
     wrong.length === 0, wrong.join(' · ') || PLACE.length + ' buttons');
  const dials = [];
  for (const [v, want] of DIAL) {
    await p.evaluate((x) => window.__axis(9, x), v);
    const s = await seen();
    if (!s || s.down !== want) dials.push(v + ' -> ' + (s ? s.down || 'nothing' : 'no pad') + ' (wanted ' + (want || 'nothing') + ')');
  }
  await p.evaluate(() => window.__axis(9, 3.286));
  ok('⛑ its D-pad is a dial: each of its eight places is the right D-pad buttons, and at rest (and before its first report) none',
     dials.length === 0, dials.join(' · ') || DIAL.length + ' readings');
  await p.evaluate(() => { window.__axis(0, -0.5); window.__axis(1, 0.25); window.__axis(2, 0.75); window.__axis(5, -1); });
  const sticks = await seen();
  ok('its sticks are the standard four axes  (its right stick\'s second axis is the raw fifth)',
     !!sticks && sticks.axes.join(',') === '-0.5,0.25,0.75,-1', sticks ? sticks.axes.join(',') : '');
  ok('⛑ the engine is told about the RE-ORDERED pad when it connects, once  (it decides what a pad is there and never asks again)',
     await p.evaluate(() => window.__fire('gamepadconnected')) === 'standard|18' && await p.evaluate(() => window.__fire('gamepaddisconnected')) === 'standard|18',
     await p.evaluate(() => window.__fire('gamepadconnected')));

  /* ── everything it must leave alone ── */
  await plug({ id: '20d6-a714-NSW Spectra Wired Controller', mapping: '', buttons: 14, axes: RAW.axes });
  const fox = await seen();
  ok('the same pad under the name Firefox gives it is re-ordered too', !!fox && fox.mapping === 'standard' && fox.n === 18, fox ? fox.id : '');
  await plug({ id: 'Xbox 360 Controller (XInput STANDARD GAMEPAD)', mapping: 'standard', buttons: 17, axes: [0, 0, 0, 0] });
  ok('a pad the browser already knows passes through untouched', await p.evaluate(() => window.__same()) === true);
  await plug({ id: RAW.id, mapping: 'standard', buttons: 18, axes: [0, 0, 0, 0] });
  ok('…and so would his, the day a browser learns it  (re-ordered twice, every button would be wrong again)', await p.evaluate(() => window.__same()) === true);
  await plug({ id: 'Generic USB Joystick (Vendor: 0079 Product: 0006)', mapping: '', buttons: 12, axes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 3.286] });
  ok('⚠ a raw pad it does not know passes through untouched  (guessing a layout puts every button in the wrong place)',
     await p.evaluate(() => window.__same()) === true);
  ok('…and its connection is not touched either', await p.evaluate(() => window.__fire('gamepadconnected')) === '|12', await p.evaluate(() => window.__fire('gamepadconnected')));
  await open('?twice=1');
  await plug(RAW);
  const twice = await seen();
  ok('loaded twice, it re-orders once', !!twice && twice.n === 18 && twice.id === RAW.id + ' (Nintendo Switch layout)', twice ? twice.id : '');
  ok('no script error', errs.length === 0, errs.slice(0, 2).join(' | '));

  console.log('\nRESULT: ' + (fail ? 'FAIL' : 'PASS') + ' — ' + pass + ' passed, ' + fail + ' failed');
  await b.close();
  server.close();
  process.exit(fail ? 1 : 0);
})().catch((e) => {
  console.log('  ✗ FAIL  the run stopped on an error   ' + String(e && e.message || e).slice(0, 200));
  console.log('\nRESULT: FAIL — ' + pass + ' passed, ' + (fail + 1) + ' failed (stopped early)');
  process.exit(1);
});
