
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkIds() {
    console.log("--- PROFILES and their ORGS ---");
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, organization_id, organizations(name)');
    console.log(JSON.stringify(profiles, null, 2));

    console.log("\n--- CONVERSATIONS and their ORGS ---");
    const { data: convs } = await supabase
        .from('conversations')
        .select('id, contact_name, organization_id');
    console.log(JSON.stringify(convs, null, 2));
}

checkIds();
