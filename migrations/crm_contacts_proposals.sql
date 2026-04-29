-- ==============================================================================
-- CONTACTS & PROPOSALS SCHEMA
-- Run this to complete the CRM data layer (Leads, Clients, Proposals).
-- ==============================================================================

-- 1. CONTACTS (Unified Table for Leads & Clients)
create table if not exists public.contacts (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  
  name text not null,
  email text,
  phone text,            -- Whatsapp Number
  company text,          -- Client Company Name
  
  -- Classification
  type text default 'lead', -- 'lead', 'client', 'partner'
  status text default 'new', -- 'new', 'contacted', 'qualified', 'churned'
  source text, -- 'whatsapp', 'website', 'referral'
  score integer default 0, -- Lead Scoring
  
  -- Avatar/Profile
  avatar_url text,
  tags text[], -- Array of strings for quick tags
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for fast search
create index if not exists idx_contacts_org_search 
on public.contacts(organization_id, name, email, phone);

-- 2. PROPOSALS (Propostas Comerciais)
create table if not exists public.proposals (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  
  -- Links
  contact_id uuid references public.contacts(id) on delete cascade not null,
  deal_id uuid references public.deals(id), -- Optional link to Pipeline Deal
  
  -- Proposal Details
  number text, -- Friendly ID like 'PROP-001'
  title text,
  value decimal(15,2),
  currency text default 'BRL',
  valid_until date,
  
  content jsonb, -- The structured content of the proposal (items, total)
  pdf_url text, -- If generated/uploaded
  
  -- Status & Tracking
  status text default 'draft', -- draft, sent, accepted, rejected, expired
  view_count integer default 0,
  last_viewed_at timestamptz,
  
  -- Delivery Tracking (User request: "Send via Zap/Email")
  sent_via_whatsapp boolean default false,
  sent_via_email boolean default false,
  sent_at timestamptz,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ==============================================================================
-- SECURITY (RLS)
-- ==============================================================================
alter table public.contacts enable row level security;
alter table public.proposals enable row level security;

-- Contacts
create policy "Users view org contacts" on public.contacts
for all using (
  organization_id in (select organization_id from public.profiles where id = auth.uid())
);

-- Proposals
create policy "Users view org proposals" on public.proposals
for all using (
  organization_id in (select organization_id from public.profiles where id = auth.uid())
);
