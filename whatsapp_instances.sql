-- Create mapping table for WhatsApp Instances to Organizations
CREATE TABLE IF NOT EXISTS whatsapp_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instance_name TEXT UNIQUE NOT NULL,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    last_seen TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE whatsapp_instances ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view their organization instances" ON whatsapp_instances;
CREATE POLICY "Users can view their organization instances" ON whatsapp_instances
    FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
    ));

DROP POLICY IF EXISTS "Admins can manage instances" ON whatsapp_instances;
CREATE POLICY "Admins can manage instances" ON whatsapp_instances
    FOR ALL
    USING (organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
    ));

-- Index for performance in webhooks
CREATE INDEX IF NOT EXISTS idx_whatsapp_instances_name ON whatsapp_instances(instance_name);
