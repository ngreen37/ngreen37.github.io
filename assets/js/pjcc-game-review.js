/*! pjcc-game-review.js — always-free, client-side game review (Stockfish).
 *
 *  The chess.com model gates game review because THEY run the engine on their
 *  servers and pay per analysis. We run Stockfish in the visitor's own browser,
 *  so a full review costs the studio $0 — which is exactly why we can promise it
 *  free, forever, with no "one free review then pay" wall.
 *
 *  LIVE since 2026-07-16 (Nate: "let's turn reviews on") — ENABLED = true, everyone
 *  sees the Review button. The ?review=on/?review=off preview flag still works and
 *  is now a no-op while ENABLED is true. Same day: the BEST MOVE ARROW — when a
 *  played move wasn't the engine's best, a green arrow on the board points out
 *  what the best move was, alongside the existing "best was …" text.
 *
 *  It reuses the vendored single-threaded Stockfish (the Gauntlet's engine) on its
 *  OWN worker, tuned for evaluation instead of throttled play, and the perft-
 *  verified PJCCChess engine to replay the game and name moves. Nothing here throws
 *  or hangs: no engine / no worker / a dead search all degrade to a graceful notice.
 *
 *  API (window.PJCCReview):
 *    enabled()                 -> boolean  (ENABLED || private preview)
 *    available()               -> boolean  (Stockfish can run in this browser)
 *    open(movesStr, meta)      -> opens the review overlay for a UCI move list
 *        meta: { whiteName, blackName, result }  (all optional, for the header)
 */
(function (root) {
  'use strict';

  var ENABLED = true;                      // LIVE for everyone (Nate 2026-07-16)
  var LS_DEV  = 'pjcc.review.preview';
  var MOVETIME = 190;                       // ms per position — shallow but honest club-level

  // ---- private-preview flag (?review=on / ?review=off), persisted per browser ----
  try {
    var q = (root.location && root.location.search) || '';
    if (/[?&]review=on/i.test(q)) localStorage.setItem(LS_DEV, '1');
    else if (/[?&]review=off/i.test(q)) localStorage.removeItem(LS_DEV);
  } catch (e) {}
  function enabled() { try { return ENABLED || localStorage.getItem(LS_DEV) === '1'; } catch (e) { return ENABLED; } }

  function C() { return root.PJCCChess; }
  function available() {
    return typeof root.Worker !== 'undefined' && typeof root.WebAssembly !== 'undefined' && !!C();
  }

  /* ─────────────────────────── the engine (eval-parsing) ─────────────────────── */
  var BASE = '/assets/vendor/stockfish/';
  var WORKER_URL = BASE + 'stockfish.js#' + BASE + 'stockfish.wasm';
  var worker = null, wstate = 'idle', readyWaiters = [], cur = null;

  function post(c) { try { if (worker) worker.postMessage(c); } catch (e) {} }
  function flush(ok) { var w = readyWaiters; readyWaiters = []; w.forEach(function (r) { try { r(ok); } catch (e) {} }); }
  function dead() {
    if (wstate === 'dead') return;
    wstate = 'dead';
    try { if (worker) worker.terminate(); } catch (e) {}
    worker = null; flush(false);
    if (cur) { var c = cur; cur = null; if (c.timer) clearTimeout(c.timer); c.resolve(null); }
  }
  function onMsg(e) {
    var line = (typeof e.data === 'string') ? e.data : (e.data && e.data.data) || '';
    if (!line) return;
    if (wstate === 'booting') {
      if (line.indexOf('uciok') === 0) { post('isready'); return; }
      if (line.indexOf('readyok') === 0) { wstate = 'ready'; flush(true); return; }
    }
    if (!cur) return;
    if (line.indexOf('info') === 0 && line.indexOf(' score ') > -1) {
      var mm = line.match(/score (cp|mate) (-?\d+)/);
      if (mm) cur.score = { type: mm[1], val: parseInt(mm[2], 10) };
      var pm = line.match(/ pv ([a-h][1-8][a-h][1-8][qrbn]?)/);
      if (pm) cur.best = pm[1];
    } else if (line.indexOf('bestmove') === 0) {
      var bm = line.split(/\s+/)[1];
      if (bm && bm !== '(none)') cur.best = bm;
      var c = cur; cur = null; if (c.timer) clearTimeout(c.timer);
      c.resolve({ score: c.score, best: c.best });
    }
  }
  function boot() {
    if (wstate !== 'idle') return;
    if (!available()) { wstate = 'dead'; return; }
    wstate = 'booting';
    try {
      worker = new root.Worker(WORKER_URL);
      worker.onmessage = onMsg; worker.onerror = function () { dead(); };
      post('uci');
      setTimeout(function () { if (wstate !== 'ready') dead(); }, 9000);
    } catch (e) { dead(); }
  }
  function ready() {
    return new Promise(function (res) {
      if (wstate === 'ready') return res(true);
      if (wstate === 'dead') return res(false);
      readyWaiters.push(res);
      if (wstate === 'idle') boot();
    });
  }
  // Evaluate one FEN. Resolves { score:{type,val}, best } from the SIDE-TO-MOVE's POV, or null.
  function analyze(fen) {
    return ready().then(function (ok) {
      if (!ok) return null;
      return new Promise(function (res) {
        cur = { resolve: res, score: null, best: null, timer: null };
        cur.timer = setTimeout(function () { post('stop'); }, MOVETIME + 2000);
        post('position fen ' + fen);
        post('go movetime ' + MOVETIME);
      });
    });
  }

  /* ─────────────────────────── scoring helpers ───────────────────────────────── */
  // Side-to-move score → capped centipawns (mate folded to a large finite number).
  function cp(score) {
    if (!score) return 0;
    if (score.type === 'mate') return score.val > 0 ? 1500 : -1500;
    return Math.max(-1500, Math.min(1500, score.val));
  }
  // Lichess-style win% for the side to move, from its own centipawns.
  function winPct(c) { return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * c)) - 1); }
  function accFromLoss(loss) { // loss in win-% points → per-move accuracy %
    var a = 103.1668 * Math.exp(-0.04354 * loss) - 3.1669;
    return Math.max(0, Math.min(100, a));
  }
  function classOf(isBest, winLoss) {
    if (isBest) return 'best';
    if (winLoss < 2)  return 'good';
    if (winLoss < 5)  return 'ok';
    if (winLoss < 10) return 'inaccuracy';
    if (winLoss < 20) return 'mistake';
    return 'blunder';
  }
  var LABEL = { book: 'Book', best: 'Best', good: 'Good', ok: 'Solid', inaccuracy: 'Inaccuracy', mistake: 'Mistake', blunder: 'Blunder' };
  var MARK  = { book: '📖', best: '★', good: '✓', ok: '·', inaccuracy: '?!', mistake: '?', blunder: '??' };

  /* ─────────────────────────── replay + analyze ──────────────────────────────── */
  function replay(movesStr) {
    var Cc = C(), S = Cc.parseFEN(Cc.START_FEN);
    var fens = [Cc.toFEN(S)], moves = [];
    var list = (movesStr || '').trim() ? movesStr.trim().split(/\s+/) : [];
    for (var i = 0; i < list.length; i++) {
      var u = list[i];
      if (!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(u)) break;
      var m = Cc.findMove(S, Cc.sqFromName(u.slice(0, 2)), Cc.sqFromName(u.slice(2, 4)), u[4] || null);
      if (!m) break;
      moves.push({ san: Cc.toSAN(S, m), uci: u, mover: S.turn, from: m.from, to: m.to });
      S = Cc.makeMove(S, m);
      fens.push(Cc.toFEN(S));
    }
    return { fens: fens, moves: moves };
  }

  // Analyze a whole game → report. onProgress(done,total) is called as it grinds.
  function analyzeGame(movesStr, onProgress) {
    var r = replay(movesStr), fens = r.fens, moves = r.moves, N = moves.length;
    var evals = new Array(fens.length), bests = new Array(fens.length);
    var idx = 0;
    function step() {
      if (idx >= fens.length) return Promise.resolve();
      return analyze(fens[idx]).then(function (res) {
        evals[idx] = res ? cp(res.score) : 0;         // side-to-move POV
        bests[idx] = res ? res.best : null;
        idx++;
        if (onProgress) onProgress(idx, fens.length);
        return step();
      });
    }
    return step().then(function () {
      var plies = [], accSum = { w: 0, b: 0 }, accN = { w: 0, b: 0 }, evalW = [];
      for (var i = 0; i < fens.length; i++) {
        var stm = fens[i].split(' ')[1];               // side to move at position i
        evalW.push(stm === 'w' ? evals[i] : -evals[i]); // graph in White's favour
      }
      // Opening theory (Nate: the first moves "are usually book moves", not blunders).
      // A move that follows a known line is tagged Book and left out of the accuracy
      // math — it measures preparation, not calculation. Degrades to no book if the
      // module isn't present.
      var op = (root.PJCCOpenings && root.PJCCOpenings.classify)
        ? root.PJCCOpenings.classify(moves.map(function (m) { return m.uci; }))
        : { bookPlies: 0, name: null, eco: null };
      for (var k = 0; k < N; k++) {
        var mover = moves[k].mover;                     // 'w' | 'b'
        var inBook   = k < op.bookPlies;
        var cpBefore = evals[k];                        // mover POV (mover is side to move at k)
        var cpAfter  = -evals[k + 1];                   // after the move it's the opponent's POV → negate
        var winLoss  = Math.max(0, winPct(cpBefore) - winPct(cpAfter));
        var cpLoss   = Math.max(0, cpBefore - cpAfter);
        var isBest   = bests[k] ? (bests[k] === moves[k].uci) : (winLoss < 1);
        var cls      = inBook ? 'book' : classOf(isBest, winLoss);
        var bestSan  = null, bestFrom = null, bestTo = null;
        if (!inBook && !isBest && bests[k]) {
          try {
            var Cc = C(), Sb = Cc.parseFEN(fens[k]), bu = bests[k];
            var bm = Cc.findMove(Sb, Cc.sqFromName(bu.slice(0, 2)), Cc.sqFromName(bu.slice(2, 4)), bu[4] || null);
            if (bm) { bestSan = Cc.toSAN(Sb, bm); bestFrom = bm.from; bestTo = bm.to; }
          } catch (e) {}
        }
        if (!inBook) { var a = accFromLoss(winLoss); accSum[mover] += a; accN[mover] += 1; }
        plies.push({ n: k, san: moves[k].san, mover: mover, cls: cls, winLoss: winLoss,
                     cpLoss: cpLoss, bestSan: bestSan, bestFrom: bestFrom, bestTo: bestTo,
                     from: moves[k].from, to: moves[k].to });
      }
      var turning = plies.filter(function (p) { return p.cls === 'blunder' || p.cls === 'mistake'; })
                         .sort(function (a, b) { return b.winLoss - a.winLoss; }).slice(0, 3);
      return {
        fens: fens, moves: moves, evalW: evalW, plies: plies, turning: turning,
        opening: op,
        accuracy: { w: accN.w ? Math.round(accSum.w / accN.w * 10) / 10 : null,
                    b: accN.b ? Math.round(accSum.b / accN.b * 10) / 10 : null }
      };
    });
  }

  /* ─────────────────────────── the overlay UI ────────────────────────────────── */
  var GLYPH = { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚' };
  function styles() {
    if (document.getElementById('pgr-css')) return;
    var s = document.createElement('style'); s.id = 'pgr-css';
    s.textContent =
      '.pgr-ov{position:fixed;inset:0;z-index:9999;background:rgba(8,5,22,.86);backdrop-filter:blur(3px);' +
        'display:flex;align-items:center;justify-content:center;padding:16px;font-family:Poppins,system-ui,sans-serif}' +
      '.pgr-card{background:#160c33;border:1px solid #3a2a6a;border-radius:16px;max-width:840px;width:100%;' +
        'max-height:92vh;overflow:auto;box-shadow:0 30px 80px -20px rgba(0,0,0,.7);color:#e9e2ff}' +
      '.pgr-hd{display:flex;align-items:center;gap:10px;padding:14px 18px;border-bottom:1px solid #2a1f52;position:sticky;top:0;background:#160c33;z-index:2}' +
      '.pgr-hd h3{margin:0;font-size:1.02rem;color:#F5C518;font-weight:800;letter-spacing:.02em}' +
      '.pgr-hd .pgr-sub{font-size:.76rem;color:#9a8fd4}' +
      '.pgr-x{margin-left:auto;background:#241847;border:1px solid #4a3a86;color:#cdbcf2;border-radius:8px;' +
        'width:32px;height:32px;font-size:16px;cursor:pointer;line-height:1}' +
      '.pgr-x:hover{border-color:#F5C518;color:#F5C518}' +
      '.pgr-body{padding:16px 18px}' +
      '.pgr-prog{height:8px;background:#241847;border-radius:99px;overflow:hidden;margin:8px 0 6px}' +
      '.pgr-prog i{display:block;height:100%;width:0;background:linear-gradient(90deg,#6bffb8,#F5C518);transition:width .2s}' +
      '.pgr-note{font-size:.8rem;color:#9a8fd4;text-align:center;margin:8px 0}' +
      '.pgr-grid{display:grid;grid-template-columns:auto 1fr;gap:18px}' +
      '@media(max-width:640px){.pgr-grid{grid-template-columns:1fr}}' +
      '.pgr-left{display:flex;flex-direction:column;gap:10px;align-items:center}' +
      '.pgr-boardwrap{display:flex;gap:8px}' +
      '.pgr-bar{width:12px;border-radius:6px;overflow:hidden;background:#111;border:1px solid #2a1f52;position:relative;flex-shrink:0}' +
      '.pgr-bar i{position:absolute;left:0;right:0;bottom:0;background:#f0eee8;transition:height .25s}' +
      '.pgr-nav{display:flex;gap:6px;align-items:center;justify-content:center}' +
      '.pgr-nav button{background:#241847;border:1px solid #4a3a86;color:#cdbcf2;border-radius:8px;padding:6px 12px;cursor:pointer;font-size:14px}' +
      '.pgr-nav button:hover{border-color:#F5C518;color:#F5C518}' +
      '.pgr-nav span{font-size:.78rem;color:#9a8fd4;min-width:88px;text-align:center}' +
      '.pgr-acc{display:flex;gap:10px;justify-content:center;margin-bottom:10px}' +
      '.pgr-accbox{flex:1;max-width:180px;background:#1c1140;border:1px solid #2a1f52;border-radius:10px;padding:8px 10px;text-align:center}' +
      '.pgr-accbox b{display:block;font-size:1.3rem;color:#fff}.pgr-accbox small{color:#9a8fd4;font-size:.7rem;letter-spacing:.08em;text-transform:uppercase}' +
      '.pgr-graph{width:100%;height:46px;display:block;margin:4px 0 12px;background:#0f0a26;border:1px solid #2a1f52;border-radius:8px}' +
      '.pgr-moves{max-height:320px;overflow:auto;font-size:.85rem}' +
      '.pgr-mv{display:grid;grid-template-columns:34px 1fr auto;gap:8px;align-items:center;padding:5px 8px;border-radius:7px;cursor:pointer}' +
      '.pgr-mv:hover{background:#20153f}.pgr-mv.sel{background:#2a1a5e;outline:1px solid #F5C518}' +
      '.pgr-mv .pgr-no{color:#7d6bb0;font-family:"Share Tech Mono",monospace}' +
      '.pgr-mv .pgr-san{font-weight:700}' +
      '.pgr-tag{font-size:.7rem;font-weight:800;padding:1px 7px;border-radius:99px;white-space:nowrap}' +
      '.pgr-opening{text-align:center;font-size:.82rem;color:#cdbcf2;margin:0 0 10px}.pgr-opening b{color:#d9c9ff}.pgr-opening small{color:#8f82c8;letter-spacing:.05em}' +
      '.pgr-c-book{color:#c3b4ff;background:rgba(160,140,230,.14)}' +
      '.pgr-c-best{color:#6bffb8;background:rgba(107,255,184,.12)}.pgr-c-good{color:#a9e5ff;background:rgba(120,190,255,.1)}' +
      '.pgr-c-ok{color:#c7bdf0;background:rgba(160,150,220,.1)}.pgr-c-inaccuracy{color:#ffd77a;background:rgba(245,197,24,.12)}' +
      '.pgr-c-mistake{color:#ff9e6b;background:rgba(255,140,80,.14)}.pgr-c-blunder{color:#ff6b6b;background:rgba(255,80,80,.16)}' +
      '.pgr-best{font-size:.78rem;color:#9a8fd4;margin-top:8px;min-height:1.2em}.pgr-best b{color:#6bffb8}' +
      '.pgr-turn{margin-top:12px;font-size:.8rem;color:#c7bdf0}.pgr-turn h4{margin:0 0 4px;color:#F5C518;font-size:.8rem;letter-spacing:.06em;text-transform:uppercase}' +
      '.pgr-turn a{color:#ffd77a;cursor:pointer;text-decoration:underline dotted}' +
      '.pgr-foot{font-size:.72rem;color:#6f5fb0;text-align:center;margin-top:14px}';
    document.head.appendChild(s);
  }

  function boardSVG(fen, hi, arrow) {
    var S = C().parseFEN(fen), b = S.b, sq = '', pc = '', mk = '';
    // colors come from THE CHESS CANON tokens (_pjcc-22-chess-canon.scss) — the
    // review board matches the Park Tables + Academy boards (Nate: "always uniform").
    // Inline SVG resolves var(--…) from the page; fallbacks mirror the partial.
    for (var i = 0; i < 64; i++) {
      var x = i % 8, y = (i / 8) | 0, dark = (x + y) % 2 === 1;
      sq += '<rect x="' + (x * 10) + '" y="' + (y * 10) + '" width="10" height="10" fill="' + (dark ? 'var(--chess-dk, #9c5f33)' : 'var(--chess-lt, #e9d3a4)') + '"/>';
      if (hi && (i === hi.from || i === hi.to))
        mk += '<rect x="' + (x * 10) + '" y="' + (y * 10) + '" width="10" height="10" fill="rgba(245,197,24,0.42)"/>';
      var p = b[i];
      if (p) {
        var white = p === p.toUpperCase(), g = GLYPH[p.toLowerCase()];
        pc += '<text x="' + (x * 10 + 5) + '" y="' + (y * 10 + 7.9) + '" text-anchor="middle" font-size="8.6" ' +
          'fill="' + (white ? 'var(--piece-w-fill, #fff)' : 'var(--piece-b-fill, #4a3585)') +
          '" stroke="' + (white ? 'var(--piece-w-line, #2f2440)' : 'var(--piece-b-line, #f2e9ff)') +
          '" stroke-width="0.42">' + g + '</text>';
      }
    }
    // BEST MOVE ARROW (Nate 2026-07-16): when the played move wasn't the engine's
    // best, a green arrow points from where the best move started to where it went.
    // Drawn ABOVE the pieces so it can't hide under them.
    var ar = '';
    if (arrow && arrow.from != null && arrow.to != null && arrow.from !== arrow.to) {
      var x1 = (arrow.from % 8) * 10 + 5, y1 = ((arrow.from / 8) | 0) * 10 + 5;
      var x2 = (arrow.to % 8) * 10 + 5,  y2 = ((arrow.to / 8) | 0) * 10 + 5;
      var dx = x2 - x1, dy = y2 - y1, len = Math.sqrt(dx * dx + dy * dy);
      var ux = dx / len, uy = dy / len;                 // unit vector along the arrow
      var bx = x2 - ux * 3.4, by = y2 - uy * 3.4;       // where the head begins
      var pxp = -uy, pyp = ux;                          // perpendicular, for the head's corners
      ar = '<g opacity="0.9">' +
        '<line x1="' + (x1 + ux * 2).toFixed(1) + '" y1="' + (y1 + uy * 2).toFixed(1) +
          '" x2="' + bx.toFixed(1) + '" y2="' + by.toFixed(1) +
          '" stroke="#2fbf71" stroke-width="1.8" stroke-linecap="round"/>' +
        '<polygon points="' + x2.toFixed(1) + ',' + y2.toFixed(1) + ' ' +
          (bx + pxp * 2.1).toFixed(1) + ',' + (by + pyp * 2.1).toFixed(1) + ' ' +
          (bx - pxp * 2.1).toFixed(1) + ',' + (by - pyp * 2.1).toFixed(1) +
          '" fill="#2fbf71"/></g>';
    }
    return '<svg viewBox="0 0 80 80" width="240" height="240" xmlns="http://www.w3.org/2000/svg" style="border-radius:6px;box-shadow:0 4px 16px rgba(0,0,0,.4)">' +
      sq + mk + pc + ar + '</svg>';
  }

  function open(movesStr, meta) {
    meta = meta || {};
    styles();
    var ov = document.createElement('div'); ov.className = 'pgr-ov';
    var names = (meta.whiteName || 'White') + ' vs ' + (meta.blackName || 'Black') + (meta.result ? ' · ' + meta.result : '');
    ov.innerHTML =
      '<div class="pgr-card"><div class="pgr-hd"><h3>Game Review</h3>' +
        '<span class="pgr-sub">' + esc(names) + '</span>' +
        '<button class="pgr-x" aria-label="Close">✕</button></div>' +
      '<div class="pgr-body" id="pgr-body">' +
        '<p class="pgr-note" id="pgr-status">Warming up the engine…</p>' +
        '<div class="pgr-prog"><i id="pgr-bar"></i></div>' +
        '<p class="pgr-note" style="font-size:.72rem">Analysis runs entirely in your browser — always free.</p>' +
      '</div></div>';
    document.body.appendChild(ov);
    document.body.style.overflow = 'hidden';
    function close() { try { ov.remove(); document.body.style.overflow = ''; } catch (e) {} }
    ov.querySelector('.pgr-x').onclick = close;
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    document.addEventListener('keydown', function esc2(e) { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc2); } });

    if (!available()) {
      document.getElementById('pgr-body').innerHTML =
        '<p class="pgr-note">Game review needs the analysis engine, which this browser can\'t run. ' +
        'Try a desktop browser — the review is always free when it works.</p>';
      return;
    }

    var total = 1;
    analyzeGame(movesStr, function (done, tot) {
      total = tot;
      var st = document.getElementById('pgr-status'), bar = document.getElementById('pgr-bar');
      if (st) st.textContent = 'Analyzing… move ' + Math.min(done, tot) + ' of ' + tot;
      if (bar) bar.style.width = Math.round(done / tot * 100) + '%';
    }).then(function (rep) {
      if (!ov.isConnected) return;
      if (!rep.plies.length) {
        document.getElementById('pgr-body').innerHTML = '<p class="pgr-note">No moves to review yet.</p>';
        return;
      }
      renderReport(ov, rep);
    }).catch(function () {
      var b = document.getElementById('pgr-body');
      if (b) b.innerHTML = '<p class="pgr-note">The review couldn\'t finish on this browser. It\'s always free when it runs — try again on desktop.</p>';
    });
  }

  function renderReport(ov, rep) {
    var body = document.getElementById('pgr-body');
    var accW = rep.accuracy.w == null ? '—' : rep.accuracy.w.toFixed(1);
    var accB = rep.accuracy.b == null ? '—' : rep.accuracy.b.toFixed(1);
    // eval graph (White POV), a compact sparkline
    var W = 460, H = 46, N = rep.evalW.length;
    var pts = rep.evalW.map(function (e, i) {
      var x = N > 1 ? i / (N - 1) * W : 0;
      var yy = H / 2 - Math.max(-1, Math.min(1, e / 800)) * (H / 2 - 3);
      return x.toFixed(1) + ',' + yy.toFixed(1);
    }).join(' ');
    var graph = '<svg class="pgr-graph" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none">' +
      '<line x1="0" y1="' + (H / 2) + '" x2="' + W + '" y2="' + (H / 2) + '" stroke="#3a2a6a" stroke-width="1"/>' +
      '<polyline points="' + pts + '" fill="none" stroke="#F5C518" stroke-width="1.5"/></svg>';

    var movesH = rep.plies.map(function (p) {
      var num = (p.mover === 'w') ? (p.n / 2 + 1) + '.' : (Math.floor(p.n / 2) + 1) + '…';
      return '<div class="pgr-mv" data-k="' + (p.n + 1) + '">' +
        '<span class="pgr-no">' + num + '</span>' +
        '<span class="pgr-san">' + esc(p.san) + '</span>' +
        '<span class="pgr-tag pgr-c-' + p.cls + '">' + MARK[p.cls] + ' ' + LABEL[p.cls] + '</span></div>';
    }).join('');

    var turnH = '';
    if (rep.turning.length) {
      turnH = '<div class="pgr-turn"><h4>Turning points</h4>' + rep.turning.map(function (p) {
        var num = Math.floor(p.n / 2) + 1;
        return '<div>Move ' + num + (p.mover === 'w' ? ' (White) ' : ' (Black) ') +
          '<a data-k="' + (p.n + 1) + '">' + esc(p.san) + '</a> — ' + LABEL[p.cls].toLowerCase() +
          (p.bestSan ? '; <b style="color:#6bffb8">' + esc(p.bestSan) + '</b> was stronger.' : '.') + '</div>';
      }).join('') + '</div>';
    }

    var openH = (rep.opening && rep.opening.name)
      ? '<div class="pgr-opening">📖 <b>' + esc(rep.opening.name) + '</b>' +
          (rep.opening.eco ? ' <small>' + esc(rep.opening.eco) + '</small>' : '') + '</div>'
      : '';
    body.innerHTML =
      '<div class="pgr-acc"><div class="pgr-accbox"><b>' + accW + '%</b><small>White accuracy</small></div>' +
        '<div class="pgr-accbox"><b>' + accB + '%</b><small>Black accuracy</small></div></div>' +
      openH +
      graph +
      '<div class="pgr-grid"><div class="pgr-left">' +
        '<div class="pgr-boardwrap"><div class="pgr-bar"><i id="pgr-evalfill"></i></div><div id="pgr-board"></div></div>' +
        '<div class="pgr-nav"><button id="pgr-prev">◂</button><span id="pgr-ply">Start</span><button id="pgr-next">▸</button></div>' +
        '<div class="pgr-best" id="pgr-best"></div>' +
      '</div><div><div class="pgr-moves" id="pgr-moves">' + movesH + '</div>' + turnH + '</div></div>' +
      '<p class="pgr-foot">Stockfish · shallow but honest · runs in your browser · always free</p>';

    var k = rep.fens.length - 1;           // start at the final position
    function show(i) {
      k = Math.max(0, Math.min(rep.fens.length - 1, i));
      var hi = k > 0 ? rep.moves[k - 1] : null;
      // the best-move arrow: any move that wasn't the engine's best gets pointed out
      var pk = k > 0 ? rep.plies[k - 1] : null;
      var arrow = (pk && pk.bestFrom != null) ? { from: pk.bestFrom, to: pk.bestTo } : null;
      document.getElementById('pgr-board').innerHTML = boardSVG(rep.fens[k], hi, arrow);
      var ev = rep.evalW[k], pct = 50 + Math.max(-1, Math.min(1, ev / 800)) * 50;
      document.getElementById('pgr-evalfill').style.height = pct.toFixed(0) + '%';
      var plyLbl = document.getElementById('pgr-ply'), best = document.getElementById('pgr-best');
      if (k === 0) { plyLbl.textContent = 'Start'; best.innerHTML = ''; }
      else {
        var p = rep.plies[k - 1], num = Math.floor((k - 1) / 2) + 1;
        plyLbl.textContent = num + (p.mover === 'w' ? '. ' : '… ') + p.san;
        best.innerHTML = MARK[p.cls] + ' <b style="color:inherit">' + LABEL[p.cls] + '</b>' +
          (p.bestSan ? ' — best was <b style="color:#2fbf71">' + esc(p.bestSan) + '</b> <span style="color:#2fbf71">➤</span>' : '');
      }
      Array.prototype.forEach.call(document.querySelectorAll('.pgr-mv'), function (el) {
        el.classList.toggle('sel', +el.getAttribute('data-k') === k);
      });
      var selEl = document.querySelector('.pgr-mv.sel');
      if (selEl) selEl.scrollIntoView({ block: 'nearest' });
    }
    document.getElementById('pgr-prev').onclick = function () { show(k - 1); };
    document.getElementById('pgr-next').onclick = function () { show(k + 1); };
    body.addEventListener('click', function (e) {
      var t = e.target.closest('[data-k]'); if (t) show(+t.getAttribute('data-k'));
    });
    document.addEventListener('keydown', function nav(e) {
      if (!ov.isConnected) { document.removeEventListener('keydown', nav); return; }
      if (e.key === 'ArrowLeft') show(k - 1);
      else if (e.key === 'ArrowRight') show(k + 1);
    });
    show(k);
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  root.PJCCReview = { enabled: enabled, available: available, open: open, analyzeGame: analyzeGame };
})(typeof self !== 'undefined' ? self : this);
