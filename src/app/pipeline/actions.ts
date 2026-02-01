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
