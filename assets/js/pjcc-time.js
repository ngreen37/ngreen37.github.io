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
 *   PJCC_TIME.moon()    -> { frac, lit, waxing, name } — the REAL phase tonight
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
    var roll = daySeed() % 10;
    var kind = roll <= 2 ? 'rain' : (roll === 3 ? 'mist' : 'clear');
    if (kind === 'rain' && season() === 'winter') kind = 'snow';
    return { kind: kind, roll: roll, phase: phase() };
  }
  // Cloud cover — its own roll, so "clear" days still get weather in the sky and a
  // starry night isn't always a bare one (Nate: "sometimes it's cloudy, sometimes
  // it's both"). Shifted well clear of the rain roll's low bits so the two don't
  // move together. Rain and mist force real cover — it can't pour out of a bare sky.
  function clouds() {
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
    return { age: age, frac: frac, lit: lit, waxing: frac < 0.5, name: name };
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
                       moon: moon };
})();
