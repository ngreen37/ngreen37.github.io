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
  var AVATARS = {
    'human-1': '🧑', 'human-2': '👨', 'human-3': '👩',
    'dog-1': '🐕', 'dog-2': '🐩', 'dog-3': '🦮',
    'cat-1': '🐈', 'bird-1': '🦜'
  };

  var PJCC = {
    enabled: !!configured,
    ready: null,
    AVATARS: AVATARS,
    AVATAR_ORDER: ['human-1', 'human-2', 'human-3', 'dog-1', 'dog-2', 'dog-3', 'cat-1', 'bird-1'],
    currentUser: function () { return sb ? (sb.auth.__user || null) : null; },
    getProfile: function () { return profile; },
    avatarEmoji: function (prof) {
      var key = prof && prof.companion && prof.companion.avatar;
      return AVATARS[key] || '◆';
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

  // --- avatar ----------------------------------------------------------------
  PJCC.setAvatar = async function (key) {
    var u = PJCC.currentUser();
    if (!sb || !u) throw new Error('not signed in');
    if (!AVATARS[key]) throw new Error('unknown avatar');
    var comp = Object.assign({}, (profile && profile.companion) || {}, { avatar: key });
    var r = await sb.from('profiles')
      .update({ companion: comp, updated_at: new Date().toISOString() })
      .eq('id', u.id).select().maybeSingle();
    if (r.error) throw r.error;
    profile = r.data;
    emit();
    return profile;
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
  PJCC.gameLeaderboard = async function (game, limit) {
    if (!sb) return [];
    var r = await sb.from('game_stats')
      .select('best_score,plays,profiles(codename,companion)')
      .eq('game', game).order('best_score', { ascending: false }).limit(limit || 25);
    if (r.error || !r.data) return [];
    return r.data.map(function (row) {
      return { score: row.best_score, plays: row.plays,
               codename: row.profiles ? row.profiles.codename : 'unknown',
               companion: row.profiles ? row.profiles.companion : null };
    });
  };

  // Cumulative board: operatives ranked by total credits earned everywhere.
  PJCC.cumulativeLeaderboard = async function (limit) {
    if (!sb) return [];
    var r = await sb.from('profiles')
      .select('codename,credits,rank,companion')
      .order('credits', { ascending: false }).limit(limit || 25);
    if (r.error || !r.data) return [];
    return r.data;
  };
})();
