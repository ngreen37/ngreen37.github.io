/* ============================================================
   Renders one hall's games into #games-hall[data-hall][data-base].
   Theme (mm2 vs default) is set by the page's wrapper class; this
   only fills in the cards. Reads window.PJCC_GAMES.
   ============================================================ */
(function () {
  var host = document.getElementById('games-hall');
  if (!host || !window.PJCC_GAMES) return;
  var hall = host.getAttribute('data-hall');
  var base = (host.getAttribute('data-base') || '/games/').replace(/\/$/, '');
  var grid = host.querySelector('.cat-games') || host;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]; }); }
  function url(slug) { return base + '/' + slug + '/'; }
  function unlocked() { try { return localStorage.getItem('pjcc.blindfold.unlocked') === '1'; } catch (e) { return false; } }
  function best(g) {
    if (!g.score) return 0;
    try { return (window.PJCC && PJCC.localBest) ? PJCC.localBest(g.score[0]) : (parseInt(localStorage.getItem('pjcc.best.' + g.score[0]), 10) || 0); } catch (e) { return 0; }
  }
  function isNew(d) { if (!d) return false; var t = Date.parse(d + 'T00:00:00'); return !isNaN(t) && (Date.now() - t) / 86400000 <= 21; }

  function render() {
    // data-hall="all" (the combined Games Hall, 2026-07-18 Nate: "combine the games…
    // get rid of the terminated section") = every game EXCEPT terminated / non-playable,
    // in one grid. A single hall key still filters to just that category's games.
    var list = window.PJCC_GAMES.filter(function (g) {
      return hall === 'all' ? (g.cat !== 'terminated' && g.playable !== false) : g.cat === hall;
    });
    grid.innerHTML = list.map(function (g) {
      var dead = g.playable === false;
      var locked = g.locked && !unlocked();
      var b = best(g);
      var chip = (b > 0 && g.score) ? '<span class="gcard-best">★ ' + b.toLocaleString() + ' ' + g.score[1] + '</span>' : '';
      var neu = isNew(g.neu) ? '<span class="gcard-new">NEW</span>' : '';
      var soon = g.soon ? '<span class="gcard-soon">SOON</span>' : '';
      // in the combined grid, in-development games wear a plain honest tag (no taxonomy,
      // just the truth per-tile) so nothing half-built reads as finished.
      var indev = (hall === 'all' && g.cat === 'dev') ? '<span class="gcard-dev">IN DEV</span>' : '';
      var dbadge = dead ? '<span class="gcard-dead">DELAYED</span>' : '';
      // quiet, honest mark: this game's chess content is re-proved in CI
      // (tests/validate-chess.js — perft-verified referee + a Stockfish second opinion).
      var eng = g.engine ? '<span class="gcard-engine" title="Every puzzle here is re-proved against a perft-verified referee — with Stockfish as a second opinion — in CI.">⚙ engine-verified</span>' : '';
      var icon = dead ? g.icon : (locked ? '🔒' : g.icon);
      // Short descriptions removed from hall cards (kept only as the unlock/delayed hint).
      var descHtml = dead ? '<p>Non-playable — ' + esc(g.cryptic) + '</p>'
        : (locked ? '<p>Locked — flawless Fast run in Notation Blitz</p>' : '');
      var inner = neu + soon + indev + dbadge + '<span class="gcard-icon">' + icon + '</span>' +
        '<span class="gcard-body"><h3>' + esc(g.name) + '</h3>' + descHtml + chip + eng + '</span>';
      if (dead) return '<div class="gcard dead" style="--accent:' + g.accent + '">' + inner + '</div>';
      return '<a class="gcard' + (locked ? ' locked' : '') + (g.soon ? ' soon' : '') + '" href="' + url(g.slug) +
        '" style="--accent:' + g.accent + '" data-slug="' + g.slug + '" data-name="' + esc(g.name) + '">' + inner + '</a>';
    }).join('');

    Array.prototype.forEach.call(grid.querySelectorAll('a.gcard'), function (card) {
      card.addEventListener('click', function () {
        try { localStorage.setItem('pjcc.lastGame', JSON.stringify({ href: card.getAttribute('href'), name: card.getAttribute('data-name'), slug: card.getAttribute('data-slug') })); } catch (e) {}
      });
    });
  }

  render();
  // refresh best chips once the profile/server bests load
  if (window.PJCC && PJCC.ready) PJCC.ready.then(function () { return PJCC.myStats ? PJCC.myStats() : []; })
    .then(render).catch(function () {});
})();
