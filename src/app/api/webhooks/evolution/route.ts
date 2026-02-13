import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createOrgScopedServiceClient, createServiceRoleClient } from "@/lib/supabase/service-scoped";
import { EvolutionService } from "@/services/evolution";
import { aiChat, generateEmbedding } from "@/lib/ai/client";
import { PERSONALITY_PRESETS, PersonalityType, buildSystemPrompt } from "@/lib/bot-personalities";
import { normalizePhone } from "@/lib/utils";
// cleaned up imports

// This webhook handles incoming messages from Evolution API
// Cache bust: 2026-02-10T18:11:00Z
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log("📥 Evolution Webhook Received:", JSON.stringify(body, null, 2));

        const { searchParams } = new URL(req.url);
        const queryOrgId = searchParams.get('org_id');

        if (!queryOrgId) {
            console.warn("⚠️ [Webhook] Missing org_id param. Will attempt to derive from Instance Name.");
        }

        const eventType = (body.type || body.event || "").toLowerCase();
        const messageData = body.data;

        if (!eventType.includes("messages.upsert") && !eventType.includes("messages_upsert") && !eventType.includes("messages-upsert")) {
            console.log(`⏭️ [Webhook] Event type '${eventType}' is not messages.upsert, checking if messageData exists...`);
            if (!messageData) {
                console.log("⏭️ [Webhook] No messageData, ignoring event");
                return NextResponse.json({ status: "ignored" });
            }
        }

        if (!messageData) {
            console.log("⏭️ [Webhook] No messageData found, ignoring");
            return NextResponse.json({ status: "ignored" });
        }

        // Extract Phone and Message
        const remoteJid = messageData.key?.remoteJid || messageData.remoteJid;

        // Strict fromMe check: ignore messages sent by the bot itself
        const fromMe = messageData.key?.fromMe === true ||
                       messageData.fromMe === true ||
                       (messageData.key?.id?.startsWith("BAE5") && messageData.key?.id?.length > 15);

        if (fromMe) {
            console.log("⏭️ [Webhook] Message from self (fromMe=true), ignoring to avoid loops");
            return NextResponse.json({ status: "ignored_self" });
        }

        // Safety check for remoteJid
        if (!remoteJid || typeof remoteJid !== 'string') {
            console.log("⏭️ [Webhook] Invalid remoteJid, ignoring");
            return NextResponse.json({ status: "ignored_no_jid" });
        }

        // Ignore Group Messages
        if (remoteJid.includes("@g.us")) {
            console.log(`⏭️ [Webhook] Group message detected (${remoteJid}), ignoring`);
            return NextResponse.json({ status: "ignored_group" });
        }

        // Normalize phone: only digits, stripped of extras, with mandatory BR prefix
        const phone = normalizePhone(remoteJid);

        // Normalize Push Name: use phone if name is generic or missing
        let pushName = messageData.pushName || "";
        if (!pushName || pushName === "Desconhecido" || pushName.toLowerCase() === "unknown") {
            pushName = phone;
        }

        // Extract Text Content (Conversação ou Legenda de Mídia)
        let text = "";
        if (messageData.message?.conversation) {
            text = messageData.message.conversation;
        } else if (messageData.message?.extendedTextMessage?.text) {
            text = messageData.message.extendedTextMessage.text;
        } else if (messageData.message?.imageMessage?.caption) {
            text = messageData.message.imageMessage.caption;
        } else if (messageData.message?.videoMessage?.caption) {
            text = messageData.message.videoMessage.caption;
        } else if (messageData.message?.buttonsResponseMessage?.selectedButtonId) {
            text = messageData.message.buttonsResponseMessage.selectedDisplayText || messageData.message.buttonsResponseMessage.selectedButtonId;
        } else if (messageData.message?.templateButtonReplyMessage?.selectedId) {
            text = messageData.message.templateButtonReplyMessage.selectedDisplayText || messageData.message.templateButtonReplyMessage.selectedId;
        }

        if (!text) {
            console.log("⏭️ [Webhook] No text content found in message, ignoring");
            return NextResponse.json({ status: "no_text" });
        }

        console.log(`✅ [Webhook] Processing message from ${pushName} (${phone}): "${text.substring(0, 50)}..."`);

        // Extract instance name EARLY for validation and fallback
        const instanceName = body.instance || body.sender || body.instanceName || body.data?.instance || "";

        let finalOrgId = queryOrgId;

        // Fallback: Derive org_id from instance name (format: bot-{uuid})
        if (!finalOrgId && instanceName && instanceName.startsWith("bot-")) {
            const parts = instanceName.split("bot-");
            if (parts.length > 1 && parts[1].length > 10) { // Simple validation
                finalOrgId = parts[1];
                console.log(`[Webhook] Derived org_id from instance: ${finalOrgId}`);
            }
        }

        if (!finalOrgId) {
            console.error("❌ [Webhook] Missing org_id parameter AND could not derive from instance");
            return NextResponse.json({
                error: "org_id query parameter is required",
                status: "error_missing_org_id"
            }, { status: 400 });
        }

        console.log(`🔍 [Webhook Debug] OrgID (Query): ${queryOrgId}`);
        console.log(`🔍 [Webhook Debug] Final OrgID: ${finalOrgId}`);
        console.log(`🔍 [Webhook Debug] Instance: ${instanceName}`);

        const unscopedClient = createServiceRoleClient();

        // Lookup Org + Bot Settings
        const { data: org, error: orgError} = await unscopedClient
            .from("organizations")
            .select("id, name, bot_settings")
            .eq("id", finalOrgId)
            .maybeSingle();

        // Now create scoped client for data operations
        const serviceClient = createOrgScopedServiceClient(finalOrgId);

        if (orgError) {
            console.error("❌ [Webhook] Org lookup error:", orgError);
        }

        if (!org) {
            console.error(`❌ [Webhook] Organization ${finalOrgId} not found in database`);
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }

        console.log(`✅ [Webhook] Organization confirmed: ${org.id} (${org.name})`);

        const botSettings = org.bot_settings || {};
        const isBotActive = botSettings.active !== false && botSettings.auto_reply_enabled !== false;

        console.log(`🔍 [Webhook Debug] BotSettings for Org ${org.id}:`, JSON.stringify(botSettings));
        console.log(`🔍 [Webhook Debug] isBotActive: ${isBotActive}`);

        if (!isBotActive) {
            console.log("⏭️ Bot is PAUSED (active=false) for this organization");
            return NextResponse.json({ status: "bot_paused" });
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
        let { data: contact, error: contactLookupError } = await serviceClient
            .from("contacts")
            .select("id")
            .eq("phone", phone)
            .maybeSingle();

        if (contactLookupError) {
            console.error("❌ [Webhook] Contact lookup error:", contactLookupError);
        }

        if (!contact) {
            console.log(`🔍 [Webhook] Contact not found. Creating new contact: ${pushName}`);
            const { data: newContact, error: createContactError } = await serviceClient
                .from("contacts")
                .insert({
                    organization_id: org.id,
                    name: pushName,
                    phone: phone,
                    status: "new"
                })
                .select()
                .maybeSingle();

            if (createContactError) {
                console.error("❌ [Webhook] Error creating contact:", createContactError);
                return NextResponse.json({ error: "Failed to create contact", details: createContactError.message }, { status: 500 });
            }
            contact = newContact;
        }
        console.log(`✅ [Webhook] Contact ready: ${contact?.id}`);

        // 3. Find/Create Conversation
        let { data: conversation, error: convLookupError } = await serviceClient
            .from("conversations")
            .select("*")
            .eq("contact_phone", phone)
            .eq("status", "open")
            .maybeSingle();

        if (convLookupError) {
            console.error("❌ [Webhook] Conversation lookup error:", convLookupError);
        }

        if (!conversation) {
            console.log("🔍 [Webhook] Open conversation not found. Creating new one.");
            const { data: newConv, error: createConvError } = await serviceClient
                .from("conversations")
                .insert({
                    organization_id: org.id,
                    contact_phone: phone,
                    contact_name: pushName,
                    status: "open"
                })
                .select()
                .maybeSingle();

            if (createConvError) {
                console.error("❌ [Webhook] Error creating conversation:", createConvError);
                return NextResponse.json({ error: "Failed to create conversation", details: createConvError.message }, { status: 500 });
            }
            conversation = newConv;
        }

        if (!conversation) {
            console.error("❌ [Webhook] Critical failure: conversation remains null after creation attempt");
            return NextResponse.json({ error: "DB Failure - Conv missing" }, { status: 500 });
        }

        if (!contact || !conversation) {
            console.error("❌ [Webhook] Critical failure: contact or conversation is still null");
            return NextResponse.json({ error: "DB Failure - Contact/Conv missing" }, { status: 500 });
        }

        // Update conversation metadata (so it appears at the top of the chat list)
        const updateData: any = {
            last_message_content: text,
            last_message_at: new Date().toISOString(),
            unread_count: (conversation.unread_count || 0) + 1
        };

        // If current name is generic (phone or Desconhecido), and we have a better pushName now, update it
        if (conversation.contact_name === conversation.contact_phone || conversation.contact_name === "Desconhecido") {
            if (pushName && pushName !== phone) {
                updateData.contact_name = pushName;
                console.log(`[Webhook] Updating conversation name from generic to: ${pushName}`);
            }
        }

        await serviceClient.from("conversations").update(updateData).eq("id", conversation.id);

        // 4. Log Message
        console.log(`[Webhook] Inserting message for Conversation: ${conversation.id}, Org: ${org.id}`);
        await serviceClient.from("messages").insert({
            conversation_id: conversation.id,
            organization_id: org.id,
            content: text,
            direction: "inbound",
            status: "delivered"
        });

        // --- FEATURE: CONVERSATION-LEVEL AI ENABLED CHECK ---
        const isAIEnabledForConversation = conversation.ai_enabled !== false;
        console.log(`🔍 [Webhook Debug] AI Enabled for Conv ${conversation.id}: ${isAIEnabledForConversation} (current value: ${conversation.ai_enabled})`);

        if (!isAIEnabledForConversation) {
            console.log(`⏭️ AI is DISABLED for this specific conversation: ${conversation.id}. Skipping auto-reply.`);
            return NextResponse.json({ status: "ai_disabled_for_conversation" });
        }

        console.log(`✅ [Webhook] Conversation ready and updated: ${conversation?.id}`);

        // Fetch recent messages for loop detection and AI context
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

        // SAFE RAG: Try to fetch context, but don't crash if it fails (e.g. migration missing)
        let contextText = "";
        try {
            console.log("🔍 [Webhook] Attempting RAG match...");
            const { data: chunks, error: matchError } = await serviceClient.rpc("match_documents", {
                query_embedding: embedding,
                match_threshold: 0.7,
                match_count: 3,
                org_id: org.id
            });

            if (matchError) throw matchError;

            contextText = chunks?.length ? chunks.map((c: any) => c.content).join("\n") : "";
            console.log(`✅ [Webhook] RAG Success. Context length: ${contextText.length}`);
        } catch (ragError: any) {
            console.error("⚠️ [Webhook] RAG Failed (continuing without context):", ragError.message);
            contextText = "";
        }

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

        // Map history for AI (skip the current message which was already logged)
        const chatHistory = (recentMessages || [])
            .filter(m => m.content !== text) // Avoid duplicating current message if it was just inserted
            .reverse()
            .map((m: { content: string; direction: string }) => ({
                role: (m.direction === "inbound" ? "user" : "assistant") as "user" | "assistant",
                content: m.content
            }));

        const replyInstance = instanceName || ("bot-" + org.id);

        // FIX: Handle LID (Linked Identity Device)
        // If the incoming message is from a LID, reply to the LID JID directly.
        // Otherwise use the standard phone@s.whatsapp.net format.
        let targetJid = `${phone}@s.whatsapp.net`;

        // Check for explicit @lid OR length heuristic (15 digits = LID)
        if ((remoteJid && remoteJid.includes("@lid")) || (phone.length === 15)) {
             // If phone is 15 digits but remoteJid doesn't have suffix, append @lid
             if (phone.length === 15 && !remoteJid.includes("@")) {
                 targetJid = `${phone}@lid`;
             } else {
                 targetJid = remoteJid;
             }
        }

        console.log(`🤖 [Webhook] Generating AI response...`);
        const aiResponse = await aiChat({
            messages: [
                { role: "system", content: systemPrompt },
                ...chatHistory,
                { role: "user", content: text }
            ],
            model: "fast",
            temperature: botSettings.temperature ?? 0.6,
            max_tokens: botSettings.max_tokens ?? 250
        });
        console.log(`✅ [Webhook] AI Response generated. Length: ${aiResponse.length}`);

        await EvolutionService.sendMessage(replyInstance, targetJid, aiResponse);

        // Log Bot Message
        await serviceClient.from("messages").insert({
            conversation_id: conversation.id,
            organization_id: org.id,
            content: aiResponse,
            direction: "outbound",
            status: "sent"
        });

        // Update conversation with bot reply
        await serviceClient.from("conversations").update({
            last_message_content: aiResponse,
            last_message_at: new Date().toISOString()
        }).eq("id", conversation.id);

        return NextResponse.json({ status: "processed" });

    } catch (error: any) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ status: "error_handled", details: error.message });
    }
}

// End of file

