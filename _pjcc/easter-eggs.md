# Easter Eggs — ngreen37.github.io

All hidden features, secrets, and interactive surprises across the McPuppy Studios / PJCC website.

---

## Keyboard Secrets

### Chess Notation Sequences
Type any of these sequences anywhere on the site (outside an input field) to trigger a chess toast notification and a procedural "piece click" sound:

| Sequence | Toast Message | Extra Effect |
|----------|--------------|--------------|
| `e4` | "The first move. Every great journey starts here." | — |
| `Nf3` | "Pattern recognized. The knight knows the way." | — |
| `d4` | "The Queen's pawn. Solid. Methodical. Like building a website." | — |
| `O-O` | "Castled. Sometimes you protect what matters most." | — |
| `Ke2` | "The king walks forward. Brave. Unusual. Keep going." | — |
| `h4` | "A flank attack. Nobody expects it. Neither did Princess." | — |
| `Qd5` (first time) | "An aggressive queen. She's going somewhere. → /classified/" | Marks `frag_qd5` in localStorage |
| `Qd5` (second time within 30s) | — | Redirects to `/archive/` (Omega clearance page) |

Buffer clears after 1.8 seconds of inactivity or on Escape.

### Konami Code
**Sequence:** ↑ ↑ ↓ ↓ ← → ← → B A

Triggers a full-screen white-to-amber flash and toast: *"CLEARANCE LEVEL: OMEGA — She already knows you're here."*
Marks `frag_konami` in localStorage.

### e8=Q — Promotion (Academy only)
**Sequence:** type `e8=Q` (or `e8=q`) anywhere on `/academy/` outside a text field.

The belt ladder flips from Checker Town purple to Chess City gold (`body.ac-gold`), persists via `pjcc.academy.promotion`, and toggles back if typed again (toggle-off toast: *"Underpromotion. Bold."*). Toggle-on toast: *"e8=Q — PROMOTION. She was always going to rise."* Marks `frag_promotion`. No hint exists anywhere on the site.

---

## Hidden Pages

### /classified/
The main classified document. Not linked from nav.
- Hold-to-reveal redacted passages (hold click/tap on redacted text)
- Access log animates in with fake timestamps, then appends your operative ID after ~1 second
- Random classified stamp appears in a corner on load (CLEARANCE: DELTA, EYES ONLY, etc.)
- Visiting marks `frag_classified` in localStorage

### /archive/
Omega-clearance page. Accessible only via double-Qd5 keyboard sequence.
- Contains 3 deep-lore fragments: "Why the Pieces Really Fell" (005), "Her Real Name" (006 — PJCC-Ω-7), "What Chess City Already Knows" (007)
- Hold-to-reveal on lore passages
- Visiting marks `frag_archive` in localStorage

### /dispatch/
The full post index in amber classified format. Not linked from nav — discoverable by URL only.
- Posts listed as `TX-001`, `TX-002`, etc.
- Visiting marks `frag_dispatch` in localStorage

### /404.html
Custom 404 "Signal Lost" page.
- Large faint "404" behind the title
- "SIGNAL LOST" glitch title with echo afterimage
- Redacted lore fields and coordinates
- Visiting marks `frag_404` in localStorage

### /characters/the-queen/
CLEARANCE DENIED page (tab title: "CLEARANCE DENIED"). Reached only from the broken-looking
`[QUEEN]` link in Princess's Traits — she was taught, possibly by accident, that she will one
day be a queen. The file "has a date on it; it is not today." Payoff = her spoiler arc.
Visiting marks `frag_queen` in localStorage.

---

## Fragment System

### Fragment Counter (Footer)
The site footer shows `[X/∞ FRAGMENTS RECOVERED]` if you've discovered any easter eggs.
Each hidden page and key interaction stores a `frag_*` key in `localStorage`. The counter reads all `frag_` keys and shows the total.

### Known Fragment Keys
| Key | Trigger |
|-----|---------|
| `frag_classified` | Visit /classified/ |
| `frag_archive` | Visit /archive/ (double Qd5) |
| `frag_dispatch` | Visit /dispatch/ |
| `frag_404` | Hit a 404 page |
| `frag_qd5` | Type Qd5 (first time) |
| `frag_konami` | Konami code |
| `frag_queen` | Visit /characters/the-queen/ (Princess's [QUEEN] link) |
| `frag_promotion` | Type e8=Q on /academy/ |

---

## Animated / Ambient

### Princess Walker
A ♟ pawn icon walks across the bottom of the screen.
- First walk fires 45 seconds after page load
- Subsequent walks happen every 5–10 minutes (random)
- Subtle vertical bob animation while walking

### Chess Piece Rain
Once per calendar day, chess pieces fall from the top of the screen on the home page.
- Randomized pieces, sizes, speeds, and horizontal positions
- Clears automatically after 4 seconds

### Header Amber Disruption
On the home page, once you scroll past the hero section, the site header enters a "signal disruption" state — a subtle flicker animation signals you've left the surface.

### CRT Glitch (Classified Theme)
Pages using `layout: easter-eggs` (classified, archive, dispatch, 404) get periodic CRT scanline glitch bursts — a brief horizontal-shift distortion every ~24 seconds.

---

## Interactive / On-Page

### Hold-to-Reveal (Classified / Archive)
On `/classified/` and `/archive/`, redacted █████ blocks can be revealed by holding down a click or tap for ~1.2 seconds. Releases the real text underneath.

### Arc Panel Lore Typewriter (Home Page)
Hover over any story arc panel on the home page to trigger a typewriter effect revealing a secret lore line. The text clears when you move away.

### Character Name Glitch
On the home page characters section, hovering a character chip scrambles the name through `A-Z 0-9 ░▒▓` characters, then resolves back to the real name.

### Staggered Character Flip-In (Characters Page)
On the `/characters/` page, character cards fly in one by one with a staggered 130ms delay each, fading and sliding up from slightly below.

### "You've Been Tagged" (Chess City Location)
Visiting the Chess City location page triggers a large red "TAGGED" stamp that slams in at 500ms, holds for ~2 seconds, then fades out.

### Ink Reveal (Location Pages)
Content on location pages (paragraphs, headings, lists) reveals with an ink-wipe animation as you scroll them into view, using IntersectionObserver.

### Broken Link → Signal Lost
A link on `/classified/` labeled **"MORE FRAGMENTS INCOMING"** leads to `/fragments/` — a non-existent page that hits the custom 404.

### The Letter That Doesn't Shimmer (Studio Home)
In the studio-home tagline "A Million Stories to Tell", the **o in "Stories"** is a static warm
gold while every other letter shimmers — it is a link straight to `/classified/`. No tooltip, no hint.

### Source Comment (/classified/)
The page source of `/classified/` opens with `<!-- if you're reading this, you're already home -->` —
an echo of the Uncle's Barbados fragment on the same page. View-source only.

### The Awake Rook (Chess City only)
On `/locations/chess-city/`, the white rook (♖) in the footer ribbon has two faint blinking
eyes and a small smile (`.rt-alive`, injected on DOMContentLoaded). Pays off The Whisper —
"pieces with mouths and eyes, watching from behind the gates." Every other page's ribbon is normal.
No label, no explanation, no fragment.

### "…or bribery." (Chess City gate)
After **3+ Gauntlet losses** (`pjcc.gauntlet.v2 → losses`, counted on checkmate or resign), a
scratched graffiti line appears under the entry checkpoint: *"…or bribery." — scratched into the
booth wall.* Only shows while the city is still sealed (no Gauntlet win).

### The Spotted Pawn (The Gauntlet)
The opposition's **e-pawn** carries two faint spots (a small white dog with black spots) —
tracked square-to-square as it moves, gone when captured, promoted, or taken en passant.
Crockett: "usually the first one sacrificed, never seems to mind." Zero label, in-game only.

### window.murphysLaw() (site-wide)
A hidden global function. Call it with anything — it always returns `false` and logs
*"...called it!"* (Gerald "Jerry" Murphy's catchphrase). Calling it marks `frag_murphys_law`.

### June 13 — for Princess (site-wide + studio home)
On **June 13** (Princess's real birthday), the footer copyright silently becomes
"© McPuppy Studios **· for Princess**" for that day only, then reverts. Client-side date
check; zero announcement anywhere.

### The Liminal LAST SEEN (dossiers)
Every character's LAST SEEN is a *place* — except two, which are *thresholds*:
- Gerald "Jerry" Murphy: `CHECKER TOWN — THE GATE` (was already in his file)
- Argus: `CHECKER TOWN — THE FRONT DOOR` (the mythological Argus is Odysseus's dog,
  who waited at the threshold for his master's return)
Never explained anywhere. A careful reader pairs them by the em-dash format.

---

## Tools / Widgets

### Chess Clock (Home Page)
Live timer counting up from March 1, 2026 (project start date), updating every second. Format: `Xd HH:MM:SS`.

Milestone badges unlock automatically:
- 30 days: ★ 30 DAYS IN THE GAME
- 60 days: ★ TWO MONTHS DEEP
- 100 days: ★ 100 DAYS
- 180 days: ★ HALF A YEAR
- 365 days: ★ ONE YEAR IN DEVELOPMENT
- 500 days: ★ 500 DAYS — NO SIGNS OF STOPPING

### Chess Puzzle (Chess Lessons Page)
A real tactical position (White Kf1/Qd1 vs Black Kd8/Rd6) is displayed as an interactive 8×8 board.
- The correct answer is **Qd5** (a fork — checks the king, attacks the rook)
- Typing `Qd5` on the keyboard fires the chess notation toast and links to /classified/

### Chess.com Live Stats (Chess Lessons Page)
Fetches live ratings from the chess.com public API for `ngreen37`.
- Displays Daily, Blitz, and Rapid ratings with animated count-up

### Nate's Work Schedule (Narrator Character Page)
A live widget shows what Nate is currently doing based on real-world time and day:
- Weekdays 8am–3pm: CHECKER TOWN ELEMENTARY / TEACHING
- Weekdays 3–5pm: IN TRANSIT / COMMUTING
- Weekdays 5–9pm: HOME — CHECKER TOWN / OFF DUTY
- Weekdays 9pm+: WORKING ON PJCC
- Saturday 2–5pm: CHESS CLUB / PRACTICING
- Sunday: PREPARING FOR THE WEEK

### Time Since Last Post (Blog Page)
Below the post list, a live counter shows how long ago the last blog post was published — "TODAY", "YESTERDAY", or "X DAYS AGO".

### Nav Transition Overlay
Every internal link click triggers a "MOVING TO: /path/ — ACCEPTED" overlay that flashes before the page loads. Gives the site a classified-terminal feel.

### Random Classified Stamp
On classified-layout pages, a random stamp (CLEARANCE: DELTA, EYES ONLY, CLASSIFIED, etc.) appears in a random corner 1.2 seconds after load, then fades after 2 seconds.

---

## Story / Lore

### World Status Ticker (Home Page)
A live scrolling news ticker at the top of the home page broadcasts fictional Checker Town Bureau of Dispatch headlines — world-building delivered as ambient atmosphere.

### Story Arc Progress Bar (Blog Page)
A visual film strip shows progress through the 8 story chapters plus the locked classified chapter (CHAPTER — 0?), with color-coded status (Backstory / In Development / Upcoming / Classified).

### Draft Post Teaser (Blog Page)
A faded, unclickable "EP. ??" card at the bottom of the post list hints at classified upcoming content.

### Chess City ACCESS DENIED Gate (Chess City Location)
The Chess City location page features a gated section with a disabled red button — "ACCESS DENIED — CLEARANCE INSUFFICIENT."

### stat Counters (Home Page)
Animated count-up for Posts Written, Characters, and Locations — all pull live from Jekyll's `site.posts`, `site.characters`, `site.locations`.

---

*Last updated: July 2026 (the hidden-in-plain-sight batch)*
