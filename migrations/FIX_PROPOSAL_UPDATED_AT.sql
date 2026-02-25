-- SCRIPT DE CORREÇÃO DEFINITIVA DA TABELA PROPOSALS
-- 1. Cria a tabela se ela realmente não existir no banco de dados
CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,

  -- Informações da Proposta
  title TEXT NOT NULL,
  description TEXT,
  template_id UUID,

  -- Itens da Proposta
  items JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Valores
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount DECIMAL(12,2) DEFAULT 0,
  tax DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,

  -- Status
  status TEXT NOT NULL DEFAULT 'draft',

  -- Validade
  valid_until DATE,

  -- Tracking
  sent_at TIMESTAMP WITH TIME ZONE,
  viewed_at TIMESTAMP WITH TIME ZONE,
  view_count INTEGER DEFAULT 0,
  accepted_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,

  -- Assinatura Digital
  signature_data JSONB,

  -- PDF
  pdf_url TEXT,
  pdf_generated_at TIMESTAMP WITH TIME ZONE,

  -- Metadados
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),

  -- Colunas do Pipeline
  stage_id UUID REFERENCES stages(id) ON DELETE SET NULL,
  pipeline_id UUID REFERENCES pipelines(id) ON DELETE SET NULL
);

-- 2. Cria os índices de performance
CREATE INDEX IF NOT EXISTS idx_proposals_organization ON proposals(organization_id);
CREATE INDEX IF NOT EXISTS idx_proposals_contact ON proposals(contact_id);
CREATE INDEX IF NOT EXISTS idx_proposals_deal ON proposals(deal_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_stage ON proposals(stage_id);
CREATE INDEX IF NOT EXISTS idx_proposals_pipeline ON proposals(pipeline_id);

-- 3. Configura a Segurança por Linha (RLS)
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view proposals from their organization" ON proposals;
CREATE POLICY "Users can view proposals from their organization"
  ON proposals FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert proposals for their organization" ON proposals;
CREATE POLICY "Users can insert proposals for their organization"
  ON proposals FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update proposals from their organization" ON proposals;
CREATE POLICY "Users can update proposals from their organization"
  ON proposals FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete proposals from their organization" ON proposals;
CREATE POLICY "Users can delete proposals from their organization"
  ON proposals FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- 4. Como fallback de segurança: Garante as colunas extras, caso a tabela já existisse
-- mas estivesse usando um modelo de dados muito antigo, sem essas colunas
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS stage_id UUID REFERENCES stages(id) ON DELETE SET NULL;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS pipeline_id UUID REFERENCES pipelines(id) ON DELETE SET NULL;

-- 5. Força o cache do Supabase/PostgREST a ver a nova tabela e/ou colunas imediatamente
NOTIFY pgrst, 'reload schema';
