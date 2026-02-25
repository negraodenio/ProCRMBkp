-- Migration: Add company_id to proposals for B2B/B2C support
-- This allows deals to optionally be linked to a company, satisfying the CRM Tripod rules.

ALTER TABLE proposals
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_proposals_company ON proposals(company_id);
