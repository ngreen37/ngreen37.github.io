---
layout: page
title: Supabase Healthcheck
permalink: /supabase-check/
brand: mcpuppy
---

<div class="hc-head">
  <p class="hc-eyebrow">◈ Operative systems — diagnostic</p>
  <h1>Supabase Healthcheck</h1>
  <p class="hc-sub">Tests the live database the way the games do — schema, foreign keys, and the credit/referral functions. Read-only, uses the public key, never writes. If everything's green, accounts &amp; leaderboards will work.</p>
  <button class="hc-run" id="hc-run" type="button">Run the checks ▸</button>
</div>

<div class="hc-list" id="hc-list"></div>

<div class="hc-manual">
  <h2>One thing this can't auto-test: Auth URL config</h2>
  <p>The sign-in link is the one piece a script can't check for you. In the Supabase dashboard → <b>Authentication → URL Configuration</b>, confirm:</p>
  <ul>
    <li><b>Site URL</b> = <code>https://mcpuppystudios.com</code></li>
    <li><b>Redirect URLs</b> includes <code>https://mcpuppystudios.com/**</code></li>
  </ul>
  <p class="hc-muted">If those are wrong, sign-in <em>looks</em> like it works but the email link bounces you out / lands you logged-out — the classic "it forgot me" bug.</p>
</div>

<style>
  .hc-head { max-width: 720px; }
  .hc-eyebrow { font-family: 'Share Tech Mono', monospace; font-size: 0.72rem; letter-spacing: 0.2em; text-transform: uppercase; color: #9a8fc0; }
  .hc-head h1 { color: #fff; font-size: 2rem; margin: 0.2rem 0 0.5rem; }
  .hc-sub { color: #cdbcf2; line-height: 1.6; }
  .hc-run { background: #F5C518; color: #1a0f3d; font-weight: 800; font-size: 1rem; border: none;
    border-radius: 999px; padding: 11px 26px; cursor: pointer; font-family: inherit; margin-top: 6px; }
  .hc-run:hover { background: #ffd740; }
  .hc-run:disabled { opacity: 0.5; cursor: default; }
  .hc-list { max-width: 720px; margin: 1.4rem 0; display: flex; flex-direction: column; gap: 8px; }
  .hc-row { display: flex; gap: 12px; align-items: flex-start; background: rgba(45,27,105,0.4);
    border: 1px solid #3a2a6a; border-left-width: 3px; border-radius: 10px; padding: 12px 14px; }
  .hc-row.ok { border-left-color: #6bffb8; }
  .hc-row.bad { border-left-color: #ff6b6b; }
  .hc-row.run { border-left-color: #9fe8ff; }
  .hc-ico { font-size: 1.1rem; line-height: 1.5; flex-shrink: 0; }
  .hc-body { flex: 1; min-width: 0; }
  .hc-label { color: #f0e6ff; font-weight: 700; font-size: 0.92rem; }
  .hc-detail { color: #b9a8e0; font-size: 0.8rem; margin-top: 2px; word-break: break-word; }
  .hc-detail code { background: rgba(0,0,0,0.3); padding: 1px 5px; border-radius: 4px; font-size: 0.92em; }
  .hc-hint { color: #ffc9a0; font-size: 0.8rem; margin-top: 4px; }
  .hc-summary { font-weight: 800; font-size: 1.05rem; padding: 12px 14px; border-radius: 10px; }
  .hc-summary.ok { color: #6bffb8; background: rgba(107,255,184,0.08); border: 1px solid #2f6b50; }
  .hc-summary.bad { color: #ff9a9a; background: rgba(255,107,107,0.08); border: 1px solid #6b2f2f; }
  .hc-manual { max-width: 720px; background: rgba(45,27,105,0.3); border: 1px solid #3a2a6a;
    border-radius: 12px; padding: 16px 20px; margin-top: 1.6rem; }
  .hc-manual h2 { color: #F5C518; font-size: 1.05rem; margin: 0 0 8px; }
  .hc-manual p, .hc-manual li { color: #cdbcf2; line-height: 1.6; }
  .hc-manual code { background: rgba(0,0,0,0.3); padding: 1px 6px; border-radius: 4px; color: #9fe8ff; }
  .hc-muted { color: #9a8fc0; font-size: 0.86rem; }
</style>

<script src="{{ '/assets/js/pjcc-config.js' | relative_url }}"></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script>
(function () {
  var listEl = document.getElementById('hc-list');
  var runBtn = document.getElementById('hc-run');
  var sb = null;

  function row(state, label, detail, hint) {
    var ico = state === 'ok' ? '✓' : (state === 'bad' ? '✗' : '…');
    var el = document.createElement('div');
    el.className = 'hc-row ' + state;
    el.innerHTML = '<span class="hc-ico">' + ico + '</span><div class="hc-body">' +
      '<div class="hc-label">' + label + '</div>' +
      (detail ? '<div class="hc-detail">' + detail + '</div>' : '') +
      (hint ? '<div class="hc-hint">↳ ' + hint + '</div>' : '') + '</div>';
    listEl.appendChild(el);
    return el;
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }

  // Each check: async function returning { ok, detail, hint }.
  var checks = [
    { name: 'Config — project URL & public key are set', run: function () {
        var c = window.PJCC_CONFIG || {};
        var bad = !c.SUPABASE_URL || !c.SUPABASE_ANON_KEY || /YOUR_|xxxx/i.test(c.SUPABASE_URL + c.SUPABASE_ANON_KEY);
        return Promise.resolve({ ok: !bad, detail: bad ? 'pjcc-config.js is missing real values.' : esc(c.SUPABASE_URL),
          hint: bad ? 'Fill SUPABASE_URL + SUPABASE_ANON_KEY in assets/js/pjcc-config.js.' : '' });
      } },
    { name: 'Library — supabase-js loaded & client created', run: function () {
        if (!window.supabase || !window.supabase.createClient) return Promise.resolve({ ok: false, detail: 'supabase-js did not load (network/CDN blocked?).' });
        sb = window.supabase.createClient(PJCC_CONFIG.SUPABASE_URL, PJCC_CONFIG.SUPABASE_ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
        return Promise.resolve({ ok: true, detail: 'Client ready (read-only, no session).' });
      } },
    { name: "profiles table — all 4 columns (codename, companion, credits, rank)", run: function () {
        return sb.from('profiles').select('codename,companion,credits,rank').limit(1).then(function (r) {
          if (r.error) return { ok: false, detail: esc(r.error.message), hint: 'A column is missing — re-run docs/supabase-setup.sql (section 1).' };
          return { ok: true, detail: 'All four columns present & readable.' };
        });
      } },
    { name: "scores → profiles foreign key (leaderboard names)", run: function () {
        return sb.from('scores').select('score,profiles(codename)').limit(1).then(function (r) {
          if (r.error) return { ok: false, detail: esc(r.error.message), hint: 'FK scores.user_id → profiles.id missing. Re-run setup SQL (section 3).' };
          return { ok: true, detail: 'Embedded profile join resolves — names will show, not "unknown".' };
        });
      } },
    { name: "game_stats → profiles foreign key", run: function () {
        return sb.from('game_stats').select('best_score,profiles(codename)').limit(1).then(function (r) {
          if (r.error) return { ok: false, detail: esc(r.error.message), hint: 'FK game_stats.user_id → profiles.id missing. Re-run setup SQL (section 2).' };
          return { ok: true, detail: 'Embedded profile join resolves.' };
        });
      } },
    { name: "add_credits() function exists", run: function () {
        return sb.rpc('add_credits', { amount: 0 }).then(function (r) {
          if (r.error && /PGRST202|find the function/i.test(r.error.message + (r.error.code || ''))) return { ok: false, detail: esc(r.error.message), hint: 'Re-run setup SQL (section 5).' };
          return { ok: true, detail: 'Function present (no-op with amount 0).' };
        });
      } },
    { name: "redeem_referral() function exists", run: function () {
        return sb.rpc('redeem_referral', { ref_codename: '__healthcheck__' }).then(function (r) {
          if (r.error && /PGRST202|find the function/i.test(r.error.message + (r.error.code || ''))) return { ok: false, detail: esc(r.error.message), hint: 'Re-run setup SQL (section 7).' };
          return { ok: true, detail: 'Function present (returned "' + esc(r.data) + '" with no auth — expected).' };
        });
      } },
    { name: "subscribers table (mailing list)", run: function () {
        return sb.from('subscribers').select('id').limit(1).then(function (r) {
          if (r.error) return { ok: false, detail: esc(r.error.message), hint: 'Re-run setup SQL (section 6).' };
          return { ok: true, detail: 'Table present (write-only by design — empty read is correct).' };
        });
      } }
  ];

  function runAll() {
    listEl.innerHTML = '';
    runBtn.disabled = true; runBtn.textContent = 'Running…';
    var passed = 0, total = checks.length;
    var seq = Promise.resolve();
    checks.forEach(function (chk) {
      seq = seq.then(function () {
        var pending = row('run', chk.name, 'checking…');
        return Promise.resolve().then(chk.run).then(function (res) {
          pending.className = 'hc-row ' + (res.ok ? 'ok' : 'bad');
          pending.innerHTML = '<span class="hc-ico">' + (res.ok ? '✓' : '✗') + '</span><div class="hc-body">' +
            '<div class="hc-label">' + chk.name + '</div>' +
            (res.detail ? '<div class="hc-detail">' + res.detail + '</div>' : '') +
            (!res.ok && res.hint ? '<div class="hc-hint">↳ ' + res.hint + '</div>' : '') + '</div>';
          if (res.ok) passed++;
        }).catch(function (e) {
          pending.className = 'hc-row bad';
          pending.innerHTML = '<span class="hc-ico">✗</span><div class="hc-body"><div class="hc-label">' + chk.name +
            '</div><div class="hc-detail">' + esc(e && e.message) + '</div></div>';
        });
      });
    });
    seq.then(function () {
      var s = document.createElement('div');
      var allOk = passed === total;
      s.className = 'hc-summary ' + (allOk ? 'ok' : 'bad');
      s.textContent = allOk ? ('✓ All ' + total + ' checks passed — the database is wired correctly.')
        : ('✗ ' + (total - passed) + ' of ' + total + ' failed — fix the red rows above (each says which SQL section), then re-run.');
      listEl.appendChild(s);
      runBtn.disabled = false; runBtn.textContent = 'Re-run the checks ▸';
    });
  }

  runBtn.addEventListener('click', runAll);
})();
</script>
