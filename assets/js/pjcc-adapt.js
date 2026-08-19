/*! pjcc-adapt.js — AN OPPONENT THAT PLAYS AT YOUR LEVEL          (2026-08-17)
 * =============================================================================
 * 2026-08-17, Nate: *"Perhaps it's an adaptive bot that plays based on the moves of
 * the user. We could also add an adaptive bot to the park tables."*
 *
 * ══ THE ONE IDEA ═════════════════════════════════════════════════════════════
 * A seat on this bench declares a rating and plays it. This one declares that it
 * has no fixed rating, and finds yours.
 *
 * It works because the bot is ALREADY searching every position — so its own
 * evaluation of the board is a free, per-move read on how the game is going. No
 * second engine, no extra thinking time, no new worker. `pjcc-gauntlet-engine.js`
 * stamps that score on the move it returns; this file turns the sequence of scores
 * into a playing strength and hands it back to the room as an Elo.
 *
 *     score (bot POV)  →  win% for the PLAYER  →  error from 50%  →  Elo nudge
 *
 * ══ WHY WIN%, AND NOT CENTIPAWNS ═════════════════════════════════════════════
 * Centipawns do not saturate: +900 and +2400 are both "completely winning", but a
 * raw-cp controller would treat the second as nearly three times the first and slam
 * the dial. Win% is the same curve the Game Review already grades moves on
 * (`winPct`, Lichess's constant), and it flattens at both ends exactly where a human
 * stops caring. Being up a queen and being up two queens should move this dial the
 * same amount, because they are the same sentence: "you are winning".
 *
 * ══ ⚠ IT CLIMBS FASTER THAN IT FALLS, AND THAT IS THE WHOLE ETHIC ════════════
 * `UP` is larger than `DOWN`. An opponent that rises to meet you reads as respect;
 * one that sinks the moment you slip reads as pity, and pity is the single worst
 * thing a teaching bot can transmit. So it comes up to your level briskly and backs
 * off reluctantly, and `FLOOR` means it can never collapse into a punching bag no
 * matter how badly a game goes.
 *
 * ⭐ THIS MAKES A LINE SHE ALREADY SAYS TRUE. Auston's `rough_patch` greeting has
 * promised *"Sit down. We will go slow and you will win something"* since the day
 * she shipped, and until now it was a kindness she had no way to deliver. The
 * adaptive dial is that sentence, implemented.
 *
 * ══ ⚠⚠ THE LEVEL IS NOT A RATING, AND MUST NEVER BE PRINTED AS ONE ═══════════
 * Where this dial settles is ENTANGLED with itself: the bot got weaker, so your
 * moves got cleaner, so the dial went up, so the bot got stronger. That feedback is
 * exactly what makes it a good OPPONENT and exactly what disqualifies it as a
 * MEASUREMENT. A number measured on a ruler that moved is not a measurement.
 *
 * ⚠⚠ THE PARAGRAPH THAT USED TO BE HERE WAS NOT TRUE, AND THAT IS WORTH KEEPING VISIBLE.
 * It said the rating run "does NOT read `level()`" and "takes its number from a fixed-depth
 * pass over the finished game, where nothing moved." There is no such pass anywhere in this
 * repo. `/rating/game/` reads `settled()` — the median of the second half of this very dial —
 * and always has. A comment describing a safeguard that was never built is worse than no
 * comment: it is the file telling the next reader that a problem is handled.
 * [[audit-numbers-can-be-wrong]]
 *
 * ══ SO WHAT ACTUALLY KEEPS IT HONEST ═════════════════════════════════════════
 * Not a second measurement — three admissions, and every surface that prints this number
 * must carry all three or it should not print it:
 *
 *   1. A MINIMUM LENGTH. Below 24 plies the dial is still traveling toward you, so its
 *      median is the SEED wearing a result's clothing. Short games get words, no number.
 *   2. A BAND, NOT A POINT. ±140 tightening toward ±90. The entanglement above is real —
 *      the ruler moved while it measured — and the band is the width of that doubt.
 *   3. THE SENTENCE "one game is one game."
 *
 * Both doors that print it (`/rating/game/` and Auston's table at the Park Tables) use the
 * same `settled()`, the same minimum, and the same band, on purpose: two different numbers
 * out of two identical procedures would be the site disagreeing with itself in front of a
 * player. If this estimate ever gets better, it gets better in one place.
 * [[accuracy-above-all]]
 *
 * Browser: window.PJCCAdapt. Node: require (for tests/adapt.check.js + sim-adapt.js).
 * ============================================================================= */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PJCCAdapt = factory();
}(typeof self !== 'undefined' ? self : this, function () {
'use strict';

/* ── THE ROAD THE DIAL RUNS ON ─────────────────────────────────────────────────
   The public ladder's own ends: Maxwell at 400 is the gentlest seat on the bench and
   the CEO at 2400 is the hardest thing on the site. An adaptive seat that could travel
   outside that range would be advertising strengths no other room can produce, and
   `skillForElo` has no road out there either — it clamps, so the dial would silently
   stop moving while still reporting numbers. Keep these two IN the ladder.
   ⚠ MIN is 400 and not 350: below Maxwell the only lever left is `blunder`, and a bot
   whose weakness is "one move in three is random" does not feel weaker, it feels
   broken — which is the opposite of what somebody on a losing run needs. */
var MIN = 400, MAX = 2400;

/* Where it starts before it knows anything about you. 900 is the middle of the range
   people actually arrive at — the same reason the puzzle run starts its estimate at 900
   rather than at the midpoint of its scale. Starting low would flatter; starting high
   would drive people off in six moves. */
var SEED = 900;

/* ── HOW FAST IT MOVES ─────────────────────────────────────────────────────────
   Elo per point of win-% error, per bot move. The asymmetry is the ethic above.
   ⭐ THE SIZE COMES FROM THE GAME LENGTH, not from taste: a park game runs 30-45 of
   its moves, and the dial has to be able to cross a 500-point gap inside ONE game or
   it is not adaptive, it is a slow-motion difficulty setting. At UP=0.34 a player who
   is plainly winning (error ≈ +40) gains ~13.6 Elo a move, so ~35 moves covers 480.
   Any faster and the strength visibly lurches between moves, which reads as the engine
   glitching rather than as an opponent settling. */
var UP = 0.34, DOWN = 0.22;

/* The dial may not fall more than this far below its own high-water mark inside one
   game. Without it a single bad patch drags a 1600 player's opponent to 400 and the
   rest of the game is worthless to both of them. */
var FLOOR = 260;

/* ⚠ SMOOTHED, BECAUSE ONE MOVE IS NOT A TREND. A single hanging piece swings win% by
   30 points and would jerk the dial 10 Elo on its own; two moves later it is recaptured
   and the swing reverses. The EMA means the dial answers to how the game is GOING, and
   a real change of fortune still reaches it within three or four moves. */
var SMOOTH = 0.4;

/* Centipawns are folded to this before anything else touches them — the same cap and
   the same mate-folding the Game Review uses, so both rooms agree about what "winning"
   means. [[review-accuracy-calibration]] */
var CAP = 1500;

function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

/* Lichess's win-% curve, identical to pjcc-game-review.js. ⚠ IF ONE OF THESE TWO EVER
   CHANGES, CHANGE BOTH — a dial and a grader that disagree about what a position is
   worth will quietly tell a player two different stories about the same game. */
function winPct(cp) { return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * clamp(cp, -CAP, CAP))) - 1); }

/* ── A TRACKER ─────────────────────────────────────────────────────────────────
   One per game. Stateless between games except for whatever the room chooses to carry
   forward with `seed` — which is how Auston remembers your strength from last time.  */
function create(opts) {
  opts = opts || {};
  var min   = opts.min != null ? opts.min : MIN;
  var max   = opts.max != null ? opts.max : MAX;
  var level = clamp(opts.seed != null ? opts.seed : SEED, min, max);
  var start = level, peak = level, ema = null, n = 0;
  var track = [level];

  return {
    /* Feed the bot's own evaluation of the position it just searched.
       `scoreCp` is from the SIDE TO MOVE at that position — which is the bot, because
       the bot searches after you have moved. Positive therefore means the BOT is better.
       ⚠ null/undefined is a legitimate answer and means "no signal this move": the
         engine fell back, or the bridge is an older build with no score on it. The dial
         must not move on a guess, so it does not move at all. [[accuracy-above-all]] */
    note: function (scoreCp) {
      if (scoreCp === null || scoreCp === undefined || !isFinite(scoreCp)) return level;
      var playerWin = winPct(-scoreCp);                 // flip to the player's point of view
      ema = (ema === null) ? playerWin : (ema + SMOOTH * (playerWin - ema));
      n++;
      /* ⚠ NOTHING HAPPENS FOR THE FIRST FEW MOVES, ON PURPOSE. Every opening evaluates
         near zero, so the error is near zero and the dial would only be reacting to
         engine noise. Waiting also means the bot plays its seeded strength out of the
         gate, which is what makes a rematch feel like it remembered you. */
      if (n < 4) { track.push(level); return level; }
      var err = ema - 50;                               // >0 = the player is doing well
      level = clamp(level + err * (err > 0 ? UP : DOWN), min, max);
      if (level > peak) peak = level;
      level = clamp(level, Math.max(min, peak - FLOOR), max);
      track.push(Math.round(level));
      return level;
    },

    level:  function () { return Math.round(level); },
    peak:   function () { return Math.round(peak); },
    start:  function () { return Math.round(start); },
    track:  function () { return track.slice(); },
    moves:  function () { return n; },

    /* ── WHERE IT ENDED UP ─────────────────────────────────────────────────────
       The median of the second half of the track, not the last value and not the mean.
         · NOT THE LAST VALUE: the final few moves of a decided game push the dial hard
           in one direction and describe the mop-up, not the contest.
         · NOT THE MEAN: it would carry the seed — a number chosen before the game — into
           a summary of the game.
         · THE SECOND HALF: the first half is the dial still traveling toward you.
       ⚠ This is a description of the OPPONENT, not of you. See the header. */
    settled: function () {
      if (track.length < 4) return Math.round(level);
      var half = track.slice(Math.floor(track.length / 2)).sort(function (a, b) { return a - b; });
      var m = Math.floor(half.length / 2);
      return Math.round(half.length % 2 ? half[m] : (half[m - 1] + half[m]) / 2);
    }
  };
}

return {
  create: create,
  winPct: winPct,
  MIN: MIN, MAX: MAX, SEED: SEED, UP: UP, DOWN: DOWN, FLOOR: FLOOR
};
}));
