"use server";

import { createClient } from "@/lib/supabase/server";
import { EvolutionService } from "@/services/evolution";

export async function sendMessageAction(conversationId: string, text: string) {
    console.log(`[Action] Starting sendMessageAction for conv: ${conversationId}`);
    try {
        const supabase = await createClient();

        // 1. Get User/Org Context
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData?.user) {
            console.error("[Action] Auth Error:", authError);
            return { error: "Não autorizado" };
        }
        const user = authData.user;

        const { data: profile, error: profErr } = await supabase.from("profiles").select("organization_id").eq("id", user.id).maybeSingle();
        if (profErr || !profile) {
            console.error("[Action] Profile Error:", profErr);
            return { error: "Perfil ou organização não encontrados" };
        }

        // 2. Get Conversation Details (Phone)
        const { data: conversation, error: convErr } = await supabase
            .from("conversations")
            .select("*")
            .eq("id", conversationId)
            .maybeSingle();

        if (convErr || !conversation) {
            console.error("[Action] Conv Error:", convErr);
            return { error: "Conversa não encontrada" };
        }

        // 3. Derive Instance Name - Standardized
        const instanceName = `bot-${profile.organization_id}`;

        console.log(`[Action] Attempting send via Evolution: ${instanceName} to ${conversation.contact_phone}`);

        // 4. Send via Evolution
        try {
            await EvolutionService.sendMessage(instanceName, conversation.contact_phone, text);
        } catch (evoErr: any) {
            console.error("[Action] Evolution API Call Exception:", evoErr);
            return { error: evoErr.message || 'Erro ao enviar mensagem via WhatsApp' };
        }

        // 5. Save to Database
        const { data: newMessage, error: msgError } = await supabase.from("messages").insert({
            conversation_id: conversationId,
            organization_id: profile.organization_id,
            content: text,
            direction: "outbound",
            status: "sent"
        }).select().maybeSingle();

        if (msgError) {
            console.error("[Action] DB Insert Error:", msgError);
            return { error: "Falha ao registrar mensagem no banco" };
        }

        // 6. Update Conversation timestamp
        await supabase.from("conversations").update({
            last_message_content: text,
            last_message_at: new Date().toISOString()
        }).eq("id", conversationId);

        console.log("[Action] Success!");
        // Return a plain object to ensure serialization
        return {
            success: true,
            id: newMessage?.id,
            content: newMessage?.content
        };
    } catch (err: any) {
        console.error("[Action] CRITICAL UNEXPECTED ERROR:", err);
        return { error: `Erro interno crítico: ${err.message || 'Erro desconhecido'}` };
    }
}
