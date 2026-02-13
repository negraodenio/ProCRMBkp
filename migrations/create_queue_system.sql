-- ==============================================================================
-- PRODUCTION READINESS: QUEUE & IDEMPOTENCY
-- ==============================================================================

-- 1. Tabela de Fila (Queue)
-- Armazena os webhooks para processamento assíncrono (evita timeout no Vercel)
create table if not exists public.queue (
  id uuid default gen_random_uuid() primary key,
  event_type text not null,               -- Ex: 'whatsapp_message', 'stripe_event'
  payload jsonb not null,                 -- O JSON completo recebido
  status text not null default 'pending', -- 'pending', 'processing', 'completed', 'failed'
  attempts int default 0,                 -- Contador de retries
  error_message text,                     -- Log de erro se falhar
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Índice para recuperar tarefas pendentes rapidamente
create index if not exists idx_queue_status_created
on public.queue(status, created_at)
where status = 'pending';

-- 2. Tabela de Idempotência (Inbox)
-- Garante que a mesma mensagem do WhatsApp não seja processada duas vezes
-- (Webhooks operam em "at-least-once", duplicidade é normal)
create table if not exists public.webhook_inbox (
  event_id text primary key,              -- ID único da mensagem (remoteJid + id)
  processed_at timestamp with time zone default now()
);

-- Comentário de Implementação:
-- No webhook (route.ts), antes de processar, você fará:
-- INSERT INTO webhook_inbox (event_id) VALUES (...) ON CONFLICT DO NOTHING;
-- Se retornar (nada inserido), pare o processamento (já foi visto).
