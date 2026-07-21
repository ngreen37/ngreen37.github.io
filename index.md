---
permalink: /pjcc/
sitemap: false
---
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="robots" content="noindex">
  <title>Princess and the Journey to Chess City</title>
  <link rel="canonical" href="{{ '/' | absolute_url }}">
  <meta http-equiv="refresh" content="0; url={{ '/' | relative_url }}">
  <script>location.replace("{{ '/' | relative_url }}");</script>
</head>
<body>
  <p>PJCC is now the front door. <a href="{{ '/' | relative_url }}">Continue to mcpuppystudios.com</a>. Redirecting…</p>
</body>
</html>

{%- comment -%}
  ══════════════════════════════════════════════════════════════════════════════
  /pjcc/ — A REDIRECT STUB.  Leave it here.  (2026-07-21)
  ──────────────────────────────────────────────────────────────────────────────
  This file used to BE the splash: `layout: studio-home, permalink: /`. The front-door
  rebuild swapped the two addresses — pjcc.md now answers "/" — and this is what keeps
  the old one working.

  GitHub Pages cannot issue a 301. Verified, not assumed: the Gemfile is `jekyll` +
  `webrick` only and _config.yml's plugins are jekyll-sitemap and jekyll-seo-tag, so
  there is no jekyll-redirect-from to lean on. A hand-authored stub is the strongest
  signal available, and it is built on the one pattern already proven in this repo,
  games/space-run-redirect.html: canonical + noindex + meta-refresh + location.replace +
  a visible link for anyone who lands with JS off.

  IT STAYS UP FOR MONTHS, NOT WEEKS. Three separate things depend on it:

    · EVERY INSTALLED PWA. manifest.json's start_url is baked into the launcher AT
      INSTALL TIME, so every phone that already added PJCC to its home screen still opens
      /pjcc/?source=pwa no matter what the manifest says today. Delete this file and
      those apps open a 404.
    · sw.js precaches '/pjcc/'. It uses Promise.allSettled, so a 404 there fails SILENTLY
      and the app quietly serves a stale shell instead of erroring — the worst kind of
      breakage, because nothing reports it.
    · Search. /pjcc/ is one of the two most-indexed URLs on the domain and carries the
      TVSeries rich-result entity. Reindexing to "/" takes as long as it takes.

  `sitemap: false` keeps it out of sitemap.xml so the new front door is the only address
  offered to crawlers, while the canonical tag tells anyone who arrives here where the
  page really lives.
  ══════════════════════════════════════════════════════════════════════════════
{%- endcomment -%}
