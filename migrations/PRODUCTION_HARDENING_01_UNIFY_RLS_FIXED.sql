-- =========================================
-- PRODUCTION HARDENING - SCRIPT 1 (FIXED)
-- Unificação de Funções RLS
-- =========================================
-- Tempo estimado: 5 minutos
-- Prioridade: ALTA
-- FIX: Dropar policies ANTES de dropar a função

-- =========================================
-- PASSO 1: Dropar TODAS as policies antigas
-- =========================================
-- Isso remove as dependências nas funções

-- Organizations
DROP POLICY IF EXISTS "Users view own organization" ON public.organizations;
DROP POLICY IF EXISTS "org_security" ON public.organizations;
DROP POLICY IF EXISTS "org_access" ON public.organizations;

-- Profiles
DROP POLICY IF EXISTS "Users view coworkers" ON public.profiles;
DROP POLICY IF EXISTS "org_security" ON public.profiles;
DROP POLICY IF EXISTS "org_access" ON public.profiles;
DROP POLICY IF EXISTS "profiles_self_update" ON public.profiles;
DROP POLICY IF EXISTS "self_update" ON public.profiles;

-- Contacts
DROP POLICY IF EXISTS "Access Org Contacts" ON public.contacts;
DROP POLICY IF EXISTS "org_security" ON public.contacts;
DROP POLICY IF EXISTS "org_access" ON public.contacts;
DROP POLICY IF EXISTS "Users can view their own organization's contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can insert their own organization's contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can update their own organization's contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can delete their own organization's contacts" ON public.contacts;

-- Pipelines
DROP POLICY IF EXISTS "Access Org Pipelines" ON public.pipelines;
DROP POLICY IF EXISTS "org_security" ON public.pipelines;
DROP POLICY IF EXISTS "org_access" ON public.pipelines;

-- Stages
DROP POLICY IF EXISTS "Access Org Stages" ON public.stages;
DROP POLICY IF EXISTS "org_security" ON public.stages;
DROP POLICY IF EXISTS "org_access" ON public.stages;

-- Deals
DROP POLICY IF EXISTS "Access Org Deals" ON public.deals;
DROP POLICY IF EXISTS "org_security" ON public.deals;
DROP POLICY IF EXISTS "org_access" ON public.deals;

-- Conversations
DROP POLICY IF EXISTS "Access Org Conversations" ON public.conversations;
DROP POLICY IF EXISTS "org_security" ON public.conversations;
DROP POLICY IF EXISTS "org_access" ON public.conversations;

-- Messages
DROP POLICY IF EXISTS "Access Org Messages" ON public.messages;
DROP POLICY IF EXISTS "org_security" ON public.messages;
DROP POLICY IF EXISTS "org_access" ON public.messages;

-- Proposals
DROP POLICY IF EXISTS "Access Org Proposals" ON public.proposals;
DROP POLICY IF EXISTS "org_security" ON public.proposals;
DROP POLICY IF EXISTS "org_access" ON public.proposals;
DROP POLICY IF EXISTS "Users can view their own organization's proposals" ON public.proposals;
DROP POLICY IF EXISTS "Users can insert their own organization's proposals" ON public.proposals;
DROP POLICY IF EXISTS "Users can update their own organization's proposals" ON public.proposals;
DROP POLICY IF EXISTS "Users can delete their own organization's proposals" ON public.proposals;

-- Documents
DROP POLICY IF EXISTS "Users view org documents" ON public.documents;
DROP POLICY IF EXISTS "Users insert org documents" ON public.documents;
DROP POLICY IF EXISTS "Users delete org documents" ON public.documents;
DROP POLICY IF EXISTS "org_access" ON public.documents;

-- Proposal Templates
DROP POLICY IF EXISTS "Access Org Templates" ON public.proposal_templates;
DROP POLICY IF EXISTS "org_access" ON public.proposal_templates;

-- Automation Rules
DROP POLICY IF EXISTS "Access Org Automations" ON public.automation_rules;
DROP POLICY IF EXISTS "org_access" ON public.automation_rules;

-- Marketing Strategies
DROP POLICY IF EXISTS "Access Org Marketing" ON public.marketing_strategies;
DROP POLICY IF EXISTS "org_access" ON public.marketing_strategies;

-- AI Operations
DROP POLICY IF EXISTS "Access Org AI Logs" ON public.ai_operations;
DROP POLICY IF EXISTS "org_access" ON public.ai_operations;

-- =========================================
-- PASSO 2: Dropar função duplicada
-- =========================================
-- Agora não há mais dependências!
DROP FUNCTION IF EXISTS public.get_user_org();

-- =========================================
-- PASSO 3: Garantir função unificada
-- =========================================
CREATE OR REPLACE FUNCTION public.get_my_org_id()
RETURNS uuid AS $$
  SELECT organization_id
  FROM public.profiles
  WHERE id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =========================================
-- PASSO 4: Recriar policies com get_my_org_id
-- =========================================

-- Organizations
CREATE POLICY "org_access" ON public.organizations
FOR ALL TO authenticated
USING (id = public.get_my_org_id());

-- Profiles
CREATE POLICY "org_access" ON public.profiles
FOR SELECT TO authenticated
USING (organization_id = public.get_my_org_id());

CREATE POLICY "self_update" ON public.profiles
FOR UPDATE TO authenticated
USING (id = auth.uid());

-- Contacts
CREATE POLICY "org_access" ON public.contacts
FOR ALL TO authenticated
USING (organization_id = public.get_my_org_id());

-- Pipelines
CREATE POLICY "org_access" ON public.pipelines
FOR ALL TO authenticated
USING (organization_id = public.get_my_org_id());

-- Stages (indirect via pipeline)
CREATE POLICY "org_access" ON public.stages
FOR ALL TO authenticated
USING (
  pipeline_id IN (
    SELECT id FROM public.pipelines
    WHERE organization_id = public.get_my_org_id()
  )
);

-- Deals
CREATE POLICY "org_access" ON public.deals
FOR ALL TO authenticated
USING (organization_id = public.get_my_org_id());

-- Conversations
CREATE POLICY "org_access" ON public.conversations
FOR ALL TO authenticated
USING (organization_id = public.get_my_org_id());

-- Messages
CREATE POLICY "org_access" ON public.messages
FOR ALL TO authenticated
USING (organization_id = public.get_my_org_id());

-- Proposals
CREATE POLICY "org_access" ON public.proposals
FOR ALL TO authenticated
USING (organization_id = public.get_my_org_id());

-- Documents
CREATE POLICY "org_access" ON public.documents
FOR ALL TO authenticated
USING (organization_id = public.get_my_org_id());

-- Proposal Templates
CREATE POLICY "org_access" ON public.proposal_templates
FOR ALL TO authenticated
USING (organization_id = public.get_my_org_id());

-- Automation Rules
CREATE POLICY "org_access" ON public.automation_rules
FOR ALL TO authenticated
USING (organization_id = public.get_my_org_id());

-- Marketing Strategies
CREATE POLICY "org_access" ON public.marketing_strategies
FOR ALL TO authenticated
USING (organization_id = public.get_my_org_id());

-- AI Operations
CREATE POLICY "org_access" ON public.ai_operations
FOR ALL TO authenticated
USING (organization_id = public.get_my_org_id());

-- =========================================
-- PASSO 5: Grant permissions
-- =========================================
GRANT EXECUTE ON FUNCTION public.get_my_org_id TO authenticated;

-- =========================================
-- VERIFICAÇÃO
-- =========================================
-- Execute esta query para confirmar sucesso:
/*
SELECT
    schemaname,
    tablename,
    policyname,
    CASE
        WHEN qual::text LIKE '%get_my_org_id%' THEN '✅ Unified'
        WHEN qual::text LIKE '%get_user_org%' THEN '❌ Old Function'
        ELSE '⚠️ Other'
    END as status
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
*/

-- =========================================
-- ✅ SCRIPT COMPLETO E CORRIGIDO
-- Resultado esperado: Todas as policies com "✅ Unified"
-- =========================================
