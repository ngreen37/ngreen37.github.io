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
    ['B07', 'Pirc / Rat Defense', 'e4 d6'],
    ['B07', 'Pirc Defense', 'e4 d6 d4 Nf6 Nc3'],
    /* The Pirc to real depth (2026-07-27). Nate played 1.e4 d6 and the review called it an
       inaccuracy — "But that's the Pirc defense! And that's just the first move." Two
       things were wrong: the Gauntlet never loaded this book at all, and even where it
       DID load, the Pirc ran out after five plies. These three are the exact lines The
       Pirc Protocol already teaches (and that the accuracy suite already checks against
       Stockfish), so the book and the lesson now say the same thing. */
    ['B07', 'Pirc Defense', 'e4 d6 d4 Nf6 Nc3 g6'],
    ['B08', 'Pirc, Classical', 'e4 d6 d4 Nf6 Nc3 g6 Nf3 Bg7 Be2 O-O O-O c6 a4 e5'],
    ['B09', 'Pirc, Austrian Attack', 'e4 d6 d4 Nf6 Nc3 g6 f4 Bg7 Nf3 O-O Bd3 Na6 O-O c5'],
    ['B07', 'Pirc, 150 Attack', 'e4 d6 d4 Nf6 Nc3 g6 Be3 Bg7 Qd2 c6 f3 b5 Nge2 Nbd7'],
    ['B06', 'Modern Defense', 'e4 g6'],
    ['B06', 'Modern Defense', 'e4 g6 d4 Bg7'],
    ['B06', 'Modern, Classical', 'e4 g6 d4 Bg7 Nc3 d6 Nf3 Nf6'],
    ['B00', 'Nimzowitsch Defense', 'e4 Nc6'],
    // ── 1.d4 ─────────────────────────────────────────────────────────────────
    ['A40', "Queen's Pawn Opening", 'd4'],
    // 1.d4 sidesteps that are THEORY, not inaccuracies (2026-07-24 Nate: 1.d4 e6 is the
    // Horwitz Defense — chess.com names it, so it must never score ?!). Each row names the
    // reply; the transposition rows below carry the whole early tree back into known lines,
    // so a Horwitz move order stays "book" until it actually leaves theory.
    ['A40', "Queen's Pawn, Horwitz Defense", 'd4 e6'],
    ['C00', 'French Defense (by transposition)', 'd4 e6 e4 d5'],
    ['D30', "Queen's Gambit Declined (by transposition)", 'd4 e6 c4 d5'],
    ['E20', 'Nimzo-Indian Defense (by transposition)', 'd4 e6 c4 Nf6 Nc3 Bb4'],
    ['E11', 'Bogo-Indian Defense (by transposition)', 'd4 e6 c4 Nf6 Nf3 Bb4+'],
    ['E12', "Queen's Indian Defense (by transposition)", 'd4 e6 c4 Nf6 Nf3 b6'],
    ['A80', 'Dutch Defense (by transposition)', 'd4 e6 c4 f5'],
    ['A40', 'English Defense', 'd4 b6'],
    ['A40', 'English Defense', 'd4 e6 c4 b6'],
    ['A41', "Queen's Pawn, Wade Defense", 'd4 d6'],
    ['A40', "Queen's Knight (Mikenas) Defense", 'd4 Nc6'],
    ['A43', 'Old Benoni Defense', 'd4 c5'],
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
    ['A03', "Bird's, Dutch Variation", 'f4 d5'],
    ['A00', 'Grob Opening', 'g4'],
    // ── EVERY OTHER FIRST MOVE (2026-07-22 Nate: "load in all the openings, including
    //    the non-traditional ones" — so an offbeat first move is named THEORY, not an
    //    inaccuracy). One row per remaining legal opening move that carries a name. ──
    ['A00', 'Anderssen Opening', 'a3'],
    ['A00', 'Ware Opening', 'a4'],
    ['A00', 'Saragossa Opening', 'c3'],
    ['A00', 'Mieses Opening', 'd3'],
    ['A00', "Van't Kruijs Opening", 'e3'],
    ['A00', 'Barnes Opening', 'f3'],
    ['A00', 'Hungarian Opening', 'g3'],
    ['A00', 'Benko / KIA Setup', 'g3 g6'],
    ['A00', 'Clemenz Opening', 'h3'],
    ['A00', 'Kádas Opening', 'h4'],
    ['A00', 'Durkin (Sodium) Attack', 'Na3'],
    ['A00', 'Dunst (Van Geet) Opening', 'Nc3'],
    ['A00', 'Amar (Paris) Opening', 'Nh3'],
    ['A00', 'Polish (Sokolsky) Opening', 'b4'],
    ['A00', 'Polish, e5 Line', 'b4 e5'],
    // ── OFFBEAT REPLIES + GAMBITS the curated main lines above skip over ──────────
    ['B00', 'Owen Defense', 'e4 b6'],
    ['B00', 'St. George Defense', 'e4 a6'],
    ['B00', 'Borg (Grob Reversed) Defense', 'e4 g5'],
    ['B00', 'Fred Defense', 'e4 f5'],
    ['C40', 'Latvian Gambit', 'e4 e5 Nf3 f5'],
    ['C40', 'Elephant Gambit', 'e4 e5 Nf3 d5'],
    ['C50', 'Hungarian Defense', 'e4 e5 Nf3 Nc6 Bc4 Be7'],
    ['C21', 'Danish Gambit', 'e4 e5 d4 exd4 c3'],
    ['C44', 'Scotch Gambit', 'e4 e5 Nf3 Nc6 d4 exd4 Bc4'],
    ['C44', 'Göring Gambit', 'e4 e5 Nf3 Nc6 d4 exd4 c3'],
    ['C36', 'Falkbeer Countergambit', 'e4 e5 f4 d5'],
    ['B21', 'Sicilian, Smith-Morra Gambit', 'e4 c5 d4 cxd4 c3'],
    ['B20', 'Sicilian, Wing Gambit', 'e4 c5 b4'],
    ['B23', 'Sicilian, Grand Prix Attack', 'e4 c5 Nc3 Nc6 f4'],
    ['B27', 'Sicilian, Hyperaccelerated Dragon', 'e4 c5 Nf3 g6'],
    ['A40', 'Englund Gambit', 'd4 e5'],
    ['A40', "Queen's Pawn, Modern Defense", 'd4 g6'],
    ['A53', 'Old Indian Defense', 'd4 Nf6 c4 d6'],
    ['A50', "Black Knights' Tango", 'd4 Nf6 c4 Nc6'],
    ['A51', 'Budapest Gambit', 'd4 Nf6 c4 e5'],
    ['D00', 'Blackmar-Diemer Gambit', 'd4 d5 e4'],
    ['D01', 'Richter-Veresov Attack', 'd4 d5 Nc3 Nf6 Bg5'],
    ['A46', 'Torre Attack', 'd4 Nf6 Nf3 e6 Bg5'],
    ['A45', 'Queen\'s Pawn, Barry/Colle Setup', 'd4 Nf6 Nf3'],
    // ── DEEPER MAIN LINES (2026-07-24) — keep the popular openings "in book" a few plies
    //    longer, so ordinary theory in the MIDDLE of the opening isn't scored as mistakes.
    //    (build() marks every prefix book, so these carry their whole main line, not just
    //    the final position.) Any line the engine can't reproduce is dropped, never fatal.
    ['C50', 'Italian Game, Giuoco Pianissimo', 'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3 d6'],
    ['C65', 'Ruy Lopez, Berlin Defense', 'e4 e5 Nf3 Nc6 Bb5 Nf6 O-O Nxe4'],
    ['C88', 'Ruy Lopez, Closed', 'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 d6 c3 O-O'],
    ['C42', 'Petrov, Classical', 'e4 e5 Nf3 Nf6 Nxe5 d6 Nf3 Nxe4'],
    ['B90', 'Sicilian, Najdorf, English Attack', 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6 Be3'],
    ['B76', 'Sicilian, Dragon, Yugoslav Attack', 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be3 Bg7 f3 O-O'],
    ['C11', 'French, Steinitz Variation', 'e4 e6 d4 d5 Nc3 Nf6 e5 Nfd7'],
    ['D37', 'QGD, Main Line', 'd4 d5 c4 e6 Nc3 Nf6 Nf3 Be7 Bf4 O-O'],
    ['D85', 'Grünfeld, Exchange', 'd4 Nf6 c4 g6 Nc3 d5 cxd5 Nxd5 e4 Nxc3 bxc3 Bg7'],
    ['E97', "King's Indian, Classical Main Line", 'd4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O Be2 e5']
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
