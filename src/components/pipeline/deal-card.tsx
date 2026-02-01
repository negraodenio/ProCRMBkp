import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

type Deal = {
    id: string;
    title: string;
    value: number;
    contact_name: string;
};

interface DealCardProps {
    deal: Deal;
    isDragging: boolean;
}

export function DealCard({ deal, isDragging }: DealCardProps) {
    return (
        <div
            className={cn(
                "bg-white p-3 rounded-lg shadow-sm border border-slate-200 group hover:shadow-md transition-all cursor-grab active:cursor-grabbing",
                isDragging && "shadow-lg rotate-2 ring-2 ring-primary ring-opacity-50 z-50"
            )}
        >
            <div className="flex items-start justify-between">
                <span className="text-sm font-medium text-slate-900 line-clamp-2">
                    {deal.title}
                </span>
                {/* Grip Icon (Invisible unless hovering to reduce clutter) */}
                {/* <GripVertical className="h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" /> */}
            </div>

            <div className="mt-3">
                <p className="text-xs text-slate-500 mb-1">{deal.contact_name}</p>
                <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(deal.value)}
                    </span>
                </div>
            </div>
        </div>
    );
}
