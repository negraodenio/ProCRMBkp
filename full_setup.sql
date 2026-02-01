-- ==============================================================================
-- SUPABASE FULL SETUP SCRIPT (V2.1 ENTERPRISE GOVERNANCE)
-- Run this in the Supabase SQL Editor.
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists vector;
create extension if not exists "uuid-ossp";

-- 2. PUBLIC PROFILES (Users)
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  company_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. PROJECT SPECS (Repo Intelligence Layer)
-- Stores global rules/constitution for the repo.
create table if not exists public.project_specs (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  content text not null,
  category text, -- 'security', 'tone', 'legal'
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 4. BOTS (The Container)
create table if not exists public.bots (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references public.profiles(id) not null,
  name text not null,
  description text,
  
  -- Evolution API Config
  evolution_instance_id text,
  evolution_api_key text,
  webhook_url text,
  
  -- Pointer to Active Version (Patch & Diff Engine)
  current_version_id uuid, -- Linked via alter table below
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5. BOT VERSIONS (The Immutable Brain)
create table if not exists public.bot_versions (
  id uuid default uuid_generate_v4() primary key,
  bot_id uuid references public.bots(id) on delete cascade not null,
  version_number integer not null,
  commit_message text,
  
  -- Logic / Prompt
  system_prompt text not null,
  
  -- Provider/Model Split (SiliconFlow Support)
  provider text default 'siliconflow', -- 'openai', 'anthropic', 'siliconflow'
  model text not null,                 -- 'Qwen2.5-72B-Instruct', 'gpt-4o'
  temperature float default 0.7,
  
  -- Snapshot of Specs used
  active_spec_ids uuid[],
  
  -- Auditing (Who made this change?)
  created_by uuid references auth.users default auth.uid(),
  created_at timestamptz default now(),
  
  -- Integrity: No duplicate version numbers per bot
  unique(bot_id, version_number)
);

-- Fix Circular Dependency
alter table public.bots 
drop constraint if exists fk_bots_current_version;

alter table public.bots 
add constraint fk_bots_current_version 
foreign key (current_version_id) references public.bot_versions(id);

-- 6. MEMORY SOURCES (Coding Memory - Raw Files)
create table if not exists public.memory_sources (
  id uuid default uuid_generate_v4() primary key,
  bot_id uuid references public.bots(id) on delete cascade not null,
  filename text not null,
  file_path text not null, -- Supabase Storage path
  file_hash text,
  status text default 'pending',
  created_at timestamptz default now()
);

-- 7. MEMORY CHUNKS (Coding Memory - Vectors)
create table if not exists public.memory_chunks (
  id uuid default uuid_generate_v4() primary key,
  source_id uuid references public.memory_sources(id) on delete cascade not null,
  bot_id uuid references public.bots(id) on delete cascade not null,
  
  content text not null,
  
  -- IMPORTANT: Defined as 1536 (OpenAI). 
  -- If using SiliconFlow/BGE-M3 (1024), change this dimension before running!
  -- Trying to index a vector with wrong dimensions will fail.
  embedding vector(1536), 
  
  chunk_index integer,
  metadata jsonb,
  
  created_at timestamptz default now()
);

-- 8. EVENT LOGS (Auditable History + Retention)
create table if not exists public.event_logs (
  id uuid default uuid_generate_v4() primary key,
  bot_id uuid references public.bots(id) not null,
  bot_version_id uuid references public.bot_versions(id), -- Which prompt version answered?
  
  -- Strict Event Types (Data Integrity)
  event_type text check (event_type in ('inbound', 'outbound', 'error', 'system_change')),
  payload jsonb,
  
  -- Retention Policy (Cost Control)
  expires_at timestamptz default (now() + interval '90 days'),
  created_at timestamptz default now()
);

-- ==============================================================================
-- INDEXES & PERFORMANCE
-- ==============================================================================
create index if not exists idx_memory_chunks_bot_id on public.memory_chunks(bot_id);

-- Vector Index (IVF Flat) - Speeds up RAG
create index if not exists idx_memory_chunks_embedding 
on public.memory_chunks using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

-- Governance Index: Query logs by specific version
create index if not exists idx_event_logs_bot_version_id on public.event_logs(bot_version_id);

-- ==============================================================================
-- SECURITY (RLS POLICIES)
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.bots enable row level security;
alter table public.bot_versions enable row level security;
alter table public.memory_sources enable row level security;
alter table public.memory_chunks enable row level security;
alter table public.event_logs enable row level security;

-- Profiles: Users see their own
create policy "Users view own profile" on public.profiles 
for select using (auth.uid() = id);

create policy "Users update own profile" on public.profiles 
for update using (auth.uid() = id);

-- Bots: Users see/edit only their own bots
create policy "Users view own bots" on public.bots 
for all using (auth.uid() = owner_id);

-- Bot Versions: View versions of owned bots
create policy "Users view versions of own bots" on public.bot_versions 
for select using (
  exists (select 1 from public.bots where id = bot_versions.bot_id and owner_id = auth.uid())
);

-- Memory: View components of owned bots
create policy "Users view own sources" on public.memory_sources 
for all using (
  exists (select 1 from public.bots where id = memory_sources.bot_id and owner_id = auth.uid())
);

create policy "Users view own chunks" on public.memory_chunks 
for select using (
  exists (select 1 from public.bots where id = memory_chunks.bot_id and owner_id = auth.uid())
);

-- Logs: View logs for owned bots
create policy "Users view own logs" on public.event_logs 
for select using (
  exists (select 1 from public.bots where id = event_logs.bot_id and owner_id = auth.uid())
);

-- ==============================================================================
-- 9. TRIGGERS (AUTOMATION)
-- ==============================================================================

-- Function to handle new user signup
create or replace function public.handle_new_user() 
returns trigger as @supabase/ssr
begin
  insert into public.profiles (id, email, full_name, company_name)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'company_name'
  );
  return new;
end;
@supabase/ssr language plpgsql security definer;

-- Trigger to call the function on new user creation
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

