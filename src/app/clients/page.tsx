"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Users, Phone, Mail, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useProfile } from "@/hooks/use-profile";


interface Client {
    id: string;
    name: string;
    email: string;
    phone: string;
    company: string;
    status: string;
    created_at: string;
}

export default function ClientsPage() {
    const [supabase] = useState(() => createClient());
    const { profile, loading: profileLoading } = useProfile();
    const [open, setOpen] = useState(false);
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        company: "",
    });


    useEffect(() => {
        if (!profileLoading && profile?.organization_id) {
            loadClients();
        }
    }, [supabase, profileLoading, profile?.organization_id]);


    async function loadClients() {
        if (!profile?.organization_id) return;
        setLoading(true);
        const { data, error } = await supabase
            .from("contacts")
            .select("*")
            .eq("type", "client")
            .eq("organization_id", profile.organization_id)
            .order("created_at", { ascending: false });


        if (error) {
            console.error("Error loading clients:", error);
            toast.error("Erro ao carregar clientes");
        } else {
            setClients(data || []);
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

        const { error } = await supabase.from("contacts").insert({
            organization_id: profile.organization_id,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            company: formData.company,
            type: "client",
            status: "active",
        });

        if (error) {
            console.error("Error creating client:", error);
            toast.error("Erro ao criar cliente");
            return;
        }

        toast.success("Cliente criado com sucesso!");
        resetForm();
        setOpen(false);
        loadClients();
    }

    function resetForm() {
        setFormData({ name: "", email: "", phone: "", company: "" });
    }

    async function deleteClient(id: string) {
        if (!confirm("Tem certeza que deseja excluir este cliente?")) return;

        const { error } = await supabase.from("contacts").delete().eq("id", id);
        if (error) {
            toast.error("Erro ao excluir cliente");
        } else {
            toast.success("Cliente excluído!");
            loadClients();
        }
    }

    const filteredClients = clients.filter(
        (c) =>
            c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.company?.toLowerCase().includes(searchTerm.toLowerCase())
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
                                <h1 className="text-3xl font-bold">Clientes</h1>
                                <p className="text-muted-foreground">
                                    Gerencie sua base de clientes
                                </p>
                            </div>
                            <Dialog open={open} onOpenChange={setOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-blue-600 hover:bg-blue-700">
                                        <Plus className="mr-2 h-4 w-4" /> Novo Cliente
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[500px]">
                                    <DialogHeader>
                                        <DialogTitle>Novo Cliente</DialogTitle>
                                        <DialogDescription>
                                            Adicione um novo cliente à sua base.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Nome *</Label>
                                            <Input
                                                id="name"
                                                placeholder="Nome do cliente"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="email@empresa.com"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Telefone</Label>
                                            <Input
                                                id="phone"
                                                placeholder="(11) 99999-9999"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="company">Empresa</Label>
                                            <Input
                                                id="company"
                                                placeholder="Nome da empresa"
                                                value={formData.company}
                                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                            />
                                        </div>
                                        <DialogFooter>
                                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                                Cancelar
                                            </Button>
                                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                                Criar Cliente
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {/* Search */}
                        <div className="flex items-center gap-4">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar clientes..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        {/* Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Lista de Clientes ({filteredClients.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Nome</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Telefone</TableHead>
                                                <TableHead>Empresa</TableHead>
                                                <TableHead>Status</TableHead>
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
                                            ) : filteredClients.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                        Nenhum cliente encontrado. Clique em "Novo Cliente" para começar.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredClients.map((client) => (
                                                    <TableRow key={client.id}>
                                                        <TableCell className="font-medium">{client.name}</TableCell>
                                                        <TableCell>
                                                            {client.email ? (
                                                                <a href={`mailto:${client.email}`} className="text-blue-600 hover:underline flex items-center gap-1">
                                                                    <Mail className="h-3 w-3" />
                                                                    {client.email}
                                                                </a>
                                                            ) : (
                                                                "-"
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {client.phone ? (
                                                                <a href={`tel:${client.phone}`} className="flex items-center gap-1">
                                                                    <Phone className="h-3 w-3" />
                                                                    {client.phone}
                                                                </a>
                                                            ) : (
                                                                "-"
                                                            )}
                                                        </TableCell>
                                                        <TableCell>{client.company || "-"}</TableCell>
                                                        <TableCell>
                                                            <Badge className="bg-green-100 text-green-700">
                                                                {client.status === "active" ? "Ativo" : client.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-1">
                                                                <Button variant="ghost" size="icon" title="Editar">
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="text-red-600 hover:text-red-700"
                                                                    title="Excluir"
                                                                    onClick={() => deleteClient(client.id)}
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
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}
