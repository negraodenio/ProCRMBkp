"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DealCard } from "./deal-card";
import { updateDealStage } from "@/app/pipeline/actions";
import { toast } from "sonner";

// Types matching Supabase
type Deal = {
    id: string;
    title: string;
    value: number;
    contact_id?: string;
    contact_name?: string;
    stage_id: string;
};

type Stage = {
    id: string;
    name: string;
    color?: string;
    order?: number;
};

// Color mapping for stages matching Replit screenshot
const STAGE_COLORS: Record<string, { bg: string; header: string }> = {
    "Prospecção": { bg: "bg-blue-500", header: "bg-blue-500" },
    "Qualificação": { bg: "bg-orange-500", header: "bg-orange-500" },
    "Proposta": { bg: "bg-green-500", header: "bg-green-500" },
    "Negociação": { bg: "bg-blue-800", header: "bg-blue-800" },
    "Fechado": { bg: "bg-green-700", header: "bg-green-700" },
    "Perdido": { bg: "bg-red-500", header: "bg-red-500" },
};

interface KanbanBoardProps {
    initialStages: Stage[];
    initialDeals: any[];
}

export function KanbanBoard({ initialStages, initialDeals }: KanbanBoardProps) {
    const [deals, setDeals] = useState<any[]>(initialDeals);
    const [stages] = useState<Stage[]>(initialStages);

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

    const getStageColor = (stageName: string) => {
        return STAGE_COLORS[stageName] || { bg: "bg-slate-500", header: "bg-slate-500" };
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex h-full gap-4 pb-4 overflow-x-auto">
                {stages.map((stage) => {
                    const stageDeals = deals.filter((deal) => deal.stage_id === stage.id);
                    const totalValue = stageDeals.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);
                    const colors = getStageColor(stage.name);

                    return (
                        <div key={stage.id} className="flex flex-col w-72 min-w-[288px] bg-slate-50 rounded-xl overflow-hidden shadow-sm border">
                            {/* Colored Header matching Replit */}
                            <div className={`${colors.header} text-white p-3`}>
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-sm uppercase tracking-wider">
                                        {stage.name}
                                    </h3>
                                    <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                                        {stageDeals.length}
                                    </span>
                                </div>
                            </div>

                            {/* Droppable Area */}
                            <Droppable droppableId={stage.id}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={`flex-1 p-3 space-y-3 min-h-[200px] transition-colors ${snapshot.isDraggingOver ? "bg-slate-100" : ""
                                            }`}
                                    >
                                        {stageDeals.length === 0 ? (
                                            <div className="text-center py-8 text-slate-400 text-sm">
                                                Nenhum lead nesta etapa
                                            </div>
                                        ) : (
                                            stageDeals.map((deal, index) => (
                                                <Draggable key={deal.id} draggableId={deal.id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            style={{ ...provided.draggableProps.style }}
                                                        >
                                                            <DealCard
                                                                deal={{
                                                                    ...deal,
                                                                    contact_name: deal.contact_name || deal.title || 'Lead'
                                                                }}
                                                                isDragging={snapshot.isDragging}
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
            </div>
        </DragDropContext>
    );
}
