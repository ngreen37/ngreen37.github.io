/* pwa-register.js — the PWA's single on/off gate + install/update UI.
 *
 * PRIVATE BY DEFAULT. While ENABLED is false, the general public gets NOTHING:
 * no web-app manifest, no service worker, no install prompt — every page behaves
 * exactly as it did before the PWA existed.
 *
 *   • Preview it privately (your browser only): visit any page with ?pwa=on
 *     (turn it back off with ?pwa=off — that also unregisters the preview worker).
 *   • Launch it for EVERYONE: set  ENABLED = true  below (one line) and ship.
 *
 * When active it: injects the manifest + Apple home-screen meta, registers /sw.js,
 * shows an "update ready" toast, a custom install bar (Chrome/Android), and a
 * one-time iOS "Add to Home Screen" hint. It builds its own themed UI, so it works
 * on every layout without editing any <body>.
 */
(function () {
  'use strict';

  // ── LAUNCH SWITCH ─────────────────────────────────────────────────────────
  var ENABLED = false;   // ← flip to true to make the whole site installable for everyone
  // ──────────────────────────────────────────────────────────────────────────

  var LS_DEV               = 'pjcc.pwa.dev';
  var LS_INSTALL_DISMISSED = 'pjcc.pwa.installDismissed';
  var LS_IOS_HINTED        = 'pjcc.pwa.iosHinted';

  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function lsDel(k) { try { localStorage.removeItem(k); } catch (e) {} }

  // ?pwa=on / ?pwa=off → persistent private-preview flag (this browser only)
  var forcedOff = false;
  try {
    var q = new URLSearchParams(location.search);
    if (q.get('pwa') === 'on')  lsSet(LS_DEV, '1');
    if (q.get('pwa') === 'off') { lsDel(LS_DEV); forcedOff = true; }
  } catch (e) {}

  var active = ENABLED || lsGet(LS_DEV) === '1';

  if (!active) {
    // Public path: touch nothing. If someone explicitly turned preview OFF, also
    // tear down any service worker / caches a previous preview left behind.
    if (forcedOff) teardownPreview();
    return;
  }

  function teardownPreview() {
    try {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function (rs) {
          rs.forEach(function (r) { r.unregister(); });
        }).catch(function () {});
      }
      if (window.caches && caches.keys) {
        caches.keys().then(function (ks) {
          ks.forEach(function (k) { if (k.indexOf('pjcc-') === 0) caches.delete(k); });
        }).catch(function () {});
      }
    } catch (e) {}
  }

  /* ---- inject the manifest + Apple meta (only now that we're active) ---- */
  function injectHead() {
    if (document.getElementById('pjcc-manifest')) return;
    var link = document.createElement('link');
    link.id = 'pjcc-manifest'; link.rel = 'manifest'; link.href = '/manifest.json';
    document.head.appendChild(link);
    var apple = document.createElement('link');
    apple.rel = 'apple-touch-icon'; apple.href = '/assets/images/pwa/apple-touch-icon.png';
    document.head.appendChild(apple);
    var metas = {
      'mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'black-translucent',
      'apple-mobile-web-app-title': 'PJCC',
      'application-name': 'PJCC'
    };
    Object.keys(metas).forEach(function (n) {
      var m = document.createElement('meta'); m.name = n; m.content = metas[n]; document.head.appendChild(m);
    });
  }

  function standalone() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true;
  }

  /* ---- styles (injected once) ---- */
  function injectStyles() {
    if (document.getElementById('pjcc-pwa-style')) return;
    var css =
      '.pjcc-pwa-bar{position:fixed;left:50%;transform:translateX(-50%) translateY(140%);' +
      'bottom:calc(14px + env(safe-area-inset-bottom));z-index:9000;display:flex;align-items:center;' +
      'gap:12px;max-width:min(560px,calc(100vw - 24px));width:max-content;padding:11px 12px 11px 16px;' +
      'border-radius:14px;background:linear-gradient(160deg,#241653,#160c33);color:#efe9ff;' +
      'border:1px solid rgba(245,197,24,.45);box-shadow:0 18px 44px -16px rgba(0,0,0,.8),0 0 0 1px rgba(0,0,0,.4);' +
      'font-family:Inter,system-ui,sans-serif;font-size:.9rem;opacity:0;pointer-events:none;' +
      'transition:transform .42s cubic-bezier(.2,.9,.25,1),opacity .42s ease}' +
      '.pjcc-pwa-bar.in{transform:translateX(-50%) translateY(0);opacity:1;pointer-events:auto}' +
      '.pjcc-pwa-ico{font-size:1.3rem;line-height:1;filter:drop-shadow(0 1px 3px rgba(0,0,0,.5))}' +
      '.pjcc-pwa-txt{line-height:1.25;min-width:0}' +
      '.pjcc-pwa-txt b{display:block;font-family:Poppins,Inter,sans-serif;font-weight:700;color:#fff}' +
      '.pjcc-pwa-txt span{color:#b9a9e8;font-size:.8rem}' +
      '.pjcc-pwa-act{flex:0 0 auto;background:#F5C518;color:#160c33;border:0;border-radius:9px;' +
      'font-weight:800;font-family:Poppins,Inter,sans-serif;font-size:.85rem;padding:9px 14px;cursor:pointer;' +
      'white-space:nowrap}' +
      '.pjcc-pwa-act:hover{background:#ffd748}' +
      '.pjcc-pwa-x{flex:0 0 auto;background:transparent;border:0;color:#9a8bd0;font-size:1.1rem;' +
      'line-height:1;cursor:pointer;padding:6px;border-radius:8px}' +
      '.pjcc-pwa-x:hover{color:#fff;background:rgba(255,255,255,.08)}' +
      '@media (prefers-reduced-motion:reduce){.pjcc-pwa-bar{transition:opacity .2s ease}}' +
      '@media (max-width:520px){.pjcc-pwa-bar{left:12px;right:12px;transform:translateY(140%);max-width:none;width:auto}' +
      '.pjcc-pwa-bar.in{transform:translateY(0)}}';
    var s = document.createElement('style');
    s.id = 'pjcc-pwa-style';
    s.textContent = css;
    document.head.appendChild(s);
  }

  /* ---- a bottom bar: {icon, title, subtitle, actionLabel, onAction, onDismiss} ---- */
  function makeBar(opts) {
    injectStyles();
    var bar = document.createElement('div');
    bar.className = 'pjcc-pwa-bar';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-label', opts.title);

    var ico = document.createElement('div');
    ico.className = 'pjcc-pwa-ico';
    ico.setAttribute('aria-hidden', 'true');
    ico.textContent = opts.icon || '♛'; // ♛

    var txt = document.createElement('div');
    txt.className = 'pjcc-pwa-txt';
    var b = document.createElement('b'); b.textContent = opts.title;
    var sub = document.createElement('span'); sub.textContent = opts.subtitle || '';
    txt.appendChild(b); if (opts.subtitle) txt.appendChild(sub);

    var frag = document.createDocumentFragment();
    frag.appendChild(ico); frag.appendChild(txt);

    if (opts.actionLabel) {
      var act = document.createElement('button');
      act.className = 'pjcc-pwa-act';
      act.type = 'button';
      act.textContent = opts.actionLabel;
      act.addEventListener('click', function () { opts.onAction && opts.onAction(); });
      frag.appendChild(act);
    }

    var x = document.createElement('button');
    x.className = 'pjcc-pwa-x';
    x.type = 'button';
    x.setAttribute('aria-label', 'Dismiss');
    x.innerHTML = '&times;';
    x.addEventListener('click', function () { hide(bar); opts.onDismiss && opts.onDismiss(); });
    frag.appendChild(x);

    bar.appendChild(frag);
    document.body.appendChild(bar);
    requestAnimationFrame(function () { requestAnimationFrame(function () { bar.classList.add('in'); }); });
    return bar;
  }
  function hide(bar) {
    if (!bar) return;
    bar.classList.remove('in');
    setTimeout(function () { try { bar.remove(); } catch (e) {} }, 480);
  }

  /* ---- service worker registration + update flow ---- */
  function registerSW() {
    if (!('serviceWorker' in navigator)) return;
    if (!(window.isSecureContext || location.hostname === 'localhost')) return;

    var refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });

    navigator.serviceWorker.register('/sw.js').then(function (reg) {
      reg.addEventListener('updatefound', function () {
        var nw = reg.installing;
        if (!nw) return;
        nw.addEventListener('statechange', function () {
          if (nw.state === 'installed' && navigator.serviceWorker.controller) offerUpdate(nw);
        });
      });
    }).catch(function () { /* registration failed — site still works, just not offline */ });
  }

  var updateBar = null;
  function offerUpdate(worker) {
    if (updateBar) return;
    updateBar = makeBar({
      icon: '↻', // ↻
      title: 'Update ready',
      subtitle: 'A newer version of PJCC is available.',
      actionLabel: 'Refresh',
      onAction: function () { worker.postMessage('SKIP_WAITING'); },
      onDismiss: function () { updateBar = null; }
    });
  }

  /* ---- install prompt (Chrome/Edge/Android) ---- */
  var deferredPrompt = null;
  var installBar = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    if (standalone()) return;
    if (lsGet(LS_INSTALL_DISMISSED)) return;
    installBar = makeBar({
      icon: '♛', // ♛
      title: 'Install PJCC',
      subtitle: 'Add the arcade to your home screen — plays offline.',
      actionLabel: 'Install',
      onAction: function () {
        hide(installBar); installBar = null;
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        deferredPrompt.userChoice.finally(function () { deferredPrompt = null; });
      },
      onDismiss: function () { installBar = null; lsSet(LS_INSTALL_DISMISSED, '1'); }
    });
  });
  window.addEventListener('appinstalled', function () {
    lsSet(LS_INSTALL_DISMISSED, '1');
    if (installBar) { hide(installBar); installBar = null; }
  });

  /* ---- iOS Safari hint (no beforeinstallprompt there) ---- */
  function maybeIosHint() {
    if (standalone()) return;
    if (lsGet(LS_IOS_HINTED)) return;
    var ua = window.navigator.userAgent;
    var isIOS = /iPhone|iPad|iPod/.test(ua) ||
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); // iPadOS
    var isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
    if (!isIOS || !isSafari) return;
    setTimeout(function () {
      makeBar({
        icon: '➕', // ➕
        title: 'Install PJCC',
        subtitle: 'Tap Share, then “Add to Home Screen.”',
        onDismiss: function () { lsSet(LS_IOS_HINTED, '1'); }
      });
    }, 3500);
  }

  function boot() {
    registerSW();
    if (!standalone()) maybeIosHint();
  }

  injectHead();                       // manifest + app meta, now that we're active
  if (document.readyState === 'complete') boot();
  else window.addEventListener('load', boot);
})();
