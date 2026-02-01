"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface Template {
    id: string;
    name: string;
    category: string;
    content: {
        description?: string;
        body?: string;
        estimatedValue?: number;
        estimatedDays?: number;
        tags?: string[];
    };
    is_active: boolean;
    created_at: string;
}

const SECTORS = [
    "Tecnologia",
    "Marketing Digital",
    "Consultoria",
    "Vendas",
    "Educação",
    "Saúde",
    "Financeiro",
    "Jurídico",
    "Imobiliário",
    "Outros",
];

export default function TemplatesPage() {
    const [open, setOpen] = useState(false);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [tagInput, setTagInput] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        sector: "Outros",
        description: "",
        content: "",
        estimatedValue: "0.00",
        estimatedDays: "30",
        tags: [] as string[],
        isActive: true,
    });

    const supabase = createClient();

    useEffect(() => {
        loadTemplates();
    }, []);

    async function loadTemplates() {
        setLoading(true);
        const { data, error } = await supabase
            .from("proposal_templates")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error loading templates:", error);
            toast.error("Erro ao carregar templates");
        } else {
            setTemplates(data || []);
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

        const { error } = await supabase.from("proposal_templates").insert({
            organization_id: profile.organization_id,
            name: formData.name,
            category: formData.sector,
            content: {
                description: formData.description,
                body: formData.content,
                estimatedValue: parseFloat(formData.estimatedValue) || 0,
                estimatedDays: parseInt(formData.estimatedDays) || 30,
                tags: formData.tags,
            },
            is_active: formData.isActive,
        });

        if (error) {
            console.error("Error creating template:", error);
            toast.error("Erro ao criar template");
            return;
        }

        toast.success("Template criado com sucesso!");
        resetForm();
        setOpen(false);
        loadTemplates();
    }

    function resetForm() {
        setFormData({
            name: "",
            sector: "Outros",
            description: "",
            content: "",
            estimatedValue: "0.00",
            estimatedDays: "30",
            tags: [],
            isActive: true,
        });
        setTagInput("");
    }

    function addTag() {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
            setTagInput("");
        }
    }

    function removeTag(tag: string) {
        setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
    }

    async function toggleActive(template: Template) {
        const { error } = await supabase
            .from("proposal_templates")
            .update({ is_active: !template.is_active })
            .eq("id", template.id);

        if (error) {
            toast.error("Erro ao atualizar template");
        } else {
            toast.success(template.is_active ? "Template desativado" : "Template ativado");
            loadTemplates();
        }
    }

    async function deleteTemplate(id: string) {
        if (!confirm("Tem certeza que deseja excluir este template?")) return;

        const { error } = await supabase.from("proposal_templates").delete().eq("id", id);
        if (error) {
            toast.error("Erro ao excluir template");
        } else {
            toast.success("Template excluído!");
            loadTemplates();
        }
    }

    const filteredTemplates = templates.filter(
        (t) =>
            t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.category?.toLowerCase().includes(searchTerm.toLowerCase())
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
                                <h1 className="text-3xl font-bold">Biblioteca de Templates</h1>
                                <p className="text-muted-foreground">
                                    Gerencie seus modelos de propostas comerciais
                                </p>
                            </div>
                            <Dialog open={open} onOpenChange={setOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-blue-600 hover:bg-blue-700">
                                        <Plus className="mr-2 h-4 w-4" /> Novo Template
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>Criar Novo Template</DialogTitle>
                                        <DialogDescription>
                                            Configure o template para padronizar suas propostas comerciais.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Nome do Template *</Label>
                                                <Input
                                                    id="name"
                                                    placeholder="Ex: Proposta Desenvolvimento Web"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="sector">Setor *</Label>
                                                <Select
                                                    value={formData.sector}
                                                    onValueChange={(v) => setFormData({ ...formData, sector: v })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {SECTORS.map((sector) => (
                                                            <SelectItem key={sector} value={sector}>
                                                                {sector}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="description">Descrição</Label>
                                            <Textarea
                                                id="description"
                                                placeholder="Breve descrição do template..."
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                rows={2}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="content">Conteúdo do Template *</Label>
                                            <Textarea
                                                id="content"
                                                placeholder="Digite o conteúdo base da proposta aqui..."
                                                value={formData.content}
                                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                                rows={6}
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="estimatedValue">Valor Estimado (R$)</Label>
                                                <Input
                                                    id="estimatedValue"
                                                    type="text"
                                                    placeholder="0.00"
                                                    value={formData.estimatedValue}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, estimatedValue: e.target.value })
                                                    }
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="estimatedDays">Prazo Estimado (dias)</Label>
                                                <Input
                                                    id="estimatedDays"
                                                    type="number"
                                                    value={formData.estimatedDays}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, estimatedDays: e.target.value })
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Tags</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="Digite uma tag..."
                                                    value={tagInput}
                                                    onChange={(e) => setTagInput(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") {
                                                            e.preventDefault();
                                                            addTag();
                                                        }
                                                    }}
                                                />
                                                <Button type="button" variant="outline" onClick={addTag}>
                                                    Adicionar
                                                </Button>
                                            </div>
                                            {formData.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {formData.tags.map((tag) => (
                                                        <Badge
                                                            key={tag}
                                                            variant="secondary"
                                                            className="cursor-pointer"
                                                            onClick={() => removeTag(tag)}
                                                        >
                                                            {tag} ×
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={formData.isActive}
                                                onCheckedChange={(checked) =>
                                                    setFormData({ ...formData, isActive: checked })
                                                }
                                            />
                                            <Label>Template ativo</Label>
                                        </div>

                                        <DialogFooter>
                                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                                Cancelar
                                            </Button>
                                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                                Criar Template
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
                                    placeholder="Buscar templates..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        {/* Templates Grid */}
                        {loading ? (
                            <div className="text-center py-12 text-muted-foreground">Carregando...</div>
                        ) : filteredTemplates.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                Nenhum template encontrado. Crie seu primeiro template!
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {filteredTemplates.map((template) => (
                                    <Card key={template.id} className="relative">
                                        <CardHeader className="pb-2">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-semibold">{template.name}</h3>
                                                    <Badge variant="outline" className="mt-1">
                                                        {template.category}
                                                    </Badge>
                                                </div>
                                                <Badge
                                                    className={
                                                        template.is_active
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-gray-100 text-gray-700"
                                                    }
                                                >
                                                    {template.is_active ? "Ativo" : "Inativo"}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                                {template.content?.description || "Sem descrição"}
                                            </p>
                                            <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                                                <span>
                                                    Valor:{" "}
                                                    {new Intl.NumberFormat("pt-BR", {
                                                        style: "currency",
                                                        currency: "BRL",
                                                    }).format(template.content?.estimatedValue || 0)}
                                                </span>
                                                <span>Prazo: {template.content?.estimatedDays || 30} dias</span>
                                            </div>
                                            {template.content?.tags && template.content.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mb-4">
                                                    {template.content.tags.map((tag) => (
                                                        <Badge key={tag} variant="secondary" className="text-xs">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => toggleActive(template)}>
                                                    <Check className="h-4 w-4 mr-1" />
                                                    {template.is_active ? "Desativar" : "Ativar"}
                                                </Button>
                                                <Button variant="ghost" size="sm">
                                                    <Edit className="h-4 w-4 mr-1" />
                                                    Editar
                                                </Button>
                                                <Button variant="ghost" size="sm">
                                                    <Copy className="h-4 w-4 mr-1" />
                                                    Duplicar
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700"
                                                    onClick={() => deleteTemplate(template.id)}
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
