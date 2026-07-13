---
layout: page
title: Mailing List
permalink: /mailing-list/
---


<div class="ml-refbanner" id="ml-refbanner" hidden></div>

<div class="ml-hero">
  <div class="ml-eyebrow">◈ Checker Town Bureau of Dispatch</div>
  <p class="ml-intro">The dispatch is the studio's <b>owned channel</b> — no algorithm decides who hears from us. It's the front row for <i>watching the show get made</i>: dev-logs, game drops, art reveals, and the occasional intercepted transmission.</p>
</div>

<form id="ml-form" class="ml-form" novalidate>
  <input id="ml-email" type="email" class="pjcc-input" placeholder="you@email.com" autocomplete="email" aria-label="Email address" required>
  <button type="submit" class="pjcc-btn">Join the dispatch</button>
</form>
<p id="ml-msg" class="ml-msg" role="status">&nbsp;</p>
<p class="ml-fineprint">Roughly twice a month. No spam, no selling your address, unsubscribe in one click.</p>

<!-- what you get -->
<h2 class="ml-h2">What lands in your inbox</h2>
<div class="ml-grid">
  <div class="ml-cell"><span class="ml-cell-ico">🎬</span><b>Episode &amp; pilot news</b><small>premiere dates and first looks, before anywhere else.</small></div>
  <div class="ml-cell"><span class="ml-cell-ico">🕹️</span><b>Game drops</b><small>every new game and major update the day it ships.</small></div>
  <div class="ml-cell"><span class="ml-cell-ico">✎</span><b>Dev-log &amp; art</b><small>boards, color keys, and what moved in production.</small></div>
  <div class="ml-cell"><span class="ml-cell-ico">📡</span><b>Intercepted transmissions</b><small>in-universe lore beats and the odd classified leak.</small></div>
  <div class="ml-cell"><span class="ml-cell-ico">🎟</span><b>First in line</b><small>any limited slots open to the dispatch first.</small></div>
  <div class="ml-cell"><span class="ml-cell-ico">🎸</span><b>Score reveals</b><small>the first PJCC theme — recorded live on guitar &amp; drums — drops here, on camera, before streaming.</small></div>
</div>

<!-- sample dispatch -->
<h2 class="ml-h2">A sample dispatch</h2>
<div class="ml-sample" aria-hidden="true">
  <div class="ml-sample-head">
    <span class="ml-sample-from">McPuppy Studios — Dispatch</span>
    <span class="ml-sample-tag">◈ TRANSMISSION 014</span>
  </div>
  <div class="ml-sample-subject">The pilot just crossed 50% on script — and a piece fell off the board</div>
  <div class="ml-sample-body">
    <p>Operative — boards for SC&nbsp;01 are in, "Fell From the Sky" is past the halfway mark on script, and the new game <i>Sky Run</i> went live (bishop fires an X-only beam now — go break it).</p>
    <p>Intercepted this week: a vessel manifest with one name redacted. We're working on the rest.</p>
    <p>— The Bureau</p>
  </div>
</div>
<p class="ml-sample-note">That's the shape of it: short, real progress, a little mystery. <a href="{{ '/dispatch/' | relative_url }}">Browse past dispatches →</a></p>

<!-- referral / share -->
<h2 class="ml-h2">Bring an Operative</h2>
<p class="ml-refnote">The list grows by word of mouth, not ad spend. Share <b>your</b> invite link — when accounts open, referrals will earn credit toward founder cosmetics. For now it's the cleanest way to bring someone in.</p>
<div class="ml-invite">
  <input id="ml-invite-link" class="pjcc-input ml-invite-input" readonly aria-label="Your invite link">
  <button class="pjcc-btn ml-share-btn" id="ml-share-btn" type="button">⧉ Copy my invite link</button>
</div>
<span class="ml-share-flash" id="ml-share-flash"></span>

<script src="{{ '/assets/js/pjcc-config.js' | relative_url }}"></script>
<script src="{{ '/assets/js/pjcc-profile.js' | relative_url }}"></script>
<script>
(function () {
  var form = document.getElementById('ml-form');
  var input = document.getElementById('ml-email');
  var msg = document.getElementById('ml-msg');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = input.value.trim();
    if (!email) return;
    msg.className = 'ml-msg';
    msg.textContent = 'Subscribing…';
    PJCC.ready.then(function () {
      if (!PJCC.enabled) { msg.textContent = 'Sign-ups are offline right now — please try again later.'; return; }
      return PJCC.subscribe(email).then(function (res) {
        msg.className = 'ml-msg ok';
        msg.textContent = res.already
          ? "You're already on the list — thanks for riding along."
          : "✓ You're in. You'll get the next dispatch — watch your inbox (and the spam folder the first time).";
        form.reset();
      });
    }).catch(function (err) {
      msg.className = 'ml-msg err';
      msg.textContent = (err && err.message === 'invalid email')
        ? 'That email does not look right.'
        : 'Something went wrong — please try again.';
    });
  });

  // ---- personalized invite link (ref tag) ----
  function refId() {
    try { if (window.PJCC && PJCC.getProfile) { var p = PJCC.getProfile(); if (p && p.codename) return p.codename; } } catch (e) {}
    try {
      var k = 'pjcc.ref.id', v = localStorage.getItem(k);
      if (!v) { v = 'op-' + Math.random().toString(36).slice(2, 7); localStorage.setItem(k, v); }
      return v;
    } catch (e) { return 'op'; }
  }
  function inviteUrl() { return location.origin + location.pathname + '?ref=' + encodeURIComponent(refId()); }
  function setLink() { var i = document.getElementById('ml-invite-link'); if (i) i.value = inviteUrl(); }
  setLink();
  if (window.PJCC && PJCC.ready) PJCC.ready.then(setLink);   // upgrade to codename once profile loads

  var share = document.getElementById('ml-share-btn');
  var flash = document.getElementById('ml-share-flash');
  if (share) share.addEventListener('click', function () {
    var url = inviteUrl();
    function ok() { if (flash) { flash.textContent = '✓ copied — pass it on'; setTimeout(function () { flash.textContent = ''; }, 2000); } }
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(ok).catch(ok); else ok();
    var i = document.getElementById('ml-invite-link'); if (i) { i.focus(); i.select(); }
  });

  // ---- "invited by" welcome ----
  try {
    var ref = new URLSearchParams(location.search).get('ref');
    var banner = document.getElementById('ml-refbanner');
    if (ref && banner) {
      banner.hidden = false;
      banner.innerHTML = '◈ An operative invited you in. Welcome to the Bureau — drop your email below and you\'re one of us.';
    }
  } catch (e) {}
})();
</script>

<style>
.ml-hero { max-width: 680px; }
.ml-eyebrow { font-family: 'Share Tech Mono', monospace; font-size: 0.72rem; letter-spacing: 0.14em; color: #ff8fd0; text-transform: uppercase; margin-bottom: 6px; }
.ml-intro { color: #c9a7ff; max-width: 680px; line-height: 1.65; }
.ml-intro b { color: #f0e6ff; }
.ml-intro a, .ml-cell a, .ml-sample-note a, .ml-refnote a { color: #F5C518; }
.ml-form { display: flex; gap: 8px; flex-wrap: wrap; margin: 1.2rem 0 0.4rem; }
.ml-msg { min-height: 1.3em; font-size: 0.9rem; }
.ml-msg.ok { color: #6bffb8; }
.ml-msg.err { color: #ff6b6b; }
.ml-fineprint { color: #9d8ecb; /* a11y 2026-07-13: was 3.7:1 */ font-size: 0.8rem; margin-top: 2px; }

.ml-h2 { color: #F5C518; margin: 26px 0 10px; font-size: 1.1rem; }
.ml-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px; }
.ml-cell { background: rgba(45,27,105,0.45); border: 1px solid #3a2a6a; border-radius: 12px; padding: 13px 14px; }
.ml-cell-ico { font-size: 22px; display: block; margin-bottom: 4px; }
.ml-cell b { color: #f0e6ff; display: block; font-size: 0.92rem; }
.ml-cell small { color: #9a7fd4; font-size: 0.8rem; line-height: 1.5; display: block; margin-top: 2px; }

.ml-sample { max-width: 600px; background: #140c2c; border: 1px solid #4a2f8a; border-radius: 12px; overflow: hidden; }
.ml-sample-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; background: rgba(245,197,24,0.08); border-bottom: 1px solid #3a2a6a; padding: 8px 12px; }
.ml-sample-from { color: #c9a7ff; font-weight: 700; font-size: 0.82rem; }
.ml-sample-tag { font-family: 'Share Tech Mono', monospace; font-size: 0.66rem; color: #ff8fd0; letter-spacing: 0.08em; }
.ml-sample-subject { color: #F5C518; font-weight: 700; padding: 12px 12px 4px; font-size: 0.95rem; }
.ml-sample-body { padding: 4px 12px 12px; }
.ml-sample-body p { color: #cfc3ee; font-size: 0.86rem; line-height: 1.6; margin: 0 0 8px; }
.ml-sample-note { color: #9d8ecb; /* a11y 2026-07-13: was 3.7:1 */ font-size: 0.84rem; margin-top: 8px; }

.ml-refnote { color: #9a7fd4; max-width: 600px; line-height: 1.6; }
.ml-refnote b { color: #c9a7ff; }
.ml-invite { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 8px; max-width: 600px; }
.ml-invite-input { flex: 1; min-width: 200px; font-size: 0.82rem; color: #9fe8ff; }
.ml-share-flash { color: #6bffb8; font-size: 0.84rem; display: inline-block; min-height: 1.2em; margin-top: 4px; }
.ml-refbanner { background: rgba(107,255,184,0.08); border: 1px solid #2f6b50; border-radius: 12px; padding: 12px 16px; margin-bottom: 14px; color: #6bffb8; font-size: 0.9rem; }
</style>
