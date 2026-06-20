/* =============================================================================
 * PJCC Companion — the pet system.
 * -----------------------------------------------------------------------------
 * 12 pets (dog/cat/bird/turtle × 3), each named with its own personality. An
 * inline mood card on the Dossier drills into a full "Companion Den" with
 * petting, feeding, resting, fetch, tricks, a daily check-in, dress-up, a
 * game-themed skill tree with species ultimates, growth stages, day/night, and
 * species sounds. Care state lives in localStorage (instant + offline); the
 * chosen avatar + pet also persist to the account via PJCC so they follow you.
 *
 *   PJCCPet.renderCard(el, stats)  -> draw the inline mood card into `el`
 *   PJCCPet.openDen(stats)         -> open the full drill-in overlay
 * ========================================================================== */
(function () {
  'use strict';

  // ---- catalogues ---------------------------------------------------------
  var PETS = {
    'dog-1': { sp: 'dog', name: 'Biscuit', em: '🐕', baby: '🐶', fav: 'bone',  persona: 'Loyal and bouncy — lives for the next round.', trait: 'Fetcher' },
    'dog-2': { sp: 'dog', name: 'Pixel',   em: '🐩', baby: '🐶', fav: 'jerky', persona: 'Prim and clever — never a hair out of place.',  trait: 'Show-off' },
    'dog-3': { sp: 'dog', name: 'Tank',    em: '🦮', baby: '🐶', fav: 'steak', persona: 'Steady and brave — always on duty.',           trait: 'Guardian' },
    'cat-1': { sp: 'cat', name: 'Mochi',   em: '🐈', baby: '🐱', fav: 'fish',  persona: 'A sleepy gourmand who naps through danger.',    trait: 'Napper' },
    'cat-2': { sp: 'cat', name: 'Domino',  em: '🐱', baby: '🐱', fav: 'milk',  persona: 'A playful trickster, all paws and pounce.',     trait: 'Pouncer' },
    'cat-3': { sp: 'cat', name: 'Sphinx',  em: '😼', baby: '🐱', fav: 'cream', persona: 'Sly and smug — knows more than it lets on.',    trait: 'Schemer' },
    'bird-1':{ sp: 'bird', name: 'Pip',    em: '🐦', baby: '🐤', fav: 'seeds', persona: 'A cheery early riser, always singing.',         trait: 'Songbird' },
    'bird-2':{ sp: 'bird', name: 'Sunny',  em: '🦜', baby: '🐤', fav: 'fruit', persona: 'A chatty parrot who repeats your best lines.',  trait: 'Mimic' },
    'bird-3':{ sp: 'bird', name: 'Newton', em: '🦉', baby: '🐤', fav: 'berries',persona: 'A wise night owl, calm under pressure.',        trait: 'Scholar' },
    'turtle-1':{ sp: 'turtle', name: 'Sheldon', em: '🐢', baby: '🥚', fav: 'lettuce', persona: 'Slow, steady, unshakeably calm.',        trait: 'Stoic' },
    'turtle-2':{ sp: 'turtle', name: 'Boulder', em: '🐢', baby: '🥚', fav: 'melon',   persona: 'A tough old shell that takes every hit.', trait: 'Bulwark' },
    'turtle-3':{ sp: 'turtle', name: 'Zen',     em: '🐢', baby: '🥚', fav: 'kelp',    persona: 'A meditative sage of the slow path.',     trait: 'Sage' }
  };
  var PET_ORDER = Object.keys(PETS);
  var TREATS = { bone:'🦴', jerky:'🥓', steak:'🥩', fish:'🐟', milk:'🥛', cream:'🍦', seeds:'🌾', fruit:'🍓', berries:'🫐', lettuce:'🥬', melon:'🍈', kelp:'🌿' };
  var SPECIES = {
    dog:    { idle:'idle-wag',   stages:['Pup','Hound','Companion','Legend Hound'],  say:"Woof! Let's fetch a high score." },
    cat:    { idle:'idle-blink', stages:['Kitten','Cat','Mouser','Grand Feline'],    say:'I permit you to admire me.' },
    bird:   { idle:'idle-hop',   stages:['Chick','Fledgling','Flyer','Sky Marshal'], say:'Tweet — I memorised your best line!' },
    turtle: { idle:'idle-plod',  stages:['Hatchling','Shellback','Elder','Ancient One'], say:'Slow and steady wins the board.' }
  };
  var NAMES = { 'cipher':'CIPHER','clearance-delta':'Clearance: DELTA','notation-run':'Notation Blitz','fork-in-the-road':'Fork in the Road','sand-mine-depths':'Sand Mine Depths','pirc-protocol':'Pirc Protocol','shogi-island':'Shogi Island','blindfold':'Blindfold Puzzles','tower-defense':'Siege on Chess City' };
  function gameName(k) { return NAMES[k] || k || 'the games'; }

  var SKILLS = [
    { key:'quick-paws', em:'🐾', name:'Quick Paws', desc:'Fetch & trick cooldowns halved.', cost:1, col:0, tier:0 },
    { key:'metronome',  em:'🎵', name:'Metronome',  desc:'+50% XP from feeding.',           cost:1, col:0, tier:1, req:'quick-paws' },
    { key:'showtime',   em:'🌟', name:'Showtime',   desc:'Tricks give double affection.',   cost:2, col:0, tier:2, req:'metronome' },
    { key:'iron-belly', em:'🛡️', name:'Iron Belly', desc:'Hunger falls 40% slower.',        cost:1, col:1, tier:0 },
    { key:'deep-rest',  em:'😴', name:'Deep Rest',  desc:'Resting restores energy 60% faster.', cost:1, col:1, tier:1, req:'iron-belly' },
    { key:'comfy-den',  em:'🏠', name:'Comfy Den',  desc:'Energy never drops below 20.',    cost:2, col:1, tier:2, req:'deep-rest' },
    { key:'sharp-nose', em:'👃', name:'Sharp Nose', desc:'Daily check-in gives +1 treat.',  cost:1, col:2, tier:0 },
    { key:'treat-radar',em:'📡', name:'Treat Radar',desc:'Fetch usually returns a treat.',  cost:1, col:2, tier:1, req:'sharp-nose' },
    { key:'big-heart',  em:'💗', name:'Big Heart',  desc:'Affection fades 50% slower.',     cost:2, col:2, tier:2, req:'treat-radar' }
  ];
  var ULTIMATES = {
    dog:    { key:'u-dog',    em:'🦴', name:'Best Friend',   desc:'Affection never falls below 50, and petting counts double.', cost:3 },
    cat:    { key:'u-cat',    em:'🐾', name:'Nine Lives',    desc:'Hunger never falls below 30.', cost:3 },
    bird:   { key:'u-bird',   em:'🌅', name:'Early Bird',    desc:'Claim the daily check-in twice a day.', cost:3 },
    turtle: { key:'u-turtle', em:'🧘', name:'Ancient Wisdom',desc:'All XP gains boosted by 25%.', cost:3 }
  };
  var ACCESSORIES = {
    none:  { em:'',    name:'None',    need:0 },
    bow:   { em:'🎀', name:'Bow',     need:0 },
    scarf: { em:'🧣', name:'Scarf',   need:2 },
    hat:   { em:'🎩', name:'Top Hat', need:3 },
    shades:{ em:'🕶️', name:'Shades',  need:4 },
    crown: { em:'👑', name:'Crown',   need:6 }
  };

  // ---- state (localStorage, with lazy time-decay) -------------------------
  var KEY = 'pjcc.pet.v2', SND_KEY = 'pjcc.pet.sound';
  var HUNGER_RATE = 3.5, ENERGY_DECAY = 1.5, REST_RATE = 22, AFFECTION_DECAY = 0.8;
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function blank() {
    return {
      avatar:'human-1', pet:'dog-1', adopted:['dog-1'], names:{}, accessories:{}, ownedAcc:['none','bow'],
      hunger:75, energy:80, affection:25, bond:1, bondFlag:false, xp:0, skills:{}, treats:3,
      resting:false, tick:Date.now(), lastDaily:'', dailyCount:0,
      lastPet:0, lastFetch:0, lastTrick:0, createdAt:Date.now()
    };
  }
  function load() {
    var s = null;
    try { s = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
    if (!s) s = blank();
    var d = blank(); for (var k in d) if (s[k] === undefined) s[k] = d[k];
    if (!PETS[s.pet]) s.pet = 'dog-1';
    // mirror the account's chosen pet/avatar if present
    try { if (window.PJCC && PJCC.getProfile) { var pr = PJCC.getProfile(); if (pr && pr.companion) { if (pr.companion.pet && PETS[pr.companion.pet]) s.pet = pr.companion.pet; if (pr.companion.avatar) s.avatar = pr.companion.avatar; } } } catch (e) {}
    // lazy decay since last tick
    var now = Date.now(), hrs = Math.max(0, (now - (s.tick || now)) / 3600000);
    if (hrs > 0.0004) {
      var e = effects(s);
      s.hunger = clamp(s.hunger - hrs * HUNGER_RATE * e.hungerMul, e.hungerFloor, 100);
      if (s.resting) s.energy = clamp(s.energy + hrs * REST_RATE * e.restMul, 0, 100);
      else s.energy = clamp(s.energy - hrs * ENERGY_DECAY, e.energyFloor, 100);
      s.affection = clamp(s.affection - hrs * AFFECTION_DECAY * e.affMul, e.affFloor, 100);
      s.tick = now;
    }
    return s;
  }
  function save(s) { normBond(s); try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }

  // Bond ticks up each time you max out affection (and resets the latch when it
  // dips), giving a "fill the heart to deepen the bond" loop that gates dress-up.
  var bondUp = false;
  function normBond(s) {
    if (s.affection >= 98 && !s.bondFlag) { s.bond = Math.min(10, (s.bond || 1) + 1); s.bondFlag = true; bondUp = true; }
    if (s.affection < 80) s.bondFlag = false;
  }

  function effects(s) {
    var h = function (k) { return !!(s.skills && s.skills[k]); };
    var e = { hungerMul:1, restMul:1, affMul:1, hungerFloor:0, energyFloor:0, affFloor:0,
              feedXp:1, xpMul:1, cdMul:1, dailyTreatBonus:0, fetchTreatChance:0.25, petMul:1, trickAffMul:1, dailyTimes:1 };
    if (h('iron-belly')) e.hungerMul *= 0.6;
    if (h('deep-rest'))  e.restMul *= 1.6;
    if (h('comfy-den'))  e.energyFloor = Math.max(e.energyFloor, 20);
    if (h('metronome'))  e.feedXp *= 1.5;
    if (h('showtime'))   e.trickAffMul *= 2;
    if (h('quick-paws')) e.cdMul *= 0.5;
    if (h('sharp-nose')) e.dailyTreatBonus += 1;
    if (h('treat-radar')) e.fetchTreatChance = 0.7;
    if (h('big-heart'))  e.affMul *= 0.5;
    if (h('u-dog'))    { e.affFloor = Math.max(e.affFloor, 50); e.petMul *= 2; }
    if (h('u-cat'))    e.hungerFloor = Math.max(e.hungerFloor, 30);
    if (h('u-bird'))   e.dailyTimes = 2;
    if (h('u-turtle')) e.xpMul *= 1.25;
    return e;
  }

  function levelInfo(s) {
    var L = 1, req = 0;
    while (L < 12) { var need = 80 + (L - 1) * 50; if (s.xp >= req + need) { req += need; L++; } else break; }
    var toNext = 80 + (L - 1) * 50, into = s.xp - req;
    var sp = PETS[s.pet].sp, stages = SPECIES[sp].stages;
    var stage = stages[Math.min(stages.length - 1, Math.floor((L - 1) / 3))];
    return { level:L, into:into, span:toNext, stage:stage, pct:Math.round(into / toNext * 100) };
  }
  function spentSP(s) { var t = 0; SKILLS.forEach(function (k) { if (s.skills[k.key]) t += k.cost; }); for (var sp in ULTIMATES) if (s.skills[ULTIMATES[sp].key]) t += ULTIMATES[sp].cost; return t; }
  function availSP(s) { return (levelInfo(s).level - 1) - spentSP(s); }
  function addXP(s, amt) { s.xp += Math.round(amt * effects(s).xpMul); }

  function mood(s) {
    if (s.resting) return { emoji:'😴', state:'Napping', line:'Resting up — energy is recharging.' };
    if (s.hunger < 25)    return { emoji:'🍽️', state:'Hungry',  line:'Tummy rumbling — time for a treat.' };
    if (s.energy < 22)    return { emoji:'🥱', state:'Tired',   line:'Worn out — a nap would help.' };
    if (s.affection < 20) return { emoji:'🥺', state:'Lonely',  line:'Could really use some attention.' };
    var score = s.affection * 0.45 + s.hunger * 0.3 + s.energy * 0.25;
    if (score >= 78) return { emoji:'🤩', state:'Ecstatic', line:'Over the moon to see you!' };
    if (score >= 58) return { emoji:'😄', state:'Happy',    line:'Bright-eyed and bushy-tailed.' };
    if (score >= 38) return { emoji:'🙂', state:'Content',  line:'Doing just fine.' };
    return { emoji:'😟', state:'Restless', line:'A bit out of sorts — spend some time together.' };
  }
  function speech(s, m) {
    var p = PETS[s.pet], hour = new Date().getHours(), lines = [m.line, SPECIES[p.sp].say];
    if (hour < 6) lines.push('The board sleeps… but I am awake with you.');
    else if (hour < 12) lines.push('Morning! Ready for a run at the games?');
    else if (hour < 18) lines.push('Afternoon patrol of Chess City?');
    else lines.push('Evening — perfect for a quiet puzzle.');
    if (lastStats && lastStats.length) {
      var last = lastStats.slice().sort(function (a, b) { return Date.parse(b.updated_at || 0) - Date.parse(a.updated_at || 0); })[0];
      if (last) lines.push('That ' + gameName(last.game) + ' run was something!');
    }
    if (s.affection >= 90) lines.push('You are my favourite operative, you know.');
    return lines[Math.floor(Math.random() * lines.length)];
  }
  function favGame() {
    if (!lastStats || !lastStats.length) return '—';
    var best = lastStats.slice().sort(function (a, b) { return (b.plays || 0) - (a.plays || 0); })[0];
    return best ? gameName(best.game) : '—';
  }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]; }); }

  // ---- sound (species voice) ---------------------------------------------
  var actx = null, soundOn = true;
  try { soundOn = localStorage.getItem(SND_KEY) !== '0'; } catch (e) {}
  function sound() {
    if (!soundOn) return;
    var s = load(), sp = PETS[s.pet].sp;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === 'suspended') actx.resume();
      var o = actx.createOscillator(), g = actx.createGain(); o.connect(g); g.connect(actx.destination);
      var t = actx.currentTime;
      var cfg = { dog:{type:'square',f:240,f2:170}, cat:{type:'sine',f:640,f2:840}, bird:{type:'triangle',f:1200,f2:1750}, turtle:{type:'sine',f:150,f2:110} }[sp];
      o.type = cfg.type; o.frequency.setValueAtTime(cfg.f, t); o.frequency.exponentialRampToValueAtTime(cfg.f2, t + 0.12);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.18, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
      o.start(t); o.stop(t + 0.26);
    } catch (e) {}
  }

  // ---- den DOM effects ----------------------------------------------------
  function fxBurst(em) {
    var stage = denEl && denEl.querySelector('.den-stage'); if (!stage) return;
    for (var i = 0; i < 6; i++) {
      var d = document.createElement('span'); d.className = 'den-fx'; d.textContent = em;
      d.style.left = (38 + Math.random() * 24) + '%'; d.style.animationDelay = (Math.random() * 0.3) + 's';
      stage.appendChild(d); (function (n) { setTimeout(function () { n.remove(); }, 2600); })(d);
    }
  }
  function bounce(cls) { var pet = denEl && denEl.querySelector('.den-pet'); if (!pet) return; pet.classList.remove('happy', 'trick'); void pet.offsetWidth; pet.classList.add(cls); }
  function toast(msg) { var t = document.createElement('div'); t.className = 'den-toast'; t.textContent = msg; document.body.appendChild(t); setTimeout(function () { t.remove(); }, 2200); }
  function flushBond() { if (bondUp) { bondUp = false; toast('💞 Bond deepened!'); } }

  // ---- actions ------------------------------------------------------------
  function actPet() {
    var s = load(), now = Date.now();
    if (now - s.lastPet < 1400) return;
    var e = effects(s);
    s.affection = clamp(s.affection + 8 * e.petMul, 0, 100); addXP(s, 3); s.lastPet = now; s.tick = now;
    save(s); refresh(); sound(); bounce('happy'); fxBurst('💗'); flushBond();
  }
  function actFeed(fav) {
    var s = load(), cost = fav ? 2 : 1;
    if (s.treats < cost) { toast('Out of treats — fetch, or check in daily.'); return; }
    var e = effects(s), p = PETS[s.pet];
    s.treats -= cost;
    s.hunger = clamp(s.hunger + (fav ? 42 : 26), e.hungerFloor, 100);
    s.affection = clamp(s.affection + (fav ? 10 : 5), 0, 100);
    s.xp += Math.round((fav ? 14 : 8) * e.feedXp * e.xpMul); s.tick = Date.now();
    save(s); refresh(); sound(); bounce('happy'); fxBurst(fav ? TREATS[p.fav] : '🦴'); flushBond();
    if (fav) toast(displayName(s) + ' adores ' + TREATS[p.fav] + '!');
  }
  function actRest() { var s = load(); s.resting = !s.resting; s.tick = Date.now(); save(s); sound(); refresh(); }
  function actTrick() {
    var s = load();
    if (s.resting) { toast('Wake them first.'); return; }
    if (s.affection < 40) { toast('Bond to 40 affection first — pet and play.'); return; }
    if (s.energy < 10) { toast('Too tired for tricks — let them rest.'); return; }
    var now = Date.now(), e = effects(s);
    if (now - s.lastTrick < 4000 * e.cdMul) { toast('Catching their breath…'); return; }
    s.energy = clamp(s.energy - 8, e.energyFloor, 100);
    s.affection = clamp(s.affection + 6 * e.trickAffMul, 0, 100);
    addXP(s, 7); s.lastTrick = now; s.tick = now;
    save(s); refresh(); sound(); bounce('trick'); fxBurst('✨'); flushBond();
  }
  function actFetch() {
    var s = load();
    if (s.resting) { toast('They are napping.'); return; }
    if (s.energy < 12) { toast('Too tired to fetch — rest first.'); return; }
    var now = Date.now(), e = effects(s);
    if (now - s.lastFetch < 6000 * e.cdMul) { toast('Still chasing the last one!'); return; }
    s.energy = clamp(s.energy - 10, e.energyFloor, 100); addXP(s, 10); s.affection = clamp(s.affection + 3, 0, 100);
    var got = Math.random() < e.fetchTreatChance; if (got) s.treats += 1;
    s.lastFetch = now; s.tick = now;
    save(s); refresh(); sound(); bounce('happy'); fxBurst(got ? '🦴' : '🎾'); flushBond();
    toast(got ? displayName(s) + ' brought back a treat! 🦴' : displayName(s) + ' fetched the ball! +XP');
  }
  function actDaily() {
    var s = load(), today = new Date().toISOString().slice(0, 10), e = effects(s);
    if (s.lastDaily !== today) s.dailyCount = 0;
    if (s.lastDaily === today && s.dailyCount >= e.dailyTimes) { toast('Already checked in. Come back later!'); return; }
    s.lastDaily = today; s.dailyCount++;
    var treats = 2 + e.dailyTreatBonus; s.treats += treats;
    s.affection = clamp(s.affection + 8, 0, 100); addXP(s, 15); s.tick = Date.now();
    save(s); refresh(); sound(); fxBurst('🎁'); flushBond();
    toast('Daily check-in: +' + treats + ' treats, +XP! 🎁');
  }
  function actAdopt(key) {
    if (!PETS[key]) return;
    var s = load();
    if (s.adopted.indexOf(key) === -1) {
      var cost = 5;
      if (s.treats < cost) { toast('Adopting ' + PETS[key].name + ' costs ' + cost + ' treats.'); return; }
      s.treats -= cost; s.adopted.push(key); toast('Adopted ' + PETS[key].name + '! 🎉');
    }
    s.pet = key; s.tick = Date.now(); save(s);
    try { if (window.PJCC && PJCC.setPet) PJCC.setPet(key); } catch (e) {}
    sound(); refresh();
  }
  function actRename() {
    var s = load(), cur = displayName(s);
    var nm = window.prompt('Name your companion:', cur); if (nm === null) return;
    nm = String(nm).trim().slice(0, 16);
    if (nm) s.names[s.pet] = nm; else delete s.names[s.pet];
    save(s); refresh();
  }
  function actAcc(key) {
    var s = load(), a = ACCESSORIES[key]; if (!a) return;
    if (s.ownedAcc.indexOf(key) === -1) {
      if (s.bond < a.need) { toast(a.name + ' unlocks at Bond ' + a.need + '.'); return; }
      s.ownedAcc.push(key);
    }
    s.accessories[s.pet] = key; save(s); refresh();
  }
  function actSkill(key) {
    var s = load();
    var def = SKILLS.filter(function (k) { return k.key === key; })[0];
    if (!def) for (var sp in ULTIMATES) if (ULTIMATES[sp].key === key) def = ULTIMATES[sp];
    if (!def || s.skills[key]) return;
    if (key.indexOf('u-') === 0 && ULTIMATES[PETS[s.pet].sp].key !== key) { toast('That ultimate belongs to another species.'); return; }
    if (def.req && !s.skills[def.req]) { var rq = SKILLS.filter(function (k) { return k.key === def.req; })[0]; toast('Unlock ' + (rq ? rq.name : 'the prior skill') + ' first.'); return; }
    if (availSP(s) < def.cost) { toast('Need ' + def.cost + ' skill point(s) — level up your pet.'); return; }
    s.skills[key] = true; save(s); sound(); refresh(); toast('Learned ' + def.name + '! ' + def.em);
  }
  function actAvatar(key) {
    var s = load(); s.avatar = key; save(s);
    try { if (window.PJCC && PJCC.setAvatar) PJCC.setAvatar(key).then(refresh).catch(function () {}); } catch (e) {}
    refresh();
  }
  function actSound() { soundOn = !soundOn; try { localStorage.setItem(SND_KEY, soundOn ? '1' : '0'); } catch (e) {} if (soundOn) sound(); refresh(); }

  function displayName(s) { return s.names[s.pet] || PETS[s.pet].name; }
  function petEmojiFor(s, li) { var p = PETS[s.pet]; return (li || levelInfo(s)).level < 3 ? p.baby : p.em; }

  // ---- rendering: inline mood card ---------------------------------------
  var mountCard = null, lastStats = [], denEl = null;
  function need(cls, em, v) { return '<span class="pc-need">' + em + '<span class="pc-bar ' + cls + '"><i style="width:' + Math.round(v) + '%"></i></span></span>'; }

  function renderCard(el, stats) {
    mountCard = el; if (stats) lastStats = stats;
    var s = load(), p = PETS[s.pet], m = mood(s), li = levelInfo(s);
    var accKey = s.accessories[s.pet], accEm = accKey && ACCESSORIES[accKey] ? ACCESSORIES[accKey].em : '';
    el.innerHTML =
      '<div class="pet-card">' +
        '<div class="pc-stage ' + SPECIES[p.sp].idle + '">' + petEmojiFor(s, li) + (accEm ? '<span class="pc-acc">' + accEm + '</span>' : '') + '</div>' +
        '<div class="pc-info">' +
          '<div class="pc-name">' + esc(displayName(s)) + ' <small>' + p.trait + ' · Lv ' + li.level + ' ' + li.stage + '</small></div>' +
          '<div class="pc-mood">' + m.emoji + ' <b>' + m.state + '</b> — ' + esc(m.line) + '</div>' +
          '<div class="pc-needs">' + need('hunger', '🍖', s.hunger) + need('energy', '⚡', s.energy) + need('bond', '💗', s.affection) + '</div>' +
        '</div>' +
        '<div class="pc-actions"><button class="den-open-btn" id="pc-open">🏡 Open the Companion Den</button></div>' +
      '</div>';
    var b = el.querySelector('#pc-open'); if (b) b.onclick = function () { openDen(lastStats); };
  }

  // ---- rendering: the Den overlay ----------------------------------------
  function openDen(stats) {
    if (stats) lastStats = stats;
    if (!denEl) {
      denEl = document.createElement('div'); denEl.className = 'den-ov';
      denEl.addEventListener('click', function (e) { if (e.target === denEl) closeDen(); });
      document.body.appendChild(denEl);
    }
    denEl.classList.remove('hidden'); document.body.style.overflow = 'hidden'; renderDen();
  }
  function closeDen() { if (denEl) denEl.classList.add('hidden'); document.body.style.overflow = ''; }

  function timeOfDay() { var h = new Date().getHours(); if (h >= 7 && h < 17) return { cls:'day', orb:'☀️', stars:0 }; if (h >= 17 && h < 20) return { cls:'dusk', orb:'🌇', stars:0 }; return { cls:'night', orb:'🌙', stars:14 }; }

  function meter(cls, label, v) {
    return '<div class="den-meter"><div class="m-top"><span>' + label + '</span><b>' + Math.round(v) + '</b></div>' +
      '<div class="m-bar ' + cls + '"><i style="width:' + Math.round(v) + '%"></i></div></div>';
  }

  function renderDen() {
    if (!denEl) return;
    var s = load(), p = PETS[s.pet], m = mood(s), li = levelInfo(s), e = effects(s);
    var tod = timeOfDay();
    var accKey = s.accessories[s.pet] || 'none', accEm = ACCESSORIES[accKey] ? ACCESSORIES[accKey].em : '';
    var stars = ''; for (var i = 0; i < tod.stars; i++) stars += '<span class="star" style="top:' + (6 + Math.random() * 60) + '%;left:' + (Math.random() * 96) + '%;animation-delay:' + (Math.random() * 3).toFixed(1) + 's"></span>';

    var html = '<div class="den">';

    // --- stage (time-of-day, pet, bubble, name) ---
    html += '<div class="den-stage ' + tod.cls + '">' +
      '<div class="den-sky">' + stars + '<span class="orb">' + tod.orb + '</span></div>' +
      '<div class="den-head"><span class="den-eyebrow">Companion Den · ' + SPECIES[p.sp].stages[0] + ' wing</span>' +
        '<button class="den-close" id="den-x" title="Close">✕</button></div>' +
      '<div class="den-bubble">' + esc(speech(s, m)) + '</div>' +
      '<div class="den-pet-wrap">' +
        '<span class="den-pet ' + SPECIES[p.sp].idle + (s.resting ? ' asleep' : '') + '" id="den-pet">' + petEmojiFor(s, li) + '</span>' +
        (accEm ? '<span class="den-acc-em">' + accEm + '</span>' : '') +
        (s.resting ? '<span class="den-zzz">💤</span>' : '') +
      '</div>' +
      '<div class="den-name-row"><span class="den-name">' + esc(displayName(s)) +
        ' <button class="den-close" id="den-rename" title="Rename" style="width:24px;height:24px;font-size:12px;vertical-align:middle;">✏️</button>' +
        '<small>' + m.emoji + ' ' + m.state + ' · ' + p.trait + ' ' + p.sp + ' · Lv ' + li.level + ' ' + li.stage + '</small></span></div>' +
      '</div>';

    // --- body ---
    html += '<div class="den-body">';

    // meters
    html += '<div class="den-meters">' +
      meter('hunger', '🍖 Fullness', s.hunger) + meter('energy', '⚡ Energy', s.energy) +
      meter('affection', '💗 Affection', s.affection) +
      '<div class="den-meter"><div class="m-top"><span>⭐ XP to Lv ' + (li.level + 1) + '</span><b>' + li.into + '/' + li.span + '</b></div><div class="m-bar xp"><i style="width:' + li.pct + '%"></i></div></div>' +
      '</div>';
    html += '<div class="den-xp-row"><span class="den-lvl">Lv ' + li.level + '</span><span class="den-stagelbl">' + li.stage + '</span>' +
      '<span class="den-sp">🎓 ' + availSP(s) + ' skill pt' + (availSP(s) === 1 ? '' : 's') + '</span>' +
      '<span class="den-sp">💞 Bond ' + s.bond + '/10</span>' +
      '<span style="margin-left:auto"><button class="den-btn" id="den-sound" style="padding:5px 10px;">' + (soundOn ? '🔊' : '🔇') + '</button></span></div>';

    // care actions
    html += '<div class="den-section"><h3>Care</h3>' +
      '<div class="den-treats">Treats: <b>' + s.treats + '</b> 🦴</div>' +
      '<div class="den-actions">' +
        btn('den-pet-btn', '💗', 'Pet', 'free') +
        btn('den-feed', '🦴', 'Feed', '1 treat') +
        btn('den-fav', TREATS[p.fav], 'Favourite', '2 treats') +
        btn('den-rest', s.resting ? '☀️' : '😴', s.resting ? 'Wake' : 'Rest', s.resting ? 'get up' : 'recharge', false, s.resting) +
        btn('den-fetch', '🎾', 'Fetch', '+XP, treats') +
        btn('den-trick', '✨', 'Trick', 'affection') +
        btn('den-daily', '🎁', 'Daily', s.lastDaily === new Date().toISOString().slice(0,10) && s.dailyCount >= e.dailyTimes ? 'done' : 'claim') +
      '</div></div>';

    // skill tree
    html += '<div class="den-section"><h3>Skill tree <span style="color:#9a7fd4;font-weight:600;font-size:.8rem">— spend points earned by levelling</span></h3>' +
      '<div class="den-tree">';
    var byCell = {}; SKILLS.forEach(function (k) { byCell[k.tier + '-' + k.col] = k; });
    for (var tier = 0; tier < 3; tier++) for (var col = 0; col < 3; col++) {
      var k = byCell[tier + '-' + col]; if (!k) { html += '<div></div>'; continue; }
      html += skillCell(s, k);
    }
    var ult = ULTIMATES[p.sp];
    html += skillCell(s, ult, true);
    html += '</div></div>';

    // dress-up
    html += '<div class="den-section"><h3>Dress-up <span style="color:#9a7fd4;font-weight:600;font-size:.8rem">— unlocks with Bond</span></h3><div class="den-grid">';
    Object.keys(ACCESSORIES).forEach(function (key) {
      var a = ACCESSORIES[key], owned = s.ownedAcc.indexOf(key) !== -1 || a.need === 0, on = accKey === key;
      var locked = !owned && s.bond < a.need;
      html += '<div class="den-cell' + (on ? ' on' : '') + (locked ? ' locked' : '') + '" data-acc="' + key + '">' +
        '<div class="ce">' + (a.em || '🚫') + '</div><div class="cn">' + a.name + '</div>' + (locked ? '<div class="ck">Bond ' + a.need + '</div>' : '') + '</div>';
    });
    html += '</div></div>';

    // roster (collection / adopt / swap)
    html += '<div class="den-section"><h3>Companions <span style="color:#9a7fd4;font-weight:600;font-size:.8rem">— adopt new friends for 5 treats</span></h3><div class="den-grid">';
    PET_ORDER.forEach(function (key) {
      var pp = PETS[key], have = s.adopted.indexOf(key) !== -1, on = s.pet === key;
      html += '<div class="den-cell' + (on ? ' on' : '') + '" data-pet="' + key + '" title="' + esc(pp.persona) + '">' +
        '<div class="ce">' + pp.em + '</div><div class="cn">' + esc(s.names[key] || pp.name) + '</div>' +
        '<div class="ck">' + (have ? (on ? 'active' : 'adopted') : '🦴×5') + '</div></div>';
    });
    html += '</div></div>';

    // operative avatar (the human face)
    html += '<div class="den-section"><h3>Operative avatar</h3><div class="den-grid">';
    (PJCC && PJCC.AVATAR_FREE ? PJCC.AVATAR_FREE : []).forEach(function (key) {
      var on = s.avatar === key, label = (PJCC.HUMAN_LABELS && PJCC.HUMAN_LABELS[key]) || '';
      html += '<div class="den-cell' + (on ? ' on' : '') + '" data-av="' + key + '"><div class="ce">' + PJCC.AVATARS[key] + '</div><div class="cn">' + esc(label) + '</div></div>';
    });
    html += '</div></div>';

    // bio
    var days = Math.max(0, Math.floor((Date.now() - s.createdAt) / 86400000));
    html += '<div class="den-section"><h3>Dossier</h3><div class="den-bio">' +
      '<b>' + esc(displayName(s)) + '</b> — ' + esc(p.persona) + '<br>' +
      'Species: <b>' + p.sp + '</b> · Signature trait: <b>' + p.trait + '</b><br>' +
      'Favourite treat: <b>' + TREATS[p.fav] + ' ' + p.fav + '</b> · Known you <b>' + days + '</b> day' + (days === 1 ? '' : 's') + '<br>' +
      'Your most-played game: <b>' + esc(favGame()) + '</b> · Companions adopted: <b>' + s.adopted.length + '/' + PET_ORDER.length + '</b>' +
      '</div></div>';

    html += '</div></div>'; // body, den
    denEl.innerHTML = html;
    wireDen();
  }

  function btn(id, em, label, sub, disabled, on) {
    return '<button class="den-btn' + (on ? ' on' : '') + '" id="' + id + '"' + (disabled ? ' disabled' : '') + '>' +
      '<span class="be">' + em + '</span>' + label + (sub ? '<small>' + sub + '</small>' : '') + '</button>';
  }
  function skillCell(s, k, isUlt) {
    var owned = !!s.skills[k.key];
    var reqOk = !k.req || !!s.skills[k.req];
    var can = !owned && reqOk && availSP(s) >= k.cost;
    var cls = owned ? 'owned' : (can ? 'can' : 'locked');
    return '<div class="den-skill ' + cls + (isUlt ? ' ult' : '') + '" data-skill="' + k.key + '">' +
      '<div class="se">' + k.em + '</div><div class="sn">' + (isUlt ? '★ ' : '') + k.name + '</div>' +
      '<div class="sd">' + k.desc + '</div>' +
      '<div class="scost">' + (owned ? '✓ learned' : k.cost + ' pt' + (k.cost === 1 ? '' : 's')) + '</div></div>';
  }

  function wireDen() {
    var q = function (id) { return denEl.querySelector('#' + id); };
    var on = function (id, fn) { var el = q(id); if (el) el.onclick = fn; };
    on('den-x', closeDen); on('den-rename', actRename); on('den-sound', actSound);
    on('den-pet-btn', actPet); on('den-feed', function () { actFeed(false); }); on('den-fav', function () { actFeed(true); });
    on('den-rest', actRest); on('den-fetch', actFetch); on('den-trick', actTrick); on('den-daily', actDaily);
    var pet = q('den-pet'); if (pet) pet.onclick = actPet;
    Array.prototype.forEach.call(denEl.querySelectorAll('[data-skill]'), function (c) { c.onclick = function () { actSkill(c.getAttribute('data-skill')); }; });
    Array.prototype.forEach.call(denEl.querySelectorAll('[data-acc]'), function (c) { c.onclick = function () { actAcc(c.getAttribute('data-acc')); }; });
    Array.prototype.forEach.call(denEl.querySelectorAll('[data-pet]'), function (c) { c.onclick = function () { actAdopt(c.getAttribute('data-pet')); }; });
    Array.prototype.forEach.call(denEl.querySelectorAll('[data-av]'), function (c) { c.onclick = function () { actAvatar(c.getAttribute('data-av')); }; });
  }

  function refresh() { if (mountCard) renderCard(mountCard, lastStats); if (denEl && !denEl.classList.contains('hidden')) renderDen(); }

  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && denEl && !denEl.classList.contains('hidden')) closeDen(); });

  window.PJCCPet = {
    PETS: PETS, renderCard: renderCard, openDen: openDen, closeDen: closeDen,
    petEmoji: function () { var s = load(); return petEmojiFor(s); },
    mood: function () { return mood(load()); }
  };
})();
