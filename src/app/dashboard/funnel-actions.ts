'use server'

import { createClient } from '@/lib/supabase/server'

export async function getFunnelData(organizationId: string) {
  const supabase = await createClient()

  const { data: pipeline } = await supabase
    .from('pipelines')
    .select('id')
    .eq('organization_id', organizationId)
    .maybeSingle()

  const { data: stagesData } = await supabase
    .from('stages')
    .select('id, name')
    .eq('pipeline_id', pipeline?.id || '')
    .order('order')

  const { data: dealsData } = await supabase
    .from('deals')
    .select('stage_id, status')
    .eq('organization_id', organizationId)

  if (!dealsData || !stagesData) {
    return []
  }

  const stageCounts: Record<string, number> = {}
  stagesData.forEach(s => { stageCounts[s.id] = 0; })

  let accumulated = dealsData.length

  dealsData.forEach(deal => {
    if (stageCounts[deal.stage_id] !== undefined) {
      stageCounts[deal.stage_id]++
    }
  })

  const colors = [
    '#3b82f6', // blue-500
    '#8b5cf6', // purple-500
    '#ec4899', // pink-500
    '#f59e0b', // amber-500
    '#10b981', // green-500
    '#059669'  // green-600
  ]

  const funnelData = stagesData.map((stage, index) => {
    const count = index === 0 ? accumulated : stageCounts[stage.id]
    const percentage = accumulated > 0 ? (count / accumulated) * 100 : 0

    return {
      name: stage.name,
      count,
      percentage,
      color: colors[index % colors.length]
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

  // Deals próximos de fechar (etapa Negociaçío/Proposta) usando inner join seguro
  const { data: closingDealsData } = await supabase
    .from('deals')
    .select('value, stages!inner(name)')
    .eq('organization_id', organizationId)
    .eq('status', 'open')

  let closingDeals = 0;
  let revenueAtRisk = 0;

  closingDealsData?.forEach((d: any) => {
     const n = d.stages?.name?.toLowerCase() || '';
     if (n.includes('negocia') || n.includes('negotiat') || n.includes('proposta') || n.includes('proposal')) {
         closingDeals++;
         revenueAtRisk += Number(d.value || 0);
     }
  });

  return {
    hotLeads: hotLeads || 0,
    coldLeads: coldLeads || 0,
    closingDeals,
    revenueAtRisk
  }
}
