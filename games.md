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

/* The ember twinkle was retired 2026-07-28. It was a 6s opacity pulse on a pseudo-element
   covering the WHOLE panel — measured live at 1042x672, that is 6.0MB of GPU texture
   (0.53 of a full screen) held forever so a field of embers could fade between 40% and
   72%. Half a screen of compositor memory for a slow dimmer switch. The embers are still
   there; they now sit at the midpoint of the pulse they used to ride, and the panel holds
   no layer at all. Restore: put the animation back and know what it costs. */
.ghub::before { opacity:.56; }

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
.ghub { padding:18px var(--space-4) 14px; margin-bottom:0.7rem; }  /* adoption: horizontal 16px = --space-4 exact. Vertical trimmed 2026-07-24 (Nate: "make the games hall fit on one window on PC") — bottom padding 22→14, box margin 1.4rem→0.7rem. */
/* ONE-WINDOW FIT (2026-07-24) — the global .page-content bottom padding is 60px, a big empty
   gap between this box and the footer. This rule ONLY exists on /games/ (games.md's <style> is
   page-local), so it trims that gap here and nowhere else. All reclaimed space is empty — no
   content moved. Tunable: say the word for more or less. */
.page-content { padding-bottom:28px; }
.ghub-head { margin:2px 0 14px; }
.ghub-eyebrow { margin:0 0 5px; }
.ghub-sub { margin:6px 0 0; }
.ghub-rule { margin:10px auto 0; }
/* 2026-07-18 (Nate): "move the leaderboard and the altar around, and the park table" —
   the four featured entrances (🏆 Leaderboards · the Gauntlet · Park Tables · the Gambit
   altar) now share ONE centered, evenly-spaced, bottom-aligned row (.ghub-doorway) instead
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
/* 2026-07-25 (Nate): spread the two featured entrances apart — Gauntlet door LEFT, trophy
   RIGHT — rather than clustering them center. A centered max-width band + space-between sits
   them over the inner columns (≈ the Pirc + Clearance boxes); nudge the width to taste. */
.ghub-doorway { position:relative; z-index:2; display:flex; justify-content:space-between;
  align-items:flex-end; flex-wrap:wrap; gap:18px clamp(20px, 4vw, 48px);
  max-width:min(62%, 560px); margin:0 auto 14px; animation:ghub-wake .6s ease both; }

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
/* THE GAMBIT ALTAR IN THE GRID (2026-07-24 Nate: "put it down there … don't give it a box") —
   the altar is now the LAST item of the games grid, next to Blindfold Puzzles. No card box; it
   fills its cell height, centers, and is scaled up a little so it reads at grid scale. Placed +
   kept in the grid by the small script at the foot of this file. */
.ghub-all .gmdoor--grid { height:100%; min-height:130px; }
.ghub-all .gmdoor--grid .gm-scene { transform:scale(1.2); transform-origin:center; }
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
   hand-maintained copy of _sass/_pjcc-21-gauntlet-door.scss, labeled "kept in sync"
   in both files, and they had already drifted apart. The partial is the single source
   now; _layouts/home.html dropped its copy in the same pass.

   What is left is the one thing that was never a duplicate: this door is DELIBERATELY
   SMALLER than the canonical 78x100. It stands in a row beside the Gambit altar, whose
   .gm-scene is 72x92 — the two have to match or the row looks broken. So these rules
   override size and nothing else. Page-local <style> sits in <body> and the partial is
   in <head>, so at equal specificity these win on order.

   ⚑ 2026-08-05: and now it really IS size and nothing else. Four more lines stood here —
   two radii and two font-sizes, one pair per breakpoint — each of them a hand-correction
   for a leaf whose insets and glyph were flat pixels while the arch around them scaled.
   The partial makes the arch a container and states the whole leaf in cqw, so a caller
   that sets width + height gets the same door for free at any size. ── */
.gdoor { gap:6px; }                                    /* 5px in the partial */
.gdoor-arch { width:72px; height:92px; }
@media (max-width:480px){
  .gdoor { column-gap:12px; }
  /* ⚠ 58 → 59 (2026-08-05): 58/76 is 0.763, the second-worst proportion on the site after
     the front door's. Same width the phone row always had, one pixel over, and the phone
     door is now the same door as the desktop one to three decimal places. */
  .gdoor-arch { width:59px; height:76px; }
}

/* the doorway row's own entrance animation (the .gdoor motion prefs live in the partial) */
@media (prefers-reduced-motion: reduce){
  .ghub-doorway { animation:none; }
}

/* the master reset — one quiet switch at the foot of the hall (2026-07-16 Nate) */
.ghub-reset-row { text-align:center; margin-top:14px; }  /* was 26px — one-window trim 2026-07-24 */
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
/* ══ ON THE WORKBENCH — one row instead of five construction signs (2026-08-05) ══════════
   Nate: "put the Building games into one 'on the workbench' row please."

   WHAT STOOD HERE, and why it went: a caution-tape WATERMARK spanning every half-built card
   (2026-07-24, his: "make the In Dev symbol more prominent … maybe like a watermarked-
   caution-tape-like symbol that spans the whole game box"), plus a two-step dim on the tiles
   as a set (2026-07-27, "the overall page looks too busy"). Both were right for tiles, and
   the second one is the tell — the page was already too busy, and the answer at the time was
   to turn the noise DOWN rather than to take it out of the grid.

   ⭐ IT WAS ALWAYS A COUNTING PROBLEM, AND THE PHONE IS WHERE YOU SEE IT. Five of eleven
   tiles wore the tape. In a desktop grid that is five among eleven; in ONE COLUMN it is five
   consecutive full-width hazard banners, and the arcade reads as a building site. No amount
   of dimming fixes a repetition — you fix a repetition by saying the thing ONCE.

   So the half-built games are their own strip now: a heading, one honest line, and a chip
   each. Everything is still linked and still playable. The tape is gone because the heading
   already says it, and a chip cannot be mistaken for a finished game the way a full card can.
   ⚠ The words are the REGISTRY'S (`PJCC_CATS.dev.tag` / `.blurb` in pjcc-games-data.js), not
   this file's — the hall prints them, so there is one place to change them.
   ⚠ Amber, dashed, and quiet: it keeps the caution-tape COLOR as a signal and drops the
   caution-tape VOLUME. `--accent` is each game's own, so the chips still read as a set of
   different things rather than a list.

   ⚑ BLUEPRINT, NOT PURPLE (2026-08-10, Nate: "De-purple the On The Workbench — give it a
   fun new, on-theme color"). The strip used to be filled with the hall's own purple, which
   made it read as one more purple box on a purple page — a heading was the only thing
   telling you these five were different. It is a drafting table now: navy-ink ground, a
   dashed pale-blue edge, and the amber heading left exactly where it was, because amber IS
   this site's "in development" signal and the ask was to change the GROUND, not the sign.
   ⭐ Blue is also the ground that shows the chips best. Each chip's icon wears its game's
   own `--accent` (orange pawn, pink pawn, blue face) and those all sank into the amber
   candidate — a warm ground eats warm accents. Picked from a render of four, not a guess.
   ⚠ AND THE PURPLE WAS COMING FROM SOMEWHERE ELSE TOO. The global `h2` rule paints a 2px
   `#3d2b8a` underline; `.wb-h` is an `<h2>`, so a purple rule sat under the heading and no
   declaration in this block mentioned it. De-purpling a box means looking at what the box
   INHERITS, not only at what it sets. It comes off here — an eyebrow-sized heading inside
   a bordered panel does not need a second horizontal line under it.
   Measured on the composited ground: heading 9.3:1, sub-line 8.9:1, chip label 11.8:1. */
.hall-workbench { margin: 2.2rem auto 0; max-width: 980px; padding: 1.1rem 1.2rem 1.3rem;
  border: 1px dashed rgba(120,196,255,0.30); border-radius: 14px;
  background: rgba(12,34,50,0.60); }
.hall-workbench .wb-h { margin: 0 0 0.3rem; font-family:'Poppins',sans-serif; font-weight: 800;
  font-size: 0.92rem; letter-spacing: 0.12em; text-transform: uppercase; color: #ffb020;
  border-bottom: none; padding-bottom: 0; }
.hall-workbench .wb-glyph { font-size: 1rem; }
.hall-workbench .wb-sub { margin: 0 0 0.9rem; font-size: 0.8rem; line-height: 1.5; color: #9dc0d9; }
.hall-workbench .wb-row { display: flex; flex-wrap: wrap; gap: 8px; }
.wb-chip { display: inline-flex; align-items: center; gap: 8px; text-decoration: none;
  padding: 9px 14px; min-height: 44px;      /* a finger, not a cursor — see _pjcc-27-tap-targets */
  border: 1px solid rgba(120,196,255,0.30); border-radius: 999px;
  background: #143046; color: #e2f1fd; font-size: 0.82rem; font-weight: 600;
  transition: background .14s ease, border-color .14s ease, transform .1s ease; }
.wb-chip .wb-ico { font-size: 1rem; line-height: 1; color: var(--accent); }
.wb-chip:hover, .wb-chip:focus-visible { background: #1d4462; border-color: var(--accent);
  transform: translateY(-1px); }
@media (prefers-reduced-motion: reduce) { .wb-chip:hover, .wb-chip:focus-visible { transform: none; } }

/* ═══ UNIQUE BOX DESIGNS — the five working games (2026-07-24, Nate: "give the working
   games unique, fun box designs … different text, different feels, for each. Play around.
   Have fun."). Each shipped tile becomes its own little world: a themed ground, a scrap of
   ambient motion, its cryptic line (rendered by pjcc-hall.js as .gcard-tag) and a one-word
   eyebrow. Since 2026-08-05 these five ARE the grid — the half-built games moved to the
   workbench row above. ALL motion is transform/opacity only (the site perf rule) and folds flat under
   reduced-motion at the very bottom of this block. Specificity `.ghub-all .gcard[data-slug]`
   (0,3,x) clears the shared `.hall--default .gcard` (0,2,0) themes in _pjcc-15-games.scss. ══ */
.ghub-all .gcard[data-slug] { overflow:hidden; }
/* the icon + copy ride ABOVE each card's ambient ::before decoration — but ONLY these two,
   so the corner badges (NEW / SOON / ★ best) keep their own positioning and still paint
   over the tile. */
.ghub-all .gcard[data-slug] > .gcard-icon,
.ghub-all .gcard[data-slug] > .gcard-body { position:relative; z-index:1; }
.ghub-all .gcard-tag { margin:0.2rem 0 0; font-size:0.72rem; line-height:1.4; color:#cdbdf0; }
/* the one-word eyebrow above each working title — visual shared, the word set per slug */
.ghub-all .gcard[data-slug="notation-run"]  .gcard-body h3::before,
.ghub-all .gcard[data-slug="clearance-delta"] .gcard-body h3::before,
.ghub-all .gcard[data-slug="sky-run"]        .gcard-body h3::before,
.ghub-all .gcard[data-slug="sand-mine-depths"] .gcard-body h3::before,
.ghub-all .gcard[data-slug="tower-defense"]  .gcard-body h3::before {
  display:block; margin:0 0 3px; font:800 0.5rem/1 'Share Tech Mono',monospace;
  letter-spacing:0.18em; text-transform:uppercase; opacity:0.72; color:var(--accent); }

/* ── 1 · NOTATION BLITZ — a metronome over sheet-music staff lines ── */
.ghub-all .gcard[data-slug="notation-run"] {
  background:
    repeating-linear-gradient(0deg, transparent 0 9px, rgba(248,216,0,0.12) 9px 10px),
    linear-gradient(135deg,#3b3016,#27213c);
  border-color:#f8d800; }
.ghub-all .gcard[data-slug="notation-run"] .gcard-body h3::before { content:"Rhythm drill"; }
.ghub-all .gcard[data-slug="notation-run"] .gcard-icon {
  transform-origin:50% 88%; animation:nb-tick 1.4s ease-in-out infinite; }
@keyframes nb-tick { 0%,100%{ transform:rotate(-15deg); } 50%{ transform:rotate(15deg); } }
.ghub-all .gcard[data-slug="notation-run"]:hover .gcard-icon { animation-duration:0.55s; }

/* ── 2 · CLEARANCE: DELTA — a security terminal: scanline, sweeping bar, blinking cursor ── */
.ghub-all .gcard[data-slug="clearance-delta"] {
  background:
    repeating-linear-gradient(0deg, transparent 0 3px, rgba(255,119,168,0.06) 3px 4px),
    linear-gradient(160deg,#33172f,#1d1033);
  border:1px dashed #ff77a8; }
.ghub-all .gcard[data-slug="clearance-delta"] .gcard-body h3::before { content:"Clearance check"; }
/* the scanning bar — dimmed 25% on 2026-07-27 with the Sand Mine glint (Nate: "same with
   the Clearance Delta red bar that slides the color down… more subtle") */
.ghub-all .gcard[data-slug="clearance-delta"]::before {
  content:''; position:absolute; left:0; right:0; top:0; height:22%; z-index:0; pointer-events:none;
  background:linear-gradient(180deg, rgba(255,119,168,0.18), transparent);
  animation:cd-scan 3.4s linear infinite; }
@keyframes cd-scan { 0%{ transform:translateY(-40%); } 100%{ transform:translateY(520%); } }
.ghub-all .gcard[data-slug="clearance-delta"] .gcard-icon { animation:cd-led 1.7s steps(1,end) infinite; }
@keyframes cd-led { 0%,62%{ opacity:1; } 63%,100%{ opacity:0.42; } }
.ghub-all .gcard[data-slug="clearance-delta"] .gcard-tag::after {
  content:'▊'; margin-left:3px; color:#ff77a8; animation:cd-cursor 1.05s steps(1,end) infinite; }
@keyframes cd-cursor { 0%,50%{ opacity:1; } 51%,100%{ opacity:0; } }

/* ── 3 · SKY RUN — an updraft: pieces drift down the sky, the knight bobs and leaps ── */
.ghub-all .gcard[data-slug="sky-run"] {
  background:linear-gradient(180deg,#164a6c 0%,#122b50 58%,#1b1644 100%);
  border-color:#3cbcfc; }
.ghub-all .gcard[data-slug="sky-run"] .gcard-body h3::before { content:"Going up ↑"; }
.ghub-all .gcard[data-slug="sky-run"]::before {
  content:'♟  ♞  ♜'; position:absolute; top:-4px; right:10px; z-index:0; pointer-events:none;
  font-size:0.78rem; letter-spacing:5px; white-space:nowrap; color:rgba(160,210,255,0.20);
  animation:sky-fall 6s linear infinite; }
@keyframes sky-fall {
  0%{ transform:translateY(-12px); opacity:0; } 18%{ opacity:1; } 100%{ transform:translateY(74px); opacity:0; } }
.ghub-all .gcard[data-slug="sky-run"] .gcard-icon { animation:sky-bob 2.4s ease-in-out infinite; }
@keyframes sky-bob { 0%,100%{ transform:translateY(2px); } 50%{ transform:translateY(-3px); } }
.ghub-all .gcard[data-slug="sky-run"]:hover .gcard-icon { animation-duration:0.9s; }

/* ── 4 · SAND MINE DEPTHS — RETHEMED 2026-07-25 (Nate: give it a different box theme): a
   seam of ORE cutting through the rock, a glint traveling down it, and the pick digging. ── */
.ghub-all .gcard[data-slug="sand-mine-depths"] {
  background:linear-gradient(180deg,#43331a 0%,#281c0d 50%,#100b06 100%);
  border-color:#fcbc3c; }
.ghub-all .gcard[data-slug="sand-mine-depths"] .gcard-body h3::before { content:"Going down ↓"; }
/* the ore seam, struck diagonally across the rock */
.ghub-all .gcard[data-slug="sand-mine-depths"]::before {
  content:''; position:absolute; inset:0; z-index:0; pointer-events:none;
  background:linear-gradient(62deg, transparent 44%, rgba(252,188,60,0.15) 47%, rgba(255,238,196,0.42) 50%,
    rgba(252,188,60,0.15) 53%, transparent 56%); }
/* a glint that travels along the seam — dimmed 25% on 2026-07-27 (Nate: "the sand mine
   depths box looks great, but dim 25% the gold bar that slides from left-to-right") */
.ghub-all .gcard[data-slug="sand-mine-depths"]::after {
  content:''; position:absolute; top:-25%; bottom:-25%; left:0; width:26%; z-index:0; pointer-events:none;
  background:linear-gradient(62deg, transparent 45%, rgba(255,255,255,0.315) 50%, transparent 55%);
  animation:sm-glint 3.6s ease-in-out infinite; }
@keyframes sm-glint { 0%{ transform:translateX(-70%); opacity:0; } 35%,65%{ opacity:1; } 100%{ transform:translateX(370%); opacity:0; } }
.ghub-all .gcard[data-slug="sand-mine-depths"] .gcard-icon {
  transform-origin:60% 32%; animation:sm-dig 1.5s ease-in-out infinite; }
@keyframes sm-dig { 0%,100%{ transform:translateY(-2px) rotate(-11deg); } 55%{ transform:translateY(2px) rotate(6deg); } }

/* ── 5 · SIEGE ON CHESS CITY — RETHEMED 2026-07-25 (Nate: a different box theme): battle
   SMOKE drifting over the walls, an ember rising off the siege, the keep bracing. ── */
.ghub-all .gcard[data-slug="tower-defense"] {
  background:linear-gradient(180deg,#3a1b2e,#211440);
  border-color:#ff77a8; }
.ghub-all .gcard[data-slug="tower-defense"] .gcard-body h3::before { content:"Hold the line"; }
/* two soft banks of smoke drifting back and forth over the ramparts */
.ghub-all .gcard[data-slug="tower-defense"]::before {
  content:''; position:absolute; inset:0; z-index:0; pointer-events:none;
  background:
    radial-gradient(62% 54% at 22% 84%, rgba(255,150,120,0.22), transparent 72%),
    radial-gradient(54% 48% at 80% 92%, rgba(200,120,255,0.18), transparent 72%);
  animation:td-smoke 6s ease-in-out infinite alternate; }
@keyframes td-smoke { 0%{ transform:translateX(-6%); } 100%{ transform:translateX(6%); } }
/* an ember spark rising from the fighting */
.ghub-all .gcard[data-slug="tower-defense"]::after {
  content:''; position:absolute; left:15%; bottom:9px; width:6px; height:6px; border-radius:50%; z-index:0; pointer-events:none;
  background:radial-gradient(circle, #ffe0a8, #ff7b3a 70%, transparent);
  animation:td-ember 2.8s ease-in-out infinite; }
@keyframes td-ember { 0%{ transform:translateY(0) scale(1); opacity:0; } 18%{ opacity:1; } 100%{ transform:translateY(-46px) scale(0.5); opacity:0; } }
.ghub-all .gcard[data-slug="tower-defense"] .gcard-icon { animation:td-brace 2.4s ease-in-out infinite; }
@keyframes td-brace { 0%,100%{ transform:translateX(0); } 25%{ transform:translateX(-1.5px); } 75%{ transform:translateX(1.5px); } }
.ghub-all .gcard[data-slug="tower-defense"]:hover .gcard-icon { animation-duration:0.5s; }

@media (prefers-reduced-motion: reduce){
  .ghub-all .gcard[data-slug] .gcard-icon,
  .ghub-all .gcard[data-slug]::before,
  .ghub-all .gcard[data-slug]::after,
  .ghub-all .gcard[data-slug] .gcard-tag::after { animation:none !important; }
}
</style>

<!-- ===== THE HALLS — Gauntlet Legends portal screen (pick a hall; no games here) ===== -->
<div class="ghub">

  <!-- ── THE FEATURED ROW (2026-07-18 Nate: "move the leaderboard and the altar around,
       and the park table") — the four featured entrances stand in ONE balanced, evenly
       spaced centered row now, not a lopsided top-left cluster:
       🏆 Leaderboards · the Gauntlet · Park Tables · the Gambit altar. ── -->
  <div class="ghub-doorway">
    {%- comment -%} 2026-07-25 (Nate): the Gauntlet door anchors the LEFT (over the Pirc box),
         the trophy anchors the RIGHT (over Clearance) — the row spreads them apart now instead
         of clustering them center. PLATE PARITY kept: no plate, no "Begin the climb" caption. {%- endcomment -%}
    <a class="gdoor" id="gauntlet-door" href="{{ '/games/the-gauntlet/' | relative_url }}"
       aria-label="The Gauntlet — real chess vs a ladder of ten P&JCC rivals">
      <span class="gdoor-arch" aria-hidden="true">
        <i class="gdoor-door"><b class="gdoor-glyph" id="gdoor-glyph">♟</b><u class="gdoor-knob"></u></i>
        <i class="gdoor-seam"></i>
      </span>
      <span class="gdoor-pips" id="gdoor-pips" aria-hidden="true"></span>
      <span class="gdoor-whisper" id="gdoor-whisper" aria-hidden="true"></span>
    </a>
    <a class="ghub-trophy" href="{{ '/leaderboards/' | relative_url }}" aria-label="Leaderboards" title="Leaderboards">🏆</a>

    {%- comment -%} THE PARK TABLES entrance was removed from the games hall 2026-07-22
         (Nate: "Get rid of the Park table link"). Park Tables is the "Play Now" link in the
         site drawer now, so the games hall no longer duplicates it. The .ptdoor CSS above is
         left in place (harmless, unused) in case the entrance is ever restored. {%- endcomment -%}

    {%- comment -%} THE GAMBIT ALTAR moved OUT of this featured row 2026-07-24 (Nate: "move the
         altar into the bottom right corner next to Blindfold Puzzles — don't give it a box, just
         put it down there"). It's appended as the last item of the games grid below by the small
         script at the foot of this file. The featured row is Leaderboards + the Gauntlet now. {%- endcomment -%}

  </div>

  <div class="ghub-head">
    {%- comment -%} "Choose Your Hall" removed 2026-07-16 (Nate). The eyebrow is the
         page's h1 now so the hall keeps a real heading. {%- endcomment -%}
    <h1 class="ghub-eyebrow" data-hb>◆ The P&JCC Arcade</h1>
    {%- comment -%} "· works offline" added 2026-08-12 (Nate: "say 'works offline' in the games
         hall, per your advice"). The front door has carried this fact since 2026-08-04 and the
         ticker says it about the arcade specifically, but the HALL — the page a visitor is
         actually standing on when they pick a game — never did.

         ⚠ IT IS A STRONGER CLAIM HERE THAN ON THE FRONT DOOR, and it is verified, not assumed:
         sw.js does not merely cache a game on first visit, it WARMS the whole game roster in the
         background after activation (see the list under PRECACHE). So the games work with the
         Wi-Fi off even if you never opened them. Said once, plainly, in the sub — not repeated
         on every card, which is how five true "BUILDING" labels once turned this hall into a
         construction site. {%- endcomment -%}
    <p class="ghub-sub" data-hb>Claim a codename · climb the global boards · works offline</p>
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
  <div class="ghub-reset-row" data-hb>
    <button class="ghub-reset" id="ghub-reset" type="button">↺ Reset Local Game Progress</button>
  </div>
</div>

<script src="{{ '/assets/js/pjcc-games-data.js' | relative_url }}"></script>
<!-- the combined grid: pjcc-hall.js reads data-hall="all" and lists every playable game
     (in-dev tagged, vault locked, terminated dropped) — replaces the old category portals. -->
<script src="{{ '/assets/js/pjcc-hall.js' | relative_url }}"></script>
<!-- THE GAMBIT ALTAR in the grid (2026-07-24) — append it as the LAST grid item, so it always
     lands in the cell after the final game (bottom-right). No .gcard = no box; no title. pjcc-hall
     renders the grid TWICE (initial, then again once the profile bests load), so an observer
     re-places the altar whenever the grid's children are rebuilt. -->
<script>
(function () {
  var grid = document.querySelector('#games-hall .cat-games');
  if (!grid) return;
  var HTML = '<a class="gmdoor gmdoor--grid" href="{{ '/the-gambit/' | relative_url }}"' +
    ' aria-label="The Gambit — wager what you’ve earned; the board sometimes gives back more. Never real money.">' +
    '<span class="gm-scene" aria-hidden="true"><i class="gm-glow"></i><b class="gm-coin">♟</b><i class="gm-altar"></i></span></a>';
  function place() { if (!grid.querySelector('.gmdoor--grid')) grid.insertAdjacentHTML('beforeend', HTML); }
  place();
  new MutationObserver(place).observe(grid, { childList: true });
})();
</script>
{%- comment -%} THE DOOR's resume state — the same climb the game reads.
     ⚑ MOVED OUT 2026-08-19 to /assets/js/pjcc-gauntlet-door.js, together with the copy of
     the ladder names / accents / glyphs that used to live here and a second copy of the
     same three arrays on the front door. One file paints every gauntlet door on the site
     now, the way one partial has styled every one of them since 2026-07-27.
     [[gauntlet-door-one-file]] {%- endcomment -%}
<script src="{{ '/assets/js/pjcc-gauntlet-door.js' | relative_url }}"></script>

<script>
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
    btn.textContent = '✓ Progress reset';
    btn.disabled = true;
    setTimeout(function () { location.reload(); }, 900);
  };
})();
</script>

<!-- Enter a hall → the screen blooms to that hall's color, like the splash quads. -->
<script src="{{ '/assets/js/pjcc-warp.js' | relative_url }}"></script>
