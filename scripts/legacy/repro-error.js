const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function repro() {
    console.log('--- ATTEMPTING DUMMY INSERT INTO PROFILES ---');
    // We use a random UUID to avoid conflicts but likely it won't be in auth.users
    // This will tell us if there are NOT NULL constraints on other columns.
    const dummyId = '00000000-0000-0000-0000-000000000000';
    
    const { data, error } = await supabase
        .from('profiles')
        .insert({ 
            id: dummyId,
            email: 'test@example.com',
            full_name: 'Test User'
            // We purposely omit organization_id to see if it's required
        })
        .select();

    if (error) {
        console.error('❌ Insert Error:', JSON.stringify(error, null, 2));
    } else {
        console.log('✅ Insert Success (Unexpected!):', data);
        // Clean up
        await supabase.from('profiles').delete().eq('id', dummyId);
    }
}

repro();
