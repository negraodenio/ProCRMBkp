-- =========================================
-- PRODUCTION HARDENING - SCRIPT 1
-- Unificação de Funções RLS
-- =========================================
-- Tempo estimado: 5 minutos
-- Prioridade: ALTA

-- 1. DROP função duplicada
DROP FUNCTION IF EXISTS public.get_user_org();

-- 2. Garantir que get_my_org_id existe
CREATE OR REPLACE FUNCTION public.get_my_org_id()
RETURNS uuid AS $$
  SELECT organization_id
  FROM public.profiles
  WHERE id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 3. Recriar todas as políticas para usar APENAS get_my_org_id
-- (Isso garante consistência total)

-- Organizations
DROP POLICY IF EXISTS "Users view own organization" ON public.organizations;
DROP POLICY IF EXISTS "org_security" ON public.organizations;
CREATE POLICY "org_access" ON public.organizations
FOR ALL TO authenticated
USING (id = public.get_my_org_id());

-- Profiles
DROP POLICY IF EXISTS "Users view coworkers" ON public.profiles;
DROP POLICY IF EXISTS "org_security" ON public.profiles;
DROP POLICY IF EXISTS "profiles_self_update" ON public.profiles;
CREATE POLICY "org_access" ON public.profiles
FOR SELECT TO authenticated
USING (organization_id = public.get_my_org_id());
CREATE POLICY "self_update" ON public.profiles
FOR UPDATE TO authenticated
USING (id = auth.uid());

-- Contacts
DROP POLICY IF EXISTS "Access Org Contacts" ON public.contacts;
DROP POLICY IF EXISTS "org_security" ON public.contacts;
CREATE POLICY "org_access" ON public.contacts
FOR ALL TO authenticated
USING (organization_id = public.get_my_org_id());

-- Pipelines
DROP POLICY IF EXISTS "Access Org Pipelines" ON public.pipelines;
DROP POLICY IF EXISTS "org_security" ON public.pipelines;
CREATE POLICY "org_access" ON public.pipelines
FOR ALL TO authenticated
USING (organization_id = public.get_my_org_id());

-- Stages (indirect via pipeline)
DROP POLICY IF EXISTS "Access Org Stages" ON public.stages;
DROP POLICY IF EXISTS "org_security" ON public.stages;
CREATE POLICY "org_access" ON public.stages
FOR ALL TO authenticated
USING (
  pipeline_id IN (
    SELECT id FROM public.pipelines
    WHERE organization_id = public.get_my_org_id()
  )
);

-- Deals
DROP POLICY IF EXISTS "Access Org Deals" ON public.deals;
DROP POLICY IF EXISTS "org_security" ON public.deals;
CREATE POLICY "org_access" ON public.deals
FOR ALL TO authenticated
USING (organization_id = public.get_my_org_id());

-- Conversations
DROP POLICY IF EXISTS "Access Org Conversations" ON public.conversations;
DROP POLICY IF EXISTS "org_security" ON public.conversations;
CREATE POLICY "org_access" ON public.conversations
FOR ALL TO authenticated
USING (organization_id = public.get_my_org_id());

-- Messages
DROP POLICY IF EXISTS "Access Org Messages" ON public.messages;
DROP POLICY IF EXISTS "org_security" ON public.messages;
CREATE POLICY "org_access" ON public.messages
FOR ALL TO authenticated
USING (organization_id = public.get_my_org_id());

-- Proposals
DROP POLICY IF EXISTS "Access Org Proposals" ON public.proposals;
DROP POLICY IF EXISTS "org_security" ON public.proposals;
DROP POLICY IF EXISTS "Users can view their own organization's proposals" ON public.proposals;
DROP POLICY IF EXISTS "Users can insert their own organization's proposals" ON public.proposals;
DROP POLICY IF EXISTS "Users can update their own organization's proposals" ON public.proposals;
DROP POLICY IF EXISTS "Users can delete their own organization's proposals" ON public.proposals;
CREATE POLICY "org_access" ON public.proposals
FOR ALL TO authenticated
USING (organization_id = public.get_my_org_id());

-- Documents (RAG)
DROP POLICY IF EXISTS "Users view org documents" ON public.documents;
DROP POLICY IF EXISTS "Users insert org documents" ON public.documents;
DROP POLICY IF EXISTS "Users delete org documents" ON public.documents;
CREATE POLICY "org_access" ON public.documents
FOR ALL TO authenticated
USING (organization_id = public.get_my_org_id());

-- Proposal Templates
DROP POLICY IF EXISTS "Access Org Templates" ON public.proposal_templates;
CREATE POLICY "org_access" ON public.proposal_templates
FOR ALL TO authenticated
USING (organization_id = public.get_my_org_id());

-- Automation Rules
DROP POLICY IF EXISTS "Access Org Automations" ON public.automation_rules;
CREATE POLICY "org_access" ON public.automation_rules
FOR ALL TO authenticated
USING (organization_id = public.get_my_org_id());

-- Marketing Strategies
DROP POLICY IF EXISTS "Access Org Marketing" ON public.marketing_strategies;
CREATE POLICY "org_access" ON public.marketing_strategies
FOR ALL TO authenticated
USING (organization_id = public.get_my_org_id());

-- AI Operations
DROP POLICY IF EXISTS "Access Org AI Logs" ON public.ai_operations;
CREATE POLICY "org_access" ON public.ai_operations
FOR ALL TO authenticated
USING (organization_id = public.get_my_org_id());

-- 4. Grant permissions
GRANT EXECUTE ON FUNCTION public.get_my_org_id TO authenticated;

-- =========================================
-- VERIFICATION QUERY
-- =========================================
-- Run this to confirm all policies use get_my_org_id:

SELECT
    schemaname,
    tablename,
    policyname,
    CASE
        WHEN qual::text LIKE '%get_my_org_id%' THEN '✅ Unified'
        WHEN qual::text LIKE '%get_user_org%' THEN '❌ Old Function'
        ELSE '⚠️ Check Manual'
    END as status
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =========================================
-- ✅ SCRIPT COMPLETO
-- Resultado esperado: Todas as policies com "✅ Unified"
-- =========================================
