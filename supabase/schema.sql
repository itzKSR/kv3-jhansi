-- Run this once in Supabase -> SQL Editor -> New Query

-- 1. Farewell Participants Table
create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  class_section text not null default 'Class XII',
  stream text not null,
  willing_to_pay boolean not null default false,
  created_at timestamptz not null default now()
);

-- 2. Crown Votes Table (1 vote per Roll Number per Crown)
create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  roll_no text not null,
  voter_name text not null default '',
  voter_class text not null default 'Class XII',
  crown_category text not null,
  candidate_name text not null,
  candidate_key text not null,
  created_at timestamptz not null default now()
);

-- Hard database lock: no roll number can be repeated in the same crown category
create unique index if not exists votes_unique_roll_per_crown
  on public.votes (lower(trim(roll_no)), crown_category);

create index if not exists votes_crown_candidate_idx
  on public.votes (crown_category, candidate_key);

alter table public.participants enable row level security;
alter table public.votes enable row level security;

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
