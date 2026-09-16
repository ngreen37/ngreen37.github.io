#!/usr/bin/env node
/*! tests/sim-skyrun.js — HOW HARD IS SKY RUN, MEASURED
 * A bot plays full normal runs through update() and prints how far it gets. A MEASUREMENT, not a
 * gate. REACT=seconds between re-plans: 0 is inhuman, 0.25 is roughly a person.
 * 2026-09-15 baseline at REACT=0.25, 3 hearts: 31% wins; boss fights 14 / 18.5 / 19 / 34 / 41s.
 *   (94% then 69% were measured on 5 hearts, before the cut — don't compare them to a 3-heart run.)
 *   npm run sim:skyrun -- [runs]      REACT=0.25 npm run sim:skyrun -- 16
 */
const path = require('path');
const puppeteer = require('puppeteer-core');
const { findChrome } = require('./harness');
const FILE = path.join(__dirname, '..', 'assets', 'games', 'pjcc_sky_run.html');
const RUNS = +(process.argv[2] || 40);

(async () => {
  const browser = await puppeteer.launch({ executablePath: findChrome(), headless: 'new' });
  const page = await browser.newPage();
  await page.evaluateOnNewDocument(() => {
    window.PJCC = { saveScore() {} };
    window.PJCC_TIME = { dateStr: () => '2031-01-02' };
  });
  await page.goto('file:///' + FILE.replace(/\\/g, '/'));
  const REACT = +(process.env.REACT || 0);
  const out = await page.evaluate((RUNS, REACT) => {
    const DT = 1 / 60, MAXT = 1200; let plan = 0;
    const HOR = 0.7, STEPS = 28;
    function danger(cx, cy) {
      let d = 0;
      const P = { x: G.px, y: G.py }, lerp = G.focus ? 8 : 14;
      for (let s = 1; s <= STEPS; s++) {
        const tau = (s / STEPS) * HOR, k = 1 - Math.exp(-lerp * tau);
        const px = P.x + (cx - P.x) * k, py = P.y + (cy - P.y) * k;
        for (const b of G.ebullets) {
          const bx = b.x + b.vx * tau, by = b.y + b.vy * tau, lim = b.r + CORE_R + 6;
          const q = (bx - px) ** 2 + (by - py) ** 2;
          if (q < lim * lim) d += 100 / (tau + 0.1);
        }
        for (const e of G.enemies) {
          const ey = e.y + e.vy * tau, lim = e.r + G.pr + 8;
          const q = (e.x - px) ** 2 + (ey - py) ** 2;
          if (q < lim * lim) d += 60 / (tau + 0.1);
        }
      }
      return d;
    }
    function steer() {
      let aimX = W / 2, low = null;
      for (const e of G.enemies) if (e.y > 0 && (!low || e.y > low.y)) low = e;
      if (low) aimX = low.x; else if (G.boss) aimX = G.boss.x;
      let best = null, bs = 1e18;
      for (let dx = -140; dx <= 140; dx += 20) for (const dy of [-50, 0, 40]) {
        const cx = clamp(G.px + dx, 16, W - 16), cy = clamp(H - 90 + dy, 60, H - 24);
        const s = danger(cx, cy) + Math.abs(cx - aimX) * 0.05 + Math.abs(cy - (H - 90)) * 0.02;
        if (s < bs) { bs = s; best = [cx, cy]; }
      }
      G.tx = best[0]; G.ty = best[1];
      G.focus = !!G.boss && G.enemies.length <= 2 && bs < 5;
      if (G.pawns >= 2 && (G.boss || G.enemies.length >= 5)) summon();
    }
    const runs = [];
    for (let r = 0; r < RUNS; r++) {
      newGame('normal');
      const heartsAtBoss = {}, bossT = {}, causes = { leak: 0, shot: 0, body: 0 };
      let lastRegion = 1, bossStart = 0;
      while (G.running && G.time < MAXT) {
        plan -= DT; if (plan <= 0) { steer(); plan = REACT; }
        const hadBoss = !!G.boss, hb = G.hearts, eb = G.ebullets.length, en = G.enemies.length;
        update(DT);
        if (G.hearts < hb) { if (G.ebullets.length < eb && G.inv > 0.5) causes.shot++; else if (G.inv > 0.5) causes.body++; else causes.leak++; }
        if (!hadBoss && G.boss) { heartsAtBoss[G.region] = G.hearts; bossStart = G.time; }
        if (hadBoss && !G.boss) bossT[lastRegion] = +(G.time - bossStart).toFixed(1);
        lastRegion = G.region;
      }
      runs.push({ causes, wave: G.waveIdx, bossHp: G.boss ? Math.round(G.boss.hp) + '/' + G.boss.maxhp : '-', won: G.over && G.hearts > 0, region: G.region, t: Math.round(G.time), score: G.score, hab: heartsAtBoss, bossT });
    }
    return runs;
  }, RUNS, REACT);
  await browser.close();
  const n = out.length, wins = out.filter((r) => r.won).length;
  const reach = [1, 2, 3, 4, 5].map((k) => out.filter((r) => r.region >= k || r.won).length);
  const med = (a) => { a = a.slice().sort((x, y) => x - y); return a[a.length >> 1]; };
  const hab = [1, 2, 3, 4, 5].map((k) => { const v = out.map((r) => r.hab[k]).filter((x) => x != null); return v.length ? (v.reduce((a, b) => a + b, 0) / v.length).toFixed(1) : '-'; });
  const bt = [1, 2, 3, 4, 5].map((k) => { const v = out.map((r) => r.bossT[k]).filter((x) => x != null); return v.length ? med(v) : '-'; });
  console.log('REACT ' + REACT + 's', 'runs', n, '| wins', wins, '(' + Math.round(100 * wins / n) + '%)');
  console.log('reached region 1..5:', reach.join(' / '));
  console.log('died in region:', [1, 2, 3, 4, 5].map((k) => out.filter((r) => !r.won && r.region === k).length).join(' / '));
  console.log('avg hearts entering boss 1..5:', hab.join(' / '));
  console.log('median boss fight s 1..5:', bt.join(' / '));
  const sum = (k) => out.reduce((a, r) => a + r.causes[k], 0);
  console.log('hearts lost to leak/shot/body:', sum('leak'), '/', sum('shot'), '/', sum('body'));
  if (process.env.DBG) out.slice(0, 5).forEach((r) => console.log(JSON.stringify({ c: r.causes, t: r.t, reg: r.region, wave: r.wave, boss: r.bossHp })));
  console.log('median run time', med(out.map((r) => r.t)) + 's, median score', med(out.map((r) => r.score)));
})();
