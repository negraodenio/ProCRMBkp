'use server'

import { createClient } from '@/lib/supabase/server'

export async function getFunnelData(organizationId: string) {
  const supabase = await createClient()

  // Buscar todos os deals
  const { data: deals } = await supabase
    .from('deals')
    .select('stage, status')
    .eq('organization_id', organizationId)

  if (!deals) {
    return []
  }

  // Contar por etapa
  const stageCounts: Record<string, number> = {
    'Novo': 0,
    'Contatado': 0,
    'Qualificado': 0,
    'Proposta': 0,
    'Negociação': 0,
    'Fechado': 0
  }

  deals.forEach(deal => {
    const stage = deal.stage || 'Novo'
    if (stageCounts[stage] !== undefined) {
      stageCounts[stage]++
    }
  })

  // Calcular acumulado (funil)
  const stages = ['Novo', 'Contatado', 'Qualificado', 'Proposta', 'Negociação', 'Fechado']
  let accumulated = deals.length

  const funnelData = stages.map((stageName, index) => {
    const count = index === 0
      ? accumulated
      : stageCounts[stageName]

    const percentage = accumulated > 0 ? (count / accumulated) * 100 : 0

    // Cores do funil
    const colors = [
      '#3b82f6', // blue-500
      '#8b5cf6', // purple-500
      '#ec4899', // pink-500
      '#f59e0b', // amber-500
      '#10b981', // green-500
      '#059669'  // green-600
    ]

    return {
      name: stageName,
      count,
      percentage,
      color: colors[index]
    }
  })

  return funnelData
}

export async function getRealTimeInsights(organizationId: string) {
  const supabase = await createClient()

  // Leads quentes (score > 70)
  const { count: hotLeads } = await supabase
    .from('contacts')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .eq('type', 'lead')
    .gt('score', 70)

  // Leads sem contato há 3+ dias
  const threeDaysAgo = new Date()
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

  const { count: coldLeads } = await supabase
    .from('contacts')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .eq('type', 'lead')
    .lt('last_contact', threeDaysAgo.toISOString())

  // Deals próximos de fechar (etapa Negociação)
  const { count: closingDeals } = await supabase
    .from('deals')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .eq('stage', 'Negociação')
    .eq('status', 'active')

  // Receita em negociação
  const { data: negotiationDeals } = await supabase
    .from('deals')
    .select('value')
    .eq('organization_id', organizationId)
    .eq('stage', 'Negociação')
    .eq('status', 'active')

  const revenueAtRisk = negotiationDeals?.reduce((sum, deal) => sum + (deal.value || 0), 0) || 0

  return {
    hotLeads: hotLeads || 0,
    coldLeads: coldLeads || 0,
    closingDeals: closingDeals || 0,
    revenueAtRisk
  }
}
