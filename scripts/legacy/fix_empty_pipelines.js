require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
    console.log("Fetching Pipelines...");
    const { data: pipelines, error: pError } = await supabase.from('pipelines').select('*');
    if(pError) return console.error("Pipeline Error:", pError);

    const { data: stages, error: sError } = await supabase.from('stages').select('pipeline_id');
    if(sError) return console.error("Stages Error:", sError);

    const stageCounts = {};
    pipelines.forEach(p => stageCounts[p.id] = 0);
    stages.forEach(s => {
        if(stageCounts[s.pipeline_id] !== undefined) {
            stageCounts[s.pipeline_id]++;
        }
    });

    for (const p of pipelines) {
        if (stageCounts[p.id] === 0) {
            console.log(`Pipeline '${p.name}' has 0 stages. Adding default stages...`);

            const defaultStages = [
                { pipeline_id: p.id, name: 'Lead / Contato', color: 'bg-blue-500', order: 0 },
                { pipeline_id: p.id, name: 'Qualificação', color: 'bg-yellow-500', order: 1 },
                { pipeline_id: p.id, name: 'Proposta / Negociação', color: 'bg-orange-500', order: 2 },
                { pipeline_id: p.id, name: 'Fechado', color: 'bg-green-500', order: 3 }
            ];

            const { error: insertError } = await supabase.from('stages').insert(defaultStages);
            if (insertError) {
                console.error(`Error inserting stages for '${p.name}':`, insertError);
            } else {
                console.log(`Successfully added stages for '${p.name}'`);
            }
        } else {
            console.log(`Pipeline '${p.name}' already has ${stageCounts[p.id]} stages. Skipping.`);
        }
    }
}
run();
