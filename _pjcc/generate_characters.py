#!/usr/bin/env python3
"""
Character page generator for Princess and the Journey to Chess City.

HOW TO USE:
  1. Edit _pjcc/characters.csv to add a new character or update an existing one.
       - Each row is one character.
       - Separate multiple traits with a pipe: Trait one | Trait two | Trait three
       - The `name` column is the output filename (e.g. "best-friend" → best-friend.md).
       - The `title` column is the front matter title (e.g. "The Best Friend").
  2. Run from the repo root:
         python _pjcc/generate_characters.py
  3. Commit and push as normal:
         git add _characters/
         git commit -m "Update characters"
         git push

The CSV is the single source of truth. Every run overwrites existing files.
"""

import csv
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
CSV_PATH   = SCRIPT_DIR / "characters.csv"
OUTPUT_DIR = SCRIPT_DIR.parent / "_characters"


def traits_to_bullets(traits_str):
    traits = [t.strip() for t in traits_str.split("|") if t.strip()]
    return "\n".join(f"- {trait}" for trait in traits)


def generate_page(row):
    traits_md = traits_to_bullets(row["traits"])
    return (
        f"---\n"
        f"layout: character\n"
        f"title: {row['title']}\n"
        f"full_name: {row['full_name']}\n"
        f"role: {row['role']}\n"
        f"permalink: {row['permalink']}\n"
        f"---\n"
        f"\n"
        f"{row['description']}\n"
        f"\n"
        f"## Traits\n"
        f"{traits_md}\n"
        f"\n"
        f"## Background\n"
        f"{row['background']}\n"
        f"\n"
        f"## Role in the Story\n"
        f"{row['story_role']}\n"
        f"\n"
        f"## Art\n"
        f"*Illustration coming soon.*\n"
    )


def main():
    if not CSV_PATH.exists():
        print(f"Error: CSV not found at {CSV_PATH}")
        return

    OUTPUT_DIR.mkdir(exist_ok=True)

    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        count = 0
        for row in reader:
            filename = row["name"].strip() + ".md"
            output_path = OUTPUT_DIR / filename
            with open(output_path, "w", encoding="utf-8") as out:
                out.write(generate_page(row))
            print(f"  wrote  _characters/{filename}")
            count += 1

    print(f"\n{count} file(s) written to _characters/")


if __name__ == "__main__":
    main()
