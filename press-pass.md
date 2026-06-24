---
layout: page
title: Chess City Press Pass
permalink: /press-pass/
---

<div class="xp-hero">
  <div class="xp-kicker">Back the show · keep the lights on</div>
  <h1 class="xp-title">🎟 Chess City Press Pass</h1>
  <p class="xp-sub">PJCC is an independent cartoon being made in the open. The Press Pass is how you ride along — early access to the pilot, a look inside the studio, and cosmetics that say you were here first. <strong>Never pay-to-win</strong>: it's all bragging rights and behind-the-scenes, never an advantage in the games.</p>
</div>

<div class="xp-tiers">
  <div class="xp-tier xp-free">
    <div class="xp-tier-head"><span class="xp-tier-ico">🪪</span><div><div class="xp-tier-name">Operative</div><div class="xp-tier-price">Free · available now</div></div></div>
    <ul class="xp-perks">
      <li>✓ A codename, profile &amp; <a href="{{ '/dossier/' | relative_url }}">operative dossier</a></li>
      <li>✓ Every game, free — and the <a href="{{ '/academy/' | relative_url }}">Chess City Academy</a></li>
      <li>✓ <a href="{{ '/leaderboards/' | relative_url }}">Global leaderboards</a>, seasons &amp; the <a href="{{ '/hall-of-fame/' | relative_url }}">Hall of Fame</a></li>
      <li>✓ Earn <b>credits</b> &amp; climb the clearance ranks</li>
      <li>✓ A vote in <a href="{{ '/production/' | relative_url }}">Frame the Scene</a></li>
    </ul>
    <a class="xp-cta xp-cta-ghost" href="{{ '/dossier/' | relative_url }}">Start as an Operative</a>
  </div>

  <div class="xp-tier xp-feature">
    <div class="xp-flag">Most support</div>
    <div class="xp-tier-head"><span class="xp-tier-ico">🎟</span><div><div class="xp-tier-name">Press Pass</div><div class="xp-tier-price">Coming soon</div></div></div>
    <ul class="xp-perks">
      <li>★ <b>Early access</b> to the pilot &amp; new episodes</li>
      <li>★ The <b>behind-the-scenes</b> feed — boards, color keys, dev-logs</li>
      <li>★ <b>Exclusive Quartermaster cosmetics</b> (skins &amp; titles — cosmetic only)</li>
      <li>★ Your <b>name in the credits</b> as a supporter</li>
      <li>★ <b>2× weight</b> on Frame the Scene votes</li>
      <li>★ Everything in Operative</li>
    </ul>
    <a class="xp-cta" href="{{ '/mailing-list/' | relative_url }}">Join the founders list →</a>
  </div>

  <div class="xp-tier xp-founder">
    <div class="xp-tier-head"><span class="xp-tier-ico">👑</span><div><div class="xp-tier-name">Founder</div><div class="xp-tier-price">Coming soon · limited</div></div></div>
    <ul class="xp-perks">
      <li>♛ A <b>credited Founder</b> of Checker Town</li>
      <li>♛ A say in the <b>roadmap</b> &amp; what gets built next</li>
      <li>♛ A physical thank-you from the studio</li>
      <li>♛ A unique Founder title &amp; avatar frame</li>
      <li>♛ Everything in the Press Pass</li>
    </ul>
    <a class="xp-cta xp-cta-ghost" href="{{ '/mailing-list/' | relative_url }}">Get on the list →</a>
  </div>
</div>

<!-- ===== FREE PRESS CREDENTIAL (claim now) ===== -->
<h2 class="xp-h2">◈ Claim your Press Credential <span class="xp-free-tag">Free · now</span></h2>
<p class="xp-crednote">The Press Pass isn't open yet — but the <b>founders list</b> is forming. Claim your free credential to lock in a <b>provisional founding number</b>. It's a keepsake that says you were here before episode one; when paid passes open, your number carries over. <span class="xp-muted">Saved on this device — link your <a href="{{ '/dossier/' | relative_url }}">dossier</a> to put your codename on it.</span></p>

<div class="xp-cred" id="xp-cred"><!-- rendered by script --></div>

<script src="{{ '/assets/js/pjcc-config.js' | relative_url }}"></script>
<script src="{{ '/assets/js/pjcc-profile.js' | relative_url }}"></script>
<script>
(function () {
  var KEY = 'pjcc.presscred.v1';
  var DOSSIER_URL = {{ '/dossier/' | relative_url | jsonify }};
  var host = document.getElementById('xp-cred');
  if (!host) return;
  function load() { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } }
  function save(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]; }); }
  function codename() { try { if (window.PJCC && PJCC.getProfile) { var p = PJCC.getProfile(); if (p && p.codename) return p.codename; } } catch (e) {} return null; }
  function fmtDate(ts) { try { return new Date(ts).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); } catch (e) { return ''; } }
  function credId(ts) { return 'PJCC-FND-' + ts.toString(36).toUpperCase().slice(-6); }
  function provNum(ts) { return 1 + (Math.floor(ts / 1000) % 888); }  // provisional, device-local

  function render() {
    var rec = load();
    if (!rec) {
      host.innerHTML =
        '<div class="xp-cred-claim">' +
          '<div class="xp-cred-claim-ico">🎟</div>' +
          '<div><div class="xp-cred-claim-lead">You haven’t claimed your credential yet.</div>' +
          '<div class="xp-muted">Free, instant, no payment — just plant your flag on the founders list.</div>' +
          '<button class="xp-cta xp-cred-btn" id="xp-cred-claim" type="button">Claim my Press Credential</button></div>' +
        '</div>';
      document.getElementById('xp-cred-claim').onclick = function () {
        save({ ts: Date.now(), v: 1 }); render();
      };
      return;
    }
    var name = codename();
    host.innerHTML =
      '<div class="xp-cred-card selectable">' +
        '<div class="xp-cred-top"><span class="xp-cred-org">◈ CHESS CITY PRESS</span><span class="xp-cred-prov">PROVISIONAL</span></div>' +
        '<div class="xp-cred-title">FOUNDING OPERATIVE</div>' +
        '<div class="xp-cred-num">No. ' + ('00' + provNum(rec.ts)).slice(-3) + '</div>' +
        '<div class="xp-cred-rows">' +
          '<div><span>HOLDER</span>' + (name ? esc(name) : '<a href="' + DOSSIER_URL + '">link your dossier ›</a>') + '</div>' +
          '<div><span>ISSUED</span>' + esc(fmtDate(rec.ts)) + '</div>' +
          '<div><span>CREDENTIAL</span>' + esc(credId(rec.ts)) + '</div>' +
        '</div>' +
        '<div class="xp-cred-foot">Provisional founding number — confirmed when the Press Pass opens. Cosmetic only.</div>' +
      '</div>' +
      '<div class="xp-cred-actions">' +
        '<button class="xp-cta xp-cta-ghost xp-cred-share" id="xp-cred-share" type="button">⧉ Share the founders list</button>' +
      '</div>';
    var share = document.getElementById('xp-cred-share');
    if (share) share.onclick = function () {
      var url = location.origin + location.pathname;
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(flash).catch(flash); else flash();
      function flash() { share.textContent = '✓ link copied'; setTimeout(function () { share.textContent = '⧉ Share the founders list'; }, 1500); }
    };
  }

  render();
  if (window.PJCC && PJCC.ready) PJCC.ready.then(render);
  if (window.PJCC && PJCC.onChange) PJCC.onChange(render);
})();
</script>

<!-- ===== FOUNDERS WALL ===== -->
<h2 class="xp-h2">◈ The Founders Wall</h2>
<p class="xp-crednote">The roll of operatives who showed up before episode one. <span class="xp-muted">This is your view of the wall; the shared, public roll opens with Operative accounts — your number is reserved.</span></p>
<div class="xp-wall" id="xp-wall"></div>
<script>
(function () {
  var host = document.getElementById('xp-wall'); if (!host) return;
  function load() { try { return JSON.parse(localStorage.getItem('pjcc.presscred.v1')); } catch (e) { return null; } }
  function codename() { try { if (window.PJCC && PJCC.getProfile) { var p = PJCC.getProfile(); if (p && p.codename) return p.codename; } } catch (e) {} return null; }
  function provNum(ts) { return 1 + (Math.floor(ts / 1000) % 888); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]; }); }
  function row(num, name, you) {
    return '<div class="xp-wall-row' + (you ? ' is-you' : '') + '"><span class="xp-wall-no">No. ' + ('00' + num).slice(-3) + '</span>' +
      '<span class="xp-wall-name">' + esc(name) + '</span>' + (you ? '<span class="xp-wall-tag">that’s you</span>' : '') + '</div>';
  }
  function render() {
    var rec = load();
    var html = row(1, 'McPuppy Studios', false);
    if (rec) html += row(provNum(rec.ts), codename() || 'You · unregistered', true);
    html += '<div class="xp-wall-more">…and a growing roll. ' + (rec ? 'Your spot is held.' : '<a href="#xp-cred">Claim your credential</a> to take one.') + '</div>';
    host.innerHTML = html;
  }
  render();
  if (window.PJCC && PJCC.ready) PJCC.ready.then(render);
  if (window.PJCC && PJCC.onChange) PJCC.onChange(render);
})();
</script>

<!-- ===== FOUNDER COSMETICS (preview) ===== -->
<h2 class="xp-h2">◈ Founder cosmetics <span class="xp-soon-tag">preview</span></h2>
<p class="xp-crednote">What a pass dresses your operative in — <b>cosmetic only</b>, never an edge in a game. These unlock when the credits store opens.</p>
<div class="xp-cos">
  <div class="xp-cos-item">
    <div class="xp-cos-avatar xp-frame-gold">🧑‍🚀</div>
    <div class="xp-cos-name">Founders’ Gold</div><div class="xp-cos-sub">avatar frame</div>
  </div>
  <div class="xp-cos-item">
    <div class="xp-cos-avatar xp-frame-laurel">🧑‍🚀</div>
    <div class="xp-cos-name">Charter Laurel</div><div class="xp-cos-sub">avatar frame</div>
  </div>
  <div class="xp-cos-item">
    <div class="xp-cos-avatar xp-frame-press">🧑‍🚀</div>
    <div class="xp-cos-name">Press Badge</div><div class="xp-cos-sub">avatar frame</div>
  </div>
  <div class="xp-cos-item">
    <div class="xp-cos-titles">
      <span class="xp-cos-title">Founding Operative</span>
      <span class="xp-cos-title">Charter Member</span>
      <span class="xp-cos-title">Day-One</span>
    </div>
    <div class="xp-cos-name">Operative titles</div><div class="xp-cos-sub">profile flair</div>
  </div>
</div>

<!-- ===== WHAT YOUR SUPPORT FUNDS (transparency) ===== -->
<h2 class="xp-h2">◈ What your support funds</h2>
<p class="xp-crednote">No fake thermometers here — we won't show a made-up total. But we'll always be straight about <b>where the money goes</b>. Every dollar of support points at one thing: getting the pilot animated.</p>
<div class="xp-fund">
  <div class="xp-fund-bar" aria-hidden="true">
    <span class="xp-fund-seg" style="width:55%; background:#F5C518;" title="Animation"></span>
    <span class="xp-fund-seg" style="width:20%; background:#ff8fd0;" title="Voice & score"></span>
    <span class="xp-fund-seg" style="width:15%; background:#9fe8ff;" title="Tools & art"></span>
    <span class="xp-fund-seg" style="width:10%; background:#6bffb8;" title="Hosting & ops"></span>
  </div>
  <ul class="xp-fund-key">
    <li><i style="background:#F5C518"></i> <b>55%</b> Animation — frames, layout, comp</li>
    <li><i style="background:#ff8fd0"></i> <b>20%</b> Voice &amp; score — cast, the audio drama, themes</li>
    <li><i style="background:#9fe8ff"></i> <b>15%</b> Tools &amp; art — software, hardware, materials</li>
    <li><i style="background:#6bffb8"></i> <b>10%</b> Hosting &amp; ops — the site, the games, the dispatch</li>
  </ul>
  <p class="xp-muted">Illustrative split, not a live ledger — the point is the priority order: <b>the screen first.</b></p>
</div>

<!-- ===== DIRECT SUPPORT (tip jar) ===== -->
<h2 class="xp-h2">◈ Support directly</h2>
<p class="xp-crednote">Don't want a pass — just want to chip in? A one-off tip funds the same pilot, no strings.</p>
<div class="xp-support" id="xp-support"></div>
<script>
(function () {
  // Single source of truth: _config.yml (patreon_url / kofi_url).
  // Empty string = the button shows "opening soon" instead of linking out.
  var SUPPORT = {
    kofi:    {{ site.kofi_url    | default: '' | jsonify }},
    patreon: {{ site.patreon_url | default: '' | jsonify }}
  };
  var MAILING_URL = {{ '/mailing-list/' | relative_url | jsonify }};
  var host = document.getElementById('xp-support'); if (!host) return;
  function btn(label, sub, url, cls) {
    if (url) return '<a class="xp-sup-btn ' + cls + '" href="' + url + '" target="_blank" rel="noopener"><b>' + label + '</b><small>' + sub + '</small></a>';
    return '<span class="xp-sup-btn ' + cls + ' is-soon"><b>' + label + '</b><small>opening soon</small></span>';
  }
  host.innerHTML =
    btn('☕ Ko-fi', 'one-off tip', SUPPORT.kofi, 'xp-sup-kofi') +
    btn('◈ Patreon', 'monthly backing', SUPPORT.patreon, 'xp-sup-patreon') +
    '<a class="xp-sup-btn xp-sup-list" href="' + MAILING_URL + '"><b>✉ Free</b><small>join the dispatch</small></a>';
})();
</script>

<!-- ===== PRICING POLL ===== -->
<h2 class="xp-h2">◈ Help us price it <span class="xp-soon-tag">your call</span></h2>
<p class="xp-crednote">Before a single price goes live, you shape it. If you'd back the show, how would you rather do it?</p>
<div class="xp-poll" id="xp-poll"></div>
<script>
(function () {
  var KEY = 'pjcc.pricevote.v1';
  var host = document.getElementById('xp-poll'); if (!host) return;
  var OPTS = [
    { id: 'monthly', label: 'A few dollars a month', sub: 'ongoing, cancel anytime' },
    { id: 'annual',  label: 'Once a year — cheaper overall', sub: 'set it and forget it' },
    { id: 'pwyw',    label: 'Pay-what-you-want, one-off', sub: 'chip in when I can' }
  ];
  var SEED = { monthly: 34, annual: 41, pwyw: 52 };   // illustrative baseline so bars aren't empty
  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  function render() {
    var mine = get(), tot = 0;
    OPTS.forEach(function (o) { tot += SEED[o.id] + (mine === o.id ? 1 : 0); }); if (!tot) tot = 1;
    host.innerHTML = OPTS.map(function (o) {
      var v = SEED[o.id] + (mine === o.id ? 1 : 0), pct = Math.round(v / tot * 100);
      return '<button class="xp-poll-opt' + (mine === o.id ? ' chosen' : '') + '" data-id="' + o.id + '" type="button">' +
        '<div class="xp-poll-label">' + o.label + '</div><div class="xp-poll-sub">' + o.sub + '</div>' +
        '<div class="xp-poll-bar' + (mine ? ' show' : '') + '"><i style="width:' + pct + '%"></i><span>' + pct + '%</span></div></button>';
    }).join('') + (mine ? '<div class="xp-poll-thanks">Noted — thanks. This steers what actually launches.</div>' : '');
    Array.prototype.forEach.call(host.querySelectorAll('.xp-poll-opt'), function (b) { b.onclick = function () { set(b.dataset.id); render(); }; });
  }
  render();
})();
</script>

<!-- ===== BACKER DISPATCH (preview) ===== -->
<h2 class="xp-h2">◈ The Backer Dispatch <span class="xp-soon-tag">with paid tiers</span></h2>
<p class="xp-crednote">Pass-holders get a <b>quarterly behind-the-scenes issue</b> — the stuff too raw or too spoiler-y for the public dispatch. Here's the peek; the full issue unlocks when tiers go live.</p>
<div class="xp-backer">
  <div class="xp-backer-head"><span>◈ BACKER DISPATCH · No. 01</span><span class="xp-backer-lock">🔒 locked</span></div>
  <ul class="xp-backer-toc">
    <li>The pilot's full board breakdown — every shot, annotated</li>
    <li class="xp-blur">Casting tests for ████ and the ███████</li>
    <li class="xp-blur">A first listen at the ██████ ████ theme</li>
    <li class="xp-blur">What we cut from "Fell From the Sky," and why</li>
    <li class="xp-blur">The next game — before anyone else sees it</li>
  </ul>
  <a class="xp-cta xp-cta-ghost xp-backer-cta" href="{{ '/mailing-list/' | relative_url }}">Get told when it opens →</a>
</div>

<div class="xp-promise">
  <h2>The promise</h2>
  <ul>
    <li>🛡 <b>Cosmetics only.</b> Money never buys score, credits, or any edge in a game. Ever.</li>
    <li>✉️ <b>Owned, not rented.</b> The <a href="{{ '/mailing-list/' | relative_url }}">dispatch</a> is the real backbone — no algorithm decides who hears from us.</li>
    <li>🎬 <b>It funds the show.</b> Every pass goes toward getting the pilot animated. You're not buying a skin — you're producing a cartoon.</li>
  </ul>
</div>

<p class="xp-foot">Not ready to commit? Just <a href="{{ '/mailing-list/' | relative_url }}">join the dispatch</a> — it's free, and it's where the founders list opens first.</p>

<style>
.xp-hero { text-align: center; max-width: 760px; margin: 0 auto 18px; }
.xp-kicker { font-size: 0.72rem; letter-spacing: 0.2em; text-transform: uppercase; color: #ff8fd0; }
.xp-title { font-size: 1.9rem; color: #F5C518; margin: 6px 0; text-shadow: 0 0 20px rgba(245,197,24,0.3); }
.xp-sub { color: #c9a7ff; line-height: 1.6; }
.xp-sub strong { color: #6bffb8; }
.xp-tiers { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px; align-items: stretch; }
.xp-tier { position: relative; display: flex; flex-direction: column; background: rgba(45,27,105,0.5); border: 1px solid #3a2a6a; border-radius: 14px; padding: 18px; }
.xp-feature { border-color: #F5C518; box-shadow: 0 0 22px rgba(245,197,24,0.18); }
.xp-flag { position: absolute; top: -10px; right: 14px; background: #F5C518; color: #1a0f3d; font-size: 0.66rem; font-weight: 800; letter-spacing: 0.06em; border-radius: 999px; padding: 3px 10px; text-transform: uppercase; }
.xp-tier-head { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.xp-tier-ico { font-size: 32px; }
.xp-tier-name { font-size: 1.2rem; font-weight: 800; color: #f0e6ff; }
.xp-tier-price { font-size: 0.78rem; color: #9a7fd4; text-transform: uppercase; letter-spacing: 0.05em; }
.xp-perks { list-style: none; padding: 0; margin: 0 0 16px; flex: 1; }
.xp-perks li { color: #c9a7ff; font-size: 0.88rem; line-height: 1.9; border-top: 1px solid rgba(157,127,212,0.12); padding-top: 4px; }
.xp-perks li:first-child { border-top: none; }
.xp-perks b { color: #f0e6ff; }
.xp-perks a { color: #F5C518; }
.xp-cta { display: block; text-align: center; background: #F5C518; color: #1a0f3d; font-weight: 800; text-decoration: none; border-radius: 999px; padding: 11px; transition: all 0.14s; }
.xp-cta:hover { background: #ffd740; }
.xp-cta-ghost { background: transparent; color: #F5C518; border: 1px solid #6b5fa0; }
.xp-cta-ghost:hover { background: rgba(245,197,24,0.12); color: #fff; }
.xp-promise { background: rgba(107,255,184,0.06); border: 1px solid #2f6b50; border-radius: 14px; padding: 16px 20px; margin: 22px 0; max-width: 760px; }
.xp-promise h2 { color: #6bffb8; margin: 0 0 8px; font-size: 1.1rem; }
.xp-promise ul { margin: 0; padding-left: 4px; list-style: none; }
.xp-promise li { color: #c9a7ff; line-height: 1.8; }
.xp-promise b { color: #f0e6ff; }
.xp-promise a, .xp-foot a { color: #F5C518; }
.xp-foot { color: #9a7fd4; text-align: center; max-width: 640px; margin: 18px auto 0; }

.xp-h2 { color: #F5C518; margin: 26px 0 6px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.xp-free-tag { font-size: 0.56rem; letter-spacing: 0.12em; text-transform: uppercase; color: #06210f; background: #6bffb8; padding: 3px 9px; border-radius: 999px; font-weight: 800; }
.xp-crednote { color: #9a7fd4; max-width: 760px; line-height: 1.6; }
.xp-crednote b { color: #c9a7ff; }
.xp-crednote a, .xp-cred-rows a { color: #F5C518; }
.xp-muted { color: #7d6bb0; font-size: 0.88em; }

.xp-cred-claim { display: flex; gap: 14px; align-items: center; background: rgba(245,197,24,0.06); border: 1px dashed #6b5fa0; border-radius: 14px; padding: 16px; margin-top: 8px; }
.xp-cred-claim-ico { font-size: 34px; }
.xp-cred-claim-lead { color: #f0e6ff; font-weight: 700; margin-bottom: 2px; }
.xp-cred-btn { display: inline-block; margin-top: 10px; padding: 10px 18px; }

.xp-cred-card { max-width: 380px; margin-top: 8px; background: linear-gradient(150deg,#241453,#3a1d6e); border: 1px solid #F5C518; border-radius: 14px; padding: 16px 18px; box-shadow: 0 0 26px rgba(245,197,24,0.18); position: relative; overflow: hidden; }
.xp-cred-card::after { content: '♛'; position: absolute; right: -6px; bottom: -14px; font-size: 90px; color: rgba(245,197,24,0.07); }
.xp-cred-top { display: flex; justify-content: space-between; align-items: center; font-family: 'Share Tech Mono', monospace; font-size: 0.66rem; letter-spacing: 0.1em; }
.xp-cred-org { color: #F5C518; }
.xp-cred-prov { color: #ff8fd0; border: 1px solid #7a3a60; border-radius: 999px; padding: 1px 8px; }
.xp-cred-title { color: #f0e6ff; font-weight: 800; letter-spacing: 0.12em; font-size: 1.05rem; margin: 8px 0 2px; }
.xp-cred-num { font-family: 'Share Tech Mono', monospace; font-size: 2rem; font-weight: 800; color: #ffe27a; line-height: 1; margin-bottom: 12px; }
.xp-cred-rows { display: flex; flex-direction: column; gap: 5px; position: relative; z-index: 1; }
.xp-cred-rows > div { display: flex; gap: 10px; font-size: 0.82rem; color: #f0e6ff; }
.xp-cred-rows span { width: 96px; flex: 0 0 auto; color: #9a7fd4; font-family: 'Share Tech Mono', monospace; font-size: 0.66rem; letter-spacing: 0.08em; align-self: center; }
.xp-cred-foot { margin-top: 12px; font-size: 0.7rem; color: #8a78ba; line-height: 1.5; }
.xp-cred-actions { margin-top: 10px; }
.xp-cred-share { display: inline-block; width: auto; padding: 8px 16px; }

.xp-fund { max-width: 620px; }
.xp-fund-bar { display: flex; height: 18px; border-radius: 999px; overflow: hidden; border: 1px solid #3a2a6a; margin-bottom: 12px; }
.xp-fund-seg { display: block; height: 100%; }
.xp-fund-key { list-style: none; padding: 0; margin: 0 0 8px; display: grid; gap: 5px; }
.xp-fund-key li { color: #c9a7ff; font-size: 0.86rem; display: flex; align-items: center; gap: 8px; }
.xp-fund-key i { width: 12px; height: 12px; border-radius: 3px; flex: 0 0 auto; }
.xp-fund-key b { color: #f0e6ff; width: 38px; flex: 0 0 auto; }

.xp-support { display: flex; gap: 10px; flex-wrap: wrap; }
.xp-sup-btn { display: flex; flex-direction: column; align-items: center; gap: 1px; background: rgba(45,27,105,0.5); border: 1px solid #4a2f8a; border-radius: 12px; padding: 12px 20px; text-decoration: none; color: #f0e6ff; transition: all 0.14s; min-width: 130px; }
.xp-sup-btn:hover { border-color: #F5C518; transform: translateY(-2px); }
.xp-sup-btn b { font-size: 0.95rem; }
.xp-sup-btn small { color: #9a7fd4; font-size: 0.74rem; }
.xp-sup-btn.is-soon { opacity: 0.6; cursor: default; }
.xp-sup-btn.is-soon:hover { border-color: #4a2f8a; transform: none; }
.xp-sup-kofi:hover { box-shadow: 0 0 18px rgba(245,197,24,0.18); }
.xp-sup-list { border-color: #2f6b50; }

.xp-soon-tag { font-size: 0.54rem; letter-spacing: 0.12em; text-transform: uppercase; color: #1a0f3d; background: #9fe8ff; padding: 3px 9px; border-radius: 999px; font-weight: 800; }

/* Founders Wall */
.xp-wall { max-width: 520px; background: rgba(26,16,48,0.6); border: 1px solid #3a2a6a; border-radius: 12px; overflow: hidden; }
.xp-wall-row { display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-bottom: 1px solid #2a1f52; }
.xp-wall-row.is-you { background: rgba(245,197,24,0.08); }
.xp-wall-no { font-family: 'Share Tech Mono', monospace; font-size: 0.8rem; color: #ffe27a; flex: 0 0 auto; width: 64px; }
.xp-wall-name { color: #f0e6ff; font-weight: 700; flex: 1; }
.xp-wall-tag { font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.08em; color: #06210f; background: #6bffb8; padding: 2px 8px; border-radius: 999px; font-weight: 800; }
.xp-wall-more { padding: 10px 14px; color: #8a78ba; font-size: 0.82rem; }
.xp-wall-more a { color: #F5C518; }

/* Founder cosmetics preview */
.xp-cos { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 10px; }
.xp-cos-item { background: rgba(45,27,105,0.5); border: 1px solid #3a2a6a; border-radius: 12px; padding: 14px 10px; text-align: center; }
.xp-cos-avatar { width: 56px; height: 56px; margin: 0 auto 8px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 26px; background: #1a1030; position: relative; }
.xp-frame-gold { box-shadow: 0 0 0 3px #F5C518, 0 0 16px rgba(245,197,24,0.5); }
.xp-frame-laurel { box-shadow: 0 0 0 3px #6bffb8; }
.xp-frame-laurel::before { content: '🌿'; position: absolute; left: -8px; bottom: -4px; font-size: 16px; transform: scaleX(-1); }
.xp-frame-laurel::after { content: '🌿'; position: absolute; right: -8px; bottom: -4px; font-size: 16px; }
.xp-frame-press { box-shadow: 0 0 0 3px #ff8fd0; }
.xp-frame-press::after { content: '🎟'; position: absolute; right: -6px; top: -6px; font-size: 16px; }
.xp-cos-titles { display: flex; flex-direction: column; gap: 4px; margin-bottom: 8px; align-items: center; }
.xp-cos-title { font-size: 0.66rem; font-weight: 800; color: #1a0f3d; background: linear-gradient(90deg,#F5C518,#ffd740); border-radius: 999px; padding: 2px 8px; }
.xp-cos-name { color: #f0e6ff; font-weight: 700; font-size: 0.84rem; }
.xp-cos-sub { color: #9a7fd4; font-size: 0.72rem; }

/* Backer Dispatch */
.xp-backer { max-width: 560px; background: #140c2c; border: 1px solid #4a2f8a; border-radius: 12px; overflow: hidden; }
.xp-backer-head { display: flex; justify-content: space-between; align-items: center; background: rgba(245,197,24,0.08); border-bottom: 1px solid #3a2a6a; padding: 9px 14px; font-family: 'Share Tech Mono', monospace; font-size: 0.72rem; color: #F5C518; }
.xp-backer-lock { color: #ff8fd0; }
.xp-backer-toc { list-style: none; margin: 0; padding: 10px 14px; }
.xp-backer-toc li { color: #cfc3ee; font-size: 0.86rem; line-height: 1.6; padding-left: 16px; position: relative; }
.xp-backer-toc li::before { content: '›'; position: absolute; left: 0; color: #6b5fa0; }
.xp-backer-toc li.xp-blur { filter: blur(3px); user-select: none; opacity: 0.85; }
.xp-backer-cta { display: inline-block; width: auto; margin: 4px 14px 14px; padding: 8px 16px; }

/* Pricing poll */
.xp-poll { display: grid; gap: 8px; max-width: 520px; }
.xp-poll-opt { text-align: left; background: #221444; border: 1px solid #4a2f8a; border-radius: 10px; padding: 11px 14px; cursor: pointer; color: #c9a7ff; font-family: inherit; transition: all 0.14s; }
.xp-poll-opt:hover { border-color: #F5C518; }
.xp-poll-opt.chosen { border-color: #6bffb8; box-shadow: 0 0 0 1px #6bffb8 inset; }
.xp-poll-label { color: #f0e6ff; font-weight: 700; }
.xp-poll-sub { color: #9a7fd4; font-size: 0.78rem; margin-bottom: 6px; }
.xp-poll-bar { position: relative; height: 16px; background: rgba(20,12,45,0.7); border-radius: 999px; overflow: hidden; opacity: 0; transition: opacity 0.3s; }
.xp-poll-bar.show { opacity: 1; }
.xp-poll-bar i { display: block; height: 100%; background: linear-gradient(90deg,#6b5fa0,#ff8fd0); }
.xp-poll-bar span { position: absolute; right: 8px; top: 0; line-height: 16px; font-size: 0.7rem; color: #fff; font-weight: 700; }
.xp-poll-thanks { color: #6bffb8; font-size: 0.84rem; margin-top: 2px; }
</style>
