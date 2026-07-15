-- ═══════════════════════════════════════════════════════════════════════════
--  USERNAME MODERATION — the codename gate (Nate-gated, ~2 minutes)
-- ═══════════════════════════════════════════════════════════════════════════
--  Codenames are set by a DIRECT client insert into `profiles` (governed only by
--  RLS: auth.uid() = id). A client-only filter is bypassable with the anon key, so
--  the real gate lives HERE, as a BEFORE INSERT/UPDATE trigger the anon key cannot
--  escape. It also covers the companion's public pet-name.
--
--  Strictness: STRICT / SUBSTRING (Nate's call). A codename is blocked if its
--  normalized form CONTAINS any blocked term anywhere — after we defeat the usual
--  dodges: case, accents/diacritics, full-width & unicode look-alikes (NFKC),
--  leetspeak (0→o, 4→a, 3→e, @→a, $→s …), punctuation/emoji, and 3+ char runs
--  ("sluuur"). The `codename_allow` table rescues innocent collisions
--  (the "Scunthorpe problem") by exact normalized name.
--
--  THREE STEPS:
--    1. Run THIS file once in Supabase → SQL Editor.
--    2. Generate the word list:  npm run gen:blocklist   → paste the produced
--       docs/blocklist-seed.sql into the SQL Editor and run it.
--    3. Deploy the site (the client pre-check + friendly error are already wired
--       in pjcc-profile.js and degrade safely until steps 1–2 are done).
--
--  Idempotent: safe to re-run. It never reads to the client — the word list is
--  invisible to browsers; only the SECURITY DEFINER functions below can see it.
-- ═══════════════════════════════════════════════════════════════════════════

-- unaccent folds café → cafe, Ｃ → C-adjacent diacritics, etc. (Latin/Greek/Cyrillic;
-- it leaves CJK/Hangul/Arabic/Devanagari untouched, which is what we want).
create extension if not exists unaccent with schema public;

-- The blocked list + the allowlist. RLS on, NO client policies: the anon and
-- authenticated roles can't read either table. Only the definer functions can.
create table if not exists public.blocked_terms ( term text primary key );
create table if not exists public.codename_allow ( norm text primary key );
alter table public.blocked_terms enable row level security;
alter table public.codename_allow enable row level security;

-- ── the normalizer: everything a candidate (or a listed term) is reduced to
--    before matching. Same function normalizes both sides, so there's no drift.
create or replace function public.pjcc_normalize(p text)
returns text language sql stable set search_path = public as $$
  select regexp_replace(                               -- 4) collapse runs of 3+ ("fuuuck"→"fuck")
    regexp_replace(                                    -- 3) keep letters of ALL scripts; drop the rest
      translate(                                       -- 2) de-leet
        unaccent(lower(normalize(coalesce(p,''), NFKC))),  -- 1) NFKC-fold, lowercase, strip accents
        '0134578@$!|', 'oieastbasii'
      ),
      '[^[:alpha:]]', '', 'g'
    ),
    '(.)\1{2,}', '\1', 'g'
  )
$$;

-- ── the verdict. SECURITY DEFINER so it (and only it) may read the word list.
create or replace function public.codename_is_clean(p text)
returns boolean language plpgsql stable security definer set search_path = public as $$
declare n text;
begin
  n := pjcc_normalize(p);
  if n = '' then return true; end if;                                  -- nothing matchable
  if exists (select 1 from codename_allow a where a.norm = n) then return true; end if;
  if exists (select 1 from blocked_terms b where n like '%' || b.term || '%') then return false; end if;
  return true;
end $$;

-- ── the client pre-check RPC: a friendly yes/no BEFORE inserting. Returns only a
--    boolean — never the reason, never the list.
create or replace function public.is_codename_allowed(p text)
returns boolean language sql stable security definer set search_path = public as $$
  select public.codename_is_clean(p)
$$;
revoke all on function public.is_codename_allowed(text) from public;
grant execute on function public.is_codename_allowed(text) to anon, authenticated;

-- ── THE GATE: reject a dirty codename (or companion name) on the way into profiles.
create or replace function public.profiles_codename_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.codename is not null and not codename_is_clean(new.codename) then
    raise exception 'PJCC_CODENAME_BLOCKED' using errcode = 'check_violation';
  end if;
  if new.companion ? 'name' and coalesce(new.companion->>'name','') <> ''
     and not codename_is_clean(new.companion->>'name') then
    raise exception 'PJCC_CODENAME_BLOCKED' using errcode = 'check_violation';
  end if;
  return new;
end $$;

drop trigger if exists profiles_codename_guard_t on public.profiles;
create trigger profiles_codename_guard_t
  before insert or update of codename, companion on public.profiles
  for each row execute function public.profiles_codename_guard();

-- ── After Step 2 (the seed), sanity-check in the SQL Editor:
--     select public.is_codename_allowed('Princess');  -- true  (clean)
--     select public.is_codename_allowed('Argus');     -- true  (clean)
--     select public.is_codename_allowed('damn');      -- false (mild word in the list)
--     select public.is_codename_allowed('d4mn');      -- false (de-leet catches it)
--
-- ── To rescue an innocent name the substring rule catches, allowlist its NORMALIZED
--    form (see what it normalizes to first):
--     select public.pjcc_normalize('Scunthorpe');          -- shows the key
--     insert into public.codename_allow(norm) values (public.pjcc_normalize('Scunthorpe'));
--
-- ── To audit existing accounts for names that would now be blocked:
--     select id, codename from public.profiles where not public.codename_is_clean(codename);
