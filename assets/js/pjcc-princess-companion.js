/* ============================================================================
   PJCC · Princess — the site-wide companion (Avenue 6).
   The little walking figurine grows a voice: she crosses the screen now and
   then, pauses to say something that fits WHERE you are, WHEN it is, and what
   you've done together (via PJCCPrincess.summary()). Click her any time and
   she'll talk. Device-local, offline, no dependencies beyond pjcc-princess.js.
   ========================================================================== */
(function () {
  "use strict";

  var walker = document.getElementById('princess-walker');
  var fig = document.getElementById('princess-3d');
  if (!walker) return;

  // ---- helpers ----
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]; }); }
  function pick(a) { return a[(Math.random() * a.length) | 0]; }
  function summary() { try { return (window.PJCCPrincess && PJCCPrincess.summary) ? PJCCPrincess.summary() : null; } catch (e) { return null; } }
  function shushed() { try { return sessionStorage.getItem('pjcc.princess.shush') === '1'; } catch (e) { return false; } }
  function shush() { try { sessionStorage.setItem('pjcc.princess.shush', '1'); } catch (e) {} }
  function saidOnce(id) { try { return localStorage.getItem('pjcc.princess.said.' + id) === '1'; } catch (e) { return false; } }
  function markOnce(id) { try { localStorage.setItem('pjcc.princess.said.' + id, '1'); } catch (e) {} }

  // ---- where are we? ----
  function area() {
    var p = location.pathname;
    if (p === '/' || p === '') return 'home';
    if (p.indexOf('/games') === 0 || p.indexOf('/game') === 0) return 'games';
    if (p.indexOf('/characters') === 0) return 'characters';
    if (p.indexOf('/production') === 0) return 'production';
    if (p.indexOf('/writers-room') === 0) return 'writers';
    if (p.indexOf('/sound') === 0 || p.indexOf('/soundtrack') === 0) return 'sound';
    if (p.indexOf('/academy') === 0 || p.indexOf('/chess-lessons') === 0) return 'academy';
    if (p.indexOf('/dossier') === 0) return 'dossier';
    if (p.indexOf('/press-pass') === 0) return 'press';
    if (p.indexOf('/locations') === 0 || p.indexOf('/world') === 0) return 'world';
    if (p.indexOf('/lore-codex') === 0 || p.indexOf('/classified') === 0 || p.indexOf('/archive') === 0) return 'lore';
    if (p.indexOf('/blog') === 0 || p.indexOf('/daily') === 0) return 'blog';
    return 'generic';
  }
  var AREA_LINES = {
    home:       ['Welcome home. I kept your spot warm.', 'The whole sky used to fall here. Now it’s just us.'],
    games:      ['Play one for me? I learn the game when you do.', 'Beat your best — I’ll watch from the corner.'],
    characters: ['That’s the whole gang. I’m the one with the tail.', 'Careful — some of them aren’t as nice as me.'],
    production: ['You’re really making the show. I’m in it, you know.', 'Storyboards! That panel’s my good side.'],
    writers:    ['Writing a story? Put me in a brave part.', '“But,” or “therefore” — never “and then.” I listen.'],
    sound:      ['Press my theme. Go on — I sound regal.', 'Everyone gets a little tune. Mine’s the best one.'],
    academy:    ['Chess class! Sit. Stay. Fork the queen.', 'Teach me an opening, I’ll teach you to fetch.'],
    dossier:    ['Your dossier. I sniffed it — very official.', 'Clearance granted. I vouched for you.'],
    press:      ['You’d put your name in the credits? Beside mine?', 'Backing the show makes you a producer, basically.'],
    world:      ['Chess City’s out past the water. We’ll get there.', 'I can smell the sea from here. Storm coming.'],
    lore:       ['Some files even I’m not cleared for. Don’t tell.', 'Subject Zero… that one makes my fur stand up.'],
    blog:       ['Reading the dev-log? It’s mostly about me.', 'Day by day. We’re further than we were.'],
    generic:    ['You, me, a checkered floor. Perfect.', 'Wherever you’re going, I’m coming too.']
  };

  // ---- when is it? ----
  function premiereDays() { var t = Date.UTC(2027, 9, 21, 4, 0, 0); return Math.max(0, Math.ceil((t - Date.now()) / 86400000)); }
  function holidayLine() {
    var d = new Date(), m = d.getMonth(), day = d.getDate();
    if (m === 11 && day >= 20) return 'Nearly winter — the sea’s too rough to cross. Cocoa instead?';
    if (m === 9 && day === 31) return 'Spooky night. I’ll protect you — from the comfy chair.';
    if (m === 0 && day <= 3) return 'New year. New games to learn. Let’s go.';
    if (m === 1 && day === 14) return 'Today I love you the normal amount: enormously.';
    return null;
  }

  var IDLE = [
    'I found a stick shaped like a rook. I’m keeping it.',
    'Knight to f3. …I’ve been practicing.',
    'If you scroll, I’ll chase the bar. Kidding. Mostly.',
    'I’d follow you to Chess City and back.',
    'Naptime was a tactical retreat, not a nap.',
    'Did you know my tail keeps perfect tempo?'
  ];

  // ---- assemble a contextual line ----
  var last = '';
  function build(trigger) {
    var sum = summary();
    var bag = [];           // each: { id?, text, link?, linkText?, w }
    function add(text, w, opts) { bag.push({ text: text, w: w || 1, link: opts && opts.link, linkText: opts && opts.linkText, id: opts && opts.id }); }

    // area-aware (heavier on click, where intent is local)
    var al = AREA_LINES[area()] || AREA_LINES.generic;
    add(pick(al), trigger === 'click' ? 4 : 2);

    if (sum) {
      // walk reminder
      if (!sum.walkedToday) add('Got a minute? I’d love a walk.', 3, { link: '/characters/princess/', linkText: 'walk me ›' });
      // training state
      if (sum.learnedCount === 0) add('Teach me something? Play a game and I’ll learn it.', 3, { link: '/games/', linkText: 'pick a game ›' });
      else if (!saidOnce('rank-' + sum.rank)) add('I’m a ' + sum.rank + ' now. All because of you.', 5, { id: 'rank-' + sum.rank });
      else add('I’m a ' + sum.rank + '. We make a good team.', 1);
      // streak
      if (sum.walkStreak > 2) add(sum.walkStreak + ' days running — you always come back. I notice.', 2);
      // loyalty / time
      if (sum.daysSince >= 7) add('You’ve been around ' + sum.daysSince + ' days now. I remember the first one.', 1);
      // a memory resurfaces
      if (sum.lastMemory) add('“' + sum.lastMemory + '”', 2);
    }

    // time + season (more on spontaneous)
    if (trigger !== 'click' && window.PJCCPrincess && PJCCPrincess.greeting) add(PJCCPrincess.greeting(), 2);
    var hol = holidayLine(); if (hol) add(hol, 3);
    var pd = premiereDays(); if (pd > 0 && Math.random() < 0.5) add(pd + ' days till the premiere. I’m counting too.', 1);

    // charming filler
    add(pick(IDLE), trigger === 'click' ? 1 : 2);

    // weight + avoid immediate repeat + respect once-only
    var pool = [];
    bag.forEach(function (b) {
      if (b.id && saidOnce(b.id)) return;
      if (b.text === last) return;
      for (var i = 0; i < b.w; i++) pool.push(b);
    });
    if (!pool.length) pool = bag.length ? bag : [{ text: pick(IDLE), w: 1 }];
    var chosen = pool[(Math.random() * pool.length) | 0];
    if (chosen.id) markOnce(chosen.id);
    last = chosen.text;
    return chosen;
  }

  // ---- bubble ----
  injectCSS();
  var bubble = document.createElement('div');
  bubble.className = 'pw-bubble';
  walker.appendChild(bubble);
  var hideT = null;

  function hide() {
    bubble.classList.remove('show');
    walker.style.animationPlayState = '';   // resume the stroll
  }
  function speak(line) {
    if (!line) return;
    bubble.innerHTML = '<button class="pw-shh" aria-label="shush">×</button>' + esc(line.text) +
      (line.link ? ' <a class="pw-link" href="' + line.link + '">' + esc(line.linkText || '›') + '</a>' : '');
    bubble.querySelector('.pw-shh').onclick = function (e) { e.stopPropagation(); hide(); shush(); };
    bubble.classList.add('show');
    if (fig) { fig.classList.remove('is-cheering'); void fig.offsetWidth; fig.classList.add('is-cheering'); }
    if (walker.classList.contains('is-walking')) walker.style.animationPlayState = 'paused'; // stop to talk
    clearTimeout(hideT);
    hideT = setTimeout(hide, Math.min(8000, 3600 + line.text.length * 45));
  }
  function talk(trigger) { speak(build(trigger)); }

  // click her any time
  walker.addEventListener('click', function (e) {
    if (e.target.closest('.pw-link')) return;          // let the link work
    e.preventDefault();
    talk('click');
  });

  // ---- the stroll ----
  var nextT = null, midT = null;
  function walk() {
    clearTimeout(midT);
    walker.classList.remove('is-walking'); void walker.offsetWidth;
    walker.style.animationPlayState = '';
    walker.classList.add('is-walking');
    // a chance she stops mid-stroll to say something
    if (!shushed() && Math.random() < 0.75) {
      midT = setTimeout(function () { talk('idle'); }, (4 + Math.random() * 5) * 1000);
    }
  }
  walker.addEventListener('animationend', function (e) {
    if (e.animationName !== 'pawn-walk') return;       // ignore the infinite bob
    walker.classList.remove('is-walking');
    hide();
    scheduleNext();
  });
  function scheduleNext() { clearTimeout(nextT); nextT = setTimeout(walk, (75 + Math.random() * 90) * 1000); }

  // first appearance shortly after load
  setTimeout(walk, 8000);

  function injectCSS() {
    if (document.getElementById('pw-bubble-css')) return;
    var css = document.createElement('style'); css.id = 'pw-bubble-css';
    css.textContent =
      '.pw-bubble{position:absolute;left:50%;bottom:108%;transform:translateX(-50%) translateY(6px);' +
      'min-width:150px;max-width:230px;background:#1a1030;border:1px solid #F5C518;border-radius:12px;' +
      'padding:9px 12px;color:#f0e6ff;font-size:0.8rem;line-height:1.4;text-align:left;' +
      'box-shadow:0 6px 22px rgba(0,0,0,0.5),0 0 18px rgba(245,197,24,0.2);' +
      'opacity:0;pointer-events:none;transition:opacity .25s,transform .25s;z-index:9001;}' +
      '.pw-bubble.show{opacity:1;transform:translateX(-50%) translateY(0);pointer-events:auto;}' +
      '.pw-bubble::after{content:"";position:absolute;top:100%;left:50%;transform:translateX(-50%);' +
      'border:7px solid transparent;border-top-color:#F5C518;}' +
      '.pw-bubble .pw-link{color:#F5C518;font-weight:700;white-space:nowrap;}' +
      '.pw-shh{position:absolute;top:2px;right:5px;background:none;border:none;color:#7d6bb0;' +
      'font-size:0.9rem;line-height:1;cursor:pointer;padding:2px;}' +
      '.pw-shh:hover{color:#ff8fd0;}' +
      '@media (max-width:520px){.pw-bubble{max-width:180px;font-size:0.74rem;}}';
    document.head.appendChild(css);
  }
})();
