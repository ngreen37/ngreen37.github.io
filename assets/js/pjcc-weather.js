/* =============================================================================
 * PJCC town weather — ONE forecast, EVERY screen (2026-07-12 Nate).
 * -----------------------------------------------------------------------------
 * The forecast comes from the shared town clock (PJCC_TIME.weather(), date-seeded,
 * US Eastern), so the whole town agrees on the day's weather. This engine renders
 * it on *every* page — the hero no longer owns the rain.
 *
 *   rain  → two tilted sheets of sparse streaks + a random-walking intensity
 *           (light ↔ med ↔ heavy) + lightning on stormy dusk/nights
 *   mist  → two slow banks of fog drifting back and forth
 *   clear → nothing at all
 *
 * PERF (this is the whole ballgame — a full-screen rain layer is what lagged the
 * site back on 2026-07-11): every moving part animates ONLY transform/opacity, so
 * it lives on the compositor and never repaints. Nothing animates background-
 * position. The container is position:fixed + overflow:hidden, so the layer is
 * capped at the VIEWPORT and never grows with the document.
 *
 * Honors "reduce flourish" and prefers-reduced-motion: the static colour wash
 * still tints the page, but every moving part is dropped.
 * ========================================================================== */
(function () {
  'use strict';
  var T = window.PJCC_TIME;
  if (!T) return;

  var w = T.weather();
  var kind = (w && w.kind) || 'clear';     // 'rain' | 'mist' | 'clear'
  var root = document.documentElement;

  // McPUPPY STUDIOS HAS NO WEATHER (2026-07-21 Nate: "get the weather off all black/white
  // mcpuppy pages"). The studio's pages are the monochrome half of the site — theme-bw
  // (the blog, posts, Contact, Direct Line, the lessons page) and theme-studio
  // (/projects/). The town sky was already stripped of hue on them; the weather layer
  // never was, so they still got a coloured phase wash and falling rain. Bail before
  // anything is built: no overlay, no rain/mist sheets, no lightning timers, and no
  // 2-minute orb re-plot for an orb that is display:none on these pages anyway.
  // The CSS in _sass/_pjcc-20-town-sky.scss hides the overlay too, in case a cached copy
  // of this script runs. body exists here — this script is deferred, so it runs after the
  // document is parsed.
  var body = document.body;
  if (body && (body.classList.contains('theme-bw') || body.classList.contains('theme-studio'))) return;

  // sky-<phase> + town-<kind> are already on <html> (set before paint by the head
  // include); re-assert defensively in case this ran standalone.
  root.classList.add('sky-' + T.phase());
  if (kind !== 'clear') root.classList.add('town-' + kind);

  // The orb's hour-arc position (--orb-x/--orb-y) is set before paint by the head
  // include; re-plot every 2 minutes so a long-open tab watches the sun actually
  // travel. (Position only — the phase class swap still needs a reload, fine.)
  // 2026-07-16 (Nate: the shift read "a little unnaturally" at 5-min hops) — smaller,
  // more frequent steps here + a 3s ease on .ts-orb in _pjcc-20-town-sky.scss turn
  // the hop into a drift you can't catch happening.
  if (T.orb) setInterval(function () {
    var o = T.orb();
    root.style.setProperty('--orb-x', o.x.toFixed(1) + '%');
    root.style.setProperty('--orb-y', o.y.toFixed(1) + '%');
  }, 120000);

  function reduced() {
    try { if (localStorage.getItem('pjcc.flourish') === '0') return true; } catch (e) {}
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function boot() {
    if (document.querySelector('.town-weather-overlay')) return;   // never double up
    // The overlay is built on EVERY day, not just wet ones: on a clear day it still
    // carries the sky-phase tint (dawn warmth / night cool), which is what makes the
    // whole town share the hour instead of only the hero.
    var o = document.createElement('div');
    o.className = 'town-weather-overlay';
    o.setAttribute('aria-hidden', 'true');
    document.body.appendChild(o);

    if (kind === 'clear') return;          // nothing falling — just the phase tint
    if (reduced()) return;                 // wash + tint only — no moving parts

    var layer = document.createElement('div');
    layer.className = (kind === 'rain') ? 'tw-rain' : 'tw-mist';
    o.appendChild(layer);

    if (kind === 'rain') storm(o);
  }

  /* The rain wanders light↔heavy through the day, and stormy dusk/nights flicker.
     (Promoted from the old hero-only engine so every screen shares the same storm.) */
  function storm(o) {
    var LEVELS = ['light', 'med', 'heavy'];
    // seed the opening intensity off the day (decorrelated from the rain roll)
    var idx = (T.daySeed() >> 3) % 3;
    function setLevel(i) {
      idx = Math.max(0, Math.min(2, i));
      root.classList.remove('town-rain-light', 'town-rain-med', 'town-rain-heavy');
      root.classList.add('town-rain-' + LEVELS[idx]);
    }
    setLevel(idx);

    // random-walk the intensity every ~40–80s so it varies through the evening
    (function wander() {
      setTimeout(function () {
        setLevel(idx + (Math.random() < 0.5 ? -1 : 1));
        wander();
      }, 40000 + Math.random() * 40000);
    })();

    // lightning: dusk/night only, and only when it's really coming down
    var ph = T.phase();
    if (ph !== 'dusk' && ph !== 'night') return;
    var bolt = document.createElement('div');
    bolt.className = 'tw-bolt';
    o.appendChild(bolt);
    // the home hero keeps its own trick: rare strikes backlight the Chess City skyline
    var sky = document.querySelector('.hero-skyflash');
    (function strike() {
      setTimeout(function () {
        if (idx === 2) {
          bolt.classList.remove('flash'); void bolt.offsetWidth; bolt.classList.add('flash');
          if (sky && Math.random() < 0.25) {
            sky.classList.remove('lit'); void sky.offsetWidth; sky.classList.add('lit');
          }
        }
        strike();
      }, 9000 + Math.random() * 17000);
    })();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
