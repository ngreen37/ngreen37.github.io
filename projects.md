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
  <a href="/goods/">Merch</a>
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

{% comment %} Moved here from the PJCC home (2026-07-08) — the studio's own clocks. {% endcomment %}
{% comment %} ── 7. CHESS CLOCK ───────────────────────────────────── {% endcomment %}
<div class="pj-counters">
  <div class="pj-counter">
    <div class="chess-clock-label">Time in Development</div>
    <div class="chess-clock-display" id="chess-clock-display">0d 00:00:00</div>
    <div class="chess-milestone-wrap" id="chess-milestone-wrap"></div>
  </div>
  <div class="pj-counter">
    <div class="home-mc-label">◈ Episode 1 Premiere Countdown</div>
    <div class="home-mc-display" id="home-mc-display">—</div>
    <div class="home-mc-target">TARGET: 2027.10.21</div>
  </div>
</div>
<style>
/* the studio's two clocks, side by side (Nate 2026-07-12) */
.pj-counters { display: flex; flex-wrap: wrap; gap: 14px; margin: 18px 0 6px; }
.pj-counter { flex: 1 1 240px; text-align: center; padding: 16px 12px;
  background: linear-gradient(135deg, #1f1147 0%, #2d1b69 100%);
  border: 1px solid rgba(126, 201, 183, 0.28); border-radius: 12px; }
.pj-counter .chess-clock-label { margin-bottom: 8px; }
.pj-counter .chess-milestone-wrap:empty { display: none; }
</style>
<script>
// Chess clock
(function() {
  var clockEl = document.getElementById('chess-clock-display');
  if (!clockEl) return;
  var startMs = 1772337600000; // March 1, 2026 00:00 EDT (04:00 UTC)
  function pad(n) { return n < 10 ? '0' + n : String(n); }
  function tick() {
    var elapsed = Math.max(0, Date.now() - startMs);
    var d = Math.floor(elapsed / 86400000);
    var h = Math.floor((elapsed % 86400000) / 3600000);
    var m = Math.floor((elapsed % 3600000) / 60000);
    var s = Math.floor((elapsed % 60000) / 1000);
    clockEl.textContent = d + 'd ' + pad(h) + ':' + pad(m) + ':' + pad(s);
  }
  tick();
  setInterval(tick, 1000);
})();

// Milestone badges
(function() {
  var milestones = [
    [30,  '★ 30 DAYS IN THE GAME'],
    [60,  '★ TWO MONTHS DEEP'],
    [100, '★ 100 DAYS'],
    [180, '★ HALF A YEAR'],
    [365, '★ ONE YEAR IN DEVELOPMENT'],
    [500, '★ 500 DAYS — NO SIGNS OF STOPPING']
  ];
  var mWrap = document.getElementById('chess-milestone-wrap');
  if (!mWrap) return;
  var days = Math.floor(Math.max(0, Date.now() - 1772337600000) / 86400000);
  var label = '';
  for (var i = milestones.length - 1; i >= 0; i--) {
    if (days >= milestones[i][0]) { label = milestones[i][1]; break; }
  }
  if (label) mWrap.innerHTML = '<span class="chess-milestone">' + label + '</span>';
})();

// Mission countdown to Episode 1 (#25)
(function() {
  var el = document.getElementById('home-mc-display');
  if (!el) return;
  var target = new Date('2027-10-21T04:00:00Z').getTime(); // midnight EDT
  function pad(n) { return n < 10 ? '0' + n : String(n); }
  function tick() {
    var diff = Math.max(0, target - Date.now());
    var d = Math.floor(diff / 86400000);
    var h = Math.floor((diff % 86400000) / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);
    var s = Math.floor((diff % 60000) / 1000);
    el.textContent = d + 'd ' + pad(h) + ':' + pad(m) + ':' + pad(s);
  }
  tick(); setInterval(tick, 1000);
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
    <div class="project-links">
      <a href="/blog/" class="project-link">Blog</a>
    </div>
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
    <div class="project-links">
      <a href="/goods/" class="project-link">Take a look &rarr;</a>
    </div>
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
      <li>Thank you <strong>mom</strong>, for always being there and providing a road map to a successful life.</li>
      <li>Thank you <strong>Chelsea</strong>, my Sister, for being an amazing sibling and friend. I love you.</li>
      <li>Thank you <strong>Laura</strong>, for your generosity.</li>
      <li>Thank you <strong>Josh</strong>, for listening to the initial ideas with patience and either feigned or real excitement, doesn't matter.</li>
      <li>Thank you <strong>Kim</strong>, for letting me show you initial progress before anyone.</li>
      <li>Thank you <strong>Aunt Barb</strong>, for being someone that I can't help but talk wide-openly with, as closest family. You accelerated PJCC significantly.</li>
      <li>Thank you <strong>Tucker</strong>, for inspiring me with your greatness. You are a big role model to me.</li>
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
