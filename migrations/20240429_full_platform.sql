-- ==============================================================================
-- MODULE: FULL PLATFORM (Outreach, Grants, Researchers, Audit HMAC)
-- Processo 56467 - FUNARBE
-- ==============================================================================

-- Prerequisites
create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";

-- Add 'source' and 'tags' to contacts if missing
alter table public.contacts add column if not exists source text;
alter table public.contacts add column if not exists tags text[];

-- 1. Outreach Campaigns
create table if not exists public.outreach_campaigns (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  user_id uuid references auth.users not null,
  
  name text not null,
  status text default 'draft' check (status in ('draft', 'active', 'paused', 'completed')),
  target_technology text,
  
  total_sent integer default 0,
  total_opened integer default 0,
  total_clicked integer default 0,
  total_replied integer default 0,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Outreach Emails (individual sends)
create table if not exists public.outreach_emails (
  id uuid default uuid_generate_v4() primary key,
  campaign_id uuid references public.outreach_campaigns(id) on delete cascade not null,
  organization_id uuid references public.organizations(id) not null,
  
  recipient_email text not null,
  recipient_name text,
  company_name text,
  subject text,
  
  status text default 'queued' check (status in ('queued', 'sent', 'opened', 'clicked', 'replied', 'bounced')),
  sent_at timestamptz,
  opened_at timestamptz,
  
  created_at timestamptz default now()
);

-- 3. Grants/Editais Table
create table if not exists public.grants (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  
  name text not null,
  agency text not null,
  value text,
  deadline text,
  description text,
  url text,
  relevance_score float default 0,
  research_topic text,
  
  created_at timestamptz default now()
);

-- 4. Researchers (Lattes-synced profiles)
create table if not exists public.researchers (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  
  name text not null,
  lattes_id text,
  department text,
  expertise text[],
  
  publications_count integer default 0,
  patents_count integer default 0,
  h_index integer default 0,
  
  last_synced_at timestamptz,
  created_at timestamptz default now()
);

-- 5. Audit Logs (create if not exists, then enhance with HMAC chain)
create table if not exists public.audit_logs (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id),
  user_id uuid references auth.users,
  
  action text not null,
  entity_type text,
  entity_id text,
  details jsonb default '{}'::jsonb,
  
  hmac_hash text,
  previous_hash text,
  chain_verified boolean default true,
  
  created_at timestamptz default now()
);

-- Enable RLS on audit_logs
alter table public.audit_logs enable row level security;

do $$
begin
    if not exists (select 1 from pg_policies where policyname = 'Users manage org audit logs') then
        create policy "Users manage org audit logs" on public.audit_logs for all 
        using (organization_id = (select organization_id from public.profiles where id = auth.uid()));
    end if;
end $$;

-- 6. Add decision_maker fields to contacts for People Search
alter table public.contacts add column if not exists role text;
alter table public.contacts add column if not exists expertise text[];
alter table public.contacts add column if not exists verified boolean default false;
alter table public.contacts add column if not exists linkedin_url text;

-- 7. RLS for all new tables
alter table public.outreach_campaigns enable row level security;
alter table public.outreach_emails enable row level security;
alter table public.grants enable row level security;
alter table public.researchers enable row level security;

do $$ 
begin
    -- Outreach Campaigns
    if not exists (select 1 from pg_policies where policyname = 'Users manage org outreach campaigns') then
        create policy "Users manage org outreach campaigns" on public.outreach_campaigns for all 
        using (organization_id = (select organization_id from public.profiles where id = auth.uid()));
    end if;
    
    -- Outreach Emails
    if not exists (select 1 from pg_policies where policyname = 'Users manage org outreach emails') then
        create policy "Users manage org outreach emails" on public.outreach_emails for all 
        using (organization_id = (select organization_id from public.profiles where id = auth.uid()));
    end if;
    
    -- Grants
    if not exists (select 1 from pg_policies where policyname = 'Users manage org grants') then
        create policy "Users manage org grants" on public.grants for all 
        using (organization_id = (select organization_id from public.profiles where id = auth.uid()));
    end if;
    
    -- Researchers
    if not exists (select 1 from pg_policies where policyname = 'Users manage org researchers') then
        create policy "Users manage org researchers" on public.researchers for all 
        using (organization_id = (select organization_id from public.profiles where id = auth.uid()));
    end if;
end $$;

-- 8. Helper function: compute HMAC chain for audit
create or replace function public.compute_audit_hash()
returns trigger
language plpgsql
security definer
as $$
declare
    prev_hash text;
    payload text;
begin
    -- Get previous hash for chain
    select hmac_hash into prev_hash 
    from public.audit_logs 
    where organization_id = NEW.organization_id
    order by created_at desc 
    limit 1;
    
    NEW.previous_hash := coalesce(prev_hash, 'GENESIS');
    
    -- Build payload for hashing
    payload := concat(
        NEW.action, '|',
        NEW.entity_type, '|',
        NEW.user_id, '|',
        NEW.created_at::text, '|',
        coalesce(NEW.previous_hash, 'GENESIS')
    );
    
    -- Compute HMAC-SHA256 using pgcrypto
    NEW.hmac_hash := encode(
        hmac(payload::bytea, 'ia4all-sovereign-key-56467'::bytea, 'sha256'),
        'hex'
    );
    NEW.chain_verified := true;
    
    return NEW;
end;
$$;

-- Create trigger (drop first if exists to be idempotent)
drop trigger if exists audit_hmac_trigger on public.audit_logs;
create trigger audit_hmac_trigger
    before insert on public.audit_logs
    for each row
    execute function public.compute_audit_hash();
