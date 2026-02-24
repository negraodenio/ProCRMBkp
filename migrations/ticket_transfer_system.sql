-- =====================================================
-- DEPARTMENTS AND TICKET TRANSFER SYSTEM
-- =====================================================

-- 1. Create Departments Table
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT 'bg-slate-500',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for departments
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY departments_org_security ON departments
  FOR ALL TO authenticated
  USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- 2. Update Conversations Table for Ticket Mapping
ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id),
  ADD COLUMN IF NOT EXISTS last_transferred_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_transferred_by UUID REFERENCES profiles(id);

-- 3. Update Profiles Table to link users to Departments (Optional/Future but helpful)
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id);

-- 4. Initial Default Departments for testing (Optional)
-- INSERT INTO departments (organization_id, name, color)
-- SELECT id, 'Geral', 'bg-blue-500' FROM organizations;

COMMENT ON TABLE departments IS 'Sectors or queues for ticket assignment (Financeiro, Comercial, etc)';
COMMENT ON COLUMN conversations.assigned_to IS 'Current user handling the ticket';
COMMENT ON COLUMN conversations.department_id IS 'Current department handling the ticket';
