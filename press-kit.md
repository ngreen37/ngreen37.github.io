---
layout: page
title: Press Kit
permalink: /press-kit/
---

<div class="pk-intro selectable">
  <div class="pk-kicker">Electronic Press Kit · McPuppy Studios</div>
  <p class="pk-sub">Everything a writer, festival, partner, or curious human needs to cover <b>Princess and the Journey to Chess City</b> — an independent animated series being made in the open. Quote anything here freely. Assets are below.</p>
</div>

<!-- FAST FACTS -->
<h2 class="pk-h2">◈ Fast facts</h2>
<div class="pk-facts selectable">
  <div><span>Title</span><b>Princess and the Journey to Chess City</b> <small>(“PJCC”)</small></div>
  <div><span>Studio</span><b>McPuppy Studios</b> — independent, creator-owned</div>
  <div><span>Format</span>Animated series · in development</div>
  <div><span>Genre</span>Family adventure · chess · sci-fi-tinged fable</div>
  <div><span>Logline</span>A castaway pup who teaches herself chess must cross the sea to a city that may not want her.</div>
  <div><span>Status</span>Pre-pilot — <a href="{{ '/production/' | relative_url }}">made in the open</a> (animatic + tracker live)</div>
  <div><span>In dev since</span><span id="pk-since">March 1, 2026</span></div>
  <div><span>Premiere target</span>October 21, 2027 <span id="pk-countdown" class="pk-count"></span></div>
  <div><span>Press contact</span><a href="{{ '/contact/' | relative_url }}">via the contact page</a></div>
</div>

<!-- SYNOPSIS -->
<h2 class="pk-h2">◈ Synopsis</h2>
<div class="pk-prose selectable">
  <p><b>Princess and the Journey to Chess City</b> follows Princess — a loyal, chess-playing dog — and the young man who raises her, as they navigate life in <b>Checker Town</b>: a struggling community where checker pieces once fell from the sky. Princess teaches herself the game, and a board becomes a reason to leave home — to chase a better life in <b>Chess City</b>, across the sea.</p>
  <p>Beneath the warmth runs a mystery: the pieces didn't fall by accident. An interplanetary construction crew, bound for a tournament that was meant to happen here, crashed — and left Princess behind. The series is a story about home, change, and the long way to somewhere better, told one move at a time.</p>
</div>

<!-- BY THE NUMBERS (live) — doubles as the State of the Studio snapshot -->
<h2 class="pk-h2">◈ By the numbers <span class="pk-live">live</span></h2>
<p class="pk-note">A running snapshot of the project as it's built — this is also the studio's standing “state of the studio.”</p>
<div class="pk-stats">
  <div class="pk-stat"><span class="pk-stat-num" id="pk-days">—</span><span class="pk-stat-lbl">days in development</span></div>
  <div class="pk-stat"><span class="pk-stat-num">13</span><span class="pk-stat-lbl">playable games</span></div>
  <div class="pk-stat"><span class="pk-stat-num">{{ site.posts.size }}</span><span class="pk-stat-lbl">dev-log posts</span></div>
  <div class="pk-stat"><span class="pk-stat-num">{{ site.characters.size }}</span><span class="pk-stat-lbl">characters designed</span></div>
  <div class="pk-stat"><span class="pk-stat-num">{{ site.locations.size }}</span><span class="pk-stat-lbl">locations mapped</span></div>
  <div class="pk-stat"><span class="pk-stat-num" id="pk-togo">—</span><span class="pk-stat-lbl">days to premiere</span></div>
</div>

<!-- THE WORLD -->
<h2 class="pk-h2">◈ The world &amp; cast</h2>
<div class="pk-links">
  <a class="pk-link" href="{{ '/characters/' | relative_url }}"><b>Characters</b><small>Princess, Bill, Argus, the Rival &amp; more</small></a>
  <a class="pk-link" href="{{ '/locations/' | relative_url }}"><b>Locations</b><small>Checker Town to Chess City, place by place</small></a>
  <a class="pk-link" href="{{ '/lore-codex/' | relative_url }}"><b>Lore Codex</b><small>the canon, and the classified files</small></a>
  <a class="pk-link" href="{{ '/production/' | relative_url }}"><b>The Pilot</b><small>watch it get made — animatic + tracker</small></a>
  <a class="pk-link" href="{{ '/games/' | relative_url }}"><b>The Arcade</b><small>13 playable chess games in the world</small></a>
  <a class="pk-link" href="{{ '/sound/' | relative_url }}"><b>The Sound</b><small>character leitmotifs &amp; the score</small></a>
</div>

<!-- ASSETS -->
<h2 class="pk-h2">◈ Brand assets</h2>
<p class="pk-note">Logos for press use. Right-click → save, or click to open. More art (key frames, character turnarounds) ships as it's made — follow the <a href="{{ '/mailing-list/' | relative_url }}">dispatch</a> for drops.</p>
<div class="pk-assets">
  <a class="pk-asset" href="{{ '/assets/images/mcpuppy-logo-horizontal.svg' | relative_url }}" download>
    <img src="{{ '/assets/images/mcpuppy-logo-horizontal.svg' | relative_url }}" alt="McPuppy Studios horizontal logo">
    <span>Logo · horizontal (SVG)</span>
  </a>
  <a class="pk-asset" href="{{ '/assets/images/mcpuppy-logo-stacked.svg' | relative_url }}" download>
    <img src="{{ '/assets/images/mcpuppy-logo-stacked.svg' | relative_url }}" alt="McPuppy Studios stacked logo">
    <span>Logo · stacked (SVG)</span>
  </a>
  <a class="pk-asset" href="{{ '/assets/images/favicon.svg' | relative_url }}" download>
    <img src="{{ '/assets/images/favicon.svg' | relative_url }}" alt="McPuppy mark">
    <span>Mark · icon (SVG)</span>
  </a>
</div>

<!-- ABOUT THE STUDIO -->
<h2 class="pk-h2">◈ About the studio</h2>
<div class="pk-prose selectable">
  <p><b>McPuppy Studios</b> is an independent animation studio building Princess and the Journey to Chess City in public — shipping the story in playable, readable, and audible form long before the animation is done. The bet: prove the world and grow an audience while the pilot cooks, then arrive at episode one with the show effectively pre-sold.</p>
  <p>Press, festival, education, and partnership inquiries are welcome <a href="{{ '/contact/' | relative_url }}">through the contact page</a>. If you're backing the work, the <a href="{{ '/press-pass/' | relative_url }}">Chess City Press Pass</a> is how.</p>
</div>

<script>
(function () {
  var START = Date.UTC(2026, 2, 1, 4, 0, 0);          // Mar 1 2026 00:00 EDT
  var PREMIERE = Date.UTC(2027, 9, 21, 4, 0, 0);       // Oct 21 2027 00:00 EDT
  var now = Date.now();
  var days = Math.max(0, Math.floor((now - START) / 86400000));
  var togo = Math.max(0, Math.ceil((PREMIERE - now) / 86400000));
  var d = document.getElementById('pk-days'); if (d) d.textContent = days.toLocaleString();
  var t = document.getElementById('pk-togo'); if (t) t.textContent = togo.toLocaleString();
  var c = document.getElementById('pk-countdown'); if (c) c.textContent = '· ' + togo.toLocaleString() + ' days to go';
})();
</script>

<style>
.pk-intro { max-width: 740px; margin-bottom: 8px; }
.pk-kicker { font-size: 0.72rem; letter-spacing: 0.2em; text-transform: uppercase; color: #ff8fd0; }
.pk-sub { color: #c9a7ff; line-height: 1.6; }
.pk-h2 { color: #F5C518; margin: 26px 0 8px; display: flex; align-items: center; gap: 10px; }
.pk-live { font-size: 0.56rem; letter-spacing: 0.12em; text-transform: uppercase; color: #06210f; background: #6bffb8; padding: 3px 9px; border-radius: 999px; font-weight: 800; }
.pk-note { color: #9a7fd4; max-width: 720px; font-size: 0.9rem; line-height: 1.55; }
.pk-note a, .pk-facts a, .pk-prose a, .pk-link b { color: #F5C518; }

.pk-facts { display: grid; gap: 1px; background: #2a1f52; border: 1px solid #3a2a6a; border-radius: 12px; overflow: hidden; max-width: 760px; }
.pk-facts > div { display: flex; gap: 12px; background: rgba(26,16,48,0.6); padding: 9px 14px; font-size: 0.9rem; color: #f0e6ff; align-items: baseline; }
.pk-facts span:first-child { width: 116px; flex: 0 0 auto; color: #9a7fd4; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.06em; }
.pk-facts small { color: #8a78ba; }
.pk-count { color: #ff8fd0; }

.pk-prose { max-width: 720px; }
.pk-prose p { color: #cfc3ee; line-height: 1.7; margin-bottom: 10px; }
.pk-prose b { color: #f0e6ff; }

.pk-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; }
.pk-stat { background: linear-gradient(135deg,#1f1147,#2d1b69); border: 1px solid #3a2a6a; border-radius: 12px; padding: 14px; text-align: center; }
.pk-stat-num { display: block; font-size: 1.9rem; font-weight: 800; color: #F5C518; line-height: 1; font-family: 'Share Tech Mono', monospace; }
.pk-stat-lbl { display: block; margin-top: 6px; font-size: 0.72rem; color: #9a7fd4; text-transform: uppercase; letter-spacing: 0.04em; }

.pk-links { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px; }
.pk-link { display: block; background: rgba(45,27,105,0.5); border: 1px solid #3a2a6a; border-radius: 12px; padding: 12px 14px; text-decoration: none; transition: all 0.14s; }
.pk-link:hover { border-color: #F5C518; transform: translateY(-2px); }
.pk-link b { display: block; }
.pk-link small { color: #9a7fd4; font-size: 0.78rem; }

.pk-assets { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 10px; }
.pk-asset { display: flex; flex-direction: column; align-items: center; gap: 8px; background: #0f0c1a; border: 1px solid #3a2a6a; border-radius: 12px; padding: 16px; text-decoration: none; color: #c9a7ff; font-size: 0.78rem; transition: all 0.14s; }
.pk-asset:hover { border-color: #F5C518; }
.pk-asset img { height: 44px; width: auto; max-width: 100%; }
</style>
