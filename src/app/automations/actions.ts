'use server'

import { createClient } from '@/lib/supabase/server'

export async function getWorkflows(organizationId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('workflows')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar workflows:', error)
    return []
  }

  return data || []
}

export async function createWorkflow(
  organizationId: string,
  name: string,
  description: string,
  triggerType: string,
  triggerConfig: any,
  actions: any[]
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Usuário não autenticado')
  }

  const { data, error } = await supabase
    .from('workflows')
    .insert({
      organization_id: organizationId,
      name,
      description,
      trigger_type: triggerType,
      trigger_config: triggerConfig,
      actions,
      created_by: user.id
    })
    .select()
    .single()

  if (error) {
    console.error('Erro ao criar workflow:', error)
    throw new Error('Falha ao criar workflow')
  }

  return data
}

export async function toggleWorkflow(workflowId: string, isActive: boolean) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('workflows')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', workflowId)

  if (error) {
    console.error('Erro ao atualizar workflow:', error)
    throw new Error('Falha ao atualizar workflow')
  }
}

export async function deleteWorkflow(workflowId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('workflows')
    .delete()
    .eq('id', workflowId)

  if (error) {
    console.error('Erro ao deletar workflow:', error)
    throw new Error('Falha ao deletar workflow')
  }
}

export async function getSmartAlerts(organizationId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('smart_alerts')
    .select(`
      *,
      contacts(name, email, phone),
      deals(title, value)
    `)
    .eq('organization_id', organizationId)
    .eq('is_read', false)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Erro ao buscar alertas:', error)
    return []
  }

  return data || []
}

export async function markAlertAsRead(alertId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('smart_alerts')
    .update({ is_read: true })
    .eq('id', alertId)

  if (error) {
    console.error('Erro ao marcar alerta:', error)
    throw new Error('Falha ao marcar alerta como lido')
  }
}

// Função para criar alertas automaticamente
export async function createSmartAlert(
  organizationId: string,
  type: string,
  title: string,
  description: string,
  severity: 'info' | 'warning' | 'critical',
  contactId?: string,
  dealId?: string,
  metadata?: any
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('smart_alerts')
    .insert({
      organization_id: organizationId,
      type,
      title,
      description,
      severity,
      contact_id: contactId,
      deal_id: dealId,
      metadata: metadata || {}
    })
    .select()
    .single()

  if (error) {
    console.error('Erro ao criar alerta:', error)
    throw new Error('Falha ao criar alerta')
  }

  return data
}

// Função para calcular probabilidade de fechamento
export async function calculateCloseProbability(lead: any, deal?: any): Promise<number> {
  let probability = 0

  // Score do lead (peso: 30%)
  if (lead.score) {
    probability += (lead.score / 100) * 30
  }

  // Engajamento (peso: 25%)
  if (lead.last_contact) {
    const daysSinceContact = Math.floor(
      (Date.now() - new Date(lead.last_contact).getTime()) / (1000 * 60 * 60 * 24)
    )
    const engagementScore = Math.max(0, 100 - daysSinceContact * 10)
    probability += (engagementScore / 100) * 25
  }

  // Etapa do pipeline (peso: 25%)
  if (deal?.stage) {
    const stageWeights: Record<string, number> = {
      'Novo': 10,
      'Contatado': 20,
      'Qualificado': 40,
      'Proposta': 70,
      'Negociação': 85
    }
    const stageScore = stageWeights[deal.stage] || 10
    probability += stageScore * 0.25
  }

  // Status qualificado (peso: 20%)
  if (lead.status === 'qualified') {
    probability += 20
  }

  return Math.round(probability)
}
