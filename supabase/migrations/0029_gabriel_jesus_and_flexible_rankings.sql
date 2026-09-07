-- Add Gabriel Jesus to the current match pool and allow real match squads
-- with five substitutions or the extra concussion substitution.

alter table public.player_rankings
drop constraint if exists player_rankings_rank_position_check;

alter table public.player_rankings
add constraint player_rankings_rank_position_check
check (rank_position between 1 and 17);

insert into public.players (player_name)
values ('Габриэль Жезус')
on conflict (player_name) do nothing;

update public.match_players as match_player
set player_number = 9,
    position = 'FW'
where match_player.player_name = 'Габриэль Жезус';

insert into public.match_players (match_id, player_id, player_name, player_number, position)
select
  match.id,
  player.id,
  'Габриэль Жезус',
  9,
  'FW'
from public.matches as match
join public.players as player on player.player_name = 'Габриэль Жезус'
where match.kickoff_at >= '2026-07-01T00:00:00.000Z'
  and not exists (
    select 1
    from public.match_players as existing
    where existing.match_id = match.id
      and (existing.player_id = player.id or existing.player_name = 'Габриэль Жезус')
  );

delete from public.match_players as match_player
using public.matches as match
where match_player.match_id = match.id
  and match.status <> 'finished'
  and match_player.player_name = 'Альваро Кортес';

update public.la_masia_players
set is_active = false,
    updated_at = now()
where id = 'alvaro-cortes';
