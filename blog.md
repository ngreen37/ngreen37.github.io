---
layout: page
title: Blog
permalink: /blog/
---

# Blog

Here’s where I post updates on what I’m building and learning.


<h1>Blog</h1>

<ul>
  {% for post in site.posts %}
    <li>
      <a href="{{ post.url }}">{{ post.title }}</a>
      - <small>{{ post.date | date: "%B %d, %Y" }}</small>
    </li>
  {% endfor %}
</ul>
