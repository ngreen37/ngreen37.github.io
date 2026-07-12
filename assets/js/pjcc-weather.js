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
  if (!w || w.kind === 'clear') return;

  var kind = w.kind;                       // 'rain' | 'mist'
  var root = document.documentElement;
  root.classList.add('town-' + kind);      // drives the static wash (set early, no flash)

  function reduced() {
    try { if (localStorage.getItem('pjcc.flourish') === '0') return true; } catch (e) {}
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function boot() {
    if (document.querySelector('.town-weather-overlay')) return;   // never double up
    var o = document.createElement('div');
    o.className = 'town-weather-overlay';
    o.setAttribute('aria-hidden', 'true');
    document.body.appendChild(o);

    if (reduced()) return;                 // wash only — no moving parts

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
