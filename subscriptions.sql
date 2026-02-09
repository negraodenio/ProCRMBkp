-- ==============================================================================
-- SUBSCRIPTIONS SCHEMA (Stripe Integration)
-- Run this to enable SaaS features.
-- ==============================================================================

-- 1. Add Stripe Customer ID to Organizations (or Profiles, but usually Org pays)
alter table public.organizations add column if not exists stripe_customer_id text;
alter table public.organizations add column if not exists subscription_status text default 'free'; -- 'active', 'past_due', 'canceled', 'free'
alter table public.organizations add column if not exists subscription_plan text default 'basic'; -- 'pro', 'enterprise'

-- 2. SUBSCRIPTIONS TABLE (Optional if you only want basic status, but good for history)
create table if not exists public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,

  stripe_subscription_id text not null,
  stripe_price_id text,
  status text not null, -- 'active', 'trialing', etc.

  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Security (RLS)
alter table public.subscriptions enable row level security;

drop policy if exists "Users view org subscriptions" on public.subscriptions;

create policy "Users view org subscriptions" on public.subscriptions
for all using (
  organization_id in (select organization_id from public.profiles where id = auth.uid())
);
