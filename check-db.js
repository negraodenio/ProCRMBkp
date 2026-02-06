require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDB() {
    console.log("🔍 Checking Database State...");
    
    // 1. Orgs
    const { count: orgCount } = await supabase.from('organizations').select('*', { count: 'exact', head: true });
    
    // 2. Profiles
    const { count: profileCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

    // 3. Conversations
    const { data: convs } = await supabase.from('conversations').select('id, contact_phone, contact_name, last_message_at');
    const convCount = convs?.length || 0;

    // 4. Messages
    const { count: msgCount } = await supabase.from('messages').select('*', { count: 'exact', head: true });

    console.log("--------------------------------");
    console.log(`Organizations: ${orgCount}`);
    console.log(`Profiles:      ${profileCount}`);
    console.log(`Conversations: ${convCount}`);
    console.log(`Messages:      ${msgCount}`);
    console.log("--------------------------------");

    // List last 5 messages
    const { data: messages, error: msgErr } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    if (msgErr) {
        console.error('Error fetching messages:', msgErr);
    } else {
        console.log('\n💬 Last 5 messages:');
        messages.forEach(m => {
            console.log(`[${m.created_at}] ${m.direction}: ${m.content.substring(0, 50)}${m.content.length > 50 ? '...' : ''}`);
        });
    }

    if (convCount > 0) {
        console.log("\n📂 Sample Conversations:");
        convs.slice(0, 5).forEach(c => console.log(`- ${c.contact_name} (${c.contact_phone}) last message: ${c.last_message_at}`));
    } else {
        console.log("\n❌ No conversations found.");
    }

    if (msgCount > 0) {
        const { data: lastMsgs } = await supabase.from('messages').select('content, direction, created_at').order('created_at', { ascending: false }).limit(3);
        console.log("\n💬 Last 3 messages:");
        lastMsgs.forEach(m => console.log(`[${m.direction}] ${m.content} (${m.created_at})`));
    }

    const { data: profiles } = await supabase.from('profiles').select('id, email, role, organization_id').limit(2);
    console.log("\n👤 Sample Profiles:", JSON.stringify(profiles, null, 2));

    const { data: orgs } = await supabase.from('organizations').select('id, name').limit(2);
    console.log("\n🏢 Sample Organizations:", JSON.stringify(orgs, null, 2));
}

checkDB();
