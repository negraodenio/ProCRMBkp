import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-scoped";

/**
 * WEBHOOK V2 (QUEUE BASED) - FOR FUTURE USE
 *
 * Este arquivo substitui o 'route.ts' original quando o sistema de Fila for ativado.
 *
 * DIFERENÇA PRINCIPAL:
 * - O Webhook original processa tudo (RAG, OpenAI, Envio) e demora 5-30s.
 * - Este Webhook APENAS salva no banco e responde em 100ms.
 *
 * VANTAGENS:
 * 1. Não dá timeout no Vercel (Serverless Function).
 * 2. Se a OpenAI cair, a mensagem fica salva no banco para processar depois.
 * 3. O WhatsApp não fica reenviando mensagem porque recebeu resposta rápida (200 OK).
 */

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const eventType = (body.type || body.event || "").toLowerCase();

        // 1. FILTRO DE EVENTOS (Só nos interessa mensagem recebida)
        if (!eventType.includes("messages.upsert") && !eventType.includes("messages_upsert")) {
             return NextResponse.json({ status: "ignored" });
        }

        const messageData = body.data;
        if (!messageData) return NextResponse.json({ status: "ignored_no_data" });

        // 2. EXTRAÇÃO BÁSICA (Apenas o necessário para identificar)
        const remoteJid = messageData.key?.remoteJid || messageData.remoteJid;
        const msgId = messageData.key?.id;
        const fromMe = messageData.key?.fromMe === true || messageData.fromMe === true;

        if (fromMe) return NextResponse.json({ status: "ignored_self" });
        if (!remoteJid || remoteJid.includes("@g.us")) return NextResponse.json({ status: "ignored_group" });

        // 3. IDEMPOTÊNCIA (Evitar duplicidade)
        // O ID único do evento é a combinação de remoteJid + msgId
        const eventId = `${remoteJid}_${msgId}`;
        const supabase = createServiceRoleClient();

        // Tenta inserir na caixa de entrada. Se já existir, ignora.
        const { error: inboxError } = await supabase
            .from("webhook_inbox")
            .insert({ event_id: eventId })
            .select() // Retorna erro se violar unique constraint
            .maybeSingle();

        if (inboxError) {
            console.log(`[Webhook V2] Duplicidade detectada: ${eventId}. Ignorando.`);
            return NextResponse.json({ status: "ignored_duplicate" });
        }

        // 4. DERIVAR ORG_ID (Otimização: Extrair aqui ou deixar pro worker?)
        // Melhor extrair aqui para facilitar query no Worker
        const { searchParams } = new URL(req.url);
        let orgId = searchParams.get('org_id');
        const instanceName = body.instance || body.sender || body.instanceName || "";

        if (!orgId && instanceName.startsWith("bot-")) {
            orgId = instanceName.split("bot-")[1];
        }

        if (!orgId) {
            console.error("[Webhook V2] Org ID missing");
            return NextResponse.json({ status: "error_missing_org" }, { status: 400 });
        }

        // 5. ENFILEIRAR (Fire & Forget)
        // Gravamos TUDO na fila. O Worker vai se virar para parsear.
        console.log(`[Webhook V2] Enfileirando mensagem de ${remoteJid}...`);

        await supabase.from("queue").insert({
            event_type: "whatsapp_message",
            payload: {
                // Passamos o body inteiro ou parte dele
                // Melhor passar campos já limpos para facilitar o worker
                text: extractText(messageData),
                remoteJid,
                pushName: messageData.pushName || remoteJid.split('@')[0],
                orgId,
                instanceName,
                fullBody: body // Opcional: salvar tudo para debug
            },
            status: 'pending'
        });

        // 6. RESPOSTA IMEDIATA
        // O WhatsApp recebe 200 OK na hora e fica feliz.
        return NextResponse.json({ status: "queued" });

    } catch (error: any) {
        console.error("[Webhook V2] Error:", error);
        // Em V2, erros aqui são raros (só se banco cair).
        // Se banco cair, retornamos 500 e WhatsApp tenta de novo (correto).
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Helper rápido para extrair texto
function extractText(messageData: any): string {
    if (messageData.message?.conversation) return messageData.message.conversation;
    if (messageData.message?.extendedTextMessage?.text) return messageData.message.extendedTextMessage.text;
    return "";
}
