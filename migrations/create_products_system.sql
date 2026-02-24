-- 1. Global Products Table
create table if not exists public.products (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  name text not null,
  description text,
  base_price numeric(12,2) default 0,
  category text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 2. Deal Products (Links products to specific opportunities)
create table if not exists public.deal_products (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  deal_id uuid references public.deals(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete restrict not null,
  quantity numeric(10,2) default 1,
  unit_price numeric(12,2) not null,
  discount numeric(12,2) default 0,
  total_price numeric(12,2) not null,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.products enable row level security;
alter table public.deal_products enable row level security;

-- Policies
create policy "Users can view products from their organization"
  on public.products for select using (
    organization_id in (select organization_id from public.profiles where id = auth.uid())
  );

create policy "Users can manage products in their organization"
  on public.products for all using (
    organization_id in (select organization_id from public.profiles where id = auth.uid())
  );

create policy "Users can manage deal products in their organization"
  on public.deal_products for all using (
    organization_id in (select organization_id from public.profiles where id = auth.uid())
  );
