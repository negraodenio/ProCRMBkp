const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const siliconFlowKey = process.env.SILICONFLOW_API_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function generateEmbedding(text) {
    const response = await fetch("https://api.siliconflow.cn/v1/embeddings", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${siliconFlowKey}`
        },
        body: JSON.stringify({
            model: "Qwen/Qwen3-Embedding-4B",
            input: text,
            encoding_format: "float"
        })
    });

    if (!response.ok) {
        throw new Error(`Embedding Failed: ${response.status}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
}

async function seedCompanies() {
    const orgId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'; // Gráfica Imediata (from seed)
    
    const companies = [
        {
            name: "Natura &Co",
            industry: "Cosméticos e Sustentabilidade",
            description: "Líder global em cosméticos sustentáveis, interessada em novos ativos da biodiversidade brasileira, embalagens biodegradáveis e nanotecnologia aplicada a dermocosméticos.",
        },
        {
            name: "Embraer X",
            industry: "Aeroespacial e Mobilidade",
            description: "Divisão de inovação da Embraer focada em mobilidade aérea urbana, propulsão elétrica, materiais compostos leves e sistemas autônomos de voo.",
        },
        {
            name: "Vale S.A. (Centro de Tecnologia)",
            industry: "Mineração e Energia",
            description: "Interesse em descarbonização, hidrogênio verde, economia circular em rejeitos de mineração e automação industrial 4.0.",
        },
        {
            name: "Hospital Israelita Albert Einstein (Eretz.bio)",
            industry: "HealthTech e Biotecnologia",
            description: "Hub de inovação em saúde interessado em diagnósticos via IA, novos fármacos, terapias gênicas e dispositivos médicos vestíveis.",
        }
    ];

    console.log("Seeding companies with embeddings...");

    for (const company of companies) {
        try {
            console.log(`Processing ${company.name}...`);
            const embedding = await generateEmbedding(`${company.name} ${company.industry} ${company.description}`);
            
            const { error } = await supabase.from('market_intelligence_companies').insert({
                organization_id: orgId,
                name: company.name,
                industry: company.industry,
                description: company.description,
                embedding: embedding
            });

            if (error) console.error(`Error inserting ${company.name}:`, error.message);
            else console.log(`Successfully seeded ${company.name}`);
        } catch (err) {
            console.error(`Failed to process ${company.name}:`, err.message);
        }
    }
}

seedCompanies();
