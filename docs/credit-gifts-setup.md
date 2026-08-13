# Credit gifts — setup (Nate-gated, ~2 minutes)

Nate, 2026-08-13: *"how about a mechanism where a user can click on another user's name, and
they can give them 1, 5, 10, 25, or 50 credits? That's the only thing they can interact with
a specific user on for now."*

**Until you run this, the feature is invisible** — not broken, invisible. The client probes for
the function once per session and only draws the gift affordance if it answers. Nothing on any
page changes before you paste this in.

## Run it

Supabase → **SQL Editor** → New query → paste the whole block below → **Run**. It is
idempotent; running it twice is harmless.

```sql
-- ════════════════════════════════════════════════════════════════════════════════
--  CREDIT GIFTS — one operative hands another a few credits
-- ════════════════════════════════════════════════════════════════════════════════

-- 1. THE LEDGER ------------------------------------------------------------------
-- Every gift is recorded. Two reasons, and the second is the load-bearing one:
--   · a recipient can be shown who paid for their good day
--   · the daily cap below is COUNTED from this table, so the cap cannot be bypassed
--     by a client that simply forgets to ask
create table if not exists credit_gifts (
  id         bigint generated always as identity primary key,
  from_id    uuid not null references profiles(id) on delete cascade,
  to_id      uuid not null references profiles(id) on delete cascade,
  amount     int  not null check (amount > 0),
  created_at timestamptz default now()
);
create index if not exists credit_gifts_from_idx on credit_gifts (from_id, created_at desc);
create index if not exists credit_gifts_to_idx   on credit_gifts (to_id,   created_at desc);

alter table credit_gifts enable row level security;
-- Readable only by the two people involved. NO insert/update/delete policy at all:
-- the only way a row appears is through the function below, which runs as definer.
drop policy if exists "gifts read" on credit_gifts;
create policy "gifts read" on credit_gifts for select
  to authenticated using (auth.uid() = from_id or auth.uid() = to_id);

-- 2. THE FUNCTION ----------------------------------------------------------------
-- Returns jsonb {ok:bool, reason:text, ...} and NEVER raises for an ordinary refusal,
-- so the client can show a plain sentence instead of a stack trace.
--
-- ⚠ BY CODENAME, NOT BY ID. `profiles.codename` is already `unique not null`, the
--   client already has the name it just rendered, and looking it up in here means no
--   page ever has to put a user's uuid in its HTML. (`redeem_referral` set the pattern.)
create or replace function gift_credits(p_to_codename text, p_amount int)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  me         uuid := auth.uid();
  target     uuid;
  left_after int;
  sent_today int;
begin
  if me is null then
    return jsonb_build_object('ok', false, 'reason', 'signed_out');
  end if;

  -- ⚠ THE LADDER IS ENFORCED HERE, NOT IN THE BROWSER. The five amounts are the whole
  --   product decision; a client-side check is a suggestion.
  if p_amount not in (1, 5, 10, 25, 50) then
    return jsonb_build_object('ok', false, 'reason', 'bad_amount');
  end if;

  select id into target from profiles where codename = p_to_codename;
  if target is null then
    return jsonb_build_object('ok', false, 'reason', 'no_such_operative');
  end if;
  if target = me then
    return jsonb_build_object('ok', false, 'reason', 'self');
  end if;

  -- 3. THE DAILY CAP -------------------------------------------------------------
  -- Credits are never CREATED here, only moved — so the abuse this guards is not
  -- inflation, it is a pile of throwaway accounts funnelling into one. The cap makes
  -- that slow enough to be pointless without touching an honest player, who is giving
  -- somebody 10 credits for a nice game, not 200.
  -- ⭐ Deliberately miser: loosening a cap later is a gift, tightening one is a takeaway.
  select coalesce(sum(amount), 0) into sent_today
    from credit_gifts
   where from_id = me and created_at > now() - interval '24 hours';

  if sent_today + p_amount > 200 then
    return jsonb_build_object('ok', false, 'reason', 'daily_cap',
                              'sent', sent_today, 'cap', 200);
  end if;

  -- 4. THE SPEND -----------------------------------------------------------------
  -- ⚠⚠ THE BALANCE CHECK IS IN THE `where`, NOT AN `if` ABOVE IT. Reading the balance
  --    and then updating it is two statements with a gap between them, and two tabs in
  --    that gap can each pass a check the other invalidates. Here the row only matches
  --    if it can afford the gift, so the check and the spend are the same atomic write —
  --    and `returning ... into` coming back NULL is how we learn it could not.
  update profiles
     set credits = credits - p_amount, updated_at = now()
   where id = me and credits >= p_amount
  returning credits into left_after;

  if left_after is null then
    return jsonb_build_object('ok', false, 'reason', 'not_enough');
  end if;

  update profiles set credits = credits + p_amount, updated_at = now() where id = target;
  insert into credit_gifts (from_id, to_id, amount) values (me, target, p_amount);

  return jsonb_build_object('ok', true, 'amount', p_amount,
                            'to', p_to_codename, 'balance', left_after);
end;
$$;

revoke all on function gift_credits(text, int) from public;
grant execute on function gift_credits(text, int) to authenticated;
```

## What the client does with it

- **`PJCC.giftsEnabled()`** probes once per session by calling the function with an amount
  the ladder does not allow. If it answers `{ok:false, reason:'bad_amount'}` the feature
  exists and the UI appears; if the call errors, the function is not there and **no gift
  affordance is ever drawn**. Nothing has to be switched on by hand.
- **`PJCC.giftCredits(codename, amount)`** resolves `{ok:…}` and never throws, so a refusal
  is a sentence rather than a crash. Same rule as `reportPuzzle()`.

## The refusals, and what each one says

| `reason` | when | what the player sees |
|---|---|---|
| `signed_out` | not signed in | the affordance is not drawn at all |
| `bad_amount` | not one of 1/5/10/25/50 | (only reachable by a hand-crafted call) |
| `no_such_operative` | codename gone | "That operative is no longer here." |
| `self` | your own row | your own row has no gift button |
| `not_enough` | balance too low | "You have N credits." — the amounts you cannot afford are disabled |
| `daily_cap` | over 200 in 24h | "You have given 200 credits today. Back tomorrow." |

## Changing the amounts or the cap

The five amounts are named in **two** places and both must agree: `p_amount not in (…)` in
the SQL above, and `GIFT_TIERS` in `assets/js/pjcc-profile.js`. The SQL is the one that
actually enforces; the client copy exists only to draw the buttons. `npm run test:gifts`
asserts the two lists match, so they cannot drift silently.

The cap is `200` in the SQL only — the client reads it back off the refusal, so raising it is
a one-line change here and nothing needs redeploying.
