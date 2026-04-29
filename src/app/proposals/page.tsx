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
    LayoutDashboard,
    Share2,
    Wand2,
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
import { generateProposalPitch } from "./ai-actions";

interface ProposalItem {
    id?: string;
    unit_price: number;
    name: string;
    currency: string;
}

interface Proposal {
    id: string;
    number: string;
    title: string;
    total: number;
    currency: string;
    status: string;
    created_at: string;
    valid_until: string | null;
    contact_id: string;
    company_id?: string | null;
    pipeline_id?: string | null;
    stage_id?: string | null;
    content?: {
        description?: string;
    };
    contact?: {
        name: string;
    };
    items?: ProposalItem[];
    stage?: {
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
    const [contacts, setContacts] = useState<any[]>([]);
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
        companyId: "", // Added companyId
        pipelineId: "", // Added pipelineId
        title: "",
        value: "",
        currency: "BRL",
        validDays: "30",
        content: "",
    });
    const [proposalItems, setProposalItems] = useState<ProposalItem[]>([
        { name: "", unit_price: 0, currency: "BRL" }
    ]);
    const [generatingPitch, setGeneratingPitch] = useState(false);

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
                        loadStages(profile.organization_id),
                        loadAvailableCompanies(profile.organization_id)
                    ]);
                }
            }
            setLoading(false);
        }
        init();
    }, []);

    // Self-healing: reload stages if empty when opening transfer dialog
    useEffect(() => {
        if (transferringProposal && allStages.length === 0 && organizationId) {
            loadStages(organizationId);
        }
    }, [transferringProposal, allStages.length, organizationId]);

    async function loadProposals(orgId?: string) {
        const id = orgId || organizationId;
        if (!id) return;

        const { data, error } = await supabase
            .from("proposals")
            .select(`
                *,
                contact:contacts(name),
                items:proposal_items(*),
                stage:stages(name)
            `)
            .eq("organization_id", id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("DEBUG: Error loading proposals:", error);
            toast.error(`Erro ao carregar propostas: ${error.message}`);
        } else {
            setProposals(data || []);
        }
    }

    async function loadContacts(orgId?: string) {
        const id = orgId || organizationId;
        if (!id) return;

        const { data } = await supabase
            .from("contacts")
            .select(`
                id,
                name,
                type,
                contact_companies(company_id)
            `)
            .eq("organization_id", id)
            .order("name");

        // Transform the data to the expected format if needed, but we keep the structure for filtering
        setContacts(data || []);
    }

    async function loadPipelines(orgId: string) {
        const { data } = await supabase.from("pipelines").select("id, name").eq("organization_id", orgId);
        setPipelines(data || []);
        // Set default pipeline if not editing
        if (!editingProposalId && data && data.length > 0 && !formData.pipelineId) {
            setFormData(prev => ({ ...prev, pipelineId: data[0].id }));
        }
    }

    async function loadStages(orgId: string) {
        try {
            const { data: pipelinesData, error: pError } = await supabase
                .from("pipelines")
                .select("id")
                .eq("organization_id", orgId);

            if (pError) throw pError;
            if (!pipelinesData || pipelinesData.length === 0) {
                setAllStages([]);
                return;
            }

            const pipelineIds = pipelinesData.map(p => p.id);

            const { data, error } = await supabase
                .from("stages")
                .select("id, name, pipeline_id")
                .in("pipeline_id", pipelineIds)
                .order("order", { ascending: true });

            if (error) throw error;

            setAllStages(data || []);
        } catch (error: any) {
            console.error("ERROR: Failed to load stages:", error);
        }
    }

    const [availableCompanies, setAvailableCompanies] = useState<{ id: string, name: string }[]>([]);

    async function loadAvailableCompanies(orgId: string) {
        const { data } = await supabase
            .from('companies')
            .select('id, name')
            .eq('organization_id', orgId)
            .order('name');
        if (data) setAvailableCompanies(data);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!organizationId) return;

        const proposalNumber = editingProposalId ? undefined : `PROP-${Date.now()}`;
        const validUntil = new Date();
        validUntil.setDate(validUntil.getDate() + parseInt(formData.validDays));

        const parsedValue = parseFloat(formData.value.replace(/\./g, "").replace(",", ".")) || 0;

        let proposalId = editingProposalId;

        if (editingProposalId) {
            const { error } = await supabase
                .from("proposals")
                .update({
                    contact_id: formData.contactId,
                    company_id: formData.companyId || null,
                    title: formData.title,
                    total: parsedValue,
                    currency: formData.currency,
                    valid_until: validUntil.toISOString().split("T")[0],
                    content: { description: formData.content },
                })
                .eq("id", editingProposalId);

            if (error) {
                console.error("DEBUG: Error updating proposal:", error);
                toast.error(`Erro ao atualizar proposta: ${error.message}`);
                return;
            }

            // Update items
            // Simple approach: delete all and re-insert
            await supabase.from("proposal_items").delete().eq("proposal_id", editingProposalId);

            const itemsToInsert = proposalItems
                .filter(item => item.name.trim() !== "")
                .map(item => ({
                    proposal_id: editingProposalId,
                    organization_id: organizationId,
                    name: item.name,
                    unit_price: item.unit_price,
                    total_price: item.unit_price,
                    quantity: 1,
                    currency: item.currency
                }));

            if (itemsToInsert.length > 0) {
                const { error: itemsError } = await supabase.from("proposal_items").insert(itemsToInsert);
                if (itemsError) {
                    console.error("DEBUG: Error inserting items:", itemsError);
                    toast.error(`Erro ao salvar itens: ${itemsError.message}`);
                }
            }

            toast.success("Proposta atualizada com sucesso!");
        } else {
            const { data: newProposal, error } = await supabase.from("proposals").insert({
                organization_id: organizationId,
                contact_id: formData.contactId,
                company_id: formData.companyId || null,
                pipeline_id: formData.pipelineId || null,
                stage_id: formData.pipelineId
                    ? allStages.find(s => s.pipeline_id === formData.pipelineId)?.id
                    : null,
                number: proposalNumber,
                title: formData.title,
                total: parsedValue,
                currency: formData.currency,
                valid_until: validUntil.toISOString().split("T")[0],
                status: "draft",
                content: { description: formData.content },
            }).select().single();

            if (error) {
                console.error("DEBUG: Error creating proposal:", error);
                toast.error(`Erro ao criar proposta: ${error.message}`);
                return;
            }

            proposalId = newProposal.id;

            // Insert items
            const itemsToInsert = proposalItems
                .filter(item => item.name.trim() !== "")
                .map(item => ({
                    proposal_id: proposalId,
                    organization_id: organizationId,
                    name: item.name,
                    unit_price: item.unit_price,
                    total_price: item.unit_price,
                    quantity: 1,
                    currency: item.currency
                }));

            if (itemsToInsert.length > 0) {
                const { error: itemsError } = await supabase.from("proposal_items").insert(itemsToInsert);
                if (itemsError) {
                    console.error("DEBUG: Error inserting items:", itemsError);
                    toast.error(`Erro ao salvar itens: ${itemsError.message}`);
                }
            }

            toast.success("Proposta criada com sucesso!");
        }

        setFormData({
            contactId: "",
            companyId: "",
            pipelineId: pipelines[0]?.id || "",
            title: "",
            value: "",
            currency: "BRL",
            validDays: "30",
            content: ""
        });
        setProposalItems([{ name: "", unit_price: 0, currency: "BRL" }]);
        setEditingProposalId(null);
        setOpen(false);
        loadProposals();
    }

    function calculateTotal(items: ProposalItem[]) {
        return items.reduce((acc, curr) => acc + curr.unit_price, 0);
    }

    function handleAddItem() {
        setProposalItems([...proposalItems, { name: "", unit_price: 0, currency: formData.currency }]);
    }

    function handleRemoveItem(index: number) {
        const newItems = proposalItems.filter((_, i) => i !== index);
        setProposalItems(newItems.length > 0 ? newItems : [{ name: "", unit_price: 0, currency: formData.currency }]);

        // Update total value in formData
        const totalAmount = calculateTotal(newItems);
        setFormData(prev => ({ ...prev, value: totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }));
    }

    function handleUpdateItem(index: number, field: keyof ProposalItem, value: any) {
        const newItems = [...proposalItems];
        newItems[index] = { ...newItems[index], [field]: value };
        setProposalItems(newItems);

        // Update total value in formData
        const total = calculateTotal(newItems);
        setFormData(prev => ({ ...prev, value: total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }));
    }

    function handleEdit(proposal: Proposal) {
        setFormData({
            contactId: proposal.contact_id,
            companyId: proposal.company_id || "",
            pipelineId: proposal.pipeline_id || "",
            title: proposal.title,
            value: (proposal.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            currency: proposal.currency || "BRL",
            validDays: "30",
            content: proposal.content?.description || "",
        });
        setProposalItems(proposal.items && proposal.items.length > 0
            ? proposal.items.map(item => ({ ...item, unit_price: item.unit_price || 0 }))
            : [{ name: "", unit_price: 0, currency: "BRL" }]);
        setEditingProposalId(proposal.id);
        setOpen(true);
    }

    function handleDuplicate(proposal: Proposal) {
        setFormData({
            contactId: proposal.contact_id,
            companyId: proposal.company_id || "",
            pipelineId: proposal.pipeline_id || "",
            title: proposal.title + " (Cópia)",
            value: (proposal.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            currency: proposal.currency || "BRL",
            validDays: "30",
            content: proposal.content?.description || "",
        });
        setProposalItems(proposal.items
            ? proposal.items.map(item => ({ ...item, id: undefined, unit_price: item.unit_price || 0 }))
            : [{ name: "", unit_price: 0, currency: "BRL" }]);
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

    async function deleteProposal(id: string) {
        if (!organizationId) return;
        const { error } = await supabase.from("proposals").delete().eq("id", id).eq("organization_id", organizationId);
        if (error) {
            toast.error("Erro ao excluir proposta");
        } else {
            toast.success("Proposta excluída!");
            loadProposals();
        }
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
                stage_id: transferData.stageId
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
    async function handleGeneratePitch() {
        if (!formData.contactId) {
            toast.error("Para gerar o pitch, selecione primeiro o cliente.");
            return;
        }

        const validItems = proposalItems.filter(i => i.name.trim() !== "" && i.unit_price > 0);
        if (validItems.length === 0) {
            toast.error("Adicione os itens e valores da proposta antes de gerar o pitch.");
            return;
        }

        // Find client name
        const contact = contacts.find(c => c.id === formData.contactId);
        if (!contact) return;

        setGeneratingPitch(true);
        try {
            const rawTotal = formData.value.replace(/\./g, '').replace(',', '.');
            const total = parseFloat(rawTotal) || 0;

            const result = await generateProposalPitch({
                clientName: contact.name,
                items: validItems,
                total: total
            });

            if (result.success && result.data) {
                setFormData(prev => ({
                    ...prev,
                    content: result.data + (prev.content ? "\n\n" + prev.content : "")
                }));
                toast.success("Pitch comercial gerado com sucesso! ✨");
            } else {
                toast.error(result.error || "Erro ao gerar pitch.");
            }
        } catch (err) {
            toast.error("Erro inesperado ao gerar o pitch.");
        } finally {
            setGeneratingPitch(false);
        }
    }

    const filteredProposals = proposals.filter(
        (p) =>
            p.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.contact?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatCurrency = (value: number, currencyCode?: string) => {
        const code = currencyCode || formData.currency || "BRL";
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: code,
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
                                    setFormData({
                                        contactId: "",
                                        companyId: "",
                                        pipelineId: pipelines[0]?.id || "",
                                        title: "",
                                        value: "",
                                        currency: "BRL",
                                        validDays: "30",
                                        content: ""
                                    });
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
                                                <Label htmlFor="pipeline">Funil de Vendas *</Label>
                                                <Select
                                                    value={formData.pipelineId}
                                                    onValueChange={(v) => setFormData({ ...formData, pipelineId: v })}
                                                    disabled={!!editingProposalId}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione o funil" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {pipelines.map((p) => (
                                                            <SelectItem key={p.id} value={p.id}>
                                                                {p.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="currency">Moeda Principal</Label>
                                                <Select
                                                    value={formData.currency}
                                                    onValueChange={(v) => {
                                                        setFormData({ ...formData, currency: v });
                                                        setProposalItems(prev => prev.map(item => ({ ...item, currency: v })));
                                                    }}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="BRL">Real (R$)</SelectItem>
                                                        <SelectItem value="USD">Dólar (USD)</SelectItem>
                                                        <SelectItem value="EUR">Euro (EUR)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="company">Empresa (Opcional - B2B)</Label>
                                                <Select
                                                    value={formData.companyId || "none"}
                                                    onValueChange={(v) => {
                                                        const newCompanyId = v === "none" ? "" : v;
                                                        setFormData({ ...formData, companyId: newCompanyId, contactId: "" });
                                                    }}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Nenhuma (C2C/CPF)" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">Nenhuma (C2C/CPF)</SelectItem>
                                                        {availableCompanies.map((c) => (
                                                            <SelectItem key={c.id} value={c.id}>
                                                                {c.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="contact">Contato *</Label>
                                                <Select
                                                    value={formData.contactId}
                                                    onValueChange={(v) => setFormData({ ...formData, contactId: v })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione o contato" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {contacts
                                                            .filter(c => {
                                                                if (!formData.companyId) return true;
                                                                return c.contact_companies?.some((cc: any) => cc.company_id === formData.companyId);
                                                            })
                                                            .map((c) => (
                                                                <SelectItem key={c.id} value={c.id}>
                                                                    {c.name}
                                                                </SelectItem>
                                                            ))}
                                                    </SelectContent>
                                                </Select>
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
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between border-b pb-2">
                                                <Label className="text-base font-bold">Itens da Proposta</Label>
                                                <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                                                    <Plus className="mr-2 h-4 w-4" /> Add Item
                                                </Button>
                                            </div>

                                            <div className="space-y-3">
                                                {proposalItems.map((item, index) => (
                                                    <div key={index} className="flex gap-2 items-end bg-muted/30 dark:bg-muted/20 p-3 rounded-lg border border-border">
                                                        <div className="flex-1 space-y-1">
                                                            <Label className="text-[10px] uppercase text-muted-foreground">Produto #{index + 1}</Label>
                                                            <Input
                                                                placeholder="Nome do produto/serviço"
                                                                value={item.name}
                                                                onChange={(e) => handleUpdateItem(index, "name", e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="w-32 space-y-1">
                                                            <Label className="text-[10px] uppercase text-muted-foreground">Valor</Label>
                                                            <div className="relative">
                                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-medium text-muted-foreground">
                                                                    {item.currency === 'BRL' ? 'R$' : item.currency === 'USD' ? '$' : '€'}
                                                                </span>
                                                                <Input
                                                                    placeholder="0,00"
                                                                    className="pl-7 text-right"
                                                                    value={(item.unit_price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                    onChange={(e) => {
                                                                        const raw = e.target.value.replace(/\D/g, "");
                                                                        const num = raw ? parseInt(raw, 10) / 100 : 0;
                                                                        handleUpdateItem(index, "unit_price", num);
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="w-24 space-y-1">
                                                            <Label className="text-[10px] uppercase text-muted-foreground">Moeda</Label>
                                                            <Select
                                                                value={item.currency}
                                                                onValueChange={(v) => handleUpdateItem(index, "currency", v)}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="BRL">Real (R$)</SelectItem>
                                                                    <SelectItem value="USD">Dólar ($)</SelectItem>
                                                                    <SelectItem value="EUR">Euro (€)</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-red-500"
                                                            onClick={() => handleRemoveItem(index)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex justify-between items-center bg-primary/10 p-3 rounded-lg border border-primary/20">
                                                <div className="text-sm font-medium text-primary">Total da Proposta</div>
                                                <div className="text-lg font-bold text-foreground">
                                                    {formData.currency === 'BRL' && 'R$ '}
                                                    {formData.currency === 'USD' && '$ '}
                                                    {formData.currency === 'EUR' && '€ '}
                                                    {formData.value}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="content">Descriçío & Escopo</Label>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    disabled={generatingPitch}
                                                    className="h-8 text-xs font-semibold text-secondary bg-secondary/10 hover:bg-secondary/20 hover:text-secondary"
                                                    onClick={handleGeneratePitch}
                                                >
                                                    <Wand2 className={`h-3 w-3 mr-1.5 ${generatingPitch ? "animate-spin" : ""}`} />
                                                    {generatingPitch ? "Escrevendo..." : "Gerar com IA"}
                                                </Button>
                                            </div>
                                            <Textarea
                                                id="content"
                                                placeholder="Descreva observações ou termos desta proposta..."
                                                value={formData.content}
                                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                                rows={3}
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
                                                        {formatCurrency(proposal.total, proposal.currency)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {proposal.stage?.name ? (
                                                            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                                                                {proposal.stage.name}
                                                            </Badge>
                                                        ) : (
                                                            <Badge className={statusColors[proposal.status] || "bg-gray-100"}>
                                                                {statusLabels[proposal.status] || proposal.status}
                                                            </Badge>
                                                        )}
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
                                    <p className="text-sm font-semibold">Valor Total</p>
                                    <p className="text-sm">{viewingProposal ? formatCurrency(viewingProposal.total, viewingProposal.currency) : "R$ 0,00"}</p>
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
                                <p className="text-sm font-semibold mb-1">Descriçío</p>
                                <div className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap min-h-[100px]">
                                    {viewingProposal?.content?.description || "Sem descriçío."}
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
                                    onValueChange={(v) => {
                                        // Auto-select the first stage of the selected pipeline
                                        const stagesForPipeline = allStages.filter(s => s.pipeline_id === v);
                                        setTransferData({
                                            ...transferData,
                                            pipelineId: v,
                                            stageId: stagesForPipeline.length > 0 ? stagesForPipeline[0].id : ""
                                        });
                                    }}
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
                                    disabled={!transferData.pipelineId || allStages.filter(s => s.pipeline_id === transferData.pipelineId).length === 0}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={
                                            !transferData.pipelineId
                                                ? "Escolha um funil primeiro"
                                                : allStages.filter(s => s.pipeline_id === transferData.pipelineId).length === 0
                                                    ? "Este funil nío tem etapas"
                                                    : "Escolha uma etapa"
                                        } />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {allStages.filter(s => s.pipeline_id === transferData.pipelineId).length > 0 ? (
                                            allStages
                                                .filter(s => s.pipeline_id === transferData.pipelineId)
                                                .map(s => (
                                                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                                ))
                                        ) : (
                                            <div className="p-2 text-sm text-muted-foreground text-center">
                                                Crie etapas neste funil na página de Pipeline.
                                            </div>
                                        )}
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
