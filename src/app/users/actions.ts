'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceRoleClient } from '@supabase/supabase-js';

export async function inviteUserAction(email: string, fullName: string, role: string, department: string) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseServiceKey) {
        return { success: false, error: "A chave SUPABASE_SERVICE_ROLE_KEY não está configurada no servidor. É necessária permissão de administrador para enviar convites." };
    }

    // Use the standard server client to get the current user (admin)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Usuário não autenticado" };

    const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single();

    if (!profile?.organization_id) {
        return { success: false, error: "Organização do administrador não encontrada" };
    }

    // --- PLAN LIMIT CHECK ---
    const { data: orgData } = await supabase
        .from('organizations')
        .select('subscription_plan')
        .eq('id', profile.organization_id)
        .single();

    const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', profile.organization_id);

    const { checkPlanLimit } = await import('@/lib/stripe/limits');
    const plan = (orgData?.subscription_plan || 'free') as any; // Cast safely later inside checkPlanLimit based on the exact enum type
    const limitResult = checkPlanLimit(
        plan,
        { users_count: usersCount || 0, leads_count: 0, ia_tools_used_month: 0 },
        'add_user'
    );

    if (!limitResult.allowed) {
        return { success: false, error: limitResult.message, upgradeRequired: true };
    }
    // ------------------------

    // Now use service role client for the admin action
    const adminClient = createServiceRoleClient(supabaseUrl, supabaseServiceKey);

    // 1. Invite user via Supabase Auth
    const { data, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
        data: {
            full_name: fullName,
            role: role,
            department: department,
            organization_id: profile.organization_id // CRITICAL for trigger
        }
    });

    if (inviteError) {
        console.error("Invite error:", inviteError);
        return { success: false, error: inviteError.message };
    }

    return { success: true };
}
