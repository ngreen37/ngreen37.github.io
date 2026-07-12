/* sw.js — PJCC service worker (lives at site root so its scope is the whole site).
 *
 * Strategy, chosen to make the site installable + offline-capable WITHOUT the classic
 * "stale PWA" trap where users stop seeing updates:
 *   • navigations (HTML pages) → NETWORK-FIRST, fall back to cache, then /offline.html
 *   • same-origin static assets (css/js/img/wasm/fonts) → STALE-WHILE-REVALIDATE
 *   • Google Fonts → stale-while-revalidate in their own cache
 *   • everything cross-origin (Supabase, the translate Worker, Cloudflare beacon,
 *     Patreon…) → untouched, straight to network
 *
 * Bump VERSION whenever this file's caching behavior changes; activate() purges old
 * caches. (Editing this file at all re-triggers the browser's update check.)
 */
'use strict';

const VERSION    = 'pjcc-pwa-v1';
const SHELL      = 'pjcc-shell-' + VERSION;
const RUNTIME    = 'pjcc-runtime-' + VERSION;
const FONTS      = 'pjcc-fonts-' + VERSION;
const OFFLINE_URL = '/offline.html';

/* Precached up front so the app opens even fully offline. Tolerant: a single missing
 * file won't fail the whole install (unlike cache.addAll). */
const PRECACHE = [
  '/', '/pjcc/', '/games/', OFFLINE_URL, '/manifest.json',
  '/assets/css/style.css', '/assets/css/a11y.css', '/assets/css/pjcc-flair.css',
  '/assets/css/pjcc-portal.css', '/assets/css/pjcc-nav.css',
  '/assets/js/pjcc-time.js', '/assets/js/pjcc-nav.js', '/assets/js/pjcc-config.js',
  '/assets/js/pjcc-profile.js', '/assets/js/pjcc-lang.js', '/assets/js/pjcc-flair.js',
  '/assets/js/pjcc-portal.js', '/assets/js/pjcc-princess.js', '/assets/js/pwa-register.js',
  '/assets/images/pwa/icon-192.png', '/assets/images/pwa/icon-512.png',
  '/assets/images/pwa/apple-touch-icon.png', '/assets/images/favicon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL);
    await Promise.allSettled(PRECACHE.map((u) => cache.add(new Request(u, { cache: 'reload' }))));
    // New SW is ready immediately; the page decides when to switch over (see message handler).
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keep = new Set([SHELL, RUNTIME, FONTS]);
    const names = await caches.keys();
    await Promise.all(names.map((n) => (keep.has(n) ? null : caches.delete(n))));
    await self.clients.claim();
  })());
});

// Let the page trigger an immediate update (the "refresh to update" toast).
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

const isFont = (url) =>
  url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;                 // never cache mutations
  const url = new URL(req.url);

  // Google Fonts: stale-while-revalidate in their own cache.
  if (isFont(url)) {
    event.respondWith(staleWhileRevalidate(req, FONTS));
    return;
  }

  // Anything not same-origin (Supabase, translate Worker, analytics, Patreon…) → passthrough.
  if (url.origin !== self.location.origin) return;

  // Page navigations → network-first so content is always fresh, offline-safe fallback.
  if (req.mode === 'navigate') {
    event.respondWith(networkFirst(req));
    return;
  }

  // Same-origin static assets → stale-while-revalidate.
  event.respondWith(staleWhileRevalidate(req, RUNTIME));
});

async function networkFirst(req) {
  const cache = await caches.open(RUNTIME);
  try {
    const fresh = await fetch(req);
    if (fresh && fresh.ok) cache.put(req, fresh.clone());
    return fresh;
  } catch (e) {
    const cached = await caches.match(req);
    if (cached) return cached;
    const offline = await caches.match(OFFLINE_URL);
    return offline || new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  const network = fetch(req)
    .then((res) => { if (res && res.ok) cache.put(req, res.clone()); return res; })
    .catch(() => null);
  return cached || (await network) || new Response('', { status: 504 });
}
