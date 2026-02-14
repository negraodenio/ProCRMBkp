import { createOrgScopedServiceClient } from "@/lib/supabase/service-scoped";
import { generateEmbedding } from "@/lib/ai/client";

/**
 * Recupera o contexto do manual escopado por organização e query.
 */
export async function retrieveContextText(params: {
  orgId: string;
  query: string;
  match_threshold?: number;
  match_count?: number;
}) {
  const serviceClient = createOrgScopedServiceClient(params.orgId);

  const embedding = await generateEmbedding(params.query);

  const { data: chunks, error } = await serviceClient.rpc("match_documents", {
    query_embedding: embedding,
    match_threshold: params.match_threshold ?? 0.5,
    match_count: params.match_count ?? 5,
    org_id: params.orgId
  });

  if (error) {
     console.error("[Retrieve] RPC match_documents failed:", error.message);
     throw error;
  }

  const contextText = chunks?.length
    ? chunks.map((c: any) => {
        const source = c.metadata?.document_name || c.metadata?.source || "Manual";
        return `[Fonte: ${source}]\n${c.content}`;
      }).join("\n\n---\n\n")
    : "";

  return { contextText, chunks: chunks ?? [] };
}
