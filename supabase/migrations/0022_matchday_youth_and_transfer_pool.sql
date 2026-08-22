-- Matchday roster expansion and current transfer scenarios.
-- Safe to run repeatedly after migrations 0001-0021.

alter table public.transfer_rumors
  add column if not exists position text,
  add column if not exists age integer,
  add column if not exists estimated_price text,
  add column if not exists salary_risk text,
  add column if not exists barca_fit_score integer,
  add column if not exists coach_system_fit_score integer,
  add column if not exists risk_level text,
  add column if not exists decision text,
  add column if not exists short_reason text,
  add column if not exists community_votes integer;

insert into public.players (player_name, avatar_url) values
  ('Хави Эспарт', '/players/xavi-espart-official-2026.jpg'),
  ('Альваро Кортес', '/la-masia/alvaro-cortes.jpg'),
  ('Жорди Пескер', '/la-masia/jordi-pesquer.jpg'),
  ('Эбрима Тункара', '/la-masia/ebrima-tunkara.jpg'),
  ('Ориан Горен', '/la-masia/orian-goren.jpg'),
  ('Брайан Фариньяс', '/la-masia/brian-farinas.jpg'),
  ('Алекс Гонсалес', '/la-masia/alex-gonzalez.jpg'),
  ('Икер Родригес', '/la-masia/iker-rodriguez.jpg'),
  ('Хамза Абделькарим', '/la-masia/hamza-abdelkarim.jpg')
on conflict (player_name) do update set avatar_url = excluded.avatar_url;

insert into public.match_players (match_id, player_id, player_name, player_number, position)
select
  matches.id,
  players.id,
  youth.player_name,
  null,
  youth.position
from public.matches matches
cross join (values
  ('Хави Эспарт', 'DF'),
  ('Альваро Кортес', 'DF'),
  ('Жорди Пескер', 'DF'),
  ('Эбрима Тункара', 'MF'),
  ('Ориан Горен', 'MF'),
  ('Брайан Фариньяс', 'MF'),
  ('Алекс Гонсалес', 'FW'),
  ('Икер Родригес', 'GK'),
  ('Хамза Абделькарим', 'FW')
) as youth(player_name, position)
join public.players players on players.player_name = youth.player_name
where matches.status = 'upcoming'
  and not exists (
    select 1
    from public.match_players existing
    where existing.match_id = matches.id
      and (existing.player_id = players.id or existing.player_name = youth.player_name)
  );

with scenarios(player_name, current_club, direction, position, probability_score, usefulness_score, barca_fit_score, coach_system_fit_score, risk_level, decision, short_reason) as (values
  ('Гонсалу Инасиу', 'Спортинг', 'incoming', 'Центральный защитник', 6, 9, 92, 91, 'medium', 'buy', 'Левоногий центральный защитник с качественным первым пасом и опытом игры в высокой линии.'),
  ('Хорхе Салинас', 'Расинг Сантандер', 'incoming', 'Левый защитник', 6, 8, 88, 89, 'medium', 'monitor', 'Молодой левоногий защитник с потенциалом и интенсивностью для модели Барсы.'),
  ('Давид Раум', 'РБ Лейпциг', 'incoming', 'Левый защитник', 5, 8, 85, 88, 'medium', 'monitor', 'Готовый атакующий латераль с объёмом, подачей и опытом интенсивного футбола.'),
  ('Эктор Форт', 'Барселона', 'outgoing', 'Правый защитник', 7, 6, 76, 70, 'low', 'monitor', 'Возможный уход ради стабильного игрового времени и следующего шага развития.'),
  ('Алехандро Бальде', 'Барселона', 'outgoing', 'Левый защитник', 5, 4, 87, 84, 'medium', 'monitor', 'Продажа рассматривается только при сильном предложении и наличии готовой замены.'),
  ('Марк Касадо', 'Барселона', 'outgoing', 'Опорный полузащитник', 7, 5, 82, 79, 'medium', 'sell', 'Уход может дать игроку стабильную роль, а клубу — пространство в составе.'),
  ('Френки де Йонг', 'Барселона', 'outgoing', 'Центральный полузащитник', 5, 4, 90, 86, 'high', 'monitor', 'Сценарий зависит от предложения, зарплатной структуры и баланса новой полузащиты.'),
  ('Жюль Кунде', 'Барселона', 'outgoing', 'Правый / центральный защитник', 4, 3, 91, 90, 'high', 'keep', 'Продажа возможна только за исключительную сумму: игрок важен для нескольких ролей в обороне.')
)
update public.transfer_rumors rumor
set current_club = scenarios.current_club,
    target_club = case when scenarios.direction = 'incoming' then 'Барселона' else 'Клуб уточняется' end,
    window_label = 'Лето 2026',
    status = 'active',
    resolved_outcome = null,
    direction = scenarios.direction,
    position = scenarios.position,
    probability_score = scenarios.probability_score,
    usefulness_score = scenarios.usefulness_score,
    recommendation = scenarios.usefulness_score >= 7,
    barca_fit_score = scenarios.barca_fit_score,
    coach_system_fit_score = scenarios.coach_system_fit_score,
    risk_level = scenarios.risk_level,
    salary_risk = scenarios.risk_level,
    decision = scenarios.decision,
    short_reason = scenarios.short_reason,
    notes = 'Очки за прогноз будут начислены после официального решения.'
from scenarios
where rumor.player_name = scenarios.player_name
  and rumor.direction = scenarios.direction;

with scenarios(player_name, current_club, direction, position, probability_score, usefulness_score, barca_fit_score, coach_system_fit_score, risk_level, decision, short_reason) as (values
  ('Гонсалу Инасиу', 'Спортинг', 'incoming', 'Центральный защитник', 6, 9, 92, 91, 'medium', 'buy', 'Левоногий центральный защитник с качественным первым пасом и опытом игры в высокой линии.'),
  ('Хорхе Салинас', 'Расинг Сантандер', 'incoming', 'Левый защитник', 6, 8, 88, 89, 'medium', 'monitor', 'Молодой левоногий защитник с потенциалом и интенсивностью для модели Барсы.'),
  ('Давид Раум', 'РБ Лейпциг', 'incoming', 'Левый защитник', 5, 8, 85, 88, 'medium', 'monitor', 'Готовый атакующий латераль с объёмом, подачей и опытом интенсивного футбола.'),
  ('Эктор Форт', 'Барселона', 'outgoing', 'Правый защитник', 7, 6, 76, 70, 'low', 'monitor', 'Возможный уход ради стабильного игрового времени и следующего шага развития.'),
  ('Алехандро Бальде', 'Барселона', 'outgoing', 'Левый защитник', 5, 4, 87, 84, 'medium', 'monitor', 'Продажа рассматривается только при сильном предложении и наличии готовой замены.'),
  ('Марк Касадо', 'Барселона', 'outgoing', 'Опорный полузащитник', 7, 5, 82, 79, 'medium', 'sell', 'Уход может дать игроку стабильную роль, а клубу — пространство в составе.'),
  ('Френки де Йонг', 'Барселона', 'outgoing', 'Центральный полузащитник', 5, 4, 90, 86, 'high', 'monitor', 'Сценарий зависит от предложения, зарплатной структуры и баланса новой полузащиты.'),
  ('Жюль Кунде', 'Барселона', 'outgoing', 'Правый / центральный защитник', 4, 3, 91, 90, 'high', 'keep', 'Продажа возможна только за исключительную сумму: игрок важен для нескольких ролей в обороне.')
)
insert into public.transfer_rumors (
  player_name, current_club, target_club, window_label, status, resolved_outcome,
  direction, position, probability_score, usefulness_score, recommendation,
  barca_fit_score, coach_system_fit_score, risk_level, salary_risk, decision,
  short_reason, notes, community_votes
)
select
  scenarios.player_name,
  scenarios.current_club,
  case when scenarios.direction = 'incoming' then 'Барселона' else 'Клуб уточняется' end,
  'Лето 2026', 'active', null, scenarios.direction, scenarios.position,
  scenarios.probability_score, scenarios.usefulness_score, scenarios.usefulness_score >= 7,
  scenarios.barca_fit_score, scenarios.coach_system_fit_score, scenarios.risk_level,
  scenarios.risk_level, scenarios.decision, scenarios.short_reason,
  'Очки за прогноз будут начислены после официального решения.', 0
from scenarios
where not exists (
  select 1 from public.transfer_rumors existing
  where existing.player_name = scenarios.player_name
    and existing.direction = scenarios.direction
);
