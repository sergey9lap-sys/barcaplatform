create table if not exists public.la_masia_players (
  id text primary key,
  name text not null,
  age integer not null check (age between 14 and 23),
  position text not null,
  image_url text,
  team_level text not null check (team_level in ('La Masia', 'Barca Atletic', 'U19')),
  potential_score integer not null default 50 check (potential_score between 0 and 100),
  first_team_chance integer not null default 50 check (first_team_chance between 0 and 100),
  coach_system_fit_score integer not null default 50 check (coach_system_fit_score between 0 and 100),
  barca_fit_score integer not null default 50 check (barca_fit_score between 0 and 100),
  status text not null default 'watch' check (status in ('watch', 'preseason', 'loan_candidate', 'first_team_candidate')),
  short_description text not null,
  priority integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists la_masia_players_active_priority_idx
  on public.la_masia_players (is_active, priority desc, potential_score desc);

drop trigger if exists set_la_masia_players_updated_at on public.la_masia_players;
create trigger set_la_masia_players_updated_at
before update on public.la_masia_players
for each row execute function public.set_updated_at();

alter table public.la_masia_players enable row level security;

drop policy if exists "La Masia players are public" on public.la_masia_players;
create policy "La Masia players are public"
on public.la_masia_players for select
using (is_active or public.is_admin_user());

drop policy if exists "Admins manage La Masia players" on public.la_masia_players;
create policy "Admins manage La Masia players"
on public.la_masia_players for all
using (public.is_admin_user())
with check (public.is_admin_user());

insert into public.la_masia_players (
  id, name, age, position, image_url, team_level, potential_score,
  first_team_chance, coach_system_fit_score, barca_fit_score,
  status, short_description, priority, is_active
) values
  ('xavi-espart', 'Хави Эспарт', 19, 'Правый защитник / опорник', '/la-masia/xavi-espart.png', 'Barca Atletic', 91, 86, 92, 94, 'first_team_candidate', 'Гибридный профиль для правого фланга и центра: умно занимает пространство, спокойно работает с мячом и уже выдерживает темп первой команды.', 100, true),
  ('alvaro-cortes', 'Альваро Кортес', 21, 'Центральный защитник', '/la-masia/alvaro-cortes.jpg', 'Barca Atletic', 84, 79, 86, 88, 'first_team_candidate', 'Левоногий центральный защитник с хорошим первым пасом, игрой на опережение и физикой для взрослого футбола.', 90, true),
  ('jordi-pesquer', 'Жорди Пескер', 17, 'Левый защитник', '/la-masia/jordi-pesquer.jpg', 'U19', 90, 72, 87, 91, 'preseason', 'Атакующий левый защитник ростом 183 см: даёт ширину, уверенно продвигает мяч и уже привлекался к тренировкам команды Флика.', 89, true),
  ('brian-farinas', 'Брайан Фариньяс', 20, 'Центральный полузащитник', '/la-masia/brian-farinas.jpg', 'Barca Atletic', 86, 76, 89, 92, 'preseason', 'Универсальный полузащитник с большим объёмом работы, культурой паса и привычкой управлять темпом матча.', 88, true),
  ('alex-gonzalez', 'Алекс Гонсалес', 18, 'Левый вингер / нападающий', '/la-masia/alex-gonzalez.jpg', 'Barca Atletic', 87, 68, 84, 86, 'preseason', 'Вертикальный атакующий игрок, способный начинать широко и заходить в штрафную. Один из самых результативных выпускников Juvenil A.', 84, true),
  ('ebrima-tunkara', 'Эбрима Тункара', 16, 'Атакующий полузащитник / вингер', '/la-masia/ebrima-tunkara.jpg', 'U19', 95, 67, 90, 96, 'preseason', 'Левша с редким сочетанием техники, ускорения и физической мощи. Может играть между линиями или атаковать с правого фланга.', 98, true),
  ('orian-goren', 'Ориан Горен', 17, 'Центральный / атакующий полузащитник', '/la-masia/orian-goren.jpg', 'U19', 91, 62, 88, 95, 'watch', 'Технический полузащитник с видением поля и чувством комбинации. Особенно опасен между линиями и при поздних подключениях.', 92, true),
  ('iker-rodriguez', 'Икер Родригес', 18, 'Вратарь', '/la-masia/iker-rodriguez.jpg', 'Barca Atletic', 88, 64, 85, 89, 'preseason', 'Высокий современный вратарь: уверенно начинает атаки ногами, хорошо читает глубину и уже работает в динамике первой команды.', 82, true),
  ('hamza-abdelkarim', 'Хамза Абделькарим', 18, 'Центральный нападающий', '/la-masia/hamza-abdelkarim.jpg', 'Barca Atletic', 92, 74, 86, 88, 'preseason', 'Мобильная девятка, которая связывает атаки и чувствует момент для рывка в штрафную. Сильный кандидат на быстрый переход во взрослый футбол.', 94, true)
on conflict (id) do update set
  name = excluded.name,
  age = excluded.age,
  position = excluded.position,
  image_url = excluded.image_url,
  team_level = excluded.team_level,
  potential_score = excluded.potential_score,
  first_team_chance = excluded.first_team_chance,
  coach_system_fit_score = excluded.coach_system_fit_score,
  barca_fit_score = excluded.barca_fit_score,
  status = excluded.status,
  short_description = excluded.short_description,
  priority = excluded.priority,
  is_active = excluded.is_active,
  updated_at = now();
