-- =====================================================
-- SISTEMA DE AUTOMAÇÕES (WORKFLOWS)
-- =====================================================

-- Tabela principal de workflows
CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN (
    'lead_created',
    'no_response',
    'stage_changed',
    'score_changed',
    'scheduled'
  )),
  trigger_config JSONB DEFAULT '{}',
  actions JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- Tabela de execuções de workflows
CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'pending')),
  executed_at TIMESTAMPTZ DEFAULT NOW(),
  result JSONB DEFAULT '{}',
  error_message TEXT
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_workflows_org ON workflows(organization_id, is_active);
CREATE INDEX IF NOT EXISTS idx_workflows_trigger ON workflows(trigger_type, is_active);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow ON workflow_executions(workflow_id, executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_contact ON workflow_executions(contact_id, executed_at DESC);

-- Comentários
COMMENT ON TABLE workflows IS 'Workflows de automação com triggers e ações';
COMMENT ON COLUMN workflows.trigger_type IS 'Tipo de gatilho: lead_created, no_response, stage_changed, score_changed, scheduled';
COMMENT ON COLUMN workflows.trigger_config IS 'Configuração do trigger: { days: 3, score_threshold: 70, stage_id: "uuid" }';
COMMENT ON COLUMN workflows.actions IS 'Array de ações: [{ type: "send_whatsapp", config: {...} }]';

COMMENT ON TABLE workflow_executions IS 'Log de execuções de workflows';
COMMENT ON COLUMN workflow_executions.result IS 'Resultado da execução: { actions_executed: 2, messages_sent: 1 }';

-- =====================================================
-- TABELA DE ALERTAS INTELIGENTES
-- =====================================================

CREATE TABLE IF NOT EXISTS smart_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'hot_lead',
    'no_contact',
    'pending_proposal',
    'sla_breach',
    'high_value_deal'
  )),
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT CHECK (severity IN ('info', 'warning', 'critical')),
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_alerts_org ON smart_alerts(organization_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_type ON smart_alerts(type, severity, created_at DESC);

-- Comentários
COMMENT ON TABLE smart_alerts IS 'Alertas inteligentes gerados automaticamente';
COMMENT ON COLUMN smart_alerts.type IS 'Tipo: hot_lead, no_contact, pending_proposal, sla_breach, high_value_deal';

-- =====================================================
-- RLS (Row Level Security)
-- =====================================================

ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_alerts ENABLE ROW LEVEL SECURITY;

-- Políticas: Usuários só veem dados da própria organização
CREATE POLICY workflows_org_policy ON workflows
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY workflow_executions_org_policy ON workflow_executions
  FOR ALL
  USING (
    workflow_id IN (
      SELECT id FROM workflows WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY smart_alerts_org_policy ON smart_alerts
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- =====================================================
-- FUNÇÃO: Verificar Leads Sem Resposta
-- =====================================================

CREATE OR REPLACE FUNCTION check_no_response_leads()
RETURNS void AS $$
DECLARE
  workflow RECORD;
  lead RECORD;
  days_threshold INTEGER;
BEGIN
  -- Para cada workflow ativo de "no_response"
  FOR workflow IN
    SELECT * FROM workflows
    WHERE trigger_type = 'no_response' AND is_active = true
  LOOP
    days_threshold := (workflow.trigger_config->>'days')::INTEGER;

    -- Buscar leads sem contato há X dias
    FOR lead IN
      SELECT c.* FROM contacts c
      LEFT JOIN conversation_history ch ON ch.contact_id = c.id
      WHERE c.organization_id = workflow.organization_id
        AND c.type = 'lead'
        AND (
          ch.id IS NULL OR
          ch.created_at < NOW() - (days_threshold || ' days')::INTERVAL
        )
      GROUP BY c.id
    LOOP
      -- Registrar execução (será processada por job)
      INSERT INTO workflow_executions (
        workflow_id,
        contact_id,
        status
      ) VALUES (
        workflow.id,
        lead.id,
        'pending'
      );
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================

SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN ('workflows', 'workflow_executions', 'smart_alerts')
ORDER BY table_name;
