---
layout: page
title: McPuppy Studios
permalink: /projects/
body_class: theme-studio
tab_title: McPuppy Studios — The Studio Behind ChessWild
description: McPuppy Studios — the independent studio behind ChessWild and the P&JCC universe. The animated series, the Academy, the games and the blog, and how far along each one is.
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

<p class="projects-intro">McPuppy is an independent studio created in March 2026, with the main goal of showing the world the beauty and value of the P&JCC universe.</p>

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

/* ── the flagship's render ──────────────────────────────────────────────────────
   Side by side on desktop, stacked on a phone. The image is deliberately given a
   frame and a caption rather than being bled to the card edge: it is a Blender
   VIEWPORT GRAB (gray background, grid, 3D cursor), and a viewport grab presented as
   finished art looks like a mistake, while the same grab presented as a work in
   progress looks like proof. `aspect-ratio` + explicit width/height keep the card
   from jumping when it loads. */
.pj-flag-grid { display: grid; grid-template-columns: 260px 1fr; gap: var(--space-4) 22px;
  align-items: center; }
.pj-shot { margin: 0; }
.pj-shot img { display: block; width: 100%; height: auto; aspect-ratio: 699 / 486;
  border: 1px solid #2a2830; border-radius: var(--r-sm); background: #3b3b3b; }
.pj-shot figcaption { margin-top: 7px; font-family: 'Share Tech Mono', monospace;
  font-size: 10px; letter-spacing: 0.06em; color: #8a8592; line-height: 1.5; }
.pj-flag-body { min-width: 0; }
@media (max-width: 620px) { .pj-flag-grid { grid-template-columns: 1fr; } }

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
{% comment %} ── REBUILT 2026-07-28, from the deep-dive skeptic pass ──────────────────
     Two findings drove this, and both were about what a stranger CONCLUDES:

     1. "FOUR OF SIX CARDS SAY NEXT UP." Six equal cards, four of them not started, so
        the page's dominant visual message was *four things haven't started* — on the
        page whose whole job is to say the studio is real. The two things actually being
        BUILT now own the page; the four that aren't share one quiet row underneath.
        (Nate picked this as idea #5 of ten.)

     2. "THERE IS NOT ONE IMAGE ON THIS PAGE." An animation studio's public face had
        zero art — not a render, not a frame. Chess glyphs are typography, not art. The
        flagship card now carries the actual Blender render of Princess. It is a
        VIEWPORT GRAB, gray background and all, and it is captioned as one on purpose:
        an honest work-in-progress reads as a receipt, a fake-polished one reads as a
        stock image. (A transparent-film render would let this float free of its box —
        that's an action item in FUTURE-IDEAS.)
     ─────────────────────────────────────────────────────────────────────── {% endcomment %}
<div class="projects-list">

  <div class="project-card project-card-active pj-flagship">
    <div class="project-card-corner-piece" aria-hidden="true">♛</div>
    <div class="pj-flag-grid">
      <figure class="pj-shot">
        <img src="{{ '/assets/images/Princess_Color_v01.jpg' | relative_url }}"
             alt="An early Blender render of Princess: a small black-and-tan dog, modeled in low
                  polygons, standing in the gray Blender viewport."
             width="699" height="486" loading="lazy" decoding="async">
        <figcaption>Princess &middot; first color pass, April 2026 &middot; straight out of Blender</figcaption>
      </figure>
      <div class="pj-flag-body">
        <div class="project-card-header">
          <span class="project-status project-status-active">
            <span class="project-status-dot"></span>
            Building
          </span>
          <h2 class="project-title">Princess and the Journey to Chess City</h2>
        </div>
        {% comment %} Idea #4 of ten, in Nate's own words (2026-07-28). The old line was
             "The flagship project. An animated series." — which describes its POSITION in
             the studio, not the story. This one tells you what it's about in nine words,
             and "a dog who can learn anything" is the actual hook of the whole universe. {% endcomment %}
        <p class="project-desc">An animated series about a dog who can learn anything.</p>
        <div class="project-links">
          {% comment %} was href="/", which bounced anyone who clicked it straight back out
               through a redirect (the typing intro then; a hop to /chess/ after that). Since
               2026-08-03 "/" is the ChessWild front door and no longer redirects at all — but
               it is still the wrong target here, because a card about the SERIES should open
               the world, not the chess site's home. Goes to the world itself. {% endcomment %}
          <a href="/pjcc/" class="project-link">Enter P&JCC &rarr;</a>
        </div>
      </div>
    </div>
  </div>

  <div class="project-card project-card-active">
    <div class="project-card-corner-piece" aria-hidden="true">♟</div>
    <div class="project-card-header">
      <span class="project-status project-status-active">
        <span class="project-status-dot"></span>
        Building
      </span>
      <h2 class="project-title">ChessWild Chess Academy</h2>
    </div>
    <p class="project-desc">An All-Ages online Chess Academy, taught by Auston and Crockett from the P&JCC universe. Free, and open now.</p>
    <div class="project-links">
      <a href="/academy/" class="project-link">Visit the Academy &rarr;</a>
    </div>
  </div>

</div>

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
    <li><b aria-hidden="true">♞</b><span><strong>Blender Animations</strong> — the first rendered scenes from the series.</span></li>
    <li><b aria-hidden="true">♝</b><span><strong>McPuppy</strong> — the studio podcast. Winter 2026.</span></li>
    <li><b aria-hidden="true">♜</b><span><strong>Code &amp; Tools</strong> — the pieces of this site worth handing to someone else.</span></li>
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
       · characters  — the cast collection minus site.hidden_character_urls, so the
                       slow-rolled seven stay uncounted until Nate reveals them.
       · locations   — same, minus hidden_location_urls.
       · games       — counted at runtime from window.PJCC_GAMES, the registry that is
                       already the single source of truth for the hall (cat learn/arcade
                       = playable; dev/vault/terminated are not). NEVER retype this list.
       · puzzles     — the length of the road to Chess City, which is a design constant,
                       so it is the one number written by hand. It is marked as a goal
                       ("to Chess City"), not as work already done.
     ─────────────────────────────────────────────────────────────────────── {% endcomment %}
{%- assign vis_chars = 0 -%}
{%- for c in site.characters -%}
  {%- unless site.hidden_character_urls contains c.url -%}{%- assign vis_chars = vis_chars | plus: 1 -%}{%- endunless -%}
{%- endfor -%}
{%- assign vis_locs = 0 -%}
{%- for l in site.locations -%}
  {%- unless site.hidden_location_urls contains l.url -%}{%- assign vis_locs = vis_locs | plus: 1 -%}{%- endunless -%}
{%- endfor -%}
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
    <li><b>{{ vis_chars }}</b><span>characters written</span></li>
    <li><b>{{ vis_locs }}</b><span>places on the map</span></li>
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
    <p class="mcp-thanks-names">Mom &middot; Chels &middot; Josh &middot; Tucker &middot; Austin &middot; Kennie &middot; Jacob &middot; Garrett &middot; Dominic &middot; Ryan Neuharth</p>
  </div>

  <div class="mcp-thanks-block">
    <h3 class="mcp-thanks-sub">For the endless inspiration, McPuppy Studios would like to thank</h3>
    <p class="mcp-thanks-muses">Norm Macdonald &middot; The Meadowlands &middot; Joey Cape &middot; The Lawrence Arms &middot; Jim Croce &middot; Tim Dillon &middot; Trey Parker and Matt Stone &middot; John Steakley &middot; Neville Goddard &middot; Jesse Green</p>
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


