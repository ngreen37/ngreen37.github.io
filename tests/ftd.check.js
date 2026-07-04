// Regression check for Follow the Dog (assets/games/pjcc_space_run.html).
// Locks in the "fair-but-strict" miss fix: no instant heart loss, no docking while
// riding, but a genuinely-missed off-lane piece still costs exactly one heart.
//   run:  npm run test:ftd
const path = require('path');
const { withGame, report } = require('./harness');

const GAME = path.join(__dirname, '..', 'assets', 'games', 'pjcc_space_run.html');
const MARKER = 'initGame();loop();';
const HOOK = `
window.__t = {
  g: function(){ if(!g) return null; return {dist:g.dist, score:g.score, hp:g.hp, dead:g.dead, groups:g.groups.length, onPiece:g.player.onPiece}; },
  stopCeo:    function(){ if(g) g.ceo.throwTimer = 1e9; },
  clearGroups:function(){ if(g) g.groups.length = 0; },
  resetPlayer:function(){ if(g){ g.player.ridingGroup=null; g.player.onPiece=false; } },
  spawnOffLane:function(){ if(g){ var l=(g.player.targetLane+2)%LANES; g.groups.push(buildTrack('P', l, FAR*0.72)); } }
};`;

(async () => {
  const { results, errors } = await withGame(GAME, MARKER, HOOK, async (page, ok, sleep) => {
    const G = () => page.evaluate(() => window.__t.g());

    await page.waitForSelector('#c');
    await page.click('#startBtn');

    // No input. The starter rook (lane 1) must NOT dock a heart on spawn (was hp 2).
    await sleep(300); let s = await G();
    ok(s.hp === 3, 'no instant heart loss on the starter rook  [hp=' + s.hp + ']   (regression: was 2)');

    // Ride the lane-1 rooks for ~2.5s with no input: hp must hold and score must rise.
    await sleep(2500); s = await G();
    ok(s.hp === 3, 'no heart lost while riding a track  [hp=' + s.hp + ']');
    ok(s.score >= 1, 'landing on a track scores  [score=' + s.score + ']');
    ok(!s.dead, 'survives with no input (regression: used to die in ~5s)');

    // Fair-but-strict: an off-lane piece you cannot reach costs exactly one heart, once.
    await page.evaluate(() => { window.__t.stopCeo(); window.__t.clearGroups(); window.__t.resetPlayer(); window.__t.spawnOffLane(); });
    const hp0 = (await G()).hp;
    let dropped = null;
    for (let i = 0; i < 60; i++) { await sleep(150); const d = await G(); if (d.hp < hp0) { dropped = hp0 - d.hp; break; } }
    // give it a moment to be sure it doesn't keep dropping from the same piece
    await sleep(600); const end = (await G()).hp;
    ok(dropped === 1 && end === hp0 - 1, 'a missed off-lane piece costs exactly one heart, once  [' + hp0 + ' -> ' + end + ']');
  });

  process.exit(report('Follow the Dog', results, errors) ? 0 : 1);
})();
