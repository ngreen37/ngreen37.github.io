#!/usr/bin/env python3
"""
new_character.py — creates a new character page in _characters/ and adds a row to _pjcc/characters.csv

Usage:
    python new_character.py

Run from the root of your site: C:\\Users\\Nate\\Desktop\\ngreen37.github.io
"""

import os
import csv

print("=== New Character ===\n")

slug        = input("Slug (e.g. kennie): ").strip().lower()
title       = input("Title (e.g. The Rival): ").strip()
full_name   = input("Full name (e.g. Kennie McAllister): ").strip()
role        = input("Role (e.g. Supporting Character): ").strip()
species     = input("Species (e.g. Human): ").strip()
description = input("Short description (one sentence): ").strip()
traits      = input("Traits (pipe-separated, e.g. Clever | Stubborn): ").strip()
background  = input("Background (one paragraph): ").strip()
story_role  = input("Role in the story (one paragraph): ").strip()

permalink = f"/characters/{slug}/"

# --- Create the markdown page ---
characters_dir = os.path.join(os.path.dirname(__file__), "_characters")
os.makedirs(characters_dir, exist_ok=True)

filepath = os.path.join(characters_dir, f"{slug}.md")

if os.path.exists(filepath):
    print(f"\nFile already exists: {filepath}")
else:
    trait_lines = "\n".join(f"- {t.strip()}" for t in traits.split("|"))

    page = f"""---
layout: character
title: {title}
full_name: {full_name}
role: {role}
permalink: {permalink}
---

{description}

## Traits
{trait_lines}

## Background
{background}

## Role in the Story
{story_role}

## Art
*Illustration coming soon.*
"""
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(page)
    print(f"\nCreated: _characters/{slug}.md")

# --- Append to characters.csv ---
csv_path = os.path.join(os.path.dirname(__file__), "_pjcc", "characters.csv")

with open(csv_path, "a", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow([slug, title, full_name, role, permalink, species, description, traits, background, story_role])

print(f"Appended to _pjcc/characters.csv")
print(f"\nDone. Run 'python publish.py' when ready to go live.")
