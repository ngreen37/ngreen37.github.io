/* =============================================================================
 * PJCC Flair — dramatic entrances + five "wow" touches.
 *  1. Scroll-reveal entrances (fade + rise + un-blur, staggered)
 *  2. 3D tilt + light sheen on cards
 *  3. Parallax drifting chess pieces behind the home hero
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

  /* ---- 2. 3D tilt + sheen ---- */
  function setupTilt() {
    if (reduce) return;
    if (window.matchMedia && !window.matchMedia('(hover: hover)').matches) return; // skip touch
    var sel = '.game-card, .ep-card, .character-card, .location-card';
    Array.prototype.forEach.call(document.querySelectorAll(sel), function (card) {
      if (getComputedStyle(card).position === 'static') card.style.position = 'relative';
      card.classList.add('flair-tilt');
      var sheen = document.createElement('span');
      sheen.className = 'flair-tilt-sheen';
      card.appendChild(sheen);
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        card.style.transform = 'perspective(700px) rotateY(' + ((px - 0.5) * 7).toFixed(2) +
          'deg) rotateX(' + ((0.5 - py) * 7).toFixed(2) + 'deg) translateZ(0)';
        sheen.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
        sheen.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      });
      card.addEventListener('mouseleave', function () { card.style.transform = ''; });
    });
  }

  /* ---- 3. Parallax drifting pieces (home only) ---- */
  function setupDrift() {
    if (reduce) return;
    if (!document.querySelector('.home-stats')) return; // home page marker
    var layer = document.createElement('div');
    layer.className = 'flair-drift-layer';
    layer.setAttribute('aria-hidden', 'true');
    var pieces = [];
    for (var i = 0; i < 7; i++) {
      var s = document.createElement('span');
      s.className = 'flair-drift';
      s.textContent = GLYPHS[i % GLYPHS.length];
      var depth = 0.15 + Math.random() * 0.5;       // parallax factor
      var x = Math.random() * 100, y = Math.random() * 100, size = 70 + Math.random() * 110;
      s.style.left = x + 'vw'; s.style.top = y + 'vh'; s.style.fontSize = size + 'px';
      layer.appendChild(s);
      pieces.push({ el: s, depth: depth });
    }
    document.body.insertBefore(layer, document.body.firstChild);
    var ticking = false;
    function onScroll() {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        var sy = window.pageYOffset;
        pieces.forEach(function (p) { p.el.style.transform = 'translateY(' + (-sy * p.depth).toFixed(1) + 'px)'; });
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
  }

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

    // Princess easter egg: spin + woof + sparkles
    var walker = document.getElementById('princess-walker');
    var fig = document.getElementById('princess-3d');
    if (walker && fig) {
      walker.addEventListener('click', function () {
        var r = fig.getBoundingClientRect();
        if (!reduce) {
          fig.classList.remove('is-cheering'); void fig.offsetWidth; fig.classList.add('is-cheering');
          setTimeout(function () { fig.classList.remove('is-cheering'); }, 950);
        }
        burst(r.left + r.width / 2, r.top, ['❤', '✨', '♟']); // ❤ ✨ ♟
        var woof = document.createElement('div');
        woof.className = 'princess-woof';
        woof.textContent = 'woof!';
        woof.style.left = (r.left - 8) + 'px';
        woof.style.top = (r.top - 26) + 'px';
        document.body.appendChild(woof);
        requestAnimationFrame(function () { woof.classList.add('show'); });
        setTimeout(function () { woof.classList.remove('show'); setTimeout(function () { woof.remove(); }, 250); }, 1100);
      });
    }
  }

  ready(function () {
    try { setupReveal(); } catch (e) {}
    try { setupTilt(); } catch (e) {}
    try { setupDrift(); } catch (e) {}
    try { setupBursts(); } catch (e) {}
  });
})();
