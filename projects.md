---
layout: page
title: About the Studio
permalink: /projects/
body_class: theme-studio
tab_title: About McPuppy Studios | PJCC
description: Who makes Princess and the Journey to Chess City — the one-person studio behind the games, the Academy, the blog and the animated series in progress.
---

{% comment %} 2026-07-22 (Nate: "About the Studio is fine"). The on-page title is now
     "About the Studio", which is what this page actually is — the last piece of the
     "five landing pages" problem from docs/front-door-2026-07-21.md.

     `tab_title` is set deliberately. Without it the <title> would have become
     "About the Studio | PJCC" and the studio's own NAME would have vanished from the
     browser tab and from search results for the one page that is about the studio. The
     visible heading can be plain because the page is already inside McPuppy chrome; the
     tab has no such context and has to carry the brand. `description` is new for the
     same reason — this page never had one. {% endcomment %}

{% comment %} ── THIS PAGE STOPPED BEING A SECOND HOME (2026-07-21) ─────────────────
     Nate: "Perhaps McPuppy page should simply be 'About The Studio'… we can't have five
     landing pages." Step 0 of docs/front-door-2026-07-21.md.

     What was here: a `.studio-master` command bar — five equal doors (PJCC · Blog ·
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

<p class="projects-intro">An independent studio created to build PJCC.</p>

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
     counters were two big PURPLE-and-TEAL boxes: the last survivors of the PJCC palette,
     on a page that stopped being PJCC. They were shouting in a color the room no longer
     speaks.

     Format, completely changed: they were two tall centred cards each running a
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
.pj-clocks { display: grid; grid-template-columns: 1fr 1fr; margin: 16px 0 22px;
  background: #131218; border: 1px solid #2a2830; border-radius: 10px; overflow: hidden; }
.pj-clock { display: grid; grid-template-columns: auto auto 1fr; align-items: baseline;
  gap: 2px 8px; padding: 12px 16px; }
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
</style>
<div class="projects-list">

  <div class="project-card project-card-active">
    <div class="project-card-corner-piece" aria-hidden="true">♛</div>
    <div class="project-card-header">
      <span class="project-status project-status-active">
        <span class="project-status-dot"></span>
        In Development
      </span>
      <h2 class="project-title">Princess and the Journey to Chess City</h2>
    </div>
    <p class="project-desc">The flagship project. An animated series.</p>
    {% comment %} The "Format: Animated series" detail list was removed 2026-07-13 (Nate) —
         it said the same thing as the description, in a heavier way, so the description says
         it now. The "Blog" link went 2026-07-12: the Build Log already has a chip in the
         studio hub above AND a slot in the McPuppy nav, and a third door hanging off the
         flagship made the flagship look like it was mainly a blog. {% endcomment %}
    <div class="project-links">
      <a href="/" class="project-link">Enter PJCC &rarr;</a>
    </div>
  </div>

  <div class="project-card project-card-soon">
    <div class="project-card-corner-piece" aria-hidden="true">♞</div>
    <div class="project-card-header">
      <span class="project-status project-status-soon">Coming Soon</span>
      <h2 class="project-title">Blender Animations</h2>
    </div>
    <p class="project-desc">See the universe grow!</p>
  </div>

  <div class="project-card project-card-active">
    <div class="project-card-corner-piece" aria-hidden="true">♟</div>
    <div class="project-card-header">
      <span class="project-status project-status-active">
        <span class="project-status-dot"></span>
        In Development
      </span>
      <h2 class="project-title">PJCC Chess Academy</h2>
    </div>
    <p class="project-desc">An All-Ages online Chess Academy, set in the PJCC universe! Contact me for more.</p>
    <div class="project-links">
      <a href="/academy/" class="project-link">Visit the Academy &rarr;</a>
      <a href="/contact/" class="project-link">Contact &rarr;</a>
    </div>
  </div>

  <div class="project-card project-card-soon">
    <div class="project-card-corner-piece" aria-hidden="true">♝</div>
    <div class="project-card-header">
      <span class="project-status project-status-soon">Coming Soon</span>
      <h2 class="project-title">McPuppy</h2>
    </div>
    <p class="project-desc">The McPuppy Studios podcast &mdash; studio updates and whatever else comes up. Winter 2026.</p>
  </div>

  <div class="project-card project-card-soon">
    <div class="project-card-corner-piece" aria-hidden="true">♜</div>
    <div class="project-card-header">
      <span class="project-status project-status-soon">Coming Soon</span>
      <h2 class="project-title">Code &amp; Tools</h2>
    </div>
    <p class="project-desc">Select projects others may find useful to be posted here.</p>
  </div>


  <div class="project-card project-card-soon">
    <div class="project-card-corner-piece" aria-hidden="true">♛</div>
    <div class="project-card-header">
      <span class="project-status project-status-soon">Coming Soon</span>
      <h2 class="project-title">Merch</h2>
    </div>
    <p class="project-desc">Don't hold your breath!</p>
    {% comment %} The "Take a look →" link out to /goods/ was removed 2026-07-12 (Nate).
         The PAGE is deliberately kept and still builds — he wants it later; it just isn't
         linked from anywhere for now. Restore this one line to re-list it. {% endcomment %}
  </div>

</div>

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
<div class="pj-clocks">
  <div class="pj-clock">
    <span class="pj-clock-dot" aria-hidden="true"></span>
    <span class="pj-clock-k">In development</span>
    <span class="pj-clock-n" id="pj-days">—</span>
    <span class="pj-clock-c">days · since 1 Mar 2026</span>
  </div>
  <div class="pj-clock">
    <span class="pj-clock-k">Episode 1</span>
    <span class="pj-clock-n" id="pj-eta">—</span>
    <span class="pj-clock-c">days out · 21 Oct 2027</span>
  </div>
</div>
<script>
(function () {
  var START  = 1772337600000;                        // 1 Mar 2026 00:00 EDT
  var TARGET = Date.parse('2027-10-21T04:00:00Z');   // midnight EDT
  var days = document.getElementById('pj-days');
  var eta  = document.getElementById('pj-eta');
  if (!days || !eta) return;
  function tick() {
    days.textContent = Math.floor(Math.max(0, Date.now() - START) / 86400000).toLocaleString();
    eta.textContent  = Math.ceil(Math.max(0, TARGET - Date.now()) / 86400000).toLocaleString();
  }
  tick();
  setInterval(tick, 60000);
})();
</script>

<section class="mcp-thanks" aria-label="Special thanks">
  <div class="mcp-thanks-rule" aria-hidden="true"></div>

  <div class="mcp-thanks-block">
    <h3 class="mcp-thanks-sub">The Creator would like to thank</h3>
    <p class="mcp-thanks-names">Mom &middot; Chels &middot; Laura &middot; Josh &middot; Kim &middot; Aunt Barb &middot; Tucker &middot; Jacob &middot; Garrett &middot; Dominic &middot; Chef</p>
  </div>

  <div class="mcp-thanks-block">
    <h3 class="mcp-thanks-sub">For the endless inspiration, McPuppy Studios would like to thank</h3>
    <p class="mcp-thanks-muses">Norm Macdonald &middot; The Meadowlands &middot; The Lawrence Arms &middot; Jim Croce &middot; Trey Parker and Matt Stone &middot; John Steakley &middot; Neville Goddard &middot; Jesse Green</p>
  </div>
</section>

<style>
/* Special thanks — quiet, but it carries weight (Nate 2026-07-12) */
/* 2026-07-21: recolored into the room it lives in. These four were the last of the PJCC
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
.mcp-thanks { max-width: 640px; margin: 3.2rem auto 1rem; padding: 0 4px; text-align: center; }
.mcp-thanks-rule { width: 70px; height: 2px; margin: 0 auto 1.6rem;
  background: linear-gradient(90deg, transparent, #caa24a, transparent); }
.mcp-thanks-block { margin: 0 0 1.7rem; }
.mcp-thanks .mcp-thanks-sub { color: #8a8592; font-size: 0.72rem; font-weight: 600;
  letter-spacing: 0.05em; text-transform: uppercase; margin: 0 0 0.5rem; }
/* the names carry the section, so they're the one thing here with any weight —
   still small, but brighter than the label above them */
.mcp-thanks-names { color: #f2efe8; font-size: 0.86rem; line-height: 1.85; margin: 0; }
.mcp-thanks-muses { color: #8a8592; font-size: 0.82rem; line-height: 1.85; margin: 0; font-style: italic; }
</style>


