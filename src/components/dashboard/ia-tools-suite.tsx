"use client";

import { 
    Zap, 
    MessageSquare, 
    TrendingUp, 
    Search, 
    FileText, 
    Target, 
    BarChart3, 
    Bot, 
    Sparkles, 
    ShieldAlert, 
    Brain,
    Rocket,
    LineChart
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const IA_TOOLS = [
    { name: "Análise de Sentimento", icon: MessageSquare, color: "text-blue-600" },
    { name: "SPIN Selling Optimizer", icon: TrendingUp, color: "text-emerald-600" },
    { name: "Predição de Fechamento", icon: LineChart, color: "text-purple-600" },
    { name: "TRL Analyzer", icon: Target, color: "text-orange-600" },
    { name: "One-Pager Builder", icon: FileText, color: "text-indigo-600" },
    { name: "DOI Ingest Engine", icon: Zap, color: "text-yellow-600" },
    { name: "Market Teaser Gen", icon: Sparkles, color: "text-pink-600" },
    { name: "Competitive Intel", icon: BarChart3, color: "text-cyan-600" },
    { name: "Triage Robot", icon: Bot, color: "text-slate-600" },
    { name: "Go-To-Market Planner", icon: Rocket, color: "text-red-600" },
    { name: "Patent Chunking", icon: Search, color: "text-violet-600" },
    { name: "Risk Assessment", icon: ShieldAlert, color: "text-rose-600" },
    { name: "Semantic Match", icon: Brain, color: "text-amber-600" }
];

export function IAToolsSuite() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Suite IA Tools (13)</h3>
                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">PROPOSTA 56467</span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {IA_TOOLS.map((tool) => (
                    <Card key={tool.name} className="group hover:border-indigo-300 transition-all cursor-pointer shadow-sm">
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-3">
                            <div className={`p-3 rounded-xl bg-slate-50 group-hover:bg-indigo-50 transition-colors ${tool.color}`}>
                                <tool.icon className="h-5 w-5" />
                            </div>
                            <span className="text-xs font-bold text-slate-700 leading-tight">
                                {tool.name}
                            </span>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
