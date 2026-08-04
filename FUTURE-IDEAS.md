---
published: false
---

# PJCC — Future Ideas

The open backlog: **only what's *not* built yet.** Completed work has been cleared out of this file;
everything here is a path not yet taken.

**Start at ⭐ PRIORITY, right below.** It's the ten things worth doing next, copied up from the sections
that follow — read it as the top of the file, and everything after it as the shelf they came off.

**Operating principle — *less is more.*** We deliberately built "too much" and are paring to the most
important, inviting elements. New ideas earn their place against that bar; prefer **depth and
combination** over new surface area.

---

# ✅ ACTION ITEMS — Nate's, not mine

*The standing list of things **only he can do** (an account he owns, a decision that's his to make, a
name he has to pick). Kept here so an ended session never loses them. None are on fire; they just have
to live somewhere. Cross one off by deleting the line. Last swept **2026-07-28**.*

**🌐 THE DOMAIN CUTOVER — ✅ DONE 2026-08-03/04. `chesswild.com` IS THE LIVE DOMAIN.**
Runbook kept at `docs/domain-cutover-chesswild.md`. DNS verified, `CNAME`/`_config.yml`/
`robots.txt`/Gambit canonical flipped, certificate provisioned, `www` → apex, and
mcpuppystudios.com 301s **with the path preserved** (`/pjcc/` → `chesswild.com/pjcc/`).
- [x] ~~**Tick Enforce HTTPS**~~ **DONE — verified 2026-08-04:** both `http://chesswild.com` and
  `http://www.chesswild.com` now 301 to `https://chesswild.com`.
- [ ] **Google Search Console** — [search.google.com/search-console](https://search.google.com/search-console)
  → property dropdown → **Add property** → **Domain** → `chesswild.com` → add the TXT record in
  Squarespace DNS → Verify → **Sitemaps** → submit `sitemap.xml`. Keep the old property; it is what
  reports the 301s being followed.
- [ ] **Delete and reinstall the app on your phone** — a new origin is a new app, and no manifest
  edit can reach an installed launcher. **Sign in on chesswild.com first**, so your account carries
  your progress across rather than the browser jar you're leaving behind.
- [ ] **Redeploy the Cloudflare Worker** — ⚠ **re-probed 2026-08-04 and it is STILL not live.** All
  four origins get back `Access-Control-Allow-Origin: https://mcpuppystudios.com` (the `ALLOW[0]`
  fallback), which proves `chesswild.com` is not in the array. **Japanese stays blocked until this
  lands.** Cloudflare → Workers & Pages → `pjcc-translate` → **Edit code** → paste the whole worker
  from `docs/translation-worker.md` → **Deploy** (the edit does nothing until Deploy is clicked).
  Tell me when it's done and I'll re-probe.

**⭐ THE PUZZLE CREDIT RULE — TWO DIALS THAT ARE YOURS TO CALL (kept here at your request,
2026-08-04: "keep the RETRY_GAP and the earned definition in the priority items")**

Both shipped and both live in `assets/games/pjcc_fork.html`. Neither is a bug; they are the
two places where "credit is earned, not attended" got a number attached, and the numbers were
mine. Play a stretch of puzzles before deciding — this is a feel question, not an argument.

- [ ] **`earned` — what counts as a clean solve.** Today:
  `earned = G.clean && !G.revealed && G.hintLevel === 0`. All three clauses must hold or the
  step does not advance. **The third one is the strict one**: *any* hint, including the
  gentlest nudge, costs you the credit — a light hint used to still count as a perfect solve.
  ⚠ **This made the road materially harder.** "1,000 puzzles to Chess City" now means **1,000
  CLEAN solves**. If that reads as punishing for a beginner leaning on hints, the softer
  version is to drop the `hintLevel` clause and let a nudge still count — one line.
- [ ] **`RETRY_GAP = 3` — how long before a missed puzzle comes back.** An unearned puzzle is
  re-served three puzzles later, wearing a green **SECOND LOOK** chip. Three is a guess at
  "long enough that you are recalling it rather than copying it off the screen." Too short and
  it is a do-over with the answer still visible; too long and the lesson has gone cold.
- Not in question, for the record: the difficulty dial and your puzzle Elo still settle on
  **any** finish, because those are *measurements* and a hinted solve is real information
  about your level. Only the **step** is a *claim*, and only a clean solve makes it.

**Names and vetoes from the 2026-08-03 batch — all shipped, all one-line reversible**
- [x] ~~**The app is still *named* PJCC.**~~ **DONE 2026-08-03** — the domain picked the name. The
  manifest now reads `name: "ChessWild — free chess for everyone"` / `short_name: "ChessWild"`.
  `id` stayed `/pjcc/`, so it updates in place rather than becoming a second icon.
- [ ] **25 new collectable names are mine, veto open.** Eight shop faces (The Bear · Otter · Stag ·
  Octopus · Shark · Tortoise · Nightwing · Moon), three titles, two themes, six Vault pieces named
  for what the altar does (The Hourglass · Anchor · Long Thread · Remembered by the Board · Nothing
  Comes Back · Six Days), and seven EARNED (The Laurel · Long View · Compass · Field Ledger · The
  Finder · The Key · Citizen of Chess City). All one array in `pjcc-profile.js`.
- [ ] **The collection page is called "The Collection"** and its line is *"Collect them all."* You
  said don't call it a pokedex, so it isn't — but the name itself is plain on purpose and is yours
  to make stranger if you want (The Cabinet · The Case · The Field Manifest were the runners-up).
- [ ] **The two hidden boards are on `/pjcc/` and `/games/`.** Three hiding places each, and the
  board moves between them daily. Say the word for a third board anywhere — it's one line of data.

**From the 2026-08-03 sky batch — all shipped, all one-line reversible**
- [ ] **The intro is deleted.** `/` no longer types *"McPuppy Studios Presents"* — it is a bare
  redirect to `/chess/` (JS before paint, meta-refresh for no-JS, a real link as the last resort).
  Everything that served it went too: the once-per-session flag, the cross-document fade, and the
  *Replay intro* link on `/pjcc/`. **It was one file — `git show HEAD~1 -- index.md` brings the whole
  card back** if you ever want it in front of a Blender clip instead.
- [ ] **One new ticker line is mine, and the wire is your voice.** *LAST SEEN: DUSK* — shown once,
  on the visit where the hour of the world has changed since you were last here. It is deliberately
  not a headline (its own dimmer style, no ◆), because it is the dossier's "last seen", not the desk
  speaking. Change the wording or cut it: one string in `_layouts/home.html`.
- [ ] **The hidden-board card now says *"Left out in the rain."*** (or snow). It exists to teach the
  rule — the boards only appear on wet days, so without it a friend who looks tomorrow decides the
  site is broken. Yours to reword.
- [ ] **Five muted text colors in four games got a touch brighter** (sandmine + pirc `.foot`, the
  Reading Room's romaji and deck headers, tower defense's stat labels). Not taste — the town-sky
  wash pushed all five under the AA line, and lifting them was the alternative to not shipping it.
- [ ] **`/style/` now carries a voice chart** naming which font speaks for which brand, including
  the two serifs. It records what is true today rather than proposing a change; if you'd rather the
  Reading Room and Shogi Island used the studio's serif stack instead of their own, say so.

**From the Identity Forge rebuild (2026-08-03) — shipped, and yours to veto**
- [ ] **Nine characters left and they are not coming back on their own.** Fox, Visitor, Robot and
  Fairy — the four you named — plus Ghost, Genie, Elf, Vampire and Merfolk, which fall under "keep
  them human". Say the word and any of them can return as a drawn face; each is one entry in `FACES`
  plus a hair shape.
- [ ] **The 12 hair styles and their names are mine.** Crop · Swept · Buzz · Curls · Afro · Bob ·
  Long · Ponytail · Braids · Top knot · Locs · Bald. So are the 12 hair colors (three of which —
  jade, rose, azure — only exist in Checker Town) and the 10 eye colors.
- [ ] **The tiny avatar in the nav is still an emoji on ONE surface: the share card.** It paints with
  `ctx.fillText` onto a canvas, which cannot take a drawing, so it shows 🧑 in your skin tone. Every
  other surface — nav, leaderboards, profile bar, dossier — shows the real face. Worth fixing when
  the share card is next opened; not worth a canvas rewrite today.

**Accounts & sign-ups — nothing on my side blocks these**
- [ ] **Google Search Console** — verify `mcpuppystudios.com`, submit `/sitemap.xml`. The JSON-LD,
  sitemap and robots have been wired and waiting since the SEO pass; until this is done, nothing is
  telling Google the site exists.
- [ ] **Authorize the claude.ai Google Drive connector** in claude.ai → connector settings. The OAuth
  flow can't run from a coding session, so that capability stays dark until he clicks it.
- [ ] **Reserve the social handles** — @McPuppyStudios on YouTube, TikTok, Instagram, X, Facebook,
  Reddit. Bio + link, then silence until there are Blender clips to post. *The only item on this whole
  file that gets **worse** by waiting: an empty reserved account costs nothing, a lost name costs the name.*
- [ ] **Fan-art Supabase setup** — the public wall reads `_data/fanart.yml`; the submission table is his
  to stand up when he wants submissions to land somewhere other than an inbox.

**Decisions waiting on him**
- [x] ~~⭐ **Let the bot tables through without an account.**~~ **DONE 2026-07-28** — Nate said go.
  The four regulars now play with no account at all, the sign-in sits *below* a board a stranger can
  already sit at, and a dead backend says "the tables are offline — but the regulars are still here"
  instead of sending everyone away. Verified live, signed out, in a clean browser jar. See the
  `bot-gate` memory.
- [ ] **The domain question (raised 2026-07-28).** `princessandthejourneytochesscity.com` is worth
  the ~$12/yr as a **defensive redirect nobody ever types** — it is the show's actual title, it costs
  less than a coffee, and the only bad outcome is someone else holding the name of his own series.
  Point it at `mcpuppystudios.com` and never print it anywhere. **`pjcc.com` is a pass:** the $19,800
  ask is plausible for a 4-letter .com (Escrow.com's Q2-2025 median was ~$7.2k, individual sales run
  well past it) but it is an *asking* price on an unpronounceable consonant cluster with existing
  acronym competition — and a name nobody can spell after hearing the show's title is a weak asset at
  any price. ~~**Live domain stays `mcpuppystudios.com`.**~~ **SUPERSEDED 2026-08-03: he bought
  `chesswild.com` and it becomes the live domain** — the reasoning above still stands (a name a
  stranger can spell after hearing it is the whole asset), it just found a better answer than either
  candidate. The defensive `princessandthejourneytochesscity.com` registration is still open and
  still worth ~$12/yr. See the cutover steps at the top of this file.
- [ ] **⭐ The road to Chess City lives in ONE browser — and that is a 1,000-puzzle promise.**
  *(Found 2026-07-29 answering his question "is there a method where users can get them all?")*
  Progress is `localStorage['pjcc.fork.journey.v2']`, written on every correct solve. Signed IN it is
  also mirrored to the profile and restored on load if the server is further along, so an account
  survives a new phone. **Signed out it does not exist anywhere but that one browser** — clear the
  site data, switch devices, or open it in a private window and 400 solved puzzles are gone, along
  with the Citizen crest and any claim on a Founder's number. The fix is small (write the arrival and
  the step count under the account the moment either happens, and make the room say "sign in to keep
  your road"), but it changes what the page promises a stranger, so **the call is his.** Related: the
  ~~ONE genuine asterisk on "1,000 correct puzzles"~~ **ANSWERED AND CLOSED 2026-08-04**, and he
  went further than the question asked: **no credit for a hint OR a wrong first move.** You still
  have to finish the puzzle — it just doesn't count, and it **comes back three puzzles later** wearing
  a "SECOND LOOK" chip until you solve it clean. The rating and the difficulty still settle on any
  finish (they are *measurements*); only the STEP is withheld (it is a *claim*). ⚠ **"1,000 puzzles to
  Chess City" now means 1,000 CLEAN solves** — a materially harder promise than it was, and the knob
  to turn if the road ever feels punishing.
- [ ] **The rarity band NAMES are mine and the veto is open.** *Common · Uncommon · Rare · Very Rare ·
  Ultra-Rare · Legendary* — he asked for six categories "up to 'ultra-rare' or 'ultra-valuable'", and
  these are the six. **Legendary and Ultra-Rare traded places 2026-08-03 at his word**, so Legendary
  is the ceiling now. If PJCC wants its own vocabulary for them (the altar speaks in ritual, not in
  loot-box), they are one array in `pjcc-profile.js`.
- [x] ~~**Robert, Kaede and Matsu are publicly present but officially hidden.**~~ **ANSWERED
  2026-08-03 — Nate: "Robert, Kaede, and Maetsu are fine to remain as-is, I'm still going to
  slow-roll them, so don't give them character pages."** They stay named on the live pages that
  already use them (Robert as the Park Tables Expert bot, Kaede in the Reading Room, Kaede and
  Matsu on Shogi Island) and stay in `hidden_character_urls` with no dossier of their own. The
  rule is the standing one: **unlink, keep the text.** Not an oversight — do not "fix" it again.
- [x] ~~**Pick the home page's NAME.**~~ **ANSWERED 2026-08-03 by the chequebook** — he bought
  **chesswild.com** and the site is **ChessWild**. The twenty candidates below are closed. The front
  door also moved `/chess/` → **`/`** the same day: a domain that says chess retires the hop that
  existed only to explain a studio-sounding address.
- [ ] **Shape the new home page.** First pass is live and deliberately plain — hero + one gold
  button + four doors + three true things + one door to the world. He said "we'll shape it."
- [ ] **The Spotify-style profile ring** — hover the top-right profile pill, a progress ring slides out
  with what's left to do. Spec'd under *Waiting on Nate* above. Outward-facing, so it's his call.
- [ ] **The Journey map** — make the dots cost something · fold it into the Gauntlet's climb · cut it.
  All three laid out at the bottom of this file.
- [ ] **The hidden track** — the CD-style ghost track on the McPuppy side is built-ready; it needs **one
  audio file**, and which song it is, is his.
- [ ] **The Enforcer door (floor 7)** — "lock the rook glyph" was built as *the rook locked behind a
  barred gate with a padlock*. If he meant *pin the glyph to ♜ so it stops changing*, that's a one-liner.
- [ ] **Put yourself on the Projects page — an image of you and Princess.** *(Projects idea #3 of ten;
  Nate 2026-07-28: "I'll still want to be mysterious but perhaps I can add an image of us together.")*
  The skeptic pass found the same hole from five different directions: **nowhere on Projects, Blog or
  Contact does it say who you are.** A partner, a grandparent and a family member all want the same
  first fact — a person — and none of them get it. Contact says "One person behind the curtain" and
  the name *Nate* appears nowhere on it.
  Mysterious and present are not opposites, and "you and Princess" is the exact right amount: **a real
  dog is a face without being an exposé.** One photo, your first name, two sentences. It doesn't need
  your last name, your town, or your job. Slot's ready — the flagship card already carries the Blender
  render, so a second `.pj-shot` figure drops straight in beside the studio lede.
  *Adjacent, and mine when you want it:* **re-render Princess on a transparent film** (Blender →
  Output → Film → Transparent). The render on the page now is a viewport grab, gray background, grid
  and 3D cursor included — captioned honestly as one, which reads as a receipt. A transparent PNG of
  the same pose would let her float free of the box and sit in a page margin, which was your original
  idea for her.
- [ ] **Build a personal chess curriculum.** *(Projects idea #7 of ten, deferred by Nate on 2026-07-28:
  "not yet because I'm not quite ready.")* The skeptic's sharpest money note: **"I also teach chess —
  any age, in person or online" is buried at the bottom of `/contact/` with no rate, no location and
  no way to book. It is the only line on the entire site that could earn something today, and it's a
  footnote.** The blocker isn't the page, it's the curriculum: what you'd actually teach, in what
  order, to a beginner and to a club player. Once that exists it becomes a real card on Projects —
  ages, format, how to book — and the ask on `/projects/` gains a fourth line. Deliberately left OUT
  of the "What the studio needs" block until then; an offer you're not ready to fill is worse than
  no offer.

**Queued, mine not his — carried from 2026-07-28, NOT started**
- [x] ~~**THE PERSON, DRAWN — the last piece of the eye-color ask.**~~ **SHIPPED 2026-08-03.**
  Nate took the trade this item was waiting on: *"Take away characters like fox, visitor, robot, and
  fairy. Keep them human. Keep the eye setup uniform so we can change eye color… and if they want, a
  2 color eye?"* The person is drawn from parts now (`assets/js/pjcc-face-art.js`), so eye color
  exists on both halves of the pair at last — and **two-tone eyes** with it: pupil, an inner ring, an
  outer ring, exactly the eye he described as his own.
  **The trade came out ahead.** It cost 32 fixed emoji and bought 12 hair styles × 12 hair colors ×
  6 skin tones × 10 eyes × 11 second rings — and a ninja can now have red hair and green eyes, which
  was impossible when the ninja *was* the picture. The profession moved to the two places that
  already carried it: Headwear and your Title. Nobody lost their character — all 32 old keys map to
  a person who resembles them, so a saved Fox reopens as somebody with curly hair.
  Gate: `npm run test:creator` (22 checks), including a **pixel measurement** that the panel never
  moves while you use it.


**Test on a device I don't have**
- [ ] **iOS in-app sign-in** — the PWA is built but private (`?pwa=on`). Magic links can't sign in an
  installed app; the email-CODE path (`PJCC.verifyCode`) was written for it and has never been retested
  on his phone. Blocks the PWA launch flip.

**Measure it on your own machine — 60 seconds, and it settles a question I can only guess at**
- [ ] **Feel the 200ms yourself: open `mcpuppystudios.com/chess/?ready=1`.** The front door's board
  is playable — tap the rook, tap a8 — and that interactivity is wired up by a script, so there is a
  gap between *the board appears* and *the board answers*. I said it should land under 200ms and that
  you'd never notice it; that was a prediction, not a measurement, and it was made on a headless
  browser rather than your laptop. So the page will print the real number for you: with `?ready=1`,
  a mono line appears under the board saying **how many milliseconds after page start the board
  became touchable**, and how long the wiring itself took. Regular visitors never see it.
  What to look for: **the board is fully drawn before any script runs** — all 64 squares and all 8
  pieces are static markup, so there is no blank box and no layout shift, only a brief moment where
  it's a picture rather than a button. If the number is small and you can't feel it, the technique is
  proven and it can be used elsewhere. If you *can* feel it, tell me and the board gets wired at
  first touch instead of at load. Either way we stop guessing. *(Shipped 2026-07-28 in `chess.md`.)*

---

# ⭐ PRIORITY — the short list

*Copied up from the sections below (the originals stay where they are, in context). Nothing here is a new
idea; this is the order I'd build in if nobody said otherwise. Ten items, because a priority list of forty
is just the backlog again.*

### 1. Report-a-puzzle, plumbed properly *(from "🧩 The Puzzle room")*
The panel in the Puzzle room offers **Email it / Copy it** today — honest, but it ends in a human inbox and
depends on the player having a mail app. Two steps:
- **A table, not an inbox.** A Supabase `puzzle_reports` table, insert-only via RLS, written straight from
  the game (FEN · motif · rating · mode · the move the player thought also won). One tap, nothing lost.
  Read them on a private page beside the leaderboards. *(One migration; the client-side insert pattern
  already exists everywhere else on the site.)*
- **Let the machine triage them.** The room already carries a perft-verified referee and the best-defense
  search. Attach the engine's own verdict to the report — *"player says Rxd4 also wins; the search agrees,
  +500"* — so the only reports worth opening are the ones where the **player is right**.
- *Newly worth more:* the refutation card now **sends players here itself** — when the search likes their
  move too, it says so and points at ⚑. Those are precisely the reports that deserve a real pipe.

### 2. A puzzle rating for the PLAYER *(from "🧩 The Puzzle room")*
Puzzles wear honest ~ratings already. Give the **solver** one — the same Elo the Park Tables run — and serve
puzzles at it. The Journey's 1–10 difficulty becomes a real, comparable number, and *"rated 1240 puzzles"* is
a far better brag than *"step 340"*. Pairs with #3: one rating, one identity, everywhere.

### 3. Park Tables — one identity across the site *(build-out thread #2, greenlit)*
Wire the **PJCC Rating → the Clearance ladder** (RECRUIT → DELTA → … → OMEGA) so your codename wears a
**clearance pip** that climbs, and the quiz game, the tables and the Profile finally speak one language.
Then earned, **cosmetic-only** board/piece skins (first win · beat a bot · reach a rating · review 10 games).
*The clearance pip alone is the contained first slice.*

### 4. Every game quietly teaches *(build-out thread #4, greenlit)*
After any Park Tables game: one tap → **"your one turning point"** (the biggest eval swing) as a mini-lesson,
plus an offer to **turn your blunder into a Fork-in-the-Road puzzle** ("you missed this"). Review → puzzle →
Academy, one loop, riding the free review engine that's already wired into finished games.

### 5. The park as a *place* *(build-out thread #1, greenlit)*
The lobby becomes the actual park: bots as **seated regulars** at named tables with a live status line
("Argus is thinking…"), the scene reading the **town sky** — busy by day, one lamplit table after dark.
You walk up to a table instead of clicking a row. Mostly CSS + flavor over state that already exists.

### ~~6. Every game should wear the town's sky~~ — **SHIPPED 2026-08-03**
All sixteen game shells now load the town clock and paint the same phase + weather wash the rest
of the site carries, so a game opened at dusk is lit like dusk and a rainy day looks rainy through
the window. Same clock, same town, no new art — and no falling weather inside a game, because a
particle loop next to a game loop is the one trade the perf law refuses.
**⚠ Read the strength note before turning it up:** ×3 is where it reads best and ×1.5 already
pushes nine real text pairs under AA. Lift the type first, measure, *then* turn it up.

### 7. Kill the second Gauntlet door *(cohesion #8)*
The home hero and the games hall carry **two hand-maintained copies** of the same door, and two copies of the
LADDER names/accents/glyphs in JS, each with a comment begging you to keep them in sync. One include + one
data file. They will drift — they already have. Cheap, and it stops a whole class of bug.

### 8. One "not yet" voice *(cohesion #10)*
Unbuilt things currently say: *Coming Soon · In Development · Building · Not ready yet — months away · Don't
hold your breath! · Sealed / Retired.* Pick **two** — one for *being built*, one for *retired* — and use them
everywhere. The [[no-excuses-copy]] rule applied to labels.

### 9. Say that the arcade works offline *(ingenuity #20)*
The service worker warms 18 games and Stockfish; the whole thing runs on a plane. That is genuinely rare and
the site has never once said so. **One line in the games hall.** Not a prompt — a fact.

### 10. Reserve the social handles *(the Socials Play — Nate's 20 minutes, not a build)*
@McPuppyStudios on YouTube, TikTok, Instagram, X, Facebook, Reddit — bio + link, then **silence** until there
are Blender clips to post. An empty reserved account costs nothing; a lost handle costs the name. This is the
only item on the list that gets *worse* by waiting.

### ⭐ PRIORITY, GATED — "What the studio needs" *(built and pulled 2026-07-28, same day)*
Nate: *"I like the idea of What the Studio Needs — but I'm deciding not to add animators until the series is
actually kicking. Remove that, remove all three but keep this idea as a priority item."* Right call: a public
ask is a **promise about where the project is**, and answering replies for a job you can't hand out yet costs
more than the replies are worth. **The trigger, not a date: the series is actually kicking** — there's footage
moving, and a second pair of hands would have something to do on Monday.

The problem it solved is still unsolved and still the sharpest line from the skeptic pass: *he leaves without
emailing — not because he's unconvinced, but because there's no reason to email.* "Contact me for more." More
**what**? A vague ask gets no replies because answering it makes the stranger invent what they're offering.

**Paste it back, don't rebuild it** — this is the whole thing (markup + `.pj-ask*` CSS in `projects.md` at
commit `3d3ebcc`, the section right above `.mcp-thanks`):
- **The three named openings**, each one a person who can recognize themselves: *an animator who works in
  Blender* (Princess is modeled with a first color pass — she needs to move) · *anyone who has actually
  shipped an animated series* (thirty minutes of what you wish you'd known) · *a producer or studio who
  works with independent animation* (there's a world, a cast and a pilot script; what there isn't is a
  second pair of hands).
- **The subject-line trick** — "put the one you are in the subject line" — so there is nothing left to invent.
- **"I answer every one."** That's the line that actually moves someone to write, and it's a promise Nate can
  keep at today's volume. If the inbox ever gets loud, soften *that* line first.
- **Full width**, lined up with the project cards — not the 640px centered column the thank-yous use. A block
  starting a third of the way across the page reads as a footnote.
- Deliberately still NOT on it: teaching/curriculum work (Nate: *"not yet"* — its own action item).

*A cheaper half that isn't gated at all: keep the reason-to-email problem, drop the hiring. One ask that's
true today — "tell me what's confusing about this site" or "what would make you come back" — costs nothing to
honor and still beats "Contact me for more."*

**Waiting on Nate, not on me — the Spotify hover** *(2026-07-27: "take a look at the spotify
profile in the top-right corner. When you hover, it slides out the onboarding progress circle")*.
Nothing like it exists on the site yet, so this is a build, not a fix, and it's outward-facing —
so it's his call, not mine. The PJCC version: `#nav-operative` (the top-right profile pill) wears
a thin **progress ring**; hover and it slides out with what's left to do — *claim a codename ·
play a rated game · solve ten puzzles · beat floor one*. It'd be the first thing on the site that
tells a signed-in visitor what to do next, which is either exactly right or exactly the nagging
we've avoided. **Say go and it's a contained build; say no and it stays here.**

**Waiting on Nate, not on me:** the **Journey map** decision (make the dots cost something · merge it into the
Gauntlet's climb · cut it) — the section at the bottom of this file lays out all three.

---

## 🗺 The Journey map — SCRAPPED 2026-08-04, parked here

**Nate: "Scrap the Journey map and the little character by it — and throw it in future ideas."**
Removed from `/dossier/` (commit after 6f7cd7a). Restore from git the commit before it: the
markup was ~6 lines in `dossier.md`, its CSS was 12 rules in the same file, and
`PJCC.JOURNEY` / `PJCC.journeyProgress` were ~8 lines in `pjcc-profile.js`.

**What it was.** A seven-stop strip across the Dossier — Checker Town → The Sand Mines → Fork in
the Road → Clearance HQ → The Updraft → The City Walls → **Chess City** — where each stop lit
gold once you'd played the game that lives there, the connectors lit only when *both* ends were
reached, and **your drawn avatar and your companion stood on the furthest stop you'd made.**

**Why it's worth reviving rather than forgetting.** It is the only surface that ever drew the
world as a *route* instead of a menu, and the little character standing on it is the single
cheapest version of "your guy is somewhere in this story". That idea scales straight into the
Godot build; it just didn't earn its space on a stats page.

**What it needs to come back well:** stops that mean something narratively rather than one per
arcade game (the current list is "the games we shipped", which is why it read as a checklist),
and somewhere with room to breathe — its own page, or the PJCC world tab, not wedged between a
codename and an achievements grid.

**⚠ The `JOURNEY` array still exists in `pjcc-profile.js` and must NOT be deleted as dead code** —
it backs the live **Globetrotter** achievement ("play every game at least once").

---

## 🚪 The front door — SHIPPED 2026-07-28, and the twenty names

**✅ Built.** `/chess/` is the front door (**McPuppy Chess**, working title), `/pjcc/` is the world
tab under Academy, and the intro card at `/` hands off to the new home. It carries **one** gold
button — Play Chess → the Park Tables — plus four doors, three true things, and one door to the
world. What follows is the brief it was built from, kept because the *reasoning* is what the next
pass should argue with.

### The twenty names *(Nate 2026-07-28: "rename the home page something more generic like McPuppy
Chess, like chess.com or lichess.org — throw out 20 ideas that have a PJCC spin")*

**Brand-forward** — inherits the logo, zero collisions, reads like Chess.com
1. **McPuppy Chess** ★ *(his own instinct, and the one it shipped under)*
2. **McPuppy Chess Club** — warmer; a club implies other people
3. **Puppy Chess** — kid-first, and the easiest name in the world to say
4. **McPuppy Board** — quieter, more studio than platform

**Place-forward** — the world's geography, which happens to sound like a chess brand
5. **Checker Town Chess** — the town where everyone in the story starts
6. **Checker Town Chess Club** — the beginners' club *before* the city; most on-theme of all
7. **Chess City** — the destination of the entire series. ⚠ collides with the `chess-city` game
   and the location page
8. **The Chess City Club**
9. **Chess City Open** — a tournament name; "open" says anyone may enter
10. **The Park Tables** — already a feature; too narrow to hold the whole site

**Journey-forward** — the arc, said out loud
11. **Pawn to Queen** — the whole series in three words, and literally what promotion is
12. **The Climb** — ties the site to the Gauntlet
13. **Queenside** — one word, unmistakably chess, elegant
14. **King's Walk** — a real endgame technique *and* a road
15. **The Long Game** — the studio's actual thesis

**Board-forward** — the most "generic chess site", with a PJCC wink
16. **Sixty-Four** ★ — the squares. Short, striking, no lore conflict, ages well
17. **The Open Board** — free, welcoming, no account required — the site's three facts in a name
18. **Board & Bark** — chess + dog; playful and unmistakably yours
19. **The Chess Yard** — schoolyard, backyard: where kids actually learn this game
20. **Follow the Board** — a spin on the creed (*follow the dog*)

**My order:** 1 → 16 → 6. #1 is the safe, brand-consistent, already-shipped answer; **Sixty-Four**
is the one a stranger would remember; **Checker Town Chess Club** is the one that makes the site
feel like a place in the story.

---

*(The brief below is the 2026-07-27 compass check that started it. Kept for the next pass.)*

**The measurement.** The PJCC home is **970 words, 31 links, four sections — and zero primary
buttons.** Not "the button is in the wrong place": there is no styled call-to-action element on the
page at all. Every route out is a *door tile* or a text link, and they all look equally important,
which is the same as none of them being important.

**What that costs.** On a 390px phone the first screen is: header · ticker · title · one-line lede ·
then **Characters** and **Locations**. The first thing a visitor can do is *read about a cast they
have never heard of*. "Play the Games" sits below the fold. A new arrival who came to play chess has
to scroll past two doors into the fiction before the site offers them a game — and the one sentence
that would have caught them ("a free chess arcade set in its world") is stated but not *actionable*.

**Why it happened, honestly.** Every section was added as a *world* — Characters, Locations, Fan Art,
the studio band — and worlds are browsed, not entered. Nothing was ever nominated as **the** thing to
do. That's a hierarchy problem, not a design one, and it can't be fixed by making a tile prettier.

**The rule worth keeping when the page is remade:** *one page, one obvious next action* — sized,
colored and placed so a stranger's thumb finds it without reading anything. The Academy already does
this and is the site's best page for exactly that reason: title → one warm sentence → one big orange
**Start Lesson 1** button. Nothing else competes with it.

**Four shapes it could take** — they're mutually exclusive; pick the promise the front door should make:

1. **"Play a game right now."** One gold button above the fold → the Park Tables seat picker (or the
   Gauntlet's first floor). Strongest for a cold visitor, weakest for the *story* — it sells the arcade
   and lets the series introduce itself second.
2. **"Meet Princess."** One button into a 20-second story beat — a cast card, a line of narration, a
   Blender clip when there is one — and the arcade one scroll below. Sells the show first. This is the
   one that fits *the belief* (Season 1 is the destination), and it's the one that needs art you don't
   have yet, which is precisely why it's a next-session decision and not a now decision.
3. **The board IS the button.** The hero already renders a real park table. Make it live: a position, a
   single legal move to find, and playing it drops you into the game you just started. No copy required,
   nothing to read, and it demonstrates the whole site in one gesture. Most PJCC-ish of the four; most
   work.
4. **Ask, don't assert.** Two buttons, one question: *"New here? — I want to PLAY / I want to WATCH."*
   Splits the audience honestly instead of guessing, and every later decision inherits the answer. Cheap,
   and it stops the page from having to be two things at once.

**What I'd do if it were mine:** #1 as the shipping default, because it's the only one that works before
the art exists — and it's a one-hour change. **#3 is the one worth building when the front door is
rebuilt anyway**: it's the same "show, don't tell" instinct as the town sky, and no other chess site on
earth opens with a board that starts your game when you touch it. #2 becomes obvious the day there's a
Blender clip to put behind it.

**→ WHAT SHIPPED (2026-07-28): #1, with #3 stubbed in.** The hero board is the canonical park-table
drawing wrapped in the CTA link — the whole block is clickable and reads *play* — but it is still a
DRAWING. **#3 proper is the next move on this page**: put a real position on it, one legal move to
find, and playing that move starts the game you just began. Everything needed already exists (the
perft-verified referee, the puzzle generator, `data-render="glyph"` boards in the Academy). That is
the front door no other chess site has.

**Also banked from the same pass:** the honest strip on the new home is only three lines long, and
the site has more true things than that — *engine-verified puzzles · a rating that starts at 250 ·
the arcade caching for offline · a review on every game · no ads, no freemium, no pay-to-win.* If
that strip ever grows, it should stay a LIST of facts, never a wall of feature cards.

**One thing to carry over regardless:** whatever the button is, the sentence above it should stay the one
that's already there — *"An animated series in the making — and a free chess arcade set in its world."*
It is the clearest sentence on the site.

---

## ♛ Gauntlet-as-flagship — the remaining framing moves
*(the hero band, boss cards, commentators, resume-continuity, rank badge, and games-page hierarchy all shipped; these three are what's left)*
- **Rename the experience** — "The Ascent / Coronation Run." Wire it explicitly to Princess's canon arc (she can learn anything → she rises to Queen): the climb this whole world is about. Framing + copy, zero code.
- **Advertise that it has a real ending** — lean into the coronation payoff (beating the CEO = the Princess → Queen moment + the secret ▾ DESCEND). Tease it ("Ten stand between a recruit and the crown"); the natural home for a short Blender cutscene intro.
- **A NEW CHAMPION EACH TIME (2026-07-15, Nate — "maybe a running-thing"):** the
  Checker Town Chess Open always has a *fresh* winner, so **Floor 1 is often a new
  opponent** — a rotating cast of first-floor champions instead of a fixed Argus. Plays
  as a running gag (the title never stays put) and keeps the bottom of the tower feeling
  alive on replays. Note the knock-on: the win text currently names Argus, and Argus is
  canon Floor 1 — a rotation means Floor 1's name/glyph/blurb come from a small pool
  (Argus among them), and all of them stay wordless per the "only humans talk" rule.
- **★ THE PRESENTATION CLIMBS WITH YOU (2026-07-15, Nate: "I love this concept")** — the higher you climb, the grander the *staging* gets, not just the opponent. The board itself dresses up floor by floor: a plain park set at the bottom → a nicer board + framing → **commentators arrive** (the booth is already built — bring it in around the mid floors) → **a crowd** fills in behind the players in the upper floors → and the summit is a **trophy + a ceremony** (podium, confetti, a rendered Blender coronation beat). Ties straight into the per-floor door art (cloth → mine → sea → shoji → city → tower) and the Princess→Queen payoff. Mostly CSS/staging layered on the existing booth + celebrate() confetti; the ceremony is the natural first real Blender cutscene. Sequence the reveals so each floor *feels* like a bigger stage than the last.

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
Rival/CEO *(the review's book is loaded now — the BOTS still don't play from one)* · a daily gauntlet ·
a captured-piece tray · more rungs (the secret King). *(The move browser shipped 2026-07-27 — `pjcc-replay.js`.)* Design doc:
[`docs/chess-ladder-design.md`](docs/chess-ladder-design.md).

**Notation Blitz:** Score Mode (charts the real themes — Av5 unlock) · diagonal & file lanes · coordinate
duel (the Rival speeds up on misses) · blind grid (fade the board mid-run; bridge to Blindfold) · combo
leitmotif (a streak layers a theme) · landmark BPM ladder.

**Blindfold / The Mind's Eye:** rebuild-the-board · piece-count ladder · voice-input (Web Speech) ·
phantom-blunder review · walk-the-knight audio drills · PGN import · relic boards · "solved it blind" card.

**Clearance: DELTA:** redacted-dossier meta · sudden-death OMEGA · audio-intercept questions · wager mode ·
daily briefing · three lanes (rules / lore / chess history) · spot-the-lie (ARG) · question forge (UGC) ·
clearance-gated lore · speed-vs-accuracy dial.

**Fork in the Road — now THE PUZZLE ROOM** *(6 provable motifs as of 2026-07-27, incl. Winning Material,
Discovered Check and The Pin; its own roadmap lives below — "🧩 The Puzzle room — where it goes next")*:
endless one-life gauntlet · blitz tactics · boss-gate taunts · mistake replay (spaced repetition) ·
race the creator ghost · construct-the-fork · reads-you difficulty. *(Theme drills are now a `cat` filter
away — every puzzle carries its motif. The daily tactic + streak is live as the Daily Ladder.)*

**The Pirc Protocol:** opponent personalities · weekly annotated model game (Argus's voice) · side-switcher · trap of the week ·
repertoire builder (UGC export) · "out of book" alarm · boss: the Rival's prep.

**Sand Mine Depths:** light beacons + fog-of-war minimap · cave-in chains · Auston-camp one-run consumables · relic
sets · knight-only traversal rooms · explicit biome shifts.

**Shogi Island / Catch the Lion** *(and **The Reading Room** below): both are **slow-rolled — hidden from the
hall today** ([[slow-roll-cast]]); everything here waits on the reveal.* *(already most complex — 9×9 rules, tsume solver, AI; add carefully).*
Handicap ladder vs the Lion AI · piece-reach trainer · tsume-of-the-day · drop-rule drills · calligraphy
wall (JP tie) · castle drills · 9×9 stepping-stone · the Lion's moods · Codex bridge · island hot-seat duel.

**Sky Run:** lore bosses · **view-switch in Boss-Mode** (next) · new power-ups (Rook wall, pawn-storm, en-passant dash) ·
co-pilot couch co-op · loadout select · boss rush.
> **★ The view-switch — a signature mechanic (Nate, 2026-06-23).** When a boss appears, the camera *cuts to a
> different view* (side → behind / top-down / over-the-shoulder) for the fight, then cuts back. It's the same idea
> as the Battle Room's screen-flip: **switching view is meant to become a signature across many PJCC games** once
> the animation pipeline lands. Web version: swap the render projection for the boss phase (a CSS/canvas transform
> or a second draw routine) with a quick "VHS cut" transition; later it becomes a true camera cut in Godot.

> **★ DO A BARREL ROLL (Nate, 2026-07-28 — the hall caption now promises it, so the game owes it).**
> Sky Run's only defense today is *not being there*: you move, you hold ◎ FOCUS for a precise beam and a
> visible hitbox, you bank ♟ pawns for SUMMON. There is no escape move — which is exactly the hole a roll fills.
> 1. **The roll itself.** Double-tap left/right (swipe on a phone, or a shoulder-ish second button) → a ~250ms
>    lateral roll with **i-frames**, ~1.5s cooldown, sprite spins through 360°. This alone is the biggest
>    feel upgrade available in the game, and it's what anyone reading the caption already expects.
> 2. **Deflect, don't just dodge.** Bullets crossed *during* the roll **reverse** and take your color instead
>    of vanishing. That turns a panic button into a technique — good players will roll INTO the thickest
>    patterns on purpose, and a boss's own volley can be sent back through its telegraphed weak-point window.
> 3. **★ The roll is the piece you've promoted to.** She already has a rank/promotion track. Make the roll
>    inherit it: **pawn** = a short hop · **knight** = an actual L (one lane over *and* a step up) · **bishop**
>    = diagonal · **rook** = a full-width dash · **queen** = you choose. The escape move becomes a piece-movement
>    drill nobody notices they're doing — the *every-game-teaches* thread, and the reason this belongs in THIS
>    shmup and not a generic one.
> 4. **Pay for it with pawns.** Instead of a cooldown, a roll can cost one banked ♟ — the resource you were
>    saving for SUMMON is the one that saves you. A real decision every few seconds, and the counter already exists.
> 5. **The voice.** Peppy is the joke everyone knows; the PJCC version is the companion yelling *"DO A BARREL
>    ROLL!"* at the **wrong** moments — during a quiet stretch, and never when you're actually about to die.
>    One line per run, seeded off the town date so everyone hears the same nonsense that day ([[ticker-voice]] rules
>    don't apply here — this is a character, not the news desk).
> 6. **The Air Show.** Count *clean* rolls (passed through ≥1 bullet, took no hit) and pay them out as their own
>    end-of-run line — "AIR SHOW · 14 clean ×25" — so the flashy thing has a reward without polluting the survival
>    score. Same shape as Sand Mine's HARD WAY bonus.
> 7. **The 360, hidden.** Three rolls back-to-back without firing a shot or taking a hit → a full loop with a
>    trail and a minted `frag_*`. Nobody finds it by accident; everybody finds it once one person says the words.
>
> **Cost, honestly:** 1 + 6 is an afternoon (a `roll` state on `G`, i-frames in the collision pass, a sprite
> rotation, one HUD line). 3 is the ambitious one and wants the promotion code read first. 2 changes balance —
> returned bullets are strong — so it needs real playtesting before it ships.

**Follow the Dog** *(formerly Space Run — renamed 2026-06-23):* *(not yet wired to PJCC — do that first).* Then:
qualifier framing · collect-a-set upgrades · legality-dodging · rival racers · daily track · tactic-shortcut
branches · cosmetic ships · speed-tier music · near-miss combo · lean into the **"follow the dog"** creed (the
companion you chase becomes the guide).

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

1. **The Ferry Crossing** — the perpetually-delayed Shogi Island ferry as a timing game: hop drifting board-tiles across the rough Sea before the gangway lifts. Pays off the "ferry delayed" running gag and the Sea region. *(Note: a first pass — "Ferry Delayed" — was built and **deleted 2026-07-06**. If this comes back it needs a real hook, not the same minigame.)*
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
- **P1 Gray-box room:** GridMap board, King-step hero (tween), TurnManager; step on Stairs = win.
- **P2 Art:** model/rig Princess + piece-enemies (idle + hop/attack anims); biome board materials.
- **P3 Rules:** port the prototype's movement/attack logic to GDScript; the threat telegraph; hearts.
- **P4 Relics & run:** stacking move-relics + a 3-relic choice screen; track run state.
- **P5 Floors:** seeded enemy placement, biome swaps, every-5th boss room.
- **P6 Web + wire:** HTML5 export under `assets/games/godot-dungeon/`, Jekyll wrapper, JavaScriptBridge → `PJCC.saveScore('dungeon', …)` so 3D posts to the same board.
- **P7 Juice:** shake, particles, a Blender cutscene intro.
- **P8 Ship v1:** tune vs the ghost; announce with a Blender trailer.
- **Anti-overscope:** P0–P3 are the real risk. Get **one beautiful web-exported room** live before floors, relics, or bosses.

### 🌊 The scene Nate wants to render *(2026-07-14, his words: "one important scene")*
**A chessboard on the open sea, its ranks rising and falling on a sine/cosine wave.**
The board is the water — files and ranks bend with the swell, pieces stay upright on
their squares while the squares themselves roll. Cheap in Blender: a subdivided plane
with a checker material, displaced by `sin(x·a + t) + cos(y·b + t)` (a Wave modifier or
a two-term displacement in geometry nodes); pieces parented to the surface so they ride
it. Sits on top of the **Tidecaller** (Gauntlet Floor 3, The Sea) — this is *his* board.
Use it as a cutscene intro / title card ([[idea-blender-cutscene-intros]]) and, further
out, as the Tidecaller's actual battle backdrop. **The Floor-3 door on the site is the
first sketch of it** — a checkerboard riding a sampled sine (`_pjcc-09-widgets.scss`).

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

> ★ **THE HIDDEN TRACK** *(2026-07-17 Nate — "bring back the hidden track like on CDs; that was fun."
> References he loves: The Lawrence Arms' 3 secret tracks on* Cocktails & Dreams*, NOFX's funny one on*
> Punk in Drublic*, Pennywise burying arguably their best — "Unknown Road" / "Slowdown").* The design is
> ready; it needs ONE audio asset (a McPuppy-original chiptune, or a track Nate points at) to go live.
> **The mechanism — the faithful CD trick:** a small McPuppy player on `/projects/` (or the splash) whose
> transport can **rewind BEFORE 0:00** into a *pregap* — hold ◀◀ at the start of track 1 and the counter
> runs to −3:00, revealing the ghost track (exactly how you reached the pre-gap cut on a real CD). Alt
> gesture for the same reward: after the last listed track, a long silence, then the bonus fades in
> ("ghost track"). Unlisted on purpose — no label in the tracklist; found, not shown. Ties to the ACC
> **musical rite** already in Av13 (tap A–C–C) as a sibling secret, and to the McPuppy B/W studio brand.
> **Nate's one call:** which track is the hidden one (record/point at it), then this ships.

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

**Av17 — The Gambit (the altar of sacrifice)** — *v1 is live at `/the-gambit/` — its own room off the PJCC home since 2026-07-14* (offer credits + an owned
collectable; a **Courage meter** shows the real odds before you commit; guardrails: never real money, a daily cap,
a cooldown, a two-tap "no takebacks").
> **✅ Shipped 2026-07-27:** the **altar-only rewards** are real — a donated collectable can return a *different*
> one, including **Vault** pieces that are in no shop (3 avatars · 2 titles · 2 themes, `rule:'vault'`), revealed
> on a full-takeover result card. The odds were also retuned to a six-tier wheel that **expects to lose you
> credits** (0.66×→0.89× by courage), which is the anti-casino math the brainstorm below asks for.
>
> **What's LEFT of the v2 roadmap:** the Uncle presiding · canon **fragments** as rewards · sacrificing the
> streak-flame / rank / clearance (things that hurt, not just credits) · hold-to-offer · the Monument · a
> protected first offering · pay-it-forward.

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

> **Nav** — *superseded 2026-07-21: the top bar became a **left drawer / collapsible desktop rail**
> (`#site-nav.drawer`, 7 links), so the old "sticky mini-bar" and "drop the middle nav slot" notes are dead.*
> What's still open there: whether the ⌘K palette deserves a visible handle inside the rail for people who
> will never guess a keyboard shortcut.

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
16. 🎬 **Parallax location art** — scenes with depth layers that drift on scroll/tilt; a cheap "3D" before the real 3D.
17. ★ **Time-of-day states** — a location page shifts day/dusk/night like the Companion Den.
18. 🎬 **Walkable panoramas** — 360°/scroll-pan location views; the web precursor to the Godot/VR walk.
19. **Gate-locked locations** — Shogi Island's deeper pages open via the Av13 rite (you already built the gate).
20. ★ **Location ⇄ game links** — each place names its game (Checker Town → Notation, Sand Mines → Sand Mine Depths, Shogi Island → Shogi/Reading Room): the funnel, made explicit.
21. ⛁ **Living world-state** — locations reflect the news ticker / ARG (the "ferry delayed" beat literally shows on the Shogi Island page).
22. **Location soundscapes** — ambient loops (Checker Town hum, the Sea, the dojo) — Av5.
23. **The crash site** — a discoverable hidden location that pays off an ARG fragment (the origin).
24. 🎬 **Blender flythroughs** — short rendered location intros as loading screens / season trailers.
25. **Checker Town Field Guide** — a printable art-book leave-behind (Av4 physical).
26. ⛁ **Journey tracker** — your operative's position on the road to Chess City, advancing with progress.
    *(Built, and on the Profile today — but read "🗺 The Journey map — decide what it's FOR" at the bottom
    of this file before adding to it; the dots currently light for merely opening a game.)*
27. **Seasonal location reskins** — advent, the anniversary of the crash, premiere week (Av9 live-ops).
28. 🎬 **The Pieces gallery (moved here from Characters)** — the **six Blender board-pieces** (pawn/rook/bishop/knight/queen/king, each scaled to the Battle-Room concept, Princess = the knight). *Belongs in the **Evolution Log** as renders land* — show concept → gray-box → final per piece. Frame it as "the board itself is a place." (This is where the old `## Pieces` section now lives.)

---

# 🧵 Twenty for cohesiveness & ingenuity *(2026-07-12 — Nate asked)*

 The first ten are **cohesion** (make it feel like one place). The
second ten are **ingenuity** (the clever, cheap, memorable stuff).

### Cohesion — make it read as one world

5. ~~**Write the voice chart down.**~~ **SHIPPED 2026-08-03** — `/style/` has a *Type — the voice
   chart* panel: six faces, each with the brand that owns it (Poppins + Inter = both · Share Tech
   Mono = PJCC · Press Start 2P = the arcade · the studio serif = McPuppy · the place serif = the
   Reading Room and Shogi Island), and — the half that actually stops drift — **where each one is
   never used.** The rule written under it: *a face is a voice, not a decoration.*
6. ~~**Every game should wear the town's sky.**~~ **SHIPPED 2026-08-03** — all sixteen shells load
   the same clock (`/assets/js/pjcc-time.js`, generated from the one include) and a static phase +
   weather wash. ⚠ **It is deliberately faint, and that is measured, not taste:** ×3 is where it
   reads best, but ×1.5 already pushes nine real text pairs under AA and ×2 sixteen. Five muted
   colors had to be lifted to make even ×1 clean. Louder later = lift the type first, measure,
   then turn it up.
7. **The journey map is the site's real spine — use it more than once.** The dossier has the
   map of stops (Checker Town → the Sea → Chess City). That's the actual shape of the world.
   A one-line version of it in the games hall would tell a player where they are *in the
   world*, not just in a menu. *(Decide what the map is FOR first — see the section at the
   bottom of this file; reusing a checklist twice just doubles a checklist.)*
9. **The teachers don't mention what they teach.** Auston runs the only open Academy hall — his
   character page doesn't say so. One line on each teacher's page ("Auston teaches the
   squares") ties the cast to the arcade for the price of a sentence each.

### Ingenuity — the cheap, strange, memorable stuff

> **★ SAVED — the two weather secrets he wants kept** *(2026-08-03: "Save these two: a reflection
> in the Chess City windows, a figure on the Sea. People will **talk** about that one.")*
> Both are the same move as the hidden boards — something that only exists in certain weather —
> and both are *sightings* rather than mechanics, which is why they are worth more than a reward.
> · **A reflection in the Chess City windows.** On a wet day the towers on the skyline hold a
>   reflection that is not the street in front of them. Nothing to click, nothing to earn. You
>   either notice the glass is showing the wrong thing or you don't.
> · **A figure on the Sea.** In mist — the one condition where you *cannot* see the far shore —
>   something is standing out on the water. Gone when the mist lifts. Never explained, never in
>   the ticker, never on a page that lists it.
> The whole value is that neither is announced, so whoever finds one has to convince somebody else
> it was there. Both wait on the art they'd be drawn into; the weather hook they need already
> exists (`PJCC_TIME.weather()`), and the hidden boards are the working proof of the pattern.


11. ~~**The sky remembers.**~~ **SHIPPED 2026-08-03** — the wire carries one quiet line, once, on
    the visit where the hour of the world has changed since you were last here: *LAST SEEN: DUSK.*
    Four lines of `localStorage`, and the order of them is the feature — read the old phase, decide,
    then write the new one. The write is what spends it, so there is no counter to get out of step.
    Suppressed on a night the desk is unattended, and suppressed **before** the write, so a memory
    is never spent on a night it could not be shown.
12. ~~**One secret that only exists in the rain and snow.**~~ **SHIPPED 2026-08-03** — exactly one,
    as asked: **the hidden chessboards**. Three days in ten the town rolls rain (snow from December),
    and only on those days do the marks exist anywhere on the site. Clear day, no boards. It reads
    the FORECAST, not the rendered weather, so a reduced-motion visitor — who never sees a drop fall
    — can still find one. The card says *"Left out in the rain."* so the finder learns the rule.
    Preview any day with `?wx=rain` / `?wx=snow`.

13. **The shooting star is a wish.** One crosses the night sky now. Make it clickable for the
    ~1 second it's visible. Catching one gives something tiny and lovely — a fragment, a line
    from Princess, one credit. Almost nobody will catch one. That's the point.
14. **Put the Gauntlet's opponents where they live.** The Tidecaller belongs in the Sea. The
    Sand-Mine Foreman belongs in the Sand Mine. One line on each *location* page naming who
    holds it, and the tower stops being a menu and becomes a map.
15. **"New since your last visit."** The Build Log exists, but someone who came last week has
    no idea what changed. One quiet line under the nav on the PJCC home, read from
    `localStorage`. No email, no popup — private by default, in both senses.
16. **June 13 already works. Give the town three more.** Princess's birthday puts *"for
    Princess"* in the splash footer with no announcement. Same one-line pattern for the first
    commit and the Episode 1 premiere. Nobody is told; the people who notice, notice.
18. **One number that's about other people.** Every counter on the site is derived from a date
    — days in development, days to Episode 1. Nothing reflects *anyone else being here*. One
    honest live number ("games played this week") would make the place feel inhabited.
19. **Print the certificate under the sky it was earned in.** The Academy already generates a
    certificate with a verify code. Give it the town's sky behind it, at the hour it was
    awarded. A kid's certificate that says *awarded at dusk* is a small, strange, memorable
    object — and it costs about one CSS rule.
20. **Nobody knows the arcade works offline.** The service worker warms 18 games and Stockfish;
    the whole thing runs on a plane. That is genuinely rare, and the site never says so. One
    line in the games hall — *"These games work offline."* Not a prompt. A fact.

---

## 🅿️ Parked (pulled from the live site, kept so the work isn't lost)

- **🏆 The Hall of Fame & Seasons** *(2026-07-12 — Nate: "remove the hall of fame completely,
  from all pages, but add it to Future Ideas")*. Every month was a **Tour** — a leg of the
  Journey. You scored season points by playing anything; whoever logged the most action by
  month's end was crowned and entered the Hall of Fame *forever*. **Why it was pulled:** it was
  a trophy case with nothing in it. No season has ever closed, so `PJCC.HALL_OF_FAME` was an
  empty array — and the page advertised an empty room from the busiest surface in the arcade
  (a gold plate at the top of `/leaderboards/`) and from the dossier.
  **What it needs before it comes back:** (1) actual players, (2) a season that has actually
  *closed*, and (3) an answer to "what does the champion get?" that isn't just a name on a
  list — a cosmetic, a title flair, a permanent mark somewhere in the world. A champion who
  wins nothing is a leaderboard with extra steps.
  **Restore from git:** `hall-of-fame.md`, `PJCC.HALL_OF_FAME` in `assets/js/pjcc-profile.js`,
  the `.lbtv-hof` plate + styles in `leaderboards.md`, and the `.dsr-season` strip in
  `dossier.md` — all as of the commit before `c12773e`. `PJCC.seasonInfo()` and
  `PJCC.seasonRace()` are still in the codebase and still work.
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
- **♘ Knight's Tour — DELETED 2026-07-14** (with Ferry Delayed and Zoomies). Its polish list —
  rubble squares · a constellation trail (→ `/constellation/`) · undo-budget mode · two-knight co-op ·
  Academy teach-mode · forcing-move knight puzzles — retired with it, and is written here so the ideas
  survive the game. **Restore from git** if the knight ever comes back; the strongest survivor is
  *forcing-move knight puzzles*, which the Puzzle room could build provably today.
- **Games-page search box** and **sort dropdown** — re-add if the library outgrows one screen.
- **De-linked nav pages** (revisit with real content): Sound, Soundtrack, Press Kit, Lore Codex,
  Evolution Log. **World Map** left this list 2026-08-03 — it was DELETED (layout + the `.wm-*`
  half of its stylesheet), not parked. Don't rebuild it from here. **Podcast** removed (a "Coming
 Winter 2026" teaser sits on the homepage). **Chess Lessons** folded into About.
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

## ☯ The fading-memory notification — *pondered, not built* (2026-07-29)

Nate, in the karma batch: *"We can randomly notify them if you think that's fun. Might be too much.
Just ponder that last part for now and do the rest please!"* Everything else in that message shipped;
this is the ponder.

**My read: the random one is a no, and there is a better version of the same instinct.**

The instinct is right — a memory that fades silently is a mechanic nobody experiences. But a
*notification* is the site tapping someone on the shoulder about a thing they cannot act on except
by coming back, which is the exact shape of the re-engagement nag we have refused everywhere else
([private-by-default], and the whole reason the profile ring is still parked). "Your sacrifice is
fading" is a guilt timer with a ritual costume on. It would also be the first thing on this site that
punishes not visiting, and the altar's own creed is *let go*.

**What I'd build instead, if he wants it — the board mentions it, unprompted, on your next visit.**
No push, no badge, no email; the room simply says it when you are already standing in it:

> *"Two memories faded since you were last here. The board has let them go."*

One line in the altar, only when something actually expired between visits (`lost` already counts
them — the number is sitting there unused). It is honest, it is a consequence you can see, and it
costs nothing to a person who never comes back. **Chess City arrivals already see the full ledger
fading in real time** via the magnifying glass, which is the deluxe version of this and is live.

The louder variant, if he ever wants a hook: **a memory about to fall off gets one last chance** —
the visit where an entry drops below ~0.25, the altar offers to redeem it for a fraction. That turns
a decay into a decision, which is more interesting than a notification. It also makes karma
farmable, so it would need the same house-edge check the wheel got. Banked, not recommended yet.

## ◈ CREDITS THAT MEAN SOMETHING — 20 ideas (2026-07-14, Nate: "we need credits to mean something. Think hard on it")

All inside the [game-monetization-ethics] rails: cosmetics, rituals and access — never power,
never pay-to-win, never real money. Grouped by what they feed.

**Identity (you wear it)**
1. **Park Tables board skins** — buy square palettes for YOUR games; your opponent sees them too, so it's status at the table.
2. **Piece sets** — Quartermaster carved sets (driftwood, jade, tide-glass) that skin every chess game you play site-wide.
3. **Rating-chip finishes** — bronze/silver/gold metallic polish on your "Rated ___" chip once you can afford it.
4. **Dossier trim tiers** — gold-leaf borders and a wax seal on your operative file.
5. **Victory flourishes** — a purchased win-chime + confetti color that plays when YOU win at the tables.

**The companion (the cute engine)**
6. **Pet outfits** — bandanas, tiny hats, scarves; pure cosmetics on the companion everyone already loves.
7. **Treats** — 2cr triggers the trick animation; a joy sink with zero power.
8. **Den furniture** — rugs, lamps, a bookshelf for the pet's room; the den becomes a credit gallery.

**The town (the world remembers you)**
9. **Sky lantern** — 10cr floats a paper lantern across YOUR town sky for a day.
10. **The Statue of the Pup** — a COMMUNITY sink: every credit anyone burns adds to a global counter; the plaza statue is built in visible stages and unveils a lore plaque at each stage. The whole town builds it together.
11. **Table plaques** — preset engravings ("The Old Oak Table", "Winner Stays") shown on your open tables in the lobby.
12. **Chess City window** — a dossier diorama apartment you furnish piece by piece.
13. **Personal weather** — 25cr makes it rain on YOUR sky for a day (the town's roll is untouched).
14. **Orb trail** — a faint comet tail on your sun/moon arc, just for you.

**Ritual & lore (credits as courage)**
15. **The Gambit IS the credit furnace** — lean in: the Monument (100cr inscription, preset lines), the protected first offering, pay-it-forward blessings for the next stranger.
16. **Clearance bribes** — the "…or bribery" egg made real: 50cr skips ONE Clearance question, stamped BRIBED on the result (a cosmetic shame-badge people will want).
17. **Lore keys** — credit-priced Subject Zero fragment early-unlocks (the rank ladder still unlocks them free later — impatience, not power).

**Access & occasions (still never power)**
18. **Season cosmetic track** — each month's Season (they already exist) gets 3 buyable palette items that retire forever when the month ends; scarcity without pressure.
19. **Jukebox requests** — 5cr queues a McPuppy track as your personal site soundtrack for the session.
20. **Gift a boon** — spend credits to leave a small cosmetic gift on a friend's dossier with a preset note ("Well played." — the Park Tables phrases, reused). Generosity as the flex.

**The one to build first:** #1 + #2 (Park Tables skins/sets) — the rating ladder gives credits an ARENA;
status next to a number people compete for is the strongest meaning credits can have. #10 is the
long-game community heartbeat.

## 📣 The three plays (2026-07-13 — Nate asked: socials, streaming, app stores)

### The Socials Play
**This week (free, 20 min):** reserve @McPuppyStudios on YouTube, TikTok, Instagram, X, Facebook,
Reddit — before a squatter does. Bio + link to mcpuppystudios.com, then SILENCE. A reserved empty
account costs nothing; a lost handle costs the name.
**Start POSTING only when Blender output exists.** The unit of content is one vertical clip
(15–45s): a render going wireframe→lit, Princess's walk cycle, a sky timelapse. Make it ONCE,
post to TikTok + Reels + YouTube Shorts simultaneously — same file, three audiences. Cadence
beats volume: 2/week sustained beats 10 in launch week then nothing.
**Order:** YouTube first (the archive + the search engine), short-form second (discovery),
X/Facebook parked. Reddit is PARTICIPATION, not promotion — be a real member of r/blender +
r/godot posting WIPs; the profile link does the marketing.
**The sanity rule:** socials point AT the site, never replace it. The site is home; clips are flyers.

### The Streaming Play
**Never build streaming into the site — embed it.** Stream to YouTube Live (free, auto-archives
every stream). The site gets ONE page: /live/ — the player when live, the archive playlist when
not. Zero bandwidth cost, zero infra.
**Three formats, one per week max:** ① build-with-me (Blender/Godot, screen+voice, no face-cam
needed), ② chess night at the Park Tables (play challengers live — the matchmaking build becomes
a ritual), ③ monthly Q&A once there's anyone to ask.
**Value before an audience: reps + library.** The first 20 streams are practice nobody watches —
that's a feature, not a waste. When the trailer hits and 500 people look you up, they find two
years of archived honest work. That library IS the studio's credibility.
**Gear: none.** OBS (free) + current mic. Upgrade nothing until streams clear 10 concurrents.

### The App Store Play
**Costs, plainly:** Google Play = $25 ONE-TIME. Apple = $99/YEAR forever, or the app is delisted.
No meaningful tiers. Year one ≈ $124, then $99/yr.
**The trigger, not a date:** ship when EITHER (a) Episode 1 releases (catch the install surge) or
(b) the PWA shows real weekly return visitors. Never before — don't start Apple's meter for zero
users.
**The path (Android first):** flip the PWA public (the ENABLED switch — already built) → wrap
with Capacitor/Bubblewrap into an .aab → Play Console $25 + listing + content rating + data-safety
form → review ≈ days. iOS after: needs a Mac (or a cloud Mac ~$25/mo for one build month), Xcode +
Capacitor, App Store Connect listing, review 1–3 days — expect one rejection round; kid-adjacent
apps get COPPA/privacy-label scrutiny.
**One warning:** Apple rejects thin webview wrappers (guideline 4.2) — lead the store build with
the offline arcade, which already works and feels native.

### Park Tables v2 (the matchmaking follow-ups)
Supabase Realtime channels instead of polling (true live feel) · **real** blitz clocks *(per-move clocks are
live; a total time bank is the section below)* · draw offers · under-promotion picker · spectator links ·
a Park Tables leaderboard (wins as a channel) · credits for finished games ONLY after an anti-abuse think
(two accounts shaking hands is free credits). *(✅ the move browser — back/forward through a finished or
live game — shipped 2026-07-27 on both the tables and the Gauntlet.)*

#### ⏱ REAL BLITZ — a total game clock (5 / 10 / 15 / 30 / 60) *(Nate, 2026-07-25)*
*His ask: "Shouldn't Blitz Bench be more like a total 5 minute game? And then a 10, 15, 30, and 60
options?" — the right instinct, and it's a **different clock system**, not a preset. Banked with the
shape written down so it's a build, not a rethink.*

**Why it isn't a one-line change** — everything at the tables today is **correspondence**:
- The clock is **per-move**, not a total bank (`control_secs` = seconds allowed for ONE move).
- The server **whitelists three values** — `p_control_secs not in (3600, 86400, 259200)` raises
  (`docs/park-tables-setup.md`). A 300-second table is refused today.
- A flag **only falls when the opponent claims it** (`claim_timeout`) — nothing auto-flags.
- The board **polls every ~4s**, which is fine for a day a move and useless for a 5-minute game.

**What a real blitz table needs (in order):**
1. **SQL** — a `mode` ('per_move' | 'total') + `ms_w` / `ms_b` time banks on `matches`; widen the
   whitelist to the classic set (300/600/900/1800/3600). `play_move` decrements the mover's bank by
   `now() - last_move_at` and **auto-flags at zero** (the server already does this exact arithmetic in
   `claim_timeout` — it moves, it isn't invented).
2. **Client** — a ticking clock per nameplate (local countdown, re-synced from the server on every
   move), plus a low-time state. The nameplates (`.pt-plate`) are already the natural home.
3. **Sync** — **Supabase Realtime channels instead of the 4s poll** (already listed above as the v2
   upgrade); blitz is the feature that finally *requires* it.
4. **Then** the seat picker gains a real "Blitz" bench and the 5/10/15/30/60 options.

**Sequencing note:** this is the single biggest jump the tables can make (it turns correspondence into
*live chess*), and it's also the one that most wants the Realtime upgrade first. Worth doing — after
the identity/lobby slices, or whenever Nate wants live play more than he wants polish.

#### ★ The Park Tables build-out — GREENLIT 2026-07-25 (Nate loved 1–4, banked 5)
*A five-thread plan to grow the tables from "a matchmaking page" into a **place**. Nate: "Yes, love
number 1 and 2. Number 3 FOR SURE including the Princess avatar watching. Do number four as well.
LOVE number 5, let's save it." Build order I proposed: **#2 identity + #1 living lobby first** (highest
leverage, ties every existing system together), then #3, then #4; #5 is the big communal set-piece.*

1. **The park as a *place*, not a list.** The lobby becomes the actual park: the bots are **seated
   regulars** at named tables with a live status line ("Argus is thinking…", "Father just took a rook"),
   and the scene reads the **town sky** — busy & bright by day, one lamplit table + Night-Desk quiet
   after dark. You *walk up* to a table instead of clicking a row. (Ambient/CSS + the local bot state
   already exists; status lines are flavor.)
2. **One identity across the whole site.** Wire the Park Tables **PJCC Rating → the Clearance ladder**
   (RECRUIT → DELTA → GAMMA → BETA → OMEGA); your codename wears a **clearance pip** that climbs as you
   do, so the quiz game, the tables, and the Profile speak one language. Plus **earned, cosmetic-only**
   board/piece skins (first win · beat a bot · reach a rating · review 10 games) — free unlocks, zero
   advantage (see [[game-monetization-ethics]]). *The clearance-pip slice is the contained first build.*
3. **Playing the Creator is an *event* — + a nemesis + Princess watches.** A **recurring rival** (a
   persistent operative who keeps re-challenging you); beating them enough **unlocks a lore FILE** (same
   reveal beat as Clearance: DELTA), tying the tables to the episodic story. And the **Princess avatar
   watches your game** — she perks up / reacts on a **brilliant move** (flagged by the free
   [[game-review]] engine), extending the existing win-glint. *(Nate: "FOR SURE including the Princess.")*
4. **Every game quietly teaches.** After any Park Tables game, one tap → **"your one turning point"**
   (the biggest eval swing) as a mini-lesson, and an offer to **turn your blunder into a Fork-in-the-Road
   puzzle** ("you missed this"). Review → puzzle → Academy, one loop. Rides the review engine that's
   already wired into finished games. Ties to [[accuracy-above-all]] + the Academy.
5. **★ THE CONSULTATION GAME (banked — "LOVE number 5").** The whole community plays **one board against
   McPuppy** — **one move a day, the most-voted move wins.** Preset/vote only, so it stays child-safe by
   construction; a genuine recurring **event** the blog/Dispatch can narrate move by move (a slow, shared
   game vs the Creator). Wants backend (a daily tally + a vote RPC) — the big set-piece, sequenced last.

#### 🎣 The second riff — leftovers from the same session *(2026-07-25, "keep riffing")*
*Written while inside the tables, so each leans on something that ALREADY exists (the rating, the live
opening-name caption, the free review engine, the correspondence poll, the town sky). ✅ = shipped that
day. The rest are unbuilt and unclaimed — no order implied.*

- ✅ **Tables with personalities** — named seats, each a preset with its own accent + character.
  *(Nate: "100%. Love that." — SHIPPED 8a5e9a2: the Study Table / the Arena / the Quick Bench.)*
- ✅ **"It's your move at the park"** — a quiet site-wide pip when a table waits on you.
  *(Nate: "is awesome, let's smartly incorporate that." — SHIPPED a63d59e, `pjcc-mymove.js`.)*
- **Odds tables (handicap = a lesson).** McPuppy or a bot plays *down material* to teach — "beat Robert
  without his queen." An honest difficulty dial that doubles as an Academy concept (you learn to
  **convert an advantage**, the thing the arcade currently never drills). Pairs with thread #4.
- **"While you were away."** Come back to find your opponent moved overnight, with one warm line —
  *"Argus moved while you slept."* Turns the 4-second poll into **getting the mail**; it's the whole
  charm of correspondence chess, which most sites bury. Cheap: the timestamp is already on the row.
- **Head-to-head heat.** A running record + a rivalry meter per opponent (*"You lead Auston 4–2"*).
  Delivers the **nemesis feeling of thread #3 without inventing a character** — the tension emerges
  from your own history. Reads finished rows that already exist.
- **The prep seat.** A bot that plays **your own most-played opening** right back at you (read from the
  live opening-name caption / `PJCCOpenings`). Feels eerily personal, and quietly teaches you **both
  sides** of your favorite line.
- **The Opening Passport.** Play N *distinct* named openings at the tables → collect stamps. Turns
  variety into a collection and feeds thread #2's cosmetic unlocks. The opening name is already on the
  board, so this is mostly bookkeeping. *(Flagged as one of the two best "ship this week" candidates.)*
- **The game postcard.** One-tap share card of a won game — final position on the canon board + result
  + opening name. The piece-canvas renderer already exists; **every share is a tiny advert for the
  world** (same logic as the Av10 "embeds are adverts" line).
- **Comeback of the day.** The review engine already computes the eval graph — surface the biggest
  **lost-position → win** swing as a celebrated beat. *You were losing, you believed, you won.* The most
  on-brand thing the tables could possibly say — straight to the Neville / New-Thought center
  ([[moral-values-positioning]]). Strong candidate for a recurring blog/Dispatch beat.
- **Brilliancy glint.** A review-flagged brilliant move makes **Princess perk up** *and* drops a
  one-time **gold glint on the square** — extends the existing win-glint (canon rule in
  [[chess-visual-canon]]) and is the natural home for thread #3's Princess-watches beat.

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

---

## 🌙 The Night Desk — what's LEFT after the rogue build *(the four chosen ideas shipped 2026-07-27)*

The badge decay, the slack night, the edited headlines and the abandoned desk are live, each
rolled off the town date. One idea from that batch was **not** chosen and is still on the shelf:

- **The retraction sequence.** Three consecutive, deliberately ORDERED lines (not shuffled): a
  rumor → a bolder version of it → *"THE PREVIOUS TWO ITEMS HAVE BEEN RETRACTED BY THE PERSON WHO
  WROTE THEM. THAT IS ALSO ME."* One person losing the plot in real time. The hard part is that the
  crawl is a shuffled loop with a seamless clone, so an ordered run of three needs its own
  container — worth doing only if the desk earns another pass.

Two more that would extend the same joke, if it's ever wanted:

- **The day desk notices.** One morning line, once, that never explains itself:
  *"CORRECTIONS: SEVERAL ITEMS FROM THE OVERNIGHT CRAWL HAVE BEEN REMOVED."* The whiplash currently
  only runs one way — the day desk never acknowledging it is funny; acknowledging it *once* is funnier.
- **The desk answers the weather.** The forecast already changes voice at midnight. On a rogue night
  he could disagree with it outright — *"THE DAY DESK SAYS FAIR. I AM LOOKING AT RAIN."*

(House rule kept: the Night Desk is an unnamed employee, never a cast member.)

---

## 🌙 Five things to do with a sky that now has real moon phases *(2026-07-27 — Nate: "let's make that some sort of easter egg, MAYBE. Give me your best five ideas; really going for a WOW factor")*

The groundwork shipped today: `PJCC_TIME.moon()` returns the **genuine** synodic phase for the
town's date, the sky draws the terminator, and overcast/rain can hide the orb entirely. That
means the sky is now a thing a visitor can *verify against their own window* — which is the
rarest currency a website has. All five below trade on that.

1. ⭐ **THE NEW MOON DOOR.** Once a month, for the ~40 hours the moon is genuinely new, the sky
   is black where the moon should be — and *that empty spot is clickable*. It opens a page that
   exists on no other night. No hint, no glow, no cursor change; the only tell is that the moon
   is missing and you went looking anyway. **This is the one.** It is unfakeable (you can't
   brute-force a date), it rewards someone who noticed the sky changed, it costs one hit-target
   and one page, and the story writes itself: *what the town does on the darkest night.* Pair it
   with a fragment (`frag_newmoon`) that stays on your record forever — a badge that proves you
   were here on a specific night. Nobody who doesn't look up will ever find it.
2. **THE MOON REMEMBERS YOU.** Store the phase you first ever arrived under. From then on, when
   that phase comes round again — once every 29.5 days — the sky says one line, once:
   *"the same moon as your first night here."* Free continuity, no mechanics, and it turns a
   calendar into a relationship. (The stronger version of ingenuity #11, "the sky remembers".)
3. **CLOUD COVER IS A PUZZLE HINT.** On a 3-cover night you can't see the moon — so give the
   town something to do about it. The Reading Room / Fork puzzle served on an overcast night
   carries a **moonless variant**: same tactic, no coordinate labels. Weather that changes a
   GAME, not just a backdrop. Cheap (one class), and it's the "every game quietly teaches"
   thread meeting the sky.
4. **THE ECLIPSE.** Real solar and lunar eclipse dates are published years ahead — hardcode the
   next dozen. On those days, and only those days, the town's sky does the real thing at the
   real hour, the Night Desk loses its composure about it, and the splash carries a one-line
   dateline. Two eclipses a year, on the actual date, is a "wait, WHAT?" moment that no
   competitor can copy without doing the same homework.
5. **THE HARVEST MOON.** Four times a year the moon has a name — Harvest, Wolf, Blue, Hunter's.
   On those nights it's bigger, warmer, and the tagline in the splash footer quietly changes to
   the moon's name. Nothing is unlocked, nothing is announced. It's the June-13 pattern
   (Princess's birthday) applied to something a visitor can look up and confirm.

*My pick if only one gets built: **#1**, and it's not close. The others decorate the sky; #1
makes the sky a door, and the whole site already runs on doors.*

---

## 🧩 The Puzzle room — where it goes next *(brainstormed 2026-07-27, alongside the Winning Material / Discovered Check / The Pin motifs)*

**Reports (Nate: "a Report Puzzle option that comes to me somehow")** — ⭐ **promoted to PRIORITY #1**
(2026-07-27, his call). The panel now offers Email it / Copy it, which is honest but still ends in a
human inbox. Two upgrades:
- **A table, not an inbox.** A Supabase `puzzle_reports` table, insert-only via RLS, written straight
  from the game (FEN, motif, rating, mode, the move the player thought also won). One tap, no mail
  app, nothing lost. Read them on a private page beside the leaderboards. *(Needs one migration.)*
- **Let the machine triage them.** The game already carries a perft-verified referee and the
  best-defense search. A report can arrive with the engine's own verdict attached — *"player says
  Rxd4 also wins; the search agrees, +500"* — so the only reports worth reading are the ones where
  the player is right.

**Teaching**
- **A puzzle rating for the PLAYER** — ⭐ **promoted to PRIORITY #2** (2026-07-27). Puzzles wear
  ~ratings already; give the solver an Elo (the same one the Park Tables run) and serve puzzles at it.
- **Now that the refutation card exists, the next teaching move is the SECOND wrong move.** The card
  answers *"why was that wrong?"* in one line. It does not yet notice that you keep making the same
  KIND of mistake — three hung pieces in a row is a lesson ("you're moving before you check what's
  attacked"), and the game already tracks per-tactic accuracy to hang it on.
- **A deeper refutation, on demand.** The card's verdict is a material search two plies deep, which
  is honest but shallow — it says *"looks strong too"* rather than lying when it can't tell. A "show
  me" tap could hand that one position to the vendored Stockfish for a real answer. Nothing else in
  the room needs the engine, so it would have to lazy-load on that tap alone.

**More shapes**
- **Themed sets** — "ten pins", "ten discovered checks". Every puzzle already carries a `cat`; this is
  a filter and a menu button.
- **Motifs the generators could still build the same provable way:** deflection (the guard is dragged
  off), the overloaded defender, trapped piece, smothered mate, zwischenzug, and promotion tactics —
  the last one needs promotion added to the material search first (see the distractor-pawn note in
  `pjcc_fork.html`).
- **Puzzle of the day** — one seeded position everyone gets, with a share card carrying your time.

---

## 🗺 The Journey map — decide what it's FOR *(Nate asked 2026-07-27: "What function does it serve, again? What benefit is it to our cause?")*

Today it is a seven-stop row on the profile that lights a dot when you've *opened* a game once, with
your avatar parked at the furthest one. Honest read: it's a **completion checklist wearing the
world's clothes**, and it overlaps the Service record right below it.

Its one genuinely valuable job is **thematic**: this site's whole spine is Princess walking to Chess
City, and the map is the only place a player SEES their own play mapped onto that walk. That's worth
keeping — but it has to cost something to light a dot.

Options, cheapest first:
1. **Make the dots mean something** — light on a real threshold (a score, a floor, a solved set), not
   on one visit. Same UI, suddenly a goal.
2. **Make it the Gauntlet's map** — the Gauntlet roster already runs Checker Town → Sand Mines → Sea →
   Shogi Isle → the tower. Merge the two: one map, one climb, and the row under it stops being a
   second progress widget.
3. **Cut it** and let the Service record carry "what have I played". Least work, least soul.

*(Already fixed 2026-07-27: the stops were Shogi Island and Pirc Crossing — a hidden game and an
in-dev one — so the map could never complete and the Globetrotter achievement was unwinnable.)*

---

## 📚 Recommended to me (personal — separate from PJCC)

*Things people recommend to Nate. Not site features, not canon — just a shelf so nothing gets lost.*

- **The Age of Reason — Jean-Paul Sartre** *(added 2026-07-16)*
