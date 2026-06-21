# PJCC Operative Profile — Setup Guide

Everything needed to switch the profile/login/leaderboard system ON.
Work top to bottom. Parts A–C are the backend; Part D is the website.

Glossary as you go:
- **Supabase** — the free service that stores profiles/scores and handles login.
- **Magic link** — passwordless login: player types email, clicks a link we email them.
- **SMTP** — the standard "postal system" for sending email. Resend is an SMTP provider.
- **DNS records** — settings on a domain that prove you own it. Needed by Resend.
- **anon key** — a *public* key safe to put in website code. The **service_role** key is secret — never share it.

---

## PART A — Supabase project (free, ~5 min)

1. Go to **supabase.com** → **Sign up** (GitHub or email).
2. **New project**:
   - Name: `pjcc` (anything).
   - Database password: generate a strong one and save it somewhere. (You won't need it for this, but don't lose it.)
   - Region: pick the one closest to you.
3. Wait ~2 minutes while it provisions.

### A1. Run the database schema
1. Left sidebar → **SQL Editor** → **New query**.
2. Open `docs/supabase-setup.sql` from this repo, copy *all* of it, paste into the editor.
3. Click **Run**. You should see **Success. No rows returned**.
4. Sanity check: left sidebar → **Table Editor** → you should now see tables `profiles`, `game_stats`, `scores`.

### A2. Configure login (magic links)
1. Left sidebar → **Authentication** → **Providers** → confirm **Email** is **Enabled**.
2. **Authentication** → **URL Configuration**:
   - **Site URL**: `https://mcpuppystudios.com`  ← your live custom domain
     (the site also answers at `ngreen37.github.io` and `www.`, but both
     301-redirect here, so this is the one that matters)
   - **Redirect URLs** → Add URL: `https://mcpuppystudios.com/**`
     (the `/**` lets the login link return a player to whatever game page they signed in from)
   - Optional belt-and-suspenders: also add `https://ngreen37.github.io/**`.
3. Save.

### A3. Grab the two website keys
1. Left sidebar → **Project Settings** (gear) → **API**.
2. Copy these two — paste them into `assets/js/pjcc-config.js`:
   - **Project URL** → `SUPABASE_URL`  (looks like `https://abcd1234.supabase.co`)
   - **anon / public** key → `SUPABASE_ANON_KEY`  (long string starting `eyJ...`)
3. ⚠️ Do **not** copy the **service_role** key. That one is secret and must never go in website code.

> ✅ At this point the system works using Supabase's **built-in email sender**.
> Good enough to test it yourself. The built-in sender is throttled to ~2–4
> emails/hour and may land in spam — fine for you, not for real players.
> Parts B–C fix that. Do them whenever you're ready.

---

## PART B — Your own domain ✅ ALREADY DONE

You own **mcpuppystudios.com** and it's already pointed at this GitHub Pages site
(verified: the site serves over HTTPS there, and both `www.` and
`ngreen37.github.io` 301-redirect to it). You also clearly have access to the
domain's DNS settings, since you set up the GitHub Pages records.

So nothing to do here — go straight to Part C. In Part C you'll **add Resend's
email DNS records alongside the existing GitHub records**. They don't conflict:
GitHub's A/CNAME records route the *website*; Resend's TXT/MX records handle
*email*. Same domain, different jobs.

---

## PART C — Resend (custom SMTP, ~10 min, needs Part B)

### C1. Create the account + verify your domain
1. Go to **resend.com** → **Sign up** (free; ~3,000 emails/month).
2. Left sidebar → **Domains** → **Add Domain** → type your domain (e.g. `mcpuppystudios.com`).
3. Resend shows you a list of **DNS records** (TXT/MX/CNAME entries).
4. Go to wherever you bought the domain → its **DNS settings** → add each record
   exactly as Resend lists it. (Cloudflare makes this easiest.)
5. Back in Resend, click **Verify**. It may take a few minutes to hours for DNS
   to propagate; Resend marks the domain **Verified** when ready.

### C2. Get a Resend SMTP password (API key)
1. Resend → **API Keys** → **Create API Key** → name it `supabase`, permission
   **Sending access** → **Create**.
2. Copy the key (starts `re_...`). You'll see it **once** — paste it into the
   next step immediately.

### C3. Plug Resend into Supabase
1. Supabase → **Project Settings** → **Authentication** → scroll to
   **SMTP Settings** → toggle **Enable Custom SMTP**.
2. Fill in:
   - **Host**: `smtp.resend.com`
   - **Port**: `465`
   - **Username**: `resend`
   - **Password**: the `re_...` API key from C2
   - **Sender email**: `no-reply@yourdomain.com` (must be on your verified domain)
   - **Sender name**: `McPuppy Studios` (or whatever)
3. Save.

> ✅ Now every login email goes out through Resend — thousands/month, reliable
> delivery, no spam-folder problems. This is the "ready for when it pops" state.

---

## PART D — Turn it on in the website

1. Edit `assets/js/pjcc-config.js` → paste the **Project URL** and **anon key**
   from step A3 over the two `YOUR_..._HERE` placeholders.
2. Commit & push. The profile bar appears on any game page automatically and
   `PJCC.enabled` flips to true.

### Test it
1. Open any game page (e.g. Notation Blitz).
2. Enter your email → **Send login link** → check your inbox → click the link.
3. Back on the page, **claim a codename**.
4. Win a round → confirm the bar shows your codename, rank, and credits going up.
5. Clear your cookies / open a private window → sign in again → your operative is
   still there. (That's the whole point: the character lives on Supabase, not the device.)

---

## Testing without a domain (optional, before Part B/C)

After Part A you can try the full flow using **only your own email**:
- Supabase's built-in sender will email you the login link.
- Or Resend's test sender (`onboarding@resend.dev`) only delivers to the address
  you signed up with — also fine for solo testing.
Either way, real players need Parts B–C.

---

## Which key goes where (cheat sheet)

| Value | From | Goes into | Secret? |
|---|---|---|---|
| Project URL | Supabase → Settings → API | `pjcc-config.js` | No (public) |
| anon / public key | Supabase → Settings → API | `pjcc-config.js` | No (public) |
| service_role key | Supabase → Settings → API | **nowhere — leave it** | YES |
| Resend API key (`re_…`) | Resend → API Keys | Supabase → SMTP password | YES (stays in Supabase only) |
