-- ==============================================================================
-- ADVANCED FEATURES (TEMPLATES, AUTOMATION, AI)
-- Run this to enable the "Power User" modules shown in screenshots.
-- ==============================================================================

-- 1. PROFILES UPDATE (Console View)
-- Matching the "Usuários no Sistema" screen
alter table public.profiles add column if not exists role text default 'user'; -- 'admin', 'user', 'manager'
alter table public.profiles add column if not exists status text default 'active'; -- 'active', 'inactive'

-- 2. PROPOSAL TEMPLATES (Biblioteca)
create table if not exists public.proposal_templates (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  
  name text not null,
  category text, -- 'Serviços', 'Produtos', 'Contratos'
  content jsonb, -- structure matching proposal content
  thumbnail_url text,
  
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 3. AUTOMATION RULES (Mensagens Automáticas)
-- "Quando status mudar de X para Y, enviar Z"
create table if not exists public.automation_rules (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  
  name text not null,
  
  -- Trigger
  trigger_type text default 'status_change', -- currently only logic shown
  trigger_entity text default 'lead', -- 'lead', 'deal'
  from_status text, -- null means "any"
  to_status text not null,
  
  -- Action
  action_type text default 'send_whatsapp',
  message_template text, -- Support variables like {nome}, {empresa}
  
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 4. AI LOGS (IA Tools)
create table if not exists public.ai_operations (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  user_id uuid references auth.users not null,
  
  tool_used text, -- 'generate_proposal', 'predictive_analysis', 'categorize_lead'
  target_entity_id uuid, -- Lead or Deal ID
  input_params jsonb,
  output_result jsonb,
  
  model_used text default 'gpt-4o',
  tokens_used integer,
  
  created_at timestamptz default now()
);

-- ==============================================================================
-- SECURITY (RLS)
-- ==============================================================================
alter table public.proposal_templates enable row level security;
alter table public.automation_rules enable row level security;
alter table public.ai_operations enable row level security;

create policy "Users view org templates" on public.proposal_templates
for all using (organization_id in (select organization_id from public.profiles where id = auth.uid()));

create policy "Users view org automations" on public.automation_rules
for all using (organization_id in (select organization_id from public.profiles where id = auth.uid()));

create policy "Users view org ai logs" on public.ai_operations
for all using (organization_id in (select organization_id from public.profiles where id = auth.uid()));
