const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkCols() {
    const { data: profile, error } = await supabase.from('profiles').select('*').limit(1);
    if (error) {
        console.error('❌ Error selecting from profiles:', error.message);
    } else if (profile && profile.length > 0) {
        console.log('✅ Profiles columns found:', Object.keys(profile[0]).join(', '));
    } else {
        console.log('⚠️ Profiles table is empty, trying another way...');
        // If empty, we might not get keys from some clients? 
        // Actually select('*') on empty table returns []
    }
}

checkCols();
