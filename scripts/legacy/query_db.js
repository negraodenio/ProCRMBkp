require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
    let out = "Fetching Pipelines...\n";
    const { data: pipelines, error: pError } = await supabase.from('pipelines').select('*');
    if(pError) out += "Pipeline Error: " + JSON.stringify(pError) + "\n";
    else out += "Pipelines: " + JSON.stringify(pipelines, null, 2) + "\n";

    out += "\nFetching Stages...\n";
    const { data: stages, error: sError } = await supabase.from('stages').select('*');
    if(sError) out += "Stages Error: " + JSON.stringify(sError) + "\n";
    else {
        out += `Found ${stages.length} stages:\n`;
        stages.forEach(s => {
            out += `- ${s.name} (ID: ${s.id}, PipelineID: ${s.pipeline_id}, OrgID: ${s.organization_id})\n`;
        });
    }
    fs.writeFileSync('db_output.txt', out);
    console.log("Done");
}
run();
