"""
PJCC Chess Pieces - PAWN
Combined build script. Edit SHAPE PARAMETERS, re-run.

Save Pawn.blend at: C:/Users/Nate/Desktop/PJCC/assets/pieces/Pawn.blend
Run in Blender Scripting tab with Alt+P.
"""

import bpy

# ============================================================
# SHAPE PARAMETERS - edit these to reshape the pawn
# ============================================================
PIECE_NAME = "Pawn"
COLOR      = "WHITE"   # "WHITE" or "BLACK"

# Polygon counts (low-poly Pokemon style)
SIDES      = 12        # cylinder sides for base/body/collar
SPHERE_SEG = 12        # head sphere segments (longitude)
SPHERE_RNG = 8         # head sphere rings    (latitude)

# Base disc
BASE_RADIUS = 0.30
BASE_HEIGHT = 0.05

# Body (tapered cylinder)
BODY_BOTTOM_RADIUS = 0.25
BODY_TOP_RADIUS    = 0.18
BODY_HEIGHT        = 0.55

# Collar ring
COLLAR_RADIUS = 0.20
COLLAR_HEIGHT = 0.05

# Head sphere
HEAD_RADIUS = 0.18
HEAD_SINK   = 0.04   # how far head dips into collar (bigger = more nestled)

# ============================================================
# BUILD - usually no need to edit below this line
# ============================================================
import bmesh

def hex_to_linear(hex_str):
    h = hex_str.lstrip('#')
    srgb = [int(h[i:i+2], 16) / 255.0 for i in (0, 2, 4)]
    linear = [c/12.92 if c <= 0.04045 else ((c+0.055)/1.055)**2.4 for c in srgb]
    return (linear[0], linear[1], linear[2], 1.0)

def get_or_create_material(name, color_rgba, roughness=0.5):
    mat = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = color_rgba
        bsdf.inputs["Roughness"].default_value = roughness
    return mat

def wipe_collection(name):
    """Remove collection and all its objects so we can rebuild cleanly."""
    if name in bpy.data.collections:
        col = bpy.data.collections[name]
        for obj in list(col.objects):
            bpy.data.objects.remove(obj, do_unlink=True)
        bpy.data.collections.remove(col)

def make_collection(name):
    col = bpy.data.collections.new(name)
    bpy.context.scene.collection.children.link(col)
    return col

def add_to_collection(obj, collection):
    for c in obj.users_collection:
        c.objects.unlink(obj)
    collection.objects.link(obj)

def finish_object(obj, collection):
    """Standard finish: flat shade, apply transforms, move to collection."""
    add_to_collection(obj, collection)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.shade_flat()
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)

# --- WIPE & SETUP ---
wipe_collection(PIECE_NAME)
collection = make_collection(PIECE_NAME)

# Compute z positions from the parameters (each part stacks on the previous)
base_z   = BASE_HEIGHT / 2
body_z   = BASE_HEIGHT + BODY_HEIGHT / 2
collar_z = BASE_HEIGHT + BODY_HEIGHT + COLLAR_HEIGHT / 2
head_z   = BASE_HEIGHT + BODY_HEIGHT + COLLAR_HEIGHT + HEAD_RADIUS - HEAD_SINK

# --- BASE DISC ---
bpy.ops.mesh.primitive_cylinder_add(
    vertices=SIDES, radius=BASE_RADIUS, depth=BASE_HEIGHT,
    location=(0, 0, base_z),
)
base = bpy.context.active_object
base.name = f"{PIECE_NAME}_Base"
finish_object(base, collection)

# --- BODY (tapered) ---
bpy.ops.mesh.primitive_cylinder_add(
    vertices=SIDES, radius=BODY_BOTTOM_RADIUS, depth=BODY_HEIGHT,
    location=(0, 0, body_z),
)
body = bpy.context.active_object
body.name = f"{PIECE_NAME}_Body"

# Taper the top ring inward
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='DESELECT')
bpy.ops.object.mode_set(mode='OBJECT')
for v in body.data.vertices:
    if v.co.z > 0:  # top half = top ring
        v.select = True
bpy.ops.object.mode_set(mode='EDIT')
bm = bmesh.from_edit_mesh(body.data)
scale_factor = BODY_TOP_RADIUS / BODY_BOTTOM_RADIUS
for v in bm.verts:
    if v.select:
        v.co.x *= scale_factor
        v.co.y *= scale_factor
bmesh.update_edit_mesh(body.data)
bpy.ops.object.mode_set(mode='OBJECT')
finish_object(body, collection)

# --- COLLAR ---
bpy.ops.mesh.primitive_cylinder_add(
    vertices=SIDES, radius=COLLAR_RADIUS, depth=COLLAR_HEIGHT,
    location=(0, 0, collar_z),
)
collar = bpy.context.active_object
collar.name = f"{PIECE_NAME}_Collar"
finish_object(collar, collection)

# --- HEAD ---
bpy.ops.mesh.primitive_uv_sphere_add(
    segments=SPHERE_SEG, ring_count=SPHERE_RNG, radius=HEAD_RADIUS,
    location=(0, 0, head_z),
)
head = bpy.context.active_object
head.name = f"{PIECE_NAME}_Head"
finish_object(head, collection)

# --- MATERIAL ---
WHITE = hex_to_linear("#F0F0F0")
BLACK = hex_to_linear("#1A1A1A")
mat_white = get_or_create_material("Chess_White", WHITE, roughness=0.5)
mat_black = get_or_create_material("Chess_Black", BLACK, roughness=0.5)
team_mat = mat_white if COLOR == "WHITE" else mat_black

for part in [base, body, collar, head]:
    part.data.materials.clear()
    part.data.materials.append(team_mat)

# --- PARENT EMPTY (for linked-library workflow) ---
bpy.ops.object.empty_add(type='PLAIN_AXES', location=(0, 0, 0))
parent = bpy.context.active_object
parent.name = PIECE_NAME
parent.empty_display_size = 0.3
add_to_collection(parent, collection)

for part in [base, body, collar, head]:
    part.parent = parent
    part.matrix_parent_inverse = parent.matrix_world.inverted()

total_height = BASE_HEIGHT + BODY_HEIGHT + COLLAR_HEIGHT + (2*HEAD_RADIUS - HEAD_SINK)
print(f"=== {PIECE_NAME} built ({COLOR}) ===")
print(f"Total height: {total_height:.3f}  (target ~1.0)")