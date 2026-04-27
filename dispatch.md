---
layout: easter-eggs
title: Operative Field Log
permalink: /dispatch/
fragment_key: frag_dispatch
---

<div class="dispatch-page">

  <header class="dispatch-header">
    <div class="dispatch-eyebrow">◈ OPERATIVE FIELD LOG — CLASSIFIED DISPATCH</div>
    <h1 class="dispatch-title">FIELD TRANSMISSIONS</h1>
    <div class="dispatch-sub">ALL POSTS — CHRONOLOGICAL — EYES ONLY</div>
  </header>

  <div class="dispatch-list">
    {% assign posts_rev = site.posts | reverse %}
    {% for post in posts_rev %}
    <a class="dispatch-entry" href="{{ post.url | relative_url }}">
      <span class="dispatch-entry-num">TX — {{ forloop.index | prepend: "000" | slice: -3, 3 }}</span>
      <span class="dispatch-entry-title">{{ post.title | upcase }}</span>
      <span class="dispatch-entry-date">{{ post.date | date: "%Y.%m.%d" }}</span>
    </a>
    {% endfor %}
  </div>

  <div style="text-align:center; margin-top: 48px;">
    <a href="/" class="classified-return-btn">⊘ &nbsp; RETURN TO SURFACE</a>
  </div>

</div>
