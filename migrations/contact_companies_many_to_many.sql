-- Migration: Create contact_companies many-to-many relationship
-- Description: Creates a junction table for contacts and companies to allow a single contact to be associated with multiple companies.

-- 1. Create the junction table
CREATE TABLE IF NOT EXISTS public.contact_companies (
    contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (contact_id, company_id)
);

-- 2. Add indexing for performance
CREATE INDEX IF NOT EXISTS idx_contact_companies_contact_id ON public.contact_companies(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_companies_company_id ON public.contact_companies(company_id);
CREATE INDEX IF NOT EXISTS idx_contact_companies_org ON public.contact_companies(organization_id);

-- 3. Enable RLS
ALTER TABLE public.contact_companies ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies
DROP POLICY IF EXISTS "Users can view contact_companies in their organization" ON public.contact_companies;
CREATE POLICY "Users can view contact_companies in their organization"
    ON public.contact_companies FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM public.profiles WHERE profiles.id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can insert contact_companies in their organization" ON public.contact_companies;
CREATE POLICY "Users can insert contact_companies in their organization"
    ON public.contact_companies FOR INSERT
    WITH CHECK (organization_id IN (
        SELECT organization_id FROM public.profiles WHERE profiles.id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can update contact_companies in their organization" ON public.contact_companies;
CREATE POLICY "Users can update contact_companies in their organization"
    ON public.contact_companies FOR UPDATE
    USING (organization_id IN (
        SELECT organization_id FROM public.profiles WHERE profiles.id = auth.uid()
    ))
    WITH CHECK (organization_id IN (
        SELECT organization_id FROM public.profiles WHERE profiles.id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can delete contact_companies in their organization" ON public.contact_companies;
CREATE POLICY "Users can delete contact_companies in their organization"
    ON public.contact_companies FOR DELETE
    USING (organization_id IN (
        SELECT organization_id FROM public.profiles WHERE profiles.id = auth.uid()
    ));

-- 5. Data Migration: Move existing relationships
-- This will take the existing 'company_id' from 'contacts' and insert them into the new table.
-- We set is_primary = true for these initial records.
INSERT INTO public.contact_companies (contact_id, company_id, organization_id, is_primary)
SELECT
    id as contact_id,
    company_id,
    organization_id,
    true as is_primary
FROM public.contacts
WHERE company_id IS NOT NULL
ON CONFLICT (contact_id, company_id) DO NOTHING;

-- Note: We are NOT dropping the company_id column from contacts immediately
-- to ensure backward compatibility while the frontend is being updated.
-- After the frontend fully transitions to using contact_companies,
-- a future migration can drop the company_id column.
