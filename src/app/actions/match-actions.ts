"use server";

import { createClient } from "@/lib/supabase/server";
import { generateEmbedding, aiChat } from "@/lib/ai/client";

export async function findCorporateMatches(researchText: string) {
    if (!researchText) return { success: false, error: "Texto da pesquisa é necessário" };

    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return { success: false, error: "Não autorizado" };

    const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", userData.user.id)
        .single();
    
    if (!profile?.organization_id) return { success: false, error: "Organização não encontrada" };

    try {
        // 1. Generate Embedding for the Research
        const embedding = await generateEmbedding(researchText);

        // 2. Query DB for top company matches
        const { data: matches, error } = await supabase.rpc("match_research_to_companies", {
            query_embedding: embedding,
            match_threshold: 0.0,
            match_count: 5,
            org_id: profile.organization_id
        });

        if (error) throw error;
        if (!matches || matches.length === 0) return { success: true, matches: [] };

        // 3. For each match, generate a Rational using AI
        const matchesWithRational = await Promise.all(matches.map(async (m: any) => {
            const rationalPrompt = `
            Com base na tecnologia abaixo e no perfil da empresa, explique em 2 frases POR QUE existe um match estratégico.
            
            Tecnologia: ${researchText.substring(0, 500)}...
            Empresa: ${m.company_name} - ${m.company_description}
            
            Responda em Português do Brasil.
            `;

            const rational = await aiChat({
                model: "fast",
                messages: [{ role: "user", content: rationalPrompt }]
            });

            return {
                id: m.company_id,
                name: m.company_name,
                industry: m.company_industry,
                description: m.company_description,
                similarity: m.similarity,
                rational
            };
        }));

        return { success: true, matches: matchesWithRational };
    } catch (error: any) {
        console.error("Match Error:", error);
        return { success: false, error: error.message };
    }
}

export async function convertMatchToLead(companyId: string, researchTitle: string) {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return { success: false, error: "Não autorizado" };

    // 1. Get company data
    const { data: company } = await supabase
        .from("market_intelligence_companies")
        .select("*")
        .eq("id", companyId)
        .single();
    
    if (!company) return { success: false, error: "Empresa não encontrada" };

    // 2. Insert into Contacts as Lead
    const { data: lead, error: leadError } = await supabase.from("contacts").insert({
        organization_id: company.organization_id,
        name: company.name,
        company: company.name,
        type: "lead",
        status: "new",
        source: "AI Matchmaking",
        tags: ["FirstIgnite", researchTitle]
    }).select().single();

    if (leadError) return { success: false, error: leadError.message };

    return { success: true, leadId: lead.id };
}
