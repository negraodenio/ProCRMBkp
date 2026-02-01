'use server'

import { EvolutionService } from "@/services/evolution";
import { createClient } from "@/lib/supabase/server";

export async function getQrCode() {
    const supabase = await createClient();

    // 1. Get User's Organization to name the bot
    const { data: profile } = await supabase.from('profiles').select('organization_id, full_name').single();

    if (!profile?.organization_id) {
        return { error: "Organization not found" };
    }

    // Use Org ID or a safe slug as Instance Name
    const instanceName = `bot-${profile.organization_id.slice(0, 8)}`;

    try {
        // 2. Try to Connect (Get QR)
        let data = await EvolutionService.connectInstance(instanceName);

        // 3. If "Instance not found", Create it
        if (!data || (data.status && data.status === 404)) {
            console.log("Instance not found, creating...");
            await EvolutionService.createInstance(instanceName);
            // Fetch QR again
            data = await EvolutionService.connectInstance(instanceName);
        }

        // Evolution returns { base64: "..." } or similar
        // Adjust based on your specific Evolution Version response structure
        return {
            qrcode: data?.base64 || data?.qrcode,
            instanceName
        };

    } catch (error: any) {
        console.error("Evolution Action Error:", error);
        return { error: error.message };
    }
}

export async function logoutWhatsApp() {
    const supabase = await createClient();
    const { data: profile } = await supabase.from('profiles').select('organization_id').single();
    if (!profile?.organization_id) return;

    const instanceName = `bot-${profile.organization_id.slice(0, 8)}`;
    await EvolutionService.deleteInstance(instanceName);
    return { success: true };
}
