/*! pjcc-towntable.js — the regular across the table, for Checker Town (2026-10-26).
 *
 *  His: "Start with number 10" — Route B, decided 2026-10-11: the board drawn in Godot, Stockfish beside it.
 *  ⚠⚠ THE GAME REFEREES NOW, AND THIS ONLY THINKS. The town keeps the board and the result with its own port of
 *  pjcc-chess.js (games/chess/chess_rules.gd, held to this referee position for position by the game's
 *  tests/chess.sh) and re-checks every move handed back here before it touches the board. This answers for the
 *  person across it the way the Park Tables do (botThink): their SYSTEM while the position is about development,
 *  then the engine at their rating (PJCCGauntletEngine: under 1400 the measured negamax, from 1400 Stockfish).
 *  ⚠ THE DIAL AND THE PACING ARE THE PARK TABLES' OWN (botDial, botThinkFor) and `test:town` holds the copy here to
 *  theirs. ⭐ AUSTON ADAPTS HERE AS SHE DOES THERE: one dial (pjcc-adapt.js), seeded from the same per-device store,
 *  saved at the game's END only. ⚠ Vince's "not your line today" is not here: his file on you is the Park Tables'.
 *
 *  window.PJCCTownTable — a synchronous door, because the town calls it from an iframe:
 *    begin(key)    -> 'ok' | 'none'   a new game against that seat; Stockfish boots in the background
 *    think(json)   -> ticket | ''     json {key, fen0, moves, clock: {left, inc} | null, study}; their side to move
 *    take(ticket)  -> '' until they have moved, then JSON {uci, cp?, sys}
 *    finish(json)  -> 'ok'            json {key, side, result, moves, clean, study}: the site's own records
 */
(function (root) {
  'use strict';
  function C() { return root.PJCCChess; }
  function E() { return root.PJCCGauntletEngine; }
  function SYS() { return root.PJCCSystems; }
  var ADAPT_KEY = 'pjcc.adapt.v1';
  var BEAT_KEY = 'pjcc.pt.beaten.v1', STAR_KEY = 'pjcc.pt.stars.v1', GAMES_KEY = 'pjcc.pt.games.v1';
  var STAR_RANK = { quarter: 1, half: 2, full: 3 };
  var CP_LOSING = -200;      // ⚠ THE PARK TABLES' botThinkFor: two pawns down, from the regular's own side
  var CP_SWING = -150;       // ⚠ …and the position turned this much against it since its last move

  var seats = null, dial = null, dialKey = '', seq = 0, ready = {}, cps = [];

  function seat(key) {
    if (!seats) {
      seats = {};
      try {
        var rows = JSON.parse(document.getElementById('ct-facts-data').textContent) || [];
        for (var i = 0; i < rows.length; i++) seats[rows[i].key] = rows[i];
      } catch (e) { seats = {}; }
    }
    return seats[key] || null;
  }
  function read(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
  function write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  function adaptSeed(key, elo) {
    var v = (read(ADAPT_KEY, {}) || {})[key];
    return (typeof v === 'number' && isFinite(v)) ? v : elo;
  }
  function eloOf(s) { return s.adaptive ? ((dial && dial.level()) || s.elo) : s.elo; }

  /* The Park Tables' botThinkFor, word for word in what it decides: pacing under no clock, a thirtieth of what is
     left under one, and longer (2.5x, up to an eighth) when the position deserves it. */
  function thinkFor(s, S, clock) {
    var base = s.movetime || 400;
    if (!clock) return base;
    var left = +clock.left || 0, deep = false;
    try {
      var n = C().legalMoves(S).length;
      var cp = cps.length ? cps[cps.length - 1] : null, was = cps.length > 1 ? cps[cps.length - 2] : null;
      deep = C().inCheck(S, S.turn) || (n >= 2 && n <= 4) || (cp !== null && cp <= CP_LOSING) ||
             (cp !== null && was !== null && (cp - was) <= CP_SWING);
    } catch (e) { deep = false; }
    var want = deep ? Math.min(base * 2.5, left / 8) : Math.min(base, left / 30);
    return Math.max(150, Math.floor(Math.min(want, left - 800)));
  }
  /* The Park Tables' botDial: the rating is the only dial, and it resolves to the negamax under 1400. */
  function dialFor(s, S, clock) {
    var eng = E(), elo = eloOf(s), ms = thinkFor(s, S, clock);
    var persona = eng.personaForElo ? eng.personaForElo(elo) : null;
    if (persona) { persona.timeMs = ms; return { persona: persona, negamax: true, movetime: ms }; }
    return { skill: eng.skillForElo(elo), blunder: eng.blunderForElo(elo), movetime: ms };
  }

  function replay(fen0, moves) {
    var S = C().parseFEN(fen0 || C().START_FEN), list = (moves || '').trim() ? moves.trim().split(/\s+/) : [];
    for (var i = 0; i < list.length; i++) {
      var u = list[i], m = C().findMove(S, C().sqFromName(u.slice(0, 2)), C().sqFromName(u.slice(2, 4)), u[4] || null);
      if (!m) return null;
      S = C().makeMove(S, m);
    }
    return { S: S, list: list };
  }

  function uci(m) { return C().nameFromSq(m.from) + C().nameFromSq(m.to) + (m.promo ? m.promo.toLowerCase() : ''); }

  function begin(key) {
    if (!C() || !E()) return 'none';
    seq++; ready = {}; cps = [];
    var s = seat(key);
    dial = null; dialKey = key;
    if (s && s.adaptive && root.PJCCAdapt) {
      try { dial = root.PJCCAdapt.create({ seed: adaptSeed(key, s.elo) }); } catch (e) { dial = null; }
    }
    try { E().newGame(); E().warmup(); } catch (e) {}
    return 'ok';
  }

  function think(json) {
    var q;
    try { q = JSON.parse(json); } catch (e) { return ''; }
    var s = seat(q.key);
    if (!s || !C() || !E()) return '';
    var g = replay(q.fen0, q.moves);
    if (!g) return '';
    var S = g.S, tok = String(++seq), t0 = Date.now();
    /* ⭐ HIS SYSTEM FIRST, and fast but not instant — a third of his own pace, as at the Park Tables. */
    if (!q.study && SYS()) {
      try {
        var id = S.turn === 'w' ? s.sys_w : s.sys_b;
        var sm = id ? SYS().next(id, S, g.list) : null;
        var mv = sm ? C().findMove(S, sm.from, sm.to, sm.promo || null) : null;
        if (mv) {
          setTimeout(function () { ready[tok] = { uci: uci(mv), sys: true }; },
                     Math.max(120, Math.round((s.movetime || 300) * 0.35)));
          return tok;
        }
      } catch (e) {}
    }
    E().move(S, dialFor(s, S, q.clock || null)).then(function (mv) {
      if (mv && typeof mv.evalCp === 'number') {
        cps.push(mv.evalCp);
        if (dial && dialKey === q.key) { try { dial.note(mv.evalCp); } catch (e) {} }
      }
      /* ⚠ NEVER FASTER THAN HIS OWN PACE: under 1400 the negamax answers in a few ms, and a reply that lands in the
         frame your move did reads as a machine, not somebody across the board. */
      var wait = Math.min(s.movetime || 300, 650) - (Date.now() - t0);
      var land = function () { ready[tok] = mv ? { uci: uci(mv), cp: mv.evalCp, sys: false } : { uci: '', sys: false }; };
      if (wait > 0) setTimeout(land, wait); else land();
    }, function () { ready[tok] = { uci: '', sys: false }; });
    return tok;
  }

  function take(tok) {
    var r = ready[tok];
    if (!r) return '';
    delete ready[tok];
    return JSON.stringify(r);
  }

  /* ⚠ THE SAME RECORDS A GAME AT THE PARK TABLES LEAVES (botFinishAs): the beaten list, the star for that color at
     the tier earned (no takeback = full; Godot has no analysis board), the account copy, the day's win, the game
     banked for the replay door, and Auston's seed. ⚠ A STUDY AWARDS NONE OF THEM: you solved a position, you did
     not beat the person. ⚠ NOT `pjcc.pt.last.v1`: the town settled this game itself and must not settle it twice. */
  function finish(json) {
    var q;
    try { q = JSON.parse(json); } catch (e) { return 'none'; }
    if (!q || !q.key) return 'none';
    var s = seat(q.key) || {};
    if (dial && dialKey === q.key && !q.study) {
      try {
        var all = read(ADAPT_KEY, {}) || {};
        all[q.key] = Math.round(dial.settled ? dial.settled() : dial.level());
        write(ADAPT_KEY, all);
      } catch (e) {}
    }
    var won = q.result === (q.side === 'w' ? '1-0' : '0-1');
    if (won && !q.study) {
      try { localStorage.setItem('pjcc.pt.winday', new Date().toDateString()); } catch (e) {}
      var beaten = read(BEAT_KEY, []);
      if (!Array.isArray(beaten)) beaten = [];
      if (beaten.indexOf(q.key) < 0) { beaten.push(q.key); write(BEAT_KEY, beaten); }
      var tier = q.clean ? 'full' : 'quarter', stars = read(STAR_KEY, {}) || {};
      var rec = stars[q.key] || (stars[q.key] = {});
      if (!(rec[q.side] && STAR_RANK[rec[q.side]] >= STAR_RANK[tier])) { rec[q.side] = tier; write(STAR_KEY, stars); }
      try {
        if (root.PJCC && root.PJCC.saveScore) {
          var clean = 0;
          for (var k in stars) if (stars[k] && (stars[k].w === 'full' || stars[k].b === 'full')) clean++;
          root.PJCC.saveScore('park-bot', clean, { data: { stars: stars, beaten: beaten } });
        }
      } catch (e) {}
      if (q.clean && (q.moves || '').trim()) {
        var games = read(GAMES_KEY, {}) || {};
        games[q.key] = { moves: q.moves.trim(), result: q.result, pc: q.side, at: Date.now() };
        write(GAMES_KEY, games);
      }
    }
    if (dialKey === q.key) { dial = null; dialKey = ''; }
    return 'ok';
  }

  root.PJCCTownTable = { begin: begin, think: think, take: take, finish: finish,
    /* exposed for the gate */ _thinkFor: thinkFor, _dialFor: dialFor };
})(typeof window !== 'undefined' ? window : this);
