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
            const createRes = await EvolutionService.createInstance(instanceName);
            
            // If creation returns data with QR, use it directly!
            if (createRes && (createRes.qrcode || createRes.base64)) {
                data = createRes;
            } else {
                 // Fallback: Fetch connect again
                 data = await EvolutionService.connectInstance(instanceName);
            }
        }

        // AUTO-CONFIGURE WEBHOOK (SaaS Mode)
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://crmia.eu";
        const webhookUrl = `${appUrl}/api/webhooks/evolution`;
        
        console.log(`Configuring Webhook for ${instanceName} to ${webhookUrl}`);
        const webhookSuccess = await EvolutionService.setWebhook(instanceName, webhookUrl);

        // Handle different Evolution API versions response structures
        const qrBase64 = data?.qrcode?.base64 || 
                        data?.instance?.qrcode?.base64 || 
                        data?.base64 ||
                        data?.qrcode; // Sometimes it's direct string

        // Check if truly connected
        const instanceStatus = data?.instance?.status || data?.instance?.state;
        const isConnected = instanceStatus === 'open' || instanceStatus === 'connected';

        // If not connected and no QR, implies we are in a limbo state. 
        // We should probably delete and retry, or just return an error.
        // But for now, let's just return what we have.

        // Fix: If no QR and not connected, return null instanceName effectively (or error) so UI doesn't show "Connected".
        // But the UI checks `if (res.qrcode) { ... } else { ... connected }`
        // We need to signal "Not Connected" if no QR is present.
        
        if (!qrBase64 && !isConnected) {
             // Limbo state (e.g. "connecting" but no QR). 
             // Let's NOT return instanceName, so UI shows "Loading" or allows retry.
             return { error: "Aguardando QR Code... Tente novamente em 5s." };
        }

        return {
            qrcode: qrBase64,
            instanceName: isConnected ? instanceName : (qrBase64 ? instanceName : null),
            webhookUrl,
            webhookSuccess
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

    // Fetch Org Name to match creation logic
    const { data: org } = await supabase.from('organizations').select('name').eq('id', profile.organization_id).single();
    const orgName = org?.name || "Empresa";
    const sanitizedName = orgName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "");
    const shortId = profile.organization_id.split('-')[0];
    
    // New Naming Scheme
    const instanceName = `${sanitizedName}-${shortId}`;
    
    // Attempt delete
    await EvolutionService.deleteInstance(instanceName);

    // Also try legacy name just in case (Cleanup)
    try {
         await EvolutionService.deleteInstance(`bot-${profile.organization_id}`);
    } catch (e) {}

    return { success: true };
}
