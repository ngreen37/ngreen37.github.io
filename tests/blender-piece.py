# Run by tests/gen-pieces.js inside headless Blender:
#   blender -b X.blend --factory-startup --python this -- out.png HEIGHT ELEV
#
# One piece, rendered onto the shared 512x512 canvas the Tournament Board expects.

import sys
import math
import bpy
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:]
OUT = argv[0]
HEIGHT = float(argv[1])        # this piece's height in canon units (King = 1.43)
ELEV = math.radians(float(argv[2]))

# ⚠⚠ THE CAMERA IS A CONSTANT AND THE MODEL IS WHAT MOVES. board_view.gd fits the LONGEST
# side of each texture to the square, so twelve PNGs cropped to twelve bounding boxes come
# out twelve identical heights — a pawn as tall as a king, no warning anywhere. Every piece
# renders through this one frame, and the only thing that differs is HEIGHT.
ORTHO = 1.66           # visible span in canon units: a 1.43 king fills ~86% of it
AIM_Z = 0.74           # frame center, so feet sit near the bottom edge with a little air
PX = 512
SAMPLES = 96

# ⚠ The palette cubes are a tool, not the model — same trap as blender-export.py. Here they
# would not just ride along, they would stand in frame next to the piece.
palette = bpy.data.collections.get("Palette")
if palette is not None:
    for ob in list(palette.objects):
        bpy.data.objects.remove(ob, do_unlink=True)

scene = bpy.context.scene
meshes = [o for o in scene.objects if o.type == 'MESH' and not o.hide_render]
if not meshes:
    print("PIECE_FAIL no renderable mesh")
    sys.exit(0)

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
mid = (lo + hi) * 0.5
root.location = (-mid.x * k, -mid.y * k, -lo.z * k)
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
print("PIECE_OK %s height=%.3f from=%.3f scale=%.4f fill=%.0f%%"
      % (OUT, HEIGHT, raw, k, (worst * 2.0 / ORTHO) * 100.0))
