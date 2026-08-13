# The Clearance Ladder

*Last moved 2026-08-13 — grew from seven rungs to nine, the summit was renamed, and the
credit road got about 13x longer.*

This is the breakdown of what clearance is, what the numbers are, and which files change
when they move. It is a working document, not a spec — the shipped ladder in
`assets/js/pjcc-profile.js` is the truth, and `npm run test:ladders` is what keeps this
honest.

---

## 1. There are two ladders, and clearance is the higher of them

Clearance is **the max of what your chess rating earns you and what your credits already
earned you**. Never one or the other.

| | drives | lives in | what it hands out |
|---|---|---|---|
| **Rating ladder** | your PJCC Rating (the Park Tables Elo) | `CLEARANCE` | the pip beside your codename |
| **Credit ladder** | total credits earned everywhere | `RANKS` | a Subject Zero fragment per rung |

The two arrays are **index-aligned**: same length, same names, same order. That alignment
is not tidiness, it is the mechanism — `clearance()` uses your credit rung as a *floor* on
your rating rung. Add a rung to one array and you must add it to the other.

**Why it is a max and not a choice.** Reading clearance as rating-only would demote every
player who reached Delta on credits, the day it shipped. Nobody moves down. The rating is
simply a second, faster road up the same ladder.

**Why the fragments do not move with it.** `rankFor()` is still credit-keyed and is what
unlocks Subject Zero lore. Clearance is a **display** rank; the rank ladder is a **reward**
ladder. They share names on purpose and share nothing else — merging them would revoke
lore people have already unlocked.

---

## 2. The nine rungs

| # | Rung | Pip | Rating | Credits | Color |
|---|---|---|---|---|---|
| 1 | Recruit | `·` | 0 | 0 | `#9aa8b8` |
| 2 | Operative | `◦` | 400 | 75 | `#7fd4a8` |
| 3 | Field Agent | `◇` | 600 | 250 | `#56d0ff` |
| 4 | Cipher Clearance | `◆` | 800 | 600 | `#b98fff` |
| 5 | **Theta Clearance** | `✧` | 900 | 1,400 | `#d98fef` |
| 6 | Delta Clearance | `✦` | 1000 | 3,000 | `#ff8fd0` |
| 7 | **Sigma Clearance** | `✶` | 1150 | 6,000 | `#ff9b9b` |
| 8 | Omega Clearance | `✷` | 1300 | 10,500 | `#ffb066` |
| 9 | **Alpine Clearance** | `❈` | 1600 | 16,000 | `#ffe08a` + glow |

Bold rungs are the ones that changed on 2026-08-13.

**Reading the design.**

- **Recruit holds the whole opening stretch** (0–399). Everyone starts at 250 on the Park
  Tables, so a rung that moved before 400 would be a participation badge.
- **The glyphs run monotone by density** — `· ◦ ◇ ◆ ✧ ✦ ✶ ✷ ❈` — so you can see that one
  pip outranks another without being told. Fitting two new rungs in meant Omega moving
  `✶ → ✷`; that is the only cosmetic move, and no rung changed name or threshold to make
  room for it.
- **The colors run cool → warm and never gold.** Gold on this site means the primary
  action, and a badge wearing the CTA's color competes with every button beside it. The
  summit is the only rung that glows.
- **The two new rungs were fitted into gaps** (900, 1150). Every one of the seven original
  rungs still sits at exactly the rating it always did, so nobody's rung changed hands or
  changed name — they only gained two stops between the ones they already knew.

---

## 3. What moved on 2026-08-13, and what it cost

**The summit was renamed.** "Above Omega" → **Alpine Clearance**. The old name was retired
site-wide, including in the Clearance: DELTA quiz room, which runs its own separate
in-game ladder but was still awarding the retired phrase at 21 correct. One phrase meaning
two different heights is exactly the drift worth spending an edit to avoid.

**Two rungs were added mid-ladder** — Theta under Delta, Sigma over it — because the climb
now ends at a locked door, and a seven-rung ladder whose last step is also the only door
makes the middle feel like waiting.

**The credit road got ~13x longer.**

| Rung | was | now |
|---|---|---|
| Operative | 25 | 75 |
| Field Agent | 75 | 250 |
| Cipher | 150 | 600 |
| Delta | 300 | 3,000 |
| Omega | 600 | 10,500 |
| summit | 1,200 | 16,000 |

The old top cost 1,200 credits at a time when the shop totals **17,715 across 42 items** —
the summit of the ladder cost less than four mid-shelf purchases. It now costs roughly the
whole shop, which is the intent: the credit road to the top is meant to be the legend, and
the **rating** road the one people actually walk.

> ⚠ **This is the one tightening this economy has done, and it should stay the only one.**
> The standing rule is that loosening later is a gift and tightening later is a takeaway.
> Raising these mins does move a credit-floored player down a rung. It was asked for
> deliberately, with the demotion stated up front, because a top rung nobody can fail to
> reach is not a clearance. If it ever needs softening, soften it — that direction is free.

---

## 4. Where a pip is drawn

Four surfaces, all reading the one ladder:

- `pjcc-profile-bar.js` — the identity row every game loads
- `pjcc-leaderboard.js` — every board
- `dossier.md` — your own profile
- `_layouts/character.html` — inside the clearance gate (below)

**A leaderboard does not draw rung 1.** Everyone starts at Recruit, so a dot on every row
is noise rather than a badge. Your own dossier and profile bar *do* show it, because one
pip beside one codename is information. The threshold has exactly one name —
`PJCC.BOARD_PIP_MIN_LEVEL` — because the rule was once spelled twice and drifted the same
day: a legend generated from the full ladder documented seven rungs the board could only
ever draw six of. The legend on `/leaderboards/` now lists only the rungs the board can
draw and **names the absence** rather than leaving an unexplained gap.

---

## 5. A clearance rung can lock a page

New on 2026-08-13, and currently used exactly once: **`/characters/alpine/`** requires
**Alpine Clearance**.

Any character file can do this with three front-matter keys:

```yaml
classified: true
clearance_required: Alpine Clearance     # a rung NAME, never a level number
classified_brief: "the line or two everybody may read"
```

The layout renders the brief to everyone, seals the body, and opens it if
`PJCC.clearance().level >= PJCC.levelOf(clearance_required)`.

**The rung is named, never numbered.** `levelOf()` resolves the name at runtime, so
inserting a rung mid-ladder cannot silently re-point a gate — which is not hypothetical:
Theta and Sigma both landed mid-ladder and pushed every level above them up by two. A page
that had hardcoded `7` would have quietly opened a classified file to Sigma operatives.

**It fails closed.** An unknown rung name, a missing profile module, a thrown error — every
one of them leaves the file sealed and says so plainly. The failure in the other direction
is a classified page hanging open for everyone.

**It paints three times** — now, on `PJCC.ready`, and on `PJCC.onChange`. The SDK is
deferred to idle, so the live profile lands well after first paint; sign-in and sign-out
both fire `onChange`. Miss any one of the three and a signed-in operative gets shown their
own locked door.

> ⚠ **It is a lock, not a secret.** This site is static, so the gated prose is in the HTML
> and a determined visitor can read it in View Source. That is the same honest posture
> `/classified/` already takes — its ██ bars are real bars with nothing hiding behind them
> — and it is the right one, because the alternative buys secrecy this story does not need.
> The gate is a ceremony you earn, not a vault. **Anything that genuinely must not leak
> belongs in `private/`, not behind a client-side gate.**

---

## 6. Adding or moving a rung — the checklist

Four files, and three of them fail quietly if you forget them.

1. **`assets/js/pjcc-profile.js`** — add to `CLEARANCE` *and* `RANKS`. They must stay
   index-aligned, and the new `RANKS` entry needs its own `frag`; a rung that unlocks
   nothing is a dead reward.
2. **`_sass/_pjcc-14-profile.scss`** — add `.pip-N`. **A missing color is invisible, not
   obviously broken:** the class is built as `'pip-' + level`, `tests/sweep.js` allows the
   whole `pip-` prefix, and nothing else on the site would notice.
3. **`tests/ladders.check.js`** — the counts there are derived from the shipped ladder, so
   most of it follows automatically. Assertions naming a specific rung will need a look.
4. **`tests/sweep.js`** — the comment on `ALLOWED_DYNAMIC` states the ladder's height.

Then `npm run test:ladders`.

**Things that look after themselves** and should not be hand-edited: the pip legend on
`/leaderboards/` (built from `PJCC.CLEARANCE`), the tooltip on every pip (`hint`, which
counts the ladder), and any clearance gate (resolves its rung by name).
