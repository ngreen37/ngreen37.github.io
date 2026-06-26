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
    var BOARDS = [
      { key: '__overall__',     label: 'Overall',          unit: 'credits' },
      { key: 'the-gauntlet',    label: 'The Gauntlet',     unit: 'cleared' },
      { key: 'dungeon',         label: 'Princess Dungeon', unit: 'floors'  },
      { key: 'clearance-delta', label: 'Clearance: DELTA', unit: 'score'   },
      { key: 'notation-run',    label: 'Notation Blitz',   unit: 'score'   },
      { key: 'notation-accuracy', label: 'Notation · Timing', unit: 'precision' },
      { key: 'notation-daily',  label: 'Notation · Daily',  unit: 'precision' },
      { key: 'fork-in-the-road',label: 'Fork in the Road', unit: 'solved'  },
      { key: 'sand-mine-depths',label: 'Sand Mine Depths', unit: 'depth'   },
      { key: 'pirc-protocol',   label: 'Pirc Protocol',    unit: 'score'   },
      { key: 'shogi-island',    label: 'Shogi Island',     unit: 'solved'  },
      { key: 'reading-room',    label: 'The Reading Room', unit: 'score'   },
      { key: 'blindfold',       label: 'Blindfold Puzzles',unit: 'solved'  },
      { key: 'tower-defense',   label: 'Siege on Chess City', unit: 'score' },
      { key: 'siege-endless',   label: 'Siege · Endless',     unit: 'wave'  },
      { key: 'siege-daily',     label: 'Siege · Daily',       unit: 'score' },
      { key: 'sky-run',         label: 'Sky Run',             unit: 'score' },
      { key: 'battle-room',     label: 'The Battle Room',     unit: 'score' }
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
      buildTabs(); render(); load();
    }

    async function fetchPage() {
      if (active === '__overall__') {
        var rows = await PJCC.cumulativeLeaderboard(PAGE, offset);
        return rows.map(function (r) {
          return { codename: r.codename, companion: r.companion, value: r.credits, rankName: PJCC.rankFor(r.credits).name };
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

    function render() {
      var board = boardFor(active);
      if (!accum.length) {
        var eg = (active !== '__overall__' && PJCC.ghostFor) ? PJCC.ghostFor(active) : null;
        var egb = (eg !== null && eg !== undefined) ? '<div class="lb-ghost">👻 <b>Beat the creator:</b> Nate\'s mark is <b>' + eg + ' ' + esc(board.unit) + '</b>.</div>' : '';
        bodyEl.innerHTML = egb + (loading
          ? '<p class="lb-empty">Loading…</p>'
          : '<p class="lb-empty">No scores logged yet — be the first.</p>');
        return;
      }
      var me = PJCC.getProfile();
      var ghost = (active !== '__overall__' && PJCC.ghostFor) ? PJCC.ghostFor(active) : null;
      var ghostBanner = (ghost !== null && ghost !== undefined)
        ? '<div class="lb-ghost">👻 <b>Beat the creator:</b> Nate\'s mark on ' + esc(board.label) + ' is <b>' + ghost + ' ' + esc(board.unit) + '</b>. Top it.</div>'
        : '';
      var head = ghostBanner + '<table class="lb-table"><thead><tr><th>#</th><th></th><th>Operative</th><th class="lb-score">' +
                 board.unit.toUpperCase() + '</th></tr></thead><tbody>';
      var body = accum.map(function (r, i) {
        var mine = me && r.codename === me.codename ? ' lb-me' : '';
        var titleLabel = PJCC.titleLabel ? PJCC.titleLabel({ companion: r.companion }) : '';
        return '<tr class="' + mine + '">' +
          '<td class="lb-rank ' + rankClass(i) + '">' + (i + 1) + '</td>' +
          '<td class="lb-av">' + av(r.companion) + '</td>' +
          '<td class="lb-name">' + esc(r.codename) + (titleLabel ? ' <span class="pjcc-title">' + esc(titleLabel) + '</span>' : '') + (r.rankName ? ' <span class="pjcc-sub">· ' + esc(r.rankName) + '</span>' : '') + '</td>' +
          '<td class="lb-score">' + r.value + '</td>' +
        '</tr>';
      }).join('');
      var footer = !done
        ? '<button class="lb-more" id="lb-more">Load more</button>'
        : (accum.length > PAGE ? '<p class="lb-end">— end of board —</p>' : '');
      bodyEl.innerHTML = head + body + '</tbody></table>' + footer;
      var btn = document.getElementById('lb-more');
      if (btn) btn.onclick = function () { load(); };
    }

    buildTabs();
    PJCC.ready.then(load);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
