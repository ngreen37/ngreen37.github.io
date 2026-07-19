/*! pjcc-reveal.js — scroll reveal (2026-07-19, the modernization mission).
 *
 *  Opt any element in with `data-reveal`; it rises + fades the first time it scrolls
 *  into view. Pure progressive enhancement, and it can NEVER strand content:
 *
 *   · Elements are only hidden by CSS when <html class="js-reveal"> is present (set in
 *     the <head> before first paint) AND motion is allowed — so a visitor with JS off,
 *     or with prefers-reduced-motion / reduce-flourish, sees everything, no flash.
 *   · If IntersectionObserver is missing or motion is reduced, we reveal everything at
 *     once and stop.
 *   · A load-time safety net reveals anything already on screen, so nothing sticks.
 *
 *  Loaded site-wide (deferred) from _layouts/default.html; the CSS lives in
 *  _sass/_pjcc-23-motion.scss.
 */
(function () {
  'use strict';
  var root = document.documentElement;
  var els = [].slice.call(document.querySelectorAll('[data-reveal]'));
  if (!els.length) return;

  function revealAll() { for (var i = 0; i < els.length; i++) els[i].classList.add('is-in'); }

  var reduced = false;
  try {
    reduced = (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) ||
              root.classList.contains('reduce-flourish');
  } catch (e) {}

  if (reduced || !('IntersectionObserver' in window)) { revealAll(); return; }

  var io = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].isIntersecting) { entries[i].target.classList.add('is-in'); io.unobserve(entries[i].target); }
    }
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.04 });

  for (var i = 0; i < els.length; i++) io.observe(els[i]);

  // safety net — never leave anything that's already on screen hidden
  window.addEventListener('load', function () {
    setTimeout(function () {
      for (var i = 0; i < els.length; i++) {
        var r = els[i].getBoundingClientRect();
        if (r.top < (window.innerHeight || root.clientHeight)) els[i].classList.add('is-in');
      }
    }, 120);
  });
})();
