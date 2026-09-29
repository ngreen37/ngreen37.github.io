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

# ⛑⛑ A STASHED STRIP WITH NO ACTION SLOT TAKES DOWN THE WHOLE EXPORT (2026-09-29, Nate_1.5).
# Blender 5 gives every action SLOTS; his `_TPose` has none, so an NLA strip holding it has
# `action_slot = None`, and io_scene_gltf2 reads `strip.action_slot.target_id_type` without
# checking. ONE stashed pose on the MESH killed a model carrying five good clips, and the
# error named a line inside Blender rather than anything he did.
# ⚠ NOTHING IS LOST: a strip the exporter cannot read is a strip that was never going to ship.
# ⚠⚠ DROPPED HERE, NOT IN HIS FILE. He stashes and cannot delete actions ("I couldn't figure
# out how to delete actions" — 2026-09-21); the pipeline absorbs that, or every future save is
# a support call. -b never writes the .blend back.
dropped = []
for _ob in bpy.data.objects:
    _ad = _ob.animation_data
    if _ad is None:
        continue
    for _tr in list(_ad.nla_tracks):
        for _st in list(_tr.strips):
            if getattr(_st, "action_slot", None) is None:
                dropped.append("%s/%s" % (_ob.name, _st.name))
                _tr.strips.remove(_st)
        if not _tr.strips:
            _ad.nla_tracks.remove(_tr)
if dropped:
    print("DROPPED-STRIPS", ", ".join(dropped))

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
