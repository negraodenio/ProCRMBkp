"use server";

import { createClient } from "@/lib/supabase/server";

export async function getOutreachCampaigns() {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return { success: false, error: "Nío autorizado" };

    const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", userData.user.id)
        .single();

    if (!profile?.organization_id) return { success: false, error: "Org nío encontrada" };

    const { data: campaigns, error } = await supabase
        .from("outreach_campaigns")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .order("created_at", { ascending: false });

    if (error) return { success: false, error: error.message };

    // Compute aggregates
    const totalSent = campaigns?.reduce((a, c) => a + (c.total_sent || 0), 0) || 0;
    const totalOpened = campaigns?.reduce((a, c) => a + (c.total_opened || 0), 0) || 0;
    const totalClicked = campaigns?.reduce((a, c) => a + (c.total_clicked || 0), 0) || 0;
    const totalReplied = campaigns?.reduce((a, c) => a + (c.total_replied || 0), 0) || 0;

    return { 
        success: true, 
        campaigns: campaigns || [],
        stats: {
            totalSent,
            openRate: totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : "0",
            clickRate: totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(1) : "0",
            replyRate: totalSent > 0 ? ((totalReplied / totalSent) * 100).toFixed(1) : "0"
        }
    };
}

export async function createOutreachCampaign(params: {
    name: string;
    targetTechnology: string;
}) {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return { success: false, error: "Nío autorizado" };

    const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", userData.user.id)
        .single();

    if (!profile?.organization_id) return { success: false, error: "Org nío encontrada" };

    const { data: campaign, error } = await supabase
        .from("outreach_campaigns")
        .insert({
            organization_id: profile.organization_id,
            user_id: userData.user.id,
            name: params.name,
            target_technology: params.targetTechnology,
            status: "draft"
        })
        .select()
        .single();

    if (error) return { success: false, error: error.message };

    // Log audit
    await supabase.from("audit_logs").insert({
        action: "CREATE_CAMPAIGN",
        entity_type: "outreach",
        entity_id: campaign.id,
        details: { name: params.name, technology: params.targetTechnology },
        organization_id: profile.organization_id,
        user_id: userData.user.id
    });

    return { success: true, campaign };
}

export async function activateCampaign(campaignId: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("outreach_campaigns")
        .update({ status: "active", updated_at: new Date().toISOString() })
        .eq("id", campaignId);

    if (error) return { success: false, error: error.message };
    return { success: true };
}
