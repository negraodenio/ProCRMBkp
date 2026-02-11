'use server'

import { EvolutionService } from "@/services/evolution";
import { createClient } from "@/lib/supabase/server";
import { normalizePhone } from "@/lib/utils";

export async function sendIntegratedWhatsAppMessage(phone: string, text: string) {
    const supabase = await createClient();

    // 1. Get User's Organization
    const { data: profile } = await supabase.from('profiles').select('organization_id').single();

    if (!profile?.organization_id) {
        throw new Error("Sessão ou Organização não encontrada.");
    }

    const instanceName = `bot-${profile.organization_id}`;

    try {
        const cleanPhone = normalizePhone(phone);
        // Enviar via Evolution API
        const response = await EvolutionService.sendMessage(instanceName, cleanPhone, text);

        return { success: true, response };
    } catch (error: any) {
        console.error("Error sending integrated message:", error);

        // Better error message for 404/Instance Not Found
        if (error.message && (error.message.includes("instance does not exist") || error.message.includes("404"))) {
            return { success: false, error: "WhatsApp desconectado! Vá até o menu WhatsApp e escaneie o QR Code para conectar." };
        }

        return { success: false, error: error.message || "Erro desconhecido ao enviar mensagem" };
    }
}
