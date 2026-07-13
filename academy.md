---
layout: page
title: PJCC Chess Academy
permalink: /academy/
---


<div class="ac-hero">
  <div class="ac-crest">♚</div>
</div>

<!-- ===== Belt + progress ===== -->
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

<!-- ===== Recommended next ===== -->
<div class="ac-next-card" id="ac-next-card" hidden>
  <div class="ac-next-eyebrow">▶ Start here · your next move</div>
  <div class="ac-next-row">
    <div class="ac-next-ico" id="ac-next-ico">♟</div>
    <div class="ac-next-body">
      <div class="ac-next-title" id="ac-next-title">—</div>
      <div class="ac-next-desc" id="ac-next-desc">—</div>
      <div class="ac-next-who" id="ac-next-who">—</div>
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

<!-- ===== The path ===== -->
<h2 class="ac-h2">The path</h2>
<p class="ac-path-lead" id="ac-path-lead">Open Auston's Bootcamp to see the lessons. The rest of the halls open as they're built.</p>
<div class="ac-courses" id="ac-courses"></div>

<!-- ===== Free-play board (collapsed) ===== -->
<details class="ac-fold">
<summary><span class="ac-fold-t">♟ Free-play board</span><span class="ac-fold-hint">a quiet board to think on — no rules, no score</span></summary>
<div class="ac-fold-body">
<div class="ac-sb-tools">
  <button class="ac-print-btn" id="ac-sb-reset" type="button">↺ Reset pieces</button>
  <button class="ac-print-btn" id="ac-sb-clear" type="button">⌫ Clear board</button>
  <span class="ac-sb-hint" id="ac-sb-hint">Tap a piece to pick it up.</span>
</div>
<div class="ac-sb" id="ac-sb"></div>
</div>
</details>

<!-- ===== For teachers & parents (collapsed) ===== -->
<details class="ac-fold ac-fold-teacher">
<summary><span class="ac-fold-t">🏫 For teachers &amp; parents</span><span class="ac-fold-hint">worksheets · certificates · class codes · progress export</span></summary>
<div class="ac-fold-body">
<p class="ac-class-intro">The student's name below flows onto every printout.</p>
<div class="ac-class-row">
  <label class="ac-name-field">Student name
    <input type="text" id="ac-student" placeholder="e.g. Princess" maxlength="40" autocomplete="off">
  </label>
  <button class="ac-print-btn" id="ac-print-work">🖨 Worksheet packet</button>
  <button class="ac-print-btn" id="ac-print-curric">🖨 Curriculum</button>
  <button class="ac-print-btn" id="ac-print-teacher">🖨 Progress sheet</button>
  <button class="ac-print-btn ac-print-cert" id="ac-print-cert">🏅 Certificate</button>
</div>

<!-- ===== School-pilot kit: class codes + progress export ===== -->
<div class="ac-tools">
  <div class="ac-tool">
    <div class="ac-tool-h">🎟 Class code</div>
    <p class="ac-tool-p">Generate a code, hand it out. <span class="ac-muted">(Local — no accounts.)</span></p>
    <div class="ac-tool-row">
      <button class="ac-print-btn" id="ac-class-gen" type="button">Generate class code</button>
      <input id="ac-class-join" class="ac-tool-in" placeholder="enter a class code" maxlength="12" autocomplete="off">
      <button class="ac-print-btn" id="ac-class-save" type="button">Join</button>
    </div>
    <div class="ac-tool-out" id="ac-class-out"></div>
  </div>
  <div class="ac-tool">
    <div class="ac-tool-h">📊 Progress export</div>
    <p class="ac-tool-p">Save progress to a file, or load it back.</p>
    <div class="ac-tool-row">
      <button class="ac-print-btn" id="ac-export" type="button">⬇ Export (.json)</button>
      <button class="ac-print-btn" id="ac-copy-sum" type="button">⧉ Copy summary</button>
      <label class="ac-print-btn ac-file-btn">⬆ Import<input type="file" id="ac-import" accept="application/json" hidden></label>
    </div>
    <div class="ac-tool-out" id="ac-export-out"></div>
  </div>
  <div class="ac-tool">
    <div class="ac-tool-h">✅ Verify a certificate</div>
    <p class="ac-tool-p">Paste a certificate's <code>CTA-…</code> code to confirm it.</p>
    <div class="ac-tool-row">
      <input id="ac-verify-in" class="ac-tool-in ac-verify-in" placeholder="CTA-…" autocomplete="off">
      <button class="ac-print-btn" id="ac-verify-btn" type="button">Verify</button>
    </div>
    <div class="ac-tool-out" id="ac-verify-out"></div>
  </div>
</div>
</div>
</details>

<!-- ===== Printable sheets (hidden on screen) ===== -->
<div class="ac-print" id="sheet-worksheet">
  <!-- Page 1 — coordinates -->
  <div class="ws-page">
    <div class="ws-head"><span>PJCC Chess Academy · Worksheet Packet</span><span id="ws-name-1">Name: ____________________</span></div>
    <h1 class="ws-title">1 · Coordinate Quest</h1>
    <p class="ws-sub">The board has 8 files (a–h, left to right) and 8 ranks (1–8, bottom to top). Each square has a name like <b>e4</b>.</p>
    <div class="ws-board" id="ws-board"></div>
    <ol class="ws-q">
      <li>Write the name of the square where the <b>white king</b> starts: ____________</li>
      <li>Name <b>three</b> squares on the <b>e-file</b>: ________  ________  ________</li>
      <li>Name <b>three</b> squares on the <b>4th rank</b>: ________  ________  ________</li>
      <li>On an <b>empty board</b>, a knight on <b>g1</b> can jump to <b>f3</b>, <b>h3</b>, or ________ — three squares in all</li>
      <li>Colour the square <b>d5</b>. Is it light or dark? ____________</li>
      <li>Bonus: which two squares are in the <b>corners on White's side</b>? ________ and ________</li>
    </ol>
    <p class="ws-foot">Then play <b>Notation Blitz</b> in the Academy to check your answers at speed!</p>
  </div>
  <!-- Page 2 — how the pieces move -->
  <div class="ws-page">
    <div class="ws-head"><span>PJCC Chess Academy · Worksheet Packet</span><span>Name: ____________________</span></div>
    <h1 class="ws-title">2 · How the Pieces Move</h1>
    <p class="ws-sub">Draw arrows from each piece to <b>every</b> square it could move to from the centre of an empty board.</p>
    <ol class="ws-q">
      <li>The <b>rook</b> (♖) moves in straight lines. How many squares can it reach from <b>d4</b>? ______</li>
      <li>The <b>bishop</b> (♗) moves on diagonals. What colour squares does a bishop on <b>c1</b> always stay on? ____________</li>
      <li>The <b>queen</b> (♕) moves like a rook <b>and</b> a bishop. From <b>d4</b>, can she reach <b>h8</b>? ______</li>
      <li>The <b>knight</b> (♘) jumps in an L. List all squares a knight on <b>d4</b> can reach: ______________________</li>
      <li>The <b>pawn</b> (♙) moves forward but captures diagonally. From <b>e2</b>, where can it move on its first turn? ____________</li>
      <li>Bonus: why can a <b>bishop</b> never visit every square on the board? ____________</li>
    </ol>
    <p class="ws-foot">Practice the knight's jump in <b>Sand Mine Depths</b> and <b>Knight's Tour</b>.</p>
  </div>
  <!-- Page 3 — first tactics -->
  <div class="ws-page">
    <div class="ws-head"><span>PJCC Chess Academy · Worksheet Packet</span><span>Name: ____________________</span></div>
    <h1 class="ws-title">3 · First Tactics</h1>
    <p class="ws-sub">A <b>fork</b> attacks two pieces at once. A <b>pin</b> traps a piece in front of a more valuable one. A <b>skewer</b> is a pin in reverse.</p>
    <ol class="ws-q">
      <li>What do we call one piece attacking <b>two</b> enemy pieces at the same time? ____________</li>
      <li>Which piece is famous for forking the king and queen with its L-jump? ____________</li>
      <li>If a knight forks the <b>king</b> and a <b>rook</b>, which must move — and what do you win? ____________</li>
      <li>A <b>pin</b> against the <b>king</b> is special because the pinned piece legally cannot move <b>off the line of the</b> ____________.</li>
      <li>Draw a fork: place a white knight so it attacks the <b>black king</b> and a <b>black rook</b> at the same time. (Use the back of the page.)</li>
      <li>Bonus: name the three tactics above in order of how often you think they appear: ____________</li>
    </ol>
    <p class="ws-foot">Then prove it in <b>Fork in the Road</b> — solve 3 to finish the lesson.</p>
  </div>
</div>

<div class="ac-print" id="sheet-teacher">
  <div class="ws-head"><span>PJCC Chess Academy — Progress Report</span><span id="ws-name-2">Student: ____________________</span></div>
  <h1 class="ws-title">Teacher Progress Sheet</h1>
  <div class="ws-belt" id="ws-belt">Current belt: —</div>
  <div id="ws-checklist"></div>
  <p class="ws-foot">Date: ______________  ·  Instructor signature: ____________________</p>
</div>

<div class="ac-print ac-cert" id="sheet-cert">
  <div class="cert-border">
    <div class="cert-crest">♚</div>
    <div class="cert-academy">PJCC Chess Academy</div>
    <div class="cert-presents">This certifies that</div>
    <div class="cert-name" id="cert-name">Cadet</div>
    <div class="cert-has">has earned the rank of</div>
    <div class="cert-belt" id="cert-belt">Checker</div>
    <div class="cert-line" id="cert-line">— completed lessons across the Academy —</div>
    <div class="cert-sig"><div>♘ Argus &nbsp; ♞ The Rival &nbsp; ♛ Princess</div><div class="cert-date" id="cert-date"></div></div>
    <div class="cert-code-wrap">Verify at mcpuppystudios.com/academy &nbsp;·&nbsp; <span class="cert-code" id="cert-code"></span></div>
  </div>
</div>

<div class="ac-print" id="sheet-curric">
  <div class="ws-page">
    <div class="ws-head"><span>PJCC Chess Academy</span><span>Class: ____________________</span></div>
    <h1 class="ws-title">A 6-Week Curriculum — Teacher Plan</h1>
    <p class="ws-sub">A ready-to-run unit. Each week pairs a short lesson with an in-Academy game and a worksheet page.</p>
    <table class="ws-curric">
      <tr><th>Week</th><th>Focus</th><th>Faculty · Game</th><th>Homework</th></tr>
      <tr><td>1</td><td>The board &amp; coordinates</td><td>Auston · Notation Blitz</td><td>Worksheet 1</td></tr>
      <tr><td>2</td><td>How the pieces move</td><td>Auston · Sand Mine / Knight's Tour</td><td>Worksheet 2</td></tr>
      <tr><td>3</td><td>Openings — the first moves</td><td>Argus · The Pirc Protocol</td><td>Play one line</td></tr>
      <tr><td>4</td><td>Tactics — forks &amp; pins</td><td>The Rival · Fork in the Road</td><td>Worksheet 3 · solve 3</td></tr>
      <tr><td>5</td><td>Strategy — the long game</td><td>Maxwell · Siege on Chess City</td><td>Play one siege</td></tr>
      <tr><td>6</td><td>Board vision</td><td>Princess · Blindfold Puzzles</td><td>Solve 5 blind</td></tr>
    </table>
    <p class="ws-foot">Belts: a new belt every ~3–4 lessons (see the live ladder on the Academy page). Print each student's certificate at the end — the code on it verifies right on the site.</p>
  </div>
</div>

<script src="{{ '/assets/js/pjcc-config.js' | relative_url }}"></script>
<script src="{{ '/assets/js/pjcc-profile.js' | relative_url }}"></script>
<script src="{{ '/assets/js/pjcc-leitmotif.js' | relative_url }}"></script>
<script>
// Deterministic, offline certificate codes — verifiable on this page, no backend.
window.ACCERT = (function () {
  function b64u(s) { return btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function unb64u(s) { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; return decodeURIComponent(escape(atob(s))); }
  function ck(s) { var n = 0; for (var i = 0; i < s.length; i++) n = (n + s.charCodeAt(i) * (i + 1)) % 1296; var c = n.toString(36).toUpperCase(); while (c.length < 2) c = '0' + c; return c; }
  function make(o) {
    var name = String(o.name || 'Cadet').replace(/\|/g, ' ').slice(0, 40);
    var b = b64u([name, o.belt, o.done, o.total, o.date].join('|'));
    return 'CTA-' + b + '-' + ck(b);
  }
  function verify(code) {
    try {
      var m = String(code).trim().replace(/\s+/g, '').match(/^CTA-(.+)-([A-Za-z0-9]{2})$/);
      if (!m) return null;
      if (ck(m[1]) !== m[2].toUpperCase()) return { valid: false };
      var p = unb64u(m[1]).split('|');
      if (p.length < 5) return { valid: false };
      return { valid: true, name: p[0], belt: p[1], done: +p[2], total: +p[3], date: p[4] };
    } catch (e) { return { valid: false }; }
  }
  return { make: make, verify: verify };
})();
</script>
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

    // recommended next
    var rec = null;
    var ordered = allLessons();
    for (var i = 0; i < ordered.length; i++) { if (!ordered[i].l.done()) { rec = ordered[i]; break; } }
    var card = document.getElementById('ac-next-card');
    if (rec) {
      card.hidden = false;
      document.getElementById('ac-next-ico').textContent = rec.c.ico;
      document.getElementById('ac-next-ico').style.color = rec.c.accent;
      document.getElementById('ac-next-title').textContent = rec.l.t;
      document.getElementById('ac-next-desc').textContent = rec.l.d;
      document.getElementById('ac-next-who').innerHTML = 'with <b style="color:' + rec.c.accent + '">' + esc(rec.c.who) + '</b> · ' + esc(rec.c.sub);
      document.getElementById('ac-next-go').href = gameUrl(rec.l.go);
    } else {
      card.hidden = false;
      document.getElementById('ac-next-ico').textContent = '🎓';
      document.getElementById('ac-next-ico').style.color = '#ffd36b';
      document.getElementById('ac-next-title').textContent = "You've finished Auston's Bootcamp.";
      document.getElementById('ac-next-desc').textContent = 'Print your certificate below. The next halls are still being built — come back and they\'ll be waiting.';
      document.getElementById('ac-next-who').innerHTML = 'Auston is proud of you. He would never say it.';
      document.getElementById('ac-next-go').href = '{{ "/leaderboards/" | relative_url }}';
      document.getElementById('ac-next-go').textContent = 'Leaderboards ▸';
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
    COURSES.forEach(function(c){
      if (c.soon) {
        // The whole tile is the link — one row, exactly as tall as the Bootcamp's summary.
        // (It used to carry a separate "Meet X →" line underneath, which made every LOCKED
        //  hall taller than the one hall that's actually open. The important box was the
        //  smallest box on the page.)
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
        cw.appendChild(t);
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

    // teacher checklist + belt — open halls only, so a teacher never prints a worksheet
    // for a lesson that can't be done
    var tc = document.getElementById('ws-checklist'); tc.innerHTML = '';
    document.getElementById('ws-belt').textContent = 'Current belt: ' + belt.n + '  (' + done + ' / ' + total + ' lessons complete)';
    openCourses().forEach(function(c){
      var sec = '<div class="ws-course"><b>' + esc(c.title) + '</b> — ' + esc(c.who) + '</div><ul class="ws-list">';
      c.lessons.forEach(function(l){ sec += '<li>' + (l.done() ? '☑' : '☐') + ' ' + esc(l.t) + ' <i>(' + esc(l.d) + ')</i></li>'; });
      sec += '</ul>';
      var d = document.createElement('div'); d.innerHTML = sec; tc.appendChild(d);
    });

    // certificate text + verifiable code
    document.getElementById('cert-belt').textContent = belt.n;
    document.getElementById('cert-line').textContent = '— ' + done + ' of ' + total + ' Academy lessons completed —';
    var cc = document.getElementById('cert-code');
    if (cc && window.ACCERT) {
      var nm = (document.getElementById('ac-student').value || 'Cadet').trim() || 'Cadet';
      cc.textContent = ACCERT.make({ name: nm, belt: belt.n, done: done, total: total, date: new Date().toISOString().slice(0, 10) });
    }
  }

  // ---- student name (local only) ----
  var nameIn = document.getElementById('ac-student');
  try { nameIn.value = localStorage.getItem('pjcc.academy.student') || ''; } catch (e) {}
  function syncName() {
    var nm = (nameIn.value || '').trim();
    try { localStorage.setItem('pjcc.academy.student', nm); } catch (e) {}
    var disp = nm || 'Cadet';
    document.getElementById('cert-name').textContent = disp;
    document.getElementById('ws-name-1').textContent = 'Name: ' + (nm || '____________________');
    document.getElementById('ws-name-2').textContent = 'Student: ' + (nm || '____________________');
  }
  nameIn.addEventListener('input', syncName);

  // ---- worksheet board (printable 8x8) ----
  (function () {
    var b = document.getElementById('ws-board'); if (!b) return;
    var files = 'abcdefgh';
    for (var r = 8; r >= 1; r--) {
      var lab = document.createElement('div'); lab.className = 'ws-cell ws-lab'; lab.textContent = r; b.appendChild(lab);
      for (var f = 0; f < 8; f++) {
        var c = document.createElement('div');
        c.className = 'ws-cell ' + (((f + r) % 2 === 0) ? 'ws-dark' : 'ws-light');
        b.appendChild(c);
      }
    }
    var corner = document.createElement('div'); corner.className = 'ws-cell ws-lab'; b.appendChild(corner);
    for (var f2 = 0; f2 < 8; f2++) { var l = document.createElement('div'); l.className = 'ws-cell ws-lab'; l.textContent = files[f2]; b.appendChild(l); }
  })();

  // ---- printing (visibility-isolated sheet) ----
  function printSheet(id) {
    var s = document.getElementById(id); if (!s) return;
    document.getElementById('cert-date').textContent = new Date().toLocaleDateString();
    s.classList.add('printing-active'); document.body.classList.add('ac-printing');
    window.print();
  }
  window.addEventListener('afterprint', function () {
    document.body.classList.remove('ac-printing');
    Array.prototype.forEach.call(document.querySelectorAll('.printing-active'), function (e) { e.classList.remove('printing-active'); });
  });
  document.getElementById('ac-print-work').onclick = function () { printSheet('sheet-worksheet'); };
  document.getElementById('ac-print-curric').onclick = function () { printSheet('sheet-curric'); };
  document.getElementById('ac-print-teacher').onclick = function () { printSheet('sheet-teacher'); };
  document.getElementById('ac-print-cert').onclick = function () { printSheet('sheet-cert'); };

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

  // ---- sandbox board (free-move, no rules) ----
  (function () {
    var host = $('ac-sb'); if (!host) return;
    var GLYPH = { r: '♜', n: '♞', b: '♝', q: '♛', k: '♚', p: '♟', R: '♖', N: '♘', B: '♗', Q: '♕', K: '♔', P: '♙' };
    var board = new Array(64).fill(''), sel = -1;
    function reset() {
      board = new Array(64).fill('');
      var back = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
      for (var f = 0; f < 8; f++) { board[f] = back[f]; board[8 + f] = 'p'; board[48 + f] = 'P'; board[56 + f] = back[f].toUpperCase(); }
      sel = -1; draw();
    }
    function draw() {
      host.innerHTML = '';
      for (var i = 0; i < 64; i++) {
        var rr = (i / 8) | 0, cc = i % 8;
        var cell = document.createElement('div');
        cell.className = 'ac-sb-c ' + (((rr + cc) % 2 === 0) ? 'lt' : 'dk') + (i === sel ? ' sel' : '');
        cell.setAttribute('data-i', i);
        if (board[i]) cell.textContent = GLYPH[board[i]] || '';
        host.appendChild(cell);
      }
    }
    host.addEventListener('click', function (e) {
      var c = e.target.closest('.ac-sb-c'); if (!c) return; var i = +c.getAttribute('data-i'); var hint = $('ac-sb-hint');
      if (sel === -1) { if (board[i]) { sel = i; if (hint) hint.textContent = 'Now tap a destination.'; } }
      else { if (i !== sel) { board[i] = board[sel]; board[sel] = ''; } sel = -1; if (hint) hint.textContent = 'Tap a piece to pick it up.'; }
      draw();
    });
    var rb = $('ac-sb-reset'), cb = $('ac-sb-clear');
    if (rb) rb.onclick = reset;
    if (cb) cb.onclick = function () { board = new Array(64).fill(''); sel = -1; draw(); };
    reset();
  })();

  // ---- class code (local) ----
  (function () {
    var KEY = 'pjcc.academy.class';
    function rnd() { var s = '', a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; for (var i = 0; i < 6; i++) s += a[(Math.random() * a.length) | 0]; return 'CT-' + s; }
    function get() { try { return localStorage.getItem(KEY) || ''; } catch (e) { return ''; } }
    function set(v) { try { if (v) localStorage.setItem(KEY, v); else localStorage.removeItem(KEY); } catch (e) {} }
    var out = $('ac-class-out'); if (!out) return;
    function show() {
      var v = get();
      out.innerHTML = v ? ('In class <b>' + esc(v) + '</b> · <button type="button" class="ac-link-btn" id="ac-class-leave">leave</button>') : '';
      var lv = $('ac-class-leave'); if (lv) lv.onclick = function () { set(''); show(); };
    }
    var gen = $('ac-class-gen'); if (gen) gen.onclick = function () { var code = rnd(); set(code); $('ac-class-join').value = code; out.innerHTML = 'New class code: <b>' + esc(code) + '</b> — hand it to students. '; show(); };
    var sv = $('ac-class-save'); if (sv) sv.onclick = function () { var v = ($('ac-class-join').value || '').trim().toUpperCase(); if (v) { set(v); show(); } };
    show();
  })();

  // ---- progress export / import / summary ----
  (function () {
    function gather() {
      var o = { when: new Date().toISOString(), student: '', data: {} };
      try { o.student = localStorage.getItem('pjcc.academy.student') || ''; } catch (e) {}
      try { for (var k in localStorage) { if (/^pjcc\.(best|skyrun|blindfold|academy)/.test(k)) o.data[k] = localStorage.getItem(k); } } catch (e) {}
      return o;
    }
    var ex = $('ac-export'); if (ex) ex.onclick = function () {
      var blob = new Blob([JSON.stringify(gather(), null, 2)], { type: 'application/json' });
      var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'academy-progress.json'; a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
    };
    var cs = $('ac-copy-sum'); if (cs) cs.onclick = function () {
      var name = '';
      try { name = localStorage.getItem('pjcc.academy.student') || 'Cadet'; } catch (e) { name = 'Cadet'; }
      var belt = ($('ws-belt') ? $('ws-belt').textContent : '');
      var txt = 'PJCC Chess Academy — ' + name + '\n' + belt;
      function ok() { $('ac-export-out').textContent = '✓ summary copied'; setTimeout(function () { $('ac-export-out').textContent = ''; }, 1600); }
      if (navigator.clipboard) navigator.clipboard.writeText(txt).then(ok).catch(ok); else ok();
    };
    var im = $('ac-import'); if (im) im.onchange = function () {
      var f = im.files[0]; if (!f) return; var rd = new FileReader();
      rd.onload = function () {
        try {
          var o = JSON.parse(rd.result);
          if (o && o.data) { for (var k in o.data) localStorage.setItem(k, o.data[k]); if (o.student) localStorage.setItem('pjcc.academy.student', o.student); $('ac-export-out').textContent = '✓ imported — reloading…'; setTimeout(function () { location.reload(); }, 700); }
          else $('ac-export-out').textContent = 'That file did not look right.';
        } catch (e) { $('ac-export-out').textContent = 'Could not read that file.'; }
      };
      rd.readAsText(f);
    };
  })();

  // ---- verify a certificate code ----
  (function () {
    var btn = $('ac-verify-btn'); if (!btn) return;
    btn.onclick = function () {
      var out = $('ac-verify-out');
      var r = window.ACCERT ? ACCERT.verify($('ac-verify-in').value) : null;
      if (!r) { out.className = 'ac-tool-out err'; out.textContent = 'That is not a Checker Town certificate code.'; return; }
      if (!r.valid) { out.className = 'ac-tool-out err'; out.textContent = '⚠ Invalid or altered code — it does not check out.'; return; }
      out.className = 'ac-tool-out ok';
      out.innerHTML = '✅ Valid · <b>' + esc(r.name) + '</b> earned the <b>' + esc(r.belt) + '</b> belt (' + r.done + '/' + r.total + ' lessons) on ' + esc(r.date) + '.';
    };
  })();
})();
</script>

<style>
.ac-hero { text-align: center; max-width: 720px; margin: 0 auto 4px; }
.ac-crest { font-size: 38px; color: #F5C518; line-height: 1; text-shadow: 0 0 22px rgba(245,197,24,0.4); }

/* belt — slimmed 2026-07-13 with everything else on this page */
.ac-belt-wrap { display: flex; flex-wrap: wrap; gap: 14px; align-items: center; background: linear-gradient(135deg,#1f1147,#2d1b69);
  border: 1px solid rgba(245,197,24,0.3); border-radius: var(--r-md); padding: 11px 15px; margin: 12px 0; }
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

/* recommended next — the one loud thing left on the page, and the only one that should be:
   it's the invitation. Everything around it got quieter so this could stay bright. */
.ac-next-card { background: rgba(245,197,24,0.09); border: 1px solid #F5C518; border-radius: var(--r-lg); padding: 14px 16px; margin: 14px 0; box-shadow: 0 0 26px rgba(245,197,24,0.14); }
.ac-next-eyebrow { font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.1em; color: #F5C518; font-weight: 700; margin-bottom: 7px; }
.ac-next-row { display: flex; align-items: center; gap: 12px; }
.ac-next-ico { font-size: 30px; flex: 0 0 auto; }
.ac-next-body { min-width: 0; flex: 1; }
.ac-next-title { font-size: 1rem; font-weight: 800; color: #f0e6ff; }
.ac-next-desc { color: #c9a7ff; font-size: 0.85rem; }
.ac-next-who { color: #9a7fd4; font-size: 0.76rem; margin-top: 2px; }
.ac-next-go { flex: 0 0 auto; background: #F5C518; color: #1a0f3d; font-weight: 800; text-decoration: none;
  border-radius: 999px; padding: 9px 16px; white-space: nowrap; }
.ac-next-go:hover { background: #ffd740; }

/* ── The path: five SMALL halls (2026-07-13) ──────────────────────────────────
   Nate: "make all the boxes small. You should click into the Bootcamp to learn more about
   it." Every hall is the same compact tile — glyph, name, one line, a state chip. The open
   one is a <details>: clicking the tile unfolds the blurb, the teacher and the lessons.
   Closed, the whole path is about the height one card used to be. */
.ac-h2 { color: #F5C518; margin: 24px 0 6px; font-size: 1.15rem; }
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

/* classroom */
.ac-class-intro { color: #c9a7ff; max-width: 720px; }
.ac-class-intro a { color: #F5C518; }
.ac-class-row { display: flex; flex-wrap: wrap; gap: 10px; align-items: flex-end; margin: 12px 0; }
.ac-name-field { display: flex; flex-direction: column; gap: 4px; font-size: 0.78rem; color: #9a7fd4; }
.ac-name-field input { background: #160c33; border: 1px solid #4a2f8a; border-radius: 8px; padding: 9px 12px; color: #f0e6ff;
  font-family: inherit; font-size: 0.95rem; min-width: 200px; }
.ac-print-btn { background: #2D1B69; color: #c9a7ff; border: 1px solid #4a2f8a; border-radius: 999px; padding: 10px 16px;
  cursor: pointer; font-weight: 700; font-family: inherit; }
.ac-print-btn:hover { border-color: #F5C518; color: #fff; }
.ac-print-cert { background: #F5C518; color: #1a0f3d; border-color: #F5C518; }
.ac-print-cert:hover { background: #ffd740; color: #1a0f3d; }

/* printable sheets — hidden on screen */
.ac-print { display: none; color: #111; background: #fff; }
.ws-head { display: flex; justify-content: space-between; font-size: 12px; color: #444; border-bottom: 2px solid #222; padding-bottom: 6px; }
.ws-title { font-size: 24px; margin: 10px 0 4px; color: #1a0f3d; }
.ws-sub { font-size: 13px; color: #333; margin-bottom: 10px; }
.ws-board { display: grid; grid-template-columns: 28px repeat(8, 38px); grid-auto-rows: 38px; margin: 8px 0 14px; }
.ws-cell { display: flex; align-items: center; justify-content: center; font-size: 12px; }
.ws-lab { color: #555; font-weight: bold; }
.ws-light { background: #efe6d2; border: 1px solid #b9a98a; }
.ws-dark { background: #b9986a; border: 1px solid #8a6f48; }
.ws-q { font-size: 14px; line-height: 2; color: #111; }
.ws-foot { font-size: 12px; color: #555; margin-top: 14px; }
.ws-belt { font-weight: bold; margin: 10px 0; }
.ws-course { margin-top: 10px; }
.ws-list { list-style: none; padding-left: 4px; font-size: 13px; line-height: 1.7; }
.ws-list i { color: #666; }
/* certificate */
.ac-cert .cert-border { border: 6px double #b8902a; border-radius: 10px; padding: 30px; text-align: center; max-width: 700px; margin: 0 auto; background: #fffdf5; }
.cert-crest { font-size: 50px; color: #b8902a; }
.cert-academy { font-size: 20px; letter-spacing: 2px; color: #1a0f3d; font-weight: bold; }
.cert-presents { margin-top: 18px; color: #555; }
.cert-name { font-size: 32px; font-weight: bold; color: #1a0f3d; border-bottom: 1px solid #ccc; display: inline-block; padding: 0 24px 4px; margin: 6px 0; }
.cert-has { color: #555; }
.cert-belt { font-size: 26px; color: #b8902a; font-weight: bold; margin: 4px 0; }
.cert-line { font-size: 12px; color: #777; margin-top: 8px; }
.cert-sig { display: flex; justify-content: space-between; margin-top: 26px; font-size: 12px; color: #444; }

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

/* collapsible sections — free-play board · teacher tools */
.ac-fold { background: rgba(45,27,105,0.28); border: 1px solid #3a2a6a; border-radius: 12px; margin: 16px 0; overflow: hidden; }
.ac-fold > summary { list-style: none; cursor: pointer; display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; padding: 14px 18px; }
.ac-fold > summary::-webkit-details-marker { display: none; }
.ac-fold > summary::before { content: '▸'; color: #9a7fd4; align-self: center; transition: transform 0.2s ease; }
.ac-fold[open] > summary::before { transform: rotate(90deg); }
.ac-fold > summary:hover .ac-fold-t { color: #ffd740; }
.ac-fold-t { color: #F5C518; font-weight: 800; font-size: 1.05rem; }
.ac-fold-hint { color: #9a7fd4; font-size: 0.82rem; }
.ac-fold-body { padding: 2px 18px 18px; }
.ac-fold-body > .ac-class-intro:first-child { margin-top: 0; }

/* sandbox board */
.ac-sb-tools { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-bottom: 8px; }
.ac-sb-hint { color: #9a7fd4; font-size: 0.82rem; }
.ac-sb { display: grid; grid-template-columns: repeat(8, 1fr); width: 100%; max-width: 400px; aspect-ratio: 1; border: 2px solid #6b5fa0; border-radius: 6px; overflow: hidden; }
.ac-sb-c { display: flex; align-items: center; justify-content: center; font-size: clamp(18px, 6vw, 30px); cursor: pointer; user-select: none; line-height: 1; }
.ac-sb-c.lt { background: #efe6d2; color: #2a1a06; }
.ac-sb-c.dk { background: #b9986a; color: #1a0f06; }
.ac-sb-c.sel { box-shadow: 0 0 0 3px #6bffb8 inset; }

/* classroom tools */
.ac-tools { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; margin: 12px 0; }
.ac-tool { background: rgba(45,27,105,0.45); border: 1px solid #3a2a6a; border-radius: 12px; padding: 14px; }
.ac-tool-h { color: #F5C518; font-weight: 800; margin-bottom: 4px; }
.ac-tool-p { color: #9a7fd4; font-size: 0.82rem; line-height: 1.5; }
.ac-tool-p code { color: #9fe8ff; }
.ac-muted { color: #7d6bb0; }
.ac-tool-row { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; margin-top: 8px; }
.ac-tool-in { background: #160c33; border: 1px solid #4a2f8a; border-radius: 8px; padding: 8px 10px; color: #f0e6ff; font-family: inherit; font-size: 0.85rem; flex: 1; min-width: 120px; }
.ac-tool-in:focus { outline: none; border-color: #F5C518; }
.ac-tool-out { margin-top: 8px; font-size: 0.84rem; color: #c9a7ff; min-height: 1em; }
.ac-tool-out.ok { color: #6bffb8; }
.ac-tool-out.err { color: #ff8f9e; }
.ac-link-btn { background: none; border: none; color: #ff8fd0; cursor: pointer; font-family: inherit; text-decoration: underline; padding: 0; }
.ac-file-btn { cursor: pointer; }
.ac-verify-in { font-family: 'Courier New', monospace; }

/* certificate code + curriculum table (print) */
.cert-code-wrap { margin-top: 14px; font-size: 11px; color: #777; }
.cert-code { font-family: 'Courier New', monospace; color: #1a0f3d; letter-spacing: 1px; }
.ws-page { page-break-after: always; }
.ws-page:last-child { page-break-after: auto; }
.ws-curric { width: 100%; border-collapse: collapse; font-size: 13px; margin: 10px 0; }
.ws-curric th, .ws-curric td { border: 1px solid #999; padding: 6px 8px; text-align: left; color: #111; }
.ws-curric th { background: #eee; }

@media print {
  body.ac-printing * { visibility: hidden !important; }
  body.ac-printing .ac-print.printing-active, body.ac-printing .ac-print.printing-active * { visibility: visible !important; }
  body.ac-printing .ac-print.printing-active { display: block; position: absolute; left: 0; top: 0; width: 100%; padding: 18px; }
}

/* promotion state — the ladder in Chess City gold. Found, never given. */
body.ac-gold .ac-belt-wrap { background: linear-gradient(135deg,#3a2c07,#5c4708); border-color: rgba(245,197,24,0.75); box-shadow: 0 0 30px rgba(245,197,24,0.18); }
body.ac-gold .ac-belt-label { color: #caa84a; }
body.ac-gold .ac-belt-next { color: #e6d28a; }
body.ac-gold .ac-belt-bar { background: rgba(245,197,24,0.12); border-color: #8a6d10; }
body.ac-gold .ac-belt-fill { background: linear-gradient(90deg,#caa84a,#ffd740); }
body.ac-gold .ac-pip { background: rgba(58,44,7,0.7); border-color: #8a6d10; color: #caa84a; }
body.ac-gold .ac-pip.got { background: #F5C518; border-color: #F5C518; color: #1a0f3d; }
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
