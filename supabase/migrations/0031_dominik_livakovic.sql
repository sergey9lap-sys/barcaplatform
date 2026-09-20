-- Add Dominik Livakovic to the 2026/27 squad and every match pool.
-- Safe to run repeatedly after 0030.

insert into public.players (player_name, avatar_url)
values ('Доминик Ливакович', '/players/livakovic-2026.png')
on conflict (player_name) do update set
  avatar_url = excluded.avatar_url;

-- Keep the confirmed 2026/27 goalkeeper numbers consistent.
update public.match_players
set player_number = case player_name
  when 'Жоан Гарсия' then 1
  when 'Войцех Щенсны' then 13
  when 'Доминик Ливакович' then 25
  else player_number
end
where player_name in ('Жоан Гарсия', 'Войцех Щенсны', 'Доминик Ливакович');

insert into public.match_players (match_id, player_id, player_name, player_number, position)
select
  match.id,
  player.id,
  'Доминик Ливакович',
  25,
  'GK'
from public.matches as match
join public.players as player on player.player_name = 'Доминик Ливакович'
where match.kickoff_at >= '2026-07-01T00:00:00.000Z'
  and match.kickoff_at < '2027-07-01T00:00:00.000Z'
  and not exists (
    select 1
    from public.match_players as existing
    where existing.match_id = match.id
      and (existing.player_id = player.id or existing.player_name = 'Доминик Ливакович')
  );

insert into public.season_player_stats (player_id, season_label, avatar_url)
select player.id, '2026-27', '/players/livakovic-2026.png'
from public.players as player
where player.player_name = 'Доминик Ливакович'
on conflict (player_id, season_label) do update set
  avatar_url = excluded.avatar_url;
