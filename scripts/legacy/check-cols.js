const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkCols() {
    const { data: profile, error } = await supabase.from('profiles').select('*').limit(1);
    
    if (error) {
        console.error('❌ Error selecting from profiles:', JSON.stringify(error, null, 2));
    } else {
        console.log('✅ Columns in profiles:', Object.keys(profile[0] || {}).join(', '));
    }

    const { data: org, error: orgErr } = await supabase.from('organizations').select('*').limit(1);
    if (orgErr) {
        console.error('❌ Error selecting from organizations:', JSON.stringify(orgErr, null, 2));
    } else {
        console.log('✅ Columns in organizations:', Object.keys(org[0] || {}).join(', '));
    }
}

checkCols();
