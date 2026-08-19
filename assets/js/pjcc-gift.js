/* =============================================================================
 * THE OPERATIVE CARD — who somebody is, and the one thing you can do to them
 * -----------------------------------------------------------------------------
 * 2026-08-13, Nate: *"how about a mechanism where a user can click on another user's
 * name, and they can give them 1, 5, 10, 25, or 50 credits? That's the only thing they
 * can interact with a specific user on for now. Later I'd like to be able to set up a
 * specific table for them."*
 *
 * 2026-08-19, Nate: *"when you click on a user… be able to see a limited bio of the user…
 * it shows their avatar and companion, their trophies, and secrets unlocked, and you can
 * gift them credits from there."*
 *
 * ⚠ THE FILENAME IS NARROWER THAN THE FILE. This shipped as `pjcc-gift.js` when a gift was
 * the only thing in it; it is now the whole panel and the gift is one section of it. The
 * name is kept because two pages point at it by path and a rename buys nothing a comment
 * cannot. `PJCCGift.open(codename)` is still the only door in.
 *
 * ══ WHY THE PANEL EXISTS AT ALL ═════════════════════════════════════════════
 * The gift sheet was built as "the panel you get when you tap an operative" with exactly
 * one action in it, precisely so the next thing he asked for would be an addition rather
 * than a rewrite. This is that addition. It still takes a CODENAME and nothing else, so
 * every surface that shows a name can open it without fetching anything first.
 *
 * ══ EVERYTHING ON THE CARD IS ALREADY PUBLIC — NO MIGRATION ═════════════════
 * `profiles` and `game_stats` are both `select using (true)` (docs/supabase-setup.sql §4:
 * "Read = public (for public profiles + leaderboards)"). The leaderboards have been drawing
 * strangers' codenames, avatars, credits and ratings off those policies since day one, so
 * this card reads NOTHING that was not already on a board — it just puts it in one place.
 * That is why it needs no SQL and works the moment it deploys.
 *
 * ⚠ THE TROPHIES ARE DERIVED HERE, NOT STORED ANYWHERE. `PJCC.earnedAchievements(prof,
 * stats)` is the same function your own dossier runs on you, handed somebody else's rows.
 * No achievement rule is duplicated into SQL, so adding one to ACHIEVEMENTS lights it up
 * on every card with no second edit and nothing to re-run.
 *
 * ⚠ SECRETS ARE NOT ON THIS CARD, AND CANNOT BE YET. Every `frag_*` an operative has ever
 * found lives in THEIR localStorage and has never been sent to the server (pjcc-eggs.js /
 * pjcc-hidden-board.js write flags, nothing uploads them). There is no row to read, so a
 * "secrets" section would be empty for literally everyone. It is not drawn rather than
 * drawn empty — a placeholder here reads as "this person has found nothing", which is a
 * lie about them rather than a gap in us.
 *
 * ⚠ THE PET'S COLORS ARE LOCAL TOO. `companion.pet` (the species) IS on the profile, but
 * the coat/eye/nose picked in the Forge are `loadLocal().pet` and go nowhere else
 * (pjcc-creator.js: "local, and nothing else"). A stranger's companion is therefore drawn
 * in the Forge's DEFAULT palette at the stage their play count earns. The species and the
 * stage are true; the colors are the factory ones.
 *
 * ══ WHAT MAKES THE GIFT SAFE, STRUCTURALLY ══════════════════════════════════
 * A gift carries an AMOUNT and a SENDER. There is no field in it a person could type a
 * sentence into. That is the same property that makes the four preset emotes the whole of
 * chat on this site — child-safety by construction rather than by moderation — and it is
 * the reason a "with a message" option must never be added here casually.
 *
 * ⚠ THE SERVER IS THE RULE, ALWAYS. The five amounts, the balance check, the two daily caps
 * (a loose one on giving, a tight one on receiving) and the you-cannot-gift-yourself rule
 * are all enforced in SQL — docs/credit-gifts-setup.md, which is the ONLY place either cap
 * is written down. Everything in this file is presentation: it draws five buttons, grays
 * out what you cannot afford, and repeats whatever the server says. Disabling a button
 * here is a courtesy, never a control.
 *
 * ⚠ AND ONLY YOUR OWN LIMITS ARE EVER SHOWN. The unaffordable amounts are disabled up
 * front because your balance is yours to know. The recipient's remaining room for the day
 * is NOT pre-checked and NOT drawn, even though it would be a nicer sheet: a client that
 * could ask "how much can this person still hold?" is a client that can measure a stranger's
 * day one question at a time. You find out by sending, and the server shortens the gift.
 *
 * ⚠⚠ THE CARD OPENS FOR EVERYONE; THE GIFT ROW DOES NOT. This is the split that changed on
 * 2026-08-19. The board used to draw a plain, unclickable name until the gift migration was
 * run — which meant looking at another operative was gated behind a payments feature that
 * has nothing to do with looking. Now the name always opens the card (the data is public
 * and needs nothing), and `giftsEnabled()` decides only whether the SEND section is drawn
 * inside it. A dead button is still worse than no button, so there is no path that renders
 * the amounts on a maybe.
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
    no_such_operative: 'That player is no longer here.',
    self:              'You can’t send credits to yourself.',
    not_enough:        'You don’t have that many credits.',
    daily_cap:         'You’ve given all you can today. Back tomorrow.',
    recipient_full:    'They can’t hold any more credits today.'
  };

  /* When a gift runs into one of the two daily rails the server SHORTENS it rather than
     refusing it, and the giver has to be told which half of that happened — otherwise the
     only visible fact is that a 50 button moved 20 credits, which reads as a bug.
     ⚠ `limit` names the rail, never a number: 'them' would otherwise be a way to measure
        how much somebody else has been given today, one gift at a time. */
  var SHORT = {
    them: 'That’s all they can hold today',
    you:  'That’s the rest of your day'
  };

  /* Refusals no amount can get past — the buttons stay down afterward. */
  var DEAD = ['offline', 'daily_cap', 'recipient_full'];

  var openSheet = null;
  var openToken = 0;          // invalidates a fetch whose card has already been closed

  function close() {
    if (!openSheet) return;
    openToken++;
    try { openSheet.remove(); } catch (e) {}
    openSheet = null;
    document.removeEventListener('keydown', onKey);
  }
  function onKey(e) { if (e.key === 'Escape') close(); }

  /* ── READING SOMEBODY ELSE ────────────────────────────────────────────────────────
     Two round trips, and the second needs the first's answer.

     ⚠ THE UUID IS A LOCAL VARIABLE AND NEVER REACHES THE MARKUP. `game_stats` is keyed by
     `user_id`, so the id has to be read to ask the second question — but it is used in the
     query and then dropped. Every identifier this card puts on the page is a codename,
     which is the rule `gift_credits(p_to_codename …)` set and the reason no page on this
     site has ever had to carry a user id in its HTML.

     ⚠ THE COLUMN LIST DEGRADES. `pjcc_rating` / `rated_games` arrived with the Park Tables
     v2 migration, and a Supabase that predates it errors the WHOLE select rather than
     returning nulls — which would blank a card that could otherwise be drawn from the core
     columns alone. So the wide select is tried and its failure falls back to the narrow
     one; the rating figure is simply absent on an older server. Same posture the rating
     board already takes (an empty board, not a crash). */
  var WIDE = 'id,codename,companion,credits,rank,pjcc_rating,rated_games,created_at';
  var CORE = 'id,codename,companion,credits,rank,created_at';

  function fetchPlayer(name) {
    var d = null;
    try { d = (window.PJCC && PJCC.db) ? PJCC.db() : null; } catch (e) {}
    if (!d) return Promise.resolve({ ok: false, reason: 'offline' });

    function profileRow() {
      return d.from('profiles').select(WIDE).eq('codename', name).maybeSingle()
        .then(function (r) {
          if (r && r.error) return d.from('profiles').select(CORE).eq('codename', name).maybeSingle();
          return r;
        });
    }

    return profileRow().then(function (r) {
      if (!r || r.error || !r.data) return { ok: false, reason: 'no_such_operative' };
      var prof = r.data;
      var uid = prof.id;
      return d.from('game_stats').select('game,best_score,plays').eq('user_id', uid)
        .then(function (g) {
          return { ok: true, profile: prof, stats: (g && !g.error && g.data) ? g.data : [] };
        }, function () {
          // the stats ARE the trophies; losing them costs a section, not the card
          return { ok: true, profile: prof, stats: [] };
        });
    }, function () { return { ok: false, reason: 'offline' }; });
  }

  /* ── THE COMPANION ────────────────────────────────────────────────────────────────
     Drawn by `PJCCPetArt`, which is a pure function of {species, stage, colors} and touches
     no storage — the only reason a stranger's pet can be drawn at all.

     ⚠ THE STAGE IS DERIVED, NOT READ. The Den's bond level lives in that player's own
     localStorage, so it is unknowable from here. `PJCC.companionLevel(rounds)` is the
     site's OTHER companion ladder and it is keyed on total rounds played — which IS on the
     server, in game_stats. Three art stages against eight levels, so the fold is written
     once here and the LABEL comes back off PJCC.LEVELS rather than being typed, which is
     what keeps this from becoming a second copy of the stage names.

     ⚠ Returns '' when pjcc-pet-art.js is not on the page. That is a section which visibly
     is not there, and that is the correct way for a missing script to fail — a fallback
     that still looked like a companion would hide the fact that it never loaded. */
  function petBlock(prof, rounds) {
    if (!window.PJCCPetArt || !window.PJCC || !PJCC.companionLevel) return '';
    var species = String((PJCC.petKey ? PJCC.petKey(prof) : 'dog-1') || 'dog-1').split('-')[0];
    if ((PJCCPetArt.SPECIES || []).indexOf(species) < 0) species = 'dog';
    var lv = PJCC.companionLevel(rounds);
    var stage = lv.level >= 6 ? 2 : lv.level >= 3 ? 1 : 0;
    var art = '';
    // the Forge's own defaults (pjcc-creator.js) — a stranger's real palette is local-only
    try { art = PJCCPetArt.svg({ species: species, stage: stage, coat: 'natural', eye: 'brown', nose: 'black' }); }
    catch (e) { return ''; }
    return '<section class="op-sec">' +
      '<h4 class="op-h">Companion</h4>' +
      '<div class="op-pet"><span class="op-pet-art">' + art + '</span>' +
      '<span class="op-pet-txt"><b>' + esc(lv.stage) + '</b><small>Level ' + lv.level + '</small></span></div>' +
    '</section>';
  }

  /* ── THE TROPHIES ─────────────────────────────────────────────────────────────────
     ⚠ EARNED ONES ONLY. The full list with the misses grayed out is right on your OWN
     dossier, where it is a to-do list; on somebody else's card the same list is a public
     account of what they have not done. Same argument as the board's suppressed Recruit
     pip — a badge everyone wears is not a badge. */
  function trophyBlock(prof, stats) {
    if (!window.PJCC || !PJCC.earnedAchievements) return '';
    var all = PJCC.earnedAchievements(prof, stats);
    var got = all.filter(function (a) { return a.earned; });
    var body = got.length
      ? '<ul class="op-tros">' + got.map(function (a) {
          return '<li class="op-tro" title="' + esc(a.label + ' — ' + a.desc) + '">' +
                 '<span class="op-tro-ic" aria-hidden="true">' + esc(a.icon) + '</span>' +
                 '<span class="op-tro-lb">' + esc(a.label) + '</span></li>';
        }).join('') + '</ul>'
      : '<p class="op-none">No trophies yet.</p>';
    return '<section class="op-sec">' +
      '<h4 class="op-h">Trophies <i>' + got.length + ' of ' + all.length + '</i></h4>' + body +
    '</section>';
  }

  /* ── THE FIGURES ──────────────────────────────────────────────────────────────────
     ⚠ THE RATING IS ONLY SHOWN ONCE IT MEANS SOMETHING. Everybody starts at 250 without
     ever sitting down at a table, so an unplayed 250 beside a codename reads as a
     measurement when it is a default. The ratings board already draws exactly this line
     (`.gt('rated_games', 0)`); the card holds to the same one. */
  function figures(prof, rounds) {
    var out = [];
    out.push('<div class="op-fig"><b>' + nfmt(prof.credits || 0) + '</b><small>credits</small></div>');
    if (prof.rated_games > 0 && prof.pjcc_rating != null) {
      out.push('<div class="op-fig"><b>' + nfmt(prof.pjcc_rating) + '</b><small>rating</small></div>');
    }
    out.push('<div class="op-fig"><b>' + nfmt(rounds) + '</b><small>rounds</small></div>');
    return '<div class="op-figs">' + out.join('') + '</div>';
  }

  function sinceLine(prof) {
    if (!prof.created_at) return '';
    var d = new Date(prof.created_at);
    if (isNaN(d.getTime())) return '';
    var MON = ['January', 'February', 'March', 'April', 'May', 'June',
               'July', 'August', 'September', 'October', 'November', 'December'];
    return '<p class="op-since">On the board since ' + MON[d.getMonth()] + ' ' + d.getFullYear() + '.</p>';
  }

  /* ── THE ONE ACTION ───────────────────────────────────────────────────────────────
     Unchanged in every respect that matters: five buttons, affordability as a courtesy,
     the server as the rule. It is a SECTION of a card now rather than the whole sheet. */
  function giftBlock(have, tiers) {
    return '<section class="op-sec op-give">' +
      '<h4 class="op-h">Send Credits</h4>' +
      '<div class="gift-row">' +
        tiers.map(function (n) {
          // affordability is a COURTESY here; the server refuses regardless
          var poor = n > have;
          return '<button class="gift-amt" data-amt="' + n + '"' + (poor ? ' disabled' : '') +
                 ' aria-label="Send ' + n + ' credits">' + n + '</button>';
        }).join('') +
      '</div>' +
      '<p class="gift-bal" id="gift-bal">You have <b>' + nfmt(have) + '</b> credits.</p>' +
    '</section>';
  }

  /* ── FOLLOW ───────────────────────────────────────────────────────────────────────
     One button, two states, and nothing else — no count beside it, because there is no
     count anywhere (docs/follows-setup.md carries the argument: a public follower number
     on a site this young reads "nobody is here" on every card, and once it exists, being
     followed becomes a thing to perform).

     ⚠ IT IS A TOGGLE, SO IT SAYS WHAT IT WILL DO AND WHAT IS TRUE AT THE SAME TIME.
     `aria-pressed` carries the state for a screen reader; the visible label says
     "Following" when on, because a button that reads "Unfollow" makes you decode the
     current state from the name of its opposite. */
  function followBlock(on) {
    return '<section class="op-sec op-follow">' +
      '<button class="op-fol" id="op-fol" aria-pressed="' + (on ? 'true' : 'false') + '">' +
        '<span class="op-fol-ic" aria-hidden="true">' + (on ? '★' : '☆') + '</span>' +
        '<span class="op-fol-tx">' + (on ? 'Following' : 'Follow') + '</span>' +
      '</button>' +
      '<p class="op-fol-note" id="op-fol-note">Keeps them on your list. They aren’t told.</p>' +
    '</section>';
  }

  /* Every refusal `set_follow` can return, in the player's language. Kept beside SAID
     rather than inside it: these are a different feature's vocabulary and the gift's list
     is checked against the gift's SQL. */
  var FOLLOW_SAID = {
    offline:        'Follow isn’t switched on yet.',
    signed_out:     'Sign in to follow players.',
    no_such_player: 'That player is no longer here.',
    self:           'You can’t follow yourself.',
    follow_cap:     'Your list is full.'
  };

  function wireFollow(ov, name) {
    var b = ov.querySelector('#op-fol');
    var note = ov.querySelector('#op-fol-note');
    if (!b) return;
    b.onclick = function () {
      var want = b.getAttribute('aria-pressed') !== 'true';
      b.disabled = true;
      Promise.resolve(
        (window.PJCC && PJCC.setFollow) ? PJCC.setFollow(name, want)
                                        : { ok: false, reason: 'offline' }
      ).then(function (r) {
        b.disabled = false;
        if (r && r.ok) {
          // ⚠ paint from the SERVER's answer, never from `want`
          var on = !!r.following;
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
          b.querySelector('.op-fol-ic').textContent = on ? '★' : '☆';
          b.querySelector('.op-fol-tx').textContent = on ? 'Following' : 'Follow';
          if (note) note.textContent = on
            ? 'On your list. They aren’t told.'
            : 'Keeps them on your list. They aren’t told.';
          return;
        }
        if (note) note.textContent = (r && FOLLOW_SAID[r.reason]) || FOLLOW_SAID.offline;
      });
    };
  }

  function wireGift(ov, name) {
    var bal = ov.querySelector('#gift-bal');
    if (!bal) return;
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
            var kept = (typeof r.kept === 'number') ? r.kept : 0;
            var why  = kept > 0 ? SHORT[r.limit] : null;
            bal.innerHTML = '<b class="gift-ok">Sent ' + r.amount + ' to ' + esc(name) + '.</b>' +
                            (why ? ' ' + why + ' — the other <b>' + nfmt(kept) + '</b> stayed with you.' : '') +
                            ' You have <b>' + nfmt(r.balance) + '</b> left.';
            // a shortened gift is two sentences and a number the player did not expect —
            // give it time to be read instead of closing on the usual beat
            setTimeout(close, kept > 0 ? 3400 : 1600);
            return;
          }
          var why = (r && SAID[r.reason]) || SAID.offline;
          bal.innerHTML = '<b class="gift-no">' + esc(why) + '</b>';
          // re-open only what is still affordable, so a failed send is not a dead sheet.
          // ⚠ Except where retrying CANNOT work: a spent daily rail — yours or theirs —
          // refuses all five amounts identically, and re-enabling them invites a player to
          // tap their way through the ladder to find that out.
          var now = 0;
          try { var p2 = PJCC.getProfile(); now = (p2 && p2.credits) || 0; } catch (e) {}
          if (r && DEAD.indexOf(r.reason) < 0) {
            Array.prototype.forEach.call(ov.querySelectorAll('[data-amt]'), function (x) {
              x.disabled = +x.getAttribute('data-amt') > now;
            });
          }
        });
      };
    });
  }

  /* ── THE CARD ─────────────────────────────────────────────────────────────────────
     ⚠ Built and torn down per open, deliberately. A single persistent node would have to
     be reset on every open — the amount buttons re-enabled, the status line cleared, the
     name swapped — and the bug that pattern produces is a stale message from the LAST
     person you looked at appearing under the name of the next one.

     ⚠ IT OPENS BEFORE IT KNOWS ANYTHING. The overlay goes up on the tap with the name
     already in it and the body fills in when the two queries land. Awaiting the fetch
     first would mean a tap that does nothing for a beat, which on a phone is a tap the
     player simply makes again. */
  function open(codename) {
    close();
    var name = String(codename || '').trim();
    if (!name) return;
    var my = ++openToken;

    var ov = document.createElement('div');
    ov.className = 'gift-ov';
    ov.innerHTML =
      '<div class="gift-sheet op-card" role="dialog" aria-modal="true" aria-label="Player ' + esc(name) + '">' +
        '<button class="gift-x" id="gift-x" aria-label="Close">×</button>' +
        '<div id="op-body">' +
          '<p class="gift-h">Player</p>' +
          '<p class="gift-who">' + esc(name) + '</p>' +
          '<p class="op-none">Opening the file…</p>' +
        '</div>' +
      '</div>';
    document.body.appendChild(ov);
    openSheet = ov;
    document.addEventListener('keydown', onKey);
    ov.querySelector('#gift-x').onclick = close;
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    ov.querySelector('#gift-x').focus();

    var body = ov.querySelector('#op-body');

    /* The card's data, "may I gift" and "may I follow" are independent questions, so all
       three are asked at once. Both probes are cached and neither rejects; the fetch
       resolves a reason rather than throwing. Nothing here can take anything else down.
       ⚠ `following()` is warmed in the same breath — it is one call per SESSION, not per
       card, and it is what lets the Follow button render in the first synchronous pass
       instead of appearing a beat later under a thumb. */
    Promise.all([
      fetchPlayer(name),
      Promise.resolve(PJCCGift.available()).then(function (v) { return !!v; }, function () { return false; }),
      Promise.resolve(
        (window.PJCC && PJCC.followsEnabled) ? PJCC.followsEnabled() : false
      ).then(function (on) {
        if (!on || !PJCC.following) return false;
        return PJCC.following().then(function () { return true; }, function () { return false; });
      }, function () { return false; })
    ]).then(function (both) {
      if (my !== openToken) return;            // closed, or a different card opened over it
      var res = both[0], giftsOn = both[1], followsOn = both[2];

      if (!res.ok) {
        body.innerHTML = '<p class="gift-h">Player</p><p class="gift-who">' + esc(name) + '</p>' +
          '<p class="gift-bal"><b class="gift-no">' + esc(SAID[res.reason] || SAID.offline) + '</b></p>';
        return;
      }

      var prof = res.profile;
      var stats = res.stats;
      var rounds = stats.reduce(function (a, s) { return a + (s.plays || 0); }, 0);

      var me = null;
      try { me = (window.PJCC && PJCC.getProfile) ? PJCC.getProfile() : null; } catch (e) {}
      var mine = !!(me && me.codename === prof.codename);
      var have = (me && typeof me.credits === 'number') ? me.credits : 0;
      var tiers = (window.PJCC && PJCC.GIFT_TIERS) || [1, 5, 10, 25, 50];

      /* THE PIP, ALWAYS — unlike a leaderboard row. `BOARD_PIP_MIN_LEVEL` suppresses the
         Recruit dot on a BOARD because a dot on every row is noise; a card is a dossier,
         and one pip beside one codename is information. That is the same split your own
         dossier and the profile bar already make. */
      var cl = null;
      try {
        cl = (window.PJCC && PJCC.clearance)
          ? PJCC.clearance({ pjcc_rating: prof.pjcc_rating || 0, credits: prof.credits || 0 }) : null;
      } catch (e) {}
      var title = (window.PJCC && PJCC.titleLabel) ? PJCC.titleLabel(prof) : '';
      var face = (window.PJCC && PJCC.avatarMarkup) ? PJCC.avatarMarkup(prof) : '';

      body.innerHTML =
        '<div class="op-top">' +
          '<span class="op-face" aria-hidden="true">' + face + '</span>' +
          '<span class="op-id">' +
            '<span class="gift-h">Player' + (mine ? ' · you' : '') + '</span>' +
            '<span class="gift-who">' + esc(prof.codename) + '</span>' +
            (cl ? '<span class="op-cl"><span class="pjcc-pip pip-' + cl.level + '">' + esc(cl.pip) + '</span> ' +
                  esc(cl.name) + (title ? ' <i>· ' + esc(title) + '</i>' : '') + '</span>'
                : (title ? '<span class="op-cl"><i>' + esc(title) + '</i></span>' : '')) +
          '</span>' +
        '</div>' +
        figures(prof, rounds) +
        sinceLine(prof) +
        petBlock(prof, rounds) +
        trophyBlock(prof, stats) +
        /* ⚠ NEITHER ACTION APPEARS ON YOUR OWN CARD. The server refuses `self` for both
           anyway, but offering an action that can only fail is a worse sin than not
           offering it — and nothing is drawn in its place, because an explanation of why
           you cannot pay or follow yourself is a sentence nobody needed to read.
           ⚠ FOLLOW SITS ABOVE THE MONEY, on purpose: it is the free, reversible, private
           one, and it should not read as the lesser option under a row of green. */
        (followsOn && !mine ? followBlock(PJCC.isFollowing(prof.codename)) : '') +
        (giftsOn && !mine ? giftBlock(have, tiers) : '');

      /* ⚠⚠ NOTHING IS FOCUSED AFTER THE FILL, AND BOTH REASONS ARE LOAD-BEARING.
         The gift sheet used to focus its first affordable amount, which was right when the
         sheet WAS the gift. On a card it fails twice over:

           1. IT SCROLLS THE PERSON OFF THE TOP. Focusing an element inside an
              `overflow-y:auto` box scrolls that box to reveal it. On a short window — a
              laptop at 420px of height, a phone in landscape — the card opened already
              scrolled to the send row, so you tapped a codename and were shown a row of
              money with no name, face or clearance above it. Caught in a render; the
              card's own bounding rect was perfectly fine, so no geometry check saw it.
           2. IT ARMS A SPEND WITH A SPACEBAR. The first thing a keyboard user's focus
              lands on should not be a button that moves credits.

         Focus stays on the close button, set at open. `scrollTop = 0` is belt-and-braces
         for anything else that might scroll during the fill. */
      var card = ov.querySelector('.op-card');
      if (card) card.scrollTop = 0;

      if (followsOn && !mine) wireFollow(ov, prof.codename);
      if (giftsOn && !mine) wireGift(ov, prof.codename);
    });
  }

  window.PJCCGift = {
    open: open,
    close: close,
    /* Whether the SEND section is drawn. Resolves false when the migration has not been
       run, when there is no backend, and for every signed-out visitor.
       ⚠ THIS NO LONGER GATES THE CARD ITSELF — see the header. A caller that awaits this
       before letting somebody LOOK at an operative is gating public data behind a payments
       feature that has nothing to do with looking. */
    available: function () {
      try {
        return (window.PJCC && PJCC.giftsEnabled) ? PJCC.giftsEnabled() : Promise.resolve(false);
      } catch (e) { return Promise.resolve(false); }
    },
    SAID: SAID
  };
})();
