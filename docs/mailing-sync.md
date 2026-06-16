# Mailing list auto-sync: Supabase → Resend

Goal: when someone subscribes on the site, automatically add them to your Resend
audience so you can send newsletters without exporting/importing by hand.

The code is done (`supabase/functions/sync-subscriber/index.ts`). These are the
one-time dashboard steps to switch it on. ~15 minutes.

Flow once set up:
`subscribe form → subscribers table → database webhook → Edge Function → Resend audience`

---

## 1. Audience ID — you probably don't need one
Resend now uses a single default audience. If the **`</>`** snippet on the
Audience page shows `contacts.create({ email, ... })` with **no** `audience_id`,
your account is single-audience: skip this entirely and leave
`RESEND_AUDIENCE_ID` unset in step 4. (Only older accounts whose snippet includes
an `audienceId` need to set it.)

## 2. Pick a webhook secret (~1 min)
Make up a random string (e.g. mash the keyboard, or run `openssl rand -hex 16`).
Call it `WEBHOOK_SECRET`. You'll paste the same value in two places below.

## 3. Deploy the Edge Function (~5 min)

**Option A — Supabase dashboard (no install):**
1. Supabase → **Edge Functions** → **Deploy a new function**.
2. Name it exactly `sync-subscriber`.
3. Paste the contents of `supabase/functions/sync-subscriber/index.ts`.
4. **Turn OFF "Verify JWT"** for this function (so the webhook can call it).
5. Deploy.

**Option B — Supabase CLI (if you prefer terminal):**
```bash
supabase functions deploy sync-subscriber --no-verify-jwt
```

## 4. Add the function's secrets (~2 min)
Supabase → **Edge Functions → Secrets** (or Project Settings → Edge Functions),
add:
- `RESEND_API_KEY` = your `re_...` key (reuse the one from SMTP, or make a new one)
- `WEBHOOK_SECRET` = the random string from step 2
- `RESEND_AUDIENCE_ID` = **only if** your account still needs one (see step 1) —
  otherwise leave it out entirely

## 5. Create the database webhook (~3 min)
⚠️ This is in **SUPABASE**, not Resend. (Resend also has a "Webhooks" page —
that's the wrong one; it's for Resend notifying you about email events.) The hook
we want watches your Supabase `subscribers` table.

Supabase → **Database → Webhooks** → **Create a new hook**:
- **Table:** `subscribers`
- **Events:** Insert
- **Type:** HTTP Request
- **Method:** POST
- **URL:** `https://<YOUR-PROJECT-REF>.functions.supabase.co/sync-subscriber`
  (your project ref is the `xcweewddvpdcofiitoye` part of your Supabase URL)
- **HTTP Headers:** add one →
  - name: `x-webhook-secret`
  - value: the same `WEBHOOK_SECRET` from step 2
- Save.

## 6. Test
1. Go to mcpuppystudios.com/mailing-list/ and subscribe a test email.
2. Check Resend → Audiences → `PJCC Dispatch` — the contact should appear within
   a few seconds.
3. If it doesn't: Supabase → Edge Functions → `sync-subscriber` → **Logs** shows
   exactly what happened (missing secret, wrong audience id, etc.).

---

## Sending a newsletter (the part this enables)
Resend → **Broadcasts** → **Create** → choose the `PJCC Dispatch` audience →
write subject + body → include the unsubscribe link variable Resend provides →
send or schedule. Free tier covers 3,000 emails/month.

Your existing subscribers (already in Supabase from before this sync) won't be
back-filled automatically — export them once from the Supabase `subscribers`
table and import into the audience. Everyone who signs up *after* this is set up
flows in on their own.
