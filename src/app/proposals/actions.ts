'use server'

import { createClient } from '@/lib/supabase/server'

interface ProposalItem {
  name: string
  description?: string
  quantity: number
  unit_price: number
  total: number
}

export async function createProposal(
  organizationId: string,
  contactId: string,
  dealId: string | null,
  title: string,
  items: ProposalItem[],
  validDays: number = 30
) {
  const supabase = await createClient()

  // Calcular totais
  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const total = subtotal

  const validUntil = new Date()
  validUntil.setDate(validUntil.getDate() + validDays)

  const { data, error } = await supabase
    .from('proposals')
    .insert({
      organization_id: organizationId,
      contact_id: contactId,
      deal_id: dealId,
      title,
      items,
      subtotal,
      total,
      valid_until: validUntil.toISOString().split('T')[0],
      status: 'draft'
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating proposal:', error)
    throw new Error('Falha ao criar proposta')
  }

  return data
}

export async function getProposals(organizationId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('proposals')
    .select(`
      *,
      contact:contacts(name, email, phone),
      deal:deals(title, value)
    `)
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching proposals:', error)
    return []
  }

  return data || []
}

export async function getProposal(proposalId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('proposals')
    .select(`
      *,
      contact:contacts(name, email, phone, company),
      deal:deals(title, value, stage)
    `)
    .eq('id', proposalId)
    .single()

  if (error) {
    console.error('Error fetching proposal:', error)
    throw new Error('Proposta não encontrada')
  }

  return data
}

export async function updateProposalStatus(
  proposalId: string,
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired'
) {
  const supabase = await createClient()

  const updates: any = { status }

  if (status === 'sent' && !updates.sent_at) {
    updates.sent_at = new Date().toISOString()
  }

  if (status === 'accepted') {
    updates.accepted_at = new Date().toISOString()
  }

  if (status === 'rejected') {
    updates.rejected_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from('proposals')
    .update(updates)
    .eq('id', proposalId)

  if (error) {
    console.error('Error updating proposal:', error)
    throw new Error('Falha ao atualizar proposta')
  }
}

export async function trackProposalView(proposalId: string) {
  const supabase = await createClient()

  // Buscar proposta atual
  const { data: proposal } = await supabase
    .from('proposals')
    .select('view_count, viewed_at, status')
    .eq('id', proposalId)
    .single()

  if (!proposal) return

  const updates: any = {
    view_count: (proposal.view_count || 0) + 1
  }

  // Se é a primeira visualização
  if (!proposal.viewed_at) {
    updates.viewed_at = new Date().toISOString()
    updates.status = 'viewed'
  }

  await supabase
    .from('proposals')
    .update(updates)
    .eq('id', proposalId)
}

export async function getProposalTemplates(organizationId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('proposal_templates')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .order('is_default', { ascending: false })

  if (error) {
    console.error('Error fetching templates:', error)
    return []
  }

  return data || []
}

export async function generateProposalPDF(proposalId: string) {
  // Esta função seria implementada com uma biblioteca como jsPDF ou Puppeteer
  // Por enquanto, retorna um placeholder

  const proposal = await getProposal(proposalId)

  // TODO: Implementar geração real de PDF
  // Opções:
  // 1. jsPDF no cliente
  // 2. Puppeteer no servidor (gera PDF de HTML)
  // 3. Serviço externo como PDFMonkey

  console.log('Generating PDF for proposal:', proposal.title)

  return {
    url: `/api/proposals/${proposalId}/pdf`,
    generated_at: new Date().toISOString()
  }
}
