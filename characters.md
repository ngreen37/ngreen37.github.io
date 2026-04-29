---
layout: page
title: Characters
permalink: /characters/
---

<div class="char-flip-page">
  <p class="char-flip-sub">The story of <em>Princess and the Journey to Chess City</em> —
  from the streets of Checker Town to the gates of Chess City and beyond.
  Hover any card to reveal their file.</p>
  <p class="char-nav-hint">← → Arrow keys to navigate &nbsp;|&nbsp; Hover to reveal dossier</p>

  <div class="char-flip-grid" id="char-flip-grid">
    {% assign sorted_chars = site.characters | sort: "order" %}
    {% for char in sorted_chars %}
    <div class="char-flip-card">
      <div class="char-flip-inner">

        <div class="char-flip-front">
          <div class="char-flip-piece">{{ char.piece | default: "♟" }}</div>
          <div class="char-flip-name">{{ char.title }}</div>
          <div class="char-flip-role">{{ char.role }}</div>
        </div>

        <div class="char-flip-back">
          <div class="char-flip-back-label">— DOSSIER —</div>
          <div class="char-flip-clearance">CLEARANCE: {{ char.dossier_clearance | default: "DELTA" }}</div>
          <div class="char-flip-secret char-unredact" data-real="{{ char.dossier_secret | default: "Data redacted." }}">████████████████████</div>
          <a class="char-flip-link" href="{{ char.url | relative_url }}">View Full File →</a>
        </div>

      </div>
    </div>
    {% endfor %}
  </div>
</div>

<script>
// #5 — Progressive un-redact on flip card hover
(function() {
  document.querySelectorAll('.char-unredact').forEach(function(el) {
    var real = el.getAttribute('data-real') || '';
    var blocks = real.split('').map(function(c) { return c === ' ' ? ' ' : '█'; }).join('');
    el.textContent = blocks;
    var iv = null;
    el.closest('.char-flip-card').addEventListener('mouseenter', function() {
      clearInterval(iv);
      el.textContent = blocks;
      var i = 0;
      iv = setInterval(function() {
        if (i >= real.length) { clearInterval(iv); return; }
        el.textContent = real.slice(0, i + 1) + blocks.slice(i + 1);
        i++;
      }, 28);
    });
    el.closest('.char-flip-card').addEventListener('mouseleave', function() {
      clearInterval(iv);
      el.textContent = blocks;
    });
  });
})();

// #15 — Arrow-key character navigator
(function() {
  var cards = Array.from(document.querySelectorAll('.char-flip-card'));
  if (!cards.length) return;
  var focused = -1;
  function setFocus(idx) {
    if (focused >= 0) cards[focused].classList.remove('is-focused');
    focused = (idx + cards.length) % cards.length;
    cards[focused].classList.add('is-focused');
    cards[focused].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  document.addEventListener('keydown', function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'ArrowRight') { e.preventDefault(); setFocus(focused < 0 ? 0 : focused + 1); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); setFocus(focused < 0 ? 0 : focused - 1); }
    if (e.key === 'ArrowUp')    { e.preventDefault(); setFocus(focused < 0 ? 0 : focused - 2); }
    if (e.key === 'ArrowDown')  { e.preventDefault(); setFocus(focused < 0 ? 0 : focused + 2); }
    if ((e.key === 'Enter' || e.key === ' ') && focused >= 0) {
      var link = cards[focused].querySelector('.char-flip-link');
      if (link) window.location.href = link.getAttribute('href');
    }
  });
  cards.forEach(function(c, i) {
    c.addEventListener('click', function() { setFocus(i); });
  });
})();
</script>
