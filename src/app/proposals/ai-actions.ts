'use server'

import { summarizeConversation } from '@/lib/ai/summarize' // Importing just to get access to the AI fallback logic, but we should probably expose the callAIWithFallback. For now, since callAIWithFallback is not exported, we will recreate the AI API call here or export it.

import OpenAI from 'openai'

// Duplicando a configuraçío de providers com fallback do lib/ai/summarize.ts para nío quebrar a lib existente
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
      console.log(`[IA Pitch] Tentando ${provider.name} (${provider.model})...`)

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
        temperature: 0.7, // Um pouco mais alto para criatividade na escrita
      })

      const content = response.choices[0].message.content
      if (!content) {
        throw new Error('Resposta vazia da IA')
      }

      console.log(`[IA Pitch] ✅ Sucesso com ${provider.name}`)
      return content

    } catch (error) {
      console.error(`[IA Pitch] ❌ Falha com ${provider.name}:`, error)
      lastError = error as Error
      continue
    }
  }

  throw new Error(`Todos os providers de IA falharam. Último erro: ${lastError?.message}`)
}

interface ProposalItemInput {
    name: string;
    unit_price: number;
    currency: string;
}

export async function generateProposalPitch(data: {
    clientName: string;
    items: ProposalItemInput[];
    total: number;
    organizationContext?: string;
}): Promise<{ success: boolean; data?: string; error?: string }> {

    // Validations
    if (!data.clientName) {
        return { success: false, error: "Nome do cliente é necessário." }
    }

    if (!data.items || data.items.length === 0) {
        return { success: false, error: "Adicione pelo menos um produto/serviço para a IA analisar." }
    }

    const itemsListText = data.items.map(i => `- ${i.name} (${i.currency} ${i.unit_price})`).join('\n')

    const systemPrompt = `Você é um Executivo de Vendas e Copywriter de elite.
Sua missío é escrever campos de 'Descriçío/Escopo' persuasivos, claros e diretos para propostas comerciais.
Use tom profissional, porém humano e engajador.

REGRAS ESTritas:
1. Nío escreva um e-mail. Nío use "Prezado [Nome]", nem "Atenciosamente".
2. O texto vai diretamente no corpo/descriçío de um PDF/Link de proposta de orçamento.
3. Nío use formataçío markdown complexa, apenas parágrafos bem divididos.
4. Foque no *valor e no problema que está sendo resolvido* pelos itens da proposta, nío apenas em listar características.
5. Maximize a percepçío de valor do pacote total.
6. Mantenha sucinto, idealmente de 2 a 3 parágrafos focados.`

    const userPrompt = `
Escreva uma descriçío atraente e persuasiva para a proposta abaixo destinada ao cliente/empresa: ${data.clientName}.

ITENS INCLUÍDOS NO PACOTE:
${itemsListText}

VALOR TOTAL DA PROPOSTA: ${data.items[0]?.currency} ${data.total}
`

    try {
        const generatedPitch = await callAIWithFallback(systemPrompt, userPrompt, false)
        return { success: true, data: generatedPitch }
    } catch (error: any) {
        return { success: false, error: error.message || "Erro desconhecido ao gerar Pitch." }
    }
}
