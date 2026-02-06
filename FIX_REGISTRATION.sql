-- ==============================================================================
-- FIX REGISTRATION (User Signup Handler)
-- ==============================================================================
-- 🚨 INSTRUCTIONS:
-- 1. Go to Supabase > SQL Editor.
-- 2. Paste this ENTIRE file.
-- 3. Click "RUN".
-- ==============================================================================

-- 1. Fix the main signup function
create or replace function public.handle_new_user() 
returns trigger as $$
declare
  new_org_id uuid;
  new_pipeline_id uuid;
begin
  -- A. Create the Organization (Tenant) derived from company name
  insert into public.organizations (name)
  values (coalesce(new.raw_user_meta_data->>'company_name', 'Minha Organização'))
  returning id into new_org_id;

  -- B. Create the Profile linked to the new Organization
  insert into public.profiles (id, email, full_name, organization_id, role, status)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    new_org_id,
    'admin',
    'active'
  );
  
  -- C. Create initial Pipeline for the new Org (important for UI consistency)
  insert into public.pipelines (organization_id, name, is_default)
  values (new_org_id, 'Funil de Vendas', true)
  returning id into new_pipeline_id;
  
  -- D. Create initial Stages for the pipeline
  insert into public.stages (pipeline_id, name, "order", color)
  values 
    (new_pipeline_id, 'Novo Lead', 0, '#3b82f6'),
    (new_pipeline_id, 'Em Qualificação', 1, '#8b5cf6'),
    (new_pipeline_id, 'Proposta Enviada', 2, '#f59e0b'),
    (new_pipeline_id, 'Negociação', 3, '#10b981'),
    (new_pipeline_id, 'Ganhos', 4, '#10b981');

  return new;
exception when others then
  -- Basic error logging if possible, but triggers usually just fail
  return new;
end;
$$ language plpgsql security definer;

-- 2. Re-attach the trigger safely
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Ensure profiles table has all necessary columns matching V3 spec
alter table public.profiles add column if not exists organization_id uuid references public.organizations(id);
alter table public.profiles add column if not exists role text default 'user';
alter table public.profiles add column if not exists status text default 'active';

-- 4. Enable RLS (Safety Check)
alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
