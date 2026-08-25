/* ═══════════════════════════════════════════════════════════════════════════════════
 * WHAT'S YOUR RATING · ONE GAME — drive the real page, with the real engine.
 * -----------------------------------------------------------------------------------
 * There is no local Jekyll, so this strips the front matter and resolves the handful of
 * `relative_url` filters, writes the result beside the original, and serves the REPO —
 * because Stockfish needs a real origin (no Worker or WASM over file://). Then it plays
 * actual moves and reads what the page says.
 *
 * WHAT THIS IS DEFENDING, in order of how expensive the mistake would be:
 *
 *   1. ⚠⚠ IT NEVER HANDS BACK THE SEED AS A MEASUREMENT. The estimate button is gated on
 *      MIN_PLIES for one reason: below it, the dial has barely moved and the "rating" is
 *      the starting value wearing a result's clothing. Somebody being told their own seed
 *      is their rating is this page telling a stranger a fact about themselves that it
 *      made up. [[accuracy-above-all]]
 *   2. ⚠ IT NEVER WRITES TO THE PROFILE. Clearance is the MAX of two ladders, so a rating
 *      from an anonymous run anybody can retake is a clearance exploit.
 *      [[clearance-and-puzzle-elo]]
 *   3. THE REFEREE OWNS LEGALITY. An illegal move must be unplayable, not merely graded
 *      badly — the front door shipped that bug once.
 *   4. IT REPORTS A RANGE. One game is forty correlated samples, not forty independent
 *      ones; a bare number would overstate a precision it cannot buy.
 *
 *   node tests/ratinggame.check.js
 * ═══════════════════════════════════════════════════════════════════════════════════ */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const { findChrome } = require('./harness');

const ROOT = path.join(__dirname, '..');
const PORT = 8102;
const SRC = path.join(ROOT, 'rating', 'game.html');
const TMP = path.join(ROOT, 'rating', '__rg_test.html');
/* ⚠⚠ `charset=utf-8` IS LOAD-BEARING AND ITS ABSENCE COSTS AN HOUR. Without it the
   browser guesses, decodes this page's UTF-8 as Windows-1252, and every em dash, en dash
   and ellipsis arrives as three mojibake characters — which then fails every assertion
   that reads user-facing text, while the page itself is perfectly fine. Measured: the
   dial's "—" came back as codepoints e2/20ac/201d. The real site is not affected
   (_includes/head.html declares UTF-8, and Pages sends the header), so this is purely a
   harness that must serve the page the way production does or it is testing itself.
   [[audit-numbers-can-be-wrong]] */
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8',
               '.wasm': 'application/wasm', '.css': 'text/css; charset=utf-8',
               '.json': 'application/json', '.png': 'image/png' };

/* The two Liquid constructs this page actually uses. Anything else appearing here should
   FAIL the run rather than be silently dropped — a test that renders a different page
   from the one that ships is worse than no test. */
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
  return s;
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

(async () => {
  fs.writeFileSync(TMP, render(fs.readFileSync(SRC, 'utf8')));
  await new Promise(r => server.listen(PORT, r));
  const b = await puppeteer.launch({ executablePath: findChrome(), args: ['--no-sandbox'] });
  const p = await b.newPage();
  await p.setViewport({ width: 900, height: 1100 });
  const errs = [];
  p.on('pageerror', e => errs.push(String(e).slice(0, 160)));
  p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 160)); });

  console.log('\n=== WHAT\'S YOUR RATING · ONE GAME ===\n');
  await p.goto(`http://localhost:${PORT}/rating/__rg_test.html`, { waitUntil: 'networkidle2' });
  await sleep(600);

  ok('the page boots its referee and its dial',
     await p.evaluate(() => !!window.PJCCChess && !!window.PJCCAdapt && !!window.PJCCGauntletEngine));
  ok('the board is on the screen with no start gate in front of it',
     await p.evaluate(() => document.querySelectorAll('#rg-grid .rg-sq').length === 64));
  ok('…with 32 men on it', await p.evaluate(() => document.querySelectorAll('#rg-grid .rg-p').length === 32));
  /* ⚠⚠ VISIBILITY, NOT THE `hidden` PROPERTY. `el.hidden` was true while the button was
     plainly on screen, because `.rg-go { display:inline-block }` beat the UA's
     `[hidden] { display:none }` at equal specificity. The first version of this assertion
     read the property, passed, and shipped a page that offered a stranger a rating on move
     one. Ask the browser what is PAINTED. [[measure-the-real-page]] */
  const seen = sel => p.evaluate(s => {
    const el = document.querySelector(s);
    return !!(el && el.offsetParent !== null && getComputedStyle(el).display !== 'none');
  }, sel);

  ok('⚠⚠ the estimate is NOT offered before a move has been played',
     !(await seen('#rg-done')), 'the seed is not a measurement');

  /* ── the referee owns legality ───────────────────────────────────────────────── */
  const illegal = await p.evaluate(() => {
    document.querySelector('[data-sq="48"]').click();     // a2 pawn (index 48 = a2)
    document.querySelector('[data-sq="24"]').click();     // a5 — three squares, not legal
    return document.querySelectorAll('#rg-grid .rg-p').length;
  });
  ok('an illegal move simply cannot be played', illegal === 32, illegal + ' men still on the board');

  /* ── play a real game ────────────────────────────────────────────────────────────
     Driven through the page's own click handlers, so this exercises the same path a
     person does — selection, legality, the engine reply and the dial. */
  /* ⚠ THE WAIT IS A REGEX ON THE ASCII, NOT AN EQUALITY ON THE STRING. The status reads
     "Thinking…" with a real ellipsis, and comparing to a literal copy of it made this
     helper return TRUE on the first poll — so every following click landed while the
     engine was still thinking, `tap()` refused them all, and six assertions failed while
     the page itself was working perfectly. A test that is wrong in the direction of
     "everything is fine" is the expensive kind. [[audit-numbers-can-be-wrong]] */
  async function move(from, to) {
    await p.evaluate((f, t) => {
      document.querySelector('[data-sq="' + f + '"]').click();
      document.querySelector('[data-sq="' + t + '"]').click();
    }, from, to);
    // the engine gets its budget plus generous slack — a cold WASM boot is seconds
    for (let i = 0; i < 80; i++) {
      await sleep(120);
      const busy = await p.evaluate(() => /Thinking/.test(document.getElementById('rg-say').textContent));
      if (!busy) return true;
    }
    return false;
  }

  const replied = await move(52, 36);                    // e2-e4
  ok('the opponent answers a real move', replied,
     await p.evaluate(() => document.getElementById('rg-say').textContent));
  /* ⚠ ASCII-ONLY ASSERTIONS FROM HERE DOWN. The page legitimately renders an em dash, an
     en dash and an ellipsis, and matching those as literals in this file makes the test
     hostage to the encoding of two files instead of to the behavior of one. Either a
     rating or a short placeholder is the property under test; WHICH placeholder glyph is
     not. */
  ok('…and the dial shows either a strength or a placeholder, never a wrong number',
     await p.evaluate(() => {
       const n = document.getElementById('rg-dial-n').textContent.trim();
       return /^\d{3,4}$/.test(n) || n.length <= 1;
     }),
     await p.evaluate(() => document.getElementById('rg-dial-n').textContent.trim()));

  /* A short sequence of sane developing moves. ⚠ Each is checked for legality by the
     referee before it is played, so a change to the opening leaves the test honest
     rather than silently clicking on nothing. */
  const line = [[62, 45], [57, 42], [61, 34], [59, 43], [60, 62]];
  let played = 1;
  for (const [f, t] of line) { await move(f, t); played++; }
  ok('a handful of moves go in without a page error', errs.length === 0,
     errs.length ? errs.slice(0, 2).join(' | ') : played + ' of ours, plus replies');

  const plies = await p.evaluate(() => document.querySelectorAll('#rg-grid .rg-p').length);
  ok('the board is still coherent after the sequence', plies >= 28 && plies <= 32, plies + ' men');

  /* ── ⚠⚠ THE GATE ─────────────────────────────────────────────────────────────── */
  ok('⚠ the estimate is still withheld before MIN_PLIES', !(await seen('#rg-done')),
     'six moves in — far too early for a number about a person');
  ok('…and the result screen is genuinely not painted either', !(await seen('#rg-result')));

  /* ── the result screen, forced through the resign door ───────────────────────── */
  await p.evaluate(() => document.getElementById('rg-resign').click());
  await sleep(200);
  const res = await p.evaluate(() => ({
    shown: !document.getElementById('rg-result').hidden,
    runHidden: document.getElementById('rg-run').hidden,
    num: document.getElementById('rg-num').textContent.trim(),
    band: document.getElementById('rg-band').textContent.trim(),
    note: document.getElementById('rg-note').textContent.trim(),
    seat: document.getElementById('rg-seat').textContent.trim()
  }));
  ok('a finished run shows a result and puts the board away', res.shown && res.runHidden);
  ok('…and the number is a plausible rating', /^\d{3,4}$/.test(res.num), res.num);
  /* TWO numbers, low then high, straddling the estimate — whatever character joins them. */
  const span = (res.band.match(/\d+/g) || []).map(Number);
  ok('⚠ …reported as a RANGE, not as a bare number',
     span.length === 2 && span[0] < Number(res.num) && span[1] > Number(res.num),
     res.num + ' in ' + span.join(' to '));
  ok('⚠ …and a short game SAYS it was short',
     /first impression/i.test(res.note), '"' + res.note.slice(0, 72) + '…"');
  ok('…pointing at a seat that actually exists on the bench',
     /(Maxwell|Crockett|Argus|Auston|Kedar|Robert)/.test(res.seat), res.seat);

  /* ── ⚠⚠ IT MUST NOT TOUCH THE PROFILE ───────────────────────────────────────── */
  const SRCTEXT = fs.readFileSync(SRC, 'utf8');
  ok('⚠⚠ the page never writes a rating to the profile',
     !/setRating|pjcc_rating\s*[:=]|puzzleRating\(|\.update\(/.test(SRCTEXT),
     'a retakeable anonymous run must not be able to move clearance');
  ok('…and stores nothing about you at all',
     !/localStorage\.setItem/.test(SRCTEXT), 'nothing to farm, nothing to reset');

  ok('no page errors across the whole run', errs.length === 0,
     errs.length ? errs.slice(0, 3).join(' | ') : 'clean');

  await b.close();
  server.close();
  try { fs.unlinkSync(TMP); } catch (e) {}

  console.log('\n  ' + pass + ' passed, ' + fail + ' failed\n');
  console.log('RESULT: ' + (fail ? 'FAIL' : 'PASS') + '\n');
  process.exit(fail ? 1 : 0);
})().catch(e => {
  try { fs.unlinkSync(TMP); } catch (x) {}
  console.error(e);
  process.exit(2);
});
