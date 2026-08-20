create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  player_name text not null unique,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.match_players
add column if not exists player_id uuid references public.players (id) on delete set null;

insert into public.players (player_name)
select distinct player_name
from public.match_players
where player_name is not null
on conflict (player_name) do nothing;

update public.match_players match_player
set player_id = players.id
from public.players players
where match_player.player_id is null
  and players.player_name = match_player.player_name;

create table if not exists public.match_played_players (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches (id) on delete cascade,
  match_player_id uuid not null references public.match_players (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (match_id, match_player_id)
);

create table if not exists public.player_rankings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  match_id uuid not null references public.matches (id) on delete cascade,
  match_player_id uuid not null references public.match_players (id) on delete cascade,
  rank_position integer not null check (rank_position between 1 and 16),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, match_player_id),
  unique (user_id, match_id, rank_position)
);

drop trigger if exists player_rankings_set_updated_at on public.player_rankings;
create trigger player_rankings_set_updated_at
before update on public.player_rankings
for each row execute function public.set_updated_at();

alter table public.players enable row level security;
alter table public.match_played_players enable row level security;
alter table public.player_rankings enable row level security;

drop policy if exists "players are viewable by everyone" on public.players;
create policy "players are viewable by everyone"
on public.players
for select
using (true);

drop policy if exists "match played players are viewable by everyone" on public.match_played_players;
create policy "match played players are viewable by everyone"
on public.match_played_players
for select
using (true);

drop policy if exists "player rankings are viewable by everyone" on public.player_rankings;
create policy "player rankings are viewable by everyone"
on public.player_rankings
for select
using (true);

drop policy if exists "users can insert own player rankings" on public.player_rankings;
create policy "users can insert own player rankings"
on public.player_rankings
for insert
with check (auth.uid() = user_id);

drop policy if exists "users can update own player rankings" on public.player_rankings;
create policy "users can update own player rankings"
on public.player_rankings
for update
using (auth.uid() = user_id);
