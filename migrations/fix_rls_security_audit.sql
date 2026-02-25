-- ==============================================================================
-- SECURITY AUDIT FIX & TABLE CREATION
-- Date: 2026-02-25
-- Description: Creates missing tables and fixes broken Row-Level Security policies.
-- ==============================================================================

-- 0. CREATE MISSING TABLES FIRST
-- This ensures the script runs successfully even if these tables were not yet applied

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
    status TEXT DEFAULT 'success',
    error_details TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.training_reports (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid not null references public.organizations(id),
  document_id uuid,
  filename text,
  score int not null,
  status text not null,
  stats jsonb default '{}'::jsonb,
  flags text[] default '{}',
  report_json jsonb,
  created_at timestamp with time zone default now()
);

CREATE TABLE IF NOT EXISTS public.queue (
  id uuid default gen_random_uuid() primary key,
  event_type text not null,
  payload jsonb not null,
  status text not null default 'pending',
  attempts int default 0,
  error_message text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

CREATE TABLE IF NOT EXISTS public.webhook_inbox (
  event_id text primary key,
  processed_at timestamp with time zone default now()
);


-- 1. FIX BOT INTERACTIONS RLS (Cross-Tenant Leakage)
ALTER TABLE bot_interactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view bot interactions for their organization" ON bot_interactions;
CREATE POLICY "Users can view bot interactions for their organization"
    ON bot_interactions FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    );

-- 2. ADD RLS TO RAG TRAINING REPORTS (Missing RLS)
ALTER TABLE training_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view training reports for their organization" ON training_reports;
CREATE POLICY "Users can view training reports for their organization"
    ON training_reports FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert training reports for their organization" ON training_reports;
CREATE POLICY "Users can insert training reports for their organization"
    ON training_reports FOR INSERT
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    );

-- 3. SECURE SYSTEM TABLES (Queue & Inbox) against client access
ALTER TABLE queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_inbox ENABLE ROW LEVEL SECURITY;
