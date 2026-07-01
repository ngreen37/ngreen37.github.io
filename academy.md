---
layout: page
title: Checker Town Chess Academy
permalink: /academy/
---

<link rel="stylesheet" href="{{ '/assets/css/pjcc-profile.css' | relative_url }}">

<div class="ac-hero">
  <div class="ac-crest">♚</div>
  <p class="ac-tagline">Chess, taught by the cast of Checker Town. Earn your belt from <strong>Checker</strong> all the way to <strong>Chess City Citizen</strong> — every lesson is a game you already have.</p>
  <p class="ac-safe">🔒 No sign-up, nothing leaves this device — safe for kids &amp; classrooms. Your progress is read straight from the games you've played.</p>
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
  <div class="ac-next-eyebrow">Your next lesson · chosen from how you've played</div>
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

<!-- ===== Placement exam ===== -->
<div class="ac-place" id="ac-place">
  <div class="ac-place-head">
    <div class="ac-place-lead"><b>New here?</b> A 60-second placement exam points you at the right track.</div>
    <button class="ac-place-start" id="ac-place-start" type="button">Take the exam ▸</button>
  </div>
  <div class="ac-place-quiz" id="ac-place-quiz" hidden></div>
  <div class="ac-place-result" id="ac-place-result" hidden></div>
</div>

<!-- ===== Daily homework ===== -->
<div class="ac-hw" id="ac-hw">
  <div class="ac-hw-flame" id="ac-hw-flame">🔥</div>
  <div class="ac-hw-body">
    <div class="ac-hw-eyebrow">Daily homework · keep the streak alive</div>
    <div class="ac-hw-task" id="ac-hw-task">—</div>
    <div class="ac-hw-status" id="ac-hw-status">—</div>
  </div>
  <a class="ac-hw-go" id="ac-hw-go" href="#">Do it ▸</a>
</div>

<!-- ===== Courses ===== -->
<h2 class="ac-h2">The Faculty &amp; their courses</h2>
<div class="ac-courses" id="ac-courses"></div>

<!-- ===== Skill tree ===== -->
<h2 class="ac-h2">🗺 The Skill Tree</h2>
<p class="ac-class-intro">Lessons unlock as you climb. Start with Auston's Bootcamp; the rest opens from there.</p>
<div class="ac-skilltree" id="ac-skilltree"></div>

<!-- ===== Sandbox board (in-site real-play bridge) ===== -->
<h2 class="ac-h2">♟ The Sandbox Board</h2>
<p class="ac-class-intro">Try a lesson by hand. Tap a piece, then tap where it should go — no rules enforced, just a board to think on. (The games are your graded practice.)</p>
<div class="ac-sb-tools">
  <button class="ac-print-btn" id="ac-sb-reset" type="button">↺ Reset pieces</button>
  <button class="ac-print-btn" id="ac-sb-clear" type="button">⌫ Clear board</button>
  <span class="ac-sb-hint" id="ac-sb-hint">Tap a piece to pick it up.</span>
</div>
<div class="ac-sb" id="ac-sb"></div>

<!-- ===== Classroom mode ===== -->
<h2 class="ac-h2">🏫 Classroom Mode</h2>
<p class="ac-class-intro">For parents and teachers at <a href="{{ '/locations/chess-city-elementary/' | relative_url }}">Chess City Elementary</a> — print a worksheet, hand it out, and track the class. Put the student's name on their certificate and worksheet below.</p>
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
    <p class="ac-tool-p">Teachers: generate a code for your class and hand it out. Students enter it once — it rides along on their worksheet &amp; certificate. <span class="ac-muted">(Local to each device — no accounts.)</span></p>
    <div class="ac-tool-row">
      <button class="ac-print-btn" id="ac-class-gen" type="button">Generate class code</button>
      <input id="ac-class-join" class="ac-tool-in" placeholder="enter a class code" maxlength="12" autocomplete="off">
      <button class="ac-print-btn" id="ac-class-save" type="button">Join</button>
    </div>
    <div class="ac-tool-out" id="ac-class-out"></div>
  </div>
  <div class="ac-tool">
    <div class="ac-tool-h">📊 Progress export</div>
    <p class="ac-tool-p">Save this student's progress as a file, copy a summary for your records, or load a file back in.</p>
    <div class="ac-tool-row">
      <button class="ac-print-btn" id="ac-export" type="button">⬇ Export (.json)</button>
      <button class="ac-print-btn" id="ac-copy-sum" type="button">⧉ Copy summary</button>
      <label class="ac-print-btn ac-file-btn">⬆ Import<input type="file" id="ac-import" accept="application/json" hidden></label>
    </div>
    <div class="ac-tool-out" id="ac-export-out"></div>
  </div>
  <div class="ac-tool">
    <div class="ac-tool-h">✅ Verify a certificate</div>
    <p class="ac-tool-p">Paste a certificate code (the <code>CTA-…</code> line on any printed certificate) to confirm what it certifies. Tamper-evident, checked right here.</p>
    <div class="ac-tool-row">
      <input id="ac-verify-in" class="ac-tool-in ac-verify-in" placeholder="CTA-…" autocomplete="off">
      <button class="ac-print-btn" id="ac-verify-btn" type="button">Verify</button>
    </div>
    <div class="ac-tool-out" id="ac-verify-out"></div>
  </div>
</div>

<!-- ===== Printable sheets (hidden on screen) ===== -->
<div class="ac-print" id="sheet-worksheet">
  <!-- Page 1 — coordinates -->
  <div class="ws-page">
    <div class="ws-head"><span>Checker Town Chess Academy · Worksheet Packet</span><span id="ws-name-1">Name: ____________________</span></div>
    <h1 class="ws-title">1 · Coordinate Quest</h1>
    <p class="ws-sub">The board has 8 files (a–h, left to right) and 8 ranks (1–8, bottom to top). Each square has a name like <b>e4</b>.</p>
    <div class="ws-board" id="ws-board"></div>
    <ol class="ws-q">
      <li>Write the name of the square where the <b>white king</b> starts: ____________</li>
      <li>Name <b>three</b> squares on the <b>e-file</b>: ________  ________  ________</li>
      <li>Name <b>three</b> squares on the <b>4th rank</b>: ________  ________  ________</li>
      <li>A knight on <b>g1</b> can jump to <b>f3</b> or <b>h3</b> or ________ or ________</li>
      <li>Colour the square <b>d5</b>. Is it light or dark? ____________</li>
      <li>Bonus: which two squares are in the <b>corners on White's side</b>? ________ and ________</li>
    </ol>
    <p class="ws-foot">Then play <b>Notation Blitz</b> in the Academy to check your answers at speed!</p>
  </div>
  <!-- Page 2 — how the pieces move -->
  <div class="ws-page">
    <div class="ws-head"><span>Checker Town Chess Academy · Worksheet Packet</span><span>Name: ____________________</span></div>
    <h1 class="ws-title">2 · How the Pieces Move</h1>
    <p class="ws-sub">Draw arrows from each piece to <b>every</b> square it could move to from the centre of an empty board.</p>
    <ol class="ws-q">
      <li>The <b>rook</b> (♖) moves in straight lines. How many squares can it reach from <b>d4</b>? ______</li>
      <li>The <b>bishop</b> (♗) moves on diagonals. What colour squares does a bishop on <b>c1</b> always stay on? ____________</li>
      <li>The <b>queen</b> (♕) moves like a rook <b>and</b> a bishop. From <b>d4</b>, can she reach <b>h8</b>? ______</li>
      <li>The <b>knight</b> (♘) jumps in an L. List all squares a knight on <b>d4</b> can reach: ______________________</li>
      <li>The <b>pawn</b> (♙) moves forward but captures diagonally. From <b>e2</b>, where can it move on its first turn? ____________</li>
      <li>Bonus: which piece can reach <b>every</b> square on the board given enough moves? ____________</li>
    </ol>
    <p class="ws-foot">Practice the knight's jump in <b>Sand Mine Depths</b> and <b>Knight's Tour</b>.</p>
  </div>
  <!-- Page 3 — first tactics -->
  <div class="ws-page">
    <div class="ws-head"><span>Checker Town Chess Academy · Worksheet Packet</span><span>Name: ____________________</span></div>
    <h1 class="ws-title">3 · First Tactics</h1>
    <p class="ws-sub">A <b>fork</b> attacks two pieces at once. A <b>pin</b> traps a piece in front of a more valuable one. A <b>skewer</b> is a pin in reverse.</p>
    <ol class="ws-q">
      <li>What do we call one piece attacking <b>two</b> enemy pieces at the same time? ____________</li>
      <li>Which piece is famous for forking the king and queen with its L-jump? ____________</li>
      <li>If a knight forks the <b>king</b> and a <b>rook</b>, which must move — and what do you win? ____________</li>
      <li>A <b>pin</b> against the <b>king</b> is special because the pinned piece <b>legally cannot</b> ____________.</li>
      <li>Draw a fork: place a white knight so it attacks both kings of a 2-king diagram. (Use the back of the page.)</li>
      <li>Bonus: name the three tactics above in order of how often you think they appear: ____________</li>
    </ol>
    <p class="ws-foot">Then prove it in <b>Fork in the Road</b> — solve 3 to finish the lesson.</p>
  </div>
</div>

<div class="ac-print" id="sheet-teacher">
  <div class="ws-head"><span>Checker Town Chess Academy — Progress Report</span><span id="ws-name-2">Student: ____________________</span></div>
  <h1 class="ws-title">Teacher Progress Sheet</h1>
  <div class="ws-belt" id="ws-belt">Current belt: —</div>
  <div id="ws-checklist"></div>
  <p class="ws-foot">Date: ______________  ·  Instructor signature: ____________________</p>
</div>

<div class="ac-print ac-cert" id="sheet-cert">
  <div class="cert-border">
    <div class="cert-crest">♚</div>
    <div class="cert-academy">Checker Town Chess Academy</div>
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
    <div class="ws-head"><span>Checker Town Chess Academy</span><span>Class: ____________________</span></div>
    <h1 class="ws-title">A 6-Week Curriculum — Teacher Plan</h1>
    <p class="ws-sub">A ready-to-run unit. Each week pairs a short lesson with an in-Academy game and a worksheet page.</p>
    <table class="ws-curric">
      <tr><th>Week</th><th>Focus</th><th>Faculty · Game</th><th>Homework</th></tr>
      <tr><td>1</td><td>The board &amp; coordinates</td><td>Auston · Notation Blitz</td><td>Worksheet 1</td></tr>
      <tr><td>2</td><td>How the pieces move</td><td>Auston · Sand Mine / Knight's Tour</td><td>Worksheet 2</td></tr>
      <tr><td>3</td><td>Openings — the first moves</td><td>Argus · The Pirc Protocol</td><td>Play one line</td></tr>
      <tr><td>4</td><td>Tactics — forks &amp; pins</td><td>The Rival · Fork in the Road</td><td>Worksheet 3 · solve 3</td></tr>
      <tr><td>5</td><td>Strategy — the long game</td><td>The Father · Siege on Chess City</td><td>Play one siege</td></tr>
      <tr><td>6</td><td>Vision &amp; the island</td><td>Princess / Kaede &amp; Matsu · Blindfold · Shogi</td><td>Solve 5 blind</td></tr>
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
  var COURSES = [
    { id: 'fundamentals', who: 'Auston', slug: 'auston', ico: '💣', accent: '#ffd36b',
      title: "Auston's Bootcamp", sub: 'Fundamentals — the board & the pieces',
      blurb: '"You gotta know where everything is before it goes boom." The squares, the files, the ranks.',
      lessons: [
        { t: 'Learn the coordinates', d: 'Play one run of Notation Blitz.', go: 'notation-run', done: function(){ return best('notation-run') >= 1; } },
        { t: 'Read at tempo', d: 'Score 600+ in a Notation Blitz run.', go: 'notation-run', done: function(){ return best('notation-run') >= 600; } },
        { t: 'Coordinates on instinct', d: 'Score 1,200+ in Notation Blitz.', go: 'notation-run', done: function(){ return best('notation-run') >= 1200; } },
        { t: "The knight's geometry", d: 'Make one descent into Sand Mine Depths.', go: 'sand-mine-depths', done: function(){ return best('sand-mine-depths') >= 1; } }
      ] },
    { id: 'openings', who: 'Argus', slug: 'argus', ico: '♘', accent: '#8fe3ff',
      title: "Argus's Opening Repertoire", sub: 'Openings — the first ten moves',
      blurb: 'The loyal guard-dog drills the opening book until it is muscle memory.',
      lessons: [
        { t: 'Play the book', d: 'Complete a line in The Pirc Protocol.', go: 'pirc-protocol', done: function(){ return best('pirc-protocol') >= 1; } },
        { t: 'Know the ideas', d: 'Reach 300+ in The Pirc Protocol.', go: 'pirc-protocol', done: function(){ return best('pirc-protocol') >= 300; } },
        { t: 'Two openings deep', d: 'Reach 700+ — the repertoire takes shape.', go: 'pirc-protocol', done: function(){ return best('pirc-protocol') >= 700; } }
      ] },
    { id: 'tactics', who: 'The Rival', slug: 'rival', ico: '♞', accent: '#ff8fd0',
      title: "The Rival's Tactics Dojo", sub: 'Tactics — forks, pins, skewers, mates',
      blurb: 'The sharp teen from Chess City shows no mercy. Find the move that wins material.',
      lessons: [
        { t: 'First forks', d: 'Solve 3 puzzles in Fork in the Road.', go: 'fork-in-the-road', done: function(){ return best('fork-in-the-road') >= 3; } },
        { t: 'Pins & skewers', d: 'Solve 8 in Fork in the Road.', go: 'fork-in-the-road', done: function(){ return best('fork-in-the-road') >= 8; } },
        { t: 'Tactical storm', d: 'Solve 15 in Fork in the Road.', go: 'fork-in-the-road', done: function(){ return best('fork-in-the-road') >= 15; } },
        { t: 'Blind tactics', d: 'Solve 3 Blindfold Puzzles.', go: 'blindfold-puzzles', done: function(){ return best('blindfold') >= 3; } }
      ] },
    { id: 'vision', who: 'Princess', slug: 'princess', ico: '♛', accent: '#F5C518',
      title: "Princess's Vision Hall", sub: 'Board vision & endgames',
      blurb: 'Princess plays it all in her head. Train the mind’s eye.',
      lessons: [
        { t: 'See without seeing', d: 'Solve 5 Blindfold Puzzles.', go: 'blindfold-puzzles', done: function(){ return best('blindfold') >= 5; } },
        { t: 'Deeper vision', d: 'Solve 12 Blindfold Puzzles.', go: 'blindfold-puzzles', done: function(){ return best('blindfold') >= 12; } },
        { t: "The Mind's Eye", d: 'Beat the CEO in a full blind game.', go: 'blindfold-puzzles', done: function(){ return mindsEyeTrophy(); } },
        { t: 'Island cross-training', d: 'Solve 3 problems on Shogi Island.', go: 'shogi-island', done: function(){ return best('shogi-island') >= 3; } }
      ] },
    { id: 'strategy', who: 'The Father', slug: 'father', ico: '🧰', accent: '#9fe8ff',
      title: "The Father's Long Game", sub: 'Strategy — plans, structure & the long view',
      blurb: 'Dad seems scattered, but nobody plans further ahead. Think in plans, not just moves.',
      lessons: [
        { t: 'Hold the line', d: 'Play a round of Siege on Chess City.', go: 'tower-defense', done: function(){ return best('tower-defense') >= 1; } },
        { t: 'Plan the route', d: 'Complete a Knight\'s Tour.', go: 'knights-tour', done: function(){ return best('knights-tour') >= 1; } },
        { t: 'Take the long way', d: 'Fly a run of Sky Run.', go: 'sky-run', done: function(){ return best('sky-run') >= 1; } },
        { t: 'Weigh the risk', d: 'Make a call in Checker Financial.', go: 'checker-financial', done: function(){ return best('checker-financial') >= 1; } }
      ] },
    { id: 'shogi', who: 'Kaede & Matsu', slug: 'kaede', ico: '⛩', accent: '#ffb066',
      title: 'The Shogi Dojo', sub: 'The island game — shogi',
      blurb: 'The siblings run the island\'s game — Kaede in the hall, Matsu on the island. Auston, their very first student, trains right beside you.',
      lessons: [
        { t: 'Catch the Lion', d: 'Win once on Shogi Island.', go: 'shogi-island', done: function(){ return best('shogi-island') >= 1; } },
        { t: 'Drops & reach', d: 'Solve 3 on Shogi Island.', go: 'shogi-island', done: function(){ return best('shogi-island') >= 3; } },
        { t: "Sensei's challenge", d: 'Solve 6 on Shogi Island.', go: 'shogi-island', done: function(){ return best('shogi-island') >= 6; } }
      ] }
  ];

  var BELTS = [
    { n: 'Checker', ico: '⛂', need: 0 },
    { n: 'Pawn', ico: '♙', need: 3 },
    { n: 'Knight', ico: '♘', need: 7 },
    { n: 'Bishop', ico: '♗', need: 11 },
    { n: 'Rook', ico: '♖', need: 15 },
    { n: 'Queen', ico: '♕', need: 19 },
    { n: 'Chess City Citizen', ico: '♚', need: 22 }
  ];

  // ---- progress ----
  function allLessons() { var a = []; COURSES.forEach(function(c){ c.lessons.forEach(function(l){ a.push({ c: c, l: l }); }); }); return a; }
  function doneCount() { var n = 0; allLessons().forEach(function(x){ if (x.l.done()) n++; }); return n; }
  function beltFor(n) { var b = BELTS[0]; for (var i = 0; i < BELTS.length; i++) if (n >= BELTS[i].need) b = BELTS[i]; return b; }
  function nextBelt(n) { for (var i = 0; i < BELTS.length; i++) if (n < BELTS[i].need) return BELTS[i]; return null; }

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
      document.getElementById('ac-belt-next').innerHTML = '🎓 <b>Graduated</b> — you are a Chess City Citizen!';
    }
    // ladder
    var lad = document.getElementById('ac-belt-ladder'); lad.innerHTML = '';
    BELTS.forEach(function(b){
      var got = done >= b.need;
      var pip = document.createElement('span');
      pip.className = 'ac-pip' + (got ? ' got' : '') + (b.n === belt.n ? ' cur' : '');
      pip.title = b.n + (got ? ' ✓' : ' · ' + b.need + ' lessons');
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
      document.getElementById('ac-next-title').textContent = 'You have completed every lesson.';
      document.getElementById('ac-next-desc').textContent = 'Print your Chess City Citizen certificate below — then keep your skills sharp on the leaderboards.';
      document.getElementById('ac-next-who').innerHTML = 'The whole faculty salutes you.';
      document.getElementById('ac-next-go').href = '{{ "/leaderboards/" | relative_url }}';
      document.getElementById('ac-next-go').textContent = 'Leaderboards ▸';
    }

    // courses
    var cw = document.getElementById('ac-courses'); cw.innerHTML = '';
    COURSES.forEach(function(c){
      var cdone = c.lessons.filter(function(l){ return l.done(); }).length;
      var el = document.createElement('div'); el.className = 'ac-course'; el.style.setProperty('--acc', c.accent);
      var lessonsHtml = c.lessons.map(function(l){
        var ok = l.done();
        return '<li class="ac-lesson' + (ok ? ' done' : '') + '">' +
          '<span class="ac-check">' + (ok ? '✓' : '▢') + '</span>' +
          '<span class="ac-lesson-txt"><b>' + esc(l.t) + '</b><small>' + esc(l.d) + '</small></span>' +
          '<a class="ac-lesson-go" href="' + gameUrl(l.go) + '">play ▸</a></li>';
      }).join('');
      el.innerHTML =
        '<div class="ac-course-head">' +
          '<div class="ac-course-ico">' + c.ico + '</div>' +
          '<div><div class="ac-course-title">' + esc(c.title) + '</div>' +
          '<div class="ac-course-sub">' + esc(c.sub) + '</div></div>' +
          '<button class="ac-intro-btn" type="button" data-who="' + esc(c.who) + '" data-say="' + esc(c.blurb) + '" aria-label="Hear ' + esc(c.who) + '\'s intro">▶</button>' +
          '<div class="ac-course-prog">' + cdone + '/' + c.lessons.length + '</div>' +
        '</div>' +
        '<p class="ac-course-blurb">' + esc(c.blurb) + ' <a href="' + charUrl(c.slug) + '">Meet ' + esc(c.who) + ' →</a></p>' +
        '<ul class="ac-lessons">' + lessonsHtml + '</ul>';
      cw.appendChild(el);
    });

    // teacher checklist + belt
    var tc = document.getElementById('ws-checklist'); tc.innerHTML = '';
    document.getElementById('ws-belt').textContent = 'Current belt: ' + belt.n + '  (' + done + ' / ' + total + ' lessons complete)';
    COURSES.forEach(function(c){
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

    // skill tree
    renderSkillTree();
  }

  // ---- branching skill tree (prereqs / unlocks) ----
  function courseDone(c) { return c.lessons.filter(function (l) { return l.done(); }).length; }
  function renderSkillTree() {
    var host = document.getElementById('ac-skilltree'); if (!host) return;
    var dm = {}; COURSES.forEach(function (c) { dm[c.id] = courseDone(c); });
    var f = dm.fundamentals || 0, t2 = (dm.openings || 0) + (dm.tactics || 0), t3 = (dm.strategy || 0) + (dm.vision || 0);
    var gate = {
      fundamentals: { open: true }, openings: { open: f >= 1, by: "Start Auston's Bootcamp" },
      tactics: { open: f >= 1, by: "Start Auston's Bootcamp" }, strategy: { open: t2 >= 2, by: '2 lessons in Openings/Tactics' },
      vision: { open: t2 >= 2, by: '2 lessons in Openings/Tactics' }, shogi: { open: t3 >= 2, by: '2 lessons in Strategy/Vision' }
    };
    var tiers = [['fundamentals'], ['openings', 'tactics'], ['strategy', 'vision'], ['shogi']];
    function node(id) {
      var c = COURSES.filter(function (x) { return x.id === id; })[0]; if (!c) return '';
      var g = gate[id], done = dm[id], tot = c.lessons.length, complete = done >= tot;
      var cls = 'ac-node ' + (g.open ? (complete ? 'complete' : 'open') : 'locked');
      return '<div class="' + cls + '" style="--acc:' + c.accent + '"><div class="ac-node-ico">' + (g.open ? c.ico : '🔒') + '</div>' +
        '<div class="ac-node-name">' + esc(c.who) + '</div>' +
        '<div class="ac-node-sub">' + (g.open ? (done + '/' + tot + (complete ? ' ✓' : '')) : 'Locked') + '</div>' +
        (g.open ? '' : '<div class="ac-node-by">' + esc(g.by) + '</div>') + '</div>';
    }
    var html = '';
    tiers.forEach(function (row, ri) {
      html += '<div class="ac-tree-row">' + row.map(node).join('') + '</div>';
      html += '<div class="ac-tree-link">↓</div>';
    });
    var ad = doneCount(), tot = allLessons().length;
    html += '<div class="ac-tree-row"><div class="ac-node ac-node-cap ' + (ad >= tot ? 'complete' : 'locked') + '">' +
      '<div class="ac-node-ico">' + (ad >= tot ? '♚' : '🔒') + '</div><div class="ac-node-name">Chess City Citizen</div>' +
      '<div class="ac-node-sub">' + ad + '/' + tot + '</div></div></div>';
    host.innerHTML = html;
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
  function best(game) { try { if (window.PJCC && PJCC.localBest) return PJCC.localBest(game); return parseInt(localStorage.getItem('pjcc.best.' + game), 10) || 0; } catch (e) { return 0; } }
  function gameUrl(slug) { return '{{ "/games/" | relative_url }}'.replace(/\/$/, '') + '/' + slug + '/'; }

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

  // ---- placement exam ----
  var QS = [
    { q: 'Where does the White king start the game?', a: ['e1', 'd1', 'e8', 'a1'], c: 0 },
    { q: 'Which piece jumps in an "L" shape?', a: ['Bishop', 'Knight', 'Rook', 'Pawn'], c: 1 },
    { q: 'A bishop moves along…', a: ['Files', 'Ranks', 'Diagonals', 'L-shapes'], c: 2 },
    { q: 'Attacking two pieces with one move is a…', a: ['Pin', 'Skewer', 'Fork', 'Castle'], c: 2 },
    { q: 'Is the square d5 light or dark?', a: ['Light', 'Dark'], c: 0 },
    { q: 'On Shogi Island, captured pieces…', a: ['Leave play', 'Switch to your side', 'Become pawns', 'Double in value'], c: 1 }
  ];
  var pStart = $('ac-place-start');
  if (pStart) pStart.onclick = function () {
    var quiz = $('ac-place-quiz'), res = $('ac-place-result'); res.hidden = true; quiz.hidden = false; pStart.style.display = 'none';
    quiz.innerHTML = QS.map(function (q, i) {
      return '<div class="ac-pq"><div class="ac-pq-q">' + (i + 1) + '. ' + esc(q.q) + '</div><div class="ac-pq-a">' +
        q.a.map(function (opt, j) { return '<button type="button" class="ac-pq-opt" data-q="' + i + '" data-j="' + j + '">' + esc(opt) + '</button>'; }).join('') + '</div></div>';
    }).join('') + '<button type="button" class="ac-place-start" id="ac-place-submit">See my placement ▸</button>';
    var picks = {};
    Array.prototype.forEach.call(quiz.querySelectorAll('.ac-pq-opt'), function (o) {
      o.onclick = function () {
        var qi = o.getAttribute('data-q'); picks[qi] = +o.getAttribute('data-j');
        Array.prototype.forEach.call(quiz.querySelectorAll('.ac-pq-opt[data-q="' + qi + '"]'), function (x) { x.classList.remove('sel'); });
        o.classList.add('sel');
      };
    });
    $('ac-place-submit').onclick = function () {
      var score = 0; QS.forEach(function (q, i) { if (picks[i] === q.c) score++; });
      var path = score <= 2 ? { t: "Start with Auston's Bootcamp", d: 'Lock in the board and pieces first.', go: 'notation-run' }
        : score <= 4 ? { t: "Jump to Argus & the Rival", d: 'You know the basics — build openings and tactics.', go: 'pirc-protocol' }
        : { t: "Straight to Princess's Vision Hall", d: 'Strong start! Train board vision and the endgame.', go: 'blindfold-puzzles' };
      try { localStorage.setItem('pjcc.academy.placement', JSON.stringify({ score: score, when: Date.now() })); } catch (_) {}
      quiz.hidden = true; res.hidden = false;
      res.innerHTML = '<div class="ac-place-score">You scored ' + score + ' / ' + QS.length + '</div>' +
        '<div class="ac-place-rec"><b>' + esc(path.t) + '</b><br>' + esc(path.d) + '</div>' +
        '<a class="ac-place-start" href="' + gameUrl(path.go) + '">Begin ▸</a> ' +
        '<button type="button" class="ac-print-btn" id="ac-place-redo">Retake</button>';
      $('ac-place-redo').onclick = function () { res.hidden = true; pStart.style.display = ''; };
    };
  };

  // ---- daily homework (feeds a streak flame) ----
  (function () {
    var TASKS = [
      { t: 'Score 600+ in Notation Blitz', go: 'notation-run', ok: function () { return best('notation-run') >= 600; } },
      { t: 'Solve 5 in Fork in the Road', go: 'fork-in-the-road', ok: function () { return best('fork-in-the-road') >= 5; } },
      { t: 'Reach 300+ in The Pirc Protocol', go: 'pirc-protocol', ok: function () { return best('pirc-protocol') >= 300; } },
      { t: 'Solve 3 Blindfold Puzzles', go: 'blindfold-puzzles', ok: function () { return best('blindfold') >= 3; } },
      { t: 'Win once on Shogi Island', go: 'shogi-island', ok: function () { return best('shogi-island') >= 1; } },
      { t: 'Play a round of Siege on Chess City', go: 'tower-defense', ok: function () { return best('tower-defense') >= 1; } },
      { t: "Complete a Knight's Tour", go: 'knights-tour', ok: function () { return best('knights-tour') >= 1; } }
    ];
    function ds(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
    function today() { return ds(new Date()); }
    function yday() { var d = new Date(); d.setDate(d.getDate() - 1); return ds(d); }
    function seed(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
    function load() { try { return JSON.parse(localStorage.getItem('pjcc.academy.hw')) || {}; } catch (e) { return {}; } }
    function save(o) { try { localStorage.setItem('pjcc.academy.hw', JSON.stringify(o)); } catch (e) {} }
    var task = TASKS[seed(today()) % TASKS.length];
    var flame = $('ac-hw-flame'), tEl = $('ac-hw-task'), sEl = $('ac-hw-status'), go = $('ac-hw-go');
    if (!tEl) return;
    tEl.textContent = 'Today: ' + task.t; go.href = gameUrl(task.go);
    function refresh() {
      var st = load(), doneToday = st.last === today();
      if (!doneToday && task.ok()) { st.streak = (st.last === yday()) ? (st.streak || 0) + 1 : 1; st.last = today(); save(st); doneToday = true; }
      var streak = doneToday ? (st.streak || 1) : (st.last === yday() ? (st.streak || 0) : 0);
      flame.textContent = doneToday ? '🔥' : '🪵'; flame.style.opacity = doneToday ? 1 : 0.5;
      sEl.innerHTML = doneToday
        ? '<b style="color:#6bffb8">Done ✓</b> · ' + (st.streak || 1) + '-day streak ' + ((st.streak || 1) >= 3 ? '🔥' : '')
        : 'Not done yet · streak ' + (streak || 0) + (streak ? '' : ' — start one today!');
    }
    refresh();
    document.addEventListener('visibilitychange', function () { if (!document.hidden) refresh(); });
  })();

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
      var txt = 'Checker Town Chess Academy — ' + name + '\n' + belt;
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
.ac-hero { text-align: center; max-width: 720px; margin: 0 auto 10px; }
.ac-crest { font-size: 54px; color: #F5C518; line-height: 1; text-shadow: 0 0 22px rgba(245,197,24,0.4); }
.ac-tagline { color: #c9a7ff; font-size: 1.05rem; line-height: 1.6; }
.ac-tagline strong { color: #F5C518; }
.ac-safe { color: #8a72c0; font-size: 0.82rem; margin-top: 4px; }

/* belt */
.ac-belt-wrap { display: flex; flex-wrap: wrap; gap: 18px; align-items: center; background: linear-gradient(135deg,#1f1147,#2d1b69);
  border: 1px solid rgba(245,197,24,0.3); border-radius: 14px; padding: 16px 20px; margin: 16px 0; }
.ac-belt-now { display: flex; align-items: center; gap: 12px; }
.ac-belt-ico { font-size: 40px; color: #F5C518; line-height: 1; }
.ac-belt-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; color: #9a7fd4; }
.ac-belt-name { font-size: 1.4rem; font-weight: 800; color: #f0e6ff; }
.ac-belt-bar-wrap { flex: 1 1 260px; min-width: 240px; }
.ac-belt-next { font-size: 0.85rem; color: #c9a7ff; margin-bottom: 6px; }
.ac-belt-next b { color: #F5C518; }
.ac-belt-bar { height: 10px; background: rgba(157,127,212,0.16); border: 1px solid #4a2f8a; border-radius: 999px; overflow: hidden; }
.ac-belt-fill { height: 100%; width: 0; background: linear-gradient(90deg,#6b5fa0,#F5C518); transition: width 0.9s ease; }
.ac-belt-ladder { display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap; }
.ac-pip { width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%;
  background: rgba(20,12,45,0.6); border: 1px solid #3a2a6a; color: #7d6bb0; font-size: 15px; }
.ac-pip.got { color: #1a0f3d; background: #F5C518; border-color: #F5C518; }
.ac-pip.cur { box-shadow: 0 0 0 2px #ff8fd0; }

/* recommended next */
.ac-next-card { background: rgba(245,197,24,0.07); border: 1px solid #F5C518; border-radius: 14px; padding: 14px 18px; margin: 16px 0; }
.ac-next-eyebrow { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; color: #F5C518; margin-bottom: 8px; }
.ac-next-row { display: flex; align-items: center; gap: 14px; }
.ac-next-ico { font-size: 38px; flex: 0 0 auto; }
.ac-next-body { min-width: 0; flex: 1; }
.ac-next-title { font-size: 1.15rem; font-weight: 800; color: #f0e6ff; }
.ac-next-desc { color: #c9a7ff; font-size: 0.9rem; }
.ac-next-who { color: #9a7fd4; font-size: 0.82rem; margin-top: 2px; }
.ac-next-go { flex: 0 0 auto; background: #F5C518; color: #1a0f3d; font-weight: 800; text-decoration: none;
  border-radius: 999px; padding: 10px 18px; white-space: nowrap; }
.ac-next-go:hover { background: #ffd740; }

/* courses */
.ac-h2 { color: #F5C518; margin: 28px 0 10px; }
.ac-courses { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px; }
.ac-course { background: rgba(45,27,105,0.5); border: 1px solid #3a2a6a; border-left: 4px solid var(--acc, #F5C518); border-radius: 12px; padding: 14px 16px; }
.ac-course-head { display: flex; align-items: center; gap: 10px; }
.ac-course-ico { font-size: 28px; color: var(--acc); width: 36px; text-align: center; }
.ac-course-title { font-weight: 800; color: #f0e6ff; }
.ac-course-sub { font-size: 0.78rem; color: #9a7fd4; }
.ac-course-prog { margin-left: auto; font-family: 'Courier New', monospace; font-weight: 800; color: var(--acc); }
.ac-course-blurb { color: #c9a7ff; font-size: 0.86rem; line-height: 1.5; margin: 8px 0; }
.ac-course-blurb a { color: var(--acc); white-space: nowrap; }
.ac-lessons { list-style: none; padding: 0; margin: 6px 0 0; }
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

/* intro voice button */
.ac-intro-btn { background: transparent; border: 1px solid var(--acc, #6b5fa0); color: var(--acc, #c9a7ff); border-radius: 999px; width: 30px; height: 30px; cursor: pointer; font-size: 0.8rem; flex: 0 0 auto; margin-left: auto; }
.ac-intro-btn:hover { background: var(--acc, #F5C518); color: #1a0f3d; }
.ac-intro-btn.playing { animation: acPulse 0.9s ease; }
@keyframes acPulse { 0% { box-shadow: 0 0 0 0 rgba(245,197,24,0.5); } 100% { box-shadow: 0 0 0 12px rgba(245,197,24,0); } }
.ac-course-head .ac-course-prog { margin-left: 8px; }

/* placement exam */
.ac-place { background: rgba(45,27,105,0.4); border: 1px solid #3a2a6a; border-radius: 12px; padding: 14px 16px; margin: 14px 0; }
.ac-place-head { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.ac-place-lead { color: #cfc3ee; flex: 1; }
.ac-place-lead b { color: #F5C518; }
.ac-place-start { display: inline-block; background: #F5C518; color: #1a0f3d; font-weight: 800; border: none; border-radius: 999px; padding: 9px 16px; cursor: pointer; font-family: inherit; text-decoration: none; }
.ac-place-start:hover { background: #ffd740; }
.ac-place-quiz { margin-top: 12px; display: grid; gap: 10px; }
.ac-pq-q { color: #f0e6ff; font-weight: 600; margin-bottom: 6px; }
.ac-pq-a { display: flex; gap: 6px; flex-wrap: wrap; }
.ac-pq-opt { background: #221444; border: 1px solid #4a2f8a; color: #c9a7ff; border-radius: 8px; padding: 7px 12px; cursor: pointer; font-family: inherit; }
.ac-pq-opt:hover { border-color: #F5C518; }
.ac-pq-opt.sel { background: #6bffb8; color: #06210f; border-color: #6bffb8; font-weight: 700; }
.ac-place-result { margin-top: 12px; }
.ac-place-score { color: #9a7fd4; font-size: 0.85rem; }
.ac-place-rec { color: #f0e6ff; margin: 6px 0 10px; }
.ac-place-rec b { color: #F5C518; }

/* daily homework */
.ac-hw { display: flex; align-items: center; gap: 14px; background: linear-gradient(135deg,#2a1a1a,#2d1b69); border: 1px solid #6a4a1a; border-radius: 12px; padding: 12px 16px; margin: 14px 0; }
.ac-hw-flame { font-size: 34px; flex: 0 0 auto; }
.ac-hw-body { flex: 1; min-width: 0; }
.ac-hw-eyebrow { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em; color: #ffb066; }
.ac-hw-task { color: #f0e6ff; font-weight: 700; }
.ac-hw-status { color: #9a7fd4; font-size: 0.82rem; }
.ac-hw-go { flex: 0 0 auto; background: #ffb066; color: #1a0f3d; font-weight: 800; text-decoration: none; border-radius: 999px; padding: 9px 16px; white-space: nowrap; }
.ac-hw-go:hover { background: #ffc98a; }

/* skill tree */
.ac-skilltree { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.ac-tree-row { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
.ac-tree-link { color: #4a3a78; font-size: 1.1rem; line-height: 1; }
.ac-node { width: 130px; background: rgba(45,27,105,0.5); border: 1px solid #3a2a6a; border-top: 3px solid var(--acc, #6b5fa0); border-radius: 10px; padding: 10px; text-align: center; }
.ac-node.locked { opacity: 0.55; border-top-color: #4a3a78; }
.ac-node.complete { box-shadow: 0 0 0 1px var(--acc) inset; }
.ac-node-ico { font-size: 24px; }
.ac-node-name { color: #f0e6ff; font-weight: 700; font-size: 0.9rem; }
.ac-node-sub { color: #9a7fd4; font-size: 0.75rem; }
.ac-node-by { color: #7d6bb0; font-size: 0.68rem; margin-top: 3px; }
.ac-node-cap { border-top-color: #F5C518; }

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
</style>
