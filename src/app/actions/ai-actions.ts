"use server";

import { aiChat } from "@/lib/ai/client";
import { createClient } from "@/lib/supabase/server";

export async function generateAIContent(toolId: string, leadId: string) {
    if (!leadId) {
        return { success: false, error: "Lead ID is required" };
    }

    // 1. Fetch Lead Data
    const supabase = await createClient();
    const { data: lead, error } = await supabase
        .from("contacts")
        .select("*")
        .eq("id", leadId)
        .single();

    if (error || !lead) {
        console.error("Error fetching lead:", error);
        return { success: false, error: "Lead not found" };
    }

    // 2. Fetch History (Optional - Messages)
    const { data: messages } = await supabase
        .from("messages")
        .select("content, direction, created_at")
        .eq("contact_id", leadId) // Assuming contact_id exists in messages table based on schema? No, messages link to conversations.
        // Wait, schema says messages -> conversation -> contact_id (actually conversation has contact_phone)
        // Let's keep it simple for now and just use lead data.
        .limit(5);

    const context = `
    Lead Name: ${lead.name}
    Company: ${lead.company || "N/A"}
    Email: ${lead.email || "N/A"}
    Phone: ${lead.phone || "N/A"}
    Status: ${lead.status || "N/A"}
    Source: ${lead.source || "N/A"}
  `;

    let systemPrompt = "";
    let userPrompt = "";
    let model: "general" | "fast" | "coding" | "sentiment" = "general";

    switch (toolId) {
        case "generate-proposal":
            systemPrompt = "Você é um Consultor de Negócios Sênior especialista em ROI e Propostas de Valor. Gere um Business Case estratégico.";
            userPrompt = `Gere um Business Case detalhado para o seguinte prospect.
      Foque em: Diagnóstico do Momento, Proposta de Valor, Estimativa de ROI (realista em R$), Cronograma Estratégico e Próximos Passos.
      Use uma linguagem executiva e persuasiva. Responda APENAS em Português do Brasil em Markdown.

      Contexto do Prospect:
      ${context}`;
            model = "general";
            break;

        case "predictive-analysis":
            systemPrompt = "Você é um cientista de dados especializado em Revenue Operations (RevOps). Analise a propensão de fechamento.";
            userPrompt = `Analise a propensão de conversão para este prospect. Retorne:
      1. Score de Propensão (0-100%).
      2. Vetores de Aceleração (O que ajuda).
      3. Pontos de Fricção (Barreiras prováveis).
      4. Recomendação Estratégica.
      Responda APENAS em Português do Brasil em Markdown.

      Contexto:
      ${context}`;
            model = "general";
            break;

        case "categorize-lead":
            systemPrompt = "Você é um especialista em SDR/BDR de alta performance. Realize o Lead Scoring.";
            userPrompt = `Avalie e classifique este lead com base nos critérios de FIT e INTENÇÃO.
      Retorne: Classificação (A, B, C), ICP Match (0-100%) e Prioridade de Atendimento.
      Responda APENAS em Português do Brasil.

      Contexto:
      ${context}`;
            model = "fast";
            break;

        case "generate-email":
            systemPrompt = "Você é um copywriter sênior focado em Outbound Marketing e Persuasão.";
            userPrompt = `Escreva um e-mail de follow-up ultra-personalizado.
      Use gatilhos de curiosidade e autoridade. Foque no problema do cliente (dor) e não apenas na solução.
      Responda APENAS em Português do Brasil.

      Contexto:
      ${context}`;
            model = "general";
            break;

        case "sentiment-analysis":
            systemPrompt = "Você é um especialista em Psicologia do Consumidor e Inteligência Emocional.";
            userPrompt = `Avalie o Perfil Comportamental e o nível de Engajamento deste prospect.
      Retorne: Termômetro de Engajamento, Clima Relacional (Positivo/Neutro/Risco) e Recomendações de Rapport.
      Responda APENAS em Português do Brasil.

      Contexto:
      ${context}`;
            model = "sentiment";
            break;

        case "next-action":
            systemPrompt = "Você é um coach estratégico de vendas.";
            userPrompt = `Sugira a ÚNICA melhor próxima ação para este lead. Seja específico.
      Responda APENAS em Português do Brasil.

      Contexto do Cliente:
      ${context}`;
            model = "general";
            break;

        case "objection-handler":
            systemPrompt = "Você é um Master Negotiator. Use o método Sandler e técnicas de Reenquadramento (Reframing) para tratar objeções.";
            userPrompt = `O prospect está apresentando resistência. Identifique as objeções ocultas e forneça:
            1. Técnica de 'Reverse' (Perguntas para aprofundar a dor).
            2. Argumentação de Contorno (Focus on Value).
            3. Call to Action de Fechamento.
            Responda APENAS em Português do Brasil.

            Contexto:
            ${context}`;
            model = "general";
            break;

        case "sales-script":
            systemPrompt = "Você é um Arquiteto de Conversas de Vendas. Use a metodologia SPIN Selling.";
            userPrompt = `Desenvolva um Framework de Conversa para este prospect específico.
            Divida em: Perguntas de Situação, Problema, Implicação (dor) e Necessidade de Solução.
            Inclua 'Power Statements' para gerar autoridade imediata.
            Responda APENAS em Português do Brasil.

            Contexto:
            ${context}`;
            model = "general";
            break;

        case "meeting-prep":
            systemPrompt = "Você é um Consultor de Estratégia Comercial preparando um Dossiê Executivo.";
            userPrompt = `Prepare um Dossiê Pré-Reunião de alto impacto:
            1. Pain Points Detectados.
            2. Stakeholders Prováveis e Interesses.
            3. Agenda 'Customer-Centric'.
            4. Possíveis 'Deal Breakers' e como evitá-los.
            Responda APENAS em Português do Brasil.

            Contexto:
            ${context}`;
            model = "general";
            break;

        default:
            return { success: false, error: "Tool not recognized" };
    }

    try {
        const result = await aiChat({
            model: model,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            temperature: 0.7
        });

        // Log operation
        try {
            const { data: userData } = await supabase.auth.getUser();
            if (userData.user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("organization_id")
                    .eq("id", userData.user.id)
                    .single();

                if (profile) {
                    await supabase.from("ai_operations").insert({
                        organization_id: profile.organization_id,
                        user_id: userData.user.id,
                        tool_used: toolId,
                        target_entity_id: leadId,
                        input_params: { leadId },
                        output_result: { result: result.substring(0, 500) },
                        model_used: model,
                        tokens_used: 0, // SiliconFlow doesn't return usage easily in this simple call
                    });
                }
            }
        } catch (logError) {
            console.error("Failed to log AI operation:", logError);
        }

        return { success: true, result };
    } catch (error: any) {
        console.error("AI Action Error:", error);
        return { success: false, error: error.message };
    }
}
