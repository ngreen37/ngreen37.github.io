---
layout: page
title: Games
permalink: /games/
---

<div id="weekly" class="weekly" hidden></div>
<div id="continue-hero" class="continue-hero" hidden></div>

<!-- ===== FEATURED: THE GAUNTLET ===== -->
<a class="feat" href="{{ '/games/the-gauntlet/' | relative_url }}">
  <div class="feat-glyph">♛</div>
  <div class="feat-body">
    <div class="feat-eyebrow">The Headline Game</div>
    <h2 class="feat-title">The Gauntlet</h2>
    <p class="feat-cryptic">Real chess. Climb the ladder to the CEO.</p>
  </div>
  <div class="feat-play">Play ▸</div>
</a>

<!-- ===== CATEGORY PILLARS (pick a hall) ===== -->
<div class="cat-pillars" id="cat-pillars"></div>
<div class="cat-games" id="cat-games"></div>

<!-- ===== LEADERBOARD / TERMINATED ===== -->
<a class="lb-cta" href="{{ '/leaderboards/' | relative_url }}">🏆 <b>Leaderboards</b> &amp; Hall of Fame <span class="lb-cta-arrow">→</span></a>

<details class="terminated" id="terminated">
  <summary>Terminated experiments</summary>
  <p class="terminated-note">Nothing retired right now — every game above is live. Archived experiments will land here.</p>
</details>

<style>
/* ---- Weekly chip (small, no description) ---- */
.weekly { display:inline-flex; align-items:center; gap:8px; background:linear-gradient(135deg,#241452,#34206f);
  border:1px solid var(--gw,#F5C518); border-radius:999px; padding:6px 8px 6px 14px; margin:0 0 0.8rem;
  font-size:0.8rem; color:#f0e6ff; }
.weekly .gw-eye { color:#c9a7ff; font-weight:700; letter-spacing:0.04em; }
.weekly .gw-name { color:#fff; font-weight:800; }
.weekly .gw-play { background:var(--gw,#F5C518); color:#1a0f3d; font-weight:800; border-radius:999px; padding:4px 12px; text-decoration:none; }
.weekly .gw-play:hover { filter:brightness(1.08); }

/* ---- Last ---- */
.continue-hero { display:flex; align-items:center; gap:12px; flex-wrap:wrap; background:linear-gradient(135deg,#1f1147,#34206f);
  border:1px solid #6b5fa0; border-radius:10px; padding:10px 16px; margin:0 0 0.9rem; }
.continue-hero .ch-eye { color:#9a7fd4; font-size:0.72rem; letter-spacing:1px; text-transform:uppercase; }
.continue-hero .ch-link { background:var(--accent,#F5C518); color:#1a0f3d; font-weight:800; border-radius:999px; padding:7px 16px; text-decoration:none; }
.continue-hero .ch-link:hover { filter:brightness(1.08); }

/* ---- Featured Gauntlet ---- */
.feat { display:flex; align-items:center; gap:16px; text-decoration:none; margin:0 0 1.4rem;
  background:linear-gradient(135deg,#2a1c0e 0%, #3a2a10 100%); border:2px solid #F5C518; border-radius:16px;
  padding:18px 20px; box-shadow:0 0 30px -8px #F5C518; transition:transform .12s, box-shadow .12s; }
.feat:hover { transform:translateY(-2px); box-shadow:0 0 40px -6px #F5C518; }
.feat-glyph { font-size:3.2rem; line-height:1; color:#F5C518; flex-shrink:0; filter:drop-shadow(0 2px 6px rgba(0,0,0,0.5)); }
.feat-body { flex:1; min-width:0; }
.feat-eyebrow { font-size:0.66rem; letter-spacing:0.22em; text-transform:uppercase; color:#d9b877; }
.feat-title { font-size:1.7rem; font-weight:900; color:#fff; margin:1px 0 2px; }
.feat-cryptic { color:#e7d6b0; font-size:0.9rem; margin:0; }
.feat-play { flex-shrink:0; background:#F5C518; color:#1a0f3d; font-weight:900; border-radius:999px; padding:11px 20px; white-space:nowrap; }

/* ---- Gauntlet-Legends-style category pillars ---- */
.cat-pillars { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin:0 0 1rem; }
.cat-pillar { position:relative; cursor:pointer; font-family:inherit; text-align:center;
  min-height:200px; display:flex; flex-direction:column; align-items:center; justify-content:flex-end;
  border:2px solid var(--c,#6b5fa0); border-radius:14px; padding:18px 10px 14px; overflow:hidden;
  background:linear-gradient(180deg, color-mix(in srgb, var(--c) 26%, #160a33) 0%, #160a33 78%);
  transition:transform .12s, box-shadow .12s, border-color .12s; }
.cat-pillar:hover { transform:translateY(-3px); box-shadow:0 8px 26px -8px var(--c); }
.cat-pillar.active { box-shadow:0 0 0 2px var(--c), 0 10px 30px -8px var(--c); border-color:var(--c); }
.cat-pillar .cp-glyph { position:absolute; top:14px; left:0; right:0; font-size:3.4rem; line-height:1; color:var(--c);
  opacity:0.92; filter:drop-shadow(0 3px 8px rgba(0,0,0,0.5)); transition:transform .15s; }
.cat-pillar:hover .cp-glyph { transform:scale(1.08); }
.cat-pillar .cp-name { font-size:1.05rem; font-weight:900; color:#fff; letter-spacing:0.04em; text-transform:uppercase; }
.cat-pillar .cp-tag { font-size:0.7rem; color:#c9b8ee; margin-top:2px; }
.cat-pillar .cp-count { margin-top:7px; font-size:0.64rem; letter-spacing:0.08em; text-transform:uppercase;
  color:#1a0f3d; background:var(--c); border-radius:999px; padding:2px 10px; font-weight:800; }
@media (max-width:560px){ .cat-pillars { grid-template-columns:repeat(3,1fr); gap:7px; }
  .cat-pillar { min-height:150px; padding:12px 4px 10px; } .cat-pillar .cp-glyph { font-size:2.3rem; }
  .cat-pillar .cp-name { font-size:0.78rem; } .cat-pillar .cp-tag { display:none; } }

/* ---- revealed game grid ---- */
.cat-games { display:grid; grid-template-columns:repeat(auto-fill,minmax(210px,1fr)); gap:0.7rem; margin:0 0 1.4rem; }
.gcard { position:relative; display:flex; align-items:flex-start; gap:0.7rem; text-decoration:none;
  background:#241451; border:1px solid var(--accent,#F5C518); border-radius:9px; padding:0.7rem 0.85rem;
  transition:transform .12s, background .12s, box-shadow .12s; }
.gcard:hover { transform:translateY(-2px); background:#3d2a7a; box-shadow:0 0 18px -5px var(--accent,#F5C518); }
.gcard-icon { font-size:1.5rem; line-height:1; color:var(--accent,#F5C518); flex-shrink:0; }
.gcard-body h3 { color:#f0e6ff; font-size:0.86rem; font-weight:800; margin:0 0 0.18rem; }
.gcard-body p { color:#d3c5f3; font-size:0.72rem; line-height:1.4; margin:0; }
.gcard-best { display:inline-block; margin-top:5px; font-size:0.64rem; letter-spacing:0.03em; text-transform:uppercase;
  color:#6bffb8; border:1px solid #2f6b50; background:rgba(107,255,184,0.1); border-radius:4px; padding:1px 7px; }
.gcard-new { position:absolute; top:8px; right:9px; background:#6bffb8; color:#042; font-size:0.56rem; font-weight:900;
  letter-spacing:0.06em; border-radius:999px; padding:2px 7px; }
.gcard-soon { position:absolute; top:8px; right:9px; background:#F5C518; color:#1a0f3d; font-size:0.56rem; font-weight:900;
  letter-spacing:0.06em; border-radius:999px; padding:2px 7px; }
.gcard.soon { border-style:dashed; }
.gcard.locked { border-style:dashed; border-color:#4f466e; background:linear-gradient(135deg,#26223c,#2f2a4a); }
.gcard.locked .gcard-icon { color:#F5C518; } .gcard.locked h3 { color:#9a8fc0; } .gcard.locked p { color:#6f6592; }

/* ---- leaderboard CTA + terminated ---- */
.lb-cta { display:flex; align-items:center; gap:10px; text-decoration:none; margin:0 0 1rem;
  background:linear-gradient(135deg,#241452,#3a2d1a); border:1px solid #F5C518; border-radius:12px;
  padding:12px 18px; color:#f0e6ff; box-shadow:0 0 22px -10px #F5C518; font-size:0.95rem; }
.lb-cta:hover { filter:brightness(1.07); }
.lb-cta b { color:#F5C518; } .lb-cta-arrow { margin-left:auto; color:#F5C518; font-weight:900; }
.terminated { margin:0 0 2rem; border:1px solid #3a2a6a; border-radius:10px; background:rgba(36,20,81,0.4); }
.terminated summary { cursor:pointer; padding:10px 16px; color:#9a8fc0; font-weight:700; font-size:0.85rem; }
.terminated summary:hover { color:#c9a7ff; }
.terminated-note { color:#6f6592; font-size:0.8rem; padding:0 16px 12px; margin:0; }
</style>

<script>
(function () {
  // ---- data ----
  var GAMES = [
    { slug:'notation-run',      name:'Notation Blitz',     cryptic:'Squares, on the beat.',          icon:'♫',  accent:'#F5C518', cat:'learn',  score:['notation-run','score'] },
    { slug:'fork-in-the-road',  name:'Fork in the Road',   cryptic:'Spot the only move.',            icon:'⚔',  accent:'#5be0c0', cat:'learn',  score:['fork-in-the-road','solved'] },
    { slug:'pirc-protocol',     name:'The Pirc Protocol',  cryptic:'Learn the book by heart.',       icon:'♚',  accent:'#caa24a', cat:'learn',  score:['pirc-protocol','score'], neu:'2026-06-22' },
    { slug:'shogi-island',      name:'Shogi Island',       cryptic:'Foreign rules. Familiar war.',   icon:'将', accent:'#d9a441', cat:'learn',  score:['shogi-island','solved'] },
    { slug:'clearance-delta',   name:'Clearance: DELTA',   cryptic:'Answer, or stay outside.',       icon:'Δ',  accent:'#ff9fb0', cat:'learn',  score:['clearance-delta','score'] },
    { slug:'reading-room',      name:'The Reading Room',   cryptic:'Learn to read, one mark at a time.', icon:'あ', accent:'#ff6b6b', cat:'learn', score:['reading-room','score'], neu:'2026-06-22' },
    { slug:'knights-tour',      name:"Knight's Tour",      cryptic:'Touch every square. Once.',      icon:'♞',  accent:'#c96bff', cat:'learn',  score:['knights-tour','score'], neu:'2026-06-22' },
    { slug:'blindfold-puzzles', name:'Blindfold Puzzles',  cryptic:'No board. Only your mind.',      icon:'◻',  accent:'#c9a7ff', cat:'learn',  score:['blindfold','solved'], locked:true },
    { slug:'sky-run',           name:'Sky Run',            cryptic:'Climb the falling pieces.',      icon:'♞',  accent:'#7fc8ff', cat:'arcade', score:['sky-run','score'] },
    { slug:'sand-mine-depths',  name:'Sand Mine Depths',   cryptic:"Descend. Don't look back.",      icon:'⛏',  accent:'#e0b25a', cat:'arcade', score:['sand-mine-depths','depth'] },
    { slug:'tower-defense',     name:'Siege on Chess City',cryptic:'Hold the gates.',                icon:'🏰', accent:'#ff8fd0', cat:'arcade', score:['tower-defense','score'] },
    { slug:'dungeon',           name:'Princess Dungeon',   cryptic:'Every room is a tactic.',        icon:'♟',  accent:'#ff8fd0', cat:'arcade', score:['dungeon','floors'], neu:'2026-06-22' },
    { slug:'battle-room',       name:'The Battle Room',    cryptic:'Chess as an action sequence.',   icon:'⚔',  accent:'#56d0ff', cat:'dev', score:['battle-room','score'], neu:'2026-06-22' },
    { slug:'follow-the-dog',    name:'Follow the Dog',     cryptic:'Trust the run. Follow her.',     icon:'✦',  accent:'#8fb8ff', cat:'dev' },
    { slug:'the-gambit',        name:'The Gambit',         cryptic:'Lay down your best. The board decides.', icon:'♟', accent:'#F5C518', cat:'dev', soon:true }
  ];
  var CATS = {
    learn:  { name:'Learn',          glyph:'♟', tag:'Sharpen your game', accent:'#6bffb8' },
    arcade: { name:'Arcade',         glyph:'♞', tag:'Pure play',         accent:'#ff8fd0' },
    dev:    { name:'In Development', glyph:'🛠', tag:'On the workbench',  accent:'#8fb8ff' }
  };
  var base = '{{ "/games/" | relative_url }}';
  function url(slug){ return base.replace(/\/$/, '') + '/' + slug + '/'; }
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function best(slug){ var g=GAMES.filter(function(x){return x.slug===slug;})[0]; if(!g||!g.score) return 0;
    try { return (window.PJCC && PJCC.localBest) ? PJCC.localBest(g.score[0]) : (parseInt(localStorage.getItem('pjcc.best.'+g.score[0]),10)||0); } catch(e){ return 0; } }
  function isNew(d){ if(!d) return false; var t=Date.parse(d+'T00:00:00'); return !isNaN(t) && (Date.now()-t)/86400000 <= 21; }
  function unlocked(){ try { return localStorage.getItem('pjcc.blindfold.unlocked')==='1'; } catch(e){ return false; } }

  // ---- pillars ----
  var pillarsEl = document.getElementById('cat-pillars');
  var gamesEl = document.getElementById('cat-games');
  var active = null;
  Object.keys(CATS).forEach(function(key){
    var c = CATS[key], n = GAMES.filter(function(g){ return g.cat===key; }).length;
    var b = document.createElement('button');
    b.className = 'cat-pillar'; b.setAttribute('data-cat', key); b.style.setProperty('--c', c.accent);
    b.innerHTML = '<span class="cp-glyph">'+c.glyph+'</span><span class="cp-name">'+c.name+'</span>'+
      '<span class="cp-tag">'+c.tag+'</span><span class="cp-count">'+n+' game'+(n===1?'':'s')+'</span>';
    b.addEventListener('click', function(){ openCat(key); });
    pillarsEl.appendChild(b);
  });

  function openCat(key){
    active = key;
    Array.prototype.forEach.call(pillarsEl.children, function(p){ p.classList.toggle('active', p.getAttribute('data-cat')===key); });
    var list = GAMES.filter(function(g){ return g.cat===key; });
    gamesEl.innerHTML = list.map(function(g){
      var locked = g.locked && !unlocked();
      var b = best(g.slug);
      var chip = (b>0 && g.score) ? '<span class="gcard-best">★ '+b.toLocaleString()+' '+g.score[1]+'</span>' : '';
      var neu = isNew(g.neu) ? '<span class="gcard-new">NEW</span>' : '';
      var soon = g.soon ? '<span class="gcard-soon">SOON</span>' : '';
      return '<a class="gcard'+(locked?' locked':'')+(g.soon?' soon':'')+'" href="'+url(g.slug)+'" style="--accent:'+g.accent+'" data-slug="'+g.slug+'" data-name="'+esc(g.name)+'">'+
        neu+soon+'<span class="gcard-icon">'+(locked?'🔒':g.icon)+'</span>'+
        '<span class="gcard-body"><h3>'+esc(g.name)+'</h3><p>'+(locked?'Locked — flawless Fast run in Notation Blitz':esc(g.cryptic))+'</p>'+chip+'</span></a>';
    }).join('');
    // remember last-played on click
    Array.prototype.forEach.call(gamesEl.querySelectorAll('.gcard'), function(card){
      card.addEventListener('click', function(){
        try { localStorage.setItem('pjcc.lastGame', JSON.stringify({ href:card.getAttribute('href'), name:card.getAttribute('data-name'), slug:card.getAttribute('data-slug') })); } catch(e){}
      });
    });
  }
  openCat('learn');   // a category is open by default so the page never feels empty

  // ---- Last ----
  try {
    var last = JSON.parse(localStorage.getItem('pjcc.lastGame') || 'null');
    var hero = document.getElementById('continue-hero');
    if (last && last.href && hero) {
      var g = GAMES.filter(function(x){ return x.slug===last.slug; })[0];
      hero.innerHTML = '<span class="ch-eye">Last</span><a class="ch-link" href="'+last.href+'" style="--accent:'+(g?g.accent:'#F5C518')+'">'+esc(last.name||'Resume')+'</a>';
      hero.hidden = false;
    }
  } catch(e){}

  // ---- Weekly (small chip, no description) ----
  function weekly(){
    if (!window.PJCC || !PJCC.bountyGame) return;
    var key = PJCC.bountyGame();
    var g = GAMES.filter(function(x){ return (x.score && x.score[0]===key) || x.slug===key; })[0];
    if (!g) return;
    var el = document.getElementById('weekly');
    el.style.setProperty('--gw', g.accent);
    el.innerHTML = '<span class="gw-eye">★ Game of the Week · 2× credits</span> <span class="gw-name">'+esc(g.name)+'</span>'+
      '<a class="gw-play" href="'+url(g.slug)+'">Play</a>';
    el.hidden = false;
  }
  if (window.PJCC && PJCC.ready) PJCC.ready.then(weekly); else document.addEventListener('DOMContentLoaded', weekly);

  // upgrade best chips with server bests once profile loads
  if (window.PJCC && PJCC.ready) PJCC.ready.then(function(){ return PJCC.myStats ? PJCC.myStats() : []; })
    .then(function(){ if (active) openCat(active); }).catch(function(){});
})();
</script>
