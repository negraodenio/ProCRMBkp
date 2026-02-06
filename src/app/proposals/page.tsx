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
    Copy,
    Trash2,
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
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [contacts, setContacts] = useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [organizationId, setOrganizationId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
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
                        loadContacts(profile.organization_id)
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
            .select("id, name")
            .eq("organization_id", id)
            .order("name");
        setContacts(data || []);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!organizationId) return;

        const proposalNumber = `PROP-${Date.now()}`;
        const validUntil = new Date();
        validUntil.setDate(validUntil.getDate() + parseInt(formData.validDays));

        const { error } = await supabase.from("proposals").insert({
            organization_id: organizationId,
            contact_id: formData.contactId,
            number: proposalNumber,
            title: formData.title,
            value: parseFloat(formData.value.replace(/[^\d,.-]/g, "").replace(",", ".")),
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
        setFormData({ contactId: "", title: "", value: "", validDays: "30", content: "" });
        setOpen(false);
        loadProposals();
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

    async function deleteProposal(id: string) {
        if (!confirm("Tem certeza que deseja excluir esta proposta?")) return;

        const { error } = await supabase.from("proposals").delete().eq("id", id);
        if (error) {
            toast.error("Erro ao excluir proposta");
        } else {
            toast.success("Proposta excluída!");
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
                            <Dialog open={open} onOpenChange={setOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-blue-600 hover:bg-blue-700">
                                        <Plus className="mr-2 h-4 w-4" /> Nova Proposta
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[600px]">
                                    <DialogHeader>
                                        <DialogTitle>Nova Proposta</DialogTitle>
                                        <DialogDescription>
                                            Crie uma nova proposta comercial para enviar ao cliente.
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
                                                <Input
                                                    id="value"
                                                    placeholder="0,00"
                                                    value={formData.value}
                                                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                                    required
                                                />
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
                                                Criar Proposta
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
                                                        <div className="font-medium">{proposal.number}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {proposal.contact?.name || proposal.title}
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
                                                            <Button variant="ghost" size="icon" title="Visualizar">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" title="Editar">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" title="Duplicar">
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
            </div>
        </div>
    );
}
