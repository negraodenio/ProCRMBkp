-- =========================================
-- PRODUCTION HARDENING - SCRIPT 2
-- Webhook Audit Logs
-- =========================================
-- Tempo estimado: 5 minutos
-- Prioridade: ALTA (observabilidade)

-- 1. Create webhook_logs table
CREATE TABLE IF NOT EXISTS public.webhook_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Organization context
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    instance_name TEXT NOT NULL,

    -- Event details
    event_type TEXT NOT NULL,
    phone TEXT,
    direction TEXT CHECK (direction IN ('inbound', 'outbound')),

    -- Status
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    http_status INTEGER,

    -- Performance
    processing_time_ms INTEGER,

    -- Additional context
    metadata JSONB,

    -- Indexes for fast queries
    CONSTRAINT webhook_logs_valid_org CHECK (organization_id IS NOT NULL)
);

-- 2. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_webhook_logs_org_created
    ON public.webhook_logs(organization_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_instance
    ON public.webhook_logs(instance_name);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_success
    ON public.webhook_logs(success)
    WHERE success = false; -- Partial index for failures only

CREATE INDEX IF NOT EXISTS idx_webhook_logs_event_type
    ON public.webhook_logs(event_type);

-- 3. Enable RLS
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policy (users see only their org's logs)
CREATE POLICY "org_access" ON public.webhook_logs
FOR SELECT TO authenticated
USING (organization_id = public.get_my_org_id());

-- 5. Grant permissions
GRANT SELECT ON public.webhook_logs TO authenticated;
GRANT INSERT ON public.webhook_logs TO service_role; -- Only service role can insert

-- 6. Create helper view for easy monitoring
CREATE OR REPLACE VIEW public.webhook_stats AS
SELECT
    organization_id,
    instance_name,
    DATE_TRUNC('hour', created_at) as hour,
    COUNT(*) as total_webhooks,
    COUNT(*) FILTER (WHERE success) as successful,
    COUNT(*) FILTER (WHERE NOT success) as failed,
    AVG(processing_time_ms) as avg_processing_ms,
    MAX(processing_time_ms) as max_processing_ms
FROM public.webhook_logs
GROUP BY organization_id, instance_name, DATE_TRUNC('hour', created_at)
ORDER BY hour DESC;

-- Grant view access
GRANT SELECT ON public.webhook_stats TO authenticated;

-- =========================================
-- VERIFICATION QUERIES
-- =========================================

-- Check table created successfully
SELECT
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'webhook_logs') as column_count
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'webhook_logs';

-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'webhook_logs';

-- Check RLS enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'webhook_logs';

-- =========================================
-- USAGE EXAMPLE
-- =========================================

-- Query recent webhook activity
/*
SELECT
    created_at,
    instance_name,
    event_type,
    success,
    processing_time_ms,
    error_message
FROM webhook_logs
WHERE organization_id = 'your-org-id'
ORDER BY created_at DESC
LIMIT 50;
*/

-- Check failure rate
/*
SELECT
    DATE(created_at) as date,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE success) as successful,
    ROUND(100.0 * COUNT(*) FILTER (WHERE success) / COUNT(*), 2) as success_rate
FROM webhook_logs
WHERE organization_id = 'your-org-id'
AND created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
*/

-- =========================================
-- ✅ SCRIPT COMPLETO
-- Webhook logging pronto para produção
-- =========================================
