---
layout: page
title: McPuppy Studios
permalink: /projects/
body_class: theme-studio
---

<p class="projects-intro">An independent studio created to build PJCC.</p>

<nav class="studio-hub" aria-label="McPuppy Studios sections">
  <a href="/pjcc/">PJCC</a>
  <a href="/blog/">Blog</a>
  <a href="/mailing-list/">Mailing List</a>
  <a href="/direct-line/">Direct Line</a>
  <a href="/educators/">For Educators</a>
</nav>
<style>
.studio-hub { display: flex; flex-wrap: wrap; gap: 8px; margin: 4px 0 18px; }
.studio-hub a { font-size: 0.82rem; font-weight: 700; text-decoration: none; color: #cdbcf2;
  background: rgba(110,95,160,0.18); border: 1px solid #4a3a86; border-radius: 999px; padding: 6px 14px;
  transition: border-color .15s, color .15s; }
.studio-hub a:hover { border-color: #F5C518; color: #F5C518; }
</style>

<style>
/* ---- Featured "Completed, playable now" card (Notation Blitz) ---- */
.project-card-featured {
  position: relative;
  overflow: hidden;
  border: 2px solid #F5C518 !important;
  background: linear-gradient(135deg, #1f1147 0%, #34206f 100%) !important;
  animation: blitzGlow 2.4s ease-in-out infinite;
}
@keyframes blitzGlow {
  0%, 100% { box-shadow: 0 0 16px 2px rgba(245,197,24,0.35), inset 0 0 34px rgba(245,197,24,0.05); }
  50%      { box-shadow: 0 0 34px 7px rgba(245,197,24,0.7),  inset 0 0 44px rgba(245,197,24,0.12); }
}
.project-card-featured .project-title { color: #F5C518 !important; }
.project-title .ver { font-size: 0.62em; color: #ff8fd0; vertical-align: super; letter-spacing: 1px; }
.project-card-featured .project-desc { color: #e3d6ff !important; }
.project-card-featured .project-details,
.project-card-featured .project-details li { color: #c9b6ef !important; }
.project-card-featured .project-details strong { color: #fff !important; }
.project-card-featured .project-card-corner-piece { color: rgba(245,197,24,0.22) !important; }

.project-status-done {
  display: inline-flex; align-items: center; gap: 6px;
  background: #6bffb8; color: #04110a !important; font-weight: 800;
  border-radius: 999px; padding: 4px 12px; letter-spacing: 0.3px;
}
.project-status-done .project-status-dot { background: #04110a; animation: donePulse 1.3s ease-in-out infinite; }
@keyframes donePulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.5); opacity: 0.5; } }

.featured-ribbon {
  position: absolute; top: 16px; right: -42px; transform: rotate(45deg);
  background: #ff8fd0; color: #1a0f3d; font-weight: 900; font-size: 11px; letter-spacing: 1.5px;
  padding: 5px 48px; box-shadow: 0 2px 8px rgba(0,0,0,0.45); z-index: 2;
}
.project-link-play {
  background: #F5C518 !important; color: #1a0f3d !important; font-weight: 900 !important;
  border: none !important; border-radius: 999px !important; padding: 9px 22px !important;
  box-shadow: 0 0 14px rgba(245,197,24,0.55); animation: playPulse 1.5s ease-in-out infinite;
}
.project-link-play:hover { background: #ffd740 !important; }
@keyframes playPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.07); } }

/* ---- TERMINATED card (a distinct red state) ---- */
.project-card-terminated {
  position: relative;
  border: 2px solid #ff3b3b !important;
  background: linear-gradient(135deg, #2a0d12 0%, #160709 100%) !important;
  box-shadow: 0 0 16px 1px rgba(255,59,59,0.28);
}
.project-card-terminated .project-title { color: #ff6b6b !important; }
.project-card-terminated .project-desc { color: #f0cccc !important; }
.project-card-terminated .project-details,
.project-card-terminated .project-details li { color: #d6a8a8 !important; }
.project-card-terminated .project-details strong { color: #fff !important; }
.project-card-terminated .project-card-corner-piece { color: rgba(255,59,59,0.25) !important; }
.project-status-terminated {
  display: inline-flex; align-items: center; gap: 6px;
  background: #ff3b3b; color: #fff !important; font-weight: 800;
  border-radius: 999px; padding: 4px 12px; letter-spacing: 2px;
}
.project-status-terminated .project-status-dot { background: #fff; animation: termBlink 1s steps(1) infinite; }
@keyframes termBlink { 0%,49% { opacity: 1; } 50%,100% { opacity: 0.25; } }
.project-link-terminated {
  background: #ff3b3b !important; color: #fff !important; font-weight: 800 !important;
  border: none !important; border-radius: 999px !important; padding: 9px 22px !important;
  box-shadow: 0 0 12px rgba(255,59,59,0.5);
}
.project-link-terminated:hover { background: #ff5e5e !important; }
</style>

{% comment %} ── THE STUDIO'S TWO CLOCKS ──────────────────────────────────────────────
     Rebuilt 2026-07-12 (Nate: "significantly reduce the size of the counter boxes and
     change both formats completely. It looks really out of place now").

     He's right on both counts, and the "out of place" is the interesting one: this page
     is `theme-studio` — McPuppy's warm monochrome, #131218 cards and a #caa24a gold. The
     counters were two big PURPLE-and-TEAL boxes: the last survivors of the PJCC palette,
     on a page that stopped being PJCC. They were shouting in a colour the room no longer
     speaks.

     Format, completely changed: they were two tall centred cards each running a
     `134d 07:22:41` stopwatch, ticking every second. A two-year project measured to the
     SECOND is a gag, not information — and it cost two 1Hz timers on an otherwise static
     page.

     They're a slim TWO-CELL RIBBON now: one big honest number (days), one quiet line of
     context, in the studio's own gold. Half the height, and the clock ticks once a minute
     instead of sixty times. The milestone rides on the context line as a small gold tag
     instead of owning a whole row of its own. ─────────────────────────────────────── {% endcomment %}
<div class="pj-clocks">
  <div class="pj-clock">
    <span class="pj-clock-dot" aria-hidden="true"></span>
    <span class="pj-clock-k">In development</span>
    <span class="pj-clock-n" id="pj-days">—</span>
    <span class="pj-clock-c" id="pj-since">days · since 1 Mar 2026</span>
  </div>
  <div class="pj-clock">
    <span class="pj-clock-k">Episode 1</span>
    <span class="pj-clock-n" id="pj-eta">—</span>
    <span class="pj-clock-c">days out · 21 Oct 2027</span>
  </div>
</div>
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
.pj-clock-tag { color: #caa24a; }
@media (max-width: 560px){
  .pj-clocks { grid-template-columns: 1fr; }
  .pj-clock + .pj-clock { border-left: none; border-top: 1px solid #2a2830; }
}
@media (prefers-reduced-motion: reduce){ .pj-clock-dot { animation: none; } }
</style>
<script>
/* Both clocks, one timer, once a minute. Days is the only unit that means anything on a
   project this long — the old to-the-second stopwatch just made the page fidget. */
(function () {
  var START  = 1772337600000;                        // 1 Mar 2026 00:00 EDT
  var TARGET = Date.parse('2027-10-21T04:00:00Z');   // midnight EDT
  var MILESTONES = [
    [500, '500 days — no signs of stopping'],
    [365, 'one year in'],
    [180, 'half a year in'],
    [100, '100 days'],
    [60,  'two months deep'],
    [30,  '30 days in the game']
  ];
  var days  = document.getElementById('pj-days');
  var since = document.getElementById('pj-since');
  var eta   = document.getElementById('pj-eta');
  if (!days || !eta || !since) return;

  function tick() {
    var d = Math.floor(Math.max(0, Date.now() - START) / 86400000);
    days.textContent = d.toLocaleString();
    eta.textContent = Math.ceil(Math.max(0, TARGET - Date.now()) / 86400000).toLocaleString();
    var hit = '';
    for (var i = 0; i < MILESTONES.length; i++) {        // biggest one passed wins
      if (d >= MILESTONES[i][0]) { hit = MILESTONES[i][1]; break; }
    }
    since.innerHTML = hit
      ? 'days · <span class="pj-clock-tag">★ ' + hit + '</span>'
      : 'days · since 1 Mar 2026';
  }
  tick();
  setInterval(tick, 60000);
})();
</script>

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
    <p class="project-desc">The flagship project.</p>
    <ul class="project-details">
      <li><strong>Format:</strong> Animated series</li>
    </ul>
    {% comment %} The "Blog" link was removed from the flagship card 2026-07-12 (Nate). The
         Build Log already has its own chip in the studio hub at the top of this page AND its
         own slot in the McPuppy nav; a third door to it, hanging off the flagship, made the
         flagship look like it was mainly a blog. {% endcomment %}
  </div>

  <div class="project-card project-card-soon">
    <div class="project-card-corner-piece" aria-hidden="true">♞</div>
    <div class="project-card-header">
      <span class="project-status project-status-soon">Coming Soon</span>
      <h2 class="project-title">Blender Animations</h2>
    </div>
    <p class="project-desc">See the universe grow!</p>
    <ul class="project-details">
      <li><strong>Format:</strong> Short clips</li>
      <li><strong>Status:</strong> Clips posted as they're ready</li>
    </ul>
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
      <a href="/chess-lessons/" class="project-link">Visit the Academy &rarr;</a>
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
    <ul class="project-details">
      <li><strong>Status:</strong> Projects linked when published</li>
    </ul>
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
     Wording is Nate's, kept verbatim (2026-07-12). {% endcomment %}
<section class="mcp-thanks" aria-label="Special thanks">
  <div class="mcp-thanks-rule" aria-hidden="true"></div>

  <div class="mcp-thanks-block">
    <h2 class="mcp-thanks-h">The Creator would like to thank</h2>
    <ul class="mcp-thanks-people">
      <li>Thank you <strong>Mom</strong>, for always being there and providing a road map to a successful life.</li>
      <li>Thank you <strong>Chels</strong>, for being an amazing sibling and friend. I love you.</li>
      <li>Thank you <strong>Laura</strong>, for your generosity.</li>
      <li>Thank you <strong>Josh</strong>, for listening to the initial ideas with patience and either feigned or real excitement, doesn't matter.</li>
      <li>Thank you <strong>Kim</strong>, for letting me show you initial progress before anyone.</li>
      <li>Thank you <strong>Aunt Barb</strong>, for being someone that I can't help but talk wide-openly with. You accelerated PJCC significantly.</li>
      <li>Thank you <strong>Tucker</strong>, for inspiring me with your greatness.</li>
    </ul>
  </div>

  <div class="mcp-thanks-block">
    <h3 class="mcp-thanks-sub">For the endless inspiration, McPuppy Studios would like to thank:</h3>
    <p class="mcp-thanks-muses">Norm Macdonald &middot; The Meadowlands &middot; The Lawrence Arms &middot; Trey Parker and Matt Stone &middot; Orson Scott Card &middot; John Steakley &middot; Neville Goddard &middot; Jesse Green</p>
  </div>
</section>

<style>
/* Special thanks — quiet, but it carries weight (Nate 2026-07-12) */
.mcp-thanks { max-width: 640px; margin: 3.6rem auto 1rem; padding: 0 4px; text-align: center; }
.mcp-thanks-rule { width: 70px; height: 2px; margin: 0 auto 1.8rem;
  background: linear-gradient(90deg, transparent, #F5C518, transparent); }
.mcp-thanks-block { margin: 0 0 2.2rem; }
.mcp-thanks-h { color: #F5C518; font-size: 1.15rem; letter-spacing: 0.04em; margin: 0 0 1.1rem; }
.mcp-thanks-people { list-style: none; padding: 0; margin: 0; text-align: left; }
.mcp-thanks-people li { color: #d9ccf5; font-size: 0.96rem; line-height: 1.6;
  padding: 0.7rem 0; border-bottom: 1px solid rgba(245,197,24,0.1); }
.mcp-thanks-people li:last-child { border-bottom: none; }
.mcp-thanks-people strong { color: #fff; font-weight: 700; }
.mcp-thanks-sub { color: #cdbcf2; font-size: 0.86rem; font-weight: 600; letter-spacing: 0.03em;
  text-transform: uppercase; margin: 0 0 0.7rem; }
.mcp-thanks-muses { color: #b7a4e0; font-size: 0.95rem; line-height: 1.9; margin: 0; font-style: italic; }
</style>

<p class="projects-footer-note">Check out the <a href="/blog/">blog</a> for more updates.</p>
