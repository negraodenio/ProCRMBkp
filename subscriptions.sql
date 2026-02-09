-- ==============================================================================
-- SUBSCRIPTIONS SCHEMA (Stripe Integration)
-- ==============================================================================

-- 1. Add Stripe Customer ID to Organizations
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'stripe_customer_id') THEN
        ALTER TABLE public.organizations ADD COLUMN stripe_customer_id text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'subscription_status') THEN
        ALTER TABLE public.organizations ADD COLUMN subscription_status text DEFAULT 'free';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'subscription_plan') THEN
        ALTER TABLE public.organizations ADD COLUMN subscription_plan text DEFAULT 'basic';
    END IF;
END $$;

-- 2. SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id uuid REFERENCES public.organizations(id) NOT NULL,

  stripe_subscription_id text NOT NULL,
  stripe_price_id text,
  status text NOT NULL,

  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Security (RLS)
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policy to avoid conflict
DROP POLICY IF EXISTS "Users view org subscriptions" ON public.subscriptions;

-- Create policy
CREATE POLICY "Users view org subscriptions" ON public.subscriptions
FOR ALL USING (
  organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
);
