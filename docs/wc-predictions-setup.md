# World Championship predictions — setup (Nate-gated, ~2 minutes)

Nate, 2026-11-26, from the growth list: **"let's do #1"** — predict each game of the 2026 World
Championship on chesswild.com/wc/, with a free account, and a leaderboard across the match.

**Until you run this, the predictions panel does not exist** — not broken, absent. `/wc/` still
shows the match, the results and each game's puzzle; it probes for `predict_split` once and only
draws the three buttons and the leaderboard if it answers. Same posture as `follows-setup.md`.

## What a prediction is here — read this before changing it

- **A pick is one of the two players, or a draw.** Not free text: the server refuses any other
  value, so nothing anybody types can reach another person's screen.
- **Your picks are visible to you and to nobody else.** Other people see two things only: how many
  picked each result (a count, per game), and the leaderboard of right calls by codename — the same
  codenames the site's other leaderboards already show.
- **A pick locks when the game starts.** The server compares its own clock with the game's start
  time; a page that is wrong about the time cannot sneak a pick in after the first move.
- **Results come from the clip machine, not from a browser.** `npm run wc` (the game-day video run)
  sends each finished game's result with a key that only lives in
  `private/docs/godot/tournament_board/match.json` on your PC (`predictKey`). The SQL below holds
  only that key's SHA-256, so publishing this file publishes nothing that opens the door.

## Run it

Supabase → **SQL Editor** → New query → paste the whole block → **Run**. Idempotent; running it
twice is harmless.

```sql
-- ════════════════════════════════════════════════════════════════════════════════
--  PREDICTIONS — pick each game's result before it starts; a leaderboard of right calls
-- ════════════════════════════════════════════════════════════════════════════════
create extension if not exists pgcrypto with schema extensions;

-- 1. THE GAMES ------------------------------------------------------------------
-- One row per game of an event. `players` are the keys a pick may name, besides 'draw'.
create table if not exists predict_games (
  event     text not null,
  game      int  not null,
  starts_at timestamptz not null,
  players   text[] not null,
  result    text,
  primary key (event, game)
);
alter table predict_games enable row level security;
drop policy if exists "predict games read" on predict_games;
create policy "predict games read" on predict_games for select using (true);
-- ⚠ No write policy: only predict_settle (below) and this editor change a game.

-- 2. THE PICKS ------------------------------------------------------------------
create table if not exists predict_picks (
  user_id uuid not null references profiles(id) on delete cascade,
  event   text not null,
  game    int  not null,
  pick    text not null,
  at      timestamptz not null default now(),
  primary key (user_id, event, game),
  foreign key (event, game) references predict_games(event, game)
);
alter table predict_picks enable row level security;

drop policy if exists "predict picks read own" on predict_picks;
create policy "predict picks read own" on predict_picks for select
  to authenticated using (auth.uid() = user_id);

-- ⚠ BEFORE THE GAME STARTS, AND ONLY ONE OF ITS PLAYERS OR A DRAW — by the server's clock.
drop policy if exists "predict picks insert own" on predict_picks;
create policy "predict picks insert own" on predict_picks for insert
  to authenticated with check (
    auth.uid() = user_id and exists (
      select 1 from predict_games g
      where g.event = predict_picks.event and g.game = predict_picks.game
        and now() < g.starts_at and (predict_picks.pick = 'draw' or predict_picks.pick = any(g.players))));

drop policy if exists "predict picks change own" on predict_picks;
create policy "predict picks change own" on predict_picks for update
  to authenticated
  using (auth.uid() = user_id and exists (
      select 1 from predict_games g
      where g.event = predict_picks.event and g.game = predict_picks.game and now() < g.starts_at))
  with check (auth.uid() = user_id and exists (
      select 1 from predict_games g
      where g.event = predict_picks.event and g.game = predict_picks.game
        and now() < g.starts_at and (predict_picks.pick = 'draw' or predict_picks.pick = any(g.players))));

-- 3. WHAT EVERYONE MAY SEE: counts, and right calls by codename ------------------
create or replace function predict_split(ev text)
returns table (game int, pick text, n int)
language sql stable security definer set search_path = public as $$
  select k.game, k.pick, count(*)::int from predict_picks k where k.event = ev group by k.game, k.pick
$$;
grant execute on function predict_split(text) to anon, authenticated;

create or replace function predict_board(ev text, top int default 25)
returns table (codename text, right_calls int, called int)
language sql stable security definer set search_path = public as $$
  select p.codename, count(*) filter (where k.pick = g.result)::int, count(*)::int
  from predict_picks k
  join predict_games g on g.event = k.event and g.game = k.game and g.result is not null
  join profiles p on p.id = k.user_id
  where k.event = ev and p.codename is not null
  group by p.codename
  order by 2 desc, 3 asc, 1 asc
  limit least(greatest(top, 1), 100)
$$;
grant execute on function predict_board(text, int) to anon, authenticated;

-- 4. RESULTS, FROM THE CLIP MACHINE ONLY -----------------------------------------
-- The key's SHA-256 is all this file holds; the key itself is in match.json on Nate's PC.
create or replace function predict_settle(ev text, g int, r text, key text)
returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  if encode(extensions.digest(key, 'sha256'), 'hex')
     <> '11c856be419ed703ffccc2932ffff97acac3a59a1a3a387e40e26b05fd00e278' then
    raise exception 'not allowed';
  end if;
  update predict_games set result = r
  where event = ev and game = g and (r = 'draw' or r = any(players));
end $$;
revoke all on function predict_settle(text, int, text, text) from public;
grant execute on function predict_settle(text, int, text, text) to anon, authenticated;

-- 5. THE 2026 MATCH: fourteen games at 14:00 UTC; the first three drawn ------------
insert into predict_games (event, game, starts_at, players, result) values
  ('wc2026',  1, '2026-11-24 14:00+00', '{gukesh,sindarov}', 'draw'),
  ('wc2026',  2, '2026-11-25 14:00+00', '{gukesh,sindarov}', 'draw'),
  ('wc2026',  3, '2026-11-26 14:00+00', '{gukesh,sindarov}', 'draw'),
  ('wc2026',  4, '2026-11-28 14:00+00', '{gukesh,sindarov}', null),
  ('wc2026',  5, '2026-11-29 14:00+00', '{gukesh,sindarov}', null),
  ('wc2026',  6, '2026-11-30 14:00+00', '{gukesh,sindarov}', null),
  ('wc2026',  7, '2026-12-02 14:00+00', '{gukesh,sindarov}', null),
  ('wc2026',  8, '2026-12-03 14:00+00', '{gukesh,sindarov}', null),
  ('wc2026',  9, '2026-12-04 14:00+00', '{gukesh,sindarov}', null),
  ('wc2026', 10, '2026-12-06 14:00+00', '{gukesh,sindarov}', null),
  ('wc2026', 11, '2026-12-07 14:00+00', '{gukesh,sindarov}', null),
  ('wc2026', 12, '2026-12-08 14:00+00', '{gukesh,sindarov}', null),
  ('wc2026', 13, '2026-12-10 14:00+00', '{gukesh,sindarov}', null),
  ('wc2026', 14, '2026-12-11 14:00+00', '{gukesh,sindarov}', null)
on conflict (event, game) do update set starts_at = excluded.starts_at, players = excluded.players,
  result = coalesce(predict_games.result, excluded.result);
```

## Check it worked

Still in the SQL editor:

```sql
select game, starts_at, result from predict_games where event = 'wc2026' order by game;
select * from predict_split('wc2026');
```

Fourteen games, the first three `draw`; the split is empty until somebody picks. Then open
`chesswild.com/wc/` signed in: three buttons under "Predict Game 4".

⚠ In this editor `auth.uid()` is NULL, so a pick inserted here by hand is refused by design —
test picks from the page.

## A tiebreak, or the next event

A tiebreak is one more row (`game` 15, its start time). A new event is new rows under a new
`event` key with its own `players`, and `/wc/`'s data file names the event it shows.
