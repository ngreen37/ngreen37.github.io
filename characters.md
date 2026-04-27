---
layout: page
title: Characters
permalink: /characters/
---

<div class="char-flip-page">
  <p class="char-flip-sub">The story of <em>Princess and the Journey to Chess City</em> —
  from the streets of Checker Town to the gates of Chess City and beyond.
  Hover any card to reveal their file.</p>

  <div class="char-flip-grid">
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
          <div class="char-flip-secret">{{ char.dossier_secret | default: "Data redacted." }}</div>
          <a class="char-flip-link" href="{{ char.url | relative_url }}">View Full File →</a>
        </div>

      </div>
    </div>
    {% endfor %}
  </div>
</div>
