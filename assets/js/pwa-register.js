/* pwa-register.js — registers the service worker and owns the install / update UI.
 *
 * Injects its own DOM + CSS so it works on EVERY layout (default, studio-home, game,
 * easter-eggs) without editing any <body>. Themed to match the site (deep purple + gold).
 *
 *   • Registers /sw.js (secure contexts only).
 *   • "Update ready" toast when a new version has been fetched → tap to refresh.
 *   • Custom "Install app" bar on Chrome/Edge/Android (beforeinstallprompt).
 *   • A one-time "Add to Home Screen" hint on iOS Safari (which has no install prompt).
 *   • Nothing shows once the app is already installed (display-mode: standalone), and
 *     dismissals are remembered so it never nags.
 */
(function () {
  'use strict';

  var LS_INSTALL_DISMISSED = 'pjcc.pwa.installDismissed';
  var LS_IOS_HINTED        = 'pjcc.pwa.iosHinted';

  function standalone() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true;
  }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

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

  /* ---- a bottom bar: {icon, title, subtitle, actionLabel, onAction} ---- */
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
    // next frame → slide in
    requestAnimationFrame(function () { requestAnimationFrame(function () { bar.classList.add('in'); }); });
    return bar;
  }
  function hide(bar) {
    if (!bar) return;
    bar.classList.remove('in');
    setTimeout(function () { try { bar.remove(); } catch (e) {} }, 480);
  }

  /* ---- 1. service worker registration + update flow ---- */
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
      // A new worker is installing → when it's ready AND we're already controlled, offer refresh.
      reg.addEventListener('updatefound', function () {
        var nw = reg.installing;
        if (!nw) return;
        nw.addEventListener('statechange', function () {
          if (nw.state === 'installed' && navigator.serviceWorker.controller) {
            offerUpdate(nw);
          }
        });
      });
    }).catch(function () { /* registration failed — the site still works, just not offline */ });
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

  /* ---- 2. install prompt (Chrome/Edge/Android) ---- */
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

  /* ---- 3. iOS Safari hint (no beforeinstallprompt there) ---- */
  function maybeIosHint() {
    if (standalone()) return;
    if (lsGet(LS_IOS_HINTED)) return;
    var ua = window.navigator.userAgent;
    var isIOS = /iPhone|iPad|iPod/.test(ua) ||
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); // iPadOS
    var isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
    if (!isIOS || !isSafari) return;
    // Don't pounce on first paint; wait until they've settled in a little.
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
  if (document.readyState === 'complete') boot();
  else window.addEventListener('load', boot);
})();
