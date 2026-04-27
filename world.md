---
layout: worldmap
title: The Known World
permalink: /world/
---

<svg viewBox="0 0 1000 560" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block;">
  <defs>
    <!-- Ocean gradient -->
    <linearGradient id="ocean-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"   stop-color="#040820"/>
      <stop offset="100%" stop-color="#071430"/>
    </linearGradient>
    <!-- Checker pattern for Checker Town -->
    <pattern id="checker" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
      <rect width="7" height="7" fill="rgba(160,90,20,0.55)"/>
      <rect x="7" y="7" width="7" height="7" fill="rgba(160,90,20,0.55)"/>
      <rect x="7" y="0" width="7" height="7" fill="rgba(80,40,10,0.35)"/>
      <rect x="0" y="7" width="7" height="7" fill="rgba(80,40,10,0.35)"/>
    </pattern>
    <!-- Stars pattern -->
    <pattern id="stars" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
      <circle cx="15"  cy="22"  r="0.8" fill="rgba(255,255,255,0.35)"/>
      <circle cx="55"  cy="8"   r="0.6" fill="rgba(255,255,255,0.25)"/>
      <circle cx="90"  cy="38"  r="1"   fill="rgba(255,255,255,0.4)"/>
      <circle cx="35"  cy="70"  r="0.7" fill="rgba(255,255,255,0.3)"/>
      <circle cx="78"  cy="85"  r="0.9" fill="rgba(255,255,255,0.35)"/>
      <circle cx="105" cy="60"  r="0.6" fill="rgba(255,255,255,0.2)"/>
      <circle cx="10"  cy="100" r="0.8" fill="rgba(255,255,255,0.28)"/>
      <circle cx="60"  cy="112" r="0.5" fill="rgba(255,255,255,0.22)"/>
    </pattern>
    <!-- Fog/mist for Mystery City -->
    <radialGradient id="fog" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="rgba(120,60,200,0.45)"/>
      <stop offset="100%" stop-color="rgba(120,60,200,0)"/>
    </radialGradient>
    <!-- Glow for Chess City -->
    <radialGradient id="chess-city-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="rgba(245,197,24,0.22)"/>
      <stop offset="100%" stop-color="rgba(245,197,24,0)"/>
    </radialGradient>
    <!-- Sky gradient (top portion) -->
    <linearGradient id="sky-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"   stop-color="#000008"/>
      <stop offset="100%" stop-color="rgba(0,0,8,0)"/>
    </linearGradient>
  </defs>

  <!-- Background: deep ocean -->
  <rect width="1000" height="560" fill="url(#ocean-grad)"/>

  <!-- Stars in sky -->
  <rect width="1000" height="560" fill="url(#stars)" opacity="0.7"/>

  <!-- Sky fade at top -->
  <rect width="1000" height="180" fill="url(#sky-grad)"/>

  <!-- ── OCEAN BODY (mid region) ── -->
  <polygon
    data-loc="the-sea"
    class="wm-region"
    points="320,100 680,85 1000,100 1000,560 0,560 0,130"
    fill="rgba(10,30,90,0.55)"
    stroke="rgba(30,80,180,0.2)"
    stroke-width="1"/>

  <!-- Ocean shimmer lines -->
  <line x1="0"    y1="220" x2="1000" y2="215" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
  <line x1="0"    y1="300" x2="1000" y2="295" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>
  <line x1="0"    y1="380" x2="1000" y2="378" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>
  <line x1="0"    y1="460" x2="1000" y2="458" stroke="rgba(255,255,255,0.02)" stroke-width="1"/>

  <!-- ── LEFT MAINLAND ── -->
  <polygon
    points="0,560 0,110 50,88 140,80 230,100 300,145 340,220 350,330 330,450 270,520 140,550 0,560"
    fill="rgba(60,35,15,0.88)"
    stroke="rgba(100,60,20,0.4)"
    stroke-width="1.5"/>

  <!-- ── CHECKER TOWN DISTRICT ── -->
  <polygon
    data-loc="checker-town"
    class="wm-region"
    points="25,280 100,250 200,258 265,305 278,400 240,455 155,468 55,445 22,370"
    fill="url(#checker)"
    stroke="rgba(200,120,30,0.45)"
    stroke-width="1.5"/>

  <!-- Checker Town grid overlay (city streets feel) -->
  <line x1="25"  y1="320" x2="278" y2="315" stroke="rgba(200,120,30,0.12)" stroke-width="0.8"/>
  <line x1="30"  y1="365" x2="272" y2="360" stroke="rgba(200,120,30,0.12)" stroke-width="0.8"/>
  <line x1="100" y1="250" x2="95"  y2="468" stroke="rgba(200,120,30,0.1)"  stroke-width="0.8"/>
  <line x1="175" y1="258" x2="168" y2="466" stroke="rgba(200,120,30,0.1)"  stroke-width="0.8"/>

  <!-- ── SAND MINES ── -->
  <polygon
    data-loc="sand-mines"
    class="wm-region"
    points="270,310 335,285 382,305 390,380 368,440 295,452 262,405"
    fill="rgba(160,120,30,0.45)"
    stroke="rgba(180,140,40,0.35)"
    stroke-width="1.5"/>

  <!-- Mine shaft marks -->
  <line x1="300" y1="320" x2="300" y2="420" stroke="rgba(180,140,40,0.25)" stroke-width="1"/>
  <line x1="330" y1="310" x2="328" y2="435" stroke="rgba(180,140,40,0.25)" stroke-width="1"/>
  <line x1="360" y1="315" x2="356" y2="438" stroke="rgba(180,140,40,0.2)"  stroke-width="1"/>

  <!-- ── RIGHT MAINLAND (Chess City territory) ── -->
  <polygon
    points="1000,560 1000,60 960,38 880,25 780,45 700,88 668,160 660,280 672,420 720,510 850,548 1000,560"
    fill="rgba(40,30,10,0.85)"
    stroke="rgba(200,160,30,0.35)"
    stroke-width="1.5"/>

  <!-- Chess City glow halo -->
  <ellipse cx="840" cy="200" rx="200" ry="170" fill="url(#chess-city-glow)"/>

  <!-- ── CHESS CITY DISTRICT ── -->
  <polygon
    data-loc="chess-city"
    class="wm-region"
    points="685,75 800,48 940,72 975,185 955,315 848,358 718,332 675,218 670,140"
    fill="rgba(180,140,20,0.38)"
    stroke="rgba(245,197,24,0.55)"
    stroke-width="2"/>

  <!-- Chess City buildings (simplified skyline) -->
  <rect x="720" y="160" width="18" height="60"  fill="rgba(245,197,24,0.35)" rx="2"/>
  <rect x="750" y="140" width="22" height="80"  fill="rgba(245,197,24,0.4)"  rx="2"/>
  <rect x="785" y="120" width="28" height="100" fill="rgba(245,197,24,0.5)"  rx="2"/>
  <rect x="826" y="110" width="26" height="110" fill="rgba(245,197,24,0.55)" rx="2"/>
  <rect x="865" y="130" width="22" height="90"  fill="rgba(245,197,24,0.45)" rx="2"/>
  <rect x="900" y="155" width="18" height="65"  fill="rgba(245,197,24,0.35)" rx="2"/>
  <!-- Spire on tallest -->
  <line x1="839" y1="110" x2="839" y2="90" stroke="rgba(245,197,24,0.7)" stroke-width="2"/>
  <polygon points="839,82 835,92 843,92" fill="rgba(245,197,24,0.8)"/>

  <!-- ── CHESS CITY ELEMENTARY ── -->
  <polygon
    data-loc="chess-city-elementary"
    class="wm-region"
    points="720,200 770,185 810,200 818,248 788,272 735,260 715,235"
    fill="rgba(245,197,24,0.14)"
    stroke="rgba(245,197,24,0.3)"
    stroke-width="1"
    stroke-dasharray="4 3"/>

  <!-- ── SHOGI ISLAND ── -->
  <polygon
    data-loc="shogi-island"
    class="wm-region"
    points="470,250 525,228 578,248 590,295 562,330 508,338 474,312 462,278"
    fill="rgba(50,140,70,0.52)"
    stroke="rgba(80,180,100,0.4)"
    stroke-width="1.5"/>

  <!-- Island trees (dots) -->
  <circle cx="500" cy="272" r="5" fill="rgba(60,160,80,0.5)"/>
  <circle cx="522" cy="262" r="4" fill="rgba(60,160,80,0.45)"/>
  <circle cx="544" cy="275" r="5" fill="rgba(60,160,80,0.5)"/>
  <circle cx="534" cy="298" r="4" fill="rgba(60,160,80,0.4)"/>
  <circle cx="508" cy="308" r="4" fill="rgba(60,160,80,0.45)"/>

  <!-- ── MYSTERY CITY (misty island) ── -->
  <ellipse cx="455" cy="138" rx="75" ry="48" fill="url(#fog)" class="wm-region-fog"/>
  <polygon
    data-loc="mystery-city"
    class="wm-region"
    points="400,155 428,125 462,112 498,128 510,160 488,182 448,188 412,175"
    fill="rgba(100,50,180,0.28)"
    stroke="rgba(150,80,255,0.3)"
    stroke-width="1"
    stroke-dasharray="5 3"/>

  <!-- Mystery fog layers -->
  <ellipse cx="455" cy="148" rx="65" ry="35" fill="rgba(120,60,200,0.12)"/>
  <ellipse cx="455" cy="145" rx="45" ry="22" fill="rgba(140,70,220,0.1)"/>

  <!-- ── JOURNEY ROUTE ── -->
  <!-- Dashed path from Checker Town → Sea → Chess City -->
  <path
    d="M 250 380 Q 280 340 320 300 Q 380 240 440 240 Q 510 235 560 245 Q 610 255 640 240 Q 660 230 670 200"
    fill="none"
    stroke="rgba(245,197,24,0.28)"
    stroke-width="2"
    stroke-dasharray="8 6"
    class="wm-route"/>

  <!-- Route arrow at Chess City end -->
  <polygon points="665,195 675,208 658,210" fill="rgba(245,197,24,0.45)"/>

  <!-- ── LOCATION LABELS ── -->
  <text x="148" y="370" text-anchor="middle" font-family="'Share Tech Mono',monospace" font-size="10" fill="rgba(255,200,100,0.75)" letter-spacing="1" pointer-events="none">CHECKER TOWN</text>
  <text x="330" y="375" text-anchor="middle" font-family="'Share Tech Mono',monospace" font-size="9"  fill="rgba(200,160,60,0.6)"  letter-spacing="1" pointer-events="none">SAND MINES</text>
  <text x="526" y="290" text-anchor="middle" font-family="'Share Tech Mono',monospace" font-size="9"  fill="rgba(100,220,120,0.7)" letter-spacing="1" pointer-events="none">SHOGI IS.</text>
  <text x="454" y="148" text-anchor="middle" font-family="'Share Tech Mono',monospace" font-size="9"  fill="rgba(180,120,255,0.55)" letter-spacing="1" pointer-events="none">? ? ?</text>
  <text x="825" y="210" text-anchor="middle" font-family="'Poppins',sans-serif"          font-size="14" font-weight="700" fill="rgba(245,197,24,0.85)" letter-spacing="1" pointer-events="none">CHESS CITY</text>
  <text x="760" y="240" text-anchor="middle" font-family="'Share Tech Mono',monospace" font-size="8"  fill="rgba(245,197,24,0.45)" letter-spacing="0.5" pointer-events="none">ELEMENTARY</text>

  <!-- ── COMPASS ── -->
  <g transform="translate(950,46)" opacity="0.35">
    <circle cx="0" cy="0" r="18" fill="none" stroke="rgba(245,197,24,0.4)" stroke-width="1"/>
    <text x="0" y="-22" text-anchor="middle" font-family="monospace" font-size="9" fill="rgba(245,197,24,0.7)">N</text>
    <line x1="0" y1="-14" x2="0" y2="14" stroke="rgba(245,197,24,0.4)" stroke-width="1"/>
    <line x1="-14" y1="0" x2="14" y2="0" stroke="rgba(245,197,24,0.3)" stroke-width="1"/>
    <polygon points="0,-14 -4,0 4,0" fill="rgba(245,197,24,0.6)"/>
  </g>

  <!-- ── MAP BORDER ── -->
  <rect width="1000" height="560" fill="none" stroke="rgba(245,197,24,0.1)" stroke-width="2"/>
</svg>
