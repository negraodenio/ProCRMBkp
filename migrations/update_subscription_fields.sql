-- Add usage tracking and extended billing fields to the organizations table
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS plan_started_at timestamptz;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS plan_expires_at timestamptz;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS ia_tools_used_month integer DEFAULT 0;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS ia_tools_reset_date timestamptz;
