/*! pjcc-openings.js — a small, curated opening book for PJCC chess.
 *
 *  Two jobs:
 *    1. Game Review — the first few moves of a game are usually THEORY, not
 *       inaccuracies. Nate: "the first however-many moves are showing as
 *       inaccuracies when they are usually book moves." Moves that follow a known
 *       line are tagged "Book" and left out of the accuracy math.
 *    2. Live games — while a game is still in a known line, the opening's NAME is
 *       shown ("📖 Ruy Lopez"), refining as the line deepens.
 *
 *  How it stays correct without a giant database: the book is authored in plain
 *  SAN (readable), then RESOLVED to exact UCI paths by replaying each line through
 *  the perft-verified PJCCChess engine — the same engine the games use. So a book
 *  move and a game move are compared as identical from/to coordinates, never as
 *  hand-typed strings. A line the engine can't reproduce is simply dropped (never
 *  throws). The book is intentionally curated to the openings a club game actually
 *  reaches — it grows by adding rows to RAW, nothing else.
 *
 *  API (window.PJCCOpenings):
 *    classify(uciArray) -> { bookPlies, name, eco }
 *        bookPlies = how many leading plies are still "in book"
 *        name/eco  = the deepest named line those plies match (or null)
 *    name(uciArray)     -> the current opening name string, or null
 */
(function (root) {
  'use strict';

  // [ECO, name, SAN line]. Named at several depths so the name refines as a game
  // goes deeper (e.g. Ruy Lopez → Morphy Defense → Closed). Order doesn't matter;
  // classify() always reports the DEEPEST named line a game matches.
  var RAW = [
    // ── 1.e4 e5 ──────────────────────────────────────────────────────────────
    ['B00', "King's Pawn Opening", 'e4'],
    ['C20', 'Open Game', 'e4 e5'],
    ['C40', "King's Knight Opening", 'e4 e5 Nf3'],
    ['C41', 'Philidor Defense', 'e4 e5 Nf3 d6'],
    ['C42', 'Petrov (Russian) Defense', 'e4 e5 Nf3 Nf6'],
    ['C44', 'Ponziani Opening', 'e4 e5 Nf3 Nc6 c3'],
    ['C44', 'Scotch Game', 'e4 e5 Nf3 Nc6 d4'],
    ['C45', 'Scotch Game', 'e4 e5 Nf3 Nc6 d4 exd4 Nxd4'],
    ['C46', 'Four Knights Game', 'e4 e5 Nf3 Nc6 Nc3 Nf6'],
    ['C50', 'Italian Game', 'e4 e5 Nf3 Nc6 Bc4'],
    ['C50', 'Giuoco Piano', 'e4 e5 Nf3 Nc6 Bc4 Bc5'],
    ['C51', 'Evans Gambit', 'e4 e5 Nf3 Nc6 Bc4 Bc5 b4'],
    ['C53', 'Giuoco Piano, Main Line', 'e4 e5 Nf3 Nc6 Bc4 Bc5 c3'],
    ['C55', 'Two Knights Defense', 'e4 e5 Nf3 Nc6 Bc4 Nf6'],
    ['C57', 'Two Knights, Fried Liver', 'e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5 exd5 Nxd5 Nxf7'],
    ['C60', 'Ruy Lopez', 'e4 e5 Nf3 Nc6 Bb5'],
    ['C65', 'Ruy Lopez, Berlin Defense', 'e4 e5 Nf3 Nc6 Bb5 Nf6'],
    ['C68', 'Ruy Lopez, Exchange', 'e4 e5 Nf3 Nc6 Bb5 a6 Bxc6'],
    ['C70', 'Ruy Lopez, Morphy Defense', 'e4 e5 Nf3 Nc6 Bb5 a6 Ba4'],
    ['C77', 'Ruy Lopez, Morphy Defense', 'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6'],
    ['C84', 'Ruy Lopez, Closed', 'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7'],
    ['C25', 'Vienna Game', 'e4 e5 Nc3'],
    ['C30', "King's Gambit", 'e4 e5 f4'],
    ['C33', "King's Gambit Accepted", 'e4 e5 f4 exf4'],
    ['C23', "Bishop's Opening", 'e4 e5 Bc4'],
    ['C21', 'Center Game', 'e4 e5 d4'],
    // ── Sicilian ─────────────────────────────────────────────────────────────
    ['B20', 'Sicilian Defense', 'e4 c5'],
    ['B22', 'Sicilian, Alapin', 'e4 c5 c3'],
    ['B23', 'Sicilian, Closed', 'e4 c5 Nc3'],
    ['B27', 'Sicilian Defense', 'e4 c5 Nf3'],
    ['B50', 'Sicilian Defense', 'e4 c5 Nf3 d6'],
    ['B54', 'Sicilian, Open', 'e4 c5 Nf3 d6 d4 cxd4 Nxd4'],
    ['B56', 'Sicilian, Classical', 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3'],
    ['B90', 'Sicilian, Najdorf', 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6'],
    ['B70', 'Sicilian, Dragon', 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6'],
    ['B30', 'Sicilian Defense', 'e4 c5 Nf3 Nc6'],
    ['B33', 'Sicilian, Sveshnikov', 'e4 c5 Nf3 Nc6 d4 cxd4 Nxd4 Nf6 Nc3 e5'],
    ['B40', 'Sicilian Defense', 'e4 c5 Nf3 e6'],
    ['B44', 'Sicilian, Taimanov', 'e4 c5 Nf3 e6 d4 cxd4 Nxd4 Nc6'],
    // ── French ───────────────────────────────────────────────────────────────
    ['C00', 'French Defense', 'e4 e6'],
    ['C01', 'French, Exchange', 'e4 e6 d4 d5 exd5'],
    ['C02', 'French, Advance', 'e4 e6 d4 d5 e5'],
    ['C03', 'French, Tarrasch', 'e4 e6 d4 d5 Nd2'],
    ['C10', 'French, Paulsen', 'e4 e6 d4 d5 Nc3'],
    ['C11', 'French, Classical', 'e4 e6 d4 d5 Nc3 Nf6'],
    ['C15', 'French, Winawer', 'e4 e6 d4 d5 Nc3 Bb4'],
    // ── Caro-Kann ────────────────────────────────────────────────────────────
    ['B10', 'Caro-Kann Defense', 'e4 c6'],
    ['B12', 'Caro-Kann, Advance', 'e4 c6 d4 d5 e5'],
    ['B13', 'Caro-Kann, Exchange', 'e4 c6 d4 d5 exd5'],
    ['B13', 'Caro-Kann, Panov Attack', 'e4 c6 d4 d5 exd5 cxd5 c4'],
    ['B15', 'Caro-Kann, Main Line', 'e4 c6 d4 d5 Nc3'],
    // ── other replies to 1.e4 ────────────────────────────────────────────────
    ['B01', 'Scandinavian Defense', 'e4 d5'],
    ['B01', 'Scandinavian, Main Line', 'e4 d5 exd5 Qxd5 Nc3 Qa5'],
    ['B02', 'Alekhine Defense', 'e4 Nf6'],
    ['B06', 'Modern Defense', 'e4 g6'],
    ['B07', 'Pirc Defense', 'e4 d6 d4 Nf6 Nc3'],
    ['B00', 'Nimzowitsch Defense', 'e4 Nc6'],
    // ── 1.d4 ─────────────────────────────────────────────────────────────────
    ['A40', "Queen's Pawn Opening", 'd4'],
    ['D00', "Queen's Pawn Game", 'd4 d5'],
    ['D02', 'London System', 'd4 d5 Nf3 Nf6 Bf4'],
    ['D06', "Queen's Gambit", 'd4 d5 c4'],
    ['D07', 'Chigorin Defense', 'd4 d5 c4 Nc6'],
    ['D08', 'Albin Countergambit', 'd4 d5 c4 e5'],
    ['D20', "Queen's Gambit Accepted", 'd4 d5 c4 dxc4'],
    ['D30', "Queen's Gambit Declined", 'd4 d5 c4 e6'],
    ['D35', 'QGD, Exchange Variation', 'd4 d5 c4 e6 cxd5 exd5'],
    ['D37', 'QGD, Three Knights', 'd4 d5 c4 e6 Nc3 Nf6 Nf3'],
    ['D10', 'Slav Defense', 'd4 d5 c4 c6'],
    ['D43', 'Semi-Slav Defense', 'd4 d5 c4 e6 Nc3 Nf6 Nf3 c6'],
    // ── 1.d4 Nf6 (Indian) ────────────────────────────────────────────────────
    ['A45', 'Indian Defense', 'd4 Nf6'],
    ['A45', 'Trompowsky Attack', 'd4 Nf6 Bg5'],
    ['E00', 'Catalan Opening', 'd4 Nf6 c4 e6 g3'],
    ['E11', 'Bogo-Indian Defense', 'd4 Nf6 c4 e6 Nf3 Bb4+'],
    ['E12', "Queen's Indian Defense", 'd4 Nf6 c4 e6 Nf3 b6'],
    ['E20', 'Nimzo-Indian Defense', 'd4 Nf6 c4 e6 Nc3 Bb4'],
    ['E60', "King's Indian Defense", 'd4 Nf6 c4 g6 Nc3 Bg7'],
    ['D80', 'Grünfeld Defense', 'd4 Nf6 c4 g6 Nc3 d5'],
    ['A43', 'Benoni Defense', 'd4 Nf6 c4 c5'],
    ['A57', 'Benko Gambit', 'd4 Nf6 c4 c5 d5 b5'],
    ['A60', 'Modern Benoni', 'd4 Nf6 c4 c5 d5 e6'],
    // ── Dutch + flank ────────────────────────────────────────────────────────
    ['A80', 'Dutch Defense', 'd4 f5'],
    ['A84', 'Dutch, Stonewall', 'd4 f5 c4 Nf6 g3 e6'],
    ['A10', 'English Opening', 'c4'],
    ['A15', 'English, Anglo-Indian', 'c4 Nf6'],
    ['A20', "English, King's English", 'c4 e5'],
    ['A30', 'English, Symmetrical', 'c4 c5'],
    ['A04', 'Réti Opening', 'Nf3'],
    ['A09', 'Réti, Advance Variation', 'Nf3 d5 c4'],
    ['A01', 'Nimzo-Larsen Attack', 'b3'],
    ['A02', "Bird's Opening", 'f4'],
    ['A00', 'Grob Opening', 'g4']
  ];

  function norm(s) { return String(s).replace(/[+#!?]/g, ''); }

  var built = false, bookSet = null, nameMap = null, dropped = [];

  // Resolve one SAN line to an array of UCI moves via the engine; null if any token
  // doesn't match a legal move (the line is then skipped — never fatal).
  function resolveLine(sanLine, Cc) {
    var S = Cc.parseFEN(Cc.START_FEN), toks = sanLine.trim().split(/\s+/), uci = [];
    for (var i = 0; i < toks.length; i++) {
      var want = norm(toks[i]), lm = Cc.legalMoves(S), found = null;
      for (var j = 0; j < lm.length; j++) {
        if (norm(Cc.toSAN(S, lm[j])) === want) { found = lm[j]; break; }
      }
      if (!found) return null;
      uci.push(Cc.nameFromSq(found.from) + Cc.nameFromSq(found.to) + (found.promo ? found.promo.toLowerCase() : ''));
      S = Cc.makeMove(S, found);
    }
    return uci;
  }

  function build() {
    if (built) return;
    var Cc = root.PJCCChess;
    if (!Cc) return;                       // engine not present — classify() no-ops
    built = true;
    bookSet = Object.create(null);         // every UCI prefix of every line → 1
    nameMap = Object.create(null);         // full-line UCI → { name, eco }
    for (var i = 0; i < RAW.length; i++) {
      var uci = resolveLine(RAW[i][2], Cc);
      if (!uci || !uci.length) { dropped.push(RAW[i][1] + ' — ' + RAW[i][2]); continue; }
      var key = '';
      for (var k = 0; k < uci.length; k++) { key = key ? key + ' ' + uci[k] : uci[k]; bookSet[key] = 1; }
      nameMap[key] = { name: RAW[i][1], eco: RAW[i][0] };
    }
  }

  // Walk the game's UCI moves while they stay on a known line; report how deep it
  // stayed in book and the deepest named line reached.
  function classify(uciArr) {
    var out = { bookPlies: 0, name: null, eco: null };
    if (!root.PJCCChess || !uciArr || !uciArr.length) return out;
    build();
    if (!bookSet) return out;
    var key = '';
    for (var i = 0; i < uciArr.length; i++) {
      key = key ? key + ' ' + uciArr[i] : uciArr[i];
      if (!bookSet[key]) break;
      out.bookPlies = i + 1;
      if (nameMap[key]) { out.name = nameMap[key].name; out.eco = nameMap[key].eco; }
    }
    return out;
  }

  function name(uciArr) { return classify(uciArr).name; }

  // Accept a space-separated UCI string too, for convenience at call sites.
  function toArr(x) { return Array.isArray(x) ? x : (x ? String(x).trim().split(/\s+/) : []); }

  root.PJCCOpenings = {
    classify: function (x) { return classify(toArr(x)); },
    name: function (x) { return name(toArr(x)); },
    // maintenance: how many book lines the engine couldn't reproduce (should be 0).
    _audit: function () { build(); return { total: RAW.length, dropped: dropped.slice() }; }
  };
})(typeof self !== 'undefined' ? self : this);
