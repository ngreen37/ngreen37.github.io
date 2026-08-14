/* =============================================================================
 * AUSTON REMEMBERS — the one regular at the Park Tables who notices things
 * -----------------------------------------------------------------------------
 * 2026-08-13, Nate: *"Let's build out the Auston bot - I love the idea of the bot
 * remembering what happened last time. Perhaps it mentions how many credits the user
 * currently has 'did you sacrifice some? Because you used to have a lot. Or did you go
 * on a shopping spree?' - it knows and remembers what happened in other games with
 * other opponents. We can REALLY do something special here."*
 *
 * ══ WHY IT IS HER, AND ONLY HER ══════════════════════════════════════════════
 * Every other seat on the bench is a strength. Auston is a PERSON who is also a
 * strength, and the canon already said which person: *"quietly the sharpest
 * pattern-spotter in the family"*, the one who *"never left the board"*, who runs
 * Bootcamp and *"isn't shy about telling him when he's wrong"*. Noticing is her
 * characterization, not a feature bolted to a difficulty level.
 *
 * That is also why the other seven stay silent. If every bot talked, talking would be
 * ambience and nobody would read it by the third game. One regular who remembers is a
 * character; eight are a notification system. Giving this to Auston costs the other
 * seats nothing and makes sitting at HER table a different thing from sitting at Robert's
 * — which is the whole "living lobby / tables with personalities" direction the Park
 * Tables build-out is already pointed at.
 *
 * ══ THE ONE ARCHITECTURAL IDEA ═══════════════════════════════════════════════
 * WHAT SHE NOTICES and WHAT SHE SAYS are separate, and the seam is deliberate.
 *
 *     snapshot()  → what is true right now (credits, rating, wins, collection…)
 *     observe()   → structured OBSERVATIONS: {kind, weight, data} — no prose at all
 *     LINES       → the words, keyed by kind. ⚠ THIS TABLE IS NATE'S.
 *
 * The observer is machinery and it is mine. The lines are voice and they are his, so
 * they sit in ONE table at the top of ONE file, with tokens instead of logic in them —
 * he can rewrite any line, or all of them, without reading a word of the code under it.
 * Nothing below LINES contains a sentence a visitor will ever see.
 *
 * ══ WHAT IT NEEDS, AND WHAT IT DOES WITHOUT ══════════════════════════════════
 * NOTHING here requires an account. Signed out she still remembers the games you have
 * played (localStorage), still knows who you have beaten, still counts your streak
 * against her — she just cannot see credits or ratings, so those observations never
 * fire. She never says "sign in to unlock" about it: an observation she cannot make is
 * one she does not mention, which is what a person would do.
 *
 * ⚠ SHE MUST NEVER CLAIM TO KNOW SOMETHING SHE DOES NOT. Every line is generated from a
 * measured delta, never from a guess. The credit line offers TWO readings ("sacrifice or
 * a spree?") precisely because the number is all she has — she saw the balance move, she
 * did not see where it went, and asking is honest where asserting would be a lie the
 * player can catch. When a bot is caught being wrong about you, everything else it ever
 * said becomes noise.
 *
 * ⚠ ONE THING, ONCE. She says a single line when you sit down and a single line when the
 * game ends, and the greeting disappears the moment you make your first move. The
 * failure mode of a talkative bot is not that it is annoying, it is that it becomes
 * unreadable — and a line nobody reads is worse than silence, because it also cost the
 * player the belief that anything here is worth reading.
 * ============================================================================= */
(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════════════════════════════════
   *  ⚠⚠ NATE — THIS TABLE IS YOURS. EVERYTHING SHE EVER SAYS IS IN IT. ⚠⚠
   *
   *  Each `kind` is something she NOTICED; the array under it is what she might say
   *  about it. She picks one at random, avoiding the one she used last time, so two or
   *  three variants per kind is what keeps her from sounding like a vending machine.
   *
   *  Tokens get replaced with real values — leave the braces on:
   *      {now} {was} {n} {who} {days} {games} {you}
   *  {you} is the player's codename, and it is the only one that can be missing: signed
   *  out there is no name, so any line using it is simply never offered.
   *
   *  To silence an observation entirely: give it an empty array. To add a variant:
   *  add a string. There is no other wiring to touch.
   * ══════════════════════════════════════════════════════════════════════════════════ */
  var LINES = {

    /* ── sitting down ─────────────────────────────────────────────────────────── */

    first: [
      "First time at my table. I run Bootcamp up at the Academy, so I have watched people lose in every way there is and I have never once laughed. Sit down.",
      "You are new. Good. I am not the strongest player in Checker Town — I am just the one who never left the board. Best place to start."
    ],

    // his own example, near-verbatim
    credits_down_big: [
      "Hold on. You had {was} credits last time and now you have {now}. Did you sacrifice some? Because you used to have a lot. Or did you go on a shopping spree?",
      "{was} down to {now}. That is not a rounding error. Altar, or shopping?"
    ],
    credits_down: [
      "You are down {n} credits since I last saw you. Sacrifice or spree? I am not judging, I am just noticing.",
      "{now} credits. That is {n} fewer than last time. Something happened and I want to hear about it after."
    ],
    credits_up_big: [
      "{n} more credits than the last time you sat here. Okay. What did you find?",
      "You left with {was} and came back with {now}. Whatever you have been doing, keep doing it."
    ],
    credits_up: [
      "Up {n} credits since last time. Somebody has been busy.",
      "{now} credits now. That is {n} more than I remember. Noted."
    ],

    rating_up: [
      "Your rating went {was} to {now} since we last played. I notice things. It is the only thing I am better at than my brother.",
      "{now} now, up from {was}. That is going to show up in this game and we will both see it."
    ],
    rating_down: [
      "Rating slipped a bit since last time. It does that. It is a number that measures a week, not a person.",
      "{was} to {now}. You have been playing people who beat you. That is how it is supposed to work."
    ],

    beat_someone: [
      "You beat {who} since we last played. {who}. Okay, I am paying attention now.",
      "Word travels. You took a game off {who}. Sit down, let us see if it was a fluke."
    ],
    unlocked: [
      "You beat {who} and a seat opened up that you could not sit at before. I would say I am impressed but you would get big-headed.",
      "{who} went down. There is a chair further up the row with your name on it now."
    ],
    rough_patch: [
      "You have lost {n} in a row out there. Sit down. We will go slow and you will win something.",
      "{n} straight losses since I saw you. Everybody has a week like that. Play me, I am beatable."
    ],

    streak_you: [
      "That is {n} in a row you have taken off me. I am going to stop going easy. I was not going easy.",
      "{n} straight. Fine. Show me again."
    ],
    streak_her: [
      "{n} in a row to me. I am not going to pretend I do not like that. Your move.",
      "That is {n} for me now. Courage is staying in the chair one more move than the fear wants. Sit."
    ],

    last_resign: [
      "Last time you resigned. You were worse, but you were not lost. Play it out today.",
      "You gave up the last one. I have lost games I had already resigned in my head — play this one to the end."
    ],
    last_mate: [
      "Last time I mated you. I have thought about that game more than you have, which is a little sad for me.",
      "I finished you off last time. You know that. I know that. Let us go."
    ],
    last_long: [
      "{n} moves the last time we played. Longest anybody has sat with me in a while.",
      "Our last one went {n} moves. I liked it. Same again."
    ],

    long_time: [
      "It has been {days} days. I kept the seat.",
      "{days} days. I was starting to think you had found a better table."
    ],
    back_soon: [
      "Back already. Good.",
      "That was quick. Sit."
    ],
    busy: [
      "{games} games since you last sat with me. You have been getting around.",
      "You have played {games} games out there since our last one. I hope some of it rubbed off."
    ],

    puzzle_up: [
      "Your puzzle rating is up to {now}. That shows up here, you know. It always does.",
      "{now} on the puzzles now. Tactics do not stay in the puzzle room."
    ],
    shopping: [
      "You have {n} new things in your collection since last time. Show me after the game.",
      "Something new in your case, I see. {n} of them. After."
    ],

    // the fallback — she has nothing to report, and says so like a person would
    nothing: [
      "Board is ready. Your move.",
      "Nothing new to report. Let us play.",
      "Same as ever. You are White."
    ],

    /* ── SHE IS SOMEWHERE ELSE TODAY ──────────────────────────────────────────────
       ⚠ These two are NOT spoken at the board — they are what her empty seat says in
       the lobby, so they are the only lines here written in the third person. Keep
       them SHORT: this one is read by somebody who wanted to play and cannot. */
    away: [
      "Not at the tables today.",
      "Away today. Back tomorrow.",
      "Up at the Academy today."
    ],
    // the first thing she says the day after she was gone
    was_away: [
      "I was up at the Academy yesterday. Bootcamp does not run itself. Sit down.",
      "You came by and I was not here. I know. I am here now."
    ],

    /* ── SHE IS THE ONLY ONE WHO USES YOUR NAME ───────────────────────────────────
       {you} is your codename. ⚠ Only ever offered when you are signed in AND have one —
       there is no fallback nickname, because a bot inventing a name for you is the exact
       opposite of the effect. Signed out, she simply never reaches for it. */
    by_name: [
      "{you}. Sit down.",
      "There you are, {you}.",
      "{you}. I was hoping you would come by."
    ],

    /* ── the game ending ──────────────────────────────────────────────────────── */

    end_first_win: [
      "That is your first win over me. I am not going to make a thing of it. …okay, it is a thing. Well played.",
      "First one you have taken off me. I have been waiting to lose that game to somebody who earned it."
    ],
    end_win_you: [
      "Good game. You saw it before I did.",
      "That is yours. I will want it back."
    ],
    end_revenge: [
      "You lost the last one and won this one. That is the whole trick, you know. That is all it ever is.",
      "Beaten last time, winner this time. My brother would call that a comeback. I would call it homework."
    ],
    end_win_her: [
      "Mine. Want it back? I will be right here.",
      "That is mine. Sit down again whenever you are ready."
    ],
    end_draw: [
      "A draw. Neither of us blinked. I will take it.",
      "Split. That is a real result, whatever anyone tells you."
    ],
    end_resign: [
      "You resigned. I am not going to lecture you. …play the next one out.",
      "Resigned. Alright. Next one goes to the end, deal?"
    ],
    end_quick: [
      "{n} moves. That was fast. Again?",
      "Quick one. Reset it."
    ],
    end_long: [
      "{n} moves. That was a proper game. Thank you for that one.",
      "{n} moves and neither of us wanted to be the one to fold. Good."
    ]
  };

  /* ══ END OF THE WORDS. Everything below is machinery. ═══════════════════════════ */

  var LEDGER_KEY = 'pjcc.auston.v1';   // what she knew when you last sat down
  var LOG_KEY    = 'pjcc.pt.log.v1';   // every finished bot game, newest first
  var LOG_CAP    = 40;
  var SAID_CAP   = 5;                  // how many recent lines she avoids repeating

  /* ── HOW OFTEN SHE IS ELSEWHERE ─────────────────────────────────────────────────
     1 day in 11. Rolled off the TOWN DATE, never per page load, so the whole town
     agrees about today and a refresh cannot reroll her — the same rule the meteor
     shower and the aurora follow ([[rare-sky-events]]).
     ⭐ WHY THIS NUMBER: rare enough that most players never see it and the ones who do
     remember it, common enough that it is not a myth. At 1-in-11 a twice-a-week player
     meets her empty seat about five times a year. ⚠ Err RARE — a seat you wanted and
     could not have is a real cost, and the whole point is that it reads as a life
     rather than as an outage. */
  var AWAY_IN = 11;
  var MILESTONE = 10;                  // games against her before her glyph changes

  function readJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      var v = JSON.parse(raw);
      return (v === null || v === undefined) ? fallback : v;
    } catch (e) { return fallback; }
  }
  function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) { return false; }        // private mode / full quota — she just forgets
  }

  /* ── THE GAME LOG ────────────────────────────────────────────────────────────────
     Every finished bot game against ANY regular, because "it knows what happened in
     other games with other opponents" is half of what makes her worth talking to.
     Keys are one letter because this is localStorage and it is written on every game:
       b=bot id · r=result (from YOUR side, you are always White) · n=plies · w=why · t=when
     ⚠ Newest FIRST. Everything downstream assumes that, and a reversal would silently
       turn "your last game" into "your fortieth game ago". */
  function log() { var a = readJSON(LOG_KEY, []); return Array.isArray(a) ? a : []; }

  function logGame(rec) {
    if (!rec || !rec.bot || !rec.result) return;
    var a = log();
    a.unshift({ b: String(rec.bot), r: String(rec.result), n: rec.plies | 0,
                w: String(rec.reason || ''), t: Date.now() });
    if (a.length > LOG_CAP) a.length = LOG_CAP;
    writeJSON(LOG_KEY, a);
  }

  /* ── WHAT IS TRUE RIGHT NOW ──────────────────────────────────────────────────────
     ⚠ Every profile read is optional. Signed out, `prof` is null and the credit /
       rating fields come back null rather than 0 — and null vs 0 is load-bearing:
       "I cannot see your credits" and "you have no credits" are different sentences,
       and only one of them is true for a signed-out visitor. */
  function snapshot() {
    var P = window.PJCC, prof = null;
    try { prof = (P && P.getProfile) ? P.getProfile() : null; } catch (e) {}
    var owned = 0;
    try { owned = ((prof && prof.companion && prof.companion.owned) || []).length; } catch (e) {}
    var puzzle = null;
    try { if (P && P.puzzleRating) puzzle = P.puzzleRating().rating; } catch (e) {}
    var beaten = readJSON('pjcc.pt.beaten.v1', []);
    return {
      at:      Date.now(),
      credits: prof && typeof prof.credits === 'number' ? prof.credits : null,
      rating:  prof && typeof prof.pjcc_rating === 'number' ? prof.pjcc_rating : null,
      puzzle:  typeof puzzle === 'number' ? puzzle : null,
      owned:   owned,
      beaten:  Array.isArray(beaten) ? beaten : [],
      you:     myName()          // null when signed out — she then never reaches for it
    };
  }

  function ledger() {
    var l = readJSON(LEDGER_KEY, null);
    return (l && l.v === 1) ? l : null;
  }

  /* ── DERIVED, NEVER STORED ───────────────────────────────────────────────────────
     Her head-to-head record and her streak are READ OFF THE LOG rather than kept as
     counters in the ledger. A counter and a log can disagree; a derived number cannot
     be wrong about its own source. It is the same rule the bench's unlock set follows,
     and the same one that keeps the leaderboard legend honest. */
  function vsHer() {
    var mine = log().filter(function (g) { return g.b === 'auston'; });
    var w = 0, l = 0, d = 0, streak = 0, dir = 0;
    mine.forEach(function (g) {
      if (g.r === '1-0') w++; else if (g.r === '0-1') l++; else d++;
    });
    // the streak runs from the newest game back until the result changes
    for (var i = 0; i < mine.length; i++) {
      var r = mine[i].r;
      if (r === '1/2-1/2') break;
      var s = r === '1-0' ? 1 : -1;
      if (dir === 0) dir = s;
      if (s !== dir) break;
      streak++;
    }
    return { games: mine.length, w: w, l: l, d: d, streak: streak * dir, last: mine[0] || null };
  }

  /* ══ THE OBSERVER ═══════════════════════════════════════════════════════════════
     Produces every TRUE observation, each with a weight. Nothing here knows any words.

     THE WEIGHTS ARE A RANKING OF SURPRISE, not of importance. She gets to say one
     thing, so the question is never "what matters most" — it is "what would a person
     who had been paying attention lead with". A first meeting outranks everything; a
     big credit swing outranks a small rating drift; "nothing happened" is last on
     purpose and still exists, because a bot that only speaks when it has news is a bot
     that feels broken on a quiet day. */
  function observe(now, then) {
    var out = [], vs = vsHer();

    function add(kind, weight, data) { out.push({ kind: kind, weight: weight, data: data || {} }); }

    if (!then || !vs.games) {
      add('first', 1000);
      return out;                      // she has nothing else to go on yet
    }

    var since = then.at || 0;
    var recent = log().filter(function (g) { return g.t > since; });
    var days = Math.floor((now.at - since) / 86400000);

    /* — credits. His line, and the one he asked for by name. Two tiers, because "you
         spent 40" and "you spent 4,000" are not the same observation. Only fires when
         she can actually see both ends. — */
    if (now.credits !== null && then.credits !== null) {
      var dc = now.credits - then.credits;
      if (dc <= -500)     add('credits_down_big', 900, { now: now.credits, was: then.credits, n: -dc });
      else if (dc <= -80) add('credits_down',     620, { now: now.credits, was: then.credits, n: -dc });
      else if (dc >= 800) add('credits_up_big',   840, { now: now.credits, was: then.credits, n: dc });
      else if (dc >= 120) add('credits_up',       560, { now: now.credits, was: then.credits, n: dc });
    }

    /* — a seat opened, or you took down somebody she knows. Checked against HER copy of
         the beaten list, so "since we last played" is literally true. — */
    var fresh = now.beaten.filter(function (id) { return (then.beaten || []).indexOf(id) < 0; });
    if (fresh.length) {
      var who = botName(fresh[fresh.length - 1]);
      // beating Robert or Princess is what unlocks a seat — a bigger deal than a win
      var opensASeat = fresh.some(function (id) { return id === 'robert' || id === 'princess'; });
      add(opensASeat ? 'unlocked' : 'beat_someone', opensASeat ? 880 : 700, { who: who });
    }

    /* — how it has been going elsewhere. A rough patch is worth more than a good one:
         somebody on a losing run is the person most likely to close the tab, and she is
         the seat you are meant to be able to beat. — */
    if (recent.length >= 3) {
      var lost = 0;
      for (var i = 0; i < recent.length; i++) { if (recent[i].r === '0-1') lost++; else break; }
      if (lost >= 3) add('rough_patch', 800, { n: lost });
    }

    /* — the two of you — */
    if (vs.streak >= 3)  add('streak_you', 760, { n: vs.streak });
    if (vs.streak <= -3) add('streak_her', 720, { n: -vs.streak });

    if (vs.last) {
      if (vs.last.w === 'resignation')       add('last_resign', 660, { n: vs.last.n });
      else if (vs.last.w === 'checkmate' && vs.last.r === '0-1') add('last_mate', 500, { n: vs.last.n });
      if (vs.last.n >= 60)                   add('last_long',   540, { n: Math.ceil(vs.last.n / 2) });
    }

    /* — time and volume — */
    if (days >= 14)      add('long_time', 680, { days: days });
    else if (days >= 4)  add('long_time', 480, { days: days });
    if (days < 1 && recent.length) add('back_soon', 200);
    if (recent.length >= 4) add('busy', 460, { games: recent.length });

    /* — the quieter dials, which only get a turn on an otherwise uneventful day — */
    if (now.rating !== null && then.rating !== null) {
      var dr = now.rating - then.rating;
      if (dr >= 25)      add('rating_up',   580, { now: now.rating, was: then.rating, n: dr });
      else if (dr <= -25) add('rating_down', 420, { now: now.rating, was: then.rating, n: -dr });
    }
    if (now.puzzle !== null && then.puzzle !== null && now.puzzle - then.puzzle >= 40) {
      add('puzzle_up', 440, { now: now.puzzle, was: then.puzzle, n: now.puzzle - then.puzzle });
    }
    if (now.owned > (then.owned || 0)) {
      add('shopping', 400, { n: now.owned - (then.owned || 0) });
    }

    /* — you came by on a day she was elsewhere. Weighted just under a first meeting,
         because acknowledging a missed visit is the single most human thing she has to
         lead with, and it is only ever true once. — */
    if (missedDay() && missedDay() !== townDay()) add('was_away', 950);

    /* — your codename, which nobody else on the bench will ever use. Sits above
         `back_soon` and below every piece of real news, so it surfaces on a quiet day
         rather than displacing something she actually noticed. — */
    if (now.you) add('by_name', 300, { you: now.you });

    add('nothing', 1);
    return out;
  }

  function botName(id) {
    var B = window.PJCCParkBots;                 // the room publishes its own roster
    if (B && B[id] && B[id].name) return B[id].name;
    return id ? (id.charAt(0).toUpperCase() + id.slice(1)) : 'somebody';
  }

  /* ── YOUR NAME ───────────────────────────────────────────────────────────────────
     Null unless you are signed in and actually have a codename. ⚠ There is no fallback
     — "Operative" or "friend" would be a bot inventing a name for you, which is worse
     than never using one. When this is null the `by_name` observation simply is not
     offered, exactly like the credit lines when she cannot see your balance. */
  function myName() {
    try {
      var p = window.PJCC && PJCC.getProfile ? PJCC.getProfile() : null;
      var n = p && p.codename ? String(p.codename).trim() : '';
      return n || null;
    } catch (e) { return null; }
  }

  /* ── IS SHE HERE TODAY? ──────────────────────────────────────────────────────────
     ⚠⚠ THREE GUARDS, AND EACH ONE IS A BUG THAT WOULD OTHERWISE SHIP:

       1. NO CLOCK, NO ABSENCE. If `PJCC_TIME` has not loaded she is PRESENT. A missing
          optional dependency must never be able to close a seat — failing closed here
          would mean a script that did not load takes a bot off the bench and nothing
          says why ([[feature-shipped-but-never-loaded]]).
       2. AN UNFINISHED GAME OUTRANKS HER DAY OFF. If you have a board saved against
          her, she is here — being locked out of your own half-played game by a dice
          roll is the single worst thing this feature could do.
       3. IT IS A PURE FUNCTION OF THE DATE. No storage, no counter, nothing to desync;
          a refresh, a second tab and tomorrow morning all agree by construction.

     ⭐ The salt matters. `daySeed(ds)` unsalted is the same number the weather uses, so
     without '#auston' her day off would correlate with the rain forever and nobody
     would ever be able to say why. */
  /* ── SHE FINDS OUT YOU CAME BY ───────────────────────────────────────────────────
     The ledger cannot record a missed visit, because the ledger is written by greet()
     and greet() is exactly what you could not do that day. So the lobby leaves a note
     when it draws her empty seat, and she picks it up the next time you sit down.
     ⚠ ONE KEY HOLDING ONE DATE STRING — not a counter. Coming back five times on the
     same afternoon is one missed visit, and a counter would have her thanking you for
     five. ⚠ Written only when the value actually changes, because this runs from a
     render path. */
  var MISS_KEY = 'pjcc.auston.missed.v1';
  function townDay() {
    try {
      var T = window.PJCC_TIME;
      return (T && T.parts) ? T.parts().ds : null;
    } catch (e) { return null; }
  }
  function missedDay() { var v = readJSON(MISS_KEY, null); return typeof v === 'string' ? v : null; }

  function awayToday(hasSavedGame) {
    if (hasSavedGame) return false;
    try {
      var T = window.PJCC_TIME;
      if (!T || !T.daySeed || !T.parts) return false;
      return T.daySeed(T.parts().ds + '#auston') % AWAY_IN === 0;
    } catch (e) { return false; }
  }

  /* ── PICKING ONE ─────────────────────────────────────────────────────────────────
     Highest weight wins, EXCEPT that what she said recently gets pushed back. Without
     that she would open with the same credit line every visit for as long as your
     balance kept drifting — the observation stays true, which is exactly why "still
     true" cannot be the whole test for "worth saying again".

     ⚠ THE FLAT PENALTY WAS A BUG, AND THE TEST CAUGHT IT. Subtracting one big constant
     from everything she had said made the penalty CANCEL once every candidate was stale
     — the ranking among them was unchanged, so the heaviest observation won again, and
     again, and again. Measured before the fix: `credits_down_big` three greetings in a
     row, having "already been avoided" each time. Two things fix it and both are needed:

       · THE LAST THING SHE SAID IS BANNED OUTRIGHT (unless it is the only thing left).
         A hard rule, because back-to-back repetition is the one a player is guaranteed
         to notice — it is the difference between a character and a stuck record.
       · Everything else decays by RECENCY rather than by a flag, so a line from four
         visits ago is nearly free again while last visit's is still expensive.

     The result is that two standing observations alternate instead of one winning
     forever, which is what a person with two things on their mind actually sounds like. */
  function pick(obs, said) {
    if (!obs.length) return null;
    said = said || [];
    var scored = obs.map(function (o) {
      var i = said.indexOf(o.kind);                       // 0 = said last time
      return { o: o, banned: i === 0,
               score: o.weight - (i < 0 ? 0 : (said.length - i) * 400) };
    });
    var fresh = scored.filter(function (s) { return !s.banned; });
    var use = fresh.length ? fresh : scored;
    use.sort(function (a, b) { return b.score - a.score; });
    return use[0].o;
  }

  /* ── FILLING IN THE WORDS ────────────────────────────────────────────────────────
     ⚠ Numbers are formatted with separators here and NOWHERE ELSE, so a line in the
       table above never has to think about it. "4,120 credits" and "4120 credits" are
       the same fact and only one of them reads like a person said it. */
  function nfmt(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  function render(kind, data, avoid) {
    var pool = LINES[kind];
    if (!pool || !pool.length) return null;          // silenced by emptying the array
    var choices = pool.length > 1 && avoid
      ? pool.filter(function (s) { return s !== avoid; })
      : pool;
    if (!choices.length) choices = pool;
    var text = choices[Math.floor(Math.random() * choices.length)];
    return text.replace(/\{(\w+)\}/g, function (m, k) {
      var v = data[k];
      if (v === undefined || v === null) return m;
      return typeof v === 'number' ? nfmt(v) : String(v);
    });
  }

  /* ══ THE PUBLIC SURFACE ═════════════════════════════════════════════════════════
     Three calls, all of them safe to make for ANY bot — the room does not have to know
     that Auston is the only one who answers. That keeps the check in one place here
     instead of scattered through the room's render path, and it means giving a second
     regular a voice later is a change to this file alone. */
  var WHO = 'auston';

  var API = {
    /* Called when the player sits down. Returns {text, kind} or null.
       ⚠ IT ALSO COMMITS THE LEDGER — after this call, "what she knew last time" is
         NOW. That is why it must be called once per sit-down and not from a render
         path: `botRender()` runs on every move, and a greeting that recomputed itself
         every move would reset her memory to zero and then observe nothing forever. */
    greet: function (botId) {
      if (botId !== WHO) return null;
      var now = snapshot(), then = ledger();
      var said = (then && Array.isArray(then.said)) ? then.said : [];
      var chosen = pick(observe(now, then), said);
      var line = chosen ? render(chosen.kind, chosen.data, then && then.lastText) : null;

      var next = { v: 1, at: now.at, credits: now.credits, rating: now.rating,
                   puzzle: now.puzzle, owned: now.owned, beaten: now.beaten,
                   said: [chosen ? chosen.kind : 'nothing'].concat(said).slice(0, SAID_CAP),
                   lastText: line, greets: ((then && then.greets) || 0) + 1 };
      writeJSON(LEDGER_KEY, next);
      // the missed visit has now been acknowledged — spend it, or she says it forever
      if (missedDay()) { try { localStorage.removeItem(MISS_KEY); } catch (e) {} }

      return line ? { text: line, kind: chosen.kind } : null;
    },

    /* Called once when a game against her ends. Returns {text, kind} or null.
       Reads the log, which the room has ALREADY appended to by this point — so
       `vs.last` is the game that just finished and `vs.games` includes it. */
    farewell: function (botId) {
      if (botId !== WHO) return null;
      var vs = vsHer(), g = vs.last;
      if (!g) return null;
      var kind;
      if (g.w === 'resignation' && g.r === '0-1') kind = 'end_resign';
      else if (g.r === '1-0') {
        // her first loss to you is the one moment worth marking above everything else
        if (vs.w === 1) kind = 'end_first_win';
        else if (vs.games > 1 && log().filter(function (x) { return x.b === WHO; })[1] &&
                 log().filter(function (x) { return x.b === WHO; })[1].r === '0-1') kind = 'end_revenge';
        else kind = 'end_win_you';
      }
      else if (g.r === '1/2-1/2') kind = 'end_draw';
      else if (g.n && g.n <= 24) kind = 'end_quick';
      else kind = 'end_win_her';
      if (g.n >= 80 && kind === 'end_win_her') kind = 'end_long';

      var data = { n: kind === 'end_quick' || kind === 'end_long' ? Math.ceil(g.n / 2) : g.n };
      var line = render(kind, data, null);
      return line ? { text: line, kind: kind } : null;
    },

    logGame: logGame,
    speaks: function (botId) { return botId === WHO; },

    /* ── HAS SHE MET YOU? ──────────────────────────────────────────────────────────
       The lobby asks this to decide whether her card wears its quiet mark. It is the
       ONE thing about her a page may ask before you sit down, and it answers a plain
       yes/no — nothing about what she remembers, which is hers to say out loud.

       ⚠⚠ READ-ONLY, AND THAT IS THE WHOLE POINT. `greet()` COMMITS the ledger, so it
       can never be called from a render path; this exists precisely so a render has
       something safe to ask. Reads the stored ledger directly and writes nothing.
       ⭐ It is per-DEVICE, like everything else she knows. A new browser gets a plain
       card again — which is correct: on that device she genuinely has not met you. */
    knowsYou: function () {
      try { return !!readJSON(LEDGER_KEY, null); } catch (e) { return false; }
    },

    /* ── IS SHE AT THE TABLES TODAY? ───────────────────────────────────────────────
       `hasSavedGame` is passed IN by the room rather than looked up here, because the
       room owns the save format and she should not learn to read it. Pass true and she
       is always present — see guard 2 in awayToday(). */
    awayToday: function (hasSavedGame) { return awayToday(!!hasSavedGame); },

    /* What her empty seat says. Returns a string or null; null means say nothing,
       which is the honest answer if the lines table has been emptied. */
    awayLine: function () { return render('away', {}, null); },

    /* The lobby calls this when it DRAWS her empty seat, so she can mention it next
       time. ⚠ Idempotent and same-day-collapsing: one note per town day, and a write
       only when the stored value actually changes. Safe to call from a render. */
    noteAway: function () {
      var d = townDay();
      if (!d || missedDay() === d) return;
      writeJSON(MISS_KEY, d);
    },

    /* ── THE GLYPH TURNS OVER ──────────────────────────────────────────────────────
       True once you have played her MILESTONE times. The room uses it to swap her
       lobby icon from the outline knight to the solid one — ♘ → ♞ is the only piece
       pair on this site that genuinely renders as two different pictures at card size
       ([[text-clip-glyph-technique]]: ♖/♜, ♗/♝, ♕/♛ and ♙/♟ are indistinguishable).
       ⚠ Counted off the GAME LOG, never a stored tally — a counter and a log can
       disagree and only one of them is evidence. */
    milestone: function () { return vsHer().games >= MILESTONE; },
    MILESTONE: MILESTONE,

    /* for the test harness and for anyone debugging her in a console —
       everything she currently believes, in one object */
    debug: function () {
      return { ledger: ledger(), snapshot: snapshot(), vs: vsHer(), log: log(),
               observations: observe(snapshot(), ledger()) };
    },
    forget: function () {
      try { localStorage.removeItem(LEDGER_KEY); localStorage.removeItem(LOG_KEY); } catch (e) {}
    },
    LINES: LINES
  };

  window.PJCCAuston = API;
})();
