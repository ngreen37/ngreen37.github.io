---
layout: page
title: The Bulletin
permalink: /mailing-list/
brand: mcpuppy
body_class: theme-studio
---


<div class="ml-refbanner" id="ml-refbanner" hidden></div>

<div class="ml-hero">
  <div class="ml-eyebrow">◈ McPuppy Studios · Owned Channel</div>
  <p class="ml-intro">The Bulletin is the studio's <b>owned channel</b> — no algorithm decides who hears from us. It's the front row for <i>watching the show get made</i>: dev-logs, game drops, art reveals, and the occasional intercepted transmission.</p>
</div>

<form id="ml-form" class="ml-form" novalidate>
  <input id="ml-email" type="email" class="pjcc-input" placeholder="you@email.com" autocomplete="email" aria-label="Email address" required>
  <button type="submit" class="pjcc-btn">Join The Bulletin</button>
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
  <div class="ml-cell"><span class="ml-cell-ico">🎟</span><b>First in line</b><small>any limited slots open here first.</small></div>
</div>

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
          : "✓ You're in. You'll get the next issue — watch your inbox (and the spam folder the first time).";
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
      banner.innerHTML = '◈ An operative invited you in — drop your email below and you\'re one of us.';
    }
  } catch (e) {}
})();
</script>

<style>
/* The Bulletin — McPuppy Studios' owned channel, in graphite with a single INK-BLUE
   accent (the studio's letter/broadcast signature — distinct from the arcade gold and
   the Direct Line's live teal). Monochrome panels, one signal color. */
.ml-hero { max-width: 680px; }
.ml-eyebrow { font-family: 'Share Tech Mono', monospace; font-size: 0.72rem; letter-spacing: 0.16em; color: #8b9096; text-transform: uppercase; margin-bottom: 6px; }
.ml-intro { color: #c9c9d0; max-width: 680px; line-height: 1.65; }
.ml-intro b { color: #f2f2f4; }

.ml-form { display: flex; gap: 8px; flex-wrap: wrap; margin: 1.2rem 0 0.4rem; }
/* recolour the shared gold/purple form controls to the graphite + ink-blue signature
   (page-scoped so other pages' .pjcc-btn / .pjcc-input keep the arcade look) */
.ml-form .pjcc-input, .ml-invite-input { background: #15151b; border: 1px solid rgba(255,255,255,0.18); color: #f2f2f4; }
.ml-form .pjcc-input:focus, .ml-invite-input:focus { border-color: #5b8def; }
.ml-form .pjcc-btn, .ml-share-btn { background: #5b8def; color: #0a1020; border: 2px solid #5b8def; font-weight: 800; }
.ml-form .pjcc-btn:hover, .ml-share-btn:hover { background: #7ba3ff; border-color: #7ba3ff; }

.ml-msg { min-height: 1.3em; font-size: 0.9rem; color: #c9c9d0; }
.ml-msg.ok { color: #6bd39a; }
.ml-msg.err { color: #ff7a7a; }
.ml-fineprint { color: #9a9aa2; font-size: 0.8rem; margin-top: 2px; }

.ml-h2 { color: #f2efe8; margin: 26px 0 10px; font-size: 1.1rem; border-left: 3px solid #5b8def; padding-left: 10px; }
.ml-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px; }
.ml-cell { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.13); border-left: 3px solid rgba(91,141,239,0.55); border-radius: 12px; padding: 13px 14px; }
.ml-cell-ico { font-size: 22px; display: block; margin-bottom: 4px; }
.ml-cell b { color: #f2f2f4; display: block; font-size: 0.92rem; }
.ml-cell small { color: #a6a6ae; font-size: 0.8rem; line-height: 1.5; display: block; margin-top: 2px; }

.ml-refnote { color: #b0b0b8; max-width: 600px; line-height: 1.6; }
.ml-refnote b { color: #e6e6ea; }
.ml-invite { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 8px; max-width: 600px; }
.ml-invite-input { flex: 1; min-width: 200px; font-size: 0.82rem; color: #8fb2ff; }
.ml-share-flash { color: #6bd39a; font-size: 0.84rem; display: inline-block; min-height: 1.2em; margin-top: 4px; }
.ml-refbanner { background: rgba(91,141,239,0.10); border: 1px solid rgba(91,141,239,0.5); border-radius: 12px; padding: 12px 16px; margin-bottom: 14px; color: #bcd0ff; font-size: 0.9rem; }
</style>
