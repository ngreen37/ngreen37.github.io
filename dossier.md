---
layout: page
title: Operative Dossier
permalink: /dossier/
---

<link rel="stylesheet" href="{{ '/assets/css/pjcc-profile.css' | relative_url }}">
<link rel="stylesheet" href="{{ '/assets/css/pjcc-companion.css' | relative_url }}">

<div id="dossier"><p class="lb-empty">Loading…</p></div>

<script src="{{ '/assets/js/pjcc-config.js' | relative_url }}"></script>
<script src="{{ '/assets/js/pjcc-profile.js' | relative_url }}"></script>
<script src="{{ '/assets/js/pjcc-companion.js' | relative_url }}"></script>
<script>
(function () {
  var el = document.getElementById('dossier');
  // game key -> [label, unit]
  var GAMES = {
    'clearance-delta': ['Clearance: DELTA', 'score'],
    'notation-run': ['Notation Blitz', 'score'], 'notation-accuracy': ['Notation · Timing', 'precision'], 'fork-in-the-road': ['Fork in the Road', 'solved'],
    'sand-mine-depths': ['Sand Mine Depths', 'depth'], 'pirc-protocol': ['Pirc Protocol', 'flawless'],
    'shogi-island': ['Shogi Island', 'solved'],
    'blindfold': ['Blindfold Puzzles', 'solved'], 'tower-defense': ['Siege on Chess City', 'score'],
    'siege-endless': ['Siege · Endless', 'wave'], 'sky-run': ['Sky Run', 'score']
  };
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function render() {
    if (!PJCC.enabled) { el.innerHTML = '<p class="lb-empty">The operative network is offline.</p>'; return; }
    var user = PJCC.currentUser();
    var prof = PJCC.getProfile();
    if (!user) return renderLogin();
    if (!prof) return renderClaim();
    renderDossier(prof);
  }

  function renderLogin() {
    el.innerHTML =
      '<div class="dsr-card"><h2 class="dsr-h">Operative sign-in</h2>' +
      '<p class="pjcc-sub">Enter your email and we will send a one-click login link. Your operative — codename, avatar, credits — follows you across every device.</p>' +
      '<div class="ml-form"><input id="dsr-email" type="email" class="pjcc-input" placeholder="you@email.com"><button id="dsr-login" class="pjcc-btn">Send login link</button></div>' +
      '<p id="dsr-msg" class="pjcc-sub"></p></div>';
    document.getElementById('dsr-login').onclick = function () {
      var email = document.getElementById('dsr-email').value.trim();
      if (!email) return;
      PJCC.signInMagic(email).then(function () {
        document.getElementById('dsr-msg').textContent = '✉ Check your email for the login link, then return here.';
      });
    };
  }

  function renderClaim() {
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

    // header — themed, avatar with level ring, codename + title flair
    var html = '<div class="dsr-head" style="background:' + theme.bg + ';border-color:' + theme.accent + '">' +
      '<div class="dsr-avatar" style="border-color:' + theme.accent + '">' + PJCC.avatarEmoji(prof) + '<span class="dsr-lvl" style="background:' + theme.accent + '">Lv ' + lvl.level + '</span>' + (window.PJCCPet ? '<span class="dsr-pet-badge">' + PJCCPet.petEmoji() + '</span>' : '') + '</div>' +
      '<div><div class="dsr-name" style="color:' + theme.accent + '">' + esc(prof.codename) + (title ? ' <span class="dsr-title-flair">' + esc(title) + '</span>' : '') + '</div>' +
      '<div class="dsr-rank">' + esc(rank.name) + ' · <span class="pjcc-credits">' + credits + ' credits</span></div></div>' +
      '<span class="pjcc-spacer"></span>' +
      '<button class="pjcc-btn" id="dsr-share">📸 Share card</button>' +
      '<a class="pjcc-trophy" href="/shopkeeper/">🛒 Shopkeeper</a>' +
      '<a class="pjcc-trophy" href="/leaderboards/">🏆 Leaderboards</a></div>';

    // companion: the pet mood card (drills into the Den) + operative rank progress
    var xpPct = lvl.span ? Math.round(lvl.into / lvl.span * 100) : 100;
    html += '<div class="dsr-companion">' +
      '<div id="pet-mood-card"></div>' +
      '<div class="dsr-comp-stage" style="margin-top:14px;">Operative progress · Lv ' + lvl.level + ' ' + esc(lvl.stage) + '</div>' +
      '<div class="dsr-xp"><div class="dsr-xp-fill" style="width:' + xpPct + '%"></div></div>' +
      '<div class="pjcc-sub">' + (lvl.next ? ((lvl.span - lvl.into) + ' more rounds to Lv ' + (lvl.level + 1)) : 'Max level — top dog of the board.') + '</div></div>';

    // cross-game streak flame (days active in a row, any game)
    var stk = PJCC.streakInfo();
    var flameOn = stk.current > 0;
    html += '<div class="dsr-flame ' + (flameOn ? 'lit' : 'cold') + '" style="--acc:' + theme.accent + '">' +
      '<div class="dsr-flame-icon">' + (flameOn ? '🔥' : '🕯️') + '</div>' +
      '<div class="dsr-flame-body">' +
        '<div class="dsr-flame-num">' + stk.current + '<span> day' + (stk.current === 1 ? '' : 's') + ' active' + (stk.playedToday ? '' : ' — play today to keep it!') + '</span></div>' +
        '<div class="pjcc-sub">Longest run: ' + stk.best + ' days. Any game you play counts toward the flame.</div>' +
      '</div></div>';

    // current season / tour
    var season = PJCC.seasonInfo();
    html += '<div class="dsr-season"><span class="dsr-season-tag">SEASON</span> <b>' + esc(season.name) + '</b>' +
      ' <span class="pjcc-sub">· ' + season.daysLeft + ' day' + (season.daysLeft === 1 ? '' : 's') + ' left · winners enter the <a href="/hall-of-fame/">Hall of Fame</a></span></div>';

    // world map — Princess's journey
    var wp = PJCC.worldProgress(stats);
    html += '<h2 class="dsr-h">The journey</h2><div class="dsr-map">';
    wp.stops.forEach(function (s, i) {
      html += '<div class="dsr-stop ' + (s.reached ? 'reached' : '') + '">' +
        '<div class="dsr-here">' + (i === wp.furthest ? PJCC.avatarEmoji(prof) : '') + '</div>' +
        '<div class="dsr-dot"></div><div class="dsr-stop-name">' + esc(s.name) + '</div></div>';
    });
    html += '</div>';

    // clearance ladder + lore
    html += '<h2 class="dsr-h">Clearance ladder</h2><div class="dsr-ladder">';
    PJCC.RANKS.forEach(function (r) {
      var got = credits >= r.min;
      html += '<div class="dsr-rung ' + (got ? 'got' : 'locked') + '">' +
        '<div class="dsr-rung-top"><span class="dsr-rung-name">' + esc(r.name) + '</span>' +
        '<span class="dsr-rung-min">' + r.min + ' cr</span></div>' +
        '<div class="dsr-frag">' + (got ? esc(r.frag) : '▒▒▒▒ REDACTED — clearance ' + r.name + ' required ▒▒▒▒') + '</div></div>';
    });
    html += '</div>';

    // achievements
    html += '<h2 class="dsr-h">Achievements</h2><div class="dsr-ach-grid">';
    PJCC.earnedAchievements(prof, stats).forEach(function (a) {
      html += '<div class="dsr-ach ' + (a.earned ? 'got' : 'locked') + '">' +
        '<div class="dsr-ach-icon">' + a.icon + '</div><div class="dsr-ach-label">' + esc(a.label) + '</div>' +
        '<div class="dsr-ach-desc">' + esc(a.desc) + '</div></div>';
    });
    html += '</div>';

    // title flair selector
    var unlocked = PJCC.unlockedTitles(prof, stats);
    var equipped = (prof.companion && prof.companion.title) || '';
    html += '<h2 class="dsr-h">Title flair</h2><div class="dsr-titles">';
    unlocked.forEach(function (key) {
      html += '<button class="dsr-title-chip ' + (key === equipped ? 'on' : '') + '" data-title="' + key + '">' + esc(PJCC.TITLES[key].label) + '</button>';
    });
    html += '<button class="dsr-title-chip ' + (equipped === '' ? 'on' : '') + '" data-title="">None</button></div>' +
      '<p class="pjcc-sub">Unlock more through achievements and the <a href="/shopkeeper/">Shopkeeper</a>.</p>';

    // Kintsugi
    var seams = new Array(Math.min(totalPlays, 24) + 1).join('╱');
    html += '<h2 class="dsr-h">Kintsugi</h2>' +
      '<div class="dsr-kintsugi"><div class="dsr-seams">' + (seams || '·') + '</div>' +
      '<p class="pjcc-sub">' + totalPlays + ' attempts logged. Every operative cracks — yours are filled with gold. <em>Kaizen: one percent better each run.</em></p></div>';

    // service record — with "Beat the Creator" ghost markers
    html += '<h2 class="dsr-h">Service record <span class="pjcc-sub" style="font-weight:normal">· 👻 = the creator\'s mark to chase</span></h2><table class="lb-table"><tbody>';
    Object.keys(GAMES).forEach(function (key) {
      var s = stats.filter(function (x) { return x.game === key; })[0];
      var best = s ? s.best_score : 0;
      var g = PJCC.vsGhost(key, best);
      var ghostCell = '';
      if (g) ghostCell = g.beat
        ? '<span class="dsr-ghost beat">✓ beat 👻 ' + g.target + '</span>'
        : '<span class="dsr-ghost">👻 ' + g.target + ' · ' + (g.target - best) + ' to go</span>';
      html += '<tr><td class="lb-name">' + esc(GAMES[key][0]) + '</td>' +
        '<td class="pjcc-sub">' + (s ? (s.plays + ' runs') : 'not yet played') + '</td>' +
        '<td class="lb-score">' + (s ? s.best_score + ' ' + GAMES[key][1] : '—') + (ghostCell ? ' <br>' + ghostCell : '') + '</td></tr>';
    });
    html += '</tbody></table>';

    // Fork in the Road — per-tactic accuracy (forks / skewers / mates)
    var forkRow = stats.filter(function (x) { return x.game === 'fork-in-the-road'; })[0];
    var tac = forkRow && forkRow.data && forkRow.data.tactics;
    if (tac) {
      var CATL = { fork: 'Forks', skewer: 'Skewers', mate: 'Mates', pin: 'Pins' };
      var trows = '';
      ['fork', 'skewer', 'mate', 'pin'].forEach(function (c) {
        var e = tac[c];
        if (e && e.seen) {
          var pct = Math.round(100 * e.clean / e.seen);
          trows += '<tr><td class="lb-name">' + CATL[c] + '</td>' +
            '<td class="pjcc-sub">' + e.seen + ' seen</td>' +
            '<td class="lb-score">' + e.clean + '/' + e.seen + ' · ' + pct + '%</td></tr>';
        }
      });
      if (trows) html += '<h2 class="dsr-h">Tactic accuracy · Fork in the Road</h2><table class="lb-table"><tbody>' + trows + '</tbody></table>';
    }

    // Clearance: DELTA — missed-questions review (from this device)
    try {
      var missed = JSON.parse(localStorage.getItem('pjcc.clearance.missed.v1')) || [];
      if (missed.length){
        html += '<h2 class="dsr-h">Clearance — missed questions</h2><div style="display:flex;flex-direction:column;gap:6px;">';
        missed.slice(0, 12).forEach(function (mq) {
          html += '<div style="background:rgba(122,34,54,0.18);border-left:3px solid #F5C518;border-radius:6px;padding:7px 10px;">' +
            '<div style="color:#f0e6ff;font-size:0.86rem;line-height:1.35;">' + esc(mq.q) + '</div>' +
            '<div style="color:#6bffb8;font-size:0.8rem;margin-top:3px;">✔ ' + esc(mq.ans) + ' <span style="color:#9a7fd4;">· ' + esc(mq.cat || '') + '</span></div></div>';
        });
        html += '</div><p class="pjcc-sub">The questions that tripped you up — study them, then go re-earn that clearance.</p>';
      }
    } catch (e) {}

    // Blindfold Puzzles — per-motif accuracy + recent misses (from this device)
    try {
      var bfStats = JSON.parse(localStorage.getItem('pjcc.blindfold.stats.v1')) || {};
      var BFL = { mate: 'Mate-in-one', fork: 'Knight forks', other: 'Other' };
      var brows = '';
      ['mate', 'fork', 'other'].forEach(function (k) {
        var e = bfStats[k];
        if (e && e.seen) { var pct = Math.round(100 * e.clean / e.seen);
          brows += '<tr><td class="lb-name">' + BFL[k] + '</td><td class="pjcc-sub">' + e.seen + ' seen</td>' +
            '<td class="lb-score">' + e.clean + '/' + e.seen + ' · ' + pct + '%</td></tr>'; }
      });
      if (brows) html += '<h2 class="dsr-h">Blindfold accuracy · by motif</h2><table class="lb-table"><tbody>' + brows + '</tbody></table>';
      var bfMiss = JSON.parse(localStorage.getItem('pjcc.blindfold.missed.v1')) || [];
      if (bfMiss.length) {
        html += '<h2 class="dsr-h">Blindfold — recent misses</h2><div style="display:flex;flex-direction:column;gap:6px;">';
        bfMiss.slice(0, 10).forEach(function (mq) {
          html += '<div style="background:rgba(34,54,122,0.18);border-left:3px solid #c9a7ff;border-radius:6px;padding:7px 10px;">' +
            '<div style="color:#f0e6ff;font-size:0.84rem;line-height:1.35;">' + esc(mq.goal || '') + ' — answer <b style="color:#6bffb8">' + esc(mq.ans || '') + '</b></div>' +
            '<div style="color:#9a7fd4;font-size:0.78rem;margin-top:3px;">' + esc((mq.clue || '').slice(0, 150)) + '</div></div>';
        });
        html += '</div><p class="pjcc-sub">The positions you missed or revealed — picture each one again before you sleep.</p>';
      }
    } catch (e) {}

    // invite link
    var link = PJCC.inviteLink(prof);
    html += '<h2 class="dsr-h">Invite an operative</h2>' +
      '<p class="pjcc-sub">Share your link — when a friend signs up through it, you each earn 10 credits.</p>' +
      '<div class="dsr-invite"><input id="dsr-invite" class="pjcc-input" readonly value="' + esc(link) + '"><button id="dsr-copy" class="pjcc-btn">Copy</button></div>';

    el.innerHTML = html;

    // companion pet — inline mood card that drills into the Companion Den
    if (window.PJCCPet) PJCCPet.renderCard(document.getElementById('pet-mood-card'), stats);

    // wire title chips
    Array.prototype.forEach.call(el.querySelectorAll('.dsr-title-chip'), function (b) {
      b.onclick = function () { PJCC.setTitle(b.getAttribute('data-title')).then(render); };
    });
    // wire copy
    var copyBtn = document.getElementById('dsr-copy');
    if (copyBtn) copyBtn.onclick = function () {
      var inp = document.getElementById('dsr-invite');
      inp.select();
      try { navigator.clipboard.writeText(inp.value); } catch (e) { document.execCommand('copy'); }
      copyBtn.textContent = 'Copied!';
      setTimeout(function () { copyBtn.textContent = 'Copy'; }, 1500);
    };
    // shareable card
    var shareBtn = document.getElementById('dsr-share');
    if (shareBtn) shareBtn.onclick = function () { shareCard(prof, rank, lvl, credits, theme); };
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

  PJCC.onChange(render);
  PJCC.ready.then(render);
})();
</script>

<style>
.dsr-card { background: #160c33; border: 1px solid #6b5fa0; border-radius: 12px; padding: 1.2rem 1.4rem; max-width: 560px; }
.dsr-h { color: #F5C518; margin: 1.6rem 0 0.6rem; font-size: 1.05rem; }
.dsr-head { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; background: linear-gradient(135deg,#1f1147,#34206f); border: 1px solid #F5C518; border-radius: 12px; padding: 14px 18px; }
.dsr-avatar { width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; font-size: 34px; border-radius: 50%; background: radial-gradient(circle at 35% 30%,#3a2a72,#160c33); border: 2px solid #F5C518; box-shadow: 0 0 14px rgba(245,197,24,0.5); }
.dsr-name { color: #F5C518; font-size: 1.3rem; font-weight: 800; }
.dsr-rank { color: #b9a8e6; font-size: 0.88rem; }
.dsr-prog-wrap { background: #221347; border-radius: 999px; height: 12px; margin: 1rem 0 0.3rem; overflow: hidden; border: 1px solid #6b5fa0; max-width: 560px; }
.dsr-prog { background: linear-gradient(90deg,#6bffb8,#F5C518); height: 100%; }
.dsr-ladder { display: flex; flex-direction: column; gap: 8px; max-width: 640px; }
.dsr-rung { border: 1px solid #6b5fa0; border-radius: 8px; padding: 9px 12px; }
.dsr-rung.got { border-color: #F5C518; background: rgba(245,197,24,0.06); }
.dsr-rung.locked { opacity: 0.6; }
.dsr-rung-top { display: flex; justify-content: space-between; }
.dsr-rung-name { color: #f0e6ff; font-weight: 700; }
.dsr-rung-min { color: #9a7fd4; font-size: 0.78rem; }
.dsr-frag { color: #c9b6ef; font-size: 0.84rem; margin-top: 4px; font-style: italic; }
.dsr-rung.locked .dsr-frag { letter-spacing: 1px; font-style: normal; }
.dsr-kintsugi { background: #160c33; border: 1px solid #6b5fa0; border-radius: 10px; padding: 12px 14px; max-width: 640px; }
.dsr-seams { color: #F5C518; font-size: 1.4rem; letter-spacing: 2px; word-break: break-all; text-shadow: 0 0 8px rgba(245,197,24,0.5); }

/* avatar level badge + title flair */
.dsr-avatar { position: relative; }
.dsr-lvl { position: absolute; bottom: -6px; right: -6px; background: #F5C518; color: #1a0f3d; font-size: 0.6rem; font-weight: 800; border-radius: 999px; padding: 1px 6px; border: 2px solid #160c33; }
.dsr-pet-badge { position: absolute; bottom: -7px; left: -7px; font-size: 22px; line-height: 1; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.55)); }
.dsr-title-flair { font-size: 0.7rem; vertical-align: middle; background: rgba(245,197,24,0.16); color: #F5C518; border: 1px solid #F5C518; border-radius: 999px; padding: 2px 9px; margin-left: 8px; letter-spacing: 0.04em; font-weight: 700; }

/* companion level / XP */
.dsr-companion { background: #160c33; border: 1px solid #6b5fa0; border-radius: 12px; padding: 12px 16px; margin-top: 12px; max-width: 560px; }
.dsr-mood { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; color: #cdbcf2; font-size: 0.86rem; flex-wrap: wrap; }
.dsr-mood-emoji { font-size: 28px; }
.dsr-mood b { color: #f0e6ff; }
.dsr-comp-stage { color: #6bffb8; font-weight: 800; margin-bottom: 6px; }
.dsr-xp { background: #221347; border: 1px solid #6b5fa0; border-radius: 999px; height: 10px; overflow: hidden; margin-bottom: 4px; }
.dsr-xp-fill { background: linear-gradient(90deg,#6bffb8,#F5C518); height: 100%; }

/* world map */
.dsr-map { display: flex; gap: 0; overflow-x: auto; padding: 18px 4px 6px; max-width: 100%; }
.dsr-stop { position: relative; flex: 1 0 86px; text-align: center; }
.dsr-stop::before { content: ''; position: absolute; top: 26px; left: -50%; width: 100%; height: 2px; background: #3a2a72; z-index: 0; }
.dsr-stop:first-child::before { display: none; }
.dsr-stop.reached::before { background: #F5C518; }
.dsr-here { height: 20px; font-size: 18px; }
.dsr-dot { width: 14px; height: 14px; border-radius: 50%; background: #3a2a72; border: 2px solid #6b5fa0; margin: 0 auto 6px; position: relative; z-index: 1; }
.dsr-stop.reached .dsr-dot { background: #F5C518; border-color: #F5C518; box-shadow: 0 0 10px rgba(245,197,24,0.6); }
.dsr-stop-name { color: #9a7fd4; font-size: 0.7rem; line-height: 1.2; }
.dsr-stop.reached .dsr-stop-name { color: #f0e6ff; }

/* achievements */
.dsr-ach-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; max-width: 720px; }
.dsr-ach { background: #160c33; border: 1px solid #6b5fa0; border-radius: 10px; padding: 12px; text-align: center; }
.dsr-ach.got { border-color: #F5C518; box-shadow: 0 0 10px rgba(245,197,24,0.2); }
.dsr-ach.locked { opacity: 0.4; filter: grayscale(0.6); }
.dsr-ach-icon { font-size: 26px; }
.dsr-ach-label { color: #f0e6ff; font-weight: 700; font-size: 0.84rem; margin: 4px 0 2px; }
.dsr-ach-desc { color: #9a7fd4; font-size: 0.72rem; line-height: 1.3; }

/* title chips */
.dsr-titles { display: flex; flex-wrap: wrap; gap: 8px; }
.dsr-title-chip { background: #2D1B69; color: #cdbcf2; border: 1px solid #6b5fa0; border-radius: 999px; padding: 6px 14px; cursor: pointer; font-size: 0.82rem; font-weight: 700; }
.dsr-title-chip:hover { border-color: #F5C518; color: #fff; }
.dsr-title-chip.on { background: #F5C518; color: #1a0f3d; border-color: #F5C518; }

/* invite */
.dsr-invite { display: flex; gap: 8px; flex-wrap: wrap; max-width: 560px; }
.dsr-invite input { flex: 1 1 280px; }
</style>
