---
layout: page
title: Characters & Locations
permalink: /the-world/
---

<link rel="stylesheet" href="{{ '/assets/css/pjcc-warp.css' | relative_url }}">

<div class="world-hub">
  <a class="world-pillar" href="{{ '/characters/' | relative_url }}" style="--c:#a879ff" data-warp>
    <span class="wp-glyph">♟</span>
    <span class="wp-name">Characters</span>
  </a>
  <a class="world-pillar" href="{{ '/locations/' | relative_url }}" style="--c:#6bbfff" data-warp>
    <span class="wp-glyph">🗺️</span>
    <span class="wp-name">Locations</span>
  </a>
</div>

<style>
.world-hub { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
@media (max-width: 560px){ .world-hub { grid-template-columns: 1fr; } }
.world-pillar { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center;
  text-align: center; text-decoration: none; min-height: 240px; padding: 30px 18px; overflow: hidden;
  border: 2px solid var(--c,#6b5fa0); border-radius: 18px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--c) 34%, #180b38) 0%, #150a30 88%);
  transition: transform .14s, box-shadow .14s; }
.world-pillar:hover, .world-pillar:active, .world-pillar:focus-visible {
  transform: translateY(-4px); box-shadow: 0 0 48px -5px var(--c), 0 12px 39px -9px var(--c); }
/* dimmed corner that lights up in the tile's colour on hover/tap — matches the splash quads */
.world-pillar::after { content: ''; position: absolute; inset: 0; z-index: 0; border-radius: 18px; pointer-events: none;
  background: linear-gradient(135deg, color-mix(in srgb, var(--c) 37%, transparent) 0%, transparent 58%);
  opacity: 0; transition: opacity .2s; }
.world-pillar:hover::after, .world-pillar:active::after, .world-pillar:focus-visible::after { opacity: 1; }
.wp-glyph { position: relative; z-index: 1; font-size: 4.8rem; line-height: 1; color: var(--c);
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.5)); transition: transform .16s; margin-bottom: 14px; }
.world-pillar:hover .wp-glyph, .world-pillar:active .wp-glyph { transform: scale(1.08); }
.wp-name { position: relative; z-index: 1; font-size: 1.6rem; font-weight: 900; color: #fff; letter-spacing: 0.02em; }
</style>

<!-- Click a pillar → the screen blooms to its colour, like the splash quads. -->
<script src="{{ '/assets/js/pjcc-warp.js' | relative_url }}"></script>
