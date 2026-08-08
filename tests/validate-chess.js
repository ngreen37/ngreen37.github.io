/* validate-chess.js — the chess accuracy gate for the whole site.
 *
 * "Accuracy above ALL": every chess claim the site makes — every generated puzzle,
 * every stored opening line, every trap's "forced mate" promise, every worksheet
 * fact — is re-proved here against the perft-verified referee (pjcc-chess.js),
 * with Stockfish as an independent second opinion where evaluation matters.
 *
 * Run: npm run test:chess   (starts its own local HTTP server + headless Chrome)
 * Exits non-zero if ANY check fails. Sections:
 *   1. Referee integrity      — perft vs published reference counts, SAN spot checks
 *   2. Academy facts          — every chess statement on /academy/ worksheets/exam
 *   3. Knight-move tables     — Sand Mine + Knight's Tour offsets vs the true 8
 *   4. Pirc opening lines     — legality + exact SAN + trap forced-mate re-proof
 *   5. Blindfold              — self-test vs true perft; generator cross-audit
 *   6. Fork in the Road       — generator cross-audit incl. best-defense search
 *   7. Blindfold CEO book     — opening lines legal + correctly named
 */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.join(__dirname, '..');
const E = require(path.join(ROOT, 'assets/js/pjcc-chess.js'));
const { findChrome } = require(path.join(ROOT, 'tests/harness.js'));
const pp = require(path.join(ROOT, 'node_modules/puppeteer-core'));

let PASS = 0, FAIL = 0;
const fails = [];
function ok(cond, msg) {
  if (cond) { PASS++; console.log('  ✓ ' + msg); }
  else { FAIL++; fails.push(msg); console.log('  ✗ ' + msg); }
}
function section(t) { console.log('\n=== ' + t + ' ==='); }

/* ---------- tiny helpers on the referee ---------- */
function fenKQonly(pieces, turn) { // pieces: [['K','e1'],...] -> FEN with no rights/ep
  const b = new Array(64).fill('');
  for (const [p, sq] of pieces) b[E.sqFromName(sq)] = p;
  return E.toFEN({ b, turn: turn || 'w', cast: { K: false, Q: false, k: false, q: false }, ep: -1, half: 0, full: 1 });
}
function movesFrom(S, sq) { return E.legalMoves(S).filter(m => m.from === E.sqFromName(sq)); }
function targets(S, sq) { return new Set(movesFrom(S, sq).map(m => E.nameFromSq(m.to))); }
function setEq(a, b) { return a.size === b.size && [...a].every(x => b.has(x)); }
function isLight(sq) { const f = sq.charCodeAt(0) - 96, r = +sq[1]; return (f + r) % 2 === 1; }

/* Forced mate for the side to move within `plies` (odd), against EVERY defense. */
function mateForced(S, plies) {
  if (plies <= 0) return false;
  for (const m of E.legalMoves(S)) {
    const ns = E.makeMove(S, m);
    if (E.isCheckmate(ns)) return true;
    if (plies >= 3) {
      const replies = E.legalMoves(ns);
      if (replies.length && replies.every(r => mateForced(E.makeMove(ns, r), plies - 2))) return true;
    }
  }
  return false;
}

/* ============ 1. REFEREE INTEGRITY ============ */
function testReferee() {
  section('1 · Referee integrity (pjcc-chess.js vs published perft)');
  const S = E.parseFEN(E.START_FEN);
  ok(E.perft(S, 1) === 20 && E.perft(S, 2) === 400 && E.perft(S, 3) === 8902,
    'perft startpos d1-3 = 20 / 400 / 8902');
  const KW = E.parseFEN('r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1');
  ok(E.perft(KW, 1) === 48 && E.perft(KW, 2) === 2039, 'perft Kiwipete d1-2 = 48 / 2039');
  const P3 = E.parseFEN('8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1');
  ok(E.perft(P3, 1) === 14 && E.perft(P3, 2) === 191 && E.perft(P3, 3) === 2812,
    'perft position-3 d1-3 = 14 / 191 / 2812');
  // SAN spot checks (positions must themselves be legal — king g2 keeps the rank open)
  const dis = E.parseFEN('k7/8/8/8/8/8/6K1/R6R w - - 0 1'); // both rooks really reach d1
  const rd1 = movesFrom(dis, 'a1').find(m => E.nameFromSq(m.to) === 'd1');
  ok(E.toSAN(dis, rd1) === 'Rad1', 'SAN disambiguation: rook a1->d1 with rook h1 = "Rad1"');
  const casS = E.parseFEN('4k3/8/8/8/8/8/8/4K2R w K - 0 1');
  const cas = movesFrom(casS, 'e1').find(m => m.castle === 'K');
  ok(!!cas && E.toSAN(casS, cas) === 'O-O', 'SAN castling = "O-O"');
  const pro = E.parseFEN('8/P6k/8/8/8/8/8/K7 w - - 0 1');
  const p8 = movesFrom(pro, 'a7').find(m => m.promo === 'Q');
  ok(E.toSAN(pro, p8) === 'a8=Q', 'SAN promotion = "a8=Q"');
  const epS = E.parseFEN('k7/8/8/3pP3/8/8/8/K7 w - d6 0 1');
  const ep = movesFrom(epS, 'e5').find(m => m.ep);
  ok(!!ep && E.toSAN(epS, ep) === 'exd6', 'SAN en passant = "exd6"');
}

/* ============ 2. ACADEMY FACTS ============ */
function testAcademyFacts() {
  section('2 · Academy worksheet & placement-exam facts (vs referee)');
  const S = E.parseFEN(E.START_FEN);
  ok(S.b[E.sqFromName('e1')] === 'K', 'WS1: the white king starts on e1');
  // knight on g1: THREE squares on an empty board (e2/f3/h3); only TWO from the start position
  const NG = E.parseFEN(fenKQonly([['N', 'g1'], ['K', 'a1'], ['k', 'a8']], 'w'));
  ok(setEq(targets(NG, 'g1'), new Set(['e2', 'f3', 'h3'])),
    'WS1: knight on g1 (empty board) reaches exactly {e2, f3, h3} — three squares, never four');
  ok(setEq(targets(S, 'g1'), new Set(['f3', 'h3'])),
    'WS1: knight on g1 in the START position reaches only {f3, h3} (e2 is blocked)');
  ok(isLight('d5'), 'WS1+exam: d5 is a LIGHT square');
  ok(!isLight('a1') && isLight('h1'), "WS1: White's corners are a1 (dark) and h1 (light)");
  // rook alone-ish on d4 (kings tucked away, not interfering)
  const R = E.parseFEN(fenKQonly([['R', 'd4'], ['K', 'h1'], ['k', 'a8']], 'w'));
  ok(movesFrom(R, 'd4').length === 14, 'WS2: rook on d4 (open board) reaches 14 squares');
  // bishop color invariance: c1 is dark; every reachable square stays dark
  ok(!isLight('c1'), 'WS2: c1 is a dark square');
  const B = E.parseFEN(fenKQonly([['B', 'c1'], ['K', 'h1'], ['k', 'a8']], 'w'));
  ok([...targets(B, 'c1')].every(sq => !isLight(sq)), 'WS2: a bishop on c1 only ever reaches dark squares');
  const Q = E.parseFEN(fenKQonly([['Q', 'd4'], ['K', 'h1'], ['k', 'a8']], 'w'));
  ok(targets(Q, 'd4').has('h8'), 'WS2: queen on d4 reaches h8 (d4-h8 diagonal)');
  const N = E.parseFEN(fenKQonly([['N', 'd4'], ['K', 'h1'], ['k', 'a8']], 'w'));
  ok(setEq(targets(N, 'd4'), new Set(['b3', 'b5', 'c2', 'c6', 'e2', 'e6', 'f3', 'f5'])),
    'WS2: knight on d4 reaches exactly its 8 L-squares');
  ok(setEq(targets(S, 'e2'), new Set(['e3', 'e4'])), 'WS2: pawn on e2 may play e3 OR e4 on its first move');
  // WS3: a knight forking K+R — check forces the king; rook then falls
  const F = E.parseFEN(fenKQonly([['N', 'd6'], ['K', 'a1'], ['k', 'e8'], ['r', 'f7']], 'b'));
  ok(E.inCheck(F, 'b'), 'WS3: Nd6 checks the king on e8');
  const kingMoves = E.legalMoves(F);
  ok(kingMoves.length > 0 && kingMoves.every(m => F.b[m.from] === 'k'),
    'WS3: in that fork, every legal reply is a king move (check has priority)');
  ok(kingMoves.every(m => {
    const ns = E.makeMove(F, m);
    return E.legalMoves(ns).some(x => x.from === E.sqFromName('d6') && x.to === E.sqFromName('f7'));
  }), 'WS3: after any king reply, Nxf7 wins the rook');
  // content guards: the fixed wording must stay fixed
  const acad = fs.readFileSync(path.join(ROOT, 'academy.md'), 'utf8');
  ok(!/can jump to <b>f3<\/b> or <b>h3<\/b> or ________ or ________/.test(acad),
    'WS1 text: knight-on-g1 question no longer demands a 4th square (only e2 exists)');
  ok(!/attacks both kings/.test(acad), 'WS3 text: "attacks both kings" mis-statement removed');
  ok(!/which piece can reach <b>every<\/b> square/.test(acad),
    'WS2 text: ambiguous "which piece reaches every square" question replaced');
}

/* ============ 3. KNIGHT TABLES IN OTHER GAMES ============ */
function testKnightTables() {
  section('3 · Knight-move tables');
  const TRUE_KN = new Set(['-2,-1', '-2,1', '-1,-2', '-1,2', '1,-2', '1,2', '2,-1', '2,1']);
  const grab = (file, varName) => {
    const f = path.join(ROOT, 'assets/games', file);
    if (!fs.existsSync(f)) return undefined;      // game retired — see below
    const src = fs.readFileSync(f, 'utf8');
    const m = src.match(new RegExp(varName + '\\s*=\\s*(\\[\\[[^\\]]*\\](?:\\s*,\\s*\\[[^\\]]*\\])*\\s*\\])'));
    if (!m) return null;
    return new Set(vm.runInNewContext('(' + m[1] + ')').map(p => p.join(',')));
  };
  const sm = grab('pjcc_sandmine.html', 'const KN');
  ok(sm && setEq(sm, TRUE_KN), 'Sand Mine Depths: knight offsets are exactly the true 8');
  // Knight's Tour was DELETED in the 2026-07-14 declutter; this gate kept reading its
  // file and crashed the whole accuracy run with ENOENT (found 2026-07-27). A retired
  // game is skipped, not failed — but a game that still exists must still be correct.
  const kt = grab('pjcc_tour.html', 'var MOVES');
  if (kt !== undefined) ok(kt && setEq(kt, TRUE_KN), "Knight's Tour: knight offsets are exactly the true 8");
}

/* ============ shared: local HTTP + Chrome ============ */
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.wasm': 'application/wasm',
  '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.mp3': 'audio/mpeg' };
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
async function openPage(browser, port, rel) {
  const page = await browser.newPage();
  page.on('pageerror', e => console.log('    [pageerror] ' + e.message));
  await page.goto(`http://127.0.0.1:${port}${rel}`, { waitUntil: 'load' });
  await page.addScriptTag({ url: '/assets/js/pjcc-chess.js' }); // referee joins the page
  return page;
}

/* ============ 4. PIRC OPENING LINES + TRAPS ============ */
async function testPirc(browser, port) {
  section('4 · Pirc Protocol — every stored line replayed through the referee');
  const page = await openPage(browser, port, '/assets/games/pjcc_pirc.html');
  const res = await page.evaluate(() => {
    const C = window.PJCCChess;
    const out = { lines: [], traps: [] };
    function mateForced(S, plies) {
      if (plies <= 0) return false;
      for (const m of C.legalMoves(S)) {
        const ns = C.makeMove(S, m);
        if (C.isCheckmate(ns)) return true;
        if (plies >= 3) {
          const rep = C.legalMoves(ns);
          if (rep.length && rep.every(r => mateForced(C.makeMove(ns, r), plies - 2))) return true;
        }
      }
      return false;
    }
    for (const id in RAW) {
      const card = RAW[id];
      let S = C.parseFEN(C.START_FEN);
      const errs = [];
      card.moves.forEach(([uci, san, cs], i) => {
        const from = C.sqFromName(uci.slice(0, 2)), to = C.sqFromName(uci.slice(2, 4));
        const m = C.findMove(S, from, to, uci.length > 4 ? uci[4] : null);
        if (!m) { errs.push('ply ' + (i + 1) + ' ILLEGAL ' + uci); return; }
        const refSAN = C.toSAN(S, m);
        const cleanSAN = san.replace(/[?!]+$/, '');
        if (refSAN !== cleanSAN) errs.push('ply ' + (i + 1) + ' SAN "' + san + '" should be "' + refSAN + '"');
        if (cs === 'K' && cleanSAN !== 'O-O') errs.push('ply ' + (i + 1) + ' castleSide K mismatch');
        if (cs === 'Q' && cleanSAN !== 'O-O-O') errs.push('ply ' + (i + 1) + ' castleSide Q mismatch');
        S = C.makeMove(S, m);
      });
      out.lines.push({ id, name: card.name, plies: card.moves.length, errs, finalFEN: C.toFEN(S) });
      if (card.blunderAt != null) {
        // replay to just AFTER the blunder, then re-prove: trainee mates vs EVERY defense
        let T = C.parseFEN(C.START_FEN);
        for (let i = 0; i <= card.blunderAt; i++) {
          const [uci] = card.moves[i];
          const m = C.findMove(T, C.sqFromName(uci.slice(0, 2)), C.sqFromName(uci.slice(2, 4)), uci.length > 4 ? uci[4] : null);
          if (!m) { out.traps.push({ id, err: 'replay broke at ' + i }); T = null; break; }
          T = C.makeMove(T, m);
        }
        if (T) {
          const remaining = card.moves.length - (card.blunderAt + 1);
          const lastSAN = card.moves[card.moves.length - 1][1];
          out.traps.push({ id, name: card.name, remaining, forced: mateForced(T, remaining), lastIsMate: /#$/.test(lastSAN) });
        }
      }
    }
    return out;
  });
  for (const L of res.lines) {
    ok(L.errs.length === 0, `line "${L.name}" (${L.id}, ${L.plies} plies): legal + exact SAN` +
      (L.errs.length ? ' -> ' + L.errs.join('; ') : ''));
  }
  for (const T of res.traps) {
    ok(!T.err && T.forced && T.lastIsMate,
      `trap "${T.name}": post-blunder FORCED mate vs every defense within ${T.remaining} plies` + (T.err ? ' -> ' + T.err : ''));
  }
  await page.close();
  return res.lines.filter(l => !l.errs.length && !/^trap-/.test(l.id)).map(l => ({ id: l.id, fen: l.finalFEN }));
}

/* ============ 5. BLINDFOLD ============ */
async function testBlindfold(browser, port) {
  section('5 · Blindfold Puzzles — self-test + generator cross-audit');
  const page = await openPage(browser, port, '/assets/games/pjcc_blindfold.html');
  const self = JSON.parse(await page.evaluate(() => __chessTest()));
  ok(JSON.stringify(self.perftStart) === '[20,400,8902]', 'in-game engine perft startpos = 20/400/8902');
  ok(JSON.stringify(self.perftKiwi) === '[48,2039,97862]', 'in-game engine perft Kiwipete = 48/2039/97862');
  ok(self.foolsMate === true, "in-game engine detects Fool's Mate");
  ok(self.stalemate === true, 'in-game engine detects stalemate');
  ok(self.gen && self.gen.fails === 0, `in-game generator self-test clean (mate ${self.gen.mate}, fork ${self.gen.fork})`);
  ok(self.ai && self.ai.errors === 0, 'in-game AI plays only legal moves (self-play)');

  const audit = await page.evaluate(() => {
    const C = window.PJCCChess;
    const out = { mate: { n: 0, bad: [] }, fork: { n: 0, bad: [] } };
    const toFEN = S => C.toFEN({ b: S.b, turn: S.turn, cast: S.cast, ep: S.ep, half: 0, full: 1 });
    for (let i = 0; i < 400; i++) {
      const d = 1 + (i % 10);
      // --- mate-in-one puzzles: every sol mates AND the sol list is COMPLETE ---
      const pm = genMate(d);
      out.mate.n++;
      const S = C.parseFEN(toFEN(pm.S));
      const refMates = C.legalMoves(S).filter(m => C.isCheckmate(C.makeMove(S, m)))
        .map(m => m.from + '>' + m.to + (m.promo || ''));
      const sols = pm.sols.map(m => m.from + '>' + m.to + (m.promo || ''));
      if (C.inCheck(S, 'b') || C.inCheck({ b: S.b, turn: 'w' }, 'w')) out.mate.bad.push(i + ':pre-check');
      else if (!sols.length || !sols.every(s => refMates.includes(s))) out.mate.bad.push(i + ':non-mate-sol');
      else if (!refMates.every(s => sols.includes(s))) out.mate.bad.push(i + ':INCOMPLETE ' + toFEN(pm.S));
      // --- fork puzzles: stored move truly forks; no unlisted winning alternative ---
      const pf = genFork(d);
      if (pf) {
        out.fork.n++;
        const FS = C.parseFEN(toFEN(pf.S));
        const sol = pf.sols[0];
        const qsq = FS.b.findIndex(p => p === 'q');
        const ns = C.makeMove(FS, sol);
        if (!C.inCheck(ns, 'b') || !C.isAttacked(ns.b, qsq, 'w')) out.fork.bad.push(i + ':not-a-fork');
        // any legal white move that captures the queen at once = unlisted correct answer
        const grabs = C.legalMoves(FS).filter(m => m.to === qsq && !(m.from === sol.from && m.to === sol.to));
        // any OTHER safe checking fork = second correct answer
        const altForks = C.legalMoves(FS).filter(m => {
          if (m.from === sol.from && m.to === sol.to) return false;
          const n2 = C.makeMove(FS, m);
          return C.inCheck(n2, 'b') && !C.isCheckmate(n2) && C.isAttacked(n2.b, qsq, 'w') && !C.isAttacked(n2.b, m.to, 'b');
        });
        if (grabs.length) out.fork.bad.push(i + ':direct-Nxq ' + toFEN(pf.S));
        else if (altForks.length) out.fork.bad.push(i + ':second-fork ' + toFEN(pf.S));
      }
    }
    return out;
  });
  ok(audit.mate.bad.length === 0,
    `referee cross-audit: ${audit.mate.n} mate puzzles — sols all mate AND complete` +
    (audit.mate.bad.length ? ' -> ' + audit.mate.bad.slice(0, 3).join(' | ') : ''));
  ok(audit.fork.bad.length === 0,
    `referee cross-audit: ${audit.fork.n} fork puzzles — unique winning move, no unlisted answer` +
    (audit.fork.bad.length ? ' -> ' + audit.fork.bad.slice(0, 3).join(' | ') : ''));
  await page.close();
}

/* ============ 5c. MIND'S EYE — live CEO opponent through the refereed bridge ============ */
async function testMindsEye(browser, port) {
  section("5c · Mind's Eye — CEO plays via the refereed Stockfish bridge");
  const page = await browser.newPage();
  const perr = [];
  page.on('pageerror', e => perr.push(String(e.message || e)));
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('pjcc.blindfold.v2', JSON.stringify({ solved: 25, diff: 2, best: 25, streak: 0, eye: true, trophy: false }));
  });
  await page.goto(`http://127.0.0.1:${port}/assets/games/pjcc_blindfold.html`, { waitUntil: 'load' });
  await page.waitForSelector('#me-launch', { timeout: 8000 });
  await page.click('#me-launch');
  await page.waitForSelector('#me-board .me-sq[data-sq="a2"]', { timeout: 8000 });
  // engine must actually boot (warmup fires in newMe)
  const state = await page.waitForFunction(
    () => window.PJCCGauntletEngine && (['ready', 'dead'].includes(PJCCGauntletEngine._state()) ? PJCCGauntletEngine._state() : null),
    { timeout: 15000 }).then(h => h.jsonValue());
  ok(state === 'ready', "Stockfish bridge boots inside Blindfold's Mind's Eye (state=" + state + ')');
  // play an OFF-BOOK move (1.a3) so the reply must come from the engine, not the book
  await page.click('#me-board .me-sq[data-sq="a2"]');
  await page.click('#me-board .me-sq[data-sq="a3"]');
  const status = await page.waitForFunction(() => {
    const s = document.getElementById('me-status');
    return s && /Your move\./.test(s.textContent) ? s.textContent : null;
  }, { timeout: 20000 }).then(h => h.jsonValue());
  const log = await page.evaluate(() => document.getElementById('me-log').textContent);
  ok(/1\.\s*a3\s+\S+/.test(log.replace(/\s+/g, ' ')), 'CEO answered the off-book 1.a3 (log: "' + log.trim().slice(0, 40) + '")');
  ok(!!status, 'game returns control to the player after the engine reply');
  ok(perr.length === 0, 'no page errors during the live game' + (perr.length ? ' -> ' + perr.join(' | ') : ''));
  await page.close();
}

/* ============ 6. FORK IN THE ROAD ============ */
async function testFork(browser, port) {
  section('6 · Fork in the Road — generator cross-audit + best-defense proof');
  const page = await openPage(browser, port, '/assets/games/pjcc_fork.html');
  const res = await page.evaluate(() => {
    const C = window.PJCCChess;
    const out = { n: 0, bad: [], cats: {}, pawn2: null };
    // unit: the in-game move hints must include the pawn double-step
    (function () {
      const b = parseBoard({ pieces: ['Ke1', 'Pe2', 'ke8'] });
      const ms = genMoves(b, 4, 6); // e2 (x=4, y=6)
      const two = ms.some(m => m.x === 4 && m.y === 4), one = ms.some(m => m.x === 4 && m.y === 5);
      out.pawn2 = { one, two };
    })();
    const alg = i => 'abcdefgh'[i % 8] + (8 - ((i / 8) | 0));
    function toFEN(p) {
      const b = new Array(64).fill('');
      p.pieces.forEach(s => { const t = s[0], f = s.charCodeAt(1) - 97, r = 8 - +s[2]; b[r * 8 + f] = t; });
      return C.toFEN({ b, turn: p.side, cast: { K: false, Q: false, k: false, q: false }, ep: -1, half: 0, full: 1 });
    }
    const mat = b => b.reduce((s, p) => !p ? s :
      s + (p === p.toUpperCase() ? 1 : -1) * ({ p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 })[p.toLowerCase()], 0);
    function search(S, d, a, bta) { // alpha-beta, material-only, exact depth: lower bound on the mover's gain
      const mv = C.legalMoves(S);
      if (!mv.length) return C.inCheck(S, S.turn) ? -100000 : 0;
      if (d === 0) return (S.turn === 'w' ? 1 : -1) * mat(S.b);
      let best = -Infinity;
      for (const m of mv) {
        const v = -search(C.makeMove(S, m), d - 1, -bta, -a);
        if (v > best) best = v; if (best > a) a = best; if (a >= bta) break;
      }
      return best;
    }
    let deepChecked = 0;
    out.men = [];              // how crowded each board actually is — see the gate below
    out.twoMates = [];         // mate-in-one puzzles with more than one mate in one
    out.army = [];             // armies nobody could own without promoting — see the gate below
    /* ⚑ 2026-08-08, Nate with a screenshot: "There should never be two bishops on the same
       color." The front door's pool is checked statically in style.check.js, but THIS room
       generates its thousand puzzles at runtime, so the only place to catch it is here,
       against the live generator.
       ⚠ The referee will never flag this and correctly so — two same-colored bishops is
       LEGAL, you just have to promote to get there. It is a plausibility rule. */
    const ARMY_CAP = { Q: 1, R: 2, B: 2, N: 2, P: 8 };
    function armyFault(pieces) {
      for (const up of [true, false]) {
        const mine = pieces.filter(s => (s[0] === s[0].toUpperCase()) === up);
        const side = up ? 'white' : 'black';
        for (const t in ARMY_CAP) {
          const n = mine.filter(s => s[0].toUpperCase() === t).length;
          if (n > ARMY_CAP[t]) return side + ' has ' + n + 'x' + t;
        }
        const bs = mine.filter(s => s[0].toUpperCase() === 'B').map(s => s.slice(1));
        // file a=0 … h=7, rank 1..8; (file + rank) ODD is a light square in algebraic terms
        const lit = a => ((a.charCodeAt(0) - 97) + (+a[1])) % 2 === 1;
        if (bs.length === 2 && lit(bs[0]) === lit(bs[1])) {
          return side + ' has two ' + (lit(bs[0]) ? 'light' : 'dark') + '-squared bishops';
        }
      }
      return null;
    }
    for (let i = 0; i < 600; i++) {
      const p = genPuzzle(1 + (i % 6), Math.random);
      out.n++; out.cats[p.cat || p.theme] = (out.cats[p.cat || p.theme] || 0) + 1;
      out.men.push(p.pieces.length);
      const af = armyFault(p.pieces);
      if (af) out.army.push(af + ' — ' + p.pieces.join(' '));
      const S0 = C.parseFEN(toFEN(p));
      /* ⚑ ONE MATE, NOT ONE OF TWO (2026-08-05). The room's own gate got a secondMate()
         check when the crowd arrived; this proves it from the OUTSIDE, with the referee,
         which knows nothing about the game's board code. Scoped to one-move mate puzzles,
         which is the only uniqueness claim the room makes. */
      if ((p.cat === 'mate' || /\bmate\b/i.test(p.goal)) && p.line.length === 1) {
        const mates = C.legalMoves(S0).filter(m => C.isCheckmate(C.makeMove(S0, m)));
        if (mates.length !== 1) out.twoMates.push(mates.length + 'x ' + toFEN(p));
      }
      // position sanity
      const kings = p.pieces.filter(s => s[0].toLowerCase() === 'k');
      if (kings.length !== 2) { out.bad.push(i + ':kings'); continue; }
      const other = p.side === 'w' ? 'b' : 'w';
      if (C.inCheck({ b: S0.b, turn: other }, other)) { out.bad.push(i + ':foe-already-in-check ' + toFEN(p)); continue; }
      // stored line: legal move by move (referee), reaches the goal
      let S = S0, lineOK = true;
      for (const [u] of p.line) {
        const m = C.findMove(S, C.sqFromName(u.slice(0, 2)), C.sqFromName(u.slice(2, 4)), u.length > 4 ? u[4] : null);
        if (!m) { out.bad.push(i + ':illegal-line ' + u + ' ' + toFEN(p)); lineOK = false; break; }
        S = C.makeMove(S, m);
      }
      if (!lineOK) continue;
      // \b, or the goal "Win material." matches on m-a-t-e and gets audited as a mate
      if (p.cat === 'mate' || /\bmate\b/i.test(p.goal)) {
        if (!C.isCheckmate(S)) out.bad.push(i + ':line-does-not-mate ' + toFEN(p));
      } else {
        // material after the line must favor the mover…
        const sign = p.side === 'w' ? 1 : -1;
        const gain = sign * (mat(S.b) - mat(S0.b));
        if (gain < 300) { out.bad.push(i + ':line-gains-only-' + gain + ' ' + toFEN(p)); continue; }
        // …and (sampled) hold up against EVERY defense: exact-depth alpha-beta proof.
        // search() returns ABSOLUTE material for the mover, so subtract the start balance.
        if (deepChecked < 120) {
          deepChecked++;
          const v = search(S0, p.line.length + 1, -Infinity, Infinity) - sign * mat(S0.b);
          if (v < 300) out.bad.push(i + ':best-defense-only-' + v + ' ' + toFEN(p));
        }
      }
    }
    out.deepChecked = deepChecked;
    return out;
  });
  ok(res.pawn2 && res.pawn2.one && res.pawn2.two,
    'move hints: pawn on its start square shows BOTH e3 and e4 (double-step)');
  ok(res.bad.length === 0,
    `referee cross-audit: ${res.n} generated puzzles (${JSON.stringify(res.cats)}), ` +
    `${res.deepChecked} proved vs best defense` +
    (res.bad.length ? ' -> ' + res.bad.slice(0, 4).join(' | ') : ''));
  ok(res.twoMates.length === 0,
    `every mate-in-one puzzle has exactly ONE mate in one` +
    (res.twoMates.length ? ` -> ${res.twoMates.length} with another: ` + res.twoMates.slice(0, 3).join(' | ') : ''));

  /* ⚑ AN ARMY SOMEBODY COULD ACTUALLY OWN (2026-08-08). The crowd pass made these boards
     look played; this keeps them that way. A generated position with three light-squared
     bishops on it is legal, unremarkable to every engine, and instantly wrong to anyone
     who has held a chess set. */
  ok(res.army.length === 0,
    `no generated puzzle has an army nobody could have (${res.n} checked — one queen a side, ` +
    `bishops on opposite colors)` +
    (res.army.length ? ` -> ${res.army.length} bad: ` + res.army.slice(0, 3).join(' | ') : ''));

  /* ⚑ THE BOARD MUST STAY CROWDED (2026-08-05, Nate: "the puzzles should have way more
     pieces on the board - make them a natural chess situation").
     This is a REGRESSION gate on a number that has slipped once already: the clutter term
     used to be `min(3, diff - 4)`, which is zero below difficulty 5, and the live site was
     shipping four-piece diagrams for the first four hundred puzzles of the road. Nobody
     noticed because nothing measured it. Now something does. Floors, not targets — the
     generator's pressure valve is allowed to thin a stubborn position out, it is just not
     allowed to thin ALL of them out. */
  const men = res.men.slice().sort((a, b) => a - b);
  const median = men[men.length >> 1];
  const thin = men.filter(m => m < 8).length;
  ok(median >= 11, `a generated position carries a crowd (median ${median} men, want >= 11; ` +
    `range ${men[0]}-${men[men.length - 1]})`);
  ok(thin <= res.n * 0.02, `almost none are near-empty (${thin}/${res.n} under 8 men, want <= 2%)`);

  /* --- "Why was that wrong?" — the refutation card must never lie ---------------
     For real generated puzzles we play EVERY wrong first move, ask the game for its
     refutation, and re-prove the claim against the REFEREE (pjcc-chess.js), which
     knows nothing about the game's own board code:
       · "that is mate"          -> the referee must agree it is checkmate
       · "you are down <thing>"  -> the referee's own 2-ply material search must
                                    confirm a loss of at least that much
       · "it wins nothing"       -> the mover must NOT be up a piece after all that
     Plus: the named reply has to be a legal move, and the whole thing has to be fast
     enough to run inside a click without dropping the frame. */
  const ref = await page.evaluate(() => {
    const C = window.PJCCChess;
    const out = { n: 0, bad: [], quiet: 0, mate: 0, cost: 0, alt: 0, ms: 0 };
    const AT_LEAST = { 'the queen': 840, 'a rook': 440, 'a piece': 280, 'a pawn': 70 };
    function toFEN(p, side) {
      const b = new Array(64).fill('');
      p.pieces.forEach(s => { const t = s[0], f = s.charCodeAt(1) - 97, r = 8 - +s[2]; b[r * 8 + f] = t; });
      return C.toFEN({ b, turn: side, cast: { K: false, Q: false, k: false, q: false }, ep: -1, half: 0, full: 1 });
    }
    const mat = b => b.reduce((s, q) => !q ? s :
      s + (q === q.toUpperCase() ? 1 : -1) * ({ p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 })[q.toLowerCase()], 0);
    // the referee's own opinion: after OUR move, their best reply, our best answer
    function worstCase(S, sign) {
      let worst = Infinity;
      for (const r of C.legalMoves(S)) {
        const after = C.makeMove(S, r);
        if (C.isCheckmate(after)) return -1e6;
        let best = -Infinity;
        for (const m of C.legalMoves(after)) best = Math.max(best, sign * mat(C.makeMove(after, m).b));
        if (best === -Infinity) continue;               // stalemate — no material verdict
        if (best < worst) worst = best;
      }
      return worst;
    }
    const t0 = performance.now();
    for (let i = 0; i < 40; i++) {
      const p = genPuzzle(1 + (i % 6), Math.random);
      const b0 = parseBoard(p), sign = p.side === 'w' ? 1 : -1;
      const S0 = C.parseFEN(toFEN(p, p.side));
      const right = uci(p.line[0][0]);
      const start = sign * mat(S0.b);
      for (const m of legalMovesFor(b0, p.side)) {
        if (m.fx === right.fx && m.fy === right.fy && m.tx === right.tx && m.ty === right.ty) continue;
        const r = refuteMove(p, b0, m.fx, m.fy, m.tx, m.ty);
        if (!r) continue;
        out.n++;
        const tag = p.theme + ' ' + toFEN(p, p.side) + ' [' + r.text + ']';
        // the reply it names must be a legal move in the referee's eyes
        const mine = C.findMove(S0, C.sqFromName('abcdefgh'[m.fx] + (8 - m.fy)),
                                     C.sqFromName('abcdefgh'[m.tx] + (8 - m.ty)), null);
        if (!mine) { out.bad.push('illegal-premise ' + tag); continue; }
        const S1 = C.makeMove(S0, mine);
        const theirs = C.findMove(S1, C.sqFromName('abcdefgh'[r.reply.fx] + (8 - r.reply.fy)),
                                      C.sqFromName('abcdefgh'[r.reply.tx] + (8 - r.reply.ty)), null);
        if (!theirs) { out.bad.push('illegal-reply ' + tag); continue; }
        const worst = worstCase(S1, sign);
        if (/is mate/.test(r.text)) {
          out.mate++;
          if (!C.isCheckmate(C.makeMove(S1, theirs))) out.bad.push('not-mate ' + tag);
        } else if (/you're down|points down/.test(r.text)) {
          out.cost++;
          const pts = r.text.match(/(\d+) points down/);
          const claimed = Object.keys(AT_LEAST).find(k => r.text.indexOf(k) >= 0);
          const floor = pts ? (+pts[1]) * 100 - 50 : (claimed ? AT_LEAST[claimed] : 90);
          if (start - worst < floor) out.bad.push('overstated(' + (start - worst) + '<' + floor + ') ' + tag);
        } else if (/looks strong too/.test(r.text)) {
          out.alt++;                                    // the card admits the machine likes it
          if (worst - start < 280) out.bad.push('not-actually-strong(' + (worst - start) + ') ' + tag);
        } else {
          out.quiet++;
          if (worst - start >= 280) out.bad.push('missed-a-win(' + (worst - start) + ') ' + tag);
        }
      }
    }
    out.ms = (performance.now() - t0) / Math.max(1, out.n);
    return out;
  });
  ok(ref.bad.length === 0,
    `refutations never lie: ${ref.n} wrong moves refuted (${ref.mate} mate, ${ref.cost} costed, ${ref.quiet} "wins nothing", ${ref.alt} "looks strong too"), ` +
    `each re-proved vs the referee` + (ref.bad.length ? ' -> ' + ref.bad.slice(0, 3).join(' | ') : ''));
  ok(ref.ms < 40, `a refutation costs ${ref.ms.toFixed(1)}ms — cheap enough to run inside the click`);
  await page.close();
}

/* ============ 7. BLINDFOLD CEO OPENING BOOK ============ */
function testCeoBook() {
  section("7 · Blindfold CEO opening book — legal + correctly named");
  const src = fs.readFileSync(path.join(ROOT, 'assets/games/pjcc_blindfold.html'), 'utf8');
  const m = src.match(/var OPENINGS=\[([\s\S]*?)\];/);
  ok(!!m, 'OPENINGS block found');
  if (!m) return;
  const OP = vm.runInNewContext('[' + m[1] + ']');
  const SIG = { // the move signature each name promises
    'Sicilian': ['e2e4', 'c7c5'], 'French': ['e2e4', 'e7e6'], 'Caro-Kann': ['e2e4', 'c7c6'],
    'King’s Indian': ['d2d4', 'g8f6', 'c2c4', 'g7g6'], 'Queen’s Gambit Declined': ['d2d4', 'd7d5', 'c2c4', 'e7e6'],
    'Pirc': ['e2e4', 'd7d6'],
  };
  for (const o of OP) {
    let S = E.parseFEN(E.START_FEN), legal = true;
    for (const u of o.line) {
      const mv = E.findMove(S, E.sqFromName(u.slice(0, 2)), E.sqFromName(u.slice(2, 4)), u.length > 4 ? u[4] : null);
      if (!mv) { legal = false; break; }
      S = E.makeMove(S, mv);
    }
    const sig = Object.keys(SIG).find(k => o.name.indexOf(k) >= 0);
    const named = sig ? SIG[sig].every((u, i) => o.line[i] === u) : false;
    ok(legal && named, `"${o.name}" (${o.line.length} plies): fully legal, opening matches its name`);
  }
}

/* ============ 8. STOCKFISH SECOND OPINION on opening finals ============ */
async function testStockfishEvals(finals) {
  section('8 · Stockfish second opinion — no taught line ends in a lost position');
  let sf;
  try { sf = require(path.join(ROOT, 'assets/vendor/stockfish/stockfish.js'))(); }
  catch (e) { ok(false, 'vendored Stockfish loads under Node: ' + e.message); return; }
  const lines = [];
  sf.onmessage = l => { lines.push(String(l)); if (handlers.length && handlers[0](String(l))) handlers.shift(); };
  const handlers = [];
  const waitFor = (pred, ms) => new Promise((res, rej) => {
    const t = setTimeout(() => rej(new Error('sf timeout')), ms);
    handlers.push(l => { if (pred(l)) { clearTimeout(t); res(l); return true; } return false; });
  });
  try {
    sf.postMessage('uci'); await waitFor(l => l.startsWith('uciok'), 10000);
    sf.postMessage('isready'); await waitFor(l => l.startsWith('readyok'), 10000);
    ok(true, 'vendored Stockfish boots under Node (uciok + readyok)');
    for (const f of finals) {
      lines.length = 0;
      sf.postMessage('position fen ' + f.fen);
      sf.postMessage('go movetime 600');
      await waitFor(l => l.startsWith('bestmove'), 12000);
      let cp = null;
      for (let i = lines.length - 1; i >= 0; i--) {
        const mm = lines[i].match(/score cp (-?\d+)/); if (mm) { cp = +mm[1]; break; }
        if (/score mate/.test(lines[i])) { cp = 99999 * (/score mate -/.test(lines[i]) ? -1 : 1); break; }
      }
      ok(cp !== null && Math.abs(cp) <= 300,
        `"${f.id}" final position within ±3 pawns of equal (SF says ${cp === null ? '?' : cp}cp for the side to move)`);
    }
  } catch (e) { ok(false, 'Stockfish evaluation run: ' + e.message); }
  try { sf.postMessage('quit'); } catch (e) {}
}

/* ============ main ============ */
(async () => {
  console.log('CHESS ACCURACY GATE — referee = pjcc-chess.js, second opinion = Stockfish 10');
  testReferee();
  testAcademyFacts();
  testKnightTables();
  testCeoBook();
  const srv = await serve();
  const port = srv.address().port;
  const browser = await pp.launch({ executablePath: findChrome(), headless: 'new', args: ['--no-sandbox', '--mute-audio'] });
  let finals = [];
  try {
    finals = await testPirc(browser, port);
    await testBlindfold(browser, port);
    await testMindsEye(browser, port);
    await testFork(browser, port);
  } finally {
    await browser.close(); srv.close();
  }
  await testStockfishEvals(finals);
  console.log('\n' + '─'.repeat(60));
  console.log(FAIL === 0 ? `ALL ${PASS} CHESS ACCURACY CHECKS PASSED ✅`
    : `${FAIL} FAILED / ${PASS} passed ❌\n` + fails.map(f => '  ✗ ' + f).join('\n'));
  process.exit(FAIL === 0 ? 0 : 1);
})().catch(e => { console.error('GATE CRASHED:', e); process.exit(1); });
