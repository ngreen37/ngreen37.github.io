---
layout: page
title: Blog
permalink: /blog/
---

# Blog

Here’s where I post updates on what I’m building and learning.


<ul>
  {% for post in site.posts %}
    <li>
      <a href="{{ post.url }}">{{ post.title }}</a>
    </li>
  {% endfor %}
</ul>
