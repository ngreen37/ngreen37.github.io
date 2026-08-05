---
layout: page
permalink: /puzzle-reports/
title: Puzzle Reports
tab_title: Puzzle Reports
description: Private — reports filed from the Puzzle Room.
noindex: true
sitemap: false
---

{% comment %} ══════════════════════════════════════════════════════════════════════════
     THE REPORT INBOX (2026-08-03) — priority #1: "Read them on a private page beside the
     leaderboards."

     ⚠ THIS PAGE IS NOT THE SECURITY BOUNDARY. The RLS policy in
     docs/puzzle-reports-setup.md is: only the row in `match_config.creator_id` may SELECT
     from `puzzle_reports`. Anybody else who opens this URL gets an empty list from the
     database itself, not because a script decided to hide it. The `noindex` and
     `sitemap: false` above are tidiness, not defense — a page whose privacy depends on
     nobody finding it is not private.

     ⚠ AND IT WORKS BEFORE THE MIGRATION. Until Nate runs the SQL there is no table, so
     the query errors, PJCC.puzzleReports() swallows it and returns [], and the page says
     so plainly with the setup path. It never sits on "Loading…" ([[down-never-stuck]]).

     THE SORT IS THE FEATURE. The room attaches the engine's own verdict to every report
     at the moment it is filed, so this page can put the two that matter — a second mate,
     or a move the search agrees with — at the top and leave the refuted ones underneath.
     The point of the whole item was to stop a human triaging an inbox by hand.
     ══════════════════════════════════════════════════════════════════════════ {% endcomment %}

<p class="pr-lede">Filed from the ⚑ button in the <a href="/games/fork-in-the-road/">Puzzle Room</a>.
Sorted by what the engine thought, not by when they arrived — <b>a second mate is a hole in
the accuracy gate</b>, and everything else can wait.</p>

<div id="reports"><p class="pr-empty">Opening the file…</p></div>

{% comment %} ⚠ THIS PAGE USED TO LOAD pjcc-config.js AND pjcc-profile.js RIGHT HERE, and
     _layouts/default.html loads both again at the foot of every page. pjcc-profile.js is an
     IIFE ending in `window.PJCC = PJCC`, so the second copy built a second object over the
     first and orphaned everything registered against it — including this page's
     `PJCC.onChange(load)` — and stood up a SECOND Supabase auth client against the same
     storage key, which is a documented way to lose a session mid-refresh. The same mistake
     was found and removed from _layouts/home.html on 2026-07-21; the comment there explains
     it at length. The script below now waits for DOMContentLoaded instead, by which point
     the layout's own pair has run. {% endcomment %}
<script>
(function () {
  'use strict';
  var el = document.getElementById('reports');
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* The triage order, and it is the whole reason this page exists rather than an inbox.
     `mates` first because the generator's own gates are supposed to make it impossible —
     one of those rows means `secondSolution()` has a hole ([[puzzle-room-invariants]]). */
  var RANK = { mates: 0, agrees: 1, none: 2, refuted: 3 };
  var WORD = {
    mates:   ['A SECOND MATE', 'The gate is supposed to make this impossible. Reproduce it from the FEN.'],
    agrees:  ['THE SEARCH AGREES', 'The engine likes their move too. Worth a look.'],
    none:    ['A NOTE', 'No move claimed — read what they wrote.'],
    refuted: ['REFUTED', 'The engine can punish their move; the puzzle was probably right.']
  };

  function card(r) {
    var v = r.verdict || 'none', w = WORD[v] || WORD.none;
    var when = r.created_at ? new Date(r.created_at).toLocaleString() : '';
    return '<div class="pr-card pr-' + esc(v) + (r.handled ? ' pr-done' : '') + '">' +
      '<div class="pr-head"><b class="pr-verdict">' + w[0] + '</b>' +
        (r.claim ? '<span class="pr-claim">' + esc(r.claim) + '</span>' : '') +
        '<span class="pr-when">' + esc(when) + '</span></div>' +
      '<div class="pr-why">' + w[1] +
        (r.verdict_cp != null ? ' <span class="pr-cp">(' + r.verdict_cp + 'cp)</span>' : '') + '</div>' +
      (r.note ? '<div class="pr-note">“' + esc(r.note) + '”</div>' : '') +
      '<div class="pr-fen">' + esc(r.fen) + '</div>' +
      '<div class="pr-meta">' +
        esc(r.motif || '?') + ' · goal ' + esc(r.goal || '?') +
        ' · rated ~' + esc(r.rating == null ? '?' : r.rating) +
        (r.mode ? ' · ' + esc(r.mode) : '') + (r.step ? ' · step ' + esc(r.step) : '') +
        (r.codename ? ' · ' + esc(r.codename) : ' · signed out') +
      '</div>' +
      (r.line ? '<div class="pr-meta">line: ' + esc(r.line) + '</div>' : '') +
      '<button type="button" class="pr-mark" data-id="' + esc(r.id) + '">' +
        (r.handled ? 'handled ✓' : 'mark handled') + '</button>' +
      '</div>';
  }

  /* ── WHY IS IT EMPTY? ─────────────────────────────────────────────────────────────
     This page used to answer that with a list of three possibilities and no way to tell
     them apart, which is not an answer. Four things are actually checkable from here, and
     each has a different fix:

       no-table   the migration has not been run          → run the SQL
       no-creator `match_config` is EMPTY. This is the one that looks most like "no
                  reports yet" and is the least obvious: the read policy compares
                  auth.uid() against `(select creator_id from match_config limit 1)`, and
                  a missing row makes that NULL — so the comparison is NULL, not true, and
                  the table is unreadable BY EVERYONE INCLUDING NATE. Step 2 of
                  docs/park-tables-setup.md is the insert that fixes it.
       not-you    signed in, but as somebody else         → sign in as the Creator
       signed-out no session at all                       → sign in
       empty      genuinely nothing filed yet             → nothing to do

     `match_config` is readable by any authenticated user, so this costs one small query
     and only runs when the list comes back empty. */
  function why(reason, detail) {
    var P = function (s) { el.innerHTML = '<p class="pr-empty">' + s + '</p>'; };
    if (reason === 'offline') { P('The database is not configured in this build.'); return; }
    if (reason === 'no-table') {
      P('<b>There is no <code>puzzle_reports</code> table yet.</b> Run the SQL in ' +
        '<code>docs/puzzle-reports-setup.md</code> — Supabase → SQL Editor, paste, run. ' +
        'Nothing is lost in the meantime: the ⚑ button falls back to Email and Copy.' +
        (detail ? '<br><span class="pr-detail">' + esc(detail) + '</span>' : ''));
      return;
    }
    if (reason === 'error') {
      P('<b>The query failed.</b><br><span class="pr-detail">' + esc(detail || 'no message') + '</span>');
      return;
    }
    var me = (window.PJCC && PJCC.currentUser && PJCC.currentUser()) || null;
    if (!me) { P('Signed out. Reports are readable by the Creator account only.'); return; }
    if (!PJCC.creatorId) { P('Nothing filed yet.'); return; }
    PJCC.creatorId().then(function (cid) {
      if (cid === false) {
        P('<b>The table is there, but <code>match_config</code> is not.</b> The read policy ' +
          'asks that table who the Creator is, so nobody can read reports until it exists — ' +
          'see <code>docs/park-tables-setup.md</code>.');
      } else if (cid === null) {
        P('<b><code>match_config</code> is empty — that is why this is blank.</b> The read ' +
          'policy compares your id against <code>(select creator_id from match_config limit 1)</code>, ' +
          'and with no row that comparison is NULL, so the table is unreadable by <i>everyone</i>, ' +
          'you included. Fix it with one line in the SQL editor:' +
          '<br><code class="pr-sql">insert into public.match_config (creator_id) values (\'' + esc(me.id) + '\');</code>' +
          '<br>That is your own user id, read from this session.');
      } else if (cid !== me.id) {
        P('Signed in as somebody who is not the Creator, so the database returns no rows. ' +
          '<br><span class="pr-detail">you ' + esc(me.id) + '<br>creator ' + esc(cid) + '</span>');
      } else {
        P('<b>Nothing filed yet.</b> You are the Creator, the table is there, and it is empty — ' +
          'which is the good version of a blank page.');
      }
    }).catch(function () { P('Nothing filed yet.'); });
  }

  function render(res) {
    var rows = (res && res.rows) || [];
    if (!rows.length) { why(res && res.reason, res && res.detail); return; }
    rows.sort(function (a, b) {
      var ra = (a.handled ? 10 : 0) + (RANK[a.verdict] == null ? 2 : RANK[a.verdict]);
      var rb = (b.handled ? 10 : 0) + (RANK[b.verdict] == null ? 2 : RANK[b.verdict]);
      if (ra !== rb) return ra - rb;
      return String(b.created_at).localeCompare(String(a.created_at));
    });
    var open = rows.filter(function (r) { return !r.handled; }).length;
    el.innerHTML = '<p class="pr-count"><b>' + open + '</b> open · ' + rows.length + ' total</p>' +
      rows.map(card).join('');
    Array.prototype.forEach.call(el.querySelectorAll('.pr-mark'), function (b) {
      b.onclick = function () {
        var id = b.getAttribute('data-id'), d = PJCC.db ? PJCC.db() : null;
        if (!d) return;
        b.disabled = true; b.textContent = '…';
        d.from('puzzle_reports').update({ handled: true }).eq('id', id).then(function () { load(); },
          function () { b.disabled = false; b.textContent = 'Try again'; });
      };
    });
  }

  function load() {
    if (!window.PJCC || !PJCC.puzzleReports) {
      el.innerHTML = '<p class="pr-empty">The profile module did not load on this page.</p>';
      return;
    }
    PJCC.puzzleReports(300).then(render).catch(function (e) {
      render({ rows: [], reason: 'error', detail: e && e.message });
    });
  }

  /* Wait for the document, because _layouts/default.html loads pjcc-config.js and
     pjcc-profile.js at the FOOT of the page — see the comment above the script tag. Then
     re-route on BOTH readiness and change: a restored session lands after PJCC.ready
     resolves ([[pjcc-profile-system]]), and this page is meaningless signed out. */
  function start() {
    if (!window.PJCC || !PJCC.enabled || !PJCC.ready) {
      el.innerHTML = '<p class="pr-empty">The database is not configured in this build.</p>';
      return;
    }
    PJCC.ready.then(function () { load(); PJCC.onChange(load); })
      .catch(function (e) { render({ rows: [], reason: 'error', detail: e && e.message }); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
</script>

<style>
.pr-lede { color: #cdbcf2; font-size: 0.92rem; line-height: 1.6; margin: 0 0 18px; max-width: 66ch; }
.pr-lede b { color: #ff9ec8; }
.pr-empty { color: #9a7fd4; line-height: 1.6; max-width: 62ch; }
.pr-empty b { color: #f0e6ff; }
.pr-empty code { color: #cdbcf2; font-size: 0.9em; }
/* the diagnosis, when it is empty for a reason worth fixing */
.pr-detail { font-family: 'Share Tech Mono', monospace; font-size: 0.76rem; color: #ff9ec8;
  display: inline-block; margin-top: 6px; word-break: break-all; }
.pr-sql { display: block; margin: 8px 0; padding: 9px 11px; background: rgba(0,0,0,0.4);
  border-radius: 6px; font-family: 'Share Tech Mono', monospace; font-size: 0.76rem;
  color: #6bffb8; word-break: break-all; line-height: 1.5; }
.pr-count { color: #a896d4; font-size: 0.86rem; margin: 0 0 14px; }
.pr-count b { color: #F5C518; font-size: 1.1rem; }

.pr-card { border: 1px solid #33265e; border-left-width: 4px; border-radius: var(--r-md, 12px);
  background: rgba(26,16,64,0.5); padding: 13px 15px; margin: 0 0 10px; }
/* The left edge IS the triage — you can scan the column and never read a word. */
.pr-mates   { border-left-color: #ff6e6e; }
.pr-agrees  { border-left-color: #ffe08a; }
.pr-none    { border-left-color: #9a7fd4; }
.pr-refuted { border-left-color: #3a2a6a; }
.pr-done { opacity: 0.45; }
.pr-head { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; margin-bottom: 4px; }
.pr-verdict { font-size: 0.68rem; letter-spacing: 0.14em; color: #cdbcf2; }
.pr-mates .pr-verdict  { color: #ff6e6e; }
.pr-agrees .pr-verdict { color: #ffe08a; }
.pr-claim { font-family: 'Share Tech Mono', monospace; font-size: 0.9rem; color: #6bffb8; }
.pr-when { margin-left: auto; color: #6b5fa0; font-size: 0.72rem; }
.pr-why { color: #a896d4; font-size: 0.8rem; line-height: 1.5; }
.pr-cp { color: #6b5fa0; }
.pr-note { color: #f0e6ff; font-size: 0.88rem; line-height: 1.55; margin: 8px 0 0; font-style: italic; }
.pr-fen { font-family: 'Share Tech Mono', monospace; font-size: 0.72rem; color: #56d0ff;
  background: rgba(0,0,0,0.35); border-radius: 6px; padding: 6px 8px; margin: 8px 0 6px;
  word-break: break-all; line-height: 1.5; }
.pr-meta { color: #6b5fa0; font-size: 0.72rem; line-height: 1.6; }
.pr-mark { margin-top: 9px; background: transparent; border: 1px solid #4a3a86; color: #a896d4;
  border-radius: 999px; font: inherit; font-size: 0.72rem; padding: 5px 12px; min-height: 32px; cursor: pointer; }
.pr-mark:hover:not(:disabled) { border-color: #cdbcf2; color: #f0e6ff; }
.pr-mark:disabled { opacity: 0.5; cursor: default; }
@media (pointer: coarse) { .pr-mark { min-height: 44px; } }
</style>
