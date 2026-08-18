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
 *
 *  ══ THE MOVE CARRIES THE ENGINE'S OPINION (2026-08-17) ═══════════════════════════
 *  A resolved move may also carry `evalCp` — the search's own score for the position
 *  it just thought about, in centipawns, from the SIDE TO MOVE's point of view (mate
 *  folded to ±1500). It is FREE: the engine prints it on every `info` line of a search
 *  it was going to run anyway, and this bridge was throwing those lines away.
 *
 *  That is what makes an adaptive opponent possible without a second engine — the bot's
 *  own read on the position is a per-move measure of how the game is going, at no cost
 *  in time or memory. `pjcc-adapt.js` consumes it.
 *
 *  ⚠ IT IS OPTIONAL AND MUST STAY OPTIONAL. A fallback move has no score, a search that
 *  was stopped early may have no score, and an older vendored engine might not print one.
 *  `evalCp` is then simply ABSENT — never 0, because "the position is equal" and "we did
 *  not measure" are different facts and a consumer must be able to tell them apart.
 */
(function (root) {
  'use strict';

  // Same-origin worker; the #hash tells Stockfish where its .wasm lives.
  var BASE = '/assets/vendor/stockfish/';
  var WORKER_URL = BASE + 'stockfish.js#' + BASE + 'stockfish.wasm';
  var BOOT_TIMEOUT = 9000;   // ms to reach "readyok" before we give up on the engine
  var WATCHDOG_EXTRA = 3500; // ms of slack over the move-time budget before we bail a search
  /* Mate is folded to this magnitude, and every cp score is clamped to it — the SAME
     cap the Game Review applies, so the two files cannot disagree about how big a
     winning position is allowed to look. [[review-accuracy-calibration]] */
  var SCORE_CAP = 1500;

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
    /* The search's own evaluation, kept as it streams. ⚠ THE LAST ONE WINS, and it is
       the deepest — Stockfish prints an `info` line per iteration, so the final score
       before `bestmove` is the one that produced the move. Same parse the analysis
       board uses; kept here rather than shared because this bridge must not grow a
       dependency on an overlay module that most rooms never load. */
    if (pending && line.indexOf('info') === 0 && line.indexOf(' score ') > -1) {
      var sc = line.match(/score (cp|mate) (-?\d+)/);
      if (sc) {
        pending.score = sc[1] === 'mate'
          ? (parseInt(sc[2], 10) > 0 ? SCORE_CAP : -SCORE_CAP)   // mate folded, sign kept
          : Math.max(-SCORE_CAP, Math.min(SCORE_CAP, parseInt(sc[2], 10)));
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
    /* ⚠ THE SCORE RIDES ONLY ON A REAL ENGINE MOVE. If the referee rejected the engine's
       move, or there was no move at all, we fall back — and the score we collected
       describes a search whose conclusion we just threw away. Attaching it to a
       negamax fallback would label a guess with the engine's authority. */
    if (mv && p.score !== null && p.score !== undefined) mv.evalCp = p.score;
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

      pending = { token: ++searchSeq, S: S, opts: opts, resolve: resolve, done: false,
                  timer: null, grace: null, score: null };
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

  /* ══ ONE CALIBRATION, FOR EVERY ROOM THAT SEATS AN OPPONENT (2026-08-05) ═════════════
     Nate: *"And what ratings are the bots? Not saying it's inaccurate but I kinda got smoked
     by the Medium bot."*

     ⭐ HE HAD ALREADY CAUGHT THIS EXACT BUG ONCE, IN THE OTHER ROOM. 2026-07-15: "the Shogi
     Sentinel seems stronger than 800" — it was skill 5, which plays about 1600. The Gauntlet
     was fixed by driving skill from the ADVERTISED rating instead of from a hand-picked
     number. The Park Tables bots were written the NEXT DAY with hand-picked numbers and never
     went on that curve, so "Medium" (skill 6) was ~1575 — stronger than the Gauntlet's eighth
     floor. He did not play badly. The label was wrong.

     So the curve moves HERE, into the file both rooms already load, and neither room owns a
     copy of it. Same lesson as the Gauntlet door: the fix for "these two things keep drifting"
     is one definition, not more diligence.

     ⚠ SKILL 0 IS ALREADY ~1350 — there is no dial below it. Anything advertised under 1400
     gets its weakness from the BLUNDER rate (a share of moves played at random) and short
     think time, which is why the two functions are a pair and neither is meaningful alone.

     The blunder table IS the Gauntlet ladder's own hand-authored persona values, read off the
     ten public floors; `blunderForElo` interpolates between them. tests/ladders.check.js
     asserts it reproduces all ten, so this is genuinely the same curve rather than a second
     opinion about the same question. */
  function skillForElo(elo) {
    elo = +elo || 0;
    if (elo < 1400) return 0;
    return Math.min(20, Math.round(3 + (elo - 1400) * 0.017));   // 1400→3 … 2400→20
  }
  var BLUNDER_LADDER = [                     // [advertised rating, share of random moves]
    [350, 0.36], [500, 0.28], [650, 0.20], [800, 0.16], [950, 0.10],
    [1100, 0.03], [1250, 0.02], [1400, 0.01], [1600, 0.00], [1800, 0.005]
  ];
  function blunderForElo(elo) {
    elo = +elo || 0;
    var L = BLUNDER_LADDER;
    if (elo <= L[0][0]) return L[0][1];
    for (var i = 1; i < L.length; i++) {
      if (elo <= L[i][0]) {
        var a = L[i - 1], b = L[i], t = (elo - a[0]) / (b[0] - a[0]);
        return Math.round((a[1] + (b[1] - a[1]) * t) * 1000) / 1000;
      }
    }
    return 0;                                 // above the public ladder: no charity
  }

  root.PJCCGauntletEngine = {
    available: hasEngine,
    warmup: warmup,
    newGame: newGame,
    move: move,
    skillForElo: skillForElo,
    blunderForElo: blunderForElo,
    // exposed for tests / debugging
    _state: function () { return state; },
    _uciToMove: uciToMove
  };
})(typeof self !== 'undefined' ? self : this);
