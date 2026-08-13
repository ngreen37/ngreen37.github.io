---
layout: page
title: Blog
permalink: /blog/
body_class: theme-bw
---

<div class="ep-index">
  <div class="ep-index-eyebrow">McPuppy Studios — The Blog</div>
  <h1 class="ep-index-title">Archive</h1>
  <p class="ep-index-sub">{{ site.posts.size }} posts. Newest first.</p>

  <div class="ep-list">
    {%- comment -%} THE DRAFT CARD MOVED UP WITH THE ORDER (2026-08-13). It sat at the foot
         of the list when the list ran oldest-first, which put "still being written" in the
         one place it belonged: after the last finished post. Newest-first inverts that — the
         unwritten post is the newest thing there is, so leaving the card at the bottom would
         have filed the future behind the past. {%- endcomment -%}
    <div class="ep-card ep-card--draft" aria-hidden="true">
      <div class="ep-card-stripe"></div>
      <div class="ep-card-main">
        <div class="ep-title">[DRAFT — BUILDING]</div>
        <div class="ep-logline">Still being written. Check back soon.</div>
      </div>
      <div class="ep-date">— — —</div>
      <div class="ep-card-arrow">→</div>
    </div>

    {%- comment -%} NEWEST FIRST (2026-08-13, Nate). `site.posts` is already newest-first in
         Jekyll; the old `| reverse` was what put the oldest on top, so flipping the order
         meant DELETING a filter rather than adding one.

         ⚠ `ep_num` is loop position, and it is now counting DOWN the archive rather than up
         it. That is fine and worth saying why: nothing displays it. The "Ep. N" a reader
         sees is typed into each post's own `title:` front matter and is untouched by any of
         this. All `ep_num` feeds is `accent`, the 5-color stripe cycle — so the stripes
         re-deal, and no post's number moved. {%- endcomment -%}
    {% for post in site.posts %}

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
