---
layout: page
title: The Direct Line
permalink: /direct-line/
brand: mcpuppy
---

<div class="dl-head">
  <div class="dl-eyebrow">McPuppy Studios · Patreon Perk · <span class="dl-soon">Open now</span></div>
  <h1 class="dl-title">The Direct Line</h1>
  <p class="dl-sub">Write <strong>to me</strong>. I write back.</p>
</div>

<div class="dl-steps">
  <div class="dl-step"><span class="dl-step-n">1</span><div><strong>{% if site.patreon_url and site.patreon_url != '' %}<a href="{{ site.patreon_url }}" target="_blank" rel="noopener">Back the studio on Patreon.</a>{% else %}Back the studio on Patreon.{% endif %}</strong> The Direct Line unlocks there.</div></div>
  <div class="dl-step"><span class="dl-step-n">2</span><div><strong>Send a suggestion.</strong> A game, character, feature, fix.</div></div>
  <div class="dl-step"><span class="dl-step-n">3</span><div><strong>Get a guaranteed reply.</strong> A real answer, from me — always genuine, and always appropriate for all ages.</div></div>
  <div class="dl-step"><span class="dl-step-n">4</span><div><strong>Already on the roadmap?</strong> You hear first — and get rewarded.</div></div>
</div>

<div class="dl-levels">
  <div class="dl-levels-head">Where it sits on Patreon</div>
  <div class="dl-level dl-level--top">
    <span class="dl-level-badge dl-level-badge--top">Higher tier</span>
    <div><strong>✉ The Direct Line.</strong> A private line straight to me.</div>
  </div>
</div>

<div class="dl-cta">
  {% if site.patreon_url and site.patreon_url != '' %}<a class="dl-btn" href="{{ site.patreon_url }}" target="_blank" rel="noopener">Open the Direct Line on Patreon →</a>{% else %}<a class="dl-btn" href="/mailing-list/">Tell me when it opens →</a>{% endif %}
  <a class="dl-btn dl-btn--ghost" href="/mailing-list/">Join the dispatch</a>
</div>

<style>
.dl-head { max-width:680px; margin:0 auto 1.8rem; text-align:center; }
.dl-eyebrow { font-family:'Share Tech Mono',monospace; font-size:0.72rem; letter-spacing:0.16em; text-transform:uppercase; color:#9a8fc0; }
.dl-soon { color:#1a0f3d; background:#F5C518; border-radius:999px; padding:1px 10px; font-weight:800; }
.dl-title { font-size:2.4rem; font-weight:900; color:#fff; margin:0.4rem 0 0.5rem; }
.dl-sub { color:#cdbcf2; font-size:1.02rem; line-height:1.6; }
.dl-sub strong { color:#f0e6ff; }

.dl-steps { max-width:680px; margin:0 auto 1.6rem; display:flex; flex-direction:column; gap:10px; }
.dl-step { display:flex; gap:14px; align-items:flex-start; background:rgba(110,95,160,0.12);
  border:1px solid #4a3a86; border-radius:12px; padding:13px 16px; color:#cdbcf2; font-size:0.95rem; line-height:1.5; }
.dl-step strong { color:#f0e6ff; }
.dl-step-n { flex-shrink:0; width:26px; height:26px; border-radius:50%; background:#F5C518; color:#1a0f3d;
  font-weight:900; font-size:0.85rem; display:flex; align-items:center; justify-content:center; }

.dl-note { max-width:680px; margin:0 auto 1.2rem; color:#a896d4; font-size:0.92rem; line-height:1.6; text-align:center; }
.dl-note strong { color:#F5C518; }
.dl-cta { max-width:680px; margin:0 auto; display:flex; gap:12px; justify-content:center; flex-wrap:wrap; }
.dl-btn { display:inline-block; text-decoration:none; font-weight:800; font-size:0.92rem; border-radius:999px;
  padding:11px 22px; background:#F5C518; color:#1a0f3d; border:2px solid #F5C518; transition:transform .12s, filter .12s; }
.dl-btn:hover { transform:translateY(-2px); filter:brightness(1.07); }
.dl-btn--ghost { background:transparent; color:#F5C518; }
.dl-btn--ghost:hover { background:rgba(245,197,24,0.1); }

.dl-levels { max-width:680px; margin:0 auto 1.6rem; }
.dl-levels-head { color:#F5C518; font-weight:800; font-size:0.78rem; letter-spacing:0.1em; text-transform:uppercase; text-align:center; margin-bottom:10px; }
.dl-level { display:flex; gap:12px; align-items:flex-start; background:rgba(110,95,160,0.1); border:1px solid #4a3a86;
  border-radius:12px; padding:13px 16px; color:#cdbcf2; font-size:0.95rem; line-height:1.5; margin-bottom:10px; }
.dl-level strong { color:#f0e6ff; }
.dl-level a { color:#F5C518; }
.dl-level--top { border-color:#6b5fa0; border-left:3px solid #F5C518; }
.dl-level-badge { flex-shrink:0; font-size:0.62rem; font-weight:800; letter-spacing:0.08em; text-transform:uppercase;
  color:#cdbcf2; background:rgba(245,197,24,0.14); border:1px solid #6b5fa0; border-radius:999px; padding:3px 10px; white-space:nowrap; }
.dl-level-badge--top { color:#1a0f3d; background:#F5C518; border-color:#F5C518; }
</style>
