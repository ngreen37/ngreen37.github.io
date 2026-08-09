---
layout: easter-eggs
title: Transmission Archive
permalink: /archive/
fragment_key: frag_archive
---

<div class="classified-page">

  <header class="classified-header">
    <div class="classified-ping-container">
      <div class="classified-ping-icon">⊙</div>
    </div>
    <div class="classified-header-bar">
      <span class="classified-status">SECOND SIGNAL ACQUIRED</span>
      <span class="classified-dots">• • •</span>
      <span class="classified-status">ARCHIVE UNLOCKED</span>
    </div>
    <div class="classified-stamp-wrap">
      <span class="classified-stamp">OMEGA CLEARANCE</span>
    </div>
    <h1 class="classified-title" data-text="TRANSMISSION ARCHIVE">TRANSMISSION ARCHIVE</h1>
    <div class="classified-subtitle">DEEP ARCHIVE — EYES ONLY — LEVEL Ω</div>
    <div class="classified-coords">
      DEPTH:&nbsp;<span class="classified-redact c-reveal" data-real="BEYOND CLASSIFICATION">██████████████████████</span>&nbsp;&nbsp;
      KEY:&nbsp;<span class="classified-redact c-reveal" data-real="Qd5 + Qd5">████████████</span>&nbsp;&nbsp;
      STATUS:&nbsp;<span class="classified-redact c-reveal" data-real="YOU FOUND THE SECOND DOOR">█████████████████████████</span>
    </div>
    <div class="classified-secret-text" aria-hidden="true">YOU TYPED THE QUEEN TWICE. SHE NOTICED.</div>
  </header>

  <div class="classified-warning-banner">
    <span>⚠</span>
    OMEGA-LEVEL ACCESS DETECTED — YOU ARE BEING LOGGED
    <span>⚠</span>
  </div>
  <div class="classified-subwarning">
    You typed the queen twice. She knew you would.
  </div>

  <div class="classified-files">

    <article class="classified-file classified-file--open">
      <div class="classified-file-meta">
        <span class="classified-file-id">FRAGMENT — 005</span>
        <span class="classified-file-tag">DEEP LORE</span>
        <span class="classified-file-clearance">CLEARANCE: OMEGA</span>
      </div>
      <h2 class="classified-file-title">Why the Pieces Really Fell</h2>
      <div class="classified-file-body">
        <p>The checker pieces did not fall by accident. The interplanetary construction company was hired to deliver them. <strong>Checker Town was always the destination.</strong> The vessel was not lost. It was parked.</p>
        <p>Current working theory: Checker Town was seeded. A game was started. Someone, somewhere, is still waiting to play their turn.</p>
        <p class="classified-note">Note: The identity of who placed the order has been redacted from every known record. The order number still exists in the manifest. It has not been paid.</p>
      </div>
    </article>

    <article class="classified-file classified-file--open">
      <div class="classified-file-meta">
        <span class="classified-file-id">FRAGMENT — 006</span>
        <span class="classified-file-tag">IDENTITY FILE</span>
        <span class="classified-file-clearance">CLEARANCE: OMEGA</span>
      </div>
      <h2 class="classified-file-title">Her Real Name</h2>
      <div class="classified-file-body">
        <p>The operative refers to her as Princess. This is not her real name. Her real name is listed in the interplanetary crew manifest as <span class="classified-redact c-reveal" data-real="P&JCC-Ω-7">████████</span>, a designation assigned before the crash.</p>
        <p>She does not appear to know this. She has, however, been observed looking at the sky more often than the average resident of Checker Town.</p>
        <p class="classified-note">She responds to Princess. She responds better to <em>good girl</em>. We are not above using this.</p>
      </div>
    </article>

    <article class="classified-file classified-file--open">
      <div class="classified-file-meta">
        <span class="classified-file-id">FRAGMENT — 007</span>
        <span class="classified-file-tag">CHESS CITY INTELLIGENCE</span>
        <span class="classified-file-clearance">CLEARANCE: OMEGA</span>
      </div>
      <h2 class="classified-file-title">What Chess City Already Knows</h2>
      <div class="classified-file-body">
        <p>Chess City has been monitoring Checker Town since the crash. They know about Princess. They have a file. The file is thicker than this archive.</p>
        <p>The tournament — the one Princess will eventually win — was not designed as an open competition. The <strong>invitation list was built around her</strong>. Every opponent she will face has been selected.</p>
        <p>The board was set before they arrived. She is the last piece to be placed.</p>
        <p class="classified-note">Final note: ngreen37 has been building this site since March 2026. He knows more than he's put in the blog. The rest is coming.</p>
      </div>
    </article>

  </div>

  <footer class="classified-footer">
    <div class="classified-footer-coords">
      END OF ARCHIVE — <span class="classified-redact c-reveal" data-real="SEE YOU AT THE TOURNAMENT.">███████████████████████████████</span>
    </div>
    <a href="/classified/" class="classified-return-btn">← &nbsp; RETURN TO CLASSIFIED</a>
  </footer>

</div>

<script>
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
</script>
