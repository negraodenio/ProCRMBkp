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

export async function summarizeConversation(messages: Message[]): Promise<SummaryResult> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY não configurada')
  }

  const openai = new OpenAI({ apiKey })

  // Formatar mensagens para o prompt
  const conversationText = messages
    .map(m => {
      const direction = m.direction === 'inbound' ? 'Cliente' : 'Vendedor'
      return `[${direction}] ${m.content}`
    })
    .join('\n')

  const prompt = `Analise as seguintes conversas com um lead/cliente e forneça um resumo estruturado em JSON:

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
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Você é um assistente de vendas especializado em analisar conversas e extrair insights acionáveis.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    })

    const result = JSON.parse(response.choices[0].message.content || '{}')

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
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY não configurada')
  }

  const openai = new OpenAI({ apiKey })

  const historyText = history.slice(-5).map(m => m.content).join('\n')

  const prompt = `Analise a mensagem mais recente de um lead e retorne em JSON:

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
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em qualificação de leads e análise de intenção de compra.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    })

    const result = JSON.parse(response.choices[0].message.content || '{}')

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
