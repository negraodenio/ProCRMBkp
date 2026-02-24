"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    Search,
    Filter,
    Eye,
    Edit,
    Send,
    MessageCircle,
    Trash2,
    LayoutDashboard,
    Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
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
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface Proposal {
    id: string;
    number: string;
    title: string;
    value: number;
    status: string;
    created_at: string;
    valid_until: string | null;
    contact_id: string;
    content?: {
        description?: string;
    };
    contact?: {
        name: string;
    };
}

const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    sent: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    accepted: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    expired: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
};

const statusLabels: Record<string, string> = {
    draft: "Rascunho",
    sent: "Enviada",
    accepted: "Aceita",
    rejected: "Rejeitada",
    expired: "Expirada",
};

export default function ProposalsPage() {
    const [open, setOpen] = useState(false);
    const [editingProposalId, setEditingProposalId] = useState<string | null>(null);
    const [viewingProposal, setViewingProposal] = useState<Proposal | null>(null);
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [contacts, setContacts] = useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [organizationId, setOrganizationId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [pipelines, setPipelines] = useState<{ id: string; name: string }[]>([]);
    const [allStages, setAllStages] = useState<{ id: string; name: string; pipeline_id: string }[]>([]);
    const [transferringProposal, setTransferringProposal] = useState<Proposal | null>(null);
    const [transferData, setTransferData] = useState({
        pipelineId: "",
        stageId: ""
    });
    const [formData, setFormData] = useState({
        contactId: "",
        title: "",
        value: "",
        validDays: "30",
        content: "",
    });

    const supabase = createClient();

    useEffect(() => {
        async function init() {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("organization_id")
                    .eq("id", user.id)
                    .single();

                if (profile?.organization_id) {
                    setOrganizationId(profile.organization_id);
                    await Promise.all([
                        loadProposals(profile.organization_id),
                        loadContacts(profile.organization_id),
                        loadPipelines(profile.organization_id),
                        loadStages(profile.organization_id)
                    ]);
                }
            }
            setLoading(false);
        }
        init();
    }, []);

    async function loadProposals(orgId?: string) {
        const id = orgId || organizationId;
        if (!id) return;

        const { data, error } = await supabase
            .from("proposals")
            .select(`
                *,
                contact:contacts(name)
            `)
            .eq("organization_id", id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error loading proposals:", error);
            toast.error("Erro ao carregar propostas");
        } else {
            setProposals(data || []);
        }
    }

    async function loadContacts(orgId?: string) {
        const id = orgId || organizationId;
        if (!id) return;

        const { data } = await supabase
            .from("contacts")
            .select("id, name, type")
            .eq("organization_id", id)
            .order("name");
        setContacts((data || []).map(c => ({ id: c.id, name: `${c.name}${c.type === 'client' ? ' (Cliente)' : ' (Lead)'}` })));
    }

    async function loadPipelines(orgId: string) {
        const { data } = await supabase.from("pipelines").select("id, name").eq("organization_id", orgId);
        setPipelines(data || []);
    }

    async function loadStages(orgId: string) {
        const { data } = await supabase.from("stages").select("id, name, pipeline_id").eq("organization_id", orgId).order("order");
        setAllStages(data || []);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!organizationId) return;

        const proposalNumber = editingProposalId ? undefined : `PROP-${Date.now()}`;
        const validUntil = new Date();
        validUntil.setDate(validUntil.getDate() + parseInt(formData.validDays));

        const parsedValue = parseFloat(formData.value.replace(/\./g, "").replace(",", ".")) || 0;

        if (editingProposalId) {
            const { error } = await supabase
                .from("proposals")
                .update({
                    contact_id: formData.contactId,
                    title: formData.title,
                    value: parsedValue,
                    valid_until: validUntil.toISOString().split("T")[0],
                    content: { description: formData.content },
                })
                .eq("id", editingProposalId);

            if (error) {
                console.error("Error updating proposal:", error);
                toast.error("Erro ao atualizar proposta");
                return;
            }
            toast.success("Proposta atualizada com sucesso!");
        } else {
            const { error } = await supabase.from("proposals").insert({
                organization_id: organizationId,
                contact_id: formData.contactId,
                number: proposalNumber,
                title: formData.title,
                value: parsedValue,
                valid_until: validUntil.toISOString().split("T")[0],
                status: "draft",
                content: { description: formData.content },
            });

            if (error) {
                console.error("Error creating proposal:", error);
                toast.error("Erro ao criar proposta");
                return;
            }
            toast.success("Proposta criada com sucesso!");
        }

        setFormData({ contactId: "", title: "", value: "", validDays: "30", content: "" });
        setEditingProposalId(null);
        setOpen(false);
        loadProposals();
    }

    function handleEdit(proposal: Proposal) {
        setFormData({
            contactId: proposal.contact_id,
            title: proposal.title,
            value: proposal.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            validDays: "30",
            content: proposal.content?.description || "",
        });
        setEditingProposalId(proposal.id);
        setOpen(true);
    }

    function handleDuplicate(proposal: Proposal) {
        setFormData({
            contactId: proposal.contact_id,
            title: proposal.title + " (Cópia)",
            value: proposal.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            validDays: "30",
            content: proposal.content?.description || "",
        });
        setEditingProposalId(null);
        setOpen(true);
    }

    async function sendViaWhatsApp(proposal: Proposal) {
        await supabase
            .from("proposals")
            .update({ sent_via_whatsapp: true, status: "sent", sent_at: new Date().toISOString() })
            .eq("id", proposal.id);
        toast.success("Proposta enviada via WhatsApp!");
        loadProposals();
    }

    async function sendViaEmail(proposal: Proposal) {
        await supabase
            .from("proposals")
            .update({ sent_via_email: true, status: "sent", sent_at: new Date().toISOString() })
            .eq("id", proposal.id);
        toast.success("Proposta enviada via Email!");
        loadProposals();
    }

    async function handleTransferSubmit() {
        if (!transferringProposal || !transferData.pipelineId || !transferData.stageId) {
            toast.error("Selecione o funil e a etapa");
            return;
        }

        const { error } = await supabase
            .from("proposals")
            .update({
                pipeline_id: transferData.pipelineId,
                stage_id: transferData.stageId,
                updated_at: new Date().toISOString()
            })
            .eq("id", transferringProposal.id);

        if (error) {
            toast.error("Erro ao enviar para o pipeline");
        } else {
            toast.success("Proposta enviada ao pipeline!");
            setTransferringProposal(null);
            loadProposals();
        }
    }

    const filteredProposals = proposals.filter(
        (p) =>
            p.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.contact?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value || 0);
    };

    const formatDate = (date: string) => {
        if (!date) return "-";
        return new Date(date).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
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
                                <h1 className="text-3xl font-bold">Propostas</h1>
                                <p className="text-muted-foreground">
                                    Gerencie suas propostas comerciais
                                </p>
                            </div>
                            <Dialog open={open} onOpenChange={(isOpen) => {
                                setOpen(isOpen);
                                if (!isOpen) {
                                    setFormData({ contactId: "", title: "", value: "", validDays: "30", content: "" });
                                    setEditingProposalId(null);
                                }
                            }}>
                                <DialogTrigger asChild>
                                    <Button className="bg-blue-600 hover:bg-blue-700">
                                        <Plus className="mr-2 h-4 w-4" /> Nova Proposta
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[600px]">
                                    <DialogHeader>
                                        <DialogTitle>{editingProposalId ? "Editar Proposta" : "Nova Proposta"}</DialogTitle>
                                        <DialogDescription>
                                            {editingProposalId ? "Atualize os detalhes desta proposta." : "Crie uma nova proposta comercial para enviar ao cliente."}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="contact">Cliente *</Label>
                                                <Select
                                                    value={formData.contactId}
                                                    onValueChange={(v) => setFormData({ ...formData, contactId: v })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione o cliente" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {contacts.map((c) => (
                                                            <SelectItem key={c.id} value={c.id}>
                                                                {c.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="value">Valor (R$) *</Label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">R$</span>
                                                    <Input
                                                        id="value"
                                                        placeholder="0,00"
                                                        className="pl-9"
                                                        value={formData.value}
                                                        onChange={(e) => {
                                                            const raw = e.target.value.replace(/\D/g, "");
                                                            if (!raw || raw === "0" || raw === "00") {
                                                                setFormData({ ...formData, value: "" });
                                                                return;
                                                            }
                                                            const num = parseInt(raw, 10) / 100;
                                                            setFormData({ ...formData, value: num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) });
                                                        }}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="title">Título da Proposta *</Label>
                                            <Input
                                                id="title"
                                                placeholder="Ex: Proposta de Desenvolvimento Web"
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="validDays">Validade (dias)</Label>
                                            <Select
                                                value={formData.validDays}
                                                onValueChange={(v) => setFormData({ ...formData, validDays: v })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="7">7 dias</SelectItem>
                                                    <SelectItem value="15">15 dias</SelectItem>
                                                    <SelectItem value="30">30 dias</SelectItem>
                                                    <SelectItem value="60">60 dias</SelectItem>
                                                    <SelectItem value="90">90 dias</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="content">Descrição</Label>
                                            <Textarea
                                                id="content"
                                                placeholder="Descreva os detalhes da proposta..."
                                                value={formData.content}
                                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                                rows={4}
                                            />
                                        </div>
                                        <DialogFooter>
                                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                                Cancelar
                                            </Button>
                                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                                {editingProposalId ? "Salvar Alterações" : "Criar Proposta"}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {/* Search and Filters */}
                        <div className="bg-card rounded-lg border p-6">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                                <h2 className="text-xl font-semibold">Todas as Propostas</h2>
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar propostas..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-9 w-64"
                                        />
                                    </div>
                                    <Button variant="outline" size="icon">
                                        <Filter className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Número</TableHead>
                                            <TableHead>Valor</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Criada em</TableHead>
                                            <TableHead>Validade</TableHead>
                                            <TableHead>Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-8">
                                                    Carregando...
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredProposals.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                    Nenhuma proposta encontrada
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredProposals.map((proposal) => (
                                                <TableRow key={proposal.id}>
                                                    <TableCell>
                                                        <div className="font-bold text-slate-900 text-base">{proposal.title || "Proposta sem título"}</div>
                                                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                                                            <Badge variant="outline" className="text-[10px] font-mono py-0 h-4 uppercase bg-slate-50">{proposal.number}</Badge>
                                                            <span className="truncate max-w-[150px] font-medium text-slate-600">{proposal.contact?.name || "Sem contato"}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {formatCurrency(proposal.value)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={statusColors[proposal.status] || "bg-gray-100"}>
                                                            {statusLabels[proposal.status] || proposal.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{formatDate(proposal.created_at)}</TableCell>
                                                    <TableCell>
                                                        {proposal.valid_until
                                                            ? new Date(proposal.valid_until).toLocaleDateString("pt-BR")
                                                            : "-"}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1">
                                                            <Button variant="ghost" size="icon" title="Visualizar" onClick={() => setViewingProposal(proposal)}>
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                title="Lançar no Funil (Pipeline)"
                                                                className="text-blue-600 hover:text-blue-700"
                                                                onClick={() => setTransferringProposal(proposal)}
                                                            >
                                                                <LayoutDashboard className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" title="Editar" onClick={() => handleEdit(proposal)}>
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" title="Duplicar" onClick={() => handleDuplicate(proposal)}>
                                                                <Copy className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                title="Enviar via Email"
                                                                onClick={() => sendViaEmail(proposal)}
                                                            >
                                                                <Send className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-green-600 hover:text-green-700"
                                                                title="Enviar via WhatsApp"
                                                                onClick={() => sendViaWhatsApp(proposal)}
                                                            >
                                                                <MessageCircle className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-red-600 hover:text-red-700"
                                                                title="Excluir"
                                                                onClick={() => deleteProposal(proposal.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>
                </main>

                <Dialog open={!!viewingProposal} onOpenChange={(open) => !open && setViewingProposal(null)}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Visualizar Proposta</DialogTitle>
                            <DialogDescription>
                                Detalhes completos da proposta comercial.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-bold">{viewingProposal?.title}</h3>
                                <p className="text-sm text-muted-foreground">#{viewingProposal?.number}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-semibold">Cliente</p>
                                    <p className="text-sm">{viewingProposal?.contact?.name || "Desconhecido"}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">Valor</p>
                                    <p className="text-sm">{viewingProposal ? formatCurrency(viewingProposal.value) : "R$ 0,00"}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">Status</p>
                                    <Badge className={viewingProposal ? statusColors[viewingProposal.status] : ""}>
                                        {viewingProposal ? statusLabels[viewingProposal.status] : "Desconhecido"}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">Validade</p>
                                    <p className="text-sm">{viewingProposal?.valid_until ? new Date(viewingProposal.valid_until).toLocaleDateString("pt-BR") : "-"}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-semibold mb-1">Descrição</p>
                                <div className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap min-h-[100px]">
                                    {viewingProposal?.content?.description || "Sem descrição."}
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={() => setViewingProposal(null)}>Fechar</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={!!transferringProposal} onOpenChange={(open) => !open && setTransferringProposal(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Enviar para o Pipeline</DialogTitle>
                            <DialogDescription>
                                Escolha em qual funil e etapa esta proposta deve aparecer.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Selecione o Funil</Label>
                                <Select
                                    value={transferData.pipelineId}
                                    onValueChange={(v) => setTransferData({ ...transferData, pipelineId: v, stageId: "" })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Escolha um funil" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {pipelines.map(p => (
                                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Selecione a Etapa</Label>
                                <Select
                                    value={transferData.stageId}
                                    onValueChange={(v) => setTransferData({ ...transferData, stageId: v })}
                                    disabled={!transferData.pipelineId}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Escolha uma etapa" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {allStages
                                            .filter(s => s.pipeline_id === transferData.pipelineId)
                                            .map(s => (
                                                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                            ))
                                        }
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setTransferringProposal(null)}>Cancelar</Button>
                            <Button onClick={handleTransferSubmit} className="bg-indigo-600 hover:bg-indigo-700">Confirmar Envio</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
