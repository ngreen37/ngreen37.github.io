---
layout: default
title: "▒▒▒▒▒ — sealed transmission"
permalink: /shogi-gate/
description: "Access withheld. The ferry does not run for those who do not know the way back."
---

<link rel="stylesheet" href="{{ '/assets/css/pjcc-portal.css' | relative_url }}">

<div class="sgate-wrap">

  <!-- ░░░░ SEALED ░░░░ -->
  <div id="sgate-sealed" class="sgate-sealed">
    <div class="sgate-eyebrow">◈ access withheld · coordinates redacted</div>
    <h1>The Ferry Does Not Run</h1>

    <div class="sgate-sigil-big">
      <span class="pjcc-sigil" aria-hidden="true"><i class="sg-a">A</i><i class="sg-c big">C</i><i class="sg-c big">C</i><i class="sg-c">c</i><i class="sg-c">c</i><i class="sg-c">c</i><i class="sg-c">c</i><i class="sg-c">c</i><i class="sg-c sm">c</i></span>
    </div>

    <p class="sgate-riddle">They carved it into the dock before the fog took the road:
    <b>one A and eight c's</b> — the <b>first two cut larger</b>, the <b>last cut small</b>.
    Speak it as it was meant — a bell on the a-file, then eight stones down the c:
    two struck large to open, six soft to follow — and the old ferry will remember the way back.</p>

    <div class="sgate-carve">
      <input id="sgate-input" type="text" maxlength="12" autocomplete="off" autocapitalize="off"
             autocorrect="off" spellcheck="false" placeholder="carve the rite" aria-label="carve the rite">
    </div>
    <div class="sgate-hint">Two capitals open the file; the rest fall soft, the last softest of all.</div>
  </div>

  <!-- ░░░░ UNSEALED ░░░░ -->
  <div id="sgate-open" class="sgate-open" hidden>
    <div class="sgate-torii">⛩️</div>
    <h1>The Gate of Shogi Island</h1>
    <div class="sgate-stamp">◈ rite answered · passage granted</div>

    <div class="sgate-lore">
      <p>The fog lifts off the water a hand's width at a time. The ferry was always
      here — moored, patient, low in the reeds — waiting not for a fare but for
      someone who could <b>say the rite back to it.</b></p>
      <p>The island keeps a dojo. A small, brave keeper named <b>Annie</b> runs it,
      and the pieces she teaches move the old way. The road from Checker Town
      forgot how to reach her years ago; the bell and the eight stones are the only
      thing that still does.</p>
      <p>You knew the way back before you knew you knew it. That is the only kind of
      traveller the ferry takes.</p>
    </div>

    <a class="sgate-cross" href="{{ '/games/shogi-island/' | relative_url }}">⛩ Cross to the Island ▸</a>
    <div class="sgate-frag" id="sgate-frag"></div>
  </div>

</div>

<script>
(function () {
  function init() {
    var sealed = document.getElementById('sgate-sealed');
    var openEl = document.getElementById('sgate-open');
    var input  = document.getElementById('sgate-input');
    function reveal() {
      if (sealed) sealed.hidden = true;
      if (openEl) openEl.hidden = false;
      try { document.title = 'The Gate of Shogi Island'; } catch (e) {}
      var f = document.getElementById('sgate-frag');
      if (f) f.textContent = '✦ fragment recovered · THE FERRY — the way back is remembered';
    }
    var opened = false;
    try { opened = window.PJCCGate && PJCCGate.isOpen(); } catch (e) {}
    if (opened) { reveal(); return; }

    if (input) {
      input.focus();
      input.addEventListener('input', function () {
        if (window.PJCCGate && PJCCGate.tryPhrase(input.value)) {
          reveal();                       // the cinematic plays over the top; this page is now open
        } else if (input.value.length >= 9) {
          input.classList.remove('wrong'); void input.offsetWidth; input.classList.add('wrong');
        }
      });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
</script>
