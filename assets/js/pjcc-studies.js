/*! pjcc-studies.js — the positions a regular sets you once you have played them enough.
 *
 *  2026-09-04, next-steps #4. Nate, back in August: *"at six hearts a regular offers you a
 *  POSITION instead of a game — rook and pawn against rook, beat me from here."* Hearts were
 *  tracked, capped at six, drawn on the player card, and gated absolutely nothing.
 *
 *  ⚠⚠ THIS FILE IS ONE HALF OF A ROW AND CHECKER TOWN HOLDS THE OTHER. The town knows WHO
 *  offers a study and what they say about it; this knows where the pieces go. Neither list
 *  contains the other's half, so neither can drift into a second copy of it — and `test:town`
 *  fails if the two sets of ids stop matching in either direction. The town plays no chess:
 *  that is the house rule, and this is what it looks like when it is kept.
 *
 *  ⚠ EVERY POSITION IS WHITE TO MOVE AND YOU ARE WHITE. Not a limitation of the format —
 *  `side` is a real field — but a rule that means the board never opens the wrong way round
 *  while the feature is one day old.
 *
 *  ⚠⚠ THE ASSESSMENTS ARE TEXTBOOK AND THE LEGALITY IS PROVEN. tests/town.check.js parses
 *  every FEN with the perft-verified referee and asserts the position is legal, White to
 *  move, not already finished, and made of exactly the material its name claims. What no
 *  test here can prove is that a win is a win — those are seven positions out of the same
 *  endgame chapter everybody learns from, and each one is a margin rather than a
 *  calculation. [[accuracy-above-all]]
 *
 *  API (window.PJCCStudies):
 *    all()      -> the rows
 *    get(id)    -> one row, or null
 */
(function (root) {
  'use strict';

  var STUDIES = [
    /* The Lucena. The black king is cut off on the e-file and the bridge is the answer. */
    { id: 'lucena',   side: 'w', goal: 'win',
      name: 'Rook and pawn against rook',
      fen: '2K5/2P1k3/8/8/8/8/r7/3R4 w - - 0 1' },

    /* The Philidor, mirrored so the DEFENDER is White. The rook sits on the third rank
       until the pawn commits, then drops behind it and checks forever. */
    { id: 'philidor', side: 'w', goal: 'draw',
      name: 'The third rank',
      fen: '7r/8/8/8/3kp3/R7/4K3/8 w - - 0 1' },

    { id: 'ladder',   side: 'w', goal: 'win',
      name: 'Two rooks',
      fen: '4k3/8/8/8/8/8/8/R3K2R w - - 0 1' },

    /* Mate in two and the only defense is a block that gets taken. */
    { id: 'backrank', side: 'w', goal: 'win',
      name: 'The back rank',
      fen: '6k1/5ppp/8/8/8/8/1r6/R5K1 w - - 0 1' },

    /* ⚠ A d-PAWN, DELIBERATELY. Queen against a rook's pawn or a bishop's pawn on the
       seventh is a DRAW — the stalemate trick saves it. Against a center or knight pawn it
       is a win, and picking the wrong file would have shipped a position that says "beat me
       from here" about a position nobody can beat. */
    { id: 'qvp',      side: 'w', goal: 'win',
      name: 'Queen against a pawn',
      fen: 'Q7/8/8/8/8/6K1/3p4/3k4 w - - 0 1' },

    { id: 'rookmate', side: 'w', goal: 'win',
      name: 'King and rook',
      fen: '4k3/8/8/8/8/8/3R4/4K3 w - - 0 1' },

    { id: 'bishops',  side: 'w', goal: 'win',
      name: 'Two bishops',
      fen: '4k3/8/8/8/8/8/3BB3/4K3 w - - 0 1' }
  ];

  function get(id) {
    for (var i = 0; i < STUDIES.length; i++) if (STUDIES[i].id === id) return STUDIES[i];
    return null;
  }

  root.PJCCStudies = { all: function () { return STUDIES.slice(); }, get: get };

  /* Node, for the gate — the same object, no DOM anywhere in this file. */
  if (typeof module !== 'undefined' && module.exports) module.exports = root.PJCCStudies;
})(typeof window !== 'undefined' ? window : this);
