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
  {%- comment -%} 2026-07-28 (Nate): "Add an Altar link to the Leaderboard page and the Profile
       page (the two main places where users can view their credits)." This page is where a
       player sees the number; the altar is the only place it means anything. One quiet line —
       the Gambit is a ritual room, not a promo.

       ORDER SWAPPED 2026-07-28 evening (Nate: "switch the positions of the Booth Quotes and
       The Gambit"). The altar now sits directly under the standings and the booth signs off
       at the very bottom, which is the right way round: the door you might actually walk
       through belongs next to the number that opens it, and colour commentary belongs after
       the game, not between the score and the exit. {%- endcomment -%}
  <a class="lb-altar" href="{{ '/the-gambit/' | relative_url }}">
    <span class="lb-altar-glyph" aria-hidden="true">&#9823;</span>
    <span class="lb-altar-txt"><b>The Gambit</b><small>Lay credits on the altar — the board sometimes gives back more</small></span>
    <span class="lb-altar-arw" aria-hidden="true">&rarr;</span>
  </a>

  <div class="lbtv-ticker" aria-hidden="true">
    <span class="lbtv-booth">◆ FROM THE BOOTH</span>
    <span class="lbtv-quote" id="lbtv-quote">"Every credit counts, folks."</span>
  </div>
</div>

<script>
// The booth speaks one line at a time now (Nate 2026-07-15) — a slow cross-fade through the
// pool instead of a marquee of all of them strung together. Reduced-motion holds the first line.
(function () {
  var el = document.getElementById('lbtv-quote'); if (!el) return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var quotes = ['"Every credit counts, folks."', '"A NEW challenger on the board!"', '"The tower does not climb itself."'];
  var i = 0;
  // 4200ms → 16800ms, 2026-07-28 (Nate: "slow down the turnover on the Booth Quotes. Way down
  // — like 4x"). At 4.2s a line changed while you were still reading the one before it, which
  // makes a ticker feel like a slot machine. The cross-fade itself stays at 420ms; it's the
  // DWELL that was wrong, not the transition.
  setInterval(function () {
    el.style.opacity = '0';
    setTimeout(function () { i = (i + 1) % quotes.length; el.textContent = quotes[i]; el.style.opacity = '1'; }, 420);
  }, 16800);
})();
</script>

<style>
/* ===== broadcast chrome ===== */
.lbtv { --tv-red:#ff4d5e; --tv-gold:#F5C518; }
.lbtv-topbar { display:flex; align-items:center; gap:14px; flex-wrap:wrap;
  background:linear-gradient(90deg,#1a1040,#2d1b69 55%,#1a1040); border:1px solid #4a3a86; border-left:4px solid var(--tv-red);
  border-radius:var(--r-sm); padding:10px 16px; margin:2px 0 12px;
  font-family:'Courier New',monospace; letter-spacing:0.14em; }
.lbtv-live { display:inline-flex; align-items:center; gap:7px; color:#fff; font-weight:900; font-size:0.78rem;
  /* a11y sweep 2026-07-13: white on --tv-red was 3.2:1; the LIVE chip wears a deeper
     broadcast red (4.9:1) while the border accent keeps the bright one. */
  background:#d92638; border-radius:6px; padding:3px 10px; }
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
/* the CRT screen + booth are TRANSLUCENT (2026-07-23, Nate: "see the moon through the boxes")
   so the town sky shows through the leaderboard box like the games hall. They sit inside the
   (now also translucent) .page-card, so a lighter alpha keeps the two layers from stacking back
   to opaque; the inner glow is eased for the same reason. */
.lbtv-screen { position:relative; background:rgba(13,8,36,0.58); border:1px solid #3a2a6a; border-radius:var(--r-md); padding:8px 12px;
  box-shadow:inset 0 0 44px rgba(0,0,0,0.4), 0 0 26px -16px var(--tv-gold); overflow:hidden; }
.lbtv-screen::after { content:''; position:absolute; inset:0; pointer-events:none; border-radius:var(--r-md);
  background:repeating-linear-gradient(0deg, rgba(255,255,255,0.022) 0 1px, transparent 1px 3px); }

/* the booth — one line at a time, cross-fading (was a marquee of all lines at once) */
.lbtv-ticker { margin-top:10px; border:1px solid #3a2a6a; border-radius:8px;
  background:rgba(13,8,36,0.58); font-family:'Courier New',monospace; font-size:0.72rem; padding:7px 12px;
  display:flex; align-items:center; justify-content:center; gap:10px; min-height:30px; text-align:center; }
.lbtv-booth { color:#6f5fb0; flex-shrink:0; letter-spacing:0.08em; font-weight:900; }
.lbtv-quote { color:#8fb8ff; transition:opacity 0.42s ease; }
@media (prefers-reduced-motion: reduce){ .lbtv-live i { animation:none; } }

/* the altar line — the credits on this page are only worth something somewhere */
.lb-altar { display:flex; align-items:center; gap:12px; margin-top:12px; padding:11px 14px;
  border:1px solid #3a2a6a; border-radius:var(--r-md); background:rgba(13,8,36,0.58);
  text-decoration:none; transition:border-color .14s ease, transform .14s ease; }
.lb-altar:hover { border-color:var(--tv-gold); transform:translateY(-2px); text-decoration:none; }
.lb-altar-glyph { font-size:22px; line-height:1; color:var(--tv-gold); flex:0 0 auto; }
.lb-altar-txt { flex:1; min-width:0; }
.lb-altar-txt b { display:block; color:#f0e6ff; font-size:0.95rem; }
.lb-altar-txt small { display:block; color:#8f83c0; font-size:0.78rem; line-height:1.5; }
.lb-altar-arw { color:var(--tv-gold); flex:0 0 auto; }
</style>

<script src="{{ '/assets/js/pjcc-config.js' | relative_url }}"></script>
<script src="{{ '/assets/js/pjcc-profile.js' | relative_url }}"></script>
<script src="{{ '/assets/js/pjcc-leaderboard.js' | relative_url }}" defer></script>
