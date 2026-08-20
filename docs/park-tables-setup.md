# The Park Tables — matchmaking setup (Nate-gated, ~5 minutes)

The Park Tables (`/games/park-tables/`) is player-vs-player correspondence chess — and
"Challenge McPuppy" games against you.

**ALREADY RAN v1? Just re-run Step 1 below — it upgrades in place** (v2, 2026-07-13:
PJCC Ratings + time controls). Every statement is idempotent: existing tables gain the
new columns, the functions are replaced, live games are untouched.

**The trust model, honestly stated:** the server enforces WHO may act (your seat, your turn,
one claim per open table) via SECURITY DEFINER functions — the anon key can't bypass them.
Chess LEGALITY is enforced by the perft-verified engine in every client: both players replay
the full move list on load, so a hand-crafted illegal move doesn't corrupt an opponent's
board — it shows up as a dead game.

**The PJCC Rating (v2):** every operative starts at **250**. Rated finished games move both
players by Elo (K=32, floor 100) — beat someone rated far above you and you take more
points; the expected result costs almost nothing. The math runs **server-side only**
(`settle_park_rating`, granted to nobody), triggered once per match by `finish_match` /
`claim_timeout`; a voided or unrated game never touches ratings. Casual tables are the
no-rating option. Ratings have no credit value, so there is still no economy to attack —
the worst a farmer can inflate is a number next to his own codename.

**Time controls (v2):** per-move clocks — none (casual pace), 1 day, or 3 days per
move. (The SQL allow-list below still accepts **3600** and is unchanged; the 1-hour rung was
taken out of the UI on 2026-08-20 — an hour a move is not fast on a board that polls every
four seconds, and offering it as the quick option was the only place the site said so. Any
table already on 3600 keeps working.) A flag only falls when the OPPONENT claims it (`claim_timeout`), like correspondence
sites: if nobody claims, the game simply waits. The clock starts when the seat fills.

## Step 1 — run this in Supabase → SQL Editor

```sql
-- ═══ The Park Tables: tables + config ═══════════════════════════════════════
create table if not exists public.matches (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  white        uuid not null references auth.users(id) on delete cascade,
  black        uuid references auth.users(id) on delete cascade,
  white_name   text not null,
  black_name   text,
  vs_creator   boolean not null default false,
  moves        text not null default '',   -- space-separated UCI: e2e4 e7e5 a7a8q
  fen          text not null default 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  status       text not null default 'open' check (status in ('open','active','done')),
  result       text,                        -- '1-0' | '0-1' | '1/2-1/2'
  win_reason   text,
  last_move_at timestamptz,
  emote_w      smallint, emote_w_at timestamptz,
  emote_b      smallint, emote_b_at timestamptz
);
create index if not exists matches_status_idx on public.matches (status, vs_creator);
create index if not exists matches_white_idx  on public.matches (white);
create index if not exists matches_black_idx  on public.matches (black);

-- who the Creator is (claim target for "Challenge McPuppy" tables)
create table if not exists public.match_config ( creator_id uuid primary key );

-- ═══ v2: PJCC Ratings + time controls ═══════════════════════════════════════
alter table public.matches add column if not exists rated        boolean not null default true;
alter table public.matches add column if not exists control_secs integer;         -- null = casual pace
alter table public.matches add column if not exists rating_w     integer;         -- snapshots for display
alter table public.matches add column if not exists rating_b     integer;
alter table public.matches add column if not exists delta_w      integer;         -- set once by the settle
alter table public.matches add column if not exists delta_b      integer;

-- every operative starts at 250
alter table public.profiles add column if not exists pjcc_rating integer not null default 250;
alter table public.profiles add column if not exists rated_games integer not null default 0;

alter table public.matches      enable row level security;
alter table public.match_config enable row level security;

-- signed-in players can READ everything (browsing open tables + watching games);
-- ALL writes go through the functions below — there are no insert/update policies.
drop policy if exists "matches readable"      on public.matches;
drop policy if exists "match config readable" on public.match_config;
create policy "matches readable"      on public.matches      for select to authenticated using (true);
create policy "match config readable" on public.match_config for select to authenticated using (true);

-- ═══ the rating settle — granted to NOBODY; only the definer functions below
--     may reach it. Runs exactly once per match (delta_w is the latch). ══════
create or replace function public.settle_park_rating(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare m matches%rowtype; ra int; rb int; ea numeric; sa numeric; k int := 32; da int;
begin
  select * into m from matches where id = p_id for update;
  if m.id is null or m.status <> 'done' or not m.rated or m.black is null
     or m.result not in ('1-0','0-1','1/2-1/2')
     or coalesce(m.win_reason,'') = 'voided'
     or m.delta_w is not null then return; end if;
  select pjcc_rating into ra from profiles where id = m.white;
  select pjcc_rating into rb from profiles where id = m.black;
  if ra is null or rb is null then return; end if;
  ea := 1.0 / (1.0 + power(10.0, (rb - ra) / 400.0));   -- white's expected score
  sa := case m.result when '1-0' then 1.0 when '0-1' then 0.0 else 0.5 end;
  da := round(k * (sa - ea));                            -- black's delta is exactly -da
  update profiles set pjcc_rating = greatest(100, pjcc_rating + da),
    rated_games = rated_games + 1 where id = m.white;
  update profiles set pjcc_rating = greatest(100, pjcc_rating - da),
    rated_games = rated_games + 1 where id = m.black;
  update matches set delta_w = da, delta_b = -da where id = p_id;
end $$;
revoke all on function public.settle_park_rating(uuid) from public, anon, authenticated;

-- ═══ the moves of the game ══════════════════════════════════════════════════
-- (drop the v1 one-arg version so the new defaulted signature is unambiguous;
--  old cached clients calling with just p_vs_creator still work via defaults)
drop function if exists public.create_match(boolean);
create or replace function public.create_match(p_vs_creator boolean, p_rated boolean default true, p_control_secs integer default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_name text; v_open int; v_id uuid;
begin
  select codename into v_name from profiles where id = auth.uid();
  if v_name is null then raise exception 'claim a codename first'; end if;
  if p_control_secs is not null and p_control_secs not in (3600, 86400, 259200)
    then raise exception 'no such clock'; end if;
  select count(*) into v_open from matches
    where (white = auth.uid() or black = auth.uid()) and status <> 'done';
  if v_open >= 6 then raise exception 'you already have six tables going'; end if;
  insert into matches (white, white_name, vs_creator, rated, control_secs, rating_w)
    values (auth.uid(), v_name, p_vs_creator, coalesce(p_rated, true), p_control_secs,
            (select pjcc_rating from profiles where id = auth.uid()))
    returning id into v_id;
  return v_id;
end $$;

create or replace function public.claim_match(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare m matches%rowtype; v_name text; v_creator uuid;
begin
  select * into m from matches where id = p_id for update;
  if m.id is null or m.status <> 'open' or m.black is not null then raise exception 'table taken'; end if;
  if m.white = auth.uid() then raise exception 'that is your own table'; end if;
  if m.vs_creator then
    select creator_id into v_creator from match_config limit 1;
    if v_creator is null or auth.uid() <> v_creator then raise exception 'reserved for the Creator'; end if;
  end if;
  select codename into v_name from profiles where id = auth.uid();
  if v_name is null then raise exception 'claim a codename first'; end if;
  -- last_move_at = now(): the clock starts the moment the seat fills (and emotes
  -- bumping updated_at can never reset a clock that hasn't started).
  update matches set black = auth.uid(), black_name = v_name, status = 'active',
    rating_b = (select pjcc_rating from profiles where id = auth.uid()),
    last_move_at = now(), updated_at = now() where id = p_id;
end $$;

create or replace function public.play_move(p_id uuid, p_uci text, p_fen text)
returns void language plpgsql security definer set search_path = public as $$
declare m matches%rowtype; v_turn text; v_mine boolean;
begin
  select * into m from matches where id = p_id for update;
  if m.id is null or m.status <> 'active' then raise exception 'no live game here'; end if;
  v_turn := split_part(m.fen, ' ', 2);                 -- 'w' | 'b', from the CURRENT position
  v_mine := (v_turn = 'w' and m.white = auth.uid()) or (v_turn = 'b' and m.black = auth.uid());
  if not v_mine then raise exception 'not your turn'; end if;
  if p_uci !~ '^[a-h][1-8][a-h][1-8][qrbn]?$' then raise exception 'bad move'; end if;
  if split_part(p_fen, ' ', 2) not in ('w','b') then raise exception 'bad fen'; end if;
  update matches set moves = trim(moves || ' ' || p_uci), fen = p_fen,
    last_move_at = now(), updated_at = now() where id = p_id;
end $$;

create or replace function public.finish_match(p_id uuid, p_result text, p_reason text)
returns void language plpgsql security definer set search_path = public as $$
declare m matches%rowtype;
begin
  select * into m from matches where id = p_id for update;
  if m.id is null or m.status = 'done' then raise exception 'already closed'; end if;
  -- NOT `auth.uid() not in (m.white, m.black)`: with an unclaimed seat m.black is NULL,
  -- and `x NOT IN (a, NULL)` evaluates to NULL — the guard would silently pass and any
  -- stranger could close open tables. Spell it out.
  if auth.uid() <> m.white and (m.black is null or auth.uid() <> m.black)
    then raise exception 'not your table'; end if;
  if p_result not in ('1-0','0-1','1/2-1/2') then raise exception 'bad result'; end if;
  update matches set status = 'done', result = p_result,
    win_reason = left(coalesce(p_reason,''), 24), updated_at = now() where id = p_id;
  perform settle_park_rating(p_id);
end $$;

-- flag-fall by claim, correspondence style: only the player NOT on move may call
-- it, only on a clocked table, and only after the full per-move allowance passed.
create or replace function public.claim_timeout(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare m matches%rowtype; v_turn text; v_theirs boolean; v_since timestamptz;
begin
  select * into m from matches where id = p_id for update;
  if m.id is null or m.status <> 'active' then raise exception 'no live game here'; end if;
  if auth.uid() <> m.white and (m.black is null or auth.uid() <> m.black)
    then raise exception 'not your table'; end if;
  if m.control_secs is null then raise exception 'this table has no clock'; end if;
  v_turn := split_part(m.fen, ' ', 2);
  v_theirs := (v_turn = 'w' and m.black = auth.uid()) or (v_turn = 'b' and m.white = auth.uid());
  if not v_theirs then raise exception 'it is your move'; end if;
  v_since := coalesce(m.last_move_at, m.updated_at);
  if now() < v_since + make_interval(secs => m.control_secs)
    then raise exception 'their clock has not run out'; end if;
  update matches set status = 'done',
    result = case when m.white = auth.uid() then '1-0' else '0-1' end,
    win_reason = 'time', updated_at = now() where id = p_id;
  perform settle_park_rating(p_id);
end $$;

create or replace function public.send_emote(p_id uuid, p_code smallint)
returns void language plpgsql security definer set search_path = public as $$
declare m matches%rowtype;
begin
  if p_code < 0 or p_code > 3 then raise exception 'no such phrase'; end if;
  select * into m from matches where id = p_id for update;
  if m.id is null then raise exception 'no table'; end if;
  if auth.uid() = m.white then
    update matches set emote_w = p_code, emote_w_at = now(), updated_at = now() where id = p_id;
  elsif auth.uid() = m.black then
    update matches set emote_b = p_code, emote_b_at = now(), updated_at = now() where id = p_id;
  else raise exception 'not your table'; end if;
end $$;

revoke all on function public.create_match(boolean, boolean, integer) from public, anon;
revoke all on function public.claim_match(uuid)              from public, anon;
revoke all on function public.play_move(uuid, text, text)    from public, anon;
revoke all on function public.finish_match(uuid, text, text) from public, anon;
revoke all on function public.claim_timeout(uuid)            from public, anon;
revoke all on function public.send_emote(uuid, smallint)     from public, anon;
grant execute on function public.create_match(boolean, boolean, integer) to authenticated;
grant execute on function public.claim_match(uuid)              to authenticated;
grant execute on function public.play_move(uuid, text, text)    to authenticated;
grant execute on function public.finish_match(uuid, text, text) to authenticated;
grant execute on function public.claim_timeout(uuid)            to authenticated;
grant execute on function public.send_emote(uuid, smallint)     to authenticated;
```

## Step 2 — tell it who you are

Find your user id (SQL Editor):

```sql
select id, email from auth.users order by created_at limit 5;
```

Then (replace with YOUR id — the account whose codename is Mr. McPuppy):

```sql
insert into public.match_config (creator_id) values ('893bf6fe-4fe1-43b1-a272-50717d5a02f0');
```

## Step 3 — list the game

In `assets/js/pjcc-games-data.js`, uncomment the `park-tables` line. Push. The Arcade hall
picks it up automatically.

## Step 4 — play a table (your flow)

Sign in on `/games/park-tables/` with your own account. Any visitor who taps **Challenge
McPuppy** creates a table only you can claim; they show under **Waiting for the Creator**
on your screen. Claim one, play a move whenever — it's correspondence, a move a day is
plenty, and that's the charm: *the Creator plays back.*

## v1 limits, on purpose

Polling (~4s), not websockets — feels live enough, zero new infrastructure. Promotion is
always a queen. No clocks, no draw offers (a stalemate/threefold ends it automatically; the
Resign button covers the rest). No credits for wins — no economy to cheat. All parked in
FUTURE-IDEAS as Park Tables v2.
