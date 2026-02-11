
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkData() {
    console.log("--- ORGANIZATIONS ---");
    const { data: orgs } = await supabase.from('organizations').select('id, name');
    console.log(JSON.stringify(orgs, null, 2));

    if (orgs && orgs.length > 0) {
        for (const org of orgs) {
            console.log(`\n--- CONVERSATIONS for ${org.name} (${org.id}) ---`);
            const { data: convs } = await supabase
                .from('conversations')
                .select('id, contact_name, contact_phone, last_message_at, organization_id')
                .eq('organization_id', org.id);
            console.log(JSON.stringify(convs, null, 2));

            if (convs && convs.length > 0) {
                for (const conv of convs) {
                    console.log(`\n--- MESSAGES for Conv ${conv.id} ---`);
                    const { data: msgs } = await supabase
                        .from('messages')
                        .select('id, content, direction, created_at')
                        .eq('conversation_id', conv.id)
                        .order('created_at', { ascending: false })
                        .limit(3);
                    console.log(JSON.stringify(msgs, null, 2));
                }
            }
        }
    }
}

checkData();
