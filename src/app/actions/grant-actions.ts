"use server";

import { createClient } from "@/lib/supabase/server";
import { aiChat } from "@/lib/ai/client";

export async function searchGrants(researchTopic: string) {
    if (!researchTopic) return { success: false, error: "Tópico de pesquisa é necessário" };

    try {
        const supabase = await createClient();
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return { success: false, error: "Nío autorizado" };

        const { data: profile } = await supabase
            .from("profiles")
            .select("organization_id")
            .eq("id", userData.user.id)
            .single();

        if (!profile?.organization_id) return { success: false, error: "Org nío encontrada" };

        // 1. Fetch grants from DB
        const { data: dbGrants, error } = await supabase
            .from("grants")
            .select("*")
            .eq("organization_id", profile.organization_id)
            .order("relevance_score", { ascending: false });

        if (error) throw error;

        // 2. Use AI to rank and add justification for each grant based on research topic
        const grantsWithJustification = await Promise.all(
            (dbGrants || []).map(async (grant) => {
                const prompt = `Analise a aderência do seguinte edital de fomento à pesquisa do usuário.

Edital: ${grant.name} (${grant.agency}) - ${grant.description}
Pesquisa do Usuário: ${researchTopic}

Em exatamente 2 frases, explique por que este edital é (ou nío é) adequado para esta pesquisa. 
Mencione aspectos específicos do edital que conectam com a pesquisa. Responda em Português do Brasil.`;

                try {
                    const justification = await aiChat({
                        model: "fast",
                        messages: [{ role: "user", content: prompt }],
                        max_tokens: 150
                    });

                    return {
                        ...grant,
                        justificativa: justification,
                        nome: grant.name,
                        agencia: grant.agency,
                        valor: grant.value,
                        prazo: grant.deadline
                    };
                } catch {
                    return {
                        ...grant,
                        justificativa: grant.description,
                        nome: grant.name,
                        agencia: grant.agency,
                        valor: grant.value,
                        prazo: grant.deadline
                    };
                }
            })
        );

        // 3. Log the search
        await supabase.from("audit_logs").insert({
            action: "GRANT_SEARCH",
            entity_type: "grants",
            details: { researchTopic, grantsFound: grantsWithJustification.length },
            organization_id: profile.organization_id,
            user_id: userData.user.id
        });

        return { success: true, grants: grantsWithJustification };
    } catch (error: any) {
        console.error("Grant Search Error:", error);
        return { success: false, error: "Falha ao buscar editais: " + error.message };
    }
}
