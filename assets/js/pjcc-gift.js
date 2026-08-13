/* =============================================================================
 * GIVE SOMEBODY CREDITS — the one thing you can do TO another operative
 * -----------------------------------------------------------------------------
 * 2026-08-13, Nate: *"how about a mechanism where a user can click on another user's
 * name, and they can give them 1, 5, 10, 25, or 50 credits? That's the only thing they
 * can interact with a specific user on for now. Later I'd like to be able to set up a
 * specific table for them."*
 *
 * ══ WHY THIS IS ITS OWN MODULE AND NOT A FUNCTION IN THE LEADERBOARD ═════════
 * Because of the last sentence. This sheet is the first entry in what he has already
 * described as a list — gift now, "open a table with them" next — so it is built as
 * "the panel you get when you tap an operative", with exactly one action in it today.
 * Adding the second action later is an entry in `ACTIONS` rather than a rewrite of
 * whichever page happened to own the code. It is also why it takes a CODENAME and
 * nothing else: every surface that shows a name (leaderboards today, nameplates,
 * profiles) can open it without first fetching anything about the person.
 *
 * ══ WHAT MAKES IT SAFE, STRUCTURALLY ════════════════════════════════════════
 * A gift carries an AMOUNT and a SENDER. There is no field in it a person could type a
 * sentence into. That is the same property that makes the four preset emotes the whole
 * of chat on this site — child-safety by construction rather than by moderation — and it
 * is the reason a "with a message" option must never be added here casually.
 *
 * ⚠ THE SERVER IS THE RULE, ALWAYS. The five amounts, the balance check, the daily cap
 * and the you-cannot-gift-yourself rule are all enforced in SQL (docs/credit-gifts-setup.md).
 * Everything in this file is presentation: it draws five buttons, grays out what you
 * cannot afford, and repeats whatever the server says. Disabling a button here is a
 * courtesy, never a control.
 *
 * ⚠ INVISIBLE UNTIL THE MIGRATION IS RUN. `PJCC.giftsEnabled()` probes once per session;
 * callers are expected to await it before drawing anything. A dead button is worse than
 * no button, so there is no path in here that renders on a maybe.
 * ============================================================================= */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function nfmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

  /* Every refusal the server can return, in the player's language.
     ⚠ NO APOLOGIES AND NO EXCUSES — each one says what happened and, where there is one,
     what to do instead. "Gifts aren't switched on yet." is the honest sentence for a
     migration Nate has not run; it does not pretend to be a temporary outage. */
  var SAID = {
    offline:           'Gifts aren’t switched on yet.',
    signed_out:        'Sign in to send credits.',
    bad_amount:        'That isn’t one of the amounts.',
    no_such_operative: 'That operative is no longer here.',
    self:              'You can’t send credits to yourself.',
    not_enough:        'You don’t have that many credits.',
    daily_cap:         'You’ve given all you can today. Back tomorrow.'
  };

  var openSheet = null;

  function close() {
    if (!openSheet) return;
    try { openSheet.remove(); } catch (e) {}
    openSheet = null;
    document.removeEventListener('keydown', onKey);
  }
  function onKey(e) { if (e.key === 'Escape') close(); }

  /* ── THE SHEET ────────────────────────────────────────────────────────────────────
     ⚠ Built and torn down per open, deliberately. A single persistent node would have to
     be reset on every open — the amount buttons re-enabled, the status line cleared, the
     name swapped — and the bug that pattern produces is a stale message from the LAST
     person you looked at appearing under the name of the next one. */
  function open(codename) {
    close();
    var name = String(codename || '').trim();
    if (!name) return;

    var prof = null;
    try { prof = window.PJCC && PJCC.getProfile ? PJCC.getProfile() : null; } catch (e) {}
    var have = (prof && typeof prof.credits === 'number') ? prof.credits : 0;
    var tiers = (window.PJCC && PJCC.GIFT_TIERS) || [1, 5, 10, 25, 50];

    var ov = document.createElement('div');
    ov.className = 'gift-ov';
    ov.innerHTML =
      '<div class="gift-sheet" role="dialog" aria-modal="true" aria-label="Send credits to ' + esc(name) + '">' +
        '<button class="gift-x" id="gift-x" aria-label="Close">×</button>' +
        '<p class="gift-h">Send credits to</p>' +
        '<p class="gift-who">' + esc(name) + '</p>' +
        '<div class="gift-row">' +
          tiers.map(function (n) {
            // affordability is a COURTESY here; the server refuses regardless
            var poor = n > have;
            return '<button class="gift-amt" data-amt="' + n + '"' + (poor ? ' disabled' : '') +
                   ' aria-label="Send ' + n + ' credits">' + n + '</button>';
          }).join('') +
        '</div>' +
        '<p class="gift-bal" id="gift-bal">You have <b>' + nfmt(have) + '</b> credits.</p>' +
      '</div>';
    document.body.appendChild(ov);
    openSheet = ov;
    document.addEventListener('keydown', onKey);

    var bal = ov.querySelector('#gift-bal');
    ov.querySelector('#gift-x').onclick = close;
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });

    Array.prototype.forEach.call(ov.querySelectorAll('[data-amt]'), function (b) {
      b.onclick = function () {
        var amt = +b.getAttribute('data-amt');
        // lock the whole row: a double-tap on a phone is two gifts, and this one costs money
        Array.prototype.forEach.call(ov.querySelectorAll('[data-amt]'), function (x) { x.disabled = true; });
        bal.textContent = 'Sending…';
        Promise.resolve(
          (window.PJCC && PJCC.giftCredits)
            ? PJCC.giftCredits(name, amt)
            : { ok: false, reason: 'offline' }
        ).then(function (r) {
          if (r && r.ok) {
            bal.innerHTML = '<b class="gift-ok">Sent ' + r.amount + ' to ' + esc(name) + '.</b>' +
                            ' You have <b>' + nfmt(r.balance) + '</b> left.';
            setTimeout(close, 1600);
            return;
          }
          var why = (r && SAID[r.reason]) || SAID.offline;
          bal.innerHTML = '<b class="gift-no">' + esc(why) + '</b>';
          // re-open only what is still affordable, so a failed send is not a dead sheet
          var now = 0;
          try { var p2 = PJCC.getProfile(); now = (p2 && p2.credits) || 0; } catch (e) {}
          if (r && r.reason !== 'daily_cap' && r.reason !== 'offline') {
            Array.prototype.forEach.call(ov.querySelectorAll('[data-amt]'), function (x) {
              x.disabled = +x.getAttribute('data-amt') > now;
            });
          }
        });
      };
    });

    var first = ov.querySelector('[data-amt]:not([disabled])') || ov.querySelector('#gift-x');
    if (first) first.focus();
  }

  window.PJCCGift = {
    open: open,
    close: close,
    /* Callers await this before drawing any affordance. Resolves false when the migration
       has not been run, when there is no backend, and for every signed-out visitor. */
    available: function () {
      try {
        return (window.PJCC && PJCC.giftsEnabled) ? PJCC.giftsEnabled() : Promise.resolve(false);
      } catch (e) { return Promise.resolve(false); }
    },
    SAID: SAID
  };
})();
