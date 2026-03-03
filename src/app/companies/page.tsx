"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Building2, Globe, MapPin, Edit, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useProfile } from "@/hooks/use-profile";

interface Company {
    id: string;
    name: string;
    segment: string;
    url: string;
    summary: string;
    address: string;
    neighborhood: string;
    zip_code: string;
    city: string;
    state: string;
    status: string;
    created_at: string;
}

export default function CompaniesPage() {
    const [supabase] = useState(() => createClient());
    const { profile, loading: profileLoading } = useProfile();
    const [open, setOpen] = useState(false);
    const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        segment: "",
        url: "",
        summary: "",
        address: "",
        neighborhood: "",
        zip_code: "",
        city: "",
        state: "",
    });

    useEffect(() => {
        if (!profileLoading && profile?.organization_id) {
            loadCompanies();
        }
    }, [supabase, profileLoading, profile?.organization_id]);

    async function loadCompanies() {
        if (!profile?.organization_id) return;
        setLoading(true);
        const { data, error } = await supabase
            .from("companies")
            .select("*")
            .eq("organization_id", profile.organization_id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error loading companies:", error);
            toast.error("Erro ao carregar empresas");
        } else {
            setCompanies(data || []);
        }
        setLoading(false);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!profile?.organization_id) {
            toast.error("Organização não encontrada");
            return;
        }

        const payload = {
            ...formData,
            organization_id: profile.organization_id,
        };

        if (editingCompanyId) {
            const { error } = await supabase
                .from("companies")
                .update(payload)
                .eq("id", editingCompanyId)
                .eq("organization_id", profile.organization_id);

            if (error) {
                console.error("Error updating company:", error);
                toast.error("Erro ao atualizar empresa: " + error.message);
                return;
            }

            toast.success("Empresa atualizada com sucesso!");
        } else {
            const { error } = await supabase.from("companies").insert(payload);

            if (error) {
                console.error("Error creating company:", error);
                toast.error("Erro ao criar empresa");
                return;
            }

            toast.success("Empresa criada com sucesso!");
        }

        resetForm();
        setOpen(false);
        loadCompanies();
    }

    function resetForm() {
        setFormData({
            name: "",
            segment: "",
            url: "",
            summary: "",
            address: "",
            neighborhood: "",
            zip_code: "",
            city: "",
            state: "",
        });
        setEditingCompanyId(null);
    }

    function handleEditCompany(company: Company) {
        setFormData({
            name: company.name || "",
            segment: company.segment || "",
            url: company.url || "",
            summary: company.summary || "",
            address: company.address || "",
            neighborhood: company.neighborhood || "",
            zip_code: company.zip_code || "",
            city: company.city || "",
            state: company.state || "",
        });
        setEditingCompanyId(company.id);
        setOpen(true);
    }

    async function deleteCompany(id: string) {
        if (!profile?.organization_id) return;

        const { error } = await supabase
            .from("companies")
            .delete()
            .eq("id", id)
            .eq("organization_id", profile.organization_id);

        if (error) {
            toast.error("Erro ao excluir empresa");
        } else {
            toast.success("Empresa excluída!");
            loadCompanies();
        }
    }

    const filteredCompanies = companies.filter(
        (c) =>
            c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.segment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.city?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                                <h1 className="text-3xl font-bold">Empresas</h1>
                                <p className="text-muted-foreground">
                                    Gerencie suas contas e empresas parceiras
                                </p>
                            </div>
                            <Dialog open={open} onOpenChange={(isOpen) => {
                                setOpen(isOpen);
                                if (!isOpen) resetForm();
                            }}>
                                <DialogTrigger asChild>
                                    <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 text-white">
                                        <Plus className="mr-2 h-4 w-4" /> Criar Empresa
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>{editingCompanyId ? "Editar Empresa" : "Criar Empresa"}</DialogTitle>
                                        <DialogDescription>
                                            Adicione detalhes da empresa para o seu sistema de CRM.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2 col-span-2">
                                                <Label htmlFor="name">Nome da Empresa *</Label>
                                                <Input
                                                    id="name"
                                                    placeholder="Digite o nome da empresa"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="segment">Segmento</Label>
                                                <Input
                                                    id="segment"
                                                    placeholder="Ex: Construtora, TI"
                                                    value={formData.segment}
                                                    onChange={(e) => setFormData({ ...formData, segment: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="url">URL</Label>
                                                <Input
                                                    id="url"
                                                    placeholder="https://empresa.com"
                                                    value={formData.url}
                                                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2 col-span-2">
                                                <Label htmlFor="summary">Resumo / Descrição</Label>
                                                <Textarea
                                                    id="summary"
                                                    placeholder="Descreva a empresa..."
                                                    value={formData.summary}
                                                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2 col-span-2">
                                                <h3 className="text-sm font-semibold border-b pb-1">Endereço</h3>
                                            </div>
                                            <div className="space-y-2 col-span-2">
                                                <Label htmlFor="address">Endereço</Label>
                                                <Input
                                                    id="address"
                                                    placeholder="Logradouro, número"
                                                    value={formData.address}
                                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="neighborhood">Bairro</Label>
                                                <Input
                                                    id="neighborhood"
                                                    placeholder="Bairro"
                                                    value={formData.neighborhood}
                                                    onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="zip_code">CEP</Label>
                                                <Input
                                                    id="zip_code"
                                                    placeholder="00000-000"
                                                    value={formData.zip_code}
                                                    onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="city">Cidade</Label>
                                                <Input
                                                    id="city"
                                                    placeholder="São Paulo"
                                                    value={formData.city}
                                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="state">Estado</Label>
                                                <Input
                                                    id="state"
                                                    placeholder="SP"
                                                    value={formData.state}
                                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter className="pt-4">
                                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                                Cancelar
                                            </Button>
                                            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                                {editingCompanyId ? "Salvar Alterações" : "Criar Empresa"}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {/* Search & Stats */}
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por nome ou segmento..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        {/* Table */}
                        <Card className="border-0 shadow-lg ring-1 ring-border">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-emerald-600" />
                                    Base de Empresas ({filteredCompanies.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-muted/50">
                                            <TableRow>
                                                <TableHead>Empresa</TableHead>
                                                <TableHead>Segmento</TableHead>
                                                <TableHead>Localização</TableHead>
                                                <TableHead>Website</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Ações</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {loading ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center py-12">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <div className="h-6 w-6 border-2 border-emerald-600 border-t-transparent animate-spin rounded-full" />
                                                            <span className="text-muted-foreground">Carregando empresas...</span>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : filteredCompanies.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                                        Nenhuma empresa cadastrada. Comece criando uma conta raiz.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredCompanies.map((company) => (
                                                    <TableRow key={company.id} className="hover:bg-muted/30 transition-colors">
                                                        <TableCell className="font-semibold text-slate-800">
                                                            <div className="flex flex-col">
                                                                {company.name}
                                                                {company.neighborhood && (
                                                                    <span className="text-[10px] text-slate-400 font-normal">{company.neighborhood}</span>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {company.segment ? (
                                                                <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200">
                                                                    {company.segment}
                                                                </Badge>
                                                            ) : "-"}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-1 text-slate-600 text-xs">
                                                                <MapPin className="h-3 w-3" />
                                                                {company.city ? `${company.city}, ${company.state}` : "Não informado"}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {company.url ? (
                                                                <a
                                                                    href={company.url.startsWith('http') ? company.url : `https://${company.url}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-emerald-600 hover:underline flex items-center gap-1 text-xs"
                                                                >
                                                                    <Globe className="h-3 w-3" />
                                                                    {company.url.replace(/^https?:\/\//, '').substring(0, 20)}...
                                                                    <ExternalLink className="h-2 w-2" />
                                                                </a>
                                                            ) : (
                                                                "-"
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                                                                {company.status === "active" ? "Ativo" : company.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex items-center justify-end gap-1">
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" onClick={() => handleEditCompany(company)}>
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                <ConfirmDialog
                                                                    title="Excluir Empresa"
                                                                    description="Tem certeza que deseja excluir esta empresa? Os contatos vinculados não serão excluídos."
                                                                    confirmLabel="Excluir"
                                                                    onConfirm={() => deleteCompany(company.id)}
                                                                    trigger={
                                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-destructive/10">
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    }
                                                                />
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}
