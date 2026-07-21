/* ============================================================
   PJCC warp — click a hub tile marked [data-warp] and the whole screen
   blooms to that tile's color (its --c accent), then navigates. It mirrors
   the splash quads' enter-wipe, but reads the color per-tile, so the same
   file lights up the Games halls, The World pillars, and future hubs.

   Event-delegated on the document, so it also covers tiles injected after
   load (e.g. the Games halls, which are built by JS). Plain left-clicks only:
   ⌘/ctrl/shift/middle-clicks and target="_blank" links are left untouched.
   ============================================================ */
(function () {
  'use strict';

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // One shared overlay for the whole page.
  var warp = document.createElement('div');
  warp.className = 'pjcc-warp';
  warp.setAttribute('aria-hidden', 'true');
  (document.body || document.documentElement).appendChild(warp);

  // Clear the wipe when the page is shown again. A Back navigation restores the
  // page from the bfcache with the overlay still on, which otherwise leaves you
  // stuck staring at the full-screen color.
  window.addEventListener('pageshow', function () { warp.classList.remove('is-on'); });

  function accent(el) {
    var c = (getComputedStyle(el).getPropertyValue('--c') || '').trim();
    return c || '#8a63ff';
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest ? e.target.closest('[data-warp]') : null;
    if (!el) return;

    // Respect new-tab / modified clicks, external links, and in-page anchors.
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (el.getAttribute('target') === '_blank') return;
    var href = el.getAttribute('href');
    if (!href || href.charAt(0) === '#') return;

    e.preventDefault();
    if (reduce) { window.location.href = href; return; }

    // Bloom from the tile's own position, so the color spreads from where you tapped.
    var r = el.getBoundingClientRect();
    var cx = Math.round((r.left + r.width / 2) / window.innerWidth * 100);
    var cy = Math.round((r.top + r.height / 2) / window.innerHeight * 100);
    warp.style.background = 'radial-gradient(circle at ' + cx + '% ' + cy + '%, ' +
      accent(el) + ', #06040e 72%)';
    warp.classList.add('is-on');
    setTimeout(function () { window.location.href = href; }, 255);
  }, false);
})();
