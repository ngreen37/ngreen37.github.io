// Regression check for Sky Run (assets/games/pjcc_sky_run.html).
//   run:  npm run test:skyrun
const path = require('path');
const { withGame, report } = require('./harness');

const GAME = path.join(__dirname, '..', 'assets', 'games', 'pjcc_sky_run.html');
const MARKER = 'refreshBest();'; // last occurrence = the bottom call, after all defs
const HOOK = `
window.__saves = [];
window.PJCC = { saveScore: function (g, s, x) { window.__saves.push({ g: g, s: s, seed: x && x.seed }); } };
window.PJCC_TIME = { dateStr: function () { return '2031-01-02'; } };
window.__renders = 0;
(function () { var r0 = render; window.render = function () { window.__renders++; return r0.apply(this, arguments); }; })();
window.__t = {
  g: function(){ var x=G; return x ? {
    score:x.score, region:x.region, rank:x.rank, hearts:x.hearts, time:x.time, paused:x.paused, over:x.over,
    tx:x.tx, ty:x.ty, enemies:x.enemies.length, bullets:x.bullets.length, tokens:x.tokens.length,
    boss: x.boss ? {hp:x.boss.hp, kind:x.boss.kind, vuln:x.boss.vuln, phase:x.boss.phase} : null,
    dog:x.dog.mode, bishopPwr:Math.ceil(x.pwr.bishop), focus:x.focus, phase:x.phase, renders: window.__renders
  } : null; },
  forceBoss: function(){ if(G && !G.boss){ G.toSpawn.length=0; G.enemies.length=0; G.waveIdx=G.wavesInRegion; startBoss(); } },
  openVuln:  function(){ if(G && G.boss){ G.boss.entering=false; G.boss.vuln=2.4; } },
  killBoss:  function(){ if(G && G.boss){ G.boss.entering=false; G.boss.hp=0; } },
  spawnToken:function(k){ if(G) G.tokens.push({kind:k||'bishop', x:G.px, y:120, bx:G.px, seed:0, vy:45, t:0}); }
};`;

(async () => {
  const { results, errors } = await withGame(GAME, MARKER, HOOK, async (page, ok, sleep) => {
    const G = () => page.evaluate(() => window.__t.g());

    await page.waitForSelector('#canvas');
    await page.click('#play-btn');
    await sleep(400);

    let s = await G();
    ok(s && s.rank === 0 && s.hearts === 3, 'run starts as Pawn (rank 0) with 3 hearts  [rank=' + (s && s.rank) + ' hearts=' + (s && s.hearts) + ']');

    await sleep(300); s = await G();
    ok(s.bullets > 0, 'Princess auto-fires  [bullets=' + s.bullets + ']');

    // Focus (#3)
    await page.keyboard.down('Shift'); await sleep(200); const sf = await G(); await page.keyboard.up('Shift');
    ok(sf.focus === true, 'holding Shift engages Focus');

    // Crockett fetch (#2)
    await page.evaluate(() => window.__t.spawnToken('bishop'));
    let fetched = false;
    for (let i = 0; i < 18; i++) { await sleep(200); if ((await G()).bishopPwr > 0) { fetched = true; break; } }
    ok(fetched, "Crockett fetches a power-up and delivers it (bishop power applied)");

    // Boss personality (#5)
    await page.evaluate(() => window.__t.forceBoss()); await sleep(700);
    s = await G();
    ok(s.boss && s.boss.kind === 'aim', "region-1 King has its own attack kind ('aim')  [kind=" + (s.boss && s.boss.kind) + ']');
    await page.evaluate(() => window.__t.openVuln()); await sleep(150);
    s = await G();
    ok(s.boss && s.boss.vuln > 0, 'boss opens a weak-point window  [vuln=' + (s.boss && s.boss.vuln) + ']');

    // He is a fight, not a wall: Princess meets the first King as a Pawn — one shot, one damage.
    const ttk = await page.evaluate(() => ({ hp: G.boss.maxhp, dps: 1 / RANK_FIRE_CD[0] }));
    ok(ttk.hp / ttk.dps < 25,
      "the region-1 King falls inside 25s of a Pawn's honest fire (he was a 73-second wall)  [" +
      ttk.hp + 'hp / ' + ttk.dps.toFixed(1) + 'dps = ' + (ttk.hp / ttk.dps).toFixed(0) + 's]');

    // Promotion arc (#1)
    const before = (await G()).rank;
    await page.evaluate(() => window.__t.killBoss()); await sleep(500);
    const after = await G();
    ok(after.rank === before + 1, 'clearing a region promotes Princess one rank  [' + before + ' -> ' + after.rank + ']');

    // ── A run ends ONCE ─────────────────────────────────────────────────────────
    const once = await page.evaluate(() => { startPlay('normal'); __saves.length = 0; gameOver(false); gameOver(false); return __saves.length; });
    ok(once === 1, 'gameOver called twice banks the score once  [saves=' + once + ']');
    const stop = await page.evaluate(() => {
      startPlay('normal'); __saves.length = 0; G.hearts = 1; G.inv = 0;
      G.toSpawn.length = 0; G.enemies.length = 0; G.waveIdx = G.wavesInRegion; startBoss(); G.boss.entering = false; G.boss.hp = 0;
      spawnEnemy('pawn', 200); G.enemies[G.enemies.length - 1].y = H + 60;
      update(0.016);
      return { saves: __saves.length, saved: __saves[0] && __saves[0].s, score: G.score, boss: !!G.boss };
    });
    ok(stop.saves === 1 && stop.saved === stop.score && stop.boss,
      'a death mid-frame stops the frame: the boss dying later in the same update cannot score after the bank  [saved=' + stop.saved + ' score=' + stop.score + ']');

    // ── Pause ───────────────────────────────────────────────────────────────────
    await page.evaluate(() => { openMenu(); startPlay('normal'); });
    await sleep(300);
    await page.click('#menu-btn');
    const p1 = await page.evaluate(() => ({ paused: G.paused, vis: !$('pause').classList.contains('hidden'), t: G.time, r: __renders }));
    await sleep(400);
    const p2 = await page.evaluate(() => ({ t: G.time, r: __renders }));
    ok(p1.paused && p1.vis, 'the Pause button pauses and shows the pause screen');
    ok(p2.t === p1.t, 'a paused run does not advance  [time ' + p1.t.toFixed(3) + ' -> ' + p2.t.toFixed(3) + ']');
    ok(p2.r === p1.r, 'nothing is drawn while paused  [renders +' + (p2.r - p1.r) + ']');
    await page.keyboard.press('KeyP');
    await sleep(300);
    const p3 = await page.evaluate(() => ({ paused: G.paused, t: G.time, r: __renders }));
    ok(!p3.paused && p3.t > p2.t && p3.r > p2.r, 'P resumes: time and drawing carry on  [renders +' + (p3.r - p2.r) + ']');
    const back = await page.evaluate(() => { const t0 = G.time; lastT = performance.now() + 50; frame(performance.now()); return G.time - t0; });
    ok(back >= 0, 'a frame stamped before the loop started does not run time backwards  [dt ' + back.toFixed(4) + ']');
    await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); });
    ok((await G()).paused, 'leaving the tab pauses the run');
    await page.evaluate(() => { delete document.hidden; resume(); window.dispatchEvent(new Event('blur')); });
    ok((await G()).paused, 'a mouse session pauses when the window loses focus');
    await page.evaluate(() => { __saves.length = 0; });
    await page.click('#end-btn');
    const e1 = await page.evaluate(() => ({ saves: __saves.length, eye: $('res-eye').textContent, res: !$('result').classList.contains('hidden'), r: __renders }));
    ok(e1.saves === 1 && e1.eye === 'Run ended' && e1.res, 'END RUN ends the run once, banks it, and says it was ended  [' + e1.eye + ', saves=' + e1.saves + ']');
    await sleep(300);
    ok((await page.evaluate(() => __renders)) === e1.r, 'nothing is drawn behind the result screen');

    // ── The focus dot is the hitbox ─────────────────────────────────────────────
    const hb = await page.evaluate(() => {
      startPlay('normal'); G.enemies.length = 0; G.toSpawn.length = 0; G.inv = 0; G.hearts = 5; G.ebullets.length = 0;
      const h0 = G.hearts;
      G.ebullets.push({ x: G.px + 14, y: G.py, vx: 0, vy: 0, r: 5 }); updateEBullets(0); const outside = G.hearts;
      G.inv = 0; G.ebullets.length = 0;
      G.ebullets.push({ x: G.px + 8, y: G.py, vx: 0, vy: 0, r: 5 }); updateEBullets(0); const inside = G.hearts;
      G.inv = 0; G.focus = true; const arcs = []; const a0 = ctx.arc;
      ctx.arc = function (x, y, r) { arcs.push(r); return a0.apply(this, arguments); }; drawPrincess(); ctx.arc = a0; G.focus = false;
      return { h0, outside, inside, dot: arcs.some(r => Math.abs(r - (CORE_R - 0.5)) < 0.01) };
    });
    ok(hb.outside === hb.h0, 'an enemy shot 14px from her center passes by the core');
    ok(hb.inside === hb.h0 - 1, 'an enemy shot 8px from her center lands');
    ok(hb.dot, 'the dot Focus draws is the size of the core the shots are tested against');

    // ── Keyboard flight ─────────────────────────────────────────────────────────
    // speed is measured against GAME time, so a slow machine cannot fail it
    const slope = async (axis) => {
      // headless Chrome can withhold frames for a few hundred ms; wait for game time to move
      const a = await page.evaluate(ax => ({ v: G[ax], t: G.time }), axis);
      let b = a;
      for (let i = 0; i < 60 && b.t - a.t < 0.2; i++) { await sleep(50); b = await page.evaluate(ax => ({ v: G[ax], t: G.time }), axis); }
      return b.t > a.t ? (b.v - a.v) / (b.t - a.t) : 0;
    };
    await page.evaluate(() => { G.enemies.length = 0; G.tx = G.px = 40; G.ty = G.py = 600; });
    await page.keyboard.down('ArrowRight'); await sleep(80);
    const vx = await slope('tx');
    await page.keyboard.up('ArrowRight'); await sleep(150);
    const k1 = (await G()).tx; await sleep(150); const k2 = (await G()).tx;
    ok(Math.abs(vx - 340) < 40, 'holding an arrow flies her at a steady speed  [' + vx.toFixed(0) + ' units/s' + ']');
    ok(Math.abs(k2 - k1) < 1, 'letting go of the arrow stops her');
    await page.keyboard.down('KeyW'); await sleep(80);
    const vy = await slope('ty');
    await page.keyboard.up('KeyW');
    ok(Math.abs(vy + 340) < 40, 'W flies her up too  [' + vy.toFixed(0) + ' units/s]');

    // ── Touch drags her by the finger's motion ─────────────────────────────────
    const cdp = await page.target().createCDPSession();
    await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 2 });
    const rect = await page.evaluate(() => { const r = canvas.getBoundingClientRect(); return { l: r.left, t: r.top, w: r.width, h: r.height }; });
    const t0 = await G();
    const sx = rect.l + rect.w * 0.2, sy = rect.t + rect.h * 0.3;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: sx, y: sy, id: 1 }] });
    await sleep(80);
    const tDown = await G();
    for (let i = 1; i <= 4; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: sx + 10 * i, y: sy, id: 1 }] }); await sleep(25); }
    await sleep(40);
    const tMove = await G();
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    ok(Math.abs(tDown.tx - t0.tx) < 1 && Math.abs(tDown.ty - t0.ty) < 1, 'a finger landing far from her does not teleport her  [dx=' + (tDown.tx - t0.tx).toFixed(1) + ']');
    const want = 40 * (440 / rect.w);
    ok(Math.abs((tMove.tx - tDown.tx) - want) < 3, 'she moves by the distance the finger moved  [' + (tMove.tx - tDown.tx).toFixed(1) + ' of ' + want.toFixed(1) + ']');
    await page.evaluate(() => window.dispatchEvent(new Event('blur')));
    ok(!(await G()).paused, 'a touch session does not pause on a window blur');

    // ── The Daily is the same run for everyone ─────────────────────────────────
    const dy = await page.evaluate(() => {
      function waveXs(withAdds) {
        newGame('daily');
        if (withAdds) {
          G.region = 4; startBoss(); G.boss.entering = false; G.boss.vulnCd = 99; G.boss.fireCd = 99;
          G.boss.addCd = 0; updateBoss(0.001); G.boss.addCd = 0; updateBoss(0.001);
          G.enemies.length = 0; G.boss = null; G.region = 1;
        }
        const out = [];
        for (let i = 0; i < 10; i++) { spawnEnemy('pawn'); out.push(Math.round(G.enemies[G.enemies.length - 1].x)); }
        return out.join(',');
      }
      function drops() { newGame('daily'); const o = []; for (let i = 0; i < 300; i++) { Math.random(); o.push(dropRoll() || '-'); } return o; }
      const plain = waveXs(false), withAdds = waveXs(true), d1 = drops(), d2 = drops();
      newGame('daily'); const texts = []; const f0 = ctx.fillText;
      ctx.fillText = function (t) { texts.push(String(t)); return f0.apply(this, arguments); }; drawHUD(); ctx.fillText = f0;
      __saves.length = 0; gameOver(false);
      return { plain, withAdds, same: d1.join() === d2.join(), dropN: d1.filter(x => x !== '-').length,
               day: G.day, label: texts.some(t => t.indexOf('DAILY 1/2') >= 0), seed: __saves[0] && __saves[0].seed, game: __saves[0] && __saves[0].g };
    });
    ok(dy.plain === dy.withAdds, 'a boss calling reinforcements does not reorder the waves that follow  [' + dy.plain.slice(0, 23) + '…]');
    ok(dy.same && dy.dropN > 10 && dy.dropN < 50, 'drops are decided by the kill count, identically every time  [' + dy.dropN + ' drops in 300 kills]');
    ok(dy.day === '2031-01-02' && dy.label, 'the Daily runs on the town date and the HUD prints it  [' + dy.day + ']');
    ok(dy.game === 'sky-run-daily' && dy.seed === '2031-01-02', 'a Daily score is banked with its day');

    // ── The HUD does not collide with itself ───────────────────────────────────
    async function hudAt(width) {
      await page.setViewport({ width: width, height: 820 });
      await sleep(80);
      return page.evaluate(() => {
        startPlay('normal'); G.pwr.queen = 10; G.mult = 2; G.score = 123456;
        G.toSpawn.length = 0; G.waveIdx = G.wavesInRegion; startBoss(); G.boss.entering = false;
        const texts = []; const f0 = ctx.fillText;
        ctx.fillText = function (t, x, y) { texts.push({ t: String(t), x, y, w: ctx.measureText(String(t)).width }); return f0.apply(this, arguments); };
        drawHUD(); ctx.fillText = f0;
        const timer = texts.find(o => /^\d+s$/.test(o.t)), combo = texts.find(o => /combo/.test(o.t));
        const br = $('menu-btn').getBoundingClientRect(), cr = canvas.getBoundingClientRect();
        return { timerY: timer && timer.y, region: texts.some(o => o.t === curRegion().name),
                 comboRight: combo ? combo.x + combo.w : -1, comboTop: combo ? combo.y - 7 : -1,
                 btnLeft: (br.left - cr.left) * W / cr.width, btnBottom: (br.bottom - cr.top) * H / cr.height };
      });
    }
    for (const w of [480, 320]) {
      const hud = await hudAt(w);
      ok(hud.timerY >= 70, w + 'px: power timers print below the boss bar  [y=' + hud.timerY + ']');
      ok(hud.comboRight > 0 && (hud.comboRight < hud.btnLeft || hud.comboTop > hud.btnBottom),
        w + 'px: the combo never sits under the Pause button  [combo ends ' + hud.comboRight.toFixed(0) + ', button starts ' + hud.btnLeft.toFixed(0) + ']');
      if (w === 480) ok(!hud.region, 'the region line stands down while the boss bar names the region');
    }
    await page.setViewport({ width: 480, height: 820 });
    const hearts = await page.evaluate(() => {
      function count(mode) { newGame(mode); const hs = new Set([heartSpr(true), heartSpr(false)]); let n = 0; const b0 = blit;
        window.blit = function (sp) { if (hs.has(sp)) n++; return b0.apply(this, arguments); }; drawHUD(); window.blit = b0; return n; }
      return { endless: count('endless'), normal: count('normal') };
    });
    ok(hearts.endless === 1 && hearts.normal === 3, 'Endless draws the one heart it has, not four empty ones  [endless=' + hearts.endless + ' normal=' + hearts.normal + ']');

    // ── When the King falls, his men fall with him ─────────────────────────────
    const fall = await page.evaluate(() => {
      startPlay('normal'); G.toSpawn.length = 0; G.enemies.length = 0; G.waveIdx = G.wavesInRegion; startBoss(); G.boss.entering = false;
      spawnEnemy('pawn', 100); spawnEnemy('rook', 200); spawnEnemy('knight', 300); G.enemies.forEach(e => { e.y = 300; });
      const s0 = G.score; G.boss.hp = 0; updateBoss(0.001);
      return { left: G.enemies.length, gained: G.score - s0 };
    });
    ok(fall.left === 0 && fall.gained === 500 + 10 + 30 + 20, 'a fallen King takes his men with him, and they score  [left=' + fall.left + ' +' + fall.gained + ']');

    // ── Every piece but the pawn shoots back ───────────────────────────────────
    const fire = await page.evaluate(() => { startPlay('normal'); return ['pawn', 'bishop', 'knight', 'rook', 'queen'].map((t) => {
      G.enemies.length = 0; G.ebullets.length = 0; spawnEnemy(t, 200); const e = G.enemies[0];
      e.y = 100; e.vy = 0; e.pat = 'straight'; e.shootCd = 0; updateEnemies(0.001); return G.ebullets.length; }).join(''); });
    ok(fire === '01111', 'every piece but the pawn shoots back  [pawn→queen ' + fire + ']');

    // ── A summoned pawn that finds nothing to hit promotes ─────────────────────
    const promo = await page.evaluate(() => {
      startPlay('normal'); G.toSpawn.length = 0; G.enemies.length = 0; G.boss = null;
      G.pawns = 1; const s0 = G.score; summon();
      const p = G.ppawns[0]; p.delay = 0;
      for (let i = 0; i < 2000 && G.ppawns.length; i++) updatePawns(1 / 60);
      const up = { queens: G.queens.length, y: G.queens[0] ? Math.round(G.queens[0].y) : -1, gained: G.score - s0 };
      // …and one that DOES find something still spends itself on it
      G.queens.length = 0; G.ppawns.length = 0; G.pawns = 1; summon();
      spawnEnemy('rook', 220); G.enemies[0].y = 130; const hp0 = G.enemies[0].hp;
      const q = G.ppawns[0]; q.delay = 0; q.tx = 220; q.ty = 130;
      for (let i = 0; i < 600 && G.ppawns.length; i++) updatePawns(1 / 60);
      up.blast = G.enemies.length ? hp0 - G.enemies[0].hp : hp0;
      up.queensAfter = G.queens.length;
      return up;
    });
    ok(promo.queens === 1 && promo.y === 58 && promo.gained >= 150,
      'a summoned pawn with nothing to hit flies on and is promoted on the last rank  [queens=' + promo.queens + ' y=' + promo.y + ' +' + promo.gained + ']');
    ok(promo.blast > 0 && promo.queensAfter === 0,
      '…and one with a target still spends itself on the blast  [-' + promo.blast + 'hp, promoted=' + promo.queensAfter + ']');

    // ── Crockett learns, and the town's weather reaches the flight ─────────────
    const dog = await page.evaluate(() => {
      startPlay('normal');
      const learned = [];
      for (let r = 1; r <= 5; r++) { G.waveIdx = G.wavesInRegion; G.enemies.length = 0; G.toSpawn.length = 0;
        startBoss(); G.boss.entering = false; G.boss.hp = 0; updateBoss(0.001); learned.push(G.tricks);
        if (G.phase === 'interstitial') { G.interT = 0; update(0.001); } }
      // GUARD: a shot on the dog is eaten, once, then he needs a moment
      startPlay('normal'); G.tricks = 2; G.guardCd = 0; G.inv = 99;
      G.ebullets.length = 0;
      G.ebullets.push({ x: G.dog.x, y: G.dog.y, vx: 0, vy: 0, r: 5 });
      updateEBullets(0.001); const ate = G.ebullets.length;
      G.ebullets.push({ x: G.dog.x, y: G.dog.y, vx: 0, vy: 0, r: 5 });
      updateEBullets(0.001); const second = G.ebullets.length;
      return { learned: learned.join(''), ate: ate, second: second, names: TRICKS.map((t) => t.name).join(',') };
    });
    ok(dog.learned === '12344', 'Crockett picks up one trick for every region she clears, and stops at four  [' + dog.learned + ']');
    ok(dog.ate === 0 && dog.second === 1, '⭐ GUARD eats one shot, then has to shake it off  [' + dog.ate + ' then ' + dog.second + ']');

    const wx = await page.evaluate(() => {
      const out = {};
      window.PJCC_TIME = { dateStr: () => '2031-01-02', weather: () => ({ kind: 'rain' }), phase: () => 'day', skyKind: () => null };
      startPlay('normal'); out.kind = G.sky.kind;
      G.tx = 200; const x0 = G.tx; for (let i = 0; i < 60; i++) update(1 / 60); out.pushed = G.tx > x0;
      startPlay('daily'); out.dailyKind = G.sky.kind;
      G.tx = 200; const d0 = G.tx; for (let i = 0; i < 60; i++) update(1 / 60); out.dailyPushed = G.tx > d0;
      window.PJCC_TIME = { dateStr: () => '2031-01-02' };   // a clock with no weather must not throw
      startPlay('normal'); out.bare = G.sky.kind;
      return out;
    });
    ok(wx.kind === 'rain' && wx.pushed, "rain over the town leans on the ship  [" + wx.kind + ', pushed=' + wx.pushed + ']');
    ok(wx.dailyKind === 'clear' && !wx.dailyPushed,
      '⚠⚠ …but never in the Daily: one flight for everyone, whatever hour they fly it  [' + wx.dailyKind + ']');
    ok(wx.bare === 'clear', '…and an older town clock with no weather reads as clear, not as a crash');

    // ── Assist is marked, and cannot stand in for a straight flight ────────────
    const as = await page.evaluate(() => {
      const out = {}; __saves.length = 0;
      try { localStorage.setItem('pjcc.skyrun.best.v1', '7777'); localStorage.setItem('pjcc.skyrun.assistbest.v1', '0'); } catch (e) {}
      setAssist(true); startPlay('normal');
      out.hearts = G.hearts; out.assist = G.assist;
      G.ebullets.length = 0; G.ebullets.push({ x: 10, y: 10, vx: 100, vy: 0, r: 4 });
      updateEBullets(1); out.moved = Math.round(G.ebullets[0].x);
      G.score = 99999; gameOver(false);
      out.slug = __saves[__saves.length - 1].g;
      out.plainBest = localStorage.getItem('pjcc.skyrun.best.v1');
      out.assistBest = localStorage.getItem('pjcc.skyrun.assistbest.v1');
      setAssist(false); startPlay('normal'); out.offHearts = G.hearts;
      return out;
    });
    ok(as.hearts === 5 && as.offHearts === 3 && as.moved === 82,
      'assist gives her two more hearts and slows what is coming at her  [' + as.hearts + ' hearts, bullet ' + as.moved + '/100]');
    ok(as.slug === 'sky-run-assist' && as.plainBest === '7777' && as.assistBest === '99999',
      '⭐ …and an assisted run banks under its own name and never touches the straight best  [' + as.slug + ', best still ' + as.plainBest + ']');

    // ── COPY PNG copies, and a refused clipboard still hands over the file ──────
    const png = await page.evaluate(async () => {
      // 3s was not enough on a cold canvas — this went red once with the PNG perfectly fine
      const wait = async (from) => { for (let i = 0; i < 240 && $('png-btn').textContent === from; i++) await new Promise((r) => setTimeout(r, 50)); };
      let type = null, saved = 0; const click0 = HTMLAnchorElement.prototype.click;
      HTMLAnchorElement.prototype.click = function () { if (this.download) saved++; };
      startPlay('normal'); G.score = 42; gameOver(false);
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { write: async (items) => { type = (await items[0].getType('image/png')).type; } } });
      $('png-btn').click(); await wait('📋 COPY PNG'); const ok1 = $('png-btn').textContent, saved1 = saved;
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { write: () => Promise.reject(new Error('denied')) } });
      $('png-btn').textContent = '📋 COPY PNG'; $('png-btn').click(); await wait('📋 COPY PNG'); const ok2 = $('png-btn').textContent;
      HTMLAnchorElement.prototype.click = click0;
      return { type, ok1, saved1, ok2, saved };
    });
    ok(png.type === 'image/png' && png.ok1 === '✓ COPIED' && png.saved1 === 0, 'COPY PNG puts a PNG on the clipboard and says so  [' + png.type + ', ' + png.ok1 + ']');
    ok(png.ok2 === '✓ SAVED' && png.saved - png.saved1 === 1, '…and a refused clipboard downloads the file instead  [' + png.ok2 + ', saved=' + png.saved + ']');

    // ── The home screen tells the truth about your bests ───────────────────────
    const bests = await page.evaluate(() => {
      localStorage.setItem(BEST_KEY, '1200'); localStorage.setItem(BEST_KEY_D, JSON.stringify({ d: dayKey(), v: 340 })); localStorage.setItem(BEST_KEY_E, '90');
      localStorage.setItem(BEST_KEY_A, '0');
      openMenu(); const line = $('best-line').textContent;
      localStorage.setItem(BEST_KEY_A, '404'); openMenu(); const withAssist = $('best-line').textContent;
      localStorage.setItem(BEST_KEY_A, '0');
      startPlay('normal'); G.prevBest = G.best = 50; G.score = 50; gameOver(false); const tie = $('res-msg').textContent;
      startPlay('normal'); G.prevBest = G.best = 50; G.score = 51; gameOver(false); const beat = $('res-msg').textContent;
      return { line, withAssist, tie: /new best/.test(tie), beat: /new best/.test(beat) };
    });
    ok(bests.line === 'Best: 1200 · today 340 · endless 90', 'the home screen shows all three bests  [' + bests.line + ']');
    ok(bests.withAssist === 'Best: 1200 · today 340 · endless 90 · assist 404',
      '…and an assist best is shown as its own line, never folded into the straight one  [' + bests.withAssist + ']');
    ok(!bests.tie && bests.beat, '"new best" only when the old best was actually beaten');

    // ── Sound, the sprite cache, and the density ───────────────────────────────
    // the same scene stamped at shifted positions: a key that leaked a position would grow the cache
    const spr = await page.evaluate(() => {
      startPlay('normal'); G.rank = 4;
      function scene(off) {
        G.bullets.length = 0; G.enemies.length = 0; G.tokens.length = 0;
        for (let i = 0; i < 60; i++) shoot(20 + i * 6 + off, 100 + i * 8, 0, 0, i % 3 === 0, { bishop: i % 3 === 1, r: 4 + (i % 4) });
        ['pawn', 'bishop', 'knight', 'rook', 'queen'].forEach((t, i) => spawnEnemy(t, 40 + i * 70 + off));
        POWERS.forEach((k, i) => G.tokens.push({ kind: k, x: 80 + i * 90 + off, y: 200, bx: 80 + i * 90 + off, seed: 0, vy: 0, t: 0.3 }));
        G.dog.mode = 'carry'; G.dog.carry = 'queen'; render(); G.dog.mode = 'follow'; G.dog.carry = null; render();
      }
      scene(0); const early = SPR.size; scene(3.7); scene(11.3);
      return { early, late: SPR.size };
    });
    ok(spr.early > 10 && spr.late === spr.early, 'the sprite cache stops growing: a shifted scene adds nothing  [' + spr.early + ' -> ' + spr.late + ' sprites]');
    const shakeOn = await page.evaluate(() => { G.shake = 10; let n = 0; const t0 = ctx.translate;
      ctx.translate = function () { n++; return t0.apply(this, arguments); }; render(); ctx.translate = t0; return n; });
    ok(shakeOn > 0, 'the screen shakes when motion is allowed');
    await page.evaluate(() => openMenu());
    await page.keyboard.press('KeyM');
    const m1 = await page.evaluate(() => ({ on: sndOn, ls: localStorage.getItem('pjcc.skyrun.sound'), label: $('snd-menu').textContent }));
    ok(!m1.on && m1.ls === '0' && /Muted/.test(m1.label), 'M mutes, and the button says so  [' + m1.label + ']');

    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.setViewport({ width: 480, height: 820, deviceScaleFactor: 2 });
    await page.reload({ waitUntil: 'load' });
    const rl = await page.evaluate(() => { startPlay('normal'); G.shake = 10; let n = 0; const t0 = ctx.translate;
      ctx.translate = function () { n++; return t0.apply(this, arguments); }; render(); ctx.translate = t0;
      return { sound: sndOn, label: $('snd-menu').textContent, calm: CALM, n, bw: canvas.width, bh: canvas.height }; });
    ok(!rl.sound && /Muted/.test(rl.label), 'the mute is remembered across a reload');
    ok(rl.calm && rl.n === 0, 'reduced motion: the screen does not shake  [translates=' + rl.n + ']');
    ok(rl.bw === 880 && rl.bh === 1280, 'on a 2x screen the canvas is drawn at 2x  [' + rl.bw + 'x' + rl.bh + ']');
  });

  process.exit(report('Sky Run v2.0', results, errors) ? 0 : 1);
})();
