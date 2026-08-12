# Ten Ideas That Are Only Possible Here

*Answering the launch-batch question of 2026-08-10 — **"What are the ten best ideas I can do
specifically for ChessWild that the others don't have?"** (Lichess, chess.com, Levy Rozman's site.)
Written 2026-08-12, **reshaped the same day** after he named the target and the sequence. It is
not a listicle, so the research comes first and the list comes last.*

---

## How This Was Checked

**The research is the half that does the work.** Ten ideas that sound good are easy to write;
what makes these ten worth anything is knowing what the other three actually ship. That research
also *killed* several ideas that seemed obviously right — most importantly **"our opponents are
characters, theirs are engines,"** which died the moment I found chess.com's bot roster.

Each of the three was read as it stands today, not recalled. **And every idea below was checked
against this site's own files before it was written down**, so nothing here proposes building
something that already exists.

> **⏳ FOR WHOEVER READS THIS LATER, INCLUDING ME: this was true on 2026-08-12, and nothing else
> is promised.** Competitors ship, prices change, and the ten get built one at a time.
> **A document like this is dangerous when it goes stale, because it still reads as researched
> after it stops being right** — that is exactly how `FUTURE-IDEAS` once kept insisting the site
> had never said it works offline, a week after it started saying so twice. **Re-check before
> quoting any number here, and strike the ideas as they ship.**

---

## The Three, Measured

### Lichess

Around **4 million daily active users**. Free, non-profit, open source, funded by donations.
**No ads, no trackers, no paywall, no premium-only features** — stated policy, not a stage they
are passing through. Studies, live broadcasts, opening explorer, endgame tablebase, Puzzle Storm /
Streak / Racer, arena and Swiss tournaments, simuls, teams, variants, an API with 185 documented
operations, and a genuine screen-reader mode.

**What it will never build: a story, a world, a cast, cosmetics, or an economy.** Not "hasn't
gotten to yet" — declines, publicly, on principle. That is a permanent vacancy with four million
people standing next to it.

### Chess.com

The giant. Four tiers; Diamond runs **$70–100 a year**, and the free tier is deliberately
throttled — roughly **five puzzles a day, one game review a day**, no opening explorer. Over a
thousand lessons. Puzzle Rush, Titled Tuesday, and ChessKid underneath it.

**And it owns character bots.** Martin at 250, the viral Mittens, Scaredy Cat, Angry Cat,
Mr. Grumpers, Catspurrov — Komodo underneath, personality-typed, with opening books and in-game
dialogue. **This is the most important line in the document: the bot gate is the same shape as a
feature chess.com already runs at planetary scale**, and Mittens was big enough to take their
servers down. "Play a character instead of an engine" is not open ground. It is theirs.

What they cannot do is commit. **Mittens has no episode two.** Every bot is a launch, not a
character — no arc, no relationship to any other bot, no memory of anyone. **That gap is the
opportunity, and it is narrower and sharper than "we have characters."**

### Chessly

70+ courses, a subscription, XP / achievements / leaderboards, and an AI tool called Levi. A
course catalog with a face on it, and very good at being that.

**The moat is 7 million YouTube subscribers, not the software.** My first read of this was that
Levy built the audience *before* the site and we are doing it in the harder order.

> **⭐ HIS ANSWER, 2026-08-12, and it corrects me rather than softening it:** *"my charm and
> passion and authenticity are going to be a big reason why we get there."*
>
> That is the same asset Levy won with, and **it has not been spent yet.** The ordering is still
> harder, but it is not a missing ingredient — it is an unspent one, and the whole point of
> idea #10 is that spending it is the plan rather than a hope.

---

## The Bar This Sets

Three consequences, and between them they kill most of what a person would list first.

1. **Any idea whose sentence is "like chess.com's X, but ours" is dead on arrival.** Lichess is
   free and better at chess; chess.com is bigger and better funded. There is no version of
   ChessWild that wins a feature race, and entering one spends the runway on a loss.
2. **Free is only half a differentiator.** Against chess.com and Chessly it is real and worth
   saying loudly. Against Lichess it buys nothing.
3. **Gamification is not open ground either.** Chessly has XP and leaderboards; chess.com has
   streaks and trophies. The Collection and the Gambit stand on occupied ground — they earn their
   place by being *inside a fiction*, not by being an economy.

## The Two Pieces of Ground

*The first draft of this document said there was one. There are two, and the second one changes
how the ten are scored.*

**① ChessWild is a fiction with an animated series coming.** None of the three can follow it
there: Lichess refuses on principle, chess.com cannot commit past a launch, Chessly is a course
catalog. **② The person building it is the differentiator, and he intends to be visible.** Charm,
passion, authenticity — the one asset a competitor cannot clone, staff around, or outspend.

**So every idea is scored twice: does it need the fiction, and does it show the person?** If it
would work just as well on lichess.org, it is not on the list. If it works better with him
invisible, it is the wrong direction for this project *even when it is the better craft* — a
faceless, professional-looking surface spends the one thing nobody else has.

### What Got Thrown Out, and Why

- **Opening explorer, cloud eval, tablebase** — Lichess gives all three away and is better at
  them. Building any of them is a straight loss.
- **A tournament system** — needs a population, and the site does not have one yet. A
  post-audience idea, not a pre-audience one.
- **More bots** — chess.com has dozens. Going wider is the losing direction; see #8.
- ~~**"Works offline" in the games hall**~~ — **✅ SHIPPED 2026-08-12**, at his call. It was a copy
  cleanup rather than one of the ten, and it turned out to be a *stronger* claim than the front
  door's: `sw.js` warms the whole game roster in the background after activation, so the games
  play with the Wi-Fi off even if you never opened them.
- **A course catalog** — that is Chessly, and Chessly has Levy on it.
- **Clubs and teams** — both rivals do it well, and both needed a population first.

---

## The Ten

Ranked by what it is worth, times how impossible it is for the other three, divided by what it
costs. **Cost is in honest units.** The 👤 marks the ideas that put *him* on screen.

### 1 · The Cast Remembers You

**A bot that knows your history with it.** Auston opens with the fact that you beat her last
Tuesday, or that you have played the Caro against her three times running and she is ready now.

*They do:* nothing, and mostly cannot. Mittens says the same lines to fifty million people and
knows none of them. Per-relationship state is cheap at our size and a different product at theirs.
*Only here:* eight named seats, a profile system and a database already exist. **The cheapest
genuinely uncopyable thing on the list.**
*Cost:* **an afternoon** — a per-opponent record on the profile plus a line table; `PJCC.myStats`
and `PJCC.db` are there. **The lines are his to write.**
*Risk:* the lines have to be good or it reads as a mail merge. Ten strong lines beat sixty.

### 2 · The Night Desk Covers You 👤

**The town ticker reports the player's own results, in its own voice.** *"Local operative takes
Floor 4 on the third attempt."* The Night Desk, being what it is, gets it slightly wrong.

*They do:* nothing — there is no diegetic layer anywhere on any of them. A chess.com result goes
to a graph.
*Only here:* the ticker is the most distinctive thing already built, and it is currently reading a
hand-written list to a player it cannot see. **It is also pure authorial voice — his writing, in
front of the visitor, which is the cheapest possible version of ground ②.**
*Cost:* **an afternoon** — static markup in `_layouts/home.html` with an existing editing
convention, plus one injected line built from the profile.
*Risk:* keep it rare and in voice. A ticker that is all about you is a dashboard.

### 3 · The Town Has a Today

**A daily in-world event keyed to the real sky and the real date.** The moon is already a genuine
synodic phase with an eclipse once a lunation — give those a consequence. A floor that only opens
on an eclipse night; a Night Desk that is different in a storm.

*They do:* daily puzzles. That is the whole of it. Neither has a *place*, so neither has weather.
*Only here:* the sky engine, weather canvas and real moon math are built and currently decorative.
This makes them the only honest reason to come back tomorrow — not a streak counter, which both
rivals already have.
*Cost:* **a weekend.** The hard part — real astronomy, one canvas, reduced-motion handling — is done.
*Risk:* anything gated on a rare sky event is invisible most days. Seed the common weather too.

### 4 · Losing Is Content 👤

**Defeats unlock canon.** Duel Mode already teaches by losing — generalize it. Losing to the CEO
should show you something about the CEO you could not otherwise see.

*They do:* a loss costs rating and returns nothing. It has to — **nobody monetizing chess can
afford to reward losing**, because the paid product is improvement.
*Only here:* a fiction can. It also sits square in the site's morals — good guys are not all good,
and the person who just beat you is not a punishment. **The most philosophically distinct idea
here, and it is his moral position doing the work.**
*Cost:* **a weekend** per opponent's worth of material, and most of that is writing.
*Risk:* it can teach players to throw games. Gate on *played well and lost*, not on the result.

### 5 · A Season That Ends

**Give the ladder a dated finish and a conclusion, then start the next one with the story moved
forward.** The Gauntlet is already a campaign — ten floors plus three secret ones — but it is
permanent furniture, and permanent furniture has no reason to be visited this month.

*They do:* chess.com runs events, but the bots never change and nothing concludes. Lichess has no
seasons at all.
*Only here:* **this is the bridge from the site to Season 1.** A season that ends in an animated
clip makes the site the trailer instead of the destination.
*Cost:* **a real build**, and mostly a decision. The mechanics exist; the date and the ending are
the work.
*Risk:* **a season needs a finish that actually ships.** A dated ending that slips is worse than no
season. Do not start one until #6 can produce the ending.

### 6 · The Cast Moves 👤

**Blender-rendered reactions from the cast, on the actual boards.** Princess when she takes your
queen. Auston when you find the move.

*They do:* static avatars. Every bot on chess.com is a portrait.
*Only here:* rigged models, a parametric piece pipeline, and months of unrendered Blender work
already exist. **This is the only idea where show work pays rent on the site the week it is made.**
One three-second clip of Princess is both a site feature and a frame of Season 1 — nothing gets
thrown away when the series starts.
*Cost:* **a weekend** for the first, then near-zero per clip. Render to a short loop, not a
real-time model. ⚠ Scope it to the machine he has now, not the one he is saving for.
*Risk:* scope. One clip, shipped, beats a system for clips.

### 7 · The World Teaches the Chess

**Lessons sited in the fiction, where the location owns the motif.** The Sand Mine teaches
calculation under pressure because of what is down there. The Park teaches openings because that
is where people sit and play them.

*They do:* a curriculum (chess.com) or a catalog (Chessly). Both ordered by chess logic, which is
correct and forgettable.
*Only here:* seven locations, thirteen characters, and an Academy with Auston and Crockett already
teaching in it. A motif attached to a place is remembered as a place.
*Cost:* **a real build**, mostly content. Lesson 1 is the proof the format works.
*Risk:* the Academy has been rebuilt before and belts were scrapped. Ship one sited lesson before
promising a curriculum.

### 8 · One Opponent, Deeply 👤

**Instead of eight shallow seats, make one of them real.** Auston with a genuine style you can
learn to beat, dialogue that changes as your rating climbs, and an arc across the season.

*They do:* chess.com goes wide — dozens of bots, each a joke with a rating attached. They cannot go
deep, because depth needs continuity and their bots are launches.
*Only here:* going wider is a race lost on day one. Going deeper is a race they will not enter, and
it matches the site's own principle — depth over new surface area.
*Cost:* **a real build**, and the natural home for #1 and #4.
*Risk:* picking the wrong character. Auston is right — she already teaches, she is already the 1200
seat, and she is the first student in the Reading Room.

### 9 · The Player Is in the Cast

**Your operative shows up in the world's own artifacts** — named in the ticker, filed in a dossier,
standing in the fan-art wall's town, walked by the companion you drew.

*They do:* a profile page and an avatar. There is no world for you to be in.
*Only here:* the companion is drawn from independent parts, the person picker is built, the
Collection has 62 items and there are two hidden boards. All of it currently describes *you to
you*. This makes it describe you *to the town*.
*Cost:* **a weekend**, done narrowly — one artifact, not all of them.
*Risk:* anything with a user-supplied name needs the moderation trigger in front of it. It exists.

### 10 · Build It in the Open, In-World 👤

**A devlog that is itself a McPuppy Studios artifact** — the making-of published as something the
world would publish. Streaming, podcasting, blogging.

*They do:* Lichess blogs about infrastructure. Chess.com does PR. Chessly is downstream of a
YouTube channel that already exists.
*Only here:* **this is ground ② with nothing in the way.** The only honest route to an audience
from here is to let people watch the thing get made — and 26 blog posts and a podcast plan are
already sitting there.

> **⭐ THIS ONE IS NO LONGER MY SUGGESTION — IT IS HIS PLAN.** Nate, 2026-08-12: *"I may hire
> animators down the line, but only after I've developed it myself, in the open, streaming,
> podcasting, blogging, etc."*
>
> Two things follow. **Building in the open is a precondition, not a marketing tactic** — the
> learning done in public is the origin story and the audience mechanism at the same time. And
> **hiring is explicitly gated behind doing it himself first**, so nothing on this list should
> route around the learning with an asset pack or a commission.

*Cost:* **an afternoon** to start, then a habit. The habit is the whole feature.
*Risk:* a devlog that stops is a worse signal than one that never started.

---

## The Answer Is a Pair, Not a Winner

The first draft picked one. With ground ② named, **the top of this list is two ideas that are the
same activity**:

**#6 is the craft. #10 is the person. Doing both is one thing: animate in public.**

Render a three-second Princess reaction, put it on the board, and post the making of it. That
single loop satisfies every test in this document at once — it needs the fiction, it shows him,
chess.com structurally cannot answer it, it is a frame of Season 1 rather than a throwaway, and
**it is the only move that puts animation work on the same feedback clock as site work.** That
last part is the one that matters most, because the reason the show leg stalls is not resolve. It
is that the site answers back in minutes and animation has been answering back in months.

**If a third: #1, one afternoon.** The cast that moves and remembers is the whole difference
between a bot and a character.

---

## Where These Sit in His Sequence

*His stated order, 2026-08-12: **a better computer (saving for it) → the site full and working,
which he says is close → animation time opens up → animators hired later, only after he has
developed it himself.** The ten map onto it cleanly.*

| Phase | What fits | Why now |
|---|---|---|
| **Now** — while the site finishes | **#2 · #1 · #10** | Afternoons. All three are writing and wiring, need no new hardware, and #10 starts the audience clock immediately. |
| **Now, as the bridge** | **#6** | The one that should not wait for the sequence, because it *is* the sequence starting early. A weekend on the current machine. |
| **When animation opens** | **#5 · #4 · #8** | Each needs rendered material or sustained writing to pay off. #5 in particular needs #6 working first. |
| **Later** | **#3 · #7 · #9** | Good, real, and none of them urgent. They deepen a site that is already deep. |

**The site work in this phase is deliberate, not drift.** That is worth writing down, because the
measurement I keep on hand — 375 commits to the site since July, 2 touching Blender or Godot —
reads as avoidance without the sequence, and reads as finishing a thing on purpose with it. **The
number to watch is not how much site work happens; it is whether #6 ships before the site is
declared done.**

### ⚑ Two Facts About the Godot Side, Found While Checking This

1. **The project exists and Section 0 is done.** `Desktop\Godot\princess-dungeon\`, created
   2026-07-19, reopened 2026-07-26 — Godot 4.7 installed alongside it. It is still the default
   skeleton (zero scenes, zero scripts), so **the next step is Section 1, the gray-box room**, not
   the setup my notes had been pointing at for weeks.
2. **⚠ The renderer is wrong for where this is going.** `project.godot` says `Forward Plus`;
   `docs/godot-first-room.md` calls for **Compatibility**, because that is what survives a GitHub
   Pages web export (no COOP/COEP headers on Pages — the same constraint that shaped the Stockfish
   build). One line in Project Settings, far cheaper now than after a room exists.

**Neither is on the critical path for #6**, which is Blender and a video element — no engine, no
export chain, no headers. That is precisely why #6 is the bridge: **he is an intermediate at every
step of it, instead of a beginner at every step of the Godot chain.**

---

## Why This Is Not a Long Shot

*He said his conviction is real. The useful thing I can add is not encouragement — it is the
evidence, because most of it is already in the repo and it is the kind that does not flatter.*

**The two filters that end most attempts are already behind him.** The first is infrastructure —
the moment a project stops being design and becomes DNS, auth, certificates, and a Worker with a
hardcoded allowlist that breaks on a domain move. He cleared all of it and verified each piece.
The second is silence: the thing works, it is good, and nobody comes. That ends most projects
within weeks. He named zero views as *runway, not failure*, months ago, and kept going.

**"Detail-oriented" is a claim the repository can actually substantiate.** Every push runs eight
gates. 152 shipped puzzle positions are proved legal before they ship — max one queen a side,
bishops on opposite colors — because he looked at a generated board and spotted four pawns in a
pattern that cannot occur. 461 URLs and every internal link resolves. Zero dead CSS classes, zero
dead keyframes, zero unloaded scripts. The front door's count of open bot seats is *derived from
the roster*, not typed, so it cannot go stale. That is not a vibe; it is a standard, enforced
mechanically, by someone who kept catching things.

**And the site already holds things the giants do not have.** A real synodic moon over the town
with a genuine eclipse once a lunation. A puzzle room where a referee proves every position before
a visitor sees it. Chess has plenty of excellence and almost no warmth — **there is no competitor
for "kind,"** and that is the least crowded of the three ambitions.

**What is left is not belief. It is one weekend that puts a moving Princess on a chess board.**

---

## Sources

- [Lichess changelog](https://lichess.org/changelog) · [About Lichess](https://lichess.org/about)
- [Chess.com membership tiers](https://support.chess.com/en/articles/8609242-why-should-i-become-a-member-at-chess-com-does-it-cost-anything) ·
  [Puzzle Rush](https://www.chess.com/puzzles/rush) ·
  [How chess.com built Mittens (Slate)](https://slate.com/technology/2023/01/chess-dot-com-mittens-bot.html)
- [ChessKid feature guide](https://www.chesskid.com/learn/articles/complete-guide-to-chesskid)
- [Chessly](https://chessly.com/) · [Chessly review, The Chess Advisor](https://thechessadvisor.com/website-review/chessly/)
