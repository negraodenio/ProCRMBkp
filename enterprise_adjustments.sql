-- ==============================================================================
-- ENTERPRISE ADJUSTMENTS (STRICT MULTI-TENANCY)
-- Run this to upgrade the schema to "Organization-Based" isolation.
-- ==============================================================================

-- 1. Create Organization (Tenant) Table
-- This is the source of truth for the "Tenant".
create table if not exists public.organizations (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  created_at timestamptz default now()
);

-- Enable RLS on Organizations
alter table public.organizations enable row level security;

-- Policy: Users can view their own organization
create policy "Users view own organization" on public.organizations
for select using (
  id in (select organization_id from public.profiles where id = auth.uid())
);

-- 2. Update Profiles to belong to an Organization
-- We add organization_id and migrate existing data (trivial if empty)
alter table public.profiles 
add column if not exists organization_id uuid references public.organizations(id);

-- Index for performance
create index if not exists idx_profiles_organization_id on public.profiles(organization_id);

-- 3. REWRITE TRIGGER: Transactional Org + Profile Creation
-- This guarantees every new user has a Tenant/Organization immediately.

create or replace function public.handle_new_user() 
returns trigger as $$
declare
  new_org_id uuid;
begin
  -- A. Create the Organization (Tenant) derived from company name
  -- If company_name is missing, fallback to "My Organization"
  insert into public.organizations (name)
  values (coalesce(new.raw_user_meta_data->>'company_name', 'My Organization'))
  returning id into new_org_id;

  -- B. Create the Profile linked to the new Organization
  insert into public.profiles (id, email, full_name, organization_id)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    new_org_id
  );
  
  return new;
end;
$$ language plpgsql security definer;

-- Ensure the trigger is attached (if re-running)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==============================================================================
-- 4. FUTURE-PROOFING: Row Level Security using Organization
-- ==============================================================================
-- Eventually, you will switch RLS from "owner_id = auth.uid()" 
-- to "organization_id = (select organization_id from profiles where id = auth.uid())"
-- allowing multiple users per bot.
