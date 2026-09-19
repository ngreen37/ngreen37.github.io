---
layout: location
title: Checker Town
location_type: Town
permalink: /locations/checker-town/
model: /assets/models/checker.glb
# The houses, per this page: enormous checker pieces that fell from the sky, stacked into
# buildings. One model, repeated. x/y/z are in PIECE widths and heights; `n` stacks that
# many, `s` scales the whole tower, `t0` starts it on the other color.
# ⚠ the tints are ignored the moment the .blend has named materials: his paint wins.
model_tints: ["#e8e0cf", "#6a56c8"]
# ⚠ laid out as a RING, not a row: the view turns, and a row hides itself end-on.
model_scene:
  - { x: 1.3,   z: 0,     s: 1,    n: 9 }
  - { x: -0.65, z: 1.13,  s: 1.2,  n: 6, t0: 1 }
  - { x: -0.65, z: -1.13, s: 0.85, n: 7 }
  - { x: 0.25,  z: 0.35,  s: 0.7,  n: 1, t0: 1, ry: 0.5 }
---

The place where the story begins. Checker Town is a struggling community where most people are born, stay, and never leave -- not because they don't want to, but because the odds are stacked against them.

## Notable Features
- Houses and buildings are constructed from enormous checker pieces that fell from the sky long ago -- no one fully understands why or how
- Checkers is the dominant game; chess is known but not taken seriously. Sometimes resentfully.
- Close enough to see what lies beyond, far enough that getting there feels impossible

## Who Lives Here
Nate and his family, Maxwell, and Robert all call Checker Town home. Princess does too. It is the place they are all, in different ways, trying to escape -- or make peace with.

## Role in the Story
Checker Town is the world the story starts in and the world the story keeps pulling back to. It represents everything Nate is fighting against, and everything he risks losing by leaving.

## Art
*Map and art arrive with the Blender build.*
