-- EMERGENCY AUDIT FIX: Proposals and Items Schema Alignment
-- Run this in your Supabase SQL Editor if you still see "Error creating/loading proposals"

-- 1. Ensure 'proposals' table has the 'total' and 'currency' columns
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS total DECIMAL(12,2) DEFAULT 0;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'BRL';

-- 2. Ensure 'proposal_items' table exists with correct column names
CREATE TABLE IF NOT EXISTS proposal_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  quantity DECIMAL(12,2) DEFAULT 1,
  unit_price DECIMAL(12,2) DEFAULT 0,
  total_price DECIMAL(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'BRL',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Update RLS for proposal_items (Safety Check)
ALTER TABLE proposal_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view proposal_items from their organization" ON proposal_items;
CREATE POLICY "Users can view proposal_items from their organization"
  ON proposal_items FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert proposal_items for their organization" ON proposal_items;
CREATE POLICY "Users can insert proposal_items for their organization"
  ON proposal_items FOR INSERT
  WITH CHECK (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can update proposal_items from their organization" ON proposal_items;
CREATE POLICY "Users can update proposal_items from their organization"
  ON proposal_items FOR UPDATE
  USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete proposal_items from their organization" ON proposal_items;
CREATE POLICY "Users can delete proposal_items from their organization"
  ON proposal_items FOR DELETE
  USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
