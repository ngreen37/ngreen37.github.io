/* ⚠ GENERATED FILE — DO NOT EDIT. Run `npm run gen:clock` after editing the source.
 * Source of truth: _includes/pjcc-time.js (which site pages inline before first paint).
 * This copy exists so the standalone game shells in /assets/games/ can <script src> the
 * same clock instead of carrying a second one. tests/townsky.check.js fails if the two
 * ever differ. Everything below this banner is a byte-for-byte copy. */
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
 *   PJCC_TIME.clouds()  -> 0 (clear) | 1 (a few) | 2 (broken) | 3 (overcast)
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

       ⚠ `roll` is still reported 0-9 — it is in this module's documented return shape at the
       top of the file, and a finer die is an implementation detail, not a new contract. */
    var r40 = daySeed() % 40;
    var kind = r40 <= 8 ? 'rain' : (r40 <= 12 ? 'mist' : 'clear');
    if (kind === 'rain' && season() === 'winter') kind = 'snow';
    return { kind: kind, roll: (r40 / 4) | 0, phase: phase() };
  }
  // Cloud cover — its own roll, so "clear" days still get weather in the sky and a
  // starry night isn't always a bare one (Nate: "sometimes it's cloudy, sometimes
  // it's both"). Shifted well clear of the rain roll's low bits so the two don't
  // move together. Rain and mist force real cover — it can't pour out of a bare sky.
  function clouds() {
    if (eclipseDay()) return 0;                   // see weather() — the eclipse gets a clear sky
    var w = weather().kind;
    if (w === 'rain' || w === 'snow') return 3;   // snow needs a full deck too
    if (w === 'mist') return 2;
    return [0, 0, 1, 1, 1, 2, 2, 0, 1, 3][(daySeed() >>> 11) % 10];
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
    var u = name === 'new' ? 0 : floorLune(lunePos(lit));
    return { age: age, frac: frac, lit: lit, waxing: frac < 0.5, name: name,
             shift: (frac < 0.5 ? -1 : 1) * u };
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
  window.PJCC_TIME = { parts: parts, hour: hour, dateStr: dateStr, phase: phase,
                       daySeed: daySeed, weather: weather, clouds: clouds, orb: orb, season: season,
                       moon: moon, eclipse: eclipse, eclipseDay: eclipseDay };
})();
