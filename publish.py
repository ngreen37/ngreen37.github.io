"""
publish.py — stages, commits, and pushes all changes to GitHub.
Run from the root of your site when you're done writing a post.

Usage:
    python publish.py
"""

import subprocess
import os
import glob
from datetime import date

# ── Auto-create missing tag pages ──────────────────────────────
def get_tags_from_posts():
    tags = set()
    for filepath in glob.glob("_posts/*.md"):
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        # Find front matter block
        parts = content.split("---")
        if len(parts) < 3:
            continue
        front_matter = parts[1]
        for line in front_matter.splitlines():
            if line.strip().startswith("tags:"):
                # Handle both: tags: [a, b] and tags: a
                raw = line.split(":", 1)[1].strip()
                raw = raw.strip("[]")
                for tag in raw.split(","):
                    tag = tag.strip().strip('"').strip("'")
                    if tag:
                        tags.add(tag)
    return tags

def get_existing_tag_pages():
    existing = set()
    for filepath in glob.glob("_tags/*.md"):
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        parts = content.split("---")
        if len(parts) < 3:
            continue
        for line in parts[1].splitlines():
            if line.strip().startswith("tag:"):
                existing.add(line.split(":", 1)[1].strip())
    return existing

def create_tag_page(tag):
    os.makedirs("_tags", exist_ok=True)
    slug = tag.lower().replace(" ", "-")
    filepath = f"_tags/{slug}.md"
    content = f"""---
layout: tag
tag: {tag}
title: "{tag}"
permalink: /tags/{slug}/
---
"""
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"  Created tag page: {filepath}")

post_tags = get_tags_from_posts()
existing_tags = get_existing_tag_pages()
new_tags = post_tags - existing_tags

if new_tags:
    print(f"Creating {len(new_tags)} new tag page(s):")
    for tag in sorted(new_tags):
        create_tag_page(tag)
else:
    print("No new tags found.")

# ── Commit and push ────────────────────────────────────────────
default_message = f"blog: {date.today().strftime('%Y-%m-%d')}"
user_input = input(f"Commit message [{default_message}]: ").strip()
message = user_input if user_input else default_message

subprocess.run(["git", "stash"])
subprocess.run(["git", "pull", "--rebase"])
subprocess.run(["git", "stash", "pop"])
subprocess.run(["git", "add", "."])
subprocess.run(["git", "commit", "-m", message])
subprocess.run(["git", "push"])

print(f"Published. Commit message: '{message}'")