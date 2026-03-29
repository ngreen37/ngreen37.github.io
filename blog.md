---
layout: page
title: Blog
permalink: /blog/
---

Here’s where I post updates on what I’m building and learning.
<h2>Featured</h2>

<p>
  <a href="/2026/03/28/GitHub/">My Best Post</a>  
  - The one where everything finally clicked.
</p>


<ul>
  {% for post in site.posts %}
    <li>
      <a href="{{ post.url }}">{{ post.title }}</a>
      - <small>{{ post.date | date: "%B %d, %Y" }}</small>
    </li>
  {% endfor %}
</ul>
