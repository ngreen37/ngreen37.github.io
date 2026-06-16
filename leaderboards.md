---
layout: page
title: Leaderboards
permalink: /leaderboards/
---

<link rel="stylesheet" href="{{ '/assets/css/pjcc-profile.css' | relative_url }}">

<p class="lb-intro">Operative standings across the McPuppy Studios games. <strong>Overall</strong> ranks every operative by total credits earned everywhere; each game tab shows the best runs in that game. Sign in on any game page to claim your spot.</p>

<div class="lb-tabs" id="lb-tabs"></div>
<div id="lb-body"><p class="lb-empty">Loading…</p></div>

<script src="{{ '/assets/js/pjcc-config.js' | relative_url }}"></script>
<script src="{{ '/assets/js/pjcc-profile.js' | relative_url }}"></script>
<script>
(function () {
  // key '__overall__' = cumulative credits board; others = per-game best scores.
  var BOARDS = [
    { key: '__overall__',     label: 'Overall',          unit: 'credits' },
    { key: 'cipher',          label: 'CIPHER',           unit: 'streak'  },
    { key: 'clearance-delta', label: 'Clearance: DELTA', unit: 'score'   },
    { key: 'notation-run',    label: 'Notation Blitz',   unit: 'score'   },
    { key: 'fork-in-the-road',label: 'Fork in the Road', unit: 'solved'  },
    { key: 'sand-mine-depths',label: 'Sand Mine Depths', unit: 'depth'   },
    { key: 'pirc-protocol',   label: 'Pirc Protocol',    unit: 'score'   },
    { key: 'ferry-delayed',   label: 'Ferry Delayed',    unit: 'solved'  },
    { key: 'shogi-island',    label: 'Shogi Island',     unit: 'correct' },
    { key: 'blindfold',       label: 'Blindfold Puzzles',unit: 'solved'  }
  ];
  var PAGE = 25;

  var tabsEl = document.getElementById('lb-tabs');
  var bodyEl = document.getElementById('lb-body');
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
      bodyEl.innerHTML = loading
        ? '<p class="lb-empty">Loading…</p>'
        : '<p class="lb-empty">No scores logged yet — be the first.</p>';
      return;
    }
    var me = PJCC.getProfile();
    var head = '<table class="lb-table"><thead><tr><th>#</th><th></th><th>Operative</th><th class="lb-score">' +
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
})();
</script>

<style>
.lb-intro { color: #9a7fd4; max-width: 720px; }
.lb-intro strong { color: #F5C518; }
.lb-more {
  background: #2D1B69; color: #F5C518; border: 1px solid #6b5fa0; border-radius: 999px;
  padding: 8px 20px; cursor: pointer; font-weight: 700; margin-top: 14px;
}
.lb-more:hover:not(:disabled) { background: #F5C518; color: #1a0f3d; }
.lb-more:disabled { opacity: 0.6; cursor: default; }
.lb-end { color: #9a7fd4; margin-top: 14px; font-size: 0.8rem; letter-spacing: 0.05em; }
</style>
