---
layout: page
title: Blog
permalink: /blog/
body_class: theme-bw
---

<div class="ep-index">
  <div class="ep-index-eyebrow">McPuppy Studios — The Build Log</div>
  <h1 class="ep-index-title">Episode Archive</h1>
  <p class="ep-index-sub">{{ site.posts.size }} episodes so far. In order from the beginning.</p>

  <div class="story-arc-bar">
    <div class="story-arc-bar-label">◈ Story Arc Progress — Princess and the Journey to Chess City</div>
    <div class="story-arc-bar-chapters">
      <div class="story-arc-ch arc-done"><div class="story-arc-ch-num">B</div><div class="story-arc-ch-lbl">Backstory</div></div>
      <div class="story-arc-ch arc-active"><div class="story-arc-ch-num">1</div><div class="story-arc-ch-lbl">Checker&nbsp;Town</div></div>
      <div class="story-arc-ch arc-active"><div class="story-arc-ch-num">2</div><div class="story-arc-ch-lbl">First&nbsp;Move</div></div>
      <div class="story-arc-ch arc-future"><div class="story-arc-ch-num">3</div><div class="story-arc-ch-lbl">Journey</div></div>
      <div class="story-arc-ch arc-future"><div class="story-arc-ch-num">4</div><div class="story-arc-ch-lbl">The&nbsp;Sea</div></div>
      <div class="story-arc-ch arc-future"><div class="story-arc-ch-num">5</div><div class="story-arc-ch-lbl">Shogi</div></div>
      <div class="story-arc-ch arc-future"><div class="story-arc-ch-num">6</div><div class="story-arc-ch-lbl">Chess&nbsp;City</div></div>
      <div class="story-arc-ch arc-future"><div class="story-arc-ch-num">7</div><div class="story-arc-ch-lbl">Tournament</div></div>
      <div class="story-arc-ch arc-locked"><div class="story-arc-ch-num">?</div><div class="story-arc-ch-lbl">████</div></div>
    </div>
  </div>

  <div class="ep-list">
    {% assign posts_rev = site.posts | reverse %}
    {% for post in posts_rev %}

    {% assign ep_num = forloop.index %}
    {% assign _lines = post.content | strip_html | newline_to_br | split: "<br />" %}
    {% assign _logline = "" %}
    {% for _line in _lines %}
      {% assign _t = _line | strip %}
      {% unless _t contains "Listening to:" or _t.size < 20 %}
        {% assign _logline = _t %}
        {% break %}
      {% endunless %}
    {% endfor %}
    {% if _logline == "" %}{% assign _logline = post.content | strip_html | strip %}{% endif %}
    {% assign accent = ep_num | modulo: 5 %}

    <a class="ep-card ep-card--accent-{{ accent }}" href="{{ post.url | relative_url }}">
      <div class="ep-card-stripe"></div>
      <div class="ep-num">EP.&nbsp;{{ ep_num | prepend: "00" | slice: -2, 2 }}</div>
      <div class="ep-card-main">
        <div class="ep-title">{{ post.title }}</div>
        <div class="ep-logline">{{ _logline | truncatewords: 16 }}</div>
      </div>
      <div class="ep-date">{{ post.date | date: "%b %d, %Y" }}</div>
      <div class="ep-card-arrow">→</div>
    </a>

    {% endfor %}
    <div class="ep-card ep-card--draft" aria-hidden="true">
      <div class="ep-card-stripe"></div>
      <div class="ep-num">EP.&nbsp;??</div>
      <div class="ep-card-main">
        <div class="ep-title">[DRAFT — COMING SOON]</div>
        <div class="ep-logline">Transmission incomplete. Check back soon.</div>
      </div>
      <div class="ep-date">— — —</div>
      <div class="ep-card-arrow">→</div>
    </div>
  </div>
</div>
