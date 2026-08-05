---
# ⚠ `layout:` IS PINNED ON PURPOSE — NEVER LET THIS KEY GO ABSENT.
#
# GitHub Pages once re-emitted this exact file from a stale build-cache entry that still
# recorded an OLD layout, and served the wrong page at `/` while the source was correct.
# The key being merely ABSENT is not the same as being set: pinning it forces the intended
# render every build. (2026-07-24, and it still applies now that this file is the home page.)
layout: page
permalink: /
title: ChessWild.com
# The <h1> stands ABOVE the sheet now, on the town sky (2026-08-04, Nate: "let's move the
# chesswild.com title outside of the white box. it is taking up too much space"). See
# .page-title-out in _layouts/page.html + the styling at the foot of this file.
title_outside: true
# The three words stand BESIDE the title, out on the sky (2026-08-04, Nate: "put the tagline
# play.solve.learn near ChessWild.com"). They used to be the first line inside the card; the
# name and its tagline are one lockup, and splitting them across the card's edge meant the
# sheet opened on a fragment of a thought. Proper caps are his call too, same batch.
tagline_outside: Play. Solve. Learn.
# ...and the three facts close the page from OUTSIDE it (same batch: "put free · no account ·
# works offline below the white box and into the blue"). Printed by _layouts/page.html after
# the card — see the note there for why it can't be done from inside the page.
sky_note: Free · No Account Required · Works Offline
body_class: theme-chess
tab_title: ChessWild.com — free chess for everyone
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

     THE NAME IS "ChessWild.com" (2026-08-04, Nate: "let's brand this ChessWild.com and not
     just ChessWild"). The address IS the brand, the way chess.com's is — a name a stranger
     can type straight from having heard it. Still one Liquid variable below.
     ⚠ The PWA `short_name` does NOT follow: it is capped at 12 characters and this is 13,
     so the home-screen label stays "ChessWild". That cap is enforced by tests/pwa.check.js.

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

{%- assign site_name = "ChessWild.com" -%}

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
    {%- comment -%} THE EYEBROW IS GONE (2026-08-04, Nate: "We've got 'By McPuppy Studios' on
         the top left and 'From McPuppy Studios' in the center. Delete the latter."). The
         drawer already says it, permanently, on every page — saying it twice on the one
         screen was the studio introducing itself to someone who came to play chess.
         The brand stack is unchanged; it just isn't announced twice. {%- endcomment -%}
    {%- comment -%} THE TITLE LEFT THIS BLOCK (2026-08-04, Nate: "let's move the
         chesswild.com title outside of the white box. it is taking up too much space").
         It is printed by the layout now, above the card, on the sky — `title_outside: true`
         in the front matter. It was 64px of the hero's left column, which meant the sheet
         opened on the site announcing its own name to someone who had just typed it in;
         what is left in the column is the sentence and the button, which is what a visitor
         is actually there for. {%- endcomment -%}
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

         ⚠ THEY LEFT THIS BLOCK LATER THE SAME DAY ("put the tagline play.solve.learn near
         ChessWild.com"). They are `tagline_outside` in the front matter now and stand beside
         the title on the sky — the name and its tagline are one lockup, and the card's edge
         was running through the middle of it. {%- endcomment -%}

    {%- comment -%} ══ THE PILL BECAME A BOX (2026-08-04) ══════════════════════════════════
         Nate: "where the green pill Play Chess — make it instead a box like the others, but
         keep it above the others and make it more prominent" + "put Play Now more prominent".

         So the page's one call to action is still exactly one thing; it changed SHAPE. A pill
         is a control — it says "submit". A box is a DOOR, and the four things under it are
         doors, so a pill floating above four doors was the primary action wearing the wrong
         costume. Now the set is five doors and the first one is bigger, greener and named the
         same thing the drawer names it: **Play Now**.

         ⚠ THE PAGE'S ONE LAW SURVIVES THE RESHAPE. There is still exactly ONE filled green
         thing on this page and everything else is quieter than it. `.mc-lead` is the only
         card with a green wash, a green rule and a green arrow; the other four are paper. If
         a second box ever goes green, the page has regressed to the problem the front door
         was built to fix.

         Park Tables is still where it points, for the reason it always did: it is the only
         door where a stranger is *playing* in two taps — a park regular seats you instantly,
         no account, real rules, a real clock. {%- endcomment -%}
    <a class="mc-door mc-lead" href="{{ '/games/park-tables/' | relative_url }}">
      <span class="mc-door-ico" aria-hidden="true">&#9822;</span>
      <b>Play Now</b>
      <small>A person, a park regular, or McPuppy.</small>
      <span class="mc-lead-arw" aria-hidden="true">&rarr;</span>
    </a>

  {%- comment -%} ══ THE BOARD IS THE BUTTON (2026-07-28) ══════════════════════════════════
       Nate: "I love the Board is the Button idea — let's do it, with the risk in mind."

       A stranger does not have to be convinced to touch a chess piece. So the front door
       does not ask them to believe a claim and then click — it puts a real position in
       front of them and waits. One move wins.

       ⚑ THE POSITION IS RANDOM NOW (2026-08-04, Nate: "the puzzle on the home page should be
       completely random and there should not be a description. Whether they are wrong or
       right is fine, mark it right or wrong and then offer more puzzles").

       It used to be ONE hand-proved position (6k1/5ppp/8/8/8/8/5PPP/R5K1, Ra8#) hard-coded
       into this markup, and the reason given was that loading a 40KB referee onto the front
       door to re-derive a fact we already proved is the exact trade this page exists to
       refuse. THAT REASONING SURVIVES RANDOMNESS INTACT — IT JUST MOVED. tests/gen-front-puzzles.js
       builds random positions, hands every one to the real perft-verified referee, and keeps
       a position only where the referee agrees there is EXACTLY ONE checkmate among all of
       White's legal moves. The page carries the answers, not the engine, and grades a click
       by comparing two integers. Re-generate with `npm run gen:puzzles`; never hand-edit the
       pool. [[accuracy-above-all]]

       THE RISK, STILL HANDLED: the 64 cells are STATIC MARKUP and the board is a fixed
       square, so there is no layout shift — only the MEN are placed, by a script that sits
       immediately below the board and therefore runs during parse, before first paint. Add
       ?ready=1 to the URL and the page will tell you how many milliseconds that gap was.
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
      {%- comment -%} The men are painted by the script directly below this board, which
           runs during parse — see the block comment above. The squares stay static so the
           board is a finished square from the first frame either way. {%- endcomment -%}
      <div class="mcb-men" id="mcb-men"></div>
    </div>
    <p class="mcb-say" id="mcb-say">White to play. <b>Mate in one.</b></p>
    {%- comment -%} ══ THE INVITATION, NOT THE ESCORT (2026-07-29) ═══════════════════════
         Nate: "Don't automatically go to puzzles when you do the Home Page — but PROMPT
         them to go to puzzles. That'll be REAL nice."

         Solving used to start a 1.25s timer and then move the page out from under you.
         Being teleported for getting something RIGHT is a punishment shaped like a
         reward: you just did the thing, and the site took the room away before you
         could enjoy it. So the win hands you a door instead of walking you through it.

         ⚑ AND NOW THERE ARE TWO DOORS, BECAUSE THE PUZZLE IS RANDOM (2026-08-04, Nate:
         "mark it right or wrong and then offer more puzzles"). The offer appears on a
         MISS as well as on a mate — that is the change. It used to be the reward for
         solving, which meant a visitor who guessed wrong was left holding a position they
         had already failed with no way forward but the page itself.
           · "Another puzzle" deals a new one IN PLACE — a real button, because it does
             something on this page and does not navigate. Nothing is fetched: the whole
             pool is already here.
           · The room is still one tap away, and it still names the scale, because
             "more puzzles" is a shrug and "1,000 puzzles to Chess City" is a road.

         ⚠ NEITHER IS GOLD, and that is the page's one law (see the header comment). These
         appear only AFTER an interaction, so nobody ever sees two calls to action at once —
         but gold means "the primary thing" here, and there is only ever one of those.
         ══════════════════════════════════════════════════════════════════ {%- endcomment -%}
    {%- comment -%} ⚠ THE <span> IS LOAD-BEARING. `.mcb-next` is an inline-flex row, and a
         flex container ignores `display:block` on its children — so the label and the
         sub-label laid out side by side and read as one sentence, which says the opposite
         of what it means. Wrapped, they stack. {%- endcomment -%}
    <div class="mcb-offer" id="mcb-offer" hidden>
      <button class="mcb-next" id="mcb-again" type="button">
        <span class="mcb-next-txt"><b>Another puzzle</b></span>
        <i aria-hidden="true">&#8635;</i>
      </button>
      <a class="mcb-next mcb-next--room" href="{{ '/games/fork-in-the-road/' | relative_url }}">
        <span class="mcb-next-txt">
          <b>The puzzle room</b>
          <small>1,000 puzzles to Chess City</small>
        </span>
        <i aria-hidden="true">&rarr;</i>
      </a>
    </div>
  </div>
</section>
</section>

{%- comment -%} "Four ways in" → "More ways in" (2026-08-04). Play Now was promoted OUT of this
     grid and into the hero as `.mc-lead`, so the four boxes below are no longer the whole set —
     they are the rest of it, and a heading that counts them would be counting wrong. Games Hall
     takes the empty slot (Nate: "make a Games Hall box and put it in the play now box"), which
     keeps the grid at four and gives the page its one link to every game on the site.
     {%- endcomment -%}
<h2 class="mc-h2">More Ways In</h2>
<div class="mc-doors">
  <a class="mc-door" href="{{ '/games/' | relative_url }}">
    <span class="mc-door-ico" aria-hidden="true">&#9654;</span>
    <b>Games Hall</b>
    <small>Every game on the site, in one room.</small>
  </a>
  {%- comment -%} ══ THE REAL DOOR, ON THE FRONT DOOR (2026-08-04) ═══════════════════════════
       Nate: "add the appropriate gauntlet door to the gauntlet box."

       APPROPRIATE IS THE OPERATIVE WORD, and it is why this is markup plus twenty lines of
       script rather than a picture. The Gauntlet door is not one drawing — it is ten, one per
       floor, plus six grandeur tiers, and the hall and the game both hydrate it from the climb
       in localStorage so the leaf hanging in the arch belongs to the room you are about to
       walk into. A brand-new visitor gets floor one: the tattered cloth. Someone eight floors
       up gets the Vice President's door and a richer arch. Same partial, same rules, no fork —
       see [[gauntlet-door-one-file]]: `_pjcc-21-gauntlet-door.scss` is the single source, and
       the one thing that must never happen is a fourth copy of these rules.

       ⚠ IT IS A <span>, NOT AN <a>. Every other copy of this door on the site IS the link;
       here the CARD is the link, and an anchor inside an anchor is invalid HTML that browsers
       silently unnest — which would have broken the card, not just the door. Nothing in the
       partial requires an anchor, so the arch is spans and the card carries the href.

       ⚠ IT BRINGS GOLD AND PURPLE BACK ONTO A PAGE THAT BANNED BOTH ([[front-door-palette]]).
       That is deliberate and it is his call: the brass arch IS the Gauntlet's livery, and a
       de-brassed one would be a fifth door look on a site whose whole rule is that there is
       one. It is contained — a lit doorway sitting on paper, inside one card, at 46×60 instead
       of the canonical 78×100 so the row of four stays a row of four. {%- endcomment -%}
  <a class="mc-door mc-door--gauntlet gdoor-host" id="gauntlet-door"
     href="{{ '/games/the-gauntlet/' | relative_url }}"
     aria-label="The Gauntlet — real chess against a ladder of ten PJCC rivals">
    <span class="gdoor" aria-hidden="true">
      <span class="gdoor-arch">
        <i class="gdoor-door"><b class="gdoor-glyph" id="gdoor-glyph">&#9823;</b><u class="gdoor-knob"></u></i>
        <i class="gdoor-seam"></i>
      </span>
      <span class="gdoor-pips" id="gdoor-pips"></span>
    </span>
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

{% comment %} ══ THE BLOG CAME OFF, THE LAMP STAYED (2026-08-04) ═══════════════════════════
     Nate: "move the blog off the home page — keep the working lamp."

     The band used to carry the newest post's title, its date and a "Read the blog →" link.
     That was three more things to read and one more destination on a page whose whole job is
     to get a stranger onto a board — and the blog is not what they came for. It has not gone
     anywhere: it is in the site drawer on every page of the site, which is where a site's blog
     belongs.

     THE LAMP IS NOT THE BLOG, and that is why it survives the cut. It is a live signal, not a
     link to reading material: `site.time` IS the last commit, so the lamp is LIT when the site
     shipped within twelve hours and dark when it did not, and either way it opens the Direct
     Line. "Building in the open" is a claim; the lamp is the proof of it, and it is the only
     one of the four things that stood here that a visitor can check for themselves.

     The three facts that closed the page are gone from here too — they are `sky_note` in the
     front matter now, printed below the card, out on the blue.

     ⚠ THIS COMMENT'S OPENING TAG CARRIES NO HYPHENS, ON PURPOSE. Putting the whitespace-control
     hyphens back re-breaks the page. This band follows `</a>` (the world card), and an `<a>` is
     SPAN-level, so kramdown still has an open paragraph when it gets here. The blank line above
     is the only thing that closes that paragraph and lets `<section>` start a raw HTML block —
     and a hyphenated delimiter EATS THAT BLANK LINE, joining the two into `</a><section …>`.
     Kramdown then reads the section as span content and HTML-escapes it, so the tags ship as
     VISIBLE TEXT: `<section class="mc-studio"><div class="mc-lamp">` printed on the front door,
     `</div>` and `</section>` after it, no `.mc-studio` element ever created, and the lamp's
     absolutely positioned parts escaping to scatter across the page (that was the 8px of
     horizontal overflow). The four other comment-then-markup pairs on this page keep their
     hyphens safely, because each one follows a BLOCK-level close (`</div>`, `</ul>`) which ends
     the paragraph on its own. `npm run test:style` fails the build on this now.

     ⚠⚠ AND THAT PARAGRAPH DELIBERATELY DOES NOT SPELL THE DELIMITER — same house rule as the
     style-tag warning further up this file, and for a harder reason. LIQUID TOKENIZES THE INSIDE
     OF A COMMENT. It does not treat this text as inert prose; it scans it for tag delimiters, so
     an opening delimiter written here as an EXAMPLE is parsed as a real tag, and one without a
     closing delimiter after it takes the whole build down:
         Liquid syntax error (line 319): Tag '…' was not properly terminated
     That is not theoretical — it is what the first version of this very comment did. Three
     GitHub Pages builds failed in a row (765ff1e, d0d811c, and Nate's "new post" on top of
     them), the deploy step was SKIPPED each time, and the live site silently kept serving the
     older broken copy while `npm test` stayed green, because nothing local parses Liquid.
     `_includes/char-card-piece.html` shows the safe form: a COMPLETE, properly closed tag inside
     a comment parses and is discarded. It is the half-written one that kills it. Describe the
     delimiter in words here; never type one. {% endcomment %}

{% comment %} ══ THE STUDIO BAND IS GONE FROM THIS PAGE — 2026-08-04 ═════════════════════════
     Nate: "take the working lamp off the main page and leave it on the PJCC page."

     THE WHOLE BAND WENT, NOT JUST THE LAMP, and that follows from the note that used to
     stand here: "'Building in the open' is a claim; the lamp is the PROOF of it." The band
     had already lost the blog line earlier the same day, so the lamp and that label were all
     that was left — and a claim with its proof removed is just a claim, printed at the foot
     of a page whose one job is to get a stranger onto a board. The lamp is not gone from the
     site; it burns on /pjcc/, where the studio's own story is the point.

     Removed with it: `.mc-studio`, `.mc-lamp` and their placement block from this page's
     stylesheet below, and `.mc-studio`/`.mc-lamp` from the inherit-guard and the tooltip
     override in _sass/_pjcc-25-front-door.scss. The desk-lamp include now has exactly two
     callers, both HTML layouts (home.html, studio-home.html) — so the kramdown trap that ate
     it twice today cannot reach it at all any more. Restore from git if it ever comes back;
     the full write-up of that trap lives in tests/style.check.js rules 4 and 5.
     {% endcomment %}

<style>
/* ── ChessWild — the front door ───────────────────────────────────────────────────
   Built on the shared tokens (--step-*, --space-*, --r-*) so it inherits the site's
   type scale and radii. Page-local because it is one page's furniture; if a second
   page ever needs a piece of it, that piece graduates to _sass/. */

/* HERO — the Play Now door left, the board right; one column under 760px with the board
   FIRST, so a phone still opens on something that looks like chess. */
/* inside .mc-table now, which owns the outer spacing (_pjcc-25-front-door.scss) */
.mc-hero { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: var(--space-6, 32px);
  align-items: center; margin: 0; }
/* THE LOCKUP, OUTSIDE THE SHEET (2026-08-04) ─────────────────────────────────────
   Title and tagline stand together on the town sky, above the card. `baseline` alignment,
   not `center`: two lines of different size read as one line only when they sit on the same
   floor. It WRAPS on a narrow screen (the tagline drops under the name) rather than shrinking
   either one — three words on their own line is still the lockup; a squeezed title is not. */
.page-head-out { display: flex; align-items: baseline; flex-wrap: wrap;
  column-gap: 14px; row-gap: 2px; margin: 0 0 14px 4px; }
/* THE TITLE, OUTSIDE THE SHEET (2026-08-04) ──────────────────────────────────────
   It stands on the town sky between the header and the card, so the white box opens on
   the board and the button instead of on the site's own name.

   ⚠ IT IS SMALLER OUT HERE ON PURPOSE — 64px → 34px cap. Inside the sheet it was
   competing with the board for the first screen; out here it has no neighbors, so it
   only has to LABEL the page, not fill a column. "Taking up too much space" was the
   complaint, and moving something without shrinking it would have moved the problem.

   ⚠ THE SKY IS NOT A FIXED COLOR. It runs dawn → day → dusk → night behind every page
   ([[town-sky-moon-and-header]]), so this text has to hold against a bright noon blue AND
   a near-black midnight. White + a real shadow is the only pair that does both; a token
   from the light front-door palette (--fd-ink is #1e232c) would vanish at night, which is
   exactly the class of bug the "check a token against its WORST background" note is about.
   The shadow is doing the work here, not decoration. */
.page-title-out { color: #ffffff; font-size: clamp(26px, 3.4vw, 34px); font-weight: 900;
  letter-spacing: -0.01em; line-height: 1.1; margin: 0;
  text-shadow: 0 2px 14px rgba(0, 0, 0, 0.55), 0 1px 2px rgba(0, 0, 0, 0.4); }
@media (max-width: 700px) { .page-head-out { margin: 0 0 10px 2px; } }

/* THREE WORDS, beside the name (2026-08-04) — a tagline, so it is smaller and lighter than
   the wordmark and it never competes with it. Same white-plus-shadow pair as the title, and
   for the same reason: this text crosses dawn, noon, dusk and midnight, and any ink from the
   light front-door palette would vanish against half of them. It is a touch translucent so
   the hierarchy holds without introducing a second color to the sky. */
.page-tagline-out { color: rgba(255, 255, 255, 0.9); font-size: clamp(14px, 1.5vw, 17px);
  font-weight: 600; letter-spacing: 0.04em; line-height: 1.2; margin: 0;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.6), 0 1px 2px rgba(0, 0, 0, 0.5); }

/* THE THREE FACTS, BELOW THE CARD AND INTO THE BLUE (2026-08-04) ─────────────────
   Printed by the layout after `.page-card` (see _layouts/page.html). Same white-on-sky
   treatment as the lockup above, so the page is bracketed by two lines that live on the
   town rather than on the paper — the name at the top, the promise at the foot.

   ⚠ THE SHADOW IS HEAVIER HERE THAN ON THE TITLE. This is 0.84rem text, which is small
   enough that a bright noon sky can eat white type; the title is 34px and 900-weight and
   carries itself. Small text on a variable background needs the extra spread, not less. */
.page-note-out { margin: 16px 0 0; color: rgba(255, 255, 255, 0.92); font-size: 0.84rem;
  font-weight: 600; letter-spacing: 0.06em; text-align: center;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.7), 0 1px 3px rgba(0, 0, 0, 0.6); }


/* ── THE LIVE BOARD — PARK-TABLE-STANDARD ──────────────────────────────────────────
   ⚠ FIXED 2026-07-28. This board shipped with its OWN woods hard-coded — `#efe3c8`
   light, `#8a6a44` dark, `#fffaf0` / `#3b2a63` pieces, a `#2a1a55` purple frame — none
   of which are the canon's. It was a fifth board look on a site whose whole rule is that
   there is exactly ONE (Nate, 2026-07-16: "they should always be uniform — we'll just
   call it the chessboards, the pieces"). The comment above it even claimed it came
   "straight off the tokens", which made it worse: a fork that says it isn't one.

   It reads from _pjcc-22-chess-canon.scss now, like Park Tables, the Academy drill board
   and the game-review board do — including the GRAIN, which is what stops the squares
   reading as flat UI color and starts them reading as wood, and the timber frame that
   every other board on the site wears. Restyling all five is one token edit again.

   Orientation is standard and was already right: a8 (top-left) light, h1 (bottom-right)
   light, so a1 is dark. The park table DRAWING's quarter-turn ("white on the right") is a
   different thing on purpose — its players sit east and west. This one you play from
   White's side, so it faces the way a board faces.

   Both sides use FILLED glyphs (♚♛♜♟) and take their color from the tokens — the outline
   glyphs (♔♕♖♙) will not fill, which is the same trap Park Tables hit.

   ⚠ SECOND PASS 2026-07-28 (Nate, with a screenshot: "can we make the board and pieces
   uniform"). Reading the canon TOKENS was not the same as looking like the canon BOARD —
   this one still wore a 4px shadow-ring instead of the timber border, flat wood with no
   key light, and bare glyphs with no carved outline. It is now the same board as Park
   Tables and the Academy drill, rule for rule: 3px --chess-frame border, 6px radius, the
   recessed shadow stack, the 152deg key light OVER the grain, and the piece livery
   (filled glyph + text-stroke in the opposite line color, paint-order:stroke fill so
   the outline sits UNDER the fill). PARK TABLE STANDARD IS THE DEFAULT FOR EVERY BOARD.

   Selection color is MINT (#6bffb8), not gold — Park Tables' own "go" color, and it
   also keeps the page's one-gold rule honest: the lift glow and the target dot used to be
   the same gold as the CTA, which is three gold things on a page allowed one. */
.mcb {
  /* 100%, NOT a vw unit. `80vw` measures the WHOLE VIEWPORT, which knows nothing about
     the wrapper's 26px and the card's 20px of padding — at 390px that asked for a 312px
     board inside a 298px column, and .mc-table's overflow:hidden quietly SLICED THE
     H-FILE OFF. It reported no page overflow precisely because it was being clipped. */
  /* 348 → 400 (2026-08-04): the CARD got wider in the same pass ("make the white box
     bigger"), which widened the hero's right column to about 490px and left a 348px board
     floating in the middle of it with a gap down both sides. A board that does not grow
     with its column is the change looking like a mistake. It is also the one thing on this
     page a visitor is meant to READ, and it is a puzzle now rather than a fixed position. */
  position: relative; width: min(400px, 100%); aspect-ratio: 1; margin: 0 auto;
  border: 3px solid var(--chess-frame); border-radius: 6px; overflow: hidden;
  /* the pieces size themselves off the BOARD, not off the viewport — see .mcb-p */
  container-type: inline-size;
  box-shadow: 0 18px 36px -14px rgba(0,0,0,0.72), inset 0 3px 9px rgba(255,255,255,0.06),
    inset 0 -12px 22px rgba(0,0,0,0.32); }
/* the two layers — see the markup note. Same 8x8 geometry, stacked, so neither can
   displace the other. */
.mcb-grid, .mcb-men { position: absolute; inset: 0; display: grid;
  grid-template-columns: repeat(8, 1fr); grid-template-rows: repeat(8, 1fr); }
/* the men layer is INERT except for WHITE's pieces: click a black piece and the click falls
   through to the square underneath it, so "capture that" needs no code of its own — and on a
   random pool the answer is a capture often enough for that to matter. */
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
/* EVERY WHITE PIECE IS TOUCHABLE NOW (2026-08-04) — it used to be the rook and only the
   rook, because there was one position and one answer. A random position has no such piece. */
.mcb.live .mcb-p[data-mine] { cursor: pointer; pointer-events: auto; }
.mcb.live .mcb-p[data-mine]:hover { filter: drop-shadow(0 0 8px #6bffb8); }
.mcb-p.lift { transform: translateY(-5px) scale(1.08); filter: drop-shadow(0 0 10px #6bffb8); }
/* the shadow stays on the board when the piece comes off it */
.mcb-p.lift::before { transform: translateY(5px); opacity: 0.55; }
/* (THE HINT DOT IS GONE. It marked the one legal target the moment the rook came up, which
   on a fixed position was a nudge and on a random one is THE ANSWER. Nothing replaces it:
   "mark it right or wrong" is the whole interaction now.) */
/* the two marks, and they are the only feedback the board gives */
.mcb-sq.bad  { box-shadow: inset 0 0 0 3px rgba(255,110,110,0.8); }
.mcb-sq.good { box-shadow: inset 0 0 0 3px rgba(107,255,184,0.85); }
.mcb-p.mated { color: #ff6e6e; }
.mcb-say { margin: 14px 0 0; text-align: center; color: var(--fd-ink-2); font-size: 0.9rem;
  min-height: 2.6em; }
/* the prompt's emphasis is MAPLE, not gold - gold on this page means "the button", and a
   bolded phrase in the same color as the CTA quietly competes with it.
   ⚠ --fd-wood-INK, not --fd-wood: this is TEXT sitting on the translucent sheet, and the
   decorative walnut measures 2.88:1 there against a night sky (4.01 even at the old 0.85
   alpha — it was failing AA before the transparency pass, not because of it). */
.mcb-say b { color: var(--fd-wood-ink); }
/* ⚠ THE VERDICT COLORS ARE NOT THE ONES THE DARK PAGE USED. #6bffb8 is a mint drawn for a
   near-black card; on the warm-white sheet it measures under 2:1 and the word "Correct."
   disappears. Both marks are re-inked for paper here — the SQUARE keeps the bright ring,
   because a 3px ring on maple is not text and does not have to clear 4.5:1. */
.mcb-say.good b, .mcb-say.good { color: #1f7a4d; }
.mcb-say.miss b, .mcb-say.miss { color: #a3323b; }
.mcb-ready { display: block; margin-top: 4px; color: var(--fd-ink-3); font-size: 0.72rem;
  font-family: 'Share Tech Mono', monospace; }

/* THE OFFER after the move (2026-07-29, widened 2026-08-04) — a door, not an escort. Wood
   and ink only: this is the one moment a second call to action exists on the page, and it
   earns its place by never being visible until you've already done something. Not gold.
   ⚠ IT NOW APPEARS ON A MISS TOO, which is the point of the rewrite: a wrong guess used to
   leave a visitor holding a position they had already failed, with nowhere to go. */
.mcb-offer { display: flex; flex-wrap: wrap; justify-content: center; align-items: stretch;
  gap: 10px; margin-top: 10px; }
.mcb-offer[hidden] { display: none; }
.mcb-next { display: inline-flex; align-items: center; gap: 12px; margin: 0;
  padding: 10px 18px; border-radius: 999px; text-decoration: none; text-align: left;
  color: var(--fd-ink); background: var(--fd-panel-hi);
  border: 1px solid var(--fd-grain);
  animation: mcbNextIn .34s cubic-bezier(.2,.9,.3,1.2) both;
  transition: transform .14s ease, border-color .14s ease, background .14s ease; }
/* ⚠ "Another puzzle" IS A <button>, because it acts on this page instead of navigating —
   and a button brings its own agenda: the UA font, a system border and a default padding
   that a shared `.mcb-next` rule does not cancel. Reset the three, keep everything else. */
.mcb-next { font: inherit; cursor: pointer; }
.mcb-next-txt { display: block; }
.mcb-next b { display: block; font-size: 0.95rem; font-weight: 800; line-height: 1.25; }
.mcb-next small { display: block; color: var(--fd-ink-3); font-size: 0.76rem; line-height: 1.3; }
.mcb-next i { font-style: normal; color: var(--fd-wood); font-size: 1.1rem;
  transition: transform .14s ease; }
.mcb-next:hover { text-decoration: none; transform: translateY(-2px);
  border-color: var(--fd-wood); background: var(--fd-panel); }
.mcb-next:hover i { transform: translateX(3px); }
/* the room is the quieter of the two: dealing another puzzle keeps you here, which is what
   the page wants, so leaving is offered rather than urged */
.mcb-next--room { background: transparent; border-color: var(--fd-rule); }
.mcb-next--room:hover { background: var(--fd-panel-hi); }
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
   site this is said it second. The title lands first now — it is outside the card
   entirely (`title_outside`), with the tagline beside it — and the board sits directly
   under it, with the Play Now door under the board.

   ⚠ THE WRAPPER DIV IS GONE, AND SO IS `display: contents`. The hero used to hold a
   `.mc-hero-copy` block with a title, a lede and a button in it, and dissolving that
   block was the only way the board could slot BETWEEN two of its children. Two of the
   three have since left the card, so the hero is two items in source order and the
   whole trick — plus the `gap: 0` it forced, plus the note about the 80px of air it
   would otherwise have added — is unnecessary. `order` on the board is the entire
   mobile layout now. If a second thing ever returns to the left column, read this
   paragraph before reaching for `display: contents` again.

   `gap` still goes to zero: the elements carry their own spacing, and a 32px grid gap
   between a board and the door under it is a hole on a 390px screen. */
@media (max-width: 760px) {
  .mc-hero { grid-template-columns: 1fr; gap: 0; }
  .mc-board { order: -1; }
  /* the board's own breathing room, now that no gap supplies it — and no title above it
     inside the card, so it carries its own top step instead of borrowing the title's. */
  .mc-board { min-height: 0; padding: 0 0 var(--space-4, 16px); }
}

/* SECTION HEADS — quiet; the button is the loud thing */
/* Section heads are MAPLE and quiet. They used to be gold - which meant the page had a
   gold heading, a gold button, gold door icons and a gold arrow, and "the one gold thing"
   was a rule the page broke four times over. The rule under it is the theme's hairline,
   not the site's purple h2 border (switched off in _pjcc-25-front-door.scss). */
/* ⚠ --fd-wood-INK, not --fd-wood — this heading is TEXT on the translucent sheet. The
   decorative walnut measured 4.01:1 here even at the old 0.85 alpha, a real AA miss that
   predates the transparency pass and was found by re-measuring for it. */
.mc-h2 { color: var(--fd-wood-ink); font-size: 0.92rem; letter-spacing: 0.16em; text-transform: uppercase;
  font-family: 'Share Tech Mono', monospace; font-weight: 400;
  margin: 0 0 var(--space-4, 16px); padding-bottom: 10px;
  border-bottom: 1px solid var(--fd-rule); }

/* FOUR DOORS — explicit 4 / 2x2 / 1, never auto-fit. auto-fit put THREE across at the
   real content width and orphaned Academy on a row of its own; four doors want to read as
   a set, and 2x2 is the honest fallback. (Content width varies with the docked rail, so
   "it fits at 1280" is not something to design around.) */
.mc-doors { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-3, 12px); margin: 0 0 var(--space-7, 44px); }
/* ⚠ 2x2 GOES ALL THE WAY DOWN — there is no 1-up breakpoint, and that is the point
   (2026-08-04). The four doors used to stack single-file below 520px, which cost 781px of a
   390px phone: a column of four full-width cards that a thumb scrolls past one at a time.
   The set stopped reading as a set exactly where the screen was smallest.

   That contradicted the rule written directly above — four doors want to READ AS A SET, and
   2x2 is the honest fallback. 2x2 was already the layout from 520 to 1080px; the phone was
   the one width where the page gave up on it.

   MEASURED on the live page at 390x844: the door grid goes 781px → 467px and the whole page
   2481px → 2167px, which is 2.94 screens → 2.57. It matters because of WHAT sits below the
   doors: the three facts (`sky_note` — free, no account, works offline) close the page out on
   the sky, and they are the first thing a parent actually wants to know. They landed at screen
   2.72 and they land at 2.34 now. Nothing moved relative to anything else and nothing was
   reworded — the page in front of them just got shorter.

   Rendered before shipping: the longest sub-label ("One move wins. Miss it and it shows you
   why.") wraps to three lines at this width, and the Gauntlet's arch still lines up with the
   other three titles because `.mc-door-ico` pins the art block to 71px on all four. */
@media (max-width: 1080px) { .mc-doors { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
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
/* THE ART BLOCK IS A FIXED HEIGHT ON ALL FOUR (2026-08-04) — because one of them is no
   longer a 26px glyph. The Gauntlet's arch is 60px tall with a row of pips under it, and grid
   stretches the cards to match, so without a shared height the other three titles sat 45px
   HIGHER than the Gauntlet's and the row read as four unrelated boxes. Measured: titles at
   y=726 / y=771 before, level after. The glyphs are centered in the band rather than pinned to
   its top, so the extra room reads as breathing space instead of as a gap. */
.mc-door-ico { display: flex; align-items: center; min-height: 71px;
  font-size: 30px; line-height: 1; color: var(--fd-wood); margin-bottom: 10px; }
/* ⚠ `> b`, NOT ` b` — AND THAT ANGLE BRACKET IS THE WHOLE FIX FOR THE GAUNTLET GLYPH.
   `.gdoor-glyph` is a <b> too, and it lives inside this card. `.mc-door b` is (0,1,1) and
   `.gdoor-glyph` is (0,1,0), so the door's piece lost its accent color to --fd-ink and its
   size to 1.05rem — a near-black smudge in a brass arch, on the one card that exists to show
   the door. Nothing errored; it just quietly painted the wrong color. Direct-child selectors
   here mean any art a card ever carries keeps its own styling. */
.mc-door > b { display: block; color: var(--fd-ink); font-size: 1.05rem; margin-bottom: 5px; }
.mc-door > small { display: block; color: var(--fd-ink-3); font-size: 0.84rem; line-height: 1.55; }

/* ══ THE LEAD DOOR — the one primary thing (2026-08-04) ═══════════════════════════
   It is `.mc-door` first and `.mc-lead` second, so it IS one of the boxes and inherits every
   one of their rules; this class only says how it is MORE. Four ways, and no more than four —
   add a fifth and the two stop reading as the same object:

     1. it is GREEN.    The only filled color on the page (the old pill's --fd-go, kept).
     2. it is BIGGER.   More padding, a larger title, a larger icon.
     3. it has an ARROW. None of the paper doors do.
     4. it sits ABOVE.  In the hero, on the tabletop, beside the board.

   ⚠ IT MUST STAY BELOW THE `.mc-door` RULES IN THIS FILE. `.mc-lead:hover` and
   `.mc-door:hover` are both (0,2,0), so the winner is whichever is written last — put this
   block above them and the green card turns paper-colored the moment you touch it. Written
   here, next to what it extends, for that reason and not only for readability.

   ⚠ `.mc-door.mc-lead`, not `.mc-lead`, on the one rule that sets `color`. The theme file
   carries `body.theme-chess .mc-door { color: var(--fd-ink) }` at (0,2,0) — a bare `.mc-lead`
   is (0,1,0) and loses, and every child without its own color would inherit near-black onto
   green. Matching specificity lets document order decide, and this <style> is in the body.

   The 2026-07-29 lesson outlives the pill and is why there is no `filter` here: THE HOVER
   GOES DEEPER, NEVER BRIGHTER. The old gold button got lighter under the cursor, so the
   loudest thing on the page turned up when you reached for it.

   Contrast on the green, all measured: white is 5.07:1 on --fd-go (AA), and the title is
   large and bold on top of that. THE SUB-LABEL IS WHITE AT 0.94 AND THAT IS A FLOOR, NOT A
   TASTE — 0.88 is the obvious "soften it a little" value and it measures 4.32:1, a real AA
   failure on the one card the whole page points at. 0.90 is 4.45 and still short. 0.94 is
   4.68. Do not turn it down. */
.mc-door.mc-lead { background: var(--fd-go); border-color: var(--fd-go); color: #ffffff;
  padding: 24px 22px 26px; box-shadow: 0 10px 26px rgba(46, 125, 71, 0.22); }
/* the paper doors wear a wood hairline along the top; on the green one it would read as mud */
.mc-lead::before { background: rgba(255, 255, 255, 0.55); opacity: 0.8; }
.mc-lead .mc-door-ico { color: #ffffff; font-size: 32px; margin-bottom: 12px; }
.mc-lead > b { color: #ffffff; font-size: 1.5rem; letter-spacing: -0.01em; margin-bottom: 6px; }
.mc-lead > small { color: rgba(255, 255, 255, 0.94); font-size: 0.9rem; }
/* the lead card has no neighbors to line up with, so it keeps a tight art block */
.mc-lead .mc-door-ico { min-height: 0; }
/* the arrow clears the title's line, not the card's corner — `right`/`top` are absolute
   against the card, which is `position:relative` already (`.mc-door`) */
.mc-lead-arw { position: absolute; right: 20px; top: 24px; font-size: 1.3rem; line-height: 1;
  color: #ffffff; transition: transform .14s ease; }
.mc-lead:hover { background: var(--fd-go-2); border-color: var(--fd-go-2);
  box-shadow: 0 14px 30px rgba(46, 125, 71, 0.28); }
.mc-lead:hover::before { opacity: 1; }
.mc-lead:hover .mc-lead-arw { transform: translateX(4px); }
/* the title runs under the arrow at narrow column widths without this */
.mc-lead > b, .mc-lead > small { padding-right: 26px; }

/* ══ THE GAUNTLET DOOR, IN THE BOX (2026-08-04) ═══════════════════════════════════
   The LOOK is _sass/_pjcc-21-gauntlet-door.scss and nothing here touches it — that partial
   is the single source for every copy of this door on the site ([[gauntlet-door-one-file]]),
   and a fourth hand-maintained twin is the exact failure this page must not repeat. What is
   below is only SIZE, PLACEMENT and the two things that change because the door is standing
   on white paper for the first time.

   SIZE: 46×60, down from the canonical 78×100. The four boxes are one row and grid stretches
   them to the tallest, so a full-height door would have added ~70px to all four. At 46×60 the
   row grows by about the difference between a 26px glyph and a small lit doorway, which is
   what this is.

   ⚠ THE PIPS ARE INVISIBLE ON PAPER WITHOUT THE OVERRIDE. `.gdoor-pips i` is
   rgba(255,255,255,0.14) — a white dot at 14% on a dark hall panel. On a #f7f5f0 card that is
   white on white: ten climbed floors would show as nothing at all. Re-inked to a dark
   translucent so "done" (mint) and "current" (the accent) still read against their neighbors.

   ⚠ THE WHISPER IS NOT IN THE MARKUP HERE. `.gdoor-whisper` is absolutely positioned at
   `top: calc(100% + 5px)`, which on the hall's standalone door is empty air and inside this
   card is directly on top of the words "The Gauntlet". The card says what it is in plain text
   already, so the hover caption has nothing to add — it is omitted rather than hidden. */
.mc-door--gauntlet .gdoor { align-items: flex-start; gap: 7px; margin-bottom: 10px; }
.mc-door--gauntlet .gdoor-arch { width: 46px; height: 60px; border-radius: 23px 23px 3px 3px; }
.mc-door--gauntlet .gdoor-door { border-radius: 19px 19px 0 0; }
/* ONE size, and floor one no longer needs its own (2026-08-04). It used to take TWO rules
   here, and the second was a specificity fight: the partial's `.gdoor[data-grand="0"]
   .gdoor-glyph` is (0,3,0) — an attribute selector counts in the class column — so a
   two-class override lost and floor one's piece rendered at its full 26px inside a 46px arch.
   The partial expresses floor one as a `scale()` of whatever size the caller sets now, so
   this single line carries every floor and the fight is gone. 19px is the partial's own 32,
   scaled by 46/78 — the ratio the arch itself was scaled by. */
.mc-door--gauntlet .gdoor .gdoor-glyph { font-size: 19px; }
.mc-door--gauntlet .gdoor-pips { gap: 2px; }
.mc-door--gauntlet .gdoor-pips i { width: 4px; height: 4px; background: rgba(30, 35, 44, 0.18); }
/* ⚑ HOVERING THE CARD OPENS THE DOOR — AND NOT ONE TRANSFORM LIVES HERE (2026-08-04).
   Ten floor-specific open rules stood in this block for a few hours, hand-copied out of the
   partial so the whole card would be the hover target instead of just the 46px arch. Nate,
   the same day: "remember to always make the door uniform inside the Gauntlet and any other
   page the doors exist. Uniform is key." He is right, and those ten lines were a twin the
   moment they were written — the exact drift [[gauntlet-door-one-file]] exists to prevent.

   The partial owns it now. `.gdoor-host` is a fifth trigger in its shared `gd-open` mixin, so
   ANY container can declare itself the door's hover target and inherit every floor treatment,
   every open distance and every future floor for free. The card wears the class; that is the
   whole integration. If a door ever opens differently here than in the games hall or inside
   the game, the bug is in the partial, and fixing it fixes all four at once. */

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

/* (THE STUDIO BAND'S CSS WENT WITH ITS MARKUP — 2026-08-04, "take the working lamp off the
   main page and leave it on the PJCC page." `.mc-studio`, `.mc-lamp`, their placement block,
   `.mc-studio-copy` and `.mc-studio-label` all came out together, and so did the blog-line
   rules the pass before them. The desk plank's tuned offsets did NOT die with them — they
   were the one thing here worth keeping, and they moved to `.awake-lamp` in _layouts/home.html
   so /pjcc/ gets the base he asked for. Restore the whole band from git if it returns.) */

@media (prefers-reduced-motion: reduce) {
  .mc-door, .mc-world { transition: none; }
}
</style>

<script>
/* ══ THE BOARD IS THE BUTTON — a random puzzle, and the grading ══════════════════════
   ⚑ REWRITTEN 2026-08-04. Nate: "The puzzle on the home page should be completely random
   and there should not be a description. Whether they are wrong or right is fine, mark it
   right or wrong and then offer more puzzles. Besides, 'the back rank was the whole board'
   makes no sense."

   THE THREE THINGS THAT CHANGED, and the one that did not:

   1. RANDOM. The pool below is generated by tests/gen-front-puzzles.js, which builds random
      positions and keeps only the ones the site's own perft-verified referee certifies as a
      UNIQUE mate in one. Every entry is 'board from-index to-index'. The page never reasons
      about chess — it compares two integers — so the front door still carries no engine, and
      the only promise it makes about the position is one the referee actually made.
      ⚠ NEVER HAND-EDIT THE POOL. `npm run gen:puzzles` rewrites it between the sentinels.

   2. NO DESCRIPTION. Every line of prose is gone. The win used to say "the back rank was the
      whole board" — written for the ONE hard-coded position, nonsense for a random one, and
      a stretch even there — and a miss used to explain what the king would do next. The board
      says "White to play. Mate in one." before, and "Correct." or "Not quite." after. Those
      two are the marks he asked for, and nothing narrates them.

   3. ONE ATTEMPT, THEN THE OFFER. A miss used to bounce and let you keep guessing at the same
      position forever. "Whether they are wrong or right is fine" — so a completed move is
      graded either way, and both verdicts lead to the same place: another puzzle.

   WHAT DID NOT CHANGE: nothing here is needed to SEE the board. The 64 squares are static
   markup and the board is a fixed square, so the men arriving cannot shift the page — the
   worst case is a checkerboard for one frame. Open /?ready=1 for the real number. */
(function () {
  var t0 = (window.performance && performance.now) ? performance.now() : 0;
  var board = document.getElementById('mcb'), say = document.getElementById('mcb-say');
  var men = document.getElementById('mcb-men'), offer = document.getElementById('mcb-offer');
  if (!board || !say || !men) return;

  /* ══ POOL — GENERATED, DO NOT EDIT BY HAND · npm run gen:puzzles ══ */
  var POOL = [
    '2N4k/8/2K3R1/6p1/2B5/8/4p3/4R3 60 63', '4nk2/5p2/8/3K4/7B/5Q2/5R2/8 45 13',
    '3QB3/7p/7k/8/1q6/7K/8/8 3 21', '8/2N5/8/1Q6/8/2K5/8/2k5 25 61',
    '8/5Bb1/7k/6p1/K7/2B5/3R4/8 51 55', '4q3/5B2/2Bp3k/1K6/2B3Q1/8/r2q4/8 38 22',
    '1k6/1p6/8/1N5K/4Q3/5n2/8/8 36 4', '6rq/3r4/8/8/8/6BR/Q4p2/1K3kN1 48 53',
    '4B3/8/2Q2rR1/4p3/7k/6p1/4K3/8 18 63', '4k3/1R3r2/1N4K1/8/8/5PQ1/8/8 46 1',
    '5R2/7k/3B4/2R3pK/8/8/8/8 26 10', 'bB1k2q1/2p4Q/6N1/8/4R2K/8/8/8 15 10',
    'B7/1Q6/7P/5K1k/8/3P4/8/8 9 63', '2k5/5Q2/3P4/7K/8/8/8/8 13 10',
    '4k3/4p3/4K3/7n/1R3B2/8/8/8 33 1', '8/8/8/2Q5/8/8/8/K4k1N 26 53',
    '1k6/7B/1PB4p/3q4/Q7/8/2n1b2K/8 32 0', '1R6/5K2/8/k3r3/8/pr6/5Q2/8 53 8',
    'R3K2k/8/8/6N1/8/2R5/1p6/8 4 13', '1k4N1/6Q1/8/N7/3K4/8/8/8 14 9',
    '1B6/8/N5K1/6Q1/8/7k/8/8 30 46', '8/8/7b/3n4/4RR2/k7/2K5/3N4 36 32',
    'q2R4/8/8/8/5n2/4R3/7K/5kB1 3 59', '7k/8/8/8/2R5/8/3K4/6R1 34 39',
    '8/8/8/R7/5KR1/N7/7k/B7 24 31', '4kn2/6Q1/5K2/4p3/8/2p1B3/1N1B4/8 14 12',
    '7k/5KN1/3R4/8/8/7B/8/8 19 23', 'nK6/5n1k/q6N/7N/8/p7/P7/Q7 56 14',
    '8/8/1B6/8/2K3N1/k3N3/8/6Q1 62 56', '8/1K6/8/8/5RP1/P7/6Q1/2k5 37 61',
    '8/8/k7/2Q4r/8/8/4qBK1/8 26 17', '3B4/1Q6/8/8/8/1B6/K7/2k5 3 30',
    'k7/6NB/1K6/8/3R4/4B3/8/8 35 3', '1B1Q4/B5K1/7n/8/8/8/8/7k 3 27',
    'K7/8/8/6b1/8/6n1/1P2RB1Q/5k2 52 60', '2Q5/k7/8/1p6/8/8/5K2/2B5 58 44',
    '3k1q2/8/2P1Q3/1q6/8/8/7K/8 20 11', '8/k7/8/8/2K5/8/2R5/1Q6 50 48',
    'k7/7Q/6KQ/8/8/8/8/8 23 5', '7K/7B/1N1P4/8/8/7Q/7p/7k 47 61',
    '1k6/1p6/1K6/8/8/n4p2/8/R6Q 63 7', '5N1r/8/8/6pk/8/7N/K6R/8 47 53',
    'k7/1p4K1/8/B7/8/4pN2/8/Q7 24 10', '2rk4/1p3Q2/2B4N/n7/8/8/2K5/8 13 11',
    '8/7k/5QR1/4K3/8/8/2n5/5N2 21 14', '8/5K1k/1PN5/8/4N3/8/6R1/8 54 55',
    '1K1Q3b/N7/k7/7p/8/r7/6B1/8 54 9', '5B2/1K6/8/8/8/1RN5/8/k7 41 57',
    '8/8/3Q4/7N/8/K7/8/1k6 19 59', '6k1/1Q6/5K2/8/5N2/8/8/8 9 14',
    '1k5B/8/1K6/4R3/8/8/6N1/8 28 4', '8/2q3Q1/8/6P1/N7/7B/8/1k4K1 14 49',
    '5R1Q/3rk3/8/8/8/b2N3K/2p5/8 7 21', '5B2/4NK1k/8/8/8/8/1R6/4n3 49 55',
    '7k/8/5pKp/8/2R5/8/8/B7 34 2', '3k2K1/6R1/Q1p4B/8/8/8/5p2/4q3 16 0',
    '2k5/1p2b3/p3N3/4Q3/8/8/8/K7 28 10', '2B5/8/8/8/1N5k/8/7K/3Q4 59 38',
    '8/n7/7P/8/p7/3Q2K1/P7/5q1k 43 61', '7k/1N5p/8/1r6/1Q6/7K/8/8 33 5',
    '4k3/2K5/3B4/8/8/1P3R2/8/8 45 5', 'Q2K4/7q/8/2q5/5N2/8/7k/8 0 54',
    '7Q/8/3B4/8/8/6K1/8/6k1 7 56', '8/4N3/k1KP4/8/1B6/7R/8/8 47 40'
  ];
  /* ══ END POOL ══ */

  /* ONE GLYPH PER PIECE TYPE, BOTH COLORS. The chess canon draws white and black from the
     same filled set and separates them by fill and stroke, which is the whole reason every
     board on this site looks like one board ([[chess-visual-canon]]). Do not "correct" these
     to the outline code points — .mcb-p.w would then be an outline glyph with an outline
     stroke painted on it. */
  var GLYPH = { K: 9818, Q: 9819, R: 9820, B: 9821, N: 9822, P: 9823 };

  var cur = null, sel = -1, done = false;

  function tell(html, good, bad) {
    say.innerHTML = html;
    say.classList.toggle('good', !!good);
    say.classList.toggle('miss', !!bad);
  }

  /* DEAL — repaint the men from a random pool entry and reset every mark. Called once at
     load and again for every "Another puzzle": the whole pool is already on the page, so
     dealing is a string split and one innerHTML, with nothing fetched and nothing to wait for. */
  function deal() {
    cur = POOL.length ? POOL[(Math.random() * POOL.length) | 0].split(' ') : null;
    sel = -1; done = false;
    if (offer) offer.hidden = true;
    var marked = board.querySelectorAll('.mcb-sq.bad, .mcb-sq.good');
    for (var m = 0; m < marked.length; m++) marked[m].classList.remove('bad', 'good');
    if (!cur) { men.innerHTML = ''; return; }

    /* the board half of a FEN, walked left to right, top to bottom. Index r*8+f is the same
       numbering the referee uses (0 = a8), which is what lets the answer travel as two ints. */
    var rows = cur[0].split('/'), h = '';
    for (var r = 0; r < 8; r++) {
      var f = 0, row = rows[r] || '';
      for (var c = 0; c < row.length; c++) {
        var ch = row.charAt(c);
        if (ch >= '1' && ch <= '8') { f += +ch; continue; }
        var up = ch.toUpperCase(), white = (ch === up);
        h += '<b class="mcb-p ' + (white ? 'w' : 'b') + '" data-sq="' + (r * 8 + f) + '"' +
             ' data-pc="' + ch + '"' + (white ? ' data-mine="1"' : '') +
             ' style="grid-area:' + (r + 1) + '/' + (f + 1) + '">&#' + GLYPH[up] + ';</b>';
        f++;
      }
    }
    men.innerHTML = h;
    tell('White to play. <b>Mate in one.</b>');
  }

  function lift(sq) {
    var held = men.querySelector('.mcb-p.lift');
    if (held) held.classList.remove('lift');
    sel = sq;
    if (sq < 0) return;
    var n = men.querySelector('.mcb-p[data-sq="' + sq + '"]');
    if (n) n.classList.add('lift');
  }

  /* ONE LISTENER ON THE BOARD, and the men layer is inert except for White's pieces
     (.mcb-men is pointer-events:none; `.mcb.live .mcb-p[data-mine]` opts back in). So a click
     on a BLACK piece falls through to the square underneath it, which is what makes "capture
     that piece" expressible with no extra code — and on a random pool the answer is a capture
     often enough that this is not a nicety. */
  board.addEventListener('click', function (e) {
    if (done || !cur || !e.target.closest) return;

    var mine = e.target.closest('.mcb-p[data-mine]');
    if (mine) {                                  /* pick a piece up, or put the same one down */
      var at = +mine.getAttribute('data-sq');
      lift(at === sel ? -1 : at);
      return;
    }

    var sq = e.target.closest('.mcb-sq');
    if (!sq || sel < 0) return;
    var id = +sq.getAttribute('data-sq');
    if (id === sel) { lift(-1); return; }

    /* ── THE VERDICT. Two integers, and no opinion about chess. ── */
    done = true;
    if (sel === +cur[1] && id === +cur[2]) {
      var moving = men.querySelector('.mcb-p[data-sq="' + sel + '"]');
      var taken  = men.querySelector('.mcb-p[data-sq="' + id + '"]');
      if (taken && taken !== moving) taken.parentNode.removeChild(taken);
      if (moving) {
        moving.classList.remove('lift');
        moving.setAttribute('data-sq', id);
        moving.style.gridArea = (((id / 8) | 0) + 1) + '/' + ((id % 8) + 1);
      }
      var king = men.querySelector('.mcb-p.b[data-pc="k"]');
      if (king) king.classList.add('mated');
      sq.classList.add('good');
      /* NO TIMER, NO location.href (2026-07-29) — the reward for being right is that the
         position STAYS on the screen. The offer below is a door, never an escort. */
      tell('<b>Correct.</b>', true);
    } else {
      /* ── wrong, and that is a fine place to end up. No refutation, no lesson, no reveal:
         he asked for a MARK. The offer appears either way. ── */
      lift(-1);
      sq.classList.add('bad');
      tell('<b>Not quite.</b>', false, true);
    }
    if (offer) offer.hidden = false;
  });

  var again = document.getElementById('mcb-again');
  if (again) again.addEventListener('click', function () { deal(); });

  deal();
  /* Nothing above this line was needed to SEE the board — only to fill it and touch it. */
  board.classList.add('live');
  var ms = ((window.performance && performance.now) ? performance.now() : 0) - t0;
  var since = (window.performance && performance.now) ? Math.round(performance.now()) : 0;
  try {
    if (new URLSearchParams(location.search).has('ready')) {
      var n = document.createElement('span');
      n.className = 'mcb-ready';
      n.textContent = POOL.length + ' positions · board live ' + since +
                      'ms after page start · dealing + wiring took ' + ms.toFixed(1) + 'ms';
      say.appendChild(n);
    }
  } catch (e) {}
})();
</script>

<script>
/* ══ THE GAUNTLET DOOR, HYDRATED ═════════════════════════════════════════════════════
   2026-08-04, Nate: "add the APPROPRIATE gauntlet door to the gauntlet box."

   The door in the card is already painted — arch, leaf, seam, all static markup, exactly
   like the board above it. This only tells it WHICH floor it is standing at, from the climb
   saved on this device, so the leaf hanging in the arch belongs to the room you are about
   to walk into. Nothing here is required for the card to work or for the link to open; if
   this script never runs, a first-time visitor's door is what everyone sees.

   ⚠ THE THREE TABLES BELOW ARE A COPY, and there is no way around it. They mirror the
   LADDER in assets/games/pjcc_gauntlet.html, and games.md carries the same three arrays for
   the same reason — the game is a standalone HTML file that shares no module with the site.
   Keep all three in sync. (The door's LOOK is not duplicated: that is one partial,
   _sass/_pjcc-21-gauntlet-door.scss, and this page loads it like every other page does.)

   ⚠ NO WHISPER HERE. The hall's copy appends a "Floor N of 10" caption under the door and
   also onto the aria-label; the caption would land on top of the card's own words, so the
   fact goes to the aria-label only. A screen reader still hears which floor is next. */
(function () {
  var NAMES = ['The Checker Town Open Champion','The Sand-Mine Foreman','The Tidecaller','The Shogi Sentinel','The City Gatekeeper','The Auditor','The Enforcer','The Vice President','The Heir Apparent','The Executive Assistant'];
  var ACCENTS = ['#8fe3ff','#fcbc3c','#56d0ff','#fcbcb0','#ffb066','#3fae7a','#ff6b6b','#c79bff','#ff9ec9','#f5c518'];
  var GLYPHS  = ['♟','♟','♝','♞','♜','♝','♜','♝','♛','♛'];
  var door = document.getElementById('gauntlet-door');
  if (!door) return;
  var prog = {}; try { prog = JSON.parse(localStorage.getItem('pjcc.gauntlet.v2')) || {}; } catch (e) {}
  var beaten = prog.beaten || {}, cleared = 0, cur = NAMES.length;
  for (var i = 0; i < NAMES.length; i++) { if (beaten[i]) cleared++; }
  for (var j = 0; j < NAMES.length; j++) { if (!beaten[j]) { cur = j; break; } }

  /* the arch grows richer with the climb; the leaf belongs to the next floor */
  var gd = door.querySelector('.gdoor');
  if (!gd) return;
  gd.setAttribute('data-grand', cleared === 0 ? 0 : cleared <= 2 ? 1 : cleared <= 4 ? 2 : cleared <= 6 ? 3 : cleared <= 9 ? 4 : 5);
  if (cur < NAMES.length) gd.setAttribute('data-floor', cur + 1);

  var pipHost = document.getElementById('gdoor-pips');
  if (pipHost) { var h = '';
    for (var k = 0; k < NAMES.length; k++) { h += '<i class="' + (beaten[k] ? 'done' : (k === cur ? 'cur' : '')) + '"></i>'; }
    pipHost.innerHTML = h; }

  var floorLine = cur >= NAMES.length ? 'Crowned — 10 of 10' : 'Floor ' + (cur + 1) + ' of 10';
  door.setAttribute('aria-label', door.getAttribute('aria-label') + '. ' + floorLine + '.');

  var glyph = document.getElementById('gdoor-glyph');
  if (cur >= NAMES.length) {
    door.setAttribute('href', door.getAttribute('href') + '#tower');
  } else {
    if (glyph) glyph.textContent = GLYPHS[cur] || '♟';
    if (cleared > 0) {
      gd.style.setProperty('--acc', ACCENTS[cur] || '#F5C518');
      door.setAttribute('href', door.getAttribute('href') + '#climb');
    }
  }
})();
</script>
