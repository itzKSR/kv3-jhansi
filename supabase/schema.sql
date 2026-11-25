-- Run this once in Supabase -> SQL Editor -> New Query

-- 1. Farewell Participants Table
create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  class_section text not null,
  stream text not null,
  willing_to_pay boolean not null default false,
  created_at timestamptz not null default now()
);

-- 2. Crown Votes Table
create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  voter_name text not null,
  voter_class text not null,
  crown_category text not null,
  candidate_name text not null,
  candidate_key text not null,
  created_at timestamptz not null default now()
);

-- Prevent the same student from voting twice in the same crown category
create unique index if not exists votes_unique_voter_per_crown
  on public.votes (lower(trim(voter_name)), lower(trim(voter_class)), crown_category);

-- Helpful index for fast vote counting per crown
create index if not exists votes_crown_candidate_idx
  on public.votes (crown_category, candidate_key);

-- Enable Row Level Security (API routes use server-side keys or safe public policies)
alter table public.participants enable row level security;
alter table public.votes enable row level security;

-- Allow inserts & reads via anon/publishable key if server secret key is not set
create policy "Allow public insert participants"
  on public.participants for insert
  with check (true);

create policy "Allow public select participants"
  on public.participants for select
  using (true);

create policy "Allow public insert votes"
  on public.votes for insert
  with check (true);

create policy "Allow public select votes"
  on public.votes for select
  using (true);
