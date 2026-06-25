---
layout: page
title: Games
permalink: /games/
---

<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">

<!-- ===== MEGA MAN 2 — STAGE SELECT ===== -->
<div class="mm-select">

  <a class="mm-trophy" href="{{ '/leaderboards/' | relative_url }}" aria-label="Leaderboards & Hall of Fame" title="Leaderboards &amp; Hall of Fame">🏆</a>

  <div class="mm-titlebar">
    <span class="mm-press">PRESS START</span>
    <h1 class="mm-title">STAGE&nbsp;SELECT</h1>
    <span class="mm-sub">PICK YOUR STAGE</span>
  </div>

  <!-- the five "robot master" cells -->
  <div class="cat-pillars" id="cat-pillars"></div>

  <!-- revealed game grid for the selected stage -->
  <div class="cat-games" id="cat-games"></div>

</div>

<style>
/* ============ MEGA MAN 2 STAGE-SELECT THEME ============ */
.mm-select { position:relative; --mm-blue:#0a1aa0; --mm-cyan:#3cbcfc; --mm-ink:#fff;
  background:#000; border:4px solid #3cbcfc; border-radius:6px; padding:20px 16px 26px; margin:0 0 1.6rem;
  box-shadow:0 0 0 4px #000, 0 0 0 7px #1a3a8c, 0 14px 40px -10px rgba(60,188,252,0.5); overflow:hidden; }
/* CRT scanlines */
.mm-select::after { content:""; position:absolute; inset:0; pointer-events:none; z-index:4; opacity:.5;
  background:repeating-linear-gradient(0deg, rgba(0,0,0,0) 0 2px, rgba(0,0,0,0.28) 2px 4px); }

.mm-trophy { position:absolute; top:12px; right:12px; z-index:6; width:42px; height:42px; border-radius:6px;
  display:flex; align-items:center; justify-content:center; font-size:20px; text-decoration:none;
  background:#000; border:3px solid #3cbcfc; box-shadow:0 0 0 2px #000; transition:transform .12s, box-shadow .12s; }
.mm-trophy:hover { transform:translateY(-2px); box-shadow:0 0 0 2px #000, 0 0 18px rgba(60,188,252,0.8); }

.mm-titlebar { text-align:center; margin:6px 0 20px; }
.mm-press { display:inline-block; font-family:'Press Start 2P',monospace; font-size:9px; letter-spacing:1px;
  color:#fff; animation:mm-blink 1s step-end infinite; }
.mm-title { font-family:'Press Start 2P',monospace; font-size:clamp(18px,5vw,34px); line-height:1.2; margin:10px 0 6px;
  color:#3cbcfc; text-shadow:3px 3px 0 #0a1aa0, 6px 6px 0 #000; letter-spacing:1px; }
.mm-sub { font-family:'Press Start 2P',monospace; font-size:8px; letter-spacing:2px; color:#f8d800; }
@keyframes mm-blink { 50% { opacity:0; } }

/* ---- the 5 stage cells (Mega Man "robot master" portraits) ---- */
.cat-pillars { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin:0 0 14px; position:relative; z-index:2; }
.cat-pillar { position:relative; cursor:pointer; font-family:'Press Start 2P',monospace; text-align:center;
  min-height:150px; display:flex; flex-direction:column; align-items:center; justify-content:flex-end;
  border:3px solid var(--c,#3cbcfc); border-radius:0; padding:16px 8px 12px; overflow:hidden;
  background:linear-gradient(180deg, color-mix(in srgb, var(--c) 30%, #000) 0%, #000 70%);
  box-shadow:inset 0 0 0 2px #000; transition:transform .1s; image-rendering:pixelated; }
.cat-pillar:hover { transform:scale(1.03); }
/* MM2 flashing white selection box */
.cat-pillar.active { animation:mm-cursor .25s step-end infinite; }
@keyframes mm-cursor {
  0%   { box-shadow:inset 0 0 0 4px #fff; border-color:#fff; }
  50%  { box-shadow:inset 0 0 0 4px var(--c); border-color:var(--c); }
}
.cat-pillar .cp-glyph { position:absolute; top:14px; left:0; right:0; font-size:2.8rem; line-height:1; color:var(--c);
  filter:drop-shadow(2px 2px 0 #000); }
.cat-pillar .cp-name { font-size:0.62rem; line-height:1.4; color:#fff; letter-spacing:0; text-transform:uppercase;
  text-shadow:2px 2px 0 #000; }
.cat-pillar .cp-tag { display:none; }
.cat-pillar .cp-count { margin-top:8px; font-size:0.5rem; letter-spacing:1px; text-transform:uppercase;
  color:#000; background:var(--c); padding:3px 6px; }
@media (max-width:560px){ .cat-pillars { grid-template-columns:repeat(3,1fr); gap:6px; }
  .cat-pillar { min-height:118px; padding:12px 3px 9px; } .cat-pillar .cp-glyph { font-size:2rem; }
  .cat-pillar .cp-name { font-size:0.48rem; } }

/* ---- revealed game grid (NES card list) ---- */
.cat-games { display:grid; grid-template-columns:repeat(auto-fill,minmax(210px,1fr)); gap:0.7rem; margin:0;
  position:relative; z-index:2; }
.gcard { position:relative; display:flex; align-items:flex-start; gap:0.7rem; text-decoration:none;
  background:#0a1340; border:3px solid var(--accent,#3cbcfc); border-radius:0; padding:0.7rem 0.85rem;
  box-shadow:inset 0 0 0 2px #000; transition:transform .1s, background .12s; }
.gcard:hover { transform:translateY(-2px); background:#13205e; }
.gcard-icon { font-size:1.5rem; line-height:1; color:var(--accent,#3cbcfc); flex-shrink:0; filter:drop-shadow(1px 1px 0 #000); }
.gcard-body h3 { color:#fff; font-family:'Press Start 2P',monospace; font-size:0.58rem; line-height:1.5; margin:0 0 0.35rem; }
.gcard-body p { color:#bcd4ff; font-size:0.72rem; line-height:1.4; margin:0; }
.gcard-best { display:inline-block; margin-top:6px; font-size:0.6rem; letter-spacing:0.03em; text-transform:uppercase;
  color:#000; background:#00e436; padding:2px 7px; font-family:'Press Start 2P',monospace; font-size:0.42rem; }
.gcard-new { position:absolute; top:8px; right:9px; background:#f8d800; color:#000; font-size:0.42rem; font-weight:900;
  letter-spacing:0.04em; padding:3px 6px; font-family:'Press Start 2P',monospace; }
.gcard-soon { position:absolute; top:8px; right:9px; background:#fc9838; color:#000; font-size:0.42rem; font-weight:900;
  letter-spacing:0.04em; padding:3px 6px; font-family:'Press Start 2P',monospace; }
.gcard-dead { position:absolute; top:8px; right:9px; background:#7c7c7c; color:#000; font-size:0.42rem; font-weight:900;
  letter-spacing:0.04em; padding:3px 6px; font-family:'Press Start 2P',monospace; }
.gcard.soon { border-style:dashed; }
.gcard.locked, .gcard.dead { border-style:dashed; border-color:#7c7c7c; background:#1a1a2e; box-shadow:inset 0 0 0 2px #000; }
.gcard.locked .gcard-icon, .gcard.dead .gcard-icon { color:#bcc; }
.gcard.locked h3, .gcard.dead h3 { color:#9a9ab0; } .gcard.locked p, .gcard.dead p { color:#6f6f8c; }
.gcard.dead { cursor:default; }
</style>

<script>
(function () {
  // ---- data ----
  var GAMES = [
    { slug:'notation-run',      name:'Notation Blitz',     cryptic:'Squares, on the beat.',          icon:'♫',  accent:'#f8d800', cat:'learn',  score:['notation-run','score'] },
    { slug:'fork-in-the-road',  name:'Fork in the Road',   cryptic:'Spot the only move.',            icon:'⚔',  accent:'#00e436', cat:'learn',  score:['fork-in-the-road','solved'] },
    { slug:'pirc-protocol',     name:'The Pirc Protocol',  cryptic:'Learn the book by heart.',       icon:'♚',  accent:'#fc9838', cat:'learn',  score:['pirc-protocol','score'], neu:'2026-06-22' },
    { slug:'shogi-island',      name:'Shogi Island',       cryptic:'Foreign rules. Familiar war.',   icon:'将', accent:'#fcbcb0', cat:'learn',  score:['shogi-island','solved'] },
    { slug:'clearance-delta',   name:'Clearance: DELTA',   cryptic:'Answer, or stay outside.',       icon:'Δ',  accent:'#ff77a8', cat:'learn',  score:['clearance-delta','score'] },
    { slug:'reading-room',      name:'The Reading Room',   cryptic:'Learn to read, one mark at a time.', icon:'あ', accent:'#ff5050', cat:'learn', score:['reading-room','score'], neu:'2026-06-22' },
    { slug:'sky-run',           name:'Sky Run',            cryptic:'Climb the falling pieces.',      icon:'♞',  accent:'#3cbcfc', cat:'arcade', score:['sky-run','score'] },
    { slug:'sand-mine-depths',  name:'Sand Mine Depths',   cryptic:"Descend. Don't look back.",      icon:'⛏',  accent:'#fcbc3c', cat:'arcade', score:['sand-mine-depths','depth'] },
    { slug:'tower-defense',     name:'Siege on Chess City',cryptic:'Hold the gates.',                icon:'🏰', accent:'#ff77a8', cat:'arcade', score:['tower-defense','score'] },
    { slug:'dungeon',           name:'Princess Dungeon',   cryptic:'Every room is a tactic.',        icon:'♟',  accent:'#ff77a8', cat:'arcade', score:['dungeon','floors'], neu:'2026-06-22' },
    { slug:'zoomies',           name:"Crockett's Zoomies", cryptic:'Catch the dog. Mind the bathroom.', icon:'🐕', accent:'#fcbc3c', cat:'arcade', score:['zoomies','bellies'], neu:'2026-06-24' },
    { slug:'murphys-law',       name:"Murphy's Law",       cryptic:'The pessimist was right.',       icon:'☹',  accent:'#3cbcfc', cat:'arcade', score:['murphys-law','score'], neu:'2026-06-25' },
    { slug:'battle-room',       name:'The Battle Room',    cryptic:'Chess as an action sequence.',   icon:'⚔',  accent:'#56d0ff', cat:'dev', score:['battle-room','score'], neu:'2026-06-22' },
    { slug:'follow-the-dog',    name:'Follow the Dog',     cryptic:'Trust the run. Follow her.',     icon:'✦',  accent:'#8fb8ff', cat:'dev' },
    { slug:'the-gambit',        name:'The Gambit',         cryptic:'Lay down your best. The board decides.', icon:'♟', accent:'#f8d800', cat:'dev', soon:true },
    // ── The Vault (unlockable) ──
    { slug:'blindfold-puzzles', name:'Blindfold Puzzles',  cryptic:'No board. Only your mind.',      icon:'◻',  accent:'#c9a7ff', cat:'vault', score:['blindfold','solved'], locked:true },
    // ── Terminated (retired roster) ──
    { slug:'knights-tour',      name:"Knight's Tour",      cryptic:'Touch every square. Once.',      icon:'♞',  accent:'#c96bff', cat:'terminated', score:['knights-tour','score'] },
    { slug:'ferry-delayed',     name:'Ferry Delayed',      cryptic:'No departure date announced.',   icon:'⛴',  accent:'#7c7c7c', cat:'terminated', playable:false }
  ];
  var CATS = {
    learn:      { name:'Learn',     glyph:'♟', tag:'Sharpen your game', accent:'#00e436' },
    arcade:     { name:'Arcade',    glyph:'♞', tag:'Pure play',         accent:'#ff77a8' },
    dev:        { name:'In Dev',    glyph:'🛠', tag:'On the workbench',  accent:'#3cbcfc' },
    vault:      { name:'The Vault', glyph:'🔒', tag:'Unlock to enter',  accent:'#c9a7ff' },
    terminated: { name:'Terminated',glyph:'☠', tag:'Retired roster',    accent:'#fc5454' }
  };
  var base = '{{ "/games/" | relative_url }}';
  function url(slug){ return base.replace(/\/$/, '') + '/' + slug + '/'; }
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function best(slug){ var g=GAMES.filter(function(x){return x.slug===slug;})[0]; if(!g||!g.score) return 0;
    try { return (window.PJCC && PJCC.localBest) ? PJCC.localBest(g.score[0]) : (parseInt(localStorage.getItem('pjcc.best.'+g.score[0]),10)||0); } catch(e){ return 0; } }
  function isNew(d){ if(!d) return false; var t=Date.parse(d+'T00:00:00'); return !isNaN(t) && (Date.now()-t)/86400000 <= 21; }
  function unlocked(){ try { return localStorage.getItem('pjcc.blindfold.unlocked')==='1'; } catch(e){ return false; } }

  // ---- stage cells ----
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
      var dead = g.playable === false;
      var locked = g.locked && !unlocked();
      var b = best(g.slug);
      var chip = (b>0 && g.score) ? '<span class="gcard-best">★ '+b.toLocaleString()+' '+g.score[1]+'</span>' : '';
      var neu = isNew(g.neu) ? '<span class="gcard-new">NEW</span>' : '';
      var soon = g.soon ? '<span class="gcard-soon">SOON</span>' : '';
      var dbadge = dead ? '<span class="gcard-dead">DELAYED</span>' : '';
      var icon = dead ? g.icon : (locked ? '🔒' : g.icon);
      var desc = dead ? 'Non-playable — '+esc(g.cryptic) : (locked ? 'Locked — flawless Fast run in Notation Blitz' : esc(g.cryptic));
      var inner = neu+soon+dbadge+'<span class="gcard-icon">'+icon+'</span>'+
        '<span class="gcard-body"><h3>'+esc(g.name)+'</h3><p>'+desc+'</p>'+chip+'</span>';
      if (dead) return '<div class="gcard dead" style="--accent:'+g.accent+'">'+inner+'</div>';
      return '<a class="gcard'+(locked?' locked':'')+(g.soon?' soon':'')+'" href="'+url(g.slug)+'" style="--accent:'+g.accent+'" data-slug="'+g.slug+'" data-name="'+esc(g.name)+'">'+inner+'</a>';
    }).join('');
    // remember last-played on click
    Array.prototype.forEach.call(gamesEl.querySelectorAll('a.gcard'), function(card){
      card.addEventListener('click', function(){
        try { localStorage.setItem('pjcc.lastGame', JSON.stringify({ href:card.getAttribute('href'), name:card.getAttribute('data-name'), slug:card.getAttribute('data-slug') })); } catch(e){}
      });
    });
  }
  openCat('learn');   // a stage is selected by default so the screen is never empty

  // upgrade best chips with server bests once profile loads
  if (window.PJCC && PJCC.ready) PJCC.ready.then(function(){ return PJCC.myStats ? PJCC.myStats() : []; })
    .then(function(){ if (active) openCat(active); }).catch(function(){});
})();
</script>
