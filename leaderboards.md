---
layout: page
title: Leaderboards
permalink: /leaderboards/
---

<link rel="stylesheet" href="{{ '/assets/css/pjcc-profile.css' | relative_url }}">

<!-- ===== THE BROADCAST — standings as a live sports feed (the commentators' channel) ===== -->
<div class="lbtv">
  <div class="lbtv-topbar">
    <span class="lbtv-live"><i></i>LIVE</span>
    <span class="lbtv-net">CHESS CITY NETWORK</span>
    <span class="lbtv-show">OPERATIVE STANDINGS</span>
  </div>

  <p class="lb-intro lbtv-sub">Standings across the McPuppy Studios games. <strong>Overall</strong> ranks every operative by total credits earned everywhere; each channel shows the best runs in that game. Sign in on any game page to claim your spot.</p>

  <a class="lb-hof-link lbtv-hof" href="{{ '/hall-of-fame/' | relative_url }}">
    <span class="lbtv-hof-cup">🏆</span>
    <span style="flex:1;min-width:0;">
      <span class="lbtv-hof-eyebrow">Seasons &amp; champions</span>
      <span class="lbtv-hof-title">Hall of Fame</span>
      <span class="lbtv-hof-sub">Every month is a Tour — see who's crowned this season and the past champions.</span>
    </span>
    <span class="lbtv-hof-arrow">&rarr;</span>
  </a>

  <div class="lb-tabs" id="lb-tabs"></div>
  <div class="lbtv-screen">
    <div id="lb-body"><p class="lb-empty">Tuning in…</p></div>
  </div>
  <div class="lbtv-ticker" aria-hidden="true"><span>◆ FROM THE BOOTH — "Every credit counts, folks." · "A NEW challenger on the board!" · "The tower does not climb itself." · "That score will NOT stand for long." ◆</span></div>
</div>

<style>
/* ===== broadcast chrome ===== */
.lbtv { --tv-red:#ff4d5e; --tv-gold:#F5C518; }
.lbtv-topbar { display:flex; align-items:center; gap:14px; flex-wrap:wrap;
  background:linear-gradient(90deg,#1a1040,#2d1b69 55%,#1a1040); border:1px solid #4a3a86; border-left:4px solid var(--tv-red);
  border-radius:10px; padding:10px 16px; margin:2px 0 12px;
  font-family:'Courier New',monospace; letter-spacing:0.14em; }
.lbtv-live { display:inline-flex; align-items:center; gap:7px; color:#fff; font-weight:900; font-size:0.78rem;
  background:var(--tv-red); border-radius:6px; padding:3px 10px; }
.lbtv-live i { width:8px; height:8px; border-radius:50%; background:#fff; animation:lbtvBlink 1.1s ease-in-out infinite; }
@keyframes lbtvBlink { 0%,100%{ opacity:1; } 50%{ opacity:0.25; } }
.lbtv-net { color:var(--tv-gold); font-weight:900; font-size:0.78rem; }
.lbtv-show { margin-left:auto; color:#9a8fd4; font-size:0.7rem; }
.lbtv-sub { color:#b9a8e6; font-size:0.88rem; }

/* Hall of Fame plate */
.lbtv-hof { display:flex; align-items:center; gap:12px; background:linear-gradient(135deg,#241452,#3a2d1a);
  border:1px solid var(--tv-gold); border-radius:12px; padding:13px 18px; margin:0 0 1.1rem; text-decoration:none;
  color:#f0e6ff; box-shadow:0 0 22px -10px var(--tv-gold); }
.lbtv-hof:hover { box-shadow:0 0 30px -8px var(--tv-gold); }
.lbtv-hof-cup { font-size:1.7rem; line-height:1; }
.lbtv-hof-eyebrow { display:block; font-size:0.66rem; letter-spacing:0.12em; text-transform:uppercase; color:#e9c75a; }
.lbtv-hof-title { display:block; font-weight:800; color:#fff; }
.lbtv-hof-sub { display:block; font-size:0.8rem; color:#cdbcf2; }
.lbtv-hof-arrow { flex-shrink:0; color:var(--tv-gold); font-weight:900; }

/* channel-chip tabs */
.lbtv .lb-tabs { gap:6px; }
.lbtv .lb-tab { font-family:'Courier New',monospace; font-size:0.72rem; font-weight:900; letter-spacing:0.08em;
  text-transform:uppercase; background:#160c33; border:1px solid #3a2a6a; border-radius:6px; color:#9a8fd4; }
.lbtv .lb-tab:hover { border-color:var(--tv-gold); color:#f0e6ff; }
.lbtv .lb-tab.active { background:var(--tv-gold); border-color:var(--tv-gold); color:#1a0f3d; box-shadow:0 0 14px -4px var(--tv-gold); }

/* the screen: standings inside a CRT-ish monitor */
.lbtv-screen { position:relative; background:#0d0824; border:1px solid #3a2a6a; border-radius:12px; padding:8px 12px;
  box-shadow:inset 0 0 44px rgba(0,0,0,0.55), 0 0 26px -16px var(--tv-gold); overflow:hidden; }
.lbtv-screen::after { content:''; position:absolute; inset:0; pointer-events:none; border-radius:12px;
  background:repeating-linear-gradient(0deg, rgba(255,255,255,0.022) 0 1px, transparent 1px 3px); }

/* the booth ticker */
.lbtv-ticker { margin-top:10px; overflow:hidden; white-space:nowrap; border:1px solid #3a2a6a; border-radius:8px;
  background:#0d0824; font-family:'Courier New',monospace; font-size:0.72rem; color:#8fb8ff; padding:6px 0; }
.lbtv-ticker span { display:inline-block; padding-left:100%; animation:lbtvTick 38s linear infinite; }
@keyframes lbtvTick { 0%{ transform:translateX(0); } 100%{ transform:translateX(-100%); } }
@media (prefers-reduced-motion: reduce){ .lbtv-live i, .lbtv-ticker span { animation:none; } .lbtv-ticker span { padding-left:0; } }
</style>

<script src="{{ '/assets/js/pjcc-config.js' | relative_url }}"></script>
<script src="{{ '/assets/js/pjcc-profile.js' | relative_url }}"></script>
<script src="{{ '/assets/js/pjcc-leaderboard.js' | relative_url }}" defer></script>
