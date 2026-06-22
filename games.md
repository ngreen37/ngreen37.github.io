---
layout: page
title: Games
permalink: /games/
---

<div id="bounty-banner" class="bounty-banner" hidden></div>

<button id="sheen-toggle" class="sheen-toggle" type="button" title="The soft glow that trails your cursor across the cards. Turn it off for a calmer page.">✨ Cursor sheen: on</button>
<span class="sheen-note">— the glow that follows your cursor across the cards; toggle off for a calmer page</span>

<div id="continue-hero" class="continue-hero" hidden></div>

<div class="game-filters" id="game-filters">
  <button class="gf-tab active" data-filter="all">All</button>
  <button class="gf-tab" data-filter="playable">▶ Playable</button>
  <button class="gf-tab" data-filter="dev">🛠 In Development</button>
  <button class="gf-tab" data-filter="daily">📅 Daily</button>
  <button class="gf-tab" data-filter="new">✦ New</button>
  <span class="gf-spacer"></span>
  <button id="gf-surprise" class="gf-surprise" type="button">🎲 Surprise me</button>
</div>

<script>
(function () {
  var NAMES = { 'clearance-delta': 'Clearance: DELTA', 'notation-run': 'Notation Blitz', 'fork-in-the-road': 'Fork in the Road', 'sand-mine-depths': 'Sand Mine Depths', 'pirc-protocol': 'The Pirc Protocol', 'shogi-island': 'Shogi Island', 'tower-defense': 'Siege on Chess City', 'sky-run': 'Sky Run', 'the-gauntlet': 'The Gauntlet' };
  var ICON = { 'clearance-delta':'Δ', 'notation-run':'♫', 'fork-in-the-road':'⚔', 'sand-mine-depths':'⛏', 'pirc-protocol':'♚', 'shogi-island':'将', 'tower-defense':'🏰', 'sky-run':'♞', 'the-gauntlet':'♛' };
  var ACC = { 'clearance-delta':'#ff9fb0', 'notation-run':'#F5C518', 'fork-in-the-road':'#5be0c0', 'sand-mine-depths':'#e0b25a', 'pirc-protocol':'#caa24a', 'shogi-island':'#d9a441', 'tower-defense':'#ff8fd0', 'sky-run':'#7fc8ff', 'the-gauntlet':'#F5C518' };
  var BLURB = { 'clearance-delta':'Climb the clearance ladder in the trivia hall.', 'notation-run':'Read chess coordinates at speed, on the beat.', 'fork-in-the-road':'Adaptive tactics — forks, skewers, mates.', 'sand-mine-depths':'A knight-move descent into the Father’s mine.', 'pirc-protocol':'Learn real openings by playing the book.', 'shogi-island':'Learn shogi as the Japanese guide decodes.', 'tower-defense':'Hold the gates of Chess City.', 'sky-run':'A chess-Bloons climb to Chess City.', 'the-gauntlet':'Real games of chess up a ladder to the CEO.' };
  function show() {
    if (!window.PJCC || !PJCC.bountyGame) return;
    var key = PJCC.bountyGame();
    var b = document.getElementById('bounty-banner');
    if (!b) return;
    var acc = ACC[key] || '#F5C518';
    b.style.setProperty('--gotw', acc);
    b.innerHTML =
      '<div class="gotw-icon" style="color:' + acc + '">' + (ICON[key] || '🎯') + '</div>' +
      '<div class="gotw-body"><div class="gotw-eye">★ Game of the Week · <b>2× credits</b></div>' +
      '<div class="gotw-name">' + (NAMES[key] || key) + '</div>' +
      '<div class="gotw-blurb">' + (BLURB[key] || '') + '</div></div>' +
      '<a class="gotw-play" href="/games/' + key + '/" style="background:' + acc + '">Play ▸</a>';
    b.hidden = false;
  }
  if (window.PJCC && PJCC.ready) PJCC.ready.then(show); else document.addEventListener('DOMContentLoaded', show);
})();
</script>

<style>
.bounty-banner { display: flex; align-items: center; gap: 14px; background: linear-gradient(135deg,#241452,#34206f);
  border: 1px solid var(--gotw,#F5C518); border-radius: 12px; padding: 14px 18px; margin: 0 0 1rem; color: #f0e6ff;
  box-shadow: 0 0 22px -8px var(--gotw,#F5C518); }
.bounty-banner strong { color: var(--gotw,#F5C518); }
.gotw-icon { font-size: 40px; line-height: 1; flex-shrink: 0; }
.gotw-body { flex: 1; min-width: 0; }
.gotw-eye { font-size: 0.7rem; letter-spacing: 0.12em; text-transform: uppercase; color: #c9a7ff; }
.gotw-eye b { color: var(--gotw,#F5C518); }
.gotw-name { font-size: 1.15rem; font-weight: 900; color: #fff; margin: 1px 0; }
.gotw-blurb { font-size: 0.82rem; color: #b9a8e6; }
.gotw-play { flex-shrink: 0; color: #1a0f3d; font-weight: 900; border-radius: 999px; padding: 9px 18px; text-decoration: none; white-space: nowrap; }
.gotw-play:hover { filter: brightness(1.08); }
/* "Daily" badge (date-seeded mode), with a done-today ✓ */
.gc-daily { display: inline-block; margin-left: 6px; font-size: 0.62rem; font-weight: 800; letter-spacing: 0.04em;
  vertical-align: middle; color: #8fd0ff; border: 1px solid #3a6a8a; background: rgba(143,200,255,0.10); border-radius: 4px; padding: 1px 6px; }
.gc-daily.done { color: #6bffb8; border-color: #2f6b50; background: rgba(107,255,184,0.12); }
.sheen-toggle { display: inline-block; margin: 0.4rem 0 0.2rem 0.5rem; background: #1d1140; border: 1px solid #6b5fa0; color: #c9a7ff; border-radius: 999px; padding: 8px 16px; font-weight: 700; cursor: pointer; font-family: inherit; }
.sheen-toggle:hover { border-color: #F5C518; color: #f0e6ff; }
.sheen-toggle.off { border-color: #4f466e; color: #9a8fc0; }
.sheen-note { font-size: 0.72rem; color: #9a8fc0; }
.continue-hero { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; background: linear-gradient(135deg,#1f1147,#34206f); border: 1px solid #6b5fa0; border-radius: 10px; padding: 11px 16px; margin: 0.6rem 0 0; }
.continue-hero .ch-eye { color: #9a7fd4; font-size: 0.72rem; letter-spacing: 1px; text-transform: uppercase; }
.continue-hero .ch-link { background: var(--accent,#F5C518); color: #1a0f3d; font-weight: 800; border-radius: 999px; padding: 7px 16px; text-decoration: none; }
.continue-hero .ch-link:hover { filter: brightness(1.08); }
</style>

{% comment %} Games are grouped into Versus · Learn · Arcade. Cards carry only an icon,
title, and a short cryptic line — the page intentionally says less. {% endcomment %}

<section class="game-cat">
  <h2 class="game-cat-h">♛ Versus</h2>
  <div class="games-grid">
    <a class="game-card" href="{{ '/games/the-gauntlet/' | relative_url }}">
      <div class="game-card-icon">♛</div>
      <div class="game-card-body"><h2>The Gauntlet</h2><p>Climb to the CEO. Real chess.</p></div>
    </a>
  </div>
</section>

<section class="game-cat">
  <h2 class="game-cat-h">♟ Learn</h2>
  <div class="games-grid">
    <a class="game-card" href="{{ '/games/notation-run/' | relative_url }}">
      <div class="game-card-icon">♫</div>
      <div class="game-card-body"><h2>Notation Blitz</h2><p>Squares, on the beat.</p></div>
    </a>
    <a class="game-card" href="{{ '/games/fork-in-the-road/' | relative_url }}">
      <div class="game-card-icon">⚔</div>
      <div class="game-card-body"><h2>Fork in the Road</h2><p>Spot the only move.</p></div>
    </a>
    <a class="game-card" href="{{ '/games/pirc-protocol/' | relative_url }}">
      <div class="game-card-icon">♚</div>
      <div class="game-card-body"><h2>The Pirc Protocol</h2><p>Learn the book by heart.</p></div>
    </a>
    <a class="game-card" href="{{ '/games/shogi-island/' | relative_url }}">
      <div class="game-card-icon">将</div>
      <div class="game-card-body"><h2>Shogi Island</h2><p>Foreign rules. Familiar war.</p></div>
    </a>
    <a class="game-card" href="{{ '/games/reading-room/' | relative_url }}">
      <div class="game-card-icon">あ</div>
      <div class="game-card-body"><h2>The Reading Room</h2><p>Learn to read, one mark at a time.</p></div>
    </a>
    <a class="game-card" href="{{ '/games/clearance-delta/' | relative_url }}">
      <div class="game-card-icon">Δ</div>
      <div class="game-card-body"><h2>Clearance: DELTA</h2><p>Answer, or stay outside.</p></div>
    </a>
    <a class="game-card game-card-dim game-card-locked" id="bf-card" href="{{ '/games/blindfold-puzzles/' | relative_url }}">
      <div class="game-card-icon" id="bf-icon">🔐</div>
      <div class="game-card-body"><h2>Blindfold Puzzles</h2><p>No board. Only your mind.</p>
        <span class="game-tag game-tag-soon" id="bf-tag">🔒 Locked — perfect Fast run in Notation Blitz</span></div>
    </a>
  </div>
</section>

<section class="game-cat">
  <h2 class="game-cat-h">♞ Arcade</h2>
  <div class="games-grid">
    <a class="game-card" href="{{ '/games/sky-run/' | relative_url }}">
      <div class="game-card-icon">♞</div>
      <div class="game-card-body"><h2>Sky Run</h2><p>Climb the falling pieces.</p></div>
    </a>
    <a class="game-card" href="{{ '/games/sand-mine-depths/' | relative_url }}">
      <div class="game-card-icon">⛏</div>
      <div class="game-card-body"><h2>Sand Mine Depths</h2><p>Descend. Don't look back.</p></div>
    </a>
    <a class="game-card" href="{{ '/games/tower-defense/' | relative_url }}">
      <div class="game-card-icon">🏰</div>
      <div class="game-card-body"><h2>Siege on Chess City</h2><p>Hold the gates.</p></div>
    </a>
    <a class="game-card game-card-dim" href="{{ '/games/space-run/' | relative_url }}">
      <div class="game-card-icon">✦</div>
      <div class="game-card-body"><h2>Space Run</h2><p>Outrun the barrage.</p>
        <span class="game-tag game-tag-soon">In Development</span></div>
    </a>
    <a class="game-card" href="{{ '/games/dungeon/' | relative_url }}">
      <div class="game-card-icon">♟</div>
      <div class="game-card-body"><h2>Princess Dungeon</h2><p>Every room is a tactic.</p></div>
    </a>
  </div>
</section>

<section class="game-cat" id="leaderboards-cat">
  <h2 class="game-cat-h">🏆 Leaderboards</h2>
  <p class="lb-intro">Operative standings across every game. <strong>Overall</strong> ranks by total credits; each game tab shows its best runs. Sign in on any game to claim your spot.</p>
  <a class="lb-hof-link" href="{{ '/hall-of-fame/' | relative_url }}" style="display:flex;align-items:center;gap:12px;background:linear-gradient(135deg,#241452,#3a2d1a);border:1px solid #F5C518;border-radius:12px;padding:11px 16px;margin:0 0 0.9rem;text-decoration:none;color:#f0e6ff;box-shadow:0 0 22px -10px #F5C518;">
    <span style="font-size:1.5rem;line-height:1;">🏆</span>
    <span style="flex:1;min-width:0;"><span style="display:block;font-weight:800;color:#fff;">Hall of Fame</span><span style="display:block;font-size:0.78rem;color:#cdbcf2;">Seasons &amp; past champions →</span></span>
  </a>
  <div class="lb-tabs" id="lb-tabs"></div>
  <div id="lb-body"><p class="lb-empty">Loading…</p></div>
</section>

<link rel="stylesheet" href="{{ '/assets/css/pjcc-profile.css' | relative_url }}">
<script src="{{ '/assets/js/pjcc-leaderboard.js' | relative_url }}" defer></script>

<script>
(function () {
  var ok = false;
  try { ok = localStorage.getItem('pjcc.blindfold.unlocked') === '1'; } catch (e) {}
  if (ok) {
    var card = document.getElementById('bf-card');
    if (card) card.classList.remove('game-card-dim', 'game-card-locked');
    var icon = document.getElementById('bf-icon');
    if (icon) icon.textContent = '◻';
    var tag = document.getElementById('bf-tag');
    if (tag) { tag.textContent = '🔓 Unlocked'; tag.className = 'game-tag'; }
  }
})();
</script>

<style>
.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.8rem;
  margin-top: 0.4rem;
}

.game-cat { margin-top: 1.5rem; }
.game-cat-h { font-family: 'Poppins', sans-serif; font-size: 0.76rem; font-weight: 800; letter-spacing: 0.2em;
  text-transform: uppercase; color: #c9a7ff; margin: 0 0 0.3rem; padding-bottom: 5px; border-bottom: 1px solid #3a2a6a; }
.game-cat.gc-hidden { display: none; }

.game-card {
  --accent: #F5C518;          /* per-game accent set by JS below */
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  background: #241451;        /* deeper base so the lilac text reads stronger */
  border: 1px solid var(--accent);
  border-radius: 7px;
  padding: 0.7rem 0.85rem;
  text-decoration: none;
  transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
}

/* The cursor "flashlight" sheen (added site-wide by pjcc-flair.js) washes the
   descriptions out on hover. Dim it well over 25% on game cards so the text
   stays readable — softer light, smaller radius, capped opacity. */
.game-card .flair-tilt-sheen {
  background: radial-gradient(circle at var(--mx, 50%) var(--my, 0%),
              rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0) 46%);
}
.game-card.flair-tilt:hover .flair-tilt-sheen { opacity: 0.7; }

.game-card:hover {
  background: #3d2a7a;
  border-color: var(--accent);
  box-shadow: 0 0 18px -5px var(--accent);
}

.game-card-icon {
  font-size: 1.45rem;
  line-height: 1;
  color: var(--accent);
  flex-shrink: 0;
}

.game-card-body h2 {
  color: #f0e6ff;
  font-size: 0.82rem;
  font-weight: 700;
  margin: 0 0 0.2rem;
}

.game-card-body p {
  color: #d3c5f3;            /* brighter lilac — far higher contrast on the dark purple card */
  font-size: 0.72rem;
  margin: 0 0 0.4rem;
  line-height: 1.4;
}

.game-tag {
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #F5C518;
  border: 1px solid #F5C518;
  border-radius: 4px;
  padding: 1px 6px;
}

/* Not-yet-ready games: grayish-purple wash, dimmed via colour (not opacity/
   filter, so the scroll-reveal animation can't wash the dimming back out) */
.game-card-dim {
  background: linear-gradient(135deg, #26223c, #2f2a4a);
  border-color: #4f466e;
}
.game-card-dim .game-card-icon { color: #7d70a8; }
.game-card-dim h2 { color: #9a8fc0; }
.game-card-dim p  { color: #6f6592; }
.game-card-dim:hover {
  background: linear-gradient(135deg, #2f2a4a, #3a3260);
  border-color: #8a7bc0;
}
.game-card-dim:hover h2 { color: #d8cdf0; }
.game-tag-soon {
  color: #9a8cc4;
  border-color: #5b5080;
}

/* Locked bonus game: grayish-purple, only the lock & key shows. A slow light
   sweep crosses the card and illuminates the hidden text as it passes;
   hovering holds the light on so the full clue is readable. */
.game-card-locked {
  position: relative;
  border-style: dashed;
  background: linear-gradient(135deg, #26223c, #2f2a4a);
}
.game-card-locked::after {
  content: "🔒";
  position: absolute;
  top: 8px;
  right: 10px;
  font-size: 1.1rem;
  opacity: 0.95;
  z-index: 3;
}
.game-card-locked .game-card-icon { color: #F5C518; }
.game-card-locked h2,
.game-card-locked p {
  color: transparent;
  /* dark → feathered mid → bright core → feathered mid → dark, so the light
     ramps in and out gradually instead of snapping on */
  background-image: linear-gradient(100deg,
    #2f2a4a 0%, #2f2a4a 26%,
    #4a4470 36%, #8d83b8 44%, #fff3c4 50%, #8d83b8 56%, #4a4470 64%,
    #2f2a4a 74%, #2f2a4a 100%);
  background-size: 320% 100%;
  background-position: 165% 0;
  -webkit-background-clip: text;
  background-clip: text;
  animation: bf-sweep 6.5s ease-in-out infinite;
}
.game-card-locked p { animation-delay: 0.22s; }
@keyframes bf-sweep {
  0%, 14%   { background-position: 165% 0; }
  72%, 100% { background-position: -65% 0; }
}
.game-card-locked:hover h2,
.game-card-locked:hover p {
  animation: none;
  color: #f0e6ff;
  background: none;
  -webkit-background-clip: border-box;
  background-clip: border-box;
}
@media (prefers-reduced-motion: reduce) {
  .game-card-locked h2,
  .game-card-locked p { animation: none; color: #6f6592; background: none; -webkit-background-clip: border-box; background-clip: border-box; }
}

.game-filters { display: flex; gap: 8px; flex-wrap: wrap; margin: 1rem 0 0.2rem; }
.gf-tab { background: #1d1140; border: 1px solid #4f466e; color: #c9a7ff; border-radius: 999px;
  padding: 7px 16px; font-weight: 700; font-size: 0.85rem; cursor: pointer; font-family: inherit; transition: border-color .12s, background .12s, color .12s; }
.gf-tab:hover { border-color: #8a7bc0; color: #f0e6ff; }
.gf-tab.active { background: #F5C518; border-color: #F5C518; color: #1a0f3d; }
.gf-spacer { flex: 1 1 auto; }
.gf-surprise { background: linear-gradient(135deg,#34206f,#5a3aa0); border: 1px solid #8a7bc0; color: #fff;
  border-radius: 999px; padding: 7px 16px; font-weight: 800; font-size: 0.85rem; cursor: pointer; font-family: inherit; }
.gf-surprise:hover { border-color: #F5C518; box-shadow: 0 0 12px -3px #F5C518; }
.gc-hidden { display: none; }
/* "new" badge + changelog popover */
.game-card { position: relative; }
.gc-new { position: absolute; top: 8px; right: 10px; z-index: 4; background: #6bffb8; color: #042; font-size: 0.62rem;
  font-weight: 900; letter-spacing: 0.06em; border-radius: 999px; padding: 2px 8px; cursor: help; box-shadow: 0 0 10px -2px #6bffb8; }
.gc-pop { position: absolute; top: 28px; right: 8px; z-index: 9; width: 220px; background: #160c33; border: 1px solid #6bffb8;
  border-radius: 8px; padding: 9px 11px; font-size: 0.74rem; color: #d3c5f3; line-height: 1.45; box-shadow: 0 8px 24px rgba(0,0,0,0.5);
  opacity: 0; pointer-events: none; transform: translateY(-4px); transition: opacity .14s, transform .14s; text-align: left; }
.gc-new:hover + .gc-pop, .gc-pop:hover { opacity: 1; transform: translateY(0); pointer-events: auto; }
.gc-pop b { color: #6bffb8; }
.gc-pop .gc-pop-date { color: #9a7fd4; font-size: 0.68rem; }
/* hover mini-preview: a tiny animated glyph loop tinted to the game accent */
.gc-prev { display: inline-flex; gap: 3px; margin-left: 6px; vertical-align: middle; opacity: 0; transition: opacity .15s; }
.game-card:hover .gc-prev { opacity: 1; }
.gc-prev span { font-size: 0.8rem; color: var(--accent); animation: gchop 0.9s ease-in-out infinite; }
.gc-prev span:nth-child(2) { animation-delay: 0.15s; } .gc-prev span:nth-child(3) { animation-delay: 0.3s; }
@keyframes gchop { 0%,100% { transform: translateY(0); opacity: 0.5; } 50% { transform: translateY(-4px); opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .gc-prev span { animation: none; } }
.gc-best { display: inline-block; margin-left: 6px; font-size: 0.68rem; letter-spacing: 0.04em; text-transform: uppercase;
  color: #6bffb8; border: 1px solid #2f6b50; background: rgba(107,255,184,0.10); border-radius: 4px; padding: 2px 7px; vertical-align: middle; }
</style>

<script>
(function () {
  // ---- Per-game accent theming on the cards ----
  var ACCENT = {
    'notation-run': '#F5C518', 'pirc-protocol': '#caa24a', 'fork-in-the-road': '#5be0c0',
    'sand-mine-depths': '#e0b25a', 'clearance-delta': '#ff9fb0',
    'shogi-island': '#d9a441', 'tower-defense': '#ff8fd0', 'blindfold-puzzles': '#c9a7ff',
    'dungeon': '#ff8fd0', 'space-run': '#8fb8ff', 'sky-run': '#7fc8ff', 'the-gauntlet': '#F5C518',
    'reading-room': '#ff6b6b'
  };
  function keyOf(href) { var m = (href || '').match(/\/games\/([^\/]+)\/?/); return m ? m[1] : ''; }
  var cards = document.querySelectorAll('.games-grid .game-card');
  Array.prototype.forEach.call(cards, function (c) {
    var k = keyOf(c.getAttribute('href'));
    if (ACCENT[k] && !c.classList.contains('game-card-dim') && !c.classList.contains('game-card-locked'))
      c.style.setProperty('--accent', ACCENT[k]);
    var cleanName = (function () { var h = c.querySelector('h2'); return h ? h.textContent.trim() : k; })();
    c.addEventListener('click', function () {
      try { localStorage.setItem('pjcc.lastGame', JSON.stringify({ href: c.getAttribute('href'), name: cleanName, k: k })); } catch (e) {}
    });
  });

  // ---- Last game you played (title only) ----
  try {
    var last = JSON.parse(localStorage.getItem('pjcc.lastGame') || 'null');
    var hero = document.getElementById('continue-hero');
    if (last && last.href && hero) {
      var acc = ACCENT[last.k] || '#F5C518';
      hero.innerHTML = '<span class="ch-eye">Last</span>' +
        '<a class="ch-link" href="' + last.href + '" style="--accent:' + acc + '">' + (last.name || 'Resume') + '</a>';
      hero.hidden = false;
    }
  } catch (e) {}

  // ---- "Your best" chip per card (local-first, upgraded from the profile) ----
  // Only shown when there's a real best — no "not played" labels.
  var SCOREKEY = {
    'notation-run': ['notation-run','score'], 'pirc-protocol': ['pirc-protocol','flawless'],
    'fork-in-the-road': ['fork-in-the-road','solved'], 'sand-mine-depths': ['sand-mine-depths','depth'],
    'clearance-delta': ['clearance-delta','score'],
    'shogi-island': ['shogi-island','solved'], 'tower-defense': ['tower-defense','score'],
    'blindfold-puzzles': ['blindfold','solved'], 'sky-run': ['sky-run','score'],
    'the-gauntlet': ['the-gauntlet','cleared'], 'dungeon': ['dungeon','floors'],
    'reading-room': ['reading-room','score']
  };
  function scoreInfo(card) {
    var href = card.getAttribute('href') || '';
    return SCOREKEY[keyOf(href)] || null;
  }
  var chipEls = {};
  Array.prototype.forEach.call(cards, function (c) {
    var info = scoreInfo(c); if (!info) return;
    var body = c.querySelector('.game-card-body'); var h2 = body ? body.querySelector('h2') : null; if (!h2) return;
    var best = (window.PJCC && PJCC.localBest) ? PJCC.localBest(info[0]) : 0;
    if (best > 0) {
      var chip = document.createElement('span');
      chip.className = 'gc-best';
      chip.textContent = '★ best ' + best.toLocaleString() + ' ' + info[1];
      h2.appendChild(document.createTextNode(' ')); h2.appendChild(chip);
      chipEls[info[0]] = { chip: chip, unit: info[1], h2: h2 };
    } else {
      chipEls[info[0]] = { chip: null, unit: info[1], h2: h2 };
    }
  });
  // upgrade chips with the (possibly higher) server best once the profile loads
  if (window.PJCC && PJCC.ready) PJCC.ready.then(function () {
    return PJCC.myStats ? PJCC.myStats() : [];
  }).then(function (stats) {
    (stats || []).forEach(function (s) {
      var e = chipEls[s.game]; if (!e || !(s.best_score > 0)) return;
      if (!e.chip && e.h2) { e.chip = document.createElement('span'); e.chip.className = 'gc-best'; e.h2.appendChild(document.createTextNode(' ')); e.h2.appendChild(e.chip); }
      if (e.chip) { e.chip.textContent = '★ best ' + s.best_score.toLocaleString() + ' ' + e.unit; }
    });
  }).catch(function () {});

  function isDev(c) { return c.classList.contains('game-card-dim') || c.classList.contains('game-card-locked'); }
  function cardKey(c) { return keyOf(c.getAttribute('href') || ''); }

  // ---- recent-change log -> auto "✦ new" badges + changelog popover ----
  var NEW_DAYS = 21;
  var CHANGELOG = {
    'the-gauntlet':      { date: '2026-06-21', note: 'New — play real games of chess up a ladder of opponents to the CEO.' },
    'notation-run':      { date: '2026-06-20', note: 'v3.5 — Daily seeded chart + a global timing-accuracy board.' },
    'pirc-protocol':     { date: '2026-06-22', note: 'v2.2 — four new decks (Ruy López, Sicilian, Queen’s Gambit, Caro-Kann), a Name-That-Opening quiz, and a Transposition Tree view.' },
    'tower-defense':     { date: '2026-06-21', note: 'v2.2 — full chess-relationship synergy matrix (battery/pin/fork/…).' },
    'shogi-island':      { date: '2026-06-20', note: 'v3.1 — real 詰将棋 tsume (mate-in-3/5) and a full 9×9 AI match.' },
    'blindfold-puzzles': { date: '2026-06-20', note: 'v2.1 — Speed-Vision, Describe-only, Daily; Mind’s Eye tiers, blitz clock, replay.' },
    'fork-in-the-road':  { date: '2026-06-21', note: 'v2.1 — accepts any mate-in-one, OK-to-continue, clearer side-to-move.' },
    'sky-run':           { date: '2026-06-15', note: 'v1.0 — new chess-Bloons sky shooter.' },
    'dungeon':           { date: '2026-06-22', note: 'v0.1 — chess-tactics roguelite: piece-rule enemies, threat-reading, stacking move-relics, biome floors. The 2D proving ground for the Godot build.' },
    'reading-room':      { date: '2026-06-22', note: 'New — learn to read Japanese with Kaede: an Anki-style trainer for kana + common kanji, with a combo Quiz mode.' }
  };
  function daysSince(d) { var t = Date.parse(d + 'T00:00:00'); return isNaN(t) ? 9e9 : (Date.now() - t) / 86400000; }
  var PREVIEW = { 'notation-run':['♫','♪','♬'], 'pirc-protocol':['♚','♟','♛'], 'fork-in-the-road':['♞','⚔','♝'],
    'sand-mine-depths':['⛏','💎','♘'], 'clearance-delta':['Δ','✦','▲'], 'shogi-island':['将','歩','王'],
    'tower-defense':['🏰','♜','❄'], 'blindfold-puzzles':['◻','♟','👁'], 'sky-run':['♞','✦','♛'], 'the-gauntlet':['♛','♟','♚'],
    'dungeon':['♟','♞','▟'], 'reading-room':['あ','本','ア'] };

  // games that have a date-seeded "daily" mode, with how to tell if it's done today
  function todayS() { return (window.PJCC && PJCC.dayStamp) ? PJCC.dayStamp() : new Date().toISOString().slice(0,10); }
  function lsField(key, field) { try { var o = JSON.parse(localStorage.getItem(key)); return o ? o[field] : null; } catch (e) { return null; } }
  var DAILY = {
    'blindfold-puzzles':  function () { return lsField('pjcc.bf.daily', 'day') === todayS(); },
    'notation-run':       null,   // has a Daily chart, but it's replayable (no done-lock)
    'fork-in-the-road':   null,   // daily seeded ladder
    'clearance-delta':    null    // daily shared exam
  };

  Array.prototype.forEach.call(cards, function (c) {
    var k = cardKey(c), body = c.querySelector('.game-card-body'), h2 = body ? body.querySelector('h2') : null;
    // hover mini-preview (tiny animated glyph loop tinted to the accent)
    if (h2 && PREVIEW[k]) { var pv = document.createElement('span'); pv.className = 'gc-prev';
      pv.innerHTML = PREVIEW[k].map(function (g) { return '<span>' + g + '</span>'; }).join(''); h2.appendChild(pv); }
    // "Daily" badge for date-seeded games, with a done-today ✓
    if (h2 && DAILY.hasOwnProperty(k)) {
      c.setAttribute('data-daily', '1');
      var done = DAILY[k] ? DAILY[k]() : false;
      var db = document.createElement('span'); db.className = 'gc-daily' + (done ? ' done' : '');
      db.textContent = done ? '📅 done today ✓' : '📅 daily';
      h2.appendChild(document.createTextNode(' ')); h2.appendChild(db);
    }
    // "new" badge if recently bumped, with a changelog popover
    var cl = CHANGELOG[k];
    if (cl && daysSince(cl.date) <= NEW_DAYS && !isDev(c)) {
      c.setAttribute('data-new', '1');
      var badge = document.createElement('span'); badge.className = 'gc-new'; badge.textContent = '✦ NEW';
      var pop = document.createElement('span'); pop.className = 'gc-pop';
      pop.innerHTML = '<b>What’s new</b><br>' + cl.note + '<div class="gc-pop-date">updated ' + cl.date + '</div>';
      c.appendChild(badge); c.appendChild(pop);
    }
  });

  // ---- tab filter (categories stay; empty sections hide themselves) ----
  var original = Array.prototype.slice.call(cards);
  var activeFilter = 'all';
  function matchesFilter(c) {
    if (activeFilter === 'playable') return !isDev(c);
    if (activeFilter === 'dev') return isDev(c);
    if (activeFilter === 'new') return c.getAttribute('data-new') === '1';
    if (activeFilter === 'daily') return c.getAttribute('data-daily') === '1';
    return true;
  }
  function applyFilters() {
    Array.prototype.forEach.call(cards, function (c) {
      c.classList.toggle('gc-hidden', !matchesFilter(c));
    });
    Array.prototype.forEach.call(document.querySelectorAll('.game-cat'), function (sec) {
      if (sec.id === 'leaderboards-cat') return;            // never hide the leaderboards section
      if (!sec.querySelector('.games-grid')) return;
      var any = sec.querySelector('.game-card:not(.gc-hidden)');
      sec.classList.toggle('gc-hidden', !any);
    });
  }
  var tabs = document.querySelectorAll('#game-filters .gf-tab');
  Array.prototype.forEach.call(tabs, function (t) {
    t.addEventListener('click', function () {
      Array.prototype.forEach.call(tabs, function (x) { x.classList.toggle('active', x === t); });
      activeFilter = t.getAttribute('data-filter'); applyFilters();
    });
  });

  // ---- surprise me: jump to a random playable game ----
  var surprise = document.getElementById('gf-surprise');
  if (surprise) surprise.addEventListener('click', function () {
    var playable = original.filter(function (c) { return !isDev(c); });
    if (!playable.length) return;
    var pick = playable[(Math.random() * playable.length) | 0];
    var h = pick.getAttribute('href'); if (h) window.location.href = h;
  });

  // ---- Kill-the-sheen toggle (applies site-wide via pjcc-flair.js) ----
  var btn = document.getElementById('sheen-toggle');
  function isOff() { try { return localStorage.getItem('pjcc.noSheen') === '1'; } catch (e) { return false; } }
  function paint() { if (!btn) return; var off = isOff(); btn.textContent = off ? '✨ Cursor sheen: off' : '✨ Cursor sheen: on'; btn.classList.toggle('off', off); }
  if (btn) {
    paint();
    btn.addEventListener('click', function () {
      var off = !isOff();
      try { localStorage.setItem('pjcc.noSheen', off ? '1' : '0'); } catch (e) {}
      if (off) Array.prototype.forEach.call(document.querySelectorAll('.flair-tilt-sheen'), function (s) { s.remove(); });
      paint();  // turning it back on takes effect on the next page load
    });
  }
})();
</script>

<style>
/* Lore tie-in chip on each game card — a deep-link to the character/location it ties to */
.gc-lore {
  display: inline-flex; align-items: center; gap: 4px; margin-left: 8px;
  font-size: 0.7rem; font-weight: 700; letter-spacing: 0.02em;
  color: #c9a7ff; background: rgba(157,127,212,0.14);
  border: 1px solid #4a2f8a; border-radius: 999px; padding: 2px 9px;
  cursor: pointer; transition: all 0.13s; vertical-align: middle;
}
.gc-lore:hover { color: #1a0f3d; background: #F5C518; border-color: #F5C518; }
.gc-lore-ic { font-style: normal; }
</style>

<script>
(function () {
  // Map each game (by slug in its card href) to the lore file it ties to.
  var LORE = {
    'notation-run':     { label: 'Checker Town', href: '/locations/checker-town/' },
    'sky-run':          { label: 'Chess City',   href: '/locations/chess-city/' },
    'pirc-protocol':    { label: 'Argus',        href: '/characters/argus/' },
    'fork-in-the-road': { label: 'The Rival',    href: '/characters/rival/' },
    'sand-mine-depths': { label: 'The Father',   href: '/characters/father/' },
    'clearance-delta':  { label: 'The Narrator', href: '/characters/narrator/' },
    'shogi-island':     { label: 'Shogi Island', href: '/locations/shogi-island/' },
    'reading-room':     { label: 'Kaede',        href: '/characters/kaede/' },
    'tower-defense':    { label: 'Chess City',   href: '/locations/chess-city/' },
    'blindfold-puzzles':{ label: 'Princess',     href: '/characters/princess/' },
    'dungeon':          { label: 'Princess',     href: '/characters/princess/' },
    'the-gauntlet':     { label: 'The Rival',    href: '/characters/rival/' }
  };
  Array.prototype.forEach.call(document.querySelectorAll('a.game-card'), function (card) {
    var href = card.getAttribute('href') || '';
    var slug = (href.replace(/\/+$/, '').split('/').pop()) || '';
    var lore = LORE[slug];
    if (!lore) return;
    var body = card.querySelector('.game-card-body');
    if (!body) return;
    var chip = document.createElement('span');
    chip.className = 'gc-lore';
    chip.setAttribute('role', 'link');
    chip.setAttribute('tabindex', '0');
    chip.title = 'Lore: ' + lore.label;
    chip.innerHTML = '<span class="gc-lore-ic">📖</span> ' + lore.label;
    function go(e) { e.preventDefault(); e.stopPropagation(); window.location.href = lore.href; }
    chip.addEventListener('click', go);
    chip.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') go(e); });
    var tag = body.querySelector('.game-tag');
    if (tag && tag.parentNode) tag.parentNode.insertBefore(chip, tag.nextSibling);
    else body.appendChild(chip);
  });
})();
</script>
