-- Confirmed FC Barcelona fixtures published by the club for 2026/27.
-- Kick-off timestamps are stored in UTC. Safe to run repeatedly after 0029.

insert into public.matches as current_match
  (id, home_team, away_team, competition, venue, kickoff_at, home_score, away_score, status)
values
  ('26000000-0000-4000-8000-000000000005', 'Барселона', 'Фейеноорд', 'Лига чемпионов', 'Камп Ноу', '2026-09-09T16:45:00.000Z', null, null, 'upcoming'),
  ('26000000-0000-4000-8000-000000000006', 'Леванте', 'Барселона', 'Ла Лига', 'Сьюдад де Валенсия', '2026-09-13T14:15:00.000Z', null, null, 'upcoming'),
  ('26000000-0000-4000-8000-000000000007', 'Барселона', 'Расинг Сантандер', 'Ла Лига', 'Камп Ноу', '2026-09-16T19:30:00.000Z', null, null, 'upcoming'),
  ('26000000-0000-4000-8000-000000000008', 'Севилья', 'Барселона', 'Ла Лига', 'Рамон Санчес Писхуан', '2026-09-19T19:00:00.000Z', null, null, 'upcoming'),
  ('26000000-0000-4000-8000-000000000009', 'Галатасарай', 'Барселона', 'Лига чемпионов', 'RAMS Парк', '2026-10-13T19:00:00.000Z', null, null, 'upcoming'),
  ('26000000-0000-4000-8000-000000000010', 'Пари Сен-Жермен', 'Барселона', 'Лига чемпионов', 'Парк де Пренс', '2026-10-20T19:00:00.000Z', null, null, 'upcoming'),
  ('26000000-0000-4000-8000-000000000011', 'Барселона', 'Астон Вилла', 'Лига чемпионов', 'Камп Ноу', '2026-11-03T20:00:00.000Z', null, null, 'upcoming'),
  ('26000000-0000-4000-8000-000000000012', 'Сабах', 'Барселона', 'Лига чемпионов', 'Бакинский олимпийский стадион', '2026-11-25T17:45:00.000Z', null, null, 'upcoming'),
  ('26000000-0000-4000-8000-000000000013', 'Барселона', 'Манчестер Сити', 'Лига чемпионов', 'Камп Ноу', '2026-12-08T20:00:00.000Z', null, null, 'upcoming'),
  ('26000000-0000-4000-8000-000000000014', 'Спортинг', 'Барселона', 'Лига чемпионов', 'Жозе Алваладе', '2027-01-20T20:00:00.000Z', null, null, 'upcoming'),
  ('26000000-0000-4000-8000-000000000015', 'Барселона', 'Комо', 'Лига чемпионов', 'Камп Ноу', '2027-01-27T20:00:00.000Z', null, null, 'upcoming')
on conflict (id) do update set
  home_team = excluded.home_team,
  away_team = excluded.away_team,
  competition = excluded.competition,
  venue = excluded.venue,
  kickoff_at = excluded.kickoff_at,
  status = case when current_match.status = 'finished' then current_match.status else excluded.status end;

insert into public.match_players (match_id, player_id, player_name, player_number, position)
select
  match.id,
  player.id,
  roster.player_name,
  roster.player_number,
  roster.position
from public.matches as match
cross join (values
  ('Жоан Гарсия', 13, 'GK'), ('Войцех Щенсны', 25, 'GK'), ('Икер Родригес', null, 'GK'),
  ('Алехандро Бальде', 3, 'DF'), ('Пау Кубарси', 5, 'DF'), ('Андреас Кристенсен', 15, 'DF'),
  ('Жерар Мартин', 18, 'DF'), ('Жюль Кунде', 23, 'DF'), ('Эрик Гарсия', 24, 'DF'),
  ('Жоау Канселу', 2, 'DF'), ('Хави Эспарт', 12, 'DF'), ('Жорди Пескер', 33, 'DF'),
  ('Гави', 6, 'MF'), ('Педри', 8, 'MF'), ('Фермин Лопес', 7, 'MF'),
  ('Дани Ольмо', 20, 'MF'), ('Френки де Йонг', 21, 'MF'), ('Марк Берналь', 22, 'MF'),
  ('Родри', 16, 'MF'), ('Эбрима Тункара', null, 'MF'), ('Ориан Горен', null, 'MF'),
  ('Брайан Фариньяс', 28, 'MF'), ('Ламин Ямаль', 10, 'FW'), ('Рафинья', 11, 'FW'),
  ('Энтони Гордон', 17, 'FW'), ('Карим Адейеми', 14, 'FW'), ('Джесси Бисиву', 27, 'FW'),
  ('Алекс Гонсалес', null, 'FW'), ('Хамза Абделькарим', 29, 'FW'), ('Габриэль Жезус', 9, 'FW')
) as roster(player_name, player_number, position)
join public.players as player on player.player_name = roster.player_name
where match.id in (
  '26000000-0000-4000-8000-000000000005',
  '26000000-0000-4000-8000-000000000006',
  '26000000-0000-4000-8000-000000000007',
  '26000000-0000-4000-8000-000000000008',
  '26000000-0000-4000-8000-000000000009',
  '26000000-0000-4000-8000-000000000010',
  '26000000-0000-4000-8000-000000000011',
  '26000000-0000-4000-8000-000000000012',
  '26000000-0000-4000-8000-000000000013',
  '26000000-0000-4000-8000-000000000014',
  '26000000-0000-4000-8000-000000000015'
)
and not exists (
  select 1
  from public.match_players as existing
  where existing.match_id = match.id
    and (existing.player_id = player.id or existing.player_name = roster.player_name)
);
