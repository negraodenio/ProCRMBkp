require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStefany() {
    const phone = '3870034002168';
    const { data: allOrgs } = await supabase.from('organizations').select('*');
    console.log('ORGS IN DB:', allOrgs.length);
    allOrgs.forEach(o => console.log(`- ${o.id} | ${o.name}`));

    const { data: orgCounts } = await supabase.rpc('get_message_counts_per_org'); // Or just query
    // Let's just query last 10 messages with their Org Name
    const { data: msgs } = await supabase
        .from('messages')
        .select('organization_id, content, created_at, conversations(contact_phone)')
        .order('created_at', { ascending: false })
        .limit(10);

    console.log('\nLAST 10 MESSAGES ANYWHERE:');
    msgs.forEach(m => console.log(`[${m.created_at}] OrgID: ${m.organization_id} | Phone: ${m.conversations?.contact_phone} | Content: ${m.content.substring(0, 20)}`));
}
checkStefany();
