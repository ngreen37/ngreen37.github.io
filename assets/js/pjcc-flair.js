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

  /* ---- 3. Parallax drifting pieces (home only) ---- */
  function setupDrift() {
    if (reduce) return;
    // (marker was .home-stats; that bar became .home-basement's slim line 2026-07-08)
    if (!document.querySelector('.home-basement, .home-stats')) return; // home page marker
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
      pieces.push({ el: s, depth: depth, x: x, y: y, size: size });
    }
    document.body.insertBefore(layer, document.body.firstChild);
    var ticking = false, formed = false;
    function onScroll() {
      if (ticking || formed) return; ticking = true;
      requestAnimationFrame(function () {
        var sy = window.pageYOffset;
        if (!formed) pieces.forEach(function (p) { p.el.style.transform = 'translateY(' + (-sy * p.depth).toFixed(1) + 'px)'; });
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });

    /* #19 — on premiere-milestone days the seven drifting pieces gather once,
       hold the shape of a crown in the sky, then the wind has them back.
       Never announced; if you're there that day, you see it. */
    var CROWN = [[30,31],[70,31],[32,15],[41,23],[50,10],[59,23],[68,15]];
    function form() {
      if (formed) return;
      formed = true;
      var EASE = 'left 3.6s cubic-bezier(.3,.7,.25,1), top 3.6s cubic-bezier(.3,.7,.25,1), font-size 3.6s ease, color 3.6s ease';
      pieces.forEach(function (p, i) {
        p.el.style.transition = EASE;
        p.el.style.transform = '';
        p.el.style.left = CROWN[i % CROWN.length][0] + 'vw';
        p.el.style.top = CROWN[i % CROWN.length][1] + 'vh';
        p.el.style.fontSize = '30px';
        p.el.style.color = 'rgba(245,197,24,0.55)';
        p.el.style.textShadow = '0 0 14px rgba(245,197,24,0.55)';
      });
      setTimeout(function () {
        pieces.forEach(function (p) {
          p.el.style.left = p.x + 'vw'; p.el.style.top = p.y + 'vh';
          p.el.style.fontSize = p.size + 'px';
          p.el.style.color = ''; p.el.style.textShadow = '';
        });
        setTimeout(function () {
          pieces.forEach(function (p) { p.el.style.transition = ''; });
          formed = false; onScroll();
        }, 3700);
      }, 8200);
    }
    var daysLeft = Math.ceil((Date.parse('2027-10-21T04:00:00Z') - Date.now()) / 86400000);
    var MILES = [500, 450, 400, 365, 300, 250, 200, 150, 100, 75, 50, 30, 14, 7, 3, 1];
    if (MILES.indexOf(daysLeft) > -1) {
      var mk = 'pjcc.crown.' + daysLeft, fresh = false;
      try { fresh = !localStorage.getItem(mk); if (fresh) localStorage.setItem(mk, '1'); } catch (e) {}
      if (fresh) setTimeout(function () { if (window.scrollY < 120 && !document.hidden) form(); }, 9000);
    }
    window.__crownNight = form;
  }

  /* ---- #16 The wall remembers you — return visits leave a little more paint
     at the foot of every page. One coat per day, capped, never a word.
     Deterministic per visit-count: old splats stay put, new ones join. ---- */
  function setupWeathering() {
    var footer = document.querySelector('.site-footer');
    if (!footer) return;
    var KEY = 'pjcc.weathering', st = { d: 0, last: '' };
    try { st = JSON.parse(localStorage.getItem(KEY)) || st; } catch (e) {}
    var t = new Date(), ds = t.getFullYear() + '-' + (t.getMonth() + 1) + '-' + t.getDate();
    if (st.last !== ds) {
      st.d = Math.min(40, (st.d || 0) + 1); st.last = ds;
      try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {}
    }
    var n = Math.min(18, Math.max(0, (st.d || 0) - 1));   // day one: the wall is clean
    if (!n) return;
    function rnd(seed) {
      var x = Math.imul(seed ^ (seed >>> 15), 2246822519);
      x = Math.imul(x ^ (x >>> 13), 3266489917);
      return ((x ^= x >>> 16) >>> 0) / 4294967296;
    }
    var COLS = ['245,197,24', '176,142,255', '91,224,192', '255,143,208', '138,99,240', '255,168,60'];
    if (getComputedStyle(footer).position === 'static') footer.style.position = 'relative';
    var wrap = document.createElement('div');
    wrap.className = 'flair-weathering';
    wrap.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < n; i++) {
      var b = i * 7 + 3;
      var w = 9 + rnd(b + 1) * 18, hgt = w * (0.5 + rnd(b + 2) * 0.45);
      var sp = document.createElement('i');
      sp.style.cssText = 'left:' + (rnd(b) * 97).toFixed(1) + '%;bottom:' + (rnd(b + 3) * 10).toFixed(1) + 'px;' +
        'width:' + w.toFixed(1) + 'px;height:' + hgt.toFixed(1) + 'px;' +
        'background:rgba(' + COLS[i % COLS.length] + ',' + (0.045 + rnd(b + 4) * 0.05).toFixed(3) + ');' +
        'border-radius:' + (35 + rnd(b + 5) * 30).toFixed(0) + '% ' + (65 - rnd(b + 6) * 30).toFixed(0) + '% ' +
        (48 + rnd(b + 2) * 22).toFixed(0) + '% ' + (40 + rnd(b + 1) * 25).toFixed(0) + '%;' +
        'transform:rotate(' + (rnd(b + 5) * 360).toFixed(0) + 'deg);';
      wrap.appendChild(sp);
    }
    footer.appendChild(wrap);
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
      });
    }
  }

  ready(function () {
    try { setupReveal(); } catch (e) {}
    try { setupTilt(); } catch (e) {}
    try { setupDrift(); } catch (e) {}
    try { setupBursts(); } catch (e) {}
    try { setupWeathering(); } catch (e) {}
  });
})();
