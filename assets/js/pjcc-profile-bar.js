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

  /* ── WHERE THE BAR STANDS depends on what it is saying (2026-07-22) ─────────────
   * You do not need an account to play the games. This bar was the first thing on
   * every game page anyway — an email field and a "Send login link" button, with the
   * game itself pushed off the bottom of a phone screen. A stranger who tapped the
   * front door's one call to action met a login before they met the board.
   *
   * So the ask moves to where it is earned: for a signed-OUT visitor the bar drops
   * below the game, beside the mailing list, as one quiet line. Every signed-IN state
   * still stands at the top — an identity row (rank, credits, the codename you
   * claimed) is a reward and a status light, not a toll gate, and a player who has one
   * wants it in view. Nothing about signing in changed: same field, same button, one
   * tap further down the page. The account is FREE and the label now says so, because
   * the reason to make one is the Gambit's altar and a 1v1 across the Park Tables —
   * not permission to play.
   * ──────────────────────────────────────────────────────────────────────────────── */
  function slotTop(bar) {
    var h = document.querySelector('.game-page-header');
    // compare against the ELEMENT sibling: markup whitespace is a text node, so a
    // nextSibling check would report "not in place" every time and re-insert on
    // every render, tearing out whatever the visitor was typing.
    if (h && h.parentNode && bar.previousElementSibling !== h) h.parentNode.insertBefore(bar, h.nextSibling);
  }
  function slotBottom(bar) {
    var d = document.querySelector('.game-dispatch');
    if (d && d.parentNode && bar.nextElementSibling !== d) d.parentNode.insertBefore(bar, d);
  }

  // Whether the visitor has opened the sign-in offer. Module-level so a re-render
  // (PJCC.onChange fires on token refresh) leaves an opened form open.
  var offerOpen = false;

  function codeError(e) {
    if (!PJCC.verifyCode) return 'Close and reopen the app to update, then try again.';
    if (e && e.message === 'bad code') return 'Type the whole code from the email.';
    return 'That code did not work — check it, or send a new one.';
  }

  // In the installed app a tapped link opens Safari and signs THAT in instead, so
  // the same email also carries a code you can type right here.
  function renderCode(bar, email) {
    bar.innerHTML =
      '<span class="pjcc-label">✉ Sent. Tap the link, or type the code from the email:</span>' +
      '<input id="pjcc-code" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="10" class="pjcc-input" placeholder="code">' +
      '<button id="pjcc-verify" class="pjcc-btn">Sign in</button>' +
      '<span id="pjcc-code-msg" class="pjcc-label"></span>';
    bind('pjcc-verify', function () {
      var code = (document.getElementById('pjcc-code').value || '').trim();
      var btn = document.getElementById('pjcc-verify');
      if (!code || btn.disabled) return;
      btn.disabled = true; btn.textContent = 'Checking…';
      // Promise.resolve() so a SYNCHRONOUS throw lands in .catch too. A stale cached
      // pjcc-profile.js (no verifyCode) used to throw before .catch was attached and
      // freeze the button on "Checking…" forever — silent, and impossible to guess at.
      Promise.resolve().then(function () {
        return PJCC.verifyCode(email, code);
      }).then(render).catch(function (e) {
        btn.disabled = false; btn.textContent = 'Sign in';
        document.getElementById('pjcc-code-msg').textContent = codeError(e);
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
      // below the game, and closed until asked for — see the placement note above
      slotBottom(bar);
      if (!offerOpen) {
        bar.className = 'pjcc-bar pjcc-bar-quiet';
        bar.innerHTML =
          '<button id="pjcc-offer" class="pjcc-btn-ghost">Save your operative across every game &amp; device &rarr;</button>';
        bind('pjcc-offer', function () { offerOpen = true; render(); });
        return;
      }
      bar.innerHTML =
        '<span class="pjcc-label"><strong>Free account.</strong> Save your operative across every game &amp; device:</span>' +
        '<input id="pjcc-email" type="email" class="pjcc-input" placeholder="you@email.com">' +
        '<button id="pjcc-login" class="pjcc-btn">Send login link</button>';
      var mail = document.getElementById('pjcc-email');
      if (mail) mail.focus();   // it was opened deliberately; don't make them tap twice
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

    // signed in from here down: the bar is an identity row, so it goes back to the top
    offerOpen = false;
    slotTop(bar);

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
      '<a class="pjcc-trophy" href="/dossier/">🗂 Profile</a>' +
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
