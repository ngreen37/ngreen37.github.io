/*! pjcc-pgn.js — a UCI move list, as a PGN.
 *
 *  Every room already holds the game: the Gauntlet keeps G.uci, the Park Tables keep
 *  st.moves / rec.moves, and a correspondence row keeps m.moves. All four are UCI. The
 *  only thing missing was the text a human (or `npm run gen:godotgame`) can read.
 *
 *  ⭐ NO CHESS LIVES HERE. Names come from the perft-verified pjcc-chess.js via toSAN(),
 *  the same engine the review and the converter already trust. A second SAN writer would
 *  be a second set of bugs, and disambiguation is exactly where they hide.
 *
 *  API (window.PJCCPgn):
 *    toPGN(movesUci, meta) -> string | null   null = nothing to write, or a move that
 *                                             will not replay (never a half-written game)
 *      meta: { whiteName, blackName, result, date, event, fen, whiteRating, blackRating }
 *    copy(text)            -> Promise<boolean>
 */
(function (root) {
  'use strict';

  /* ⚠ LAZY, NOT CAPTURED. This file can load before pjcc-chess.js; reading the engine at
     definition time would freeze an undefined and fail silently forever. */
  function C() { return root.PJCCChess; }

  function two(n) { return (n < 10 ? '0' : '') + n; }

  function pgnDate(v) {
    /* ⚠ A DATE-ONLY STRING IS UTC MIDNIGHT, and the local getters then report the day
       BEFORE, anywhere west of Greenwich. Take it verbatim rather than through a Date. */
    if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v.replace(/-/g, '.');
    var d = (v == null) ? new Date() : new Date(v);
    if (isNaN(d.getTime())) return '????.??.??';
    return d.getFullYear() + '.' + two(d.getMonth() + 1) + '.' + two(d.getDate());
  }

  /* A tag value is a quoted string, so a backslash or a quote inside a codename would
     end the tag early and make the whole header unparseable. */
  function esc(s) { return String(s == null ? '' : s).replace(/\\/g, '\\\\').replace(/"/g, '\\"'); }

  /* UCI -> SAN, the same walk match.js replayGame() does. Returns null rather than a
     partial list: half a game with a full header reads as a real game and is not one. */
  function replay(movesStr, startFen) {
    var Cc = C();
    if (!Cc) return null;
    var S;
    try { S = Cc.parseFEN(startFen || Cc.START_FEN); } catch (e) { return null; }
    var turn0 = S.turn, full0 = S.full || 1, sans = [];
    var list = (movesStr || '').trim() ? movesStr.trim().split(/\s+/) : [];
    for (var i = 0; i < list.length; i++) {
      var u = list[i];
      if (!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(u)) return null;
      var m = Cc.findMove(S, Cc.sqFromName(u.slice(0, 2)), Cc.sqFromName(u.slice(2, 4)), u[4] || null);
      if (!m) return null;
      sans.push(Cc.toSAN(S, m));
      S = Cc.makeMove(S, m);
    }
    return { sans: sans, turn0: turn0, full0: full0 };
  }

  /* 80 columns, and never inside a token — a split move number is a broken PGN. */
  function wrap(tokens) {
    var lines = [], line = '';
    for (var i = 0; i < tokens.length; i++) {
      if (line && (line.length + 1 + tokens[i].length) > 80) { lines.push(line); line = ''; }
      line += (line ? ' ' : '') + tokens[i];
    }
    if (line) lines.push(line);
    return lines.join('\n');
  }

  function toPGN(movesStr, meta) {
    meta = meta || {};
    var g = replay(movesStr, meta.fen);
    if (!g || !g.sans.length) return null;

    var result = meta.result || '*';
    var tags = [
      ['Event', meta.event || 'ChessWild'],
      ['Site', 'chesswild.com'],
      ['Date', pgnDate(meta.date)],
      ['Round', '?'],
      ['White', meta.whiteName || '?'],
      ['Black', meta.blackName || '?'],
      ['Result', result]
    ];
    if (meta.whiteRating != null && meta.whiteRating !== '') tags.push(['WhiteElo', String(meta.whiteRating)]);
    if (meta.blackRating != null && meta.blackRating !== '') tags.push(['BlackElo', String(meta.blackRating)]);
    /* ⚠⚠ BOTH TAGS OR NEITHER. A study replayed from the standard position is a legal-
       looking game of something that never happened, and nothing downstream would say so. */
    if (meta.fen) { tags.push(['SetUp', '1']); tags.push(['FEN', meta.fen]); }

    var head = [];
    for (var t = 0; t < tags.length; t++) head.push('[' + tags[t][0] + ' "' + esc(tags[t][1]) + '"]');

    var toks = [], n = g.full0, white = (g.turn0 === 'w');
    if (!white) toks.push(n + '...');
    for (var i = 0; i < g.sans.length; i++) {
      if (white) toks.push(n + '.');
      toks.push(g.sans[i]);
      if (!white) n++;
      white = !white;
    }
    toks.push(result);
    return head.join('\n') + '\n\n' + wrap(toks) + '\n';
  }

  function copy(text) {
    if (!text) return Promise.resolve(false);
    if (root.navigator && root.navigator.clipboard) {
      return root.navigator.clipboard.writeText(text).then(function () { return true; },
        function () { return legacyCopy(text); });
    }
    return Promise.resolve(legacyCopy(text));
  }

  function legacyCopy(text) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0;';
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return !!ok;
    } catch (e) { return false; }
  }

  root.PJCCPgn = { toPGN: toPGN, copy: copy };
}(typeof self !== 'undefined' ? self : this));
