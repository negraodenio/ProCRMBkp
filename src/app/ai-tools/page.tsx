"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
    FileText,
    TrendingUp,
    Briefcase,
    Lightbulb,
    Sparkles,
    Loader2,
    FlaskConical,
    Tag,
    ArrowRight,
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
import { useProfile } from "@/hooks/use-profile";
import { generateAIContent } from "@/app/actions/ai-actions";
import { usePlanLimit } from "@/hooks/use-plan-limit";
import { UpgradeModal } from "@/components/billing/upgrade-modal";
import ReactMarkdown from "react-markdown";
import { AIToolsHeader } from "@/components/ai-tools/ai-tools-header";

// ============================================================
// As 5 ferramentas oficiais do NIT — Processo 56467
// ============================================================
const AI_TOOLS = [
    {
        id: "science-teaser",
        title: "Science Teaser",
        subtitle: "Resumo executivo da tecnologia",
        description: "Transforma um artigo ou patente em uma proposta de valor de 3 parágrafos que qualquer CEO entende.",
        buttonText: "Gerar Teaser",
        icon: Sparkles,
        color: "from-violet-500 to-indigo-600",
        badge: "Mais usado",
    },
    {
        id: "patent-to-pitch",
        title: "Pitch de Patente",
        subtitle: "Comercialização de IP",
        description: "Estrutura uma proposta de valor comercial completa a partir dos dados técnicos de uma patente.",
        buttonText: "Gerar Pitch",
        icon: Briefcase,
        color: "from-orange-500 to-amber-600",
        badge: "IP & Licenciamento",
    },
    {
        id: "market-applications",
        title: "Novos Mercados",
        subtitle: "Análise de verticais",
        description: "Identifica novos setores e aplicações potenciais para uma tecnologia usando análise vetorial.",
        buttonText: "Descobrir Mercados",
        icon: TrendingUp,
        color: "from-emerald-500 to-teal-600",
        badge: "Expansão",
    },
    {
        id: "generate-proposal",
        title: "Business Case",
        subtitle: "Viabilidade estratégica",
        description: "Gera um caso de negócio com análise de ROI, público-alvo e proposta de parceria para o parceiro corporativo.",
        buttonText: "Gerar Business Case",
        icon: FileText,
        color: "from-blue-500 to-cyan-600",
        badge: "Parcerias",
    },
    {
        id: "categorize-lead",
        title: "Scoring de Lead",
        subtitle: "Qualificação automatizada",
        description: "Atribui pontuação estratégica e recomenda a próxima ação com base no perfil do decisor mapeado.",
        buttonText: "Qualificar Lead",
        icon: Tag,
        color: "from-rose-500 to-pink-600",
        badge: "CRM",
    },
];

function AIToolsContent() {
    const { profile } = useProfile();
    const [selectedLead, setSelectedLead] = useState<any>(null);
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const [executingToolId, setExecutingToolId] = useState<string | null>(null);
    const [result, setResult] = useState("");
    const [researchText, setResearchText] = useState("");
    const [inputMode, setInputMode] = useState<"lead" | "research">("research");
    const searchParams = useSearchParams();
    const initialLeadId = searchParams.get("leadId");

    const { isUpgradeModalOpen, setIsUpgradeModalOpen, lastCheckMessage } = usePlanLimit();

    const executeAI = async (toolId: string) => {
        if (inputMode === "lead" && !selectedLead) {
            toast.error("Selecione um lead primeiro");
            return;
        }
        if (inputMode === "research" && !researchText.trim()) {
            toast.error("Insira o texto da pesquisa ou patente primeiro");
            return;
        }

        setExecutingToolId(toolId);
        setActiveModal(toolId);
        setResult("");

        try {
            const response = await generateAIContent(
                toolId,
                inputMode === "lead" ? selectedLead?.id : undefined,
                inputMode === "research" ? researchText : undefined
            );

            if (response.success && response.result) {
                setResult(response.result);
                toast.success("Análise concluída!");
            } else if (response.upgradeRequired) {
                setActiveModal(null);
                setIsUpgradeModalOpen(true);
            } else {
                toast.error("Erro: " + (response.error || "Tente novamente."));
            }
        } catch {
            toast.error("Erro ao comunicar com o servidor");
        } finally {
            setExecutingToolId(null);
        }
    };

    const closeModal = () => {
        if (executingToolId) return;
        setActiveModal(null);
        setResult("");
    };

    const activeTool = AI_TOOLS.find((t) => t.id === activeModal);

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar />
            <div className="flex flex-1 flex-col md:ml-64">
                <Header />
                <main className="flex-1 p-8 max-w-5xl mx-auto w-full space-y-8">

                    {/* Header */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest">
                            <FlaskConical className="h-4 w-4" />
                            NIT · Neural Engine
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">IA Tools</h1>
                        <p className="text-muted-foreground">
                            5 ferramentas de inteligência artificial especializadas em transferência de tecnologia.
                        </p>
                    </div>

                    {/* Input Toggle */}
                    <div className="bg-white border rounded-xl p-6 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg w-fit">
                            <Button
                                variant={inputMode === "research" ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setInputMode("research")}
                                className="text-xs gap-2"
                            >
                                <FlaskConical className="h-3 w-3" />
                                Texto / Patente
                            </Button>
                            <Button
                                variant={inputMode === "lead" ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setInputMode("lead")}
                                className="text-xs gap-2"
                            >
                                <Tag className="h-3 w-3" />
                                Lead do CRM
                            </Button>
                        </div>

                        {inputMode === "research" ? (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">
                                    Cole o texto da patente, artigo científico ou descrição da tecnologia:
                                </label>
                                <textarea
                                    className="w-full h-36 p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
                                    placeholder="Ex: Esta invenção refere-se a um método inovador de síntese de polímeros biodegradáveis utilizando catálise enzimática..."
                                    value={researchText}
                                    onChange={(e) => setResearchText(e.target.value)}
                                />
                                {researchText && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                                            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                                            Pronto — selecione uma ferramenta abaixo
                                        </span>
                                        <Button variant="ghost" size="sm" className="text-xs text-slate-400" onClick={() => setResearchText("")}>
                                            Limpar
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <AIToolsHeader
                                selectedLeadId={initialLeadId}
                                orgId={profile?.organization_id || null}
                                onSelectLead={(lead) => setSelectedLead(lead)}
                            />
                        )}
                    </div>

                    {/* The 5 Tools */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {AI_TOOLS.map((tool) => {
                            const Icon = tool.icon;
                            const isRunning = executingToolId === tool.id;
                            const isReady = inputMode === "research" ? !!researchText.trim() : !!selectedLead;

                            return (
                                <div
                                    key={tool.id}
                                    className={`bg-white border rounded-2xl p-6 space-y-4 shadow-sm transition-all duration-200 ${
                                        isReady ? "hover:shadow-md hover:-translate-y-0.5 cursor-pointer" : "opacity-60"
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className={`p-3 rounded-xl bg-gradient-to-br ${tool.color} shadow-sm`}>
                                            <Icon className="h-5 w-5 text-white" />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-1 rounded-full">
                                            {tool.badge}
                                        </span>
                                    </div>

                                    <div className="space-y-1">
                                        <h3 className="font-bold text-slate-900">{tool.title}</h3>
                                        <p className="text-xs text-indigo-600 font-medium uppercase tracking-wide">{tool.subtitle}</p>
                                        <p className="text-sm text-slate-500 leading-relaxed">{tool.description}</p>
                                    </div>

                                    <Button
                                        className={`w-full gap-2 bg-gradient-to-r ${tool.color} text-white border-0 hover:opacity-90`}
                                        disabled={!isReady || isRunning}
                                        onClick={() => executeAI(tool.id)}
                                    >
                                        {isRunning ? (
                                            <><Loader2 className="h-4 w-4 animate-spin" /> Processando...</>
                                        ) : (
                                            <><ArrowRight className="h-4 w-4" /> {tool.buttonText}</>
                                        )}
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                </main>
            </div>

            {/* Result Modal */}
            <Dialog open={activeModal !== null} onOpenChange={(open) => !open && closeModal()}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {activeTool && (
                                <div className={`p-1.5 rounded-lg bg-gradient-to-br ${activeTool.color}`}>
                                    <activeTool.icon className="h-4 w-4 text-white" />
                                </div>
                            )}
                            {activeTool?.title}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedLead
                                ? <>Resultado para <span className="font-bold text-slate-900">{selectedLead?.name}</span></>
                                : "Resultado baseado no texto inserido"
                            }
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        {executingToolId ? (
                            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                <div className={`p-4 rounded-full bg-gradient-to-br ${activeTool?.color || "from-indigo-500 to-purple-600"}`}>
                                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                                </div>
                                <div className="text-center">
                                    <p className="font-bold text-slate-900">Neural Engine Processando...</p>
                                    <p className="text-sm text-slate-500">Isso pode levar alguns segundos.</p>
                                </div>
                            </div>
                        ) : result ? (
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                                <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed
                                    prose-headings:text-indigo-900 prose-headings:font-bold
                                    prose-strong:text-slate-900 prose-strong:font-bold
                                    prose-ul:list-disc prose-ul:ml-6 prose-ul:space-y-1
                                    prose-ol:list-decimal prose-ol:ml-6">
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
                            <Button onClick={() => { window.print(); toast.success("Exportando para PDF..."); }}>
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
