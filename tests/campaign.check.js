// ChessWild: Campaign — what the 2026-09-14 pass added: the save, the clock rules, promotions,
// fortify, the hurry button, the keyboard map and sound.   run: npm run test:campaign
// (The rules themselves live in tests/marchland.check.js.)
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { findChrome } = require('./harness');
const pp = require(path.join(ROOT, 'node_modules/puppeteer-core'));

let PASS = 0, FAIL = 0;
function ok(cond, msg) { if (cond) { PASS++; console.log('  ✓ PASS  ' + msg); } else { FAIL++; console.log('  ✗ FAIL  ' + msg); } }
const sleep = ms => new Promise(r => setTimeout(r, ms));
const GAME = '/assets/games/pjcc_marchland.html';
const MARKER = 'setSound(sndOn);\nnewCampaign(chosenLevel);';
// injected INSIDE the game's closure
const HOOK = `
var __sfx = sfx, __sounds = [];
sfx = function (k) { __sounds.push(k); return __sfx(k); };
window.__mc = {
  get G() { return G; }, get B() { return B; }, get PEND() { return PEND; }, set PEND(v) { PEND = v; },
  sounds: __sounds, tapLand: tapLand, beginBattle: beginBattle, tickClock: tickClock, posVerdict: posVerdict,
  playAI: playAI, applyMove: applyMove, autoPromo: autoPromo, pump: pump, setPhase: setPhase, drawMap: drawMap,
  newCampaign: newCampaign, campaignOver: campaignOver, show: show, paintDice: paintDice,
  setB: function (fen, playerAttacks) {
    PEND = { from: 5, to: 3, playerAttacks: playerAttacks, aRanks: 4, dRanks: 3, attWhite: true,
             dInfo: { castled: false, chain: 0 }, aArmy: [], dArmy: [] };
    B = { S: C.parseFEN(fen), sel: -1, moves: [], last: null, over: false, timer: null, running: true, attWhite: true,
          clk: { w: 15, b: 15 }, tLast: Date.now(), turnStart: 15, ids: new Array(64).fill(0), els: {}, seq: 0, mercied: false };
    hideEndcard(); show('screen-battle'); seedMen(); paint(); updateClock();
  }
};
`;
const $t = id => `document.getElementById('${id}')`;

function serve() {
  return new Promise(res => {
    const srv = http.createServer((req, rsp) => {
      const p = decodeURIComponent(req.url.split('?')[0]);
      fs.readFile(path.join(ROOT, p), (err, buf) => {
        if (err) { rsp.writeHead(404); rsp.end(); return; }
        let body = buf;
        if (p === GAME) {
          const s = buf.toString('utf8').replace(/\r\n/g, '\n'), i = s.lastIndexOf(MARKER);
          if (i < 0) { rsp.writeHead(500); rsp.end('marker missing'); return; }
          body = s.slice(0, i) + HOOK + s.slice(i);
        }
        const type = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' }[path.extname(p)] || 'application/octet-stream';
        rsp.writeHead(200, { 'Content-Type': type }); rsp.end(body);
      });
    });
    srv.listen(0, '127.0.0.1', () => res(srv));
  });
}

(async () => {
  console.log('\n=== ChessWild: Campaign — the 09-14 pass ===');
  const SRC = fs.readFileSync(path.join(ROOT, GAME.slice(1)), 'utf8').replace(/\r\n/g, '\n');
  const home = (SRC.match(/<section class="screen on" id="screen-home">[\s\S]*?<\/section>/) || [''])[0].replace(/<!--[\s\S]*?-->/g, '');
  ok(home.length > 200 && !/v\d+\.\d+/.test(home) && !/prototype/i.test(home), 'the home screen carries no version number');

  const exe = findChrome();
  if (!exe) { console.log('No Chrome/Edge found.'); process.exit(2); }
  const srv = await serve();
  const url = `http://127.0.0.1:${srv.address().port}${GAME}`;
  const browser = await pp.launch({ executablePath: exe, headless: 'new', args: ['--no-sandbox', '--mute-audio'] });
  const errs = [];
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 460, height: 760 });
    page.on('pageerror', e => errs.push(e.message));
    await page.goto(url, { waitUntil: 'load' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'load' });
    await page.waitForFunction(() => !!window.__mc);
    const E = (fn, ...a) => page.evaluate(fn, ...a);

    /* ── the arithmetic line follows the die ── */
    const maths = await E(() => { __mc.PEND = { playerAttacks: false, dArmy: ['r'], aMoved: 0, aPos: 3, dPos: 8, dInfo: { chain: 0 } };
      __mc.posVerdict(); return document.querySelector('#v-pos .maths').textContent; });
    ok(/7\+ tucks the king in, 8 brings the rook/.test(maths), 'the "numbers" line states the d8 thresholds  [' + maths.split('—')[1] + ']');

    const badge = await E(() => { const h = document.createElement('div'); __mc.paintDice(h, [8], 0, false, true, true); const att = !!h.querySelector('.castle');
      __mc.paintDice(h, [8], 0, true, true, true); return { att, def: !!h.querySelector('.castle') }; });
    ok(!badge.att && badge.def, "the castling king is drawn on the defender's position die, never the attacker's");

    /* ── fortify is one move a round ── */
    const fort = await E(() => {
      const m = __mc; m.newCampaign('medium'); const G = m.G; G.started = false;
      G.ranks[5] = 4; G.ranks[8] = 3; G.ranks[9] = 3; m.setPhase('fortify'); m.show('screen-map'); m.drawMap();
      m.tapLand(5); m.tapLand(8); const a = [G.ranks[5], G.ranks[8], G.ranks[9]];
      m.tapLand(5); m.tapLand(8); m.tapLand(9);
      return { a, b: [G.ranks[5], G.ranks[8], G.ranks[9]], done: G.fortDone };
    });
    ok(fort.a.join() === '3,4,3' && fort.b.join() === fort.a.join() && fort.done, 'stepping back after a fortify move ends it: no second move in the round  [' + fort.a + ' -> ' + fort.b + ']');

    /* ── promotions ── */
    const promo = await E(() => {
      const m = __mc;
      m.setB('8/6P1/7k/8/7K/8/8/8 w - - 0 1', true);
      const att = m.autoPromo(m.B.S, { from: 14, to: 6 }, true).promo;
      m.PEND.playerAttacks = false;
      const def = m.autoPromo(m.B.S, { from: 14, to: 6 }, true).promo;
      m.setB('8/6P1/8/8/8/k7/8/K7 w - - 0 1', true);
      const plain = m.autoPromo(m.B.S, { from: 14, to: 6 }, true).promo;
      m.setB('7K/8/8/8/8/8/1p6/k7 b - - 0 1', true); m.B.S.turn = 'b';
      m.playAI({ from: 49, to: 57, promo: 'r' });
      return { att, def, plain, machine: m.B.S.b[57] };
    });
    ok(promo.att === 'R', 'attacking, a queen that would stalemate them becomes a rook  [' + promo.att + ']');
    ok(promo.def === 'Q' && promo.plain === 'Q', '…defending, or with no stalemate in it, it is still a queen');
    ok(promo.machine === 'r', "the machine's own underpromotion is played as chosen  [" + promo.machine + ']');

    /* ── a flag against a lone king is a draw ── */
    const flag = await E(() => {
      const m = __mc, $ = id => document.getElementById(id), out = {};
      m.setB('4k3/pppp4/8/8/8/8/8/4K3 b - - 0 1', true); m.B.clk.b = 0.01; m.B.tLast = Date.now() - 50; m.tickClock();
      out.lone = { over: m.B.over, word: $('eword').textContent, line: $('eline').textContent };
      m.setB('4k3/pppp4/8/8/8/8/8/R3K3 b - - 0 1', true); m.B.clk.b = 0.01; m.B.tLast = Date.now() - 50; m.tickClock();
      out.rook = { over: m.B.over, word: $('eword').textContent };
      return out;
    });
    ok(flag.lone.over && flag.lone.word === 'DEFENDED' && /Drawn/.test(flag.lone.line), 'their flag against your lone king is a draw, and the defender holds  [' + flag.lone.word + ']');
    ok(flag.rook.over && flag.rook.word === 'TAKEN', '…while against a rook their flag loses the ground  [' + flag.rook.word + ']');

    /* ── another tab pauses the battle ── */
    const away = await E(async () => {
      const m = __mc; m.setB('4k3/8/8/8/8/8/8/R3K3 w - - 0 1', true); m.B.timer = setInterval(m.tickClock, 100);
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange'));
      const run0 = m.B.running, w0 = m.B.clk.w;
      await new Promise(r => setTimeout(r, 500)); const w1 = m.B.clk.w;
      delete document.hidden; document.dispatchEvent(new Event('visibilitychange'));
      await new Promise(r => setTimeout(r, 400)); const w2 = m.B.clk.w, run2 = m.B.running;
      clearInterval(m.B.timer); m.B.over = true;
      return { run0, w0, w1, w2, run2 };
    });
    ok(!away.run0 && away.w1 === away.w0, 'leaving the tab stops both clocks  [' + away.w0.toFixed(2) + ' -> ' + away.w1.toFixed(2) + ']');
    ok(away.run2 && away.w2 < away.w1, '…and coming back starts them again  [' + away.w2.toFixed(2) + ']');

    /* ── withdraw asks once more ── */
    const wd = await E(() => {
      const m = __mc, r = document.getElementById('resign'); m.setB('4k3/8/8/8/8/8/8/R3K3 w - - 0 1', true);
      r.click(); const armed = { over: m.B.over, label: r.textContent }; r.click();
      return { armed, over: m.B.over };
    });
    ok(!wd.armed.over && /Tap again/.test(wd.armed.label) && wd.over, 'Withdraw arms on the first tap and withdraws on the second  [' + wd.armed.label + ']');

    /* ── sound on a move, and M ── */
    const snd = await E(() => {
      const m = __mc; m.setB('4k3/8/8/8/8/8/8/R3K3 w - - 0 1', true); m.sounds.length = 0;
      m.applyMove({ from: 56, to: 48 }); const heard = m.sounds.slice();
      m.B.over = true; return heard;
    });
    ok(snd.indexOf('move') >= 0, 'a move makes a sound  [' + snd.join(',') + ']');
    await page.keyboard.press('KeyM');
    const muted = await E(() => ({ ls: localStorage.getItem('pjcc.campaign.sound'), label: document.getElementById('snd').textContent }));
    ok(muted.ls === '0' && /off/.test(muted.label), 'M mutes, the button says so, and it is remembered  [' + muted.label + ']');
    await page.keyboard.press('KeyM');

    /* ── their turn can be hurried ── */
    const hur = await E(async () => {
      const m = __mc; m.newCampaign('medium'); const G = m.G; G.started = false;
      m.show('screen-map'); m.setPhase('theirs'); G.busy = true;
      const btn = document.getElementById('endturn'), label = btn.textContent, enabled = !btn.disabled;
      G.q = [{ t: 'say', s: 'one' }, { t: 'say', s: 'two' }, { t: 'say', s: 'three' }];
      m.pump();
      await new Promise(r => setTimeout(r, 300)); const slow = G.q.length;
      btn.click();
      await new Promise(r => setTimeout(r, 450));
      return { label, enabled, slow, fast: G.q.length, phase: G.phase };
    });
    ok(hur.enabled && /hurry/.test(hur.label), 'during their turn the button offers to hurry  [' + hur.label + ']');
    ok(hur.slow === 2 && hur.fast === 0 && hur.phase === 'deploy', 'a tap runs the rest of their narration quickly  [' + hur.slow + ' left -> ' + hur.fast + ']');

    /* ── the map is keyboard-operable and keeps focus through a redraw ── */
    const kb = await E(() => {
      const m = __mc; m.newCampaign('medium'); const G = m.G; G.started = false;
      m.show('screen-map'); G.toPlace = 2; m.setPhase('deploy'); m.drawMap();
      const n = document.querySelector('.node[data-id="5"]'); n.focus();
      return { tag: n.tagName, label: n.getAttribute('aria-label'), before: G.ranks[5] };
    });
    await page.keyboard.press('Enter');
    await sleep(80);
    const kb2 = await E(() => ({ focused: document.activeElement && document.activeElement.getAttribute('data-id'), after: __mc.G.ranks[5] }));
    ok(kb.tag === 'BUTTON' && /Chess City, yours, \d+ troops/.test(kb.label), 'a holding is a button with a spoken label  [' + kb.label + ']');
    ok(kb2.after === kb.before + 1 && kb2.focused === '5', 'Enter deploys to it, and focus is still on it after the map redraws  [focus ' + kb2.focused + ']');

    /* ── save and continue ── */
    await E(() => localStorage.removeItem('pjcc.campaign.save.v1'));
    await page.reload({ waitUntil: 'load' });
    await page.waitForFunction(() => !!window.__mc);
    ok(await E(() => document.getElementById('resume').hidden), 'with no campaign in progress there is nothing to continue');
    await page.click('#go');
    await page.waitForFunction(() => document.getElementById('screen-map').classList.contains('on'));
    for (let i = 0; i < 8; i++) {
      if (!(await E(() => __mc.G.phase === 'deploy'))) break;
      await E(() => { const n = document.querySelector('.node.mine.can'); if (n) n.click(); });
      await sleep(90);
    }
    await page.waitForFunction(() => __mc.G.phase === 'attack', { timeout: 5000 });
    const saved = await E(() => JSON.parse(localStorage.getItem('pjcc.campaign.save.v1') || 'null'));
    ok(saved && saved.round === 1 && saved.phase === 'attack', 'the campaign is saved as you play  [round ' + (saved && saved.round) + ', ' + (saved && saved.phase) + ']');
    const opened = await E(() => { const m = __mc, G = m.G; G.ranks[5] = 4; G.sel = 5; m.tapLand(3); return { from: G.ranks[5], atks: G.atks }; });
    const pend = await E(() => (JSON.parse(localStorage.getItem('pjcc.campaign.save.v1')) || {}).pending);
    ok(pend && pend.from === 5 && pend.to === 3, 'a battle in flight is written down as pending');
    await page.reload({ waitUntil: 'load' });
    await page.waitForFunction(() => !!window.__mc);
    const homeState = await E(() => ({ shown: !document.getElementById('resume').hidden, text: document.getElementById('resume').textContent,
      go: document.getElementById('go').className }));
    ok(homeState.shown && /round 1/.test(homeState.text) && /ghost/.test(homeState.go), 'the home screen offers to continue it  [' + homeState.text + ']');
    await page.click('#go');
    const armed = await E(() => ({ text: document.getElementById('go').textContent, map: document.getElementById('screen-map').classList.contains('on'),
      save: !!localStorage.getItem('pjcc.campaign.save.v1') }));
    ok(/Tap again/.test(armed.text) && !armed.map && armed.save, 'one tap on Begin does not throw a campaign in progress away  [' + armed.text + ']');
    await page.click('#resume');
    const resumed = await E(() => ({ map: document.getElementById('screen-map').classList.contains('on'), from: __mc.G.ranks[5], phase: __mc.G.phase, atks: __mc.G.atks }));
    ok(resumed.map && resumed.from === 1 && (resumed.phase === 'attack' || resumed.phase === 'fortify'),
      'continuing a campaign left mid-battle counts that battle as withdrawn  [Chess City ' + opened.from + ' -> ' + resumed.from + ' troops, ' + resumed.phase + ']');
    const over = await E(() => { __mc.campaignOver(true); return { save: localStorage.getItem('pjcc.campaign.save.v1'), resume: document.getElementById('resume').hidden }; });
    ok(over.save === null && over.resume, 'a finished campaign clears its save');
  } catch (e) {
    FAIL++; console.log('  ✗ FAIL  harness threw: ' + e.message);
  } finally {
    await browser.close(); srv.close();
  }
  ok(errs.length === 0, 'no page errors' + (errs.length ? ' -> ' + errs.slice(0, 3).join(' | ') : ''));
  console.log('\nRESULT: ' + (FAIL ? 'FAIL (' + FAIL + '/' + (PASS + FAIL) + ' checks failed)' : 'PASS (' + PASS + ' checks)'));
  process.exit(FAIL ? 1 : 0);
})();
