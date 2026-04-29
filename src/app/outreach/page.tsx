"use client";

import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    Mail, Send, BarChart3, Users, MousePointer2, Eye, Plus, MoreVertical,
    CheckCircle2, Loader2, Zap
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";
import { getOutreachCampaigns, createOutreachCampaign, activateCampaign } from "@/app/actions/outreach-actions";
import { toast } from "sonner";
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

export default function OutreachPage() {
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState("");
    const [newTech, setNewTech] = useState("");
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        loadCampaigns();
    }, []);

    async function loadCampaigns() {
        setLoading(true);
        const res = await getOutreachCampaigns();
        if (res.success) {
            setCampaigns(res.campaigns || []);
            setStats(res.stats || {});
        }
        setLoading(false);
    }

    async function handleCreate() {
        if (!newName) return;
        setCreating(true);
        const res = await createOutreachCampaign({ name: newName, targetTechnology: newTech });
        if (res.success) {
            toast.success("Campanha criada com sucesso!");
            setShowCreate(false);
            setNewName("");
            setNewTech("");
            loadCampaigns();
        } else {
            toast.error(res.error || "Erro ao criar campanha");
        }
        setCreating(false);
    }

    async function handleActivate(id: string) {
        const res = await activateCampaign(id);
        if (res.success) {
            toast.success("Campanha ativada!");
            loadCampaigns();
        } else {
            toast.error("Erro ao ativar");
        }
    }

    const getStatusStyle = (status: string) => {
        switch(status) {
            case 'active': return 'bg-indigo-100 text-indigo-700';
            case 'completed': return 'bg-emerald-100 text-emerald-700';
            case 'paused': return 'bg-amber-100 text-amber-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getStatusLabel = (status: string) => {
        switch(status) {
            case 'active': return 'Ativa';
            case 'completed': return 'Concluída';
            case 'paused': return 'Pausada';
            default: return 'Rascunho';
        }
    };

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
                        <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2 h-12 px-6" onClick={() => setShowCreate(true)}>
                            <Plus className="h-4 w-4" />
                            Nova Campanha
                        </Button>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                            <Send className="h-4 w-4" />
                                            <span className="text-sm font-medium">Total Enviados</span>
                                        </div>
                                        <div className="text-2xl font-bold">
                                            {campaigns.reduce((a, c) => a + (c.total_sent || 0), 0)}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                            <Eye className="h-4 w-4" />
                                            <span className="text-sm font-medium">Taxa de Abertura</span>
                                        </div>
                                        <div className="text-2xl font-bold text-indigo-600">{stats.openRate || 0}%</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                            <MousePointer2 className="h-4 w-4" />
                                            <span className="text-sm font-medium">CTR (Cliques)</span>
                                        </div>
                                        <div className="text-2xl font-bold text-emerald-600">{stats.clickRate || 0}%</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                            <Users className="h-4 w-4" />
                                            <span className="text-sm font-medium">Respostas</span>
                                        </div>
                                        <div className="text-2xl font-bold text-orange-600">{stats.replyRate || 0}%</div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-xl font-bold">Campanhas ({campaigns.length})</h2>
                                <div className="grid grid-cols-1 gap-4">
                                    {campaigns.map((camp) => {
                                        const progress = camp.total_sent > 0 
                                            ? Math.round((camp.total_replied / camp.total_sent) * 100) 
                                            : 0;
                                        return (
                                            <Card key={camp.id} className="hover:border-indigo-200 transition-all">
                                                <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                    <div className="space-y-2 flex-1">
                                                        <div className="flex items-center gap-3">
                                                            <h3 className="font-bold text-lg">{camp.name}</h3>
                                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(camp.status)}`}>
                                                                {getStatusLabel(camp.status)}
                                                            </span>
                                                            {camp.target_technology && (
                                                                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 uppercase">
                                                                    {camp.target_technology}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                                            <span className="flex items-center gap-1"><Send className="h-3 w-3" /> {camp.total_sent} envios</span>
                                                            <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {camp.total_opened} aberturas</span>
                                                            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {camp.total_replied} respostas</span>
                                                        </div>
                                                        <div className="w-full max-w-xs space-y-1">
                                                            <div className="flex justify-between text-[10px] text-muted-foreground">
                                                                <span>Conversão</span>
                                                                <span>{progress}%</span>
                                                            </div>
                                                            <Progress value={progress} className="h-1.5" />
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {camp.status === 'draft' && (
                                                            <Button size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-700" onClick={() => handleActivate(camp.id)}>
                                                                <Zap className="h-3 w-3" />
                                                                Ativar
                                                            </Button>
                                                        )}
                                                        <Button variant="outline" size="sm" className="gap-2">
                                                            <BarChart3 className="h-4 w-4" />
                                                            Relatório
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
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
                                </CardContent>
                            </Card>
                        </>
                    )}
                </main>
            </div>

            {/* Create Campaign Dialog */}
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Mail className="h-5 w-5 text-indigo-600" />
                            Nova Campanha de Outreach
                        </DialogTitle>
                        <DialogDescription>
                            Crie uma campanha para prospectar decisores corporativos.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nome da Campanha</label>
                            <Input 
                                placeholder="Ex: Prospecção Patente Grafeno V3" 
                                value={newName} 
                                onChange={(e) => setNewName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tecnologia Alvo</label>
                            <Input 
                                placeholder="Ex: Biotecnologia, IoT, Materiais..." 
                                value={newTech} 
                                onChange={(e) => setNewTech(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancelar</Button>
                        <Button 
                            onClick={handleCreate} 
                            disabled={creating || !newName} 
                            className="bg-indigo-600 hover:bg-indigo-700 gap-2"
                        >
                            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                            Criar Campanha
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
