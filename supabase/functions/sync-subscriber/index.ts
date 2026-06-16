// =============================================================================
// sync-subscriber — Supabase Edge Function
// -----------------------------------------------------------------------------
// Fired by a Database Webhook whenever a row is INSERTed into `subscribers`.
// It takes the new email and adds it as a contact in your Resend audience, so
// newsletter signups flow automatically from Supabase into Resend.
//
// Secrets it needs (set in Supabase → Edge Functions → Secrets):
//   RESEND_API_KEY      your Resend API key (re_...)   — SECRET
//   RESEND_AUDIENCE_ID  the audience to add contacts to
//   WEBHOOK_SECRET      a random string you also put on the webhook header
//
// Deploy with JWT verification OFF so the database webhook can call it.
// =============================================================================

Deno.serve(async (req: Request): Promise<Response> => {
  try {
    // 1. Simple shared-secret check so randoms can't spam your audience.
    const expected = Deno.env.get("WEBHOOK_SECRET");
    if (expected && req.headers.get("x-webhook-secret") !== expected) {
      return new Response("forbidden", { status: 403 });
    }

    // 2. Pull the email out of the webhook payload (or a direct {email} call).
    const payload = await req.json().catch(() => ({}));
    const email: string | undefined = payload?.record?.email ?? payload?.email;
    if (!email) return new Response("no email in payload", { status: 400 });

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const AUDIENCE_ID = Deno.env.get("RESEND_AUDIENCE_ID");
    if (!RESEND_API_KEY || !AUDIENCE_ID) {
      return new Response("function not configured", { status: 500 });
    }

    // 3. Add the contact to the Resend audience.
    const res = await fetch(
      `https://api.resend.com/audiences/${AUDIENCE_ID}/contacts`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, unsubscribed: false }),
      },
    );

    // 200 on success; treat "already a contact" (409/422) as success too so the
    // webhook doesn't retry forever. Only real failures bubble up as 500.
    if (res.ok || res.status === 409 || res.status === 422) {
      return new Response("ok", { status: 200 });
    }
    const detail = await res.text();
    return new Response(`resend error ${res.status}: ${detail}`, { status: 500 });
  } catch (e) {
    return new Response(`error: ${(e as Error).message}`, { status: 500 });
  }
});
