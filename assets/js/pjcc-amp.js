/* ═══════════════════════════════════════════════════════════════════════════════════════
   THE P&JCC AMPERSAND, EVERYWHERE — 2026-08-10
   ---------------------------------------------------------------------------------------
   Nate: *"Make all instances on the site of P&JCC match that logo up top in terms of the
   size of the '&' symbol."*

   The header mark spells it `P<span class="mk-amp">&</span>JCC` by hand, and that is fine for
   ONE mark. The site says "P&JCC" **206 times across 75 files** — page titles, headings,
   eyebrows, prose, game shells, strings built inside JavaScript. Hand-wrapping those is 206
   chances to miss one and 206 places for the treatment to drift, which is the exact failure
   [[gauntlet-door-one-file]] exists to stop: **when a thing keeps drifting, the fix is one
   definition, not more diligence.** So the markup is made at RUNTIME, from one rule, and every
   future "P&JCC" anyone types gets it for free.

   ⚠ WHAT THIS CANNOT REACH, and it is not a bug — you cannot put a <span> in any of them:
     · `<title>` (16) — the browser tab draws that itself
     · <meta description>, JSON-LD, Open Graph — machines read those, not people
     · canvas `fillText` (Sky Run paints its banner into a bitmap)
     · mailto: bodies and PGN headers — plain text by definition
   Every one of those is a place where the ampersand has no size to match anyway.

   ⚠ textContent IS UNCHANGED. Wrapping a character in a span does not alter the string, so a
   copy-paste, the accessible name, the JP translator's lookups and every crawler still read
   exactly "P&JCC" — which [[site-two-brand-split]] requires, and which is why this is a
   PICTURE change and not a fifth spelling of the brand.

   ⚠ IT RUNS AGAIN WHEN THE DOM CHANGES, because most of this site's text arrives after load —
   the games hall, the Park Tables lobby, the dossier and every overlay build their markup in
   JavaScript. A one-shot pass at DOMContentLoaded would have covered the static pages and
   silently missed the rooms, which is the same shape as the bug where a feature shipped and
   nothing loaded it ([[feature-shipped-but-never-loaded]]). The observer only inspects nodes
   that were ADDED, and it is idempotent: the spans it makes contain "P", "&" and "JCC"
   separately, so nothing it writes can match its own pattern again.
   ═══════════════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var NEEDLE = 'P&JCC';
  /* Nothing inside these is prose: SCRIPT/STYLE are code, TEXTAREA/INPUT are values a user
     can edit (a span would be shredded on the next keystroke), CANVAS has no text nodes to
     find, and TITLE is the browser's own chrome. */
  var SKIP = /^(SCRIPT|STYLE|TEXTAREA|INPUT|CANVAS|TITLE|NOSCRIPT|OPTION|SVG)$/;
  var busy = false;

  function wrapIn(root) {
    if (!root || root.nodeType === 8) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (n.nodeValue.indexOf(NEEDLE) < 0) return NodeFilter.FILTER_REJECT;
        var p = n.parentNode;
        if (!p || SKIP.test(p.nodeName) || p.isContentEditable) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var hits = [], n;
    while ((n = walker.nextNode())) hits.push(n);      // collect first — the walk is live
    if (!hits.length) return;
    busy = true;
    for (var i = 0; i < hits.length; i++) {
      var node = hits[i], parts = node.nodeValue.split(NEEDLE);
      var frag = document.createDocumentFragment();
      for (var j = 0; j < parts.length; j++) {
        if (j) {
          frag.appendChild(document.createTextNode('P'));
          var amp = document.createElement('span');
          amp.className = 'mk-amp';
          amp.textContent = '&';
          frag.appendChild(amp);
          frag.appendChild(document.createTextNode('JCC'));
        }
        if (parts[j]) frag.appendChild(document.createTextNode(parts[j]));
      }
      if (node.parentNode) node.parentNode.replaceChild(frag, node);
    }
    busy = false;
  }

  function start() {
    wrapIn(document.body);
    if (!window.MutationObserver) return;
    var queue = [], timer = null;
    new MutationObserver(function (records) {
      if (busy) return;
      for (var i = 0; i < records.length; i++) {
        var added = records[i].addedNodes;
        for (var j = 0; j < added.length; j++) {
          if (added[j].nodeType === 1 || added[j].nodeType === 3) queue.push(added[j]);
        }
      }
      if (!queue.length || timer) return;
      /* debounced: a room that rebuilds its whole lobby fires hundreds of records in one
         tick, and this only ever needs to run once after the dust settles */
      timer = setTimeout(function () {
        timer = null;
        var batch = queue; queue = [];
        for (var k = 0; k < batch.length; k++) {
          if (batch[k].nodeType === 3) {
            if (batch[k].nodeValue.indexOf(NEEDLE) > -1 && batch[k].parentNode) wrapIn(batch[k].parentNode);
          } else { wrapIn(batch[k]); }
        }
      }, 120);
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
