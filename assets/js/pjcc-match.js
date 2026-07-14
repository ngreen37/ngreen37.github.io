/*! pjcc-match.js — The Park Tables client (correspondence chess over Supabase).
 *
 *  One system covers both "live" and "async": moves live in the matches row, the page
 *  polls while open (~4s on your opponent's turn), so two people online feels live and
 *  a move a day works exactly the same way. No websockets, no new infrastructure —
 *  Realtime channels are the v2 upgrade, parked in FUTURE-IDEAS.
 *
 *  Trust model (also in docs/park-tables-setup.md): the SERVER enforces seat + turn +
 *  claim via SECURITY DEFINER functions; chess LEGALITY is enforced by the perft-verified
 *  PJCCChess engine in every client — replayGame() re-validates the whole move list from
 *  the start position on every load, so a hand-crafted illegal move can't poison an
 *  opponent's board; the game just reads as corrupt and freezes.
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
    replayGame: replayGame,
    ready: function () { return !!db(); },

    create: function (vsCreator) { return rpc('create_match', { p_vs_creator: !!vsCreator }); },
    claim:  function (id) { return rpc('claim_match', { p_id: id }); },
    move:   function (id, uci, fen) { return rpc('play_move', { p_id: id, p_uci: uci, p_fen: fen }); },
    finish: function (id, result, reason) { return rpc('finish_match', { p_id: id, p_result: result, p_reason: reason }); },
    emote:  function (id, code) { return rpc('send_emote', { p_id: id, p_code: code }); },

    /* Who the Creator is (null until Nate runs step 2 of the setup). */
    creatorId: function () {
      var d = db(); if (!d) return Promise.resolve(null);
      return d.from('match_config').select('creator_id').maybeSingle()
        .then(function (r) { return (r.data && r.data.creator_id) || null; })
        .catch(function () { return null; });
    },

    /* Lobby queries. Every one tolerates the table not existing yet (setup not run):
       callers get { missing:true } and the page says the tables are being set up. */
    openTables: function () {
      var d = db();
      return d.from('matches').select('id,created_at,white,white_name,vs_creator')
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
      return d.from('matches').select('id,white_name,black_name,result,win_reason,updated_at,white,black')
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
