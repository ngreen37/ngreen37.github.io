# Run by tests/gen-models.js inside headless Blender:  blender -b X.blend --python this -- out.glb
import bpy, sys

out = sys.argv[sys.argv.index("--") + 1]

# ⚠⚠ THE PALETTE IS A TOOL, NOT PART OF THE MODEL. tests/blender-palette.py leaves swatch
# cubes in the scene, and the glTF exporter takes the whole scene — they would ride into the
# GLB and stand next to him in Checker Town. Dropped here rather than by hand, because "did
# you delete the cubes" is a step somebody forgets exactly once. -b never saves the .blend.
# ⚠ Objects only: a material the swatches created may be painted on the model itself.
palette = bpy.data.collections.get("Palette")
if palette is not None:
    for ob in list(palette.objects):
        bpy.data.objects.remove(ob, do_unlink=True)

bpy.ops.export_scene.gltf(
    filepath=out,
    export_format='GLB',
    export_yup=True,
    export_apply=True,          # bake modifiers (bevel, array...) into the mesh
    export_cameras=False,
    export_lights=False,        # the page lights the scene; Blender watts don't translate
    export_animations=True,
)
meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH' and not o.hide_render]
tris = sum(len(p.vertices) - 2 for o in meshes for p in o.data.polygons)
mats = sorted({m.name for o in meshes for m in o.data.materials if m})
print("EXPORTED", out, "meshes=%d tris=%d materials=%s" % (len(meshes), tris, mats))
