#!/usr/bin/env python3
"""
update_soundtrack.py — scans _posts/ for songs and regenerates soundtrack.md

Usage:
    python update_soundtrack.py

Run from root: C:\\Users\\Nate\\Desktop\\ngreen37.github.io
Also triggered automatically by the Claude Code PostToolUse hook whenever a _posts/*.md file is saved.

Convention: each episode post should have in its frontmatter:
    spotify: <track_id>
and in its content:
    ### Listening to: Artist - Song Title

If spotify: is missing from frontmatter, the script falls back to extracting the track ID
from the first Spotify iframe in the post body.
"""

import os
import re
import glob
from datetime import datetime

ROOT = os.path.dirname(os.path.abspath(__file__))
POSTS_DIR = os.path.join(ROOT, "_posts")
SOUNDTRACK_PATH = os.path.join(ROOT, "soundtrack.md")


def parse_frontmatter(text):
    if not text.startswith("---"):
        return {}, text
    try:
        end = text.index("---", 3)
    except ValueError:
        return {}, text
    fm_text = text[3:end].strip()
    content = text[end + 3:].strip()
    fm = {}
    for line in fm_text.splitlines():
        if ":" in line:
            k, _, v = line.partition(":")
            fm[k.strip()] = v.strip()
    return fm, content


def extract_track(fm, content):
    track_id = fm.get("spotify", "").strip()
    if not track_id:
        m = re.search(r"open\.spotify\.com/embed/track/([A-Za-z0-9]+)", content)
        if m:
            track_id = m.group(1)
    # Spotify IDs are always exactly 22 alphanumeric characters
    if track_id and len(track_id) == 22 and track_id.isalnum():
        return track_id
    return None


def extract_song_label(content):
    m = re.search(r"###\s*Listening to:\s*(.+)", content)
    return m.group(1).strip() if m else None


def build_ep_label(title):
    m = re.match(r"Ep\.?\s*(\d+)\s*[-—]\s*(.+)", title, re.IGNORECASE)
    if m:
        return f"Ep. {m.group(1)} — {m.group(2).strip()}"
    return title


tracks = []

for post_path in sorted(glob.glob(os.path.join(POSTS_DIR, "*.md"))):
    basename = os.path.basename(post_path)
    if basename == "README.md":
        continue
    with open(post_path, encoding="utf-8") as f:
        text = f.read()
    fm, content = parse_frontmatter(text)
    track_id = extract_track(fm, content)
    song_label = extract_song_label(content)
    if not track_id or not song_label:
        continue
    date_match = re.match(r"(\d{4}-\d{2}-\d{2})", basename)
    date = datetime.strptime(date_match.group(1), "%Y-%m-%d") if date_match else datetime.min
    ep_label = build_ep_label(fm.get("title", basename))
    tracks.append((date, ep_label, song_label, track_id))

tracks.sort(key=lambda x: x[0])

track_blocks = []
for _, ep_label, song_label, track_id in tracks:
    track_blocks.append(f"""  <div class="track-item">
    <div class="track-post-label">{ep_label}</div>
    <div class="track-title">{song_label}</div>
    <div class="track-embed-wrap">
      <iframe src="https://open.spotify.com/embed/track/{track_id}" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>
    </div>
  </div>""")

count = len(tracks)
tracks_html = "\n\n".join(track_blocks)

page = f"""---
layout: page
title: Soundtrack
permalink: /soundtrack/
body_class: theme-bw
---

<div class="soundtrack-page">
  <div class="soundtrack-eyebrow">McPuppy Studios — The Build Playlist</div>
  <h1>Soundtrack</h1>
  <p class="soundtrack-count">Every song played while building this. In order. — {count} tracks so far.</p>

{tracks_html}

</div>
"""

with open(SOUNDTRACK_PATH, "w", encoding="utf-8") as f:
    f.write(page)

print(f"soundtrack.md updated — {count} tracks.")
