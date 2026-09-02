/* =============================================================================
 * PJCC OPENING SYSTEMS — what each regular at the Park Tables actually plays.
 * -----------------------------------------------------------------------------
 * Nate, 2026-09-01, on finding the bench had been reshaped around one Academy lesson:
 *   *"What if the characters we have so far, who are part of the story, have their own
 *   openings for white and black that they prefer to play … This way they can (a) comment
 *   on getting into their favorite opening or not and (b) allow more flexibility for what
 *   we are trying to do."*
 *
 * ⭐⭐ SYSTEMS, NOT LINES, AND THE DIFFERENCE IS THE WHOLE DESIGN. What replaced this
 * shipped for one day and taught the lesson: eight seats each carried a memorized 14-ply
 * anti-Pirc LINE, so all eight opened 1.e4 whenever you were Black, and the moment you
 * played anything the line had not heard of the whole thing evaporated. A line is a
 * corridor. A system is a SET OF SQUARES a player wants, reachable in any order, against
 * anything — so Crockett plays b3, Bb2, e3, Nf3 whether you answer with e5, c5 or the Pirc,
 * and he is still recognizably Crockett in a position no book has ever seen.
 *
 * ⚠⚠ AND IT IS WHY A 400 CAN HAVE ONE. A weak seat reciting theory reads as a bug; a weak
 * seat that knows one setup and plays it at everything reads as a person who has been shown
 * one thing. The system is the character. [[park-tables-matchmaking]]
 *
 * ── HOW next() PICKS ─────────────────────────────────────────────────────────────────
 * Walk the wanted squares in order and play the FIRST one that is legal right now. That is
 * the entire algorithm, and it is move-order independent for free: once d4 has been played
 * the move `d2d4` is no longer legal, so it is skipped without any bookkeeping; if Black
 * makes Bf4 impossible the bishop is skipped and e3 comes next. No index, no prefix test,
 * nothing to fall out of.
 *
 * ⚠ BLACK BRANCHES ON WHITE'S FIRST MOVE AND WHITE DOES NOT. Nate's own example — *"likes
 * to get into the Slav or 1.e5 for black regardless of 1.e4 or 1.d4"* — is exactly a map
 * from White's opening move to the setup wanted against it. `'*'` is the catch-all. Without
 * that branch a flat list plays 1.d4 e5, which is legal, losing, and looks like a defect.
 *
 * ⛑⛑ NOTHING HERE MAY HANG A PIECE. A "wanted square" is wanted in a quiet position, not
 * in one where the opponent has just attacked something, and the failure mode of a naive
 * system bot is exactly that: it keeps building while a rook walks off. hangs() is a 2-ply
 * material check — after the candidate move, can the opponent take something and come out
 * more than a pawn ahead once I recapture? If so this move is not offered and the caller
 * falls through to the engine, which is what a real player does when the position stops
 * being about development.
 *
 * ⚠ THE REFEREE IS THE AUTHORITY, HERE AS EVERYWHERE. Every move handed back has come out
 * of legalMoves(); this module owns no chess. [[accuracy-above-all]]
 *
 * Usable as a browser global (window.PJCCSystems) or a Node module (require).
 * ========================================================================== */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./pjcc-chess.js'));
  else root.PJCCSystems = factory(root.PJCCChess);
}(typeof self !== 'undefined' ? self : this, function (C) {
  'use strict';

  /* ══ THE SYSTEMS ═══════════════════════════════════════════════════════════════════
     ⚠ RATIFIED BY NATE 2026-09-01, AND THE ASSIGNMENT LIVES IN _data/regulars.yml — this
     file knows what a system IS, not who plays it. Two seats deliberately have none, and in
     both cases the absence is the character: Auston adapts, so a fixed anything is the one
     thing her seat cannot have, and Vince studies YOU rather than chess. */
  var SYS = {

    /* ── WHITE ────────────────────────────────────────────────────────────────────── */

    /* Maxwell, 400. One setup, played at everything, which is what somebody who has been
       shown one opening actually does. It is also genuinely sound, so he is weak for the
       right reason — he plays it and then plays like a 400. */
    london: { side: 'w', name: 'The London System',
      moves: ['d2d4', 'c1f4', 'e2e3', 'g1f3', 'f1d3', 'f1e2', 'c2c3', 'e1g1', 'b1d2'] },

    /* Crockett, 750 — Nate's own example. An early oddity that looks like a trick and is
       actually a real opening, which is every improving player's favorite kind. */
    larsen: { side: 'w', name: 'The Nimzo-Larsen Attack',
      moves: ['b2b3', 'c1b2', 'e2e3', 'g1f3', 'f1e2', 'e1g1', 'd2d4'] },

    /* Argus, 1000. Quiet, structural, nothing given away — "the kept word" as a shape. */
    kia: { side: 'w', name: 'The King’s Indian Attack',
      moves: ['g1f3', 'g2g3', 'f1g2', 'e1g1', 'd2d3', 'b1d2', 'e2e4'] },

    /* Nate, 1200 — his, 2026-09-01. ⚠ THE SEAT IS NOT THE MAN: the real Nate plays the
       Pirc, and he gave the seat the Queen's Gambit on purpose. A character, not a mirror.
       [[yel-fiction-guardrail]] */
    qgambit: { side: 'w', name: 'The Queen’s Gambit',
      moves: ['d2d4', 'c2c4', 'b1c3', 'g1f3', 'c1g5', 'c1f4', 'e2e3', 'f1d3', 'e1g1'] },

    /* Kedar, 1400. The oldest opening there is, nothing given away, no fireworks — and
       1.e4 keeps him distinct from Nate's 1.d4 now that the Queen's Gambit has moved. */
    italian: { side: 'w', name: 'The Italian Game',
      moves: ['e2e4', 'g1f3', 'f1c4', 'f1e2', 'd2d3', 'c2c3', 'e1g1', 'b1d2'] },

    /* Robert, 1800. A plan you can memorize and execute, aimed at the king, played against
       everything — his certainty as a set of squares. Against a Pirc it IS the 150 Attack,
       which is what keeps him preparable in the Academy. */
    samisch: { side: 'w', name: 'The 150 Attack', pirc: 'attack150',
      moves: ['e2e4', 'd2d4', 'b1c3', 'c1e3', 'd1d2', 'f2f3', 'e1c1'] },

    /* Princess, 2100. Patience that reads as mastery rather than as timidity. */
    catalan: { side: 'w', name: 'The Catalan',
      moves: ['d2d4', 'c2c4', 'g1f3', 'g2g3', 'f1g2', 'e1g1', 'd1c2'] },

    /* The CEO, 2400. ⚠ DELIBERATELY THE SHORTEST LIST HERE. He does not have a system, he
       has principles and then he thinks — four main-line moves and the engine takes it from
       there. Appetite: the whole front of the board, and no shortcuts. */
    mainline: { side: 'w', name: 'Main-Line Chess', pirc: 'classical',
      moves: ['e2e4', 'g1f3', 'd2d4', 'b1c3'] },

    /* ── BLACK ────────────────────────────────────────────────────────────────────── */

    /* Maxwell. Meet the middle in the middle, whatever is played. */
    openb: { side: 'b', name: '1…e5 and the Italian',
      vs: { e2e4: ['e7e5', 'b8c6', 'g8f6', 'f8c5', 'f8e7', 'e8g8', 'd7d6'],
            '*':  ['d7d5', 'g8f6', 'e7e6', 'f8e7', 'e8g8', 'c7c6'] } },

    /* Crockett — Nate's words: *"the Slav or 1.e5 for black regardless of 1.e4 or 1.d4."* */
    slav: { side: 'b', name: 'The Slav, or 1…e5',
      vs: { e2e4: ['e7e5', 'b8c6', 'g8f6', 'f8c5', 'f8e7', 'e8g8', 'd7d6'],
            '*':  ['d7d5', 'c7c6', 'g8f6', 'c8f5', 'e7e6', 'f8e7', 'e8g8', 'b8d7'] } },

    /* Argus. Solid, structural, gives nothing away — the same person from both chairs. */
    caro: { side: 'b', name: 'The Caro-Kann',
      vs: { e2e4: ['c7c6', 'd7d5', 'c8f5', 'e7e6', 'g8f6', 'f8e7', 'e8g8', 'b8d7'],
            '*':  ['d7d5', 'e7e6', 'g8f6', 'f8e7', 'e8g8', 'c7c6'] } },

    /* Nate — his, 2026-09-01. ⚠ THE GRÜNFELD NEEDS d4 TO EXIST. Against 1.e4 the same
       hypermodern idea is the Modern, so the branch is the opening rather than a
       compromise: cede the center, then hit it. */
    grunfeld: { side: 'b', name: 'The Grünfeld',
      vs: { e2e4: ['g7g6', 'f8g7', 'd7d6', 'g8f6', 'e8g8', 'b8c6', 'c8g4'],
            '*':  ['g8f6', 'g7g6', 'd7d5', 'f8g7', 'e8g8', 'c7c6', 'c8f5'] } },

    /* Kedar. Immovable from this side too. */
    french: { side: 'b', name: 'The French Defense',
      vs: { e2e4: ['e7e6', 'd7d5', 'g8f6', 'f8e7', 'e8g8', 'c7c5', 'b8c6'],
            '*':  ['d7d5', 'e7e6', 'g8f6', 'f8e7', 'e8g8', 'c7c6', 'b8d7'] } },

    /* Robert. ⭐ HE PLAYS BOTH SIDES OF THE SAME ARGUMENT: his White setup is the system
       that exists to meet this one. The man is consistent even when he is arguing with
       himself. Against 1.e4 the g6 order avoids being a second Pirc — that seat is
       Princess's now. */
    kid: { side: 'b', name: 'The King’s Indian',
      vs: { e2e4: ['g7g6', 'f8g7', 'g8f6', 'e8g8', 'd7d6', 'e7e5', 'b8c6'],
            '*':  ['g8f6', 'g7g6', 'f8g7', 'e8g8', 'd7d6', 'e7e5', 'b8d7'] } },

    /* Princess — his, 2026-09-01. ⭐ AND IT IS MICHAEL'S OPENING, which is a relationship
       the canon has not stated. The fit is real: her creed is that she has never been too
       proud to be a beginner, and the Pirc's whole argument is to let him have the middle
       and take it back later. [[princess-canon-hook]] [[slow-roll-cast]] */
    pircb: { side: 'b', name: 'The Pirc Defense',
      vs: { e2e4: ['d7d6', 'g8f6', 'g7g6', 'f8g7', 'e8g8', 'c7c6', 'b8d7'],
            '*':  ['d7d6', 'g8f6', 'g7g6', 'f8g7', 'e8g8', 'c7c6', 'b8d7'] } },

    /* The CEO. The sharpest reply there is, and he wants the complicated one. */
    najdorf: { side: 'b', name: 'The Najdorf',
      vs: { e2e4: ['c7c5', 'd7d6', 'g8f6', 'a7a6', 'e7e6', 'f8e7', 'e8g8', 'b8d7'],
            '*':  ['g8f6', 'g7g6', 'f8g7', 'e8g8', 'd7d6', 'b8d7', 'e7e5'] } }
  };

  /* ══ THE MACHINERY ═════════════════════════════════════════════════════════════════ */

  var VAL = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
  function val(piece) { return piece ? (VAL[piece.toLowerCase()] || 0) : 0; }

  /* the squares this system wants, given how the game opened */
  function plan(id, firstMove) {
    var s = SYS[id];
    if (!s) return null;
    if (s.moves) return s.moves;
    if (!s.vs) return null;
    return s.vs[firstMove] || s.vs['*'] || null;
  }

  /* ⛑⛑ A 2-PLY MATERIAL CHECK, AND IT IS THE DIFFERENCE BETWEEN A CHARACTER AND A BUG.
     After the candidate move, look at every capture the opponent has: take the victim, let
     me recapture on that square with my cheapest attacker, and see where the material lands.
     Worse than a pawn down means this square is not wanted RIGHT NOW, and the caller falls
     through to the engine — which is exactly what a real player does when the position
     stops being about development.
     ⚠ IT IS NOT A SEARCH AND MUST NOT GROW INTO ONE. It runs once per bot move in an opening
     position; anything deeper belongs to Stockfish, which is already sitting right there. */
  function hangs(S, mv) {
    var g = C.makeMove(S, mv);
    var reps = C.legalMoves(g), i, j, worst = 0;
    for (i = 0; i < reps.length; i++) {
      var r = reps[i], victim = g.b[r.to];
      if (!victim && !r.ep) continue;                 // captures only
      var gain = r.ep ? 1 : val(victim);
      if (gain === 0) continue;
      var after = C.makeMove(g, r);
      /* my cheapest recapture on that square, if I have one */
      var mine = C.legalMoves(after), best = null;
      for (j = 0; j < mine.length; j++) {
        if (mine[j].to !== r.to) continue;
        var cost = val(after.b[mine[j].from]);
        if (best === null || cost < best) best = cost;
      }
      var net = gain - (best === null ? 0 : val(g.b[r.from]));
      if (net > worst) worst = net;
    }
    return worst > 1;
  }

  /* ⭐ THE WHOLE ALGORITHM. The first wanted square that is legal right now.
     ⚠ `movesArr` is the game so far in UCI, used ONLY to read White's first move for the
     Black branch — never as an index into the plan. An index is what a line has. */
  function next(id, S, movesArr, opts) {
    if (!C || !S || !SYS[id]) return null;
    var o = opts || {};
    var list = plan(id, (movesArr && movesArr[0]) || '');
    if (!list) return null;
    /* ⚠ IN CHECK IS NOT A DEVELOPING POSITION. Handing this to the engine is both stronger
       and truer: nobody carries on with their setup while their king is being shouted at. */
    if (C.inCheck(S, S.turn)) return null;
    for (var i = 0; i < list.length; i++) {
      var u = list[i];
      var mv = C.findMove(S, C.sqFromName(u.slice(0, 2)), C.sqFromName(u.slice(2, 4)));
      if (!mv) continue;                                    // not available yet, or already played
      if (!o.reckless && hangs(S, mv)) continue;            // wanted, but not at this price
      return mv;
    }
    return null;
  }

  /* how deep a system runs, for the gates and for the Academy's arithmetic */
  function depth(id, firstMove) { var p = plan(id, firstMove); return p ? p.length : 0; }

  /* ⛑⛑ WHICH SEATS THE PIRC ROOM CAN STILL PREPARE YOU FOR — and it is FEWER than before,
     which is the honest cost of the systems and not a bug to route around. The Academy's
     "By Name" list used to offer all eight seats, because all eight carried an anti-Pirc
     line; now a seat is only preparable if the system it actually plays IS a reply to the
     Pirc. Measured by walking each White system against Princess's own Pirc setup and asking
     classify(): only these two reach a named Pirc position. Maxwell's London, Argus's KIA,
     Nate's Queen's Gambit and Princess's Catalan are not answers to the Pirc at all, and
     listing them would promise a drill the tables cannot deliver ([[dead-game-links-trap]]).
     ⚠ IT IS A FIELD ON THE SYSTEM, NOT A MAP IN THE ACADEMY. The room that teaches the Pirc
     should not also hold an opinion about what the bench plays; one fact, one place. */
  function pircVariation(id) { var s = SYS[id]; return (s && s.pirc) || null; }

  function get(id) { return SYS[id] || null; }
  function all() {
    var out = [], k;
    for (k in SYS) if (SYS.hasOwnProperty(k)) out.push({ id: k, side: SYS[k].side, name: SYS[k].name });
    return out;
  }

  return { get: get, all: all, plan: plan, next: next, depth: depth, hangs: hangs,
           pircVariation: pircVariation, SYS: SYS };
}));
