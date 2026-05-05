"""
PJCC Chess Pieces - ROOK
Combined build script. Edit SHAPE PARAMETERS, re-run.

Save Rook.blend at: C:/Users/Nate/Desktop/PJCC/assets/pieces/Rook.blend
"""

import bpy
import bmesh

# ============================================================
# SHAPE PARAMETERS - edit these to reshape the rook
# ============================================================
PIECE_NAME = "Rook"
COLOR      = "WHITE"   # "WHITE" or "BLACK"

SIDES      = 12        # cylinder sides

# Base disc
BASE_RADIUS = 0.32
BASE_HEIGHT = 0.06

# Body (slight taper, more cylindrical than pawn)
BODY_BOTTOM_RADIUS = 0.27
BODY_TOP_RADIUS    = 0.24
BODY_HEIGHT        = 0.70

# Top crown (the castle turret base)
CROWN_RADIUS = 0.30   # slightly wider than body, gives flared lip
CROWN_HEIGHT = 0.10

# Battlements (the notches on top)
NUM_NOTCHES      = 4    # how many notches around the rim
NOTCH_DEPTH      = 0.08 # how deep the notches cut down
NOTCH_WIDTH_FRAC = 0.5  # fraction of crown angle taken by each notch
                         # (0.5 = notches and merlons are equal width)

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

# --- WIPE & SETUP ---
wipe_collection(PIECE_NAME)
collection = make_collection(PIECE_NAME)

base_z   = BASE_HEIGHT / 2
body_z   = BASE_HEIGHT + BODY_HEIGHT / 2
crown_z  = BASE_HEIGHT + BODY_HEIGHT + CROWN_HEIGHT / 2

# --- BASE ---
bpy.ops.mesh.primitive_cylinder_add(
    vertices=SIDES, radius=BASE_RADIUS, depth=BASE_HEIGHT,
    location=(0, 0, base_z),
)
base = bpy.context.active_object
base.name = f"{PIECE_NAME}_Base"
finish_object(base, collection)

# --- BODY (slight taper) ---
bpy.ops.mesh.primitive_cylinder_add(
    vertices=SIDES, radius=BODY_BOTTOM_RADIUS, depth=BODY_HEIGHT,
    location=(0, 0, body_z),
)
body = bpy.context.active_object
body.name = f"{PIECE_NAME}_Body"
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='DESELECT')
bpy.ops.object.mode_set(mode='OBJECT')
for v in body.data.vertices:
    if v.co.z > 0:
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

# --- CROWN with battlements ---
# Build the crown as a polygon ring with notches cut into the top.
# Strategy: make a cylinder, then in edit mode, lower top vertices that fall
# inside notch arcs.
bpy.ops.mesh.primitive_cylinder_add(
    vertices=SIDES, radius=CROWN_RADIUS, depth=CROWN_HEIGHT,
    location=(0, 0, crown_z),
)
crown = bpy.context.active_object
crown.name = f"{PIECE_NAME}_Crown"

# Identify top-ring vertices and lower the ones inside notch zones.
import math
bpy.ops.object.mode_set(mode='OBJECT')
verts = crown.data.vertices

# Top ring = vertices with positive local z
top_ring = [v for v in verts if v.co.z > 0]

# Sort top-ring verts by angle around z-axis
def angle_of(v):
    return math.atan2(v.co.y, v.co.x)

# For each notch, define an angular window and lower verts inside it.
# Notches evenly spaced around the circle.
two_pi = 2 * math.pi
notch_arc = (two_pi / NUM_NOTCHES) * NOTCH_WIDTH_FRAC
for i in range(NUM_NOTCHES):
    # Center angle of this notch
    center = i * (two_pi / NUM_NOTCHES)
    a_min = center - notch_arc / 2
    a_max = center + notch_arc / 2
    for v in top_ring:
        a = angle_of(v)
        # Normalize to [0, 2pi) for comparison
        a_norm = a % two_pi
        c_min = a_min % two_pi
        c_max = a_max % two_pi
        # Handle wraparound at 2pi
        if c_min < c_max:
            inside = c_min <= a_norm <= c_max
        else:
            inside = a_norm >= c_min or a_norm <= c_max
        if inside:
            v.co.z -= NOTCH_DEPTH

finish_object(crown, collection)

# --- MATERIAL ---
WHITE = hex_to_linear("#F0F0F0")
BLACK = hex_to_linear("#1A1A1A")
mat_white = get_or_create_material("Chess_White", WHITE)
mat_black = get_or_create_material("Chess_Black", BLACK)
team_mat = mat_white if COLOR == "WHITE" else mat_black

for part in [base, body, crown]:
    part.data.materials.clear()
    part.data.materials.append(team_mat)

# --- PARENT EMPTY ---
bpy.ops.object.empty_add(type='PLAIN_AXES', location=(0, 0, 0))
parent = bpy.context.active_object
parent.name = PIECE_NAME
parent.empty_display_size = 0.3
add_to_collection(parent, collection)
for part in [base, body, crown]:
    part.parent = parent
    part.matrix_parent_inverse = parent.matrix_world.inverted()

total_height = BASE_HEIGHT + BODY_HEIGHT + CROWN_HEIGHT
print(f"=== {PIECE_NAME} built ({COLOR}) ===")
print(f"Total height: {total_height:.3f}  (target ~1.2)")
print(f"Notches: {NUM_NOTCHES}  Notch depth: {NOTCH_DEPTH}")
