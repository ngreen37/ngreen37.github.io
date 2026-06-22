/* ============================================================================
   PJCC · Princess — the site-wide companion (Avenue 6), MOVEMENT ONLY.
   She strolls across the bottom of the screen now and then and bobs in place.
   By design she **NEVER speaks** — per Nate (2026-06-22): "Princess should not
   talk under any circumstances." The old contextual-speech layer was removed;
   only her quiet, friendly wandering remains. Click bursts (sparkles) are handled
   visually by pjcc-flair.js, with no words.
   ========================================================================== */
(function () {
  "use strict";

  var walker = document.getElementById('princess-walker');
  if (!walker) return;

  var nextT = null;

  function walk() {
    walker.classList.remove('is-walking'); void walker.offsetWidth;   // restart the stroll
    walker.style.animationPlayState = '';
    walker.classList.add('is-walking');
  }

  walker.addEventListener('animationend', function (e) {
    if (e.animationName !== 'pawn-walk') return;   // ignore the infinite bob
    walker.classList.remove('is-walking');
    scheduleNext();
  });

  function scheduleNext() { clearTimeout(nextT); nextT = setTimeout(walk, (75 + Math.random() * 90) * 1000); }

  // first stroll shortly after load, then on a relaxed loop
  setTimeout(walk, 8000);
})();
