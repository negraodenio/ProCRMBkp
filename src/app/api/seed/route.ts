import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { generateEmbedding } from "@/lib/ai/client";

export async function GET() {
    const supabase = await createClient();
    
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
        const results: string[] = [];

        // ================================================================
        // 1. PIPELINE (idempotent)
        // ================================================================
        let pipelineId: string;
        const { data: existingPipeline } = await supabase
            .from("pipelines")
            .select("id")
            .eq("organization_id", orgId)
            .eq("name", "Processo 56467 - Transferência de Tecnologia")
            .single();

        if (existingPipeline) {
            pipelineId = existingPipeline.id;
            results.push("Pipeline already exists, skipping.");
        } else {
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
            pipelineId = pipeline.id;

            // Create stages
            await supabase.from("stages").insert([
                { pipeline_id: pipelineId, name: "Intake", color: "bg-slate-200", order: 0 },
                { pipeline_id: pipelineId, name: "Qualificaçío", color: "bg-blue-100", order: 1 },
                { pipeline_id: pipelineId, name: "NDA / Negociaçío", color: "bg-orange-100", order: 2 },
                { pipeline_id: pipelineId, name: "Licenciamento", color: "bg-emerald-100", order: 3 }
            ]);
            results.push("Pipeline + stages created.");
        }

        // Get stages for proposals
        const { data: stages } = await supabase
            .from("stages")
            .select("id, name")
            .eq("pipeline_id", pipelineId);

        // ================================================================
        // 2. PROPOSALS (idempotent)
        // ================================================================
        const { count: proposalCount } = await supabase
            .from("proposals")
            .select("*", { count: "exact", head: true })
            .eq("organization_id", orgId);

        if ((proposalCount || 0) === 0) {
            const proposalsData = [
                { 
                    title: "Polímero Bio-degradável V2", total: 150000, 
                    stage_id: stages?.find(s => s.name === "NDA / Negociaçío")?.id,
                    pipeline_id: pipelineId, organization_id: orgId,
                    status: "sent", notes: "Interesse forte da BASF Brasil.",
                    ia_score: 87, ia_sentiment: "Positive"
                },
                { 
                    title: "Sensor IoT de Baixo Custo para Agro", total: 45000, 
                    stage_id: stages?.find(s => s.name === "Qualificaçío")?.id,
                    pipeline_id: pipelineId, organization_id: orgId,
                    status: "viewed", ia_score: 64, ia_sentiment: "Neutral"
                },
                { 
                    title: "Vacina Veterinária - Cepas Brasileiras", total: 890000, 
                    stage_id: stages?.find(s => s.name === "Intake")?.id,
                    pipeline_id: pipelineId, organization_id: orgId,
                    status: "draft", ia_score: 92, ia_sentiment: "Positive"
                },
                {
                    title: "Nanopartículas para Tratamento de Água", total: 280000,
                    stage_id: stages?.find(s => s.name === "Licenciamento")?.id,
                    pipeline_id: pipelineId, organization_id: orgId,
                    status: "accepted", ia_score: 95, ia_sentiment: "Positive"
                }
            ];
            await supabase.from("proposals").insert(proposalsData);
            results.push("4 proposals created.");
        } else {
            results.push("Proposals already exist, skipping.");
        }

        // ================================================================
        // 3. MARKET INTELLIGENCE COMPANIES + EMBEDDINGS (idempotent)
        // ================================================================
        const { count: companyCount } = await supabase
            .from("market_intelligence_companies")
            .select("*", { count: "exact", head: true })
            .eq("organization_id", orgId);

        if ((companyCount || 0) === 0) {
            const companies = [
                { name: "BASF Brasil", industry: "Química Industrial", description: "Líder global em polímeros, catalisadores e soluções químicas sustentáveis. Forte investimento em P&D de materiais biodegradáveis e bioeconomia circular." },
                { name: "Natura &Co", industry: "Biotecnologia / Cosméticos", description: "Foco em cosméticos sustentáveis, ativos da biodiversidade amazônica. Busca parcerias para ingredientes bioativos e embalagens ecoeficientes." },
                { name: "Siemens Brasil", industry: "Automaçío / IoT", description: "Especialista em sensores industriais, infraestrutura IoT e automaçío de processos. Investindo em edge computing e digital twins para indústria 4.0." },
                { name: "WEG S.A.", industry: "Energia / Motores", description: "Fabricante de motores elétricos e soluções de energia renovável. Foco em hidrogênio verde e eficiência energética industrial." },
                { name: "Embraer X", industry: "Aeroespacial / Mobilidade", description: "Braço de inovaçío da Embraer focado em mobilidade aérea urbana, materiais compostos avançados e propulsío elétrica para aviaçío." },
                { name: "Vale S.A.", industry: "Mineraçío / Descarbonizaçío", description: "Maior mineradora do Brasil com programa de descarbonizaçío. Busca tecnologias para captura de carbono, reabilitaçío ambiental e automaçío de minas." },
                { name: "Braskem", industry: "Petroquímica / Bioplásticos", description: "Líder em resinas termoplásticas na América Latina. Pioneira em plástico verde (polietileno de cana-de-açúcar) e economia circular." },
                { name: "Aché Laboratórios", industry: "Farmacêutica", description: "Maior laboratório farmacêutico brasileiro. Investimento em biotecnologia, drug delivery systems e medicamentos de base biológica." },
                { name: "TOTVS", industry: "Tecnologia / Software", description: "Maior empresa de tecnologia do Brasil. Investindo em IA aplicada a gestío empresarial, cloud computing e plataformas de dados." },
                { name: "Suzano", industry: "Celulose / Bioenergia", description: "Líder mundial em celulose de eucalipto. Focada em bioprodutos, lignina como matéria-prima e biorrefinarias." }
            ];

            for (const comp of companies) {
                const embedding = await generateEmbedding(comp.description);
                await supabase.from("market_intelligence_companies").insert({
                    name: comp.name, industry: comp.industry,
                    description: comp.description, embedding, organization_id: orgId
                });
            }
            results.push("10 companies with embeddings created.");
        } else {
            results.push("Companies already exist, skipping.");
        }

        // ================================================================
        // 4. CONTACTS / DECISION MAKERS (idempotent)
        // ================================================================
        const { count: contactCount } = await supabase
            .from("contacts")
            .select("*", { count: "exact", head: true })
            .eq("organization_id", orgId)
            .eq("source", "AI Seed");

        if ((contactCount || 0) === 0) {
            const decisionMakers = [
                { name: "Dr. Ricardo Almeida", company: "Natura &Co", role: "Diretor de Inovaçío e P&D", email: "r.almeida@natura.example.com", expertise: ["Biotecnologia", "Sustentabilidade"], verified: true, type: "lead", status: "qualified" },
                { name: "Eng. Cláudia Souza", company: "Embraer X", role: "VP de Novos Negócios", email: "c.souza@embraerx.example.com", expertise: ["Mobilidade Aérea", "Materiais Compostos"], verified: true, type: "lead", status: "qualified" },
                { name: "Marcos Pontes Jr.", company: "Vale S.A.", role: "Head de Open Innovation", email: "m.pontes@vale.example.com", expertise: ["Descarbonizaçío", "Automaçío"], verified: true, type: "lead", status: "new" },
                { name: "Dra. Ana Beatriz Ferreira", company: "BASF Brasil", role: "Gerente de P&D Polímeros", email: "ab.ferreira@basf.example.com", expertise: ["Polímeros", "Química Verde"], verified: true, type: "lead", status: "qualified" },
                { name: "Prof. Carlos Mendes", company: "Braskem", role: "Diretor de Inovaçío Sustentável", email: "c.mendes@braskem.example.com", expertise: ["Bioplásticos", "Economia Circular"], verified: true, type: "lead", status: "new" },
                { name: "Fernanda Lima", company: "Siemens Brasil", role: "Head of Digital Industries", email: "f.lima@siemens.example.com", expertise: ["IoT", "Automaçío Industrial"], verified: true, type: "lead", status: "contacted" },
                { name: "Dr. Paulo Tavares", company: "Aché Laboratórios", role: "Diretor de R&D", email: "p.tavares@ache.example.com", expertise: ["Drug Delivery", "Biotecnologia"], verified: true, type: "lead", status: "new" },
                { name: "Roberto Campos", company: "WEG S.A.", role: "Gerente de Energia Renovável", email: "r.campos@weg.example.com", expertise: ["Hidrogênio Verde", "Eficiência Energética"], verified: true, type: "lead", status: "qualified" },
                { name: "Juliana Prado", company: "TOTVS", role: "Head de IA & Data", email: "j.prado@totvs.example.com", expertise: ["IA Aplicada", "Cloud Computing"], verified: true, type: "lead", status: "contacted" },
                { name: "Dr. Henrique Souza", company: "Suzano", role: "Diretor de Bioprodutos", email: "h.souza@suzano.example.com", expertise: ["Celulose", "Biorrefinaria"], verified: true, type: "lead", status: "new" },
                { name: "Marina Oliveira", company: "Natura &Co", role: "Coordenadora de Parcerias Acadêmicas", email: "m.oliveira@natura.example.com", expertise: ["Biodiversidade", "Cosméticos"], verified: true, type: "lead", status: "qualified" },
                { name: "Dr. Augusto Neves", company: "BASF Brasil", role: "Head de Sustentabilidade", email: "a.neves@basf.example.com", expertise: ["Catalisadores", "Bioeconomia"], verified: true, type: "lead", status: "new" }
            ];

            for (const dm of decisionMakers) {
                await supabase.from("contacts").insert({
                    organization_id: orgId,
                    name: dm.name, company: dm.company, 
                    email: dm.email, type: dm.type, status: dm.status,
                    source: "AI Seed",
                    role: dm.role, expertise: dm.expertise, verified: dm.verified,
                    tags: ["FirstIgnite", "Decision Maker", dm.company]
                });
            }
            results.push("12 decision maker contacts created.");
        } else {
            results.push("Contacts already exist, skipping.");
        }

        // ================================================================
        // 5. RESEARCHERS (Lattes profiles, idempotent)
        // ================================================================
        const { count: researcherCount } = await supabase
            .from("researchers")
            .select("*", { count: "exact", head: true })
            .eq("organization_id", orgId);

        if ((researcherCount || 0) === 0) {
            const researchers = [
                { name: "Prof. Dr. José Carlos Silva", department: "Engenharia Química", expertise: ["Polímeros Biodegradáveis", "Catálise"], publications_count: 47, patents_count: 3, h_index: 12, lattes_id: "1234567890" },
                { name: "Profa. Dra. Maria Helena Costa", department: "Ciências Biológicas", expertise: ["Biotecnologia", "Genômica"], publications_count: 82, patents_count: 5, h_index: 18, lattes_id: "0987654321" },
                { name: "Prof. Dr. André Oliveira", department: "Engenharia Elétrica", expertise: ["IoT", "Sensores", "Automaçío"], publications_count: 35, patents_count: 2, h_index: 9, lattes_id: "1122334455" },
                { name: "Profa. Dra. Luciana Martins", department: "Ciências Agrárias", expertise: ["Bioinsumos", "Agricultura de Precisío"], publications_count: 61, patents_count: 4, h_index: 15, lattes_id: "5566778899" },
                { name: "Prof. Dr. Fernando Rocha", department: "Ciência da Computaçío", expertise: ["IA", "Machine Learning", "NLP"], publications_count: 29, patents_count: 1, h_index: 8, lattes_id: "9988776655" },
                { name: "Prof. Dr. Ricardo Mendonça", department: "Engenharia de Materiais", expertise: ["Grafeno", "Nanomateriais", "Compósitos"], publications_count: 53, patents_count: 6, h_index: 14, lattes_id: "4433221100" }
            ];

            for (const r of researchers) {
                await supabase.from("researchers").insert({
                    organization_id: orgId,
                    name: r.name, department: r.department, expertise: r.expertise,
                    publications_count: r.publications_count, patents_count: r.patents_count,
                    h_index: r.h_index, lattes_id: r.lattes_id,
                    last_synced_at: new Date().toISOString()
                });
            }
            results.push("6 researchers created.");
        } else {
            results.push("Researchers already exist, skipping.");
        }

        // ================================================================
        // 6. GRANTS (idempotent)
        // ================================================================
        const { count: grantCount } = await supabase
            .from("grants")
            .select("*", { count: "exact", head: true })
            .eq("organization_id", orgId);

        if ((grantCount || 0) === 0) {
            const grants = [
                { name: "Edital Finep - Mais Inovaçío Brasil", agency: "Finep", value: "Até R$ 10.000.000", deadline: "Fluxo Contínuo", description: "Apoio a projetos de inovaçío em empresas brasileiras. Foco em tecnologias críticas e soberania nacional.", url: "https://finep.gov.br", relevance_score: 0.92 },
                { name: "Universal CNPq 2024/2025", agency: "CNPq", value: "Até R$ 200.000", deadline: "Dezembro 2025", description: "Apoio a projetos de pesquisa científica e tecnológica em todas as áreas do conhecimento.", url: "https://cnpq.br", relevance_score: 0.85 },
                { name: "BNDES Fundo Tecnológico (FUNTEC)", agency: "BNDES", value: "Sob Consulta (R$ 5M+)", deadline: "Aberto permanente", description: "Apoio financeiro a projetos de P&D que visem inovaçío de alto impacto no setor produtivo brasileiro.", url: "https://bndes.gov.br", relevance_score: 0.88 },
                { name: "FAPEMIG - Programa Pesquisador Mineiro", agency: "FAPEMIG", value: "Até R$ 80.000", deadline: "Março 2026", description: "Programa de auxílio individual para pesquisadores de Minas Gerais com bolsa produtividade.", url: "https://fapemig.br", relevance_score: 0.78 },
                { name: "Edital EMBRAPII - Unidades 2025", agency: "EMBRAPII", value: "R$ 1M - R$ 5M (compartilhado)", deadline: "Aberto", description: "Projetos de P,D&I em parceria com a indústria. Foco em manufatura avançada, biotecnologia e TICs.", url: "https://embrapii.org.br", relevance_score: 0.90 },
                { name: "FAPESP - PIPE (Pesquisa Inovativa)", agency: "FAPESP", value: "Até R$ 1.200.000", deadline: "Fluxo Contínuo", description: "Apoio à pesquisa inovativa em pequenas empresas do Estado de Sío Paulo. Fases I, II e III.", url: "https://fapesp.br", relevance_score: 0.82 }
            ];

            for (const g of grants) {
                await supabase.from("grants").insert({
                    organization_id: orgId,
                    name: g.name, agency: g.agency, value: g.value,
                    deadline: g.deadline, description: g.description,
                    url: g.url, relevance_score: g.relevance_score
                });
            }
            results.push("6 grants created.");
        } else {
            results.push("Grants already exist, skipping.");
        }

        // ================================================================
        // 7. OUTREACH CAMPAIGNS (idempotent)
        // ================================================================
        const { count: campaignCount } = await supabase
            .from("outreach_campaigns")
            .select("*", { count: "exact", head: true })
            .eq("organization_id", orgId);

        if ((campaignCount || 0) === 0) {
            await supabase.from("outreach_campaigns").insert([
                { organization_id: orgId, user_id: user.id, name: "Prospecçío: Patente Grafeno V2", status: "active", target_technology: "Grafeno", total_sent: 128, total_opened: 84, total_clicked: 32, total_replied: 12 },
                { organization_id: orgId, user_id: user.id, name: "Outreach: Bio-Polímeros (Natura/BASF)", status: "completed", target_technology: "Polímeros", total_sent: 45, total_opened: 40, total_clicked: 18, total_replied: 6 },
                { organization_id: orgId, user_id: user.id, name: "Follow-up: Editais Finep/EMBRAPII", status: "draft", target_technology: "Multi", total_sent: 0, total_opened: 0, total_clicked: 0, total_replied: 0 }
            ]);
            results.push("3 outreach campaigns created.");
        } else {
            results.push("Campaigns already exist, skipping.");
        }

        // ================================================================
        // 8. AUDIT LOGS (seed with real HMAC chain)
        // ================================================================
        const { count: auditCount } = await supabase
            .from("audit_logs")
            .select("*", { count: "exact", head: true })
            .eq("organization_id", orgId);

        if ((auditCount || 0) === 0) {
            const auditEntries = [
                { action: "PLATFORM_INIT", entity_type: "system", details: { event: "Plataforma inicializada para NIT UFV" } },
                { action: "SEED_DATA", entity_type: "system", details: { event: "Dados de demonstraçío inseridos" } },
                { action: "CREATE_PIPELINE", entity_type: "pipeline", details: { name: "Processo 56467 - Transferência de Tecnologia" } },
                { action: "CREATE_PROPOSAL", entity_type: "proposal", details: { title: "Polímero Bio-degradável V2", value: 150000 } },
                { action: "MATCH_RUN", entity_type: "matchmaking", details: { query: "Polímeros sustentáveis", results: 10 } },
                { action: "OUTREACH_SEND", entity_type: "outreach", details: { campaign: "Patente Grafeno V2", recipients: 128 } }
            ];

            for (const entry of auditEntries) {
                await supabase.from("audit_logs").insert({
                    ...entry,
                    organization_id: orgId,
                    user_id: user.id
                });
            }
            results.push("6 audit log entries created (with HMAC chain).");
        } else {
            results.push("Audit logs already exist, skipping.");
        }

        return NextResponse.json({ 
            success: true, 
            message: "Database seeded for NIT UFV!",
            details: results
        });

    } catch (error: any) {
        console.error("Seed Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
