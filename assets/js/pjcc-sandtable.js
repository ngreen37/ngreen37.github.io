/* pjcc-sandtable.js — THE SAND TABLE: ChessWild: Campaign's map as a tilted 3D table (his pick #6, 11-10: "The map
 * becomes a tilted 3D table with your Blender pieces standing as troops, and you throw the dice on it. Both the game and
 * the website."). The game's twin is ui/sand_table.gd; the numbers below are its numbers.
 * A LENS over the page's own map: drawMap() hands it what it drew (each holding's classes, each road's), it draws that
 * on sand, and a press on a holding is pressed through to the page (tapLand), so the page's rules play every tap.
 *   var sand = PJCCSand.mount({ host: el, press: function (id) { ... } });
 *   sand.set({ land: [{id, nm, x, y}], edges: [[a, b]], nodes: [{own, ranks, fog, cls, col}], links: [cls], dog: url })
 *   sand.throwDice({ from, to, dice: [{ v, side: 'att'|'def', kept, col }] }, done)
 * ⚠ NO WebGL, NO BUNDLE OR NO PAWN: the page keeps its flat map, and nothing else changes.
 * "Map: Flat" is a device preference (pjcc.campaign.map.flat); the sand table until it is pressed. */
(function () {
  'use strict';
  var me = document.currentScript;
  var BASE = me ? me.src.replace(/js\/pjcc-sandtable\.js.*$/, '') : '/assets/';
  var LIB = BASE + 'vendor/three/three.pjcc.min.js';
  var MODELS = BASE + 'models/pieces3d/';
  var KEY = 'pjcc.campaign.map.flat';

  // ── the table's numbers (ui/sand_table.gd) ──
  var U = 0.16;                    // world units to a percent of the map's width
  var TILT = 66.0;                 // degrees the camera looks down from the horizon
  var FOV = 30.0;
  var EDGE = 0.985;                // how much of the view the table fills
  var MESA = 0.95, MESA_BIG = 0.78; // a holding's radius: the campaign's ten, a war's fifteen or sixteen
  var MESA_H = 0.2;
  var PAWN = 0.56;                 // a troop: his pawn at this share of his canon size
  var SHOW = 5;                    // pawns standing on a holding at most; its badge says how many
  // ⚠ SIZED TO READ AT 320px, as the flat map's discs and names do (a table 18 units across is ~18 px a unit there)
  var BADGE = 1.1, NAME_W = 3.6, NAME_H = 1.0, ROOK = 0.8;
  var DIE = 0.42;                  // an eight-sided die's radius
  var THROW = 1.1;                 // seconds a throw takes to come to rest
  var SEE = 0.7;                   // seconds the landed dice are looked at before the roll screen opens on them
  var LINGER = 1.8;                // seconds the dice lie there after
  var SAND = '#c9a66b', MESA_TOP = '#dcc08b', ROAD = '#9a7a48', WOOD = '#4a2f17', RIM = '#6b4423';
  var GOLD = '#ffd66a', HOT = '#ff6e8a', INK = '#2a1a0c';
  var BAND = ['#b9bdcb', '#e8e2d4', '#eec277', '#f7d54c'];   // the page's four bands, the die's face when it lands

  function flat() { try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; } }
  function setFlat(on) { try { localStorage.setItem(KEY, on ? '1' : '0'); } catch (e) {} }
  var reduceMq = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : null;
  function calm() { return !!(reduceMq && reduceMq.matches); }
  function webgl() {
    try { var c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); }
    catch (e) { return false; }
  }
  // ⚠ ONE BUNDLE A PAGE: the chess board's lens may already be fetching it
  function lib() {
    if (window.PJCC3) return Promise.resolve(window.PJCC3);
    return new Promise(function (ok, bad) {
      var s = Array.prototype.filter.call(document.scripts, function (x) { return x.src && x.src.indexOf('three.pjcc.min.js') >= 0; })[0];
      if (!s) { s = document.createElement('script'); s.src = LIB; s.async = true; document.head.appendChild(s); }
      s.addEventListener('load', function () { window.PJCC3 ? ok(window.PJCC3) : bad(new Error('PJCC3 missing')); });
      s.addEventListener('error', function () { bad(new Error('could not load ' + LIB)); });
      if (window.PJCC3) ok(window.PJCC3);
    });
  }
  function model(T, code) {
    return new Promise(function (ok, bad) { new T.GLTFLoader().load(MODELS + code + '.glb', function (g) { ok(g.scene); }, undefined, bad); });
  }
  function hexRgb(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  function smooth(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }

  // a label or a badge: a canvas on a plane that turns to face the camera
  function card(T, w, h, px) {
    var c = document.createElement('canvas'); c.width = Math.round(w * px); c.height = Math.round(h * px);
    var tex = new T.CanvasTexture(c); tex.colorSpace = T.SRGBColorSpace; tex.anisotropy = 4;
    // ⚠ OVER EVERYTHING: a name behind a pawn is a name nobody reads
    var m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false }));
    m.userData = { c: c, tex: tex, said: '' };
    m.renderOrder = 5;
    return m;
  }
  function badgeDraw(m, txt, col, fog) {
    var key = txt + '|' + col + '|' + fog;
    if (m.userData.said === key) return;
    m.userData.said = key;
    var c = m.userData.c, g = c.getContext('2d'), w = c.width, h = c.height, r = h * 0.44;
    g.clearRect(0, 0, w, h);
    g.beginPath(); g.arc(w / 2, h / 2, r, 0, Math.PI * 2);
    g.fillStyle = fog ? 'rgba(26,21,40,.92)' : 'rgba(13,10,23,.88)'; g.fill();
    g.lineWidth = h * 0.07; g.strokeStyle = col; g.stroke();
    g.fillStyle = fog ? '#b3a9cc' : col;
    g.font = '900 ' + Math.round(h * 0.5) + 'px "Trebuchet MS", sans-serif';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(txt, w / 2, h / 2 + h * 0.03);
    m.userData.tex.needsUpdate = true;
  }
  function nameDraw(m, txt, dim) {
    var key = txt + '|' + dim;
    if (m.userData.said === key) return;
    m.userData.said = key;
    var c = m.userData.c, g = c.getContext('2d'), w = c.width, h = c.height, fs = Math.round(h * 0.42);
    g.clearRect(0, 0, w, h);
    g.font = '700 ' + fs + 'px "Trebuchet MS", sans-serif';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    // a long name breaks onto two lines, as the flat map's does
    var lines = [txt], sp = txt.lastIndexOf(' ');
    if (g.measureText(txt).width > w * 0.94 && sp > 0) lines = [txt.slice(0, sp), txt.slice(sp + 1)];
    g.lineWidth = fs * 0.32; g.strokeStyle = 'rgba(42,26,12,.88)'; g.lineJoin = 'round';
    g.fillStyle = dim ? 'rgba(243,226,182,.5)' : '#f3e2b6';
    lines.forEach(function (l, i) {
      var y = lines.length === 1 ? h * 0.3 : h * 0.26 + i * fs * 1.05;
      g.strokeText(l, w / 2, y); g.fillText(l, w / 2, y);
    });
    m.userData.tex.needsUpdate = true;
  }

  // ── THE EIGHT-SIDED DIE, built face by face so each face carries its number (opposite faces add to nine) ──
  var FACES = [[1, 1, 1, 1], [-1, -1, -1, 8], [1, 1, -1, 2], [-1, -1, 1, 7], [1, -1, 1, 3], [-1, 1, -1, 6], [-1, 1, 1, 4], [1, -1, -1, 5]];
  var atlas = null;
  function dieAtlas(T) {
    if (atlas) return atlas;
    var c = document.createElement('canvas'); c.width = 512; c.height = 256;
    var g = c.getContext('2d');
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, 512, 256);
    g.fillStyle = INK; g.font = '900 58px "Trebuchet MS", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    for (var n = 1; n <= 8; n++) {
      var cx = ((n - 1) % 4) * 128 + 64, cy = Math.floor((n - 1) / 4) * 128;
      g.fillText(String(n), cx, cy + 128 * 0.66);
      if (n === 6 || n === 8) g.fillRect(cx - 14, cy + 128 * 0.66 + 26, 28, 5);   // 6 and 8 underlined, as dice do
    }
    atlas = new T.CanvasTexture(c); atlas.colorSpace = T.SRGBColorSpace;
    return atlas;
  }
  function dieGeometry(T) {
    var pos = [], nor = [], uv = [];
    FACES.forEach(function (f) {
      var v = [[f[0], 0, 0], [0, f[1], 0], [0, 0, f[2]]];
      if (f[0] * f[1] * f[2] < 0) { var t = v[1]; v[1] = v[2]; v[2] = t; }
      var n = f[3], u0 = ((n - 1) % 4) / 4, v0 = 1 - Math.floor((n - 1) / 4) / 2, cw = 0.25, ch = 0.5;
      var uvs = [[u0 + cw / 2, v0 - ch * 0.08], [u0 + cw * 0.06, v0 - ch * 0.94], [u0 + cw * 0.94, v0 - ch * 0.94]];
      var k = 1 / Math.sqrt(3);
      for (var i = 0; i < 3; i++) {
        pos.push(v[i][0] * DIE, v[i][1] * DIE, v[i][2] * DIE);
        nor.push(f[0] * k, f[1] * k, f[2] * k);
        uv.push(uvs[i][0], uvs[i][1]);
      }
    });
    var g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    g.setAttribute('normal', new T.Float32BufferAttribute(nor, 3));
    g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2));
    return g;
  }
  // the turn that stands face `v` on top, yawed by `yaw`
  function restOn(T, v, yaw) {
    var f = FACES.filter(function (x) { return x[3] === v; })[0] || FACES[0];
    var n = new T.Vector3(f[0], f[1], f[2]).normalize();
    var q = new T.Quaternion().setFromUnitVectors(n, new T.Vector3(0, 1, 0));
    return new T.Quaternion().setFromAxisAngle(new T.Vector3(0, 1, 0), yaw).multiply(q);
  }

  // ════════════════════════════════════════════════════════════════════════════════════════════════════════════
  function Table(opts) {
    this.o = opts; this.T = null; this.view = null; this.key = ''; this.live = 0; this.t = 0;
    this.holdings = []; this.roads = []; this.dice = []; this.throwing = null; this.pulse = false;
    this.size = [2, 2];
  }
  var P = Table.prototype;

  P.attach = function (T, M) {
    this.T = T; this.M = M;
    var host = this.o.host;
    var cv = document.createElement('canvas');
    cv.className = 'pjcc-sandtable';
    cv.setAttribute('aria-hidden', 'true');
    cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:2;cursor:pointer;touch-action:manipulation;';
    this.canvas = cv;
    var r = new T.WebGLRenderer({ canvas: cv, alpha: true, antialias: true });
    r.outputColorSpace = T.SRGBColorSpace; r.toneMapping = T.NoToneMapping;
    r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    r.shadowMap.enabled = true; r.shadowMap.type = T.PCFShadowMap;
    this.r = r;
    this.scene = new T.Scene();
    this.cam = new T.PerspectiveCamera(FOV, 1, 0.1, 400);
    var amb = new T.AmbientLight(0xffffff, 1.25);
    var key = new T.DirectionalLight(0xfff1d6, 2.0);
    key.position.set(-6, 14, 8); key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    var sc = key.shadow.camera; sc.left = -12; sc.right = 12; sc.top = 12; sc.bottom = -12; sc.near = 1; sc.far = 50;
    key.shadow.bias = -0.0008;
    this.scene.add(amb, key);
    this.root = new T.Group(); this.scene.add(this.root);
    this.pawnSkin = {};
    var self = this;
    cv.addEventListener('click', function (e) { self.onPress(e); });
    host.appendChild(cv);
    host.classList.add('sand-on');
    this.layout();
  };

  P.on = function () { return !!this.T && !flat(); };

  // ── the view drawMap hands over: rebuilt only where it changed ──
  P.set = function (view) {
    this.view = view;
    if (!this.T) return;
    var key = JSON.stringify([view.land.length, view.land[0] && view.land[0].nm, view.nodes, view.links, view.dog || '']);
    if (key === this.key) return;
    if (!this.built || this.built !== view.land.length + '|' + (view.land[0] && view.land[0].nm)) this.build(view);
    this.key = key;
    this.paint(view);
    this.touch();
  };

  // the table, its sand, the holdings and the roads, for this map
  P.build = function (view) {
    var T = this.T, root = this.root;
    while (root.children.length) root.remove(root.children[0]);
    this.built = view.land.length + '|' + (view.land[0] && view.land[0].nm);
    var big = view.land.length > 10, R = big ? MESA_BIG : MESA;
    this.R = R;
    var W = 100 * U + 1.6, H = 112 * U + 1.6;
    this.W = W; this.H = H;
    // the slab and its rim
    var slab = new T.Mesh(new T.BoxGeometry(W + 0.8, 0.6, H + 0.8), new T.MeshStandardMaterial({ color: WOOD, roughness: 0.8 }));
    slab.position.y = -0.36; slab.receiveShadow = true; root.add(slab);
    [[0, -(H + 0.4) / 2, W + 0.8, 0.4], [0, (H + 0.4) / 2, W + 0.8, 0.4], [-(W + 0.4) / 2, 0, 0.4, H], [(W + 0.4) / 2, 0, 0.4, H]].forEach(function (b) {
      var m = new T.Mesh(new T.BoxGeometry(b[2], 0.34, b[3]), new T.MeshStandardMaterial({ color: RIM, roughness: 0.7 }));
      m.position.set(b[0], 0.1, b[1]); m.castShadow = true; m.receiveShadow = true; root.add(m);
    });
    // the sand: a grain drawn once
    var c = document.createElement('canvas'); c.width = 512; c.height = 576;
    var g = c.getContext('2d'); g.fillStyle = SAND; g.fillRect(0, 0, 512, 576);
    var seed = 7; function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    for (var i = 0; i < 9000; i++) {
      var l = rnd(); g.fillStyle = l < 0.5 ? 'rgba(120,88,40,' + (0.05 + rnd() * 0.08) + ')' : 'rgba(255,240,205,' + (0.05 + rnd() * 0.1) + ')';
      g.fillRect(rnd() * 512, rnd() * 576, 1 + rnd() * 2, 1 + rnd() * 2);
    }
    var tex = new T.CanvasTexture(c); tex.colorSpace = T.SRGBColorSpace;
    var sand = new T.Mesh(new T.PlaneGeometry(W, H), new T.MeshStandardMaterial({ map: tex, roughness: 0.95 }));
    sand.rotation.x = -Math.PI / 2; sand.receiveShadow = true; root.add(sand);
    // the roads: a strip pressed into the sand between two holdings
    var self = this;
    this.roads = view.edges.map(function (e) {
      var a = self.at(view.land[e[0]]), b = self.at(view.land[e[1]]), d = b.clone().sub(a), len = d.length();
      var m = new T.Mesh(new T.BoxGeometry(0.14, 0.03, Math.max(0.1, len - R * 1.6)), new T.MeshStandardMaterial({ color: ROAD, roughness: 0.9 }));
      m.position.copy(a.clone().add(b).multiplyScalar(0.5)); m.position.y = 0.012;
      m.rotation.y = Math.atan2(d.x, d.z);
      m.receiveShadow = true; root.add(m);
      return m;
    });
    // the holdings: a colored base, a mesa of sand, their troops, a badge, a name, and the things that stand by them
    this.holdings = view.land.map(function (L) {
      var at = self.at(L), h = { id: L.id, at: at };
      h.base = new T.Mesh(new T.CylinderGeometry(R + 0.12, R + 0.16, 0.08, 40), new T.MeshStandardMaterial({ color: '#888888', roughness: 0.6 }));
      h.base.position.set(at.x, 0.04, at.z); h.base.receiveShadow = true; root.add(h.base);
      h.mesa = new T.Mesh(new T.CylinderGeometry(R * 0.96, R, MESA_H, 40), new T.MeshStandardMaterial({ color: MESA_TOP, roughness: 0.9 }));
      h.mesa.position.set(at.x, MESA_H / 2 + 0.04, at.z); h.mesa.castShadow = true; h.mesa.receiveShadow = true; root.add(h.mesa);
      h.ring = new T.Mesh(new T.CylinderGeometry(R + 0.3, R + 0.3, 0.02, 48), new T.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0, depthWrite: false }));
      h.ring.position.set(at.x, 0.015, at.z); root.add(h.ring);
      h.pawns = [];
      h.badge = card(T, BADGE, BADGE, 110); root.add(h.badge);
      h.name = card(T, NAME_W, NAME_H, 150); root.add(h.name);
      return h;
    });
    this.fit();
  };

  // a holding's place on the table: the page's percent map, the 1.12 tall box it shares with the SVG
  P.at = function (L) { return new this.T.Vector3((L.x - 50) * U, 0, (L.y * 1.12 - 56) * U); };

  P.pawn = function (col) {
    var T = this.T, src = this.M.wP, n = src.clone(true);
    if (!this.pawnSkin[col]) this.pawnSkin[col] = new T.MeshStandardMaterial({ color: col, roughness: 0.45, metalness: 0.05 });
    var sk = this.pawnSkin[col];
    n.traverse(function (m) { if (m.isMesh) { m.material = sk; m.castShadow = true; } });
    n.scale.setScalar(PAWN);
    return n;
  };
  P.rook = function () {
    var T = this.T, n = this.M.R.clone(true);
    var sk = new T.MeshStandardMaterial({ color: GOLD, roughness: 0.4, metalness: 0.2 });
    n.traverse(function (m) { if (m.isMesh) { m.material = sk; m.castShadow = true; } });
    n.userData.skin = sk;
    n.scale.setScalar(ROOK);
    return n;
  };

  // ── each holding as the page drew it: its classes are the state (sel, can, tgt, dim, fog, walls, truce …) ──
  P.paint = function (view) {
    var T = this.T, root = this.root, R = this.R, self = this;
    this.pulse = false;
    view.nodes.forEach(function (n, i) {
      var h = self.holdings[i]; if (!h) return;
      var cls = ' ' + n.cls + ' ', has = function (k) { return cls.indexOf(' ' + k + ' ') >= 0; };
      h.base.material.color.set(n.col);
      h.base.material.emissive = h.base.material.emissive || new T.Color();
      h.base.material.emissive.set(n.col); h.base.material.emissiveIntensity = has('chained') ? 0.55 : 0.25;
      // the troops: one of his pawns a troop, up to SHOW, painted the holder's color; none in the fog
      var want = n.fog ? 0 : Math.min(SHOW, n.ranks);
      if (h.pawnCol !== n.col || h.pawns.length !== want) {
        h.pawns.forEach(function (p) { root.remove(p); });
        h.pawns = [];
        for (var k = 0; k < want; k++) {
          var p = self.pawn(n.col), a = (k / Math.max(1, want)) * Math.PI * 2 + 0.6, rr = want === 1 ? 0 : R * 0.48;
          p.position.set(h.at.x + Math.cos(a) * rr, MESA_H + 0.04, h.at.z + Math.sin(a) * rr);
          p.rotation.y = a;
          root.add(p); h.pawns.push(p);
        }
        h.pawnCol = n.col;
      }
      badgeDraw(h.badge, n.fog ? '?' : String(n.ranks), n.col, n.fog);
      h.badge.position.set(h.at.x, MESA_H + 1.05, h.at.z - R * 0.15);
      nameDraw(h.name, view.land[i].nm, has('dim'));
      h.name.position.set(h.at.x, 0.1, h.at.z + R + NAME_H * 0.42);
      // the walls: a rook at the holding's shoulder, gold standing, gray once broken
      if (has('walls')) {
        if (!h.rook) { h.rook = self.rook(); root.add(h.rook); }
        h.rook.position.set(h.at.x + R * 0.78, MESA_H + 0.04, h.at.z - R * 0.62);
        h.rook.userData.skin.color.set(has('breached') ? '#8f9bb0' : GOLD);
      } else if (h.rook) { root.remove(h.rook); h.rook = null; }
      // a truce: a white flag
      if (has('truce')) {
        if (!h.flag) {
          h.flag = new T.Group();
          var pole = new T.Mesh(new T.CylinderGeometry(0.025, 0.025, 0.9, 8), new T.MeshStandardMaterial({ color: '#d8d0c0' }));
          pole.position.y = 0.45;
          var cloth = new T.Mesh(new T.PlaneGeometry(0.42, 0.26), new T.MeshStandardMaterial({ color: '#f6f2e8', side: 2 }));
          cloth.position.set(0.21, 0.75, 0);
          h.flag.add(pole, cloth); root.add(h.flag);
        }
        h.flag.position.set(h.at.x - R * 0.75, MESA_H + 0.04, h.at.z - R * 0.5);
      } else if (h.flag) { root.remove(h.flag); h.flag = null; }
      // the ring under it says what a press here would do
      var ring = has('sel') ? [GOLD, 0.9] : has('tgt') ? [HOT, 0.85] : has('doom') ? [HOT, 0.7] : has('teach') ? [GOLD, 0.8]
        : has('sniff') ? [GOLD, 0.6] : has('can') ? [n.col, 0.55] : has('flash') ? ['#ffffff', 0.7] : null;
      h.ring.material.opacity = ring ? ring[1] : 0;
      if (ring) h.ring.material.color.set(ring[0]);
      h.ringPulse = has('tgt') || has('doom') || has('teach');
      if (h.ringPulse) self.pulse = true;
      h.dim = has('dim');
      h.mesa.material.color.set(h.dim ? '#8c7a58' : MESA_TOP);
      h.flash = has('flash') ? 1 : 0;
    });
    // the roads: a chain in its color, the road an attack goes down in gold
    view.links.forEach(function (cls, i) {
      var m = self.roads[i]; if (!m) return;
      var c = ' ' + cls + ' ', col = ROAD, w = 1;
      var ch = /chain-(\w)/.exec(cls);
      if (ch && view.colors && view.colors[ch[1]]) { col = view.colors[ch[1]]; w = 1.4; }
      if (c.indexOf(' hot ') >= 0) { var hc = /hot-(\w)/.exec(cls); col = hc && view.colors && view.colors[hc[1]] ? view.colors[hc[1]] : GOLD; w = 1.8; }
      m.material.color.set(col);
      m.scale.x = w;
    });
    // your dog, as the page draws him: a picture standing on his holding
    if (this.dogCard) { root.remove(this.dogCard); this.dogCard = null; }
    if (view.dog && view.dogAt >= 0 && this.holdings[view.dogAt]) {
      var dc = card(T, 0.8, 0.8, 96), img = new Image(), dh = this.holdings[view.dogAt], self2 = this;
      img.onload = function () { var g = dc.userData.c.getContext('2d'); g.drawImage(img, 0, 0, dc.userData.c.width, dc.userData.c.height); dc.userData.tex.needsUpdate = true; self2.touch(); };
      img.src = view.dog;
      dc.position.set(dh.at.x - R * 0.85, MESA_H + 0.45, dh.at.z + R * 0.2);
      root.add(dc); this.dogCard = dc;
    }
  };

  // ── the camera: at rest over the table's near edge, fitted to the frame ──
  P.layout = function () {
    var host = this.o.host, w = Math.max(2, host.clientWidth), h = Math.max(2, host.clientHeight);
    if (w === this.size[0] && h === this.size[1]) return;
    this.size = [w, h];
    if (!this.r) return;
    this.r.setSize(w, h, false);
    this.cam.aspect = w / h; this.cam.updateProjectionMatrix();
    this.fit(); this.touch();
  };
  P.fit = function () {
    if (!this.W) return;
    var T = this.T, cam = this.cam, W = this.W / 2 + 0.4, H = this.H / 2 + 0.4, pts = [];
    // the corners, and the far row's badges standing up off the sand
    [-W, W].forEach(function (x) { [-H, H].forEach(function (z) { pts.push(new T.Vector3(x, 0, z)); }); pts.push(new T.Vector3(x * 0.8, MESA_H + 1.05 + BADGE / 2, -H + 2.4)); });
    var t = TILT * Math.PI / 180, back = new T.Vector3(0, Math.sin(t), Math.cos(t)), aim = new T.Vector3(), d = 30, self = this;
    var th = Math.tan(FOV * Math.PI / 360), aspect = this.size[0] / this.size[1];
    function box(aimV, dist) {
      cam.position.copy(aimV).add(back.clone().multiplyScalar(dist)); cam.lookAt(aimV); cam.updateMatrixWorld();
      var out = [9, 9, -9, -9];
      pts.forEach(function (p) { var v = p.clone().project(cam); out[0] = Math.min(out[0], v.x); out[1] = Math.min(out[1], v.y); out[2] = Math.max(out[2], v.x); out[3] = Math.max(out[3], v.y); });
      return out;
    }
    for (var pass = 0; pass < 3; pass++) {
      var lo = 4, hi = 160;
      for (var i = 0; i < 26; i++) { d = (lo + hi) / 2; var b = box(aim, d); if (Math.max(-b[0], b[2], -b[1], b[3]) <= EDGE) hi = d; else lo = d; }
      d = hi;
      var b2 = box(aim, d), mx = (b2[0] + b2[2]) / 2, my = (b2[1] + b2[3]) / 2;
      var right = new T.Vector3(1, 0, 0), up = new T.Vector3(0, Math.cos(t), -Math.sin(t));
      aim.add(right.multiplyScalar(mx * d * th * aspect)).add(up.multiplyScalar(my * d * th));
    }
    this.aim = aim; this.dist = d;
    box(aim, d);
    void self;
  };

  // ── a press: the holding drawn nearest the finger, within reach of its mesa ──
  P.holdingAt = function (x, y) {
    var best = -1, bd = Infinity, self = this, R = this.R || MESA;
    this.holdings.forEach(function (h) {
      var p = self.seen(h.at.clone().setY(MESA_H)), q = self.seen(h.at.clone().add(new self.T.Vector3(R, MESA_H, 0)));
      var reach = Math.max(18, Math.abs(q[0] - p[0]) * 1.25), d = Math.hypot(p[0] - x, p[1] - y);
      if (d < reach && d < bd) { bd = d; best = h.id; }
    });
    return best;
  };
  P.seen = function (v) { var p = v.clone().project(this.cam); return [(p.x + 1) / 2 * this.size[0], (1 - p.y) / 2 * this.size[1]]; };
  P.onPress = function (e) {
    if (!this.on()) return;
    var r = this.canvas.getBoundingClientRect(), id = this.holdingAt(e.clientX - r.left, e.clientY - r.top);
    if (id >= 0 && this.o.press) this.o.press(id);
  };

  // ── THE THROW: each die leaves its side's holding, tumbles, and stands on the face it rolled ──
  P.throwDice = function (spec, done) {
    var T = this.T;
    this.clearDice();
    // ⚠ NO THROW, NO CALLBACK: the page goes the flat way itself when this says false
    if (!T || !this.on() || !this.holdings[spec.from] || !this.holdings[spec.to]) return false;
    var a = this.holdings[spec.from].at, b = this.holdings[spec.to].at, mid = a.clone().add(b).multiplyScalar(0.5);
    var dir = b.clone().sub(a).setY(0); if (dir.length() < 0.01) dir.set(0, 0, -1); dir.normalize();
    var side = new T.Vector3(-dir.z, 0, dir.x), geo = dieGeometry(T), tex = dieAtlas(T), self = this;
    var groups = { att: spec.dice.filter(function (d) { return d.side === 'att'; }), def: spec.dice.filter(function (d) { return d.side === 'def'; }) };
    ['att', 'def'].forEach(function (g) {
      var all = groups[g], from = g === 'att' ? a : b, sign = g === 'att' ? -1 : 1;
      all.forEach(function (d) {
        // a row a pool: material nearer the middle, position behind it
        var list = all.filter(function (x) { return (x.row || 0) === (d.row || 0); }), i = list.indexOf(d);
        var toward = sign * (0.55 + (d.row || 0) * DIE * 2.6);
        var mat = new T.MeshStandardMaterial({ map: tex, color: '#f3ecdc', roughness: 0.35 });
        var m = new T.Mesh(geo, mat); m.castShadow = true;
        var off = (i - (list.length - 1) / 2) * DIE * 2.5;
        var rest = mid.clone().add(dir.clone().multiplyScalar(toward + (Math.random() - 0.5) * 0.12)).add(side.clone().multiplyScalar(off));
        rest.y = DIE / Math.sqrt(3);
        var start = from.clone().add(side.clone().multiplyScalar(off * 0.4)); start.y = 1.6;
        var q1 = restOn(T, d.v, Math.random() * Math.PI * 2);
        var axis = new T.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
        var ring = null;
        if (d.kept) {
          ring = new T.Mesh(new T.CylinderGeometry(DIE * 1.45, DIE * 1.45, 0.02, 32), new T.MeshBasicMaterial({ color: d.col, transparent: true, opacity: 0, depthWrite: false }));
          ring.position.set(rest.x, 0.02, rest.z); self.root.add(ring);
        }
        m.position.copy(start); self.root.add(m);
        self.dice.push({ m: m, mat: mat, start: start, rest: rest, q1: q1, axis: axis, spin: 6 + Math.random() * 6, v: d.v, ring: ring,
          delay: i * 0.06 + (d.row || 0) * 0.1 });
      });
    });
    this.throwing = { t: calm() ? THROW + 1 : 0, done: done, landed: false, gone: LINGER };
    this.touch();
    return true;
  };
  P.clearDice = function () {
    var root = this.root;
    this.dice.forEach(function (d) { root.remove(d.m); d.mat.dispose(); if (d.ring) root.remove(d.ring); });
    this.dice = []; this.throwing = null;
  };
  P.stepDice = function (dt) {
    var th = this.throwing, T = this.T;
    if (!th) return;
    th.t += dt;
    this.dice.forEach(function (d) {
      var f = Math.max(0, Math.min(1, (th.t - d.delay) / THROW)), e = 1 - Math.pow(1 - f, 3);
      d.m.position.lerpVectors(d.start, d.rest, e);
      // two bounces, each smaller, then still
      var hop = f < 1 ? Math.abs(Math.sin(f * Math.PI * 2.5)) * (1 - f) * (1 - f) * 1.4 : 0;
      d.m.position.y = d.rest.y + (1 - e) * (d.start.y - d.rest.y) * (1 - f) + hop;
      var left = (1 - f) * (1 - f) * d.spin;
      d.m.quaternion.copy(d.q1).multiply(new T.Quaternion().setFromAxisAngle(d.axis, left));
      if (f >= 1 && !d.set) {
        d.set = true;
        d.mat.color.set(BAND[Math.min(3, Math.max(0, Math.ceil(d.v * 4 / 8) - 1))]);
        if (d.ring) d.ring.material.opacity = 0.85;
      }
    });
    var all = this.dice.every(function (d) { return d.set; });
    if (all && !th.landed) { th.landed = true; var cb = th.done; th.done = null; if (cb) setTimeout(cb, SEE * 1000); }
    if (th.landed) { th.gone -= dt; if (th.gone <= 0) this.clearDice(); }
    this.touch();
  };

  P.touch = function () { this.live = Math.max(this.live, 2); };
  P.frame = function (dt) {
    if (!this.T) return;
    var show = this.on();
    this.canvas.style.display = show ? '' : 'none';
    this.o.host.classList.toggle('sand-on', show);
    if (!show) return;
    this.layout();
    this.t += dt;
    if (this.throwing) this.stepDice(dt);
    // the rings that ask for a press breathe, and a holding that just changed lifts
    var self = this, k = 0.5 + 0.5 * Math.sin(this.t * 5.5), any = false;
    this.holdings.forEach(function (h) {
      if (h.ringPulse && !calm()) { h.ring.scale.setScalar(1 + 0.12 * k); any = true; } else h.ring.scale.setScalar(1);
      if (h.flash > 0) { h.flash = Math.max(0, h.flash - dt / 0.42); h.mesa.scale.y = 1 + 0.6 * Math.sin(h.flash * Math.PI); any = true; }
      else h.mesa.scale.y = 1;
    });
    if (any) this.touch();
    if (this.live > 0) {
      var q = this.cam.quaternion;
      this.holdings.forEach(function (h) { h.badge.quaternion.copy(q); h.name.quaternion.copy(q); });
      if (this.dogCard) this.dogCard.quaternion.copy(q);
      this.r.render(this.scene, this.cam);
      this.live--;
    }
    void self;
  };

  // ── one clock for the page ──
  var tables = [], lastT = 0, ticking = false, labels = [];
  function tick(now) {
    var dt = lastT ? Math.min(0.25, (now - lastT) / 1000) : 0;
    lastT = now;
    tables.forEach(function (t) { try { t.frame(dt); } catch (e) { console.error('[sandtable]', e); } });
    requestAnimationFrame(tick);
  }
  function Handle(opts) {
    var t = new Table(opts);
    this.t = t;
    tables.push(t);
    if (!ticking) { ticking = true; requestAnimationFrame(tick); }
    if (!webgl()) return;
    lib().then(function (T) {
      return Promise.all([model(T, 'wP'), model(T, 'R')]).then(function (m) { return [T, { wP: m[0], R: m[1] }]; });
    }).then(function (TM) {
      t.attach(TM[0], TM[1]);
      if (t.view) { var v = t.view; t.view = null; t.set(v); }
      labels.forEach(function (f) { f(); });
      if (opts.onUp) opts.onUp();
    }).catch(function (e) { console.warn('[sandtable] staying flat:', e && e.message); });
  }
  var Hp = Handle.prototype;
  Hp.on = function () { return this.t.on(); };
  Hp.up = function () { return !!this.t.T; };
  Hp.set = function (v) { this.t.set(v); };
  Hp.throwDice = function (spec, done) { return this.t.throwDice(spec, done); };
  Hp.throwing = function () { return !!this.t.throwing; };
  Hp.holdingAt = function (x, y) { return this.t.holdingAt(x, y); };
  // where a holding's mesa is drawn, in the host's pixels (the page's tests press it there)
  Hp.pointOf = function (id) {
    var t = this.t, h = t.holdings[id];
    return h && t.T ? t.seen(h.at.clone().setY(MESA_H)) : null;
  };
  Hp.dice = function () { return this.t.dice.map(function (d) { return { v: d.v, set: !!d.set }; }); };
  // the map's own button: "Map: Sand table" or "Map: Flat", the view it is showing; hidden with no 3D to show
  Hp.button = function (cls) {
    var b = document.createElement('button'), self = this;
    b.type = 'button'; b.className = cls || 'mapview';
    function label() { b.textContent = flat() ? 'Map: Flat' : 'Map: Sand table'; b.hidden = !self.t.T; }
    label();
    b.addEventListener('click', function (e) { e.stopPropagation(); setFlat(!flat()); labels.forEach(function (f) { f(); }); self.t.touch(); });
    labels.push(label);
    return b;
  };
  window.PJCCSand = {
    mount: function (opts) { return new Handle(opts); },
    flat: flat, setFlat: function (on) { setFlat(on); labels.forEach(function (f) { f(); }); },
    // the numbers, for the page's tests and the game's twin
    U: U, TILT: TILT, FOV: FOV, MESA: MESA, MESA_BIG: MESA_BIG, MESA_H: MESA_H, PAWN: PAWN, SHOW: SHOW, DIE: DIE,
    BADGE: BADGE, NAME_W: NAME_W, NAME_H: NAME_H, ROOK: ROOK,
    THROW: THROW, SEE: SEE, LINGER: LINGER, FACES: FACES, BAND: BAND, KEY: KEY,
  };
})();
