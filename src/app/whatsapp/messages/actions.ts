'use server'

import { EvolutionService } from "@/services/evolution";
import { createClient } from "@/lib/supabase/server";

export async function sendIntegratedWhatsAppMessage(phone: string, text: string) {
    const supabase = await createClient();

    // 1. Get User's Organization
    const { data: profile } = await supabase.from('profiles').select('organization_id').single();

    if (!profile?.organization_id) {
        throw new Error("Sessão ou Organização não encontrada.");
    }

    const instanceName = `bot-${profile.organization_id}`;

    try {
        // Enviar via Evolution API
        const response = await EvolutionService.sendMessage(instanceName, phone, text);

        // Registrar log se necessário (webhook já faz isso geralmente, mas podemos logar manual se for outbound)

        return { success: true, response };
    } catch (error: any) {
        console.error("Error sending integrated message:", error);
        return { success: false, error: error.message };
    }
}
