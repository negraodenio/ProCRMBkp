-- Tabela de Propostas Comerciais
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
  -- Exemplo: [{ "name": "Produto X", "quantity": 2, "unit_price": 100, "total": 200 }]

  -- Valores
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount DECIMAL(12,2) DEFAULT 0,
  tax DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,

  -- Status
  status TEXT NOT NULL DEFAULT 'draft',
  -- draft, sent, viewed, accepted, rejected, expired

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
  -- { "signed_by": "Nome", "signed_at": "2026-02-09", "ip": "...", "signature_image": "..." }

  -- PDF
  pdf_url TEXT,
  pdf_generated_at TIMESTAMP WITH TIME ZONE,

  -- Metadados
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- Tabela de Templates de Proposta
CREATE TABLE IF NOT EXISTS proposal_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,

  -- Estrutura do Template
  header_html TEXT,
  footer_html TEXT,
  terms_and_conditions TEXT,

  -- Configurações
  default_valid_days INTEGER DEFAULT 30,
  require_signature BOOLEAN DEFAULT false,

  -- Estilo
  primary_color TEXT DEFAULT '#3b82f6',
  logo_url TEXT,

  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_proposals_organization ON proposals(organization_id);
CREATE INDEX IF NOT EXISTS idx_proposals_contact ON proposals(contact_id);
CREATE INDEX IF NOT EXISTS idx_proposals_deal ON proposals(deal_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposal_templates_organization ON proposal_templates(organization_id);

-- RLS Policies
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_templates ENABLE ROW LEVEL SECURITY;

-- Proposals: usuários podem ver/editar propostas da sua organização
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

-- Proposal Templates: mesmas políticas
DROP POLICY IF EXISTS "Users can view templates from their organization" ON proposal_templates;
CREATE POLICY "Users can view templates from their organization"
  ON proposal_templates FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert templates for their organization" ON proposal_templates;
CREATE POLICY "Users can insert templates for their organization"
  ON proposal_templates FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update templates from their organization" ON proposal_templates;
CREATE POLICY "Users can update templates from their organization"
  ON proposal_templates FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete templates from their organization" ON proposal_templates;
CREATE POLICY "Users can delete templates from their organization"
  ON proposal_templates FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_proposals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS proposals_updated_at ON proposals;
CREATE TRIGGER proposals_updated_at
  BEFORE UPDATE ON proposals
  FOR EACH ROW
  EXECUTE FUNCTION update_proposals_updated_at();

DROP TRIGGER IF EXISTS proposal_templates_updated_at ON proposal_templates;
CREATE TRIGGER proposal_templates_updated_at
  BEFORE UPDATE ON proposal_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_proposals_updated_at();
