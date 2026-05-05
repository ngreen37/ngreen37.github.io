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

## Pieces {#pieces}

<p class="char-flip-sub">The six pieces of the PJCC board — built in Blender, each scaled to the battle-room concept. Renders coming as the project progresses.</p>

<div class="pieces-grid">

  <div class="piece-card">
    <div class="piece-symbol">&#9823;</div>
    <div class="piece-name">Pawn</div>
    <p class="piece-desc">The foot soldier. Dogs in the PJCC world are measured in pawns — the base unit of scale. Common, essential, and quietly capable of becoming anything on the board.</p>
  </div>

  <div class="piece-card">
    <div class="piece-symbol">&#9820;</div>
    <div class="piece-name">Rook</div>
    <p class="piece-desc">The sentinel. Moves in straight lines, controlling entire ranks and files. A fortress piece — steady, powerful, and the last thing you want standing between you and the king.</p>
  </div>

  <div class="piece-card">
    <div class="piece-symbol">&#9821;</div>
    <div class="piece-name">Bishop</div>
    <p class="piece-desc">The diagonal thinker. Bound to its color for the entire game, the bishop sees the board from an angle no other piece can. Fast across long stretches, but always moving at a slant.</p>
  </div>

  <div class="piece-card">
    <div class="piece-symbol">&#9822;</div>
    <div class="piece-name">Knight</div>
    <p class="piece-desc">The unpredictable one. The only piece that leaps over others, moving in an L-shape that defies the grid. Hard to pin down, harder to predict — and the piece Princess is designated as.</p>
  </div>

  <div class="piece-card">
    <div class="piece-symbol">&#9819;</div>
    <div class="piece-name">Queen</div>
    <p class="piece-desc">The powerhouse. Combines the reach of the rook and the sweep of the bishop into the most dangerous piece on the board. Few can stand in her way.</p>
  </div>

  <div class="piece-card">
    <div class="piece-symbol">&#9818;</div>
    <div class="piece-name">King</div>
    <p class="piece-desc">The whole point. Every sacrifice, every gambit, every move exists to protect or threaten the king. Slow and vulnerable — but the game ends the moment he falls.</p>
  </div>

</div>
