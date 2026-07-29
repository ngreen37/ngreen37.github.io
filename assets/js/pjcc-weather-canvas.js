/* =============================================================================
 * PJCC WEATHER — ONE CANVAS FOR ALL OF IT   (2026-07-28)
 * -----------------------------------------------------------------------------
 * Rain · SNOW · mist, drawn as particles on a single viewport-sized <canvas>,
 * replacing four separate CSS contraptions that each paid for its own oversized
 * compositor layer.
 *
 * WHY THIS EXISTS. `npm run motion` priced the old weather at 1.20 full screens of
 * GPU texture for rain alone — two sheets, each sized big enough that a ROTATED
 * rectangle could still cover the viewport as it slid. That rotation is what made
 * them expensive: a sheet tilted 8-13 degrees has to be `W·cosθ + H·sinθ` wide and
 * `W·sinθ + H·cosθ` tall just to keep the corners covered, and then twice the tile
 * height again because the fall is one-sided. We halved it, then halved it again,
 * and it was still the second-biggest thing on the site.
 *
 * A canvas is exactly ONE screen, whatever it draws, and the tilt becomes free —
 * it's just `x - dx` when you draw the line. That's the whole trade: a little
 * main-thread drawing (a few hundred particles, well under a millisecond) in
 * exchange for the compositor memory going from 1.20 screens to 1.00 at native
 * resolution, and to ~0.44 at the resolution we actually use.
 *
 * AND SNOW IS THE REASON IT WAS WORTH DOING. Nate asked for snow months ago and it
 * never happened, because in CSS it meant a THIRD contraption. Here it's a branch
 * in a table. Snow also never needed the rotation that made rain expensive: it
 * falls straight and sways.
 *
 * ── THE RULES THIS OBEYS ────────────────────────────────────────────────────
 *  1. DATE-SEEDED, never per-load. The particle field is seeded from
 *     PJCC_TIME.daySeed(), so the whole town gets the same weather on the same
 *     day — the standing rule for every ambient feature on this site.
 *  2. NEVER STARTS when the visitor has asked for quiet. `reduce-flourish` or
 *     `prefers-reduced-motion` means the loop is not started AT ALL — not started
 *     and paused, not started.
 *  3. STOPS DEAD when the tab is hidden. A background tab drawing snow is pure
 *     battery theft, and `visibilitychange` is one listener.
 *  4. DPR IS CAPPED AT 1.5. The backing store is w·h·4·dpr², so a dpr-3 phone
 *     would pay NINE times a dpr-1 screen for a field of soft particles nobody is
 *     inspecting. 1.5 keeps rain streaks from going chunky and costs 0.44 screens
 *     instead of 1.00. (dpr 1 looked visibly steppy on the diagonal; measured.)
 *  5. ONE PATH PER SHEET. All of a sheet's raindrops go into a single path and get
 *     one stroke() — not N strokes. Snow and mist blit a PRE-RENDERED sprite
 *     instead of building a radial gradient per particle per frame, which is the
 *     difference between "free" and "a profiler entry".
 *
 * Public: PJCCWeather.start(kind) · .stop() · .setIntensity(0|1|2) · .kind()
 * ========================================================================== */
(function () {
  'use strict';

  var KINDS = { rain: 1, snow: 1, mist: 1 };

  /* ── deterministic PRNG (mulberry32) so the field is the town's, not the tab's ── */
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ── a soft round sprite, rendered ONCE and blitted thereafter ──────────────
     Building a createRadialGradient per particle per frame is the classic way to
     make a canvas effect cost more than the CSS it replaced. This is drawn one
     time into an offscreen canvas; every flake and every fog bank after that is a
     drawImage, which the GPU does for nothing. */
  function softSprite(size, inner) {
    var c = document.createElement('canvas');
    c.width = c.height = size;
    var g = c.getContext('2d');
    var r = size / 2;
    var grd = g.createRadialGradient(r, r, 0, r, r, r);
    grd.addColorStop(0, inner);
    grd.addColorStop(0.45, inner.replace(/[\d.]+\)$/, '0.35)'));
    grd.addColorStop(1, inner.replace(/[\d.]+\)$/, '0)'));
    g.fillStyle = grd;
    g.fillRect(0, 0, size, size);
    return c;
  }

  var W = 0, H = 0, DPR = 1;
  var canvas = null, ctx = null, raf = 0, last = 0;
  var kind = null, intensity = 1, rand = Math.random;
  var flakeSprite = null, fogSprite = null;
  var near = [], far = [], fog = [];

  /* ── THE GLASS COPY ──────────────────────────────────────────────────────────
     2026-07-28, Nate: "rain, snow, etc. for ALL pages should fall BEHIND the
     windows … but make it show through at like a roughly 5-15% visibility on
     games, puzzles, boxes, nav (that would be a really cool subtle effect)."

     So the weather is drawn ONCE, on the main canvas, which now sits BEHIND the
     page. This second canvas sits in FRONT of everything and is nothing but a
     copy of the first, held at ~12% — the same storm, seen through the glass of
     whatever you're looking at. It works over the arcade's <iframe>s too, which
     is why it's a layer and not a pile of translucent backgrounds: you cannot
     make an iframe's contents let the sky through, but you can put a pane of
     rain in front of it.

     IT IS CHEAP, and only because of one decision: the copy is stored at HALF
     LINEAR resolution (GDPR 0.5 where the main canvas caps at 1.5). Backing store
     is w·h·4·dpr², so the ghost's texture is (0.5/1.5)² = ONE NINTH of the main
     canvas's — a quarter of one dpr-1 screen, and far less than that on a phone,
     where the main canvas is the one that scales up. At 12% opacity there is no
     detail to lose; if anything the upscale reads as light diffusing through
     glass, which is what it is meant to be. One drawImage per frame, no second
     simulation, no second particle field.
     ⚠ Never "improve" this by raising GDPR or by running a second particle field.
     Either one undoes the whole reason the weather became a canvas. */
  var GDPR = 0.5;
  var ghost = null, gctx = null, gW = 0, gH = 0;

  /* ── THE DRAW RATE, AND WHY IT IS NOT 60 (2026-07-28) ────────────────────────
     The particle math was never the cost. 400 line segments in two paths is
     nothing. The cost is that a canvas which CHANGES every frame must be cleared
     and re-uploaded to the GPU every frame, and that bill is
     `pixels × frames-per-second` — on a 1440×900 screen the main canvas is
     2160×1350×4 ≈ 11.6MB, sixty times a second.

     So stop drawing sixty times a second. Rain reads as rain at 30fps because the
     streak length and your own eye supply the blur; snow is slower still and mist
     barely moves at all. The physics is unchanged — the simulation advances by the
     time that ACTUALLY elapsed, so the rain falls at the same speed, it is simply
     sampled less often. Halving the rate halves the clear, the rasterisation and
     the upload together, for both canvases.

     The GHOST is the easy money: it sits at 12% opacity behind everything you are
     actually looking at, so it can run at 10fps and no one will ever catch it.

     ⚠ rAF still fires at 60 — we skip the DRAW, not the callback. That is deliberate:
     the callback is a few microseconds and it is what keeps the timing honest. */
  var FPS = { rain: 30, snow: 24, mist: 12 };
  var GHOST_FPS = 10;
  var acc = 0, gAcc = 0, drawn = 0, ticks = 0;

  /* ── the weather table ──────────────────────────────────────────────────────
     Everything that differs between rain and snow lives here, so adding a fourth
     kind later (ash? blossom? the Chess City parade?) is a row, not a rewrite.
       n      particles per million square CSS pixels, at medium intensity
       vy     fall speed, px/sec
       tilt   horizontal drift per unit of fall (rain leans; snow does not)
       sway   sine amplitude in px (snow only — this is what makes it read as snow)  */
  var SPEC = {
    /* RAIN INK, -12% 2026-07-28 (Nate: "can you make the rain slightly more realistic?
       Maybe 5-15% more transparent?"). near 0.50 → 0.44, far 0.28 → 0.25. Real rain is
       barely a tint — you read it as motion and as the way it bends the light behind it,
       not as white lines. Rounding down also matters for the glass copy: a drop seen
       through the ghost lands at alpha × 0.12, and it was the NEAR sheet that made the
       storm feel painted on. */
    /* −14% AGAIN 2026-07-28 pm (Nate: "increase [the transparency] where it is visible
       by at least 10%"). near 0.44 → 0.38, far 0.25 → 0.22. See INK vs COVERAGE below —
       transparency was only half the answer; the other half was how much ink is on the
       screen at any instant, which had silently doubled. */
    rain: {
      near: { n: 210, vy: [1150, 1600], len: [14, 26], tilt: 0.17, w: 1.15, ink: 'rgba(206,224,255,0.38)' },
      far:  { n: 260, vy: [620, 900],   len: [8, 15],  tilt: 0.13, w: 0.75, ink: 'rgba(190,210,245,0.22)' }
    },
    snow: {
      near: { n: 90,  vy: [42, 78],  r: [1.8, 3.6], sway: [10, 26], swayHz: [0.14, 0.34], alpha: [0.55, 0.92] },
      far:  { n: 130, vy: [18, 38],  r: [0.9, 1.9], sway: [6, 16],  swayHz: [0.08, 0.22], alpha: [0.22, 0.45] }
    },
    mist: { n: 11, r: [180, 420], vx: [4, 13], alpha: [0.05, 0.13] }
  };

  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var pick = function (r, range) { return lerp(range[0], range[1], r()); };

  /* ── build the field ─────────────────────────────────────────────────────── */
  function seedField() {
    near = []; far = []; fog = [];
    var seed = 1;
    try { if (window.PJCC_TIME && PJCC_TIME.daySeed) seed = PJCC_TIME.daySeed(); } catch (e) {}
    rand = rng(seed ^ 0x9E3779B9);

    var megapx = (W * H) / 1000000;
    /* ── HOW HARD IT COMES DOWN (light / med / heavy) ─────────────────────────────
       HEAVY WAS 1.55 (2026-07-28 pm, Nate: "the heavy rain is way too heavy. It's real
       distracting so let's calm it down significantly"). Two things were wrong with it
       and only one of them was this number — see the coverage note below. With the
       coverage bug fixed, 1.55 was still the loudest setting the site has ever shipped,
       so it comes down to 1.3: a heavy shower rather than a squall. The gap between the
       three levels stays wide enough that the wander through the day is still legible. */
    var mult = [0.55, 1, 1.3][intensity];

    if (kind === 'mist') {
      var s = SPEC.mist;
      for (var i = 0; i < s.n; i++) {
        fog.push({
          x: rand() * W, y: H * (0.45 + rand() * 0.75),
          r: pick(rand, s.r), vx: pick(rand, s.vx) * (rand() < 0.5 ? -1 : 1),
          a: pick(rand, s.alpha)
        });
      }
      return;
    }

    var spec = SPEC[kind];
    [['near', near], ['far', far]].forEach(function (pair) {
      var s = spec[pair[0]], out = pair[1];
      /* ── SHUTTER SPEED (2026-07-28) ────────────────────────────────────────
         Drawing half as often means a drop JUMPS twice as far between frames, and
         if the streak stays the same length the fall stops reading as streaks and
         starts reading as dots. Measured at 30fps: a near drop travels 51-71px
         between draws while being 14-26px long — a gap of 2× to 5× its own length.

         The fix is the real-world one. A longer gap between exposures IS a longer
         motion blur; that is what a slow shutter does to rain in a photograph. So
         the streak grows in exact proportion to the interval, which puts the gap
         ratio back where 60fps had it. Brightness is unchanged, because the eye
         integrates over time: twice the ink shown for twice as long is the same
         light. Only a still frame looks different — and stills of rain always do. */
      var blur = Math.min(2.2, 60 / (FPS[kind] || 30));

      /* ══ INK vs COVERAGE — the bug the shutter fix left behind (2026-07-28 pm) ═════
         The motion blur above is right about BRIGHTNESS and wrong about EVERYTHING
         ELSE, and that is what "way too heavy" turned out to be.

         The physics argument was: twice the ink shown for twice as long is the same
         light, because the eye integrates over time. True — for one drop. But what makes
         rain distracting is not the light it emits over a second, it is how much of the
         screen is covered by a moving line AT ANY INSTANT. Doubling every streak while
         keeping the same number of streaks doubled the instantaneous coverage of the
         whole storm. Measured on a 1440×900 screen at heavy: 420 near streaks (the old
         clamp) at 14-26px each was ~8400px of ink at 60fps, and ~16,800px after the
         shutter change. Nate praised heavy rain the morning it was the first number and
         called it "way too heavy" the day it was the second. He was reading the change
         exactly.

         So COVERAGE (n × len) is the thing to hold constant, not n. Longer streaks buy
         continuity; they must be paid for with fewer drops. Divide the count by the same
         factor the length was multiplied by and the storm looks like the 60fps one again
         — same ink, same density, no dotting — while still costing half the draws.
         ⚠ Rain only: snow and mist blit a fixed-size sprite, so their coverage never
         moved when the draw rate did. */
      var n = Math.round(s.n * megapx * mult / (kind === 'rain' ? blur : 1));
      n = Math.max(6, Math.min(420, n));

      for (var i = 0; i < n; i++) {
        if (kind === 'rain') {
          out.push({ x: rand() * W, y: rand() * H, vy: pick(rand, s.vy), len: pick(rand, s.len) * blur });
        } else {
          out.push({
            x: rand() * W, y: rand() * H,
            vy: pick(rand, s.vy), r: pick(rand, s.r),
            sway: pick(rand, s.sway), hz: pick(rand, s.swayHz),
            ph: rand() * Math.PI * 2, a: pick(rand, s.alpha)
          });
        }
      }
    });
  }

  /* ── the frame ───────────────────────────────────────────────────────────── */
  function drawRainSheet(list, s, dt) {
    ctx.strokeStyle = s.ink;
    ctx.lineWidth = s.w;
    ctx.beginPath();
    for (var i = 0; i < list.length; i++) {
      var p = list[i];
      p.y += p.vy * dt;
      p.x += p.vy * s.tilt * dt;
      if (p.y > H) { p.y = -p.len - rand() * 60; p.x = rand() * (W + 200) - 100; }
      if (p.x > W + 40) p.x -= W + 80;
      // ONE path for the whole sheet; one stroke() below.
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - p.len * s.tilt * 2.4, p.y - p.len);
    }
    ctx.stroke();
  }

  function drawSnowSheet(list, dt, t) {
    for (var i = 0; i < list.length; i++) {
      var p = list[i];
      p.y += p.vy * dt;
      if (p.y - p.r > H) { p.y = -p.r * 2; p.x = rand() * W; }
      // the sway is what makes it read as SNOW and not as slow rain
      var x = p.x + Math.sin(t * p.hz * Math.PI * 2 + p.ph) * p.sway;
      ctx.globalAlpha = p.a;
      ctx.drawImage(flakeSprite, x - p.r * 2, p.y - p.r * 2, p.r * 4, p.r * 4);
    }
    ctx.globalAlpha = 1;
  }

  function drawMist(dt) {
    for (var i = 0; i < fog.length; i++) {
      var b = fog[i];
      b.x += b.vx * dt;
      if (b.x - b.r > W) b.x = -b.r;
      if (b.x + b.r < 0) b.x = W + b.r;
      ctx.globalAlpha = b.a;
      ctx.drawImage(fogSprite, b.x - b.r, b.y - b.r, b.r * 2, b.r * 2);
    }
    ctx.globalAlpha = 1;
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    ticks++;
    if (!last) last = now;
    // Clamp dt: a tab that was throttled hands back a huge delta, and without this
    // every particle teleports off-screen on the first frame back.
    var elapsed = Math.min(0.05, (now - last) / 1000);
    last = now;

    /* ── the rate gate. Bank the elapsed time; draw only when a whole frame's worth
       has built up, and then advance the simulation by everything we banked — so the
       rain falls at exactly the same SPEED, it is just sampled less often. Skipping
       the draw skips the clear, the raster and the GPU upload together. */
    acc += elapsed;
    gAcc += elapsed;
    var step = 1 / (FPS[kind] || 30);
    if (acc < step) return;
    var dt = Math.min(0.05, acc);
    acc = 0;
    drawn++;

    var t = now / 1000;

    ctx.clearRect(0, 0, W, H);
    if (kind === 'rain') {
      drawRainSheet(far, SPEC.rain.far, dt);
      drawRainSheet(near, SPEC.rain.near, dt);
    } else if (kind === 'snow') {
      drawSnowSheet(far, dt, t);
      drawSnowSheet(near, dt, t);
    } else {
      drawMist(dt);
    }

    // …and the same storm again, small and faint, in front of the page — on its own,
    // much lazier clock. Nobody can see 10fps at 12% opacity through a card.
    if (gctx && gAcc >= 1 / GHOST_FPS) {
      gAcc = 0;
      gctx.clearRect(0, 0, gW, gH);
      gctx.drawImage(canvas, 0, 0, gW, gH);
    }
  }

  /* ── sizing ──────────────────────────────────────────────────────────────── */
  function resize() {
    if (!canvas) return;
    var vw = canvas.clientWidth || window.innerWidth;
    var vh = canvas.clientHeight || window.innerHeight;
    /* See rule 4 up top — but the cap is PER KIND, because the three weathers do not
       need the same resolution and pretending they do leaves free memory on the table:
         rain 1.5  — thin diagonal lines are the only thing here with a hard edge, and
                     at dpr 1 the tilt goes visibly steppy. Measured, not guessed.
         snow 1.25 — soft round blits; the sprite is already a blurred gradient, so
                     the extra samples land on pixels that were never crisp.
         mist 1.0  — 180-420px clouds of 5-13% alpha. There is nothing in a fog bank
                     that a second sample could resolve.
       On a dpr-3 phone that is 0.25 / 0.17 / 0.11 of a screen. The old CSS rain was
       1.20 screens at ANY dpr, because it was sized in CSS pixels. */
    var cap = kind === 'rain' ? 1.5 : kind === 'snow' ? 1.25 : 1;
    DPR = Math.min(window.devicePixelRatio || 1, cap);
    W = vw; H = vh;
    canvas.width = Math.round(vw * DPR);
    canvas.height = Math.round(vh * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);   // draw in CSS pixels, store at DPR
    if (ghost) {
      gW = Math.max(1, Math.round(vw * GDPR));
      gH = Math.max(1, Math.round(vh * GDPR));
      ghost.width = gW; ghost.height = gH;
      // identity transform: the blit maps the whole source onto the whole ghost,
      // so the ghost never needs to know what DPR the real canvas is stored at.
      if (gctx) gctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    seedField();
  }

  var rt = 0;
  function onResize() { clearTimeout(rt); rt = setTimeout(resize, 180); }

  /* ── control ─────────────────────────────────────────────────────────────── */
  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0; last = 0;
  }
  function run() {
    if (raf || !kind) return;
    last = 0;
    raf = requestAnimationFrame(frame);
  }

  /* The driver (pjcc-weather.js) already refuses to call start() for a visitor who
     asked for quiet. This is the second lock, on the engine itself: a CSS
     `display:none` hides the canvas but does NOT stop requestAnimationFrame, so a
     future caller who forgot the check would burn a frame loop forever drawing snow
     nobody can see. Rule 2 says "not started", and this is what makes that true no
     matter who calls in. */
  function quiet() {
    try { if (localStorage.getItem('pjcc.flourish') === '0') return true; } catch (e) {}
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function start(k, host, glass) {
    if (!KINDS[k]) return false;
    if (quiet()) return false;
    kind = k;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.className = 'tw-canvas';
      canvas.setAttribute('aria-hidden', 'true');
      (host || document.body).appendChild(canvas);
      ctx = canvas.getContext('2d', { alpha: true });
      if (!ctx) { canvas.remove(); canvas = null; return false; }
      /* The glass copy is OPTIONAL on purpose. If the caller doesn't hand us a
         host for it, or the context can't be had, the weather still falls behind
         the page exactly as it should — you just don't see it through the
         windows. Degrade by losing the flourish, never by losing the weather. */
      if (glass) {
        ghost = document.createElement('canvas');
        ghost.className = 'tw-ghost';
        ghost.setAttribute('aria-hidden', 'true');
        glass.appendChild(ghost);
        gctx = ghost.getContext('2d', { alpha: true });
        if (!gctx) { ghost.remove(); ghost = null; }
      }
      flakeSprite = softSprite(24, 'rgba(255,255,255,0.95)');
      fogSprite = softSprite(160, 'rgba(212,222,244,0.55)');
      window.addEventListener('resize', onResize);
      window.addEventListener('orientationchange', onResize);
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) stop(); else run();
      });
    }
    resize();
    run();
    return true;
  }

  window.PJCCWeather = {
    start: start,
    stop: stop,
    kind: function () { return kind; },
    setIntensity: function (i) {
      i = Math.max(0, Math.min(2, i | 0));
      if (i === intensity) return;
      intensity = i;
      seedField();
    },
    // for the harness: what is actually on screen right now
    debug: function () {
      return { kind: kind, intensity: intensity, dpr: DPR, w: W, h: H,
               near: near.length, far: far.length, fog: fog.length, running: !!raf,
               ghost: !!ghost, ghostDpr: ghost ? GDPR : 0, ghostW: gW, ghostH: gH,
               // rate gate: rAF callbacks vs draws actually performed
               targetFps: FPS[kind] || 30, ticks: ticks, draws: drawn };
    }
  };
})();
