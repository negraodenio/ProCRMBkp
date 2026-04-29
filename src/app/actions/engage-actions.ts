"use server";

import { createClient } from "@/lib/supabase/server";
import { sendOutreachEmail } from "@/lib/mail";

export async function findCompanyContacts(companyId: string) {
    // In a real scenario, this would call Apollo/Lusha API
    // For now, we simulate finding the key decision makers
    
    const supabase = await createClient();
    const { data: company } = await supabase
        .from("market_intelligence_companies")
        .select("name, industry")
        .eq("id", companyId)
        .single();

    if (!company) return { success: false, error: "Empresa não encontrada" };

    // Mocked contacts
    const contacts = [
        {
            name: "Dr. Carlos Silva",
            role: "Head of Innovation",
            email: "carlos.silva@example.com",
            linkedin: "https://linkedin.com/in/mock",
            company: company.name
        },
        {
            name: "Mariana Costa",
            role: "CTO / Diretor Técnico",
            email: "mariana.costa@example.com",
            linkedin: "https://linkedin.com/in/mock",
            company: company.name
        }
    ];

    return { success: true, contacts };
}

export async function startOutreachCampaign(params: {
    contactEmail: string,
    contactName: string,
    companyName: string,
    researchTitle: string,
    teaserContent: string
}) {
    const { contactEmail, contactName, companyName, researchTitle, teaserContent } = params;

    const res = await sendOutreachEmail({
        to: contactEmail,
        subject: `Parceria Tecnológica: ${researchTitle} | ${companyName}`,
        recipientName: contactName,
        companyName: companyName,
        researchTitle: researchTitle,
        teaserContent: teaserContent
    });

    if (res.success) {
        // Log action in a real CRM would go here
        return { success: true };
    } else {
        return { success: false, error: "Falha ao enviar e-mail de outreach" };
    }
}
