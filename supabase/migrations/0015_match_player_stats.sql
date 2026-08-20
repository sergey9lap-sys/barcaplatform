create table if not exists public.match_player_stats (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches (id) on delete cascade,
  match_player_id uuid not null references public.match_players (id) on delete cascade,
  goals integer not null default 0 check (goals >= 0),
  assists integer not null default 0 check (assists >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (match_id, match_player_id)
);

drop trigger if exists match_player_stats_set_updated_at on public.match_player_stats;
create trigger match_player_stats_set_updated_at
before update on public.match_player_stats
for each row execute function public.set_updated_at();

alter table public.match_player_stats enable row level security;

drop policy if exists "match player stats are viewable by everyone" on public.match_player_stats;
create policy "match player stats are viewable by everyone"
on public.match_player_stats
for select
using (true);

drop policy if exists "match player stats are manageable by admins" on public.match_player_stats;
create policy "match player stats are manageable by admins"
on public.match_player_stats
for all
using (public.is_admin_user())
with check (public.is_admin_user());
