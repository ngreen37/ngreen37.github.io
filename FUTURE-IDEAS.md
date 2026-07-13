---
published: false
---

# PJCC — Future Ideas

The open backlog: **only what's *not* built yet.** Completed work has been cleared out of this file;
everything here is a path not yet taken.

**Operating principle — *less is more.*** We deliberately built "too much" and are paring to the most
important, inviting elements. New ideas earn their place against that bar; prefer **depth and
combination** over new surface area.

---

## ♛ Gauntlet-as-flagship — the remaining framing moves
*(the hero band, boss cards, commentators, resume-continuity, rank badge, and games-page hierarchy all shipped; these three are what's left)*
- **Rename the experience** — "The Ascent / Coronation Run." Wire it explicitly to Princess's canon arc (she can learn anything → she rises to Queen): the climb this whole world is about. Framing + copy, zero code.
- **The climb as a journey across the world map** — the roster already mirrors the regions (Checker Town → Sand Mines → Sea → Shogi Isle → the tower); present it as a map you traverse so the Gauntlet visibly ties every location and game together.
- **Advertise that it has a real ending** — lean into the coronation payoff (beating the CEO = the Princess → Queen moment + the secret ▾ DESCEND). Tease it ("Ten stand between a recruit and the crown"); the natural home for a short Blender cutscene intro.

## ★ North star (the direction)

**PJCC's product right now is the show *getting made*.** The animation is years out; ship the *story*
in every cheaper form first, build an audience that owns itself, and make people love the world before
a frame renders. Five braided threads:

1. **Ship the show early** — production-as-content (Pilot animatic, tracker, Writers' Room) + an audio drama.
2. **Own the audience** — the dispatch (newsletter) + Patreon: durable, un-algorithmed channels.
3. **Make them love her** — Princess as a companion; the bond pays off the day she gets a voice.
4. **The arcade is the funnel** — a deep chess arcade that pulls players into the Academy (the business most likely to fund the animation).
5. **One mystery over all of it** — the spy/ARG layer (Subject Zero, the crash, the Construction Co.) ties games + lore + show into one self-marketing puzzle.

The long game is the **Godot roguelite** from the Blender assets. The trap to avoid: *more games for
their own sake.* New surface area should serve one of the five threads.

---

# 🕹️ The Arcade — remaining polish per game
*Depth & retention only — not new games. Each line is one buildable move.*

**The Gauntlet (headline):** **Take an action against each
opponent** — a between-moves verb tied to each persona. The **nervous challenger** shakes the board and fidgets
with the pieces; you can **ask him to stop — and he may or may not** (a saving-throw against his composure). Argus
can be *calmed*; the Gatekeeper ignores you; the CEO turns it back on **you.** Then: opening books for the
Rival/CEO · a daily gauntlet · a captured-tray + move list · more rungs (the secret King). Design doc:
[`docs/chess-ladder-design.md`](docs/chess-ladder-design.md).

**Notation Blitz:** Score Mode (charts the real themes — Av5 unlock) · diagonal & file lanes · coordinate
duel (the Rival speeds up on misses) · blind grid (fade the board mid-run; bridge to Blindfold) · combo
leitmotif (a streak layers a theme) · landmark BPM ladder.

**Blindfold / The Mind's Eye:** rebuild-the-board · piece-count ladder · voice-input (Web Speech) ·
phantom-blunder review · walk-the-knight audio drills · PGN import · relic boards · "solved it blind" card.

**Clearance: DELTA:** redacted-dossier meta · sudden-death OMEGA · audio-intercept questions · wager mode ·
daily briefing · three lanes (rules / lore / chess history) · spot-the-lie (ARG) · question forge (UGC) ·
clearance-gated lore · speed-vs-accuracy dial.

**Fork in the Road:** endless one-life gauntlet · show-the-refutation coach · theme drills
(fork/pin/skewer/discovery) · blitz tactics · boss-gate taunts · mistake replay (spaced repetition) ·
race the creator ghost · construct-the-fork · daily tactic + streak · reads-you difficulty.

**The Pirc Protocol:** opponent personalities · weekly annotated model game (Argus's voice) · side-switcher · trap of the week ·
repertoire builder (UGC export) · "out of book" alarm · boss: the Rival's prep.

**Sand Mine Depths:** light beacons + fog-of-war minimap · cave-in chains · Auston-camp one-run consumables · relic
sets · knight-only traversal rooms · explicit biome shifts.

**Shogi Island / Catch the Lion:** *(already most complex — 9×9 rules, tsume solver, AI; add carefully).*
Handicap ladder vs the Lion AI · piece-reach trainer · tsume-of-the-day · drop-rule drills · calligraphy
wall (JP tie) · castle drills · 9×9 stepping-stone · the Lion's moods · Codex bridge · island hot-seat duel.

**Sky Run:** lore bosses · **view-switch in Boss-Mode** (next) · new power-ups (Rook wall, pawn-storm, en-passant dash) ·
co-pilot couch co-op · loadout select · boss rush.
> **★ The view-switch — a signature mechanic (Nate, 2026-06-23).** When a boss appears, the camera *cuts to a
> different view* (side → behind / top-down / over-the-shoulder) for the fight, then cuts back. It's the same idea
> as the Battle Room's screen-flip: **switching view is meant to become a signature across many PJCC games** once
> the animation pipeline lands. Web version: swap the render projection for the boss phase (a CSS/canvas transform
> or a second draw routine) with a quick "VHS cut" transition; later it becomes a true camera cut in Godot.

**Follow the Dog** *(formerly Space Run — renamed 2026-06-23):* *(not yet wired to PJCC — do that first).* Then:
qualifier framing · collect-a-set upgrades · legality-dodging · rival racers · daily track · tactic-shortcut
branches · cosmetic ships · speed-tier music · near-miss combo · lean into the **"follow the dog"** creed (the
companion you chase becomes the guide).

**Knight's Tour:** rubble squares · constellation trail (→ `/constellation/`) ·
undo-budget mode · two-knight co-op · Academy teach-mode · forcing-move knight puzzles (each one provable).

**Siege on Chess City:** branching campaign map + between-battle dialogue · map editor (share by code, UGC) · aimed Princess
hero ability · economy gambles · two-lane co-op · campaign win → Codex entry.
> **Guardrail — don't be Bloons TD.** The difference must be *chess*: towers threaten by piece rules,
> placement is a positional puzzle (lines of fire, forks, pins). If a feature would feel identical with
> monkeys and darts, rethink it.

**Princess Dungeon → Godot next:** room grammar that mirrors Godot · chess-piece enemies
(each moves by its rules) · move-set relics (bishop dash, knight blink, pawn-storm) · boss = a mate-in-N ·
biome floors (Checker Town → Sea → Shogi Isle → Chess City) · Bill's-toolbox consumables · daily seeded
dungeon · pacifist puzzle route · escort pawns · risk altars (deepest hide ARG fragments). *The web
prototype (`/games/dungeon/`) is the playable spec; the Godot build is the same game in 3D.*

### 🆕 Ten new arcade concepts (replenished 2026-07-01)
*Fresh games for the funnel — grounded in the world, cosmetics-only economy, small enough for the web-first pattern. See [[game-monetization-ethics]], [[stay-within-means]].*

1. **The Ferry Crossing** — the perpetually-delayed Shogi Island ferry as a timing game: hop drifting board-tiles across the rough Sea before the gangway lifts. Pays off the "ferry delayed" running gag and the Sea region.
2. **Endgame Escape** — a King-and-pawn roguelite: escape a collapsing board with opposition + key squares; every floor a real won/drawn study. Teaches the endgames the arcade currently skips.
3. **The Cipher Room** — decode intercepted transmissions by solving chess-notation ciphers (files/ranks → letters). The Dead Drop / Classified / Daily Dispatch decode theme as its own game.
4. **Crockett's Delivery** — Paperboy down Checker Town: Crockett runs the Father's paper route, dodging obstacles, belly-rub combos for accuracy. Ties Crockett + the newspaper lore.
5. **Pawn Storm** — promote a wave of pawns across the board before the enemy Queen arrives; a chess-flavored lane puzzler with a promotion payoff.
6. **Blindfold Duel** — The Mind's Eye as head-to-head: two operatives (or vs. a persona) call moves on a hidden board. Hot-seat now; async later.
7. **The Quartermaster's Run** — a cozy shop-merge: stock the store, match chess-piece goods, earn cosmetics. Wraps the existing store economy in a calm loop.
8. **Rival's Shadow** — a beat-the-ghost tactics race: replay the exact set the Rival solved and try to match his line move-for-move (uses the creator/ghost system).
9. **Sand Mine Cart** — an auto-runner minecart plunge, dodging Subject Zero and grabbing gold ⛏ — a fast companion piece to Sand Mine Depths.
10. **Coronation** — the journey's capstone: a mate-in-N boss rush atop the CEO's tower, unlocked by clearing the Gauntlet. The victory-lap game.

### 🎮 Godot build plan (Princess Dungeon → 3D), condensed
*Engine: **Godot 4.x** (GDScript, free). Assets: **Blender** → `.glb`. Each phase ends runnable.*
- **P0 Pipeline:** Blender → `.glb` → renders in Godot. Pick the grid (N×N, match the prototype).
- **P1 Grey-box room:** GridMap board, King-step hero (tween), TurnManager; step on Stairs = win.
- **P2 Art:** model/rig Princess + piece-enemies (idle + hop/attack anims); biome board materials.
- **P3 Rules:** port the prototype's movement/attack logic to GDScript; the threat telegraph; hearts.
- **P4 Relics & run:** stacking move-relics + a 3-relic choice screen; track run state.
- **P5 Floors:** seeded enemy placement, biome swaps, every-5th boss room.
- **P6 Web + wire:** HTML5 export under `assets/games/godot-dungeon/`, Jekyll wrapper, JavaScriptBridge → `PJCC.saveScore('dungeon', …)` so 3D posts to the same board.
- **P7 Juice:** shake, particles, a Blender cutscene intro.
- **P8 Ship v1:** tune vs the ghost; announce with a Blender trailer.
- **Anti-overscope:** P0–P3 are the real risk. Get **one beautiful web-exported room** live before floors, relics, or bosses.

---

# 🛣️ The Avenues

**Av1 — Production as content:** real board scans in the animatic ·
shared frame-the-scene tally · auto-changelog from the tracker · threaded per-shot comments · public
render-queue · two-cut compare slider · scratch-VO upload · living episode pages (animatic→final) · a
filling credits wall · embeddable animatic player.

**Av2 — The season-long ARG** *(~80% scaffolded; an "alternate reality game" solved together over time):*
weekly cipher chain → coordinates → a map to a hidden page · a collective fragment (needs N visitors) ·
Narrator voicemail (a real number) · Subject-Zero countdowns · in-universe clearance ranks gate pages ·
printable invisible-ink dossier + QR stickers · cross-game keys · weekly field report (Discord bait) ·
the crash-site coordinate (season-one payoff). **At launch (not before):** spin up a **Discord** as the
community + ARG home — where fans solve the cipher chain *together.* A Discord with zero members is dead weight,
so wait for Flare #1; it's apparatus, not destination.

**Av3 — The Academy** — backend upgrades when accounts land: shared class
rosters/dashboards, a server-verifiable cert registry, a rules-enforcing practice board.

> **The Academy as the show's central location (brainstorm, 2026-06-25):**
>
> **The "Hogwarts" of PJCC.** Make the Academy a single **recurring set piece** instead of one-off lessons —
> Princess, Argus, Auston, Maxwell, et al. all attend, taught by a **mentor figure** (could be Nate's
> role, or a new character — a **retired chess-piece veteran**). Episodes map to academy **ranks / belts** the
> characters progress through, mirroring a real curriculum arc.
>
> **Curriculum → story mapping.** Use the real **five-week Level 1 youth curriculum** (Nate's actual coaching
> syllabus) as the in-universe academy syllabus — so every episode teaches one real chess concept while
> advancing a character arc:
> - **Week 1 — board setup & piece movement** → Princess & Murphy's intro episode; pure fish-out-of-water
>   comedy (Princess is a pawn learning the basics).
> - **Week 2 — tactics (forks, pins)** → a battle-room episode where **Oskar** comically gets forked.
> - **Week 3 — openings** → **Checker Town Rival** teaches Princess the **Pirc Defense** — already locked lore, slots in
>   directly. 
> - **Week 4 — endgames** → higher stakes; **Murphy's** pessimism becomes relevant ("we're already lost") vs.
>   Princess's New-Thought-inflected optimism.
> - **Week 5 — tournament / test** → a real battle-room match as the season climax.
>
> The lessons Nate already writes for the coaching job become a **content-generation engine** for the show.
>
> **Thematic hook.** Since New Thought / Neville Goddard already informs PJCC's spiritual direction, the Academy
> is a natural vehicle: each chess principle (think ahead, control the center, sacrifice for position) doubles
> as a **metaphor for a character arc** — strongest against **Murphy**, the pessimist foil who treats the board
> (and life) as **fixed** rather than **shaped by belief.**

**Av4 — Physical / tabletop:** print-and-play Siege PDF · POD pins/stickers demand page · the PJCC chess
set (obsidian-vs-violet) · Sand Mine as a dice/card PnP · Operative Field Kit (cipher wheel + decoder,
ARG tie) · Checker Town Field Guide (art book / festival leave-behind) · earn-a-rank → buy the pin ·
"build your dossier" printable · Founders sticker pack · Catch the Lion mini travel set (Annie's game).

**Av5 — Audio:** first theme → EP + Notation Score Mode · a 5-min audio-drama
scene (cheapest pilot test) · per-game SFX toggle + unified palette · leitmotif duets · Checker Town
ambience loop · the casting call · streaming once themes exist · reactive music · "hum the theme" toy ·
a podcast feed.

**Av6 — Princess companion + the Identity Forge:** react to live game results · seasonal outfits +
holiday lines · persistent chattiness/mute setting · "walk you to" page suggestions · a mood/needs
(tamagotchi) loop · she learns your codename (accounts) · a fetch micro-interaction · milestone gifts she
brings · a second companion · **her voice** (the show's ultimate payoff — the whole avenue builds to it).

> **The Identity Forge — growth path (20 next moves; depth over surface; ★ = low-lift, ⛁ = wants backend):**
> 1. ★ **Operative trading card** — render the full composite (hat + emblem + aura + name + role) onto the existing share-card canvas; a collectible card of *your* character.
> 2. ★ **Boards show the whole look** — paint hat + emblem next to codenames on leaderboards, not just the base glyph (a tiny per-row render helper).
> 3. **Your companion as the site walker** — opt-in toggle to swap the footer Princess stroller for *your* created pet (ties the Forge into the live site).
> 4. **Outfit layer** — a torso overlay (cape · armor · lab coat · kimono · varsity) as a 3rd compositing layer.
> 5. **Held-item layer** — a prop in hand (sword · book · wand · controller · paintbrush) as a 4th layer that telegraphs your role.
> 6. **Reactive expression** — a few face/mood variants the avatar swaps to after a strong or rough run (joins Av6's "react to live game results").
> 7. **Backdrop scenes** — a chosen scene behind the avatar (Checker Town · Sand Mine · Shogi Island · starfield) that doubles as a Dossier theme.
> 8. ★ **Starter archetypes** — one-tap kits ("The Tactician", "The Miner", "The Sensei", "The Operator") that fill every layer for players who don't want to fiddle.
> 9. ⛁ **Earned cosmetics** — gate premium bases/hats/emblems/auras behind achievements + Quartermaster credits (wires the Forge into the existing economy).
> 10. **Seasonal parts** — limited-time headwear/auras (advent · anniversary · festival) hung off Av9 live-ops.
> 11. **Play-to-unlock pet skins** — beating a game's creator-ghost unlocks a themed companion skin (Reading-Room owl, Shogi lion, Sand-Mine mole).
> 12. ★ **Codename/companion-name spinner** — a "roll a name" button drawing from a lore-flavoured word bank.
> 13. **Second companion slot** — manage a pair in the Forge (delivers the avenue's existing "a second companion" seed).
> 14. ★ **Crew portrait** — compose operative + companion(s) into one shareable "crew of Checker Town" card.
> 15. ★ **Look-as-a-code** — encode the whole look into a short shareable/back-up string (guest-friendly, no backend).
> 16. **In-game cameo** — read the Forge look so your operative is the on-screen player token (Sky Run pilot, Dungeon hero, Siege hero).
> 17. **Theme sting** — pick a short chiptune that plays when your avatar appears (ties to Av5 audio; McPuppy-original).
> 18. ★ **Animated auras** — pulse / orbit / sparkle options for the aura ring (a cosmetic upgrade tier).
> 19. ⛁ **Operatives wall** — opt-in submit your operative to a curated "Operatives of Checker Town" gallery (Av7 UGC; hand-curated `_data` first, Supabase later).
> 20. ★ **Unified care + identity** — show the companion's live Den mood (hungry / happy / asleep) inside the Forge preview, and auto-generate screen-reader alt-text describing the built avatar.

**Av7 — UGC / creators:** Writers' Room featured-reels shelf (curated `_data/reels.yml` first) · Siege map
editor + share codes · "design a citizen" template → curated gallery · moderated fan-art gallery · headcanon
submissions → semi-canon (Codex) · trivia forge (→ Clearance deck) · board-skin uploader · monthly
featured-creator slot · remix-a-reel (fork a story) · embed/API (every embed is an advert).
> *Publish/share decision: ship the hand-curated shelf now; graduate to a Supabase gallery (likes/credits) when accounts land.*

**Av8 — Operative HQ** — deepening path (on top of the live [`/dossier/`](/dossier/)):
one HQ screen (rank/credits/streak) · fragment-recovery grid · mission clock · daily mission · live
transmission log · cast constellation (unlocks node-by-node from lore pages) · daily opening intel ·
clearance-gated modules · "what's new since you left" · backend-aware cross-device progress (accounts).

> **Dossier easter-egg tally** *(new note · Nate 2026-07-03):* broaden the dossier's 6-fragment recovery grid
> into a full **discoveries counter** — "N of M secrets found" — that credits *every* egg the operative trips,
> not just the origin fragments: the notation toasts (e4 · Nf3 · Qd5…), the Konami code, the hidden pages, the
> splash secret-star + planted sigils, the Shogi gate, the once-a-day piece-rain, etc. Needs a canonical egg
> registry (the `_pjcc/easter-eggs.md` catalog is the source of truth) keyed like the existing `frag_*`
> localStorage flags, surfaced on the dossier as a collectible progress stat — rarer eggs worth a bigger nod.
> A completionist thread that quietly rewards poking the edges. Ties to [[pjcc-profile-system]].
>
> **Key fragments → special access + an announcement** *(follow-on · Nate 2026-07-03):* not every egg is equal —
> **certain fragments are keys**, not just tally marks. Tripping one grants **special access** (a clearance-gated
> page, a Vault module, a cosmetic, a rank bump) *and* fires a **personalized announcement in the operative's own
> name** — *"OPERATIVE [codename] now has access to ████."* — as a toast on the spot and a permanent line in the
> dossier's transmission log. Pulls the codename from the live profile; rides the existing clearance ladder
> (DELTA · OMEGA) and the Vault-unlock pattern (flawless Notation Blitz → Blindfold). Makes a discovery feel
> *granted to you*, not merely counted. Ties to **Av13** (hidden portals) + [[pjcc-profile-system]].

**Av9 — Live ops / a heartbeat** *(features tied to real time, so the site feels alive):* a community
megabar ("build the bridge to Chess City") · seasonal reskins · a December advent · 24-hour tournaments ·
a "studio is open" indicator · episode-drop watch party · a daily world-state ticker · limited-time event
games · a global "first to clear" race · an anniversary beat (the crash + the dev-start date).

**Av10 — Funding & reach** — waiting on backend/payments:
cosmetic store, "adopt a shot" micro-patronage, server-verified founders count, welcome-email automation,
partner outreach. Fresh: producer-credit ladder (your name *in the cartoon*) · pay-it-forward passes ·
unlock-goals tied to deliverables (→ on-camera music session) · a living public credits crawl ·
name-your-price arcade bundle · sponsor the Game of the Week · the Chess City Passport (annual, stamped) ·
radical-transparency burn page · a "cover PJCC" creator kit · refundable merch pre-orders.

> **Expanded — the funding architecture (the durable layer that pays for the animation).** *Principle: fund a
> deliverable, never a vanity tier. Every dollar maps to a frame; every supporter owns a piece of the crawl.
> Trust-first (refundable, radically transparent). ★ = shippable now / mostly writing · ⛁ = needs backend + payments.*
>
> *Own the audience (the funnel):*
> - ★ **The Dispatch, two-tier** — keep the free newsletter; add a paid **Operative's Channel** (BTS, scripts, early
>   animatics, the render queue). The owned, un-algorithmed core; everything else points here.
> - ★ **Festivals & grants, in the open** — surface [`docs/festivals-and-grants.md`](docs/festivals-and-grants.md) as a
>   public "where we're applying / what we've won" board + a grant-match goal. Non-dilutive money first.
> - ⛁ **Academy site-license** — the strongest standalone business: classroom/school licensing of the Academy (Av3),
>   led by a quote-request page. A real second revenue leg, not a tip jar.
>
> *Patronage that gives you a piece of the cartoon:*
> - ⛁ **The Animator's Fund** — one transparent bar: "$X funds Episode 1's first 30 seconds." Wired to a real shot list.
> - ⛁ **Adopt-a-shot / own-a-cel** — back a specific shot; your codename rides that shot's credits + a digital cel cert.
> - ⛁ **Producer-credit ladder** — named tiers that literally print your name in the crawl (Backer → Associate → Executive Producer card).
> - ⛁ **The Founders' Ledger** — public, append-only, ranked by *join order, not amount* — so being #1–100 is the prize (no whales on top).
> - ★ **The living credits crawl** — a perpetual, embeddable public credits page that grows with every supporter (every embed is an advert).
>
> *Reach engines (each purchase markets the show):*
> - ⛁ **Pay-it-forward memberships** — buy a supporter membership for a stranger or a classroom; a wall of gifted seats.
> - ★ **Sponsor the Game of the Week** — a patron underwrites one week; a tasteful "brought to you by" card.
> - ⛁ **Name-your-price arcade bundle** — pay-what-you-want download (offline arcade + art pack); funds *and* spreads.
> - ⛁ **The Chess City Passport** — annual membership, stamped per season/episode; digital + physical, with a renewal ritual.
> - **Merch that markets itself** — the goal cards (Av14) + stationery (Av15) double as funding and walking ads (gold, characters, "follow the dog").
> - ★ **Referral reach tiers** — extend the existing credit-referral: refer N operatives → a real sticker/pin mailed (bridges to Av4 physical).
>
> *Trust as a feature:*
> - ★ **Radical-transparency burn page** — live, itemized: render minutes, software, hardware, what each dollar bought.
> - ⛁ **Refundable pre-orders** — episodes/merch pre-sold with a money-back promise (the trust *is* the pitch).
> - ⛁ **Deliverable-locked goals** — community goals that, when hit, fire a *real* event: a filmed studio session, a new
>   game, a Blender trailer. Goals buy outcomes, not status.
> - ⛁ **Server-verified founders count** — a true, tamper-proof "N founding operatives" badge (anti-vanity; replaces guesswork).
> - ★ **"Cover PJCC" creator kit** — a ready press/creator kit so streamers & YouTubers can feature it in one click.

**Av11 — Game recaps / real-chess coverage** *(new):* ride the real chess calendar — recap the upcoming
**World Championship** games in PJCC's voice (story + one key moment + one lesson) · replay the key
position on the shared board (reuses `pjcc-chess.js`) · link each recap to its Academy lesson · commentary
through a character (the Rival coaches, Argus explains) · recaps as a low-lift Dispatch beat during big
events · preview + predictions mini-game. *Mostly writing; keep it a template, not a tournament platform.*

**Av12 — 日本語 / Japanese learning.** Grow **The Reading Room** (the Leitner SRS engine, taught by **Kaede**).
Growth path: kanji-of-the-day (stroke-order + mnemonic) · stroke-order trace · decode-the-transmission (ARG) ·
bilingual ticker reader · site-wide furigana toggle · counters kata · listening booth (TTS) + speak-it · particle
puzzles · sentence-builder · JLPT N5 belt track · daily seeded lesson · Catch-the-Lion JP mode · radical lab ·
memory match · kana typing trainer · Shogi-Island visual-novel story mode · boss-gate quizzes ·
calligraphy relics · pitch-accent ear trainer · language passport (Dossier) · community translation board (UGC).
> **★ Character-voiced phrase decks (Nate, 2026-06-23).** Make the phrase/sentence cards **lines the cast would
> actually say**, so you learn Japanese *and* the characters at once: the **Checker Town Rival speaks like Bob
> Proctor** ("goals are 5% strategy, 95% mindset" → in JP), **Nate is headstrong** (brash, eager
> lines), the **Uncle** drops Neville-flavored aphorisms, **Annie** is brave-but-small, **Argus** is the dry smart
> one, etc. Kaede still teaches; the *voice* of each phrase is a character. **Add their portraits later** (a small
> headshot on the card, speaker name + romaji). Doubles as a stealth way to seed canon voice before the show. Start
> as a new "Voices of Checker Town / 町の声" deck, hand-written, picture slot optional.

**Av13 — Access puzzles / hidden portals:** gated areas you **unlock by
solving**, not clicking. A little entry rite per region — collect them like keys. **Meant to be a cool reveal
in the show** — the breadcrumbs are planted now (see Planted Seeds) so the moment feels foretold, not arbitrary.

> **More rites to add** *(the Shogi Island gate is already live; each new rite is a new region key):* the **chess-coordinate rite** (play the a- and c-files on a real board —
> reuse `pjcc-chess.js`) and the **musical rite** (tap A–C–C on a hidden keyboard) as alternate solves for this same
> gate · a **Sand Mine** depth-cipher · a **Chess City** permit-glyph · a **Checker Town** founding-rune · collect all
> region keys → a master door (the ARG's season-one payoff) · a one-time "first to open it" race (Av9 live-ops) ·
> hide the sigil in **game backgrounds, the news ticker, the Lore Codex, and art** so fans see it for months first.

**Av14 — Goal cards** *(new · physical · parked until after the launch flare):* a **pocket goal card** you keep
on you **à la Bob Proctor** — reach in, **touch it**, re-anchor the goal. *The touch is the trigger; the whole
design serves that ritual.* **The real problem it solves:** most people don't know what they want — or they do,
then **forget once they lose the path** for a while. The card is a physical anchor against forgetting.
- **Premium and intentional, not a download.** **High-end thick/heavy paper**, **gold** (yes, gold), with
  **different characters** on different cards. **Not printable from the site — on purpose** (the friction keeps it personal).
- **How you get one:** **buy** it, or **email and ask for a free one** (Patreon-funded). Or **make your own /
  use any token** — whatever works, *as long as the goal is clearly tied to touching it.*
- **Voice:** "**follow the dog**" + the Rival's line *"goals are 5% strategy, 95% mindset."* Ties to the
  moral/Neville center (assume the feeling), Av4 (physical) and Av10 (Patreon).
- **Status:** the `/goods/` showcase is up (the ritual is free today — any pocket token, no purchase). The
  physical *make* is parked well past the launch flare.

**Av15 — PJCC stationery** *(new · physical · parked until after the flare):* branded stationery with
**"follow the dog"** across the top. The "pocket/desk mindset" goods line alongside the goal cards.
**Status:** showcased on the `/goods/` **Merch** page; the physical *make* is parked post-flare.

**Av16 — PJCC VR** *(new · long-horizon · rides on the Godot/Blender 3D work):* the **Battle Room is *made* for
VR** — Ender's-Game zero-G chess where "the enemy's gate is down" becomes literal: you float in the arena and move
pieces with your hands. Later: stand inside **Checker Town**, walk the road to **Chess City**, play a board across
from the **Rival** in room-scale. **Why it's plausible, not a daydream:** the same Blender assets + Godot project
you're about to build export to **OpenXR** (Godot has first-class VR), so VR is a *mode* of the 3D game, not a
separate build. **Scope: far future** (post-flare, post-Godot-v1); a Quest build of one battle room is the
someday-milestone. Parked here mainly so the 3D pipeline is built **VR-aware from day one.**

**Av17 — The Gambit (the altar of sacrifice)** — *v1 is live at `/games/the-gambit/`* (offer credits + an owned
collectable; a **Courage meter** shows the real odds before you commit; guardrails: never real money, a daily cap,
a cooldown, a two-tap "no takebacks"). **v2 roadmap (from the brainstorm below):** the Uncle presiding · non-fungible
/ altar-only rewards + canon fragments · sacrificing the streak-flame / rank · hold-to-offer · the Monument · a
protected first offering · pay-it-forward.

> **Brainstorm expansion (2026-06-25):**
> - **Who keeps the altar — the Uncle.** Give the Gambit a face: the **Uncle** (Barbados, the show's
>   Neville / "assume the feeling" center, a dancer) presides — the altar becomes *spiritual trust made
>   playable*, not a slot machine. He never promises a prize; he asks what you're willing to lay down.
>   *(Alt: a masked "Croupier of Checker Town" if the Uncle should stay show-only.)*
> - **The reward is usually NOT more money — this is the anti-casino key.** Big, courageous offerings pay
>   out in **non-fungible** things you can't grind for profit: an **altar-only cosmetic** (a gold-scarred
>   board skin that silently says *"I gave up my best"*), a **canon fragment** (lore obtainable nowhere
>   else), or a temporary **blessing** buff (2× credits / a hint token). Safe little offerings return credits
>   ~break-even-or-worse. Net: you sacrifice for *meaning*, never for ROI — which is precisely why it isn't
>   gambling.
> - **Sacrifice more than money.** Let players lay down their **Daily streak flame**, a **leaderboard rank**,
>   a **recovered fragment**, or a **clearance rank** — the things that actually *hurt* to give. Courage is
>   measured by what it costs *you*, not by credit value.
> - **Transparent odds, shown before you commit.** A visible **Courage meter** displays the real shift as you
>   raise the offering — no hidden house edge. Seeing *"your best item → the odds lean hard your way"* is the
>   honest opposite of a casino's concealed math.
> - **The ritual is slow on purpose.** **Hold-to-offer** (not a click), a weighty confirmation, then a single
>   reflective line afterward — a Neville / "follow the dog" beat. The friction *is* the lesson: a decision,
>   not a reflex.
> - **The Monument — it remembers your courage, not your luck.** A quiet record of *the biggest thing you
>   ever laid down*, win or lose. You're honored for the **offering**, not the outcome.
> - **First offering is protected.** Your very first Gambit guarantees *something* (kind onboarding); after
>   that, real risk — including an honest *"you may get nothing."*
> - **It mirrors the show.** A gambit *is* a sacrifice for initiative — tie it to **Bill's Harry-Stamper
>   choice** (leaving Princess to save the family aboard): the altar can surface a **Bill fragment** as a
>   reward, so the mechanic and the story's emotional core rhyme. *(Academy tie-in: flash a real famous
>   **chess gambit** at the moment you offer — a stealth lesson in sacrificing material for the attack.)*
> - **Pay-it-forward altar (post-accounts).** A fraction of a big sacrifice can **seed a stranger's reward** —
>   your courage quietly lands in another player's lap. The most PJCC-moral version of the whole mechanic.

**Av18 — The Direct Line** *(new · Patreon perk · coming-soon page live at `/direct-line/`):* a paid/unlocked
channel to **write to Nate directly with suggestions**, with a **guaranteed response** — not a form reply, a
real one. **The hook:** if a suggestion is **already in the pipeline**, tell them, show them where it sits, and
**reward them** for landing on the same wavelength (credits · a goal card · a founding credit). Turns the usual
suggestion-box void into a relationship, and makes backers feel *heard* — the single best retention lever a
solo studio has. Ties to **Av10** (Patreon/funding). **Build
notes (post-billing):** gate behind a Patreon tier flag on the profile; a simple authenticated compose box →
email/inbox; a lightweight "matches an existing roadmap item" tag so the reward path is one click. Parked in
coming-soon until the payments layer is live.

**Av19 — Go-Live (launch readiness)** *(new · the active runway, started 2026-06-24).* The ordered path from
"in development" to "ready to show the world." Everything is staged so the **launch flare** is a switch-flip,
not a scramble.

- **Phase 1 — Content pass (the words).** Read every page; cut to bare minimum; fix typos; enforce canon.
  Tracked in [`CONTENT-CLEANUP.md`](CONTENT-CLEANUP.md) — **78 surfaces** (13 characters · 7 locations · 24
  evolution logs · 17 game pages · ~17 core pages + in-game copy). Canon cross-checks baked into that file
  (Auston=sister / Crockett=dog · Michael=Chess City rival, Robert=Checker Town rival · "The Dad" · Maxwell ·
  Matsu · ancillary cast · Princess never speaks · "follow the dog" + "5% strategy, 95% mindset" · no Pieces
  section · current game names · Clearance: DELTA = completed).
- **Phase 3 — Systems & QA.** Supabase/profile live end-to-end (cross-device sign-in · leaderboards posting ·
  Quartermaster credits · dossier). Cloudflare analytics firing. Mobile pass (icon nav · condensed header has
  no twitch · splash quads · games on touch). The full-site Japanese toggle. The ARG/portal rites (Shogi gate)
  still fire. Favicon / meta / Open-Graph for clean link-sharing.
- **Phase 4 — Funding rails (Patreon).** **Decision: reserve now, promote at the flare.** Claim the handle +
  stand up one honest "Founding Operative" tier so the site's "Patreon · coming soon"
  links (splash quad · Goods · Direct Line) resolve to a real page — but keep it **quiet**; don't hard-launch
  into 0 patrons with coming-soon perks. Once the URL exists, swap those links to point at it. Ties to **Av10**.
- **Phase 5 — The launch flare (the trigger).** The moment that earns traffic — the **Blender/Godot game demo**
  or the **pilot** beat. At the flare: promote the Patreon · flip the **Direct Line** live (the easiest day-one
  deliverable — just answering messages) · announce via the dispatch + mailing list · unpause the show-as-
  product slices. Ties to the Blender/Godot long-game and **Av10**.

### 🆕 Ten new Avenues (replenished 2026-07-01)

**Av20 — Operative field kit (onboarding)** *(new · low-lift):* a guided first run — hand a new visitor a codename,
one **protected** first Gambit, and a 3-stop mini-journey (a tactic, a decode, a belly rub) so they leave having
*done* something. Cuts bounce; turns a cold splash into a warm start. Ties to [[pjcc-profile-system]].

**Av21 — The Monument / Hall of Courage** *(new):* a public record of the **biggest sacrifices** laid on the
Gambit's altar (win or lose) beside the season champions — the values center made visible, honest social proof
that isn't a flex about luck. The anti-casino payoff: you're remembered for the offering, not the outcome.

**Av22 — Couch co-op / pass-and-play** *(new · no backend):* local two-player modes — Blindfold Duel, a Battle
Room hot-seat, a Notation race — for the family table. Zero servers, pure web; the most "gather round" thing on the site.

**Av23 — Accessibility pass** *(new · always-on):* colorblind-safe boards, full keyboard play, screen-reader
move-calls (the Blindfold audio mode already points here), captions on any voiced beat, reduced-motion honored
everywhere. Kid-safe *and* everyone-safe — and it doubles as classroom-ready.

**Av24 — The soundtrack lane** *(new · McPuppy's real craft):* the studio actually makes music — the first PJCC
theme recorded on **guitar + drums** drops to the dispatch on camera; a jukebox of stems; later, game music that
reacts to your run. The McPuppy (studio/music) half of the two-brand split, made loud. Ties to [[site-two-brand-split]].

**Av25 — Printable classroom packs** *(new):* bundle the Academy's worksheets, belt ladder, and certificates into
a free **teacher PDF kit** — the educators lane made downloadable and drop-in. Offline, standards-friendly, no login.
Ties to the PJCC Chess Academy.

**Av26 — The daily ritual hub** *(new):* one page that chains the day's small rituals — decode the **Dispatch**, lay
**one Gambit**, keep the **streak flame**, unseal a **fragment** — into a tight 3-minute loop. Turns scattered daily
features into a single habit. Respects [[declutter-north-star]].

**Av27 — Fan-art → canon pipeline** *(new):* a monthly "**the studio drew your idea**" — a Fan Wall submission
becomes a real in-world poster or goal-card character. Closes the loop between community and canon, and feeds the
Merch character rotation.

**Av28 — The pilot, playable** *(new · launch-flare candidate):* one scene from the pilot as an **interactive,
branching, voiced** beat — not a video, a thing you play. The show-as-product idea, but a game; a strong candidate
for the flare itself. Ties to [[blender-game-goal]].

**Av29 — Cross-device continuity** *(new):* QR hand-off between phone and desktop (the implicit-flow auth already
supports cross-device sign-in) — start a run on the couch, finish it at the desk. Small, and it makes the whole
site feel like one app.

**Av30 — THE DOORS** *(new 2026-07-09 · Nate: "that could be a wide opportunity to make a world… the 'doors'" →
"yes for sure do Number five"):* every entry point on the site becomes a **door in the world**, so navigation
stops being a menu and becomes walking around Checker Town. The first door is live: the PJCC-home Gauntlet card
re-skins in the current floor's accent + boss piece once a climb starts (shipped 9091eb8). Phases:
1. **Door language** — a tiny shared CSS/JS vocabulary (`.door`, accent var, glyph slot, locked/ajar/open states)
   so any card can become a door in one class.
2. **The game doors** — each game's card on /games/ wears its own door: the Sand Mine's timber brace, Siege's
   portcullis, the Reading Room's shoji frame, Shogi Island's torii. State reflects YOUR progress (dusty = never
   entered, warm light = played this week, trophy plate = a best on the board).
3. **The place doors** — location pages get doorways as heroes; characters get dossier-drawer "doors."
4. **Sound + hinge** — one soft door sound per family (wood, iron, paper); reduced-motion/no-sound safe.
5. **The locked ones** — slow-rolled content (hidden cast, Murphy's Law) shows as doors with no handles.
   People will try them. That's the point.

---

# 🏠 The PJCC Home Page — ideas

*The front page is the trailhead for all five threads (ship the show · own the audience · make them love
her · the arcade funnel · the one mystery). **Less is more** — each idea must earn its spot; prefer depth
and combination over new clutter. ★ = low-lift · ⛁ = wants backend.*

> **Nav — remaining pare-downs** *(the "The World" dropdown, context-aware nav, and icon-only mobile nav all shipped):*
> (1) **sticky mini-bar on scroll** — shrink to just the watermark + the ⌘K command palette;
> (2) ★ fold **Your Dossier** into a single operative avatar pill (already in the top bar) and drop the middle nav slot entirely.

**Hero / first impression**
1. ★ **Adaptive hero CTA** — first-timer sees "Meet Princess," a returning operative sees "Resume your dossier," mid-build sees "Today's mission."
2. **Hero animatic loop** — a 5–10s muted Blender/animatic clip behind the title (reduced-motion safe): the cheapest "this is real" signal.
3. ★ **Rotating logline** — A/B the tagline under the title (the logline · the creed "follow the dog" · the mystery hook).
4. **"Press play" hero** — a tap starts the first leitmotif or the 5-min audio-drama scene (Av5), so the world has a *sound* on arrival.

**The ticker (now slower + pausable)**
5. ★ **Clickable ticker items** — now that it pauses, deep-link each promo to its feature.
6. **Date-seeded ticker** — today's real dispatch headline + a rotating in-world rumor (hide an Av2 cipher in one item).
7. ★ **Color-coded lanes** — gold = in-world news, pink = studio promos, green = community beats ("OPERATIVE X just cleared The Gauntlet").
8. ⛁ **Live community beats** — pull the newest codename / top score from Supabase into the ticker so the site visibly breathes (Av9).
9. **"Breaking" flash** — when a feature ships, the ticker fires a one-time gold alert banner, then settles.

**Countdowns / time**
10. ★ **Premiere clock as centerpiece** — make the Episode-1 countdown bigger, with a progress bar from dev-start → premiere.
11. **Milestone confetti** — a one-time piece-burst when the dev clock crosses 100 / 365 / 500 days.
12. **A near-term clock** — a second countdown to the *next* concrete deliverable (episode beat, Album-of-the-Month, season close) so there's always a soon.
13. ★ **"Made in the open · Day N" badge** — shareable as a card (ties Av10 transparency).

**Princess & you (Av6)**
14. **Home-page Princess beat** — she trots to the hero on load, sits, wags (movement only, per canon).
15. ★ **Personalized greeting** — signed-in visitors see their Identity-Forge operative + companion ("Welcome back, <codename>").
16. **Companion mood pip** — a tiny care-state dot on the home page that links into the Companion Den.

**The arcade funnel (the business)**
17. ★ **Game of the Week spotlight** — one rotating featured card (doubles as the weekly bounty).
18. **"Continue where you left off"** — your last-played game + best, one tap to resume.
19. ★ **Mini leaderboard teaser** — top 3 this season + a "climb the board" CTA.
20. **Playable micro-demo** — one embedded Notation-Blitz round / one tactic right on the home page: hook before the click-through.

**Story / the one mystery (decode-as-you-play)**
22. **Fragments indicator** — a quiet N/6 origin-fragment meter that nudges toward the reveal without spoiling.
23. **"Character last seen" spotlight** — a rotating cast chip that deep-links to its Lore Codex entry.
24. ⛁ **Living front page** — the home subtly reskins by ARG season phase, so regulars feel the world advancing.

**Audience & funding (Av10)**
25. ★ **The dispatch capture** — one tasteful newsletter sign-up on the home page (the owned, un-algorithmed channel).
26. ★ **"Support the build" micro-card** — tied to the current deliverable goal (the Animator's Fund bar).

**Polish / structure**
27. ★ **North-star declutter** — collapse the stats bar to one elegant line; cut anything not serving the five threads.
28. **Seasonal reskin** — advent, the anniversary of the crash, premiere week (Av9 live-ops).
29. ~~**Fix the dead stat** — "Posts Written" is stale~~ *(RESOLVED 2026-07-12: no such stat exists any more — it went with an earlier stats-bar cut, and the blog is very much alive at `/blog/`, where `site.posts.size` is a live, correct count. This entry was the stale thing, not the site.)* **What's still worth doing:** the counters on `/projects/` are a chess-milestone and a premiere countdown — a genuinely live number like "Operatives enlisted" or "Games played this week" would be a better third.

---

# 👥 Characters & Locations — WOW-factor ideas

*The cast + the world are the show's soul. Make the pages **feel alive** so people fall for the world before a
frame renders (north-star thread #3). ★ = low-lift · ⛁ = wants backend · 🎬 = waits on the Blender/animation pipeline.*
**Canon updated 2026-06-23:** sister is now **Auston**, the dog is **Crockett**; **two rivals** — **Robert** (Checker
Town, Bob-Proctor mindset) and **Michael** (Chess City, truly righteous); **The Dad** (Family); best friend **Maxwell**;
**Matsu** (Kaede's brother); new **Ancillary** tier — **the Commentators** (3-in-1) and **the Prodigal Brothers**.

**Characters**
1. 🎬 **Living portraits** — each character's image is a short looping Blender idle render (breathing, a tail flick) instead of a flat jpg; the [walker is already the Notation-Blitz dog render](#) — extend that everywhere.
2. **Voice snippets** — tap a character for one signature line (Robert's mindset axiom, Michael's creed, Kaede's 「もう一回」); bridges to casting + leitmotifs (Av5).
3. ★ **Relationship web** — an interactive graph of the cast (family · rivals · crew · ancillary), clickable to each file; instantly shows the Auston/Crockett/Maxwell/Robert/Michael/Matsu structure.
4. ★ **First-appearance deep-links** — every card links to the exact game/scene a character shows up in (Kaede → Reading Room, Michael → Pirc, the booth → Battle Room).
5. ⛁ **Rank-gated dossiers** — a character's redacted secret only un-redacts at higher operative clearance (ties the profile rank ladder to lore).
6. **Per-character leitmotif, fully composed** — the theme plays on their page and *evolves by chapter* (Av5).
7. ★ **Two-truths-and-a-redaction** — a tiny dossier mini-game: spot the planted-false fact.
8. **Character spotlight** — a rotating "cast member of the week" on the hub + home page.
9. **Rival compare** — an interactive Robert-vs-Michael split (mindset vs righteousness) that frames the show's core question.
11. ⛁ **Headcanon → semi-canon** — curated fan submissions fold into character pages (Av7 UGC).
12. ★ **"Which PJCC character are you?"** — a shareable quiz that funnels into the cast pages.
13. ★ **Crew roster / family tree** — one visual: the Dad + Auston + narrator; Kaede + Matsu; Robert + the Prodigal Brothers; the crew dogs (Princess, Argus, Crockett).
14. **Evolution morph** — a slider on each page that fades concept-sketch → final art (pulls from the Evolution Log).
15. 🎬 **The funny "chase" walker** — *(Nate's idea)* a rare random variant where instead of Princess strolling alone, **you (the operator) chase her** across the bottom of the screen; later a fully-animated Princess. The walker is now her real render — animate it next.

**Locations**
16. ★ **Interactive World Map** — click the road Checker Town → the Sea → Shogi Island → Chess City; each node opens a location page (re-light the parked World Map).
17. 🎬 **Parallax location art** — scenes with depth layers that drift on scroll/tilt; a cheap "3D" before the real 3D.
18. ★ **Time-of-day states** — a location page shifts day/dusk/night like the Companion Den.
19. 🎬 **Walkable panoramas** — 360°/scroll-pan location views; the web precursor to the Godot/VR walk.
20. **Gate-locked locations** — Shogi Island's deeper pages open via the Av13 rite (you already built the gate).
21. ★ **Location ⇄ game links** — each place names its game (Checker Town → Notation, Sand Mines → Sand Mine Depths, Shogi Island → Shogi/Reading Room): the funnel, made explicit.
22. ⛁ **Living world-state** — locations reflect the news ticker / ARG (the "ferry delayed" beat literally shows on the Shogi Island page).
23. **Location soundscapes** — ambient loops (Checker Town hum, the Sea, the dojo) — Av5.
24. **The crash site** — a discoverable hidden location that pays off an ARG fragment (the origin).
25. ★ **Fog-of-war map** — places light up as you visit their pages/play their games (ties the Dossier world-map).
26. 🎬 **Blender flythroughs** — short rendered location intros as loading screens / season trailers.
27. **Checker Town Field Guide** — a printable art-book leave-behind (Av4 physical).
28. ⛁ **Journey tracker** — your operative's position on the road to Chess City, advancing with progress.
29. **Seasonal location reskins** — advent, the anniversary of the crash, premiere week (Av9 live-ops).
30. 🎬 **The Pieces gallery (moved here from Characters)** — the **six Blender board-pieces** (pawn/rook/bishop/knight/queen/king, each scaled to the Battle-Room concept, Princess = the knight). *Belongs in the **Evolution Log** as renders land* — show concept → grey-box → final per piece. Frame it as "the board itself is a place." (This is where the old `## Pieces` section now lives.)

---

## 🅿️ Parked (pulled from the live site, kept so the work isn't lost)

- **🐾 The player's OWN companion** *(2026-07-12 — Nate's call)*. Princess used to be **your**
  companion: a site-wide walker plus a "Princess & You" panel on her page (training XP, a bond
  meter, daily walks, memories). That was removed — **Princess is her own character, not the
  visitor's pet.** The idea that survives: **the player should get a companion of their own** —
  earned/chosen, with its own name and growth, so the bond is *theirs* and Princess stays a
  character in the story rather than a pet mechanic. All the machinery (XP curve, bond meter,
  walk loop, memory log) is worth reusing. **Restore the old code from git:** `pjcc-princess.js`,
  `pjcc-princess-companion.js`, the `.princess-walker` block in `style.scss`, the walker markup in
  `_layouts/default.html`, the gallery-visit script in `fan-art.md`, and the "Princess & You"
  section in `_characters/princess.md` — all as of the commit before this one.
- **🪞 Real vs. Rendered — the Mirror Protocol** *(2026-07-12 — Nate: "save RvR for later")*. The
  drag-divider slider on Princess's page comparing her 3D render against a photo of the real dog.
  Pulled off the character page for now, **not abandoned**. The reusable `.img-compare` component
  went with it. Natural future home: an **"Day 1 vs Now" evolution comparison** (already proposed in
  `_pjcc/flair-log.md` #32), or the Blender/production build-log. **Restore from git:** the
  `.img-compare` + `.rvr-*` blocks in `assets/css/style.scss` and the `rvr-section` markup + slider
  script in `_characters/princess.md`, as of the commit before this one.
- **The Daily Dispatch** *(pulled 2026-07-06)* — the daily word-drop game at `/daily/` (Wordle-style seeded
  drop, shared daily board, dispatch streak, share card). Page deleted + every link stripped (nav dropdown,
  mobile quick-nav → now Academy, PJCC-home card, dossier quick-launch, ⌘K palette, JP dict). The
  `daily-dispatch` Supabase scores persist and the credit weight stays in `pjcc-profile.js`, so history still
  counts toward Overall. **Restore = resurrect `daily.md` + links from git.** Re-imagine later inside
  **Av26 (the daily ritual hub)** — one 3-minute daily loop instead of scattered dailies.
- **The Pilot page — REMOVED ENTIRELY** *(2026-07-07; Nate: "let me build some stuff first — it's too busy
  for the nothing I've created so far")*. `production.md` deleted; links stripped from the nav dropdown,
  dossier quick-launch, ⌘K palette, JP dict, and the mailing-list "tracker" link.
  **Restore the whole page (or any piece) from git.** It held, in its final form:
  the hero, the Writers' Room CTA, the **pilot animatic** ("Fell From the Sky" — 8 shots, scratch VO,
  leitmotif temp score, per-shot notes with pinned director comments), and the **production tracker**
  (Pilot + Ch.1). Earlier pulls (2026-07-06), all also in git:
  - **Fund the Frame** — the funding plate under the tracker ("you're moving the needle").
  - **Frame the Scene** — the two-take art-direction polls: the opening-shot poll and **Princess's color key**
    (warm-violet vs cool-slate); local votes + seeded tallies; a live community tally was the planned upgrade.
  - **Open the Booth** — community voice auditions (coming-soon block; "first up, Auston the Bomber").
  - **Chapters 2 & 3 tracker rows** — "Ch.2 — First Move" / "Ch.3 — The Journey" (Script 15% / 5%).
  - **The Living Style Bible** — the Character-Sheets / Locations art-bible cards.
  - **The dispatch footer line** — "the dispatch sends a note each time a bar moves."
- **The Writers' Room — REMOVED ENTIRELY** *(2026-07-07; "maybe we'll do it later")*. `writers-room.md`
  deleted (it had already been orphaned by the Pilot-page removal — the Pilot page was its only doorway).
  It held the full story-boarding studio: Harmon Story Circle + Parker but/therefore editors, the SVG circle,
  "and then" detection, the 16:9 preview reel with leitmotif temp score, publish-to-URL share codes
  (no backend — story baked into the `#s=` hash), local drafts, and two worked examples ("Fell From the Sky",
  "Auston's Fuse"). **Restore the whole page from git**; old published `#s=` links only work again once it's back.
  Fits **Av7 (UGC/creators)** when it returns.
- **Fan-art card extras** *(pulled 2026-07-07; **The Wall itself came back the same day** — the /fan-art/
  gallery + `_data/fanart.yml` are live again, with a one-line "send it in" note)*. Still parked: the card's
  **"Thank you!" block** + the sign-it name row (with its operative-codename prefill), the old **two-button
  submit block**, and the Direct-Line "Comment on Fan Art" lowest-tier perk. **Restore any piece from git.**
  A real in-browser submission flow needs moderation + storage (Supabase) — design before building.
- **Clearance: DELTA — the Daily exam** *(pulled 2026-07-06 with v1.5's intro-screen rework)* — the seeded
  10-question shared daily mode. The "daily briefing" idea above stays the future form.
- **Siege — the Daily mutator-roulette** *(pulled 2026-07-07 with v2.4; "maybe down the road")* — the 📅 Daily
  Siege card: one fixed day-seed for everyone (seeded map + 1–2 roulette mutators), its own global board
  (`siege-daily`, delisted from the leaderboards page; Supabase data persists). Restore from git before v2.4.
- **Games-page search box** and **sort dropdown** — re-add if the library outgrows one screen.
- **De-linked nav pages** (revisit with real content): World Map, Sound, Soundtrack, Press Kit, Lore Codex,
  Evolution Log. **Podcast** removed (a "Coming Winter 2026" teaser sits on the homepage). **Chess Lessons** folded into About.
- **Cursor sheen** — discarded (washed out text). *Re-use idea: a single spotlight on the featured box, or a cursor-swept hidden-text reveal.*
- **Homepage Story Arc film-strip** — now decode-as-you-play (see Seeds).
- **Site-wide Princess speech** — removed; movement-only (talk ideas live in Av6).
- **The "Creator" bio** — replaced with the mysterious "Operator."
- **The Build Playlist jukebox** — removed entirely; *re-use: original PJCC chiptune over Spotify embeds.*
- **⚙ Perf — don't load `pjcc-profile.js` on content pages** *(deferred 2026-07-12; the SAFE half of #15 already
  shipped)*. The Supabase SDK (~100KB) is already **idle-deferred off the critical path site-wide**, and the nav
  pill renders instantly from cached `pjcc.codename`/`pjcc.avataremoji`. The *remaining* step is to skip loading
  the profile script **entirely** on pages that never need accounts (character bios, `/style/`, blog posts). **Why
  it's parked:** that script is also the **auth backbone** (session-keep-alive + magic-link callback catch), it's
  **go-live-critical**, and real Supabase sign-in **can't be tested locally** — so a mistake could silently break
  login. **Priority: LOW** — the felt win is already banked; the leftover is a download saving that matters only at
  traffic we don't have yet, cached after first visit anyway. **Do it only inside a dedicated auth/perf pass where a
  live login (phone + desktop) is tested right after** — never casually. Ties to [[pjcc-profile-system]], [[go-live-push]].

---

## 🛠️ The long game (bigger bets, mostly not web code)
- **The Godot roguelite** — a Binding-of-Isaac game from the Blender assets; start with ONE web-exported
  room wired to the leaderboard, then layer rooms → items → floors. Princess Dungeon is its web prototype
  (build plan above).
- **The Battle Room → deck it out** *(building on the web v0.1):* **P1** juice the web build (sound, attack animations,
  finishers, commentator voices, difficulty rungs) → **P2** Godot port (reuse the engine; the flip becomes
  a true camera cut) → **P3** Blender (piece-combatants, capture/finisher anims, the commentators; intro
  cutscenes) → **P4** WOW (combos, signature finishers, a crowd, shareable replays). Same engine as The
  Gauntlet, so the chess stays honest.
  > **The Battle Room — north star (Nate, 2026-06-23).** Inspired by **Ender's Game** *and* the SF short story
  > in *Masterpieces* — the **downed plane**, a general and his men (and family) forced to **play the match as the
  > chess pieces themselves**, lives on the line. That life-or-death, you-are-the-piece weight is the feeling to
  > chase. **The flagship for the "view-switch" signature:** a clean chess board read **always visible on the side**
  > (you never lose the game state), while the **main stage cuts to the action view** for each capture/finish; *later,
  > an overlay when the view switches* (mini-board floats in). **The build arc Nate wants to see:** **JS → Blender/
  > Godot → VR** — the web build proves the loop, Godot makes the flip a real camera cut, Blender gives the pieces
  > bodies and finishers, and in VR (Av16) you stand in the arena Ender's-Game-style ("the enemy's gate is down").
  > **Next concrete step on the web v0.1:** dock a persistent side board next to the action arena (board-on-side),
  > then a "VHS cut" transition between board-view and action-view.
- **Blender cutscene intros** — short rendered clips as intros / loading screens / season trailers. *(Saved favorite.)*
- **Backend (Supabase)** — unlocks the cross-cutting features: guilds/houses, async duels, the Writers'
  Room gallery, shared tallies, the cosmetics store.
- **📱 The PJCC app — the LAUNCH** *(the PWA is built; only the launch is future)*. It ships **private by
  default**: `ENABLED = false` in [`assets/js/pwa-register.js`](assets/js/pwa-register.js) means the public
  gets **nothing** — no manifest, no service worker, no install prompt. Nate designs it privately with
  **`?pwa=on`** on any page (his browser only; **`?pwa=off`** tears it back down). Deferred **~a year** by
  his own call (2026-07-12). Three staged steps, in order:
  - **Step 1 — flip it public.** Literally one line (`ENABLED = true`). The site becomes installable for
    everyone: home-screen icon, full-screen launch (no browser bars), offline play, the install bar.
    **Nate's call alone** — never flip this without him asking.
  - **Step 2 — Google Play (do Android FIRST).** $25 one-time + an ID-verified developer account. Wrap the
    PWA as a **TWA via Bubblewrap** — **buildable from Windows**, no Mac needed. Needs
    `/.well-known/assetlinks.json` on the site. Watch out: new *personal* Play accounts must run a
    ~20-tester / 14-day closed test before they can publish to production.
  - **Step 3 — Apple App Store (the hard one).** $99/yr + a **Capacitor** wrap, and **Mac access for Xcode —
    the real blocker, since Nate is on Windows** (a cloud-Mac build service is the workaround). Apple
    guideline **4.2 rejects thin website wrappers**, so the *games* must be the app's spine. If phone/social
    login stays, Apple also requires Sign in with Apple + in-app account deletion.
  - **Grander-PWA polish while it's still private:** iOS splash screens (`apple-touch-startup-image`) ·
    richer offline precache · an "Install" entry point in the nav/footer · settle `start_url`
    (`/pjcc/` today vs `/games/`) · settle the icon (gold crown today vs the McPuppy paw).

## My honest read — if you only chase three
1. **Av1 + Av5's audio drama** — together they *ship the story* before animation can. The main quest.
2. **Av10 (newsletter + Patreon)** — the owned, durable funding layer.
3. **Av6 (Princess companion)** — the cheapest emotional stickiness; most likely to make people *love* the brand.

*Honorable mention: Av3 (Academy) is the strongest standalone business but a real second job; Av2 (ARG)
is the superfan ceiling but a cadence trap — start it only when #1 is humming.*

---

## 🌱 Planted Seeds (quiet set-ups now → earned payoffs later)
- **Princess can learn anything** → *she rises to Queen.* Her defining hook (chess is just the first thing);
  the in-world reason the learning games exist. Foreshadow with "another square forward"; don't spoil the promotion.
- **The score is played by hand** → *Nate on guitar & drums.* Seeded on `/sound/`; payoff: filmed studio sessions.
- **"Made in the open"** → *the pilot pre-sold.* An audience that already feels like co-producers.
- **Subject Zero / the crash** → *the origin reveal* (via ARG fragments + Lore Codex).
- **Bill is quietly the most capable in the room** → *the origin turn* (he can teach Princess anything; the heartbreak of leaving her).
- **The big brother who became a father** → *the emotional core* (the journey is for his little sister, Annie).
- **"Chess City Leafs"** (news ticker) → *the Auston Matthews nod.*
- **The story, told in fragments** → *decode-as-you-play* (chapter beats are uncovered, not handed over).
- **A heart you can feel** → *the show's moral center:* good values + quiet, Neville-Goddard-flavored
  positivity + Nate's real stories. Warm, hopeful, never cynical.
- **Kaede's locked second shelf** → *a language no one can read* (Av12 decode-the-transmission → the Construction Co. origin).
- **"Follow the dog"** → *the brand creed.* On stationery, goal cards, and in tone. Payoff: one simple,
  repeatable line that holds the whole ethos — trust the journey; Princess leads.
- **The Shogi Island portal** ("*one A and eight c's*," **first two oversized, last one small** — incantation `A · C C c c c c c c`) → *a signature show reveal.*
  **The gate is live (Av13)** — the rite opens it with a cinematic. The motif is now a real,
  reusable sigil (`.pjcc-sigil`, sizes `.big`/`.sm`); **keep seeding it** as a recurring glyph — hide the **A + eight c's (first two large, last small)** in
  more game backgrounds, the **news ticker**, the **Lore Codex**, and art (started: the Shogi Island dock + the Dead
  Drop dockmaster's log). Payoff: when the portal opens on screen, longtime fans gasp because they've been *seeing* it
  for months without knowing. (Diegetic unlock = Av13; the cipher = Av2.)
- *Seeds to plant next: a recurring object/motif across games + show; a line that only lands after the origin; a background character who matters later.*

---

## 🛠️ Day Job Ideas (raw mid-shift captures — develop later)
*(Nate represents Pontiac, MI; cast/story canon lives in the next section.)*
1. **Podcast intro — ask Dan** (his manager). Also pin down what the podcast actually is.
2. **Mega Man II–flavored Games Page** — *Mega Man II* is his all-time favorite. A themeable 8-bit skin
   + one **original PJCC chiptune** (McPuppy) — a self-contained slice, and the first original music on the site.
3. **The Tortoise mindset** — *not* "slow and steady," but the tortoise's inner state: calm, certain —
   *"I know what I'm doing while everyone else is all over the place."* A brand value (fits the Neville tone).
4. **Workplace negativity, observed** — some coworkers were *infected* by others' negativity; some *flipped
   positive* on good vibes. Lived proof of why the show leans into positivity; possible story material.
5. **McPuppy "Album of the Month"** — one recommended album a month; a low-lift beat that takes pressure
   off blog posts (pairs with the Game-Recaps cadence). The chosen jukebox replacement.
6. **Bottling tears to mourn** — real root: **lachrymatory / "tear bottles"** (Victorian grief keepsakes;
   Psalm 56:8). PJCC motif: a character who bottles tears to mourn — the bottled tears could *matter* later.
7. **"Beauty is only glamour until you physically age"** — surface beauty is a spell that time dissolves;
   substance over surface. A vain-villain beat or a wisdom line.
8. **"Believe in belief"** — a compact creed for the Neville spine; candidate tagline / the Uncle's mantra.
9. **Exit 37 — animate it** — driving into Exit 37 with no guide (phone cord broken) — faith/visualization
   over directions. Trademark 2D→drive-sequence; ties to the cord story (#11).
10. **The "Who's a happy dog?" gag** — looking at a dog photo and saying *"Who's a happy dog?"*; someone on
    the other side of the wall answers *"I'm a happy dog,"* and they bond. A warm recurring bit (great for shorts).
11. **Patreon — writing collaboration** — backers pitch; if Nate likes it he uses it and credits them.
    Crucial: **episodes 1–3/4 are credited to Nate only** — sole authorship first makes the later collab more appealing.
12. **The cord that saved the day** *(true story → manifestation material)* — the phone cord died when he
    needed the NJ dog camp; he found it by visualization, felt dumb telling a friend, got stranded — and the
    dead cord he'd refused to replace ended up saving the day. A real-life parable for "assume it, trust it."

---

## ✍️ Series canon & cast (writing notes — not site features)

**The cast**
- **Princess** — the heart. *Can learn anything* (chess first); loyal, curious. **Arc (spoiler — build
  toward, don't reveal):** grows into a formidable player and **promotes to Queen.** ~6 years old (PJCC the
  project is ~6 months old).
- **Nate** (the main character) — late teens, Checker Town, big dreams. Became a **second father**
  to his younger sister after their dad was often away.
- **Auston — the younger sister** *(locked 2026-06-23; piece → **rook**, shogi role reworked 2026-06-30)* — the
  story's **emotional crux**; brave beyond her size; plays a **rook**; the Shogi dojo's **first student** — she does
  *not* teach it (**Kaede** leads the dojo, her brother **Matsu** helping); she's just the one who never leaves the board;
  the one he's really doing it all for. *(The "Chess City Leafs" / Auston-Matthews nod is now her name.)*
- **Crockett — a real male dog** *(locked 2026-06-23)* (Nate's dog; their greeting is "**bellies**") — comic-relief
  crew member, plays a pawn, *not* the sister.
- **Argus** — **the smart one**; a dog; slowly grows into a **solid** chess player.
- **The Dad** *(renamed from "The Father"/Andrew, 2026-06-23; role: Family)* — **simple, silly, and absent-minded on
  the surface, but razor-sharp in his own lane**, and **whatever happens, he does what he can for his kids.** Also
  the show's **loving skeptic:** proud of the Uncle, but **dismisses Neville's "belief in himself" as the reason for
  his success.** (His scattered-but-devoted warmth is *his* — distinct from Bill's rugged-hero arc below.)
- **The Uncle** — from **Barbados** (Neville Goddard's real birthplace), a **dancer in Chess City** (Neville
  was a dancer before a mystic). Embodies the show's **Neville-Goddard spirituality.** His tension with the
  Dad *is* the show's spiritual debate, in one family.
- **Two rivals, both side characters** *(locked 2026-06-23):*
  - **Michael — the Chess City rival** — **acts as God would, always**: the **truly righteous** moral compass
    ("Who is like God?"; pairs with the king piece). Teaches Princess the Pirc; family in Chess City.
  - **Robert — the Checker Town rival** — speaks like **Bob Proctor**; all **mindset/manifestation**. *His line:*
    "goals are 5% strategy, 95% mindset." The *mindset* foil to Michael's *moral* one.
- **The Prodigal Brothers** *(ancillary)* — **Robert's two younger brothers**, the show's **prodigal sons**: took the
  swagger, skipped the substance, and (eventually) find the road home. Even they have redeeming qualities — perhaps
  they **save one of the dogs.** *(Supersedes the old "Rival's two friends / James & John" note.)*
- **Maxwell — the best friend** *(named 2026-06-23)* — the pull of staying put; drifts into **Michael's** orbit.
- **Matsu (松) — Kaede's younger brother** *(new, ancillary, 2026-06-23; de-foxed → human 2026-06-30)* — **stayed on
  Shogi Island** (only Kaede took the Checker Town exchange); the evergreen pine to Kaede's seasonal maple; **Kaede's helper** in the Japanese teaching, anchoring the island and its deeper rites.
- **The Commentators** *(ancillary — Boomer/Tempo/Sunny, one trio)* — the booth that calls events, the Battle Room,
  and later the Gauntlet; the in-world hype machine.
- **The older brother** — **self-righteous**, and things don't work out for him. *Name — pick one:* **Saul**
  (tragic self-righteous fall; rec) · Cain (the literal elder brother; starkest) · Esau (loses his birthright) ·
  Korah (self-righteous revolt). **Redemption thread:** *especially* he might be **the one who saves a dog.**
- **Bill** — Princess' former crew partner (*not* Nate's dad). A **Bruce-Willis-in-*Armageddon*
  type:** rugged, blue-collar, gruff-but-golden-hearted — the hands-on guy who can **rig or fix anything** and
  who **taught Princess to do anything** (incl. the Hyperspeed Box). A father to his **own** kids; when the Box
  runs astray, his **Harry-Stamper sacrifice** is leaving Princess behind to save the family aboard — the
  choice that shatters him. *(Hook: maybe he comes back for her.)*
- **Season 2 villain — the rival teen** — works for the dog-stealing gang (returns the dog, collects the
  ransom); later learns what the gang really does, turns, and joins Nate. (Antagonist → ally.)

**Theme to mine:** the **Rival is *truly* righteous** (acts as God) while the **older brother is
*self*-righteous** and falls — true vs. counterfeit righteousness, side by side in one family.

**Origin story.** The **Intergalactic Cup** was set for this planet, so a **construction crew of ships**
flew out to build for it — and **crashed**, leaving **Princess and all the checker & chess pieces** (why
they "fell from the sky" over Checker Town). Bill & Princess were paired on the crew and bonded — tell it
as a **montage** where Bill teaches Princess *anything*. The turn: the **Hyperspeed Box runs astray**; Bill
must protect his family aboard and is forced to **leave Princess behind** — a choice that shatters him.
Hook: *maybe he comes back looking for her.*

**▶ Chapter Zero — build it** *(new 2026-06-30).* Actually **make** the **Backstory** chapter: chapter **0**,
the "**B**" dot that opens every character timeline and the one the Lore Codex still keeps half-classified. It's
the origin told straight — the **Intergalactic Cup**, the **construction-crew crash**, the **pieces falling over
Checker Town**, **Bill & Princess** paired and bonding, the **Hyperspeed Box** turn that leaves her behind. Give it a
real telling — an animatic / short / "issue #0" comic — instead of only leaking it through fragments; it's the
emotional + mystery keystone the whole decode-as-you-play arc points back to. *(Princess, Nate, Auston, and
Argus already carry `chapters: 0`.)*

**Open decisions (waiting on Nate):** lock the **older brother's** name (Saul rec); name **Robert's two Prodigal
Brothers** and the **Commentators** are placeholders (Boomer/Tempo/Sunny) — confirm or rename.

**New seeds (2026-06-24 — Nate's quick notes, to develop):**
- **The best friend lives in a potato.** Reads as **Maxwell's** home — a snug spud in Checker Town. Dead-on for
  "the pull of staying put" (who'd leave a cozy potato?). Works as a recurring sight-gag location — a little door
  in a potato — and a warm, lumpy visual foil to Chess City's polish. *(Open: literally Maxwell, or a new pal?)*
- **Chess City is inhabited by evil chess pieces (a belief).** *(new 2026-06-25)* There's a belief among some — the
  wary and the burned — that Chess City is **not** the promised land but a place of **evil chess pieces with mouths
  and eyes**, watching from behind the gates. Most call it the bitterness of those who never crossed the sea. It's the
  **pessimist's worldview**, and it's the spine of a new game (below). Seeded into the [Chess City](/locations/chess-city/) file ("The Whisper").
- **Gerald "Jerry" Murphy — the pessimist brother.** *(new 2026-06-25)* A brother whose family name nods to **Murphy's Law**
  — whatever can go wrong, will. Where the Uncle carries Neville's belief and Robert carries Proctor's mindset, **Jerry is the doom-sayer**:
  he's *certain* the chess pieces are evil and out to get him — and in **his** game, he's right. Playable lead of
  **"Murphy's Law"** (the Mega-Man-style scroller), tagline *"The pessimist was right."* The comedy/heart: his dread
  is vindicated on-screen yet the world around him stays warm — a foil to the show's Neville-Goddard optimism.
- **You get tagged upon entry to Chess City.** A worldbuilding beat: cross into Chess City and you're **tagged** —
  badged, logged, marked at the gate. Gives the city a controlled, bureaucratic edge against cozy Checker Town,
  and quietly **explains the site's own onboarding** (you arrive → you're issued a codename / dossier / clearance —
  the dossier). Ripe for Princess's arc: the one who's tagged like everyone else **rises to Queen** — and could
  rewrite the tagging system. *(Open: who's "I" — Nate, or Princess?)*

**Story ideas (2026-07-07 — Nate):**
- **"Single File — Cover Your Tracks."** Auston and Nate are stuck out in the sands, and Nate suspects
  they're being followed. He's carrying a pair of **Dad's work boots** — so they walk out **single file**,
  Nate coming last and stamping the boot-prints over their trail, so anyone reading the sand sees **one
  lone mine worker** heading home instead of two kids. Dad's absence literally covers for his kids for once.
  Quiet-thriller beat that uses the Sand Mines' corporate-surveillance edge; Nate goes last so Auston never
  sees how scared he is.
- **The telescope — first sight of Chess City.** Nate discovers (or MacGyvers) a telescope, and for the
  first time actually **sees** Chess City across the Sea — the dream stops being a rumor and becomes a real,
  visible place. The build is real (vetted): **two lenses and a tube** — a big, weak lens up front (the
  objective), a small, strong lens at the eye; nest two tubes and slide them to focus. Wreckage version: a
  spectacle lens + a jeweler's loupe in a rolled sheet of *Checker Financial*. Canon-perfect physics detail:
  a simple two-lens telescope shows everything **upside down** — Nate's first-ever view of Chess City is
  inverted. ("It's upside down." / "Then we'll flip it when we get there.")

**Parked (2026-07-08):** PJCC-home idea #3 — **tap-a-headline dispatches:** tap any ticker item and a
two-line "full story" card unfolds beneath the ticker; the lore drips out through the news desk.
(Nate: "for a later date." The ticker now exposes `PJCCTicker.add()` — the card layer slots in cleanly.)

**Parked (2026-07-08):** PJCC-home idea #12 — **Postcard from the road:** a rotating polaroid of one
location with a handwritten one-liner on the back, linking to its page. (Nate: "for a later date.")
