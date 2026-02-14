"use server";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { generateEmbedding } from "@/lib/ai/client";
import { VECTOR_CONFIG } from "@/lib/ai/config";
import { splitTextWithOverlap } from "@/lib/ai/chunking";
import { canonicalizeTxt } from "@/lib/rag/canonicalize";
import { scoreDocument } from "@/lib/rag/scoring";
import { revalidatePath } from "next/cache";

export async function uploadDocument(formData: FormData) {
    const supabase = await createClient();

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: "Unauthorized" };
    }

    const { data: profile } = await supabase.from("profiles").select("organization_id").eq("id", user.id).single();
    if (!profile?.organization_id) {
        return { error: "Organization not found" };
    }

    const file = formData.get("file") as File;
    if (!file) {
        return { error: "No file provided" };
    }

    // 2. Extract Text
    let textContent = "";

    try {
        if (
            file.type === "text/plain" ||
            file.type === "text/markdown" ||
            file.name.endsWith(".txt") ||
            file.name.endsWith(".md")
        ) {
            const buffer = await file.arrayBuffer();
            const decoder = new TextDecoder("utf-8");
            textContent = decoder.decode(buffer);
        } else {
            console.error(`[Upload] Unsupported File: Type=${file.type}, Name=${file.name}`);
            return { error: `Arquivo inválido. Por favor, envie apenas arquivos de texto (.txt ou .md).` };
        }
    } catch (error: any) {
        return { error: "Error parsing file: " + error.message };
    }

    if (!textContent || textContent.length < 10) {
        return { error: "File content is empty or too short." };
    }

    // --- RAG V3 PIPELINE START ---
    console.log(`[Upload] Starting V3 Pipeline for ${file.name}...`);

    // 1. CANONICALIZE
    const canonicalResult = canonicalizeTxt(textContent, file.name);

    // 2. SCORE
    const scoringResult = scoreDocument(canonicalResult);
    console.log(`[Upload] Score: ${scoringResult.score} (${scoringResult.status})`);

    // 3. SAVE REPORT
    const { error: reportError } = await supabase.from("training_reports").insert({
        organization_id: profile.organization_id,
        filename: file.name,
        score: scoringResult.score,
        status: scoringResult.status,
        stats: canonicalResult.report.stats,
        flags: scoringResult.flags,
        report_json: { canonical: canonicalResult.report, scoring: scoringResult.breakdown }
    });

    if (reportError) console.error("[Upload] Failed to save report:", reportError);

    // 4. DECISION GATE
    // We always use the canonical text as it's cleaner, but the score tells us if it's "Quarantine" quality.
    const textToIndex = canonicalResult.canonical_text;

    // --- RAG V3 PIPELINE END ---

    // 3. Chunking (Smart Sliding Window)
    // Uses 1000 chars with 200 overlap to keep context across boundaries
    const chunks = splitTextWithOverlap(textToIndex, { chunkSize: 1000, overlap: 200 });

    let insertedCount = 0;

    // 4. Generate Embeddings & Store (Batch Processing)
    try {
        const batchSize = 5;
        for (let i = 0; i < chunks.length; i += batchSize) {
            const batch = chunks.slice(i, i + batchSize);

            await Promise.all(batch.map(async (chunk) => {
                const safeChunk = chunk.substring(0, VECTOR_CONFIG.maxChunkLength);
                const enrichedContent = `[Documento: ${file.name}]\n${safeChunk}`;

                const embedding = await generateEmbedding(enrichedContent);

                const { error: insertError } = await supabase.from("documents").insert({
                    organization_id: profile.organization_id,
                    content: enrichedContent,
                    metadata: {
                        filename: file.name,
                        size: file.size,
                        chunk_strategy: "sliding_window_v1"
                    },
                    embedding: embedding
                });

                if (insertError) {
                    console.error("Insert Error:", insertError);
                } else {
                    insertedCount++;
                }
            }));
        }
    } catch (error: any) {
        return { error: "Embedding/Save Error: " + error.message };
    }

    revalidatePath("/whatsapp/knowledge");
    return { success: true, count: insertedCount };
}

export async function deleteDocument(filename: string) {
    // 1. Auth Check (Always use user client for session validation)
    const userClient = await createClient();
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { data: profile } = await userClient.from("profiles").select("organization_id").eq("id", user.id).single();
    if (!profile?.organization_id) return { error: "Organization not found" };

    console.log(`[Delete] HARD DELETE for "${filename}" in org: ${profile.organization_id}`);

    // 2. Admin Client for Deletion (Bypass RLS to be sure)
    const adminClient = createServiceRoleClient();

    // Delete Chunks (JSONB contains is the most robust way)
    const { error: deleteError, count } = await adminClient
        .from("documents")
        .delete({ count: 'exact' })
        .eq("organization_id", profile.organization_id)
        .contains("metadata", { filename: filename });

    if (deleteError) {
        console.error("[Delete] Error deleting documents:", deleteError);
        return { error: deleteError.message };
    }

    console.log(`[Delete] Successfully removed ${count} chunks for "${filename}"`);

    // 3. Delete from 'training_reports'
    await adminClient
        .from("training_reports")
        .delete()
        .eq("organization_id", profile.organization_id)
        .eq("filename", filename);

    revalidatePath("/whatsapp/knowledge");
    return { success: true };
}

export async function purgeAllDocuments() {
    // 1. Auth Check
    const userClient = await createClient();
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { data: profile } = await userClient.from("profiles").select("organization_id").eq("id", user.id).single();
    if (!profile?.organization_id) return { error: "Organization not found" };

    console.log(`[Purge] FORCING FULL PURGE for org: ${profile.organization_id}`);

    // 2. Admin Client for Purge
    const adminClient = createServiceRoleClient();

    const { error: deleteError, count } = await adminClient
        .from("documents")
        .delete({ count: 'exact' })
        .eq("organization_id", profile.organization_id);

    if (deleteError) {
        console.error("[Purge] Error purging documents:", deleteError);
        return { error: deleteError.message };
    }

    console.log(`[Purge] Successfully removed ALL ${count} chunks for org ${profile.organization_id}`);

    await adminClient
        .from("training_reports")
        .delete()
        .eq("organization_id", profile.organization_id);

    revalidatePath("/whatsapp/knowledge");
    return { success: true };
}

export async function updateBotSettings(organizationId: string, settings: any) {
    const supabase = await createClient();

    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("Unauthorized");
    }

    // Verify user belongs to this organization
    const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.id)
        .single();

    if (profile?.organization_id !== organizationId) {
        throw new Error("Unauthorized to modify this organization");
    }

    // Update bot_settings
    const { error } = await supabase
        .from("organizations")
        .update({ bot_settings: settings })
        .eq("id", organizationId);

    if (error) {
        console.error("Error updating bot settings:", error);
        throw new Error("Failed to save settings");
    }

    revalidatePath("/whatsapp/knowledge");
    return { success: true };
}

export async function updateWhatsAppProfile(organizationId: string, avatarUrl: string) {
    const supabase = await createClient();

    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("Unauthorized");
    }

    // Verify user belongs to this organization
    const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.id)
        .single();

    if (profile?.organization_id !== organizationId) {
        throw new Error("Unauthorized to modify this organization");
    }

    const instanceName = `bot-${organizationId}`;

    try {
        await import("@/services/evolution").then(mod => mod.EvolutionService.updateProfilePicture(instanceName, avatarUrl));
        return { success: true };
    } catch (error: any) {
        console.error("Error updating WhatsApp profile:", error);
        return { error: error.message || "Failed to update WhatsApp profile" };
    }
}
