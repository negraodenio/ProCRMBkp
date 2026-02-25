const { createClient } = require('@supabase/supabase-js');
// Need to load env vars
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStages() {
    const { data: pipelines, error: pError } = await supabase
        .from('pipelines')
        .select('id, name');

    if (pError) {
        console.error("Error fetching pipelines:", pError);
        return;
    }

    console.log("Pipelines found:", pipelines.length);

    for (const p of pipelines) {
        const { count, error } = await supabase
            .from('stages')
            .select('*', { count: 'exact', head: true })
            .eq('pipeline_id', p.id);

        console.log(`Pipeline '${p.name}' (${p.id}) has ${count} stages.`);
    }
}

checkStages();
