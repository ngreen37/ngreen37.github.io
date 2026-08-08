/* =============================================================================
 * gen-rating-puzzles.js — the graded pool behind /rating/, PROVED before it ships.
 *   npm run gen:rating
 * -----------------------------------------------------------------------------
 * Nate, 2026-08-08: "What's your rating? — six positions, one number." The front-door
 * puzzle converted the site's first stranger, so this is the same mechanic escalated:
 * a visitor who just found one mate is offered six positions that CLIMB, and the run
 * ends with a number about themselves and a seat that matches it.
 *
 * ⭐ THE SAME BARGAIN AS THE FRONT DOOR: THE PROOF HAPPENS HERE, AT BUILD TIME, AND
 * THE PAGE ONLY CARRIES THE ANSWER. /rating/ ships (position, from, to, legal-move
 * list, rating, goal) and grades a click by comparing two integers. No engine on the
 * page, no claim the referee did not make. [[accuracy-above-all]]
 *
 * ── WHERE THE PUZZLES COME FROM, AND WHY NOT A NEW GENERATOR ──────────────────
 * gen-front-puzzles.js grows its own positions, but it only knows ONE motif: mate in
 * one. That is the right puzzle for a front door and the wrong instrument for a
 * rating — every position would be the same question and the number would mean
 * nothing above about 700.
 *
 * The puzzle ROOM already has six motifs (mate · material · skewer · pin · fork ·
 * discovered), each already carrying a rating from `puzzleRating()`, and that rating
 * is the SAME scale the site's solver Elo and clearance already run on. So this
 * script drives the real room in headless Chrome — the identical code path a visitor
 * to /games/fork/ walks — and certifies what comes out. Reusing the room's scale is
 * the whole reason the number is worth showing: it is not a new opinion about chess,
 * it is the site's existing one, measured six times. [[clearance-and-puzzle-elo]]
 *
 * ── WHAT EVERY ENTRY HAS SURVIVED ────────────────────────────────────────────
 * The room's own gate (`puzzleSane`: legal line, and for material puzzles both
 * `secondSolution()` and a best-defense `proveGain()` ≥ 300) runs before genPuzzle
 * returns. Everything below is an INDEPENDENT second opinion from the referee
 * (assets/js/pjcc-chess.js, perft-verified), which knows nothing about the room's
 * board code:
 *   · both kings present; the mover is not in check; the side NOT to move is not in
 *     check (that position is illegal, full stop).
 *   · the stored answer is a legal move.
 *   · NO LEGAL MOVE IS A PROMOTION OR A CASTLE. The page describes a move with
 *     from+to and nothing else — the same house rule the front door keeps, for the
 *     same reason: a board with no promotion dialog must not be able to reach one.
 *   · mate puzzles: exactly ONE legal move mates, and it is the stored answer.
 *   · material puzzles: the stored answer gains ≥ 300 against best defense, and NO
 *     OTHER first move does. Proved with the referee's own alpha-beta, not the
 *     room's. A puzzle with two winning first moves would mark a good move wrong,
 *     which is the one failure this page cannot survive — it is handing out a
 *     NUMBER, and a number built on a false negative is a lie about a person.
 *   · 8..40 legal moves: too few is not a puzzle, too many is not scannable on a
 *     phone.
 * Then, in Node, from the SERIALISED text that actually ships: re-parse, re-check the
 * answer, and decode the packed move list back into a set the referee agrees with
 * move for move. A pool that is right in memory and wrong on disk is the failure
 * worth spending a second on — the front door's generator learned that first.
 *
 * ── THE BANDS ────────────────────────────────────────────────────────────────
 * Entries are bucketed into 100-point bands so the page can climb. The page picks the
 * band nearest its running estimate, so the pool has to be POPULATED everywhere, not
 * merely large: a band with two puzzles in it would serve the same position to
 * everyone who passes through it. BAND_MIN is a floor per band, and the script fails
 * rather than ship a thin one.
 *
 * ⚠ THE CEILING IS REAL AND THE PAGE SAYS SO. puzzleRating() tops out near 1600, so
 * six of these cannot measure a 2000 player. /rating/ reports "1400+" at the top and
 * points at Robert (2400) instead of pretending. Do not "fix" that by inventing
 * ratings the room never claimed.
 *
 * OUTPUT: rewrites the marked block in rating/index.html between the two sentinels.
 * ========================================================================== */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const C = require(path.join(ROOT, 'assets/js/pjcc-chess.js'));
const { findChrome } = require(path.join(ROOT, 'tests/harness.js'));
const pp = require(path.join(ROOT, 'node_modules/puppeteer-core'));

const SEED = +(process.env.SEED || 20260808);
const PER_BAND = +(process.env.PER_BAND || 8);
const BAND_MIN = +(process.env.BAND_MIN || 6);
/* 450..1450 in 100-point steps. The low band is where a genuine beginner lands and
   the high band is where the room runs out of road; both ends are real. */
const BANDS = [450, 550, 650, 750, 850, 950, 1050, 1150, 1250, 1350, 1450];
const BAND_W = 100;

/* ⚠ POSITIONAL ALPHABET — SQ64[i] IS square i, and rating/index.html carries the same
   constant and reads it with indexOf. Change it in one place and the page silently
   grades the wrong squares as legal. tests/rating.check.js proves the two agree. */
const SQ64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2', '.wasm': 'application/wasm', '.ico': 'image/x-icon' };
function serve() {
  return new Promise(res => {
    const srv = http.createServer((req, r) => {
      let p = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
      if (p.endsWith('/')) p += 'index.html';
      fs.readFile(path.join(ROOT, p), (err, buf) => {
        if (err) { r.writeHead(404); r.end(); return; }
        r.writeHead(200, { 'Content-Type': MIME[path.extname(p).toLowerCase()] || 'application/octet-stream' });
        r.end(buf);
      });
    });
    srv.listen(0, () => res(srv));
  });
}

/* ── the hunt, INSIDE the real puzzle room ─────────────────────────────────────
   Everything in this function runs in the page, beside the room's own generator and
   with the referee injected alongside it. It returns plain data. */
function huntInPage(seed, bands, bandW, perBand, sq64) {
  const R = window.PJCCChess;
  /* mulberry32 — the site's PRNG, so a re-run with the same SEED produces the same
     pool and the diff is empty when nothing changed */
  let a = seed;
  const rnd = () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const VAL = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };
  const mat = (b) => b.reduce((s, q) => !q ? s :
    s + (q === q.toUpperCase() ? 1 : -1) * VAL[q.toLowerCase()], 0);

  function toFEN(p) {
    const b = new Array(64).fill('');
    p.pieces.forEach(s => { const t = s[0], f = s.charCodeAt(1) - 97, r = 8 - +s[2]; b[r * 8 + f] = t; });
    return R.toFEN({ b, turn: p.side, cast: { K: false, Q: false, k: false, q: false }, ep: -1, half: 0, full: 1 });
  }

  /* exact-depth alpha-beta, material only — a LOWER BOUND on the mover's gain against
     every defense. Node-budgeted and FAILS CLOSED: a position too expensive to prove
     is thrown away, never assumed good. Same discipline as the room's proveGain. */
  let nodes = 0, cap = 0;
  function search(S, d, alpha, beta) {
    if (++nodes > cap) throw new Error('budget');
    const mv = R.legalMoves(S);
    if (!mv.length) return R.inCheck(S, S.turn) ? -100000 : 0;
    if (d === 0) return (S.turn === 'w' ? 1 : -1) * mat(S.b);
    let best = -Infinity;
    for (const m of mv) {
      const v = -search(R.makeMove(S, m), d - 1, -beta, -alpha);
      if (v > best) best = v;
      if (best > alpha) alpha = best;
      if (alpha >= beta) break;
    }
    return best;
  }

  /* ── the referee's independent verdict on one room puzzle ──────────────────── */
  function certify(p) {
    if (p.side !== 'w') return null;              // the page paints White to move, always
    const fen = toFEN(p);
    const S = R.parseFEN(fen);
    if (R.kingSq(S.b, 'w') < 0 || R.kingSq(S.b, 'b') < 0) return null;
    if (R.inCheck(S, 'w')) return null;           // solving while dodging a check is a different puzzle
    if (R.inCheck({ b: S.b, turn: 'b' }, 'b')) return null;  // illegal with White to move

    const moves = R.legalMoves(S);
    if (moves.length < 8 || moves.length > 40) return null;
    /* from+to has to be the WHOLE move — see the header */
    for (const m of moves) if (m.promo || m.castle) return null;

    const u = p.line[0][0];
    const from = R.sqFromName(u.slice(0, 2)), to = R.sqFromName(u.slice(2, 4));
    const answer = moves.find(m => m.from === from && m.to === to);
    if (!answer) return null;

    const isMate = p.cat === 'mate' || /\bmate\b/i.test(p.goal);
    if (isMate) {
      const mates = moves.filter(m => R.isCheckmate(R.makeMove(S, m)));
      if (mates.length !== 1) return null;
      if (mates[0].from !== from || mates[0].to !== to) return null;
    } else {
      /* UNIQUE WINNER, proved by the referee. The answer must clear +300 against best
         defense and every rival must fail to. Budget is per puzzle and generous —
         this runs once, at build time, and honesty is the only thing it is buying. */
      const depth = Math.min(4, (p.line.length || 1) + 1);
      const start = mat(S.b);
      nodes = 0; cap = 4000000;
      try {
        const got = search(R.makeMove(S, answer), depth - 1, -Infinity, Infinity);
        if (-got - start < 300) return null;
        for (const m of moves) {
          if (m.from === from && m.to === to) continue;
          const v = -search(R.makeMove(S, m), depth - 1, -Infinity, Infinity);
          if (v - start >= 300) return null;      // a second winning first move
        }
      } catch (e) { return null; }                // over budget = unproved = discarded
    }

    let pack = '';
    for (const m of moves) pack += sq64[m.from] + sq64[m.to];
    /* the goal is the only prose that ships, and it is the room's own wording */
    return { fen: fen.split(' ')[0], from, to, pack, rating: p.rating,
      cat: p.cat || 'material', theme: p.theme, goal: p.goal, men: p.pieces.length };
  }

  const buckets = bands.map(() => []);
  const seen = new Set();
  const bandOf = (r) => {
    for (let i = 0; i < bands.length; i++) if (Math.abs(r - bands[i]) <= bandW / 2) return i;
    return -1;
  };
  const full = () => buckets.every(b => b.length >= perBand);

  let tried = 0, certified = 0;
  const t0 = Date.now();
  /* Difficulty is swept rather than random: the room's rating is base(motif) +
     72*diff + clutter, so the only way to fill the TOP bands is to ask for the top
     difficulties, and the only way to fill the bottom is to ask for the bottom. */
  while (!full() && tried < 26000 && Date.now() - t0 < 900000) {
    const diff = 1 + (tried % 10);
    tried++;
    let p;
    try { p = genPuzzle(diff, rnd); } catch (e) { continue; }
    if (!p || !p.line || !p.line.length || !p.rating) continue;
    const bi = bandOf(p.rating);
    if (bi < 0 || buckets[bi].length >= perBand) continue;
    let e;
    try { e = certify(p); } catch (err) { continue; }
    if (!e) continue;
    if (seen.has(e.fen)) continue;
    seen.add(e.fen);
    certified++;
    buckets[bi].push(e);
  }
  return { buckets, tried, certified, ms: Date.now() - t0 };
}

/* ── main ──────────────────────────────────────────────────────────────────── */
(async () => {
  const exe = findChrome();
  if (!exe) { console.error('No Chrome/Edge found. Install one or set CHROME_PATH.'); process.exit(2); }
  const srv = await serve();
  const port = srv.address().port;
  const browser = await pp.launch({ executablePath: exe, headless: 'new', args: ['--no-sandbox', '--mute-audio'] });
  let res;
  try {
    const page = await browser.newPage();
    page.on('pageerror', e => console.log('    [pageerror] ' + e.message));
    await page.goto(`http://127.0.0.1:${port}/assets/games/pjcc_fork.html`, { waitUntil: 'load' });
    await page.addScriptTag({ url: '/assets/js/pjcc-chess.js' });   // the referee joins the room
    console.log('hunting inside the real puzzle room (this takes a few minutes)…');
    res = await page.evaluate(huntInPage, SEED, BANDS, BAND_W, PER_BAND, SQ64);
  } finally {
    await browser.close(); srv.close();
  }

  const thin = [];
  BANDS.forEach((b, i) => { if (res.buckets[i].length < BAND_MIN) thin.push(b + ' (' + res.buckets[i].length + ')'); });
  if (thin.length) {
    console.error(`\nBANDS TOO THIN — want >= ${BAND_MIN} each: ${thin.join(', ')}`);
    console.error('Re-run with a different SEED, or lower BAND_MIN if the room genuinely cannot reach there.');
    process.exit(1);
  }

  /* ── the second, independent pass — from the text that actually ships ─────── */
  const flat = [];
  BANDS.forEach((b, i) => res.buckets[i].forEach(e => flat.push(e)));
  for (const e of flat) {
    const S = C.parseFEN(e.fen + ' w - - 0 1');
    const ms = C.legalMoves(S);
    if (ms.some(m => m.promo || m.castle)) throw new Error('a move needs more than from+to: ' + e.fen);
    const back = new Set();
    for (let i = 0; i < e.pack.length; i += 2) back.add(SQ64.indexOf(e.pack[i]) + '>' + SQ64.indexOf(e.pack[i + 1]));
    if (back.size !== ms.length) throw new Error('packed move list is the wrong size: ' + e.fen);
    for (const m of ms) if (!back.has(m.from + '>' + m.to)) throw new Error('packed list is missing ' + m.from + '>' + m.to + ': ' + e.fen);
    if (!back.has(e.from + '>' + e.to)) throw new Error('packed list does not contain the ANSWER: ' + e.fen);
    if (!ms.some(m => m.from === e.from && m.to === e.to)) throw new Error('the answer is not legal: ' + e.fen);
    if (e.cat === 'mate' || /\bmate\b/i.test(e.goal)) {
      const mates = ms.filter(m => C.isCheckmate(C.makeMove(S, m)));
      if (mates.length !== 1) throw new Error('not a unique mate: ' + e.fen);
      if (mates[0].from !== e.from || mates[0].to !== e.to) throw new Error('wrong mate stored: ' + e.fen);
    }
    if (!/^[1-9A-Za-z\/]+$/.test(e.fen)) throw new Error('malformed FEN: ' + e.fen);
    if (/\s/.test(e.goal)) e.goal = e.goal.trim();
    if (e.goal.indexOf("'") >= 0) throw new Error('a goal would break the quoting: ' + e.goal);
  }

  /* ── emit ─────────────────────────────────────────────────────────────────── */
  const lines = flat
    .sort((x, y) => x.rating - y.rating)
    .map(e => `'${e.fen}|${e.from}|${e.to}|${e.pack}|${e.rating}|${e.goal}'`);
  const block = lines.map((l, i) => '    ' + l + (i === lines.length - 1 ? '' : ',')).join('\n');

  const BEGIN = '  /* ══ POOL — GENERATED, DO NOT EDIT BY HAND · npm run gen:rating ══ */';
  const END = '  /* ══ END POOL ══ */';
  const pagePath = path.join(ROOT, 'rating', 'index.html');
  let src = fs.readFileSync(pagePath, 'utf8');
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(esc(BEGIN) + '[\\s\\S]*?' + esc(END));
  if (!re.test(src)) { console.error('sentinels not found in rating/index.html'); process.exit(1); }
  src = src.replace(re, BEGIN + '\n  var POOL = [\n' + block + '\n  ];\n' + END);
  fs.writeFileSync(pagePath, src);

  const cats = {};
  flat.forEach(e => { cats[e.cat] = (cats[e.cat] || 0) + 1; });
  const men = flat.map(e => e.men).sort((x, y) => x - y);
  console.log('\n=== /rating/ PUZZLE POOL ===');
  console.log(`  ${flat.length} positions across ${BANDS.length} bands (${BANDS[0]}..${BANDS[BANDS.length - 1]})`);
  console.log(`  ${res.tried} asked of the room, ${res.certified} survived the referee · seed ${SEED} · ${(res.ms / 1000).toFixed(0)}s`);
  console.log(`  motifs: ${JSON.stringify(cats)}`);
  console.log(`  men on the board: ${men[0]}..${men[men.length - 1]}, median ${men[men.length >> 1]}`);
  BANDS.forEach((b, i) => console.log(`    ${String(b).padStart(4)} — ${res.buckets[i].length}`));
  console.log('  packed move lists re-decoded and re-checked against the referee');
  console.log('  written into rating/index.html between the POOL sentinels\n');
})().catch(e => { console.error('GENERATOR CRASHED:', e); process.exit(1); });
