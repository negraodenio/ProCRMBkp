'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getDealProducts(dealId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data, error } = await supabase
        .from('deal_products')
        .select(`
            *,
            products (*)
        `)
        .eq('deal_id', dealId)

    if (error) {
        console.error('Error fetching deal products:', error)
        return { success: false, error: error.message }
    }

    return { success: true, data }
}

export async function addProductToDeal(dealId: string, data: { product_id: string, quantity: number, unit_price: number, organization_id: string }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const totalPrice = data.quantity * data.unit_price

    const { error } = await supabase
        .from('deal_products')
        .insert({
            deal_id: dealId,
            product_id: data.product_id,
            quantity: data.quantity,
            unit_price: data.unit_price,
            total_price: totalPrice,
            organization_id: data.organization_id
        })

    if (error) {
        console.error('Error adding product to deal:', error)
        return { success: false, error: error.message }
    }

    revalidatePath(`/deals/${dealId}`)
    return { success: true }
}
