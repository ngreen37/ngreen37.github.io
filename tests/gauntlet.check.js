// Regression check for The Gauntlet (assets/games/pjcc_gauntlet.html).
// Drives the REAL game in headless Chrome. Locks in the 2026-07-05 UX rules:
//   - Resume: mid-climb "Continue" jumps straight to the CURRENT opponent's boss card
//     (not the tower list); fresh + crowned players open the full tower.
//   - Colors are drawn at random each match, and the color the boss card ANNOUNCES is
//     the color actually played.
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

    /* --- Random colors: the announced color is the color actually played ---
       ⚠ FIGHT NO LONGER STARTS THE MATCH DIRECTLY (2026-08-13). It plays the VS cut-scene
       and calls startRung() when that resolves, so `G` is null for ~2.6s after the click
       and reading it at 140ms measures nothing. `skipCut()` dismisses the card the way a
       player does — a pointerdown on it — which keeps this loop fast AND exercises the skip
       path on every one of the fourteen iterations. */
    const skipCut = () => page.evaluate(() => {
      const c = document.querySelector('.vs-cut');
      if (c) c.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      return !!c;
    });
    let mism = 0, sawW = 0, sawB = 0, sawCut = 0;
    for (let k = 0; k < 14; k++) {
      await seed(MID);
      await page.click('#play-btn'); await sleep(120);          // boss card draws the color
      const announced = /White/.test(await text('boss-note')) ? 'w' : 'b';
      announced === 'w' ? sawW++ : sawB++;
      await page.evaluate(() => { const b = document.querySelector('#boss-row .btn-gold'); b && b.click(); });
      await sleep(80);
      if (await skipCut()) sawCut++;
      await sleep(140);
      const pc = await page.evaluate(() => (window.__t.G() || {}).pc);
      if (pc !== announced) mism++;
    }
    ok(sawCut === 14, 'FIGHT played the VS cut-scene every time (' + sawCut + '/14)');
    ok(await page.evaluate(() => !document.querySelector('.vs-cut')),
       'a skipped cut-scene removes itself from the DOM (no parked overlay left behind)');
    /* ⚠⚠ AND THE SKIP MUST NOT DEAL A SECOND BOARD. Every path out of the cut-scene calls
       the same `done()` guard, and the failure this locks in is real: a tap that resolves
       AND a failsafe timer that resolves would run startRung() twice, which in here is a
       fresh position laid over a game already in progress. One board, one move log. */
    ok(await page.evaluate(() => ((window.__t.G() || {}).log || []).length === 0 ||
                                 ((window.__t.G() || {}).uci || []).length <= 1),
       'the skipped match started exactly once (no double startRung)');
    ok(mism === 0, 'boss-card color note matched the played color every start (mismatches: ' + mism + ')');
    ok(sawW > 0 && sawB > 0, 'colors actually randomise across starts  [W:' + sawW + ' B:' + sawB + ']');

    /* ══ THE FURNITURE BUDGET (2026-08-14) ══════════════════════════════════════════════
       Nate: "the aura bar flashes for just a second for the opponent up top and then goes
       away." It was the commentary booth: a flow child of #stage that appears ~900ms into
       a match, pushing the stage past the frame the wrapper gives it, and `body` in here
       is overflow:hidden — so the excess was clipped off BOTH ends and the top rail, with
       15px of clearance, went first.

       ⚠ THE OLD TESTS ALL PASSED WHILE THIS WAS LIVE, because every one of them asked
       whether the rail was `hidden` — and it never was. It was on screen, at y = -12.
       So this asserts the geometry: what #stage puts in the FLOW must fit the frame, in
       the tallest state the room can reach, at every stage width the wrapper produces. */
    /* ⚠⚠ THE HARNESS DOES NOT COMPILE THE ROOM'S SCSS, so /assets/css/vs-aura.css is a
       404 in here and `.vs-aura` had NO HEIGHT AT ALL — the rails measured 0px and the
       furniture came back ~17px light. Every number below was quietly wrong until this
       went in. Compile the same partial Jekyll does and put it where the <link> would
       have been (first in <head>), so the room's own <style> still wins the ties it is
       written to win. ⭐ A layout test on a page missing one of its stylesheets is not a
       layout test; it is a measurement of a page nobody will ever see. */
    const sass = require('sass');
    const vsScss = require('fs')
      .readFileSync(path.join(__dirname, '..', 'assets', 'css', 'vs-aura.scss'), 'utf8')
      .replace(/^---[\s\S]*?---\s*\n/, '');
    const vsCss = sass.compileString(vsScss, {
      loadPaths: [path.join(__dirname, '..', '_sass')], silenceDeprecations: ['import'] }).css;
    await page.evaluate((css) => {
      const s = document.createElement('style');
      s.id = 'vs-aura-compiled';
      s.textContent = css;
      document.head.insertBefore(s, document.head.firstChild);
    }, vsCss);
    ok(await page.evaluate(() => {
         const el = document.getElementById('g-aura-opp');
         const prev = el.className; el.className = 'vs-aura';
         const h = getComputedStyle(el).height; el.className = prev;
         return parseFloat(h) > 0;
       }), 'the VS rail stylesheet is actually loaded for these measurements');

    /* two budgets, because the wrapper states two — see its @media (max-width:600px).
       The phone branch kicks in at viewport <=600, and stage = 100vw-84, so a stage of
       516 or less is a phone frame. */
    const FRAME_DESKTOP = 148, FRAME_PHONE = 176;
    const budgetFor = (stageW) => (stageW <= 516 ? FRAME_PHONE : FRAME_DESKTOP);
    const STAGE_WIDTHS = [306, 380, 420, 520, 720];
    let worstSlack = 1e9, worstAt = '', boothMissed = [], seen = [], railLost = [];

    /* Two DIFFERENT promises are being kept here, and they need separate questions.

         (1) THE BUDGET covers every state the room reaches BY ITSELF — the booth opening
             on its own is the whole bug he reported — so in that state nothing moves at
             all and the stage fits the frame exactly.
         (2) `safe center` covers the states it does not: the move browser's note row
             wraps to three lines on a 306px phone if you browse back mid-game, and
             reserving 70px on every screen forever to hold a band that appears when
             somebody taps ◂ would cost more than it buys. There, the stage overflows —
             and the ONLY promise that matters is that it overflows off the BOTTOM, so
             the rail he is complaining about is still on screen.

       ⚠ (2) is not a softer version of (1). It is the assertion that would have caught
       the original bug on its own, because the original bug was the rail leaving. */
    const measure = (withNote) => page.evaluate((wn) => {
      const bar = document.getElementById('replay-bar');
      bar.classList.add('on');
      const pjr = bar.querySelector('.pjr');
      const note = pjr && pjr.querySelector('.pjr-note');
      if (pjr && wn && !note) {
        pjr.insertAdjacentHTML('beforeend',
          '<div class="pjr-note">viewing an earlier position — press Live to catch up</div>');
      } else if (note && !wn) { note.remove(); }
      const stage = document.getElementById('stage');
      const flow = [...stage.children].filter((el) => {
        const cs = getComputedStyle(el);
        return cs.display !== 'none' && cs.position !== 'absolute' && cs.position !== 'fixed';
      });
      const furniture = flow.filter((el) => el.id !== 'board-wrap').reduce((a, el) => {
        const cs = getComputedStyle(el);
        return a + el.getBoundingClientRect().height +
               (parseFloat(cs.marginTop) || 0) + (parseFloat(cs.marginBottom) || 0);
      }, 0);
      const rail = document.getElementById('g-aura-opp').getBoundingClientRect();
      return { stageH: stage.getBoundingClientRect().height, furniture: Math.round(furniture),
               view: innerHeight, boothOpen: !document.getElementById('booth').classList.contains('hidden'),
               railTop: Math.round(rail.top), railH: Math.round(rail.height) };
    }, withNote);

    for (const w of STAGE_WIDTHS) {
      await page.setViewport({ width: w, height: Math.round(w * 1.1364 + budgetFor(w)) });
      await sleep(120);
      /* ⚠⚠ DRIVE A REAL MATCH — DO NOT SYNTHESIZE THE STATE. The first version of this
         check un-hid the booth by hand and PASSED ON THE BROKEN CODE, because a booth
         un-hidden on the tower screen is not the same box as a booth the game itself
         opened over a live board. A test that builds its own version of the bug measures
         its own version of the bug. So: start the match and let the commentary arrive. */
      await page.evaluate(() => { window.showBossCard(0); });
      await sleep(260);
      await page.evaluate(() => { const b = document.querySelector('#boss-row .btn-gold'); b && b.click(); });
      await sleep(120);
      await page.evaluate(() => {
        const c = document.querySelector('.vs-cut');
        if (c) c.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      });
      await sleep(1400);                       // the booth's first line lands ~900ms in

      const own = await measure(false);        // (1) the room's own worst state
      if (!own.boothOpen) boothMissed.push(w);
      seen.push(w + ':' + own.furniture);
      const slack = Math.round(own.view - own.stageH);
      if (slack < worstSlack) { worstSlack = slack; worstAt = w + 'px (furniture ' + own.furniture + ')'; }

      const ext = await measure(true);         // (2) the extreme state, note row and all
      if (ext.railH <= 0 || ext.railTop < 0) railLost.push(w + '@top' + ext.railTop + ',h' + ext.railH);
    }

    ok(boothMissed.length === 0,
       'the commentary booth actually opened at every width before measuring  [' +
       (boothMissed.length ? 'missed at ' + boothMissed.join(', ') : 'all ' + STAGE_WIDTHS.length) + ']');
    ok(worstSlack >= 0,
       'the frame budget covers every state the room reaches on its own  [worst slack ' +
       worstSlack + 'px at stage ' + worstAt + '; furniture by width ' + seen.join(' ') + ']');
    ok(railLost.length === 0,
       'and even overflowing, the opponent rail never leaves by the top  [' +
       (railLost.length ? 'LOST at ' + railLost.join(', ') : 'held at all ' + STAGE_WIDTHS.length + ' widths') + ']');

    /* and the budget in the WRAPPER has to be the number this was measured against —
       a test that hard-codes 136 while the page says something else proves nothing */
    const fs = require('fs');
    const wrapper = fs.readFileSync(
      path.join(__dirname, '..', 'games', 'the-gauntlet', 'index.html'), 'utf8');
    const dM = /--g-furniture,\s*(\d+)px/.exec(wrapper);
    const pM = /--g-furniture:\s*(\d+)px/.exec(wrapper);
    ok(dM && Number(dM[1]) === FRAME_DESKTOP && pM && Number(pM[1]) === FRAME_PHONE,
       'the wrapper reserves exactly the budgets this test measured against  [page ' +
       (dM ? dM[1] : '?') + '/' + (pM ? pM[1] : '?') + ' vs test ' +
       FRAME_DESKTOP + '/' + FRAME_PHONE + ']');

    /* ══ THE TOWER REACHES THE TOP (2026-08-14) ═════════════════════════════════════════
       Nate: "the tower isn't completely visible. The scrolling stops halfway to Floor ten."
       It was never the scrolling — a centered flex column pushes its first children out
       through the START edge, where scrollTop cannot follow. Measured before the fix: at
       scrollTop 0 the highest floor on screen was 8. So ask the question that way. */
    await page.setViewport({ width: 420, height: Math.round(420 * 1.1364 + FRAME_PHONE) });
    await sleep(150);
    await page.evaluate(() => window.showLadder());
    await sleep(350);
    const tower = await page.evaluate(() => {
      const sc = document.getElementById('ladder-screen');
      sc.scrollTop = 0;
      const box = sc.getBoundingClientRect();
      const onScreen = [...sc.querySelectorAll('.tw-name')]
        .filter((el) => { const r = el.getBoundingClientRect(); return r.bottom > box.top && r.top < box.bottom; })
        .map((el) => el.textContent.trim());
      const all = [...sc.querySelectorAll('.tw-name')].map((el) => el.textContent.trim());
      return { top: onScreen[0] || '', first: all[0] || '', count: all.length,
               justify: getComputedStyle(sc).justifyContent };
    });
    ok(tower.top === tower.first && !!tower.first,
       'scrolled to the very top, the tower\'s highest floor is actually on screen  [' +
       tower.top + ']');
    ok(/safe/.test(tower.justify),
       'the overlay aligns with `safe center`, so overflow can never leave by the top  [' +
       tower.justify + ']');
  }, { rewriteAssets: true });   // the Gauntlet loads the REAL chess engine via /assets/*

  process.exit(report('The Gauntlet — resume + random colors', results, errors) ? 0 : 1);
})();
