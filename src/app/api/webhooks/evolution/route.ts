import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { EvolutionService } from "@/services/evolution"; // Assuming this exists or I need to create/update it
import { aiChat, generateEmbedding } from "@/lib/ai/client";

// This webhook handles incoming messages from Evolution API
export async function POST(req: NextRequest) {
    const supabase = await createClient();

    try {
        const body = await req.json();
        // console.log("Webhook Body:", JSON.stringify(body, null, 2));

        // Evolution API Payload Structure varies by version
        // Usually: data.messageType, data.message, data.key.remoteJid (phone)
        // Let's assume standard Evolution v2 structure

        const eventType = body.type; // "messages.upsert"
        const messageData = body.data;

        if (eventType !== "messages.upsert" || !messageData) {
            return NextResponse.json({ status: "ignored" });
        }

        // Extract Phone and Message
        const remoteJid = messageData.key.remoteJid; // 551199999999@s.whatsapp.net
        const fromMe = messageData.key.fromMe;

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

        // 1. Find or Create Contact & Conversation
        // We need the organization_id associated with this instance.
        // Assuming single-tenant per instance for now, or we look up by instance name if passed in headers/body.
        // For this "Enterprise" setup, let's look up the organization based on the BOT (Event sender).
        // If Evolution doesn't send "instance name" easily, we might need a fixed mapping or token.
        // Let's assume there's only 1 organization for now (User's org).

        // SECURITY TODO: In a real multi-tenant app, webhook URL should include a token: /api/webhooks/evolution?token=org_id
        // For now, let's grab the first organization for simplicity of this demo request.

        // const { data: org } = await supabase.from("organizations").select("id").limit(1).single();
        // Updated: Use a fixed token or just find the contact.

        // Search contact by phone globally (or restrict if we had org context)
        // Since we don't have org context easily from the webhook without query param, 
        // we'll assume the contact belongs to the primary organization of the system owner.

        // Let's use a "System User" or Service Role for this logic ideally. 
        // Since we are using `createClient` (server), it uses cookies, which might not work for webhook.
        // We need `createClient` with Service Key for webhooks usually, or just Anonymous if RLS allows.
        // BUT RLS is enabled. We need a SERVICE ROLE CLIENT.

        // IMPORTANT: Webhooks need SUPABASE_SERVICE_ROLE_KEY to bypass RLS and find/create data.
        // The standard `createClient` from `@/lib/supabase/server` uses cookies.
        // I will import `createServiceRoleClient` if available, or make a custom one here using `process.env.SUPABASE_SERVICE_ROLE_KEY`.
        const serviceClient = createServiceClient();

        // 1. Get Org (Hack: Get the first one, or use a specific one)
        const { data: org } = await serviceClient.from("organizations").select("id").limit(1).single();
        if (!org) return NextResponse.json({ error: "No organization found" });

        // 2. Find/Create Contact
        let { data: contact } = await serviceClient
            .from("contacts")
            .select("id")
            .eq("phone", phone)
            .eq("organization_id", org.id)
            .single();

        if (!contact) {
            const { data: newContact, error: createError } = await serviceClient
                .from("contacts")
                .insert({
                    organization_id: org.id,
                    name: pushName,
                    phone: phone,
                    status: "new"
                })
                .select()
                .single();

            if (createError) {
                console.error("Create contact error:", createError);
                return NextResponse.json({ error: "Failed to create contact" });
            }
            contact = newContact;
        }

        // 3. Find/Create Conversation
        let { data: conversation } = await serviceClient
            .from("conversations")
            .select("id")
            .eq("contact_phone", phone)
            .eq("organization_id", org.id)
            .eq("status", "open") // only find open ones
            .single();

        if (!conversation) {
            const { data: newConv } = await serviceClient
                .from("conversations")
                .insert({
                    organization_id: org.id,
                    contact_phone: phone,
                    contact_name: pushName,
                    status: "open",
                    unread_count: 0
                })
                .select()
                .single();
            conversation = newConv;
        }

        // 4. Log Message
        const { error: msgError } = await serviceClient.from("messages").insert({
            conversation_id: conversation.id,
            organization_id: org.id,
            content: text,
            direction: "inbound",
            status: "delivered"
        });

        // 5. RAG & AI Reply
        // Only reply if there IS a knowledge base and the user asks a question?
        // Or always reply? Let's assume we reply if we find relevant info.

        // Embed the query
        const embedding = await generateEmbedding(text);

        // Search Documents
        const { data: chunks, error: matchError } = await serviceClient.rpc("match_documents", {
            query_embedding: embedding,
            match_threshold: 0.7, // Similarity threshold
            match_count: 3,
            org_id: org.id
        });

        if (chunks && chunks.length > 0) {
            // Found info! Generate answer.
            const contextText = chunks.map((c: any) => c.content).join("\n\n---\n\n");

            const systemPrompt = `Você é um assistente virtual atencioso da empresa. 
            Use APENAS o contexto abaixo para responder à pergunta do cliente.
            Se a resposta não estiver no contexto, diga que vai transferir para um consultor humano.
            Responda em Português do Brasil de forma curta e humanizada.
            
            Contexto:
            ${contextText}`;

            const aiResponse = await aiChat({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: text }
                ],
                model: "fast" // Use fast model for chat
            });

            // Send Reply via Evolution API
            // Assuming EvolutionService is set up
            // We need the instance name. Let's rebuild it from logic or fetch it.
            // instanceName = `bot-${org.id.slice(0, 8)}`
            const instanceName = "bot-" + org.id.substring(0, 8);

            await EvolutionService.sendMessage(instanceName, remoteJid, aiResponse); // Ensure this method exists

            // Log Reply
            await serviceClient.from("messages").insert({
                conversation_id: conversation.id,
                organization_id: org.id,
                content: aiResponse,
                direction: "outbound",
                status: "sent"
            });
        }

        return NextResponse.json({ status: "processed" });

    } catch (error: any) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
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

