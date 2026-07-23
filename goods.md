---
layout: page
title: Merch
permalink: /goods/
brand: mcpuppy
---

<div class="goods-head">
  <h1 class="goods-title">Merch</h1>
  <p class="goods-sub"><span class="goods-soon">Not ready yet</span> — months away.</p>
</div>

<!-- ── The Goal Card ────────────────────────────────────────── -->
<section class="goods-section">
  <div class="goods-cards" aria-hidden="true">
    <div class="goal-card gc-a">
      <span class="gc-corner">♛</span>
      <span class="gc-char">♛</span>
      <span class="gc-goal">your goal<br>goes here</span>
      <span class="gc-creed">follow the dog</span>
    </div>
    <div class="goal-card gc-b">
      <span class="gc-corner">🦊</span>
      <span class="gc-char">🦊</span>
      <span class="gc-goal">touch it.<br>re-anchor.</span>
      <span class="gc-creed">follow the dog</span>
    </div>
    <div class="goal-card gc-c">
      <span class="gc-corner">♚</span>
      <span class="gc-char">♚</span>
      <span class="gc-goal">5% strategy<br>95% mindset</span>
      <span class="gc-creed">follow the dog</span>
    </div>
  </div>
  <div class="goods-copy">
    <h2>The Goal Card</h2>
  </div>
</section>

<!-- ── The Stationery ───────────────────────────────────────── -->
<section class="goods-section goods-section--alt">
  <div class="goods-copy">
    <h2>The Stationery</h2>
  </div>
  <div class="goods-stationery" aria-hidden="true">
    <div class="stat-note">follow the dog<span class="stat-note-line"></span><span class="stat-note-line short"></span></div>
    <div class="stat-sheet">
      <span class="stat-creed">follow the dog</span>
      <span class="stat-line"></span><span class="stat-line"></span><span class="stat-line"></span>
      <span class="stat-line"></span><span class="stat-line short"></span>
      <span class="stat-piece">♟</span>
    </div>
  </div>
</section>

<div class="goods-cta">
  <a class="goods-btn" href="/mailing-list/">Tell me when it ships →</a>
</div>

<style>
.goods-head { text-align:center; max-width:720px; margin:0 auto 2rem; }
.goods-title { font-size:2.4rem; font-weight:900; color:#fff; margin:0.3rem 0 0.5rem; }
.goods-sub { color:#cdbcf2; font-size:1rem; line-height:1.6; }
.goods-soon { display:inline-block; font-weight:800; color:#1a0f3d; background:#F5C518; border-radius:999px; padding:1px 12px; letter-spacing:0.02em; }

.goods-section { display:grid; grid-template-columns:1fr 1fr; gap:34px; align-items:center; margin:0 0 2.6rem; }
.goods-section--alt { grid-template-columns:1fr 1fr; }
@media (max-width:760px){ .goods-section, .goods-section--alt { grid-template-columns:1fr; gap:22px; } }

.goods-copy h2 { color:#fff; font-size:1.5rem; font-weight:800; margin:0; text-align:center; }

/* ---- Gold goal cards (fanned mockups) ---- */
.goods-cards { display:flex; justify-content:center; align-items:center; min-height:300px; perspective:1000px; }
.goal-card { position:relative; width:170px; height:248px; border-radius:var(--r-lg); margin:0 -26px;
  display:flex; flex-direction:column; align-items:center; justify-content:space-between; padding:18px 14px;
  background:linear-gradient(155deg, #fbe48a 0%, #e7b53a 38%, #b8860b 100%);
  border:2px solid #fff3c4; box-shadow:0 16px 40px rgba(0,0,0,0.5), inset 0 0 22px rgba(255,255,255,0.35);
  transition:transform 0.3s ease, box-shadow 0.3s ease; }
.goal-card::after { content:''; position:absolute; inset:6px; border:1px solid rgba(90,60,5,0.45); border-radius:11px; pointer-events:none; }
.gc-a { transform:rotate(-12deg) translateY(10px); z-index:1; }
.gc-b { transform:rotate(0deg) scale(1.06); z-index:3; }
.gc-c { transform:rotate(12deg) translateY(10px); z-index:1; }
.goods-cards:hover .gc-a { transform:rotate(-18deg) translateY(0) translateX(-10px); }
.goods-cards:hover .gc-c { transform:rotate(18deg) translateY(0) translateX(10px); }
.gc-corner { position:absolute; top:9px; left:12px; font-size:0.85rem; color:rgba(80,52,4,0.7); }
.gc-char { font-size:2.6rem; line-height:1; margin-top:14px; filter:drop-shadow(0 2px 3px rgba(120,80,5,0.4)); }
.gc-goal { font-family:'Poppins',sans-serif; font-weight:900; font-size:0.82rem; letter-spacing:0.04em;
  text-transform:uppercase; text-align:center; color:#3a2604; line-height:1.35; }
.gc-creed { font-family:'Poppins',sans-serif; font-style:italic; font-weight:700; font-size:0.74rem; color:#5a3c05;
  border-top:1px solid rgba(90,60,5,0.4); padding-top:8px; width:100%; text-align:center; }

/* ---- Stationery set (letterhead + sticky notecard) ---- */
.goods-stationery { position:relative; display:flex; justify-content:center; align-items:center; min-height:320px; }
.stat-sheet { position:relative; width:230px; min-height:290px; background:#fdfbf4; border-radius:6px; padding:22px 22px 26px;
  box-shadow:0 16px 40px rgba(0,0,0,0.5); display:flex; flex-direction:column; gap:14px; overflow:hidden;
  transform:rotate(-2.5deg); transition:transform 0.3s ease; z-index:2; }
.stat-piece { position:absolute; right:-8px; bottom:-18px; font-size:6.2rem; line-height:1; color:rgba(40,30,80,0.06); z-index:0; }
.stat-note { position:absolute; right:64px; top:20px; width:120px; min-height:118px; background:#fff3b0; border-radius:4px;
  padding:12px 13px; box-shadow:0 12px 26px rgba(0,0,0,0.42); transform:rotate(7deg); transition:transform 0.3s ease; z-index:1;
  font-family:'Poppins',sans-serif; font-style:italic; font-weight:800; font-size:0.8rem; color:#5a3c05; }
.stat-note-line { display:block; height:6px; margin-top:9px; border-radius:2px; background:rgba(90,60,5,0.2); }
.stat-note-line.short { width:60%; }
.goods-stationery:hover .stat-sheet { transform:rotate(0deg) translateX(-10px); }
.goods-stationery:hover .stat-note { transform:rotate(12deg) translate(12px,-8px); }
.stat-creed { position:relative; z-index:1; font-family:'Poppins',sans-serif; font-style:italic; font-weight:800; font-size:1.05rem;
  color:#b8860b; text-align:center; letter-spacing:0.01em; border-bottom:2px solid #F5C518; padding-bottom:12px;
  text-shadow:0 1px 0 rgba(255,255,255,0.6); }
.stat-line { position:relative; z-index:1; height:9px; border-radius:3px; background:linear-gradient(90deg, rgba(40,30,80,0.14), rgba(40,30,80,0.05)); }
.stat-line.short { width:55%; }
@media (max-width:760px){ .stat-note { right:30px; } }

/* ---- CTA ---- */
.goods-cta { text-align:center; margin:0 0 1rem; }
.goods-btn { display:inline-block; text-decoration:none; font-weight:800; font-size:0.92rem; border-radius:999px;
  padding:11px 22px; background:#F5C518; color:#1a0f3d; border:2px solid #F5C518; transition:transform .12s, filter .12s; }
.goods-btn:hover { transform:translateY(-2px); filter:brightness(1.07); }
</style>
