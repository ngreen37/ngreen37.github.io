---
layout: page
title: McPuppy Studios
permalink: /projects/
body_class: theme-bw
jukebox: true
---

<p class="projects-intro">An independent studio. Stories, chess, and things built from nothing — one idea at a time. Most of it isn't finished. That's on purpose.</p>

<nav class="studio-hub" aria-label="McPuppy Studios sections">
  <a href="/pjcc/">PJCC</a>
  <a href="/blog/">Blog</a>
  <a href="/mailing-list/">Mailing List</a>
  <a href="/press-pass/">Press Pass</a>
  <a href="/educators/">For Educators</a>
</nav>
<style>
.studio-hub { display: flex; flex-wrap: wrap; gap: 8px; margin: 4px 0 18px; }
.studio-hub a { font-size: 0.82rem; font-weight: 700; text-decoration: none; color: #cdbcf2;
  background: rgba(110,95,160,0.18); border: 1px solid #4a3a86; border-radius: 999px; padding: 6px 14px;
  transition: border-color .15s, color .15s; }
.studio-hub a:hover { border-color: #F5C518; color: #F5C518; }
</style>

<div class="projects-stats" id="projects-stats" aria-label="Studio at a glance">
  <div class="pstat"><span class="pstat-num" id="pstat-playable">—</span><span class="pstat-lab">playable now</span></div>
  <div class="pstat"><span class="pstat-num" id="pstat-done">—</span><span class="pstat-lab">completed</span></div>
  <div class="pstat"><span class="pstat-num" id="pstat-dev">—</span><span class="pstat-lab">in the lab</span></div>
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
    <p class="project-desc">A dog. A board. A city across the sea. The whole reason any of this exists.</p>
    <ul class="project-details">
      <li><strong>Format:</strong> Animated series</li>
      <li><strong>Status:</strong> Story, characters, and world-building ongoing</li>
    </ul>
    <div class="project-links">
      <a href="/characters/" class="project-link">Characters</a>
      <a href="/locations/" class="project-link">Locations</a>
      <a href="/blog/" class="project-link">Blog</a>
    </div>
  </div>

  <div class="project-card project-card-active">
    <div class="project-card-corner-piece" aria-hidden="true">♟</div>
    <div class="project-card-header">
      <span class="project-status project-status-active">
        <span class="project-status-dot"></span>
        In Development
      </span>
      <h2 class="project-title">PJCC Dungeon Crawler</h2>
    </div>
    <p class="project-desc">Every room is a tactic. Princess goes down. Not everything comes back up.</p>
    <ul class="project-details">
      <li><strong>Format:</strong> Browser game</li>
      <li><strong>Status:</strong> Playable — new floors and pieces in progress</li>
    </ul>
    <div class="project-links">
      <a href="/games/dungeon/" class="project-link">Play Now &rarr;</a>
      <a href="/games/" class="project-link">All Games</a>
    </div>
  </div>

  <div class="project-card project-card-active">
    <div class="project-card-corner-piece" aria-hidden="true">✦</div>
    <div class="project-card-header">
      <span class="project-status project-status-active">
        <span class="project-status-dot"></span>
        In Development
      </span>
      <h2 class="project-title">Follow the Dog</h2>
    </div>
    <p class="project-desc">Don't think. Follow her. The pieces become the path — if you trust it.</p>
    <ul class="project-details">
      <li><strong>Format:</strong> Browser game</li>
      <li><strong>Status:</strong> Playable — new piece patterns in progress</li>
    </ul>
    <div class="project-links">
      <a href="/games/follow-the-dog/" class="project-link">Play Now &rarr;</a>
      <a href="/games/" class="project-link">All Games</a>
    </div>
  </div>

  <div class="project-card project-card-featured">
    <div class="featured-ribbon">NEW · PLAYABLE</div>
    <div class="project-card-corner-piece" aria-hidden="true">♞</div>
    <div class="project-card-header">
      <span class="project-status project-status-done">
        <span class="project-status-dot"></span>
        Completed (pending improvements)
      </span>
      <h2 class="project-title">Sky Run <span class="ver">v1.0</span></h2>
    </div>
    <p class="project-desc">She flies. They fall. Keep her in the sky long enough to reach the top.</p>
    <ul class="project-details">
      <li><strong>Format:</strong> Browser game (canvas)</li>
      <li><strong>Status:</strong> Playable — balance &amp; content tuning to come</li>
    </ul>
    <div class="project-links">
      <a href="/games/sky-run/" class="project-link project-link-play">▶ PLAY NOW</a>
      <a href="/games/" class="project-link">All Games</a>
    </div>
  </div>

  <div class="project-card project-card-featured">
    <div class="featured-ribbon">PLAYABLE NOW</div>
    <div class="project-card-corner-piece" aria-hidden="true">♚</div>
    <div class="project-card-header">
      <span class="project-status project-status-done">
        <span class="project-status-dot"></span>
        Completed (pending improvements)
      </span>
      <h2 class="project-title">The Pirc Protocol <span class="ver">v2.0</span></h2>
    </div>
    <p class="project-desc">Her openings, on repeat, until they're yours. Miss one and it comes back sooner.</p>
    <ul class="project-details">
      <li><strong>Format:</strong> Browser game</li>
      <li><strong>Status:</strong> Playable — more openings in progress</li>
    </ul>
    <div class="project-links">
      <a href="/games/pirc-protocol/" class="project-link project-link-play">▶ PLAY NOW</a>
      <a href="/games/" class="project-link">All Games</a>
    </div>
  </div>

  <div class="project-card project-card-featured">
    <div class="featured-ribbon">PLAYABLE NOW</div>
    <div class="project-card-corner-piece" aria-hidden="true">⚔</div>
    <div class="project-card-header">
      <span class="project-status project-status-done">
        <span class="project-status-dot"></span>
        Completed (pending improvements)
      </span>
      <h2 class="project-title">Fork in the Road <span class="ver">v2.0</span></h2>
    </div>
    <p class="project-desc">One move wins. Find it, and the road opens a little further.</p>
    <ul class="project-details">
      <li><strong>Format:</strong> Browser game</li>
      <li><strong>Status:</strong> Playable — more puzzles in progress</li>
    </ul>
    <div class="project-links">
      <a href="/games/fork-in-the-road/" class="project-link project-link-play">▶ PLAY NOW</a>
      <a href="/games/" class="project-link">All Games</a>
    </div>
  </div>

  <div class="project-card project-card-soon">
    <div class="project-card-corner-piece" aria-hidden="true">♞</div>
    <div class="project-card-header">
      <span class="project-status project-status-soon">Coming Soon</span>
      <h2 class="project-title">Blender Animations</h2>
    </div>
    <p class="project-desc">Frames, in the dark. They're coming.</p>
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
      <h2 class="project-title">Chess Lessons</h2>
    </div>
    <p class="project-desc">Real chess, taught by hand. Everything else here grows out of these.</p>
    <div class="project-links">
      <a href="/chess-lessons/" class="project-link">Visit Chess Lessons &rarr;</a>
    </div>
  </div>

  <div class="project-card project-card-soon">
    <div class="project-card-corner-piece" aria-hidden="true">♝</div>
    <div class="project-card-header">
      <span class="project-status project-status-soon">Coming Soon</span>
      <h2 class="project-title">Podcast</h2>
    </div>
    <p class="project-desc">Off the record, on the build. <strong>Winter 2026.</strong></p>
    <div class="project-links">
      <a href="/blog/" class="project-link">More Info &rarr;</a>
    </div>
  </div>

  <div class="project-card project-card-soon">
    <div class="project-card-corner-piece" aria-hidden="true">♜</div>
    <div class="project-card-header">
      <span class="project-status project-status-soon">Coming Soon</span>
      <h2 class="project-title">Code &amp; Tools</h2>
    </div>
    <p class="project-desc">The tools behind the curtain. Shared when they're ready.</p>
    <ul class="project-details">
      <li><strong>Status:</strong> Projects linked when published</li>
    </ul>
  </div>

  <div class="project-card project-card-featured">
    <div class="featured-ribbon">PLAYABLE NOW</div>
    <div class="project-card-corner-piece" aria-hidden="true">♫</div>
    <div class="project-card-header">
      <span class="project-status project-status-done">
        <span class="project-status-dot"></span>
        Completed (pending improvements)
      </span>
      <h2 class="project-title">Notation Blitz <span class="ver">v3.4</span></h2>
    </div>
    <p class="project-desc">Read the square before it's gone. The streets keep the beat.</p>
    <ul class="project-details">
      <li><strong>Format:</strong> Browser game</li>
      <li><strong>Status:</strong> Completed — playable now, polish ongoing</li>
    </ul>
    <div class="project-links">
      <a href="/games/notation-run/" class="project-link project-link-play">▶ PLAY NOW</a>
      <a href="/games/" class="project-link">All Games</a>
    </div>
  </div>

  <div class="project-card project-card-featured">
    <div class="featured-ribbon">PLAYABLE NOW</div>
    <div class="project-card-corner-piece" aria-hidden="true">⛏</div>
    <div class="project-card-header">
      <span class="project-status project-status-done">
        <span class="project-status-dot"></span>
        Completed (pending improvements)
      </span>
      <h2 class="project-title">Sand Mine Depths <span class="ver">v2.2</span></h2>
    </div>
    <p class="project-desc">Down. The deeper she digs, the more the mine remembers. Something's buried here.</p>
    <ul class="project-details">
      <li><strong>Format:</strong> Browser game</li>
      <li><strong>Status:</strong> Completed — playable now, deeper floors and lore ongoing</li>
    </ul>
    <div class="project-links">
      <a href="/games/sand-mine-depths/" class="project-link project-link-play">▶ PLAY NOW</a>
      <a href="/games/" class="project-link">All Games</a>
    </div>
  </div>

  <div class="project-card project-card-featured">
    <div class="featured-ribbon">PLAYABLE NOW</div>
    <div class="project-card-corner-piece" aria-hidden="true">将</div>
    <div class="project-card-header">
      <span class="project-status project-status-done">
        <span class="project-status-dot"></span>
        Completed (pending improvements)
      </span>
      <h2 class="project-title">Shogi Island <span class="ver">v3.0</span></h2>
    </div>
    <p class="project-desc">A foreign board that teaches itself. Read far enough and it opens.</p>
    <ul class="project-details">
      <li><strong>Format:</strong> Browser game</li>
      <li><strong>Status:</strong> Playable — engine, decode codex, theme bloom, and the hidden Lion match all live</li>
    </ul>
    <div class="project-links">
      <a href="/games/shogi-island/" class="project-link project-link-play">▶ PLAY NOW</a>
      <a href="/games/" class="project-link">All Games</a>
    </div>
  </div>

  <div class="project-card">
    <div class="project-card-corner-piece" aria-hidden="true">♞</div>
    <div class="project-card-header">
      <span class="project-status">
        <span class="project-status-dot"></span>
        PLAYABLE
      </span>
      <h2 class="project-title">Knight's Tour</h2>
    </div>
    <p class="project-desc">Touch every square. Once. Leave nothing behind.</p>
    <ul class="project-details">
      <li><strong>Format:</strong> Browser game</li>
      <li><strong>Status:</strong> Live — rebuilt with a tour solver, scoring &amp; a daily challenge</li>
    </ul>
    <div class="project-links">
      <a href="/games/knights-tour/" class="project-link">▶ PLAY IT HERE</a>
    </div>
  </div>

</div>

<h2 class="games-index-heading">All Games</h2>
<ul class="games-index">
  <li><a href="/games/dungeon/">Princess Dungeon</a> <span class="games-index-note">— in development</span></li>
  <li><a href="/games/notation-run/">Notation Blitz <span class="ver">v3.7</span></a> <span class="games-index-done">Completed</span></li>
  <li><a href="/games/follow-the-dog/">Follow the Dog</a> <span class="games-index-note">— in development</span></li>
  <li><a href="/games/sky-run/">Sky Run <span class="ver">v1.0</span></a> <span class="games-index-done">Completed</span></li>
  <li><a href="/games/pirc-protocol/">The Pirc Protocol <span class="ver">v2.0</span></a> <span class="games-index-done">Completed</span></li>
  <li><a href="/games/fork-in-the-road/">Fork in the Road <span class="ver">v2.0</span></a> <span class="games-index-done">Completed</span></li>
  <li><a href="/games/sand-mine-depths/">Sand Mine Depths <span class="ver">v2.2</span></a> <span class="games-index-done">Completed</span></li>
  <li><a href="/games/clearance-delta/">Clearance: DELTA <span class="ver">v1.3</span></a> <span class="games-index-done">Completed</span></li>
  <li><a href="/games/shogi-island/">Shogi Island <span class="ver">v3.1</span></a> <span class="games-index-done">Completed</span></li>
  <li><a href="/games/tower-defense/">Siege on Chess City <span class="ver">v2.1</span></a> <span class="games-index-done">Completed</span></li>
  <li><a href="/games/blindfold-puzzles/">Blindfold Puzzles <span class="ver">v2.2</span></a> <span class="games-index-note">— hidden bonus · hides The Mind's Eye</span></li>
  <li><a href="/games/knights-tour/">Knight's Tour <span class="ver">v2.0</span></a> <span class="games-index-done">Completed</span></li>
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

/* Studio-at-a-glance stat counters */
.projects-stats { display: flex; flex-wrap: wrap; gap: 14px; margin: 18px 0 6px; }
.pstat { flex: 1 1 120px; min-width: 120px; text-align: center; padding: 14px 10px;
  background: linear-gradient(135deg, #1f1147 0%, #2d1b69 100%);
  border: 1px solid rgba(245,197,24,0.3); border-radius: 12px; }
.pstat-num { display: block; font-size: 2rem; font-weight: 800; color: #F5C518; line-height: 1; }
.pstat-lab { display: block; margin-top: 6px; font-size: 0.74rem; text-transform: uppercase;
  letter-spacing: 0.08em; color: #c9b6ef; }
</style>

<script>
(function () {
  var items = [].slice.call(document.querySelectorAll('.games-index li'));
  if (!items.length) return;
  var dev  = items.filter(function (li) { return /development/i.test(li.textContent); }).length;
  var term = items.filter(function (li) { return li.querySelector('.games-index-term'); }).length;
  var done = items.filter(function (li) { return li.querySelector('.games-index-done'); }).length;
  var playable = items.length - dev - term;   // completed + playable bonuses
  function set(id, n) { var e = document.getElementById(id); if (e) e.textContent = n; }
  set('pstat-playable', playable);
  set('pstat-done', done);
  set('pstat-dev', dev);
})();
</script>

<p class="projects-footer-note">More in the dark. The <a href="/blog/">blog</a> surfaces what's ready.</p>
