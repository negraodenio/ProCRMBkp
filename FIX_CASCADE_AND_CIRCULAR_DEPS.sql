-- =========================================
-- 1. CORREÇÃO ESTRUTURAL DOS BOTS
-- =========================================

ALTER TABLE bots
DROP CONSTRAINT IF EXISTS bots_current_version_id_fkey;

ALTER TABLE bots
ADD CONSTRAINT bots_current_version_id_fkey
FOREIGN KEY (current_version_id)
REFERENCES bot_versions(id)
ON DELETE SET NULL;


-- =========================================
-- 2. CASCADE MULTI-TENANT (ORGANIZATIONS)
-- =========================================

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT
            tc.table_name,
            tc.constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu
            ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND ccu.table_name = 'organizations'
    LOOP
        EXECUTE format(
            'ALTER TABLE %I DROP CONSTRAINT %I;',
            r.table_name,
            r.constraint_name
        );
    END LOOP;
END $$;


-- Recriação com CASCADE
ALTER TABLE profiles
ADD CONSTRAINT profiles_organization_id_fkey
FOREIGN KEY (organization_id)
REFERENCES organizations(id)
ON DELETE CASCADE;

ALTER TABLE contacts
ADD CONSTRAINT contacts_organization_id_fkey
FOREIGN KEY (organization_id)
REFERENCES organizations(id)
ON DELETE CASCADE;

ALTER TABLE conversations
ADD CONSTRAINT conversations_organization_id_fkey
FOREIGN KEY (organization_id)
REFERENCES organizations(id)
ON DELETE CASCADE;

ALTER TABLE messages
ADD CONSTRAINT messages_organization_id_fkey
FOREIGN KEY (organization_id)
REFERENCES organizations(id)
ON DELETE CASCADE;

ALTER TABLE pipelines
ADD CONSTRAINT pipelines_organization_id_fkey
FOREIGN KEY (organization_id)
REFERENCES organizations(id)
ON DELETE CASCADE;

ALTER TABLE deals
ADD CONSTRAINT deals_organization_id_fkey
FOREIGN KEY (organization_id)
REFERENCES organizations(id)
ON DELETE CASCADE;

ALTER TABLE documents
ADD CONSTRAINT documents_organization_id_fkey
FOREIGN KEY (organization_id)
REFERENCES organizations(id)
ON DELETE CASCADE;

ALTER TABLE subscriptions
ADD CONSTRAINT subscriptions_organization_id_fkey
FOREIGN KEY (organization_id)
REFERENCES organizations(id)
ON DELETE CASCADE;

ALTER TABLE proposals
ADD CONSTRAINT proposals_organization_id_fkey
FOREIGN KEY (organization_id)
REFERENCES organizations(id)
ON DELETE CASCADE;

ALTER TABLE ai_operations
ADD CONSTRAINT ai_operations_organization_id_fkey
FOREIGN KEY (organization_id)
REFERENCES organizations(id)
ON DELETE CASCADE;

ALTER TABLE automation_rules
ADD CONSTRAINT automation_rules_organization_id_fkey
FOREIGN KEY (organization_id)
REFERENCES organizations(id)
ON DELETE CASCADE;


-- =========================================
-- 3. RAG: ÍNDICE VETORIAL (PERFORMANCE)
-- =========================================
-- ⚠️ HNSW Index limit is 2000 dimensions. Your vector is 2560.
-- SKIPPING Index creation to avoid Error 54000.
-- Performance will be slower but Functional.
-- CREATE INDEX IF NOT EXISTS documents_embedding_hnsw
-- ON documents
-- USING hnsw (embedding vector_cosine_ops);


-- =========================================
-- 4. STRIPE: IDEMPOTÊNCIA
-- =========================================

CREATE TABLE IF NOT EXISTS stripe_events (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT now()
);

-- índice extra para segurança
CREATE UNIQUE INDEX IF NOT EXISTS stripe_events_id_idx
ON stripe_events(id);
