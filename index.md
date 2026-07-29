---
# `/` is a SELF-CONTAINED intro card — it must render with NO site layout (the full
# <!DOCTYPE html> lives right below). `layout: null` is an explicit guard, not decoration:
# with the key merely ABSENT, GitHub Pages was serving the PJCC home at `/` instead of the
# intro — its build re-emitted this file from a stale cache entry that still recorded an
# OLD `layout: home`, wrapping index.md's front matter in the home layout and dropping the
# intro body. Verified 2026-07-24 (origin source was already the intro; the built `/` was
# home content with index.md's own title/description). Pinning it null forces the standalone
# render every build, and defends the page against any future layout default. (2026-07-24)
layout: null
permalink: /
tab_title: McPuppy Studios
description: McPuppy Studios presents Princess and the Journey to Chess City — an animated series in the making, a chess academy, and a world of free chess games.
---
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>McPuppy Studios</title>
  <meta name="description" content="McPuppy Studios presents Princess and the Journey to Chess City — an animated series in the making, a chess academy, and a world of free chess games.">
  <link rel="canonical" href="{{ '/' | absolute_url }}">
  <meta name="theme-color" content="#000000">
  <meta name="robots" content="index, follow">
  <meta property="og:type" content="website">
  <meta property="og:title" content="McPuppy Studios">
  <meta property="og:description" content="McPuppy Studios presents Princess and the Journey to Chess City.">
  <meta property="og:url" content="{{ '/' | absolute_url }}">
  <meta property="og:image" content="{{ '/assets/images/pjcc-share-card.jpg' | absolute_url }}">
  <link rel="icon" href="{{ '/assets/images/favicon.svg' | relative_url }}">

  {%- comment -%}
    ══════════════════════════════════════════════════════════════════════════════
    THE INTRO — "McPuppy Studios Presents" → /chess/  (2026-07-23; retargeted 2026-07-28)
    ──────────────────────────────────────────────────────────────────────────────
    Nate: "It's weird to go to mcpuppystudios.com and it goes to PJCC. The splash made
    sense but was too much. So let's do a compromise: a black/white, 2-second typing
    intro that says 'McPuppy Studios Presents', then it opens to the PJCC site."

    So `/` is a self-contained black-&-white intro card. It fades up from black, types the
    line, holds a beat, then fades back down to black and hands off to /pjcc/ with
    location.replace (so Back doesn't bounce you into the intro). ~3s door to door — the
    slow fades are deliberate (Nate, 2026-07-27); the card used to snap on instantly. Deliberately a STANDALONE page — no site chrome, no town sky —
    both because the intro must own the whole screen, and because this is the SLOT Nate's
    Blender animations drop into later: swap the .intro-stage markup for a <video>/<canvas>
    and keep the same forward logic.

    ⚠ 2026-07-28 — THE TARGET MOVED, /pjcc/ → /chess/. The front door is McPuppy Chess now
    (a chess site: one promise, one button); /pjcc/ became the WORLD tab. Six references
    below had to change together: the repeat-visit head script, the stage anchor, the Skip
    link, the <noscript> refresh, the <noscript> link, and TARGET. If you retarget again,
    change all six or one path silently keeps the old destination.

    Plays ONCE PER SESSION: the head script below redirects instantly on repeat visits
    (so clicking the header logo → "/" doesn't replay the 2s card every time). Skippable
    on any click / key. Honors reduced motion. <noscript> still gets you through.
    ══════════════════════════════════════════════════════════════════════════════
  {%- endcomment -%}
  <script>
    /* repeat visits this session skip straight to the world — no flash of the card */
    try { if (sessionStorage.getItem('mcp.intro.seen') === '1') location.replace({{ '/chess/' | relative_url | jsonify }}); } catch (e) {}
  </script>

  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { height: 100%; background: #000; }
    body { overflow: hidden; }
    /* 2026-07-27 (Nate: "let's slow fade it in, and slow fade it out"). Both fades are
       plain opacity transitions driven by two classes — .in is added on the first frame,
       .done just before it hands off — rather than a CSS animation, so the fade-out never
       has to fight an animation's fill state for the same property.

       2026-07-29 (Nate: "can we slow the fade in, fade out for the intro. Make it more
       noticeable?") — .85s/.95s → 1.4s/1.5s, and the easing changed from `ease` to
       `ease-in-out`, which is the half that actually makes it NOTICEABLE. `ease` front-
       loads the change: most of the opacity moves in the first third and the tail is a
       barely-visible crawl toward the value it already looks like it reached, so a
       "slow" fade in `ease` reads as a quick fade followed by a wait. `ease-in-out`
       spends its time in the MIDDLE of the range, where the eye can see the card is
       moving. Same duration, more visible dissolve.

       The three legs are a set — see the timers at the foot of the page. */
    .intro-stage {
      position: fixed; inset: 0; display: flex; align-items: center; justify-content: center;
      background: #000; cursor: pointer; text-decoration: none;
      opacity: 0; transition: opacity 1.4s ease-in-out;
    }
    .intro-stage.in { opacity: 1; }
    .intro-stage.done { opacity: 0; transition: opacity 1.5s ease-in-out; }
    .intro-line {
      display: inline-flex; align-items: center;
      font-family: ui-monospace, "SFMono-Regular", "Courier New", monospace;
      font-size: clamp(17px, 4.8vw, 34px); letter-spacing: 0; color: #fff;
      white-space: nowrap;
    }
    /* the "typing across": a monospace box grown from 0 to 24ch in 24 steps, clipping the
       text one character at a time. "McPuppy Studios Presents" is exactly 24 cells. */
    .intro-type {
      display: inline-block; overflow: hidden; white-space: nowrap; vertical-align: bottom;
      width: 0; animation: introType 1.2s steps(24, end) forwards;
    }
    @keyframes introType { to { width: 24ch; } }
    /* the caret sits just after the text and rides along as the box widens */
    .intro-caret {
      display: inline-block; width: 0.62ch; height: 1.05em; margin-left: 3px; background: #fff;
      animation: introCaret .7s step-end infinite;
    }
    @keyframes introCaret { 50% { opacity: 0; } }
    .intro-skip {
      position: fixed; bottom: 18px; right: 20px; z-index: 2;
      font-family: ui-monospace, "Courier New", monospace; font-size: 11px;
      letter-spacing: .18em; text-transform: uppercase; color: #5a5a5a; text-decoration: none;
      transition: color .2s ease;
    }
    .intro-skip:hover, .intro-skip:focus-visible { color: #fff; }
    @media (prefers-reduced-motion: reduce) {
      .intro-type { animation: none; width: 24ch; }
      .intro-caret { animation: none; opacity: 1; }
      .intro-stage { transition: none; opacity: 1; }
    }
  </style>
</head>
<body>
  <a class="intro-stage" id="intro" href="{{ '/chess/' | relative_url }}"
     aria-label="Enter — McPuppy Studios presents Princess and the Journey to Chess City">
    <span class="intro-line">
      <span class="intro-type">McPuppy Studios Presents</span><span class="intro-caret" aria-hidden="true"></span>
    </span>
  </a>
  <a class="intro-skip" href="{{ '/chess/' | relative_url }}">Skip &rarr;</a>

  <noscript>
    <meta http-equiv="refresh" content="0; url={{ '/chess/' | relative_url }}">
    <p style="color:#fff;font-family:monospace;text-align:center;margin-top:40vh">
      <a href="{{ '/chess/' | relative_url }}" style="color:#fff">Enter &rarr;</a>
    </p>
  </noscript>

  <script>
  (function () {
    var TARGET = {{ '/chess/' | relative_url | jsonify }};
    try { sessionStorage.setItem('mcp.intro.seen', '1'); } catch (e) {}
    var stage = document.getElementById('intro');
    var gone = false;
    function go() { if (gone) return; gone = true; location.replace(TARGET); }
    /* HAND THE FADE ACROSS THE NAVIGATION (2026-07-28, Nate: "let's fade in to the home
       page after we fade out of the McPuppy Presents intro"). Two documents can't share a
       transition, so the intro leaves a one-shot baton in sessionStorage and the next page's
       <head> picks it up before its first paint and fades UP from the same black this card
       is fading DOWN to. See _includes/head.html + _sass/_pjcc-25-front-door.scss.

       Set here in finish() and NOT in go(), on purpose: skipping is a request to be there
       now, and a skip that still made you sit through a fade-in would be answering "faster"
       with "slower". Skip stays instant. */
    function finish() { if (gone) return;
      try { sessionStorage.setItem('mcp.intro.handoff', '1'); } catch (e) {}
      if (stage) stage.classList.add('done'); setTimeout(go, 1500); }

    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    // fade UP from black on the first frame (the type animation is already running under it)
    if (stage) requestAnimationFrame(function () { stage.classList.add('in'); });
    /* THE THREE LEGS, and they must be read together (slowed 2026-07-29):
         1.4s up  ·  hold  ·  1.5s back down to black  ≈ 4.2s door to door (was ~3s).
       The 2600 below is measured from PAGE START, not from the end of the fade-in, so it
       has to clear 1.4s before the card is even at full strength — at the old 2000 a 1.4s
       fade-in would have left only 0.6s of card, and the "slower" intro would have felt
       more rushed, not less. 2600 leaves ~1.2s of held, fully-lit card, which is about
       how long the eye needs to read three words.
       `setTimeout(go, 1500)` must equal the .done transition above: shorter and the
       navigation eats the tail of the fade, longer and the screen sits black. */
    var timer = setTimeout(finish, reduce ? 850 : 2600);

    // Skip on any click or key (never trap Tab, so keyboard users can reach the Skip link).
    function skip(e) { if (e.type === 'keydown' && (e.key === 'Tab' || e.metaKey || e.ctrlKey)) return;
      if (e.type === 'click') e.preventDefault(); clearTimeout(timer); go(); }
    document.addEventListener('click', skip);
    document.addEventListener('keydown', skip);
  })();
  </script>
</body>
</html>
