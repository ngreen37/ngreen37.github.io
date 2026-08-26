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
  /* ⛑ `how` IS THE DEED, ADDED 2026-08-26 (Nate: "Make sure the fragments display what they
     did to unlock them on the ledger"). A shelf of six names is a trophy case; a shelf that
     says what you DID is a record of a journey, and it is the only place the site ever
     explains an egg.
     ⚠⚠ IT IS ONLY EVER READ FOR A HELD SLOT — same rule as `nm`, and for the same reason. An
     unfound fragment's deed is a walkthrough: printing it would turn the ledger into the
     checklist the whole slow-reveal is built to avoid. Both fields stay out of the DOM until
     the flag is set. [[fragment-ledger]]
     ⚠ PAST TENSE, AND NO SECOND-PERSON INSTRUCTION. "Walked through a hidden door" reads as
     something you did; "Walk through the hidden door" reads as a task list. */
  var SLOTS = [
    { id: 'alpine', flag: 'frag_classified',
      nm: 'The Alpine File',
      how: 'Walked through a door that was never advertised.' },
    { id: 'sky',    flag: 'frag_sky',
      nm: 'A Rare Sky',
      how: 'Looked up on a night the sky was doing something rare.' },
    { id: 'road',   flag: 'frag_road',
      nm: 'Halfway to Chess City',
      how: 'Solved five hundred puzzles on the road. No hints.' }
    /* ⛑⛑ `road` IS THE ONLY ONE OF THE THREE YOU CAN EARN BY PLAYING WELL — 2026-08-25.
       Nate: *"Let's make another egg be successfully completing half of the puzzles on Fork
       in the Road."* Five hundred CLEAN solves on the journey; the room's own `earned` rule
       already says a hinted solve does not advance the road, so the fragment inherits that
       standard for free rather than restating it.
       ⭐ THE OTHER TWO ARE FOUND, THIS ONE IS BUILT. Alpine is a hidden link and Sky is a rare
       night — both are luck or curiosity. This one takes months. That is the point: a set that
       is entirely secrets rewards only the people who go poking, and a set that is entirely
       grind rewards only the people who stay. Six fragments should need both kinds of person.
       ⚠ IT IS MINTED FROM INSIDE THE GAME'S IFRAME, which shares this origin and therefore
       this localStorage — but NOT this document. `check()` adding `world-open` in there styles
       a frame nobody looks at; the doors come back on the parent's next navigation, which is
       correct and is why nothing tries to reach across the frame boundary. */

    /* ⚑ THREE SLOTS ARE STILL EMPTY, ON PURPOSE (his: "We don't need to deploy them right
       away"). TARGET stays 6 so the counter tells the truth about the journey — a visitor
       holding every fragment that currently EXISTS sees 3 of 6 and knows there is more,
       which is the correct thing to tell them. It also means adding an egg is one entry here and no
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
    },

    /* ══ THE FIND IS AN EVENT NOW — 2026-08-26 ═══════════════════════════════════════
       Nate: *"There should be a pop-up (like the sacrificial altar result) that excitedly
       shows that the user found a fragment. This should occur only the first time they find
       it."*

       Before this, finding a fragment felt like nothing. `alpine` minted from the
       easter-eggs layout in COMPLETE SILENCE — you walked into the Alpine File and the page
       just sat there. `sky` got a 4.5-second toast in the corner. `road` got a sentence in a
       summary. Three discoveries, three different amounts of nothing much, for the thing the
       whole slow-reveal is built on.

       ⭐ CALLING IT IS ONE LINE AND IT CANNOT DOUBLE-FIRE: `mint()` already returns true only
       on the transition, so `if (PJCCFrag.mint(id)) PJCCFrag.celebrate(id, line)` is the
       whole contract and "only the first time" is inherited rather than re-implemented at
       three call sites. Calling `celebrate` on its own is allowed (the road summary does it,
       one leg after the mint) — it never writes, so it cannot manufacture a fragment.

       ⚠⚠ THE STYLES ARE INJECTED ON FIRST USE, NOT AT LOAD. THIS FILE IS ON EVERY PAGE OF THE
       SITE and virtually every page view never finds a fragment. A stylesheet shipped to
       everyone for a moment almost nobody reaches is the wrong trade — so nothing is added to
       the document until the first celebration actually happens.
       ⚠ NO PAGE CSS IS ASSUMED. This has to look right inside the Fork game's IFRAME, on the
       classified page's black sheet and on the town sky, so every value it needs is its own.
       ⚠ REDUCED MOTION IS HONORED and the dialog still appears — it just arrives without the
       rise and without the shimmer. A celebration nobody asked to be still for is fine; one
       that moves when they asked it not to is not.
       ⚠ IT NEVER THROWS. Same rule as every read and write above: a fragment that breaks the
       page it was found on is worse than one that stays quiet. */
    celebrate: function (id, line) {
      try { return showFound(id, line); } catch (e) { return false; }
    }
  };

  var styled = false;
  function injectCSS() {
    if (styled) return;
    styled = true;
    var css =
      '.pjfx{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;' +
        'justify-content:center;padding:20px;background:rgba(6,6,10,.78);' +
        '-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);}' +
      '.pjfx-card{position:relative;max-width:392px;width:100%;box-sizing:border-box;' +
        'background:#12111a;border:1px solid #3a3550;border-radius:14px;padding:26px 24px 20px;' +
        'text-align:center;color:#e8e4f2;font-family:Poppins,system-ui,sans-serif;' +
        'box-shadow:0 24px 70px rgba(0,0,0,.6);}' +
      '.pjfx-glyph{font-size:38px;line-height:1;color:#F5C518;' +
        'text-shadow:0 0 22px rgba(245,197,24,.55);}' +
      '.pjfx-kicker{margin:12px 0 0;font-family:"Share Tech Mono",ui-monospace,monospace;' +
        'font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:#F5C518;}' +
      /* ⛑ THE HEADING HAD TO BE DISARMED — 2026-08-26, caught on the live Alpine File.
         `_pjcc-01-core.scss` gives every `h2` on the site `border-bottom: 2px solid #3d2b8a`
         plus its own margins and gold color. This card is an `h2`, so it wore a purple rule
         across it — on the one page that is meant to look like nothing else on the site.
         ⭐ THE COMMENT ABOVE CLAIMS THIS CARD "ASSUMES NO PAGE CSS", AND THAT WAS ONLY TRUE OF
         THE PROPERTIES I REMEMBERED TO SET. Self-contained means overriding what the page
         gives you for free, not just declining to ask for anything. */
      '.pjfx-name{margin:6px 0 0;font-size:1.32rem;font-weight:800;line-height:1.2;color:#fff;' +
        'border:0;padding:0;text-align:center;font-family:inherit;letter-spacing:normal;}' +
      '.pjfx-line{margin:10px 0 0;font-size:.92rem;line-height:1.55;color:#b8b2cc;}' +
      '.pjfx-count{margin:16px 0 0;font-family:"Share Tech Mono",ui-monospace,monospace;' +
        'font-size:11px;letter-spacing:.14em;color:#8a8598;}' +
      '.pjfx-pips{margin:8px 0 0;display:flex;gap:6px;justify-content:center;}' +
      '.pjfx-pip{width:9px;height:9px;border-radius:50%;background:#2c2840;}' +
      '.pjfx-pip.on{background:#F5C518;box-shadow:0 0 10px rgba(245,197,24,.6);}' +
      '.pjfx-btn{margin:18px 0 0;background:#F5C518;color:#1a1608;border:0;border-radius:8px;' +
        'padding:11px 26px;min-height:44px;font-family:inherit;font-size:.9rem;font-weight:800;' +
        'cursor:pointer;}' +
      '.pjfx-btn:hover{background:#ffd63a;}' +
      '.pjfx-btn:focus-visible{outline:2px solid #fff;outline-offset:2px;}' +
      '@media (prefers-reduced-motion:no-preference){' +
        '.pjfx{animation:pjfx-in .22s ease-out both;}' +
        '.pjfx-card{animation:pjfx-rise .34s cubic-bezier(.2,1,.3,1) both;}' +
        '.pjfx-glyph{animation:pjfx-pulse 2.6s ease-in-out infinite;}}' +
      '@keyframes pjfx-in{from{opacity:0}to{opacity:1}}' +
      '@keyframes pjfx-rise{from{opacity:0;transform:translateY(14px) scale(.97)}' +
        'to{opacity:1;transform:none}}' +
      '@keyframes pjfx-pulse{0%,100%{text-shadow:0 0 22px rgba(245,197,24,.55)}' +
        '50%{text-shadow:0 0 34px rgba(245,197,24,.95)}}';
    var el = document.createElement('style');
    el.setAttribute('data-pjfx', '1');
    el.appendChild(document.createTextNode(css));
    (document.head || document.documentElement).appendChild(el);
  }

  /* ⚠ EVERY STRING THAT REACHES THE DOM GOES IN AS textContent, NEVER innerHTML. `line` is
     passed in by a caller and the slot names are literals in this file, but the rule is the
     rule — a celebration is not a place to start trusting input. */
  function showFound(id, line) {
    if (typeof document === 'undefined' || !document.body) return false;
    if (document.querySelector('.pjfx')) return false;      // one at a time
    var s = null, i;
    for (i = 0; i < SLOTS.length; i++) if (SLOTS[i].id === id) s = SLOTS[i];
    if (!s) return false;

    injectCSS();
    var held = API.count(), all = held >= TARGET;
    var wrap = document.createElement('div');
    wrap.className = 'pjfx';

    var card = document.createElement('div');
    card.className = 'pjfx-card';
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-modal', 'true');
    card.setAttribute('aria-labelledby', 'pjfx-name');

    function add(tag, cls, txt, id2) {
      var e = document.createElement(tag);
      e.className = cls;
      if (txt != null) e.textContent = txt;
      if (id2) e.id = id2;
      card.appendChild(e);
      return e;
    }
    add('div', 'pjfx-glyph', '✦').setAttribute('aria-hidden', 'true');
    add('p', 'pjfx-kicker', 'A fragment is yours');
    add('h2', 'pjfx-name', s.nm, 'pjfx-name');
    if (line) add('p', 'pjfx-line', line);

    /* ⚠ THE COUNT NAMES THE JOURNEY, NOT THE SHORTFALL. "3 of 6" is a true, quiet fact;
       "3 more to go" would be a to-do list, and the ledger deliberately never names a
       fragment nobody has found yet. Same reason `nm` is only read for HELD slots. */
    add('p', 'pjfx-count', all
      ? 'Six of six — the world is open.'
      : held + ' of ' + TARGET + ' found');

    var pips = add('div', 'pjfx-pips');
    pips.setAttribute('aria-hidden', 'true');
    for (i = 0; i < TARGET; i++) {
      var pip = document.createElement('span');
      pip.className = 'pjfx-pip' + (i < held ? ' on' : '');
      pips.appendChild(pip);
    }

    var btn = add('button', 'pjfx-btn', all ? 'See what opened' : 'Keep looking');
    btn.type = 'button';

    wrap.appendChild(card);
    document.body.appendChild(wrap);

    /* ⚠ FOCUS IS TAKEN AND GIVEN BACK. A modal that does not move focus is invisible to a
       screen reader and untabbable; one that does not restore it drops a keyboard user at
       the top of the document. */
    var prev = null;
    try { prev = document.activeElement; } catch (e) {}
    try { btn.focus(); } catch (e) {}

    function close() {
      try { wrap.parentNode && wrap.parentNode.removeChild(wrap); } catch (e) {}
      try { document.removeEventListener('keydown', onKey, true); } catch (e) {}
      try { prev && prev.focus && prev.focus(); } catch (e) {}
    }
    function onKey(e) {
      if (e.key === 'Escape' || e.keyCode === 27) { e.preventDefault(); close(); }
    }
    btn.addEventListener('click', close);
    wrap.addEventListener('click', function (e) { if (e.target === wrap) close(); });
    document.addEventListener('keydown', onKey, true);
    return true;
  }

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
