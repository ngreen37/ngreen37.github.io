/* =============================================================================
 * PJCC · The Identity Forge  (Avenue 6 — character & companion creation)
 * -----------------------------------------------------------------------------
 * Real creation, not a pick-list. Your OPERATIVE (character) and your COMPANION
 * (pet) are each composed from layered parts — base + skin tone + aura + headwear
 * + emblem — plus a freely-editable name, role line, and bio. Everything is
 * renamable and modifiable ANY time, instantly. Guest-first: the whole thing runs
 * on localStorage with no account. When you ARE signed in, your look syncs to the
 * profile (companion.look) so it follows you across devices and shows in the nav.
 *
 * Care + skills + adoption still live in the Companion Den (pjcc-companion.js);
 * the Forge owns identity & appearance. The two share the pet's name + tint.
 *
 *   PJCCForge.identity()            -> resolved operative look object
 *   PJCCForge.renderAvatar(el,look) -> paint the composited avatar into `el`
 *   PJCCForge.renderCard(el)        -> draw the Dossier identity card
 *   PJCCForge.open('operative'|'companion')
 *   PJCCForge.onChange(fn)          -> fires whenever a look is committed
 * ========================================================================== */
(function () {
  'use strict';

  /* ══ THE CHARACTER IS HUMAN, AND DRAWN (2026-08-03) ═══════════════════════════
     Nate: "Take away characters like fox, visitor, robot, and fairy. Keep them human.
     Keep the eye setup uniform so we can change eye color."

     WHAT LEFT. 32 emoji bases, of which nine were not people: Fox 🦊, Visitor 👽,
     Robot 🤖, Fairy 🧚, Ghost 👻, Genie 🧞, Elf 🧝, Vampire 🧛 and Merfolk 🧜. He named
     four and said "keep them human", which is the rule the other five fall under too.

     WHAT REPLACED THEM, and it is a bigger cast rather than a smaller one. The other 23
     were emoji as well — 🥷 is a picture, not a character with parts — so "change your eye
     color" was impossible for exactly the reason the companion's was until it got drawn
     ([[companion-is-emoji]]). The person is drawn now (assets/js/pjcc-face-art.js), so the
     profession that used to BE your character has moved to the two places that already
     carried it — Headwear and your Title — and who you are is hair + skin + eyes:

         12 hair × 12 hair colors × 6 skin tones × 10 eyes × 11 second rings
                                    ≈ 95,000 faces, against 32 fixed ones

     …and a ninja can have red hair and green eyes, which was never possible when the
     ninja was the picture. The nine that left were the only thing lost.

     ⚠ NOBODY LOSES THEIR CHARACTER. Every one of the 32 old keys maps to a hair style and
     an expression in BASE_MIGRATE below, so a saved look opens as a person who resembles
     it rather than resetting to the default. That includes the nine non-humans: the Fox
     becomes a curly-haired person, the Ghost a bald one. */
  var FACES = [
    { key:'crop',   n:'Crop',     brow: 0, mouth: 0 },
    { key:'swept',  n:'Swept',    brow: 0, mouth: 0 },
    { key:'buzz',   n:'Buzz',     brow:-1, mouth: 0 },
    { key:'curls',  n:'Curls',    brow: 1, mouth: 1 },
    { key:'afro',   n:'Afro',     brow: 0, mouth: 1 },
    { key:'bob',    n:'Bob',      brow: 0, mouth: 1 },
    { key:'long',   n:'Long',     brow: 0, mouth: 0 },
    { key:'tail',   n:'Ponytail', brow: 1, mouth: 1 },
    { key:'braids', n:'Braids',   brow: 1, mouth: 1 },
    { key:'bun',    n:'Top knot', brow:-1, mouth: 0 },
    { key:'locs',   n:'Locs',     brow: 0, mouth: 1 },
    { key:'bald',   n:'Bald',     brow:-1, mouth: 0 }
  ];
  var FACE_MAP = {}; FACES.forEach(function (f) { FACE_MAP[f.key] = f; });

  // every old emoji base → the person who most resembles it
  var BASE_MIGRATE = {
    recruit:'crop', agent:'swept', sleuth:'crop', ninja:'bun', princess:'long',
    heir:'swept', mage:'long', elf:'long', hero:'swept', rogue:'crop',
    warden:'crop', guard:'buzz', builder:'crop', seer:'bob', sage:'bun',
    vampire:'swept', merfolk:'long', fairy:'bob', genie:'bun', pilot:'crop',
    astro:'buzz', scientist:'bob', artist:'curls', teacher:'bob', coder:'crop',
    cook:'bun', farmer:'crop', singer:'curls', robot:'buzz', alien:'bald',
    fox:'curls', ghost:'bald'
  };

  /* ⚠ THE TONE KEYS ARE STILL THE EMOJI SKIN-TONE MODIFIERS. They mean nothing to a
     drawn face — PJCCFaceArt.SKIN looks the color up by them — but every look saved
     since the Forge shipped carries one, and keeping the key is a migration that cannot
     fail. Ugly identifier, zero risk; see the note in pjcc-face-art.js. */
  function art() { return window.PJCCFaceArt || null; }
  function TONE_ORDER() { var A = art(); return A ? A.SKIN_ORDER : ['']; }

  var HATS = {
    none:    { em:'',   n:'None' },
    crown:   { em:'👑', n:'Crown' },
    tophat:  { em:'🎩', n:'Top hat' },
    cap:     { em:'🧢', n:'Cap' },
    grad:    { em:'🎓', n:'Scholar' },
    helmet:  { em:'⛑️', n:'Helmet' },
    beret:   { em:'🪖', n:'Beret' },
    sunhat:  { em:'👒', n:'Sun hat' },
    bow:     { em:'🎀', n:'Bow' },
    flower:  { em:'🌸', n:'Blossom' },
    star:    { em:'🌟', n:'Halo' },
    paw:     { em:'🐾', n:'Paw' }
  };
  var EMBLEMS = {
    none:    { em:'',   n:'None' },
    king:    { em:'♔', n:'King' },
    queen:   { em:'♕', n:'Queen' },
    rook:    { em:'♖', n:'Rook' },
    bishop:  { em:'♗', n:'Bishop' },
    knight:  { em:'♘', n:'Knight' },
    pawn:    { em:'♙', n:'Pawn' },
    star:    { em:'⭐', n:'Star' },
    bolt:    { em:'⚡', n:'Bolt' },
    flame:   { em:'🔥', n:'Flame' },
    shield:  { em:'🛡️', n:'Shield' },
    heart:   { em:'❤️', n:'Heart' }
  };
  // Aura = the glow ring + the operative's personal accent color.
  var AURAS = {
    gold:    '#F5C518', jade:   '#6bffb8', crimson: '#ff6b6b', sakura: '#ff8fd0',
    azure:   '#6bbfff', violet: '#b07bff', amber:   '#ff9f43', mono:   '#cdbcf2',
    emerald: '#2ecc71', ice:    '#a8e6ff', rose:    '#ff6b9d', lime:   '#c9ff6b'
  };
  var AURA_ORDER = ['gold','jade','crimson','sakura','azure','violet','amber','mono','emerald','ice','rose','lime'];

  /* ── THE COAT FILTER IS GONE (2026-07-28) ───────────────────────────────────
     What stood here was `TINTS`, `ensureCoatDefs()` and `coatFilter()`: a set of
     hue/saturation numbers, a generated block of SVG <defs>, and a saturation-keyed
     mask that recolored an emoji companion's fur while trying not to eat its nose.

     It worked, it was tuned against a render, and it is now entirely unnecessary —
     the companion is DRAWN (assets/js/pjcc-pet-art.js), so the coat is a `fill` on
     the shapes that are the coat. There is nothing to mask, nothing to key off
     saturation, and nothing to re-tune when a new species is added. The eyes and the
     nose became their own colors in the same move, which is the thing the filter
     could never have done at any level of cleverness.

     Deleting ~70 lines of clever is the best outcome a clever fix can have.
     `git show 875d8d1 -- assets/js/pjcc-creator.js` if it is ever wanted back. */

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]; }); }

  /* ⚠ `glyph` STILL EXISTS AND IS STILL AN EMOJI, on purpose. PJCC.avatarEmoji() feeds
     three places that cannot take markup — most sharply `dossier.md`'s share card, which
     paints it with `ctx.fillText` onto a canvas — plus a cached copy in localStorage. So
     the look keeps one honest text stand-in: a person, wearing your skin tone. Everywhere
     that CAN take markup gets the drawn face (PJCC.avatarMarkup). */
  function baseGlyph(key, tone) { return '🧑' + (tone || ''); }

  // the drawn face for a resolved look — the real picture of your character
  function faceSvg(look, over) {
    var A = art();
    var o = { tone: look.tone, hair: look.hair, hairColor: look.hairColor,
              eye: look.eye, eyeR: look.eyeR, brow: look.brow, mouth: look.mouth };
    if (over) Object.keys(over).forEach(function (k) { o[k] = over[k]; });
    if (!A) return '<span class="idn-glyph">' + baseGlyph(o.hair, o.tone) + '</span>';
    return A.svg(o);
  }
  function auraColor(key) { return AURAS[key] || AURAS.gold; }

  // ---- storage ------------------------------------------------------------
  var KEY = 'pjcc.identity.v1';
  function defaults() {
    return {
      op:  { hair:'crop', tone:'', hairColor:'brown', eye:'brown', eyeR:'same',
             aura:'gold', hat:'none', emblem:'none', name:'', role:'', bio:'' },
      pet: { coat:'natural', eye:'brown', nose:'black', aura:'none', bio:'' }
    };
  }
  function loadLocal() {
    var s = null; try { s = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
    var d = defaults();
    if (!s) return d;
    var op = Object.assign(d.op, s.op || {});
    var pet = Object.assign(d.pet, s.pet || {});
    /* MIGRATION off the 32 emoji bases (2026-08-03). `base` was the whole character;
       `hair` is one part of a drawn one. Read it ONCE, map it, and drop it — leaving
       `base` behind would mean a look that keeps flipping back on the next load.

       ⚠ ASK THE SAVED OBJECT, NOT THE MERGED ONE. `op` has already been merged over the
       defaults, so `op.hair` is ALWAYS truthy — it is 'crop' when nothing was saved. The
       first version tested `!op.hair` and therefore never migrated anybody: a stored Fox
       reopened as the default Crop instead of as the curly-haired person it maps to.
       Caught by driving the Forge with an old look in storage. */
    var saved = s.op || {};
    if (saved.base && !saved.hair) op.hair = BASE_MIGRATE[saved.base] || 'crop';
    if (op.base) delete op.base;
    if (!FACE_MAP[op.hair]) op.hair = 'crop';
    var A = art();
    if (A) {
      if (!A.SKIN[op.tone]) op.tone = '';
      if (!A.HAIRCOL[op.hairColor]) op.hairColor = 'brown';
      if (!A.EYES[op.eye]) op.eye = 'brown';
      /* MIGRATION off the two-tone iris (2026-08-04, "forget the outer eye — scrap it").
         `eyeOuter` was the OUTER RING of both irises; there is no honest mapping onto a
         second EYE, so it is dropped rather than reinterpreted — inventing heterochromia for
         someone who asked for a hazel rim would be worse than resetting them to a matched
         pair. What they picked as `eye` is kept, which is the color they actually see. Deleted
         from the saved object as well as the merged one, or it would come back on every load
         (the same lesson `base` taught on 2026-08-03). */
      if (op.eyeOuter !== undefined) delete op.eyeOuter;
      if (op.eyeR !== 'same' && !A.EYES[op.eyeR]) op.eyeR = 'same';
    }
    if (!AURAS[op.aura]) op.aura = 'gold';
    if (!HATS[op.hat]) op.hat = 'none';
    if (!EMBLEMS[op.emblem]) op.emblem = 'none';
    /* MIGRATION off the filter era (2026-07-28). `tint` was the coat when the pet was
       an emoji wearing an SVG filter; the drawn palette renamed two of its entries
       (`none` was really "natural fur", and `spirit` has no equivalent — `snow` is the
       closest). Anyone who had picked a coat keeps it. */
    if (pet.tint && !pet.coat) {
      pet.coat = pet.tint === 'none' ? 'natural' : pet.tint === 'spirit' ? 'snow' : pet.tint;
      delete pet.tint;
    }
    /* ⚠ `petArt` — NOT `art`. This local was called `art` until 2026-08-03, when the
       person got a face-art module and `art()` became the helper that returns it. A `var`
       shadows the whole function scope from its first line, so `art()` in the block ABOVE
       threw "art is not a function" — but only once something had been saved, because the
       `if (!s) return d` early exit skips this block on a first visit. First render fine,
       every click after the first silently dead. Caught by driving the real Forge; two
       different harness runs reported "nothing moved" before that, both because nothing
       was happening at all. */
    var petArtLib = window.PJCCPetArt;
    if (petArtLib) {
      if (!petArtLib.COATS[pet.coat]) pet.coat = 'natural';
      if (!petArtLib.EYES[pet.eye]) pet.eye = 'brown';
      if (!petArtLib.NOSES[pet.nose]) pet.nose = 'black';
    }
    return { op: op, pet: pet };
  }
  function saveLocal(state) {
    state.op.glyph = baseGlyph(state.op.hair, state.op.tone);   // the text stand-in — see baseGlyph
    /* WHEN this device last authored the look. It rides along to the account through
       PJCC.setLook, so the two copies can be compared instead of one always winning —
       see adoptAccountLook() below, which is the whole fix for the one-behind bug. */
    state.op.at = Date.now();
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }
  // has this device ever saved a look, or are we reading pure defaults?
  function hasLocal() { try { return !!localStorage.getItem(KEY); } catch (e) { return false; } }

  // The account's copy of the look (cross-device). A SEED, not an authority — see below.
  function accountLook() {
    try { var p = window.PJCC && PJCC.getProfile && PJCC.getProfile(); return (p && p.companion && p.companion.look) || null; } catch (e) { return null; }
  }
  function accountCodename() {
    try { var p = window.PJCC && PJCC.getProfile && PJCC.getProfile(); return (p && p.codename) || ''; } catch (e) { return ''; }
  }

  /* ══ THE ACCOUNT IS A SEED, NOT AN AUTHORITY — 2026-08-04 ════════════════════════════
     Nate: "The customize buttons still don't work properly for the humans. You click on one
     button and it goes to the previous one you picked, then you have to click again to get it
     right… For reference — the Companion customize buttons appear to work correctly."

     ⭐ HIS REFERENCE IS THE DIAGNOSIS. The two tabs run the same click path — patchOp and
     patchPet are twins — but they read back through different doors:

         petLook()   -> loadLocal().pet                      (local, and nothing else)
         identity()  -> Object.assign({}, local.op, account) (the ACCOUNT painted on top)

     And the account copy is written on a **600ms debounce** by scheduleSync. So a click wrote
     the new value to localStorage, immediately re-read it, and had the *previous* value —
     still sitting in the profile because the sync had not gone out yet — painted straight
     back over it. Click green: you get brown. Click blue: you get green. Exactly "one button
     behind", and it went on forever because every click renewed the lag. The Companion tab
     never had it because it never consults the account.

     ⚠ IT ONLY HAPPENS SIGNED IN, WHICH IS WHY IT SHIPPED. `accountLook()` returns null with
     no profile, so the overlay is a no-op — and tests/creator.check.js has never had a
     profile. It does now ([[pjcc-profile-system]]: always test gated behavior signed OUT *and*
     signed IN; the developer is always signed in, and here that was the half that was broken).

     THE FIX IS THE DIRECTION OF THE MERGE, ONCE, AT THE RIGHT MOMENT. The account look is how
     a look reaches a NEW DEVICE; it is not a second opinion about the click you just made. So
     `identity()` reads local and only local — the Companion's rule — and the account copy is
     ADOPTED INTO local by adoptAccountLook() when the profile arrives, if it is genuinely
     newer. Both copies carry `at` (see saveLocal) so "newer" is a comparison rather than a
     guess, and a device with no saved look at all takes whatever the account has. */
  function identity() {
    var op = loadLocal().op;
    if (!FACE_MAP[op.hair]) op.hair = 'crop';
    if (!AURAS[op.aura]) op.aura = 'gold';
    var f = FACE_MAP[op.hair];
    if (op.brow == null) op.brow = f.brow;
    if (op.mouth == null) op.mouth = f.mouth;
    op.glyph = baseGlyph(op.hair, op.tone);
    op.displayName = (op.name && op.name.trim()) || accountCodename() || 'Newcomer';
    return op;
  }
  function petLook() { return loadLocal().pet; }

  /* THE OTHER HALF OF THE FIX ABOVE — how a look still crosses devices.
     Runs when the profile lands (and on every auth change), never during a click:
       · nothing saved on this device  -> take the account's look, whatever its age. This is
         the case the overlay used to serve, and the only one it served correctly.
       · something saved here          -> take it only if the account's is genuinely NEWER.
         A pre-`at` account record counts as age 0, so the device you are typing on wins,
         which is the safe direction: the worst case is that a look from an older build has
         to be re-picked once, instead of every click being overwritten forever.
     It writes through the saved object so loadLocal()'s migrations run on it exactly as they
     do on a local look — an account record can be pre-migration too, and this is now the one
     place that has to know it. */
  function adoptAccountLook() {
    var al = accountLook();
    if (!al) return false;
    var s = null; try { s = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
    var mine = (s && s.op && s.op.at) || 0;
    if (hasLocal() && !((al.at || 0) > mine)) return false;
    var next = { op: Object.assign({}, al), pet: (s && s.pet) || defaults().pet };
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch (e) {}
    if (ov && !ov.classList.contains('hidden')) renderForge(true);
    emit();
    return true;
  }

  // ---- companion bridge (shares name + active pet with the Den) -----------
  /* The Den (pjcc-companion.js) owns the companion's save file; the Forge only borrows
     its name and species. It used to keep its OWN copy of that logic against
     `pjcc.pet.v2` — one save format out of date — so a name typed here was written where
     nothing would ever read it, and the Forge believed the active pet was always
     `dog-1`. Everything now goes through PJCCPet, which is the single owner. Each call is
     guarded because the Forge can render on a page where the Den script isn't loaded. */
  function petDefs() { return (window.PJCCPet && PJCCPet.PETS) || {}; }
  function activePetKey() { return (window.PJCCPet && PJCCPet.activeKey) ? PJCCPet.activeKey() : 'dog'; }
  function petBaseEmoji() { return (window.PJCCPet && PJCCPet.petEmoji) ? PJCCPet.petEmoji() : '🐕'; }
  function petName() {
    if (window.PJCCPet && PJCCPet.displayName) return PJCCPet.displayName();
    return 'Companion';
  }
  function petUnnamed() { return !!(window.PJCCPet && PJCCPet.unnamed && PJCCPet.unnamed()); }
  function setPetName(nm) { if (window.PJCCPet && PJCCPet.setName) PJCCPet.setName(nm); }
  function petPersona() { var d = petDefs(), k = activePetKey(); return d[k] ? d[k].persona : ''; }

  // ---- account sync (debounced) -------------------------------------------
  var syncT = null;
  function scheduleSync() {
    clearTimeout(syncT);
    syncT = setTimeout(function () {
      try {
        if (window.PJCC && PJCC.setLook && PJCC.currentUser && PJCC.currentUser()) {
          /* ⚠ `op.hair`, not `op.base` — `base` has not existed since the person got drawn
             (2026-08-03) and this line has been passing `undefined` ever since. It was
             harmless only because baseGlyph ignores its first argument. It also has to send
             `at`, which loadLocal returns as saved: that stamp is what lets the next device
             tell this look from its own ([[person-drawn-and-forge-repaint]]). */
          var op = loadLocal().op; op.glyph = baseGlyph(op.hair, op.tone);
          PJCC.setLook(op).catch(function () {});
        }
      } catch (e) {}
    }, 600);
  }

  // ---- change broadcast ----------------------------------------------------
  var listeners = [];
  function emit() { listeners.forEach(function (fn) { try { fn(); } catch (e) {} }); refreshMounts(); }

  // ---- composited avatar render -------------------------------------------
  function renderAvatar(el, look) {
    if (!el) return;
    look = look || identity();
    el.classList.add('idn-av');
    el.style.setProperty('--aura', auraColor(look.aura));
    var hat = HATS[look.hat] && look.hat !== 'none' ? HATS[look.hat].em : '';
    var emb = EMBLEMS[look.emblem] && look.emblem !== 'none' ? EMBLEMS[look.emblem].em : '';
    el.innerHTML =
      faceSvg(look) +
      (hat ? '<span class="idn-hat">' + hat + '</span>' : '') +
      (emb ? '<span class="idn-emblem">' + emb + '</span>' : '');
  }

  /* ---- THE identity card ---------------------------------------------------
     2026-07-27 (Nate: "It's odd with the two boxes and same picture… Let's combine and
     condense. I like the customize function. We don't need the second box. We don't need
     the @name. We don't need the fake job title").

     The profile used to open with TWO cards carrying two different pictures of you: this
     forge card (composited avatar, display name, @codename, a role line) and, right above
     it, an account header (shop avatar, codename, rank, credits, XP). Same person, twice.

     There's one card now. It keeps the look and the Customize button; the account facts
     are injected by whoever owns them via PJCC Forge's `accountBlock` hook (the Dossier
     registers one) so they re-appear on every re-render, including after an edit.
     Gone: the @codename echo and the invented role line. -------------------------- */
  var mounts = [], accountBlock = null;
  // The host page hands us a painter: fn(slotEl) fills + wires the account strip.
  function setAccountBlock(fn) { accountBlock = fn; refreshMounts(); }
  function renderCard(el) {
    if (!el) return;
    if (mounts.indexOf(el) === -1) mounts.push(el);
    var look = identity(), pl = petLook();
    el.innerHTML =
      '<div class="idn-card">' +
        '<div class="idn-av" id="' + uid(el) + '"></div>' +
        '<div class="idn-meta">' +
          '<div class="idn-name">' + esc(look.displayName) + '</div>' +
          (look.bio ? '<div class="idn-bio">“' + esc(look.bio) + '”</div>' : '') +
          '<div class="idn-account" data-account></div>' +
          '<div class="idn-pet-chip"><span class="ipc-em ipc-em--drawn">' + petArt(pl) + '</span> ' + esc(petName()) +
            '<button class="idn-edit-btn ghost" data-open="companion" style="padding:2px 9px;font-size:.7rem;margin-left:4px">Tweak</button></div>' +
        '</div>' +
        '<div class="idn-actions">' +
          '<button class="idn-edit-btn" data-open="operative">✦ Customize</button>' +
        '</div>' +
      '</div>';
    renderAvatar(el.querySelector('.idn-av'), look);
    Array.prototype.forEach.call(el.querySelectorAll('[data-open]'), function (b) {
      b.onclick = function () { open(b.getAttribute('data-open')); };
    });
    if (accountBlock) { try { accountBlock(el.querySelector('[data-account]')); } catch (e) {} }
  }
  var _uid = 0;
  function uid(el) { if (!el._idnId) el._idnId = 'idn-' + (++_uid); return el._idnId; }
  function refreshMounts() { mounts = mounts.filter(function (el) { return document.body.contains(el); }); mounts.forEach(function (el) { renderCard(el); }); }

  // ---- the Forge overlay ---------------------------------------------------
  /* `zoom` and `eyeTarget` are module state, not DOM classes, on purpose: `repaintOp()`
     rewrites the stage on every pick, so a flag living in the markup would be lost the first
     time you chose a color — i.e. every time it mattered. Neither is part of the character:
     one is how big you are looking, the other is which eye you are pointing at. */
  var ov = null, tab = 'operative', zoom = false, eyeTarget = 'both';
  function open(which) {
    tab = which === 'companion' ? 'companion' : 'operative';
    if (!ov) {
      ov = document.createElement('div'); ov.className = 'forge-ov';
      ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
      document.body.appendChild(ov);
    }
    ov.classList.remove('hidden'); document.body.style.overflow = 'hidden'; renderForge();
  }
  function close() { if (ov) ov.classList.add('hidden'); document.body.style.overflow = ''; scheduleSync(); }

  function toast(msg) { var t = document.createElement('div'); t.className = 'forge-toast'; t.textContent = msg; document.body.appendChild(t); setTimeout(function () { t.remove(); }, 1800); }

  /* ══ NOTHING MOVES WHEN YOU PICK SOMETHING (2026-08-03) ═══════════════════════
     Nate: "when you change aura or skin tone the base box shifts and vice versa. It's
     annoying can we get rid of it? Also when you click back in to Base; it goes elsewhere
     randomly."

     ONE CAUSE, BOTH BUGS. Every click ran `renderForge(true)`, which rebuilt the whole
     overlay with `ov.innerHTML = html` and then tried to put the scroll position back.
     Two things fell out of that:

       · THE SHIFT. Changing the skin tone re-rendered every Base cell with a different
         emoji — 🧑 became 🧑🏽 — and an emoji carrying a skin-tone modifier does not
         measure the same as one without. So the grid re-wrapped, the section changed
         height, and everything under it moved. Same for the aura, which re-rendered the
         cells for nothing at all.
       · THE JUMP. `scrollTop = sc` was written on a document that had just been replaced
         and not yet laid out, so the browser clamped it to whatever scrollHeight it had
         at that instant. Land on a taller or shorter panel and you are somewhere else —
         "randomly", because it depends on when layout happened to run.

     The fix is not to fix the restore, it is to stop rebuilding. A color or a part is a
     PROPERTY of a picker that is already on screen, so `repaintOp()` writes the fills and
     moves the `on` class and touches nothing else. No new nodes, no reflow, no scroll to
     restore — the panel literally cannot move.

     `renderForge()` is still there and still correct; it now runs only when the whole
     panel legitimately changes (opening the Forge, switching tabs). */
  function patchOp(p, heavy) {
    var s = loadLocal(); Object.assign(s.op, p); saveLocal(s); scheduleSync();
    if (heavy) renderForge(true); else repaintOp();
    emit();
  }
  function patchPet(p, heavy) {
    var s = loadLocal(); Object.assign(s.pet, p); saveLocal(s);
    if (heavy) renderForge(true); else repaintPet();
    emit();
  }

  // move the `on` class within one picker without touching anything else
  function markOn(attr, value) {
    if (!ov) return;
    Array.prototype.forEach.call(ov.querySelectorAll('[' + attr + ']'), function (c) {
      var on = c.getAttribute(attr) === value;
      c.classList.toggle('on', on);
      // the cells are buttons now — the pressed state has to move with the ring, or a
      // screen reader keeps announcing the old choice as the selected one
      c.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }
  function repaintOp() {
    if (!ov || tab !== 'operative') return;
    var look = identity();
    renderAvatar(ov.querySelector('#forge-prev'), look);
    /* Every hair cell wears YOUR skin, YOUR hair color and YOUR eyes, so the picker is a
       row of you rather than a row of strangers — and re-coloring it is a fill change on
       a box whose size never varies, which is exactly what the old emoji grid could not do. */
    Array.prototype.forEach.call(ov.querySelectorAll('[data-hair]'), function (c) {
      var slot = c.querySelector('.fc-face');
      if (slot) slot.innerHTML = faceSvg(look, { hair: c.getAttribute('data-hair'),
                                                 brow: FACE_MAP[c.getAttribute('data-hair')].brow,
                                                 mouth: FACE_MAP[c.getAttribute('data-hair')].mouth });
    });
    markOn('data-hair', look.hair);
    markOn('data-tone', look.tone);
    markOn('data-hcol', look.hairColor);
    /* the color row marks whichever eye the segmented control is aimed at — with a matched
       pair there is only one color to be `on`, so the target collapses to 'both' */
    var two2 = look.eyeR && look.eyeR !== 'same';
    markOn('data-eye1', (two2 && eyeTarget === 'right') ? look.eyeR : look.eye);
    markOn('data-eyet', two2 ? eyeTarget : 'both');
    markOn('data-aura', look.aura);
    markOn('data-hat', look.hat);
    markOn('data-emblem', look.emblem);
  }
  function repaintPet() {
    if (!ov || tab !== 'companion') return;
    var pl = petLook();
    var prev = ov.querySelector('#forge-prev');
    if (prev) { prev.style.setProperty('--aura', auraColor(pl.aura === 'none' ? 'violet' : pl.aura)); prev.innerHTML = petArt(pl); }
    var den = ov.querySelector('.forge-den-face'); if (den) den.innerHTML = petArt(pl);
    markOn('data-coat', pl.coat);
    markOn('data-eye', pl.eye);
    markOn('data-nose', pl.nose);
    markOn('data-paura', pl.aura);
  }

  /* ══ EVERY PICKER IS A REAL <button> (2026-08-04) ═══════════════════════════════════
     Nate: "For Emblem and Headwear and Skin Tone and Eyes and Hair Color, etc in Customize,
     you have to click twice to make your selection — this will frustrate users — it should
     only require one click."

     ⚠ BE HONEST ABOUT THIS ONE: the double-tap could not be reproduced in an emulator. Real
     mouse clicks AND emulated touch, on a stub page and on the live site, all took on the
     first hit. What that rules out is the HANDLER; what it cannot rule out is the platform,
     and there is a well-known WebKit behavior that produces exactly this symptom: Safari
     decides whether to synthesize a click on a non-interactive element from heuristics
     (`cursor:pointer`, hover rules, ancestor listeners), and when it decides wrong, the first
     tap is spent and the second one lands. Chrome's touch emulation is not WebKit and does
     not model it. Nate is on iOS.

     So the fix is to stop relying on the heuristic. These were `<div>`s with an `onclick`
     property. They are `<button type="button">` now — a native control, which every engine
     activates on the first tap with no guessing involved, and which cannot be affected by
     whatever the surrounding page is doing with pointer events.

     ⭐ IT WAS ALSO AN ACCESSIBILITY HOLE, and that is the part I should have caught without
     being asked. A div with a click handler has no role, no tab stop and no keyboard
     activation: the entire Identity Forge — every face, every color, every hat — was
     unreachable without a mouse. Buttons fix the reported bug and that at the same time,
     which is why this is the right fix rather than a workaround.

     `touch-action: manipulation` (in the SCSS) removes the double-tap-zoom wait on top. */
  function cell(on, em, name, attr) {
    return '<button type="button" class="forge-cell' + (on ? ' on' : '') + '" ' +
      (on ? 'aria-pressed="true" ' : 'aria-pressed="false" ') + attr + '>' +
      '<span class="fc-em">' + (em || '🚫') + '</span><span class="fc-n">' + esc(name) + '</span></button>';
  }
  // a picker cell whose picture is a drawn face rather than a glyph
  function faceCell(on, svg, name, attr) {
    return '<button type="button" class="forge-cell forge-cell--face' + (on ? ' on' : '') + '" ' +
      (on ? 'aria-pressed="true" ' : 'aria-pressed="false" ') + attr + '>' +
      '<span class="fc-face">' + svg + '</span><span class="fc-n">' + esc(name) + '</span></button>';
  }
  function swatch(on, color, attr, isNone) {
    return '<button type="button" class="forge-sw' + (on ? ' on' : '') + (isNone ? ' none' : '') +
      '" style="background:' + (isNone ? '' : color) + ';--sw:' + color + '" ' +
      (on ? 'aria-pressed="true" ' : 'aria-pressed="false" ') + attr + '>' + (isNone ? '∅' : '') + '</button>';
  }
  // a word in a segmented control — says WHICH thing the row below is about to change
  function segBtn(on, label, attr) {
    return '<button type="button" class="forge-seg-b' + (on ? ' on' : '') + '" ' +
      (on ? 'aria-pressed="true" ' : 'aria-pressed="false" ') + attr + '>' + esc(label) + '</button>';
  }

  function renderForge(keepScroll) {
    if (!ov) return;
    var sc = keepScroll && ov.querySelector('.forge-body') ? ov.querySelector('.forge-body').scrollTop : 0;
    var look = identity(), pl = petLook();
    var html = '<div class="forge">';

    /* ══ THE STAGE, WITH A MAGNIFIER (2026-08-04) ═════════════════════════════════════
       Nate: "we need a zoomed in preview of these changes — you can't really see the eyes,
       for example."

       He is exactly right, and the number says how right: the preview disc is 62px, the
       drawn face is 100 SVG units across, and one eye is 10.8 of those units. That is
       **6.7 pixels** for the whole eye — pupil, inner ring, outer ring and glint. No amount
       of redrawing makes a two-tone iris legible in 6.7px; the picture was simply too small
       to be a preview of the thing being edited.

       ⚠ AND IT CANNOT JUST BE MADE BIG. The stage was deliberately halved earlier the same
       day ("the preview of the character pops out which is great but we need to tone it down
       a bit") because at 242px tall the panel opened on a portrait and you had to scroll to
       reach a single control. Both notes are right and they are not in conflict — one is
       about the RESTING size, the other about being able to inspect. So zoom is a TOGGLE:
       62px at rest, 176px zoomed (2.8×, one eye becomes 19px), off by default, and it
       survives a repaint because `zoom` is module state rather than DOM state. */
    html += '<div class="forge-stage ' + (tab === 'companion' ? 'companion' : '') + (zoom ? ' zoom' : '') + '">' +
      '<div class="forge-head"><span class="forge-eyebrow">The Identity Forge</span>' +
        '<span class="forge-head-btns">' +
        '<button type="button" class="forge-zoom' + (zoom ? ' on' : '') + '" id="forge-zoom"' +
          ' aria-pressed="' + (zoom ? 'true' : 'false') + '"' +
          ' title="' + (zoom ? 'Shrink the preview' : 'Zoom in — see the eyes') + '">' +
          (zoom ? '🔎' : '🔍') + '<span class="fz-txt">' + (zoom ? 'Shrink' : 'Zoom') + '</span></button>' +
        '<button type="button" class="forge-close" id="forge-x" title="Done">✕</button>' +
        '</span></div>' +
      '<div class="forge-preview-wrap">';
    if (tab === 'operative') {
      html += '<div class="idn-av spin" id="forge-prev"></div>';
    } else {
      html += '<div class="idn-av spin idn-av--drawn" id="forge-prev" style="--aura:' + auraColor(pl.aura === 'none' ? 'violet' : pl.aura) + '">' +
        petArt(pl) + '</div>';
    }
    html += '</div>';
    if (tab === 'operative') {
      html += '<div class="fp-name">' + esc(look.displayName) + '</div>' +
              '<div class="fp-role">' + esc(look.role || 'Citizen of Checker Town') + '</div>';
    } else {
      html += '<div class="fp-name">' + esc(petName()) + '</div>' +
              '<div class="fp-role">' + esc(petPersona()) + '</div>';
    }
    html += '</div>';   // stage

    // tabs
    html += '<div class="forge-tabs">' +
      /* The tab said "Operative" until 2026-07-28. Nate: "we don't need the spy theme" —
         and to a first-time visitor, "Operative" is a word that has to be decoded before
         they can tell it means THEM. "Character" needs no decoding and pairs with
         "Companion" next to it. The data-tab key stays `operative` on purpose: it is an
         internal identifier wired into open(), the Dossier's Customize button and the
         saved look, and renaming it would be a migration for no gain. */
      '<button class="forge-tab ' + (tab === 'operative' ? 'on' : '') + '" data-tab="operative"><span class="ft-em">✦</span>Character</button>' +
      '<button class="forge-tab ' + (tab === 'companion' ? 'on' : '') + '" data-tab="companion"><span class="ft-em">🐾</span>Companion</button>' +
      '</div>';

    html += '<div class="forge-body">';
    html += (tab === 'operative') ? operativePanel(look) : companionPanel(pl);

    // footer
    html += '<div class="forge-foot">' +
      '<button class="forge-save" id="forge-done">Done</button>' +
      '<button class="forge-rand" id="forge-rand">🎲 Surprise me</button>';
    // The Companion tab's footer used to carry "Open the Companion Den →" here, as a
    // small underlined word. Removed 2026-07-28: the Den is a full panel at the TOP of
    // that tab now (.forge-den), and two doors to the same room — one of them tiny — is
    // exactly the "too small and tucked away" problem we just fixed. Dropping it also
    // means BOTH tabs now show the sign-in state in the footer, which the Companion tab
    // never did. (`#forge-den` stays wired in wireForge() if it's ever restored.)
    if (window.PJCC && PJCC.currentUser && PJCC.currentUser()) html += '<span class="forge-synced">✓ synced to your account</span>';
    else html += '<span class="forge-den-link" id="forge-go-dossier" style="margin-left:auto">Saved on this device · sign in to sync</span>';
    html += '</div>';

    html += '</div></div>';   // body, forge
    ov.innerHTML = html;
    if (tab === 'operative') renderAvatar(ov.querySelector('#forge-prev'), look);
    wireForge();
    if (sc) ov.querySelector('.forge-body').scrollTop = sc;
  }

  // Preset titles for the "give me a title" dice (2026-07-15 Nate: "a random title from
   // a preset list, like Foreman of the Sand Mines"). All grounded in the PJCC world; ≤40
   // chars to fit the Role field. Add freely.
  var TITLES = [
    'Foreman of the Sand Mines', 'The Tidecaller', 'Warden of Checker Town',
    'Gatekeeper of Chess City', 'Sentinel of Shogi Island', 'The Auditor',
    'Keeper of the Park Tables', 'The Night Desk Correspondent', 'Quartermaster of the Arcade',
    'Rook of the Eastern Wall', 'The Pawn Who Would Be Queen', 'Herald of Chess City',
    'Steward of the Reading Room', 'Champion of the Checker Town Open', 'The City Gatekeeper',
    'Envoy of the Construction Co.', 'Foreman of the Gauntlet', 'The Ferry Master'
  ];

  function operativePanel(look) {
    var A = art();
    var h = '';
    // ── who you are: the hair, drawn in your own colors ──
    h += '<div class="forge-section"><h3>Base <small>— who you are</small></h3><div class="forge-grid forge-grid--face">';
    FACES.forEach(function (f) {
      h += faceCell(look.hair === f.key,
        faceSvg(look, { hair: f.key, brow: f.brow, mouth: f.mouth }), f.n, 'data-hair="' + f.key + '"');
    });
    h += '</div></div>';
    if (A) {
      h += '<div class="forge-section"><h3>Hair Color</h3><div class="forge-sw-row">';
      A.HAIRCOL_ORDER.forEach(function (k) { h += swatch(look.hairColor === k, A.HAIRCOL[k].c, 'data-hcol="' + k + '" title="' + A.HAIRCOL[k].n + '"'); });
      h += '</div></div>';
    }
    // skin tone
    h += '<div class="forge-section"><h3>Skin Tone</h3><div class="forge-sw-row">';
    if (A) A.SKIN_ORDER.forEach(function (k) { h += swatch(look.tone === k, A.SKIN[k].c, 'data-tone="' + k + '" title="' + A.SKIN[k].n + '"'); });
    h += '</div></div>';
    /* ── THE EYES, WHICH ARE THE WHOLE REASON THE PERSON GOT DRAWN ────────────────
       ⚑ ONE ROW AND A TARGET, 2026-08-04. Nate: "Forget the outer eye — scrap it — change
       it to Both eyes as default and then an option to modify left-eye and right-eye."

       It was TWO color rows, "Eyes" and "Outer Ring", and between them they described one
       iris painted in two shades. That is a control you have to be taught: the two fills sit
       1.95 units apart on a 3.7-unit iris, so unless you already knew what you were looking
       for it read as one muddy color that would not change.

       Now there is ONE row of colors and a target above it — Both Eyes · Left · Right. The
       same two colors are still available; they land somewhere a person can point at.

       ⚠ THE TARGET IS UI STATE, NOT SAVED DATA (`eyeTarget`, module-level, like `zoom`).
       "I am currently editing the left one" is not part of your character, and putting it in
       the save file would mean re-rendering the panel to change it — which is how the shift
       and the jump got here in the first place.

       ⚠ PICKING "BOTH" RE-MATCHES IMMEDIATELY rather than just aiming the next click. A mode
       switch that changes nothing until you also pick a color is the one-button-behind
       feeling all over again, in a different costume. */
    if (A) {
      var eyeR = look.eyeR && look.eyeR !== 'same' ? look.eyeR : null;
      var target = eyeR ? eyeTarget : 'both';           // no second color = nothing to aim at
      var current = target === 'right' ? (eyeR || look.eye) : look.eye;
      h += '<div class="forge-section"><h3>Eyes</h3>' +
        '<div class="forge-seg" role="group" aria-label="Which eye to change">' +
        segBtn(target === 'both',  'Both Eyes', 'data-eyet="both"') +
        segBtn(target === 'left',  'Left',      'data-eyet="left"') +
        segBtn(target === 'right', 'Right',     'data-eyet="right"') +
        '</div><div class="forge-sw-row">';
      A.EYE_ORDER.forEach(function (k) { h += swatch(current === k, A.EYES[k].c, 'data-eye1="' + k + '" title="' + A.EYES[k].n + '"'); });
      h += '</div></div>';
    }
    // aura
    h += '<div class="forge-section"><h3>Aura <small>— your signature color</small></h3><div class="forge-sw-row">';
    AURA_ORDER.forEach(function (k) { h += swatch(look.aura === k, AURAS[k], 'data-aura="' + k + '"'); });
    h += '</div></div>';
    // headwear
    h += '<div class="forge-section"><h3>Headwear</h3><div class="forge-grid">';
    Object.keys(HATS).forEach(function (k) { h += cell(look.hat === k, HATS[k].em, HATS[k].n, 'data-hat="' + k + '"'); });
    h += '</div></div>';
    // emblem
    h += '<div class="forge-section"><h3>Emblem <small>— a badge that follows your name</small></h3><div class="forge-grid">';
    Object.keys(EMBLEMS).forEach(function (k) { h += cell(look.emblem === k, EMBLEMS[k].em, EMBLEMS[k].n, 'data-emblem="' + k + '"'); });
    h += '</div></div>';
    // text (2026-07-15 Nate: "take out the Call sign" — your codename IS your call sign,
    // set once when you claim it; the Forge no longer duplicates it. Title gets a dice.)
    h += '<div class="forge-section"><h3>Title &amp; Story <small>— change it any time</small></h3><div class="forge-fields">' +
      field('op-role', 'Role / Title', 'text', 40, look.role, 'e.g. Foreman of the Sand Mines') +
      '<button type="button" class="forge-title-rand" id="op-role-rand">🎲 Give me a title</button>' +
      field('op-bio',  'Bio', 'textarea', 120, look.bio, 'One line about your character…') +
      '</div></div>';
    return h;
  }

  // The drawn companion, at the bond stage the Den says it's at.
  function petArt(pl) {
    if (!window.PJCCPetArt) return '<span class="idn-glyph">' + petBaseEmoji() + '</span>';
    var stage = 1;
    try { stage = (window.PJCCPet && PJCCPet.stage) ? PJCCPet.stage() : 1; } catch (e) {}
    return PJCCPetArt.svg({ species: activePetKey(), stage: stage,
                            coat: pl.coat, eye: pl.eye, nose: pl.nose });
  }

  function companionPanel(pl) {
    /* 2026-07-28, Nate: "The companion den is too small and tucked away. Let's promote
       that a bit more on the Companion Customize screen."

       It was a sentence — "…feed, and train them in the Den" — with the actual door to
       the Den hidden in the toolbar at the very bottom of the panel, under the same
       styling as Randomize and Done. So the screen that makes you care about your
       companion pointed at the place you take care of them in its smallest available
       voice. It leads now: a real panel at the TOP with the pet's own face on it, what
       the Den is for in plain words, and one wide button.

       The unnamed case is handled here rather than nagging elsewhere: if the player has
       never named them (the defaults were removed the same day), the panel says so and
       the name field is right below. Asking once, in the room where you're already
       styling them, is an invitation; asking anywhere else would be a chore. */
    var h = '<div class="forge-den">' +
      '<div class="forge-den-face">' + petArt(pl) + '</div>' +
      '<div class="forge-den-body">' +
        '<b>The Companion Den</b>' +
        '<span>Feed them, walk them, play, and watch the Bond grow. Cosmetics unlock as it does.</span>' +
      '</div>' +
      '<button class="forge-den-go" id="forge-den-big">Open the Den →</button>' +
      '</div>';
    h += '<p class="forge-section" style="color:#b9a8e6;font-size:.8rem;margin-top:4px">' +
      (petUnnamed()
        ? 'Your companion doesn\'t have a name yet — that\'s yours to give, down below.'
        : 'Styling <b style="color:#f0e6ff">' + esc(petName()) + '</b>.') +
      '</p>';
    /* ── THREE COLORS, THREE PARTS (2026-07-28) ────────────────────────────────
       This is what the whole "draw the companion as parts" job was for. Until today
       there was ONE control here — Coat — and it was a filter smeared across an emoji,
       which is why Nate could see it painting the eyes and the nose along with
       everything else. Now each row sets a `fill` on its own shapes, so a black nose
       stays black while the coat goes jade, and "8 eye colors" is a real sentence
       instead of an impossible one. */
    var A = window.PJCCPetArt;
    if (A) {
      h += '<div class="forge-section"><h3>Coat <small>&mdash; the fur, and only the fur</small></h3><div class="forge-sw-row">';
      A.COAT_ORDER.forEach(function (k) { h += swatch(pl.coat === k, A.COATS[k].c, 'data-coat="' + k + '" title="' + A.COATS[k].n + '"'); });
      h += '</div></div>';

      h += '<div class="forge-section"><h3>Eyes</h3><div class="forge-sw-row">';
      A.EYE_ORDER.forEach(function (k) { h += swatch(pl.eye === k, A.EYES[k].c, 'data-eye="' + k + '" title="' + A.EYES[k].n + '"'); });
      h += '</div></div>';

      h += '<div class="forge-section"><h3>Nose</h3><div class="forge-sw-row">';
      A.NOSE_ORDER.forEach(function (k) { h += swatch(pl.nose === k, A.NOSES[k].c, 'data-nose="' + k + '" title="' + A.NOSES[k].n + '"'); });
      h += '</div></div>';
    }
    // aura
    h += '<div class="forge-section"><h3>Aura</h3><div class="forge-sw-row">';
    h += swatch(pl.aura === 'none', '#888', 'data-paura="none"', true);
    AURA_ORDER.forEach(function (k) { h += swatch(pl.aura === k, AURAS[k], 'data-paura="' + k + '"'); });
    h += '</div></div>';
    // name + bio
    h += '<div class="forge-section"><h3>Name & Story</h3><div class="forge-fields">' +
      // EMPTY while they're unnamed, not pre-filled with the fallback. petName() returns
      // the stage word ('Pup') when there's no name, and putting that in as a VALUE would
      // say "your companion is called Pup" one line under "doesn't have a name yet" — and
      // would silently become their name the moment anything read the field back.
      field('pet-name', 'Companion Name', 'text', 16, petUnnamed() ? '' : petName(), 'Name your companion') +
      field('pet-bio',  'Companion bio', 'textarea', 120, pl.bio, 'A line about your companion…') +
      '</div></div>';
    return h;
  }

  function field(id, label, type, max, val, ph) {
    var len = (val || '').length;
    var control = type === 'textarea'
      ? '<textarea id="' + id + '" maxlength="' + max + '" rows="2" placeholder="' + esc(ph) + '">' + esc(val) + '</textarea>'
      : '<input id="' + id + '" type="text" maxlength="' + max + '" value="' + esc(val) + '" placeholder="' + esc(ph) + '">';
    return '<div class="forge-field"><label>' + esc(label) + ' <span class="fld-count" id="' + id + '-c">' + len + '/' + max + '</span></label>' + control + '</div>';
  }

  function wireForge() {
    var q = function (s) { return ov.querySelector(s); };
    var x = q('#forge-x'); if (x) x.onclick = close;
    /* ⚠ A FULL renderForge(), NOT a repaint. The zoom changes the STAGE's own class and the
       label on its own button, and `repaintOp()` deliberately touches neither — it only
       repaints fills and moves the `on` ring. Re-rendering here is correct and costs
       nothing: it is one deliberate press, not a pick. `true` keeps the scroll position, so
       zooming while you are down at the Emblem row does not throw you back to the top. */
    var zb = q('#forge-zoom'); if (zb) zb.onclick = function () { zoom = !zoom; renderForge(true); };
    var done = q('#forge-done'); if (done) done.onclick = function () { toast('Identity saved'); close(); };
    var rand = q('#forge-rand'); if (rand) rand.onclick = randomize;
    var toDen = function () { close(); if (window.PJCCPet && PJCCPet.openDen) PJCCPet.openDen(); };
    var den = q('#forge-den'); if (den) den.onclick = toDen;
    var denBig = q('#forge-den-big'); if (denBig) denBig.onclick = toDen;   // the promoted panel
    Array.prototype.forEach.call(ov.querySelectorAll('[data-tab]'), function (b) { b.onclick = function () { tab = b.getAttribute('data-tab'); renderForge(); }; });
    /* Every one of these is a repaint, never a rebuild — see the block above patchOp().
       Picking your hair also adopts that face's expression, which is what makes the 12
       cells read as twelve people rather than one head in twelve wigs; set the brow and
       mouth explicitly rather than clearing them, or identity() would keep re-deriving
       them and a later hair change could silently overwrite a choice. */
    Array.prototype.forEach.call(ov.querySelectorAll('[data-hair]'), function (c) {
      c.onclick = function () {
        var k = c.getAttribute('data-hair'), f = FACE_MAP[k];
        patchOp({ hair: k, brow: f.brow, mouth: f.mouth });
      };
    });
    Array.prototype.forEach.call(ov.querySelectorAll('[data-tone]'), function (c) { c.onclick = function () { patchOp({ tone: c.getAttribute('data-tone') }); }; });
    Array.prototype.forEach.call(ov.querySelectorAll('[data-hcol]'), function (c) { c.onclick = function () { patchOp({ hairColor: c.getAttribute('data-hcol') }); }; });
    /* ── THE EYES: one color row, aimed by the segmented control above it ──────────
       Both  — set the left AND drop the override, so the pair matches again.
       Left  — set the left. If the right was following (`same`), PIN it to what it is
               showing first, or "change the left one" would silently change both and the
               control would look broken in the most confusing possible way.
       Right — set the override only. */
    Array.prototype.forEach.call(ov.querySelectorAll('[data-eye1]'), function (c) {
      c.onclick = function () {
        var k = c.getAttribute('data-eye1'), look = identity();
        var two = look.eyeR && look.eyeR !== 'same';
        var t = two ? eyeTarget : 'both';
        if (t === 'right') patchOp({ eyeR: k }, true);
        else if (t === 'left') patchOp({ eye: k, eyeR: two ? look.eyeR : look.eye }, true);
        else patchOp({ eye: k, eyeR: 'same' }, true);
      };
    });
    /* ⚠ HEAVY (a full re-render), and only here. The segmented control's own labels and the
       `on` ring under the color row both change, and `repaintOp()` deliberately touches
       neither — it moves rings and repaints fills, nothing structural. This is one deliberate
       press, not a pick, and `true` keeps the scroll exactly where it is. */
    Array.prototype.forEach.call(ov.querySelectorAll('[data-eyet]'), function (c) {
      c.onclick = function () {
        var t = c.getAttribute('data-eyet');
        eyeTarget = t;
        var look = identity();
        // "Both" is an ACTION, not just an aim — it re-matches the pair right now.
        if (t === 'both') patchOp({ eyeR: 'same' }, true);
        // aiming at one eye when they currently match has to CREATE the second one, or
        // there is nothing for the next color click to be different from
        else if (!look.eyeR || look.eyeR === 'same') patchOp({ eyeR: look.eye }, true);
        else renderForge(true);
      };
    });
    Array.prototype.forEach.call(ov.querySelectorAll('[data-aura]'), function (c) { c.onclick = function () { patchOp({ aura: c.getAttribute('data-aura') }); }; });
    Array.prototype.forEach.call(ov.querySelectorAll('[data-hat]'), function (c) { c.onclick = function () { patchOp({ hat: c.getAttribute('data-hat') }); }; });
    Array.prototype.forEach.call(ov.querySelectorAll('[data-emblem]'), function (c) { c.onclick = function () { patchOp({ emblem: c.getAttribute('data-emblem') }); }; });
    Array.prototype.forEach.call(ov.querySelectorAll('[data-coat]'), function (c) { c.onclick = function () { patchPet({ coat: c.getAttribute('data-coat') }); }; });
    Array.prototype.forEach.call(ov.querySelectorAll('[data-eye]'),  function (c) { c.onclick = function () { patchPet({ eye:  c.getAttribute('data-eye')  }); }; });
    Array.prototype.forEach.call(ov.querySelectorAll('[data-nose]'), function (c) { c.onclick = function () { patchPet({ nose: c.getAttribute('data-nose') }); }; });
    Array.prototype.forEach.call(ov.querySelectorAll('[data-paura]'), function (c) { c.onclick = function () { patchPet({ aura: c.getAttribute('data-paura') }); }; });
    // text fields — live, debounced persist, no full re-render (keeps focus)
    textField('op-role', 40, function (v) { liveOp({ role: v }); });
    textField('op-bio', 120, function (v) { liveOp({ bio: v }); });
    // 🎲 give me a title — fills the Role field from the preset list, live.
    var roleRand = q('#op-role-rand');
    if (roleRand) roleRand.onclick = function () {
      var t = TITLES[Math.floor(Math.random() * TITLES.length)];
      var inp = q('#op-role'); if (inp) inp.value = t;
      var c = q('#op-role-c'); if (c) c.textContent = t.length + '/40';
      liveOp({ role: t });
    };
    textField('pet-name', 16, function (v) { setPetName(v); var n = ov.querySelector('.fp-name'); if (n) n.textContent = v || petName(); emit(); });
    textField('pet-bio', 120, function (v) { livePet({ bio: v }); });
  }
  function textField(id, max, fn) {
    var el = ov.querySelector('#' + id); if (!el) return;
    var c = ov.querySelector('#' + id + '-c');
    el.oninput = function () { if (c) c.textContent = el.value.length + '/' + max; fn(el.value); };
  }
  // live text edits: persist + sync + update preview text, WITHOUT re-rendering
  // (so the field keeps focus while typing).
  function liveOp(p) {
    var s = loadLocal(); Object.assign(s.op, p); saveLocal(s); scheduleSync();
    if (p.name !== undefined) { var n = ov.querySelector('.fp-name'); if (n) n.textContent = p.name || accountCodename() || 'Newcomer'; }
    if (p.role !== undefined) { var r = ov.querySelector('.fp-role'); if (r) r.textContent = p.role || 'Citizen of Checker Town'; }
    scheduleEmit();
  }
  function livePet(p) { var s = loadLocal(); Object.assign(s.pet, p); saveLocal(s); scheduleEmit(); }
  var emitT = null;
  function scheduleEmit() { clearTimeout(emitT); emitT = setTimeout(emit, 400); }

  function randomize() {
    var pick = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };
    if (tab === 'operative') {
      var A = art(), f = pick(FACES);
      var p = { hair: f.key, brow: f.brow, mouth: f.mouth, aura: pick(AURA_ORDER),
                hat: pick(Object.keys(HATS)), emblem: pick(Object.keys(EMBLEMS)) };
      if (A) {
        p.tone = pick(A.SKIN_ORDER);
        p.hairColor = pick(A.HAIRCOL_ORDER);
        p.eye = pick(A.EYE_ORDER);
        /* mismatched eyes about one roll in six — often enough to be discovered by surprise,
           rare enough that it still reads as unusual when it happens. Lower than the old
           two-tone iris's 1-in-4 on purpose: this version of the feature is unmistakable at
           a glance, so the same frequency would stop reading as a surprise and start reading
           as the house style. */
        p.eyeR = Math.random() < 0.17 ? pick(A.EYE_ORDER) : 'same';
      }
      // ⚠ HEAVY on purpose: Surprise me changes the hair, so every cell in the grid needs
      // its `on` state and its picture redrawn — that IS the whole panel.
      patchOp(p, true);
    } else {
      var A2 = window.PJCCPetArt;
      patchPet(A2
        ? { coat: pick(A2.COAT_ORDER), eye: pick(A2.EYE_ORDER), nose: pick(A2.NOSE_ORDER), aura: pick(['none'].concat(AURA_ORDER)) }
        : { aura: pick(['none'].concat(AURA_ORDER)) });
    }
  }

  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && ov && !ov.classList.contains('hidden')) close(); });

  /* The account's look reaches this device HERE and nowhere else — once when the profile
     resolves, and again on any auth change (signing in on a shared machine has to bring the
     right face with it). Never inside a click: that was the bug. Both entry points are
     guarded because the Forge renders on pages where pjcc-profile.js isn't loaded. */
  try {
    if (window.PJCC && PJCC.onChange) PJCC.onChange(function () { adoptAccountLook(); refreshMounts(); });
    if (window.PJCC && PJCC.ready && PJCC.ready.then) PJCC.ready.then(function () { adoptAccountLook(); refreshMounts(); });
  } catch (e) {}

  window.PJCCForge = {
    identity: identity, petLook: petLook, renderAvatar: renderAvatar, renderCard: renderCard,
    setAccountBlock: setAccountBlock,
    open: open, close: close, onChange: function (fn) { listeners.push(fn); },
    // exported for the tests: the cross-device seed is a named, callable step now rather
    // than a merge hidden inside identity()
    adoptAccountLook: adoptAccountLook,
    // FACES replaced BASES on 2026-08-03 (the 32 emoji became one drawn person).
    // Nothing outside this file read BASES; `faceSvg` is exported for the tests.
    FACES: FACES, BASE_MIGRATE: BASE_MIGRATE, faceSvg: faceSvg, AURAS: AURAS
  };
})();
