require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteGoiania() {
    console.log("Deleting contact 556298776615...");

    const { error: msgError } = await supabase
        .from('messages')
        .delete()
        .eq('contact_phone', '556298776615'); // Messages might be linked by phone not ID in some older schema versions? No, usually ID.

    // First get the ID
    const { data: contact } = await supabase.from('contacts').select('id').eq('phone', '556298776615').single();

    if (contact) {
        console.log("Found contact ID:", contact.id);

        // Delete messages linked to conversations of this contact
        const { data: convs } = await supabase.from('conversations').select('id').eq('contact_id', contact.id);
        if (convs) {
            const convIds = convs.map(c => c.id);
            if (convIds.length > 0) {
                 await supabase.from('messages').delete().in('conversation_id', convIds);
                 await supabase.from('conversations').delete().in('id', convIds);
            }
        }

        const { error } = await supabase.from('contacts').delete().eq('id', contact.id);
        if (error) console.error("Error deleting contact:", error);
        else console.log("Deleted contact successfully.");
    } else {
        console.log("Contact not found.");
    }
}

deleteGoiania();
