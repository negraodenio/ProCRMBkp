require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// The BAD number (Bosnia/weird)
const BAD_PHONE = '3870034002168';
// The GOOD number (Portugal)
const GOOD_PHONE = '351928145133';

async function fixContact() {
    console.log(`Fixing contact data for Stefany...`);

    // 1. Find the BAD contact (if it exists as a separate contact)
    const { data: badContacts } = await supabase.from('contacts').select('*').eq('phone', BAD_PHONE);

    // 2. Find the GOOD contact
    const { data: goodContacts } = await supabase.from('contacts').select('*').eq('phone', GOOD_PHONE);

    let goodContactId = null;

    if (goodContacts && goodContacts.length > 0) {
        goodContactId = goodContacts[0].id;
        console.log(`✅ Found GOOD contact ID: ${goodContactId}`);
    } else {
        console.log(`❌ GOOD contact not found! Cannot merge/fix without it.`);
        // If we found the bad contact but not the good one, maybe updates the bad one?
        if (badContacts && badContacts.length > 0) {
             console.log(`...But found BAD contact. Updating it to GOOD number.`);
             const { error } = await supabase.from('contacts')
                .update({ phone: GOOD_PHONE })
                .eq('id', badContacts[0].id);

             if (!error) console.log(`✅ Updated Contact ${badContacts[0].id} to ${GOOD_PHONE}`);
             else console.error(`❌ Error updating contact:`, error);

             goodContactId = badContacts[0].id;
        }
    }

    if (!goodContactId) return;

    // 3. Update CONVERSATIONS that point to the BAD number
    // They might be pointing to the BAD contact ID or just have bad metadata

    // A. Update conversations with bad contact_phone
    console.log(`Updating conversations with phone ${BAD_PHONE}...`);
    const { error: convError } = await supabase.from('conversations')
        .update({
            contact_phone: GOOD_PHONE,
            contact_id: goodContactId
        })
        .eq('contact_phone', BAD_PHONE);

    if (convError) console.error(`❌ Error updating conversations:`, convError);
    else console.log(`✅ Conversations updated.`);

    // B. Delete the BAD contact if it was a duplicate and we didn't just rename it
    if (badContacts && badContacts.length > 0 && goodContacts && goodContacts.length > 0) {
        console.log(`Deleting duplicate BAD contact...`);
        await supabase.from('contacts').delete().eq('phone', BAD_PHONE);
    }
}

fixContact();
