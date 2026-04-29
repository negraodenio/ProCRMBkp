-- ==============================================================================
-- MARKETING STRATEGIES SCHEMA
-- Run this to enable the "Estratégias" module (Automatiom).
-- ==============================================================================

-- 1. STRATEGIES (Regras de Negócio)
create table if not exists public.marketing_strategies (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  
  name text not null, -- e.g. "Pós-Venda 7 dias"
  type text not null, -- 'pos-venda', 'reativacao', 'aniversario'
  
  -- The Logic
  trigger_days integer default 0, -- e.g. 7 days after...
  trigger_event text default 'deal_won', -- 'deal_won', 'lead_stalled'
  
  -- The Content
  message_template text, -- content with {variables}
  channel text default 'whatsapp',
  
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 2. EXECUTIONS (Log de Disparos)
create table if not exists public.marketing_executions (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  strategy_id uuid references public.marketing_strategies(id) not null,
  
  target_contact_id uuid references public.contacts(id) not null,
  status text default 'pending', -- pending, sent, failed
  
  executed_at timestamptz,
  error_log text,
  
  created_at timestamptz default now()
);

-- ==============================================================================
-- SECURITY (RLS)
-- ==============================================================================
alter table public.marketing_strategies enable row level security;
alter table public.marketing_executions enable row level security;

create policy "Users view org strategies" on public.marketing_strategies
for all using (organization_id in (select organization_id from public.profiles where id = auth.uid()));

create policy "Users view org executions" on public.marketing_executions
for all using (organization_id in (select organization_id from public.profiles where id = auth.uid()));
