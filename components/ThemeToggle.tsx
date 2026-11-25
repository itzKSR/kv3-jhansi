-- Run this in Supabase -> SQL Editor -> New Query
-- Safe to run on a fresh database OR an existing one from an earlier draft.

-- 1. Farewell Participants Table (Class XII by default, Stream only)
create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  stream text not null,
  willing_to_pay boolean not null default false,
  created_at timestamptz not null default now()
);

-- If an older version had class_section as NOT NULL, make it optional so stream-only inserts succeed
alter table public.participants alter column class_section drop not null;

-- 2. Crown Votes Table (Mr. Farewell & Miss Farewell ONLY, 1 vote per Roll No. per Crown)
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

-- Upgrade path if an earlier draft created votes without roll_no or voter_stream
alter table public.votes add column if not exists roll_no text not null default '';
alter table public.votes add column if not exists voter_stream text not null default '';

-- Hard database lock: no roll number can repeat in the same crown category
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
