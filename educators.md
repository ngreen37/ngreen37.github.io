---
layout: page
title: P&JCC for Educators
permalink: /educators/
---

<div class="ed-hero selectable">
  <div class="ed-kicker">ChessWild Chess Academy · for classrooms &amp; curious minds of any age</div>
  <p class="ed-sub">The <a href="{{ '/academy/' | relative_url }}">ChessWild Chess Academy</a> teaches chess the way anyone actually learns — through a cartoon they care about, with Auston and Crockett from the P&JCC series doing the teaching. It's geared for kids and classrooms, but built to be genuinely enjoyable for <strong>all ages</strong>. Free to use today, and it drops straight into a classroom: offline, kid-safe, and standards-friendly.</p>
</div>

<!-- WHY IT WORKS -->
<h2 class="ed-h2">◈ Why it works in a classroom</h2>
<div class="ed-grid">
  <div class="ed-cell"><span class="ed-ico">🐶</span><b>Character-led</b><small>Auston teaches the pieces, Crockett takes notation next, and every rival on the ladder is someone from the show — kids learn from a cast they're rooting for.</small></div>
  <div class="ed-cell"><span class="ed-ico">📶</span><b>Fully offline</b><small>Everything runs in the browser with no logins required. No accounts, no data collection, no network needed once loaded.</small></div>
  <div class="ed-cell"><span class="ed-ico">🛡️</span><b>Kid-safe by design</b><small>No chat, no ads, no purchases, no personal data. Progress is stored only on the device.</small></div>
  <div class="ed-cell"><span class="ed-ico">🪜</span><b>A path, in order</b><small>The Academy runs one honest lesson at a time, starting at how the pieces move — so there is always exactly one next step, for the room and for each kid.</small></div>
  <div class="ed-cell"><span class="ed-ico">🖨️</span><b>Printable art cards</b><small>A P&JCC fan-art card for every student, names pre-filled, one per page — printed straight from this page, below.</small></div>
  <div class="ed-cell"><span class="ed-ico">🕹️</span><b>Games to practice in</b><small>Coordinates, tactics, openings, a puzzle room and a ladder of rivals — the lessons lead into practice they actually want to do.</small></div>
</div>

<!-- WHAT YOU GET -->
<h2 class="ed-h2">◈ Use it today — free</h2>
<div class="ed-free">
  <p>Individual teachers can use the entire Academy and arcade with their class right now, at no cost. Open it, project it, assign it for homework — no sign-up.</p>
  <div class="ed-free-cta">
    <a class="ed-btn ed-btn-gold" href="{{ '/academy/' | relative_url }}">Open the Academy →</a>
    <a class="ed-btn" href="{{ '/games/' | relative_url }}">Browse the games</a>
  </div>
</div>

<!-- CLASSROOM ART KIOSK -->
<h2 class="ed-h2">◈ Classroom Art Kiosk</h2>
<div class="ed-free">
  <p>Print a P&JCC fan-art card for every student — names pre-filled, one card per page. They draw, you hang.</p>
  <textarea id="ek-names" class="ek-names" rows="6" aria-label="Student names" placeholder="One student name per line…" autocomplete="off"></textarea>
  <div class="ed-free-cta">
    <button class="ed-btn ed-btn-gold" id="ek-print" type="button">🖨 Print the card stack</button>
    <span class="ek-msg" id="ek-msg"></span>
  </div>
  <p class="ek-privacy">Personal Data Not Stored</p>
</div>

<!-- print-only card stack (built on demand) -->
<div id="ek-sheets" class="ek-print" aria-hidden="true"></div>

<script>
(function () {
  var btn = document.getElementById('ek-print');
  if (!btn) return;
  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]; }); }
  btn.onclick = function () {
    var box = document.getElementById('ek-names');
    var names = (box.value || '').split('\n').map(function (s) { return s.trim(); }).filter(Boolean).slice(0, 40);
    var msg = document.getElementById('ek-msg');
    if (!names.length) { msg.textContent = 'Add at least one name first.'; box.focus(); return; }
    msg.textContent = '';
    var host = document.getElementById('ek-sheets');
    host.innerHTML = '';
    names.forEach(function (n) {
      var d = document.createElement('div');
      d.className = 'ek-card';
      d.innerHTML = '<div class="ek-eyebrow">Fan Art</div>' +
        '<div class="ek-brand"><span class="ek-star">★</span>P&JCC<span class="ek-star">★</span></div>' +
        '<div class="ek-frame"></div>' +
        '<div class="ek-artist">Artist: <b>' + esc(n) + '</b></div>';
      host.appendChild(d);
    });
    document.body.classList.add('ek-printing');
    window.print();
  };
  window.addEventListener('afterprint', function () { document.body.classList.remove('ek-printing'); });
})();
</script>

<!-- LICENSING (coming) -->
<h2 class="ed-h2">◈ School &amp; district licensing <span class="ed-soon">Next up</span></h2>
<p class="ed-note">For schools, clubs, and districts that want more, a site license is next up — built to be the part that helps fund the show while putting it in real classrooms.</p>
<div class="ed-tiers">
  <div class="ed-tier">
    <div class="ed-tier-name">Teacher</div>
    <div class="ed-tier-price">Free · now</div>
    <ul><li>✓ Full Academy + arcade</li><li>✓ Printable classroom art cards</li><li>✓ Progress saved on the device</li><li>✓ No accounts, fully offline</li></ul>
  </div>
  <div class="ed-tier ed-tier-feature">
    <div class="ed-flag">Building</div>
    <div class="ed-tier-name">School / Club</div>
    <div class="ed-tier-price">Site license</div>
    <ul><li>★ A teacher dashboard &amp; class progress view</li><li>★ A printable multi-week curriculum packet</li><li>★ Roster-free class codes</li><li>★ Priority support &amp; new lessons first</li></ul>
  </div>
  <div class="ed-tier">
    <div class="ed-tier-name">District</div>
    <div class="ed-tier-price">Custom</div>
    <ul><li>♛ Multi-school licensing</li><li>♛ Teacher training session</li><li>♛ Standards-alignment notes</li><li>♛ A say in the roadmap</li></ul>
  </div>
</div>

<!-- CONTACT -->
<h2 class="ed-h2">◈ Bring it to your classroom</h2>
<p class="ed-note">Teaching chess to kids, or running a club? Tell us about your class — we'd love to build the school tier around how you'd actually use it. Educator pilots get it first, free.</p>
<div class="ed-contact">
  <a class="ed-btn ed-btn-gold" href="{{ '/contact/' | relative_url }}">Request a classroom pilot →</a>
  <a class="ed-btn" href="{{ '/mailing-list/' | relative_url }}">Get educator updates</a>
</div>

<style>
.ed-hero { max-width: 740px; margin-bottom: 8px; }
.ed-kicker { font-size: 0.72rem; letter-spacing: 0.2em; text-transform: uppercase; color: #ff8fd0; }
.ed-sub { color: #c9a7ff; line-height: 1.65; }
.ed-sub a, .ed-note a { color: #F5C518; }
.ed-h2 { color: #F5C518; margin: 26px 0 10px; display: flex; align-items: center; gap: 10px; }
.ed-soon { font-size: 0.56rem; letter-spacing: 0.12em; text-transform: uppercase; color: #1a0f3d; background: #9fe8ff; padding: 3px 9px; border-radius: 999px; font-weight: 800; }
.ed-note { color: #9a7fd4; max-width: 720px; line-height: 1.6; }

.ed-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px; }
.ed-cell { background: rgba(45,27,105,0.45); border: 1px solid #3a2a6a; border-radius: var(--r-md); padding: 14px; }
.ed-ico { font-size: 24px; display: block; margin-bottom: 4px; }
.ed-cell b { color: #f0e6ff; display: block; margin-bottom: 2px; }
.ed-cell small { color: #9a7fd4; font-size: 0.82rem; line-height: 1.5; }

.ed-free { background: rgba(107,255,184,0.06); border: 1px solid #2f6b50; border-radius: var(--r-md); padding: 16px; max-width: 720px; }
.ed-free p { color: #cfc3ee; line-height: 1.6; margin-bottom: 12px; }
.ed-free-cta, .ed-contact { display: flex; gap: 10px; flex-wrap: wrap; }
.ed-btn { display: inline-block; background: #221444; border: 1px solid #4a2f8a; color: #c9a7ff; border-radius: 999px; padding: 10px 18px; font-weight: 700; text-decoration: none; transition: all 0.14s; }
.ed-btn:hover { border-color: #F5C518; color: #fff; }
.ed-btn-gold { background: #F5C518; color: #1a0f3d; border-color: #F5C518; }
.ed-btn-gold:hover { background: #ffd740; color: #1a0f3d; }

.ed-tiers { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; align-items: stretch; }
.ed-tier { position: relative; display: flex; flex-direction: column; background: rgba(45,27,105,0.5); border: 1px solid #3a2a6a; border-radius: var(--r-md); padding: 16px; }
.ed-tier-feature { border-color: #F5C518; box-shadow: 0 0 20px rgba(245,197,24,0.15); }
.ed-flag { position: absolute; top: -10px; right: 14px; background: #9fe8ff; color: #0a2230; font-size: 0.62rem; font-weight: 800; border-radius: 999px; padding: 3px 10px; text-transform: uppercase; }
.ed-tier-name { font-size: 1.1rem; font-weight: 800; color: #f0e6ff; }
.ed-tier-price { font-size: 0.78rem; color: #9a7fd4; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px; }
.ed-tier ul { list-style: none; padding: 0; margin: 0; }
.ed-tier li { color: #c9a7ff; font-size: 0.85rem; line-height: 1.8; border-top: 1px solid rgba(157,127,212,0.12); padding-top: 3px; }
.ed-tier li:first-child { border-top: none; }

/* ---- classroom art kiosk ---- */
.ek-names { display: block; width: 100%; max-width: 420px; background: #160c33; border: 1px solid #4a2f8a;
  border-radius: var(--r-sm); padding: 10px 12px; color: #f0e6ff; font-family: inherit; font-size: 0.92rem;
  margin-bottom: 12px; resize: vertical; }
.ek-names:focus { outline: none; border-color: #F5C518; }
.ek-msg { color: #ff8f9e; font-size: 0.84rem; align-self: center; }
.ek-privacy { color: #9a7fd4; font-size: 0.78rem; margin: 8px 0 0; }
.ek-print { display: none; }

@media print {
  body.ek-printing * { visibility: hidden !important; }
  body.ek-printing .ek-print, body.ek-printing .ek-print * { visibility: visible !important; }
  body.ek-printing .ek-print { display: block; position: absolute; left: 0; top: 0; width: 100%; }
  .ek-card { page-break-after: always; border: 3px solid #002e6d; border-radius: var(--r-lg); padding: 26px;
    max-width: 6.6in; margin: 0 auto; color: #002e6d; background: #fff; position: relative; }
  .ek-card::before { content: ''; position: absolute; inset: 8px; border: 1.5px solid #e3b008;
    border-radius: var(--r-md); pointer-events: none; }
  .ek-eyebrow { text-align: center; font-size: 11px; letter-spacing: 5px; text-transform: uppercase;
    color: #e3b008; font-weight: 800; }
  .ek-brand { text-align: center; font-size: 54px; font-weight: 900; letter-spacing: 4px; line-height: 1;
    margin: 4px 0 16px; }
  .ek-star { color: #e3b008; font-size: 0.55em; vertical-align: 0.28em; margin: 0 9px; }
  .ek-frame { width: 100%; aspect-ratio: 1 / 1; max-height: 5.4in; border: 2px dashed #9bb4d8;
    border-radius: var(--r-md); }
  .ek-artist { text-align: center; margin-top: 14px; font-size: 15px; }
}
</style>
