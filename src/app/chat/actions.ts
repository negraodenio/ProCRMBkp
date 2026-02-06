"use server";

import { createClient } from "@/lib/supabase/server";
import { EvolutionService } from "@/services/evolution";

export async function sendMessageAction(conversationId: string, text: string) {
    try {
        const supabase = await createClient();
        
        // 1. Get User/Org Context
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: "Não autorizado" };

        const { data: profile } = await supabase.from("profiles").select("organization_id").eq("id", user.id).single();
        if (!profile) return { error: "Organização não encontrada para este usuário" };

        // 2. Get Conversation Details (Phone)
        const { data: conversation, error: convErr } = await supabase
            .from("conversations")
            .select("*")
            .eq("id", conversationId)
            .single();
        
        if (convErr || !conversation) return { error: "Conversa não encontrada" };

        // 3. Derive Instance Name
        const orgRes = await supabase.from("organizations").select("name").eq("id", profile.organization_id).single();
        const orgName = orgRes.data?.name || "Empresa";
        const sanitizedName = orgName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "");
        const shortId = profile.organization_id.split('-')[0];
        const derivedInstanceName = `${sanitizedName}-${shortId}`;

        console.log(`🚀 Sending message to ${conversation.contact_phone} via ${derivedInstanceName}`);

        // 4. Send via Evolution
        try {
            await EvolutionService.sendMessage(derivedInstanceName, conversation.contact_phone, text);
        } catch (evoErr: any) {
            console.error("❌ Failed to send via Evolution:", evoErr);
            return { error: `WhatsApp Error: ${evoErr.message}` };
        }

        // 5. Save to Database
        const { data: newMessage, error: msgError } = await supabase.from("messages").insert({
            conversation_id: conversationId,
            organization_id: profile.organization_id,
            content: text,
            direction: "outbound",
            status: "sent"
        }).select().single();

        if (msgError) {
            console.error("❌ Database Error saving message:", msgError);
            return { error: "Mensagem enviada pelo WhatsApp mas não pôde ser salva no banco de dados." };
        }

        // 6. Update Conversation timestamp
        await supabase.from("conversations").update({
            last_message_content: text,
            last_message_at: new Date().toISOString()
        }).eq("id", conversationId);

        return { success: true, data: newMessage };
    } catch (err: any) {
        console.error("❌ Unexpected Error in sendMessageAction:", err);
        return { error: `Erro interno: ${err.message || 'Erro desconhecido'}` };
    }
}
