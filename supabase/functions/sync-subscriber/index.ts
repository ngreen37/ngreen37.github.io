// =============================================================================
// sync-subscriber — Supabase Edge Function
// -----------------------------------------------------------------------------
// Fired by a Database Webhook whenever a row is INSERTed into `subscribers`.
// It adds the new email as a contact in Resend, so newsletter signups flow
// automatically from Supabase into your Resend audience.
//
// Uses the Resend SDK (same call your Resend dashboard shows under </>), so it
// matches the current single-audience API — no audience id required. (If your
// account still needs one, set RESEND_AUDIENCE_ID and it will be included.)
//
// Secrets (Supabase → Edge Functions → Secrets):
//   RESEND_API_KEY      your Resend API key (re_...)   — SECRET
//   WEBHOOK_SECRET      a random string you also put on the webhook header
//   RESEND_AUDIENCE_ID  optional — only if your account still requires it
//
// Deploy with JWT verification OFF so the database webhook can call it.
// =============================================================================
import { Resend } from "npm:resend";

Deno.serve(async (req: Request): Promise<Response> => {
  try {
    // 1. Shared-secret check so randoms can't spam your audience.
    const expected = Deno.env.get("WEBHOOK_SECRET");
    if (expected && req.headers.get("x-webhook-secret") !== expected) {
      return new Response("forbidden", { status: 403 });
    }

    // 2. Pull the email out of the webhook payload (or a direct {email} call).
    const payload = await req.json().catch(() => ({}));
    const email: string | undefined = payload?.record?.email ?? payload?.email;
    if (!email) return new Response("no email in payload", { status: 400 });

    const key = Deno.env.get("RESEND_API_KEY");
    if (!key) return new Response("RESEND_API_KEY not set", { status: 500 });

    // 3. Create the contact (audience id only if your account still needs it).
    const resend = new Resend(key);
    const params: Record<string, unknown> = { email, unsubscribed: false };
    const audienceId = Deno.env.get("RESEND_AUDIENCE_ID");
    if (audienceId) params.audienceId = audienceId;

    const { error } = await resend.contacts.create(params);
    if (error) {
      const msg = JSON.stringify(error);
      // "already exists" -> treat as success so the webhook doesn't retry forever
      if (/exist|already|duplicate/i.test(msg)) {
        return new Response("ok (already a contact)", { status: 200 });
      }
      return new Response(`resend error: ${msg}`, { status: 500 });
    }
    return new Response("ok", { status: 200 });
  } catch (e) {
    return new Response(`error: ${(e as Error).message}`, { status: 500 });
  }
});
