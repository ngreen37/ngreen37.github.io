# Username moderation — the codename gate

Keeps slurs and profanity out of **codenames** and **companion pet-names**, across many
languages, with obfuscation defeated (leetspeak, accents, full-width look-alikes,
punctuation, repeated letters). Strict/substring matching: a name is blocked if its
normalized form *contains* a listed term anywhere.

## Why it's server-side

Codenames are set by a **direct client `insert` into `profiles`** ([pjcc-profile.js](../assets/js/pjcc-profile.js)),
guarded only by RLS. A client-only filter is bypassable with the public anon key, so the
real gate is a **`BEFORE INSERT/UPDATE` trigger** in the database. The word list lives in a
table with RLS and **no client read policy** — browsers never see it; only the
`SECURITY DEFINER` check functions can.

## Deploy (once, ~2 minutes)

1. **Run [`username-moderation-setup.sql`](username-moderation-setup.sql)** in Supabase →
   SQL Editor. Creates the `unaccent` extension, the `blocked_terms` + `codename_allow`
   tables, the `pjcc_normalize` / `codename_is_clean` / `is_codename_allowed` functions, and
   the trigger. Idempotent.
2. **Generate + load the word list:** `npm run gen:blocklist` (pulls the maintained
   [LDNOOBW](https://github.com/LDNOOBW/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words)
   dataset for ~23 languages), then paste the produced `docs/blocklist-seed.sql` into the SQL
   Editor and run it. The seed is git-ignored — regenerate any time to refresh.
3. **Deploy the site.** The client pre-check + friendly error are already wired in
   `pjcc-profile.js`; they degrade safely (moderation just inactive) until steps 1–2 run.

## Living with it

- **Sanity check** (after step 2): `select count(*) from public.blocked_terms;` → ~2,500+ (the
  seed loaded); `select public.is_codename_allowed('bastard');` → `false`;
  `select public.is_codename_allowed('Princess');` → `true`. (Mild words like "damn"/"crap"
  aren't in the upstream list and return `true` — expected, not a bug.)
- **Rescue a false positive** (the "Scunthorpe problem" — an innocent name caught by a
  substring): allowlist its *normalized* form.
  ```sql
  select public.pjcc_normalize('Scunthorpe');   -- see the key it stores
  insert into public.codename_allow(norm) values (public.pjcc_normalize('Scunthorpe'));
  ```
- **Add/remove a term by hand:**
  ```sql
  insert into public.blocked_terms(term) values (public.pjcc_normalize('somebadword')) on conflict do nothing;
  delete from public.blocked_terms where term = public.pjcc_normalize('overzealousword');
  ```
- **Audit existing accounts** for names that would now be blocked:
  ```sql
  select id, codename from public.profiles where not public.codename_is_clean(codename);
  ```

## Tuning strictness

Strict/substring is deliberately aggressive (short usernames are adversarial). If false
positives ever get annoying, the `codename_allow` table is the pressure valve. To loosen
globally you'd switch `codename_is_clean`'s `like '%'||term||'%'` to a word-boundary match —
but then start the allowlist over, since the trade-off flips.
