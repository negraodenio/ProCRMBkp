-- ==============================================================================
-- RAG SETUP (Knowledge Base)
-- Run this to enable the AI Knowledge Base feature using pgvector.
-- Dimensions: 2560 (Qwen-4B)
-- ==============================================================================

-- 1. Enable Vector Extension
create extension if not exists vector;

-- 2. Documents Table
create table if not exists public.documents (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  content text,
  metadata jsonb,
  embedding vector(2560), -- Matches VECTOR_CONFIG.dimensions
  created_at timestamptz default now()
);

-- 3. Security (RLS)
alter table public.documents enable row level security;

-- Drop policies if they exist to avoid 42710 error
drop policy if exists "Users view org documents" on public.documents;
drop policy if exists "Users insert org documents" on public.documents;
drop policy if exists "Users delete org documents" on public.documents;

create policy "Users view org documents" on public.documents
for all using (
  organization_id in (select organization_id from public.profiles where id = auth.uid())
);

create policy "Users insert org documents" on public.documents
for insert with check (
  organization_id in (select organization_id from public.profiles where id = auth.uid())
);

create policy "Users delete org documents" on public.documents
for delete using (
  organization_id in (select organization_id from public.profiles where id = auth.uid())
);

-- 4. Performance (Index)
-- HNSW has a limit of 2000 dimensions in some pgvector versions.
-- Since Qwen-4B uses 2560, we rely on sequential scan (very fast for manuals < 10k chunks)
-- or you can use IVFFlat if your dataset grows very large.
-- CREATE INDEX ON public.documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- 5. Match Function (Harden Security and check org_id)
-- Drop first to avoid "cannot change return type" error
drop function if exists match_documents(vector, float, int, uuid);
drop function if exists match_documents(vector, double precision, int, uuid);

create or replace function match_documents (
  query_embedding vector(2560),
  match_threshold float,
  match_count int,
  org_id uuid
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
security invoker -- Ensures it respects RLS
as $body$
begin
  return query
  select
    d.id,
    d.content,
    d.metadata,
    1 - (d.embedding <=> query_embedding) as similarity
  from public.documents d
  where d.organization_id = org_id
    and 1 - (d.embedding <=> query_embedding) > match_threshold
  order by (d.embedding <=> query_embedding) asc
  limit match_count;
end;
$body$;
