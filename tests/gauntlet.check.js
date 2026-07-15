// Regression check for The Gauntlet (assets/games/pjcc_gauntlet.html).
// Drives the REAL game in headless Chrome. Locks in the 2026-07-05 UX rules:
//   - Resume: mid-climb "Continue" jumps straight to the CURRENT opponent's boss card
//     (not the tower list); fresh + crowned players open the full tower.
//   - Colours are drawn at random each match, and the colour the boss card ANNOUNCES is
//     the colour actually played.
// (Engine correctness — perft, posKey/threefold — is covered separately by chess.check.js.)
//   run:  npm run test:gauntlet
const path = require('path');
const { withGame, report } = require('./harness');

const GAME = path.join(__dirname, '..', 'assets', 'games', 'pjcc_gauntlet.html');
const MARKER = 'loop();'; // the final bottom kick, after every def
const HOOK = `window.__t = { G:function(){return G;}, LADDER:LADDER };`;

const PKEY = 'pjcc.gauntlet.v2';

(async () => {
  const { results, errors } = await withGame(GAME, MARKER, HOOK, async (page, ok, sleep) => {
    const visible = id => page.evaluate(i => { const e = document.getElementById(i); return !!e && !e.classList.contains('hidden'); }, id);
    const text = id => page.evaluate(i => (document.getElementById(i) || {}).textContent || '', id);
    const seed = async prog => {
      await page.evaluate((k, p) => { if (p) localStorage.setItem(k, p); else localStorage.removeItem(k); }, PKEY, prog ? JSON.stringify(prog) : null);
      await page.reload({ waitUntil: 'load' });
      await sleep(300);
    };
    const MID = { unlocked: 3, beaten: { 0: true, 1: true, 2: true } };  // cleared 3 → current = floor index 3

    const names = await page.evaluate(() => window.__t.LADDER.map(r => r.name));

    // --- Resume: mid-climb Continue → current opponent's boss card ---
    await seed(MID);
    ok(await visible('menu-screen'), 'menu shows on load');
    const label = await text('play-btn');
    ok(label.indexOf('FLOOR 4') >= 0, 'menu button reads "CONTINUE — FLOOR 4"  [' + label + ']');
    await page.click('#play-btn'); await sleep(200);
    ok(await visible('boss-screen'), 'Continue opens the BOSS CARD (jump straight to your opponent)');
    ok(!(await visible('ladder-screen')), 'Continue does NOT dump you on the tower list');
    ok((await text('boss-name')) === names[3], 'boss card = current floor opponent (' + names[3] + ')  [' + (await text('boss-name')) + ']');
    ok((await text('boss-eye')).indexOf('Floor 4') >= 0, 'boss eyebrow says Floor 4');

    // --- Fresh climber sees the whole tower first ---
    await seed(null);
    ok((await text('play-btn')).indexOf('TOWER') >= 0, 'fresh button reads "ENTER THE TOWER"');
    await page.click('#play-btn'); await sleep(200);
    ok(await visible('ladder-screen'), 'fresh climber lands on the tower list (orientation)');

    // --- Crowned player goes to the tower to rematch anyone ---
    // "Crowned" = the TEN public floors beaten (2026-07-15 Nate: "Crowned is still the
    // first ten"). The three secret floors are optional bonus beyond the crown, so a
    // champion lands on the whole tower to choose (rematch, or take on a secret floor).
    const all = {}; for (let n = 0; n < 10; n++) all[n] = true;
    await seed({ unlocked: 10, beaten: all });
    await page.click('#play-btn'); await sleep(200);
    ok(await visible('ladder-screen'), 'crowned player opens the tower (rematch anyone)');

    // --- Random colours: the announced colour is the colour actually played ---
    let mism = 0, sawW = 0, sawB = 0;
    for (let k = 0; k < 14; k++) {
      await seed(MID);
      await page.click('#play-btn'); await sleep(120);          // boss card draws the colour
      const announced = /White/.test(await text('boss-note')) ? 'w' : 'b';
      announced === 'w' ? sawW++ : sawB++;
      await page.evaluate(() => { const b = document.querySelector('#boss-row .btn-gold'); b && b.click(); });
      await sleep(140);
      const pc = await page.evaluate(() => (window.__t.G() || {}).pc);
      if (pc !== announced) mism++;
    }
    ok(mism === 0, 'boss-card colour note matched the played colour every start (mismatches: ' + mism + ')');
    ok(sawW > 0 && sawB > 0, 'colours actually randomise across starts  [W:' + sawW + ' B:' + sawB + ']');
  }, { rewriteAssets: true });   // the Gauntlet loads the REAL chess engine via /assets/*

  process.exit(report('The Gauntlet — resume + random colours', results, errors) ? 0 : 1);
})();
