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
  sounds: __sounds, tapLand: tapLand, beginBattle: beginBattle, tickClock: tickClock, posVerdict: posVerdict, musterBattle: musterBattle,
  playAI: playAI, applyMove: applyMove, autoPromo: autoPromo, pump: pump, setPhase: setPhase, drawMap: drawMap,
  newCampaign: newCampaign, campaignOver: campaignOver, show: show, paintDice: paintDice,
  fogged: fogged, dailyStart: dailyStart, startYourTurn: startYourTurn, startBattle: startBattle, goLive: goLive,
  finishRoll: finishRoll, nbrs: nbrs, playCard: playCard, drawCard: drawCard, resetTurn: resetTurn, rivalPlan: rivalPlan,
  resumeCampaign: resumeCampaign, paintPreview: paintPreview, finish: finish, theirTurn: theirTurn,
  dogStart: dogStart, scout: scout, get SURVIVE() { return SURVIVE; }, paintHome: paintHome, startMode: startMode,
  get picked() { return picked; }, paintFoes: paintFoes, oddsOf: oddsOf, rollBoards: rollBoards, standOf: standOf, standColor: standColor,
  setPicked: function (a) { picked = a.slice(); try { localStorage.setItem(FOES_KEY, JSON.stringify(picked)); } catch (e) {} paintHome(); },
  MAXWELL_LINES: MAXWELL_LINES, LAND: function () { return LAND; }, campaignCheck: campaignCheck,
  get replay() { return replay; }, idsOf: idsOf, loadBest: loadBest, SAND: SAND, hurry: hurry,
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
    ok(/3, 5 and 7 send one, two and three pawns up front; 7\+ castles behind a pawn, 8 brings the rook and three/.test(maths),
      'the "numbers" line states the d8 thresholds  [' + maths.split('—')[1] + ']');

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
      m.startMode(document.createElement('button'), 'two'); const G = G0();
      const out = { labels: $('l-mine').textContent + '/' + $('l-theirs').textContent, say: $('map-say').textContent };
      G.toPlace = 0; m.setPhase('fortify'); $('endturn').click();
      out.pass = { on: $('screen-pass').classList.contains('on'), who: $('pass-who').textContent, side: G.side, round: G.round, phase: G.phase };
      $('pass-go').click();
      out.red = { map: $('screen-map').classList.contains('on'), red: $('screen-map').classList.contains('red-turn'), say: $('map-say').textContent };
      const g5 = G.ranks[5], r3 = G.ranks[3]; G.toPlace = 2; m.setPhase('deploy');
      m.tapLand(5); m.tapLand(3);
      out.deploy = [G.ranks[5] - g5, G.ranks[3] - r3];
      out.fog = { shogi: m.fogged(7), flats: m.fogged(8), label: document.querySelector('.node[data-id="3"]').getAttribute('aria-label') };
      /* the sea lane (his #7): Shogi Island shows across the water from Red's Sea-Board, and hides once Sea-Board is not Red's */
      var wasSea = G.own[4]; G.own[4] = 'm'; out.fog.dry = m.fogged(7); G.own[4] = wasSea;
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
    ok(!two.fog.shogi && two.fog.dry && !two.fog.flats && /Red/.test(two.fog.label),
      "the fog is Red's: Shogi Island shows across the water from Red's Sea-Board and hides once Sea-Board is lost; Endgame Flats shows");
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

      let G = fresh(null); out.plainPlace = G.toPlace;
      G = fresh('reinforce'); out.reinforce = G.toPlace;
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
      // no walls here: this measures the card's attack cap, and a siege spends two of them
      const siege = G2 => { G2.diff = 'hard'; G2.walls = []; G2.ranks = G2.own.map(o => o === 't' ? 9 : 1); return m.rivalPlan().attacks; };
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
    ok(cards.plainPlace === 2 && cards.reinforce === cards.plainPlace + 2,
      'Reinforcements: two extra troops to deploy  [' + cards.plainPlace + ' -> ' + cards.reinforce + ']');
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

    /* ── the walled holdings ── */
    const siege = await E(() => {
      const m = __mc, $ = id => document.getElementById(id), out = {};
      const KEEP_M = 2, KEEP_T = 0;              // Gauntlet Keep is Green's, Sand Mines is Red's
      const start = () => { m.newCampaign('medium'); const G = m.G; G.started = false; m.show('screen-map'); return G; };
      // the defender's flag: whichever chair the player is in, the attacker won
      const win = (from, to, playerAttacks) => {
        const G = m.G;
        m.setB('4k3/8/8/8/8/8/8/R3K3 w - - 0 1', true);
        m.PEND = { from, to, playerAttacks, aRanks: G.ranks[from], attWhite: playerAttacks,
                   dInfo: { castled: false, chain: 0 }, aArmy: [], dArmy: [] };
        m.finish('time-def');
        m.drawMap();
        return { word: $('eword').textContent, line: $('eline').textContent, own: G.own[to],
                 from: G.ranks[from], node: document.querySelector('.node[data-id="' + to + '"]').className };
      };

      let G = start();
      out.start = { ids: G.walls.slice(), sides: G.walls.map(id => G.own[id]).join(''),
                    border: m.nbrs(G.walls[0]).indexOf(G.walls[1]) >= 0 };
      G.ranks[KEEP_M] = 4; G.toPlace = 0; m.setPhase('attack'); m.drawMap();
      const node0 = document.querySelector('.node[data-id="0"]');
      out.mark = { cls: node0.className, label: node0.getAttribute('aria-label') };
      m.tapLand(KEEP_M); out.hint = $('map-say').textContent;
      m.tapLand(KEEP_T);                          // commits the attack: the roll screen opens
      out.chip = $('def-label').textContent; out.spent = G.atks;
      m.finishRoll();                             // stops the roll's timers before PEND is replaced below
      m.show('screen-map'); G.busy = false;

      out.first = win(KEEP_M, KEEP_T, true);
      out.second = win(KEEP_M, KEEP_T, true);
      out.after = { own: G.own[KEEP_T], keep: G.ranks[KEEP_T], from: G.ranks[KEEP_M] };

      // their attack on your keep does the same, from the other side of the table
      G = start(); G.ranks[KEEP_T] = 4;
      out.theirs = win(KEEP_T, KEEP_M, false);

      // the deploy bonus, isolated: the same five holdings, the walls moved
      const placeWith = walls => { const G2 = start(); G2.walls = walls; m.resetTurn(); return G2.toPlace; };
      out.place = { none: placeWith([]), one: placeWith([2]), enemyToo: placeWith([2, 0]), both: placeWith([2, 5]) };

      // a breach lasts one turn: ending yours puts the walls back up
      G = start(); G.down = [KEEP_T]; G.toPlace = 0; m.setPhase('fortify');
      $('endturn').click();
      out.expire = { down: G.down.length, phase: G.phase };
      clearTimeout(G.beatT); G.beatFn = null; G.q = []; G.busy = false;

      // what the machine plans
      const plan = (diff, card, down) => {
        const G2 = start(); G2.diff = diff;
        if (card) { G2.cards = true; m.playCard(card); }
        G2.own = G2.own.map((o, i) => i === KEEP_T ? 't' : 'm');
        G2.ranks = G2.ranks.map(() => 1); G2.ranks[KEEP_T] = 9; G2.ranks[1] = 8; G2.ranks[3] = 8;
        G2.down = down || [];
        return m.rivalPlan().attacks;
      };
      const shape = a => a.map(x => x.from + '>' + x.to).join(' ');
      out.hard = shape(plan('hard'));
      out.hardDown = shape(plan('hard', null, [KEEP_M]));
      out.easy = shape(plan('easy'));
      out.noRoom = shape(plan('medium', 'supply'));

      const d1 = m.dailyStart('2026-09-15'), d2 = m.dailyStart('2026-09-15');
      out.daily = { same: d1.walls.join() === d2.walls.join(), sides: d1.walls.map(id => d1.own[id]).sort().join(''), n: d1.walls.length };

      G = start(); G.started = true; G.down = [KEEP_T]; m.drawMap();
      const saved = JSON.parse(localStorage.getItem('pjcc.campaign.save.v1'));
      m.resumeCampaign(saved);
      out.resume = { walls: m.G.walls.join(), down: m.G.down.join() };
      localStorage.removeItem('pjcc.campaign.save.v1');
      m.show('screen-map');
      return out;
    });
    ok(siege.start.ids.length === 2 && siege.start.sides === 'mt' && siege.start.border,
      'one walled holding a side, and they border each other  [' + siege.start.ids + ']');
    ok(/\bwalls\b/.test(siege.mark.cls) && /walled/.test(siege.mark.label),
      'a walled holding is marked on the map and in its spoken label  [' + siege.mark.label + ']');
    ok(/Sand Mines<\/b> is walled/.test(siege.hint) || /Sand Mines is walled/.test(siege.hint),
      'picking a neighbor of one warns you before the attack is committed  [' + siege.hint + ']');
    ok(/walled · a win breaks the walls/.test(siege.chip) && siege.spent === 2,
      '…and the roll screen says it again over the defender  [' + siege.chip + ']');
    ok(siege.first.word === 'WALLS DOWN' && siege.first.own === 't' && /Win there again this turn/.test(siege.first.line) && /breached/.test(siege.first.node),
      'a won battle at the walls takes no ground — it breaks them  [' + siege.first.word + ': ' + siege.first.line + ']');
    ok(siege.first.from === 4, '…and leaves the attacking stack whole, so the second attack is affordable  [' + siege.first.from + ' troops]');
    ok(siege.second.word === 'TAKEN' && siege.after.own === 'm' && siege.after.keep === 3 && !/breached/.test(siege.second.node),
      '…and a second win the same turn takes it, walls and all  [' + siege.after.keep + ' troops in it]');
    ok(siege.theirs.word === 'WALLS DOWN' && siege.theirs.own === 'm' && /they take it/.test(siege.theirs.line),
      'their win at your walls is the same bargain  [' + siege.theirs.line + ']');
    ok(siege.place.none === 1 && siege.place.one === 2 && siege.place.enemyToo === 2 && siege.place.both === 3,
      'a walled holding you hold is worth a troop a round — theirs is worth none  [' + [siege.place.none, siege.place.one, siege.place.both] + ']');
    ok(siege.expire.down === 0 && siege.expire.phase === 'theirs', 'the walls go back up when your turn ends');
    ok(siege.hard === '0>2 0>2', 'the machine books a siege as two attacks from one stack  [' + siege.hard + ']');
    ok(siege.hardDown === '0>2', '…one, if the walls are already down  [' + siege.hardDown + ']');
    ok(siege.noRoom === '0>1', '…and none it cannot finish: with one attack left it takes ordinary ground  [' + siege.noRoom + ']');
    ok(siege.easy === '0>2', 'Easy throws its one attack at the walls and cannot follow up  [' + siege.easy + ']');
    ok(siege.daily.n === 2 && siege.daily.same && siege.daily.sides === 'mt',
      "the Daily deals one walled holding a side, the same all day  [" + siege.daily.sides + ']');
    ok(siege.resume.walls === '2,0' && siege.resume.down === '0', 'a resumed game remembers its walls and the breach in them');

    /* ── the coach ── */
    const coach = await E(async () => {
      const m = __mc, $ = id => document.getElementById(id), C = window.PJCCChess;
      const run = async (diff, mode, fen, attacking) => {
        m.newCampaign(diff, mode); m.G.started = false;
        m.PEND = { from: 5, to: 3, aRanks: 4, dRanks: 3, dInfo: { castled: false, chain: 0 }, clocks: { att: 15, def: 15 },
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

    /* ⚑ 11-17 (his "'Castled!' should light up in large words"): a castle reads CASTLED! large and gold, and on a phone the
       tally — the clocks the armies bought — is one line that scrolls clear of the button. The first cut wrapped it in the
       board's width and left it under the button (measured). ⚠ The longest clause (an 8 up front as well) wraps, so this
       asks for the screen scrolled to its end, which is where a phone in Safari always reads it. */
    await page.setViewport({ width: 390, height: 844 });
    const fit = await E(async () => {
      const m = __mc, $ = (id) => document.getElementById(id);
      m.newCampaign('medium', 'solo'); m.G.started = false;
      m.beginBattle(5, 3, true);
      let P = null;
      for (let i = 0; i < 800 && !(P && P.dInfo.castled && P.dInfo.rook && P.dInfo.shield === 3 && P.aMoved >= 2 && P.aPos === 8); i++) P = m.musterBattle(5, 3, true);
      m.PEND = P; m.finishRoll();
      await new Promise((r) => setTimeout(r, 900));
      $('screen-roll').scrollTop = 1e6;
      await new Promise((r) => setTimeout(r, 60));
      const t = $('ptally').getBoundingClientRect(), b = $('tobattle').getBoundingClientRect(), w = $('v-pos').querySelector('b');
      const out = { word: w.textContent, size: parseFloat(getComputedStyle(w).fontSize), color: getComputedStyle(w).color,
        lines: Math.round(t.height / 14), bottom: Math.round(t.bottom), button: Math.round(b.top), tally: $('ptally').textContent };
      m.G.busy = false; m.show('screen-map');
      return out;
    });
    await page.setViewport({ width: 460, height: 760 });
    ok(fit.word === 'CASTLED!' && fit.size >= 28 && fit.color === 'rgb(255, 214, 106)',
      'a castle lights CASTLED! large and gold  [' + fit.size + 'px ' + fit.color + ']');
    ok(fit.lines === 1 && fit.bottom <= fit.button && /time \d+s to \d+s/.test(fit.tally),
      '…and on a 390×844 phone the tally with its clocks is one line and scrolls clear of the button, on the longest clause  [' + fit.lines + ' line, ends ' + fit.bottom + ' · button ' + fit.button + ' · ' + fit.tally + ']');

    /* ⭐ his 11-18: "a chance-to-succeed bar, like an eval bar, after the dice is rolled so it is more clear who has the
       advantage" — hidden while the dice roll, then the attacker's share from the left, each side in its own color */
    const odds = await E(async () => {
      const m = __mc, $ = (id) => document.getElementById(id), out = {};
      const read = () => ({ a: $('odds-a').textContent, d: $('odds-d').textContent, shown: !$('odds').hidden,
        ca: getComputedStyle($('odds-a')).color, cd: getComputedStyle($('odds-d')).color, want: Math.round(m.oddsOf(m.PEND) * 100),
        fill: Math.round($('odds-fill').getBoundingClientRect().width / $('obar').getBoundingClientRect().width * 100) });
      m.newCampaign('medium', 'solo'); m.G.started = false;
      m.beginBattle(5, 3, true);
      out.rolling = !$('odds').classList.contains('on');
      m.finishRoll();
      await new Promise((r) => setTimeout(r, 900));
      out.att = read();
      m.G.busy = false; m.show('screen-map');
      m.G.ranks[3] = 6;
      m.beginBattle(3, 5, false);
      out.again = !$('odds').classList.contains('on');
      m.finishRoll();
      await new Promise((r) => setTimeout(r, 900));
      out.def = read();
      m.G.busy = false; m.show('screen-map');
      return out;
    });
    const pct = (t) => +((/(\d+)%/.exec(t) || [])[1]);
    const GREEN = 'rgb(107, 255, 184)', RED = 'rgb(255, 110, 138)';
    ok(odds.rolling && odds.att.shown && /^You \d+%$/.test(odds.att.a) && /^\d+% Maxwell$/.test(odds.att.d) &&
       pct(odds.att.a) + pct(odds.att.d) === 100 && pct(odds.att.a) === odds.att.want && Math.abs(odds.att.fill - odds.att.want) <= 1 &&
       odds.att.ca === GREEN && odds.att.cd === RED,
       '⭐ his 11-18: once the dice land, a bar says who has the advantage: your share from the left in Green, his in Red, as the measured odds  [' + odds.att.a + ' · ' + odds.att.d + ' · bar ' + odds.att.fill + '%]');
    ok(odds.again && odds.def.shown && /^Maxwell \d+%$/.test(odds.def.a) && /^\d+% You$/.test(odds.def.d) &&
       pct(odds.def.a) + pct(odds.def.d) === 100 && Math.abs(odds.def.fill - odds.def.want) <= 1 && odds.def.ca === RED && odds.def.cd === GREEN,
       '…hidden again while the next dice roll, and defending, the attacker is still the left  [' + odds.def.a + ' · ' + odds.def.d + ']');

    /* ⭐ his 11-18: "after each dice roll, the pieces get put on the board. One side at a time" — a real roll, timed: the board
       up from the start and still, the attacker's men after the first die, both after the second, the battle's board at the
       end; each side's line under its name, settling from gray to its green */
    await page.setViewport({ width: 360, height: 760 });
    const steps = await E(async () => {
      const m = __mc, $ = (id) => document.getElementById(id), out = { at: [] };
      m.newCampaign('medium', 'solo'); m.G.started = false; m.G.ranks[5] = 7;
      m.beginBattle(5, 3, true);
      const P = m.PEND, aw = P.attWhite;
      const look = () => {
        const men = [...document.querySelectorAll('#pmen .pc:not(.leave)')];
        return { top: Math.round($('pboard').getBoundingClientRect().top), n: men.length,
          att: men.filter((e) => e.classList.contains(aw ? 'w' : 'b')).length, def: men.filter((e) => e.classList.contains(aw ? 'b' : 'w')).length,
          astand: $('att-stand').textContent, dstand: $('def-stand').textContent, castled: !$('v-pos').classList.contains('pending'),
          acol: getComputedStyle($('att-stand')).color };
      };
      out.at.push(look());
      for (const ms of [900, 1700, 4300]) {
        await new Promise((r) => setTimeout(r, ms - (out.waited || 0)));
        out.waited = ms;
        out.at.push(look());
      }
      out.want = { att: P.board.filter((pc) => pc && (pc >= 'A' && pc <= 'Z') === aw).length,
        def: P.board.filter((pc) => pc && (pc >= 'A' && pc <= 'Z') !== aw).length,
        alone: m.rollBoards(P)[0].filter(Boolean).length };
      out.color = m.standColor((m.standOf(P, true, 'pos')).score);
      out.board = [...document.querySelectorAll('#pmen .pc')].length === P.board.filter(Boolean).length;
      m.G.busy = false; m.show('screen-map');
      return out;
    });
    await page.setViewport({ width: 460, height: 760 });
    const [s0, s1, s2, s3] = steps.at;
    ok(s0.n === 0 && s1.att === steps.want.alone && s1.def === 0 && s2.def > 0 && s3.att === steps.want.att && s3.def === steps.want.def && steps.board,
       '⭐ his 11-18: the board is up and empty as the dice start, the attacker\'s men go on after the first die, the defender\'s after the second, and the roll ends on the battle\'s board  [' +
       steps.at.map((x) => x.att + '+' + x.def).join(' → ') + ']');
    ok(s0.top === s1.top && s1.top === s2.top && s2.top === s3.top,
       '…and nothing above the board moves it through the roll (the verdicts take their room from the first die)  [' + steps.at.map((x) => x.top).join(' ') + ']');
    ok(s0.astand === '' && /^[A-Z]+ ARMY\d+ points$/.test(s1.astand) && /^[A-Z]+ POSITION\d+ points · /.test(s3.astand) && /^[A-Z]+ POSITION/.test(s3.dstand) &&
       s3.acol === steps.color,
       '…and each side\'s line under its name rates its rolls as they land, ending in its own green  [' + s1.astand + ' → ' + s3.astand + ' · ' + s3.dstand + ' · ' + s3.acol + ']');

    ok(!s1.castled && !s2.castled && s3.castled, '…and the position verdict waits, unseen, for its own die  [' + steps.at.map((x) => x.castled).join(' ') + ']');

    /* ⚑ his 11-18, the defender's mate: #7 ROUTED! large and gold on the card, in either chair, and #2 its prisoners */
    const routed = await E(() => {
      const m = __mc, $ = (id) => document.getElementById(id);
      const card = () => ({ word: $('eword').textContent, cls: $('eword').className, line: $('eline').textContent,
        size: parseFloat(getComputedStyle($('eword')).fontSize), color: getComputedStyle($('eword')).color });
      const play = (playerAttacks, how) => {
        m.newCampaign('medium', 'solo'); m.G.started = false;
        const G = m.G;
        G.own[5] = playerAttacks ? 'm' : 't'; G.own[3] = playerAttacks ? 't' : 'm'; G.ranks[5] = 6; G.ranks[3] = 4;
        m.setB('4k3/8/8/8/8/8/8/R3K3 w - - 0 1', playerAttacks);
        m.PEND = { from: 5, to: 3, playerAttacks: playerAttacks, aRanks: 6, dRanks: 4, attWhite: playerAttacks,
                   dInfo: { castled: false, chain: 0 }, aArmy: [], dArmy: [] };
        m.finish(how);
        const out = Object.assign(card(), { garrison: G.ranks[3] });
        m.hideEndcard && m.hideEndcard();
        return out;
      };
      return { defending: play(false, 'won-mate'), attacking: play(true, 'lost-mate'), control: play(true, 'won-mate') };
    });
    ok(routed.defending.word === 'ROUTED!' && /routed/.test(routed.defending.cls) && routed.defending.size >= 30 &&
       routed.defending.color === 'rgb(255, 214, 106)' && /3 prisoners join them/.test(routed.defending.line) && routed.defending.garrison === 7,
       '⭐ you defend and mate the attacker: ROUTED! large and gold, and 3 of the 5 that marched join your 4  [' + routed.defending.size + 'px · ' + routed.defending.line + ']');
    ok(routed.attacking.word === 'ROUTED!' && /prisoners join them/.test(routed.attacking.line) && routed.control.word === 'TAKEN',
       '…mated attacking, the card says ROUTED! too; a mate by the attacker still reads TAKEN  [' + routed.control.word + ']');

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

    await E(() => { __mc.show('screen-home'); __mc.startMode(document.createElement('button'), 'two'); });
    await E(() => { const G = __mc.G; G.toPlace = 0; __mc.setPhase('fortify'); document.getElementById('endturn').click(); });
    await page.reload({ waitUntil: 'load' });
    await page.waitForFunction(() => !!window.__mc);
    const twoHome = await E(() => !document.getElementById('two') && !/Two players/.test(document.getElementById('screen-home').textContent));
    await E(() => __mc.startMode(document.createElement('button'), 'two'));
    const twoBack = await E(() => ({ pass: document.getElementById('screen-pass').classList.contains('on'),
      map: document.getElementById('screen-map').classList.contains('on'), who: document.getElementById('pass-who').textContent, side: __mc.G.side }));
    ok(twoHome && twoBack.pass && !twoBack.map && /RED/.test(twoBack.who) && twoBack.side === 't',
      '⚑ his 11-19: Two players is off the menu; the mode is whole, and a game of it continues behind the curtain, on the right side  [' + twoBack.who + ']');
    const quit = await E(() => { const q = document.getElementById('pass-quit'); q.click();
      const armed = { label: q.textContent, save: !!localStorage.getItem('pjcc.campaign.save.two.v1') }; q.click();
      return { armed, save: localStorage.getItem('pjcc.campaign.save.two.v1'), home: document.getElementById('screen-home').classList.contains('on'),
        solo: !!localStorage.getItem('pjcc.campaign.save.v1') }; });
    ok(/Tap again/.test(quit.armed.label) && quit.armed.save && quit.save === null && quit.home && quit.solo,
      'End this game asks twice, then clears only the two-player game  [' + quit.armed.label + ']');

    /* ══ 11-10: MAXWELL COMMANDS RED, YOUR DOG, AND WHAT A BATTLE LEAVES ══ */
    const mx = await E(() => {
      const $ = id => document.getElementById(id), out = {};
      localStorage.setItem('pjcc.campaign.file.v1', JSON.stringify({ v: 1, games: 3, won: 1, lost: 2, open: { 5: 3 }, keep: 0, thin: {}, turns: 12, forts: 6 }));
      localStorage.removeItem('pjcc.campaign.save.v1');
      $('go').click();
      out.open = { shown: !$('mx-speech').hidden, line: $('mx-line').textContent, tally: $('l-theirs').textContent };
      __mc.theirTurn();
      out.turn = { shown: !$('mx-speech').hidden, line: $('mx-line').textContent, say: $('map-say').textContent };
      clearTimeout(__mc.G.beatT); __mc.G.beatFn = null; __mc.G.q = [];
      return out;
    });
    ok(mx.open.shown && /Chess City/.test(mx.open.line) && mx.open.tally === 'Maxwell',
       'a campaign opens with what Maxwell has noticed about you, and the tally names him  [' + mx.open.line + ' · ' + mx.open.tally + ']');
    ok(mx.turn.shown && mx.turn.line.length > 0 && /Maxwell’s turn/.test(mx.turn.say),
       '…and his turn is his: his face, his line, his name on it  [' + mx.turn.line + ' · ' + mx.turn.say + ']');
    const mxCard = await E(() => {
      const m = __mc, $ = id => document.getElementById(id);
      m.setB('4k3/8/8/8/8/8/8/R3K2R w - - 0 1', true);
      m.PEND.board = m.B.S.b.slice();
      m.finish('won-mate');
      return { mx: $('emx').hidden ? '' : $('emx').textContent, line: $('eline').textContent };
    });
    ok(/^Maxwell: “.+”$/.test(mxCard.mx), 'a battle against Red ends with his word under the verdict  [' + mxCard.mx + ']');
    ok(/march into/.test(mxCard.line), 'the verdict says how many of the troops that went march in  [' + mxCard.line + ']');
    const twoMx = await E(() => {
      const $ = id => document.getElementById(id);
      localStorage.removeItem('pjcc.campaign.save.two.v1');
      __mc.startMode(document.createElement('button'), 'two');
      return { shown: !$('mx-speech').hidden, tally: $('l-theirs').textContent };
    });
    ok(!twoMx.shown && twoMx.tally === 'Red', 'two players face each other: no Maxwell on the map  [' + twoMx.tally + ']');
    const dog = await E(() => {
      const $ = id => document.getElementById(id), labels = [], out = {};
      $('screen-home').classList.add('on');
      for (let i = 0; i < 4; i++) { $('opt-dog').click(); labels.push($('opt-dog').textContent + '|' + $('dog-note').textContent); }
      out.labels = labels;
      while ($('opt-dog').textContent !== 'Dog · Argus') $('opt-dog').click();
      localStorage.removeItem('pjcc.campaign.save.v1');
      $('go').click();
      const G = __mc.G;
      out.dog = { id: G.dogId, at: G.dog, start: __mc.dogStart(), tag: !!document.querySelector('.node[data-id="' + G.dog + '"] .dogtag') };
      G.dog = 5; G.phase = 'deploy'; G.fog = true; __mc.drawMap();
      const atks = G.atks;
      out.sniffClass = !!document.querySelector('.node[data-id="1"].sniff');
      __mc.tapLand(1);
      out.sniff = { atks: G.atks === atks, seen: G.seen.m.indexOf(1) >= 0, sniffed: G.sniffed, say: $('map-say').textContent };
      return out;
    });
    ok(dog.labels.join(' / ').indexOf('Dog · Princess|') === 0 && /Dog · Argus\|Argus sniffs out one hidden holding/.test(dog.labels[2]) &&
       /Dog · None\|$/.test(dog.labels[3]),
       'the dog you bring is one tap away, and the note says his gift  [' + dog.labels.map(l => l.split('|')[0]).join(' → ') + ']');
    ok(dog.dog.id === 'argus' && dog.dog.at === dog.dog.start && dog.dog.tag,
       'a campaign with a dog puts him on your biggest stack, and the map shows him there  [at ' + dog.dog.at + ']');
    ok(dog.sniffClass && dog.sniff.atks && dog.sniff.seen && dog.sniff.sniffed && /Argus sniffs out/.test(dog.sniff.say),
       'Argus sniffs out the hidden holding past his border with one tap, and it costs no attack  [' + dog.sniff.say + ']');
    await E(() => { localStorage.removeItem('pjcc.campaign.dog.v1'); localStorage.removeItem('pjcc.campaign.file.v1'); });
    const ring = await E(() => {
      const m = __mc, $ = id => document.getElementById(id);
      localStorage.removeItem('pjcc.campaign.save.v1');
      $('go').click();
      const G = m.G; G.own[3] = 't'; G.own[5] = 'm'; G.ranks[3] = 4; G.ranks[5] = 4;
      m.beginBattle(3, 5, false);
      const his = $('screen-roll').classList.contains('swap');
      m.finishRoll(); G.busy = false; m.show('screen-map');
      m.beginBattle(5, 3, true);
      const mine = $('screen-roll').classList.contains('swap');
      m.finishRoll(); G.busy = false; m.show('screen-map');
      return { his, mine };
    });
    ok(ring.his && !ring.mine, "Maxwell's dice wear red when he attacks, yours green when you do  [" + JSON.stringify(ring) + ']');

    /* ══ 11-10: A FIRST CAMPAIGN THAT TEACHES ══ */
    const first = await E(() => {
      const $ = id => document.getElementById(id), out = {}, teach = () => [...document.querySelectorAll('.node.teach')].map(n => +n.dataset.id).sort().join();
      ['pjcc.campaign.first.done.v1', 'pjcc.campaign.save.first.v1', 'pjcc.campaign.save.v1', 'pjcc.campaign.dog.v1'].forEach(k => localStorage.removeItem(k));
      __mc.paintHome();
      out.door = $('first').classList.contains('new');
      $('first').click();
      out.nodes = document.querySelectorAll('#mapbox .node').length;
      out.deploy = { shown: !$('mx-speech').hidden, line: $('mx-line').textContent, teach: teach(), place: __mc.G.toPlace };
      __mc.tapLand(3);
      out.attack = { phase: __mc.G.phase, line: $('mx-line').textContent, teach: teach() };
      __mc.campaignOver(true);
      out.done = { flag: localStorage.getItem('pjcc.campaign.first.done.v1'), verdict: $('verdict').textContent, mx: $('result-mx').textContent };
      $('cont').click();
      out.home = { on: $('screen-home').classList.contains('on'), door: $('first').classList.contains('new') };
      $('go').click();
      out.solo = document.querySelectorAll('#mapbox .node').length;
      return out;
    });
    ok(first.door, 'a new player sees the first campaign\'s door lit');
    ok(first.nodes === 5 && first.deploy.shown && /tap one of your holdings/.test(first.deploy.line) && first.deploy.teach === '3,4' && first.deploy.place === 1,
       'the first campaign is five holdings, and Maxwell points at where your troop goes  [' + first.deploy.teach + ' · ' + first.deploy.line + ']');
    ok(first.attack.phase === 'attack' && /Tap Chess City, then Checker Town/.test(first.attack.line) && first.attack.teach === '2,3',
       '…placed, he points at the first attack  [' + first.attack.teach + ']');
    ok(first.done.flag === '1' && /FIRST CAMPAIGN IS YOURS/.test(first.done.verdict) && /^Maxwell: “/.test(first.done.mx),
       'winning it marks it done, and he sends you to a real one  [' + first.done.mx + ']');
    ok(first.home.on && !first.home.door && first.solo === 10, '…and the ten come back for the real campaign  [' + first.solo + ' holdings]');

    /* ══ 11-10: A WAR OF THREE OR FOUR (his #10), begun from NUMBER OF OPPONENTS (his 11-18) ══ on the flat map: the sand
       table has its own check */
    const war = await E(() => {
      const $ = id => document.getElementById(id), out = {};
      ['pjcc.campaign.save.four.v1', 'pjcc.campaign.save.three.v1', 'pjcc.town.v1', 'pjcc.campaign.best.v1', 'pjcc.campaign.save.v1'].forEach(k => localStorage.removeItem(k));
      localStorage.setItem('pjcc.campaign.map.flat', '1');
      __mc.setPicked(['Maxwell']);
      out.doors = ['three', 'four'].filter(id => $(id)).length;
      $('opt-foes').click();
      const card = w => document.querySelector('#foe-list .foe[data-who="' + w + '"]');
      const say = b => [...b.querySelectorAll('small')].map(x => x.textContent).join(' · ');
      const lit = () => [...document.querySelectorAll('#foe-list .foe.on')].map(b => b.getAttribute('data-who') + ':' + say(b));
      out.screen = $('screen-foes').classList.contains('on');
      out.cards = [...document.querySelectorAll('#foe-list .foe')].map(b => b.querySelector('b').textContent + ' ' + say(b));
      out.faces = document.querySelectorAll('#foe-list .foe canvas').length;
      card('Vince').click(); card('Wes').click();
      out.lit = lit(); out.size = $('foe-say').textContent;
      card('Auston').click();
      out.full = $('foe-say').textContent + ' · ' + __mc.picked.length;
      card('Maxwell').click(); card('Vince').click(); card('Wes').click();
      out.least = $('foe-say').textContent + ' · ' + __mc.picked.length + ' · ' + ($('foe-done').disabled ? 'Done waits' : 'Done open');
      $('foe-done').click();
      out.stayed = $('screen-foes').classList.contains('on');
      card('Wes').click(); card('Maxwell').click(); card('Vince').click();
      out.again = lit();
      $('foe-done').click();
      out.home = { on: $('screen-home').classList.contains('on'), label: $('opt-foes').textContent, note: $('foes-note').textContent,
                   go: $('go').textContent, resume: $('resume').hidden };
      __mc.setPicked(['Maxwell', 'Vince', 'Wes']);
      $('go').click();
      out.n = document.querySelectorAll('#mapbox .node').length;
      out.tally = ['tw-u', 'tw-v'].map(id => $(id).hidden ? '' : $(id).textContent.replace(/\s+/g, ' ').trim());
      out.mine = $('t-mine').textContent;
      out.speech = $('mx-line').textContent;
      out.colors = ['side-u', 'side-v'].map(c => document.querySelectorAll('#mapbox .node.' + c).length);
      /* two machines' battle: Vince's middle on Wes's, from a queue, as their turn plays it */
      const G = __mc.G;
      G.ranks[11] = 9; G.ranks[15] = 1;
      G.phase = 'theirs'; G.busy = true; G.acting = 'u';
      G.q = [{ t: 'attack', from: 11, to: 15, side: 'u' }];
      __mc.pump();
      out.clash = { roll: $('screen-roll').classList.contains('on'), map: $('screen-map').classList.contains('on'), say: $('map-say').textContent,
        noted: G.warEv.length ? G.warEv[0].s + ':' + G.warEv[0].r : '' };
      return out;
    });
    ok(war.doors === 0 && war.screen && war.faces === 6 && war.cards.join(' | ') ===
       'Maxwell Strategic · Red | Vince Aggressive | Wes Defensive | Auston Adaptive | Puzzle Champ Cunning | Seaboard Rep Relentless',
       '⭐ his 11-18: the war doors are gone; Number of Opponents opens six generals, a face and a word each, the one picked wearing Red  [' + war.cards.join(' | ') + ']');
    ok(war.lit.join() === 'Maxwell:Strategic · Red,Vince:Aggressive · Blue,Wes:Defensive · Violet' && war.size === 'Three opponents: a war of four on sixteen holdings.',
       '…picked in order, they take Red, Blue and Violet, and the screen says what that makes  [' + war.lit.join(' · ') + ']');
    ok(war.full === 'Three at most. Tap one to let them go. · 3' && war.least === 'Pick at least one. · 0 · Done waits' && war.stayed &&
       war.again.join() === 'Maxwell:Strategic · Blue,Vince:Aggressive · Violet,Wes:Defensive · Red',
       '…never more than three; all let go, Done waits for one; and the seats follow the order you pick  [' + war.full + ' · ' + war.least + ']');
    ok(war.home.on && war.home.label === 'Number of opponents · 3' && war.home.note === 'Against Wes, Maxwell and Vince: a war of four.' &&
       war.home.go === 'Play' && war.home.resume,
       '…Done goes home, which says how many and who, and Play is for that war  [' + war.home.label + ' · ' + war.home.note + ']');
    ok(war.n === 16 && war.tally[0] === 'Vince 4' && war.tally[1] === 'Wes 4' && war.mine === '4/10' && war.colors.join() === '4,4',
       'a war of four is sixteen holdings, four a seat, every general counted, and yours counted toward ten  [' + war.tally.join(' · ') + ' · ' + war.mine + ']');
    ok(/16 holdings and 3 of us/.test(war.speech), 'Maxwell opens a war with its size  [' + war.speech + ']');
    ok(!war.clash.roll && war.clash.map && /(takes The Square from Wes|The Square holds against Vince|breaks the walls of The Square)/.test(war.clash.say) &&
       /^u:(took|held|breach)$/.test(war.clash.noted),
       'two machines\' battle is decided at once on the map, said in a line and kept for the replay  [' + war.clash.say + ']');
    const back = await E(() => {
      const $ = id => document.getElementById(id);
      __mc.paintHome();
      return { label: $('resume').hidden ? '' : $('resume').textContent, go: $('go').textContent, slot: !!localStorage.getItem('pjcc.campaign.save.four.v1') };
    });
    ok(/^Play · round \d+ · \d+ of 16 held$/.test(back.label) && back.go === 'Begin a new war' && back.slot,
       'a war of four keeps its own save, and Play picks it up while three are picked  [' + back.label + ' · ' + back.go + ']');

    /* ⭐ HIS 11-19: "there should be a PLAY button" · "The number of players on the bottom right should be removed" ·
       "You should be able to unselect Maxwell in the opponent select stage" */
    const play = await E(() => {
      const $ = id => document.getElementById(id), out = {};
      ['pjcc.campaign.save.v1', 'pjcc.campaign.save.three.v1', 'pjcc.campaign.save.four.v1'].forEach(k => localStorage.removeItem(k));
      __mc.setPicked(['Maxwell']); __mc.show('screen-home');
      const shown = (el) => !!el && el.offsetParent !== null;
      out.home = { go: $('go').textContent, gold: $('go').className === 'btn', two: !!$('two'), daily: shown($('daily')),
                   words: /Two players/.test($('screen-home').textContent) || /Two players:/.test($('screen-how').textContent) };
      $('opt-foes').click();
      const card = w => document.querySelector('#foe-list .foe[data-who="' + w + '"]');
      card('Maxwell').click();
      out.none = { n: __mc.picked.length, lit: document.querySelectorAll('#foe-list .foe.on').length, say: $('foe-say').textContent,
                   done: $('foe-done').disabled, kept: localStorage.getItem('pjcc.campaign.foes.v1') };
      $('foe-done').click();
      out.none.stayed = $('screen-foes').classList.contains('on');
      card('Vince').click();
      out.vince = { lit: [...document.querySelectorAll('#foe-list .foe.on')].map(b => b.getAttribute('data-who') + ':' + [...b.querySelectorAll('small')].map(x => x.textContent).join(' · ')).join(),
                    done: $('foe-done').disabled };
      $('foe-done').click();
      out.back = { on: $('screen-home').classList.contains('on'), label: $('opt-foes').textContent, note: $('foes-note').textContent, go: $('go').textContent };
      __mc.setPicked(['Maxwell']);
      return out;
    });
    ok(play.home.go === 'Play' && play.home.gold && !play.home.two && play.home.daily && !play.home.words,
       '⭐ his 11-19: the home\'s gold button says Play, and Two players is gone from it and from How it works  [' + play.home.go + ']');
    ok(play.none.n === 0 && play.none.lit === 0 && play.none.say === 'Pick at least one.' && play.none.done && play.none.stayed && play.none.kept === '["Maxwell"]',
       '⭐ his 11-19: Maxwell alone can be let go; with nobody picked Done waits, and nobody is never kept  [' + play.none.say + ' · kept ' + play.none.kept + ']');
    ok(play.vince.lit === 'Vince:Aggressive · Red' && !play.vince.done && play.back.on && play.back.label === 'Number of opponents · 1' &&
       play.back.note === 'Against Vince.' && play.back.go === 'Play',
       '…Vince picked in his place takes Red, and Play is for one on one against him  [' + play.vince.lit + ' · ' + play.back.note + ']');

    /* ⚠ A BEAT IS ITS CAMPAIGN'S (11-18): a machine's turn still waiting when you begin anew never plays on in the new one */
    const stale = await E(async () => {
      const G0 = __mc.G;
      G0.phase = 'theirs'; G0.busy = true; G0.acting = 'u'; G0.q = [{ t: 'say', s: 'Still their turn.' }];
      __mc.pump();
      localStorage.removeItem('pjcc.campaign.save.v1'); __mc.setPicked(['Maxwell']);
      document.getElementById('go').click();
      const G1 = __mc.G;
      await new Promise((r) => setTimeout(r, 1200));
      return { fresh: G1 !== G0 && __mc.G === G1, phase: G1.phase, busy: G1.busy, round: G1.round };
    });
    ok(stale.fresh && stale.phase === 'deploy' && !stale.busy && stale.round === 1,
       '⚠ a beat the last campaign left waiting never runs in the one you begin  [' + stale.phase + (stale.busy ? ', busy' : '') + ']');

    /* ⭐ his 11-18: whoever you pick commands, speaks and is named, a war or one on one */
    const picks = await E(() => {
      const $ = id => document.getElementById(id), out = {};
      ['pjcc.campaign.save.three.v1', 'pjcc.campaign.save.v1'].forEach(k => localStorage.removeItem(k));
      __mc.setPicked(['Auston', 'Puzzle Champ']);
      out.go = $('go').textContent;
      $('go').click();
      out.n = document.querySelectorAll('#mapbox .node').length;
      out.red = $('l-theirs').textContent;
      out.blue = $('tw-u').hidden ? '' : $('tw-u').textContent.replace(/\s+/g, ' ').trim();
      out.who = $('mx-name').textContent; out.line = $('mx-line').textContent; out.foes = __mc.G.foes.join();
      __mc.setPicked(['Vince']);
      $('go').click();
      out.solo = { n: document.querySelectorAll('#mapbox .node').length, red: $('l-theirs').textContent, who: $('mx-name').textContent,
                   line: $('mx-line').textContent, foes: __mc.G.foes.join() };
      __mc.campaignOver(false);
      out.solo.last = $('result-mx').textContent;
      $('cont').click();
      __mc.setPicked(['Maxwell']);
      ['pjcc.campaign.save.three.v1', 'pjcc.campaign.save.v1'].forEach(k => localStorage.removeItem(k));
      return out;
    });
    ok(picks.go === 'Play' && picks.n === 15 && picks.foes === 'Auston,Puzzle Champ' && picks.red === 'Auston' &&
       /^Puzzle Champ \d+$/.test(picks.blue) && picks.who === 'Auston' && picks.line === '15 holdings. Show me how you play.',
       '…a war of three against Auston and the Puzzle Champ: she commands Red and opens it, he holds Blue  [' + picks.red + ' · ' + picks.blue + ' · ' + picks.line + ']');
    ok(picks.solo.n === 10 && picks.solo.foes === 'Vince' && picks.solo.red === 'Vince' && picks.solo.who === 'Vince' &&
       picks.solo.line === "Ten holdings. I'll take them fast." && /^Vince: “/.test(picks.solo.last),
       '…one on one against Vince: his map, his opening line, his last word  [' + picks.solo.line + ' · ' + picks.solo.last + ']');

    /* ══ 11-10: GENERALS FROM YOUR ASSEMBLY (his #9) ══ */
    const gens = await E(() => {
      const $ = id => document.getElementById(id), out = {};
      localStorage.removeItem('pjcc.campaign.save.v1');
      $('go').click();
      out.none = $('orders').hidden;
      __mc.campaignOver(false); $('cont').click();
      localStorage.setItem('pjcc.town.v1', JSON.stringify({ run: 1, army: [3, 8, 11], board: [{ p: 'q', who: 'Michael', f: 3, r: 7 },
        { p: 'p', who: 'Maxwell', f: 0, r: 6 }, { p: 'p', who: 'Matsu', f: 3, r: 6 }] }));
      $('go').click();
      out.door = $('orders').textContent;
      $('orders').click();
      out.screen = $('screen-orders').classList.contains('on');
      out.rows = [...document.querySelectorAll('.gen')].map(b => b.dataset.who + (b.disabled ? '-' : '+'));
      const G = __mc.G, mine = __mc.idsOf('m')[0], was = G.ranks[mine];
      document.querySelector('.gen[data-who="Matsu"]').click();
      out.armed = $('screen-map').classList.contains('on') && G.orderArm === 'Matsu';
      __mc.tapLand(mine);
      out.drop = G.ranks[mine] - was;
      out.line = $('mx-name').textContent + ': ' + $('mx-line').textContent;
      out.after = $('orders').textContent;
      $('orders').click();
      out.rows2 = [...document.querySelectorAll('.gen')].map(b => b.dataset.who + (b.disabled ? '-' : '+'));
      $('orders-back').click();
      return out;
    });
    ok(gens.none, 'with no town save nobody stands with you, and the door is not there');
    ok(gens.door === 'Generals · 2 orders' && gens.screen && gens.rows.join() === 'Michael+,Matsu+',
       'your Assembly stands with you, Maxwell across the table and not among them  [' + gens.rows.join(' ') + ']');
    ok(gens.armed && gens.drop === 2 && gens.line === 'Matsu: Two more. Use them.' && gens.after === 'Generals · 1 order · next round' &&
       gens.rows2.join() === 'Michael-,Matsu-',
       'Matsu\'s order lands two troops on the holding you tap, in his words, and it is one order a round  [' + gens.line + ']');

    /* ══ 11-10: THE WAR, REPLAYED (his #7) ══ */
    const rep = await E(() => {
      const $ = id => document.getElementById(id), out = {};
      localStorage.removeItem('pjcc.best.campaign-war');
      __mc.campaignOver(true);
      out.result = { watch: !$('watch').hidden, framed: !$('framed').hidden };
      out.keep = $('keepsake').hidden ? '' : $('keepsake').textContent;
      out.banked = localStorage.getItem('pjcc.best.campaign-war');
      out.noted = JSON.parse(localStorage.getItem('pjcc.campaign.last.v1') || 'null');
      $('watch').click();
      out.on = $('screen-war').classList.contains('on');
      out.frames = __mc.replay.frames.length;
      out.first = $('war-say').textContent;
      $('war-back').click();
      out.last = { step: $('war-step').textContent, btn: $('war-back').textContent };
      $('war-back').click();
      out.backTo = $('screen-result').classList.contains('on');
      $('cont').click();
      out.frame = { shown: !$('frame').hidden, say: $('frame-say').textContent };
      $('frame').click();
      out.again = $('screen-war').classList.contains('on') && __mc.replay.then === 'home';
      $('war-back').click(); $('war-back').click();
      out.home = $('screen-home').classList.contains('on') && document.querySelectorAll('#mapbox .node').length === 10;
      return out;
    });
    ok(rep.result.watch && rep.result.framed, 'a won campaign offers its war back, and goes in the frame');
    /* ⭐ HIS #9 (11-16): a won war banks its honor, and the keepsake it opens is named */
    ok(rep.keep === 'New keepsake: The Banner. Sign in to claim it in your Collection.' && rep.banked === '1',
       '⭐ a first won campaign opens The Banner in your Collection, and says so  [' + (rep.keep || 'nothing said') + ']');
    /* ⭐ HIS #10 (11-16): the war that ended is noted for the front door's wire, the town's paper and Maxwell */
    const nt = rep.noted || {};
    ok(nt.won === true && nt.mode === 'solo' && nt.diff === 'medium' && nt.gens === 1 && nt.rounds >= 1 && Math.abs(nt.at - Date.now() / 1000) < 600 &&
       JSON.stringify(nt.foes) === '["Maxwell"]',
       '⭐ the war that ended is noted for the town to hear of: won, Medium, against whom, its round and when  [' + JSON.stringify(nt) + ']');
    const again = await E(() => {
      __mc.newCampaign('medium'); __mc.G.own = __mc.G.own.map(() => 'm'); __mc.campaignOver(true);
      const quiet = document.getElementById('keepsake').hidden;
      document.getElementById('cont').click();
      localStorage.removeItem('pjcc.best.campaign-war');
      return quiet;
    });
    ok(again, '…and a second win at the same honor says nothing new');

    /* ══ 11-16: THE SEA LANE (his #7) ══ Shogi Island strikes Sea-Board across the water, once a round */
    const sea = await E(() => {
      const $ = id => document.getElementById(id), out = {};
      __mc.newCampaign('medium'); const G = __mc.G;
      G.started = true; G.fog = true; G.ranks[7] = 5; G.toPlace = 0; G.atks = 3;
      __mc.show('screen-map'); __mc.setPhase('attack'); __mc.drawMap();
      out.lane = document.querySelectorAll('#links path.lane').length;
      out.fog = __mc.fogged(4);
      __mc.tapLand(7);
      out.hot = !!document.querySelector('#links path.lane.hot');
      out.tgt = document.querySelector('#mapbox .node[data-id="4"]').classList.contains('tgt');
      out.pick = $('map-say').textContent;
      return out;
    });
    await page.screenshot({ path: path.join(require('os').tmpdir(), 'campaign-lane.png') });
    const sea2 = await E(() => {
      const $ = id => document.getElementById(id), G = __mc.G, out = {};
      __mc.tapLand(4);
      out.went = !!__mc.PEND && __mc.PEND.from === 7 && __mc.PEND.to === 4 && G.sailed === true && G.atks === 2;
      out.at = { pend: __mc.PEND && [__mc.PEND.from, __mc.PEND.to], sailed: G.sailed, atks: G.atks, phase: G.phase, sel: G.sel, busy: G.busy, say: $('map-say').textContent.slice(0, 90) };
      /* back on the map with the lane spent: the far shore is no target, and a second crossing is refused */
      __mc.PEND = null; G.busy = false; G.pending = null; G.sel = -1; G.own[4] = 't'; G.ranks[7] = 5;
      __mc.show('screen-map'); __mc.setPhase('attack'); __mc.drawMap();
      __mc.tapLand(7);
      out.tgt = document.querySelector('#mapbox .node[data-id="4"]').classList.contains('tgt');
      out.cold = !document.querySelector('#links path.lane.hot');
      __mc.tapLand(4);
      out.say = $('map-say').textContent;
      out.atks = G.atks; out.pend = !!__mc.PEND;
      __mc.resetTurn();
      out.fresh = G.sailed === false;
      return out;
    });
    ok(sea.lane === 1 && sea.fog === false && sea.hot && sea.tgt && /Across the water: Sea-Board, once a round\./.test(sea.pick),
       '⭐ the sea lane is drawn, Sea-Board shows across the water, and picking Shogi Island lights it as a target  [' + sea.pick + ']');
    ok(sea2.went, '…striking across it starts the battle and spends the crossing with the attack  [' + JSON.stringify(sea2.at) + ']');
    ok(!sea2.tgt && sea2.cold && /One strike across the water a round\./.test(sea2.say) && sea2.atks === 2 && !sea2.pend,
       '…a second crossing that round is refused, and costs nothing  [' + sea2.say + ']');
    ok(sea2.fresh, '…and the next turn the water is open again');

    /* ══ 11-16: THE GENERALS PLAY THEIR OWN WAY (his #5) ══ Maxwell marches on a holding of yours cut off from the rest, and
       says his line for it. ⚠ The words are his: read from his table, never typed here.
       ⚠ A FRESH PAGE: the crossing above was cut short mid-roll, and its timers would fire into this one */
    await page.reload({ waitUntil: 'load' });
    await page.waitForFunction(() => !!window.__mc);
    await E(() => {
      __mc.newCampaign('medium'); const G = __mc.G;
      G.started = true; G.fog = false; G.own = G.own.map(() => 't'); G.own[5] = 'm'; G.ranks = G.ranks.map(() => 5); G.ranks[5] = 3;
      __mc.show('screen-map'); __mc.theirTurn('t');
    });
    await page.waitForFunction(() => __mc.G.hot && __mc.G.hot.to === 5, { timeout: 20000 }).catch(() => {});
    const op = await E(() => ({ hot: !!__mc.G.hot, line: document.getElementById('mx-line').textContent,
      want: __mc.MAXWELL_LINES.opening.map((s) => s.replace('{to}', 'Chess City').replace('{from}', __mc.LAND()[__mc.G.hot ? __mc.G.hot.from : 0].nm)) }));
    ok(op.hot && op.want.indexOf(op.line) >= 0, '⭐ Maxwell marches on a holding of yours cut off from the rest, and says his line for an opening  [' + op.line + ']');

    /* ══ 11-16: SCENARIOS WITH STARS (his #2) ══ the list, a Blitz played to its last round, and the stars kept */
    await page.reload({ waitUntil: 'load' });
    await page.waitForFunction(() => !!window.__mc);
    const sc1 = await E(() => {
      const $ = id => document.getElementById(id), out = {}, rows = () => [...document.querySelectorAll('#scen-list .scen')].map(b => b.dataset.id + ' ' + b.querySelector('.st').textContent);
      localStorage.removeItem('pjcc.campaign.stars.v1');
      $('scens').click();
      out.on = $('screen-scen').classList.contains('on'); out.rows = rows();
      document.querySelector('#scen-list .scen[data-id="blitz"]').click();
      const G = __mc.G;
      out.map = $('screen-map').classList.contains('on') && G.mode === 'scenario' && G.scen === 'blitz' && !G.fog;
      out.round = $('t-round').textContent; out.say = $('map-say').textContent;
      G.own[3] = 'm';
      out.goesOn = __mc.campaignCheck() === false && G.scenTook === 1 && !$('screen-result').classList.contains('on');
      G.round = 3; G.busy = false; __mc.startYourTurn();
      out.result = $('screen-result').classList.contains('on'); out.verdict = $('verdict').textContent; out.rs = $('result-say').textContent;
      out.kept = localStorage.getItem('pjcc.campaign.stars.v1');
      $('cont').click(); $('scens').click(); out.rows2 = rows();
      /* a stand lost: no star, and your best is untouched */
      document.querySelector('#scen-list .scen[data-id="last-stand"]').click();
      __mc.G.own[2] = 't'; __mc.campaignCheck();
      out.lost = { verdict: $('verdict').textContent, rs: $('result-say').textContent, kept: localStorage.getItem('pjcc.campaign.stars.v1') };
      $('cont').click(); $('scens').click();
      return out;
    });
    await page.screenshot({ path: path.join(require('os').tmpdir(), 'campaign-scenarios.png') });
    ok(sc1.on && sc1.rows.join() === 'last-stand ☆☆☆,blitz ☆☆☆,across ☆☆☆,storm ☆☆☆',
       '⭐ Scenarios opens a list of four, no stars yet  [' + sc1.rows.join(' · ') + ']');
    ok(sc1.map && sc1.round === '1 of 3' && /^Blitz: Take Checker Town and hold it to the end of round 3./.test(sc1.say),
       '…Blitz opens on its own map with its goal, counting its rounds  [' + sc1.round + ' · ' + sc1.say.slice(0, 60) + '…]');
    ok(sc1.goesOn && sc1.result && sc1.verdict === 'BLITZ  ★★★' && /★ Hold Checker Town · ★ Lose none of yours · ★ Take it in round 1/.test(sc1.rs),
       '…taken in round 1 and held to the end of round 3, nothing lost: three stars, each named  [' + sc1.verdict + ' · ' + sc1.rs + ']');
    ok(JSON.parse(sc1.kept || '{}').blitz === 3 && sc1.rows2[1] === 'blitz ★★★', '…kept as your best, and the list shows it');
    ok(sc1.lost.verdict === 'LAST STAND  ☆☆☆' && /Gauntlet Keep fell./.test(sc1.lost.rs) && JSON.parse(sc1.lost.kept || '{}')['last-stand'] === undefined,
       '…a stand whose keep falls ends there with no star, and keeps nothing  [' + sc1.lost.rs + ']');
    ok(rep.on && rep.frames >= 2 && rep.first === 'The opening.' && rep.last.step === rep.frames + ' of ' + rep.frames && rep.last.btn === 'Done' && rep.backTo,
       'the war plays back from the opening; Skip goes to its last map and Done to the result  [' + rep.frames + ' frames]');
    ok(rep.frame.shown && /^Your best war · Medium · won in round \d+$/.test(rep.frame.say) && rep.again && rep.home,
       'the home screen frames your best war, and it plays back from there  [' + rep.frame.say + ']');
    await E(() => { ['pjcc.town.v1', 'pjcc.campaign.best.v1', 'pjcc.campaign.map.flat'].forEach(k => localStorage.removeItem(k)); });
  } catch (e) {
    FAIL++; console.log('  ✗ FAIL  harness threw: ' + e.message);
  } finally {
    await browser.close(); srv.close();
  }
  ok(errs.length === 0, 'no page errors' + (errs.length ? ' -> ' + errs.slice(0, 3).join(' | ') : ''));
  console.log('\nRESULT: ' + (FAIL ? 'FAIL (' + FAIL + '/' + (PASS + FAIL) + ' checks failed)' : 'PASS (' + PASS + ' checks)'));
  process.exit(FAIL ? 1 : 0);
})();
