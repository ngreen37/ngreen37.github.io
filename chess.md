---
layout: page
permalink: /chess/
title: McPuppy Chess
own_title: true
body_class: theme-chess
tab_title: McPuppy Chess — free chess for everyone
description: Free chess for everyone — play a real game, solve a puzzle, or learn from scratch. Set in the world of Princess and the Journey to Chess City, by McPuppy Studios.
---

{% comment %} ══════════════════════════════════════════════════════════════════════════
     THE NEW HOME (2026-07-28, Nate: "we're switching gears… rename the home page something
     more generic like McPuppy Chess, like chess.com or lichess.org… give me just a basic
     home page that encapsulates our modified direction… this is where you can help me add
     the CTA").

     WHAT CHANGED, AND WHY IT'S A DIFFERENT PAGE RATHER THAN AN EDIT:
     The old front door was a WORLD landing — title card, cast, locations, fan art, a news
     ticker, the full town sky. Worlds get *browsed*. A chess site gets *used*. Those want
     opposite pages, so the world moved to /pjcc/ (its own tab, below Academy) and this is
     the site's front door: one promise, one button, four doors, and the honest facts.

     THE CTA — the thing the old home never had (measured: 970 words, 31 links, four
     sections, ZERO primary buttons). There is exactly ONE gold button on this page and
     everything else is quieter than it. If a second thing ever competes with it, the page
     has regressed to the old problem.

     ⚡ IT IS ALSO THE PERFORMANCE FIX. Deliberately NO `body_class: full-sky` — the cloud
     banks, starfield, constellations and shooting stars stay on /pjcc/, where the hero is
     the point. Measured 2026-07-28 on the live PJCC home: 29 animating elements / 14
     distinct animations at idle, 5.4% of frames over 32ms at 6x throttle; ablating any ONE
     layer (rain included) recovered nothing outside the noise floor, but turning ALL of
     them off took stutter to 0.0% and the worst frame from 50ms to 17ms. It was never one
     villain — it was the pile. So this page keeps the pile off.

     THE NAME is one Liquid variable, right below. Twenty candidates are in FUTURE-IDEAS;
     swapping to any of them is this line, the h1's alt text, and nothing else.
     ══════════════════════════════════════════════════════════════════════════ {% endcomment %}

{%- assign site_name = "McPuppy Chess" -%}

{%- comment -%} ══ THE TABLETOP (2026-07-28) ═══════════════════════════════════════════
     Nate: "give the new home page a clean color scheme — its own fresh layout."

     The hero now sits on a surface instead of floating in the page. It's a full-bleed
     band at the top of the card with warm light pooling under the board — so the page
     opens on something that reads as a TABLE, which is the one image this whole site is
     built around. The band and its palette live in _sass/_pjcc-25-front-door.scss
     (`body.theme-chess`), because a theme belongs beside the other themes; the furniture
     inside it stays page-local, in this page's own stylesheet block further down.

     ⚠ That sentence deliberately does NOT spell the tag name. Liquid strips these comments
     at build time so the site is fine either way — but every tool that reads the RAW file
     (the test harness, a scraper, an editor's folding) sees a style block OPENING here and
     swallows everything down to the real closing tag. It cost a confusing render on
     projects.md once, where the same warning is written, and it cost one here too: the
     whole board and all four doors silently vanished from a repro. ═══════ {%- endcomment -%}
<section class="mc-table">
<section class="mc-hero">
  <div class="mc-hero-copy">
    <p class="mc-eyebrow">From McPuppy Studios</p>
    <h1 class="mc-title">{{ site_name }}</h1>
    <p class="mc-lede">Free chess for everyone — play a real game, solve one honest puzzle,
      or start at how the pieces move.</p>

    {%- comment -%} THE ONE BUTTON. Park Tables because it's the only door where a stranger is
         *playing* in two taps — a park regular seats you instantly, no account, real rules,
         a real clock. {%- endcomment -%}
    <a class="mc-cta" href="{{ '/games/park-tables/' | relative_url }}">
      <span class="mc-cta-ico" aria-hidden="true">&#9822;</span>
      <span class="mc-cta-txt">Play Chess</span>
      <span class="mc-cta-arw" aria-hidden="true">&rarr;</span>
    </a>
    <a class="mc-cta2" href="{{ '/academy/' | relative_url }}">New to chess? Start at lesson one</a>

    <p class="mc-facts">Free &middot; no account needed &middot; keeps playing with the wi-fi off</p>
  </div>

  {%- comment -%} ══ THE BOARD IS THE BUTTON (2026-07-28) ══════════════════════════════════
       Nate: "I love the Board is the Button idea — let's do it, with the risk in mind."

       A stranger does not have to be convinced to touch a chess piece. So the front door
       does not ask them to believe a claim and then click — it puts a real position in
       front of them and waits. One move wins. Play it and the site hands you into the
       puzzle room mid-game; play something else and the refutation tells you the truth.

       THE POSITION: 6k1/5ppp/8/8/8/8/5PPP/R5K1 w — a back-rank mate. **Ra8# is the UNIQUE
       mate in one**, proved against the site's own perft-verified referee (20 legal moves,
       exactly one mate) before this shipped. If you ever change a piece here, re-run that
       proof — a front door that lies about chess is worse than no front door.

       THE RISK, HANDLED: the 64 cells and the 8 pieces are STATIC MARKUP. There is no
       blank box and no layout shift — the board is fully painted before a line of script
       runs, and the only thing the script adds is the ability to touch it. Add ?ready=1 to
       the URL and the page will tell you exactly how many milliseconds that gap was.
       ═══════════════════════════════════════════════════════════════════ {%- endcomment -%}
  <div class="mc-board" id="mc-board">
    <div class="mcb" id="mcb" role="group" aria-label="White to play and mate in one">
      {%- for i in (0..63) -%}
        {%- assign r = i | divided_by: 8 -%}{%- assign c = i | modulo: 8 -%}
        {%- assign par = r | plus: c | modulo: 2 -%}
        <i class="mcb-sq{% if par == 1 %} d{% endif %}" data-sq="{{ i }}"></i>
      {%- endfor -%}
      <b class="mcb-p w" data-sq="56" data-pc="R" style="grid-area:8/1">&#9820;</b>
      <b class="mcb-p w" data-sq="62"                style="grid-area:8/7">&#9818;</b>
      <b class="mcb-p w" data-sq="53"                style="grid-area:7/6">&#9823;</b>
      <b class="mcb-p w" data-sq="54"                style="grid-area:7/7">&#9823;</b>
      <b class="mcb-p w" data-sq="55"                style="grid-area:7/8">&#9823;</b>
      <b class="mcb-p b" data-sq="6"  data-pc="k"    style="grid-area:1/7">&#9818;</b>
      <b class="mcb-p b" data-sq="13"                style="grid-area:2/6">&#9823;</b>
      <b class="mcb-p b" data-sq="14"                style="grid-area:2/7">&#9823;</b>
      <b class="mcb-p b" data-sq="15"                style="grid-area:2/8">&#9823;</b>
    </div>
    <p class="mcb-say" id="mcb-say">White to play. <b>Mate in one.</b></p>
  </div>
</section>
</section>

<h2 class="mc-h2">Four ways in</h2>
<div class="mc-doors">
  <a class="mc-door" href="{{ '/games/park-tables/' | relative_url }}">
    <span class="mc-door-ico" aria-hidden="true">&#9654;</span>
    <b>Play Now</b>
    <small>Sit at a park table. Another player, a park regular, or McPuppy himself.</small>
  </a>
  <a class="mc-door" href="{{ '/games/the-gauntlet/' | relative_url }}">
    <span class="mc-door-ico" aria-hidden="true">&#9819;</span>
    <b>The Gauntlet</b>
    <small>Ten floors, ten rivals, one real engine. The board grows grander the higher you climb.</small>
  </a>
  <a class="mc-door" href="{{ '/games/fork-in-the-road/' | relative_url }}">
    <span class="mc-door-ico" aria-hidden="true">&#9822;</span>
    <b>Puzzles</b>
    <small>One move wins. Play the wrong one and it shows you exactly why it loses.</small>
  </a>
  <a class="mc-door" href="{{ '/academy/' | relative_url }}">
    <span class="mc-door-ico" aria-hidden="true">&#128214;</span>
    <b>Academy</b>
    <small>Nobody is born knowing this game. Start at the pieces, on a board you can touch.</small>
  </a>
</div>

{%- comment -%} THE HONEST STRIP — three things that are TRUE and that no other free chess site
     says out loud. Not features; proofs. (FUTURE-IDEAS #9 asked for the offline line for
     months — this is it.) Anything added here has to survive `npm test`. {%- endcomment -%}
<ul class="mc-true">
  <li><b>The chess is real.</b> A perft-verified referee runs every board, with Stockfish as
    a second opinion — and it's re-proved in CI before anything ships.</li>
  <li><b>Every finished game gets a review.</b> Accuracy, the move it turned on, and the one
    you missed. Free, for everyone, forever — it runs in your browser.</li>
  <li><b>It works on a plane.</b> The whole arcade and the engine cache on first visit, so
    the games keep working with the wi-fi off.</li>
</ul>

{%- comment -%} ONE door to the world — the show is the point of all of this, but it is not
     what a stranger came here to DO. One card, warm, at the foot. {%- endcomment -%}
<a class="mc-world" href="{{ '/pjcc/' | relative_url }}">
  <span class="mc-world-glyph" aria-hidden="true">&#9819;</span>
  <span class="mc-world-txt">
    <b>There is a whole world behind this board</b>
    <small><i>Princess and the Journey to Chess City</i> — an animated series in the making.
      Meet the cast, wander the town, see the fan wall.</small>
  </span>
  <span class="mc-world-arw" aria-hidden="true">&rarr;</span>
</a>

<section class="mc-studio">
  <span class="mc-lamp">{% include desk-lamp.html id="mc-lamp" %}</span>
  <div class="mc-studio-copy">
    <span class="mc-studio-label">Building in the open</span>
    {% if site.posts.first %}
    <a class="mc-studio-post" href="{{ site.posts.first.url | relative_url }}">{{ site.posts.first.title }}</a>
    <span class="mc-studio-date">{{ site.posts.first.date | date: "%-d %B %Y" }}</span>
    {% endif %}
    <a class="mc-studio-more" href="{{ '/blog/' | relative_url }}">Read the blog &rarr;</a>
  </div>
</section>

<style>
/* ── McPuppy Chess — the front door ───────────────────────────────────────────────
   Built on the shared tokens (--step-*, --space-*, --r-*) so it inherits the site's
   type scale and radii. Page-local because it is one page's furniture; if a second
   page ever needs a piece of it, that piece graduates to _sass/. */

/* HERO — copy left, board right; one column under 760px with the board FIRST, so a
   phone still opens on something that looks like chess rather than on a paragraph. */
/* inside .mc-table now, which owns the outer spacing (_pjcc-25-front-door.scss) */
.mc-hero { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: var(--space-6, 32px);
  align-items: center; margin: 0; }
.mc-eyebrow { font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 2.4px;
  text-transform: uppercase; color: var(--fd-wood); margin: 0 0 6px; opacity: 0.85; }
.mc-title { font-size: clamp(38px, 6.4vw, 64px); line-height: 1.02; font-weight: 900;
  color: var(--fd-ink); margin: 0 0 12px; letter-spacing: -0.02em; text-wrap: balance; }
.mc-lede { color: var(--fd-ink-2); font-size: clamp(15px, 1.9vw, 18px); line-height: 1.6;
  max-width: 42ch; margin: 0 0 var(--space-5, 24px); }

/* THE ONE BUTTON. Nothing else on the page is gold, filled, or this size — that is the
   whole design, and it is the thing the old home page did not have. */
.mc-cta { display: inline-flex; align-items: center; gap: 12px; text-decoration: none;
  background: linear-gradient(180deg, #ffd54a, #F5C518); color: #1a0f3d;
  font-weight: 900; font-size: clamp(17px, 2.1vw, 20px); letter-spacing: 0.01em;
  padding: 15px 28px; border-radius: 999px; border: 2px solid #ffe27a;
  box-shadow: 0 10px 30px rgba(245,197,24,0.28);
  transition: transform .14s ease, box-shadow .14s ease, filter .14s ease; }
.mc-cta:hover { transform: translateY(-2px); filter: brightness(1.04);
  box-shadow: 0 14px 38px rgba(245,197,24,0.4); text-decoration: none; }
.mc-cta:active { transform: translateY(0); }
.mc-cta-ico { font-size: 1.15em; line-height: 1; }
.mc-cta-arw { font-size: 1.05em; transition: transform .14s ease; }
.mc-cta:hover .mc-cta-arw { transform: translateX(3px); }

.mc-cta2 { display: inline-block; margin-left: 18px; color: var(--fd-ink-2); font-size: 0.95rem;
  text-decoration: none; border-bottom: 1px solid rgba(195,200,209,0.32); padding-bottom: 1px; }
.mc-cta2:hover { color: var(--fd-ink); border-bottom-color: var(--fd-ink); text-decoration: none; }

.mc-facts { margin: var(--space-4, 16px) 0 0; color: var(--fd-ink-3); font-size: 0.86rem;
  letter-spacing: 0.01em; }

/* ── THE LIVE BOARD — PARK-TABLE-STANDARD ──────────────────────────────────────────
   ⚠ FIXED 2026-07-28. This board shipped with its OWN woods hard-coded — `#efe3c8`
   light, `#8a6a44` dark, `#fffaf0` / `#3b2a63` pieces, a `#2a1a55` purple frame — none
   of which are the canon's. It was a fifth board look on a site whose whole rule is that
   there is exactly ONE (Nate, 2026-07-16: "they should always be uniform — we'll just
   call it the chessboards, the pieces"). The comment above it even claimed it came
   "straight off the tokens", which made it worse: a fork that says it isn't one.

   It reads from _pjcc-22-chess-canon.scss now, like Park Tables, the Academy drill board
   and the game-review board do — including the GRAIN, which is what stops the squares
   reading as flat UI colour and starts them reading as wood, and the timber frame that
   every other board on the site wears. Restyling all five is one token edit again.

   Orientation is standard and was already right: a8 (top-left) light, h1 (bottom-right)
   light, so a1 is dark. The park table DRAWING's quarter-turn ("white on the right") is a
   different thing on purpose — its players sit east and west. This one you play from
   White's side, so it faces the way a board faces.

   Both sides use FILLED glyphs (♚♛♜♟) and take their colour from the tokens — the outline
   glyphs (♔♕♖♙) will not fill, which is the same trap Park Tables hit. */
.mcb { display: grid; grid-template-columns: repeat(8, 1fr); grid-template-rows: repeat(8, 1fr);
  /* 100%, NOT a vw unit. `80vw` measures the WHOLE VIEWPORT, which knows nothing about
     the wrapper's 26px and the card's 20px of padding — at 390px that asked for a 312px
     board inside a 298px column, and .mc-table's overflow:hidden quietly SLICED THE
     H-FILE OFF. It reported no page overflow precisely because it was being clipped. */
  width: min(348px, 100%); aspect-ratio: 1; margin: 0 auto; border-radius: var(--r-sm, 6px);
  overflow: hidden;
  box-shadow: 0 18px 44px rgba(0,0,0,0.5), 0 0 0 4px var(--chess-frame); }
.mcb-sq { background-color: var(--chess-lt); background-image: var(--chess-grain); }
.mcb-sq.d { background-color: var(--chess-dk); }
.mcb-p { grid-area: 1/1; display: flex; align-items: center; justify-content: center;
  font-size: clamp(24px, 5.8vw, 33px); line-height: 1; z-index: 2; cursor: default;
  transition: transform .28s cubic-bezier(.2,.8,.3,1), filter .15s ease; }
.mcb-p.w { color: var(--piece-w-fill); filter: drop-shadow(0 1px 1px rgba(0,0,0,0.55)); }
.mcb-p.b { color: var(--piece-b-fill); filter: drop-shadow(0 1px 0 rgba(255,255,255,0.22)); }
/* only the rook is ever touchable — the whole puzzle is one move */
.mcb.live .mcb-p[data-pc="R"] { cursor: pointer; }
.mcb.live .mcb-p[data-pc="R"]:hover { filter: drop-shadow(0 0 8px #F5C518); }
.mcb-p.lift { transform: translateY(-5px) scale(1.08); filter: drop-shadow(0 0 10px #F5C518); }
/* the one legal target, shown only after the rook is picked up */
.mcb-sq.hint::after { content: ''; display: block; width: 30%; aspect-ratio: 1; margin: 35% auto;
  border-radius: 50%; background: rgba(245,197,24,0.55); }
.mcb-sq.bad  { box-shadow: inset 0 0 0 3px rgba(255,110,110,0.8); }
.mcb-p.mated { color: #ff6e6e; }
.mcb-say { margin: 14px 0 0; text-align: center; color: var(--fd-ink-2); font-size: 0.9rem;
  min-height: 2.6em; }
/* the prompt's emphasis is MAPLE, not gold - gold on this page means "the button", and a
   bolded phrase in the same colour as the CTA quietly competes with it. */
.mcb-say b { color: var(--fd-wood); }
.mcb-say.good b, .mcb-say.good { color: #6bffb8; }
.mcb-ready { display: block; margin-top: 4px; color: var(--fd-ink-3); font-size: 0.72rem;
  font-family: 'Share Tech Mono', monospace; }
@media (prefers-reduced-motion: reduce) { .mcb-p { transition: none; } }

/* The board block — sized to sit beside the copy without stealing from it.
   ⚠ .pkt-scene is a FIXED 190x99 unit and `transform: scale()` doesn't change layout size,
   so the box has to be declared at the scaled size or the drawing spills out of it (the
   same trap the ✦ star hit on the old front door). 190x1.45 = 276, 99x1.45 = 144. */
.mc-board { display: flex; flex-direction: column; align-items: center; justify-content: center;
  text-decoration: none;
  min-height: 190px; padding: var(--space-4, 16px); border-radius: var(--r-lg, 16px);
  overflow: hidden; transition: transform .18s ease; }
.mc-board:hover { transform: translateY(-3px); text-decoration: none; }
.mc-board .pkt-scene { transform: scale(1.45); transform-origin: center; }

@media (max-width: 760px) {
  .mc-hero { grid-template-columns: 1fr; gap: var(--space-4, 16px); }
  .mc-board { order: -1; min-height: 150px; padding: 0 0 var(--space-2, 8px); }
  .mc-board .pkt-scene { transform: scale(1.15); }
  .mc-cta { width: 100%; justify-content: center; }
    /* no underline down here: at full width it stops reading as a link and starts
     reading as a horizontal rule under the button. */
  .mc-cta2 { display: block; margin: 14px 0 0; text-align: center; border-bottom: none; }
}

/* SECTION HEADS — quiet; the button is the loud thing */
/* Section heads are MAPLE and quiet. They used to be gold - which meant the page had a
   gold heading, a gold button, gold door icons and a gold arrow, and "the one gold thing"
   was a rule the page broke four times over. The rule under it is the theme's hairline,
   not the site's purple h2 border (switched off in _pjcc-25-front-door.scss). */
.mc-h2 { color: var(--fd-wood); font-size: 0.92rem; letter-spacing: 0.16em; text-transform: uppercase;
  font-family: 'Share Tech Mono', monospace; font-weight: 400;
  margin: 0 0 var(--space-4, 16px); padding-bottom: 10px;
  border-bottom: 1px solid var(--fd-rule); }

/* FOUR DOORS — explicit 4 / 2x2 / 1, never auto-fit. auto-fit put THREE across at the
   real content width and orphaned Academy on a row of its own; four doors want to read as
   a set, and 2x2 is the honest fallback. (Content width varies with the docked rail, so
   "it fits at 1280" is not something to design around.) */
.mc-doors { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-3, 12px); margin: 0 0 var(--space-7, 44px); }
@media (max-width: 1080px) { .mc-doors { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 520px)  { .mc-doors { grid-template-columns: 1fr; } }
/* Flat panels with a wood hairline along the top, not bordered boxes. Four bordered
   cards in a row read as "card soup"; the hairline gives them a shelf to sit on and lets
   the hover do the work. Icons are maple - see the note on .mc-h2 about gold. */
.mc-door { position: relative; display: block; text-decoration: none; padding: 20px 18px 22px;
  background: var(--fd-panel); border: 1px solid var(--fd-rule); border-radius: var(--r-md, 12px);
  transition: transform .14s ease, border-color .14s ease, background .14s ease; }
.mc-door::before { content: ''; position: absolute; top: -1px; left: 14px; right: 14px; height: 2px;
  border-radius: 2px; background: var(--fd-wood); opacity: 0.5; transition: opacity .14s ease; }
.mc-door:hover { transform: translateY(-3px); border-color: var(--fd-grain);
  background: var(--fd-panel-hi); text-decoration: none; }
.mc-door:hover::before { opacity: 1; }
.mc-door-ico { display: block; font-size: 26px; line-height: 1; color: var(--fd-wood);
  margin-bottom: 10px; }
.mc-door b { display: block; color: var(--fd-ink); font-size: 1.05rem; margin-bottom: 5px; }
.mc-door small { display: block; color: var(--fd-ink-3); font-size: 0.84rem; line-height: 1.55; }

/* THE TRUE THINGS — a list, not cards; facts don't need boxes */
.mc-true { list-style: none; padding: 0; margin: 0 0 var(--space-7, 44px);
  display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--space-4, 16px); }
.mc-true li { color: var(--fd-ink-3); font-size: 0.88rem; line-height: 1.6;
  border-left: 2px solid var(--fd-rule); padding-left: 14px; }
.mc-true b { display: block; color: var(--fd-ink-2); font-size: 0.95rem; margin-bottom: 3px; }

/* THE WORLD DOOR */
/* -- THE ONE PURPLE THING ---------------------------------------------------------
   This is the whole colour idea of the page in one element. PJCC purple is the WORLD's
   livery, so on the front door it appears exactly where it means something: the board's
   "black" side (canon), and this - the single door that opens the world. Everything
   between them is wood and ink. Purple stops being wallpaper and becomes a signpost. */
.mc-world { display: flex; align-items: center; gap: 16px; text-decoration: none;
  padding: 18px 20px; border-radius: var(--r-lg, 16px); margin: 0 0 var(--space-6, 32px);
  background: linear-gradient(100deg, rgba(74,53,133,0.34), rgba(28,32,41,0.5));
  border: 1px solid rgba(111,87,196,0.5);
  transition: border-color .14s ease, transform .14s ease, background .14s ease; }
.mc-world:hover { border-color: var(--fd-world); transform: translateY(-2px);
  background: linear-gradient(100deg, rgba(74,53,133,0.5), rgba(28,32,41,0.5)); text-decoration: none; }
.mc-world-glyph { font-size: 34px; line-height: 1; color: #b9a3e8; flex: 0 0 auto; }
.mc-world-txt { flex: 1; min-width: 0; }
.mc-world-txt b { display: block; color: var(--fd-ink); font-size: 1rem; margin-bottom: 3px; }
.mc-world-txt small { display: block; color: var(--fd-ink-3); font-size: 0.84rem; line-height: 1.55; }
.mc-world-arw { color: #b9a3e8; font-size: 1.2rem; flex: 0 0 auto; }
@media (max-width: 560px) { .mc-world-glyph { font-size: 26px; } }

/* THE STUDIO BAND — the same lamp + newest post the old home carried; it is the proof
   that someone is still building this, and it costs one include. */
.mc-studio { display: flex; align-items: center; gap: 18px; padding: 16px 4px 0;
  border-top: 1px solid var(--fd-rule); }
/* ⚠ desk-lamp.html sizes the lamp but deliberately NEVER PLACES it — "wrap this include in
   something positioned" (the include says so). Without these five lines the lamp's absolutely
   positioned parts escape to the page and scatter (a blob in one corner, the desk slab drawn
   across the width, and 8px of horizontal overflow). Same placement block as `.awake-lamp`
   in _layouts/home.html; if a third page ever needs it, graduate it to _sass/ instead of
   copying it a third time. */
.mc-lamp { position: relative; display: block; width: 82px; height: 92px; flex: 0 0 auto; }
.mc-lamp .studio-light { position: absolute; inset: 0; }
.mc-lamp .sl-desk { left: -18px; right: -18px; border-radius: 3px; }
.mc-lamp .sl-desk::after { border-radius: 0 0 3px 3px; }
.mc-lamp .sl-tip { right: auto; left: -52px; }
.mc-studio-copy { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.mc-studio-label { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 2px;
  text-transform: uppercase; color: var(--fd-wood); opacity: 0.85; }
.mc-studio-post { color: var(--fd-ink); font-weight: 700; text-decoration: none; font-size: 0.98rem; }
.mc-studio-post:hover { color: var(--fd-wood); }
.mc-studio-date { color: var(--fd-ink-3); font-size: 0.78rem; }
.mc-studio-more { color: var(--fd-ink-2); font-size: 0.84rem; text-decoration: none; margin-top: 4px; }
.mc-studio-more:hover { color: var(--fd-wood); }

/* phones: every door and link clears the 40px tap floor (the compass-check baseline) */
@media (pointer: coarse) {
  .mc-cta2, .mc-studio-more { min-height: 40px; display: flex; align-items: center; }
  .mc-cta2 { justify-content: center; }
}
@media (prefers-reduced-motion: reduce) {
  .mc-cta, .mc-door, .mc-world, .mc-board { transition: none; }
}
</style>

<script>
/* ══ THE BOARD IS THE BUTTON — the interaction ═══════════════════════════════════════
   Everything above is already painted. This only adds the ability to TOUCH it, and it
   measures how long that took, because Nate asked to feel the gap in human terms:
   open /chess/?ready=1 and the board tells you the number under it.

   The rules are hard-coded on purpose. This is ONE position with ONE answer (Ra8#,
   proved unique against assets/js/pjcc-chess.js before shipping), so loading a 40KB
   referee onto the front door to re-derive a fact we already proved would be the exact
   trade this page exists to refuse. The puzzle room does it properly, with the engine —
   and this hands you there. */
(function () {
  var t0 = (window.performance && performance.now) ? performance.now() : 0;
  var board = document.getElementById('mcb'), say = document.getElementById('mcb-say');
  if (!board || !say) return;

  var ROOK = board.querySelector('.mcb-p[data-pc="R"]');
  var KING = board.querySelector('.mcb-p[data-pc="k"]');
  var A8   = board.querySelector('.mcb-sq[data-sq="0"]');   // top-left = a8
  var armed = false, done = false;

  function tell(html, good) { say.innerHTML = html; say.classList.toggle('good', !!good); }
  function disarm() {
    armed = false; ROOK.classList.remove('lift'); A8.classList.remove('hint');
  }

  ROOK.addEventListener('click', function (e) {
    e.stopPropagation();
    if (done) return;
    if (armed) { disarm(); tell('White to play. <b>Mate in one.</b>'); return; }
    armed = true;
    ROOK.classList.add('lift'); A8.classList.add('hint');
    tell('The rook is up. <b>Where does it go?</b>');
  });

  board.addEventListener('click', function (e) {
    if (done) return;
    var sq = e.target.closest ? e.target.closest('.mcb-sq') : null;
    if (!sq || !armed) return;
    var id = +sq.getAttribute('data-sq');

    if (id === 0) {
      /* ── Ra8#. Slide the rook up the a-file, ring the king, and hand them over. ── */
      done = true; disarm();
      ROOK.style.gridArea = '1/1';
      KING.classList.add('mated');
      tell('<b>Ra8#</b> \u2014 that\u2019s mate. The back rank was the whole board.<br>' +
           '<span style="opacity:.75">Taking you to the puzzle room\u2026</span>', true);
      setTimeout(function () {
        location.href = {{ '/games/fork-in-the-road/' | relative_url | jsonify }};
      }, 1250);
      return;
    }
    /* ── anything else: tell them the truth, then let them try again ── */
    sq.classList.add('bad');
    setTimeout(function () { sq.classList.remove('bad'); }, 520);
    tell('Not there \u2014 the king just steps away. <b>The mate is on the back rank</b>, ' +
         'where his own pawns have him boxed in.');
  });

  /* Nothing above this line was needed to SEE the board — only to touch it. */
  board.classList.add('live');
  var ms = ((window.performance && performance.now) ? performance.now() : 0) - t0;
  var since = (window.performance && performance.now) ? Math.round(performance.now()) : 0;
  try {
    if (new URLSearchParams(location.search).has('ready')) {
      var n = document.createElement('span');
      n.className = 'mcb-ready';
      n.textContent = 'board paintable from the first byte \u00b7 touchable ' + since +
                      'ms after page start \u00b7 wiring itself took ' + ms.toFixed(1) + 'ms';
      say.appendChild(n);
    }
  } catch (e) {}
})();
</script>
