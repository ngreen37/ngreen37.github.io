/* Regression check for Clearance: DELTA (assets/games/pjcc_clearance.html).
 *   run:  npm run test:clearance   (also in the `npm run test:games` chain)
 *
 * ⚑ WHY THIS FILE EXISTS (2026-08-24). Nate, on a diagram question: "you can't scroll
 * down to hit continue - you can only see three answer options." Measured: #term ran a
 * scrollHeight of 764 inside a clientHeight of 614 with `overflow: hidden`, in an iframe
 * carrying `scrolling="no"` — so two of four options and the NEXT button were not merely
 * off-screen, they were unreachable by any gesture. A diagram question was unfinishable.
 *
 * The three things this pins, each of which failed at some point during the fix:
 *   1. every option and the NEXT button is REACHABLE inside the question column;
 *   2. the column never becomes a SIDEWAYS scroller (overflow-y:auto silently makes
 *      overflow-x auto too — the trap in [[mobile-window-slide]]);
 *   3. no item SPILLS its content over the next one. ⭐ This one cannot be seen by
 *      comparing rects: a squashed flex item keeps a small border box and paints
 *      outside it, so `getBoundingClientRect()` reports no overlap and `scrollHeight`
 *      never moves. Ask each item whether its own content fits inside it instead.
 *      Mutation-tested: restore `flex: 1 1 auto` on .qscroll's children and check 3
 *      fails with 38px of spill on the phone.
 *
 * It drives the REAL page at the REAL sizes the shell gives the iframe
 * (games/clearance-delta/index.html: 660px desktop, 620px at <=640px wide).
 *
 * ⛑⛑ 2026-09-02 — AND THE PHONE BOXES WERE 88px TOO WIDE, WHICH IS WHY IT STAYED GREEN
 * WHILE THE BUG WAS LIVE. `width: 390` is the PHONE's width, not the cabinet's: the page
 * spends 28px of `.wrapper` a side and 14px of bezel a side, so a 390px phone hands the
 * iframe 302. The answers reflow to fewer lines at 390 than they ever do in the real box,
 * and at 302 the NEXT button on a diagram question sat 28px below the column's floor —
 * measured at the SHIPPING 620px cabinet, before any of the 100svh work.
 * ⭐ A BOX THAT IS NOT THE BOX IS A DIFFERENT PAGE. The widths below are measured, and the
 * heights now include what the `fits-phone` cap gives a short phone.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { findChrome, report } = require('./harness');

let puppeteer;
try { puppeteer = require('puppeteer-core'); }
catch (e) { console.error('puppeteer-core not installed. Run `npm install` first.'); process.exit(2); }

const ROOT = path.join(__dirname, '..');
const GAME = path.join(ROOT, 'assets', 'games', 'pjcc_clearance.html');

/* The boxes the shell actually hands the iframe. ⚠ The two phone widths are the CABINET's
   width, not the phone's — 302 is what a 390px phone leaves after the wrapper and the bezel,
   232 is what a 320px one leaves. The 505 heights are the `fits-phone` cap on a short phone. */
const BOXES = [
  { name: 'desktop 640x660', width: 640, height: 660, mobile: false },
  { name: 'phone   302x620', width: 302, height: 620, mobile: true },
  { name: 'capped  302x505', width: 302, height: 505, mobile: true },
  { name: 'narrow  232x505', width: 232, height: 505, mobile: true },
];

/* Set up one diagram question, answer it WRONG (so the explanation and NEXT both
   appear — the fullest a question ever gets), then measure. Runs in the page. */
function probe(qi) {
  document.getElementById('intro').classList.add('hidden');
  document.getElementById('menu').classList.add('hidden');
  const q = Q.filter(x => x.dfen)[qi];
  queues = { 1: [], 2: [], 3: [], 4: [], 5: [] };
  queues[q.t].push(Q.indexOf(q));
  correct = 0; score = 0; strikes = 0; streak = 0;
  nextQuestion();
  const wrap = document.getElementById('answers');
  wrap.children[cur._display.findIndex(i => i !== cur.c)].click();

  const sc = document.getElementById('qscroll');
  const sr = sc.getBoundingClientRect();
  const inCol = el => {
    const r = el.getBoundingClientRect();
    return r.bottom <= sr.bottom + 0.5 && r.top >= sr.top - 0.5;
  };
  // Reachable = visible at SOME scroll position of the column.
  const reachable = el => {
    const was = sc.scrollTop;
    let seen = false;
    for (const t of [0, sc.scrollHeight]) { sc.scrollTop = t; if (inCol(el)) { seen = true; break; } }
    sc.scrollTop = was;
    return seen;
  };
  let spill = 0;
  for (const e of sc.children) spill = Math.max(spill, e.scrollHeight - e.clientHeight);
  return {
    q: q.q.slice(0, 34),
    options: wrap.children.length,
    optionsReachable: [...wrap.children].filter(reachable).length,
    nextReachable: reachable(document.getElementById('next-btn')),
    // showNext() must land the button in view on its own — the player should not
    // have to discover a scrollbar to finish a question.
    nextInViewAfterAnswer: inCol(document.getElementById('next-btn')),
    sidewaysPx: sc.scrollWidth - sc.clientWidth,
    termSidewaysPx: (t => t.scrollWidth - t.clientWidth)(document.getElementById('term')),
    spillPx: spill
  };
}

/* ⛑⛑ NEXT IS FURNITURE NOW, AND THIS IS WHAT SAYS SO (2026-09-02).
   Driving the exam for real — several questions, then a diagram one — left NEXT **28px below
   the column's floor at a 302px cabinet and 178px at 232**, measured at the SHIPPING 620px
   frame, before any of the 100svh work. `showNext()` scrolls the column to its foot and that
   is not a guarantee: anything that moves the column afterward puts the button back under
   the edge, and a promotion card between the answer and the player is one such thing.
   ⚠⚠ THIS PROBE DOES NOT REPRODUCE THOSE NUMBERS AND IS NOT MEANT TO. A single injected
   question, answered from a standing start, lands NEXT in view with or without the fix — the
   burial needed a longer sequence than a check should depend on. So the assertion that has
   teeth is the STRUCTURAL one: NEXT is `position: sticky`, which makes the whole family of
   states impossible instead of testing them one at a time. `belowFloor` rides along as the
   invariant itself. Mutation: delete the sticky rule and the third check goes red at every
   box. [[green-must-name-what-ran]] — a green has to name what it actually ran. */
function probePromo(qi) {
  document.getElementById('intro').classList.add('hidden');
  document.getElementById('menu').classList.add('hidden');
  const q = Q.filter(x => x.dfen)[qi];
  queues = { 1: [], 2: [], 3: [], 4: [], 5: [] };
  queues[q.t].push(Q.indexOf(q));
  /* one short of the next rung, so answering right promotes */
  correct = RANKS[1].at - 1; score = 0; strikes = 0; streak = 0; rankIdx = 0;
  nextQuestion();
  const wrap = document.getElementById('answers');
  wrap.children[cur._display.indexOf(cur.c)].click();          // CORRECT, so the card comes up
  const promoUp = document.getElementById('promo').classList.contains('up');
  document.getElementById('promo-go').click();                 // acknowledge it, as a player must

  const sc = document.getElementById('qscroll');
  const sr = sc.getBoundingClientRect();
  const nb = document.getElementById('next-btn');
  const nr = nb.getBoundingClientRect();
  return {
    q: q.q.slice(0, 34),
    promoUp: promoUp,
    showing: nb.classList.contains('show'),
    belowFloor: Math.round(nr.bottom - sr.bottom),
    pinned: getComputedStyle(nb).position
  };
}

(async () => {
  const exe = findChrome();
  if (!exe) { console.error('No Chrome/Edge found. Install one or set CHROME_PATH.'); process.exit(2); }

  // file:// can't resolve the page's absolute /assets/js/* module tags — rewrite them.
  const src = fs.readFileSync(GAME, 'utf8')
    .replace(/src="\/assets\//g, 'src="file:///' + ROOT.replace(/\\/g, '/') + '/assets/');
  const tmp = path.join(os.tmpdir(), 'pjcc_clr_' + Date.now() + '.html');
  fs.writeFileSync(tmp, src);

  const results = [], errors = [];
  const ok = (cond, msg) => results.push({ pass: !!cond, msg });
  const browser = await puppeteer.launch({ executablePath: exe, headless: 'new', args: ['--no-sandbox', '--mute-audio'] });
  try {
    for (const box of BOXES) {
      const page = await browser.newPage();
      page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
      await page.setViewport({ width: box.width, height: box.height, deviceScaleFactor: 1, isMobile: box.mobile, hasTouch: box.mobile });
      await page.goto('file://' + tmp.replace(/\\/g, '/'), { waitUntil: 'load', timeout: 15000 });
      await new Promise(r => setTimeout(r, 300));

      const n = await page.evaluate(() => Q.filter(x => x.dfen).length);
      ok(n > 0, box.name + ': the exam still has diagram questions to check  [' + n + ']');

      for (let qi = 0; qi < n; qi++) {
        const m = await page.evaluate(probe, qi);
        const tag = box.name + ' · "' + m.q + '…"';
        ok(m.optionsReachable === m.options,
          tag + ': every option is reachable  [' + m.optionsReachable + '/' + m.options + ']');
        ok(m.nextReachable, tag + ': NEXT is reachable');
        ok(m.nextInViewAfterAnswer, tag + ': NEXT is in view the moment it appears');
        ok(m.sidewaysPx <= 0 && m.termSidewaysPx <= 0,
          tag + ': nothing scrolls sideways  [col=' + m.sidewaysPx + 'px term=' + m.termSidewaysPx + 'px]');
        ok(m.spillPx <= 0, tag + ': no item spills its content over the next  [' + m.spillPx + 'px]');

        const pm = await page.evaluate(probePromo, qi);
        /* prove the subject is present, or the next check passes on a screen that never
           showed a card */
        ok(pm.promoUp && pm.showing,
          tag + ': the promotion card came up and NEXT is showing behind it  [' +
          pm.promoUp + '/' + pm.showing + ']');
        ok(pm.belowFloor <= 1,
          tag + ': NEXT survives the promotion card  [' + pm.belowFloor + 'px below the floor]');
        ok(pm.pinned === 'sticky',
          tag + ': \u2026 because it is pinned, not because it happened to fit  [' + pm.pinned + ']');
      }
      await page.close();
    }
  } catch (e) {
    errors.push('HARNESS THREW: ' + e.message);
  } finally {
    await browser.close();
    try { fs.unlinkSync(tmp); } catch (e) {}
  }

  process.exit(report('Clearance: DELTA — a diagram question is finishable', results, errors) ? 0 : 1);
})();
