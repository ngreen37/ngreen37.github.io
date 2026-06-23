# PJCC — Future Ideas

The open backlog. Done work is cleared out of the lists below — see **Already live** for the
guardrail of what's shipped (so we don't re-pitch it). Everything else here is a path not yet taken.

**Operating principle (2026-06-22): *less is more.*** We deliberately built "too much," and we're now
paring the site to its most important, inviting elements — combining pages, cutting clutter. New ideas
must earn their place against that bar; prefer **depth and combination** over new surface area.

---

## ★ The direction (north star)

**Right now, PJCC's product is the show *getting made*.** The animation is years out; the move is to
ship the *story* in every cheaper form first, build an audience that owns itself, and make people
fall for the world before a single frame renders. Five threads, braided:

1. **Ship the show early** — production-as-content (the Pilot animatic, the tracker, the Writers'
   Room) + an audio drama. The story arrives long before the animation can.
2. **Own the audience** — the dispatch (newsletter) and the Press Pass are durable, un-algorithmed
   channels. Founders fund the pilot.
3. **Make them love her** — Princess as a companion is the emotional hook; the bond pays off the day
   she gets a voice.
4. **The arcade is the funnel** — a deep, polished chess arcade that pulls players into the Academy,
   the business most likely to *fund the animation*.
5. **One mystery over all of it** — the spy/ARG meta-layer (Subject Zero, the crash, the
   Construction Co.) ties the games, the lore, and the show into a single self-marketing puzzle.

The long game is the **Godot roguelite** built from the Blender assets. The trap to avoid is
*shipping more games for their own sake* — the per-game ideas below are for **depth, retention, and
funnel**, not sprawl. New surface area should serve one of the five threads.

---

## ♚ Headline shipped — *The Gauntlet* (chess-game ladder)

**Live at [`/games/the-gauntlet/`](/games/the-gauntlet/).** Climb a ladder of PJCC opponents by
playing **real, whole games of chess** (Checker-Town Recruit → Argus → the City Gatekeeper → the
Rival → the CEO) on a shared, **perft-verified** engine (`pjcc-chess.js`) with a tunable negamax AI
(`pjcc-chess-ai.js`) — one personality per rung. You alternate colours and play strict (no takebacks,
no hints). Design doc: [`docs/chess-ladder-design.md`](docs/chess-ladder-design.md).
**Next (unbuilt):** opening books for the Rival/CEO, a daily gauntlet, a captured-tray + move list,
more rungs (the secret King).

---

## ✅ Already live (guardrail — don't re-pitch)
Arcade: Notation Blitz, Blindfold Puzzles / The Mind's Eye, Clearance: DELTA, Princess Dungeon,
Checker Financial, Fork in the Road, The Pirc Protocol, Sand Mine Depths, Shogi Island (Catch the
Lion), Sky Run, Space Run, Knight's Tour, Siege on Chess City, The Gauntlet, The Reading Room — each with daily seeds, global
boards, ghosts, streak flame, board-skins + JP-localization scaffolding. World/site: Lore Codex,
Academy, Projects, Daily Dispatch, Hall of Fame, leaderboard seasons. Avenue pieces: production hub
+ Pilot animatic + Writers' Room (1), audio hub + leitmotifs (5), site-wide Princess companion (6),
Press Pass + Press Credential + Bureau-of-Dispatch newsletter + Press Kit/EPK + support-transparency +
referral invite links + Founders Wall + founder-cosmetic preview + pricing poll + backer-dispatch
preview + share-card generator + `/educators/` B2B page + game-page dispatch capture (10).

**Declutter pass (2026-06-22):** the site was pared to essentials — games page rebuilt as a featured
Gauntlet + Learn / Arcade / In-Development **pillars** (Gauntlet-Legends style); the weekly game is a
small chip; leaderboards un-embedded (own page, linked from a Games CTA + a floating homepage icon);
**cursor sheen discarded**; **Princess walker silenced** (movement only, never speaks); nav combined
(**Characters & Locations** hub, **The Pilot ⊃ Writers' Room**, **Command Center merged into the
Dossier**); homepage **Story Arc removed** (now decode-as-you-play); the personal "Creator" bio
replaced with a mysterious-but-contactable **"Operator."**

> **What's the "Lore Codex"?** (`/lore-codex/`) The site's in-world **encyclopedia** — a collectible
> set of canon (and *classified*) entries about the characters, places, and mysteries of PJCC. Entries
> start **sealed** and **unseal as you explore**: reading a character or location page reveals its
> entry, and recovering hidden `frag_` fragments (from easter eggs across the site) cracks the
> classified ones. Collect all six core fragments and the **origin story** unlocks. It's the reward
> layer that turns "browsing the site" into "uncovering the world."

---

# 🕹️ The Arcade — ten ideas per game

*Polish and retention, not new games. Each line is one buildable move.*

## Notation Blitz — *coordinate/notation rhythm*
1. **Score Mode** — chart the real PJCC themes as the beatmap (the Avenue-5 unlock).

3. **Diagonal & file lanes** — "what sits on the long diagonal from c1?" as its own mode.
4. **Coordinate duel** — the Rival trades calls with you and speeds up every time you miss.
5. **Blind grid** — the board fades out mid-run; finish from memory (a bridge to Blindfold).

7. **Combo leitmotif** — a sustained streak layers a character's theme in live.

9. **Landmark ladder** — escalating BPM tiers, each named for a Checker-Town location.


## Blindfold Puzzles / The Mind's Eye — *no-board visualization*
1. **Rebuild-the-board** — after N moves, place the pieces back where they belong.
2. **Piece-count ladder** — start at 2 pieces, climb toward a full position.
3. **Voice-input mode** — speak your move (Web Speech API); fully eyes-free.
4. **Phantom-blunder review** — flags the exact move your mental board diverged.

6. **Walk-the-knight audio drills** — eyes closed, follow spoken hops, name the landing square.
7. **PGN import** — paste a real game and train visualization on a masterpiece or one of their games.

9. **Relic boards** — cosmetic boards unlocked only by blindfold wins.
10. **"Solved it blind" card** — a shareable flex of the position + your solve.

## Clearance: DELTA — *dossier trivia under the clock*
1. **Redacted-dossier meta** — correct answers progressively unredact a classified file.
2. **Sudden-death OMEGA** — one life, escalating clearance, for superfans.
3. **Audio-intercept questions** — answer from a garbled transmission (Avenue 5 audio tie).
4. **Wager mode** — bet credits on your confidence per question.
5. **Daily briefing** — one seeded quiz a day, global accuracy board.
6. **Three lanes** — chess rules vs PJCC lore vs real chess history.
7. **Spot the lie** — three "facts," one is planted disinformation (ARG flavor).
8. **Question forge** — operatives submit Qs, curated into the deck (Avenue 7).
9. **Clearance rewards** — ranks gate secret lore pages (Avenue 2 payoff).
10. **Speed-vs-accuracy dial** — choose your scoring style each run.

## Princess Dungeon — *roguelite crawler (2D shipped → Godot next)*
1. **Room grammar that mirrors Godot** — design here, port the patterns to the 3D build.
2. **Chess-piece enemies** — each moves by its piece's rules; every room is a tactic in disguise.
3. **Move-set relics** — items that grant a bishop dash, a knight blink, a pawn-storm.
4. **Boss = a mate-in-N** — beat the room by solving the problem, not just surviving.
5. **Biome floors** — Checker Town → the Sea → Shogi Isle → Chess City.
6. **Bill's toolbox** — consumables themed on Bill's own gadgets (yes, the Hyperspeed Box).
7. **Daily seeded dungeon** — same floor for everyone, global depth board.
8. **Pacifist route** — clear by puzzle, not combat, for a different reward.
9. **Escort pawns** — summon-and-protect (reuse Sky Run's king-summon mechanic).
10. **Risk altars** — take a curse for loot; the deepest hide ARG fragments.

> **The rules are already proven.** The web prototype at `/games/dungeon/`
> (`assets/games/pjcc_princess_dungeon.html`) is the playable spec: grid rooms, chess-piece enemies
> that move by their own rules, the red "threatened-square" telegraph, stacking move-relics
> (Bishop Dash / Rook Rush / Knight's Blink), biome floors (Checker Town → Sea → Shogi Isle →
> Chess City), and hearts. The Godot build is the **same game in 3D** — reuse the logic, add the spectacle.

## 🎮 Godot project — step-by-step build plan
*Goal: turn the 2D prototype into a 3D Binding-of-Isaac-style crawler from the Blender assets, then
export ONE room to the web and embed it on the Games page wired to the same profile/leaderboard —
then grow it. Engine: **Godot 4.x** (free, open-source). Assets: **Blender**. Don't build all of this
at once; each phase ends in something runnable.*

**Plain-language terms:** a *scene* = a reusable game object saved to a file (a room, an enemy, the
HUD). A *node* = one part of a scene (a mesh, a light, a script). *GridMap* = Godot's tool for
snapping 3D tiles to a grid — perfect for a chessboard floor. *glTF (`.glb`)* = the file format you
export from Blender and import into Godot. *Tween* = a short animation between two states (a piece
sliding one square). *HTML5/Web export* = Godot packaging the game to run in a browser, like the
other games here.

### Phase 0 — Setup & pipeline (prove the toolchain end-to-end)
- Install **Godot 4.x** (the standard build; you don't need C#/.NET — use GDScript).
- Make a new project; put it in its **own git repo** (separate from this site repo).
- In Blender, export a single test asset (even a cube) to **`.glb`**, import it into Godot, confirm it
  shows in a 3D scene. **Done when:** a Blender object renders in a running Godot window.
- Decide the grid: reuse the prototype's model — an **N×N board** (start 7×7), one piece per tile,
  rows numbered from the far side (so the math matches `pjcc_princess_dungeon.html`).

### Phase 1 — One room, grey-box (the core loop, no art yet)
- Build a `Room` scene: a flat **GridMap** (or just tiled `MeshInstance3D` plates) for the board, a
  fixed top-down/3-4 angled camera, and a `Stairs` marker tile.
- Build a `Hero` scene (a capsule for now) that moves **one tile per turn** (King step). Click/tap a
  tile to move; tween the slide over ~0.15s — mirror the prototype's feel.
- Add a **TurnManager**: player acts → enemies act → redraw. **Done when:** you can walk a capsule
  around the board, one square at a time, and step onto the Stairs to "win" the room (print to console).

### Phase 2 — Bring in the Blender assets (the look)
- Model/rig in Blender: **Princess**, and the chess-piece enemies (pawn/knight/bishop/rook/queen/king).
  Keep them low-ish poly; export each as its own `.glb`.
- Swap the grey-box hero/enemies for the real meshes. Add a simple **idle + a "hop/attack" animation**
  per piece (even a squash-stretch is enough to read).
- Theme the board material per biome. **Done when:** the room looks like PJCC, not a prototype.

### Phase 3 — Enemies as chess pieces (port the proven rules)
- Port the prototype's movement/attack logic to GDScript **directly** — it's already written and
  unit-tested: pawn diagonals, knight L, slider rays that stop at the first blocker, King step.
- Re-create the **threat telegraph**: highlight (glow/decal) every square an enemy attacks, so the
  player reads danger before moving — this is the whole game's tactical hook.
- Enemy AI: capture the hero if able, else step to the square nearest the hero (same as the prototype).
- Add **hearts**, capture-to-defeat, and "hit → reset the room, lose a heart." **Done when:** a room
  full of pieces plays exactly like the 2D version, in 3D.

### Phase 4 — Relics & the run (the roguelite layer)
- Add **move-set relics** that modify the hero's reachable set: Bishop Dash (+1 diagonal range), Rook
  Rush (+1 straight range), Knight's Blink (gain the leap), Stone Skin (+1 heart). They **stack**.
- Between rooms, show a **3-relic choice** screen. Track run state (depth, hearts, essence, relics).
- **Done when:** clearing a room offers a relic and the hero visibly gains new moves.

### Phase 5 — Floors & biomes (procedural depth)
- Procedurally place enemies per floor with a **seed** (so a Daily Dungeon is possible later). Scale
  count/piece-mix with depth, exactly like `enemyPoolFor()` in the prototype.
- **Biome floors:** Checker Town → The Sea → Shogi Isle → Chess City (swap board material + enemy mix
  + ambient). Every 5th floor = a **boss room** (a Queen + escorts), themed as "solve the position."
- **Done when:** you can descend floor after floor with rising difficulty and changing scenery.

### Phase 6 — Web export + wire it into the site
- Use Godot's **Web (HTML5)** export preset; produce the `.wasm`/`.js`/`.pck` bundle.
- Drop the bundle under `assets/games/godot-dungeon/` and point a Jekyll wrapper at it (mirror
  `games/dungeon/index.html`). Keep the 2D version live too, or replace the embed once the 3D is better.
- **Profile/leaderboard:** from inside the Godot web build, call out to the page's `PJCC.saveScore('dungeon', floors, {...})`
  via JavaScriptBridge so 3D runs post to the **same** board as the 2D prototype. **Done when:** a 3D
  run shows up on `/leaderboards/` under Princess Dungeon.

### Phase 7 — Juice & cutscenes (make it pop)
- Camera shake on capture, particle "dust" on moves, a satisfying stairs-descend transition, sound.
- **Blender cutscene intro** (the saved favorite): a short rendered clip as the title/loading screen —
  Princess entering the dungeon. Play it on first load. *(See the Blender-intros idea above.)*
- **Done when:** the game *feels* like a finished arcade title, not a tech demo.

### Phase 8 — Ship v1
- Tune difficulty against the prototype's leaderboard ghost (Nate's mark). Add a win screen for
  reaching Chess City. Announce it on the dispatch with a Blender trailer.

**Sequencing advice (anti-overscope):** Phases 0-3 are the real risk — if a 3D room plays like the 2D
prototype, the rest is content. Get **one beautiful, web-exported room** live before building floors,
relics, or bosses. That single embedded room is the milestone that makes the whole bet real.

## Checker Financial — *call the market*
1. **The piece exchange** — trade Checker Town's checker-piece economy, in-lore.
2. **News-driven swings** — the world-ticker headlines actually move the chart.
3. **Portfolio mode** — hold positions across a multi-day seeded market.
4. **Insider whispers** — risky tips from shady NPCs (sometimes disinformation — ARG tie).
5. **Leverage round** — high risk, high credit payout, for nerve.
6. **Short the crash** — a scenario built on the origin's "crash" lore.
7. **Candlestick coach** — teaches real chart-reading as you play.
8. **Daily ticker** — one seeded market, global P&L board.
9. **Bank it** — spend gains on cosmetics/boosts (Quartermaster tie).
10. **The CEO's ledger** — an endgame market the villain is rigging against you.

## Fork in the Road — *tactics puzzles*
1. **Endless one-life gauntlet** — climb the regions until you miss.
2. **Show-the-refutation coach** — after a miss, it plays out exactly why.
3. **Theme drills** — fork / pin / skewer / discovered-attack as separate lanes.
4. **Blitz tactics** — a shrinking clock and a combo multiplier.
5. **Boss-gate taunts** — each region boss is a named character with a line.
6. **Mistake replay** — your three worst misses, re-served next session (spaced repetition).
7. **Race the creator ghost** — puzzle-rush against the existing ghost system.
8. **Construct-the-fork** — given a goal, place the piece that forks.
9. **Daily tactic + streak flame** — one curated puzzle, global solve-time board.
10. **Reads-you difficulty** — auto-tunes from your accuracy (Academy bridge).

## The Pirc Protocol — *openings trainer*
*Shipped (2026-06-22): more decks (Ruy López, Sicilian, Queen's Gambit, Caro-Kann — now 8 decks /
18 lines), a 🌳 Transposition Tree, and a 🔎 Name-That-Opening quiz. Remaining:*
4. **Opponent personalities** — aggressive/positional bots that punish wrong moves.
5. **Weekly model game** — a real master Pirc, annotated in Argus's voice.
6. **Side-switcher** — drill the same system from both colours.
7. **Trap of the week** — a famous opening trap as a one-move puzzle.
8. **Repertoire builder** — assemble and export/share your own deck (UGC).
9. **"Out of book" alarm** — flags the precise move you left theory.
10. **Boss: the Rival's prep** — he's studied your deck; deviate or get punished.

## Sand Mine Depths — *roguelike descent*
*Status: already the deepest-built game — **#7 banked-gold prestige** (Surface Camp + perks), **#8 rival miner** (Subject Zero, the digging knight), and **#9 a seeded global board** (the Weekly Race) all already exist. Shipped this pass: **#10 Hidden chamber → fragment** — reaching **180m** now buries a real Lore-Codex fragment (`frag_subjectzero`, one-time, counts on the site-wide fragment tally; not in the free-run `race` mode). Feasible-next: relic **sets** (#4), cave-in chains (#2), Auston-camp one-run consumables (#3), explicit biome shifts (#6), light beacons/minimap (#1).*
1. **Light beacons + fog-of-war minimap** — drop light to map the dark.
2. **Cave-in chains** — escape a timed collapse; a tension spike.
3. **Auston-camp consumables** — one-run gear from the bomber's stash.
4. **Relic sets** — collect a set for a run-defining bonus.
5. **Knight-only rooms** — pure Warnsdorff traversal puzzles.
6. **The deeper, the stranger** — obsidian-vs-violet biome shifts as you fall.
7. **Banked-gold prestige** — permanent upgrades that change the descent.
8. **A rival miner** — an NPC racing you to the same vein.
9. **Daily shaft** — global "deepest dive" board.
10. **Hidden chamber → fragment** — the mine literally buries lore.

## Shogi Island / Catch the Lion — *3×4 shogi*
*Deferred this pass (stay-within-means): Shogi Island is already the most complex game — full 9×9 rules, a tsume solver, capture/check/mate problem generation, and an AI. These are the next layer, each a sizeable, careful add on top of that engine — left here on purpose rather than risk destabilizing it.*
1. **Scaling handicaps vs the Lion AI** — a difficulty ladder.
2. **Piece-reach trainer** — highlight what each shogi piece threatens.
3. **Tsume-of-the-day** — a daily mate-in-N, global solve board.
4. **Drop-rule drills** — teach captured-piece drops, shogi's signature move.
5. **Calligraphy wall** — learn the kanji on each piece (JP-localization tie).
6. **Castle drills** — build defensive shapes against the clock.
7. **9×9 stepping-stone** — graduate from 3×4 toward real shogi.
8. **The Lion's moods** — personalities named for island characters.
9. **Codex bridge** — shogi mastery unlocks a Lore Codex island entry.
10. **Island duel** — local hot-seat with drops.

## Sky Run — *vertical shmup*
*Shipped: **#10 Animatic interstitials** (2-panel story beat on each region clear); **#4 Daily seeded sky** (a 📅 Daily Run button — same enemy script for everyone today, its own best + `sky-run-daily` board). Also: the **Queen power-up now fires all eight directions** (rook + bishop lines, piercing — it supersedes the Bishop X-shot while active), and a stray-bullet leak off the bottom was fixed. Also shipped: **#3 Endless "Sea" mode** (a 🌊 button — one life, regions loop with escalating enemy hp/speed each lap, its own `sky-run-endless` best/board) and **#7 Photo-mode end-card** (a 📷 CARD button on the result screen downloads a shareable PNG of your run). Feasible-next within means: Loadout select (#6), new power-ups (#2). Too far for now: Co-pilot (#5, 2-player input) and the rhythm tie-in (#8, needs the real score).*
1. **Lore bosses** — every region's king with a patterned fight (CEO finale exists).
2. **New power-ups** — Rook (laning wall), pawn-storm, an en-passant dash.
3. **Endless "Sea" mode** — one life, escalating, global distance board.
4. **Daily seeded sky** — identical enemy script for everyone.
5. **Co-pilot** — a second ship for couch co-op.
6. **Loadout select** — pick a starting power triad before launch.
7. **Photo-mode end-card** — a shareable finish with run stats.

9. **Boss rush** — all kings back-to-back, for veterans.
10. **Animatic interstitials** — a 2-panel story beat between regions (Avenue 1 tie).

## Space Run — *the Chess City Invitational runner*
*Shipped this pass: **#10 Crash-site flyby** — the origin wreck now drifts past the horizon periodically with a lore caption; **also** the high score now persists to localStorage (it was lost on reload). Note: Space Run is the one arcade game **not yet wired to PJCC** (no config/profile include), so the Daily/global-board items (#1 qualifier, #5 daily track) need that wiring first; #2/#4/#6 (collect-a-set, rival racers, tactic shortcuts) are larger mechanics; #7/#8 (cosmetic ships, speed-tier music) need the cosmetics/audio layers.*
1. **Qualifier framing** — beating it earns a tournament seed in the meta.
2. **Collect-a-set pieces** — pick up chess pieces to upgrade the ship.
3. **Legality dodging** — move only into squares your piece could legally reach.
4. **Rival racers** — the cast runs beside you, rubber-banding.
5. **Daily track** — seeded route, global board.
6. **Tactic shortcuts** — branching paths gated by a quick puzzle.
7. **Quartermaster ships** — cosmetic vessels.
8. **Speed-tier soundtrack** — the music ramps with your velocity.
9. **Near-miss style combo** — points for grazing obstacles.
10. **Crash-site flyby** — pass the origin wreck for a lore beat.

## Knight's Tour — *the tour puzzle*
*Rebuilt big (2026-06-22, [`/games/knights-tour/`](/games/knights-tour/)). **Shipped:** Warnsdorff
coach, tour scoring + speed bonus, closed-tour bonus/challenge, variable boards (5×5–8×8), seeded
daily, free **solver-verified** start, undo + auto-finish, and the "you're not stuck, you're
mis-routed" teaching frame. **Remaining:***
1. **Rubble squares** — blocked cells force re-routing (Sand Mine flavor).
2. **Constellation trail** — your completed path draws a star map (ties to `/constellation/`).
3. **Undo-budget mode** — only N takebacks, for pressure.
4. **Two-knight co-op** — cover the board together without colliding.
5. **Academy teach-mode** — a lesson built on the tour (the knight reaches *every* square — it just needs re-directing).
6. **Tactical knight puzzles** — a forcing-moves mode beyond the pure tour: fork drills & multi-knight sacs to FORCE a queen/rook fork or smothered mate. ⚠ Each strictly forcing, single provable solution.

## Siege on Chess City — *tower defense*
> **Design guardrail — don't be Bloons TD.** The path-and-towers skeleton is familiar on purpose, but
> the differentiation has to be **chess**, not just a reskin: towers move/threaten by **piece rules**
> (a Knight only hits its L-squares, a Bishop only its diagonals), placement is a **positional**
> puzzle (lines of fire, forks, pins on the lane), and the fantasy is *defending Chess City*, not
> popping balloons. If a feature would feel identical with monkeys and darts, rethink it.

*Shipped this pass: the **full #3 synergy matrix** — every adjacent piece-pair is now a named chess
relationship with a real effect, never a generic aura: **Pawn Chain** (P+P), **Knights' Fork** (N+N),
**Bishop Pair** (B+B), **Battery** (R+R, rook-behind-rook), **Outpost** (P+N), **Fianchetto** (P+B),
**Open File** (P+R), **Promotion** (P+Q — the pawn gains splash + 60% dmg), **Minor Duet** (N+B),
**Arabian Mate** (N+R, +60% vs boss Kings), **Cavalry Charge** (N+Q haste), **Skewer** (B+R pierce),
**Pin** (B+Q — slows and suppresses the Queen blink), and **Heavy Battery** (R+Q). Auras stack and
the inspector lists each active bond; it's data-driven (a `RELS` table) so new pieces slot in cleanly.
Already in the game: the **Rook spiked-ball Trebuchet** + **progressive tower unlock**, **#4 boss
waves** (the CEO King), **#5 endless survival** + board, and **#6 daily mutator roulette**. Deferred
(big): **#1** branching campaign + between-battle dialogue (a flat map campaign exists), and **#2** the
map editor (Avenue 7).*

1. **Campaign map** — branching routes + between-battle dialogue.
2. **Map editor** — build paths, share by code (Avenue 7).
3. ~~**Full synergy matrix**~~ — ✅ shipped (see above): a named chess bond for every piece pairing.
4. **Boss waves** — the CEO's machines as siege bosses.
5. **Endless survival** — global wave board.
6. **Bigger mutator pool** — expand the existing Daily roulette.
7. **Hero ability** — an active Princess power you aim, on cooldown.
8. **Economy gambles** — trade income for power; a real risk curve.
9. **Co-op gate** — two players, two lanes, one wall.
10. **Win → Codex** — campaign victories unlock lore entries.

---

# 🛣️ The Ten Avenues — ten ideas per lane

## Avenue 1 — Production as content *(animatic + Writers' Room live)*
1. **Real board scans** dropped into the animatic's `art` field.
2. **Shared Frame-the-Scene tally** — community art-direction, for real.
3. **Auto-changelog** from the tracker bars ("what moved this week").
4. **Threaded per-shot comments** → fold the best notes into the boards.
5. **Render-queue status** — a public "what's animating right now."
6. **Two-cut compare slider** on a shot (A/B the staging).
7. **Scratch-VO upload** — operatives record a line for a shot.
8. **Living episode pages** that grow animatic → leica → final.
9. **A credits wall** that visibly fills as people contribute.
10. **Embeddable animatic player** for socials.

## Avenue 2 — The season-long ARG *(scaffolding ~80% built)*
*An ARG = an "alternate reality game": a mystery that treats the real world (the site, emails, even
physical objects) as part of the story, and that players solve **together** over time.*
1. **Weekly cipher chain** — a new coded message posts each week; solving it gives a chess coordinate (like `e4`). A *chain* because each week's answer feeds the next, so the audience returns weekly.
2. **Coordinates assemble a map** — collect those weekly coordinates and they plot points that, together, reveal the location of a hidden page on the site. The season-long reward for keeping up.
3. **Collective fragment** — a clue that's impossible alone: it only unlocks once **N different visitors** have each contributed a piece, forcing the community to cooperate (and to recruit others).
4. **Narrator voicemail** — a real phone number (or audio clip) you can "call" to hear the Narrator leave an in-character message — breaks the fourth wall and makes the world feel physically real.
5. **Subject Zero countdowns** — a visible timer that, when it hits zero, reveals a new scene or chapter — turning a story drop into a live, appointment "event."
6. **In-universe clearance rank** — your real progress earns a "clearance level" (DELTA → OMEGA) that gates secret pages, so deeper fans literally see more of the story.
7. **Printable invisible-ink dossier + QR stickers** — physical artifacts: a dossier you print and reveal, stickers with QR codes that link to hidden lore — the ARG leaking into the real world.
8. **Cross-game keys** — a code earned in one game unlocks a secret in another, rewarding players who explore the whole arcade rather than one title.
9. **Weekly field report** — a recurring post structured to be picked apart on a Discord/subreddit — gives the community a regular thing to theorize about (the engine that markets the show for you).
10. **The crash-site coordinate** — the season-one payoff: all the cipher work converges on the exact spot where Princess fell from the sky, tying the whole mystery back to the origin.

## Avenue 3 — The Academy *(all ten shipped in-site/offline — 2026-06-21)*
1. ✅ **Real-play bridge** — *in-site*: lessons link to their matching game **plus** a free-move **Sandbox Board** on the Academy (no external Lichess — we're sandboxing). A rules-enforcing board/engine is the future upgrade.
2. ✅ **Strategy track** (The Father · Siege / Knight's Tour / Sky Run / Financial) + **Shogi track** (Oskar · Shogi Island).
3. ✅ **Printable worksheet packet** — 3 pages (coordinates · piece moves · first tactics).
4. ✅ **Branching skill-tree** — tiers with prereq locks/unlocks, rendered from progress.
5. ✅ **Placement exam** — a 6-question diagnostic → an assigned starting track.
6. ✅ **Teacher dashboard** — class-code tool + progress **export/import (.json)** + copy-summary.
7. ✅ **Verifiable certificate codes** — deterministic `CTA-…` codes on the cert, verified client-side (tamper-evident checksum) by a paste-box. *(Offline/self-contained, not a registry.)*
8. ✅ **Character-voiced intros** — a ▶ on each course plays the faculty leitmotif + reads the blurb via browser TTS (no recorded VO).
9. ✅ **Daily homework** — a date-seeded task with its own streak flame.
10. ✅ **School-pilot kit** — a printable 6-week **Curriculum** + local **class codes**.

*Backend upgrades when accounts land: shared class rosters/dashboards, a server-verifiable cert registry, a rules-enforcing practice board.*

## Avenue 4 — Physical / tabletop
*Turning the digital world into things people can hold — merch and tabletop that can fund the show.*
1. **Print-and-play Siege PDF** — a downloadable, printable board-game version of Siege. "Print-and-play" = the player prints and assembles it themselves, so there's **zero manufacturing cost** to test the idea.
2. **POD pins/stickers mockup page** — a store-style page showing pin/sticker designs ("POD" = print-on-demand, made only when ordered, so no inventory). It exists mainly to **measure demand** before committing money.
3. **The PJCC chess set** — a real chess set in the show's "obsidian vs. violet" Sand-Mine look — the most natural, premium piece of merch (likely a Kickstarter item).
4. **Sand Mine Depths as a dice/card PnP** — the roguelike mine game adapted into a print-and-play **dice-and-card** tabletop game (captures the descent + luck without a computer).
5. **Operative Field Kit** — a physical spy kit: a working **cipher wheel** and a **decoder card** — ties directly into the Avenue-2 ARG (use the real wheel to solve a clue).
6. **Checker Town Field Guide** — a printed **art book** of the world bible; doubles as a polished thing to hand a festival or a potential partner (a "leave-behind").
7. **Rank pins** — earn a clearance rank by playing online, then **buy the matching enamel pin** — connects digital achievement to physical reward.
8. **"Build your dossier" printable** — a print-it-yourself operative dossier kids/fans fill in — cheap, shareable, and on-brand.
9. **Founders sticker pack** — a small physical thank-you mailed to Press-Pass founders — makes the support feel tangible.
10. **Catch the Lion mini travel set** — a tiny physical version of the 3×4 shogi game from Shogi Island — a cute, cheap, giftable product (now Crockett's signature game).

## Avenue 5 — Audio *(hub + leitmotifs live)*
1. **First theme** → EP player + Notation Score Mode.
2. **A 5-minute audio-drama scene** — the cheapest pilot test.
3. **Per-game SFX toggle** + one unified sound palette.
4. **Leitmotif duets** — two themes interleave on shared pages.
5. **Checker Town ambience** — a focus/sleep loop.
6. **The casting call** (the booth, when it opens).
7. **Soundtrack on streaming** once themes exist.
8. **Reactive music** that shifts with game state.
9. **"Hum the theme"** call-and-response toy.
10. **A podcast feed** for the audio drama.

## Avenue 6 — Princess companion *(site-wide companion live)*
*Deepening Princess from a mascot into a character who **knows you** — cheap stickiness that makes
people return to see *her*.*
1. **React to live game results** — the moment you set a new best in a game, the companion reacts immediately ("you did it!") instead of staying generic — makes her feel aware of what you actually do.
2. **Seasonal outfits + holiday lines** — she visibly changes for winter/holidays and says season-appropriate things — small touches that make the site feel alive and worth revisiting.
3. **Persistent chattiness/mute setting** — a real preference (saved across visits) for how talkative she is, so fans can tune her — currently the "shush" only lasts a session.
4. **"Walk you to" page suggestions** — based on where you are and what you've done, she suggests (and links) the next worthwhile page — a friendly guide, not a menu.
5. **A mood/needs system** — lightweight stats (she wants play / walks / attention) that shift her mood — a tiny tamagotchi loop that rewards coming back.
6. **She learns your codename** — once you've signed in, she greets you by your operative name — personal, and a reason to make an account.
7. **A fetch micro-interaction** — toss a chess piece and she fetches it — a 5-second delight with no goal beyond charm.
8. **Milestone gifts she "brings" you** — hit a milestone and she trots over with a cosmetic reward — ties the bond to the cosmetics system.
9. **A second companion** — unlock another pet/character to accompany you later, so the relationship layer keeps growing.
10. **Her voice** — the ultimate payoff: the day the animated show gives Princess a real voice, the companion you've bonded with for months finally speaks. The whole avenue is building toward that moment.

## Avenue 7 — UGC / creators
*UGC = "user-generated content": letting fans **make** things inside the world (and showing the best
of it off). Turns an audience into co-authors.*
1. **Writers' Room "Featured Reels" shelf** — a curated showcase of the best fan-made storyboard reels — the easiest first step into UGC (you hand-pick winners; see the decision note below).
2. **Siege map editor + shareable codes** — let players design their own Siege levels and share them with a code others paste in — community level packs with no server needed.
3. **"Design a citizen" template** — a simple template for fans to invent a Checker Town townsperson; the best get added to a **curated gallery** (the dream prize: appear in an actual episode).
4. **Fan-art gallery** — a moderated gallery of fan art on each character/location page, with a monthly featured artist — rewards and spotlights the community.
5. **Headcanon submissions** — fans submit their theories/backstory; the best get folded into semi-canon and feed the **Lore Codex** (the in-world encyclopedia).
6. **Trivia forge** — players submit quiz questions for the Clearance: DELTA game; curated ones enter the real deck — the community helps build the game.
7. **Board-skin uploader** — let players make and share custom chessboard skins — personal expression that costs you nothing to host if shared by code.
8. **Monthly featured-creator slot** — a recurring spotlight (artist, writer, level-designer) — gives fans a reason to make *and* a reason to come back to see who's featured.
9. **Remix-a-reel** — take someone else's published Writers' Room story and **fork** it into your own version — collaborative storytelling, like a remix culture.
10. **Embed/API** — let fans put their PJCC stats or a mini-game on their own site/blog — every embed is a tiny advert that spreads the world for you.

> **Open decision (publish/share reels):** ship **A** — a hand-curated `_data/reels.yml` shelf (free,
> on-brand) now; graduate to a **Supabase gallery** with likes/credits when Operative accounts land.
> A **Formspree/Google-Form** capture is the middle step if demand shows up first.

## Avenue 8 — The Operative Command Center *(✅ merged into the Dossier, 2026-06-22)*
*No longer its own page — its best modules now ride at the **top of [`/dossier/`](/dossier/)** as an
instant, **offline-safe** strip: mission clock + dev-day counter, a date-seeded **daily mission**, a
**fragment-recovery grid**, and quick-launch — all rendered without waiting on the account network
(so slow connections still get a useful page). `/command-center/` redirects to the Dossier. The list
below is the deepening path; the cross-device/social parts (#10) ride in on accounts.*

*The old `/sandbox/` "Command Center" was a slick hidden dev terminal — a streaming transmission log,
a 16-node cast constellation, operative rank, an episode countdown, daily opening intel, and a
fragment-recovery grid. We **dropped the page** (it was a static mockup behind a front-door tile) but
the **concept is too good to lose**: a single **mission-control HQ** that makes an operative's whole
relationship with PJCC personal and **earned**. Most of it is buildable client-side from systems that
already exist (rank, fragments, dailies, countdown); the social/cross-device parts wait on accounts.*

1. **One HQ screen** — your dossier rank, credits, and streak in a single mission-control layout (the place a returning operative lands).
2. **Fragment-recovery grid** — your site-wide `frag_` collection as a live status board, with hints at what's still hidden (ties the ARG + the new Sand Mine `frag_subjectzero`).
3. **Mission clock** — the premiere ETA as a live countdown (the same date the companion + Press Kit already use).
4. **Daily mission** — one assigned task a day, pulling the Academy homework and each game's Daily into a single objective.
5. **Live transmission log** — a streaming in-universe feed (curated now; an Avenue-tie if it ever generates).
6. **The cast constellation** — the 16-node piece-relationship graph, but **unlocked node by node** as you read character/location files (ties the Lore Codex).
7. **Opening intel** — a daily chess-opening tip (ties the Pirc trainer + Academy).
8. **Earned, gated modules** — panels unseal as your clearance rank climbs, so the HQ literally grows with you.
9. **"What's new since you left"** — a changelog of drops, bar-moves, and dailies since your last visit.
10. **Backend-aware** — with Operative accounts it shows real cross-device progress, leaderboard standing, and guild/house.

**Realistic take:** the old terminal proved the *look*; the value is making it *yours* and *earned* — a durable reason to return that compounds with everything else on the site. Build the client-side modules first (rank · fragments · countdown · daily · constellation); the social layer rides in with accounts.

## Avenue 9 — Live ops / a heartbeat
*"Live ops" = features tied to **real time and presence**, so the site is different today than it was
yesterday and feels alive rather than static. Creates **appointment** engagement (reasons to come
back on a schedule).*
1. **Community megabar** — a single site-wide progress bar that everyone's combined scores fill, themed as literally "building the bridge to Chess City" — turns solo play into a shared goal.
2. **Seasonal reskins** — the site visibly changes with the seasons (winter snow, a festival, the sea freezing over) — small recurring novelty that signals the world is tended.
3. **December advent** — a 24-day calendar where a new door opens each day (a game, a lore beat, an art drop) — a daily ritual through the holidays.
4. **24-hour tournament events** — a time-boxed competition on a fixed challenge — urgency and a shared "were you there?" moment.
5. **"Studio is open" indicator** — a live badge showing when Nate is actively building/drawing (eventually streaming) — turns the work itself into a draw.
6. **Episode-drop watch party** — a page that gathers people for a synchronized first-watch when content lands — makes a release an event, not just a file.
7. **A daily world-state** — the in-world news ticker (and small details) shift each day based on a date seed — the world keeps "happening" even between updates.
8. **Limited-time event games/rewards** — games or cosmetics available only during an event window — scarcity that rewards showing up.
9. **A global "first to clear" race** — when new content drops, the first players to beat it are recorded — a competitive hook for the most engaged.
10. **An anniversary beat** — a dated event each year on the "crash" anniversary (and the dev-start date) — a recurring celebration that doubles as a milestone marker.

## Avenue 10 — Funding & reach *(Press Pass + dispatch + Press Kit live)*
*How this pays for itself and finds people. **Live now:** Press Pass + Press Credential + Founders
Wall + founder-cosmetic preview + pricing poll + backer-dispatch preview · Press Kit/EPK + share-card
generator + live "by the numbers" · `/educators/` B2B page · "what your support funds" transparency ·
direct-support row · referral invite links · game-over dispatch capture · `docs/festivals-and-grants.md`.*

*Waiting on the **backend/payments** layer (build these the day accounts land): the **cosmetic store**
transaction, **"Adopt a shot"** micro-patronage (back one animatic shot, get credited on it), a
**server-verifiable** founders number, the **Resend welcome-email** automation, and **partner outreach**
(a relationship motion, not a build — the Press Kit makes you ready).*

**Fresh ideas (newest thinking):**
1. **Producer-credit ladder** — support tiers map to a real on-screen credit (Backer → Associate Producer → Executive Producer) in the finished episode. People will pay to have their name *in the cartoon*.
2. **Pay-it-forward passes** — buy a Press Pass (or Academy access) for a kid or classroom that can't afford one; sponsors get a thank-you and a count of who they've helped.
3. **Unlock-goals tied to deliverables** — public goals where hitting one **unlocks something for everyone** — e.g. "fund the first studio session → the Checker Town theme gets recorded **on camera**." Directly serves the live-music reveal (see Planted Seeds).
4. **A living credits crawl** — a scrolling, always-on credits page that every supporter/contributor joins; the show's end-credits, but already rolling, in public.
5. **"Name your price" arcade bundle** — package the whole arcade as a pay-what-you-want download (itch.io-style); $0 is allowed, but the option to pay converts the goodwill you've already earned.
6. **Sponsor the Game of the Week** — a backer's name or dedication rides on the weekly featured game — small, cheap, repeatable patronage.
7. **The Chess City Passport** — an annual all-access pass framed in-world as a travel passport that earns a cosmetic **stamp** each season — recurring revenue with a collectible hook.
8. **Radical-transparency burn page** — show monthly cost vs. support, openly. Indie audiences reward honesty; "here's exactly what keeps the lights on" builds trust no ad can buy.
9. **Creator kit** — a ready-made "cover PJCC" pack (overlays, embed widgets, key art, talking points) so streamers/teachers can feature the project in minutes — lowers the friction of every Avenue-2/10 partnership.
10. **Refundable merch pre-orders** — gauge real demand for Avenue-4 items with fully-refundable pre-orders/waitlists before any inventory exists — de-risks the physical bets.

---

## Avenue 12 — 日本語 / Japanese Learning *(new lane)*

A learn-Japanese wing, grown out of what's already in the world: Shogi Island, the bilingual
home ticker, and the Construction Co. transmissions. **Designed for all ages** — playful mnemonics
and big friendly drills on the surface, with optional depth (JLPT, pitch-accent) so it scales from
a curious kid to an adult learner. Mirrors the arcade's proven scaffolding (daily seeds, streaks,
belts, global boards, a guide companion).

> **✅ Engine shipped (2026-06-22) — [The Reading Room](/games/reading-room/)** (`assets/games/pjcc_reading_room.html`,
> score key `reading-room`). The lane's foundation: an **Anki-style SRS** (Leitner boxes + due
> scheduling, saved per device) covering **hiragana, katakana, and 46 common N5 kanji**, with two
> modes — **Review** (flip + self-grade Again/Good/Easy, which drives the schedule) and **Quiz**
> (combo-scored multiple choice, posts to the leaderboard). Its guide-companion is a **new
> character: [Kaede](/characters/kaede/)** (`_characters/kaede.md`), a fox from Shogi Island who
> settled in **Checker Town** and runs the Reading Room (読書室), speaking Japanese in-game. This
> realizes #1 (Kana Dojo) and seeds #4/#5/#15. The ideas below remain the growth path.

1. ✅ **Kana Dojo** (in The Reading Room) — hiragana/katakana drills with spaced repetition (SRS) and a guide. Now taught by Kaede in Checker Town.
2. **Kanji of the Day** — one kanji daily: stroke-order animation + a PJCC-flavored story mnemonic.
3. **Stroke-order trace** — finger/mouse-trace kana & kanji on a canvas; graded on order and shape.
4. **Shogi-piece kanji first** — 歩 香 桂 銀 金 角 飛 王 as the gateway set (straight off Shogi Island).
5. **Romaji → kana ramp** — start with romaji crutches that fade as you improve (the Shogi guide's "decode as you go").
6. **Decode-the-transmission** — translate the Construction Co. intercepts to crack lore fragments (ARG tie, Avenue 2).
7. **Bilingual ticker reader** — the home ticker's JP lines become tap-to-reveal furigana + meaning drills.
8. **Site-wide furigana toggle** — optional ruby furigana over any Japanese on the site for learners.
9. **Counting & counters kata** — numbers, dates, and counters (〜枚 for boards, 〜手 for moves).
10. **Chess/shogi vocab deck** — 王手 (check), 詰み (mate), 成る (promote), 持ち駒 (pieces in hand)…
11. **Listening booth** — native-ish TTS speaks words/phrases; an echo-back mode (Web Speech).
12. **Speak-it** — say the word; graded by speech recognition for an eyes-free drill.
13. **Particle puzzles** — drag は / が / を / に into the right slot in a sentence.
14. **Sentence-builder** — assemble simple sentences from word tiles; Princess narrates the result.
15. **JLPT N5 track** — a structured beginner path (kana → N5 kanji/vocab/grammar) with Academy-style belts.
16. **Daily seeded lesson** — one shared lesson/quiz a day; global accuracy board (like the other dailies).
17. **Phrasebook for the Journey** — travel phrases themed to "crossing to Shogi Island" (greetings, directions, food).
18. **Catch-the-Lion JP mode** — the 3×4 shogi game labels pieces in kanji + furigana, teaching as you play.
19. **Radical lab** — learn radicals, then a "build-a-kanji" mini-game that combines them.
20. **PJCC-flavored mnemonic cards** — every kana/kanji memory hook uses a character or location.
21. **Memory match** — concentration: kana↔sound and kanji↔meaning pairs.
22. **Kana typing trainer** — romaji→kana IME basics; learn to actually type Japanese.
23. **Story mode: the Shogi Island arc** — a short bilingual visual-novel slice; choices teach phrases.
24. **Boss-gate quizzes** — region-gate bosses (à la Fork) that test the current lesson set.
25. **Calligraphy gallery** — earn brush-art "relic" unlocks for streaks (cosmetic, like Blindfold relics).
26. **Pitch-accent ear trainer** — distinguish accent patterns (advanced, opt-in).
27. **Seasons & dates** — culturally-flavored, tied to the Story-Arc chapters' moods.
28. **"Sensei" companion** — the Shogi Island guide gives daily encouragement + gentle corrections (Princess-companion tie, Avenue 6).
29. **Language passport** — a stamped passport in the dossier; ranks/belts as you advance (Command Center tie).
30. **Community translation board** — learners submit translations of lore snippets, upvoted & curated (UGC, Avenue 7).

---

## 🅿️ Pulled from the live site (parked here)

Removed from the live surface for a cleaner, less-is-more site — kept here so the work/idea isn't lost:
- **Games-page search box** — re-add if the library outgrows a single screen.
- **Games-page sort dropdown** (Featured / A–Z / Newest / My best) — same trigger.
- **De-linked nav pages** (revisit when there's real content): World Map, Sound, Soundtrack, Press Kit,
  Lore Codex, Evolution Log. **Podcast** page removed (a "Podcast Coming Winter 2026" teaser sits on the
  homepage). **Chess Lessons** folded into About/Contact.
- **Cursor sheen** — the cursor-following card glow (it washed out card text); discarded site-wide.
  *Creative re-use if it ever returns: a single "spotlight" sheen on the featured Gauntlet box only, or
  a treasure-hunt reveal that lights hidden text only where the cursor sweeps.*
- **Games-page embedded leaderboard** — now its own page (`/leaderboards/`), reached from a Games CTA +
  a floating homepage 🏆 icon (cleaner than inlining the whole board).
- **Homepage Story Arc film-strip** — removed; chapter beats are now **decode-as-you-play** (see Seeds).
- **Site-wide Princess speech** — removed; she's movement-only now (Avenue-6 talk ideas stay parked).
- **The personal "Creator" bio** (career highlights / hobbies) — replaced with a mysterious "Operator";
  bring back selectively only if a real founder story helps a specific business ask.

---

## 🛠️ The long game (bigger bets, mostly not web code)
- **The Godot roguelite** — a Binding-of-Isaac-style game from the Blender assets (rigged Princess,
  chess pieces, the battle-room). Start with ONE playable room exported to HTML5, embedded on the
  Games page and wired to the same profile/leaderboard; then layer rooms → items → procedural floors.
  Blender (assets) + Godot 4 (engine). Princess Dungeon is its web prototype.
- **Blender cutscene intros** — short rendered clips as game intros / loading screens / season
  trailers. *(Saved favorite.)*
- **Backend** (Supabase) unlocks the cross-cutting features: guilds/houses, async duels, the
  Writers' Room gallery, shared community tallies, the cosmetics store.

## My honest read — if you only chase three
1. **Avenue 1 + Avenue 5's audio drama** — together they *ship the story* before animation can. The
   main quest; everything else is side content.
2. **Avenue 10 (newsletter + Press Pass)** — the owned, durable funding layer. Cheap and defensible.
3. **Avenue 6 (Princess companion)** — the cheapest emotional stickiness; most likely to make people
   *love* the brand.

Honorable mention: **Avenue 3 (Academy)** is the strongest standalone business but a real second
job; **Avenue 2 (ARG)** is the superfan ceiling but a cadence trap — start it only when #1 is humming.

---

## 🌱 Planted Seeds (a running list — quiet set-ups for later payoffs)
*Small things we plant **now**, in public, so a future reveal feels earned instead of out of nowhere.
Each line: the seed → the payoff it's building toward. Add to this as we go.*

- **The score is played by hand** → *Nate on guitar & drums.* Seeded on `/sound/` ("played by hand —
  real guitar, real drums, filmed") and in the dispatch's "score reveals." Payoff: videos of the
  studio sessions where the audience watches the music of Chess City actually get performed. *(Tie to
  Avenue-10 #3: an unlock-goal that funds the first on-camera session.)*
- **"Made in the open"** → *the pilot pre-sold.* Seeded everywhere (production hub, tracker, Press
  Kit). Payoff: arriving at episode one with an audience that already feels like co-producers.
- **Subject Zero / the crash** → *the origin reveal.* Seeded via the ARG fragments + Lore Codex.
  Payoff: the season-one ending that pays off years of breadcrumbs.
- **Bill is quietly the most capable person in the room** → *the turn.* Seeded as Princess' easygoing
  crew partner. Payoff: the origin montage where he can teach Princess *anything* — and the heartbreak
  of leaving her behind.
- **The big brother who became a father** → *the emotional core.* Seeded on the Main Character &
  [Crockett](/characters/crockett/) pages. Payoff: the audience realizing the whole journey is for
  his little sister.
- **"Chess City Leafs"** (in the news ticker) → *the Auston Matthews nod.* Seeded in the world ticker
  + Auston the Bomber. A wink for the hockey fans.
- **The story, told in fragments** → *decode-as-you-play.* The homepage Story Arc film-strip was
  removed on purpose: the chapter beats (the Crash → Checker Town → First Move → the Sea → Shogi Island
  → Chess City → the Tournament → the classified chapter) are now things players **uncover** through
  games, the Lore Codex, and the ARG — earned, not handed over. Payoff: piecing the arc together feels
  like real discovery.
- **A heart you can feel** → *the show's moral center.* PJCC is positioned around **good values and
  quiet positivity** (Neville-Goddard-flavored — assume the good, tend your inner world) plus Nate's
  real, touching stories. Seed it in copy + lore tone now: warm, hopeful, never cynical. Payoff: a show
  people trust their kids with and adults feel better for having watched.
- **Kaede's locked second shelf** → *a language no one can read.* Seeded in
  [Kaede](/characters/kaede/)'s dossier (the Reading Room's sealed scrolls). Payoff: an Avenue-12
  "decode-the-transmission" reveal that ties the Japanese lane back to the Construction Co. origin.

*(Seeds to plant next: a recurring object/motif across games and the show; a line of dialogue that
only lands after the origin; a background character who matters later.)*

---

## 🛠️ Day Job Ideas
*Captured by Nate mid-shift — raw, to develop later. (He represents Pontiac, MI; these are the thoughts that arrive during the workday.)*

1. **Podcast intro — ask Dan.** Dan (Nate's manager) might help with the podcast intro. → Action: ask Dan; also pin down what the podcast actually is (a PJCC / behind-the-show companion pod?).
2. **More themes — a Mega Man II–flavored Games Page.** *Mega Man II (NES)* is Nate's all-time favorite game. Skin a version of the games page in that 8-bit Mega Man style and score it with **original PJCC chiptune** (McPuppy Studios). A themeable games-page skin + one original 8-bit track is a self-contained, web-buildable slice — and the first real McPuppy original music on the site.
3. **The righteous Checker Town rival — needs a biblical name.** A character who is *completely righteous*, **represents God and always acts as such** — the story's **moral compass.** Proposed name: **Michael** ("Who is like God?" — the archangel of righteousness; pairs cleanly with the chess-king imagery). Alternates: **Samuel** (the prophet/kingmaker who guides and anoints) or **Gabriel** (herald of God). ⚠️ Open question to resolve before naming in canon: is this the **existing [The Rival](/characters/rival/)** reimagined (currently written as a morally-grey ex-antagonist with family in Chess City), or a **new, separate** righteous Checker-Town character? They don't quite reconcile as-is.
4. **The Tortoise mindset — *not* "slow and steady."** The motif isn't the moral everyone quotes; it's the **tortoise's inner state**: calm, certain — *"I know exactly what I'm doing while everyone else is all over the place."* Quiet conviction over frantic motion. A brand value and a possible motif/character beat (fits the Neville-Goddard "assume the feeling" tone). See the moral-center positioning above.
5. **Workplace negativity, observed.** The volume of negative talk among some coworkers was striking — and instructive: some were **infected** by others' negativity, while some **flipped positive** when met with good vibes. Lived proof of why the show leans into positivity; possible honest story material for the moral center.

**— Cast notes (added 2026-06-22):**

6. **Crockett is a real male dog — *not* the younger sister.** Canon correction: the [Crockett](/characters/crockett/) page currently casts him as the main character's younger sister. Wrong — **Crockett is a male dog** (Nate's real dog; their greeting is "**bellies**" — Crockett plants his paws on Nate's shoulders and they rub bellies — a sweet real-life touch, à la the real Princess). → The **younger sister** is a *separate* character; name her **Annie.** Needs file surgery: move the sister role → a new Annie page, repurpose Crockett as a male-dog crew member, and fix the [Main Character](/characters/narrator/) link that points at her. *(Say the word and I'll do it.)*

7. **Argus — "the smart one."** A **dog**, the brains of the crew, who **slowly grows into a solid chess player** (upgrade his current "eventually decent"). Safe refinement to [Argus](/characters/argus/).

8. **The main character's people — relationship map:**
   - **Younger sister → Annie** — the story's **emotional crux** (the role currently mislabeled "Crockett": brave beyond her size, runs the Shogi Dojo, the one he's really doing it all for).
   - **Older brother** — a **self-righteous** Bible figure *things don't work out for.* Options: **Saul** (first king; self-righteous disobedience → rejection, jealousy, a tragic fall — dignified but doomed; *rec*), **Cain** (the literal elder brother undone by pride/jealousy — starkest, but villain-coded), **Esau** (elder brother who loses his birthright to the younger — "things don't work out," more rash than self-righteous), or **Korah** (led a self-righteous revolt, swallowed by the earth — pointed but obscure). The Prodigal Son's resentful elder brother is the exact archetype.
   - **Father** — exists: [Father](/characters/father/) (name still unknown).
   - **The Rival → acts as God would, *always*.** Confirms last batch: the Rival is the **righteous moral compass** (this redefines his current morally-grey write-up). Options: **Michael** ("Who is like God?" — archangel of righteousness; pairs with the chess **king**; *rec*), **Gabriel** (God's herald), **Samuel** (prophet/kingmaker, the moral compass who guides), or **Emmanuel** ("God with us" — most literal, maybe too on-the-nose).
   - **The Rival's two friends — a brother pair.** **James & John** ("Sons of Thunder," the fiercely loyal apostle brothers; *rec*) or **Peter & Andrew** (brother apostles). A God-acting Rival flanked by apostle-brothers — plus the [Best Friend](/characters/best-friend/), who already drifts into his orbit — makes a small faithful band.

> **Theme to mine:** the **Rival is *truly* righteous** (acts as God), while the **older brother is *self*-righteous** (the hollow kind) and falls — true vs. counterfeit righteousness, set side by side in the same family.

---

## ✍️ Series canon & story seeds (writing notes — not site features)
*Captured verbatim-ish from Nate.*

- **Bill — Princess' former crew partner** (*not* the main character's dad). Simple, silly, and
  absent-minded on the surface — but in *his* lane he's incredibly sharp: the gadget guy who can rig
  or fix anything, and the one who taught Princess to hit the Hyperspeed Box. He has his own family
  and does everything he can for them. (The comic-relief everyman who turns out to be quietly the
  most capable person in the room when it counts.)
- **Season 2 villain — the rival teen.** A teenager in Chess City who works for the
  dog-stealing gang; he's the **contact who returns the stolen dog and collects the ransom**.
  Arc: later he discovers what the gang is *actually* doing, turns on them, and **joins the main
  character.** (Antagonist → ally redemption arc.)
- **Origin story.** The **Intergalactic Cup** chess tournament was set to take place on this
  planet, so a **construction crew of ships flew out** to build for it — and **crashed**, leaving
  behind **Princess and all the checker & chess pieces** (this is why they "fell from the sky"
  over Checker Town).
  - **Bill & Princess** were **paired together for the work crew** and bonded instantly. Tell it
    as a **montage of missions** — Bill could teach Princess to do *anything*, including how to
    **hit the Hyperspeed Box**.
  - The turn: the **Hyperspeed Box runs astray**. Bill has to **protect his family, who are
    aboard**, and is forced to **leave Princess behind** — a choice that **shatters him**.
  - Hook for later: **maybe he comes back looking for her.**
