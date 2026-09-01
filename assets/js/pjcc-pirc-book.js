/*! pjcc-pirc-book.js — the Pirc repertoire, for BLACK, as data.
 *
 *  THE OPENING TRAINER'S ONE SOURCE OF TRUTH (2026-08-31). Nate: "I love the Pirc
 *  defense… a trainer where you get into the main line (and variations like Lions Jaw,
 *  etc) so you can hit it hard. PIRC-ONLY, and ONLY WITH BLACK."
 *
 *  ══ WHY THIS IS A MODULE AND NOT A CONST IN THE PAGE ════════════════════════════════
 *  Because a chess claim the site makes has to be PROVABLE, and a `<script>` block inside
 *  a Jekyll page cannot be replayed by a test without a browser. Authored here in plain
 *  SAN — which is the readable form, the form a chess player can proofread — and then
 *  resolved to exact from/to squares by replaying every line through the perft-verified
 *  referee (pjcc-chess.js). Same discipline as pjcc-openings.js, for the same reason:
 *
 *    · a line that the referee cannot reproduce EXACTLY as written is a bug, not a line
 *    · tests/trainer.check.js replays all of them in pure Node, in milliseconds
 *    · the board never compares hand-typed strings — it compares square indices
 *
 *  So a typo in a line here fails a test instead of teaching somebody the wrong move.
 *  [[accuracy-above-all]]
 *
 *  ══ WHAT A "VARIATION" IS HERE ══════════════════════════════════════════════════════
 *  Each entry is one of WHITE'S systems against the Pirc, plus Black's answer to it. The
 *  `line` runs both sides — that is deliberate, and it is the whole difference between
 *  this and Tabiya (/games/pirc-protocol/). Tabiya drills you on the book and STOPS when it
 *  stops. The Trainer scripts both sides through the book so you reliably ARRIVE at the
 *  tabiya, then hands White to the engine and makes you play the middlegame you just
 *  set up. Getting into the line is the warm-up; the game after it is the point.
 *
 *  `plan` is what Black is actually trying to do once the book runs out. It is the only
 *  prose here and it is load-bearing — a student who reaches move 8 with no idea what the
 *  position wants has learned a move order, not an opening.
 *
 *  API (window.PJCCPircBook / require):
 *    VARIATIONS -> [ {id, name, eco, white, line, plan, note} ]  (raw, SAN)
 *    LEVELS     -> [ {id, name, elo, blurb} ]                    (the six opponents)
 *    resolve(id)-> { id, name, eco, white, plan, note,
 *                    plies:[{san, from, to, promo, color, fen}], fen }   or null
 *    dial(level)-> { skill, blunder, movetime }  for PJCCGauntletEngine.move()
 *
 *  ⚠ resolve() NEVER THROWS. A line the referee cannot replay returns null and the caller
 *  drops it, exactly as pjcc-openings.js drops an unresolvable row — a trainer that is
 *  missing one variation is a working trainer; one that throws on load is a dead page.
 */
(function (root, factory) {
  /* ⚠ `root` IS PASSED INTO THE FACTORY, and it has to be: dial() looks up the shared
     engine bridge on it at call time. The wrapper's own parameter is NOT in the factory's
     scope, and reaching for it there is a ReferenceError that only fires when somebody
     picks a level — i.e. never during a page load, and never in a source review. In Node
     there is no global to hand over, so the factory gets a bare object and takes the
     fallback branch, which is exactly what the test wants to exercise. */
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./pjcc-chess.js'), {});
  else root.PJCCPircBook = factory(root.PJCCChess, root);
}(typeof self !== 'undefined' ? self : this, function (C, root) {
  'use strict';

  /* ══ THE IDEA THE WHOLE REPERTOIRE IS AN ARGUMENT FOR ════════════════════════
     2026-08-31. An opening is not a move list, it is a POSTURE, and a student who can
     recite fourteen plies without knowing the posture has memorized a phone number. This is
     the one paragraph that turns the room from a drill into somebody's opening.

     ⛑⛑ THE TEACHER IS **MICHAEL**, AND NATE SPENT THAT REVEAL HIMSELF ON 2026-09-01
     (*"go ahead and call teacher Michael"*). Do not quietly walk it back.

     In canon the Pirc belongs to Michael — the Chess City rival, *"acts as God would,
     always"*, who teaches the opening to Princess. He was written in this voice from the
     first draft and shipped unsigned for one day, because he has **NO FILE AND NO PAGE**:
     `_characters/Michael.md` and `_evolutions/rival.md` were deleted in 4ce0b46
     (2026-07-05) and he survives only in `private/FUTURE-IDEAS.md`. So this is a reveal
     with a genuine cost, and it was Nate's to make rather than mine.

     ⭐ WHAT IT ACTUALLY PUTS ON THE INTERNET: a NAME under a paragraph, and nothing else.
     There is no page to reach, no card in the cast grid, no entry on the map — the same
     shape as Robert appearing as a bot before his page was ever unhidden, except that
     Michael has no hidden page either. A name with nothing behind it is a question, not a
     disclosure, which is the cheapest possible version of this reveal.
     ⚠⚠ SO THE COST LANDS LATER, NOT NOW. The day Michael gets a character page, that page
     inherits an audience that has already met him here. Anything written for him must agree
     with this paragraph — it is now his oldest public line. [[slow-roll-cast]]
     ⚠ `test:trainer` now asserts the attribution RENDERS. The old gate asserted the
     opposite, which is exactly right for the day before the decision and wrong after it. */
  var TEACHER = 'Michael';
  var CREED =
    'You are going to let him have the middle of the board. Not because you cannot fight ' +
    'for it — because you are not interested in fighting for it yet. You build behind your ' +
    'own lines, you finish your house, you put the bishop on the long diagonal where it can ' +
    'see all the way across. Then, when he has pushed everything forward and there is nothing ' +
    'left at home, you take the center back. Whoever holds the middle on move six is not the ' +
    'same person who holds it on move twenty.';

  /* ══ THE OTHER CHAIR (2026-09-01, idea #9: "play the Austrian as White against your own
     defense") ═══════════════════════════════════════════════════════════════════════════
     ⚠⚠ THIS ONE IS NOT MICHAEL'S AND MUST NOT BE ATTRIBUTED TO HIM. The creed above is a
     character's posture, written in his voice; he plays the Pirc, he does not play against
     it. A white-side "creed" signed by the same man would be the character arguing with
     himself, which is the cheapest way to make a voice stop meaning anything.
     ⭐ So this is the ROOM talking — instructional register, no byline, and the page prints
     no <cite> under it. It is mine, and it is the kind of copy that is mine to write
     ([[text-changes-need-approval]]: UI copy me, lore and voice him). If Nate wants a
     character on this side of the board, that is a different and larger decision than a
     paragraph. */
  var CREED_W =
    'Now you are the one with the space, and space is not a gift — it is a loan, and the ' +
    'interest is time. Every pawn you push is another square you have to defend and another ' +
    'piece that has to stay home to do it. He is going to finish his house, keep every piece ' +
    'on a square it likes, and wait for you to overreach; that is not him being passive, that ' +
    'is the entire plan. Play this side honestly and you will find out which of your moves he ' +
    'was hoping for.';

  /* ══ THE REPERTOIRE ═══════════════════════════════════════════════════════════════
     Six of White's systems, in the order a Pirc player actually meets them. The first
     three are the lines the Tabiya room already teaches and the accuracy suite already
     re-proves (tests/validate-chess.js §4) — they are repeated here rather than imported
     because Protocol stores them as pre-resolved UCI pairs for its canvas, and SAN is the
     form a person can check. The two files agree; tests/trainer.check.js asserts it, so
     they cannot quietly drift apart.

     ⚠ EVERY LINE ENDS ON A BLACK MOVE. That is not cosmetic: the hand-off to the engine
     happens the instant the book runs out, and ending on White's move would hand the
     student a position with White already to move — the engine's first act would be to
     move again before the student had touched the position they just built. */
  var VARIATIONS = [
    {
      id: 'classical',
      name: 'The Classical',
      eco: 'B08',
      white: 'Two Knights — 4.Nf3 and 5.Be2',
      line: 'e4 d6 d4 Nf6 Nc3 g6 Nf3 Bg7 Be2 O-O O-O c6 a4 e5',
      why: 'He builds quietly and asks you no questions, so you are allowed to build too. Nobody is punished for patience in this one — which is exactly why it is the line to know first. Learn what the position WANTS here and the sharp ones stop looking like different openings.',
      whyW: 'The quiet way, and the honest one. You take the center that is offered and nothing more, then ask him a question every move until one of them has no good answer. The trap on this side is boredom: the position hands you nothing to attack, so the temptation is to invent something. Every player who loses to the Pirc as White loses to that temptation.',
      plan: 'The main line, and the one to know cold. White builds quietly, so you strike ' +
            'in the center on your own terms: …c6 and …e5 stake out d4, and if the center ' +
            'closes your play is …Nbd7, …Qc7 and a break with …f5. The g7 bishop is your ' +
            'best piece — never trade it off cheaply.',
      note: 'Solid. Start here.'
    },
    {
      id: 'austrian',
      name: 'The Austrian Attack',
      eco: 'B09',
      white: 'The big pawn storm — 4.f4',
      line: 'e4 d6 d4 Nf6 Nc3 g6 f4 Bg7 Nf3 O-O Bd3 Na6 O-O c5',
      why: 'He throws the whole front of the board at you. Let him. A wall pushed that far forward has nothing standing behind it, and every pawn he advances is one that is never coming back to defend. Your job is not to survive the storm — it is to still be standing when it has spent itself.',
      whyW: 'Four pawns pointed at his king and about ten moves to use them. This is the most fun anybody has against the Pirc and the fastest way to lose to it — if the storm stalls, every square you pushed past is a hole, and he has been waiting all game for exactly that. Play it from this side once and you will never again wonder why Black invites it.',
      plan: 'The sharpest thing White has, and the reason people fear the Pirc. White wants ' +
            'e5 and f5 with mate on the h-file; you answer a big center the classical way — ' +
            'by hitting it. …c5 and …Na6 pressure d4 immediately. If White ever plays e5, ' +
            'the d4 pawn is loose and the g7 bishop wakes up on the long diagonal.',
      note: 'Sharp. Both kings get chances.'
    },
    {
      id: 'attack150',
      name: 'The 150 Attack',
      eco: 'B07',
      white: 'Be3, Qd2, f3 — then castle long',
      line: 'e4 d6 d4 Nf6 Nc3 g6 Be3 Bg7 Qd2 c6 f3 b5 Nge2 Nbd7',
      why: 'He is coming for your king with a plan he read in a book, and he is going to get there in about nine moves. You are coming for his with the same idea and one extra tempo. This line is not about defending; it is about counting honestly and then racing.',
      whyW: 'A plan you can memorize: bishop, queen, f3, castle long, then throw the h-pawn at him. It works often enough to be worth knowing, and it is a race that can be lost by a single tempo. Count the moves to each king honestly before you commit to it, because after move ten there is no version of this where you get to change your mind.',
      plan: "The club player's Pirc-killer: Be3, Qd2, f3, Bh6 to trade your good bishop, then " +
            'h4-h5. It is a race, and you are not behind in it. White castles queenside, so ' +
            'your pawns go there: …c6 and …b5 first, …a5 and …b4 next, and the a- and b-files ' +
            'open toward the king you are aiming at.',
      note: 'Opposite castling. Count tempi, not pieces.'
    },
    {
      id: 'byrne',
      name: 'The Byrne Variation',
      eco: 'B07',
      white: 'The early pin — 4.Bg5',
      line: 'e4 d6 d4 Nf6 Nc3 g6 Bg5 Bg7 Qd2 h6 Bh4 c6 O-O-O b5',
      why: 'He pins the knight before you can castle and waits for you to flinch. Ask the bishop what it actually wants — it turns out to want very little, and the moment it retreats it stops being a threat and starts being a target.',
      whyW: 'The pin is a question, not a threat. Ask it early and watch what he does — then be honest about what the bishop is actually accomplishing three moves from now. On this side you learn the thing that makes the line hard for Black: the answer is inconvenient rather than difficult, and inconvenient is enough at a real board.',
      plan: 'White pins the f6 knight before you can castle and hopes for Bh6 or e5 tricks. ' +
            '…h6 asks the bishop the question at once — it retreats to h4 and stops being a ' +
            'threat and starts being a target. After White castles long you get the same ' +
            'queenside race as the 150, and you are already a move up on it.',
      note: 'Ask the bishop early.'
    },
    {
      id: 'fianchetto',
      name: 'The Fianchetto',
      eco: 'B07',
      white: 'Quiet and symmetrical — 4.g3',
      line: 'e4 d6 d4 Nf6 Nc3 g6 g3 Bg7 Bg2 O-O Nge2 e5 O-O Nc6',
      why: 'He offers you a draw without ever saying the word. Decline it by taking the center he was too polite to claim. The mistake here is impatience: there is nothing to punish yet, so improve a piece and let him be the one who commits.',
      whyW: 'You decline the fight and play chess. There is no refutation here, only the slow argument about who used their pieces better — which is a genuinely good way to beat somebody who turned up prepared for a brawl. It is also the line that teaches a Pirc player the most, because it takes away the counterattack and leaves only the position.',
      plan: 'White declines the fight and mirrors your bishop. Nothing is going to be handed ' +
            'to you, so take the center: …e5 and …Nc6 hit d4, and the position becomes a ' +
            "King's Indian where White has not committed to c4. Play …exd4 only when it wins " +
            'you a square — otherwise keep the tension and improve pieces.',
      note: 'Quiet. Patience beats aggression here.'
    },
    {
      id: 'lion',
      /* ⛑ HIS NAME FOR IT, 2026-08-31. He was thinking of the Lion's Jaw and confirmed it
         is this line; "call it the Lion Variation". The id stays `lion` — an id is a key,
         not a label, and renaming it would orphan nothing but would churn the test output
         for no gain. [[text-changes-need-approval]] */
      name: 'The Lion Variation',
      eco: 'B07',
      white: 'Your OWN setup — 3…Nbd7 and …e5',
      line: 'e4 d6 d4 Nf6 Nc3 Nbd7 Nf3 e5 Bc4 Be7 O-O O-O a4 c6',
      why: 'You do not answer him at all. You build the same house every single game and dare him to knock it down. It is the least fashionable idea in the repertoire and the hardest to play against, because there is nothing to prepare FOR.',
      whyW: 'He is building the same house he always builds and he does not care what you do. You get to choose the ground, which sounds like an advantage until you notice there is nothing to aim at. Take space, keep your pieces flexible, and do not go hunting a knockout that is not there — that hunt is the whole reason the setup works.',
      plan: 'The Pirc move order without the fianchetto: …Nbd7 supports …e5 straight away, ' +
            'and the pawn on e5 holds the center while you finish developing behind it. Slow, ' +
            'solid and very hard to break down. Your plans are …Qc7, …Re8 and a break with ' +
            '…d5 when the pieces are ready, or …Nf8-g6 to reinforce the kingside.',
      note: "Black's own system, not a reaction."
    }
  ];

  /* ══ THE SIX OPPONENTS ═════════════════════════════════════════════════════════════
     Nate: "6 different levels — true beginner opponent all the way to perfect play."

     ⭐ THE RATING IS THE DIAL, AND IT IS THE SITE'S EXISTING DIAL. Strength is not
     hand-tuned here — the advertised elo is fed to `PJCCGauntletEngine.skillForElo()` and
     `blunderForElo()`, the same curve the Gauntlet's ten floors and the Park Tables bots
     ride. That matters because the last time a room hand-set its own numbers, "Medium"
     came out at ~1575 ([[park-tables-matchmaking]]). One curve, three rooms.

     ⚠ STOCKFISH SKILL 0 IS ALREADY ~1350, so the bottom four rungs all pin to skill 0 and
     get their weakness from the blunder rate and a short think instead. That is not a
     fudge — it is the only honest way to reach a beginner, because you cannot lower a
     dial past its own floor. [[bot-gate]]

     ⚠ "PERFECT PLAY" IS NATE'S WORD AND THE TIER NAME, AND THE BLURB IS THE TRUE ONE.
     Skill 20 at two seconds on a phone is a ~2400 engine, not a tablebase — it is far past
     any student who will ever open this page, which is what he means, but the copy says
     what it is rather than overclaiming. [[accuracy-above-all]] */
  var LEVELS = [
    { id: 1, name: 'Fresh Recruit',  elo: 350,  movetime: 200,  blurb: 'Knows the rules. That is about it.' },
    { id: 2, name: 'Weekend Player', elo: 600,  movetime: 320,  blurb: 'Sees one move ahead, some of the time.' },
    { id: 3, name: 'Club Regular',   elo: 900,  movetime: 500,  blurb: 'Punishes a free piece. Misses the rest.' },
    { id: 4, name: 'Tournament',     elo: 1250, movetime: 750,  blurb: 'Has a plan and sticks to it.' },
    { id: 5, name: 'Expert',         elo: 1700, movetime: 1100, blurb: 'You will need the whole opening to hold.' },
    { id: 6, name: 'Perfect Play',   elo: 2400, movetime: 2000, blurb: 'Full-strength engine. It does not blunder.' }
  ];

  /* The engine dial for a level. Reads the shared curve when the bridge is present and
     falls back to the same formula inline when it is not — the fallback exists because
     this module is also loaded in Node by the test, where no bridge is on the page.
     ⚠ MUST STAY THE SAME FORMULA as pjcc-gauntlet-engine.js; tests/trainer.check.js
     compares the two so a tuned curve there cannot silently leave this behind. */
  /* ⚑ dialFor(elo, movetime) — the same curve, addressed by RATING instead of by rung
     (2026-09-01, idea #1). Preparing for a named regular means playing at HIS strength, and
     the bench does not sit on this room's six rungs: Robert is 1800, Vince 1150, Kedar 1400.
     Rounding him to the nearest rung would be drilling against a different opponent and
     calling it his name.
     ⚠ IT IS THE SAME TWO FUNCTIONS, NOT A SECOND CURVE. dial() is now a lookup that hands
     its rung's elo to this — so the day skillForElo changes, both doors move together, which
     is the whole reason §5 of test:trainer compares this file against the engine bridge. */
  function dialFor(elo, movetime) {
    var E = root && root.PJCCGauntletEngine;   // absent in Node, and that is the fallback's job
    var skill, blunder;
    if (E && E.skillForElo && E.blunderForElo) {
      skill = E.skillForElo(elo);
      blunder = E.blunderForElo(elo);
    } else {
      skill = elo < 1400 ? 0 : Math.min(20, Math.round(3 + (elo - 1400) * 0.017));
      blunder = blunderFallback(elo);
    }
    return { skill: skill, blunder: blunder, movetime: movetime };
  }
  function dial(level) {
    var L = null, i;
    for (i = 0; i < LEVELS.length; i++) if (LEVELS[i].id === level) L = LEVELS[i];
    if (!L) L = LEVELS[0];
    return dialFor(L.elo, L.movetime);
  }

  var BLUNDER_LADDER = [
    [350, 0.36], [500, 0.28], [650, 0.20], [800, 0.16], [950, 0.10],
    [1100, 0.03], [1250, 0.02], [1400, 0.01], [1600, 0.00], [1800, 0.005]
  ];
  function blunderFallback(elo) {
    elo = +elo || 0;
    var L = BLUNDER_LADDER, i;
    if (elo <= L[0][0]) return L[0][1];
    for (i = 1; i < L.length; i++) {
      if (elo <= L[i][0]) {
        var a = L[i - 1], b = L[i], t = (elo - a[0]) / (b[0] - a[0]);
        return Math.round((a[1] + (b[1] - a[1]) * t) * 1000) / 1000;
      }
    }
    return 0;
  }

  /* ══ SAN -> SQUARES, THROUGH THE REFEREE ═════════════════════════════════════════════
     The only way a move enters the trainer. Each token is matched against the referee's
     OWN generated SAN for every legal move in the position, so "Nbd7" has to be the move
     the engine calls Nbd7 — disambiguation, check suffixes and all. A token that matches
     nothing aborts the whole line (returns null); a half-resolved line is worse than none,
     because it would strand the student mid-book with no next move. */
  function resolve(id) {
    if (!C) return null;
    var v = null, i;
    for (i = 0; i < VARIATIONS.length; i++) if (VARIATIONS[i].id === id) v = VARIATIONS[i];
    if (!v) return null;
    try {
      var S = C.parseFEN(), toks = v.line.trim().split(/\s+/), plies = [];
      for (i = 0; i < toks.length; i++) {
        var mv = C.legalMoves(S), hit = null;
        for (var j = 0; j < mv.length; j++) {
          if (C.toSAN(S, mv[j]) === toks[i]) { hit = mv[j]; break; }
        }
        if (!hit) return null;
        plies.push({
          san: toks[i], from: hit.from, to: hit.to, promo: hit.promo || null,
          color: S.turn, fen: null
        });
        S = C.makeMove(S, hit);
        plies[plies.length - 1].fen = C.toFEN(S);
      }
      return {
        id: v.id, name: v.name, eco: v.eco, white: v.white, plan: v.plan, why: v.why, whyW: v.whyW,
        note: v.note, plies: plies, fen: C.toFEN(S)
      };
    } catch (e) { return null; }
  }

  /* Every variation that resolves, in order. The trainer's menu is built from THIS, not
     from VARIATIONS — so a line that stops replaying cleanly disappears from the room
     rather than becoming a card that opens onto a broken board. */
  function all() {
    var out = [], i, r;
    for (i = 0; i < VARIATIONS.length; i++) { r = resolve(VARIATIONS[i].id); if (r) out.push(r); }
    return out;
  }

  return {
    CREED: CREED,
    TEACHER: TEACHER,
    CREED_W: CREED_W,
    dialFor: dialFor,
    VARIATIONS: VARIATIONS,
    LEVELS: LEVELS,
    resolve: resolve,
    all: all,
    dial: dial
  };
}));
