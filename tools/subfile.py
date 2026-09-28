#!/usr/bin/env python3
"""Exact string replacement in ONE file, with both sides read from files.

Usage: subfile.py <target> <old.txt> <new.txt>

⛑⛑ BOTH SIDES COME FROM FILES ON PURPOSE. Typing a patch containing backslashes into a heredoc
is the mistake I have now made three times: the shell eats them, the replacement silently misses,
and the failure surfaces somewhere else entirely. Refuses unless `old` appears exactly once.
"""
import sys, pathlib

target = pathlib.Path(sys.argv[1])
old = pathlib.Path(sys.argv[2]).read_text(encoding="utf-8")
new = pathlib.Path(sys.argv[3]).read_text(encoding="utf-8")

text = target.read_text(encoding="utf-8")
n = text.count(old)
assert n == 1, "%s: old text found %d times, want exactly 1" % (target, n)
target.write_text(text.replace(old, new), encoding="utf-8", newline="")
print("patched %s" % target)
