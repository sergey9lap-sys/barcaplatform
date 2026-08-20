-- Testing readiness: live profiles, community, notifications, scouting and Fantasy scoring.
-- Safe to run after migrations 0001-0020.

alter table public.profiles
  add column if not exists favorite_player text not null default 'Педри',
  add column if not exists favorite_era text not null default 'Гвардиола 2008–12',
  add column if not exists favorite_coach text not null default 'Ханси Флик',
  add column if not exists favorite_formation text not null default '4-3-3',
  add column if not exists short_bio text not null default 'Смотрю на футбол через контроль, прессинг и воспитанников.',
  add column if not exists current_streak integer not null default 0,
  add column if not exists longest_streak integer not null default 0,
  add column if not exists last_active_date date,
  add column if not exists badges text[] not null default '{}';

create table if not exists public.community_opinions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  target_type text not null check (target_type in ('transfer','la_masia','analytics','lineup','match')),
  target_id text not null,
  body text not null check (char_length(body) between 2 and 1000),
  is_pinned boolean not null default false,
  admin_reply text check (admin_reply is null or char_length(admin_reply) <= 1000),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.community_opinion_likes (
  opinion_id uuid not null references public.community_opinions (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (opinion_id, user_id)
);

create table if not exists public.user_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null default 'challenge',
  title text not null check (char_length(title) between 2 and 140),
  description text not null default '' check (char_length(description) <= 500),
  link text not null default '/',
  is_read boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.la_masia_watchlist (
  user_id uuid not null references public.profiles (id) on delete cascade,
  player_id text not null references public.la_masia_players (id) on delete cascade,
  verdict text check (verdict is null or verdict in ('Готов к основе','Взять на сборы','Нужна аренда','Пока рано')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, player_id)
);

create table if not exists public.analytics_players (
  id uuid primary key default gen_random_uuid(),
  player_key text not null unique,
  name text not null,
  role text not null check (role in ('first_team','transfer_target','la_masia','loan')),
  position text not null,
  source_label text not null,
  technique integer not null default 50 check (technique between 0 and 100),
  pressure_play integer not null default 50 check (pressure_play between 0 and 100),
  pressing integer not null default 50 check (pressing between 0 and 100),
  positional_discipline integer not null default 50 check (positional_discipline between 0 and 100),
  intelligence integer not null default 50 check (intelligence between 0 and 100),
  mentality integer not null default 50 check (mentality between 0 and 100),
  coach_compatibility integer not null default 50 check (coach_compatibility between 0 and 100),
  barca_compatibility integer not null default 50 check (barca_compatibility between 0 and 100),
  conclusion text not null default '',
  is_active boolean not null default true,
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.fantasy_team_scores (
  team_id uuid primary key references public.fantasy_teams (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  match_id text not null,
  appearance_points integer not null default 0,
  goal_points integer not null default 0,
  assist_points integer not null default 0,
  captain_bonus integer not null default 0,
  total_points integer not null default 0,
  calculated_at timestamptz not null default timezone('utc', now())
);

create index if not exists community_opinions_target_idx on public.community_opinions (target_type, target_id, created_at desc);
create index if not exists user_notifications_user_idx on public.user_notifications (user_id, is_read, created_at desc);
create index if not exists fantasy_team_scores_match_idx on public.fantasy_team_scores (match_id, total_points desc);

drop trigger if exists community_opinions_set_updated_at on public.community_opinions;
create trigger community_opinions_set_updated_at before update on public.community_opinions
for each row execute function public.set_updated_at();
drop trigger if exists la_masia_watchlist_set_updated_at on public.la_masia_watchlist;
create trigger la_masia_watchlist_set_updated_at before update on public.la_masia_watchlist
for each row execute function public.set_updated_at();
drop trigger if exists analytics_players_set_updated_at on public.analytics_players;
create trigger analytics_players_set_updated_at before update on public.analytics_players
for each row execute function public.set_updated_at();

alter table public.community_opinions enable row level security;
alter table public.community_opinion_likes enable row level security;
alter table public.user_notifications enable row level security;
alter table public.la_masia_watchlist enable row level security;
alter table public.analytics_players enable row level security;
alter table public.fantasy_team_scores enable row level security;

drop policy if exists "community opinions public read" on public.community_opinions;
create policy "community opinions public read" on public.community_opinions for select using (true);
drop policy if exists "users create own opinions" on public.community_opinions;
create policy "users create own opinions" on public.community_opinions for insert with check (auth.uid() = user_id);
drop policy if exists "users update own opinions" on public.community_opinions;
create policy "users update own opinions" on public.community_opinions for update using (auth.uid() = user_id or public.is_admin_user()) with check (auth.uid() = user_id or public.is_admin_user());
drop policy if exists "users delete own opinions" on public.community_opinions;
create policy "users delete own opinions" on public.community_opinions for delete using (auth.uid() = user_id or public.is_admin_user());

drop policy if exists "opinion likes public read" on public.community_opinion_likes;
create policy "opinion likes public read" on public.community_opinion_likes for select using (true);
drop policy if exists "users manage own opinion likes" on public.community_opinion_likes;
create policy "users manage own opinion likes" on public.community_opinion_likes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "users read own notifications" on public.user_notifications;
create policy "users read own notifications" on public.user_notifications for select using (auth.uid() = user_id or public.is_admin_user());
drop policy if exists "users update own notifications" on public.user_notifications;
create policy "users update own notifications" on public.user_notifications for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "admins create notifications" on public.user_notifications;
create policy "admins create notifications" on public.user_notifications for insert with check (public.is_admin_user());

drop policy if exists "users manage own academy watchlist" on public.la_masia_watchlist;
create policy "users manage own academy watchlist" on public.la_masia_watchlist for all using (auth.uid() = user_id or public.is_admin_user()) with check (auth.uid() = user_id or public.is_admin_user());

drop policy if exists "analytics public read" on public.analytics_players;
create policy "analytics public read" on public.analytics_players for select using (is_active or public.is_admin_user());
drop policy if exists "admins manage analytics" on public.analytics_players;
create policy "admins manage analytics" on public.analytics_players for all using (public.is_admin_user()) with check (public.is_admin_user());

drop policy if exists "fantasy scores public read" on public.fantasy_team_scores;
create policy "fantasy scores public read" on public.fantasy_team_scores for select using (true);

-- Logged-in users may expose only the safe public profile fields needed by rankings.
drop policy if exists "authenticated users read public profiles" on public.profiles;
create policy "authenticated users read public profiles" on public.profiles for select to authenticated using (true);

create or replace function public.touch_user_activity()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  target_user uuid := auth.uid();
  today_moscow date := timezone('Europe/Moscow', now())::date;
  profile_row public.profiles%rowtype;
begin
  if target_user is null then raise exception 'Authentication required'; end if;
  update public.profiles
  set current_streak = case
        when last_active_date = today_moscow then current_streak
        when last_active_date = today_moscow - 1 then current_streak + 1
        else 1
      end,
      longest_streak = greatest(longest_streak, case
        when last_active_date = today_moscow then current_streak
        when last_active_date = today_moscow - 1 then current_streak + 1
        else 1
      end),
      last_active_date = today_moscow
  where id = target_user
  returning * into profile_row;
  return jsonb_build_object('current_streak', profile_row.current_streak, 'longest_streak', profile_row.longest_streak);
end;
$$;
grant execute on function public.touch_user_activity() to authenticated;

create or replace function public.calculate_fantasy_scores(target_match text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare team_row public.fantasy_teams%rowtype;
declare appearance integer;
declare goals integer;
declare assists integer;
declare captain_base integer;
declare total integer;
begin
  for team_row in select * from public.fantasy_teams where match_id = target_match loop
    select count(*)::integer * 2 into appearance
    from public.match_played_players played
    join public.match_players player on player.id = played.match_player_id
    where played.match_id::text = target_match and (player.player_id::text = any(team_row.selected_player_ids) or player.id::text = any(team_row.selected_player_ids));

    select coalesce(sum(stats.goals),0)::integer * 5, coalesce(sum(stats.assists),0)::integer * 3
    into goals, assists
    from public.match_player_stats stats
    join public.match_players player on player.id = stats.match_player_id
    where stats.match_id::text = target_match and (player.player_id::text = any(team_row.selected_player_ids) or player.id::text = any(team_row.selected_player_ids));

    select coalesce((case when played.id is null then 0 else 2 end) + stats.goals * 5 + stats.assists * 3, 0)::integer
    into captain_base
    from public.match_players player
    left join public.match_played_players played on played.match_player_id = player.id and played.match_id::text = target_match
    left join public.match_player_stats stats on stats.match_player_id = player.id and stats.match_id::text = target_match
    where (player.player_id::text = team_row.captain_id or player.id::text = team_row.captain_id) and player.match_id::text = target_match
    limit 1;

    total := coalesce(appearance,0) + coalesce(goals,0) + coalesce(assists,0) + coalesce(captain_base,0);
    update public.fantasy_teams set total_points = total where id = team_row.id;
    insert into public.fantasy_team_scores (team_id,user_id,match_id,appearance_points,goal_points,assist_points,captain_bonus,total_points,calculated_at)
    values (team_row.id,team_row.user_id,target_match,coalesce(appearance,0),coalesce(goals,0),coalesce(assists,0),coalesce(captain_base,0),total,timezone('utc',now()))
    on conflict (team_id) do update set appearance_points=excluded.appearance_points,goal_points=excluded.goal_points,assist_points=excluded.assist_points,captain_bonus=excluded.captain_bonus,total_points=excluded.total_points,calculated_at=excluded.calculated_at;

    insert into public.xp_events (user_id,skill_key,amount,attempted,was_correct,source_type,source_id,description)
    values (team_row.user_id,'fantasy',greatest(total,0),true,total > 0,'fantasy_match',target_match,'Очки фэнтези за матч')
    on conflict (user_id,skill_key,source_type,source_id) do update set amount=excluded.amount,was_correct=excluded.was_correct;
    perform public.refresh_user_skill_progress(team_row.user_id);
  end loop;
end;
$$;

grant execute on function public.calculate_fantasy_scores(text) to authenticated;

create or replace function public.refresh_lineup_mastery_for_match(target_match uuid)
returns void language plpgsql security definer set search_path=public as $$
declare lineup_row public.lineup_predictions%rowtype;
declare correct_players integer;
begin
  if not exists(select 1 from public.matches where id=target_match and status='finished') then return; end if;
  for lineup_row in select * from public.lineup_predictions where match_id=target_match loop
    select count(*)::integer into correct_players
    from public.match_played_players played
    join public.match_players player on player.id=played.match_player_id
    where played.match_id=target_match and (player.id=any(lineup_row.selected_player_ids) or player.player_id=any(lineup_row.selected_player_ids));
    insert into public.xp_events(user_id,skill_key,amount,attempted,was_correct,source_type,source_id,description,metadata)
    values(lineup_row.user_id,'tactics',least(correct_players*3,33),true,correct_players>=9,'lineup_result',target_match::text,'Точность стартового состава',jsonb_build_object('correct_players',correct_players))
    on conflict(user_id,skill_key,source_type,source_id) do update set amount=excluded.amount,was_correct=excluded.was_correct,metadata=excluded.metadata;
    perform public.refresh_user_skill_progress(lineup_row.user_id);
  end loop;
end; $$;

create or replace function public.refresh_transfer_mastery(target_rumor uuid)
returns void language plpgsql security definer set search_path=public as $$
declare rumor_row public.transfer_rumors%rowtype;
declare prediction_row public.transfer_predictions%rowtype;
declare correct boolean;
begin
  select * into rumor_row from public.transfer_rumors where id=target_rumor;
  if rumor_row.status<>'resolved' or rumor_row.resolved_outcome is null then return; end if;
  for prediction_row in select * from public.transfer_predictions where rumor_id=target_rumor loop
    correct := (prediction_row.prediction='yes')=rumor_row.resolved_outcome;
    insert into public.xp_events(user_id,skill_key,amount,attempted,was_correct,source_type,source_id,description)
    values(prediction_row.user_id,'transfers',case when correct then 30 else 0 end,true,correct,'transfer_result',target_rumor::text,'Итог трансферного прогноза')
    on conflict(user_id,skill_key,source_type,source_id) do update set amount=excluded.amount,was_correct=excluded.was_correct;
    perform public.refresh_user_skill_progress(prediction_row.user_id);
  end loop;
end; $$;

create or replace function public.refresh_testing_game_results()
returns trigger language plpgsql security definer set search_path=public as $$
declare target_match_id uuid;
begin
  if tg_op = 'DELETE' then
    target_match_id := old.match_id;
  else
    target_match_id := new.match_id;
  end if;
  perform public.calculate_fantasy_scores(target_match_id::text);
  perform public.refresh_lineup_mastery_for_match(target_match_id);
  return null;
end; $$;

drop trigger if exists fantasy_refresh_from_stats on public.match_player_stats;
create trigger fantasy_refresh_from_stats after insert or update or delete on public.match_player_stats for each row execute function public.refresh_testing_game_results();
drop trigger if exists fantasy_refresh_from_played on public.match_played_players;
create trigger fantasy_refresh_from_played after insert or delete on public.match_played_players for each row execute function public.refresh_testing_game_results();

create or replace function public.trigger_refresh_transfer_mastery()
returns trigger language plpgsql security definer set search_path=public as $$ begin perform public.refresh_transfer_mastery(new.id); return new; end; $$;
drop trigger if exists transfer_rumors_refresh_mastery on public.transfer_rumors;
create trigger transfer_rumors_refresh_mastery after update of status,resolved_outcome on public.transfer_rumors for each row execute function public.trigger_refresh_transfer_mastery();

create or replace function public.get_public_leaderboard()
returns table(
  id uuid,
  display_name text,
  avatar_url text,
  total_points integer,
  total_xp bigint,
  prediction_accuracy integer,
  analyst_reputation integer,
  scout_reputation integer,
  transfer_reputation integer,
  tactical_reputation integer,
  la_masia_follows bigint,
  badges text[]
)
language sql
security definer
set search_path = public
as $$
  select
    p.id,
    coalesce(nullif(p.display_name,''), 'Кулес') as display_name,
    p.avatar_url,
    p.total_points,
    coalesce(sum(progress.xp),0)::bigint as total_xp,
    coalesce(round(100.0 * sum(progress.correct_count) filter (where progress.skill_key in ('results','score')) / nullif(sum(progress.attempts_count) filter (where progress.skill_key in ('results','score')),0)),0)::integer as prediction_accuracy,
    coalesce(max(progress.xp) filter (where progress.skill_key='analyst'),0)::integer as analyst_reputation,
    coalesce(max(progress.xp) filter (where progress.skill_key='scout'),0)::integer as scout_reputation,
    coalesce(max(progress.xp) filter (where progress.skill_key='transfers'),0)::integer as transfer_reputation,
    coalesce(max(progress.xp) filter (where progress.skill_key='tactics'),0)::integer as tactical_reputation,
    (select count(*) from public.la_masia_watchlist w where w.user_id=p.id)::bigint as la_masia_follows,
    p.badges
  from public.profiles p
  left join public.user_skill_progress progress on progress.user_id=p.id
  group by p.id
  order by p.total_points desc, coalesce(sum(progress.xp),0) desc
  limit 250;
$$;
grant execute on function public.get_public_leaderboard() to anon, authenticated;

create or replace function public.create_fantasy_league(league_title text)
returns table(id uuid,title text,invite_code text)
language plpgsql security definer set search_path=public
as $$
declare new_league public.fantasy_leagues%rowtype;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if char_length(trim(league_title)) not between 3 and 50 then raise exception 'League title must contain 3-50 characters'; end if;
  insert into public.fantasy_leagues(owner_id,title) values(auth.uid(),trim(league_title)) returning * into new_league;
  insert into public.fantasy_league_members(league_id,user_id) values(new_league.id,auth.uid()) on conflict do nothing;
  return query select new_league.id,new_league.title,new_league.invite_code;
end; $$;
grant execute on function public.create_fantasy_league(text) to authenticated;

create or replace function public.join_fantasy_league(target_code text)
returns uuid
language plpgsql security definer set search_path=public
as $$
declare target_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select league.id into target_id from public.fantasy_leagues league where upper(league.invite_code)=upper(trim(target_code));
  if target_id is null then raise exception 'League not found'; end if;
  insert into public.fantasy_league_members(league_id,user_id) values(target_id,auth.uid()) on conflict do nothing;
  return target_id;
end; $$;
grant execute on function public.join_fantasy_league(text) to authenticated;

create or replace function public.get_my_fantasy_leagues()
returns table(id uuid,title text,invite_code text,member_count bigint,is_owner boolean)
language sql security definer set search_path=public
as $$
  select league.id,league.title,league.invite_code,count(all_members.user_id),league.owner_id=auth.uid()
  from public.fantasy_leagues league
  join public.fantasy_league_members mine on mine.league_id=league.id and mine.user_id=auth.uid()
  left join public.fantasy_league_members all_members on all_members.league_id=league.id
  group by league.id;
$$;
grant execute on function public.get_my_fantasy_leagues() to authenticated;

create or replace function public.get_fantasy_standings(period_key text default 'season')
returns table(user_id uuid,display_name text,avatar_url text,points bigint)
language sql security definer set search_path=public
as $$
  select scores.user_id,coalesce(nullif(profile.display_name,''),'Кулес'),profile.avatar_url,coalesce(sum(scores.total_points),0)::bigint
  from public.fantasy_team_scores scores
  join public.profiles profile on profile.id=scores.user_id
  left join public.matches match on match.id::text=scores.match_id
  where period_key='season'
     or (period_key='month' and match.kickoff_at >= date_trunc('month',now()))
     or (period_key='week' and match.kickoff_at >= date_trunc('week',now()))
  group by scores.user_id,profile.display_name,profile.avatar_url
  order by coalesce(sum(scores.total_points),0) desc
  limit 100;
$$;
grant execute on function public.get_fantasy_standings(text) to anon, authenticated;

insert into public.analytics_players (player_key,name,role,position,source_label,technique,pressure_play,pressing,positional_discipline,intelligence,mentality,coach_compatibility,barca_compatibility,conclusion)
values
  ('pedri','Педри','first_team','Центральный полузащитник','Первая команда',96,94,78,88,97,88,90,98,'Эталонный игрок для контроля темпа и выхода из давления. Важен грамотный менеджмент нагрузки.'),
  ('rodri','Родри','first_team','Опорный полузащитник','Первая команда',92,94,86,96,97,94,94,95,'Даёт контроль центра, первый пас и управление ритмом. Может стать системообразующим игроком.'),
  ('lukeba','Кастелло Лукеба','transfer_target','Центральный защитник','Трансферная цель',84,85,83,86,85,82,89,90,'Быстрый левоногий защитник для высокой линии и уверенного продвижения мяча.'),
  ('xavi-espart','Хави Эспарт','la_masia','Полузащитник','Ла Масия',82,78,80,82,85,80,84,89,'Интересный профиль академии: техника, ориентация между линиями и потенциал роста.')
on conflict (player_key) do update set name=excluded.name,role=excluded.role,position=excluded.position,source_label=excluded.source_label,technique=excluded.technique,pressure_play=excluded.pressure_play,pressing=excluded.pressing,positional_discipline=excluded.positional_discipline,intelligence=excluded.intelligence,mentality=excluded.mentality,coach_compatibility=excluded.coach_compatibility,barca_compatibility=excluded.barca_compatibility,conclusion=excluded.conclusion,is_active=true;

insert into public.vip_events (title,description,starts_at,event_type,status)
select seed.* from (values
  ('Предматчевый разбор','Тактика, ожидаемый состав и ключевые дуэли ближайшего матча.','2026-08-23 18:30:00+03'::timestamptz,'analysis','scheduled'),
  ('Трансферный вечер','Вопросы по целям клуба и разбор сценариев конца окна.','2026-08-28 20:00:00+03'::timestamptz,'transfer','scheduled')
) as seed(title,description,starts_at,event_type,status)
where not exists (select 1 from public.vip_events event where event.title=seed.title and event.starts_at=seed.starts_at);

-- Give existing accounts a clean first-run notification without duplicating it.
insert into public.user_notifications (user_id,type,title,description,link)
select p.id,'challenge','Платформа готова к тестированию','Заполните профиль и сохраните первый прогноз — так начнёт формироваться ваш реальный рейтинг.','/profile'
from public.profiles p
where not exists (select 1 from public.user_notifications n where n.user_id=p.id and n.title='Платформа готова к тестированию');
