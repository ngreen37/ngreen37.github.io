# Fan-art submissions — Supabase setup (one-time)

The Fan Art page now has a **Submit to McPuppy** button. It uploads the picture to
a **private** Supabase Storage bucket and logs a row in a `fan_submissions` table.
**Nothing is published** — you review submissions in the Supabase dashboard and hang
the keepers on The Wall yourself via `_data/fanart.yml`. Until you do the two steps
below, the button will show a friendly "couldn't send" message and nothing breaks.

Project: `xcweewddvpdcofiitoye` (same one the rest of the site uses).

---

## Step 1 — create the private bucket (dashboard UI)

Storage → **New bucket**:

- **Name:** `fan-submissions`  (must match exactly)
- **Public bucket:** **OFF** ← important; keeps everything private until you hang it
- (optional) Additional config → **File size limit:** `5 MB`;
  **Allowed MIME types:** `image/png, image/jpeg`

## Step 2 — run this SQL (dashboard → SQL Editor → New query → Run)

```sql
-- the log of incoming submissions
create table if not exists public.fan_submissions (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title      text,
  by         text,
  path       text not null,          -- object path inside the fan-submissions bucket
  status     text not null default 'new'
);

alter table public.fan_submissions enable row level security;

-- Anyone may SUBMIT a row; nobody but you (dashboard / service role) can READ them.
-- (No SELECT policy = the public can't list other people's submissions.)
drop policy if exists "anon can submit fan art" on public.fan_submissions;
create policy "anon can submit fan art"
  on public.fan_submissions for insert
  to anon, authenticated
  with check (true);

-- Allow uploads INTO the fan-submissions bucket only (insert). No read policy =
-- the bucket stays private; you view/download images from the dashboard.
drop policy if exists "anon can upload fan art" on storage.objects;
create policy "anon can upload fan art"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'fan-submissions');
```

That's it. The Submit button is now live.

---

## Reviewing + hanging a piece

1. **See what came in:**
   - Images: Storage → `fan-submissions` → `incoming/` (click a file → download/preview).
   - Titles/names: Table Editor → `fan_submissions` (the `path` column tells you which
     image goes with which title/by).
2. **Hang a keeper:**
   - Download the image, save it into `assets/images/fan-art/` (create the folder if
     it's not there yet).
   - Add an entry to `_data/fanart.yml` (newest first), e.g.:
     ```yaml
     - img: /assets/images/fan-art/princess-by-a-fan.png
       title: "Princess"
       by: "a fan"
       hung: 2026-07-12
     ```
   - Commit + push. It appears on The Wall with the "HUNG BY McPUPPY" stamp.
3. **Housekeeping (optional):** set `status` to `hung` or `rejected` in the table, and
   delete the object from the bucket once you're done with it.

## Notes / safety
- The bucket is private, so a bad submission never appears anywhere public — it just
  sits in staging until you delete it.
- The anon key can only INSERT (submit/upload), never read — so the endpoint can't be
  used to browse other people's art.
- If it's ever abused, drop the two policies above (or flip the button off) and
  submissions stop immediately; the rest of the site is unaffected.
