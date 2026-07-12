/* =============================================================================
 * PJCC Companion v3 — ONE evolving companion (2026-07-12 rebuild, Nate).
 * -----------------------------------------------------------------------------
 * Gone (declutter): the skill tree, species ultimates, the treats currency, the
 * 12-pet adoption grind, the human-avatar picker (that's the Identity Forge's
 * job), and the bio block. In their place:
 *   • ONE companion you bond with and grow — defaults to Princess's own (#9/#10)
 *   • a free pick of 4 species (dog/cat/bird/turtle) — a choice, not a collection (#3)
 *   • a single BOND track that gates evolution + cosmetics (#1)
 *   • cosmetics as the ONLY collectible axis (#2/#19), unlocked by Bond
 *   • three care actions: Pet · Feed · Play — no currency (#6/#7)
 *   • it REACTS to your real play (#11) and NAPS at night (#15)
 *   • a max-Bond "dig" that unearths an ARG token (#17)
 *   • a share card (#18) and a CALM mode — silent, never interrupts (#20)
 * The companion only makes NOISES, never talks (earlier ruling).
 *
 * Public API preserved:  PJCCPet.renderCard(el, stats) · openDen(stats) ·
 *   closeDen() · petEmoji() · mood()
 * ========================================================================== */
(function () {
  'use strict';

  // ---- the four friends (one per species; dog is Princess's canon default) --
  var PETS = {
    dog:    { name: 'Biscuit', stages: ['Pup', 'Hound', 'Legend Hound'],   ems: ['🐶', '🐕', '🦮'], persona: "Princess's own — loyal, bright, and always at your heel.", trait: 'Loyal',  snd: { type: 'square',   f: 240,  f2: 170 }, canon: true },
    cat:    { name: 'Mochi',   stages: ['Kitten', 'Cat', 'Grand Feline'],   ems: ['🐱', '🐈', '😼'], persona: 'A clever, unbothered little strategist.',                trait: 'Clever', snd: { type: 'sine',     f: 640,  f2: 840 } },
    bird:   { name: 'Pip',     stages: ['Chick', 'Flyer', 'Sky Marshal'],   ems: ['🐤', '🐦', '🦉'], persona: 'A cheery riser who remembers every move you make.',      trait: 'Bright', snd: { type: 'triangle', f: 1200, f2: 1750 } },
    turtle: { name: 'Sheldon', stages: ['Hatchling', 'Shellback', 'Ancient'], ems: ['🥚', '🐢', '🐢'], persona: 'Slow, steady, and unshakeably calm.',                  trait: 'Steady', snd: { type: 'sine',     f: 150,  f2: 110 } }
  };
  var PET_ORDER = ['dog', 'cat', 'bird', 'turtle'];

  // cosmetics — the ONLY collectible now, unlocked as Bond deepens (#2/#19)
  var COSMETICS = {
    none:  { em: '',    name: 'None',    need: 0 },
    bow:   { em: '🎀', name: 'Bow',     need: 0 },
    scarf: { em: '🧣', name: 'Scarf',   need: 20 },
    hat:   { em: '🎩', name: 'Top Hat', need: 40 },
    shades:{ em: '🕶️', name: 'Shades',  need: 60 },
    crown: { em: '👑', name: 'Crown',   need: 90 }
  };
  // seasonal cosmetics (#8) — exactly one is "in season" at a time; free to wear while
  // it's around, then it rotates out (a cosmetic you had to be here to catch).
  var SEASONAL = [
    { key: 's-winter', em: '❄️', name: 'Snow Flurry',  months: [11, 0, 1] },
    { key: 's-spring', em: '🌸', name: 'Spring Bloom', months: [2, 3, 4] },
    { key: 's-summer', em: '👒', name: 'Sun Hat',      months: [5, 6, 7] },
    { key: 's-autumn', em: '🍁', name: 'Autumn Leaf',  months: [8, 9, 10] }
  ];
  function currentSeasonal() { var m = new Date().getMonth(); return SEASONAL.filter(function (x) { return x.months.indexOf(m) !== -1; })[0] || null; }
  function cosDef(key) { return COSMETICS[key] || SEASONAL.filter(function (x) { return x.key === key; })[0] || null; }
  function cosEmOf(key) { var d = cosDef(key); return d ? d.em : ''; }

  // ---- state (localStorage, lazy time-decay) --------------------------------
  var KEY = 'pjcc.pet.v3', SND_KEY = 'pjcc.pet.sound';
  var HUNGER_RATE = 3.2, ENERGY_REGEN = 7, AFFECTION_DECAY = 0.7;
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function blank() {
    return {
      pet: 'dog', names: {}, cosmetics: {}, ownedCos: ['none', 'bow'],
      hunger: 78, energy: 82, affection: 30, bond: 6, calm: false, dug: false,
      seenBest: {}, bestInit: false,
      tick: Date.now(), lastAny: Date.now(), lastPet: 0, lastFeed: 0, lastPlay: 0, createdAt: Date.now()
    };
  }
  function migrate(s) {
    // carry a v2 pet choice forward if the player had one (best-effort)
    try {
      var old = JSON.parse(localStorage.getItem('pjcc.pet.v2'));
      if (old && old.pet) { var sp = String(old.pet).split('-')[0]; if (PETS[sp]) s.pet = sp; }
    } catch (e) {}
    return s;
  }
  function load() {
    var s = null;
    try { s = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
    if (!s) s = migrate(blank());
    var d = blank(); for (var k in d) if (s[k] === undefined) s[k] = d[k];
    if (!PETS[s.pet]) s.pet = 'dog';
    // mirror the account's chosen pet if present
    try { if (window.PJCC && PJCC.getProfile) { var pr = PJCC.getProfile(); if (pr && pr.companion && pr.companion.pet) { var sp = String(pr.companion.pet).split('-')[0]; if (PETS[sp]) s.pet = sp; } } } catch (e) {}
    var now = Date.now(), hrs = Math.max(0, (now - (s.tick || now)) / 3600000);
    if (hrs > 0.0004) {
      s.hunger = clamp(s.hunger - hrs * HUNGER_RATE, 0, 100);
      s.energy = clamp(s.energy + hrs * ENERGY_REGEN, 0, 100);   // energy recovers on its own — no Rest button
      s.affection = clamp(s.affection - hrs * AFFECTION_DECAY, 0, 100);
      s.tick = now;
    }
    return s;
  }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }

  // ---- derived --------------------------------------------------------------
  function bondInfo(s) {
    var b = clamp(s.bond, 0, 100);
    var stage = b < 34 ? 0 : b < 70 ? 1 : 2;   // baby / grown / elder
    var level = Math.min(10, 1 + Math.floor(b / 10));
    return { bond: b, stage: stage, level: level };
  }
  function petEmojiFor(s, bi) { var p = PETS[s.pet]; return p.ems[(bi || bondInfo(s)).stage]; }
  function displayName(s) { return s.names[s.pet] || PETS[s.pet].name; }
  function localHour() { return new Date().getHours(); }
  function isNight() { var h = localHour(); return h < 7 || h >= 20; }

  var lastStats = [];
  function playedRecently() {
    if (!lastStats || !lastStats.length) return false;
    var newest = lastStats.slice().sort(function (a, b) { return Date.parse(b.updated_at || 0) - Date.parse(a.updated_at || 0); })[0];
    return newest && (Date.now() - Date.parse(newest.updated_at || 0)) < 180000;   // played in the last 3 min
  }

  // #7 — the companion celebrates a NEW PERSONAL BEST. We remember each game's best
  // between dossier visits; if one climbed, the pet is "so proud". The first sighting
  // just sets a baseline (so it doesn't fire on your very first visit).
  var cheerBest = false;
  function checkNewBest(stats) {
    if (!stats || !stats.length) return false;
    var s = load(), improved = false;
    if (!s.bestInit) {
      stats.forEach(function (st) { s.seenBest[st.game] = st.best_score || 0; });
      s.bestInit = true; save(s); return false;
    }
    stats.forEach(function (st) {
      var prev = s.seenBest[st.game] || 0;
      if ((st.best_score || 0) > prev) { s.seenBest[st.game] = st.best_score; improved = true; }
    });
    if (improved) { s.lastAny = Date.now(); save(s); }
    return improved;
  }

  function mood(s) {
    s = s || load();
    if (cheerBest) return { emoji: '🏆', state: 'So proud!', line: 'A new best — I knew you had it in you!' };
    if (isNight() && (Date.now() - s.lastAny > 90000)) return { emoji: '😴', state: 'Napping', line: 'Curled up for the night.' };
    if (s.hunger < 25) return { emoji: '🍽️', state: 'Hungry', line: 'Tummy rumbling.' };
    if (s.affection < 20) return { emoji: '🥺', state: 'Lonely', line: 'Missed you.' };
    if (playedRecently()) return { emoji: '🤩', state: 'Cheering', line: 'Saw your run — amazing!' };
    var score = s.affection * 0.5 + s.hunger * 0.3 + s.energy * 0.2;
    if (score >= 72) return { emoji: '😄', state: 'Happy', line: 'Bright-eyed and by your side.' };
    if (score >= 45) return { emoji: '🙂', state: 'Content', line: 'Doing just fine.' };
    return { emoji: '😟', state: 'Restless', line: 'Spend a little time together?' };
  }

  // The companion makes NOISES, never talks — shaded by mood. Turtles mostly act.
  var NOISES = {
    dog:    { tired: ['*yawn*… wuff.', 'mrrf…'], hungry: ['Whine… wuff?', 'Arrooo?'], happy: ['Woof woof!', 'Arf! Arf!', 'Bork!'], base: ['Woof.', 'Wuff.', 'Boof.'] },
    cat:    { tired: ['…mrr.', '*slow stretch* mrow.'], hungry: ['Meow? Meow!', 'Mrrp?'], happy: ['Mrrow!', 'Purrrr~', 'Mew! Mew!'], base: ['Purr…', 'Mrrow.', 'Mew.'] },
    bird:   { tired: ['…chirp.', '*ruffles feathers*'], hungry: ['Cheep?! Cheep?!', 'Peep! Peep!'], happy: ['Tweet tweet!', 'Cheep cheep!', 'Chirrup!'], base: ['Chirp.', 'Tweet~', 'Trill~'] },
    turtle: { tired: ['…zzz.'], hungry: ['*hopeful stare*'], happy: ['…hff! (a happy little hiss)', '*slow, pleased blink*'], base: ['…hm.', '*slow blink*', '…hff.'] }
  };
  function petNoise(s) {
    var N = NOISES[s.pet], set;
    if (isNight() && (Date.now() - s.lastAny > 90000)) set = N.tired;
    else if (s.hunger < 25) set = N.hungry;
    else if (playedRecently() || s.affection >= 58) set = N.happy;
    else set = N.base;
    return set[Math.floor(Math.random() * set.length)];
  }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // coat tint chosen in the Identity Forge recolours the pet here too
  function tintFilter() {
    try {
      var id = JSON.parse(localStorage.getItem('pjcc.identity.v1')) || {};
      var key = id.pet && id.pet.tint;
      if (!key || key === 'none') return '';
      var T = window.PJCCForge && PJCCForge.TINTS;
      return (T && T[key]) ? T[key].f : '';
    } catch (e) { return ''; }
  }

  // ---- sound (species voice) — silenced entirely in Calm mode ---------------
  var actx = null, soundOn = true;
  try { soundOn = localStorage.getItem(SND_KEY) !== '0'; } catch (e) {}
  function sound() {
    var s = load();
    if (!soundOn || s.calm) return;   // Calm mode = never a peep (#20)
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === 'suspended') actx.resume();
      var o = actx.createOscillator(), g = actx.createGain(); o.connect(g); g.connect(actx.destination);
      var t = actx.currentTime, cfg = PETS[s.pet].snd;
      o.type = cfg.type; o.frequency.setValueAtTime(cfg.f, t); o.frequency.exponentialRampToValueAtTime(cfg.f2, t + 0.12);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.16, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
      o.start(t); o.stop(t + 0.26);
    } catch (e) {}
  }

  // ---- den DOM effects ------------------------------------------------------
  var denEl = null;
  function fxBurst(em) {
    var s = load(); if (s.calm) return;                 // Calm mode: no bursts
    var stage = denEl && denEl.querySelector('.den-stage'); if (!stage) return;
    for (var i = 0; i < 6; i++) {
      var d = document.createElement('span'); d.className = 'den-fx'; d.textContent = em;
      d.style.left = (38 + Math.random() * 24) + '%'; d.style.animationDelay = (Math.random() * 0.3) + 's';
      stage.appendChild(d); (function (n) { setTimeout(function () { n.remove(); }, 2600); })(d);
    }
  }
  function bounce(cls) { var s = load(); if (s.calm) return; var pet = denEl && denEl.querySelector('.den-pet'); if (!pet) return; pet.classList.remove('happy', 'trick'); void pet.offsetWidth; pet.classList.add(cls); }
  function toast(msg) { var t = document.createElement('div'); t.className = 'den-toast'; t.textContent = msg; document.body.appendChild(t); setTimeout(function () { t.remove(); }, 2200); }

  // bond helper — nudges the relationship, and fires the max-bond ARG dig once (#17)
  function addBond(s, amt) {
    var before = s.bond;
    s.bond = clamp(s.bond + amt, 0, 100);
    if (before < 100 && s.bond >= 100 && !s.dug) {
      s.dug = true;
      try { localStorage.setItem('frag_companion', '1'); } catch (e) {}
      setTimeout(function () { toast('🗝️ ' + displayName(s) + ' dug up a buried token! (fragment recovered)'); }, 400);
    }
  }

  // ---- actions --------------------------------------------------------------
  function actPet() {
    var s = load(), now = Date.now();
    if (now - s.lastPet < 1200) return;
    s.affection = clamp(s.affection + 8, 0, 100); addBond(s, 0.6); s.lastPet = now; s.lastAny = now; s.tick = now;
    save(s); refresh(); sound(); bounce('happy'); fxBurst('💗');
  }
  function actFeed() {
    var s = load(), now = Date.now();
    if (now - s.lastFeed < 2500) { toast('Still nibbling the last one!'); return; }
    s.hunger = clamp(s.hunger + 30, 0, 100); s.affection = clamp(s.affection + 4, 0, 100); addBond(s, 0.4);
    s.lastFeed = now; s.lastAny = now; s.tick = now;
    save(s); refresh(); sound(); bounce('happy'); fxBurst('🦴');
  }
  function actPlay() {
    var s = load(), now = Date.now();
    if (s.energy < 12) { toast('Worn out — they need a little rest first.'); return; }
    if (now - s.lastPlay < 3500) { toast('Catching their breath…'); return; }
    s.energy = clamp(s.energy - 12, 0, 100); s.affection = clamp(s.affection + 6, 0, 100); addBond(s, 1.4);
    s.lastPlay = now; s.lastAny = now; s.tick = now;
    save(s); refresh(); sound(); bounce('trick'); fxBurst('🎾');
  }
  function actPick(key) {                                  // choose your friend — free (#3)
    if (!PETS[key]) return;
    var s = load(); s.pet = key; s.lastAny = Date.now(); save(s);
    try { if (window.PJCC && PJCC.setPet) PJCC.setPet(key); } catch (e) {}
    sound(); refresh();
  }
  function actRename() {
    var s = load(), nm = window.prompt('Name your companion:', displayName(s)); if (nm === null) return;
    nm = String(nm).trim().slice(0, 16);
    if (nm) s.names[s.pet] = nm; else delete s.names[s.pet];
    save(s); refresh();
  }
  function actCosmetic(key) {
    var s = load();
    if (key.indexOf('s-') === 0) {                    // seasonal — free while in season (#8)
      var sea = currentSeasonal();
      if (!sea || sea.key !== key) { toast('That one is out of season — catch it next time!'); return; }
      s.cosmetics[s.pet] = key; save(s); refresh(); return;
    }
    var c = COSMETICS[key]; if (!c) return;
    if (s.ownedCos.indexOf(key) === -1) {
      if (bondInfo(s).bond < c.need) { toast(c.name + ' unlocks at Bond ' + c.need + '.'); return; }
      s.ownedCos.push(key);
    }
    s.cosmetics[s.pet] = key; save(s); refresh();
  }
  function actCalm() { var s = load(); s.calm = !s.calm; save(s); toast(s.calm ? 'Calm mode on — a quiet, still companion.' : 'Calm mode off.'); refresh(); }
  function actSound() { soundOn = !soundOn; try { localStorage.setItem(SND_KEY, soundOn ? '1' : '0'); } catch (e) {} if (soundOn) sound(); refresh(); }

  // ---- inline mood card (on the Dossier) ------------------------------------
  var mountCard = null;
  function need(cls, em, v) { return '<span class="pc-need">' + em + '<span class="pc-bar ' + cls + '"><i style="width:' + Math.round(v) + '%"></i></span></span>'; }
  function renderCard(el, stats) {
    mountCard = el; if (stats) lastStats = stats;
    if (checkNewBest(stats)) cheerBest = true;
    var s = load(), bi = bondInfo(s), m = mood(s), p = PETS[s.pet];
    var cosKey = s.cosmetics[s.pet], cosEm = cosEmOf(cosKey);
    el.innerHTML =
      '<div class="pet-card' + (s.calm ? ' is-calm' : '') + '">' +
        '<div class="pc-stage"><span style="filter:' + tintFilter() + '">' + petEmojiFor(s, bi) + '</span>' + (cosEm ? '<span class="pc-acc">' + cosEm + '</span>' : '') + '</div>' +
        '<div class="pc-info">' +
          '<div class="pc-name">' + esc(displayName(s)) + ' <small>' + p.trait + ' · Bond ' + bi.level + ' · ' + p.stages[bi.stage] + '</small></div>' +
          '<div class="pc-mood">' + m.emoji + ' <b>' + m.state + '</b> — ' + esc(m.line) + '</div>' +
          '<div class="pc-needs">' + need('hunger', '🍖', s.hunger) + need('energy', '⚡', s.energy) + need('bond', '💗', s.affection) + '</div>' +
        '</div>' +
        '<div class="pc-actions"><button class="den-open-btn" id="pc-open">🏡 Open the Companion Den</button></div>' +
      '</div>';
    var b = el.querySelector('#pc-open'); if (b) b.onclick = function () { openDen(lastStats); };
  }

  // ---- the Den overlay ------------------------------------------------------
  function openDen(stats) {
    if (stats) lastStats = stats;
    if (!denEl) {
      denEl = document.createElement('div'); denEl.className = 'den-ov';
      denEl.addEventListener('click', function (e) { if (e.target === denEl) closeDen(); });
      document.body.appendChild(denEl);
    }
    denEl.classList.remove('hidden'); document.body.style.overflow = 'hidden'; renderDen();
    if (cheerBest) { setTimeout(function () { fxBurst('🏆'); fxBurst('🎉'); }, 250); cheerBest = false; renderDen(); }   // new personal best (#7)
    else if (playedRecently()) setTimeout(function () { fxBurst('🎉'); }, 250);                                          // reacts to your play (#11)
  }
  function closeDen() { if (denEl) denEl.classList.add('hidden'); document.body.style.overflow = ''; }

  function timeOfDay() { var h = localHour(); if (h >= 7 && h < 17) return { cls: 'day', orb: '☀️', stars: 0 }; if (h >= 17 && h < 20) return { cls: 'dusk', orb: '🌇', stars: 0 }; return { cls: 'night', orb: '🌙', stars: 14 }; }
  function meter(cls, label, v) { return '<div class="den-meter"><div class="m-top"><span>' + label + '</span><b>' + Math.round(v) + '</b></div><div class="m-bar ' + cls + '"><i style="width:' + Math.round(v) + '%"></i></div></div>'; }
  function btn(id, em, label, sub) { return '<button class="den-btn" id="' + id + '"><span class="be">' + em + '</span>' + label + (sub ? '<small>' + sub + '</small>' : '') + '</button>'; }

  function renderDen() {
    if (!denEl) return;
    var s = load(), p = PETS[s.pet], bi = bondInfo(s), m = mood(s), tod = timeOfDay();
    var napping = isNight() && (Date.now() - s.lastAny > 90000);
    var cosKey = s.cosmetics[s.pet] || 'none', cosEm = cosEmOf(cosKey);
    var stars = ''; for (var i = 0; i < tod.stars; i++) stars += '<span class="star" style="top:' + (6 + Math.random() * 60) + '%;left:' + (Math.random() * 96) + '%;animation-delay:' + (Math.random() * 3).toFixed(1) + 's"></span>';

    var html = '<div class="den' + (s.calm ? ' is-calm' : '') + '">';

    // stage — sky, pet, noise bubble, name
    html += '<div class="den-stage ' + tod.cls + '">' +
      '<div class="den-sky">' + stars + '<span class="orb">' + tod.orb + '</span></div>' +
      '<div class="den-head"><span class="den-eyebrow">Companion Den' + (p.canon ? ' · Princess\'s own' : '') + '</span>' +
        '<button class="den-close" id="den-x" title="Close">✕</button></div>' +
      (s.calm ? '' : '<div class="den-bubble den-bubble--noise">' + esc(petNoise(s)) + '</div>') +
      '<div class="den-pet-wrap">' +
        '<span class="den-pet' + (napping ? ' asleep' : '') + '" id="den-pet" style="filter:' + tintFilter() + '">' + petEmojiFor(s, bi) + '</span>' +
        (cosEm ? '<span class="den-acc-em">' + cosEm + '</span>' : '') +
        (napping ? '<span class="den-zzz">💤</span>' : '') +
      '</div>' +
      '<div class="den-name-row"><span class="den-name">' + esc(displayName(s)) +
        ' <button class="den-close" id="den-rename" title="Rename" style="width:24px;height:24px;font-size:12px;vertical-align:middle;">✏️</button>' +
        '<small>' + m.emoji + ' ' + m.state + ' · ' + p.trait + ' ' + s.pet + ' · Bond ' + bi.level + ' ' + p.stages[bi.stage] + '</small></span></div>' +
      '</div>';

    html += '<div class="den-body">';

    // meters + bond
    html += '<div class="den-meters">' +
      meter('hunger', '🍖 Fullness', s.hunger) + meter('energy', '⚡ Energy', s.energy) + meter('affection', '💗 Affection', s.affection) +
      '<div class="den-meter"><div class="m-top"><span>💞 Bond ' + bi.level + '/10</span><b>' + Math.round(bi.bond) + '/100</b></div><div class="m-bar xp"><i style="width:' + Math.round(bi.bond) + '%"></i></div></div>' +
      '</div>';

    // care — three buttons, no currency
    html += '<div class="den-section"><h3>Care</h3><div class="den-actions">' +
      btn('den-pet-btn', '💗', 'Pet', 'free') + btn('den-feed', '🦴', 'Feed', 'fills them up') + btn('den-play', '🎾', 'Play', 'deepens Bond') +
      '</div>' +
      '<div class="den-toolbar">' +
        '<button class="den-btn den-btn--wide" id="den-share"><span class="be">📸</span>Share card</button>' +
        '<button class="den-btn den-btn--wide' + (s.calm ? ' on' : '') + '" id="den-calm"><span class="be">' + (s.calm ? '🌙' : '🔔') + '</span>' + (s.calm ? 'Calm: on' : 'Calm mode') + '</button>' +
        '<button class="den-btn den-btn--wide" id="den-sound"><span class="be">' + (soundOn ? '🔊' : '🔇') + '</span>' + (soundOn ? 'Sound' : 'Muted') + '</button>' +
      '</div></div>';

    // choose your friend — a free pick of four (#3)
    html += '<div class="den-section"><h3>Choose your friend <span class="den-note">— it becomes your one companion; switch any time</span></h3><div class="den-grid">';
    PET_ORDER.forEach(function (key) {
      var pp = PETS[key], on = s.pet === key;
      html += '<div class="den-cell' + (on ? ' on' : '') + '" data-pick="' + key + '" title="' + esc(pp.persona) + '">' +
        '<div class="ce">' + pp.ems[1] + '</div><div class="cn">' + esc(s.names[key] || pp.name) + '</div>' +
        '<div class="ck">' + (on ? 'yours' : (pp.canon ? 'Princess\'s' : 'meet')) + '</div></div>';
    });
    html += '</div></div>';

    // cosmetics — the only collectible, unlocked by Bond (#2/#19); plus the current
    // seasonal drop, free to wear while it's in season (#8).
    html += '<div class="den-section"><h3>Cosmetics <span class="den-note">— unlock as your Bond deepens</span></h3><div class="den-grid">';
    Object.keys(COSMETICS).forEach(function (key) {
      var c = COSMETICS[key], owned = s.ownedCos.indexOf(key) !== -1 || c.need === 0, on = cosKey === key;
      var locked = !owned && bi.bond < c.need;
      html += '<div class="den-cell' + (on ? ' on' : '') + (locked ? ' locked' : '') + '" data-cos="' + key + '">' +
        '<div class="ce">' + (c.em || '🚫') + '</div><div class="cn">' + c.name + '</div>' + (locked ? '<div class="ck">Bond ' + c.need + '</div>' : '') + '</div>';
    });
    var sea = currentSeasonal();
    if (sea) {
      html += '<div class="den-cell' + (cosKey === sea.key ? ' on' : '') + '" data-cos="' + sea.key + '" title="In season now — wear it while it lasts!">' +
        '<div class="ce">' + sea.em + '</div><div class="cn">' + sea.name + '</div><div class="ck" style="color:#6bffb8">in season</div></div>';
    }
    html += '</div></div>';

    html += '</div></div>';
    denEl.innerHTML = html;
    wireDen();
  }

  function wireDen() {
    var q = function (id) { return denEl.querySelector('#' + id); };
    var on = function (id, fn) { var el = q(id); if (el) el.onclick = fn; };
    on('den-x', closeDen); on('den-rename', actRename);
    on('den-pet-btn', actPet); on('den-feed', actFeed); on('den-play', actPlay);
    on('den-share', shareCard); on('den-calm', actCalm); on('den-sound', actSound);
    var pet = q('den-pet'); if (pet) pet.onclick = actPet;
    Array.prototype.forEach.call(denEl.querySelectorAll('[data-pick]'), function (c) { c.onclick = function () { actPick(c.getAttribute('data-pick')); }; });
    Array.prototype.forEach.call(denEl.querySelectorAll('[data-cos]'), function (c) { c.onclick = function () { actCosmetic(c.getAttribute('data-cos')); }; });
  }

  // ---- share card (#18) -----------------------------------------------------
  function shareCard() {
    var s = load(), bi = bondInfo(s), p = PETS[s.pet];
    var c = document.createElement('canvas'); c.width = 600; c.height = 340; var g = c.getContext('2d');
    var grad = g.createLinearGradient(0, 0, 600, 340); grad.addColorStop(0, '#1f1147'); grad.addColorStop(1, '#34206f');
    g.fillStyle = grad; g.fillRect(0, 0, 600, 340);
    g.strokeStyle = '#F5C518'; g.lineWidth = 6; g.strokeRect(10, 10, 580, 320);
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = '120px sans-serif'; g.fillText(petEmojiFor(s, bi), 140, 150);
    g.textAlign = 'left';
    g.fillStyle = '#F5C518'; g.font = 'bold 42px Poppins, system-ui, sans-serif'; g.fillText(displayName(s), 250, 110);
    g.fillStyle = '#cdbcf2'; g.font = '22px Inter, system-ui, sans-serif'; g.fillText(p.stages[bi.stage] + ' · ' + p.trait, 250, 152);
    g.fillStyle = '#6bffb8'; g.font = 'bold 30px Poppins, system-ui, sans-serif'; g.fillText('Bond ' + bi.level + ' / 10', 250, 200);
    g.fillStyle = '#9a7fd4'; g.font = '16px Inter, system-ui, sans-serif'; g.fillText('mcpuppystudios.com · my PJCC companion', 30, 312);
    c.toBlob(function (blob) {
      if (!blob) return;
      var file = new File([blob], 'pjcc-companion.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file], title: 'My PJCC companion', text: displayName(s) + ' — mcpuppystudios.com' }).catch(function () {});
      } else {
        var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'pjcc-companion.png'; a.click();
      }
    }, 'image/png');
  }

  function refresh() { if (mountCard) renderCard(mountCard, lastStats); if (denEl && !denEl.classList.contains('hidden')) renderDen(); }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && denEl && !denEl.classList.contains('hidden')) closeDen(); });

  window.PJCCPet = {
    PETS: PETS, renderCard: renderCard, openDen: openDen, closeDen: closeDen,
    petEmoji: function () { return petEmojiFor(load()); },
    mood: function () { return mood(load()); },
    // games can call this to make the companion celebrate a fresh best (#11)
    cheer: function () { var s = load(); s.lastAny = Date.now(); save(s); if (denEl && !denEl.classList.contains('hidden')) { fxBurst('🎉'); } refresh(); }
  };
})();
