---
layout: page
title: Character Constellation
permalink: /constellation/
---

<div class="constellation-page">
  <div class="constellation-header">
    <div class="constellation-eyebrow">PJCC — Cast Map</div>
    <h1 class="constellation-title">Character Constellation</h1>
    <p class="constellation-sub">Hover any character to see their connections. Click to visit their page.</p>
  </div>

  <div class="constellation-wrap">
    <svg class="constellation-svg" viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bg-grad" cx="50%" cy="50%" r="60%">
          <stop offset="0%"   stop-color="rgba(30,12,65,0.7)"/>
          <stop offset="100%" stop-color="rgba(2,0,10,0)"/>
        </radialGradient>
        <filter id="node-glow">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      <!-- Background glow -->
      <rect width="800" height="480" fill="url(#bg-grad)"/>

      <!-- Star dots -->
      <circle cx="60"  cy="40"  r="0.8" fill="rgba(255,255,255,0.3)"/>
      <circle cx="180" cy="20"  r="0.6" fill="rgba(255,255,255,0.25)"/>
      <circle cx="340" cy="55"  r="1"   fill="rgba(255,255,255,0.35)"/>
      <circle cx="520" cy="30"  r="0.7" fill="rgba(255,255,255,0.28)"/>
      <circle cx="700" cy="60"  r="0.9" fill="rgba(255,255,255,0.32)"/>
      <circle cx="760" cy="140" r="0.6" fill="rgba(255,255,255,0.2)"/>
      <circle cx="740" cy="400" r="0.8" fill="rgba(255,255,255,0.25)"/>
      <circle cx="100" cy="420" r="0.7" fill="rgba(255,255,255,0.28)"/>
      <circle cx="30"  cy="300" r="0.6" fill="rgba(255,255,255,0.22)"/>
      <circle cx="420" cy="450" r="0.8" fill="rgba(255,255,255,0.3)"/>

      <!-- ── EDGES ── -->
      <!-- Princess ↔ Narrator: tight bond (gold solid) -->
      <line class="const-edge const-edge--bond"      x1="400" y1="220" x2="400" y2="100"/>
      <!-- Princess ↔ Argus: companion -->
      <line class="const-edge const-edge--companion" x1="400" y1="220" x2="240" y2="340"/>
      <!-- Princess ↔ Oskar: companion -->
      <line class="const-edge const-edge--companion" x1="400" y1="220" x2="560" y2="340"/>
      <!-- Narrator ↔ Rival: rivals →  respect -->
      <line class="const-edge const-edge--rival"     x1="400" y1="100" x2="620" y2="180"/>
      <!-- Narrator ↔ Father: family (distant) -->
      <line class="const-edge const-edge--family"    x1="400" y1="100" x2="180" y2="180"/>
      <!-- Narrator ↔ Best Friend: friend (strained) -->
      <line class="const-edge const-edge--strained"  x1="400" y1="100" x2="200" y2="340"/>
      <!-- Argus ↔ Oskar: companions -->
      <line class="const-edge const-edge--companion" x1="240" y1="340" x2="560" y2="340"/>

      <!-- ── NODES ── -->
      <!-- Princess (center, main) -->
      <g class="const-node-group" data-char="princess" data-name="Princess" data-role="Main Character" data-url="/characters/princess/">
        <circle cx="400" cy="220" r="32" fill="rgba(245,197,24,0.08)" stroke="rgba(245,197,24,0.15)" stroke-width="1" class="const-node-ring"/>
        <circle cx="400" cy="220" r="22" fill="rgba(245,197,24,0.18)" stroke="rgba(245,197,24,0.7)" stroke-width="2" filter="url(#node-glow)"/>
        <text x="400" y="225" text-anchor="middle" font-size="16" fill="rgba(245,197,24,0.9)" pointer-events="none">♞</text>
        <text x="400" y="256" text-anchor="middle" font-family="'Poppins',sans-serif" font-size="10" font-weight="700" fill="rgba(245,197,24,0.75)" pointer-events="none">Princess</text>
      </g>

      <!-- Narrator (top center, main) -->
      <g class="const-node-group" data-char="narrator" data-name="The Narrator" data-role="Main Character" data-url="/characters/narrator/">
        <circle cx="400" cy="100" r="28" fill="rgba(196,181,253,0.07)" stroke="rgba(196,181,253,0.12)" stroke-width="1" class="const-node-ring"/>
        <circle cx="400" cy="100" r="19" fill="rgba(196,181,253,0.16)" stroke="rgba(196,181,253,0.65)" stroke-width="2" filter="url(#node-glow)"/>
        <text x="400" y="105" text-anchor="middle" font-size="14" fill="rgba(196,181,253,0.85)" pointer-events="none">♟</text>
        <text x="400" y="132" text-anchor="middle" font-family="'Poppins',sans-serif" font-size="10" font-weight="700" fill="rgba(196,181,253,0.65)" pointer-events="none">Narrator</text>
      </g>

      <!-- The Rival (upper right) -->
      <g class="const-node-group" data-char="rival" data-name="The Rival" data-role="Main Character" data-url="/characters/rival/">
        <circle cx="620" cy="180" r="24" fill="rgba(220,80,80,0.06)" stroke="rgba(220,80,80,0.12)" stroke-width="1" class="const-node-ring"/>
        <circle cx="620" cy="180" r="16" fill="rgba(220,80,80,0.14)" stroke="rgba(220,80,80,0.55)" stroke-width="1.5" filter="url(#node-glow)"/>
        <text x="620" y="185" text-anchor="middle" font-size="12" fill="rgba(220,80,80,0.8)" pointer-events="none">♚</text>
        <text x="620" y="208" text-anchor="middle" font-family="'Poppins',sans-serif" font-size="10" font-weight="700" fill="rgba(220,80,80,0.6)" pointer-events="none">The Rival</text>
      </g>

      <!-- The Father (upper left) -->
      <g class="const-node-group" data-char="father" data-name="The Father" data-role="Side Character" data-url="/characters/father/">
        <circle cx="180" cy="180" r="20" fill="rgba(100,200,100,0.06)" stroke="rgba(100,200,100,0.1)" stroke-width="1" class="const-node-ring"/>
        <circle cx="180" cy="180" r="14" fill="rgba(100,200,100,0.12)" stroke="rgba(100,200,100,0.45)" stroke-width="1.5" filter="url(#node-glow)"/>
        <text x="180" y="185" text-anchor="middle" font-size="11" fill="rgba(100,200,100,0.75)" pointer-events="none">♜</text>
        <text x="180" y="207" text-anchor="middle" font-family="'Poppins',sans-serif" font-size="10" font-weight="700" fill="rgba(100,200,100,0.55)" pointer-events="none">Father</text>
      </g>

      <!-- Best Friend (lower left) -->
      <g class="const-node-group" data-char="best-friend" data-name="The Best Friend" data-role="Side Character" data-url="/characters/best-friend/">
        <circle cx="200" cy="340" r="20" fill="rgba(180,100,30,0.06)" stroke="rgba(180,100,30,0.1)" stroke-width="1" class="const-node-ring"/>
        <circle cx="200" cy="340" r="14" fill="rgba(180,100,30,0.12)" stroke="rgba(180,100,30,0.45)" stroke-width="1.5" filter="url(#node-glow)"/>
        <text x="200" y="345" text-anchor="middle" font-size="11" fill="rgba(180,100,30,0.75)" pointer-events="none">♝</text>
        <text x="200" y="367" text-anchor="middle" font-family="'Poppins',sans-serif" font-size="10" font-weight="700" fill="rgba(180,100,30,0.55)" pointer-events="none">Best Friend</text>
      </g>

      <!-- Argus (lower left) -->
      <g class="const-node-group" data-char="argus" data-name="Argus" data-role="Companion" data-url="/characters/argus/">
        <circle cx="240" cy="340" r="18" fill="rgba(196,181,253,0.06)" stroke="rgba(196,181,253,0.1)" stroke-width="1" class="const-node-ring"/>
        <circle cx="240" cy="340" r="13" fill="rgba(196,181,253,0.12)" stroke="rgba(196,181,253,0.42)" stroke-width="1.5" filter="url(#node-glow)"/>
        <text x="240" y="345" text-anchor="middle" font-size="11" fill="rgba(196,181,253,0.72)" pointer-events="none">♞</text>
        <text x="240" y="367" text-anchor="middle" font-family="'Poppins',sans-serif" font-size="10" font-weight="700" fill="rgba(196,181,253,0.52)" pointer-events="none">Argus</text>
      </g>

      <!-- Oskar (lower right) -->
      <g class="const-node-group" data-char="oskar" data-name="Oskar" data-role="Companion" data-url="/characters/oskar/">
        <circle cx="560" cy="340" r="18" fill="rgba(196,181,253,0.06)" stroke="rgba(196,181,253,0.1)" stroke-width="1" class="const-node-ring"/>
        <circle cx="560" cy="340" r="13" fill="rgba(196,181,253,0.12)" stroke="rgba(196,181,253,0.42)" stroke-width="1.5" filter="url(#node-glow)"/>
        <text x="560" y="345" text-anchor="middle" font-size="11" fill="rgba(196,181,253,0.72)" pointer-events="none">♞</text>
        <text x="560" y="367" text-anchor="middle" font-family="'Poppins',sans-serif" font-size="10" font-weight="700" fill="rgba(196,181,253,0.52)" pointer-events="none">Oskar</text>
      </g>
    </svg>

    <!-- Hover tooltip -->
    <div class="constellation-tooltip" id="const-tooltip">
      <div class="tooltip-name" id="tt-name"></div>
      <div class="tooltip-role" id="tt-role"></div>
      <a class="tooltip-link" id="tt-link" href="#">Visit Page →</a>
    </div>
  </div>

  <div class="constellation-legend">
    <div class="constellation-legend-item">
      <div class="legend-line" style="background:rgba(245,197,24,0.6);"></div>Bond
    </div>
    <div class="constellation-legend-item">
      <div class="legend-line" style="background:rgba(196,181,253,0.4);border-top:2px dashed rgba(196,181,253,0.4);height:0;"></div>Companion
    </div>
    <div class="constellation-legend-item">
      <div class="legend-line" style="background:rgba(220,80,80,0.5);border-top:2px dashed rgba(220,80,80,0.5);height:0;"></div>Rivals
    </div>
    <div class="constellation-legend-item">
      <div class="legend-line" style="background:rgba(100,200,100,0.4);border-top:2px dashed rgba(100,200,100,0.4);height:0;"></div>Family
    </div>
    <div class="constellation-legend-item">
      <div class="legend-line" style="background:rgba(180,100,30,0.4);border-top:2px dashed rgba(180,100,30,0.4);height:0;"></div>Strained
    </div>
  </div>
</div>

<script>
(function() {
  var tooltip = document.getElementById('const-tooltip');
  var ttName  = document.getElementById('tt-name');
  var ttRole  = document.getElementById('tt-role');
  var ttLink  = document.getElementById('tt-link');

  document.querySelectorAll('.const-node-group').forEach(function(g) {
    g.addEventListener('mouseenter', function() {
      ttName.textContent = g.getAttribute('data-name');
      ttRole.textContent = g.getAttribute('data-role');
      ttLink.href        = g.getAttribute('data-url');
      tooltip.classList.add('is-visible');
    });
    g.addEventListener('mouseleave', function() {
      tooltip.classList.remove('is-visible');
    });
    g.addEventListener('click', function() {
      window.location.href = g.getAttribute('data-url');
    });
  });
})();
</script>
