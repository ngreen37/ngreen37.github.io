/* =============================================================================
 * PJCC Operative profile bar — self-injecting UI
 * -----------------------------------------------------------------------------
 * Renders the sign-in / codename / avatar / identity bar. Loads on every game
 * page (via the game layout). Reads/writes through window.PJCC (pjcc-profile.js).
 *
 * States:
 *   offline (keys unset) -> hidden
 *   logged out           -> email + "Send login link"
 *   link sent            -> tap the link, or type the 6-digit code (installed app)
 *   logged in, no profile-> claim a codename
 *   logged in, no avatar -> pick an avatar
 *   logged in, complete  -> avatar · codename · rank · credits · 🏆 · sign out
 * ========================================================================== */
(function () {
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function container() {
    var e = document.getElementById('pjcc-profile-bar');
    if (!e) {
      e = document.createElement('div');
      e.id = 'pjcc-profile-bar';
      var header = document.querySelector('.game-page-header');
      if (header && header.parentNode) header.parentNode.insertBefore(e, header.nextSibling);
      else document.body.insertBefore(e, document.body.firstChild);
    }
    return e;
  }

  // In the installed app a tapped link opens Safari and signs THAT in instead, so
  // the same email also carries a code you can type right here.
  function renderCode(bar, email) {
    bar.innerHTML =
      '<span class="pjcc-label">✉ Sent. Tap the link, or type the 6-digit code:</span>' +
      '<input id="pjcc-code" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6" class="pjcc-input" placeholder="000000">' +
      '<button id="pjcc-verify" class="pjcc-btn">Sign in</button>' +
      '<span id="pjcc-code-msg" class="pjcc-label"></span>';
    bind('pjcc-verify', function () {
      var code = (document.getElementById('pjcc-code').value || '').trim();
      var btn = document.getElementById('pjcc-verify');
      if (!code || btn.disabled) return;
      btn.disabled = true; btn.textContent = 'Checking…';
      PJCC.verifyCode(email, code).then(render).catch(function () {
        btn.disabled = false; btn.textContent = 'Sign in';
        document.getElementById('pjcc-code-msg').textContent = 'That code did not work.';
      });
    });
  }

  function render() {
    var bar = container();
    if (!PJCC.enabled) { bar.style.display = 'none'; return; }
    bar.style.display = '';
    bar.className = 'pjcc-bar';

    var user = PJCC.currentUser();
    var prof = PJCC.getProfile();

    if (!user) {
      bar.innerHTML =
        '<span class="pjcc-label">Save your operative across every game &amp; device:</span>' +
        '<input id="pjcc-email" type="email" class="pjcc-input" placeholder="you@email.com">' +
        '<button id="pjcc-login" class="pjcc-btn">Send login link</button>';
      bind('pjcc-login', function () {
        var email = (document.getElementById('pjcc-email').value || '').trim();
        if (!email) return;
        var btn = document.getElementById('pjcc-login');
        if (btn.disabled) return;                       // one email per click, not per tap-tap
        btn.disabled = true; btn.textContent = 'Sending…';
        PJCC.signInMagic(email).then(function () {
          renderCode(bar, email);
        }).catch(function () {
          btn.disabled = false; btn.textContent = 'Send login link';
        });
      });
      return;
    }

    if (!prof) {
      bar.innerHTML =
        '<span class="pjcc-label">Choose your operative <strong>codename</strong>:</span>' +
        '<input id="pjcc-codename" type="text" maxlength="24" class="pjcc-input" placeholder="codename">' +
        '<button id="pjcc-claim" class="pjcc-btn">Claim</button>' +
        '<span id="pjcc-claim-msg" class="pjcc-label"></span>';
      bind('pjcc-claim', function () {
        var name = (document.getElementById('pjcc-codename').value || '').trim();
        if (!name) return;
        PJCC.claimCodename(name).then(render).catch(function (e) {
          var m = document.getElementById('pjcc-claim-msg');
          m.textContent = (e && e.message === 'codename taken') ? 'That codename is taken — try another.' : 'Could not claim — try again.';
        });
      });
      return;
    }

    if (!(prof.companion && prof.companion.avatar)) {
      renderPicker(bar, prof, true);
      return;
    }

    // Complete identity row
    bar.className = 'pjcc-bar pjcc-bar-in';
    var rankName = PJCC.rankFor(prof.credits).name;
    var titleLabel = PJCC.titleLabel ? PJCC.titleLabel(prof) : '';
    bar.innerHTML =
      '<div class="pjcc-avatar">' + PJCC.avatarEmoji(prof) + '</div>' +
      '<div class="pjcc-id">' +
        '<span class="pjcc-codename">' + esc(prof.codename) + (titleLabel ? ' <span class="pjcc-title">' + esc(titleLabel) + '</span>' : '') + '</span>' +
        '<span class="pjcc-sub">' + esc(rankName) + ' · <span class="pjcc-credits">' + prof.credits + ' credits</span></span>' +
      '</div>' +
      '<span class="pjcc-spacer"></span>' +
      '<a class="pjcc-trophy" href="/dossier/">🗂 Dossier</a>' +
      '<a class="pjcc-trophy" href="/leaderboards/">🏆 Leaderboards</a>' +
      '<button id="pjcc-edit" class="pjcc-btn-ghost">Change avatar</button>' +
      '<button id="pjcc-out" class="pjcc-btn-ghost">Sign out</button>';
    bind('pjcc-edit', function () { renderPicker(bar, prof, false); });
    bind('pjcc-out', function () { PJCC.signOut().then(render); });
  }

  function renderPicker(bar, prof, firstTime) {
    bar.className = 'pjcc-bar pjcc-bar-in';
    var current = prof.companion && prof.companion.avatar;
    var picks = PJCC.ownedAvatars().map(function (key) {
      return '<span class="pjcc-pick' + (key === current ? ' sel' : '') + '" data-av="' + key + '" title="' + key + '">' +
avEmoji(key) + '</span>';
    }).join('');
    bar.innerHTML =
      '<span class="pjcc-label">' + (firstTime ? 'Pick your <strong>avatar</strong>:' : 'Change avatar:') + '</span>' +
      '<div class="pjcc-picker">' + picks + '</div>' +
      '<a class="pjcc-trophy" href="/shopkeeper/">＋ More</a>' +
      (firstTime ? '' : '<button id="pjcc-cancel" class="pjcc-btn-ghost">Cancel</button>');
    Array.prototype.forEach.call(bar.querySelectorAll('.pjcc-pick'), function (node) {
      node.onclick = function () { PJCC.setAvatar(node.getAttribute('data-av')).then(render); };
    });
    if (!firstTime) bind('pjcc-cancel', render);
  }

  function avEmoji(key) { return PJCC.AVATARS[key] || '◆'; }

  function bind(id, fn) { var b = document.getElementById(id); if (b) b.onclick = fn; }

  if (window.PJCC) {
    PJCC.onChange(render);
    PJCC.ready.then(render);
  }
})();
