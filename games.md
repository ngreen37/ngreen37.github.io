---
layout: default
title: Games
permalink: /games/
---

<link rel="stylesheet" href="{{ '/assets/css/pjcc-games.css' | relative_url }}">
<link rel="stylesheet" href="{{ '/assets/css/pjcc-warp.css' | relative_url }}">

<style>
/* Hall-select — dark "Gauntlet Legends" theme (base lives in pjcc-games.css).
   These are page-local flourishes: the panel wakes in, the embers twinkle, the
   title breathes its glow, and a gold rule shimmers under the header. */
.ghub { animation:ghub-wake .5s ease both; }
@keyframes ghub-wake { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }

.ghub::before { animation:ghub-twinkle 6s ease-in-out infinite; }
@keyframes ghub-twinkle { 0%,100% { opacity:.4; } 50% { opacity:.72; } }

.ghub-title { animation:ghub-glow 3.6s ease-in-out infinite; }
@keyframes ghub-glow {
  0%,100% { text-shadow:0 0 26px rgba(255,170,60,0.5), 0 3px 0 #6b4416, 0 5px 14px rgba(0,0,0,0.7); }
  50%     { text-shadow:0 0 42px rgba(255,205,95,0.9), 0 3px 0 #6b4416, 0 6px 18px rgba(0,0,0,0.85); }
}

.ghub-head::after { content:""; display:block; height:2px; width:190px; margin:16px auto 0; border-radius:2px;
  background:linear-gradient(90deg, transparent 0%, #ffcf6b 50%, transparent 100%); background-size:220% 100%;
  box-shadow:0 0 16px rgba(255,175,60,0.65); animation:ghub-sweep 5s ease-in-out infinite; }
@keyframes ghub-sweep { 0%,100% { background-position:120% 0; } 50% { background-position:-20% 0; } }

/* the ENTER tag fades + slides in on hover */
.ghub-portal .ghp-enter { transform:translateX(4px); transition:opacity .14s, transform .18s; }
.ghub-portal:hover .ghp-enter, .ghub-portal:active .ghp-enter { transform:translateX(0); }

/* ---- Gauntlet Legends portal treatment: glowing gateways with rune-rings ---- */
.ghub-portal > span { position:relative; z-index:1; }               /* label + glyph ride above the glow */
.ghub-portal::after { content:""; position:absolute; inset:0; z-index:0; pointer-events:none; border-radius:inherit;
  opacity:.4; transition:opacity .18s ease;
  background:radial-gradient(78% 46% at 50% 0%, color-mix(in srgb, var(--c) 45%, transparent), transparent 72%); }
.ghub-portal:hover::after, .ghub-portal:focus-visible::after, .ghub-portal:active::after { opacity:.92; }
/* torch flicker on the glyph */
.ghub-portal .ghp-glyph { animation:ghp-flicker 3.2s ease-in-out infinite; }
@keyframes ghp-flicker {
  0%,100% { filter:drop-shadow(0 0 14px color-mix(in srgb, var(--c) 70%, transparent)); }
  45%     { filter:drop-shadow(0 0 22px color-mix(in srgb, var(--c) 92%, transparent)) brightness(1.12); }
  72%     { filter:drop-shadow(0 0 12px color-mix(in srgb, var(--c) 58%, transparent)) brightness(0.98); } }
/* a rotating dashed rune-ring + a counter-rotating inner ring behind the glyph */
.ghub-portal .ghp-glyph::before, .ghub-portal .ghp-glyph::after { content:""; position:absolute; left:50%; top:50%;
  border-radius:50%; z-index:-1; transform:translate(-50%,-50%); pointer-events:none; }
.ghub-portal .ghp-glyph::before { width:90px; height:90px; opacity:.5;
  border:2px dashed color-mix(in srgb, var(--c) 60%, transparent);
  box-shadow:0 0 24px color-mix(in srgb, var(--c) 38%, transparent), inset 0 0 16px color-mix(in srgb, var(--c) 20%, transparent);
  animation:ghp-ring 11s linear infinite; }
.ghub-portal .ghp-glyph::after { width:68px; height:68px; opacity:.45;
  border:1px solid color-mix(in srgb, var(--c) 45%, transparent); animation:ghp-ring 8s linear infinite reverse; }
.ghub-portal:hover .ghp-glyph::before { opacity:.95; animation-duration:5s; }
.ghub-portal:hover .ghp-glyph::after  { opacity:.8; }
@keyframes ghp-ring { from { transform:translate(-50%,-50%) rotate(0deg); } to { transform:translate(-50%,-50%) rotate(360deg); } }
@media (max-width:560px){
  .ghub-portal .ghp-glyph::before { width:72px; height:72px; }
  .ghub-portal .ghp-glyph::after  { width:54px; height:54px; }
}

@media (prefers-reduced-motion: reduce){
  .ghub, .ghub::before, .ghub-title, .ghub-head::after,
  .ghub-portal .ghp-glyph, .ghub-portal .ghp-glyph::before, .ghub-portal .ghp-glyph::after { animation:none; }
  .ghub { opacity:1; transform:none; }
}
@media (max-width:600px){ .ghub-head::after { width:140px; } }
</style>

<!-- ===== THE HALLS — Gauntlet Legends portal screen (pick a hall; no games here) ===== -->
<div class="ghub">
  <a class="ghub-trophy" href="{{ '/leaderboards/' | relative_url }}" aria-label="Leaderboards & Hall of Fame" title="Leaderboards &amp; Hall of Fame">🏆</a>
  <div class="ghub-head">
    <p class="ghub-eyebrow">◆ The PJCC Arcade</p>
    <h1 class="ghub-title">Choose Your Hall</h1>
    <p class="ghub-sub">Claim a codename · climb the global boards</p>
  </div>

  <!-- the active halls -->
  <div class="ghub-grid" id="ghub-grid"></div>

  <!-- sealed & retired — set apart, lower -->
  <div class="ghub-divider"><span>Sealed &amp; Retired</span></div>
  <div class="ghub-grid ghub-grid--sub" id="ghub-grid-sub"></div>
</div>

<script src="{{ '/assets/js/pjcc-games-data.js' | relative_url }}"></script>
<script>
(function () {
  var base = '{{ "/games/" | relative_url }}'.replace(/\/$/, '');
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function portal(key) {
    var c = PJCC_CATS[key];
    var n = PJCC_GAMES.filter(function (g) { return g.cat === key; }).length;
    return '<a class="ghub-portal" href="' + base + '/' + c.route + '/" style="--c:' + c.accent + '" data-warp>' +
      '<span class="ghp-enter">ENTER ▸</span>' +
      '<span class="ghp-glyph">' + c.glyph + '</span>' +
      '<span class="ghp-name">' + esc(c.name) + '</span>' +
      '<span class="ghp-blurb">' + esc(c.blurb) + '</span>' +
      '<span class="ghp-count">' + n + ' game' + (n === 1 ? '' : 's') + '</span></a>';
  }
  document.getElementById('ghub-grid').innerHTML = ['learn', 'arcade', 'dev'].map(portal).join('');
  document.getElementById('ghub-grid-sub').innerHTML = ['vault', 'terminated'].map(portal).join('');
})();
</script>

<!-- Enter a hall → the screen blooms to that hall's colour, like the splash quads. -->
<script src="{{ '/assets/js/pjcc-warp.js' | relative_url }}"></script>
