import { createClient } from "@supabase/supabase-js";
import { generateEmbedding } from "./src/lib/ai/client";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
    console.log("Seeding companies...");

    // Get an organization ID to link these to (using the first one found or a fixed one)
    const { data: orgs } = await supabase.from("organizations").select("id").limit(1);
    if (!orgs || orgs.length === 0) {
        console.error("No organization found. Please run the app once to create a tenant.");
        return;
    }
    const orgId = orgs[0].id;

    for (const company of SAMPLE_COMPANIES) {
        console.log(`Processing ${company.name}...`);
        const embedding = await generateEmbedding(`${company.name} ${company.industry} ${company.rd_focus}`);
        
        const { error } = await supabase.from("market_intelligence_companies").insert({
            organization_id: orgId,
            name: company.name,
            industry: company.industry,
            description: company.description,
            rd_focus: company.rd_focus,
            embedding: embedding
        });

        if (error) console.error(`Error inserting ${company.name}:`, error.message);
    }

    console.log("Seeding completed!");
}

seed();
