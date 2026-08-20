create table if not exists public.admin_emails (
  email text primary key,
  created_at timestamptz not null default timezone('utc', now())
);

insert into public.admin_emails (email)
values ('9_lap_9@mail.ru')
on conflict (email) do nothing;

update public.profiles
set is_admin = true
where lower(email) in (select lower(email) from public.admin_emails);

create or replace function public.is_admin_user()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and is_admin = true
  )
  or exists (
    select 1
    from public.admin_emails
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
