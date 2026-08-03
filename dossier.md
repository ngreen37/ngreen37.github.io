---
layout: page
title: Your Profile
permalink: /dossier/
---


{% comment %} ════════════════════════════════════════════════════════════════════════
     THE DOSSIER — cut down hard, 2026-07-12 (Nate: "there's WAY too much going on on
     the dossier page. We need to cut it way down").

     It had THIRTEEN stacked blocks. What went, and why:

       · the live UTC clock — decoration, and pure spy-cosplay on a page that's really
         just "your profile". (See the standing note about not overdoing the operative
         theme.)
       · "Today's mission" — a daily task module. Every other daily on this site has
         already been deleted (Clearance's, Siege's, the Daily Dispatch). This one was
         also quietly BROKEN: three of its six tasks pointed at Fork in the Road, The
         Pirc Protocol and Knight's Tour — games that were pruned from the site.
       · the fragment-recovery grid — a six-cell duplicate of the fragment counter that
         already sits in the site footer on every page.
       · the standalone Gauntlet "climb" module — folded into The Journey below, where
         "where am I in the world" already lives. It was the second progress widget.
       · the Season strip — its only payoff was the Hall of Fame, which is gone.
       · the Clearance ladder — eleven rungs, most of them showing ▒▒ REDACTED ▒▒. The
         one line that mattered (your rank) is in the header.
       · the separate pet-mood card and XP block — folded into the header.

     What's left is a profile: who you are · your look · where you are · your record ·
     bring a friend. Restore any of it from git.
     ═════════════════════════════════════════════════════════════════════════════ {% endcomment %}

<!-- One identity slot: shows the greeting instantly, then UPGRADES IN PLACE to your
     operative header once the account loads. Renders signed-out & offline. -->
<div id="dsr-top"><p class="cc-greet" id="cc-greet">Loading your profile…</p></div>

<!-- ── Identity forge — build your look (instant; signed-out & offline) ── -->
<div id="forge-mount"></div>
<p class="pjcc-sub" style="margin-top:6px" id="forge-sync-note">Build your operative <em>and</em> your companion. Change anything, any time. <span id="forge-sync-state">Saved on this device; <a href="#dossier-body">sign in</a> to keep it.</span></p>

<!-- ── Operative record — loads with your account, inline into the one dossier ── -->
<div id="dossier-body"><p class="lb-empty">Loading your record…</p></div>

<script src="{{ '/assets/js/pjcc-config.js' | relative_url }}"></script>
<script src="{{ '/assets/js/pjcc-profile.js' | relative_url }}"></script>
{%- comment -%} The companion is DRAWN now (2026-07-28) — pjcc-pet-art.js must load
     BEFORE the two modules that ask it for an animal, or both fall back to the old
     emoji with no error anywhere. {%- endcomment -%}
<script src="{{ '/assets/js/pjcc-pet-art.js' | relative_url }}"></script>
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
/* The greeting — instant, no network dependency, so a slow connection still lands on a
   useful page. It's replaced in place by the operative header once the account loads.
   (The UTC clock, the daily-mission module and the fragment grid that used to live in
   this script were all cut 2026-07-12 — see the note at the top of this file.) */
(function () {
  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function renderGreet(){
    var greet = document.getElementById('cc-greet');
    if (!greet) return;   // once the account loads, the operative header replaces this slot
    try { if (window.PJCC && PJCC.getProfile) { var p = PJCC.getProfile();
      if (p && p.codename) { greet.innerHTML = 'Welcome back, <b>' + esc(p.codename) + '</b>.'; return; } } } catch(e){}
    greet.innerHTML = 'Your record is below — <a href="#dossier-body">claim a codename</a> to carry it across every device.';
  }
  renderGreet();
  if (window.PJCC && PJCC.ready) PJCC.ready.then(renderGreet);
  if (window.PJCC && PJCC.onChange) PJCC.onChange(renderGreet);
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
    'shogi-island': ['Shogi Island', 'solved'], 'reading-room': ['The Reading Room', 'score'],
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
      '<p class="pjcc-sub">Enter your email and we will send a login link and a 6-digit code. Your codename, avatar and credits follow you.</p>' +
      '<div class="ml-form"><input id="dsr-email" type="email" class="pjcc-input" aria-label="Email address" placeholder="you@email.com"><button id="dsr-login" class="pjcc-btn">Send login link</button></div>' +
      '<p id="dsr-msg" class="pjcc-sub"></p></div>';
    document.getElementById('dsr-login').onclick = function () {
      var email = document.getElementById('dsr-email').value.trim();
      if (!email) return;
      var btn = document.getElementById('dsr-login');
      if (btn.disabled) return;                       // one email per click, not per tap-tap
      btn.disabled = true; btn.textContent = 'Sending…';
      PJCC.signInMagic(email).then(function () {
        renderCode(email);
      }).catch(function () {
        btn.disabled = false; btn.textContent = 'Send login link';
      });
    };
  }

  // The code path exists for the installed app: a tapped link always opens Safari,
  // which signs in the browser and leaves the app signed out.
  function renderCode(email) {
    setTop('<p class="cc-greet">Link sent — tap it, or type the code below to sign in right here.</p>');
    el.innerHTML =
      '<div class="dsr-card"><h2 class="dsr-h">Enter your code</h2>' +
      '<p class="pjcc-sub">We sent <strong>' + esc(email) + '</strong> a login link and a code. Either one works.</p>' +
      '<div class="ml-form"><input id="dsr-code" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="10" class="pjcc-input" aria-label="Sign-in code" placeholder="code"><button id="dsr-verify" class="pjcc-btn">Sign in</button></div>' +
      '<p id="dsr-msg" class="pjcc-sub"></p></div>';
    document.getElementById('dsr-verify').onclick = function () {
      var code = document.getElementById('dsr-code').value.trim();
      var btn = document.getElementById('dsr-verify');
      if (!code || btn.disabled) return;
      btn.disabled = true; btn.textContent = 'Checking…';
      // Promise.resolve() so a SYNCHRONOUS throw is caught as well — a stale cached
      // pjcc-profile.js has no verifyCode, and that used to freeze the button.
      Promise.resolve().then(function () {
        return PJCC.verifyCode(email, code);
      }).then(render).catch(function (e) {
        btn.disabled = false; btn.textContent = 'Sign in';
        document.getElementById('dsr-msg').textContent =
          !PJCC.verifyCode ? 'Close and reopen the app to update, then try again.'
          : (e && e.message === 'bad code') ? 'Type the whole code from the email.'
          : 'That code did not work — check it, or send a new one.';
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
    // ONE header carries the whole identity now: who you are, your rank, your credits,
    // your level AND your progress to the next one. The XP bar used to be a separate
    // block below, next to a separate pet-mood card, under a separate streak flame —
    // four cards to say "here's you".
    var xpPct = lvl.span ? Math.round(lvl.into / lvl.span * 100) : 100;
    var stk = PJCC.streakInfo();
    var streakChip = stk.current > 0
      ? '<span class="dsr-streak" title="Any game you play keeps the flame. Longest run: ' + stk.best + ' days.">🔥 ' + stk.current + 'd</span>'
      : '';
    /* ONE BOX (2026-07-27, Nate: "It's odd with the two boxes and same picture… combine
       and condense. I like the customize function. We don't need the second box.").
       These account facts used to be a whole second card, .dsr-head, stacked above the
       identity forge card and carrying a SECOND avatar of the same person. They're now
       painted INTO the forge card through PJCCForge.setAccountBlock, which re-runs on
       every card render — so an edit in the forge can't wipe them. */
    var accountHtml =
      '<div class="dsr-rank">Lv ' + lvl.level + ' · ' + esc(rank.name) + ' · <span class="pjcc-credits">' + credits + ' credits</span> ' + streakChip + '</div>' +
      '<div class="dsr-xp" title="' + (lvl.next ? ((lvl.span - lvl.into) + ' more rounds to Lv ' + (lvl.level + 1)) : 'Max level') + '"><div class="dsr-xp-fill" style="width:' + xpPct + '%"></div></div>' +
      '<div class="pjcc-sub">' + (lvl.next ? ((lvl.span - lvl.into) + ' more rounds to Lv ' + (lvl.level + 1)) : 'Max level — top dog of the board.') + '</div>' +
      '<div class="dsr-acts">' +
        '<button class="pjcc-btn" id="dsr-share">📸 Share card</button>' +
        '<a class="pjcc-trophy" href="/shopkeeper/">🛒 Shopkeeper</a>' +
        // 2026-07-28 (Nate): the altar belongs beside the credit count — this page and the
        // leaderboards are the two places a player actually sees the number.
        '<a class="pjcc-trophy" href="/the-gambit/">♟ The Gambit</a>' +
        '<a class="pjcc-trophy" href="/leaderboards/">🏆 Leaderboards</a>' +
        '<button class="pjcc-btn-ghost" id="dsr-out">Sign out</button>' +
      '</div>';
    function paintAccount(slot) {
      if (!slot) return;
      slot.innerHTML = accountHtml;
      var sb = slot.querySelector('#dsr-share');
      if (sb) sb.onclick = function () { shareCard(prof, rank, lvl, credits, theme); };
      var ob = slot.querySelector('#dsr-out');
      if (ob) ob.onclick = function () { PJCC.signOut().then(function () { location.reload(); }); };
    }
    if (window.PJCCForge && PJCCForge.setAccountBlock) PJCCForge.setAccountBlock(paintAccount);

    // WHERE YOU ARE — one block, not two. The Gauntlet floor used to be its own module
    // up in the command strip; it belongs here, beside the map, because it's the same
    // question. Read from the game's own save, so it's right even signed out.
    var GNAMES = ['The Checker Town Open Champion','The Sand-Mine Foreman','The Tidecaller','The Shogi Sentinel','The City Gatekeeper','The Auditor','The Enforcer','The Vice President','The Heir Apparent','The CEO'];
    var gprog = {}; try { gprog = JSON.parse(localStorage.getItem('pjcc.gauntlet.v2')) || {}; } catch (e) {}
    var gbeaten = gprog.beaten || {}, gcur = GNAMES.length;
    for (var gj = 0; gj < GNAMES.length; gj++) { if (!gbeaten[gj]) { gcur = gj; break; } }
    var climbLine = (gcur >= GNAMES.length)
      ? '<b>Crowned</b> — all ten floors cleared 👑'
      : 'The Gauntlet · <b>Floor ' + (gcur + 1) + ' of 10</b> — ' + esc(GNAMES[gcur]) + ' next';

    var wp = PJCC.journeyProgress(stats);
    var html = '<h2 class="dsr-h">The journey</h2><div class="dsr-map">';
    wp.stops.forEach(function (s, i) {
      html += '<div class="dsr-stop ' + (s.reached ? 'reached' : '') + '">' +
        '<div class="dsr-here">' + (i === wp.furthest ? PJCC.avatarEmoji(prof) + (window.PJCCPet ? '<span class="dsr-here-pet" title="Your companion walks with you">' + PJCCPet.petEmoji() + '</span>' : '') : '') + '</div>' +
        '<div class="dsr-dot"></div><div class="dsr-stop-name">' + esc(s.name) + '</div></div>';
    });
    html += '</div>';
    // Keep the URL a plain literal — the link gate (tests/links.check.js) reads hrefs out of
    // the source, and a path spliced together inside the attribute reads to it as a broken
    // link. Build the fragment separately and append it.
    var climbHref = '/games/the-gauntlet/';
    if (gcur > 0) climbHref += '#climb';
    html += '<a class="dsr-climb" href="' + climbHref + '">' +
      '<span class="dsr-climb-glyph">♛</span><span>' + climbLine + '</span><span class="dsr-climb-go">▸</span></a>';

    html += '<h2 class="dsr-h">Achievements</h2><div class="dsr-ach-grid">';
    PJCC.earnedAchievements(prof, stats).forEach(function (a) {
      html += '<div class="dsr-ach ' + (a.earned ? 'got' : 'locked') + '">' +
        '<div class="dsr-ach-icon">' + a.icon + '</div><div class="dsr-ach-label">' + esc(a.label) + '</div>' +
        '<div class="dsr-ach-desc">' + esc(a.desc) + '</div></div>';
    });
    html += '</div>';

    /* TITLE FLAIR removed 2026-07-27 (Nate: "Get rid of Title flair"). It was a row of
       chips picking a label to hang off your codename — a third identity control on a page
       we were trying to shrink. Titles themselves still exist (the Quartermaster sells two,
       and the altar's vault hands out two more); this page just doesn't run a picker. */

    /* SERVICE RECORD — folded shut by default (2026-07-13, Nate: "can we make the service
       record section collapse and expand? Default Collapse? I'm trying to cut down on all
       the noise").

       It's the right one to fold. Everything else on this dossier answers "who am I / where
       am I / what's next" — questions you have every visit. The service record answers "what
       have I already done", which you look up occasionally and deliberately. And it's the one
       block that GROWS: every new game you touch adds a row, so the page gets noisier the
       more you play it, which is exactly backwards. Folded, the summary still carries the
       headline (how many games are logged) — so it isn't hiding anything, it's just not
       reciting it.

       Condensed 2026-07-12: only games you've actually PLAYED, one tight row each
       (name · runs · best · a ✓ when you've passed the creator's ghost). */
    var played = Object.keys(GAMES).filter(function (key) {
      return stats.filter(function (x) { return x.game === key; })[0];
    });
    html += '<details class="dsr-fold"><summary class="dsr-fold-sum">' +
      '<span class="dsr-fold-t">Service record</span>' +
      '<span class="dsr-fold-hint">' + (played.length
        ? played.length + (played.length === 1 ? ' game logged' : ' games logged') + ' · 👻 = beat the creator'
        : 'nothing logged yet') +
      '</span></summary><div class="dsr-fold-body">';
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
    html += '</div></details>';

    var link = PJCC.inviteLink(prof);
    html += '<h2 class="dsr-h">Invite an operative</h2>' +
      '<p class="pjcc-sub">Share your link — when a friend signs up through it, you each earn 10 credits.</p>' +
      '<div class="dsr-invite"><input id="dsr-invite" class="pjcc-input" readonly value="' + esc(link) + '"><button id="dsr-copy" class="pjcc-btn">Copy</button></div>';

    // The greeting slot empties once you're signed in — the identity card below IS the
    // header now, so leaving a line here would just be a third box saying hello.
    setTop('');
    el.innerHTML = html;   // the record → below the one identity card, one continuous flow

    // repaint the card so the account strip lands inside it (and re-lands after any edit)
    var forgeMount = document.getElementById('forge-mount');
    if (forgeMount && window.PJCCForge) PJCCForge.renderCard(forgeMount);

    var copyBtn = document.getElementById('dsr-copy');
    if (copyBtn) copyBtn.onclick = function () {
      var inp = document.getElementById('dsr-invite'); inp.select();
      try { navigator.clipboard.writeText(inp.value); } catch (e) { document.execCommand('copy'); }
      copyBtn.textContent = 'Copied!'; setTimeout(function () { copyBtn.textContent = 'Copy'; }, 1500);
    };
    // (#dsr-share / #dsr-out live inside the identity card now and are wired by
    //  paintAccount above, which runs on every card render.)
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
/* ---- the greeting (the whole "command strip" — clock, daily-mission module, fragment
       grid, climb module — was cut 2026-07-12 with its styles; see the note up top) ---- */
.cc-greet { color: #c9a7ff; margin: 12px 0 16px; }
.cc-greet a { color: #F5C518; }

/* ---- operative profile ---- */
.dsr-card { background: var(--surface-2); border: 1px solid #6b5fa0; border-radius: var(--r-md); padding: 1.2rem 1.4rem; max-width: 560px; }
.dsr-h { color: #F5C518; margin: 1.6rem 0 0.6rem; font-size: 1.05rem; }

/* a foldable section — the service record (shut by default; see the note in the renderer).
   Styled to read as a heading you can press, NOT as a card: same gold, same weight, same
   place in the flow as a .dsr-h. The only new thing on the page is the twisty. */
.dsr-fold { margin: 1.6rem 0 0.6rem; }
.dsr-fold > summary { list-style: none; cursor: pointer; display: flex; align-items: baseline;
  gap: 9px; flex-wrap: wrap; }
.dsr-fold > summary::-webkit-details-marker { display: none; }
.dsr-fold > summary::before { content: '▸'; color: #9a7fd4; align-self: center;
  transition: transform 0.2s ease; }
.dsr-fold[open] > summary::before { transform: rotate(90deg); }
.dsr-fold > summary:hover .dsr-fold-t { color: #ffd740; }
.dsr-fold-t { color: #F5C518; font-size: 1.05rem; font-weight: 700; }
.dsr-fold-hint { color: #9a7fd4; font-size: 0.8rem; }
.dsr-fold-body { padding-top: 0.6rem; }

/* 2026-07-13 touch sweep: the inline "sign in" link in the greeting measured 53x20. */
@media (pointer: coarse) {
  .cc-greet a { display: inline-block; padding: 9px 4px; margin: -9px 0; }
}
/* .dsr-head / .dsr-avatar / .dsr-ident / .dsr-name / .dsr-title-flair are GONE with the
   second box (2026-07-27) — the account facts below are painted into the identity card. */
.dsr-rank { color: #b9a8e6; font-size: 0.88rem; margin-bottom: 6px; }
.idn-account { margin: 8px 0 2px; }
.idn-account .pjcc-sub { font-size: 0.76rem; }
.dsr-acts { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 10px; }
.dsr-streak { display: inline-block; font-size: 0.76rem; font-weight: 700; color: #ffb066; background: rgba(255,140,60,0.14); border: 1px solid rgba(255,140,60,0.45); border-radius: 999px; padding: 1px 8px; margin-left: 4px; }
.dsr-xp { background: #221347; border: 1px solid #6b5fa0; border-radius: 999px; height: 8px; overflow: hidden; margin-bottom: 4px; }
.dsr-xp-fill { background: linear-gradient(90deg,#6bffb8,#F5C518); height: 100%; }
/* the climb, folded in under the journey map — it used to be its own module up top */
.dsr-climb { display: flex; align-items: center; gap: 10px; margin-top: 6px; max-width: 560px;
  background: linear-gradient(135deg, rgba(42,28,14,0.9), rgba(58,42,16,0.92)); border: 1px solid #F5C518;
  border-radius: var(--r-sm); padding: 10px 14px; color: #e7d6b0; text-decoration: none; font-size: 0.88rem;
  transition: box-shadow .14s, transform .12s; }
.dsr-climb:hover { transform: translateY(-1px); box-shadow: 0 0 22px -8px #F5C518; text-decoration: none; color: #fff; }
.dsr-climb b { color: #F5C518; }
.dsr-climb-glyph { color: #F5C518; font-size: 1.2rem; line-height: 1; flex-shrink: 0; }
.dsr-climb-go { margin-left: auto; color: #F5C518; font-weight: 900; flex-shrink: 0; }
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
.dsr-ach { background: #160c33; border: 1px solid #6b5fa0; border-radius: var(--r-sm); padding: 12px; text-align: center; }
.dsr-ach.got { border-color: #F5C518; box-shadow: 0 0 10px rgba(245,197,24,0.2); }
.dsr-ach.locked { opacity: 0.4; filter: grayscale(0.6); }
.dsr-ach-icon { font-size: 26px; }
.dsr-ach-label { color: #f0e6ff; font-weight: 700; font-size: 0.84rem; margin: 4px 0 2px; }
.dsr-ach-desc { color: #9a7fd4; font-size: 0.72rem; line-height: 1.3; }
/* (the standalone streak FLAME card and the SEASON strip were cut 2026-07-12 — the streak
    is a chip in the header now, and the season's only payoff was the Hall of Fame.) */
.dsr-ghost { display:inline-block; font-size:0.74rem; color:#9a7fd4; } .dsr-ghost.beat { color:#6bffb8; }
.dsr-invite { display: flex; gap: 8px; flex-wrap: wrap; max-width: 560px; }
.dsr-invite input { flex: 1 1 280px; }
</style>
