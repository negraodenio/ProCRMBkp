-- ==============================================================================
-- HARDENING: CRM TRIPOD - COMPANIES (ACCOUNTS)
-- ==============================================================================

-- 1. CREATE COMPANIES TABLE
CREATE TABLE IF NOT EXISTS public.companies (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id uuid REFERENCES public.organizations(id) NOT NULL,

    -- Basic Info (Matches Image 3)
    name text NOT NULL,
    segment text,
    url text,
    summary text,

    -- Location & Contact
    address text,
    neighborhood text,
    zip_code text, -- CEP
    city text,
    state text,
    phone text,

    -- Metadata
    owner_id uuid REFERENCES auth.users,
    status text DEFAULT 'active',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 2. ENABLE RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- 3. APPLY SECURITY POLICY (Scoped to Org)
DROP POLICY IF EXISTS "Access Org Companies" ON public.companies;
CREATE POLICY "Access Org Companies" ON public.companies
FOR ALL USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- 4. REFACTOR RELATIONSHIPS (Add company_id)
DO $$
BEGIN
    -- Add company_id to contacts
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'company_id') THEN
        ALTER TABLE public.contacts ADD COLUMN company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL;
    END IF;

    -- Add company_id to deals
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'company_id') THEN
        ALTER TABLE public.deals ADD COLUMN company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL;
    END IF;
END $$;
