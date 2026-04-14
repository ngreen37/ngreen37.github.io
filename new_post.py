#!/usr/bin/env python3
"""
new_post.py — creates a new Jekyll blog post in _posts/ with correct filename and scaffold.

Usage:
    python new_post.py "Ep. 9 - My Post Title"

Run from the root of your site: C:\\Users\\Nate\\Desktop\\ngreen37.github.io
"""

import sys
import os
from datetime import date

def slugify(title):
    """Convert title to Jekyll-safe filename slug."""
    slug = title.lower()
    slug = slug.replace(" - ", "-").replace(" ", "-")
    keepchars = ("-", "_")
    slug = "".join(c for c in slug if c.isalnum() or c in keepchars)
    return slug.strip("-")

def main():
    if len(sys.argv) < 2:
        print("Usage: python new_post.py \"Ep. 9 - My Post Title\"")
        sys.exit(1)

    title = sys.argv[1]
    today = date.today()
    date_str = today.strftime("%Y-%m-%d")
    slug = slugify(title)
    filename = f"{date_str}-{slug}.md"

    posts_dir = os.path.join(os.path.dirname(__file__), "_posts")
    os.makedirs(posts_dir, exist_ok=True)

    filepath = os.path.join(posts_dir, filename)

    if os.path.exists(filepath):
        print(f"File already exists: {filepath}")
        sys.exit(1)

    template = f"""---
layout: post
title: {title}
date: {date_str}
tags: []
---
### Listening to: Artist - Song Title
<iframe src="https://open.spotify.com/embed/track/TRACK_ID" width="500" height="120" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>

Intro text here.

### What I worked on:
  - 

### What's next:
  - 
"""

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(template)

    print(f"Created: _posts/{filename}")
    print(f"Open it: code _posts/{filename}")

if __name__ == "__main__":
    main()
