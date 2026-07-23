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

/* (.ghub-title rules deleted 2026-07-16 with the "Choose Your Hall" heading.) */

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

/* (The category-portal treatment — the glowing gateways, spinning rune-rings and ENTER
   tags — was removed 2026-07-18 with the portals themselves; the hall is one games grid
   now, using the shared .gcard cards. See games.md markup + _pjcc-15-games.scss.) */

@media (prefers-reduced-motion: reduce){
  .ghub, .ghub::before, .ghub-rule i { animation:none; }
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
.ghub-eyebrow { margin:0 0 5px; }
.ghub-sub { margin:6px 0 0; }
.ghub-rule { margin:10px auto 0; }
/* 2026-07-18 (Nate): "move the leaderboard and the altar around, and the park table" —
   the four featured entrances (🏆 Leaderboards · the Gauntlet · Park Tables · the Gambit
   altar) now share ONE centred, evenly-spaced, bottom-aligned row (.ghub-doorway) instead
   of a lopsided top-left cluster. (.ghub-corner + .ghub-subrow were removed here.) */
.ghub { position:relative; }
.ghub-doorway .ghub-trophy { align-self:flex-end; }   /* baseline-align with the door/table */

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
  align-items:flex-end; flex-wrap:wrap; gap:18px clamp(20px, 4vw, 48px);
  margin:0 auto 14px; animation:ghub-wake .6s ease both; }

/* ---- THE PARK TABLES entrance — since 2026-07-16 it's the ONE canonical park-table
   unit (Nate: "they should always be uniform"): _includes/park-table.html +
   _pjcc-22-chess-canon.scss draw it; this page only lays it out. (The old side-view
   drawing with the plate/tag/♙♟ lives in git before this commit.) ---- */
.ptdoor { display:flex; flex-direction:column; align-items:center; gap:6px;
  text-decoration:none; }

/* ---- THE GAMBIT entrance — same row grammar, but a wager altar: a glowing ♟ coin
   floating over a small stone altar. Amber accent = the wager (never real money). ---- */
.gmdoor { display:flex; align-items:center; justify-content:center;
  text-decoration:none; --acc:#e8b34a; }
.gm-scene { position:relative; width:72px; height:92px; }
.gm-altar { position:absolute; left:50%; bottom:12px; transform:translateX(-50%);
  width:40px; height:22px; background:linear-gradient(180deg,#3a2d5a,#221936);
  border:1px solid rgba(232,179,74,0.45); border-radius:3px; box-shadow:0 0 20px -8px var(--acc); }
.gm-altar::before { content:''; position:absolute; left:-5px; right:-5px; top:-6px; height:7px;
  background:linear-gradient(180deg,#4a3a6e,#2c2148); border:1px solid rgba(232,179,74,0.4);
  border-radius:2px; }
.gm-glow { position:absolute; left:50%; top:22px; transform:translateX(-50%); width:38px; height:48px;
  background:radial-gradient(ellipse at 50% 100%, rgba(232,179,74,0.42), transparent 70%);
  filter:blur(1px); animation:gm-pulse 2.6s ease-in-out infinite; }
.gm-coin { position:absolute; left:50%; top:8px; transform:translateX(-50%); font-size:28px; line-height:1;
  color:#f5d27a; filter:drop-shadow(0 0 8px rgba(232,179,74,0.85)); transition:transform .25s, filter .25s; }
.gmdoor:hover .gm-coin, .gmdoor:focus-visible .gm-coin { transform:translateX(-50%) translateY(-4px);
  filter:drop-shadow(0 0 15px rgba(232,179,74,1)); }
.gmdoor:hover .gm-glow, .gmdoor:focus-visible .gm-glow { animation-duration:1.3s; }
@keyframes gm-pulse { 0%,100%{ opacity:0.4; } 50%{ opacity:0.95; } }
@media (prefers-reduced-motion: reduce){ .gm-glow { animation:none; } }
@media (max-width:480px){
  .gm-scene { width:58px; height:78px; }
  .gm-coin { font-size:23px; top:6px; } .gm-altar { width:34px; }
}
/* ── THE GAUNTLET DOOR on the games hall — SIZE ONLY ──────────────────────────────
   2026-07-16 evening: plate parity, the plate + sub caption rows are gone.
   2026-07-17 (Nate: "on the games hall it's to the side, and weird") — the door is a
   COLUMN here, like the splash and the hero: arch on top, the ten lift-pips BELOW it.

   2026-07-21: the ~110 lines of .gdoor LOOK that stood here are gone. They were a
   hand-maintained copy of _sass/_pjcc-21-gauntlet-door.scss, labelled "kept in sync"
   in both files, and they had already drifted apart. The partial is the single source
   now; _layouts/home.html dropped its copy in the same pass.

   What is left is the one thing that was never a duplicate: this door is DELIBERATELY
   SMALLER than the canonical 78x100. It stands in a row beside the Gambit altar, whose
   .gm-scene is 72x92 — the two have to match or the row looks broken. So these rules
   override size and nothing else. Page-local <style> sits in <body> and the partial is
   in <head>, so at equal specificity these win on order.

   Floor zero is safe from them: .gdoor[data-grand="0"] .gdoor-door is (0,3,0) and beats
   the bare .gdoor-door below, so the tattered cloth keeps its own 3px radius. ── */
.gdoor { gap:6px; }                                    /* 5px in the partial */
.gdoor-arch { width:72px; height:92px; border-radius:36px 36px 4px 4px; }
.gdoor-door { border-radius:31px 31px 0 0; }
.gdoor-glyph { font-size:29px; }
@media (max-width:480px){
  .gdoor { column-gap:12px; }
  .gdoor-arch { width:58px; height:76px; border-radius:29px 29px 4px 4px; }
  .gdoor-door { border-radius:24px 24px 0 0; }
  .gdoor-glyph { font-size:24px; }
}

/* the doorway row's own entrance animation (the .gdoor motion prefs live in the partial) */
@media (prefers-reduced-motion: reduce){
  .ghub-doorway { animation:none; }
}

/* the master reset — one quiet switch at the foot of the hall (2026-07-16 Nate) */
.ghub-reset-row { text-align:center; margin-top:26px; }
.ghub-reset { background:none; border:1px solid rgba(154,127,212,0.35); border-radius:999px;
  color:#7d6bb0; font-family:'Share Tech Mono', monospace; font-size:10px;
  letter-spacing:0.12em; padding:6px 14px; cursor:pointer;
  transition:color .2s, border-color .2s; }
.ghub-reset:hover { color:#ff8a8a; border-color:#ff8a8a; }
.ghub-reset[disabled] { opacity:0.6; cursor:default; }

/* ── THE COMBINED GAMES GRID (2026-07-18): one area, no taxonomy. Uses the shared
   .cat-games / .gcard system (hall--default purple theme) + one new honest tag. ── */
.ghub-all { margin: 6px 2px 0; position:relative; z-index:2; }
/* 12 UNIFORM boxes (2026-07-18 Nate: "make them uniform"): grid-auto-rows:1fr equalises
   every row to the tallest, and the cards stretch to fill — so all 12 are the same height
   regardless of a score chip / IN DEV tag / 2-line name. Content stays top-aligned. */
.ghub-all .cat-games { grid-template-columns: repeat(auto-fill, minmax(212px, 1fr)); grid-auto-rows: 1fr; }
.ghub-all .gcard { height: 100%; }
/* reserve the top-right corner so a title never runs UNDER the badge (the IN DEV /
   LOCKED chips are absolutely positioned there) */
.ghub-all .gcard-body h3 { padding-right: 50px; }
/* the plain "IN DEV" tag on half-built games — same badge family, amber */
.hall--default .gcard-dev { position:absolute; top:8px; right:9px; font-size:0.54rem; font-weight:900;
  letter-spacing:0.04em; border-radius:999px; padding:2px 7px; background:#ffb020; color:#1a0f3d; }
</style>

<!-- ===== THE HALLS — Gauntlet Legends portal screen (pick a hall; no games here) ===== -->
<div class="ghub">

  <!-- ── THE FEATURED ROW (2026-07-18 Nate: "move the leaderboard and the altar around,
       and the park table") — the four featured entrances stand in ONE balanced, evenly
       spaced centered row now, not a lopsided top-left cluster:
       🏆 Leaderboards · the Gauntlet · Park Tables · the Gambit altar. ── -->
  <div class="ghub-doorway">
    <a class="ghub-trophy" href="{{ '/leaderboards/' | relative_url }}" aria-label="Leaderboards" title="Leaderboards">🏆</a>

    {%- comment -%} 2026-07-16 evening (Nate): PLATE PARITY — the THE GAUNTLET plate
         and the "Begin the climb" caption are gone everywhere, like the splash. {%- endcomment -%}
    <a class="gdoor" id="gauntlet-door" href="{{ '/games/the-gauntlet/' | relative_url }}"
       aria-label="The Gauntlet — real chess vs a ladder of ten PJCC rivals">
      <span class="gdoor-arch" aria-hidden="true">
        <i class="gdoor-door"><b class="gdoor-glyph" id="gdoor-glyph">♛</b><u class="gdoor-knob"></u></i>
        <i class="gdoor-seam"></i>
      </span>
      <span class="gdoor-pips" id="gdoor-pips" aria-hidden="true"></span>
      <span class="gdoor-whisper" id="gdoor-whisper" aria-hidden="true"></span>
    </a>

    {%- comment -%} THE PARK TABLES entrance was removed from the games hall 2026-07-22
         (Nate: "Get rid of the Park table link"). Park Tables is the "Play Now" link in the
         site drawer now, so the games hall no longer duplicates it. The .ptdoor CSS above is
         left in place (harmless, unused) in case the entrance is ever restored. {%- endcomment -%}

    <a class="gmdoor" href="{{ '/the-gambit/' | relative_url }}"
       aria-label="The Gambit — wager what you've earned; the board sometimes gives back more. Never real money.">
      <span class="gm-scene" aria-hidden="true">
        <i class="gm-glow"></i>
        <b class="gm-coin">♟</b>
        <i class="gm-altar"></i>
      </span>
    </a>

  </div>

  <div class="ghub-head">
    {%- comment -%} "Choose Your Hall" removed 2026-07-16 (Nate). The eyebrow is the
         page's h1 now so the hall keeps a real heading. {%- endcomment -%}
    <h1 class="ghub-eyebrow">◆ The PJCC Arcade</h1>
    <p class="ghub-sub">Claim a codename · climb the global boards</p>
    <!-- the gold rule. Two real elements, not a pseudo: the outer one is the track and clips,
         the inner one is the shimmer and slides. See the note by @ghub-shimmer. -->
    <div class="ghub-rule" aria-hidden="true"><i></i></div>
  </div>

  <!-- ── ALL THE GAMES, ONE GRID (2026-07-18 Nate: "get rid of the taxonomy and combine
       the games. Get rid of the terminated section"). The old Learn / Arcade / In-Dev /
       Vault / Terminated category PORTALS are gone. pjcc-hall.js (data-hall="all") lists
       every playable game here in one grid — in-development ones wear a plain IN DEV tag,
       the vault game shows locked, and the terminated roster is dropped entirely. ── -->
  <div id="games-hall" class="ghub-all hall--default" data-hall="all" data-base="{{ '/games/' | relative_url }}">
    <div class="cat-games"></div>
  </div>

  {%- comment -%} 2026-07-16 (Nate: "A reset button for all games, really… Make sure
       to offer a confirmation") — ONE quiet switch at the foot of the hall wipes
       every game's LOCAL progress on this device: pjcc.best.* bests, the Gauntlet
       climb + its half-played board, the bot-table game, the blindfold unlock, the
       splash win-glint. Egg fragments and everything on the server (profile, rated
       games, leaderboards) are deliberately untouched. {%- endcomment -%}
  <div class="ghub-reset-row">
    <button class="ghub-reset" id="ghub-reset" type="button">↺ reset local game progress</button>
  </div>
</div>

<script src="{{ '/assets/js/pjcc-games-data.js' | relative_url }}"></script>
<!-- the combined grid: pjcc-hall.js reads data-hall="all" and lists every playable game
     (in-dev tagged, vault locked, terminated dropped) — replaces the old category portals. -->
<script src="{{ '/assets/js/pjcc-hall.js' | relative_url }}"></script>
<script>
// THE DOOR resume state — same climb data the game + homepage read.
(function () {
  // mirrors the LADDER order / accents / glyphs in assets/games/pjcc_gauntlet.html — keep in sync
  var NAMES = ['The Checker Town Open Champion','The Sand-Mine Foreman','The Tidecaller','The Shogi Sentinel','The City Gatekeeper','The Auditor','The Enforcer','The Vice President','The Heir Apparent','The Executive Assistant'];
  var ACCENTS = ['#8fe3ff','#fcbc3c','#56d0ff','#fcbcb0','#ffb066','#3fae7a','#ff6b6b','#c79bff','#ff9ec9','#f5c518']; // [5] Auditor: ledger-green, was mint #9ff0c4 (2026-07-22)
  var GLYPHS  = ['♞','♟','♝','♞','♜','♝','♜','♝','♛','♛'];
  var prog = {}; try { prog = JSON.parse(localStorage.getItem('pjcc.gauntlet.v2')) || {}; } catch (e) {}
  var beaten = prog.beaten || {}, cleared = 0, cur = NAMES.length;
  for (var i = 0; i < NAMES.length; i++) { if (beaten[i]) cleared++; }
  for (var j = 0; j < NAMES.length; j++) { if (!beaten[j]) { cur = j; break; } }
  var door = document.getElementById('gauntlet-door');
  if (!door) return;
  // grandeur tier — the door grows richer with every floor cleared (in sync with the home hero)
  door.setAttribute('data-grand', cleared === 0 ? 0 : cleared <= 2 ? 1 : cleared <= 4 ? 2 : cleared <= 6 ? 3 : cleared <= 9 ? 4 : 5);
  // the leaf in the arch belongs to the place you're about to enter (see _pjcc-09-widgets)
  if (cur < NAMES.length) door.setAttribute('data-floor', cur + 1);
  var pipHost = document.getElementById('gdoor-pips');
  if (pipHost) { var h = '';
    for (var k = 0; k < NAMES.length; k++) { h += '<i class="' + (beaten[k] ? 'done' : (k === cur ? 'cur' : '')) + '"></i>'; }
    pipHost.innerHTML = h; }
  // (the gdoor-sub caption is gone — 2026-07-16 plate parity; the pips carry progress)
  // #14 — the pips whisper: hover the door and the dots say what they mean
  var floorLine = cur >= NAMES.length ? 'Crowned — 10 of 10' : 'Floor ' + (cur + 1) + ' of 10';
  var wh = document.getElementById('gdoor-whisper');
  if (wh) wh.textContent = floorLine;
  door.setAttribute('aria-label', door.getAttribute('aria-label') + ' ' + floorLine + '.');
  var glyph = document.getElementById('gdoor-glyph');
  if (cur >= NAMES.length) {
    door.setAttribute('href', door.getAttribute('href') + '#tower');
  } else if (cleared > 0) {
    door.style.setProperty('--acc', ACCENTS[cur] || '#F5C518');
    if (glyph) glyph.textContent = GLYPHS[cur] || '♛';
    door.setAttribute('href', door.getAttribute('href') + '#climb');
  }
})();

// The hall's master reset (2026-07-16 Nate: "A reset button for all games, really" —
// with an are-you-sure). LOCAL progress only: personal bests (pjcc.best.*), the
// Gauntlet climb + its half-played board, the bot-table game, the blindfold unlock,
// the splash win-glint. Server records (profile, rated games, leaderboards) and
// easter-egg fragments are untouched. Reloads after, so the door resets on screen.
(function () {
  var btn = document.getElementById('ghub-reset');
  if (!btn) return;
  btn.onclick = function () {
    if (!window.confirm('Reset ALL local game progress on this device?\n\nThis clears: personal bests, the Gauntlet climb (and any half-played board), your bot-table game, and arcade unlocks.\n\nYour profile, rated games and the leaderboards are NOT touched. This can\'t be undone.')) return;
    try {
      var kill = [];
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf('pjcc.best.') === 0) kill.push(k);
      }
      kill.push('pjcc.gauntlet.v2', 'pjcc.gauntlet.game.v1', 'pjcc.park.bot.v1',
                'pjcc.blindfold.unlocked', 'pjcc.pt.winday');
      kill.forEach(function (k) { try { localStorage.removeItem(k); } catch (e) {} });
    } catch (e) {}
    btn.textContent = '✓ progress reset';
    btn.disabled = true;
    setTimeout(function () { location.reload(); }, 900);
  };
})();
</script>

<!-- Enter a hall → the screen blooms to that hall's color, like the splash quads. -->
<script src="{{ '/assets/js/pjcc-warp.js' | relative_url }}"></script>
