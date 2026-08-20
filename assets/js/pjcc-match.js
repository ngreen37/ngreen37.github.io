/*! pjcc-match.js — The Park Tables client (correspondence chess over Supabase).
 *
 *  One system covers both "live" and "async": moves live in the matches row, the page
 *  polls while open (~4s on your opponent's turn), so two people online feels live and
 *  a move a day works exactly the same way. No websockets, no new infrastructure —
 *  Realtime channels are the v2 upgrade, parked in FUTURE-IDEAS.
 *
 *  Trust model (also in docs/park-tables-setup.md): the SERVER enforces seat + turn +
 *  claim + the RATING MATH via SECURITY DEFINER functions; chess LEGALITY is enforced
 *  by the perft-verified PJCCChess engine in every client — replayGame() re-validates
 *  the whole move list from the start position on every load, so a hand-crafted illegal
 *  move can't poison an opponent's board; the game just reads as corrupt and freezes.
 *
 *  v2 (2026-07-14, the chess.com model): PJCC Rating — everyone starts 250, rated games
 *  move both players by Elo (K=32, server-side only); Casual = the no-rating option.
 *  Per-move clocks (none / 1h / 1d / 3d); a flag falls only when the opponent claims it.
 *  Multiple daily games at once (server caps live tables at 6 per player).
 *
 *  Depends on: pjcc-chess.js (PJCCChess), pjcc-profile.js (PJCC.db / PJCC.ready).
 */
(function () {
  'use strict';
  var C = window.PJCCChess;

  /* The four phrases — the ENTIRE chat. Preset lines only, no typed text anywhere,
     which is the whole child-safety story. Indexes are what's stored server-side. */
  var EMOTES = [
    'Good luck!',   // 0
    'Nice move.',   // 1
    'Good game.',   // 2
    '🐶'            // 3
  ];

  /* Per-move time controls (v2 "basic ones"). secs=null is the casual pace — no clock.
     Values must be a SUBSET of the allow-list in create_match (park-tables-setup.md).

     ⚑ THE 1-HOUR RUNG CAME OFF 2026-08-20 (Nate: “I forget where we came up with 1 hour a
     move, and I don't see it anywhere, but get rid of that”). It was the fastest thing the
     LIVE tables could offer and it was never fast — these are per-move correspondence clocks,
     so an hour a move is a leisurely game wearing a hurried label, and the board polls every
     ~4s anyway. What is left says what this room actually is: a day or three days a move, or
     no clock at all. Real Bullet/Blitz/Rapid live on the BOT boards, where the clock is local
     arithmetic; bringing them here needs SQL time banks + auto-flag + Realtime replacing the
     poll, written up in FUTURE-IDEAS under “⏱ REAL BLITZ”. [[park-tables-bot-clock]]
     ⚠ THE SERVER STILL ACCEPTS 3600 and nothing was migrated — this is the OFFER, not the
     allow-list, so any table already sitting on an hour keeps working and keeps its label
     from the fallback in controlLabel below. */
  var CONTROLS = [
    { secs: null,   label: 'No clock' },
    { secs: 86400,  label: '1 day / move' },
    { secs: 259200, label: '3 days / move' }
  ];

  function db() { return window.PJCC && PJCC.db ? PJCC.db() : null; }

  /* Replay a UCI move list from the start, validating every move with the real engine.
     Returns { S, sans, valid, result } — result is set when the position is terminal.
     PURE (no DOM, no network) so it's testable in Node. */
  function replayGame(movesStr) {
    var S = C.parseFEN(C.START_FEN), sans = [], reps = {};
    reps[C.posKey(S)] = 1;
    var list = (movesStr || '').trim() ? movesStr.trim().split(/\s+/) : [];
    for (var i = 0; i < list.length; i++) {
      var u = list[i];
      if (!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(u)) return { S: S, sans: sans, valid: false };
      var m = C.findMove(S, C.sqFromName(u.slice(0, 2)), C.sqFromName(u.slice(2, 4)), u[4] || null);
      if (!m) return { S: S, sans: sans, valid: false };
      sans.push(C.toSAN(S, m));
      S = C.makeMove(S, m);
      var k = C.posKey(S); reps[k] = (reps[k] || 0) + 1;
    }
    // result: 'checkmate' | 'stalemate' | 'material' | 'fifty' | 'threefold' | null.
    // On checkmate the LOSER is S.turn (the side to move is the side with no moves).
    return { S: S, sans: sans, valid: true, result: C.gameResult(S, reps[C.posKey(S)]) };
  }

  function rpc(name, args) {
    var d = db();
    if (!d) return Promise.reject(new Error('offline'));
    return d.rpc(name, args).then(function (r) {
      if (r.error) throw new Error(r.error.message || 'failed');
      return r.data;
    });
  }

  window.PJCCMatch = {
    EMOTES: EMOTES,
    CONTROLS: CONTROLS,
    replayGame: replayGame,
    ready: function () { return !!db(); },

    controlLabel: function (secs) {
      for (var i = 0; i < CONTROLS.length; i++) if (CONTROLS[i].secs === (secs || null)) return CONTROLS[i].label;
      return secs ? (Math.round(secs / 3600) + 'h / move') : 'No clock';
    },

    /* v2 create carries rated + control; if the server is still on the v1 SQL
       (upgrade not run yet) the 3-arg call 404s — fall back to the v1 signature so
       the live tables never break while the SQL and the JS deploy out of step. */
    create: function (vsCreator, rated, controlSecs) {
      return rpc('create_match', { p_vs_creator: !!vsCreator, p_rated: rated !== false, p_control_secs: controlSecs || null })
        .catch(function (e) {
          if (/function|schema|parameter/i.test(e.message || '')) return rpc('create_match', { p_vs_creator: !!vsCreator });
          throw e;
        });
    },
    claim:  function (id) { return rpc('claim_match', { p_id: id }); },
    move:   function (id, uci, fen) { return rpc('play_move', { p_id: id, p_uci: uci, p_fen: fen }); },
    finish: function (id, result, reason) { return rpc('finish_match', { p_id: id, p_result: result, p_reason: reason }); },
    claimTimeout: function (id) { return rpc('claim_timeout', { p_id: id }); },
    emote:  function (id, code) { return rpc('send_emote', { p_id: id, p_code: code }); },

    /* My PJCC Rating (250 until the first rated game settles). Tolerates the column
       not existing yet (pre-upgrade server) → null, and callers hide the chip. */
    myRating: function (uid) {
      var d = db(); if (!d || !uid) return Promise.resolve(null);
      return d.from('profiles').select('pjcc_rating,rated_games').eq('id', uid).maybeSingle()
        .then(function (r) { return (r.data && r.data.pjcc_rating != null) ? { rating: r.data.pjcc_rating, games: r.data.rated_games || 0 } : null; })
        .catch(function () { return null; });
    },

    /* Top of the PJCC Rating ladder (only operatives who finished a rated game). */
    ratingBoard: function (limit) {
      var d = db(); if (!d) return Promise.resolve([]);
      return d.from('profiles').select('codename,companion,pjcc_rating,rated_games')
        .gt('rated_games', 0)
        .order('pjcc_rating', { ascending: false }).order('codename', { ascending: true })
        .limit(limit || 25)
        .then(function (r) { return r.data || []; })
        .catch(function () { return []; });
    },

    /* Who the Creator is (null until step 2 of the setup). */
    creatorId: function () {
      var d = db(); if (!d) return Promise.resolve(null);
      return d.from('match_config').select('creator_id').maybeSingle()
        .then(function (r) { return (r.data && r.data.creator_id) || null; })
        .catch(function () { return null; });
    },

    /* Lobby queries. Every one tolerates the table not existing yet (setup not run):
       callers get { missing:true } and the page says the tables are being set up.
       select('*') on purpose — v1 and v2 rows both come back whole. */
    openTables: function () {
      var d = db();
      return d.from('matches').select('*')
        .eq('status', 'open').order('created_at', { ascending: true }).limit(30)
        .then(function (r) { if (r.error) return { missing: true }; return { rows: r.data || [] }; });
    },
    myTables: function (uid) {
      var d = db();
      return d.from('matches').select('*')
        .or('white.eq.' + uid + ',black.eq.' + uid)
        .neq('status', 'done').order('updated_at', { ascending: false }).limit(30)
        .then(function (r) { if (r.error) return { missing: true }; return { rows: r.data || [] }; });
    },
    myFinished: function (uid) {
      var d = db();
      return d.from('matches').select('*')
        .or('white.eq.' + uid + ',black.eq.' + uid)
        .eq('status', 'done').order('updated_at', { ascending: false }).limit(10)
        .then(function (r) { return { rows: (r.data || []) }; });
    },
    get: function (id) {
      var d = db();
      return d.from('matches').select('*').eq('id', id).maybeSingle()
        .then(function (r) { return r.data || null; });
    }
  };
})();
