import bpy

PALETTE = {
    'PJCC_Purple': (0.176, 0.106, 0.412, 1.0),  # #2D1B69
    'PJCC_Gold':   (0.961, 0.773, 0.094, 1.0),  # #F5C518
    'PJCC_White':  (0.95, 0.95, 0.95, 1.0),
    'PJCC_Black':  (0.08, 0.08, 0.08, 1.0),
    'PJCC_Wood':   (0.45, 0.30, 0.18, 1.0),
}

def make_material(name, rgba):
    mat = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    if bsdf:
        bsdf.inputs['Base Color'].default_value = rgba
        bsdf.inputs['Roughness'].default_value = 0.6
    return mat

for name, rgba in PALETTE.items():
    make_material(name, rgba)

print(f"Loaded {len(PALETTE)} PJCC materials.")