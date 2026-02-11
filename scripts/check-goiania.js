require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkGoiania() {
    console.log("Checking for contacts ending in 6615...");

    const { data: contacts, error } = await supabase
        .from('contacts')
        .select('*')
        .ilike('phone', '%6615');

    if (error) {
        console.error("Error:", error);
        return;
    }

    console.log("Found contacts:", JSON.stringify(contacts, null, 2));

    // Check if any have length 12 (55 + 2 + 8) vs 13 (55 + 2 + 9 + 8)
    const badContacts = contacts.filter(c => c.phone.length === 12);
    if (badContacts.length > 0) {
        console.log("⚠️ Found contacts with missing 9th digit (12 digits):", badContacts.length);
        badContacts.forEach(c => console.log(`- ${c.name} (${c.phone})`));
    } else {
        console.log("✅ No legacy 12-digit contacts found. All look good (or don't exist yet).");
    }
}

checkGoiania();
