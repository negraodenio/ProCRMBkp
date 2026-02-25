"use client";

import { useState } from "react";
import { Plus, Settings2, Trash2, Edit2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { PipelineSelector } from "./pipeline-selector";
import { KanbanBoard } from "./kanban-board";
import { createPipeline, updatePipeline, deletePipeline } from "@/app/pipeline/actions";
import { analyzeFunnelWithAI, FunnelAnalysisResult } from "@/app/pipeline/ai-actions";
import { toast } from "sonner";

interface Pipeline {
    id: string;
    name: string;
    is_default?: boolean;
}

interface PipelineViewProps {
    pipelines: Pipeline[];
    currentPipelineId: string;
    stages: any[];
    proposals: any[];
    organizationId: string;
}

export function PipelineView({
    pipelines: initialPipelines,
    currentPipelineId,
    stages,
    proposals,
    organizationId
}: PipelineViewProps) {
    const [pipelines, setPipelines] = useState<Pipeline[]>(initialPipelines);
    const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newPipelineName, setNewPipelineName] = useState("");
    const [editingPipelineId, setEditingPipelineId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState("");

    // AI Funnel Analysis State
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<FunnelAnalysisResult | null>(null);
    const [isInsightDialogOpen, setIsInsightDialogOpen] = useState(false);

    const handleCreatePipeline = async () => {
        if (!newPipelineName.trim()) return;
        const result = await createPipeline({
            name: newPipelineName,
            organization_id: organizationId
        });

        if (result.success) {
            toast.success("Funil criado com sucesso!");
            setNewPipelineName("");
            setIsCreating(false);
            // Refresh local state if needed, or just let revalidatePath handle it
            // For better UX, we could update local state or just reload
            window.location.reload();
        } else {
            toast.error(result.error || "Erro ao criar funil");
        }
    };

    const handleUpdatePipeline = async (id: string) => {
        if (!editingName.trim()) return;
        const result = await updatePipeline(id, { name: editingName });

        if (result.success) {
            toast.success("Funil atualizado!");
            setEditingPipelineId(null);
            window.location.reload();
        } else {
            toast.error(result.error || "Erro ao atualizar funil");
        }
    };

    const handleDeletePipeline = async (id: string) => {
        if (pipelines.length <= 1) {
            toast.error("Você deve ter pelo menos um funil.");
            return;
        }

        if (confirm("Tem certeza que deseja excluir este funil? Todas as etapas serão removidas.")) {
            const result = await deletePipeline(id);
            if (result.success) {
                toast.success("Funil excluído!");
                window.location.reload();
            } else {
                toast.error(result.error || "Erro ao excluir funil");
            }
        }
    };

    const handleAnalyzeFunnel = async () => {
        setIsAnalyzing(true);
        const currentPipeline = pipelines.find(p => p.id === currentPipelineId);

        try {
            // Enrich proposals with days in stage for the AI
            const enrichedProposals = proposals.map(p => {
                const stage = stages.find(s => s.id === p.stage_id);
                const dateStr = p.updated_at || p.created_at || new Date().toISOString();
                const daysInStage = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 3600 * 24));

                return {
                    id: p.id,
                    title: p.title,
                    total: p.total,
                    currency: p.currency || 'BRL',
                    stageName: stage?.name || 'Desconhecida',
                    daysInStage: daysInStage
                };
            });

            const result = await analyzeFunnelWithAI({
                funnelName: currentPipeline?.name || 'Principal',
                stages: stages,
                proposals: enrichedProposals
            });

            if (result.success && result.data) {
                setAnalysisResult(result.data);
                setIsInsightDialogOpen(true);
            } else {
                toast.error(result.error || "Erro ao analisar o funil.");
            }
        } catch (error) {
            toast.error("Ocorreu um erro ao chamar o AI Deal Coach.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex items-center justify-between mb-8">
                <PipelineSelector
                    pipelines={pipelines}
                    currentPipelineId={currentPipelineId}
                    onManagePipelines={() => setIsManageDialogOpen(true)}
                />
                <div className="flex items-center gap-2">
                    <Button
                        onClick={handleAnalyzeFunnel}
                        disabled={isAnalyzing}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold h-9 text-sm shadow-md shadow-purple-600/20"
                    >
                        {isAnalyzing ? "Analisando..." : "✨ AI Deal Coach"}
                    </Button>
                    <div className="h-6 w-[1px] bg-slate-200 mx-2" />
                    <div className="flex -space-x-2">
                        <div className="h-8 w-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold">RT</div>
                        <div className="h-8 w-8 rounded-full border-2 border-white bg-cyan-100 flex items-center justify-center text-[10px] font-bold text-cyan-700">+3</div>
                    </div>
                    <button className="text-xs font-bold text-slate-500 ml-2">Minhas negociações</button>
                </div>
            </div>

            <div className="flex-1 overflow-x-auto overflow-y-hidden">
                <KanbanBoard
                    initialStages={stages}
                    initialProposals={proposals}
                />
            </div>

            {/* Management Dialog */}
            <Dialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Configurar Funis de Vendas</DialogTitle>
                        <DialogDescription>
                            Gerencie seus fluxos de trabalho e processos comerciais.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            {pipelines.map((p) => (
                                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border bg-slate-50/50">
                                    {editingPipelineId === p.id ? (
                                        <div className="flex items-center gap-2 flex-1 mr-4">
                                            <Input
                                                value={editingName}
                                                onChange={(e) => setEditingName(e.target.value)}
                                                className="h-8"
                                                autoFocus
                                            />
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={() => handleUpdatePipeline(p.id)}>
                                                <Check className="h-4 w-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => setEditingPipelineId(null)}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="font-medium text-sm flex-1">{p.name} {p.is_default && <span className="text-[10px] bg-slate-200 px-1 rounded ml-2">Padrão</span>}</div>
                                            <div className="flex items-center gap-1">
                                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => {
                                                    setEditingPipelineId(p.id);
                                                    setEditingName(p.name);
                                                }}>
                                                    <Edit2 className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => handleDeletePipeline(p.id)}>
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>

                        {isCreating ? (
                            <div className="flex items-center gap-2 mt-4 p-3 rounded-lg border border-dashed border-blue-200 bg-blue-50/30">
                                <Input
                                    placeholder="Nome do novo funil..."
                                    value={newPipelineName}
                                    onChange={(e) => setNewPipelineName(e.target.value)}
                                    className="h-8"
                                    autoFocus
                                />
                                <Button size="sm" className="h-8 bg-blue-600" onClick={handleCreatePipeline}>Criar</Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setIsCreating(false)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <Button
                                variant="outline"
                                className="w-full border-dashed border-slate-300"
                                onClick={() => setIsCreating(true)}
                            >
                                <Plus className="mr-2 h-4 w-4" /> Novo Funil
                            </Button>
                        )}
                    </div>

                    <DialogFooter>
                        <Button onClick={() => setIsManageDialogOpen(false)}>Fechar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* AI Insights Dialog */}
            <Dialog open={isInsightDialogOpen} onOpenChange={setIsInsightDialogOpen}>
                <DialogContent className="sm:max-w-[600px] border-purple-200 bg-white shadow-xl shadow-purple-500/10">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-2xl font-black text-slate-900">
                            <span className="p-2 bg-purple-100 rounded-lg text-purple-600">✨</span>
                            AI Deal Coach
                        </DialogTitle>
                        <DialogDescription className="text-slate-500">
                            Análise estratégica do seu funil gerada por inteligência artificial em tempo real.
                        </DialogDescription>
                    </DialogHeader>

                    {analysisResult && (
                        <div className="py-6 space-y-6">
                            {/* Insight 1 */}
                            <div className="bg-red-50/50 border border-red-100 p-4 rounded-xl">
                                <h4 className="text-red-800 font-bold text-sm uppercase tracking-wide mb-2 flex items-center gap-2">
                                    <span className="text-red-500">🚨</span> Gargalo Financeiro
                                </h4>
                                <p className="text-slate-700 font-medium">{analysisResult.bottleneck}</p>
                            </div>

                            {/* Insight 2 */}
                            <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl">
                                <h4 className="text-emerald-800 font-bold text-sm uppercase tracking-wide mb-2 flex items-center gap-2">
                                    <span className="text-emerald-500">🎯</span> Oportunidade FOCO
                                </h4>
                                <p className="text-slate-700 font-medium">{analysisResult.focus_deal}</p>
                            </div>

                            {/* Insight 3 */}
                            <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl">
                                <h4 className="text-blue-800 font-bold text-sm uppercase tracking-wide mb-2 flex items-center gap-2">
                                    <span className="text-blue-500">⚡</span> Ação Imediata
                                </h4>
                                <p className="text-slate-700 font-medium">{analysisResult.actionable_insight}</p>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            className="w-full bg-purple-600 hover:bg-purple-700 font-bold"
                            onClick={() => setIsInsightDialogOpen(false)}
                        >
                            Voltar para o Funil
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
