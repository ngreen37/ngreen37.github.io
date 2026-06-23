/* =============================================================================
 * PJCC Operative Profile — shared client module
 * -----------------------------------------------------------------------------
 * One file every game imports. Wraps the Supabase SDK so games never touch SQL.
 *
 *   PJCC.ready                 -> Promise that resolves once init is done
 *   PJCC.enabled               -> true if Supabase keys are configured
 *   PJCC.currentUser()         -> auth user object, or null if guest
 *   PJCC.getProfile()          -> {codename, companion, credits, rank} | null
 *   PJCC.signInMagic(email)    -> sends a magic login link
 *   PJCC.claimCodename(name)   -> creates the profile row after first login
 *   PJCC.signOut()
 *   PJCC.saveScore(game, score, extras)  -> writes score (server if logged in,
 *                                           localStorage fallback if guest)
 *   PJCC.leaderboard(game, {scope:'all'|'daily', seed, limit})
 *   PJCC.onChange(fn)          -> called whenever auth state changes
 *
 * Load order on a page:
 *   <script src="/assets/js/pjcc-config.js"></script>
 *   <script src="/assets/js/pjcc-profile.js"></script>
 * ========================================================================== */
(function () {
  var SDK_URL = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  var cfg = window.PJCC_CONFIG || {};
  var configured =
    cfg.SUPABASE_URL &&
    cfg.SUPABASE_ANON_KEY &&
    cfg.SUPABASE_URL.indexOf('YOUR_') === -1 &&
    cfg.SUPABASE_ANON_KEY.indexOf('YOUR_') === -1;

  var sb = null;            // supabase client
  var profile = null;       // cached profile row
  var listeners = [];

  // Avatar catalogue: key -> emoji. Stored on profile.companion.avatar.
  // The operative's *face* is one of 8 free humans; the companion *pet* is a
  // separate slot (companion.pet) driven by the pet system in pjcc-companion.js.
  // SHOP avatars are bought with credits.
  var AVATARS = {
    'human-1': '🕵️', 'human-2': '🥷', 'human-3': '🤵', 'human-4': '👸',
    'human-5': '🤴', 'human-6': '🧙', 'human-7': '👮', 'human-8': '🧑',
    // legacy free animals (now pets) kept so older profiles still render a face
    'dog-1': '🐕', 'dog-2': '🐩', 'dog-3': '🦮', 'cat-1': '🐈', 'bird-1': '🦜',
    // Quartermaster — chess set
    'pc-knight': '♞', 'pc-bishop': '♝', 'pc-rook': '♜', 'pc-queen': '♛', 'pc-king': '♚',
    // Quartermaster — field specials
    'sp-fox': '🦊', 'sp-owl': '🦉', 'sp-wolf': '🐺', 'sp-eagle': '🦅', 'sp-dragon': '🐉'
  };
  var HUMAN_LABELS = {
    'human-1': 'The Sleuth', 'human-2': 'The Shadow', 'human-3': 'The Agent', 'human-4': 'The Princess',
    'human-5': 'The Heir', 'human-6': 'The Strategist', 'human-7': 'The Warden', 'human-8': 'The Recruit'
  };
  var AVATAR_FREE = ['human-1', 'human-2', 'human-3', 'human-4', 'human-5', 'human-6', 'human-7', 'human-8'];
  var AVATAR_SHOP = [
    { key: 'pc-knight', price: 10 }, { key: 'pc-bishop', price: 10 }, { key: 'pc-rook', price: 15 },
    { key: 'pc-queen', price: 25 }, { key: 'pc-king', price: 40 },
    { key: 'sp-fox', price: 30 }, { key: 'sp-owl', price: 30 }, { key: 'sp-wolf', price: 35 },
    { key: 'sp-eagle', price: 35 }, { key: 'sp-dragon', price: 50 }
  ];

  // Rank ladder by total credits. Each rank unredacts a Subject Zero fragment.
  var RANKS = [
    { name: 'Recruit',          min: 0,    frag: 'SUBJECT ZERO — file sealed. You have just enough clearance to know it exists.' },
    { name: 'Operative',        min: 25,   frag: 'Fragment 1: The first dog through the portal was not the first attempt.' },
    { name: 'Field Agent',      min: 75,   frag: 'Fragment 2: The Checker Town mine shafts were dug looking for something — not for ore.' },
    { name: 'Cipher Clearance', min: 150,  frag: 'Fragment 3: "Princess" is a designation, not a name. There were others before her.' },
    { name: 'Delta Clearance',  min: 300,  frag: 'Fragment 4: The Rival\'s family was relocated to Chess City the same week Subject Zero went quiet.' },
    { name: 'Omega Clearance',  min: 600,  frag: 'Fragment 5: The ferry to Shogi Island only runs for those who already know the way back.' },
    { name: 'Above Omega',      min: 1200, frag: 'Fragment 6: You were never solving the puzzles. The puzzles were measuring you.' }
  ];

  var PJCC = {
    enabled: !!configured,
    ready: null,
    AVATARS: AVATARS,
    AVATAR_ORDER: AVATAR_FREE,
    AVATAR_FREE: AVATAR_FREE,
    AVATAR_SHOP: AVATAR_SHOP,
    HUMAN_LABELS: HUMAN_LABELS,
    RANKS: RANKS,
    currentUser: function () { return sb ? (sb.auth.__user || null) : null; },
    getProfile: function () { return profile; },
    avatarEmoji: function (prof) {
      // A face built in the Identity Forge (companion.look) wins site-wide, so
      // the operative you created shows in the nav, leaderboards and share card.
      var look = prof && prof.companion && prof.companion.look;
      if (look && look.glyph) return look.glyph;
      var key = prof && prof.companion && prof.companion.avatar;
      return AVATARS[key] || AVATARS['human-1'];
    },
    petKey: function (prof) {
      return (prof && prof.companion && prof.companion.pet) || 'dog-1';
    },
    rankFor: function (credits) {
      var r = RANKS[0];
      for (var i = 0; i < RANKS.length; i++) { if ((credits || 0) >= RANKS[i].min) r = RANKS[i]; }
      return r;
    },
    nextRank: function (credits) {
      for (var i = 0; i < RANKS.length; i++) { if ((credits || 0) < RANKS[i].min) return RANKS[i]; }
      return null;
    },
    ownedAvatars: function () {
      var owned = (profile && profile.companion && profile.companion.owned) || [];
      return AVATAR_FREE.concat(owned.filter(function (k) { return AVATAR_FREE.indexOf(k) === -1; }));
    },
    onChange: function (fn) { listeners.push(fn); }
  };
  window.PJCC = PJCC;

  function emit() { listeners.forEach(function (fn) { try { fn(); } catch (e) {} }); }

  // Remember a referral code from the landing URL (?ref=CODENAME) for later.
  try {
    var _ref = new URLSearchParams(location.search).get('ref');
    if (_ref) localStorage.setItem('pjcc.ref', _ref);
  } catch (e) {}

  // --- dynamic SDK loader ----------------------------------------------------
  function loadSDK() {
    return new Promise(function (resolve, reject) {
      if (window.supabase && window.supabase.createClient) return resolve();
      var s = document.createElement('script');
      s.src = SDK_URL;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  async function refreshSession() {
    var res = await sb.auth.getSession();
    var session = res && res.data ? res.data.session : null;
    sb.auth.__user = session ? session.user : null;
    if (sb.auth.__user) { await loadProfile(); } else { profile = null; }
  }

  async function loadProfile() {
    var u = sb.auth.__user;
    if (!u) { profile = null; return null; }
    var r = await sb.from('profiles').select('codename,companion,credits,rank').eq('id', u.id).maybeSingle();
    profile = (r && r.data) ? r.data : null;
    return profile;
  }

  // --- init ------------------------------------------------------------------
  PJCC.ready = (async function () {
    if (!configured) return false;   // keys not set yet -> stay in local-only mode
    try {
      await loadSDK();
      sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
        auth: {
          // Stay-signed-in: the session is written to localStorage and survives
          // reloads + closing the browser; the refresh token is auto-renewed.
          // (Shared across the site + every same-origin game iframe automatically.)
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          // Use the IMPLICIT flow (token in the link) ON PURPOSE: it lets you
          // request a login link on your phone and open it on your PC (or
          // vice-versa). PKCE — the newer supabase-js default — stores a verifier
          // on the requesting device only, which would break that cross-device
          // sign-in we explicitly want to support.
          flowType: 'implicit'
        }
      });
      await refreshSession();
      sb.auth.onAuthStateChange(function () { refreshSession().then(emit); });
      emit();
      return true;
    } catch (e) {
      PJCC.enabled = false;          // SDK failed to load -> graceful fallback
      return false;
    }
  })();

  // --- auth ------------------------------------------------------------------
  PJCC.signInMagic = async function (email) {
    if (!sb) throw new Error('profiles offline');
    return sb.auth.signInWithOtp({
      email: email,
      options: { emailRedirectTo: window.location.href }
    });
  };

  PJCC.signOut = async function () {
    if (!sb) return;
    await sb.auth.signOut();
    profile = null;
    emit();
  };

  PJCC.claimCodename = async function (name) {
    var u = PJCC.currentUser();
    if (!u) throw new Error('not signed in');
    name = String(name || '').trim().slice(0, 24);
    if (!name) throw new Error('codename required');
    var r = await sb.from('profiles').insert({ id: u.id, codename: name }).select().maybeSingle();
    if (r.error) {
      if (r.error.code === '23505') throw new Error('codename taken');   // unique violation
      throw r.error;
    }
    profile = r.data;
    await PJCC.migrateGuest();       // pull any local bests up to the account
    // Redeem a pending referral (awards credits to both, server-side & one-time).
    try {
      var pendingRef = localStorage.getItem('pjcc.ref');
      if (pendingRef && pendingRef !== name) await PJCC.redeemReferral(pendingRef);
      localStorage.removeItem('pjcc.ref');
    } catch (e) {}
    emit();
    return profile;
  };

  // --- scores ----------------------------------------------------------------
  // Local fallback keys mirror the server so guest progress is never lost.
  function localKey(game) { return 'pjcc.best.' + game; }

  PJCC.localBest = function (game) {
    try { return parseInt(localStorage.getItem(localKey(game)), 10) || 0; } catch (e) { return 0; }
  };
  function setLocalBest(game, score) {
    try {
      var cur = PJCC.localBest(game);
      if (score > cur) localStorage.setItem(localKey(game), String(score));
    } catch (e) {}
  }

  /* saveScore(game, score, extras)
   *   extras = { seed, credits, data }
   *   - guest  : updates localStorage best only
   *   - account: appends to scores, upserts best in game_stats, grants credits  */
  PJCC.saveScore = async function (game, score, extras) {
    extras = extras || {};
    score = parseInt(score, 10) || 0;
    setLocalBest(game, score);                         // always keep a local copy
    try { PJCC.touchStreak(); } catch (e) {}           // any play keeps the daily flame alive

    var u = PJCC.currentUser();
    if (!sb || !u) return { saved: 'local' };

    try {
      // 1. leaderboard row
      await sb.from('scores').insert({ user_id: u.id, game: game, score: score, seed: extras.seed || null });

      // 2. best + play count
      var cur = await sb.from('game_stats').select('best_score,plays,data').eq('user_id', u.id).eq('game', game).maybeSingle();
      var prev = (cur && cur.data) ? cur.data : { best_score: 0, plays: 0, data: {} };
      await sb.from('game_stats').upsert({
        user_id: u.id, game: game,
        best_score: Math.max(prev.best_score || 0, score),
        plays: (prev.plays || 0) + 1,
        data: extras.data || prev.data || {},
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,game' });

      // 3. credits (atomic via RPC) — doubled when this is the weekly bounty game
      if (extras.credits) {
        var award = extras.credits * (PJCC.bountyGame() === game ? 2 : 1);
        var cr = await sb.rpc('add_credits', { amount: award });
        if (!cr.error && typeof cr.data === 'number' && profile) profile.credits = cr.data;
      }
      emit();
      return { saved: 'server' };
    } catch (e) {
      return { saved: 'local', error: e };
    }
  };

  // Push any guest localStorage bests into game_stats once an account exists.
  PJCC.migrateGuest = async function () {
    var u = PJCC.currentUser();
    if (!sb || !u) return;
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key && key.indexOf('pjcc.best.') === 0) {
          var game = key.slice('pjcc.best.'.length);
          var best = parseInt(localStorage.getItem(key), 10) || 0;
          if (best > 0) await PJCC.saveScore(game, best, {});
        }
      }
    } catch (e) {}
  };

  // --- profile / companion ---------------------------------------------------
  // Merge a patch into the companion jsonb (avatar, owned[], etc.) and persist.
  async function updateCompanion(patch) {
    var u = PJCC.currentUser();
    if (!sb || !u) throw new Error('not signed in');
    var comp = Object.assign({}, (profile && profile.companion) || {}, patch);
    var r = await sb.from('profiles')
      .update({ companion: comp, updated_at: new Date().toISOString() })
      .eq('id', u.id).select().maybeSingle();
    if (r.error) throw r.error;
    profile = r.data;
    emit();
    return profile;
  }

  PJCC.setAvatar = async function (key) {
    if (!AVATARS[key]) throw new Error('unknown avatar');
    if (PJCC.ownedAvatars().indexOf(key) === -1) throw new Error('avatar not owned');
    return updateCompanion({ avatar: key });
  };

  // Persist the active pet (the full pet experience lives in pjcc-companion.js;
  // here we only store which one follows the operative across devices).
  PJCC.setPet = async function (key) { return updateCompanion({ pet: key }); };

  // Persist the full operative look built in the Identity Forge (pjcc-creator.js).
  // Stored as companion.look = { base, tone, glyph, aura, hat, emblem, name, role, bio }.
  // glyph is the resolved emoji so avatarEmoji() can render it without the catalogue.
  PJCC.setLook = async function (look) { return updateCompanion({ look: look || {} }); };

  // --- credits / store -------------------------------------------------------
  // Deduct credits atomically (add_credits RPC with a negative amount).
  PJCC.spendCredits = async function (amount) {
    var u = PJCC.currentUser();
    if (!sb || !u) throw new Error('not signed in');
    if (!profile || profile.credits < amount) throw new Error('not enough credits');
    var cr = await sb.rpc('add_credits', { amount: -Math.abs(amount) });
    if (cr.error) throw cr.error;
    if (typeof cr.data === 'number') profile.credits = cr.data;
    emit();
    return profile.credits;
  };

  PJCC.buyAvatar = async function (key) {
    var item = AVATAR_SHOP.filter(function (s) { return s.key === key; })[0];
    if (!item) throw new Error('not for sale');
    if (PJCC.ownedAvatars().indexOf(key) !== -1) throw new Error('already owned');
    await PJCC.spendCredits(item.price);
    var owned = ((profile.companion && profile.companion.owned) || []).slice();
    owned.push(key);
    return updateCompanion({ owned: owned, avatar: key });   // buy + equip
  };

  // All of my game_stats rows (per-game bests + play counts).
  PJCC.myStats = async function () {
    var u = PJCC.currentUser();
    if (!sb || !u) return [];
    var r = await sb.from('game_stats').select('game,best_score,plays,data,updated_at').eq('user_id', u.id);
    return (r && r.data) ? r.data : [];
  };

  // --- mailing list ----------------------------------------------------------
  // Insert-only (RLS); duplicate email is treated as success.
  PJCC.subscribe = async function (email) {
    if (!sb) throw new Error('offline');
    email = String(email || '').trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('invalid email');
    var r = await sb.from('subscribers').insert({ email: email });
    if (r.error && r.error.code !== '23505') throw r.error;  // 23505 = already subscribed
    return { ok: true, already: !!(r.error && r.error.code === '23505') };
  };

  // --- leaderboards ----------------------------------------------------------
  // Daily / raw scores board (one row per play; used for date-seeded boards).
  PJCC.leaderboard = async function (game, opts) {
    opts = opts || {};
    if (!sb) return [];
    var q = sb.from('scores').select('score,created_at,profiles(codename,companion)').eq('game', game);
    if (opts.scope === 'daily' && opts.seed) q = q.eq('seed', opts.seed);
    q = q.order('score', { ascending: false }).limit(opts.limit || 10);
    var r = await q;
    if (r.error || !r.data) return [];
    return r.data.map(function (row) {
      return { score: row.score, codename: row.profiles ? row.profiles.codename : 'unknown',
               companion: row.profiles ? row.profiles.companion : null };
    });
  };

  // All-time per-game board: best score per operative (from game_stats).
  // Paginated via offset/limit (range), with a stable secondary sort.
  PJCC.gameLeaderboard = async function (game, limit, offset) {
    if (!sb) return [];
    limit = limit || 25; offset = offset || 0;
    var r = await sb.from('game_stats')
      .select('best_score,plays,updated_at,profiles(codename,companion)')
      .eq('game', game)
      .order('best_score', { ascending: false })
      .order('updated_at', { ascending: true })
      .range(offset, offset + limit - 1);
    if (r.error || !r.data) return [];
    return r.data.map(function (row) {
      return { score: row.best_score, plays: row.plays,
               codename: row.profiles ? row.profiles.codename : 'unknown',
               companion: row.profiles ? row.profiles.companion : null };
    });
  };

  // Cumulative board: operatives ranked by total credits earned everywhere.
  PJCC.cumulativeLeaderboard = async function (limit, offset) {
    if (!sb) return [];
    limit = limit || 25; offset = offset || 0;
    var r = await sb.from('profiles')
      .select('codename,credits,rank,companion')
      .order('credits', { ascending: false })
      .order('codename', { ascending: true })
      .range(offset, offset + limit - 1);
    if (r.error || !r.data) return [];
    return r.data;
  };

  // ===========================================================================
  // Progression: companion levels, achievements, world map, titles, referral
  // ===========================================================================

  // --- companion levels (XP = total rounds played, a monotonic stat) ---------
  var LEVELS = [
    { lvl: 1, at: 0,   stage: 'Stray' },
    { lvl: 2, at: 5,   stage: 'Recruit Pup' },
    { lvl: 3, at: 15,  stage: 'Scout' },
    { lvl: 4, at: 30,  stage: 'Tracker' },
    { lvl: 5, at: 55,  stage: 'Pathfinder' },
    { lvl: 6, at: 90,  stage: 'Vanguard' },
    { lvl: 7, at: 140, stage: 'Champion' },
    { lvl: 8, at: 210, stage: 'Legend of the Board' }
  ];
  PJCC.LEVELS = LEVELS;
  PJCC.companionLevel = function (plays) {
    plays = plays || 0;
    var cur = LEVELS[0], nxt = null;
    for (var i = 0; i < LEVELS.length; i++) {
      if (plays >= LEVELS[i].at) cur = LEVELS[i];
      else { nxt = LEVELS[i]; break; }
    }
    return { level: cur.lvl, stage: cur.stage, into: plays - cur.at, span: nxt ? nxt.at - cur.at : 0, next: nxt };
  };

  function statsCtx(prof, stats) {
    var map = {}; (stats || []).forEach(function (s) { map[s.game] = s; });
    return {
      profile: prof, credits: (prof && prof.credits) || 0,
      totalPlays: (stats || []).reduce(function (a, s) { return a + (s.plays || 0); }, 0),
      best: function (g) { return map[g] ? (map[g].best_score || 0) : 0; },
      played: function (g) { return !!(map[g] && map[g].plays > 0); }
    };
  }

  // --- achievements ----------------------------------------------------------
  var ACHIEVEMENTS = [
    { key: 'first-contact', icon: '📡', label: 'First Contact',  desc: 'Claim your codename',            test: function (c) { return !!c.profile; } },
    { key: 'tactician',     icon: '⚔', label: 'Tactician',      desc: 'Solve 5+ in Fork in the Road',  test: function (c) { return c.best('fork-in-the-road') >= 5; } },
    { key: 'deep-miner',    icon: '⛏', label: 'Deep Miner',     desc: 'Reach 100m in Sand Mine Depths',test: function (c) { return c.best('sand-mine-depths') >= 100; } },
    { key: 'analyst',       icon: 'Δ', label: 'Analyst',        desc: 'Score 500+ in Clearance: DELTA',test: function (c) { return c.best('clearance-delta') >= 500; } },
    { key: 'on-the-beat',   icon: '♫', label: 'On the Beat',    desc: 'Score 1000+ in Notation Blitz', test: function (c) { return c.best('notation-run') >= 1000; } },
    { key: 'shogi-scholar', icon: '将', label: 'Shogi Scholar',  desc: 'Read 9/10 on Shogi Island',     test: function (c) { return c.best('shogi-island') >= 9; } },
    { key: 'globetrotter',  icon: '🗺', label: 'Globetrotter',   desc: 'Play every game at least once',  test: function (c) { return WORLDMAP.every(function (s) { return !s.game || c.played(s.game); }); } },
    { key: 'dedicated',     icon: '🔥', label: 'Dedicated',      desc: 'Play 50 rounds total',          test: function (c) { return c.totalPlays >= 50; } },
    { key: 'collector',     icon: '🛒', label: 'Collector',      desc: 'Own a Shopkeeper avatar',       test: function (c) { return !!(c.profile.companion && (c.profile.companion.owned || []).length); } }
  ];
  PJCC.ACHIEVEMENTS = ACHIEVEMENTS;
  PJCC.earnedAchievements = function (prof, stats) {
    var c = statsCtx(prof, stats);
    return ACHIEVEMENTS.map(function (a) { return { key: a.key, icon: a.icon, label: a.label, desc: a.desc, earned: !!a.test(c) }; });
  };

  // --- world map (game completion -> Princess's journey) ---------------------
  var WORLDMAP = [
    { name: 'Checker Town',     game: 'notation-run' },
    { name: 'The Sand Mines',   game: 'sand-mine-depths' },
    { name: 'Fork in the Road', game: 'fork-in-the-road' },
    { name: 'Clearance HQ',     game: 'clearance-delta' },
    { name: 'Pirc Crossing',    game: 'pirc-protocol' },
    { name: 'Shogi Island',     game: 'shogi-island' },
    { name: 'Chess City',       game: null }
  ];
  PJCC.WORLDMAP = WORLDMAP;
  PJCC.worldProgress = function (stats) {
    var c = statsCtx(profile, stats);
    var stops = WORLDMAP.map(function (s) { return { name: s.name, game: s.game, reached: s.game ? c.played(s.game) : false }; });
    stops[stops.length - 1].reached = stops.filter(function (s) { return s.game; }).every(function (s) { return s.reached; });
    var furthest = -1; stops.forEach(function (s, i) { if (s.reached) furthest = i; });
    return { stops: stops, furthest: furthest };
  };

  // --- titles (flair shown by your codename) ---------------------------------
  var TITLES = {
    'rookie':    { label: 'Rookie',              rule: 'free' },
    'regular':   { label: 'Regular',             rule: 'plays:25' },
    'veteran':   { label: 'Veteran',             rule: 'plays:75' },
    'tactician': { label: 'Tactician',           rule: 'ach:tactician' },
    'miner':     { label: 'Mine Survivor',       rule: 'ach:deep-miner' },
    'sensei':    { label: 'Shogi Sensei',        rule: 'ach:shogi-scholar' },
    'curator':   { label: 'Curator',             rule: 'buy:20' },
    'legend':    { label: 'Legend of the Board', rule: 'buy:60' }
  };
  PJCC.TITLES = TITLES;
  PJCC.TITLE_SHOP = [{ key: 'curator', price: 20 }, { key: 'legend', price: 60 }];
  PJCC.unlockedTitles = function (prof, stats) {
    var c = statsCtx(prof, stats);
    var earned = {}; PJCC.earnedAchievements(prof, stats).forEach(function (a) { if (a.earned) earned[a.key] = true; });
    var ownedTitles = (prof && prof.companion && prof.companion.owned_titles) || [];
    return Object.keys(TITLES).filter(function (key) {
      var rule = TITLES[key].rule;
      if (rule === 'free') return true;
      if (rule.indexOf('plays:') === 0) return c.totalPlays >= parseInt(rule.slice(6), 10);
      if (rule.indexOf('ach:') === 0) return !!earned[rule.slice(4)];
      if (rule.indexOf('buy:') === 0) return ownedTitles.indexOf(key) !== -1;
      return false;
    });
  };
  PJCC.titleLabel = function (prof) {
    var key = prof && prof.companion && prof.companion.title;
    return (key && TITLES[key]) ? TITLES[key].label : '';
  };
  PJCC.setTitle = function (key) {
    if (key && !TITLES[key]) throw new Error('unknown title');
    return updateCompanion({ title: key || null });
  };
  PJCC.buyTitle = async function (key) {
    var item = PJCC.TITLE_SHOP.filter(function (t) { return t.key === key; })[0];
    if (!item) throw new Error('not for sale');
    var ownedTitles = (profile.companion && profile.companion.owned_titles) || [];
    if (ownedTitles.indexOf(key) !== -1) throw new Error('already owned');
    await PJCC.spendCredits(item.price);
    return updateCompanion({ owned_titles: ownedTitles.concat([key]), title: key });
  };

  // --- referral --------------------------------------------------------------
  PJCC.inviteLink = function (prof) {
    var code = (prof && prof.codename) ? prof.codename : '';
    return code ? (location.origin + '/?ref=' + encodeURIComponent(code)) : '';
  };
  PJCC.redeemReferral = async function (refCodename) {
    if (!sb || !PJCC.currentUser()) return { ok: false };
    refCodename = String(refCodename || '').trim();
    if (!refCodename) return { ok: false };
    try {
      var r = await sb.rpc('redeem_referral', { ref_codename: refCodename });
      if (r.error) return { ok: false, error: r.error };
      await loadProfile(); emit();
      return { ok: true, result: r.data };
    } catch (e) { return { ok: false, error: e }; }
  };

  // --- weekly bounty (one game per week pays 2x credits) ---------------------
  PJCC.BOUNTY_GAMES = ['clearance-delta', 'notation-run', 'fork-in-the-road', 'sand-mine-depths', 'pirc-protocol', 'shogi-island', 'tower-defense', 'sky-run'];
  PJCC.bountyGame = function () {
    var now = new Date();
    var week = Math.floor((now - new Date(now.getFullYear(), 0, 1)) / (7 * 24 * 3600 * 1000));
    return PJCC.BOUNTY_GAMES[week % PJCC.BOUNTY_GAMES.length];
  };

  // --- daily-active streak (the cross-game "flame": consecutive days you played) ---
  // Local-first so it works for guests; mirrors to the profile when signed in.
  var STREAK_KEY = 'pjcc.streak';
  function dayStamp(d) { d = d || new Date(); return d.getFullYear() + '-' + ('0'+(d.getMonth()+1)).slice(-2) + '-' + ('0'+d.getDate()).slice(-2); }
  PJCC.dayStamp = dayStamp;
  function loadStreak() { try { return JSON.parse(localStorage.getItem(STREAK_KEY)) || { current: 0, best: 0, last: '' }; } catch (e) { return { current: 0, best: 0, last: '' }; } }
  PJCC.touchStreak = function () {
    var s = loadStreak(), today = dayStamp();
    if (s.last === today) return s;                    // already counted today
    var y = new Date(); y.setDate(y.getDate() - 1);
    s.current = (s.last === dayStamp(y)) ? (s.current + 1) : 1;   // consecutive or reset to 1
    s.best = Math.max(s.best || 0, s.current);
    s.last = today;
    try { localStorage.setItem(STREAK_KEY, JSON.stringify(s)); } catch (e) {}
    return s;
  };
  PJCC.streakInfo = function () {
    var s = loadStreak(), today = dayStamp();
    var y = new Date(); y.setDate(y.getDate() - 1);
    // a streak only counts as "alive" if the last active day was today or yesterday
    var alive = (s.last === today || s.last === dayStamp(y));
    return { current: alive ? (s.current || 0) : 0, best: s.best || 0, last: s.last || '', playedToday: s.last === today };
  };

  // --- "Beat the Creator" ghost scores -------------------------------------------
  // Nate's own marks, posted as the target to chase. Units match each leaderboard.
  // Update these as the creator sets new personal bests.
  var GHOSTS = {
    'clearance-delta': 850, 'notation-run': 1500, 'fork-in-the-road': 18,
    'sand-mine-depths': 140, 'pirc-protocol': 7, 'shogi-island': 40, 'blindfold': 12,
    'tower-defense': 4200, 'siege-endless': 22, 'sky-run': 9000, 'daily-dispatch': 100,
    'dungeon': 6, 'reading-room': 160, 'knights-tour': 1400, 'battle-room': 1200
  };
  PJCC.GHOSTS = GHOSTS;
  PJCC.ghostFor = function (game) { return (typeof GHOSTS[game] === 'number') ? GHOSTS[game] : null; };
  // Compare a score to the creator's ghost: {target, beat, delta} or null if no ghost.
  PJCC.vsGhost = function (game, score) {
    var t = PJCC.ghostFor(game); if (t === null) return null;
    return { target: t, beat: (score || 0) >= t, delta: (score || 0) - t };
  };

  // --- Seasons / Tours (monthly legs of the Journey to Chess City) ----------------
  var SEASON_NAMES = [
    'Checker Town Open', 'Sand Mine Circuit', 'The Fork Trials', 'Dead Drop Season',
    'Delta Clearance Cup', 'Pirc Crossing Tour', 'Shogi Island Invitational', 'Chess City Masters',
    'Journey Road Rally', 'Quartermaster Classic', 'Royal Decree Series', "Founder's Finale"
  ];
  PJCC.seasonInfo = function (when) {
    var d = when || new Date();
    var y = d.getFullYear(), m = d.getMonth();           // 0..11
    var idx = (y * 12 + m);
    var name = SEASON_NAMES[m % SEASON_NAMES.length];
    var monthEnd = new Date(y, m + 1, 1);
    var daysLeft = Math.ceil((monthEnd - d) / 86400000);
    var id = y + '-' + ('0'+(m+1)).slice(-2);            // e.g. 2026-06 — usable as a score seed
    return { id: id, index: idx, name: name + ' ' + y, shortName: name, year: y, month: m + 1, daysLeft: daysLeft };
  };

  // Season race: this month's standings, tallied from scores posted since the 1st.
  // Date-bounded, so it auto-resets every month with no server changes. Returns
  // [{codename, companion, plays, points}] ranked by activity then points.
  PJCC.seasonRace = async function (limit) {
    if (!sb) return [];
    var s = PJCC.seasonInfo();
    var monthStart = new Date(s.year, s.month - 1, 1).toISOString();
    var r = await sb.from('scores')
      .select('score,created_at,profiles(codename,companion)')
      .gte('created_at', monthStart)
      .order('created_at', { ascending: false })
      .limit(2000);
    if (r.error || !r.data) return [];
    var tally = {};
    r.data.forEach(function (row) {
      var name = row.profiles ? row.profiles.codename : null; if (!name) return;
      if (!tally[name]) tally[name] = { codename: name, companion: row.profiles.companion, plays: 0, points: 0 };
      tally[name].plays += 1; tally[name].points += (row.score || 0);
    });
    return Object.keys(tally).map(function (k) { return tally[k]; })
      .sort(function (a, b) { return (b.plays - a.plays) || (b.points - a.points); })
      .slice(0, limit || 25);
  };

  // Hall of Fame: past season champions. Add an entry here at the close of each
  // season (newest first). season = "Mon YYYY" label; champ = winning codename.
  PJCC.HALL_OF_FAME = [
    // { season: 'May 2026', tour: 'Sand Mine Circuit', champ: 'CODENAME', note: 'First champion of the Journey.' }
  ];

  // --- companion pet-mood (decays with time since last played) ---------------
  PJCC.petMood = function (stats) {
    var last = 0;
    (stats || []).forEach(function (s) { var t = s.updated_at ? Date.parse(s.updated_at) : 0; if (t > last) last = t; });
    if (!last) return { state: 'New', emoji: '🥚', line: 'Your companion is waiting for its first adventure.' };
    var hrs = (Date.now() - last) / 3600000;
    if (hrs < 24)  return { state: 'Happy',   emoji: '💛', line: 'Bright-eyed and ready — you played recently.' };
    if (hrs < 72)  return { state: 'Content', emoji: '🙂', line: "Doing fine, but wouldn't mind a round." };
    if (hrs < 168) return { state: 'Lonely',  emoji: '🥺', line: 'Misses you. A game would cheer it up.' };
    return { state: 'Restless', emoji: '😔', line: "It's been a while. Play a round to lift its spirits." };
  };

  // --- profile themes (cosmetic accent for the Dossier) ----------------------
  var THEMES = {
    'default': { label: 'Operative Gold',   price: 0,  accent: '#F5C518', bg: 'linear-gradient(135deg,#1f1147,#34206f)' },
    'jade':    { label: 'Jade Dispatch',    price: 15, accent: '#6bffb8', bg: 'linear-gradient(135deg,#0f2a22,#143d31)' },
    'crimson': { label: 'Red Clearance',    price: 15, accent: '#ff6b6b', bg: 'linear-gradient(135deg,#2a0d12,#1a090c)' },
    'sakura':  { label: 'Shogi Sakura',     price: 25, accent: '#ff8fd0', bg: 'linear-gradient(135deg,#2a1030,#3d1640)' },
    'mono':    { label: 'Classified Mono',  price: 25, accent: '#cdbcf2', bg: 'linear-gradient(135deg,#16161c,#27272f)' }
  };
  PJCC.THEMES = THEMES;
  PJCC.THEME_SHOP = ['jade', 'crimson', 'sakura', 'mono'];
  PJCC.themeFor = function (prof) { var k = prof && prof.companion && prof.companion.theme; return THEMES[k] || THEMES['default']; };
  PJCC.ownedThemes = function (prof) { return ['default'].concat((prof && prof.companion && prof.companion.owned_themes) || []); };
  var SKIN_KEY = 'pjcc.skin';
  PJCC.setTheme = function (key) {
    if (key && !THEMES[key]) throw new Error('unknown theme');
    try { localStorage.setItem(SKIN_KEY, key || 'default'); } catch (e) {}   // cache so games + guests can read it
    return updateCompanion({ theme: key || 'default' });
  };
  // The skin to use inside a game: cached local choice, else the signed-in profile's theme.
  PJCC.localTheme = function () {
    var k = null;
    try { k = localStorage.getItem(SKIN_KEY); } catch (e) {}
    if (!k && profile && profile.companion) k = profile.companion.theme;
    return THEMES[k] || THEMES['default'];
  };
  // Board skins in games: paint the chosen accent into a game's CSS variables.
  // Call once at boot, e.g. PJCC.applyGameSkin(['--gold']) or with an element root.
  PJCC.applyGameSkin = function (vars, root) {
    try {
      var t = PJCC.localTheme();
      var el = root || document.documentElement;
      el.style.setProperty('--pjcc-skin', t.accent);
      if (t !== THEMES['default']) (vars || []).forEach(function (v) { el.style.setProperty(v, t.accent); });   // only override when a skin is actually chosen
      return t;
    } catch (e) { return null; }
  };
  PJCC.buyTheme = async function (key) {
    var t = THEMES[key];
    if (!t || !t.price) throw new Error('not for sale');
    var owned = (profile.companion && profile.companion.owned_themes) || [];
    if (owned.indexOf(key) !== -1) throw new Error('already owned');
    await PJCC.spendCredits(t.price);
    return updateCompanion({ owned_themes: owned.concat([key]), theme: key });
  };
})();
