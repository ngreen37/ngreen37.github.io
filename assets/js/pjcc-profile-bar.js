/* =============================================================================
 * PJCC Operative profile bar — self-injecting UI
 * -----------------------------------------------------------------------------
 * Renders the sign-in / codename / avatar / identity bar. Loads on every game
 * page (via the game layout). Reads/writes through window.PJCC (pjcc-profile.js).
 *
 * States:
 *   offline (keys unset) -> hidden
 *   logged out           -> email + "Send login link"
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
        PJCC.signInMagic(email).then(function () {
          bar.innerHTML = '<span class="pjcc-label">✉ Check your email for a login link, then return here.</span>';
        });
      });
      return;
    }

    if (!prof) {
      bar.innerHTML =
        '<span class="pjcc-label">Choose your operative <strong>codename</strong>:</span>' +
        '<input id="pjcc-codename" type="text" maxlength="24" class="pjcc-input" placeholder="codename">' +
        '<button id="pjcc-claim" class="pjcc-btn">Claim</button>';
      bind('pjcc-claim', function () {
        var name = (document.getElementById('pjcc-codename').value || '').trim();
        if (!name) return;
        PJCC.claimCodename(name).then(render);
      });
      return;
    }

    if (!(prof.companion && prof.companion.avatar)) {
      renderPicker(bar, prof, true);
      return;
    }

    // Complete identity row
    bar.className = 'pjcc-bar pjcc-bar-in';
    bar.innerHTML =
      '<div class="pjcc-avatar">' + PJCC.avatarEmoji(prof) + '</div>' +
      '<div class="pjcc-id">' +
        '<span class="pjcc-codename">' + esc(prof.codename) + '</span>' +
        '<span class="pjcc-sub">' + esc(prof.rank) + ' · <span class="pjcc-credits">' + prof.credits + ' credits</span></span>' +
      '</div>' +
      '<span class="pjcc-spacer"></span>' +
      '<a class="pjcc-trophy" href="/leaderboards/">🏆 Leaderboards</a>' +
      '<button id="pjcc-edit" class="pjcc-btn-ghost">Change avatar</button>' +
      '<button id="pjcc-out" class="pjcc-btn-ghost">Sign out</button>';
    bind('pjcc-edit', function () { renderPicker(bar, prof, false); });
    bind('pjcc-out', function () { PJCC.signOut().then(render); });
  }

  function renderPicker(bar, prof, firstTime) {
    bar.className = 'pjcc-bar pjcc-bar-in';
    var current = prof.companion && prof.companion.avatar;
    var picks = PJCC.AVATAR_ORDER.map(function (key) {
      return '<span class="pjcc-pick' + (key === current ? ' sel' : '') + '" data-av="' + key + '" title="' + key + '">' +
avEmoji(key) + '</span>';
    }).join('');
    bar.innerHTML =
      '<span class="pjcc-label">' + (firstTime ? 'Pick your <strong>avatar</strong>:' : 'Change avatar:') + '</span>' +
      '<div class="pjcc-picker">' + picks + '</div>' +
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
