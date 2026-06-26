---
layout: default
title: Games
permalink: /games/
---

<link rel="stylesheet" href="{{ '/assets/css/pjcc-games.css' | relative_url }}">

<!-- ===== THE HALLS — Gauntlet Legends portal screen (pick a hall; no games here) ===== -->
<div class="ghub">
  <a class="ghub-trophy" href="{{ '/leaderboards/' | relative_url }}" aria-label="Leaderboards & Hall of Fame" title="Leaderboards &amp; Hall of Fame">🏆</a>
  <div class="ghub-head">
    <p class="ghub-eyebrow">PJCC Arcade</p>
    <h1 class="ghub-title">Choose Your Hall</h1>
    <p class="ghub-sub">Five halls. Step through a gate to play.</p>
  </div>
  <div class="ghub-grid" id="ghub-grid"></div>
</div>

<script src="{{ '/assets/js/pjcc-games-data.js' | relative_url }}"></script>
<script>
(function () {
  var grid = document.getElementById('ghub-grid');
  var base = '{{ "/games/" | relative_url }}'.replace(/\/$/, '');
  var order = ['learn', 'arcade', 'dev', 'vault', 'terminated'];
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  grid.innerHTML = order.map(function (key) {
    var c = PJCC_CATS[key];
    var n = PJCC_GAMES.filter(function (g) { return g.cat === key; }).length;
    return '<a class="ghub-portal" href="' + base + '/' + c.route + '/" style="--c:' + c.accent + '">' +
      '<span class="ghp-enter">ENTER ▸</span>' +
      '<span class="ghp-glyph">' + c.glyph + '</span>' +
      '<span class="ghp-name">' + esc(c.name) + '</span>' +
      '<span class="ghp-blurb">' + esc(c.blurb) + '</span>' +
      '<span class="ghp-count">' + n + ' game' + (n === 1 ? '' : 's') + '</span></a>';
  }).join('');
})();
</script>
