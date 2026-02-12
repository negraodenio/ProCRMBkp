"use client";

import { useState, useEffect } from "react";
import { Plus, MessageSquare, Edit, Trash2, Power } from "lucide-react";
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
    DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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

interface Automation {
    id: string;
    name: string;
    trigger_type: string;
    trigger_entity: string;
    from_status: string | null;
    to_status: string;
    action_type: string;
    message_template: string;
    is_active: boolean;
    created_at: string;
}

const PIPELINE_STAGES = [
    "Primeiro Contato",
    "Prospecção",
    "Qualificação",
    "Proposta",
    "Negociação",
    "Fechado",
    "Perdido",
];

const ANY_STATUS_VALUE = "ANY_STATUS";

export default function AutomationsPage() {
    const [supabase] = useState(() => createClient());
    const { profile, loading: profileLoading } = useProfile();
    const [open, setOpen] = useState(false);
    const [automations, setAutomations] = useState<Automation[]>([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        fromStatus: ANY_STATUS_VALUE,
        toStatus: "",
        message: "",
        isActive: true,
    });


    useEffect(() => {
        if (!profileLoading && profile?.organization_id) {
            loadAutomations();
        }
    }, [supabase, profileLoading, profile?.organization_id]);


    async function loadAutomations() {
        if (!profile?.organization_id) return;
        setLoading(true);
        const { data, error } = await supabase
            .from("automation_rules")
            .select("*")
            .eq("organization_id", profile.organization_id)
            .order("created_at", { ascending: false });


        if (error) {
            console.error("Error loading automations:", error);
            toast.error("Erro ao carregar automações");
        } else {
            setAutomations(data || []);
        }
        setLoading(false);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!formData.toStatus) {
            toast.error("Selecione o novo status");
            return;
        }

        if (!profile?.organization_id) {
            toast.error("Organização não encontrada");
            return;
        }

        const fromStatusValue = formData.fromStatus === ANY_STATUS_VALUE ? null : formData.fromStatus;
        const name = fromStatusValue
            ? `${fromStatusValue} → ${formData.toStatus}`
            : `Novo em ${formData.toStatus}`;

        const { error } = await supabase.from("automation_rules").insert({
            organization_id: profile.organization_id,
            name,
            trigger_type: "status_change",
            trigger_entity: "lead",
            from_status: fromStatusValue,
            to_status: formData.toStatus,
            action_type: "send_whatsapp",
            message_template: formData.message,
            is_active: formData.isActive,
        });

        if (error) {
            console.error("Error creating automation:", error);
            toast.error("Erro ao criar automação");
            return;
        }

        toast.success("Mensagem automática criada!");
        resetForm();
        setOpen(false);
        loadAutomations();
    }

    function resetForm() {
        setFormData({
            fromStatus: ANY_STATUS_VALUE,
            toStatus: "",
            message: "",
            isActive: true,
        });
    }

    async function toggleActive(automation: Automation) {
        const { error } = await supabase
            .from("automation_rules")
            .update({ is_active: !automation.is_active })
            .eq("id", automation.id);

        if (error) {
            toast.error("Erro ao atualizar");
        } else {
            toast.success(automation.is_active ? "Desativada" : "Ativada");
            loadAutomations();
        }
    }

    async function deleteAutomation(id: string) {
        if (!confirm("Tem certeza que deseja excluir esta automação?")) return;

        const { error } = await supabase.from("automation_rules").delete().eq("id", id);
        if (error) {
            toast.error("Erro ao excluir");
        } else {
            toast.success("Excluída com sucesso!");
            loadAutomations();
        }
    }

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />
            <div className="flex flex-1 flex-col md:ml-64">
                <Header />
                <main className="flex-1 p-6">
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h1 className="text-3xl font-bold">Mensagens Automáticas</h1>
                                <p className="text-muted-foreground">
                                    Configure mensagens WhatsApp que são enviadas automaticamente quando o status de um lead muda
                                </p>
                            </div>
                            <Dialog open={open} onOpenChange={setOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-blue-600 hover:bg-blue-700">
                                        <Plus className="mr-2 h-4 w-4" /> Nova Mensagem
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[600px]">
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2">
                                            <MessageSquare className="h-5 w-5" />
                                            Nova Mensagem Automática
                                        </DialogTitle>
                                        <DialogDescription>
                                            Configure as regras de envio das suas mensagens
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Status Anterior</Label>
                                                <Select
                                                    value={formData.fromStatus}
                                                    onValueChange={(v) => setFormData({ ...formData, fromStatus: v })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione o status anterior" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value={ANY_STATUS_VALUE}>Qualquer status</SelectItem>
                                                        {PIPELINE_STAGES.map((stage) => (
                                                            <SelectItem key={stage} value={stage}>
                                                                {stage}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Novo Status *</Label>
                                                <Select
                                                    value={formData.toStatus}
                                                    onValueChange={(v) => setFormData({ ...formData, toStatus: v })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione o novo status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {PIPELINE_STAGES.map((stage) => (
                                                            <SelectItem key={stage} value={stage}>
                                                                {stage}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Mensagem</Label>
                                            <Textarea
                                                placeholder="Digite a mensagem que será enviada automaticamente..."
                                                value={formData.message}
                                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                rows={4}
                                            />
                                            <div className="text-sm text-muted-foreground space-y-1">
                                                <p>Variáveis disponíveis:</p>
                                                <p className="font-mono text-xs">{"{nome}"} - Nome do lead</p>
                                                <p className="font-mono text-xs">{"{empresa}"} - Empresa do lead</p>
                                                <p className="text-xs text-blue-600">
                                                    Use as variáveis: {"{nome}"}, {"{empresa}"}, {"{status_anterior}"}, {"{status_novo}"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={formData.isActive}
                                                onCheckedChange={(checked) =>
                                                    setFormData({ ...formData, isActive: checked })
                                                }
                                            />
                                            <Label>Ativo</Label>
                                        </div>

                                        <DialogFooter>
                                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                                <span className="mr-1">×</span> Cancelar
                                            </Button>
                                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                                <MessageSquare className="mr-2 h-4 w-4" /> Criar
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {/* Automations List */}
                        {loading ? (
                            <div className="text-center py-12 text-muted-foreground">Carregando...</div>
                        ) : automations.length === 0 ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-16">
                                    <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">Nenhuma mensagem automática configurada</h3>
                                    <p className="text-muted-foreground text-center max-w-md">
                                        Configure mensagens que são enviadas automaticamente quando o status de um lead muda no pipeline.
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {automations.map((automation) => (
                                    <Card key={automation.id} className="relative">
                                        <CardHeader className="pb-2">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <CardTitle className="text-lg">{automation.name}</CardTitle>
                                                    <CardDescription className="mt-1">
                                                        {automation.from_status ? (
                                                            <>
                                                                <Badge variant="outline" className="mr-1">
                                                                    {automation.from_status}
                                                                </Badge>
                                                                →
                                                                <Badge variant="outline" className="ml-1">
                                                                    {automation.to_status}
                                                                </Badge>
                                                            </>
                                                        ) : (
                                                            <>
                                                                Novo lead em{" "}
                                                                <Badge variant="outline">{automation.to_status}</Badge>
                                                            </>
                                                        )}
                                                    </CardDescription>
                                                </div>
                                                <Badge
                                                    className={
                                                        automation.is_active
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-gray-100 text-gray-700"
                                                    }
                                                >
                                                    {automation.is_active ? "Ativo" : "Inativo"}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="bg-muted/50 rounded-lg p-3 mb-4 text-sm">
                                                <p className="text-muted-foreground line-clamp-3">
                                                    {typeof automation.message_template === 'string'
                                                        ? automation.message_template
                                                        : JSON.stringify(automation.message_template || "Sem mensagem configurada")}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => toggleActive(automation)}
                                                >
                                                    <Power className="h-4 w-4 mr-1" />
                                                    {automation.is_active ? "Desativar" : "Ativar"}
                                                </Button>
                                                <Button variant="ghost" size="sm">
                                                    <Edit className="h-4 w-4 mr-1" />
                                                    Editar
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700"
                                                    onClick={() => deleteAutomation(automation.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
