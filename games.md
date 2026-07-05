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

/* ---- #9 THE FLAGSHIP — the Gauntlet promoted above the halls ---- */
.ghub-flagship { position:relative; z-index:2; display:flex; align-items:center; gap:18px; text-decoration:none;
  max-width:860px; margin:0 auto 24px; padding:20px 22px 18px 22px;
  background:linear-gradient(135deg,#241206 0%,#3a2a10 52%,#231640 100%);
  border:2px solid #F5C518; border-radius:18px; overflow:hidden;
  box-shadow:0 0 40px -14px #F5C518, inset 0 0 70px -34px rgba(245,197,24,0.5);
  animation:ghub-wake .6s ease both; transition:transform .12s, box-shadow .12s; }
.ghub-flagship::before { content:''; position:absolute; right:-50px; top:-50px; width:220px; height:220px; border-radius:50%;
  background:radial-gradient(circle, rgba(245,197,24,0.2), transparent 70%); pointer-events:none; }
.ghub-flagship:hover { transform:translateY(-2px); box-shadow:0 0 54px -8px #F5C518, inset 0 0 70px -34px rgba(245,197,24,0.5); }
.gfl-badge { position:absolute; top:0; left:22px; font-size:0.6rem; font-weight:900; letter-spacing:0.16em; color:#1a0f3d;
  background:#F5C518; padding:3px 10px 4px; border-radius:0 0 8px 8px; }
.gfl-glyph { flex-shrink:0; font-size:3rem; line-height:1; color:#F5C518; filter:drop-shadow(0 3px 8px rgba(0,0,0,0.6)); position:relative; z-index:1; }
.gfl-main { flex:1; min-width:0; position:relative; z-index:1; padding-top:6px; display:flex; flex-direction:column; align-items:flex-start; }
.gfl-title { font-size:1.75rem; font-weight:900; color:#fff; line-height:1.05; text-shadow:0 2px 10px rgba(0,0,0,0.55); }
.gfl-tag { color:#e7d6b0; font-size:0.9rem; line-height:1.4; margin-top:3px; max-width:60ch; }
.gfl-pips { display:flex; gap:4px; margin:9px 0 5px; }
.gfl-pip { width:15px; height:7px; border-radius:2px; background:rgba(255,255,255,0.14); }
.gfl-pip.done { background:#6bffb8; } .gfl-pip.cur { background:#F5C518; box-shadow:0 0 8px #F5C518; }
.gfl-resume { color:#fff; font-size:0.85rem; font-weight:700; } .gfl-resume b { color:#F5C518; }
.gfl-cta { flex-shrink:0; position:relative; z-index:1; align-self:center;
  background:linear-gradient(135deg,#F5C518,#ffd740); color:#1a0f3d; font-weight:900; font-size:1rem;
  border-radius:999px; padding:12px 26px; white-space:nowrap; box-shadow:0 4px 0 #7a5e0a; }
.ghub-flagship:hover .gfl-cta { filter:brightness(1.05); }
@media (max-width:620px){
  .ghub-flagship { flex-wrap:wrap; gap:12px 14px; padding:18px 16px 16px; }
  .gfl-glyph { font-size:2.2rem; }
  .gfl-title { font-size:1.4rem; }
  .gfl-cta { width:100%; text-align:center; }
}
@media (prefers-reduced-motion: reduce){ .ghub-flagship { animation:none; } }
</style>

<!-- ===== THE HALLS — Gauntlet Legends portal screen (pick a hall; no games here) ===== -->
<div class="ghub">
  <a class="ghub-trophy" href="{{ '/leaderboards/' | relative_url }}" aria-label="Leaderboards & Hall of Fame" title="Leaderboards &amp; Hall of Fame">🏆</a>

  <!-- ── THE FLAGSHIP: the Gauntlet, promoted above the halls ── -->
  <a class="ghub-flagship" id="ghub-flagship" href="{{ '/games/the-gauntlet/' | relative_url }}">
    <span class="gfl-badge">◆ THE FLAGSHIP</span>
    <span class="gfl-glyph" aria-hidden="true">♛</span>
    <span class="gfl-main">
      <span class="gfl-title">The Gauntlet</span>
      <span class="gfl-tag">Real chess against ten PJCC champions — climb the tower from Checker Town to the CEO's crown.</span>
      <span class="gfl-pips" id="gfl-pips" aria-hidden="true"></span>
      <span class="gfl-resume" id="gfl-resume">Begin the climb — Floor 1 awaits.</span>
    </span>
    <span class="gfl-cta" id="gfl-cta">▶ ENTER</span>
  </a>

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

// Flagship resume state — same climb data the game + homepage read (#8/#6).
(function () {
  var NAMES = ['Argus the Guard-Dog','The Sand-Mine Foreman','The Tidecaller','The Shogi Sentinel','The City Gatekeeper','The Auditor','The Enforcer','The Vice President','The Rival','The CEO'];
  var prog = {}; try { prog = JSON.parse(localStorage.getItem('pjcc.gauntlet.v2')) || {}; } catch (e) {}
  var beaten = prog.beaten || {}, cleared = 0, cur = NAMES.length;
  for (var i = 0; i < NAMES.length; i++) { if (beaten[i]) cleared++; }
  for (var j = 0; j < NAMES.length; j++) { if (!beaten[j]) { cur = j; break; } }
  var pipHost = document.getElementById('gfl-pips');
  if (pipHost) { var h = '';
    for (var k = 0; k < NAMES.length; k++) { h += '<span class="gfl-pip ' + (beaten[k] ? 'done' : (k === cur ? 'cur' : '')) + '"></span>'; }
    pipHost.innerHTML = h; }
  var res = document.getElementById('gfl-resume'), cta = document.getElementById('gfl-cta'), link = document.getElementById('ghub-flagship');
  if (cleared === 0) { if (res) res.innerHTML = 'Begin the climb — <b>Floor 1: ' + NAMES[0] + '</b>.'; }
  else if (cur >= NAMES.length) { if (res) res.innerHTML = '<b>Crowned.</b> All ten cleared — rematch anyone.'; if (cta) cta.textContent = '♛ TOWER'; if (link) link.setAttribute('href', link.getAttribute('href') + '#climb'); }
  else { if (res) res.innerHTML = 'Floor ' + (cur + 1) + ' of 10 — <b>' + NAMES[cur] + '</b> awaits.'; if (cta) cta.textContent = '▶ CONTINUE'; if (link) link.setAttribute('href', link.getAttribute('href') + '#climb'); }
})();
</script>

<!-- Enter a hall → the screen blooms to that hall's colour, like the splash quads. -->
<script src="{{ '/assets/js/pjcc-warp.js' | relative_url }}"></script>
