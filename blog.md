**---
layout: page
title: Blog
permalink: /blog/
---

Here’s where I post updates on what I’m building and learning.
<h2>Featured</h2>

<p>
  <a href="{{ '/2026/03/28/GitHub/' | relative_url }}">Ep. 6 - GitHub</a> 
  - First Breakthrough
</p>


<ul>
  {% for post in site.posts %}
    <li>
      <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
      - <small>{{ post.date | date: "%B %d, %Y" }}</small>
    </li>
  {% endfor %}
</ul>
**
