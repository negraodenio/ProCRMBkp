
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function listAll() {
    console.log("--- ALL ORGANIZATIONS ---");
    const { data: orgs } = await supabase.from('organizations').select('*');
    console.log(JSON.stringify(orgs, null, 2));

    console.log("\n--- ALL PROFILES ---");
    const { data: profiles } = await supabase.from('profiles').select('id, email, full_name, organization_id');
    console.log(JSON.stringify(profiles, null, 2));

    console.log("\n--- CONTACTS COUNT PER ORG ---");
    const { data: contactCounts } = await supabase.rpc('count_contacts_by_org'); // If rpc not exists, I'll do manually

    // Manual count if rpc fails
    const { data: contacts } = await supabase.from('contacts').select('organization_id');
    const counts = {};
    contacts.forEach(c => {
        counts[c.organization_id] = (counts[c.organization_id] || 0) + 1;
    });
    console.log(counts);
}

listAll();
