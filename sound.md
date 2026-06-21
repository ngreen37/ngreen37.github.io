---
layout: page
title: The Sound of PJCC
permalink: /sound/
---

<div class="snd-intro">
  <div class="snd-kicker">Audio · a first-class pillar</div>
  <p class="snd-sub">Music is in the studio's DNA. Before there's animation, there's a <i>sound</i> — a theme you can hum, a voice in the dark. This is the audio wing of McPuppy Studios: what's playing now, and what's coming.</p>
</div>

<!-- ===== 1 · LEITMOTIFS (shipped, live) ===== -->
<h2 class="snd-h2">◈ Character Leitmotifs <span class="snd-live">Live</span></h2>
<p class="snd-note">Every character carries a tiny musical signature — generated live in your browser, the same notes every time, no audio files. Tap one to hear who walks into the room. <span class="snd-muted">Best with sound on.</span></p>

<div class="lm-controls">
  <button class="lm-ensemble" id="lm-ensemble" type="button">▶ Play the whole ensemble</button>
  <span class="lm-now" id="lm-now"></span>
</div>

<div class="lm-grid">
  {% assign chars = site.characters | sort: 'order' %}
  {% for char in chars %}
  <button class="lm-card" type="button" data-name="{{ char.title }}">
    <span class="lm-piece">{{ char.piece | default: '♟' }}</span>
    <span class="lm-name">{{ char.title }}</span>
    {% if char.role %}<span class="lm-role">{{ char.role }}</span>{% endif %}
    <span class="lm-play">♪ play theme</span>
  </button>
  {% endfor %}
</div>
<p class="snd-foot-note">Want a character's theme in context? Each lives on its <a href="{{ '/characters/' | relative_url }}">character page</a> too.</p>

<!-- ===== 2 · THE SCORE / EP (coming soon) ===== -->
<h2 class="snd-h2">◈ The Score &amp; EP <span class="snd-soon">Coming Soon</span></h2>
<p class="snd-note">An original score is on the roadmap — proper themes for the places and people of the show, collected as an EP. <b>Not recorded yet.</b> Here's the planned track order; the leitmotifs above are the seeds these will grow from.</p>

<div class="snd-album">
  <div class="snd-album-cover" aria-hidden="true">
    <span class="snd-album-disc">♫</span>
    <span class="snd-album-stamp">EP · TBA</span>
  </div>
  <ol class="snd-tracklist">
    <li><span class="snd-tk-name">Princess's Theme</span><span class="snd-tk-desc">the main title</span><span class="snd-tk-lock">🔒</span></li>
    <li><span class="snd-tk-name">Checker Town</span><span class="snd-tk-desc">home — and the wish to leave it</span><span class="snd-tk-lock">🔒</span></li>
    <li><span class="snd-tk-name">The Crossing</span><span class="snd-tk-desc">the sea between two worlds</span><span class="snd-tk-lock">🔒</span></li>
    <li><span class="snd-tk-name">Shogi Isle</span><span class="snd-tk-desc">foreign shores, foreign rules</span><span class="snd-tk-lock">🔒</span></li>
    <li><span class="snd-tk-name">Chess City</span><span class="snd-tk-desc">the gleaming gate</span><span class="snd-tk-lock">🔒</span></li>
    <li><span class="snd-tk-name">The CEO</span><span class="snd-tk-desc">villain motif — restricted</span><span class="snd-tk-lock">🔒</span></li>
  </ol>
</div>
<p class="snd-foot-note"><a href="{{ '/mailing-list/' | relative_url }}">Join the dispatch</a> — the first theme drops there before anywhere else.</p>

<!-- ===== 3 · RADIO DRAMA (coming soon) ===== -->
<h2 class="snd-h2">◈ The Audio-Fiction Pilot <span class="snd-soon">Coming Soon</span></h2>
<div class="snd-cards">
  <div class="snd-card">
    <div class="snd-card-ico">🎧</div>
    <div>
      <p class="snd-card-lead">Hear the pilot before you ever see it.</p>
      <p class="snd-muted">Animation is slow and expensive; a voiced <b>radio drama</b> of "Fell From the Sky" ships years sooner for a fraction of the cost — and tests the writing, the cast, and the tone out loud, live. It's the smartest first cut of the show. Recording hasn't started.</p>
      <div class="snd-card-links">
        <a class="snd-link" href="{{ '/production/' | relative_url }}">▶ See the Pilot animatic</a>
        <a class="snd-link" href="{{ '/writers-room/' | relative_url }}">✎ Help write it in the Writers' Room</a>
      </div>
    </div>
  </div>
</div>

<!-- ===== 4 · NOTATION BLITZ: SCORE MODE (coming soon) ===== -->
<h2 class="snd-h2">◈ Notation Blitz: Score Mode <span class="snd-soon">Coming Soon</span></h2>
<div class="snd-cards">
  <div class="snd-card">
    <div class="snd-card-ico">🎹</div>
    <div>
      <p class="snd-card-lead">Play the soundtrack like a rhythm game.</p>
      <p class="snd-muted">Once the themes exist, they become playable charts inside <b>Notation Blitz</b> — read the board <i>to the beat</i> of the actual PJCC score. It arrives with the music it needs.</p>
      <div class="snd-card-links">
        <a class="snd-link" href="{{ '/games/notation-run/' | relative_url }}">▶ Play Notation Blitz now</a>
      </div>
    </div>
  </div>
</div>

<!-- ===== 5 · COMMUNITY REMIXES (coming soon) ===== -->
<h2 class="snd-h2">◈ Community Remixes <span class="snd-soon">Coming Soon</span></h2>
<div class="snd-cards">
  <div class="snd-card">
    <div class="snd-card-ico">🎛️</div>
    <div>
      <p class="snd-card-lead">Score the studio's build sessions.</p>
      <p class="snd-muted">The <a href="{{ '/soundtrack/' | relative_url }}">Build Playlist</a> is the music played while making this — soon you'll be able to <b>submit a track</b> for it, with a featured fan slot each season. Submissions open with Operative accounts.</p>
      <div class="snd-card-links">
        <a class="snd-link" href="{{ '/soundtrack/' | relative_url }}">♫ Hear the Build Playlist</a>
        <a class="snd-link" href="{{ '/mailing-list/' | relative_url }}">✦ Get notified when it opens</a>
      </div>
    </div>
  </div>
</div>

<script src="{{ '/assets/js/pjcc-leitmotif.js' | relative_url }}"></script>
<script>
(function () {
  "use strict";
  var cards = Array.prototype.slice.call(document.querySelectorAll('.lm-card'));
  if (!cards.length) return;
  var nowEl = document.getElementById('lm-now');
  var ensBtn = document.getElementById('lm-ensemble');
  var noAudio = !(window.AudioContext || window.webkitAudioContext);
  if (noAudio) { if (ensBtn) ensBtn.style.display = 'none'; }

  var timers = [], ensembleOn = false;

  function clearPulse(){ cards.forEach(function (c) { c.classList.remove('is-playing'); }); }
  function pulse(card){
    clearPulse(); card.classList.add('is-playing');
    if (nowEl) nowEl.textContent = '♪ ' + card.getAttribute('data-name');
    setTimeout(function () { card.classList.remove('is-playing'); if (!ensembleOn && nowEl) nowEl.textContent = ''; }, 2400);
  }
  function playOne(card){ if (window.PJCCLeitmotif) { try { PJCCLeitmotif.play(card.getAttribute('data-name')); } catch (e) {} } pulse(card); }

  function stopEnsemble(){ timers.forEach(clearTimeout); timers = []; ensembleOn = false; if (ensBtn) ensBtn.innerHTML = '▶ Play the whole ensemble'; if (nowEl) nowEl.textContent = ''; }
  function startEnsemble(){
    stopEnsemble(); ensembleOn = true; ensBtn.innerHTML = '■ Stop';
    cards.forEach(function (card, i) {
      timers.push(setTimeout(function () { playOne(card); }, i * 2300));
    });
    timers.push(setTimeout(function () { stopEnsemble(); }, cards.length * 2300 + 400));
  }

  cards.forEach(function (card) {
    card.addEventListener('click', function () { stopEnsemble(); playOne(card); });
  });
  if (ensBtn) ensBtn.addEventListener('click', function () { ensembleOn ? stopEnsemble() : startEnsemble(); });
})();
</script>

<style>
.snd-intro { max-width: 760px; margin-bottom: 14px; }
.snd-kicker { font-size: 0.72rem; letter-spacing: 0.22em; text-transform: uppercase; color: #ff8fd0; }
.snd-sub { color: #c9a7ff; line-height: 1.6; }
.snd-h2 { color: #F5C518; margin: 28px 0 8px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.snd-note { color: #9a7fd4; max-width: 760px; font-size: 0.92rem; line-height: 1.6; }
.snd-note b { color: #c9a7ff; }
.snd-muted { color: #7d6bb0; font-size: 0.88em; }
.snd-foot-note { color: #9a7fd4; font-size: 0.84rem; margin-top: 8px; }
.snd-foot-note a, .snd-note a { color: #F5C518; }
.snd-live { font-size: 0.56rem; letter-spacing: 0.12em; text-transform: uppercase; color: #06210f; background: #6bffb8; padding: 3px 9px; border-radius: 999px; font-weight: 800; }
.snd-soon { font-size: 0.56rem; letter-spacing: 0.12em; text-transform: uppercase; color: #1a0f3d; background: #ff8fd0; padding: 3px 9px; border-radius: 999px; font-weight: 800; }

/* leitmotif gallery */
.lm-controls { display: flex; align-items: center; gap: 12px; margin: 12px 0 10px; flex-wrap: wrap; }
.lm-ensemble { background: #F5C518; color: #1a0f3d; border: none; border-radius: 999px; padding: 9px 18px; font-family: inherit; font-weight: 800; font-size: 0.86rem; cursor: pointer; transition: all 0.14s; }
.lm-ensemble:hover { background: #ffd740; }
.lm-now { color: #6bffb8; font-family: 'Courier New', monospace; font-size: 0.84rem; min-height: 1em; }
.lm-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; }
.lm-card { display: flex; flex-direction: column; align-items: center; gap: 3px; background: rgba(45,27,105,0.5); border: 1px solid #3a2a6a; border-radius: 12px; padding: 16px 12px; cursor: pointer; font-family: inherit; color: #f0e6ff; transition: all 0.14s; position: relative; overflow: hidden; }
.lm-card:hover { border-color: #F5C518; transform: translateY(-2px); }
.lm-card.is-playing { border-color: #6bffb8; box-shadow: 0 0 0 1px #6bffb8 inset, 0 0 22px rgba(107,255,184,0.25); }
.lm-card.is-playing::after { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 50% 30%, rgba(107,255,184,0.18), transparent 70%); animation: lm-glow 0.9s ease infinite alternate; pointer-events: none; }
@keyframes lm-glow { from { opacity: 0.4; } to { opacity: 1; } }
.lm-piece { font-size: 30px; line-height: 1; color: #F5C518; }
.lm-card.is-playing .lm-piece { color: #6bffb8; }
.lm-name { font-weight: 800; font-size: 0.95rem; }
.lm-role { font-size: 0.72rem; color: #9a7fd4; text-align: center; }
.lm-play { margin-top: 5px; font-size: 0.72rem; color: #c9a7ff; background: rgba(245,197,24,0.10); border: 1px solid #6b5fa0; border-radius: 999px; padding: 2px 10px; }
.lm-card.is-playing .lm-play { color: #6bffb8; border-color: #2f6f55; }

/* coming-soon album */
.snd-album { display: flex; gap: 16px; align-items: flex-start; background: rgba(45,27,105,0.4); border: 1px solid #3a2a6a; border-radius: 14px; padding: 16px; margin-top: 8px; flex-wrap: wrap; }
.snd-album-cover { flex: 0 0 auto; width: 130px; height: 130px; border-radius: 10px; background: linear-gradient(135deg,#2D1B69,#5B2D8E); border: 1px solid #6b5fa0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; position: relative; }
.snd-album-disc { font-size: 52px; color: #F5C518; opacity: 0.85; }
.snd-album-stamp { font-family: 'Courier New', monospace; font-size: 0.66rem; letter-spacing: 0.14em; color: #ffd36b; border: 1px solid #ffd36b; border-radius: 999px; padding: 2px 8px; }
.snd-tracklist { flex: 1; min-width: 240px; margin: 0; padding: 0; list-style: none; counter-reset: tk; }
.snd-tracklist li { counter-increment: tk; display: flex; align-items: center; gap: 10px; padding: 8px 4px; border-bottom: 1px solid #2a1f52; }
.snd-tracklist li::before { content: counter(tk, decimal-leading-zero); font-family: 'Courier New', monospace; font-size: 0.78rem; color: #6a5a98; flex: 0 0 auto; width: 22px; }
.snd-tk-name { color: #f0e6ff; font-weight: 700; font-size: 0.92rem; }
.snd-tk-desc { color: #8a78ba; font-size: 0.8rem; flex: 1; }
.snd-tk-lock { opacity: 0.6; }

/* coming-soon cards */
.snd-cards { display: flex; flex-direction: column; gap: 10px; margin-top: 8px; }
.snd-card { display: flex; gap: 14px; align-items: flex-start; background: rgba(245,197,24,0.05); border: 1px solid #6b5fa0; border-radius: 12px; padding: 16px; }
.snd-card-ico { font-size: 32px; flex: 0 0 auto; }
.snd-card-lead { color: #f0e6ff; font-weight: 700; margin-bottom: 4px; }
.snd-card-lead + .snd-muted b, .snd-muted b { color: #c9a7ff; }
.snd-card-links { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px; }
.snd-link { display: inline-block; background: #221444; border: 1px solid #4a2f8a; color: #c9a7ff; border-radius: 999px; padding: 7px 14px; font-size: 0.82rem; font-weight: 700; text-decoration: none; transition: all 0.12s; }
.snd-link:hover { border-color: #F5C518; color: #fff; }
</style>
