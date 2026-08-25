/*! pjcc-fragments.js — SIX FRAGMENTS OPEN THE WORLD                 (2026-08-25)
 * =============================================================================
 * Nate, 2026-08-25: *"We're going to hide it — slow reveal it with easter eggs… Let's say 6
 * fragments unlock the website, so we'll need five more."*
 *
 * ══ WHAT THIS ACTUALLY UNLOCKS, SAID PLAINLY ════════════════════════════════
 * THE SIGNPOSTS, NOT THE ROOM. `/pjcc/` has never stopped answering by direct URL — the
 * hiding on 2026-08-25 removed four DOORS (the rail row, the front door's world card, the
 * header's center mark, the ⌘K entry) and left the page itself alone, because `sw.js`
 * precaches it and the PWA `id` IS `/pjcc/`. So collecting six fragments puts those doors
 * back for that visitor. It is a reveal, and it must never be described as access control:
 * anyone who types the URL is already inside. Same honesty the prototype gate is written
 * with ([[prototype-gate]]) — a soft gate that admits what it is.
 *
 * ══ WHY A LEDGER FILE AT ALL ════════════════════════════════════════════════
 * The eggs already wrote `frag_*` flags to localStorage, and nothing has read them since the
 * footer tally was retired on 2026-07-15 — thirteen flags being written into a void. The
 * eggs stay dumb: each one writes its own flag and knows nothing about this file. ONE place
 * decides what counts, what the total is, and what happens at six. Adding a seventh egg is
 * one line in SLOTS; changing the target is one number.
 *
 * ⚠⚠ THE OLD FLAGS ARE DELIBERATELY NOT COUNTED. Konami, Qd5 and the two hidden chessboards
 * were deleted on 2026-08-25 ("we are completely overhauling the easter egg process to only
 * PJCC eggs"), and the remaining pre-overhaul flags — frag_404, frag_archive, frag_promotion,
 * frag_murphys_law, frag_subjectzero, frag_companion, frag_portal — are NOT in SLOTS. A
 * browser that collected them in July must not wake up two-thirds of the way to an unlock it
 * never hunted for. If any of them is promoted into the new set later, it gets a slot here
 * and its own line; nothing is counted by accident.
 *
 * ⚠ LOCAL, AND THAT IS THE POINT. A signed-out stranger who finds a fragment keeps it. Gating
 * a discovery behind an account means the person most likely to be delighted gets nothing —
 * the same call the hidden boards were built under, and the one part of them worth keeping.
 * ⚠ EVERY READ AND WRITE IS WRAPPED. localStorage throws outright in some privacy modes, and
 * an egg that can throw on a page it merely SHARES is worse than an egg that never fires.
 * ========================================================================== */
(function () {
  'use strict';

  /* ── THE SIX ───────────────────────────────────────────────────────────────────
     Order is display order and nothing depends on it. `nm` is what a found fragment is
     called; an unfound one is never named anywhere in the DOM, so the ledger cannot be
     read as a checklist of things to go looking for. */
  var SLOTS = [
    { id: 'alpine', flag: 'frag_classified',
      nm: 'The Alpine File' },
    { id: 'sky',    flag: 'frag_sky',
      nm: 'A Rare Sky' }
    /* ⚑ FOUR SLOTS ARE STILL EMPTY, ON PURPOSE (his: "We don't need to deploy them right
       away"). TARGET stays 6 so the counter tells the truth about the journey — a visitor
       who finds both live fragments sees 2 of 6 and knows there is more, which is the
       correct thing to tell them. It also means adding an egg is one entry here and no
       other edit anywhere. */
  ];
  var TARGET = 6;
  var UNLOCK = 'pjcc.world.unlocked';

  function get(k) {
    try { var v = localStorage.getItem(k); return !!v && v !== '0'; } catch (e) { return false; }
  }
  function set(k) { try { localStorage.setItem(k, '1'); } catch (e) {} }

  /* ── THE PUBLIC SHAPE ──────────────────────────────────────────────────────────
     `PJCCFrag.mint(id)` is what an egg calls; everything else is for the reveal. Kept tiny
     and boring: this file is loaded on every page of the site. */
  var API = {
    slots: function () { return SLOTS.slice(); },
    target: function () { return TARGET; },
    found: function () {
      var out = [];
      for (var i = 0; i < SLOTS.length; i++) if (get(SLOTS[i].flag)) out.push(SLOTS[i]);
      return out;
    },
    count: function () { return API.found().length; },
    unlocked: function () { return get(UNLOCK) || API.count() >= TARGET; },

    /* Mint by SLOT ID rather than by raw flag name, so an egg cannot invent a fragment that
       the ledger does not know about — a typo would silently create a flag nobody counts.
       Returns true only on the transition, so a caller can celebrate once. */
    mint: function (id) {
      var s = null, i;
      for (i = 0; i < SLOTS.length; i++) if (SLOTS[i].id === id) s = SLOTS[i];
      if (!s) { try { console.warn('PJCCFrag: no slot "' + id + '"'); } catch (e) {} return false; }
      if (get(s.flag)) return false;
      set(s.flag);
      check();
      return true;
    }
  };

  /* ⚠ THE UNLOCK IS STICKY. Once six have been held at the same time the flag is written and
     never re-derived from the count — otherwise clearing one egg's flag would silently take
     the world away again from somebody who had already earned it. Finding is permanent. */
  function check() {
    if (get(UNLOCK)) return true;
    if (API.count() < TARGET) return false;
    set(UNLOCK);
    document.documentElement.classList.add('world-open');
    return true;
  }

  /* The class is what the four doors hang off, and it is applied AT PARSE TIME on every page
     — this file is loaded in <head> order with the rest, so a visitor who has unlocked the
     world does not watch the doors pop in after first paint. [[between-pages-flicker]] */
  if (API.unlocked()) {
    try { document.documentElement.classList.add('world-open'); } catch (e) {}
  }

  window.PJCCFrag = API;
})();
