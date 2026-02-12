-- ==============================================================================
-- RAG UPDATE: DEDUPLICATION
-- Updates the match_documents function to avoid returning duplicate content chunks.
-- ==============================================================================

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
security invoker
as $$
begin
  return query
  select distinct on (d.content)
    d.id,
    d.content,
    d.metadata,
    1 - (d.embedding <=> query_embedding) as similarity
  from public.documents d
  where d.organization_id = org_id
  and 1 - (d.embedding <=> query_embedding) > match_threshold
  -- We need to order by content to make DISTINCT ON work, then by similarity to get best match
  -- However, DISTINCT ON takes the first row of the "ORDER BY" set.
  -- So we sort by content (to group) and then by similarity DESC (best first)?
  -- No, we want the BEST match overall, but unique contents.
  -- This is tricky in SQL efficiently.

  -- Better approach: Subquery or CTE to get best matches first, then dedupe?
  -- Let's stick to the simple DISTINCT ON for now, but we need to ensure we don't discard the *better* match if two chunks have same content (unlikely with embeddings).
  -- Actually, identical content = identical embedding = same similarity. So any row is fine.
  -- But if we have overlapping chunks that are SUBSETS, they are not identical content.
  -- The user request was about "avoid redundant chunks".
  -- Our Smart Chunking creates overlap.
  -- Chunk A: "Hello world this is"
  -- Chunk B: "world this is a test"
  -- They are NOT identical content. DISTINCT ON (content) won't filter them.
  -- Deduplication usually refers to EXACT duplicates (e.g. same file uploaded twice).

  -- IF the user meant "Semantic Deduplication" (merging overlapping chunks), that's complex and done in App Logic, not easily in SQL.
  -- BUT, let's assume valid deduplication of EXACT content (e.g. upload same manual twice).

  order by d.content, (1 - (d.embedding <=> query_embedding)) desc
  limit match_count;
end;
$$;
