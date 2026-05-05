## Pieces v01 - May 2026

Six low-poly chess pieces built parametrically in Python: pawn, rook,
knight, bishop, queen, king. Black/white materials only; PJCC team
colors deferred to v02.

**Architecture:** one .blend per piece in `assets/pieces/`, one
build script per piece in `_pjcc/blender/pieces/`. Scripts are source
of truth, .blends are reproducible output. Names locked per
SWAP_CONTRACT.md so future scenes don't break when pieces relink.

**Style:** matches Princess - 12-sided cylinders, 12x8 UV spheres for
heads, flat shading throughout. No smoothing, no subdivision.

**Scale:** sized to battle-room concept. Pawn = 1.0 (matches Princess,
dogs ARE pawns). King = 1.6, tallest piece. All pieces sit flush at z=0.

**Knight is stylized** - faceted L-shape neck plus snout block, not a
realistic horse head. Realistic silhouette deferred to v02 since it
needs edit-mode sculpting, not stacked primitives.

**Workflow win:** every piece shipped through the same six-step flow
(save script to repo, run in Blender, tweak, save .blend, save script,
git commit + push). Roughly 10 minutes per piece once the pattern was
locked. First time using git from the command line for non-website
work - now in muscle memory for all future PJCC assets.

**What's locked:** master paths, collection names, empty names, mesh
part names, material names, height ratios. See SWAP_CONTRACT.md.

**What's not done:** team colors (PJCC purple/gold variants),
chessboard, starting-position scene linking all pieces + Princess,
knight v02 with real horse-head silhouette.