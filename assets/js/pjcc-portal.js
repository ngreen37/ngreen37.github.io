/* =============================================================================
 * PJCC · The Shogi Island Gate  (Avenue 13 — access puzzles / hidden portals)
 * -----------------------------------------------------------------------------
 * You don't click in. You perform the rite, scattered through the world as a
 * sigil: "one A and eight c's — the first two struck large, the last struck small."
 *
 *   The a-file bell:   one A
 *   The c-file stones: eight c's
 *   The opening strike: the FIRST TWO c are larger (capital C); the LAST is small
 *
 * So the incantation is:  A · C C c c c c c c   →  type it ANYWHERE on the site
 * (two capital C's at the head, then six lowercase). A faint sigil lights stone by
 * stone as you get it right; complete it and the gate opens with a cinematic.
 * Loaded site-wide; runs on every page, ignores text fields, fully defensive.
 *   window.PJCCGate.tryPhrase(str)  — used by the /shogi-gate/ carving input
 *   window.PJCCGate.open()          — play the cinematic (also sets the flag)
 *   window.PJCCGate.isOpen()        — has the gate ever been opened on this device
 * ========================================================================== */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Each slot lists its accepted character(s). Caps required on the first two
  // c-stones (the two "larger" strikes); the remaining six are lowercase.
  var TARGET = ['Aa', 'C', 'C', 'c', 'c', 'c', 'c', 'c', 'c'];
  var STONES = TARGET.length - 1;                 // 8 c-stones
  var PHRASE_RE = /[Aa]CCc{6}/;                   // for the carving input

  function isOpen() { try { return localStorage.getItem('shogi_gate_open') === '1'; } catch (e) { return false; } }
  function markOpen() { try { localStorage.setItem('shogi_gate_open', '1'); localStorage.setItem('frag_portal', '1'); } catch (e) {} }

  // ---- the faint rite-progress sigil --------------------------------------
  var prog = null;
  function buildProg() {
    if (prog) return prog;
    prog = document.createElement('div'); prog.className = 'pgate-prog'; prog.setAttribute('aria-hidden', 'true');
    var bell = document.createElement('span'); bell.className = 'pp-bell'; bell.textContent = '🔔'; prog.appendChild(bell);
    for (var i = 0; i < STONES; i++) {
      var s = document.createElement('span'); s.className = 'pp-stone' + (i === 0 || i === 1 ? ' big' : (i === STONES - 1 ? ' sm' : ''));
      prog.appendChild(s);
    }
    (document.body || document.documentElement).appendChild(prog);
    return prog;
  }
  function showProgress(pos) {
    var p = buildProg();
    if (pos <= 0) { p.classList.remove('show'); return; }
    p.classList.add('show');
    p.querySelector('.pp-bell').classList.toggle('lit', pos >= 1);
    var stones = p.querySelectorAll('.pp-stone'), lit = Math.max(0, pos - 1);
    for (var i = 0; i < stones.length; i++) stones[i].classList.toggle('lit', i < lit);
  }
  function hideProgress() { if (prog) prog.classList.remove('show'); }

  // ---- the rite matcher (position pointer, Konami-style) ------------------
  var pos = 0, idleT = null;
  function resetIdle() { clearTimeout(idleT); idleT = setTimeout(function () { pos = 0; hideProgress(); }, 3500); }
  function feed(ch) {
    if (TARGET[pos] && TARGET[pos].indexOf(ch) >= 0) pos++;
    else pos = (TARGET[0].indexOf(ch) >= 0) ? 1 : 0;
    showProgress(pos);
    resetIdle();
    if (pos >= TARGET.length) { pos = 0; hideProgress(); open(); }
  }

  document.addEventListener('keydown', function (e) {
    if (gateEl || isOpen()) return;                       // already opening / opened
    var t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var k = e.key;
    if (k && k.length === 1 && 'AaCc'.indexOf(k) >= 0) feed(k);
    else if (pos) { pos = 0; hideProgress(); }             // any stray key breaks the rite
  });

  // ---- the cinematic ------------------------------------------------------
  var gateEl = null, timers = [];
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }

  function onGatePage() { return /\/shogi-gate\/?$/.test(location.pathname); }

  function open() {
    if (gateEl) return;
    markOpen();
    hideProgress();
    gateEl = document.createElement('div');
    gateEl.className = 'pgate-ov';

    var stones = '';
    for (var i = 0; i < STONES; i++) {
      var big = (i === 0 || i === STONES - 1);
      stones += '<span class="pgate-stone' + (big ? ' big' : '') + '">' + (big ? 'C' : 'c') + '</span>';
    }
    gateEl.innerHTML =
      '<div class="pgate-skip">click to enter ▸</div>' +
      '<div class="pgate-fog"></div><div class="pgate-water"></div>' +
      '<div class="pgate-stage">' +
        '<div class="pgate-bell">🔔</div>' +
        '<div class="pgate-file">' + stones + '</div>' +
        '<div class="pgate-torii">⛩️</div>' +
      '</div>' +
      '<div class="pgate-card">' +
        '<div class="pgate-eyebrow">◈ the rite is answered</div>' +
        '<div class="pgate-title">The Gate Remembers You</div>' +
        '<div class="pgate-sub">Eight stones on the c-file. One bell on the a. Two struck large to open, one small to close — and the old ferry to <b>Shogi Island</b> remembers the way back.</div>' +
        '<a class="pgate-enter" href="/shogi-gate/">⛩ Cross to Shogi Island</a>' +
      '</div>';
    document.body.appendChild(gateEl);
    document.body.style.overflow = 'hidden';

    var enter = gateEl.querySelector('.pgate-enter');
    enter.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); go(); });
    gateEl.addEventListener('click', skipToEnd);

    if (reduce) { gateEl.classList.add('in', 'phase-assemble', 'phase-flare', 'phase-gate'); return; }
    requestAnimationFrame(function () { gateEl.classList.add('in'); });
    later(function () { gateEl.classList.add('phase-assemble'); chime(523.25); }, 250);   // C5
    later(function () { gateEl.classList.add('phase-flare'); chime(440.00); }, 1500);     // A4 (the bell)
    later(function () { gateEl.classList.add('phase-gate'); chime(1046.5); }, 2700);      // C6 (the octave)
  }

  function skipToEnd() {
    if (!gateEl) return;
    clearTimers();
    gateEl.classList.add('in', 'phase-assemble', 'phase-flare', 'phase-gate');
  }
  function go() {
    if (onGatePage()) location.reload();
    else location.href = '/shogi-gate/';
  }

  // a soft bell so the rite has a voice (no asset; WebAudio sine)
  var actx = null;
  function chime(freq) {
    if (reduce) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === 'suspended') actx.resume();
      var o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime;
      o.type = 'sine'; o.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.16, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
      o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + 1.45);
    } catch (e) {}
  }

  document.addEventListener('keydown', function (e) {
    if (gateEl && e.key === 'Escape') skipToEnd();
  });

  // ---- the carving input on /shogi-gate/ ----------------------------------
  function tryPhrase(str) {
    if (PHRASE_RE.test(String(str || ''))) { open(); return true; }
    return false;
  }

  window.PJCCGate = { open: open, tryPhrase: tryPhrase, isOpen: isOpen };
})();
