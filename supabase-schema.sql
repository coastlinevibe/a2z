-- A2Z Database Schema
-- Run this in your Supabase SQL editor

-- Enable authentication
-- This is automatically handled by Supabase Auth

-- Create posts table
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null,
  title text not null,
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'ZAR',
  description text,
  emoji_tags text[] default '{}',
  media_urls text[] not null default '{}',
  slug text unique not null,
  is_active boolean not null default true,
  views integer not null default 0,
  clicks integer not null default 0,
  whatsapp_number text,
  location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create indexes for better performance
create index if not exists posts_owner_idx on public.posts (owner);
create index if not exists posts_slug_idx on public.posts (slug);
create index if not exists posts_created_at_idx on public.posts (created_at desc);
create index if not exists posts_is_active_idx on public.posts (is_active);

-- Enable Row Level Security
alter table public.posts enable row level security;

-- RLS Policies
create policy "posts_select_policy" on public.posts
  for select using (is_active = true or owner = auth.uid());

create policy "posts_insert_policy" on public.posts
  for insert with check (owner = auth.uid());

create policy "posts_update_policy" on public.posts
  for update using (owner = auth.uid());

create policy "posts_delete_policy" on public.posts
  for delete using (owner = auth.uid());

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger posts_updated_at
  before update on public.posts
  for each row
  execute function public.handle_updated_at();

-- Storage bucket for post media (run this in Supabase dashboard)
-- 1. Go to Storage > Create bucket
-- 2. Name: "posts"
-- 3. Public: true
-- 4. File size limit: 10MB
-- 5. Allowed MIME types: image/*, video/mp4, video/webm
