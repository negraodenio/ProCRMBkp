'use server'

import OpenAI from 'openai'

// Duplicating the fallback AI engine configuration locally for portability
const AI_PROVIDERS = [
  {
    name: 'SiliconFlow (DeepSeek)',
    baseURL: 'https://api.siliconflow.cn/v1',
    apiKey: process.env.SILICONFLOW_API_KEY,
    model: 'deepseek-ai/DeepSeek-V3',
    enabled: !!process.env.SILICONFLOW_API_KEY
  },
  {
    name: 'SiliconFlow (Kimi)',
    baseURL: 'https://api.siliconflow.cn/v1',
    apiKey: process.env.SILICONFLOW_API_KEY,
    model: 'Qwen/Qwen2.5-7B-Instruct',
    enabled: !!process.env.SILICONFLOW_API_KEY
  },
  {
    name: 'OpenRouter',
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
    model: 'deepseek/deepseek-chat',
    enabled: !!process.env.OPENROUTER_API_KEY
  },
  {
    name: 'OpenAI',
    baseURL: 'https://api.openai.com/v1',
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4o-mini',
    enabled: !!process.env.OPENAI_API_KEY
  }
]

async function callAIWithFallback(
  systemPrompt: string,
  userPrompt: string,
  jsonMode: boolean = false
): Promise<string> {
  const enabledProviders = AI_PROVIDERS.filter(p => p.enabled)

  if (enabledProviders.length === 0) {
    throw new Error('Nenhum provider de IA configurado. Verifique as chaves de API.')
  }

  let lastError: Error | null = null

  for (const provider of enabledProviders) {
    try {
      console.log(`[IA Funnel] Tentando ${provider.name} (${provider.model})...`)

      const client = new OpenAI({
        baseURL: provider.baseURL,
        apiKey: provider.apiKey,
      })

      const response = await client.chat.completions.create({
        model: provider.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        ...(jsonMode && { response_format: { type: 'json_object' } }),
        temperature: 0.3, // Lower temperature for analytical answers
      })

      const content = response.choices[0].message.content
      if (!content) {
        throw new Error('Resposta vazia da IA')
      }

      console.log(`[IA Funnel] ✅ Sucesso com ${provider.name}`)
      return content

    } catch (error) {
      console.error(`[IA Funnel] ❌ Falha com ${provider.name}:`, error)
      lastError = error as Error
      continue
    }
  }

  throw new Error(`Todos os providers de IA falharam. Último erro: ${lastError?.message}`)
}

export interface FunnelAnalysisResult {
    bottleneck: string;
    actionable_insight: string;
    focus_deal: string;
}

export async function analyzeFunnelWithAI(data: {
    funnelName: string;
    stages: { id: string; name: string }[];
    proposals: {
        id: string;
        title: string;
        total: number;
        currency: string;
        stageName: string;
        daysInStage: number; // calculated on frontend
    }[];
}): Promise<{ success: boolean; data?: FunnelAnalysisResult; error?: string }> {

    // Validations
    if (!data.proposals || data.proposals.length === 0) {
        return { success: false, error: "Não há propostas suficientes no funil para analisar." }
    }

    // Prepare prompt data
    const stageSummary = data.stages.map(s => {
        const stageProposals = data.proposals.filter(p => p.stageName === s.name)
        const totalValue = stageProposals.reduce((sum, p) => sum + p.total, 0)
        return `- Etapa "${s.name}": ${stageProposals.length} propostas (Total: R$ ${totalValue.toFixed(2)})`
    }).join('\n')

    const proposalsDetails = data.proposals.map(p => {
        return `"${p.title}" - R$ ${p.total.toFixed(2)} [Etapa: ${p.stageName}] - PARADA HÁ: ${p.daysInStage} dias.`
    }).join('\n')

    const systemPrompt = `Você é um Diretor de Vendas Exigente e Estrategista.
Sua missão é dar 3 insights curtos e de alto impacto para o vendedor olhar o funil comercial dele.
Analise os dados fornecidos e retorne EXATAMENTE um JSON na estrutura solicitada.`

    const userPrompt = `
ANÁLISE DE FUNIL: ${data.funnelName}

RESUMO POR ETAPAS:
${stageSummary}

DETALHES DAS PROPOSTAS:
${proposalsDetails}

Retorne um objeto JSON com as seguintes chaves (em português brasileiro, textos curtos e diretos):
1. "bottleneck": Aponta onde está o maior dinheiro parado ou a etapa mais engarrafada (ex: "Seu maior gargalo financeiro está na etapa de Negociação (R$ 45.000 parados).").
2. "actionable_insight": Uma ação clara sobre as propostas esfriando/paradas (ex: "A proposta da empresa XYZ está parada há 15 dias, faça um follow-up urgente hoje.").
3. "focus_deal": Aponta a principal oportunidade para focar a energia (ex: "Foque na proposta X, pois tem o maior ticket médio (R$ 15.000) e está perto do fechamento.").

Responda SOMENTE o JSON válido.
`

    try {
        const aiResponse = await callAIWithFallback(systemPrompt, userPrompt, true)
        const parsed = JSON.parse(aiResponse) as FunnelAnalysisResult;

        if (!parsed.bottleneck || !parsed.actionable_insight || !parsed.focus_deal) {
            return { success: false, error: "A IA não retornou o formato esperado." }
        }

        return { success: true, data: parsed }
    } catch (error: any) {
        return { success: false, error: error.message || "Erro desconhecido ao analisar o funil." }
    }
}
