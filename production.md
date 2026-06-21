---
layout: page
title: The Pilot — Production
permalink: /production/
---

<div class="pr-hero">
  <div class="pr-kicker">Watch it get made</div>
  <h1 class="pr-title">PRINCESS &amp; THE JOURNEY TO CHESS CITY</h1>
  <p class="pr-sub">An animated series, <em>in production</em>. Most studios hide the pipeline until the pilot is done — we're doing it in the open. Here's exactly where the show stands, and how you can shape it.</p>
</div>

<!-- ===== PRODUCTION TRACKER ===== -->
<h2 class="pr-h2">◈ Production Tracker</h2>
<p class="pr-note">Every frame travels the same road: <b>Script → Boards → Layout → Animation → Comp</b>. These bars are updated by hand as the work progresses — <span id="pr-updated">a living dashboard</span>.</p>

<div class="pr-overall">
  <div class="pr-overall-num" id="pr-overall-num">0%</div>
  <div class="pr-overall-lab">Season 1 · overall completion</div>
  <div class="pr-overall-bar"><div class="pr-overall-fill" id="pr-overall-fill"></div></div>
</div>

<div class="pr-eps" id="pr-eps"></div>

<!-- ===== FRAME THE SCENE ===== -->
<h2 class="pr-h2">◈ Frame the Scene</h2>
<p class="pr-note">Help art-direct the show. Two takes on the same shot — pick the one that lands. <span class="pr-muted">(Your vote is saved on this device; a live community tally is coming.)</span></p>
<div class="pr-poll" id="pr-poll"></div>

<!-- ===== OPEN THE BOOTH ===== -->
<h2 class="pr-h2">◈ Open the Booth</h2>
<div class="pr-booth">
  <div class="pr-booth-ico">🎙</div>
  <div>
    <p class="pr-booth-lead">We're casting community voices for side characters — starting with <b>Louie the Bomber</b>.</p>
    <p class="pr-muted">Send a short clip (3–4 lines, any recording). Winners get a credit on the episode. Auditions are read on the dev-log.</p>
    <a class="pr-booth-btn" href="{{ '/contact/' | relative_url }}">Audition for a role →</a>
  </div>
</div>

<!-- ===== LIVING STYLE BIBLE ===== -->
<h2 class="pr-h2">◈ The Living Style Bible</h2>
<p class="pr-note">The world is being designed in public, too. These pages double as the show's art bible:</p>
<div class="pr-bible">
  <a class="pr-bible-card" href="{{ '/characters/' | relative_url }}"><span>♟</span><b>Character Sheets</b><small>turnarounds &amp; dossiers</small></a>
  <a class="pr-bible-card" href="{{ '/locations/' | relative_url }}"><span>🗺️</span><b>Locations</b><small>the world, place by place</small></a>
  <a class="pr-bible-card" href="{{ '/evolutions/' | relative_url }}"><span>✎</span><b>Evolution Log</b><small>how the designs changed</small></a>
  <a class="pr-bible-card" href="{{ '/lore-codex/' | relative_url }}"><span>📖</span><b>Lore Codex</b><small>canon &amp; classified files</small></a>
</div>

<p class="pr-foot">Following along? The <a href="{{ '/mailing-list/' | relative_url }}">dispatch</a> sends a note each time a bar moves.</p>

<script>
(function () {
  /* ============================================================
     PRODUCTION DATA — update these by hand as the work progresses.
     Each stage is a percent 0–100. Stages are weighted equally.
     ============================================================ */
  var STAGES = ['Script', 'Boards', 'Layout', 'Animation', 'Comp'];
  var EPISODES = [
    { id: 'pilot', name: 'Pilot — "Fell From the Sky"', tag: 'Origin', pct: { Script: 55, Boards: 20, Layout: 0, Animation: 0, Comp: 0 } },
    { id: 'e1', name: 'Ch.1 — Checker Town',            tag: 'S1',     pct: { Script: 40, Boards: 0,  Layout: 0, Animation: 0, Comp: 0 } },
    { id: 'e2', name: 'Ch.2 — First Move',              tag: 'S1',     pct: { Script: 15, Boards: 0,  Layout: 0, Animation: 0, Comp: 0 } },
    { id: 'e3', name: 'Ch.3 — The Journey',             tag: 'S1',     pct: { Script: 5,  Boards: 0,  Layout: 0, Animation: 0, Comp: 0 } }
  ];

  /* ============================================================
     FRAME-THE-SCENE polls — swap in real shot mockups any time.
     ============================================================ */
  var POLLS = [
    { id: 'open-shot', q: 'The opening shot of the pilot — how do we meet Checker Town?',
      a: { label: 'Wide & quiet', art: '🌌  a vast night sky, one streak of light falling', note: 'Mystery first — the crash is a rumor.' },
      b: { label: 'Close & loud', art: '💥  smash-cut to the wreck, pieces everywhere', note: 'Action first — drop us in the chaos.' } },
    { id: 'princess-key', q: "Princess's color key:",
      a: { label: 'Warm violet', art: '🟣  regal purples, gold trim', note: 'Storybook royalty.' },
      b: { label: 'Cool slate', art: '🔵  cooler blues, silver trim', note: 'Sci-fi castaway.' } }
  ];

  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function epPct(ep){ var t = 0; STAGES.forEach(function(s){ t += (ep.pct[s] || 0); }); return Math.round(t / STAGES.length); }

  // ---- tracker ----
  function renderTracker() {
    var wrap = document.getElementById('pr-eps'); wrap.innerHTML = '';
    var sum = 0;
    EPISODES.forEach(function (ep) {
      sum += epPct(ep);
      var stageRows = STAGES.map(function (s) {
        var v = ep.pct[s] || 0;
        return '<div class="pr-stage"><span class="pr-stage-lab">' + s + '</span>' +
          '<span class="pr-stage-bar"><i style="width:' + v + '%"></i></span>' +
          '<span class="pr-stage-pct">' + v + '%</span></div>';
      }).join('');
      var el = document.createElement('div'); el.className = 'pr-ep';
      el.innerHTML =
        '<div class="pr-ep-head"><div><span class="pr-ep-tag">' + esc(ep.tag) + '</span> ' +
        '<b class="pr-ep-name">' + esc(ep.name) + '</b></div>' +
        '<div class="pr-ep-pct">' + epPct(ep) + '%</div></div>' + stageRows;
      wrap.appendChild(el);
    });
    var overall = EPISODES.length ? Math.round(sum / EPISODES.length) : 0;
    document.getElementById('pr-overall-num').textContent = overall + '%';
    document.getElementById('pr-overall-fill').style.width = overall + '%';
  }

  // ---- frame the scene (local vote) ----
  function voteKey(id){ return 'pjcc.frame.' + id; }
  function getVote(id){ try { return localStorage.getItem(voteKey(id)); } catch (e) { return null; } }
  function setVote(id, side){ try { localStorage.setItem(voteKey(id), side); } catch (e) {} }
  // illustrative baseline tallies so the bars aren't empty before community voting exists
  var SEED = { 'open-shot': { a: 61, b: 47 }, 'princess-key': { a: 73, b: 38 } };

  function renderPolls() {
    var wrap = document.getElementById('pr-poll'); wrap.innerHTML = '';
    POLLS.forEach(function (p) {
      var mine = getVote(p.id);
      var base = SEED[p.id] || { a: 0, b: 0 };
      var av = base.a + (mine === 'a' ? 1 : 0), bv = base.b + (mine === 'b' ? 1 : 0), tot = av + bv || 1;
      function opt(side, o, v) {
        var pctv = Math.round(v / tot * 100);
        return '<button class="pr-opt' + (mine === side ? ' chosen' : '') + '" data-poll="' + p.id + '" data-side="' + side + '">' +
          '<div class="pr-opt-art">' + esc(o.art) + '</div>' +
          '<div class="pr-opt-label">' + esc(o.label) + '</div>' +
          '<div class="pr-opt-note">' + esc(o.note) + '</div>' +
          '<div class="pr-opt-bar' + (mine ? ' show' : '') + '"><i style="width:' + pctv + '%"></i><span>' + pctv + '%</span></div>' +
          '</button>';
      }
      var el = document.createElement('div'); el.className = 'pr-poll-card';
      el.innerHTML = '<div class="pr-poll-q">' + esc(p.q) + (mine ? ' <span class="pr-voted">✓ voted</span>' : '') + '</div>' +
        '<div class="pr-opts">' + opt('a', p.a, av) + opt('b', p.b, bv) + '</div>';
      wrap.appendChild(el);
    });
    Array.prototype.forEach.call(wrap.querySelectorAll('.pr-opt'), function (btn) {
      btn.onclick = function () { setVote(btn.dataset.poll, btn.dataset.side); renderPolls(); };
    });
  }

  renderTracker();
  renderPolls();
})();
</script>

<style>
.pr-hero { text-align: center; max-width: 760px; margin: 0 auto 6px; }
.pr-kicker { font-size: 0.72rem; letter-spacing: 0.22em; text-transform: uppercase; color: #ff8fd0; }
.pr-title { font-size: 1.8rem; color: #F5C518; letter-spacing: 0.02em; margin: 6px 0; text-shadow: 0 0 20px rgba(245,197,24,0.3); }
.pr-sub { color: #c9a7ff; line-height: 1.6; }
.pr-h2 { color: #F5C518; margin: 30px 0 8px; }
.pr-note { color: #9a7fd4; max-width: 760px; font-size: 0.92rem; }
.pr-note b { color: #c9a7ff; }
.pr-muted { color: #7d6bb0; font-size: 0.85em; }

.pr-overall { background: linear-gradient(135deg,#1f1147,#2d1b69); border: 1px solid rgba(245,197,24,0.3); border-radius: 14px; padding: 16px 20px; margin: 12px 0 16px; text-align: center; }
.pr-overall-num { font-size: 2.4rem; font-weight: 800; color: #F5C518; line-height: 1; }
.pr-overall-lab { color: #9a7fd4; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.08em; margin: 4px 0 10px; }
.pr-overall-bar { height: 12px; background: rgba(157,127,212,0.16); border: 1px solid #4a2f8a; border-radius: 999px; overflow: hidden; }
.pr-overall-fill { height: 100%; width: 0; background: linear-gradient(90deg,#6b5fa0,#F5C518,#ff8fd0); transition: width 1s ease; }

.pr-eps { display: grid; gap: 12px; }
.pr-ep { background: rgba(45,27,105,0.5); border: 1px solid #3a2a6a; border-radius: 12px; padding: 14px 16px; }
.pr-ep-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }
.pr-ep-tag { font-size: 0.62rem; background: #2D1B69; border: 1px solid #6b5fa0; color: #c9a7ff; border-radius: 999px; padding: 2px 8px; letter-spacing: 0.06em; }
.pr-ep-name { color: #f0e6ff; margin-left: 4px; }
.pr-ep-pct { font-family: 'Courier New', monospace; font-weight: 800; color: #F5C518; }
.pr-stage { display: flex; align-items: center; gap: 10px; padding: 3px 0; }
.pr-stage-lab { width: 78px; font-size: 0.78rem; color: #9a7fd4; flex: 0 0 auto; }
.pr-stage-bar { flex: 1; height: 8px; background: rgba(20,12,45,0.6); border-radius: 999px; overflow: hidden; }
.pr-stage-bar i { display: block; height: 100%; background: linear-gradient(90deg,#6b5fa0,#F5C518); border-radius: 999px; }
.pr-stage-pct { width: 38px; text-align: right; font-size: 0.74rem; color: #c9a7ff; flex: 0 0 auto; }

.pr-poll { display: grid; gap: 14px; }
.pr-poll-card { background: rgba(45,27,105,0.4); border: 1px solid #3a2a6a; border-radius: 12px; padding: 14px 16px; }
.pr-poll-q { color: #f0e6ff; font-weight: 700; margin-bottom: 10px; }
.pr-voted { color: #6bffb8; font-size: 0.78rem; font-weight: 600; }
.pr-opts { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
@media (max-width: 520px) { .pr-opts { grid-template-columns: 1fr; } }
.pr-opt { text-align: left; background: #221444; border: 1px solid #4a2f8a; border-radius: 10px; padding: 12px; cursor: pointer; color: #c9a7ff; font-family: inherit; transition: all 0.14s; }
.pr-opt:hover { border-color: #F5C518; transform: translateY(-2px); }
.pr-opt.chosen { border-color: #6bffb8; box-shadow: 0 0 0 1px #6bffb8 inset; }
.pr-opt-art { font-size: 1.05rem; color: #f0e6ff; margin-bottom: 6px; }
.pr-opt-label { font-weight: 800; color: #F5C518; }
.pr-opt-note { font-size: 0.82rem; color: #9a7fd4; margin-bottom: 6px; }
.pr-opt-bar { position: relative; height: 16px; background: rgba(20,12,45,0.7); border-radius: 999px; overflow: hidden; opacity: 0; transition: opacity 0.3s; }
.pr-opt-bar.show { opacity: 1; }
.pr-opt-bar i { display: block; height: 100%; background: linear-gradient(90deg,#6b5fa0,#ff8fd0); }
.pr-opt-bar span { position: absolute; right: 8px; top: 0; font-size: 0.7rem; line-height: 16px; color: #fff; font-weight: 700; }

.pr-booth { display: flex; gap: 14px; align-items: flex-start; background: rgba(245,197,24,0.06); border: 1px solid #6b5fa0; border-radius: 12px; padding: 16px; }
.pr-booth-ico { font-size: 34px; }
.pr-booth-lead { color: #f0e6ff; font-weight: 600; }
.pr-booth-btn { display: inline-block; margin-top: 8px; background: #F5C518; color: #1a0f3d; font-weight: 800; text-decoration: none; border-radius: 999px; padding: 9px 18px; }
.pr-booth-btn:hover { background: #ffd740; }

.pr-bible { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 10px; }
.pr-bible-card { display: flex; flex-direction: column; gap: 2px; background: rgba(45,27,105,0.5); border: 1px solid #3a2a6a; border-radius: 12px; padding: 14px; text-decoration: none; transition: all 0.14s; }
.pr-bible-card:hover { border-color: #F5C518; transform: translateY(-2px); }
.pr-bible-card span { font-size: 26px; }
.pr-bible-card b { color: #f0e6ff; }
.pr-bible-card small { color: #9a7fd4; font-size: 0.76rem; }
.pr-foot { color: #9a7fd4; margin-top: 24px; }
.pr-foot a, .pr-booth a, .pr-note a { color: #F5C518; }
</style>
