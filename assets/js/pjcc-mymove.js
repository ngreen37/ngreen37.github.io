/* ═══════════════════════════════════════════════════════════════════════════
   "IT'S YOUR MOVE AT THE PARK" — a quiet, site-wide nudge (2026-07-25, Nate:
   "'It's your move at the park' is awesome. Let's smartly incorporate that.").

   When a signed-in operative has an ACTIVE Park Tables game that's waiting on
   THEIR move, we light a small gold dot on the hamburger (always visible) and on
   the drawer's "Play Now" link, and swap its subtitle to "It's your move" — so a
   move left waiting pulls you back from anywhere, without opening anything.

   Smart about cost: this is the ONE thing site-wide that touches the tables, so it
   stays cheap — one lightweight query, mirroring PJCCMatch.myTables directly on
   PJCC.db() (no need to load pjcc-match.js everywhere), cached per session for 90s
   so navigating page-to-page doesn't re-hit Supabase. Signed-out visitors never
   query at all (the overwhelming majority — zero cost for them). Private by default:
   it only ever changes the signed-in operative's own nav.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (!window.PJCC) return;
  var CACHE_KEY = 'pjcc.pt.mymove', TTL = 90 * 1000;

  function link(){ return document.querySelector('#site-nav a[href*="park-tables"]'); }

  function paint(n){
    var tog = document.getElementById('nav-toggle'), a = link();
    if (tog) tog.classList.toggle('has-move', n > 0);
    if (a){
      a.classList.toggle('dl-move', n > 0);
      var small = a.querySelector('.dl-txt small');
      if (small){
        if (small.getAttribute('data-orig') == null) small.setAttribute('data-orig', small.textContent);
        small.textContent = n > 0
          ? ("It's your move" + (n > 1 ? ' · ' + n + ' tables' : ''))
          : small.getAttribute('data-orig');
      }
    }
  }

  // Whose move is it? The FEN's active-color field ('w'/'b') vs which seat I hold.
  function isMyMove(m, uid){
    if (m.status !== 'active' || !m.fen) return false;
    return (m.fen.split(' ')[1] === 'w') === (m.white === uid);
  }

  function check(force){
    var u = PJCC.currentUser && PJCC.currentUser();
    if (!u || !PJCC.db) { paint(0); return; }
    var uid = u.id, d = PJCC.db();
    if (!d) return;
    if (!force){
      try {
        var c = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null');
        if (c && c.uid === uid && (Date.now() - c.t) < TTL) { paint(c.n); return; }
      } catch (e) {}
    }
    d.from('matches').select('white,black,status,fen')
      .or('white.eq.' + uid + ',black.eq.' + uid)
      .eq('status', 'active').limit(30)
      .then(function (r){
        if (r.error) return;                       // table missing / offline → leave nav as-is
        var rows = r.data || [], n = 0;
        for (var i = 0; i < rows.length; i++) if (isMyMove(rows[i], uid)) n++;
        try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ uid: uid, n: n, t: Date.now() })); } catch (e) {}
        paint(n);
      }, function (){});
  }

  function boot(){ check(false); }
  if (PJCC.ready && PJCC.ready.then) PJCC.ready.then(boot); else boot();
  // Sign-in/out (or a session Supabase restores a beat late) → refresh immediately.
  if (PJCC.onChange) PJCC.onChange(function(){ check(true); });
})();
