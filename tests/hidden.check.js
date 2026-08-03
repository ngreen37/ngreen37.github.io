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
  new Function('window', 'document', 'localStorage', 'location', HIDDEN)(win, {
    readyState: 'complete', addEventListener() {}, createElement: () => ({ style: {}, classList: { add() {} }, setAttribute() {}, addEventListener() {}, appendChild() {} }),
    querySelectorAll: () => [], body: { appendChild() {} }, getElementById: () => null
  }, { getItem: () => null, setItem() {} }, { pathname: '/nowhere/' });
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

/* ── 3. DRIVE IT: plant, click, miss, solve ───────────────────────────────────────── */
(async () => {
  const exe = findChrome();
  if (!exe) { console.log('\n  (no Chrome found — skipping the browser half)'); done(); return; }
  const browser = await puppeteer.launch({ executablePath: exe, args: ['--no-sandbox'] });

  for (const b of HB.BOARDS) {
    const page = await browser.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push(e.message));
    /* A page shaped like the real one: the script keys off location.pathname, so the URL
       has to BE the host page. Intercepted so nothing leaves the machine. */
    await page.setRequestInterception(true);
    page.on('request', r => r.respond({
      status: 200, contentType: 'text/html',
      body: `<!doctype html><html><head><meta charset="utf-8"></head><body>
             <div><h2 data-hb>A heading</h2><p data-hb>Some words on the page.</p>
             <h3 data-hb>Another heading</h3><p>Unmarked — must never be chosen.</p></div>
             <script>${HIDDEN.split('</script>').join('<\\/script>')}<\/script></body></html>`
    }));
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
    await page.setRequestInterception(true);
    page.on('request', r => r.respond({
      status: 200, contentType: 'text/html',
      body: `<!doctype html><html><head><meta charset="utf-8"></head><body><div>
             <h2 data-hb>Not a host page</h2><p data-hb>Plenty of spots — but no board lives here.</p></div>
             <script>${HIDDEN.split('</script>').join('<\\/script>')}<\/script></body></html>`
    }));
    await page.goto('https://mcpuppystudios.com/academy/', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 150));
    const n = await page.evaluate(() => document.querySelectorAll('.hb-mark').length);
    check('a page with no board planted gets no mark', n === 0, n + ' marks');
    await page.close();
  }

  await browser.close();
  done();
})().catch(e => { console.error('\nABORT: ' + e.message); process.exit(2); });

function done() {
  console.log(`\n  ${pass} passed, ${fail} failed\n`);
  process.exit(fail ? 1 : 0);
}
