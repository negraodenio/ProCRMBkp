-- Migration: Refactor Proposals for Pipeline & Add Products System

-- 1. Update Proposals to support independent pipeline movement
ALTER TABLE proposals
ADD COLUMN IF NOT EXISTS stage_id UUID REFERENCES stages(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS pipeline_id UUID REFERENCES pipelines(id) ON DELETE SET NULL;

-- 2. Create Deal Products table
CREATE TABLE IF NOT EXISTS deal_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  product_id UUID, -- Optional link to a global products table if it exists
  name TEXT NOT NULL,
  description TEXT,
  quantity DECIMAL(12,2) DEFAULT 1,
  unit_price DECIMAL(12,2) DEFAULT 0,
  total_price DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_proposals_stage ON proposals(stage_id);
CREATE INDEX IF NOT EXISTS idx_proposals_pipeline ON proposals(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_deal_products_deal ON deal_products(deal_id);

-- RLS for deal_products
ALTER TABLE deal_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view deal_products from their organization" ON deal_products;
CREATE POLICY "Users can view deal_products from their organization"
  ON deal_products FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert deal_products for their organization" ON deal_products;
CREATE POLICY "Users can insert deal_products for their organization"
  ON deal_products FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update deal_products from their organization" ON deal_products;
CREATE POLICY "Users can update deal_products from their organization"
  ON deal_products FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete deal_products from their organization" ON deal_products;
CREATE POLICY "Users can delete deal_products from their organization"
  ON deal_products FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );
