"use client";

import { useState, useEffect } from "react";
import { Plus, Users, Edit, Trash2, Mail, Shield, User, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
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
import { useProfile } from "@/hooks/use-profile";
import { inviteUserAction } from "./actions";


interface UserProfile {
    id: string;
    email: string;
    full_name: string;
    role: string;
    status: string;
    created_at: string;
    company_name?: string;
}

const ROLES = [
    { value: "admin", label: "Administrador", color: "bg-red-100 text-red-700" },
    { value: "manager", label: "Gestor", color: "bg-blue-100 text-blue-700" },
    { value: "user", label: "Consultor", color: "bg-purple-100 text-purple-700" },
];

const DEPARTMENTS = ["vendas", "marketing", "suporte", "financeiro", "N/A"];

export default function UsersPage() {
    const [supabase] = useState(() => createClient());
    const { profile, loading: profileLoading } = useProfile();
    const [open, setOpen] = useState(false);
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "user",
        department: "vendas",
    });


    useEffect(() => {
        if (!profileLoading && profile?.organization_id) {
            loadUsers();
        }
    }, [supabase, profileLoading, profile?.organization_id]);


    async function loadUsers() {
        if (!profile?.organization_id) return;
        setLoading(true);
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("organization_id", profile.organization_id)
            .order("created_at", { ascending: false });


        if (error) {
            console.error("Error loading users:", error);
            toast.error("Erro ao carregar usuários");
        } else {
            setUsers(data || []);
        }
        setLoading(false);
    }

    async function handleInvite(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await inviteUserAction(
                formData.email,
                formData.name,
                formData.role,
                formData.department
            );

            if (result.success) {
                toast.success(`Convite enviado para ${formData.email}`);
                resetForm();
                setOpen(false);
                loadUsers();
            } else {
                toast.error(`Erro ao convidar: ${result.error}`);
            }
        } catch (error) {
            toast.error("Erro inesperado ao enviar convite");
        } finally {
            setLoading(false);
        }
    }

    function resetForm() {
        setFormData({
            name: "",
            email: "",
            role: "user",
            department: "vendas",
        });
    }

    async function toggleStatus(user: UserProfile) {
        const newStatus = user.status === "active" ? "inactive" : "active";
        const { error } = await supabase
            .from("profiles")
            .update({ status: newStatus })
            .eq("id", user.id);

        if (error) {
            toast.error("Erro ao atualizar status");
        } else {
            toast.success(newStatus === "active" ? "Usuário ativado" : "Usuário desativado");
            loadUsers();
        }
    }

    // Stats calculation
    const stats = {
        admins: users.filter((u) => u.role === "admin").length,
        managers: users.filter((u) => u.role === "manager").length,
        consultants: users.filter((u) => u.role === "user").length,
        inactive: users.filter((u) => u.status === "inactive").length,
    };

    const getRoleBadge = (role: string) => {
        const roleConfig = ROLES.find((r) => r.value === role);
        return roleConfig || { label: role, color: "bg-gray-100 text-gray-700" };
    };

    const formatDate = (date: string) => {
        if (!date) return "-";
        return new Date(date).toLocaleDateString("pt-BR");
    };

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex flex-1 flex-col md:ml-64">
                <Header />
                <main className="flex-1 p-6">
                    <div className="space-y-6">
                        {/* Stats Cards */}
                        <div className="grid gap-4 md:grid-cols-4">
                            <Card>
                                <CardContent className="flex items-center gap-4 p-4">
                                    <div className="p-2 rounded-full bg-red-100">
                                        <Shield className="h-6 w-6 text-red-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Administradores</p>
                                        <p className="text-2xl font-bold text-red-600">{stats.admins}</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="flex items-center gap-4 p-4">
                                    <div className="p-2 rounded-full bg-blue-100">
                                        <Users className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Gestores</p>
                                        <p className="text-2xl font-bold text-blue-600">{stats.managers}</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="flex items-center gap-4 p-4">
                                    <div className="p-2 rounded-full bg-green-100">
                                        <User className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Consultores</p>
                                        <p className="text-2xl font-bold text-green-600">{stats.consultants}</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="flex items-center gap-4 p-4">
                                    <div className="p-2 rounded-full bg-gray-100">
                                        <UserX className="h-6 w-6 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Inativos</p>
                                        <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Users Table */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Lista de Usuários</CardTitle>
                                <Dialog open={open} onOpenChange={setOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="bg-blue-600 hover:bg-blue-700">
                                            <Plus className="mr-2 h-4 w-4" /> Convidar Usuário
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[500px]">
                                        <DialogHeader>
                                            <DialogTitle>Convidar Novo Usuário</DialogTitle>
                                            <DialogDescription>
                                                Envie um convite para adicionar um novo usuário à equipe.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handleInvite} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Nome Completo *</Label>
                                                <Input
                                                    id="name"
                                                    placeholder="Nome do usuário"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email *</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="email@empresa.com"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Papel</Label>
                                                    <Select
                                                        value={formData.role}
                                                        onValueChange={(v) => setFormData({ ...formData, role: v })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {ROLES.map((role) => (
                                                                <SelectItem key={role.value} value={role.value}>
                                                                    {role.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Departamento</Label>
                                                    <Select
                                                        value={formData.department}
                                                        onValueChange={(v) => setFormData({ ...formData, department: v })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {DEPARTMENTS.map((dept) => (
                                                                <SelectItem key={dept} value={dept}>
                                                                    {dept}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                                    Cancelar
                                                </Button>
                                                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                                    <Mail className="mr-2 h-4 w-4" /> Enviar Convite
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Nome</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Papel</TableHead>
                                                <TableHead>Departamento</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Criado em</TableHead>
                                                <TableHead>Ações</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {loading ? (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="text-center py-8">
                                                        Carregando...
                                                    </TableCell>
                                                </TableRow>
                                            ) : users.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                                        Nenhum usuário encontrado
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                users.map((user) => {
                                                    const roleBadge = getRoleBadge(user.role);
                                                    return (
                                                        <TableRow key={user.id}>
                                                            <TableCell className="font-medium">{user.full_name || "-"}</TableCell>
                                                            <TableCell>{user.email}</TableCell>
                                                            <TableCell>
                                                                <Badge className={roleBadge.color}>{roleBadge.label}</Badge>
                                                            </TableCell>
                                                            <TableCell className="text-muted-foreground">
                                                                {user.company_name || "N/A"}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge
                                                                    className={
                                                                        user.status === "active"
                                                                            ? "bg-green-100 text-green-700"
                                                                            : "bg-gray-100 text-gray-700"
                                                                    }
                                                                >
                                                                    {user.status === "active" ? "Ativo" : "Inativo"}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>{formatDate(user.created_at)}</TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-1">
                                                                    <Button variant="ghost" size="icon" title="Editar">
                                                                        <Edit className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        title={user.status === "active" ? "Desativar" : "Ativar"}
                                                                        onClick={() => toggleStatus(user)}
                                                                    >
                                                                        {user.status === "active" ? (
                                                                            <UserX className="h-4 w-4" />
                                                                        ) : (
                                                                            <User className="h-4 w-4" />
                                                                        )}
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })
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
