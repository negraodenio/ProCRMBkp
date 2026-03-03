import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createOrgScopedServiceClient, createServiceRoleClient } from "@/lib/supabase/service-scoped";
import { EvolutionService } from "@/services/evolution";
import { aiChat, generateEmbedding } from "@/lib/ai/client";
import { PERSONALITY_PRESETS, PersonalityType, buildSystemPrompt, clampTemperature } from "@/lib/bot-personalities";
import { ragAnswerWithGating } from "@/lib/ai/router_rag";
import { retrieveContextText } from "@/lib/rag/retrieve";
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

        // --- SECURITY PATCH: Verify Webhook Secret ---
        const expectedSecret = process.env.EVOLUTION_WEBHOOK_SECRET;
        if (expectedSecret) {
            const authHeader = req.headers.get("authorization")?.split(" ")[1] || req.headers.get("apikey");
            const queryToken = searchParams.get('token') || searchParams.get('secret');
            const providedSecret = authHeader || queryToken;

            if (providedSecret !== expectedSecret) {
                console.error("🚨 [Security] Evolution Webhook unauthorized attempt. Invalid or missing secret.");
                return NextResponse.json({ error: "Unauthorized. Invalid secret." }, { status: 401 });
            }
        } else {
            console.warn("⚠️ [Security] EVOLUTION_WEBHOOK_SECRET is not set. Webhook is vulnerable to spoofing.");
        }

        if (!queryOrgId) {
            console.warn("⚠️ [Webhook] Missing org_id param. Will attempt to derive from Instance Name.");
        }

        const eventType = (body.type || body.event || "").toLowerCase();
        const messageData = body.data;

        if (!eventType.includes("messages.upsert") &&
            !eventType.includes("messages_upsert") &&
            !eventType.includes("messages-upsert") &&
            !eventType.includes("connection.update") &&
            !eventType.includes("connection_update") &&
            !eventType.includes("qrcode.updated") &&
            !eventType.includes("qrcode_updated")) {
            console.log(`[Webhook] Event type '${eventType}' is not handled, ignoring.`);
            return NextResponse.json({ status: "ignored" });
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

        // 0. Handle Connection Events
        if (eventType.includes("connection") || eventType.includes("qrcode")) {
            const instanceName = body.instance || body.instanceName || "";
            const status = messageData?.state || messageData?.status || "";
            let finalOrgId = queryOrgId;

            if (!finalOrgId && instanceName.startsWith("bot-")) {
                finalOrgId = instanceName.split("bot-")[1];
            }

            if (finalOrgId) {
                const unscopedClient = createServiceRoleClient();
                if (status === "open" || status === "connected") {
                    console.log(`🟢 [Webhook] WhatsApp Connected for Org ${finalOrgId}`);
                    const { data: org } = await unscopedClient.from("organizations").select("bot_settings").eq("id", finalOrgId).single();
                    const newSettings = { ...(org?.bot_settings || {}), active: true, connected_at: new Date().toISOString() };
                    await unscopedClient.from("organizations").update({ bot_settings: newSettings }).eq("id", finalOrgId);
                } else if (status === "close" || status === "connecting") {
                    console.log(`🟡 [Webhook] WhatsApp ${status} for Org ${finalOrgId}`);
                }
            }
            return NextResponse.json({ status: "connection_updated" });
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
                    name: pushName || "Novo Contato", // Use pushName for NEW contacts
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
        } else {
            // OPTIONAL: Update name if it's "Novo Contato" or empty, but don't overwrite user-set names
            // For now, we JUST keep the existing name to solve the "Decor Live Cortinas" issue
            console.log(`✅ [Webhook] Existing contact found: ${contact.id}`);
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
                // Race condition: another concurrent webhook may have just created this conversation.
                // Retry the SELECT instead of failing hard.
                console.warn("⚠️ [Webhook] Insert conversation failed (possible race condition). Retrying SELECT...", createConvError.message);

                const { data: racedConv } = await serviceClient
                    .from("conversations")
                    .select("*")
                    .eq("contact_phone", phone)
                    .eq("organization_id", org.id)
                    .eq("status", "open")
                    .maybeSingle();

                if (racedConv) {
                    console.log("✅ [Webhook] Race condition resolved: found conversation from concurrent request:", racedConv.id);
                    conversation = racedConv;
                } else {
                    console.error("❌ [Webhook] Error creating conversation (non-race):", createConvError);
                    return NextResponse.json({ error: "Failed to create conversation", details: createConvError.message }, { status: 500 });
                }
            } else {
                conversation = newConv;
            }
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
            .limit(6); // Fetch 6 to account for the one we just inserted

        if (recentMessages && recentMessages.length > 1) { // Changed to > 1 because we just inserted 1
            const now = new Date().getTime();

            // Skip index 0 (the message we just inserted)
            const historicalMessages = recentMessages.slice(1);
            const last = historicalMessages[0];
            const lastTime = new Date(last.created_at).getTime();

            // 1. Cooldown Check (e.g. 1.5s between messages)
            if (now - lastTime < 1500) {
                console.log(`[Webhook Debug] Cooldown triggered. Last message was ${now - lastTime}ms ago.`);
                return NextResponse.json({ status: "ignored_cooldown" });
            }

            // 2. Loop Frequency (ignore if bot responded 3+ times in 15s)
            const outboundCount = historicalMessages.filter(m => m.direction === "outbound").length;
            const oldestInBatchTime = new Date(historicalMessages[historicalMessages.length - 1].created_at).getTime();

            if (outboundCount >= 3 && (now - oldestInBatchTime < 15000)) {
                console.log(`[Webhook Debug] Loop frequency triggered. Outbound count: ${outboundCount}`);
                return NextResponse.json({ status: "ignored_loop_frequency" });
            }

            // 3. Duplicate Content (ignore if same user text within 5s)
            if (last.content === text && (now - lastTime < 5000)) {
                console.log(`[Webhook Debug] Duplicate content detected within 5s.`);
                return NextResponse.json({ status: "ignored_duplicate" });
            }

            console.log(`🔍 [Webhook Debug] Cooldown checks passed. Last message: ${now - lastTime}ms ago.`);
        } else {
            console.log(`🔍 [Webhook Debug] Cooldown passed (First message in conversation).`);
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

        // 5. Intelligence Section (RAG + AI)
        const startTime = Date.now();
        const replyInstance = instanceName || ("bot-" + org.id);

        // --- FEATURE: TYPING INDICATOR (three dots pulsing) ---
        // We trigger this immediately to provide visual feedback while AI thinks.
        EvolutionService.sendPresence(replyInstance, remoteJid, "composing").catch(e =>
            console.warn("⚠️ [Webhook] Failed to send typing indicator:", e.message)
        );

        let aiResponse = "";
        let botInteractionStatus = 'success';
        let botInteractionError = '';
        let routed: any = null;

        try {
            // 5.1 Retrieval Real (using org-scoped helper)
            let contextText = "";
            try {
                const r = await retrieveContextText({
                    orgId: org.id,
                    query: text,
                    match_threshold: 0.35, // More inclusive
                    match_count: 8        // More context
                });
                contextText = r.contextText;
            } catch (ragError: any) {
                console.warn("⚠️ [Webhook] RAG retrieval failed:", ragError.message);
                botInteractionError += `RAG Error: ${ragError.message}; `;
            }

            // 5.3 Model Selection & Routing
            const personalityKey = (botSettings?.personality_preset || "instruction_follower") as PersonalityType;
            const temperature = clampTemperature(personalityKey, botSettings.temperature);

            // Build Context-Aware Prompt
            const systemPrompt = buildSystemPrompt(
                personalityKey,
                botSettings.custom_instructions || "",
                contextText,
                pushName,
                {
                    mention_name: botSettings.mention_name,
                    use_emojis: botSettings.use_emojis
                }
            );

            // Chat History
            const chatHistory = (recentMessages || [])
                .filter(m => m.content !== text)
                .reverse()
                .map((m: { content: string; direction: string }) => ({
                    role: (m.direction === "inbound" ? "user" : "assistant") as "user" | "assistant" | "system",
                    content: m.content
                }));

            // Roteamento Inteligente Ultra-Fidelidade
            routed = await ragAnswerWithGating({
                systemPrompt,
                userText: text,
                chatHistory,
                contextText,
                temperature,
                max_tokens: botSettings.max_tokens ?? 250,
                primaryModelAlias: "balanced",
                fallbackModelAlias: "coding", // DeepSeek-V3
                showRaw: true
            });

            aiResponse = routed.text;
            console.log(`🏁 [RAG Router] Used: ${routed.model_used}, Reason: ${routed.reason}`);

            // --- SMART HANDOFF DETECTION (Phase 9 & 10 Hardening) ---
            if (routed.raw) {
                try {
                    // JSON RECOVERY: Se o parse direto falhar, tentamos limpar marcas de markdown ou prefixos
                    let cleanRaw = routed.raw.trim();
                    if (cleanRaw.includes("```")) {
                        cleanRaw = cleanRaw.replace(/```json|```/g, "").trim();
                    }
                    // Handle cases where AI might prefix with "Here is the response:" or similar
                    if (cleanRaw.includes("{") && !cleanRaw.startsWith("{")) {
                        cleanRaw = cleanRaw.substring(cleanRaw.indexOf("{"));
                    }
                    if (cleanRaw.includes("}") && !cleanRaw.endsWith("}")) {
                        cleanRaw = cleanRaw.substring(0, cleanRaw.lastIndexOf("}") + 1);
                    }

                    const parsedRaw = JSON.parse(cleanRaw);
                    const handoff = parsedRaw.handoff_to;

                    if (handoff && handoff !== "null") {
                        botInteractionStatus = 'handoff';
                        console.log(`🚀 [Handoff] AI signaling handoff to: ${handoff}`);

                        const transferData: any = {
                            ai_enabled: false,
                            last_transferred_at: new Date().toISOString()
                        };

                        let handoffLabel = handoff;

                        // 1. Try to find a department with that name
                        const { data: depts } = await serviceClient
                            .from("departments")
                            .select("id, name")
                            .ilike("name", `%${handoff}%`)
                            .limit(1);

                        if (depts && depts.length > 0) {
                            transferData.department_id = depts[0].id;
                            handoffLabel = `Setor ${depts[0].name}`;
                        } else {
                            // 2. Try to find a user with that name (Maria, etc)
                            const { data: users } = await serviceClient
                                .from("profiles")
                                .select("id, full_name")
                                .ilike("full_name", `%${handoff}%`)
                                .limit(1);

                            if (users && users.length > 0) {
                                transferData.assigned_to = users[0].id;
                                handoffLabel = `Atendente ${users[0].full_name}`;
                            }
                        }

                        // 3. APPLY HANDOFF
                        await serviceClient.from("conversations").update(transferData).eq("id", conversation.id);

                        // 4. LOG SYSTEM MESSAGE
                        await serviceClient.from("messages").insert({
                            conversation_id: conversation.id,
                            organization_id: org.id,
                            content: `⚠️ IA: Transbordo solicitado para ${handoffLabel}. Chat assumido por humano.`,
                            direction: "system",
                            status: "sent",
                            sender_name: "Sistema"
                        });
                    }
                } catch (pe) {
                    console.warn("⚠️ [Handoff] Failed to parse raw AI output for handoff:", pe);
                    botInteractionError += `Parse Error: ${pe instanceof Error ? pe.message : 'Unknown'}; `;
                }
            }

        } catch (intelError: any) {
            console.error("❌ [Webhook] Intelligence Flow Failed:", intelError.message);
            botInteractionStatus = 'error';
            botInteractionError += intelError.message;

            // --- FAIL-SAFE: DEADMAN SWITCH (Phase 10) ---
            const { data: recentLogs } = await serviceClient
                .from("bot_interactions")
                .select("status")
                .eq("conversation_id", conversation.id)
                .order("created_at", { ascending: false })
                .limit(2);

            const consecutiveErrors = (recentLogs?.filter(l => l.status === 'error').length || 0) + 1;

            if (consecutiveErrors >= 3) {
                console.log(`🚨 [Deadman Switch] 3 consecutive errors for ${phone}. Disabling AI.`);
                await serviceClient.from("conversations").update({ ai_enabled: false }).eq("id", conversation.id);
                await serviceClient.from("messages").insert({
                    conversation_id: conversation.id,
                    organization_id: org.id,
                    content: `🚨 ERRO CRÍTICO: O robô falhou 3 vezes seguidas. IA desativada. Atendimento humanizado solicitado.`,
                    direction: "system",
                    status: "sent",
                    sender_name: "Sistema"
                });
                aiResponse = "Desculpe, estou com uma pequena instabilidade técnica. Um atendente humano virá te ajudar em instantes.";
            } else {
                aiResponse = "Desculpe, tive um problema técnico momentâneo. Pode repetir?";
            }
        }

        const totalTime = Date.now() - startTime;
        console.log(`🏁 [Webhook] Intelligence cycle finished in ${totalTime}ms`);

        // 5.5 LOG INTERACTION (Phase 10)
        try {
            await serviceClient.from("bot_interactions").insert({
                organization_id: org.id,
                conversation_id: conversation.id,
                contact_phone: phone,
                user_message: text.substring(0, 500),
                bot_response: aiResponse.substring(0, 500),
                model_used: routed?.model_used || 'none',
                reason: routed?.reason || 'error',
                processing_time_ms: totalTime,
                status: botInteractionStatus,
                error_details: botInteractionError || null
            });
        } catch (lErr) {
            console.warn("⚠️ [Webhook] Failed to log interaction:", lErr);
        }
        if (!aiResponse) {
             return NextResponse.json({ status: "no_response" });
        }

        // 6. Send Message
        let targetJid = `${phone}@s.whatsapp.net`;

        if ((remoteJid && remoteJid.includes("@lid")) || (phone.length === 15)) {
             if (phone.length === 15 && !remoteJid.includes("@")) {
                 targetJid = `${phone}@lid`;
             } else {
                 targetJid = remoteJid;
             }
        }

        console.log(`📡 [Webhook] Message ready to send to ${targetJid}.`);
        await EvolutionService.sendMessage(replyInstance, targetJid, aiResponse);

        // Log Bot Message in Chat
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

