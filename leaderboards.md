---
layout: page
title: Leaderboards
permalink: /leaderboards/
jukebox: true
---

<link rel="stylesheet" href="{{ '/assets/css/pjcc-profile.css' | relative_url }}">

<p class="lb-intro">Operative standings across the McPuppy Studios games. <strong>Overall</strong> ranks every operative by total credits earned everywhere; each game tab shows the best runs in that game. Sign in on any game page to claim your spot. The board is also embedded on the <a href="{{ '/games/' | relative_url }}#leaderboards-cat">Games page</a>.</p>

<a class="lb-hof-link" href="{{ '/hall-of-fame/' | relative_url }}" style="display:flex;align-items:center;gap:12px;background:linear-gradient(135deg,#241452,#3a2d1a);border:1px solid #F5C518;border-radius:12px;padding:13px 18px;margin:0 0 1.1rem;text-decoration:none;color:#f0e6ff;box-shadow:0 0 22px -10px #F5C518;">
  <span style="font-size:1.7rem;line-height:1;">🏆</span>
  <span style="flex:1;min-width:0;">
    <span style="display:block;font-size:0.66rem;letter-spacing:0.12em;text-transform:uppercase;color:#e9c75a;">Seasons &amp; champions</span>
    <span style="display:block;font-weight:800;color:#fff;">Hall of Fame</span>
    <span style="display:block;font-size:0.8rem;color:#cdbcf2;">Every month is a Tour — see who's crowned this season and the past champions.</span>
  </span>
  <span style="flex-shrink:0;color:#F5C518;font-weight:900;">&rarr;</span>
</a>

<div class="lb-tabs" id="lb-tabs"></div>
<div id="lb-body"><p class="lb-empty">Loading…</p></div>

<script src="{{ '/assets/js/pjcc-config.js' | relative_url }}"></script>
<script src="{{ '/assets/js/pjcc-profile.js' | relative_url }}"></script>
<script src="{{ '/assets/js/pjcc-leaderboard.js' | relative_url }}" defer></script>
