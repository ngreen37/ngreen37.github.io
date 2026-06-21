/* ============================================================================
   PJCC · Princess companion — a relationship that grows with how you play.
   - Train Princess: your games teach HER chess; she levels up + comments.
   - Daily ritual: walk her once a day for a seeded micro-story + a bond bump.
   - Memory: she remembers your milestones and brings them up later.
   - Reactive: greets by time of day, reacts to your training level.
   All device-local (localStorage) + offline. PJCC is optional (used for day stamp).
   Usage:  PJCCPrincess.render(document.getElementById('princess-panel'))
   ========================================================================== */
window.PJCCPrincess = (function () {
  var KEY = 'pjcc.princess.v1';
  function dayStamp(d) {
    if (window.PJCC && PJCC.dayStamp && !d) return PJCC.dayStamp();
    d = d || new Date();
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }
  function yesterday() { var d = new Date(); d.setDate(d.getDate() - 1); return dayStamp(d); }
  function load() { try { var s = JSON.parse(localStorage.getItem(KEY)); if (s && typeof s.bond === 'number') return s; } catch (e) {}
    return { bond: 8, walks: 0, lastWalk: '', walkStreak: 0, firstSeen: dayStamp(), seen: {} }; }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
  function best(g) { try { if (window.PJCC && PJCC.localBest) return PJCC.localBest(g); return parseInt(localStorage.getItem('pjcc.best.' + g), 10) || 0; } catch (e) { return 0; } }
  function mindsEye() { try { var s = JSON.parse(localStorage.getItem('pjcc.blindfold.v2')); return !!(s && s.trophy); } catch (e) { return false; } }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]; }); }

  // ---- Training: milestones in your games teach her specific skills ----
  var MILESTONES = [
    { id: 'coords',   xp: 12, on: function () { return best('notation-run') >= 1; },    learned: 'the names of every square', mem: 'You taught me to read the board. I never forget a square now.' },
    { id: 'tempo',    xp: 16, on: function () { return best('notation-run') >= 1200; },  learned: 'to read the board at a sprint', mem: 'You read coordinates faster than I can fetch. Show-off.' },
    { id: 'forks',    xp: 14, on: function () { return best('fork-in-the-road') >= 3; }, learned: 'the fork', mem: 'My first fork! Two pieces, one move. You showed me that.' },
    { id: 'rival',    xp: 20, on: function () { return best('fork-in-the-road') >= 12; },learned: 'to out-calculate the Rival', mem: 'You finally out-foxed the Rival. I watched the whole thing.' },
    { id: 'openings', xp: 16, on: function () { return best('pirc-protocol') >= 300; },  learned: 'real openings from Argus', mem: 'Argus says my openings are sharp now. All your doing.' },
    { id: 'vision',   xp: 16, on: function () { return best('blindfold') >= 5; },        learned: 'to see the board with my eyes closed', mem: 'I can hold the whole board in my head now. Like you.' },
    { id: 'ceo',      xp: 30, on: function () { return mindsEye(); },                    learned: 'to beat the CEO blindfolded', mem: 'You beat the CEO with no board at all. I never doubted you.' },
    { id: 'island',   xp: 16, on: function () { return best('shogi-island') >= 3; },     learned: 'the island’s game, shogi', mem: 'You learned shogi on the island. Even I haven’t managed that.' },
    { id: 'mine',     xp: 10, on: function () { return best('sand-mine-depths') >= 1; }, learned: 'the knight’s strange leap', mem: 'Down in the mine you taught me the knight’s jump. Tricky.' },
    { id: 'siege',    xp: 12, on: function () { return best('tower-defense') >= 1; },     learned: 'to hold a line under siege', mem: 'We held the gates of Chess City together. I felt brave.' }
  ];
  var RANKS = [
    { min: 0,  t: 'Curious Pup' }, { min: 20, t: 'Checker Cadet' }, { min: 40, t: 'Pawn Pupil' },
    { min: 64, t: 'Knight Apprentice' }, { min: 90, t: 'Bishop Adept' }, { min: 118, t: 'Rook Scholar' },
    { min: 150, t: "Queen’s Equal" }, { min: 184, t: 'Grandmaster Hound' }
  ];
  function trainXP() { var x = 0; MILESTONES.forEach(function (m) { if (m.on()) x += m.xp; }); return x; }
  function rankFor(x) { var r = RANKS[0]; for (var i = 0; i < RANKS.length; i++) if (x >= RANKS[i].min) r = RANKS[i]; return r; }
  function nextRank(x) { for (var i = 0; i < RANKS.length; i++) if (x < RANKS[i].min) return RANKS[i]; return null; }

  var STORIES = [
    'You take the long way past the bank. Princess insists on greeting every single teller.',
    'A chess piece has wandered off the board again. Princess herds it home, very proud of herself.',
    'You walk to the edge of Checker Town and look toward Chess City. Princess leans into your leg.',
    'Princess finds a stick shaped almost exactly like a rook. She will not be parted from it.',
    'The two of you practice the knight’s move on the sidewalk squares. She nails it on the third try.',
    'A cool wind off the sea. Princess sniffs the air toward Shogi Island, ears up.',
    'Princess naps in a sunbeam between games, paws twitching through an imaginary checkmate.',
    'You teach her "stay" using two pawns as markers. She stays. Mostly.'
  ];
  function greeting() {
    var h = new Date().getHours();
    if (h < 6) return 'Up late? Princess is too — she kept your spot warm.';
    if (h < 12) return 'Morning! Princess has already done three laps of Checker Town.';
    if (h < 18) return 'Afternoon. Princess perks up the second she sees you.';
    return 'Evening. Princess trots over, tail going like a metronome.';
  }
  function fnv(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  function render(el) {
    if (!el) return;
    var s = load();
    var today = dayStamp();
    var xp = trainXP(), rank = rankFor(xp), next = nextRank(xp);

    // detect newly-earned memories
    var fresh = [];
    MILESTONES.forEach(function (m) { if (m.on() && !s.seen[m.id]) { s.seen[m.id] = today; fresh.push(m); } });
    if (fresh.length) save(s);

    var walkedToday = s.lastWalk === today;
    var storyIdx = fnv(today) % STORIES.length;
    var pct = next ? Math.round((xp - rank.min) / (next.min - rank.min) * 100) : 100;

    var memList = MILESTONES.filter(function (m) { return s.seen[m.id]; });

    el.innerHTML =
      '<div class="pp-card">' +
        '<div class="pp-greet">' + esc(greeting()) + '</div>' +

        '<div class="pp-train">' +
          '<div class="pp-train-head"><span class="pp-rank">♞ ' + esc(rank.t) + '</span>' +
            '<span class="pp-xp">' + (next ? ('next: ' + esc(next.t)) : 'fully trained!') + '</span></div>' +
          '<div class="pp-bar"><i style="width:' + Math.max(4, pct) + '%"></i></div>' +
          '<div class="pp-train-note">Your games are teaching Princess chess. She has learned <b>' + memList.length + '</b> of ' + MILESTONES.length + ' skills.</div>' +
        '</div>' +

        '<div class="pp-bond"><span>❤ Bond</span><div class="pp-bar pp-bond-bar"><i style="width:' + Math.max(4, Math.min(100, s.bond)) + '%"></i></div>' +
          '<span class="pp-walks">' + s.walks + ' walks' + (s.walkStreak > 1 ? ' · 🔥' + s.walkStreak + '' : '') + '</span></div>' +

        '<div class="pp-walk" id="pp-walk">' +
          (walkedToday
            ? '<div class="pp-story">🦮 <b>Today’s walk:</b> ' + esc(STORIES[storyIdx]) + '</div><div class="pp-walk-done">You’ve walked Princess today. She’s content. Come back tomorrow.</div>'
            : '<button class="pp-walk-btn" id="pp-walk-btn">🦮 Walk Princess</button><span class="pp-walk-hint">Once a day — a moment together (+bond).</span>') +
        '</div>' +

        (fresh.length
          ? '<div class="pp-fresh">✨ <b>Princess just learned something:</b><br>' + fresh.map(function (m) { return '“' + esc(m.mem) + '”'; }).join('<br>') + '</div>'
          : '') +

        '<div class="pp-mem">' +
          '<div class="pp-mem-head">🧠 Princess remembers</div>' +
          (memList.length
            ? '<ul>' + memList.map(function (m) { return '<li>' + esc(m.mem) + '</li>'; }).join('') + '</ul>'
            : '<p class="pp-mem-empty">Play the games and Princess will start learning — and remembering — alongside you.</p>') +
        '</div>' +
      '</div>';

    var btn = document.getElementById('pp-walk-btn');
    if (btn) btn.onclick = function () {
      var st = load();
      st.walkStreak = (st.lastWalk === yesterday()) ? (st.walkStreak + 1) : 1;
      st.walks += 1; st.lastWalk = dayStamp(); st.bond = Math.min(100, st.bond + 4);
      save(st);
      render(el);
    };
  }

  // ---- compact state for the site-wide companion (no DOM) ----
  function daysBetween(a, b) {
    try { var da = new Date(a + 'T00:00:00'), db = new Date(b + 'T00:00:00');
      return Math.max(0, Math.round((db - da) / 86400000)); } catch (e) { return 0; }
  }
  function summary() {
    var s = load(); var today = dayStamp();
    var xp = trainXP(), rank = rankFor(xp), next = nextRank(xp);
    var learned = MILESTONES.filter(function (m) { return m.on(); });
    var memList = MILESTONES.filter(function (m) { return s.seen[m.id]; });
    return {
      bond: s.bond, walks: s.walks, walkStreak: s.walkStreak,
      walkedToday: s.lastWalk === today,
      rank: rank.t, nextRank: next ? next.t : null,
      learnedCount: learned.length, totalSkills: MILESTONES.length,
      lastMemory: memList.length ? memList[memList.length - 1].mem : null,
      daysSince: daysBetween(s.firstSeen || today, today)
    };
  }

  return { render: render, summary: summary, greeting: greeting };
})();
