---
layout: page
title: "Live"
permalink: /live/
body_class: theme-studio
brand: mcpuppy
description: "Watch P&JCC get built — chess nights at the Park Tables, Blender and Godot sessions, and the occasional Q&A. Live on Twitch."
tab_title: "Live — McPuppy Studios"
---

{% comment %} ══════════════════════════════════════════════════════════════════════════
     /live/ — THE ONE PAGE STREAMING GETS (2026-08-17)

     Nate: *"I also want to do twitch."*

     ⭐ THE STANDING RULE, AND THIS PAGE IS IT: **never build streaming into the site —
     embed it.** Twitch owns the player, the chat, the transcoding, the CDN and the
     moderation tools. What the site owns is a door with a memorable address, so that
     "where do I watch" has a chesswild.com answer instead of a platform answer. Zero
     infrastructure, zero bandwidth, and nothing to maintain the week he does not stream.

     ⚠⚠ THE EMBED KNOWS WHETHER HE IS LIVE; THIS PAGE DOES NOT, AND MUST NOT PRETEND TO.
     Asking Twitch "is this channel live" needs a Client-ID and a server to hold it, which
     is exactly the infrastructure this page exists to avoid. So the page never renders the
     words "LIVE NOW" — the PLAYER shows the stream when there is one and Twitch's own
     offline card when there is not, which is the truth, self-updating, for free. A badge
     this page painted itself would be wrong for all the hours he is not streaming, and a
     stale "LIVE" is worse than no badge at all. [[accuracy-above-all]]

     ⚠ ONE HANDLE, ONE PLACE. `channel` below is the only thing to change. It is blank
     until Nate claims the name — and a blank handle renders the "not yet" panel instead of
     an embed pointed at nobody, because an embed with no channel is a Twitch error card
     with his site's header on it. [[no-excuses-copy]]

     ⚠ `parent=` IS NOT OPTIONAL AND IT IS THE #1 WAY THIS BREAKS. Twitch refuses to embed
     unless every domain the page can be served from is listed. Three are needed here:
     chesswild.com (the live domain), www.chesswild.com (which 301s, but the redirect can
     be mid-flight when the iframe loads), and ngreen37.github.io (the Pages origin, which
     still serves the site directly). Miss one and the player is a gray box with no error
     anywhere in the console the visitor would think to open. [[front-door-decision]]
     ══════════════════════════════════════════════════════════════════════════ {% endcomment %}

{%- assign channel = "" -%}
{%- assign youtube = "" -%}

<div class="live-hero">
  <p class="live-eyebrow">◈ McPuppy Studios · Broadcast</p>
  <h1 class="live-h1">Watch it get built.</h1>
  <p class="live-lead">Chess nights at the Park Tables, Blender and Godot sessions, and the
  occasional Q&amp;A. No highlight reel — the actual work, at the actual speed.</p>
</div>

{% if channel != "" %}
  {% comment %} The player. `autoplay=false` deliberately: a stream that starts talking the
       moment somebody opens a link is the fastest way to be closed again — and on a phone
       it costs the visitor data before they agreed to spend any. {% endcomment %}
  <div class="live-frame">
    <iframe
      src="https://player.twitch.tv/?channel={{ channel }}&parent=chesswild.com&parent=www.chesswild.com&parent=ngreen37.github.io&autoplay=false&muted=true"
      title="McPuppy Studios on Twitch"
      allowfullscreen
      scrolling="no"
      frameborder="0"></iframe>
  </div>
  <p class="live-under">
    <a class="pjcc-btn" href="https://twitch.tv/{{ channel }}" rel="noopener" target="_blank">Open on Twitch ↗</a>
    <span class="live-note">Follow there and Twitch tells you when a stream starts — this page can’t.</span>
  </p>
{% else %}
  {% comment %} ⚠ THE HONEST EMPTY STATE. The standing rule for a thing that is not ready is
       a plain note of six words or so, said ONCE, with no apology and no excuse attached.
       It is a real sentence about a real state, not a "coming soon" badge.
       [[no-excuses-copy]] {% endcomment %}
  <div class="live-soon">
    <p class="live-soon-t">The channel isn’t open yet.</p>
    <p class="live-soon-s">This page turns into the player the day it is. Until then, the
    <a href="/mailing-list/">Bulletin</a> is where the first stream gets announced.</p>
  </div>
{% endif %}

<h2 class="live-h2">What the streams are</h2>
<div class="live-grid">
  <div class="live-cell">
    <span class="live-ico">♟</span>
    <b>Chess night</b>
    <small>Open tables. Sit down and play me — the same Park Tables matchmaking that’s on
    the site, live, with commentary while it happens.</small>
  </div>
  <div class="live-cell">
    <span class="live-ico">◈</span>
    <b>Build-with-me</b>
    <small>Blender and Godot, screen and voice. Modeling, rigging, and the parts that go
    wrong — which is most of it, and the useful half.</small>
  </div>
  <div class="live-cell">
    <span class="live-ico">✎</span>
    <b>Studio Q&amp;A</b>
    <small>Occasional. Ask about the story, the games, the chess, or how any of it is
    actually made.</small>
  </div>
</div>

{% if youtube != "" %}
<h2 class="live-h2">The Archive</h2>
{% comment %} ⚠⚠ WHY THE ARCHIVE IS NOT ON TWITCH, and this is a fact worth knowing before
     the first stream rather than after the twentieth: TWITCH VODS EXPIRE. Seven days on a
     plain account, sixty for Affiliates and Partners, and then they are gone. The whole
     argument for streaming here is that the first twenty streams nobody watches are still
     building a LIBRARY — two years of archived honest work that somebody can find the day
     the trailer lands. On Twitch alone that library quietly deletes itself.

     The fix costs one setting: Twitch → Settings → Stream → "Auto-publish VODs" plus the
     YouTube connection, and every broadcast lands on YouTube permanently. That is why this
     block points at YouTube and not at twitch.tv/videos. {% endcomment %}
<p class="live-archive">Past streams live on <a href="https://youtube.com/@{{ youtube }}" rel="noopener" target="_blank">YouTube</a>, permanently — Twitch only keeps them for a couple of months.</p>
{% endif %}

<style>
/* ── /live/ ────────────────────────────────────────────────────────────────────────
   A short page with one job, so it borrows the studio theme's chrome and adds almost
   nothing. The only real piece of CSS here is the player frame. */

.live-hero { margin: 0 0 26px; }
.live-eyebrow { font-family: 'Share Tech Mono', monospace; font-size: 0.7rem; letter-spacing: 0.14em;
  text-transform: uppercase; color: #9a8fd0; margin: 0 0 10px; }
.live-h1 { font-size: clamp(1.9rem, 5vw, 2.9rem); line-height: 1.08; margin: 0 0 12px; }
.live-lead { max-width: 54ch; color: #c3bcd8; line-height: 1.6; margin: 0; }

/* ⚠ ASPECT-RATIO, NOT A PADDING HACK. The old percentage-padding trick resolves its
   percentage against the CONTAINING BLOCK'S WIDTH, which is exactly the trap the VS rails
   fell into — one nested wrapper and the box is the wrong height with nothing to point at.
   `aspect-ratio` says the thing it means. [[vs-layer-and-cut-scene]] */
.live-frame { position: relative; width: 100%; aspect-ratio: 16 / 9;
  border-radius: var(--r-md, 12px); overflow: hidden;
  border: 1px solid rgba(150, 65, 255, 0.34);
  box-shadow: 0 24px 60px -28px rgba(0, 0, 0, 0.85); background: #0d0a17; }
.live-frame iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }

.live-under { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; margin: 16px 0 0; }
.live-note { color: #8b82a8; font-size: 0.84rem; }

.live-soon { border: 1px dashed rgba(150, 65, 255, 0.4); border-radius: var(--r-md, 12px);
  padding: 26px 22px; background: rgba(80, 30, 180, 0.09); }
.live-soon-t { margin: 0 0 6px; font-size: 1.05rem; font-weight: 700; color: #efeaff; }
.live-soon-s { margin: 0; color: #b3aacd; font-size: 0.9rem; line-height: 1.6; }

.live-h2 { font-size: 1.15rem; margin: 34px 0 14px; color: #e9e3ff; }
.live-grid { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); }
.live-cell { background: rgba(255, 255, 255, 0.035); border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: var(--r-sm, 9px); padding: 16px 17px; }
.live-ico { display: block; font-size: 1.25rem; color: #b98bff; margin-bottom: 8px; }
.live-cell b { display: block; color: #f1ecff; margin-bottom: 5px; font-size: 0.97rem; }
.live-cell small { color: #b3aacd; font-size: 0.85rem; line-height: 1.55; display: block; }
.live-archive { color: #b3aacd; font-size: 0.9rem; line-height: 1.6; }
</style>
