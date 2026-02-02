require('dotenv').config({ path: '.env' });
const fs = require('fs');

const apiKey = process.env.SILICONFLOW_API_KEY;
const apiUrl = process.env.SILICONFLOW_API_URL || "https://api.siliconflow.com/v1";

if (!apiKey) {
    console.error("❌ API Key not found");
    process.exit(1);
}

async function listModels() {
    console.log(`Fetching models from ${apiUrl}/models...`);
    try {
        const response = await fetch(`${apiUrl}/models`, {
            headers: {
                "Authorization": `Bearer ${apiKey}`
            }
        });

        if (!response.ok) {
            console.error(`Error: ${response.status} ${response.statusText}`);
            console.error(await response.text());
            return;
        }

        const data = await response.json();
        const models = data.data;

        console.log(`\nFound ${models.length} models.`);

        const modelIds = models.map(m => m.id).sort().join('\n');
        fs.writeFileSync('model_list.txt', modelIds);
        console.log(`Saved ${models.length} models to model_list.txt`);

    } catch (error) {
        console.error("Failed to fetch models:", error);
    }
}

listModels();
