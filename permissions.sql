-- ==============================================================================
-- PERMISSIONS & ROLES (SaaS Security)
-- Run this to enforce Admin vs User visibility.
-- ==============================================================================

-- 1. Ensure Profiles have Role
-- (Matches crm_advanced_features.sql logic, repeated for safety)
alter table public.profiles add column if not exists role text default 'user'; -- 'admin', 'user'

-- Helper function to check if user is admin of their org
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role in ('admin', 'manager')
  );
$$ language sql security definer;

-- ==============================================================================
-- UPDATE POLICIES
-- ==============================================================================

-- A. CONVERSATIONS
drop policy if exists "Users view org conversations" on public.conversations;

create policy "Admins view all conversations" on public.conversations
for all using (
  (public.is_admin() and organization_id in (select organization_id from public.profiles where id = auth.uid()))
);

create policy "Users view assigned conversations" on public.conversations
for all using (
  (not public.is_admin() and assigned_to = auth.uid())
);

-- B. DEALS
drop policy if exists "Users view org deals" on public.deals;

create policy "Admins view all deals" on public.deals
for all using (
  (public.is_admin() and organization_id in (select organization_id from public.profiles where id = auth.uid()))
);

create policy "Users view assigned deals" on public.deals
for all using (
  (not public.is_admin() and user_id = auth.uid())
);

-- C. CONTACTS (Contacts usually shared? Or private?)
-- Let's assume Contacts are SHARED for now (Address Book), but Deals/Chats are private.
-- If user wants strict separation, we'd enable this too. Keeping Contacts shared for collaboration context.
-- (No change to Contacts policy)

-- Grant permissions if necessary
grant execute on function public.is_admin to authenticated;
