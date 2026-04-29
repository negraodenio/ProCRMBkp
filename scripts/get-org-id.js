const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function findOrgId() {
    const { data: profiles, error } = await supabase.from('profiles').select('organization_id').limit(1);
    if (error) console.error(error);
    else console.log('Found Org ID:', profiles[0]?.organization_id);
}

findOrgId();
