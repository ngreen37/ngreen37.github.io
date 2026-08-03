---
layout: page
permalink: /puzzle-reports/
title: Puzzle reports
tab_title: Puzzle reports
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

<script src="{{ '/assets/js/pjcc-config.js' | relative_url }}"></script>
<script src="{{ '/assets/js/pjcc-profile.js' | relative_url }}"></script>
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

  function render(rows) {
    if (!rows.length) {
      el.innerHTML = '<p class="pr-empty">Nothing here — either no reports yet, or you are not ' +
        'signed in as the Creator, or <code>docs/puzzle-reports-setup.md</code> has not been run. ' +
        'All three look the same from out here, on purpose.</p>';
      return;
    }
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
          function () { b.disabled = false; b.textContent = 'try again'; });
      };
    });
  }

  function load() {
    if (!window.PJCC || !PJCC.puzzleReports) { render([]); return; }
    PJCC.puzzleReports(300).then(render).catch(function () { render([]); });
  }

  // Paint something immediately, then hydrate — and re-route on BOTH readiness and
  // change, because a restored session lands after PJCC.ready ([[pjcc-profile-system]]).
  if (window.PJCC && PJCC.enabled && PJCC.ready) {
    PJCC.ready.then(function () { load(); PJCC.onChange(load); }).catch(function () { render([]); });
  } else { render([]); }
})();
</script>

<style>
.pr-lede { color: #cdbcf2; font-size: 0.92rem; line-height: 1.6; margin: 0 0 18px; max-width: 66ch; }
.pr-lede b { color: #ff9ec8; }
.pr-empty { color: #9a7fd4; line-height: 1.6; max-width: 62ch; }
.pr-empty code { color: #cdbcf2; font-size: 0.9em; }
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
