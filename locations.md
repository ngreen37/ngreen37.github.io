---
layout: page
title: Locations
permalink: /locations/
---

<div class="loc-atlas">
  <p class="loc-intro">The world of <em>Princess and the Journey to Chess City</em> is shaped by the game people play — and how far they are willing to go to play a better one.</p>

  <h2 class="loc-group">◗ Cities</h2>
  <div class="loc-grid">
    <a class="loc-card" href="{{ '/locations/checker-town/' | relative_url }}">
      <span class="loc-glyph">⛂</span>
      <span class="loc-name">Checker Town</span>
      <span class="loc-desc">Where the story begins — a struggling town most never leave.</span>
      <span class="loc-go">Enter ▸</span>
    </a>
    <a class="loc-card" href="{{ '/locations/chess-city/' | relative_url }}">
      <span class="loc-glyph">♚</span>
      <span class="loc-name">Chess City</span>
      <span class="loc-desc">The destination — a prosperous city you win your way into.</span>
      <span class="loc-go">Enter ▸</span>
    </a>
    <a class="loc-card" href="{{ '/locations/shogi-island/' | relative_url }}">
      <span class="loc-glyph">将</span>
      <span class="loc-name">Shogi Island</span>
      <span class="loc-desc">A nearby island of shogi and Japanese, not chess.</span>
      <span class="loc-go">Enter ▸</span>
    </a>
  </div>

  <h2 class="loc-group">◗ Workplaces</h2>
  <div class="loc-grid">
    <a class="loc-card" href="{{ '/locations/sand-mines/' | relative_url }}">
      <span class="loc-glyph">⛏</span>
      <span class="loc-name">The Sand Mines</span>
      <span class="loc-desc">Hard corporate labor on the outskirts — very difficult to leave.</span>
      <span class="loc-go">Enter ▸</span>
    </a>
  </div>
</div>

<style>
/* Locations theme = blue "atlas" (matches the Locations pillar --c:#6bbfff on /the-world/). */
.loc-atlas { max-width: 900px; margin: 0 auto; }
.loc-intro { color: #bcd6f5; line-height: 1.6; font-size: 1rem; margin-bottom: 1.4rem; }
.loc-group { font-family: 'Share Tech Mono', ui-monospace, monospace; font-size: 12px; letter-spacing: 3px;
  text-transform: uppercase; color: #6bbfff; border-bottom: 1px solid rgba(107,191,255,0.28);
  padding-bottom: 6px; margin: 26px 0 14px; }
.loc-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 14px; }
.loc-card { position: relative; display: flex; flex-direction: column; text-decoration: none; overflow: hidden;
  border: 1px solid rgba(107,191,255,0.35); border-radius: 14px; padding: 16px 16px 15px;
  background:
    repeating-linear-gradient(0deg, transparent 0 17px, rgba(107,191,255,0.05) 17px 18px),
    repeating-linear-gradient(90deg, transparent 0 17px, rgba(107,191,255,0.05) 17px 18px),
    linear-gradient(160deg, color-mix(in srgb, #6bbfff 16%, #0a1428) 0%, #0a1428 80%);
  transition: transform .14s, box-shadow .14s, border-color .14s; }
.loc-card:hover, .loc-card:focus-visible { transform: translateY(-3px); border-color: #6bbfff;
  box-shadow: 0 0 34px -10px #6bbfff, 0 12px 30px -14px #6bbfff; text-decoration: none; }
.loc-glyph { font-size: 2rem; line-height: 1; color: #6bbfff; filter: drop-shadow(0 0 10px rgba(107,191,255,0.4)); }
.loc-name { font-family: 'Poppins', sans-serif; font-weight: 800; font-size: 1.06rem; color: #eaf3ff; margin-top: 8px; }
.loc-desc { color: #9fb8d8; font-size: 0.82rem; line-height: 1.5; margin-top: 6px; }
.loc-go { margin-top: 11px; font-family: 'Share Tech Mono', ui-monospace, monospace; font-size: 0.68rem;
  letter-spacing: 1.5px; text-transform: uppercase; color: #6bbfff; opacity: 0.85; }
@media (max-width: 560px){ .loc-grid { grid-template-columns: 1fr; } }
</style>
