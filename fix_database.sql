-- ============================================================================
-- CRM DATABASE FIX SCRIPT
-- ============================================================================
-- This script adds all missing columns and tables to make the CRM fully functional
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/isqnrlnpkmiqzcvlnndw/sql/new
-- ============================================================================

-- 1. FIX PROPOSALS TABLE
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS valid_until date;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS content jsonb;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS sent_at timestamptz;

-- 2. FIX DEALS TABLE  
ALTER TABLE deals ADD COLUMN IF NOT EXISTS pipeline_id uuid REFERENCES pipelines(id);
ALTER TABLE deals ADD COLUMN IF NOT EXISTS contact_name text;

-- 3. FIX CONTACTS TABLE
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS tags text[];
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS score integer DEFAULT 50;

-- 4. ADD CATEGORY COLUMN TO PROPOSAL_TEMPLATES
ALTER TABLE proposal_templates ADD COLUMN IF NOT EXISTS category text;

-- 5. CREATE REENGAGEMENT_STRATEGIES TABLE (if not exists)
CREATE TABLE IF NOT EXISTS public.reengagement_strategies (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id uuid REFERENCES public.organizations(id) NOT NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('pos_venda', 'reativacao')),
  trigger_type text DEFAULT 'days_after_purchase',
  trigger_days integer DEFAULT 30,
  message_template text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 6. DISABLE RLS FOR ALL TABLES (for testing)
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE pipelines DISABLE ROW LEVEL SECURITY;
ALTER TABLE stages DISABLE ROW LEVEL SECURITY;
ALTER TABLE deals DISABLE ROW LEVEL SECURITY;
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE proposals DISABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE reengagement_strategies DISABLE ROW LEVEL SECURITY;

-- 7. UPDATE EXISTING DEALS TO LINK TO PIPELINE
UPDATE deals d
SET pipeline_id = (
  SELECT p.id 
  FROM pipelines p 
  WHERE p.organization_id = d.organization_id 
  AND p.is_default = true 
  LIMIT 1
)
WHERE pipeline_id IS NULL;

-- 8. CREATE SAMPLE DATA FOR TESTING

-- Sample Templates
INSERT INTO proposal_templates (organization_id, name, category, content, is_active)
SELECT 
  '11111111-1111-1111-1111-111111111111',
  'Desenvolvimento de Website',
  'Tecnologia',
  jsonb_build_object(
    'description', 'Template para propostas de desenvolvimento web',
    'body', 'Proposta de desenvolvimento de website institucional com design responsivo',
    'estimatedValue', 5000,
    'estimatedDays', 30,
    'tags', ARRAY['web', 'desenvolvimento', 'design']
  ),
  true
WHERE NOT EXISTS (SELECT 1 FROM proposal_templates WHERE name = 'Desenvolvimento de Website');

-- Sample Automation Rule
INSERT INTO automation_rules (organization_id, name, trigger_type, from_status, to_status, action_type, message_template, is_active)
SELECT
  '11111111-1111-1111-1111-111111111111',
  'Boas-vindas ao Lead',
  'status_change',
  NULL,
  'new',
  'send_whatsapp',
  'Olá {nome}! Obrigado pelo interesse. Em breve entraremos em contato.',
  true
WHERE NOT EXISTS (SELECT 1 FROM automation_rules WHERE name = 'Boas-vindas ao Lead');

-- Sample Reengagement Strategy
INSERT INTO reengagement_strategies (organization_id, name, type, trigger_type, trigger_days, message_template, is_active)
SELECT
  '11111111-1111-1111-1111-111111111111',
  'Follow-up Pós-Venda',
  'pos_venda',
  'days_after_purchase',
  7,
  'Olá {nome}! Como está sua experiência com nosso produto/serviço?',
  true
WHERE NOT EXISTS (SELECT 1 FROM reengagement_strategies WHERE name = 'Follow-up Pós-Venda');

-- ============================================================================
-- VERIFICATION QUERIES (run these to check if everything is working)
-- ============================================================================

-- Check all tables exist
SELECT 
  table_name, 
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check data counts
SELECT 
  'organizations' as table_name, COUNT(*) as count FROM organizations
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'pipelines', COUNT(*) FROM pipelines
UNION ALL
SELECT 'stages', COUNT(*) FROM stages
UNION ALL
SELECT 'deals', COUNT(*) FROM deals
UNION ALL
SELECT 'contacts', COUNT(*) FROM contacts
UNION ALL
SELECT 'proposals', COUNT(*) FROM proposals
UNION ALL
SELECT 'proposal_templates', COUNT(*) FROM proposal_templates
UNION ALL
SELECT 'automation_rules', COUNT(*) FROM automation_rules
UNION ALL
SELECT 'reengagement_strategies', COUNT(*) FROM reengagement_strategies;
