-- ==============================================================================
-- CHAT & WHATSAPP SCHEMA
-- Run this to enable the Conversations module.
-- ==============================================================================

-- 1. CONVERSATIONS (Sessions)
create table if not exists public.conversations (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  
  -- The remote contact (Client)
  contact_phone text not null, -- Normalized phone number (e.g. 5511999999999)
  contact_name text,
  contact_avatar text,
  
  -- Metadata
  last_message_content text,
  last_message_at timestamptz default now(),
  unread_count integer default 0,
  
  -- State
  status text default 'open', -- open, resolved, snoozed
  assigned_to uuid references auth.users, -- Agent handling the chat
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for fast sorting by date (Inbox view)
create index if not exists idx_conversations_org_last_msg 
on public.conversations(organization_id, last_message_at desc);

-- 2. MESSAGES (History)
create table if not exists public.messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  organization_id uuid references public.organizations(id) not null, -- Denormalized for RLS efficiency
  
  content text,
  media_url text,
  media_type text, -- image, video, document, audio
  
  direction text not null check (direction in ('inbound', 'outbound')),
  status text default 'sent', -- sent, delivered, read, failed
  
  -- Evolution API Reference
  evolution_message_id text,
  
  created_at timestamptz default now()
);

-- 3. TAGS (Etiquetas)
create table if not exists public.tags (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  name text not null,
  color text default '#94a3b8',
  created_at timestamptz default now()
);

-- 4. CONVERSATION_TAGS (Many-to-Many)
create table if not exists public.conversation_tags (
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  tag_id uuid references public.tags(id) on delete cascade not null,
  primary key (conversation_id, tag_id)
);

-- ==============================================================================
-- SECURITY (RLS)
-- ==============================================================================
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.tags enable row level security;
alter table public.conversation_tags enable row level security;

-- Conversations
create policy "Users view org conversations" on public.conversations
for all using (
  organization_id in (select organization_id from public.profiles where id = auth.uid())
);

-- Messages
create policy "Users view org messages" on public.messages
for all using (
  organization_id in (select organization_id from public.profiles where id = auth.uid())
);

-- Tags
create policy "Users view org tags" on public.tags
for all using (
  organization_id in (select organization_id from public.profiles where id = auth.uid())
);

-- Conversation Tags
create policy "Users view org conversation tags" on public.conversation_tags
for all using (
  exists (
    select 1 from public.conversations c
    where c.id = conversation_tags.conversation_id
    and c.organization_id in (select organization_id from public.profiles where id = auth.uid())
  )
);
