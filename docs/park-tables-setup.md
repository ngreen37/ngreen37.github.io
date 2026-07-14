# The Park Tables — matchmaking setup (Nate-gated, ~5 minutes)

The Park Tables (`/games/park-tables/`) is player-vs-player correspondence chess — and
"Challenge McPuppy" games against you. The page is built and ships dark: until you run this
SQL it politely says the tables are being set up. Run it, uncomment one registry line, and
it's live.

**The trust model, honestly stated:** the server enforces WHO may act (your seat, your turn,
one claim per open table) via SECURITY DEFINER functions — the anon key can't bypass them.
Chess LEGALITY is enforced by the perft-verified engine in every client: both players replay
the full move list on load, so a hand-crafted illegal move doesn't corrupt an opponent's
board — it shows up as a dead game. Nobody can cheat *you* out of anything real; worst case
a vandal ruins their own match. Credits are never awarded by match results in v1, so there
is no economy to attack.

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

alter table public.matches      enable row level security;
alter table public.match_config enable row level security;

-- signed-in players can READ everything (browsing open tables + watching games);
-- ALL writes go through the functions below — there are no insert/update policies.
create policy "matches readable"      on public.matches      for select to authenticated using (true);
create policy "match config readable" on public.match_config for select to authenticated using (true);

-- ═══ the four moves of the game ═════════════════════════════════════════════
create or replace function public.create_match(p_vs_creator boolean)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_name text; v_open int; v_id uuid;
begin
  select codename into v_name from profiles where id = auth.uid();
  if v_name is null then raise exception 'claim a codename first'; end if;
  select count(*) into v_open from matches
    where (white = auth.uid() or black = auth.uid()) and status <> 'done';
  if v_open >= 6 then raise exception 'you already have six tables going'; end if;
  insert into matches (white, white_name, vs_creator) values (auth.uid(), v_name, p_vs_creator)
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
  update matches set black = auth.uid(), black_name = v_name, status = 'active',
    updated_at = now() where id = p_id;
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

revoke all on function public.create_match(boolean)          from public, anon;
revoke all on function public.claim_match(uuid)              from public, anon;
revoke all on function public.play_move(uuid, text, text)    from public, anon;
revoke all on function public.finish_match(uuid, text, text) from public, anon;
revoke all on function public.send_emote(uuid, smallint)     from public, anon;
grant execute on function public.create_match(boolean)          to authenticated;
grant execute on function public.claim_match(uuid)              to authenticated;
grant execute on function public.play_move(uuid, text, text)    to authenticated;
grant execute on function public.finish_match(uuid, text, text) to authenticated;
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
