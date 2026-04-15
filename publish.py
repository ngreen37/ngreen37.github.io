#!/usr/bin/env python3
"""
publish.py — stages, commits, and pushes all changes to GitHub.
Run from the root of your site when you're done writing a post.
 
Usage:
    python publish.py
"""
 
import subprocess
from datetime import date
 
message = f"blog: {date.today().strftime('%Y-%m-%d')}"
 
subprocess.run(["git", "pull", "--rebase"])
subprocess.run(["git", "add", "."])
subprocess.run(["git", "commit", "-m", message])
subprocess.run(["git", "push"])
 
print(f"Published. Commit message: '{message}'")