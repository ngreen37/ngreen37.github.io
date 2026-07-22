# The jellybeans — found and deleted, 2026-07-22

Nate, 2026-07-22, with a screenshot and eleven red arrows:

> The "jellybeans" are still there. I saw in some of our .md notes that this has been
> fixed, but it was never fixed. I just moved on, but I really want them gone… There are
> somehow MORE of them. These are separate from the chess piece glyphs.

He was right on every count. It was never fixed. There were more of them. And it was not
the chess glyphs.

## What they actually were

`.flair-weathering`, built by `setupWeathering()` in `assets/js/pjcc-flair.js` and styled
in `_sass/_pjcc-11-flair.scss`. Feature "#16 — the wall remembers you": every day you came
back, the site added one more soft splat to the bottom of the footer.

Per splat: 9–27px wide, roughly half as tall, an irregular four-value `border-radius`
(`58% 61% 50% 49%`…), a random rotation, `filter: blur(0.6px)`, and a fill picked round-robin
from gold, lavender, **teal**, pink, purple and orange at 4.5–9.5% alpha. Pinned into a 30px
`overflow:hidden` strip across the foot of `.site-footer`, so it landed on **every page**.

Blurred, pastel, irregularly round, lying in a row along the bottom of the screen. A jellybean.

## Why two earlier hunts missed it

```js
var n = Math.min(18, Math.max(0, (st.d || 0) - 1));   // day one: the wall is clean
if (!n) return;
```

**It is invisible to a fresh browser.** Day one draws nothing. Every screenshot, every
headless check, every standalone repro, every incognito window — all of them are day one.
The bug could only ever be seen by someone who had been coming back, which on this site
means Nate and nobody else.

So on 2026-07-14 and again on 2026-07-15 the search went looking for something ambient near
the bottom of the page, found the town-sky cloud puffs and the footer glyph ribbon, culled
both, and wrote "fixed" into three files. The splats were sitting directly on top of the
glyph ribbon the whole time, which is probably why the ribbon kept taking the blame.

And because the count is `visitDays - 1`, capped at 18, they **grew by one a day**. Nate
counted eleven, which puts him on day twelve. Left alone it would have reached eighteen.

## How it was found this time

Guessing had already failed twice, so nothing was assumed:

1. Rendered the live page and walked every element — nothing.
2. Walked every `::before`/`::after` too, since pseudo-elements are invisible to
   `querySelectorAll` — nothing.
3. Ran a pixel-level local-contrast detector over the screenshot, so it would find a blob
   no matter what drew it — nothing.
4. Matched the footer glyph spacing in the screenshot against the render to recover Nate's
   real viewport (~950 CSS px, not 1900), and re-rendered there — nothing.
5. Rendered headful, with a real GPU and a real window, composition now pixel-matching his
   screenshot — still nothing.

Five clean renders of a page that demonstrably had eleven blobs on it is not a failure to
find the bug; it is the strongest possible clue about the bug. Nothing that depends only on
the page can be invisible five times over. It had to depend on *browser state*. Grepping the
JS for anything that writes to `localStorage` and appends to the footer found it in one hit.

Confirmed by seeding `pjcc.weathering` to `{d:12}` in a headless profile and reloading:
twelve `.flair-weathering i` elements appeared in the footer, teal and pink and gold,
`blur(0.6px)`, exactly as photographed.

## The lesson worth keeping

**A repro that comes back clean five times is evidence, not a dead end.** When a bug is real
and the page renders clean, stop re-examining the page and start asking what the reporting
browser has that a fresh one doesn't — saved state, a stored counter, a progress flag, an
install. Anything gated on `localStorage` is invisible to every tool we normally trust here,
because every one of those tools starts from a blank profile.

Corollary: a feature that only appears for returning visitors can never be caught by a
screenshot check. If we build one again, it needs a way to force it on for testing.

## What changed

- **Deleted** `setupWeathering()` and its call site in `assets/js/pjcc-flair.js`, and the
  `.flair-weathering` rules in `_sass/_pjcc-11-flair.scss`. The post-mortem comment lives
  where the function was.
- **Corrected the record** in every file that claimed this bug was solved:
  `_sass/_pjcc-04-flair.scss`, two notes plus the sky-veil write-up in
  `_sass/_pjcc-20-town-sky.scss`, `_layouts/home.html`, `pjcc.md`, and
  `docs/front-door-2026-07-21.md`.
- **Kept** the cloud and star culls and the sky veil. They were adopted for the wrong
  reason, but they give the calmer content-page sky we want, and re-showing discrete sky
  layers on every page is a design change Nate should make deliberately, not a side effect
  of a bug fix. Every note now says so plainly.
- The stale `pjcc.weathering` key stays in visitors' browsers, read by nothing. Harmless.

## Still open

The splats are gone, but "the wall remembers you" was a real idea, and it died because it
was ambient dirt rather than because returning visitors shouldn't get anything. If it comes
back it should be something a visitor can *read* as intentional — a mark that means
something, not decoration that looks like the page needs cleaning. Restore from git if that
day comes.
