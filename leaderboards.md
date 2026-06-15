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
    { key: 'ferry-delayed',   label: 'Ferry Delayed',    unit: 'solved'  }
  ];

  var tabsEl = document.getElementById('lb-tabs');
  var bodyEl = document.getElementById('lb-body');
  var active = '__overall__';

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function rankClass(i) { return i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''; }
  function av(companion) { return PJCC.avatarEmoji({ companion: companion }); }

  function buildTabs() {
    tabsEl.innerHTML = '';
    BOARDS.forEach(function (b) {
      var t = document.createElement('button');
      t.className = 'lb-tab' + (b.key === active ? ' active' : '');
      t.textContent = b.label;
      t.onclick = function () { active = b.key; buildTabs(); load(); };
      tabsEl.appendChild(t);
    });
  }

  function table(rows, unit, scoreKey) {
    if (!rows.length) return '<p class="lb-empty">No scores logged yet — be the first.</p>';
    var me = PJCC.getProfile();
    var head = '<table class="lb-table"><thead><tr><th>#</th><th></th><th>Operative</th><th class="lb-score">' +
               unit.toUpperCase() + '</th></tr></thead><tbody>';
    var body = rows.map(function (r, i) {
      var mine = me && r.codename === me.codename ? ' lb-me' : '';
      return '<tr class="' + mine + '">' +
        '<td class="lb-rank ' + rankClass(i) + '">' + (i + 1) + '</td>' +
        '<td class="lb-av">' + av(r.companion) + '</td>' +
        '<td class="lb-name">' + esc(r.codename) + (r.rankName ? ' <span class="pjcc-sub">· ' + esc(r.rankName) + '</span>' : '') + '</td>' +
        '<td class="lb-score">' + r[scoreKey] + '</td>' +
      '</tr>';
    }).join('');
    return head + body + '</tbody></table>';
  }

  async function load() {
    if (!PJCC.enabled) { bodyEl.innerHTML = '<p class="lb-empty">Leaderboards are offline.</p>'; return; }
    bodyEl.innerHTML = '<p class="lb-empty">Loading…</p>';
    var board = BOARDS.filter(function (b) { return b.key === active; })[0];
    if (active === '__overall__') {
      var rows = await PJCC.cumulativeLeaderboard(50);
      rows = rows.map(function (r) { return { codename: r.codename, companion: r.companion, credits: r.credits, rankName: r.rank }; });
      bodyEl.innerHTML = table(rows, board.unit, 'credits');
    } else {
      var grows = await PJCC.gameLeaderboard(active, 50);
      bodyEl.innerHTML = table(grows, board.unit, 'score');
    }
  }

  buildTabs();
  PJCC.ready.then(load);
})();
</script>

<style>
.lb-intro { color: #9a7fd4; max-width: 720px; }
.lb-intro strong { color: #F5C518; }
</style>
