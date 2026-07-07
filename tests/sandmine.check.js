// Regression check for Sand Mine Depths (assets/games/pjcc_sandmine.html).
// Locks in:
//   - Princess always starts on the top row and descends.
//   - Early floors (1–2) gather the pawns up top with her (rows 1–2).
//   - Threatened squares are computed (drives the clearer red telegraph).
//   - SPACE arms/disarms the shovel.
//   - v3.0 points: captures pay piece value (+ streak) in points AND camp gold,
//     clearing a floor pays +10 + a speed bonus, and THE HARD WAY (8+ hops,
//     no shovel) pays +25 on top. The Weekly Race is gone.
//   run:  npm run test:sandmine
const path = require('path');
const { withGame, report } = require('./harness');

const GAME = path.join(__dirname, '..', 'assets', 'games', 'pjcc_sandmine.html');
const MARKER = 'requestAnimationFrame(loop);'; // last occurrence = bottom kick, after all defs
const HOOK = `
// Under file:// the absolute /assets/js/pjcc-pieces.js can't load, which would make
// the render loop throw on the first frame. We assert on game STATE, not pixels, so a
// no-op piece renderer keeps the loop alive without changing any logic under test.
if (typeof window.PJCCPieces === 'undefined') { window.PJCCPieces = { draw: function(){} }; }
window.__t = {
  g: function(){ return S ? {
    floor:S.floor, depth:S.depth, phase:S.phase, dead:S.dead,
    princess:{x:S.princess.x, y:S.princess.y},
    enemies:S.enemies.map(function(e){ return {t:e.t, x:e.x, y:e.y}; }),
    threats:S.threats.size, shovels:S.shovels, shovelArmed:S.shovelArmed,
    score:S.score, goldRun:S.goldRun, combo:S.combo, hp:S.hp,
    floorHops:S.floorHops, floorShovel:S.floorShovel
  } : null; },
  regenFloor: function(f){ if(S){ S.floor = f; newFloor(); } },
  giveShovel: function(){ if(S){ S.shovels++; updateShovelBtn(); } },
  // Place a single capturable piece on one of Princess's legal knight moves and
  // return the target + the pre-capture score/gold/combo. The shaft, loose gold
  // and relics are moved out of the way so ONLY the capture pays out.
  setupCapture: function(t){
    var mv = knightMoves(S.princess.x, S.princess.y);
    if(!mv.length) return null;
    var c = mv[0];
    S.gold = []; S.relics = [];
    if (S.shaft.x === c.x && S.shaft.y === c.y) S.shaft = { x: (c.x + 1) % COLS, y: c.y === ROWS - 1 ? ROWS - 2 : ROWS - 1 };
    S.enemies = [{ t: t || 'R', x: c.x, y: c.y }];
    computeThreats();
    return { x:c.x, y:c.y, score:S.score, gold:S.goldRun, combo:S.combo };
  },
  // Put the exit shaft on one of Princess's legal knight moves and stage the
  // per-floor scoring state (hops so far, shovel use, how long ago the floor
  // started in ms), so one hop triggers descend() with known inputs.
  setupDescend: function(o){
    var mv = knightMoves(S.princess.x, S.princess.y);
    if(!mv.length) return null;
    var c = mv[0];
    S.enemies = []; S.gold = []; S.relics = [];
    S.shaft = { x: c.x, y: c.y };
    S.floorHops = o.hops || 0; S.floorShovel = !!o.shovel;
    S.floorStart = Date.now() - (o.ago || 60000);
    computeThreats();
    return { x:c.x, y:c.y, score:S.score, floor:S.floor };
  },
  hop: function(x,y){ tryHop({ x:x, y:y }); }
};`;

(async () => {
  const { results, errors } = await withGame(GAME, MARKER, HOOK, async (page, ok, sleep) => {
    const G = () => page.evaluate(() => window.__t.g());

    await page.waitForSelector('#canvas');

    // v3.0: the Weekly Race is gone — no race button, no race mode.
    const raceBtn = await page.evaluate(() => document.getElementById('race-btn'));
    ok(raceBtn === null, 'the Weekly Race button is gone from the menu');

    await page.click('#start-btn');
    await sleep(400);

    let s = await G();
    ok(s && s.floor === 1, 'a run starts on floor 1  [floor=' + (s && s.floor) + ']');
    ok(s && s.princess.y === 0, 'Princess starts on the TOP row (y=0)  [y=' + (s && s.princess.y) + ']');
    ok(s && s.floorHops === 0 && s.floorShovel === false, 'per-floor scoring trackers start clean');

    // Floor 1 is all pawns — they must gather up top (rows 1–2) with Princess.
    // Regenerate the floor many times (normal mode uses Math.random) so the band
    // constraint is exercised, not just one lucky layout.
    let allPawnsTop = true, sawEnemies = false, botStat = { min: 99, max: 0 };
    for (let i = 0; i < 16; i++) {
      await page.evaluate(() => window.__t.regenFloor(1));
      const f = await G();
      f.enemies.forEach(e => {
        sawEnemies = true;
        if (e.t !== 'P') allPawnsTop = false;      // floor 1 pool is pawns only
        if (e.y > 2 || e.y < 1) allPawnsTop = false;
        botStat.min = Math.min(botStat.min, e.y);
        botStat.max = Math.max(botStat.max, e.y);
      });
    }
    ok(sawEnemies, 'floor 1 spawns enemies to test against');
    ok(allPawnsTop, 'floor 1 pawns all start up top in rows 1–2  [y-range ' + botStat.min + '–' + botStat.max + ']');

    // Princess re-enters at the top on every floor she reaches.
    let princessAlwaysTop = true;
    for (const fl of [1, 3, 5, 7, 9]) {
      await page.evaluate(f => window.__t.regenFloor(f), fl);
      const f = await G();
      if (f.princess.y !== 0) princessAlwaysTop = false;
    }
    ok(princessAlwaysTop, 'Princess always re-enters on the top row on deeper floors too');

    // Threats are computed so the clearer red telegraph has something to draw.
    await page.evaluate(() => window.__t.regenFloor(1));
    s = await G();
    ok(s.threats > 0, 'threatened squares are computed for the danger telegraph  [threats=' + s.threats + ']');

    // SPACE arms/disarms the shovel.
    await page.evaluate(() => window.__t.giveShovel());
    await page.focus('#canvas');
    await page.keyboard.press('Space'); await sleep(80);
    const armed = await G();
    ok(armed.shovelArmed === true, 'SPACE arms the shovel  [armed=' + armed.shovelArmed + ']');
    await page.keyboard.press('Space'); await sleep(80);
    const disarmed = await G();
    ok(disarmed.shovelArmed === false, 'SPACE again disarms the shovel  [armed=' + disarmed.shovelArmed + ']');

    // Capture reward — piece value in points AND camp gold, streak stacks a bonus.
    await page.evaluate(() => window.__t.regenFloor(1));
    const cap1 = await page.evaluate(() => window.__t.setupCapture('R'));   // a rook = 8 base
    await page.evaluate(c => window.__t.hop(c.x, c.y), cap1);
    await sleep(700);
    const a1 = await G();
    ok(a1.combo === 1 && a1.score === cap1.score + 8,
       'capturing a rook pays its value (+8 points) and opens a ×1 streak  [' + cap1.score + '->' + a1.score + ', combo=' + a1.combo + ']');
    ok(a1.goldRun === cap1.gold + 8,
       'the same capture banks +8 camp gold  [' + cap1.gold + '->' + a1.goldRun + ']');

    const cap2 = await page.evaluate(() => window.__t.setupCapture('R'));
    await page.evaluate(c => window.__t.hop(c.x, c.y), cap2);
    await sleep(700);
    const a2 = await G();
    ok(a2.combo === 2 && a2.score === cap2.score + 10,
       'a second capture chains the streak: ×2, +10 (8 base + 2 bonus)  [' + cap2.score + '->' + a2.score + ', combo=' + a2.combo + ']');

    // Descend scoring — hard way: the hop onto the shaft is the 8th, no shovel,
    // clock long expired (no speed bonus) → exactly +10 descent +25 hard way.
    const d1 = await page.evaluate(() => window.__t.setupDescend({ hops: 7, shovel: false, ago: 60000 }));
    await page.evaluate(c => window.__t.hop(c.x, c.y), d1);
    await sleep(500);
    const b1 = await G();
    ok(b1.floor === d1.floor + 1, 'hopping onto the exit ▼ descends a floor  [' + d1.floor + '->' + b1.floor + ']');
    ok(b1.score === d1.score + 35,
       'THE HARD WAY: 8 hops + no shovel pays +10 descent +25 bonus  [' + d1.score + '->' + b1.score + ']');

    // Shovel use on the floor disqualifies the hard way — descent points only.
    const d2 = await page.evaluate(() => window.__t.setupDescend({ hops: 9, shovel: true, ago: 60000 }));
    await page.evaluate(c => window.__t.hop(c.x, c.y), d2);
    await sleep(500);
    const b2 = await G();
    ok(b2.score === d2.score + 10,
       'using the shovel forfeits the hard-way bonus (+10 only)  [' + d2.score + '->' + b2.score + ']');

    // Speed bonus — a floor cleared ~3s in pays +10 + (20 - elapsed) points.
    const d3 = await page.evaluate(() => window.__t.setupDescend({ hops: 0, shovel: false, ago: 3000 }));
    await page.evaluate(c => window.__t.hop(c.x, c.y), d3);
    await sleep(500);
    const b3 = await G();
    const gain3 = b3.score - d3.score;
    ok(gain3 >= 24 && gain3 <= 27,
       'a fast floor pays the speed bonus (~+16 on top of +10)  [gained ' + gain3 + ']');
  });

  process.exit(report('Sand Mine Depths v3.0', results, errors) ? 0 : 1);
})();
