"""
PJCC Chess Pieces - QUEEN
Combined build script. Edit SHAPE PARAMETERS, re-run.

Save Queen.blend at: C:/Users/Nate/Desktop/PJCC/assets/pieces/Queen.blend
"""

import bpy
import bmesh
import math

# ============================================================
# SHAPE PARAMETERS - edit these to reshape the queen
# ============================================================
PIECE_NAME = "Queen"
COLOR      = "WHITE"

SIDES      = 12
SPHERE_SEG = 12
SPHERE_RNG = 8

# Base
BASE_RADIUS = 0.32
BASE_HEIGHT = 0.06

# Body (tall, dramatic taper)
BODY_BOTTOM_RADIUS = 0.27
BODY_TOP_RADIUS    = 0.16
BODY_HEIGHT        = 0.95

# Collar (under crown)
COLLAR_RADIUS = 0.20
COLLAR_HEIGHT = 0.05

# Crown ring (the wide part the points sit on)
CROWN_BASE_RADIUS = 0.22
CROWN_BASE_HEIGHT = 0.08

# Crown points (small spheres around the rim - queen's tiara)
NUM_POINTS    = 8
POINT_RADIUS  = 0.05
POINT_RING_R  = 0.20   # how far from center the points sit

# Top sphere (final crown jewel)
TOP_RADIUS = 0.08

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

base_z       = BASE_HEIGHT / 2
body_z       = BASE_HEIGHT + BODY_HEIGHT / 2
collar_z     = BASE_HEIGHT + BODY_HEIGHT + COLLAR_HEIGHT / 2
crown_base_z = BASE_HEIGHT + BODY_HEIGHT + COLLAR_HEIGHT + CROWN_BASE_HEIGHT / 2
points_z     = BASE_HEIGHT + BODY_HEIGHT + COLLAR_HEIGHT + CROWN_BASE_HEIGHT + POINT_RADIUS
top_z        = BASE_HEIGHT + BODY_HEIGHT + COLLAR_HEIGHT + CROWN_BASE_HEIGHT + TOP_RADIUS

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

# --- COLLAR ---
bpy.ops.mesh.primitive_cylinder_add(
    vertices=SIDES, radius=COLLAR_RADIUS, depth=COLLAR_HEIGHT,
    location=(0, 0, collar_z),
)
collar = bpy.context.active_object
collar.name = f"{PIECE_NAME}_Collar"
finish_object(collar, collection)

# --- CROWN BASE ---
bpy.ops.mesh.primitive_cylinder_add(
    vertices=SIDES, radius=CROWN_BASE_RADIUS, depth=CROWN_BASE_HEIGHT,
    location=(0, 0, crown_base_z),
)
crown_base = bpy.context.active_object
crown_base.name = f"{PIECE_NAME}_CrownBase"
finish_object(crown_base, collection)

# --- CROWN POINTS (ring of spheres) ---
all_parts = [base, body, collar, crown_base]
for i in range(NUM_POINTS):
    angle = (2 * math.pi / NUM_POINTS) * i
    x = math.cos(angle) * POINT_RING_R
    y = math.sin(angle) * POINT_RING_R
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=SPHERE_SEG, ring_count=SPHERE_RNG,
        radius=POINT_RADIUS, location=(x, y, points_z),
    )
    point = bpy.context.active_object
    point.name = f"{PIECE_NAME}_Point_{i+1:02d}"
    finish_object(point, collection)
    all_parts.append(point)

# --- TOP JEWEL ---
bpy.ops.mesh.primitive_uv_sphere_add(
    segments=SPHERE_SEG, ring_count=SPHERE_RNG,
    radius=TOP_RADIUS, location=(0, 0, top_z),
)
top = bpy.context.active_object
top.name = f"{PIECE_NAME}_Top"
finish_object(top, collection)
all_parts.append(top)

# --- MATERIAL ---
WHITE = hex_to_linear("#F0F0F0")
BLACK = hex_to_linear("#1A1A1A")
mat_white = get_or_create_material("Chess_White", WHITE)
mat_black = get_or_create_material("Chess_Black", BLACK)
team_mat = mat_white if COLOR == "WHITE" else mat_black

for part in all_parts:
    part.data.materials.clear()
    part.data.materials.append(team_mat)

# --- PARENT EMPTY ---
bpy.ops.object.empty_add(type='PLAIN_AXES', location=(0, 0, 0))
parent = bpy.context.active_object
parent.name = PIECE_NAME
parent.empty_display_size = 0.3
add_to_collection(parent, collection)
for part in all_parts:
    part.parent = parent
    part.matrix_parent_inverse = parent.matrix_world.inverted()

total_height = BASE_HEIGHT + BODY_HEIGHT + COLLAR_HEIGHT + CROWN_BASE_HEIGHT + 2*POINT_RADIUS
print(f"=== {PIECE_NAME} built ({COLOR}) ===")
print(f"Approx height: {total_height:.3f}  (target ~1.5)")
print(f"Crown points: {NUM_POINTS}")