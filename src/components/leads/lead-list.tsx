"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Phone, Mail, MessageCircle, Edit, Trash2, User, Building2, Sparkles, Send, Loader2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { sendIntegratedWhatsAppMessage } from "@/app/whatsapp/messages/actions";
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
import { cn, formatPhoneNumber } from "@/lib/utils";

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
  const router = useRouter();
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

  // Edit Lead State
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);

  // Integrated WhatsApp State
  const [selectedLeadForWhatsApp, setSelectedLeadForWhatsApp] = useState<Lead | null>(null);
  const [waMessage, setWaMessage] = useState("");
  const [isSendingWA, setIsSendingWA] = useState(false);

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const ITEMS_PER_PAGE = 20;

  const supabase = createClient();

  useEffect(() => {
    if (profile) {
        setPage(0);
        setLeads([]);
        loadLeads(0, true);
    }
  }, [profile]);

  async function loadLeads(pageNumber: number, isInitial: boolean = false) {
    if (!profile?.organization_id) return;

    if (isInitial) setLoading(true);
    else setLoadingMore(true);

    const from = pageNumber * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .eq("type", "lead")
      .eq("organization_id", profile.organization_id)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Error loading leads:", error);
      toast.error("Erro ao carregar leads");
    } else {
      if (isInitial) {
          setLeads(data || []);
      } else {
          setLeads(prev => [...prev, ...(data || [])]);
      }
      setHasMore(data?.length === ITEMS_PER_PAGE);
    }

    setLoading(false);
    setLoadingMore(false);
  }

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadLeads(nextPage);
  };

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

    // Edit mode
    if (editingLeadId) {
      const { error } = await supabase
        .from("contacts")
        .update({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          source: formData.source,
        })
        .eq("id", editingLeadId);

      if (error) {
        console.error("Error updating lead:", error);
        toast.error("Erro ao atualizar lead");
        return;
      }

      toast.success("Lead atualizado!");
      resetForm();
      setOpen(false);
      setEditingLeadId(null);
      loadLeads(0, true);
      return;
    }

    // Create mode (existing logic)
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

  function handleEditLead(lead: Lead) {
    setFormData({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      source: lead.source,
    });
    setEditingLeadId(lead.id);
    setOpen(true);
  }

  function resetForm() {
    setFormData({ name: "", email: "", phone: "", company: "", source: "whatsapp" });
    setEditingLeadId(null);
  }

  async function deleteLead(id: string) {
    if (!confirm("Tem certeza que deseja excluir este lead?")) return;

    const { error } = await supabase.from("contacts").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir lead");
    } else {
      toast.success("Lead excluído!");
      loadLeads(0, true);
    }
  }

  async function sendWhatsApp(lead: Lead) {
    setSelectedLeadForWhatsApp(lead);
    setWaMessage("");
  }

  const handleSendWhatsApp = async () => {
    if (!selectedLeadForWhatsApp || !waMessage.trim()) return;
    setIsSendingWA(true);
    try {
        const res = await sendIntegratedWhatsAppMessage(selectedLeadForWhatsApp.phone, waMessage);
        if (res.success) {
            toast.success("Mensagem enviada via CRM!");
            setSelectedLeadForWhatsApp(null);
            setWaMessage("");
        } else {
            toast.error("Erro via API: " + res.error);
            if (confirm("Deseja tentar enviar manualmente pelo WhatsApp Web?")) {
                const phone = selectedLeadForWhatsApp.phone.replace(/\D/g, "");
                window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(waMessage)}`, "_blank");
            }
        }
    } catch (e) {
        toast.error("Erro inesperado ao enviar mensagem.");
    } finally {
        setIsSendingWA(false);
    }
  };

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
              <DialogTitle>{editingLeadId ? "Editar Lead" : "Novo Lead"}</DialogTitle>
              <DialogDescription>
                {editingLeadId ? "Atualize as informações do lead." : "Adicione um novo lead manualmente."}
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
                  {editingLeadId ? "Salvar Alterações" : "Criar Lead"}
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
                      <span>{formatPhoneNumber(lead.phone)}</span>
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
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          lead.score >= 70 ? "bg-orange-500" :
                          lead.score >= 40 ? "bg-yellow-500" :
                          "bg-blue-500"
                        )}
                        style={{ width: `${lead.score || 0}%` }}
                      />
                    </div>
                    <span className={cn(
                      "text-[10px] font-bold",
                      lead.score >= 70 ? "text-orange-600" :
                      lead.score >= 40 ? "text-yellow-600" :
                      "text-blue-600"
                    )}>
                      {lead.score || 0}
                    </span>
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

                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                    onClick={() => router.push(`/leads/qualification?leadId=${lead.id}`)}
                  >
                    <Sparkles className="h-4 w-4 mr-1" />
                    Qualificar
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEditLead(lead)}
                  >
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

      {hasMore && !loading && (
        <div className="flex justify-center pt-8 pb-12">
            <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="min-w-[200px]"
            >
                {loadingMore ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Carregando mais...
                    </>
                ) : "Carregar Mais Leads"}
            </Button>
        </div>
      )}

      {/* Integrated WhatsApp Modal */}
      <Dialog open={!!selectedLeadForWhatsApp} onOpenChange={(open) => !open && setSelectedLeadForWhatsApp(null)}>
          <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                      <div className="p-2 bg-green-100 rounded-full">
                          <MessageCircle className="h-5 w-5 text-green-600" />
                      </div>
                      Mensagem para {selectedLeadForWhatsApp?.name}
                  </DialogTitle>
                  <DialogDescription>
                      Envie uma mensagem direta via CRM usando sua conta conectada.
                  </DialogDescription>
              </DialogHeader>

              <div className="py-4 space-y-4">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone className="h-4 w-4" />
                          {formatPhoneNumber(selectedLeadForWhatsApp?.phone || "")}
                      </div>
                      <Badge variant="outline" className="text-[10px] bg-white">VIA EVOLUTION API</Badge>
                  </div>

                  <div className="space-y-2">
                      <Label htmlFor="wa-message" className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                          Conteúdo da Mensagem
                      </Label>
                      <Textarea
                          id="wa-message"
                          placeholder="Eai, tudo bem? Vi seu interesse em..."
                          className="min-h-[120px]"
                          value={waMessage}
                          onChange={(e) => setWaMessage(e.target.value)}
                      />
                  </div>
              </div>

              <DialogFooter>
                  <Button
                      variant="ghost"
                      onClick={() => {
                          const phone = selectedLeadForWhatsApp?.phone.replace(/\D/g, "");
                          window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(waMessage)}`, "_blank");
                      }}
                  >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Link Externo
                  </Button>
                  <Button
                      onClick={handleSendWhatsApp}
                      disabled={isSendingWA || !waMessage.trim()}
                  >
                      {isSendingWA ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                      Enviar
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
}
