"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Plus, MoreVertical, Edit2, Trash2, Check, X, FileText, DollarSign, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DealCard } from "./deal-card";
import { updateDealStage, updateDeal, createStage, updateStage, deleteStage } from "@/app/pipeline/actions";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

// Types matching Supabase
type Deal = {
    id: string;
    title: string;
    value: number;
    contact_id?: string;
    contact_name?: string;
    stage_id: string;
    notes?: string;
};

type Stage = {
    id: string;
    name: string;
    color?: string;
    order?: number;
    pipeline_id?: string;
};

// Color options for new stages
const COLOR_OPTIONS = [
    { name: "Azul", value: "bg-blue-500" },
    { name: "Laranja", value: "bg-orange-500" },
    { name: "Verde", value: "bg-green-500" },
    { name: "Azul Escuro", value: "bg-blue-800" },
    { name: "Verde Escuro", value: "bg-green-700" },
    { name: "Vermelho", value: "bg-red-500" },
    { name: "Roxo", value: "bg-purple-500" },
    { name: "Rosa", value: "bg-pink-500" },
    { name: "Amarelo", value: "bg-yellow-500" },
    { name: "Cinza", value: "bg-gray-500" },
];

interface KanbanBoardProps {
    initialStages: Stage[];
    initialDeals: any[];
}

export function KanbanBoard({ initialStages, initialDeals }: KanbanBoardProps) {
    const [deals, setDeals] = useState<any[]>(initialDeals);
    const [stages, setStages] = useState<Stage[]>(initialStages);
    const [editingStageId, setEditingStageId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState("");
    const [newStageDialogOpen, setNewStageDialogOpen] = useState(false);
    const [newStageName, setNewStageName] = useState("");
    const [newStageColor, setNewStageColor] = useState("bg-blue-500");

    // Edit Deal State
    const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
    const [dealFormData, setDealFormData] = useState<Partial<Deal>>({});
    const [isSavingDeal, setIsSavingDeal] = useState(false);

    const supabase = createClient();

    const openEditDeal = (deal: Deal) => {
        setEditingDeal(deal);
        setDealFormData({
            title: deal.title,
            value: deal.value,
            notes: deal.notes || ""
        });
    };

    const handleSaveDeal = async () => {
        if (!editingDeal) return;
        setIsSavingDeal(true);
        try {
            const result = await updateDeal(editingDeal.id, {
                title: dealFormData.title,
                value: Number(dealFormData.value) || 0,
                notes: dealFormData.notes
            });

            if (result.success) {
                setDeals(deals.map(d => d.id === editingDeal.id ? { ...d, ...dealFormData } : d));
                toast.success("Negócio atualizado!");
                setEditingDeal(null);
            } else {
                toast.error("Erro ao salvar: " + result.error);
            }
        } catch (e) {
            toast.error("Erro inesperado ao salvar.");
        } finally {
            setIsSavingDeal(false);
        }
    };

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const newStageId = destination.droppableId;

        // 1. Optimistic Update
        const originalDeals = [...deals];
        const newDeals = deals.map((deal) => {
            if (deal.id === draggableId) {
                return { ...deal, stage_id: newStageId };
            }
            return deal;
        });

        setDeals(newDeals);

        // 2. Server Action
        try {
            const result = await updateDealStage(draggableId, newStageId);
            if (!result.success) {
                throw new Error(result.error);
            }
            toast.success("Deal movido com sucesso!");
        } catch (error) {
            toast.error("Erro ao mover deal");
            setDeals(originalDeals); // Rollback
        }
    };

    const startEditingStage = (stage: Stage) => {
        setEditingStageId(stage.id);
        setEditingName(stage.name);
    };

    const cancelEditing = () => {
        setEditingStageId(null);
        setEditingName("");
    };

    const saveStageRename = async (stageId: string) => {
        if (!editingName.trim()) {
            toast.error("Nome não pode ser vazio");
            return;
        }

        const result = await updateStage(stageId, { name: editingName.trim() });

        if (result.error) {
            toast.error("Erro ao renomear etapa");
            return;
        }

        setStages(stages.map(s => s.id === stageId ? { ...s, name: editingName.trim() } : s));
        toast.success("Etapa renomeada!");
        cancelEditing();
    };

    const handleDeleteStage = async (stageId: string) => {
        const stageDeals = deals.filter(d => d.stage_id === stageId);

        if (stageDeals.length > 0) {
            toast.error(`Não é possível excluir. Existem ${stageDeals.length} deal(s) nesta etapa.`);
            return;
        }

        if (!confirm("Tem certeza que deseja excluir esta etapa?")) return;

        const result = await deleteStage(stageId);

        if (result.error) {
            toast.error(result.error || "Erro ao excluir etapa");
            return;
        }

        setStages(stages.filter(s => s.id !== stageId));
        toast.success("Etapa excluída!");
    };

    const handleCreateStage = async () => {
        if (!newStageName.trim()) {
            toast.error("Nome não pode ser vazio");
            return;
        }

        // Get pipeline_id from first stage
        const pipelineId = stages[0]?.pipeline_id;
        if (!pipelineId) {
            // Error case
            toast.error("Pipeline não encontrado");
            return;
        }

        const maxOrder = Math.max(...stages.map(s => s.order || 0), 0);

        const result = await createStage({
            pipeline_id: pipelineId,
            name: newStageName.trim(),
            color: newStageColor,
            order: maxOrder + 1,
        });

        if (result.error) {
            toast.error("Erro ao criar etapa");
            return;
        }

        if (result.data) {
            setStages([...stages, result.data as Stage]);
            toast.success("Etapa criada!");
        }

        setNewStageDialogOpen(false);
        setNewStageName("");
        setNewStageColor("bg-blue-500");
    };

    const getStageStyle = (stage: Stage) => {
        const color = stage.color || "bg-slate-500";
        if (color.startsWith("#")) {
            return { backgroundColor: color };
        }
        return {};
    };

    const getStageClassName = (stage: Stage) => {
        const color = stage.color || "bg-slate-500";
        if (color.startsWith("#")) {
            return "text-white p-3";
        }
        return `${color} text-white p-3`;
    };

    return (
        <>
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex h-full gap-4 pb-4 overflow-x-auto">
                    {stages.map((stage) => {
                        const stageDeals = deals.filter((deal) => deal.stage_id === stage.id);
                        const totalValue = stageDeals.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);

                        return (
                            <div key={stage.id} className="flex flex-col w-72 min-w-[288px] bg-slate-50 rounded-xl overflow-hidden shadow-sm border">
                                {/* Colored Header */}
                                <div
                                    className={getStageClassName(stage)}
                                    style={{
                                        ...getStageStyle(stage),
                                        minHeight: '4rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        {editingStageId === stage.id ? (
                                            <div className="flex items-center gap-2 flex-1">
                                                <Input
                                                    value={editingName}
                                                    onChange={(e) => setEditingName(e.target.value)}
                                                    className="h-7 text-sm bg-white text-black"
                                                    autoFocus
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") saveStageRename(stage.id);
                                                        if (e.key === "Escape") cancelEditing();
                                                    }}
                                                />
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-7 w-7 text-white hover:bg-white/20"
                                                    onClick={() => saveStageRename(stage.id)}
                                                >
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-7 w-7 text-white hover:bg-white/20"
                                                    onClick={cancelEditing}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <>
                                                <h3 className="font-semibold text-sm uppercase tracking-wide">
                                                    {stage.name}
                                                </h3>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-6 w-6 text-white hover:bg-white/20"
                                                        >
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => startEditingStage(stage)}>
                                                            <Edit2 className="h-4 w-4 mr-2" />
                                                            Renomear
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleDeleteStage(stage.id)}
                                                            className="text-red-600"
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Excluir
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between text-xs opacity-90">
                                        <span>{stageDeals.length} deal{stageDeals.length !== 1 ? "s" : ""}</span>
                                        <span>
                                            {new Intl.NumberFormat("pt-BR", {
                                                style: "currency",
                                                currency: "BRL",
                                            }).format(totalValue)}
                                        </span>
                                    </div>
                                </div>

                                {/* Droppable Area */}
                                <Droppable droppableId={stage.id}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={`flex-1 p-3 space-y-3 min-h-[200px] ${snapshot.isDraggingOver ? "bg-blue-50" : ""
                                                }`}
                                        >
                                            {stageDeals.length === 0 ? (
                                                <div className="flex flex-col gap-3 py-4">
                                                    <div className="h-24 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center bg-white/50">
                                                        <p className="text-center text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                                                            Aguardando leads
                                                        </p>
                                                    </div>
                                                    <div className="h-24 rounded-lg border border-slate-100 bg-white/20 opacity-40"></div>
                                                    <div className="h-24 rounded-lg border border-slate-100 bg-white/20 opacity-20"></div>
                                                </div>
                                            ) : (
                                                stageDeals.map((deal, index) => (
                                                    <Draggable key={deal.id} draggableId={deal.id} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                            >
                                                                <DealCard
                                                                    deal={deal}
                                                                    isDragging={snapshot.isDragging}
                                                                    onEdit={openEditDeal}
                                                                />
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))
                                            )}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        );
                    })}

                    {/* Add New Stage Button */}
                    <div className="flex flex-col w-72 min-w-[288px]">
                        <Button
                            variant="outline"
                            className="h-full min-h-[200px] border-dashed border-2 hover:bg-slate-50"
                            onClick={() => setNewStageDialogOpen(true)}
                        >
                            <Plus className="h-6 w-6 mr-2" />
                            Nova Etapa
                        </Button>
                    </div>
                </div>
            </DragDropContext>

            {/* New Stage Dialog */}
            <Dialog open={newStageDialogOpen} onOpenChange={setNewStageDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Criar Nova Etapa</DialogTitle>
                        <DialogDescription>
                            Adicione uma nova etapa ao seu pipeline de vendas.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="stage-name">Nome da Etapa</Label>
                            <Input
                                id="stage-name"
                                placeholder="Ex: Apresentação"
                                value={newStageName}
                                onChange={(e) => setNewStageName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Cor</Label>
                            <div className="grid grid-cols-5 gap-2">
                                {COLOR_OPTIONS.map((color) => (
                                    <button
                                        key={color.value}
                                        type="button"
                                        className={`h-10 rounded ${color.value} ${newStageColor === color.value ? "ring-2 ring-offset-2 ring-black" : ""
                                            }`}
                                        onClick={() => setNewStageColor(color.value)}
                                        title={color.name}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setNewStageDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleCreateStage} className="bg-blue-600 hover:bg-blue-700">
                            Criar Etapa
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* Modal de Edição do Negócio (Deal) */}
            <Dialog open={!!editingDeal} onOpenChange={(open) => !open && setEditingDeal(null)}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Tag className="h-5 w-5 text-indigo-500" />
                            Editar Negócio
                        </DialogTitle>
                        <DialogDescription>
                            Atualize as informações e adicione notas internas sobre este lead.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <div className="space-y-4 border-b pb-6">
                            <div className="space-y-2">
                                <Label htmlFor="deal-title" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Título do Negócio
                                </Label>
                                <Input
                                    id="deal-title"
                                    value={dealFormData.title}
                                    onChange={(e) => setDealFormData({ ...dealFormData, title: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="deal-value" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Valor Estimado (R$)
                                </Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="deal-value"
                                        type="number"
                                        value={dealFormData.value}
                                        onChange={(e) => setDealFormData({ ...dealFormData, value: Number(e.target.value) })}
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="deal-notes" className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                <FileText className="h-3.5 w-3.5" />
                                Notas e Observações Externas
                            </Label>
                            <Textarea
                                id="deal-notes"
                                placeholder="Registre aqui detalhes sobre a negociação..."
                                value={dealFormData.notes}
                                onChange={(e) => setDealFormData({ ...dealFormData, notes: e.target.value })}
                                className="min-h-[150px] resize-none"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingDeal(null)} disabled={isSavingDeal}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSaveDeal} disabled={isSavingDeal}>
                            {isSavingDeal ? "Salvando..." : "Salvar Alterações"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
