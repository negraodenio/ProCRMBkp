"use client";

import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
    Mail, 
    Send, 
    BarChart3, 
    Users, 
    MousePointer2, 
    Eye, 
    Plus, 
    MoreVertical,
    CheckCircle2,
    Clock
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

const CAMPAIGNS = [
    {
        name: "Prospecção: Patente Grafeno V2",
        status: "Ativa",
        sent: 128,
        opened: 84,
        clicked: 32,
        replied: 12,
        progress: 65
    },
    {
        name: "Outreach: Bio-Polímeros (Natura)",
        status: "Concluída",
        sent: 45,
        opened: 40,
        clicked: 18,
        replied: 6,
        progress: 100
    },
    {
        name: "Follow-up: Editais Finep",
        status: "Agendada",
        sent: 0,
        opened: 0,
        clicked: 0,
        replied: 0,
        progress: 0
    }
];

export default function OutreachPage() {
    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />
            <div className="flex flex-1 flex-col md:ml-64">
                <Header />
                <main className="p-8 max-w-6xl mx-auto w-full space-y-8">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tight">Email Outreach</h1>
                            <p className="text-muted-foreground italic">Gestão de campanhas automatizadas e cadências de prospecção com IA.</p>
                        </div>
                        <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2 h-12 px-6">
                            <Plus className="h-4 w-4" />
                            Nova Campanha
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                    <Send className="h-4 w-4" />
                                    <span className="text-sm font-medium">Total Enviados</span>
                                </div>
                                <div className="text-2xl font-bold">1.248</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                    <Eye className="h-4 w-4" />
                                    <span className="text-sm font-medium">Taxa de Abertura</span>
                                </div>
                                <div className="text-2xl font-bold text-indigo-600">62.4%</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                    <MousePointer2 className="h-4 w-4" />
                                    <span className="text-sm font-medium">CTR (Cliques)</span>
                                </div>
                                <div className="text-2xl font-bold text-emerald-600">24.8%</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                    <Users className="h-4 w-4" />
                                    <span className="text-sm font-medium">Respostas</span>
                                </div>
                                <div className="text-2xl font-bold text-orange-600">8.2%</div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-xl font-bold">Campanhas Recentes</h2>
                        <div className="grid grid-cols-1 gap-4">
                            {CAMPAIGNS.map((camp, idx) => (
                                <Card key={idx} className="hover:border-indigo-200 transition-all">
                                    <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="space-y-2 flex-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-bold text-lg">{camp.name}</h3>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                    camp.status === 'Ativa' ? 'bg-indigo-100 text-indigo-700' : 
                                                    camp.status === 'Concluída' ? 'bg-emerald-100 text-emerald-700' : 
                                                    'bg-slate-100 text-slate-700'
                                                }`}>
                                                    {camp.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1"><Send className="h-3 w-3" /> {camp.sent} envios</span>
                                                <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {camp.opened} aberturas</span>
                                                <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {camp.replied} respostas</span>
                                            </div>
                                            <div className="w-full max-w-xs space-y-1">
                                                <div className="flex justify-between text-[10px] text-muted-foreground">
                                                    <span>Progresso</span>
                                                    <span>{camp.progress}%</span>
                                                </div>
                                                <Progress value={camp.progress} className="h-1.5" />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="sm" className="gap-2">
                                                <BarChart3 className="h-4 w-4" />
                                                Relatório
                                            </Button>
                                            <Button variant="ghost" size="icon">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    <Card className="bg-indigo-50 border-indigo-200">
                        <CardContent className="p-8 flex items-center justify-between">
                            <div className="space-y-1">
                                <h3 className="font-bold text-indigo-900 text-lg flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                                    IA Outreach Optimizer Ativo
                                </h3>
                                <p className="text-indigo-700 text-sm opacity-80">
                                    Seus e-mails estão sendo otimizados automaticamente para evitar filtros de spam e maximizar aberturas.
                                </p>
                            </div>
                            <Button variant="outline" className="border-indigo-300 text-indigo-700 bg-white hover:bg-indigo-50">
                                Ver Configurações de IA
                            </Button>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
}
