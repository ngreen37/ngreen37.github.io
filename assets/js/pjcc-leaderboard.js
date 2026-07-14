/*! pjcc-leaderboard.js — renders operative standings into #lb-tabs / #lb-body.
 *  Shared by /leaderboards/ and the embedded board on /games/. No-op if those
 *  nodes aren't present, and it waits for window.PJCC (the profile lib). */
(function () {
  'use strict';

  function init() {
    var tabsEl = document.getElementById('lb-tabs');
    var bodyEl = document.getElementById('lb-body');
    if (!tabsEl || !bodyEl) return;               // not a page with the board
    if (!window.PJCC) { setTimeout(init, 60); return; }

    // key '__overall__' = cumulative credits board; others = per-game best scores.
    // Boards exist only for LIVE games — nothing In Development or Terminated shows
    // a leaderboard (dungeon / fork-in-the-road / pirc-protocol / battle-room pruned
    // 2026-07-06; their Supabase data persists, restore = re-add a line).
    //
    // A board with a `split` is ONE TAB that opens TWO boards side by side (2026-07-12,
    // Nate: "combine the two Siege buttons into one. When you click on it, it splits into
    // two leaderboards, one for each"). Siege is a single game with two modes scored in
    // different units — score and wave — so they can't be one table, but they were never
    // two games either, and they don't deserve two chips in the row.
    var BOARDS = [
      { key: '__overall__',     label: 'Overall',          unit: 'credits' },
      // __rating__ = the PJCC Rating ladder from the Park Tables (profiles.pjcc_rating,
      // Elo, everyone starts 250). Only operatives with a finished rated game appear.
      { key: '__rating__',      label: 'PJCC Rating',      unit: 'rating'  },
      { key: 'the-gauntlet',    label: 'The Gauntlet',     unit: 'cleared' },
      // restored 2026-07-14 with Fork's promotion to the main puzzle feature
      { key: 'fork-in-the-road', label: 'Fork in the Road', unit: 'solved' },
      { key: 'clearance-delta', label: 'Clearance: DELTA', unit: 'score'   },
      { key: 'notation-run',    label: 'Notation Blitz',   unit: 'score'   },
      { key: 'sand-mine-depths',label: 'Sand Mine Depths', unit: 'points'  },
      { key: 'siege',           label: 'Siege on Chess City', split: [
        { key: 'tower-defense', label: 'Campaign', unit: 'score' },
        { key: 'siege-endless', label: 'Endless',  unit: 'wave'  }
      ] },
      { key: 'sky-run',         label: 'Sky Run',             unit: 'score' }
    ];
    var PAGE = 25;
    var active = '__overall__';
    var accum = [], offset = 0, done = false, loading = false, token = 0;

    function esc(s) {
      return String(s).replace(/[&<>"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
      });
    }
    function rankClass(i) { return i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''; }
    function av(companion) { return PJCC.avatarEmoji({ companion: companion }); }
    function boardFor(key) { return BOARDS.filter(function (b) { return b.key === key; })[0]; }

    function buildTabs() {
      tabsEl.innerHTML = '';
      BOARDS.forEach(function (b) {
        var t = document.createElement('button');
        t.className = 'lb-tab' + (b.key === active ? ' active' : '');
        t.textContent = b.label;
        t.onclick = function () { switchTo(b.key); };
        tabsEl.appendChild(t);
      });
    }

    function switchTo(key) {
      token++;                       // invalidate any in-flight fetch
      active = key; accum = []; offset = 0; done = false; loading = false;
      buildTabs();
      var board = boardFor(key);
      if (board && board.split) { bodyEl.innerHTML = '<p class="lb-empty">Loading…</p>'; loadSplit(board); return; }
      render(); load();
    }

    async function fetchPage() {
      if (active === '__overall__') {
        var rows = await PJCC.cumulativeLeaderboard(PAGE, offset);
        return rows.map(function (r) {
          return { codename: r.codename, companion: r.companion, value: r.credits, rankName: PJCC.rankFor(r.credits).name };
        });
      }
      if (active === '__rating__') {
        var d = PJCC.db ? PJCC.db() : null;
        if (!d) return [];
        var pr = await d.from('profiles').select('codename,companion,pjcc_rating,rated_games')
          .gt('rated_games', 0)
          .order('pjcc_rating', { ascending: false }).order('codename', { ascending: true })
          .range(offset, offset + PAGE - 1);
        if (pr.error || !pr.data) return [];    // pre-upgrade server → empty board, not a crash
        return pr.data.map(function (p) {
          return { codename: p.codename, companion: p.companion, value: p.pjcc_rating,
                   rankName: p.rated_games + ' rated game' + (p.rated_games === 1 ? '' : 's') };
        });
      }
      var grows = await PJCC.gameLeaderboard(active, PAGE, offset);
      return grows.map(function (r) {
        return { codename: r.codename, companion: r.companion, value: r.score, rankName: null };
      });
    }

    async function load() {
      if (!PJCC.enabled) { bodyEl.innerHTML = '<p class="lb-empty">Leaderboards are offline.</p>'; return; }
      if (loading || done) return;
      loading = true;
      var my = token;
      var moreBtn = document.getElementById('lb-more');
      if (moreBtn) { moreBtn.textContent = 'Loading…'; moreBtn.disabled = true; }
      var rows = await fetchPage();
      if (my !== token) return;      // user switched tabs mid-flight; drop result
      accum = accum.concat(rows);
      offset += rows.length;
      if (rows.length < PAGE) done = true;
      loading = false;
      render();
    }

    // A SPLIT board fetches both of its sides at once and lays them out together. There's
    // no "load more" here: two boards, top 25 each. Anyone deep enough in Siege to need
    // page 2 of a board is not the person we're designing this tab for.
    async function loadSplit(board) {
      if (!PJCC.enabled) { bodyEl.innerHTML = '<p class="lb-empty">Leaderboards are offline.</p>'; return; }
      var my = token;
      var sides = await Promise.all(board.split.map(function (sub) {
        return PJCC.gameLeaderboard(sub.key, PAGE, 0).then(function (rows) {
          return rows.map(function (r) {
            return { codename: r.codename, companion: r.companion, value: r.score, rankName: null };
          });
        }, function () { return []; });      // one side failing must not blank the other
      }));
      if (my !== token) return;              // switched tabs mid-flight
      bodyEl.innerHTML = '<div class="lb-split">' + board.split.map(function (sub, i) {
        return '<section class="lb-split-col">' +
          '<h3 class="lb-split-h"><span class="lb-split-dot"></span>' + esc(sub.label) + '</h3>' +
          tableFor(sub, sides[i]) +
        '</section>';
      }).join('') + '</div>';
    }

    // The ghost line + the table itself — shared by the single boards and both halves of
    // a split one, so they can never drift apart.
    function tableFor(board, rows) {
      var ghost = (board.key !== '__overall__' && PJCC.ghostFor) ? PJCC.ghostFor(board.key) : null;
      var ghostBanner = (ghost !== null && ghost !== undefined)
        ? '<div class="lb-ghost">👻 <b>Beat the creator:</b> Nate\'s mark on ' + esc(board.label) + ' is <b>' + ghost + ' ' + esc(board.unit) + '</b>. Top it.</div>'
        : '';
      if (!rows.length) return ghostBanner + '<p class="lb-empty">No scores logged yet — be the first.</p>';
      var me = PJCC.getProfile();
      var head = '<table class="lb-table"><thead><tr><th>#</th><th></th><th>Operative</th><th class="lb-score">' +
                 board.unit.toUpperCase() + '</th></tr></thead><tbody>';
      var body = rows.map(function (r, i) {
        var mine = me && r.codename === me.codename ? ' lb-me' : '';
        var titleLabel = PJCC.titleLabel ? PJCC.titleLabel({ companion: r.companion }) : '';
        return '<tr class="' + mine + '">' +
          '<td class="lb-rank ' + rankClass(i) + '">' + (i + 1) + '</td>' +
          '<td class="lb-av">' + av(r.companion) + '</td>' +
          '<td class="lb-name">' + esc(r.codename) + (titleLabel ? ' <span class="pjcc-title">' + esc(titleLabel) + '</span>' : '') + (r.rankName ? ' <span class="pjcc-sub">· ' + esc(r.rankName) + '</span>' : '') + '</td>' +
          '<td class="lb-score">' + r.value + '</td>' +
        '</tr>';
      }).join('');
      return ghostBanner + head + body + '</tbody></table>';
    }

    function render() {
      var board = boardFor(active);
      if (!accum.length && loading) { bodyEl.innerHTML = '<p class="lb-empty">Loading…</p>'; return; }
      var footer = !done
        ? '<button class="lb-more" id="lb-more">Load more</button>'
        : (accum.length > PAGE ? '<p class="lb-end">— end of board —</p>' : '');
      bodyEl.innerHTML = tableFor(board, accum) + (accum.length ? footer : '');
      var btn = document.getElementById('lb-more');
      if (btn) btn.onclick = function () { load(); };
    }

    buildTabs();
    PJCC.ready.then(load);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
