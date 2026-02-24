'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateDealStage(dealId: string, newStageId: string) {
    const supabase = await createClient()

    // 1. Fetch stage name to determine new status
    const { data: stage } = await supabase
        .from('stages')
        .select('name')
        .eq('id', newStageId)
        .single()

    let dealStatus: 'open' | 'won' | 'lost' = 'open';
    let contactStatus = 'negotiation';

    if (stage) {
        const stageName = stage.name.toLowerCase();
        // More robust stage mapping
        if (['ganho', 'won', 'fechado', 'concluído', 'concluido'].some(s => stageName.includes(s))) {
            dealStatus = 'won';
            contactStatus = 'won';
        } else if (['perdido', 'lost', 'cancelado'].some(s => stageName.includes(s))) {
            dealStatus = 'lost';
            contactStatus = 'lost';
        } else if (['proposta', 'proposal', 'orçamento', 'orcamento'].some(s => stageName.includes(s))) {
            contactStatus = 'proposal';
        } else if (['quali', 'triagem'].some(s => stageName.includes(s))) {
            contactStatus = 'qualified';
        } else if (['contat', 'abordagem', 'reunião', 'reuniao'].some(s => stageName.includes(s))) {
            contactStatus = 'contacted';
        }
    }

    // Need to get contact_id to update contact status
    const { data: dealToUpdate } = await supabase.from('deals').select('contact_id').eq('id', dealId).single()

    const { error } = await supabase
        .from('deals')
        .update({
            stage_id: newStageId,
            status: dealStatus,
            updated_at: new Date().toISOString()
        })
        .eq('id', dealId)

    // Update contact status if deal moved to Won/Lost or specific contact status mapped
    if (!error && dealToUpdate?.contact_id) {
       await supabase.from('contacts').update({ status: contactStatus }).eq('id', dealToUpdate.contact_id);
    }

    if (error) {
        console.error('Error updating deal stage:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/pipeline')
    revalidatePath('/leads')
    revalidatePath('/dashboard')
    revalidatePath('/reports')
    return { success: true }
}

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
