/*! pjcc-analysis.js — the analysis board (2026-07-28, Nate: "thoughts on an analysis
 *  board for the puzzles, daily games, and game reviews? With the basics (updating
 *  eval bar, etc). Can you give it a shot?").
 *
 *  ONE board, opened from three places, always the same object:
 *    · the Puzzle Room  — after a puzzle resolves, take the position apart
 *    · the Park Tables  — on a FINISHED correspondence game (never a live one; see below)
 *    · the Game Review  — jump from any ply straight onto a board you can move
 *
 *  It is a REAL board, not a picture of one: every legal move for either side, take
 *  back, reset, flip, and a Stockfish eval that re-runs on every position and refines
 *  the bar as it thinks. Same deal as the review — the engine runs in the visitor's own
 *  browser, so this costs the studio $0 and is free forever with no wall.
 *
 *  ⚠ NEVER OPEN THIS OVER A GAME IN PROGRESS. An engine beside a live board is
 *  cheating, dressed as a feature. Every caller here is a finished game, a solved
 *  puzzle, or a review of something already over — keep it that way.
 *
 *  Nothing here throws or hangs: no Worker, no WebAssembly, no PJCCChess, or a dead
 *  search all degrade to a board that still plays, with the eval column saying so.
 *
 *  API (window.PJCCAnalysis):
 *    available()        -> boolean   (a board can be shown at all — needs PJCCChess)
 *    engineOk()         -> boolean   (Stockfish can run here too)
 *    open(opts)         -> opens the overlay
 *        opts: { fen, moves, ply, title, subtitle, flip }
 *          fen      starting position (default: the standard start)
 *          moves    a UCI move list to replay first (a game to walk into)
 *          ply      how far down `moves` to start (default: all of it)
 *          flip     true to look from Black's side
 */
(function (root) {
  'use strict';

  var MOVETIME = 2500;         // ms per position — deep enough to be worth reading, short
                               // enough that an idle overlay isn't a space heater
  var BASE = '/assets/vendor/stockfish/';
  var WORKER_URL = BASE + 'stockfish.js#' + BASE + 'stockfish.wasm';
  var PV_MOVES = 6;            // how much of the best line to name

  function C() { return root.PJCCChess; }
  function available() { return !!C(); }
  function engineOk() {
    return typeof root.Worker !== 'undefined' && typeof root.WebAssembly !== 'undefined' && !!C();
  }

  /* ═══════════════════════════ the engine ═══════════════════════════════════════
     A worker of its own, born when the overlay opens and terminated when it closes —
     the review keeps its own and the two are never both on screen. */
  var worker = null, wstate = 'idle';
  var running = false, pending = null, curFen = null;
  var onInfo = null, onDone = null;

  var UCI = /^[a-h][1-8][a-h][1-8][qrbn]?$/;
  /* ⚠ THE PV DOESN'T END WHERE THE LINE ENDS. This vendored build appends its own
     telemetry after the moves — `… pv b5d3 f8c5 e1g1 bmc 0.0062` — so the raw token
     count is the line PLUS two. That mattered more than it looks: the "is this a real
     line or a truncated one" guard below counts tokens, and `['b5d3','bmc','0.0062']`
     is length 3, so a one-move line sailed straight through it and "8. Bd3" stayed on
     screen for the whole search. Cut the tail here, once, and every count downstream
     is the number of MOVES. */
  function uciPrefix(tokens) {
    var out = [];
    for (var i = 0; i < tokens.length; i++) {
      if (!UCI.test(tokens[i])) break;
      out.push(tokens[i]);
    }
    return out;
  }
  function post(c) { try { if (worker) worker.postMessage(c); } catch (e) {} }
  function killEngine() {
    try { if (worker) worker.terminate(); } catch (e) {}
    worker = null; wstate = 'idle'; running = false; pending = null; curFen = null;
    onInfo = null; onDone = null;
  }
  function onMsg(e) {
    var line = (typeof e.data === 'string') ? e.data : (e.data && e.data.data) || '';
    if (!line) return;
    if (wstate === 'booting') {
      if (line.indexOf('uciok') === 0) { post('isready'); return; }
      if (line.indexOf('readyok') === 0) { wstate = 'ready'; kick(); return; }
    }
    if (line.indexOf('info') === 0 && line.indexOf(' score ') > -1) {
      var sc = line.match(/score (cp|mate) (-?\d+)/);
      var dp = line.match(/ depth (\d+)/);
      var pv = line.match(/ pv (.+)$/);
      if (sc && onInfo) {
        onInfo(curFen, { type: sc[1], val: parseInt(sc[2], 10) },
               dp ? parseInt(dp[1], 10) : 0,
               pv ? uciPrefix(pv[1].trim().split(/\s+/)) : []);
      }
    } else if (line.indexOf('bestmove') === 0) {
      running = false;
      if (onDone) onDone(curFen);
      kick();
    }
  }
  function kick() {
    if (wstate !== 'ready' || running || !pending) return;
    curFen = pending; pending = null; running = true;
    post('position fen ' + curFen);
    post('go movetime ' + MOVETIME);
  }
  /* Ask for a position. If a search is already up, tell it to stop and queue this one —
     and crucially DON'T move curFen until that search's bestmove lands, so the stale
     info lines still arriving are attributed to the position they actually describe. */
  function search(fen) {
    if (!engineOk()) return;
    pending = fen;
    if (wstate === 'idle') {
      wstate = 'booting';
      try {
        worker = new root.Worker(WORKER_URL);
        worker.onmessage = onMsg;
        worker.onerror = function () { wstate = 'dead'; running = false; if (onDone) onDone(null); };
        post('uci');
        setTimeout(function () { if (wstate === 'booting') { wstate = 'dead'; if (onDone) onDone(null); } }, 12000);
      } catch (e) { wstate = 'dead'; }
      return;
    }
    if (running) post('stop'); else kick();
  }

  /* ═══════════════════════════ scoring ══════════════════════════════════════════ */
  // Engine scores are from the SIDE TO MOVE's point of view; the bar is always White's.
  function whitePov(score, turn) {
    if (!score) return null;
    var v = score.val * (turn === 'w' ? 1 : -1);
    return { type: score.type, val: v };
  }
  function barPct(s) {                       // 0..100, how much of the bar is White's
    if (!s) return 50;
    if (s.type === 'mate') return s.val > 0 ? 100 : 0;
    var c = Math.max(-800, Math.min(800, s.val));
    return 50 + (c / 800) * 50;
  }
  function evalText(s) {
    if (!s) return '—';
    if (s.type === 'mate') {
      if (s.val === 0) return '#';
      return (s.val > 0 ? 'M' : '-M') + Math.abs(s.val);
    }
    var p = s.val / 100;
    return (p > 0 ? '+' : p < 0 ? '−' : '') + Math.abs(p).toFixed(2);
  }

  /* ═══════════════════════════ styles ═══════════════════════════════════════════ */
  function styles() {
    if (document.getElementById('pab-css')) return;
    var s = document.createElement('style'); s.id = 'pab-css';
    s.textContent =
      '.pab-ov{position:fixed;inset:0;z-index:10000;background:rgba(8,5,22,.88);' +
        'display:flex;align-items:center;justify-content:center;padding:14px;' +
        'font-family:Poppins,system-ui,sans-serif;overflow-y:auto}' +
      '.pab-card{background:#160c33;border:1px solid #3a2a6a;border-radius:16px;max-width:760px;width:100%;' +
        'max-height:94vh;overflow:auto;box-shadow:0 30px 80px -20px rgba(0,0,0,.7);color:#e9e2ff}' +
      '.pab-hd{display:flex;align-items:center;gap:10px;padding:13px 16px;border-bottom:1px solid #2a1f52;' +
        'position:sticky;top:0;background:#160c33;z-index:2}' +
      '.pab-hd h3{margin:0;font-size:1rem;color:#F5C518;font-weight:800}' +
      '.pab-hd .pab-sub{font-size:.74rem;color:#9a8fd4;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
      '.pab-x{margin-left:auto;background:#241847;border:1px solid #4a3a86;color:#cdbcf2;border-radius:8px;' +
        'width:36px;height:36px;font-size:16px;cursor:pointer;line-height:1;flex-shrink:0}' +
      '.pab-x:hover{border-color:#F5C518;color:#F5C518}' +
      '.pab-body{padding:14px 16px;display:grid;grid-template-columns:auto 1fr;gap:16px;align-items:start}' +
      '@media(max-width:640px){.pab-body{grid-template-columns:1fr}}' +
      '.pab-left{display:flex;flex-direction:column;gap:9px;align-items:center}' +
      '.pab-boardwrap{display:flex;gap:8px;align-items:stretch}' +
      /* the eval bar — White fills from the bottom, the number rides on the outside */
      '.pab-bar{width:16px;border-radius:8px;overflow:hidden;background:#241a3f;border:1px solid #3a2a6a;' +
        'position:relative;flex-shrink:0}' +
      '.pab-bar i{position:absolute;left:0;right:0;bottom:0;height:50%;background:#f0eee8;transition:height .28s ease}' +
      '.pab-bar u{position:absolute;left:0;right:0;top:50%;height:1px;background:rgba(245,197,24,.5);text-decoration:none}' +
      '.pab-evalrow{display:flex;align-items:baseline;gap:8px;justify-content:center}' +
      '.pab-eval{font-family:"Share Tech Mono",monospace;font-size:1.15rem;color:#fff;font-weight:700;min-width:66px;text-align:center}' +
      '.pab-depth{font-size:.68rem;color:#8f82c8;letter-spacing:.06em}' +
      '.pab-board{position:relative;line-height:0;border-radius:6px;overflow:hidden;box-shadow:0 6px 20px rgba(0,0,0,.45);' +
        'touch-action:manipulation;cursor:pointer}' +
      '.pab-tools{display:flex;gap:6px;flex-wrap:wrap;justify-content:center}' +
      '.pab-tools button{background:#241847;border:1px solid #4a3a86;color:#cdbcf2;border-radius:8px;' +
        'min-height:38px;padding:6px 12px;cursor:pointer;font-size:.82rem;font-family:inherit}' +
      '.pab-tools button:hover:not(:disabled){border-color:#F5C518;color:#F5C518}' +
      '.pab-tools button:disabled{opacity:.4;cursor:default}' +
      '.pab-line{font-size:.82rem;color:#cdbcf2;background:#1c1140;border:1px solid #2a1f52;border-radius:10px;' +
        'padding:9px 11px;min-height:58px;line-height:1.7}' +
      '.pab-line b{color:#6bffb8;font-weight:800}' +
      '.pab-line em{font-style:normal;color:#8f82c8;font-size:.72rem;letter-spacing:.06em;' +
        'display:block;text-transform:uppercase;margin-bottom:3px}' +
      '.pab-moves{margin-top:10px;max-height:210px;overflow:auto;font-size:.84rem;' +
        'display:grid;grid-template-columns:30px 1fr 1fr;gap:2px 6px;align-content:start}' +
      '.pab-moves i{color:#7d6bb0;font-family:"Share Tech Mono",monospace;font-style:normal;padding:3px 0}' +
      '.pab-moves span{padding:3px 6px;border-radius:6px;cursor:pointer}' +
      '.pab-moves span:hover{background:#20153f}' +
      '.pab-moves span.sel{background:#2a1a5e;outline:1px solid #F5C518}' +
      '.pab-status{font-size:.78rem;color:#ffd77a;text-align:center;min-height:1.2em}' +
      '.pab-foot{font-size:.7rem;color:#6f5fb0;text-align:center;padding:0 16px 14px}' +
      /* the promotion picker, right on the board */
      '.pab-promo{position:absolute;inset:0;background:rgba(10,6,26,.82);display:flex;' +
        'align-items:center;justify-content:center;gap:6px}' +
      '.pab-promo button{width:46px;height:46px;font-size:26px;line-height:1;background:#241847;' +
        'border:1px solid #4a3a86;border-radius:9px;color:#f2e9ff;cursor:pointer}' +
      '.pab-promo button:hover{border-color:#F5C518;color:#F5C518}';
    document.head.appendChild(s);
  }

  /* ═══════════════════════════ the board ════════════════════════════════════════ */
  var GLYPH = { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚' };

  function boardPx() {
    var w = Math.min(window.innerWidth - 90, 360);
    return Math.max(232, Math.min(360, w));
  }
  // Screen square -> board index, honouring the flip.
  function idxAt(px, py, size, flip) {
    var t = size / 8, f = Math.floor(px / t), r = Math.floor(py / t);
    if (f < 0 || f > 7 || r < 0 || r > 7) return -1;
    return flip ? (7 - r) * 8 + (7 - f) : r * 8 + f;
  }
  function xyOf(i, size, flip) {
    var t = size / 8, r = (i / 8) | 0, f = i % 8;
    if (flip) { r = 7 - r; f = 7 - f; }
    return { x: f * t, y: r * t, t: t };
  }

  function paint(cv, S, o) {
    o = o || {};
    var size = cv._px, t = size / 8;
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = size * dpr; cv.height = size * dpr;
    var ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);
    var css = getComputedStyle(document.documentElement);
    function v(k, d) { var x = css.getPropertyValue(k).trim(); return x || d; }
    // THE CHESS CANON — same woods and livery as every other board on the site.
    var LT = v('--chess-lt', '#e9d3a4'), DK = v('--chess-dk', '#9c5f33');
    var PAL = { wFill: v('--piece-w-fill', '#fff'), wEdge: v('--piece-w-line', '#2f2440'),
                bFill: v('--piece-b-fill', '#4a3585'), bEdge: v('--piece-b-line', '#f2e9ff') };
    var i, p, q;
    for (i = 0; i < 64; i++) {
      q = xyOf(i, size, o.flip);
      var r0 = (i / 8) | 0, f0 = i % 8;
      ctx.fillStyle = ((r0 + f0) % 2 === 1) ? DK : LT;
      ctx.fillRect(q.x, q.y, t, t);
      if (o.last && (i === o.last.from || i === o.last.to)) {
        ctx.fillStyle = 'rgba(245,197,24,0.34)'; ctx.fillRect(q.x, q.y, t, t);
      }
      if (i === o.sel) { ctx.fillStyle = 'rgba(107,255,184,0.30)'; ctx.fillRect(q.x, q.y, t, t); }
    }
    // the king in check, so a position never lies about being over
    if (o.checkSq != null && o.checkSq >= 0) {
      q = xyOf(o.checkSq, size, o.flip);
      ctx.fillStyle = 'rgba(255,90,90,0.34)'; ctx.fillRect(q.x, q.y, t, t);
    }
    for (i = 0; i < 64; i++) {
      p = S.b[i]; if (!p) continue;
      q = xyOf(i, size, o.flip);
      if (root.PJCCPieces) {
        PJCCPieces.draw(ctx, q.x + t / 2, q.y + t / 2, t * 0.82,
                        p.toUpperCase(), p === p.toUpperCase() ? 'w' : 'b', PAL);
      } else {
        ctx.fillStyle = p === p.toUpperCase() ? PAL.wFill : PAL.bFill;
        ctx.strokeStyle = p === p.toUpperCase() ? PAL.wEdge : PAL.bEdge;
        ctx.lineWidth = t * 0.05;
        ctx.font = '900 ' + (t * 0.78) + 'px "Segoe UI Symbol","Apple Symbols",serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.strokeText(GLYPH[p.toLowerCase()], q.x + t / 2, q.y + t / 2 + t * 0.04);
        ctx.fillText(GLYPH[p.toLowerCase()], q.x + t / 2, q.y + t / 2 + t * 0.04);
      }
    }
    // legal-move dots — hollow rings on captures, so you can see what you're taking
    if (o.hints) {
      for (i = 0; i < o.hints.length; i++) {
        q = xyOf(o.hints[i], size, o.flip);
        ctx.beginPath();
        if (S.b[o.hints[i]]) {
          ctx.lineWidth = t * 0.09; ctx.strokeStyle = 'rgba(107,255,184,0.85)';
          ctx.arc(q.x + t / 2, q.y + t / 2, t * 0.40, 0, Math.PI * 2); ctx.stroke();
        } else {
          ctx.fillStyle = 'rgba(107,255,184,0.55)';
          ctx.arc(q.x + t / 2, q.y + t / 2, t * 0.16, 0, Math.PI * 2); ctx.fill();
        }
      }
    }
    // the engine's best move, in green, above everything
    if (o.arrow && o.arrow.from != null && o.arrow.from !== o.arrow.to) {
      var a = xyOf(o.arrow.from, size, o.flip), b = xyOf(o.arrow.to, size, o.flip);
      var x1 = a.x + t / 2, y1 = a.y + t / 2, x2 = b.x + t / 2, y2 = b.y + t / 2;
      var dx = x2 - x1, dy = y2 - y1, len = Math.sqrt(dx * dx + dy * dy) || 1;
      var ux = dx / len, uy = dy / len, hl = t * 0.34;
      var bx = x2 - ux * hl, by = y2 - uy * hl, px = -uy, py = ux, hw = t * 0.21;
      ctx.globalAlpha = 0.88; ctx.strokeStyle = '#2fbf71'; ctx.fillStyle = '#2fbf71';
      ctx.lineWidth = t * 0.15; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x1 + ux * t * 0.22, y1 + uy * t * 0.22); ctx.lineTo(bx, by); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x2, y2);
      ctx.lineTo(bx + px * hw, by + py * hw); ctx.lineTo(bx - px * hw, by - py * hw);
      ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  /* ═══════════════════════════ the overlay ══════════════════════════════════════ */
  function open(opts) {
    opts = opts || {};
    if (!available()) return false;
    var Cc = C();
    styles();

    // ── build the line we're walking into ───────────────────────────────────────
    var startFen = opts.fen || Cc.START_FEN;
    var nodes = [{ S: Cc.parseFEN(startFen), san: null, from: null, to: null }];
    var list = (opts.moves || '').trim() ? opts.moves.trim().split(/\s+/) : [];
    var upto = (opts.ply == null) ? list.length : Math.max(0, Math.min(list.length, opts.ply));
    for (var i = 0; i < upto; i++) {
      var u = list[i];
      if (!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(u)) break;
      var S0 = nodes[nodes.length - 1].S;
      var mv = Cc.findMove(S0, Cc.sqFromName(u.slice(0, 2)), Cc.sqFromName(u.slice(2, 4)), u[4] || null);
      if (!mv) break;
      nodes.push({ S: Cc.makeMove(S0, mv), san: Cc.toSAN(S0, mv), from: mv.from, to: mv.to });
    }
    var at = nodes.length - 1;
    var flip = !!opts.flip, sel = -1, hints = null;
    var best = null, sc = null, depth = 0, pvSan = '';

    var ov = document.createElement('div');
    ov.className = 'pab-ov';
    ov.innerHTML =
      '<div class="pab-card">' +
      '<div class="pab-hd"><h3>Analysis</h3><span class="pab-sub">' + esc(opts.subtitle || 'Move the pieces — the engine follows') + '</span>' +
      '<button class="pab-x" aria-label="Close analysis">✕</button></div>' +
      '<div class="pab-body">' +
        '<div class="pab-left">' +
          '<div class="pab-evalrow"><span class="pab-eval" id="pab-eval">—</span>' +
            '<span class="pab-depth" id="pab-depth"></span></div>' +
          '<div class="pab-boardwrap">' +
            '<div class="pab-bar"><i id="pab-fill"></i><u></u></div>' +
            '<div class="pab-board" id="pab-board"></div>' +
          '</div>' +
          '<div class="pab-status" id="pab-status"></div>' +
          '<div class="pab-tools">' +
            '<button id="pab-back" title="Back one move">◂</button>' +
            '<button id="pab-fwd" title="Forward one move">▸</button>' +
            '<button id="pab-flip" title="Turn the board around">⇅ Flip</button>' +
            '<button id="pab-reset" title="Back to where you started">⟲ Reset</button>' +
          '</div>' +
        '</div>' +
        '<div><div class="pab-line" id="pab-pv"><em>Best line</em><span id="pab-pvtext">Thinking…</span></div>' +
        '<div class="pab-moves" id="pab-moves"></div></div>' +
      '</div>' +
      '<p class="pab-foot">Stockfish, running in your browser — free, always. Analysis only: never open beside a game in progress.</p>' +
      '</div>';
    document.body.appendChild(ov);
    var prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    var boardHost = ov.querySelector('#pab-board');
    var cv = document.createElement('canvas');
    var px = boardPx();
    cv._px = px; cv.style.width = px + 'px'; cv.style.height = px + 'px'; cv.style.display = 'block';
    boardHost.appendChild(cv);

    function closed() { return !ov.isConnected; }
    function close() {
      try { ov.remove(); } catch (e) {}
      document.body.style.overflow = prevOverflow;
      killEngine();
    }
    ov.querySelector('.pab-x').onclick = close;
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    document.addEventListener('keydown', function key(e) {
      if (closed()) { document.removeEventListener('keydown', key); return; }
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') go(at - 1);
      else if (e.key === 'ArrowRight') go(at + 1);
    });

    // ── the engine column ───────────────────────────────────────────────────────
    if (!engineOk()) {
      ov.querySelector('#pab-pvtext').textContent =
        'This browser can\'t run the analysis engine, so there\'s no evaluation — but the board is still yours to play with.';
      ov.querySelector('#pab-eval').textContent = '—';
    }
    /* ⚠ THE LAST INFO LINE LIES ABOUT THE LINE (measured 2026-07-28, this Stockfish build).
       When the movetime expires mid-iteration it emits one final, deeper line whose SCORE
       and DEPTH are the best it has — and whose pv is just the root move:
         …depth 17 … pv b5d3 f8c5 e1g1 e8g8 b1c3 a8b8 b2b3 c5d4 …
         …depth 18 … pv b5d3 bmc 0.006          ← the truncated tail of a stopped iteration
       Taken at face value that replaced a six-move line with "8. Bd3" every single time,
       which is exactly what the board showed before this guard. The score and the root
       move from that line are good; the LINE is not, so a one-move pv never overwrites a
       longer one we already have for this same position. */
    onInfo = function (fen, score, d, pv) {
      if (closed() || fen !== Cc.toFEN(nodes[at].S)) return;   // a stale search's info
      sc = whitePov(score, nodes[at].S.turn); depth = d;
      if (pv && pv.length) {
        best = pv[0];
        if (pv.length > 1 || !pvSan) pvSan = namePV(pv);
      }
      paintEval();
    };
    onDone = function () { if (!closed()) paintEval(); };

    function namePV(pv) {
      var S = nodes[at].S, out = [], n = Math.min(PV_MOVES, pv.length);
      for (var i = 0; i < n; i++) {
        var u = pv[i];
        if (!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(u)) break;
        var m = Cc.findMove(S, Cc.sqFromName(u.slice(0, 2)), Cc.sqFromName(u.slice(2, 4)), u[4] || null);
        if (!m) break;
        var num = S.turn === 'w' ? (S.full + '. ') : (out.length === 0 ? S.full + '… ' : '');
        out.push(num + Cc.toSAN(S, m));
        S = Cc.makeMove(S, m);
      }
      return out.join(' ');
    }

    function paintEval() {
      if (closed()) return;
      ov.querySelector('#pab-fill').style.height = barPct(sc).toFixed(1) + '%';
      ov.querySelector('#pab-eval').textContent = evalText(sc);
      ov.querySelector('#pab-depth').textContent = depth ? 'depth ' + depth : '';
      var pvEl = ov.querySelector('#pab-pvtext');
      if (pvEl && engineOk()) pvEl.innerHTML = pvSan ? esc(pvSan) : 'Thinking…';
      draw();
    }

    // ── drawing + interaction ───────────────────────────────────────────────────
    function bestArrow() {
      if (!best || sel !== -1) return null;                  // yours takes priority while picking
      if (!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(best)) return null;
      return { from: Cc.sqFromName(best.slice(0, 2)), to: Cc.sqFromName(best.slice(2, 4)) };
    }
    // ⚠ kingSq takes the BOARD ARRAY, not the state (pjcc-chess.js:69). inCheck takes the state.
    function checkSquare(S) {
      try { return Cc.inCheck(S, S.turn) ? Cc.kingSq(S.b, S.turn) : -1; } catch (e) { return -1; }
    }
    function draw() {
      var n = nodes[at];
      paint(cv, n.S, { flip: flip, sel: sel, hints: hints,
                       last: n.from == null ? null : { from: n.from, to: n.to },
                       arrow: bestArrow(), checkSq: checkSquare(n.S) });
    }

    function status() {
      var S = nodes[at].S, el = ov.querySelector('#pab-status');
      var legal = Cc.legalMoves(S);
      if (!legal.length) {
        el.textContent = Cc.isCheckmate(S)
          ? 'Checkmate — ' + (S.turn === 'w' ? 'Black' : 'White') + ' wins.'
          : 'Stalemate — a draw.';
      } else if (Cc.inCheck(S, S.turn)) {
        el.textContent = (S.turn === 'w' ? 'White' : 'Black') + ' is in check.';
      } else {
        el.textContent = (S.turn === 'w' ? 'White' : 'Black') + ' to move.';
      }
    }

    function moveList() {
      var h = '';
      for (var k = 1; k < nodes.length; k += 2) {
        h += '<i>' + ((k - 1) / 2 + 1) + '.</i>' +
             '<span data-at="' + k + '"' + (at === k ? ' class="sel"' : '') + '>' + esc(nodes[k].san) + '</span>' +
             (nodes[k + 1]
               ? '<span data-at="' + (k + 1) + '"' + (at === k + 1 ? ' class="sel"' : '') + '>' + esc(nodes[k + 1].san) + '</span>'
               : '<span></span>');
      }
      var el = ov.querySelector('#pab-moves');
      el.innerHTML = h;
      var s = el.querySelector('.sel'); if (s) s.scrollIntoView({ block: 'nearest' });
    }

    function refresh() {
      sel = -1; hints = null;
      best = null; sc = null; depth = 0; pvSan = '';
      ov.querySelector('#pab-eval').textContent = engineOk() ? '…' : '—';
      ov.querySelector('#pab-depth').textContent = '';
      var pvEl = ov.querySelector('#pab-pvtext');
      if (pvEl && engineOk()) pvEl.textContent = 'Thinking…';
      draw(); status(); moveList();
      ov.querySelector('#pab-back').disabled = at === 0;
      ov.querySelector('#pab-fwd').disabled = at === nodes.length - 1;
      // A finished position has nothing to search — asking anyway spends a worker on a
      // question with no answer, and Stockfish's reply to a mated position is not a
      // number you'd want on the bar. Say what happened instead.
      var S = nodes[at].S;
      if (Cc.legalMoves(S).length) { search(Cc.toFEN(S)); return; }
      var mated = Cc.isCheckmate(S);
      sc = mated ? { type: 'mate', val: S.turn === 'w' ? -1 : 1 } : { type: 'cp', val: 0 };
      ov.querySelector('#pab-eval').textContent = mated ? '#' : '½';
      ov.querySelector('#pab-fill').style.height = (mated ? (S.turn === 'w' ? 0 : 100) : 50) + '%';
      if (pvEl) pvEl.textContent = mated ? 'Checkmate — nothing left to calculate.' : 'Stalemate — the game is drawn here.';
    }
    function go(i) {
      i = Math.max(0, Math.min(nodes.length - 1, i));
      if (i === at) return;
      at = i; refresh();
    }

    function play(from, to, promo) {
      var S = nodes[at].S;
      var m = Cc.findMove(S, from, to, promo || null);
      if (!m) return false;
      nodes = nodes.slice(0, at + 1);
      nodes.push({ S: Cc.makeMove(S, m), san: Cc.toSAN(S, m), from: m.from, to: m.to });
      at = nodes.length - 1;
      refresh();
      return true;
    }

    // Promotion: ask, right on the board, rather than silently queening — under-promotion
    // is exactly the kind of thing you open an analysis board to check.
    function askPromo(from, to, cb) {
      var white = nodes[at].S.turn === 'w';
      var box = document.createElement('div'); box.className = 'pab-promo';
      box.innerHTML = ['q', 'r', 'b', 'n'].map(function (p) {
        return '<button data-p="' + p + '" aria-label="' +
          { q: 'Queen', r: 'Rook', b: 'Bishop', n: 'Knight' }[p] + '" style="color:' +
          (white ? '#f4efe3' : '#c9b6ff') + '">' + GLYPH[p] + '</button>';
      }).join('');
      boardHost.appendChild(box);
      box.addEventListener('click', function (e) {
        var b = e.target.closest('[data-p]');
        try { box.remove(); } catch (err) {}
        cb(b ? b.getAttribute('data-p') : null);
      });
    }

    cv.addEventListener('click', function (e) {
      if (boardHost.querySelector('.pab-promo')) return;
      var r = cv.getBoundingClientRect();
      var i = idxAt(e.clientX - r.left, e.clientY - r.top, cv._px, flip);
      if (i < 0) return;
      var S = nodes[at].S, legal = Cc.legalMoves(S);
      var mine = S.b[i] && Cc.colorOf(S.b[i]) === S.turn;
      if (sel === -1 || mine) {
        if (!mine) { sel = -1; hints = null; return draw(); }
        sel = i;
        hints = legal.filter(function (m) { return m.from === i; }).map(function (m) { return m.to; });
        return draw();
      }
      var from = sel, cands = legal.filter(function (m) { return m.from === from && m.to === i; });
      sel = -1; hints = null;
      if (!cands.length) return draw();
      // A pawn arriving on the last rank generates four candidates, one per piece
      // (pjcc-chess.js addPawn) — that's the only case with more than one, and it is
      // exactly the case where silently queening would hide what you came here to check.
      if (cands.some(function (m) { return !!m.promo; })) {
        return askPromo(from, i, function (p) { if (p) play(from, i, p); else draw(); });
      }
      play(from, i);
    });

    ov.querySelector('#pab-back').onclick = function () { go(at - 1); };
    ov.querySelector('#pab-fwd').onclick = function () { go(at + 1); };
    ov.querySelector('#pab-flip').onclick = function () { flip = !flip; sel = -1; hints = null; draw(); };
    ov.querySelector('#pab-reset').onclick = function () {
      nodes = nodes.slice(0, 1); at = 0; refresh();
    };
    ov.querySelector('#pab-moves').addEventListener('click', function (e) {
      var t = e.target.closest('[data-at]'); if (t) go(+t.getAttribute('data-at'));
    });
    window.addEventListener('resize', function rz() {
      if (closed()) { window.removeEventListener('resize', rz); return; }
      var n = boardPx();
      if (n === cv._px) return;
      cv._px = n; cv.style.width = n + 'px'; cv.style.height = n + 'px'; draw();
    });

    refresh();
    return true;
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  root.PJCCAnalysis = { available: available, engineOk: engineOk, open: open };
})(typeof self !== 'undefined' ? self : this);
