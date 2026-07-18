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
/* 2026-07-18 (Nate): the 🏆 Leaderboards trophy + the Gambit altar moved UP to the
   hall's TOP-LEFT, standing together, inset a little from the corner ("center it in a
   bit") instead of flanking the Sealed/Retired row at the foot. That row below is now
   just the two dormant halls (Vault · Terminated), centred. */
.ghub { position:relative; }   /* anchor the top-left corner cluster */
.ghub-corner { position:absolute; top:16px; left:40px; z-index:4;
  display:flex; align-items:center; gap:14px; }
.ghub-corner .ghub-trophy { font-size:30px; line-height:1; text-decoration:none;
  filter:drop-shadow(0 0 10px rgba(245,197,24,0.4)); transition:transform .16s ease, filter .16s ease; }
.ghub-corner .ghub-trophy:hover, .ghub-corner .ghub-trophy:focus-visible {
  transform:translateY(-2px); filter:drop-shadow(0 0 16px rgba(245,197,24,0.72)); }
.ghub-corner .gm-scene { transform:scale(0.82); transform-origin:center bottom; }
@media (max-width:760px){
  /* it can't sit beside the centred doorway on narrow screens without crowding it —
     flow it in as a small left-aligned row at the very top instead. */
  .ghub-corner { position:static; margin:0 0 2px 6px; }
}
/* (.ghub-subrow + the sealed/retired sub-grid were removed 2026-07-18 with the taxonomy.) */

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
  flex-wrap:wrap; gap:14px 54px; margin:0 auto 14px; animation:ghub-wake .6s ease both; }

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
/* (2026-07-16 evening plate parity: the plate + sub caption rows are gone.)
   2026-07-17 (Nate: "on the games hall it's to the side, and weird") — the door is a
   COLUMN now, like the splash + hero: arch on top, the ten lift-pips BELOW it. */
.gdoor { display:flex; flex-direction:column; align-items:center; gap:6px;
  position:relative;   /* anchors the pips whisper below the unit */
  text-decoration:none; --acc:#F5C518; }
.gdoor-pips { display:flex; gap:3px; }
.gdoor-pips i { width:6px; height:6px; border-radius:50%; background:rgba(255,255,255,0.14); }
.gdoor-pips i.done { background:#6bffb8; box-shadow:0 0 5px rgba(107,255,184,0.6); }
.gdoor-pips i.cur { background:var(--acc); box-shadow:0 0 7px var(--acc);
  animation:gdoorPip 1.8s ease-in-out infinite; }
@keyframes gdoorPip { 50% { opacity:0.4; } }
/* #14 — the pips whisper (twin of _pjcc-21-gauntlet-door.scss — keep in sync):
   hover/focus the door and the lift-pips say "Floor N of 10"; aria-label carries
   the same fact for screen readers. Absolute, so the door never reflows. */
.gdoor-whisper { position:absolute; top:calc(100% + 5px); left:50%;
  transform:translate(-50%, -2px); white-space:nowrap;
  font-family:'Share Tech Mono', ui-monospace, monospace; font-size:9px; letter-spacing:0.14em;
  color:rgba(233,226,255,0.62); text-shadow:0 0 8px rgba(0,0,0,0.6);
  opacity:0; transition:opacity .3s ease, transform .3s ease; pointer-events:none; }
.gdoor:hover .gdoor-whisper,
.gdoor:focus-visible .gdoor-whisper { opacity:1; transform:translate(-50%, 0); }
.gdoor-arch { position:relative; display:block; width:72px; height:92px;
  border:2px solid rgba(245,197,24,0.6); border-bottom-width:0; border-radius:36px 36px 4px 4px;
  overflow:hidden; box-shadow:0 0 26px -8px var(--acc);
  background:radial-gradient(ellipse at 50% 85%, color-mix(in srgb, var(--acc) 32%, #0c0722), #0c0722 78%);
  transition:box-shadow .2s ease; }
.gdoor-door { position:absolute; left:5px; right:5px; top:5px; bottom:0;
  border-radius:31px 31px 0 0; border:1px solid rgba(168,121,255,0.35);
  background:linear-gradient(180deg, #251747 0%, #150c33 100%);
  transform-origin:0 50%; transition:transform .35s ease;
  will-change:transform; /* pre-promote — kills the first-frame raster hitch (2026-07-16 audit) */ }
.gdoor-glyph { position:absolute; left:50%; top:40%; transform:translate(-50%,-50%);
  font-style:normal; font-weight:400; font-size:29px; line-height:1; color:var(--acc);
  filter:drop-shadow(0 0 9px color-mix(in srgb, var(--acc) 65%, transparent)); }
.gdoor-knob { position:absolute; right:9px; top:56%; width:5px; height:5px; border-radius:50%;
  background:#F5C518; box-shadow:0 0 5px rgba(245,197,24,0.8); }
.gdoor-seam { position:absolute; left:6px; right:6px; bottom:0; height:3px; background:var(--acc);
  box-shadow:0 -2px 14px 3px color-mix(in srgb, var(--acc) 55%, transparent); }
.gdoor:hover .gdoor-arch, .gdoor:focus-visible .gdoor-arch { box-shadow:0 0 34px -5px var(--acc); }
/* opens like a shogi screen — the panel SLIDES LEFT instead of swinging (Nate 2026-07-15) */
.gdoor:hover .gdoor-door, .gdoor:focus-visible .gdoor-door { transform:translateX(-60%); }
@media (max-width:480px){
  .gdoor { column-gap:12px; }
  .gdoor-arch { width:58px; height:76px; border-radius:29px 29px 4px 4px; }
  .gdoor-door { border-radius:24px 24px 0 0; }
  .gdoor-glyph { font-size:24px; }
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
.gdoor[data-grand="5"] .gdoor-door { transform:translateX(-10%); }
.gdoor[data-grand="5"] .gdoor-seam { height:5px; box-shadow:0 -3px 28px 7px color-mix(in srgb, var(--acc) 74%, transparent); }

/* FLOOR ZERO (Nate 2026-07-13): before a single floor is cleared there is no door
   at all — just a tattered cloth hung on a rod across the arch, hem torn ragged,
   the light behind leaking through the tears. Still unmistakably a doorway.
   (KEEP IN SYNC with the twin copy in _layouts/home.html.) */
.gdoor[data-grand="0"] .gdoor-arch { border-color:rgba(245,197,24,0.38); box-shadow:0 0 18px -10px var(--acc); }
/* tan/brown worn cloth with holes; pushed aside FROM THE MIDDLE on hover (2026-07-14) */
.gdoor[data-grand="0"] .gdoor-door {
  left:7px; right:7px; top:12px;
  border:0; border-top:3px solid rgba(122,94,58,0.8);
  border-radius:3px 3px 0 0;
  background:
    linear-gradient(100deg, rgba(0,0,0,0) 30%, rgba(58,38,16,0.35) 36%, rgba(0,0,0,0) 43%),
    linear-gradient(84deg,  rgba(0,0,0,0) 62%, rgba(58,38,16,0.28) 68%, rgba(0,0,0,0) 75%),
    linear-gradient(180deg, #a8845c 0%, #7c5a38 55%, #5e4226 100%);
  clip-path:polygon(0 0, 100% 0, 100% 72%, 89% 95%, 76% 76%, 63% 98%, 48% 79%, 34% 96%, 21% 78%, 10% 93%, 0 76%);
  -webkit-mask-image:
    radial-gradient(circle 3px at 26% 38%, transparent 98%, #000 100%),
    radial-gradient(circle 2px at 64% 24%, transparent 98%, #000 100%),
    radial-gradient(circle 4px at 74% 58%, transparent 98%, #000 100%),
    radial-gradient(circle 2px at 38% 70%, transparent 98%, #000 100%),
    radial-gradient(circle 3px at 52% 49%, transparent 98%, #000 100%);
  mask-image:
    radial-gradient(circle 3px at 26% 38%, transparent 98%, #000 100%),
    radial-gradient(circle 2px at 64% 24%, transparent 98%, #000 100%),
    radial-gradient(circle 4px at 74% 58%, transparent 98%, #000 100%),
    radial-gradient(circle 2px at 38% 70%, transparent 98%, #000 100%),
    radial-gradient(circle 3px at 52% 49%, transparent 98%, #000 100%);
  -webkit-mask-composite: source-in;
  mask-composite: intersect;
  transform-origin: 84% 50%;
}
.gdoor[data-grand="0"] .gdoor-knob { display:none; }
.gdoor[data-grand="0"] .gdoor-glyph { font-size:26px; opacity:0.55; filter:none; color:#3a2612; }
.gdoor[data-grand="0"] .gdoor-seam { height:2px; box-shadow:0 -2px 10px 2px color-mix(in srgb, var(--acc) 38%, transparent); }
.gdoor[data-grand="0"] .gdoor-door { transition:transform .5s cubic-bezier(.3,1.25,.4,1); }
.gdoor[data-grand="0"]:hover .gdoor-door,
.gdoor[data-grand="0"]:focus-visible .gdoor-door { transform:translateX(-58%); }

@media (prefers-reduced-motion: reduce){
  .ghub-doorway { animation:none; }
  .gdoor-pips i.cur { animation:none; }
  .gdoor-door { transition:none; }
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
.ghub-all .cat-games { grid-template-columns: repeat(auto-fill, minmax(212px, 1fr)); }
/* reserve the top-right corner so a title never runs UNDER the badge (the IN DEV /
   LOCKED chips are absolutely positioned there) */
.ghub-all .gcard-body h3 { padding-right: 50px; }
/* the plain "IN DEV" tag on half-built games — same badge family, amber */
.hall--default .gcard-dev { position:absolute; top:8px; right:9px; font-size:0.54rem; font-weight:900;
  letter-spacing:0.04em; border-radius:999px; padding:2px 7px; background:#ffb020; color:#1a0f3d; }
</style>

<!-- ===== THE HALLS — Gauntlet Legends portal screen (pick a hall; no games here) ===== -->
<div class="ghub">

  <!-- ── TOP-LEFT CLUSTER: the Leaderboards trophy + the Gambit altar, promoted up
       here together (2026-07-18 Nate: "move the Leaderboard trophy to top left, but
       center it in a little bit… move the altar next to the trophy"). Inset from the
       corner so they don't jam the edge. They used to flank the Sealed/Retired row
       at the foot of the hall. ── -->
  <div class="ghub-corner">
    <a class="ghub-trophy" href="{{ '/leaderboards/' | relative_url }}" aria-label="Leaderboards" title="Leaderboards">🏆</a>
    <a class="gmdoor" href="{{ '/the-gambit/' | relative_url }}"
       aria-label="The Gambit — wager what you've earned; the board sometimes gives back more. Never real money.">
      <span class="gm-scene" aria-hidden="true">
        <i class="gm-glow"></i>
        <b class="gm-coin">♟</b>
        <i class="gm-altar"></i>
      </span>
    </a>
  </div>

  <!-- ── THE DOOR: the Gauntlet, above the halls ── -->
  <div class="ghub-doorway">
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

    <!-- ── THE PARK TABLES: matchmaking stands beside the Gauntlet (Nate 2026-07-14:
         "take it out of the arcade and place it prominently, same as Gauntlet").
         2026-07-16 (Nate): "they should always be uniform" — the old side-view drawing
         (plate + tag + ♙♟ + caption) is replaced by the ONE canonical park-table unit
         (shared include + _pjcc-22-chess-canon.scss), same as the splash and the PJCC
         hero. Restore the old drawing from git before this commit if it's missed. ── -->
    <a class="ptdoor" href="{{ '/games/park-tables/' | relative_url }}"
       aria-label="The Park Tables — play another operative or challenge McPuppy; rated games move your PJCC Rating">
      {% include park-table.html %}
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
  var ACCENTS = ['#8fe3ff','#fcbc3c','#56d0ff','#fcbcb0','#ffb066','#9ff0c4','#ff6b6b','#c79bff','#ff9ec9','#f5c518'];
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

<!-- Enter a hall → the screen blooms to that hall's colour, like the splash quads. -->
<script src="{{ '/assets/js/pjcc-warp.js' | relative_url }}"></script>
