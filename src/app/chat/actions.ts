"use strict";

import { createClient } from "@/lib/supabase/server";
import { EvolutionService } from "@/services/evolution";

export async function sendMessageAction(conversationId: string, text: string) {
    const supabase = await createClient();
    
    // 1. Get User/Org Context
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: profile } = await supabase.from("profiles").select("organization_id").eq("id", user.id).single();
    if (!profile) throw new Error("Org not found");

    // 2. Get Conversation Details (Phone)
    const { data: conversation } = await supabase
        .from("conversations")
        .select("*")
        .eq("id", conversationId)
        .single();
    
    if (!conversation) throw new Error("Conversation not found");

    // 3. Send via Evolution
    // We assume the instance name is bot-{org_id} or similar as defined in webhook
    // A better way is to store instance name in the conversation or org
    const instanceName = `bot-${profile.organization_id}`; 
    // Wait, let's use the same logic as the logout: sanitizedName-ShortID
    // To be safe, let's try to find an active instance for this org.
    // In this MVP, we use the instanceName derived in actions.ts logic.
    
    // For now, let's use the most robust naming:
    const orgRes = await supabase.from("organizations").select("name").eq("id", profile.organization_id).single();
    const orgName = orgRes.data?.name || "Empresa";
    const sanitizedName = orgName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "");
    const shortId = profile.organization_id.split('-')[0];
    const derivedInstanceName = `${sanitizedName}-${shortId}`;

    const res = await EvolutionService.sendMessage(derivedInstanceName, conversation.contact_phone, text);
    
    if (!res) throw new Error("Failed to send message via WhatsApp");

    // 4. Save to Database
    const { data: newMessage, error: msgError } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        organization_id: profile.organization_id,
        content: text,
        direction: "outbound",
        status: "sent"
    }).select().single();

    // 5. Update Conversation timestamp
    await supabase.from("conversations").update({
        last_message_content: text,
        last_message_at: new Date().toISOString()
    }).eq("id", conversationId);

    return newMessage;
}
