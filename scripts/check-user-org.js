const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkCurrentUserOrg() {
    const email = 'test_senior@crmia.eu';
    const { data: user, error: userError } = await supabase.auth.admin.listUsers();
    const targetUser = user.users.find(u => u.email === email);
    
    if (targetUser) {
        const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', targetUser.id).single();
        console.log(`User ${email} has Org ID:`, profile?.organization_id);
    } else {
        console.log('User not found');
    }
}

checkCurrentUserOrg();
