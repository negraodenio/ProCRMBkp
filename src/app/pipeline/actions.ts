'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateDealStage(dealId: string, newStageId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('deals')
        .update({ stage_id: newStageId, updated_at: new Date().toISOString() })
        .eq('id', dealId)

    if (error) {
        console.error('Error updating deal stage:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/pipeline')
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
