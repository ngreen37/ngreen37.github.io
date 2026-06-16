---
layout: page
title: Games
permalink: /games/
---

<a class="games-lb-link" href="{{ '/leaderboards/' | relative_url }}">🏆 View the Leaderboards &rarr;</a>

<div class="games-grid">

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
      <h2>Notation Blitz v1.4</h2>
      <p>A coordinate-reading rhythm game. Calls drop on the beat — click the square before it passes the gate.</p>
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
      <h2>The Pirc Protocol</h2>
      <p>A spaced-repetition opening trainer. The Rival drills Princess on real openings — master a line and it returns later; slip and it comes back sooner.</p>
      <span class="game-tag">Playable</span>
    </div>
  </a>

  <a class="game-card" href="{{ '/games/fork-in-the-road/' | relative_url }}">
    <div class="game-card-icon">⚔</div>
    <div class="game-card-body">
      <h2>Fork in the Road</h2>
      <p>Chess tactics puzzles. Spot the fork, pin, skewer, or mate and play the winning move — every solve walks Princess closer to Chess City.</p>
      <span class="game-tag">Playable</span>
    </div>
  </a>

  <a class="game-card" href="{{ '/games/sand-mine-depths/' | relative_url }}">
    <div class="game-card-icon">⛏</div>
    <div class="game-card-body">
      <h2>Sand Mine Depths</h2>
      <p>A knight-movement descent into the Father's mine. Hop deeper, dodge the pieces, and uncover what he saw down in the dark.</p>
      <span class="game-tag">Playable</span>
    </div>
  </a>

  <a class="game-card" href="{{ '/games/cipher/' | relative_url }}">
    <div class="game-card-icon">⊙</div>
    <div class="game-card-body">
      <h2>CIPHER</h2>
      <p>An operative decryption word game. Crack the five-letter code and the intercepted dispatch decrypts itself — chess terms and the Subject Zero file.</p>
      <span class="game-tag">Playable</span>
    </div>
  </a>

  <a class="game-card" href="{{ '/games/clearance-delta/' | relative_url }}">
    <div class="game-card-icon">Δ</div>
    <div class="game-card-body">
      <h2>Clearance: DELTA</h2>
      <p>An operative trivia exam. Answer chess and PJCC questions to climb the clearance ladder — each promotion unredacts a dossier file.</p>
      <span class="game-tag">Playable</span>
    </div>
  </a>

  <a class="game-card" href="{{ '/games/ferry-delayed/' | relative_url }}">
    <div class="game-card-icon">⛴</div>
    <div class="game-card-body">
      <h2>Ferry Delayed</h2>
      <p>A sliding-block logic puzzle. Crates slide like rooks — clear the jammed dock and guide Princess onto the Shogi Island ferry.</p>
      <span class="game-tag">Playable</span>
    </div>
  </a>

  <a class="game-card" href="{{ '/games/shogi-island/' | relative_url }}">
    <div class="game-card-icon">将</div>
    <div class="game-card-body">
      <h2>Shogi Island</h2>
      <p>A shogi piece-movement trainer set across the water. Read each piece and tap every square it can move to — pawns, lances, the gold and silver generals.</p>
      <span class="game-tag">Playable</span>
    </div>
  </a>

</div>

<style>
.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.2rem;
  margin-top: 1.4rem;
}

.game-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  background: #2D1B69;
  border: 1px solid #F5C518;
  border-radius: 8px;
  padding: 1.2rem 1.4rem;
  text-decoration: none;
  transition: border-color 0.15s, background 0.15s;
}

.game-card:hover {
  background: #3d2a7a;
  border-color: #ffd740;
}

.game-card-icon {
  font-size: 2rem;
  line-height: 1;
  color: #F5C518;
  flex-shrink: 0;
}

.game-card-body h2 {
  color: #f0e6ff;
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 0.3rem;
}

.game-card-body p {
  color: #9a7fd4;
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

/* Not-yet-ready games: dimmed, muted border, "in development" tag */
.game-card-dim {
  opacity: 0.55;
  filter: grayscale(0.55);
  border-color: #6b5fa0;
}
.game-card-dim:hover {
  opacity: 0.8;
  filter: grayscale(0.2);
  background: #2D1B69;
  border-color: #8a7bc0;
}
.game-tag-soon {
  color: #b9a8e6;
  border-color: #6b5fa0;
}

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
