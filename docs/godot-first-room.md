# Godot — Your First Room (Princess Dungeon → 3D)

*The game we decided on: the **Princess Dungeon vertical slice** — one beautiful, web-exported 3D
chess-crawler room, per Roadmap 3 in `docs/roadmaps.md` and the P0–P8 plan in `FUTURE-IDEAS.md`.
The web prototype at `/games/dungeon/` is the playable spec: the Godot build is the same game in 3D.*

**Why this serves the Academy and the Arcade at once:** the room's mechanics ARE the lesson —
every enemy moves by its true chess rules, so playing it is piece-movement practice (Academy),
and the finished room ships as a real arcade game wired to the `dungeon` leaderboard (Arcade).
Same accuracy rule as the website games: **port the move tables verbatim from the tested JS,
never re-derive them by eye.**

---

## 0 · One-time setup (15 minutes)

1. **Version:** use **Godot 4.x** (4.3 or newer), the **standard** build — *not* the .NET one.
   You'll write GDScript, which looks like Python.
2. **Create the project:** open Godot → **New Project** → name it `pjcc-dungeon`.
   - Put it **outside the website repo** (e.g. `Desktop\pjcc-dungeon`). Only the finished web
     export gets copied into the site later — keeps the repo clean and Pages builds fast.
   - **Renderer: choose "Compatibility."** This matters: it's the renderer that exports to
     the web cleanly. (Changeable later under Project Settings → Rendering, but pick it now.)
3. **Get comfortable for 20 minutes:** poke the editor. Scene dock (left) holds nodes; the
   Inspector (right) edits them; F5 runs the game; F6 runs the current scene.
   Skip the beginner tutorials — the room below *is* the tutorial.

---

## 1 · The gray-box room (P1) — "walk a capsule around a board in 3D"

This is the Month-1 milestone from the roadmap. Build one scene, paste one script, press F5.

**Scene:** click **3D Scene** in the empty-scene dialog (this makes a root `Node3D`; rename it
`Main`). Add children (right-click root → Add Child Node):

- `Camera3D` — in the Inspector set Position `(4, 9, 12)`, Rotation X `-45°`. Check "Current".
- `DirectionalLight3D` — Rotation X `-50°`, Y `-30°`. Turn on Shadows.
- `WorldEnvironment` — new Environment resource; set Background → Sky for a quick horizon.

Attach a script to `Main` (right-click → Attach Script) and replace it with this — it builds a
checkered 8×8 board, a capsule Princess, a gold "stairs" tile, and click-to-move **King steps**:

```gdscript
extends Node3D

const N := 8                       # board size — matches the prototype's grid
var princess: Node3D
var princess_cell := Vector2i(4, 7)
var stairs_cell := Vector2i(3, 0)
var moving := false

func _ready() -> void:
    _build_board()
    princess = _spawn_capsule(Color(0.79, 0.65, 1.0), princess_cell)   # violet = Princess
    var stairs := _tile_mesh(Color(0.96, 0.77, 0.09))                   # gold = the way down
    stairs.position = _world(stairs_cell) + Vector3(0, 0.06, 0)
    add_child(stairs)

func _build_board() -> void:
    for x in N:
        for z in N:
            var t := _tile_mesh(Color(0.93, 0.9, 0.82) if (x + z) % 2 == 0 else Color(0.36, 0.28, 0.5))
            t.position = _world(Vector2i(x, z))
            add_child(t)

func _tile_mesh(col: Color) -> MeshInstance3D:
    var m := MeshInstance3D.new()
    var box := BoxMesh.new(); box.size = Vector3(0.96, 0.1, 0.96)
    var mat := StandardMaterial3D.new(); mat.albedo_color = col
    box.material = mat; m.mesh = box
    return m

func _spawn_capsule(col: Color, cell: Vector2i) -> Node3D:
    var m := MeshInstance3D.new()
    m.mesh = CapsuleMesh.new()
    var mat := StandardMaterial3D.new(); mat.albedo_color = col
    m.mesh.material = mat
    m.position = _world(cell) + Vector3(0, 1.0, 0)
    add_child(m)
    return m

func _world(cell: Vector2i) -> Vector3:
    return Vector3(cell.x - N / 2.0 + 0.5, 0, cell.y - N / 2.0 + 0.5)

func _unhandled_input(event: InputEvent) -> void:
    if moving: return
    if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
        var cam := get_viewport().get_camera_3d()
        var from := cam.project_ray_origin(event.position)
        var dir := cam.project_ray_normal(event.position)
        if absf(dir.y) < 0.0001: return
        var hit := from + dir * (-from.y / dir.y)          # intersect the board plane (y = 0)
        var cell := Vector2i(roundi(hit.x + N / 2.0 - 0.5), roundi(hit.z + N / 2.0 - 0.5))
        if cell.x < 0 or cell.x >= N or cell.y < 0 or cell.y >= N: return
        _try_step(cell)

func _try_step(cell: Vector2i) -> void:
    var d := cell - princess_cell
    if d == Vector2i.ZERO or absi(d.x) > 1 or absi(d.y) > 1: return    # King moves only (P1)
    moving = true
    princess_cell = cell
    var tw := create_tween()
    tw.tween_property(princess, "position", _world(cell) + Vector3(0, 1.0, 0), 0.18)\
      .set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
    tw.tween_callback(func():
        moving = false
        if princess_cell == stairs_cell:
            print("▼ Stairs — floor cleared!")                          # your first win condition
    )
```

Press **F5** (pick `Main` as the main scene when asked). You should be clicking a capsule
around a checkered board and "clearing the floor" on the gold tile. **That's the milestone.**

---

## 2 · Where to go next, in order (don't skip ahead)

- **TurnManager (still P1):** after each Princess step, give the "enemies" a turn — even one
  red capsule that steps toward her. Player → enemies → player, like the prototype.
- **P3 — the real rules:** open `assets/games/pjcc_dungeon…` / `/games/dungeon/` in the site
  repo and port its movement/threat tables to GDScript **verbatim** (the knight's 8 offsets,
  the sliders' rays). One `referee.gd` with pure functions — same shape as the JS. This is the
  Academy tie-in: enemies that truly move like their pieces.
- **P6 EARLY — web export** (the roadmap says de-risk this by Month 4):
  1. Project → Export → Add… → **Web**. Install export templates when prompted (one download).
  2. In the export options **turn OFF "Thread Support."** GitHub Pages doesn't send the
     cross-origin-isolation headers that threaded WASM needs — the single-threaded build runs
     anywhere (same trick as our headerless Stockfish).
  3. Export to a folder, make sure the main file is named `index.html`, copy the folder into
     the site repo at `assets/games/godot-dungeon/`, and iframe it from a Jekyll page like
     every other game. Expect a chunky first download (~10 MB compressed engine) — fine for a
     destination game.
  4. Post scores through the wrapper page:
     ```gdscript
     if OS.has_feature("web"):
         JavaScriptBridge.eval("parent.PJCC && parent.PJCC.saveScore('dungeon', %d, {credits:1})" % score)
     ```
- **P2 — art:** only after it plays — swap capsules for the Blender Princess rig + two or
  three piece-enemies exported as `.glb` (File → Export → glTF 2.0 in Blender; drag into Godot).
- **Then P4/P5/P7/P8** (relics → floors → juice → ship), per `FUTURE-IDEAS.md`.

**Anti-overscope guardrail (from the plan):** P0–P3 are the real risk. Get **one beautiful
web-exported room** live before floors, relics, or bosses. Bug-fixes only on the website in
the meantime.
