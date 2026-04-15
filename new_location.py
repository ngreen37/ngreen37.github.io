#!/usr/bin/env python3
"""
new_location.py — creates a new location page in _locations/ and adds a row to _pjcc/locations.csv

Usage:
    python new_location.py

Run from the root of your site: C:\\Users\\Nate\\Desktop\\ngreen37.github.io
"""

import os
import csv

print("=== New Location ===\n")

slug            = input("Slug (e.g. the-border): ").strip().lower()
title           = input("Title (e.g. The Border): ").strip()
location_type   = input("Type (e.g. City / Road / Region): ").strip()
description     = input("Short description (one sentence): ").strip()
features_header = input("Features header (default: Notable Features): ").strip() or "Notable Features"
features        = input("Features (pipe-separated): ").strip()
who_lives_here  = input("Who lives here: ").strip()
mysteries       = input("Mysteries (leave blank if none): ").strip()
story_role      = input("Role in the story (one paragraph): ").strip()
art_text        = input("Art placeholder text (default: Map or illustration coming soon.): ").strip() or "Map or illustration coming soon."

permalink = f"/locations/{slug}/"

# --- Create the markdown page ---
locations_dir = os.path.join(os.path.dirname(__file__), "_locations")
os.makedirs(locations_dir, exist_ok=True)

filepath = os.path.join(locations_dir, f"{slug}.md")

if os.path.exists(filepath):
    print(f"\nFile already exists: {filepath}")
else:
    feature_lines = "\n".join(f"- {f.strip()}" for f in features.split("|"))

    page = f"""---
layout: location
title: {title}
location_type: {location_type}
permalink: {permalink}
---

{description}

## {features_header}
{feature_lines}

## Who Lives Here
{who_lives_here}
{"## Mysteries" + chr(10) + mysteries + chr(10) if mysteries else ""}
## Role in the Story
{story_role}

## Art
*{art_text}*
"""
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(page)
    print(f"\nCreated: _locations/{slug}.md")

# --- Append to locations.csv ---
csv_path = os.path.join(os.path.dirname(__file__), "_pjcc", "locations.csv")

with open(csv_path, "a", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow([slug, title, location_type, permalink, description, features_header, features, who_lives_here, mysteries, story_role, art_text])

print(f"Appended to _pjcc/locations.csv")
print(f"\nDone. Run 'python publish.py' when ready to go live.")
