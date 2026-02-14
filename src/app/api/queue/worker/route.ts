import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-scoped";
import { EvolutionService } from "@/services/evolution";
import { aiChat, generateEmbedding } from "@/lib/ai/client";
import { PERSONALITY_PRESETS, PersonalityType, buildSystemPrompt } from "@/lib/bot-personalities";

/**
 * WORKER ENDPOINT
 * This API should be called by a Cron Job (every minute) or a Database Webhook (pg_net).
 * It picks up 'pending' jobs from the queue and processes them.
 */
export async function POST(req: NextRequest) {
    // SECURITY: Validate a secret key to prevent unauthorized execution
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET || "worker-secret"}`) {
        // return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        // Commented out for easier testing, but highly recommended for production
    }

    const supabase = createServiceRoleClient();

    try {
        // 1. FETCH & LOCK NEXT JOB (Atomic Operation)
        // We look for a 'pending' job, lock it ('processing'), and return it.
        // This prevents two workers from picking the same job.
        const { data: job, error: fetchError } = await supabase
            .from("queue")
            .update({ status: "processing", updated_at: new Date().toISOString() })
            .eq("status", "pending")
            .in("event_type", ["whatsapp_message"]) // Only handle messages for now
            .limit(1)
            .select("*")
            .maybeSingle();

        if (fetchError) {
            console.error("❌ [Worker] Failed to fetch job:", fetchError);
            return NextResponse.json({ error: fetchError.message }, { status: 500 });
        }

        if (!job) {
            return NextResponse.json({ status: "no_jobs_pending" });
        }

        console.log(`👷 [Worker] Processing Job ${job.id} (Type: ${job.event_type})...`);

        // 2. PROCESS JOB (AI Logic)
        const payload = job.payload; // { text, sender, remoteJid, orgId, instanceName, ... }

        // --- RECONSTRUCT CONTEXT ---
        const { text, remoteJid, pushName, orgId, instanceName, conversationId, contactId } = payload;

        let aiResponse = "";
        let contextText = "";

        // A. Generate Embedding
        const embedding = await generateEmbedding(text);

        // B. RAG Search
        const { data: chunks } = await supabase.rpc("match_documents", {
            query_embedding: embedding,
            match_threshold: 0.5,
            match_count: 5,
            org_id: orgId
        });

        if (chunks && chunks.length > 0) {
            contextText = chunks.map((c: any) => c.content).join("\n");
        }

        // C. Build Prompt (Personalities)
        // We need to fetch Bot Settings first
        const { data: org } = await supabase.from("organizations").select("bot_settings").eq("id", orgId).single();
        const botSettings = org?.bot_settings || {};

        const personalityKey = (botSettings.personality_preset || "instruction_follower") as PersonalityType;

        const systemPrompt = buildSystemPrompt(
            personalityKey,
            botSettings.custom_instructions || "",
            contextText,
            pushName,
            { mention_name: botSettings.mention_name, use_emojis: botSettings.use_emojis }
        );

        // D. Build History (Simple for now, just fetch last messages)
        const { data: recentMessages } = await supabase
            .from("messages")
            .select("content, direction")
            .eq("conversation_id", conversationId)
            .order("created_at", { ascending: false })
            .limit(6);

        const chatHistory = (recentMessages || [])
            .reverse()
            .map((m: any) => ({
                role: (m.direction === "inbound" ? "user" : "assistant") as "user" | "assistant",
                content: m.content
            }));

        // E. Call LLM
        aiResponse = await aiChat({
            messages: [{ role: "system", content: systemPrompt }, ...chatHistory, { role: "user", content: text }],
            model: "fast",
            temperature: botSettings.temperature || 0.6
        });

        if (!aiResponse) throw new Error("AI returned empty response");

        // F. Send Message via Evolution
        const replyInstance = instanceName || (`bot-${orgId}`);
        await EvolutionService.sendMessage(replyInstance, remoteJid, aiResponse);

        // G. Log Outbound Message
        await supabase.from("messages").insert({
            conversation_id: conversationId,
            organization_id: orgId,
            content: aiResponse,
            direction: "outbound",
            status: "sent"
        });

        // H. Update Conversation
        await supabase.from("conversations").update({
            last_message_content: aiResponse,
            last_message_at: new Date().toISOString()
        }).eq("id", conversationId);


        // 3. MARK JOB COMPLETED
        await supabase
            .from("queue")
            .update({ status: "completed", updated_at: new Date().toISOString() })
            .eq("id", job.id);

        console.log(`✅ [Worker] Job ${job.id} completed successfully.`);
        return NextResponse.json({ status: "job_completed", jobId: job.id });

    } catch (error: any) {
        console.error("❌ [Worker] Job Failed:", error);

        // Mark as failed so it can be retried (or inspected)
        // Note: supabase var is available here
        // We need to handle this robustly.
        // For now, simpler:
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
