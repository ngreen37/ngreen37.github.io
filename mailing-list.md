---
layout: page
title: Mailing List
permalink: /mailing-list/
jukebox: true
---

<link rel="stylesheet" href="{{ '/assets/css/pjcc-profile.css' | relative_url }}">

<p class="ml-intro">Join the dispatch list for McPuppy Studios — new PJCC episodes, game drops, and the occasional intercepted transmission. No spam, unsubscribe anytime.</p>

<form id="ml-form" class="ml-form" novalidate>
  <input id="ml-email" type="email" class="pjcc-input" placeholder="you@email.com" autocomplete="email" aria-label="Email address" required>
  <button type="submit" class="pjcc-btn">Subscribe</button>
</form>
<p id="ml-msg" class="ml-msg" role="status">&nbsp;</p>

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
          ? 'You are already on the list — thanks!'
          : '✓ You are in. Watch your inbox for dispatches.';
        form.reset();
      });
    }).catch(function (err) {
      msg.className = 'ml-msg err';
      msg.textContent = (err && err.message === 'invalid email')
        ? 'That email does not look right.'
        : 'Something went wrong — please try again.';
    });
  });
})();
</script>

<style>
.ml-intro { color: #9a7fd4; max-width: 640px; }
.ml-form { display: flex; gap: 8px; flex-wrap: wrap; margin: 1.2rem 0 0.4rem; }
.ml-msg { min-height: 1.3em; font-size: 0.9rem; }
.ml-msg.ok { color: #6bffb8; }
.ml-msg.err { color: #ff6b6b; }
</style>
