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
            systemPrompt = "Você é um especialista em vendas sênior. Gere uma proposta comercial profissional em Markdown.";
            userPrompt = `Gere uma proposta comercial para o seguinte lead (infira serviços de desenvolvimento web se não estiver claro).
      Inclua: Escopo, Investimento (crie uma estimativa realista em R$), Prazo e Garantia.
      Responda APENAS em Português do Brasil.
      
      Contexto do Cliente:
      ${context}`;
            model = "general";
            break;

        case "predictive-analysis":
            systemPrompt = "Você é um analista de dados de vendas. Analise a probabilidade de fechamento.";
            userPrompt = `Analise a probabilidade de fechamento para este lead. Retorne uma pontuação (0-100%) e bullet points para Fatores Positivos e Fatores de Atenção.
      Responda APENAS em Português do Brasil.
      
      Contexto do Cliente:
      ${context}`;
            model = "general";
            break;

        case "categorize-lead":
            systemPrompt = "Você é um especialista em qualificação de leads. Categorize o lead.";
            userPrompt = `Categorize este lead como FRIO (Cold), MORN (Warm) ou QUENTE (Hot). Forneça valor potencial e prioridade.
      Responda APENAS em Português do Brasil.
      
      Contexto do Cliente:
      ${context}`;
            model = "fast";
            break;

        case "generate-email":
            systemPrompt = "Você é um copywriter especialista em e-mails de vendas.";
            userPrompt = `Escreva um e-mail de follow-up personalizado para este lead. Mantenha um tom profissional e convidativo.
      Responda APENAS em Português do Brasil.
      
      Contexto do Cliente:
      ${context}`;
            model = "general";
            break;

        case "sentiment-analysis":
            systemPrompt = "Você é um especialista em análise de sentimento.";
            userPrompt = `Analise o sentimento deste lead com base no contexto. Retorne um rótulo (Positivo, Neutro, Negativo) e uma pontuação.
      Responda APENAS em Português do Brasil.
      
      Contexto do Cliente:
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
            systemPrompt = "Você é um mestre em negociação e especialista em vendas. Seu objetivo é ajudar o usuário a superar objeções de vendas.";
            userPrompt = `O lead está levantando objeções. Com base no contexto abaixo, identifique objeções prováveis e forneça respostas específicas e de alta conversão para superá-las, usando o método Sandler ou técnicas similares.
            Responda APENAS em Português do Brasil.
            
            Contexto do Cliente:
            ${context}`;
            model = "general";
            break;

        case "sales-script":
            systemPrompt = "Você é um roteirista para equipes de vendas de alta performance.";
            userPrompt = `Crie um roteiro de cold call ou follow-up para este lead específico. O roteiro deve ser natural, envolvente e focado em conseguir uma reunião ou fechar o negócio. Inclua instruções de tom (ex: [Entusiasmado], [Pausa para efeito]).
            Responda APENAS em Português do Brasil.
            
            Contexto do Cliente:
            ${context}`;
            model = "general"; // Scripting needs good writing
            break;

        case "meeting-prep":
            systemPrompt = "Você é um assistente executivo preparando um briefing para uma reunião VIP.";
            userPrompt = `Tenho uma reunião com este lead. Prepare um briefing abrangente incluindo:
            1. Pontos de conversa principais baseados no histórico/status.
            2. Objetivo da reunião.
            3. Riscos potenciais/red flags.
            4. Uma agenda personalizada.
            Responda APENAS em Português do Brasil.
            
            Contexto do Cliente:
            ${context}`;
            model = "general"; // Analysis needs 'general' (DeepSeek/Qwen 72B)
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
