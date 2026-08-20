/* =============================================================================
 * PJCC · THE GAUNTLET DOOR, HYDRATED — one file, every copy of the door
 * -----------------------------------------------------------------------------
 * The door's LOOK has been a single source since 2026-07-27 (_sass/_pjcc-21-gauntlet-
 * door.scss, [[gauntlet-door-one-file]]). Its STATE was not: the front door and the games
 * hall each carried their own copy of the ladder names, the ten accent colors, the ten
 * glyphs and the hydration logic, both marked "keep in sync". This is that half, once.
 *
 * It paints ONE door — `#gauntlet-door` — and it works on both shapes it has:
 *   /            <a id="gauntlet-door" class="mc-door mc-door--gauntlet gdoor-host">
 *                  <span class="gdoor">…</span>   ← the painted door is a CHILD
 *   /games/      <a id="gauntlet-door" class="gdoor">…</a>
 *                                                 ← the anchor IS the painted door
 * so it finds the `.gdoor` rather than assuming which one it is. Optional bits (the
 * hall's "Floor N of 10" whisper) are painted only where they exist.
 *
 * ⚠ NOTHING HERE IS REQUIRED FOR THE CARD TO WORK OR THE LINK TO OPEN. If this file
 * never loads, a first-time visitor's door is what everyone sees — which is exactly what
 * the pages shipped before it existed. [[down-never-stuck]]
 *
 * ⚠ THE THREE TABLES BELOW ARE STILL A COPY OF ONE THING — the LADDER in
 * assets/games/pjcc_gauntlet.html. That game is a standalone HTML file that shares no
 * module with the site, so there is no way to import it. But it is now ONE copy instead
 * of three, and it is here, next to the code that uses it.
 * ========================================================================== */
(function () {
  'use strict';

  var NAMES = ['The Checker Town Open Champion', 'The Sand-Mine Foreman', 'The Tidecaller',
               'The Shogi Sentinel', 'The City Gatekeeper', 'The Auditor', 'The Enforcer',
               'The Vice President', 'The Heir Apparent', 'The Executive Assistant'];
  var ACCENTS = ['#8fe3ff', '#fcbc3c', '#56d0ff', '#fcbcb0', '#ffb066',
                 '#3fae7a', '#ff6b6b', '#c79bff', '#ff9ec9', '#f5c518'];   // [5] Auditor: ledger-green, was mint (2026-07-22)
  var GLYPHS  = ['♟', '♟', '♝', '♞', '♜', '♝', '♜', '♝', '♛', '♛'];
  var PKEY = 'pjcc.gauntlet.v2';

  function localCleared() {
    var prog = {};
    try { prog = JSON.parse(localStorage.getItem(PKEY)) || {}; } catch (e) {}
    var beaten = prog.beaten || {}, n = 0;
    for (var i = 0; i < NAMES.length; i++) { if (beaten[i]) n++; }
    return n;
  }

  /* ⚠⚠ `window.__gauntletProg` IS PUBLISHED BEFORE ANYTHING ELSE, AND ON EVERY PAGE —
     including the ones with no door on them. /pjcc/ is exactly that page: its Gauntlet door
     was demoted to a text link on 2026-07-24, but its world ticker still reads this object
     for the "PLAYER CLEARS FLOOR N" breaking line and for the desk's local facts. That is
     why the door guard below is not the first line of this file, and it is why the <script>
     tag is NOT deferred: the ticker reads this synchronously, further down the same layout.
     Move the tag or add `defer` and the ticker silently loses a line. [[feature-shipped-but-never-loaded]] */
  function publish(cleared) {
    window.__gauntletProg = { cleared: cleared, cur: Math.min(cleared, NAMES.length), names: NAMES };
  }
  publish(localCleared());

  var door = document.getElementById('gauntlet-door');
  if (!door) return;
  var gd = door.classList.contains('gdoor') ? door : door.querySelector('.gdoor');
  if (!gd) return;

  /* ⚠⚠ EVERY PAINT STARTS FROM THE MARKUP, NEVER FROM THE LAST PAINT. This runs TWICE now
     (local, then the account) and the old inline copies only ever ran once, so anything
     read back off the element becomes a bug the day the second paint lands: appending
     `#climb` to a href that already ends in `#climb`, an aria-label that says the floor
     twice, floor seven's red left behind on a door that turned out to be crowned. So the
     three things the markup owns are captured here, once, and paint() writes the FULL value
     each time instead of adding to what it finds. */
  var baseHref = door.getAttribute('href') || '';
  var baseLabel = door.getAttribute('aria-label') || '';
  var baseGlyph = (document.getElementById('gdoor-glyph') || {}).textContent || '♟';

  /* ⭐ ONE NUMBER DRIVES THE WHOLE DOOR, and it is "how many floors are behind you".
     The floor you are standing at is that count: clear three and you are at floor four.
     That is only true because the tower is LINEAR — the game will not open floor i until
     i <= unlocked, and unlocked only ever advances by winning floor i — which is also
     what makes the account's bare count enough to place the door on a device that has
     never seen this climb. See paintFrom()'s caller. */
  function paint(cleared) {
    var cur = Math.min(cleared, NAMES.length);

    // the arch grows richer with the climb; the leaf hanging in it belongs to the NEXT floor
    gd.setAttribute('data-grand', cleared === 0 ? 0 : cleared <= 2 ? 1 : cleared <= 4 ? 2 : cleared <= 6 ? 3 : cleared <= 9 ? 4 : 5);
    if (cur < NAMES.length) gd.setAttribute('data-floor', cur + 1);
    else gd.removeAttribute('data-floor');

    var pipHost = document.getElementById('gdoor-pips');
    if (pipHost) {
      var h = '';
      for (var k = 0; k < NAMES.length; k++) h += '<i class="' + (k < cleared ? 'done' : (k === cur ? 'cur' : '')) + '"></i>';
      pipHost.innerHTML = h;
    }

    var floorLine = cur >= NAMES.length ? 'Crowned — 10 of 10' : 'Floor ' + (cur + 1) + ' of 10';

    /* ⚠ THE WHISPER IS THE HALL'S ONLY. On the front door the same words would land on top
       of the card's own caption, so there the fact goes to the aria-label alone — a screen
       reader still hears which floor is next. */
    var wh = document.getElementById('gdoor-whisper');
    if (wh) wh.textContent = floorLine;
    door.setAttribute('aria-label', baseLabel + '. ' + floorLine + '.');

    var glyph = document.getElementById('gdoor-glyph');
    if (cur >= NAMES.length) {
      /* CROWNED — the door stands open gold, and gold is the STYLESHEET's, not a floor's.
         ⚠ The two lines that undo the floor treatment are here because of the second paint:
         a player crowned on another device is painted at floor one first, so without these
         the crowned arch would keep floor one's ice blue and its pawn. */
      gd.style.removeProperty('--acc');
      if (glyph) glyph.textContent = baseGlyph;
      door.setAttribute('href', baseHref + '#tower');
    } else {
      // ⚑ the leaf AND the color are set on EVERY visit, not only mid-climb (2026-08-04 /
      // 2026-08-13). Both used to sit inside the `cleared > 0` branch below, so a
      // first-time visitor got the gold FALLBACK and floor one's door was the wrong color
      // on every page of the site while the same door inside the game was its real ice
      // blue. A color is a fact about WHICH FLOOR you are looking at; only the resume link
      // below is a fact about a climb.
      if (glyph) glyph.textContent = GLYPHS[cur] || '♟';
      gd.style.setProperty('--acc', ACCENTS[cur] || '#F5C518');
      door.setAttribute('href', baseHref + (cleared > 0 ? '#climb' : ''));
    }
  }

  var shown = localCleared();
  paint(shown);

  /* ══ …AND THEN THE ACCOUNT GETS A SAY ═══════════════════════════════════════════════
     2026-08-19, Nate: "logging in to a different device, the gauntlet doors on the main
     page and games hall default to the first door. They should default to the latest door
     the user has unlocked."

     THE CLIMB HAS ALWAYS BEEN A LOCAL FACT. `pjcc.gauntlet.v2` lives in this browser, so a
     new phone knew nothing and every door opened at floor one — for a player who was on
     floor seven. The server has known all along: every finished match writes
     game_stats('the-gauntlet') with the cleared count, which is what the achievements
     already read. Nothing new is stored; this asks the question the pages never asked.

     ⚠ LOCAL PAINTS FIRST AND THE ACCOUNT ONLY EVER RAISES IT. Three reasons, in order:
       · a signed-out visitor and a first paint must not wait on a network round trip;
       · `myStats()` returns [] with no request at all when there is no session, so a
         stranger pays nothing for this;
       · and if the two disagree the LOCAL one can be the fresher — win a floor on this
         phone while the write is still in flight and the server's count is a moment
         behind. Taking the max is the only direction that can never walk a climb backwards.

     ⚠ IT DOES NOT WRITE. The door reports a climb; it does not own one. The game itself
     reconstitutes its local progress from the same row on the way in (see the profile
     restore at the foot of pjcc_gauntlet.html), which is where progress belongs. */
  try {
    if (window.PJCC && PJCC.ready && PJCC.myStats) {
      PJCC.ready.then(function () {
        return PJCC.myStats();
      }).then(function (st) {
        var row = null, i;
        for (i = 0; st && i < st.length; i++) { if (st[i].game === 'the-gauntlet') { row = st[i]; break; } }
        if (!row) return;
        // best_score and data.cleared are written together and are the same number; read
        // both so an older row that only carries one still places the door.
        var srv = Math.max(parseInt(row.best_score, 10) || 0,
                           (row.data && parseInt(row.data.cleared, 10)) || 0);
        if (srv > shown) { shown = srv; publish(srv); paint(srv); }
      })['catch'](function () {});   // a door that throws on a slow network is worse than a stale door
    }
  } catch (e) {}
})();
