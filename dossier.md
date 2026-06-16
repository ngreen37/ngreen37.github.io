---
layout: page
title: Operative Dossier
permalink: /dossier/
---

<link rel="stylesheet" href="{{ '/assets/css/pjcc-profile.css' | relative_url }}">

<div id="dossier"><p class="lb-empty">Loading…</p></div>

<script src="{{ '/assets/js/pjcc-config.js' | relative_url }}"></script>
<script src="{{ '/assets/js/pjcc-profile.js' | relative_url }}"></script>
<script>
(function () {
  var el = document.getElementById('dossier');
  // game key -> [label, unit]
  var GAMES = {
    'cipher': ['CIPHER', 'streak'], 'clearance-delta': ['Clearance: DELTA', 'score'],
    'notation-run': ['Notation Blitz', 'score'], 'fork-in-the-road': ['Fork in the Road', 'solved'],
    'sand-mine-depths': ['Sand Mine Depths', 'depth'], 'pirc-protocol': ['Pirc Protocol', 'flawless'],
    'ferry-delayed': ['Ferry Delayed', 'aced']
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

    // header
    var html = '<div class="dsr-head">' +
      '<div class="dsr-avatar">' + PJCC.avatarEmoji(prof) + '</div>' +
      '<div><div class="dsr-name">' + esc(prof.codename) + '</div>' +
      '<div class="dsr-rank">' + esc(rank.name) + ' · <span class="pjcc-credits">' + credits + ' credits</span></div></div>' +
      '<span class="pjcc-spacer"></span>' +
      '<a class="pjcc-trophy" href="/shopkeeper/">🛒 Shopkeeper</a>' +
      '<a class="pjcc-trophy" href="/leaderboards/">🏆 Leaderboards</a></div>';

    // progress to next rank
    if (next) {
      var span = next.min - rank.min;
      var into = credits - rank.min;
      var pct = Math.max(0, Math.min(100, Math.round(into / span * 100)));
      html += '<div class="dsr-prog-wrap"><div class="dsr-prog" style="width:' + pct + '%"></div></div>' +
        '<p class="pjcc-sub">' + (next.min - credits) + ' credits to <strong>' + esc(next.name) + '</strong></p>';
    } else {
      html += '<p class="pjcc-sub">Maximum clearance reached. There is nothing above Omega. (Or there is.)</p>';
    }

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

    // Kintsugi panel
    var plays = stats.reduce(function (a, s) { return a + (s.plays || 0); }, 0);
    var seams = new Array(Math.min(plays, 24) + 1).join('╱');
    html += '<h2 class="dsr-h">Kintsugi</h2>' +
      '<div class="dsr-kintsugi"><div class="dsr-seams">' + (seams || '·') + '</div>' +
      '<p class="pjcc-sub">' + plays + ' attempts logged. Every operative cracks — yours are filled with gold. <em>Kaizen: one percent better each run.</em></p></div>';

    // per-game bests
    html += '<h2 class="dsr-h">Service record</h2><table class="lb-table"><tbody>';
    Object.keys(GAMES).forEach(function (key) {
      var s = stats.filter(function (x) { return x.game === key; })[0];
      var label = GAMES[key][0], unit = GAMES[key][1];
      html += '<tr><td class="lb-name">' + esc(label) + '</td>' +
        '<td class="pjcc-sub">' + (s ? (s.plays + ' runs') : 'not yet played') + '</td>' +
        '<td class="lb-score">' + (s ? s.best_score + ' ' + unit : '—') + '</td></tr>';
    });
    html += '</tbody></table>';

    el.innerHTML = html;
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
</style>
