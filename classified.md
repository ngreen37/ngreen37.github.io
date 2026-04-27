---
layout: easter-eggs
title: CLASSIFIED
permalink: /classified/
---

<div class="burn-overlay" id="burn-overlay"></div>
<div class="burn-countdown" id="burn-countdown">
  <span class="burn-countdown-number" id="burn-number"></span>
</div>

<div class="classified-page">

  <header class="classified-header">
    <div class="classified-ping-container">
      <div class="classified-ping-icon">⊙</div>
    </div>
    <div class="classified-header-bar">
      <span class="classified-status">SIGNAL ACQUIRED</span>
      <span class="classified-dots">• • •</span>
      <span class="classified-status">DECRYPTION COMPLETE</span>
    </div>
    <div class="classified-stamp-wrap">
      <span class="classified-stamp">CLASSIFIED</span>
    </div>
    <h1 class="classified-title" data-text="PJCC: THE LOST FILES">PJCC: THE LOST FILES</h1>
    <div class="classified-subtitle">FRAGMENT ARCHIVE &mdash; EYES ONLY</div>
    <div class="classified-coords">
      ORIGIN:&nbsp;<span class="classified-redact c-reveal" data-real="CHECKER TOWN, SECTOR 7">████████████</span>&nbsp;&nbsp;
      FREQ:&nbsp;<span class="classified-redact c-reveal" data-real="7291">████</span>&nbsp;&nbsp;
      AGENT:&nbsp;<span class="classified-redact c-reveal" data-real="OPERATIVE NGREEN37">████████</span>
    </div>
    <div class="classified-secret-text" aria-hidden="true">CONGRATULATIONS, OPERATIVE. YOU'VE BEEN EXPECTED.</div>
  </header>

  <div class="classified-warning-banner">
    <span>⚠</span>
    UNAUTHORIZED ACCESS DETECTED &mdash; INITIATING DOCUMENTATION PROTOCOL
    <span>⚠</span>
  </div>
  <div class="classified-subwarning">
    You weren't supposed to find this. But since you're here — welcome to the archive.
  </div>

  <div class="classified-burn-top">
    <button class="classified-destruct-btn classified-destruct-btn--small" id="destruct-btn-top" onclick="igniteSequence()">
      ▸ &nbsp; BURN NOW
    </button>
  </div>

  <div class="classified-files">

    <article class="classified-file classified-file--open">
      <div class="classified-file-meta">
        <span class="classified-file-id">FRAGMENT — 001</span>
        <span class="classified-file-tag">ORIGIN STORY</span>
        <span class="classified-file-clearance">CLEARANCE: DELTA</span>
      </div>
      <h2 class="classified-file-title">The Crash</h2>
      <div class="classified-file-body">
        <p>Subject arrived via vessel belonging to an <strong>interplanetary construction company</strong>. Vessel sustained critical damage during final approach sequence. Emergency departure protocol was executed. Subject was left behind.</p>
        <p>Current status: <span class="classified-inline-tag">ALIVE</span> &nbsp; Integration into local population: <span class="classified-inline-tag">COMPLETE</span> &nbsp; Memory of origin: <span class="classified-inline-tag">REDACTED</span></p>
        <p class="classified-note">Note: Clues have been embedded throughout the series. Pay attention to the shadows. And the construction equipment.</p>
      </div>
    </article>

    <article class="classified-file classified-file--open">
      <div class="classified-file-meta">
        <span class="classified-file-id">FRAGMENT — 002</span>
        <span class="classified-file-tag">BEHAVIORAL PROFILE</span>
        <span class="classified-file-clearance">CLEARANCE: DELTA</span>
      </div>
      <h2 class="classified-file-title">The Leafs Connection</h2>
      <div class="classified-file-body">
        <p>Subject has demonstrated an unexplained allegiance to the <strong>Chess City Leafs</strong>. Intelligence suggests this may be a residual behavioral imprint from before the crash.</p>
        <p>Field observation: when the operative departs for work, subject activates audio playback. Upon return, audio has shifted — without intervention — to <strong>Toronto Maple Leafs broadcast content</strong>. Analyst split-screen format. Every time. Without fail.</p>
        <p class="classified-note">Current working theory: she was a fan before she got here. This is not up for debate.</p>
      </div>
    </article>

    <article class="classified-file classified-file--open">
      <div class="classified-file-meta">
        <span class="classified-file-id">FRAGMENT — 003</span>
        <span class="classified-file-tag">VISUAL ANOMALY</span>
        <span class="classified-file-clearance">CLEARANCE: OMEGA</span>
      </div>
      <h2 class="classified-file-title">The Mirror Protocol</h2>
      <div class="classified-file-body">
        <p>All characters in the series are rendered in <strong>low-poly 3D</strong>. This is by design. The world is stylized, deliberate, stripped to geometry.</p>
        <p>However: wherever a <strong>reflective surface</strong> appears — a mirror, still water, polished chess pieces, a window at night — the reflection will be rendered in <strong>photorealistic detail</strong>. Full texture. Full light simulation. Shocking fidelity.</p>
        <p>The first time a viewer notices this discrepancy, they will stop and rewind. That is the intended response. The second time, they will start looking for every reflective surface in every scene.</p>
        <p class="classified-note">Note: This is a true Easter Egg. You are reading it before it ships. Keep this between us.</p>

        <!-- LIVE DEMO of the Mirror Protocol -->
        <div class="mirror-proto-section">
          <div class="mirror-proto-eyebrow">— LIVE DEMONSTRATION —</div>
          <div class="mirror-proto-title">See it for yourself. Drag the divider.</div>
          <div class="img-compare" id="mirror-compare" style="height:320px;max-width:580px;margin:0 auto;">
            <img src="{{ '/assets/images/Princess_Color_v01.jpg' | relative_url }}" alt="Low-poly render">
            <div class="img-compare-after" id="mirror-after" style="width:50%;">
              <img src="{{ '/assets/images/Princess-1.png' | relative_url }}" alt="Real Princess">
            </div>
            <div class="img-compare-handle" id="mirror-handle" style="left:50%;"></div>
            <span class="img-compare-label img-compare-label-left">Rendered</span>
            <span class="img-compare-label img-compare-label-right">Real</span>
          </div>
          <div class="mirror-proto-note">The reflection knows what it is.</div>
        </div>
      </div>
    </article>

    <article class="classified-file classified-file--locked">
      <div class="classified-file-meta">
        <span class="classified-file-id">FRAGMENT — 004</span>
        <span class="classified-file-tag classified-file-tag--locked">ENCRYPTED</span>
        <span class="classified-file-clearance">CLEARANCE: ABOVE OMEGA</span>
      </div>
      <h2 class="classified-file-title c-reveal" data-real="The Real Origin Story">████████ ██████ ████████</h2>
      <div class="classified-file-body classified-file-body--locked">
        <p class="c-reveal" data-real="Subject's origin coordinates match no known planetary system in the current database. Cross-referencing with construction company manifest records yields a single anomaly: a vessel that was never officially decommissioned.">████████████ ████ ████████ ████ ████████████████ ████ ████████████ ████████ ████████████████ ████████ ████████████████ ████ ████████████████████████████████████████████████████████████████ ████████ ████████████████████████████████ ████ ████████</p>
        <p class="c-reveal" data-real="All attempts to study the vessel wreckage have been blocked at the permit level. Someone with authority does not want this investigated. The investigation continues anyway.">████████ ████████████ ████████ ████████████ ████ ████████████████████████ ████ ████████████████████████████████████████████████████████ ████ ████████████████████</p>
        <p class="classified-note classified-note--locked">TRANSMISSION INCOMPLETE &mdash; MORE FRAGMENTS INCOMING.</p>
      </div>
    </article>

  </div>

  <footer class="classified-footer">
    <div class="classified-footer-coords">
      END OF TRANSMISSION &mdash; <span class="classified-redact c-reveal" data-real="THIS PAGE DOES NOT EXIST. BURN AFTER READING.">█████████████████</span>
    </div>
    <a href="{{ '/' | relative_url }}" class="classified-return-btn">⊘ &nbsp; RETURN TO SURFACE</a>
    <div class="classified-footer-note">This page does not exist.</div>
  </footer>

  <div class="classified-destruct-zone">
    <div class="classified-destruct-label">— BURN AFTER READING —</div>
    <button class="classified-destruct-btn" id="destruct-btn" onclick="igniteSequence()">
      ▸ &nbsp; INITIATE BURN SEQUENCE
    </button>
  </div>

</div>

<script>
// Image comparison drag divider (shared utility)
function initCompare(containerId, afterId, handleId) {
  var container = document.getElementById(containerId);
  var after     = document.getElementById(afterId);
  var handle    = document.getElementById(handleId);
  if (!container || !after || !handle) return;
  var dragging  = false;

  function setPos(x) {
    var rect = container.getBoundingClientRect();
    var pct  = Math.max(2, Math.min(98, ((x - rect.left) / rect.width) * 100));
    after.style.width  = pct + '%';
    handle.style.left  = pct + '%';
  }

  handle.addEventListener('mousedown',  function(e) { dragging = true; e.preventDefault(); });
  document.addEventListener('mouseup',  function()  { dragging = false; });
  document.addEventListener('mousemove',function(e) { if (dragging) setPos(e.clientX); });
  container.addEventListener('touchmove',function(e){ setPos(e.touches[0].clientX); e.preventDefault(); }, { passive: false });
}

initCompare('mirror-compare', 'mirror-after', 'mirror-handle');

// Redacted hold-to-reveal
(function() {
  document.querySelectorAll('.c-reveal').forEach(function(el) {
    var real = el.getAttribute('data-real');
    var redacted = el.textContent;
    var timer = null;
    el.title = 'hold to reveal';
    el.style.cursor = 'cell';

    function startReveal() {
      el.classList.add('is-revealing');
      var i = 0;
      timer = setInterval(function() {
        if (i >= real.length) { clearInterval(timer); return; }
        var tail = '';
        for (var j = i + 1; j < redacted.length; j++) {
          tail += redacted[j] === ' ' ? ' ' : '█';
        }
        el.textContent = real.slice(0, i + 1) + tail;
        i++;
      }, 32);
    }

    function resetReveal() {
      clearInterval(timer);
      el.classList.remove('is-revealing');
      el.textContent = redacted;
    }

    el.addEventListener('mousedown', startReveal);
    el.addEventListener('touchstart', startReveal, { passive: true });
    el.addEventListener('mouseup', resetReveal);
    el.addEventListener('mouseleave', resetReveal);
    el.addEventListener('touchend', resetReveal);
  });
})();

function igniteSequence() {
  var btn = document.getElementById('destruct-btn');
  var btnTop = document.getElementById('destruct-btn-top');
  var overlay = document.getElementById('burn-overlay');
  var countdown = document.getElementById('burn-countdown');
  var number = document.getElementById('burn-number');

  if (btn) { btn.disabled = true; btn.textContent = '▸   BURNING...'; }
  if (btnTop) { btnTop.disabled = true; btnTop.textContent = '▸   BURNING...'; }

  var count = 3;
  countdown.classList.add('is-visible');

  function tick() {
    if (count < 1) {
      overlay.classList.add('is-burning');
      setTimeout(function() {
        window.location.href = '{{ "/" | relative_url }}';
      }, 2600);
      return;
    }
    number.textContent = count;
    number.style.animation = 'none';
    void number.offsetWidth;
    number.style.animation = 'countdown-pulse 0.7s ease-in-out';
    count--;
    setTimeout(tick, 750);
  }

  tick();
}
</script>
