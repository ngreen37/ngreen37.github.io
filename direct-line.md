---
layout: page
title: The Direct Line
permalink: /direct-line/
brand: mcpuppy
body_class: theme-studio
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
/* Direct Line — an "open comms line" in McPuppy graphite: monochrome panels with a single
   live teal SIGNAL accent + an on-air pulse (Nate 2026-07-15: "modify the accents… be
   creative"). Reads as a private hotline that's LIVE, not the arcade gold. */
.dl-head { max-width:680px; margin:0 auto 1.8rem; text-align:center; }
.dl-eyebrow { font-family:'Share Tech Mono',monospace; font-size:0.72rem; letter-spacing:0.16em; text-transform:uppercase; color:#8b9096; }
.dl-soon { color:#08110f; background:#4fd1c5; border-radius:999px; padding:1px 10px 1px 8px; font-weight:800;
  display:inline-flex; align-items:center; gap:5px; }
.dl-soon::before { content:''; width:6px; height:6px; border-radius:50%; background:#08110f;
  box-shadow:0 0 0 0 rgba(8,17,15,0.6); animation:dl-onair 1.6s ease-in-out infinite; }
@keyframes dl-onair { 0%,100%{ opacity:1; } 50%{ opacity:0.35; } }
.dl-title { font-size:2.4rem; font-weight:900; color:#fff; margin:0.4rem 0 0.5rem; }
.dl-sub { color:#c9c9d0; font-size:1.02rem; line-height:1.6; }
.dl-sub strong { color:#f2f2f4; }

.dl-steps { max-width:680px; margin:0 auto 1.6rem; display:flex; flex-direction:column; gap:10px; }
.dl-step { display:flex; gap:14px; align-items:flex-start; background:rgba(255,255,255,0.05);
  border:1px solid rgba(255,255,255,0.13); border-radius:12px; padding:13px 16px; color:#c9c9d0; font-size:0.95rem; line-height:1.5;
  border-left:3px solid rgba(79,209,197,0.55); }
.dl-step strong { color:#fff; }
.dl-step-n { flex-shrink:0; width:26px; height:26px; border-radius:50%; background:#4fd1c5; color:#08110f;
  font-weight:900; font-size:0.85rem; display:flex; align-items:center; justify-content:center; }

.dl-note { max-width:680px; margin:0 auto 1.2rem; color:#9a9aa2; font-size:0.92rem; line-height:1.6; text-align:center; }
.dl-note strong { color:#4fd1c5; }
.dl-cta { max-width:680px; margin:0 auto; display:flex; gap:12px; justify-content:center; flex-wrap:wrap; }
.dl-btn { display:inline-block; text-decoration:none; font-weight:800; font-size:0.92rem; border-radius:999px;
  padding:11px 22px; background:#4fd1c5; color:#08110f; border:2px solid #4fd1c5; transition:transform .12s, filter .12s; }
.dl-btn:hover { transform:translateY(-2px); filter:brightness(1.08); }
.dl-btn--ghost { background:transparent; color:#7fe3d8; border-color:rgba(79,209,197,0.6); }
.dl-btn--ghost:hover { background:rgba(79,209,197,0.12); }
/* out-specify body.theme-studio a (gold) so the CTA text + inline links wear the signal teal */
.dl-cta a.dl-btn { color:#08110f; }
.dl-cta a.dl-btn--ghost { color:#7fe3d8; }
.dl-step a, .dl-level a { color:#7fe3d8; }

.dl-levels { max-width:680px; margin:0 auto 1.6rem; }
.dl-levels-head { color:#7fe3d8; font-weight:800; font-size:0.78rem; letter-spacing:0.1em; text-transform:uppercase; text-align:center; margin-bottom:10px; }
.dl-level { display:flex; gap:12px; align-items:flex-start; background:rgba(255,255,255,0.045); border:1px solid rgba(255,255,255,0.13);
  border-radius:12px; padding:13px 16px; color:#c9c9d0; font-size:0.95rem; line-height:1.5; margin-bottom:10px; }
.dl-level strong { color:#fff; }
.dl-level a { color:#7fe3d8; }
.dl-level--top { border-color:rgba(255,255,255,0.2); border-left:3px solid #4fd1c5; }
.dl-level-badge { flex-shrink:0; font-size:0.62rem; font-weight:800; letter-spacing:0.08em; text-transform:uppercase;
  color:#c9c9d0; background:rgba(79,209,197,0.14); border:1px solid rgba(255,255,255,0.2); border-radius:999px; padding:3px 10px; white-space:nowrap; }
.dl-level-badge--top { color:#08110f; background:#4fd1c5; border-color:#4fd1c5; }
@media (prefers-reduced-motion: reduce){ .dl-soon::before { animation:none; } }
</style>
