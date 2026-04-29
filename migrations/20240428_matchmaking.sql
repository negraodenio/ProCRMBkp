-- ==============================================================================
-- MODULE: MATCH (Market Intelligence & Matchmaking)
-- This migration adds the data layer for FirstIgnite-style matchmaking.
-- ==============================================================================

-- 1. Market Intelligence Companies
create table if not exists public.market_intelligence_companies (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  
  name text not null,
  website text,
  industry text,
  description text,
  rd_focus text,
  
  embedding vector(2560),
  
  created_at timestamptz default now()
);

-- 2. Match Results
create table if not exists public.match_results (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  user_id uuid references auth.users not null,
  
  research_title text,
  research_summary text,
  company_id uuid references public.market_intelligence_companies(id) on delete cascade,
  
  fit_score float,
  rational text,
  
  status text default 'pending',
  
  created_at timestamptz default now()
);

-- 3. Security (RLS)
alter table public.market_intelligence_companies enable row level security;
alter table public.match_results enable row level security;

-- Simple policies (using existing get_my_org_id function if available, or basic check)
do $$ 
begin
    if not exists (select 1 from pg_policies where policyname = 'Users view org market companies') then
        create policy "Users view org market companies" on public.market_intelligence_companies for all using (organization_id = (select organization_id from public.profiles where id = auth.uid()));
    end if;
    if not exists (select 1 from pg_policies where policyname = 'Users view org match results') then
        create policy "Users view org match results" on public.match_results for all using (organization_id = (select organization_id from public.profiles where id = auth.uid()));
    end if;
end $$;

-- 4. Matching Function
create or replace function match_research_to_companies (
  query_embedding vector(2560),
  match_threshold float,
  match_count int,
  org_id uuid
)
returns table (
  company_id uuid,
  company_name text,
  company_industry text,
  company_description text,
  similarity float
)
language plpgsql
security invoker
as $$
begin
  return query
  select
    c.id,
    c.name,
    c.industry,
    c.description,
    1 - (c.embedding <=> query_embedding) as similarity
  from public.market_intelligence_companies c
  where c.organization_id = org_id
    and 1 - (c.embedding <=> query_embedding) > match_threshold
  order by (c.embedding <=> query_embedding) asc
  limit match_count;
end;
$$;

-- 5. Fix Organizations for AI Tracking
alter table public.organizations add column if not exists ia_tools_used_month integer default 0;
alter table public.organizations add column if not exists subscription_plan text default 'free';

-- 6. Increment AI Usage RPC
create or replace function public.increment_ia_usage(org_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.organizations
  set ia_tools_used_month = coalesce(ia_tools_used_month, 0) + 1
  where id = org_id;
end;
$$;
