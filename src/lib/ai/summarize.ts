import OpenAI from 'openai'

interface Message {
  type: string
  content: string
  direction?: string
  created_at: string
}

interface SummaryResult {
  summary: string
  key_points: string[]
  sentiment: 'positive' | 'neutral' | 'negative'
  next_action: string
  confidence_score: number
}

// Configuração de providers com fallback
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
  jsonMode: boolean = true
): Promise<string> {
  const enabledProviders = AI_PROVIDERS.filter(p => p.enabled)

  if (enabledProviders.length === 0) {
    throw new Error('Nenhum provider de IA configurado. Configure SILICONFLOW_API_KEY, OPENROUTER_API_KEY ou OPENAI_API_KEY')
  }

  let lastError: Error | null = null

  for (const provider of enabledProviders) {
    try {
      console.log(`[IA] Tentando ${provider.name} (${provider.model})...`)

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
        temperature: 0.3,
      })

      const content = response.choices[0].message.content
      if (!content) {
        throw new Error('Resposta vazia da IA')
      }

      console.log(`[IA] ✅ Sucesso com ${provider.name}`)
      return content

    } catch (error) {
      console.error(`[IA] ❌ Falha com ${provider.name}:`, error)
      lastError = error as Error
      // Continua para o próximo provider
      continue
    }
  }

  // Se chegou aqui, todos falharam
  throw new Error(`Todos os providers de IA falharam. Último erro: ${lastError?.message}`)
}

export async function summarizeConversation(messages: Message[]): Promise<SummaryResult> {
  // Formatar mensagens para o prompt
  const conversationText = messages
    .map(m => {
      const direction = m.direction === 'inbound' ? 'Cliente' : 'Vendedor'
      return `[${direction}] ${m.content}`
    })
    .join('\n')

  const systemPrompt = 'Você é um assistente de vendas especializado em analisar conversas e extrair insights acionáveis.'

  const userPrompt = `Analise as seguintes conversas com um lead/cliente e forneça um resumo estruturado em JSON:

CONVERSAS:
${conversationText}

Retorne um JSON com:
{
  "summary": "Resumo em 2-3 linhas do contexto geral",
  "key_points": ["Ponto 1", "Ponto 2", "Ponto 3"],
  "sentiment": "positive" | "neutral" | "negative",
  "next_action": "Próxima ação sugerida para o vendedor",
  "confidence_score": 0.85
}

IMPORTANTE:
- summary: máximo 200 caracteres
- key_points: 3-5 pontos principais
- sentiment: análise do tom geral da conversa
- next_action: ação específica e prática
- confidence_score: 0-1 baseado na qualidade dos dados`

  try {
    const responseText = await callAIWithFallback(systemPrompt, userPrompt, true)
    const result = JSON.parse(responseText)

    return {
      summary: result.summary || 'Resumo não disponível',
      key_points: result.key_points || [],
      sentiment: result.sentiment || 'neutral',
      next_action: result.next_action || 'Aguardar resposta do cliente',
      confidence_score: result.confidence_score || 0.5
    }
  } catch (error) {
    console.error('Erro ao gerar resumo:', error)
    throw new Error('Falha ao gerar resumo com IA')
  }
}

export async function analyzeMessageIntent(message: string, history: Message[]): Promise<{
  intent: 'buying' | 'questioning' | 'objection' | 'casual'
  score: number
  suggested_action: string
  urgency: 'high' | 'medium' | 'low'
}> {
  const historyText = history.slice(-5).map(m => m.content).join('\n')

  const systemPrompt = 'Você é um especialista em qualificação de leads e análise de intenção de compra.'

  const userPrompt = `Analise a mensagem mais recente de um lead e retorne em JSON:

MENSAGEM ATUAL: "${message}"

HISTÓRICO RECENTE:
${historyText}

Retorne:
{
  "intent": "buying" | "questioning" | "objection" | "casual",
  "score": 0-100 (probabilidade de compra),
  "suggested_action": "Ação específica para o vendedor",
  "urgency": "high" | "medium" | "low"
}

CRITÉRIOS:
- buying: menciona preço, prazo, contrato, "quero comprar"
- questioning: pergunta sobre produto/serviço
- objection: preocupação, dúvida, "mas..."
- casual: conversa informal
- score: alto se mostrar intenção de compra
- urgency: high se precisar resposta imediata`

  try {
    const responseText = await callAIWithFallback(systemPrompt, userPrompt, true)
    const result = JSON.parse(responseText)

    return {
      intent: result.intent || 'casual',
      score: result.score || 0,
      suggested_action: result.suggested_action || 'Responder a mensagem',
      urgency: result.urgency || 'low'
    }
  } catch (error) {
    console.error('Erro ao analisar intenção:', error)
    throw new Error('Falha ao analisar mensagem')
  }
}
