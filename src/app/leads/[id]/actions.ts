'use server'

import { createClient } from '@/lib/supabase/server'
import { summarizeConversation } from '@/lib/ai/summarize'

export async function getConversationHistory(contactId: string) {
  const supabase = await createClient()

  const { data: conversations, error } = await supabase
    .from('conversation_history')
    .select('*')
    .eq('contact_id', contactId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Erro ao buscar histórico:', error)
    return { conversations: [], summary: null }
  }

  // Buscar resumo mais recente
  const { data: summaryData } = await supabase
    .from('conversation_summaries')
    .select('*')
    .eq('contact_id', contactId)
    .order('generated_at', { ascending: false })
    .limit(1)
    .single()

  return {
    conversations: conversations || [],
    summary: summaryData || null
  }
}

export async function addNote(contactId: string, content: string, organizationId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Usuário não autenticado')
  }

  const { data, error } = await supabase
    .from('conversation_history')
    .insert({
      organization_id: organizationId,
      contact_id: contactId,
      type: 'note',
      direction: 'internal',
      content,
      created_by: user.id,
      metadata: {}
    })
    .select()
    .single()

  if (error) {
    console.error('Erro ao adicionar nota:', error)
    throw new Error('Falha ao adicionar nota')
  }

  return data
}

export async function generateSummary(contactId: string, organizationId: string) {
  const supabase = await createClient()

  // Buscar últimas 20 mensagens
  const { data: messages } = await supabase
    .from('conversation_history')
    .select('type, content, direction, created_at')
    .eq('contact_id', contactId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (!messages || messages.length === 0) {
    throw new Error('Nenhuma conversa encontrada')
  }

  // Gerar resumo com IA
  const summary = await summarizeConversation(messages.reverse())

  // Salvar resumo
  const { data, error } = await supabase
    .from('conversation_summaries')
    .insert({
      organization_id: organizationId,
      contact_id: contactId,
      summary: summary.summary,
      key_points: summary.key_points,
      sentiment: summary.sentiment,
      next_action: summary.next_action,
      confidence_score: summary.confidence_score,
      messages_analyzed: messages.length
    })
    .select()
    .single()

  if (error) {
    console.error('Erro ao salvar resumo:', error)
    throw new Error('Falha ao salvar resumo')
  }

  return data
}

export async function logWhatsAppMessage(
  contactId: string,
  organizationId: string,
  content: string,
  direction: 'inbound' | 'outbound',
  metadata: any = {}
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('conversation_history')
    .insert({
      organization_id: organizationId,
      contact_id: contactId,
      type: 'whatsapp',
      direction,
      content,
      metadata
    })
    .select()
    .single()

  if (error) {
    console.error('Erro ao registrar mensagem:', error)
    throw new Error('Falha ao registrar mensagem')
  }

  return data
}
