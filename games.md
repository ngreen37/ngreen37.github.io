---
layout: page
title: Games
permalink: /games/
---

<div id="bounty-banner" class="bounty-banner" hidden></div>

<a class="games-lb-link" href="{{ '/leaderboards/' | relative_url }}">🏆 View the Leaderboards &rarr;</a>
<button id="sheen-toggle" class="sheen-toggle" type="button">✨ Cursor sheen: on</button>

<div id="continue-hero" class="continue-hero" hidden></div>

<div class="game-filters" id="game-filters">
  <button class="gf-tab active" data-filter="all">All</button>
  <button class="gf-tab" data-filter="playable">▶ Playable</button>
  <button class="gf-tab" data-filter="dev">🛠 In Development</button>
</div>

<script>
(function () {
  var NAMES = { 'cipher': 'CIPHER', 'clearance-delta': 'Clearance: DELTA', 'notation-run': 'Notation Blitz', 'fork-in-the-road': 'Fork in the Road', 'sand-mine-depths': 'Sand Mine Depths', 'pirc-protocol': 'The Pirc Protocol', 'shogi-island': 'Shogi Island', 'tower-defense': 'Siege on Chess City', 'sky-run': 'Sky Run' };
  function show() {
    if (!window.PJCC || !PJCC.bountyGame) return;
    var key = PJCC.bountyGame();
    var b = document.getElementById('bounty-banner');
    if (!b) return;
    b.innerHTML = '🎯 <strong>This week’s bounty:</strong> ' + (NAMES[key] || key) + ' — <strong>double credits</strong> all week!';
    b.hidden = false;
  }
  if (window.PJCC && PJCC.ready) PJCC.ready.then(show); else document.addEventListener('DOMContentLoaded', show);
})();
</script>

<style>
.bounty-banner { background: linear-gradient(135deg,#2a1a5e,#3a2570); border: 1px solid #F5C518; border-radius: 10px; padding: 11px 16px; margin: 0 0 1rem; color: #f0e6ff; font-size: 0.92rem; }
.bounty-banner strong { color: #F5C518; }
.sheen-toggle { display: inline-block; margin: 0.4rem 0 0.2rem 0.5rem; background: #1d1140; border: 1px solid #6b5fa0; color: #c9a7ff; border-radius: 999px; padding: 8px 16px; font-weight: 700; cursor: pointer; font-family: inherit; }
.sheen-toggle:hover { border-color: #F5C518; color: #f0e6ff; }
.sheen-toggle.off { border-color: #4f466e; color: #9a8fc0; }
.continue-hero { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; background: linear-gradient(135deg,#1f1147,#34206f); border: 1px solid #6b5fa0; border-radius: 10px; padding: 11px 16px; margin: 0.6rem 0 0; }
.continue-hero .ch-eye { color: #9a7fd4; font-size: 0.8rem; letter-spacing: 1px; text-transform: uppercase; }
.continue-hero .ch-link { background: var(--accent,#F5C518); color: #1a0f3d; font-weight: 800; border-radius: 999px; padding: 7px 16px; text-decoration: none; }
.continue-hero .ch-link:hover { filter: brightness(1.08); }
</style>

<div class="games-grid">

  <a class="game-card" href="{{ '/daily/' | relative_url }}">
    <div class="game-card-icon">📡</div>
    <div class="game-card-body">
      <h2>Daily Dispatch</h2>
      <p>One Dead Drop intercept a day — the same coded word for every operative. Crack it in as few tries as you can, climb today's board, and keep your dispatch streak alive. New drop at midnight.</p>
      <span class="game-tag">Daily</span>
    </div>
  </a>

  <a class="game-card game-card-dim" href="{{ '/games/dungeon/' | relative_url }}">
    <div class="game-card-icon">♟</div>
    <div class="game-card-body">
      <h2>Princess Dungeon</h2>
      <p>A chessboard dungeon crawler. Clear each room. Reach the exit.</p>
      <span class="game-tag game-tag-soon">In Development</span>
    </div>
  </a>

  <a class="game-card" href="{{ '/games/notation-run/' | relative_url }}">
    <div class="game-card-icon">♫</div>
    <div class="game-card-body">
      <h2>Notation Blitz v3.4</h2>
      <p>A rhythm drill for reading chess coordinates at speed — Endless ramp, a free BPM slider, a board-flipped 2-Tone "Black side" mode, and a new ⟲ Extreme mode where the board keeps flipping White↔Black mid-run.</p>
      <span class="game-tag">Playable</span>
    </div>
  </a>

  <a class="game-card" href="{{ '/games/sky-run/' | relative_url }}">
    <div class="game-card-icon">♞</div>
    <div class="game-card-body">
      <h2>Sky Run v1.0</h2>
      <p>A chess-Bloons sky shooter. Princess flies town to town toward Chess City, popping the pieces that fall — grab Bishop/Knight/Queen power-ups, charge the King's pawn-summon, and break each region's boss. A secret office waits at the very top.</p>
      <span class="game-tag">Playable</span>
    </div>
  </a>

  <a class="game-card game-card-dim" href="{{ '/games/space-run/' | relative_url }}">
    <div class="game-card-icon">✦</div>
    <div class="game-card-body">
      <h2>Space Run</h2>
      <p>A Star Fox-style chess runner. Skate across the pieces the CEO throws at you and ride each track to its end.</p>
      <span class="game-tag game-tag-soon">In Development</span>
    </div>
  </a>

  <a class="game-card" href="{{ '/games/pirc-protocol/' | relative_url }}">
    <div class="game-card-icon">♚</div>
    <div class="game-card-body">
      <h2>The Pirc Protocol v2.1</h2>
      <p>An opening library. Learn real openings by playing the book moves — run a whole line, drill spot-cards, or face a boss exam mixing every variation. ECO codes + master-game citations, PGN export, and a new ☠ Blunder Traps deck of machine-verified forced mates.</p>
      <span class="game-tag">Playable</span>
    </div>
  </a>

  <a class="game-card" href="{{ '/games/fork-in-the-road/' | relative_url }}">
    <div class="game-card-icon">⚔</div>
    <div class="game-card-body">
      <h2>Fork in the Road v2.0</h2>
      <p>Adaptive chess-tactics puzzles — forks, skewers, and mates that sharpen as you solve and ease off if you slip. Region-gate bosses, a daily seeded ladder, and a motif card after every solve so you actually learn the pattern.</p>
      <span class="game-tag">Playable</span>
    </div>
  </a>

  <a class="game-card" href="{{ '/games/sand-mine-depths/' | relative_url }}">
    <div class="game-card-icon">⛏</div>
    <div class="game-card-body">
      <h2>Sand Mine Depths v2.2</h2>
      <p>A knight-movement descent into the Father's mine. Grab relics in the shrinking torchlight, outwit Subject Zero, and bank gold at the surface camp for lasting gear — or take on the perk-free weekly race.</p>
      <span class="game-tag">Playable</span>
    </div>
  </a>

  <a class="game-card" href="{{ '/games/cipher/' | relative_url }}">
    <div class="game-card-icon">⊙</div>
    <div class="game-card-body">
      <h2>CIPHER v1.4</h2>
      <p>An operative decryption word game. Crack the five-letter code and the dispatch decrypts itself. Pick a pack (Openings · Endgame · Field Codes), spend 🔑 hint tokens, chase a guesses-and-time score, and unlock the weekly cryptogram.</p>
      <span class="game-tag">Playable</span>
    </div>
  </a>

  <a class="game-card" href="{{ '/games/clearance-delta/' | relative_url }}">
    <div class="game-card-icon">Δ</div>
    <div class="game-card-body">
      <h2>Clearance: DELTA v1.3</h2>
      <p>An operative trivia exam in the Invitational hall. Chess, World Champions, board-diagram puzzles, and PJCC files — climb the clearance ladder. Category focus runs, a ⚡ lightning round, and a daily shared exam.</p>
      <span class="game-tag">Playable</span>
    </div>
  </a>

  <a class="game-card" href="{{ '/games/shogi-island/' | relative_url }}">
    <div class="game-card-icon">将</div>
    <div class="game-card-body">
      <h2>Shogi Island v3.1</h2>
      <p>Learn shogi by solving — read the pieces, capture, give check, then real 詰将棋 tsume (forced mate-in-3 and mate-in-5). The guide begins in Japanese and decodes as you go; getting far unlocks Catch the Lion and a full 9×9 match vs the island AI.</p>
      <span class="game-tag">Playable</span>
    </div>
  </a>

  <a class="game-card" href="{{ '/games/tower-defense/' | relative_url }}">
    <div class="game-card-icon">🏰</div>
    <div class="game-card-body">
      <h2>Siege on Chess City v2.0</h2>
      <p>A four-front tower-defense campaign — now with an ♾ Endless survival mode + global wave board, a ❄ Frost Knight, map mutators for bonus Crowns, and bosses that summon adds and teleport. Place a free-roaming Bishop Sniper, recruit Louie the Bomber, and spend City Crowns on permanent upgrades.</p>
      <span class="game-tag">Playable</span>
    </div>
  </a>

  <a class="game-card game-card-dim game-card-locked" id="bf-card" href="{{ '/games/blindfold-puzzles/' | relative_url }}">
    <div class="game-card-icon" id="bf-icon">🔐</div>
    <div class="game-card-body">
      <h2>Blindfold Puzzles v2.1</h2>
      <p>A blank board and a clue — find the winning move in your head. Adaptive puzzles with ⚡ Speed-Vision, ⌨ Describe-only, and a 📅 Daily shared position; solve enough to unlock <strong>The Mind's Eye</strong> — a full blind game vs the CEO with difficulty tiers, a blitz clock, a purist trophy, and a replay. Hidden bonus game.</p>
      <span class="game-tag game-tag-soon" id="bf-tag">🔒 Locked — perfect Fast run in Notation Blitz</span>
    </div>
  </a>

</div>

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
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.2rem;
  margin-top: 1.4rem;
}

.game-card {
  --accent: #F5C518;          /* per-game accent set by JS below */
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  background: #241451;        /* deeper base so the lilac text reads stronger */
  border: 1px solid var(--accent);
  border-radius: 8px;
  padding: 1.2rem 1.4rem;
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
  font-size: 2rem;
  line-height: 1;
  color: var(--accent);
  flex-shrink: 0;
}

.game-card-body h2 {
  color: #f0e6ff;
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 0.3rem;
}

.game-card-body p {
  color: #d3c5f3;            /* brighter lilac — far higher contrast on the dark purple card */
  font-size: 0.85rem;
  margin: 0 0 0.6rem;
  line-height: 1.5;
}

.game-tag {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #F5C518;
  border: 1px solid #F5C518;
  border-radius: 4px;
  padding: 2px 7px;
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
.game-card.gc-hidden { display: none; }
.gc-best { display: inline-block; margin-left: 6px; font-size: 0.68rem; letter-spacing: 0.04em; text-transform: uppercase;
  color: #6bffb8; border: 1px solid #2f6b50; background: rgba(107,255,184,0.10); border-radius: 4px; padding: 2px 7px; vertical-align: middle; }
.gc-best.none { color: #9a8fc0; border-color: #4f466e; background: transparent; }

.games-lb-link {
  display: inline-block;
  margin: 0.4rem 0 0.2rem;
  background: #2D1B69;
  border: 1px solid #F5C518;
  border-radius: 999px;
  padding: 9px 20px;
  color: #F5C518;
  font-weight: 800;
  text-decoration: none;
  transition: background 0.15s, color 0.15s;
}
.games-lb-link:hover { background: #F5C518; color: #1a0f3d; }
</style>

<script>
(function () {
  // ---- Per-game accent theming on the cards ----
  var ACCENT = {
    'notation-run': '#F5C518', 'pirc-protocol': '#caa24a', 'fork-in-the-road': '#5be0c0',
    'sand-mine-depths': '#e0b25a', 'cipher': '#2ecc71', 'clearance-delta': '#ff9fb0',
    'shogi-island': '#d9a441', 'tower-defense': '#ff8fd0', 'blindfold-puzzles': '#c9a7ff',
    'dungeon': '#9a8fc0', 'space-run': '#8fb8ff', 'sky-run': '#7fc8ff'
  };
  function keyOf(href) { var m = (href || '').match(/\/games\/([^\/]+)\/?/); return m ? m[1] : ''; }
  var cards = document.querySelectorAll('.games-grid .game-card');
  Array.prototype.forEach.call(cards, function (c) {
    var k = keyOf(c.getAttribute('href'));
    if (ACCENT[k] && !c.classList.contains('game-card-dim') && !c.classList.contains('game-card-locked'))
      c.style.setProperty('--accent', ACCENT[k]);
    c.addEventListener('click', function () {
      var h2 = c.querySelector('h2'); var name = h2 ? h2.textContent : k;
      try { localStorage.setItem('pjcc.lastGame', JSON.stringify({ href: c.getAttribute('href'), name: name, k: k })); } catch (e) {}
    });
  });

  // ---- Continue where you left off ----
  try {
    var last = JSON.parse(localStorage.getItem('pjcc.lastGame') || 'null');
    var hero = document.getElementById('continue-hero');
    if (last && last.href && hero) {
      var acc = ACCENT[last.k] || '#F5C518';
      hero.innerHTML = '<span class="ch-eye">▶ Continue where you left off</span>' +
        '<a class="ch-link" href="' + last.href + '" style="--accent:' + acc + '">' + (last.name || 'Last game') + ' &rarr;</a>';
      hero.hidden = false;
    }
  } catch (e) {}

  // ---- "Your best" chip per card (local-first, upgraded from the profile) ----
  // slug (href) -> [scoreKey, unit]
  var SCOREKEY = {
    'notation-run': ['notation-run','score'], 'pirc-protocol': ['pirc-protocol','flawless'],
    'fork-in-the-road': ['fork-in-the-road','solved'], 'sand-mine-depths': ['sand-mine-depths','depth'],
    'cipher': ['cipher','score'], 'clearance-delta': ['clearance-delta','score'],
    'shogi-island': ['shogi-island','solved'], 'tower-defense': ['tower-defense','score'],
    'blindfold-puzzles': ['blindfold','solved'], 'sky-run': ['sky-run','score']
  };
  function scoreInfo(card) {
    var href = card.getAttribute('href') || '';
    if (href.indexOf('/daily/') >= 0) return ['daily-dispatch','score'];
    return SCOREKEY[keyOf(href)] || null;
  }
  var chipEls = {};
  Array.prototype.forEach.call(cards, function (c) {
    var info = scoreInfo(c); if (!info) return;
    var body = c.querySelector('.game-card-body'); var h2 = body ? body.querySelector('h2') : null; if (!h2) return;
    var best = (window.PJCC && PJCC.localBest) ? PJCC.localBest(info[0]) : 0;
    var chip = document.createElement('span');
    chip.className = 'gc-best' + (best > 0 ? '' : ' none');
    chip.textContent = best > 0 ? ('★ best ' + best + ' ' + info[1]) : 'not played';
    h2.appendChild(document.createTextNode(' ')); h2.appendChild(chip);
    chipEls[info[0]] = { chip: chip, unit: info[1] };
  });
  // upgrade chips with the (possibly higher) server best once the profile loads
  if (window.PJCC && PJCC.ready) PJCC.ready.then(function () {
    return PJCC.myStats ? PJCC.myStats() : [];
  }).then(function (stats) {
    (stats || []).forEach(function (s) {
      var e = chipEls[s.game]; if (!e) return;
      if ((s.best_score || 0) > 0) { e.chip.className = 'gc-best'; e.chip.textContent = '★ best ' + s.best_score + ' ' + e.unit; }
    });
  }).catch(function () {});

  // ---- Playable / In-Development filter tabs ----
  function isDev(c) { return c.classList.contains('game-card-dim') || c.classList.contains('game-card-locked'); }
  var tabs = document.querySelectorAll('#game-filters .gf-tab');
  Array.prototype.forEach.call(tabs, function (t) {
    t.addEventListener('click', function () {
      Array.prototype.forEach.call(tabs, function (x) { x.classList.toggle('active', x === t); });
      var f = t.getAttribute('data-filter');
      Array.prototype.forEach.call(cards, function (c) {
        var show = f === 'all' || (f === 'dev' ? isDev(c) : !isDev(c));
        c.classList.toggle('gc-hidden', !show);
      });
    });
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
