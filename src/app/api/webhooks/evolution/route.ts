import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createOrgScopedServiceClient } from "@/lib/supabase/service-scoped";
import { EvolutionService } from "@/services/evolution";
import { aiChat, generateEmbedding } from "@/lib/ai/client";
import { PERSONALITY_PRESETS, PersonalityType, buildSystemPrompt } from "@/lib/bot-personalities";

// This webhook handles incoming messages from Evolution API
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log("📥 Evolution Webhook Received:", JSON.stringify(body, null, 2));

        const { searchParams } = new URL(req.url);
        const queryOrgId = searchParams.get('org_id');

        // CRITICAL: org_id is now REQUIRED to prevent data mixing
        if (!queryOrgId) {
            console.error("❌ [Webhook] Missing required org_id parameter");
            return NextResponse.json({
                error: "org_id query parameter is required",
                status: "error_missing_org_id"
            }, { status: 400 });
        }

        const eventType = (body.type || body.event || "").toLowerCase();
        const messageData = body.data;

        if (!eventType.includes("messages.upsert") && !eventType.includes("messages_upsert") && !eventType.includes("messages-upsert")) {
            if (!messageData) return NextResponse.json({ status: "ignored" });
        }

        if (!messageData) return NextResponse.json({ status: "ignored" });

        // Extract Phone and Message
        const remoteJid = messageData.key?.remoteJid || messageData.remoteJid;
        const fromMe = messageData.key?.fromMe || messageData.fromMe || (messageData.key?.id?.startsWith("BAE5") && messageData.key?.id?.length > 15);

        if (fromMe) return NextResponse.json({ status: "ignored_self" });

        const phone = remoteJid.split("@")[0];
        const pushName = messageData.pushName || "Desconhecido";

        // Extract Text Content
        let text = "";
        if (messageData.message?.conversation) {
            text = messageData.message.conversation;
        } else if (messageData.message?.extendedTextMessage?.text) {
            text = messageData.message.extendedTextMessage.text;
        }

        if (!text) return NextResponse.json({ status: "no_text" });

        // IMPORTANT: Webhooks need to bypass RLS to create contacts/conversations
        const serviceClient = createOrgScopedServiceClient(queryOrgId);

        // Extract instance name for validation
        const instanceName = body.instance || body.sender || body.instanceName || body.data?.instance || "";

        // Lookup Org + Bot Settings
        const { data: org, error: orgError } = await serviceClient
            .from("organizations")
            .select("id, bot_settings")
            .maybeSingle();

        if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

        const botSettings = org.bot_settings || {};

        // --- FEATURE: AUTO-REPLY ENABLED CHECK ---
        if (botSettings.auto_reply_enabled === false) {
            console.log("⏭️ Auto-reply is DISABLED for this organization");
            return NextResponse.json({ status: "auto_reply_disabled" });
        }

        // --- FEATURE: BUSINESS HOURS CHECK ---
        if (botSettings.business_hours_only) {
            const now = new Date();
            const saopauloTime = new Intl.DateTimeFormat('pt-BR', {
                timeZone: 'America/Sao_Paulo',
                hour: 'numeric',
                hour12: false
            }).format(now);

            const hour = parseInt(saopauloTime);
            if (hour < 9 || hour >= 18) {
                console.log("🌙 Outside business hours (9h-18h). AI will not respond.");
                return NextResponse.json({ status: "outside_hours" });
            }
        }

        // 2. Find/Create Contact
        let { data: contact } = await serviceClient
            .from("contacts")
            .select("id")
            .eq("phone", phone)
            .single();

        if (!contact) {
            const { data: newContact } = await serviceClient
                .from("contacts")
                .insert({
                    organization_id: org.id,
                    name: pushName,
                    phone: phone,
                    status: "new"
                })
                .select()
                .single();
            contact = newContact;
        }

        // 3. Find/Create Conversation
        let { data: conversation } = await serviceClient
            .from("conversations")
            .select("id")
            .eq("contact_phone", phone)
            .eq("status", "open")
            .single();

        if (!conversation) {
            const { data: newConv } = await serviceClient
                .from("conversations")
                .insert({
                    organization_id: org.id,
                    contact_phone: phone,
                    contact_name: pushName,
                    status: "open"
                })
                .select()
                .single();
            conversation = newConv;
        }

        if (!contact || !conversation) return NextResponse.json({ error: "DB Failure" });

        // --- LOOP GUARD & FREQUENCY COOLDOWN ---
        const { data: recentMessages } = await serviceClient
            .from("messages")
            .select("content, direction, created_at")
            .eq("conversation_id", conversation.id)
            .order("created_at", { ascending: false })
            .limit(5);

        if (recentMessages && recentMessages.length > 0) {
            const last = recentMessages[0];
            const now = new Date().getTime();
            const lastTime = new Date(last.created_at).getTime();

            if (now - lastTime < 3000) return NextResponse.json({ status: "ignored_cooldown" });

            const outboundCount = recentMessages.filter(m => m.direction === "outbound").length;
            const oldestInBatchTime = new Date(recentMessages[recentMessages.length - 1].created_at).getTime();

            if (outboundCount >= 3 && (now - oldestInBatchTime < 15000)) {
                return NextResponse.json({ status: "ignored_loop_frequency" });
            }

            if (last.content === text && (now - lastTime < 10000)) {
                return NextResponse.json({ status: "ignored_duplicate" });
            }
        }

        // 4. Log Message
        const { error: msgError } = await serviceClient.from("messages").insert({
            conversation_id: conversation.id,
            organization_id: org.id,
            content: text,
            direction: "inbound",
            status: "delivered"
        });

        // 4.5 Create Deal (Lead) if not exists
        const { data: existingDeals } = await serviceClient
            .from("deals")
            .select("id")
            .eq("contact_id", contact.id)
            .neq("status", "lost")
            .neq("status", "won")
            .limit(1);

        if (!existingDeals || existingDeals.length === 0) {
            let { data: pipeline } = await serviceClient
                .from("pipelines")
                .select("id")
                .eq("is_default", true)
                .single();

            if (!pipeline) {
                const { data: anyPipe } = await serviceClient.from("pipelines").select("id").limit(1).single();
                pipeline = anyPipe;
            }

            if (pipeline) {
                const { data: firstStage } = await serviceClient
                    .from("stages")
                    .select("id")
                    .eq("pipeline_id", pipeline.id)
                    .order("order", { ascending: true })
                    .limit(1)
                    .single();

                if (firstStage) {
                    // ROUND ROBIN
                    const { data: users } = await serviceClient.from("profiles").select("id").eq("status", "active");
                    let assignedUserId = null;

                    if (users && users.length > 0) {
                        const { data: lastDeal } = await serviceClient
                          .from("deals")
                          .select("user_id")
                          .order("created_at", { ascending: false })
                          .limit(1)
                          .maybeSingle();

                        if (!lastDeal || !lastDeal.user_id) assignedUserId = users[0].id;
                        else {
                            const lastIndex = users.findIndex(u => u.id === lastDeal.user_id);
                            assignedUserId = users[lastIndex === -1 || lastIndex === users.length - 1 ? 0 : lastIndex + 1].id;
                        }
                    }

                    await serviceClient.from("deals").insert({
                        organization_id: org.id,
                        title: `Lead: ${pushName || phone}`,
                        contact_id: contact.id,
                        stage_id: firstStage.id,
                        status: "open",
                        user_id: assignedUserId
                    });

                    if (assignedUserId) {
                        await serviceClient.from("conversations").update({ assigned_to: assignedUserId }).eq("id", conversation.id);
                    }
                }
            }
        }

        // 5. RAG & AI Reply
        const embedding = await generateEmbedding(text);
        const { data: chunks } = await serviceClient.rpc("match_documents", {
            query_embedding: embedding,
            match_threshold: 0.7,
            match_count: 3,
            org_id: org.id
        });

        const contextText = chunks?.length ? chunks.map((c: any) => c.content).join("\n") : "";

        // --- PERSONALITY CONFIGURATION ---
        const presetKey = (botSettings.personality_preset || "friendly") as PersonalityType;
        const preset = PERSONALITY_PRESETS[presetKey];

        const systemPrompt = buildSystemPrompt(
            preset,
            botSettings.custom_instructions || "",
            contextText,
            pushName,
            {
                mention_name: botSettings.mention_name,
                use_emojis: botSettings.use_emojis
            }
        );

        const aiResponse = await aiChat({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `<user_input>${text}</user_input>` }
            ],
            model: "fast",
            temperature: botSettings.temperature ?? 0.6,
            max_tokens: botSettings.max_tokens ?? 250
        });

        const replyInstance = instanceName || ("bot-" + org.id);
        await EvolutionService.sendMessage(replyInstance, remoteJid, aiResponse);

        // Log Bot Message
        await serviceClient.from("messages").insert({
            conversation_id: conversation.id,
            organization_id: org.id,
            content: aiResponse,
            direction: "outbound",
            status: "sent"
        });

        return NextResponse.json({ status: "processed" });

    } catch (error: any) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ status: "error_handled", details: error.message });
    }
}

// Helper to create Service Client (This should be in a lib file ideally)
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

function createServiceClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Must be in .env
    if (!key) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");

    return createSupabaseClient(url, key, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}

