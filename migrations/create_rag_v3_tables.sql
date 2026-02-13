-- ==============================================================================
-- RAG V3: TRAINING QUALITY TABLES
-- ==============================================================================

create table if not exists public.training_reports (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid not null references public.organizations(id),
  document_id uuid, -- Link opcional para o documento original, se persistido
  filename text,

  -- Métricas
  score int not null, -- 0 a 100
  status text not null, -- 'approved', 'needs_review', 'rejected'

  -- Detalhes (JSON)
  stats jsonb default '{}'::jsonb, -- { blocks_count, avg_chunk_size, ... }
  flags text[] default '{}', -- ['missing_fields', 'duplicate_content']
  report_json jsonb, -- Relatório completo para debug

  created_at timestamp with time zone default now()
);

-- Index para dashboard de qualidade
create index if not exists idx_training_reports_org_score
on public.training_reports(organization_id, score);
