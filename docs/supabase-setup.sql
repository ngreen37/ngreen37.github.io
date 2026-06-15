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

-- Done. Tables: profiles, game_stats, scores. Function: add_credits(int).
