---
layout: page
permalink: /collection/
title: The Collection
tab_title: The Collection — every collectable in PJCC
description: Every collectable in the PJCC world in one case — the Quartermaster's shelf, the pieces you earn, and the ones only the Gambit altar gives back. Collect them all.
---

{% comment %} ══════════════════════════════════════════════════════════════════════════
     THE COLLECTION (2026-08-03) — Nate: "Create a 'pokedex' of collectables. Collect
     them all. Don't call it pokedex of course."

     WHY IT IS A PAGE AND NOT A TAB ON THE QUARTERMASTER. The Quartermaster answers "what
     can I buy and wear"; this answers "what EXISTS, and how much of it is mine". They are
     different questions and the second one is the one that makes you go and play something.
     The shop is a counter. This is a case.

     THREE CLASSES, AND EACH IS SHOWN DIFFERENTLY ON PURPOSE:
       · IN THE SHOP    fully visible — it is already on a shelf a stranger can browse.
       · EARNED         fully visible WITH its requirement spelled out. A locked thing you
                        cannot even name is a chore; a named target is a reason to go
                        climb the tower. These say exactly what to do.
       · THE VAULT      a SILHOUETTE until you hold it. This is the one place the page
                        keeps a secret, because the altar's whole feeling is that you do
                        not know what the board will hand back, and a list of names to
                        farm would flatten it into a checklist. You can see the shape of
                        what's missing — the band, and that there IS something — which is
                        the honest amount to show.

     ⚠ IT RENDERS SIGNED OUT AND THAT IS THE POINT. The developer is always signed in,
     which is how Park Tables sat dark for every new visitor ([[pjcc-profile-system]]). A
     stranger gets the whole catalogue with nothing owned and one quiet line offering an
     account — the case IS the advert. Nothing here is gated; there is no route that can
     leave a visitor on a spinner.
     ══════════════════════════════════════════════════════════════════════════ {% endcomment %}

<p class="col-lede">Every collectable in the world, in one case — the Quartermaster's shelf,
the pieces you earn, and the ones only the altar gives back. <b>Collect them all.</b></p>

<div class="col-progress" id="col-progress" hidden>
  <div class="col-progress-head">
    <span id="col-count">—</span>
    <span id="col-note"></span>
  </div>
  <div class="col-bar"><i id="col-fill"></i></div>
</div>

<div id="collection"><p class="col-empty">Opening the case…</p></div>

<script src="{{ '/assets/js/pjcc-config.js' | relative_url }}"></script>
<script src="{{ '/assets/js/pjcc-profile.js' | relative_url }}"></script>
<script>
(function () {
  'use strict';
  var el = document.getElementById('collection');
  var $ = function (id) { return document.getElementById(id); };
  var stats = [];

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  var KIND_WORD = { avatar: 'Face', title: 'Title', theme: 'Theme' };

  /* THE THREE SHELVES. Order is deliberate: the shop first because it is the one anybody
     can act on today, earned second because it is the one that sends you to a game, and
     the vault last because it is the one you cannot chase directly. */
  var SHELVES = [
    { key: 'shop',   label: 'On the shelf',
      sub: 'Bought with credits at the <a href="/shopkeeper/">Quartermaster</a>.' },
    { key: 'earned', label: 'Earned',
      sub: 'No price. Do the thing, then claim it.' },
    { key: 'vault',  label: 'The Vault',
      sub: 'The altar is the only door. Nothing here is sold anywhere — and you don\'t get to see one until it\'s yours.' }
  ];

  function tile(c) {
    /* A VAULT PIECE YOU DON'T HOLD IS A SILHOUETTE — see the header comment. `hidden` is
       computed once, here, so a name can never leak through a title attribute or an
       aria-label somewhere else on the tile. */
    var hidden = (c.source === 'vault' && !c.have);
    var cls = 'col-item' + (c.have ? ' have' : '') + (hidden ? ' silhouette' : '')
            + (c.source === 'earned' && !c.have && c.met ? ' claimable' : '');
    var name = hidden ? '???' : esc(c.label);
    var glyph = hidden ? '?' : c.glyph;

    var foot;
    if (c.have) foot = '<span class="col-have">✓ In your case</span>';
    else if (c.source === 'shop') foot = '<span class="col-price">◈ ' + c.value + '</span>';
    else if (c.source === 'vault') foot = '<span class="col-where">at the altar</span>';
    else if (c.met) foot = '<button type="button" class="col-claim" data-k="' + c.kind + ':' + c.key + '">Claim it</button>';
    else foot = '<span class="col-need">' + esc(c.how) + '</span>';

    return '<div class="' + cls + '">' +
      '<div class="col-glyph" aria-hidden="true">' + glyph + '</div>' +
      '<div class="col-name">' + name + '</div>' +
      '<div class="col-band band-' + c.band.key + '">' + c.band.glyph + ' ' + c.band.label + '</div>' +
      '<div class="col-kind">' + (KIND_WORD[c.kind] || c.kind) + '</div>' +
      '<div class="col-foot">' + foot + '</div>' +
      '</div>';
  }

  function render() {
    var prof = PJCC.getProfile ? PJCC.getProfile() : null;
    var all = PJCC.catalogue(prof, stats);
    var n = PJCC.catalogueCount(prof, stats);

    $('col-progress').hidden = false;
    $('col-count').innerHTML = '<b>' + n.held + '</b> of <b>' + n.total + '</b> collected';
    $('col-fill').style.width = (n.total ? Math.round(n.held / n.total * 100) : 0) + '%';
    /* The line beside the count is the ONE place this page asks for anything, and it only
       asks when there is a reason to: a signed-out visitor is told what an account is FOR
       here, not that they need one to look. */
    $('col-note').innerHTML = prof
      ? (n.held === n.total ? 'The case is full. 👑' : esc(n.total - n.held) + ' still out there')
      : 'Signed out — <a href="/dossier/">claim a codename</a> to keep a case of your own.';

    var html = '';
    SHELVES.forEach(function (s) {
      var mine = all.filter(function (c) { return c.source === s.key; });
      if (!mine.length) return;
      var got = mine.filter(function (c) { return c.have; }).length;
      html += '<section class="col-shelf">' +
        '<h2 class="col-h2">' + s.label + ' <span class="col-h2-n">' + got + '/' + mine.length + '</span></h2>' +
        '<p class="col-sub">' + s.sub + '</p>' +
        '<div class="col-grid">' + mine.map(tile).join('') + '</div></section>';
    });
    el.innerHTML = html;

    Array.prototype.forEach.call(el.querySelectorAll('.col-claim'), function (b) {
      b.onclick = function () {
        var parts = b.getAttribute('data-k').split(':');
        b.disabled = true; b.textContent = '…';
        PJCC.claimEarned(parts[0], parts[1], stats).then(function (e) {
          try { if (window.showTxToast) showTxToast('Claimed — ' + e.label); } catch (x) {}
          render();
        }).catch(function (err) {
          b.disabled = false;
          b.textContent = (err && err.message === 'not signed in') ? 'Sign in first' : 'Try again';
        });
      };
    });
  }

  /* ── BOOT: paint FIRST, hydrate after ────────────────────────────────────────────
     The catalogue does not need an account, a network call or a profile to be correct —
     so it is drawn immediately from the module's own data, and the account layer only
     ever ADDS ticks to it. That ordering is why this page has no failure mode worth a
     placeholder: if Supabase is down, or the SDK never loads, or the visitor is a
     stranger, they still get the complete case. ([[down-never-stuck]])

     ⚠ RE-RENDER ON CHANGE **AND** ON READINESS — they are two different moments and
     missing either one is the bug that has bitten this site twice. A session restored
     through onAuthStateChange (a token refresh, or the installed iOS app hydrating its
     own storage jar) lands AFTER PJCC.ready resolves. ([[pjcc-profile-system]]) */
  function hydrate() {
    if (!PJCC.myStats) { render(); return; }
    PJCC.myStats().then(function (s) { stats = s || []; render(); }).catch(function () { render(); });
  }

  render();                                   // the case, drawn from nothing but data
  if (window.PJCC && PJCC.enabled && PJCC.ready) {
    PJCC.ready.then(function () { hydrate(); PJCC.onChange(hydrate); }).catch(function () {});
  }
})();
</script>

<style>
/* ── THE COLLECTION ──────────────────────────────────────────────────────────────
   Built on the shared surface tokens so it inherits the site's radii and card. The
   band colours are the SAME six as PJCC.BANDS and the altar's `.band-*` rules — a
   seventh copy of that ladder would be the thing that finally disagrees with itself,
   so if a band ever changes colour it changes in all three or in none. */
.col-lede { color: #cdbcf2; font-size: 0.95rem; line-height: 1.6; margin: 0 0 18px; max-width: 62ch; }
.col-lede b { color: #F5C518; }
.col-empty { color: #9a7fd4; }

.col-progress { margin: 0 0 26px; max-width: 620px; }
.col-progress[hidden] { display: none; }
.col-progress-head { display: flex; justify-content: space-between; align-items: baseline;
  gap: 12px; flex-wrap: wrap; font-size: 0.86rem; color: #a896d4; margin-bottom: 7px; }
.col-progress-head b { color: #F5C518; font-size: 1.05rem; }
.col-progress-head a { color: #F5C518; }
.col-bar { height: 10px; border-radius: 999px; background: #1a1040; border: 1px solid #3a2a6a; overflow: hidden; }
.col-bar i { display: block; height: 100%; width: 0; border-radius: 999px;
  background: linear-gradient(90deg, #6b5fa0, #F5C518 72%, #ff8fd0); transition: width .35s ease; }

.col-shelf { margin: 0 0 34px; }
.col-h2 { font-size: 0.92rem; letter-spacing: 0.14em; text-transform: uppercase;
  font-family: 'Share Tech Mono', monospace; font-weight: 400; color: #F5C518;
  margin: 0 0 4px; padding-bottom: 8px; border-bottom: 1px solid #3a2a6a; }
.col-h2-n { float: right; color: #9a7fd4; letter-spacing: 0.06em; }
.col-sub { color: #9a7fd4; font-size: 0.8rem; line-height: 1.5; margin: 8px 0 14px; }
.col-sub a { color: #cdbcf2; }

.col-grid { display: grid; gap: 10px;
  grid-template-columns: repeat(auto-fill, minmax(122px, 1fr)); }
.col-item { display: flex; flex-direction: column; align-items: center; gap: 3px;
  padding: 13px 9px 11px; border-radius: var(--r-md, 12px);
  background: rgba(26,16,64,0.5); border: 1px solid #33265e; text-align: center; min-width: 0; }
/* NOT OWNED IS THE DEFAULT LOOK, and owned is the one that lights up — the opposite
   (grey out what you're missing) makes a new visitor's case read as broken. */
.col-item.have { background: rgba(45,27,105,0.55); border-color: #6b5fa0;
  box-shadow: inset 0 0 0 1px rgba(245,197,24,0.14); }
.col-item.claimable { border-color: #6bffb8; box-shadow: 0 0 18px -8px #6bffb8; }
.col-glyph { font-size: 1.9rem; line-height: 1.15; opacity: 0.42; }
.col-item.have .col-glyph { opacity: 1; }
.col-item.silhouette .col-glyph { opacity: 0.3; color: #9a7fd4; font-weight: 900; }
.col-name { font-size: 0.76rem; font-weight: 700; color: #cdbcf2; line-height: 1.25;
  overflow-wrap: anywhere; }
.col-item.have .col-name { color: #f0e6ff; }
.col-item.silhouette .col-name { color: #6b5fa0; letter-spacing: 0.12em; }
.col-band { font-size: 0.55rem; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; }
.col-kind { font-size: 0.56rem; letter-spacing: 0.12em; text-transform: uppercase; color: #6b5fa0; }
.col-foot { margin-top: 3px; font-size: 0.66rem; line-height: 1.35; color: #9a7fd4; }
.col-price { color: #F5C518; font-weight: 800; }
.col-have { color: #6bffb8; font-weight: 700; }
.col-where { font-style: italic; }
.col-need { display: block; color: #a896d4; }
.col-claim { background: #6bffb8; color: #0a2018; border: 0; border-radius: 999px;
  font: inherit; font-size: 0.68rem; font-weight: 800; padding: 6px 12px; min-height: 32px;
  cursor: pointer; }
.col-claim:hover:not(:disabled) { filter: brightness(1.08); }
.col-claim:disabled { opacity: 0.55; cursor: default; }
@media (pointer: coarse) { .col-claim { min-height: 44px; padding: 6px 16px; } }

/* the six bands — the same colours as PJCC.BANDS and the altar */
.band-common    { color: #9aa3b8; }
.band-uncommon  { color: #7fd4a8; }
.band-rare      { color: #56d0ff; }
.band-veryrare  { color: #b98fff; }
.band-ultra     { color: #ff8fd0; }
.band-legendary { color: #ffb066; }

@media (max-width: 420px) {
  .col-grid { grid-template-columns: repeat(auto-fill, minmax(104px, 1fr)); gap: 8px; }
  .col-glyph { font-size: 1.6rem; }
}
</style>
