---
layout: page
title: Visual Language
permalink: /style/
description: The colors, type, and motifs that make PJCC and McPuppy Studios look like one world — kept in the open.
---

<p class="vl-intro">The look of Checker Town, Chess City, and the studio behind them — the palette, the type, and the motifs — kept in one place so everything we build (the site today, the game tomorrow) reads as a single world. Built in the open, this included.</p>

<h2 class="vl-h">Color</h2>
<p class="vl-sub">Deep operative purples, one unmistakable gold, and a small set of signal accents.</p>

<div class="vl-swatches">
  <div class="vl-sw" style="--c:#F5C518"><span>Operative Gold</span><code>#F5C518</code></div>
  <div class="vl-sw" style="--c:#ffd740"><span>Bright Gold</span><code>#ffd740</code></div>
  <div class="vl-sw" style="--c:#0a0714;--t:#c9a7ff"><span>Void</span><code>#0a0714</code></div>
  <div class="vl-sw" style="--c:#160c33;--t:#c9a7ff"><span>Card</span><code>#160c33</code></div>
  <div class="vl-sw" style="--c:#2D1B69;--t:#f0e6ff"><span>Panel</span><code>#2D1B69</code></div>
  <div class="vl-sw" style="--c:#6b5fa0;--t:#0a0714"><span>Border</span><code>#6b5fa0</code></div>
  <div class="vl-sw" style="--c:#c9a7ff;--t:#1a0f3d"><span>Lavender (text)</span><code>#c9a7ff</code></div>
  <div class="vl-sw" style="--c:#f0e6ff;--t:#1a0f3d"><span>Paper (text)</span><code>#f0e6ff</code></div>
  <div class="vl-sw" style="--c:#6bffb8;--t:#04110a"><span>Signal Green</span><code>#6bffb8</code></div>
  <div class="vl-sw" style="--c:#ff8fd0;--t:#1a0f3d"><span>Rose</span><code>#ff8fd0</code></div>
  <div class="vl-sw" style="--c:#3cbcfc;--t:#03102c"><span>Arcade Blue</span><code>#3cbcfc</code></div>
  <div class="vl-sw" style="--c:#ff3b3b;--t:#fff"><span>Terminated Red</span><code>#ff3b3b</code></div>
</div>
<p class="vl-note">Gold is the one true accent — used sparingly, it means "this matters." The purples carry the mood; the signal colors (green = go / verified, red = retired, blue = arcade, rose = flair) each mean one thing and are never decorative.</p>

<h2 class="vl-h">Type</h2>
<div class="vl-type">
  <div class="vl-type-row">
    <div class="vl-type-sample" style="font-family:'Poppins',system-ui,sans-serif;font-weight:800;font-size:2rem;color:#F5C518">Princess and the Journey</div>
    <div class="vl-type-meta"><b>Poppins</b> · display &amp; headings · 700–800 weight</div>
  </div>
  <div class="vl-type-row">
    <div class="vl-type-sample" style="font-family:'Inter',system-ui,sans-serif;font-size:1rem;color:#f0e6ff">A dog who can learn anything sets out for Chess City, one square at a time.</div>
    <div class="vl-type-meta"><b>Inter</b> · body copy · 400–600</div>
  </div>
  <div class="vl-type-row">
    <div class="vl-type-sample" style="font-family:'Share Tech Mono',monospace;letter-spacing:0.14em;color:#6bffb8;text-transform:uppercase">◈ Operative Uplink · Clearance Delta</div>
    <div class="vl-type-meta"><b>Share Tech Mono</b> · operative labels, clocks, kickers · uppercase, wide-tracked</div>
  </div>
</div>

<h2 class="vl-h">Motifs</h2>
<ul class="vl-motifs">
  <li><b>The gold rule.</b> A 3px <code>#F5C518</code> line — under the header, atop the footer — frames the whole site like a film title card.</li>
  <li><b>The Gauntlet door.</b> An arched doorway with light under it; it grows grander the higher you climb, and stands ajar once you've beaten all ten floors.</li>
  <li><b>Chess glyphs.</b> The back rank (♚ ♛ ♜ ♝ ♞) drifts faint in the background, and the world's buildings are shaped like the pieces.</li>
  <li><b>The operative dossier.</b> A light spy-file framing — clearances, codenames, "last seen" — worn warm-first, never cold.</li>
  <li><b>The sky keeps town time.</b> Dawn / day / dusk / night, sun and moon, stars, and a shared forecast — the world runs on one Eastern clock.</li>
</ul>

<h2 class="vl-h">Voice</h2>
<p class="vl-body">Warm first, spy-flavoured second. Honest and encouraging — the games and stories model good values (curiosity, courage, showing up) without preaching. No hype, no false urgency. When something isn't ready, we say so plainly.</p>

<style>
.vl-intro { color: #c9a7ff; max-width: 720px; font-size: 1.05rem; line-height: 1.6; }
.vl-h { color: #F5C518; margin: 2rem 0 0.3rem; }
.vl-sub, .vl-note { color: #9a7fd4; max-width: 720px; }
.vl-note { font-size: 0.9rem; margin-top: 0.8rem; }
.vl-body { color: #f0e6ff; max-width: 720px; line-height: 1.6; }
.vl-swatches { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; margin: 1rem 0; }
.vl-sw { background: var(--c); color: var(--t, #1a0f3d); border: 1px solid rgba(255,255,255,0.14);
  border-radius: var(--r-sm); padding: 22px 12px 10px; display: flex; flex-direction: column; gap: 4px; }
.vl-sw span { font-weight: 800; font-size: 0.86rem; }
.vl-sw code { font-family: 'Share Tech Mono', monospace; font-size: 0.72rem; opacity: 0.85; }
.vl-type { display: flex; flex-direction: column; gap: 14px; margin: 1rem 0; max-width: 780px; }
.vl-type-row { background: #160c33; border: 1px solid #3a2a6a; border-radius: var(--r-md); padding: 16px 18px; }
.vl-type-sample { margin-bottom: 8px; line-height: 1.2; }
.vl-type-meta { color: #9a7fd4; font-size: 0.82rem; }
.vl-type-meta b { color: #f0e6ff; }
.vl-motifs { max-width: 780px; color: #c9b6ef; line-height: 1.7; padding-left: 18px; }
.vl-motifs b { color: #f0e6ff; }
.vl-motifs code, .vl-note code { font-family: 'Share Tech Mono', monospace; color: #F5C518; font-size: 0.85em; }
</style>
