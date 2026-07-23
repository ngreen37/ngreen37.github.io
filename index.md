---
layout: default
title: McPuppy Studios
permalink: /
body_class: theme-bw
tab_title: McPuppy Studios — home of Princess and the Journey to Chess City
description: McPuppy Studios — an independent one-person studio building Princess and the Journey to Chess City: an animated series, a chess academy, and a world of free chess games.
---

{% comment %} ── THE FRONT DOOR (2026-07-22) ────────────────────────────────────────────
     Nate: "The website URL is mcpuppystudios.com, so our home page must be a black/white
     McPuppy Home page." So `/` is now the STUDIO's front door — black & white — and the
     PJCC world moved to /pjcc/ (see pjcc.md). This is the second front-door move; the
     first (2026-07-21, docs/front-door-2026-07-21.md) made PJCC the front door. This one
     puts the studio's name on the domain's door and folds PJCC into the six-link drawer.

     What used to be here: a /pjcc/ redirect stub. /pjcc/ is now a REAL page again (the
     PJCC landing), so nothing 404s — installed PWAs and sw.js precache both still resolve.
     The manifest `id` is untouched (still /pjcc/ — never change it).

     It is a STUDIO LANDING that also surfaces the six destinations, so a visitor doesn't
     have to open the drawer to get anywhere (Nate: "something where you don't have to
     click through too much"). PJCC is the standout. `tab_title`/`description` are new: this
     page's identity changed, so its <title> honestly names the studio now. {% endcomment %}

{% assign latest = site.posts.first %}

<style>
/* ── McPUPPY STUDIOS HOME — a black & white studio landing (2026-07-22) ──────────────
   theme-bw already blanks the town sky and paints the page black, so this only styles the
   hero, the six destination tiles and the build-log line. Monochrome by rule: one white
   accent, greys for everything quieter. Motion is transform/opacity only (the perf rule). */
.mcp-home { max-width: 940px; margin: 0 auto; }

.mcp-hero { text-align: center; padding: 26px 12px 30px; }
.mcp-hero-logo { height: 96px; width: auto; margin: 0 auto 10px; display: block;
  filter: invert(1); opacity: 0.96; }
.mcp-hero h1 { font-family: 'Poppins', sans-serif; font-weight: 800; letter-spacing: 0.02em;
  font-size: clamp(2rem, 6vw, 3.2rem); margin: 0 0 6px; color: #fff; line-height: 1.05; }
.mcp-hero-promise { max-width: 640px; margin: 0 auto 22px; color: #b9b9b9;
  font-size: clamp(1rem, 2.2vw, 1.16rem); line-height: 1.55; }
.mcp-hero-promise b { color: #fff; font-weight: 700; }
.mcp-cta { display: inline-flex; align-items: center; gap: 10px; text-decoration: none;
  font-family: 'Poppins', sans-serif; font-weight: 800; font-size: 1.05rem; letter-spacing: 0.02em;
  color: #000; background: #fff; border: 2px solid #fff; border-radius: 999px; padding: 12px 26px;
  transition: transform 0.16s ease, box-shadow 0.16s ease; }
.mcp-cta:hover, .mcp-cta:focus-visible { color: #000; text-decoration: none;
  transform: translateY(-2px); box-shadow: 0 10px 30px -8px rgba(255,255,255,0.4); }
.mcp-cta .mcp-cta-arrow { transition: transform 0.16s ease; }
.mcp-cta:hover .mcp-cta-arrow { transform: translateX(4px); }

/* the six doors — one grid, PJCC featured (spans wider on desktop) */
.mcp-eyebrow { text-align: center; font-family: 'Share Tech Mono', monospace; font-size: 0.72rem;
  letter-spacing: 0.22em; text-transform: uppercase; color: #6f6f6f; margin: 30px 0 12px; }
.mcp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 12px;
  margin: 0 6px; }
.mcp-tile { display: flex; align-items: center; gap: 13px; text-decoration: none;
  background: #101010; border: 1px solid #2a2a2a; border-radius: 14px; padding: 15px 16px;
  transition: transform 0.15s ease, border-color 0.15s ease, background 0.15s ease; }
.mcp-tile:hover, .mcp-tile:focus-visible { text-decoration: none; transform: translateY(-3px);
  border-color: #ffffff; background: #161616; }
.mcp-tile-ico { flex: 0 0 auto; width: 42px; height: 42px; display: flex; align-items: center;
  justify-content: center; font-size: 1.35rem; border-radius: 11px; background: #1e1e1e; color: #fff; }
.mcp-tile-txt { min-width: 0; }
.mcp-tile-txt b { display: block; font-family: 'Poppins', sans-serif; font-weight: 700;
  font-size: 1.02rem; color: #fff; }
.mcp-tile-txt small { display: block; font-size: 0.78rem; color: #9a9a9a; margin-top: 1px; }
/* PJCC stands out — brighter frame + a faint glow, and it leads the grid across the top */
.mcp-tile--pjcc { grid-column: 1 / -1; border-color: #ffffff;
  background: linear-gradient(180deg, #1a1a1a, #101010); box-shadow: 0 0 0 1px rgba(255,255,255,0.18) inset; }
.mcp-tile--pjcc .mcp-tile-ico { background: #fff; color: #000; }
.mcp-tile--pjcc .mcp-tile-txt b { font-size: 1.14rem; }

/* the studio is awake — the newest build-log post */
.mcp-log { text-align: center; margin: 30px 6px 8px; padding: 16px; border-top: 1px solid #222; }
.mcp-log-k { font-family: 'Share Tech Mono', monospace; font-size: 0.7rem; letter-spacing: 0.18em;
  text-transform: uppercase; color: #6f6f6f; }
.mcp-log a { color: #fff; text-decoration: none; font-weight: 600; }
.mcp-log a:hover { text-decoration: underline; }
.mcp-log-date { color: #7a7a7a; font-size: 0.82rem; }

@media (prefers-reduced-motion: reduce) {
  .mcp-cta, .mcp-tile, .mcp-cta-arrow { transition: none; }
}
@media (max-width: 480px) {
  .mcp-hero-logo { height: 74px; }
}
</style>

<div class="mcp-home">

  <section class="mcp-hero">
    <img class="mcp-hero-logo" src="{{ '/assets/images/mcpuppy-logo-stacked.svg' | relative_url }}" alt="">
    <h1>McPuppy Studios</h1>
    <p class="mcp-hero-promise">An independent, one-person studio building <b>Princess and the Journey to Chess City</b> — an animated series in the making, a chess academy, and a whole world of free games.</p>
    <a class="mcp-cta" href="{{ '/pjcc/' | relative_url }}">Enter PJCC <span class="mcp-cta-arrow" aria-hidden="true">&rarr;</span></a>
  </section>

  <p class="mcp-eyebrow">Jump straight in</p>
  <nav class="mcp-grid" aria-label="Explore the site">
    <a class="mcp-tile mcp-tile--pjcc" href="{{ '/pjcc/' | relative_url }}">
      <span class="mcp-tile-ico" aria-hidden="true">&#9670;</span>
      <span class="mcp-tile-txt"><b>PJCC — the world</b><small>The cast, the places, the fan art</small></span>
    </a>
    <a class="mcp-tile" href="{{ '/games/park-tables/' | relative_url }}">
      <span class="mcp-tile-ico" aria-hidden="true">&#9654;</span>
      <span class="mcp-tile-txt"><b>Play Now</b><small>Sit at the Park Tables</small></span>
    </a>
    <a class="mcp-tile" href="{{ '/games/the-gauntlet/' | relative_url }}">
      <span class="mcp-tile-ico" aria-hidden="true">&#9819;</span>
      <span class="mcp-tile-txt"><b>The Gauntlet</b><small>Climb the tower of ten</small></span>
    </a>
    <a class="mcp-tile" href="{{ '/games/fork-in-the-road/' | relative_url }}">
      <span class="mcp-tile-ico" aria-hidden="true">&#9876;</span>
      <span class="mcp-tile-txt"><b>Puzzles</b><small>Fork in the Road</small></span>
    </a>
    <a class="mcp-tile" href="{{ '/academy/' | relative_url }}">
      <span class="mcp-tile-ico" aria-hidden="true">&#9812;</span>
      <span class="mcp-tile-txt"><b>Academy</b><small>Learn chess from scratch</small></span>
    </a>
    <a class="mcp-tile" href="{{ '/projects/' | relative_url }}">
      <span class="mcp-tile-ico" aria-hidden="true">&#128062;</span>
      <span class="mcp-tile-txt"><b>Projects</b><small>Inside the studio</small></span>
    </a>
  </nav>

  {% if latest %}
  <div class="mcp-log">
    <div class="mcp-log-k">Latest from the build log</div>
    <a href="{{ latest.url | relative_url }}">{{ latest.title }}</a>
    <span class="mcp-log-date">&middot; {{ latest.date | date: "%b %-d, %Y" }}</span>
  </div>
  {% endif %}

</div>
