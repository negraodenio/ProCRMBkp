-- =========================================
-- CRITICAL: RUN THIS IN SUPABASE DASHBOARD
-- SQL Editor > New Query > Paste and Run
-- =========================================

-- Add notes column to deals table
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.deals.notes IS 'Notas e observações internas sobre o negócio/deal';

-- Verify the column was created
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'deals' AND column_name = 'notes';
