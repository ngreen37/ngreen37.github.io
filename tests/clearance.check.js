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

// The boxes the shell actually hands the iframe, plus the narrowest phone worth caring about.
const BOXES = [
  { name: 'desktop 640x660', width: 640, height: 660, mobile: false },
  { name: 'phone   390x620', width: 390, height: 620, mobile: true },
  { name: 'narrow  360x620', width: 360, height: 620, mobile: true },
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
