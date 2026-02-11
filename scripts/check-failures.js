require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFailures() {
    const ids = ['272104062746813', '3870034002168'];
    console.log(`Checking contacts: ${ids.join(', ')}`);

    const { data: contacts, error } = await supabase
        .from('contacts')
        .select('*')
        .in('phone', ids);

    if (error) {
        console.error("Error:", error);
        return;
    }

    console.log("Found contacts:", JSON.stringify(contacts, null, 2));

    // Also check if there are contacts that *include* these numbers but have suffixes
    for (const id of ids) {
        const { data: likeContacts } = await supabase
            .from('contacts')
            .select('*')
            .ilike('phone', `${id}%`);
        if (likeContacts && likeContacts.length > 0) {
             console.log(`Matches for ${id}%:`, JSON.stringify(likeContacts, null, 2));
        }
    }
}

checkFailures();
