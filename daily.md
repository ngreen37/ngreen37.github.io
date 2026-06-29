---
layout: page
title: Daily Dispatch
permalink: /daily/
---

<link rel="stylesheet" href="{{ '/assets/css/pjcc-profile.css' | relative_url }}">

<div class="dd-wrap">
  <div class="dd-head">
    <div class="dd-tag">◈ DEAD DROP — INTERCEPTED</div>
    <h1 class="dd-title">Daily Dispatch</h1>
    <p class="dd-sub">One coded word. The <b>same drop for every operative</b>, every day. Crack it in as few attempts as you can — your result posts to today's board, and a clean run keeps your <b>dispatch streak</b> alive.</p>
  </div>

  <div class="dd-bar">
    <div class="dd-chip">🗓 <b id="dd-date">—</b></div>
    <div class="dd-chip">🔥 streak <b id="dd-streak">0</b></div>
    <div class="dd-chip">⏳ next drop <b id="dd-count">—</b></div>
  </div>

  <div id="dd-grid" class="dd-grid"></div>
  <div id="dd-msg" class="dd-msg"></div>
  <div id="dd-kbd" class="dd-kbd"></div>

  <div id="dd-result" class="dd-result" style="display:none;"></div>

  <div class="dd-board">
    <h2 class="dd-h">Today's intercepts</h2>
    <div id="dd-leader"><p class="pjcc-sub">Sign in on your <a href="/dossier/">dossier</a> to post to the daily board.</p></div>
  </div>
</div>

<script src="{{ '/assets/js/pjcc-config.js' | relative_url }}"></script>
<script src="{{ '/assets/js/pjcc-profile.js' | relative_url }}"></script>
<script>
(function () {
  'use strict';
  var LEN = 5, ROWS = 6;
  // Date-seeded word pool — chess + PJCC lore, all 5 letters. Identical for everyone each day.
  var WORDS = ['QUEEN','ROOKS','CHECK','MATED','FORKS','BOARD','PAWNS','RANKS','FILES','KINGS',
    'MOVES','PIECE','TEMPO','LINES','DEPTH','BLITZ','RAPID','CLOCK','DRAWS','STALE','ROYAL','CROWN',
    'WHITE','BLACK','DUTCH','SWISS','MATES','OPENS','TRADE',
    'RIVAL','LOUIE','ARGUS','SHOGI','LEAFS','CRASH','MINES','SANDS','GATES','CROSS','SIEGE','DELTA',
    'CODES','RADIO','RELAY','VAULT','OMEGA','SCOUT','GUARD','HEIST','TRACE','GHOST'];
  // de-dupe + keep only clean 5-letter A-Z
  WORDS = WORDS.filter(function (w, i) { return /^[A-Z]{5}$/.test(w) && WORDS.indexOf(w) === i; });

  function today() { return PJCC.dayStamp ? PJCC.dayStamp() : (new Date()).toISOString().slice(0,10); }
  function hashStr(s) { var h = 2166136261; for (var i=0;i<s.length;i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h>>>0); }
  var SEED = today();
  var ANSWER = WORDS[hashStr(SEED) % WORDS.length];

  var KEYS = ['QWERTYUIOP','ASDFGHJKL','↵ZXCVBNM⌫'];
  var grid = document.getElementById('dd-grid'), kbd = document.getElementById('dd-kbd'), msgEl = document.getElementById('dd-msg');
  var cells = [], keyState = {}, row = 0, col = 0, cur = '', done = false;

  // ---- daily lock + streak (one official run per day) ----
  var LK = 'pjcc.daily.v2';  // bumped: clears locks/streaks left by the broken (off-by-one) build so today is playable
  function loadLock() { try { return JSON.parse(localStorage.getItem(LK)) || {}; } catch (e) { return {}; } }
  function saveLock(o) { try { localStorage.setItem(LK, JSON.stringify(o)); } catch (e) {} }
  function streakInfo() {
    var o = loadLock(); var t = today();
    var y = new Date(); y.setDate(y.getDate()-1); var yd = PJCC.dayStamp ? PJCC.dayStamp(y) : '';
    var alive = (o.last === t || o.last === yd);
    return { current: alive ? (o.streak||0) : 0, last: o.last||'', solvedToday: o.last === t && o.solved };
  }

  function buildGrid() {
    grid.innerHTML = ''; cells = [];
    for (var r=0;r<ROWS;r++){ var rowCells=[]; for (var c=0;c<LEN;c++){ var d=document.createElement('div'); d.className='dd-cell'; grid.appendChild(d); rowCells.push(d); } cells.push(rowCells); }
  }
  function buildKbd() {
    kbd.innerHTML='';
    KEYS.forEach(function (rowStr) {
      var kr=document.createElement('div'); kr.className='dd-krow';
      rowStr.split('').forEach(function (ch) {
        var b=document.createElement('button'); b.className='dd-key'+(ch.length>1||ch==='↵'||ch==='⌫'?' wide':''); b.textContent = ch==='↵'?'ENTER':ch==='⌫'?'⌫':ch;
        b.dataset.k = ch; if(keyState[ch]) b.classList.add(keyState[ch]);
        b.onclick=function(){ press(ch); }; kr.appendChild(b);
      }); kbd.appendChild(kr);
    });
  }
  function setMsg(t, cls){ msgEl.textContent=t||''; msgEl.className='dd-msg'+(cls?' '+cls:''); }

  function press(ch) {
    if (done) return;
    if (ch==='⌫'){ if(col>0){ col--; cur=cur.slice(0,-1); cells[row][col].textContent=''; cells[row][col].classList.remove('filled'); } return; }
    if (ch==='↵'){ submit(); return; }
    if (col>=LEN) return;
    cells[row][col].textContent=ch; cells[row][col].classList.add('filled'); cur+=ch; col++;
  }
  function evaluate(guess) {
    var res=Array(LEN).fill('absent'), counts={};
    for (var i=0;i<LEN;i++){ counts[ANSWER[i]]=(counts[ANSWER[i]]||0)+1; }
    for (var j=0;j<LEN;j++){ if(guess[j]===ANSWER[j]){ res[j]='correct'; counts[guess[j]]--; } }
    for (var k=0;k<LEN;k++){ if(res[k]==='correct') continue; if(counts[guess[k]]>0){ res[k]='present'; counts[guess[k]]--; } }
    return res;
  }
  var RANKW={absent:0,present:1,correct:2};
  function submit() {
    if (cur.length<LEN){ setMsg('Need '+LEN+' letters.', 'warn'); return; }
    var res=evaluate(cur);
    var r0=row;   // capture the row being scored — the reveal timeouts fire AFTER row++ below
    for (var i=0;i<LEN;i++){ (function(idx){ setTimeout(function(){ cells[r0][idx].classList.add(res[idx]); }, idx*90); })(i); }
    // keyboard state
    for (var c=0;c<LEN;c++){ var ch=cur[c]; if(RANKW[res[c]]>(RANKW[keyState[ch]||'']||-1)) keyState[ch]=res[c]; }
    var solved = res.every(function(x){ return x==='correct'; });
    row++; col=0; var guessNo=row; var g=cur; cur='';
    setTimeout(buildKbd, LEN*90);
    // wait for the tile reveal to finish so the result/share grid reads the final colours
    if (solved){ setTimeout(function(){ finish(true, guessNo); }, LEN*90); }
    else if (row>=ROWS){ setTimeout(function(){ finish(false, ROWS); }, LEN*90); }
    else setMsg('');
  }
  function scoreFor(solved, guesses) { return solved ? Math.max(20, (ROWS+1-guesses)*20) : 0; }
  function finish(solved, guesses) {
    done=true;
    var score=scoreFor(solved, guesses);
    // update streak (only counts a SOLVE, one per day)
    var o=loadLock(); var t=today();
    if (o.last!==t){
      var y=new Date(); y.setDate(y.getDate()-1); var yd=PJCC.dayStamp?PJCC.dayStamp(y):'';
      var newStreak = solved ? ((o.last===yd?(o.streak||0):0)+1) : 0;
      saveLock({ last:t, solved:solved, guesses:guesses, score:score, streak: solved?newStreak:(o.last===yd?o.streak:0) });
    }
    if (window.PJCC && PJCC.saveScore) PJCC.saveScore('daily-dispatch', score, { seed: SEED, credits: solved?2:0, data:{ word:ANSWER, guesses:guesses, solved:solved } });
    showResult(solved, guesses, score);
    refreshBar(); loadBoard();
  }
  function showResult(solved, guesses, score) {
    var box=document.getElementById('dd-result'); box.style.display='block';
    var emojiRows='';
    for (var r=0;r<row;r++){ for (var c=0;c<LEN;c++){ var cl=cells[r][c]; emojiRows += cl.classList.contains('correct')?'🟩':cl.classList.contains('present')?'🟨':'⬛'; } emojiRows+='\n'; }
    box.innerHTML = '<div class="dd-res-title">'+(solved?'DECRYPTED ✓':'CHANNEL LOST')+'</div>' +
      '<p>'+(solved?('You cracked the drop in <b>'+guesses+'</b> '+(guesses===1?'try':'tries')+' for <b>'+score+'</b> points.'):('The word was <b>'+ANSWER+'</b>. The channel goes dark until tomorrow.'))+'</p>' +
      '<pre class="dd-share">PJCC Daily '+SEED+'\n'+emojiRows+'</pre>' +
      '<button class="pjcc-btn" id="dd-copy">📋 Copy result</button>';
    var cp=document.getElementById('dd-copy'); if(cp) cp.onclick=function(){ try{ navigator.clipboard.writeText('PJCC Daily Dispatch '+SEED+' — '+(solved?guesses+'/'+ROWS:'X/'+ROWS)+'\n'+emojiRows+'\nmcpuppystudios.com/daily'); cp.textContent='✓ Copied'; }catch(e){} };
    setMsg('');
  }
  function lockToResult() {
    // already played today — replay the stored outcome (no new score)
    var o=loadLock();
    done=true;
    document.getElementById('dd-result').style.display='block';
    document.getElementById('dd-result').innerHTML='<div class="dd-res-title">'+(o.solved?'DECRYPTED ✓':'CHANNEL LOST')+'</div>' +
      '<p>You\'ve already run today\'s drop'+(o.solved?(' — solved in <b>'+o.guesses+'</b>.'):'.')+' Come back after the next dispatch.</p>';
    kbd.style.display='none';
  }
  function refreshBar() {
    document.getElementById('dd-date').textContent = SEED;
    document.getElementById('dd-streak').textContent = streakInfo().current;
  }
  function tickCountdown() {
    var now=new Date(); var mid=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1);
    var s=Math.max(0,Math.floor((mid-now)/1000)); var h=(s/3600|0), m=((s%3600)/60|0);
    document.getElementById('dd-count').textContent = h+'h '+m+'m';
  }
  async function loadBoard() {
    var host=document.getElementById('dd-leader');
    if (!window.PJCC || !PJCC.enabled){ host.innerHTML='<p class="pjcc-sub">Daily board is offline right now.</p>'; return; }
    try {
      await PJCC.ready;
      var rows = await PJCC.leaderboard('daily-dispatch', { scope:'daily', seed:SEED, limit:10 });
      if (!rows.length){ host.innerHTML='<p class="pjcc-sub">No intercepts logged yet today — be the first.</p>'; return; }
      var html='<table class="lb-table"><tbody>';
      rows.forEach(function (r,i){ html+='<tr><td class="lb-rank '+(i===0?'gold':i===1?'silver':i===2?'bronze':'')+'">'+(i+1)+'</td>'+
        '<td class="lb-av">'+PJCC.avatarEmoji({companion:r.companion})+'</td>'+
        '<td class="lb-name">'+String(r.codename).replace(/[<>&]/g,'')+'</td>'+
        '<td class="lb-score">'+r.score+'</td></tr>'; });
      host.innerHTML=html+'</tbody></table>';
    } catch (e){ host.innerHTML='<p class="pjcc-sub">Daily board unavailable.</p>'; }
  }

  document.addEventListener('keydown', function (e) {
    if (done) return;
    var k=e.key;
    if (k==='Enter') press('↵'); else if (k==='Backspace') press('⌫');
    else if (/^[a-zA-Z]$/.test(k)) press(k.toUpperCase());
  });

  // boot
  buildGrid(); buildKbd(); refreshBar(); tickCountdown(); setInterval(tickCountdown, 30000);
  if (streakInfo().solvedToday || loadLock().last === today()) { lockToResult(); }
  loadBoard();
})();
</script>

<style>
.dd-wrap { max-width: 520px; margin: 0 auto; }
.dd-head { text-align:center; margin-bottom: 12px; }
.dd-tag { color:#6bffb8; font-size:0.72rem; letter-spacing:3px; }
.dd-title { color:#F5C518; margin:2px 0 4px; }
.dd-sub { color:#c9a7ff; font-size:0.9rem; line-height:1.5; }
.dd-bar { display:flex; gap:8px; justify-content:center; margin-bottom:12px; flex-wrap:wrap; }
.dd-chip { background:#1d1140; border:1px solid #4a3a86; border-radius:999px; padding:5px 12px; font-size:0.8rem; color:#c9a7ff; }
.dd-chip b { color:#F5C518; }
.dd-grid { display:grid; grid-template-columns:repeat(5,1fr); grid-auto-rows:54px; gap:6px; width:300px; margin:0 auto 10px; }
.dd-cell { border:2px solid #3a2a6a; border-radius:6px; display:flex; align-items:center; justify-content:center;
  font-size:1.7rem; font-weight:800; color:#f0e6ff; text-transform:uppercase; background:#160c33; transition:transform .1s; }
.dd-cell.filled { border-color:#7a68c0; transform:scale(1.04); }
.dd-cell.correct { background:#2ecc71; border-color:#2ecc71; color:#042; }
.dd-cell.present { background:#F5C518; border-color:#F5C518; color:#221a02; }
.dd-cell.absent { background:#2a1414; border-color:#6a2f2f; color:#d98a8a; }
.dd-msg { text-align:center; min-height:20px; color:#ff8fd0; font-weight:700; margin-bottom:8px; }
.dd-msg.warn { color:#F5C518; }
.dd-kbd { display:flex; flex-direction:column; gap:6px; max-width:480px; margin:0 auto; }
.dd-krow { display:flex; gap:4px; justify-content:center; }
.dd-key { flex:1; min-width:0; height:46px; border:none; border-radius:5px; cursor:pointer; background:#2a1a5e; color:#e9defb;
  font-weight:bold; font-size:15px; box-shadow:0 2px 0 rgba(0,0,0,0.5); }
.dd-key.wide { flex:1.6; font-size:11px; }
.dd-key.correct { background:#2ecc71; color:#042; }
.dd-key.present { background:#F5C518; color:#221a02; }
.dd-key.absent { background:#2a1414; color:#c07a7a; }
.dd-result { max-width:480px; margin:16px auto 0; background:#160c33; border:1px solid #6b5fa0; border-radius:10px; padding:14px 16px; text-align:center; }
.dd-res-title { color:#F5C518; font-weight:900; letter-spacing:1px; }
.dd-result p { color:#c9a7ff; margin:6px 0; }
.dd-share { background:#0d0722; border-radius:8px; padding:8px; color:#cfeede; font-size:1rem; line-height:1.25; display:inline-block; margin:6px 0; }
.dd-board { max-width:480px; margin:18px auto 0; }
.dd-h { color:#F5C518; font-size:1rem; border-bottom:1px solid #3a2a6a; padding-bottom:6px; }
</style>
