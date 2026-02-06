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

    // Fetch Org Name for friendly instance name
    const { data: org } = await supabase.from('organizations').select('name').eq('id', profile.organization_id).single();
    const orgName = org?.name || "Empresa";

    // Sanitize Name: "My Company Ção" -> "MyCompanyCao"
    const sanitizedName = orgName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "");
    
    // Create Friendly Name: Name-First4CharsOfUUID (e.g. "MyCompany-1a2b")
    // This is readable but unique enough per company.
    const shortId = profile.organization_id.split('-')[0]; 
    const instanceName = `${sanitizedName}-${shortId}`;

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



        // Handle different Evolution API versions response structures
        const qrBase64 = data?.qrcode?.base64 || 
                        data?.instance?.qrcode?.base64 || 
                        data?.base64;

        return {
            qrcode: qrBase64,
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

    const instanceName = `bot-${profile.organization_id}`;
    await EvolutionService.deleteInstance(instanceName);
    return { success: true };
}
