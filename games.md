---
layout: default
title: Games
permalink: /games/
---


<style>
/* Hall-select — dark "Gauntlet Legends" theme (base lives in pjcc-games.css).
   These are page-local flourishes: the panel wakes in, the embers twinkle, the
   title breathes its glow, and a gold rule shimmers under the header. */
.ghub { animation:ghub-wake .5s ease both; }
@keyframes ghub-wake { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }

.ghub::before { animation:ghub-twinkle 6s ease-in-out infinite; }
@keyframes ghub-twinkle { 0%,100% { opacity:.4; } 50% { opacity:.72; } }

/* (2026-07-11 perf: the glow no longer breathes — animating text-shadow repaints
   the whole title every frame; it wears the mid glow statically now.) */
.ghub-title { text-shadow:0 0 34px rgba(255,190,80,0.7), 0 3px 0 #6b4416, 0 5px 16px rgba(0,0,0,0.78); }

/* The gold rule under the header, with a shimmer that sweeps along it.
   ─────────────────────────────────────────────────────────────────────────────
   REBUILT 2026-07-13 after `npm run perf` caught it. It used to be one pseudo-element
   animating BACKGROUND-POSITION:
       @keyframes ghub-sweep { 0%,100% { background-position:120% 0 } 50% { background-position:-20% 0 } }
   background-position is a PAINT property — it repaints the element every single frame on
   the main thread. It is the exact pattern the 2026-07-11 lag hunt banned site-wide, and
   that pass fixed the text-shadow on the line ABOVE this one and the drop-shadow filters
   BELOW it, and walked straight past this. It survived because a 190×2px bar is invisible
   in a profile — until you ablate it and the frame time drops.

   Now: a TRACK that clips (.ghub-rule) and a wider SHIMMER inside it (i) that translates.
   transform only, so it rides the compositor and costs nothing. Identical on screen. */
.ghub-rule { position:relative; overflow:hidden; height:2px; width:190px; margin:16px auto 0;
  border-radius:2px; background:rgba(255,175,60,0.18); box-shadow:0 0 16px rgba(255,175,60,0.45); }
.ghub-rule i { position:absolute; top:0; left:0; height:100%; width:60%; border-radius:2px;
  background:linear-gradient(90deg, transparent 0%, #ffcf6b 50%, transparent 100%);
  animation:ghub-shimmer 5s ease-in-out infinite; will-change:transform; }
@keyframes ghub-shimmer {
  0%, 100% { transform:translateX(190px); }
  50%      { transform:translateX(-114px); }   /* 60% of 190px = 114px — fully off the left */
}

/* the ENTER tag fades + slides in on hover */
.ghub-portal .ghp-enter { transform:translateX(4px); transition:opacity .14s, transform .18s; }
.ghub-portal:hover .ghp-enter, .ghub-portal:active .ghp-enter { transform:translateX(0); }

/* ---- Gauntlet Legends portal treatment: glowing gateways with rune-rings ---- */
.ghub-portal > span { position:relative; z-index:1; }               /* label + glyph ride above the glow */
.ghub-portal::after { content:""; position:absolute; inset:0; z-index:0; pointer-events:none; border-radius:inherit;
  opacity:.4; transition:opacity .18s ease;
  background:radial-gradient(78% 46% at 50% 0%, color-mix(in srgb, var(--c) 45%, transparent), transparent 72%); }
.ghub-portal:hover::after, .ghub-portal:focus-visible::after, .ghub-portal:active::after { opacity:.92; }
/* the torch glow — static since 2026-07-11 (five glyphs animating drop-shadow
   filters = per-frame re-render each; the hover rings carry the life now) */
.ghub-portal .ghp-glyph { filter:drop-shadow(0 0 16px color-mix(in srgb, var(--c) 75%, transparent)); }
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
@media (max-width:700px){
  /* phones: the ten rune-rings rest (2 per portal × 5, always spinning) */
  .ghub-portal .ghp-glyph::before, .ghub-portal .ghp-glyph::after { animation:none; }
}

@media (prefers-reduced-motion: reduce){
  .ghub, .ghub::before, .ghub-title, .ghub-rule i,
  .ghub-portal .ghp-glyph, .ghub-portal .ghp-glyph::before, .ghub-portal .ghp-glyph::after { animation:none; }
  .ghub { opacity:1; transform:none; }
}
@media (max-width:600px){ .ghub-rule { width:140px; } }

/* ---- HEIGHT PASS (2026-07-12, Nate: "can we reduce its height?") ------------
   The door above went from a ~175px column to a ~90px row. The rest of the page
   was simply generous: a 52px title with 22px of air under it, a 30px gap above the
   Sealed / Retired divider, and portals sized for a bigger screen than they need.
   Nothing is removed here — every hall, the trophy, the door and the divider all
   still stand. It's just tightened, and the whole hall now lands ~200px shorter. */
.ghub { padding:18px 16px 22px; }
.ghub-head { margin:2px 0 14px; }
.ghub-title { font-size:clamp(26px,5.4vw,40px); }
.ghub-eyebrow { margin:0 0 5px; }
.ghub-sub { margin:6px 0 0; }
.ghub-rule { margin:10px auto 0; }
.ghub-portal { min-height:150px; padding:16px 12px 13px; }
.ghub-portal .ghp-glyph { font-size:2.7rem; }
.ghub-portal .ghp-blurb { margin-top:4px; }
.ghub-portal .ghp-count { margin-top:7px; }
.ghub-divider { margin:18px 4px 10px; }
.ghub-grid--sub .ghub-portal { min-height:104px; padding:12px 10px 10px; }
.ghub-grid--sub .ghp-glyph { font-size:2rem; }
@media (max-width:560px){
  .ghub-portal { min-height:128px; }
  .ghub-grid--sub .ghub-portal { min-height:96px; }
}

/* ---- THE DOOR — the Gauntlet stands above the halls as a doorway.
   (The big MAIN QUEST banner was retired 2026-07-10 — "takes up too much of the
   Games Page"; restore from git.)

   2026-07-12 (Nate: "can we reduce the games hall's height? I see opportunity on
   the gauntlet link") — and he was right, this was the single tallest thing on the
   page. It was a COLUMN: plate, pips, a 108px arch, then the sub line, stacked =
   ~175px before the grid even starts.

   It's a ROW here now: the arch on the left, the plate/pips/sub stacked beside it.
   Same door, same pieces, ~90px instead of ~175. Laid out with grid rather than
   reordered markup, so the HTML is still the door the home hero uses.

   NOTE — the home hero has its OWN copy of .gdoor and it stays a COLUMN: it sits in
   a wide hero with room to spare, and the vertical door is the better shape there.
   The two copies are deliberately different now; don't "sync" this back. ---- */
.ghub-doorway { position:relative; z-index:2; display:flex; justify-content:center;
  margin:0 auto 14px; animation:ghub-wake .6s ease both; }
.gdoor { display:grid; grid-template-columns:auto minmax(0,1fr);
  grid-template-areas:"arch plate" "arch pips" "arch sub";
  align-content:center; align-items:center; column-gap:16px; row-gap:5px;
  text-decoration:none; --acc:#F5C518; }
.gdoor-plate { grid-area:plate; justify-self:start; align-self:end;
  font-family:'Share Tech Mono','Courier New',monospace; font-size:10px; font-weight:700;
  letter-spacing:2px; color:#F5C518; background:rgba(12,8,2,0.55);
  border:1px solid rgba(245,197,24,0.5); border-radius:3px; padding:4px 10px; white-space:nowrap; }
.gdoor-pips { grid-area:pips; display:flex; gap:3px; }
.gdoor-pips i { width:6px; height:6px; border-radius:50%; background:rgba(255,255,255,0.14); }
.gdoor-pips i.done { background:#6bffb8; box-shadow:0 0 5px rgba(107,255,184,0.6); }
.gdoor-pips i.cur { background:var(--acc); box-shadow:0 0 7px var(--acc);
  animation:gdoorPip 1.8s ease-in-out infinite; }
@keyframes gdoorPip { 50% { opacity:0.4; } }
.gdoor-arch { grid-area:arch; position:relative; display:block; width:72px; height:92px;
  border:2px solid rgba(245,197,24,0.6); border-bottom-width:0; border-radius:36px 36px 4px 4px;
  overflow:hidden; box-shadow:0 0 26px -8px var(--acc);
  background:radial-gradient(ellipse at 50% 85%, color-mix(in srgb, var(--acc) 32%, #0c0722), #0c0722 78%);
  transition:box-shadow .2s ease; }
.gdoor-door { position:absolute; left:5px; right:5px; top:5px; bottom:0;
  border-radius:31px 31px 0 0; border:1px solid rgba(168,121,255,0.35);
  background:linear-gradient(180deg, #251747 0%, #150c33 100%);
  transform-origin:0 50%; transition:transform .35s ease; }
.gdoor-glyph { position:absolute; left:50%; top:40%; transform:translate(-50%,-50%);
  font-style:normal; font-weight:400; font-size:29px; line-height:1; color:var(--acc);
  filter:drop-shadow(0 0 9px color-mix(in srgb, var(--acc) 65%, transparent)); }
.gdoor-knob { position:absolute; right:9px; top:56%; width:5px; height:5px; border-radius:50%;
  background:#F5C518; box-shadow:0 0 5px rgba(245,197,24,0.8); }
.gdoor-seam { position:absolute; left:6px; right:6px; bottom:0; height:3px; background:var(--acc);
  box-shadow:0 -2px 14px 3px color-mix(in srgb, var(--acc) 55%, transparent); }
.gdoor-sub { grid-area:sub; align-self:start; font-size:0.82rem; color:#e7d6b0; text-align:left; max-width:34ch; }
.gdoor-sub b { color:#F5C518; }
.gdoor:hover .gdoor-arch, .gdoor:focus-visible .gdoor-arch { box-shadow:0 0 34px -5px var(--acc); }
.gdoor:hover .gdoor-door, .gdoor:focus-visible .gdoor-door { transform:perspective(320px) rotateY(-22deg); }
@media (max-width:480px){
  .gdoor { column-gap:12px; }
  .gdoor-arch { width:58px; height:76px; border-radius:29px 29px 4px 4px; }
  .gdoor-door { border-radius:24px 24px 0 0; }
  .gdoor-glyph { font-size:24px; }
  .gdoor-sub { font-size:0.75rem; }
}

/* ── GRANDEUR: the door grows richer the higher you climb (Nate 2026-07-12) —
   kept in sync with the home hero's copy. data-grand 0..5 from cleared floors. ── */
.gdoor[data-grand="1"] .gdoor-arch { border-color:rgba(245,197,24,0.72); box-shadow:0 0 30px -7px var(--acc); }
.gdoor[data-grand="2"] .gdoor-arch { border-color:rgba(245,197,24,0.85); border-width:3px; box-shadow:0 0 36px -6px var(--acc), inset 0 0 18px -7px var(--acc); }
.gdoor[data-grand="3"] .gdoor-arch { border-color:#F5C518; border-width:3px; box-shadow:0 0 44px -4px var(--acc), inset 0 0 22px -6px var(--acc); }
.gdoor[data-grand="4"] .gdoor-arch { border-color:#ffe07a; border-width:3px; box-shadow:0 0 52px -3px var(--acc), inset 0 0 26px -5px var(--acc); }
.gdoor[data-grand="5"] .gdoor-arch { border-color:#fff2b0; border-width:4px; box-shadow:0 0 64px 0 var(--acc), inset 0 0 30px -4px var(--acc); }
.gdoor[data-grand="3"] .gdoor-glyph,
.gdoor[data-grand="4"] .gdoor-glyph { filter:drop-shadow(0 0 13px var(--acc)); }
.gdoor[data-grand="5"] .gdoor-glyph { filter:drop-shadow(0 0 16px var(--acc)) drop-shadow(0 0 5px #fff); }
.gdoor-arch::after { content:''; position:absolute; left:50%; top:6px; transform:translateX(-50%);
  font-size:12px; line-height:1; opacity:0; z-index:2; pointer-events:none; text-shadow:0 0 6px var(--acc); }
.gdoor[data-grand="3"] .gdoor-arch::after,
.gdoor[data-grand="4"] .gdoor-arch::after { content:'◆'; color:var(--acc); opacity:0.92; }
.gdoor[data-grand="5"] .gdoor-arch::after { content:'👑'; opacity:1; font-size:14px; top:3px; }
.gdoor[data-grand="4"] .gdoor-seam,
.gdoor[data-grand="5"] .gdoor-seam { height:4px; box-shadow:0 -3px 20px 5px color-mix(in srgb, var(--acc) 62%, transparent); }
/* CROWNED — all ten floors BEATEN: the door rests AJAR, light spilling from within. */
.gdoor[data-grand="5"] .gdoor-door { transform:perspective(320px) rotateY(-15deg); }
.gdoor[data-grand="5"] .gdoor-seam { height:5px; box-shadow:0 -3px 28px 7px color-mix(in srgb, var(--acc) 74%, transparent); }

/* FLOOR ZERO (Nate 2026-07-13): before a single floor is cleared there is no door
   at all — just a tattered cloth hung on a rod across the arch, hem torn ragged,
   the light behind leaking through the tears. Still unmistakably a doorway.
   (KEEP IN SYNC with the twin copy in _layouts/home.html.) */
.gdoor[data-grand="0"] .gdoor-arch { border-color:rgba(245,197,24,0.38); box-shadow:0 0 18px -10px var(--acc); }
.gdoor[data-grand="0"] .gdoor-door {
  left:7px; right:7px; top:12px;
  border:0; border-top:3px solid rgba(168,121,255,0.45);   /* the rod it hangs from */
  border-radius:3px 3px 0 0;
  background:
    linear-gradient(100deg, rgba(0,0,0,0) 30%, rgba(0,0,0,0.25) 36%, rgba(0,0,0,0) 43%),
    linear-gradient(84deg,  rgba(0,0,0,0) 62%, rgba(0,0,0,0.20) 68%, rgba(0,0,0,0) 75%),
    linear-gradient(180deg, #37294f 0%, #221838 100%);
  clip-path:polygon(0 0, 100% 0, 100% 72%, 89% 95%, 76% 76%, 63% 98%, 48% 79%, 34% 96%, 21% 78%, 10% 93%, 0 76%);
}
.gdoor[data-grand="0"] .gdoor-knob { display:none; }
.gdoor[data-grand="0"] .gdoor-glyph { font-size:26px; opacity:0.7; filter:none; }
.gdoor[data-grand="0"] .gdoor-seam { height:2px; box-shadow:0 -2px 10px 2px color-mix(in srgb, var(--acc) 38%, transparent); }
.gdoor[data-grand="0"]:hover .gdoor-door,
.gdoor[data-grand="0"]:focus-visible .gdoor-door { transform:skewX(-7deg) translateX(4px); }

@media (prefers-reduced-motion: reduce){
  .ghub-doorway { animation:none; }
  .gdoor-pips i.cur { animation:none; }
  .gdoor-door { transition:none; }
}
</style>

<!-- ===== THE HALLS — Gauntlet Legends portal screen (pick a hall; no games here) ===== -->
<div class="ghub">
  <a class="ghub-trophy" href="{{ '/leaderboards/' | relative_url }}" aria-label="Leaderboards" title="Leaderboards">🏆</a>

  <!-- ── THE DOOR: the Gauntlet, above the halls ── -->
  <div class="ghub-doorway">
    <a class="gdoor" id="gauntlet-door" href="{{ '/games/the-gauntlet/' | relative_url }}"
       aria-label="The Gauntlet — real chess vs a ladder of ten PJCC rivals">
      <span class="gdoor-plate">THE GAUNTLET</span>
      <span class="gdoor-pips" id="gdoor-pips" aria-hidden="true"></span>
      <span class="gdoor-arch" aria-hidden="true">
        <i class="gdoor-door"><b class="gdoor-glyph" id="gdoor-glyph">♛</b><u class="gdoor-knob"></u></i>
        <i class="gdoor-seam"></i>
      </span>
      <span class="gdoor-sub" id="gdoor-sub">Begin the climb — <b>Floor 1</b> awaits.</span>
    </a>
  </div>

  <div class="ghub-head">
    <p class="ghub-eyebrow">◆ The PJCC Arcade</p>
    <h1 class="ghub-title">Choose Your Hall</h1>
    <p class="ghub-sub">Claim a codename · climb the global boards</p>
    <!-- the gold rule. Two real elements, not a pseudo: the outer one is the track and clips,
         the inner one is the shimmer and slides. See the note by @ghub-shimmer. -->
    <div class="ghub-rule" aria-hidden="true"><i></i></div>
  </div>

  <!-- the active halls -->
  <div class="ghub-grid" id="ghub-grid"></div>

  <!-- sealed / retired — set apart, lower -->
  <div class="ghub-divider"><span>Sealed / Retired</span></div>
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

// THE DOOR resume state — same climb data the game + homepage read.
(function () {
  // mirrors the LADDER order / accents / glyphs in assets/games/pjcc_gauntlet.html — keep in sync
  var NAMES = ['The Checker Town Open Champion','The Sand-Mine Foreman','The Tidecaller','The Shogi Sentinel','The City Gatekeeper','The Auditor','The Enforcer','The Vice President','The Heir Apparent','The CEO'];
  var ACCENTS = ['#8fe3ff','#fcbc3c','#56d0ff','#fcbcb0','#ffb066','#9ff0c4','#ff6b6b','#c79bff','#ff9ec9','#ff8fd0'];
  var GLYPHS  = ['♞','♟','♝','♞','♜','♝','♜','♝','♛','♛'];
  var prog = {}; try { prog = JSON.parse(localStorage.getItem('pjcc.gauntlet.v2')) || {}; } catch (e) {}
  var beaten = prog.beaten || {}, cleared = 0, cur = NAMES.length;
  for (var i = 0; i < NAMES.length; i++) { if (beaten[i]) cleared++; }
  for (var j = 0; j < NAMES.length; j++) { if (!beaten[j]) { cur = j; break; } }
  var door = document.getElementById('gauntlet-door');
  if (!door) return;
  // grandeur tier — the door grows richer with every floor cleared (in sync with the home hero)
  door.setAttribute('data-grand', cleared === 0 ? 0 : cleared <= 2 ? 1 : cleared <= 4 ? 2 : cleared <= 6 ? 3 : cleared <= 9 ? 4 : 5);
  var pipHost = document.getElementById('gdoor-pips');
  if (pipHost) { var h = '';
    for (var k = 0; k < NAMES.length; k++) { h += '<i class="' + (beaten[k] ? 'done' : (k === cur ? 'cur' : '')) + '"></i>'; }
    pipHost.innerHTML = h; }
  var glyph = document.getElementById('gdoor-glyph'), sub = document.getElementById('gdoor-sub');
  if (cur >= NAMES.length) {
    if (sub) sub.innerHTML = '<b>Crowned.</b> All ten cleared — rematch anyone.';
    door.setAttribute('href', door.getAttribute('href') + '#tower');
  } else if (cleared > 0) {
    door.style.setProperty('--acc', ACCENTS[cur] || '#F5C518');
    if (glyph) glyph.textContent = GLYPHS[cur] || '♛';
    if (sub) sub.innerHTML = 'Floor ' + (cur + 1) + ' of 10 — <b>' + NAMES[cur] + '</b> awaits.';
    door.setAttribute('href', door.getAttribute('href') + '#climb');
  } else {
    if (sub) sub.innerHTML = 'Begin the climb — <b>Floor 1: ' + NAMES[0] + '</b>.';
  }
})();
</script>

<!-- Enter a hall → the screen blooms to that hall's colour, like the splash quads. -->
<script src="{{ '/assets/js/pjcc-warp.js' | relative_url }}"></script>
