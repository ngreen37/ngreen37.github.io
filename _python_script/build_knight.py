"""
PJCC Chess Pieces - KNIGHT
Combined build script. Edit SHAPE PARAMETERS, re-run.

Save Knight.blend at: C:/Users/Nate/Desktop/PJCC/assets/pieces/Knight.blend

Note: this is a STYLIZED knight - faceted L-shape head, not a realistic horse.
For a real horse-head silhouette you'll need to do edit-mode sculpting later.
"""

import bpy
import bmesh
import math

# ============================================================
# SHAPE PARAMETERS - edit these to reshape the knight
# ============================================================
PIECE_NAME = "Knight"
COLOR      = "WHITE"

SIDES      = 12

# Base
BASE_RADIUS = 0.32
BASE_HEIGHT = 0.06

# Body (cylindrical, slight taper)
BODY_BOTTOM_RADIUS = 0.27
BODY_TOP_RADIUS    = 0.20
BODY_HEIGHT        = 0.55

# Neck (rectangular block tilted forward)
NECK_WIDTH    = 0.20  # x dimension (left-right)
NECK_DEPTH    = 0.30  # y dimension (front-back)
NECK_HEIGHT   = 0.45  # z dimension (up)
NECK_TILT_DEG = 25    # how far the head leans forward (degrees)
NECK_OFFSET_Y = 0.0   # shift forward/back from center

# Head (smaller block on top of neck, the muzzle)
HEAD_WIDTH  = 0.16
HEAD_DEPTH  = 0.32   # longer in y to suggest a snout
HEAD_HEIGHT = 0.18

# ============================================================
# BUILD
# ============================================================
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
    add_to_collection(obj, collection)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.shade_flat()
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)

def taper_top(obj, factor):
    bpy.ops.object.mode_set(mode='OBJECT')
    for v in obj.data.vertices:
        v.select = (v.co.z > 0)
    bpy.ops.object.mode_set(mode='EDIT')
    bm = bmesh.from_edit_mesh(obj.data)
    for v in bm.verts:
        if v.select:
            v.co.x *= factor
            v.co.y *= factor
    bmesh.update_edit_mesh(obj.data)
    bpy.ops.object.mode_set(mode='OBJECT')

# --- WIPE & SETUP ---
wipe_collection(PIECE_NAME)
collection = make_collection(PIECE_NAME)

base_z = BASE_HEIGHT / 2
body_z = BASE_HEIGHT + BODY_HEIGHT / 2
neck_z = BASE_HEIGHT + BODY_HEIGHT + NECK_HEIGHT / 2

# --- BASE ---
bpy.ops.mesh.primitive_cylinder_add(
    vertices=SIDES, radius=BASE_RADIUS, depth=BASE_HEIGHT,
    location=(0, 0, base_z),
)
base = bpy.context.active_object
base.name = f"{PIECE_NAME}_Base"
finish_object(base, collection)

# --- BODY ---
bpy.ops.mesh.primitive_cylinder_add(
    vertices=SIDES, radius=BODY_BOTTOM_RADIUS, depth=BODY_HEIGHT,
    location=(0, 0, body_z),
)
body = bpy.context.active_object
body.name = f"{PIECE_NAME}_Body"
taper_top(body, BODY_TOP_RADIUS / BODY_BOTTOM_RADIUS)
finish_object(body, collection)

# --- NECK (tilted block) ---
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, NECK_OFFSET_Y, neck_z))
neck = bpy.context.active_object
neck.name = f"{PIECE_NAME}_Neck"
neck.scale = (NECK_WIDTH, NECK_DEPTH, NECK_HEIGHT)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

# Tilt forward around X axis (leans in +y direction)
neck.rotation_euler[0] = math.radians(NECK_TILT_DEG)
bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
finish_object(neck, collection)

# --- HEAD (snout block on top, follows tilt) ---
# Compute where the top of the tilted neck is
tilt_rad = math.radians(NECK_TILT_DEG)
half_neck = NECK_HEIGHT / 2
head_x = 0
head_y = NECK_OFFSET_Y + math.sin(tilt_rad) * half_neck
head_z_pos = neck_z + math.cos(tilt_rad) * half_neck + HEAD_HEIGHT/2

bpy.ops.mesh.primitive_cube_add(size=1, location=(head_x, head_y, head_z_pos))
head = bpy.context.active_object
head.name = f"{PIECE_NAME}_Head"
head.scale = (HEAD_WIDTH, HEAD_DEPTH, HEAD_HEIGHT)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

# Apply same tilt as neck so head points forward
head.rotation_euler[0] = math.radians(NECK_TILT_DEG)
bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
finish_object(head, collection)

# --- MATERIAL ---
WHITE = hex_to_linear("#F0F0F0")
BLACK = hex_to_linear("#1A1A1A")
mat_white = get_or_create_material("Chess_White", WHITE)
mat_black = get_or_create_material("Chess_Black", BLACK)
team_mat = mat_white if COLOR == "WHITE" else mat_black

for part in [base, body, neck, head]:
    part.data.materials.clear()
    part.data.materials.append(team_mat)

# --- PARENT EMPTY ---
bpy.ops.object.empty_add(type='PLAIN_AXES', location=(0, 0, 0))
parent = bpy.context.active_object
parent.name = PIECE_NAME
parent.empty_display_size = 0.3
add_to_collection(parent, collection)
for part in [base, body, neck, head]:
    part.parent = parent
    part.matrix_parent_inverse = parent.matrix_world.inverted()

total_height = BASE_HEIGHT + BODY_HEIGHT + math.cos(tilt_rad)*NECK_HEIGHT + HEAD_HEIGHT
print(f"=== {PIECE_NAME} built ({COLOR}) ===")
print(f"Approx height: {total_height:.3f}  (target ~1.3)")
print(f"Tilt: {NECK_TILT_DEG} degrees forward")
print("Note: stylized faceted L-shape, not realistic horse")