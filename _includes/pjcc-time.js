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
 * ========================================================================== */
(function () {
  'use strict';
  function parts() {
    try {
      var f = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour12: false,
        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit' });
      var p = {}; f.formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
      return { h: parseInt(p.hour, 10) % 24, ds: p.year + '-' + p.month + '-' + p.day };
    } catch (e) {
      var d = new Date();
      return { h: d.getHours(), ds: d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() };
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
  function weather() {
    var roll = daySeed() % 10;
    return { kind: roll <= 2 ? 'rain' : (roll === 3 ? 'mist' : 'clear'), roll: roll, phase: phase() };
  }
  // Cloud cover — its own roll, so "clear" days still get weather in the sky and a
  // starry night isn't always a bare one (Nate: "sometimes it's cloudy, sometimes
  // it's both"). Shifted well clear of the rain roll's low bits so the two don't
  // move together. Rain and mist force real cover — it can't pour out of a bare sky.
  function clouds() {
    var w = weather().kind;
    if (w === 'rain') return 3;
    if (w === 'mist') return 2;
    return [0, 0, 1, 1, 1, 2, 2, 0, 1, 3][(daySeed() >>> 11) % 10];
  }
  window.PJCC_TIME = { parts: parts, hour: hour, dateStr: dateStr, phase: phase,
                       daySeed: daySeed, weather: weather, clouds: clouds };
})();
