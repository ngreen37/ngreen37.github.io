// ChessWild: Campaign — what the 2026-09-14 pass added: the save, the clock rules, promotions,
// fortify, the hurry button, the keyboard map and sound. 09-15: fog + scouting, the Daily,
// two players on one device.   run: npm run test:campaign
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
  fogged: fogged, dailyStart: dailyStart, startYourTurn: startYourTurn, startBattle: startBattle, goLive: goLive,
  finishRoll: finishRoll, nbrs: nbrs, playCard: playCard, drawCard: drawCard, resetTurn: resetTurn, rivalPlan: rivalPlan,
  resumeCampaign: resumeCampaign, paintPreview: paintPreview,
  reboard: function (fen) { B.S = C.parseFEN(fen); B.turnStart = B.clk[B.S.turn]; seedMen(); paint(); updateClock(); },
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
    // cards off unless a check turns them on: a random card would move the plain-rules checks
    await page.evaluate(() => { localStorage.clear(); localStorage.setItem('pjcc.campaign.cards', '0'); });
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

    /* ── fog + scouting ── */
    const fog = await E(() => {
      const m = __mc; m.newCampaign('medium'); const G = m.G; G.started = false;
      const disc = id => document.querySelector('.node[data-id="' + id + '"] .disc').textContent;
      m.show('screen-map'); m.setPhase('deploy'); m.drawMap();
      const out = { fork: m.fogged(1), town: m.fogged(3), own: m.fogged(5), forkDisc: disc(1), townDisc: disc(3),
        label: document.querySelector('.node[data-id="1"]').getAttribute('aria-label') };
      G.toPlace = 0; m.setPhase('attack'); m.drawMap();
      m.tapLand(1); m.tapLand(5); m.tapLand(1); out.stray = { atks: G.atks, fog: m.fogged(1) };
      m.tapLand(1); out.paid = { atks: G.atks, fog: m.fogged(1), disc: disc(1), cls: document.querySelector('.node[data-id="1"]').className };
      m.startYourTurn(); out.next = m.fogged(1);
      return out;
    });
    ok(fog.fork && !fog.town && !fog.own && fog.forkDisc === '?' && /^\d+$/.test(fog.townDisc) && /troops unknown/.test(fog.label),
      'fog: a holding with no border of yours shows ?, a bordering one shows its troops  [Fork ' + fog.forkDisc + ', Checker Town ' + fog.townDisc + ']');
    ok(fog.stray.atks === 3 && fog.stray.fog, 'a scout is not paid on one tap, nor on a tap that another tap interrupted');
    ok(fog.paid.atks === 2 && !fog.paid.fog && /^\d+$/.test(fog.paid.disc) && !/\bfog\b/.test(fog.paid.cls),
      'the second tap spends an attack and shows the count  [' + fog.paid.disc + ' troops, ' + fog.paid.atks + ' attacks left]');
    ok(fog.next, '…and the fog closes again on your next turn');

    const hidden = await E(async () => {
      const m = __mc; m.newCampaign('medium'); const G = m.G; G.started = false;
      m.show('screen-map'); m.setPhase('theirs'); G.busy = true; G.hurry = true;
      const said = () => document.getElementById('map-say').textContent;
      G.q = [{ t: 'deploy', id: 1 }, { t: 'deploy', id: 3 }];
      m.pump(); const a = { say: said(), flash: G.flash };
      await new Promise(r => setTimeout(r, 200)); const b = { say: said(), flash: G.flash };
      await new Promise(r => setTimeout(r, 250));
      return { a, b };
    });
    ok(!/Fork/.test(hidden.a.say) && hidden.a.flash === -1, 'their deploy into the fog is not named or flashed  ["' + hidden.a.say + '"]');
    ok(/Checker Town/.test(hidden.b.say) && hidden.b.flash === 3, '…while a deploy you can see still is  ["' + hidden.b.say + '"]');

    /* ── the Daily ── */
    const daily = await E(() => {
      const m = __mc, C = window.PJCCChess;
      const a = m.dailyStart('2026-09-15'), b = m.dailyStart('2026-09-15'), c = m.dailyStart('2026-09-16');
      const count = (s, side) => s.own.filter(x => x === side).length;
      const shape = (s, side) => s.ranks.filter((_, i) => s.own[i] === side).sort().join('');
      function battle(round, stack) {
        m.newCampaign('hard', 'daily'); const G = m.G; G.started = false; G.day = '2026-09-15'; G.round = round;
        G.own = a.own.slice(); G.ranks = a.ranks.slice();
        let from = -1, to = -1;
        for (let i = 0; i < 10 && from < 0; i++) if (G.own[i] === 'm') {
          const t = m.nbrs(i).filter(j => G.own[j] === 't')[0]; if (t != null) { from = i; to = t; }
        }
        G.ranks[from] = stack;
        m.beginBattle(from, to, true); const P = m.PEND;
        return { diff: G.diff, pools: [P.aMatPool, P.aPosPool, P.dMatPool, P.dPosPool], armies: [P.aArmy, P.dArmy], board: P.board.join('') };
      }
      const x = battle(1, 4), y = battle(1, 4), z = battle(2, 4), big = battle(1, 8);
      return { same: JSON.stringify(a) === JSON.stringify(b), differs: JSON.stringify(a) !== JSON.stringify(c),
        counts: [count(a, 'm'), count(a, 't')], shapes: [shape(a, 'm'), shape(a, 't')],
        diff: x.diff, repeat: JSON.stringify(x) === JSON.stringify(y), round2: JSON.stringify(x.pools) !== JSON.stringify(z.pools),
        stacked: x.pools[0].every((v, i) => big.pools[0][i] === v) && big.pools[0].length > x.pools[0].length,
        defSame: JSON.stringify(x.pools[2]) === JSON.stringify(big.pools[2]) };
    });
    await E(() => { document.getElementById('screen-roll').click(); });
    ok(daily.same && daily.differs, "the Daily's start is the same all day and different the next");
    ok(daily.counts.join() === '5,5' && daily.shapes[0] === '23334' && daily.shapes[1] === '23334',
      '…five holdings a side in the 4-3-3-3-2 shape  [' + daily.shapes.join(' vs ') + ']');
    ok(daily.diff === 'hard', '…at the difficulty you picked  [' + daily.diff + ']');
    ok(daily.repeat && daily.round2, 'the same attack on the same round rolls the same dice, musters the same armies and builds the same board; another round does not');
    ok(daily.stacked && daily.defSame, "…and a bigger stack adds dice on top of the same ones, without moving the defender's");

    const dend = await E(() => {
      const m = __mc, $ = id => document.getElementById(id);
      localStorage.removeItem('pjcc.campaign.daily.v2');
      m.newCampaign('medium', 'daily'); m.G.started = true; m.G.round = 2; m.startYourTurn();
      const mid = { round: m.G.round, map: $('screen-map').classList.contains('on') };
      m.startYourTurn();
      const end = { result: $('screen-result').classList.contains('on'), verdict: $('verdict').textContent, share: !$('share').hidden,
        text: $('share').dataset.text, save: localStorage.getItem('pjcc.campaign.save.daily.v1'),
        rec: JSON.parse(localStorage.getItem('pjcc.campaign.daily.v2') || 'null'), day: m.G.day };
      m.newCampaign('medium', 'daily'); m.G.round = 3; m.startYourTurn();
      const replay = $('share').dataset.text;
      m.newCampaign('medium'); m.G.own = m.G.own.map(() => 'm'); m.campaignOver(true);
      return { mid, end, replay, soloShare: !$('share').hidden };
    });
    ok(dend.mid.round === 3 && dend.mid.map, 'the Daily plays round 3');
    ok(dend.end.result && /^DAILY \d+\/\d+ · \d+ OF 10$/.test(dend.end.verdict) && dend.end.save === null,
      '…and ends after it, with the save cleared  [' + dend.end.verdict + ']');
    ok(dend.end.share && dend.end.rec && dend.end.rec.day === dend.end.day && dend.end.rec.runs['medium-nocards'] && /· Medium · no cards ·/.test(dend.end.text) && !/replay/.test(dend.end.text),
      '…a result you can copy, filed under its settings for today  [' + dend.end.text + ']');
    ok(/· replay$/.test(dend.replay) && dend.soloShare === false, '…a second finish the same day says replay, and a solo ending offers no copy');
    const dlabel = await E(() => { __mc.show('screen-home'); return document.getElementById('daily').textContent; });
    ok(/^Daily · best \d+\/10$/.test(dlabel), "the home screen's Daily button carries today's best  [" + dlabel + ']');

    /* ── two players ── */
    const two = await E(() => {
      const m = __mc, $ = id => document.getElementById(id), G0 = () => m.G;
      localStorage.removeItem('pjcc.campaign.save.two.v1');
      $('two').click(); const G = G0();
      const out = { labels: $('l-mine').textContent + '/' + $('l-theirs').textContent, say: $('map-say').textContent };
      G.toPlace = 0; m.setPhase('fortify'); $('endturn').click();
      out.pass = { on: $('screen-pass').classList.contains('on'), who: $('pass-who').textContent, side: G.side, round: G.round, phase: G.phase };
      $('pass-go').click();
      out.red = { map: $('screen-map').classList.contains('on'), red: $('screen-map').classList.contains('red-turn'), say: $('map-say').textContent };
      const g5 = G.ranks[5], r3 = G.ranks[3]; G.toPlace = 2; m.setPhase('deploy');
      m.tapLand(5); m.tapLand(3);
      out.deploy = [G.ranks[5] - g5, G.ranks[3] - r3];
      out.fog = { shogi: m.fogged(7), flats: m.fogged(8), label: document.querySelector('.node[data-id="3"]').getAttribute('aria-label') };
      G.toPlace = 0; m.setPhase('attack'); m.tapLand(3);
      out.hot = { links: document.querySelectorAll('#links .link.hot').length, chain: $('t-chain').className };
      G.sel = -1;
      G.toPlace = 0; m.setPhase('fortify'); $('endturn').click();
      out.back = { side: G.side, round: G.round };
      return out;
    });
    ok(two.labels === 'Green/Red' && /^Green/.test(two.say), 'two players: the map names Green and Red  [' + two.say + ']');
    ok(two.pass.on && /RED/.test(two.pass.who) && two.pass.side === 't' && two.pass.round === 1 && two.pass.phase === 'deploy',
      "ending Green's turn raises a curtain for Red before the map  [" + two.pass.who + ']');
    ok(two.red.map && two.red.red && /^Red/.test(two.red.say), "…and behind it is Red's map, in Red's color");
    ok(two.deploy.join() === '0,1', "Red deploys on Red's ground and not on Green's  [" + two.deploy + ']');
    ok(two.fog.shogi && !two.fog.flats && /Red/.test(two.fog.label), "the fog is Red's: Shogi Island is hidden, Endgame Flats is not");
    ok(two.hot.links === 2 && two.hot.chain === 't', "Red's attack lines point at Green, and Red's counts wear red  [" + two.hot.links + ' lines from Checker Town]');
    ok(two.back.side === 'm' && two.back.round === 2, "Red's turn ending starts round 2 for Green");

    const tb = await E(async () => {
      const m = __mc, $ = id => document.getElementById(id), sq = i => $('sqs').children[i];
      m.newCampaign('medium', 'two'); const G = m.G; G.started = false; G.ranks[5] = 4; m.setPhase('attack');
      m.setB('4k3/8/8/8/8/8/8/R3K3 w - - 0 1', true); m.applyMove({ from: 56, to: 48 });   // leaves a machine reply pending from another battle
      m.beginBattle(5, 3, true);
      const roll = { title: $('roll-title').textContent, att: $('att-label').textContent, def: $('def-label').textContent };
      m.finishRoll(); m.startBattle();
      m.reboard('4k3/pppp4/8/8/8/8/PPPP4/4K3 w - - 0 1'); m.goLive();
      const lab = { mat: $('mat').textContent, aura: $('mc-aura-me').style.getPropertyValue('--aura') };
      sq(51).click(); sq(43).click();
      const afterW = m.B.S.turn;
      await new Promise(r => setTimeout(r, 1900));
      const machine = m.B.S.turn;
      sq(11).click(); sq(19).click();
      const afterB = { turn: m.B.S.turn, d6: m.B.S.b[19] };
      sq(50).click(); sq(42).click();
      $('resign').click(); $('resign').click();
      const end = { word: $('eword').textContent, cls: $('eword').className, line: $('eline').textContent };
      $('econt').click();
      const after = { map: $('screen-map').classList.contains('on'), side: G.side, from: G.ranks[5], phase: G.phase, town: G.own[3] };
      const col = id => getComputedStyle($(id)).color;
      const greenAtt = col('att-label');
      G.side = 't'; m.beginBattle(6, 5, true); m.finishRoll();
      roll.colors = { greenAtt, redAtt: col('att-label'), greenDef: col('def-label') };
      m.show('screen-map');
      return Object.assign({ roll, lab, afterW, machine, afterB, end }, after);
    });
    ok(/^Green marches on Checker Town/.test(tb.roll.title) && /^Green attacks/.test(tb.roll.att) && /^Red defends/.test(tb.roll.def),
      'the roll screen names both players  [' + tb.roll.title + ']');
    ok(tb.roll.colors.greenAtt === 'rgb(107, 255, 184)' && tb.roll.colors.redAtt === 'rgb(255, 110, 138)' && tb.roll.colors.greenDef === 'rgb(107, 255, 184)',
      "…each name in its own color, whichever chair it sits in  [Red attacking: " + tb.roll.colors.redAtt + ']');
    ok(/Green/.test(tb.lab.mat) && /Red/.test(tb.lab.mat) && tb.lab.aura === '#6bffb8', "the board's tally and rail wear the attacker's color  [" + tb.lab.mat + ']');
    ok(tb.afterW === 'b' && tb.machine === 'b', 'no machine: after Green moves, Black waits for a person — even with a reply left pending by an earlier battle  [' + tb.machine + ' to move after 1.9s]');
    ok(tb.afterB.turn === 'w' && tb.afterB.d6 === 'p', "…and Red moves Black's pieces by tapping them");
    ok(tb.end.word === 'GREEN TAKES IT' && /win/.test(tb.end.cls) && /^Red gave up/.test(tb.end.line),
      'Withdraw gives up for the side to move, defender included  [' + tb.end.word + ' — ' + tb.end.line + ']');
    ok(tb.map && tb.side === 'm' && tb.town === 'm' && tb.from === 1 && tb.phase === 'attack', "…the ground changes hands and the map returns to Green's attacks");

    /* ── game-start options ── */
    const opts = await E(() => {
      const $ = id => document.getElementById(id), m = __mc, f = $('opt-fog'), c = $('opt-cards');
      m.show('screen-home');
      const before = { fog: f.textContent, cards: c.textContent };
      f.click();
      const after = { fog: f.textContent, pressed: f.getAttribute('aria-pressed'), ls: localStorage.getItem('pjcc.campaign.fog') };
      localStorage.removeItem('pjcc.campaign.save.v1');
      $('go').click();
      const game = { fog: m.G.fog, fogged: m.fogged(1), disc: document.querySelector('.node[data-id="1"] .disc').textContent,
        cards: m.G.cards, bar: $('cardbar').hidden };
      f.click();
      return { before, after, game, kept: m.G.fog, back: f.textContent };
    });
    ok(opts.before.fog === 'Fog of War · On' && opts.before.cards === 'Event Cards · Off',
      'the home screen shows both options and how they are set  [' + opts.before.fog + ' / ' + opts.before.cards + ']');
    ok(opts.after.fog === 'Fog of War · Off' && opts.after.pressed === 'false' && opts.after.ls === '0', '…a tap flips one, says so, and is remembered');
    ok(!opts.game.fog && !opts.game.fogged && opts.game.disc !== '?' && !opts.game.cards && opts.game.bar,
      'a game begun with fog off hides nothing, and with cards off deals none  [The Fork shows ' + opts.game.disc + ']');
    ok(opts.kept === false && /On$/.test(opts.back), '…and keeps those settings when the options change mid-game');

    /* ── event cards ── */
    const cards = await E(() => {
      const m = __mc, $ = id => document.getElementById(id), out = {};
      const START = [3, 3, 3, 4, 2, 4, 3, 2, 3, 3];
      const fresh = (k, diff) => {
        m.newCampaign(diff || 'medium'); const G = m.G; G.started = false; G.cards = true; G.ranks = START.slice();
        if (k) m.playCard(k);
        m.resetTurn(); m.show('screen-map'); m.drawMap(); return G;
      };
      m.newCampaign('medium', 'solo', { cards: true }); m.G.started = false; m.show('screen-map'); m.drawMap();
      out.dealt = { card: m.G.card, bar: !$('cardbar').hidden, nm: $('card-nm').textContent };
      let repeats = 0, skies = 0;
      for (let i = 0; i < 60; i++) { const prev = m.G.card; m.drawCard(); if (m.G.card === prev) repeats++; }
      m.newCampaign('medium', 'solo', { cards: true, fog: false });
      for (let i = 0; i < 60; i++) { m.drawCard(); if (m.G.card === 'skies') skies++; }
      out.draws = { repeats, skies };

      let G = fresh('reinforce'); out.reinforce = G.toPlace;
      G = fresh('march'); out.march = G.atks;
      G = fresh('supply'); out.supply = G.atks;
      G = fresh('skies'); out.skies = m.fogged(1);

      G = fresh('mud'); G.toPlace = 0; m.setPhase('fortify'); m.tapLand(5); m.tapLand(8);
      out.mud = { flats: G.ranks[8], say: $('map-say').textContent, move: !!m.rivalPlan().move };
      G = fresh('reinforce'); out.plainMove = !!m.rivalPlan().move;

      G = fresh('roads'); G.toPlace = 0; m.setPhase('fortify'); m.tapLand(5); m.tapLand(9); out.roads = G.ranks[9];
      G = fresh('reinforce'); G.toPlace = 0; m.setPhase('fortify'); m.tapLand(5); m.tapLand(9); out.noRoads = G.ranks[9];

      G = fresh('truce'); G.truce = 3; G.toPlace = 0; G.ranks[5] = 4; m.setPhase('attack'); m.drawMap();
      out.truceNode = document.querySelector('.node[data-id="3"]').className;
      out.truceTxt = $('card-txt').textContent;
      m.tapLand(5); m.tapLand(3);
      out.truce = { atks: G.atks, roll: $('screen-roll').classList.contains('on') };
      const siege = G2 => { G2.diff = 'hard'; G2.ranks = G2.own.map(o => o === 't' ? 9 : 1); return m.rivalPlan().attacks; };
      G = fresh('truce', 'hard'); G.truce = 3; out.rivalTruce = siege(G).filter(a => a.from === 3 || a.to === 3).length;
      G = fresh(null, 'hard'); out.capPlain = siege(G).length;
      G = fresh('march', 'hard'); out.capMarch = siege(G).length;
      G = fresh('supply', 'hard'); out.capSupply = siege(G).length;

      m.newCampaign('medium'); G = m.G; G.cards = true; G.ranks = START.slice(); m.playCard('rally'); out.rally = G.ranks.join();
      m.newCampaign('medium'); G = m.G; G.cards = true; G.ranks = START.slice(); G.ranks[5] = 7; G.ranks[3] = 6; G.ranks[0] = 5;
      m.playCard('desert'); out.desert = [G.ranks[5], G.ranks[3], G.ranks[0]].join();

      const dealDaily = () => { m.newCampaign('easy', 'daily', { cards: true }); m.G.started = false; const a = m.G.card + '@' + m.G.truce;
        m.startYourTurn(); return a + '|' + m.G.card + '@' + m.G.truce; };
      out.daily = [dealDaily(), dealDaily()];

      m.newCampaign('medium', 'solo', { cards: true }); G = m.G; G.started = true; G.ranks = START.slice();
      m.playCard('rally'); m.drawMap();
      const saved = JSON.parse(localStorage.getItem('pjcc.campaign.save.v1'));
      const savedRanks = saved.ranks.join();   // resumeCampaign keeps this same array, so read it first
      m.resumeCampaign(saved);
      out.resume = { card: m.G.card, ranks: m.G.ranks.join(), savedRanks };
      localStorage.removeItem('pjcc.campaign.save.v1');

      m.newCampaign('medium', 'two', { cards: true }); G = m.G; G.started = false;
      const c1 = G.card; G.toPlace = 0; m.setPhase('fortify'); $('endturn').click();
      const red = G.card; G.toPlace = 0; m.setPhase('fortify'); $('endturn').click();
      out.two = { c1, red, round2: G.card };
      return out;
    });
    ok(cards.dealt.card && cards.dealt.bar && cards.dealt.nm.length > 2, 'with cards on, a game opens with a card on the map  [' + cards.dealt.nm + ']');
    ok(cards.draws.repeats === 0 && cards.draws.skies === 0, 'the same card never comes twice in a row, and Clear Skies never comes with fog off  [60 draws each]');
    ok(cards.reinforce === 3, 'Reinforcements: two extra troops to deploy  [' + cards.reinforce + ']');
    ok(cards.march === 4 && cards.supply === 2, 'Forced March and Short Supply: four attacks, or two  [' + cards.march + ', ' + cards.supply + ']');
    ok(cards.skies === false, 'Clear Skies: nothing is hidden');
    ok(cards.mud.flats === 3 && /Mud/.test(cards.mud.say) && !cards.mud.move && cards.plainMove,
      'Mud: no fortify for you or for them  [' + cards.mud.say + ']');
    ok(cards.roads === 4 && cards.noRoads === 3, 'Long Roads: Chess City reaches Pirc Pass through Endgame Flats — and only under the card');
    ok(/\btruce\b/.test(cards.truceNode) && /Checker Town/.test(cards.truceTxt) && cards.truce.atks === 3 && !cards.truce.roll,
      'Truce: the named holding is marked, and attacking it opens nothing  [' + cards.truceTxt + ']');
    ok(cards.rivalTruce === 0, '…and the machine keeps the truce too');
    ok(cards.capPlain === 3 && cards.capMarch === 4 && cards.capSupply === 2,
      'the machine plays under the same card: Hard attacks ' + cards.capPlain + ', ' + cards.capMarch + ' on Forced March, ' + cards.capSupply + ' on Short Supply');
    ok(cards.rally === '4,4,3,5,2,5,3,3,4,3', 'Rally: every chained holding, on both sides, gains a troop  [' + cards.rally + ']');
    ok(cards.desert === '6,5,5', 'Desertion: six or more loses one, five does not  [' + cards.desert + ']');
    ok(cards.daily[0] === cards.daily[1] && cards.daily[0].split('|')[0].split('@')[0] !== cards.daily[0].split('|')[1].split('@')[0],
      "the Daily deals everyone the same card each round  [" + cards.daily[0] + ']');
    ok(cards.resume.card === 'rally' && cards.resume.ranks === cards.resume.savedRanks, 'a resumed game keeps its card and does not play it twice');
    ok(cards.two.c1 === cards.two.red && cards.two.round2 && cards.two.round2 !== cards.two.c1,
      'two players: Green and Red play under one card a round  [' + cards.two.c1 + ' → ' + cards.two.round2 + ']');

    /* ── the coach ── */
    const coach = await E(async () => {
      const m = __mc, $ = id => document.getElementById(id), C = window.PJCCChess;
      const run = async (diff, mode, fen, attacking) => {
        m.newCampaign(diff, mode); m.G.started = false;
        m.PEND = { from: 5, to: 3, aRanks: 4, dRanks: 3, dInfo: { castled: false, chain: 0 },
          playerAttacks: attacking, attWhite: attacking, board: C.parseFEN(fen).b };
        m.show('screen-roll'); $('preview').hidden = false; m.paintPreview();
        await new Promise(r => setTimeout(r, 800));
        return { hidden: $('coach').hidden, text: $('coach').textContent };
      };
      const MATE = '6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1';
      return {
        mate: await run('easy', 'solo', MATE, true),
        threat: await run('easy', 'solo', 'r5k1/8/8/8/8/8/5PPP/6K1 b - - 0 1', false),
        up: await run('easy', 'daily', '4k3/3ppp2/8/8/8/8/3PPP2/3QK3 w - - 0 1', true),
        medium: await run('medium', 'solo', MATE, true),
        two: await run('easy', 'two', MATE, true)
      };
    });
    await E(() => __mc.show('screen-map'));
    ok(!coach.mate.hidden && /forced mate/.test(coach.mate.text) && /Ra8#/.test(coach.mate.text), 'Easy: the coach names a forced mate and its first move  [' + coach.mate.text + ']');
    ok(!coach.threat.hidden && /they have a forced mate/.test(coach.threat.text) && /Ra1#/.test(coach.threat.text), '…warns a defender of one coming  [' + coach.threat.text + ']');
    ok(!coach.up.hidden && /You are up 9\. They have only pawns/.test(coach.up.text) && /Try [A-Z]?[a-h]/.test(coach.up.text), '…and otherwise gives the material and a first move  [' + coach.up.text + ']');
    ok(coach.medium.hidden && coach.two.hidden, 'no coach on Medium, and none between two people');

    /* ── save and continue ── */
    await E(() => localStorage.removeItem('pjcc.campaign.save.v1'));
    await page.reload({ waitUntil: 'load' });
    await page.waitForFunction(() => !!window.__mc);
    const noSave = await E(() => { const r = document.getElementById('resume'); return { hidden: r.hidden, shown: getComputedStyle(r).display !== 'none' }; });
    ok(noSave.hidden && !noSave.shown, 'with no campaign in progress there is nothing to continue — and no button drawn  [display ' + (noSave.shown ? 'visible' : 'none') + ']');
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

    /* ── one slot per mode ── */
    await E(() => { localStorage.removeItem('pjcc.campaign.save.two.v1'); localStorage.removeItem('pjcc.campaign.save.daily.v1'); });
    await page.reload({ waitUntil: 'load' });
    await page.waitForFunction(() => !!window.__mc);
    await page.click('#go');
    const soloBefore = await E(() => localStorage.getItem('pjcc.campaign.save.v1'));
    await E(() => { __mc.show('screen-home'); document.getElementById('daily').click(); });
    const dailyOn = await E(() => ({ mode: __mc.G.mode, map: document.getElementById('screen-map').classList.contains('on'), own: __mc.G.own.join('') }));
    await page.reload({ waitUntil: 'load' });
    await page.waitForFunction(() => !!window.__mc);
    const slots = await E(() => ({ solo: localStorage.getItem('pjcc.campaign.save.v1'), resume: !document.getElementById('resume').hidden,
      daily: document.getElementById('daily').textContent }));
    ok(soloBefore && dailyOn.mode === 'daily' && dailyOn.map && slots.solo === soloBefore && slots.resume,
      'starting the Daily does not touch a campaign in progress, and needs no second tap');
    await page.click('#daily');
    const dailyBack = await E(() => ({ mode: __mc.G.mode, own: __mc.G.own.join('') }));
    ok(/^Daily · round 1$/.test(slots.daily) && dailyBack.mode === 'daily' && dailyBack.own === dailyOn.own,
      "…and today's Daily picks up where it was  [" + slots.daily + ']');

    await E(() => { __mc.show('screen-home'); document.getElementById('two').click(); });
    await E(() => { const G = __mc.G; G.toPlace = 0; __mc.setPhase('fortify'); document.getElementById('endturn').click(); });
    await page.reload({ waitUntil: 'load' });
    await page.waitForFunction(() => !!window.__mc);
    const twoHome = await E(() => document.getElementById('two').textContent);
    await page.click('#two');
    const twoBack = await E(() => ({ pass: document.getElementById('screen-pass').classList.contains('on'),
      map: document.getElementById('screen-map').classList.contains('on'), who: document.getElementById('pass-who').textContent, side: __mc.G.side }));
    ok(/^Two players · round 1$/.test(twoHome) && twoBack.pass && !twoBack.map && /RED/.test(twoBack.who) && twoBack.side === 't',
      'a two-player game continues behind the curtain, on the right side  [' + twoHome + ' → ' + twoBack.who + ']');
    const quit = await E(() => { const q = document.getElementById('pass-quit'); q.click();
      const armed = { label: q.textContent, save: !!localStorage.getItem('pjcc.campaign.save.two.v1') }; q.click();
      return { armed, save: localStorage.getItem('pjcc.campaign.save.two.v1'), home: document.getElementById('screen-home').classList.contains('on'),
        label: document.getElementById('two').textContent, solo: !!localStorage.getItem('pjcc.campaign.save.v1') }; });
    ok(/Tap again/.test(quit.armed.label) && quit.armed.save && quit.save === null && quit.home && quit.label === 'Two players' && quit.solo,
      'End this game asks twice, then clears only the two-player game  [' + quit.armed.label + ']');
  } catch (e) {
    FAIL++; console.log('  ✗ FAIL  harness threw: ' + e.message);
  } finally {
    await browser.close(); srv.close();
  }
  ok(errs.length === 0, 'no page errors' + (errs.length ? ' -> ' + errs.slice(0, 3).join(' | ') : ''));
  console.log('\nRESULT: ' + (FAIL ? 'FAIL (' + FAIL + '/' + (PASS + FAIL) + ' checks failed)' : 'PASS (' + PASS + ' checks)'));
  process.exit(FAIL ? 1 : 0);
})();
