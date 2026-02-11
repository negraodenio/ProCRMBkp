
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkContacts() {
    console.log("--- CONTACTS and their ORGS ---");
    const { data: contacts } = await supabase
        .from('contacts')
        .select('id, name, phone, organization_id, organizations(name)');
    console.log(JSON.stringify(contacts, null, 2));

    console.log("\n--- USER PROFILES and their ORGS ---");
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, organization_id, organizations(name)');
    console.log(JSON.stringify(profiles, null, 2));
}

checkContacts();
