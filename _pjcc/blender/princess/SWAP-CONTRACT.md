# Princess Swap-Ready Contract

## Master file location
`C:\Users\Nate\Desktop\PJCC\assets\characters\Princess.blend`

DO NOT MOVE OR RENAME THIS FILE. Scene files reference this exact path.

## Bone names (required for v02 compatibility)

Spine chain:
- root, spine.001, spine.002, spine.003, spine.004, neck, head

Tail chain:
- tail.001, tail.002, tail.003, tail.004

Front legs:
- front_thigh.L/R, upper_front_leg.L/R, lower_front_leg.L/R

Back legs:
- rear_thigh.L/R, upper_back_leg.L/R, lower_back_leg.L/R

## Swap procedure for v02

1. Open Princess.blend master
2. Rebuild or import new mesh (body, head, tail) 
3. Keep armature exactly as-is, do not rename bones
4. Delete old mesh objects
5. Parent new mesh to existing armature with Automatic Weights
6. Test pose to verify deformation
7. Save Princess.blend
8. Every scene file that links Princess updates automatically

## What must stay the same
- File path
- Bone names
- Collection name (Princess)

## What can change
- Mesh geometry
- Materials
- Weight paint
- Mesh topology