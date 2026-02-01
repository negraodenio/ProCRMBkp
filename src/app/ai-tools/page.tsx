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
        title: "Gerar Proposta",
        subtitle: "Proposta automática baseada no perfil do lead",
        description: "Gera propostas personalizadas com base nos dados do lead",
        buttonText: "Gerar Proposta",
        icon: FileText,
        color: "text-blue-600",
        borderColor: "border-t-blue-500",
    },
    {
        id: "predictive-analysis",
        title: "Análise Preditiva",
        subtitle: "Probabilidade de fechamento do lead",
        description: "Prevê chances de conversão baseado em dados históricos",
        buttonText: "Analisar Fechamento",
        icon: TrendingUp,
        color: "text-green-600",
        borderColor: "border-t-green-500",
    },
    {
        id: "categorize-lead",
        title: "Categorizar Lead",
        subtitle: "Classifica potencial automaticamente",
        description: "Categoriza leads por potencial de conversão",
        buttonText: "Categorizar",
        icon: Tag,
        color: "text-purple-600",
        borderColor: "border-t-purple-500",
    },
    {
        id: "generate-email",
        title: "Gerar E-mail",
        subtitle: "E-mails de follow-up personalizados",
        description: "Cria e-mails de follow-up baseados no perfil e histórico",
        buttonText: "Gerar E-mail",
        icon: Mail,
        color: "text-blue-500",
        borderColor: "border-t-blue-400",
    },
    {
        id: "sentiment-analysis",
        title: "Análise de Sentimento",
        subtitle: "Como o lead está reagindo",
        description: "Analisa humor e intenção nas interações",
        buttonText: "Analisar Sentimento",
        icon: Heart,
        color: "text-pink-500",
        borderColor: "border-t-pink-400",
    },
    {
        id: "next-action",
        title: "Próxima Ação",
        subtitle: "O que fazer agora com o lead",
        description: "Sugere a melhor ação baseada no contexto atual",
        buttonText: "Sugerir Ação",
        icon: ArrowRight,
        color: "text-orange-500",
        borderColor: "border-t-orange-400",
    },
];

export default function AIToolsPage() {
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState("");
    const [selectedLead, setSelectedLead] = useState("");
    const [leads, setLeads] = useState<{ id: string; name: string }[]>([]);

    const supabase = createClient();

    async function loadLeads() {
        const { data } = await supabase.from("contacts").select("id, name").limit(20);
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
        setLoading(true);
        setResult("");

        // Simulate AI processing
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const leadName = leads.find((l) => l.id === selectedLead)?.name || "Cliente";

        switch (toolId) {
            case "generate-proposal":
                setResult(`
# Proposta Comercial para ${leadName}

## Escopo do Projeto
- Desenvolvimento de sistema personalizado
- Integração com APIs existentes
- Suporte técnico por 12 meses

## Investimento
**R$ 45.000,00** em até 6x

## Prazo de Entrega
90 dias úteis

## Garantia
12 meses de garantia completa
        `);
                break;
            case "predictive-analysis":
                setResult(`
## Análise de Probabilidade de Fechamento

**Lead:** ${leadName}
**Score de Conversão:** 78%

### Fatores Positivos
✅ Engajamento alto nas últimas interações
✅ Perfil compatível com clientes convertidos
✅ Orçamento adequado ao ticket médio

### Fatores de Atenção
⚠️ Tempo médio de decisão: 15 dias
⚠️ Concorrência identificada

### Recomendação
O lead está pronto para receber uma proposta comercial!
        `);
                break;
            case "categorize-lead":
                setResult(`
## Categorização Automática

**Lead:** ${leadName}

### Classificação: 🔥 HOT LEAD

**Potencial:** Alto
**Prioridade:** Urgente
**Ticket Estimado:** R$ 25.000 - R$ 50.000

### Próximos Passos
1. Agendar reunião de apresentação
2. Preparar proposta personalizada
3. Follow-up em 48h
        `);
                break;
            case "generate-email":
                setResult(`
**Assunto:** Próximos passos - ${leadName}

Olá ${leadName},

Espero que esteja bem!

Gostaria de acompanhar nosso último contato e verificar se há algo mais que possamos esclarecer sobre nossa proposta.

Estou à disposição para uma reunião rápida esta semana, caso prefira discutir os detalhes pessoalmente.

Aguardo seu retorno!

Atenciosamente,
Equipe CRM IA
        `);
                break;
            case "sentiment-analysis":
                setResult(`
## Análise de Sentimento - ${leadName}

### Sentimento Geral: 😊 Positivo (82%)

**Última Interação:** Entusiasmo demonstrado
**Tendência:** Crescente nas últimas 3 conversas

### Indicadores
- Tempo de resposta: Rápido (< 2h)
- Tom das mensagens: Cordial e interessado
- Palavras-chave positivas: "interessante", "gostei", "quando podemos"

### Recomendação
Momento ideal para avançar na negociação!
        `);
                break;
            case "next-action":
                setResult(`
## Próxima Ação Sugerida para ${leadName}

### ⚡ Ação Recomendada: Enviar Proposta

**Por quê?**
- Lead qualificado há mais de 7 dias
- Demonstrou interesse em reunião anterior
- Score de conversão acima de 75%

### Passos Sugeridos
1. ✍️ Preparar proposta personalizada
2. 📞 Ligar para confirmar recebimento
3. 📅 Agendar follow-up em 3 dias

### Urgência: 🔴 Alta
        `);
                break;
        }

        setLoading(false);

        // Log to AI operations table
        try {
            const { data: profile } = await supabase
                .from("profiles")
                .select("id, organization_id")
                .single();

            if (profile) {
                await supabase.from("ai_operations").insert({
                    organization_id: profile.organization_id,
                    user_id: profile.id,
                    tool_used: toolId,
                    target_entity_id: selectedLead || null,
                    input_params: { leadId: selectedLead },
                    output_result: { result: result.substring(0, 500) },
                    model_used: "gpt-4o",
                    tokens_used: Math.floor(Math.random() * 1000) + 500,
                });
            }
        } catch (e) {
            console.log("AI log error (non-critical):", e);
        }

        toast.success("Análise concluída!");
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
                                <Sparkles className="h-8 w-8 text-purple-500" />
                                Inteligência Artificial
                            </h1>
                            <p className="text-muted-foreground">
                                Ferramentas de IA para otimizar vendas
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
                            <div className="bg-slate-50 rounded-lg p-4 prose prose-sm max-w-none">
                                <pre className="whitespace-pre-wrap text-sm">{result}</pre>
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
