-- Adiciona a coluna ai_enabled à tabela de conversas
-- Valor padrão como 'true' para que conversas existentes continuem usando IA
ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS ai_enabled BOOLEAN DEFAULT true;

-- Comentário para documentação no Supabase
COMMENT ON COLUMN conversations.ai_enabled IS 'Indica se a IA está ativa para esta conversa específica';
