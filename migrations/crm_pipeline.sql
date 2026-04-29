-- ==============================================================================
-- SALES PIPELINE SCHEMA (KANBAN)
-- Run this to enable the Deal/Pipeline module.
-- ==============================================================================

-- 1. PIPELINES (Funis de Venda)
create table if not exists public.pipelines (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  name text not null, -- e.g. "Vendas Padrão", "Parcerias"
  is_default boolean default false,
  created_at timestamptz default now()
);

-- 2. STAGES (Etapas do Funil)
create table if not exists public.stages (
  id uuid default uuid_generate_v4() primary key,
  pipeline_id uuid references public.pipelines(id) on delete cascade not null,
  name text not null, -- e.g. "Novo Lead", "Qualificado"
  "order" integer not null default 0,
  color text, -- For UI badging
  created_at timestamptz default now()
);

-- 3. DEALS (Oportunidades/Negócios)
create table if not exists public.deals (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  stage_id uuid references public.stages(id) on delete set null, -- If stage deletes, deal stays (needs logic)
  
  title text not null, -- e.g. "Contrato Microsoft"
  value decimal(15,2) default 0,
  currency text default 'BRL',
  
  -- Links
  contact_id text, -- Linking to your existing (or future) Contact ID
  user_id uuid references auth.users, -- Owner of the deal
  
  -- Metadata
  status text default 'open', -- open, won, lost
  close_date timestamptz,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ==============================================================================
-- SECURITY (RLS)
-- ==============================================================================
alter table public.pipelines enable row level security;
alter table public.stages enable row level security;
alter table public.deals enable row level security;

-- Pipelines: View own Org's pipelines
create policy "Users view org pipelines" on public.pipelines
for all using (
  organization_id in (select organization_id from public.profiles where id = auth.uid())
);

-- Stages: View stages of own Org's pipelines
create policy "Users view org stages" on public.stages
for all using (
  exists (
    select 1 from public.pipelines p 
    where p.id = stages.pipeline_id 
    and p.organization_id in (select organization_id from public.profiles where id = auth.uid())
  )
);

-- Deals: View own Org's deals
create policy "Users view org deals" on public.deals
for all using (
  organization_id in (select organization_id from public.profiles where id = auth.uid())
);

-- ==============================================================================
-- SEED DATA (DEFAULT PIPELINE FOR NEW ORGS)
-- ==============================================================================
-- Optional function to create a default pipeline when an Org is created.
create or replace function public.create_default_pipeline(org_id uuid) 
returns void as $$
declare
  pipe_id uuid;
begin
  insert into public.pipelines (organization_id, name, is_default)
  values (org_id, 'Funil de Vendas', true)
  returning id into pipe_id;

  insert into public.stages (pipeline_id, name, "order", color) values
  (pipe_id, 'Novo Lead', 0, '#3b82f6'),
  (pipe_id, 'Qualificado', 1, '#8b5cf6'),
  (pipe_id, 'Proposta Enviada', 2, '#eab308'),
  (pipe_id, 'Negociação', 3, '#f97316'),
  (pipe_id, 'Fechado Ganho', 4, '#22c55e'),
  (pipe_id, 'Perdido', 5, '#ef4444');
end;
$$ language plpgsql security definer;
