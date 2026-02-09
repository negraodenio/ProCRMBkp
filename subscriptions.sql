-- 1. Adicionar colunas na tabela organizations
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'free';
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS subscription_plan text DEFAULT 'basic';

-- 2. Criar tabela subscriptions
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

-- 3. Habilitar RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 4. Remover policy antiga se existir (precisa ser em bloco separado no editor se der erro, mas aqui tentaremos direto)
DROP POLICY IF EXISTS "Users view org subscriptions" ON public.subscriptions;

-- 5. Criar nova policy
CREATE POLICY "Users view org subscriptions" ON public.subscriptions
FOR ALL USING (
  organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
);
