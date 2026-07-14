---
layout: location
title: Chess City
location_type: City
permalink: /locations/chess-city/
---

<div class="cc-gate" id="cc-gate">
  <div class="cc-gate-label">ENTRY CHECKPOINT — CHESS CITY BORDER AUTHORITY</div>
  <div class="cc-gate-status">
    <span class="cc-gate-icon" id="cc-gate-icon">⊘</span>
    <div>
      <div class="cc-gate-msg" id="cc-gate-msg">ENTRY REQUIRES WINNING A CHESS TOURNAMENT</div>
      <div class="cc-gate-sub" id="cc-gate-sub">No exceptions. No permits. No shortcuts.</div>
    </div>
  </div>
  <div class="cc-gate-action" id="cc-gate-action">
    <a class="cc-gate-btn cc-gate-link" href="{{ '/games/the-gauntlet/' | relative_url }}">▶ WIN THE GAUNTLET TO ENTER</a>
  </div>
  <div class="cc-gate-graffiti" id="cc-gate-graffiti" hidden>&ldquo;&hellip;or bribery.&rdquo; <span>— scratched into the booth wall</span></div>
</div>

The destination. Chess City is well-to-do, prosperous, and deliberately difficult to reach. You cannot simply move there -- you have to earn your way in.

## Notable Features
- Located across the sea from Checker Town
- Entry requires winning chess tournaments; there is no other way in (without money)
- Visitors and workers must pass through security checkpoints and be Tagged with a symbol upon each visit
- Family and friends of Checker Town residents often live here, creating a painful separation for those left behind

## Who Lives Here
The Rival's entire family lives in Chess City. This is the central wound of his character -- and the engine behind everything he does. Nate works here for a time, and his Uncle lives there, as well. 

## Role in the Story
Chess City is the prize, the promise, and the obstacle. It represents a better life -- but one that has to be fought for, and one that comes with its own costs once you arrive.

## The Whisper
Not everyone believes Chess City is paradise. There is a belief among some -- the wary, the burned, the pessimists -- that the city is no prize at all, but a place **inhabited by evil chess pieces**: pieces with mouths and eyes, watching from behind the gates, smiling the way a trap smiles. Most dismiss it as the talk of people who never made it across the sea. One person does not. *(See [Jerry Murphy](/characters/murphy/), and [the game that bears his name](/games/murphys-law/).)*

## Art
*Map or illustration coming soon.*

<script>
// Chess City is gated: the page only opens once you've WON THE GAUNTLET
// (beaten the CEO at the top of the tower). Until then, the checkpoint holds
// the line and everything below it stays sealed. Winning stamps your permit.
(function () {
  var won = false;
  try { var g = JSON.parse(localStorage.getItem('pjcc.gauntlet.v2') || '{}'); won = !!(g && g.secret); } catch (e) {}
  var details = document.querySelector('.location-details');
  if (won) {
    var gate = document.getElementById('cc-gate');
    var icon = document.getElementById('cc-gate-icon');
    var msg  = document.getElementById('cc-gate-msg');
    var sub  = document.getElementById('cc-gate-sub');
    var act  = document.getElementById('cc-gate-action');
    if (gate) gate.classList.add('cc-granted');
    if (icon) icon.textContent = '✔';
    if (msg)  msg.textContent = 'ACCESS GRANTED — WELCOME TO CHESS CITY';
    if (sub)  sub.textContent = 'Tournament victory verified. Your permit is stamped.';
    if (act)  act.innerHTML = '<span class="cc-gate-btn cc-gate-granted">✔ ACCESS GRANTED</span>';
    try { localStorage.setItem('chess_city_entry', '1'); } catch (e) {}
  } else if (details) {
    // No tournament win yet — seal the city; only the checkpoint remains.
    Array.prototype.forEach.call(details.children, function (el) {
      if (el.id !== 'cc-gate' && el.tagName !== 'SCRIPT') el.style.display = 'none';
    });
    // The checkpoint keeps count. Lose the Gauntlet three times and somebody
    // before you has already scratched the loophole into the wall.
    try {
      if ((g.losses || 0) >= 3) {
        var gr = document.getElementById('cc-gate-graffiti');
        if (gr) gr.hidden = false;
      }
    } catch (e2) {}
  }
})();
</script>

<style>
/* the loophole, scratched in by somebody who lost one time too many */
.cc-gate-graffiti { margin-top: 10px; font-style: italic; font-size: 0.8rem; letter-spacing: 0.04em;
  color: rgba(245,197,24,0.42); transform: rotate(-1.4deg); }
.cc-gate-graffiti span { font-style: normal; font-size: 0.72rem; color: rgba(157,127,212,0.45); }

/* The footer's piece-band is hidden site-wide (2026-07-14 declutter) but LIVES ON
   here: at the gates of Chess City a border of pieces is the skyline, not clutter —
   and the Whisper below needs it. */
.footer-ribbon-wrap { display: flex; }

/* The Whisper, made small: on this page only, the white rook in the border is awake. */
.ribbon-track .rt-alive { position: relative; display: inline-block; }
.rt-alive .rt-eye { position: absolute; width: 0.09em; height: 0.09em; border-radius: 50%;
  background: rgba(255,255,255,0.28); top: 0.56em; animation: rt-blink 6.4s infinite; }
.rt-alive .rt-eye--l { left: 0.25em; }
.rt-alive .rt-eye--r { left: 0.45em; }
.rt-alive .rt-mouth { position: absolute; left: 0.26em; top: 0.69em; width: 0.24em; height: 0.10em;
  border-bottom: 2px solid rgba(255,255,255,0.20); border-radius: 0 0 0.2em 0.2em; }
@keyframes rt-blink { 0%, 91%, 100% { transform: scaleY(1); } 94% { transform: scaleY(0.08); } }
</style>

<script>
// One of them is looking back. (No label. No explanation. See: The Whisper.)
document.addEventListener('DOMContentLoaded', function () {
  var track = document.querySelector('.ribbon-track');
  if (!track || track.querySelector('.rt-alive')) return;
  track.innerHTML = track.innerHTML.replace(/♖/g,
    '<span class="rt-alive">♖<span class="rt-eye rt-eye--l"></span><span class="rt-eye rt-eye--r"></span><span class="rt-mouth"></span></span>');
});
</script>
