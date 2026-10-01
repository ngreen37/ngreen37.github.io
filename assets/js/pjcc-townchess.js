/*! pjcc-townchess.js — the sea board's game, for Checker Town (2026-09-30).
 *
 *  Nate: "perhaps some pieces turn invisible for a few rounds, in the portal game by the sea.
 *  Put pieces there, and make that a thing." His picks: the site's engine plays, both sides
 *  vanish at random, a hidden piece that moves leaves footprints, a bot at your level.
 *
 *  ⚠⚠ GODOT HAS NO CHESS IN IT AND THIS IS WHY IT STILL DOESN'T. Godot draws the board and
 *  decides which pieces you can SEE; this file referees (pjcc-chess.js, perft-verified) and
 *  plays the other side (pjcc-gauntlet-engine.js: Stockfish proposes, the referee disposes).
 *  The invisibility is Godot's alone — the rules never know a piece is hidden.
 *  ⭐ THE OPPONENT IS THE ADAPTIVE DIAL (pjcc-adapt.js), seeded per device under `sea` in the
 *  same store Park Tables uses, and saved at game END only — an abandoned losing game must
 *  not re-seed it low forever. [[adaptive-opponent]]
 *
 *  window.PJCCTownChess — a synchronous door, because the town calls it from an iframe:
 *    state()          -> JSON string {b, turn, ply, last, result, why, thinking, lvl, took, check, gid}
 *    start()          -> a new game; you are White
 *    move(from, to)   -> 'ok' | 'illegal' | 'wait' | 'over' | 'none'   (a pawn on the last rank queens)
 */
(function (root) {
  'use strict';
  var KEY = 'pjcc.town.sea.v1', ADAPT_KEY = 'pjcc.adapt.v1', ID = 'sea', SEED = 1000;
  var W = { p: 1, n: 3, b: 3, r: 5, q: 9 };
  function C() { return root.PJCCChess; }
  function E() { return root.PJCCGauntletEngine; }

  var g = null;            // { moves, result, why, gid }
  var S = null, reps = {}, last = null, thinking = false, dial = null, seq = 0;

  function seed() {
    try {
      var v = (JSON.parse(localStorage.getItem(ADAPT_KEY)) || {})[ID];
      return (typeof v === 'number' && isFinite(v)) ? v : SEED;
    } catch (e) { return SEED; }
  }
  function saveSeed(elo) {
    if (typeof elo !== 'number' || !isFinite(elo)) return;
    try {
      var all = JSON.parse(localStorage.getItem(ADAPT_KEY)) || {};
      all[ID] = Math.round(elo);
      localStorage.setItem(ADAPT_KEY, JSON.stringify(all));
    } catch (e) {}
  }
  function makeDial() {
    dial = null;
    try { if (root.PJCCAdapt) dial = root.PJCCAdapt.create({ seed: seed() }); } catch (e) { dial = null; }
  }
  function level() { return dial ? dial.level() : seed(); }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(g)); } catch (e) {} }

  // the rook's hop when the king castles: king-to -> [rook-from, rook-to]
  var ROOK = { 62: [63, 61], 58: [56, 59], 6: [7, 5], 2: [0, 3] };

  function apply(m) {
    var from = m.from, to = m.to, cap = !!(S.b[to] || m.ep);
    S = C().makeMove(S, m);
    var k = C().posKey(S);
    reps[k] = (reps[k] || 0) + 1;
    last = { from: from, to: to, rook: m.castle ? ROOK[to] : null, ep: m.ep ? (to + (S.turn === 'b' ? 8 : -8)) : -1, cap: cap };
    g.moves = (g.moves + ' ' + C().nameFromSq(from) + C().nameFromSq(to) + (m.promo || '')).trim();
    var r = C().gameResult(S, reps[k]);
    if (r) {
      g.why = r;
      g.result = r === 'checkmate' ? (S.turn === 'w' ? '0-1' : '1-0') : '1/2-1/2';
      if (dial) { try { saveSeed(dial.settled ? dial.settled() : dial.level()); } catch (e) {} }
    }
    save();
  }

  function replay() {
    S = C().parseFEN(C().START_FEN);
    reps = {};
    reps[C().posKey(S)] = 1;
    last = null;
    var list = (g.moves || '').trim() ? g.moves.trim().split(/\s+/) : [];
    g.moves = '';
    var keepResult = g.result, keepWhy = g.why;
    for (var i = 0; i < list.length; i++) {
      var u = list[i];
      var m = C().findMove(S, C().sqFromName(u.slice(0, 2)), C().sqFromName(u.slice(2, 4)), u[4] || null);
      if (!m) break;
      apply(m);
    }
    g.result = keepResult || g.result;
    g.why = keepWhy || g.why;
  }

  function load() {
    if (g) return true;
    if (!C()) return false;
    try { g = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { g = null; }
    if (!g || typeof g.moves !== 'string') g = { moves: '', result: null, why: null, gid: Date.now() };
    makeDial();
    replay();
    /* ⚠ BOOT STOCKFISH ON THE FIRST LOOK, not the first reply: booting takes seconds, and the
       player is still walking to a piece. */
    if (E() && E().warmup) { try { E().warmup(); } catch (e) {} }
    if (!g.result && S.turn === 'b') think();   // walked out while it was thinking
    return true;
  }

  function dialOpts() {
    var eng = E(), elo = level();
    var persona = eng && eng.personaForElo ? eng.personaForElo(elo) : null;
    if (persona) { persona.timeMs = 600; return { persona: persona, negamax: true, movetime: 600 }; }
    return { skill: eng.skillForElo(elo), blunder: eng.blunderForElo(elo), movetime: 700 };
  }

  /* ⚠ NEVER FASTER THAN THIS. Under 1400 the dial plays the quick negamax, which answers in a
     few ms — your move and theirs then land in the same frame, and a reply you never saw arrive
     reads as a machine, not somebody across the board. Park Tables paces its bots the same way. */
  var MIN_MS = 650;

  function think() {
    if (!E() || g.result || S.turn !== 'b') return;
    thinking = true;
    var tok = ++seq, at = S, t0 = Date.now();
    E().move(S, dialOpts()).then(function (mv) {
      var land = function () {
        if (tok !== seq || at !== S) return;          // a new game started meanwhile
        thinking = false;
        if (dial && mv && typeof mv.evalCp === 'number') { try { dial.note(mv.evalCp); } catch (e) {} }
        if (!mv) return;                              // no legal move: gameResult already said so
        var m = C().findMove(S, mv.from, mv.to, mv.promo || null);   // the referee disposes
        if (m) apply(m);
      };
      var wait = MIN_MS - (Date.now() - t0);
      if (wait > 0) setTimeout(land, wait); else land();
    }, function () { thinking = false; });
  }

  function took() {
    var left = 0, i, c;
    for (i = 0; i < 64; i++) { c = S.b[i]; if (c && c === c.toLowerCase() && W[c]) left += W[c]; }
    return Math.max(0, 39 - left);
  }

  root.PJCCTownChess = {
    state: function () {
      if (!load()) return '';
      return JSON.stringify({
        b: S.b, turn: S.turn, ply: (g.moves || '').trim() ? g.moves.trim().split(/\s+/).length : 0,
        last: last, result: g.result || '', why: g.why || '', thinking: thinking,
        lvl: level(), took: took(), check: C().inCheck(S, S.turn), gid: String(g.gid || ''),
        fen: C().toFEN(S)
      });
    },
    start: function () {
      if (!C()) return 'none';
      seq++;
      thinking = false;
      g = { moves: '', result: null, why: null, gid: Date.now() };
      makeDial();
      replay();
      save();
      if (E() && E().warmup) { try { E().warmup(); } catch (e) {} }
      return 'ok';
    },
    move: function (from, to) {
      if (!load()) return 'none';
      if (g.result) return 'over';
      if (thinking || S.turn !== 'w') return 'wait';
      var m = C().findMove(S, +from, +to, null);
      if (!m) return 'illegal';
      apply(m);
      think();
      return 'ok';
    }
  };
})(typeof window !== 'undefined' ? window : this);
