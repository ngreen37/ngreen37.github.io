# Sign-in codes — the one Supabase step (Nate)

The site now offers a **6-digit code** next to the magic link. The code is what makes
sign-in work **inside the installed iOS app**: a tapped link always opens Safari, and an
iOS home-screen app keeps its own storage jar, so the link signs in the *browser* and the
app stays signed out.

Supabase already generates the code for every login email — but the default template only
prints the link. **Until the template prints the token, the email will not contain a code**
and the code box on the site is a dead end.

## The step (about two minutes)

1. Supabase dashboard → **Authentication → Emails → Magic Link**.
2. Add the token to the template body, e.g. keep the existing link and add:

   ```html
   <p>Or enter this code: <strong>{{ .Token }}</strong></p>
   ```

3. Save.

That's it — the same email now carries both, and both work:

- **Link** — the desktop / cross-device path (implicit flow, so requesting on the phone and
  opening on the PC still works).
- **Code** — typed into the site or the installed app; the session is created in whatever
  jar you typed it into.

## Where it lives in the code

- `PJCC.verifyCode(email, code)` — `assets/js/pjcc-profile.js` (`verifyOtp`, `type: 'email'`).
- Game-page bar — `assets/js/pjcc-profile-bar.js` (`renderCode`).
- Dossier — `dossier.md` (`renderCode`).

Codes expire on Supabase's OTP lifetime (default 1 hour) and are single-use.
