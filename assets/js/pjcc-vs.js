/* =============================================================================
 * PJCCVs — the VS layer: the aura rails, and the Gauntlet's cut-scene.
 * -----------------------------------------------------------------------------
 * 2026-08-13. Nate: "the horizontal streaks with the auras are great … Let's keep it this
 * way for all chess games, and then let's add the cut-scene to JUST the gauntlet for now."
 *
 * Pairs with _sass/_pjcc-28-vs.scss (served to the standalone game shells as
 * /assets/css/vs-aura.css). This file is the MARKUP and the COLOR LOOKUP; the stylesheet
 * is the look. A room calls two functions and knows nothing else about either.
 *
 *   PJCCVs.bar(color, dir[, id])   -> the rail's HTML string. dir 1 = left-to-right (the
 *                                     opponent, above the board), -1 = right-to-left (you,
 *                                     below it). Nate's arrangement, so the two are always
 *                                     running AT each other with the board between them.
 *   PJCCVs.color(x)                -> a hex, from a profile / a look / a bare aura key.
 *   PJCCVs.paint(id, color)        -> retint a rail already on the page (an opponent's
 *                                     color usually arrives after the board is drawn).
 *   PJCCVs.cut(host, opts)         -> play the cut-scene inside `host`, resolve when done.
 *
 * ⚠ NO PALETTE LIVES HERE. `PJCC.auraColor()` in pjcc-profile.js owns the twelve hex
 * values and the Forge reads the same map; a second copy in a helper is a copy that drifts
 * the first time a color is tuned. This file only knows what to do when PJCC is absent —
 * which is a real case, because the game shells load before the network settles and some
 * of them run signed out.
 * ========================================================================== */
(function () {
  'use strict';

  var FALLBACK = '#cdbcf2';   // `mono` — the site's "no color chosen", never gold

  function color(x) {
    try {
      if (window.PJCC && PJCC.auraColor) return PJCC.auraColor(x);
    } catch (e) {}
    return FALLBACK;
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function bar(c, dir, id) {
    return '<div class="vs-aura" aria-hidden="true"' + (id ? ' id="' + esc(id) + '"' : '') +
           ' style="--aura:' + esc(c || FALLBACK) + ';--dir:' + (dir === -1 ? -1 : 1) + '"><i></i></div>';
  }

  function paint(id, c) {
    var el = typeof id === 'string' ? document.getElementById(id) : id;
    if (el) el.style.setProperty('--aura', c || FALLBACK);
  }

  /* ── THE CUT-SCENE ──────────────────────────────────────────────────────────────────
     Builds the card, plays it, removes itself, and resolves. The caller starts the match
     in the callback, so the board is never behind the overlay waiting to be uncovered —
     it does not exist yet, which is also why a skipped cut-scene costs nothing.

     ⚠⚠ IT RESOLVES EXACTLY ONCE. A skip tap, the keydown, the animation end and the
     failsafe timer can all arrive, and two of them arriving means startRung() runs twice —
     which in the Gauntlet is a second board over the first one. `done` is the guard and
     every path goes through it.
     ⚠ THE FAILSAFE TIMER IS NOT BELT-AND-BRACES. `animationend` does not fire if the
     element is display:none'd, if the tab is backgrounded at the wrong moment, or if a
     browser refuses the animation outright — and every one of those leaves the player
     staring at a title card with no way into the match. The timer is what makes the
     cut-scene unable to trap anybody. */
  function cut(host, opts) {
    opts = opts || {};
    return new Promise(function (resolve) {
      if (!host) { resolve(); return; }

      var el = document.createElement('div');
      el.className = 'vs-cut';
      el.setAttribute('role', 'presentation');
      var you = opts.you || {}, opp = opts.opp || {};

      el.innerHTML =
        '<div class="vs-cut-lines"></div>' +
        '<div class="vs-cut-band vs-cut-band--top" style="--c:' + esc(opp.color || FALLBACK) + '">' +
          '<span class="vs-cut-label">' +
            (opp.glyph ? '<span class="vs-cut-glyph">' + esc(opp.glyph) + '</span>' : '') +
            '<span class="vs-cut-name">' + esc(opp.name || 'Challenger') +
              (opp.sub ? '<span class="vs-cut-sub">' + esc(opp.sub) + '</span>' : '') +
            '</span>' +
          '</span>' +
        '</div>' +
        '<div class="vs-cut-band vs-cut-band--bot" style="--c:' + esc(you.color || FALLBACK) + '">' +
          '<span class="vs-cut-label">' +
            '<span class="vs-cut-name">' + esc(you.name || 'Player') +
              (you.sub ? '<span class="vs-cut-sub">' + esc(you.sub) + '</span>' : '') +
            '</span>' +
            (you.glyph ? '<span class="vs-cut-glyph">' + esc(you.glyph) + '</span>' : '') +
          '</span>' +
        '</div>' +
        '<div class="vs-cut-flash"></div>' +
        '<div class="vs-cut-vs">VS</div>' +
        '<div class="vs-cut-skip">TAP TO SKIP</div>';

      host.appendChild(el);

      var fired = false, timer = null;
      function done() {
        if (fired) return;
        fired = true;
        clearTimeout(timer);
        document.removeEventListener('keydown', onKey, true);
        if (el.parentNode) el.parentNode.removeChild(el);
        resolve();
      }
      function onKey() { done(); }

      el.addEventListener('pointerdown', done);
      document.addEventListener('keydown', onKey, true);
      /* ⚠ THE WRAPPER'S OWN fade-out is the last thing to finish, and `animationend`
         bubbles from the children too — so this has to check whose animation ended or it
         tears the card down 0.3s in, when the first band lands. */
      el.addEventListener('animationend', function (ev) {
        if (ev.target === el) done();
      });
      timer = setTimeout(done, 3400);
    });
  }

  window.PJCCVs = { bar: bar, color: color, paint: paint, cut: cut, FALLBACK: FALLBACK };
})();
