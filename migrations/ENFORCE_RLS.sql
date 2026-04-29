-- ==============================================================================
-- EMERGENCY DATA ISOLATION (RLS ENFORCEMENT)
-- This script FORCES every table to respect the organization_id.
-- ==============================================================================

-- 1. ENABLE RLS ON ALL TABLES
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 2. CLEAR ALL EXISTING POLICIES
DROP POLICY IF EXISTS "org_security" ON public.organizations;
DROP POLICY IF EXISTS "org_security" ON public.profiles;
DROP POLICY IF EXISTS "org_security" ON public.contacts;
DROP POLICY IF EXISTS "org_security" ON public.pipelines;
DROP POLICY IF EXISTS "org_security" ON public.stages;
DROP POLICY IF EXISTS "org_security" ON public.deals;
DROP POLICY IF EXISTS "org_security" ON public.conversations;
DROP POLICY IF EXISTS "org_security" ON public.messages;

-- 3. APPLY UNIFIED ORGANIZATION SECURITY
-- We use a helper function to avoid repeating the profile subquery
CREATE OR REPLACE FUNCTION public.get_user_org()
RETURNS uuid AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- A. Organizations
CREATE POLICY "org_security" ON public.organizations
FOR ALL TO authenticated
USING (id = public.get_user_org());

-- B. Profiles (See your teammates, edit yourself)
CREATE POLICY "org_security" ON public.profiles
FOR SELECT TO authenticated
USING (organization_id = public.get_user_org());

CREATE POLICY "profiles_self_update" ON public.profiles
FOR UPDATE TO authenticated
USING (id = auth.uid());

-- C. Tables with direct organization_id
CREATE POLICY "org_security" ON public.contacts
FOR ALL TO authenticated
USING (organization_id = public.get_user_org());

CREATE POLICY "org_security" ON public.pipelines
FOR ALL TO authenticated
USING (organization_id = public.get_user_org());

CREATE POLICY "org_security" ON public.deals
FOR ALL TO authenticated
USING (organization_id = public.get_user_org());

CREATE POLICY "org_security" ON public.conversations
FOR ALL TO authenticated
USING (organization_id = public.get_user_org());

CREATE POLICY "org_security" ON public.messages
FOR ALL TO authenticated
USING (organization_id = public.get_user_org());

-- D. Tables with indirect link
CREATE POLICY "org_security" ON public.stages
FOR ALL TO authenticated
USING (
  pipeline_id IN (
    SELECT id FROM public.pipelines 
    WHERE organization_id = public.get_user_org()
  )
);

-- 4. GRANT ACCESS
GRANT EXECUTE ON FUNCTION public.get_user_org TO authenticated;

-- ==============================================================================
-- VERIFICATION: After running this, a user will ONLY see data from their Org.
-- ==============================================================================
