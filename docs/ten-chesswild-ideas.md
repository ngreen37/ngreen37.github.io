# Ten Ideas That Are Only Possible Here

*Answering the launch-batch question of 2026-08-10 — **"What are the ten best ideas I can do
specifically for ChessWild that the others don't have?"** (Lichess, chess.com, Levy Rozman's site.)
Written 2026-08-12. It is not a listicle, so the first half is the part that does the work: what
those three actually ship, and which of our instincts that kills.*

---

## How This Was Checked

**The research comes first and the list comes last, on purpose.** Ten ideas that sound good are
easy to write; what makes these ten worth anything is knowing what the other three actually do.
That research also *killed* several ideas that seemed obviously right — most importantly
"our opponents are characters, theirs are engines," which died the moment I found chess.com's
bot roster.

Each of the three was read as it stands today, not recalled: Lichess's own changelog and about
page, chess.com's current tier limits and bots, and chessly.com's front page. **And every idea
below was checked against this site's own files before it was written down**, so nothing here
proposes building something that already exists.

> **⏳ FOR WHOEVER READS THIS LATER, INCLUDING ME: this was true on 2026-08-12, and nothing else
> is promised.** Competitors ship, prices change, and the ten ideas get built one at a time.
> **A document like this one is dangerous when it goes stale, because it reads as researched
> even after it stops being right** — that is exactly how `FUTURE-IDEAS` once kept insisting the
> site had never said it works offline, a week after it started saying so twice. **Re-check
> before quoting any number or claim on this page, and strike the ideas as they ship.**

---

## The Three, Measured

### Lichess

Around **4 million daily active users**. Free, non-profit, open source, funded by donations.
**No ads, no trackers, no paywall, no premium-only features** — and that is a stated policy, not
a stage they are passing through. What it ships: studies, live broadcasts, opening explorer,
endgame tablebase, Puzzle Storm / Streak / Racer, arena and Swiss tournaments, simuls, teams,
variants, an API with 185 documented operations, and a genuine screen-reader mode.

**What it will never build: a story, a world, a cast, cosmetics, or an economy.** Not "hasn't
gotten to yet" — declines, publicly, on principle. That is a permanent vacancy with four million
people standing next to it.

### Chess.com

The giant. Four tiers; Diamond runs **$70–100 a year**, and the free tier is deliberately
throttled — roughly **five puzzles a day, one game review a day**, no opening explorer. Over a
thousand lessons and videos. Puzzle Rush, Puzzle Battle, Titled Tuesday, events, and ChessKid
underneath it (50,000 kid puzzles, real-time Puzzle Duel, a level ladder up to King).

**And it owns character bots.** Martin at 250, the viral Mittens, Scaredy Cat at 800, Angry Cat
at 1000, Mr. Grumpers at 1200, Catspurrov at 1400 — Komodo underneath, personality-typed, with
opening books and in-game dialogue. **This is the single most important line in this document:
our bot gate is the same shape as a feature chess.com already runs at planetary scale, and
Mittens was big enough to take their servers down.** "Play a character instead of an engine" is
not open ground. It is their ground.

What they cannot do: give it away, or commit to one continuous fiction. **Mittens has no episode
two.** Every bot is a launch, not a character — no arc, no relationship to any other bot, no
memory of anyone. That gap is the whole opportunity, and it is narrower and sharper than "we
have characters."

### Chessly

70+ courses, a subscription (all courses included now, where it used to be per-course),
XP / achievements / leaderboards, and an AI tool called Levi. It is a course catalog with a face
on it, and it is very good at being that.

**The moat is 7 million YouTube subscribers, not the software.** This is the uncomfortable one:
**Levy built the audience first and the site second.** ChessWild is doing it in the other order.
That is harder, and it means the site's job is not to out-feature anybody — it is to be the thing
someone tells a friend about.

---

## The Bar This Sets

Three consequences, and between them they kill most of what a person would list first.

1. **Any idea whose sentence is "like chess.com's X, but ours" is dead on arrival.** Lichess is
   free and better at chess; chess.com is bigger and better funded. There is no version of
   ChessWild that wins a feature race, and entering one spends the runway on a loss.
2. **Free is only half a differentiator.** Against chess.com and Chessly it is real and worth
   saying loudly. Against Lichess it buys exactly nothing.
3. **Gamification is not open ground either.** Chessly has XP, achievements and leaderboards.
   Chess.com has streaks, badges and trophies. The Collection and the Gambit altar are standing
   on occupied ground — they earn their place by being *inside a fiction*, not by being an
   economy.

**Which leaves exactly one piece of defensible ground: ChessWild is a fiction with an animated
series coming, and none of the three can follow it there.** Lichess refuses on principle,
chess.com can't commit past a launch, Chessly is a person rather than a place. So every idea
below is scored on one test — *does it need that to be true?* If it would work just as well on
lichess.org, it is not on the list.

### What Got Thrown Out, and Why

- **Opening explorer, cloud eval, tablebase** — Lichess gives all three away and is better at
  them. Building any of them is a straight loss.
- **A tournament system** — needs a population, and the site does not have one yet. This is a
  post-audience idea, not a pre-audience one.
- **More bots** — chess.com has dozens. Going wider is the losing direction; see #8.
- **"Works offline"** — already true, and already said on the front door since 2026-08-04. The
  games hall still never says it, but that is a copy cleanup, not one of the ten.
- **A course catalog** — that is Chessly, and Chessly has Levy on it.
- **Clubs / teams** — Lichess and chess.com both do it well, and both needed a population first.

---

## The Ten

Ranked by what it is worth, times how impossible it is for the other three, divided by what it
costs. **Cost is in honest units** — an afternoon, a weekend, a real build.

### 1 · The Cast Remembers You

**A bot that knows your history with it.** Auston opens with the fact that you beat her last
Tuesday, or that you have played the Caro against her three times running and she is ready for it
now.

*What the three do instead:* nothing, and mostly they can't. Mittens says the same lines to
fifty million people and knows none of them. Per-relationship state is cheap at our size and a
different product entirely at theirs.

*Why only here:* eight named seats, a profile system, and a database already exist. This is the
cheapest genuinely impossible-to-copy thing on the list.

*Cost:* an afternoon. A small per-opponent record hung off the profile, plus a line table.
`PJCC.myStats` and `PJCC.db` are already there. **The lines themselves are yours to write** —
that is character voice, not UI copy.

*Risk:* the lines have to be good, or it reads as a mail merge. Ten strong lines beat sixty.

### 2 · The Night Desk Covers You

**The town ticker reports the player's own results, in its own voice.** *"Local operative takes
Floor 4 on the third attempt."* The Night Desk, being what it is, gets it slightly wrong.

*What the three do instead:* there is no diegetic layer anywhere on any of them. A chess.com
result goes to a graph.

*Why only here:* the ticker is arguably the most distinctive thing already built, and it is
currently reading a hand-written list to a player it cannot see. Pointing it at the player costs
almost nothing and changes what the town *is* — a place that noticed.

*Cost:* an afternoon. The ticker is static markup in `_layouts/home.html` with an existing
editing convention; this adds a small injected line built from the profile.

*Risk:* it must stay rare and stay in voice. A ticker that is all about you is a dashboard.

### 3 · The Town Has a Today

**A daily in-world event keyed to the real sky and the real date.** The moon is already a genuine
synodic phase and there is already an eclipse once a lunation. Give those a consequence: a floor
that only opens on an eclipse night, a Night Desk that is different in a storm.

*What the three do instead:* daily puzzles. That is the whole of it. Neither has a *place*, so
neither has weather.

*Why only here:* the sky engine, the weather canvas and the real moon math are all built and
currently decorative. This converts an existing ambient system into the only honest reason to
come back tomorrow — not a streak counter, which both competitors already have.

*Cost:* a weekend. The hard part (real astronomy, one canvas, reduced-motion handling) is done.

*Risk:* anything gated on a rare sky event is invisible to most visitors most days. Seed the
common weather too, not just the eclipse.

### 4 · Losing Is Content

**Defeats unlock canon.** Duel Mode already teaches by losing; generalize the principle. Losing
to the CEO should show you something about the CEO you could not otherwise see.

*What the three do instead:* a loss costs rating and returns nothing. It has to — **nobody
monetizing chess can afford to reward losing**, because the paid product is improvement.

*Why only here:* a fiction can. It also sits square in the site's stated morals: good guys are
not all good, and the person who just beat you is not a punishment. This is the most
philosophically distinct idea on the list and the one least copyable by anyone with a
subscription to sell.

*Cost:* a weekend per opponent's worth of material, and most of that is writing.

*Risk:* it can teach players to throw games. Gate on *played well and lost*, not on the result.

### 5 · A Season That Ends

**Give the ladder a dated finish and a conclusion, then start the next one with the story moved
forward.** The Gauntlet is already a campaign — ten public floors plus three secret ones — but it
is permanent furniture, and permanent furniture has no reason to be visited this month rather
than next year.

*What the three do instead:* chess.com runs events, but the bots never change and nothing
concludes. Lichess has no seasons at all.

*Why only here:* this is the bridge from the site to Season 1. A season that ends in an animated
clip makes the site the trailer instead of the destination — which is the correct relationship
between the two, and currently the missing one.

*Cost:* a real build, and it is mostly a decision. The mechanics exist; the date and the ending
are the work.

*Risk:* **a season needs a finish that actually ships.** A dated ending that slips is worse than
no season. Do not start one until #6 can produce the ending.

### 6 · The Cast Moves

**Blender-rendered reactions from the cast, on the actual boards.** Princess when she takes your
queen. Auston when you find the move.

*What the three do instead:* static avatars. Every bot on chess.com is a portrait.

*Why only here — and this is the one that matters most:* you have rigged models, a parametric
piece pipeline and three and a half months of unrendered Blender work. **This is the only idea on
the list where show work pays rent on the site the week it is made**, which is the direct answer
to the problem that the site leg moves every day and the show leg has not moved since April. One
three-second clip of Princess is both a site feature and a frame of Season 1.

*Cost:* a weekend for the first one, then near-zero per additional clip. Render to a short loop,
not a real-time model.

*Risk:* scope. One clip, shipped, beats a system for clips.

### 7 · The World Teaches the Chess

**Lessons sited in the fiction, where the location owns the motif.** The Sand Mine teaches
calculation under pressure because of what is down there. The Park teaches openings because that
is where people sit and play them.

*What the three do instead:* a curriculum (chess.com) or a catalog (Chessly). Both are ordered by
chess logic, which is correct and forgettable.

*Why only here:* seven locations, thirteen characters, and an Academy with Auston and Crockett
already teaching in it. A motif attached to a place is remembered as a place.

*Cost:* a real build, mostly content. Lesson 1 is the proof that the format works.

*Risk:* the Academy has been rebuilt before and belts were scrapped. Do not promise a curriculum;
ship one sited lesson and see whether it reads better than the plain one.

### 8 · One Opponent, Deeply

**Instead of eight shallow seats, make one of them real.** Auston with a genuine style you can
learn to beat, dialogue that changes as your rating climbs, and an arc across the season.

*What the three do instead:* chess.com goes wide — dozens of bots, each a joke with a rating
attached. They cannot go deep, because depth needs continuity and their bots are launches.

*Why only here:* going wider is a race we lose on the first day. Going deeper is a race they will
not enter. It also matches the site's own operating principle — depth and combination over new
surface area.

*Cost:* a real build, and it is the natural home for #1 and #4.

*Risk:* picking the wrong character. Auston is the right one: she already teaches, she is already
the 1200 seat, and she is the first student in the Reading Room.

### 9 · The Player Is in the Cast

**Your operative shows up in the world's own artifacts** — named in the ticker, filed in a
dossier, standing in the fan-art wall's town, walked by the companion you drew.

*What the three do instead:* a profile page and an avatar. There is no world for you to be in.

*Why only here:* the companion is drawn from independent parts, the person picker is built, the
Collection has 62 items and there are two hidden boards. All of that currently describes *you to
you*. This makes it describe you *to the town*.

*Cost:* a weekend, done narrowly — one artifact, not all of them.

*Risk:* anything with a user-supplied name needs the moderation trigger in front of it. That
exists; use it.

### 10 · Build It in the Open, In-World

**A devlog that is itself a McPuppy Studios artifact** — the making-of published as something the
world would publish.

*What the three do instead:* Lichess blogs about infrastructure. Chess.com does PR. Chessly is
downstream of a YouTube channel that already exists.

*Why only here, and why it is last on the list but first in importance:* **this is the direct
answer to the Chessly lesson.** Levy had the audience before he had the site. The only honest
route to an audience from here is to let people watch the thing get made — and 26 blog posts and
a podcast plan are already sitting there. It is also the only item that produces something the
day it happens rather than the day it ships.

*Cost:* an afternoon to start, then a habit. The habit is the whole feature.

*Risk:* it is a commitment, and a devlog that stops is a worse signal than one that never
started. Weekly is a promise; "when there is something to show" is not.

> **⭐ CONFIRMED BY HIM THE SAME DAY, AND IT UPGRADES THIS ITEM FROM A SUGGESTION TO THE PLAN.**
> Nate, 2026-08-12: *"my charm and passion and authenticity are going to be a big reason why we
> get there… I may hire animators down the line, but only after I've developed it myself, in the
> open, streaming, podcasting, blogging, etc."*
>
> Two things follow. **Building in the open is a precondition here, not a marketing tactic** —
> the learning done in public is the origin story and the audience-building mechanism at the same
> time, which is the honest reply to the Chessly problem above (Levy had the personality asset
> too; this one is simply unspent). And **"hire animators" is explicitly gated behind doing it
> himself first**, so no plan on this list should route around the learning with an asset pack or
> a commission.

---

## The Honest Ranking

The question was which ideas are uniquely ours. But the ranking that matters is which of them
move the leg that is not moving.

| # | Idea | Cost | Moves the site | Moves the show |
|---|------|------|:---:|:---:|
| 6 | The Cast Moves | weekend | ✅ | ✅ |
| 10 | Build It in the Open | afternoon + habit | ✅ | ✅ |
| 5 | A Season That Ends | real build | ✅ | ✅ |
| 1 | The Cast Remembers You | afternoon | ✅ | — |
| 2 | The Night Desk Covers You | afternoon | ✅ | — |
| 4 | Losing Is Content | weekend | ✅ | — |
| 3 | The Town Has a Today | weekend | ✅ | — |
| 9 | The Player Is in the Cast | weekend | ✅ | — |
| 8 | One Opponent, Deeply | real build | ✅ | — |
| 7 | The World Teaches the Chess | real build | ✅ | — |

**Seven of the ten are more website.** That is worth saying plainly, because the site leg has
moved every day since July and the show leg has not moved since April, and a list of ten good
site ideas is exactly the thing that keeps that true.

**If only one gets built: #6.** It is a weekend, it uses assets that already exist, it is the one
thing on the list chess.com structurally cannot answer, and it is the only one where a day of
Blender work shows up on the site that same week. It also unblocks #5, which is the bridge to
Season 1.

**If two: #6 and #1.** One afternoon each side of the same idea — the cast becomes something that
moves and something that remembers, which together is the whole difference between a bot and a
character.

---

## One Thing Found While Checking This

The compass note in my memory said the answer stays *"`docs/godot-first-room.md` Section 0, fifteen
minutes"* until a Godot project exists outside the repo. **It exists.**
`C:\Users\Nate\Desktop\Godot\princess-dungeon\`, created 2026-07-19, opened again 2026-07-26.

Two things about it:

1. **Section 0 is done and the compass answer has moved on.** The project is still the default
   skeleton — zero scenes, zero scripts — so **the answer is now Section 1, the gray-box room.**
2. **⚠ The renderer is wrong for where this is going.** `project.godot` says
   `Forward Plus`, and `docs/godot-first-room.md` calls for the **Compatibility** renderer,
   because that is what survives a GitHub Pages web export. It is a one-line fix in Project
   Settings and it is much cheaper now than after a room exists.

*That is a note, not a nudge — the ten ideas above were the ask, and they are answered.*

---

## Sources

- [Lichess changelog](https://lichess.org/changelog) · [About Lichess](https://lichess.org/about)
- [Chess.com membership tiers](https://support.chess.com/en/articles/8609242-why-should-i-become-a-member-at-chess-com-does-it-cost-anything) ·
  [Puzzle Rush](https://www.chess.com/puzzles/rush) ·
  [How chess.com built Mittens (Slate)](https://slate.com/technology/2023/01/chess-dot-com-mittens-bot.html)
- [ChessKid feature guide](https://www.chesskid.com/learn/articles/complete-guide-to-chesskid)
- [Chessly](https://chessly.com/) · [Chessly review, The Chess Advisor](https://thechessadvisor.com/website-review/chessly/)
