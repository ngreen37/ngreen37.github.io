/* pjcc-board3d.js — THE TILTED 3D BOARD AND THE TV CUTS in the site's chess rooms, as Checker Town's tables have them
 * (ui/board3d.gd and ui/chess_table.gd; his 11-04: "tv-style camera cuts next, then tilted 3d chess board", and of the
 * rooms: "add them there too"). A LENS over the room's own flat board: it draws the position the room drew, in his
 * Blender pieces (assets/models/pieces3d, npm run gen:pieces3d), and a press on it is pressed on the flat board's
 * square, so the room's own code plays every move. "Board: Flat" (V) is a device preference; 3D until it is pressed.
 * ⚠ IF WebGL, THE BUNDLE OR A MODEL IS MISSING THE ROOM IS LEFT AS AUTHORED: flat, and still cut.
 * ⚠ THE NUMBERS ARE THE GAME'S (TILT, FOV, CUTS, CARD_AFTER, the heights): tests/board3d.check.js diffs them.
 *
 *   var b3 = PJCCBoard3D.mount({
 *     board: function () { return document.querySelector('.pt-board'); },   // the flat board now (rooms redraw it)
 *     read:  function () { return { b: S.b, flip: !white, last: [from, to], sel: i, dots: [...], check: i } },
 *                                          // also: turn, mate, hint: [...], quiet (no cuts), woods: { lt, dk, frame }
 *     press: function (i) { ... },        // optional: the default clicks the square [data-sq=i] / [data-i=i]
 *     into:  false,                       // a canvas room: true, and it draws b3.drawInto(ctx, x, y, w, h) itself
 *     onCut: function (kind) { ... },     // a cut began (its kind) or ended (''): a room's own clock stops and starts
 *     inert: false,                       // a board that is watched, not played: every press goes through to the room
 *   });
 * Squares are the referee's: 0 is a8, 63 is h1. Pieces are its letters (P white, p black). */
(function () {
  'use strict';
  var me = document.currentScript;
  var BASE = me ? me.src.replace(/js\/pjcc-board3d\.js.*$/, '') : '/assets/';
  var LIB = BASE + 'vendor/three/three.pjcc.min.js';
  var MODELS = BASE + 'models/pieces3d/';

  // ── the game's numbers (ui/board3d.gd, ui/chess_table.gd) ──
  var SQ = 1.0;
  var TILT = 54.0;                 // degrees the camera looks down from the horizon
  var FOV = 24.0;                  // ⚠ a long lens: a short one drew the near pieces squat and the far ones as poles
  var EDGE = 0.95;                 // how much of the view the board fills, at its widest or tallest
  var TALLEST = 1.52;              // the far rank's king, which the view must not cut off
  var SIZE = 1.06;                 // his pieces' canon heights (King 1.43) to the board's squares
  var ARC = 0.6;                   // how high a moving piece rises, in squares, at its longest
  var TOPPLE = 0.32;               // seconds a taken piece takes to fall
  var SLIDE = 0.16;                // seconds a move takes to cross the board
  var CARD_AFTER = 0.5;            // a mate's cut holds the game's card this long, and no longer
  var CUTS = {
    capture: { secs: 0.40, zoom: 1.30, turn: 0.0, circle: 0.0 },
    check: { secs: 0.45, zoom: 1.22, turn: 0.0, circle: 0.0 },
    mate: { secs: 1.60, zoom: 1.40, turn: 0.06, circle: 0.35 },
  };
  var TALL = { K: 1.43, Q: 1.30, B: 1.34, N: 1.278, R: 0.86, P: 0.97 };
  var CODES = ['wP', 'bP', 'wB', 'bB', 'K', 'Q', 'R', 'N'];
  var KEY = 'pjcc.board.flat';

  // ── WHOEVER SITS ACROSS, THE ROOM'S LIGHT, AND THEIR ANSWER TO YOUR MOVE (his 11-05 view ideas #1, #4, #5; of the
  //    rooms, 11-10: "yes on the website port"). The game's numbers: ui/table_seat.gd, ui/chess_table.gd, ui/board3d.gd,
  //    games/chess/table_judge.gd; their looks off people/people_sheet.gd, a dog off people/dog.gd. ──
  var SEAT_TALL = 2.4;             // squares from the board's top to the top of their head
  var SEAT_BACK = 0.6;             // squares behind the frame's far edge
  var SEAT_TOP = 0.109;            // of the picture, above their head
  var SEAT_WAIST = 0.5;            // of the picture, where the frame's far edge crosses them
  var SEAT_KEEP = 0.6;             // of the picture drawn, fading out from the waist down to here
  var SEAT_STRIPS = 5;
  var LEAN = 0.05, LEAN_SECS = 0.35, BREATH_SECS = 3.0;
  var BUILD_TALLEST = 1.06;        // the tallest build's head, which the view keeps in (TownPeople.TALL)
  var DOG_UP = 0.95, SIT_TALL = 36.0;
  // ⭐ PLACEHOLDERS, HIS TO CRAFT: [seconds, sink, hop, shake, light]
  var REACT = { frown: [0.8, 0.05, 0.0, 0.02, 0.8], smile: [0.7, 0.0, 0.05, 0.0, 1.0] };
  var FAR = 4 * SQ + 0.45;         // the frame's far edge
  var MOOD_FULL = 500, MOOD_RATE = 0.8, MOOD_GLOW = 0.45, MOOD_LAMP = 0.3, MOOD_GOLD = 'f5c518', MOOD_COLD = '3d6fd6';
  var VAL = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 }, SWING = 150, KING_AT = 10000;
  var FRONT = 384, IDLES = 4;
  var PEOPLE = BASE + 'models/people_front.png';     // the game's own picture (npm run gen:people)
  var AURA = { maxwell: '2ecc71', nate: '6bffb8', dad: '40e0d0', robert: 'b07bff', auston: 'ff6b6b', brother: 'c9ff6b', ceo: 'f5c518' };
  var OWN = { 'Puzzle Champ': 'f5c518', Kaede: 'e8927f', Matsu: '7fb28a', Murphy: 'c8b98a', 'White Knight': 'eef0f4' };
  var LOOKS = {};
  var HAIRS = ['1f1a17', '3f2a1a', '6b4526', '8c4023', 'cfa962', '9e9e99', 'dcdcd6'];
  var WIDE = [0.95, 0.03], TALLB = [0.94, 0.03];
  var COATS = { Princess: ['f0b9cf', '6b3a52', 'ff8fd0', false], Milo: ['f2efe8', '24201c', 'd8463a', true],
    Argus: ['a9824f', '3a2a1a', '3d5a7a', false] };

  function hex3(h) { return [0, 2, 4].map(function (i) { return parseInt(h.slice(i, i + 2), 16) / 255; }); }
  function rgbaOf(c, a) { return 'rgba(' + Math.round(c[0] * 255) + ',' + Math.round(c[1] * 255) + ',' + Math.round(c[2] * 255) + ',' + a.toFixed(3) + ')'; }
  function moveToward(a, b, d) { return a + Math.max(-d, Math.min(d, b - a)); }
  function frameIndex(phase, of) { var w = Math.floor(phase * of); return ((w % of) + of) % of; }
  function sideOf(p) { return p ? (p === p.toUpperCase() ? 'w' : 'b') : ''; }

  // ── the judge: the material, settled by the side to move's best capture (TableJudge, no search) ──
  var KNJ = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
  var KGJ = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
  var DIAG = [[-1, -1], [-1, 1], [1, -1], [1, 1]], ORTH = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  function onb(r, f) { return r >= 0 && r < 8 && f >= 0 && f < 8; }
  function material(b, side) {
    var s = 0;
    for (var i = 0; i < 64; i++) if (b[i]) s += VAL[b[i].toLowerCase()] * (sideOf(b[i]) === side ? 1 : -1);
    return s;
  }
  // the cheapest of `by`'s pieces attacking `sq`: its value, KING_AT for the king alone, or -1 for none
  function leastAttacker(b, sq, by) {
    var r = (sq / 8) | 0, f = sq % 8, pr = r + (by === 'w' ? 1 : -1), pw = by === 'w' ? 'P' : 'p', i, d, nr, nf;
    for (i = -1; i <= 1; i += 2) if (onb(pr, f + i) && b[pr * 8 + f + i] === pw) return VAL.p;
    var best = -1, kn = by === 'w' ? 'N' : 'n';
    for (i = 0; i < KNJ.length; i++) {
      nr = r + KNJ[i][0]; nf = f + KNJ[i][1];
      if (onb(nr, nf) && b[nr * 8 + nf] === kn) { best = VAL.n; break; }
    }
    for (var k = 0; k < 2; k++) {
      var slider = k === 0 ? 'b' : 'r', dirs = k === 0 ? DIAG : ORTH;
      for (i = 0; i < dirs.length; i++) {
        d = dirs[i]; nr = r + d[0]; nf = f + d[1];
        while (onb(nr, nf)) {
          var x = b[nr * 8 + nf];
          if (x) {
            var xl = x.toLowerCase();
            if (sideOf(x) === by && (xl === slider || xl === 'q') && (best < 0 || VAL[xl] < best)) best = VAL[xl];
            break;
          }
          nr += d[0]; nf += d[1];
        }
      }
    }
    if (best >= 0) return best;
    var kg = by === 'w' ? 'K' : 'k';
    for (i = 0; i < KGJ.length; i++) {
      nr = r + KGJ[i][0]; nf = f + KGJ[i][1];
      if (onb(nr, nf) && b[nr * 8 + nf] === kg) return KING_AT;
    }
    return -1;
  }
  // the most `by` wins with one capture, the recapture counted
  function bestCapture(b, by) {
    var C = window.PJCCChess, foe = by === 'w' ? 'b' : 'w', best = 0;
    for (var sq = 0; sq < 64; sq++) {
      var p = b[sq];
      if (!p || sideOf(p) !== foe || p.toLowerCase() === 'k') continue;
      var a = leastAttacker(b, sq, by);
      if (a < 0) continue;
      var held = !!(C && C.isAttacked(b, sq, foe));
      if (a === KING_AT && held) continue;
      var v = VAL[p.toLowerCase()];
      best = Math.max(best, held ? v - a : v);
    }
    return best;
  }
  // yours minus theirs once the side to move has made its best capture: what the light follows
  function settled(b, turn, side) {
    var m = material(b, side), g = bestCapture(b, turn);
    return turn === side ? m + g : m - g;
  }
  // your move, as whoever sits across sees it: "frown" it won you something, "smile" it gave something away or lets
  // them mate. ⚠ The lens knows the squares and the turn: castling rights and en passant are not the room's to read here.
  function verdict(before, after, turn, side) {
    var C = window.PJCCChess;
    if (!C) return '';
    var S = { b: after, turn: turn, cast: { K: false, Q: false, k: false, q: false }, ep: -1, half: 0, full: 1 };
    var theirs = C.legalMoves(S);
    if (!theirs.length) return '';
    for (var i = 0; i < theirs.length; i++) {
      var s2 = C.makeMove(S, theirs[i]);
      if (C.inCheck(s2, side) && C.legalMoves(s2).length === 0) return 'smile';
    }
    var d = settled(after, turn, side) - material(before, side);
    return d >= SWING ? 'frown' : d <= -SWING ? 'smile' : '';
  }
  // the light for a score, -1 to 1: a pawn up already shows, a rook up is all of it
  function moodOf(cp) { var w = Math.sqrt(Math.min(Math.abs(cp) / MOOD_FULL, 1)); return cp > 0 ? w : -w; }
  function lampOf(w) {
    var t = Math.abs(w) * MOOD_LAMP, to = hex3(w > 0 ? MOOD_GOLD : MOOD_COLD);
    return [1 + (to[0] - 1) * t, 1 + (to[1] - 1) * t, 1 + (to[2] - 1) * t];
  }

  // ── their looks, worked out from the name as the town works them out (TownPeople.look_of), never rolled ──
  function salt(s) { var h = 7; Array.from(s).forEach(function (ch) { h = (h * 31 + ch.codePointAt(0)) % 100003; }); return h; }
  function fromHsv(h, s, v) {
    var i = Math.floor(h * 6), f = h * 6 - i, p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
    return [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][((i % 6) + 6) % 6];
  }
  function hsvOf(c) {
    var mx = Math.max(c[0], c[1], c[2]), mn = Math.min(c[0], c[1], c[2]), d = mx - mn, h = 0;
    if (d > 0) {
      h = mx === c[0] ? (c[1] - c[2]) / d : mx === c[1] ? 2 + (c[2] - c[0]) / d : 4 + (c[0] - c[1]) / d;
      h /= 6; if (h < 0) h += 1;
    }
    return [h, mx > 0 ? d / mx : 0, mx];
  }
  function lookOf(who, key) {
    var set = LOOKS[who] || {};
    var shirt = set.shirt ? hex3(set.shirt) : AURA[key] ? hex3(AURA[key]) : OWN[who] ? hex3(OWN[who])
      : fromHsv((salt(who) % 360) / 360, 0.55, 0.88);
    var hs = hsvOf(shirt);
    var cap = set.cap ? hex3(set.cap) : fromHsv(hs[0], Math.min(0.75, Math.max(0.45, hs[1] + 0.15)), 0.40);
    var hair = hex3(set.hair || HAIRS[salt(who + 'hair') % HAIRS.length]);
    var bs = salt(who + 'build');
    return { shirt: shirt, cap: cap, hair: hair,
      build: [set.wide != null ? +set.wide : WIDE[0] + (bs % 5) * WIDE[1], set.tall != null ? +set.tall : TALLB[0] + (Math.floor(bs / 7) % 5) * TALLB[1]] };
  }
  // the dress shader's own hue (TownPeople.DRESS to_hsv)
  function shaderHsv(r, g, b) {
    var p = g >= b ? [g, b, 0, -1 / 3] : [b, g, -1, 2 / 3];
    var q = r >= p[0] ? [r, p[1], p[2], p[0]] : [p[0], p[1], p[3], r];
    var d = q[0] - Math.min(q[3], q[1]);
    return [Math.abs(q[2] + (q[3] - q[1]) / (6 * d + 1e-10)), d / (q[0] + 1e-10), q[0]];
  }
  // ⭐ DRESSED AS THE TOWN DRESSES THEM: the shirt, the cap and the hair swapped by their baked color, the shading kept
  function dressSheet(img, look) {
    var c = document.createElement('canvas');
    c.width = img.naturalWidth || img.width; c.height = img.naturalHeight || img.height;
    var g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(img, 0, 0);
    var d = g.getImageData(0, 0, c.width, c.height), px = d.data, to = null, m = 0;
    for (var i = 0; i < px.length; i += 4) {
      if (!px[i + 3]) continue;
      var k = shaderHsv(px[i] / 255, px[i + 1] / 255, px[i + 2] / 255);
      if (k[0] > 0.58 && k[0] < 0.72 && k[1] > 0.18) { to = look.shirt; m = Math.min(1.5, Math.max(0.2, k[2] / 0.42)); }
      else if (k[0] > 0.13 && k[0] < 0.22 && k[1] > 0.25) { to = look.hair; m = k[2] / 0.52; }
      else if (k[1] < 0.22 && k[2] < 0.45) { to = look.cap; m = 0.45 + 2 * k[2]; }
      else continue;
      px[i] = Math.min(255, Math.round(to[0] * m * 255)); px[i + 1] = Math.min(255, Math.round(to[1] * m * 255));
      px[i + 2] = Math.min(255, Math.round(to[2] * m * 255));
    }
    g.putImageData(d, 0, 0);
    return c;
  }
  var peopleP = null;
  function people() {
    if (!peopleP) peopleP = new Promise(function (ok, bad) {
      var im = new Image();
      im.onload = function () { ok(im); };
      im.onerror = function () { peopleP = null; bad(new Error('could not load ' + PEOPLE)); };
      im.src = PEOPLE;
    });
    return peopleP;
  }
  // ⭐ A DOG ACROSS THE BOARD IS THE DOG (TownDog.paint_front): facing you, paws on the far edge. ⚠ NO TONGUE, EVER.
  function paintFront(g, who, at, s, look, up) {
    var c = COATS[who], body = '#' + c[0], edge = '#' + c[1], b3 = hex3(c[0]);
    function circle(x, y, r, col) { g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
    function rect(x, y, w, h, col) { g.fillStyle = col; g.fillRect(x, y, w, h); }
    g.save(); g.translate(at[0], at[1]); g.scale(s, s);
    circle(0, -23, 12.5, body);
    if (c[3]) { circle(-6.5, -29.5, 2.6, edge); circle(6, -31, 2.0, edge); }
    rect(-8.5, -22, 17, 3.2, '#' + c[2]);
    [-16, 10].forEach(function (x) { rect(x, -23, 6, 23.5, body); rect(x + 1.7, -2.4, 0.7, 2.6, edge); rect(x + 3.6, -2.4, 0.7, 2.6, edge); });
    [-1, 1].forEach(function (sx) {
      g.fillStyle = edge; g.beginPath();
      g.moveTo(sx * 5, -19 - up * 2); g.lineTo(sx * 14, -15 - up * 6); g.lineTo(sx * 11.5, -3 - up * 8); g.closePath(); g.fill();
    });
    circle(0, -10.5, 10.2, body);
    if (c[3]) [-1, 1].forEach(function (sx) { circle(sx * 4.6, -13, 4.4, edge); });
    circle(0, -4.6, 5.2, rgbaOf(b3.map(function (v) { return v + (1 - v) * 0.22; }), 1));
    circle(0, -2.4, 2.3, edge);
    var lx = look[0], ly = look[1], ll = Math.hypot(lx, ly);
    if (ll > 0.9) { lx *= 0.9 / ll; ly *= 0.9 / ll; }
    [-1, 1].forEach(function (sx) { circle(sx * 4.6, -13, 2.3, '#fbf7ef'); circle(sx * 4.6 + lx, -13 + ly, 1.4, edge); });
    g.restore();
  }

  // ── the device's preference, and reduced motion ──
  var reduceMq = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : null;
  function calm() {
    return !!(reduceMq && reduceMq.matches) || document.documentElement.classList.contains('reduce-flourish');
  }
  function flat() { try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; } }
  function setFlat(on) {
    try { if (on) localStorage.setItem(KEY, '1'); else localStorage.removeItem(KEY); } catch (e) {}
    boards.forEach(function (b) { b.layout(); b.touch(); });
  }
  var boards = [];
  // ⚠ A CUT PAUSES A ROOM'S OWN CLOCK (the room asks this): a cut costs nobody time
  function cutting() { return boards.some(function (b) { return !!b.cut; }); }

  // ── three.js and his models, each fetched once ──
  var libP = null, modelP = null;
  function lib() {
    if (window.PJCC3) return Promise.resolve(window.PJCC3);
    if (!libP) libP = new Promise(function (ok, bad) {
      var s = document.createElement('script');
      s.src = LIB; s.async = true;
      s.onload = function () { window.PJCC3 ? ok(window.PJCC3) : bad(new Error('PJCC3 missing after ' + LIB)); };
      s.onerror = function () { libP = null; bad(new Error('could not load ' + LIB)); };
      document.head.appendChild(s);
    });
    return libP;
  }
  function models(T) {
    if (!modelP) modelP = Promise.all(CODES.map(function (c) {
      return new Promise(function (ok, bad) {
        new T.GLTFLoader().load(MODELS + c + '.glb', function (g) { ok([c, g.scene]); }, undefined, bad);
      });
    })).then(function (list) {
      var out = {};
      list.forEach(function (p) { out[p[0]] = p[1]; });
      return out;
    });
    return modelP;
  }
  function webgl() {
    try {
      var c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
    } catch (e) { return false; }
  }

  function smooth(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }
  function token(el, name, dflt) {
    var v = el ? getComputedStyle(el).getPropertyValue(name).trim() : '';
    return v || dflt;
  }

  // ════════════════════════════════════════════════════════════════════════════════════════════════════════════
  // ⚠ THE CUTS AND THE FLAT BOARD'S CAMERA NEED NO three.js: a room without WebGL, or whose models did not come, is
  // still cut. attach() gives the board its 3D parts when they arrive.
  function Board(opts) {
    this.o = opts; this.T = null; this.M = null;
    this.flip = false; this.b = null; this.key = '';
    this.pieces = {};              // room square -> { node, code }
    this.falling = []; this.flying = null; this.squash = null; this.cut = null; this.cutAfter = null;
    this.live = 0; this.dist = 30; this.size = [2, 2];
    // whoever sits across, how they sit, and the room's light (drawn on their own canvas, under the board's picture)
    this.seatWho = ''; this.seatKey = ''; this.dog = false; this.seatBuild = [1, 1]; this.look = null; this.dressed = null;
    this.breath = 0; this.lean = 0; this.leanTo = 0; this.act = ''; this.actT = 0; this.face = '';
    this.mood = 0; this.moodTo = 0; this.cell = -1; this.seatDirty = true; this.seatDrawn = '';
    this.scv = document.createElement('canvas');
    this.scv.className = 'pjcc-board3d-seat';
    this.scv.setAttribute('aria-hidden', 'true');
    this.scv.style.cssText = 'position:absolute;z-index:2;pointer-events:none;';
    var self = this;
    // ⚠ A PRESS IS READ THROUGH THE CAMERA, THEN THE CUT ENDS: the click lands on the square drawn under the finger
    document.addEventListener('click', function () { if (self.cut) setTimeout(function () { self.endCut(); }, 0); }, true);
  }
  var P = Board.prototype;

  P.attach = function (T, M) {
    var opts = this.o;
    if (!document.getElementById('pjcc-b3-style')) {
      var st = document.createElement('style');
      st.id = 'pjcc-b3-style'; st.textContent = STYLE;
      document.head.appendChild(st);
    }
    this.T = T; this.M = M; this.aimV = new T.Vector3();
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var cv = document.createElement('canvas');
    cv.className = 'pjcc-board3d';
    cv.setAttribute('aria-hidden', 'true');
    this.canvas = cv;
    var r = new T.WebGLRenderer({ canvas: cv, alpha: true, antialias: true, preserveDrawingBuffer: !!opts.into });
    r.outputColorSpace = T.SRGBColorSpace;
    r.toneMapping = T.NoToneMapping;
    r.setPixelRatio(dpr);
    r.shadowMap.enabled = true;
    r.shadowMap.type = T.PCFShadowMap;
    this.r = r;
    var sc = new T.Scene();
    this.scene = sc;
    this.cam = new T.PerspectiveCamera(FOV, 1, 0.1, 400);
    // ⚠ THE LIGHTS WERE SAMPLED, NOT EYEBALLED: a lit square comes out the flat board's own wood
    var amb = new T.AmbientLight(0xffffff, AMB);
    var key = new T.DirectionalLight(0xffffff, KEYI);
    key.position.set(-0.38, 0.79, 0.49).multiplyScalar(20);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    var sc2 = key.shadow.camera;
    sc2.left = -7; sc2.right = 7; sc2.top = 7; sc2.bottom = -7; sc2.near = 1; sc2.far = 50;
    key.shadow.bias = -0.0006;
    var fill = new T.DirectionalLight(0xffffff, FILLI);
    fill.position.set(0.526, 0.574, -0.627).multiplyScalar(20);
    sc.add(amb, key, fill);
    this.keyL = key;
    this.root = new T.Group(); sc.add(this.root);
    this.marks = new T.Group(); sc.add(this.marks);
    this.skins = { w: skin(M, 'w', T), b: skin(M, 'b', T) };
    var self = this;
    if (!opts.into) {
      cv.style.cssText = 'position:absolute;z-index:2;touch-action:manipulation;cursor:pointer;';
      // a board that is watched, not played (the Duel), lets every press through to the room
      if (opts.inert) { cv.style.pointerEvents = 'none'; cv.style.cursor = ''; }
      else cv.addEventListener('click', function (e) { self.onPress(e); });
    }
    this.size = [2, 2]; this.boardKey = ''; this.key = '';
    this.sync(); this.layout(); this.touch();
  };
  var AMB = 1.3, KEYI = 2.1, FILLI = 0.35;

  function skin(M, side, T) {
    var m = null;
    ['B', 'P'].some(function (L) {
      var g = M[side + L];
      if (!g) return false;
      g.traverse(function (n) { if (!m && n.isMesh && n.material) m = n.material; });
      return !!m;
    });
    return m || new T.MeshStandardMaterial({ color: side === 'w' ? 0xe8e2b4 : 0x2a1f1c, roughness: 0.5 });
  }

  P.view = function (i) { var c = i % 8, r = (i / 8) | 0; return this.flip ? [7 - c, 7 - r] : [c, r]; };
  P.unview = function (c, r) { return this.flip ? (7 - r) * 8 + (7 - c) : r * 8 + c; };
  P.world = function (i) { var v = this.view(i); return new this.T.Vector3((v[0] - 3.5) * SQ, 0, (v[1] - 3.5) * SQ); };
  function back(orbit) {
    var t = TILT * Math.PI / 180;
    return { x: Math.sin(orbit) * Math.cos(t), y: Math.sin(t), z: Math.cos(orbit) * Math.cos(t) };
  }
  function code(p) { return (p === p.toUpperCase() ? 'w' : 'b') + p.toUpperCase(); }
  function tall(c) { return (TALL[c.charAt(1)] || 1.0) * SIZE; }

  // ── the board: the woods and the frame in the room's own colors, and the letters for the side you sit on ──
  // ⚠ THE ROOM'S WOODS: the ones it hands over (the Gauntlet's floors each have a set), else its board's canon tokens
  P.build = function (woods) {
    var T = this.T, el = this.o.into ? null : this.o.board();
    var lt = (woods && woods.lt) || token(el, '--chess-lt', '#e9d3a4'), dk = (woods && woods.dk) || token(el, '--chess-dk', '#9c5f33');
    var fr = (woods && woods.frame) || token(el, '--chess-frame', '#4a3320');
    var key = [lt, dk, fr, this.flip].join('|');
    if (key === this.boardKey) return;
    this.boardKey = key;
    if (this.topMesh) { this.root.remove(this.topMesh, this.frameMesh); this.topMesh.geometry.dispose(); this.tex.dispose(); }
    var W = 8 * SQ + 0.9, px = 1024, u = px / W;
    var c = document.createElement('canvas'); c.width = c.height = px;
    var g = c.getContext('2d');
    g.fillStyle = fr; g.fillRect(0, 0, px, px);
    var o = 0.45 * u;
    for (var r = 0; r < 8; r++) for (var f = 0; f < 8; f++) {
      g.fillStyle = (r + f) % 2 === 0 ? lt : dk;
      g.fillRect(o + f * u, o + r * u, u + 0.5, u + 0.5);
    }
    g.fillStyle = lt; g.globalAlpha = 0.9;
    g.font = '600 ' + Math.round(0.24 * u) + 'px "Segoe UI", system-ui, sans-serif';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    for (var i = 0; i < 8; i++) {
      g.fillText('abcdefgh'.charAt(this.flip ? 7 - i : i), o + (i + 0.5) * u, px - o * 0.48);
      g.fillText(String(this.flip ? i + 1 : 8 - i), o * 0.48, o + (i + 0.5) * u);
    }
    var tex = new T.CanvasTexture(c);
    tex.colorSpace = T.SRGBColorSpace;
    tex.anisotropy = 4;
    this.tex = tex;
    var top = new T.Mesh(new T.PlaneGeometry(W, W), new T.MeshStandardMaterial({ map: tex, roughness: 0.85 }));
    top.rotation.x = -Math.PI / 2;
    top.receiveShadow = true;
    var box = new T.Mesh(new T.BoxGeometry(W, 0.36, W), new T.MeshStandardMaterial({ color: fr, roughness: 0.85 }));
    box.position.y = -0.181;
    this.topMesh = top; this.frameMesh = box;
    this.root.add(top, box);
    // ⚠ a piece's facing is set when it is made, so a new side makes them all again
    for (var k in this.pieces) this.root.remove(this.pieces[k].node);
    this.pieces = {};
    this.touch();
  };

  // A piece as a node standing on its square: his model, or the May set's in his material.
  P.make = function (c) {
    var M = this.M, white = c.charAt(0) === 'w';
    var his = !!M[c], src = M[c] || M[c.charAt(1)];
    var n = src.clone(true), sk = this.skins[c.charAt(0)];
    n.traverse(function (m) {
      if (!m.isMesh) return;
      m.castShadow = true;
      if (!his) m.material = sk;
    });
    var g = new this.T.Group();
    g.add(n);
    g.scale.setScalar(SIZE);
    // black's pieces face white's, a knight looking across the board
    g.rotation.y = white === !this.flip ? 0 : Math.PI;
    g.userData.yaw = g.rotation.y;
    return g;
  };

  // ── the position, read off the room every frame it changed ──
  P.sync = function () {
    var st = this.o.read && this.o.read();
    if (!st || !st.b) return;
    var flip = !!st.flip;
    if (flip !== this.flip) { this.flip = flip; this.boardKey = ''; this.b = null; }
    if (this.T) this.build(st.woods);
    var b = st.b, prev = this.b;
    // ⭐ WHOEVER SITS ACROSS (his view idea #1): the room says who (`seat`)
    this.seatTo(this.o.seat ? this.o.seat() : null);
    if (st.check == null) {
      var jk = b.join('') + '|' + (st.last || []).join(',') + '|' + (st.turn || '');
      if (jk !== this.jk) { this.jk = jk; this.jv = judge(st); }
      st.check = this.jv.check;
      if (st.mate == null) st.mate = this.jv.mate;
    }
    var key = b.join(',') + '|' + (st.last || []).join(',') + '|' + st.sel + '|' + (st.dots || []).join(',') + '|' +
      st.check + '|' + (st.hint || []).join(',') + '|' + (st.cursor == null ? -1 : st.cursor);
    if (key === this.key) return;
    this.key = key;
    var mv = prev ? moved(prev, b, st.last) : null;
    this.b = b.slice();
    // ⭐ THE ROOM FOLLOWS WHO IS WINNING, AND THE ONE ACROSS ANSWERS YOUR MOVE (his view ideas #4 and #5): the side
    // you sit on is the near one, the turn is the room's or the one that did not just move
    var side = flip ? 'b' : 'w', turn = st.turn || (st.last && b[st.last[1]] ? (sideOf(b[st.last[1]]) === 'w' ? 'b' : 'w') : '');
    if (turn) {
      this.moodTo = moodOf(settled(b, turn, side));
      this.leanTo = this.seatWho && turn !== side && !st.mate ? 1 : 0;
      if (calm()) this.lean = this.leanTo;
      if (mv && sideOf(b[mv.to]) === side && !st.quiet) this.face = verdict(prev, b, turn, side);
    }
    if (mv && !st.quiet) {
      var kind = st.mate ? 'mate' : (st.check >= 0 ? 'check' : (mv.taken ? 'capture' : ''));
      var at = kind === 'mate' || kind === 'check' ? st.check : mv.to;
      if (kind && at >= 0 && !calm()) this.cutAfter = { kind: kind, at: at };
    }
    if (!this.T) return;
    // the pieces: one node per square, made again only where the piece changed
    for (var k in this.pieces) {
      if (!b[k] || code(b[k]) !== this.pieces[k].code) { this.root.remove(this.pieces[k].node); delete this.pieces[k]; }
    }
    for (var i = 0; i < 64; i++) {
      if (!b[i]) continue;
      var c = code(b[i]);
      if (!this.pieces[i]) { var n = this.make(c); this.root.add(n); this.pieces[i] = { node: n, code: c }; }
      var p = this.pieces[i].node;
      p.position.copy(this.world(i));
      p.scale.setScalar(SIZE);
    }
    if (mv && this.pieces[mv.to]) {
      this.flying = { from: mv.from, to: mv.to, t: 0 };
      this.flights = (this.flights || 0) + 1;     // a probe hook: a slow frame can start and land a flight at once
      if (mv.taken) this.knock(mv.takenAt, code(mv.taken), mv.from, SLIDE * 0.7);
    }
    this.setMarks(st);
    this.touch();
  };

  // ⭐ CHECK AND MATE ARE THE REFEREE'S (pjcc-chess.js) when the room does not say: the side to move is the room's, or
  // the one that did not just move. ⚠ The room's own word wins: it knows the castling rights and the en passant square.
  function judge(st) {
    var C = window.PJCCChess, out = { check: -1, mate: false }, turn = st.turn;
    if (!turn && st.last && st.b[st.last[1]]) turn = st.b[st.last[1]] === st.b[st.last[1]].toUpperCase() ? 'b' : 'w';
    if (!C || !turn) return out;
    var S = { b: st.b, turn: turn, cast: { K: false, Q: false, k: false, q: false }, ep: -1, half: 0, full: 1 };
    try {
      if (C.inCheck(S, turn)) { out.check = C.kingSq(st.b, turn); out.mate = C.legalMoves(S).length === 0; }
    } catch (e) { out.check = -1; }
    return out;
  }

  // What moved, from the last position to this one: the room's last move when it says, or the one piece that went.
  function moved(a, b, last) {
    var diff = [];
    for (var i = 0; i < 64; i++) if (a[i] !== b[i]) diff.push(i);
    if (!diff.length || diff.length > 4) return null;
    var from = -1, to = -1;
    if (last && last.length === 2 && !b[last[0]] && b[last[1]] && diff.indexOf(last[1]) >= 0) {
      from = last[0]; to = last[1];
    } else {
      // the one square left empty whose piece now stands somewhere it did not (a king first, for castling)
      var gone = diff.filter(function (j) { return a[j] && !b[j]; });
      var came = diff.filter(function (j) { return b[j] && a[j] !== b[j]; });
      gone.sort(function (x, y) { return (a[y].toUpperCase() === 'K') - (a[x].toUpperCase() === 'K'); });
      gone.some(function (g) {
        var t = came.filter(function (j) { return b[j] === a[g] || (a[g].toUpperCase() === 'P' && (b[j] === b[j].toUpperCase()) === (a[g] === a[g].toUpperCase())); })[0];
        if (t == null) return false;
        from = g; to = t; return true;
      });
    }
    if (from < 0 || to < 0 || !a[from]) return null;
    var white = a[from] === a[from].toUpperCase(), taken = '', takenAt = -1;
    if (a[to] && (a[to] === a[to].toUpperCase()) !== white) { taken = a[to]; takenAt = to; }
    else if (a[from].toUpperCase() === 'P' && (from % 8) !== (to % 8) && !a[to]) {
      // en passant: the pawn taken is not on `to`
      var ep = to + (white ? 8 : -8);
      if (a[ep] && !b[ep]) { taken = a[ep]; takenAt = ep; }
    }
    return { from: from, to: to, taken: taken, takenAt: takenAt };
  }

  // A taken piece knocked over where it stood: it waits (the taker is still on its way), then is knocked away
  // from the taker, falling as it goes, and sinks out of sight.
  P.knock = function (at, c, from, wait) {
    this.knocks = (this.knocks || 0) + 1;         // a probe hook, as `flights`: a slow frame can knock and clear at once
    var n = this.make(c);
    var w = this.world(at);
    n.position.copy(w);
    this.root.add(n);
    var d = w.clone().sub(this.world(from)); d.y = 0;
    if (d.length() < 0.01) d.set(0, 0, -1);
    d.normalize();
    var axis = new this.T.Vector3(0, 1, 0).cross(d).normalize();
    this.falling.push({ node: n, axis: axis, t: -wait, pos: w, dir: d, yaw: n.rotation.y });
  };

  // ── the marks on the squares: last move, check, the piece in hand, where it may go, a hint, the cursor ──
  var LAST = [0xf5c518, 0.42], CHECK = [0xdb2929, 0.5], SEL = [0x6bffb8, 0.42], HINT = [0xff8c3c, 0.5],
    CURSOR = [0xf5c518, 0.45], DOT = [0x6bffb8, 0.62], CAP = [0x6bffb8, 0.38];
  P.setMarks = function (st) {
    var T = this.T, g = this.marks;
    while (g.children.length) { var x = g.children.pop(); x.geometry.dispose(); x.material.dispose(); }
    var self = this, n = 0;
    function put(i, kind, col) {
      if (i == null || i < 0) return;
      var m;
      if (kind === 'dot' || kind === 'cap') {
        var rr = kind === 'dot' ? 0.17 : 0.42;
        m = new T.Mesh(new T.CylinderGeometry(rr, rr, 0.02, 28), mat(T, col));
      } else {
        var inset = kind === 'sq' ? 0 : 0.06;
        m = new T.Mesh(new T.PlaneGeometry(SQ - inset * 2, SQ - inset * 2), mat(T, col));
        m.rotation.x = -Math.PI / 2;
      }
      m.position.copy(self.world(i));
      m.position.y = 0.004 + 0.002 * (n++ % 4);
      g.add(m);
    }
    if (st.last) { put(st.last[0], 'sq', LAST); put(st.last[1], 'sq', LAST); }
    if (st.check >= 0) put(st.check, 'sq', CHECK);
    if (st.sel >= 0) put(st.sel, 'in', SEL);
    (st.hint || []).forEach(function (i) { put(i, 'in', HINT); });
    if (st.cursor != null && st.cursor >= 0) put(st.cursor, 'in', CURSOR);
    (st.dots || []).forEach(function (i) { put(i, self.b && self.b[i] ? 'cap' : 'dot', self.b && self.b[i] ? CAP : DOT); });
  };
  function mat(T, col) {
    return new T.MeshBasicMaterial({ color: col[0], transparent: true, opacity: col[1], depthWrite: false });
  }

  // ── the camera: at rest on your side, fitted to the frame whatever its shape ──
  P.rect = function () {
    if (this.o.rect) return this.o.rect();
    var el = this.o.board();
    return el ? el.getBoundingClientRect() : null;
  };
  P.fit = function () {
    var w = Math.max(this.size[0], 2), h = Math.max(this.size[1], 2), aspect = w / h;
    var T = this.T, e = 4 * SQ + 0.45, pts = [];
    [-e, e].forEach(function (x) {
      [-e, e].forEach(function (z) { pts.push(new T.Vector3(x, 0, z), new T.Vector3(x, -0.36, z)); });
      pts.push(new T.Vector3(x * 0.8, TALLEST, -3.5 * SQ));
    });
    // ⚠ WHOEVER SITS ACROSS IS IN THE VIEW: the board moves down for their head, never shrinks for it
    if (this.seatWho) pts.push(new T.Vector3(0, SEAT_TALL * BUILD_TALLEST, -(FAR + SEAT_BACK)));
    var aim = new T.Vector3(), d = 30, th = Math.tan(FOV * Math.PI / 360), self = this;
    for (var pass = 0; pass < 3; pass++) {
      var lo = 4, hi = 120;
      for (var i = 0; i < 26; i++) {
        d = (lo + hi) / 2;
        var bx = self.box(pts, aim, d, aspect);
        if (Math.max(-bx[0], bx[2], -bx[1], bx[3]) <= EDGE) hi = d; else lo = d;
      }
      d = hi;
      // then the middle of what it sees moved to the middle of the frame: a pan, the tilt kept
      var b2 = self.box(pts, aim, d, aspect), mx = (b2[0] + b2[2]) / 2, my = (b2[1] + b2[3]) / 2;
      var basis = self.basis(0, aim, d);
      aim.add(basis.x.multiplyScalar(mx * d * th * aspect)).add(basis.y.multiplyScalar(my * d * th));
    }
    this.aimV.copy(aim); this.dist = d;
  };
  // The camera's own right and up at rest, looking at `aim` from `d` away.
  P.basis = function (orbit, aim, d) {
    var T = this.T, bk = back(orbit);
    var fwd = new T.Vector3(-bk.x, -bk.y, -bk.z).normalize();
    var x = new T.Vector3().crossVectors(fwd, new T.Vector3(0, 1, 0)).normalize();
    var y = new T.Vector3().crossVectors(x, fwd).normalize();
    return { x: x, y: y, f: fwd, pos: aim.clone().add(new T.Vector3(bk.x, bk.y, bk.z).multiplyScalar(d)) };
  };
  // Where the points fall in the view (-1 to 1 each way): [minx, miny, maxx, maxy].
  P.box = function (pts, aim, d, aspect) {
    var b = this.basis(0, aim, d), th = Math.tan(FOV * Math.PI / 360), out = [9, 9, -9, -9];
    pts.forEach(function (p) {
      var rel = p.clone().sub(b.pos), z = rel.dot(b.f);
      var qx = rel.dot(b.x) / (z * th * aspect), qy = rel.dot(b.y) / (z * th);
      out[0] = Math.min(out[0], qx); out[1] = Math.min(out[1], qy); out[2] = Math.max(out[2], qx); out[3] = Math.max(out[3], qy);
    });
    return out;
  };
  P.pose = function (aim, orbit, dist) {
    var bk = back(orbit);
    this.cam.position.set(aim.x + bk.x * dist, aim.y + bk.y * dist, aim.z + bk.z * dist);
    this.cam.lookAt(aim);
    this.cam.updateMatrixWorld();
  };
  P.rest = function () { this.pose(this.aimV, 0, this.dist); };
  // ⭐ A CUT, IN 3D: the camera comes in on the square (a of the way, 0 at rest), circling round it by `orbit`.
  // It looks a little in front of the square, so the piece stands in the top third and the board fills the rest.
  P.camCut = function (i, a, orbit, zoom) {
    var bk = back(orbit * a), lead = new this.T.Vector3(bk.x, 0, bk.z).normalize().multiplyScalar(0.8 * SQ);
    var target = this.world(i).add(new this.T.Vector3(0, 0.35, 0)).add(lead);
    this.pose(this.aimV.clone().lerp(target, a), orbit * a, this.dist / (1 + (zoom * 1.25 - 1) * a));
  };

  // ── picking: a press on a piece is its square; the ray meets a standing piece before the board behind it ──
  P.ray = function (x, y) {
    var T = this.T, w = this.size[0], h = this.size[1];
    var o = this.cam.position.clone();
    var d = new T.Vector3(x / w * 2 - 1, 1 - y / h * 2, 0.5).unproject(this.cam).sub(o).normalize();
    return [o, d];
  };
  P.squareIn = function (x, y) {
    var rd = this.ray(x, y), o = rd[0], d = rd[1], best = Infinity, out = -1;
    if (Math.abs(d.y) > 1e-4 && -o.y / d.y > 0) {
      var t = -o.y / d.y, hx = o.x + d.x * t, hz = o.z + d.z * t;
      var c = Math.floor(hx / SQ + 4), r = Math.floor(hz / SQ + 4);
      if (c >= 0 && c <= 7 && r >= 0 && r <= 7) { best = t; out = this.unview(c, r); }
    }
    for (var k in this.pieces) {
      var w = this.world(+k), hh = tall(this.pieces[k].code);
      // ⚠ A PIECE IS A WIDE BODY UNDER A NARROW HEAD: one fat post took the presses meant for the square behind it
      var t2 = Math.min(post(o, d, w, 0.33 * SIZE, hh * 0.55), post(o, d, w, 0.2 * SIZE, hh));
      if (t2 < best) { best = t2; out = +k; }
    }
    return out;
  };
  function post(o, d, base, r, h) {
    var ox = o.x - base.x, oz = o.z - base.z, a = d.x * d.x + d.z * d.z, t = Infinity;
    if (a > 1e-6) {
      var b = 2 * (ox * d.x + oz * d.z), c = ox * ox + oz * oz - r * r, disc = b * b - 4 * a * c;
      if (disc >= 0) {
        var t1 = (-b - Math.sqrt(disc)) / (2 * a), y = o.y + d.y * t1;
        if (t1 > 0 && y >= 0 && y <= h) t = t1;
      }
    }
    if (Math.abs(d.y) > 1e-6) {
      var tc = (h - o.y) / d.y, px = o.x + d.x * tc - base.x, pz = o.z + d.z * tc - base.z;
      if (tc > 0 && px * px + pz * pz <= r * r) t = Math.min(t, tc);
    }
    return t;
  }
  P.seen = function (p) {
    var v = p.clone().project(this.cam);
    return [(v.x + 1) / 2 * this.size[0], (1 - v.y) / 2 * this.size[1]];
  };
  // Where to press a square so the press is that square: its piece's middle, or the square's, or else whatever part
  // of it shows past what stands in front of it.
  P.pressIn = function (i) {
    var T = this.T, h = this.pieces[i] ? tall(this.pieces[i].code) : 0;
    var tries = h > 0 ? [[0, h * 0.4, 0], [0, h * 0.8, 0]] : [[0, 0, 0]];
    [0, -0.32, 0.32].forEach(function (x) { tries.push([x, 0, -0.36], [x, 0, 0]); });
    var w = this.world(i);
    for (var k = 0; k < tries.length; k++) {
      var s = this.seen(w.clone().add(new T.Vector3(tries[k][0], tries[k][1], tries[k][2])));
      if (this.squareIn(s[0], s[1]) === i) return s;
    }
    return this.seen(w.clone().add(new T.Vector3(tries[0][0], tries[0][1], tries[0][2])));
  };
  // Where the room places what it draws on a square (a burst, a ring), as the camera at rest sees it, and how a
  // point placed at rest rides the camera in a cut: [ox, oy, k], a point p lands at o + p * k (Board3D.fx_map).
  P.restIn = function (i) {
    var save = this.cam.position.clone(), q = this.cam.quaternion.clone();
    this.rest();
    var h = this.pieces[i] ? tall(this.pieces[i].code) * 0.4 : 0;
    var s = this.seen(this.world(i).add(new this.T.Vector3(0, h, 0)));
    this.cam.position.copy(save); this.cam.quaternion.copy(q); this.cam.updateMatrixWorld();
    return s;
  };
  P.fxMap = function () {
    if (!this.cut || this.isFlat()) return [0, 0, 1];
    var T = this.T, f = this.world(this.cut.at).add(new T.Vector3(0, 0.35, 0));
    var z1 = f.clone().applyMatrix4(this.cam.matrixWorldInverse).z, now = this.seen(f);
    var save = this.cam.position.clone(), q = this.cam.quaternion.clone();
    this.rest();
    var z0 = f.clone().applyMatrix4(this.cam.matrixWorldInverse).z, then = this.seen(f);
    this.cam.position.copy(save); this.cam.quaternion.copy(q); this.cam.updateMatrixWorld();
    if (z0 > -0.01 || z1 > -0.01) return [0, 0, 1];
    var k = z0 / z1;
    return [now[0] - then[0] * k, now[1] - then[1] * k, k];
  };

  // ── the room's own coordinates (client pixels), for the room, its probe and its tests ──
  P.squareAt = function (cx, cy) {
    var r = this.rect();
    if (!r || this.isFlat()) return -1;
    return this.squareIn(cx - r.left, cy - r.top);
  };
  P.pointOf = function (i) {
    var r = this.rect();
    if (!r) return null;
    if (this.isFlat()) return [r.left + ((this.view(i)[0] + 0.5) / 8) * r.width, r.top + ((this.view(i)[1] + 0.5) / 8) * r.height];
    var s = this.pressIn(i);
    return [r.left + s[0], r.top + s[1]];
  };

  // ── a press on the 3D board is pressed on the flat board's square ──
  P.onPress = function (e) {
    var i = this.squareAt(e.clientX, e.clientY);
    if (i < 0) return;
    e.preventDefault(); e.stopPropagation();
    if (this.o.press) { this.o.press(i, e); return; }
    var el = this.o.board(), sq = el && el.querySelector('[data-sq="' + i + '"],[data-i="' + i + '"]');
    if (sq) sq.click();
  };

  // ── the TV cuts: a capture's close-up, a check's push in on the king, a mate's slow circle ──
  P.startCut = function (kind, at) {
    if (calm() || !CUTS[kind]) return;
    this.cut = { kind: kind, at: at, t: 0 };
    this.touch();
    if (this.o.onCut) this.o.onCut(kind);
  };
  P.endCut = function () {
    if (!this.cut) return;
    this.cut = null;
    this.flatCam();
    this.touch();
    if (this.o.onCut) this.o.onCut('');
  };
  // ⚠ THE GAME'S END WAITS FOR A MATE'S CUT'S FIRST HALF SECOND, never longer: its circle goes on under the card
  P.cardHeld = function () { return !!(this.cut && this.cut.kind === 'mate' && this.cut.t < CARD_AFTER); };
  P.envelope = function () {
    var c = CUTS[this.cut.kind], f = Math.max(0, Math.min(1, this.cut.t / c.secs)), mate = this.cut.kind === 'mate';
    var rise = mate ? 0.2 : 0.3, fall = mate ? 0.2 : 0.35;
    var a = f < rise ? smooth(f / rise) : (f > 1 - fall ? smooth((1 - f) / fall) : 1);
    return { c: c, f: f, a: a, mate: mate };
  };
  // The flat board's camera in a cut, as the game's stage: [a, b, c, d, e, f] in the board's own pixels, or null.
  P.flatMatrix = function () {
    if (!this.cut) return null;
    var r = this.rect();
    if (!r) return null;
    var en = this.envelope(), c = en.c, a = en.a, f = en.f, cell = r.width / 8;
    var v = this.view(this.cut.at), fx = (v[0] + 0.5) * cell, fy = (v[1] + 0.5) * cell;
    var z = 1 + (c.zoom - 1) * a, ang = c.turn * Math.sin(f * Math.PI * 2) * a;
    var sx = (r.width / 2 - fx) * 0.3 * a + Math.cos(f * Math.PI * 2) * cell * c.circle * a;
    var sy = (r.height / 2 - fy) * 0.3 * a + Math.sin(f * Math.PI * 2) * cell * c.circle * a;
    var co = Math.cos(ang) * z, si = Math.sin(ang) * z;
    // p' = focus + shift + R·S·(p - focus)
    return [co, si, -si, co, fx + sx - (co * fx - si * fy), fy + sy - (si * fx + co * fy)];
  };
  // A DOM room's flat board takes the camera itself: transformed, and clipped back to its own frame, so a press
  // lands on the square drawn under the finger (the browser reads it through the transform).
  P.flatCam = function () {
    var el = this.o.into ? null : this.o.board();
    if (!el) return;
    var m = this.isFlat() ? this.flatMatrix() : null;
    if (!m) {
      if (el.style.transform) { el.style.transform = ''; el.style.clipPath = ''; el.style.transformOrigin = ''; }
      return;
    }
    var w = el.offsetWidth, h = el.offsetHeight, det = m[0] * m[3] - m[1] * m[2];
    function inv(x, y) {
      var dx = x - m[4], dy = y - m[5];
      return [(m[3] * dx - m[2] * dy) / det, (-m[1] * dx + m[0] * dy) / det];
    }
    var pts = [inv(0, 0), inv(w, 0), inv(w, h), inv(0, h)].map(function (p) { return p[0].toFixed(1) + 'px ' + p[1].toFixed(1) + 'px'; });
    el.style.transformOrigin = '0 0';
    el.style.transform = 'matrix(' + m.map(function (x) { return +x.toFixed(5); }).join(',') + ')';
    el.style.clipPath = 'polygon(' + pts.join(',') + ')';
  };

  P.isFlat = function () { return flat() || !this.T; };
  P.touch = function () { this.live = Math.max(this.live, 2); };

  // The canvas over the flat board (a DOM room), its size, and the flat board under it hidden but pressable.
  P.layout = function () {
    var r = this.rect();
    if (!this.T) return;
    // ⚠ A BOARD THE ROOM HAS PUT AWAY (another screen) TAKES THE CANVAS WITH IT, or it stands over the next screen
    if (!r || r.width < 2) { if (!this.o.into) { this.canvas.style.display = 'none'; this.scv.style.display = 'none'; } return; }
    var w = Math.round(r.width), h = Math.round(r.height);
    if (w !== this.size[0] || h !== this.size[1]) {
      this.size = [w, h];
      this.r.setSize(w, h, false);
      this.cam.aspect = w / h;
      this.cam.updateProjectionMatrix();
      this.fit();
      this.touch();
      this.seatDirty = true;
    }
    if (this.o.into) return;
    var el = this.o.board(), cv = this.canvas, on = !this.isFlat();
    if (!el) { cv.style.display = 'none'; return; }
    var host = el.offsetParent || el.parentNode;
    // ⚠ PUT BACK, IT DRAWS AGAIN: a room that rebuilt its board took the canvas with it, picture and all
    if (cv.parentNode !== host) { host.appendChild(cv); this.touch(); }
    cv.style.display = on ? 'block' : 'none';
    cv.style.left = el.offsetLeft + 'px'; cv.style.top = el.offsetTop + 'px';
    cv.style.width = w + 'px'; cv.style.height = h + 'px';
    // ⚠ WHOEVER SITS ACROSS IS DRAWN UNDER THE BOARD'S PICTURE, so the board and every piece cover them where they should
    var scv = this.scv;
    if (scv.parentNode !== host || scv.nextSibling !== cv) { host.insertBefore(scv, cv); this.seatDirty = true; }
    scv.style.display = cv.style.display;
    scv.style.left = cv.style.left; scv.style.top = cv.style.top; scv.style.width = cv.style.width; scv.style.height = cv.style.height;
    // ⚠ HIDDEN BY OPACITY, NOT VISIBILITY: its squares stay focusable, so a keyboard still plays the board. Its own
    // frame goes too, or the 3D board stands in a flat one.
    if (el.classList.contains('pjcc-b3-on') !== on) el.classList.toggle('pjcc-b3-on', on);
  };

  // ── whoever sits across ──
  P.seatTo = function (seat) {
    var who = seat && seat.who ? String(seat.who) : '', key = seat && seat.key ? String(seat.key) : '';
    if (who === this.seatWho && key === this.seatKey) return;
    this.seatWho = who; this.seatKey = key; this.dog = !!COATS[who]; this.act = ''; this.face = '';
    // ⚠ A DOG IS NOT DRESSED: it is the dog (the town's bench draws its dogs as dogs)
    var look = who && !this.dog ? lookOf(who, key) : null, self = this;
    this.look = look; this.dressed = null; this.seatBuild = look ? look.build : [1, 1];
    if (look) people().then(function (im) { if (self.look === look) { self.dressed = dressSheet(im, look); self.seatDirty = true; } }, function () {});
    if (this.T) { this.fit(); this.touch(); }
    this.seatDirty = true;
  };
  // How they sit now, in pictures: [size, right, down, light]
  P.posed = function () {
    var e = this.lean * this.lean * (3 - 2 * this.lean), dx = 0, dy = LEAN * 0.6 * e, light = 1;
    if (this.act) {
      var r = REACT[this.act], f = Math.max(0, Math.min(1, this.actT / r[0])), env = Math.sin(f * Math.PI);
      dy += r[1] * env - r[2] * Math.abs(Math.sin(f * Math.PI * 2));
      dx = r[3] * Math.sin(f * Math.PI * 6) * env;
      light = 1 + (r[4] - 1) * env;
    }
    return [1 + LEAN * e, dx, dy, light];
  };
  // the breath, the lean, an answer playing, and the light easing toward who is winning
  P.seatStep = function (dt) {
    var moving = this.lean !== this.leanTo || !!this.act;
    this.breath = (this.breath + dt / BREATH_SECS) % 1;
    this.lean = moveToward(this.lean, this.leanTo, dt / LEAN_SECS);
    if (this.act) { this.actT += dt; if (this.actT >= REACT[this.act][0]) this.act = ''; }
    // ⚠ THEY ANSWER ONCE THE CAMERA IS BACK ON THEM: a capture's close-up had the face off the frame
    if (this.face && !this.flying && !this.cut && !this.cutAfter) {
      if (!calm() && this.seatWho) { this.act = this.face; this.actT = 0; }
      this.face = ''; moving = true;
    }
    if (this.mood !== this.moodTo) {
      this.mood = moveToward(this.mood, this.moodTo, dt * MOOD_RATE);
      if (this.keyL) { var c = lampOf(this.mood); this.keyL.color.setRGB(c[0], c[1], c[2], this.T.SRGBColorSpace); this.touch(); }
      moving = true;
    }
    var cell = frameIndex(this.breath, IDLES);
    if (moving || cell !== this.cell) { this.cell = cell; this.seatDirty = true; }
  };
  // ⭐ THEIR CANVAS: the room's light behind it all, then whoever sits across, placed through the board's camera
  P.drawSeat = function () {
    this.seatDirty = false;
    var cv = this.scv, w = this.size[0], h = this.size[1], k = Math.min(2, window.devicePixelRatio || 1);
    var pw = Math.max(1, Math.round(w * k)), ph = Math.max(1, Math.round(h * k));
    if (cv.width !== pw || cv.height !== ph) { cv.width = pw; cv.height = ph; }
    var g = cv.getContext('2d');
    g.setTransform(k, 0, 0, k, 0, 0);
    g.clearRect(0, 0, w, h);
    if (Math.abs(this.mood) >= 0.01) {
      var gc = hex3(this.mood > 0 ? MOOD_GOLD : MOOD_COLD), ga = Math.abs(this.mood) * MOOD_GLOW;
      var gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.9);
      gr.addColorStop(0, rgbaOf(gc, ga)); gr.addColorStop(1, rgbaOf(gc, 0));
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      // ⚠ A SOFT FRAME: this canvas is the board's own square, and the game's light runs on past it into the table's
      // frame; cut off at the square's edge it read as a lit box. It fades out over the outer fifth each way instead.
      g.globalCompositeOperation = 'destination-in';
      [[w, 0], [0, h]].forEach(function (d) {
        var m = g.createLinearGradient(0, 0, d[0], d[1]);
        m.addColorStop(0, 'rgba(0,0,0,0)'); m.addColorStop(0.2, '#000'); m.addColorStop(0.8, '#000'); m.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = m; g.fillRect(0, 0, w, h);
      });
      g.globalCompositeOperation = 'source-over';
    }
    this.seatDrawn = '';
    if (!this.seatWho || !this.T) return;
    var T = this.T, edge = this.seen(new T.Vector3(0, 0, -FAR));
    var top = this.seen(new T.Vector3(0, SEAT_TALL * this.seatBuild[1], -(FAR + SEAT_BACK)));
    if (edge[1] - top[1] < 8) return;
    var pose = this.posed(), fig = this.fig || (this.fig = document.createElement('canvas'));
    if (fig.width !== pw || fig.height !== ph) { fig.width = pw; fig.height = ph; }
    var f = fig.getContext('2d');
    f.setTransform(k, 0, 0, k, 0, 0);
    f.clearRect(0, 0, w, h);
    if (this.dog) {
      var q = (edge[1] - top[1]) * pose[0], ears = 0;
      if (this.act) {
        var env = Math.sin(Math.max(0, Math.min(1, this.actT / REACT[this.act][0])) * Math.PI);
        ears = this.act === 'smile' ? env : -0.6 * env;
      }
      paintFront(f, this.seatWho, [(edge[0] + top[0]) / 2 + pose[1] * q, edge[1] + pose[2] * q], q * DOG_UP / SIT_TALL,
        this.leanTo > 0 ? [0, 0.9] : [0, 0], ears);
    } else {
      var img = this.dressed;
      if (!img) return;
      var q2 = (edge[1] - top[1]) / (SEAT_WAIST - SEAT_TOP) * pose[0], ww = q2 * this.seatBuild[0];
      var x = (edge[0] + top[0]) / 2 - ww / 2 + pose[1] * q2, y0 = edge[1] - SEAT_WAIST * q2 + pose[2] * q2;
      var f0 = SEAT_WAIST - 0.04, sx = frameIndex(this.breath, IDLES) * FRONT;
      f.drawImage(img, sx, 0, FRONT, FRONT * f0, x, y0, ww, f0 * q2);
      for (var i = 0; i < SEAT_STRIPS; i++) {
        var a = f0 + (SEAT_KEEP - f0) * i / SEAT_STRIPS, bb = f0 + (SEAT_KEEP - f0) * (i + 1) / SEAT_STRIPS;
        f.globalAlpha = 1 - (i + 0.5) / SEAT_STRIPS;
        f.drawImage(img, sx, FRONT * a, FRONT, FRONT * (bb - a), x, y0 + a * q2, ww, (bb - a) * q2);
      }
      f.globalAlpha = 1;
    }
    // the light of an answer: a frown dims them, as the game's modulate does
    if (pose[3] < 1) {
      f.globalCompositeOperation = 'source-atop';
      f.fillStyle = 'rgba(0,0,0,' + (1 - pose[3]).toFixed(3) + ')';
      f.fillRect(0, 0, w, h);
      f.globalCompositeOperation = 'source-over';
    }
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.drawImage(fig, 0, 0);
    this.seatDrawn = this.dog ? 'dog' : 'person';
  };
  var STYLE = '.pjcc-b3-on{border-color:transparent!important;background:none!important;box-shadow:none!important}' +
    '.pjcc-b3-on>*,.pjcc-b3-on::before,.pjcc-b3-on::after{opacity:0!important}';

  P.step = function (dt) {
    var c = calm();
    if (this.cutAfter && !this.flying) { this.startCut(this.cutAfter.kind, this.cutAfter.at); this.cutAfter = null; }
    if (!this.T) {
      if (this.cut) { this.cut.t += dt; if (this.cut.t >= CUTS[this.cut.kind].secs) this.endCut(); }
      this.flatCam();
      return;
    }
    if (this.flying) {
      var fl = this.flying, p = this.pieces[fl.to];
      fl.t += dt;
      var f = Math.min(1, fl.t / SLIDE);
      if (p) {
        var a = this.world(fl.from), b = this.world(fl.to), e = 1 - (1 - f) * (1 - f);
        var up = c ? 0 : ARC * Math.max(0.4, Math.min(1, a.distanceTo(b) / 2)) * Math.sin(f * Math.PI);
        p.node.position.copy(a.lerp(b, e)).add(new this.T.Vector3(0, up, 0));
      }
      if (f >= 1) { this.flying = null; this.squash = c ? null : { at: fl.to, t: 0 }; }
      this.touch();
    }
    if (this.squash) {
      var sq = this.squash, pn = this.pieces[sq.at];
      sq.t += dt;
      var k = Math.max(0, 1 - sq.t / 0.18);
      if (pn) pn.node.scale.set(SIZE * (1 + 0.08 * k), SIZE * (1 - 0.1 * k), SIZE * (1 + 0.08 * k));
      if (k <= 0) this.squash = null;
      this.touch();
    }
    var T = this.T, keep = [];
    for (var i = 0; i < this.falling.length; i++) {
      var fa = this.falling[i];
      fa.t += dt;
      if (fa.t >= 0) {
        if (c) fa.t = TOPPLE + 1;
        var kk = Math.min(1, fa.t / TOPPLE), fall = 1 - (1 - kk) * (1 - kk);
        fa.node.quaternion.setFromAxisAngle(fa.axis, fall * Math.PI / 2)
          .multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(0, 1, 0), fa.yaw));
        fa.node.position.copy(fa.pos).add(fa.dir.clone().multiplyScalar(0.5 * fall));
        fa.node.position.y -= Math.max(0, fa.t - TOPPLE) * 2;
      }
      if (fa.t > TOPPLE + 0.35) this.root.remove(fa.node); else keep.push(fa);
    }
    if (this.falling.length) this.touch();
    this.falling = keep;
    if (this.cut) {
      this.cut.t += dt;
      if (this.cut.t >= CUTS[this.cut.kind].secs) this.endCut();
      else this.touch();
    }
    if (this.cut && !this.isFlat()) {
      var en = this.envelope();
      this.camCut(this.cut.at, en.a, en.mate ? 0.8 * Math.sin(en.f * Math.PI) : 0, en.c.zoom);
    } else this.rest();
    this.flatCam();
    this.seatStep(dt);
  };

  P.frame = function (dt) {
    if (!this.o.into) this.sync();
    this.layout();
    this.step(dt);
    if (this.T && this.live > 0 && !this.isFlat()) { this.r.render(this.scene, this.cam); this.live--; this.seatDirty = true; }
    if (this.T && this.seatDirty && !this.isFlat()) this.drawSeat();
  };

  // A canvas room draws the board itself: the 3D board's picture into its own canvas, where its flat board would be.
  P.drawInto = function (ctx, x, y, w, h) {
    if (this.isFlat()) return false;
    // ⚠ DRAWN AGAIN ONLY WHEN SOMETHING MOVED: the room paints every frame, and the picture it paints is kept
    this.sync(); this.layout();
    if (this.live > 0) { this.step(0); this.r.render(this.scene, this.cam); this.live--; this.seatDirty = true; }
    // ⚠ A CANVAS ROOM GETS THEM TOO, under the board's picture, in its own canvas
    if (this.seatDirty) this.drawSeat();
    ctx.drawImage(this.scv, x, y, w, h);
    ctx.drawImage(this.canvas, x, y, w, h);
    return true;
  };

  P.destroy = function () {
    var i = boards.indexOf(this);
    if (i >= 0) boards.splice(i, 1);
    var el = this.o.into ? null : this.o.board();
    if (el) { el.style.transform = ''; el.style.clipPath = ''; el.classList.remove('pjcc-b3-on'); }
    if (this.canvas && this.canvas.parentNode) this.canvas.parentNode.removeChild(this.canvas);
    if (this.scv && this.scv.parentNode) this.scv.parentNode.removeChild(this.scv);
    if (this.r) this.r.dispose();
  };

  // ── one clock for every board on the page ──
  var lastT = 0, ticking = false;
  function tick(now) {
    // ⚠ A SLOW FRAME STILL MOVES A CUT ON IN REAL TIME (a cap of 0.05 made a 1.6 s cut last six on a slow device)
    var dt = lastT ? Math.min(0.25, (now - lastT) / 1000) : 0;
    lastT = now;
    boards.forEach(function (b) {
      try { if (!b.o.into) b.frame(dt); else b.step(dt); } catch (e) { console.error('[board3d]', e); }
    });
    requestAnimationFrame(tick);
  }

  // ── what a room calls ──
  function Handle(opts) {
    this.o = opts;
    var b = new Board(opts);
    this.b = b;
    boards.push(b);
    if (!ticking) { ticking = true; requestAnimationFrame(tick); }
    if (!webgl()) return;
    lib().then(function (T) { return models(T).then(function (M) { return [T, M]; }); }).then(function (TM) {
      if (boards.indexOf(b) < 0) return;
      b.attach(TM[0], TM[1]);
      btnLabels.forEach(function (f) { f(); });
      if (opts.onUp) opts.onUp();
    }).catch(function (e) { console.warn('[board3d] staying flat:', e && e.message); });
  }
  var H = Handle.prototype;
  H.on = function () { return !!(this.b && !this.b.isFlat()); };
  H.up = function () { return !!(this.b && this.b.T); };
  H.refresh = function () { if (this.b) { this.b.key = ''; this.b.sync(); this.b.touch(); } };
  H.squareAt = function (x, y) { return this.b ? this.b.squareAt(x, y) : -1; };
  H.pointOf = function (i) { return this.b ? this.b.pointOf(i) : null; };
  H.squareIn = function (x, y) { return this.b && !this.b.isFlat() ? this.b.squareIn(x, y) : -1; };
  H.pressIn = function (i) { return this.b ? this.b.pressIn(i) : null; };
  // where a square's middle (its piece's) is drawn by the camera as it stands, in the board's pixels: what the room
  // draws on the board (an arrow, a burst) rides the camera there
  H.seenIn = function (i) {
    var b = this.b;
    if (!b || !b.T || b.isFlat()) return null;
    return b.seen(b.world(i).add(new b.T.Vector3(0, b.pieces[i] ? tall(b.pieces[i].code) * 0.4 : 0, 0)));
  };
  H.restIn = function (i) { return this.b ? this.b.restIn(i) : null; };
  H.fxMap = function () { return this.b ? this.b.fxMap() : [0, 0, 1]; };
  H.flatMatrix = function () { return this.b ? this.b.flatMatrix() : null; };
  H.cutting = function () { return !!(this.b && this.b.cut); };
  // whoever sits across and the room's light, as the board has them now (the rooms' tests)
  H.seat = function () {
    var b = this.b;
    return b ? { who: b.seatWho, key: b.seatKey, dog: b.dog, drawn: b.seatDrawn, lean: b.lean, leanTo: b.leanTo, act: b.act,
      face: b.face, mood: b.mood, moodTo: b.moodTo, lamp: b.keyL ? b.keyL.color.getHexString(b.T.SRGBColorSpace) : '' } : null;
  };
  H.cutKind = function () { return this.b && this.b.cut ? this.b.cut.kind : ''; };
  H.cardHeld = function () { return !!(this.b && this.b.cardHeld()); };
  H.endCut = function () { if (this.b) this.b.endCut(); };
  H.cut = function (kind, at) { if (this.b) this.b.startCut(kind, at); };
  H.drawInto = function (ctx, x, y, w, h) { return this.b ? this.b.drawInto(ctx, x, y, w, h) : false; };
  H.destroy = function () { if (this.b) this.b.destroy(); this.b = null; };
  // the room's own button: "Board: 3D" or "Board: Flat", the view it is showing
  H.button = function (cls) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = (cls || 'pjcc-btn-ghost') + ' pjcc-board-view';
    var b = this.b;
    // ⚠ NO 3D, NO CHOICE: the button shows only once the 3D board is up
    function label() { btn.textContent = flat() ? 'Board: Flat' : 'Board: 3D'; btn.hidden = !(b && b.T); }
    label();
    btn.addEventListener('click', function () { setFlat(!flat()); btnLabels.forEach(function (f) { f(); }); });
    btnLabels.push(label);
    return btn;
  };
  var btnLabels = [], handles = [];

  // V flips the view anywhere a board is mounted, as the game's tables do
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'v' && e.key !== 'V') return;
    if (e.ctrlKey || e.metaKey || e.altKey || !boards.length) return;
    var t = e.target, tag = t && t.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || (t && t.isContentEditable)) return;
    setFlat(!flat());
    btnLabels.forEach(function (f) { f(); });
  });
  // ⚠ A KEY ENDS A CUT TOO, after it has done what it does: a cut never stands between a player and the board
  document.addEventListener('keydown', function () {
    setTimeout(function () { boards.forEach(function (b) { b.endCut(); }); }, 0);
  }, true);

  window.PJCCBoard3D = {
    mount: function (opts) { var h = new Handle(opts); handles.push(h); return h; },
    handles: handles,                  // every board mounted on the page, for its tests and probes
    flat: flat, setFlat: function (on) { setFlat(on); btnLabels.forEach(function (f) { f(); }); },
    calm: calm, cutting: cutting,
    // the numbers, for the rooms' tests and the gate
    TILT: TILT, FOV: FOV, SIZE: SIZE, SLIDE: SLIDE, TOPPLE: TOPPLE, CARD_AFTER: CARD_AFTER, CUTS: CUTS, TALL: TALL,
    SEAT: { TALL: SEAT_TALL, BACK: SEAT_BACK, TOP: SEAT_TOP, WAIST: SEAT_WAIST, KEEP: SEAT_KEEP, STRIPS: SEAT_STRIPS,
      LEAN: LEAN, LEAN_SECS: LEAN_SECS, DOG_UP: DOG_UP, SIT_TALL: SIT_TALL }, REACT: REACT,
    MOOD: { FULL: MOOD_FULL, RATE: MOOD_RATE, GLOW: MOOD_GLOW, LAMP: MOOD_LAMP, GOLD: MOOD_GOLD, COLD: MOOD_COLD },
    // the judge and the looks, for the parity corpus and the gate
    judge: { settled: settled, verdict: verdict, material: material, bestCapture: bestCapture, SWING: SWING, VAL: VAL },
    lookOf: lookOf, COATS: COATS,
  };
})();
