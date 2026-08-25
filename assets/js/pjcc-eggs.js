/* =============================================================================
 * pjcc-eggs.js — the site-wide flair, easter eggs and small UI wiring.
 * -----------------------------------------------------------------------------
 * These were FOURTEEN separate inline <script> blocks in _layouts/default.html.
 * Inline means: re-downloaded inside the HTML of every single page, re-parsed
 * every navigation, and never cacheable on its own. As one deferred file the
 * browser fetches it once and reuses it for the whole site — and default.html
 * goes back to being readable markup.
 *
 * Deferred, so it runs after the DOM is parsed AND after the classic scripts
 * (pjcc-config / pjcc-profile), which the operative-nav block below depends on.
 * ========================================================================== */

    /* Reduce-flourish toggle — quiets ambient motion site-wide (weather, glyphs,
       splash drifters, the sigil…). Persists in localStorage; applied on <html>
       before paint by the head script above. */
    (function () {
      var b = document.getElementById('flourish-toggle');
      if (!b) return;
      function reduced() { try { return localStorage.getItem('pjcc.flourish') === '0'; } catch (e) { return false; } }
      function sync() {
        var on = reduced();
        document.documentElement.classList.toggle('reduce-flourish', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        b.textContent = on ? '✨ Motion: reduced' : '✨ Reduce motion';
      }
      b.addEventListener('click', function () {
        try { localStorage.setItem('pjcc.flourish', reduced() ? '1' : '0'); } catch (e) {}
        sync();
        /* ⚠ The class is not the whole state. Every other flourish here is CSS hanging off
           `html.reduce-flourish` and comes back with the class — but the WEATHER has to be
           built (hosts, canvas, frame loop), and on a page that STARTED quiet there is
           nothing for the class to reveal. This is the half that was missing: it also stops
           the loop for real on the way down, because `display:none` doesn't stop rAF. */
        try { if (window.PJCCTownWeather) PJCCTownWeather.refresh(); } catch (e) {}
      });
      sync();
    })();

(function() {
  var secrets = {
    'e4':    ['e4', 'The first move. Every great journey starts here.'],
    'Nf3':   ['Nf3', 'Pattern recognized. The knight knows the way.'],
    'd4':    ['d4', 'The Queen\'s pawn. Solid. Methodical. Like building a website.'],
    'O-O':   ['O-O', 'Castled. Sometimes you protect what matters most.'],
    'Ke2':   ['Ke2', 'The king walks forward. Brave. Unusual. Keep going.'],
    'h4':    ['h4', 'A flank attack. Nobody expects it. Neither did Princess.']
  };
  var buf = '';
  var timer = null;
  var toast = document.getElementById('chess-toast');
  var toastMove = document.getElementById('chess-toast-move');
  var toastMsg  = document.getElementById('chess-toast-msg');

  function playChessClick() {
    try {
      var ctx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = ctx.createOscillator(); var gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(700, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.09);
      gain.gain.setValueAtTime(0.22, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.13);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.13);
    } catch(e) {}
  }

  function showToast(move, msg) {
    if (!toast || !toastMove || !toastMsg) return;   // pages without the toast markup (e.g. game pages): no-op, no throw
    playChessClick();
    toastMove.textContent = move;
    toastMsg.textContent  = msg;
    toast.classList.add('is-visible');
    setTimeout(function() { toast.classList.remove('is-visible'); }, 3800);
  }

  document.addEventListener('keydown', function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'Escape') { buf = ''; return; }
    if (e.key.length === 1) {
      buf += e.key;
      if (buf.length > 5) buf = buf.slice(-5);
      clearTimeout(timer);
      timer = setTimeout(function() { buf = ''; }, 1800);
      for (var move in secrets) {
        if (buf.endsWith(move)) {
          /* ⛑ THE Qd5 SECRET CAME OUT 2026-08-25 (his call, with the konami code). It was the
             only entry here that did more than talk: it wrote `frag_qd5`, it advertised
             "→ /classified/" in its own toast, and typing it twice inside 30 seconds jumped
             you to /archive/. A hint that NAMES its destination is not a secret, and a
             keyboard shortcut into the Alpine wing undercuts the door the wing is supposed
             to be found by. The other six moves are chess flavor that mint nothing and go
             nowhere; they stay. */
          showToast(secrets[move][0], secrets[move][1]);
          buf = '';
          break;
        }
      }
    }
  });
})();

/* ⛑⛑ THE KONAMI CODE IS GONE — 2026-08-25. Nate: *"get rid of the chessboards, the konami
   code, the Qd5 from the site and memory… We are completely overhauling the easter egg
   process to only PJCC eggs."*

   ⭐ IT WAS THE CLEAREST CASE OF WHAT THE OVERHAUL IS FOR. Up-up-down-down is a joke about
   video games; it is not from this world, it could sit on any site ever made, and finding it
   told you nothing about Princess, Alpine or Chess City. Every egg from here is a piece of
   the world, and the reward is a fragment toward opening it — see assets/js/pjcc-fragments.js.
   ⚠⚠ `#konami-flash` STAYS, AND I ALMOST DELETED IT. The obvious cleanup — an overlay whose
   only trigger just left — is WRONG here: the MORSE egg (three rapid taps, further up this
   file) fires the same flash, and taking it out would have broken a working egg while
   "tidying up" a dead one. Checked by grep, not by assumption. If morse ever retires too,
   `#konami-flash` in _layouts/default.html and `.konami-flash` in _pjcc-07-characters.scss
   go with it — and `npm run sweep` is what will say so. */

// Transmission Received toast helper (#9)
function showTxToast(msg, duration) {
  var t = document.getElementById('tx-toast');
  var b = document.getElementById('tx-toast-body');
  if (!t || !b) return;
  b.textContent = msg;
  t.classList.add('is-visible');
  setTimeout(function() { t.classList.remove('is-visible'); }, duration || 4500);
}

// Back-to-top floating button (#14)
(function() {
  var btn = document.getElementById('back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', function() {
    btn.classList.toggle('is-visible', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', function() {
    btn.textContent = '♛';
    btn.classList.add('is-promoted');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(function() { btn.textContent = '♟'; btn.classList.remove('is-promoted'); }, 1200);
  });
})();

// Share This Transmission (#20)
(function() {
  var btn   = document.getElementById('share-tx-btn');
  var flash = document.getElementById('share-tx-flash');
  if (!btn || !flash) return;
  btn.addEventListener('click', function() {
    var url = location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(function() { showFlash(); }).catch(function() { fallback(url); });
    } else { fallback(url); }
  });
  function fallback(url) {
    var ta = document.createElement('textarea');
    ta.value = url;
    ta.style.cssText = 'position:fixed;opacity:0;';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch(e) {}
    document.body.removeChild(ta);
    showFlash();
  }
  function showFlash() {
    flash.classList.add('is-visible');
    setTimeout(function() { flash.classList.remove('is-visible'); }, 2400);
  }
})();

// Morse code easter egg — 3 rapid taps (#21)
//
// ⚠⚠ IT MOVED OFF THE HEADER BADGE ON 2026-08-09, AND IT HAD TO. The badge became a LINK
// to /projects/ (one of the three front-door marks), and this handler called
// e.preventDefault() on every click it saw — so the new link would have looked perfectly
// fine in the markup and navigated NOWHERE, forever, with nothing in the console. A tap
// cannot both follow a link and be the first of three; only one of them can own the click,
// and the link is what he asked for.
//
// Its new home is the drawer's ♛ — an ornament with no job of its own, which is what an
// egg wants: nothing else is listening, so nothing else can break. It also hides the egg
// slightly better, since you have to open the drawer to find it.
(function() {
  var host = document.querySelector('.drawer-queen');
  if (!host) return;
  host.style.cursor = 'default';
  var taps = 0; var timer = null;
  host.addEventListener('click', function() {
    taps++;
    clearTimeout(timer);
    timer = setTimeout(function() {
      if (taps >= 3) {
        var flash = document.getElementById('konami-flash');
        if (flash) { flash.classList.remove('is-active'); void flash.offsetWidth; flash.classList.add('is-active'); setTimeout(function() { flash.classList.remove('is-active'); }, 900); }
        showTxToast('— — — / . — . — / — — . — / — . — — — MORSE SIGNAL CONFIRMED');
      }
      taps = 0;
    }, 400);
  });
})();

// THE ECLIPSE DOOR (#29, 2026-08-09) — once every 29.5 days, for the ~20 minutes the sun is
// genuinely out, the black disc in the sky can be clicked. The CSS is what arms it
// (pointer-events only under html.eclipse-total.sky-day), so this handler cannot fire on an
// ordinary afternoon even if something else went wrong: the button is inert 99.9% of the
// month. ⚑ The line is a placeholder in the site's plainest voice — the town's copy is
// Nate's, and a toast nobody has approved should read like a note, not like a character.
/* ⛑⛑ BOTH SKY DOORS MINT ONE FRAGMENT — 2026-08-25. Nate: *"One egg can be catching any 1
   of the following: Full Solar Eclipse, Meteor Shower, or Northern Lights."*

   ⭐ SO THE ECLIPSE DOOR STOPPED BEING ITS OWN EGG. It used to write `frag_eclipse`, which
   nothing counted; it now mints the `sky` SLOT through the ledger, exactly like the new
   rare-sky door does. One fragment, three weathers, two buttons — and the second click of the
   pair does nothing, because `mint()` returns false once the slot is held.
   ⚠ THE TOAST IS SAID ONLY ON THE TRANSITION. Re-announcing a fragment somebody already has,
   every time they tap a pretty sky, turns a discovery into a nag.
   ⚠ `frag_eclipse` IS NOT READ ANY MORE and is not migrated. Nobody has one — there are no
   users yet, which is the same reason the Campaign URL took no redirect stub. */
(function () {
  function wire(id, line) {
    var door = document.getElementById(id);
    if (!door) return;
    door.addEventListener('click', function () {
      var isNew = window.PJCCFrag && PJCCFrag.mint('sky');
      if (isNew) showTxToast(line);
    });
  }
  wire('ts-eclipse-door', 'TOTALITY — the whole town stopped to look up. A fragment is yours.');
  wire('ts-sky-door',     'You were looking up at the right moment. A fragment is yours.');
})();

// Chess City Entry Permit badge in footer (#28)
(function() {
  var slot = document.getElementById('chess-city-permit-slot');
  if (!slot) return;
  try {
    if (localStorage.getItem('chess_city_entry')) {
      slot.innerHTML = '<span class="chess-city-permit">&#9812; CHESS CITY — ENTRY PERMIT GRANTED</span>';
    }
  } catch(e) {}
})();

// Data stream cards — inject DS flow on hover (#7)
(function() {
  var hex = '0123456789ABCDEF';
  function rh() { return hex[Math.floor(Math.random()*16)] + hex[Math.floor(Math.random()*16)]; }
  function startDs(card) {
    if (card._dsFlow) return;
    var d = document.createElement('div');
    d.className = 'ds-flow';
    card.insertBefore(d, card.firstChild);
    card._dsFlow = d;
    card._dsIv = setInterval(function() {
      var s = '';
      for (var i = 0; i < 60; i++) s += rh() + (i % 4 === 3 ? '\n' : ' ');
      d.textContent = s;
    }, 120);
  }
  function stopDs(card) {
    if (card._dsIv) clearInterval(card._dsIv);
    if (card._dsFlow) { try { card.removeChild(card._dsFlow); } catch(e) {} card._dsFlow = null; }
  }
  document.querySelectorAll('.data-stream-card').forEach(function(card) {
    card.addEventListener('mouseenter', function() { startDs(card); });
    card.addEventListener('mouseleave', function() { stopDs(card); });
  });
})();

(function() {
  var gc = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789░▒▓';
  document.addEventListener('mouseover', function(e) {
    var chip = e.target.closest('.char-chip');
    if (!chip) return;
    var n = chip.querySelector('.char-chip-name');
    if (!n || n._glitching) return;
    n._glitching = true;
    n.classList.add('is-glitching');
    var real = n.textContent;
    var i = 0;
    var iv = setInterval(function() {
      if (i >= real.length) {
        clearInterval(iv);
        n.textContent = real;
        n.classList.remove('is-glitching');
        n._glitching = false;
        return;
      }
      n.textContent = real.slice(0, i) + real.slice(i).split('').map(function(c) {
        return c === ' ' ? ' ' : gc[Math.floor(Math.random() * gc.length)];
      }).join('');
      i++;
    }, 55);
  });
})();

  (function () {
    var toggle = document.getElementById('nav-toggle');
    var nav    = document.getElementById('site-nav');
    if (!toggle || !nav) return;
    // The nav is responsive (2026-07-23). DESKTOP (>=901px): the rail is DOCKED as an
    // icons-only column and the hamburger EXPANDS it to full labels — remembered in
    // localStorage, restored before paint by the inline script in default.html. MOBILE:
    // the hamburger OPENS/CLOSES the slide-in overlay, as before. Keep the breakpoint in
    // sync with _sass/_pjcc-13-nav.scss (@media min-width:901px).
    // ⚑ 2026-08-18 (Nate: "collapse the menu by default on PC"): COLLAPSED is the default
    // now, so the hamburger's first click on a fresh browser OPENS the rail rather than
    // shutting it. Nothing in this function changed — it reads the class the pre-paint
    // script set and toggles from there, which is exactly why the default lives in one
    // place and not in two. The a11y state below follows for free.
    // ⛑ `.v2` since 2026-08-20 — renaming the key is what reset every stored
    // preference back to the collapsed default, once. MUST match the pre-paint script in
    // BOTH _layouts/default.html and _layouts/game.html; the long note is in default.html.
    var COLLAPSE_KEY = 'pjcc.nav.collapsed.v2';
    function isDesktop() { return !!(window.matchMedia && matchMedia('(min-width: 901px)').matches); }

    // reflect the docked-rail state on the hamburger for a11y (expanded = rail is open)
    if (isDesktop()) toggle.setAttribute('aria-expanded', String(!document.body.classList.contains('nav-collapsed')));

    function closeOverlay() {
      nav.classList.remove('is-open');
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }

    toggle.addEventListener('click', function () {
      if (isDesktop()) {
        var collapsed = document.body.classList.toggle('nav-collapsed');
        toggle.setAttribute('aria-expanded', String(!collapsed));
        try { localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0'); } catch (e) {}
      } else {
        var open = nav.classList.toggle('is-open');
        toggle.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
      }
    });

    // outside-click closes ONLY the mobile overlay; the docked desktop rail stays put
    document.addEventListener('click', function (e) {
      if (!isDesktop() && nav.classList.contains('is-open') &&
          !nav.contains(e.target) && !toggle.contains(e.target)) closeOverlay();
    });

    // a link tap dismisses the mobile overlay; on the docked rail it just navigates
    nav.querySelectorAll('.page-link').forEach(function (link) {
      link.addEventListener('click', function () { if (!isDesktop()) closeOverlay(); });
    });
  })();

// The footer FRAGMENTS-RECOVERED counter was retired 2026-07-15 (Nate). The eggs
// still write their frag_* flags; nothing surfaces the tally now. (Element +
// CSS removed too — see default.html and _pjcc-08-features.scss.)

// Murphy's Law, as a function. Ask it anything.
window.murphysLaw = function () {
  try { localStorage.setItem('frag_murphys_law', '1'); } catch (e) {}
  try { console.log('...called it!'); } catch (e) {}
  return false;
};

// June 13. No announcement.
(function () {
  var d = new Date();
  if (d.getMonth() !== 5 || d.getDate() !== 13) return;
  var el = document.querySelector('.footer-copy');
  if (el) el.textContent = el.textContent.replace('McPuppy Studios.', 'McPuppy Studios · for Princess.');
})();

(function () {
  var elr = document.getElementById('nav-operative');
  if (!elr || !window.PJCC) return;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  /* ⚠⚠ THE CODENAME IS WRAPPED SO A PHONE CAN DROP IT (2026-08-20). It used to be a bare
     text node beside the avatar, which CSS cannot reach — and a signed-in pill is 48px wider
     than the ⬡ Sign in the header was measured against, which is what made every phone
     narrower than ~412px pan left-to-right. On a phone the avatar alone says "you are signed
     in"; the name is one tap away on the dossier. See _pjcc-01-core.scss.
     ⭐ The wrapper is INSIDE the pill, so the accessible name, the title and pjcc-lang.js's
     do-not-translate rule all still see exactly what they saw before. */
  function name(s) { return '<span class="nav-op-name">' + esc(s) + '</span>'; }
  function upd() {
    if (!PJCC.enabled) { elr.hidden = true; return; }
    elr.hidden = false;
    var prof = PJCC.getProfile();
    if (prof) { elr.innerHTML = (PJCC.avatarMarkup ? PJCC.avatarMarkup(prof) : PJCC.avatarEmoji(prof)) + ' ' + name(prof.codename); elr.classList.add('in'); }
    else { elr.textContent = '⬡ Sign in'; elr.classList.remove('in'); }
  }
  // Instant render from the cached codename/avatar — no wait on the (deferred) SDK (#15).
  (function () {
    if (!PJCC.enabled) { elr.hidden = true; return; }
    var c, e;
    try { c = localStorage.getItem('pjcc.codename'); e = localStorage.getItem('pjcc.avataremoji'); } catch (x) {}
    elr.hidden = false;
    if (c) { elr.innerHTML = (e || '⬡') + ' ' + name(c); elr.classList.add('in'); }
    else { elr.textContent = '⬡ Sign in'; }
  })();
  PJCC.onChange(upd);
  PJCC.ready.then(upd);   // reconcile once the SDK settles
})();

