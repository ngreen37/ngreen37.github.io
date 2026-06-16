-- =============================================================================
-- PJCC Operative Profile System — Phase 1 schema
-- Run this top-to-bottom in your Supabase project: SQL Editor -> New query -> Run.
-- Safe to re-run: every statement uses IF NOT EXISTS / CREATE OR REPLACE.
-- =============================================================================

-- 1. PROFILES -----------------------------------------------------------------
-- One row per player. id matches the Supabase auth user id.
create table if not exists profiles (
  id          uuid primary key references auth.users on delete cascade,
  codename    text unique not null,
  companion   jsonb default '{}'::jsonb,        -- {name, piece, level, xp}
  credits     int  default 0,
  rank        text default 'Recruit',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- 2. GAME_STATS ---------------------------------------------------------------
-- One row per (player, game): best score + play count + per-game extras.
create table if not exists game_stats (
  id         bigint generated always as identity primary key,
  user_id    uuid references profiles(id) on delete cascade,
  game       text not null,
  best_score int default 0,
  plays      int default 0,
  data       jsonb default '{}'::jsonb,
  updated_at timestamptz default now(),
  unique (user_id, game)
);

-- 3. SCORES -------------------------------------------------------------------
-- Append-only leaderboard entries. seed = date string for daily boards, else null.
create table if not exists scores (
  id         bigint generated always as identity primary key,
  user_id    uuid references profiles(id) on delete cascade,
  game       text not null,
  score      int  not null,
  seed       text,
  created_at timestamptz default now()
);
create index if not exists scores_game_score_idx on scores (game, score desc);
create index if not exists scores_game_seed_idx  on scores (game, seed);

-- 4. ROW LEVEL SECURITY -------------------------------------------------------
-- Without this, anyone could overwrite anyone's data. Read = public (for public
-- profiles + leaderboards); writes = only your own rows (auth.uid() = owner).
alter table profiles   enable row level security;
alter table game_stats enable row level security;
alter table scores     enable row level security;

-- profiles
drop policy if exists "profiles read"   on profiles;
drop policy if exists "profiles insert" on profiles;
drop policy if exists "profiles update" on profiles;
create policy "profiles read"   on profiles for select using (true);
create policy "profiles insert" on profiles for insert with check (auth.uid() = id);
create policy "profiles update" on profiles for update using (auth.uid() = id);

-- game_stats
drop policy if exists "stats read"   on game_stats;
drop policy if exists "stats insert" on game_stats;
drop policy if exists "stats update" on game_stats;
create policy "stats read"   on game_stats for select using (true);
create policy "stats insert" on game_stats for insert with check (auth.uid() = user_id);
create policy "stats update" on game_stats for update using (auth.uid() = user_id);

-- scores
drop policy if exists "scores read"   on scores;
drop policy if exists "scores insert" on scores;
create policy "scores read"   on scores for select using (true);
create policy "scores insert" on scores for insert with check (auth.uid() = user_id);

-- 5. CREDIT HELPER (atomic increment) -----------------------------------------
-- Lets the client add credits in one safe call instead of read-modify-write.
create or replace function add_credits(amount int)
returns int
language sql
security definer
set search_path = public
as $$
  update profiles set credits = credits + amount, updated_at = now()
  where id = auth.uid()
  returning credits;
$$;

-- 6. MAILING LIST ------------------------------------------------------------
-- Newsletter signups. Insert-only from the browser; emails are NOT readable via
-- the API (no select policy) so they can't be scraped — you read them in the
-- Supabase Table Editor. Run this block if you added the mailing list later.
create table if not exists subscribers (
  id         bigint generated always as identity primary key,
  email      text not null unique,
  created_at timestamptz default now()
);
alter table subscribers enable row level security;
drop policy if exists "subscribers insert" on subscribers;
create policy "subscribers insert" on subscribers for insert with check (true);
-- (intentionally no select policy: write-only from the client)

-- 7. REFERRALS ----------------------------------------------------------------
-- One-time referral: a new operative redeems a friend's codename; both get +10
-- credits. Guarded server-side against self-referral and double-redeeming. Run
-- this block if you added referral links later.
alter table profiles add column if not exists referred_by uuid;

create or replace function redeem_referral(ref_codename text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  ref_id uuid;
  me uuid := auth.uid();
begin
  if me is null then return 'no auth'; end if;
  if (select referred_by from profiles where id = me) is not null then return 'already'; end if;
  select id into ref_id from profiles where codename = ref_codename;
  if ref_id is null then return 'no referrer'; end if;
  if ref_id = me then return 'self'; end if;
  update profiles set referred_by = ref_id, credits = credits + 10, updated_at = now() where id = me;
  update profiles set credits = credits + 10, updated_at = now() where id = ref_id;
  return 'ok';
end;
$$;

-- Done. Tables: profiles, game_stats, scores, subscribers.
-- Functions: add_credits(int), redeem_referral(text).
