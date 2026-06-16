---
layout: page
title: Projects
permalink: /projects/
body_class: theme-bw
---

<p class="projects-intro">McPuppy Studios is an independent creative studio built around storytelling, animation, and chess. Everything here is built from the ground up — one idea at a time.</p>

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
    <p class="project-desc">The flagship project. <em>Princess and the Journey to Chess City</em> (PJCC) is an original cartoon series following a young man who discovers the world of chess and the strange, strategic lands that come with it.</p>
    <ul class="project-details">
      <li><strong>Format:</strong> Animated series</li>
      <li><strong>Status:</strong> Story, characters, and world-building ongoing</li>
    </ul>
    <div class="project-links">
      <a href="/characters/" class="project-link">Characters</a>
      <a href="/locations/" class="project-link">Locations</a>
      <a href="/evolutions/" class="project-link">Evolution Log</a>
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
    <p class="project-desc">A chessboard dungeon crawler set in the PJCC universe. Play as Princess, capture enemy pieces by chess rules, clear rooms, and reach the exit.</p>
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
      <h2 class="project-title">Space Run</h2>
    </div>
    <p class="project-desc">A Star Fox-style chess runner. The CEO of the Chess City Invitational hurls chess pieces that unfold into rideable tracks — skate onto each one and ride it to the end. Rooks run long, bishops zigzag, knights cut an L, and the King's lanes bite back.</p>
    <ul class="project-details">
      <li><strong>Format:</strong> Browser game</li>
      <li><strong>Status:</strong> Playable — new piece patterns in progress</li>
    </ul>
    <div class="project-links">
      <a href="/games/space-run/" class="project-link">Play Now &rarr;</a>
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
      <h2 class="project-title">The Pirc Protocol <span class="ver">v1.1</span></h2>
    </div>
    <p class="project-desc">A spaced-repetition opening trainer. Sit across the board from Princess and answer her openings — the Pirc Defense, the Italian Game, the Scandinavian — one book move at a time. Master a line and it returns later; slip up and it comes back sooner, Anki-style.</p>
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
      <h2 class="project-title">Fork in the Road <span class="ver">v1.1</span></h2>
    </div>
    <p class="project-desc">A chess tactics trainer dressed as a journey. Each puzzle — fork, pin, skewer, discovered attack, mate — is a step on the road to Chess City. Find the winning move and Princess advances across the world map. Journey mode and a date-seeded Daily Five.</p>
    <ul class="project-details">
      <li><strong>Format:</strong> Browser game</li>
      <li><strong>Status:</strong> Playable — more puzzles in progress</li>
    </ul>
    <div class="project-links">
      <a href="/games/fork-in-the-road/" class="project-link project-link-play">▶ PLAY NOW</a>
      <a href="/games/" class="project-link">All Games</a>
    </div>
  </div>

  <div class="project-card project-card-featured">
    <div class="featured-ribbon">PLAYABLE NOW</div>
    <div class="project-card-corner-piece" aria-hidden="true">⊙</div>
    <div class="project-card-header">
      <span class="project-status project-status-done">
        <span class="project-status-dot"></span>
        Completed (pending improvements)
      </span>
      <h2 class="project-title">CIPHER <span class="ver">v1.2</span></h2>
    </div>
    <p class="project-desc">An operative decryption terminal in the style of the Classified archive. Crack a five-letter code in six tries — chess vocabulary at Clearance Delta, PJCC field codes at Clearance Omega — and the intercepted dispatch unredacts itself, line by line. Daily intercept plus an endless decryption streak.</p>
    <ul class="project-details">
      <li><strong>Format:</strong> Browser game</li>
      <li><strong>Status:</strong> Playable — more intercepts in progress</li>
    </ul>
    <div class="project-links">
      <a href="/games/cipher/" class="project-link project-link-play">▶ PLAY NOW</a>
      <a href="/games/" class="project-link">All Games</a>
    </div>
  </div>

  <div class="project-card project-card-featured">
    <div class="featured-ribbon">PLAYABLE NOW</div>
    <div class="project-card-corner-piece" aria-hidden="true">Δ</div>
    <div class="project-card-header">
      <span class="project-status project-status-done">
        <span class="project-status-dot"></span>
        Completed (pending improvements)
      </span>
      <h2 class="project-title">Clearance: DELTA <span class="ver">v1.2</span></h2>
    </div>
    <p class="project-desc">An operative trivia exam in the style of the Classified archive. Answer questions on chess rules, tactics, and history — and on the PJCC files themselves — to climb the clearance ladder from Recruit to Above Omega. Every promotion unredacts another dossier fragment; three wrong answers revokes your access.</p>
    <ul class="project-details">
      <li><strong>Format:</strong> Browser game</li>
      <li><strong>Status:</strong> Playable — more questions in progress</li>
    </ul>
    <div class="project-links">
      <a href="/games/clearance-delta/" class="project-link project-link-play">▶ PLAY NOW</a>
      <a href="/games/" class="project-link">All Games</a>
    </div>
  </div>

  <div class="project-card project-card-featured">
    <div class="featured-ribbon">PLAYABLE NOW</div>
    <div class="project-card-corner-piece" aria-hidden="true">⛴</div>
    <div class="project-card-header">
      <span class="project-status project-status-done">
        <span class="project-status-dot"></span>
        Completed (pending improvements)
      </span>
      <h2 class="project-title">Ferry Delayed <span class="ver">v1.1</span></h2>
    </div>
    <p class="project-desc">A sliding-block logic puzzle set at the gridlocked Shogi Island ferry dock. Every crate slides in a straight line, like a rook; drag them clear in the right order and slide Princess onto the ferry. Five computer-verified crossings, each with an optimal par to chase.</p>
    <ul class="project-details">
      <li><strong>Format:</strong> Browser game</li>
      <li><strong>Status:</strong> Playable — more crossings in progress</li>
    </ul>
    <div class="project-links">
      <a href="/games/ferry-delayed/" class="project-link project-link-play">▶ PLAY NOW</a>
      <a href="/games/" class="project-link">All Games</a>
    </div>
  </div>

  <div class="project-card project-card-soon">
    <div class="project-card-corner-piece" aria-hidden="true">♞</div>
    <div class="project-card-header">
      <span class="project-status project-status-soon">Coming Soon</span>
      <h2 class="project-title">Blender Animations</h2>
    </div>
    <p class="project-desc">Short 2D/3D animation experiments built in Blender — scene studies, character tests, and world sketches for PJCC.</p>
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
    <p class="project-desc">Real chess instruction for beginners and intermediates, taught by the creator of PJCC. The lessons directly inform how chess concepts are woven into the story.</p>
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
    <p class="project-desc">A podcast going behind the scenes of building McPuppy Studios — animation, chess, creative process, and making things from scratch.</p>
    <div class="project-links">
      <a href="/podcast/" class="project-link">More Info &rarr;</a>
    </div>
  </div>

  <div class="project-card project-card-soon">
    <div class="project-card-corner-piece" aria-hidden="true">♜</div>
    <div class="project-card-header">
      <span class="project-status project-status-soon">Coming Soon</span>
      <h2 class="project-title">Code &amp; Tools</h2>
    </div>
    <p class="project-desc">Scripts, generators, and small tools built to support the studio — Python utilities, Blender add-ons, and workflow experiments shared on GitHub.</p>
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
      <h2 class="project-title">Notation Blitz <span class="ver">v1.5</span></h2>
    </div>
    <p class="project-desc">A coordinate-reading rhythm game set in the streets of Checker Town. Square names drop on the beat — click them before they pass the gate. Forgiving timing, an approach ring that tells you exactly when to hit, saved personal bests, and a Pirc Defense mode that traces the Rival's opening move by move.</p>
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
      <h2 class="project-title">Sand Mine Depths <span class="ver">v1.1</span></h2>
    </div>
    <p class="project-desc">A knight-movement descent roguelite set in the mine beneath Checker Town. Princess hops in L-shapes, the sand and rock cave in behind her, and the deeper she goes the more the mine remembers. A buried thread of the Subject Zero mystery.</p>
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
      <h2 class="project-title">Shogi Island <span class="ver">v2.0</span></h2>
    </div>
    <p class="project-desc">A shogi piece-movement trainer set in the Japanese-speaking world beyond the ferry. Read each piece — pawn, lance, knight, the generals, and the promoted Tokin, Horse, and Dragon — and tap every square it can move to on a full 9×9 board. Princess's first lessons after the pu-rin-se-suuu portal.</p>
    <ul class="project-details">
      <li><strong>Format:</strong> Browser game</li>
      <li><strong>Status:</strong> Playable — full 9×9 board with a Basics / +Promoted toggle; a drops lesson in progress</li>
    </ul>
    <div class="project-links">
      <a href="/games/shogi-island/" class="project-link project-link-play">▶ PLAY NOW</a>
      <a href="/games/" class="project-link">All Games</a>
    </div>
  </div>

  <div class="project-card project-card-terminated">
    <div class="project-card-corner-piece" aria-hidden="true">♞</div>
    <div class="project-card-header">
      <span class="project-status project-status-terminated">
        <span class="project-status-dot"></span>
        TERMINATED
      </span>
      <h2 class="project-title">Knight's Tour</h2>
    </div>
    <p class="project-desc">The centuries-old chess puzzle, reframed as Princess's journey. Hop the knight across every square of a region exactly once, then string five growing boards — 5×5 up to a full 8×8 — into the whole road from Checker Town to Chess City. Pulled from the main lineup — but still fully playable right here.</p>
    <ul class="project-details">
      <li><strong>Format:</strong> Browser game</li>
      <li><strong>Status:</strong> Terminated — not listed on the games page, playable from here only</li>
    </ul>
    <div class="project-links">
      <a href="/games/knights-tour/" class="project-link project-link-terminated">▶ PLAY IT HERE</a>
    </div>
  </div>

</div>

<h2 class="games-index-heading">All Games</h2>
<ul class="games-index">
  <li><a href="/games/dungeon/">Princess Dungeon</a> <span class="games-index-note">— in development</span></li>
  <li><a href="/games/notation-run/">Notation Blitz <span class="ver">v1.5</span></a> <span class="games-index-done">Completed</span></li>
  <li><a href="/games/space-run/">Space Run</a> <span class="games-index-note">— in development</span></li>
  <li><a href="/games/pirc-protocol/">The Pirc Protocol <span class="ver">v1.1</span></a> <span class="games-index-done">Completed</span></li>
  <li><a href="/games/fork-in-the-road/">Fork in the Road <span class="ver">v1.1</span></a> <span class="games-index-done">Completed</span></li>
  <li><a href="/games/sand-mine-depths/">Sand Mine Depths <span class="ver">v1.1</span></a> <span class="games-index-done">Completed</span></li>
  <li><a href="/games/cipher/">CIPHER <span class="ver">v1.2</span></a> <span class="games-index-done">Completed</span></li>
  <li><a href="/games/clearance-delta/">Clearance: DELTA <span class="ver">v1.2</span></a> <span class="games-index-done">Completed</span></li>
  <li><a href="/games/ferry-delayed/">Ferry Delayed <span class="ver">v1.1</span></a> <span class="games-index-done">Completed</span></li>
  <li><a href="/games/shogi-island/">Shogi Island <span class="ver">v2.0</span></a> <span class="games-index-done">Completed</span></li>
  <li><a href="/games/knights-tour/">Knight's Tour</a> <span class="games-index-term">— terminated</span></li>
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
</style>

<p class="projects-footer-note">More in the works. Check the <a href="/blog/">blog</a> for updates.</p>
