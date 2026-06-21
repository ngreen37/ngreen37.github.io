---
layout: page
title: Hall of Fame
permalink: /hall-of-fame/
---

<link rel="stylesheet" href="{{ '/assets/css/pjcc-profile.css' | relative_url }}">

<div class="hof-wrap">
  <div class="hof-head">
    <div class="hof-tag">◈ THE JOURNEY TO CHESS CITY</div>
    <h1 class="hof-title">Seasons &amp; Hall of Fame</h1>
    <p class="hof-sub">Every month is a <b>Tour</b> — a leg of the Journey. Play any game to score season points; whoever logs the most action by month's end is crowned and enters the Hall of Fame forever.</p>
  </div>

  <div id="hof-season" class="hof-season"><p class="pjcc-sub">Loading this season…</p></div>

  <h2 class="hof-h">🏆 Hall of Fame — past champions</h2>
  <div id="hof-roll"><p class="pjcc-sub">Loading…</p></div>
</div>

<script src="{{ '/assets/js/pjcc-config.js' | relative_url }}"></script>
<script src="{{ '/assets/js/pjcc-profile.js' | relative_url }}"></script>
<script>
(function () {
  'use strict';
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); };

  function renderSeason(season, race) {
    var host = document.getElementById('hof-season');
    var head = '<div class="hof-now"><span class="hof-now-tag">CURRENT TOUR</span>' +
      '<div class="hof-now-name">' + esc(season.name) + '</div>' +
      '<div class="pjcc-sub">' + season.daysLeft + ' day' + (season.daysLeft === 1 ? '' : 's') + ' left in the leg · points reset on the 1st</div></div>';
    if (!race || !race.length) {
      host.innerHTML = head + '<p class="pjcc-sub">No season points logged yet — be the first to lead the Tour. Every game you play this month counts.</p>';
      return;
    }
    var rows = race.map(function (r, i) {
      var cls = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
      return '<tr' + (i === 0 ? ' class="hof-leader"' : '') + '><td class="lb-rank ' + cls + '">' + (i+1) + '</td>' +
        '<td class="lb-av">' + (window.PJCC ? PJCC.avatarEmoji({ companion: r.companion }) : '') + '</td>' +
        '<td class="lb-name">' + esc(r.codename) + (i === 0 ? ' <span class="pjcc-title">Tour leader</span>' : '') + '</td>' +
        '<td class="lb-score">' + r.plays + ' plays</td></tr>';
    }).join('');
    host.innerHTML = head + '<table class="lb-table"><thead><tr><th>#</th><th></th><th>Operative</th><th class="lb-score">SEASON</th></tr></thead><tbody>' + rows + '</tbody></table>' +
      '<p class="pjcc-sub">Standings are this month\'s activity across every game. The leader at month\'s end takes the Tour.</p>';
  }

  function renderHall(hall) {
    var host = document.getElementById('hof-roll');
    if (!hall || !hall.length) {
      host.innerHTML = '<div class="hof-empty">🏛<div>The hall awaits its first champion. Win a Tour and your codename is carved here for good.</div></div>';
      return;
    }
    host.innerHTML = hall.map(function (h) {
      return '<div class="hof-card"><div class="hof-trophy">🏆</div>' +
        '<div><div class="hof-champ">' + esc(h.champ) + '</div>' +
        '<div class="hof-season-name">' + esc(h.season) + (h.tour ? ' · ' + esc(h.tour) : '') + '</div>' +
        (h.note ? '<div class="pjcc-sub">' + esc(h.note) + '</div>' : '') + '</div></div>';
    }).join('');
  }

  var season = (window.PJCC && PJCC.seasonInfo) ? PJCC.seasonInfo() : { name: 'This Season', daysLeft: 0 };
  renderHall((window.PJCC && PJCC.HALL_OF_FAME) || []);
  if (!window.PJCC || !PJCC.enabled) { renderSeason(season, null); return; }
  PJCC.ready.then(function () { return PJCC.seasonRace(25); }).then(function (race) {
    renderSeason(season, race);
  }).catch(function () { renderSeason(season, null); });
})();
</script>

<style>
.hof-wrap { max-width: 640px; margin: 0 auto; }
.hof-head { text-align: center; margin-bottom: 16px; }
.hof-tag { color: #6bffb8; font-size: 0.72rem; letter-spacing: 3px; }
.hof-title { color: #F5C518; margin: 2px 0 4px; }
.hof-sub { color: #c9a7ff; font-size: 0.92rem; line-height: 1.55; }
.hof-now { background: linear-gradient(135deg,#241452,#34206f); border: 1px solid #F5C518; border-radius: 12px; padding: 14px 18px; margin-bottom: 12px; }
.hof-now-tag { color: #F5C518; font-size: 0.7rem; letter-spacing: 2px; font-weight: 800; }
.hof-now-name { color: #f0e6ff; font-size: 1.3rem; font-weight: 900; margin: 2px 0; }
.hof-h { color: #F5C518; font-size: 1.05rem; border-bottom: 1px solid #3a2a6a; padding-bottom: 6px; margin-top: 22px; }
.hof-leader td { background: rgba(245,197,24,0.10); }
.hof-empty { text-align: center; color: #c9a7ff; background: #160c33; border: 1px dashed #6b5fa0; border-radius: 12px; padding: 26px 18px; font-size: 1.5rem; }
.hof-empty div { font-size: 0.9rem; margin-top: 8px; }
.hof-card { display: flex; gap: 14px; align-items: center; background: #160c33; border: 1px solid #6b5fa0; border-left: 3px solid #F5C518; border-radius: 10px; padding: 12px 16px; margin-bottom: 8px; }
.hof-trophy { font-size: 28px; }
.hof-champ { color: #F5C518; font-weight: 900; font-size: 1.1rem; }
.hof-season-name { color: #c9a7ff; font-size: 0.85rem; }
</style>
