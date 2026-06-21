---
layout: page
title: Lore Codex
permalink: /lore-codex/
---

<link rel="stylesheet" href="{{ '/assets/css/pjcc-profile.css' | relative_url }}">

<p class="codex-intro">An in-universe encyclopedia of the PJCC world — recovered one file at a time.
Entries unseal as you <strong>read operative dossiers</strong>, <strong>visit locations</strong>, and
<strong>recover classified fragments</strong> hidden across the network. The deeper you go, the more of
the truth assembles itself.</p>

<div class="codex-progress-wrap">
  <div class="codex-progress-head">
    <span id="codex-count">0 / 0 entries recovered</span>
    <span id="codex-pct">0%</span>
  </div>
  <div class="codex-bar"><div class="codex-bar-fill" id="codex-bar-fill"></div></div>
  <p class="codex-allclear" id="codex-allclear" hidden>◈ FULL RECOVERY — every file in the Codex is unsealed.</p>
</div>

<!-- ============ CHARACTERS ============ -->
<h2 class="codex-section-head">◈ Operatives &amp; Cast</h2>
<p class="codex-section-sub">Open an operative's file on the <a href="{{ '/characters/' | relative_url }}">Characters</a> page to recover their Codex entry.</p>
<div class="codex-grid">
  {% assign chars = site.characters | sort: 'order' %}
  {% for char in chars %}
  <div class="codex-card locked" data-codex="char.{{ char.slug }}">
    <div class="codex-card-icon">{{ char.piece | default: '♟' }}</div>
    <div class="codex-card-main">
      <div class="codex-card-name">{{ char.title }}</div>
      <div class="codex-card-role">{{ char.role | default: 'PJCC' }}</div>
      <div class="codex-body">
        <p class="codex-blurb">{{ char.dossier_secret | default: 'File recovered. See full dossier for details.' }}</p>
        <a class="codex-link" href="{{ char.url | relative_url }}">Open full file →</a>
      </div>
      <div class="codex-lock"><span class="codex-lock-ic">🔒</span> Read this operative's dossier to recover.</div>
    </div>
  </div>
  {% endfor %}
</div>

<!-- ============ LOCATIONS ============ -->
<h2 class="codex-section-head">◈ Locations</h2>
<p class="codex-section-sub">Visit a place on the <a href="{{ '/locations/' | relative_url }}">Locations</a> page to recover its Codex entry.</p>
<div class="codex-grid">
  {% assign locs = site.locations | sort: 'title' %}
  {% for loc in locs %}
  <div class="codex-card locked" data-codex="loc.{{ loc.slug }}">
    <div class="codex-card-icon">🗺️</div>
    <div class="codex-card-main">
      <div class="codex-card-name">{{ loc.title }}</div>
      <div class="codex-card-role">{{ loc.location_type | default: 'Region' }}</div>
      <div class="codex-body">
        <a class="codex-link" href="{{ loc.url | relative_url }}">Open full file →</a>
      </div>
      <div class="codex-lock"><span class="codex-lock-ic">🔒</span> Visit this location to recover.</div>
    </div>
  </div>
  {% endfor %}
</div>

<!-- ============ PIECES (field manual baseline) ============ -->
<h2 class="codex-section-head">◈ Field Manual — The Pieces</h2>
<p class="codex-section-sub">Standard issue. Known to every operative from day one.</p>
<div class="codex-grid">
  <div class="codex-card" data-codex="piece"><div class="codex-card-icon">&#9823;</div><div class="codex-card-main"><div class="codex-card-name">Pawn</div><div class="codex-card-role">The foot soldier</div><div class="codex-body"><p class="codex-blurb">Common, essential, and quietly capable of becoming anything on the board.</p></div></div></div>
  <div class="codex-card" data-codex="piece"><div class="codex-card-icon">&#9820;</div><div class="codex-card-main"><div class="codex-card-name">Rook</div><div class="codex-card-role">The sentinel</div><div class="codex-body"><p class="codex-blurb">Moves in straight lines, controlling entire ranks and files. A fortress piece.</p></div></div></div>
  <div class="codex-card" data-codex="piece"><div class="codex-card-icon">&#9821;</div><div class="codex-card-main"><div class="codex-card-name">Bishop</div><div class="codex-card-role">The diagonal thinker</div><div class="codex-body"><p class="codex-blurb">Bound to its color for the whole game; sees the board from an angle no other piece can.</p></div></div></div>
  <div class="codex-card" data-codex="piece"><div class="codex-card-icon">&#9822;</div><div class="codex-card-main"><div class="codex-card-name">Knight</div><div class="codex-card-role">The unpredictable one</div><div class="codex-body"><p class="codex-blurb">Leaps over others in an L-shape that defies the grid — the piece Princess is designated as.</p></div></div></div>
  <div class="codex-card" data-codex="piece"><div class="codex-card-icon">&#9819;</div><div class="codex-card-main"><div class="codex-card-name">Queen</div><div class="codex-card-role">The powerhouse</div><div class="codex-body"><p class="codex-blurb">Combines the reach of the rook and the sweep of the bishop. Few can stand in her way.</p></div></div></div>
  <div class="codex-card" data-codex="piece"><div class="codex-card-icon">&#9818;</div><div class="codex-card-main"><div class="codex-card-name">King</div><div class="codex-card-role">The whole game</div><div class="codex-body"><p class="codex-blurb">Slow and fragile, but everything turns on his safety. Lose him and it's over.</p></div></div></div>
</div>

<!-- ============ CLASSIFIED FILES (fragment-gated) ============ -->
<h2 class="codex-section-head">◈ Classified Files</h2>
<p class="codex-section-sub">Sealed records. Each needs a <strong>clearance fragment</strong> recovered from somewhere out on the network.</p>
<div class="codex-grid codex-grid-wide">
  <div class="codex-card locked codex-classified" data-codex="frag" data-frag="frag_classified">
    <div class="codex-card-icon">🛰️</div>
    <div class="codex-card-main">
      <div class="codex-card-name">SUBJECT ZERO</div>
      <div class="codex-card-role">Clearance: OMEGA</div>
      <div class="codex-body"><p class="codex-blurb">Arrived on the same vessel as Princess. Designation predates the crash. Connection to the construction crew: <em>unconfirmed</em> — but the records that survive keep circling back to the same launch manifest.</p></div>
      <div class="codex-lock"><span class="codex-lock-ic">🔒</span> Requires a fragment from the classified channel.</div>
    </div>
  </div>
  <div class="codex-card locked codex-classified" data-codex="frag" data-frag="frag_archive">
    <div class="codex-card-icon">🗄️</div>
    <div class="codex-card-main">
      <div class="codex-card-name">THE ARCHIVE</div>
      <div class="codex-card-role">Clearance: GAMMA</div>
      <div class="codex-body"><p class="codex-blurb">A buried store of recovered transmissions and salvage from before Checker Town had a name. Most of it is noise. Some of it is a countdown.</p></div>
      <div class="codex-lock"><span class="codex-lock-ic">🔒</span> Requires the Archive fragment.</div>
    </div>
  </div>
  <div class="codex-card locked codex-classified" data-codex="frag" data-frag="frag_dispatch">
    <div class="codex-card-icon">📡</div>
    <div class="codex-card-main">
      <div class="codex-card-name">THE DEAD DROP</div>
      <div class="codex-card-role">Clearance: DELTA</div>
      <div class="codex-body"><p class="codex-blurb">A daily-rotating drop point where the Narrator leaves coordinates for operatives who know to look. The chatter is real; the question is who's listening on the other end.</p></div>
      <div class="codex-lock"><span class="codex-lock-ic">🔒</span> Requires the dispatch fragment.</div>
    </div>
  </div>
  <div class="codex-card locked codex-classified" data-codex="frag" data-frag="frag_recovery">
    <div class="codex-card-icon">🧭</div>
    <div class="codex-card-main">
      <div class="codex-card-name">RECOVERY SIGNAL</div>
      <div class="codex-card-role">Clearance: DELTA</div>
      <div class="codex-body"><p class="codex-blurb">A faint repeating ping from the wreck site. Whoever left it wanted to be found — eventually. The phrasing matches Bill's old crew-comms cadence.</p></div>
      <div class="codex-lock"><span class="codex-lock-ic">🔒</span> Requires the recovery fragment.</div>
    </div>
  </div>
  <div class="codex-card locked codex-classified" data-codex="frag" data-frag="frag_konami">
    <div class="codex-card-icon">🎮</div>
    <div class="codex-card-main">
      <div class="codex-card-name">THE OPERATOR'S CODE</div>
      <div class="codex-card-role">Clearance: GAMMA</div>
      <div class="codex-body"><p class="codex-blurb">An old input sequence that still unlocks doors no one remembers building. Knowing it marks you as someone who pokes at the edges of things.</p></div>
      <div class="codex-lock"><span class="codex-lock-ic">🔒</span> Requires the operator fragment.</div>
    </div>
  </div>
  <div class="codex-card locked codex-classified" data-codex="frag" data-frag="frag_qd">
    <div class="codex-card-icon">⚡</div>
    <div class="codex-card-main">
      <div class="codex-card-name">THE HYPERSPEED BOX</div>
      <div class="codex-card-role">Clearance: OMEGA</div>
      <div class="codex-body"><p class="codex-blurb">The device Bill taught Princess to operate. When it runs astray, everything that follows follows from it — including the choice that left Princess behind.</p></div>
      <div class="codex-lock"><span class="codex-lock-ic">🔒</span> Requires the quantum-drop fragment.</div>
    </div>
  </div>
  <div class="codex-card locked codex-classified codex-final" data-codex="final">
    <div class="codex-card-icon">🚀</div>
    <div class="codex-card-main">
      <div class="codex-card-name">INTERPLANETARY CONSTRUCTION CO.</div>
      <div class="codex-card-role">Clearance: TOP SECRET — all fragments required</div>
      <div class="codex-body"><p class="codex-blurb">The Intergalactic Cup was set to be played on this planet. A construction crew flew out to build for it — and crashed, leaving Princess and every chess and checker piece scattered over Checker Town. Bill and Princess were paired on that crew and bonded instantly; he could teach her to do anything. When the Hyperspeed Box ran astray, Bill chose to protect his family aboard — and was forced to leave Princess behind. The signal you've been chasing is the company's. <em>Maybe he's still out there, looking for her.</em></p></div>
      <div class="codex-lock"><span class="codex-lock-ic">🔒</span> Recover <strong>all six</strong> classified fragments to unseal the origin.</div>
    </div>
  </div>
</div>

<script>
(function () {
  function has(k) { try { return !!localStorage.getItem(k); } catch (e) { return false; } }
  var ALL_FRAGS = ['frag_classified','frag_archive','frag_dispatch','frag_recovery','frag_konami','frag_qd'];

  function unlocked(card) {
    var key = card.getAttribute('data-codex');
    if (key === 'piece') return true;                                  // field-manual baseline
    if (key === 'frag')  return has(card.getAttribute('data-frag'));
    if (key === 'final') return ALL_FRAGS.every(has);
    if (key.indexOf('char.') === 0) return has('codex.' + key);        // codex.char.<slug>
    if (key.indexOf('loc.') === 0)  return has('codex.' + key);        // codex.loc.<slug>
    return false;
  }

  var cards = [].slice.call(document.querySelectorAll('.codex-card'));
  var total = cards.length, got = 0;
  cards.forEach(function (c) {
    if (unlocked(c)) { c.classList.remove('locked'); got++; }
  });

  var pct = total ? Math.round(got / total * 100) : 0;
  var cEl = document.getElementById('codex-count');
  var pEl = document.getElementById('codex-pct');
  var bEl = document.getElementById('codex-bar-fill');
  var aEl = document.getElementById('codex-allclear');
  if (cEl) cEl.textContent = got + ' / ' + total + ' entries recovered';
  if (pEl) pEl.textContent = pct + '%';
  if (bEl) bEl.style.width = pct + '%';
  if (aEl && got === total && total > 0) aEl.hidden = false;
})();
</script>

<style>
.codex-intro { color: #9a7fd4; max-width: 760px; line-height: 1.6; }
.codex-intro strong { color: #F5C518; }
.codex-progress-wrap { max-width: 760px; margin: 22px 0 8px; }
.codex-progress-head { display: flex; justify-content: space-between; font-family: 'Courier New', monospace;
  font-size: 0.85rem; color: #c9a7ff; margin-bottom: 6px; }
.codex-progress-head #codex-pct { color: #F5C518; font-weight: 700; }
.codex-bar { height: 10px; background: rgba(157,127,212,0.16); border: 1px solid #4a2f8a; border-radius: 999px; overflow: hidden; }
.codex-bar-fill { height: 100%; width: 0; background: linear-gradient(90deg, #6b5fa0, #F5C518); transition: width 0.9s ease; }
.codex-allclear { color: #6bffb8; font-weight: 700; margin-top: 10px; font-family: 'Courier New', monospace; }
.codex-section-head { color: #F5C518; margin: 34px 0 4px; letter-spacing: 0.04em; }
.codex-section-sub { color: #9a7fd4; font-size: 0.9rem; margin: 0 0 14px; }
.codex-section-sub a { color: #c9a7ff; }
.codex-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; }
.codex-grid-wide { grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); }
.codex-card { display: flex; gap: 12px; background: rgba(45,27,105,0.55); border: 1px solid #3a2a6a;
  border-radius: 12px; padding: 14px; transition: border-color 0.2s, transform 0.15s; }
.codex-card:hover { border-color: #6b5fa0; transform: translateY(-2px); }
.codex-card-icon { font-size: 30px; line-height: 1; flex: 0 0 auto; width: 38px; text-align: center; }
.codex-card-main { min-width: 0; }
.codex-card-name { color: #f0e6ff; font-weight: 700; font-size: 1rem; }
.codex-card-role { color: #9a7fd4; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; }
.codex-blurb { color: #c9a7ff; font-size: 0.86rem; line-height: 1.5; margin: 0 0 8px; }
.codex-link { color: #F5C518; font-size: 0.82rem; text-decoration: none; font-weight: 600; }
.codex-link:hover { text-decoration: underline; }
.codex-lock { display: none; color: #7d6bb0; font-size: 0.82rem; font-style: italic; }
.codex-lock-ic { font-style: normal; }
/* Locked state: hide the real body, show the lock hint, dim + desaturate the icon */
.codex-card.locked .codex-body { display: none; }
.codex-card.locked .codex-lock { display: block; }
.codex-card.locked { border-style: dashed; opacity: 0.8; }
.codex-card.locked .codex-card-name { color: #9a7fd4; }
.codex-card.locked .codex-card-icon { filter: grayscale(1) brightness(0.7); opacity: 0.5; }
.codex-classified .codex-card-name { font-family: 'Courier New', monospace; letter-spacing: 0.05em; }
.codex-final { border-color: #6b5fa0; background: rgba(245,197,24,0.06); }
.codex-final:not(.locked) { border-color: #F5C518; box-shadow: 0 0 22px rgba(245,197,24,0.18); }
</style>
