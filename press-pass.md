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
</style>
