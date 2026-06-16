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
  // FREE starters everyone owns; SHOP avatars are bought with credits.
  var AVATARS = {
    'human-1': '🧑', 'human-2': '👨', 'human-3': '👩',
    'dog-1': '🐕', 'dog-2': '🐩', 'dog-3': '🦮',
    'cat-1': '🐈', 'bird-1': '🦜',
    // Quartermaster — chess set
    'pc-knight': '♞', 'pc-bishop': '♝', 'pc-rook': '♜', 'pc-queen': '♛', 'pc-king': '♚',
    // Quartermaster — field specials
    'sp-fox': '🦊', 'sp-owl': '🦉', 'sp-wolf': '🐺', 'sp-eagle': '🦅', 'sp-dragon': '🐉'
  };
  var AVATAR_FREE = ['human-1', 'human-2', 'human-3', 'dog-1', 'dog-2', 'dog-3', 'cat-1', 'bird-1'];
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
    RANKS: RANKS,
    currentUser: function () { return sb ? (sb.auth.__user || null) : null; },
    getProfile: function () { return profile; },
    avatarEmoji: function (prof) {
      var key = prof && prof.companion && prof.companion.avatar;
      return AVATARS[key] || '◆';
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
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
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
    if (r.error) throw r.error;
    profile = r.data;
    await PJCC.migrateGuest();       // pull any local bests up to the account
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

      // 3. credits (atomic via RPC)
      if (extras.credits) {
        var cr = await sb.rpc('add_credits', { amount: extras.credits });
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
    var r = await sb.from('game_stats').select('game,best_score,plays,data').eq('user_id', u.id);
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
})();
