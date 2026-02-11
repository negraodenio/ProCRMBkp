"use server";

import { createClient } from "@/lib/supabase/server";
import { generateEmbedding } from "@/lib/ai/client";
import { VECTOR_CONFIG } from "@/lib/ai/config";
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
        if (file.type === "application/pdf") {
            // We need pdf-parse. Since we can't auto-install, we try-catch import or use a placeholder if missing
            // Ideally this should be:
            /*
            const pdf = require('pdf-parse');
            const buffer = Buffer.from(await file.arrayBuffer());
            const data = await pdf(buffer);
            textContent = data.text;
            */
            // For now, let's implement the logic assuming pdf-parse will be available.
            // If it fails, we return a specific error telling user to install it.
            try {
                const pdf = require('pdf-parse');
                const buffer = Buffer.from(await file.arrayBuffer());
                const data = await pdf(buffer);
                textContent = data.text;
            } catch (e) {
                console.error("PDF Parse Error:", e);
                return { error: "Missing dependency 'pdf-parse'. Please run: npm install pdf-parse" };
            }

        } else if (
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
            return { error: `Unsupported file type (${file.type}). Only PDF and TXT are supported.` };
        }
    } catch (error: any) {
        return { error: "Error parsing file: " + error.message };
    }

    if (!textContent || textContent.length < 10) {
        return { error: "File content is empty or too short." };
    }

    // 3. Chunking (Simple chunking for now, 1000 chars)
    // For better RAG, we should split by paragraphs or strict token count.
    // Let's do a simple split by paragraph for now.
    const chunks = textContent.split(/\n\s*\n/).filter(c => c.length > 50);

    let insertedCount = 0;

    // 4. Generate Embeddings & Store
    try {
        for (const chunk of chunks) {
            // Check chunk length max (SiliconFlow usually 512-4096 tokens)
            // Truncate if super long
            const safeChunk = chunk.substring(0, VECTOR_CONFIG.maxChunkLength);

            const embedding = await generateEmbedding(safeChunk);

            // console.log(`[Debug] Chunk embedding length: ${embedding.length}`);

            const { error: insertError } = await supabase.from("documents").insert({
                organization_id: profile.organization_id,
                content: safeChunk,
                metadata: { filename: file.name, size: file.size },
                embedding: embedding
            });

            if (insertError) {
                console.error("Insert Error:", insertError);
                throw new Error("Failed to save document chunk");
            }
            insertedCount++;
        }
    } catch (error: any) {
        return { error: "Embedding/Save Error: " + error.message };
    }

    revalidatePath("/whatsapp/knowledge");
    return { success: true, count: insertedCount };
}

export async function deleteDocument(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("documents").delete().eq("id", id);
    if (error) return { error: error.message };

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
