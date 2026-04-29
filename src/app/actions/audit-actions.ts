"use server";

import { createClient } from "@/lib/supabase/server";

export async function getAuditLogs() {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return { success: false, error: "Nío autorizado" };

    const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", userData.user.id)
        .single();

    if (!profile?.organization_id) return { success: false, error: "Org nío encontrada" };

    const { data: logs, error } = await supabase
        .from("audit_logs")
        .select("id, action, entity_type, entity_id, details, user_id, hmac_hash, previous_hash, chain_verified, created_at")
        .eq("organization_id", profile.organization_id)
        .order("created_at", { ascending: false })
        .limit(50);

    if (error) return { success: false, error: error.message };

    // Get user profiles for display names
    const userIds = [...new Set(logs?.map(l => l.user_id).filter(Boolean))];
    const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p.full_name || p.email || "Sistema"]) || []);

    const enrichedLogs = logs?.map(log => ({
        ...log,
        user_name: profileMap.get(log.user_id) || "Sistema",
        timestamp: new Date(log.created_at).toLocaleString("pt-BR", { 
            timeZone: "America/Sao_Paulo",
            dateStyle: "short",
            timeStyle: "medium"
        })
    })) || [];

    // Verify chain integrity
    let chainIntact = true;
    for (let i = 0; i < enrichedLogs.length - 1; i++) {
        if (enrichedLogs[i].previous_hash && enrichedLogs[i + 1].hmac_hash) {
            if (enrichedLogs[i].previous_hash !== enrichedLogs[i + 1].hmac_hash) {
                chainIntact = false;
                break;
            }
        }
    }

    return { 
        success: true, 
        logs: enrichedLogs,
        chainIntact,
        totalLogs: enrichedLogs.length
    };
}
