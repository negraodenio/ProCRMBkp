"use client";

import { useState, useEffect } from "react";
import { Plus, Target, Settings, Play, Pause, Edit, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useProfile } from "@/hooks/use-profile";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";


interface Strategy {
    id: string;
    name: string;
    type: string;
    trigger_type: string;
    days_after: number;
    message_template: string;
    is_active: boolean;
    created_at: string;
}

const STRATEGY_TYPES = [
    { value: "pos_venda", label: "Pós-Venda", icon: "🎯", color: "text-green-600" },
    { value: "reativacao", label: "Reativação", icon: "🔄", color: "text-blue-600" },
];

const TRIGGERS = [
    { value: "days_after_close", label: "Dias após fechamento" },
    { value: "days_inactive", label: "Dias de inatividade" },
];

export default function StrategiesPage() {
    const [supabase] = useState(() => createClient());
    const { profile, loading: profileLoading } = useProfile();
    const [open, setOpen] = useState(false);
    const [strategies, setStrategies] = useState<Strategy[]>([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        type: "pos_venda",
        name: "",
        trigger: "days_after_close",
        days: "7",
        message: "",
        isActive: true,
    });


    useEffect(() => {
        if (!profileLoading && profile?.organization_id) {
            loadStrategies();
        }
    }, [supabase, profileLoading, profile?.organization_id]);


    async function loadStrategies() {
        if (!profile?.organization_id) return;
        setLoading(true);
        const { data, error } = await supabase
            .from("marketing_strategies")
            .select("*")
            .eq("organization_id", profile.organization_id)
            .order("created_at", { ascending: false });


        if (error) {
            console.error("Error loading strategies:", error);
            toast.error("Erro ao carregar estratégias");
        } else {
            setStrategies(data || []);
        }
        setLoading(false);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const { data: profile } = await supabase
            .from("profiles")
            .select("organization_id")
            .single();

        if (!profile?.organization_id) {
            toast.error("Organização não encontrada");
            return;
        }

        const { error } = await supabase.from("marketing_strategies").insert({
            organization_id: profile.organization_id,
            name: formData.name,
            type: formData.type,
            trigger_type: formData.trigger,
            days_after: parseInt(formData.days) || 7,
            message_template: formData.message,
            is_active: formData.isActive,
        });

        if (error) {
            console.error("Error creating strategy:", error);
            toast.error("Erro ao criar estratégia");
            return;
        }

        toast.success("Estratégia criada com sucesso!");
        resetForm();
        setOpen(false);
        loadStrategies();
    }

    function resetForm() {
        setFormData({
            type: "pos_venda",
            name: "",
            trigger: "days_after_close",
            days: "7",
            message: "",
            isActive: true,
        });
    }

    async function toggleActive(strategy: Strategy) {
        const { error } = await supabase
            .from("marketing_strategies")
            .update({ is_active: !strategy.is_active })
            .eq("id", strategy.id);

        if (error) {
            toast.error("Erro ao atualizar");
        } else {
            toast.success(strategy.is_active ? "Desativada" : "Ativada");
            loadStrategies();
        }
    }

    async function deleteStrategy(id: string) {
        const { error } = await supabase.from("marketing_strategies").delete().eq("id", id);
        if (error) {
            toast.error("Erro ao excluir");
        } else {
            toast.success("Excluída com sucesso!");
            loadStrategies();
        }
    }

    // Stats
    const stats = {
        active: strategies.filter((s) => s.is_active).length,
        posVenda: strategies.filter((s) => s.type === "pos_venda" && s.is_active).length,
        reativacao: strategies.filter((s) => s.type === "reativacao" && s.is_active).length,
    };

    const getStrategyType = (type: string) => {
        return STRATEGY_TYPES.find((t) => t.value === type) || STRATEGY_TYPES[0];
    };

    const getTriggerLabel = (trigger: string) => {
        return TRIGGERS.find((t) => t.value === trigger)?.label || trigger;
    };

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex flex-1 flex-col md:ml-64">
                <Header />
                <main className="flex-1 p-6">
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h1 className="text-3xl font-bold">Estratégias</h1>
                                <p className="text-muted-foreground">
                                    Automações de pós-venda e reativação
                                </p>
                            </div>
                            <Dialog open={open} onOpenChange={setOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-blue-600 hover:bg-blue-700">
                                        <Plus className="mr-2 h-4 w-4" /> Nova Estratégia
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[500px]">
                                    <DialogHeader>
                                        <DialogTitle>Nova Estratégia</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Tipo de Estratégia</Label>
                                                <Select
                                                    value={formData.type}
                                                    onValueChange={(v) => setFormData({ ...formData, type: v })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {STRATEGY_TYPES.map((type) => (
                                                            <SelectItem key={type.value} value={type.value}>
                                                                <div className="flex items-center gap-2">
                                                                    <span>{type.icon}</span>
                                                                    {type.label}
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Nome *</Label>
                                                <Input
                                                    placeholder="Nome da estratégia"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Gatilho</Label>
                                                <Select
                                                    value={formData.trigger}
                                                    onValueChange={(v) => setFormData({ ...formData, trigger: v })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {TRIGGERS.map((trigger) => (
                                                            <SelectItem key={trigger.value} value={trigger.value}>
                                                                {trigger.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Dias</Label>
                                                <Input
                                                    type="number"
                                                    value={formData.days}
                                                    onChange={(e) => setFormData({ ...formData, days: e.target.value })}
                                                    min="1"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Mensagem *</Label>
                                            <Textarea
                                                placeholder="Use {nome} para personalizar a mensagem..."
                                                value={formData.message}
                                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                rows={4}
                                                required
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Use variáveis: {"{nome}"}, {"{empresa}"}, {"{valor}"}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={formData.isActive}
                                                onCheckedChange={(checked) =>
                                                    setFormData({ ...formData, isActive: checked })
                                                }
                                            />
                                            <Label>Estratégia ativa</Label>
                                        </div>

                                        <DialogFooter>
                                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                                Cancelar
                                            </Button>
                                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                                Criar
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {/* Section Header */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Target className="h-5 w-5 text-blue-500" />
                                            Estratégias de Marketing
                                        </CardTitle>
                                        <CardDescription>
                                            Gerencie suas automações de pós-venda e reativação
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-center">
                                            <p className="text-sm text-muted-foreground">Execução Automática</p>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                <span className="text-sm font-medium text-green-600">
                                                    Verificação de gatilhos ativa...
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-2xl font-bold text-green-600">ON</span>
                                            <p className="text-xs text-muted-foreground">Próxima exec: 1h</p>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>

                        {/* Stats */}
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card>
                                <CardContent className="pt-6 text-center">
                                    <p className="text-sm text-muted-foreground">Estratégias Ativas</p>
                                    <p className="text-3xl font-bold text-blue-600">{stats.active}</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6 text-center">
                                    <p className="text-sm text-muted-foreground">Pós-Venda Ativas</p>
                                    <p className="text-3xl font-bold text-green-600">{stats.posVenda}</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6 text-center">
                                    <p className="text-sm text-muted-foreground">Reativação</p>
                                    <p className="text-3xl font-bold text-orange-600">{stats.reativacao}</p>
                                    <div className="flex items-center justify-center gap-1 text-muted-foreground">
                                        <RefreshCw className="h-4 w-4" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Strategies List */}
                        {loading ? (
                            <div className="text-center py-12 text-muted-foreground">Carregando...</div>
                        ) : strategies.length === 0 ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-16">
                                    <Target className="h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">Nenhuma estratégia configurada</h3>
                                    <p className="text-muted-foreground text-center max-w-md">
                                        Crie estratégias de pós-venda e reativação para automatizar o relacionamento com seus clientes.
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {strategies.map((strategy) => {
                                    const strategyType = getStrategyType(strategy.type);
                                    return (
                                        <Card key={strategy.id} className="relative">
                                            <CardHeader className="pb-2">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <CardTitle className="text-lg flex items-center gap-2">
                                                            <span>{strategyType.icon}</span>
                                                            {strategy.name}
                                                        </CardTitle>
                                                        <CardDescription>
                                                            <Badge variant="outline">{strategyType.label}</Badge>
                                                        </CardDescription>
                                                    </div>
                                                    <Badge
                                                        className={
                                                            strategy.is_active
                                                                ? "bg-success/10 text-success"
                                                                : "bg-muted text-muted-foreground"
                                                        }
                                                    >
                                                        {strategy.is_active ? "ON" : "OFF"}
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-2 mb-4">
                                                    <div className="text-sm text-muted-foreground">
                                                        <span className="font-medium">Gatilho:</span>{" "}
                                                        {getTriggerLabel(strategy.trigger_type)} ({strategy.days_after} dias)
                                                    </div>
                                                    <div className="bg-muted/50 rounded p-2 text-sm line-clamp-2">
                                                        {strategy.message_template || "Sem mensagem"}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => toggleActive(strategy)}
                                                    >
                                                        {strategy.is_active ? (
                                                            <Pause className="h-4 w-4 mr-1" />
                                                        ) : (
                                                            <Play className="h-4 w-4 mr-1" />
                                                        )}
                                                        {strategy.is_active ? "Pausar" : "Ativar"}
                                                    </Button>
                                                    <Button variant="ghost" size="sm">
                                                        <Edit className="h-4 w-4 mr-1" />
                                                        Editar
                                                    </Button>
                                                    <ConfirmDialog
                                                        title="Excluir Estratégia"
                                                        description="Tem certeza que deseja excluir esta estratégia? Esta ação não pode ser desfeita."
                                                        confirmLabel="Excluir"
                                                        onConfirm={() => deleteStrategy(strategy.id)}
                                                        trigger={
                                                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        }
                                                    />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
