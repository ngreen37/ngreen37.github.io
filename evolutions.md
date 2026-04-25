---
layout: page
title: Evolution Log
permalink: /evolutions/
---

## Characters

{% assign char_evos = site.evolutions | where: "category", "character" %}
<div class="evo-index-grid">
{% for evo in char_evos %}
  {% assign thumb = evo.versions | first %}
  <a href="{{ evo.url | relative_url }}" class="evo-index-card">
    <div class="evo-index-thumb{% unless thumb %} evo-index-placeholder{% endunless %}">
      {% if thumb %}
        <img src="{{ thumb.image | relative_url }}" alt="{{ evo.title }}">
      {% else %}
        <span>&#9813;</span>
      {% endif %}
    </div>
    <span class="evo-index-name">{{ evo.title }}</span>
  </a>
{% endfor %}
</div>

## Locations

{% assign loc_evos = site.evolutions | where: "category", "location" %}
<div class="evo-index-grid">
{% for evo in loc_evos %}
  {% assign thumb = evo.versions | first %}
  <a href="{{ evo.url | relative_url }}" class="evo-index-card">
    <div class="evo-index-thumb{% unless thumb %} evo-index-placeholder{% endunless %}">
      {% if thumb %}
        <img src="{{ thumb.image | relative_url }}" alt="{{ evo.title }}">
      {% else %}
        <span>&#9812;</span>
      {% endif %}
    </div>
    <span class="evo-index-name">{{ evo.title }}</span>
  </a>
{% endfor %}
</div>
