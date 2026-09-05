/* =============================================================================
 * pjcc-game-sky.js — the games wear the town's sky
 * -----------------------------------------------------------------------------
 * Nate, 2026-08-03 (cohesion #6): "Every game should wear the town's sky. The games
 * are their own HTML shells. If PJCC_TIME set their background phase too, playing
 * Sand Mine at night would *feel* like night. Same clock, same town, no new art."
 *
 * Sixteen games, sixteen hand-written documents, sixteen hard-coded background
 * colors — and every one of them a hole in a sky that the rest of the site has kept
 * since 2026-07-12. The frame around the game knows the hour; the game inside it
 * never did.
 *
 * WHAT IT DOES, AND ALL IT DOES:
 *   · puts `sky-<phase>`, `season-<name>` and `town-<kind>` on the game's own <html>
 *   · lays ONE fixed, pointer-events:none element over the game and washes it with
 *     the same gradients the site paints on `.town-weather-overlay`
 *
 * ⚠ THE GRADIENTS ARE COPIED FROM _sass/_pjcc-09-widgets.scss, VALUE FOR VALUE, and
 * that copy is the whole risk in this file. The game shells do not load the site
 * stylesheet — they are standalone documents — so there is no way to SHARE the rule;
 * it can only be duplicated. Two copies of a color drift, so `tests/townsky.check.js`
 * parses both files and fails if a single channel disagrees. Change one, change both,
 * and the gate will tell you if you forgot.
 *
 * ⚠ THE STRENGTH (0.03–0.12 alpha) IS A CEILING, NOT A TASTE — AND IT WAS MEASURED.
 * The wash is subtle. It was tried louder first: a labeled ×1/×2/×3/×4 render said ×3
 * was where "it is daytime outside" actually reads. Then every visible text node in all
 * sixteen shells was measured against the background it really sits on, before and after
 * the wash composites over both:
 *
 *     ×1    0 pairs pushed from passing to failing   ← shipped
 *     ×1.5  9 pairs
 *     ×2   16 pairs
 *
 * A wash sits over the text as well as the page, so it compresses contrast; the games
 * are full of 10–12px muted footer type with almost no headroom, and they break first.
 * ×1 was not free either — it broke nine pairs on its own until five colors were lifted
 * (sandmine/pirc `.foot`, reading room `.romaji` + the deck-group header, tower defense
 * `.lbl`/`.coins span`), which is why those five are a touch brighter than they were.
 * If this ever wants to be louder, the order is: lift the type first, measure, then turn
 * it up — never the other way round.
 *
 * It also happens to be the wash the surrounding page already carries, so the frame stops
 * being a hole in the sky rather than becoming a differently-lit rectangle inside it.
 *
 * ⚠ NO FALLING WEATHER. The rain/snow CANVAS stays out of the games on purpose — a
 * particle loop competing with a game's own frame loop is the one thing the site's
 * perf law would not forgive ([[css-perf-lessons]]). What lands here is the static
 * wash, which costs one composited layer and never repaints. A rainy day looks rainy
 * through the window; it does not rain on the board.
 *
 * ⚠ LOAD ORDER: pjcc-time.js MUST come first in the shell or this file finds no clock
 * and silently does nothing — the exact shape of [[feature-shipped-but-never-loaded]].
 * tests/townsky.check.js greps every shell for both tags IN ORDER, so a new game that
 * forgets one fails loudly instead of quietly having no weather.
 * ========================================================================== */
(function () {
  'use strict';
  var T = window.PJCC_TIME;
  if (!T) return;                     // no clock, no sky — see the load-order note above

  var root = document.documentElement;
  var phase = T.phase();
  var kind = 'clear';
  try { kind = (T.weather() || {}).kind || 'clear'; } catch (e) {}

  /* ?wx=snow READS THE PARENT'S URL. The site's preview switch is a query string, and a
     game is an <iframe> whose src carries no query string at all — so inside the frame
     `location.search` is always empty and snow would have stayed unreviewable in here
     until December. The parent is same-origin, so ask it. Wrapped because it is not
     same-origin when a game is opened as a bare file:// URL by the test harness. */
  function search() {
    try {
      if (window.parent && window.parent !== window && window.parent.location.search)
        return window.parent.location.search;
    } catch (e) {}
    return location.search;
  }
  try {
    var q = new URLSearchParams(search()).get('wx');
    if (q && /^(rain|snow|mist|clear)$/.test(q.split(',')[0])) kind = q.split(',')[0];
  } catch (e) {}

  root.classList.add('sky-' + phase);
  try { root.classList.add('season-' + T.season()); } catch (e) {}
  if (kind !== 'clear') root.classList.add('town-' + kind);

  /* ── THE WASH ───────────────────────────────────────────────────────────────────
     Mirrors .town-weather-overlay: ::after is the HOUR (dawn/day/dusk/night), ::before
     is the WEATHER (rain/snow/mist). Two pseudo-elements on one host rather than two
     hosts, for the same reason the site does it — the phase and the forecast are
     independent, so a rainy dusk has to be able to be both at once. */
  var CSS = [
    '.pjcc-game-sky{position:fixed;inset:0;z-index:900;pointer-events:none;overflow:hidden;contain:layout style paint}',
    '.pjcc-game-sky::after,.pjcc-game-sky::before{content:"";position:absolute;inset:0}',
    'html.sky-dawn .pjcc-game-sky::after{background:linear-gradient(180deg,rgba(255,150,95,0.055) 0%,rgba(255,120,140,0.028) 45%,transparent 85%)}',
    'html.sky-day .pjcc-game-sky::after{background:linear-gradient(180deg,rgba(150,200,255,0.045) 0%,rgba(150,200,255,0.018) 55%,transparent 90%)}',
    'html.sky-dusk .pjcc-game-sky::after{background:linear-gradient(180deg,rgba(90,50,120,0.05) 0%,rgba(224,102,46,0.055) 60%,rgba(224,102,46,0.03) 100%)}',
    'html.sky-night .pjcc-game-sky::after{background:linear-gradient(180deg,rgba(20,16,60,0.10) 0%,rgba(10,7,30,0.05) 60%,transparent 100%)}',
    'html.town-rain .pjcc-game-sky::before{background:linear-gradient(180deg,rgba(90,120,180,0.10) 0%,rgba(40,60,110,0.05) 100%)}',
    'html.town-snow .pjcc-game-sky::before{background:linear-gradient(180deg,rgba(226,236,255,0.12) 0%,rgba(196,214,246,0.06) 100%)}',
    'html.town-mist .pjcc-game-sky::before{background:radial-gradient(120% 80% at 50% 0%,rgba(205,214,235,0.11),rgba(205,214,235,0.04) 60%,transparent)}'
  ].join('\n');

  function build() {
    if (document.querySelector('.pjcc-game-sky')) return;
    var s = document.createElement('style');
    s.id = 'pjcc-game-sky-css';
    s.textContent = CSS;
    document.head.appendChild(s);

    var el = document.createElement('div');
    el.className = 'pjcc-game-sky';
    el.setAttribute('aria-hidden', 'true');
    document.body.appendChild(el);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();

  // for the harness and the console
  window.PJCCGameSky = { phase: phase, kind: kind };
})();
