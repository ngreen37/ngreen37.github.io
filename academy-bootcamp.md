---
layout: page
title: Auston's Bootcamp Basics
permalink: /academy/bootcamp/
own_title: true
---

{% comment %} LESSON 1 of the rebuilt Academy (2026-07-15, Nate: "tear it down and build it
     back up from scratch… it can't just be leveling up games. Build something real").

     This is a REAL teaching board, not a link to a score chase. Move generation is the
     perft-verified shared engine (assets/js/pjcc-chess.js — accuracy above all), so every
     glowing square a student sees is a genuinely legal move for that piece. Pick a piece,
     watch where it can go, tap to walk it around. Progress is local-only (no streaks, no
     pressure — the north star is inviting/warm).

     THE FRAMEWORK HOOK: the board carries data-render="glyph". Today the pieces are Unicode;
     when the studio models the Blender set, the swap-in point is here — same lesson, real
     renders — on the road to the Godot build and the show. {% endcomment %}

<p class="bc-crumb"><a href="{{ '/academy/' | relative_url }}">← The Academy</a> &middot; Lesson 1</p>

<h1 class="page-title">Auston's Bootcamp Basics</h1>

<div class="bc-coach">
  <div class="bc-coach-ico" aria-hidden="true">💣</div>
  <div class="bc-coach-body">
    <div class="bc-coach-who">Auston &middot; your drill sergeant</div>
    <p class="bc-coach-say" id="bc-say">Welcome to Bootcamp. Before you win anything, you gotta know where everybody moves. Pick a piece and I'll show you — then tap the glowing squares to walk it around.</p>
  </div>
</div>

<div class="bc-picker" id="bc-picker" role="tablist" aria-label="Choose a piece to drill"></div>

<div class="bc-stage">
  <div class="bc-board" id="bc-board" data-render="glyph" aria-label="Drill board — tap a glowing square to move the piece"></div>
  <div class="bc-under">
    <span class="bc-moves" id="bc-moves"></span>
    <button class="bc-reset" id="bc-reset" type="button">↻ reset the piece</button>
  </div>
</div>

<div class="bc-prog" id="bc-prog" aria-label="Pieces drilled so far"></div>

<div class="bc-grad" id="bc-grad" hidden>
  <div class="bc-grad-ico" aria-hidden="true">🎖️</div>
  <h2 class="bc-grad-h">That's the whole army.</h2>
  <p class="bc-grad-p" id="bc-grad-p"></p>
  {% comment %} The "free board" CTA was removed 2026-07-15 (Nate: "take out the Free
       Board completely. We'll do it later."). The Free-Play Board page still builds at
       /games/free-play/; restore the one <a> to re-list it. {% endcomment %}
  <div class="bc-grad-cta">
    <a class="bc-btn bc-btn--go" href="{{ '/academy/' | relative_url }}">Back to the Academy ▸</a>
  </div>
</div>

<script src="{{ '/assets/js/pjcc-chess.js' | relative_url }}"></script>
<script>
(function () {
  if (!window.PJCCChess) return;                     // no engine → the page just shows the coach line
  var C = PJCCChess;
  var GLYPH = { P: '♟', N: '♞', B: '♝', R: '♜', Q: '♛', K: '♚' };

  // Each piece is set up on a sensible square. The pawn gets two enemy pawns to capture,
  // so the diagonal strike is demonstrable; the rest stand alone so the pure pattern is
  // unmistakable. Lines are Auston's voice — bright, scrappy, bootcamp.
  var PIECES = [
    { k: 'P', name: 'Pawn',   home: 'e2', extras: [['p', 'd3'], ['p', 'f3']],
      line: "The pawn only marches forward — one square, or two on its very first step. But it captures sideways, one diagonal at a time, and it never retreats. Small, brave, always first over the top." },
    { k: 'N', name: 'Knight', home: 'e4', extras: [],
      line: "The knight jumps an L — two one way, one the other — and hops clean over anyone in its path. The only piece that won't move in a straight line. That's what makes it sneaky." },
    { k: 'B', name: 'Bishop', home: 'e4', extras: [],
      line: "The bishop rides the diagonals as far as the road is clear. Here's the trick: it's born on one color and stays there for life. A light bishop never once touches a dark square." },
    { k: 'R', name: 'Rook',   home: 'e4', extras: [],
      line: "The rook rolls in straight lines — up, down, across — as far as nothing's blocking it. Two rooks working side by side are a wall that moves." },
    { k: 'Q', name: 'Queen',  home: 'e4', extras: [],
      line: "The queen is a rook and a bishop in one body: any straight line, any distance. Strongest piece you own — so don't go throwing her away cheap." },
    { k: 'K', name: 'King',   home: 'e4', extras: [],
      line: "The king steps one square, any direction. Slow — but he IS the game. Lose him and it's over, so keep him tucked away safe." }
  ];

  var boardEl = document.getElementById('bc-board');
  var pickerEl = document.getElementById('bc-picker');
  var sayEl = document.getElementById('bc-say');
  var movesEl = document.getElementById('bc-moves');
  var progEl = document.getElementById('bc-prog');
  var gradEl = document.getElementById('bc-grad');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var SAVE = 'pjcc.academy.bootcamp';
  var learned = {}; try { learned = JSON.parse(localStorage.getItem(SAVE)) || {}; } catch (e) {}
  function save() { try { localStorage.setItem(SAVE, JSON.stringify(learned)); } catch (e) {} }

  var board = new Array(64).fill(''), current = null, curSq = -1, moveCache = {}, moveCount = 0;

  // Ask the shared engine for this piece's legal moves; one dot per destination square
  // (queen kept for a promotion square, so a promoting pawn resolves to a Queen).
  function movesFor(b, from) {
    var col = C.colorOf(b[from]) || 'w';
    var S = { b: b.slice(), turn: col, cast: { K: false, Q: false, k: false, q: false }, ep: -1, half: 0, full: 1 };
    var lm = C.legalMoves(S), out = {};
    for (var i = 0; i < lm.length; i++) {
      var m = lm[i]; if (m.from !== from) continue;
      if (!(m.to in out) || (m.promo && String(m.promo).toUpperCase() === 'Q')) out[m.to] = m;
    }
    return out;
  }

  function say(t) { sayEl.textContent = t; sayEl.classList.remove('bc-flash'); void sayEl.offsetWidth; sayEl.classList.add('bc-flash'); }

  function selectPiece(def, keepSay) {
    current = def;
    board = new Array(64).fill('');
    var hs = C.sqFromName(def.home);
    board[hs] = def.k;
    def.extras.forEach(function (e) { board[C.sqFromName(e[1])] = e[0]; });
    curSq = hs; moveCount = 0;
    moveCache = movesFor(board, curSq);
    if (!keepSay) say(def.line);
    renderPicker(); render(); updateMoves();
  }

  function updateMoves() {
    var opts = Object.keys(moveCache).length;
    movesEl.textContent = moveCount === 0
      ? opts + (opts === 1 ? ' square' : ' squares') + ' it can go'
      : moveCount + (moveCount === 1 ? ' move' : ' moves') + ' made';
  }

  function render() {
    var frag = document.createDocumentFragment();
    for (var idx = 0; idx < 64; idx++) {
      var r = (idx / 8) | 0, f = idx % 8;
      var sq = document.createElement('div');
      sq.className = 'bc-sq ' + (((r + f) & 1) ? 'dk' : 'lt');
      var pc = board[idx];
      if (pc) {
        var sp = document.createElement('span');
        sp.className = 'bc-pc ' + (pc <= 'Z' ? 'w' : 'b');
        sp.textContent = GLYPH[pc.toUpperCase()];
        if (idx === curSq && moveCount > 0 && !reduce) sp.classList.add('land');
        sq.appendChild(sp);
      }
      if (idx in moveCache) {
        sq.classList.add(board[idx] ? 'cap' : 'go');
        sq.setAttribute('role', 'button'); sq.tabIndex = 0;
        sq.setAttribute('aria-label', (board[idx] ? 'capture on ' : 'move to ') + C.nameFromSq(idx));
        sq.dataset.to = idx;
      }
      if (idx === curSq) sq.classList.add('from');
      if (f === 0) { var rn = document.createElement('i'); rn.className = 'bc-rank'; rn.textContent = 8 - r; sq.appendChild(rn); }
      if (r === 7) { var fl = document.createElement('i'); fl.className = 'bc-file'; fl.textContent = String.fromCharCode(97 + f); sq.appendChild(fl); }
      frag.appendChild(sq);
    }
    boardEl.innerHTML = ''; boardEl.appendChild(frag);
  }

  function applyMove(to) {
    var mv = moveCache[to]; if (!mv) return;
    var pieceLetter = board[curSq];
    var cap = board[to] !== '';
    var promo = !!mv.promo;
    board[curSq] = '';
    board[to] = promo ? 'Q' : pieceLetter;
    curSq = to; moveCount++;
    var firstTime = !learned[current.k];
    learned[current.k] = true; save();

    if (promo) say("Promotion! Walk a pawn all the way to the far rank and it turns into a Queen. She rises.");
    else if (cap) say("Boom — that's a capture. You land on the square and knock the other piece clean off it.");
    else if (firstTime) say("There you go. Feel how it moves? Walk it around some more, or grab another piece.");

    moveCache = movesFor(board, curSq);
    render(); updateMoves(); checkGrad();
    if (Object.keys(moveCache).length === 0) {
      say("Nowhere left to go from there — I'll set it back for you.");
      setTimeout(function () { selectPiece(current, true); }, 950);
    }
  }

  function renderPicker() {
    pickerEl.innerHTML = '';
    PIECES.forEach(function (def) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'bc-chip' + (current && current.k === def.k ? ' cur' : '') + (learned[def.k] ? ' got' : '');
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', current && current.k === def.k ? 'true' : 'false');
      b.innerHTML = '<span class="bc-chip-g">' + GLYPH[def.k] + '</span><span class="bc-chip-n">' + def.name + '</span>' +
        (learned[def.k] ? '<span class="bc-chip-ok">✓</span>' : '');
      b.addEventListener('click', function () { selectPiece(def); });
      pickerEl.appendChild(b);
    });
  }

  function renderProg() {
    progEl.innerHTML = '';
    PIECES.forEach(function (def) {
      var p = document.createElement('span');
      p.className = 'bc-pip' + (learned[def.k] ? ' got' : '');
      p.textContent = GLYPH[def.k];
      p.title = def.name + (learned[def.k] ? ' ✓' : '');
      progEl.appendChild(p);
    });
    var n = PIECES.filter(function (d) { return learned[d.k]; }).length;
    var label = document.createElement('b');
    label.className = 'bc-pip-label';
    label.textContent = n + ' / 6 pieces drilled';
    progEl.appendChild(label);
  }

  function checkGrad() {
    renderPicker(); renderProg();
    if (PIECES.every(function (d) { return learned[d.k]; }) && gradEl.hidden) {
      document.getElementById('bc-grad-p').textContent =
        "You know where every piece goes now — and that's the ground under everything else you'll ever learn here. Next up: reading the board out loud, square by square, with Crockett. He's still off fetching the ball, so it's coming soon.";
      gradEl.hidden = false;
      if (!reduce) gradEl.classList.add('bc-rise');
    }
  }

  boardEl.addEventListener('click', function (e) {
    var t = e.target.closest('[data-to]'); if (t) applyMove(+t.dataset.to);
  });
  boardEl.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var t = e.target.closest('[data-to]'); if (t) { e.preventDefault(); applyMove(+t.dataset.to); }
  });
  document.getElementById('bc-reset').addEventListener('click', function () { if (current) selectPiece(current, true); });

  renderProg();
  selectPiece(PIECES[0]);
})();
</script>

<style>
.bc-crumb { font-size: 0.8rem; color: #9a7fd4; margin: 0 0 4px; }
.bc-crumb a { color: #c9a7ff; text-decoration: none; }
.bc-crumb a:hover { color: #F5C518; }

/* own_title: the sky banner sits under the crumb; undo the card-top geometry the shared rule assumes */
.page-body > .page-title { margin: 10px -44px 18px; border-radius: 0; }
@media (max-width: 700px) { .page-body > .page-title { margin: 8px -20px 14px; } }

/* Auston, speaking */
.bc-coach { display: flex; gap: 12px; align-items: flex-start; margin: 0 0 14px;
  background: linear-gradient(135deg, #241a4d, #2d1b69); border: 1px solid rgba(245,197,24,0.3);
  border-left: 4px solid #ffd36b; border-radius: var(--r-md, 12px); padding: 12px 15px; }
.bc-coach-ico { font-size: 30px; line-height: 1; flex: 0 0 auto; }
.bc-coach-who { font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.1em; color: #ffd36b; font-weight: 700; margin-bottom: 3px; }
.bc-coach-say { margin: 0; color: #f0e6ff; font-size: 0.96rem; line-height: 1.55; }
.bc-flash { animation: bcFlash 0.5s ease; }
@keyframes bcFlash { 0% { color: #ffd740; } 100% { color: #f0e6ff; } }

/* the six drills */
.bc-picker { display: flex; flex-wrap: wrap; gap: 7px; margin: 0 0 14px; }
.bc-chip { display: inline-flex; align-items: center; gap: 7px; background: rgba(45,27,105,0.5);
  border: 1px solid var(--edge-soft, #3a2a6a); border-radius: 999px; padding: 6px 13px; cursor: pointer;
  color: #c9a7ff; font-family: inherit; font-size: 0.86rem; transition: border-color 0.15s, background 0.15s, color 0.15s; }
.bc-chip-g { font-size: 1.15rem; line-height: 1; }
.bc-chip:hover { border-color: #ffd36b; color: #f0e6ff; }
.bc-chip.cur { background: rgba(245,197,24,0.14); border-color: #F5C518; color: #fff; }
.bc-chip.got .bc-chip-n { color: #9bffd0; }
.bc-chip-ok { color: #6bffb8; font-weight: 800; }

/* the board */
.bc-stage { max-width: 460px; margin: 0 auto; }
.bc-board { display: grid; grid-template-columns: repeat(8, 1fr); grid-template-rows: repeat(8, 1fr);
  aspect-ratio: 1; width: 100%; container-type: inline-size;
  border: 3px solid #6b5fa0; border-radius: 8px; overflow: hidden; box-shadow: 0 12px 40px rgba(0,0,0,0.45);
  touch-action: manipulation; }
.bc-sq { position: relative; display: flex; align-items: center; justify-content: center; }
.bc-sq.lt { background: #efe6d2; }
.bc-sq.dk { background: #b9986a; }
.bc-pc { font-size: 32px; font-size: 9cqw; line-height: 1; user-select: none; position: relative; z-index: 1; }
.bc-pc.w { color: #fbfbfd; text-shadow: 0 0 1px #000, 0 1px 2px rgba(0,0,0,0.55), 0 0 3px rgba(0,0,0,0.4); }
.bc-pc.b { color: #241436; text-shadow: 0 1px 0 rgba(255,255,255,0.35); }
.bc-pc.land { animation: bcLand 0.28s ease; }
@keyframes bcLand { 0% { transform: translateY(-16%) scale(1.16); } 100% { transform: none; } }
.bc-sq.from::before { content: ''; position: absolute; inset: 0; background: rgba(245,197,24,0.16); z-index: 0; }
.bc-sq.go { cursor: pointer; }
.bc-sq.go::after { content: ''; width: 26%; height: 26%; border-radius: 50%;
  background: rgba(60,40,120,0.5); box-shadow: 0 0 0 2px rgba(245,197,24,0.75); }
.bc-sq.go:hover::after, .bc-sq.go:focus::after { background: rgba(245,197,24,0.85); }
.bc-sq.cap { cursor: pointer; box-shadow: inset 0 0 0 4px rgba(245,197,24,0.85); }
.bc-sq:focus { outline: 2px solid #F5C518; outline-offset: -2px; }
.bc-rank, .bc-file { position: absolute; font-size: 9px; font-style: normal; font-family: 'Share Tech Mono', monospace; color: rgba(40,20,10,0.5); }
.bc-sq.dk .bc-rank, .bc-sq.dk .bc-file { color: rgba(255,255,255,0.5); }
.bc-rank { top: 2px; left: 3px; }
.bc-file { bottom: 1px; right: 3px; }

.bc-under { display: flex; align-items: center; justify-content: space-between; margin-top: 9px; gap: 10px; }
.bc-moves { font-size: 0.8rem; color: #9a7fd4; font-family: 'Share Tech Mono', monospace; }
.bc-reset { background: transparent; border: 1px solid #4a3a86; color: #c9a7ff; border-radius: 999px;
  padding: 6px 12px; font-size: 0.78rem; cursor: pointer; font-family: inherit; }
.bc-reset:hover { border-color: #F5C518; color: #F5C518; }

/* the roll call of what you've drilled */
.bc-prog { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin: 18px auto 0; max-width: 460px; justify-content: center; }
.bc-pip { width: 26px; height: 26px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%;
  background: rgba(20,12,45,0.6); border: 1px solid #3a2a6a; color: #7d6bb0; font-size: 14px; }
.bc-pip.got { background: #6bffb8; border-color: #6bffb8; color: #0a2a1c; }
.bc-pip-label { margin-left: 6px; font-size: 0.78rem; color: #c9a7ff; font-family: 'Share Tech Mono', monospace; font-weight: 700; }

/* graduation */
.bc-grad { margin: 22px auto 0; max-width: 520px; text-align: center;
  background: linear-gradient(135deg, #3a2c07, #5c4708); border: 1px solid rgba(245,197,24,0.6);
  border-radius: var(--r-md, 12px); padding: 20px 18px; box-shadow: 0 0 34px rgba(245,197,24,0.15); }
.bc-grad-ico { font-size: 38px; }
.bc-grad-h { color: #ffd740; margin: 6px 0 8px; font-size: 1.3rem; }
.bc-grad-p { color: #f0e6cf; font-size: 0.94rem; line-height: 1.6; margin: 0 0 14px; }
.bc-grad-cta { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
.bc-btn { text-decoration: none; border-radius: 999px; padding: 9px 16px; font-weight: 700; font-size: 0.86rem;
  border: 1px solid #caa84a; color: #e6d28a; }
.bc-btn:hover { border-color: #ffd740; color: #fff; }
.bc-btn--go { background: #F5C518; color: #1a0f3d; border-color: #F5C518; }
.bc-btn--go:hover { background: #ffd740; color: #1a0f3d; }
.bc-rise { animation: bcRise 0.5s ease; }
@keyframes bcRise { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: none; } }

@media (pointer: coarse) { .bc-reset { padding: 10px 14px; } .bc-chip { padding: 9px 14px; } }
@media (prefers-reduced-motion: reduce) { .bc-flash, .bc-pc.land, .bc-rise { animation: none; } }
</style>
