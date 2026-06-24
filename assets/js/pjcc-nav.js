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
      { t: 'PJCC Home',        s: 'Princess & the Journey to Chess City', u: '/pjcc/',               ic: '◆', b: 'pjcc',    k: 'home princess journey chess city pjcc start' },
      { t: 'Games',            s: 'The Arcade — play now',                u: '/games/',              ic: '♟', b: 'pjcc', k: 'arcade play games blitz' },
      { t: 'The World',        s: 'Characters & Locations',               u: '/the-world/',          ic: '🌍', b: 'pjcc', k: 'world characters locations map atlas' },
      { t: 'Characters',       s: 'Meet the cast',                        u: '/characters/',         ic: '♞', b: 'pjcc', k: 'characters cast people princess kaede' },
      { t: 'Locations',        s: 'Places in the world',                  u: '/locations/',          ic: '⛰', b: 'pjcc', k: 'locations places checker town chess city' },
      { t: 'Academy',          s: 'Gamified chess curriculum',            u: '/academy/',            ic: '♔', b: 'pjcc', k: 'academy learn chess lessons belts curriculum' },
      { t: 'The Pilot',        s: 'Production & the show',                u: '/production/',         ic: '🎬', b: 'pjcc', k: 'pilot production show episode cartoon' },
      { t: 'Daily Dispatch',   s: "Today's mission & fragment",           u: '/daily/',              ic: '◈', b: 'pjcc', k: 'daily dispatch mission streak fragment today' },
      { t: 'Your Dossier',     s: 'Your profile & operative',             u: '/dossier/',            ic: '⬡', b: 'pjcc', k: 'dossier profile account sign in login operative identity forge' },
      { t: 'Leaderboards',     s: 'Hall of Fame',                         u: '/leaderboards/',       ic: '🏆', b: 'pjcc', k: 'leaderboards hall of fame scores rank high' },
      { t: 'The Reading Room', s: 'Learn Japanese kana & kanji',          u: '/games/reading-room/', ic: '🦊', b: 'pjcc', k: 'reading room japanese kana kanji kaede srs anki' },
      { t: 'Fan Art',          s: 'The fan wall + make your own card',    u: '/fan-art/',            ic: '🎨', b: 'pjcc', k: 'fan art wall community printable card make submit gallery thank you' },
      { t: 'The Gambit',       s: 'Sacrifice your best — coming soon',    u: '/games/the-gambit/',   ic: '🎲', b: 'pjcc', k: 'gambit sacrifice offering altar wager risk reward credits collectables coming soon' },
      { t: 'The Goods',        s: 'Goal cards & stationery — coming soon', u: '/goods/',             ic: '🃏', b: 'mcpuppy', k: 'goods goal cards stationery merch follow the dog mindset coming soon physical' },
      { t: 'The Direct Line',  s: 'Write to me directly — coming soon',    u: '/direct-line/',        ic: '✉️', b: 'mcpuppy', k: 'direct line suggestions patreon contact write feedback guaranteed response coming soon' },
      { t: 'McPuppy Studios',  s: 'Studio hub & progress',                u: '/projects/',           ic: '🐾', b: 'mcpuppy', k: 'mcpuppy studio projects progress hub' },
      { t: 'Build Log (Blog)', s: 'Episode archive',                      u: '/blog/',               ic: '✍', b: 'mcpuppy', k: 'blog build log episodes posts writing' },
      { t: 'Mailing List',     s: 'Get dispatches by email',              u: '/mailing-list/',       ic: '✉', b: 'mcpuppy', k: 'mailing list email subscribe newsletter' },
      { t: 'Press Pass',       s: 'Become a founding operative',          u: '/press-pass/',         ic: '🎟', b: 'mcpuppy', k: 'press pass founding operative support patron' },
      { t: 'For Educators',    s: 'Use PJCC in the classroom',            u: '/educators/',          ic: '🍎', b: 'mcpuppy', k: 'educators teachers classroom school lessons' },
      { t: 'About / Contact',  s: 'Who & how to reach us',                u: '/about/',              ic: '☎', b: 'mcpuppy', k: 'about contact reach email who studio' },
      { t: 'The Splash',       s: 'The front door',                       u: '/',                    ic: '⬛', b: 'mcpuppy', k: 'home splash front door start landing' }
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
          '”. Try “games”, “dossier”, or “blog”.</li>';
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

    // Show the right modifier in the trigger pill (⌘ on mac, Ctrl elsewhere).
    var isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent || '');
    if (!isMac) {
      var kbd = document.querySelector('.cmdk-trigger-kbd');
      if (kbd) kbd.textContent = 'Ctrl K';
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

  /* ============================================================
     3. MOBILE ICON NAV — reveal label on long-press, navigate on tap
     ============================================================ */
  (function () {
    var navItems = document.querySelectorAll('.mnav-item');
    if (!navItems.length) return;
    Array.prototype.forEach.call(navItems, function (item) {
      var timer = null;
      var shown = false;
      function clear() { clearTimeout(timer); }
      item.addEventListener('touchstart', function () {
        shown = false;
        timer = setTimeout(function () { item.classList.add('show-label'); shown = true; }, 320);
      }, { passive: true });
      item.addEventListener('touchend', function (e) {
        clear();
        if (shown) {
          e.preventDefault(); // long-press = reveal label only, suppress navigation
          setTimeout(function () { item.classList.remove('show-label'); }, 1100);
        }
      });
      item.addEventListener('touchmove', function () { clear(); item.classList.remove('show-label'); }, { passive: true });
      item.addEventListener('touchcancel', function () { clear(); item.classList.remove('show-label'); });
    });
  })();

})();
