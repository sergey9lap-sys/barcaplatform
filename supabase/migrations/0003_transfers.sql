create table if not exists public.transfer_rumors (
  id uuid primary key default gen_random_uuid(),
  player_name text not null,
  current_club text not null,
  target_club text not null,
  window_label text not null,
  status text not null check (status in ('active', 'resolved')),
  resolved_outcome boolean,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.transfer_predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  rumor_id uuid not null references public.transfer_rumors (id) on delete cascade,
  prediction text not null check (prediction in ('yes', 'no')),
  points_awarded integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, rumor_id)
);

drop trigger if exists transfer_predictions_set_updated_at on public.transfer_predictions;
create trigger transfer_predictions_set_updated_at
before update on public.transfer_predictions
for each row execute function public.set_updated_at();

alter table public.transfer_rumors enable row level security;
alter table public.transfer_predictions enable row level security;

drop policy if exists "transfer rumors are viewable by everyone" on public.transfer_rumors;
create policy "transfer rumors are viewable by everyone"
on public.transfer_rumors
for select
using (true);

drop policy if exists "users can view own transfer predictions" on public.transfer_predictions;
create policy "users can view own transfer predictions"
on public.transfer_predictions
for select
using (auth.uid() = user_id);

drop policy if exists "users can insert own transfer predictions" on public.transfer_predictions;
create policy "users can insert own transfer predictions"
on public.transfer_predictions
for insert
with check (auth.uid() = user_id);

drop policy if exists "users can update own transfer predictions" on public.transfer_predictions;
create policy "users can update own transfer predictions"
on public.transfer_predictions
for update
using (auth.uid() = user_id);
