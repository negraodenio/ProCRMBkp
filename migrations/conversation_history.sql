-- =====================================================
-- HISTÓRICO UNIFICADO DE CONVERSAS
-- =====================================================

-- Tabela principal de histórico de conversas
CREATE TABLE IF NOT EXISTS conversation_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('whatsapp', 'note', 'email', 'call', 'meeting', 'system')),
  direction TEXT CHECK (direction IN ('inbound', 'outbound', 'internal')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_conversation_contact ON conversation_history(contact_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_org ON conversation_history(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_type ON conversation_history(type, created_at DESC);

-- Comentários
COMMENT ON TABLE conversation_history IS 'Histórico unificado de todas as interações com leads/clientes';
COMMENT ON COLUMN conversation_history.type IS 'Tipo de interação: whatsapp, note, email, call, meeting, system';
COMMENT ON COLUMN conversation_history.direction IS 'Direção: inbound (recebida), outbound (enviada), internal (nota interna)';
COMMENT ON COLUMN conversation_history.metadata IS 'Dados adicionais: { from, to, attachments, phone, etc }';

-- =====================================================
-- RESUMOS GERADOS POR IA
-- =====================================================

CREATE TABLE IF NOT EXISTS conversation_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
  summary TEXT NOT NULL,
  key_points JSONB DEFAULT '[]',
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  next_action TEXT,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  messages_analyzed INTEGER DEFAULT 0
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_summary_contact ON conversation_summaries(contact_id, generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_summary_org ON conversation_summaries(organization_id, generated_at DESC);

-- Comentários
COMMENT ON TABLE conversation_summaries IS 'Resumos automáticos gerados por IA das conversas';
COMMENT ON COLUMN conversation_summaries.key_points IS 'Array de pontos-chave extraídos pela IA';
COMMENT ON COLUMN conversation_summaries.sentiment IS 'Sentimento geral: positive, neutral, negative';
COMMENT ON COLUMN conversation_summaries.confidence_score IS 'Confiança da IA no resumo (0-1)';

-- =====================================================
-- RLS (Row Level Security)
-- =====================================================

ALTER TABLE conversation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_summaries ENABLE ROW LEVEL SECURITY;

-- Política: Usuários só veem conversas da própria organização
CREATE POLICY conversation_history_org_policy ON conversation_history
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY conversation_summaries_org_policy ON conversation_summaries
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================

-- Verificar se as tabelas foram criadas
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN ('conversation_history', 'conversation_summaries')
ORDER BY table_name;
