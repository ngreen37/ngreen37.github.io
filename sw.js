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

const VERSION    = 'pjcc-pwa-v11';  // v11: the intro is DELETED — "/" is a redirect to /chess/ now, and every game shell carries the town sky (2026-08-03); v10: the app LAUNCH now lands on /chess/ — old launchers redirect off /pjcc/?source=pwa, start_url moved (2026-08-03); v9: /chess/ is the new front door — the intro hands off there, /pjcc/ became the world tab (2026-07-28); v8: the Gauntlet door became a real stylesheet the game links (2026-07-27); v7: "/" is the "McPuppy Studios Presents" intro (2026-07-23)
const SHELL      = 'pjcc-shell-' + VERSION;
const RUNTIME    = 'pjcc-runtime-' + VERSION;
const OFFLINE_URL = '/offline.html';

/* THE SHELL — precached at install so the app opens even fully offline. Tolerant: a
 * single missing file won't fail the whole install (unlike cache.addAll). Small, so
 * install stays fast. NOTE: the site now compiles to ONE stylesheet (style.css). */
/* ALL THREE OF '/', '/chess/' AND '/pjcc/' STAY IN THIS LIST. '/chess/' is the front door
 * AND the start_url (2026-08-03), '/pjcc/' is the world tab, and '/' — which was the
 * "McPuppy Studios Presents" intro card until the intro was deleted on 2026-08-03 — is now
 * a redirect to /chess/. All three are real pages returning 200. '/' stays here precisely
 * BECAUSE it is a redirect: it is the address people type, and offline it has to be able to
 * answer with the hop rather than with the offline page. Keeping the old ones matters because
 * start_url is baked into a launcher AT INSTALL TIME: a phone that installed the app when
 * /pjcc/ was the start_url still opens /pjcc/?source=pwa regardless of manifest.json today.
 * As of 2026-08-03 that launch is redirected to /chess/ by a pre-paint script in
 * _includes/head.html — but the redirect lives INSIDE the /pjcc/ document, so /pjcc/ has to
 * be cached and served for the redirect to be able to fire at all. On a plane, dropping it
 * from this list would strand the old launcher on the offline page.
 * This precache runs under Promise.allSettled, so a 404 here fails SILENTLY and serves a
 * stale shell rather than reporting anything — so none of these URLs may 404. */
const PRECACHE = [
  '/', '/chess/', '/pjcc/', '/games/', OFFLINE_URL, '/manifest.json',
  '/assets/css/style.css',
  '/assets/js/pjcc-nav.js', '/assets/js/pjcc-config.js', '/assets/js/pjcc-weather.js',
  '/assets/js/pjcc-profile.js', '/assets/js/pjcc-lang.js', '/assets/js/pjcc-flair.js',
  '/assets/js/pjcc-portal.js', '/assets/js/pwa-register.js', '/assets/js/pjcc-eggs.js',
  '/assets/images/pwa/icon-192.png', '/assets/images/pwa/icon-512.png',
  '/assets/images/pwa/apple-touch-icon.png', '/assets/images/favicon.svg',
];

/* THE ARCADE — the whole point of installing: the games play with no signal.
 * These are WARMED IN THE BACKGROUND after activation rather than precached at
 * install, because it's ~1.3 MB: blocking install on it would stall the very first
 * page load. Warming after activate means the shell is instantly ready and the games
 * quietly fill in behind it. Tolerant + one-time (already-cached entries are skipped).
 * Includes the vendored Stockfish — without it the chess games can't think offline. */
const GAMES = [
  '/assets/games/pjcc_gauntlet.html', '/assets/games/pjcc_blindfold.html',
  '/assets/games/pjcc_fork.html', '/assets/games/pjcc_pirc.html',
  '/assets/games/notation_run.html', '/assets/games/pjcc_clearance.html',
  '/assets/games/pjcc_sandmine.html', '/assets/games/pjcc_shogi.html',
  '/assets/games/pjcc_sky_run.html', '/assets/games/pjcc_space_run.html',
  '/assets/games/pjcc_tower_defense.html',
  '/assets/games/pjcc_chess_city.html',
  '/assets/games/pjcc_murphys_law.html', '/assets/games/pjcc_reading_room.html',
  '/assets/games/pjcc_princess_dungeon.html',
  '/assets/js/pjcc-chess.js', '/assets/js/pjcc-chess-ai.js', '/assets/js/pjcc-gauntlet-engine.js',
  // the town's sky, inside the games (2026-08-03). Every shell above loads this pair, and
  // the clock is date-and-hour arithmetic with no network in it — so an installed app on a
  // plane still knows it is dusk. Missing them wouldn't break a game, it would just quietly
  // return the arcade to a permanent midnight, which is the bug this shipped to fix.
  '/assets/js/pjcc-time.js', '/assets/js/pjcc-game-sky.js',
  // the Gauntlet's challenger door is real CSS now, not a copy inlined in the game shell
  // (2026-07-27) — without this the tower's doors go plain on a plane.
  '/assets/css/gauntlet-door.css',
  '/assets/vendor/stockfish/stockfish.js', '/assets/vendor/stockfish/stockfish.wasm',
  // the self-hosted webfaces the site actually paints with (latin subsets only — the
  // latin-ext ones are unicode-range gated and fetched on demand, so don't warm them)
  '/assets/fonts/Poppins-400-latin.woff2', '/assets/fonts/Poppins-600-latin.woff2',
  '/assets/fonts/Poppins-700-latin.woff2', '/assets/fonts/Poppins-800-latin.woff2',
  '/assets/fonts/Inter-400-latin.woff2', '/assets/fonts/Inter-500-latin.woff2',
  '/assets/fonts/Inter-600-latin.woff2', '/assets/fonts/ShareTechMono-400-latin.woff2',
  '/assets/fonts/PressStart2P-400-latin.woff2',
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
    const keep = new Set([SHELL, RUNTIME]);
    const names = await caches.keys();
    await Promise.all(names.map((n) => (keep.has(n) ? null : caches.delete(n))));
    await self.clients.claim();
    warmArcade();                       // fire-and-forget: fill the arcade behind the shell
  })());
});

/* Pull the arcade into the cache in the background, a few files at a time so we never
 * saturate the connection. Anything already cached is skipped, so this is cheap on
 * every activation after the first. Failures are ignored — a game that misses the warm
 * still caches itself the first time it's played (stale-while-revalidate). */
async function warmArcade() {
  try {
    const cache = await caches.open(RUNTIME);
    for (let i = 0; i < GAMES.length; i += 4) {
      await Promise.allSettled(GAMES.slice(i, i + 4).map(async (url) => {
        if (await cache.match(url)) return;                 // already have it
        const res = await fetch(url, { cache: 'no-cache' });
        if (res && res.ok) await cache.put(url, res);
      }));
    }
  } catch (e) { /* offline during warm — the games will cache on first play */ }
}

// Let the page trigger an immediate update (the "refresh to update" toast).
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

/* (The Google-Fonts cache branch is gone: the webfonts are SELF-HOSTED now, so they're
 * just same-origin static assets and fall through to stale-while-revalidate below —
 * which also means they work in the installed app with no network at all.) */
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;                 // never cache mutations
  const url = new URL(req.url);

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
