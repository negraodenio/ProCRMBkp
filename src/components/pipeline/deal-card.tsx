import { GripVertical, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Deal = {
    id: string;
    title: string;
    value: number;
    contact_name: string;
    notes?: string;
};

interface DealCardProps {
    deal: Deal;
    isDragging: boolean;
    onEdit?: (deal: any) => void;
}

export function DealCard({ deal, isDragging, onEdit }: DealCardProps) {
    return (
        <div
            className={cn(
                "bg-white p-3 rounded-lg shadow-sm border border-slate-200 group hover:shadow-md transition-all cursor-grab active:cursor-grabbing relative",
                isDragging && "shadow-lg rotate-2 ring-2 ring-primary ring-opacity-50 z-50"
            )}
        >
            <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-medium text-slate-900 line-clamp-2 pr-6">
                    {deal.title}
                </span>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit?.(deal);
                    }}
                    className="absolute right-2 top-2 p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 opacity-0 group-hover:opacity-100 transition-all pointer-events-auto cursor-pointer"
                >
                    <Edit2 className="h-3.5 w-3.5" />
                </button>
            </div>

            <div className="mt-3">
                <p className="text-xs text-slate-500 mb-1">{deal.contact_name}</p>
                <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700">
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
