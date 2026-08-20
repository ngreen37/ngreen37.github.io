---
layout: page
title: Merch
permalink: /goods/
brand: mcpuppy
---

<div class="goods-head">
  <h1 class="goods-title">Merch</h1>
  <p class="goods-sub"><span class="goods-soon">Next up</span> — the designs come first.</p>
</div>

<!-- ── The Goal Card ────────────────────────────────────────── -->
<section class="goods-section">
  <div class="goods-cards" aria-hidden="true">
    <div class="goal-card gc-a">
      <span class="gc-corner">♛</span>
      <span class="gc-char">♛</span>
      <span class="gc-goal">your goal<br>goes here</span>
      <span class="gc-creed">follow the dog</span>
    </div>
    <div class="goal-card gc-b">
      <span class="gc-corner">🦊</span>
      <span class="gc-char">🦊</span>
      <span class="gc-goal">touch it.<br>re-anchor.</span>
      <span class="gc-creed">follow the dog</span>
    </div>
    <div class="goal-card gc-c">
      <span class="gc-corner">♚</span>
      <span class="gc-char">♚</span>
      <span class="gc-goal">5% strategy<br>95% mindset</span>
      <span class="gc-creed">follow the dog</span>
    </div>
  </div>
  <div class="goods-copy">
    <h2>The Goal Card</h2>
  </div>
</section>

<!-- ── The Stationery ───────────────────────────────────────── -->
<section class="goods-section goods-section--alt">
  <div class="goods-copy">
    <h2>The Stationery</h2>
  </div>
  <div class="goods-stationery" aria-hidden="true">
    <div class="stat-note">follow the dog<span class="stat-note-line"></span><span class="stat-note-line short"></span></div>
    <div class="stat-sheet">
      <span class="stat-creed">follow the dog</span>
      <span class="stat-line"></span><span class="stat-line"></span><span class="stat-line"></span>
      <span class="stat-line"></span><span class="stat-line short"></span>
      <span class="stat-piece">♟</span>
    </div>
  </div>
</section>

<div class="goods-cta">
  <a class="goods-btn" href="/mailing-list/">Tell me when it ships →</a>
</div>

<style>
.goods-head { text-align:center; max-width:720px; margin:0 auto 2rem; }
.goods-title { font-size:2.4rem; font-weight:900; color:#fff; margin:0.3rem 0 0.5rem; }
.goods-sub { color:#cdbcf2; font-size:1rem; line-height:1.6; }
.goods-soon { display:inline-block; font-weight:800; color:#1a0f3d; background:#F5C518; border-radius:999px; padding:1px 12px; letter-spacing:0.02em; }

/* ⚠⚠ `minmax(0, 1fr)`, NOT `1fr` — 2026-08-19, and this is the bug Nate reported as "it
   shouldn't slide left to right (the whole window)". A `1fr` track is `minmax(auto, 1fr)`,
   and that `auto` minimum is the item's MIN-CONTENT width. The card fan below is a nowrap
   flex row of three fixed-width cards, so its min-content is a flat 354px — the track
   opened to 354px inside a 292px card, the excess walked out through .page-card, .wrapper,
   body and html, none of which clip, and the WHOLE DOCUMENT gained a horizontal scroll.
   Measured on the live page: a 320px phone -> scrollWidth 451 (+131), 390 -> +61,
   430 -> +21, and clean from 451 up, which is why it only ever showed on a phone.
   ⭐ THE TWO HALVES OF THIS FIX WERE MUTATION-TESTED SEPARATELY, and the answer is not
   the tidy one: EITHER ALONE stops the document sliding. `minmax(0, …)` stops it by
   clamping the track to the card, which then squeezes the flex row down to its min-content
   — no slide, but the cards buckle and their text spills. The em scale below stops it by
   making the fan genuinely fit. So the scale is the FIX and this line is the GUARD: it is
   what makes a fixed-size child unable to widen the track ever again, including the next
   one somebody drops in here. Do not delete it because "the fan fits now".
   [[measure-the-real-page]] — revert each half and watch what actually happens. */
.goods-section { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:34px; align-items:center; margin:0 0 2.6rem; }
.goods-section--alt { grid-template-columns:minmax(0,1fr) minmax(0,1fr); }
@media (max-width:760px){ .goods-section, .goods-section--alt { grid-template-columns:minmax(0,1fr); gap:22px; } }

.goods-copy h2 { color:#fff; font-size:1.5rem; font-weight:800; margin:0; text-align:center; }

/* ---- Gold goal cards (fanned mockups) ----
   ⭐ THE FAN HAS ONE DIAL, AND IT IS `font-size` ON THE CONTAINER (2026-08-19). Every
   number below used to be px or rem, so the fan was a flat 170x248 card at every screen
   width and could not shrink for a phone. They are all `em` now, which makes the whole
   mockup — card, overlap, rotation offsets, glyph, creed rule — one shape driven by a
   single length. `html` is pinned to `font-size: 16px` in _pjcc-01-core.scss, so `1rem`
   here is exactly the old 16px and every em below reproduces its old pixel value.

   ⚠⚠ WHAT MUST FIT IS NOT THE CARD, IT IS THE FAN'S PAINTED SPAN, and that is far
   wider than its layout box. Three cards at W, overlapped by the -0.153em margins, lay
   out at 2.082W; the two OUTER negative margins then bleed another 0.306W past the flex
   container's own edges; and the ±12° rotation throws the outer cards a further 0.282W
   beyond that. Measured, not derived: at 170px cards the layout box is 354px and the
   PAINTED box is 450px. So the real constraint is 2.67W <= the card interior (the viewport
   minus 96px of .wrapper + .page-card padding), which only comes true on its own at about
   a 546px viewport. Below that the dial has to move, and until 2026-08-19 it could not.
   ⚠ `min(1rem, …)` rather than a breakpoint: at a breakpoint the fan jumps a size
   mid-scroll, and the last few pixels before each step are still the tightest fit on the
   page — which is exactly the state this bug lived in. The linear branch keeps ~20px of
   clearance at 320, 390 and 430 alike and hands back to 1rem at ~578px. */
.goods-cards { display:flex; justify-content:center; align-items:center; min-height:18.75em; perspective:1000px;
  font-size:min(1rem, calc(3.4vw - 3.6px)); }
.goal-card { position:relative; width:10.625em; height:15.5em; border-radius:var(--r-lg); margin:0 -1.625em;
  display:flex; flex-direction:column; align-items:center; justify-content:space-between; padding:1.125em 0.875em;
  background:linear-gradient(155deg, #fbe48a 0%, #e7b53a 38%, #b8860b 100%);
  border:2px solid #fff3c4; box-shadow:0 16px 40px rgba(0,0,0,0.5), inset 0 0 22px rgba(255,255,255,0.35);
  transition:transform 0.3s ease, box-shadow 0.3s ease; }
.goal-card::after { content:''; position:absolute; inset:0.375em; border:1px solid rgba(90,60,5,0.45); border-radius:0.6875em; pointer-events:none; }
.gc-a { transform:rotate(-12deg) translateY(0.625em); z-index:1; }
.gc-b { transform:rotate(0deg) scale(1.06); z-index:3; }
.gc-c { transform:rotate(12deg) translateY(0.625em); z-index:1; }
.goods-cards:hover .gc-a { transform:rotate(-18deg) translateY(0) translateX(-0.625em); }
.goods-cards:hover .gc-c { transform:rotate(18deg) translateY(0) translateX(0.625em); }
.gc-corner { position:absolute; top:0.5625em; left:0.75em; font-size:0.85em; color:rgba(80,52,4,0.7); }
.gc-char { font-size:2.6em; line-height:1; margin-top:0.875em; filter:drop-shadow(0 2px 3px rgba(120,80,5,0.4)); }
.gc-goal { font-family:'Poppins',sans-serif; font-weight:900; font-size:0.82em; letter-spacing:0.04em;
  text-transform:uppercase; text-align:center; color:#3a2604; line-height:1.35; }
.gc-creed { font-family:'Poppins',sans-serif; font-style:italic; font-weight:700; font-size:0.74em; color:#5a3c05;
  border-top:1px solid rgba(90,60,5,0.4); padding-top:0.5em; width:100%; text-align:center; }

/* ---- Stationery set (letterhead + sticky notecard) ---- */
/* ⚠ The letterhead is a fixed 230px and the phone card interior is 224px at a 320px
   viewport — 6px narrower — so it hung out of the card too, on the same page and for the
   same reason as the fan. `min()` is enough here: nothing about this mockup depends on the
   sheet being exactly 230, and it is not rotated far enough to bleed much past its box. */
.goods-stationery { position:relative; display:flex; justify-content:center; align-items:center; min-height:320px; max-width:100%; }
.stat-sheet { position:relative; width:min(230px, 100%); min-height:290px; background:#fdfbf4; border-radius:6px; padding:22px 22px 26px;
  box-shadow:0 16px 40px rgba(0,0,0,0.5); display:flex; flex-direction:column; gap:14px; overflow:hidden;
  transform:rotate(-2.5deg); transition:transform 0.3s ease; z-index:2; }
.stat-piece { position:absolute; right:-8px; bottom:-18px; font-size:6.2rem; line-height:1; color:rgba(40,30,80,0.06); z-index:0; }
.stat-note { position:absolute; right:64px; top:20px; width:120px; min-height:118px; background:#fff3b0; border-radius:4px;
  padding:12px 13px; box-shadow:0 12px 26px rgba(0,0,0,0.42); transform:rotate(7deg); transition:transform 0.3s ease; z-index:1;
  font-family:'Poppins',sans-serif; font-style:italic; font-weight:800; font-size:0.8rem; color:#5a3c05; }
.stat-note-line { display:block; height:6px; margin-top:9px; border-radius:2px; background:rgba(90,60,5,0.2); }
.stat-note-line.short { width:60%; }
.goods-stationery:hover .stat-sheet { transform:rotate(0deg) translateX(-10px); }
.goods-stationery:hover .stat-note { transform:rotate(12deg) translate(12px,-8px); }
.stat-creed { position:relative; z-index:1; font-family:'Poppins',sans-serif; font-style:italic; font-weight:800; font-size:1.05rem;
  color:#b8860b; text-align:center; letter-spacing:0.01em; border-bottom:2px solid #F5C518; padding-bottom:12px;
  text-shadow:0 1px 0 rgba(255,255,255,0.6); }
.stat-line { position:relative; z-index:1; height:9px; border-radius:3px; background:linear-gradient(90deg, rgba(40,30,80,0.14), rgba(40,30,80,0.05)); }
.stat-line.short { width:55%; }
@media (max-width:760px){ .stat-note { right:30px; } }

/* ---- CTA ---- */
.goods-cta { text-align:center; margin:0 0 1rem; }
.goods-btn { display:inline-block; text-decoration:none; font-weight:800; font-size:0.92rem; border-radius:999px;
  padding:11px 22px; background:#F5C518; color:#1a0f3d; border:2px solid #F5C518; transition:transform .12s, filter .12s; }
.goods-btn:hover { transform:translateY(-2px); filter:brightness(1.07); }
</style>
