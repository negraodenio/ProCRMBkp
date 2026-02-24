'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProposalStage(proposalId: string, newStageId: string) {
    const supabase = await createClient()

    // 1. Fetch stage to get pipeline_id (fallback) and name
    const { data: stage } = await supabase
        .from('stages')
        .select('name, pipeline_id')
        .eq('id', newStageId)
        .single()

    const { error } = await supabase
        .from('proposals')
        .update({
            stage_id: newStageId,
            updated_at: new Date().toISOString()
        })
        .eq('id', proposalId)

    if (error) {
        console.error('Error updating proposal stage:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/pipeline')
    return { success: true }
}

export async function updateProposal(proposalId: string, data: { title?: string, total?: number, notes?: string }) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('proposals')
        .update({
            ...data,
            updated_at: new Date().toISOString()
        })
        .eq('id', proposalId)

    if (error) {
        console.error('Error updating proposal:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/pipeline')
    return { success: true }
}

export async function deleteProposal(proposalId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('proposals')
        .delete()
        .eq('id', proposalId)

    if (error) {
        console.error('Error deleting proposal:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/pipeline')
    return { success: true }
}

// Keep old actions for fallback or internal use if needed, but primary is now proposal
export async function updateDeal(dealId: string, data: { title?: string, value?: number, notes?: string }) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('deals')
        .update({
            ...data,
            updated_at: new Date().toISOString()
        })
        .eq('id', dealId)

    if (error) {
        console.error('Error updating deal:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/pipeline')
    return { success: true }
}

export async function createStage(data: { pipeline_id: string, name: string, color: string, order: number }) {
    const supabase = await createClient()

    const { data: stage, error } = await supabase
        .from('stages')
        .insert(data)
        .select()
        .single()

    if (error) {
        console.error('Error creating stage:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/pipeline')
    return { success: true, data: stage }
}

export async function updateStage(stageId: string, data: { name?: string, color?: string, order?: number }) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('stages')
        .update(data)
        .eq('id', stageId)

    if (error) {
        console.error('Error updating stage:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/pipeline')
    return { success: true }
}

export async function deleteStage(stageId: string) {
    const supabase = await createClient()

    // 1. Check for deals
    const { count, error: countError } = await supabase
        .from('deals')
        .select('*', { count: 'exact', head: true })
        .eq('stage_id', stageId)

    if (countError) return { success: false, error: countError.message }
    if ((count || 0) > 0) return { success: false, error: "Cannot delete stage with deals." }

    const { error } = await supabase
        .from('stages')
        .delete()
        .eq('id', stageId)

    if (error) {
        console.error('Error deleting stage:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/pipeline')
    return { success: true }
}

export async function deleteDeal(dealId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('deals')
        .delete()
        .eq('id', dealId)

    if (error) {
        console.error('Error deleting deal:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/pipeline')
    return { success: true }
}
