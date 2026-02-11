
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load env
const envPath = path.resolve(__dirname, '../.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envConfig.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase URL or Service Key.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRLS() {
  console.log('\n--- Checking RLS Policies ---');
  // This requires querying pg_tables or similar, which we can't do easily via JS client without RPC.
  // We'll skip direct RLS check via JS and rely on "selecting from a table without RLS bypass" test?
  // Actually, let's just List tables and remind user to check.
  console.log('Skipping automated RLS check (requires SQL access). Manual review recommended.');
}

async function checkOrphans() {
    console.log('\n--- Checking Orphan Records ---');

    // 1. Deals without Organization
    const { count: dealsNoOrg, error: err1 } = await supabase
        .from('deals')
        .select('*', { count: 'exact', head: true })
        .is('organization_id', null);

    if (dealsNoOrg > 0) console.error(`[CRITICAL] Found ${dealsNoOrg} Deals without active Organization_ID!`);
    else console.log('[OK] All Deals belong to an Organization.');

    // 2. Contacts without Organization
    const { count: contactsNoOrg } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .is('organization_id', null);

    if (contactsNoOrg > 0) console.error(`[CRITICAL] Found ${contactsNoOrg} Contacts without active Organization_ID!`);
    else console.log('[OK] All Contacts belong to an Organization.');

    // 3. Profiles without Organization
    const { count: profilesNoOrg } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .is('organization_id', null);

    if (profilesNoOrg > 0) console.warn(`[WARNING] Found ${profilesNoOrg} Profiles without Organization_ID (New users?).`);
    else console.log('[OK] All Profiles belong to an Organization.');
}

async function checkCriticalTables() {
    console.log('\n--- Checking Critical Tables Access ---');
    const tables = ['organizations', 'profiles', 'deals', 'contacts', 'pipelines', 'stages'];

    for (const table of tables) {
        const { error } = await supabase.from(table).select('id').limit(1);
        if (error) console.error(`[ERROR] Cannot access table '${table}':`, error.message);
        else console.log(`[OK] Table '${table}' is accessible.`);
    }
}

async function runVerification() {
    console.log('Starting Pre-Production Verification...');
    await checkCriticalTables();
    await checkOrphans();
    console.log('\nVerification Complete.');
}

runVerification();
