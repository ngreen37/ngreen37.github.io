/* ═══════════════════════════════════════════════════════════════════════════════════
 * THE HIDDEN BOARDS — the two eggs, proved as chess and driven as UI
 * -----------------------------------------------------------------------------------
 * Nate 2026-08-03: "random chess boards hidden everywhere - but only like two to start…
 * they are very small - when you click - it expands, you get rewarded for finding it,
 * and the puzzle once solved prompts you to the puzzle page if you wish"
 *
 * TWO HALVES, and the first one is non-negotiable:
 *
 *   1. THE CHESS IS TRUE. Every hidden position is re-proved here against the site's own
 *      perft-verified referee (assets/js/pjcc-chess.js) — exactly one legal mate, and it
 *      is the move the egg accepts. pjcc-hidden-board.js deliberately does NOT load the
 *      referee (40KB onto /pjcc/ to re-derive a known fact), so this file is the only
 *      thing standing between a tuned FEN and a front-of-house lie about chess.
 *
 *   2. THE EGG WORKS. The real script is driven in a real browser: plant the mark, click
 *      it, play the wrong move, play the right one, and check that the flag it writes is
 *      the SAME STRING the collectable's `found:` rule reads out of pjcc-profile.js.
 *      Those two live in different files and nothing but this test connects them — get
 *      one character wrong and the egg silently rewards nothing.
 *
 *   node tests/hidden.check.js
 * ═══════════════════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const { findChrome } = require('./harness');
const ROOT = path.join(__dirname, '..');
const C = require(path.join(ROOT, 'assets/js/pjcc-chess.js'));

const HIDDEN = fs.readFileSync(path.join(ROOT, 'assets/js/pjcc-hidden-board.js'), 'utf8');
const PROFILE = fs.readFileSync(path.join(ROOT, 'assets/js/pjcc-profile.js'), 'utf8');

let pass = 0, fail = 0;
const check = (n, c, d) => {
  if (c) { pass++; console.log('  ✓ ' + n + (d !== undefined ? '   ' + d : '')); }
  else { fail++; console.log('  ✗ ' + n + (d !== undefined ? '   ' + d : '')); }
};

/* Pull BOARDS out of the shipped file without a browser, so the chess proof runs even if
   Chrome is missing. `window` is the only global the module touches at definition time. */
function loadBoards() {
  const win = {};
  new Function('window', 'document', 'localStorage', 'location', 'URLSearchParams', HIDDEN)(win, {
    readyState: 'complete', addEventListener() {}, createElement: () => ({ style: {}, classList: { add() {} }, setAttribute() {}, addEventListener() {}, appendChild() {} }),
    querySelectorAll: () => [], body: { appendChild() {} }, getElementById: () => null
  }, { getItem: () => null, setItem() {} }, { pathname: '/nowhere/', search: '' }, URLSearchParams);
  return win.PJCCHiddenBoard;
}

console.log('\n── THE HIDDEN BOARDS ─────────────────────────────────────\n');
const HB = loadBoards();
check('the module exposes its boards', HB && Array.isArray(HB.BOARDS), (HB.BOARDS || []).length + ' planted');
check('two to start, as asked', HB.BOARDS.length === 2, HB.BOARDS.map(b => b.id).join(' · '));

/* ── 1. THE CHESS ─────────────────────────────────────────────────────────────────── */
const NAME = i => 'abcdefgh'[i & 7] + (8 - (i >> 3));
HB.BOARDS.forEach(b => {
  const fen = b.fen + ' w - - 0 1';
  const S = C.parseFEN(fen);
  const moves = C.legalMoves(S);
  const mates = moves.filter(m => C.isCheckmate(C.makeMove(S, m)));
  check(`[${b.id}] the position is legal and nobody is already in check`,
    !C.inCheck(S) && !C.isStalemate(S) && moves.length > 0, moves.length + ' legal moves');
  check(`[${b.id}] there is EXACTLY ONE mate in one`, mates.length === 1,
    mates.map(m => C.toSAN(S, m)).join(', ') || 'NONE — the egg is unsolvable');
  if (mates.length === 1) {
    const m = mates[0];
    check(`[${b.id}] and it is the move the egg accepts (${b.san})`,
      m.from === b.from && m.to === b.to,
      `referee says ${NAME(m.from)}→${NAME(m.to)}, egg wants ${NAME(b.from)}→${NAME(b.to)}`);
    check(`[${b.id}] the SAN in the data matches the referee`, C.toSAN(S, m) === b.san,
      C.toSAN(S, m) + ' vs ' + b.san);
  }
  // the from-square must actually hold a WHITE piece, or the egg can never be started
  const men = HB.squares(b.fen);
  const p = men[b.from];
  check(`[${b.id}] the answer starts from a white piece`, !!p && p === p.toUpperCase(),
    NAME(b.from) + ' = ' + (p || 'empty'));
});

/* ── 2. THE FLAG CONTRACT — the only thread between the egg and the reward ────────── */
{
  const earned = /var EARNED = (\[[\s\S]*?\n  \]);/.exec(PROFILE);
  if (!earned) { console.error('\nABORT: EARNED not found in pjcc-profile.js'); process.exit(2); }
  const EARNED = eval(earned[1]);
  const wanted = new Set(EARNED.filter(e => (e.rule || '').indexOf('found:') === 0).map(e => e.rule.slice(6)));
  HB.BOARDS.forEach(b => {
    check(`[${b.id}] its flag "${b.flag}" is a real EARNED requirement`, wanted.has(b.flag),
      wanted.has(b.flag) ? 'the reward is wired' : 'nothing claims this flag — solving rewards NOTHING');
  });
  check('every board flag is distinct', new Set(HB.BOARDS.map(b => b.flag)).size === HB.BOARDS.length);
}

/* ── 2b. THE HOST PAGES STILL CARRY THEIR HIDING PLACES ───────────────────────────
   THE CHECK THIS FILE MOST NEEDED AND ORIGINALLY DIDN'T HAVE. The first version of the
   egg hunted CSS selectors (`.page-card p`) that exist on NEITHER host page — /pjcc/
   renders through _layouts/home.html and /games/ through default.html — so both eggs
   were planted nowhere, and this suite passed anyway because the browser half builds its
   own tidy page that happened to match. A test that supplies the condition it is testing
   proves nothing. Now the pages name their own spots with `data-hb`, and this counts them
   in the REAL source: delete one in a redesign and the egg fails loudly. */
{
  const HOSTS = {
    '/pjcc/':  ['_layouts/home.html'],
    '/games/': ['games.md']
  };
  HB.BOARDS.forEach(b => {
    const files = HOSTS[b.page];
    check(`[${b.id}] its page ${b.page} is a known host file`, !!files, files ? files.join(', ') : 'UNMAPPED — add it to HOSTS here');
    if (!files) return;
    let spots = 0;
    files.forEach(f => {
      const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
      spots += (src.match(/data-hb\b/g) || []).length;
    });
    check(`[${b.id}] ${files[0]} still carries its hiding places`, spots >= 3, spots + ' data-hb marks');
  });
  /* ⚠ COMMENTS STRIPPED FIRST, and deliberately — the block explaining why the guessed
     selector was wrong NAMES the guessed selector, and a test that can't tell a mistake
     from the note about the mistake would force the next person to delete the explanation
     to make it pass. (Same trap, same fix, as gambit.check.js §13.) */
  const CODE = HIDDEN.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  check('the script plants ONLY on data-hb, never on a guessed selector',
    /querySelectorAll\('\[data-hb\]'\)/.test(CODE) && !/page-card/.test(CODE));
}

/* ── 2c. THE SECRET THAT ONLY EXISTS IN THE RAIN AND SNOW (2026-08-03) ─────────────
   Nate, ingenuity #12: "One secret that only exists in the rain and snow… Make exactly
   one easter egg depend on it — the hidden chessboards." Three things have to hold or
   the egg is either always there (no secret) or never there (no egg). */
{
  const CODE = HIDDEN.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  check('boot() refuses to plant unless the town is wet', /if\s*\(!wet\(\)\)\s*return/.test(CODE));

  /* ⚠ THE FORECAST, NOT THE CANVAS. Falling weather never starts under reduced motion, so
     a gate that asked whether it is raining ON SCREEN would lock every reduced-motion
     visitor out of the egg entirely. PJCC_TIME.weather() is arithmetic on the date and is
     the same answer on every machine, quiet or not. */
  check('the gate reads the forecast, never the rendered weather',
    /window\.PJCC_TIME/.test(CODE) && /\.weather\(\)/.test(CODE) &&
    !/PJCCWeather|tw-canvas|town-weather-fall/.test(CODE),
    'reduced-motion visitors can still find it');

  // the gate itself, driven directly — the module reads window.PJCC_TIME at call time
  const win = {};
  new Function('window', 'document', 'localStorage', 'location', 'URLSearchParams', HIDDEN)(win, {
    readyState: 'complete', addEventListener() {}, createElement: () => ({ style: {}, classList: { add() {} }, setAttribute() {}, addEventListener() {}, appendChild() {} }),
    querySelectorAll: () => [], body: { appendChild() {} }, getElementById: () => null
  }, { getItem: () => null, setItem() {} }, { pathname: '/nowhere/', search: '' }, URLSearchParams);
  const gate = win.PJCCHiddenBoard;
  const say = (kind) => { win.PJCC_TIME = { weather: () => ({ kind }) }; return gate.wetKind(); };
  check('rain opens it', say('rain') === 'rain');
  check('snow opens it', say('snow') === 'snow');
  check('a clear day does not', say('clear') === null);
  check('nor does mist — falling water only', say('mist') === null,
    'mist is weather you cannot leave a board out in');
  win.PJCC_TIME = null;
  check('no clock at all fails CLOSED', gate.wetKind() === null,
    'a missing clock hides the egg rather than showing it on the wrong day');

  /* …and "fails closed" is only safe because the clock is genuinely always there. It is
     INLINED into every page before first paint, three includes deep. If any link in that
     chain breaks, the egg would go quiet on a rainy day and nothing else would complain. */
  const LAYOUT = fs.readFileSync(path.join(ROOT, '_layouts/default.html'), 'utf8');
  const HEAD = fs.readFileSync(path.join(ROOT, '_includes/head.html'), 'utf8');
  const TW = fs.readFileSync(path.join(ROOT, '_includes/town-weather.html'), 'utf8');
  const HOME = fs.readFileSync(path.join(ROOT, '_layouts/home.html'), 'utf8');
  check('every page loads the egg (default.html)', /pjcc-hidden-board\.js/.test(LAYOUT));
  check('/pjcc/ inherits that layout', /^---[\s\S]*?layout:\s*default/m.test(HOME));
  check('…and the clock reaches it: default → head → town-weather → pjcc-time',
    /include head\.html/.test(LAYOUT) && /include town-weather\.html/.test(HEAD) &&
    /include pjcc-time\.js/.test(TW));

  check('the modal tells the finder it was left out in the weather',
    /Left out in the (rain|snow)/.test(HIDDEN),
    'without it, a friend who looks tomorrow decides the site is broken');
}

/* ── 3. DRIVE IT: plant, click, miss, solve ───────────────────────────────────────── */
(async () => {
  const exe = findChrome();
  if (!exe) { console.log('\n  (no Chrome found — skipping the browser half)'); done(); return; }
  const browser = await puppeteer.launch({ executablePath: exe, args: ['--no-sandbox'] });

  /* A page shaped like the real one: the script keys off location.pathname, so the URL has
     to BE the host page. Intercepted so nothing leaves the machine.
     ⚠ THE FORECAST IS PART OF THE FIXTURE NOW. The egg refuses to plant on a clear day,
     so a page that doesn't say what the weather is would fail every check below for the
     right reason and teach us nothing. `wx` is stated explicitly per case, which also
     means these runs are the same in July as they are in December. */
  const serve = (page, wx) => page.setRequestInterception(true).then(() => page.on('request', r => r.respond({
    status: 200, contentType: 'text/html',
    body: `<!doctype html><html><head><meta charset="utf-8">
           <script>window.PJCC_TIME={weather:function(){return {kind:${JSON.stringify(wx)}};}};<\/script>
           </head><body>
           <div><h2 data-hb>A heading</h2><p data-hb>Some words on the page.</p>
           <h3 data-hb>Another heading</h3><p>Unmarked — must never be chosen.</p></div>
           <script>${HIDDEN.split('</script>').join('<\\/script>')}<\/script></body></html>`
  })));

  for (const b of HB.BOARDS) {
    const page = await browser.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push(e.message));
    await serve(page, 'rain');
    await page.goto('https://mcpuppystudios.com' + b.page, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 200));

    const planted = await page.evaluate(() => document.querySelectorAll('.hb-mark').length);
    check(`[${b.id}] one mark is planted on ${b.page}`, planted === 1, planted + ' found');

    const named = await page.evaluate(() => {
      const m = document.querySelector('.hb-mark');
      return m ? { label: m.getAttribute('aria-label'), tag: m.tagName } : null;
    });
    check(`[${b.id}] the mark is a real button with an accessible name`,
      named && named.tag === 'BUTTON' && /chessboard/i.test(named.label || ''), named && named.label);

    await page.click('.hb-mark');
    await new Promise(r => setTimeout(r, 120));
    const opened = await page.evaluate(() => ({
      board: !!document.getElementById('hb-wrap'),
      squares: document.querySelectorAll('.hb-sq').length,
      pieces: document.querySelectorAll('.hb-p').length
    }));
    check(`[${b.id}] clicking it expands a full board`,
      opened.board && opened.squares === 64 && opened.pieces > 0,
      `${opened.squares} squares · ${opened.pieces} pieces`);

    // a WRONG move must be refused and must not reward anything
    const wrong = await page.evaluate((from) => {
      const pick = document.querySelector('.hb-p.w[data-sq="' + from + '"]');
      pick.click();
      // any square that is not the answer
      const others = [...document.querySelectorAll('.hb-sq')].map(s => +s.getAttribute('data-sq'));
      const bad = others.find(s => s !== from && s !== window.__ans);
      document.querySelector('.hb-sq[data-sq="' + bad + '"]').click();
      return { say: document.getElementById('hb-say').textContent,
               after: document.getElementById('hb-after').hidden };
    }, b.from);
    check(`[${b.id}] a wrong move is refused`, /Not that one/.test(wrong.say) && wrong.after === true,
      wrong.say.slice(0, 46));
    const flagAfterMiss = await page.evaluate(f => localStorage.getItem(f), b.flag);
    check(`[${b.id}] and rewards nothing`, flagAfterMiss === null, String(flagAfterMiss));

    // now the real move
    const solved = await page.evaluate((from, to) => {
      document.querySelector('.hb-p.w[data-sq="' + from + '"]').click();
      document.querySelector('.hb-sq[data-sq="' + to + '"]').click();
      const after = document.getElementById('hb-after');
      return { say: document.getElementById('hb-say').textContent,
               good: document.getElementById('hb-say').classList.contains('good'),
               afterShown: !after.hidden,
               offersPuzzleRoom: !!after.querySelector('a[href*="fork-in-the-road"]'),
               offersCollection: !!after.querySelector('a[href*="collection"]'),
               markLit: document.querySelector('.hb-mark').classList.contains('found') };
    }, b.from, b.to);
    check(`[${b.id}] the right move solves it`, solved.good && solved.say.length > 0, solved.say.slice(0, 50));
    check(`[${b.id}] it OFFERS the puzzle room — never navigates for you`,
      solved.afterShown && solved.offersPuzzleRoom, 'a link, not a redirect');
    check(`[${b.id}] and points at the collection for the prize`, solved.offersCollection);
    check(`[${b.id}] the mark stays lit once found`, solved.markLit);

    const flag = await page.evaluate(f => localStorage.getItem(f), b.flag);
    check(`[${b.id}] the flag "${b.flag}" is written`, flag === '1', String(flag));
    check(`[${b.id}] no page errors`, errs.length === 0, errs.join(' | ') || 'clean');
    await page.close();
  }

  /* ── 4. it must do NOTHING on a page that hosts no board ───────────────────────── */
  {
    const page = await browser.newPage();
    await serve(page, 'rain');
    await page.goto('https://mcpuppystudios.com/academy/', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 150));
    const n = await page.evaluate(() => document.querySelectorAll('.hb-mark').length);
    check('a page with no board planted gets no mark', n === 0, n + ' marks');
    await page.close();
  }

  /* ── 5. AND NOTHING AT ALL ON A DRY DAY ────────────────────────────────────────────
     The other half of ingenuity #12, and the half a suite would forget: proving the egg
     APPEARS is easy, proving it stays hidden is what makes it a secret. Same host page,
     same hiding places, same script — only the forecast differs. */
  {
    for (const wx of ['clear', 'mist']) {
      const page = await browser.newPage();
      await serve(page, wx);
      await page.goto('https://mcpuppystudios.com' + HB.BOARDS[0].page, { waitUntil: 'domcontentloaded' });
      await new Promise(r => setTimeout(r, 150));
      const n = await page.evaluate(() => document.querySelectorAll('.hb-mark').length);
      check(`on a ${wx} day the board is not there at all`, n === 0, n + ' marks');
      await page.close();
    }
    // …and snow finds it, so the egg survives December
    const page = await browser.newPage();
    await serve(page, 'snow');
    await page.goto('https://mcpuppystudios.com' + HB.BOARDS[0].page, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 150));
    const snowy = await page.evaluate(() => {
      const m = document.querySelector('.hb-mark');
      if (m) m.click();
      const left = document.querySelector('.hb-left');
      return { marks: document.querySelectorAll('.hb-mark').length, left: left && left.textContent };
    });
    check('snow finds it too', snowy.marks === 1, snowy.marks + ' marks');
    check('…and the card says which weather left it there', /snow/i.test(snowy.left || ''),
      snowy.left || 'NO LINE — the finder is never told why it is here today and gone tomorrow');
    await page.close();
  }

  await browser.close();
  done();
})().catch(e => { console.error('\nABORT: ' + e.message); process.exit(2); });

function done() {
  console.log(`\n  ${pass} passed, ${fail} failed\n`);
  process.exit(fail ? 1 : 0);
}
