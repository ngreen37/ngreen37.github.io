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
 * Honors "reduce flourish" and prefers-reduced-motion: the static color wash
 * still tints the page, but every moving part is dropped.
 * ========================================================================== */
(function () {
  'use strict';
  var T = window.PJCC_TIME;
  if (!T) return;

  var w = T.weather();
  var kind = (w && w.kind) || 'clear';     // 'rain' | 'snow' | 'mist' | 'clear'
  var root = document.documentElement;

  /* ── ?wx= — SEE ANY WEATHER, ON ANY DAY (2026-07-28) ────────────────────────
     The forecast is date-seeded on purpose (one town, one day), which is right and
     which also means snow is unreviewable until December. So: `?wx=snow`, `?wx=rain`,
     `?wx=mist`, `?wx=clear`, with an optional intensity — `?wx=snow,heavy`.
     Preview only; it never touches the seed, so it can't leak into anyone else's sky. */
  /* ⚠⚠ ?eclipse= HAS TO BE READ *HERE*, NOT ONLY WHERE THE ECLIPSE IS PLOTTED (2026-08-09).
     The head include forces `sky-day` + a clear sky for the preview, and then this file
     helpfully re-asserted the REAL phase and the REAL forecast a moment later — so on the
     live site `?eclipse=1` ended up with `sky-day` AND `sky-night town-rain` on <html> at
     once, and `html.town-rain .ts-orb { opacity: .08 }` dropped the eclipsed sun to almost
     nothing. The preview was there, correct, and invisible. Two scripts each doing the right
     thing on their own is the whole shape of this bug: whoever writes a class LAST wins, and
     the defensive re-assert below was written before anything could legitimately override
     the phase. A forced eclipse is a deliberate override; leave it alone. */
  var forcedEclipse = false;
  try { forcedEclipse = new URLSearchParams(location.search).get('eclipse') !== null; } catch (e) {}
  if (forcedEclipse) kind = 'clear';

  /* ⚑ ?meteors= AND ?aurora= ARE THE SAME SHAPE OF PREVIEW AND NEED THE SAME GUARD
     (2026-08-13). The note above is about the eclipse, but the bug it describes belongs to
     the SPLIT, not to the eclipse: the head include forces a phase and a clear sky, and this
     file then re-asserts the real ones a moment later, so whoever writes last wins. A
     meteor-shower preview that quietly got `town-rain` and a full cloud deck reasserted over
     it would be exactly the 2026-08-09 bug wearing a different hat — present, correct, and
     invisible. Forcing the sky is a deliberate override; leave it alone.
     ⚠ These force NIGHT where the eclipse forces DAY, and that asymmetry is not an
     inconsistency — each one forces the half of the day it can be seen in. */
  var forcedSkyEvent = false;
  try {
    var _q = new URLSearchParams(location.search);
    forcedSkyEvent = _q.get('meteors') !== null || _q.get('aurora') !== null;
  } catch (e) {}
  if (forcedSkyEvent) kind = 'clear';

  var forceLevel = null;
  try {
    var q = new URLSearchParams(location.search).get('wx');
    if (q) {
      var bits = q.split(',');
      if (/^(rain|snow|mist|clear)$/.test(bits[0])) {
        root.classList.remove('town-rain', 'town-snow', 'town-mist');
        kind = bits[0];
      }
      var lv = ['light', 'med', 'heavy'].indexOf(bits[1]);
      if (lv !== -1) forceLevel = lv;
    }
  } catch (e) {}

  // McPUPPY STUDIOS HAS NO WEATHER (2026-07-21 Nate: "get the weather off all black/white
  // mcpuppy pages"). The studio's pages are the monochrome half of the site — theme-bw
  // (the blog, posts, Contact, Direct Line, the lessons page) and theme-studio
  // (/projects/). The town sky was already stripped of hue on them; the weather layer
  // never was, so they still got a colored phase wash and falling rain. Bail before
  // anything is built: no overlay, no rain/mist sheets, no lightning timers, and no
  // 2-minute orb re-plot for an orb that is display:none on these pages anyway.
  // The CSS in _sass/_pjcc-20-town-sky.scss hides the overlay too, in case a cached copy
  // of this script runs. body exists here — this script is deferred, so it runs after the
  // document is parsed.
  var body = document.body;
  if (body && (body.classList.contains('theme-bw') || body.classList.contains('theme-studio'))) return;

  // sky-<phase> + town-<kind> are already on <html> (set before paint by the head
  // include); re-assert defensively in case this ran standalone — but never over the top of
  // a preview that deliberately set them (see the ?eclipse= note above).
  if (!forcedEclipse && !forcedSkyEvent) {
    root.classList.add('sky-' + T.phase());
    if (kind !== 'clear') root.classList.add('town-' + kind);
  }

  // The orb's hour-arc position (--orb-x/--orb-y) is set before paint by the head
  // include; re-plot on a timer so a long-open tab watches the sun actually travel.
  // (Position only — the phase class swap still needs a reload, fine.)
  // 2026-07-16 (Nate: the shift read "a little unnaturally" at 5-min hops) — the answer
  // then was smaller steps (2 minutes) plus a 3s ease on .ts-orb, to turn the hop into a
  // drift you couldn't catch happening.
  //
  // 2026-07-21 (Nate: "if you stay on a screen long enough, the moon (or sun) can shift
  // dramatically across screen. It's disconcerting"). The 2-minute step itself is small.
  // What made it dramatic was the 3s ease being handed moves it was never sized for:
  //
  //   · A BACKGROUND TAB throttles setInterval to about once a minute, and a fully
  //     hidden one can be frozen for as long as the browser likes. Come back after an
  //     hour and the next tick applies an hour of travel — and the transition faithfully
  //     SLIDES the orb across the sky over three seconds. A moving thing is exactly what
  //     the eye is built to catch, so that slide is all you can look at. This is the
  //     complaint.
  //   · At 5:00 and 20:00 the arc swaps between the sun's window and the moon's, so the
  //     orb legitimately belongs on the far horizon. A long-open tab animates that as one
  //     enormous sweep, while the sky around it is still painted for the old phase (the
  //     phase class only changes on reload).
  //   · Just after moonrise the moon climbs fast on purpose (the t^0.6 lift in
  //     pjcc-time.js, so it isn't still scraping the horizon at 8:52pm). At 20:00 a
  //     single 2-minute step was 5.2% of the viewport — a glide you can absolutely watch
  //     happen.
  //
  // Measured, at the old 2-minute cadence: the sun's biggest step was 0.37% of the
  // viewport, the moon's 5.2%, the 5:00 and 20:00 hand-offs 88% (the orb genuinely
  // changes horizons), and an hour of background-tab staleness 11%. The last two were
  // being played as three-second animations.
  //
  // The fix is to stop animating the orb at all and instead re-plot it OFTEN ENOUGH that
  // each step is beneath noticing: every 30 seconds instead of every 2 minutes. That puts
  // the sun at 0.09% per step and the moon under 0.5% within five minutes of moonrise
  // (its worst single step, in the first 30 seconds of the evening, is 2.3% and it decays
  // fast). Compare the 5-minute hop that read "a little unnaturally" on 2026-07-16, which
  // ran to 9%. Nothing slides, so there is nothing to catch; a tab returning from the
  // background is simply already correct instead of sweeping into place; and the
  // 5:00/20:00 hand-off stops being a three-second journey across the sky.
  //
  // It also gets the sky back onside with the perf law: the ease was a transition on
  // left/top, the two properties that cost layout. There is now no animated layout in the
  // sky at all — just a style write on a timer. orb() itself is untouched, so where the
  // orb belongs at any given minute is exactly what it always was.
  // The eclipse rides the same tick (2026-08-09). It has to: it is the one thing in this
  // sky that changes over MINUTES rather than hours, so a page opened at 13:05 and left
  // alone would otherwise sit at 1% coverage through the whole thing. `?eclipse=` pins it
  // for preview (forcedEclipse is read at the top of this file), so a forced eclipse is
  // left exactly where the head script put it.
  if (T.orb && !forcedEclipse) {
    // ⚠ the whole tick is off during a forced preview, the orb included: the head parks the
    // sun at noon, and T.orb() after dark returns the MOON's place on its arc — so thirty
    // seconds in, the eclipsed sun would slide off to wherever the moon happens to be.
    var plot = function () {
      var o = T.orb();
      root.style.setProperty('--orb-x', o.x.toFixed(1) + '%');
      root.style.setProperty('--orb-y', o.y.toFixed(1) + '%');
      if (T.eclipse) {
        var ec = T.eclipse();
        root.classList.toggle('eclipse', ec.on);
        root.classList.toggle('eclipse-total', ec.total);
        root.style.setProperty('--ecl', ec.cover.toFixed(3));
        root.style.setProperty('--ecl-shift', ec.shift.toFixed(3));
      }
    };
    setInterval(plot, 30000);
    // A hidden tab's timer is throttled or frozen, so it comes back holding a stale
    // position. Re-plot the moment it is looked at again, rather than leaving it wrong
    // until the next tick.
    document.addEventListener('visibilitychange', function () { if (!document.hidden) plot(); });
  }

  function reduced() {
    try { if (localStorage.getItem('pjcc.flourish') === '0') return true; } catch (e) {}
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  /* ══ "REDUCE MOTION" HAS TO BE A SWITCH, NOT A ONE-WAY DOOR (2026-07-28) ═══════
     Nate: "when the page STARTS in reduce motion, and then you try to go back to normal,
     nothing happens. But when it starts normal, you can toggle the rain back and forth."

     Exactly right, and the asymmetry is the tell. Every OTHER flourish on the site is
     pure CSS hanging off `html.reduce-flourish`, so it comes back the instant the class
     does. The weather is the one thing that has to be BUILT — hosts appended, a canvas
     created, a frame loop started — and `boot()` did that once, at load, behind an early
     `return` on `reduced()`. Start quiet and there is nothing for the class to reveal.

     Start LOUD and it looked fine only because CSS was hiding a canvas that was still
     there… and still drawing. `display:none` does NOT stop requestAnimationFrame (the
     rule the ENGINE's own guard exists for), so "reduce motion" was quietly leaving the
     frame loop running on the machines least able to afford it. Both halves are the same
     bug: the class was treated as the state instead of a consequence of it.

     So: the overlay is built once (it is static paint and belongs on every page), the
     FALLING weather is built lazily and can be started and stopped any number of times,
     and PJCCTownWeather.refresh() is the single entry point the toggle calls. ════════ */
  var overlayEl = null, fallEl = null, glassEl = null, stormed = false;

  function boot() {
    if (!overlayEl && !document.querySelector('.town-weather-overlay')) {
      // The overlay is built on EVERY day, not just wet ones: on a clear day it still
      // carries the sky-phase tint (dawn warmth / night cool), which is what makes the
      // whole town share the hour instead of only the hero. It is static paint, so it is
      // also exactly what a reduced-motion visitor keeps.
      overlayEl = document.createElement('div');
      overlayEl.className = 'town-weather-overlay';
      overlayEl.setAttribute('aria-hidden', 'true');
      document.body.appendChild(overlayEl);
    }
    startFalling();
  }

  /* Build (or rebuild) the falling weather. Safe to call repeatedly: the hosts are made
     once, and PJCCWeather.start() is itself idempotent — it re-sizes and resumes an engine
     it has already built rather than making a second one. */
  function startFalling() {
    if (kind === 'clear') return;          // nothing falling — just the phase tint
    if (reduced()) return;                 // wash + tint only — no moving parts
    var o = overlayEl;

    /* ── ONE CANVAS FOR ALL OF IT (2026-07-28) ─────────────────────────────────
       This used to append `.tw-rain` or `.tw-mist` — CSS contraptions built out of
       oversized, rotated, animated pseudo-elements. Measured at 1.20 full screens of
       GPU texture for the rain alone, after two rounds of shrinking it.

       Now the falling weather is drawn by pjcc-weather-canvas.js onto a single
       viewport-sized canvas: exactly one screen at native resolution, 0.44 at the
       dpr we cap to, and the tilt that made the CSS sheets so expensive is now just
       arithmetic in the draw call. It also brought SNOW, which in CSS would have
       meant a third contraption.

       If the canvas can't start (no 2d context — very old browser, or canvas
       disabled), we fall through to nothing rather than to a broken layer: the
       phase tint and the rain/snow color wash still carry the weather, which is
       the same thing a reduced-motion visitor gets. Degrading to "calmer" is always
       the safe direction. */
    /* ── WHERE THE WEATHER FALLS (2026-07-28) ──────────────────────────────────
       Nate: "rain, snow, etc. for ALL pages should fall BEHIND the windows. BEHIND
       the game windows, the Profile window up top, the home page boxes, the
       left-hand nav bar (condensed or expanded)… But make it show through at like
       a roughly 5-15% visibility on games, puzzles, boxes, nav."

       It used to fall on ONE layer, the wash overlay at z-index 900, which is in
       front of the page — so it rained ON your puzzle instead of outside it. Now
       there are two hosts and the engine draws once into the first and copies it
       into the second:

         .town-weather-fall   z-index: -1    behind every window, above the sky
         .town-weather-glass  z-index: 1200  in front of everything, held at ~12%

       The wash and the lightning stay on `o` at 900, where they belong: they're
       LIGHT, not water, and light does fall on the room. */
    if (!fallEl) {
      fallEl = document.createElement('div');
      fallEl.className = 'town-weather-fall';
      fallEl.setAttribute('aria-hidden', 'true');
      document.body.appendChild(fallEl);

      glassEl = document.createElement('div');
      glassEl.className = 'town-weather-glass';
      glassEl.setAttribute('aria-hidden', 'true');
      document.body.appendChild(glassEl);
    }

    if (window.PJCCWeather && PJCCWeather.start(kind, fallEl, glassEl)) {
      // ⚠ ONCE. storm() arms recurring timers for the intensity wander and the lightning;
      //   calling it again on every un-quiet would stack a second set of both.
      if (!stormed && (kind === 'rain' || kind === 'snow')) { stormed = true; storm(o); }
    } else {
      // nothing to hold — don't leave two empty fixed layers on the page
      fallEl.remove(); glassEl.remove(); fallEl = glassEl = null;
    }
  }

  /* THE SWITCH. The reduce-motion button calls this after it flips localStorage; it reads
     the world rather than being told what changed, so it is also correct if the OS-level
     prefers-reduced-motion changes underneath us. Stopping cancels the frame loop for real
     instead of leaving it drawing behind `display:none`. */
  window.PJCCTownWeather = {
    refresh: function () {
      if (reduced()) { if (window.PJCCWeather) PJCCWeather.stop(); return; }
      startFalling();
    },
    // for the harness — is a frame loop actually running right now?
    running: function () {
      try { return !!(window.PJCCWeather && PJCCWeather.debug().running); } catch (e) { return false; }
    }
  };
  // The OS switch deserves the same live response as our own button.
  try {
    var mq = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq && mq.addEventListener) mq.addEventListener('change', function () { PJCCTownWeather.refresh(); });
  } catch (e) {}

  /* The rain wanders light↔heavy through the day, and stormy dusk/nights flicker.
     (Promoted from the old hero-only engine so every screen shares the same storm.) */
  function storm(o) {
    var LEVELS = ['light', 'med', 'heavy'];
    /* Seed the opening intensity off the day (decorrelated from the rain roll).
       ⚠ THIS USED TO BE A PRIVATE COPY OF THE EXPRESSION — `(T.daySeed() >> 3) % 3` — and
       it now asks the clock, because the head include has to be able to stamp the matching
       cloud cover before first paint and there can only be one answer to "how hard is it
       coming down today". The move also fixed it: daySeed() is a full uint32, so a SIGNED
       `>> 3` went negative on half the calendar, `% 3` handed back a negative, and the
       clamp below quietly turned every one of those days into LIGHT. See PJCC_TIME.level(). */
    var idx = (forceLevel !== null) ? forceLevel : T.level();
    function setLevel(i) {
      idx = Math.max(0, Math.min(2, i));
      root.classList.remove('town-rain-light', 'town-rain-med', 'town-rain-heavy');
      root.classList.add('town-rain-' + LEVELS[idx]);
      /* ⚑ AND THE CLOUD DECK THICKENS WITH IT (2026-08-20, Nate: "the heavy rain and heavy
         snow should be cloudy… same with the rain/snow but that could be less cloudy").
         The cover was a flat overcast at every intensity, so the three levels the rest of
         the weather works to tell apart meant nothing in the sky. Now heavy wears the full
         deck and light/medium wear broken cloud — and because the storm WANDERS through
         the day, the deck rides the wander with it: `.ts-clouds` already carries a 1.4s
         opacity transition, so it thickens and thins instead of switching. That transition
         was written for something else and is what makes this free.
         ⚠ The cover for the FIRST paint is stamped in the head include off PJCC_TIME.clouds()
         — this only takes over once the storm starts moving. Both call the same function. */
      var cover = T.clouds(kind, idx);
      root.classList.remove('cloud-0', 'cloud-1', 'cloud-2', 'cloud-3');
      root.classList.add('cloud-' + cover);
      // The classes still drive the color wash in CSS; the canvas takes the number
      // and re-seeds its field, which is what actually changes how hard it's coming
      // down now that the drops are particles instead of a background image.
      if (window.PJCCWeather) PJCCWeather.setIntensity(idx);
    }
    setLevel(idx);

    // random-walk the intensity every ~40–80s so it varies through the evening
    (function wander() {
      setTimeout(function () {
        setLevel(idx + (Math.random() < 0.5 ? -1 : 1));
        wander();
      }, 40000 + Math.random() * 40000);
    })();

    // lightning: dusk/night only, and only when it's really coming down.
    // Not during snow — thundersnow is real and it is also once-a-decade weather;
    // a snowy evening that keeps flashing reads as a bug, not as a rarity.
    var ph = T.phase();
    if (kind === 'snow') return;
    if (ph !== 'dusk' && ph !== 'night') return;
    var bolt = document.createElement('div');
    bolt.className = 'tw-bolt';
    o.appendChild(bolt);
    // the home hero keeps its own trick: rare strikes backlight the Chess City skyline
    var sky = document.querySelector('.hero-skyflash');
    /* 9-26s → 24-64s (2026-07-28 pm, Nate: "take other steps to make it less
       distracting"). A full-screen flash every fifteen seconds on average is a metronome,
       and a metronome is the one thing peripheral vision cannot learn to ignore. At
       roughly three-quarters of a minute it goes back to being weather: rare enough that
       you look up when it happens instead of bracing for the next one. The flash itself
       is unchanged — it was the CADENCE that was wrong, not the bolt. */
    (function strike() {
      setTimeout(function () {
        if (idx === 2) {
          bolt.classList.remove('flash'); void bolt.offsetWidth; bolt.classList.add('flash');
          if (sky && Math.random() < 0.25) {
            sky.classList.remove('lit'); void sky.offsetWidth; sky.classList.add('lit');
          }
        }
        strike();
      }, 24000 + Math.random() * 40000);
    })();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
