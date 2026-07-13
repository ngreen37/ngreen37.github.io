---
layout: page
title: Leaderboards
permalink: /leaderboards/
---


<!-- ===== THE BROADCAST — standings as a live sports feed (the commentators' channel) ===== -->
<div class="lbtv">
  <div class="lbtv-topbar">
    <span class="lbtv-live"><i></i>LIVE</span>
    <span class="lbtv-net">CHESS CITY NETWORK</span>
    <span class="lbtv-show">OPERATIVE STANDINGS</span>
  </div>

  <p class="lb-intro lbtv-sub">Standings across the McPuppy Studios games. <strong>Overall</strong> ranks every operative by total credits earned everywhere; each channel shows the best runs in that game. <span id="lb-signin-hint">Sign in on any game page to claim your spot.</span></p>
  <script>
  // The sign-in nudge only shows while signed out; signed in, it greets you instead.
  (function () {
    function upd() {
      var el = document.getElementById('lb-signin-hint');
      if (!el || !window.PJCC || !PJCC.enabled) return;
      var prof = PJCC.getProfile && PJCC.getProfile();
      if (PJCC.currentUser && PJCC.currentUser()) {
        el.innerHTML = prof && prof.codename
          ? 'Signed in as <strong>' + String(prof.codename).replace(/[&<>"]/g, '') + '</strong> — your runs count.'
          : 'Signed in — your runs count.';
      } else {
        el.textContent = 'Sign in on any game page to claim your spot.';
      }
    }
    function arm() { if (window.PJCC && PJCC.ready) { PJCC.onChange(upd); PJCC.ready.then(upd); } else { setTimeout(arm, 300); } }
    arm();
  })();
  </script>

  {% comment %} The Hall of Fame plate that stood here was removed 2026-07-12 (Nate: "remove
       the hall of fame completely, from all pages"). The whole feature — the /hall-of-fame/
       page, PJCC.HALL_OF_FAME, the season-champion framing — is gone with it, and the idea is
       parked in FUTURE-IDEAS. It was a trophy case with nothing in it: no season has ever
       closed, so it advertised an empty room on the busiest page in the arcade. {% endcomment %}

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

/* (the Hall of Fame plate + its styles were removed 2026-07-12 with the feature) */

/* ── SPLIT BOARD — one chip, two boards (2026-07-12, Nate) ────────────────────
   Siege is one game with two modes scored in different units (score / wave), so a
   single table can't hold them — but they were never two games, and they shouldn't
   eat two chips in the tab row. One "Siege on Chess City" chip now opens both boards
   side by side. Stacks on a phone; the screen is only ~360px wide there and two
   tables abreast would be unreadable. */
.lb-split { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:18px; }
.lb-split-col { min-width:0; }
.lb-split-h { display:flex; align-items:center; gap:8px; margin:6px 0 8px;
  font-family:'Courier New',monospace; font-size:0.74rem; font-weight:900; letter-spacing:0.12em;
  text-transform:uppercase; color:var(--tv-gold); }
.lb-split-dot { width:7px; height:7px; border-radius:50%; background:var(--tv-gold); flex-shrink:0;
  box-shadow:0 0 8px var(--tv-gold); }
.lb-split .lb-table { width:100%; }
@media (max-width:640px){ .lb-split { grid-template-columns:1fr; gap:10px; } }

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
