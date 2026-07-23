---
layout: page
title: PJCC Chess Academy
permalink: /chess-lessons/
body_class: theme-bw
---

<div class="lessons-stats">
  <div class="stat-card">
    <span class="stat-number" data-target="91">0</span>
    <span class="stat-label">Students Taught</span>
  </div>
  <div class="stat-card">
    <span class="stat-number" data-target="34">0</span>
    <span class="stat-label">Classes Taught</span>
  </div>
</div>

<div class="lessons-info">
  <h2>In-Person &amp; Online Lessons</h2>
  <p>I offer chess lessons for <strong>beginners</strong> and <strong>intermediate</strong> players -- whether you're just learning how the pieces move or looking to sharpen your game and take it to the next level.</p>
  <p>Lessons are available both <strong>in person</strong> and <strong>online</strong>, and can be tailored to your schedule and goals.</p>
  <p>For availability, scheduling, and pricing, please <a href="/contact/">contact me</a> — I'd love to hear from you.</p>
  <p style="margin-top:14px;padding:12px 14px;border:1px solid rgba(245,197,24,0.4);border-radius:8px;">🎓 Want a free, self-paced way to practice between lessons? Try the <a href="/academy/">PJCC Chess Academy</a> — start with Auston's Bootcamp and learn how every piece moves on a real board.</p>
</div>

<!-- ══════════ Meet the Coaches (in-universe roster) ══════════ -->
<section class="cc-roster" aria-label="Meet the PJCC Academy coaches">
  <div class="cc-head">
    <span class="cc-eyebrow">◈ MEET THE COACHES</span>
    <h2 class="cc-title">The PJCC Academy Faculty</h2>
    <p class="cc-disclaimer">★ A make-believe roster. These are <a href="/characters/">characters from the PJCC universe</a> — and their student reviews are fiction too. For real lessons with a real human coach, use the <a href="/contact/">contact link above</a>.</p>
  </div>

  <div class="cc-grid">

    <!-- Argus -->
    <article class="cc-card" style="--cc:#F5C518">
      <div class="cc-top">
        <span class="cc-avatar">♞</span>
        <div class="cc-id">
          <a class="cc-name" href="/characters/argus/">Argus</a>
          <span class="cc-spec">Fundamentals &amp; Discipline · Chess</span>
          <span class="cc-rate"><span class="cc-stars"><span class="cc-stars-on" style="width:98%">★★★★★</span>★★★★★</span> <b>4.9</b> <span class="cc-count">(37)</span></span>
        </div>
      </div>
      <div class="cc-badge">✓ Reigning champion — Checker Town Chess Open</div>
      <div class="cc-chips"><span>37 students</span><span>210 sessions</span><span>Replies same day</span></div>
      <p class="cc-bio">Steady as they get. Argus won't dazzle you with tricks — he'll build a foundation that never cracks. Perfect for beginners who want the basics done <em>right</em>.</p>
      <blockquote class="cc-quote">
        <span class="cc-stars mini"><span class="cc-stars-on" style="width:100%">★★★★★</span>★★★★★</span>
        <p>"He made me play the same endgame nine times. On the tenth I finally got it — and I'll never lose it. Never flashy, always there."</p>
        <cite>— Auston, first student</cite>
      </blockquote>
    </article>

  </div>

  <!-- little student wall for extra flavor -->
  <div class="cc-wall">
    <div class="cc-wall-label">◈ MORE STUDENT REVIEWS</div>
    <div class="cc-wall-grid">
      <div class="cc-mini"><span class="cc-stars mini"><span class="cc-stars-on" style="width:100%">★★★★★</span>★★★★★</span><p>"I still can't castle. Five stars anyway. I keep showing up!"</p><cite>— Crockett</cite></div>
      <div class="cc-mini"><span class="cc-stars mini"><span class="cc-stars-on" style="width:100%">★★★★★</span>★★★★★</span><p>"Show her something once and she starts mastering it. The coaches barely keep up."</p><cite>— on Princess</cite></div>
      <div class="cc-mini"><span class="cc-stars mini"><span class="cc-stars-on" style="width:100%">★★★★★</span>★★★★★</span><p>"Ten years braver than her big brother. She never leaves the board."</p><cite>— on Auston</cite></div>
    </div>
  </div>
</section>

<style>
  .cc-roster { max-width: 900px; margin: 26px auto; }
  .cc-head { text-align: center; margin-bottom: 20px; }
  .cc-eyebrow { display: inline-block; font-size: 0.72rem; letter-spacing: 0.22em; color: #F5C518; font-weight: 700; }
  .cc-title { margin: 6px 0 8px; font-size: 1.5rem; }
  .cc-disclaimer { font-size: 0.82rem; font-style: italic; color: #9a927f; max-width: 620px; margin: 0 auto; line-height: 1.55; }
  .cc-disclaimer a { color: #cbb45a; }

  .cc-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
  @media (min-width: 720px) { .cc-grid { grid-template-columns: repeat(auto-fit, minmax(260px, 460px)); justify-content: center; } }

  .cc-card {
    background: #161512; border: 1px solid rgba(245,197,24,0.16);
    border-top: 3px solid var(--cc); border-radius: var(--r-md); padding: 16px 16px 18px;
    display: flex; flex-direction: column;
  }
  .cc-top { display: flex; gap: 12px; align-items: center; }
  .cc-avatar {
    flex: none; width: 52px; height: 52px; border-radius: 50%;
    display: grid; place-items: center; font-size: 1.7rem; line-height: 1;
    background: rgba(255,255,255,0.04); border: 2px solid var(--cc); color: var(--cc);
  }
  .cc-id { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  @media (pointer: coarse) { .cc-name { padding: 8px 4px; margin: -8px -4px; display: inline-block; } }  /* touch sweep 2026-07-13 */
  .cc-name { font-weight: 800; font-size: 1.1rem; color: #f2ecdd; text-decoration: none; }
  .cc-name:hover { color: var(--cc); }
  .cc-kanji { font-weight: 500; color: var(--cc); opacity: 0.85; }
  .cc-spec { font-size: 0.76rem; color: #9a927f; }
  .cc-rate { font-size: 0.82rem; color: #d9d0bd; display: flex; align-items: center; gap: 6px; margin-top: 2px; }
  .cc-rate b { color: #F5C518; }
  .cc-count { color: #93897a; }  /* a11y 2026-07-13: was 4.0:1 */

  /* a11y 2026-07-13: the rating stars were #45403a — 1.8:1, unreadable. */
  .cc-stars { position: relative; display: inline-block; color: #a89778; letter-spacing: 1px; white-space: nowrap; }
  .cc-stars-on { position: absolute; left: 0; top: 0; overflow: hidden; color: #F5C518; white-space: nowrap; }
  .cc-stars.mini { font-size: 0.8rem; }

  .cc-badge {
    margin: 12px 0 10px; font-size: 0.76rem; color: #bfe8cf;
    background: rgba(76,201,138,0.08); border: 1px solid rgba(76,201,138,0.22);
    border-radius: 7px; padding: 7px 9px; line-height: 1.4;
  }
  .cc-badge a { color: #8fe0b0; }
  .cc-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
  .cc-chips span { font-size: 0.68rem; color: #b5ac97; background: rgba(255,255,255,0.05); border-radius: 999px; padding: 3px 9px; }
  .cc-bio { font-size: 0.85rem; color: #cfc7b4; line-height: 1.5; margin: 0 0 12px; }

  .cc-quote { margin: auto 0 0; padding: 10px 12px; border-left: 3px solid var(--cc); background: rgba(255,255,255,0.03); border-radius: 0 8px 8px 0; }
  .cc-quote p { margin: 5px 0 6px; font-size: 0.82rem; color: #e6ddca; line-height: 1.5; font-style: italic; }
  .cc-quote cite { font-size: 0.72rem; color: #9a927f; font-style: normal; }

  .cc-wall { margin-top: 22px; }
  .cc-wall-label { font-size: 0.72rem; letter-spacing: 0.2em; color: #9a927f; text-align: center; margin-bottom: 12px; }
  .cc-wall-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
  @media (min-width: 720px) { .cc-wall-grid { grid-template-columns: repeat(3, 1fr); } }
  .cc-mini { background: #161512; border: 1px solid rgba(245,197,24,0.12); border-radius: var(--r-sm); padding: 12px 14px; }
  .cc-mini p { margin: 6px 0 6px; font-size: 0.82rem; color: #e6ddca; line-height: 1.5; font-style: italic; }
  .cc-mini cite { font-size: 0.72rem; color: #9a927f; font-style: normal; }
</style>

<div class="lessons-game-feed">
  <div id="chess-embed-wrap">
    <div class="lessons-game-coming-soon" id="chess-embed-loading">
      <span class="lessons-game-icon">♛</span>
      <div class="lessons-game-msg" id="chess-embed-msg">Fetching latest game...</div>
    </div>
    <div class="cl-blindfold-overlay">&#9822; BOARD HIDDEN<br><span style="font-size:10px;opacity:0.6;letter-spacing:0.08em;">Blindfold mode active — trust your calculation</span></div>
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

<!-- #40 Tactics Streak -->
<div class="cl-streak" id="cl-streak">
  <span class="cl-streak-fire">🔥</span>
  <div class="cl-streak-info">
    <span class="cl-streak-label">◈ Daily Visit Streak</span>
    <span class="cl-streak-count" id="streak-count">1</span>
    <span class="cl-streak-sub" id="streak-sub">day — keep studying</span>
  </div>
</div>

<!-- #33 Opening of the Week -->
<div class="cl-opening" id="cl-opening">
  <div class="cl-opening-label">◈ Opening of the Week</div>
  <div class="cl-opening-eco" id="op-eco">—</div>
  <div class="cl-opening-name" id="op-name">—</div>
  <div class="cl-opening-moves" id="op-moves">—</div>
  <div class="cl-opening-note" id="op-note">—</div>
</div>

<!-- #22 / #38 Scenario of the Day -->
<div class="cl-scenario" id="cl-scenario">
  <div class="cl-scenario-label">◈ Scenario of the Day</div>
  <div class="cl-scenario-day" id="sc-day">—</div>
  <div class="cl-scenario-title" id="sc-title">—</div>
  <div class="cl-scenario-body" id="sc-body">—</div>
  <span class="cl-scenario-tag" id="sc-tag">—</span>
</div>

<!-- #37 Blindfold Training Toggle (wraps game feed) -->
<div class="cl-blindfold-bar">
  <span class="cl-blindfold-label">◈ RECENT GAMES — ngreen37 on chess.com</span>
  <button class="cl-blindfold-toggle" id="blindfold-toggle">&#9822; Blindfold Mode</button>
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

<!-- #34 Piece Hierarchy -->
<div class="cl-piece-chart">
  <div class="cl-piece-chart-label">◈ Piece Value Hierarchy</div>
  <div class="cl-piece-row"><span class="cl-piece-sym">♟</span><span class="cl-piece-name">Pawn</span><div class="cl-piece-bar-wrap"><div class="cl-piece-bar" data-w="11"></div></div><span class="cl-piece-val">1</span></div>
  <div class="cl-piece-row"><span class="cl-piece-sym">♞</span><span class="cl-piece-name">Knight</span><div class="cl-piece-bar-wrap"><div class="cl-piece-bar" data-w="33"></div></div><span class="cl-piece-val">3</span></div>
  <div class="cl-piece-row"><span class="cl-piece-sym">♝</span><span class="cl-piece-name">Bishop</span><div class="cl-piece-bar-wrap"><div class="cl-piece-bar" data-w="33"></div></div><span class="cl-piece-val">3</span></div>
  <div class="cl-piece-row"><span class="cl-piece-sym">♜</span><span class="cl-piece-name">Rook</span><div class="cl-piece-bar-wrap"><div class="cl-piece-bar" data-w="55"></div></div><span class="cl-piece-val">5</span></div>
  <div class="cl-piece-row"><span class="cl-piece-sym">♛</span><span class="cl-piece-name">Queen</span><div class="cl-piece-bar-wrap"><div class="cl-piece-bar" data-w="100"></div></div><span class="cl-piece-val">9</span></div>
  <div class="cl-piece-row"><span class="cl-piece-sym">♚</span><span class="cl-piece-name">King</span><div class="cl-piece-bar-wrap"><div class="cl-piece-bar" data-w="100" style="background:linear-gradient(90deg,#2D1B69 0%,#FFE566 100%)"></div></div><span class="cl-piece-val">∞</span></div>
</div>

<!-- #35 Endgame Position of the Week -->
<div class="cl-endgame" id="cl-endgame">
  <div class="cl-endgame-label">◈ Endgame Study of the Week</div>
  <div class="cl-endgame-week" id="eg-week">—</div>
  <div class="cl-endgame-name" id="eg-name">—</div>
  <div class="cl-endgame-desc" id="eg-desc">—</div>
  <a class="cl-endgame-link" id="eg-link" href="https://lichess.org/practice" target="_blank" rel="noopener">&#9654; Study on Lichess</a>
</div>

<!-- #39 Chess Resources Briefing -->
<div class="cl-resources">
  <div class="cl-resources-label">◈ Intelligence Briefing — Recommended Resources</div>
  <a class="cl-resource-card" href="https://lichess.org/learn" target="_blank" rel="noopener">
    <span class="cl-resource-icon">&#9812;</span>
    <div class="cl-resource-info">
      <span class="cl-resource-name">Lichess Learn</span>
      <span class="cl-resource-desc">Free interactive lessons covering every phase of the game. No account required.</span>
      <span class="cl-resource-tag">LESSONS</span>
    </div>
  </a>
  <a class="cl-resource-card" href="https://lichess.org/practice" target="_blank" rel="noopener">
    <span class="cl-resource-icon">&#9813;</span>
    <div class="cl-resource-info">
      <span class="cl-resource-name">Lichess Practice</span>
      <span class="cl-resource-desc">Endgame practice with guided study positions. Essential for converting advantages.</span>
      <span class="cl-resource-tag">ENDGAMES</span>
    </div>
  </a>
  <a class="cl-resource-card" href="https://www.chess.com/puzzles" target="_blank" rel="noopener">
    <span class="cl-resource-icon">&#9822;</span>
    <div class="cl-resource-info">
      <span class="cl-resource-name">Chess.com Puzzles</span>
      <span class="cl-resource-desc">Daily tactical puzzles. Rated system tracks your improvement over time.</span>
      <span class="cl-resource-tag">TACTICS</span>
    </div>
  </a>
  <a class="cl-resource-card" href="https://chesstempo.com" target="_blank" rel="noopener">
    <span class="cl-resource-icon">&#9823;</span>
    <div class="cl-resource-info">
      <span class="cl-resource-name">Chess Tempo</span>
      <span class="cl-resource-desc">High-volume tactics trainer with spaced repetition. Used by serious improvers at every level.</span>
      <span class="cl-resource-tag">TACTICS</span>
    </div>
  </a>
  <a class="cl-resource-card" href="https://www.chess.com/openings" target="_blank" rel="noopener">
    <span class="cl-resource-icon">&#9820;</span>
    <div class="cl-resource-info">
      <span class="cl-resource-name">Opening Explorer</span>
      <span class="cl-resource-desc">Study opening theory, see stats from grandmaster games, build your repertoire.</span>
      <span class="cl-resource-tag">OPENINGS</span>
    </div>
  </a>
</div>

<script>
(function() {
  var day = new Date().getDay();
  var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

  // #33 Openings
  var openings = [
    { eco:'A00', name:'Sokolsky Opening', moves:'1. b4', note:'Sideline surprise. Fights for queenside space immediately and takes opponents out of book.' },
    { eco:'B20', name:'Sicilian Defense', moves:'1. e4 c5', note:'Most popular reply to 1.e4. Black fights for the center asymmetrically, creating rich imbalances.' },
    { eco:'D00', name:'London System', moves:'1. d4 2. Bf4 3. e3', note:'Solid, reliable setup for White. Easy to learn, hard to bust — great for beginners and club players alike.' },
    { eco:'C60', name:'Ruy Lopez', moves:'1. e4 e5 2. Nf3 Nc6 3. Bb5', note:'One of the oldest and most respected openings. White pressures the knight supporting the e5 pawn.' },
    { eco:'E60', name:'King\'s Indian Defense', moves:'1. d4 Nf6 2. c4 g6', note:'Black allows White a big center and counter-attacks it. Tactical, dynamic, and beloved by attackers.' },
    { eco:'A45', name:'Trompowsky Attack', moves:'1. d4 Nf6 2. Bg5', note:'Avoid mainline theory. Bg5 pins the knight immediately, disrupting Black\'s development plans.' },
    { eco:'C00', name:'French Defense', moves:'1. e4 e6', note:'Solid structure for Black. The e6 pawn creates a pawn chain that leads to tense positional battles.' }
  ];
  var op = openings[day];
  document.getElementById('op-eco').textContent = op.eco;
  document.getElementById('op-name').textContent = op.name;
  document.getElementById('op-moves').textContent = op.moves;
  document.getElementById('op-note').textContent = op.note;

  // #22/#38 Scenario of the day
  var scenarios = [
    { title:'The Back Rank Weakness', body:'Your opponent has all their pawns in front of their king, no escape square. You have a rook on the seventh rank. What pattern do you look for?', tag:'TACTICS' },
    { title:'Outpost Knight', body:'You have a knight that cannot be chased by an enemy pawn. It sits on e5, d6, or c7. What makes this position winning, and how do you exploit the outpost?', tag:'STRATEGY' },
    { title:'The Zwischenzug', body:'Your opponent plays what looks like a winning move. Before responding to their threat, look for an in-between move that changes the calculation entirely.', tag:'TACTICS' },
    { title:'Rook Activation', body:'Your rook has been passive all game behind your own pawns. The endgame is approaching. How do you open a file and activate your rook before the position closes?', tag:'ENDGAME' },
    { title:'Pawn Majority', body:'You have four pawns vs. three on the queenside. Your opponent\'s pieces are focused kingside. What is your plan to convert this structural advantage?', tag:'STRATEGY' },
    { title:'King in the Endgame', body:'It\'s a rook and pawn endgame. Most beginners leave their king passive. Walk your king toward the action. What does "king activity" mean in practice?', tag:'ENDGAME' },
    { title:'The Pin and the Fork', body:'Identify which piece is pinned against the king or queen. Now look for a fork that exploits a pinned piece that cannot recapture. How many ways does this pattern appear?', tag:'TACTICS' }
  ];
  var sc = scenarios[day];
  document.getElementById('sc-day').textContent = days[day].toUpperCase();
  document.getElementById('sc-title').textContent = sc.title;
  document.getElementById('sc-body').textContent = sc.body;
  document.getElementById('sc-tag').textContent = sc.tag;

  // #35 Endgame of the week
  var endgames = [
    { week:'Week Theme: Rook Endgames', name:'The Lucena Position', desc:'The most important rook endgame to know. White has a pawn on the 7th rank with the king blocking. The "bridge building" technique decides the game.', url:'https://lichess.org/practice/rook-endings/lucena-position/TPJ08rYS/' },
    { week:'Week Theme: Rook Endgames', name:'The Philidor Position', desc:'Black\'s drawing fortress in rook endgames. The rook cuts the enemy king off with a side attack. Essential defensive knowledge.', url:'https://lichess.org/practice/rook-endings/philidor-position/1mhXKDKK/' },
    { week:'Week Theme: Pawn Endgames', name:'Opposition and Key Squares', desc:'In king and pawn vs. king, understanding opposition decides who wins. Learn to calculate key squares before advancing.', url:'https://lichess.org/learn#/23' },
    { week:'Week Theme: Minor Pieces', name:'Good Bishop vs. Bad Bishop', desc:'Pawns on the same color as your bishop? That\'s a bad bishop. Learn how to identify and use this structural factor.', url:'https://lichess.org/practice' },
    { week:'Week Theme: Technique', name:'The Pawn Breakthrough', desc:'Three connected passed pawns vs. three defenders. Sometimes sacrificing one pawn forces a queen. Calculate the breakthrough.', url:'https://lichess.org/learn#/24' },
    { week:'Week Theme: Rook + Pawn', name:'Rook Behind the Passed Pawn', desc:'The rook belongs behind a passed pawn — whether yours or your opponent\'s. This fundamental principle wins games.', url:'https://lichess.org/practice/rook-endings/rook-and-pawn-vs-rook/f6sMfMnp/' },
    { week:'Week Theme: Queen Endgames', name:'Queen vs. Advanced Pawn', desc:'A queen vs. a pawn near queening — the result depends on where the pawn is. Rook and bishop pawns on the 7th are tricky draws.', url:'https://lichess.org/practice' }
  ];
  var eg = endgames[day];
  document.getElementById('eg-week').textContent = eg.week;
  document.getElementById('eg-name').textContent = eg.name;
  document.getElementById('eg-desc').textContent = eg.desc;
  document.getElementById('eg-link').href = eg.url;

  // #40 Tactics streak
  (function() {
    var today = new Date().toDateString();
    var key = 'cl_streak';
    var lk = 'cl_last_visit';
    try {
      var last = localStorage.getItem(lk);
      var streak = parseInt(localStorage.getItem(key) || '0', 10);
      var yesterday = new Date(Date.now() - 86400000).toDateString();
      if (last === today) {
        // already visited today
      } else if (last === yesterday) {
        streak++;
        localStorage.setItem(key, streak);
        localStorage.setItem(lk, today);
      } else {
        streak = 1;
        localStorage.setItem(key, '1');
        localStorage.setItem(lk, today);
      }
      var countEl = document.getElementById('streak-count');
      var subEl   = document.getElementById('streak-sub');
      if (countEl) countEl.textContent = streak;
      if (subEl) subEl.textContent = streak === 1 ? 'day — first step counts' : streak + ' days — keep going';
    } catch(e) {}
  })();

  // #37 Blindfold toggle
  (function() {
    var btn  = document.getElementById('blindfold-toggle');
    var wrap = document.getElementById('chess-embed-wrap');
    if (!btn || !wrap) return;
    btn.addEventListener('click', function() {
      var active = wrap.classList.toggle('is-blindfold');
      btn.classList.toggle('is-active', active);
      btn.textContent = active ? '♞ Board Revealed' : '♞ Blindfold Mode';
    });
  })();
})();

// Animate piece bars on scroll
(function() {
  var bars = document.querySelectorAll('.cl-piece-bar[data-w]');
  if (!bars.length) return;
  var triggered = false;
  function animate() {
    if (triggered) return;
    triggered = true;
    bars.forEach(function(b) { b.style.width = b.getAttribute('data-w') + '%'; });
  }
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) { if (e.isIntersecting) { animate(); obs.disconnect(); } });
    }, { threshold: 0.1 });
    obs.observe(bars[0].closest('.cl-piece-chart'));
  } else { animate(); }
})();
</script>
