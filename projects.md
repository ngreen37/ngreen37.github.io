---
layout: page
title: McPuppy Studios
permalink: /projects/
body_class: theme-studio
tab_title: McPuppy Studios — The Studio Behind ChessWild
description: McPuppy Studios — the independent studio behind ChessWild. The Academy, the games and the build log, and how far along each one is.
---

{% comment %} ── THE PAGE IS CALLED McPUPPY STUDIOS NOW (2026-08-10) ────────────────
     Nate: "Projects page → 'McPuppy Studios', on the page and in the left nav, and edit
     the nav description too."

     Why it was ever called Projects: this page started life as a list of things being
     built, and the name described the LIST. It stopped being that in July, when the
     master bar came off and it became a page about the studio — so "Projects" had been
     naming the furniture rather than the room for about three weeks.

     ⚠ THE ADDRESS DOES NOT CHANGE. /projects/ is referenced from _data/brands.yml,
     _layouts/default.html (the 🐾 badge and the McPuppy hop), _layouts/home.html,
     assets/js/pjcc-nav.js and tests/perf.js, and mcpuppystudios.com 301s into it with
     the path preserved. The identity changes; the URL never does.

     `tab_title` is still set by hand. Left alone the tab would read "McPuppy Studios |
     P&JCC", which puts the studio UNDER its own property — the wrong way round for the
     one page that is about the studio itself. {% endcomment %}

{% comment %} 2026-07-22 (Nate: "About the Studio is fine"). The on-page title is now
     "About the Studio", which is what this page actually is — the last piece of the
     "five landing pages" problem from docs/front-door-2026-07-21.md.

     `tab_title` is set deliberately. Without it the <title> would have become
     "About the Studio | P&JCC" and the studio's own NAME would have vanished from the
     browser tab and from search results for the one page that is about the studio. The
     visible heading can be plain because the page is already inside McPuppy chrome; the
     tab has no such context and has to carry the brand. `description` is new for the
     same reason — this page never had one. {% endcomment %}

{% comment %} ── THIS PAGE STOPPED BEING A SECOND HOME (2026-07-21) ─────────────────
     Nate: "Perhaps McPuppy page should simply be 'About The Studio'… we can't have five
     landing pages." Step 0 of docs/front-door-2026-07-21.md.

     What was here: a `.studio-master` command bar — five equal doors (P&JCC · Blog ·
     Mailing List · Direct Line · For Educators) ruled across the very top of the page.
     It was the single thing making /projects/ read as a landing page rather than a page
     ABOUT something, and every one of its five destinations is already in the McPuppy
     nav in the site header, two of them twice. A page whose first element is a nav bar
     is a hub; a page whose first element is a title and a sentence is an about page.

     Going with it: `own_title: true` and the hand-placed <h1> + its -44px full-bleed
     hack. Those existed ONLY so the title could sit BELOW the master bar (2026-07-17
     Nate: "move the links … to ABOVE the McP Title"). With no bar to sit below,
     _layouts/page.html renders the sky-banner title normally again and the override is
     just a way to get it subtly wrong.

     The address does NOT change: /projects/ is referenced from _data/brands.yml,
     _layouts/default.html (the 🐾 badge and the McPuppy hop), _layouts/home.html,
     assets/js/pjcc-nav.js and tests/perf.js. The identity changes; the URL never does.
     Restore the bar: git show <this commit>^ -- projects.md {% endcomment %}

{% comment %} 2026-08-25 (Nate: "Remove the text after 'March 2026' because it refers to
     PJCC"). The clause was "…with the main goal of showing the world the beauty and value
     of the P&JCC universe" — the studio's stated PURPOSE, named after the property it is
     now hiding. What is left is a fact with no claim attached, which is the correct thing
     to say about a studio whose flagship is under wraps. [[slow-roll-cast]] {% endcomment %}
<p class="projects-intro">McPuppy is an independent studio created in March 2026.</p>

{% comment %} DEAD CSS REMOVED 2026-07-13 (dead-code audit). ~65 lines of page-local styles for
     TWO CARDS THAT NO LONGER EXIST on this page: the gold "featured / playable now" treatment
     built for Notation Blitz (.project-card-featured, .featured-ribbon, .project-status-done,
     .project-link-play, .project-title .ver, @keyframes blitzGlow/donePulse/playPulse) and the
     red TERMINATED state (.project-card-terminated, .project-status-terminated,
     .project-link-terminated, @keyframes termBlink). Both cards were cut long ago; their
     styles kept shipping to every visitor.

     Worth knowing WHY the sweep never caught this: tests/sweep.js reads class DECLARATIONS out
     of _sass/ only, so CSS written inline in a page's own style block is invisible to it — it
     can never be reported as dead. Anything page-local has to be found by hand.

     (And do NOT write the literal tag name in a comment like this one. Liquid strips comments
     at build time so the site is fine, but every tool that reads the RAW file — the test
     harness, a scraper, an editor's folding — sees a style block opening here and swallows the
     real CSS below it. That cost me a confusing render.)
     Restore: git show ea5a2c5 -- projects.md {% endcomment %}

{% comment %} ── THE STUDIO'S TWO CLOCKS ──────────────────────────────────────────────
     Rebuilt 2026-07-12 (Nate: "significantly reduce the size of the counter boxes and
     change both formats completely. It looks really out of place now").

     He's right on both counts, and the "out of place" is the interesting one: this page
     is `theme-studio` — McPuppy's warm monochrome, #131218 cards and a #caa24a gold. The
     counters were two big PURPLE-and-TEAL boxes: the last survivors of the P&JCC palette,
     on a page that stopped being PJCC. They were shouting in a color the room no longer
     speaks.

     Format, completely changed: they were two tall centered cards each running a
     `134d 07:22:41` stopwatch, ticking every second. A two-year project measured to the
     SECOND is a gag, not information — and it cost two 1Hz timers on an otherwise static
     page.

     They're a slim TWO-CELL RIBBON now: one big honest number (days), one quiet line of
     context, in the studio's own gold. Half the height, and the clock ticks once a minute
     instead of sixty times. The milestone rides on the context line as a small gold tag
     instead of owning a whole row of its own. ─────────────────────────────────────── {% endcomment %}
{% comment %} The two clocks now render at the FOOT of the page, just above the
     thank-yous (2026-07-17 Nate: "move the counters to the bottom, just above the Thank
     Yous") — the markup + its tick script live down there; these styles stay here. {% endcomment %}
<style>
/* ONE cell now, not two — the Episode 1 countdown was removed 2026-07-28 (see the block
   comment down at the markup). The ribbon keeps its full width because it reads as a
   rule across the page; the receipts row underneath is what fills the space the second
   clock used to take. */
.pj-clocks { display: grid; grid-template-columns: 1fr; margin: var(--space-4) 0 var(--space-3);
  background: #131218; border: 1px solid #2a2830; border-radius: var(--r-sm); overflow: hidden; }
  /* adoption: margin 16→--space-4 (exact) / 22→24 (--space-5, 2px rhythm snap); border-radius 10px = --r-sm exact (a small panel — could move to --r-md per the Surface Kit, but --r-sm keeps the current look) */
.pj-clock { display: grid; grid-template-columns: auto auto 1fr; align-items: baseline;
  gap: 2px var(--space-2); padding: var(--space-3) var(--space-4); }
  /* adoption: col-gap 8px = --space-2, padding 12/16 = --space-3/--space-4 (all exact); the 2px row-gap stays literal (below the scale) */
.pj-clock + .pj-clock { border-left: 1px solid #2a2830; }
/* the "still working" pulse — the only motion left in the ribbon */
.pj-clock-dot { grid-row: 1; width: 6px; height: 6px; border-radius: 50%; background: #caa24a;
  align-self: center; animation: pjPulse 2.4s ease-in-out infinite; }
@keyframes pjPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.25; } }
.pj-clock-k { grid-row: 1; font-family: 'Share Tech Mono', monospace; font-size: 10px;
  letter-spacing: 0.18em; text-transform: uppercase; color: #8a8592; white-space: nowrap; }
.pj-clock-n { grid-row: 2; grid-column: 1 / 3; font-family: 'Poppins', sans-serif;
  font-size: 1.7rem; font-weight: 800; line-height: 1.15; color: #f2efe8; }
.pj-clock-c { grid-row: 2; font-family: 'Share Tech Mono', monospace; font-size: 11px;
  color: #8a8592; }
/* .pj-clock-tag (the gold ★ milestone tag) went with the milestones, 2026-07-13. */
@media (max-width: 560px){
  .pj-clocks { grid-template-columns: 1fr; }
  .pj-clock + .pj-clock { border-left: none; border-top: 1px solid #2a2830; }
}
@media (prefers-reduced-motion: reduce){ .pj-clock-dot { animation: none; } }

/* ── "Also on the board" — the four not-started things, at the weight they deserve ── */
.pj-also { margin: var(--space-5) 0 var(--space-4); }
.pj-also-h { font-family: 'Share Tech Mono', monospace; font-size: 10px;
  letter-spacing: 0.18em; text-transform: uppercase; color: #8a8592;
  margin: 0 0 var(--space-3); font-weight: 600; }
.pj-also-list { list-style: none; margin: 0; padding: 0; display: grid;
  grid-template-columns: 1fr 1fr; gap: 2px var(--space-4); }
.pj-also-list li { display: flex; align-items: baseline; gap: 10px;
  padding: 9px 0; border-top: 1px solid #23212a; font-size: 0.84rem;
  color: #8a8592; line-height: 1.5; }
.pj-also-list b { color: #4b4753; font-size: 0.95rem; flex: none; }
.pj-also-list strong { color: #c9c4d0; font-weight: 600; }
@media (max-width: 620px) { .pj-also-list { grid-template-columns: 1fr; } }

/* ── "In the Works" — three cryptic boxes under the Academy (2026-08-27) ─────────
   Lighter than a .project-card by design: no status badge, no link, no corner piece.
   See the block comment at the markup for why they are not cards.
   ⚠ The panel colors are the page's own (#131218 on #2a2830), the same pair the clock
   ribbon at the top uses — so this row reads as belonging to the page rather than as a
   fourth surface treatment on it. */
.pj-next { margin: var(--space-4) 0 var(--space-5); }
.pj-next-h { font-family: 'Share Tech Mono', monospace; font-size: 10px;
  letter-spacing: 0.18em; text-transform: uppercase; color: #8a8592;
  margin: 0 0 var(--space-3); font-weight: 600; }
.pj-next-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-3); }
.pj-next-box { background: #131218; border: 1px solid #2a2830;
  border-radius: var(--r-sm); padding: var(--space-4); }
.pj-next-box b { display: block; color: #4b4753; font-size: 0.95rem; line-height: 1;
  margin-bottom: var(--space-2); }
.pj-next-box strong { display: block; font-family: 'Poppins', sans-serif; font-weight: 800;
  font-size: 0.95rem; color: #c9c4d0; letter-spacing: -0.01em; }
.pj-next-box span { display: block; margin-top: 5px; font-family: 'Share Tech Mono', monospace;
  font-size: 11px; color: #8a8592; line-height: 1.5; }
/* One column below 620, matching .pj-also-list — three boxes at a third of a phone width
   would set two of the three names on two lines each. */
@media (max-width: 620px) { .pj-next-grid { grid-template-columns: 1fr; } }


/* ── receipts — numbers that only go up ───────────────────────────────────────── */
.pj-receipts { margin: 0 0 var(--space-5); }
.pj-receipts-h { font-family: 'Share Tech Mono', monospace; font-size: 10px;
  letter-spacing: 0.18em; text-transform: uppercase; color: #8a8592;
  margin: 0 0 var(--space-3); font-weight: 600; }
.pj-receipts-list { list-style: none; margin: 0; padding: 0; display: flex;
  flex-wrap: wrap; gap: var(--space-3) 0; }
.pj-receipts-list li { flex: 1 1 128px; padding: 0 var(--space-4);
  border-left: 1px solid #2a2830; }
.pj-receipts-list li:first-child { border-left: none; padding-left: 0; }
.pj-receipts-list b { display: block; font-family: 'Poppins', sans-serif;
  font-size: 1.45rem; font-weight: 800; line-height: 1.1; color: #caa24a; }
.pj-receipts-list span { display: block; margin-top: 3px;
  font-family: 'Share Tech Mono', monospace; font-size: 10.5px; color: #8a8592;
  line-height: 1.45; }
@media (max-width: 620px) {
  .pj-receipts-list li { flex: 1 1 40%; border-left: none; padding: 0 var(--space-2); }
  .pj-receipts-list li:first-child { padding-left: var(--space-2); }
}

/* (the .pj-ask block — "What the studio needs" — came out 2026-07-28 with its markup;
   the styles went with it rather than sitting here waiting, because dead CSS fails the
   sweep and, worse, quietly rots. FUTURE-IDEAS holds the spec for when it comes back.) */
</style>
{% comment %} ── THE P&JCC CARD CAME OFF — 2026-08-25 ───────────────────────────────
     Nate: *"remove PJCC box from McPuppy Studios … The idea is we are going to shock the
     world with PJCC once it is closer to fruition — currently we have a long ways to go."*

     ⚑ THIS IS THE LAST STEP OF THE SLOW-ROLL, not a demotion of the series. Every public
     door to /pjcc/ closed earlier the same day (the rail row, the front door's world card,
     the header's center mark, the ⌘K entry, then this card's LINK). What was left was a
     card that still ANNOUNCED the flagship by name on the studio's own front page — which
     is the one thing the slow-roll is for. The name, the logline, the Princess render and
     the Blender caption all went with it. [[slow-roll-cast]]

     ⚠⚠ THE FLICKERING "i" DOOR TO /classified/ WENT WITH THIS CARD, and it was the LAST
     ONE. It moved here from /pjcc/'s hero only hours earlier (see git history); the ✦ night
     star had already been demoted from <a> to <b>, so /classified/ → /archive/ → /recovery/
     → /dispatch/ now has NO entrance at all. That wing is unreachable, not deleted. Restore
     the door — anywhere, any host sentence — and the whole wing lights back up. Flagged to
     Nate the same day; awaiting his call on where it should live.

     ⚠ WHAT WENT WITH IT so nothing is left rotting: the `.pj-flag-grid` / `.pj-shot` /
     `.pj-flag-body` styles up in the style block, and the page-local `.project-desc .tg-x`
     flicker rules that drove the "i" (`@keyframes tgx-radio` is global — leave it alone,
     other flair uses it). Restore all of it together:
     `git show <this commit>^ -- projects.md`

     ⚠ THE HISTORY OF THIS BLOCK, from the 2026-07-28 skeptic pass, still applies to what
     remains: six equal cards, four of them saying NEXT UP, made the page read as *four
     things haven’t started*. The two BUILDING cards owned the page and the four not-started
     ones share the quiet row below. With P&JCC gone the Academy is the only card left — and
     the "there is not one image on this page" finding is now open again, because the render
     that answered it was P&JCC’s. FUTURE-IDEAS carries it.
     ─────────────────────────────────────────────────────────────────────── {% endcomment %}
<div class="projects-list">

  <div class="project-card project-card-active">
    <div class="project-card-corner-piece" aria-hidden="true">♟</div>
    <div class="project-card-header">
      <span class="project-status project-status-active">
        <span class="project-status-dot"></span>
        Building
      </span>
      <h2 class="project-title">ChessWild Chess Academy</h2>
    </div>
    {% comment %} 2026-08-25 (Nate: "Change the Academy description to read 'from the
         Chesswild site' instead of PJCC characters"). Auston and Crockett stay — they are
         the teachers and they are named on the Academy itself. What changed is where they
         are said to come FROM: sourcing them to the P&JCC universe on the one page a
         stranger reads first is the announcement the slow-roll is avoiding. "the ChessWild
         site" is true, checkable in one click, and says nothing about the series.
         ⚠ HOUSE SPELLING IS `ChessWild`, camel-cased — 81 occurrences to 4. {% endcomment %}
    <p class="project-desc">An All-Ages online Chess Academy, taught by Auston and Crockett from the ChessWild site. Free, and open now.</p>
    <div class="project-links">
      <a href="/academy/" class="project-link">Visit the Academy &rarr;</a>
    </div>
  </div>

</div>

{% comment %} ── THREE BOXES, 2026-08-27 (Nate: "let's make boxes for the tournament board —
     but call it something generic, Campaign, and Checker Town. Be SUPER cryptic and short,
     but give them boxes below the academy"). All three are the Godot work.

     ⚠⚠ THEY ARE DELIBERATELY NOT `.project-card`s, AND THAT IS THE WHOLE DESIGN DECISION.
     The 2026-07-28 skeptic pass found that six equal cards, four of them saying NEXT UP, made
     this page read as "four things haven't started" — the fix was to demote the not-started
     ones to one quiet row, and adding three more full cards would rebuild the exact problem
     that fix removed. So the Academy keeps the only card on the page: it is the one thing
     open to the public today. These are lighter, smaller, statusless boxes underneath it.

     ⚠ NO LINKS, ON PURPOSE. There is nowhere to send anyone yet, and a box that looks
     clickable and is not is worse than a box that plainly is not. When one ships it becomes
     a real `.project-card` with a link and comes OUT of this row.

     ⚠ THE NAMES: "Broadcast" is the generic one he asked for — the tournament board that
     animates a PGN, and the word gives away neither chess tournaments nor Godot. Campaign and
     Checker Town are his own names for the other two.
     ⚠ CHECKER TOWN IS SAFE TO NAME. It is NOT one of the three slow-rolled locations (those
     are The Sea, Mystery City and Chess-City Elementary) — it has a public page already, and
     the puzzle road prints it on the front door. Checked, not assumed.
     ⚠ THE GLYPHS ARE POSITIONAL, like the row below: ♞ ♚ ♟ reading across. Reordering the
     boxes means reordering the pieces. {% endcomment %}
<section class="pj-next" aria-labelledby="pj-next-h">
  <h2 class="pj-next-h" id="pj-next-h">In the Works</h2>
  <div class="pj-next-grid">
    <div class="pj-next-box">
      <b aria-hidden="true">♞</b>
      <strong>Broadcast</strong>
      <span>It plays itself.</span>
    </div>
    <div class="pj-next-box">
      <b aria-hidden="true">♚</b>
      <strong>Campaign</strong>
      <span>Ground changes hands.</span>
    </div>
    <div class="pj-next-box">
      <b aria-hidden="true">♟</b>
      <strong>Checker Town</strong>
      <span>Somewhere to come back to.</span>
    </div>
  </div>
</section>


{% comment %} The four that haven't started, in one quiet row instead of four full cards.
     Same information, a quarter of the visual weight — which is the correct weight for
     "not started yet" on a page about what IS being made. The two placeholder
     descriptions went with the demotion: "See the universe grow!" carried no information
     on the card a partner most wants information about, and "Select projects others may
     find useful to be posted here" was passive-voice placeholder English on a page about
     ambition (idea #10; these two were the only lines on the page that sounded
     unfinished, sitting next to four cards already saying NEXT UP). {% endcomment %}
<section class="pj-also" aria-labelledby="pj-also-h">
  <h2 class="pj-also-h" id="pj-also-h">Also on the Board</h2>
  <ul class="pj-also-list">
    {% comment %} 2026-08-25 (Nate: "Remove Blender animation completely from the page" /
         "move code and tools to first position"). Blender Animations was "the first rendered
         scenes from the series" — it named the series' production pipeline, so it was a
         P&JCC announcement wearing a tools label, and it went out with the card and the
         Princess render. Code &amp; Tools leads now because it is the only line here that
         promises something a visitor could USE, and this row's first slot is the one that
         gets read. ⚠ THE GLYPHS ARE POSITIONAL, not per-item: ♜ ♝ ♛ reading down the row.
         Reordering the items means reordering the pieces too, or the row loses its rank.
         {% endcomment %}
    <li><b aria-hidden="true">♜</b><span><strong>Code &amp; Tools</strong> — the pieces of this site worth handing to someone else.</span></li>
    <li><b aria-hidden="true">♝</b><span><strong>McPuppy</strong> — the studio podcast. Winter 2026.</span></li>
    {% comment %} The Merch "Take a look →" link out to /goods/ was removed 2026-07-12 (Nate).
         The PAGE is deliberately kept and still builds; it just isn't linked. {% endcomment %}
    <li><b aria-hidden="true">♛</b><span><strong>Merch</strong> — goal cards and stationery. The designs come first.</span></li>
  </ul>
</section>

{% comment %} ── SPECIAL THANKS ─────────────────────────────────────
     Out-of-the-way, near the foot of the studio page, but given real weight.

     2026-07-13 (Nate: "much smaller text. Remove all the 'for etc.'. just list out the names,
     instead."): it was seven ruled rows, each a sentence explaining WHY that person is thanked
     — a credits crawl in the middle of a studio page, and the longest thing on it. The reasons
     were his and they were good, but a thank-you that has to be READ is asking the visitor for
     something. Names only now, one quiet line, in the same shape as the muses block right below
     it — so the two read as one credit roll instead of two competing formats. The reasons are
     in the git history if he ever wants them on a page of their own.
     ───────────────────────────────────────────────────────────── {% endcomment %}
{% comment %} THE STUDIO'S TWO CLOCKS — moved to the foot 2026-07-17 (Nate: "move the
     counters to the bottom, just above the Thank Yous"). The markup + tick script ride
     together here so the script still finds its elements at parse time; the styles live
     up top with the master-links block. {% endcomment %}
{% comment %} ── THE EPISODE 1 COUNTDOWN IS GONE, AND RECEIPTS TOOK ITS PLACE ─────────
     2026-07-28, Nate: "Remove the episode 1 countdown completely. Put receipts in that
     can stay updated as we go, automatically."

     The countdown was a trap and the skeptic pass named it: "149 days · since 1 Mar 2026"
     next to "450 days out · 21 Oct 2027" showed a stranger a SELF-IMPOSED DEADLINE
     fifteen months away with nothing counted in between. Every day it ticked, it said
     the same thing — *still not done* — and it aged badly by construction, because the
     only way for the number to be flattering is to move the date.

     Receipts do the opposite: they only ever go up, and every one of them is something
     that already exists. Same clock on the left, a middle where the silence was.

     AUTOMATIC IS THE WHOLE POINT — a receipt you have to remember to update is a lie
     with a delay on it. So each number is DERIVED, never typed:
       · posts       — `site.posts | size`, recounted by Jekyll on every build. Since a
                       post can only appear by being pushed, and a push IS a build, this
                       can never be stale. (The old DAY 47 ticker taught us the other
                       half of that rule: Liquid can't count TIME, because the clock
                       keeps moving between deploys. Time is the one thing left in JS.)
       · games       — counted at runtime from window.PJCC_GAMES, the registry that is
                       already the single source of truth for the hall (cat learn/arcade
                       = playable; dev/vault/terminated are not). NEVER retype this list.
       · puzzles     — the length of the road to Chess City, which is a design constant,
                       so it is the one number written by hand. It is marked as a goal
                       ("to Chess City"), not as work already done.

     ⛑⛑ TWO RECEIPTS CAME OUT 2026-08-25 (Nate: "Remove the characters and places on the
     map counters"). They were `{{ vis_chars }} characters written` and `{{ vis_locs }}
     places on the map`, and they were the last P&JCC numbers on the page: a cast size and
     a map size are a scoreboard for a FICTIONAL WORLD, which is precisely what is being
     held back until it can land all at once. The two `assign` loops that fed them went with
     the cells — a derived value with no reader is just build time — along with their entries
     in the derivation list above.

     ⛑⛑⛑ AND THE FIRST VERSION OF THIS COMMENT BROKE THE BUILD FOR FIVE PUSHES. It wrote
     that tag name WITH ITS BRACES, and **Liquid still parses tags inside a `comment` block** —
     an argument-less assign is a hard `Liquid::SyntaxError`, so Jekyll never built, `deploy`
     was SKIPPED, and the live site quietly served the old copy while four more pushes (two of
     them Nate's, through no fault of his) piled up behind it. The file already warned about
     exactly this a hundred lines up — "do NOT write the literal tag name in a comment like
     this one" — about `style` tags, and I wrote a Liquid one anyway.
     ⭐ NEVER PUT LIQUID DELIMITERS IN PROSE. Name the tag in backticks with no braces, or
     wrap the example in `raw`. `npm test` cannot catch it — nothing on this machine parses
     Liquid — so `tests/style.check.js` now has a rule that does. [[pages-deploy-flaky]]

     ⚠ THE HIDDEN-URL LOGIC LIVES ON ELSEWHERE. `site.hidden_character_urls` and
     `site.hidden_location_urls` are still the slow-roll's real gate; this page was only a
     CONSUMER of them. Do not "clean them up" from _config.yml on the strength of this
     removal — grep first. [[slow-roll-cast]]
     Restore both cells and both loops: `git show <this commit>^ -- projects.md`
     ─────────────────────────────────────────────────────────────────────── {% endcomment %}
<div class="pj-clocks">
  <div class="pj-clock">
    <span class="pj-clock-dot" aria-hidden="true"></span>
    <span class="pj-clock-k">Building</span>
    <span class="pj-clock-n" id="pj-days">—</span>
    <span class="pj-clock-c">days · since 1 Mar 2026</span>
  </div>
</div>

<section class="pj-receipts" aria-label="What exists so far">
  <h2 class="pj-receipts-h">What Exists So Far</h2>
  <ul class="pj-receipts-list">
    <li><b>{{ site.posts | size }}</b><span>build&nbsp;log posts</span></li>
    <li id="pj-r-games" hidden><b>—</b><span>games you can play</span></li>
    <li><b>1,000</b><span>puzzles to Chess&nbsp;City</span></li>
  </ul>
</section>

{% comment %} The registry is loaded here and nowhere else on this page. `defer` because
     nothing above the fold depends on it, and the row stays `hidden` until it has a real
     number — a receipt that flashes "—" is worse than no receipt. {% endcomment %}
<script src="{{ '/assets/js/pjcc-games-data.js' | relative_url }}" defer></script>
<script>
(function () {
  var START = 1772337600000;                         // 1 Mar 2026 00:00 EDT
  var days = document.getElementById('pj-days');
  if (days) {
    var tick = function () {
      days.textContent = Math.floor(Math.max(0, Date.now() - START) / 86400000).toLocaleString();
    };
    tick();
    setInterval(tick, 60000);
  }

  // Playable = the two live categories. Anything in dev/vault/terminated is NOT a
  // receipt, and `noHall` games (Fork in the Road lives in the drawer, not the hall)
  // still count — they're playable, they're just not listed on /games/.
  function games() {
    var reg = window.PJCC_GAMES;
    if (!Array.isArray(reg)) return;
    var n = 0;
    for (var i = 0; i < reg.length; i++) {
      if (reg[i].cat === 'learn' || reg[i].cat === 'arcade') n++;
    }
    var li = document.getElementById('pj-r-games');
    if (!li || !n) return;
    li.querySelector('b').textContent = n;
    li.hidden = false;
  }
  if (document.readyState === 'complete') games();
  else window.addEventListener('load', games);
})();
</script>

{% comment %} ── "WHAT THE STUDIO NEEDS" WAS HERE, AND CAME BACK OUT ──────────────────
     Built 2026-07-28 (Nate: "let's give the skeptic business partner a reason to email"),
     removed the same evening (Nate: "I like the idea of What the Studio Needs — but I'm
     deciding not to add animators until the series is actually kicking. Remove that,
     remove all three but keep this idea as a priority item in future ideas").

     He's right, and the reason is worth keeping: a public ask is a promise about where
     the project IS. Asking for an animator today would have had him fielding replies for
     a job he isn't ready to hand out, and the only thing worse than no ask is one you
     can't honor. It comes back when the series is kicking — the spec, all three openings
     and the subject-line trick are banked in FUTURE-IDEAS as a PRIORITY item, so it's a
     paste-back and not a rebuild.

     The diagnosis it was built on still stands and still isn't answered: the skeptic
     leaves without emailing not because he's unconvinced but because there is no reason
     to email. That gap is real; it just doesn't get filled with a hiring notice yet.
     ──────────────────────────────────────────────────────────────────── {% endcomment %}

<section class="mcp-thanks" aria-label="Special thanks">
  <div class="mcp-thanks-rule" aria-hidden="true"></div>

  <div class="mcp-thanks-block">
    <h3 class="mcp-thanks-sub">The Creator would like to thank</h3>
    {%- comment -%} 2026-08-26 (Nate: "move Mom to last position, and Chels to 2nd to last.
         Remove Dominic and Ryan Neuharth"), then again the same day: "Add Kim after Josh."
         Nine names now, and the ORDER carries the weight — the last name on a credit roll is
         the one it lands on, and "after Josh" was a POSITION, not a suggestion to re-sort.
         Do not "tidy" this into alphabetical order: the sequence is his and it is the whole
         point.
         {%- endcomment -%}
    <p class="mcp-thanks-names">Josh &middot; Kim &middot; Tucker &middot; Austin &middot; Kennie &middot; Jacob &middot; Garrett &middot; Chels &middot; Mom</p>
  </div>

  <div class="mcp-thanks-block">
    <h3 class="mcp-thanks-sub">For the endless inspiration, McPuppy Studios would like to thank</h3>
    {%- comment -%} 2026-08-26 (Nate: "Remove Jim Croce and move Norm to 2nd to last"). Nine
         now, and Jesse Green still closes the roll. Same rule as the names above — the order
         is his. {%- endcomment -%}
    <p class="mcp-thanks-muses">The Meadowlands &middot; Joey Cape &middot; The Lawrence Arms &middot; Tim Dillon &middot; Trey Parker and Matt Stone &middot; John Steakley &middot; Neville Goddard &middot; Norm Macdonald &middot; Jesse Green</p>
  </div>
</section>

<style>
/* Special thanks — quiet, but it carries weight (Nate 2026-07-12) */
/* 2026-07-21: recolored into the room it lives in. These four were the last of the P&JCC
   palette on this page — a lilac label (#cdbcf2), near-white lavender names (#e6dcff),
   a violet muses line (#b7a4e0) and an arcade-gold rule (#F5C518) — sitting inside
   theme-studio's warm monochrome. Exactly the complaint Nate made about the counters on
   2026-07-12 ("shouting in a color the room no longer speaks"), just never applied here.
   Now on the studio's own scale: #f2efe8 for the names (same as .pj-clock-n, and they
   stay the one thing here with weight), #8a8592 for both labels (same as .pj-clock-k),
   and the studio's brass #caa24a for the rule. Same sizes, same hierarchy, one accent
   per room. The NAMES THEMSELVES are Nate's dedication and are not to be edited.

   The label needs the extra `.mcp-thanks` on the front to land: it's an <h3>, and
   `body.theme-studio h1..h6 { color:#f2efe8 }` (_pjcc-02-studio.scss:680) out-specifies a
   lone class no matter what order the page's own <style> comes in. Which means the old
   lilac #cdbcf2 was never actually rendering — the label has been the same near-white as
   the names this whole time, flattening the hierarchy the comment below describes. Two
   classes (0,2,0) beat one class plus two types (0,1,2), so this one sticks. */
.mcp-thanks { max-width: 640px; margin: 3.2rem auto var(--space-4); padding: 0 var(--space-1); text-align: center; }
  /* adoption: bottom 1rem = --space-4, padding 4px = --space-1 (exact); 3.2rem top stays literal */
.mcp-thanks-rule { width: 70px; height: 2px; margin: 0 auto 1.6rem;
  background: linear-gradient(90deg, transparent, #caa24a, transparent); }
.mcp-thanks-block { margin: 0 0 1.7rem; }
.mcp-thanks .mcp-thanks-sub { color: #8a8592; font-size: 0.72rem; font-weight: 600;
  letter-spacing: 0.05em; text-transform: uppercase; margin: 0 0 var(--space-2); }
  /* adoption: 0.5rem = --space-2 exact. The three thanks font-sizes (0.72/0.82/0.86rem) stay
     literal ON PURPOSE — they're a deliberate size hierarchy the --step--1 range would flatten. */
/* the names carry the section, so they're the one thing here with any weight —
   still small, but brighter than the label above them */
.mcp-thanks-names { color: #f2efe8; font-size: 0.86rem; line-height: 1.85; margin: 0; }
.mcp-thanks-muses { color: #8a8592; font-size: 0.82rem; line-height: 1.85; margin: 0; font-style: italic; }
</style>


