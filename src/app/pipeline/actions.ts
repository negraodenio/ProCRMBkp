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
            stage_id: newStageId
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
            ...data
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

export async function createPipeline(data: { name: string, organization_id: string, is_default?: boolean }) {
    const supabase = await createClient()

    const { data: pipeline, error } = await supabase
        .from('pipelines')
        .insert(data)
        .select()
        .single()

    if (error) {
        console.error('Error creating pipeline:', error)
        return { success: false, error: error.message }
    }

    // Automatically create default stages for the new pipeline to prevent empty states
    const defaultStages = [
        { pipeline_id: pipeline.id, name: 'Lead', color: 'bg-blue-500', order: 0 },
        { pipeline_id: pipeline.id, name: 'Em Contato', color: 'bg-yellow-500', order: 1 },
        { pipeline_id: pipeline.id, name: 'Negociação', color: 'bg-orange-500', order: 2 },
        { pipeline_id: pipeline.id, name: 'Fechado', color: 'bg-green-500', order: 3 }
    ];

    const { error: stagesError } = await supabase
        .from('stages')
        .insert(defaultStages);

    if (stagesError) {
        console.error('Error creating default stages:', stagesError);
        // We still return success for the pipeline, but the user will have an empty pipeline
    }

    revalidatePath('/pipeline')
    return { success: true, data: pipeline }
}

export async function updatePipeline(pipelineId: string, data: { name?: string, is_default?: boolean }) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('pipelines')
        .update(data)
        .eq('id', pipelineId)

    if (error) {
        console.error('Error updating pipeline:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/pipeline')
    return { success: true }
}

export async function deletePipeline(pipelineId: string) {
    const supabase = await createClient()

    // Check if it's the only pipeline
    // Check if it has stages with proposals
    const { data: stages } = await supabase
        .from('stages')
        .select('id')
        .eq('pipeline_id', pipelineId)

    if (stages && stages.length > 0) {
        const stageIds = stages.map(s => s.id)
        const { count } = await supabase
            .from('proposals')
            .select('*', { count: 'exact', head: true })
            .in('stage_id', stageIds)

        if ((count || 0) > 0) {
            return { success: false, error: "Cannot delete pipeline with active proposals." }
        }
    }

    const { error } = await supabase
        .from('pipelines')
        .delete()
        .eq('id', pipelineId)

    if (error) {
        console.error('Error deleting pipeline:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/pipeline')
    return { success: true }
}
