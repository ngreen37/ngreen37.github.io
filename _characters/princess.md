---
layout: character
title: Princess
full_name: Princess Sophia McPuppy
role: Main Character
image: /assets/images/Princess_Color_v01.jpg
permalink: /characters/princess/
order: 1
piece: ♞
chapters: 0,1,2,3,4,5,6,7
dossier_clearance: DELTA
dossier_secret: "Arrived via same vessel as Subject Zero. Connection to crash: unconfirmed."
last_seen: CHECKER TOWN
---

Princess is the heart of the story -- a dog who can learn *anything*. Chess is simply the first thing she set out to master; the gift for charming everyone she meets runs a close second.

## Traits
- **Can learn anything** -- show her something once and she starts mastering it; chess was only the first thing
- A quick study at the board: natural instincts, sharper every game
- Loyal, obedient, and endlessly curious
- A people-dog: thrives on attention, affection, and treats
- Known to "nudge" anyone who dares stop petting her

## Background
At six years old, Princess is half Australian Cattle Dog, half Pit Bull. She lives with the main character in Checker Town and accompanies him on every adventure -- from the local bank (where she is, without question, the Star of the Show) to the long road toward Chess City.

## Role in the Story
Princess is the reason everything happens. The journey to Chess City begins because of her, and it is her loyalty and curiosity that keep the story moving forward even when the odds are stacked against the both of them. And she never stops growing -- every game, every lesson, every new skill carries her another square forward.

## Princess &amp; You

<p class="pp-intro">Princess isn't just a character — she's <em>your</em> companion. The more you play the games, the more chess she learns from you, and the more she remembers about your journey together. Take her for a walk each day.</p>

<div id="princess-panel"></div>
<script src="{{ '/assets/js/pjcc-config.js' | relative_url }}"></script>
<script src="{{ '/assets/js/pjcc-profile.js' | relative_url }}"></script>
<script src="{{ '/assets/js/pjcc-princess.js' | relative_url }}"></script>
<script>
  (function () {
    var el = document.getElementById('princess-panel');
    function go() { if (window.PJCCPrincess) PJCCPrincess.render(el); }
    if (window.PJCC && PJCC.ready && PJCC.ready.then) { PJCC.ready.then(go); }
    go();
  })();
</script>

<style>
  .pp-intro { color: #c9a7ff; max-width: 640px; }
  .pp-card { background: rgba(45,27,105,0.5); border: 1px solid #6b5fa0; border-radius: 14px; padding: 16px 18px; max-width: 640px; }
  .pp-greet { color: #F5C518; font-weight: 700; margin-bottom: 12px; }
  .pp-train-head { display: flex; justify-content: space-between; align-items: baseline; font-size: 0.85rem; }
  .pp-rank { color: #f0e6ff; font-weight: 800; font-size: 1rem; }
  .pp-xp { color: #9a7fd4; }
  .pp-bar { height: 9px; background: rgba(20,12,45,0.6); border: 1px solid #4a2f8a; border-radius: 999px; overflow: hidden; margin: 6px 0; }
  .pp-bar i { display: block; height: 100%; background: linear-gradient(90deg,#6b5fa0,#F5C518); }
  .pp-train-note { color: #9a7fd4; font-size: 0.82rem; }
  .pp-train-note b { color: #c9a7ff; }
  .pp-bond { display: flex; align-items: center; gap: 10px; margin: 14px 0; font-size: 0.85rem; color: #ff8fd0; }
  .pp-bond-bar { flex: 1; }
  .pp-bond-bar i { background: linear-gradient(90deg,#6b5fa0,#ff8fd0); }
  .pp-walks { color: #9a7fd4; white-space: nowrap; }
  .pp-walk { margin: 12px 0; }
  .pp-walk-btn { background: #F5C518; color: #1a0f3d; border: none; border-radius: 999px; padding: 10px 20px; font-weight: 800; font-family: inherit; cursor: pointer; }
  .pp-walk-btn:hover { background: #ffd740; }
  .pp-walk-hint { color: #7d6bb0; font-size: 0.8rem; margin-left: 10px; }
  .pp-story { color: #f0e6ff; background: rgba(20,12,45,0.5); border-left: 3px solid #F5C518; border-radius: 6px; padding: 10px 12px; font-size: 0.9rem; line-height: 1.5; }
  .pp-walk-done { color: #6bffb8; font-size: 0.82rem; margin-top: 8px; }
  .pp-fresh { background: rgba(107,255,184,0.1); border: 1px solid #2f6b50; border-radius: 8px; padding: 10px 12px; margin: 12px 0; color: #9bffd0; font-size: 0.88rem; line-height: 1.5; }
  .pp-mem { margin-top: 12px; }
  .pp-mem-head { color: #c9a7ff; font-weight: 700; margin-bottom: 6px; }
  .pp-mem ul { margin: 0; padding-left: 18px; color: #c9a7ff; font-size: 0.86rem; line-height: 1.7; }
  .pp-mem-empty { color: #9a7fd4; font-size: 0.85rem; }
</style>

## Art
![Princess Wireframe]({{ '/assets/images/Princess_Wireframe.jpg' | relative_url }})

<div class="rvr-section">
  <div class="rvr-eyebrow">— The Mirror Protocol —</div>
  <div class="rvr-title">Real vs. Rendered</div>
  <div class="img-compare" id="rvr-compare" style="height:300px;border-radius:8px;">
    <img src="{{ '/assets/images/Princess_Color_v01.jpg' | relative_url }}" alt="Princess rendered">
    <div class="img-compare-after" id="rvr-after" style="width:50%;">
      <img src="{{ '/assets/images/Princess-2.jpg' | relative_url }}" alt="The real Princess">
    </div>
    <div class="img-compare-handle" id="rvr-handle" style="left:50%;"></div>
    <span class="img-compare-label img-compare-label-left">Rendered</span>
    <span class="img-compare-label img-compare-label-right">Real</span>
  </div>
</div>

<script>
(function() {
  function initCompare(cId, aId, hId) {
    var c = document.getElementById(cId), a = document.getElementById(aId), h = document.getElementById(hId);
    if (!c) return;
    var drag = false;
    function setPos(x) {
      var r = c.getBoundingClientRect();
      var p = Math.max(2, Math.min(98, ((x - r.left) / r.width) * 100));
      a.style.width = p + '%'; h.style.left = p + '%';
    }
    h.addEventListener('mousedown', function(e) { drag = true; e.preventDefault(); });
    document.addEventListener('mouseup', function() { drag = false; });
    document.addEventListener('mousemove', function(e) { if (drag) setPos(e.clientX); });
    c.addEventListener('touchmove', function(e) { setPos(e.touches[0].clientX); e.preventDefault(); }, { passive: false });
  }
  initCompare('rvr-compare', 'rvr-after', 'rvr-handle');
})();
</script>
