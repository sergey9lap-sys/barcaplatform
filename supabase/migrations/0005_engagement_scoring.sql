alter table public.duels
add column if not exists winner_id uuid references public.profiles (id) on delete set null,
add column if not exists bonus_awarded integer not null default 0;

create table if not exists public.player_ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  match_id uuid not null references public.matches (id) on delete cascade,
  match_player_id uuid not null references public.match_players (id) on delete cascade,
  rating integer not null check (rating between 1 and 10),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, match_player_id)
);

create or replace function public.recalculate_profile_total_points_for_user(target_user uuid)
returns void
language plpgsql
as $$
begin
  if target_user is null then
    return;
  end if;

  update public.profiles
  set total_points =
    coalesce((
      select sum(points_awarded)
      from public.predictions
      where user_id = target_user
    ), 0) +
    coalesce((
      select sum(points_awarded)
      from public.transfer_predictions
      where user_id = target_user
    ), 0) +
    coalesce((
      select sum(bonus_awarded)
      from public.duels
      where winner_id = target_user
    ), 0)
  where id = target_user;
end;
$$;

create or replace function public.refresh_profile_total_points()
returns trigger
language plpgsql
as $$
begin
  perform public.recalculate_profile_total_points_for_user(coalesce(new.user_id, old.user_id));
  return coalesce(new, old);
end;
$$;

create or replace function public.refresh_duel_profile_total_points()
returns trigger
language plpgsql
as $$
begin
  perform public.recalculate_profile_total_points_for_user(coalesce(new.challenger_id, old.challenger_id));
  perform public.recalculate_profile_total_points_for_user(coalesce(new.opponent_id, old.opponent_id));
  perform public.recalculate_profile_total_points_for_user(coalesce(new.winner_id, old.winner_id));
  return coalesce(new, old);
end;
$$;

create or replace function public.refresh_transfer_prediction_points_for_rumor(target_rumor uuid)
returns void
language plpgsql
as $$
declare
  resolved boolean;
  outcome boolean;
  total_predictions integer;
  correct_predictions integer;
begin
  select status = 'resolved', resolved_outcome
  into resolved, outcome
  from public.transfer_rumors
  where id = target_rumor;

  if not coalesce(resolved, false) or outcome is null then
    update public.transfer_predictions
    set points_awarded = 0
    where rumor_id = target_rumor;
  else
    select count(*)
    into total_predictions
    from public.transfer_predictions
    where rumor_id = target_rumor;

    select count(*)
    into correct_predictions
    from public.transfer_predictions
    where rumor_id = target_rumor
      and ((prediction = 'yes') = outcome);

    update public.transfer_predictions
    set points_awarded = case
      when ((prediction = 'yes') = outcome) then
        10 + case
          when total_predictions >= 3 and correct_predictions > 0 and (correct_predictions::numeric / total_predictions::numeric) <= 0.35
            then 20
          else 0
        end
      else 0
    end
    where rumor_id = target_rumor;
  end if;

  perform public.recalculate_profile_total_points_for_user(user_id)
  from (
    select distinct user_id
    from public.transfer_predictions
    where rumor_id = target_rumor
  ) affected_users;
end;
$$;

create or replace function public.refresh_transfer_prediction_points_from_prediction()
returns trigger
language plpgsql
as $$
begin
  perform public.refresh_transfer_prediction_points_for_rumor(coalesce(new.rumor_id, old.rumor_id));
  return coalesce(new, old);
end;
$$;

create or replace function public.refresh_transfer_prediction_points_from_rumor()
returns trigger
language plpgsql
as $$
begin
  perform public.refresh_transfer_prediction_points_for_rumor(new.id);
  return new;
end;
$$;

create or replace function public.refresh_duel_result(target_duel uuid)
returns void
language plpgsql
as $$
declare
  duel_record public.duels%rowtype;
  match_record public.matches%rowtype;
  challenger_prediction public.predictions%rowtype;
  opponent_prediction public.predictions%rowtype;
  challenger_points integer;
  opponent_points integer;
  next_winner uuid;
  next_bonus integer := 0;
begin
  select *
  into duel_record
  from public.duels
  where id = target_duel;

  if duel_record.id is null then
    return;
  end if;

  select *
  into match_record
  from public.matches
  where id = duel_record.match_id;

  if match_record.status <> 'finished' or match_record.home_score is null or match_record.away_score is null then
    update public.duels
    set winner_id = null,
        bonus_awarded = 0
    where id = target_duel;
    return;
  end if;

  select *
  into challenger_prediction
  from public.predictions
  where user_id = duel_record.challenger_id and match_id = duel_record.match_id;

  select *
  into opponent_prediction
  from public.predictions
  where user_id = duel_record.opponent_id and match_id = duel_record.match_id;

  if challenger_prediction.id is null or opponent_prediction.id is null then
    update public.duels
    set winner_id = null,
        bonus_awarded = 0
    where id = target_duel;
    return;
  end if;

  challenger_points := public.calculate_prediction_points(
    challenger_prediction.predicted_result,
    challenger_prediction.predicted_home_score,
    challenger_prediction.predicted_away_score,
    match_record.home_score,
    match_record.away_score
  );

  opponent_points := public.calculate_prediction_points(
    opponent_prediction.predicted_result,
    opponent_prediction.predicted_home_score,
    opponent_prediction.predicted_away_score,
    match_record.home_score,
    match_record.away_score
  );

  if challenger_points > opponent_points then
    next_winner := duel_record.challenger_id;
    next_bonus := 10;
  elsif opponent_points > challenger_points then
    next_winner := duel_record.opponent_id;
    next_bonus := 10;
  else
    next_winner := null;
    next_bonus := 0;
  end if;

  update public.duels
  set winner_id = next_winner,
      bonus_awarded = next_bonus
  where id = target_duel;
end;
$$;

create or replace function public.refresh_duels_for_match(target_match uuid)
returns void
language plpgsql
as $$
declare
  duel_id uuid;
begin
  for duel_id in
    select id from public.duels where match_id = target_match
  loop
    perform public.refresh_duel_result(duel_id);
  end loop;
end;
$$;

create or replace function public.refresh_duel_from_duel_row()
returns trigger
language plpgsql
as $$
begin
  perform public.refresh_duel_result(new.id);
  return new;
end;
$$;

create or replace function public.refresh_duels_from_prediction()
returns trigger
language plpgsql
as $$
begin
  perform public.refresh_duels_for_match(coalesce(new.match_id, old.match_id));
  return coalesce(new, old);
end;
$$;

create or replace function public.refresh_duels_from_match()
returns trigger
language plpgsql
as $$
begin
  perform public.refresh_duels_for_match(new.id);
  return new;
end;
$$;

drop trigger if exists transfer_predictions_refresh_points on public.transfer_predictions;
create trigger transfer_predictions_refresh_points
after insert or update or delete on public.transfer_predictions
for each row execute function public.refresh_transfer_prediction_points_from_prediction();

drop trigger if exists transfer_rumors_refresh_points on public.transfer_rumors;
create trigger transfer_rumors_refresh_points
after update of status, resolved_outcome on public.transfer_rumors
for each row execute function public.refresh_transfer_prediction_points_from_rumor();

drop trigger if exists duels_set_updated_at on public.duels;
create trigger duels_set_updated_at
before update on public.duels
for each row execute function public.set_updated_at();

drop trigger if exists duels_refresh_result_on_insert on public.duels;
create trigger duels_refresh_result_on_insert
after insert on public.duels
for each row execute function public.refresh_duel_from_duel_row();

drop trigger if exists predictions_refresh_duels on public.predictions;
create trigger predictions_refresh_duels
after insert or update or delete on public.predictions
for each row execute function public.refresh_duels_from_prediction();

drop trigger if exists matches_refresh_duels on public.matches;
create trigger matches_refresh_duels
after update of home_score, away_score, status on public.matches
for each row execute function public.refresh_duels_from_match();

drop trigger if exists duels_refresh_profile_points on public.duels;
create trigger duels_refresh_profile_points
after update of winner_id, bonus_awarded on public.duels
for each row execute function public.refresh_duel_profile_total_points();

drop trigger if exists player_ratings_set_updated_at on public.player_ratings;
create trigger player_ratings_set_updated_at
before update on public.player_ratings
for each row execute function public.set_updated_at();

alter table public.player_ratings enable row level security;

drop policy if exists "player ratings are viewable by everyone" on public.player_ratings;
create policy "player ratings are viewable by everyone"
on public.player_ratings
for select
using (true);

drop policy if exists "users can insert own player ratings" on public.player_ratings;
create policy "users can insert own player ratings"
on public.player_ratings
for insert
with check (auth.uid() = user_id);

drop policy if exists "users can update own player ratings" on public.player_ratings;
create policy "users can update own player ratings"
on public.player_ratings
for update
using (auth.uid() = user_id);
