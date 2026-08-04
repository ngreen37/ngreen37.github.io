---
# `/chess/` IS A REDIRECT NOW — it must render with NO site layout, so `layout: null` stays.
#
# The key being merely ABSENT is not the same as null: GitHub Pages once re-emitted a file
# from a stale cache entry that still recorded an OLD layout, and served the wrong page.
# Pinning it null forces the standalone render every build. (2026-07-24)
layout: null
permalink: /chess/
sitemap: false
tab_title: ChessWild
description: ChessWild — free chess for everyone. Play a real game, solve a puzzle, or learn from scratch.
---
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  {%- comment -%}
    ══════════════════════════════════════════════════════════════════════════════
    THE FRONT DOOR MOVED TO `/` (2026-08-03, Nate: "I just bought chesswild.com…
    let's reset the structure of the site with this now in mind.")
    ──────────────────────────────────────────────────────────────────────────────
    This page and index.md TRADED PLACES. From 2026-07-28 to 2026-08-03 the front
    door lived here and `/` was the stub pointing at it — because the address people
    typed was mcpuppystudios.com, which promised a studio, so `/` had to hand off to
    the chess page rather than BE it. A domain that says CHESS retires that problem:
    chesswild.com now loads the front door directly, with no hop.

    ⚠ THIS STUB MAY NEVER 404, AND THAT IS NOT A STYLE PREFERENCE. Three things
    still point here and none of them can be reached back into and corrected:

      1. **The PWA `start_url` baked into every launcher installed on 2026-08-03**,
         when the manifest said `/chess/?source=pwa`. start_url is fixed AT INSTALL
         TIME — editing manifest.json fixes the NEXT install and nothing else. The
         redirect below is the only thing that moves an existing icon.
      2. **sw.js PRECACHE**, which runs under `Promise.allSettled` — a 404 in that
         list fails SILENTLY and quietly serves a stale shell forever.
      3. **A week of shared links** and whatever Google indexed in that window.

    It redirects three ways, in the order they can possibly fire — the same ladder
    index.md used when the roles were reversed:

      1. `location.replace` in this script — before a pixel paints. `replace`, not
         `assign`, so Back doesn't bounce you straight back here.
      2. `<meta http-equiv="refresh" content="0">` — the no-JS path. Search engines
         treat an instant meta refresh as a redirect and pass the ranking on, which
         is why the canonical below points at `/` rather than at this page.
      3. A plain link in the body — the last resort, for anything honoring neither.

    ⚠ THE APP MARKER SURVIVES THE HOP, and here it is load-bearing rather than
    merely tidy: a launcher opening `/chess/?source=pwa` has to arrive at `/` still
    carrying `?source=pwa`, or the app lands on the front door as an ordinary web
    visit. Same reasoning as the /pjcc/ redirect in _includes/head.html.

    `sitemap: false` because submitting a redirect for indexing asks Google to crawl
    a page whose only content is "go somewhere else". `/` is the one that belongs in
    the sitemap, and the canonical below sends every signal there.
    ══════════════════════════════════════════════════════════════════════════════
  {%- endcomment -%}
  <script>try{var q=location.search.indexOf('source=pwa')>-1?'?source=pwa':'';location.replace({{ '/' | relative_url | jsonify }}+q);}catch(e){}</script>
  <meta http-equiv="refresh" content="0; url={{ '/' | relative_url }}">
  <title>ChessWild</title>
  <meta name="description" content="ChessWild — free chess for everyone. Play a real game, solve a puzzle, or learn from scratch.">
  <link rel="canonical" href="{{ '/' | absolute_url }}">
  <meta name="theme-color" content="#0a0714">
  <meta name="robots" content="noindex, follow">
  <meta property="og:type" content="website">
  <meta property="og:title" content="ChessWild">
  <meta property="og:description" content="Free chess for everyone — play a real game, solve a puzzle, or learn from scratch.">
  <meta property="og:url" content="{{ '/' | absolute_url }}">
  <meta property="og:image" content="{{ '/assets/images/pjcc-share-card.jpg' | absolute_url }}">
  <link rel="icon" href="{{ '/assets/images/favicon.svg' | relative_url }}">
  <style>
    html, body { height: 100%; margin: 0; background: #0a0714; }
    /* Nothing should ever be READ here — this page exists to be left. But a redirect
       that lands somebody on a blank black screen when all three routes fail is a dead
       site, so the link is real, centered and legible rather than hidden. */
    a { display: flex; align-items: center; justify-content: center; height: 100%;
        font-family: ui-monospace, "SFMono-Regular", "Courier New", monospace;
        font-size: 15px; letter-spacing: .16em; text-transform: uppercase;
        color: #f0e6ff; text-decoration: none; }
  </style>
</head>
<body>
  <a href="{{ '/' | relative_url }}">ChessWild &rarr;</a>
</body>
</html>
