/*! pjcc-first100k.js — THE FIRST 100,000                          (2026-08-17)
 * =============================================================================
 * 2026-08-17, Nate: *"I also want to do twitch and have a signup countdown from say…
 * 100,000 on the bottom of the screen (for the website, not the twitch)."*
 *
 * ══ IT COUNTS UP, AND THAT WAS HIS CALL ══════════════════════════════════════
 * A countdown was the ask; a count-up is what shipped, because a countdown reads the
 * room's emptiness out loud. "99,993 slots remain" is arithmetically identical to
 * "seven people have signed up" and every visitor does that subtraction instantly. It
 * also gets no better for two years: at four thousand members it still says 96,000
 * remain, which is a scarcity that has visibly not bitten.
 *
 * Counting up inverts every one of those. A LOW number is the good news — "you would be
 * #8" says you are early, which is the actual pitch, and it is the same sentence at
 * eight members and at eighty thousand. Nothing here has to become true later.
 * ⚠ Nate's one edit, and it is honored throughout: *"count up but take out Operative."*
 * The word does not appear in anything this file renders.
 *
 * ══ ⚠⚠ THE NUMBER IS REAL OR THE BAR DOES NOT EXIST ══════════════════════════
 * It is `count(profiles)` + 1. There is no animation up from zero, no "join 10,000+
 * players", no seeded head start, and no fallback figure. If the query fails, if the
 * backend is not configured, or if the answer is not a number, NOTHING RENDERS — a
 * signup bar that invents its own social proof is exactly the kind of small lie that
 * makes everything else on a site unbelievable, and this one would sit on every page.
 * [[accuracy-above-all]] [[no-excuses-copy]]
 *
 * ══ WHO SEES IT ══════════════════════════════════════════════════════════════
 * Signed-out visitors only, and only until they dismiss it. Somebody who already has an
 * account is being asked for something they have already given, on every page, forever
 * — which is how a growth device turns into a tax on the people who already said yes.
 * ============================================================================= */
(function () {
  'use strict';

  /* ── THE DIALS ─────────────────────────────────────────────────────────────────
     ⚠ `ON` is the whole feature's switch and it is deliberately the first line of the
     file. This is an outward-facing prompt on every page of the site; it must be
     removable in one edit by somebody who is annoyed at it, without reading the rest.
     [[private-by-default]] */
  var ON     = true;
  /* ⛑ THE FRAME CAME DOWN FROM 100,000 TO 1,000 (2026-08-19, Nate: *"up to 1,000 for now -
     real goal is a million and that's what our work is building toward"*). His original was
     *"say… 100,000"* and the word "say" was doing real work in it — it was a frame, not a
     forecast. ⭐ AT THREE MEMBERS, 100,000 IS A WALL AND 1,000 IS A DOOR. The count-up
     reasoning above is exactly why the ceiling can move without anything becoming untrue:
     the sentence is "you would be #4" either way, and only the horizon behind it changed.
     ⚠ THE SAME NUMBER IS ON THE STREAM. `assets/overlay/index.html` is an OBS browser
     source reading the same `count(profiles)`, and its own GOAL must move WITH this one or
     the site and the broadcast quote two different targets on the same evening. */
  var TARGET = 1000;
  var KEY    = 'pjcc.first100k.dismissed.v1';
  var DELAY  = 1400;           // ms before it slides in — see WHY IT WAITS below

  if (!ON) return;

  function dismissed() {
    try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; }
  }
  function remember() {
    try { localStorage.setItem(KEY, '1'); } catch (e) {}
  }

  /* Grouping separators here and nowhere else, so no caller has to think about it —
     "100,000" and "100000" are the same fact and only one of them reads like a person
     wrote it. Same helper, same reason, as Auston's number formatting. */
  function nfmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

  /* ── HOW MANY PEOPLE ARE THERE ─────────────────────────────────────────────────
     A HEAD count: `head: true` asks Postgres for the number and no rows, so this costs
     one small request and transfers no profile data at all. Resolves to null on any
     failure whatsoever, and null is the signal to render nothing.
     ⚠ NEVER 0 ON FAILURE. Zero is a real, sayable number ("you would be #1") and it is
     the single most flattering wrong answer available, which is exactly why a failure
     must not be able to produce it. */
  function countMembers() {
    return new Promise(function (resolve) {
      var done = false;
      function finish(v) { if (!done) { done = true; resolve(v); } }
      // a bar that is late is fine; a page that waits on one is not
      setTimeout(function () { finish(null); }, 6000);
      try {
        if (!window.PJCC || !PJCC.ready) return finish(null);
        PJCC.ready.then(function () {
          var db = PJCC.db && PJCC.db();
          if (!db) return finish(null);
          db.from('profiles').select('id', { count: 'exact', head: true })
            .then(function (r) {
              var c = r && typeof r.count === 'number' ? r.count : null;
              finish((c === null || c < 0 || !isFinite(c)) ? null : c);
            }, function () { finish(null); });
        }, function () { finish(null); });
      } catch (e) { finish(null); }
    });
  }

  function signedIn() {
    try { return !!(window.PJCC && PJCC.getProfile && PJCC.getProfile()); } catch (e) { return false; }
  }

  function render(n) {
    if (document.getElementById('f100k')) return;
    var bar = document.createElement('aside');
    bar.id = 'f100k';
    bar.className = 'f100k';
    /* `role="complementary"` and not an alert: it is standing information, not an
       interruption, and a screen reader should meet it in document order rather than
       have it read over whatever the visitor was actually doing. */
    bar.setAttribute('role', 'complementary');
    /* ⚠ DERIVED, NOT TYPED. This said "Join the first 100,000" as a literal and went
       stale the moment TARGET moved — a screen reader would have announced a number the
       sighted copy no longer said. */
    bar.setAttribute('aria-label', 'Join the first ' + nfmt(TARGET));
    bar.innerHTML =
      '<span class="f100k-mark" aria-hidden="true">◈</span>' +
      '<p class="f100k-t"><b>The first ' + nfmt(TARGET) + '.</b> ' +
        'You would be <b class="f100k-n">#' + nfmt(n + 1) + '</b>.</p>' +
      /* ⛑ WAS href="/pjcc/" UNTIL 2026-08-25, AND IT WAS A DEAD END EITHER WAY.
         Nate: *"'Claim Your Number' let's switch that over to ChessWild."* Two things were
         wrong with the old target and only one of them was about hiding P&JCC: /pjcc/ is the
         world LANDING — a hero and doors to Characters and Locations — and it has never
         carried a signup. So the one button on a bar that floats over every page of the site
         sent a stranger to a page with nothing on it to claim.
         ⭐ THE COUNT IS `count(profiles) + 1`, so the claim IS an account, and /dossier/ is
         where an account gets made or opened — the same place the header's own profile pill
         goes. The destination now matches the sentence above it. */
      '<a class="f100k-go" href="/dossier/">Claim your number</a>' +
      '<button class="f100k-x" type="button" aria-label="Dismiss">✕</button>';
    document.body.appendChild(bar);
    // the class lands on the next frame so the transition has two states to move between
    requestAnimationFrame(function () { bar.classList.add('is-in'); });
    document.documentElement.classList.add('has-f100k');

    bar.querySelector('.f100k-x').onclick = function () {
      remember();
      bar.classList.remove('is-in');
      document.documentElement.classList.remove('has-f100k');
      setTimeout(function () { try { bar.remove(); } catch (e) {} }, 320);
    };
  }

  /* ── WHY IT WAITS ──────────────────────────────────────────────────────────────
     The bar is the last thing that should arrive. A visitor who lands on the front door
     is looking at a chess puzzle they can finish in one tap; a panel sliding up over the
     bottom of the screen while they are reaching for a piece is a growth device stealing
     from the thing that actually converts. It also lets the count resolve, so the bar
     appears once, complete, rather than popping in and then changing its own number.
     [[front-door-hero-stack]] */
  function start() {
    if (dismissed()) return;
    setTimeout(function () {
      if (signedIn() || dismissed()) return;
      countMembers().then(function (n) {
        if (n === null) return;                       // no true number, no bar. Silence.
        if (signedIn() || dismissed()) return;        // they signed in while we asked
        render(n);
      });
    }, DELAY);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else start();
})();
