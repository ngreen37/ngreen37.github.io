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

  // Coat tints for the companion: a CSS filter that recolours the pet glyph.
  var TINTS = {
    none:    { f:'',                                              sw:'#888', n:'Natural' },
    gold:    { f:'hue-rotate(-18deg) saturate(1.5) brightness(1.06)', sw:'#F5C518', n:'Gold' },
    rose:    { f:'hue-rotate(300deg) saturate(1.35)',            sw:'#ff8fd0', n:'Rose' },
    azure:   { f:'hue-rotate(180deg) saturate(1.25)',            sw:'#6bbfff', n:'Azure' },
    jade:    { f:'hue-rotate(95deg) saturate(1.3)',              sw:'#6bffb8', n:'Jade' },
    violet:  { f:'hue-rotate(250deg) saturate(1.4)',             sw:'#b07bff', n:'Violet' },
    crimson: { f:'hue-rotate(330deg) saturate(1.6)',             sw:'#ff6b6b', n:'Crimson' },
    ember:   { f:'hue-rotate(-32deg) saturate(1.7) brightness(1.12)', sw:'#ff9f43', n:'Ember' },
    shadow:  { f:'grayscale(1) brightness(.82)',                 sw:'#555',    n:'Shadow' },
    spirit:  { f:'grayscale(.5) brightness(1.3)',                sw:'#cdbcf2', n:'Spirit' }
  };

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
    op.displayName = (op.name && op.name.trim()) || accountCodename() || 'Operative';
    return op;
  }
  function petLook() { return loadLocal().pet; }

  // ---- companion bridge (shares name + active pet with the Den) -----------
  function petState() { try { return JSON.parse(localStorage.getItem('pjcc.pet.v2')) || {}; } catch (e) { return {}; } }
  function activePetKey() { var s = petState(); return s.pet || 'dog-1'; }
  function petDefs() { return (window.PJCCPet && PJCCPet.PETS) || {}; }
  function petBaseEmoji() { return (window.PJCCPet && PJCCPet.petEmoji) ? PJCCPet.petEmoji() : '🐕'; }
  function petName() {
    var s = petState(), k = activePetKey(), d = petDefs();
    return (s.names && s.names[k]) || (d[k] ? d[k].name : 'Companion');
  }
  function setPetName(nm) {
    var s = petState(), k = activePetKey();
    if (!s.names) s.names = {};
    nm = String(nm || '').trim().slice(0, 16);
    if (nm) s.names[k] = nm; else delete s.names[k];
    try { localStorage.setItem('pjcc.pet.v2', JSON.stringify(s)); } catch (e) {}
  }
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
    var tint = TINTS[pl.tint] || TINTS.none;
    el.innerHTML =
      '<div class="idn-card">' +
        '<div class="idn-av" id="' + uid(el) + '"></div>' +
        '<div class="idn-meta">' +
          '<div class="idn-name">' + esc(look.displayName) + '</div>' +
          (look.bio ? '<div class="idn-bio">“' + esc(look.bio) + '”</div>' : '') +
          '<div class="idn-account" data-account></div>' +
          '<div class="idn-pet-chip"><span class="ipc-em" style="filter:' + tint.f + '">' + petBaseEmoji() + '</span> ' + esc(petName()) +
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
      var tint = TINTS[pl.tint] || TINTS.none;
      html += '<div class="idn-av spin" id="forge-prev" style="--aura:' + auraColor(pl.aura === 'none' ? 'violet' : pl.aura) + '">' +
        '<span class="idn-glyph" style="filter:' + tint.f + '">' + petBaseEmoji() + '</span></div>';
    }
    html += '</div>';
    if (tab === 'operative') {
      html += '<div class="fp-name">' + esc(look.displayName) + '</div>' +
              '<div class="fp-role">' + esc(look.role || 'Operative of Checker Town') + '</div>';
    } else {
      html += '<div class="fp-name">' + esc(petName()) + '</div>' +
              '<div class="fp-role">' + esc(petPersona()) + '</div>';
    }
    html += '</div>';   // stage

    // tabs
    html += '<div class="forge-tabs">' +
      '<button class="forge-tab ' + (tab === 'operative' ? 'on' : '') + '" data-tab="operative"><span class="ft-em">✦</span>Operative</button>' +
      '<button class="forge-tab ' + (tab === 'companion' ? 'on' : '') + '" data-tab="companion"><span class="ft-em">🐾</span>Companion</button>' +
      '</div>';

    html += '<div class="forge-body">';
    html += (tab === 'operative') ? operativePanel(look) : companionPanel(pl);

    // footer
    html += '<div class="forge-foot">' +
      '<button class="forge-save" id="forge-done">Done</button>' +
      '<button class="forge-rand" id="forge-rand">🎲 Surprise me</button>';
    if (tab === 'companion') html += '<button class="forge-den-link" id="forge-den">Open the Companion Den →</button>';
    else if (window.PJCC && PJCC.currentUser && PJCC.currentUser()) html += '<span class="forge-synced">✓ synced to your account</span>';
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
      field('op-bio',  'Bio', 'textarea', 120, look.bio, 'One line about your operative…') +
      '</div></div>';
    return h;
  }

  function companionPanel(pl) {
    var tint = TINTS[pl.tint] || TINTS.none;
    var h = '<p class="forge-section" style="color:#b9a8e6;font-size:.8rem;margin-top:4px">' +
      'Style your active companion — <b style="color:#f0e6ff">' + esc(petName()) + '</b>. ' +
      'Adopt new friends, feed, and train them in the Den.</p>';
    // coat tint
    h += '<div class="forge-section"><h3>Coat <small>— recolour your companion</small></h3><div class="forge-sw-row">';
    Object.keys(TINTS).forEach(function (k) { h += swatch(pl.tint === k, TINTS[k].sw, 'data-tint="' + k + '"', k === 'none'); });
    h += '</div></div>';
    // aura
    h += '<div class="forge-section"><h3>Aura</h3><div class="forge-sw-row">';
    h += swatch(pl.aura === 'none', '#888', 'data-paura="none"', true);
    AURA_ORDER.forEach(function (k) { h += swatch(pl.aura === k, AURAS[k], 'data-paura="' + k + '"'); });
    h += '</div></div>';
    // name + bio
    h += '<div class="forge-section"><h3>Name & story</h3><div class="forge-fields">' +
      field('pet-name', 'Companion name', 'text', 16, petName(), 'Name your companion') +
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
    var den = q('#forge-den'); if (den) den.onclick = function () { close(); if (window.PJCCPet && PJCCPet.openDen) PJCCPet.openDen(); };
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
    if (p.name !== undefined) { var n = ov.querySelector('.fp-name'); if (n) n.textContent = p.name || accountCodename() || 'Operative'; }
    if (p.role !== undefined) { var r = ov.querySelector('.fp-role'); if (r) r.textContent = p.role || 'Operative of Checker Town'; }
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
    BASES: BASES, AURAS: AURAS, TINTS: TINTS
  };
})();
