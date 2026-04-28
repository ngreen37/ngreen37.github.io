---
layout: worldmap
title: The Known World
permalink: /world/
---

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 460" style="display:block;width:100%;">
  <defs>
    <pattern id="sea-wave" x="0" y="0" width="80" height="24" patternUnits="userSpaceOnUse">
      <path d="M0 12 Q20 6 40 12 Q60 18 80 12" fill="none" stroke="rgba(74,144,196,0.10)" stroke-width="1.2"/>
    </pattern>
    <pattern id="checker-pat" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
      <rect x="0" y="0" width="7" height="7" fill="rgba(184,115,51,0.10)"/>
      <rect x="7" y="7" width="7" height="7" fill="rgba(184,115,51,0.10)"/>
    </pattern>
    <pattern id="chess-grid" x="0" y="0" width="18" height="18" patternUnits="userSpaceOnUse">
      <rect x="0" y="0" width="9" height="9" fill="rgba(245,197,24,0.07)"/>
      <rect x="9" y="9" width="9" height="9" fill="rgba(245,197,24,0.07)"/>
    </pattern>
    <filter id="glow-gold" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="glow-blue" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Ocean background -->
  <rect width="900" height="460" fill="#030212"/>
  <rect width="900" height="460" fill="url(#sea-wave)"/>

  <!-- Faint grid lines -->
  <line x1="0" y1="153" x2="900" y2="153" stroke="rgba(255,255,255,0.025)" stroke-width="0.5"/>
  <line x1="0" y1="306" x2="900" y2="306" stroke="rgba(255,255,255,0.025)" stroke-width="0.5"/>
  <line x1="225" y1="0" x2="225" y2="460" stroke="rgba(255,255,255,0.025)" stroke-width="0.5"/>
  <line x1="450" y1="0" x2="450" y2="460" stroke="rgba(255,255,255,0.025)" stroke-width="0.5"/>
  <line x1="675" y1="0" x2="675" y2="460" stroke="rgba(255,255,255,0.025)" stroke-width="0.5"/>

  <!-- CHECKER TOWN MAINLAND -->
  <g class="wm-region" data-loc="checker-town">
    <polygon points="18,110 230,72 255,185 230,350 148,428 38,408 18,278"
             fill="#6b3d1a" fill-opacity="0.52"
             stroke="#b87333" stroke-width="1.8" stroke-opacity="0.65"/>
    <polygon points="18,110 230,72 255,185 230,350 148,428 38,408 18,278"
             fill="url(#checker-pat)"/>
    <circle cx="128" cy="240" r="5" fill="#b87333" fill-opacity="0.95"/>
    <circle cx="128" cy="240" r="11" fill="none" stroke="#b87333" stroke-width="0.9" stroke-opacity="0.45"/>
    <text x="128" y="262" fill="rgba(245,197,24,0.88)" font-family="Share Tech Mono,monospace" font-size="11" text-anchor="middle" letter-spacing="2.5">CHECKER TOWN</text>
    <text x="128" y="278" fill="rgba(184,115,51,0.5)" font-family="Share Tech Mono,monospace" font-size="7.5" text-anchor="middle" letter-spacing="1.5">ORIGIN POINT</text>
  </g>

  <!-- SAND MINES -->
  <g class="wm-region" data-loc="sand-mines">
    <ellipse cx="115" cy="400" rx="74" ry="30" fill="#3d2b0a" fill-opacity="0.72"
             stroke="#8b6914" stroke-width="1.2" stroke-opacity="0.55"/>
    <circle cx="115" cy="396" r="4" fill="#8b6914" fill-opacity="0.85"/>
    <text x="115" y="403" fill="rgba(184,115,51,0.65)" font-family="Share Tech Mono,monospace" font-size="8.5" text-anchor="middle" letter-spacing="2">SAND MINES</text>
    <text x="115" y="417" fill="rgba(184,115,51,0.3)" font-family="Share Tech Mono,monospace" font-size="7" text-anchor="middle" letter-spacing="1">SECTOR UNKNOWN</text>
  </g>

  <!-- THE SEA -->
  <g class="wm-region" data-loc="the-sea">
    <rect x="256" y="120" width="388" height="220" fill="rgba(74,144,196,0.03)" rx="4"/>
    <line x1="270" y1="190" x2="635" y2="198" stroke="rgba(74,144,196,0.18)" stroke-width="1.2" stroke-dasharray="10,7"/>
    <line x1="272" y1="215" x2="637" y2="220" stroke="rgba(74,144,196,0.12)" stroke-width="0.9" stroke-dasharray="14,9"/>
    <line x1="268" y1="240" x2="633" y2="244" stroke="rgba(74,144,196,0.10)" stroke-width="0.9" stroke-dasharray="7,12"/>
    <line x1="266" y1="265" x2="630" y2="268" stroke="rgba(74,144,196,0.07)" stroke-width="0.7" stroke-dasharray="5,14"/>
    <text x="450" y="228" fill="rgba(74,144,196,0.72)" font-family="Share Tech Mono,monospace" font-size="14" text-anchor="middle" letter-spacing="4" filter="url(#glow-blue)">T H E   S E A</text>
    <text x="450" y="249" fill="rgba(74,144,196,0.32)" font-family="Share Tech Mono,monospace" font-size="7.5" text-anchor="middle" letter-spacing="2">ADVISORY: CONDITIONS ROUGH</text>
  </g>

  <!-- SHOGI ISLAND -->
  <g class="wm-region" data-loc="shogi-island">
    <ellipse cx="438" cy="76" rx="80" ry="50" fill="#1e3b24" fill-opacity="0.68"
             stroke="#5a9e6a" stroke-width="1.4" stroke-opacity="0.6"/>
    <circle cx="438" cy="70" r="5" fill="#5a9e6a" fill-opacity="0.9"/>
    <circle cx="438" cy="70" r="11" fill="none" stroke="#5a9e6a" stroke-width="0.8" stroke-opacity="0.38"/>
    <text x="438" y="73" fill="rgba(90,158,106,0.88)" font-family="Share Tech Mono,monospace" font-size="9.5" text-anchor="middle" letter-spacing="2">SHOGI ISLAND</text>
    <text x="438" y="89" fill="rgba(90,158,106,0.38)" font-family="Share Tech Mono,monospace" font-size="7.5" text-anchor="middle" letter-spacing="1.5">FERRY: DELAYED</text>
  </g>

  <!-- CHESS CITY -->
  <g class="wm-region" data-loc="chess-city">
    <polygon points="672,44 882,64 900,210 868,388 724,428 658,310 645,158"
             fill="#1a1900" fill-opacity="0.60"
             stroke="#F5C518" stroke-width="2" stroke-opacity="0.72"/>
    <polygon points="672,44 882,64 900,210 868,388 724,428 658,310 645,158"
             fill="url(#chess-grid)"/>
    <text x="770" y="224" fill="rgba(245,197,24,0.75)" font-family="serif" font-size="26" text-anchor="middle" filter="url(#glow-gold)">&#9819;</text>
    <circle cx="770" cy="212" r="20" fill="none" stroke="rgba(245,197,24,0.20)" stroke-width="0.8"/>
    <text x="770" y="250" fill="rgba(245,197,24,0.90)" font-family="Share Tech Mono,monospace" font-size="11" text-anchor="middle" letter-spacing="2.5" filter="url(#glow-gold)">CHESS CITY</text>
    <text x="770" y="266" fill="rgba(245,197,24,0.38)" font-family="Share Tech Mono,monospace" font-size="7.5" text-anchor="middle" letter-spacing="1.5">ACCESS: RESTRICTED</text>
  </g>

  <!-- MYSTERY CITY fog layer (no pointer events) -->
  <g class="wm-region-fog">
    <ellipse cx="558" cy="368" rx="68" ry="44" fill="rgba(140,80,200,0.09)"
             stroke="rgba(140,80,200,0.20)" stroke-width="1" stroke-dasharray="4,5"/>
    <text x="558" y="363" fill="rgba(140,80,200,0.40)" font-family="Share Tech Mono,monospace" font-size="8.5" text-anchor="middle" letter-spacing="2.5">? ? ? ? ?</text>
    <text x="558" y="379" fill="rgba(140,80,200,0.24)" font-family="Share Tech Mono,monospace" font-size="7" text-anchor="middle" letter-spacing="1">UNCHARTED</text>
  </g>
  <!-- Transparent clickable overlay for mystery city -->
  <ellipse cx="558" cy="368" rx="68" ry="44" fill="rgba(0,0,0,0.01)"
           class="wm-region" data-loc="mystery-city" style="cursor:pointer;"/>

  <!-- ROUTE LINES -->
  <path d="M 185 248 Q 360 210 452 228 Q 570 252 660 240"
        fill="none" stroke="rgba(245,197,24,0.10)" stroke-width="1.4" stroke-dasharray="10,7"/>
  <path d="M 162 175 Q 290 112 388 88"
        fill="none" stroke="rgba(90,158,106,0.10)" stroke-width="1" stroke-dasharray="5,9"/>
  <path d="M 128 258 L 115 375"
        fill="none" stroke="rgba(184,115,51,0.10)" stroke-width="0.8" stroke-dasharray="3,6"/>

  <!-- COMPASS -->
  <g transform="translate(856,416)" opacity="0.20">
    <line x1="0" y1="-14" x2="0" y2="14" stroke="white" stroke-width="0.7"/>
    <line x1="-14" y1="0" x2="14" y2="0" stroke="white" stroke-width="0.7"/>
    <text x="0" y="-18" fill="white" font-family="Share Tech Mono,monospace" font-size="8" text-anchor="middle">N</text>
  </g>
  <text x="18" y="452" fill="rgba(255,255,255,0.09)" font-family="Share Tech Mono,monospace" font-size="7" letter-spacing="1.5">&#9672; PJCC WORLD MAP &#8212; OPERATIVE USE ONLY &#8212; DRAFT v0.1 &#8212; CARTOGRAPHY INCOMPLETE</text>
</svg>
