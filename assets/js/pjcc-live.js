/*! pjcc-live.js — THE DOOR KNOWS WHEN HE IS ON AIR                (2026-08-19)
 * =============================================================================
 * 2026-08-19, Nate: *"I want, when I'm streaming or podcasting live, to have that
 * sixth box Follow embed the actual stream, if possible, or at least light up to
 * show that I'm live."*
 *
 * ══ WHAT THIS IS, AND WHAT IT DELIBERATELY IS NOT ════════════════════════════
 * It lights the Follow door — the sixth box on the front door and its row in the
 * nav rail — while chesswild_official is actually streaming. It does NOT put a
 * player anywhere but `/follow/`, which is his call and mine agreed on the same
 * day: a third-party video iframe on the site's most tuned surface would load for
 * every visitor during the ~99% of hours the channel is dark, and it is one tap
 * away on a page that already has one.
 *
 * ══ ⚠⚠ IT MUST LOOK MISSING WHEN IT CANNOT ANSWER ════════════════════════════
 * There are four ways this feature has no answer — no Worker configured, the
 * Worker down, a network failure, a malformed reply — and ALL FOUR must leave the
 * door looking exactly as it does today. Not grayed out, not "status unknown", not a
 * dot in a third color. A door. This file therefore only ever ADDS a state, never
 * removes or replaces one, so the failure path is "did nothing at all".
 * [[down-never-stuck]] · [[feature-shipped-but-never-loaded]]
 *
 * ⚠ AND A STALE "LIVE" IS WORSE THAN NO BADGE. `/follow/` has refused to paint the
 * words LIVE NOW since the day it shipped, on the grounds that a badge the site
 * paints itself is wrong for every hour he is not streaming. That rule is not
 * broken here — it is satisfied. The badge is painted from a real answer about
 * this minute, or it is not painted. [[accuracy-above-all]]
 *
 * ══ WHY A WORKER AT ALL ══════════════════════════════════════════════════════
 * Asking Twitch "is this channel live" needs a Client-ID and a client secret, and
 * a secret cannot live in a page anyone can view-source. The Worker holds them,
 * exchanges them for an app token, and hands back a boolean. It is the same shape
 * — and the same dashboard — as `pjcc-translate`, which has been running since
 * July. See docs/twitch-live-worker.md for the code and the two setup steps.
 *
 * ⚠ LIVE_URL IS BLANK UNTIL HE DEPLOYS IT. That is not an oversight and it is not
 * a TODO: it is the switch. Blank = this file returns before it touches the DOM.
 * ============================================================================= */
(function () {
  'use strict';

  /* Set this to the deployed Worker's URL. Blank = the feature is inert, by design. */
  var LIVE_URL = '';

  /* ⚠ ONE ASK PER MINUTE PER TAB, NOT ONE PER PAGE VIEW. Clicking around the site is
     four page loads in twenty seconds, and four identical questions about a fact that
     changes maybe twice a day is rude to a free Worker and slower for him. sessionStorage
     rather than localStorage: a browser left open for a week should not remember that he
     was live on Tuesday. */
  var KEY = 'pjcc.live.v1', TTL = 60000;

  function cached() {
    try {
      var raw = sessionStorage.getItem(KEY);
      if (!raw) return null;
      var o = JSON.parse(raw);
      return (o && typeof o.t === 'number' && Date.now() - o.t < TTL) ? o.v : null;
    } catch (e) { return null; }
  }

  function remember(v) {
    try { sessionStorage.setItem(KEY, JSON.stringify({ t: Date.now(), v: v })); } catch (e) {}
  }

  /* ── PAINTING IT ───────────────────────────────────────────────────────────────
     Both surfaces carry `data-live-door`, so this file names ONE selector and never
     guesses at an href — `relative_url` can prefix these paths and an href match would
     work on the live domain and quietly fail on a project-pages build.

     ⚠ THE CHIP IS ABSOLUTELY POSITIONED, AND THAT IS A LAYOUT DECISION, NOT A STYLE ONE.
     The front door's left column is measured against the board beside it, and a badge that
     took part in flow would move that column the moment he went live — the same defect as
     the puzzle hint that grew 13px and pushed the green button down a phone screen. It
     cannot reflow anything if it is out of flow. [[front-door-hero-stack]]

     ⚠ AND IT IS NOT COLOR ALONE. The chip carries the WORD "LIVE", and the rail's row
     swaps its subtitle to say so in text, because a red tint is not information to
     somebody who cannot see it — or on a browser that painted the glyph from an emoji
     font and ignored the tint entirely. [[text-clip-glyph-technique]] */
  function paint(info) {
    var doors = document.querySelectorAll('[data-live-door]');
    if (!doors.length) return;
    for (var i = 0; i < doors.length; i++) {
      var d = doors[i];
      if (d.classList.contains('is-live')) continue;      // never paint twice
      d.classList.add('is-live');

      /* ⚠ THE CHIP GOES ON THE BOX ONLY, AND THE ATTRIBUTE SAYS WHICH IS WHICH.
         `data-live-door="box"` is the front door's sixth panel, which has room in its
         corner. `="row"` is the nav rail, a 246px line measured to fit ONE line of
         subtitle — an extra element in there is a wrap waiting to happen, so that
         surface says it with its tint and its words instead. */
      if (d.getAttribute('data-live-door') === 'box') {
        var chip = document.createElement('span');
        chip.className = 'live-chip';
        chip.textContent = 'LIVE';
        d.appendChild(chip);
      }

      /* Both surfaces say it in words as well as in color. Replaced, never appended.

         ⚠⚠ THE GAME NAME GOES ON THE BOX ONLY, AND THE FIRST RENDER IS WHY. The rail's
         subtitle was chosen at 22 characters ("Twitch and the socials") because it was
         MEASURED to fit the 246px rail on one line, and "Live now — Cult of the Lamb"
         wrapped to two on the very first screenshot. A wrapped row is ~20px of extra
         collapsed rail, and that rail's short-window guard is a measured 861px that moves
         the moment any row grows — the same class of defect as seven seats in a
         three-column grid, found the same way, by looking. "Live right now" is 14
         characters, shorter than the string it replaces, so the row cannot grow.
         [[nav-rail-collapsed-default]] · [[measure-the-real-page]] */
      var railRow = d.getAttribute('data-live-door') === 'row';
      var sub = d.querySelector('.dl-txt small') || d.querySelector('small');
      if (sub) {
        if (!sub.getAttribute('data-was')) sub.setAttribute('data-was', sub.textContent);
        sub.textContent = (!railRow && info && info.game) ? ('Live now — ' + info.game)
                                                          : 'Live right now';
      }

      /* Screen readers get the fact, not the styling. */
      var label = d.getAttribute('aria-label') || (d.textContent || '').trim().split('\n')[0];
      d.setAttribute('aria-label', 'Follow — live on Twitch right now');
      if (!label) d.removeAttribute('aria-label');
    }
  }

  function run() {
    if (!LIVE_URL) return;                                 // the switch
    if (!document.querySelector('[data-live-door]')) return;

    var hit = cached();
    if (hit !== null) { if (hit && hit.live) paint(hit); return; }

    /* ⚠ EVERY FAILURE PATH ENDS IN A BARE `return`. A catch that logged, retried or drew a
       "status unknown" state would be inventing information the site does not have. */
    try {
      fetch(LIVE_URL, { method: 'GET', cache: 'no-store' })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (j) {
          if (!j || typeof j.live !== 'boolean') return;   // malformed = no answer
          remember(j);
          if (j.live) paint(j);
        })
        .catch(function () {});
    } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }

  /* Exposed only so a test can drive paint() without a Worker. Nothing on the site calls it. */
  window.PJCCLive = { paint: paint, configured: function () { return !!LIVE_URL; } };
}());
