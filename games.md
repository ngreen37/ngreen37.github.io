---
layout: default
title: Games
permalink: /games/
---

<link rel="stylesheet" href="{{ '/assets/css/pjcc-games.css' | relative_url }}">
<link rel="stylesheet" href="{{ '/assets/css/pjcc-warp.css' | relative_url }}">

<style>
/* Light hall-select theme — a calm parchment panel under the portals (nothing flashy) */
.ghub { background:linear-gradient(165deg,#f5f2ea 0%,#ece7f4 100%); border:1px solid #d9d2e6;
  border-radius:20px; padding:30px 22px 34px; box-shadow:0 18px 50px rgba(20,12,45,0.35); }
.ghub-title { color:#1e1440; }
.ghub-trophy { filter:drop-shadow(0 2px 4px rgba(0,0,0,0.25)); }
@media (max-width:600px){ .ghub { padding:22px 14px 26px; border-radius:16px; } }
</style>

<!-- ===== THE HALLS — Gauntlet Legends portal screen (pick a hall; no games here) ===== -->
<div class="ghub">
  <a class="ghub-trophy" href="{{ '/leaderboards/' | relative_url }}" aria-label="Leaderboards & Hall of Fame" title="Leaderboards &amp; Hall of Fame">🏆</a>
  <div class="ghub-head">
    <h1 class="ghub-title">Choose Your Hall</h1>
  </div>

  <!-- the three active halls -->
  <div class="ghub-grid" id="ghub-grid"></div>

  <!-- sealed & retired — set apart, lower -->
  <div class="ghub-grid ghub-grid--sub" id="ghub-grid-sub"></div>
</div>

<script src="{{ '/assets/js/pjcc-games-data.js' | relative_url }}"></script>
<script>
(function () {
  var base = '{{ "/games/" | relative_url }}'.replace(/\/$/, '');
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function portal(key) {
    var c = PJCC_CATS[key];
    var n = PJCC_GAMES.filter(function (g) { return g.cat === key; }).length;
    return '<a class="ghub-portal" href="' + base + '/' + c.route + '/" style="--c:' + c.accent + '" data-warp>' +
      '<span class="ghp-enter">ENTER ▸</span>' +
      '<span class="ghp-glyph">' + c.glyph + '</span>' +
      '<span class="ghp-name">' + esc(c.name) + '</span>' +
      '<span class="ghp-blurb">' + esc(c.blurb) + '</span>' +
      '<span class="ghp-count">' + n + ' game' + (n === 1 ? '' : 's') + '</span></a>';
  }
  document.getElementById('ghub-grid').innerHTML = ['learn', 'arcade', 'dev'].map(portal).join('');
  document.getElementById('ghub-grid-sub').innerHTML = ['vault', 'terminated'].map(portal).join('');
})();
</script>

<!-- Enter a hall → the screen blooms to that hall's colour, like the splash quads. -->
<script src="{{ '/assets/js/pjcc-warp.js' | relative_url }}"></script>
