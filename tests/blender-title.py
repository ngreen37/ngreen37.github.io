# blender -b <his title .blend> --factory-startup --python tests/blender-title.py -- <outdir> [fillW]
# ⭐ HIS 11-27: "I added an animated game text for Game four" (Game_Text2.blend: "Game Four" in gold on a plaque, one area
# light sweeping across it over the scene's frame range). Rendered as he lit it, frame by frame, to transparent PNGs that
# the Tournament Board's opening card plays (broadcast.gd, titles/<game>/). Called by tests/wc-title.js.
# ⚠ HIS FILE HAS NO CAMERA: an orthographic one looks straight down at the meshes (the text faces +Z), fitted to their
#   width with a margin. His scene, lights, materials and color management are untouched.
# ⚠ `fillW` > 0 adds ONE still soft area light (his choice between the raw sweep and "every letter readable", 11-27).
import bpy, sys, os
from mathutils import Vector

args = sys.argv[sys.argv.index('--') + 1:]
out = os.path.normpath(args[0])
fill = float(args[1]) if len(args) > 1 else 0.0
W = 1600
sc = bpy.context.scene
pts = []
for ob in sc.objects:
    if ob.type == 'MESH' and ob.visible_get():
        pts += [ob.matrix_world @ Vector(c) for c in ob.bound_box]
if not pts:
    raise SystemExit('TITLE_FAIL no visible mesh in the scene')
mn = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
mx = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
ctr, w, h = (mn + mx) / 2, mx.x - mn.x, mx.y - mn.y
H = int(round(W * (h * 1.3) / (w * 1.08) / 2)) * 2
cd = bpy.data.cameras.new('TitleCam')
cd.type = 'ORTHO'
cd.ortho_scale = max(w * 1.08, h * 1.3 * W / H)
cd.clip_end = 1000
cam = bpy.data.objects.new('TitleCam', cd)
sc.collection.objects.link(cam)
cam.location = (ctr.x, ctr.y, mx.z + 20)
sc.camera = cam
if fill > 0:
    ld = bpy.data.lights.new('TitleFill', 'AREA')
    ld.energy, ld.shape, ld.size, ld.size_y = fill, 'RECTANGLE', w * 1.2, h * 3
    lo = bpy.data.objects.new('TitleFill', ld)
    sc.collection.objects.link(lo)
    lo.location = (ctr.x, ctr.y - h * 1.5, mx.z + 4)
    lo.rotation_euler = (0.35, 0, 0)
r = sc.render
r.resolution_x, r.resolution_y, r.resolution_percentage = W, H, 100
r.film_transparent = True
r.image_settings.file_format = 'PNG'
r.image_settings.color_mode = 'RGBA'
r.filepath = os.path.join(out, 't_')
bpy.ops.render.render(animation=True)
print('TITLE_OK frames=%d size=%dx%d fps=%g fill=%g' % (sc.frame_end - sc.frame_start + 1, W, H, r.fps / r.fps_base, fill))
