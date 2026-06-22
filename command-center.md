---
layout: page
title: Operative Command Center
permalink: /command-center/
---

<link rel="stylesheet" href="{{ '/assets/css/pjcc-profile.css' | relative_url }}">

<div class="cc-head">
  <div>
    <div class="cc-kicker">◈ Classified access</div>
    <h1 class="cc-title">Command Center</h1>
  </div>
  <div class="cc-clock" id="cc-clock">--:--:-- UTC</div>
</div>
<p class="cc-greet" id="cc-greet">Establishing uplink…</p>

<div class="cc-grid">

  <!-- OPERATIVE STATUS -->
  <div class="cc-mod cc-mod--status">
    <div class="cc-mod-label">◆ Operative status</div>
    <div class="cc-status" id="cc-status">
      <div class="cc-rank-ico" id="cc-rank-ico">⬡</div>
      <div>
        <div class="cc-codename" id="cc-codename">UNREGISTERED</div>
        <div class="cc-rank" id="cc-rank">No clearance on file</div>
      </div>
    </div>
    <div class="cc-credits" id="cc-credits"></div>
    <a class="cc-btn" id="cc-dossier-link" href="{{ '/dossier/' | relative_url }}">Open dossier →</a>
  </div>

  <!-- MISSION CLOCK -->
  <div class="cc-mod cc-mod--clock">
    <div class="cc-mod-label">◆ Mission clock — Ep.01</div>
    <div class="cc-count" id="cc-count">—</div>
    <div class="cc-count-lbl">days to premiere · Oct 21, 2027</div>
    <div class="cc-devdays" id="cc-devdays"></div>
  </div>

  <!-- DAILY MISSION -->
  <div class="cc-mod cc-mod--daily">
    <div class="cc-mod-label">◆ Today's mission</div>
    <div class="cc-daily-task" id="cc-daily-task">—</div>
    <div class="cc-daily-status" id="cc-daily-status">—</div>
    <a class="cc-btn cc-btn-gold" id="cc-daily-go" href="#">Deploy ▸</a>
  </div>

  <!-- FRAGMENT RECOVERY -->
  <div class="cc-mod cc-mod--frags">
    <div class="cc-mod-label">◆ Fragment recovery <span id="cc-frag-count" class="cc-frag-count"></span></div>
    <div class="cc-frag-grid" id="cc-frag-grid"></div>
    <div class="cc-frag-note" id="cc-frag-note"></div>
  </div>

  <!-- TRANSMISSION LOG -->
  <div class="cc-mod cc-mod--feed">
    <div class="cc-mod-label">◆ Live transmission log</div>
    <div class="cc-feed" id="cc-feed"></div>
  </div>

  <!-- QUICK LAUNCH -->
  <div class="cc-mod cc-mod--launch">
    <div class="cc-mod-label">◆ Quick launch</div>
    <div class="cc-launch">
      <a href="{{ '/daily/' | relative_url }}">📅 Daily Dispatch</a>
      <a href="{{ '/games/' | relative_url }}">🕹️ The Arcade</a>
      <a href="{{ '/academy/' | relative_url }}">🎓 Academy</a>
      <a href="{{ '/production/' | relative_url }}">🎬 The Pilot</a>
      <a href="{{ '/leaderboards/' | relative_url }}">🏆 Leaderboards</a>
    </div>
  </div>

</div>

<script src="{{ '/assets/js/pjcc-config.js' | relative_url }}"></script>
<script src="{{ '/assets/js/pjcc-profile.js' | relative_url }}"></script>
<script>
(function () {
  function $(id){ return document.getElementById(id); }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function best(game){ try { if (window.PJCC && PJCC.localBest) return PJCC.localBest(game); return parseInt(localStorage.getItem('pjcc.best.'+game),10)||0; } catch(e){ return 0; } }
  function gameUrl(slug){ return '{{ "/games/" | relative_url }}'.replace(/\/$/,'') + '/' + slug + '/'; }
  function has(k){ try { return !!localStorage.getItem(k); } catch(e){ return false; } }

  var START = Date.UTC(2026,2,1,4,0,0), PREMIERE = Date.UTC(2027,9,21,4,0,0);

  // ---- clock ----
  function tick(){
    var d = new Date();
    var hh=('0'+d.getUTCHours()).slice(-2), mm=('0'+d.getUTCMinutes()).slice(-2), ss=('0'+d.getUTCSeconds()).slice(-2);
    $('cc-clock').textContent = hh+':'+mm+':'+ss+' UTC';
  }
  tick(); setInterval(tick, 1000);

  // ---- mission clock ----
  (function(){
    var now = Date.now();
    $('cc-count').textContent = Math.max(0, Math.ceil((PREMIERE-now)/86400000)).toLocaleString();
    $('cc-devdays').textContent = 'Day ' + Math.max(0, Math.floor((now-START)/86400000)).toLocaleString() + ' of building in the open';
  })();

  // ---- operative status (rank/credits via PJCC) ----
  function renderStatus(){
    var greet = $('cc-greet');
    try {
      if (window.PJCC && PJCC.getProfile) {
        var p = PJCC.getProfile();
        if (p && p.codename) {
          $('cc-codename').textContent = p.codename;
          var credits = p.credits || 0;
          var rank = (PJCC.rankFor ? PJCC.rankFor(credits) : null);
          $('cc-rank').textContent = rank ? rank.name : 'Clearance on file';
          $('cc-rank-ico').textContent = (PJCC.avatarEmoji ? PJCC.avatarEmoji(p) : '⬢');
          $('cc-credits').innerHTML = '<b>' + credits + '</b> credits';
          greet.innerHTML = 'Welcome back, <b>' + esc(p.codename) + '</b>. The board is yours.';
          return;
        }
      }
    } catch(e){}
    $('cc-codename').textContent = 'UNREGISTERED';
    $('cc-rank').textContent = 'No clearance on file';
    $('cc-credits').innerHTML = '<span class="cc-muted">Sign in from your dossier to log credits &amp; rank.</span>';
    greet.innerHTML = 'Uplink open — but you\'re flying <b>unregistered</b>. <a href="{{ '/dossier/' | relative_url }}">Claim a codename</a> to log your record.';
  }
  renderStatus();
  if (window.PJCC && PJCC.ready) PJCC.ready.then(renderStatus);
  if (window.PJCC && PJCC.onChange) PJCC.onChange(renderStatus);

  // ---- daily mission (date-seeded) ----
  (function(){
    var TASKS = [
      { t:'Score 600+ in Notation Blitz', go:'notation-run', ok:function(){ return best('notation-run')>=600; } },
      { t:'Solve 5 in Fork in the Road', go:'fork-in-the-road', ok:function(){ return best('fork-in-the-road')>=5; } },
      { t:'Reach 300+ in The Pirc Protocol', go:'pirc-protocol', ok:function(){ return best('pirc-protocol')>=300; } },
      { t:'Hold the gate in Siege on Chess City', go:'tower-defense', ok:function(){ return best('tower-defense')>=1; } },
      { t:'Fly the 📅 Daily in Sky Run', go:'sky-run', ok:function(){ return best('sky-run')>=1; } },
      { t:'Descend past 100m in Sand Mine Depths', go:'sand-mine-depths', ok:function(){ return best('sand-mine-depths')>=100; } },
      { t:'Win once on Shogi Island', go:'shogi-island', ok:function(){ return best('shogi-island')>=1; } }
    ];
    function seed(s){ var h=2166136261; for(var i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return h>>>0; }
    var d=new Date(), ds=d.getUTCFullYear()+'-'+(d.getUTCMonth()+1)+'-'+d.getUTCDate();
    var task = TASKS[seed(ds)%TASKS.length];
    $('cc-daily-task').textContent = task.t;
    $('cc-daily-go').href = gameUrl(task.go);
    function refresh(){ var done=task.ok(); $('cc-daily-status').innerHTML = done ? '<b class="cc-ok">✓ complete</b>' : '<span class="cc-muted">awaiting completion</span>'; }
    refresh();
    document.addEventListener('visibilitychange', function(){ if(!document.hidden) refresh(); });
  })();

  // ---- fragment recovery grid ----
  (function(){
    var ORIGIN = [
      { k:'frag_classified', n:'CLASSIFIED', i:'🗎' },
      { k:'frag_archive',    n:'THE ARCHIVE', i:'🗄' },
      { k:'frag_dispatch',   n:'DEAD DROP', i:'📡' },
      { k:'frag_recovery',   n:'RECOVERY SIGNAL', i:'🧭' },
      { k:'frag_konami',     n:"OPERATOR'S CODE", i:'🎮' },
      { k:'frag_qd',         n:'HYPERSPEED BOX', i:'⚡' }
    ];
    var BONUS = [ { k:'frag_subjectzero', n:'SUBJECT ZERO', i:'☉' } ];
    var grid = $('cc-frag-grid'); var got = 0;
    ORIGIN.concat(BONUS).forEach(function(f){
      var have = has(f.k); if (ORIGIN.indexOf(f)>=0 && have) got++;
      var cell = document.createElement('div');
      cell.className = 'cc-frag' + (have ? ' got' : '');
      cell.innerHTML = '<span class="cc-frag-ic">' + (have ? f.i : '🔒') + '</span><span class="cc-frag-n">' + esc(have ? f.n : 'ENCRYPTED') + '</span>';
      cell.title = have ? f.n + ' — recovered' : 'Locked';
      grid.appendChild(cell);
    });
    $('cc-frag-count').textContent = got + ' / 6';
    $('cc-frag-note').innerHTML = got >= 6
      ? 'All six recovered — the <a href="{{ '/classified/' | relative_url }}">origin</a> is unsealed.'
      : (6-got) + ' fragment' + ((6-got)===1?'':'s') + ' to unseal the origin. Read files, dig deep, poke the edges.';
  })();

  // ---- live transmission log (cosmetic cycling feed) ----
  (function(){
    var LINES = [
      'SIGNAL: ████████ origin masked',
      'INTERPLANETARY CONSTRUCTION CO. — carrier wave detected',
      'Subject Zero last pinged: the deep mine',
      'Princess flight-log synced',
      'Ep.01 boards: SC 01 locked',
      'Dispatch queue: nominal',
      'Chess City gate — status: sealed',
      'Hyperspeed Box telemetry: ░░ corrupt ░░',
      'Operative network: holding the line'
    ];
    var feed = $('cc-feed'); var i = 0;
    function push(){
      var line = document.createElement('div'); line.className='cc-feed-line';
      var t = new Date(); var ts = ('0'+t.getUTCHours()).slice(-2)+':'+('0'+t.getUTCMinutes()).slice(-2);
      line.innerHTML = '<span class="cc-feed-t">'+ts+'</span> ' + esc(LINES[i % LINES.length]);
      feed.insertBefore(line, feed.firstChild);
      while (feed.children.length > 6) feed.removeChild(feed.lastChild);
      i++;
    }
    push(); push(); push();
    setInterval(push, 3200);
  })();
})();
</script>

<style>
.cc-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 12px; flex-wrap: wrap; border-bottom: 1px solid #3a2a6a; padding-bottom: 10px; }
.cc-kicker { font-family: 'Share Tech Mono', monospace; font-size: 0.7rem; letter-spacing: 0.14em; color: #ff8fd0; text-transform: uppercase; }
.cc-title { color: #F5C518; margin: 2px 0 0; font-size: 1.7rem; }
.cc-clock { font-family: 'Share Tech Mono', monospace; color: #6bffb8; font-size: 0.9rem; }
.cc-greet { color: #c9a7ff; margin: 12px 0 16px; }
.cc-greet a, .cc-frag-note a { color: #F5C518; }
.cc-muted { color: #7d6bb0; }
.cc-ok { color: #6bffb8; }

.cc-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; }
.cc-mod { background: rgba(20,12,45,0.6); border: 1px solid #3a2a6a; border-radius: 12px; padding: 14px; position: relative; }
.cc-mod--feed, .cc-mod--frags, .cc-mod--launch { grid-column: span 2; }
@media (max-width: 560px){ .cc-mod--feed, .cc-mod--frags, .cc-mod--launch { grid-column: span 1; } }
.cc-mod-label { font-family: 'Share Tech Mono', monospace; font-size: 0.7rem; letter-spacing: 0.1em; color: #9a7fd4; text-transform: uppercase; margin-bottom: 10px; }

.cc-status { display: flex; align-items: center; gap: 12px; }
.cc-rank-ico { font-size: 30px; }
.cc-codename { color: #f0e6ff; font-weight: 800; font-size: 1.05rem; }
.cc-rank { color: #9fe8ff; font-size: 0.82rem; }
.cc-credits { color: #c9a7ff; font-size: 0.9rem; margin: 10px 0; }
.cc-credits b { color: #F5C518; }
.cc-btn { display: inline-block; background: #221444; border: 1px solid #4a2f8a; color: #c9a7ff; border-radius: 999px; padding: 8px 14px; font-weight: 700; text-decoration: none; font-size: 0.85rem; transition: all 0.14s; }
.cc-btn:hover { border-color: #F5C518; color: #fff; }
.cc-btn-gold { background: #F5C518; color: #1a0f3d; border-color: #F5C518; }
.cc-btn-gold:hover { background: #ffd740; color: #1a0f3d; }

.cc-count { font-family: 'Share Tech Mono', monospace; font-size: 2.6rem; font-weight: 800; color: #F5C518; line-height: 1; }
.cc-count-lbl { color: #9a7fd4; font-size: 0.76rem; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 4px; }
.cc-devdays { color: #7d6bb0; font-size: 0.8rem; margin-top: 10px; }

.cc-daily-task { color: #f0e6ff; font-weight: 700; line-height: 1.4; }
.cc-daily-status { font-size: 0.84rem; margin: 8px 0 12px; }

.cc-frag-count { color: #F5C518; }
.cc-frag-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: 8px; }
.cc-frag { background: rgba(45,27,105,0.5); border: 1px solid #3a2a6a; border-radius: 10px; padding: 10px 6px; text-align: center; opacity: 0.6; }
.cc-frag.got { opacity: 1; border-color: #F5C518; box-shadow: 0 0 14px rgba(245,197,24,0.15); }
.cc-frag-ic { display: block; font-size: 22px; }
.cc-frag-n { display: block; font-family: 'Share Tech Mono', monospace; font-size: 0.6rem; color: #c9a7ff; margin-top: 4px; letter-spacing: 0.04em; }
.cc-frag-note { color: #9a7fd4; font-size: 0.82rem; margin-top: 10px; }

.cc-feed { font-family: 'Share Tech Mono', monospace; font-size: 0.78rem; color: #00ff41; background: #050a05; border: 1px solid #123012; border-radius: 8px; padding: 10px; min-height: 120px; }
.cc-feed-line { padding: 2px 0; opacity: 0.92; }
.cc-feed-t { color: #2f7a2f; }

.cc-launch { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px; }
.cc-launch a { background: rgba(45,27,105,0.5); border: 1px solid #3a2a6a; border-radius: 10px; padding: 12px; text-decoration: none; color: #c9a7ff; font-weight: 600; font-size: 0.88rem; transition: all 0.14s; }
.cc-launch a:hover { border-color: #F5C518; color: #fff; transform: translateY(-2px); }
</style>
