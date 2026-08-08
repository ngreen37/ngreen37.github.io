/* ══════════════════════════════════════════════════════════════════════════════════
   THE CREATOR'S DESK LAMP — the twelve-hour check.

   ⚠ THIS CODE LIVES IN A FILE, AND THAT IS THE POINT (moved out of _includes/desk-lamp.html
   on 2026-08-04). It used to be an inline <script> inside the include, and an inline script
   inside an include that a `.md` page uses is a trap with TWO doors, both of which this site
   has now walked through:

     · wrapped in a SPAN — kramdown treats the contents as span-level markdown and
       HTML-escapes them, so `&&` ships as `&amp;&amp;`. Syntax error, nothing runs, and
       nothing LOOKS wrong because the lamp is drawn in CSS. It shipped that way for weeks.
     · wrapped in a DIV — kramdown passes raw HTML through, but a raw HTML block ENDS AT THE
       FIRST BLANK LINE. There was one blank line in the middle of this function. Everything
       below it was re-parsed as markdown, and because it was indented four spaces it became
       an indented CODE BLOCK: forty lines of raw JavaScript printed on the front door, in a
       black box, under the world card. `</div>` and `</section>` shipped as visible text.

   A `.js` file has no markdown around it, so neither door exists. It has NO Liquid in it and
   NO front matter, so Jekyll copies it through byte for byte — the build cannot rewrite it,
   and every local harness reads the same bytes the browser gets ([[town-sky-reaches-further]]).
   The one value it needs from the build, the last commit time, arrives as the `data-built`
   attribute the include stamps on the element.

   `tests/style.check.js` now fails the run if an inline multi-line script comes back into any
   include a `.md` page uses.
   ══════════════════════════════════════════════════════════════════════════════════ */
(function () {
  // Scoped by class, not by id, so a page can carry the lamp under any id — and so this
  // keeps working if a page ever shows more than one.
  var lamps = document.querySelectorAll('.studio-light');
  if (!lamps.length) return;
  var lit = false;
  Array.prototype.forEach.call(lamps, function (el) {
    var tip = el.querySelector('.sl-tip');
    if (!tip) return;
    var built = Date.parse(el.getAttribute('data-built') || '') || 0;
    var on = !!(built && (Date.now() - built) < 12 * 3600 * 1000);
    if (on) lit = true;
    el.classList.toggle('on', on);
    var status = on
      ? 'Creator is currently working or was during last 12 hours.'
      : 'No movement in last 12 hours — Creator has stepped away. All is well; the line stays open.';
    /* ⚑ THE SECOND LINE POINTS AT THE LAMP; IT IS NOT A LINK (2026-08-08, Nate: "it contains
       a link for the direct line but you can't click it before it goes away").
       He is describing a real false affordance, not a timing annoyance. `.sl-tip` is
       `pointer-events: none` — deliberately, because a tooltip that swallows the pointer
       flickers as you move onto it — so this line NEVER received a click, at any speed. It
       read "✉ The Direct Line →" in link gold with an arrow on it, which is three separate
       promises that it could be clicked, and the one thing it could not do was be clicked.
       The lamp itself is the <a> and always has been. So the line names the real target
       instead of impersonating one: no arrow (an arrow says "activate me"), and a verb that
       tells you where to put the pointer. Nothing about the hover behavior changed — the
       thing that was broken was the sentence. */
    tip.innerHTML = status + '<br><b>&#9993; Click the lamp for the Direct Line</b>';
    el.setAttribute('aria-label', status + ' Open the Direct Line.');

    // On phones there is no hover, so the status was unreachable without tapping straight
    // through to the Direct Line (Nate 2026-07-17). Deliver it on TAP instead: the first
    // tap opens the tip, a second follows the link.
    if (window.matchMedia && matchMedia('(hover: none)').matches) {
      el.addEventListener('click', function (e) {
        if (!el.classList.contains('tip-open')) { e.preventDefault(); el.classList.add('tip-open'); }
      });
      document.addEventListener('click', function (e) {
        if (!el.contains(e.target) && el.classList.contains('tip-open')) { el.classList.remove('tip-open'); el.blur(); }
      });
    }
  });
  // the page knows the lamp is burning — the splash warms its footer signature under it
  document.body.classList.toggle('lamp-lit', lit);
})();
