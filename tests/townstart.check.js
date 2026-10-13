/* FROM CHECKER TOWN, A GAME STARTS — 2026-10-12.
 * His: "Sky Run in Checker Town, Princess Dungeon, etc, should just go right to the game and not the
 * title screen. It should feel less like a website and more like a game."
 *
 * The town stamps from=town on every door. A game marks its way in with data-town-start, and the
 * game layout's own script (the tag with id="town-start") presses it once. This drives the REAL
 * script, lifted out of _layouts/game.html, around each REAL game, in a real browser:
 *   from the town  -> the title screen is gone
 *   from the site  -> the title screen is still there
 * ⛑ AND IT IS HEARD. A browser keeps a page silent until a person presses something, and a game wakes its
 *   sound from its own Start: pressed by a script, three games were silent all game. That part runs in a
 *   SECOND browser with the browser's real rule on, and reads every state without a user gesture.
 * ⚠ "GONE" IS READ OFF THE PAGE (the marked button no longer has a box), never asked of the game.
 * There is no Jekyll here, so the cabinet page is rebuilt round the game the way the layout does. */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const { findChrome } = require('./harness');

const ROOT = path.join(__dirname, '..');
const PORT = 8123;
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.wasm': 'application/wasm',
               '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
               '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.woff2': 'font/woff2' };

/* The games the town opens that have a title screen, and what the town presses on it.
   The third column: it makes its sound context AT Start (measured), so a script's press leaves it asleep. */
const GAMES = [
  ['pjcc_sky_run.html', 'Sky Run', true],
  ['pjcc_princess_dungeon.html', 'Princess Dungeon', false],
  ['pjcc_sandmine.html', 'Sand Mine Depths', true],
  ['pjcc_tower_defense.html', 'Siege on Chess City', false],
  ['pjcc_marchland.html', 'ChessWild: Campaign', true],
  ['pjcc_chess_city.html', 'Chess City', false],
  ['notation_run.html', 'Notation Blitz', true],
  ['pjcc_gauntlet.html', 'The Gauntlet', false],
  ['pjcc_fork.html', 'Fork in the Road', true],
];
/* Rooms with no title screen to skip: the room IS what opens. Marking one would press something. */
const ROOMS = ['pjcc_shogi.html', 'pjcc_reading_room.html'];

const layout = fs.readFileSync(path.join(ROOT, '_layouts', 'game.html'), 'utf8');
const tag = /<script id="town-start">([\s\S]*?)<\/script>/.exec(layout);

const FAKE = '<!doctype html><meta charset="utf-8"><body>' +
  '<button id="a1" data-town-start="1" hidden>Continue</button><button id="a2" data-town-start="1">Begin</button>' +
  '<button id="b1" data-town-start="2" style="display:none">Start</button><button id="plain">Daily</button>' +
  /* ⚠ b1 ANSWERS ONLY TO THE FINGER GOING DOWN, like Notation Blitz's splash: a bare click never reaches it. */
  '<script>var log=[];["a1","a2","b1","plain"].forEach(function(id){document.getElementById(id)[id==="b1"?"onpointerdown":"onclick"]=function(){log.push(id);' +
  'if(id==="a1"||id==="a2"){try{window.snd=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}document.getElementById("a1").hidden=true;document.getElementById("a2").hidden=true;' +
  'setTimeout(function(){document.getElementById("b1").style.display=""},300)}' +
  'if(id==="b1")document.getElementById("b1").style.display="none"}});' +
  'if(/saved=1/.test(location.search))document.getElementById("a1").hidden=false;</script>';

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname === '/__ts.html') {
    const src = url.searchParams.get('fake') ? '/__fake.html' + (url.searchParams.get('saved') ? '?saved=1' : '')
      : '/assets/games/' + url.searchParams.get('game');
    res.writeHead(200, { 'Content-Type': MIME['.html'] });
    return res.end('<!doctype html><meta charset="utf-8"><body style="margin:0;background:#111">' +
      '<div class="game-frame-wrap"><iframe src="' + src + '" style="width:480px;height:760px;border:0"></iframe></div>' +
      '<script>' + (tag ? tag[1] : '') + '</script>');
  }
  if (url.pathname === '/__fake.html') { res.writeHead(200, { 'Content-Type': MIME['.html'] }); return res.end(FAKE); }
  const p = path.join(ROOT, decodeURIComponent(url.pathname));
  fs.readFile(p, (e, b) => {
    if (e) { res.writeHead(404); return res.end('nope'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
    res.end(b);
  });
});

let pass = 0, fail = 0;
const ok = (name, cond, extra) => {
  if (cond) { pass++; console.log('  ✓ PASS  ' + name + (extra ? '   [' + extra + ']' : '')); }
  else { fail++; console.log('  ✗ FAIL  ' + name + (extra ? '   [' + extra + ']' : '')); }
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  console.log('\n=== FROM CHECKER TOWN, A GAME STARTS ===\n');
  ok('the game layout carries the script that presses Start', !!tag && /from=town/.test(tag[1]) && /data-town-start/.test(tag[1]));
  if (!tag) { console.log('\nRESULT: FAIL — ' + pass + ' passed, ' + (fail) + ' failed'); process.exit(1); }
  await new Promise((r) => server.listen(PORT, r));
  const b = await puppeteer.launch({ executablePath: findChrome(), args: ['--no-sandbox', '--mute-audio', '--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage();
  await p.setViewport({ width: 900, height: 820 });
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e).slice(0, 140)));

  /* what the marked buttons look like from outside: [group, has a box] in page order */
  const marked = () => p.evaluate(() => {
    const d = document.querySelector('iframe').contentDocument;
    if (!d) return null;
    return [...d.querySelectorAll('[data-town-start]')].map((e) => [e.getAttribute('data-town-start') || '1', e.getClientRects().length > 0 && !e.hidden]);
  });
  const settle = async (ms) => {            // until no marked button has a box, or the time is up
    const t0 = Date.now();
    let m = null;
    while (Date.now() - t0 < ms) {
      m = await marked().catch(() => null);
      if (m && m.length && m.every((x) => !x[1]) && Date.now() - t0 > 1500) return m;
      await sleep(200);
    }
    return m;
  };

  /* ── the rule itself, on a page built to try it ── */
  const fakeLog = async (qs) => {
    await p.goto('http://localhost:' + PORT + '/__ts.html?fake=1' + qs, { waitUntil: 'load' });
    await sleep(2600);
    return p.evaluate(() => document.querySelector('iframe').contentWindow.log.join(' '));
  };
  ok('from the town: the first one SHOWING in a group is pressed, then the next group, and nothing unmarked',
     (await fakeLog('&from=town')) === 'a2 b1', await fakeLog('&from=town'));
  ok('⛑ with a game saved, Continue is pressed and Begin never is',
     (await fakeLog('&saved=1&from=town')) === 'a1 b1', await fakeLog('&saved=1&from=town'));
  ok('from the site: nothing is pressed at all', (await fakeLog('')) === '', await fakeLog(''));
  ok('…and "from=town" has to be the whole word', (await fakeLog('&from=township')) === '', await fakeLog('&from=township'));

  /* ── every game the town opens that has a title screen ── */
  for (const [file, name] of GAMES) {
    const src = fs.readFileSync(path.join(ROOT, 'assets', 'games', file), 'utf8');
    const n = (src.match(/data-town-start/g) || []).length;
    await p.goto('http://localhost:' + PORT + '/__ts.html?game=' + file, { waitUntil: 'load' });
    await sleep(3200);
    const site = await marked();
    ok(name + ': from the site the title screen stands', !!site && site.length > 0 && site.some((x) => x[1]),
       site ? site.map((x) => x[0] + (x[1] ? ':showing' : ':hidden')).join(' ') : 'no game');
    await p.goto('http://localhost:' + PORT + '/__ts.html?game=' + file + '&from=town', { waitUntil: 'load' });
    const town = await settle(12000);
    ok('⛑ ' + name + ': from the town it is past its title screen',
       n > 0 && !!town && town.length > 0 && town.every((x) => !x[1]),
       town ? town.map((x) => x[0] + (x[1] ? ':STILL SHOWING' : ':gone')).join(' ') : 'no game');
  }
  ok('no script error in any of them', errs.length === 0, errs.slice(0, 3).join(' | '));

  for (const file of ROOMS) {
    const src = fs.readFileSync(path.join(ROOT, 'assets', 'games', file), 'utf8');
    ok(file.replace(/^pjcc_|\.html$/g, '') + ': a room with no title screen marks nothing', !/data-town-start/.test(src));
  }
  const camp = fs.readFileSync(path.join(ROOT, 'assets', 'games', 'pjcc_marchland.html'), 'utf8');
  ok('⚠ Campaign: Continue and Begin are ONE group, Continue first',
     /id="resume" data-town-start="1" hidden>[\s\S]{0,80}id="go" data-town-start="1">/.test(camp));
  await b.close();

  /* ── AND IT IS HEARD ──────────────────────────────────────────────────────────────────────
     ⚠ THE BROWSER'S REAL RULE, where the run above switches it off: with it off every one of these passes
       whatever the layout does.
     ⚠ NO page.evaluate IN THIS PART: puppeteer's counts as a person pressing, which is the thing measured.
       Every read goes down the debugger with userGesture false; the presses are a real click and real keys.
     ⚠ THE TEST KEEPS ITS OWN LIST of the sound contexts a game makes, and asks the BROWSER their state. */
  console.log('\n=== …AND IT IS HEARD ===\n');
  const WATCH = '(function(){var made=window.__snd=[];["AudioContext","webkitAudioContext"].forEach(function(k){var R=window[k];if(!R||R.__w)return;' +
    'var W=function(o){var c=o===undefined?new R():new R(o);made.push(c);return c};W.prototype=R.prototype;W.__w=1;try{window[k]=W}catch(e){}})})();';
  const b2 = await puppeteer.launch({ executablePath: findChrome(), args: ['--no-sandbox', '--mute-audio', '--autoplay-policy=document-user-activation-required'] });
  const heard = async (qs, keys) => {
    const pg = await b2.newPage();
    await pg.setViewport({ width: 900, height: 820 });
    await pg.evaluateOnNewDocument(WATCH);
    const cdp = await pg.target().createCDPSession();
    const states = async () => {
      const r = await cdp.send('Runtime.evaluate', { userGesture: false, returnByValue: true, expression:
        '(function(){try{return (document.querySelector("iframe").contentWindow.__snd||[]).map(function(c){return c.state}).join(",")}catch(e){return "ERR "+e.message}})()' });
      return r.result.value;
    };
    await pg.goto('http://localhost:' + PORT + '/__ts.html?' + qs, { waitUntil: 'load' });
    await sleep(keys ? 6500 : 2600);
    const before = await states();
    await pg.mouse.click(240, 430);                       // the middle of the cabinet
    if (keys) for (const k of ['ArrowRight', 'Space', 'ArrowUp']) { await sleep(200); await pg.keyboard.press(k); }
    await sleep(1500);
    const after = await states();
    /* then the game quiets ITSELF (a pause), and somebody presses again */
    let quieted = '', later = '';
    if (!keys) {
      await cdp.send('Runtime.evaluate', { userGesture: false, expression: 'document.querySelector("iframe").contentWindow.__snd.forEach(function(c){c.suspend()})' });
      await sleep(500);
      quieted = await states();
      await pg.mouse.click(240, 430);
      await sleep(1200);
      later = await states();
    }
    await pg.close();
    return { before, after, quieted, later };
  };
  const fake = await heard('fake=1&from=town', false);
  ok('the browser this part runs in keeps a script-started game silent  (or nothing below is a test)', fake.before === 'suspended', 'sound ' + (fake.before || 'never made'));
  ok('⛑ started from the town, a game\'s sound wakes on the first real press', fake.after === 'running', 'sound ' + (fake.after || 'never made'));
  ok('…and a game that quiets itself afterward is left alone: the next press does not wake it',
     fake.quieted === 'suspended' && fake.later === 'suspended', 'quieted: ' + (fake.quieted || 'none') + ' · after the next press: ' + (fake.later || 'none'));
  for (const [file, name, atStart] of GAMES) {
    const h = await heard('game=' + file + '&from=town', true);
    const all = h.after ? h.after.split(',') : [], was = h.before ? h.before.split(',') : [];
    /* ⚠ ASLEEP FIRST, OR THE PRESS PROVED NOTHING: a game that made its sound awake was never the case. */
    ok('⛑ ' + name + ': from the town, ' + (atStart ? 'its sound is awake after a real press' : 'no sound of its is left asleep'),
       (atStart ? was.length > 0 && was.every((x) => x === 'suspended') : true) && all.length >= was.length && all.every((x) => x === 'running'),
       'before a press: ' + (h.before || 'none') + ' · after: ' + (h.after || 'none'));
  }
  await b2.close();

  console.log('\nRESULT: ' + (fail ? 'FAIL' : 'PASS') + ' — ' + pass + ' passed, ' + fail + ' failed');
  server.close();
  process.exit(fail ? 1 : 0);
})().catch((e) => {
  console.log('  ✗ FAIL  the run stopped on an error   ' + String(e && e.message || e).slice(0, 200));
  console.log('\nRESULT: FAIL — ' + pass + ' passed, ' + (fail + 1) + ' failed (stopped early)');
  process.exit(1);
});
