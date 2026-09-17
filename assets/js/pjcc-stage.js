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

    var box = new T.Box3().setFromObject(model);
    var size = box.getSize(new T.Vector3()), mid = box.getCenter(new T.Vector3());
    model.position.set(-mid.x, -box.min.y, -mid.z);
    var spinner = new T.Group();
    spinner.add(model);
    scene.add(spinner);

    var glowName = host.dataset.stageGlow, glowMats = [];
    model.traverse(function (o) {
      if (o.isMesh) [].concat(o.material).forEach(function (m) {
        if (m.name === glowName && glowMats.indexOf(m) < 0) glowMats.push(m);
      });
    });
    var halo = new T.PointLight(0xF5C518, 0, size.x * 3);
    halo.position.set(0, size.y * 1.6, 0);
    scene.add(halo);

    var R = Math.max(size.x, size.y, size.z);
    var cam = new T.PerspectiveCamera(28, 2, R * 0.05, R * 30);
    cam.position.set(0, R * 1.3, R * 3.2);
    cam.lookAt(0, size.y * 1.25, 0);

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

    host.pjccStage = { react: react };
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
