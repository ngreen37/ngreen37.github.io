# PJCC — Future Ideas

A running backlog of ideas raised across build sessions. **Shipped** work is logged at the top;
everything below it is still open. (Loose side-notes to wire someday: mailing-list ↔ Resend sync,
referrals.)

---

## ✅ Shipped log (newest first)

**2026-06-20/21 — the big batch**
- **Notation Blitz → v3.7** — Daily seeded chart + global timing-accuracy board (v3.5); Freestyle
  rubber-band BPM, files/ranks Warmup, mid-run Perks (v3.6); Recall "name-the-square" keypad mode
  + 2-Hand dual-lane mode (v3.7).
- **Siege on Chess City → v2.1** — tower synergies (Knight+Queen haste · Bishop+Rook pierce) +
  a Daily mutator-roulette on a fixed seed with its own global board.
- **Blindfold Puzzles → v2.2** — Audio-only mode (position spoken + a coach mnemonic); The Mind's
  Eye now voice-narrates each move.
- **Lore Codex** (`/lore-codex/`) — collectible encyclopedia; entries unseal from reading
  character/location files + recovering `frag_` fragments; all six unlock the origin. Plus
  game-card → lore deep-link chips on the Games page.
- **Checker Town Chess Academy** (`/academy/`) — character-led courses, adaptive "your next
  lesson," belt ladder (Checker → Chess City Citizen), printable worksheet / teacher sheet /
  certificate. Fully offline, kid-safe.
- **Projects page** — live playable / completed / in-the-lab stat counters; earlier games-page
  polish (Daily tab + badges, Game-of-the-Week hero).
- **Avenue 1 — production as content** (`/production/`) — full build-out: an interactive **Pilot
  Animatic** (scene-by-scene storyboard reel, scratch-VO subtitles, per-shot temp-score leitmotifs,
  filmstrip jump, per-shot comments), pipeline tracker, Frame-the-Scene poll, living-style-bible
  links. Casting booth (#4) staged as **Coming Soon**.
- **Avenue 5 — character leitmotifs** (`assets/js/pjcc-leitmotif.js`) — deterministic Web-Audio
  signature per character, a "♪ theme" button on every character page.
- **Avenue 6 — Princess companion** (`assets/js/pjcc-princess.js`) — Train Princess (ranks from
  your play), a daily Walk ritual, and Memory of your milestones, on her character page.
- **Avenue 10 — Chess City Press Pass** (`/press-pass/`) — 3-tier support pitch, cosmetics-only
  promise, founders-list CTA (no payment wired yet).

**Earlier** — Daily Dispatch (`/daily/`), Hall of Fame, cross-game streak flame, "beat the
creator" ghosts, leaderboard seasons; verified-chess passes (Shogi tsume + AI, Pirc traps);
board-skins foundation + JP-localization mechanism.

---

## 🔜 Active backlog — buildable next (no new infrastructure)

**Story / world**
- **"Find Princess" ARG / mystery door** — a hidden hub unlocked by collecting the `frag_`
  fragments site-wide, leading to a career-portfolio of art styles/mediums. (The Codex already
  does a light version of the fragment payoff; this is the dedicated destination.)

**Per-game round-3 (still open)**
- **Fork in the Road** — endless one-life depth gauntlet · a "show the refutation" coach.
- **Sand Mine Depths** — droppable light beacons · fog-of-war minimap · timed cave-in chains ·
  Louie-camp one-run consumables · deep relic sets.
- **The Pirc Protocol** — transposition tree · "name that opening" reverse · opponent
  personalities · weekly model game · colour side-switcher.
- **Clearance: DELTA** — redacted-dossier meta · sudden-death OMEGA · audio-intercept questions ·
  wager mode · curated community questions.
- **Shogi Island** — piece-reach trainer · scaling handicaps vs the Lion · calligraphy wall ·
  tsume-of-the-day board · castle drills.
- **Siege** — narrative campaign map with branching routes + between-battle dialogue · path-map
  level editor with shareable codes.
- **Blindfold / Mind's Eye** — rebuild-the-board recall · piece-count ladders (2 → full) ·
  shareable replay export · blunder-review (flags eval swings) · cosmetic boards unlocked by wins.

**Deepening what already shipped**
- **Projects** — a public roadmap / "What's next" page (read-only is easy; voting needs a backend).
- **Academy** — tune lesson thresholds with real data · more courses (a strategy track, a shogi
  track) · a multi-page printable worksheet packet · a branching skill-tree (prereqs/unlocks).
- **Leitmotifs** — a showcase strip to hear every character's theme in one place.
- **Princess** — promote her to a *floating site-wide* companion; holiday / episode-drop lines.
- **Production** — the clickable **pilot animatic reel** scaffold (drop in boards + scratch VO later).

**Audio / cosmetics**
- A PJCC original track for the jukebox + a per-game SFX toggle.

---

## 🧩 Needs infrastructure (backend / payments / moderation)
- **Guilds / Houses** — factions + team leaderboards (Supabase tables).
- **Async duels** — challenge another operative to the same seeded puzzle; winner takes a credit pot.
- **Per-game shareable result cards** — a game-over share image (client-side gen is doable; the
  open part is hosting/sharing).
- **Ethical premium currency + Press Pass payment** — cosmetics-only store on the credits system.
- **UGC** (Avenue 7) — level-editor sharing, "design a citizen," curated fan-art gallery, embed/API.
- **AI-native** (Avenue 8) — in-character cast chat, a dossier analyst, the Argus blunder-coach.
- **Live ops** (Avenue 9) — seasonal reskins, a community megabar, tournament / watch-party sync.

---

## 🎬 The show & the studio (content / business — mostly not code)
- **Audio drama / original score & EP** (Avenue 5) — ship the story in audio first; release themes.
- **Blender cutscene intros** — short rendered clips as game intros / loading screens / season
  trailers. *(Saved favorite.)*
- **The Godot game** — a Binding of Isaac-style roguelite / 3D Space Run from the existing Blender
  assets (rigged Princess, chess pieces, the battle-room concept). Start with ONE playable battle
  room exported to HTML5, embedded on the games page and wired to the same Supabase profile /
  leaderboard; then layer rooms + items + procedural floors. Blender (assets) + Godot 4 (engine).
- **Physical / tabletop** (Avenue 4) — a PJCC chess set, print-and-play Siege / Sand-Mine, rank
  pins, the Operative Field Kit (cipher wheel), the Checker Town Field Guide art book.
- **Funding & reach** (Avenue 10) — a newsletter-first engine, grants & festivals, partnerships.

---

## ✍️ Series canon & story seeds (writing notes — not site features)
*Captured verbatim-ish from Nate.*

- **Bill (the Dad).** Simple, silly, and absent-minded on the surface — but in *his* lane he's
  incredibly sharp, and no matter what, he does everything he can for his kids. (The comic-relief
  dad who turns out to be quietly the most capable person in the room when it counts.)
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

---

# 📚 Reference — Ten Avenues for PJCC (the strategic menu, filed 2026-06-17)

*A deliberately wide map of where PJCC could go: ten directions, five ideas each, with an honest
**Realistic take** and a **Best case**. A menu, not a to-do list — ranked picks at the end.
(Avenues 1, 3, 5, 6, and 10 now have shipped pieces; see the Shipped log above.)*



## Avenue 2 — Turn the spy meta-layer into a real, season-long ARG
You've already built ~80% of the scaffolding — Agent 0091, transmissions, fragments, Konami/morse
eggs, the "INTERPLANETARY CONSTRUCTION CO." signal, Subject Zero. Make it a *collaborative,
time-gated mystery* that pays off the lore.
1. **A cipher chain** — each week decrypts a coordinate; coordinates assemble a map to a hidden page.
2. **Collective unlocks** — some fragments only crack if the *whole* playerbase contributes.
3. **Break the fourth wall** — a Narrator voicemail line, a printable invisible-ink dossier, QR stickers.
4. **"Subject Zero is transmitting"** — periodic live countdowns ending in a revealed scene/chapter.
5. **In-universe clearance** — a real rank that gates secret content with tangible rewards.
**Realistic take:** A *light* version (weekly cipher chain + one collective unlock) is very doable
and would deepen your most-engaged fans. The risk is cadence — ARGs die the moment updates lapse.
**Best case:** A well-run PJCC mystery gets dissected on a Discord/subreddit and becomes a
self-sustaining engagement engine that markets the series for you.

## Avenue 3 — Productize the teaching: "Checker Town Chess Academy"
Turns Chess Lessons into a *curriculum* with the cast as instructors — a defensible niche
(cartoon-led chess for kids is a proven formula). *(Items 1–4 shipped at `/academy/`.)*
1. **Character-led paths** — Argus openings, the Rival tactics, Princess endgames; themed game sequences.
2. **An adaptive skill tree** — diagnose level from play data, assign the next lesson automatically.
3. **Classroom mode** — Chess City Elementary: printable worksheets, a teacher view, kid-safe accounts.
4. **Belts & certificates** — Checker → … → Chess City Citizen, with shareable credentials.
5. **Connect to real play** — a Lichess/Chess.com study or bot bridge so lessons lead into real games.
**Realistic take:** One of the few avenues with a clear path to *money and real-world utility*,
assembled largely from games you've already built. Durable — schools/parents don't churn like virality.
**Best case:** PJCC becomes "the cartoon that teaches chess," lands in classrooms, and the Academy
becomes the business that *funds the animation*.

## Avenue 4 — Make Checker Town real in the hand (physical / tabletop / merch)
The chess/checker duality and carved-piece aesthetic are inherently merchandisable, and a physical
layer can fund the rest.
1. **A PJCC chess set** — the "obsidian vs. violet" Sand-Mine look as print-on-demand / Kickstarter.
2. **Print-and-play tabletop** — *Siege* as a board game; *Sand Mine Depths* as a roguelike dice/card game.
3. **Rank pins & patches** — earn your clearance rank online, buy the enamel pin.
4. **The Operative Field Kit** — a sticker dossier, a working cipher wheel, a decoder card (pairs with the ARG).
5. **The Checker Town Field Guide** — an art book of the world bible (also a festival/pitch leave-behind).
**Realistic take:** Print-on-demand pins/stickers are low-risk and extend the Quartermaster loop. A
board-game Kickstarter is bigger, but the designs exist and are proven fun — that de-risks it.
**Best case:** A Kickstarter for the chess set + field guide funds a real chunk of the pilot.

## Avenue 5 — Lean all the way into audio (PJCC as a *sound* world)
Music is clearly core to you. Make audio a first-class pillar. *(Leitmotifs shipped.)*
1. **An original score / EP** — a Checker Town theme, a Chess City theme, a villain motif.
2. **A radio drama / audio-fiction pilot** — voice the pilot as audio first; a fraction of animation's
   cost, ships years sooner, tests writing + cast + tone live.
3. **Character leitmotifs** — a tiny, distinct signature on each character's page.
4. **Notation Blitz "score mode"** — chart the actual PJCC themes as playable rhythm tracks.
5. **Community remixes** — "submit a track for the Build Playlist," with a featured fan slot.
**Realistic take:** The audio drama is the most *underrated* idea here — ships the story cheaply,
proves the writing/performances, and grows a fiction-podcast audience while the animation cooks.
**Best case:** A devoted listenership, a score with its own life on streaming, and a proven cast by
the time the pilot animates.

## Avenue 6 — Make Princess a companion you have a *relationship* with
Deepen Princess into a persistent character who knows you. *(Train / Walk / Memory shipped on her page.)*
1. **A site-wide companion** — reacts to what you do, remembers you between visits, has moods/needs.
2. **"Train Princess"** — your puzzle-solving teaches *her* chess; she visibly improves.
3. **A daily ritual** — "walk Princess" once a day for a small reward + a micro-story.
4. **Reactive moments** — responds to streaks, time of day, holidays, episode drops.
5. **Memory** — references things you did weeks ago ("you finally beat the Rival, huh?").
**Realistic take:** Cheap stickiness from pieces you already have — a state system plus a content
library of lines. The kind of charming detail that makes a site feel *alive*.
**Best case:** Princess becomes the emotional hook — people return to see *her* — and that bond pays
off the day the show gives her a voice.

## Avenue 7 — Open the world to creators (UGC, editors, "citizens")
Let fans *make* things inside Checker Town.
1. **A level editor** — a Sand Mine floor, a Siege map, a CIPHER pack; community-rated. (Siege first — grid-based.)
2. **"Design a citizen"** — fans create a Checker Town NPC from a template.
3. **A curated fan-art gallery** — on character/location pages, with a monthly featured artist.
4. **Headcanon submissions** — fan lore curated into semi-canon (feeds the Lore Codex).
5. **An embed/API** — let fans put their PJCC stats or a mini-game on their own sites.
**Realistic take:** Full UGC is a moderation burden — start with the smallest delightful slice (a
curated gallery + one editor, Siege).
**Best case:** Players become co-authors; "design a citizen who appears in an actual episode" becomes
a dream prize.

## Avenue 8 — AI-native experiences, used tastefully and in-universe
Make the world *talk back* — carefully, in-lore.
1. **Interrogate the cast** — guard-railed in-character personas that stay on-voice and dole out lore.
2. **A dossier analyst** — an AI that reads your play history and writes an in-universe scouting report.
3. **Daily transmissions** — procedurally generated micro-lore in the Narrator's voice (then curated).
4. **An in-character coach** — Argus explains your *actual* chess blunders in his own voice.
5. **"Describe a scene, get a sketch"** — a controlled storyboard toy in the house style.
**Realistic take (candidly):** Powerful but risky for a hand-crafted brand (tone drift, cost,
"uncanny" perception). Safest high-value slice is the coach/analyst on *your own data*; keep
open-ended chat tightly scoped or skip it.
**Best case:** An in-character Argus who genuinely makes you better at chess is a one-of-a-kind hook.

## Avenue 9 — Give the site a heartbeat (live & event-driven)
Make *time and presence* features so the site is different today than yesterday.
1. **Seasonal world events** — the site visibly changes (winter, a festival, the sea freezing) with
   event-only games/rewards.
2. **Live ops** — a countdown to a transmission, a 24-hour tournament, an episode-drop watch party.
3. **A community monument** — combined scores literally "build the bridge to Chess City."
4. **"Studio is open"** — a live indicator when Nate is streaming a build/draw session.
5. **An advent-style calendar** — a door a day, each a game, lore beat, or art drop.
**Realistic take:** Seasonal reskins + a community megabar create *appointment* engagement. Live
streaming depends on your time — don't promise a cadence you can't keep.
**Best case:** PJCC becomes a destination with a pulse, and the community finishes the bridge in a
finale that doubles as a launch beat.

## Avenue 10 — Fund the dream without breaking the vibe (business & reach)
How this pays for itself and finds people. *(Press Pass page shipped.)*
1. **A membership / "Chess City Press Pass"** — early episodes, BTS, exclusive cosmetics, name-in-credits.
2. **An ethical premium currency** — cosmetics only, never pay-to-win, with a bright line you never cross.
3. **A newsletter-first engine** — the mailing list is the cheapest *durable, owned* audience you can build.
4. **Grants & festivals** — animation/arts grants and festival submissions are real money for animation.
5. **Strategic partnerships** — a chess platform, a streamer collab, a school program, a podcast network.
**Realistic take:** *Owned channels* beat chasing virality. A Patreon tied to "watch it get made" +
early access is the most defensible income while the pilot cooks; grants/festivals are real funding.
**Best case:** A few thousand true fans on a press pass fund the pilot outright.

---

## My honest read — if you only chase three

1. **Avenue 1 (production as content)** + **Avenue 5's audio drama** — together they *ship the
   story* long before animation can. The main quest; everything else is side content.
2. **Avenue 10 (newsletter + a "watch it get made" membership)** — the funding/reach layer that
   keeps the lights on. Cheap, owned, durable.
3. **Avenue 6 (Princess as a companion)** — the cheapest emotional stickiness, built from pieces
   already on the site; most likely to make people *love* the brand.

Honorable mention: **Avenue 3 (the Academy)** is the strongest *standalone business*, but it's a
real second job. **Avenue 2 (the ARG)** is the highest-ceiling for superfans but a cadence trap —
start it only when #1 is humming.

The trap to avoid: more *games*. You have a deep arcade already. The next leap is shipping the
*show*, in whatever cheap form ships first.
