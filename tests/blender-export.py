# Run by tests/gen-models.js inside headless Blender:  blender -b X.blend --python this -- out.glb
import bpy, sys

out = sys.argv[sys.argv.index("--") + 1]
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
