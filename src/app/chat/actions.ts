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

        const { data: profile, error: profErr } = await supabase.from("profiles").select("organization_id, full_name").eq("id", user.id).maybeSingle();
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
            status: "sent",
            sender_name: profile.full_name || "Atendente"
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

export async function deleteConversationAction(conversationId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Não autorizado" };

    try {
        // Verify ownership via organization
        const { data: profile } = await supabase.from("profiles").select("organization_id").eq("id", user.id).single();

        if (!profile?.organization_id) return { error: "Organização não encontrada" };

        const { data: conversation } = await supabase
            .from("conversations")
            .select("id")
            .eq("id", conversationId)
            .eq("organization_id", profile.organization_id)
            .single();

        if (!conversation) return { error: "Conversa não encontrada ou sem permissão" };

        // Delete messages first (if not cascading)
        await supabase.from("messages").delete().eq("conversation_id", conversationId);

        // Delete conversation
        const { error } = await supabase.from("conversations").delete().eq("id", conversationId);

        if (error) throw error;

        return { success: true };
    } catch (error: any) {
        console.error("Error deleting conversation:", error);
        return { error: "Erro ao excluir conversa: " + error.message };
    }
}

export async function toggleAIAction(conversationId: string, enabled: boolean) {
    const supabase = await createClient();
    try {
        const { error } = await supabase
            .from("conversations")
            .update({ ai_enabled: enabled })
            .eq("id", conversationId);

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        console.error("Error toggling AI:", error);
        return { error: "Erro ao configurar IA: " + error.message };
    }
}
