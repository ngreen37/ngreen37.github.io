---
layout: page
title: Your Dossier
permalink: /dossier/
---

<link rel="stylesheet" href="{{ '/assets/css/pjcc-profile.css' | relative_url }}">
<link rel="stylesheet" href="{{ '/assets/css/pjcc-companion.css' | relative_url }}">
<link rel="stylesheet" href="{{ '/assets/css/pjcc-creator.css' | relative_url }}">

<!-- ════════ COMMAND STRIP (renders instantly — works signed-out & offline) ════════ -->
<div class="cc-head">
  <div>
    <div class="cc-kicker">◈ Operative uplink</div>
    <h1 class="cc-title">Your Dossier</h1>
  </div>
  <div class="cc-clock" id="cc-clock">--:--:-- UTC</div>
</div>
<!-- One identity slot: shows the greeting instantly, then UPGRADES IN PLACE to your
     operative header once the account loads (no second "Your operative" section). -->
<div id="dsr-top"><p class="cc-greet" id="cc-greet">Establishing uplink…</p></div>

<div class="cc-grid">
  <div class="cc-mod cc-mod--daily">
    <div class="cc-mod-label">◆ Today's mission</div>
    <div class="cc-daily-task" id="cc-daily-task">—</div>
    <div class="cc-daily-status" id="cc-daily-status">—</div>
    <a class="cc-btn cc-btn-gold" id="cc-daily-go" href="#">Deploy ▸</a>
  </div>

  <div class="cc-mod cc-mod--frags">
    <div class="cc-mod-label">◆ Fragment recovery <span id="cc-frag-count" class="cc-frag-count"></span></div>
    <div class="cc-frag-grid" id="cc-frag-grid"></div>
    <div class="cc-frag-note" id="cc-frag-note"></div>
  </div>

  <div class="cc-mod cc-mod--climb">
    <div class="cc-mod-label">◆ The Gauntlet — your climb</div>
    <div class="cc-count" id="cc-climb-rank" style="font-size:1.2rem;line-height:1.15;">—</div>
    <div class="cc-count-lbl" id="cc-climb-sub">—</div>
    <a class="cc-btn cc-btn-gold" id="cc-climb-go" href="{{ '/games/the-gauntlet/' | relative_url }}" style="margin-top:8px;">Enter the tower ▸</a>
  </div>
</div>

<script>
/* The Climb — the Gauntlet rank surfaced sitewide (#6). Reads the game's own
   localStorage, so it renders for everyone (guest, offline, signed-in). */
(function () {
  var NAMES = ['The Checker Town Open Champion','The Sand-Mine Foreman','The Tidecaller','The Shogi Sentinel','The City Gatekeeper','The Auditor','The Enforcer','The Vice President','The Heir Apparent','The CEO'];
  var RANKS = ['Recruit','Checker-Town Champion','Sand-Mine Survivor','Sea-Crosser','Isle-Tested','Gatebreaker','Tower Initiate','Floor-Fighter','Near the Summit',"At the CEO's Door",'Champion of Chess City'];
  var prog = {}; try { prog = JSON.parse(localStorage.getItem('pjcc.gauntlet.v2')) || {}; } catch (e) {}
  var beaten = prog.beaten || {}, cleared = 0, cur = NAMES.length;
  for (var i = 0; i < NAMES.length; i++) { if (beaten[i]) cleared++; }
  for (var j = 0; j < NAMES.length; j++) { if (!beaten[j]) { cur = j; break; } }
  var rk = document.getElementById('cc-climb-rank'), sub = document.getElementById('cc-climb-sub'), go = document.getElementById('cc-climb-go');
  if (rk) rk.textContent = cleared > 0 ? RANKS[cleared] : 'Unranked';
  if (sub) sub.textContent = (cleared === 0) ? 'Begin the climb — Floor 1 of 10'
    : (cur >= NAMES.length) ? 'Crowned — all ten floors cleared 👑'
    : 'Floor ' + (cur + 1) + ' of 10 · ' + NAMES[cur] + ' next';
  if (go && cleared > 0) { go.setAttribute('href', go.getAttribute('href') + '#climb'); go.textContent = (cur >= NAMES.length) ? 'The tower ▸' : 'Continue ▸'; }
})();
</script>

<!-- ── Identity forge — build your look (instant; signed-out & offline) ── -->
<div id="forge-mount"></div>
<p class="pjcc-sub" style="margin-top:6px" id="forge-sync-note">Build your operative <em>and</em> your companion — base, skin tone, aura, headwear, emblem, name, and story. Change anything, any time. <span id="forge-sync-state">Saved on this device; <a href="#dossier-body">sign in</a> to carry it across every device.</span></p>

<!-- ── Operative record — loads with your account, inline into the one dossier ── -->
<div id="dossier-body"><p class="lb-empty">Loading your record…</p></div>

<script src="{{ '/assets/js/pjcc-config.js' | relative_url }}"></script>
<script src="{{ '/assets/js/pjcc-profile.js' | relative_url }}"></script>
<script src="{{ '/assets/js/pjcc-companion.js' | relative_url }}"></script>
<script src="{{ '/assets/js/pjcc-creator.js' | relative_url }}"></script>
<script>
/* The Identity Forge card — renders instantly for everyone (guest, offline, or
   signed-in); re-renders when the account loads so it can prefer your synced look. */
(function () {
  var mount = document.getElementById('forge-mount');
  if (!mount || !window.PJCCForge) return;
  PJCCForge.renderCard(mount);
  if (window.PJCC && PJCC.ready) PJCC.ready.then(function () { PJCCForge.renderCard(mount); });
})();
</script>

<script>
/* Command strip — instant, no network dependency (slow connections still get a useful page). */
(function () {
  function $(id){ return document.getElementById(id); }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function best(game){ try { if (window.PJCC && PJCC.localBest) return PJCC.localBest(game); return parseInt(localStorage.getItem('pjcc.best.'+game),10)||0; } catch(e){ return 0; } }
  function gameUrl(slug){ return '{{ "/games/" | relative_url }}'.replace(/\/$/,'') + '/' + slug + '/'; }
  function has(k){ try { return !!localStorage.getItem(k); } catch(e){ return false; } }

  function tick(){ var d=new Date(); $('cc-clock').textContent = ('0'+d.getUTCHours()).slice(-2)+':'+('0'+d.getUTCMinutes()).slice(-2)+':'+('0'+d.getUTCSeconds()).slice(-2)+' UTC'; }
  tick(); setInterval(tick, 1000);

  function renderGreet(){
    var greet = $('cc-greet');
    if (!greet) return;   // once the account loads, the operative header replaces this slot
    try { if (window.PJCC && PJCC.getProfile) { var p = PJCC.getProfile();
      if (p && p.codename) { greet.innerHTML = 'Welcome back, <b>' + esc(p.codename) + '</b>. The board is yours.'; return; } } } catch(e){}
    greet.innerHTML = 'Uplink open. Your record is below — <a href="#dossier-body">claim a codename</a> to log it across every device.';
  }
  renderGreet();
  if (window.PJCC && PJCC.ready) PJCC.ready.then(renderGreet);
  if (window.PJCC && PJCC.onChange) PJCC.onChange(renderGreet);

  // daily mission (date-seeded, local check)
  (function(){
    var TASKS = [
      { t:'Score 600+ in Notation Blitz', go:'notation-run', ok:function(){ return best('notation-run')>=600; } },
      { t:'Solve 5 in Fork in the Road', go:'fork-in-the-road', ok:function(){ return best('fork-in-the-road')>=5; } },
      { t:'Reach 300+ in The Pirc Protocol', go:'pirc-protocol', ok:function(){ return best('pirc-protocol')>=300; } },
      { t:'Hold the gate in Siege on Chess City', go:'tower-defense', ok:function(){ return best('tower-defense')>=1; } },
      { t:'Complete a Knight’s Tour', go:'knights-tour', ok:function(){ return best('knights-tour')>=1; } },
      { t:'Score 100+ points in Sand Mine Depths', go:'sand-mine-depths', ok:function(){ return best('sand-mine-depths')>=100; } }
    ];
    function seed(s){ var h=2166136261; for(var i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return h>>>0; }
    var d=new Date(), ds=d.getUTCFullYear()+'-'+(d.getUTCMonth()+1)+'-'+d.getUTCDate();
    var task = TASKS[seed(ds)%TASKS.length];
    $('cc-daily-task').textContent = task.t;
    $('cc-daily-go').href = gameUrl(task.go);
    function refresh(){ $('cc-daily-status').innerHTML = task.ok() ? '<b class="cc-ok">✓ complete</b>' : '<span class="cc-muted">awaiting completion</span>'; }
    refresh();
    document.addEventListener('visibilitychange', function(){ if(!document.hidden) refresh(); });
  })();

  // fragment recovery grid (ARG — all local)
  (function(){
    var ORIGIN = [
      { k:'frag_classified', n:'CLASSIFIED', i:'🗎' }, { k:'frag_archive', n:'THE ARCHIVE', i:'🗄' },
      { k:'frag_dispatch', n:'DEAD DROP', i:'📡' }, { k:'frag_recovery', n:'RECOVERY SIGNAL', i:'🧭' },
      { k:'frag_konami', n:"OPERATOR'S CODE", i:'🎮' }, { k:'frag_qd', n:'HYPERSPEED BOX', i:'⚡' }
    ];
    var grid = $('cc-frag-grid'); var got = 0;
    ORIGIN.forEach(function(f){ var have=has(f.k); if(have) got++;
      var cell=document.createElement('div'); cell.className='cc-frag'+(have?' got':'');
      cell.innerHTML='<span class="cc-frag-ic">'+(have?f.i:'🔒')+'</span><span class="cc-frag-n">'+esc(have?f.n:'ENCRYPTED')+'</span>';
      cell.title = have ? f.n+' — recovered' : 'Locked'; grid.appendChild(cell); });
    $('cc-frag-count').textContent = got + ' / 6';
    $('cc-frag-note').innerHTML = got>=6
      ? 'All six recovered — the <a href="{{ '/classified/' | relative_url }}">origin</a> is unsealed.'
      : (6-got) + ' fragment' + ((6-got)===1?'':'s') + ' to unseal the origin. Read files, dig deep, poke the edges.';
  })();
})();
</script>

<script>
/* Operative profile — loads with your account (separate from the instant strip above). */
(function () {
  var el = document.getElementById('dossier-body');
  var top = document.getElementById('dsr-top');   // the unified identity slot (upgrades in place)
  function setTop(html) { if (top) top.innerHTML = html; }
  var GAMES = {
    'the-gauntlet': ['The Gauntlet', 'cleared'], 'clearance-delta': ['Clearance: DELTA', 'score'],
    'notation-run': ['Notation Blitz', 'score'], 'notation-accuracy': ['Notation · Timing', 'precision'], 'fork-in-the-road': ['Fork in the Road', 'solved'],
    'sand-mine-depths': ['Sand Mine Depths', 'points'], 'pirc-protocol': ['Pirc Protocol', 'flawless'],
    'shogi-island': ['Shogi Island', 'solved'], 'reading-room': ['The Reading Room', 'score'], 'knights-tour': ["Knight's Tour", 'score'],
    'blindfold': ['Blindfold Puzzles', 'solved'], 'tower-defense': ['Siege on Chess City', 'score'],
    'siege-endless': ['Siege · Endless', 'wave'], 'sky-run': ['Sky Run', 'score'], 'dungeon': ['Princess Dungeon', 'floors']
  };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function render() {
    if (!PJCC.enabled) { setTop('<p class="cc-greet">The operative network is offline — your local bests still count toward the missions above.</p>'); el.innerHTML = ''; return; }
    var user = PJCC.currentUser();
    var prof = PJCC.getProfile();
    if (!user) return renderLogin();
    if (!prof) return renderClaim();
    renderDossier(prof);
  }

  function renderLogin() {
    setTop('<p class="cc-greet">Uplink open — build your look below, or <a href="#dsr-login">sign in</a> to sync your operative across every device.</p>');
    el.innerHTML =
      '<div class="dsr-card"><h2 class="dsr-h">Operative sign-in</h2>' +
      '<p class="pjcc-sub">Enter your email and we will send a one-click login link. Your operative — codename, avatar, credits — follows you across every device.</p>' +
      '<div class="ml-form"><input id="dsr-email" type="email" class="pjcc-input" placeholder="you@email.com"><button id="dsr-login" class="pjcc-btn">Send login link</button></div>' +
      '<p id="dsr-msg" class="pjcc-sub"></p></div>';
    document.getElementById('dsr-login').onclick = function () {
      var email = document.getElementById('dsr-email').value.trim();
      if (!email) return;
      var btn = document.getElementById('dsr-login');
      if (btn.disabled) return;                       // one email per click, not per tap-tap
      btn.disabled = true; btn.textContent = 'Sending…';
      PJCC.signInMagic(email).then(function () {
        document.getElementById('dsr-msg').textContent = '✉ Check your email for the login link, then return here.';
      }).catch(function () {
        btn.disabled = false; btn.textContent = 'Send login link';
      });
    };
  }

  function renderClaim() {
    setTop('<p class="cc-greet">Signed in — one last step: choose your codename below.</p>');
    el.innerHTML =
      '<div class="dsr-card"><h2 class="dsr-h">Choose your codename</h2>' +
      '<div class="ml-form"><input id="dsr-name" type="text" maxlength="24" class="pjcc-input" placeholder="codename"><button id="dsr-claim" class="pjcc-btn">Claim</button></div>' +
      '<p id="dsr-claim-msg" class="pjcc-sub"></p></div>';
    document.getElementById('dsr-claim').onclick = function () {
      var name = document.getElementById('dsr-name').value.trim();
      if (!name) return;
      PJCC.claimCodename(name).then(render).catch(function (e) {
        document.getElementById('dsr-claim-msg').textContent =
          (e && e.message === 'codename taken') ? 'That codename is taken — try another.' : 'Could not claim — try again.';
      });
    };
  }

  async function renderDossier(prof) {
    var credits = prof.credits || 0;
    var rank = PJCC.rankFor(credits);
    var next = PJCC.nextRank(credits);
    var stats = await PJCC.myStats();
    var totalPlays = stats.reduce(function (a, s) { return a + (s.plays || 0); }, 0);
    var title = PJCC.titleLabel(prof);
    var lvl = PJCC.companionLevel(totalPlays);
    var theme = PJCC.themeFor(prof);

    // The identity HEADER rises to the top slot (upgrading the greeting in place);
    // everything below is the record, which flows inline in the one dossier.
    var head = '<div class="dsr-head" style="background:' + theme.bg + ';border-color:' + theme.accent + '">' +
      '<div class="dsr-avatar" style="border-color:' + theme.accent + '">' + PJCC.avatarEmoji(prof) + '<span class="dsr-lvl" style="background:' + theme.accent + '">Lv ' + lvl.level + '</span>' + (window.PJCCPet ? '<span class="dsr-pet-badge">' + PJCCPet.petEmoji() + '</span>' : '') + '</div>' +
      '<div><div class="dsr-name" style="color:' + theme.accent + '">' + esc(prof.codename) + (title ? ' <span class="dsr-title-flair">' + esc(title) + '</span>' : '') + '</div>' +
      '<div class="dsr-rank">' + esc(rank.name) + ' · <span class="pjcc-credits">' + credits + ' credits</span></div></div>' +
      '<span class="pjcc-spacer"></span>' +
      '<button class="pjcc-btn" id="dsr-share">📸 Share card</button>' +
      '<a class="pjcc-trophy" href="/shopkeeper/">🛒 Shopkeeper</a>' +
      '<a class="pjcc-trophy" href="/leaderboards/">🏆 Leaderboards</a>' +
      '<button class="pjcc-btn-ghost" id="dsr-out">Sign out</button></div>';

    var xpPct = lvl.span ? Math.round(lvl.into / lvl.span * 100) : 100;
    var html = '<div class="dsr-companion">' +
      '<div id="pet-mood-card"></div>' +
      '<div class="dsr-comp-stage" style="margin-top:14px;">Operative progress · Lv ' + lvl.level + ' ' + esc(lvl.stage) + '</div>' +
      '<div class="dsr-xp"><div class="dsr-xp-fill" style="width:' + xpPct + '%"></div></div>' +
      '<div class="pjcc-sub">' + (lvl.next ? ((lvl.span - lvl.into) + ' more rounds to Lv ' + (lvl.level + 1)) : 'Max level — top dog of the board.') + '</div></div>';

    var stk = PJCC.streakInfo();
    var flameOn = stk.current > 0;
    html += '<div class="dsr-flame ' + (flameOn ? 'lit' : 'cold') + '" style="--acc:' + theme.accent + '">' +
      '<div class="dsr-flame-icon">' + (flameOn ? '🔥' : '🕯️') + '</div>' +
      '<div class="dsr-flame-body">' +
        '<div class="dsr-flame-num">' + stk.current + '<span> day' + (stk.current === 1 ? '' : 's') + ' active' + (stk.playedToday ? '' : ' — play today to keep it!') + '</span></div>' +
        '<div class="pjcc-sub">Longest run: ' + stk.best + ' days. Any game you play counts toward the flame.</div>' +
      '</div></div>';

    var season = PJCC.seasonInfo();
    html += '<div class="dsr-season"><span class="dsr-season-tag">SEASON</span> <b>' + esc(season.name) + '</b>' +
      ' <span class="pjcc-sub">· ' + season.daysLeft + ' day' + (season.daysLeft === 1 ? '' : 's') + ' left · winners enter the <a href="/hall-of-fame/">Hall of Fame</a></span></div>';

    var wp = PJCC.worldProgress(stats);
    html += '<h2 class="dsr-h">The journey</h2><div class="dsr-map">';
    wp.stops.forEach(function (s, i) {
      html += '<div class="dsr-stop ' + (s.reached ? 'reached' : '') + '">' +
        '<div class="dsr-here">' + (i === wp.furthest ? PJCC.avatarEmoji(prof) + (window.PJCCPet ? '<span class="dsr-here-pet" title="Your companion walks with you">' + PJCCPet.petEmoji() + '</span>' : '') : '') + '</div>' +
        '<div class="dsr-dot"></div><div class="dsr-stop-name">' + esc(s.name) + '</div></div>';
    });
    html += '</div>';

    html += '<h2 class="dsr-h">Clearance ladder</h2><div class="dsr-ladder">';
    PJCC.RANKS.forEach(function (r) {
      var got = credits >= r.min;
      html += '<div class="dsr-rung ' + (got ? 'got' : 'locked') + '">' +
        '<div class="dsr-rung-top"><span class="dsr-rung-name">' + esc(r.name) + '</span>' +
        '<span class="dsr-rung-min">' + r.min + ' cr</span></div>' +
        '<div class="dsr-frag">' + (got ? esc(r.frag) : '▒▒▒▒ REDACTED — clearance ' + r.name + ' required ▒▒▒▒') + '</div></div>';
    });
    html += '</div>';

    html += '<h2 class="dsr-h">Achievements</h2><div class="dsr-ach-grid">';
    PJCC.earnedAchievements(prof, stats).forEach(function (a) {
      html += '<div class="dsr-ach ' + (a.earned ? 'got' : 'locked') + '">' +
        '<div class="dsr-ach-icon">' + a.icon + '</div><div class="dsr-ach-label">' + esc(a.label) + '</div>' +
        '<div class="dsr-ach-desc">' + esc(a.desc) + '</div></div>';
    });
    html += '</div>';

    var unlocked = PJCC.unlockedTitles(prof, stats);
    var equipped = (prof.companion && prof.companion.title) || '';
    html += '<h2 class="dsr-h">Title flair</h2><div class="dsr-titles">';
    unlocked.forEach(function (key) {
      html += '<button class="dsr-title-chip ' + (key === equipped ? 'on' : '') + '" data-title="' + key + '">' + esc(PJCC.TITLES[key].label) + '</button>';
    });
    html += '<button class="dsr-title-chip ' + (equipped === '' ? 'on' : '') + '" data-title="">None</button></div>' +
      '<p class="pjcc-sub">Unlock more through achievements and the <a href="/shopkeeper/">Shopkeeper</a>.</p>';

    // Condensed 2026-07-12 (Nate): only games you've actually PLAYED, one tight row
    // each (name · best · a small ✓ when you've passed the creator's ghost). The
    // full never-played roster + "X to go" chase text is gone.
    var played = Object.keys(GAMES).filter(function (key) {
      return stats.filter(function (x) { return x.game === key; })[0];
    });
    html += '<h2 class="dsr-h">Service record <span class="pjcc-sub" style="font-weight:normal">· 👻 = beat the creator</span></h2>';
    if (!played.length) {
      html += '<p class="lb-empty">No missions logged yet — play anything and your record starts here.</p>';
    } else {
      html += '<table class="lb-table"><tbody>';
      played.forEach(function (key) {
        var s = stats.filter(function (x) { return x.game === key; })[0];
        var g = PJCC.vsGhost(key, s.best_score);
        var ghost = (g && g.beat) ? ' <span class="dsr-ghost beat">✓👻</span>' : '';
        html += '<tr><td class="lb-name">' + esc(GAMES[key][0]) + '</td>' +
          '<td class="pjcc-sub">' + s.plays + ' runs</td>' +
          '<td class="lb-score">' + s.best_score + ' ' + GAMES[key][1] + ghost + '</td></tr>';
      });
      html += '</tbody></table>';
    }

    var link = PJCC.inviteLink(prof);
    html += '<h2 class="dsr-h">Invite an operative</h2>' +
      '<p class="pjcc-sub">Share your link — when a friend signs up through it, you each earn 10 credits.</p>' +
      '<div class="dsr-invite"><input id="dsr-invite" class="pjcc-input" readonly value="' + esc(link) + '"><button id="dsr-copy" class="pjcc-btn">Copy</button></div>';

    setTop(head);          // identity header → the top slot (upgrades the greeting in place)
    el.innerHTML = html;   // the record → below the modules + forge, one continuous flow

    if (window.PJCCPet) PJCCPet.renderCard(document.getElementById('pet-mood-card'), stats);
    Array.prototype.forEach.call(el.querySelectorAll('.dsr-title-chip'), function (b) {
      b.onclick = function () { PJCC.setTitle(b.getAttribute('data-title')).then(render); };
    });
    var copyBtn = document.getElementById('dsr-copy');
    if (copyBtn) copyBtn.onclick = function () {
      var inp = document.getElementById('dsr-invite'); inp.select();
      try { navigator.clipboard.writeText(inp.value); } catch (e) { document.execCommand('copy'); }
      copyBtn.textContent = 'Copied!'; setTimeout(function () { copyBtn.textContent = 'Copy'; }, 1500);
    };
    var shareBtn = document.getElementById('dsr-share');
    if (shareBtn) shareBtn.onclick = function () { shareCard(prof, rank, lvl, credits, theme); };
    var outBtn = document.getElementById('dsr-out');
    if (outBtn) outBtn.onclick = function () { PJCC.signOut().then(render); };
  }

  function shareCard(prof, rank, lvl, credits, theme) {
    var c = document.createElement('canvas'); c.width = 600; c.height = 340;
    var g = c.getContext('2d');
    var grad = g.createLinearGradient(0, 0, 600, 340);
    grad.addColorStop(0, '#1f1147'); grad.addColorStop(1, '#34206f');
    g.fillStyle = grad; g.fillRect(0, 0, 600, 340);
    g.strokeStyle = theme.accent; g.lineWidth = 6; g.strokeRect(10, 10, 580, 320);
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = '92px sans-serif'; g.fillText(PJCC.avatarEmoji(prof), 110, 140);
    g.textAlign = 'left';
    g.fillStyle = theme.accent; g.font = 'bold 42px Poppins, system-ui, sans-serif';
    g.fillText(prof.codename, 195, 92);
    var ttl = PJCC.titleLabel(prof);
    g.fillStyle = '#cdbcf2'; g.font = '21px Inter, system-ui, sans-serif';
    g.fillText((ttl ? ttl + ' · ' : '') + rank.name, 195, 132);
    g.fillText('Level ' + lvl.level + ' · ' + lvl.stage, 195, 164);
    g.fillStyle = '#6bffb8'; g.font = 'bold 32px Poppins, system-ui, sans-serif';
    g.fillText(credits + ' credits', 110, 255);
    g.fillStyle = '#9a7fd4'; g.font = '16px Inter, system-ui, sans-serif';
    g.fillText('mcpuppystudios.com · Princess and the Journey to Chess City', 30, 312);
    c.toBlob(function (blob) {
      if (!blob) return;
      var file = new File([blob], 'pjcc-operative.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file], title: 'My PJCC operative', text: 'Operative ' + prof.codename + ' — mcpuppystudios.com' }).catch(function () {});
      } else {
        var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'pjcc-operative.png'; a.click();
      }
    }, 'image/png');
  }

  // The Forge's "sign in to sync" line only makes sense while signed OUT —
  // once you're in, it flips to a synced note instead of nagging.
  function syncNote() {
    var el = document.getElementById('forge-sync-state');
    if (!el) return;
    if (PJCC.enabled && PJCC.currentUser()) el.innerHTML = '<span style="color:#6bffb8">✓ Signed in — synced across your devices.</span>';
    else el.innerHTML = 'Saved on this device; <a href="#dossier-body">sign in</a> to carry it across every device.';
  }

  PJCC.onChange(function () { render(); syncNote(); });
  PJCC.ready.then(function () { render(); syncNote(); });
})();
</script>

<style>
/* ---- command strip ---- */
.cc-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 12px; flex-wrap: wrap; border-bottom: 1px solid #3a2a6a; padding-bottom: 10px; }
.cc-kicker { font-family: 'Share Tech Mono', monospace; font-size: 0.7rem; letter-spacing: 0.14em; color: #ff8fd0; text-transform: uppercase; }
.cc-title { color: #F5C518; margin: 2px 0 0; font-size: 1.7rem; }
.cc-clock { font-family: 'Share Tech Mono', monospace; color: #6bffb8; font-size: 0.9rem; }
.cc-greet { color: #c9a7ff; margin: 12px 0 16px; }
.cc-greet a, .cc-frag-note a { color: #F5C518; }
.cc-muted { color: #7d6bb0; } .cc-ok { color: #6bffb8; }
.cc-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; }
.cc-mod { background: rgba(20,12,45,0.6); border: 1px solid #3a2a6a; border-radius: 12px; padding: 14px; position: relative; }
.cc-mod--frags { grid-column: span 2; }
@media (max-width: 560px){ .cc-mod--frags { grid-column: span 1; } }
.cc-mod-label { font-family: 'Share Tech Mono', monospace; font-size: 0.7rem; letter-spacing: 0.1em; color: #9a7fd4; text-transform: uppercase; margin-bottom: 10px; }
.cc-btn { display: inline-block; background: #221444; border: 1px solid #4a2f8a; color: #c9a7ff; border-radius: 999px; padding: 8px 14px; font-weight: 700; text-decoration: none; font-size: 0.85rem; transition: all 0.14s; }
.cc-btn:hover { border-color: #F5C518; color: #fff; }
.cc-btn-gold { background: #F5C518; color: #1a0f3d; border-color: #F5C518; }
.cc-btn-gold:hover { background: #ffd740; color: #1a0f3d; }
.cc-count { font-family: 'Share Tech Mono', monospace; font-size: 2.6rem; font-weight: 800; color: #F5C518; line-height: 1; }
.cc-count-lbl { color: #9a7fd4; font-size: 0.76rem; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 4px; }
.cc-daily-task { color: #f0e6ff; font-weight: 700; line-height: 1.4; }
.cc-daily-status { font-size: 0.84rem; margin: 8px 0 12px; }
.cc-frag-count { color: #F5C518; }
.cc-frag-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: 8px; }
.cc-frag { background: rgba(45,27,105,0.5); border: 1px solid #3a2a6a; border-radius: 10px; padding: 10px 6px; text-align: center; opacity: 0.6; }
.cc-frag.got { opacity: 1; border-color: #F5C518; box-shadow: 0 0 14px rgba(245,197,24,0.15); }
.cc-frag-ic { display: block; font-size: 22px; }
.cc-frag-n { display: block; font-family: 'Share Tech Mono', monospace; font-size: 0.6rem; color: #c9a7ff; margin-top: 4px; letter-spacing: 0.04em; }
.cc-frag-note { color: #9a7fd4; font-size: 0.82rem; margin-top: 10px; }

/* ---- operative profile ---- */
.dsr-card { background: #160c33; border: 1px solid #6b5fa0; border-radius: 12px; padding: 1.2rem 1.4rem; max-width: 560px; }
.dsr-h { color: #F5C518; margin: 1.6rem 0 0.6rem; font-size: 1.05rem; }
.dsr-head { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; background: linear-gradient(135deg,#1f1147,#34206f); border: 1px solid #F5C518; border-radius: 12px; padding: 14px 18px; }
.dsr-avatar { width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; font-size: 34px; border-radius: 50%; background: radial-gradient(circle at 35% 30%,#3a2a72,#160c33); border: 2px solid #F5C518; box-shadow: 0 0 14px rgba(245,197,24,0.5); position: relative; }
.dsr-name { color: #F5C518; font-size: 1.3rem; font-weight: 800; }
.dsr-rank { color: #b9a8e6; font-size: 0.88rem; }
.dsr-ladder { display: flex; flex-direction: column; gap: 8px; max-width: 640px; }
.dsr-rung { border: 1px solid #6b5fa0; border-radius: 8px; padding: 9px 12px; }
.dsr-rung.got { border-color: #F5C518; background: rgba(245,197,24,0.06); }
.dsr-rung.locked { opacity: 0.6; }
.dsr-rung-top { display: flex; justify-content: space-between; }
.dsr-rung-name { color: #f0e6ff; font-weight: 700; }
.dsr-rung-min { color: #9a7fd4; font-size: 0.78rem; }
.dsr-frag { color: #c9b6ef; font-size: 0.84rem; margin-top: 4px; font-style: italic; }
.dsr-rung.locked .dsr-frag { letter-spacing: 1px; font-style: normal; }
.dsr-lvl { position: absolute; bottom: -6px; right: -6px; background: #F5C518; color: #1a0f3d; font-size: 0.6rem; font-weight: 800; border-radius: 999px; padding: 1px 6px; border: 2px solid #160c33; }
.dsr-pet-badge { position: absolute; bottom: -7px; left: -7px; font-size: 22px; line-height: 1; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.55)); }
.dsr-title-flair { font-size: 0.7rem; vertical-align: middle; background: rgba(245,197,24,0.16); color: #F5C518; border: 1px solid #F5C518; border-radius: 999px; padding: 2px 9px; margin-left: 8px; letter-spacing: 0.04em; font-weight: 700; }
.dsr-companion { background: #160c33; border: 1px solid #6b5fa0; border-radius: 12px; padding: 12px 16px; margin-top: 12px; max-width: 560px; }
.dsr-comp-stage { color: #6bffb8; font-weight: 800; margin-bottom: 6px; }
.dsr-xp { background: #221347; border: 1px solid #6b5fa0; border-radius: 999px; height: 10px; overflow: hidden; margin-bottom: 4px; }
.dsr-xp-fill { background: linear-gradient(90deg,#6bffb8,#F5C518); height: 100%; }
.dsr-map { display: flex; gap: 0; overflow-x: auto; padding: 18px 4px 6px; max-width: 100%; }
.dsr-stop { position: relative; flex: 1 0 86px; text-align: center; }
.dsr-stop::before { content: ''; position: absolute; top: 26px; left: -50%; width: 100%; height: 2px; background: #3a2a72; z-index: 0; }
.dsr-stop:first-child::before { display: none; }
/* A connector lights gold only when BOTH stops it joins are reached. Otherwise a
   gold bar dangles left off a dim, unreached stop (Nate 2026-07-12). */
.dsr-stop.reached + .dsr-stop.reached::before { background: #F5C518; }
.dsr-here { height: 20px; font-size: 18px; white-space: nowrap; }
.dsr-here-pet { font-size: 13px; margin-left: -1px; vertical-align: 2px; }   /* the companion, trotting alongside (#12) */
.dsr-dot { width: 14px; height: 14px; border-radius: 50%; background: #3a2a72; border: 2px solid #6b5fa0; margin: 0 auto 6px; position: relative; z-index: 1; }
.dsr-stop.reached .dsr-dot { background: #F5C518; border-color: #F5C518; box-shadow: 0 0 10px rgba(245,197,24,0.6); }
.dsr-stop-name { color: #9a7fd4; font-size: 0.7rem; line-height: 1.2; }
.dsr-stop.reached .dsr-stop-name { color: #f0e6ff; }
.dsr-ach-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; max-width: 720px; }
.dsr-ach { background: #160c33; border: 1px solid #6b5fa0; border-radius: 10px; padding: 12px; text-align: center; }
.dsr-ach.got { border-color: #F5C518; box-shadow: 0 0 10px rgba(245,197,24,0.2); }
.dsr-ach.locked { opacity: 0.4; filter: grayscale(0.6); }
.dsr-ach-icon { font-size: 26px; }
.dsr-ach-label { color: #f0e6ff; font-weight: 700; font-size: 0.84rem; margin: 4px 0 2px; }
.dsr-ach-desc { color: #9a7fd4; font-size: 0.72rem; line-height: 1.3; }
.dsr-titles { display: flex; flex-wrap: wrap; gap: 8px; }
.dsr-title-chip { background: #2D1B69; color: #cdbcf2; border: 1px solid #6b5fa0; border-radius: 999px; padding: 6px 14px; cursor: pointer; font-size: 0.82rem; font-weight: 700; }
.dsr-title-chip:hover { border-color: #F5C518; color: #fff; }
.dsr-title-chip.on { background: #F5C518; color: #1a0f3d; border-color: #F5C518; }
.dsr-flame { display:flex; align-items:center; gap:12px; background:#160c33; border:1px solid #6b5fa0; border-radius:12px; padding:12px 16px; margin-top:12px; max-width:560px; }
.dsr-flame.lit { border-color: var(--acc,#F5C518); }
.dsr-flame-icon { font-size:30px; } .dsr-flame-num { color:#f0e6ff; font-weight:800; font-size:1.2rem; } .dsr-flame-num span { color:#9a7fd4; font-weight:400; font-size:0.8rem; }
.dsr-season { margin-top:12px; color:#c9b6ef; } .dsr-season-tag { font-family:'Share Tech Mono',monospace; font-size:0.66rem; letter-spacing:0.1em; color:#1a0f3d; background:#6bffb8; border-radius:4px; padding:2px 7px; }
.dsr-ghost { display:inline-block; font-size:0.74rem; color:#9a7fd4; } .dsr-ghost.beat { color:#6bffb8; }
.dsr-invite { display: flex; gap: 8px; flex-wrap: wrap; max-width: 560px; }
.dsr-invite input { flex: 1 1 280px; }
</style>
