"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
    FileText,
    TrendingUp,
    Tag,
    Mail,
    Heart,
    ArrowRight,
    Loader2,
    Sparkles,
    ShieldAlert,
    Mic,
    Briefcase,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useProfile } from "@/hooks/use-profile";
import { generateAIContent } from "@/app/actions/ai-actions";
import { usePlanLimit } from "@/hooks/use-plan-limit";
import { UpgradeModal } from "@/components/billing/upgrade-modal";
import ReactMarkdown from "react-markdown";

// New Components
import { AIToolsHeader } from "@/components/ai-tools/ai-tools-header";
import { AIToolsStats } from "@/components/ai-tools/ai-tools-stats";
import { AIToolCard } from "@/components/ai-tools/ai-tool-card";
import { AIToolGroup } from "@/components/ai-tools/ai-tool-group";

interface AITool {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    buttonText: string;
    icon: React.ElementType;
    color: string;
    borderColor: string;
    group: "qualification" | "communication" | "closing";
}

const AI_TOOLS: AITool[] = [
    // GROUP 1: QUALIFICAÇÃO
    {
        id: "categorize-lead",
        title: "Scoring & Qualificação",
        subtitle: "Segmentação automática",
        description: "Atribui pontuação e prioridade estratégica ao lead baseado em dados.",
        buttonText: "Qualificar Lead",
        icon: Tag,
        color: "text-purple-600",
        borderColor: "border-t-purple-500",
        group: "qualification",
    },
    {
        id: "generate-proposal",
        title: "Business Case Estratégico",
        subtitle: "Viabilidade e valor",
        description: "Estrutura um caso de negócio personalizado para o perfil do lead.",
        buttonText: "Gerar Business Case",
        icon: FileText,
        color: "text-blue-600",
        borderColor: "border-t-blue-500",
        group: "qualification",
    },
    {
        id: "predictive-analysis",
        title: "Propensão de Fechamento",
        subtitle: "Score preditivo",
        description: "Calcula a probabilidade real de fechamento com base em dados históricos.",
        buttonText: "Analisar Probabilidade",
        icon: TrendingUp,
        color: "text-emerald-600",
        borderColor: "border-t-emerald-500",
        group: "qualification",
    },
    // GROUP 2: COMUNICAÇÃO
    {
        id: "generate-email",
        title: "Comunicação Persuasiva",
        subtitle: "Copywriting de impacto",
        description: "Gera comunicações de follow-up focadas em conversão e engajamento.",
        buttonText: "Gerar Comunicação",
        icon: Mail,
        color: "text-indigo-600",
        borderColor: "border-t-indigo-500",
        group: "communication",
    },
    {
        id: "sentiment-analysis",
        title: "Inteligência Comportamental",
        subtitle: "Análise de humor",
        description: "Decifra o tom, intenção e o engajamento emocional do contato.",
        buttonText: "Analisar Comportamento",
        icon: Heart,
        color: "text-rose-600",
        borderColor: "border-t-rose-500",
        group: "communication",
    },
    {
        id: "sales-script",
        title: "Framework de Conversa",
        subtitle: "Argumentação dinâmica",
        description: "Roteiro estratégico para abordagens de alta performance em vendas.",
        buttonText: "Ver Framework",
        icon: Mic,
        color: "text-slate-700",
        borderColor: "border-t-slate-600",
        group: "communication",
    },
    // GROUP 3: FECHAMENTO
    {
        id: "next-action",
        title: "Next Best Action",
        subtitle: "Recomendação estratégica",
        description: "Sugere a ação de maior impacto para o momento atual do funil.",
        buttonText: "Ver Recomendação",
        icon: ArrowRight,
        color: "text-amber-600",
        borderColor: "border-t-amber-500",
        group: "closing",
    },
    {
        id: "objection-handler",
        title: "Consultoria de Negociação",
        subtitle: "Contorno de objeções",
        description: "Argumentos baseados em frameworks de negociação de alta complexidade.",
        buttonText: "Tratar Objeções",
        icon: ShieldAlert,
        color: "text-red-600",
        borderColor: "border-t-red-500",
        group: "closing",
    },
    {
        id: "meeting-prep",
        title: "Dossiê Pré-Reunião",
        subtitle: "Inteligência de fechamento",
        description: "Briefing executivo com pauta, riscos e objetivos para reuniões.",
        buttonText: "Gerar Dossiê",
        icon: Briefcase,
        color: "text-cyan-600",
        borderColor: "border-t-cyan-500",
        group: "closing",
    },
];

function AIToolsContent() {
    const [supabase] = useState(() => createClient());
    const { profile } = useProfile();
    const [selectedLead, setSelectedLead] = useState<any>(null);
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const [executingToolId, setExecutingToolId] = useState<string | null>(null);
    const [result, setResult] = useState("");
    const searchParams = useSearchParams();
    const initialLeadId = searchParams.get("leadId");

    const { checkLimit, isUpgradeModalOpen, setIsUpgradeModalOpen, lastCheckMessage } = usePlanLimit();

    const executeAI = async (toolId: string) => {
        if (!selectedLead) {
            toast.error("Selecione um lead primeiro");
            return;
        }

        setExecutingToolId(toolId);
        setActiveModal(toolId);
        setResult("");

        try {
            const response = await generateAIContent(toolId, selectedLead.id);

            if (response.success && response.result) {
                setResult(response.result);
                toast.success("Análise concluída!");
            } else if (response.upgradeRequired) {
                setActiveModal(null); // Close the tool modal if it was open
                setResult("");
                // usePlanLimit hook will handle opening the UpgradeModal via checkLimit if we call it
                // But here we got the error from server action. Let's trigger the modal manually or via hook.
                setIsUpgradeModalOpen(true);
            } else {
                toast.error("Erro na análise: " + (response.error || "Erro desconhecido"));
                setResult("Erro ao processar solicitação. Tente novamente em instantes.");
            }
        } catch (error) {
            console.error("Error executing AI:", error);
            toast.error("Erro ao comunicar com o servidor");
        } finally {
            setExecutingToolId(null);
        }
    };

    const closeModal = () => {
        if (executingToolId) return; // Prevent close while running
        setActiveModal(null);
        setResult("");
    };

    const activeTool = AI_TOOLS.find((t) => t.id === activeModal);

    const renderToolGroup = (groupId: "qualification" | "communication" | "closing", title: string, subtitle: string, icon: string, accentColor: string) => {
        const tools = AI_TOOLS.filter(t => t.group === groupId);
        return (
            <AIToolGroup title={title} subtitle={subtitle} icon={icon} accentColor={accentColor}>
                {tools.map(tool => (
                    <AIToolCard
                        key={tool.id}
                        {...tool}
                        disabled={!selectedLead}
                        loading={executingToolId === tool.id}
                        onClick={() => executeAI(tool.id)}
                    />
                ))}
            </AIToolGroup>
        );
    };

    return (
        <div className="flex min-h-screen bg-slate-50/50">
            <Sidebar />
            <div className="flex flex-1 flex-col md:ml-64">
                <Header />
                <main className="flex-1 p-6">
                    <div className="max-w-7xl mx-auto space-y-8">
                        <AIToolsHeader
                            selectedLeadId={initialLeadId}
                            orgId={profile?.organization_id || null}
                            onSelectLead={(lead) => setSelectedLead(lead)}
                        />

                        <AIToolsStats />

                        <div className="space-y-12 pb-20">
                            {renderToolGroup("qualification", "Qualificação & Análise", "Entenda o potencial do seu lead", "📥", "bg-blue-500")}
                            {renderToolGroup("communication", "Comunicação & Relacionamento", "Comunique com impacto e inteligência", "💬", "bg-purple-500")}
                            {renderToolGroup("closing", "Negociação & Fechamento", "Feche com estratégia e preparação", "🎯", "bg-emerald-500")}
                        </div>
                    </div>
                </main>
            </div>

            {/* Result Modal */}
            <Dialog open={activeModal !== null} onOpenChange={(open) => !open && closeModal()}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {activeTool && <activeTool.icon className={`h-5 w-5 ${activeTool.color}`} />}
                            {activeTool?.title}
                        </DialogTitle>
                        <DialogDescription>
                            Resultado da análise para <span className="font-bold text-slate-900">{selectedLead?.name}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        {executingToolId ? (
                            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                <div className="text-center">
                                    <p className="font-bold text-slate-900">Analisando com Inteligência Artificial</p>
                                    <p className="text-sm text-slate-500">Isso pode levar alguns segundos...</p>
                                </div>
                            </div>
                        ) : result ? (
                            <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
                                <div className="prose prose-slate prose-lg max-w-none
                                    text-slate-700 leading-relaxed font-sans
                                    prose-headings:text-indigo-900 prose-headings:font-bold
                                    prose-p:mb-4 prose-p:leading-7
                                    prose-strong:text-slate-900 prose-strong:font-bold
                                    prose-ul:list-disc prose-ul:ml-6 prose-ul:space-y-2
                                    prose-ol:list-decimal prose-ol:ml-6 prose-ol:space-y-2
                                    prose-blockquote:italic prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:pl-4 prose-blockquote:text-slate-600
                                    prose-hr:my-8 prose-hr:border-slate-200
                                    ">
                                    <ReactMarkdown>{result}</ReactMarkdown>
                                </div>
                            </div>
                        ) : null}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={closeModal} disabled={!!executingToolId}>
                            Fechar
                        </Button>
                        {result && (
                             <Button onClick={() => toast.info("Funcionalidade de exportação em breve!")}>
                                Exportar PDF
                             </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <UpgradeModal
                isOpen={isUpgradeModalOpen}
                onClose={() => setIsUpgradeModalOpen(false)}
                message={lastCheckMessage || "Você atingiu o limite de IA Tools do seu plano."}
                orgId={profile?.organization_id}
                userEmail={profile?.email}
                userName={profile?.name}
            />
        </div>
    );
}

export default function AIToolsPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        }>
            <AIToolsContent />
        </Suspense>
    );
}
