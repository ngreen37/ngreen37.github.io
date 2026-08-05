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
      // `noHall` games are reachable elsewhere (e.g. Fork in the Road = the drawer's
      // Puzzles link) and are hidden from the combined grid; a single-category hall still
      // shows everything in that category.
      return hall === 'all' ? (g.cat !== 'terminated' && g.playable !== false && !g.noHall) : g.cat === hall;
    });
    /* ⚑ THE HALF-BUILT GAMES LEAVE THE GRID (2026-08-05, Nate: "put the Building games into
       one 'on the workbench' row please").

       ⭐ THE PROBLEM WAS THE PHONE, AND IT WAS ALWAYS A COUNTING PROBLEM. Five of the eleven
       tiles were `cat:'dev'`, each wearing a caution-tape watermark that spans the whole card.
       On a desktop grid they are five tiles among eleven; in ONE COLUMN they are five
       consecutive full-width construction signs, and the arcade reads as a building site. The
       2026-07-28 pass sorted them to the BOTTOM, which is the right instinct and only half the
       fix — the bottom of a phone page is still five screens of hazard tape.

       So they stop being tiles. The grid is now the things that are FINISHED, and everything
       half-built is one quiet strip underneath with a name on it. Nothing is hidden and
       nothing is dropped: all five are still linked, still playable, and the honest label is
       now said ONCE, in a heading, instead of stamped five times.
       ⚠ The words come from the registry (`PJCC_CATS.dev`) rather than being written here —
       that object has said "On the Workbench / Half-built and humming" since the category
       portals existed, and this is the first thing to use it since they were removed. */
    var bench = [];
    if (hall === 'all') {
      bench = list.filter(function (g) { return g.cat === 'dev'; });
      list  = list.filter(function (g) { return g.cat !== 'dev'; });
      // still last in the grid: the locked vault game, which is a thing that WORKS but is shut
      var rank = function (g) { return (g.locked && !unlocked()) ? 1 : 0; };
      list = list.map(function (g, i) { return { g: g, i: i }; })
                 .sort(function (a, b) { return rank(a.g) - rank(b.g) || a.i - b.i; })
                 .map(function (x) { return x.g; });
    }
    grid.innerHTML = list.map(function (g) {
      var dead = g.playable === false;
      var locked = g.locked && !unlocked();
      var b = best(g);
      var chip = (b > 0 && g.score) ? '<span class="gcard-best">★ ' + b.toLocaleString() + ' ' + g.score[1] + '</span>' : '';
      var neu = isNew(g.neu) ? '<span class="gcard-new">NEW</span>' : '';
      var soon = g.soon ? '<span class="gcard-soon">SOON</span>' : '';
      // ⚑ the per-tile BUILDING watermark is gone from the combined hall (2026-08-05) — the
      // half-built games are a row of their own now and say it once. A SINGLE-CATEGORY hall
      // (/games/in-dev/) still shows them as tiles, and there the tag would be redundant with
      // the page's own name, so nothing anywhere stamps a card any more.
      var dbadge = dead ? '<span class="gcard-dead">DELAYED</span>' : '';
      // quiet, honest mark: this game's chess content is re-proved in CI
      // (tests/validate-chess.js — perft-verified referee + a Stockfish second opinion).
      var eng = g.engine ? '<span class="gcard-engine" title="Every puzzle here is re-proved against a perft-verified referee — with Stockfish as a second opinion — in CI.">⚙ engine-verified</span>' : '';
      var icon = dead ? g.icon : (locked ? '🔒' : g.icon);
      // Short descriptions were removed from the halls as a declutter — but each WORKING
      // (playable, shipped, non-dev) game gets its cryptic line back as a flavor tag, so
      // the combined grid reads as a set of distinct little worlds instead of a uniform
      // list (2026-07-24 Nate: "unique, fun box designs … different text, different feels,
      // for each"). The bespoke per-slug looks live in games.md's page-local <style>; the
      // in-dev tiles keep the caution-tape watermark, locked/dead keep their hint.
      var descHtml = dead ? '<p>Non-playable — ' + esc(g.cryptic) + '</p>'
        : (locked ? '<p>Locked — flawless Fast run in Notation Blitz to unlock</p>' : '');
      var tag = (!dead && !locked && !g.soon && g.cat !== 'dev' && g.cryptic)
        ? '<p class="gcard-tag">' + esc(g.cryptic) + '</p>' : '';
      var inner = neu + soon + dbadge + '<span class="gcard-icon">' + icon + '</span>' +
        '<span class="gcard-body"><h3>' + esc(g.name) + '</h3>' + descHtml + tag + chip + eng + '</span>';
      if (dead) return '<div class="gcard dead" style="--accent:' + g.accent + '">' + inner + '</div>';
      return '<a class="gcard' + (locked ? ' locked' : '') + (g.soon ? ' soon' : '') + '" href="' + url(g.slug) +
        '" style="--accent:' + g.accent + '" data-slug="' + g.slug + '" data-name="' + esc(g.name) + '">' + inner + '</a>';
    }).join('');

    /* THE WORKBENCH ROW. One heading, one line of honest copy, and a chip per game — no
       card, no watermark, no per-tile repetition. The node is created once and refilled,
       because render() runs a second time when the profile's best scores arrive. */
    var benchHost = host.querySelector('.hall-workbench');
    if (bench.length) {
      if (!benchHost) {
        benchHost = document.createElement('section');
        benchHost.className = 'hall-workbench';
        host.appendChild(benchHost);
      }
      var cat = (window.PJCC_CATS && window.PJCC_CATS.dev) || {};
      benchHost.innerHTML =
        '<h2 class="wb-h"><span class="wb-glyph" aria-hidden="true">' + (cat.glyph || '🛠') + '</span> ' +
          esc(cat.tag || 'On the Workbench') + '</h2>' +
        '<p class="wb-sub">' + esc(cat.blurb || '') + '</p>' +
        '<div class="wb-row">' + bench.map(function (g) {
          return '<a class="wb-chip" href="' + url(g.slug) + '" style="--accent:' + g.accent + '"' +
            ' data-slug="' + g.slug + '" data-name="' + esc(g.name) + '">' +
            '<span class="wb-ico" aria-hidden="true">' + g.icon + '</span>' +
            '<span class="wb-name">' + esc(g.name) + '</span></a>';
        }).join('') + '</div>';
    } else if (benchHost) {
      benchHost.remove();
    }

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
