-- Migration to create bot_interactions table for monitoring and hardening
-- Date: 2026-02-24

CREATE TABLE IF NOT EXISTS bot_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    contact_phone TEXT,
    user_message TEXT,
    bot_response TEXT,
    model_used TEXT,
    reason TEXT,
    processing_time_ms INTEGER,
    status TEXT DEFAULT 'success', -- 'success', 'error', 'handoff'
    error_details TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE bot_interactions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view bot interactions for their organization"
    ON bot_interactions FOR SELECT
    USING (organization_id IN (SELECT id FROM organizations));

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_bot_interactions_org_id ON bot_interactions(organization_id);
CREATE INDEX IF NOT EXISTS idx_bot_interactions_created_at ON bot_interactions(created_at);
