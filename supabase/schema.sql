-- Run this in Supabase -> SQL Editor -> New Query

create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  stream text not null,
  willing_to_pay boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  roll_no text not null,
  voter_name text not null default '',
  voter_stream text not null default '',
  crown_category text not null check (crown_category in ('mr-farewell', 'miss-farewell')),
  candidate_name text not null,
  candidate_key text not null,
  created_at timestamptz not null default now()
);

alter table public.votes add column if not exists roll_no text not null default '';
alter table public.votes add column if not exists voter_stream text not null default '';

create unique index if not exists votes_unique_roll_per_crown
  on public.votes (lower(trim(roll_no)), crown_category);

create index if not exists votes_crown_candidate_idx
  on public.votes (crown_category, candidate_key);

-- 3. Voting Controls & Timer Settings (single row id = 1)
create table if not exists public.voting_settings (
  id int primary key default 1,
  mode text not null default 'manual_on' check (mode in ('manual_on', 'manual_off', 'scheduled')),
  start_at timestamptz,
  end_at timestamptz,
  updated_at timestamptz not null default now()
);

insert into public.voting_settings (id, mode)
values (1, 'manual_on')
on conflict (id) do nothing;

alter table public.participants enable row level security;
alter table public.votes enable row level security;
alter table public.voting_settings enable row level security;

drop policy if exists "Allow public insert participants" on public.participants;
create policy "Allow public insert participants"
  on public.participants for insert with check (true);

drop policy if exists "Allow public select participants" on public.participants;
create policy "Allow public select participants"
  on public.participants for select using (true);

drop policy if exists "Allow public insert votes" on public.votes;
create policy "Allow public insert votes"
  on public.votes for insert with check (true);

drop policy if exists "Allow public select votes" on public.votes;
create policy "Allow public select votes"
  on public.votes for select using (true);

drop policy if exists "Allow public delete votes" on public.votes;
create policy "Allow public delete votes"
  on public.votes for delete using (true);

drop policy if exists "Allow public select voting_settings" on public.voting_settings;
create policy "Allow public select voting_settings"
  on public.voting_settings for select using (true);

drop policy if exists "Allow public upsert voting_settings" on public.voting_settings;
create policy "Allow public upsert voting_settings"
  on public.voting_settings for all using (true) with check (true);
