'use server'

import { createClient } from '@/lib/supabase/server'

interface DealWithStage {
  id: string
  value: number | null
  created_at: string
  updated_at: string
  stage_id: string
  stages: {
    name: string
  } | null
}

export async function getDashboardMetrics(organizationId: string) {
  const supabase = await createClient()

  // Get leads metrics
  const { data: leads } = await supabase
    .from('contacts')
    .select('id, status, created_at, source')
    .eq('organization_id', organizationId)
    .eq('type', 'lead')

  // Get deals metrics
  const { data: dealsData } = await supabase
    .from('deals')
    .select(`
      id,
      value,
      created_at,
      updated_at,
      stage_id,
      stages!inner(name)
    `)
    .eq('organization_id', organizationId)

  const deals = dealsData as DealWithStage[] | null

  // Calculate metrics
  const totalLeads = leads?.length || 0
  const qualifiedLeads = leads?.filter(l => l.status === 'qualified').length || 0

  // Count won deals safely
  const wonDeals = deals?.filter(d => {
    const stageName = d.stages?.name
    return stageName === 'Ganho' || stageName === 'Won'
  }).length || 0

  const conversionRate = totalLeads > 0 ? (wonDeals / totalLeads) * 100 : 0

  // Calculate forecast revenue (excluding won and lost)
  const forecastRevenue = deals?.filter(d => {
    const stageName = d.stages?.name
    return stageName !== 'Ganho' && stageName !== 'Won' && stageName !== 'Perdido' && stageName !== 'Lost'
  }).reduce((sum, d) => sum + (d.value || 0), 0) || 0

  // Leads by source
  const sourceDistribution = leads?.reduce((acc, lead) => {
    const source = lead.source || 'other'
    acc[source] = (acc[source] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  // Leads timeline (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const leadsTimeline = leads
    ?.filter(l => new Date(l.created_at) >= thirtyDaysAgo)
    .reduce((acc, lead) => {
      const date = new Date(lead.created_at).toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = { date, new: 0, qualified: 0 }
      }
      acc[date].new++
      if (lead.status === 'qualified') acc[date].qualified++
      return acc
    }, {} as Record<string, any>) || {}

  return {
    metrics: {
      totalLeads,
      qualifiedLeads,
      wonDeals,
      conversionRate: Math.round(conversionRate * 10) / 10,
      forecastRevenue,
    },
    sourceDistribution,
    leadsTimeline: Object.values(leadsTimeline).sort((a: any, b: any) =>
      a.date.localeCompare(b.date)
    ),
  }
}
