/* rating.check.js — the gate on /rating/ ("What's your rating?").
 *
 * Run: npm run test:rating   (starts its own local HTTP server + headless Chrome)
 *
 * This page hands a stranger A NUMBER ABOUT THEMSELVES, which is a heavier claim than any
 * other page on the site makes. Two things therefore have to be true at once, and they are
 * the two halves of this file:
 *
 *   1. EVERY POSITION IS WHAT IT SAYS IT IS. Re-proved here from the SERIALISED text that
 *      actually ships, by the referee (assets/js/pjcc-chess.js), with no help from the
 *      generator that produced it. A puzzle with two winning first moves would mark a good
 *      move WRONG and quietly cost the visitor rating points they earned.
 *   2. THE PAGE ACTUALLY WORKS. Driven in a real browser, a full six-position run clicked
 *      through end to end — right answers once, wrong answers once. A pool that is perfect
 *      and a page that never loaded is the failure mode this site has shipped before:
 *      [[feature-shipped-but-never-loaded]], and the syntax error that took Park Tables
 *      down with 150+ gates green ([[markdown-eats-scripts]]).
 *
 * ⚠ THE NUMBERS IN THE COPY ARE GATED TOO. "Robert plays at 2400" is not retyped here — it
 * is DERIVED from the Park Tables bot roster and compared, because a hand-copied roster is
 * exactly the list that drifts and nothing would notice ([[dead-game-links-trap]]).
 */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.join(__dirname, '..');
const C = require(path.join(ROOT, 'assets/js/pjcc-chess.js'));
const { findChrome } = require(path.join(ROOT, 'tests/harness.js'));

let PASS = 0, FAIL = 0;
const fails = [];
function ok(cond, msg) {
  if (cond) { PASS++; console.log('  ✓ ' + msg); }
  else { FAIL++; fails.push(msg); console.log('  ✗ ' + msg); }
}
function section(t) { console.log('\n── ' + t + ' ' + '─'.repeat(Math.max(0, 56 - t.length))); }

const PAGE = path.join(ROOT, 'rating', 'index.html');
const SRC = fs.readFileSync(PAGE, 'utf8');
const GEN = fs.readFileSync(path.join(ROOT, 'tests', 'gen-rating-puzzles.js'), 'utf8');
const PARK = fs.readFileSync(path.join(ROOT, 'games', 'park-tables', 'index.html'), 'utf8');

/* ══ 1 · the page's own constants, read out of the page ═══════════════════════════════ */
section('the pool ships, and the page can re-generate it');

const poolM = SRC.match(/var POOL = \[([\s\S]*?)\];/);
ok(!!poolM, 'POOL block found in rating/index.html');
const POOL = poolM ? vm.runInNewContext('[' + poolM[1] + ']') : [];
ok(POOL.length >= 60, `the pool ships ${POOL.length} positions (want >= 60 — a thin pool serves the same six to everyone)`);

ok(SRC.indexOf('npm run gen:rating') > 0 && /══ END POOL ══/.test(SRC),
  'both POOL sentinels are intact, so `npm run gen:rating` can still find the block');

const sqPage = (SRC.match(/var SQ64 = '([^']+)'/) || [])[1];
const sqGen = (GEN.match(/const SQ64 = '([^']+)'/) || [])[1];
ok(!!sqPage && sqPage === sqGen && sqPage.length === 64,
  'the page and the generator carry the SAME 64-symbol alphabet, character for character');

/* ⚠ THE TRAP THIS GATE EXISTS TO KEEP SHUT. One `{{ … }}` inside the inline script and the
   file on disk stops being JavaScript: every harness that reads the raw source goes blind,
   and a syntax error can ship behind a fully green suite. */
const scripts = SRC.match(/<script>[\s\S]*?<\/script>/g) || [];
const liquidInJs = scripts.filter(s => /\{\{|\{%/.test(s));
ok(liquidInJs.length === 0,
  'no Liquid tag inside any inline <script> — the raw file stays parseable JavaScript');

/* ══ 2 · every position, re-proved by the referee from the shipped text ═══════════════ */
section('every position, re-proved by the referee');

const SQ64 = sqPage || '';
const VAL = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };
const mat = b => b.reduce((s, q) => !q ? s :
  s + (q === q.toUpperCase() ? 1 : -1) * VAL[q.toLowerCase()], 0);

const bad = [];
const ratings = [];
let mates = 0, material = 0, secondChecked = 0;

for (let i = 0; i < POOL.length; i++) {
  const parts = String(POOL[i]).split('|');
  const tag = '#' + i + ' ' + parts[0];
  if (parts.length !== 6) { bad.push(tag + ' :malformed-entry'); continue; }
  const [fen, fromS, toS, pack, rateS, goal] = parts;
  const from = +fromS, to = +toS, rate = +rateS;
  ratings.push(rate);

  if (!(rate >= 300 && rate <= 1600)) { bad.push(tag + ' :rating-out-of-range ' + rate); continue; }
  if (!goal || !goal.trim()) { bad.push(tag + ' :no-goal'); continue; }

  let S;
  try { S = C.parseFEN(fen + ' w - - 0 1'); } catch (e) { bad.push(tag + ' :unparseable'); continue; }
  if (C.kingSq(S.b, 'w') < 0 || C.kingSq(S.b, 'b') < 0) { bad.push(tag + ' :missing-king'); continue; }
  if (C.inCheck(S, 'w')) { bad.push(tag + ' :white-already-in-check'); continue; }
  if (C.inCheck({ b: S.b, turn: 'b' }, 'b')) { bad.push(tag + ' :black-in-check-illegal'); continue; }

  const moves = C.legalMoves(S);
  if (moves.length < 8 || moves.length > 40) { bad.push(tag + ' :move-count ' + moves.length); continue; }
  /* from+to has to be the WHOLE move — this board has no promotion dialog */
  if (moves.some(m => m.promo || m.castle)) { bad.push(tag + ' :needs-more-than-from-to'); continue; }

  /* the packed list is what the PAGE believes about legality — decode it back and make the
     referee agree move for move, same set and same size */
  const back = new Set();
  for (let q = 0; q + 1 < pack.length; q += 2) {
    const f = SQ64.indexOf(pack[q]), t = SQ64.indexOf(pack[q + 1]);
    if (f < 0 || t < 0) { back.clear(); break; }
    back.add(f + '>' + t);
  }
  if (back.size !== moves.length) { bad.push(tag + ' :packed-size ' + back.size + '/' + moves.length); continue; }
  let miss = false;
  for (const m of moves) if (!back.has(m.from + '>' + m.to)) { miss = true; break; }
  if (miss) { bad.push(tag + ' :packed-missing-a-legal-move'); continue; }
  if (!back.has(from + '>' + to)) { bad.push(tag + ' :packed-missing-the-answer'); continue; }
  if (!moves.some(m => m.from === from && m.to === to)) { bad.push(tag + ' :answer-illegal'); continue; }

  if (/\bmate\b/i.test(goal)) {
    mates++;
    const ms = moves.filter(m => C.isCheckmate(C.makeMove(S, m)));
    if (ms.length !== 1) { bad.push(tag + ' :' + ms.length + '-mates-not-1'); continue; }
    if (ms[0].from !== from || ms[0].to !== to) { bad.push(tag + ' :stored-answer-is-not-the-mate'); continue; }
  } else {
    material++;
    /* ── NO SECOND FREE LUNCH ──────────────────────────────────────────────────────
       Exactly the puzzle room's own secondSolution() rule, re-run by the referee from
       the shipped text: play every OTHER first move, let the opponent take its best
       material reply, and no rival may come out +300 or better. Depth 2 and threshold
       300 are the ROOM's numbers, deliberately — a gate that used a deeper horizon than
       the generator did would fail entries that were never claimed to survive it, and a
       flaky gate teaches everyone to ignore gates. */
    secondChecked++;
    const start = mat(S.b);
    let rival = null;
    for (const m of moves) {
      if (m.from === from && m.to === to) continue;
      const after = C.makeMove(S, m);
      const replies = C.legalMoves(after);
      if (!replies.length) continue;                       // mate or stalemate: not a material claim
      let theirBest = Infinity;                            // Black minimises White's material
      for (const r of replies) theirBest = Math.min(theirBest, mat(C.makeMove(after, r).b));
      if (theirBest - start >= 300) { rival = C.nameFromSq(m.from) + C.nameFromSq(m.to); break; }
    }
    if (rival) { bad.push(tag + ' :second-winning-move ' + rival); continue; }
  }
}

ok(bad.length === 0,
  `all ${POOL.length} positions survive the referee (${mates} mate, ${material} material; ` +
  `${secondChecked} re-scanned for a second winning move)` +
  (bad.length ? ' -> ' + bad.slice(0, 4).join(' | ') : ''));

/* ══ 3 · the pool can actually carry an adaptive walk ═════════════════════════════════ */
section('the pool is populated everywhere the walk can go');

const sorted = ratings.slice().sort((a, b) => a - b);
const lo = sorted[0], hi = sorted[sorted.length - 1];
ok(lo <= 500, `the pool reaches down to a real beginner (lowest rated puzzle ${lo}, want <= 500)`);
ok(hi >= 1400, `…and up to where the room runs out of road (highest ${hi}, want >= 1400)`);

/* A GAP IS THE FAILURE THAT LOOKS LIKE SUCCESS. The page serves the puzzle nearest its
   running estimate, so a hole in the middle does not error — it silently serves the same
   handful of positions to everyone who passes through it. */
let worstGap = 0, gapAt = 0;
for (let i = 1; i < sorted.length; i++) {
  const g = sorted[i] - sorted[i - 1];
  if (g > worstGap) { worstGap = g; gapAt = sorted[i - 1]; }
}
ok(worstGap <= 150, `no gap in the ladder (widest ${worstGap} points, just above ${gapAt}; want <= 150)`);

const distinct = new Set(POOL.map(p => String(p).split('|')[0]));
ok(distinct.size === POOL.length, `every position is distinct (${distinct.size}/${POOL.length})`);

/* ⚠ THE COPY NAMES THE CEILING. If the pool's top ever moves, the sentence on the result
   screen becomes false — and it is a sentence about how much to trust a number. */
const ceilingClaim = /hardest positions rate about ([\d,]+)/.exec(SRC);
const claimed = ceilingClaim ? +ceilingClaim[1].replace(/,/g, '') : null;
ok(claimed !== null && Math.abs(claimed - hi) <= 100,
  `the "ran out of road" copy names a ceiling that matches the pool (says ${claimed}, pool tops at ${hi})`);

/* ══ 4 · the estimate reaches both ends ═══════════════════════════════════════════════ */
section('the estimate can reach both ends in six questions');

const START = +(SRC.match(/var START = (\d+)/) || [])[1];
const K = vm.runInNewContext('[' + (SRC.match(/var K = \[([^\]]+)\]/) || [])[1] + ']');
ok(START > 0 && K.length === 6, `the page's constants read back (start ${START}, six K values ${K.join('/')})`);

/* Replays the page's own settle against the REAL pool. Same nearest-band selection, same
   decaying K — so this measures the shipped instrument, not a second model of it. */
function simulate(allRight) {
  let est = START;
  const seen = {};
  for (let s = 0; s < K.length; s++) {
    let bestI = -1, bestD = Infinity;
    for (let i = 0; i < POOL.length; i++) {
      if (seen[i]) continue;
      const d = Math.abs((+String(POOL[i]).split('|')[4]) - est);
      if (d < bestD) { bestD = d; bestI = i; }
    }
    seen[bestI] = 1;
    const pr = +String(POOL[bestI]).split('|')[4];
    const exp = 1 / (1 + Math.pow(10, (pr - est) / 400));
    est += K[s] * ((allRight ? 1 : 0) - exp);
    est = Math.max(400, Math.min(1500, est));
  }
  return Math.round(est / 25) * 25;
}
const sweep = simulate(true), floor = simulate(false);
ok(floor <= 575, `six misses lands at ${floor} — low enough to be honest (want <= 575)`);
ok(sweep >= 1275, `six solves lands at ${sweep} — high enough to be worth taking (want >= 1275)`);
ok(sweep - floor >= 700, `the run separates a beginner from a club player by ${sweep - floor} points`);

/* ══ 5 · the seats are DERIVED from Park Tables, never retyped ════════════════════════ */
section('the seats it offers are the seats that exist');

/* ⚠ ANCHORED ON THE INDENTED DECLARATION, NOT ON `var BOTS = {` ALONE. Park Tables EXPLAINS
   its own roster in a comment 150 lines above the declaration — "`var BOTS = {…}` is declared
   ~150 lines BELOW" — and a lazy regex grabs the prose, not the data. It is the same lesson
   as the derived list itself: read the thing, not something that looks like it.
   [[dead-game-links-trap]]

   ⚠⚠ AND THE FIRST FIX FOR THAT WAS ITSELF A TIME BOMB — it anchored on `argus:`, i.e. on
   WHICH SEAT HAPPENED TO BE FIRST. The bench was re-ordered on 2026-08-10 (Maxwell took the
   bottom seat), so from that day this pattern matched nothing, `BOTS` was `{}`, and the file
   reported three FAILURES with the message "argus is not a Park Tables regular" — a check
   accusing the site of a bug the check had. Worse, it was the loud kind of wrong: three red
   lines that look like a known-failing test, which is how a REAL stale-seat bug in
   /rating/ sat behind it unnoticed.
   The anchor is now the two-space indent that only the real `var` statement has, and it
   cares about no seat's name. [[audit-numbers-can-be-wrong]] */
const botsM = PARK.match(/\n  var BOTS = \{\r?\n([\s\S]*?)\r?\n  \};/);
ok(!!botsM, 'the Park Tables bot roster was found (anchored on the real declaration)');
const BOTS = botsM ? vm.runInNewContext('({' + botsM[1] + '})') : {};
const seatsM = SRC.match(/var SEATS = \[([\s\S]*?)\];/);
ok(!!seatsM, 'the page carries a SEATS table');
const SEATS = seatsM ? vm.runInNewContext('[' + seatsM[1] + ']') : [];

const seatBad = [];
for (const s of SEATS) {
  if (!BOTS[s.id]) { seatBad.push(s.id + ' is not a Park Tables regular'); continue; }
  if (BOTS[s.id].elo !== s.elo) seatBad.push(`${s.id} says ${s.elo} here and ${BOTS[s.id].elo} at the park`);
  if (BOTS[s.id].name !== s.name) seatBad.push(`${s.id} is "${s.name}" here and "${BOTS[s.id].name}" at the park`);
}
ok(SEATS.length >= 3 && seatBad.length === 0,
  `every seat matches the park's own roster (${SEATS.map(s => s.name + ' ' + s.elo).join(' · ')})` +
  (seatBad.length ? ' -> ' + seatBad.join(' | ') : ''));

/* the sweep sends people to Robert, and the copy prints his rating — derive it too */
const robertM = /Robert plays at (\d+)/.exec(SRC);
ok(!!robertM && BOTS.robert && +robertM[1] === BOTS.robert.elo,
  `the "ran out of road" line prints Robert's real rating (${robertM ? robertM[1] : '?'} vs ${BOTS.robert ? BOTS.robert.elo : '?'})`);

/* ══ 6 · the page actually runs ═══════════════════════════════════════════════════════
   A Jekyll page is Liquid on disk, so the raw file cannot be loaded. Rather than trust a
   render, this does the SMALLEST possible one and then REFUSES to continue if a single
   Liquid delimiter survives — a half-rendered page that quietly loads is how a harness ends
   up proving something about a file nobody ships. [[local-dev-and-verification]] */
function liquidLite(src) {
  let s = src.replace(/^---\n[\s\S]*?\n---\n/, '');
  s = s.replace(/\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\}/g, '');
  s = s.replace(/\{%\s*comment\s*%\}[\s\S]*?\{%\s*endcomment\s*%\}/g, '');
  /* the 64 static squares — the one loop on the page */
  s = s.replace(/\{%-?\s*for i in \(0\.\.63\)[\s\S]*?\{%-?\s*endfor\s*-?%\}/g, () => {
    let out = '';
    for (let i = 0; i < 64; i++) {
      const r = (i / 8) | 0, c = i % 8;
      out += '<i class="rq-sq' + ((r + c) % 2 === 1 ? ' d' : '') + '" data-sq="' + i + '"></i>';
    }
    return out;
  });
  s = s.replace(/\{\{\s*'([^']+)'\s*\|\s*relative_url\s*\}\}/g, '$1');
  return s;
}

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
function serve(html) {
  return new Promise(res => {
    const srv = http.createServer((req, r) => {
      if (req.url.split('?')[0] === '/rating/') {
        r.writeHead(200, { 'Content-Type': 'text/html' }); r.end(html); return;
      }
      const p = decodeURIComponent(req.url.split('?')[0]);
      fs.readFile(path.join(ROOT, p), (err, buf) => {
        if (err) { r.writeHead(404); r.end(); return; }
        r.writeHead(200, { 'Content-Type': MIME[path.extname(p).toLowerCase()] || 'text/plain' });
        r.end(buf);
      });
    });
    srv.listen(0, () => res(srv));
  });
}

(async () => {
  section('a real six-position run, clicked through in a browser');
  const body = liquidLite(SRC);
  const leftover = body.match(/\{\{|\{%/);
  ok(!leftover, 'the test render leaves no Liquid behind (if this fails the run below proves nothing)');

  const exe = findChrome();
  if (!exe || leftover) {
    ok(false, exe ? 'skipped the browser run — see above' : 'no Chrome/Edge found (set CHROME_PATH)');
  } else {
    const pp = require(path.join(ROOT, 'node_modules/puppeteer-core'));
    const html = '<!doctype html><html><head><meta charset="utf-8"><title>rating</title></head>' +
      '<body class="theme-chess">' + body + '</body></html>';
    const srv = await serve(html);
    const port = srv.address().port;
    const browser = await pp.launch({ executablePath: exe, headless: 'new', args: ['--no-sandbox'] });
    try {
      /* Node knows the whole pool, so it can hand the page a lookup from "which men are on
         this board" to "which two squares are the answer" — no stubbing of Math.random, and
         the page under test is byte-for-byte the shipped one. */
      const key = {};
      for (const p of POOL) {
        const [fen, from, to, pack] = String(p).split('|');
        const occ = [];
        const rows = fen.split('/');
        for (let r = 0; r < 8; r++) {
          let f = 0;
          for (const ch of rows[r] || '') {
            if (ch >= '1' && ch <= '8') { f += +ch; continue; }
            occ.push((r * 8 + f) + ch); f++;
          }
        }
        /* a legal move that is NOT the answer, for the wrong-answer run */
        let wrong = null;
        for (let q = 0; q + 1 < pack.length; q += 2) {
          const a = SQ64.indexOf(pack[q]), b = SQ64.indexOf(pack[q + 1]);
          if (a !== +from || b !== +to) { wrong = [a, b]; break; }
        }
        key[occ.sort().join(',')] = { from: +from, to: +to, wrong };
      }

      for (const mode of ['right', 'wrong']) {
        const page = await browser.newPage();
        const errs = [];
        page.on('pageerror', e => errs.push(e.message));
        await page.goto(`http://127.0.0.1:${port}/rating/`, { waitUntil: 'load' });

        const out = await page.evaluate(async (key, mode) => {
          const sleep = ms => new Promise(r => setTimeout(r, ms));
          const log = { steps: [], pips: '', num: null, seat: null, err: null };
          const sig = () => Array.from(document.querySelectorAll('#rq-men .rq-p'))
            .map(e => e.getAttribute('data-sq') + e.getAttribute('data-pc')).sort().join(',');
          for (let s = 0; s < 6; s++) {
            const k = key[sig()];
            if (!k) { log.err = 'step ' + s + ': board does not match any pool entry'; return log; }
            const pick = mode === 'right' ? [k.from, k.to] : (k.wrong || [k.from, k.to]);
            const piece = document.querySelector('#rq-men .rq-p[data-sq="' + pick[0] + '"]');
            if (!piece) { log.err = 'step ' + s + ': no piece on the answer square'; return log; }
            piece.click();
            await sleep(0);
            /* the dots must have appeared — that is the legality UI doing its job */
            const lit = document.querySelectorAll('#rq-board .rq-sq.can').length;
            const target = document.querySelector('#rq-board .rq-sq[data-sq="' + pick[1] + '"]');
            if (!target) { log.err = 'step ' + s + ': no target square'; return log; }
            target.click();
            await sleep(0);
            const verdict = document.getElementById('rq-say').textContent.trim();
            log.steps.push({ lit: lit, verdict: verdict, after: !document.getElementById('rq-after').hidden });
            const next = document.getElementById('rq-next');
            if (!next) { log.err = 'step ' + s + ': no next button'; return log; }
            next.click();
            await sleep(0);
          }
          log.pips = Array.from(document.querySelectorAll('#rq-pips .rq-pip'))
            .map(p => p.classList.contains('good') ? 'g' : p.classList.contains('miss') ? 'm' : '.').join('');
          const res = document.getElementById('rq-result');
          log.shown = res && !res.hidden;
          log.runHidden = document.getElementById('rq-run').hidden;
          log.num = document.getElementById('rq-num').textContent.trim();
          log.note = document.getElementById('rq-note').textContent.trim();
          log.seat = document.getElementById('rq-seat').getAttribute('href');
          log.seatLabel = document.getElementById('rq-seat-b').textContent.trim();
          return log;
        }, key, mode);

        const w = mode === 'right' ? 'six correct' : 'six wrong';
        ok(!out.err, `${w}: the run completes` + (out.err ? ' -> ' + out.err : ''));
        if (!out.err) {
          ok(out.steps.length === 6, `${w}: six positions were served and graded`);
          ok(out.steps.every(s => s.lit > 0),
            `${w}: picking a piece up lights its legal moves every time (${out.steps.map(s => s.lit).join('/')})`);
          ok(out.steps.every(s => s.after), `${w}: a graded move always offers the way forward`);
          const want = mode === 'right' ? 'Yes!' : 'Not quite.';
          ok(out.steps.every(s => s.verdict === want), `${w}: every verdict reads "${want}"`);
          ok(out.pips === (mode === 'right' ? 'gggggg' : 'mmmmmm'), `${w}: the pips read back the run (${out.pips})`);
          ok(out.shown && out.runHidden, `${w}: the result screen replaces the board`);
          ok(/^\d+\+?$/.test(out.num), `${w}: the number is a number (${out.num})`);
          ok(/\?table=[a-z]+$/.test(out.seat || ''), `${w}: the seat links to a real table (${out.seat})`);
          /* ⚑ DERIVED, NOT TYPED (2026-08-11). This said `'Argus'` for six-wrong, which was
             true when Argus was the bottom seat and became a false failure the day Maxwell
             took it — the same class of staleness as the roster anchor above, in the same
             file, found in the same hour. The rule is what matters and the rule does not
             change: a sweep is sent to the TOP seat the run offers, and a blank to the
             BOTTOM one. Both ends are read from the page's own SEATS table. */
          const expectSeat = mode === 'right' ? 'Robert' : SEATS[0].name;
          ok((out.seatLabel || '').indexOf(expectSeat) >= 0,
            `${w}: it offers ${expectSeat} (${out.seatLabel})`);
          if (mode === 'right') {
            ok(/ran out of road/.test(out.note), 'a clean sweep is TOLD the test ran out of road, not flattered');
          }
        }
        ok(errs.length === 0, `${w}: no page errors` + (errs.length ? ' -> ' + errs.join(' | ') : ''));
        await page.close();
      }
    } finally {
      await browser.close(); srv.close();
    }
  }

  console.log('\n' + '─'.repeat(60));
  console.log(FAIL === 0 ? `ALL ${PASS} /rating/ CHECKS PASSED ✅`
    : `${FAIL} FAILED / ${PASS} passed ❌\n` + fails.map(f => '  ✗ ' + f).join('\n'));
  process.exit(FAIL === 0 ? 0 : 1);
})().catch(e => { console.error('GATE CRASHED:', e); process.exit(1); });
