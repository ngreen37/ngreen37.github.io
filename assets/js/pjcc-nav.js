/* PJCC nav: ⌘K command palette, sticky condense on scroll, mobile long-press labels.
   Self-contained; each feature guards on its own elements so a missing piece is harmless. */
(function () {
  'use strict';

  /* ============================================================
     1. ⌘K COMMAND PALETTE — search & jump anywhere
     ============================================================ */
  (function () {
    var overlay = document.getElementById('cmdk-overlay');
    var input   = document.getElementById('cmdk-input');
    var list    = document.getElementById('cmdk-list');
    var trigger = document.getElementById('cmdk-trigger');
    if (!overlay || !input || !list) return;

    // Destinations (b = brand tag for the little pill).
    var DEST = [
      { t: 'Home',             s: 'ChessWild.com — play, solve, learn',   u: '/',                        ic: '♔', b: 'pjcc',    k: 'home chesswild chess wild front door start play free mcpuppy' },
      { t: 'PJCC',             s: 'The world — cast, places, fan art',    u: '/pjcc/',                   ic: '◆', b: 'pjcc',    k: 'pjcc world princess journey chess city landing series show' },
      { t: 'Play Now',         s: 'Sit at the Park Tables',               u: '/games/park-tables/',      ic: '▶', b: 'pjcc',    k: 'play now park tables live game match rated correspondence' },
      { t: 'The Gauntlet',     s: 'Climb the tower of ten',               u: '/games/the-gauntlet/',     ic: '♛', b: 'pjcc',    k: 'gauntlet tower climb ladder ten floors bosses' },
      { t: 'Puzzles',          s: 'Fork in the Road',                     u: '/games/fork-in-the-road/', ic: '♞', b: 'pjcc',    k: 'puzzles fork in the road tactics only move solve' },
      { t: 'All Games',        s: 'The Arcade — the whole grid',          u: '/games/',                  ic: '♟', b: 'pjcc',    k: 'arcade play games blitz all hall grid' },
      { t: 'Academy',          s: 'Learn chess from the ground up',            u: '/academy/',            ic: '📖', b: 'pjcc', k: 'academy learn chess lessons pieces bootcamp curriculum' },
      { t: 'Leaderboards',     s: 'Top scores across the games',          u: '/leaderboards/',       ic: '🏆', b: 'pjcc', k: 'leaderboards standings scores rank high' },
      { t: 'Fan Art',          s: 'The fan wall + a printable PJCC card',  u: '/fan-art/',            ic: '🎨', b: 'pjcc', k: 'fan art wall gallery printable card make picture upload print pdf submit' },
      { t: 'The Gambit',       s: 'Lay down your best — the board decides', u: '/the-gambit/',       ic: '🎲', b: 'pjcc', k: 'gambit sacrifice offering altar wager risk reward credits collectables let go' },
      { t: 'Merch',            s: 'Next up — the designs come first',     u: '/goods/',              ic: '🃏', b: 'mcpuppy', k: 'goods goal cards stationery merch follow the dog mindset physical' },
      { t: 'The Direct Line',  s: 'Write to me directly',                 u: '/direct-line/',        ic: '✉️', b: 'mcpuppy', k: 'direct line suggestions patreon contact write feedback guaranteed response' },
      { t: 'Projects',         s: 'Inside McPuppy Studios — the roadmap', u: '/projects/',           ic: '📋', b: 'mcpuppy', k: 'projects mcpuppy studio progress about who nate hub roadmap thanks counters' },
      { t: 'Blog',             s: 'The build log — every episode so far',   u: '/blog/',               ic: '✍', b: 'mcpuppy', k: 'blog build log episodes posts writing' },
      { t: 'Mailing List',     s: 'Get updates by email',                 u: '/mailing-list/',       ic: '✉', b: 'mcpuppy', k: 'mailing list email subscribe newsletter' },
      { t: 'For Educators',    s: 'Use PJCC in the classroom',            u: '/educators/',          ic: '🍎', b: 'mcpuppy', k: 'educators teachers classroom school lessons' },
    ];

    var active = 0;
    var results = [];

    function esc(s) {
      return String(s).replace(/[&<>"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
      });
    }
    function brandTag(b) {
      return b === 'mcpuppy'
        ? '<span class="cmdk-item-brand is-mcpuppy">McPuppy</span>'
        : '<span class="cmdk-item-brand is-pjcc">PJCC</span>';
    }

    function score(item, q) {
      if (!q) return 1;
      var title = item.t.toLowerCase();
      var hay = (item.t + ' ' + item.s + ' ' + item.k).toLowerCase();
      if (title.indexOf(q) === 0) return 100;   // title prefix
      if (title.indexOf(q) > -1) return 60;      // title substring
      if (hay.indexOf(q) > -1) return 30;        // anywhere in keywords
      var qi = 0;                                // fuzzy subsequence
      for (var i = 0; i < hay.length && qi < q.length; i++) {
        if (hay.charAt(i) === q.charAt(qi)) qi++;
      }
      return qi === q.length ? 10 : 0;
    }

    function render(q) {
      q = (q || '').trim().toLowerCase();
      results = DEST
        .map(function (d) { return { d: d, sc: score(d, q) }; })
        .filter(function (r) { return r.sc > 0; })
        .sort(function (a, b) { return b.sc - a.sc; })
        .map(function (r) { return r.d; });

      if (!results.length) {
        list.innerHTML = '<li class="cmdk-empty">Nothing matches “' + esc(q) +
          '”. Try “games”, “academy”, or “blog”.</li>';
        active = -1;
        return;
      }
      active = 0;
      list.innerHTML = results.map(function (d, i) {
        return '<li><a class="cmdk-item' + (i === 0 ? ' is-active' : '') +
          '" role="option" href="' + d.u + '" data-i="' + i + '">' +
          '<span class="cmdk-item-ico" aria-hidden="true">' + d.ic + '</span>' +
          '<span class="cmdk-item-text"><span class="cmdk-item-title">' + esc(d.t) + '</span>' +
          '<span class="cmdk-item-sub">' + esc(d.s) + '</span></span>' +
          brandTag(d.b) + '</a></li>';
      }).join('');
    }

    function items() { return list.querySelectorAll('.cmdk-item'); }

    function setActive(i) {
      var els = items();
      if (!els.length) return;
      active = (i + els.length) % els.length;
      for (var n = 0; n < els.length; n++) els[n].classList.toggle('is-active', n === active);
      if (els[active]) els[active].scrollIntoView({ block: 'nearest' });
    }

    function go() {
      var els = items();
      if (els[active]) window.location.href = els[active].getAttribute('href');
    }

    function open() {
      overlay.hidden = false;
      document.body.style.overflow = 'hidden';
      input.value = '';
      render('');
      setTimeout(function () { input.focus(); }, 30);
    }
    function close() {
      overlay.hidden = true;
      document.body.style.overflow = '';
    }
    function toggle() { if (overlay.hidden) open(); else close(); }

    if (trigger) trigger.addEventListener('click', open);

    document.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        toggle();
        return;
      }
      if (overlay.hidden) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); setActive(active + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active - 1); }
      else if (e.key === 'Enter') { e.preventDefault(); go(); }
    });

    input.addEventListener('input', function () { render(input.value); });

    list.addEventListener('mousemove', function (e) {
      var it = e.target.closest && e.target.closest('.cmdk-item');
      if (!it) return;
      var i = parseInt(it.getAttribute('data-i'), 10);
      if (!isNaN(i) && i !== active) setActive(i);
    });

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay || (e.target.hasAttribute && e.target.hasAttribute('data-cmdk-close'))) {
        close();
      }
    });

    // Show the right modifier in the trigger pill. The MARKUP now ships "Ctrl K" and this
    // upgrades it to ⌘K on a Mac — the other way round from before (2026-07-28). Windows
    // and Android are most of the audience, and they were the ones seeing a symbol from
    // someone else's keyboard for the first frame of every page load.
    var isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent || '');
    if (isMac) {
      var kbd = document.querySelector('.cmdk-trigger-kbd');
      if (kbd) kbd.textContent = '⌘K';
    }
  })();

  /* ============================================================
     2. STICKY CONDENSE — header shrinks to watermark + ⌘K on scroll
     ============================================================ */
  (function () {
    var header = document.querySelector('.site-header');
    if (!header) return;
    // Hysteresis (dead-band): condensing the header shortens it, which nudges the
    // scroll position back across a single threshold and causes a flip-flop twitch.
    // Two separated thresholds (condense >210, expand <110) give a 100px dead-band.
    var DOWN = 210, UP = 110;
    var condensed = false;
    var ticking = false;
    function update() {
      var y = window.pageYOffset || window.scrollY || 0;
      if (!condensed && y > DOWN) { condensed = true; header.classList.add('is-condensed'); }
      else if (condensed && y < UP) { condensed = false; header.classList.remove('is-condensed'); }
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    update();
  })();

  /* (3. mobile icon nav removed from the DOM 2026-07-07; its handler cleaned
     out 2026-07-11 — restore both from git if the bar ever returns) */

})();
