---
# `/` IS A REDIRECT NOW — it must render with NO site layout, so `layout: null` stays.
#
# The key being merely ABSENT is not the same as null: GitHub Pages once re-emitted this
# file from a stale cache entry that still recorded an OLD `layout: home`, and served the
# PJCC home at `/` instead of this page's own body. Pinning it null forces the standalone
# render every build and defends the page against any future layout default. (2026-07-24)
layout: null
permalink: /
sitemap: false
tab_title: McPuppy Studios
description: McPuppy Studios presents Princess and the Journey to Chess City — an animated series in the making, a chess academy, and a world of free chess games.
---
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  {%- comment -%}
    ══════════════════════════════════════════════════════════════════════════════
    THE INTRO IS GONE (2026-08-03, Nate: "Remove the intro completely.")
    ──────────────────────────────────────────────────────────────────────────────
    `/` used to be a self-contained black-and-white card that typed "McPuppy Studios
    Presents", held a beat, faded to black and handed off to the front door — about
    4.2 seconds door to door. It is deleted, along with everything that served it:
    the once-per-session `mcp.intro.seen` flag, the cross-document fade baton
    (`mcp.intro.handoff` in _includes/head.html + `html.intro-arriving` in
    _sass/_pjcc-25-front-door.scss), and the "Replay intro" link on /pjcc/.
    Restore the whole thing from git if it is ever wanted back: it was one file.

    WHAT `/` IS NOW: the shortest possible hop to the front door. mcpuppystudios.com
    is the address people type and the address people share, so it cannot 404 and it
    cannot be a blank page — but it has nothing of its own to say either, because
    everything it would have said is on /chess/. So it redirects, three ways, in the
    order they can possibly fire:

      1. `location.replace` in this script — before a pixel paints. `replace`, not
         `assign`, so Back doesn't bounce you straight back here.
      2. `<meta http-equiv="refresh" content="0">` — the no-JS path. Search engines
         treat an instant meta refresh as a redirect and pass the ranking on, which is
         the whole reason the canonical below points at /chess/ rather than at `/`.
      3. A plain link in the body — the last resort, for anything that honors neither.

    ⚠ THE APP MARKER SURVIVES THE HOP. A launcher installed before 2026-08-03 opens
    `/?source=pwa`; the marker has to be carried across or the app lands on the front
    door as an ordinary web visit. Same reasoning as the /pjcc/ redirect in
    _includes/head.html — see the comment there.

    `sitemap: false` because submitting a redirect for indexing is asking Google to
    crawl a page whose only content is "go somewhere else". /chess/ is the one that
    belongs in the sitemap, and the canonical below sends every signal there.
    ══════════════════════════════════════════════════════════════════════════════
  {%- endcomment -%}
  <script>try{var q=location.search.indexOf('source=pwa')>-1?'?source=pwa':'';location.replace({{ '/chess/' | relative_url | jsonify }}+q);}catch(e){}</script>
  <meta http-equiv="refresh" content="0; url={{ '/chess/' | relative_url }}">
  <title>McPuppy Studios</title>
  <meta name="description" content="McPuppy Studios presents Princess and the Journey to Chess City — an animated series in the making, a chess academy, and a world of free chess games.">
  <link rel="canonical" href="{{ '/chess/' | absolute_url }}">
  <meta name="theme-color" content="#0a0714">
  <meta name="robots" content="noindex, follow">
  <meta property="og:type" content="website">
  <meta property="og:title" content="McPuppy Chess">
  <meta property="og:description" content="McPuppy Studios presents Princess and the Journey to Chess City.">
  <meta property="og:url" content="{{ '/chess/' | absolute_url }}">
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
  <a href="{{ '/chess/' | relative_url }}">McPuppy Chess &rarr;</a>
</body>
</html>
