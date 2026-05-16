"""
PJCC - Link all 32 pieces into starting position.

Run in your test scene. Re-runnable: wipes prior linked pieces and rebuilds.

Requires master .blend files at SWAP_CONTRACT paths:
  C:\\Users\\Nate\\Desktop\Personal\Blender\Pieces\<Piece>.blend

White pieces face +Y (up the board), Black pieces face -Y.
Square size = 1 unit. Origin square (a1) center is at (0.5, 0.5, 0).
"""

import bpy
import os
import math

# ============================================================
# CONFIG
# ============================================================
PIECES_DIR  = r"C:\Users\Nate\Desktop\Personal\Blender\Pieces"
SQUARE_SIZE = 1.0     # each chessboard square = 1 Blender unit
LINK_GROUP  = "ChessPieces"  # collection that holds all linked pieces

# ============================================================
# STARTING POSITION
# Format: (piece_type, color, file_letter, rank_number)
# file: a=0, b=1, ... h=7   |   rank: 1=0, 2=1, ... 8=7
# ============================================================
STARTING_POSITION = [
    # White back rank (rank 1, y=0)
    ("Rook",   "WHITE", 0, 0), ("Knight", "WHITE", 1, 0),
    ("Bishop", "WHITE", 2, 0), ("Queen",  "WHITE", 3, 0),
    ("King",   "WHITE", 4, 0), ("Bishop", "WHITE", 5, 0),
    ("Knight", "WHITE", 6, 0), ("Rook",   "WHITE", 7, 0),
    # White pawns (rank 2, y=1)
    *[("Pawn", "WHITE", f, 1) for f in range(8)],
    # Black pawns (rank 7, y=6)
    *[("Pawn", "BLACK", f, 6) for f in range(8)],
    # Black back rank (rank 8, y=7)
    ("Rook",   "BLACK", 0, 7), ("Knight", "BLACK", 1, 7),
    ("Bishop", "BLACK", 2, 7), ("Queen",  "BLACK", 3, 7),
    ("King",   "BLACK", 4, 7), ("Bishop", "BLACK", 5, 7),
    ("Knight", "BLACK", 6, 7), ("Rook",   "BLACK", 7, 7),
]

# ============================================================
# WIPE OLD LINKED PIECES
# ============================================================
# Remove existing ChessPieces collection if re-running
if LINK_GROUP in bpy.data.collections:
    old = bpy.data.collections[LINK_GROUP]
    # Remove all objects (overrides) inside
    for obj in list(old.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    # Remove nested collections (linked-in piece collections)
    for child in list(old.children):
        bpy.data.collections.remove(child)
    bpy.data.collections.remove(old)

# Also nuke orphan libraries / overrides from prior runs
for lib in list(bpy.data.libraries):
    if lib.users == 0:
        bpy.data.libraries.remove(lib)

# Create fresh container collection
chess_col = bpy.data.collections.new(LINK_GROUP)
bpy.context.scene.collection.children.link(chess_col)

# ============================================================
# HELPERS
# ============================================================
def hex_to_linear(hex_str):
    h = hex_str.lstrip('#')
    srgb = [int(h[i:i+2], 16) / 255.0 for i in (0, 2, 4)]
    return tuple(c/12.92 if c <= 0.04045 else ((c+0.055)/1.055)**2.4 for c in srgb) + (1.0,)

def get_or_create_chess_material(name, color):
    mat = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = color
        bsdf.inputs["Roughness"].default_value = 0.5
    return mat

# Make sure local Chess_White and Chess_Black materials exist for overriding
mat_white = get_or_create_chess_material("Chess_White", hex_to_linear("#F0F0F0"))
mat_black = get_or_create_chess_material("Chess_Black", hex_to_linear("#1A1A1A"))

def link_piece(piece_type, color, file_idx, rank_idx, instance_num):
    """Link one piece collection from its .blend, override it, position it."""
    blend_path = os.path.join(PIECES_DIR, f"{piece_type}.blend")
    if not os.path.exists(blend_path):
        raise RuntimeError(f"Missing master file: {blend_path}")

    # Link the piece's collection from the master .blend
    with bpy.data.libraries.load(blend_path, link=True) as (data_from, data_to):
        if piece_type not in data_from.collections:
            raise RuntimeError(f"No '{piece_type}' collection in {blend_path}")
        data_to.collections = [piece_type]

    linked_collection = data_to.collections[0]

    # Instance the linked collection in the scene as an empty
    instance = bpy.data.objects.new(
        name=f"{color}_{piece_type}_{instance_num:02d}",
        object_data=None,
    )
    instance.instance_type = 'COLLECTION'
    instance.instance_collection = linked_collection
    chess_col.objects.link(instance)

    # Position: center of the chess square
    x = (file_idx + 0.5) * SQUARE_SIZE
    y = (rank_idx + 0.5) * SQUARE_SIZE
    z = 0
    instance.location = (x, y, z)

    # Knights face the opponent: white +Y (default), black 180 deg
    if piece_type == "Knight" and color == "BLACK":
        instance.rotation_euler[2] = math.pi  # 180 deg around Z

    # NOTE on color: collection-instances render with the master's materials.
    # To get true black pieces, we'd need library overrides per piece,
    # which is heavier. For now both armies show white. See "color note" below.

    return instance

# ============================================================
# PLACE EVERY PIECE
# ============================================================
white_count = 0
black_count = 0
for piece_type, color, file_idx, rank_idx in STARTING_POSITION:
    if color == "WHITE":
        white_count += 1
        n = white_count
    else:
        black_count += 1
        n = black_count
    link_piece(piece_type, color, file_idx, rank_idx, n)

# ============================================================
# REPORT
# ============================================================
print("=" * 50)
print(f"Linked {len(STARTING_POSITION)} pieces into '{LINK_GROUP}' collection")
print(f"  White: {white_count}   Black: {black_count}")
print(f"  Square size: {SQUARE_SIZE}")
print(f"  Board origin (a1 center): ({SQUARE_SIZE/2}, {SQUARE_SIZE/2}, 0)")
print(f"  Board extent: 0 to {8*SQUARE_SIZE} in X and Y")
print("=" * 50)
print("COLOR NOTE: collection instances all show as WHITE (master's color).")
print("To get black pieces, see follow-up 'recolor' instructions.")
print("Save the scene whenever - linked references are preserved.")