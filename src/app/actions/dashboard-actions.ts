"use server";

import { createClient } from "@/lib/supabase/server";

export async function getDashboardMetrics() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.id)
        .single();
    
    if (!profile?.organization_id) return null;

    // 1. Count Research Assets (Proposals in draft or new)
    const { count: assetsCount } = await supabase
        .from("proposals")
        .select("*", { count: 'exact', head: true })
        .eq("organization_id", profile.organization_id);

    // 2. Count Matches (Audit logs or specific table)
    const { count: matchesCount } = await supabase
        .from("audit_logs")
        .select("*", { count: 'exact', head: true })
        .eq("action", "MATCH_RUN")
        .eq("organization_id", profile.organization_id);

    // 3. Count Contacts (leads)
    const { count: contactsCount } = await supabase
        .from("contacts")
        .select("*", { count: 'exact', head: true })
        .eq("organization_id", profile.organization_id);

    // 4. Get Industry Distribution
    const { data: industryData } = await supabase
        .from("market_intelligence_companies")
        .select("industry")
        .eq("organization_id", profile.organization_id);
    
    const sectors = industryData?.reduce((acc: any, curr) => {
        acc[curr.industry] = (acc[curr.industry] || 0) + 1;
        return acc;
    }, {});

    // Count researchers
    const { count: researcherCount } = await supabase
        .from("researchers")
        .select("*", { count: 'exact', head: true })
        .eq("organization_id", profile.organization_id);

    // Count campaigns
    const { count: campaignCount } = await supabase
        .from("outreach_campaigns")
        .select("*", { count: 'exact', head: true })
        .eq("organization_id", profile.organization_id);

    return {
        assets: assetsCount || 0,
        matches: matchesCount || 0,
        contacts: contactsCount || 0,
        researchers: researcherCount || 0,
        campaigns: campaignCount || 0,
        sectors: sectors || {}
    };
}
