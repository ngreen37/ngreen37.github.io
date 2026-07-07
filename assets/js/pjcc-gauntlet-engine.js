/*! pjcc-gauntlet-engine.js — the opponent brain for The Gauntlet.
 *
 *  A thin, FOOL-PROOF bridge to a vendored, single-threaded Stockfish (WASM) that
 *  is throttled per rung. The guiding rule: **Stockfish proposes, the referee
 *  disposes.** Every move Stockfish returns is re-validated against the
 *  perft-verified pjcc-chess.js move generator before it can touch the board, so
 *  an illegal or garbled engine move can NEVER reach the game — it falls back
 *  instead. Nothing here throws and nothing here hangs:
 *
 *    - engine can't load (no WASM / no Worker / fetch fails)  -> negamax fallback
 *    - engine returns an illegal or unparseable move          -> negamax fallback
 *    - engine takes too long (watchdog)                       -> negamax fallback
 *    - no legal moves at all                                  -> resolves null
 *
 *  The fallback is the existing PJCCChessAI (also referee-backed), so the game is
 *  fully playable even with Stockfish completely absent. `move()` ALWAYS resolves
 *  (never rejects) with a referee-legal move object, or null when the side to move
 *  is stuck (mate/stalemate) — exactly what the game already handles.
 *
 *  API (window.PJCCGauntletEngine):
 *    available()            -> boolean   (WASM + Worker present in this browser)
 *    warmup()               -> void      (boot the engine in the background)
 *    newGame()              -> void      (tell a ready engine a fresh game starts)
 *    move(S, opts)          -> Promise<move|null>
 *        opts: { skill:0..20, movetime:ms, blunder:0..1, persona:{...} }
 *        skill/movetime/blunder default sensibly from persona if omitted.
 */
(function (root) {
  'use strict';

  // Same-origin worker; the #hash tells Stockfish where its .wasm lives.
  var BASE = '/assets/vendor/stockfish/';
  var WORKER_URL = BASE + 'stockfish.js#' + BASE + 'stockfish.wasm';
  var BOOT_TIMEOUT = 9000;   // ms to reach "readyok" before we give up on the engine
  var WATCHDOG_EXTRA = 3500; // ms of slack over the move-time budget before we bail a search

  function C()  { return root.PJCCChess; }     // referee (required)
  function AI() { return root.PJCCChessAI; }    // negamax fallback (optional)

  function hasEngine() {
    return typeof root.Worker !== 'undefined' &&
           typeof root.WebAssembly !== 'undefined' && !!C();
  }

  // ---- referee-backed helpers: everything below returns only *legal* moves ----
  function legal(S) { try { return C().legalMoves(S); } catch (e) { return []; } }
  function randomLegal(S) { var m = legal(S); return m.length ? m[(Math.random() * m.length) | 0] : null; }
  function fallbackMove(S, opts) {
    // Prefer the tuned negamax; if it's missing or throws, any legal move beats a crash.
    try { if (AI()) { var m = AI().bestMove(S, opts && opts.persona); if (m) return m; } } catch (e) {}
    return randomLegal(S);
  }
  // Stockfish speaks long algebraic ("e2e4", "e7e8q"); the referee turns that into a
  // legal move object, or null if it isn't one — which is our illegal-move tripwire.
  function uciToMove(S, uci) {
    if (!uci || uci.length < 4 || uci === '(none)') return null;
    try {
      var from = C().sqFromName(uci.slice(0, 2));
      var to   = C().sqFromName(uci.slice(2, 4));
      var promo = uci.length >= 5 ? uci.charAt(4) : null;
      return C().findMove(S, from, to, promo) || null;
    } catch (e) { return null; }
  }
  function clampSkill(n) { n = Math.round(+n); if (!isFinite(n)) n = 10; return Math.max(0, Math.min(20, n)); }

  // ---- engine lifecycle ----
  var worker = null;
  var state = 'idle';            // idle | booting | ready | dead
  var bootTimer = null;
  var readyWaiters = [];
  var pending = null;            // the one in-flight search
  var searchSeq = 0;
  var lastSkill = null;

  function post(cmd) { try { if (worker) worker.postMessage(cmd); } catch (e) {} }

  function flushReady(ok) { var w = readyWaiters; readyWaiters = []; for (var i = 0; i < w.length; i++) { try { w[i](ok); } catch (e) {} } }

  function die() {
    if (state === 'dead') return;
    state = 'dead';
    if (bootTimer) { clearTimeout(bootTimer); bootTimer = null; }
    try { if (worker) worker.terminate(); } catch (e) {}
    worker = null;
    flushReady(false);
    finishSearch(null);   // resolve any in-flight search via fallback
  }

  function onMessage(e) {
    var line = (typeof e.data === 'string') ? e.data
             : (e.data && typeof e.data.data === 'string') ? e.data.data : '';
    if (!line) return;
    if (state === 'booting') {
      if (line.indexOf('uciok') === 0) { post('isready'); return; }
      if (line.indexOf('readyok') === 0) {
        state = 'ready';
        if (bootTimer) { clearTimeout(bootTimer); bootTimer = null; }
        flushReady(true);
        return;
      }
    }
    if (pending && line.indexOf('bestmove') === 0) {
      finishSearch((line.split(/\s+/)[1]) || null);
    }
  }

  function boot() {
    if (state !== 'idle') return;
    if (!hasEngine()) { state = 'dead'; return; }
    state = 'booting';
    try {
      worker = new root.Worker(WORKER_URL);
      worker.onmessage = onMessage;
      worker.onerror = function () { die(); };
      post('uci');
      bootTimer = setTimeout(function () { if (state !== 'ready') die(); }, BOOT_TIMEOUT);
    } catch (e) { die(); }
  }

  function ensureReady() {
    return new Promise(function (resolve) {
      if (state === 'ready') return resolve(true);
      if (state === 'dead') return resolve(false);
      readyWaiters.push(resolve);
      if (state === 'idle') boot();
    });
  }

  // ---- a single search, resolved exactly once ----
  function finishSearch(uci) {
    var p = pending;
    if (!p || p.done) return;
    p.done = true;
    pending = null;
    if (p.timer) clearTimeout(p.timer);
    if (p.grace) clearTimeout(p.grace);
    var mv = uci ? uciToMove(p.S, uci) : null;   // engine move, referee-checked
    if (!mv) mv = fallbackMove(p.S, p.opts);      // illegal/none/timeout -> safe fallback
    p.resolve(mv);
  }

  function doSearch(S, opts) {
    return new Promise(function (resolve) {
      if (state !== 'ready' || !worker) { resolve(fallbackMove(S, opts)); return; }
      var skill = clampSkill(opts.skill != null ? opts.skill
                 : (opts.persona ? (opts.persona.depth - 1) * 5 : 10));
      var movetime = Math.max(80, opts.movetime != null ? opts.movetime
                    : (opts.persona && opts.persona.timeMs) || 500);
      var fen;
      try { fen = C().toFEN(S); } catch (e) { resolve(fallbackMove(S, opts)); return; }

      pending = { token: ++searchSeq, S: S, opts: opts, resolve: resolve, done: false, timer: null, grace: null };
      // Watchdog: if the engine ever overruns its budget, stop it and fall back — no hangs.
      pending.timer = setTimeout(function () {
        post('stop');
        if (pending) pending.grace = setTimeout(function () { finishSearch(null); }, 300);
      }, movetime + WATCHDOG_EXTRA);

      if (skill !== lastSkill) { post('setoption name Skill Level value ' + skill); lastSkill = skill; }
      post('position fen ' + fen);
      post('go movetime ' + movetime);
    });
  }

  // ---- public: one search at a time, never rejects ----
  var chain = Promise.resolve();

  function move(S, opts) {
    opts = opts || {};
    var lm = legal(S);
    if (!lm.length) return Promise.resolve(null);          // mate / stalemate
    if (lm.length === 1) return Promise.resolve(lm[0]);    // forced — no need to think
    var blunder = opts.blunder != null ? opts.blunder
                : (opts.persona && opts.persona.blunder) || 0;
    if (blunder && Math.random() < blunder) {              // keep the low rungs beatable
      return Promise.resolve(lm[(Math.random() * lm.length) | 0]);
    }
    var run = chain.then(function () {
      return ensureReady().then(function (ok) {
        return ok ? doSearch(S, opts) : fallbackMove(S, opts);
      });
    }).catch(function () { return fallbackMove(S, opts); });
    chain = run.then(function () {}, function () {});       // keep the chain alive regardless
    return run;
  }

  function warmup() { if (state === 'idle' && hasEngine()) boot(); }
  function newGame() { if (state === 'ready') { post('ucinewgame'); post('isready'); lastSkill = null; } }

  root.PJCCGauntletEngine = {
    available: hasEngine,
    warmup: warmup,
    newGame: newGame,
    move: move,
    // exposed for tests / debugging
    _state: function () { return state; },
    _uciToMove: uciToMove
  };
})(typeof self !== 'undefined' ? self : this);
