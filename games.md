---
layout: page
title: Games
permalink: /games/
---

<div class="games-grid">

  <a class="game-card" href="{{ '/games/dungeon/' | relative_url }}">
    <div class="game-card-icon">♟</div>
    <div class="game-card-body">
      <h2>Princess Dungeon</h2>
      <p>A chessboard dungeon crawler. Clear each room. Reach the exit.</p>
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
</style>
