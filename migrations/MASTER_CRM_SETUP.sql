-- ==============================================================================
-- MASTER CRM SETUP SCRIPT (V3.0 - UNIFIED)
-- ==============================================================================
-- 🚨 INSTRUCTIONS:
-- 1. Go to Supabase > SQL Editor.
-- 2. Paste this ENTIRE file.
-- 3. Click "RUN".
--
-- This script handles:
-- - Extensions (Vector, UUID)
-- - Multi-tenancy (Organizations)
-- - Users (Profiles)
-- - All Modules: Pipeline, Chat, Contacts, Marketing, AI, Templates
-- - Security (RLS) & Automation Triggers
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists vector;
create extension if not exists "uuid-ossp";

-- 2. ORGANIZATIONS (The Root Tenant)
create table if not exists public.organizations (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  bot_settings jsonb default '{"personality": "friendly", "active": true}'::jsonb,
  created_at timestamptz default now()
);

alter table public.organizations enable row level security;

-- 3. PROFILES (Users)
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  company_name text,
  role text default 'user',   -- 'admin', 'user', 'manager'
  status text default 'active',

  -- Link to Organization
  organization_id uuid references public.organizations(id),

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Ensure V3 columns exist even if table was created by V1 script
alter table public.profiles
add column if not exists organization_id uuid references public.organizations(id);

alter table public.profiles
add column if not exists role text default 'user';

alter table public.profiles
add column if not exists status text default 'active';

alter table public.profiles enable row level security;

-- 4. PIPELINES (Kanban)
create table if not exists public.pipelines (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  name text not null,
  is_default boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.stages (
  id uuid default uuid_generate_v4() primary key,
  pipeline_id uuid references public.pipelines(id) on delete cascade not null,
  name text not null,
  "order" integer not null default 0,
  color text,
  created_at timestamptz default now()
);

create table if not exists public.deals (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  stage_id uuid references public.stages(id) on delete set null,
  title text not null,
  value decimal(15,2) default 0,
  currency text default 'BRL',
  contact_id text,
  user_id uuid references auth.users,
  status text default 'open',
  close_date timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.pipelines enable row level security;
alter table public.stages enable row level security;
alter table public.deals enable row level security;

-- 5. CONTACTS & PROPOSALS
create table if not exists public.contacts (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  name text not null,
  email text,
  phone text,
  company text,
  type text default 'lead',
  status text default 'new',
  source text,
  score integer default 0,
  avatar_url text,
  tags text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.proposals (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  contact_id uuid references public.contacts(id) on delete cascade not null,
  deal_id uuid references public.deals(id),
  number text,
  title text,
  value decimal(15,2),
  status text default 'draft',
  sent_via_whatsapp boolean default false,
  sent_via_email boolean default false,
  created_at timestamptz default now()
);

alter table public.contacts enable row level security;
alter table public.proposals enable row level security;

-- 6. CHAT & CONVERSATIONS
create table if not exists public.conversations (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  contact_phone text not null,
  contact_name text,
  last_message_content text,
  last_message_at timestamptz default now(),
  unread_count integer default 0,
  status text default 'open',
  assigned_to uuid references auth.users,
  created_at timestamptz default now()
);

create table if not exists public.messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  organization_id uuid references public.organizations(id) not null,
  content text,
  media_url text,
  media_type text,
  direction text not null check (direction in ('inbound', 'outbound')),
  status text default 'sent',
  created_at timestamptz default now()
);

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- 7. ADVANCED (Templates, Automation, Marketing, AI)

-- Templates
create table if not exists public.proposal_templates (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  name text not null,
  content jsonb,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Automation Rules (Status Changes)
create table if not exists public.automation_rules (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  name text not null,
  trigger_type text default 'status_change',
  from_status text,
  to_status text not null,
  action_type text default 'send_whatsapp',
  message_template text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Marketing Strategies (Campaigns)
create table if not exists public.marketing_strategies (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  name text not null,
  type text not null,
  trigger_days integer default 0,
  message_template text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- AI Logs
create table if not exists public.ai_operations (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  user_id uuid references auth.users not null,
  tool_used text,
  input_params jsonb,
  output_result jsonb,
  created_at timestamptz default now()
);

alter table public.proposal_templates enable row level security;
alter table public.automation_rules enable row level security;
alter table public.marketing_strategies enable row level security;
alter table public.ai_operations enable row level security;

-- ==============================================================================
-- 8. RLS POLICIES (GENERIC ORGANIZATION ACCESS)
-- ==============================================================================
-- This macro-policy style simplifies things.
-- NOTE: In production, you might want more granular roles (admin vs user).

-- Helper function to get current user's org ID
create or replace function public.get_my_org_id()
returns uuid as $$
  select organization_id from public.profiles where id = auth.uid() limit 1;
$$ language sql security definer;

-- Organization: View Own
create policy "Users view own organization" on public.organizations
for select using (id = public.get_my_org_id());

-- Profiles: View Co-workers
create policy "Users view coworkers" on public.profiles
for select using (organization_id = public.get_my_org_id());

-- GENERIC POLICIES FOR ALL ORG-BASED TABLES
create policy "Access Org Pipelines" on public.pipelines for all using (organization_id = public.get_my_org_id());
create policy "Access Org Stages" on public.stages for all using (exists (select 1 from public.pipelines p where p.id = pipeline_id and p.organization_id = public.get_my_org_id()));
create policy "Access Org Deals" on public.deals for all using (organization_id = public.get_my_org_id());
create policy "Access Org Contacts" on public.contacts for all using (organization_id = public.get_my_org_id());
create policy "Access Org Proposals" on public.proposals for all using (organization_id = public.get_my_org_id());
create policy "Access Org Conversations" on public.conversations for all using (organization_id = public.get_my_org_id());
create policy "Access Org Messages" on public.messages for all using (organization_id = public.get_my_org_id());
create policy "Access Org Templates" on public.proposal_templates for all using (organization_id = public.get_my_org_id());
create policy "Access Org Automations" on public.automation_rules for all using (organization_id = public.get_my_org_id());
create policy "Access Org Marketing" on public.marketing_strategies for all using (organization_id = public.get_my_org_id());
create policy "Access Org AI Logs" on public.ai_operations for all using (organization_id = public.get_my_org_id());

-- ==============================================================================
-- 9. USER SIGNUP HANDLER (Transactional Tenant Creation)
-- ==============================================================================
create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_org_id uuid;
begin
  -- 1. Create Organization
  insert into public.organizations (name, bot_settings)
  values (
    coalesce(new.raw_user_meta_data->>'company_name', 'Minha Organização'),
    '{"personality": "friendly", "active": true}'::jsonb
  )
  returning id into new_org_id;

  -- 2. Create Profile linked to Organization
  insert into public.profiles (id, email, full_name, organization_id, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new_org_id,
    'admin' -- First user is Admin
  );

  -- 3. Create Default Pipeline
  insert into public.pipelines (organization_id, name, is_default)
  values (new_org_id, 'Funil de Vendas', true)
  returning id into new_org_id; -- Reuse variable for pipeline_id temporarily

  -- 4. Create Default Stages
  insert into public.stages (pipeline_id, name, "order", color)
  values
    (new_org_id, 'Novo', 0, 'blue'),
    (new_org_id, 'Contatado', 1, 'yellow'),
    (new_org_id, 'Qualificado', 2, 'green'),
    (new_org_id, 'Proposta', 3, 'purple'),
    (new_org_id, 'Negociação', 4, 'orange'),
    (new_org_id, 'Ganho', 5, 'emerald'),
    (new_org_id, 'Perdido', 6, 'red');

  return new;
end;
$$ language plpgsql security definer;

-- Re-attach trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

