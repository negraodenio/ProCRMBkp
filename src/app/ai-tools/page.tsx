"use client";

import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useProfile } from "@/hooks/use-profile";
import { generateAIContent } from "@/app/actions/ai-actions";


interface AITool {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    buttonText: string;
    icon: React.ElementType;
    color: string;
    borderColor: string;
}

const AI_TOOLS: AITool[] = [
    {
        id: "generate-proposal",
        title: "Business Case Estratégico",
        subtitle: "Viabilidade e proposta de valor",
        description: "Estrutura um caso de negócio personalizado para o perfil do lead",
        buttonText: "Gerar Business Case",
        icon: FileText,
        color: "text-blue-700",
        borderColor: "border-t-blue-600",
    },
    {
        id: "predictive-analysis",
        title: "Propensão de Fechamento",
        subtitle: "Score preditivo de conversão",
        description: "Calcula a probabilidade real de fechamento com base em dados",
        buttonText: "Analisar Probabilidade",
        icon: TrendingUp,
        color: "text-emerald-700",
        borderColor: "border-t-emerald-600",
    },
    {
        id: "categorize-lead",
        title: "Scoring & Qualificação",
        subtitle: "Segmentação automática de potencial",
        description: "Atribui pontuação e prioridade estratégica ao lead",
        buttonText: "Qualificar Lead",
        icon: Tag,
        color: "text-purple-700",
        borderColor: "border-t-purple-600",
    },
    {
        id: "generate-email",
        title: "Comunicação Persuasiva",
        subtitle: "Copywriting de alto impacto",
        description: "Gera comunicações de follow-up focadas em conversão",
        buttonText: "Gerar Comunicação",
        icon: Mail,
        color: "text-indigo-600",
        borderColor: "border-t-indigo-500",
    },
    {
        id: "sentiment-analysis",
        title: "Inteligência Comportamental",
        subtitle: "Análise de humor e intenção",
        description: "Decifra o tom e o engajamento emocional do contato",
        buttonText: "Analisar Comportamento",
        icon: Heart,
        color: "text-rose-600",
        borderColor: "border-t-rose-500",
    },
    {
        id: "next-action",
        title: "Next Best Action",
        subtitle: "Recomendação estratégica de passo",
        description: "Sugere a ação de maior impacto para o momento atual",
        buttonText: "Ver Recomendação",
        icon: ArrowRight,
        color: "text-amber-600",
        borderColor: "border-t-amber-500",
    },
    {
        id: "objection-handler",
        title: "Consultoria de Negociação",
        subtitle: "Contorno estratégico de objeções",
        description: "Argumentos baseados em frameworks de negociação",
        buttonText: "Tratar Objeções",
        icon: ShieldAlert,
        color: "text-red-700",
        borderColor: "border-t-red-600",
    },
    {
        id: "sales-script",
        title: "Framework de Conversa",
        subtitle: "Argumentação dinâmica de vendas",
        description: "Roteiro estratégico para abordagens de alta performance",
        buttonText: "Ver Framework",
        icon: Mic,
        color: "text-slate-700",
        borderColor: "border-t-slate-600",
    },
    {
        id: "meeting-prep",
        title: "Dossiê Pré-Reunião",
        subtitle: "Inteligência para o fechamento",
        description: "Briefing executivo com pauta, riscos e objetivos",
        buttonText: "Gerar Dossiê",
        icon: Briefcase,
        color: "text-cyan-700",
        borderColor: "border-t-cyan-600",
    },
];

export default function AIToolsPage() {
    const [supabase] = useState(() => createClient());
    const { profile, loading: profileLoading } = useProfile();
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState("");
    const [selectedLead, setSelectedLead] = useState("");
    const [leads, setLeads] = useState<{ id: string; name: string }[]>([]);


    async function loadLeads() {
        if (!profile?.organization_id) return;
        const { data } = await supabase
            .from("contacts")
            .select("id, name")
            .eq("organization_id", profile.organization_id)
            .limit(20);
        setLeads(data || []);
    }


    function openModal(toolId: string) {
        setActiveModal(toolId);
        setResult("");
        loadLeads();
    }

    function closeModal() {
        setActiveModal(null);
        setResult("");
        setSelectedLead("");
    }

    async function executeAI(toolId: string) {
        if (!selectedLead) {
            toast.error("Selecione um lead primeiro");
            return;
        }

        setLoading(true);
        setResult("");

        try {
            const response = await generateAIContent(toolId, selectedLead);

            if (response.success && response.result) {
                setResult(response.result);
                toast.success("Análise concluída com sucesso!");
            } else {
                toast.error("Erro na análise: " + (response.error || "Erro desconhecido"));
                setResult("Erro ao processar solicitação. Verifique sua chave de API.");
            }
        } catch (error) {
            console.error("Error executing AI:", error);
            toast.error("Erro ao comunicar com o servidor");
        } finally {
            setLoading(false);
        }
    }

    const activeTool = AI_TOOLS.find((t) => t.id === activeModal);

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex flex-1 flex-col md:ml-64">
                <Header />
                <main className="flex-1 p-6">
                    <div className="space-y-6">
                        {/* Header */}
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <Sparkles className="h-8 w-8 text-purple-600" />
                                Sales Intelligence Center
                            </h1>
                            <p className="text-muted-foreground">
                                Ferramentas estratégicas de IA para aceleração comercial
                            </p>
                        </div>

                        {/* Tools Grid */}
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {AI_TOOLS.map((tool) => {
                                const Icon = tool.icon;
                                return (
                                    <Card
                                        key={tool.id}
                                        className={`border-t-4 ${tool.borderColor} hover:shadow-lg transition-shadow`}
                                    >
                                        <CardHeader className="text-center pb-2">
                                            <div className={`mx-auto mb-2 ${tool.color}`}>
                                                <Icon className="h-10 w-10" />
                                            </div>
                                            <CardTitle className="text-lg">{tool.title}</CardTitle>
                                            <CardDescription>{tool.subtitle}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="text-center space-y-4">
                                            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                                                <Sparkles className="h-4 w-4 text-yellow-500" />
                                                {tool.description}
                                            </p>
                                            <Button
                                                variant="outline"
                                                className="w-full"
                                                onClick={() => openModal(tool.id)}
                                            >
                                                <Icon className="mr-2 h-4 w-4" />
                                                {tool.buttonText}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                </main>
            </div>

            {/* Modal for AI Tool */}
            <Dialog open={activeModal !== null} onOpenChange={() => closeModal()}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {activeTool && <activeTool.icon className={`h-5 w-5 ${activeTool.color}`} />}
                            {activeTool?.title}
                        </DialogTitle>
                        <DialogDescription>{activeTool?.subtitle}</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Selecione um Lead</Label>
                            <Select value={selectedLead} onValueChange={setSelectedLead}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Escolha o lead para análise" />
                                </SelectTrigger>
                                <SelectContent>
                                    {leads.map((lead) => (
                                        <SelectItem key={lead.id} value={lead.id}>
                                            {lead.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {result && (
                            <div className="bg-muted/50 border rounded-lg p-4 mt-4">
                                <div className="prose dark:prose-invert prose-sm max-w-none text-foreground">
                                    <pre className="whitespace-pre-wrap font-sans text-sm">{result}</pre>
                                </div>
                            </div>
                        )}

                        {loading && (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <span className="ml-2 text-muted-foreground">Processando com IA...</span>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={closeModal}>
                            Fechar
                        </Button>
                        <Button
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => executeAI(activeModal!)}
                            disabled={loading || !selectedLead}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processando...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Executar IA
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
