import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { generateEmbedding } from "@/lib/ai/client";

export async function GET() {
    const supabase = await createClient();
    
    // 1. Get current user & org
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.id)
        .single();
    
    const orgId = profile?.organization_id;
    if (!orgId) return NextResponse.json({ error: "Org not found" }, { status: 400 });

    try {
        console.log("Seeding data for org:", orgId);

        // 2. Create Innovation Pipeline
        const { data: pipeline, error: pError } = await supabase
            .from("pipelines")
            .insert({
                name: "Processo 56467 - Transferência de Tecnologia",
                organization_id: orgId,
                is_default: true
            })
            .select()
            .single();
        
        if (pError) throw pError;

        // 3. Create Stages
        const stagesData = [
            { pipeline_id: pipeline.id, name: "Intake", color: "bg-slate-200", order: 0 },
            { pipeline_id: pipeline.id, name: "Qualificação", color: "bg-blue-100", order: 1 },
            { pipeline_id: pipeline.id, name: "NDA / Negociação", color: "bg-orange-100", order: 2 },
            { pipeline_id: pipeline.id, name: "Licenciamento", color: "bg-emerald-100", order: 3 }
        ];

        const { data: stages, error: sError } = await supabase
            .from("stages")
            .insert(stagesData)
            .select();
        
        if (sError) throw sError;

        // 4. Create Proposals
        const proposalsData = [
            { 
                title: "Polímero Bio-degradável V2", 
                total: 150000, 
                stage_id: stages.find(s => s.name === "NDA / Negociação")?.id,
                pipeline_id: pipeline.id,
                organization_id: orgId,
                status: "sent",
                notes: "Interesse forte da BASF.",
                ia_score: 87,
                ia_sentiment: "Positive"
            },
            { 
                title: "Sensor IoT de Baixo Custo", 
                total: 45000, 
                stage_id: stages.find(s => s.name === "Qualificação")?.id,
                pipeline_id: pipeline.id,
                organization_id: orgId,
                status: "viewed",
                ia_score: 64,
                ia_sentiment: "Neutral"
            },
            { 
                title: "Vacina Veterinária - Cepas BR", 
                total: 890000, 
                stage_id: stages.find(s => s.name === "Intake")?.id,
                pipeline_id: pipeline.id,
                organization_id: orgId,
                status: "draft",
                ia_score: 92,
                ia_sentiment: "Positive"
            }
        ];

        const { error: prError } = await supabase.from("proposals").insert(proposalsData);
        if (prError) throw prError;

        // 5. Create Market Intelligence Companies (with embeddings)
        const companies = [
            { name: "BASF", industry: "Química", description: "Líder global em polímeros e químicos industriais." },
            { name: "Natura &Co", industry: "Biotecnologia", description: "Foco em cosméticos sustentáveis e ativos da biodiversidade." },
            { name: "Siemens", industry: "Automação", description: "Especialista em sensores industriais e infraestrutura IoT." },
            { name: "Weg", industry: "Energia", description: "Motores elétricos e soluções de energia renovável." }
        ];

        for (const comp of companies) {
            const embedding = await generateEmbedding(comp.description);
            await supabase.from("market_intelligence_companies").insert({
                name: comp.name,
                industry: comp.industry,
                description: comp.description,
                embedding: embedding,
                organization_id: orgId
            });
        }

        // 6. Create Audit Logs
        const auditLogs = [
            { 
                action: "CREATE_PROPOSAL", 
                entity_type: "proposal", 
                details: { title: "Polímero Bio-degradável V2" },
                organization_id: orgId,
                user_id: user.id
            },
            { 
                action: "MATCH_RUN", 
                entity_type: "matchmaking", 
                details: { query: "Polímeros sustentáveis" },
                organization_id: orgId,
                user_id: user.id
            }
        ];
        
        await supabase.from("audit_logs").insert(auditLogs);

        return NextResponse.json({ success: true, message: "Database seeded for NIT UFV!" });

    } catch (error: any) {
        console.error("Seed Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
