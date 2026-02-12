import { GripVertical, Edit2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Deal = {
    id: string;
    title: string;
    value: number;
    contact_name: string;
    notes?: string;
    stage_id: string;
};

interface DealCardProps {
    deal: Deal;
    isDragging: boolean;
    onEdit?: (deal: any) => void;
    onDelete?: (id: string) => void;
    stageColor?: string;
}

export function DealCard({ deal, isDragging, onEdit, onDelete, stageColor }: DealCardProps) {
    return (
        <div
            className={cn(
                "bg-card p-3 rounded-lg shadow-sm border border-border group hover:shadow-md transition-all cursor-grab active:cursor-grabbing relative",
                isDragging && "shadow-lg rotate-2 ring-2 ring-primary ring-opacity-50 z-50"
            )}
        >
            {/* Stage Color Indicator Strip */}
            {stageColor && (
                <div
                    className={cn("absolute top-0 left-0 w-1 h-full rounded-l-lg opacity-70", stageColor.startsWith('bg-') ? stageColor : "")}
                    style={!stageColor.startsWith('bg-') ? { backgroundColor: stageColor } : {}}
                />
            )}

            <div className="flex items-start justify-between gap-2 pl-2">
                <span className="text-sm font-medium text-foreground line-clamp-2 pr-12">
                    {deal.title}
                </span>

                <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit?.(deal);
                        }}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-muted pointer-events-auto cursor-pointer"
                        title="Editar"
                    >
                        <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete?.(deal.id);
                        }}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 pointer-events-auto cursor-pointer"
                        title="Excluir"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            <div className="mt-3 pl-2">
                <p className="text-xs text-muted-foreground mb-1">{deal.contact_name}</p>
                <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(deal.value)}
                    </span>
                    {deal.notes && (
                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" title="Tem notas" />
                    )}
                </div>
            </div>
        </div>
    );
}
