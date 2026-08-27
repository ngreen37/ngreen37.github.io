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
# The <h1> is the brand LOCKUP, not plain text (2026-08-08, "spice up the text and style on
# ChessWild.com"). `title:` above is untouched and is still what the tab, og: and the JSON-LD
# carry — see the note in _layouts/page.html and the design in _includes/wordmark.html.
wordmark: true
# The three words stand BESIDE the title, out on the sky (2026-08-04, Nate: "put the tagline
# play.solve.learn near ChessWild.com"). They used to be the first line inside the card; the
# name and its tagline are one lockup, and splitting them across the card's edge meant the
# sheet opened on a fragment of a thought. Proper caps are his call too, same batch.
tagline_outside: Play. Solve. Learn.
# ...and the three facts close the page from OUTSIDE it (same batch: "put free · no account ·
# works offline below the white box and into the blue"). Printed by _layouts/page.html after
# the card — see the note there for why it can't be done from inside the page.
# ⛑⛑ THE FLICKERING "i" LIVES IN "OFFLINE" NOW — 2026-08-26. Nate: "let's move it to the cw
# main page at the bottom. Works Offline. Use the 'i' in that."
#
# It had been homeless since 2026-08-25, when the P&JCC card came off /projects/ and took its
# host sentence with it. That left /classified/ → /archive/ → /recovery/ → /dispatch/ with NO
# entrance at all — the ✦ night star had been demoted from <a> to <b> hours earlier, on the
# reasoning that "the i moved to a public page and the star stands down". Then the public page
# lost the i. This closes that loop.
#
# ⭐ IT IS A BETTER HOST THAN THE ONE IT LEFT. This is the last line on the front door, standing
# on the sky under the card, and it is the site's plainest promise — so the door is hidden
# inside the sentence a stranger is most likely to actually read, on the page everyone lands on.
#
# ⚠⚠ THE MARKUP LIVES IN THE FRONT MATTER because `sky_note` is printed by _layouts/page.html
# as `{{ page.sky_note }}` — Liquid does not escape, so HTML here renders as HTML. Front matter
# is YAML, not markdown, so kramdown never touches it ([[markdown-eats-scripts]] does not apply).
# SINGLE-QUOTED on purpose: the value carries double quotes, and a plain scalar that happens to
# parse today is one edit away from not parsing. `sky_note` is used by this page and no other.
#
# ⚠ THE LETTER IS NOT LOST TO A SCREEN READER: the visible "i" is inside an `aria-hidden`
# anchor and an `.sr-only` twin carries it, so the line still reads "Works Offline". Same
# pattern the original used — copy it if this ever moves again.
# ⚠ THE RULES THAT DRIVE IT ARE AT THE FOOT OF THIS FILE, next to `.page-note-out`. Moving this
# markup WITHOUT them ships a plain, permanently visible "i" and no door — that is exactly how
# the 08-25 move broke, and it broke silently.
sky_note: 'Free · No Account Required · Works Offl<a class="tg-x" href="/classified/" tabindex="-1" aria-hidden="true"><i class="tg-x-glyph">i</i></a><i class="sr-only">i</i>ne'
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
     reads "From McPuppy Studios". (The third name used to appear down at the foot too, in a
     card that opened /pjcc/ — that came off 2026-08-25; see the note where it stood.)
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
     the point. Measured 2026-07-28 on the live P&JCC home: 29 animating elements / 14
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
{%- comment -%} ══ HEADING COVERAGE (2026-08-13, the accessibility lens of a four-lens sweep)
     The probe found the whole front door carrying exactly TWO headings — `<h1>ChessWild.com`
     out on the sky, and `<h2>More Ways In` over the door grid. Heading ORDER was perfect,
     which is why three previous a11y passes called this page clean: order is what a checker
     measures, and COVERAGE is what a person uses.

     A screen-reader user skims by heading. On this page that skim returned the site's own
     name and one section — the board, the button, the regulars count and the three proofs
     were all inside an unnamed region, so the single most important thing here announced
     itself as nothing at all.

     ⭐ THE FIX IS THE ONE `/pjcc/` ALREADY USES (2026-07-24, same finding one page over): a
     visually-hidden `<h2>` per section, wired with `aria-labelledby` so the region's
     accessible name and its heading are ONE string and cannot drift apart. `.sr-only` is in
     `_pjcc-10-a11y.scss` and predates this — do not re-invent it.
     ⚠ ZERO VISUAL CHANGE, and that is the point: this buys nothing for a sighted visitor and
     it is not supposed to. Verified in a render, not assumed. {%- endcomment -%}
<section class="mc-table" aria-labelledby="h-play">
<h2 id="h-play" class="sr-only">Play Chess Now</h2>
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
         no account, real rules, a real clock.

         ⚑ "McPuppy" → "The Creator" in the subline (2026-08-08, his call). A stranger on the
         front door has no idea who McPuppy is; the third opponent read as a fourth bot name.
         "The Creator" says what it is — the person who built this will play you — and Park
         Tables already uses exactly that phrase on the table itself ("The Creator plays
         back."), so the door and the room now say the same word. {%- endcomment -%}
    {%- comment -%} ══ THE LEFT COLUMN BECAME A STACK (2026-08-11) ═════════════════════════
         Nate: "give me some ideas on how to fill that empty space" → he took two of them, plus
         a third he may pull ("number 4 sounds good too… although I may pull that one").

         The green door had been capped at 480px the same day, which left the column holding one
         card and a lot of parchment. What went in is deliberately NOT more doors — the page
         already has six — but the three things a stranger needs after seeing a green button:
         WHAT HAPPENS IF I PRESS IT (the regulars), WHERE WAS I (only if they have been here),
         and WHY TRUST THIS (the true things, moved up from the foot).

         ⚠ THE WRAPPER IS BACK, AND THE NOTE AT THE BOTTOM OF THIS FILE SAID TO READ IT FIRST.
         It said: "if a second thing ever returns to the left column, read this paragraph before
         reaching for `display: contents` again." Read. `display: contents` was needed when the
         board had to slot BETWEEN two children of a copy block; here all four items travel
         together as one column, so a plain div is correct and `order: -1` on the board is still
         the entire mobile layout. Nothing about the phone changes. {%- endcomment -%}
    {%- comment -%} ⚠ THE ASSIGN LIVES ABOVE THE CARD NOW (2026-08-11, second pass). It used to
         sit beside the paragraph that used it; the count moved INTO the green door, so the
         variable has to exist before the door is written. Liquid is top-to-bottom — an assign
         below its first use renders an empty string and nothing warns you. {%- endcomment -%}
    {%- comment -%} `where: "open", true` and not a nil test — Jekyll's `where` against nil is
         the kind of thing that works until it doesn't, so the data file states `open` on every
         row explicitly rather than leaving it to be inferred from an absent key. {%- endcomment -%}
    {%- assign open_seats = site.data.regulars | where: "open", true -%}
    <div class="mc-lead-col">
    {%- comment -%} ══ THE SUB-LABEL IS THE REGULARS LINE NOW (2026-08-11) ═══════════════════
         Nate: "Put '6 regulars at the tables right now' in the green box replacing 'A person, a
         park...'". So the count is not a line UNDER the button any more — it is what the button
         says about itself, and the stack loses a paragraph.

         ⭐ It is a better sub-label than the one it replaced. "A person, a park regular, or The
         Creator" listed the KINDS of opponent; this states how many are there and implies the
         rest. ⚠ THE COUNT IS DERIVED, NEVER TYPED — `_data/regulars.yml`, gated by
         `npm run test:regulars`, which reads the real `BOTS` object out of the Park Tables page
         and fails if they disagree ([[dead-game-links-trap]]).
         ⚠ "Right now" is literally true and always will be: the regulars run in your browser,
         so they need no server and cannot be away. {%- endcomment -%}
    <a class="mc-door mc-lead" href="{{ '/games/park-tables/' | relative_url }}">
      <span class="mc-door-ico" aria-hidden="true">&#9822;</span>
      <b>Play Now</b>
      {%- comment -%} ⚑ THE SUB-LABEL CAME OFF 2026-08-18 (Nate: "the Play Now doesn't NEED the
           '6 regulars at the table' description"), and it had become actively wrong the same
           day. It said SIX; the bench below it drew EIGHT, because it rendered the locked seats
           too. A sentence counting one number directly above a grid showing another is the kind
           of thing a visitor notices without being able to say why. Both halves are fixed here:
           the words go, and the bench below is now exactly the seats the words used to count.

           ⭐ IT IS THE SAME EDIT HE MADE ON 08-11, ONE LAYER DOWN. That day the regulars
           PARAGRAPH was cut and its headline moved into this sub-label. Now the sub-label is cut
           and its content is the bench — the claim keeps getting shown instead of said. The
           `open_seats` assign above stays: it is what the bench iterates. {%- endcomment -%}
      <span class="mc-lead-arw" aria-hidden="true">&rarr;</span>
    </a>

    {%- comment -%} ══ THE BENCH, DRAWN (2026-08-18) ═════════════════════════════════════════
         Nate asked how to make this page more inviting and use the space better. This is the
         answer to both, and it is deliberately NOT new content.

         ⭐ IT IS THE PICTURE OF A NUMBER THE PAGE ALREADY PRINTS. The green door one line up
         says "N regulars are at the tables right now" and then shows you nobody. Eight seats,
         with names and ratings, turn a claim into a bench you can look at — and the 2026-08-11
         note above this column set the rule this has to satisfy: what goes here answers WHAT
         HAPPENS IF I PRESS IT, and is not another door. This is that question, answered with
         the actual roster instead of a count.

         ⭐ AND IT IS THE THING CHESS.COM CANNOT COPY. Character bots are their ground
         ([[chesswild-competitive-position]]); a bench of people with names, ratings and a
         locked rung above them is a CAST, and the gap has always been continuity.

         ⚠ IT SITS DIRECTLY UNDER THE GREEN DOOR ON PURPOSE. The 08-11 sequence for this column
         is: what happens if I press it → where was I → why trust this. The count lives inside
         the button, so its picture belongs against the button, before the resume line. It also
         means the block a stranger sees FIRST is the one that fills the hole a stranger has:
         `.mc-resume` is hidden until you have been here, so a first-time visitor's column was
         a card shorter than the one Nate was looking at when he asked.

         ⚠⚠ THE LOCKED SEATS CAME OFF ON 2026-08-18, THE DAY AFTER THEY WENT ON. Nate: "few
         people will be able to unlock such strong bots." He is right, and the numbers say how
         right: Princess is behind beating Robert at 1800, and The CEO is behind beating
         Princess at 2100. Two of eight cells were people almost nobody who lands here will
         ever reach — and they were sitting under a green button that said "6 regulars", so the
         page counted six and drew eight. _data/regulars.yml's rule ("a locked seat you can see
         is a reason to keep playing") is a PARK TABLES rule and still holds THERE, where you
         have a ladder and a reason to look up it. On the front door a stranger has neither.
         ⭐ SO THE BENCH IS `open_seats`, THE SAME LIST THE SUB-LABEL USED TO COUNT, and
         the grid IS the claim — nothing left to disagree with.
         ⚑ SEVEN SEATS SINCE 2026-08-19, AND THE SEVENTH IS NOT A RUNG. Nate at 1200 made
         the ladder six; Auston came off it. Six fill the three-column grid exactly and she
         spans the bottom — see `.mc-bench-seat--adapt` below for the measurement, and for
         why that rule has to sit AFTER `.mc-bench-seat > a`.

         ⚠ EVERY SEAT LINKS TO ITS OWN TABLE, not to the hall. Sitting down is a DEPARTURE
         with its own URL (`?table=`), so choosing a face here lands you at that board rather
         than at a picker you have to use twice. The destination family is the green button's,
         so this adds specificity, not a competing call to action.

         ⚠ THE GLYPHS COME FROM THE DATA FILE AND CARRY `&#xFE0E;`. Without the text-presentation
         selector a browser may paint them from its color emoji font, at which case `color` does
         nothing at all and the row lands in whatever hues that font chose — the exact failure
         the drawer icons hit ([[text-clip-glyph-technique]]). `npm run test:regulars` fails the
         build if the selector goes missing, if two seats end up wearing the same glyph, or if
         any of this stops matching the real `BOTS` object in the Park Tables page.
         {%- endcomment -%}
    <div class="mc-bench">
      <p class="mc-bench-h">Who's at the tables</p>
      <ul class="mc-bench-row">
        {%- comment -%} ⚑⚑ ONE SEAT PRINTS A WORD WHERE THE OTHERS PRINT A NUMBER (2026-08-19).
             Nate moved Auston off the ladder — "they are not necessarily 1200 but completely
             adaptive" — and `adaptive: true` in `_data/regulars.yml` is what says so here.
             ⚠ HER 1200 IS STILL IN THE DATA FILE and must never be printed: it is the dial's
             invisible SEED, kept only so the gate can compare this file field-for-field
             against the real BOTS object. Rendering `{{ r.elo }}` for her would put a rating
             on the one seat whose whole point is that it does not have one — and it would be
             a number no game will ever play at. The `title` has to branch too, or the hover
             text says "rated 1200" over a cell that says Adapts. {%- endcomment -%}
        {%- for r in open_seats -%}
        <li class="mc-bench-seat{% if r.adaptive %} mc-bench-seat--adapt{% endif %}">
          <a href="{{ '/games/park-tables/' | relative_url }}?table={{ r.key }}"
             title="{% if r.adaptive %}Sit down with {{ r.name }}{% else %}Sit down with {{ r.name }} — rated {{ r.elo }}{% endif %}">
            <span class="mc-bench-ico" aria-hidden="true">{{ r.icon }}&#xFE0E;</span>
            <span class="mc-bench-n">{{ r.name }}</span>
            <span class="mc-bench-e">{% if r.adaptive %}Adapts to your level{% else %}{{ r.elo }}{% endif %}</span>
          </a>
        </li>
        {%- endfor -%}
      </ul>
    </div>
{%- comment -%} ── the locked branch that used to live here was removed 2026-08-18; see the note
     above. It rendered a padlock cell for Princess and The CEO. Restore from git if the front
     door ever wants an aspiration rung again — but read the note first, because the reason it
     came off was not clutter, it was that the grid disagreed with the count beside it.
{%- endcomment -%}

    {%- comment -%} ── PICK UP WHERE YOU LEFT OFF (his #4) ──────────────────────────────────
         Empty and hidden for a stranger; one sentence for somebody who has been here. It reads
         localStorage DIRECTLY rather than through PJCC — this page loads no profile script, and
         adding one to the front door to print a number would be a poor trade. Signed in, the
         profile mirrors the same values into the same keys, so the line is right either way.

         ⚠ It is deliberately BELOW the green door. Above it, the button would move under a
         returning visitor on every visit as the script fills this in — the one element on the
         page that must never shift. Below, the only thing it pushes is the small print.
         ⚠ Wrapped in its own try/catch: a browser with storage denied gets no line, not a dead
         page ([[down-never-stuck]]). {%- endcomment -%}
    <p class="mc-resume" id="mc-resume" data-href="{{ '/games/fork-in-the-road/' | relative_url }}" hidden></p>

    {%- comment -%} ── THE REGULARS PARAGRAPH IS GONE (2026-08-11) ──────────────────────────
         It shipped this morning as a headline plus a sentence of support, and the sentence was
         the first thing he cut: "Get rid of the description after '6 regulars at the table right
         now'". The headline moved into the green door's sub-label (above) and the paragraph did
         not come with it — the two facts it carried, no account and a real clock, are already
         one tap away and were explaining a claim nobody had disputed. {%- endcomment -%}

    {%- comment -%} ── THE HONEST STRIP, MOVED UP (his #2) ──────────────────────────────────
         These three lines used to close the page out, under the doors. They are PROOFS, and a
         proof does its work next to the ask — so they now stand beside the green button
         instead of 1,600px below it.

         ⚑ CUT AND SHRUNK, same day (Nate: "find a way to make the three points a bit smaller
         and less words"). 34 words → 17, and the type came down a step. What survived is the
         CLAIM plus the shortest thing that makes it checkable; what went was the sentence
         explaining a claim that had already landed — the same rule as the 2026-07-28 "bare
         minimums" pass, applied to the strip that pass never touched.

           was: A perft-verified referee, with Stockfish as a second opinion.
           now: Perft-verified, with Stockfish behind it.
           was: Free, in your browser, forever.       now: Free, forever.
           was: The arcade and the engine cache on first visit.
           now: Cached on first visit.

         ⚠ "Perft-verified" STAYS. It is the one word on the page a chess programmer will
         recognize as a real claim rather than a boast, and shortening it to "verified" would
         cost the whole proof to save two syllables ([[accuracy-above-all]]). {%- endcomment -%}
    <ul class="mc-true">
      <li><b>The chess is real.</b> Perft-verified, with Stockfish behind it.</li>
      <li><b>Every game gets a review.</b> Free, forever.</li>
      <li><b>It works on a plane.</b> Cached on first visit.</li>
    </ul>
    </div>

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
      {%- comment -%} ══ THE RESULT LANDS ON THE BOARD (2026-08-08) ═══════════════════════
           Nate: "can you move all three buttons to show up INSIDE the puzzle box instead of
           below? Similar to how the Gambit altar results pops up. Wouldn't that be a nice
           touch? I think so!" — he is right, and it fixes something real: the offer used to
           push the page 60-odd pixels taller the instant you answered, so being graded MOVED
           everything under the board. Nothing reflows now; the card lands over the position.

           ⚠ THE SCRIM IS DELIBERATELY THIN. The Gambit's is nearly opaque because there is
           nothing behind it worth seeing; here there is — the note on the winning branch has
           said since 2026-07-29 that "the reward for being right is that the position STAYS
           on the screen", and a curtain over the mate would take back exactly that. You can
           read the board straight through this.

           ⚑ THIS IS NOT A DIALOG and must not claim to be. It traps no focus and steals
           none, the page behind it stays usable, and Escape does nothing — `role="dialog"`
           without focus management is a promise to a screen reader that the markup does not
           keep. The verdict is an `aria-live` region instead, which is the honest version:
           it announces itself and the reading order is unchanged.

           ── THE INVITATION, NOT THE ESCORT (2026-07-29, and it still governs) ──────────
           Nate: "Don't automatically go to puzzles when you do the Home Page — but PROMPT
           them to go to puzzles. That'll be REAL nice." Solving used to start a 1.25s timer
           and then move the page out from under you. Being teleported for getting something
           RIGHT is a punishment shaped like a reward: you just did the thing, and the site
           took the room away before you could enjoy it. The win hands you a door instead of
           walking you through it — and now that door arrives ON the board rather than under it.

           ⚑ IT APPEARS ON A MISS AS WELL AS ON A MATE (2026-08-04, Nate: "mark it right or
           wrong and then offer more puzzles"). Before that, a visitor who guessed wrong was
           left holding a position they had already failed with no way forward but the page.

           ⚠ THE SPAN AROUND EACH LABEL IS LOAD-BEARING. `.mcb-next` is an inline-flex row,
           and a flex container ignores `display:block` on its children — unwrapped, the label
           and the sub-label lay out side by side and read as one sentence, which says the
           opposite of what it means. {%- endcomment -%}
      <div class="mcb-offer" id="mcb-offer" hidden>
        <div class="mcb-card">
          <p class="mcb-verdict" id="mcb-verdict" aria-live="polite"></p>
          {%- comment -%} ⚑ TRY AGAIN IS MISS-ONLY (2026-08-08, "can we add a retry button").
               After a mate there is nothing to retry — the position is solved and standing
               there, and offering to replay it would be offering to undo the good news. So
               this one row is hidden on a win, which also keeps his "all three buttons"
               literally true there. See `paint()` for why retry cannot corrupt the board:
               it re-paints the position from the pool entry rather than trying to undo. {%- endcomment -%}
          <button class="mcb-next mcb-next--retry" id="mcb-retry" type="button" hidden>
            <span class="mcb-next-txt"><b>Try Again</b><small>The same position</small></span>
            <i aria-hidden="true">&#8630;</i>
          </button>
          <button class="mcb-next mcb-next--again" id="mcb-again" type="button">
            <span class="mcb-next-txt"><b>Another Puzzle</b><small>A fresh position</small></span>
            <i aria-hidden="true">&#8635;</i>
          </button>
          {%- comment -%} ⚑ THE THIRD DOOR (2026-08-08, and it is deliberately the MIDDLE one).
               The site took its first random sign-up on 2026-08-07 and the leaderboard says this
               puzzle is what hooked them. So the moment a stranger has just finished a position
               is the moment to ask the one question they cannot walk away from — and it is a
               SMALLER commitment than the room, not a bigger one. Order is the whole point:
                 · Try Again — costs one tap and nothing else
                 · Another Puzzle — stay here, a new position
                 · What's Your Rating? — two minutes, and it is about YOU
                 · The Puzzle Room — 1,000 puzzles, a road you have to mean it to walk
               Ranked by what it asks of someone who arrived thirty seconds ago.
               ⚠ STILL NOT GOLD. All four are wood and ink; the page's one law is untouched.
               {%- endcomment -%}
          <a class="mcb-next" href="{{ '/rating/' | relative_url }}">
            <span class="mcb-next-txt"><b>What's Your Rating?</b><small>Six positions, one number</small></span>
            <i aria-hidden="true">&rarr;</i>
          </a>
          <a class="mcb-next mcb-next--room" href="{{ '/games/fork-in-the-road/' | relative_url }}">
            <span class="mcb-next-txt"><b>The Puzzle Room</b><small>1,000 puzzles to Chess City</small></span>
            <i aria-hidden="true">&rarr;</i>
          </a>
        </div>
      </div>
    </div>
    {%- comment -%} ══ THE ONLY BEAT THE BOARD DOESN'T COVER (2026-08-18) ═══════════════════
         The CSS note over `.mc-board` says "the rook is the affordance" — no hover lift,
         because a board that rises under the mouse reads as a link. That is right, and it
         leaves exactly one gap: the FIRST click. Once a piece is picked up the board explains
         itself completely (the square lights, every legal destination gets a dot, a capture
         gets a ring) — but until then a stranger is looking at a still picture captioned with
         a chess problem, and nothing on screen says it is theirs to touch.

         ⚠ IT MUST NOT GIVE THE PUZZLE AWAY, so it names the SIDE and not the piece: "Pick up a
         white piece to start" is true of all of them. Pulsing the piece that has to move would
         have been the obvious flourish and it would have solved the puzzle for them.

         ⚠ IT IS SHOWN LATE, ONCE, AND NEVER AGAIN AFTER A FIRST MOVE. It waits ~5s so it never
         races somebody who was already reaching for the board, and `mcb.moved` in localStorage
         retires it permanently the moment anyone picks up a piece — a returning player has
         proved they know, and a hint that keeps explaining is nagging. Storage denied → the
         hint simply behaves like a first visit every time, which is the harmless direction
         ([[down-never-stuck]]).
         ⚠ NOT `aria-live`. A screen-reader user does not need a visual affordance announced
         mid-read, and the pieces are already real buttons in the accessibility tree.
         {%- endcomment -%}
    <p class="mcb-say" id="mcb-say">White to play. <b>Mate in one.</b><span class="mcb-hint" id="mcb-hint" hidden>Pick up a white piece to start.</span></p>
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
     aria-label="The Gauntlet — real chess against a ladder of ten P&JCC rivals">
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
  {%- comment -%} ══ TWO MORE THINGS TO DO, AND THEY ARE THE TWO FASTEST (2026-08-10) ═══════
       Nate: "think of more actionable items people will want to click right away."

       Both of these were already built and neither was on this page. They earn the slots for
       the same reason Play Now leads: they are things a stranger can FINISH, with no account,
       in about a minute. Everything else on this page is a room you enter; these two are
       questions you get an answer to.

       ⚠ THE GRID IS SIX NOW AND THAT IS WHY IT WENT TO THREE COLUMNS. Four across plus two
       orphans is a row and a half — the set stops reading as a set, which is exactly the
       defect the 2x2 phone rule was written to fix. Three across is two clean rows, and the
       phone stays 2x2x2. {%- endcomment -%}
  <a class="mc-door" href="{{ '/rating/' | relative_url }}">
    <span class="mc-door-ico" aria-hidden="true">&#9878;&#xFE0E;</span>
    <b>Find Your Rating</b>
    <small>Six positions, then a seat that fits.</small>
  </a>
  {%- comment -%} ══ NOTATION BLITZ IS OFF THIS PAGE (2026-08-11) ═══════════════════════════
       Nate, with the card crossed out in red: "Remove the notation blitz from the home page —
       it's not working."

       ⚠⚠ HE ASKED THIS ONCE BEFORE, ON 2026-08-10, AND I ONLY DID HALF OF IT. That time he
       said "remove the notation blitz box, it's not working" and I removed the PREVIEW BOX —
       the 39px mini-board inside the card — and left the card itself standing, then wrote a
       confident note explaining why the door had earned its place. The door was the thing.
       [[when-he-repeats-himself]]: the first fix was aimed at the layer I happened to be
       looking at, and the defect was one behind it. When he repeats himself, the answer is not
       a better version of the same fix.

       ⚠ THE GAME IS NOT BROKEN AND IS NOT DELETED. /games/notation-run/ returns 200 and boots
       (re-checked today, same as on 08-10), it keeps its card in the games hall, and the drawer
       and ⌘K still reach it. What was not working is this DOOR: on a page whose job is to make
       a stranger do one thing, "name the square before the clock does" is a drill for somebody
       who already plays, and it was sitting in the same row as the two doors that answer a
       question in a minute.

       ⚠ THE GRID IS FIVE NOW, AND THAT COSTS THE CLEAN ROWS. The note above says six went to
       three columns because "four across plus two orphans is a row and a half". Five in three
       columns is 3 + 2, so the second row has an empty cell — the same shape, smaller. Left as
       is deliberately rather than re-columned: 2-across would put a lone card on a third row,
       which is worse, and shuffling the grid to hide one gap is how a page ends up with a
       layout nobody chose. If it reads as a hole, the fix is a SIXTH DOOR worth having, not a
       new column count. {%- endcomment -%}
  {%- comment -%} ══ THE SIXTH DOOR — AND THE HOLE CLOSES (2026-08-18) ═══════════════════════
       Nate: "Let's make Socials/Twitch the sixth box."

       ⭐ THE NOTE DIRECTLY ABOVE CALLED THIS, and that is the whole reason nothing else here
       had to move. When Notation Blitz came off the page on 08-11 the grid fell to five and
       the second row kept an empty cell; the fix was written down that day — "a SIXTH DOOR
       worth having, not a new column count" — so this is one card added and zero CSS touched.
       Three across is two clean rows again and the phone stays 2x2x2.

       ⚠ IT IS THE ONE DOOR ON THIS ROW THAT ISN'T SOMETHING TO PLAY, WHICH IS WHY IT IS LAST.
       Every other card is a room a stranger can walk into and finish something in; this one is
       where they go if they liked it. Last is the correct slot for that, not an accident of
       markup order — and the grid's order IS markup order, no nth-child depends on it.

       ⚠ NO NEW INK, ESPECIALLY NOT TWITCH PURPLE. This page bans gold and purple
       ([[front-door-palette]]) and the one exception on the row — the Gauntlet's brass arch —
       is a livery that already existed. A Twitch-colored card would be the loudest thing on
       the front door and it would be loud for the least important box. Plain `.mc-door`.
       ⚠ ◉ CARRIES `&#xFE0E;` (VARIATION SELECTOR-15) for the same reason every monochrome nav
       icon does: without it a browser may reach for its color emoji font, `color` silently
       no-ops, and the glyph lands as something the palette never chose. It reads as the
       on-air/record dot, which is the half of this page a stranger will care about first.
       {%- endcomment -%}
  {%- comment -%} ⚑⚑ THIS BOX LIGHTS UP WHEN HE IS ACTUALLY STREAMING (2026-08-19).
       Nate: *"I want, when I’m streaming or podcasting live, to have that sixth box
       Follow … light up to show that I’m live."* `data-live-door="box"` is the only hook
       `assets/js/pjcc-live.js` looks for — an href match would break on a project-pages
       build, where `relative_url` prefixes the path.
       ⚠ NO EMBED HERE, HIS CALL AND MINE ON THE SAME DAY: a Twitch iframe on this page
       would load for every visitor during the ~99% of hours the channel is dark, on the
       most measured surface on the site. The player lives one tap away at /follow/.
       ⚠ AND IT COSTS ZERO PIXELS WHEN IT FIRES. The chip is absolutely positioned, so a
       live stream cannot move this column against the board beside it. {%- endcomment -%}
  <a class="mc-door" data-live-door="box" href="{{ '/follow/' | relative_url }}">
    <span class="mc-door-ico" aria-hidden="true">&#9673;&#xFE0E;</span>
    <b>Follow</b>
    <small>Twitch, and everywhere else this lives.</small>
  </a>
</div>

{%- comment -%} THE HONEST STRIP MOVED INTO THE HERO (2026-08-11, his #2) — it is now in
     `.mc-lead-col`, beside the green button, which is where a proof belongs. It is NOT
     duplicated; this is where it used to be, and the note is left standing so nobody
     re-adds a second copy at the foot. Same three lines, not reworded.
     (FUTURE-IDEAS #9 asked for the offline line for months — "It works on a plane" is it,
     and it has been shipping since 2026-08-04. The GAMES HALL still does not say it.)
     {%- endcomment -%}

{% comment %} ══ THE WORLD DOOR CAME OFF THE FRONT DOOR (2026-08-25) ══════════════════
     Nate: "P&JCC is moving too slow compared to the website. We are going to hide it — slow
     reveal it with easter eggs … Remove the 'whole world behind the games' box on the cw home
     page. Keep the link intact."

     What stood here: a visually-hidden `<h2 id="h-world">The World Behind the Board</h2>` and
     under it the `.mc-world` card — a queen glyph, "There is a whole world behind this board",
     the series name in italics, and an arrow, all of it opening /pjcc/.

     ⭐ THE HEADING CAME OFF WITH THE CARD, AND HAD TO. It was added 2026-08-13 so the heading
     skim named this region; a screen-reader-only heading standing over nothing is worse than
     no heading at all — it announces a region and then hands the reader an empty one. Half
     this removal would have been the accessibility bug, not the fix.

     ⚠ THE ROOM IS STILL THERE. /pjcc/ builds, returns 200 and stays in the sw.js precache (a
     404 there fails SILENTLY), and the PWA `id` is `/pjcc/` and can never change. The card was
     the only route from the chess site to the SHOW — that is the point of taking it down, not
     an oversight. The world gets revealed again through the eggs, on his timing.

     ⚠ THIS COMMENT CARRIES NO WHITESPACE-CONTROL HYPHENS, exactly like the blog band's below
     it, and for the same kramdown reason spelled out there: a hyphenated delimiter eats the
     blank line that lets a raw HTML block start, and the tags then ship as VISIBLE TEXT on the
     front door. `npm run test:tags` is the gate that catches it. {% endcomment %}

{%- comment -%} The quiet one. See `.mc-support` in the stylesheet at the foot of this file for
     why it is a sentence and not a button, and why it is last. {%- endcomment -%}
{% if site.patreon_url and site.patreon_url != '' %}
<p class="mc-support">Everything here is free.
  <a href="{{ site.patreon_url }}" target="_blank" rel="noopener">Back it on Patreon</a> if you want to help it grow.</p>
{% endif %}

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
     Nate: "take the working lamp off the main page and leave it on the P&JCC page."

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
/* ⚑ `align-items: start`, NOT `center` (2026-08-11): "move the whole box a little higher on
   the page." The column was being centered against the board's 483px, which parked a 368px
   stack ~57px down from the top of the row for no reason anybody chose — the centering was a
   default from when the left side held one short card. Aligning to the top puts the green door
   level with the board instead of floating in the middle of it.
   ⚠ The BOARD is unaffected: it is the taller item, so it sets the row height and fills it
   under either value. Only the short side moves. */
.mc-hero { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: var(--space-6, 32px);
  align-items: start; margin: 0; }
/* THE LOCKUP, OUTSIDE THE SHEET (2026-08-04) ─────────────────────────────────────
   Title and tagline stand together on the town sky, above the card. `baseline` alignment,
   not `center`: two lines of different size read as one line only when they sit on the same
   floor. It WRAPS on a narrow screen (the tagline drops under the name) rather than shrinking
   either one — three words on their own line is still the lockup; a squeezed title is not. */
/* ⚑ THE TAGLINE MOVED TO THE FAR END (2026-08-08, Nate: "give a lot more space in between
   ChessWild.com and Play. Solve. Learn. In fact, move the tagline to the right side of the
   white box"). `space-between` rather than a hand-picked gap: the two ends of this row are
   the two edges of the card below it, so the lockup now BRACKETS the sheet instead of
   huddling at its left corner — and it stays bracketed at every width without a single
   breakpoint, because the flex line is measured, not guessed. Measured at 1440: the tagline
   ran 630px short of the card's right edge before this, which is the "a lot more space" he
   was asking for, spent all at once.

   ⚠ `column-gap` stays 14px and is now a FLOOR, not the spacing — it is what stops the two
   from touching on a narrow row where there is no slack left to distribute. On a 390px phone
   the tagline already sat 6px off the card's right edge, so this changes that view by almost
   nothing, which is the intent: it is a desktop-shaped fix.
   ⚠ 4px of inset on BOTH sides now. The left one was already there (an optical inset off the
   card's corner); with something finally standing at the right end it needs its mirror, or
   the tagline hangs 4px further out than the title hangs in. */
.page-head-out { display: flex; align-items: baseline; flex-wrap: wrap;
  justify-content: space-between;
  column-gap: 14px; row-gap: 2px; margin: 0 4px 14px; }
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
.page-title-out { color: #ffffff; font-size: clamp(26px, 3.4vw, 34px); font-weight: 800;
  font-family: 'Poppins', sans-serif; line-height: 1.1; margin: 0;
  text-shadow: 0 2px 14px rgba(0, 0, 0, 0.55), 0 1px 2px rgba(0, 0, 0, 0.4); }
@media (max-width: 700px) { .page-head-out { margin: 0 2px 10px; } }

/* ══ THE WORDMARK + THE TAGLINE'S ACCENT — MOVED OUT OF THIS FILE (2026-08-08) ════
   `.wm-chess` / `.wm-wild` / `.wm-tld` / `.wm-solve` used to be declared right here. They
   now live in _sass/_pjcc-01-core.scss, because the left drawer renders the same
   `_includes/wordmark.html` as of today and a mark that appears in two places cannot have
   its ink in one page's private <style>.

   Nothing about the design changed — coral `Wild`, white `.com`, mint `Solve`, and the
   reasoning for every one of them (why no fifth font, why coral and not the obvious gold,
   why the case is typed rather than transformed) sits with the markup in
   _includes/wordmark.html and _includes/tagline.html.

   ⚠ What stays HERE is only what belongs to THIS page: how big the lockup is on the sky,
   and how it is arranged. That split is the point — a host sets a size, not a design. */

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

/* ⛑⛑ THE FLICKERING "i" — THE ONLY DOOR TO /classified/ (2026-08-26) ──────────────
   The markup is up in this file's front matter, inside `sky_note`; the long note is there.
   These are the rules that make it a door instead of a letter.

   ⚠⚠ `@keyframes tgx-radio` IS GLOBAL (_pjcc-04-flair.scss) BUT THE DRIVING RULE IS NOT.
   The original lived as `.hero-lede .tg-x*` in _layouts/home.html and the 08-25 move
   re-scoped it to `.project-desc`; moving the markup alone both times would have shipped a
   plain, permanently visible "i" and no door at all. If this ever moves again, MOVE THIS
   BLOCK WITH IT and re-scope the selector to the new host. [[text-clip-glyph-technique]]

   ⚠ `font-style: inherit` IS LOAD-BEARING, not tidiness — the glyph is an `<i>`, and an
   italic letter inside this upright line is a letter that points at itself.
   ⚠ `color`/`-webkit-text-fill-color: inherit` keep it from painting as a link.

   ⚑⚑ IT FLICKERS AT NIGHT TOO, AND THAT REVERSES HIS OWN 2026-07-16 LINE ("at night the 'i'
   secret doesn't flicker" / "the secret star only floats at night"). That split was correct
   when the two doors worked opposite shifts — the ✦ held the night. The ✦ was demoted from
   <a> to <b> on 2026-08-25 and opens nothing now, so keeping the night rule would leave the
   whole classified → archive → recovery → dispatch wing dark for twelve hours a day. One
   door cannot work a half shift. Restore the split the moment the star is armed again:
   `html.sky-night .page-note-out .tg-x-glyph { animation: none; visibility: visible; }`

   ⚠⚠ THE THREE ESCAPE HATCHES ARE NOT OPTIONAL. Hover, `reduce-flourish` and
   `prefers-reduced-motion` all park the glyph VISIBLE. A door that is invisible to somebody
   who asked the site to hold still is not a secret, it is an exclusion — the letter must
   never go missing from the word for those visitors. */
.page-note-out .tg-x, .page-note-out .tg-x-glyph { text-decoration: none; color: inherit;
  -webkit-text-fill-color: inherit; font-style: inherit; }
.page-note-out .tg-x-glyph { animation: tgx-radio 7.5s steps(1, end) infinite; }
.page-note-out .tg-x:hover .tg-x-glyph,
.page-note-out .tg-x:focus .tg-x-glyph { animation: none; visibility: visible; }
html.reduce-flourish .page-note-out .tg-x-glyph { animation: none; visibility: visible; }
@media (prefers-reduced-motion: reduce) {
  .page-note-out .tg-x-glyph { animation: none; visibility: visible; }
}


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

/* ══ THE MOVE DOTS — SAME BOARD MANNERS AS THE PUZZLE ROOM (2026-08-05) ══════════════
   Nate: "you can click any square even if illegal and it'll call it wrong. The puzzle on
   the home page should match the style and function of the Fork In the Road puzzles."

   Read value-for-value off assets/games/pjcc_fork.html's drawBoard(), because the point is
   that the two boards behave identically:
     selected square   rgba(107,255,184,0.34) wash
     legal + empty     a mint dot, 6/42 of the square across
     legal + capture   a mint RING at 0.42 of the square, not a dot — you can see what you
                       are taking, which a filled dot would cover
   ⚠ A DOT IS NOT A HINT HERE. It shows every legal move of the piece you picked up, which
   is on the order of a dozen squares; the ANSWER is one of them and the board says nothing
   about which. That is the difference between teaching the rules and giving away the
   tactic, and it is the same line the puzzle room draws. */
/* ⚠ A PSEUDO-ELEMENT, NOT `background-image`. First version of this rule set
   `background-image` on the selected square — which does not ADD a wash, it REPLACES the
   whole stack, and `.mcb-sq` already carries two layers there: the canon's 152deg key light
   and `var(--chess-grain)`. So picking a piece up quietly stripped the wood off the square
   underneath it. Exactly the [[chess-visual-canon]] warning — reading the token is not
   enough, you have to diff against the board. A layer over the top, and the grain survives. */
.mcb-sq.sel::before { content: ''; position: absolute; inset: 0;
  background: rgba(107,255,184,0.34); pointer-events: none; }
.mcb-sq.can::after { content: ''; position: absolute; left: 50%; top: 50%;
  width: 25.5%; height: 25.5%; border-radius: 50%; transform: translate(-50%,-50%);
  background: rgba(107,255,184,0.85); pointer-events: none; }
.mcb-sq.can.cap::after { width: 84%; height: 84%; background: none;
  border: 0.8cqw solid rgba(107,255,184,0.85); }
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
/* ── THE FIRST-CLICK HINT (2026-08-18) ────────────────────────────────────────────────
   ⚠⚠ THE FIRST VERSION OF THIS SHIPPED A CLAIM THAT MEASURED FALSE. It said the hint cost
   no layout because `.mcb-say` already reserved 2.6em — a second line nothing was using.
   Rendered: the caption went 37px → 50px when the hint appeared, the hero grew 13px, and on
   a phone (where the board is `order: -1`, ABOVE the copy) THE GREEN BUTTON MOVED DOWN five
   seconds into the visit. That button is the one element on this page the 2026-08-11 note
   says must never shift. 2.6em was sized for the old verdict line, not for this.

   ⭐ SO THE SPACE IS RESERVED AT PAINT, AND ONLY FOR THE PEOPLE WHO WILL SEE THE HINT.
   `armHint()` adds `.has-hint` immediately if this browser has never moved a piece — before
   the five-second timer, so the taller caption is there from the first frame and nothing
   moves when the words arrive. It is NOT removed when they click: shrinking the caption
   mid-visit would move the board at the exact moment they touched it, which is the same bug
   wearing different clothes. Anyone who has played keeps the compact 2.6em caption and pays
   nothing at all. [[measure-the-real-page]]
   ⚠ Quieter than the prompt above it, deliberately: the puzzle is the message, this is the
   instruction. `--fd-ink-3` is the page's third ink and already carries the small print. */
.mcb-say.has-hint { min-height: 3.5em; }
.mcb-hint { display: block; margin-top: 2px; font-size: 0.78rem; color: var(--fd-ink-3); }
.mcb-hint[hidden] { display: none; }
/* ⚑ THE VERDICT LEFT THIS LINE (2026-08-08) — it is on the card that lands on the board now,
   so `.mcb-say` only ever says the standing prompt and its `.good`/`.miss` rules went with
   it (see `.mcb-verdict`). The SQUARE keeps its bright ring either way: a 3px ring on maple
   is not text and does not have to clear 4.5:1. */
.mcb-ready { display: block; margin-top: 4px; color: var(--fd-ink-3); font-size: 0.72rem;
  font-family: 'Share Tech Mono', monospace; }

/* THE OFFER after the move (2026-07-29, widened 2026-08-04) — a door, not an escort. Wood
   and ink only: this is the one moment a second call to action exists on the page, and it
   earns its place by never being visible until you've already done something. Not gold.
   ⚠ IT NOW APPEARS ON A MISS TOO, which is the point of the rewrite: a wrong guess used to
   leave a visitor holding a position they had already failed, with nowhere to go. */
/* ⚑ IT LANDS ON THE BOARD NOW (2026-08-08) — see the markup note. `position:absolute`
   inside `.mcb`, which was already `position:relative` for the two stacked grids, so the
   card costs the page no height at all: answering used to add ~60px under the board and
   shove everything below it down at the exact moment a visitor was reading a verdict.
   ⚠ The scrim is THIN on purpose — the position has to stay readable through it. */
.mcb-offer { position: absolute; inset: 0; z-index: 3;
  display: flex; align-items: center; justify-content: center; padding: 10px;
  background: rgba(24, 16, 8, 0.42);
  animation: mcbVeil .22s ease both; }
.mcb-offer[hidden] { display: none; }
@keyframes mcbVeil { from { opacity: 0; } to { opacity: 1; } }
/* the card itself — the same parchment and grain as every other panel on this page, so it
   reads as a receipt landing on the board rather than as a foreign window.
   ⚠ `max-height` + `overflow-y` are not decoration: four rows plus a verdict is taller than
   a 400px board's inner height on a small phone, and a card that overflowed would be CUT —
   `.mcb` is `overflow:hidden` and would silently eat the last button. */
.mcb-card { width: min(292px, 100%); max-height: 100%; overflow-y: auto;
  display: flex; flex-direction: column; gap: 7px;
  padding: 13px; border-radius: var(--r-md, 12px);
  background: var(--fd-panel); border: 1px solid var(--fd-grain);
  box-shadow: 0 22px 50px -14px rgba(0, 0, 0, 0.6);
  animation: mcbLand .34s cubic-bezier(.18,.9,.3,1.2) both; }
@keyframes mcbLand { from { opacity: 0; transform: translateY(18px) scale(0.94); }
  to { opacity: 1; transform: none; } }
/* the verdict moved OFF `.mcb-say` and INTO the card (2026-08-08). `.mcb-say` keeps the
   standing prompt, which is now true the whole time instead of being overwritten the moment
   you answer — and the announcement is where the eye already is.
   ⚠ SAME PAPER INKS AS BEFORE. #6bffb8 is drawn for a near-black card and measures under 2:1
   on parchment; these two are the re-inked pair. [[front-door-palette]] */
.mcb-verdict { margin: 0 0 1px; text-align: center; font-family: 'Poppins', sans-serif;
  font-weight: 800; font-size: 1.15rem; line-height: 1.2; color: var(--fd-ink); }
.mcb-verdict.good { color: #1f7a4d; }
.mcb-verdict.miss { color: #a3323b; }
.mcb-next { display: inline-flex; align-items: center; gap: 12px; margin: 0;
  padding: 10px 18px; border-radius: 999px; text-decoration: none; text-align: left;
  color: var(--fd-ink); background: var(--fd-panel-hi);
  border: 1px solid var(--fd-grain);
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

/* ── INSIDE THE CARD (2026-08-08) ──────────────────────────────────────────────────
   The rows go full width. Their old per-button entrance (`@keyframes mcbNextIn`) is DELETED,
   not overridden — the CARD lands now, four things each doing their own entrance on top of
   that is one motion idea too many, and every `.mcb-next` on this page is inside the card, so
   the keyframe had no remaining caller. An `animation: none` override would have left a dead
   keyframe that still reads as live to anything grepping for it.
   `[hidden]` needs saying out loud because `.mcb-next` sets `display:inline-flex`, and a
   display value beats the `hidden` attribute's UA `display:none` every time — Try Again
   would have shown on a win, and it would have looked deliberate. */
.mcb-card .mcb-next { display: flex; width: 100%; padding: 8px 12px; border-radius: 10px; gap: 8px; }
.mcb-card .mcb-next[hidden] { display: none; }
.mcb-card .mcb-next b { font-size: 0.88rem; }
.mcb-card .mcb-next small { font-size: 0.72rem; }
.mcb-card .mcb-next i { margin-left: auto; }
/* Try Again is the plainest of the four — it is the cheapest thing you can do here, and it
   should not out-shout the two doors that go somewhere. */
.mcb-next--retry { background: transparent; border-color: var(--fd-rule); }
.mcb-next--retry:hover { background: var(--fd-panel-hi); }
/* ⚠ A SHORT BOARD CANNOT HOLD THE FULL CARD. `.mcb` already declares
   `container-type: inline-size`, so this measures the BOARD, not the viewport — which is the
   right ruler: the card is clipped by the board's height and nothing else.

   ⚠ THE FIRST VERSION ONLY DROPPED THE SUB-LABELS AND THAT WAS NOT ENOUGH — 254px of card in
   a 292px board, a bare frame of wood around it, which is the Gambit's near-opaque curtain by
   accident. Then I shrank the label font and the rows did not move at all: MEASURED, a row is
   44px and the tallest thing in it is the ARROW GLYPH at 1.1rem, not the label. I had been
   tuning a value that was not setting the height. [[audit-numbers-can-be-wrong]]

   ⭐ AND 44px IS THE RIGHT ANSWER, NOT THE PROBLEM. That is the tap-target floor these rows
   are supposed to stand at ([[tap-targets-and-audit-numbers]]) — shrinking them would have
   traded a real accessibility number for a cosmetic one. Four of them simply cost 176px.
   So the fix is FEWER ROWS, not shorter ones: the two "stay here" actions pair up on one
   line, which is also what they mean. 230px → 182px, and a third of the board is visible
   again above and below the card. */
@container (max-width: 330px) {
  .mcb-card { flex-flow: row wrap; padding: 9px; gap: 5px; width: min(282px, 100%); }
  .mcb-verdict, .mcb-card .mcb-next { flex: 1 1 100%; font-size: 0.95rem; margin-bottom: 0; }
  .mcb-card .mcb-next { padding: 6px 10px; }
  .mcb-card .mcb-next small { display: none; }
  .mcb-card .mcb-next b { font-size: 0.82rem; }
  /* the pair — `flex:1 1 0` with `min-width:0` so a long label shrinks instead of forcing a
     wrap. When Try Again is hidden (a win) "Another Puzzle" is alone and takes the line. */
  .mcb-card .mcb-next--retry, .mcb-card .mcb-next--again { flex: 1 1 0; min-width: 0; }
  /* no room for the glyph beside a half-width label, and it was only ever decoration */
  .mcb-card .mcb-next--retry i, .mcb-card .mcb-next--again i { display: none; }
}

@media (prefers-reduced-motion: reduce) { .mcb-p { transition: none; }
  .mcb-offer, .mcb-card { animation: none; } }

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
  /* ⚑ THE 480px CAP IS A DESKTOP FIX AND IT STOPS HERE (2026-08-11). In one column there is
     no second column for the card to stretch across, so the width that made it a banner up
     there is just the page's width down here — and a 480px card left-aligned under a
     full-bleed board would read as an offset accident on a tablet. Full width, as before. */
  .mc-door.mc-lead, .mc-lead-col { max-width: none; }
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
/* ⚑ THREE ACROSS SINCE 2026-08-10. It went to three when the grid reached six doors (Find
   Your Rating and Notation Blitz joined); four columns would have left two orphans on a
   second row and the set would stop reading as a set — the same defect the 2x2 phone rule
   below exists to fix, one breakpoint up.

   ⚠ THERE ARE FIVE DOORS NOW (2026-08-11 — Notation Blitz came off this page), so this is
   3 + 2 with one empty cell rather than the two clean rows of three it was written for.
   Three is still the right count: 2-across would put a lone card on a third row, which is
   the orphan problem again and worse. Kept as an explicit `repeat(3, ...)` rather than
   `auto-fit` so the row does not silently re-column itself the next time a door comes or
   goes — the column count is a decision, not a side effect.
   ⭐ This paragraph said "SIX doors now" for the length of one deploy after there were five.
   A comment that states a count is a comment that goes stale; it was caught by a live check
   grepping for the removed door's NAME, which is the only reason anybody noticed. */
.mc-doors { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr));
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

/* ══ THE SIX DOORS LINE UP — TWO THINGS WERE OUT, NOT ONE (2026-08-20) ═══════════════
   Nate, with a screenshot of this grid: *"It looks fine [on the PC], but on mobile the
   centering is off on the icons and text — can we clean it up both on the mobile site and
   the PC site?"*

   ⚠⚠ MEASURED BEFORE ANYTHING MOVED, and the answer was two independent offsets:

     1. THE GAUNTLET'S ART BLOCK WAS 66px, NOT 71 — so its title sat 5px above every
        neighbor's, on EVERY width including the desktop. The note above this rule claims
        "`.mc-door-ico` pins the art block to 71px on all four", which is true and is
        exactly the trap: the Gauntlet's art block is NOT `.mc-door-ico`, it is `.gdoor`,
        and no rule ever gave it the band. ⭐ A COMMENT CAN DESCRIBE A SAFEGUARD THAT WAS
        NEVER BUILT FOR THE ONE CASE IT MATTERS FOR. [[audit-numbers-can-be-wrong]]

     2. A TITLE THAT WRAPS PUSHES ITS OWN SUBTITLE OUT OF THE ROW. At 390px "Find Your
        Rating" takes two lines and "Follow" takes one, so the two subtitles beside each
        other started 28px apart — measured 164 vs 136 from the top of the card. This is
        the phone-only half of what he saw, and it is why the desktop "looks fine": at
        1080px and up every title is one line and the raggedness has nothing to show.

   ⭐ THE FIX IS TWO BANDS, NOT A NEW ALIGNMENT. Nothing here re-centers anything — the
   front door's doors are left-aligned editorial cards and he said the desktop reads right.
   Give the art the same height on all six and the title the same height wherever it can
   wrap, and the icons, the titles and the subtitles each land on one line across a row.
   ⚠ TITLES ARE PINNED ONLY UNDER 1080px — the same breakpoint that takes the grid to two
   columns, because that is exactly where a title starts wrapping. Reserving a second line
   on the desktop would buy nothing and cost 21px of air under all six. */
.mc-door--gauntlet .gdoor { min-height: 71px; justify-content: center; }
@media (max-width: 1080px) {
  /* two lines of the title's own type, stated in its own em so it tracks the font-size */
  .mc-door > b { line-height: 1.3; min-height: 2.6em; }
}

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
/* ⚑ SMALLER, 2026-08-10 (Nate: "make the green Play Now button smaller"). Padding 24/22/26
   → 18/18/20, the title 1.5rem → 1.3rem, the icon 32 → 26. All four of the ways it is MORE
   than a paper door survive — it is still the only green thing, still bigger, still the only
   one with an arrow, still above the rest — which is the line that must not be crossed. Picked
   from a render of the real page, not from arithmetic: at 1.15rem the title stops out-reading
   the four titles below it and the hero loses its anchor. */
/* ⚑⚑ SMALLER AGAIN, 2026-08-11 ("make the green play now box a little smaller please") — and
   the second ask is the interesting one, because the first pass took the two levers I was
   LOOKING at (padding, type) and left the one that actually sets its size alone:

     THE CARD IS NOT SIZED. IT IS STRETCHED. It is a grid item in `1.1fr 0.9fr`, so it took
     the whole left column — 582px on his screen — to hold three short lines. Trimming padding
     off a 582px banner cannot stop it being a banner. Measured, not guessed: 582 x 139 = 81k
     px², against a paper door's 355 x 181 = 64k.

   So it is 480px wide now and no longer stretches: 81k → 67k px², a 17% cut on top of August
   10th's 16%. ⚠ 480 IS A FLOOR, NOT A TASTE. Shrink-to-content lands at 338px, which is
   NARROWER than the 355px paper doors below it — the page's lead would become its smallest
   card and "it is BIGGER" quietly stops being true. Anything under ~460 crosses that line by
   area. Picked from a labelled candidate render at his own window size (1512 wide, rail
   docked), where his 582 reproduced to the pixel ([[pick-visual-values-from-a-render]]).

   ⚑⚑ 420 AND SHORTER, 2026-08-11 THIRD PASS. He drew a red line on a screenshot: "trim the
   length of the green box even further still, to roughly where the red line I drew is. Take
   down the height of the box a bit as well." Measured off his image — his sheet renders 1200
   wide, so it is 1:1 — the box ran 161→641 and his line stands at 580. That is **419px**, so
   420. Height comes down with the padding (18/18/20 → 13/16/15) and the icon (26 → 21).

   ⚠ THIS CROSSES THE FLOOR I NAMED THIS MORNING, KNOWINGLY. I wrote that ~460 was the limit
   because below it the lead is smaller BY AREA than a 355×181 paper door: at 420×123 it is
   52k against their 64k. He asked anyway, so it ships — but the reason the card still reads
   as the lead is now down to three of its four ways rather than four: it is the only GREEN
   thing, the only one with an ARROW, and it sits ABOVE. "Bigger" is now only true of its
   WIDTH (420 vs 355). If the hierarchy ever looks wrong, that is the line that broke, and
   the cheapest repair is height, not width — he picked the width himself.

   ⚠⚠ IT IS `max-width`, AND `width: 480px` IS A TRAP I SHIPPED FOR TEN MINUTES. A grid item
   in an `fr` column has `min-width: auto`, so a stated width becomes the column's MINIMUM and
   the column grows to it. Measured at a 980px window: the card stayed 480 while the board's
   column was squeezed — i.e. "make it smaller" made it eat the board at mid widths. A
   `max-width` never demands anything, so the item is min(column, 480) and the fr split is
   untouched. Caught by driving eight widths, not by reading the rule. `justify-self` is left
   alone deliberately: a stretched item that cannot reach its stretch size falls back to
   start alignment, which is where this card wants to be anyway. */
.mc-door.mc-lead { background: var(--fd-go); border-color: var(--fd-go); color: #ffffff;
  padding: 13px 16px 15px; box-shadow: 0 8px 22px rgba(46, 125, 71, 0.2);
  max-width: 420px; }
/* the paper doors wear a wood hairline along the top; on the green one it would read as mud */
.mc-lead::before { background: rgba(255, 255, 255, 0.55); opacity: 0.8; }
.mc-lead .mc-door-ico { color: #ffffff; font-size: 21px; margin-bottom: 5px; }
.mc-lead > b { color: #ffffff; font-size: 1.3rem; letter-spacing: -0.01em; margin-bottom: 5px; }
.mc-lead > small { color: rgba(255, 255, 255, 0.94); font-size: 0.9rem; }
/* the lead card has no neighbors to line up with, so it keeps a tight art block */
.mc-lead .mc-door-ico { min-height: 0; }
/* the arrow clears the title's line, not the card's corner — `right`/`top` are absolute
   against the card, which is `position:relative` already (`.mc-door`) */
/* ⚑ FOLLOWS THE PADDING DOWN (2026-08-11). These are absolute against the card, so they do
   NOT move when the padding shrinks — the arrow would have kept sitting at the old 20/24 and
   drifted out of line with the icon it is supposed to balance. Re-set to the new inset. */
.mc-lead-arw { position: absolute; right: 16px; top: 17px; font-size: 1.2rem; line-height: 1;
  color: #ffffff; transition: transform .14s ease; }
.mc-lead:hover { background: var(--fd-go-2); border-color: var(--fd-go-2);
  box-shadow: 0 14px 30px rgba(46, 125, 71, 0.28); }
.mc-lead:hover::before { opacity: 1; }
.mc-lead:hover .mc-lead-arw { transform: translateX(4px); }
/* the title runs under the arrow at narrow column widths without this */
.mc-lead > b, .mc-lead > small { padding-right: 26px; }

/* ⚑ THE NOTATION BLITZ PEEK'S CSS CAME OUT WITH IT (2026-08-10). `.nb-peek`, `.nb-grid`,
   `.nb-call` and `.mc-door--blitz` were declared here and are not referenced anywhere on the
   site any more — grepped by SELECTOR, not by filename, before deleting ([[read-before-you-
   delete]]). The door now uses the shared `.mc-door-ico` slot above, which is where its 71px
   art block and 10px gap come from, so nothing here was load-bearing for the row's alignment. */

/* ══ THE PATREON LINE (2026-08-10) ═══════════════════════════════════════════════════
   Nate: "a Patreon link somewhere — not TOO prominent."

   So: no button, no card, no color of its own. One sentence at the very foot, under the door
   to the world, in the same ink as the small print around it. ⚠ It is deliberately the LAST
   thing on the page and deliberately not in the doors grid — every other link here sends you
   further into the site, and this one sends you off it. Something that leaves has to earn its
   place by being findable, not by being loud. It only renders when `patreon_url` is set. */
.mc-support { text-align: center; margin: 0 0 var(--space-6, 32px);
  font-size: 0.84rem; color: var(--fd-ink-3, #7b8492); }
.mc-support a { color: var(--fd-ink-2, #5b6472); text-decoration: underline;
  text-underline-offset: 3px; text-decoration-thickness: 1px; }
.mc-support a:hover, .mc-support a:focus-visible { color: var(--fd-go, #2e7d47); }

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
/* ⚑ WIDTH AND HEIGHT, AND NOTHING ELSE (2026-08-05). Three more lines stood here — two
   radii and a font-size — every one of them a hand-correction for a leaf that did not
   scale with its arch. The partial expresses the whole leaf as a share of the arch's width
   now (`container-type: inline-size` + cqw), so this caller states its SIZE and the door
   takes care of being the same door. The old 19px was the partial's 32 × 46/78; the
   container arithmetic produces 18.9 on its own. See _sass/_pjcc-21-gauntlet-door.scss. */
/* ⚠ 60 → 59 (2026-08-05). height = width ÷ 0.78, and 46/60 was 0.767 — inside the test's
   ±0.02 tolerance and still the worst-proportioned copy on the site. "Uniform is key" has
   been asked for four times; a tolerance is a place for drift to hide, so every declared
   arch is now within 0.004 of canon and tests/doors.check.js holds it to ±0.01. */
.mc-door--gauntlet .gdoor-arch { width: 46px; height: 59px; }
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

/* ══ THE LEFT COLUMN, AS A STACK (2026-08-11) ═════════════════════════════════════
   Four items now: the green door, the resume line, the regulars, the true things. The
   column is capped at the same 480px as the door so the stack reads as ONE object with a
   left edge, rather than a button with loose text trailing off to the right of it.

   ⚠ `max-width` again, and for the same reason as the door: a stated `width` on a grid item
   makes the `fr` column grow to meet it and the board's column pays for it. The cap lives on
   the WRAPPER now, so the door's own 480 is redundant but kept — it is the rule that has the
   note explaining the number, and a door that leaves this column still knows its size. */
/* ⚑ 420 TO MATCH THE DOOR (2026-08-11). The cap is on the WRAPPER as well as the card so the
   whole stack keeps ONE right edge — a 420px button with text running to 480 beneath it reads
   as two objects that happen to share a corner, which is the thing the wrapper exists to stop. */
.mc-lead-col { max-width: 420px; display: flex; flex-direction: column;
  gap: var(--space-4, 16px); }

/* ⚑ `.mc-open` IS DELETED (2026-08-11). The regulars line moved into the green door's own
   sub-label, so the paragraph it styled no longer exists. Removed rather than left behind —
   the dead-code sweep would have flagged it, and a rule with no markup is a trap for whoever
   next greps for "how does the front door say that" ([[read-before-you-delete]]). */

/* ── THE BENCH (2026-08-18) ────────────────────────────────────────────────────────────
   Eight seats, four across, two rows — the shape is picked by the COLUMN, not by taste:
   `.mc-lead-col` is capped at 420px to match the green door's right edge, and eight names
   in one row leaves ~50px a name, which "Crockett" does not fit in at any size worth
   reading. Four across gives each seat ~100px and lands the block at almost exactly the
   height of the parchment that was empty under the proofs.

   ⚠ IT INHERITS THE PAGE'S INK AND ADDS NO NEW COLOR. The front door bans gold and purple
   ([[front-door-palette]]); the glyphs take `--fd-wood-ink` — the same brown the puzzle
   caption's bold already wears — so the row reads as part of the sheet rather than as a
   pasted-in widget. The one green on this page stays on the button above it.

   ⚠ 44px TAP TARGETS. Each seat is a full grid cell, which clears the floor on the smallest
   phone this page targets ([[tap-targets-and-audit-numbers]]). Verified in a render at 390px,
   not assumed from the CSS. */
.mc-bench { margin: 0; }
.mc-bench-h { margin: 0 0 8px; font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--fd-ink-3); font-weight: 700; }
/* ⚑ THREE ACROSS, NOT FOUR (2026-08-18). Four was sized for eight seats; the locked pair came
   off, and six across three columns is two clean rows where six across four would have been
   4 + 2 — the same "row and a half" shape the doors grid below this page was re-columned to
   avoid. The cells also gain ~39px of width each, which is the difference between "Crockett"
   fitting and "Crockett" ellipsizing.
   ⚠ THE SIX IS THE LADDER, NOT THE ROSTER (2026-08-19). Auston left the rungs and the
   bench went to seven; three columns still divide the SIX rated seats exactly because the
   seventh spans all three. If a rung is ever added or removed, count the RATED seats against
   this number — `npm run test:regulars` fails on an orphan cell. */
.mc-bench-row { list-style: none; margin: 0; padding: 0;
  display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }
.mc-bench-seat { min-width: 0; }
/* ⚠ `.mc-bench-seat > a`, because the <a> is the CHILD of the <li>. The site's bare `a:hover`
   sets `text-decoration: underline`, and `.mc-bench-seat > a:hover` beats it — a pseudo-class
   scores in the CLASS column, so this is (0,2,1) against (0,1,1). Same rule as `.soc-card:hover`
   on /follow/ — measured there, not guessed ([[text-clip-glyph-technique]]). */
.mc-bench-seat > a {
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px;
  padding: 7px 4px 8px; min-height: 62px; text-align: center; text-decoration: none;
  border: 1px solid rgba(185, 139, 87, 0.28); border-radius: var(--r-sm, 10px);
  background: rgba(255, 255, 255, 0.34);
  transition: transform var(--dur-fast, 0.15s) var(--ease-out, ease),
              border-color var(--dur-fast, 0.15s) var(--ease-out, ease); }
.mc-bench-seat > a:hover,
.mc-bench-seat > a:focus-visible { text-decoration: none; transform: translateY(-2px);
  border-color: var(--fd-grain, rgba(185, 139, 87, 0.6)); background: rgba(255, 255, 255, 0.62); }
.mc-bench-ico { font-size: 1.15rem; line-height: 1; color: var(--fd-wood-ink); }
.mc-bench-n { font-size: 0.72rem; font-weight: 700; color: var(--fd-ink-2);
  max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mc-bench-e { font-size: 0.66rem; color: var(--fd-ink-3); font-variant-numeric: tabular-nums; }
/* ⚡⚡ THE ADAPTIVE SEAT SPANS THE ROW — AND IT IS A BUG FIX, NOT A FLOURISH (2026-08-19).
   Three across was chosen for SIX seats: two clean rows, "the grid IS the claim". Seating Nate
   at 1200 made seven, and seven in three columns is 3 + 3 + 1 — the exact "row and a half"
   shape the note above this block says the column count exists to avoid. Rendered at his own
   window (1512 wide, sheet 1204): Auston sat alone in the bottom-left corner reading as a
   leftover, on the one seat whose whole premise is that she is SEPARATE.
   ⭐ So the thing that broke the grid is the thing that fixes it. She is off the ladder in the
   game, under her own heading; here she is off the rows, across the bottom. Measured: the
   bench goes 160.3 → 206.3px and the left column ends 3.5px SHORT of the board with the
   proofs un-rotated (JS off) — the tighter of that block's two heights, which is the one
   [[front-door-hero-stack]] says to price. The orphan version was 243.4px and overshot by 33.6.
   ⚠ `.mc-bench-seat--adapt > a` scores (0,2,1), the SAME as `.mc-bench-seat > a` above it, so
   it wins on document order alone. Move it above that rule and the row silently reverts to a
   62px column card — which is how the first candidate render measured "unchanged".
   ⚠ THE EXPLANATION IS VISIBLE TEXT, NOT THE `title`. He reads this site on iOS, where a
   hover string is a fact nobody is ever told ([[hover-is-three-inputs]]). */
.mc-bench-seat--adapt { grid-column: 1 / -1; }
.mc-bench-seat--adapt > a { flex-direction: row; gap: 8px; min-height: 40px; padding: 6px 10px; }
.mc-bench-seat--adapt .mc-bench-ico { font-size: 1.05rem; }
/* (The locked-seat rules were deleted 2026-08-18 with the markup that used them — no
   `.is-locked`, no `.mc-bench-lk`, no `.mc-bench-ico--lock`. Left behind they would have been
   three rules no selector on the site can reach, and the dead-code sweep would have found them
   the next time it ran ([[read-before-you-delete]]). Two things worth carrying forward if an
   aspiration rung ever returns here: a locked cell must NOT be dimmed with `opacity` — it
   composites real text toward the paper and lands near 2:1 — and dimming its ink instead
   passes contrast but reads as identical to an open seat. The padlock did the work.) */
@media (prefers-reduced-motion: reduce) {
  .mc-bench-seat > a { transition: none; }
  .mc-bench-seat > a:hover, .mc-bench-seat > a:focus-visible { transform: none; }
}
html.reduce-flourish .mc-bench-seat > a { transition: none; }
html.reduce-flourish .mc-bench-seat > a:hover,
html.reduce-flourish .mc-bench-seat > a:focus-visible { transform: none; }

/* PICK UP WHERE YOU LEFT OFF — only ever visible to somebody who has been here before.
   ⚠ `[hidden]` needs the explicit `display:none` because the rule below sets `display`
   on the same element; a bare `hidden` attribute loses to any display declaration.
   ⚠ IT IS A BLOCK, NOT A FLEX ROW, and that was a real render bug caught in the preview:
   as a flex container the bold lead-in, the sentence and the link each became a separate
   flex ITEM, so "Keep going" wrapped onto a line of its own with an 8px gap punched into
   the middle of the sentence.

   ⚑ IT GREW TEETH, 2026-08-11: "Make Welcome Back an exclamation, and increase the size of
   the text, and use a slightly different color. Put the score and the number of puzzles
   solved in bigger and bolder text, and give it a different color."

   THREE VOICES, and each one is a different JOB rather than decoration:
     · the GREETING  — walnut, 1.02rem. Warm, and the only warm-colored text in the stack.
     · the NUMBERS   — deep green, 1.16rem, weight 800. His rating and his count are the two
                       facts on this page that belong to HIM; nothing else here is his.
     · the LINK      — green, bolder and a step up, because it is the one thing to DO.
   The prose around them stays quiet ink so the numbers have something to be louder than.

   ⚠ COLORS PICKED FROM THE PALETTE, NOT INVENTED, and neither is a new hue — the front door
   bans purple and gold, and this block adds no color the page did not already carry.

   ⚠⚠ AND THE FIRST TWO GREENS I REACHED FOR BOTH FAILED AA. Measured off real screenshots of
   the painted sheet, per sky phase, against the darkest hour: `--fd-go` = **2.62:1**,
   `--fd-go-2` = **3.57:1**. `--fd-go`'s own comment says "5.1:1 with white", which is white
   text ON the green button — a token carries its background as an assumption, and moving it
   off that background is a new decision, not a reuse. Hence `--fd-go-ink` (#17492a, 5.36:1),
   added to the palette beside `--fd-wood-ink`, which exists for the identical reason.
   ⭐ GREEN FILLS use `--fd-go`. GREEN WORDS use `--fd-go-ink`. */
/* ⚑ the bottom margin is "give some more empty space" under Keep Going. It lives on the
   RESUME block rather than on the list below it, because a signed-out visitor never renders
   this element — put the gap on `.mc-true` and a stranger gets a hole where his rating isn't.
   ⚑ 10 → 22px, 2026-08-11 ("give a little more space under Keep Going and the three
   points"). The link sits on the sheet with nothing around it, so 10px read as the list
   crowding it rather than as a gap; 22 is one clear line of air and still less than the
   stack's own 16px gap plus a paragraph would be. */
/* ⚑⚑ IT IS A PANEL NOW — 2026-08-12. Nate: "the Puzzle rating section above the three
   points looks like it's missing something (like a box outline or something)."

   He is describing a real thing and it is not only this block. Every other object in this
   column has an edge — the green door has a fill, the doors below have panels, the board
   has a timber frame — and his rating was three lines of loose text floating on bare
   parchment between two of them. It read as unfinished because on this page it WAS the one
   piece of furniture with no furniture.

   ⭐ THE GREEN LEFT EDGE IS THE ONE JUDGMENT CALL HERE, AND IT IS DELIBERATE. Green on this
   page means "this belongs to playing" — and this block is the only thing on the front door
   that belongs to HIM. The rule ties his numbers back to the Play Now door directly above
   without adding a color the block was not already carrying: the rating, the count and
   "Keep going" have all been `--fd-go-ink` since 2026-08-11.
   ⚠ THE PAGE'S ONE LAW SURVIVES IT, and I checked rather than assumed. The law is that
   exactly one thing is a FILLED green box. This is a 3px edge on a cream panel; `.mc-lead`
   is still the only green fill, the only green arrow and the only thing shouting. If this
   ever starts reading as a second call to action, the edge is what to take off first.

   ⚠ THE PANEL IS TRANSLUCENT (0.72), NOT `--fd-panel`. The opaque door cards are the
   BRIGHTEST paper on the page and the sheet's whole "gray" problem is measured against
   them — dropping another opaque panel into the hero would have widened the very gap the
   backlight in _pjcc-25-front-door.scss was just spent closing. At 0.72 it reads as a
   raised area of the same sheet, which is what it is.
   ⚠ THE BOTTOM MARGIN CAME OFF (22 → 2px) AND ITS JOB DID NOT GO AWAY. "Give a little more
   space under Keep Going" is the box's own bottom padding now; leaving both would have
   double-counted the gap and pushed the proofs away from a block a stranger never sees. */
.mc-resume { margin: 0 0 2px; display: block;
  padding: 13px 16px 14px; border-radius: 14px;
  background: rgba(255, 253, 247, 0.72);
  border: 1px solid rgba(185, 139, 87, 0.32);
  border-left: 3px solid var(--fd-go);
  font-size: 0.88rem; line-height: 1.6; color: var(--fd-ink-3); }
.mc-resume[hidden] { display: none; }
/* the greeting — its own line, because a bigger, warmer word set inline against body copy
   fights the baseline instead of leading it.

   ⚑ BLOCK LETTERS, 2026-08-11 (Nate: "Make 'Welcome Back' block letters"). It is
   `text-transform`, so the STRING is untouched — the markup and the script still say
   "Welcome back!", which is what a screen reader announces and what a copy-paste carries.
   Capitals are a treatment here, not a rewording.

   ⚠ CAPS NEED TRACKING AND A SMALLER SIZE, OR THEY SHOUT. Upper case has no descenders and
   no x-height variation, so the same 1.02rem reads noticeably bigger and tighter than the
   sentence case did — set letter-spacing OPEN (0.07em) and the size back a step (0.96rem)
   and the line lands at almost exactly the width it had, which is what keeps it a heading
   for the two lines under it instead of a second headline competing with the green door. */
.mc-resume b { display: block; color: var(--fd-wood-ink); font-weight: 800;
  font-size: 0.96rem; text-transform: uppercase; letter-spacing: 0.07em;
  margin-bottom: 3px; }
/* his rating and his count */
.mc-resume .rs-num { color: var(--fd-go-ink); font-weight: 800; font-size: 1.16rem;
  letter-spacing: -0.01em; }
/* the one link in the stack that is not a door — underlined, because it is prose.
   ⚠ `nowrap` because the preview put the ARROW ALONE on its own line: "Keep going" fit and
   the → did not, which reads as a typo rather than a link. The whole call to action moves
   to the next line together or not at all.
   ⚠ `inline-block` + a top margin, so "give some more empty space" under it is space the
   LINK owns. Putting it on the stack's flex gap instead would have pushed the three proofs
   away from the regulars line too, on the visit where nobody is signed in and this element
   is not even rendered.

   ⚠⚠ THE ANCHOR CARRIES A CLASS, AND IT IS LOAD-BEARING. `_pjcc-25-front-door.scss` has
   `body.theme-chess .page-body a:not([class]) { color: var(--fd-ink-2) }` at (0,3,2) — it
   out-specified this rule at (0,1,1), so the link I shipped this morning "in green" rendered
   in dark ink and I described it as green in two messages without looking. The file's own
   comment warns about this exact rule; `:not([class])` is what makes it survivable, and a
   class is how you opt out. Measured, not read: `getComputedStyle` said rgb(51,57,68).
   ⭐ The general one: A COLOR YOU DECLARED IS NOT A COLOR THAT PAINTED. */
.mc-resume a.rs-go { display: inline-block; margin-top: 6px;
  color: var(--fd-go-ink); font-weight: 800; font-size: 0.96rem; text-decoration: underline;
  text-underline-offset: 3px; white-space: nowrap; }
/* deeper, never brighter — and it is the same hover the page's other links already use */
.mc-resume a.rs-go:hover { color: var(--fd-ink); }

/* THE TRUE THINGS — a list, not cards; facts don't need boxes.
   ⚑ IT LIVES IN THE HERO NOW (2026-08-11) — which is what turns it from a footer strip into
   a column of proofs beside the button. The bottom margin goes; the stack's `gap` owns the
   spacing here. (The `auto-fit` this paragraph used to praise is gone as of 2026-08-12 — it
   was silently two columns on a tablet, which the centered text tolerated and a row rule
   does not. See the note further down.)

   ⚑ SMALLER, same day ("make the three points a bit smaller"). Three dials, all one step:
   the claim 0.95 → 0.88rem, the support 0.88 → 0.82rem, and the row gap 16 → 10px. The words
   were cut in the markup at the same time, and the two together are what buys the height —
   type alone would have shaved a few pixels and left three long lines still looking like a
   paragraph. ⚠ 0.82rem is the FLOOR here: `--fd-ink-3` on the parchment is chosen against the
   sheet's alpha, and going smaller starts trading legibility for space on the one block whose
   whole job is to be believed. Do not take another step without re-measuring contrast. */
/* (SUPERSEDED 2026-08-12 — HE REVERSED IT HIMSELF; see the note directly below. Kept short
   because one line of it is still load-bearing and the rest is now history.

   On 2026-08-11 this block was CENTERED with a short 38px walnut divider, chosen off six
   placements rendered over the real sheet ("move the three points more toward center").
   ⭐ THE ONE FINDING THAT OUTLIVED THE DECISION: the flush-left version it replaced was
   drawn with `--fd-rule`, which is invisible on a sheet the sky darkens — so "flush left
   looks wrong" was never about the alignment, it was about a rule nobody could see. That is
   why the rule below is walnut `--fd-grain`, not `--fd-rule`. Re-reading that finding is
   what kept this pass from re-shipping the exact block he disliked in the first place.
   The rejected placements, for the record: block-centered-with-rule and indented-44px both
   left the rule floating mid-column pointing at nothing.) */
/* ⚑⚑ THE CENTERING IS REVERSED — 2026-08-12. Nate: "my decision to move the three points
   center of the green box doesn't really work. My mistake."

   ⭐ WHAT WAS ACTUALLY WRONG, SINCE "centered" WAS NOT THE WHOLE OF IT: this column holds
   four things and the other three are left-aligned objects with a hard left edge — the green
   door, the rating panel, and (down the page) the door grid. Centering one of the four broke
   the column's only structural line, so the proofs stopped reading as part of the stack and
   started reading as three sentences adrift in the middle of a large pale field. The
   centered version is defensible on its own and indefensible in company, which is exactly
   what a screenshot shows and a candidate rendered in isolation does not.

   ⚠ THE SHORT DIVIDER GOES WITH IT, AND ITS JOB IS RE-HOUSED RATHER THAN DROPPED. The
   2026-08-11 note below was right that centered items have no shared edge to group them and
   therefore need a mark. Left-aligned items DO have that edge, so the separator can go back
   to being a plain rule between rows, and the grouping work moves to a small walnut lozenge
   at the head of each proof — which also gives the eye the same three-beat rhythm the
   centered dividers were bought for.

   ⚠ IT IS ONE COLUMN AT EVERY WIDTH NOW. It used to be `auto-fit, minmax(260px, 1fr)`,
   which is one column in the 420px desktop stack but TWO on a tablet, where `.mc-lead-col`
   drops its cap and the column runs the full page. Centered text survived that reflow;
   a row border and a left-hand mark would not — the rule would run across a two-column
   split and the marks would form two ragged ladders. A list of three proofs beside a button
   was never a grid; it just had not been asked to prove it at 720px.

   (Superseded, kept because the reasoning still teaches: the flush-left HAIRLINE RULE this
   replaces was invisible — `--fd-rule` on a sheet the sky darkens — which is what sent the
   2026-08-11 pass to center in the first place. The rule below is `--fd-grain` walnut at
   0.22, not `--fd-rule`, so it is a mark you can actually see. The fix for an invisible
   rule was a visible rule; moving the block was treating the symptom.)
   ⚠ 2.4:1 ON THE SHEET AND THAT IS FINE — decoration, not text and not the boundary of a
   control, so the 3:1 non-text floor does not reach it. Written down so the next contrast
   sweep does not report it as a defect, same as the old divider's note did. */
/* ⚑⚑ ONE LINE PER PROOF — 2026-08-18. Nate, for the SECOND time: "can we make the three
   points smaller somehow? It currently takes up too much space."

   ⭐ HE ASKED THIS ON 2026-08-11 TOO, AND THE ANSWER THAT TIME MISSED THE POINT. That pass
   cut 34 words to 17 and took the type down a step, which is what "smaller" sounds like it
   means — and the block still came back. It had to: neither of those touches the thing that
   was actually spending the space. THE SHAPE WAS. Each proof was a two-line stack inside
   22px of vertical padding, so a row cost ~66px no matter how few words were in it and no
   matter how small they were set. Three rows, 200px, beside a 400px board.

   So the claim and its proof go on ONE LINE — `b` is inline instead of block — and the
   padding comes down with them. Measured on the real 420px column: 200px → 115px, a 43%
   cut, with the type size, the ink, the rules and the lozenges all exactly as they were.
   The whole left stack drops 472px → 387px and is finally SHORTER than the board it stands
   beside, which is the thing his screenshot was really showing.

   ⚠⚠ A ONE-LINE ROW ONLY WORKS IF THE LINE FITS, AND MY FIRST MEASUREMENT SAID IT BARELY
   DID — 13px of slack, which is a coin flip, not a margin. That number was wrong, and it
   was wrong because the sheet I rendered it on was 388px wide while the real column is 420
   and `.mc-true` carries no horizontal padding. Same mistake as always: the harness was not
   the page ([[measure-the-real-page]]). Re-measured in the real container, the longest
   proof draws 353px in a 400px box — 47px, 12% — and it holds in Arial and every other
   fallback in the stack, all of which are NARROWER than Inter. That is a decision.
   ⚠ It wraps below roughly a 370px column, in a thin band of tablet widths just above the
   760px breakpoint. A wrapped row is 20px taller and reads fine; it is not worth a rule.

   ⚑ The lozenge moves 18px → 15px, and the 15 is DERIVED rather than picked: the old top
   put its center 0.4px above the first line's center, and 15 is the number that keeps that
   same relationship on the shorter row. Three candidates were rendered at 5x anyway, and
   the derived one is the one that looked centered. [[pick-visual-values-from-a-render]] */
.mc-true { list-style: none; padding: 0; margin: 0;
  display: grid; grid-template-columns: 1fr; gap: 0;
  text-align: left; }
.mc-true li { color: var(--fd-ink-3); font-size: 0.82rem; line-height: 1.5;
  position: relative; padding: 9px 0 9px 20px; }
.mc-true li + li { border-top: 1px solid rgba(185, 139, 87, 0.22); }
/* the lozenge — a square stood on its corner, drawn in CSS rather than typed as a glyph.
   ⚠ DELIBERATELY NOT A CHARACTER. A diamond typed as ◆ needs a variation selector to stay
   text and not become an emoji on iOS, and it would take its size from the font stack
   instead of from this rule ([[text-clip-glyph-technique]]). A box cannot be mis-rendered. */
.mc-true li::before { content: ''; position: absolute; top: 15px; left: 2px;
  width: 7px; height: 7px; border-radius: 2px; transform: rotate(45deg);
  background: var(--fd-grain); }
/* ⚠ INLINE, AND THE SIZE COMES DOWN WITH IT (0.88 → 0.82). A bold run set larger than the
   text it now shares a line with reads as a mistake rather than as emphasis — the claim is
   already carrying weight AND the darker ink, which is enough to lead the line on its own. */
.mc-true b { display: inline; color: var(--fd-ink-2); font-size: 0.82rem; margin: 0; }

/* ── ONE AT A TIME (2026-08-18) ────────────────────────────────────────────────────────
   Nate: "The three points could be put more subtle: perhaps they could flash at you one at a
   time, similar to what we were doing with the old splash page."

   ⭐ `.is-rotating` IS ADDED BY SCRIPT, NEVER WRITTEN IN THE MARKUP, and that is the whole
   safety of it. With no JS — or with reduced motion, or `reduce-flourish` — the class never
   lands and this stays exactly the three-line list it has been since 08-11. The rotator is an
   enhancement on top of a complete thing, not a thing that needs JS to be complete.

   ⭐ THE THREE STACK IN ONE GRID CELL (`grid-area: 1/1`), so the row sizes itself to the
   TALLEST of them at whatever width the column happens to be. The obvious alternative —
   measuring the tallest <li> in JS and pinning a height — needs a resize listener and gets it
   wrong for one frame on every rotation. Grid does it for free, at every width, forever.

   ⚠ ALL THREE STAY IN THE DOCUMENT AND IN THE ACCESSIBILITY TREE. `opacity: 0` hides a thing
   from the eye and from nobody else, so a screen reader still reads all three claims in order,
   immediately, with no live region and no announcement of the rotation. That is the right
   outcome: the rotation is a visual treatment, and the information was never the part that
   needed to move.

   ⚠ IT PAUSES ON HOVER AND ON FOCUS (WCAG 2.2.2 — auto-updating content that runs longer than
   five seconds has to be pausable). The honest gap: a sighted keyboard-only reader who has not
   set reduced-motion gets no pause, because there is nothing focusable inside a list of three
   sentences and adding a tab stop to the front door to fix it costs more than it buys. Written
   down rather than papered over. */
.mc-true.is-rotating { display: grid; grid-template-columns: 1fr; }
.mc-true.is-rotating li { grid-area: 1 / 1; opacity: 0; border-top: 0;
  transition: opacity 0.55s var(--ease-out, ease); }
.mc-true.is-rotating li.is-on { opacity: 1; }

/* (THE WORLD DOOR'S CSS WENT WITH ITS MARKUP — 2026-08-25, "we are going to hide it — slow
   reveal it with easter eggs." `.mc-world`, its glyph, its text column and its arrow were a
   warm wood-toned card — the page's one de-purpled panel (2026-08-04, "completely get rid of
   the purple and gold aesthetic — leave that with P&JCC page"), which is why it carried a
   `--fd-wood` wash instead of the flat panel every other box on this page wears. All of it
   came out in the same commit as the card, the way the studio band did on 2026-08-04.
   Restore the whole block from git if the door returns.
   ⚠ `.mc-world` IS STILL NAMED IN _sass/_pjcc-25-front-door.scss ON PURPOSE — it sits in the
   anti-purple guard there, which exists because a CLASSED anchor inherits the global link
   purple into its whole subtree. Leaving it costs one selector and means a restored card
   cannot come back purple; see the note beside it.) */

/* (THE STUDIO BAND'S CSS WENT WITH ITS MARKUP — 2026-08-04, "take the working lamp off the
   main page and leave it on the P&JCC page." `.mc-studio`, `.mc-lamp`, their placement block,
   `.mc-studio-copy` and `.mc-studio-label` all came out together, and so did the blog-line
   rules the pass before them. The desk plank's tuned offsets did NOT die with them — they
   were the one thing here worth keeping, and they moved to `.awake-lamp` in _layouts/home.html
   so /pjcc/ gets the base he asked for. Restore the whole band from git if it returns.) */

@media (prefers-reduced-motion: reduce) {
  .mc-door { transition: none; }
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
      UNIQUE mate in one. Every entry is 'board from-index to-index packed-legal-moves'. The
      page never reasons about chess — it compares integers and reads a lookup table — so the
      front door still carries no engine, and the only promise it makes about the position is
      one the referee actually made.
      ⚠ NEVER HAND-EDIT THE POOL. `npm run gen:puzzles` rewrites it between the sentinels.

   1b. ⚑ AND THE BOARD IS A BOARD NOW (2026-08-05, Nate: "you can click any square even if
      illegal and it'll call it wrong. The puzzle on the home page should match the style and
      function of the Fork In the Road puzzles"). Picking a piece up lights its LEGAL moves,
      the way the puzzle room does, and a square that is not one of them cannot be played at
      all — no verdict, no wasted attempt, the piece just goes back down. The fourth field of
      each pool entry is White's complete legal move list from the referee, two characters per
      move over SQ64. So the page enforces real chess without knowing any: it is still a
      lookup, and the rules it applies are the ones the referee wrote down at build time.

   2. NO DESCRIPTION. Every line of prose is gone. The win used to say "the back rank was the
      whole board" — written for the ONE hard-coded position, nonsense for a random one, and
      a stretch even there — and a miss used to explain what the king would do next. The board
      says "White to play. Mate in one." before, and "Yes!" or "Not quite." after. Those
      two are the marks he asked for, and nothing narrates them.
      ⚑ THE WIN IS "Yes!" (2026-08-08, his call). "Correct." is a grader's word — it scores
      you. The visitor just found a mate on a strange board; the page should sound glad about
      it, not tick a box. The miss stays flat on purpose: only one of the two verdicts is
      allowed to have a voice, or the page is cheering at someone who got it wrong.

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
  var verdict = document.getElementById('mcb-verdict'), retryBtn = document.getElementById('mcb-retry');
  if (!board || !say || !men) return;

  /* ══ POOL — GENERATED, DO NOT EDIT BY HAND · npm run gen:puzzles ══ */
  var POOL = [
    '1rN4k/4pp2/2Kp2R1/6p1/1PB5/4P3/4p3/4R3 60 63 CICMCRCTSKSLSbWOWGWeWVWUWTWXhZiZiQibiUiNipiwiri0sk8087868584898+8/',
    '4nk2/1p3pp1/1P6/3KP1P1/2p4B/3P1Q2/5R2/8 45 13 babibjbkcUeWnurjritktmtft0t7t2t/tltdtVtNtstutv19101z1y1x1w1213',
    '3QB3/1n5p/Pb5k/P1P1P2p/1q6/1P5K/8/8 3 21 DKDRDMDVDeDnDLDTDbDjDrDzD7DCDBDAELESEZEgENEWEfQIQJYRaSaRcUvuv2v3',
    '1N6/1p3Bb1/7k/p5p1/K3p3/2B5/1N1R4/5rr1 51 55 BLBQBSNENGNUNbNiNpNwNWNfgYgZgogpqhqYqjqcqVqOxixrx7zrzjzbzTzLzDz7zyz0z1z2z3',
    '1k6/1p6/1p5p/1NP3pK/1P2Qp2/2P2n2/8/1n6 36 4 ZIZKZTZjZoaSaRfWfXfmkbkSkJkdkWkPkrkyk5ktkckUkMkEksk0k8kjkiklqi',
    '6rq/3r4/3p1p2/1p6/3P4/6BR/Q4p2/1K3kN1 48 53 jbulucuTunu1u3vnvfvXvPvHv3v/wpwiwbwUwNwGwowgwYwQwIwAw4wxwywzw0w15x5y5456+t+0',
    '4B3/p6p/2Qp1rR1/2p1pp2/7k/4P1p1/4K3/8 18 63 ELENSJSASLSZSgSbSkStS2S/SKSCSaSRSQSTWOWGWeWmWuWVWXsk0r0t0z070809',
    '4k3/pR3r2/1NP3KP/5pP1/3p3P/5PQ1/8/8 46 1 JBJIJKJLJMJNRARCRLRbRgRiSKWfXPnftlulucuTuKuBu1u8u3umu2u+uv',
    '5R2/1p5k/p2B1P2/p1R3pK/5P2/n5P1/8/1n6 26 10 FNFEFDFCFBFAFGFHTKTBTMTcVNaSaKaCaiaqaya6aZaYabacadaefefmldleum',
    'bB1k2q1/2p4Q/1p4N1/PP6/3PR2K/5r2/8/8 15 10 BIBKPGPHPXPfPOPNPMPLPKWFWHWMWcWlYQYRjbkckUkMkEksk0k8klkmnenfnm',
    'B7/pQ3n2/3P3P/2p2K1k/rp1P4/P2P4/8/8 9 63 JCJQJSJbJkJtJ2J/JBJRJZJhJIJKJLJMJNTLXPdUdVdkdljbjaoh',
    '2k5/5Q2/2pP1P2/5P1K/Ppp5/B3r1b1/n7/8 13 10 NENGNUNbNiNWNFNMNLNKNJNINONPTLfWfXfefmgYohoxo6',
    '3b4/p6p/4Pp2/2QP4/1PP1P3/1P6/8/K4k1N 26 53 UMaRaIaTaMaFajasa1a+aSaKaCaZaYbThZkc4w4x45/u/1',
    '1R6/4pK2/5p2/k2pr3/p1P2p1p/pr6/5Q2/8 53 8 BJBRBZBhBpBABCBDBEBFBGBHNENFNGNONWiaib1s1j1a1R1I1u1n181+1t1l19101z1y1x1w1213',
    'R3K2k/4p3/1p6/nPp3NP/6pP/2R5/1p6/8 4 13 AIAQAYABACADEDEFELEMENeNePeUeketevfXqiqaqyq6qpqoqrqsqtquqv',
    '1B6/p7/N5K1/2pP2Q1/P6P/PP5k/4b3/7r 30 46 BIBKBTBcBlBuB3QKQaQhWNWOWPWVWXWdbTeVeMeDeXeleseze6emeue2e+edecefgYnfph',
    'b7/7p/r2PNp1b/P2n4/4RR2/k7/2K5/3N4 36 32 TLUDUFUKUOUaUeUjkcksk0k8kjkikhkgldlVltl1l9lmlnyryzy5y67q7s7x71',
    'q2R4/p7/1p2pn2/2N5/1p3n1P/4R3/7K/5kB1 3 59 DLDTDbDjDrDzD7DCDBDADEDFDGDHaJaLaQaUagakaparnfskscsUs0s8srsqspsostsusv3u+1',
    '7N/p4pp1/7p/R6p/2P2KR1/N7/7k/Br6 24 31 HNHWYQYIYgYZYaYbYcYdYeYfialcldlklsltmemWmOmum2m+mnoZoyo54x4q4j4c4V4O',
    '7k/2b2KN1/p2R4/P3p1P1/4pp2/P6B/3n4/8 19 23 NENFNMNUNVNWOEOUOdOfTLTDTbTjTrTzTSTRTQTUTVTWTXeWogvmvdvUvLvCv2v9',
    'nK6/2p2n1k/q6N/6pN/7P/p7/P2R4/Q7 56 14 XGXNXdXmfOfVflfunezrzjzbzTzLzDz7zyzxz0z1z2z34x4q4j4c4V4O4H45464748494+4/',
    '8/3n4/1B1p2pp/8/p1K1pnN1/k3N1P1/8/6Q1 62 56 RIRKRDRYRaRjiZijiqmVmXmcm1m3sbsdsys2s7s9ul+1+3+2+9+8+7+6+5+4+/',
    '1b6/1K6/3p4/1n1p4/1n1pPRP1/P5P1/6Q1/2k5 37 61 JAJBJCJRkckbldlVlNlFltl1l9meogoh2t2v292/2+21202z2y2x2w23',
    '8/4p1p1/k3p2p/2Q4r/4pp1p/6P1/4qBK1/8 26 17 aRaIaTaMahaoajasaSaKaCaiaqaya6aZaYabacadaeafumulun2v232+2/',
    '3B4/1Qp4p/1p2p3/5P2/1p5p/PB6/K3b3/2k5 3 30 DKDMDVDeDnJAJCJQJSJbJkJtJ2J/JBJRJIJKdVdUogohpgpipbpUpyp7w4',
    'K7/4p2n/p7/6bR/5p2/6nP/1P2RB1Q/5k2 52 60 ABAIAJfXfPfnfevnxpxh0s0k0c0U0M080z0y1s1j1a1R1I1u181+3u3+3/32',
    '2Q5/k1N5/2b2P2/1p2Pp2/4pn2/4n1P1/5K2/2B5 58 44 CJCQCLCUCdCBCACDCECFCGCHKAKEKQKUKZKbVNcUumul1s181+6x6o6z6s',
    '8/k6b/3pP3/4P2p/2KPP3/2N4P/2R5/NQ6 50 48 UMcTiZibihipirjbqZqbqgqwq0q7vny6yxywyzy0y1y2y34p5w5x5p5h5Z5R5J5B565758595+5/',
    '7K/4p2B/1N1PP1N1/3p4/b5p1/7Q/2n4p/7k 47 61 HGHOPGRARCRLRbRgRiTLTMWFWMWcWlWnvmv2v9vnvfvXv3vuvtvsvrvqvpvo',
    '5N1r/4p3/P2p3P/1b4pk/8/4b2N/K6R/3r4 47 53 FLFPFUFWQIXPvevlv1v+wowpwx3/3231303z3y3x',
    'k7/1p3bK1/5p2/B6p/2p1p2P/4pN1P/8/Q7 24 10 OFOHONOPOVOXYRYKYDYhYqYzY8tctetjtzt3t8t+4x4q4j4c4V4w4o4g45464748494+4/',
    'N7/7k/1p3QR1/2pPK3/3P1P2/1b4n1/2n5/5N2 21 14 AKARVMVDVOVHVeVnVNVFVdVUVTVSVRWOWGWeWmWuWXbTcTcUjald9s9u9z93',
    '8/1p1p1K1k/pPN1n3/1b4p1/P3N1R1/8/6R1/8 54 55 NENMNVSBSDSISMSYScShSjgYgZkTkVkakekqkukzk1memumlmn2u2+21202z2y2x2w23',
    '1K1Q3b/Nb6/k6n/5pPp/2p2p2/r7/6B1/8 54 9 BKDKDRDYDMDVDLDTDbDjDrDzD7DCDEDFDGDHICISIZeWeX2t2k2b2S2J2v292/',
    '5B2/1K4R1/5p2/1p5p/b2p2PP/1RN2r2/8/k7 41 57 FMFTFaFhFoJAJBJCJIJKJQJRJSOGOWOeONOMOLOKOPmemfphpZpxp5poqZqbqgqkqwq0q5q7',
    '8/1bp1p1p1/3Qp3/5p1N/N4n2/K4P1B/8/1k6 19 59 TKTMTaThTcTlTLTDTbTjTrTzT7TSTRTQTUfOfVflfugRgagqgxohopvmvdv2v9',
    '1n4k1/1Q6/1b2bK1p/5p1p/Rr3N1P/8/8/2n5 9 14 JAJCJQJSJbJkJtJ2J/JBJRJIJKJLJMJNJOJPVMVUVWVcgYgQgIgAgogwg4ghlUlWlblflrlvl0l2',
    'rk5B/1p6/1K1P4/P1p1R3/8/Pb6/6N1/4b1r1 28 4 HOHVRZRaTLYQcUcMcEckcsc0c8cbcacdcecfog2l2n2s28',
    '8/2q2pQ1/1PP5/1p1p1PP1/N7/7B/6N1/1k4K1 14 49 OFOHOVOcOjOqOxO4OXOGOWONOPRJRKdVeWgagqgxvm2l2n2s28+1+9+/',
    '5R1Q/p2rk3/7p/5p1b/1np5/b2N3K/2p5/8 7 21 FNFVFdFEFDFCFBFAFGHOHVHcHjHqHxH4HPHXHGrarcrhrlrxr1r6r8vnvuv2v3',
    '5B2/3nNK1k/p3pp2/2p5/2N5/1R2P3/1R6/4n3 49 55 FOFXMCMGMSMWMbMdNENUiRiTiYicioizphpZpRpJpBpopqprskx5xwxyxzx0x1x2x3',
    '7k/4p3/pP3pKp/8/2RN4/4P3/4b3/B1Q4N 34 2 RJWNWXWdiaiSiKiCiqiyihigjSjUjZjdjpjtjyj0sk4x4q6x6o6z6y6q656768696+/u/1',
    '3k2K1/6R1/Qbp1p2B/7P/2P4p/8/5p2/3rq3 16 0 GFGHGNGPOWOeOmOuO2O+ONOMOLOKOJOIOPQJQCQZQIQAQYQgQoQwQ4QRXeXlXsXzX6ia',
    '2k5/1p2b1N1/p3N3/2P1Q3/nr3P2/2P5/n7/K7 28 10 OEOdOfUDUFUKUeUjaScTcKcBcVcjckcsc0c8cbcdcecfldqiqh4w',
    '2N1r3/n2b4/1P5P/B7/p5P1/3Q2K1/P7/5q1k 43 61 CICMCTRJRIXPYhYqYzY8merirZrQrkrdrWrPryr5r0r9rjrbrTrLrzr7rqrprorsrtunwo',
    '7k/1N5p/ppb5/1r6/1Q1p1P1p/2n2n1K/8/8 33 5 JDJTJYJahYhahThMhFhohqhZhphxh5hghihjldvmv2',
    'b3k3/p1Kp4/P2B4/pr6/6p1/1P3R2/1n5b/8 45 5 KCTcTlTuT3phtltdtVtNtFt1t9tstrtqtutv',
    '7Q/p6p/2pB2pp/5p2/4pP1N/N5K1/8/6k1 7 56 HOHVHcHjHqHxH4HPHGHFHEHDHCHBHATKTBTMTFTaThTcnWndntn2oZoioyo5uv',
    '8/1r2Npp1/kpKP1P2/6PP/1B5p/7R/8/8 47 40 MCMGMWMbMdSbTLVOeWfXhYhahohqhzh8vnv3v/vuvtvsvrvqvpvo',
    '3n1Q2/N5p1/1p4P1/k2P1pr1/3p4/2P1NK2/8/8 5 40 FMFTFaFhFoFOFNFVFdFEFDFGFHICISIZbTqiqjsdsismsys2s7s9tlt0t1',
    '4k2r/1B1R3p/3Kp3/p1R1PN2/pp5r/8/8/8 26 2 JAJCJQJSJbJkJtJ2J/LDLKLMLNLOLPTKTSTUaSaKaCaiaqaya6aZaYabdMdOdXdjdndsdu',
    'r7/Rp6/5Kp1/2p2p1k/1PP2p2/2Q4p/8/1n6 42 47 IAIQIYIgIoIwI4IJVMVNVOVUVchZhaqjqcqxq4qzq8qyq6qpqoqrqsqtquqv',
    '1k1N4/5p1p/K7/2P3n1/1Pp2b2/5Q1N/3r4/5n2 45 9 DJDNDSDUQRQYQZaShZtktbtStJtAtmtft0t7t2t/tlt1t9tstrtqtptotuvevlv1v+',
    'k1K4R/3p1r2/4B2p/5R1N/4pP2/n5PP/8/8 29 24 CDCKHPHXHGHFHEHDULUNUbUiUpUwdVdNdcdbdadZdYdefOfVumvn',
    '6b1/r2B3p/7K/pp1p2P1/1p6/4P1Q1/n7/5k2 11 25 LCLELSLZLULdLmLvXOXfeWskulucuTuKuBunu1u8u3umu2u+utuv',
    '6B1/1p6/p2P1Q2/5p2/2Pn3r/7k/6pB/3N2K1 59 53 GNGUGbGPTLVMVDVOVHVcVjVeVnVNVFVdVUVWVXia3u3l3c7q7s7x71+1',
    '4b3/8/1pnbp1N1/5P2/K1Q1p1B1/1P6/8/n3k3 34 52 WFWHWMWcWlWndVdUgZiZiQibiUiri0i9iaiSiqiyi6ihijikmfmtm0m7mvph',
    '7n/4pr2/6pp/pQ1N1r2/P2R4/8/1n6/k1K5 25 49 ZQZSZLZEZiZrZ0Z9ZRZJZBZhZpZxZYZabKbMbRbVbhblbqbsjrjzj7jijhjkjljmjn6y6z',
    '1n6/5R2/4p3/p1nP1p2/rp3K1k/rB6/8/5b2 13 15 NFNVNdNMNLNKNJNINONPbTbUlclsltpgpipwpyp7',
    '8/4p2k/3p1p2/1n1R4/3b1PQ1/PpRb1K2/8/8 27 31 bTbjbabZbcbdbebfldmdmUmLmCmfmvmemWmOmGmum2m+mnogqiqaqSqKqCqyq6qpqrtut2',
    '3b2n1/6rk/p2p4/p7/2p3Qp/4K3/8/B1n3N1 38 14 mdmUmLmCmfmtm0m7mvmemWmOmum2mlmkmjmimnsjskslstszs14x4q4j4c4V4O+t+v+0',
    '8/1p4pp/4P3/1nB2R2/p6p/7b/6R1/4k1KB 29 61 UMaRaIaTaMaFahaoajasa1dVdNdFdldtd1d9dcdbdedf2u2m2e2W2O21202z2y2x2w23+3',
    '8/1p1n4/Q7/2pp2p1/2pP4/2nP3k/5KR1/7B 16 23 QJQZQiQIQAQYQgQoQwQ4QRQSQTQUQVQWQXjari1s1t18191+2u2m2e2+23',
    '6k1/2p1r3/6NQ/b2R3B/P3p3/4N3/4K2n/7n 22 12 WFWHWMWcWlWnXOXFXeXlXPXHbTbLbDbjbrbzb7babZbYbcbdbefmftsdsismsys2s7s907'
  ];
  /* ══ END POOL ══ */

  /* ONE GLYPH PER PIECE TYPE, BOTH COLORS. The chess canon draws white and black from the
     same filled set and separates them by fill and stroke, which is the whole reason every
     board on this site looks like one board ([[chess-visual-canon]]). Do not "correct" these
     to the outline code points — .mcb-p.w would then be an outline glyph with an outline
     stroke painted on it. */
  var GLYPH = { K: 9818, Q: 9819, R: 9820, B: 9821, N: 9822, P: 9823 };

  /* ⚠ POSITIONAL, AND IT MUST MATCH tests/gen-front-puzzles.js CHARACTER FOR CHARACTER —
     SQ64[i] IS square i. Two copies of an alphabet in two files is exactly the kind of pair
     that drifts, and the failure would be silent: the board would light up the wrong squares
     and call legal moves illegal. tests/style.check.js compares the two strings. */
  var SQ64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

  var cur = null, sel = -1, done = false, legal = null;

  /* ⚑ THE VERDICT LIVES ON THE CARD NOW (2026-08-08). `.mcb-say` keeps the standing prompt
     and is never overwritten, so "White to play. Mate in one." stays true the whole time
     instead of being replaced by the answer to it. */
  function tell(html, good, bad) {
    if (!verdict) return;
    verdict.innerHTML = html;
    verdict.classList.toggle('good', !!good);
    verdict.classList.toggle('miss', !!bad);
  }

  /* PAINT — put `cur` on the board and reset every mark. Split out of deal() 2026-08-08 so
     "Try Again" can re-lay the SAME position.

     ⭐ RETRY RE-PAINTS RATHER THAN UNDOES, and that is the whole reason it is safe. Undoing
     would mean knowing which branch you came from: a miss leaves the men exactly where they
     were, but a MATE has already moved a piece, removed a captured one and painted the king
     red. A retry built on "put the wrong mark away" would work perfectly on the branch it was
     written for and quietly corrupt the other one. Re-painting from the pool entry cannot
     tell the two apart, because it does not look. */
  function paint() {
    sel = -1; done = false;
    if (offer) offer.hidden = true;
    if (retryBtn) retryBtn.hidden = true;
    var marked = board.querySelectorAll('.mcb-sq.bad, .mcb-sq.good');
    for (var m = 0; m < marked.length; m++) marked[m].classList.remove('bad', 'good');
    if (!cur) { men.innerHTML = ''; legal = null; return; }

    /* unpack the referee's move list into from -> [to, to, …]. Two characters per move,
       so the loop steps by two and never has to parse anything. */
    legal = {};
    var pk = cur[3] || '';
    for (var q = 0; q + 1 < pk.length; q += 2) {
      var fr = SQ64.indexOf(pk.charAt(q)), to = SQ64.indexOf(pk.charAt(q + 1));
      if (fr < 0 || to < 0) continue;
      (legal[fr] || (legal[fr] = [])).push(to);
    }

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
    tell('');
  }

  /* ══ THE PUZZLE WEARS THE NIGHT — 2026-08-20 ════════════════════════════════
     Wave 1 of the rare-sky events. On an eclipse day the front door deals a mate that lands
     on a DARK square; on a meteor night, one delivered by a piece arriving from across the
     board. The position is still a real, proved mate in one — the only thing that changed
     is WHICH of the sixty-four the deal prefers.

     ⭐⭐ THE THEME IS DERIVED, NOT STORED, AND THAT IS THE WHOLE REASON THIS IS CHEAP. Every
     property here falls out of `fen from to`, which the pool already carries and this page
     already parses to draw the board. Tagging the pool instead would have meant a generator
     change and a REGENERATION — sixty-four new random positions churned through
     `npm run gen:puzzles` — to add information that was already sitting in the string.
     ⚠ Which also means the proof is untouched: this cannot introduce a position the referee
     did not verify, because it does not introduce positions at all. [[accuracy-above-all]]

     ⭐ IT DEGRADES TO THE ORDINARY DEAL, ALWAYS. No clock, no rare sky, or no position in
     the pool that fits tonight's theme — any of those and you get the plain random deal you
     would have got anyway. There is no state in which the front door has no puzzle. */
  var SQ_DARK = function (sq) { return ((sq % 8) + ((sq / 8) | 0)) % 2 === 1; };
  /* which piece stands on `sq`, straight out of the FEN's 64 characters */
  function pieceAt(fen, sq) {
    var b = [], i, ch;
    for (i = 0; i < fen.length; i++) {
      ch = fen.charAt(i);
      if (ch === '/') continue;
      if (ch >= '1' && ch <= '9') { for (var k = 0; k < +ch; k++) b.push('.'); }
      else b.push(ch);
    }
    return b[sq] || '.';
  }
  /* THE TWO THEMES, and each is one line about the mating move:
       eclipse — the mate lands on a DARK square. The shadow takes the board.
       meteor  — the mate arrives from a distance: a knight's leap, or four squares or
                 more in a straight line. A strike out of nowhere, which is the picture. */
  function fitsTheme(row, kind) {
    var p = row.split(' '), fen = p[0], from = +p[1], to = +p[2];
    if (kind === 'eclipse') return SQ_DARK(to);
    if (kind === 'meteor') {
      var pc = pieceAt(fen, from).toUpperCase();
      if (pc === 'N') return true;
      var dx = Math.abs((to % 8) - (from % 8)), dy = Math.abs(((to / 8) | 0) - ((from / 8) | 0));
      return Math.max(dx, dy) >= 4;
    }
    return false;
  }

  /* DEAL — a new position. The whole pool is already on the page, so dealing is a string
     split and one innerHTML: nothing fetched, nothing to wait for. */
  function deal() {
    var pool = POOL;
    try {
      var T = window.PJCC_TIME;
      if (T && T.skyKind && T.skyBeat && T.skyBeat('puzzle')) {
        var kind = T.skyKind();
        var themed = POOL.filter(function (row) { return fitsTheme(row, kind); });
        if (themed.length) pool = themed;      // ⚠ only when the theme HAS positions
      }
    } catch (e) {}
    cur = pool.length ? pool[(Math.random() * pool.length) | 0].split(' ') : null;
    paint();
  }

  /* PICK UP / PUT DOWN. One function owns the whole selection state — the lifted piece, the
     wash on its square and the dots on everywhere it may go — because three marks that can
     be set independently are three marks that will eventually disagree. */
  function lift(sq) {
    var held = men.querySelector('.mcb-p.lift');
    if (held) held.classList.remove('lift');
    var lit = board.querySelectorAll('.mcb-sq.sel, .mcb-sq.can');
    for (var i = 0; i < lit.length; i++) lit[i].classList.remove('sel', 'can', 'cap');
    sel = sq;
    if (sq < 0) return;
    var n = men.querySelector('.mcb-p[data-sq="' + sq + '"]');
    if (n) n.classList.add('lift');
    var home = board.querySelector('.mcb-sq[data-sq="' + sq + '"]');
    if (home) home.classList.add('sel');
    var to = (legal && legal[sq]) || [];
    for (var t = 0; t < to.length; t++) {
      var s = board.querySelector('.mcb-sq[data-sq="' + to[t] + '"]');
      if (!s) continue;
      s.classList.add('can');
      /* a ring, not a dot, when something is standing there — see the CSS note */
      if (men.querySelector('.mcb-p[data-sq="' + to[t] + '"]')) s.classList.add('cap');
    }
  }
  function canGo(from, to) {
    var list = legal && legal[from];
    return !!list && list.indexOf(to) >= 0;
  }

  /* ONE LISTENER ON THE BOARD, and the men layer is inert except for White's pieces
     (.mcb-men is pointer-events:none; `.mcb.live .mcb-p[data-mine]` opts back in). So a click
     on a BLACK piece falls through to the square underneath it, which is what makes "capture
     that piece" expressible with no extra code — and on a random pool the answer is a capture
     often enough that this is not a nicety. */
  board.addEventListener('click', function (e) {
    if (done || !cur || !e.target.closest) return;
    /* ⚠ THE OFFER IS INSIDE THE BOARD NOW (2026-08-08), so its clicks bubble through here.
       `done` is true for the whole time the card is up, which already stops them — this is
       the belt to that pair of braces: if a future state ever shows the card with the board
       still live, a tap on "Try Again" must not also be read as a move underneath it. */
    if (e.target.closest('.mcb-offer')) return;

    var mine = e.target.closest('.mcb-p[data-mine]');
    if (mine) {                                  /* pick a piece up, or put the same one down */
      var at = +mine.getAttribute('data-sq');
      /* they know how — retire the hint for good (2026-08-18) */
      hintDone();
      lift(at === sel ? -1 : at);
      return;
    }

    var sq = e.target.closest('.mcb-sq');
    if (!sq || sel < 0) return;
    var id = +sq.getAttribute('data-sq');
    if (id === sel) { lift(-1); return; }

    /* ── LEGAL FIRST, THEN THE VERDICT (2026-08-05) ────────────────────────────────
       Nate: "you can click any square even if illegal and it'll call it wrong."

       He is describing the bug exactly. This branch used to run on ANY square, so putting
       a rook on a square no rook can reach was graded — and graded WRONG, then the one
       attempt was spent and the offer came up. Being told you failed a chess puzzle for
       doing something that is not a chess move is the worst version of being wrong.

       An illegal square is not an answer, so it is not marked: the piece goes back down
       and the puzzle is still there. Only a real move gets a verdict, and then it is the
       same two-integer comparison it always was. */
    if (!canGo(sel, id)) { lift(-1); return; }

    /* ── THE VERDICT. Two integers, and no opinion about chess. ──
       ⚠ `from` is read BEFORE lift(-1), which sets sel back to -1 — the dots have to come
       off the board either way, and the square the piece came from is needed after that. */
    var from = sel;
    done = true;
    lift(-1);
    if (from === +cur[1] && id === +cur[2]) {
      var moving = men.querySelector('.mcb-p[data-sq="' + from + '"]');
      var taken  = men.querySelector('.mcb-p[data-sq="' + id + '"]');
      if (taken && taken !== moving) taken.parentNode.removeChild(taken);
      if (moving) {
        moving.setAttribute('data-sq', id);
        moving.style.gridArea = (((id / 8) | 0) + 1) + '/' + ((id % 8) + 1);
      }
      var king = men.querySelector('.mcb-p.b[data-pc="k"]');
      if (king) king.classList.add('mated');
      sq.classList.add('good');
      /* NO TIMER, NO location.href (2026-07-29) — the reward for being right is that the
         position STAYS on the screen. The card is a door, never an escort. */
      tell('Yes!', true);
      /* ⚠ no Try Again on a mate: there is nothing left to try. See the markup note. */
      if (retryBtn) retryBtn.hidden = true;
    } else {
      /* ── wrong, and that is a fine place to end up. A LEGAL move that isn't the mate: no
         refutation, no lesson, no reveal — he asked for a MARK. The offer appears either
         way. (An ILLEGAL square never reaches here; see the note above.) ── */
      sq.classList.add('bad');
      tell('Not quite.', false, true);
      if (retryBtn) retryBtn.hidden = false;
    }
    if (offer) offer.hidden = false;
  });

  /* ── THE FIRST-CLICK HINT (2026-08-18) — see the note over `.mcb-say` in the markup.
     Self-contained and failure-proof: no element, no hint; no storage, no crash. */
  var hint = document.getElementById('mcb-hint'), hintTimer = null;
  function hintDone() {
    if (hintTimer) { clearTimeout(hintTimer); hintTimer = null; }
    if (hint) hint.hidden = true;
    /* ⚠ `.has-hint` deliberately STAYS. Taking the reserved line back the instant they pick
       up a piece would move the board under the hand that just touched it. It costs 13px for
       the rest of one page view, once, ever. */
    try { localStorage.setItem('mcb.moved', '1'); } catch (e) {}
  }
  (function armHint() {
    if (!hint) return;
    var known = false;
    try { known = localStorage.getItem('mcb.moved') === '1'; } catch (e) {}
    if (known) return;
    /* ⚠⚠ RESERVE THE ROOM NOW, NOT IN FIVE SECONDS. Measured: without this the caption grows
       13px when the hint appears, and on a phone that pushes the green button down mid-visit.
       The class goes on at paint and stays on for the rest of the page view. */
    if (say) say.classList.add('has-hint');
    /* ⚠ `done` is the board's own "a verdict is up" flag — if they solved it inside five
       seconds the hint must not arrive on top of the offer card. */
    hintTimer = setTimeout(function () { if (!done) hint.hidden = false; }, 5000);
  })();

  /* ── THE THREE PROOFS, ONE AT A TIME (2026-08-18) — see `.mc-true.is-rotating` in the
     stylesheet above for why this is script-only and what it deliberately does not do.
     Self-contained: no list, no rotation; reduced motion, no rotation; and either way the
     three lines are already on the page before this runs. */
  (function rotateProofs() {
    var list = document.querySelector('.mc-true');
    if (!list) return;
    var items = list.querySelectorAll('li');
    if (items.length < 2) return;
    /* ⚠ BOTH BRAKES, not just the media query. `reduce-flourish` is the site's own setting for
       people who want the page calm without telling their OS about it. */
    try { if (matchMedia('(prefers-reduced-motion: reduce)').matches) return; } catch (e) {}
    if (document.documentElement.classList.contains('reduce-flourish')) return;

    list.classList.add('is-rotating');
    items[0].classList.add('is-on');
    var at = 0, held = false;
    /* 4.6s: long enough to finish reading seventeen words without hurrying, short enough that
       all three have had a turn inside fifteen seconds. Picked by reading them aloud, which is
       the only test that matters for a line of text that leaves on its own. */
    setInterval(function () {
      if (held) return;
      items[at].classList.remove('is-on');
      at = (at + 1) % items.length;
      items[at].classList.add('is-on');
    }, 4600);
    function hold() { held = true; }
    function release() { held = false; }
    list.addEventListener('mouseenter', hold);
    list.addEventListener('mouseleave', release);
    list.addEventListener('focusin', hold);
    list.addEventListener('focusout', release);
  })();

  var again = document.getElementById('mcb-again');
  if (again) again.addEventListener('click', function () { deal(); });
  /* Try Again keeps `cur` and re-lays it — same position, clean board. */
  if (retryBtn) retryBtn.addEventListener('click', function () { paint(); });

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

{%- comment -%} ══ THE GAUNTLET DOOR, HYDRATED ═════════════════════════════════════
     2026-08-04, Nate: "add the APPROPRIATE gauntlet door to the gauntlet box."

     The door in the card is already painted — arch, leaf, seam, all static markup, exactly
     like the board above it. The script only tells it WHICH floor it is standing at, so the
     leaf hanging in the arch belongs to the room you are about to walk into.

     ⚑ THE SCRIPT MOVED OUT ON 2026-08-19, to /assets/js/pjcc-gauntlet-door.js, and it took
     the ladder names, the ten accents and the ten glyphs with it. This page and games.md
     each carried their own copy of all four, both labelled "keep in sync" — and the fix
     Nate asked for that day (the door should open at the floor the ACCOUNT reached, not the
     one this browser remembers) would have had to be written twice and drift twice.
     The LOOK was already one file (_sass/_pjcc-21-gauntlet-door.scss); the STATE is now too.
     [[gauntlet-door-one-file]] · [[one-fix-every-instance]] {%- endcomment -%}
<script src="{{ '/assets/js/pjcc-gauntlet-door.js' | relative_url }}"></script>

<script>
/* ══ PICK UP WHERE YOU LEFT OFF ══════════════════════════════════════════════════════
   2026-08-11, his #4: "number 4 may be another great thing that keeps people coming back!"
   (He also said he may pull or modify it — so it is ONE element, ONE script block, and
   deleting both leaves the page exactly as it was.)

   WHAT IT SAYS, in priority order, and it says only ONE of them:
     1. a puzzle rating, if we know one — the most specific thing we know;
     2. otherwise how far along the road to Chess City they are;
     3. otherwise nothing at all, and the element stays hidden.

   ⚑ WHERE THE NUMBERS COME FROM, in two passes: this browser paints instantly, and then the
   ACCOUNT is allowed to raise what it painted. Signed out, only the first pass ever happens
   and it costs nothing. The long note down at pass 2 has the whole story — including the
   claim that used to live here ("the front door loads no profile script") and why it was
   false. [[one-fix-every-instance]]

   ⚠ THE WHOLE THING IS IN A try/catch. Safari in private mode throws on localStorage access
   rather than returning null, and a front door that dies on its own welcome-back line would
   take the puzzle and the gauntlet door down with it ([[down-never-stuck]]).

   ⚠ THIS PAGE WRITES NOTHING OF ITS OWN — but it is no longer true that nothing is written
   at all: `PJCC.puzzleRating()` caches the higher of (local, profile) as part of answering.
   That is the profile module's own reconcile, the same one every room triggers, and it can
   only ever raise a number. A bug here can still cost a rating but never corrupt one. */
(function () {
  var el = document.getElementById('mc-resume');
  if (!el) return;

  /* ⚠ THE URL COMES FROM A data- ATTRIBUTE, NOT FROM LIQUID IN THIS SCRIPT. A Liquid output
     tag written inside a single-quoted JS string leaves the RAW file unparseable, and the
     raw file is what `style.check.js` parses to prove every inline script on the site is
     valid JavaScript. Liquid belongs in the markup, where it has somewhere to stand. */
  var href = el.getAttribute('data-href') || '/games/fork-in-the-road/';
  var read = function (k) { try { return JSON.parse(localStorage.getItem(k)) || null; } catch (e) { return null; } };
  /* ⚠ THE NUMBERS ARE WRAPPED, NOT JUST PRINTED. `.rs-num` is what makes his rating and his
     count the loud things in this block — the CSS cannot find them without the span, and a
     bold applied to the whole sentence would just be a bold sentence. */
  var num = function (n) { return '<span class="rs-num">' + n + '</span>'; };

  /* what the line is REPORTING right now, so the account can only ever raise these */
  var rating = 0, solved = 0, clean = 0, step = 0;

  function paint() {
    var html = '';
    if (rating > 0) {
      /* ⚑⚑ TWO NUMBERS SINCE 2026-08-26 (Nate: "I feel like it should be solved correctly,
         the puzzles. Or maybe we have both numbers there.").

         ⚠ THE OLD LINE HERE WAS A LIE, AND THE COMMENT BESIDE IT WAS THE REASON IT SURVIVED.
         It read "N solved correctly" and justified the stricter word by asserting the Puzzle
         Room only counts a clean solve. It does not — `settlePuzzle()` counts every finished
         puzzle, and a REVEAL routes straight through it. Nate asked "have I only done 26
         puzzles correctly?" and the honest answer was that 26 was the wrong figure for the
         question. Nothing measured the claim, so nothing caught it. [[audit-numbers-can-be-wrong]]

         So the room now keeps both, and the sentence only ever says what it can prove:
           both, and different →  "…is 812 after 27 puzzles — 19 solved clean."
           a perfect record    →  "…is 812 after 19 solved clean."   (nothing to contrast)
           clean not seeded    →  "…is 812 after 27 puzzles."        (the honest half)
         ⭐ NO PARENTHETICAL, NO PERCENTAGE. "19 of 27 (70%)" turns a welcome into a report
         card, and the one thing this line has to do is make somebody want to play again. */
      var tail = '';
      if (clean > 0 && solved > clean) {
        tail = ' after ' + num(solved) + ' puzzles \u2014 ' + num(clean) + ' solved clean';
      } else if (clean > 0) {
        tail = ' after ' + num(clean) + ' solved clean';
      } else if (solved > 0) {
        tail = ' after ' + num(solved) + ' puzzle' + (solved === 1 ? '' : 's');
      }
      html = '<b>Welcome back!</b> Your puzzle rating is ' + num(Math.round(rating)) + tail + '.';
    } else if (step > 0) {
      html = '<b>Welcome back!</b> You are ' + num(step) + ' puzzle' + (step === 1 ? '' : 's') +
             ' along the road to Chess City.';
    }
    if (!html) return;                       /* a stranger sees nothing, and nothing moves */
    /* ⚠ class="rs-go" IS NOT DECORATION. The theme's `a:not([class])` rule out-specifies this
       page's own link color, so an anchor with no class paints dark ink no matter what the
       page asks for. The class is what opts this link out of that rule. */
    el.innerHTML = html + ' <a class="rs-go" href="' + href + '">Keep going &rarr;</a>';
    el.hidden = false;
  }

  /* 1. THIS BROWSER PAINTS FIRST — instant, and it is all a signed-out visitor ever gets. */
  try {
    var pz = read('pjcc.puzzle.rating.v1');
    var jr = read('pjcc.fork.journey.v2');
    if (pz && typeof pz.rating === 'number' && pz.rating > 0) rating = pz.rating;
    if (pz && typeof pz.solved === 'number' && pz.solved > 0) solved = pz.solved;
    if (pz && typeof pz.clean === 'number' && pz.clean > 0) clean = pz.clean;
    if (jr && typeof jr.step === 'number' && jr.step > 0) step = jr.step;
    /* ⭐ THE ROAD IS A FLOOR UNDER THE CLEAN COUNT, and this page can read it before
       pjcc-profile.js has loaded to do its own one-time seed. The road only advances on an
       earned solve, so that many clean solves have provably happened. It can understate; it
       cannot overstate. And a clean solve is still a solve, so `solved` is raised with it —
       "26 puzzles — 30 solved clean" is a sentence that cannot be true.
       ⚠ THE FLOOR IS THE HIGH-WATER MARK, NOT WHERE YOU ARE STANDING TODAY. `step` is the
       current position and `best` is the furthest reached; seedClean() in pjcc-profile.js
       takes the max of both, and reading only `step` here would paint a lower number for a
       moment and then visibly tick UP when the profile module lands. Both halves of a merge
       have to agree on the arithmetic or the disagreement shows on screen. */
    var road = Math.max(step, (jr && parseInt(jr.best, 10)) || 0);
    if (road > clean) clean = road;
    if (clean > solved) solved = clean;
    paint();
  } catch (e) { /* storage denied — the page is unchanged, which is the correct outcome */ }

  /* 2. …THEN THE ACCOUNT GETS A SAY — 2026-08-26 ─────────────────────────
     Nate: "the cw page shows a certain puzzle counter, but on my mobile device it shows
     another. It should be uniform."

     He is describing localStorage. This line used to read the two progress keys RAW, so it
     reported what THIS BROWSER had seen — his desktop and his phone are two browsers, so one
     number each, both of them honest and neither of them his. The server has known the real
     figures all along: `profiles.puzzle_rating` / `puzzle_solved`, and the `fork-in-the-road`
     stat row for the road.

     ⚠⚠ THE OLD COMMENT HERE SAID "the front door loads no profile script", AND THAT WAS
     FALSE — it is the premise the raw read was justified with. `_layouts/default.html` loads
     `pjcc-profile.js` on EVERY page (line 163). What is true is that it loads it AFTER the
     layout's content tag (line 85), so `window.PJCC` does not exist yet at parse time and a
     bare `if (window.PJCC && …)` here is silently false forever. Measured, not assumed:
     `typeof window.PJCC` is "undefined" when this script runs and "object" after that tag.

     ⛑⛑⛑ AND NAMING THAT TAG WITH ITS BRACES PUT THE WHOLE PAGE ON THE SCREEN — 2026-08-26.
     This comment originally wrote the layout's content tag out in full, as an example. Liquid
     does not know it is inside a JS comment: it EXPANDED it, injected the page's own rendered
     body into the middle of this script, and the first closing script tag that came along
     with it ended this block early. Everything after that was handed to kramdown, which set my
     comment prose as paragraphs and code blocks on the live front door. Nate saw it before I
     did — *"looks like some code got pasted accidentally."*

     ⭐ THIS IS THE SAME MISTAKE AS THE `assign` ONE THE DAY BEFORE, ONE LAYER OVER. That was
     a Liquid TAG in a Liquid comment; this is a Liquid OUTPUT tag in a JS comment. The gate I
     added for the first one only understood tag-delimiters and sailed past output ones. A comment is
     prose to a human and source to Liquid, in every comment syntax there is — so the rule is
     not "avoid it in Liquid comments", it is NEVER TYPE LIQUID DELIMITERS IN PROSE, anywhere.
     `tests/style.check.js` now checks JS comments inside script bodies too. [[markdown-eats-scripts]]

     ⭐ SO WAIT FOR IT — DO NOT LOAD A SECOND COPY. `pjcc-profile.js` is an IIFE ending in
     `window.PJCC = PJCC`; a second tag builds a second object over the first, orphans every
     `onChange` registered against the original, and stands up a second Supabase auth client
     on the same storage key. That is a documented way to lose a session mid-refresh, and it
     was removed from `_layouts/home.html` (2026-07-21) and `puzzle-reports.md` for exactly
     that reason. DOMContentLoaded is the house pattern and it costs nothing.

     ⚠ THE ACCOUNT ONLY EVER RAISES. Win a puzzle on this phone while the write is still in
     flight and the local number is the fresher one; taking the max is the only direction that
     can never walk a rating backwards. Same rule as the gauntlet door beside it.
     ⚠ `PJCC.puzzleRating()` DOES CACHE what it reconciles, so this block no longer honors the
     old "nothing is written" note. That is the point: the merge it performs is the same one
     every room performs, and caching the higher number is what makes the NEXT visit agree
     with this one. This page still writes nothing of its own. */
  function whenPJCC(fn) {
    if (window.PJCC) { fn(); return; }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { if (window.PJCC) fn(); });
    }
  }

  try {
    whenPJCC(function () {
      if (!PJCC.ready) return;
      PJCC.ready.then(function () {
        /* already merges the profile row in and keeps the higher of the two */
        if (PJCC.puzzleRating) {
          var o = PJCC.puzzleRating();
          if (o && o.rating > rating) { rating = o.rating; }
          if (o && o.solved > solved) { solved = o.solved; }
          if (o && o.clean > clean) { clean = o.clean; }
          if (clean > solved) { solved = clean; }
        }
        paint();
        return PJCC.myStats ? PJCC.myStats() : null;
      }).then(function (st) {
        var i, row = null;
        for (i = 0; st && i < st.length; i++) {
          if (st[i].game === 'fork-in-the-road') { row = st[i]; break; }
        }
        var srv = (row && row.data && parseInt(row.data.step, 10)) || 0;
        if (srv > step) { step = srv; paint(); }
      })['catch'](function () {});   /* a welcome line that throws on a slow network is worse than a local one */
    });
  } catch (e) {}
})();
</script>
