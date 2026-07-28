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

  // ---- catalogs ---------------------------------------------------------
  // Bases either carry a full `glyph`, or a `head`+`role` pair we join with a
  // zero-width joiner (🧑 + ‍ + 🚀 = 🧑‍🚀). `tone` flags whether a Fitzpatrick
  // skin-tone modifier combines cleanly (plain people: yes; VS16/role faces: no).
  var BASES = [
    { key:'recruit',  n:'Recruit',   glyph:'🧑', tone:true },
    { key:'agent',    n:'Agent',     glyph:'🤵', tone:true },
    { key:'sleuth',   n:'Sleuth',    glyph:'🕵️', tone:false },
    { key:'ninja',    n:'Ninja',     glyph:'🥷', tone:true },
    { key:'princess', n:'Princess',  glyph:'👸', tone:true },
    { key:'heir',     n:'Heir',      glyph:'🤴', tone:true },
    { key:'mage',     n:'Mage',      glyph:'🧙', tone:true },
    { key:'elf',      n:'Elf',       glyph:'🧝', tone:true },
    { key:'hero',     n:'Hero',      glyph:'🦸', tone:true },
    { key:'rogue',    n:'Rogue',     glyph:'🦹', tone:true },
    { key:'warden',   n:'Warden',    glyph:'👮', tone:true },
    { key:'guard',    n:'Guard',     glyph:'💂', tone:true },
    { key:'builder',  n:'Builder',   glyph:'👷', tone:true },
    { key:'seer',     n:'Seer',      glyph:'🧕', tone:true },
    { key:'sage',     n:'Sage',      glyph:'👳', tone:true },
    { key:'vampire',  n:'Vampire',   glyph:'🧛', tone:true },
    { key:'merfolk',  n:'Merfolk',   glyph:'🧜', tone:true },
    { key:'fairy',    n:'Fairy',     glyph:'🧚', tone:true },
    { key:'genie',    n:'Genie',     glyph:'🧞', tone:false },
    { key:'pilot',    n:'Pilot',     head:'🧑', role:'✈️', tone:true },
    { key:'astro',    n:'Astronaut', head:'🧑', role:'🚀', tone:true },
    { key:'scientist',n:'Scientist', head:'🧑', role:'🔬', tone:true },
    { key:'artist',   n:'Artist',    head:'🧑', role:'🎨', tone:true },
    { key:'teacher',  n:'Teacher',   head:'🧑', role:'🏫', tone:true },
    { key:'coder',    n:'Coder',     head:'🧑', role:'💻', tone:true },
    { key:'cook',     n:'Cook',      head:'🧑', role:'🍳', tone:true },
    { key:'farmer',   n:'Farmer',    head:'🧑', role:'🌾', tone:true },
    { key:'singer',   n:'Singer',    head:'🧑', role:'🎤', tone:true },
    { key:'robot',    n:'Robot',     glyph:'🤖', tone:false },
    { key:'alien',    n:'Visitor',   glyph:'👽', tone:false },
    { key:'fox',      n:'Fox',       glyph:'🦊', tone:false },
    { key:'ghost',    n:'Ghost',     glyph:'👻', tone:false }
  ];
  var BASE_MAP = {}; BASES.forEach(function (b) { BASE_MAP[b.key] = b; });
  var TONES = [ { key:'', n:'Default', sw:'#caa472' }, { key:'🏻', n:'I', sw:'#f7d9bf' },
    { key:'🏼', n:'II', sw:'#e9c19a' }, { key:'🏽', n:'III', sw:'#c79b6e' },
    { key:'🏾', n:'IV', sw:'#a06a43' }, { key:'🏿', n:'V', sw:'#5c3a23' } ];

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

  /* ── COAT TINTS — the coat, and ONLY the coat ─────────────────────────────────
     2026-07-28, Nate: "Make it so the 'Coat' of the dog doesn't just make the whole dog
     that color, you know? It should not include eyes… nose…"

     He was right, and the old way could not do anything else. Every tint was a plain CSS
     `filter` on the glyph — `hue-rotate(95deg) saturate(1.3)` and friends — and a filter
     has no idea what a nose is. It rotates every pixel. Pick Jade and the dog's TONGUE
     went olive; pick Shadow (`grayscale(1)`) and the entire animal, eyes and all, turned
     into one flat grey silhouette. That is the "whole dog becomes that color" he saw.

     THE FIX: an SVG filter that keys off SATURATION. The broad flat coat of an emoji
     animal is mid-saturation; the features that read as a face — the black nose, the
     black pupils, the white of the eye, the red tongue, the pink mouth — are either
     neutral (no colour to rotate) or so saturated they stand apart from the coat. So the
     filter builds a mask from how colourful each pixel is, tints THROUGH that mask, and
     lets the original show everywhere else.

     Verified from a render, not from theory (the "pick visual values from a render"
     rule): dog, cat, bird, turtle and the person glyphs, every tint, side by side at
     190px. Before: the tongue, the lips and the mouth all took the coat colour. After:
     the coat changes and the face stays a face. The slope/intercept on the mask ramp
     (14 / -0.35) were chosen off that render — steeper and the coat starts breaking up,
     shallower and the features get eaten.

     Graceful failure matters here: if a browser can't do the filter, the glyph renders
     UNTINTED rather than wrong, which is the harmless direction.

     STILL NOT POSSIBLE, and it's the honest reason separate eye/nose colour pickers are
     not here: a companion is a single EMOJI GLYPH. There is no eye layer and no nose
     layer to hand a colour to — only pixels. Choosing them separately needs the pet and
     the person DRAWN as parts (SVG or Blender). That's in FUTURE-IDEAS as an action item.
     ──────────────────────────────────────────────────────────────────────────── */
  var TINTS = {
    none:    { hue:0,   sat:1,    sw:'#888',    n:'Natural' },
    gold:    { hue:-18, sat:1.5,  sw:'#F5C518', n:'Gold' },
    rose:    { hue:300, sat:1.35, sw:'#ff8fd0', n:'Rose' },
    azure:   { hue:180, sat:1.25, sw:'#6bbfff', n:'Azure' },
    jade:    { hue:95,  sat:1.3,  sw:'#6bffb8', n:'Jade' },
    violet:  { hue:250, sat:1.4,  sw:'#b07bff', n:'Violet' },
    crimson: { hue:330, sat:1.6,  sw:'#ff6b6b', n:'Crimson' },
    ember:   { hue:-32, sat:1.7,  sw:'#ff9f43', n:'Ember' },
    shadow:  { grey:1,  lum:0.82, sw:'#555',    n:'Shadow' },
    spirit:  { grey:1,  lum:1.28, sw:'#cdbcf2', n:'Spirit' }
  };

  /* The <defs> are injected once, into <body>, the first time anything asks for a coat.
     They have to live in the DOM for `filter: url(#…)` to resolve, and they're shared by
     all three places a companion is drawn: the Den, the Dossier mood card, and the Forge
     preview. Injecting on demand keeps a page that never shows a pet free of them. */
  var defsIn = false;
  function ensureCoatDefs() {
    if (defsIn || !document.body) return;
    defsIn = true;
    var f = '';
    Object.keys(TINTS).forEach(function (k) {
      if (k === 'none') return;
      var t = TINTS[k];
      // 1 · the fully tinted version of everything
      var tinted = t.grey
        ? '<feColorMatrix type="saturate" values="0" in="SourceGraphic" result="t0"/>' +
          '<feComponentTransfer in="t0" result="tinted">' +
            '<feFuncR type="linear" slope="' + t.lum + '"/>' +
            '<feFuncG type="linear" slope="' + t.lum + '"/>' +
            '<feFuncB type="linear" slope="' + t.lum + '"/>' +
          '</feComponentTransfer>'
        : '<feColorMatrix type="hueRotate" values="' + t.hue + '" in="SourceGraphic" result="t0"/>' +
          '<feColorMatrix type="saturate" values="' + t.sat + '" in="t0" result="tinted"/>';
      // 2 · how colourful is each pixel? (source vs its own desaturated self)
      // 3 · that difference, pushed hard, becomes the alpha of a mask
      // 4 · paint the tint back through the mask, over the untouched original
      f += '<filter id="pjcc-coat-' + k + '" color-interpolation-filters="sRGB">' +
        tinted +
        '<feColorMatrix type="saturate" values="0" in="SourceGraphic" result="grey"/>' +
        '<feBlend mode="difference" in="SourceGraphic" in2="grey" result="chroma"/>' +
        '<feColorMatrix in="chroma" type="matrix" result="chromaA" values="' +
          '0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  1 1 1 0 0"/>' +
        '<feComponentTransfer in="chromaA" result="mask">' +
          '<feFuncA type="linear" slope="14" intercept="-0.35"/>' +
        '</feComponentTransfer>' +
        '<feComposite operator="in" in="tinted" in2="mask" result="coat"/>' +
        '<feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="coat"/></feMerge>' +
      '</filter>';
    });
    var host = document.createElement('div');
    host.setAttribute('aria-hidden', 'true');
    host.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    host.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0"><defs>' + f + '</defs></svg>';
    document.body.appendChild(host);
  }
  // the CSS value each tint resolves to. '' for Natural — no filter, no layer, no cost.
  function coatFilter(key) {
    if (!key || key === 'none' || !TINTS[key]) return '';
    ensureCoatDefs();
    return 'url(#pjcc-coat-' + key + ')';
  }

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]; }); }

  function baseGlyph(key, tone) {
    var b = BASE_MAP[key] || BASE_MAP.recruit;
    var t = (b.tone && tone) ? tone : '';
    if (b.role) return b.head + t + '‍' + b.role;
    return b.glyph + t;
  }
  function auraColor(key) { return AURAS[key] || AURAS.gold; }

  // ---- storage ------------------------------------------------------------
  var KEY = 'pjcc.identity.v1';
  function defaults() {
    return {
      op:  { base:'recruit', tone:'', aura:'gold', hat:'none', emblem:'none', name:'', role:'', bio:'' },
      pet: { tint:'none', aura:'none', bio:'' }
    };
  }
  function loadLocal() {
    var s = null; try { s = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
    var d = defaults();
    if (!s) return d;
    var op = Object.assign(d.op, s.op || {});
    var pet = Object.assign(d.pet, s.pet || {});
    if (!BASE_MAP[op.base]) op.base = 'recruit';
    if (!AURAS[op.aura]) op.aura = 'gold';
    if (!HATS[op.hat]) op.hat = 'none';
    if (!EMBLEMS[op.emblem]) op.emblem = 'none';
    if (!TINTS[pet.tint]) pet.tint = 'none';
    return { op: op, pet: pet };
  }
  function saveLocal(state) {
    state.op.glyph = baseGlyph(state.op.base, state.op.tone);   // cache resolved glyph for the nav
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  // Account profile look (cross-device). Overlays local when present.
  function accountLook() {
    try { var p = window.PJCC && PJCC.getProfile && PJCC.getProfile(); return (p && p.companion && p.companion.look) || null; } catch (e) { return null; }
  }
  function accountCodename() {
    try { var p = window.PJCC && PJCC.getProfile && PJCC.getProfile(); return (p && p.codename) || ''; } catch (e) { return ''; }
  }

  // The resolved operative look: defaults <- local <- account.
  function identity() {
    var s = loadLocal(), op = s.op, al = accountLook();
    if (al) op = Object.assign({}, op, al);
    if (!BASE_MAP[op.base]) op.base = 'recruit';
    if (!AURAS[op.aura]) op.aura = 'gold';
    op.glyph = baseGlyph(op.base, op.tone);
    op.displayName = (op.name && op.name.trim()) || accountCodename() || 'Newcomer';
    return op;
  }
  function petLook() { return loadLocal().pet; }

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
          var op = loadLocal().op; op.glyph = baseGlyph(op.base, op.tone);
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
      '<span class="idn-glyph">' + (look.glyph || baseGlyph(look.base, look.tone)) + '</span>' +
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
    var coat = coatFilter(pl.tint);
    el.innerHTML =
      '<div class="idn-card">' +
        '<div class="idn-av" id="' + uid(el) + '"></div>' +
        '<div class="idn-meta">' +
          '<div class="idn-name">' + esc(look.displayName) + '</div>' +
          (look.bio ? '<div class="idn-bio">“' + esc(look.bio) + '”</div>' : '') +
          '<div class="idn-account" data-account></div>' +
          '<div class="idn-pet-chip"><span class="ipc-em" style="filter:' + coat + '">' + petBaseEmoji() + '</span> ' + esc(petName()) +
            '<button class="idn-edit-btn ghost" data-open="companion" style="padding:2px 9px;font-size:.7rem;margin-left:4px">tweak</button></div>' +
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
  var ov = null, tab = 'operative';
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

  // commit a patch to the operative or pet look, persist, re-render live
  function patchOp(p)  { var s = loadLocal(); Object.assign(s.op, p);  saveLocal(s); scheduleSync(); renderForge(true); emit(); }
  function patchPet(p) { var s = loadLocal(); Object.assign(s.pet, p); saveLocal(s); renderForge(true); emit(); }

  function cell(on, em, name, attr) {
    return '<div class="forge-cell' + (on ? ' on' : '') + '" ' + attr + '>' +
      '<span class="fc-em">' + (em || '🚫') + '</span><span class="fc-n">' + esc(name) + '</span></div>';
  }
  function swatch(on, color, attr, isNone) {
    return '<div class="forge-sw' + (on ? ' on' : '') + (isNone ? ' none' : '') + '" style="background:' + (isNone ? '' : color) + ';--sw:' + color + '" ' + attr + '>' + (isNone ? '∅' : '') + '</div>';
  }

  function renderForge(keepScroll) {
    if (!ov) return;
    var sc = keepScroll && ov.querySelector('.forge-body') ? ov.querySelector('.forge-body').scrollTop : 0;
    var look = identity(), pl = petLook();
    var html = '<div class="forge">';

    // stage / live preview
    html += '<div class="forge-stage ' + (tab === 'companion' ? 'companion' : '') + '">' +
      '<div class="forge-head"><span class="forge-eyebrow">The Identity Forge</span>' +
        '<button class="forge-close" id="forge-x" title="Done">✕</button></div>' +
      '<div class="forge-preview-wrap">';
    if (tab === 'operative') {
      html += '<div class="idn-av spin" id="forge-prev"></div>';
    } else {
      var coat = coatFilter(pl.tint);
      html += '<div class="idn-av spin" id="forge-prev" style="--aura:' + auraColor(pl.aura === 'none' ? 'violet' : pl.aura) + '">' +
        '<span class="idn-glyph" style="filter:' + coat + '">' + petBaseEmoji() + '</span></div>';
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
    var h = '';
    // base
    h += '<div class="forge-section"><h3>Base <small>— who you are</small></h3><div class="forge-grid">';
    BASES.forEach(function (b) { h += cell(look.base === b.key, baseGlyph(b.key, look.tone), b.n, 'data-base="' + b.key + '"'); });
    h += '</div></div>';
    // skin tone
    h += '<div class="forge-section"><h3>Skin tone <small>— applies where it fits</small></h3><div class="forge-sw-row">';
    TONES.forEach(function (t) { h += swatch(look.tone === t.key, t.sw, 'data-tone="' + t.key + '"'); });
    h += '</div></div>';
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
    h += '<div class="forge-section"><h3>Title &amp; story <small>— change it any time</small></h3><div class="forge-fields">' +
      field('op-role', 'Role / title', 'text', 40, look.role, 'e.g. Foreman of the Sand Mines') +
      '<button type="button" class="forge-title-rand" id="op-role-rand">🎲 Give me a title</button>' +
      field('op-bio',  'Bio', 'textarea', 120, look.bio, 'One line about your character…') +
      '</div></div>';
    return h;
  }

  function companionPanel(pl) {
    var coat = coatFilter(pl.tint);
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
      '<div class="forge-den-face"><span style="filter:' + coat + '">' + petBaseEmoji() + '</span></div>' +
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
    // coat tint
    h += '<div class="forge-section"><h3>Coat <small>— recolours the coat, not the face</small></h3><div class="forge-sw-row">';
    Object.keys(TINTS).forEach(function (k) { h += swatch(pl.tint === k, TINTS[k].sw, 'data-tint="' + k + '"', k === 'none'); });
    h += '</div></div>';
    // aura
    h += '<div class="forge-section"><h3>Aura</h3><div class="forge-sw-row">';
    h += swatch(pl.aura === 'none', '#888', 'data-paura="none"', true);
    AURA_ORDER.forEach(function (k) { h += swatch(pl.aura === k, AURAS[k], 'data-paura="' + k + '"'); });
    h += '</div></div>';
    // name + bio
    h += '<div class="forge-section"><h3>Name & story</h3><div class="forge-fields">' +
      // EMPTY while they're unnamed, not pre-filled with the fallback. petName() returns
      // the stage word ('Pup') when there's no name, and putting that in as a VALUE would
      // say "your companion is called Pup" one line under "doesn't have a name yet" — and
      // would silently become their name the moment anything read the field back.
      field('pet-name', 'Companion name', 'text', 16, petUnnamed() ? '' : petName(), 'Name your companion') +
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
    var done = q('#forge-done'); if (done) done.onclick = function () { toast('Identity saved'); close(); };
    var rand = q('#forge-rand'); if (rand) rand.onclick = randomize;
    var toDen = function () { close(); if (window.PJCCPet && PJCCPet.openDen) PJCCPet.openDen(); };
    var den = q('#forge-den'); if (den) den.onclick = toDen;
    var denBig = q('#forge-den-big'); if (denBig) denBig.onclick = toDen;   // the promoted panel
    Array.prototype.forEach.call(ov.querySelectorAll('[data-tab]'), function (b) { b.onclick = function () { tab = b.getAttribute('data-tab'); renderForge(); }; });
    Array.prototype.forEach.call(ov.querySelectorAll('[data-base]'), function (c) { c.onclick = function () { patchOp({ base: c.getAttribute('data-base') }); }; });
    Array.prototype.forEach.call(ov.querySelectorAll('[data-tone]'), function (c) { c.onclick = function () { patchOp({ tone: c.getAttribute('data-tone') }); }; });
    Array.prototype.forEach.call(ov.querySelectorAll('[data-aura]'), function (c) { c.onclick = function () { patchOp({ aura: c.getAttribute('data-aura') }); }; });
    Array.prototype.forEach.call(ov.querySelectorAll('[data-hat]'), function (c) { c.onclick = function () { patchOp({ hat: c.getAttribute('data-hat') }); }; });
    Array.prototype.forEach.call(ov.querySelectorAll('[data-emblem]'), function (c) { c.onclick = function () { patchOp({ emblem: c.getAttribute('data-emblem') }); }; });
    Array.prototype.forEach.call(ov.querySelectorAll('[data-tint]'), function (c) { c.onclick = function () { patchPet({ tint: c.getAttribute('data-tint') }); }; });
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
      var b = pick(BASES);
      patchOp({ base: b.key, tone: b.tone ? pick(TONES).key : '', aura: pick(AURA_ORDER),
                hat: pick(Object.keys(HATS)), emblem: pick(Object.keys(EMBLEMS)) });
    } else {
      patchPet({ tint: pick(Object.keys(TINTS)), aura: pick(['none'].concat(AURA_ORDER)) });
    }
  }

  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && ov && !ov.classList.contains('hidden')) close(); });

  // re-render the Dossier card when the account loads / changes
  try { if (window.PJCC && PJCC.onChange) PJCC.onChange(refreshMounts); } catch (e) {}

  window.PJCCForge = {
    identity: identity, petLook: petLook, renderAvatar: renderAvatar, renderCard: renderCard,
    setAccountBlock: setAccountBlock,
    open: open, close: close, onChange: function (fn) { listeners.push(fn); },
    BASES: BASES, AURAS: AURAS, TINTS: TINTS, coatFilter: coatFilter
  };
})();
