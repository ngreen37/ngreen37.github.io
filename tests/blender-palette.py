# blender-palette.py — swatch cubes, one per color, each with its own named material.
# Paste into Blender's Scripting tab and press Run. Safe to re-run.
#
# Add a color: one line in COLORS. Change a color: edit the hex and run it again — the
# material is reused by NAME, so faces you already painted keep their color and follow the
# edit. ⚠ Renaming one here makes a NEW material and orphans the old assignment.
#
# ⚠ The cubes are in a "Palette" collection, which tests/blender-export.py drops before it
# writes the GLB. Rename the collection and they ship inside nate.glb.

import bpy
import mathutils

COLORS = [
    ("Red",   "FF0000"),
    ("Green", "00FF00"),
    ("Blue",  "0000FF"),
]

COLL = "Palette"
# ⚠ 0 = size and place them off whatever is already in the file, so this works the same in
# Nate_0.6 (18 units tall) and Altar_2 (about one). A number here overrides the sizing only;
# the row still lands clear of the model instead of inside it.
SIZE = 0.0
GAP = 0.35                 # as a fraction of SIZE


# ⚠⚠ HEX IS sRGB, BLENDER'S base_color IS LINEAR. Pure primaries are the same in both, so
# this changes nothing today — the moment a real color goes in the list it is the difference
# between the swatch you picked and one visibly washed out.
def _linear(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def _rgba(hex_rgb):
    h = hex_rgb.lstrip("#")
    return tuple(_linear(int(h[i:i + 2], 16) / 255.0) for i in (0, 2, 4)) + (1.0,)


def swatch_material(name, hex_rgb):
    mat = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    mat.use_nodes = True
    rgba = _rgba(hex_rgb)
    bsdf = next((n for n in mat.node_tree.nodes if n.type == "BSDF_PRINCIPLED"), None)
    if bsdf is not None:
        bsdf.inputs["Base Color"].default_value = rgba
    mat.diffuse_color = rgba          # what Solid view shows
    return mat


# What is already in the file, ignoring the swatches themselves — otherwise a re-run measures
# the last row and the palette walks further out every time you press Run.
def _scene_box():
    pts = []
    for ob in bpy.context.scene.objects:
        if ob.type != "MESH" or ob.name.startswith("swatch_"):
            continue
        pts += [ob.matrix_world @ mathutils.Vector(c) for c in ob.bound_box]
    if not pts:
        return mathutils.Vector((0, 0, 0)), mathutils.Vector((0, 0, 0))
    lo = mathutils.Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
    hi = mathutils.Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    return lo, hi


def build():
    # ⚠ The OBJECTS go, the MATERIALS stay. Deleting materials on a re-run would strip the
    # color off every face on Nate that is already using one.
    old = bpy.data.collections.get(COLL)
    if old is not None:
        for ob in list(old.objects):
            bpy.data.objects.remove(ob, do_unlink=True)
        bpy.data.collections.remove(old)

    lo, hi = _scene_box()
    span = hi - lo
    size = SIZE if SIZE > 0.0 else max(max(span.x, span.y, span.z) * 0.16, 0.05)
    step = size * (1.0 + GAP)
    # beside him on +X and standing on the same floor, so nothing is behind anything
    x0 = hi.x + size
    y0 = (lo.y + hi.y) / 2.0
    z0 = lo.z + size / 2.0

    coll = bpy.data.collections.new(COLL)
    bpy.context.scene.collection.children.link(coll)

    for i, (name, hex_rgb) in enumerate(COLORS):
        mesh = bpy.data.meshes.new("swatch_" + name)
        ob = bpy.data.objects.new("swatch_" + name, mesh)
        coll.objects.link(ob)

        h = size / 2.0
        verts = [(x * h, y * h, z * h) for x in (-1, 1) for y in (-1, 1) for z in (-1, 1)]
        faces = [(0, 1, 3, 2), (4, 6, 7, 5), (0, 4, 5, 1),
                 (2, 3, 7, 6), (0, 2, 6, 4), (1, 5, 7, 3)]
        mesh.from_pydata(verts, [], faces)
        mesh.update()

        ob.location = (x0 + i * step, y0, z0)
        ob.data.materials.append(swatch_material(name, hex_rgb))

    print("palette: %d swatches at %.2f — %s"
          % (len(COLORS), size, ", ".join(n for n, _ in COLORS)))


build()
