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
  </div>
</div>
