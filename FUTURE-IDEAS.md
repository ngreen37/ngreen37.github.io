# PJCC — Future Ideas

A running backlog of ideas raised across build sessions that we have **not** built
yet.  mailing list + Resend sync,
referrals (??).

---

## New game concepts (bigger builds — own session each)



## Engagement / live features


## Social
- **Guilds / Houses** — operatives pick a faction (Checker Town vs Chess City, or a
  piece-house); team leaderboards sum members' credits.
- **Async duels** — challenge another operative to the same seeded puzzle; compare
  scores; winner takes a credit pot.
- **Shareable result cards (per-game)** — extend the Dossier share card so each game can
  emit its own "I hit a CIPHER streak of 12" image at game-over (pairs with referrals).

## Story / world
- ✅ **Lore Codex** *(shipped)* — `/lore-codex/`: a collectible in-universe encyclopedia.
  Entries unseal as you read character/location files (codex.* flags set by the layouts) and
  recover classified fragments; a final all-six-fragments entry unlocks the origin (the
  construction-co. crash). Progress bar + nav link.
- ✅ **Cross-link game cards to lore** *(shipped)* — each game card shows a deep-link chip to the
  character/location it ties to (Shogi Island, Sand Mine → the Father, Siege → Chess City, etc.).
- **"Find Princess" ARG / mystery door** — a hidden hub unlocked by collecting the
  `frag_` easter-egg fragments across the site, leading to a career-portfolio of
  different art styles/mediums (from the PJCC notes).

## Series canon & story seeds (the show itself)
*Writing notes for the cartoon — characters, arcs, and the origin. Captured verbatim-ish from
Nate; not website features.*

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

#
## Projects page polish

- **Public roadmap / "What's next"** that visitors can vote on.
- ✅ **Stat counters at the top** *(shipped)* — live "playable / completed / in the lab" counters
  on the projects page, counted from the games index so they stay accurate.

## Audio / cosmetics
- **A PJCC original track** — commission/compose one studio theme for the jukebox, plus
  a per-game SFX toggle.



## Onboarding / reach


## Animation (Blender)
- **Blender cutscene intros** — short rendered clips of rigged Princess + the chess
  pieces as game intros / loading screens / leaderboard-season trailers. (Saved favorite.)

## Per-game extra features (suggested, not yet built)


✅ **Notation Blitz input-paradigm modes** *(shipped v3.7)* — both deferred modes are in:
- **Recall "name-the-square" drill** — a square lights up on the board and you name it on a
  file/rank keypad before it reaches the gate (board → coordinates, the reverse skill).
- **2-Hand dual-lane mode** — two simultaneous calls per beat, one per lane; click both in time.

*(Shipped in v3.5: the 📅 Daily seeded chart + the global timing-accuracy board. Shipped in v3.6:
Freestyle rubber-band BPM, the files/ranks Warmup, and mid-run Perks.)*
 






## Five fresh ideas per game — round 3 (filed 2026-06-17)
*A brand-new set of five per game (distinct from anything shipped or listed above). This also
restores per-game idea coverage for the titles whose sections had been trimmed.*


- **Fork in the Road**: an endless one-life gauntlet ranked by depth reached · a "show the
  refutation" coach that plays out *why* a wrong move loses 
- **Sand Mine Depths**: droppable light beacons that permanently lid a cleared square · a fog-of-war
  minimap that reveals as the torch sweeps · timed cave-in chain events (a rumble warns; climb to
  escape) · spend gold with Louie at camp for one-run consumables (a 3×3 bomb) · "deep relic sets" —
  collect 3 matching relics in a run for a set bonus.
- **The Pirc Protocol**: an interactive transposition tree showing how lines share early moves ·
  a "name that opening" reverse mode from a position · opponent personalities (the Rival sharp,
  Argus solid) that branch differently · a weekly "model game" you predict move-by-move · a
  side-switcher to drill the same opening from the other colour.
-
- **Clearance: DELTA**: a "redacted dossier" meta that unseals a growing case file across sessions ·
  a sudden-death OMEGA gauntlet (tier-5 only, one wrong ends it) · audio-intercept questions (a line
  or SFX plays — identify it) · a wager mode (bet clearance points on your confidence) ·
  curated community-submitted questions with attribution.
- **Shogi Island**: a piece-reach trainer card (tap every square a piece can reach before time) ·
  handicap games vs the Lion AI that scale to your rank · a calligraphy wall where decoded kanji
  become collectible brush-art · a "tsume of the day" with a global solve-time board · castle drills
  (build the Mino / Yagura shape).
- **Siege on Chess City**: a path-map level editor with shareable codes · co-op "two crowns" split
  lanes (hot-seat or async score-sum)
  - ✅ *(shipped v2.1)* tower synergies (Knight+Queen haste · Bishop+Rook pierce) + a Daily
    mutator-roulette on a fixed seed with a global board.
  - ⏳ *still open:* a narrative campaign map with branching routes + between-battle dialogue (a
    bigger build — branching state + a dialogue system).
- **Blindfold Puzzles / The Mind's Eye** *(round-3 batch):*
  - ✅ *(shipped v2.2)* a pure **Audio-only** mode (position spoken aloud, no board/text) + a
    **coach mnemonic** per position; **The Mind's Eye** gained **voice narration** of each move.
  - ⏳ *still open:* "rebuild-the-board" recall after a sequence · progressive piece-count ladders ·
    a shareable animated replay export · a blunder-review that flags eval swings · cosmetic
    boards/sets unlocked by wins (Shopkeeper tie-in).

## The big one — a real game
- **Binding of Isaac-style roguelite / 3D Space Run in Godot** — use the existing Blender
  assets (rigged Princess, chess pieces, the battle-room concept). Start with ONE
  playable battle room exported to HTML5, embedded on the games page like the others, and
  wired to the same Supabase profile/leaderboard. Then layer rooms + items + procedural
  floors. Pair Blender (assets) with Godot 4 (engine; GDScript ≈ Python, imports .blend,
  exports web).

---

# 🚀 Ten Avenues for PJCC — the big blow-out (filed 2026-06-17)

*A deliberately wide map of where PJCC could go: ten different directions, five ideas each.
For every avenue there's an honest **Realistic take** (what it really costs a solo creator,
and whether it's worth it) and a **Best case** (the swing-for-the-fences version). These reach
past what's already in this file — Daily Dispatch, guilds, duels, the Godot game — toward
angles not captured elsewhere. It's a menu, not a to-do list. My ranked picks are at the end.*

---

## Avenue 1 — Make "the show getting made" the product (production as content)
The honest truth of PJCC is that it's a cartoon *in development*. Most indie studios hide the
pipeline until the pilot is done. Flip it: the act of building the show **is** the show until
the show exists.
1. **The pilot animatic** — a clickable, scene-by-scene storyboard reel with scratch VO and a
   temp score; viewers comment per shot. (Ships the *story* years before the animation can.)
2. **"Frame the Scene"** — post two versions of a shot (composition, color key, expression)
   and let the audience vote. You get free art direction + data on what lands.
3. **A real production tracker** — public % bars per episode (script → boards → layout →
   animation → comp), so fans watch progress like a roadmap and feel the momentum.
4. **Open the booth** — community voice auditions for a side character (e.g. "the voice of
   Louie"); winners get a credit. Casting becomes an event.
5. **The living style bible** — turnarounds, color scripts, prop sheets as a public page that
   doubles as your portfolio and a free art-education resource.
**Realistic take:** This is the highest-leverage, most on-brand move on the whole list, and
it's mostly *organizing work you're already doing* into something that shows the show. An
animatic + a production tracker are achievable solo and convert your blog/dev-log energy into
genuine pre-launch audience-building — the one thing that reliably saves indie animation.
**Best case:** The animatic catches a little fire, "I backed this before episode 1" becomes a
badge of honor, and the tracker becomes a beloved ritual. You arrive at the pilot having
effectively *pre-sold* it, with a Patreon-able audience that's invested in the process itself.

## Avenue 2 — Turn the spy meta-layer into a real, season-long ARG
You've already built ~80% of the scaffolding — Agent 0091, transmissions, fragments, Konami/
morse easter eggs, the "INTERPLANETARY CONSTRUCTION CO." signal, Subject Zero. Right now it's
flavor. Make it a *collaborative, time-gated mystery* that actually pays off the lore.
1. **A cipher chain** — each week's CIPHER word decrypts a coordinate; coordinates assemble a
   map to a hidden page over a season.
2. **Collective unlocks** — some fragments only crack if the *whole* playerbase contributes
   (a server-wide progress bar to a lore drop). Solving becomes a team sport.
3. **Break the fourth wall** — a real voicemail line from the Narrator, a printable dossier
   with invisible-ink puzzles, QR codes on stickers that link to in-world pages.
4. **"Subject Zero is transmitting"** — periodic live countdowns that end in a revealed scene,
   clip, or the next chapter of the mystery.
5. **In-universe clearance** — players earn a real clearance rank that gates secret content,
   with tangible rewards (credits, a title, early episode access).
**Realistic take:** A *light* version (weekly cipher chain + one collective unlock) is very
doable and would deepen your most-engaged fans enormously. The genuine risk is cadence — ARGs
die the moment updates lapse, so only commit to a rhythm you can actually hold.
**Best case:** ARG communities are rabid. A well-run PJCC mystery gets dissected on a Discord/
subreddit, "what is the construction company" becomes a theory-crafting obsession, and you've
built a self-sustaining engagement engine that markets the series for you.

## Avenue 3 — Productize the teaching: "Checker Town Chess Academy"
Chess Lessons exists as a page; this turns it into a *curriculum* with the cast as instructors
— and a real, defensible niche (cartoon-led chess for kids is a proven formula).
1. **Character-led paths** — Argus teaches openings, the Rival teaches tactics, Princess
   teaches endgames; each "course" is a themed sequence of your existing games.
2. **An adaptive skill tree** — diagnose level from a player's game data, then assign the next
   lesson/puzzle automatically.
3. **Classroom mode** — tie it to Chess City Elementary: printable worksheets, a teacher view,
   kid-safe accounts. Aim it squarely at parents and schools.
4. **Belts & certificates** — a Checker → Pawn → … → Chess City Citizen ladder with shareable
   credentials (real-world bragging rights for kids).
5. **Connect to real play** — a Lichess/Chess.com study or bot bridge so lessons lead into
   actual games.
**Realistic take:** This is one of the few avenues with a clear path to *money and real-world
utility*. The curriculum can be assembled largely from games you've already built and tested.
It's durable work — schools and parents don't churn like a viral audience does.
**Best case:** PJCC becomes "the cartoon that teaches chess." It lands in classrooms, earns a
chess-federation or nonprofit partnership, and the Academy becomes the business that *funds the
animation* — the show and the school feeding each other.

## Avenue 4 — Make Checker Town real in the hand (physical / tabletop / merch)
The chess/checker duality and the carved-piece aesthetic are inherently merchandisable, and a
physical layer can fund the rest.
1. **A PJCC chess set** — the "obsidian vs. violet" look from Sand Mine as a print-on-demand or
   Kickstarter board + pieces.
2. **Print-and-play tabletop** — *Siege on Chess City* as an actual board game; *Sand Mine
   Depths* as a roguelike dice/card game. They're already digitally playtested.
3. **Rank pins & patches** — earn your clearance rank online, buy the enamel pin. Ties merch
   directly to the operative/credits system.
4. **The Operative Field Kit** — a sticker dossier, a working cipher wheel, a decoder card that
   pairs with the site ARG (Avenue 2).
5. **The Checker Town Field Guide** — an art book collecting the world bible, turnarounds, and
   location art (also a festival/pitch leave-behind).
**Realistic take:** Print-on-demand pins/stickers/posters are low-risk and a natural extension
of the Quartermaster reward loop. A full board-game Kickstarter is a bigger swing, but the
designs already exist and are proven fun — that de-risks it more than most campaigns.
**Best case:** A Kickstarter for the chess set + field guide funds a real chunk of the pilot,
the cipher wheel becomes a cult object, and merch revenue quietly de-risks the whole studio.

## Avenue 5 — Lean all the way into audio (PJCC as a *sound* world)
Music is clearly core to you (the Build Playlist, the Minus the Bear / Ratatat / ska threads).
Make audio a first-class pillar, not a background tab.
1. **An original score / EP** — a Checker Town theme, a Chess City theme, a villain motif;
   release it on the soundtrack page and streaming.
2. **A radio drama / audio-fiction pilot** — voice the pilot as audio first. It's a fraction of
   animation's cost, ships *years* sooner, and tests the writing, cast, and tone live. The
   podcast slot is already sitting there.
3. **Character leitmotifs** — a tiny, distinct musical signature that plays softly on each
   character's page.
4. **Notation Blitz "score mode"** — chart the actual PJCC themes as playable rhythm tracks,
   tying the arcade to the music.
5. **Community remixes** — "submit a track for the Build Playlist," with a featured fan slot.
**Realistic take:** The audio drama is the most *underrated* idea on this list. It ships the
story cheaply, proves the most expensive-to-fix thing (writing + performances), and grows a
fiction-podcast audience — a hungry, underserved market — while the animation cooks.
**Best case:** The audio drama builds a devoted listenership, the score takes on its own life
on streaming, and you reach the animated pilot with a proven story, a cast people already love,
and music fans can already hum.

## Avenue 6 — Make Princess a companion you have a *relationship* with
The walker, the 3D figurine, and the Dossier "pet mood" already exist but stay shallow. Deepen
Princess into a persistent character who knows you across the whole site.
1. **A site-wide companion** — she reacts to what you do, remembers you between visits, and has
   real moods and needs.
2. **"Train Princess"** — your puzzle-solving teaches *her* chess; she visibly improves and
   comments on your play.
3. **A daily ritual** — "walk Princess" once a day for a small reward and a one-beat micro-story.
4. **Reactive moments** — she responds to your streaks, the time of day, holidays, and episode
   drops with bespoke lines/animations.
5. **Memory** — she references things you did weeks ago ("you finally beat the Rival, huh?").
**Realistic take:** Cheap stickiness using pieces you already have — mostly a state system plus
a content library of lines and animations. This is exactly the kind of charming, low-cost
detail that makes a site feel *alive* and gets shared.
**Best case:** Princess becomes the emotional hook — people return to see *her*, not just to
play. The bond you build online pays off massively the day the show gives her a voice and a
face the audience already adores.

## Avenue 7 — Open the world to creators (UGC, editors, "citizens")
Let fans *make* things inside Checker Town instead of only consuming it.
1. **A level editor** — design a Sand Mine floor, a Siege map, or a CIPHER pack and share it;
   community-rated. (Siege maps are the natural first target — they're grid-based.)
2. **"Design a citizen"** — fans create a Checker Town NPC from a template that can appear in
   the world map or background crowds.
3. **A curated fan-art gallery** — integrated into character/location pages, with a monthly
   featured artist.
4. **Headcanon submissions** — fan lore that, when great, gets curated into semi-canon (feeds a
   future Lore Codex).
5. **An embed/API** — let fans put their PJCC stats or a mini-game on their own sites.
**Realistic take:** Full UGC is a moderation burden, so start with the smallest delightful
slice: a curated fan-art gallery plus one editor (Siege). Don't open the floodgates before you
can tend them.
**Best case:** Players become co-authors. The editor produces infinite free content, and
"design a citizen who appears in an actual episode" becomes a dream prize — the community
literally helps populate Checker Town.

## Avenue 8 — AI-native experiences, used tastefully and in-universe
The timely, genuinely novel avenue: make the world *talk back* — carefully, in-lore.
1. **Interrogate the cast** — chat with Argus / the Rival / the Narrator as guard-railed,
   in-character personas that stay on-voice and dole out lore.
2. **A dossier analyst** — an AI that reads your play history and writes a personalized
   in-universe scouting report / mission briefing.
3. **Daily transmissions** — procedurally generated micro-lore in the Narrator's voice (seeded,
   then human-curated).
4. **An in-character coach** — Argus explains your *actual* chess blunders in his own voice.
5. **"Describe a scene, get a sketch"** — a controlled storyboard toy in the studio's house
   style, for fun and marketing.
**Realistic take (candidly):** AI personas are powerful but risky for a hand-crafted indie
brand — tone drift, ongoing cost, and a "cheap/uncanny" perception that can undercut the
artisanal feel. The safest high-value slice is the coach/analyst that explains *your own data*
(low lore-risk, real utility); keep open-ended character chat tightly scoped or skip it.
**Best case:** An in-character Argus who genuinely makes you better at chess is a sticky,
one-of-a-kind feature nobody else has, and "talk to the cast" becomes a marketing magnet —
crafted well enough that it reads as magic, not as a chatbot.

## Avenue 9 — Give the site a heartbeat (live & event-driven)
Beyond the weekly bounty: make *time and presence* features, so there's always a reason the
site is different today than yesterday.
1. **Seasonal world events** — the site visibly changes (Checker Town in winter, a festival,
   the sea freezing over) with event-only games and rewards.
2. **Live ops** — a countdown to a transmission, a 24-hour tournament, an episode-drop watch
   party page with synced chat.
3. **A community monument** — the whole playerbase's combined scores literally "build the
   bridge to Chess City," a server-wide progress bar with a dramatic finale.
4. **"Studio is open"** — a live indicator when Nate is streaming a build/draw session.
5. **An advent-style calendar** — a door a day for a season, each opening a game, a lore beat,
   or an art drop.
**Realistic take:** Seasonal reskins + a community megabar are achievable and create
*appointment* engagement — the thing that turns one-time visitors into regulars. Live streaming
depends entirely on your time and appetite; don't promise a cadence you can't keep.
**Best case:** PJCC becomes a destination with a pulse. People log in to see what changed, and
the community finishes the bridge to Chess City in a finale that doubles as the perfect
marketing beat for the show's launch.

## Avenue 10 — Fund the dream without breaking the vibe (business & reach)
The meta-avenue: how this pays for itself and finds people. Boring on the surface, but it's
what lets every other avenue happen.
1. **A membership / "Chess City Press Pass"** — early episodes, behind-the-scenes, exclusive
   cosmetics, name-in-credits. The operative tier system already models this.
2. **An ethical premium currency** — cosmetics only, never pay-to-win, with a bright line you
   never cross. Protects trust while opening revenue.
3. **A newsletter-first engine** — the mailing list already exists; a genuinely great weekly
   dispatch is the cheapest *durable, owned* audience you can build (no algorithm can take it).
4. **Grants & festivals** — animation/arts grants and film-festival short submissions are real
   money specifically for animation; a polished web game is a strong calling card.
5. **Strategic partnerships** — a chess platform (Lichess / Chess.com), a streamer collab, a
   school program, or a fiction-podcast network for the audio drama.
**Realistic take:** The unglamorous truth is that *owned channels* (mailing list, membership)
beat chasing virality every time. A Patreon tied to "watch the show get made" + early access is
the most defensible income while the pilot cooks, and grants/festivals are genuine funding for
animation specifically.
**Best case:** A few thousand true fans on a press pass fund the pilot outright; a festival run
or a platform partnership becomes the launch ramp; and PJCC turns into a self-sustaining studio
where the website is the funnel and the community is the budget.

---

## My honest read — if you only chase three

You can't run all ten solo, and you shouldn't try. The ones that actually compound for *an
indie animation studio with one builder and a chess-game site*:

1. **Avenue 1 (production as content)** + **Avenue 5's audio drama** — together these *ship the
   story* long before animation can, and build the audience that makes the show viable. This is
   the main quest. Everything else is side content.
2. **Avenue 10 (newsletter + a "watch it get made" membership)** — the funding/reach layer that
   keeps the lights on while #1 cooks. Cheap, owned, durable.
3. **Avenue 6 (Princess as a companion)** — the cheapest emotional stickiness available, built
   almost entirely from pieces already on the site, and the thing most likely to make people
   *love* the brand rather than just visit it.

Honorable mention: **Avenue 3 (the Academy)** is the strongest *standalone business* if you ever
want PJCC to pay for itself directly rather than as a passion project — but it's a real second
job, so only if the teaching genuinely excites you. **Avenue 2 (the ARG)** is the most fun and
the highest-ceiling for superfans, but it's a cadence trap — start it only when #1 is humming.

The trap to avoid: more *games*. You have a deep arcade already. The marginal game adds less now
than the first minute of an animatic, the first episode of an audio drama, or the first email of
a newsletter people actually look forward to. The site has proven you can build — the next leap
is to start shipping the *show*, in whatever cheap form ships first.
