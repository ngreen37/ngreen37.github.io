/* =============================================================================
 * PJCC town clock — ONE source of truth for Checker Town time (US Eastern).
 * -----------------------------------------------------------------------------
 * The hero sky phase, the date-seeded weather, the companion's night-nap, the
 * Night Desk — everything that should agree on "what time / what day / what
 * weather it is in the world" reads this, so the whole town (and every visitor,
 * wherever they are) shares one clock. DST-aware via Intl; falls back to the
 * visitor's local time only if Intl time zones are unavailable.
 *
 *   PJCC_TIME.parts()   -> { h: 0-23, ds: 'YYYY-MM-DD' }  (Eastern)
 *   PJCC_TIME.hour()    -> 0-23
 *   PJCC_TIME.dateStr() -> 'YYYY-MM-DD'
 *   PJCC_TIME.phase()   -> 'dawn' | 'day' | 'dusk' | 'night'
 *   PJCC_TIME.daySeed() -> uint32 seeded by the Eastern date (one town, one day)
 *   PJCC_TIME.weather() -> { kind: 'rain'|'mist'|'clear', roll, phase }
 *   PJCC_TIME.level()   -> 0 (light) | 1 (medium) | 2 (heavy) — the day's opening intensity
 *   PJCC_TIME.skyKind() -> 'eclipse' | 'meteor' | 'aurora' | null — the rare sky today
 *   PJCC_TIME.skyBeat(name) -> does THIS rare-sky beat fire tonight (see SKY_BEATS)
 *   PJCC_TIME.clouds([kind],[level]) -> 0 (clear) | 1 (a few) | 2 (broken) | 3 (overcast)
 *   PJCC_TIME.moon()    -> { frac, lit, waxing, name, shift } — the REAL phase tonight
 *   PJCC_TIME.eclipse() -> { on, cover, total, shift } — the town's solar eclipse
 * ========================================================================== */
(function () {
  'use strict';
  function parts() {
    try {
      var f = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour12: false,
        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
      var p = {}; f.formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
      return { h: parseInt(p.hour, 10) % 24, m: parseInt(p.minute, 10) || 0, ds: p.year + '-' + p.month + '-' + p.day };
    } catch (e) {
      var d = new Date();
      return { h: d.getHours(), m: d.getMinutes(), ds: d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() };
    }
  }
  function hour() { return parts().h; }
  function dateStr() { return parts().ds; }
  function phase() {
    var h = parts().h;
    return (h >= 5 && h < 8) ? 'dawn' : (h >= 8 && h < 17) ? 'day' : (h >= 17 && h < 20) ? 'dusk' : 'night';
  }
  // FNV-1a over the Eastern date — the same seed the whole town gets today.
  function daySeed(ds) {
    ds = ds || parts().ds;
    var h = 2166136261;
    for (var i = 0; i < ds.length; i++) { h ^= ds.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  // The town forecast: 0-2 rain · 3 mist · 4-9 clear (matches the hero's roll).
  //
  // SNOW (2026-07-28) is NOT a new roll, and that's the point. It's the same
  // precipitation the town already rolls, falling as snow because it's winter.
  // One line, no new random source, no drift between "how often does it rain" and
  // "how often does it snow" — and it means the first snow arrives in Checker Town
  // on its own, on 1 December, without anybody remembering to switch it on.
  // (`season()` is a function declaration below, so it's hoisted and safe here.)
  function weather() {
    // ⚑ THE TOWN GETS ITS ECLIPSE. Once every 29.5 days the sun goes out over Checker Town
    // (see eclipse() below) — and roughly two of those days in five would have been rain,
    // mist or a full cloud deck, which would have hidden the rarest thing the sky does
    // behind the most ordinary. So the eclipse day is CLEAR, on purpose, and it is the only
    // day the forecast is ever overruled. It costs the rain roll about one day a month.
    if (eclipseDay()) return { kind: 'clear', roll: 9, phase: phase() };
    /* ⚑ AND SO DO THE TWO RARE NIGHTS (2026-08-13) — the meteor shower and the aurora, for
       the identical reason the eclipse does. `rareSky` is a function declaration below and
       is therefore hoisted, same as `season()` a few lines down. */
    if (rareSky()) return { kind: 'clear', roll: 9, phase: phase() };
    /* ⚑ RAIN CAME DOWN A QUARTER — 2026-08-10. Nate: "It rains a LITTLE too much on the
       site — can we make it 25% less likely to occur? And keep rain/snow the same
       probability, for when winter rolls around."

       It was a 10-sided roll: 0-2 rain (30% of days), 3 mist (10%), 4-9 clear. A quarter off
       30% is 22.5%, which a d10 simply cannot express — the nearest move, dropping rain to
       two faces, is a 33% cut, and rounding a number he gave me to something a third bigger
       is how "we asked for 25%" turns into "why is it still raining." So the die got finer:
       **d40, rain on 0-8 (9/40 = 22.5%), mist on 9-12 (4/40 = 10%, untouched), clear the
       rest.** Same one roll, one seed, one day. Measured over 3,650 real dates: 21.9% / 10.4%.

       ⭐ AND SNOW NEEDED NOTHING, WHICH IS THE WHOLE POINT OF HOW IT WAS BUILT. Snow is not a
       second forecast — it is this rain, wearing winter (the line below). "Keep rain and snow
       at the same probability" is not a thing to maintain here; it is a thing that cannot
       come apart. That was the reason for the one-line design on 2026-07-28, and this is the
       first time it has paid.

       ⚑ AND HALVED AGAIN — 2026-08-13. Nate: "It still rains too frequently on the site —
       can we cut the percentage in half?" 22.5% → **11.25%**, which is why the die doubled
       again rather than losing a face: on the d40, half of nine faces is four and a half.
       **d80, rain on 0-8 (9/80 = 11.25%), mist on 9-16 (8/80 = 10%, untouched for the second
       time), clear the rest.** Exactly half, not "about half" — the same discipline as the
       25% pass above, and for the same reason: a rounded cut is how a number he gave me
       turns back into a complaint.

       ⭐ MIST HAD TO BE RE-EXPRESSED TO STAY STILL. It was 4/40; on a d80 that is 8/80, so
       its four faces became eight and its share did not move. A finer die is only free for
       the outcome you are changing — every OTHER band has to be rewritten just to hold its
       ground, and forgetting one is how an untouched thing quietly doubles.

       ⭐ SNOW STILL NEEDED NOTHING, for the second time. It is this rain wearing winter (the
       line below), not a second forecast, so it followed rain down on its own.

       ⚠ `roll` is still reported 0-9 — it is in this module's documented return shape at the
       top of the file, and a finer die is an implementation detail, not a new contract.
       The divisor tracks the die: d40 → /4, d80 → /8. */
    var r80 = daySeed() % 80;
    var kind = r80 <= 8 ? 'rain' : (r80 <= 16 ? 'mist' : 'clear');
    if (kind === 'rain' && season() === 'winter') kind = 'snow';
    return { kind: kind, roll: (r80 / 8) | 0, phase: phase() };
  }
  /* HOW HARD IT IS COMING DOWN, as one number the whole town agrees on: 0 light,
     1 medium, 2 heavy. It seeds the intensity the storm OPENS on and it decides how
     thick the cloud deck starts (see clouds()), so it has to have exactly one
     definition — pjcc-weather.js used to own a private copy of this expression, and
     the head include had no way to ask what it would say.

     ⚠ `>>> 3`, NOT `>> 3`, AND THAT IS A FIX (2026-08-20). daySeed() returns a full
     uint32, so on every day whose seed has the top bit set, the signed shift in the old
     copy handed `% 3` a NEGATIVE number — and `-2 % 3` is `-2`, which the caller's
     `Math.max(0, …)` then clamped to 0. Half the days in the calendar opened on LIGHT
     no matter what they rolled. Nothing ever threw and the storm still wandered, so it
     read as "the rain seems tame lately" and nothing more. */
  function level() { return (daySeed() >>> 3) % 3; }
  /* Cloud cover — its own roll, so "clear" days still get weather in the sky and a
     starry night isn't always a bare one (Nate: "sometimes it's cloudy, sometimes it's
     both"). Shifted well clear of the rain roll's low bits so the two don't move
     together. Rain and mist force real cover — it can't pour out of a bare sky.

     ⚑ THE DECK NOW TRACKS HOW HARD IT IS COMING DOWN — 2026-08-20 (Nate: "the heavy rain
     and heavy snow should be cloudy because it looks weird with clear skies — same with
     the rain/snow but that could be less cloudy"). Wet days used to return a flat 3 at
     every intensity, so a light shower wore the same overcast as a downpour and the
     three levels the rest of the weather works so hard to distinguish meant nothing in
     the sky. Heavy gets the full deck; light and medium get broken cloud.

     ⚑ AND A CLEAR DAY IS NO LONGER ALLOWED TO BE OVERCAST (same day, Nate: "clear should
     be exactly that. Clear. There are clouds on it currently"). The roll KEEPS its
     variety — that variety is his own 2026-07-13 ask and deleting it would be trading one
     complaint for another — but the lone `3` in the table is gone and there are two more
     bare faces. Half of clear days are now genuinely bare and none of them are a full
     deck, which is what made "clear" read as a lie.
     ⭐ If he wants clear to mean literally zero cloud, it is this one line.

     Both arguments are optional and both are for PREVIEW: `?wx=` has to be able to ask
     "what would the sky be for THIS weather at THIS intensity", because the head include
     stamps the cover class before a pixel renders and it has no other way to know that a
     preview is about to override the forecast. Called with nothing, it is the town's
     real day, exactly as before. */
  function clouds(kind, lv) {
    /* ⚠⚠ WHETHER THE CALLER NAMED THE WEATHER IS ITSELF AN ANSWER (2026-08-20). A `?wx=`
       preview and the town's own day both land here, and for `clear` they want OPPOSITE
       things — which is why `tests/weather.check.js` was red on `main`, and red on SIX DAYS
       IN TEN, because the table below is rolled off `daySeed()`. It passed on the day it was
       written and became a time bomb; nobody had changed a line.
         · the TOWN's clear day keeps its variety — the table, his 2026-07-13 ask.
         · a PREVIEW that says `clear` gets a clear sky. His words on this exact flag:
           *"clear should be exactly that. Clear. There are clouds on it currently."* A
           preview URL that shows you something other than the thing you named is not a
           preview; it is a second forecast.
       ⭐ THIS IS THE "IF HE WANTS CLEAR TO MEAN LITERALLY ZERO CLOUD, IT IS THIS ONE LINE"
       the note above promised — scoped to the preview, so the town is untouched. */
    var asked = kind !== undefined;
    if (!asked) {
      if (eclipseDay()) return 0;                 // see weather() — the eclipse gets a clear sky
      if (rareSky()) return 0;                    // …and so do the shower and the aurora
      kind = weather().kind;
    }
    if (lv === undefined) lv = level();
    if (kind === 'rain' || kind === 'snow') return lv === 2 ? 3 : 2;   // snow needs a deck too
    if (kind === 'mist') return 2;
    if (asked) return 0;                          // you asked for clear; you get clear
    return [0, 0, 1, 1, 0, 2, 1, 0, 1, 0][(daySeed() >>> 11) % 10];
  }
  // Where the ONE orb hangs (2026-07-14 Nate: "the sun and moon should follow an arc
  // ... on all pages"). The sun's window is 5:00→20:00, the moon's 20:00→5:00; t runs
  // 0→1 across the window, rising on the LEFT horizon, apex mid-window, setting RIGHT.
  // x/y are viewport-percent for the fixed sky layer (set as --orb-x/--orb-y on <html>).
  function orb() {
    var p = parts(), mins = p.h * 60 + p.m, t;
    if (mins >= 300 && mins < 1200) t = (mins - 300) / 900;          // the sun — linear across its 15h window
    // The moon's window is only 9h wide, so a LINEAR rise leaves it hanging low all
    // evening — it's barely up at 8:52pm when everyone's actually looking (Nate
    // 2026-07-18: "the moon looks kinda low … it's 8:52"). Ease it up off the horizon:
    // t^0.6 pulls the climb forward so the moon is well up the sky by mid-evening and
    // still sets clean on the right at dawn (endpoints t=0/1 are unchanged).
    else t = Math.pow((((mins - 1200) + 1440) % 1440) / 540, 0.6);   // the moon
    // A 210° circular sweep (2026-07-15 Nate: "-210 to 210 degrees … starts/ends
    // too low"). The half-sine before this pinned both ends AT the horizon (y=74).
    // Now the orb enters ~62% up the LEFT side, apexes near the top (y≈10), and
    // exits ~62% up the RIGHT — a grander arc that no longer skims the horizon at
    // dawn/dusk. a runs -105°→+105° (a 210° arc) as t goes 0→1.
    var a = (-105 + 210 * t) * Math.PI / 180;
    return { t: t, x: 50 + 45.5 * Math.sin(a), y: 51 - 41 * Math.cos(a) };
  }
  /* THE MOON'S REAL PHASE (2026-07-27, Nate: "let's do crescent and waning moons!").
     The town's moon was a full moon every single night of the year, which is the one thing
     a moon never is. This is the actual synodic cycle — days since a known new moon
     (2000-01-06 18:14 UTC), modulo 29.530588853 days — so Checker Town's moon is the moon
     that is genuinely in the sky tonight. Anyone who looks out of a window can check it.
       age   0 → 29.53 days into the cycle
       frac  0 = new · 0.25 = first quarter · 0.5 = full · 0.75 = last quarter
       lit   0 → 1, how much of the disc is lit
       waxing/waning decides which SIDE the shadow sits on. */
  var SYN = 29.530588853, NEW0 = 10395.26;   // 2000-01-06 18:14 UTC, in days since epoch

  /* ── HOW MUCH TO SLIDE THE SHADOW (2026-08-09) ────────────────────────────────────
     The terminator is drawn as a second disc of the night sky, the same size as the moon,
     slid sideways across its face — so the lit part is the LUNE between the two arcs, and
     its area (which is what `lit` measures) is not linear in the offset:

         lit(u) = [ π − 2·acos(u) + 2u·√(1−u²) ] / π      u = 0 new · u = 1 full

     ⚠⚠ THE OLD CODE USED u = 2·lit AND IT BROKE HALF OF EVERY MONTH. One diameter of
     offset already clears the disc completely, so every night from lit 0.5 upward painted
     an identical FULL moon: 2026-08-15 through 08-29 — fifteen nights running — were the
     same picture, in the feature built precisely because "it was a full moon every night
     of the year, which is the one thing a moon never is". Nobody reported it, because a
     full moon looks fine. Inverting the real function is four lines of bisection. */
  function lune(u) { return (Math.PI - 2 * Math.acos(u) + 2 * u * Math.sqrt(1 - u * u)) / Math.PI; }
  function lunePos(lit) {
    var lo = 0, hi = 1, mid;
    for (var i = 0; i < 30; i++) { mid = (lo + hi) / 2; if (lune(mid) < lit) lo = mid; else hi = mid; }
    return (lo + hi) / 2;
  }
  /* ⭐ THE THINNEST CRESCENT GETS A FLOOR (2026-08-09, Nate: "the sliver is too small …
     it's hard to tell what it is when it's so thin"). He was right and the number is
     brutal: on 2026-08-08 the true lune was 1.2px wide on a 46px moon — a hairline, which
     is why the orb read as an empty RING rather than as a crescent. Real crescents that
     thin exist; they are also invisible to the naked eye, so drawing one faithfully means
     drawing nothing. The genuinely NEW moon is exempt and still vanishes — that is not a
     thin moon, it is no moon, and the eclipse below is what it buys us.

     ⚠ IT IS A SOFT FLOOR — √(u² + min²) — NOT `Math.max`. A hard clamp made the four
     thinnest nights of every crescent render as one identical 7px sliver, which is the same
     bug I had just finished fixing at fifteen nights: a floor that flattens is still a flat
     spot. The soft version is monotonic everywhere, lifts 1px to 7px, and by the quarter
     moon it is 7% off the truth and by the gibbous 1%.

     0.155 of a diameter ≈ 7.2px on the 46px orb, and it was PICKED FROM A PICTURE: the real
     .ts-orb rendered against the real night sky at eight floors × the four thinnest nights
     of this crescent. 0.08 (3.8px) still reads as a rim highlight rather than a crescent;
     0.22 (10.2px) makes the thinnest night look three days old. */
  var MOON_MIN = 0.155;
  function floorLune(u) { return Math.min(1, Math.sqrt(u * u + MOON_MIN * MOON_MIN)); }

  /* ══ ⚠⚠ THE GIBBOUS WAS A CRESCENT, FOURTEEN NIGHTS A MONTH ════════════════════════
     2026-08-18, Nate: *"The moon looks a bit odd in its waning gibbous — can we stick to
     these phases?"* with a chart of the seven. He was right, and the defect was bigger
     than the one phase he named.

     ⭐ TWO EQUAL CIRCLES CANNOT MAKE A GIBBOUS. The old terminator was a same-size disc of
     sky slid across the face, so the lit region was always the LUNE between two arcs of
     EQUAL radius — and such a lune is crescent-shaped at every offset there is, with its
     inner edge curving the same way as its outer edge. A gibbous moon is the opposite
     picture: its terminator bows the other way, into the dark. No value of `--moon-shift`
     could have drawn one.

     So the AREA was right — that is what `lunePos` bisects for, and it matched the real sky
     to the decimal — while the SHAPE was wrong on every night the moon was more than half
     lit. Measured on a filmstrip of the full lunation: **2026-08-28, 61% lit, rendered as a
     crescent.** ⭐ WHY IT SURVIVED A YEAR: every phase it got wrong still looked like a
     moon, and the two it got right (full, and the crescents) are the two anybody pictures
     when they think "moon phase". A wrong picture that is still a plausible picture is the
     hardest kind to see — which is why he saw it and no test did.

     ⭐ HIS CHART IS THE SPEC. The seven phases on it are exactly the seven `name` returns.

     ── THE REAL GEOMETRY ────────────────────────────────────────────────────────────
     The terminator is a circle seen edge-on, so it is an ELLIPSE: full height, and a
     horizontal semi-axis that closes to nothing at the quarters and opens back to the full
     radius at new and full.

         a = |1 − 2k| / 2        k = lit fraction, in bounding-box units (disc = 1 wide)

     Emitted as an SVG path in `objectBoundingBox` space, so it is SIZE INDEPENDENT — the
     orb can be any diameter and the phase stays exact. That is also what turned "10%
     larger" into a one-number change instead of a re-derivation.

     ⚠ THE SWEEP FLAGS ARE THE WHOLE THING AND ARE EASY TO GET BACKWARDS. The limb runs down
     the LIT side; the terminator returns the other way, bowing toward the LIT side for a
     crescent and toward the DARK side for a gibbous. Verified by rendering all 29 nights of
     a lunation, not by reasoning. [[pick-visual-values-from-a-render]]

     ⭐ THE THIN-CRESCENT FLOOR SURVIVES, now applied to the thing it was always about: the
     WIDTH OF THE LIT SLIVER. Same soft √(w² + min²), same 0.155 of a diameter Nate picked
     from a render on 2026-08-09 ("the sliver is too small… it's hard to tell what it is").
     ⚠ NOT applied to the gibbous side — a 98%-lit moon really does have a 1px bite out of
     it, and lifting that would be inventing a phase rather than rescuing an invisible one. */
  function moonGeom(lit) {
    var k = Math.max(0, Math.min(1, lit));
    if (k >= 0.5) return { a: (2 * k - 1) / 2, gibbous: true };
    // the lit sliver is `k` diameters wide at true scale; floor it so it stays readable
    var w = Math.min(0.5, Math.sqrt(k * k + MOON_MIN * MOON_MIN));
    return { a: 0.5 - w, gibbous: false };
  }

  /* The clip path for one phase, in objectBoundingBox units (the disc is the unit square).
     `waxing` lights the RIGHT limb, which is what the northern hemisphere sees. */
  function moonPath(lit, waxing) {
    var g = moonGeom(lit), a = g.a;
    var limb = waxing ? 1 : 0;                       // down the lit limb
    var term = waxing ? (g.gibbous ? 1 : 0) : (g.gibbous ? 0 : 1);
    return 'M0.5 0A0.5 0.5 0 0 ' + limb + ' 0.5 1' +
           'A' + a.toFixed(4) + ' 0.5 0 0 ' + term + ' 0.5 0Z';
  }
  function moon(ds) {
    ds = ds || parts().ds;
    var days = Date.UTC(+ds.slice(0, 4), +ds.slice(5, 7) - 1, +ds.slice(8, 10)) / 86400000;
    var age = (((days - NEW0) % SYN) + SYN) % SYN, frac = age / SYN;
    var lit = (1 - Math.cos(frac * 2 * Math.PI)) / 2;
    var name = frac < 0.02 || frac > 0.98 ? 'new'
             : frac < 0.23 ? 'waxing-crescent' : frac < 0.27 ? 'first-quarter'
             : frac < 0.48 ? 'waxing-gibbous'  : frac < 0.52 ? 'full'
             : frac < 0.73 ? 'waning-gibbous'  : frac < 0.77 ? 'last-quarter'
             : 'waning-crescent';
    // waxing lights the RIGHT limb, so the shadow sits LEFT — a negative slide.
    // ⚠ `shift` is KEPT but no longer draws the moon; the clip path does. It stays because
    //   the head include and the eclipse note have both quoted it since 2026-08-09, and a
    //   silently-removed field is a harder bug than an unused one.
    var u = name === 'new' ? 0 : floorLune(lunePos(lit));
    var waxing = frac < 0.5;
    return { age: age, frac: frac, lit: lit, waxing: waxing, name: name,
             shift: (waxing ? -1 : 1) * u,
             path: name === 'new' ? '' : moonPath(lit, waxing) };
  }

  /* ══ A SOLAR ECLIPSE, ONCE A MONTH ════════════════════════════════════════════════
     2026-08-09 (Nate: "let's throw a solar eclipse in once a month … we can make it a
     special event day. How about that for an easter egg, eh?").

     ⭐ IT IS NOT A NEW ROLL, AND THAT IS THE WHOLE REASON IT BELONGS IN THIS FILE. A solar
     eclipse can only happen at NEW MOON — the moon has to be between us and the sun — and
     this clock has computed the genuine new moon since 2026-07-27. So the rarest thing the
     town's sky does falls straight out of arithmetic that was already being done: no seed,
     no calendar, no switch to remember to flip. It arrives roughly every 29.5 days, on its
     own, forever, and it explains the one night a month the moon isn't there.

     ⚑ ONE HONEST SIMPLIFICATION, stated rather than hidden: the real sky also needs the
     orbits to line up in the OTHER axis, which is why Earth gets 2–5 a year instead of 12.
     Checker Town's orbit is tidier. Everything else here is the real thing.

     Exactly ONE day per lunation: the day whose moon is nearer new than the day before and
     no further than the day after. (The `new` phase NAME spans 1–2 calendar days — 5 and 6
     September 2026 are both "new" — so naming can't be the test, or some months would get
     two eclipses and some one.)                                                          */
  var ECL_OPEN = 13 * 60, ECL_SHUT = 15 * 60;   // Eastern 1pm → 3pm, deepest at 2
  function newness(ds) { var f = moon(ds).frac; return f > 0.5 ? 1 - f : f; }
  function eclipseDay(ds) {
    ds = ds || parts().ds;
    var d = Date.UTC(+ds.slice(0, 4), +ds.slice(5, 7) - 1, +ds.slice(8, 10));
    function at(off) { return newness(new Date(d + off * 86400000).toISOString().slice(0, 10)); }
    return at(0) < at(-1) && at(0) <= at(1);
  }
  /* cover: 0 → 1 → 0 across the window, eased so the deep phase LASTS. A straight ramp put
     totality at six minutes — accurate, and once a month at six minutes nobody ever sees it.
     1 − x² holds cover above 0.97 for about twenty minutes and still shows a bitten sun for
     the whole two hours. `shift` is the same offset-disc arithmetic as the moon's phase,
     which is the tidy part: the eclipse IS a terminator, drawn by the same one line of CSS.
     Pass a cover 0–1 to force it — that is the ?eclipse= preview, and nothing else uses it. */
  function eclipse(forceCover) {
    if (forceCover != null) {
      var c = Math.max(0, Math.min(1, forceCover));
      return { on: true, cover: c, total: c >= 0.97, shift: lunePos(1 - c), forced: true };
    }
    var p = parts(), mins = p.h * 60 + p.m;
    if (!eclipseDay(p.ds) || mins < ECL_OPEN || mins > ECL_SHUT) {
      return { on: false, cover: 0, total: false, shift: 1, forced: false };
    }
    var t = (mins - ECL_OPEN) / (ECL_SHUT - ECL_OPEN), x = Math.abs(t - 0.5) * 2;
    var cover = 1 - x * x;
    return { on: true, cover: cover, total: cover >= 0.97,
             shift: (t < 0.5 ? 1 : -1) * lunePos(1 - cover), forced: false };
  }
  // The PJCC calendar season, from the Eastern MONTH (2026-07-15 Nate: "have a set
  // PJCC calendar … summer now, and build Fall/Winter/Spring per the calendar"). Simple
  // meteorological quarters, one season for the whole town, turning over on the 1st:
  // Dec–Feb winter · Mar–May spring · Jun–Aug summer · Sep–Nov fall.
  function season() {
    var mo = parseInt(parts().ds.slice(5, 7), 10) || 1;
    return (mo === 12 || mo <= 2) ? 'winter' : mo <= 5 ? 'spring' : mo <= 8 ? 'summer' : 'fall';
  }
  /* ⚑ TWO RARE NIGHTS — 2026-08-13. Nate: "ooh let's throw in a meteor show though - 3%
     chance what do you say -- 1% northern lights?"

     Those are his numbers and they are used exactly as given. What they are a percentage
     OF is the one decision here, and it is not a free choice:

     ⭐ THE ROLL IS PER NIGHT, NOT PER PAGE LOAD, and that is a standing rule on this site —
     seed ambient chance off the town DATE. Per page load, 3% is a different thing entirely:
     a visitor who opens eight pages in a session has a 22% chance of hitting one, the sky
     would flicker the shower on and off as they moved between rooms, and two people looking
     at Checker Town on the same night would see different skies. This is ONE town on ONE
     day — the same principle as the weather and the moon. So 3% means three nights in a
     hundred, everywhere, for everyone, all night.

     ⚠ SALTED SEED, NOT A BIT-SHIFT OF THE SHARED ONE. The 32-bit day seed is already
     crowded — the forecast reads its low bits (`% 40`), cloud cover reads `>>> 11`, and the
     cloud SHAPES read `>>> 3`, `>>> 7` and `>>> 11` — and the existing comments say the
     ranges were "shifted well clear" of each other by hand. Two more tenants would mean
     picking through what is left and hoping. Hashing a salted date string is independent by
     construction and costs one more pass over eleven characters, once.

     ⚠ NO PHASE TEST IN HERE, DELIBERATELY. These read as "is tonight a shower night", not
     "is it night" — the CSS gates the visuals on `html.sky-night`. Putting `phase()` in the
     roll would make the FORECAST below flip at 8pm on a shower day, because weather() asks
     these questions: the town would have ordinary weather all afternoon and then abruptly
     clear at dusk. The day is the unit. */
  function showerDay(ds) { return daySeed((ds || parts().ds) + '#meteor') % 1000 < 30; }
  function auroraDay(ds) { return daySeed((ds || parts().ds) + '#aurora') % 1000 < 10; }
  /* Either one clears the sky, for the reason the eclipse already does (see weather()):
     these are rarer than the eclipse — 3% and 1% against its ~3.4% — and hiding the rarest
     thing the sky does behind the most ordinary is the one outcome worth spending a rain
     day on. Cost to the forecast, measured over 3,650 real dates: rain 21.9% → 21.0%. */
  /* ⚑⚑ THE PRODUCTION MILESTONES — 2026-08-24 ══════════════════════════════════════════
     Nate: *"Can we do something in the sky for every milestone reached, production-wise?
     6 months is coming up in like four days (today is day 176). And then for '1 Year',
     '2 Years', etc. … And that's an ultra-rare achievement, or whatever the highest tier
     is, same as on meteor shower or northern light days. Or eclipse periods."*

     ⚠⚠ DAY 1 IS DERIVED FROM HIS OWN COUNT, NOT INVENTED, AND IT IS THE ONE NUMBER HERE.
     Nothing in this repo recorded a production start — the earliest blog post is
     2026-03-14, which would make 2026-08-24 day 164, not 176. He said today IS day 176, so
     day 1 is 2026-03-02, and day 180 lands on 2026-08-28: exactly the "like four days" he
     expected. That arithmetic is the whole reason the epoch below reads what it reads.
     ⚠ Every milestone is computed off it, so if the epoch is wrong they ALL move together.

     ⭐ TWO RULES, AND THE SPLIT IS DELIBERATE. The half-year mark is a DAY COUNT (day 180),
     because that is the number he is counting toward and the day he will be watching for.
     Every mark after it is a CALENDAR ANNIVERSARY of the epoch, because 365-day arithmetic
     drifts off the birthday as leap years pile up: day 365 would land on 2027-03-01 and day
     730 on 2028-02-29, so "1 YEAR" would celebrate the day before the real one and
     "2 YEARS" would fall on a date that does not exist in three years out of four. An
     anniversary cannot drift. A day count can, and over a decade it would drift days.

     ⚠⚠ THE DATE STRING IS PADDED BEFORE IT IS COMPARED, AND THAT IS NOT TIDYING. parts()
     builds `ds` two different ways — the Intl path emits a 2-digit month and day
     ('2026-08-28'), and the catch-path fallback emits neither ('2026-8-28'). Every other
     reader in this file hands `ds` to daySeed(), where an unpadded string is merely a
     DIFFERENT seed and nothing ever looks broken. This is the first reader that COMPARES
     it, so on any browser that took the fallback the banner would simply never fly —
     silently, forever, on the one day of the year it was written for. */
  var EPOCH = '2026-03-02';                    // day 1 of production
  var HALF_YEAR = (function () {               // day 180, counting the epoch as day 1
    var d = new Date(EPOCH + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + 179);
    return d.toISOString().slice(0, 10);
  })();
  function padDs(ds) {
    var a = String(ds).split('-');
    return a.length === 3
      ? a[0] + '-' + ('0' + a[1]).slice(-2) + '-' + ('0' + a[2]).slice(-2)
      : String(ds);
  }
  /* The words on the banner, or null on an ordinary day. One function, one string: this is
     the whole feature's switch, and every consumer reads it rather than re-deriving a date. */
  function milestone(ds) {
    ds = padDs(ds || parts().ds);
    if (ds === HALF_YEAR) return '6 MONTHS';
    if (ds.slice(5) === EPOCH.slice(5)) {
      var y = parseInt(ds.slice(0, 4), 10) - parseInt(EPOCH.slice(0, 4), 10);
      if (y >= 1) return y + (y === 1 ? ' YEAR' : ' YEARS');
    }
    return null;
  }
  function milestoneDay(ds) { return milestone(ds) !== null; }

  function rareSky(ds) { return showerDay(ds) || auroraDay(ds) || milestoneDay(ds); }
  /* ⚠ THE MILESTONE JOINED rareSky() RATHER THAN GETTING ITS OWN GATE (2026-08-24).
     Everything that already asks "is tonight one of the special ones" — the forecast
     clearing the sky, clouds() returning 0, moonVeil() standing down — asks THIS. A
     separate test would have meant finding all three and keeping them in step forever,
     and the banner would have flown behind an overcast deck the first time one was missed. */

  /* ⚑⚑ WHAT THE SKY IS DOING TODAY, AS ONE NAME — 2026-08-20 ═══════════════════════════
     Nate picked all ten of the rare-sky event ideas at once ("I love all ten … can we do
     them all?"). Everything that reacts to a rare sky needs the same two answers, so they
     are answered HERE rather than in each feature: what kind of night is it, and does THIS
     beat fire tonight.

     ⚠⚠ THE SECOND QUESTION IS THE WHOLE POINT, AND IT IS NOT A COST QUESTION. The aurora is
     one night in a hundred. If all ten beats fire on every single one, the night stops being
     a surprise and becomes a checklist — and it is the SAME checklist every time, which is a
     worse outcome than having fewer ideas. So each beat gets its own salted roll and a given
     night lights some of them. Nothing may wire itself to "always fires on this kind"
     without earning it below.

     ⭐ WHICH BEATS ARE 100, AND WHY THAT IS NOT A CONTRADICTION: a beat that IS the event
     always fires; a beat that is a REACTION to it rolls. The town going dark under totality
     is the eclipse, not a comment on it — dropping it at random would just look broken. A
     regular being away because they went to watch the lights is a reaction, and reactions
     are exactly what should vary.
     ⚠ In Wave 1 every beat with a consumer is a 100 — the rolled ones are the character
     reactions in Wave 2, and they are defined and tested now so those drop straight in.

     ⚠ SALTED PER BEAT AND PER DAY, never a bit-shift of the shared seed. The 32-bit day seed
     is already carved up between the forecast (`% 80`), the intensity (`>>> 3`), the cloud
     cover (`>>> 11`) and three cloud shapes — see the note above showerDay(). Hashing a
     salted string is independent by construction and costs one pass over a short string. */
  var SKY_BEATS = {
    board:    100,   // the boards go dark under totality — this IS the eclipse
    puzzle:   100,   // the front door's puzzle wears the night; once a day, on a rare day
    record:   100,   // you were either here for it or you were not
    overlay:  100,   // a readout is a readout
    desk:     100,   // a news desk always reports an eclipse. It would be odd if it did not
    auston:    60,   // \
    regulars:  35,   //  } the REACTIONS — Wave 2, and the reason this table exists
    badge:     45,   // /
    banner:   100    // the plane IS the milestone, the same way the dark board IS the eclipse
  };
  /* ⚠⚠ THE PREVIEW FLAGS HAVE TO REACH THIS, OR EVERY RARE-SKY FEATURE IS UNREVIEWABLE
     UNTIL THE NEXT REAL ONE. `?eclipse=1` forces the eclipse to be DRAWN, and the drawing is
     all it used to force — so a preview showed the corona while skyKind() still answered
     "ordinary Tuesday", and the themed puzzle, the ledger and the overlay all sat out the
     very thing he opened the link to look at. That is the `?wx=` bug of 2026-08-20 exactly,
     one week and one feature later: **the flag moved the pixels and nothing else asked.**

     ⭐ THE URL IS PARSED IN ONE PLACE, AND IT IS NOT HERE. The head include already reads
     these params before first paint; it sets `window.PJCC_SKY_FORCE` and this reads that.
     A second URL parser in the clock would be a second thing to keep in step, and the clock
     would stop being a pure function of the date.
     ⚠ AN EXPLICIT `ds` ALWAYS WINS. Walking a calendar (the gates do, over 365 days) must
     never pick up a preview override, or the test is measuring the query string. */
  function skyKind(ds) {
    if (ds === undefined) {
      try { if (window.PJCC_SKY_FORCE) return window.PJCC_SKY_FORCE; } catch (e) {}
    }
    /* ⚠ THE MILESTONE OUTRANKS ALL THREE, and that is the only ordering choice here. The
       other skies are ROLLS — a 3% night comes round again in a month. A milestone is a
       fixed date that happens once and never returns, so on the rare day both land it is
       the shower that can afford to wait. */
    if (milestoneDay(ds)) return 'milestone';
    if (eclipseDay(ds)) return 'eclipse';
    if (showerDay(ds)) return 'meteor';
    if (auroraDay(ds)) return 'aurora';
    return null;
  }
  function skyBeat(name, ds) {
    if (!skyKind(ds)) return false;
    var odds = SKY_BEATS[name];
    if (odds == null) return false;              // an unknown beat is OFF, never on
    if (odds >= 100) return true;
    return daySeed((ds || parts().ds) + '#beat#' + name) % 100 < odds;
  }

  /* ⚑ A THIN VEIL ACROSS THE MOON — 2026-08-19. Nate: *"if it's cloudy that day, some faint
     clouds around the moon, and faintly covering it, to give it a more real effect? But only
     if it adds MINIMAL performance hit … some days, at a low probability, and NEVER on
     meteor shower or northern lights days or eclipse days."*

     ⚠⚠ THE THREE EXCLUSIONS ARE HIS AND THEY ARE THE WHOLE POINT OF PUTTING THIS HERE rather
     than in the CSS. The eclipse, the shower and the aurora each already CLEAR the sky — they
     are the rarest things this town does, and hiding one of them behind a haze would spend a
     1-in-100 night on an effect that happens every week or two. `rareSky()` covers the two
     rare nights and `eclipseDay()` the third; all three are the same functions the forecast
     already asks, so there is no second definition of "is tonight special" to drift.

     ⚠ 120/1000, AND THE NUMBER IS MINE, NOT HIS — flagged. He said "a low probability" and
     gave no figure, so: roughly one night in eight. It sits deliberately ABOVE the shower
     (3%) and the aurora (1%), because thin cloud over a moon is the most ordinary thing in
     this list and should not feel rarer than a meteor storm; and deliberately well below a
     half, because an effect you meet most nights stops being a night with weather in it and
     becomes the moon's normal appearance.

     ⚠ SALTED SEED, like the two rare nights and for the same reason: the 32-bit day seed is
     already carved up between the forecast (`% 40`), the cover (`>>> 11`) and three cloud
     shapes (`>>> 3`, `>>> 7`, `>>> 11`). Hashing a salted date string is independent by
     construction rather than by hoping the leftover bits are free.

     ⚠ NO CLOUD-COVER TEST IN HERE, DELIBERATELY — same rule as the phase test above. This
     answers "is tonight a veiled night", not "is the sky otherwise clear". The head script in
     town-weather.html is what declines to stamp the class when `clouds()` already returned an
     overcast deck, because that is where cover is known. */
  function moonVeil(ds) {
    ds = ds || parts().ds;
    if (eclipseDay(ds) || rareSky(ds)) return false;
    return daySeed(ds + '#moonveil') % 1000 < 120;
  }


  window.PJCC_TIME = { parts: parts, hour: hour, dateStr: dateStr, phase: phase,
                       daySeed: daySeed, weather: weather, clouds: clouds, level: level, orb: orb, season: season,
                       moon: moon, moonPath: moonPath, eclipse: eclipse, eclipseDay: eclipseDay,
                       showerDay: showerDay, auroraDay: auroraDay, moonVeil: moonVeil,
                       milestone: milestone, milestoneDay: milestoneDay,
                       skyKind: skyKind, skyBeat: skyBeat };
})();
