---
layout: page
title: PJCC Chess Academy
permalink: /academy/
own_title: true
---

{% comment %} 2026-07-14 (Nate): the belt ribbon now stands ABOVE the title (own_title
     lets this page place the sky banner itself), the ♚ crest under the title is gone,
     and the whole top reads: your belt → the name of the school → your next move. {% endcomment %}

<!-- ===== Belt + progress — the ribbon above the school's name ===== -->
<div class="ac-belt-wrap">
  <div class="ac-belt-now">
    <div class="ac-belt-ico" id="ac-belt-ico">⛂</div>
    <div>
      <div class="ac-belt-label">Your belt</div>
      <div class="ac-belt-name" id="ac-belt-name">Checker</div>
    </div>
  </div>
  <div class="ac-belt-bar-wrap">
    <div class="ac-belt-next" id="ac-belt-next">—</div>
    <div class="ac-belt-bar"><div class="ac-belt-fill" id="ac-belt-fill"></div></div>
    <div class="ac-belt-ladder" id="ac-belt-ladder"></div>
  </div>
</div>

<h1 class="page-title">PJCC Chess Academy</h1>

<!-- ===== Recommended next — small and quiet (2026-07-14) ===== -->
<div class="ac-next-card" id="ac-next-card" hidden>
  <div class="ac-next-row">
    <div class="ac-next-ico" id="ac-next-ico">♟</div>
    <div class="ac-next-body">
      <div class="ac-next-eyebrow">Your next move</div>
      <div class="ac-next-title" id="ac-next-title">—</div>
    </div>
    <a class="ac-next-go" id="ac-next-go" href="#">Start ▸</a>
  </div>
</div>

{% comment %} THE PLACEMENT EXAM was removed 2026-07-13 (Nate: "really streamline and make it
     not so overwhelming"). It was a five-question quiz in a box of its own, and it was BROKEN
     in the way this site keeps breaking: score 3–4 and it sent you to "Argus & the Rival" via
     THE PIRC PROTOCOL; score 5 and it sent you to BLINDFOLD PUZZLES. Neither is a live game
     (In Development / Vault). So the better you did, the more certainly it walked you into a
     wall. And with one hall open, a placement test has exactly one possible answer — it asked
     five questions to tell everybody the same thing. Restore from git if the other halls open
     and it's ever worth re-asking.

     The DAILY HOMEWORK module (a task + a 🔥 streak flame) went 2026-07-12: every other daily
     on this site is already deleted, and a streak you can BREAK is pressure — the opposite of
     "inviting, simple, warm". {% endcomment %}

<!-- ===== The path (open halls only — Building moved below, 2026-07-14) ===== -->
<h2 class="ac-h2">The path</h2>
<p class="ac-path-lead" id="ac-path-lead">Open Auston's Bootcamp to see the lessons.</p>
<div class="ac-courses" id="ac-courses"></div>

<!-- ===== Being built — the halls that aren't open yet, in their own quiet row ===== -->
<h2 class="ac-h2 ac-h2--soon">Being built</h2>
<div class="ac-courses ac-courses--soonwrap" id="ac-courses-soon"></div>

{% comment %} The FREE-PLAY BOARD left this page 2026-07-14 (Nate: "move that to Learn
     in Games Hall") — it lives at /games/free-play/ now, listed in the Learn hall. {% endcomment %}

{% comment %} The whole For-Teachers-&-Parents apparatus (printables, class codes,
     progress export, certificate verify) was REMOVED 2026-07-14 — Nate: "Completely
     remove it. Cut it WAY down." Restore from git before this date. {% endcomment %}


<script src="{{ '/assets/js/pjcc-config.js' | relative_url }}"></script>
<script src="{{ '/assets/js/pjcc-profile.js' | relative_url }}"></script>
<script src="{{ '/assets/js/pjcc-leitmotif.js' | relative_url }}"></script>
<script>
(function () {
  function best(game) {
    try { if (window.PJCC && PJCC.localBest) return PJCC.localBest(game); return parseInt(localStorage.getItem('pjcc.best.' + game), 10) || 0; } catch (e) { return 0; }
  }
  function mindsEyeTrophy() { try { var s = JSON.parse(localStorage.getItem('pjcc.blindfold.v2')); return !!(s && s.trophy); } catch (e) { return false; } }

  // ---- Faculty & courses: each lesson is a target in a game you already have ----
  /* ═══════════════════════════════════════════════════════════════════════════════
     THE PATH — rebuilt 2026-07-12 (Nate: "the Full Path is way too much. Let's
     re-arrange all of it. Best judgment — we're going for INVITING. Simple. Warm. And
     completely lock all of them except the first one, so I can work on it exclusively
     before people are on the site.")

     It was FIVE halls and SEVENTEEN lessons — but the real problem wasn't the size, it
     was that most of it was BROKEN. Eight of those seventeen lessons sent a student to
     a game that isn't live:
        · Argus's whole hall  → The Pirc Protocol   (In Development)
        · The Rival's hall    → Fork in the Road    (In Development)
        · Princess's hall     → Blindfold Puzzles   (Vault — locked)
        · Maxwell's lesson 2  → Knight's Tour       (TERMINATED)
     A beginner following "the full path" walked straight into a wall, four times over.

     So: ONE hall is open, and it's the one whose lessons all point at finished, live
     games — Auston's, on Notation Blitz and Sand Mine Depths. The other four are shown
     as what they are: halls that aren't built yet. No lesson lists, no dead links, no
     checkboxes nobody can tick. You can see where the road goes; you just can't walk it
     yet.

     Adding a hall back = give it a `lessons` array and drop `soon: true`. The belts,
     the progress bar, the "start here" card, the certificate and the teacher checklist
     all read from the open halls, so they scale on their own.
     ═══════════════════════════════════════════════════════════════════════════════ */
  var COURSES = [
    { id: 'fundamentals', who: 'Auston', slug: 'auston', ico: '💣', accent: '#ffd36b',
      title: "Auston's Bootcamp", sub: 'The board & the pieces',
      blurb: '"You gotta know where everything is before it goes boom."',
      lessons: [
        { t: 'Learn the squares', d: 'Play one run of Notation Blitz.', go: 'notation-run', done: function(){ return best('notation-run') >= 1; } },
        { t: 'Read them at tempo', d: 'Score 600+ in a Notation Blitz run.', go: 'notation-run', done: function(){ return best('notation-run') >= 600; } },
        { t: 'Know them without thinking', d: 'Score 1,200+ in Notation Blitz.', go: 'notation-run', done: function(){ return best('notation-run') >= 1200; } },
        { t: "The knight's geometry", d: 'Make one descent into Sand Mine Depths.', go: 'sand-mine-depths', done: function(){ return best('sand-mine-depths') >= 1; } }
      ] },

    // ── Not built yet. No `lessons`, so they can't be walked, counted, or linked into.
    { id: 'openings', who: 'Argus', slug: 'argus', ico: '♘', accent: '#8fe3ff', soon: true,
      title: "Argus's Opening Repertoire", sub: 'The first ten moves',
      blurb: 'Drill the book until it is muscle memory.' },
    { id: 'tactics', who: 'The Rival', slug: 'rival', ico: '♞', accent: '#ff8fd0', soon: true,
      title: "The Rival's Tactics Dojo", sub: 'Forks, pins, skewers, mates',
      blurb: 'Find the move that wins material.' },
    { id: 'vision', who: 'Princess', slug: 'princess', ico: '♛', accent: '#F5C518', soon: true,
      title: "Princess's Vision Hall", sub: 'Board vision & endgames',
      blurb: 'Princess plays it all in her head.' },
    { id: 'strategy', who: 'Maxwell', slug: 'maxwell', ico: '♖', accent: '#9fe8ff', soon: true,
      title: "Maxwell's Long Game", sub: 'Plans, structure & the long view',
      blurb: 'Nobody sits with a position longer. Think in plans, not just moves.' }
  ];

  // Belts scale to what's actually WALKABLE — four lessons, five belts. The two big ones
  // stay on the ladder, greyed, because seeing where the road ends is half the invitation.
  var BELTS = [
    { n: 'Checker', ico: '⛂', need: 0 },
    { n: 'Pawn', ico: '♙', need: 1 },
    { n: 'Knight', ico: '♘', need: 2 },
    { n: 'Bishop', ico: '♗', need: 3 },
    { n: 'Rook', ico: '♖', need: 4 },
    { n: 'Queen', ico: '♕', need: 99, soon: true },
    { n: 'Chess City Citizen', ico: '♚', need: 99, soon: true }
  ];

  // ---- progress ----
  // Only OPEN halls have lessons, so every count below is automatically about the part of
  // the Academy a student can actually walk.
  function openCourses() { return COURSES.filter(function(c){ return !c.soon && c.lessons; }); }
  function allLessons() { var a = []; openCourses().forEach(function(c){ c.lessons.forEach(function(l){ a.push({ c: c, l: l }); }); }); return a; }
  function doneCount() { var n = 0; allLessons().forEach(function(x){ if (x.l.done()) n++; }); return n; }
  function beltFor(n) { var b = BELTS[0]; for (var i = 0; i < BELTS.length; i++) if (!BELTS[i].soon && n >= BELTS[i].need) b = BELTS[i]; return b; }
  // Only ever chase a belt you can actually reach — the two `soon` belts arrive with the
  // halls that award them, and until then "95 more lessons → Queen" would be a lie.
  function nextBelt(n) { for (var i = 0; i < BELTS.length; i++) if (!BELTS[i].soon && n < BELTS[i].need) return BELTS[i]; return null; }

  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function gameUrl(slug){ return '{{ "/games/" | relative_url }}'.replace(/\/$/, '') + '/' + slug + '/'; }
  function charUrl(slug){ return '{{ "/characters/" | relative_url }}'.replace(/\/$/, '') + '/' + slug + '/'; }

  function render() {
    var done = doneCount(), total = allLessons().length;
    var belt = beltFor(done), next = nextBelt(done);

    document.getElementById('ac-belt-ico').textContent = belt.ico;
    document.getElementById('ac-belt-name').textContent = belt.n;
    var fill = document.getElementById('ac-belt-fill');
    if (next) {
      var span = next.need - belt.need, into = done - belt.need;
      fill.style.width = Math.max(6, Math.round(into / span * 100)) + '%';
      document.getElementById('ac-belt-next').innerHTML = (next.need - done) + ' more lesson' + ((next.need - done) === 1 ? '' : 's') + ' → <b>' + esc(next.n) + '</b> belt';
    } else {
      fill.style.width = '100%';
      document.getElementById('ac-belt-next').innerHTML = '🎓 <b>Rook belt</b> — you\'ve finished every lesson that\'s open. The next halls are being built.';
    }
    // ladder — the two belts that aren't awardable yet sit greyed at the end, so you can
    // see where the road goes without being told you're 95 lessons from it
    var lad = document.getElementById('ac-belt-ladder'); lad.innerHTML = '';
    BELTS.forEach(function(b){
      var got = !b.soon && done >= b.need;
      var pip = document.createElement('span');
      pip.className = 'ac-pip' + (got ? ' got' : '') + (b.soon ? ' soon' : '') + (b.n === belt.n ? ' cur' : '');
      pip.title = b.soon ? b.n + ' · opens with a later hall'
                         : b.n + (got ? ' ✓' : ' · ' + b.need + ' lesson' + (b.need === 1 ? '' : 's'));
      pip.innerHTML = b.ico;
      lad.appendChild(pip);
    });

    // recommended next — one line + one button (2026-07-14: "EVEN less wordy")
    var rec = null;
    var ordered = allLessons();
    for (var i = 0; i < ordered.length; i++) { if (!ordered[i].l.done()) { rec = ordered[i]; break; } }
    var card = document.getElementById('ac-next-card');
    if (rec) {
      card.hidden = false;
      document.getElementById('ac-next-ico').textContent = rec.c.ico;
      document.getElementById('ac-next-ico').style.color = rec.c.accent;
      document.getElementById('ac-next-title').textContent = rec.l.t;
      document.getElementById('ac-next-go').href = gameUrl(rec.l.go);
    } else {
      card.hidden = false;
      document.getElementById('ac-next-ico').textContent = '🎓';
      document.getElementById('ac-next-ico').style.color = '#ffd36b';
      document.getElementById('ac-next-title').textContent = 'Bootcamp finished — print your certificate below.';
      document.getElementById('ac-next-go').href = '{{ "/leaderboards/" | relative_url }}';
      document.getElementById('ac-next-go').textContent = 'Boards ▸';
    }

    /* Courses — SMALL boxes (2026-07-13, Nate: "make all the boxes small. You should click
       into the Bootcamp to learn more about it. Really streamline and make it not so
       overwhelming").

       Every hall is now the same small tile: a glyph, a name, a line, a state. The one that's
       OPEN is a <details> — click it and it unfolds into the blurb, the teacher and the four
       lessons. Closed, five halls take about the room one used to. The lesson list is still
       one click away; it just isn't shouted at someone who only came to look.

       The halls that aren't built are plain tiles, not <details>: there is nothing behind
       them to open, and a box that opens onto an apology is worse than a box that doesn't
       open. Each one still offers the one true thing it has — go meet whoever will teach it. */
    var cw = document.getElementById('ac-courses'); cw.innerHTML = '';
    var sw = document.getElementById('ac-courses-soon'); if (sw) sw.innerHTML = '';
    COURSES.forEach(function(c){
      if (c.soon) {
        // Building halls live in their OWN row below the path now (2026-07-14 Nate) —
        // the whole tile is still the link to whoever will teach it.
        var t = document.createElement('a');
        t.className = 'ac-course ac-course--soon';
        t.href = charUrl(c.slug);
        t.title = 'Not built yet — meet ' + c.who + ', who will teach it';
        t.style.setProperty('--acc', c.accent);
        t.innerHTML =
          '<span class="ac-course-head">' +
            '<span class="ac-course-ico">' + c.ico + '</span>' +
            '<span class="ac-course-name"><b class="ac-course-title">' + esc(c.title) + '</b>' +
              '<small class="ac-course-sub">' + esc(c.sub) + '</small></span>' +
            '<span class="ac-course-prog ac-course-prog--soon">Building</span>' +
          '</span>';
        (sw || cw).appendChild(t);
        return;
      }

      var cdone = c.lessons.filter(function(l){ return l.done(); }).length;
      var lessonsHtml = c.lessons.map(function(l){
        var ok = l.done();
        return '<li class="ac-lesson' + (ok ? ' done' : '') + '">' +
          '<span class="ac-check">' + (ok ? '✓' : '▢') + '</span>' +
          '<span class="ac-lesson-txt"><b>' + esc(l.t) + '</b><small>' + esc(l.d) + '</small></span>' +
          '<a class="ac-lesson-go" href="' + gameUrl(l.go) + '">play ▸</a></li>';
      }).join('');

      var el = document.createElement('details');
      el.className = 'ac-course ac-course--open';
      el.style.setProperty('--acc', c.accent);
      el.innerHTML =
        '<summary class="ac-course-head">' +
          '<span class="ac-course-ico">' + c.ico + '</span>' +
          '<span class="ac-course-name"><b class="ac-course-title">' + esc(c.title) + '</b>' +
            '<small class="ac-course-sub">' + esc(c.sub) + '</small></span>' +
          '<span class="ac-course-prog">' + cdone + '/' + c.lessons.length + '</span>' +
        '</summary>' +
        '<div class="ac-course-body">' +
          '<p class="ac-course-blurb">' + esc(c.blurb) + '</p>' +
          '<p class="ac-course-meet">' +
            '<button class="ac-intro-btn" type="button" data-who="' + esc(c.who) + '" data-say="' + esc(c.blurb) + '" aria-label="Hear ' + esc(c.who) + '\'s intro">▶</button>' +
            '<a href="' + charUrl(c.slug) + '">Meet ' + esc(c.who) + ' →</a></p>' +
          '<ul class="ac-lessons">' + lessonsHtml + '</ul>' +
        '</div>';
      cw.appendChild(el);
    });

  }







  syncName();
  if (window.PJCC && PJCC.ready && PJCC.ready.then) { PJCC.ready.then(render); }
  render();
})();
</script>

<!-- ===== Academy extras: placement · homework · sandbox · class codes · export · verify · voice ===== -->
<script>
(function () {
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]; }); }
  /* (`best()` and `gameUrl()` used to live here for the daily homework and the placement exam.
     Both modules are gone, and they were the only callers, so they went too.) */

  // ---- voiced character intros: leitmotif + browser speech ----
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.ac-intro-btn'); if (!b) return;
    var who = b.getAttribute('data-who'), say = b.getAttribute('data-say');
    if (window.PJCCLeitmotif) { try { PJCCLeitmotif.play(who); } catch (_) {} }
    if (window.speechSynthesis) {
      try {
        speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(say); u.rate = 0.98;
        var seed = 0; for (var i = 0; i < who.length; i++) seed += who.charCodeAt(i);
        u.pitch = 0.8 + (seed % 5) * 0.12;
        setTimeout(function () { speechSynthesis.speak(u); }, 360);
      } catch (_) {}
    }
    b.classList.remove('playing'); void b.offsetWidth; b.classList.add('playing');
  });

  /* (The PLACEMENT EXAM engine went 2026-07-13 with its markup — see the note up in the
     page body. Short version: three of its five outcomes routed students to games that
     aren't live, and with one hall open it had one possible answer anyway.

     The DAILY HOMEWORK engine — a date-seeded task + a localStorage streak flame — went
     2026-07-12, likewise: three of its six tasks pointed at Fork in the Road, The Pirc
     Protocol and Knight's Tour, none of which are live games. Both restore from git.) */

  // (The free-play sandbox board moved to /games/free-play/ — 2026-07-14, Nate.)






})();
</script>

<style>
/* (the ♚ crest under the title was deleted 2026-07-14 — Nate.) */

/* the mid-page sky banner: own_title puts it BELOW the belt ribbon, so undo the
   card-top geometry the shared rule assumes (it normally cancels the card padding) */
.page-body > .page-title { margin: 14px -44px 22px; border-radius: 0; }
@media (max-width: 700px){ .page-body > .page-title { margin: 12px -20px 18px; } }

/* belt — the ribbon above the school's name (2026-07-14), slimmer than ever */
.ac-belt-wrap { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; background: linear-gradient(135deg,#1f1147,#2d1b69);
  border: 1px solid rgba(245,197,24,0.3); border-radius: var(--r-md); padding: 9px 14px; margin: 0 0 4px; }
.ac-belt-now { display: flex; align-items: center; gap: 10px; }
.ac-belt-ico { font-size: 28px; color: #F5C518; line-height: 1; }
.ac-belt-label { font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.1em; color: #9a7fd4; }
.ac-belt-name { font-size: 1.1rem; font-weight: 800; color: #f0e6ff; }
.ac-belt-bar-wrap { flex: 1 1 260px; min-width: 240px; }
.ac-belt-next { font-size: 0.78rem; color: #c9a7ff; margin-bottom: 5px; }
.ac-belt-next b { color: #F5C518; }
.ac-belt-bar { height: 7px; background: rgba(157,127,212,0.16); border: 1px solid #4a2f8a; border-radius: 999px; overflow: hidden; }
.ac-belt-fill { height: 100%; width: 0; background: linear-gradient(90deg,#6b5fa0,#F5C518); transition: width 0.9s ease; }
.ac-belt-ladder { display: flex; gap: 5px; margin-top: 7px; flex-wrap: wrap; }
.ac-pip { width: 22px; height: 22px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%;
  background: rgba(20,12,45,0.6); border: 1px solid #3a2a6a; color: #7d6bb0; font-size: 12px; }
.ac-pip.got { color: #1a0f3d; background: #F5C518; border-color: #F5C518; }
.ac-pip.cur { box-shadow: 0 0 0 2px #ff8fd0; }
/* the belts that aren't awardable yet — visible, so you can see where the road goes,
   but plainly not on offer */
.ac-pip.soon { opacity: 0.32; border-style: dashed; }

/* recommended next — smaller and quieter again (2026-07-14: "a little smaller and
   EVEN less wordy"): one icon, one line, one button. */
.ac-next-card { background: rgba(245,197,24,0.09); border: 1px solid #F5C518; border-radius: var(--r-md); padding: 9px 13px; margin: 12px 0; box-shadow: 0 0 18px rgba(245,197,24,0.1); }
.ac-next-eyebrow { font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.1em; color: #F5C518; font-weight: 700; }
.ac-next-row { display: flex; align-items: center; gap: 11px; }
.ac-next-ico { font-size: 24px; flex: 0 0 auto; }
.ac-next-body { min-width: 0; flex: 1; }
.ac-next-title { font-size: 0.94rem; font-weight: 800; color: #f0e6ff; }
.ac-next-go { flex: 0 0 auto; background: #F5C518; color: #1a0f3d; font-weight: 800; text-decoration: none;
  border-radius: 999px; padding: 8px 15px; white-space: nowrap; }
.ac-next-go:hover { background: #ffd740; }

/* ── The path: five SMALL halls (2026-07-13) ──────────────────────────────────
   Nate: "make all the boxes small. You should click into the Bootcamp to learn more about
   it." Every hall is the same compact tile — glyph, name, one line, a state chip. The open
   one is a <details>: clicking the tile unfolds the blurb, the teacher and the lessons.
   Closed, the whole path is about the height one card used to be. */
.ac-h2 { color: #F5C518; margin: 24px 0 6px; font-size: 1.15rem; }
.ac-h2--soon { color: #9a7fd4; font-size: 0.95rem; margin-top: 28px; }
.ac-path-lead { color: #c9a7ff; font-size: 0.86rem; margin: 0 0 12px; }
/* align-items:start is load-bearing. Grid rows STRETCH by default, so the moment you open
   the Bootcamp its whole row grows with it — and the "Building" tiles beside it inflate into
   tall empty boxes to match. Each tile keeps its own height instead. */
.ac-courses { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 10px; align-items: start; }
.ac-course { background: rgba(45,27,105,0.5); border: 1px solid var(--edge-soft);
  border-left: 3px solid var(--acc, #F5C518); border-radius: var(--r-sm); padding: 9px 12px; }

.ac-course-head { display: flex; align-items: center; gap: 9px; }
.ac-course-ico { font-size: 20px; color: var(--acc); width: 24px; text-align: center; flex: 0 0 auto; }
.ac-course-name { min-width: 0; flex: 1; }
.ac-course-title { display: block; font-weight: 700; color: #f0e6ff; font-size: 0.9rem; line-height: 1.25; }
.ac-course-sub { display: block; font-size: 0.72rem; color: #9a7fd4; }
.ac-course-prog { flex: 0 0 auto; font-family: 'Share Tech Mono', monospace; font-weight: 700;
  font-size: 0.78rem; color: var(--acc); }

/* the OPEN hall — a details/summary tile. The marker is ours, on the right, so the row
   reads as one thing you can press rather than a card with a twisty bolted on. */
.ac-course--open > summary { list-style: none; cursor: pointer; }
.ac-course--open > summary::-webkit-details-marker { display: none; }
.ac-course--open > summary::after { content: '▸'; color: #9a7fd4; flex: 0 0 auto;
  transition: transform 0.2s ease; }
.ac-course--open[open] > summary::after { transform: rotate(90deg); }
.ac-course--open > summary:hover .ac-course-title { color: #ffd740; }
.ac-course-body { padding-top: 8px; margin-top: 8px; border-top: 1px solid rgba(157,127,212,0.14); }
.ac-course-blurb { color: #c9a7ff; font-size: 0.82rem; line-height: 1.5; margin: 0 0 8px; font-style: italic; }
.ac-course-meet { display: flex; align-items: center; gap: 8px; margin: 0; font-size: 0.8rem; }
.ac-course-meet a { color: var(--acc); white-space: nowrap; }

/* ── A hall that isn't built yet ──────────────────────────────────────────────
   Deliberately QUIET, not barred: dimmer, flat-backed, a soft dashed left edge instead of
   the bright accent bar. And NOT a <details> — there is nothing behind it to open, and a
   box that unfolds onto an apology is worse than one that doesn't unfold. It carries no
   lesson list and no checkboxes, so nothing here can send a student at a game that doesn't
   exist. It offers the one true thing it has: go meet whoever will teach it. */
.ac-course--soon { display: block; text-decoration: none; background: rgba(45,27,105,0.24);
  border-color: #2c2050; border-left: 3px dashed color-mix(in srgb, var(--acc) 45%, transparent);
  transition: border-color 0.15s ease, background 0.15s ease; }
.ac-course--soon .ac-course-ico { opacity: 0.5; }
.ac-course--soon .ac-course-title { color: #b8a8dd; }
.ac-course--soon:hover { background: rgba(45,27,105,0.4); border-color: #3a2a6a;
  border-left-color: var(--acc); }
.ac-course--soon:hover .ac-course-title { color: #f0e6ff; }
.ac-course--soon:hover .ac-course-ico { opacity: 1; }
.ac-course-prog--soon { font-family: 'Share Tech Mono', monospace; font-size: 0.58rem; font-weight: 700;
  letter-spacing: 0.12em; text-transform: uppercase; color: #8f7fbb; background: rgba(20,12,45,0.6);
  border: 1px solid #3a2a6a; border-radius: 999px; padding: 2px 7px; white-space: nowrap; }
.ac-lessons { list-style: none; padding: 0; margin: 8px 0 0; }
.ac-lesson { display: flex; align-items: center; gap: 10px; padding: 7px 0; border-top: 1px solid rgba(157,127,212,0.14); }
.ac-check { font-size: 15px; color: #7d6bb0; flex: 0 0 auto; width: 18px; text-align: center; }
.ac-lesson.done .ac-check { color: #6bffb8; }
.ac-lesson-txt { min-width: 0; flex: 1; }
.ac-lesson-txt b { color: #f0e6ff; font-size: 0.92rem; display: block; }
.ac-lesson.done .ac-lesson-txt b { color: #9bffd0; }
.ac-lesson-txt small { color: #9a7fd4; font-size: 0.78rem; }
.ac-lesson-go { flex: 0 0 auto; color: var(--acc); font-size: 0.8rem; font-weight: 700; text-decoration: none; }
.ac-lesson-go:hover { text-decoration: underline; }



/* (all printable-sheet, worksheet and certificate styles went 2026-07-14 with the
   For-Teachers-&-Parents apparatus — restore from git.) */

/* intro voice button — it lives INSIDE the opened hall now, next to "Meet Auston →", not in
   the summary row. In the summary it would have been a button inside a <summary>, where a
   click both fires the voice AND folds the tile shut under you. */
.ac-intro-btn { background: transparent; border: 1px solid var(--acc, #6b5fa0); color: var(--acc, #c9a7ff);
  border-radius: 999px; width: 24px; height: 24px; cursor: pointer; font-size: 0.68rem; flex: 0 0 auto;
  line-height: 1; padding: 0; }
.ac-intro-btn:hover { background: var(--acc, #F5C518); color: #1a0f3d; }
.ac-intro-btn.playing { animation: acPulse 0.9s ease; }
@keyframes acPulse { 0% { box-shadow: 0 0 0 0 rgba(245,197,24,0.5); } 100% { box-shadow: 0 0 0 12px rgba(245,197,24,0); } }

/* (the .ac-place* / .ac-pq* placement-exam styles went 2026-07-13 with the module,
   and the .ac-hw* daily-homework styles went 2026-07-12 with theirs) */

/* (the fold, classroom-tools and print-CSS blocks went 2026-07-14 with the
   For-Teachers-&-Parents apparatus.) */

/* promotion state — the ladder in Chess City gold. Found, never given. */
body.ac-gold .ac-belt-wrap { background: linear-gradient(135deg,#3a2c07,#5c4708); border-color: rgba(245,197,24,0.75); box-shadow: 0 0 30px rgba(245,197,24,0.18); }
body.ac-gold .ac-belt-label { color: #caa84a; }
body.ac-gold .ac-belt-next { color: #e6d28a; }
body.ac-gold .ac-belt-bar { background: rgba(245,197,24,0.12); border-color: #8a6d10; }
body.ac-gold .ac-belt-fill { background: linear-gradient(90deg,#caa84a,#ffd740); }
body.ac-gold .ac-pip { background: rgba(58,44,7,0.7); border-color: #8a6d10; color: #caa84a; }
body.ac-gold .ac-pip.got { background: #F5C518; border-color: #F5C518; color: #1a0f3d; }

/* 2026-07-13 touch sweep: the voice button (24x24) and the per-lesson "play" links (41x23)
   measured under the tap floor on a real phone render. Fingers get bigger boxes; the
   desktop look is untouched. */
@media (pointer: coarse) {
  .ac-intro-btn { width: 38px; height: 38px; font-size: 0.85rem; }
  .ac-lesson-go { padding: 10px 8px; margin: -10px -8px -10px 0; }
  .ac-soon-note { padding: 9px 0; }
}
</style>

<script>
// A pawn that walks the whole ladder gets to choose what it becomes.
// Typed anywhere on this page (outside a text field). No hint exists anywhere.
(function () {
  var KEY = 'pjcc.academy.promotion', buf = '', timer = null;
  function apply(on) { document.body.classList.toggle('ac-gold', on); }
  try { if (localStorage.getItem(KEY) === '1') apply(true); } catch (e) {}
  document.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key.length !== 1) return;
    buf = (buf + e.key).slice(-4);
    clearTimeout(timer); timer = setTimeout(function () { buf = ''; }, 1800);
    if (buf === 'e8=Q' || buf === 'e8=q') {
      buf = '';
      var on = !document.body.classList.contains('ac-gold');
      apply(on);
      try {
        localStorage.setItem(KEY, on ? '1' : '0');
        localStorage.setItem('frag_promotion', '1');
      } catch (e2) {}
      if (window.showTxToast) showTxToast(on
        ? 'e8=Q — PROMOTION. She was always going to rise.'
        : 'Underpromotion. Bold.');
    }
  });
})();
</script>
