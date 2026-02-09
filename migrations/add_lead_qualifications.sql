-- =========================================
-- LEAD QUALIFICATION SYSTEM (FASE 2)
-- =========================================

-- Criar tabela de qualificações
CREATE TABLE IF NOT EXISTS public.lead_qualifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Vinculação com o contato (Lead)
    contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE NOT NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,

    -- Respostas brutas para auditoria/edição
    responses JSONB NOT NULL DEFAULT '{}'::jsonb,

    -- Resultado final
    score INTEGER NOT NULL DEFAULT 0,
    classification TEXT NOT NULL DEFAULT 'Frio', -- Frio, Morno, Quente

    -- Notas adicionais do consultor
    notes TEXT,

    -- Garantir que cada lead tenha apenas uma qualificação principal ativa (ou histórico)
    CONSTRAINT lead_qualifications_score_range CHECK (score >= 0 AND score <= 100)
);

-- Habilitar RLS
ALTER TABLE public.lead_qualifications ENABLE ROW LEVEL SECURITY;

-- Política de Acesso (mesmo padrão unificado get_my_org_id)
CREATE POLICY "org_access" ON public.lead_qualifications
FOR ALL TO authenticated
USING (organization_id = public.get_my_org_id());

-- Indexes para busca rápida
CREATE INDEX IF NOT EXISTS idx_lead_qualifications_contact ON public.lead_qualifications(contact_id);
CREATE INDEX IF NOT EXISTS idx_lead_qualifications_org ON public.lead_qualifications(organization_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_lead_qualifications_updated_at
    BEFORE UPDATE ON public.lead_qualifications
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Comentários
COMMENT ON TABLE public.lead_qualifications IS 'Armazena os scores e respostas de qualificação de leads (Fase 2)';
