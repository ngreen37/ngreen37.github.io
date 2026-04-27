---
layout: character
title: Princess
full_name: Princess Sophia McPuppy
role: Main Character
image: /assets/images/Princess_Color_v01.jpg
permalink: /characters/princess/
---

Princess is the heart of the story -- a dog with an extraordinary gift for chess and an even bigger gift for charming everyone she meets.

## Traits
- Beginner chess player with natural instincts
- Loyal, obedient, and endlessly curious
- A people-dog: thrives on attention, affection, and treats
- Known to "nudge" anyone who dares stop petting her

## Background
Princess is half Australian Cattle Dog, half Pit Bull. She lives with the main character in Checker Town and accompanies him on every adventure -- from the local bank (where she is, without question, the Star of the Show) to the long road toward Chess City.

## Role in the Story
Princess is the reason everything happens. The journey to Chess City begins because of her, and it is her loyalty and curiosity that keep the story moving forward even when the odds are stacked against the both of them.

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
