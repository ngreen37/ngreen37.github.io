---
layout: page
title: Chess Lessons
permalink: /chess-lessons/
body_class: theme-bw
---

<div class="lessons-stats">
  <div class="stat-card">
    <span class="stat-number" data-target="91">0</span>
    <span class="stat-label">Students Taught</span>
  </div>
  <div class="stat-card">
    <span class="stat-number" data-target="23">0</span>
    <span class="stat-label">Classes Taught</span>
  </div>
</div>

<div class="lessons-info">
  <h2>In-Person &amp; Online Lessons</h2>
  <p>I offer chess lessons for <strong>beginners</strong> and <strong>intermediate</strong> players -- whether you're just learning how the pieces move or looking to sharpen your game and take it to the next level.</p>
  <p>Lessons are available both <strong>in person</strong> and <strong>online</strong>, and can be tailored to your schedule and goals.</p>
  <p>For availability, scheduling, and pricing, please <a href="/contact/">contact me</a> — I'd love to hear from you.</p>
</div>

<div class="lessons-game-feed">
  <div class="lessons-game-feed-label">◈ RECENT GAMES — ngreen37 on chess.com</div>
  <div id="chess-embed-wrap">
    <div class="lessons-game-coming-soon" id="chess-embed-loading">
      <span class="lessons-game-icon">♛</span>
      <div class="lessons-game-msg" id="chess-embed-msg">Fetching latest game...</div>
    </div>
  </div>
  <div id="chess-recent-list"></div>
  <div class="game-feed-footer">
    <a href="https://www.chess.com/member/ngreen37" target="_blank" rel="noopener" class="game-feed-profile-link">↗ Full profile on chess.com</a>
  </div>
</div>

<div class="chess-puzzle-widget">
  <div class="chess-puzzle-label">&#9672; PUZZLE OF THE DAY &mdash; chess.com</div>
  <div id="puzzle-wrap">
    <div class="lessons-game-coming-soon">
      <span class="lessons-game-icon">&#9822;</span>
      <div class="lessons-game-msg" id="puzzle-msg">Loading puzzle...</div>
    </div>
  </div>
</div>

<div class="chess-stats-widget">
  <div class="chess-stats-label">◈ RATINGS — ngreen37</div>
  <div class="chess-stats-grid">
    <div class="chess-stat-item"><div class="chess-stat-type">DAILY</div><div class="chess-stat-val" id="stat-daily">—</div></div>
    <div class="chess-stat-item"><div class="chess-stat-type">RAPID</div><div class="chess-stat-val" id="stat-rapid">—</div></div>
    <div class="chess-stat-item"><div class="chess-stat-type">BLITZ</div><div class="chess-stat-val" id="stat-blitz">—</div></div>
  </div>
</div>

<script>
document.querySelectorAll('.stat-number').forEach(function(el) {
  var target = parseInt(el.getAttribute('data-target'), 10);
  var duration = 1400;
  var start = null;
  function ease(t) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; }
  function step(ts) {
    if (!start) start = ts;
    var progress = Math.min((ts - start) / duration, 1);
    el.textContent = Math.floor(ease(progress) * target);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  }
  requestAnimationFrame(step);
});
</script>

<script>
(function() {
  var now = new Date();
  var year = now.getFullYear();
  var month = String(now.getMonth() + 1).padStart('0', 2);
  var msgEl  = document.getElementById('chess-embed-msg');
  var wrap   = document.getElementById('chess-embed-wrap');
  var list   = document.getElementById('chess-recent-list');

  function pad2(n) { return n < 10 ? '0' + n : '' + n; }
  month = pad2(now.getMonth() + 1);

  function renderGames(games) {
    if (!games || !games.length) {
      if (msgEl) msgEl.textContent = 'No games found this month yet.';
      return;
    }

    // Embed most recent game via chess.com emboard
    var latest = games[games.length - 1];
    var gameId = latest.url ? latest.url.split('/').pop() : null;
    if (gameId && wrap) {
      wrap.innerHTML =
        '<div class="chess-embed-container">' +
        '<iframe src="https://www.chess.com/emboard?id=' + gameId + '" ' +
        'width="100%" height="420" style="border:none;border-radius:6px;display:block;" ' +
        'allowfullscreen loading="lazy"></iframe>' +
        '</div>';
    }

    // Recent games list (last 5)
    var recent = games.slice(-5).reverse();
    var html = '<div class="game-feed-list">';
    recent.forEach(function(g) {
      var white = (g.white && g.white.username || '').toLowerCase();
      var isWhite = white === 'ngreen37';
      var me  = isWhite ? g.white : g.black;
      var opp = isWhite ? g.black : g.white;
      var r   = (me && me.result) || '';
      var result = r === 'win' ? 'W' : (r === 'agreed' || r === 'stalemate' || r === 'repetition' || r === 'insufficient') ? 'D' : 'L';
      var cls = result === 'W' ? 'game-result--win' : result === 'D' ? 'game-result--draw' : 'game-result--loss';
      var oppName = (opp && opp.username) || '?';
      var oppRating = (opp && opp.rating) ? '(' + opp.rating + ')' : '';
      var d = new Date((g.end_time || 0) * 1000);
      var dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      var tc = (g.time_class || 'game').toUpperCase();
      html +=
        '<a class="game-feed-row" href="' + (g.url || '#') + '" target="_blank" rel="noopener">' +
        '<span class="game-result ' + cls + '">' + result + '</span>' +
        '<span class="game-type">' + tc + '</span>' +
        '<span class="game-opponent">vs ' + oppName + '</span>' +
        '<span class="game-opp-rating">' + oppRating + '</span>' +
        '<span class="game-date">' + dateStr + '</span>' +
        '</a>';
    });
    html += '</div>';
    if (list) list.innerHTML = html;
  }

  fetch('https://api.chess.com/pub/player/ngreen37/games/' + year + '/' + month)
    .then(function(r) { return r.json(); })
    .then(function(data) { renderGames(data.games); })
    .catch(function() {
      if (msgEl) msgEl.textContent = 'Game feed unavailable — visit chess.com/member/ngreen37';
    });

  // Daily puzzle
  (function() {
    var pw = document.getElementById('puzzle-wrap');
    var pm = document.getElementById('puzzle-msg');
    if (!pw) return;
    fetch('https://api.chess.com/pub/puzzle')
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (!data || !data.image) { if (pm) pm.textContent = 'No puzzle available today.'; return; }
        var d = new Date((data.publish_time || 0) * 1000);
        var dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        pw.innerHTML =
          '<div class="puzzle-inner">' +
          '<div class="puzzle-date">' + dateStr + '</div>' +
          '<div class="puzzle-title">' + (data.title || 'Find the Best Move') + '</div>' +
          '<img class="puzzle-board-img" src="' + data.image + '" alt="Chess puzzle board position">' +
          '<a class="puzzle-solve-btn" href="' + data.url + '" target="_blank" rel="noopener">&#9654;&nbsp; Solve on chess.com</a>' +
          '</div>';
      })
      .catch(function() { if (pm) pm.textContent = 'Puzzle unavailable today.'; });
  })();

  // Ratings
  fetch('https://api.chess.com/pub/player/ngreen37/stats')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      function setRating(id, obj, key) {
        var el = document.getElementById(id);
        if (!el) return;
        var val = data[obj] && data[obj].last && data[obj].last.rating;
        if (val) el.textContent = val;
      }
      setRating('stat-daily', 'chess_daily', 'rating');
      setRating('stat-rapid', 'chess_rapid', 'rating');
      setRating('stat-blitz', 'chess_blitz', 'rating');
    })
    .catch(function() {});
})();
</script>
