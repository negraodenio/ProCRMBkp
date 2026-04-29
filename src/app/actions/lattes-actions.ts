"use server";

import { createClient } from "@/lib/supabase/server";

export async function syncLattesProfile(researcherName: string) {
    // Mocking the sync process for the tender demo
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
        const supabase = await createClient();
        const { data: userData } = await supabase.auth.getUser();
        
        if (!userData.user) return { success: false, error: "Unauthorized" };

        // Log the sync operation
        await supabase.from("ai_operations").insert({
            organization_id: (await supabase.from("profiles").select("organization_id").eq("id", userData.user.id).single()).data?.organization_id,
            user_id: userData.user.id,
            tool_used: "lattes_sync",
            input_params: { researcherName },
            output_result: { status: "success", syncedAt: new Date().toISOString() }
        });

        return { 
            success: true, 
            message: `Currículo Lattes de '${researcherName}' sincronizado com sucesso!`,
            stats: {
                publicationsFound: Math.floor(Math.random() * 20) + 5,
                patentsIdentified: Math.floor(Math.random() * 3),
                lastUpdate: new Date().toLocaleDateString('pt-BR')
            }
        };
    } catch (error) {
        return { success: false, error: "Falha na sincronização." };
    }
}
