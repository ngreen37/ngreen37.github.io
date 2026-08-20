/* ═══════════════════════════════════════════════════════════════════════════════════
 * THE PARK TABLES · THE BOT BOARD — drive the real room, with the real engine.
 * -----------------------------------------------------------------------------------
 * Covers the three things Nate asked for on 2026-08-18 and the one thing they all
 * quietly depend on:
 *
 *   1. YOU PICK YOUR SIDE (White · Black · Random) and the board actually turns around.
 *   2. AN ANALYSIS BOARD DURING THE GAME — a sandbox, not an engine. It must move BOTH
 *      colors, must never advance the real game, and must never wake the opponent.
 *   3. ONE TAKEBACK a game, lifting your move AND the reply it drew.
 *   4. A STAR PER (SEAT × SIDE), whole or partial, recording which of those you used.
 *
 * WHAT THIS IS DEFENDING, in order of how expensive the mistake would be:
 *
 *   ⚠⚠ THE SANDBOX MUST NOT LEAK INTO THE GAME. It shares one render function and one
 *      board with the live position — which is exactly why it is worth the harness. A
 *      sandbox move that reached `st.moves` would silently play a move the player never
 *      made, in a rated-feeling game, and nothing on screen would say so.
 *   ⚠⚠ THE FLAGS MUST SURVIVE A RELOAD. They live on the saved board for that reason; a
 *      flag held in a closure hands a full star to anybody who refreshes the page after
 *      using the analysis board. Asserted by reloading, not by reading a variable.
 *   ⚠  A PARTIAL STAR MUST NOT EAT A FULL ONE. The record is the best game you have
 *      played at that seat with that color, so it can only ever go up.
 *   ⚠  THE GRANDFATHER CLAUSE. The locked seats want a full star now; every win banked
 *      before today predates both aids. Without the clause, shipping this re-locks
 *      Princess for players who already earned her.
 *
 * There is no local Jekyll, so this strips the front matter, resolves the handful of
 * `relative_url` filters, COMPILES the real stylesheet with dart-sass (the board's woods
 * are canon tokens — a harness without them measures a different board), and serves the
 * repo over http, because the shared modules are real <script src> requests.
 *
 *   node tests/parktables.check.js            # the checks
 *   node tests/parktables.check.js --shots    # …and write the screenshots
 * ═══════════════════════════════════════════════════════════════════════════════════ */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const { findChrome } = require('./harness');

let sass;
try { sass = require('sass'); }
catch (e) { console.error('dart-sass not installed. Run `npm install` first.'); process.exit(2); }

const ROOT = path.join(__dirname, '..');
const PORT = 8107;
const SRC = path.join(ROOT, 'games', 'park-tables', 'index.html');
const TMP = path.join(ROOT, 'games', 'park-tables', '__pt_test.html');
const TMPCSS = path.join(ROOT, 'assets', 'css', '__pt_test.css');
const SHOTS = process.argv.includes('--shots');
const SHOTDIR = path.join(ROOT, 'tests', '__shots');

/* ⚠⚠ `charset=utf-8` IS LOAD-BEARING. Without it the browser decodes this page's UTF-8 as
   Windows-1252 and every em dash arrives as mojibake — which fails every assertion that
   reads user-facing text while the page itself is fine. [[silent-css-deletions]] */
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8',
               '.wasm': 'application/wasm', '.css': 'text/css; charset=utf-8',
               '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };

/* The Liquid this page actually uses. Anything else FAILS the run rather than being
   silently dropped — a harness that renders a different page from the one that ships is
   worse than no harness. */
function render(src) {
  let s = src.replace(/^---[\s\S]*?\n---\s*\n/, '');
  s = s.replace(/\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\}/g, '');
  s = s.replace(/\{\{\s*'([^']+)'\s*\|\s*relative_url\s*\}\}/g, '$1');
  const leftover = s.match(/\{[{%][\s\S]{0,60}/);
  if (leftover) {
    console.error('  ✗ unhandled Liquid in the page — this harness would test the wrong file:');
    console.error('    ' + leftover[0].replace(/\n/g, ' '));
    process.exit(2);
  }
  /* The page ships inside `layout: page`, which is where the stylesheet and `body_class`
     live. Both matter here: the board reads --chess-lt/dk/frame out of the canon, and the
     room is `theme-hall`. Rebuilt around the stripped page rather than mocked. */
  return '<!doctype html><html><head><meta charset="utf-8">' +
         '<link rel="stylesheet" href="/assets/css/__pt_test.css">' +
         '<style>body{background:#15161a;color:#dfe4ea;font-family:system-ui,sans-serif;' +
         'margin:0;padding:18px}</style></head><body class="theme-hall">' + s + '</body></html>';
}

const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  fs.readFile(p, (e, b) => {
    if (e) { res.writeHead(404); return res.end('nope'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
    res.end(b);
  });
});

let pass = 0, fail = 0;
const ok = (n, c, d) => {
  if (c) { pass++; console.log('  ✓ ' + n + (d !== undefined ? '   ' + d : '')); }
  else { fail++; console.log('  ✗ ' + n + (d !== undefined ? '   ' + d : '')); }
};
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* Maxwell is the harness's opponent throughout: rated 400 with a 120ms movetime, he is the
   fastest seat on the bench and the one whose replies never make this run slow. */
const BOT = 'maxwell';

(async () => {
  fs.writeFileSync(TMP, render(fs.readFileSync(SRC, 'utf8')));
  fs.writeFileSync(TMPCSS, sass.compileString(fs.readFileSync(path.join(ROOT, 'assets/css/style.scss'), 'utf8')
    .replace(/^---[\s\S]*?---\s*/, ''), { loadPaths: [path.join(ROOT, '_sass')], style: 'expanded' }).css);
  if (SHOTS) fs.mkdirSync(SHOTDIR, { recursive: true });
  await new Promise(r => server.listen(PORT, r));
  const b = await puppeteer.launch({ executablePath: findChrome(), args: ['--no-sandbox'] });
  const p = await b.newPage();
  await p.setViewport({ width: 1000, height: 1250, deviceScaleFactor: 2 });
  const errs = [];
  /* ⚠ ONE ARTIFACT IS FILTERED, AND ONLY THIS ONE. `@view-transition { navigation: auto }`
     (_pjcc-23-motion.scss) puts a cross-fade on same-origin navigations; this harness drives
     several `location.href` hops back-to-back to hand the board a finished game, and Chrome
     rejects the in-flight transition of the hop it superseded. It is the harness's own
     impatience, not the room's — a real visitor never navigates twice in one frame, and
     nothing on the page starts a transition itself. Filtered NARROWLY, by exact message, so
     a genuine AbortError from anything else still fails the run. */
  const BENIGN = /AbortError: Transition was skipped/;
  p.on('pageerror', e => { if (!BENIGN.test(String(e))) errs.push(String(e).slice(0, 200)); });
  p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)); });

  const URL = `http://localhost:${PORT}/games/park-tables/__pt_test.html`;
  const shot = async n => { if (SHOTS) await p.screenshot({ path: path.join(SHOTDIR, n + '.png'), fullPage: true }); };

  /* Read the board as the PLAYER sees it: 64 squares in screen order, each carrying the
     true index it draws. That is the only honest way to ask "did the board turn around" —
     asking the engine would just tell us what the engine already knows. */
  const screenBoard = () => p.evaluate(() =>
    Array.from(document.querySelectorAll('.pt-board .pt-sq')).map(el => +el.getAttribute('data-bsq')));
  const tapSq = i => p.evaluate(i => {
    const el = document.querySelector('.pt-board .pt-sq[data-bsq="' + i + '"]');
    if (!el) throw new Error('no square ' + i); el.click();
  }, i);
  const clickId = id => p.evaluate(id => {
    const el = document.getElementById(id); if (!el) throw new Error('no #' + id); el.click();
  }, id);
  const moves = () => p.evaluate(() => (JSON.parse(localStorage.getItem('pjcc.park.bot.v1')) || {}).moves || '');
  const saved = () => p.evaluate(() => JSON.parse(localStorage.getItem('pjcc.park.bot.v1')) || {});
  const stars = () => p.evaluate(() => JSON.parse(localStorage.getItem('pjcc.pt.stars.v1')) || {});
  const text = sel => p.evaluate(s => { const e = document.querySelector(s); return e ? e.textContent.trim() : null; }, sel);
  const seen = sel => p.evaluate(s => {
    const e = document.querySelector(s);
    return !!(e && e.offsetParent !== null && getComputedStyle(e).display !== 'none');
  }, sel);

  console.log('\n=== THE PARK TABLES · THE BOT BOARD ===\n');

  /* ── 1. THE ROOM COMES UP, AND THE BENCH IS THE BENCH ───────────────────────────── */
  await p.goto(URL, { waitUntil: 'networkidle2' });
  await sleep(500);
  ok('the room boots its referee and its engine',
     await p.evaluate(() => !!window.PJCCChess && !!window.PJCCMatch && !!window.PJCCGauntletEngine));
  /* ⚑ DERIVED, NOT TYPED (2026-08-19). This read `=== 8` until Nate split the bench —
     Auston off the ladder into her own block, Nate onto the 1200 rung — and a hard number
     here fails on a LAYOUT change while saying nothing about whether every seat is drawn.
     Reading BOTS out of the page source means the check now says what it means: whatever
     the roster holds, that many cards are on screen. It also covers the real risk the split
     introduced — two panels, and a seat that belongs to NEITHER filter would simply vanish
     with nothing to say so. [[bot-gate]] */
  const rosterSize = (() => {
    const src = fs.readFileSync(path.join(ROOT, 'games/park-tables/index.html'), 'utf8');
    const i = src.indexOf('var BOTS = {');
    const block = src.slice(i, src.indexOf('\n  };', i));
    return [...block.matchAll(/^\s{4}(\w+):\s*\{/gm)].length;
  })();
  const cards = await p.evaluate(() => document.querySelectorAll('[data-bot]').length);
  ok('every seat in BOTS is drawn on the page', cards === rosterSize,
     cards + ' cards · ' + rosterSize + ' in the roster');
  /* ⚠ AND THE SPLIT IS REAL — the ladder and the adaptive seat are two panels, not one.
     If `austonPanel()` ever stops being appended the count above still passes when the
     filter is dropped, so the panel itself is what gets asserted. */
  const panels = await p.evaluate(() => ({
    rungs: document.querySelectorAll('.pt-bots:not(.pt-bots--adapt) [data-bot]').length,
    adapt: document.querySelectorAll('.pt-bots--adapt [data-bot]').length,
  }));
  ok('the ladder and the off-ladder seat are drawn separately',
     panels.rungs === rosterSize - 1 && panels.adapt === 1,
     panels.rungs + ' rungs · ' + panels.adapt + ' adaptive');
  /* ⛑ EVERY OPEN SEAT WEARS ITS OWN COLOR — 2026-08-19, Nate: *"Give each bot box a unique
     color, and that is their aura color for the intro."*
     ⚠⚠ THE SOURCE GATE IN regulars.check.js CANNOT SEE THIS. That one proves the roster
     holds nine distinct aura KEYS and that a rule reads `--bot`; it cannot prove `tint()`
     ever ran. If PJCCVs failed to load, `tint()` returns '' by design and the bench comes up
     nine identical charcoal cards — the graceful fallback working perfectly, and the feature
     silently absent. So this asks the rendered page. [[feature-shipped-but-never-loaded]]
     ⚠ A LOCKED SEAT IS EXCLUDED ON PURPOSE: it keeps the neutral card until you open it. */
  const tints = await p.evaluate(() => [...document.querySelectorAll('[data-bot]')].map(el => ({
    bot: el.dataset.bot,
    locked: el.classList.contains('pt-bot--locked'),
    hex: getComputedStyle(el).getPropertyValue('--bot').trim().toLowerCase(),
  })));
  const openSeats = tints.filter(t => !t.locked);
  const uncolored = openSeats.filter(t => !/^#[0-9a-f]{6}$/.test(t.hex)).map(t => t.bot);
  ok('every open seat is actually painted with its aura', openSeats.length > 0 && uncolored.length === 0,
     uncolored.length ? 'no --bot on: ' + uncolored.join(', ') : openSeats.length + ' seats colored');
  const hexes = openSeats.map(t => t.hex);
  ok('…and no two of them came out the same color',
     hexes.length > 0 && new Set(hexes).size === hexes.length,
     [...new Set(hexes)].length + ' distinct of ' + hexes.length);
  ok('…while a locked seat keeps the neutral card until you open it',
     tints.filter(t => t.locked).every(t => !t.hex),
     tints.filter(t => t.locked).map(t => t.bot).join(', ') || 'none locked in this state');

  /* ⭐ AN UNBEATEN BENCH WEARS NO STARS. Sixteen empty outlines on a bench nobody has
     beaten is decoration on a promise; the first win turns the collection on. */
  ok('…and a player with no wins sees no star chrome at all',
     await p.evaluate(() => document.querySelectorAll('.pt-bots .pt-star').length === 0));
  await shot('01-lobby');

  /* ── 2. WHICH SIDE? ─────────────────────────────────────────────────────────────
     ⛑ IT IS A STRIP UNDER THE BENCH NOW, NOT A SCREEN — 2026-08-20, Nate: *"instead of a
     new window to decide white/black/random ... do what chess.com does and put it as a
     sole option on the bottom."* So the order of these two checks is REVERSED from the
     sheet's: the choice is standing on the lobby before anything is tapped, and the seat
     is one tap. Both halves are asserted, because the whole point of the change is that
     the second tap disappeared. */
  ok('the three colors stand on the bench itself, before any seat is tapped',
     await p.evaluate(() => document.querySelectorAll('.pt-bench-set [data-side]').length === 3));
  ok('…and Random is one of the three',
     await p.evaluate(() => !!document.querySelector('.pt-bench-set [data-side="r"]')));
  /* ⚠⚠ THE STRIP MUST SIT AFTER *BOTH* PANELS. Between them it would read as governing only
     the ladder, telling the player their color does not apply to Auston — which is false.
     Asserted by document position rather than by eye: a CSS change cannot quietly move it. */
  ok('…and it stands below the ladder AND Auston\'s table, so it governs both',
     await p.evaluate(() => {
       const strip = document.querySelector('.pt-bench-set');
       const seats = [...document.querySelectorAll('[data-bot]')];
       return seats.length > 0 && seats.every(s =>
         strip.compareDocumentPosition(s) & Node.DOCUMENT_POSITION_PRECEDING);
     }));
  /* ⚠ 44px IS THE FLOOR THE REST OF THE SITE HOLDS TO, and it is the measurement that
     killed the version of this that lived inside the seat cards (16px stripes). Measured
     on the rendered control, not asserted from the CSS. */
  const ctlBox = await p.evaluate(() => [...document.querySelectorAll('.pt-bench-set [data-side]')]
    .map(e => Math.round(e.getBoundingClientRect().height)));
  ok('…and every one of them clears the 44px tap floor',
     ctlBox.length === 3 && ctlBox.every(h => h >= 44), ctlBox.join(' / ') + ' px tall');
  await shot('02-which-side');

  /* ── 3. PLAYING BLACK — the board turns, and the regular opens ────────────────────
     ⛑ TWO TAPS TOTAL, and they are in this order now: set the color, then take the seat. */
  await p.evaluate(() => document.querySelector('.pt-bench-set [data-side="b"]').click());
  await sleep(120);
  ok('picking a color does not leave the bench — the seats are all still there',
     await p.evaluate(() => document.querySelectorAll('[data-bot]').length > 1));
  await p.evaluate(id => document.querySelector('[data-bot="' + id + '"]').click(), BOT);
  await sleep(1200);
  const sv = await saved();
  ok('the side is written down as a resolved color, never as "random"',
     sv.pc === 'b', 'pc=' + JSON.stringify(sv.pc));
  /* ⚠ THE REAL QUESTION. Screen slot 0 is the top-left square the player is looking at.
     From White it is a8 (index 0); from Black it must be h1 (index 63), or the board did
     not turn around and every coordinate, arrow and material chip below is lying. */
  const sbB = await screenBoard();
  ok('…and the board is drawn from Black\'s side',
     sbB[0] === 63 && sbB[63] === 0, 'top-left slot draws index ' + sbB[0] + ' (want 63)');
  ok('…your nameplate says you have the black pieces',
     (await text('.pt-plate--me')).indexOf('⬛') === 0);
  /* Playing Black means the regular moves first, unprompted — the single most likely thing
     to be forgotten in a room that was White-only for a month. */
  ok('…and the regular opens the game without being asked',
     (await moves()).trim().split(/\s+/).filter(Boolean).length === 1, '"' + (await moves()) + '"');
  await shot('03-playing-black');

  /* ── 4. THE ANALYSIS BOARD, MID-GAME ───────────────────────────────────────────── */
  const beforeLab = await moves();
  ok('the analysis board is offered DURING the game now', await seen('#pt-bot-lab'));
  /* ⚠⚠ THE WASH MUST COST THE BOARD NOTHING, and the first cut of it cost 18px on a desktop
     and 26px on a phone: padding and a border on .pt-boardwrap sit INSIDE its width, so
     every piece re-laid itself the instant the mode was toggled. It reads as a glitch, not
     as a mode, and it is invisible in a screenshot of either state alone — only the pair
     shows it. Measured on both sides of the button rather than eyeballed. */
  const boardBox = () => p.evaluate(() => {
    const r = document.querySelector('.pt-board').getBoundingClientRect();
    return Math.round(r.width) + 'x' + Math.round(r.height);
  });
  const boxBefore = await boardBox();
  const overflowBefore = await p.evaluate(() =>
    document.documentElement.scrollWidth - window.innerWidth);
  await clickId('pt-bot-lab');
  await sleep(250);
  ok('⚠⚠ the board is exactly the same size in analysis as in the game',
     (await boardBox()) === boxBefore, boxBefore + ' → ' + (await boardBox()));
  /* ⚠ ASKED AS A DELTA, NOT AS AN ABSOLUTE. This harness deliberately renders the room
     WITHOUT `layout: page`'s container, so the arena is already wider than the window before
     analysis is opened — an absolute "does the page scroll sideways" would be measuring the
     harness. What must be true is that the wash adds nothing to it. */
  ok('…and the wash adds nothing to the page’s horizontal reach',
     (await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)) <= overflowBefore,
     'overflow ' + overflowBefore + 'px in the game, ' +
     (await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)) + 'px in analysis');
  ok('…and the room visibly changes, so you know where you are',
     await p.evaluate(() => document.getElementById('pt-app').classList.contains('pt-in-lab')));
  ok('…with a way back to the game', await seen('#pt-lab-exit'));
  /* ⚠ THE TWO UNDOS MUST NOT SHARE A VERB. The sandbox's is free and unlimited; the game's
     costs three quarters of a star and there is one a game. A player who has just learned
     one label must not meet the same label meaning the other thing. */
  ok('…and its undo is not called what the costly one is called',
     (await text('#pt-lab-undo') || '').toLowerCase().indexOf('take') < 0,
     '"' + (await text('#pt-lab-undo')) + '" beside the game\'s "Take it back"');
  /* ⚠ THE WASH IS A REAL REPAINT, NOT A CLASS NOBODY STYLED. Ask the browser what the wood
     is actually painted, because a rule that lost the cascade would leave the class on and
     the board identical. [[silent-css-deletions]] */
  const labWood = await p.evaluate(() =>
    getComputedStyle(document.querySelector('.pt-board .pt-sq.lt')).backgroundColor);
  ok('…and the wood really is a different color in analysis mode',
     labWood && labWood !== 'rgba(0, 0, 0, 0)', labWood);
  await shot('04-analysis-mode');

  /* Move BOTH sides in the sandbox — the thing a game board will not let you do. */
  const sbLab = await screenBoard();
  const legalIn = await p.evaluate(m => {
    const g = PJCCMatch.replayGame(m), L = PJCCChess.legalMoves(g.S);
    return L.length ? { from: L[0].from, to: L[0].to } : null;
  }, beforeLab);
  await tapSq(legalIn.from); await sleep(120); await tapSq(legalIn.to); await sleep(300);
  ok('a piece moves in the sandbox', (await p.evaluate(() =>
     document.querySelectorAll('.pt-moves span').length)) > 0);
  ok('⚠⚠ …and the REAL game has not moved a square', (await moves()) === beforeLab,
     'game "' + (await moves()) + '"');
  /* The sandbox's own move list, rebuilt from the game's list plus the one move just played
     — the page keeps it in a closure on purpose, so the harness reconstructs it rather than
     reaching in for a private. */
  await p.evaluate((base, m) => { window.__labMoves = (base + ' ' + m).trim(); },
    beforeLab, await p.evaluate((f, t) => PJCCChess.nameFromSq(f) + PJCCChess.nameFromSq(t),
      legalIn.from, legalIn.to));
  /* ⚠⚠ THE OTHER COLOR, WHICH IS THE FEATURE. On the game board this side belongs to the
     regular and is not tappable at all; in here it has to move, or "experiment with the
     position" is only half true. Asserted by pushing a piece the player does not own. */
  const theirs = await p.evaluate(() => {
    const g = PJCCMatch.replayGame(window.__labMoves), L = PJCCChess.legalMoves(g.S);
    return L.length ? { from: L[0].from, to: L[0].to, side: g.S.turn } : null;
  });
  ok('…and the pieces on the OPPONENT side move in here too — a game board refuses that',
     !!theirs && theirs.side !== (await saved()).pc, 'to move: ' + (theirs && theirs.side));
  if (theirs) { await tapSq(theirs.from); await sleep(120); await tapSq(theirs.to); await sleep(250); }
  ok('…and the real game is STILL untouched after both', (await moves()) === beforeLab,
     'game "' + (await moves()) + '"');
  ok('…and the opponent has NOT been woken up to answer it',
     await p.evaluate(() => !document.querySelector('.pt-state').textContent.match(/thinking/i)),
     '"' + (await text('.pt-state')) + '"');
  ok('…the price of the experiment is on screen while it can still be avoided',
     await seen('.pt-earned--live'), await text('.pt-earned'));
  await shot('05-analysis-moved');

  /* ⚠⚠ THE FLAG IS ON THE SAVE, NOT IN A CLOSURE. Proved by reloading the page, which is
     what a player does, and which would hand back a full star if this were a variable. */
  ok('⚠⚠ the analysis flag is written to the saved board', (await saved()).usedAn === 1);
  await clickId('pt-lab-exit');
  await sleep(300);
  ok('back-to-game puts the room back the way it was',
     !(await p.evaluate(() => document.getElementById('pt-app').classList.contains('pt-in-lab'))));
  ok('…on the real position, untouched', (await moves()) === beforeLab);
  const sbAfter = await screenBoard();
  ok('…still from your side of the board', sbAfter[0] === sbB[0]);

  /* ── 5. THE TAKEBACK ───────────────────────────────────────────────────────────── */
  await p.evaluate(() => { window.confirm = () => true; });
  /* Play one of ours so there is a pair to lift. */
  const mine = await p.evaluate(() => {
    const st = JSON.parse(localStorage.getItem('pjcc.park.bot.v1'));
    const g = PJCCMatch.replayGame(st.moves), L = PJCCChess.legalMoves(g.S);
    return { from: L[0].from, to: L[0].to };
  });
  await tapSq(mine.from); await sleep(150); await tapSq(mine.to);
  await sleep(2500);
  const beforeMull = await moves();
  ok('your move and the regular\'s reply are both on the board',
     beforeMull.trim().split(/\s+/).length === 3, '"' + beforeMull + '"');
  ok('the takeback is offered', await seen('#pt-bot-mull'));
  await clickId('pt-bot-mull');
  await sleep(400);
  const afterMull = await moves();
  ok('⚠ it lifts your move AND the reply it drew — a pair, not a ply',
     afterMull.trim().split(/\s+/).filter(Boolean).length === 1, '"' + afterMull + '"');
  ok('…leaving it your turn again', await p.evaluate(() => {
    const st = JSON.parse(localStorage.getItem('pjcc.park.bot.v1'));
    return PJCCMatch.replayGame(st.moves).S.turn === (st.pc || 'w');
  }));
  ok('⚠ …and it is spent, once a game', (await saved()).usedMul === 1);
  /* ⚠ IT STAYS ON SCREEN, SAYING SO, AND LOOKS SHUT. A control that vanishes takes the
     explanation of why with it; one that looks live and does nothing is worse. */
  const spent = await p.evaluate(() => {
    const b = Array.from(document.querySelectorAll('.pt-tools button'))
      .find(e => /taken back/i.test(e.textContent));
    return b ? { there: true, off: b.disabled, dim: +getComputedStyle(b).opacity } : { there: false };
  });
  ok('…which the button says out loud rather than vanishing',
     spent.there && spent.off && !(await seen('#pt-bot-mull')), JSON.stringify(spent));
  ok('…and a spent control actually LOOKS shut', spent.dim < 0.7, 'opacity ' + spent.dim);
  ok('…and the star this game can still earn has dropped to a quarter',
     /quarter/i.test(await text('.pt-earned') || ''), await text('.pt-earned'));
  await shot('06-taken-back');

  /* ── 6. THE STARS ──────────────────────────────────────────────────────────────── */
  /* Rather than play out a whole win eight times, hand the board a finished game and let
     the room's own botFinish decide what it is worth. Fool's mate, from both sides. */
  const award = (pc, uci, flags) => p.evaluate((pc, uci, flags, bot) => {
    localStorage.setItem('pjcc.park.bot.v1', JSON.stringify(
      Object.assign({ bot: bot, moves: uci, done: 0, pc: pc }, flags)));
    location.href = location.pathname + '?table=' + bot;
  }, pc, uci, flags, BOT);

  /* TWO mates, and which one you use depends on which chair the player is in — the whole
     point of the feature is that '1-0' no longer means "you won". WHITE_MATES is fool's mate
     mirrored (1.e4 f6 2.d4 g5 3.Qh5#); BLACK_MATES is the original (1.f3 e5 2.g4 Qh4#). */
  const WHITE_MATES = 'e2e4 f7f6 d2d4 g7g5 d1h5';
  const BLACK_MATES = 'f2f3 e7e5 g2g4 d8h4';

  await award('w', WHITE_MATES, {});
  await sleep(1400);
  ok('a clean win banks a FULL star', ((await stars())[BOT] || {}).w === 'full',
     JSON.stringify((await stars())[BOT]));
  /* ⚑ AND IT SAYS SO. A reward that is only ever mentioned when it has been reduced is a
     penalty with a star drawn on it — the clean win is the moment the feature exists for. */
  ok('…and the board says what was earned, on a clean win too',
     await seen('.pt-earned--won'), await text('.pt-earned'));
  /* The finished board is where the four-button row lives — review, the Stockfish board,
     rematch, and the one that turns you around. Worth a picture. */
  ok('a finished board offers the other side as a rematch', await seen('#pt-bot-swap'),
     await text('#pt-bot-swap'));
  await shot('08-finished');

  await p.evaluate(() => localStorage.removeItem('pjcc.pt.stars.v1'));
  await award('b', BLACK_MATES, {});
  await sleep(1400);
  let S1 = (await stars())[BOT] || {};
  ok('…and the star\'s color is the side you won with', S1.b === 'full', JSON.stringify(S1));

  await award('b', BLACK_MATES, { usedAn: 1 });
  await sleep(1400);
  let S2 = (await stars())[BOT] || {};
  ok('⚠ a helped rematch never eats the full star you already own', S2.b === 'full', JSON.stringify(S2));

  await p.evaluate(() => localStorage.removeItem('pjcc.pt.stars.v1'));
  await award('b', BLACK_MATES, { usedAn: 1 });
  await sleep(1400);
  ok('the analysis board alone earns a HALF star', ((await stars())[BOT] || {}).b === 'half',
     JSON.stringify((await stars())[BOT]));

  await p.evaluate(() => localStorage.removeItem('pjcc.pt.stars.v1'));
  await award('b', BLACK_MATES, { usedMul: 1 });
  await sleep(1400);
  ok('the takeback alone earns a QUARTER star', ((await stars())[BOT] || {}).b === 'quarter',
     JSON.stringify((await stars())[BOT]));

  await p.evaluate(() => localStorage.removeItem('pjcc.pt.stars.v1'));
  await award('b', BLACK_MATES, { usedAn: 1, usedMul: 1 });
  await sleep(1400);
  ok('⚠ both aids together earn the SMALLER of the two — the takeback outranks',
     ((await stars())[BOT] || {}).b === 'quarter', JSON.stringify((await stars())[BOT]));

  /* A loss earns nothing, and must not quietly write a star of any size. */
  await p.evaluate(() => localStorage.removeItem('pjcc.pt.stars.v1'));
  await award('w', BLACK_MATES, {});             // the player is White, and White is the one mated
  await sleep(1400);
  ok('losing earns no star at all', Object.keys(await stars()).length === 0,
     JSON.stringify(await stars()));

  /* ── 7. THE LOCKED SEATS ───────────────────────────────────────────────────────── */
  const lockedCard = () => p.evaluate(() => {
    const el = document.querySelector('[data-bot="princess"]');
    return el ? { locked: el.disabled, words: el.textContent.replace(/\s+/g, ' ').trim() } : null;
  });
  const backToPark = async () => { await p.goto(URL, { waitUntil: 'networkidle2' }); await sleep(500); };

  await p.evaluate(() => { localStorage.removeItem('pjcc.pt.stars.v1');
                           localStorage.removeItem('pjcc.pt.beaten.v1'); });
  await backToPark();
  ok('Princess starts locked', (await lockedCard()).locked);

  /* A HELPED win over Robert must not open her seat — his call, 2026-08-18. */
  await p.evaluate(() => {
    localStorage.setItem('pjcc.pt.beaten.v1', JSON.stringify(['robert']));
    localStorage.setItem('pjcc.pt.stars.v1', JSON.stringify({ robert: { w: 'half' } }));
  });
  await backToPark();
  let lc = await lockedCard();
  ok('⚠ a win with the analysis board does NOT open her seat', lc.locked, lc.words);
  ok('…and the card names the price it now wants, rather than one already paid',
     /no help/i.test(lc.words), lc.words);

  await p.evaluate(() => localStorage.setItem('pjcc.pt.stars.v1', JSON.stringify({ robert: { w: 'full' } })));
  await backToPark();
  ok('a full star opens her seat', !(await lockedCard()).locked);

  /* ⚠⚠ THE GRANDFATHER CLAUSE — a save from before stars existed. Every bot board was
     White-only and neither aid existed, so those wins were all clean wins. Without this,
     shipping stars re-locks a seat somebody already earned, which is the worst thing an
     update can do to a save. */
  await p.evaluate(() => {
    localStorage.removeItem('pjcc.pt.stars.v1');
    localStorage.setItem('pjcc.pt.beaten.v1', JSON.stringify(['robert']));
  });
  await backToPark();
  ok('⚠⚠ a win banked BEFORE stars existed still opens her seat',
     !(await lockedCard()).locked, 'no star record, robert in the old beaten list');
  ok('…and it is drawn as the white star it was won with',
     await p.evaluate(() => {
       const el = document.querySelector('[data-bot="robert"] .pt-star');
       return !!el && el.className.indexOf('pt-star--w') >= 0 && el.className.indexOf('pt-star--full') >= 0;
     }));
  await shot('07-bench-with-stars');

  /* ══ 9. THE CLOCK ═══════════════════════════════════════════════════════════════════
     2026-08-20, Nate: *"We should also add time control options. We can use the general
     terms like bullet and blitz, etc, right?"* — on the BOT boards, which is the half of
     this page that can have a real total-game clock (the live tables need SQL time banks
     and Realtime first; see the note over the clock block in the room).

     Everything here is driven through the real room. A clock is exactly the kind of feature
     that passes a source check while being wrong on screen — the arithmetic can be perfect
     and still be charged to the wrong player. [[green-must-name-what-ran]] */
  const clockState = () => p.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('pjcc.park.bot.v1')) || {};
    const pill = [...document.querySelectorAll('[data-clock]')].map(e => ({
      c: e.getAttribute('data-clock'), t: e.textContent, run: e.classList.contains('run'),
      low: e.classList.contains('low'), off: e.classList.contains('off') }));
    return { tc: s.tc, mw: s.mw, mb: s.mb, pc: s.pc, done: s.done,
             result: s.result, reason: s.reason, moves: (s.moves || '').trim(), pill };
  });
  const pickCtl = (attr, v) => p.evaluate((a, val) => {
    const el = document.querySelector('[' + a + '="' + val + '"]');
    if (!el) throw new Error('no control ' + a + '=' + val); el.click();
  }, attr, v);

  await p.evaluate(() => { localStorage.removeItem('pjcc.park.bot.v1');
                           localStorage.removeItem('pjcc.pt.stars.v1');
                           localStorage.removeItem('pjcc.pt.beaten.v1'); });
  await backToPark();

  ok('the bench offers a clock as well as a color',
     await p.evaluate(() => document.querySelectorAll('.pt-bench-set [data-tc]').length === 4));
  /* ⚠⚠ "No clock" IS THE DEFAULT AND THAT IS THE COMPATIBILITY PROMISE. Every regular has
     been clockless since the bench opened; a clock that arrived switched on would change a
     game people already know without being asked for. */
  ok('…and No clock is the one already selected',
     await p.evaluate(() => document.querySelector('.pt-bench-set [data-tc=""]').classList.contains('on')));
  ok('…so a clockless board still carries no clock at all, exactly as before',
     await p.evaluate(() => document.querySelectorAll('[data-clock]').length === 0));

  /* ── the control is stamped onto the board at sit-down ─────────────────────────── */
  await pickCtl('data-tc', 'b5');
  await pickCtl('data-side', 'w');
  await p.evaluate(id => document.querySelector('[data-bot="' + id + '"]').click(), BOT);
  await sleep(400);
  let ck = await clockState();
  ok('picking Blitz and sitting down stamps the control on the saved board',
     ck.tc === 'b5' && ck.mw === 300000 && ck.mb === 300000,
     'tc=' + ck.tc + ' mw=' + ck.mw + ' mb=' + ck.mb);
  ok('…and both nameplates wear a clock reading five minutes',
     ck.pill.length === 2 && ck.pill.every(x => x.t === '5:00'),
     ck.pill.map(x => x.c + ':' + x.t).join(' '));
  ok('…and the board says which control it is being played under',
     /Blitz 5\+0/.test(await text('.pt-row-chips')), await text('.pt-row-chips'));

  /* ⚠ IT MUST NOT RUN BEFORE THE FIRST MOVE. Sitting down and reading the bench for a
     minute is not a game in progress, and a clock that started on arrival would flag
     somebody who never played. Asserted by WAITING and re-reading, not by reading a flag. */
  await sleep(900);
  ck = await clockState();
  ok('⚠ the clock does not run before the first move is played',
     ck.pill.every(x => x.t === '5:00') && !ck.pill.some(x => x.run),
     ck.pill.map(x => x.c + ':' + x.t).join(' '));

  /* A helper, because this is done twice and the second time is the one that counts. */
  const playOne = async (pause) => {
    const mv = await p.evaluate(() => {
      const st = JSON.parse(localStorage.getItem('pjcc.park.bot.v1'));
      const g = PJCCMatch.replayGame(st.moves || ''), L = PJCCChess.legalMoves(g.S);
      return { from: L[0].from, to: L[0].to };
    });
    await tapSq(mv.from); await sleep(pause); await tapSq(mv.to);
    await sleep(1400);                                  // let the regular answer
  };

  /* ⭐ THE OPENING MOVE IS FREE, AND THAT IS THE DESIGN, NOT A LEAK. The clock starts when
     the game does — on the first move — because the alternative is that sitting down and
     reading the bench for two minutes flags you before you have played a move. It is also
     what chess.com's bots do. Pinned down here so it cannot be quietly "fixed" into a room
     that punishes arriving. */
  await playOne(1400);
  ck = await clockState();
  ok('⭐ the move that STARTS the game is free — the clock starts with it, not before it',
     ck.mw === 300000, 'you still have ' + ck.mw + 'ms after a 1.4s first move');
  ok('…and from that move on the regular is on its own clock',
     ck.mb < 300000, BOT + ' spent ' + (300000 - ck.mb) + 'ms');

  /* ⚠⚠ AND NOW THE PUNCH ORDER, WHICH IS THE BUG THIS SECTION EXISTS FOR. `clockSide()`
     reads the ply count, so the instant a move is appended it names the OTHER player —
     banking after the append instead of before would charge your think to your opponent,
     and every total on screen would still look perfectly plausible. Maxwell answers in
     ~120ms, so a 1.4s think of ours is unmistakably ours. */
  const wBefore = ck.mw, bBefore = ck.mb;
  await playOne(1400);
  ck = await clockState();
  const spentW = wBefore - ck.mw, spentB = bBefore - ck.mb;
  ok('⚠⚠ the time you spent thinking came off YOUR clock, not the regular\'s',
     spentW >= 1000 && spentB < 1000,
     'you spent ' + spentW + 'ms · ' + BOT + ' spent ' + spentB + 'ms');

  /* ⚠⚠ THE ANALYSIS BOARD PAUSES IT — a deliberate refusal to charge twice. Opening the
     sandbox already costs you most of a star; if it also burned your clock the two prices
     would compound into "never open this in bullet", which is the feature turning itself
     off. Measured across a real wait, in the real sandbox. */
  await clickId('pt-bot-lab');
  await sleep(200);
  const parked = (await clockState()).pill.map(x => x.t).join('|');
  await sleep(1200);
  ok('⚠⚠ the analysis board pauses the clock instead of charging you twice',
     (await clockState()).pill.map(x => x.t).join('|') === parked,
     parked + ' → ' + (await clockState()).pill.map(x => x.t).join('|'));
  await clickId('pt-lab-exit');
  await sleep(200);

  /* ⚠ AND GETTING UP BANKS IT. Without this, "← The park" and straight back in returns
     every second of the think you were in the middle of — a refill you could lean on once
     a move. Read from the SAVE, which is the thing that has to carry it. */
  const beforeLeave = (await clockState()).mw;
  await sleep(900);
  await clickId('pt-back');
  await sleep(400);
  const banked = (await clockState()).mw;
  ok('⚠ walking back to the park banks the running clock, it is not a free refill',
     banked < beforeLeave, beforeLeave + 'ms → ' + banked + 'ms on the saved board');

  /* ── the flag ────────────────────────────────────────────────────────────────────
     Wound down by writing a nearly-empty bank onto the saved board and re-entering the
     room, rather than by waiting five real minutes. The board resumes from its save, so
     this is the same code path a genuine low clock reaches. */
  await p.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('pjcc.park.bot.v1'));
    s.mw = 250;                                   // you are White, and you have a quarter second
    localStorage.setItem('pjcc.park.bot.v1', JSON.stringify(s));
    localStorage.removeItem('pjcc.pt.stars.v1');
  });
  await p.goto(URL + '?table=' + BOT, { waitUntil: 'networkidle2' });
  await sleep(1500);
  ck = await clockState();
  ok('running out of time ends the game', !!ck.done, 'done=' + ck.done);
  ok('…as a LOSS, in PGN terms, for the side that flagged',
     ck.result === '0-1' && ck.reason === 'timeout',
     ck.result + ' · ' + ck.reason);
  /* ⚠⚠ HIS RULE: *"flagging is a loss, no star."* It falls out of routing the flag through
     the same tail every other ending uses — a star is only ever awarded behind `botWon` —
     but it is the half of the sentence a player would feel, so it is asserted rather than
     reasoned about. */
  ok('⚠⚠ …and it earns no star, the same as any other loss',
     await p.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('pjcc.pt.stars.v1')) || {}).length === 0),
     JSON.stringify(await stars()));
  ok('…and the board says so in words',
     /timeout/.test(await text('.pt-state')), await text('.pt-state'));
  await shot('09-flagged');

  /* ══ 10. THE REGULAR'S CLOCK, SWITCHED OFF FROM THE BOARD ════════════════════════
     2026-08-20, Nate: *"You can also turn Bot clock off if you choose (an option available
     IN-GAME)."* You keep your clock; the regular plays untimed. */
  await p.evaluate(() => { localStorage.removeItem('pjcc.park.bot.v1');
                           localStorage.setItem('pjcc.pt.tc.v1', ''); });
  await backToPark();
  await p.evaluate(id => document.querySelector('[data-bot="' + id + '"]').click(), BOT);
  await sleep(400);
  /* ⚠ NO CLOCK, NO BUTTON. The row this lives in has had three controls since it was
     built, and a fourth that appears in a game with nothing to switch would be a control
     about a feature that is not on. */
  ok('a clockless game does not grow a bot-clock button',
     await p.evaluate(() => !document.getElementById('pt-bot-clock')));

  await p.evaluate(() => { localStorage.removeItem('pjcc.park.bot.v1');
                           localStorage.setItem('pjcc.pt.tc.v1', 'b5'); });
  await backToPark();
  await p.evaluate(id => document.querySelector('[data-bot="' + id + '"]').click(), BOT);
  await sleep(400);
  ok('…but a timed one does, and it starts On',
     await p.evaluate(() => {
       const b = document.getElementById('pt-bot-clock');
       return !!b && b.getAttribute('aria-pressed') === 'true' && /On/.test(b.textContent);
     }));
  await playOne(300);
  await clickId('pt-bot-clock');
  await sleep(250);
  ck = await clockState();
  /* ⭐ THE DASH IS THE POINT. A clock stuck at 4:58 for ten moves looks like a bug; a dash
     looks like a decision, which is what it is. Read off the RENDERED pill, by color, so
     this cannot pass by switching off the wrong one. */
  const botColor = ck.pc === 'w' ? 'b' : 'w';
  ok('switching it off puts a dash on the REGULAR\'s plate',
     ck.pill.some(x => x.c === botColor && x.t === '–' && x.off),
     ck.pill.map(x => x.c + ':' + x.t).join(' '));
  ok('…and leaves YOUR clock exactly where it was',
     ck.pill.some(x => x.c === ck.pc && /^\d/.test(x.t) && !x.off),
     ck.pill.map(x => x.c + ':' + x.t).join(' '));
  ok('…and the button says so', await p.evaluate(() => {
       const b = document.getElementById('pt-bot-clock');
       return !!b && b.getAttribute('aria-pressed') === 'false' && /Off/.test(b.textContent);
     }));

  /* ⚠⚠ AND THE BANK MUST NOT DRAIN WHILE IT IS OFF — which is a SEPARATE guard from the one
     that stops it flagging, and this check exists because the first version of this section
     did not know that. There are two: `clockSync()` refuses to start the stopwatch on a
     switched-off side, and `clockTick()` refuses to flag one. Deleting the first left every
     check green — the tick guard covered for it — while the regular's bank quietly drained
     behind a dash. Switch it back ON mid-game and you would find time missing that nothing
     on screen ever spent. So: note the bank, play two real moves with it off, switch back
     on, and demand the number is exactly where it was. [[green-must-name-what-ran]] */
  const bankOff = await p.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('pjcc.park.bot.v1'));
    return s[s.pc === 'w' ? 'mb' : 'mw'];
  });
  await playOne(700);
  await playOne(700);
  await clickId('pt-bot-clock');                       // …and back on
  await sleep(250);
  const bankBack = await p.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('pjcc.park.bot.v1'));
    return s[s.pc === 'w' ? 'mb' : 'mw'];
  });
  ok('⚠⚠ …and its bank does not drain behind the dash while it is off',
     bankBack === bankOff, bankOff + 'ms → ' + bankBack + 'ms across two moves');
  await clickId('pt-bot-clock');                       // leave it off for the checks below
  await sleep(250);

  /* ⚠⚠ AND IT SURVIVES A RELOAD, because it rides on the saved board rather than in a
     closure — the same rule the analysis and takeback flags follow. A setting that
     evaporated on refresh would be worse than no setting. */
  const offBefore = (await clockState()).mw;
  await p.goto(URL + '?table=' + BOT, { waitUntil: 'networkidle2' });
  await sleep(700);
  ok('⚠ the choice survives a reload', await p.evaluate(() => {
       const b = document.getElementById('pt-bot-clock');
       return !!b && b.getAttribute('aria-pressed') === 'false';
     }), 'it lives on the saved board, not in a variable');

  /* ⚠⚠ THE BEHAVIOR, END TO END: A SWITCHED-OFF CLOCK NEVER ENDS THE GAME. Wound to exactly
     zero — the state where every downstream check would flag — and then left alone while
     the regular thinks.
     ⚠ BE HONEST ABOUT WHAT THIS PROVES. It proves the OUTCOME, not any one line. There are
     two guards in the room (clockSync will not start the stopwatch on a switched-off side;
     clockTick will not flag one), and mutation-testing showed the SECOND is unreachable
     while the first exists — deleting it leaves this green, because the tick is not running
     at all. So the drain check above is what actually pins the live guard, and this one is
     the promise a player would feel. Both are worth having; only one is a line test. */
  await p.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('pjcc.park.bot.v1'));
    s[s.pc === 'w' ? 'mb' : 'mw'] = 0;            // the REGULAR's bank, genuinely empty
    localStorage.setItem('pjcc.park.bot.v1', JSON.stringify(s));
  });
  await p.goto(URL + '?table=' + BOT, { waitUntil: 'networkidle2' });
  await sleep(1800);
  ck = await clockState();
  ok('⚠⚠ a switched-off clock cannot fall, however long the regular takes',
     !ck.done, 'done=' + ck.done + ' result=' + (ck.result || 'none'));
  ok('…and YOUR clock is still the one running', ck.mw !== undefined && ck.mw > 0,
     'you have ' + ck.mw + 'ms');
  await shot('10-bot-clock-off');

  await p.evaluate(() => { localStorage.removeItem('pjcc.park.bot.v1');
                           localStorage.setItem('pjcc.pt.tc.v1', ''); });

  ok('no runtime errors anywhere in the run', errs.length === 0, errs.slice(0, 3).join(' | '));

  console.log('\nRESULT: ' + (fail ? 'FAIL' : 'PASS') + ' — ' + pass + ' passed, ' + fail + ' failed');
  if (SHOTS) console.log('screenshots → tests/__shots/');
  await b.close();
  server.close();
  try { fs.unlinkSync(TMP); fs.unlinkSync(TMPCSS); } catch (e) {}
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); try { fs.unlinkSync(TMP); fs.unlinkSync(TMPCSS); } catch (x) {} process.exit(2); });
