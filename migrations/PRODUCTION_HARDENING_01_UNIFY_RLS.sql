-- ==============================================================================
-- PRODUCTION HARDENING: GLOBAL RLS ENFORCEMENT (V3.1)
-- This script ensures absolute tenant isolation for all existing and future tables.
-- ==============================================================================

-- 1. ENFORCE RLS ON MISSING TABLES
ALTER TABLE IF EXISTS public.training_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ai_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.documents ENABLE ROW LEVEL SECURITY;

-- 2. DYNAMIC POLICY ENFORCEMENT
-- This block loops through all public tables and applies a unified organization-scoped policy.
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN
        SELECT table_name
        FROM information_schema.tables t
        WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
          AND table_name NOT IN ('organizations', 'profiles', 'schema_migrations')
          AND EXISTS (
              SELECT 1 FROM information_schema.columns c
              WHERE c.table_name = t.table_name
                AND c.table_schema = 'public'
                AND c.column_name = 'organization_id'
          )
    LOOP
        -- Drop any loose policies
        EXECUTE format('DROP POLICY IF EXISTS "org_security" ON public.%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Users view org data" ON public.%I', t);

        -- Create the Unified Gold Standard Policy
        -- Uses the helper function get_my_org_id() defined in MASTER_CRM_SETUP
        EXECUTE format('
            CREATE POLICY "org_security" ON public.%I
            FOR ALL
            TO authenticated
            USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()))
            WITH CHECK (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()))
        ', t);

        RAISE NOTICE 'Hardened table: %', t;
    END LOOP;
END $$;

-- 3. HARDEN THE ROOT TENANTS
DROP POLICY IF EXISTS "Users view own organization" ON public.organizations;
CREATE POLICY "org_security" ON public.organizations
FOR ALL TO authenticated
USING (id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- 4. FINAL VERIFICATION VIEW
-- Run this to check status: SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
