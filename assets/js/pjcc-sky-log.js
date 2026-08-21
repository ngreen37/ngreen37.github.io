/* =============================================================================
 * YOU WERE THERE — the rare-sky ledger  (2026-08-20)
 * -----------------------------------------------------------------------------
 * Nate's idea #8, Wave 1: *"the night mints a dated line in the dossier — 'You were
 * in Checker Town for the eclipse of [date].'"* A record, not a reward. It is the
 * thing you can show later, in the same spirit as the first 1,000.
 *
 * ── WHY IT IS ITS OWN FILE, AND WHY IT IS LOCAL ─────────────────────────────
 *
 * ⚠ LOCAL ON PURPOSE, NOT AS A COMPROMISE. Writing this account-side would need a
 * new table and therefore a MIGRATION, and there is already one sitting unrun (the
 * credit gift). A feature whose whole job is "you were here that night" cannot ship
 * behind a migration that might land next month — the nights it would have recorded
 * are gone by then. localStorage records them from the first load. If it ever moves
 * to the account, this ledger is what gets uploaded.
 *
 * ⚠ IT MUST RUN ON EVERY PAGE, because you might only open /games/ that night. That
 * is why it rides town-weather.html next to the weather scripts rather than living
 * on the dossier — a ledger that only writes when you happen to visit the page that
 * READS it would miss almost every night it exists for.
 *
 * ⭐ IT WRITES ONCE PER DAY AND NEVER GROWS UNBOUNDED. One entry per town day, capped
 * at CAP; the oldest fall off. A localStorage key that only ever appends is a slow
 * leak that nobody notices until it is megabytes.
 *
 * ⚠ EVERY PATH IS WRAPPED. localStorage throws outright in a locked-down browser or
 * a private window — and this is ambient, so a visitor who cannot store it should
 * simply not have it, never see an error, and never lose the page they came for.
 * ========================================================================== */
(function () {
  'use strict';

  var KEY = 'pjcc.sky.seen';
  var CAP = 60;                      // five years of eclipses, and it is ~1.5 KB full

  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      var v = raw ? JSON.parse(raw) : [];
      return Object.prototype.toString.call(v) === '[object Array]' ? v : [];
    } catch (e) { return []; }
  }

  function write(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {}
  }

  /* THE ONE THING THIS DOES. Called on load; returns the ledger either way so the
     dossier can render it without caring whether today added anything. */
  function log() {
    var T = window.PJCC_TIME;
    if (!T || !T.skyKind || !T.skyBeat) return read();
    var list = read();
    var kind, ds;
    try {
      ds = T.dateStr();
      /* ⚠⚠ THE REAL NIGHT, NOT THE PREVIEW. `skyKind()` with no argument honors
         `?eclipse=1` and friends so the rest of the rare-sky features can be LOOKED at on
         an ordinary Tuesday. This one must not: writing "you were in Checker Town for the
         eclipse" because somebody opened a preview link is a false entry in a ledger whose
         entire value is that it is true. Passing the date explicitly is what skips the
         override — see skyKind() in _includes/pjcc-time.js.
         ⭐ So `?eclipse=1` lights the board, the puzzle and the overlay, and deliberately
         adds no row here. That asymmetry is the feature, not an oversight. */
      kind = T.skyKind(ds);
    } catch (e) { return list; }
    /* ⚠ THROUGH THE TABLE, NOT AROUND IT. `record` is a 100 today, but every rare-sky
       feature asks the same table so that a night can light some beats and not others
       — see SKY_BEATS in _includes/pjcc-time.js. Reading skyKind() directly here is
       exactly how the Wave 2 features would end up all firing on the same night. */
    if (!kind || !T.skyBeat('record')) return list;
    for (var i = 0; i < list.length; i++) if (list[i] && list[i].d === ds) return list;
    list.push({ d: ds, k: kind });
    /* sorted, so the dossier never has to and a clock that jumped backwards cannot
       leave the list out of order for good */
    list.sort(function (a, b) { return a.d < b.d ? -1 : a.d > b.d ? 1 : 0; });
    if (list.length > CAP) list = list.slice(list.length - CAP);
    write(list);
    return list;
  }

  window.PJCCSkyLog = {
    entries: read,
    log: log,
    /* what the dossier prints. Kept HERE rather than in the dossier so the wording
       lives with the data — and so a second reader (the profile, a share card) cannot
       invent a different name for the same night. */
    label: function (k) {
      return k === 'eclipse' ? 'the eclipse'
           : k === 'meteor' ? 'the meteor shower'
           : k === 'aurora' ? 'the northern lights'
           : 'a rare sky';
    }
  };

  log();
})();
