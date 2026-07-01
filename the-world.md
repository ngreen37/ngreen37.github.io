---
layout: page
title: Characters & Locations
permalink: /the-world/
---

<link rel="stylesheet" href="{{ '/assets/css/pjcc-warp.css' | relative_url }}">

<div class="world-hub-intro">
  <p class="world-hub-sub">The world of <em>Princess and the Journey to Chess City</em> — the cast who walk it, and the places they're trying to reach. Pick a door.</p>
</div>

<div class="world-hub">
  <a class="world-pillar" href="{{ '/characters/' | relative_url }}" style="--c:#e2566e" data-warp>
    <span class="wp-glyph">♟</span>
    <span class="wp-name">Characters</span>
    <span class="wp-tag">The cast — Princess, the crew, the rivals, and the ones not as nice as they seem.</span>
    <span class="wp-go">Meet them →</span>
  </a>
  <a class="world-pillar" href="{{ '/locations/' | relative_url }}" style="--c:#6bbfff" data-warp>
    <span class="wp-glyph">🗺️</span>
    <span class="wp-name">Locations</span>
    <span class="wp-tag">The map — Checker Town to Chess City, the Sea, the Sand Mines, Shogi Island.</span>
    <span class="wp-go">Explore the map →</span>
  </a>
</div>

<style>
.world-hub-intro { max-width: 640px; margin-bottom: 1.2rem; }
.world-hub-sub { color: #c9a7ff; line-height: 1.6; font-size: 1rem; }
.world-hub { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
@media (max-width: 560px){ .world-hub { grid-template-columns: 1fr; } }
.world-pillar { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
  text-align: center; text-decoration: none; min-height: 280px; padding: 26px 18px 22px; overflow: hidden;
  border: 2px solid var(--c,#6b5fa0); border-radius: 18px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--c) 34%, #180b38) 0%, #150a30 88%);
  transition: transform .14s, box-shadow .14s; }
.world-pillar:hover, .world-pillar:active, .world-pillar:focus-visible {
  transform: translateY(-4px); box-shadow: 0 0 42px -8px var(--c), 0 12px 34px -12px var(--c); }
/* dimmed corner that lights up in the tile's colour on hover/tap — matches the splash quads */
.world-pillar::after { content: ''; position: absolute; inset: 0; z-index: 0; border-radius: 18px; pointer-events: none;
  background: linear-gradient(135deg, color-mix(in srgb, var(--c) 26%, transparent) 0%, transparent 58%);
  opacity: 0; transition: opacity .2s; }
.world-pillar:hover::after, .world-pillar:active::after, .world-pillar:focus-visible::after { opacity: 1; }
.wp-glyph { position: absolute; top: 26px; left: 0; right: 0; z-index: 1; font-size: 4.6rem; line-height: 1; color: var(--c);
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.5)); transition: transform .16s; }
.world-pillar:hover .wp-glyph, .world-pillar:active .wp-glyph { transform: scale(1.08); }
.wp-name, .wp-tag, .wp-go { position: relative; z-index: 1; }
.wp-name { font-size: 1.5rem; font-weight: 900; color: #fff; letter-spacing: 0.02em; }
.wp-tag { color: #c9b8ee; font-size: 0.86rem; line-height: 1.5; margin: 8px 0 14px; max-width: 280px; }
.wp-go { background: var(--c,#F5C518); color: #1a0f3d; font-weight: 800; border-radius: 999px; padding: 8px 18px; font-size: 0.9rem; }
</style>

<!-- Click a pillar → the screen blooms to its colour, like the splash quads. -->
<script src="{{ '/assets/js/pjcc-warp.js' | relative_url }}"></script>
