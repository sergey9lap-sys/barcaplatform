-- Точечное исправление значений, введённых до появления подписей колонок.
-- Голы не меняются.

update public.match_player_stats as stats
set assists = 1,
    pre_assists = 1,
    goal_influences = 0
from public.match_players as player
where stats.match_id = '26000000-0000-4000-8000-000000000003'::uuid
  and stats.match_player_id = player.id
  and player.player_name = 'Хави Эспарт';

update public.match_player_stats as stats
set pre_assists = 2,
    goal_influences = 0
from public.match_players as player
where stats.match_id = '26000000-0000-4000-8000-000000000001'::uuid
  and stats.match_player_id = player.id
  and player.player_name = 'Педри';

update public.match_player_stats as stats
set pre_assists = 1,
    goal_influences = 0
from public.match_players as player
where stats.match_id = '26000000-0000-4000-8000-000000000003'::uuid
  and stats.match_player_id = player.id
  and player.player_name = 'Педри';

update public.match_player_stats as stats
set pre_assists = 0,
    goal_influences = 1
from public.match_players as player
where stats.match_id = '26000000-0000-4000-8000-000000000003'::uuid
  and stats.match_player_id = player.id
  and player.player_name = 'Марк Берналь';

-- Пересчитываем сезон 2026/27 из исправленных матчевых записей.
with aggregated as (
  select
    player.player_id,
    sum(stats.goals)::integer as goals,
    sum(stats.assists)::integer as assists,
    sum(stats.pre_assists)::integer as pre_assists,
    sum(stats.goal_influences)::integer as goal_influences
  from public.match_player_stats as stats
  join public.match_players as player on player.id = stats.match_player_id
  join public.matches as match on match.id = stats.match_id
  where player.player_id is not null
    and match.kickoff_at >= '2026-07-01T00:00:00Z'::timestamptz
    and match.kickoff_at < '2027-07-01T00:00:00Z'::timestamptz
  group by player.player_id
)
update public.season_player_stats as season
set goals = aggregated.goals,
    assists = aggregated.assists,
    pre_assists = aggregated.pre_assists,
    goal_influences = aggregated.goal_influences
from aggregated
where season.player_id = aggregated.player_id
  and season.season_label = '2026-27';
