---
layout: page
title: The Goods
permalink: /goods/
brand: mcpuppy
---

<div class="goods-head">
  <div class="goods-eyebrow">McPuppy Studios · Pocket-and-Desk Mindset Goods</div>
  <h1 class="goods-title">The Goods</h1>
  <p class="goods-sub"><span class="goods-soon">Coming soon</span> — parked until after the launch flare, then made <em>properly</em> or not at all. Physical things you keep on you, built to fight one thing: forgetting what you're after.</p>
</div>

<!-- ── Av14 · The Goal Card ─────────────────────────────────── -->
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
    <div class="goods-tag">Av14 · The Goal Card</div>
    <h2>A goal you can hold</h2>
    <p>A <strong>pocket goal card</strong> you keep on you — reach in, <strong>touch it</strong>, re-anchor the goal. The touch is the trigger; the whole card is built to serve that one ritual, <em>à la Bob Proctor.</em></p>
    <p class="goods-why">Most people don't know what they want. Or they do — and then <strong>forget once they lose the path</strong> for a while. The card is a physical anchor against forgetting.</p>
    <ul class="goods-list">
      <li><strong>Premium and intentional, not a download.</strong> Thick, heavy paper. <strong>Gold</strong> — yes, real gold. A different character on every card.</li>
      <li><strong>Not printable from the site — on purpose.</strong> The little bit of friction is the point; it keeps it personal.</li>
      <li><strong>How you get one:</strong> buy it, <a href="/contact/">email and ask for a free one</a> (Patreon-funded), or make your own with any token — whatever works, as long as the goal is tied to <em>touching it.</em></li>
    </ul>
  </div>
</section>

<!-- ── Av15 · The Stationery ────────────────────────────────── -->
<section class="goods-section goods-section--alt">
  <div class="goods-copy">
    <div class="goods-tag">Av15 · The Stationery</div>
    <h2>Desk gear with a creed</h2>
    <p>Branded PJCC stationery with <strong>"follow the dog"</strong> across the top — the desk half of the pocket-and-desk mindset line that runs alongside the goal cards.</p>
    <p class="goods-why">Same idea, more surface: the page you write your day on already carries the reminder.</p>
  </div>
  <div class="goods-stationery" aria-hidden="true">
    <div class="stat-sheet">
      <span class="stat-creed">follow the dog</span>
      <span class="stat-line"></span><span class="stat-line"></span><span class="stat-line"></span>
      <span class="stat-line"></span><span class="stat-line short"></span>
    </div>
  </div>
</section>

<div class="goods-creed-band">
  <span class="goods-creed-quote">"Goals are 5% strategy, 95% mindset."</span>
  <span class="goods-creed-by">— the Rival</span>
</div>

<div class="goods-cta">
  <p class="goods-cta-q">Want one when they're real?</p>
  <div class="goods-cta-row">
    <a class="goods-btn" href="/mailing-list/">Tell me when it ships →</a>
    <a class="goods-btn goods-btn--ghost" href="/contact/">Ask for a free card</a>
  </div>
</div>

<style>
.goods-head { text-align:center; max-width:720px; margin:0 auto 2rem; }
.goods-eyebrow { font-family:'Share Tech Mono',monospace; font-size:0.7rem; letter-spacing:0.2em; text-transform:uppercase; color:#9a8fc0; }
.goods-title { font-size:2.4rem; font-weight:900; color:#fff; margin:0.3rem 0 0.5rem; }
.goods-sub { color:#cdbcf2; font-size:1rem; line-height:1.6; }
.goods-soon { display:inline-block; font-weight:800; color:#1a0f3d; background:#F5C518; border-radius:999px; padding:1px 12px; letter-spacing:0.02em; }
.goods-sub em { color:#f0e6ff; font-style:italic; }

.goods-section { display:grid; grid-template-columns:1fr 1fr; gap:34px; align-items:center; margin:0 0 2.6rem; }
.goods-section--alt { grid-template-columns:1fr 1fr; }
@media (max-width:760px){ .goods-section, .goods-section--alt { grid-template-columns:1fr; gap:22px; } }

.goods-tag { font-family:'Share Tech Mono',monospace; font-size:0.68rem; letter-spacing:0.16em; text-transform:uppercase; color:#F5C518; margin-bottom:6px; }
.goods-copy h2 { color:#fff; font-size:1.5rem; font-weight:800; margin:0 0 0.6rem; }
.goods-copy p { color:#cdbcf2; font-size:0.96rem; line-height:1.65; margin:0 0 0.8rem; }
.goods-copy strong { color:#f0e6ff; }
.goods-copy em { color:#e3d6ff; font-style:italic; }
.goods-why { color:#a896d4 !important; border-left:2px solid rgba(245,197,24,0.4); padding-left:12px; }
.goods-list { list-style:none; padding:0; margin:0; }
.goods-list li { color:#cdbcf2; font-size:0.92rem; line-height:1.55; padding:8px 0 8px 22px; position:relative; border-top:1px solid rgba(110,95,160,0.18); }
.goods-list li::before { content:'◆'; position:absolute; left:0; top:8px; color:#F5C518; font-size:0.8rem; }
.goods-list a { color:#F5C518; }

/* ---- Gold goal cards (fanned mockups) ---- */
.goods-cards { display:flex; justify-content:center; align-items:center; min-height:300px; perspective:1000px; }
.goal-card { position:relative; width:170px; height:248px; border-radius:16px; margin:0 -26px;
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

/* ---- Stationery sheet ---- */
.goods-stationery { display:flex; justify-content:center; }
.stat-sheet { width:230px; min-height:290px; background:#fdfbf4; border-radius:6px; padding:22px 22px 26px;
  box-shadow:0 16px 40px rgba(0,0,0,0.5); display:flex; flex-direction:column; gap:14px;
  transform:rotate(-2.5deg); transition:transform 0.3s ease; }
.goods-stationery:hover .stat-sheet { transform:rotate(0deg); }
.stat-creed { font-family:'Poppins',sans-serif; font-style:italic; font-weight:800; font-size:1rem; color:#1a0f3d;
  text-align:center; letter-spacing:0.01em; border-bottom:2px solid #F5C518; padding-bottom:12px; }
.stat-line { height:9px; border-radius:3px; background:linear-gradient(90deg, rgba(40,30,80,0.14), rgba(40,30,80,0.05)); }
.stat-line.short { width:55%; }

/* ---- Creed band + CTA ---- */
.goods-creed-band { text-align:center; margin:0 0 2.2rem; padding:22px; border-top:1px solid rgba(245,197,24,0.25);
  border-bottom:1px solid rgba(245,197,24,0.25); }
.goods-creed-quote { display:block; font-size:1.4rem; font-weight:800; font-style:italic; color:#F5C518; }
.goods-creed-by { display:block; margin-top:6px; color:#9a8fc0; font-size:0.85rem; letter-spacing:0.04em; }

.goods-cta { text-align:center; margin:0 0 1rem; }
.goods-cta-q { color:#e3d6ff; font-size:1.05rem; font-weight:700; margin:0 0 0.8rem; }
.goods-cta-row { display:flex; gap:12px; justify-content:center; flex-wrap:wrap; }
.goods-btn { display:inline-block; text-decoration:none; font-weight:800; font-size:0.92rem; border-radius:999px;
  padding:11px 22px; background:#F5C518; color:#1a0f3d; border:2px solid #F5C518; transition:transform .12s, filter .12s; }
.goods-btn:hover { transform:translateY(-2px); filter:brightness(1.07); }
.goods-btn--ghost { background:transparent; color:#F5C518; }
.goods-btn--ghost:hover { background:rgba(245,197,24,0.1); }
</style>
