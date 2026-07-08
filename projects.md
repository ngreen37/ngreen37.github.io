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
  <a href="/press-pass/">Press Pass</a>
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

{% comment %} Counts come live from the games registry (pjcc-games-data.js) — same source
     as the PJCC home stats — so they never go stale. Both tiles link to the arcade. {% endcomment %}
<div class="projects-stats" id="projects-stats" aria-label="Studio at a glance">
  <a class="pstat" href="/games/"><span class="pstat-num" id="pstat-playable">—</span><span class="pstat-lab">playable now <span class="pstat-go">&#8599;</span></span></a>
  <a class="pstat" href="/games/"><span class="pstat-num" id="pstat-dev">—</span><span class="pstat-lab">in the lab <span class="pstat-go">&#8599;</span></span></a>
</div>

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
<div class="chess-clock-wrap">
  <div class="chess-clock-label">Time in Development</div>
  <div class="chess-clock-display" id="chess-clock-display">0d 00:00:00</div>
  <div class="chess-milestone-wrap" id="chess-milestone-wrap"></div>
  <div class="home-mission-countdown">
    <div class="home-mc-label">◈ Episode 1 Premiere Countdown</div>
    <div class="home-mc-display" id="home-mc-display">—</div>
    <div class="home-mc-target">TARGET: 2027.10.21</div>
  </div>
</div>
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
    <div class="project-card-corner-piece" aria-hidden="true">♞</div>
    <div class="project-card-header">
      <span class="project-status project-status-soon">Coming Soon</span>
      <h2 class="project-title">Press Pass</h2>
    </div>
    <p class="project-desc">Don't hold your breath!</p>
    <div class="project-links">
      <a href="/press-pass/" class="project-link">Press Pass &rarr;</a>
    </div>
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

<h2 class="games-index-heading">All Games</h2>
<ul class="games-index">
  <li><a href="/games/the-gauntlet/">The Gauntlet <span class="ver">v1.2</span></a> <span class="games-index-done">Completed</span></li>
  <li><a href="/games/notation-run/">Notation Blitz <span class="ver">v3.9</span></a> <span class="games-index-done">Completed</span></li>
  <li><a href="/games/fork-in-the-road/">Fork in the Road <span class="ver">v2.0</span></a> <span class="games-index-done">Completed</span></li>
  <li><a href="/games/pirc-protocol/">The Pirc Protocol <span class="ver">v2.0</span></a> <span class="games-index-done">Completed</span></li>
  <li><a href="/games/clearance-delta/">Clearance: DELTA <span class="ver">v1.5</span></a> <span class="games-index-done">Completed</span></li>
  <li><a href="/games/sky-run/">Sky Run <span class="ver">v2.0</span></a> <span class="games-index-done">Completed</span></li>
  <li><a href="/games/sand-mine-depths/">Sand Mine Depths <span class="ver">v3.0</span></a> <span class="games-index-done">Completed</span></li>
  <li><a href="/games/tower-defense/">Siege on Chess City <span class="ver">v2.4</span></a> <span class="games-index-done">Completed</span></li>
  <li><a href="/games/dungeon/">Princess Dungeon</a> <span class="games-index-done">Completed</span></li>
  <li><a href="/games/murphys-law/">Murphy's Law</a> <span class="games-index-note">— in development</span></li>
  <li><a href="/games/blindfold-puzzles/">Blindfold Puzzles <span class="ver">v2.2</span></a> <span class="games-index-done">Completed</span></li>
  <li><a href="/games/knights-tour/">Knight's Tour <span class="ver">v2.0</span></a> <span class="games-index-done">Completed</span></li>
  <li><a href="/games/battle-room/">The Battle Room</a> <span class="games-index-note">— in development</span></li>
  <li><a href="/games/follow-the-dog/">Follow the Dog</a> <span class="games-index-note">— in development</span></li>
  <li><a href="/games/chess-city/">Chess City</a> <span class="games-index-note">— in development</span></li>
  <li><a href="/games/the-gambit/">The Gambit</a> <span class="games-index-note">— in development</span></li>
</ul>

<style>
.games-index-heading { color: #F5C518; margin-top: 2.4rem; }
.games-index { list-style: none; padding: 0; margin: 0.6rem 0 1.4rem; }
.games-index li {
  display: flex; align-items: baseline; gap: 8px;
  padding: 8px 0; border-bottom: 1px solid rgba(245,197,24,0.18);
}
.games-index a { color: #f0e6ff; text-decoration: none; font-weight: 700; }
.games-index a:hover { color: #ffd740; }
.games-index .ver { font-size: 0.72em; color: #ff8fd0; vertical-align: super; }
.games-index-done {
  font-size: 0.66rem; text-transform: uppercase; letter-spacing: 0.08em;
  color: #04110a; background: #6bffb8; border-radius: 999px; padding: 2px 8px; font-weight: 800;
}
.games-index-note { font-size: 0.8rem; color: #9a7fd4; }
.games-index-term { font-size: 0.8rem; color: #ff6b6b; }

/* Studio-at-a-glance stat counters (links, like the PJCC home stats) */
.projects-stats { display: flex; flex-wrap: wrap; gap: 14px; margin: 18px 0 6px; }
.pstat { flex: 1 1 120px; min-width: 120px; text-align: center; padding: 14px 10px;
  background: linear-gradient(135deg, #1f1147 0%, #2d1b69 100%);
  border: 1px solid rgba(245,197,24,0.3); border-radius: 12px;
  text-decoration: none; transition: transform .12s, border-color .12s; }
.pstat:hover { transform: translateY(-2px); border-color: #F5C518; }
.pstat-go { color: #F5C518; font-size: 0.8em; }
.pstat-num { display: block; font-size: 2rem; font-weight: 800; color: #F5C518; line-height: 1; }
.pstat-lab { display: block; margin-top: 6px; font-size: 0.74rem; text-transform: uppercase;
  letter-spacing: 0.08em; color: #c9b6ef; }
</style>

<script src="/assets/js/pjcc-games-data.js"></script>
<script>
(function () {
  if (!window.PJCC_GAMES) return;
  // "Playable now" mirrors the PJCC home stat: open halls (Learn/Arcade/Isle), not hidden or coming-soon.
  var playable = PJCC_GAMES.filter(function (g) {
    return !g.hidden && !g.soon && g.playable !== false &&
      (g.cat === 'learn' || g.cat === 'arcade' || g.cat === 'isle');
  }).length + 1;   // +1: The Gauntlet lives outside the registry at /games/the-gauntlet/
  var dev = PJCC_GAMES.filter(function (g) { return g.cat === 'dev'; }).length;
  function set(id, n) { var e = document.getElementById(id); if (e) e.textContent = n; }
  set('pstat-playable', playable);
  set('pstat-dev', dev);
})();
</script>

<p class="projects-footer-note">Check out the <a href="/blog/">blog</a> for more updates.</p>
