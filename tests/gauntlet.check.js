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
const HOOK = `window.__t = { G:function(){return G;}, LADDER:LADDER, VISIBLE:VISIBLE,
  prog:loadProg, fromAccount:restoreFromAccount,
  geo:function(){ return { W:W, H:H, TILE:TILE, BOARD:BOARD, BX:BX, BY:BY }; } };`;

const PKEY = 'pjcc.gauntlet.v2';

(async () => {
  const { results, errors } = await withGame(GAME, MARKER, HOOK, async (page, ok, sleep) => {
    const visible = id => page.evaluate(i => { const e = document.getElementById(i); return !!e && !e.classList.contains('hidden'); }, id);
    const text = id => page.evaluate(i => (document.getElementById(i) || {}).textContent || '', id);
    /* ⚠⚠ THE HALF-PLAYED BOARD HAS TO GO TOO, or this does not seed anything. A mid-game
       save beats every other entrance in the room's open-state block — deliberately, it is
       the "leave and come back" feature — so a run that let a real match take a move would
       reload straight back INTO that match, and the next `#play-btn` click would fail on an
       element that is not there. Setting the climb without clearing the board is a setup
       that quietly does not apply. */
    const seed = async prog => {
      await page.evaluate((k, p) => {
        if (p) localStorage.setItem(k, p); else localStorage.removeItem(k);
        localStorage.removeItem('pjcc.gauntlet.game.v1');
      }, PKEY, prog ? JSON.stringify(prog) : null);
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

    /* --- A NEW DEVICE PICKS THE CLIMB BACK UP (2026-08-19) ----------------------------
       Nate: "logging in to a different device, the gauntlet doors on the main page and
       games hall default to the first door. They should default to the latest door the user
       has unlocked." The doors are where he saw it; the hole was in here — the profile
       restore recovered `unlocked` and nothing else, while every screen and every door on
       the site reads `beaten`.

       ⚠ THIS DRIVES THE DEDUCTION, NOT THE NETWORK. `restoreFromAccount(rows)` takes the
       plain array `PJCC.myStats()` resolves to, so the seam is the only thing stubbed here
       — there is no Supabase session in a headless file:// page to have instead. What is
       actually being asked is the part that was wrong: a bare COUNT has to come back as a
       ladder, it has to raise the screens that were already drawn, and it must never lower
       anything. [[green-must-name-what-ran]] */
    await seed(null);                                        // a brand-new device: nothing local
    ok((await text('play-btn')).indexOf('TOWER') >= 0, 'new device starts at "ENTER THE TOWER"');
    const restored = await page.evaluate(() => window.__t.fromAccount(
      [{ game: 'skyrun', best_score: 900 }, { game: 'the-gauntlet', best_score: 6, data: { cleared: 6 } }]));
    await sleep(150);
    ok(restored === true, 'the account row is recognized and applied');
    const back = await page.evaluate(() => window.__t.prog());
    ok(Object.keys(back.beaten).length === 6 && back.beaten[0] && back.beaten[5] && !back.beaten[6],
       'six cleared floors come back as floors 1-6 beaten, and no seventh  [' +
       Object.keys(back.beaten).join(',') + ']');
    ok(back.unlocked === 6, 'and the unlocked rung follows it  [' + back.unlocked + ']');
    ok((await text('play-btn')).indexOf('FLOOR 7') >= 0,
       'the menu already on screen re-reads as "CONTINUE — FLOOR 7"  [' + (await text('play-btn')) + ']');

    /* ⚠⚠ AND IT ONLY EVER RAISES. A player who is further along on THIS device — they
       won a floor while the write was still in flight — must not be walked backwards by a
       server count that is a moment behind. This is the assertion that would catch a fix
       written as "trust the server". */
    await seed({ unlocked: 8, beaten: { 0: true, 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true } });
    await page.evaluate(() => window.__t.fromAccount([{ game: 'the-gauntlet', best_score: 3, data: { cleared: 3 } }]));
    await sleep(120);
    const kept = await page.evaluate(() => window.__t.prog());
    ok(Object.keys(kept.beaten).length === 8 && kept.unlocked === 8,
       'a LOWER server count never walks a local climb backwards  [' +
       Object.keys(kept.beaten).length + ' beaten, unlocked ' + kept.unlocked + ']');

    /* ⚠ THE SECRET FLOORS ARE NOT DEDUCIBLE and must not be handed out. The count includes
       them, but beating the CEO says nothing about the Chairman — so the deduction stops at
       the ten public floors, which are certainly done if the count got past them. */
    await seed(null);
    await page.evaluate(() => window.__t.fromAccount([{ game: 'the-gauntlet', best_score: 12, data: { cleared: 12 } }]));
    await sleep(120);
    const capped = await page.evaluate(() => ({ p: window.__t.prog(), v: window.__t.VISIBLE }));
    ok(Object.keys(capped.p.beaten).length === capped.v,
       'a count past the public ten stops at ten — no secret floor is handed out  [' +
       Object.keys(capped.p.beaten).length + ' of ' + capped.v + ']');

    /* --- ...and the #climb deep link re-routes when the account answers late ----------
       The room decides its entrance SYNCHRONOUSLY, so on a new device `#climb` has already
       sent a "cleared 0" player to the tower by the time the account replies. Landing on
       the tower is exactly what he described from the outside. */
    /* ⚠ A HASH CHANGE IS A SAME-DOCUMENT NAVIGATION — `goto('…#climb')` does NOT re-run the
       room's open-state block, and the first version of this check read the screen left over
       from the step above and called it the entrance. `reload()` is what actually enters. */
    await page.evaluate(() => { localStorage.removeItem('pjcc.gauntlet.v2'); localStorage.removeItem('pjcc.gauntlet.game.v1'); });
    await page.goto(page.url().split('#')[0] + '#climb', { waitUntil: 'load' });
    await page.reload({ waitUntil: 'load' });
    await sleep(350);
    ok(await visible('ladder-screen'), '#climb on a blank device lands on the tower (nothing to resume yet)');
    await page.evaluate(() => window.__t.fromAccount([{ game: 'the-gauntlet', best_score: 6, data: { cleared: 6 } }]));
    await sleep(250);
    ok(await visible('boss-screen'), 'and the account arriving re-routes it to the boss card');
    ok((await text('boss-eye')).indexOf('Floor 7') >= 0,
       'at the floor the ACCOUNT reached, not floor one  [' + (await text('boss-eye')) + ']');

    /* ⚠⚠ BUT IT NEVER YANKS A SCREEN HE IS USING. Same late answer, except he has already
       tapped into the tower. Re-routing him to a boss card mid-scroll would be a worse bug
       than the one being fixed. */
    await page.evaluate(() => { localStorage.removeItem('pjcc.gauntlet.v2'); localStorage.removeItem('pjcc.gauntlet.game.v1'); });
    await page.goto(page.url().split('#')[0], { waitUntil: 'load' });
    await page.reload({ waitUntil: 'load' });
    await sleep(300);
    await page.evaluate(() => window.showLadder());
    await sleep(150);
    await page.evaluate(() => window.__t.fromAccount([{ game: 'the-gauntlet', best_score: 6, data: { cleared: 6 } }]));
    await sleep(250);
    ok(await visible('ladder-screen'),
       'a player who has already opened the tower is left on it, not re-routed under him');

    /* --- The cut-scene has NO skip (2026-08-19) ---------------------------------------
       Nate: "take out the skip intro on the intro — it's so short anyway." The hint and the
       tap/keydown handlers are both gone, so this asserts the ABSENCE two ways: no
       `.vs-cut-skip` element, and a real pointerdown + Escape leave the card standing. The
       second half is the one that matters — deleting only the hint would still pass a
       markup check while a stray thumb ate the announcement. */
    await seed(MID);
    await page.click('#play-btn'); await sleep(150);
    await page.evaluate(() => { const b = document.querySelector('#boss-row .btn-gold'); b && b.click(); });
    await sleep(200);
    ok(await page.evaluate(() => !!document.querySelector('.vs-cut')), 'FIGHT plays the VS cut-scene');
    ok(await page.evaluate(() => !document.querySelector('.vs-cut-skip')),
       'the cut-scene carries no "TAP TO SKIP" hint');
    await page.evaluate(() => {
      document.querySelector('.vs-cut').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });
    await sleep(120);
    ok(await page.evaluate(() => !!document.querySelector('.vs-cut')),
       'a tap and Escape do NOT dismiss it — the intro plays to the end');
    /* ...and it still leaves on its own. The failsafe timer is 3400ms and is now the only
       way out, so this waits past it rather than nudging anything. */
    await sleep(3600);
    ok(await page.evaluate(() => !document.querySelector('.vs-cut')),
       'it removes itself when it finishes (no parked overlay left behind)');
    ok(await page.evaluate(() => !!window.__t.G()), 'and the match started behind it');

    /* --- Random colors: the announced color is the color actually played ---
       ⚠ FIGHT NO LONGER STARTS THE MATCH DIRECTLY (2026-08-13). It plays the VS cut-scene
       and calls startRung() when that resolves, so `G` is null for ~2.6s after the click
       and reading it at 140ms measures nothing.
       ⚠ AND THERE IS NO LONGER A TAP THAT SHORTENS IT (2026-08-19). `endCut()` dispatches
       the wrapper's own `animationend` — the SAME event the finished card fires, on the
       same element, through the same `done()` guard — which fast-forwards to the natural
       ending rather than exercising a skip that no longer exists. Fourteen real 2.6s
       playthroughs would put ~40s on this run for no extra coverage. */
    const endCut = () => page.evaluate(() => {
      const c = document.querySelector('.vs-cut');
      if (c) c.dispatchEvent(new AnimationEvent('animationend', { bubbles: true }));
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
      if (await endCut()) sawCut++;
      await sleep(140);
      const pc = await page.evaluate(() => (window.__t.G() || {}).pc);
      if (pc !== announced) mism++;
    }
    ok(sawCut === 14, 'FIGHT played the VS cut-scene every time (' + sawCut + '/14)');
    ok(await page.evaluate(() => !document.querySelector('.vs-cut')),
       'a finished cut-scene removes itself from the DOM (no parked overlay left behind)');
    /* ⚠⚠ AND IT MUST NOT DEAL A SECOND BOARD. Every path out of the cut-scene calls the
       same `done()` guard, and the failure this locks in is real: the animation end that
       resolves AND a failsafe timer that resolves would run startRung() twice, which in
       here is a fresh position laid over a game already in progress. One board, one log. */
    ok(await page.evaluate(() => ((window.__t.G() || {}).log || []).length === 0 ||
                                 ((window.__t.G() || {}).uci || []).length <= 1),
       'the match started exactly once (no double startRung)');
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
    /* ⛑ BOTH NUMBERS ROSE 52px ON 2026-08-19 — 148 -> 200 and 176 -> 228 — because
       ⚑ Resign stopped floating over the board and became a flow row (44px tap target +
       8px of margin). That is the documented cost of the fix, not a nudge: the board keeps
       every pixel it had and the frame grew, which is the same trade the booth got. */
    const FRAME_DESKTOP = 200, FRAME_PHONE = 228;
    const budgetFor = (stageW) => (stageW <= 516 ? FRAME_PHONE : FRAME_DESKTOP);
    const STAGE_WIDTHS = [306, 380, 420, 520, 720];
    let worstSlack = 1e9, worstAt = '', boothMissed = [], seen = [], railLost = [];
    let resignMissing = [], resignOnBoard = [], resignTap = [];

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
        if (c) c.dispatchEvent(new AnimationEvent('animationend', { bubbles: true }));
      });
      await sleep(1400);                       // the booth's first line lands ~900ms in

      /* ⚑ AND THE RESIGN BUTTON IS NOT ON THE BOARD — 2026-08-19, Nate: "the resign
         button is in the way of the bottom right two pieces." It used to be a float-btn
         at bottom:10/right:10 over #board-wrap, which cleared the last rank on a desktop
         board and cut 28px into it on a phone. It is furniture in the flow now.
         ⚠⚠ THE QUESTION IS GEOMETRY, NOT PARENTAGE. Asking "is it outside #board-wrap"
         would have passed on the old code the day someone re-parented it and kept the
         absolute offsets. This computes where the board is actually PAINTED — the canvas
         box scaled by the drawing units the room uses — and asks whether the button's own
         rect touches it, at every stage width the wrapper produces. */
      const clash = await page.evaluate(() => {
        const cv = document.getElementById('cv'), btn = document.getElementById('resign-btn');
        if (!cv || !btn || btn.classList.contains('hidden')) return { shown: false };
        const g = window.__t.geo(), c = cv.getBoundingClientRect(), b = btn.getBoundingClientRect();
        const k = c.width / g.W;                       // one drawing unit, in css px
        const board = { left: c.left + g.BX * k, top: c.top + g.BY * k,
                        right: c.left + (g.BX + g.BOARD) * k, bottom: c.top + (g.BY + g.BOARD) * k };
        return { shown: true, tap: Math.round(b.height),
                 hits: b.left < board.right && b.right > board.left &&
                       b.top < board.bottom && b.bottom > board.top,
                 gap: Math.round(b.top - board.bottom) };
      });
      if (!clash.shown) resignMissing.push(w);
      else { if (clash.hits) resignOnBoard.push(w + '@' + clash.gap); resignTap.push(clash.tap); }

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
    ok(resignMissing.length === 0,
       'the Resign button is on screen during a live match at every width  [' +
       (resignMissing.length ? 'MISSING at ' + resignMissing.join(', ') : 'all ' + STAGE_WIDTHS.length) + ']');
    ok(resignOnBoard.length === 0,
       'and it never touches the painted board — no piece hides under it  [' +
       (resignOnBoard.length ? 'ON THE BOARD at ' + resignOnBoard.join(', ')
                             : 'clear at all ' + STAGE_WIDTHS.length + ' widths') + ']');
    ok(resignTap.length > 0 && Math.min.apply(null, resignTap) >= 44,
       'and it is still a 44px tap target after the move  [heights ' + resignTap.join(',') + ']');

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
