-- Stable UUID match records for predictions and lineups.
-- Safe to run repeatedly after migrations 0001-0022.

insert into public.matches (id, home_team, away_team, competition, venue, kickoff_at, home_score, away_score, status)
values
  ('26000000-0000-4000-8000-000000000001', 'Эльче', 'Барселона', 'Ла Лига', 'Мануэль Мартинес Валеро', '2026-08-23T19:30:00.000Z', null, null, 'upcoming'),
  ('26000000-0000-4000-8000-000000000002', 'Барселона', 'Атлетик Бильбао', 'Ла Лига', 'Камп Ноу', '2026-08-27T19:00:00.000Z', null, null, 'upcoming'),
  ('26000000-0000-4000-8000-000000000003', 'Барселона', 'Райо Вальекано', 'Ла Лига', 'Камп Ноу', '2026-08-31T19:30:00.000Z', null, null, 'upcoming'),
  ('26000000-0000-4000-8000-000000000004', 'Валенсия', 'Барселона', 'Ла Лига', 'Месталья', '2026-09-06T14:15:00.000Z', null, null, 'upcoming')
on conflict (id) do update set
  home_team = excluded.home_team,
  away_team = excluded.away_team,
  competition = excluded.competition,
  venue = excluded.venue,
  kickoff_at = excluded.kickoff_at,
  status = excluded.status;

insert into public.players (player_name)
select roster.player_name
from (values
  ('Жоан Гарсия'), ('Войцех Щенсны'), ('Алехандро Бальде'), ('Пау Кубарси'),
  ('Андреас Кристенсен'), ('Жерар Мартин'), ('Жюль Кунде'), ('Эрик Гарсия'),
  ('Жоау Канселу'), ('Гави'), ('Педри'), ('Фермин Лопес'), ('Дани Ольмо'),
  ('Френки де Йонг'), ('Марк Берналь'), ('Родри'), ('Ламин Ямаль'), ('Рафинья'),
  ('Энтони Гордон'), ('Карим Адейеми'), ('Джесси Бисиву'), ('Хави Эспарт'),
  ('Альваро Кортес'), ('Жорди Пескер'), ('Эбрима Тункара'), ('Ориан Горен'),
  ('Брайан Фариньяс'), ('Алекс Гонсалес'), ('Икер Родригес'), ('Хамза Абделькарим')
) as roster(player_name)
on conflict (player_name) do nothing;

insert into public.match_players (match_id, player_id, player_name, player_number, position)
select
  matches.id,
  players.id,
  roster.player_name,
  roster.player_number,
  roster.position
from public.matches matches
cross join (values
  ('Жоан Гарсия', 13, 'GK'), ('Войцех Щенсны', 25, 'GK'), ('Икер Родригес', null, 'GK'),
  ('Алехандро Бальде', 3, 'DF'), ('Пау Кубарси', 5, 'DF'), ('Андреас Кристенсен', 15, 'DF'),
  ('Жерар Мартин', 18, 'DF'), ('Жюль Кунде', 23, 'DF'), ('Эрик Гарсия', 24, 'DF'),
  ('Жоау Канселу', 2, 'DF'), ('Хави Эспарт', null, 'DF'), ('Альваро Кортес', null, 'DF'),
  ('Жорди Пескер', null, 'DF'), ('Гави', 6, 'MF'), ('Педри', 8, 'MF'),
  ('Фермин Лопес', 16, 'MF'), ('Дани Ольмо', 20, 'MF'), ('Френки де Йонг', 21, 'MF'),
  ('Марк Берналь', 22, 'MF'), ('Родри', null, 'MF'), ('Эбрима Тункара', null, 'MF'),
  ('Ориан Горен', null, 'MF'), ('Брайан Фариньяс', null, 'MF'), ('Ламин Ямаль', 10, 'FW'),
  ('Рафинья', 11, 'FW'), ('Энтони Гордон', null, 'FW'), ('Карим Адейеми', null, 'FW'),
  ('Джесси Бисиву', null, 'FW'), ('Алекс Гонсалес', null, 'FW'), ('Хамза Абделькарим', null, 'FW')
) as roster(player_name, player_number, position)
join public.players players on players.player_name = roster.player_name
where matches.id in (
  '26000000-0000-4000-8000-000000000001',
  '26000000-0000-4000-8000-000000000002',
  '26000000-0000-4000-8000-000000000003',
  '26000000-0000-4000-8000-000000000004'
)
and not exists (
  select 1 from public.match_players existing
  where existing.match_id = matches.id
    and (existing.player_id = players.id or existing.player_name = roster.player_name)
);
