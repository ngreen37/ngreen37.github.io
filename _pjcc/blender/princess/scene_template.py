import bpy

# Clear default scene
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

scene = bpy.context.scene

# Render settings — Eevee, 1080p, 24fps, PNG, Standard view transform
scene.render.engine = 'BLENDER_EEVEE_NEXT'  # use 'BLENDER_EEVEE' if on 4.1 or older
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.fps = 24
scene.render.image_settings.file_format = 'PNG'
scene.view_settings.view_transform = 'Standard'

# Standard collections
for name in ['CHARACTERS', 'ENVIRONMENT', 'LIGHTS', 'CAMERA']:
    if name not in bpy.data.collections:
        col = bpy.data.collections.new(name)
        scene.collection.children.link(col)

def move_to(obj, collection_name):
    for c in obj.users_collection:
        c.objects.unlink(obj)
    bpy.data.collections[collection_name].objects.link(obj)

# Key light — warm sun
bpy.ops.object.light_add(type='SUN', location=(5, -5, 10))
sun = bpy.context.object
sun.data.energy = 3.0
sun.data.color = (1.0, 0.95, 0.85)
move_to(sun, 'LIGHTS')

# Fill — cool area
bpy.ops.object.light_add(type='AREA', location=(-5, -3, 5))
fill = bpy.context.object
fill.data.energy = 100
fill.data.size = 5
fill.data.color = (0.8, 0.9, 1.0)
move_to(fill, 'LIGHTS')

# Rim
bpy.ops.object.light_add(type='AREA', location=(0, 5, 3))
rim = bpy.context.object
rim.data.energy = 150
rim.data.size = 2
move_to(rim, 'LIGHTS')

# Camera
bpy.ops.object.camera_add(location=(7, -7, 5), rotation=(1.1, 0, 0.785))
cam = bpy.context.object
scene.camera = cam
move_to(cam, 'CAMERA')

print("PJCC scene template ready.")