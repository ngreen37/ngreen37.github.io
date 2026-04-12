#!/usr/bin/env python3
"""
Location page generator for Princess and the Journey to Chess City.

HOW TO USE:
  1. Edit _pjcc/locations.csv to add a new location or update an existing one.
       - Each row is one location.
       - Separate multiple features with a pipe: Feature one | Feature two | Feature three
       - The `name` column is the output filename (e.g. "chess-city" → chess-city.md).
       - The `title` column is the front matter title (e.g. "Chess City" or "???").
       - Leave `who_lives_here` or `mysteries` empty to omit those sections entirely.
       - `features_header` sets the section heading (e.g. "Notable Features", "What People Say").
  2. Run from the repo root:
         python _pjcc/generate_locations.py
  3. Commit and push as normal:
         git add _locations/
         git commit -m "Update locations"
         git push

The CSV is the single source of truth. Every run overwrites existing files.
"""

import csv
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
CSV_PATH   = SCRIPT_DIR / "locations.csv"
OUTPUT_DIR = SCRIPT_DIR.parent / "_locations"

# Characters that require quoting in YAML front matter values
_YAML_SPECIAL = set('?:#{}[]|>&*!,%@`')


def yaml_val(s):
    """Wrap a value in double quotes if it contains YAML-special characters."""
    if any(c in s for c in _YAML_SPECIAL):
        return f'"{s.replace(chr(34), chr(92) + chr(34))}"'
    return s


def features_to_bullets(features_str):
    items = [f.strip() for f in features_str.split("|") if f.strip()]
    return "\n".join(f"- {item}" for item in items)


def generate_page(row):
    features_md = features_to_bullets(row["features"])

    parts = [
        (
            f"---\n"
            f"layout: location\n"
            f"title: {yaml_val(row['title'])}\n"
            f"location_type: {row['location_type']}\n"
            f"permalink: {row['permalink']}\n"
            f"---"
        ),
        row["description"],
        f"## {row['features_header']}\n{features_md}",
    ]

    if row["who_lives_here"].strip():
        parts.append(f"## Who Lives Here\n{row['who_lives_here']}")

    if row["mysteries"].strip():
        parts.append(f"## Mysteries\n{row['mysteries']}")

    parts.append(f"## Role in the Story\n{row['story_role']}")
    parts.append(f"## Art\n*{row['art_text']}*")

    return "\n\n".join(parts) + "\n"


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
            print(f"  wrote  _locations/{filename}")
            count += 1

    print(f"\n{count} file(s) written to _locations/")


if __name__ == "__main__":
    main()
