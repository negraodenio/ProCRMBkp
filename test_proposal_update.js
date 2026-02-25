require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
    console.log("Testing Proposal Update...");

    // Get a proposal and a stage
    const { data: proposal } = await supabase.from('proposals').select('*').limit(1).single();
    const { data: stage } = await supabase.from('stages').select('*').limit(1).single();

    if(!proposal || !stage) {
        return console.log("Missing data:", { proposal, stage });
    }

    console.log("Attempting to update proposal", proposal.id, "to stage", stage.id, "and pipeline", stage.pipeline_id);

    const { data: updated, error } = await supabase
        .from('proposals')
        .update({
            pipeline_id: stage.pipeline_id,
            stage_id: stage.id,
        })
        .eq('id', proposal.id)
        .select('*');

    if(error) {
        console.error("UPDATE ERROR:", error);
    } else {
        console.log("UPDATE SUCCESS:", updated);
    }
}
run();
