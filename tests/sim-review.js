#!/usr/bin/env node
/*! tests/sim-review.js — CAN A REVIEW TELL WHAT RATING SOMEONE PLAYED AT?
 *
 * A measurement, not a gate. Bots of measured strength play each other, the review's own
 * Stockfish grades every game, and the fit prints how well the grade predicts the rating.
 * 2026-09-14, 400 games: best feature ln(acpl+10), window 5–95 → spearman 0.37, ±815 per
 * game, ±290 pooled over 10. Median accuracy is flat (76–84%) from 350 to 1250.
 * ⚠ --grade with more pages than free cores searches shallower than a visitor's browser.
 *
 *   node tests/sim-review.js --play  --games=60 --seed=1 --out=a.jsonl   bots play (Node)
 *   node tests/sim-review.js --grade --in=a.jsonl --out=g.jsonl --pages=4 review grades (Chrome)
 *   node tests/sim-review.js --fit   --in=g.jsonl                        features → rating
 */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const argv = process.argv.slice(2);
const arg = (k, d) => { const h = argv.find(a => a.startsWith('--' + k + '=')); return h ? h.slice(k.length + 3) : d; };
const has = k => argv.includes('--' + k);

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ── PLAY ─────────────────────────────────────────────────────────────────────── */
function play() {
  const C = require(path.join(ROOT, 'assets/js/pjcc-chess.js'));
  const AI = require(path.join(ROOT, 'assets/js/pjcc-chess-ai.js'));
  const E = require(path.join(ROOT, 'assets/js/pjcc-gauntlet-engine.js')).PJCCGauntletEngine;
  const rng = mulberry32(+arg('seed', 1));
  Math.random = () => rng();                 // the personas roll noise/tilt off Math.random
  const GAMES = +arg('games', 40), OPEN = +arg('open', 4), CAP = 200;
  const RUNGS = [350, 400, 500, 650, 750, 800, 950, 1000, 1100, 1150, 1200, 1250];
  const out = arg('out', path.join(__dirname, 'sim-review.play.jsonl'));
  const uci = m => C.nameFromSq(m.from) + C.nameFromSq(m.to) + (m.promo ? m.promo.toLowerCase() : '');

  for (let g = 0; g < GAMES; g++) {
    const w = RUNGS[(rng() * RUNGS.length) | 0], b = RUNGS[(rng() * RUNGS.length) | 0];
    const P = { w: Object.assign(E.personaForElo(w), { timeMs: 2000 }),
                b: Object.assign(E.personaForElo(b), { timeMs: 2000 }) };
    let S = C.parseFEN(C.START_FEN);
    const moves = [], reps = new Map();
    let result = null;
    for (let ply = 0; ply < CAP; ply++) {
      const key = C.posKey(S), seen = (reps.get(key) || 0) + 1;
      reps.set(key, seen);
      const res = C.gameResult(S, seen);
      if (res === 'checkmate') { result = S.turn === 'w' ? '0-1' : '1-0'; break; }
      if (res) { result = '1/2-1/2'; break; }
      const lm = C.legalMoves(S);
      const mv = ply < OPEN ? lm[(rng() * lm.length) | 0] : AI.bestMove(S, P[S.turn]);
      if (!mv) { result = '1/2-1/2'; break; }
      moves.push(uci(mv));
      S = C.makeMove(S, mv);
    }
    fs.appendFileSync(out, JSON.stringify({ w, b, open: OPEN, result: result || '*', moves: moves.join(' ') }) + '\n');
    process.stdout.write('game ' + (g + 1) + '/' + GAMES + '  ' + w + ' v ' + b + '  ' + (result || '*') + '  ' + moves.length + ' plies\n');
  }
}

/* ── GRADE ────────────────────────────────────────────────────────────────────── */
async function grade() {
  const http = require('http');
  const puppeteer = require('puppeteer-core');
  const { findChrome } = require('./harness');
  const IN = arg('in'), OUT = arg('out', path.join(__dirname, 'sim-review.grade.jsonl'));
  const PAGES = +arg('pages', 4), PORT = +arg('port', 8131);
  const games = fs.readFileSync(IN, 'utf8').trim().split('\n').map(l => JSON.parse(l));
  const done = new Set(fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8').trim().split('\n').filter(Boolean)
    .map(l => JSON.parse(l).moves) : []);
  const todo = games.filter(g => !done.has(g.moves));
  console.log(games.length + ' games, ' + todo.length + ' left to grade, ' + PAGES + ' pages');

  const SHELL = '<!doctype html><meta charset="utf-8"><script src="/assets/js/pjcc-chess.js"></script>' +
    '<script src="/assets/js/pjcc-openings.js"></script><script src="/assets/js/pjcc-game-review.js"></script>';
  const MIME = { '.js': 'application/javascript', '.wasm': 'application/wasm' };
  const server = http.createServer((req, res) => {
    const u = req.url.split('?')[0];
    if (u === '/shell.html') { res.writeHead(200, { 'Content-Type': 'text/html' }); return res.end(SHELL); }
    fs.readFile(path.join(ROOT, decodeURIComponent(u)), (e, b) => {
      if (e) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(u)] || 'application/octet-stream' });
      res.end(b);
    });
  });
  await new Promise(r => server.listen(PORT, r));
  const browser = await puppeteer.launch({ executablePath: findChrome(), args: ['--no-sandbox'] });
  let next = 0, n = 0;
  await Promise.all(Array.from({ length: PAGES }, async () => {
    const p = await browser.newPage();
    await p.goto('http://localhost:' + PORT + '/shell.html', { waitUntil: 'load' });
    while (next < todo.length) {
      const g = todo[next++];
      const r = await p.evaluate(mv => PJCCReview.analyzeGame(mv).then(rep => ({
        evalW: rep.evalW, book: rep.opening.bookPlies,
        plies: rep.plies.map(x => [x.winLoss, x.cpLoss, x.cls])
      })), g.moves);
      fs.appendFileSync(OUT, JSON.stringify(Object.assign({}, g, r)) + '\n');
      console.log('graded ' + (++n) + '/' + todo.length + '  ' + g.w + ' v ' + g.b);
    }
  }));
  await browser.close();
  server.close();
}

/* ── FIT ──────────────────────────────────────────────────────────────────────── */
const winPct = c => 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * c)) - 1);

/* One side's measured moves: past the random opening and the book, and only while the game
   is still in the balance — a decided position grades every move ~perfect. */
function sideFeatures(g, side, LO, HI) {
  const losses = [];
  g.plies.forEach((pl, k) => {
    const mover = k % 2 === 0 ? 'w' : 'b';
    if (mover !== side || k < Math.max(g.open, g.book)) return;
    const before = winPct(mover === 'w' ? g.evalW[k] : -g.evalW[k]);
    if (before < LO || before > HI) return;
    losses.push(pl[0]);
    losses.cls = (losses.cls || []).concat(pl[2]);
    losses.cp = (losses.cp || []).concat(Math.min(pl[1], 1000));
  });
  return losses;
}

function spearman(xs, ys) {
  const rank = a => { const idx = a.map((v, i) => [v, i]).sort((p, q) => p[0] - q[0]); const r = []; idx.forEach((p, i) => { r[p[1]] = i; }); return r; };
  const rx = rank(xs), ry = rank(ys), n = xs.length, mx = (n - 1) / 2;
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) { num += (rx[i] - mx) * (ry[i] - mx); dx += (rx[i] - mx) ** 2; dy += (ry[i] - mx) ** 2; }
  return num / Math.sqrt(dx * dy);
}

const quant = (a, t) => { const s = a.slice().sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(t * s.length))]; };
const avg = a => a.reduce((x, y) => x + y, 0) / a.length;

/* ⚠ INVERSE CALIBRATION, not rating-on-feature regression. Regressing rating on the feature
   shrinks every estimate toward the sample's middle rung, so a 1250 game prints ~1000 and the
   scale never reaches either end. Fitting feature-on-rating and inverting keeps each rung's
   median estimate on its own rung. */
function fit() {
  const games = arg('in').split(',').flatMap(f => fs.readFileSync(f, 'utf8').trim().split('\n').map(l => JSON.parse(l)));
  const LO = +arg('lo', 10), HI = +arg('hi', 90), MIN = +arg('min', 8);
  const FEATURES = {
    'ln(mean loss+1)': L => Math.log(avg(L) + 1),
    'ln(trim10 mean+1)': L => { const s = L.slice().sort((a, b) => a - b); const k = Math.floor(s.length * 0.1); return Math.log(avg(s.slice(0, s.length - k)) + 1); },
    'share ≥10 lost': L => L.filter(x => x >= 10).length / L.length,
    'ln(share ≥5 lost+.02)': L => Math.log(L.filter(x => x >= 5).length / L.length + 0.02),
    'mean ln(loss+1)': L => avg(L.map(x => Math.log(x + 1))),
    'share best/good': L => L.cls.filter(c => c === 'best' || c === 'good').length / L.length,
    'ln(acpl+10)': L => Math.log(avg(L.cp) + 10)
  };
  const rows = [];
  games.forEach(g => ['w', 'b'].forEach(s => {
    const L = sideFeatures(g, s, LO, HI);
    if (L.length >= MIN) rows.push({ elo: g[s], L });
  }));
  console.log(games.length + ' games · ' + rows.length + ' sides with ≥' + MIN + ' measured moves · window ' + LO + '–' + HI + '%');
  const ys = rows.map(r => r.elo), mY = avg(ys);
  const rungs = [...new Set(ys)].sort((a, b) => a - b);

  Object.keys(FEATURES).forEach(name => {
    if (arg('only') && arg('only') !== name) return;
    const xs = rows.map(r => FEATURES[name](r.L)), mX = avg(xs);
    let sxy = 0, syy = 0;
    xs.forEach((x, i) => { sxy += (x - mX) * (ys[i] - mY); syy += (ys[i] - mY) ** 2; });
    const slope = sxy / syy, icpt = mX - slope * mY;           // feature = icpt + slope·rating
    const pred = xs.map(x => (x - icpt) / slope);
    const resid = Math.sqrt(avg(ys.map((y, i) => (y - pred[i]) ** 2)));
    console.log('\n' + name + ':  rating = (feature − ' + icpt.toFixed(4) + ') / ' + slope.toExponential(4));
    console.log('  spearman ' + spearman(xs.map(x => slope < 0 ? -x : x), ys).toFixed(3) + ' · per-game error SD ' + resid.toFixed(0) +
      ' · rating SD ' + Math.sqrt(avg(ys.map(y => (y - mY) ** 2))).toFixed(0));
    console.log('   rung   sides   median est   p25–p75       p10–p90');
    rungs.forEach(e => {
      const P = pred.filter((_, i) => ys[i] === e);
      console.log(String(e).padStart(7) + String(P.length).padStart(8) + quant(P, 0.5).toFixed(0).padStart(13) +
        ('   ' + quant(P, 0.25).toFixed(0) + '–' + quant(P, 0.75).toFixed(0)).padStart(14) +
        ('   ' + quant(P, 0.1).toFixed(0) + '–' + quant(P, 0.9).toFixed(0)).padStart(14));
    });
    // how many games one estimate needs: average the feature over k same-rung sides
    const rng = mulberry32(7), line = [];
    [1, 3, 5, 10, 20].forEach(kk => {
      const errs = [];
      for (let t = 0; t < 3000; t++) {
        const e = rungs[(rng() * rungs.length) | 0], pool = xs.filter((_, i) => ys[i] === e);
        let s = 0;
        for (let j = 0; j < kk; j++) s += pool[(rng() * pool.length) | 0];
        errs.push((s / kk - icpt) / slope - e);
      }
      line.push(kk + ' games ±' + Math.sqrt(avg(errs.map(x => x * x))).toFixed(0));
    });
    console.log('  error SD pooled over  ' + line.join(' · '));
  });
}

if (has('play')) play();
else if (has('grade')) grade().catch(e => { console.error(e); process.exit(1); });
else if (has('fit')) fit();
else console.log('pass --play, --grade or --fit');
