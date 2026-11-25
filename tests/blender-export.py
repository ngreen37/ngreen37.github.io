# Run by tests/gen-models.js inside headless Blender:  blender -b X.blend --python this -- out.glb [SMOOTH_ANGLE]
import bpy, sys, math

argv = sys.argv[sys.argv.index("--") + 1:]
out = argv[0]
# ⭐ HIS 11-24 (the size review): a row with `smooth: <degrees>` ships as the chess pieces do — shaded smooth, every edge
# sharper than that angle kept crisp, without texture coordinates, at most BUDGET triangles and never cut below half
# (BUDGET and FLOOR are the pieces' own; test:board3d holds them equal). ⚠ The angle is per model: at the pieces' 30
# his checker's sawtooth rim went soft; at 20 it stays crisp and the wall still rounds (rendered 11-24).
SMOOTH_ANGLE = float(argv[1]) if len(argv) > 1 else 0.0
SMOOTH = SMOOTH_ANGLE > 0.0
BUDGET = 6500
FLOOR = 0.5

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

if SMOOTH:
    _meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH' and not o.hide_render]

    def _count():
        n = 0
        dg = bpy.context.evaluated_depsgraph_get()
        for o in _meshes:
            m = o.evaluated_get(dg).to_mesh()
            m.calc_loop_triangles()
            n += len(m.loop_triangles)
            o.evaluated_get(dg).to_mesh_clear()
        return n

    _modeled = _count()
    _ratio = min(1.0, max(FLOOR, BUDGET / _modeled)) if _modeled else 1.0
    for o in _meshes:
        o.data.shade_smooth()
        o.data.set_sharp_from_angle(angle=math.radians(SMOOTH_ANGLE))
        if _ratio < 1.0:
            o.modifiers.new("Budget", 'DECIMATE').ratio = _ratio
            if any(md.type == 'ARMATURE' for md in o.modifiers):
                with bpy.context.temp_override(object=o, active_object=o):
                    bpy.ops.object.modifier_move_to_index(modifier="Budget", index=0)
    bpy.context.view_layer.update()
    print("SMOOTHED tris=%d of %d" % (_count(), _modeled))

bpy.ops.export_scene.gltf(
    filepath=out,
    export_format='GLB',
    export_yup=True,
    export_apply=True,          # bake modifiers (bevel, array...) into the mesh
    export_cameras=False,
    export_lights=False,        # the page lights the scene; Blender watts don't translate
    export_animations=True,
    export_texcoords=not SMOOTH,
)
meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH' and not o.hide_render]
tris = sum(len(p.vertices) - 2 for o in meshes for p in o.data.polygons)
mats = sorted({m.name for o in meshes for m in o.data.materials if m})
print("EXPORTED", out, "meshes=%d tris=%d materials=%s" % (len(meshes), tris, mats))
