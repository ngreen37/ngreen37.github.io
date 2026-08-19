# Twitch Live Worker — does the Follow door light up?

The sixth box on the front door, and its row in the nav rail, go **red with a LIVE chip**
while `chesswild_official` is actually streaming. This Worker is the only thing that knows.

**Why a Worker at all:** asking Twitch "is this channel live" needs a Client-ID **and a client
secret**, and a secret cannot live in a page anyone can view-source. The Worker holds both,
trades them for an app token, and hands the site back a boolean.

It is the same shape and the same dashboard as **`pjcc-translate`**
([translation-worker.md](translation-worker.md)) — if you have done that one, you have done
this one.

**Until it exists, nothing is broken.** `LIVE_URL` in `assets/js/pjcc-live.js` is blank, the
file returns before it touches the page, and the Follow door is exactly the door it is today.
That is the designed off state, not a missing piece.

---

## Setup — two dashboards, about fifteen minutes

### 1 · Register a Twitch application (free)

1. **[dev.twitch.tv/console/apps](https://dev.twitch.tv/console/apps)** → *Register Your
   Application*. Sign in with the same account that owns `chesswild_official`.
2. **Name:** anything — `ChessWild Site`. **OAuth Redirect URL:** `https://chesswild.com`
   (it is required and unused; this app never signs a human in).
   **Category:** *Website Integration*. **Client Type:** *Confidential*.
3. Create, then open it and copy the **Client ID**. Click **New Secret** and copy that too.

⚠ **The secret is shown once.** Paste it straight into step 2 — if you lose it, generate
another; nothing else breaks.

### 2 · Deploy the Worker

1. **Cloudflare → Workers & Pages → Create → Worker**, named **`chesswild-live`**. Deploy the
   starter, then **Edit code**, select all, paste [the code](#the-code), **Deploy**.
   *Editing is not deploying.*
2. **Settings → Variables and Secrets → Add → Secret**, twice:
   - `TWITCH_CLIENT_ID` — the Client ID
   - `TWITCH_CLIENT_SECRET` — the secret
3. Check it: open `https://chesswild-live.<your-subdomain>.workers.dev`
   → `{"live":false}` when you are off air, and `{"live":true,"game":"…"}` when you are on.

### 3 · Tell me the URL

One line in `assets/js/pjcc-live.js` (`LIVE_URL`) and the door starts answering. Send me the
`workers.dev` address and I will set it — or set it yourself; it is the only edit.

---

## The code

⚠ **`CHANNEL` is the only line to change if the handle ever does.** It is not a secret and
deliberately not a variable — a login name in plain sight is easier to verify than one hidden
in a settings panel.

```js
const CHANNEL = 'chesswild_official';

/* Only these three origins can read it. They are the same three the /follow/ embed lists as
   `parent=`: the live domain, the www name that 301s (the redirect can be mid-flight when a
   fetch goes out), and the Pages origin, which still serves the site directly. */
const ALLOW = ['https://chesswild.com', 'https://www.chesswild.com', 'https://ngreen37.github.io'];

function reply(body, origin) {
  return new Response(JSON.stringify(body), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': ALLOW.includes(origin) ? origin : ALLOW[0],
      /* 60s at the edge. The answer changes twice a day; asking Twitch on every page view
         would be rude to them and slower for the visitor. */
      'cache-control': 'public, max-age=60'
    }
  });
}

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin') || '';
    if (request.method === 'OPTIONS') return reply({ ok: true }, origin);

    /* ⚠ EVERY FAILURE RETURNS {live:false}, NEVER AN ERROR STATUS. "I could not find out"
       and "he is not streaming" produce the same thing on the site — a door that stays a
       door. The one answer this must never invent is `true`. */
    try {
      const cache = caches.default;
      const key = new Request(new URL(request.url).origin + '/__live', { method: 'GET' });
      const hit = await cache.match(key);
      if (hit) return reply(await hit.json(), origin);

      const t = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: env.TWITCH_CLIENT_ID,
          client_secret: env.TWITCH_CLIENT_SECRET,
          grant_type: 'client_credentials'
        })
      });
      if (!t.ok) return reply({ live: false }, origin);
      const token = (await t.json()).access_token;
      if (!token) return reply({ live: false }, origin);

      const s = await fetch('https://api.twitch.tv/helix/streams?user_login=' + CHANNEL, {
        headers: { 'Client-ID': env.TWITCH_CLIENT_ID, 'Authorization': 'Bearer ' + token }
      });
      if (!s.ok) return reply({ live: false }, origin);

      const d = await s.json();
      const live = d && d.data && d.data[0];
      /* Helix returns an EMPTY data array for an offline channel — not an error, not a
         `live:false` field. An empty array is the offline answer. */
      const body = live
        ? { live: true, title: live.title || '', game: live.game_name || '',
            viewers: live.viewer_count || 0, started: live.started_at || '' }
        : { live: false };

      ctx.waitUntil(cache.put(key, new Response(JSON.stringify(body), {
        headers: { 'content-type': 'application/json', 'cache-control': 'max-age=60' }
      })));
      return reply(body, origin);
    } catch (e) {
      return reply({ live: false }, origin);
    }
  }
};
```

---

## Troubleshooting

**`{"live":false}` while you are definitely streaming.**
Nine times in ten the handle is wrong. `CHANNEL` must be the **login name** — the one in your
channel URL, lowercase — not the display name. Confirm with
`https://www.twitch.tv/chesswild_official`: if that page loads your channel, that string is
the login name.

**Always `{"live":false}`, even off air, and the door never lights.**
That is what a bad Client-ID or secret looks like, because every failure path here returns
`live:false` on purpose. Re-paste both secrets. Cloudflare shows secret **names** but never
their values, so a typo is invisible from the dashboard — generate a new secret rather than
squinting at the old one.

**It works in the Worker URL but the door stays dark.**
Check `LIVE_URL` in `assets/js/pjcc-live.js` is set, then look for a CORS error in the browser
console — that means the page's origin is not in `ALLOW`.

**It lights up and will not go out.**
The site caches the answer for 60 seconds per tab (`sessionStorage`, key `pjcc.live.v1`), and
the edge caches for 60 more. Two minutes is the honest ceiling. If it is longer than that, the
Worker is still returning `live:true` — check the Worker URL directly.

---

## What it does NOT do

- **No player on the front door.** Decided 2026-08-19: a Twitch iframe on the site's most
  measured surface would load for every visitor during the ~99% of hours the channel is dark.
  The player lives at `/follow/`, one tap away, where it already works.
- **No notification, no email, no "he was live 3 hours ago".** The door is a present-tense
  fact or it is nothing. Twitch already does the notifying, and does it better.
- **No viewer count on the site.** The Worker returns it, and nothing renders it — a public
  number that will read "3" for a while is a discouraging thing to publish about yourself.
  It is in the payload if that ever changes.
