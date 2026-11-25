# Run by tests/gen-pieces.js inside headless Blender:
#   blender -b X.blend --factory-startup --python this -- out.png HEIGHT ELEV [TURN LIVERY]
#
# One piece, rendered onto the shared 512x512 canvas the Tournament Board expects.
# TURN: degrees about the vertical. LIVERY: "r,g,b,roughness" (linear), every surface worn in
# it — one laptop model rendered as either side.

import sys
import math
import bpy
from mathutils import Vector, Matrix

argv = sys.argv[sys.argv.index("--") + 1:]
OUT = argv[0]
HEIGHT = float(argv[1])        # this piece's height in canon units (King = 1.43)
ELEV = math.radians(float(argv[2]))
TURN = math.radians(float(argv[3])) if len(argv) > 3 else 0.0
LIVERY = [float(x) for x in argv[4].split(",")] if len(argv) > 4 else None

# ⚠⚠ THE CAMERA IS A CONSTANT AND THE MODEL IS WHAT MOVES. board_view.gd fits the LONGEST
# side of each texture to the square, so twelve PNGs cropped to twelve bounding boxes come
# out twelve identical heights — a pawn as tall as a king, no warning anywhere. Every piece
# renders through this one frame, and the only thing that differs is HEIGHT.
ORTHO = 1.66           # visible span in canon units: a 1.43 king fills ~86% of it
AIM_Z = 0.74           # frame center, so feet sit near the bottom edge with a little air
PX = 512
SAMPLES = 96
# ⭐ HIS 11-24 ("the smooth with half of the faces looks just fine"): every piece is prepared as Checker Town's
# tests/blender_glb.py prepares its 3D twin, so the YouTube board and the 3D boards show one shape. test:board3d
# holds these three equal to the game's.
SMOOTH_ANGLE = 30.0    # degrees: an edge sharper than this stays a crisp rim
BUDGET = 6500          # triangles
FLOOR = 0.5            # never cut below half

# ⚠ The palette cubes are a tool, not the model — same trap as blender-export.py. Here they
# would not just ride along, they would stand in frame next to the piece.
palette = bpy.data.collections.get("Palette")
if palette is not None:
    for ob in list(palette.objects):
        bpy.data.objects.remove(ob, do_unlink=True)

scene = bpy.context.scene
# ⚠ the three suns below are the only light: a lamp left in his scene brightens that one piece
for o in list(scene.objects):
    if o.type == 'LIGHT':
        bpy.data.objects.remove(o, do_unlink=True)
# ⚠ a rigged piece stands in its REST pose, or a save left mid-bow draws a bowing pawn
for o in scene.objects:
    if o.type == 'ARMATURE':
        o.data.pose_position = 'REST'
bpy.context.view_layer.update()
meshes = [o for o in scene.objects if o.type == 'MESH' and not o.hide_render]
if not meshes:
    print("PIECE_FAIL no renderable mesh")
    sys.exit(0)

if LIVERY:
    mat = bpy.data.materials.new("Livery")
    if mat.node_tree is None:      # Blender 4; 5 always has one, and warns when use_nodes is set
        mat.use_nodes = True
    bsdf = next((n for n in mat.node_tree.nodes if n.type == 'BSDF_PRINCIPLED'), None) if mat.node_tree else None
    if bsdf is None:
        print("PIECE_FAIL no Principled BSDF to dress the piece in")
        sys.exit(0)
    bsdf.inputs["Base Color"].default_value = (LIVERY[0], LIVERY[1], LIVERY[2], 1.0)
    bsdf.inputs["Roughness"].default_value = LIVERY[3]
    bsdf.inputs["Metallic"].default_value = 0.0
    for o in meshes:
        if not o.material_slots:
            o.data.materials.append(mat)
        for s in o.material_slots:
            s.material = mat


def count_tris():
    n = 0
    dg = bpy.context.evaluated_depsgraph_get()
    for o in meshes:
        m = o.evaluated_get(dg).to_mesh()
        m.calc_loop_triangles()
        n += len(m.loop_triangles)
        o.evaluated_get(dg).to_mesh_clear()
    return n


modeled = count_tris()
ratio = min(1.0, max(FLOOR, BUDGET / modeled)) if modeled else 1.0
for o in meshes:
    o.data.shade_smooth()
    o.data.set_sharp_from_angle(angle=math.radians(SMOOTH_ANGLE))
    if ratio < 1.0:
        o.modifiers.new("Budget", 'DECIMATE').ratio = ratio
        if any(md.type == 'ARMATURE' for md in o.modifiers):
            with bpy.context.temp_override(object=o, active_object=o):
                bpy.ops.object.modifier_move_to_index(modifier="Budget", index=0)
bpy.context.view_layer.update()

lo = Vector((1e9, 1e9, 1e9))
hi = Vector((-1e9, -1e9, -1e9))
for o in meshes:
    for c in o.bound_box:
        w = o.matrix_world @ Vector(c)
        for i in range(3):
            lo[i] = min(lo[i], w[i])
            hi[i] = max(hi[i], w[i])
raw = hi.z - lo.z
if raw <= 0.0:
    print("PIECE_FAIL model has no height")
    sys.exit(0)

# ⚠⚠ HE MODELS EACH PIECE IN A FRESH FILE AT WHATEVER SCALE IS CONVENIENT. The May set is
# 0.97 units tall standing on z=0; wp_0.1 is 3.148 tall standing on z=-1. Both are correct
# pawns and neither is wrong to save that way, so the script converts instead of asking him
# to remember. Scale to the declared height, then stand it on the floor and center it.
k = HEIGHT / raw
root = bpy.data.objects.new("PieceRoot", None)
scene.collection.objects.link(root)
for o in list(scene.objects):
    if o is not root and o.parent is None:
        o.parent = root
        o.matrix_parent_inverse = root.matrix_world.inverted()
root.scale = (k, k, k)
root.rotation_euler = (0.0, 0.0, TURN)
mid = (lo + hi) * 0.5
# ⚠ the centering turns with the piece, or a turned piece stands off its square
off = Matrix.Rotation(TURN, 3, 'Z') @ Vector((mid.x * k, mid.y * k, 0.0))
root.location = (-off.x, -off.y, -lo.z * k)
bpy.context.view_layer.update()

cam_data = bpy.data.cameras.new("PieceCam")
cam_data.type = 'ORTHO'
cam_data.ortho_scale = ORTHO
cam = bpy.data.objects.new("PieceCam", cam_data)
scene.collection.objects.link(cam)
aim = Vector((0.0, 0.0, AIM_Z))
offset = Vector((0.0, -math.cos(ELEV), math.sin(ELEV))) * 10.0
cam.location = aim + offset
cam.rotation_euler = (-offset).to_track_quat('-Z', 'Y').to_euler()
scene.camera = cam

# Suns, not points: a sun has no falloff, so the lighting is identical whether the file was
# modeled at 1 unit tall or 300, and stays identical after the rescale above.
for name, rot, energy in [
    ("Key",  (math.radians(55), 0.0, math.radians(-40)), 3.4),
    ("Fill", (math.radians(72), 0.0, math.radians(55)),  1.3),
    ("Rim",  (math.radians(120), 0.0, math.radians(170)), 2.2),
]:
    ld = bpy.data.lights.new(name, 'SUN')
    ld.energy = energy
    ld.angle = math.radians(12.0)
    lo_obj = bpy.data.objects.new(name, ld)
    lo_obj.rotation_euler = rot
    scene.collection.objects.link(lo_obj)

scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.samples = SAMPLES
scene.cycles.use_denoising = True
scene.render.resolution_x = PX
scene.render.resolution_y = PX
scene.render.resolution_percentage = 100
scene.render.film_transparent = True
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.render.image_settings.color_depth = '8'
scene.render.filepath = OUT

# ⚠ AgX is Blender's default and it is a film response, not a color: it would walk the ivory
# he picked in the material toward grey and he would have no way to tell which of the two he
# was looking at. This art is matched against hex in a stylesheet, so the pixel has to be the
# color he chose.
try:
    scene.view_settings.view_transform = 'Standard'
    scene.view_settings.look = 'None'
except Exception:
    pass

# ⚠⚠ A PIECE TALLER THAN THE FRAME IS CROPPED, NOT REPORTED. Cycles renders a decapitated
# king perfectly happily and writes a valid PNG. Measure the corners in camera space instead
# of trusting that ORTHO was generous enough when the twelfth piece arrives.
# ⚠ update first: the new camera's matrix_world is identity until then, and this measured
# the piece's footprint instead of its height — a king of any size passed
bpy.context.view_layer.update()
inv = cam.matrix_world.inverted()
half = ORTHO * 0.5
worst = 0.0
for o in meshes:
    for c in o.bound_box:
        v = inv @ (o.matrix_world @ Vector(c))
        worst = max(worst, abs(v.x), abs(v.y))
if worst > half:
    print("PIECE_CLIP needs ortho %.3f, frame is %.3f" % (worst * 2.0, ORTHO))

bpy.ops.render.render(write_still=True)
print("PIECE_OK %s height=%.3f from=%.3f scale=%.4f fill=%.0f%% tris=%d of %d"
      % (OUT, HEIGHT, raw, k, (worst * 2.0 / ORTHO) * 100.0, count_tris(), modeled))
