---
layout: page
title: Blog
permalink: /blog/
---

Here’s where I post updates on what I’m building and learning.


<div class="blog-grid">
  {% for post in site.posts %}
  <a class="blog-card" href="{{ post.url }}">
    <div class="blog-card-content">
      <h2>{{ post.title }}</h2>
      <p class="blog-date">{{ post.date | date: "%B %d, %Y" }}</p>
      {% if post.excerpt %}
        <p class="blog-excerpt">{{ post.excerpt | strip_html | truncate: 120 }}</p>
      {% endif %}
      {% if post.tags %}
        <div class="blog-tags">
          {% for tag in post.tags %}
            <span class="tag">{{ tag }}</span>
          {% endfor %}
        </div>
      {% endif %}
    </div>
  </a>
  {% endfor %}
</div>



<ul>
  {% for post in site.posts %}
    <li>
      <a href="{{ post.url }}">{{ post.title }}</a>
      - <small>{{ post.date | date: "%B %d, %Y" }}</small>
    </li>
  {% endfor %}
</ul>
