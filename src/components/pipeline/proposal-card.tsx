"use client";

import { Edit2, Trash2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

// Define the Proposal type
type Proposal = {
    id: string;
    title: string;
    total: number;
    contact_id?: string;
    notes?: string;
    stage_id: string;
    status: string;
    contacts?: {
        name: string;
        companies?: { name: string } | null;
    } | null;
    deals?: {
        id: string;
        title: string;
    } | null;
};

interface ProposalCardProps {
    proposal: Proposal;
    isDragging: boolean;
    onEdit?: (proposal: any) => void;
    onDelete?: (id: string) => void;
    stageColor?: string;
}

export function ProposalCard({ proposal, isDragging, onEdit, onDelete, stageColor }: ProposalCardProps) {
    const router = useRouter();

    const handleCardClick = () => {
        router.push(`/proposals/${proposal.id}`);
    };

    const getProposalStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'accepted':
            case 'aceita':
                return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'rejected':
            case 'recusada':
                return 'bg-red-100 text-red-700 border-red-200';
            case 'sent':
            case 'enviada':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'viewed':
            case 'visualizada':
                return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    const getProposalStatusLabel = (status: string) => {
        switch (status.toLowerCase()) {
            case 'draft': return 'Rascunho';
            case 'sent': return 'Enviada';
            case 'viewed': return 'Visualizada';
            case 'accepted': return 'Aceita';
            case 'rejected': return 'Recusada';
            case 'expired': return 'Expirada';
            default: return status;
        }
    };

    return (
        <div
            onClick={handleCardClick}
            className={cn(
                "bg-card p-3 rounded-lg shadow-sm border border-border group hover:shadow-md transition-all cursor-pointer relative",
                isDragging && "shadow-lg rotate-2 ring-2 ring-primary ring-opacity-50 z-50 pointer-events-none"
            )}
        >
            {/* Stage Color Indicator Strip */}
            {stageColor && (
                <div
                    className={cn("absolute top-0 left-0 w-1.5 h-full rounded-l-lg opacity-80", stageColor.startsWith('bg-') ? stageColor : "")}
                    style={!stageColor.startsWith('bg-') ? { backgroundColor: stageColor } : {}}
                />
            )}

            <div className="flex items-start justify-between gap-2 pl-2">
                <span className="text-sm font-bold text-slate-800 line-clamp-2 pr-10">
                    {proposal.title}
                </span>

                <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all z-20">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit?.(proposal);
                        }}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-muted cursor-pointer bg-white/90 backdrop-blur-sm shadow-sm border"
                        title="Editar"
                    >
                        <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete?.(proposal.id);
                        }}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-50 bg-white/90 backdrop-blur-sm shadow-sm border"
                        title="Excluir"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            <div className="mt-3 pl-2 space-y-3">
                <div className="flex flex-col gap-1.5">
                    {proposal.contacts?.companies?.name && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50/50 px-2 py-0.5 rounded w-fit border border-indigo-100">
                           🏢 {proposal.contacts.companies.name}
                        </div>
                    )}
                    <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                        👤 {proposal.contacts?.name || 'Sem contato'}
                    </p>
                    {proposal.deals?.title && (
                        <p className="text-[10px] text-slate-400 font-medium truncate">
                           📁 Negócio: {proposal.deals.title}
                        </p>
                    )}
                </div>

                <div className="flex items-center justify-between gap-2">
                    <div className={cn("text-[9px] px-1.5 rounded-full font-black border uppercase shrink-0", getProposalStatusColor(proposal.status))}>
                        {getProposalStatusLabel(proposal.status)}
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-sm font-black text-slate-900">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(proposal.total)}
                    </span>
                    {proposal.notes && (
                        <div className="h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.4)]" title="Tem notas" />
                    )}
                </div>
            </div>
        </div>
    );
}
