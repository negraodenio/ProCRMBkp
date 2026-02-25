require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

// Using ANON KEY to test with RLS! Wait, we don't have token. Let's use service key first to see if it's a schema issue,
// then try simulating user. We will just use service role first to catch schema/trigger errors.
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    console.log("Testing Proposal Pipeline Transfer...");

    // 1. Get a random proposal
    const { data: proposal } = await supabase.from('proposals').select('*').limit(1).single();
    if (!proposal) return console.log("No proposals found.");

    // 2. Get a random pipeline and its first stage
    const { data: stage } = await supabase.from('stages').select('*').limit(1).single();
    if (!stage) return console.log("No stages found.");

    console.log(`Attempting to move proposal ${proposal.id} (org: ${proposal.organization_id}) to pipeline ${stage.pipeline_id}, stage ${stage.id}`);

    // 3. Perform the exact update
    const { data: updated, error } = await supabase
        .from('proposals')
        .update({
            pipeline_id: stage.pipeline_id,
            stage_id: stage.id
        })
        .eq('id', proposal.id)
        .select();

    if (error) {
        console.error("RAW ERROR OBJECT:", JSON.stringify(error, null, 2));
    } else {
        console.log("UPDATE SUCCESS!");
    }
}
run();
