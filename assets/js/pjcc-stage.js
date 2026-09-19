/* pjcc-stage.js — draws a Blender model (GLB) into any element carrying data-stage-model.
 *   <div data-stage-model="/assets/models/x.glb" data-stage-glow="MaterialName">…</div>
 * Once live: host.classList has 'is-3d', host.pjccStage.react('offer'|'gain'|'even'|'loss'|'rest').
 * If WebGL or a file is missing the host is left exactly as authored (data-stage-state="down"). */
(function () {
  'use strict';
  var me = document.currentScript;
  var LIB = me ? me.src.replace(/js\/pjcc-stage\.js.*$/, 'vendor/three/three.pjcc.min.js') : '';
  var libP = null;

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

  var reduceMq = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : null;
  function still() {
    return (reduceMq && reduceMq.matches) || document.documentElement.classList.contains('reduce-flourish');
  }

  var MOODS = {
    offer: { color: 0xb48cff, peak: 1.2, hold: 900, spin: 9 },
    gain:  { color: 0xF5C518, peak: 2.2, hold: 1600, spin: 3 },
    even:  { color: 0xcdbcf2, peak: 0.9, hold: 1200, spin: 0 },
    loss:  { color: 0x3a2a6a, peak: 0, hold: 700, spin: 0, dim: 0.45 },
  };

  function build(host, T, model) {
    var canvas = document.createElement('canvas');
    canvas.className = 'stage-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    var dpr = Math.min(3, window.devicePixelRatio || 1);
    // MSAA is ~8x the canvas in GPU memory; native 2x/3x hides the edges without it. Capping a
    // 3x iPhone at 2 upscales the canvas and the stair-steps show.
    var r = new T.WebGLRenderer({ canvas: canvas, alpha: true, antialias: dpr < 2, powerPreference: 'low-power' });
    r.outputColorSpace = T.SRGBColorSpace;
    r.toneMapping = T.ACESFilmicToneMapping;
    r.setPixelRatio(dpr);

    var scene = new T.Scene();
    var sky = new T.HemisphereLight(0xe3d6ff, 0x1a0f3d, 2.2);
    var key = new T.DirectionalLight(0xffe7a8, 3.2);
    var rim = new T.DirectionalLight(0x9a7fd4, 2.4);
    key.position.set(3, 5, 4);
    rim.position.set(-4, 2, -4);
    scene.add(sky, key, rim);

    // ⚠ TINT ONLY WHILE THE ART IS SILENT. A named material is his color decision; Blender's
    // default "Material*" and no material at all are not. Same rule as the town's player.
    var painted = false;
    model.traverse(function (o) {
      if (o.isMesh) [].concat(o.material).forEach(function (m) {
        if (m && m.name && !/^Material(\.\d+)?$/.test(m.name)) painted = true;
      });
    });
    /* ⚠⚠ NORMALIZE BEFORE CLONING, or a stack does not stack: Blender's origin can sit
       anywhere in the piece, so a copy placed at y=1 leaves a gap or sinks. `norm` holds the
       model centered on x/z with its BASE at y=0 — then y is in piece-heights and a copy at
       scale s stacks at steps of s. */
    var mb = new T.Box3().setFromObject(model);
    var unit = mb.getSize(new T.Vector3()), mmid = mb.getCenter(new T.Vector3());
    model.position.set(-mmid.x, -mb.min.y, -mmid.z);
    var norm = new T.Group();
    norm.add(model);

    var arrangement = host.dataset.stageCopies ? JSON.parse(host.dataset.stageCopies) : null;
    var tints = host.dataset.stageTints ? JSON.parse(host.dataset.stageTints) : [];
    var piece = norm;
    if (arrangement && arrangement.length) {
      piece = new T.Group();
      // a row with `n` is a STACK of n, each layer taking the next tint and a twist off the last
      arrangement.forEach(function (c) {
        var s = c.s || 1;
        for (var i = 0; i < (c.n || 1); i++) {
          var one = norm.clone(true);
          one.scale.setScalar(s);
          one.position.set((c.x || 0) * unit.x, ((c.y || 0) + i * s) * unit.y, (c.z || 0) * unit.z);
          one.rotation.y = (c.ry || 0) + i * (c.twist === undefined ? 0.38 : c.twist);
          one.userData.wantY = (c.y || 0) + i * s;   // where its base belongs, in pieces
          var paint = c.tint || tints[(i + (c.t0 || 0)) % (tints.length || 1)];
          if (paint && !painted) one.traverse(function (o) {
            if (!o.isMesh) return;
            o.material = [].concat(o.material).map(function (m) {
              var d = m.clone();
              d.color = new T.Color(paint);
              return d;
            })[0];
          });
          piece.add(one);
        }
      });
    }

    var box = new T.Box3().setFromObject(piece);
    var size = box.getSize(new T.Vector3()), mid = box.getCenter(new T.Vector3());
    piece.position.set(-mid.x, -box.min.y, -mid.z);
    var spinner = new T.Group();
    spinner.add(piece);
    scene.add(spinner);

    // ⚠ traverse the ARRANGED piece: with copies the originals are clones and never rendered
    var glowName = host.dataset.stageGlow, glowMats = [];
    piece.traverse(function (o) {
      if (o.isMesh) [].concat(o.material).forEach(function (m) {
        if (m.name === glowName && glowMats.indexOf(m) < 0) glowMats.push(m);
      });
    });
    var halo = new T.PointLight(0xF5C518, 0, size.x * 3);
    halo.position.set(0, size.y * 1.6, 0);
    scene.add(halo);

    /* THE FIT: back the camera off until the piece's silhouette sits inside the box, whatever
       shape either is. Measured by PROJECTING corners rather than by trigonometry, so it holds
       for a tall model in a wide card and a wide village on a phone alike.
       ⚠ The piece TURNS, so the corners are of the swept cylinder (radius about the Y axis),
       not of the model's own box — otherwise it fits at yaw 0 and clips a quarter turn later.
       aim raises what the camera looks at, in piece heights: 1.25 sits it low in frame (the
       Gambit, with the coin above it), ~0.5 centers it. fill is the share of the box it spans. */
    var R = Math.max(size.x, size.y, size.z);
    // ⚠ measured AFTER the recentring above — a radius taken from the old origin fits the
    // wrong cylinder and clips whichever copy sat furthest from it.
    var cbox = new T.Box3().setFromObject(piece);
    var rad = 0;
    [[cbox.min.x, cbox.min.z], [cbox.min.x, cbox.max.z], [cbox.max.x, cbox.min.z], [cbox.max.x, cbox.max.z]]
      .forEach(function (c) { rad = Math.max(rad, Math.sqrt(c[0] * c[0] + c[1] * c[1])); });
    var corners = [];
    for (var ci = 0; ci < 8; ci++) {
      corners.push(new T.Vector3(ci & 1 ? rad : -rad, ci & 2 ? size.y : 0, ci & 4 ? rad : -rad));
    }
    var aim = host.dataset.stageAim !== undefined ? parseFloat(host.dataset.stageAim) : 0.55;
    var fill = parseFloat(host.dataset.stageFill) || 0.9;
    var cam = new T.PerspectiveCamera(28, 2, R * 0.05, R * 60);

    function place(d) {
      var at = size.y * aim;
      cam.position.set(0, at + d * 0.375, d * 0.927);   // ~22° above the horizon
      cam.lookAt(0, at, 0);
      cam.updateMatrixWorld(true);
    }

    function reframe() {
      cam.updateProjectionMatrix();
      var lo = rad, hi = Math.max(rad, size.y) * 30, v = new T.Vector3();
      for (var it = 0; it < 22; it++) {
        var d = (lo + hi) / 2;
        place(d);
        var m = 0;
        for (var i = 0; i < 8; i++) {
          v.copy(corners[i]).project(cam);
          m = Math.max(m, Math.abs(v.x), Math.abs(v.y));
        }
        if (m > fill) lo = d; else hi = d;
      }
      place(hi);
    }

    var yaw = 0.6, spinV = 0, glow = 0, glowTo = 0, dim = 1, dimTo = 1, holdT = 0, resting = false;
    var tint = new T.Color(0xF5C518), onScreen = true, raf = 0, last = 0, w = 0, h = 0;

    function busy() { return spinV > 0.02 || Math.abs(glow - glowTo) > 0.01 || Math.abs(dim - dimTo) > 0.01; }
    function kick() { if (!raf && onScreen && w && h) { last = 0; raf = requestAnimationFrame(frame); } }

    function frame(t) {
      raf = 0;
      var calm = resting || still();
      if (!calm && !holdT && !busy() && last && t - last < 32) { raf = requestAnimationFrame(frame); return; }
      var dt = last ? Math.min(0.05, (t - last) / 1000) : 0;
      last = t;
      if (!calm) yaw += dt * 0.35;
      yaw += dt * spinV;
      spinV *= Math.pow(0.04, dt);
      if (spinV < 0.02) spinV = 0;
      if (holdT && t > holdT) { glowTo = 0; dimTo = resting ? 0.6 : 1; holdT = 0; }
      var k = Math.min(1, dt * 5);
      glow += (glowTo - glow) * k;
      dim += (dimTo - dim) * k;
      spinner.rotation.y = yaw;
      for (var i = 0; i < glowMats.length; i++) {
        glowMats[i].emissive.copy(tint);
        glowMats[i].emissiveIntensity = glow;
      }
      halo.color.copy(tint);
      halo.intensity = glow * 6;
      sky.intensity = 2.2 * dim;
      key.intensity = 3.2 * dim;
      r.render(scene, cam);
      if (onScreen && (!calm || busy() || holdT)) raf = requestAnimationFrame(frame);
    }

    // 'rest' stops the idle turn and dims for good; it lets a running glow finish first
    function react(kind) {
      if (kind === 'rest') {
        resting = true;
        if (!holdT) dimTo = 0.6;
        return kick();
      }
      var m = MOODS[kind];
      if (!m) return;
      tint.setHex(m.color);
      glowTo = m.peak;
      if (m.dim) dimTo = m.dim;
      if (m.spin && !still()) spinV = m.spin;
      holdT = performance.now() + m.hold;
      kick();
    }

    new ResizeObserver(function () {
      w = host.clientWidth; h = host.clientHeight;
      if (!w || !h) return;
      r.setSize(w, h, false);
      cam.aspect = w / h;
      reframe();
      cam.updateProjectionMatrix();
      if (!canvas.parentNode) {
        host.insertBefore(canvas, host.firstChild);
        host.classList.add('is-3d');
        host.dataset.stageState = 'live';
      }
      kick();
      if (!raf) r.render(scene, cam);
    }).observe(host);

    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) {
      onScreen = es[es.length - 1].isIntersecting;
      kick();
    }).observe(host);

    // `pieces`/`colors` describe what was actually built — what tests/stage.check.js reads to
    // compare the arrangement against the page that asked for it
    var colors = [];
    piece.traverse(function (o) {
      if (!o.isMesh) return;
      [].concat(o.material).forEach(function (m) {
        var hex = '#' + m.color.getHexString();
        if (colors.indexOf(hex) < 0) colors.push(hex);
      });
    });
    /* `feet` is the spread of the copies' BASES, in pieces. Copies at different scales whose
       model was not normalized sit at different heights — invisible in the total height, which
       is why the gate reads this separately. */
    var feet = 0;
    scene.updateMatrixWorld(true);   // world boxes are stale until something renders
    piece.children.forEach(function (o) {
      if (piece === norm || o.userData.wantY === undefined) return;
      var base = (new T.Box3().setFromObject(o).min.y - piece.position.y) / unit.y;
      feet = Math.max(feet, Math.abs(base - o.userData.wantY));
    });
    host.pjccStage = {
      react: react, pieces: piece === norm ? 1 : piece.children.length, colors: colors.sort(),
      tall: size.y / unit.y,   // the arrangement's height in pieces: a flush stack of 9 reads 9
      feet: feet,
    };
  }

  // a hidden host (the Gambit's gate/main pair) must not cost a WebGL context
  function mount(host) {
    if (host.dataset.stageState) return;
    host.dataset.stageState = 'waiting';
    var ro = new ResizeObserver(function () {
      if (!host.clientWidth || !host.clientHeight) return;
      ro.disconnect();
      load(host);
    });
    ro.observe(host);
  }

  function load(host) {
    host.dataset.stageState = 'loading';
    var T;
    lib().then(function (L) {
      T = L;
      return new T.GLTFLoader().loadAsync(host.dataset.stageModel);
    }).then(function (gltf) {
      build(host, T, gltf.scene);
    }).catch(function (e) {
      host.dataset.stageState = 'down';
      console.warn('[pjcc-stage]', host.dataset.stageModel, e && e.message ? e.message : e);
    });
  }

  function boot() {
    if (!window.ResizeObserver || !LIB) return;
    var hosts = document.querySelectorAll('[data-stage-model]');
    if (!hosts.length) return;
    lib().catch(function () {});
    [].forEach.call(hosts, mount);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  window.PJCCStage = { mount: mount };
})();
