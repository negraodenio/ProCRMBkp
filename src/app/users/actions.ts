'use server';

import { createClient } from '@/lib/supabase/client';
// Note: We need a service role client to bypass RLS/normal user restrictions for invitations
// But since we want to keep it simple, we'll try to use the regular client first 
// and if it fails due to permissions, we'll advise the user.
// ACTUALLY, for invitations, Supabase usually requires a Service Role for the admin to invite.

import { createClient as createServiceRoleClient } from '@supabase/supabase-js';

export async function inviteUserAction(email: string, fullName: string, role: string, department: string) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseServiceKey) {
        return { success: false, error: "SUPABASE_SERVICE_ROLE_KEY not configured on server." };
    }

    const supabase = createServiceRoleClient(supabaseUrl, supabaseServiceKey);

    // 1. Invite user via Supabase Auth
    const { data, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
        data: {
            full_name: fullName,
            role: role,
            company_name: department // Using department for now as company_name in profile
        }
    });

    if (inviteError) {
        console.error("Invite error:", inviteError);
        return { success: false, error: inviteError.message };
    }

    return { success: true };
}
