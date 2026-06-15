---
layout: page
title: Soundtrack
permalink: /soundtrack/
body_class: theme-bw
---

<div class="soundtrack-page">
  <div class="soundtrack-eyebrow">McPuppy Studios — The Build Playlist</div>
  <h1>Soundtrack</h1>
  <p class="soundtrack-count">Every song played while building this. In order. — {{ site.data.soundtrack | size }} tracks so far.</p>

  <button class="soundtrack-playall" onclick="if(window.PJCCJukebox){PJCCJukebox.playFrom(0);}">▶ Play all in the jukebox</button>

  {% for t in site.data.soundtrack %}
  <div class="track-item">
    <div class="track-post-label">{{ t.ep }}</div>
    <div class="track-title">{{ t.title }}</div>
    <div class="track-embed-wrap">
      <iframe src="https://open.spotify.com/embed/track/{{ t.id }}" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>
    </div>
  </div>
  {% endfor %}

</div>

<style>
.soundtrack-playall {
  background: #1DB954; color: #04140a; border: none; border-radius: 999px;
  padding: 9px 20px; font-weight: 800; cursor: pointer; margin: 0.4rem 0 1.4rem;
  font-size: 0.92rem; box-shadow: 0 0 14px rgba(29,185,84,0.4);
}
.soundtrack-playall:hover { background: #25d366; }
</style>
