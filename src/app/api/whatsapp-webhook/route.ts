import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logWhatsAppMessage } from '@/app/leads/[id]/actions'
import { analyzeMessageIntent } from '@/lib/ai/summarize'
import { createSmartAlert } from '@/app/automations/actions'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Log para debug
    console.log('[Webhook] Recebido:', JSON.stringify(body, null, 2))

    const supabase = await createClient()

    // Extrair dados da mensagem
    const message = body.data
    if (!message) {
      return NextResponse.json({ error: 'No message data' }, { status: 400 })
    }

    const phone = message.key?.remoteJid?.replace('@s.whatsapp.net', '')
    const messageText = message.message?.conversation ||
                       message.message?.extendedTextMessage?.text ||
                       '[Mídia não suportada]'

    const isFromMe = message.key?.fromMe || false
    const direction = isFromMe ? 'outbound' : 'inbound'

    if (!phone) {
      console.log('[Webhook] Telefone não encontrado')
      return NextResponse.json({ error: 'No phone number' }, { status: 400 })
    }

    // Buscar lead pelo telefone
    const { data: lead } = await supabase
      .from('contacts')
      .select('id, organization_id, name, score, status')
      .eq('phone', phone)
      .eq('type', 'lead')
      .single()

    if (!lead) {
      console.log(`[Webhook] Lead não encontrado para telefone: ${phone}`)
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    // 1. Registrar mensagem no histórico
    await logWhatsAppMessage(
      lead.id,
      lead.organization_id,
      messageText,
      direction,
      {
        phone,
        messageId: message.key?.id,
        timestamp: message.messageTimestamp
      }
    )

    console.log(`[Webhook] Mensagem registrada no histórico para lead ${lead.name}`)

    // 2. Se for mensagem do cliente, analisar intenção com IA
    if (direction === 'inbound') {
      try {
        // Buscar histórico recente
        const { data: history } = await supabase
          .from('conversation_history')
          .select('type, content, direction, created_at')
          .eq('contact_id', lead.id)
          .order('created_at', { ascending: false })
          .limit(5)

        const analysis = await analyzeMessageIntent(messageText, history || [])

        console.log(`[Webhook] Análise de intenção:`, analysis)

        // 3. Se detectou lead quente, criar alerta
        if (analysis.urgency === 'high' || analysis.score > 70) {
          await createSmartAlert(
            lead.organization_id,
            'hot_lead',
            `Lead Quente: ${lead.name}`,
            `Detectada alta intenção de compra (${analysis.score}%). ${analysis.suggested_action}`,
            'critical',
            lead.id,
            undefined,
            {
              intent: analysis.intent,
              score: analysis.score,
              message: messageText
            }
          )

          console.log(`[Webhook] Alerta de lead quente criado!`)
        }

        // 4. Atualizar score do lead se necessário
        if (analysis.score > (lead.score || 0)) {
          await supabase
            .from('contacts')
            .update({
              score: analysis.score,
              last_contact: new Date().toISOString()
            })
            .eq('id', lead.id)

          console.log(`[Webhook] Score atualizado: ${lead.score} → ${analysis.score}`)
        }

      } catch (error) {
        console.error('[Webhook] Erro na análise de IA:', error)
        // Continua mesmo se a IA falhar
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      lead: lead.name
    })

  } catch (error) {
    console.error('[Webhook] Erro:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'WhatsApp Webhook Integration Active'
  })
}
