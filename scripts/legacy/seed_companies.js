const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// We need to polyfill generateEmbedding because it's in a TS file normally
// Or we can just use the SiliconFlow API directly here

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function generateEmbedding(text) {
    const response = await fetch(
        `${process.env.SILICONFLOW_API_URL}/embeddings`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.SILICONFLOW_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: process.env.SILICONFLOW_EMBEDDING_MODEL,
                input: [text]
            })
        }
    );
    const data = await response.json();
    return data.data[0].embedding;
}

const SAMPLE_COMPANIES = [
    {
        name: "BioHealth Pharma",
        industry: "Biotecnologia",
        description: "Líder em terapias gênicas e oncologia.",
        rd_focus: "Desenvolvimento de novos fármacos, biomateriais e edição genética."
    },
    {
        name: "SolarEdge Tech",
        industry: "Energia Renovável",
        description: "Especialista em painéis fotovoltaicos de alta eficiência.",
        rd_focus: "Sustentabilidade, armazenamento de energia, grafeno e células solares."
    },
    {
        name: "AutoDrive Systems",
        industry: "Automotivo",
        description: "Desenvolvedora de hardware para carros autônomos.",
        rd_focus: "Visão computacional, sensores LiDAR, robótica e IA embarcada."
    },
    {
        name: "AgroSense Solutions",
        industry: "Agronegócio",
        description: "Tecnologia de precisão para monitoramento de safras.",
        rd_focus: "Internet das Coisas (IoT), sensores de solo, biodefensivos naturais."
    },
    {
        name: "Nexus Heavy Industries",
        industry: "Manufatura",
        description: "Braço industrial focado em automação pesada.",
        rd_focus: "Materiais compostos, polímeros de alta resistência e realidade aumentada industrial."
    }
];

async function seed() {
    console.log("🚀 Iniciando Seeding de Empresas para Matchmaking...");

    const { data: orgs } = await supabase.from("organizations").select("id").limit(1);
    if (!orgs || orgs.length === 0) {
        console.error("❌ Nenhuma organização encontrada. Rode o app uma vez para criar um tenant.");
        return;
    }
    const orgId = orgs[0].id;
    console.log(`✅ Usando Org ID: ${orgId}`);

    for (const company of SAMPLE_COMPANIES) {
        try {
            console.log(`⏳ Gerando embedding para ${company.name}...`);
            const embedding = await generateEmbedding(`${company.name} ${company.industry} ${company.rd_focus}`);
            
            const { error } = await supabase.from("market_intelligence_companies").insert({
                organization_id: orgId,
                name: company.name,
                industry: company.industry,
                description: company.description,
                rd_focus: company.rd_focus,
                embedding: embedding
            });

            if (error) {
                console.error(`❌ Erro ao inserir ${company.name}:`, error.message);
            } else {
                console.log(`✨ ${company.name} inserida com sucesso!`);
            }
        } catch (e) {
            console.error(`❌ Falha crítica em ${company.name}:`, e.message);
        }
    }

    console.log("🎉 Seeding finalizado!");
}

seed();
