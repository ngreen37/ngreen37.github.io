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
      });
      sync();
    })();

(function() {
  var secrets = {
    'e4':    ['e4', 'The first move. Every great journey starts here.'],
    'Nf3':   ['Nf3', 'Pattern recognized. The knight knows the way.'],
    'd4':    ['d4', 'The Queen\'s pawn. Solid. Methodical. Like building a website.'],
    'O-O':   ['O-O', 'Castled. Sometimes you protect what matters most.'],
    'Qd5':   ['Qd5', 'An aggressive queen. She\'s going somewhere. → /classified/'],
    'Ke2':   ['Ke2', 'The king walks forward. Brave. Unusual. Keep going.'],
    'h4':    ['h4', 'A flank attack. Nobody expects it. Neither did Princess.']
  };
  var buf = '';
  var timer = null;
  var lastQd5 = 0;
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
          if (move === 'Qd5') {
            var now = Date.now();
            if (now - lastQd5 < 30000) { window.location.href = '/archive/'; return; }
            lastQd5 = now;
            try { localStorage.setItem('frag_qd5', '1'); } catch(e) {}
          }
          showToast(secrets[move][0], secrets[move][1]);
          buf = '';
          break;
        }
      }
    }
  });
})();

(function() {
  var seq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  var pos = 0;
  document.addEventListener('keydown', function(e) {
    if (e.key === seq[pos]) { pos++; } else { pos = (e.key === seq[0]) ? 1 : 0; }
    if (pos === seq.length) {
      pos = 0;
      var flash = document.getElementById('konami-flash');
      flash.classList.remove('is-active');
      void flash.offsetWidth;
      flash.classList.add('is-active');
      setTimeout(function() { flash.classList.remove('is-active'); }, 1500);
      try { localStorage.setItem('frag_konami', '1'); } catch(e) {}
      showTxToast('CLEARANCE LEVEL: OMEGA — She already knows you\'re here.');
    }
  });
})();

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

// Morse code logo easter egg — 3 rapid taps (#21)
(function() {
  var logo = document.querySelector('.site-logo');
  if (!logo) return;
  var taps = 0; var timer = null;
  logo.addEventListener('click', function(e) {
    e.preventDefault();
    taps++;
    clearTimeout(timer);
    timer = setTimeout(function() {
      if (taps >= 3) {
        var flash = document.getElementById('konami-flash');
        if (flash) { flash.classList.remove('is-active'); void flash.offsetWidth; flash.classList.add('is-active'); setTimeout(function() { flash.classList.remove('is-active'); }, 900); }
        showTxToast('— — — / . — . — / — — . — / — . — — — MORSE SIGNAL CONFIRMED');
      } else {
        window.location.href = logo.getAttribute('href') || '/';
      }
      taps = 0;
    }, 400);
  });
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
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('is-open') &&
          !nav.contains(e.target) && !toggle.contains(e.target)) {
        nav.classList.remove('is-open');
        toggle.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
    nav.querySelectorAll('.page-link').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('is-open');
        toggle.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
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
  function upd() {
    if (!PJCC.enabled) { elr.hidden = true; return; }
    elr.hidden = false;
    var prof = PJCC.getProfile();
    if (prof) { elr.innerHTML = PJCC.avatarEmoji(prof) + ' ' + esc(prof.codename); elr.classList.add('in'); }
    else { elr.textContent = '⬡ Sign in'; elr.classList.remove('in'); }
  }
  // Instant render from the cached codename/avatar — no wait on the (deferred) SDK (#15).
  (function () {
    if (!PJCC.enabled) { elr.hidden = true; return; }
    var c, e;
    try { c = localStorage.getItem('pjcc.codename'); e = localStorage.getItem('pjcc.avataremoji'); } catch (x) {}
    elr.hidden = false;
    if (c) { elr.innerHTML = (e || '⬡') + ' ' + esc(c); elr.classList.add('in'); }
    else { elr.textContent = '⬡ Sign in'; }
  })();
  PJCC.onChange(upd);
  PJCC.ready.then(upd);   // reconcile once the SDK settles
})();

