/* =============================================================================
 * PJCC Flair — dramatic entrances + five "wow" touches.
 *  1. Scroll-reveal entrances (fade + rise + un-blur, staggered)
 *  2. 3D tilt on cards
 *  3. (parallax drifting pieces removed 2026-07-10 — with the milestone crown;
 *     restore from git)
 *  4. "Journey to Chess City" scroll-progress bar
 *  5. Piece-burst confetti (back-to-top promotion + clicking Princess)
 *
 * All additive and defensive: if anything is missing it silently no-ops, and
 * reduced-motion users get the calm version.
 * ========================================================================== */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var GLYPHS = ['♙', '♘', '♗', '♖', '♕', '♔']; // ♙♘♗♖♕♔

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  /* ---- 1. Scroll-reveal entrances ---- */
  function setupReveal() {
    var sel = '.game-card, .ep-card, .character-card, .location-card, .hstat, .project-entry, .lore-card';
    var nodes = Array.prototype.slice.call(document.querySelectorAll(sel));
    if (!nodes.length) return;
    if (reduce || !('IntersectionObserver' in window)) return; // leave fully visible

    nodes.forEach(function (n) { n.classList.add('flair-reveal'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        // stagger siblings that arrive together
        var sibs = el.parentNode ? Array.prototype.indexOf.call(el.parentNode.children, el) : 0;
        el.style.transitionDelay = Math.min(sibs % 8, 8) * 55 + 'ms';
        el.classList.add('flair-in');
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    nodes.forEach(function (n) { io.observe(n); });
  }

  /* ---- 2. Subtle 3D tilt (cursor sheen discarded 2026-06-22 — it washed out
     card text and added clutter; a creative re-use is parked in FUTURE-IDEAS) ---- */
  function setupTilt() {
    if (reduce) return;
    if (window.matchMedia && !window.matchMedia('(hover: hover)').matches) return; // skip touch
    var sel = '.game-card, .ep-card, .character-card, .location-card';
    Array.prototype.forEach.call(document.querySelectorAll(sel), function (card) {
      if (getComputedStyle(card).position === 'static') card.style.position = 'relative';
      card.classList.add('flair-tilt');
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        card.style.transform = 'perspective(700px) rotateY(' + ((px - 0.5) * 7).toFixed(2) +
          'deg) rotateX(' + ((0.5 - py) * 7).toFixed(2) + 'deg) translateZ(0)';
      });
      card.addEventListener('mouseleave', function () { card.style.transform = ''; });
    });
  }

  /* ---- 3. (Parallax drifting pieces removed 2026-07-10 — Nate: "remove the
     background gold pieces." The premiere-milestone crown gathering went with
     them, since it was made of these seven pieces. Restore both from git.) ---- */

  /* ---- #16 "The wall remembers you" — DELETED 2026-07-22. THIS WAS THE JELLYBEANS.
     It drew one soft blurred splat per day you had ever visited, capped at 18, pinned
     along the bottom 30px of the footer on EVERY page (.flair-weathering, styled in
     _sass/_pjcc-11-flair.scss): 9–27px, irregular four-value border-radius, random
     rotation, blur(0.6px), in gold / lavender / teal / pink / purple / orange at
     4.5–9.5% alpha. That is a jellybean.

     It went unfound twice because it is INVISIBLE TO A FRESH BROWSER: the count is
     `min(18, visitDays - 1)`, so day one draws nothing and every screenshot, headless
     check and first-load repro came back clean. Only a returning visitor ever saw it,
     and it grew by one a day, which is exactly why Nate reported "somehow MORE of them"
     (he was on day 12 and counted 11). The 2026-07-14/15 investigations blamed the
     town-sky cloud puffs and the footer glyph ribbon instead, "fixed" those, and wrote
     the wrong conclusion into three files — see the corrected notes in
     _pjcc-04-flair.scss and _pjcc-20-town-sky.scss.

     If a return-visit reward is ever wanted again, it must be something a visitor can
     READ as intentional (a line, a count, a mark that means something), not ambient
     dirt at the foot of the page. Restore from git if that day comes. ---- */

  /* ---- Piece-burst confetti ---- */
  function burst(x, y, glyphs) {
    if (reduce) return;
    var set = glyphs || GLYPHS;
    var n = 14;
    for (var i = 0; i < n; i++) {
      (function () {
        var p = document.createElement('span');
        p.className = 'flair-particle';
        p.textContent = set[Math.floor(Math.random() * set.length)];
        p.style.left = x + 'px'; p.style.top = y + 'px';
        p.style.color = Math.random() < 0.5 ? '#F5C518' : '#ff8fd0';
        document.body.appendChild(p);
        var ang = Math.random() * Math.PI * 2;
        var dist = 40 + Math.random() * 90;
        var dx = Math.cos(ang) * dist;
        var dy = Math.sin(ang) * dist - 40;
        var rot = (Math.random() * 720 - 360);
        var dur = 700 + Math.random() * 500;
        var start = null;
        function step(ts) {
          if (start === null) start = ts;
          var t = Math.min(1, (ts - start) / dur);
          var ease = 1 - Math.pow(1 - t, 2);
          p.style.transform = 'translate(' + (dx * ease).toFixed(1) + 'px,' +
            (dy * ease + 70 * t * t).toFixed(1) + 'px) rotate(' + (rot * ease).toFixed(1) + 'deg)';
          p.style.opacity = String(1 - t);
          if (t < 1) requestAnimationFrame(step); else p.remove();
        }
        requestAnimationFrame(step);
      })();
    }
  }

  function setupBursts() {
    var btt = document.getElementById('back-to-top');
    if (btt) btt.addEventListener('click', function () {
      var r = btt.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2);
    });

    // (The Princess click easter egg went with the companion — removed 2026-07-12.)
  }

  ready(function () {
    try { setupReveal(); } catch (e) {}
    try { setupTilt(); } catch (e) {}
    try { setupBursts(); } catch (e) {}
  });
})();
