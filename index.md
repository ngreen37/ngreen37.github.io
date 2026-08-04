---
# ⚠ `layout:` IS PINNED ON PURPOSE — NEVER LET THIS KEY GO ABSENT.
#
# GitHub Pages once re-emitted this exact file from a stale build-cache entry that still
# recorded an OLD layout, and served the wrong page at `/` while the source was correct.
# The key being merely ABSENT is not the same as being set: pinning it forces the intended
# render every build. (2026-07-24, and it still applies now that this file is the home page.)
layout: page
permalink: /
title: ChessWild
own_title: true
body_class: theme-chess
tab_title: ChessWild — free chess for everyone
description: Free chess for everyone — play a real game, solve a puzzle, or learn from scratch. Set in the world of Princess and the Journey to Chess City, by McPuppy Studios.
---

{% comment %} ══════════════════════════════════════════════════════════════════════════
     THE DOMAIN ARRIVED (2026-08-03, Nate: "I just bought chesswild.com — we needed a
     chess-sounding website name, given our front page. Let's reset the structure of the
     site with this now in mind.")

     THIS FILE IS THE FRONT DOOR, AND IT SITS AT `/`. That is the whole restructure. The
     page itself is unchanged — it moved. It lived at `/chess/` from 2026-07-28, back when
     the address people typed was mcpuppystudios.com and `/` had to explain the studio
     before it could offer a game. A domain that says CHESS removes the explanation: a
     stranger who types chesswild.com has already been told what this is, so making them
     wait through a redirect to find out was a hop that bought nothing.

     `/chess/` still exists — as the redirect stub, the exact inverse of what it was. It
     cannot 404: it is the PWA `start_url` baked into every launcher installed on
     2026-08-03, it is in the sw.js precache (where a 404 fails SILENTLY), and it has been
     the shared address of this page for a week.

     THE NAME IS "ChessWild" — one word, his pick, matching the domain letter for letter.
     It is still one Liquid variable below, so the next rename is still one line.

     THE BRAND STACK, his call the same day: **McPuppy Studios makes ChessWild, which is
     set in PJCC.** Studio → site → world. That is why the eyebrow above the title still
     reads "From McPuppy Studios" and why the world card near the foot still opens /pjcc/.
     Three names, one hierarchy, each appearing exactly where it means something.
     ──────────────────────────────────────────────────────────────────────────────
     THE ORIGINAL BRIEF (2026-07-28, Nate: "we're switching gears… rename the home page
     something more generic like McPuppy Chess, like chess.com or lichess.org… give me just
     a basic home page that encapsulates our modified direction… this is where you can help
     me add the CTA").

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

     THE NAME is one Liquid variable, right below. The twenty candidates in FUTURE-IDEAS
     are CLOSED — the domain picked the name on 2026-08-03.
     ══════════════════════════════════════════════════════════════════════════ {% endcomment %}

{%- assign site_name = "ChessWild" -%}

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
    {%- comment -%} THE EYEBROW IS GONE (2026-08-04, Nate: "We've got 'By McPuppy Studios' on
         the top left and 'From McPuppy Studios' in the center. Delete the latter."). The
         drawer already says it, permanently, on every page — saying it twice on the one
         screen was the studio introducing itself to someone who came to play chess.
         The brand stack is unchanged; it just isn't announced twice. {%- endcomment -%}
    <h1 class="mc-title">{{ site_name }}</h1>
    {%- comment -%} ══ BARE MINIMUMS (2026-07-28) ═══════════════════════════════════════
         Nate: "The descriptions on the home page are ALL too long… These are chess people.
         They are curious, intelligent, and they'll figure it out as they go. Redo the home
         page descriptions with bare minimums."

         Every line below was cut to the shortest TRUE version of itself. The rule used was:
         say the thing, don't sell the thing — a chess player reading "one move wins" already
         knows what a puzzle is and doesn't need to be told it will explain itself. Word count
         across the page went 186 → 71. Nothing was cut that was a FACT (the referee, the free
         review, the offline play all survive); what went was the sentence explaining the fact
         after it had already landed. {%- endcomment -%}
    {%- comment -%} THREE WORDS (2026-08-04, Nate: "let's go with 'Play, Solve, Learn'. I like
         that. Make it just those three words. Put it somewhere basic.").

         It replaced "Play a game, solve a puzzle, or learn the pieces." — which said the same
         thing in nine words and a comma splice. Three words name the three doors below it, so
         the sentence and the grid now agree instead of paraphrasing each other. {%- endcomment -%}
    <p class="mc-lede">Play. Solve. Learn.</p>

    {%- comment -%} THE ONE BUTTON. Park Tables because it's the only door where a stranger is
         *playing* in two taps — a park regular seats you instantly, no account, real rules,
         a real clock.

         ⚠ THE ACADEMY TEXT LINK THAT SAT HERE IS GONE (2026-08-04, Nate: "There's a big yellow
         button and a text link to academy and an out-of-place tagline… the home page is very
         confusing"). He is right, and it was the second call to action the page's one law
         forbids — it just wasn't gold, so it got away with it. Academy is already one of the
         four doors directly below. {%- endcomment -%}
    <a class="mc-cta" href="{{ '/games/park-tables/' | relative_url }}">
      <span class="mc-cta-ico" aria-hidden="true">&#9822;</span>
      <span class="mc-cta-txt">Play Chess</span>
      <span class="mc-cta-arw" aria-hidden="true">&rarr;</span>
    </a>
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
    {%- comment -%} ⚠ TWO LAYERS, and that is the FIX for the holes Nate screenshotted
         (2026-07-28). The squares and the pieces used to be siblings in ONE grid — and CSS
         grid places explicitly-positioned items FIRST, so the nine pieces claimed their
         cells and the sixty-four auto-placed squares SKIPPED those cells and spilled into
         implicit rows 9-10, where overflow:hidden clipped them. Result: nine holes of bare
         card showing through under every piece, and the checkerboard parity scrambled from
         the first hole onward, because the `d` class was computed from the loop index and
         the square no longer landed where the index said. Measured: 9 squares off the board,
         holes at exactly r1c7 · r2c6-8 · r7c6-8 · r8c1 · r8c7 — the nine occupied cells.

         Squares in their own grid, pieces in another laid over it: nothing is auto-placed
         next to anything explicit, so neither layer can push the other. {%- endcomment -%}
    <div class="mcb" id="mcb" role="group" aria-label="White to play and mate in one">
      <div class="mcb-grid">
        {%- for i in (0..63) -%}
          {%- assign r = i | divided_by: 8 -%}{%- assign c = i | modulo: 8 -%}
          {%- assign par = r | plus: c | modulo: 2 -%}
          <i class="mcb-sq{% if par == 1 %} d{% endif %}" data-sq="{{ i }}"></i>
        {%- endfor -%}
      </div>
      <div class="mcb-men">
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
    </div>
    <p class="mcb-say" id="mcb-say">White to play. <b>Mate in one.</b></p>
    {%- comment -%} ══ THE INVITATION, NOT THE ESCORT (2026-07-29) ═══════════════════════
         Nate: "Don't automatically go to puzzles when you do the Home Page — but PROMPT
         them to go to puzzles. That'll be REAL nice."

         Solving used to start a 1.25s timer and then move the page out from under you.
         Being teleported for getting something RIGHT is a punishment shaped like a
         reward: you just did the thing, and the site took the room away before you
         could enjoy it. So the win now hands you a door instead of walking you through
         it — and the offer names the scale, because "solve another" is a shrug and
         "1,000 puzzles to Chess City" is a road.

         ⚠ IT IS NOT GOLD, and that is the page's one law (see the header comment). This
         appears only AFTER an interaction, so nobody ever sees two calls to action — but
         gold means "the primary thing" here, and there is only ever one of those.
         ══════════════════════════════════════════════════════════════════ {%- endcomment -%}
    {%- comment -%} ⚠ THE <span> IS LOAD-BEARING. `.mcb-next` is an inline-flex row, and a
         flex container ignores `display:block` on its children — so the label and the
         sub-label laid out side by side and read as one sentence: "Solve another 1,000
         puzzles to Chess City", which says the opposite of what it means. Wrapped, they
         stack. {%- endcomment -%}
    <a class="mcb-next" id="mcb-next" href="{{ '/games/fork-in-the-road/' | relative_url }}" hidden>
      <span class="mcb-next-txt">
        <b>Solve another</b>
        <small>1,000 puzzles to Chess City</small>
      </span>
      <i aria-hidden="true">&rarr;</i>
    </a>
  </div>
</section>
</section>

<h2 class="mc-h2">Four ways in</h2>
<div class="mc-doors">
  <a class="mc-door" href="{{ '/games/park-tables/' | relative_url }}">
    <span class="mc-door-ico" aria-hidden="true">&#9654;</span>
    <b>Play Now</b>
    <small>A person, a park regular, or McPuppy.</small>
  </a>
  <a class="mc-door" href="{{ '/games/the-gauntlet/' | relative_url }}">
    <span class="mc-door-ico" aria-hidden="true">&#9819;</span>
    <b>The Gauntlet</b>
    <small>Ten floors. Ten rivals.</small>
  </a>
  <a class="mc-door" href="{{ '/games/fork-in-the-road/' | relative_url }}">
    <span class="mc-door-ico" aria-hidden="true">&#9822;</span>
    <b>Puzzles</b>
    <small>One move wins. Miss it and it shows you why.</small>
  </a>
  <a class="mc-door" href="{{ '/academy/' | relative_url }}">
    <span class="mc-door-ico" aria-hidden="true">&#128214;</span>
    <b>Academy</b>
    <small>Start at how the pieces move.</small>
  </a>
</div>

{%- comment -%} THE HONEST STRIP — three things that are TRUE and that no other free chess site
     says out loud. Not features; proofs. (FUTURE-IDEAS #9 asked for the offline line for
     months — this is it.) Anything added here has to survive `npm test`. {%- endcomment -%}
<ul class="mc-true">
  <li><b>The chess is real.</b> A perft-verified referee, with Stockfish as a second opinion.</li>
  <li><b>Every game gets a review.</b> Free, in your browser, forever.</li>
  <li><b>It works on a plane.</b> The arcade and the engine cache on first visit.</li>
</ul>

{%- comment -%} ONE door to the world — the show is the point of all of this, but it is not
     what a stranger came here to DO. One card, warm, at the foot. {%- endcomment -%}
<a class="mc-world" href="{{ '/pjcc/' | relative_url }}">
  <span class="mc-world-glyph" aria-hidden="true">&#9819;</span>
  <span class="mc-world-txt">
    <b>There is a whole world behind this board</b>
    <small><i>Princess and the Journey to Chess City</i> — an animated series in the making.</small>
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

{%- comment -%} THE THREE FACTS, REHOMED (2026-08-04, Nate: "an out-of-place tagline (free · no
     account · works offline): let's put it somewhere else").

     They were wedged directly under the one button, where they read as small print apologising
     for it. They are not small print — they are the three things this site can say that most
     free chess sites cannot — but they answer a question a visitor only forms AFTER they have
     looked around. So they close the page instead of interrupting it. {%- endcomment -%}
<p class="mc-facts">Free &middot; no account &middot; works offline</p>

<style>
/* ── ChessWild — the front door ───────────────────────────────────────────────────
   Built on the shared tokens (--step-*, --space-*, --r-*) so it inherits the site's
   type scale and radii. Page-local because it is one page's furniture; if a second
   page ever needs a piece of it, that piece graduates to _sass/. */

/* HERO — copy left, board right; one column under 760px with the board FIRST, so a
   phone still opens on something that looks like chess rather than on a paragraph. */
/* inside .mc-table now, which owns the outer spacing (_pjcc-25-front-door.scss) */
.mc-hero { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: var(--space-6, 32px);
  align-items: center; margin: 0; }
.mc-title { font-size: clamp(38px, 6.4vw, 64px); line-height: 1.02; font-weight: 900;
  color: var(--fd-ink); margin: 0 0 10px; letter-spacing: -0.02em; text-wrap: balance; }
/* THREE WORDS, and they get to breathe — this is the only sentence on the first screen
   now, so it is sized as a statement rather than as a subtitle. */
.mc-lede { color: var(--fd-ink-2); font-size: clamp(17px, 2.2vw, 21px); line-height: 1.5;
  font-weight: 600; letter-spacing: 0.01em; margin: 0 0 var(--space-5, 24px); }

/* THE ONE BUTTON — GREEN NOW (2026-08-04). Nothing else on the page is filled or this
   size; that is still the whole design. Only the colour changed, and the reason is in
   _pjcc-25-front-door.scss: gold was the loudest possible paint on a page whose whole job
   is to look welcoming. Green is what every mass-market chess site already uses, and it is
   what THIS site already uses for "go" — the Park Tables' legal-move dot is mint.

   The 2026-07-29 lesson survives the repaint and is the reason there is no `filter` here:
   THE HOVER GOES DEEPER, NEVER BRIGHTER. The old gold got lighter under the cursor, so the
   loudest thing on the page turned up when you reached for it.

   Contrast: white on --fd-go is 5.1:1 — AA for normal text, and this label is large and
   900-weight on top of that. */
.mc-cta { display: inline-flex; align-items: center; gap: 12px; text-decoration: none;
  background: var(--fd-go); color: #ffffff;
  font-weight: 800; font-size: clamp(17px, 2.1vw, 20px); letter-spacing: 0.01em;
  padding: 15px 28px; border-radius: 999px; border: 2px solid var(--fd-go);
  box-shadow: 0 8px 22px rgba(46,125,71,0.22);
  transition: transform .14s ease, box-shadow .14s ease,
              background .14s ease, border-color .14s ease; }
.mc-cta:hover { transform: translateY(-2px);
  background: var(--fd-go-2); border-color: var(--fd-go-2);
  box-shadow: 0 12px 26px rgba(46,125,71,0.28); text-decoration: none; color: #ffffff; }
.mc-cta:active { transform: translateY(0); }
.mc-cta-ico { font-size: 1.15em; line-height: 1; }
.mc-cta-arw { font-size: 1.05em; transition: transform .14s ease; }
.mc-cta:hover .mc-cta-arw { transform: translateX(3px); }

/* the three facts, now closing the page — centred, quiet, and the last thing read */
.mc-facts { margin: var(--space-5, 24px) 0 0; color: var(--fd-ink-3); font-size: 0.84rem;
  letter-spacing: 0.02em; text-align: center; }

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
   glyphs (♔♕♖♙) will not fill, which is the same trap Park Tables hit.

   ⚠ SECOND PASS 2026-07-28 (Nate, with a screenshot: "can we make the board and pieces
   uniform"). Reading the canon TOKENS was not the same as looking like the canon BOARD —
   this one still wore a 4px shadow-ring instead of the timber border, flat wood with no
   key light, and bare glyphs with no carved outline. It is now the same board as Park
   Tables and the Academy drill, rule for rule: 3px --chess-frame border, 6px radius, the
   recessed shadow stack, the 152deg key light OVER the grain, and the piece livery
   (filled glyph + text-stroke in the opposite line colour, paint-order:stroke fill so
   the outline sits UNDER the fill). PARK TABLE STANDARD IS THE DEFAULT FOR EVERY BOARD.

   Selection colour is MINT (#6bffb8), not gold — Park Tables' own "go" colour, and it
   also keeps the page's one-gold rule honest: the lift glow and the target dot used to be
   the same gold as the CTA, which is three gold things on a page allowed one. */
.mcb {
  /* 100%, NOT a vw unit. `80vw` measures the WHOLE VIEWPORT, which knows nothing about
     the wrapper's 26px and the card's 20px of padding — at 390px that asked for a 312px
     board inside a 298px column, and .mc-table's overflow:hidden quietly SLICED THE
     H-FILE OFF. It reported no page overflow precisely because it was being clipped. */
  position: relative; width: min(348px, 100%); aspect-ratio: 1; margin: 0 auto;
  border: 3px solid var(--chess-frame); border-radius: 6px; overflow: hidden;
  /* the pieces size themselves off the BOARD, not off the viewport — see .mcb-p */
  container-type: inline-size;
  box-shadow: 0 18px 36px -14px rgba(0,0,0,0.72), inset 0 3px 9px rgba(255,255,255,0.06),
    inset 0 -12px 22px rgba(0,0,0,0.32); }
/* the two layers — see the markup note. Same 8x8 geometry, stacked, so neither can
   displace the other. */
.mcb-grid, .mcb-men { position: absolute; inset: 0; display: grid;
  grid-template-columns: repeat(8, 1fr); grid-template-rows: repeat(8, 1fr); }
/* the men layer is INERT except for the rook: click a pawn while the rook is up and the
   click falls through to the square underneath, so the board still answers you. */
.mcb-men { pointer-events: none; }
.mcb-sq { position: relative; background-color: var(--chess-lt);
  background-image: linear-gradient(152deg, rgba(255,252,240,0.14), rgba(0,0,0,0.04) 62%), var(--chess-grain); }
.mcb-sq.d { background-color: var(--chess-dk);
  background-image: linear-gradient(152deg, rgba(255,240,214,0.10), rgba(0,0,0,0.10) 62%), var(--chess-grain); }
/* ── THE PIECES, matched to PJCCPieces.draw() number for number ────────────────────
   Park Tables paints each piece onto a <canvas> with the shared renderer
   (assets/js/pjcc-pieces.js). This page can't call it without loading script before the
   board is usable — the one thing the front door refuses to do — but it doesn't have to,
   because that renderer draws THE SAME FILLED GLYPHS. So every number below is lifted
   straight out of it and re-expressed in CSS, and the two boards land on the same piece:

     ctx.font = '900 ' + size + 'px "Segoe UI Symbol",…'   → font: 900 …, same stack
     size = 104 on a 128 canvas = 81% of the square         → 10.5cqw (a square is 12.5cqw)
     ctx.lineWidth = size * 0.085, strokeText then fillText  → -webkit-text-stroke: .085em
                                                               + paint-order: stroke fill
     fillText offset by (size*.035, size*.06) at 40% black   → the first text-shadow
     ellipse(cx, cy + size*.40, size*.33, size*.11) at 32%   → ::before, in % of the square

   cqw, not vw: the old clamp(24px, 5.8vw, 33px) sized the pieces off the WINDOW, so at
   any width where the board had stopped growing the pieces kept going — they only looked
   right at one viewport. A piece should be a fraction of its square and nothing else. */
.mcb-p { position: relative; display: flex; align-items: center; justify-content: center;
  font: 900 10.5cqw/1 "Segoe UI Symbol", "Apple Symbols", "Noto Sans Symbols2", serif;
  z-index: 2; cursor: default; user-select: none; paint-order: stroke fill;
  transition: transform .28s cubic-bezier(.2,.8,.3,1), filter .15s ease; }
/* the shadow the piece stands in */
.mcb-p::before { content: ''; position: absolute; left: 23.2%; top: 73.6%;
  width: 53.6%; height: 17.9%; border-radius: 50%; background: rgba(0,0,0,0.32); }
.mcb-p.w { color: var(--piece-w-fill); -webkit-text-stroke: 0.085em var(--piece-w-line);
  text-shadow: 0.035em 0.06em 0 rgba(0,0,0,0.40); }
.mcb-p.b { color: var(--piece-b-fill); -webkit-text-stroke: 0.085em var(--piece-b-line);
  text-shadow: 0.035em 0.06em 0 rgba(0,0,0,0.40); }
/* only the rook is ever touchable — the whole puzzle is one move */
.mcb.live .mcb-p[data-pc="R"] { cursor: pointer; pointer-events: auto; }
.mcb.live .mcb-p[data-pc="R"]:hover { filter: drop-shadow(0 0 8px #6bffb8); }
.mcb-p.lift { transform: translateY(-5px) scale(1.08); filter: drop-shadow(0 0 10px #6bffb8); }
/* the shadow stays on the board when the piece comes off it */
.mcb-p.lift::before { transform: translateY(5px); opacity: 0.55; }
/* the one legal target, shown only after the rook is picked up — Park Tables' legal-move
   dot exactly: a dark disc ringed in mint, so it reads the same on maple or walnut */
.mcb-sq.hint::after { content: ''; position: absolute; inset: 0; margin: auto;
  width: 34%; height: 34%; border-radius: 50%;
  background: rgba(38,25,10,0.30); box-shadow: 0 0 0 2px rgba(107,255,184,0.9); }
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

/* THE OFFER after the mate (2026-07-29) — a door, not an escort. Wood and ink only: this
   is the one moment a second call to action exists on the page, and it earns its place by
   never being visible until you've already done something. It must not read as gold. */
.mcb-next { display: inline-flex; align-items: center; gap: 12px; margin: 10px auto 0;
  padding: 10px 18px; border-radius: 999px; text-decoration: none; text-align: left;
  color: var(--fd-ink); background: var(--fd-panel-hi);
  border: 1px solid var(--fd-grain);
  animation: mcbNextIn .34s cubic-bezier(.2,.9,.3,1.2) both;
  transition: transform .14s ease, border-color .14s ease, background .14s ease; }
.mcb-next[hidden] { display: none; }
.mcb-next-txt { display: block; }
.mcb-next b { display: block; font-size: 0.95rem; font-weight: 800; line-height: 1.25; }
.mcb-next small { display: block; color: var(--fd-ink-3); font-size: 0.76rem; line-height: 1.3; }
.mcb-next i { font-style: normal; color: var(--fd-wood); font-size: 1.1rem;
  transition: transform .14s ease; }
.mcb-next:hover { text-decoration: none; transform: translateY(-2px);
  border-color: var(--fd-wood); background: var(--fd-panel); }
.mcb-next:hover i { transform: translateX(3px); }
@keyframes mcbNextIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }

@media (prefers-reduced-motion: reduce) { .mcb-p { transition: none; }
  .mcb-next { animation: none; } }

/* The board block — sized to sit beside the copy without stealing from it. No hover lift:
   this is a chessboard you play on, not a card you click, and a board that rises when the
   mouse crosses it reads as a link and invites a click anywhere. The rook is the affordance. */
.mc-board { display: flex; flex-direction: column; align-items: center; justify-content: center;
  min-height: 190px; padding: var(--space-4, 16px); }

/* ── PHONE / THE INSTALLED APP: THE TITLE COMES FIRST ─────────────────────────────
   Nate, 2026-08-03: "on the app version of the home page, the puzzle is at the very
   top. Let's move that below the McPuppy Chess title."

   The board used to be `order:-1` — dead first, above everything. That was the right
   instinct (open on chess, not on a paragraph) taken one step too far: opening the app
   gave you a chessboard with no name on it, so the one screen that has to say WHOSE
   site this is said it second. The title now lands first and the board sits directly
   under it, and it costs the CTA nothing — the gold button was already below the board,
   and only the eyebrow and the h1 moved above it. Measured at 390×844: the button went
   from y=567 to y=557 and the hero from 690px to 680px. The title got the top of the
   screen and the button got 10px CLOSER to it.

   HOW: `.mc-hero-copy` dissolves with `display:contents`, so its six children stop
   being one grid item and become grid items in their own right — which is the only way
   the board can slot BETWEEN two of them. `order` then lays them out. (The copy div
   carries no styling of its own, so there is nothing to lose by dissolving it.)

   ⚠ `gap` GOES TO ZERO with it, and that is not optional. The 16px gap used to apply
   ONCE, between the copy block and the board; the moment the copy's children are items
   themselves it would apply between every one of them, on top of the margins they
   already carry, and the hero would grow ~80px of air on the smallest screen there is.
   Spacing stays where it was: on the elements. */
@media (max-width: 760px) {
  .mc-hero { grid-template-columns: 1fr; gap: 0; }
  .mc-hero-copy { display: contents; }
  /* three children now, not six — the eyebrow was deleted and the facts moved to the
     foot of the page, so this list shrank with them. If it ever falls out of step with
     the markup the hero silently reorders itself, which is why it is worth keeping tight. */
  .mc-title { order: 1; }
  .mc-board { order: 2; }
  .mc-lede  { order: 3; }
  .mc-cta   { order: 4; }
  /* the board's own breathing room, now that no gap supplies it: a hair under the
     title (which already carries 10px) and a clear step down to the lede. */
  .mc-board { min-height: 0; padding: 2px 0 var(--space-3, 12px); }
  .mc-cta { width: 100%; justify-content: center; }
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

/* THE WORLD DOOR — DE-PURPLED 2026-08-04 (Nate: "completely get rid of the purple and gold
   aesthetic — leave that with PJCC page").

   This used to be the page's one deliberate purple: the single card that opens the world,
   so that purple meant something instead of being wallpaper. That idea was good and it is
   GONE ANYWAY, because he asked for no purple on the front door and a single exception is
   how a rule dies. The card is warm paper now and carries its weight by being the only
   thing on the page with a wood-toned wash instead of a flat panel.
   The purple all still lives one click away, on /pjcc/, where it belongs. */
.mc-world { display: flex; align-items: center; gap: 16px; text-decoration: none;
  padding: 18px 20px; border-radius: var(--r-lg, 16px); margin: 0 0 var(--space-6, 32px);
  background: linear-gradient(100deg, rgba(185,139,87,0.13), rgba(240,237,229,0.6));
  border: 1px solid var(--fd-grain);
  transition: border-color .14s ease, transform .14s ease, background .14s ease; }
.mc-world:hover { border-color: var(--fd-wood); transform: translateY(-2px);
  background: linear-gradient(100deg, rgba(185,139,87,0.2), rgba(240,237,229,0.75)); text-decoration: none; }
.mc-world-glyph { font-size: 34px; line-height: 1; color: var(--fd-wood); flex: 0 0 auto; }
.mc-world-txt { flex: 1; min-width: 0; }
.mc-world-txt b { display: block; color: var(--fd-ink); font-size: 1rem; margin-bottom: 3px; }
.mc-world-txt small { display: block; color: var(--fd-ink-3); font-size: 0.84rem; line-height: 1.55; }
.mc-world-arw { color: var(--fd-wood); font-size: 1.2rem; flex: 0 0 auto; }
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
/* THE DESK (2026-07-29, Nate: "for the Working Lamp, reduce the length of the wooden base
   by 25% and center it"). 118px → 88px, exactly a quarter off.

   "Centred" needed a decision, because the lamp DRAWING is not centred in its own 82px
   box: the round foot spans x 31-68 (mid 49.5) while the shade and the cone of light
   reach LEFT to about x −3. So the box's centre and the lamp's centre are 9px apart, and
   the old −18/−18 was symmetric about the BOX — which is why the plank always looked
   shifted left and ran off the card's edge. It is centred on the FOOT now (mid 50): the
   plank is furniture, and furniture is centred under what stands on it, not under a beam
   of light. Rendered all three readings against the live band before choosing. */
.mc-lamp .sl-desk { left: 6px; right: -12px; border-radius: 3px; }
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

/* phones: every door and link clears 44px — raised from 40 by the 2026-07-28 four-lens
   sweep, which measured both of these at exactly 40 and flagged them. 44 is the target;
   40 was close enough to look right and not be right. */
/* phones: every link in the studio band clears 44px. `.mc-studio-post` was measured at 28px
   and had never been in this rule — it only became obvious once the band was the last
   interactive thing on a page that had lost two other links above it. */
@media (pointer: coarse) {
  .mc-studio-post, .mc-studio-more { min-height: 44px; display: flex; align-items: center; }
}
@media (prefers-reduced-motion: reduce) {
  .mc-cta, .mc-door, .mc-world { transition: none; }
}
</style>

<script>
/* ══ THE BOARD IS THE BUTTON — the interaction ═══════════════════════════════════════
   Everything above is already painted. This only adds the ability to TOUCH it, and it
   measures how long that took, because Nate asked to feel the gap in human terms:
   open /?ready=1 and the board tells you the number under it.

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
  var NEXT = document.getElementById('mcb-next');           // the offer, revealed on the mate
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
      /* NO TIMER, NO location.href (2026-07-29) \u2014 see the #mcb-next markup comment.
         The reward for solving is that the position STAYS on the screen, and the room
         becomes a door you may choose to take. */
      tell('<b>Ra8#</b> \u2014 that\u2019s mate. The back rank was the whole board.', true);
      if (NEXT) { NEXT.hidden = false; }
      return;
    }
    /* ── anything else: tell them the truth, then let them try again ── */
    sq.classList.add('bad');
    setTimeout(function () { sq.classList.remove('bad'); }, 520);
    tell('Not there \u2014 the king steps away. <b>The mate is on the back rank.</b>');
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
