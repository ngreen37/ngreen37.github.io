---
noindex: true
sitemap: false
layout: default
title: Fragment Recovery
permalink: /recovery/
body_class: theme-bw
---

<div class="recovery-wrap">
  <div class="recovery-header">
    <div class="recovery-title">Fragment Recovery</div>
    <div class="recovery-sub">◈ CLASSIFIED DOCUMENT — HOLD EACH WORD TO REVEAL &nbsp;|&nbsp; 2s CONTACT REQUIRED</div>
  </div>

  <div class="recovery-doc" id="recovery-doc">
    <!-- words injected by JS -->
  </div>

  <div class="recovery-progress" id="recovery-progress">0 / 12 FRAGMENTS RECOVERED</div>
  <div class="recovery-complete" id="recovery-complete">
    ◈ FULL DOCUMENT RECOVERED<br>
    <span style="font-size:10px;color:rgba(245,197,24,0.55);letter-spacing:0.1em;">She already knew the journey would cost something. She went anyway.</span><br><br>
    <a href="/classified/" style="color:#F5C518;text-decoration:none;border:1px solid rgba(245,197,24,0.3);padding:6px 16px;font-size:10px;letter-spacing:0.12em;border-radius:3px;">◈ Return to Archive</a>
  </div>
</div>

<script>
(function() {
  var words = [
    'She', 'left', 'Checker', 'Town', 'on', 'a', 'morning',
    'when', 'the', 'fog', 'was', 'impenetrable.'
  ];
  var revealed = new Array(words.length).fill(false);
  var doc = document.getElementById('recovery-doc');
  var prog = document.getElementById('recovery-progress');
  var comp = document.getElementById('recovery-complete');
  if (!doc) return;

  function blocks(w) {
    return w.split('').map(function(c) { return c === ' ' ? ' ' : '█'; }).join('');
  }

  function updateProgress() {
    var n = revealed.filter(Boolean).length;
    if (prog) prog.textContent = n + ' / ' + words.length + ' FRAGMENTS RECOVERED';
    if (n === words.length && comp) {
      comp.classList.add('is-visible');
      try { localStorage.setItem('frag_recovery', '1'); } catch(e) {}
    }
  }

  words.forEach(function(word, i) {
    var span = document.createElement('span');
    span.className = 'rw';
    var inner = document.createElement('span');
    inner.className = 'rw-inner';
    inner.setAttribute('data-b', blocks(word));
    inner.style.minWidth = (word.length * 0.7) + 'ch';
    span.appendChild(inner);
    doc.appendChild(span);
    doc.appendChild(document.createTextNode(' '));

    if (revealed[i]) {
      span.classList.add('is-revealed');
      return;
    }

    var timer = null;
    function startReveal() {
      if (revealed[i]) return;
      span.classList.add('is-revealing');
      timer = setTimeout(function() {
        revealed[i] = true;
        span.classList.remove('is-revealing');
        span.classList.add('is-revealed');
        updateProgress();
      }, 2000);
    }
    function cancelReveal() {
      clearTimeout(timer);
      if (!revealed[i]) span.classList.remove('is-revealing');
    }
    span.addEventListener('mouseenter', startReveal);
    span.addEventListener('mouseleave', cancelReveal);
    span.addEventListener('touchstart', startReveal, { passive: true });
    span.addEventListener('touchend', cancelReveal);
  });

  updateProgress();
})();
</script>
