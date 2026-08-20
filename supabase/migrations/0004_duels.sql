create table if not exists public.duels (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches (id) on delete cascade,
  challenger_id uuid not null references public.profiles (id) on delete cascade,
  opponent_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (match_id, challenger_id, opponent_id)
);

drop trigger if exists duels_set_updated_at on public.duels;
create trigger duels_set_updated_at
before update on public.duels
for each row execute function public.set_updated_at();

alter table public.duels enable row level security;

drop policy if exists "users can view own duels" on public.duels;
create policy "users can view own duels"
on public.duels
for select
using (auth.uid() = challenger_id or auth.uid() = opponent_id);

drop policy if exists "users can create own duels" on public.duels;
create policy "users can create own duels"
on public.duels
for insert
with check (auth.uid() = challenger_id);

drop policy if exists "users can update own duels" on public.duels;
create policy "users can update own duels"
on public.duels
for update
using (auth.uid() = challenger_id or auth.uid() = opponent_id);
