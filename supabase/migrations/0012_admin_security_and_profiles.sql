alter table public.profiles
add column if not exists is_admin boolean not null default false;

create or replace function public.is_admin_user()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and is_admin = true
  );
$$;

drop policy if exists "users can insert own profile" on public.profiles;
create policy "users can insert own profile"
on public.profiles
for insert
with check (
  auth.uid() = id
  and is_admin = false
);

drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile"
on public.profiles
for update
using (auth.uid() = id)
with check (
  auth.uid() = id
  and is_admin = coalesce((select p.is_admin from public.profiles p where p.id = auth.uid()), false)
);

drop policy if exists "transfer rumors are manageable by authenticated users" on public.transfer_rumors;
create policy "transfer rumors are manageable by admins"
on public.transfer_rumors
for all
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "league standings are manageable by authenticated users" on public.league_standings;
create policy "league standings are manageable by admins"
on public.league_standings
for all
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "season player stats are manageable by authenticated users" on public.season_player_stats;
create policy "season player stats are manageable by admins"
on public.season_player_stats
for all
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "match played players are manageable by authenticated users" on public.match_played_players;
create policy "match played players are manageable by admins"
on public.match_played_players
for all
using (public.is_admin_user())
with check (public.is_admin_user());
