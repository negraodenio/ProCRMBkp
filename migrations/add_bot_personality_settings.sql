-- =========================================
-- BOT PERSONALITY SETTINGS
-- Migration para configurações de personalidade do bot
-- =========================================

-- Adicionar coluna bot_settings à tabela organizations
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS bot_settings JSONB DEFAULT '{
  "personality_preset": "friendly",
  "temperature": 0.6,
  "max_tokens": 200,
  "auto_reply_enabled": true,
  "language": "pt-BR",
  "use_emojis": true,
  "mention_name": true,
  "custom_instructions": "",
  "business_hours_only": false,
  "business_hours": {
    "start": "09:00",
    "end": "18:00",
    "timezone": "America/Sao_Paulo"
  }
}'::jsonb;

-- Criar index GIN para queries eficientes em JSONB
CREATE INDEX IF NOT EXISTS idx_organizations_bot_settings
ON organizations USING GIN (bot_settings);

-- Comentário para documentação
COMMENT ON COLUMN organizations.bot_settings IS 'Configurações de personalidade e comportamento do bot WhatsApp';
