# Puzzle reports + the puzzle rating — Supabase setup (Nate-gated, ~3 minutes)

Two migrations, one SQL editor visit. Both are **idempotent** — re-running is safe.

**Nothing on the site is broken until you run these.** The client was written to work
identically before and after: the ⚑ report panel falls back to Email/Copy if the table
isn't there, and the puzzle rating lives in `localStorage` and only *mirrors* to the
account. Running this turns reports into a real inbox and makes the rating follow you
between devices.

---

## Step 1 — run this in Supabase → SQL Editor

```sql
-- ═══ 1. PUZZLE REPORTS — insert-only, readable by the Creator alone ══════════
create table if not exists public.puzzle_reports (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  puzzle_id   text,
  fen         text not null,
  motif       text,
  goal        text,
  line        text,
  rating      integer,
  mode        text,
  step        integer,
  claim       text,            -- the move the player thinks also wins, e.g. "Rxd4"
  note        text,            -- what they typed
  verdict     text,            -- THE MACHINE'S OWN OPINION, written at report time:
                               --   'agrees'   the engine also thinks the claim wins
                               --   'mates'    the claim is a second mate (a real bug)
                               --   'refuted'  the engine can punish it
                               --   'none'     no claim — just a note
  verdict_cp  integer,         -- material swing behind 'refuted' / 'agrees', in centipawns
  reporter    uuid references auth.users(id) on delete set null,
  codename    text,
  handled     boolean not null default false
);
create index if not exists puzzle_reports_new_idx on public.puzzle_reports (created_at desc);
create index if not exists puzzle_reports_verdict_idx on public.puzzle_reports (verdict, handled);

alter table public.puzzle_reports enable row level security;

-- ⚠ ANYONE MAY INSERT, INCLUDING A SIGNED-OUT STRANGER. That is the point: the person
-- most likely to find a broken puzzle is somebody doing their first ten, and requiring
-- an account to say "this is wrong" filters out exactly the reports worth having.
-- Insert-only means the worst an abuser can do is fill a table you alone can read.
drop policy if exists "anyone may file a report" on public.puzzle_reports;
create policy "anyone may file a report" on public.puzzle_reports
  for insert to anon, authenticated with check (true);

-- Reading is the Creator's alone. `match_config.creator_id` is the same row the Park
-- Tables already use to know who you are, so there is one definition of "the Creator"
-- on the whole database rather than a second one that can disagree with the first.
drop policy if exists "the creator reads reports" on public.puzzle_reports;
create policy "the creator reads reports" on public.puzzle_reports
  for select to authenticated
  using (auth.uid() = (select creator_id from public.match_config limit 1));

-- …and may mark one handled.
drop policy if exists "the creator files reports away" on public.puzzle_reports;
create policy "the creator files reports away" on public.puzzle_reports
  for update to authenticated
  using (auth.uid() = (select creator_id from public.match_config limit 1))
  with check (auth.uid() = (select creator_id from public.match_config limit 1));

-- ═══ 2. THE PUZZLE RATING — an Elo for the solver ════════════════════════════
-- Two columns on the profile. Unlike the Park Tables rating, this one settles on the
-- CLIENT: a puzzle is generated in the browser and never touches the server, so there is
-- no server-side fact to check it against and a `security definer` function would only
-- be theater. The honest position, same as every cosmetic here — anybody who wants a
-- number badly enough to forge it could always have edited their own credits.
alter table public.profiles add column if not exists puzzle_rating integer not null default 700;
alter table public.profiles add column if not exists puzzle_solved integer not null default 0;

-- ⚑ A THIRD COLUMN, 2026-08-26. `puzzle_solved` counts puzzles FINISHED — a reveal settles
-- through the same function, so it always has. `puzzle_clean` counts only the ones solved
-- with no hint, no reveal and no wrong first move, which is the figure the front door was
-- claiming to show and was not. Both are kept because they answer different questions.
-- ⚠ SAFE TO RUN LATE. The client reads and writes this column in statements of its OWN, so
-- an unmigrated database costs the clean count and nothing else — the rating and the played
-- count keep syncing either way. Until this runs, `clean` is local to each browser.
alter table public.profiles add column if not exists puzzle_clean integer not null default 0;
```

## Step 2 — check it took

```sql
select count(*) from public.puzzle_reports;                        -- 0, and no error
select puzzle_rating, puzzle_solved, puzzle_clean from public.profiles limit 1;  -- 700, 0, 0
```

### ⚠ …and check the one that fails silently

The read policy asks `match_config` who the Creator is. **If that table is empty, the
comparison is `auth.uid() = NULL`, which is NULL rather than true — so `puzzle_reports`
becomes unreadable by *everyone*, including you**, and `/puzzle-reports/` looks exactly
like "no reports yet". It is step 2 of `docs/park-tables-setup.md` and it is easy to have
skipped.

```sql
select * from public.match_config;          -- must return exactly one row, with YOUR uuid
select auth.uid();                          -- run while signed in; must match creator_id
```

If it comes back empty:

```sql
insert into public.match_config (creator_id) values ('<your-auth-uid>');
```

`/puzzle-reports/` now diagnoses this itself — it names the cause and prints the exact
`insert` with your own id already filled in. It no longer offers a list of three
possibilities and leaves you to guess between them.

## Step 3 — read them

`/puzzle-reports/` — a private page beside the leaderboards. It renders **nothing** for
anyone who is not the Creator, because the RLS policy above returns them no rows; the page
is not the security boundary, the policy is. It is `noindex` and out of the sitemap anyway.

**Read the `verdict` column first.** The room attaches the engine's own opinion to every
report, so they sort themselves:

| verdict | what it means | worth opening? |
|---|---|---|
| `mates` | the player's move is a **second mate** in a puzzle that promised one | **yes — that is a real bug** |
| `agrees` | the search likes their move too (≥280cp) but it isn't the stored line | **yes** |
| `refuted` | the engine can punish the move; `verdict_cp` says by how much | rarely — the puzzle was right |
| `none` | no claimed move, just a note | read the note |

The generator's own gates (`puzzleSane()` + `secondSolution()`) already throw out any
position with a second winning first move, so `mates` should be **impossible**. If one ever
lands in this table it means a gate has a hole, and that is the single most valuable row
the site can produce. See [[puzzle-room-invariants]].

## What this does NOT do

- **No email.** Reports land in a table you check, not an inbox that interrupts you. The
  ⚑ panel still offers Email and Copy underneath as the escape hatch.
- **No rate limit.** If it ever gets noisy the cheapest fix is a per-IP limit in a Supabase
  Edge Function; there is no point building it before there is noise.
- **No server referee on the puzzle rating.** See the note in the SQL above.
