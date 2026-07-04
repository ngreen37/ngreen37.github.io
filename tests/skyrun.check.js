// Regression check for Sky Run (assets/games/pjcc_sky_run.html).
// Asserts the four systems added in v2.0 still work, plus no JS crashes.
//   run:  npm run test:skyrun
const path = require('path');
const { withGame, report } = require('./harness');

const GAME = path.join(__dirname, '..', 'assets', 'games', 'pjcc_sky_run.html');
const MARKER = 'requestAnimationFrame(loop);'; // last occurrence = the bottom kick, after all defs
const HOOK = `
window.__t = {
  g: function(){ var x=G; return x ? {
    score:x.score, region:x.region, rank:x.rank, hearts:x.hearts,
    enemies:x.enemies.length, bullets:x.bullets.length, tokens:x.tokens.length,
    boss: x.boss ? {hp:x.boss.hp, kind:x.boss.kind, vuln:x.boss.vuln, phase:x.boss.phase} : null,
    dog:x.dog.mode, bishopPwr:Math.ceil(x.pwr.bishop), focus:x.focus, phase:x.phase
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
    ok(s && s.rank === 0 && s.hearts === 5, 'run starts as Pawn (rank 0) with 5 hearts  [rank=' + (s && s.rank) + ' hearts=' + (s && s.hearts) + ']');

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

    // Promotion arc (#1)
    const before = (await G()).rank;
    await page.evaluate(() => window.__t.killBoss()); await sleep(500);
    const after = await G();
    ok(after.rank === before + 1, 'clearing a region promotes Princess one rank  [' + before + ' -> ' + after.rank + ']');
  });

  process.exit(report('Sky Run v2.0', results, errors) ? 0 : 1);
})();
