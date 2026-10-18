-- Guestbook schema for mojeeb.xyz. Run once in the Supabase SQL editor.
-- Access is server-side only, with the service-role key; RLS is enabled with no public policies.

create extension if not exists pgcrypto;

create table if not exists public.guestbook_entries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 40),
  message text not null check (char_length(message) between 2 and 500),
  link text check (link is null or (char_length(link) <= 220 and link ~* '^https?://')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'spam')),
  ip_hash text not null,
  reactions jsonb not null default '{"wave":0,"heart":0,"paw":0}'::jsonb
);

create index if not exists guestbook_status_created_idx on public.guestbook_entries (status, created_at desc);
create index if not exists guestbook_ip_created_idx on public.guestbook_entries (ip_hash, created_at desc);

alter table public.guestbook_entries enable row level security;
-- No policies: anon and authenticated roles cannot read or write. The site's server uses the service role.

-- Atomic reaction increment, approved entries only, allow-listed kinds only.
create or replace function public.guestbook_react(entry_id uuid, kind text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if kind not in ('wave', 'heart', 'paw') then
    raise exception 'invalid reaction';
  end if;
  update public.guestbook_entries
     set reactions = jsonb_set(reactions, array[kind], to_jsonb(coalesce((reactions ->> kind)::int, 0) + 1))
   where id = entry_id and status = 'approved';
end;
$$;

revoke all on function public.guestbook_react(uuid, text) from public, anon, authenticated;
