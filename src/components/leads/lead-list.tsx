"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Phone, Mail, MessageCircle, Edit, Trash2, User, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useProfile } from "@/hooks/use-profile";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: string;
  source: string;
  score: number;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-500 text-white",
  contacted: "bg-yellow-500 text-white",
  qualified: "bg-green-500 text-white",
  proposal: "bg-purple-500 text-white",
  negotiation: "bg-orange-500 text-white",
  won: "bg-emerald-600 text-white",
  lost: "bg-red-500 text-white",
};

const STATUS_LABELS: Record<string, string> = {
  new: "Novo",
  contacted: "Contatado",
  qualified: "Qualificado",
  proposal: "Proposta",
  negotiation: "Negociação",
  won: "Ganho",
  lost: "Perdido",
};

const SOURCES = ["whatsapp", "website", "instagram", "referral", "other"];
const SOURCE_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  website: "Site",
  instagram: "Instagram",
  referral: "Indicação",
  other: "Outro",
};

const SOURCE_COLORS: Record<string, string> = {
  whatsapp: "bg-green-100 text-green-700 border-green-300",
  website: "bg-blue-100 text-blue-700 border-blue-300",
  instagram: "bg-pink-100 text-pink-700 border-pink-300",
  referral: "bg-purple-100 text-purple-700 border-purple-300",
  other: "bg-gray-100 text-gray-700 border-gray-300",
};

export function LeadList() {
  const [open, setOpen] = useState(false);
  const { profile, loading: profileLoading } = useProfile();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    source: "whatsapp",
  });

  const supabase = createClient();

  useEffect(() => {
    if (profile) loadLeads();
  }, [profile]);

  async function loadLeads() {
    if (!profile?.organization_id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .eq("type", "lead")
      .eq("organization_id", profile.organization_id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading leads:", error);
      toast.error("Erro ao carregar leads");
    } else {
      setLeads(data || []);
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

    // 1. Create the lead/contact
    const { data: newContact, error: contactError } = await supabase
      .from("contacts")
      .insert({
        organization_id: profile.organization_id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        source: formData.source,
        type: "lead",
        status: "new",
        score: 50,
      })
      .select()
      .single();

    if (contactError) {
      console.error("Error creating lead:", contactError);
      toast.error("Erro ao criar lead");
      return;
    }

    // 2. Get the default pipeline and its first stage
    const { data: pipeline } = await supabase
      .from("pipelines")
      .select("id")
      .eq("organization_id", profile.organization_id)
      .eq("is_default", true)
      .single();

    if (pipeline) {
      const { data: firstStage } = await supabase
        .from("stages")
        .select("id")
        .eq("pipeline_id", pipeline.id)
        .order("order", { ascending: true })
        .limit(1)
        .single();

      if (firstStage) {
        // 3. Create a deal in the first stage
        await supabase.from("deals").insert({
          organization_id: profile.organization_id,
          stage_id: firstStage.id,
          contact_id: newContact.id,
          title: formData.name + (formData.company ? ` - ${formData.company}` : ""),
          value: 0,
        });
      }
    }

    toast.success("Lead criado e adicionado ao Pipeline!");
    resetForm();
    setOpen(false);
    loadLeads();
  }

  function resetForm() {
    setFormData({ name: "", email: "", phone: "", company: "", source: "whatsapp" });
  }

  async function deleteLead(id: string) {
    if (!confirm("Tem certeza que deseja excluir este lead?")) return;

    const { error } = await supabase.from("contacts").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir lead");
    } else {
      toast.success("Lead excluído!");
      loadLeads();
    }
  }

  async function sendWhatsApp(lead: Lead) {
    if (lead.phone) {
      const phone = lead.phone.replace(/\D/g, "");
      window.open(`https://wa.me/55${phone}`, "_blank");
      toast.success("Abrindo WhatsApp...");
    } else {
      toast.error("Lead sem telefone cadastrado");
    }
  }

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || lead.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (date: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const stats = {
    total: leads.length,
    new: leads.filter((l) => l.status === "new").length,
    qualified: leads.filter((l) => l.status === "qualified").length,
    negotiation: leads.filter((l) => l.status === "negotiation" || l.status === "proposal").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leads</h1>
          <p className="text-muted-foreground">
            Gerencie seus leads e oportunidades
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" /> Novo Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Novo Lead</DialogTitle>
              <DialogDescription>
                Adicione um novo lead manualmente.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  placeholder="Nome do lead"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Empresa</Label>
                  <Input
                    id="company"
                    placeholder="Nome da empresa"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Origem</Label>
                  <Select
                    value={formData.source}
                    onValueChange={(v) => setFormData({ ...formData, source: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SOURCES.map((source) => (
                        <SelectItem key={source} value={source}>
                          {SOURCE_LABELS[source] || source}
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
                  Criar Lead
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filtrar status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total de Leads</p>
            <p className="text-3xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Novos (hoje)</p>
            <p className="text-3xl font-bold text-green-600">{stats.new}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Qualificados</p>
            <p className="text-3xl font-bold text-purple-600">{stats.qualified}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Em Negociação</p>
            <p className="text-3xl font-bold text-orange-600">{stats.negotiation}</p>
          </CardContent>
        </Card>
      </div>

      {/* Leads Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            Carregando leads...
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            Nenhum lead encontrado. Clique em "Novo Lead" para começar.
          </div>
        ) : (
          filteredLeads.map((lead) => (
            <Card key={lead.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {lead.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{lead.name || "Sem nome"}</h3>
                      {lead.company && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {lead.company}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge className={STATUS_COLORS[lead.status] || "bg-gray-100"}>
                    {STATUS_LABELS[lead.status] || lead.status || "Novo"}
                  </Badge>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  {lead.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline truncate">
                        {lead.email}
                      </a>
                    </div>
                  )}
                  {lead.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{lead.phone}</span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={SOURCE_COLORS[lead.source] || ""}>
                      {SOURCE_LABELS[lead.source] || lead.source || "Outro"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{formatDate(lead.created_at)}</span>
                  </div>

                  {/* Score */}
                  <div className="flex items-center gap-1">
                    <div className="w-8 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
                        style={{ width: `${lead.score || 50}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium">{lead.score || 50}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 mt-3 pt-3 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                    onClick={() => sendWhatsApp(lead)}
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    WhatsApp
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1">
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => deleteLead(lead.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}