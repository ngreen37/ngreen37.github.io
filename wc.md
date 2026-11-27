---
layout: page
title: 2026 World Championships
permalink: /wc/
description: Predict every game of the 2026 World Chess Championship, Gukesh vs Sindarov, and solve a puzzle from each game's position. Free on chesswild.com.
# ⭐ His 11-26 growth picks #1 and #2: predict each game with a free account, and a puzzle from every game's position.
# The match is assets/data/wc2026.json (the clip machine writes it each game day); predictions need
# docs/wc-predictions-setup.md run once in Supabase, and are absent until then.
body_class: theme-hall
---
<div class="wc" id="wc" data-src="{{ '/assets/data/wc2026.json' | relative_url }}" data-bar="{{ '/assets/js/pjcc-profile-bar.js' | relative_url }}">
<p class="wc-match"><span id="wc-p1">Gukesh</span> <span class="wc-vs">vs</span> <span id="wc-p2">Sindarov</span></p>
<p class="wc-score" id="wc-score">Match score</p>
<section class="wc-card wc-predict" id="wc-predict" hidden>
<h2 id="wc-predict-h">Predict the Next Game</h2>
<p class="wc-when" id="wc-when"></p>
<div class="wc-picks" id="wc-picks" role="group" aria-label="Your prediction"></div>
<p class="wc-split" id="wc-split"></p>
<p class="wc-note" id="wc-note"></p>
<div id="pjcc-profile-bar"></div>
</section>
<section class="wc-card wc-puzzles" id="wc-puzzles">
<h2>A Puzzle from Every Game</h2>
<p class="wc-quiet">Each one is a position from the game. Find the best move.</p>
<p class="wc-tally" id="wc-pz-tally" hidden></p>
<div class="wc-puzzle-list" id="wc-puzzle-list"></div>
</section>
<section class="wc-card wc-leaders" id="wc-leaders" hidden>
<h2>Best Predictors</h2>
<ol class="wc-board-list" id="wc-board-list"></ol>
</section>
<section class="wc-card wc-games">
<h2>Every Game</h2>
<ol class="wc-game-list" id="wc-game-list"></ol>
</section>
</div>
<script src="{{ '/assets/js/pjcc-chess.js' | relative_url }}"></script>
<script src="{{ '/assets/js/pjcc-pieces.js' | relative_url }}"></script>
<script src="{{ '/assets/js/pjcc-wc.js' | relative_url }}"></script>
