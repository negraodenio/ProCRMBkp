"use client";

import Link from "next/link";
import { Sparkles, Briefcase, TrendingUp, FileText, Tag, ArrowRight } from "lucide-react";

// As 5 ferramentas oficiais — clicáveis, redirecionam para /ai-tools
const TOOLS = [
    {
        id: "science-teaser",
        name: "Science Teaser",
        subtitle: "Resumo executivo da tecnologia",
        icon: Sparkles,
        color: "text-violet-600",
        bg: "bg-violet-50",
    },
    {
        id: "patent-to-pitch",
        name: "Pitch de Patente",
        subtitle: "Comercialização de IP",
        icon: Briefcase,
        color: "text-orange-600",
        bg: "bg-orange-50",
    },
    {
        id: "market-applications",
        name: "Novos Mercados",
        subtitle: "Análise de verticais",
        icon: TrendingUp,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
    },
    {
        id: "generate-proposal",
        name: "Business Case",
        subtitle: "Viabilidade estratégica",
        icon: FileText,
        color: "text-blue-600",
        bg: "bg-blue-50",
    },
    {
        id: "categorize-lead",
        name: "Scoring de Lead",
        subtitle: "Qualificação automática",
        icon: Tag,
        color: "text-rose-600",
        bg: "bg-rose-50",
    },
];

export function IAToolsSuite() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-slate-900">Neural Engine — IA Tools</h3>
                    <p className="text-xs text-slate-500">5 ferramentas especializadas em transferência de tecnologia</p>
                </div>
                <Link
                    href="/ai-tools"
                    className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                    Ver todas <ArrowRight className="h-3 w-3" />
                </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {TOOLS.map((tool) => {
                    const Icon = tool.icon;
                    return (
                        <Link
                            key={tool.id}
                            href="/ai-tools"
                            className="group flex flex-col items-center text-center gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all duration-200"
                        >
                            <div className={`p-3 rounded-xl ${tool.bg} group-hover:scale-110 transition-transform duration-200`}>
                                <Icon className={`h-5 w-5 ${tool.color}`} />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-xs font-bold text-slate-800 leading-tight">{tool.name}</p>
                                <p className="text-[10px] text-slate-400 leading-tight">{tool.subtitle}</p>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
