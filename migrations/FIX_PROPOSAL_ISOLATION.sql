-- Enable RLS on Proposals and Contacts
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to avoid duplicates
DROP POLICY IF EXISTS "Users can view their own organization's proposals" ON proposals;
DROP POLICY IF EXISTS "Users can insert their own organization's proposals" ON proposals;
DROP POLICY IF EXISTS "Users can update their own organization's proposals" ON proposals;
DROP POLICY IF EXISTS "Users can delete their own organization's proposals" ON proposals;

DROP POLICY IF EXISTS "Users can view their own organization's contacts" ON contacts;
DROP POLICY IF EXISTS "Users can insert their own organization's contacts" ON contacts;
DROP POLICY IF EXISTS "Users can update their own organization's contacts" ON contacts;
DROP POLICY IF EXISTS "Users can delete their own organization's contacts" ON contacts;

-- PROPOSALS POLICIES
CREATE POLICY "Users can view their own organization's proposals" 
ON proposals FOR SELECT 
USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert their own organization's proposals" 
ON proposals FOR INSERT 
WITH CHECK (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their own organization's proposals" 
ON proposals FOR UPDATE 
USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete their own organization's proposals" 
ON proposals FOR DELETE 
USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- CONTACTS POLICIES
CREATE POLICY "Users can view their own organization's contacts" 
ON contacts FOR SELECT 
USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert their own organization's contacts" 
ON contacts FOR INSERT 
WITH CHECK (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their own organization's contacts" 
ON contacts FOR UPDATE 
USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete their own organization's contacts" 
ON contacts FOR DELETE 
USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
