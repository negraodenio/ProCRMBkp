"use server";

import { createClient } from "@/lib/supabase/server";

export async function searchPeople(query: string) {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return { success: false, error: "Não autorizado" };

    const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", userData.user.id)
        .single();

    if (!profile?.organization_id) return { success: false, error: "Organização não encontrada" };

    const { data: contacts, error } = await supabase
        .from("contacts")
        .select("id, name, company, email, role, expertise, verified, linkedin_url, status, tags")
        .eq("organization_id", profile.organization_id)
        .or(`name.ilike.%${query}%,company.ilike.%${query}%,role.ilike.%${query}%`)
        .order("verified", { ascending: false })
        .limit(20);

    if (error) return { success: false, error: error.message };

    return { success: true, contacts: contacts || [] };
}

export async function convertToLead(contactId: string) {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return { success: false, error: "Não autorizado" };

    const { error } = await supabase
        .from("contacts")
        .update({ status: "qualified", type: "lead" })
        .eq("id", contactId);

    if (error) return { success: false, error: error.message };

    // Log audit
    const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", userData.user.id)
        .single();

    await supabase.from("audit_logs").insert({
        action: "CONVERT_TO_LEAD",
        entity_type: "contact",
        entity_id: contactId,
        details: { event: "Contato convertido em lead qualificado" },
        organization_id: profile?.organization_id,
        user_id: userData.user.id
    });

    return { success: true };
}
