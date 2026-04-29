"use client";

import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { 
    Activity, 
    Target, 
    Users, 
    FileText, 
    TrendingUp, 
    PieChart, 
    ArrowUpRight,
    Zap,
    Download,
    ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { IAToolsSuite } from "@/components/dashboard/ia-tools-suite";
import { useEffect, useState } from "react";
import { getDashboardMetrics } from "@/app/actions/dashboard-actions";
import { Landmark, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function MissionControlPage() {
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");
    const [seeding, setSeeding] = useState(false);
    const router = useRouter();

    useEffect(() => {
        async function load() {
            const data = await getDashboardMetrics();
            setMetrics(data);
            setLoading(false);
        }
        load();
    }, []);

    const handleExport = () => {
        window.print();
    };

    return (
        <div className="flex min-h-screen bg-slate-50/50">
            <style jsx global>{`
                @media print {
                    .no-print, .sidebar, header { display: none !important; }
                    .md\\:ml-64 { margin-left: 0 !important; }
                    main { padding: 0 !important; }
                    .card { border: 1px solid #e2e8f0 !important; box-shadow: none !important; }
                    body { background: white !important; }
                }
            `}</style>
            <Sidebar />
            <div className="flex flex-1 flex-col md:ml-64">
                <Header />
                <main className="flex-1 p-8">
                    <div className="max-w-7xl mx-auto space-y-8">
                        
                        {/* Title Section */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Mission Control</h1>
                                <p className="text-slate-500">Panorama de Inovação e Comercialização de Ativos.</p>
                            </div>
                            <div className="flex items-center gap-2 no-print">
                                <Button variant="outline" size="sm" className="gap-2 border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100" onClick={handleExport}>
                                    <ShieldCheck className="h-4 w-4" />
                                    Relatório Processo 56467
                                </Button>
                                <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
                                    <Download className="h-4 w-4" />
                                    Exportar Relatório
                                </Button>
                                <Button 
                                    variant="destructive" 
                                    size="sm" 
                                    className="gap-2" 
                                    disabled={seeding}
                                    onClick={async () => {
                                        setSeeding(true);
                                        try {
                                            const res = await fetch('/api/seed');
                                            const data = await res.json();
                                            if(res.ok) {
                                                toast.success('Banco de dados populado com sucesso para o NIT UFV!', {
                                                    description: data.details?.join(', '),
                                                });
                                                // Refresh metrics
                                                const newMetrics = await getDashboardMetrics();
                                                setMetrics(newMetrics);
                                            } else {
                                                toast.error('Falha no seed: ' + (data.error || 'Erro desconhecido'));
                                            }
                                        } catch (e) {
                                            toast.error('Erro de conexão com o servidor.');
                                        }
                                        setSeeding(false);
                                    }}
                                >
                                    {seeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                                    {seeding ? 'Populando...' : 'Inicializar Dados Demo'}
                                </Button>
                                <Badge variant="outline" className="border-slate-300 text-slate-500 gap-1">
                                    <ShieldCheck className="h-3 w-3" />
                                    ISO 27001 / SOC 2 In Progress
                                </Badge>
                                <Badge className="bg-orange-600">FirstIgnite Mode Active</Badge>
                                <span className="text-xs text-slate-400">Sync: Realtime</span>
                            </div>
                        </div>

                        {/* Top Stats */}
                        <div className="grid gap-4 md:grid-cols-5">
                            <StatCard title="Ativos de Pesquisa" value={loading ? "..." : metrics?.assets} icon={FileText} trend="+5 este mês" />
                            <StatCard title="Matches IA" value={loading ? "..." : metrics?.matches} icon={Target} trend="Busca vetorial" />
                            <StatCard title="Pesquisadores" value={loading ? "..." : metrics?.researchers} icon={Landmark} trend="Lattes Sync" />
                            <StatCard title="Decisores Mapeados" value={loading ? "..." : metrics?.contacts} icon={Users} trend="People Search" />
                            <StatCard title="Campanhas" value={loading ? "..." : metrics?.campaigns} icon={TrendingUp} trend="Outreach" />
                        </div>

                        {/* Middle Section */}
                        {/* Tabs System - NEW COMPLIANCE ITEM */}
                        <div className="flex items-center gap-6 border-b border-slate-200 no-print">
                            {["overview", "authors", "works", "grants", "campaigns"].map((tab) => {
                                const labels: Record<string, string> = { overview: "Overview", authors: "Top Authors", works: "Top Works", grants: "Top Grants", campaigns: "Recommended Campaigns" };
                                return (
                                    <button 
                                        key={tab}
                                        className={`pb-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                                            activeTab === tab 
                                                ? 'border-indigo-600 text-indigo-600 font-bold' 
                                                : 'border-transparent text-slate-500 hover:text-slate-700'
                                        }`}
                                        onClick={() => setActiveTab(tab)}
                                    >
                                        {labels[tab]}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {/* Research Landscape */}
                            <Card className="col-span-1 lg:col-span-2">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>Interesse Corporativo por Setor</CardTitle>
                                        <p className="text-xs text-slate-500">Setores mais ativos em busca de tecnologia.</p>
                                    </div>
                                    <PieChart className="h-4 w-4 text-slate-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <SectorProgress name="Biotecnologia" value={85} color="bg-blue-500" />
                                        <SectorProgress name="Energias Renováveis" value={62} color="bg-orange-500" />
                                        <SectorProgress name="IA & Robótica" value={94} color="bg-purple-500" />
                                        <SectorProgress name="Materiais Compostos" value={45} color="bg-emerald-500" />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Recent Autopilot Runs */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                                        <Zap className="h-4 w-4 text-orange-500" />
                                        Últimos Autopilots
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <AutopilotItem title="Patente Grafeno V2" status="Completed" count={12} />
                                    <AutopilotItem title="Artigo Bio-Polímero" status="Completed" count={8} />
                                    <AutopilotItem title="Nova Sensor IoT" status="In Progress" count={3} />
                                </CardContent>
                            </Card>
                        </div>

                        {/* IA Tools Suite - NEW COMPLIANCE ITEM */}
                        <div id="ia-tools">
                            <IAToolsSuite />
                        </div>

                        {/* Bottom: Conversion Funnel */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Funil de Transferência de Tecnologia</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col md:flex-row items-center justify-between gap-8 py-4">
                                    <FunnelStep label="Pesquisas" value="100%" count="42" color="bg-slate-200" />
                                    <ArrowUpRight className="h-4 w-4 text-slate-300 hidden md:block rotate-90" />
                                    <FunnelStep label="Matches" value="82%" count="34" color="bg-orange-200" />
                                    <ArrowUpRight className="h-4 w-4 text-slate-300 hidden md:block rotate-90" />
                                    <FunnelStep label="Contatos" value="65%" count="27" color="bg-orange-400" />
                                    <ArrowUpRight className="h-4 w-4 text-slate-300 hidden md:block rotate-90" />
                                    <FunnelStep label="Reuniões" value="12%" count="5" color="bg-emerald-500" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, trend }: any) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <div className="p-2 bg-slate-100 rounded-lg">
                        <Icon className="h-4 w-4 text-slate-600" />
                    </div>
                </div>
                <h3 className="text-2xl font-bold">{value}</h3>
                <p className="text-[10px] font-bold text-emerald-600 uppercase mt-1">{trend}</p>
            </CardContent>
        </Card>
    );
}

function SectorProgress({ name, value, color }: any) {
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-medium">
                <span>{name}</span>
                <span>{value}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full`} style={{ width: `${value}%` }} />
            </div>
        </div>
    );
}

function AutopilotItem({ title, status, count }: any) {
    return (
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div>
                <p className="text-sm font-bold text-slate-900">{title}</p>
                <p className="text-[10px] text-slate-500 uppercase">{status} • {count} empresas</p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-slate-300" />
        </div>
    );
}

function FunnelStep({ label, value, count, color }: any) {
    return (
        <div className="flex flex-col items-center gap-2">
            <div className={`w-16 h-16 rounded-full ${color} flex items-center justify-center text-xs font-bold shadow-inner`}>
                {value}
            </div>
            <p className="text-xs font-bold text-slate-900">{label}</p>
            <p className="text-[10px] text-slate-500">{count} unidades</p>
        </div>
    );
}
