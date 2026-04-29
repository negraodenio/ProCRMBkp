const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function generateRandomVector(dim) {
    return Array.from({ length: dim }, () => Math.random() * 2 - 1);
}

async function seedCompaniesRandom() {
    const orgId = '05ec6386-3f97-4402-a429-6601d3277764';
    
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

    console.log("Seeding companies with RANDOM vectors...");

    for (const company of companies) {
        console.log(`Inserting ${company.name}...`);
        const vector = generateRandomVector(2560);
        
        const { error } = await supabase.from('market_intelligence_companies').insert({
            organization_id: orgId,
            name: company.name,
            industry: company.industry,
            description: company.description,
            embedding: vector
        });

        if (error) console.error(`Error:`, error.message);
        else console.log(`Success: ${company.name}`);
    }
}

seedCompaniesRandom();
