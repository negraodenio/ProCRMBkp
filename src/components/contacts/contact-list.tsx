"use client";

import { useState, useEffect } from "react";
import { Plus, Search, MoreHorizontal, Phone, Mail, Edit, Trash2, User, Building2, Loader2 } from "lucide-react";
import Select from "react-select";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { useProfile } from "@/hooks/use-profile";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  company_id: string | null;
  contact_companies?: { companies: { id: string, name: string } }[] | null;
  avatar_url: string | null;
  type: string | null;
  status: string | null;
}

interface ContactListProps {
  contacts: Contact[];
}

export function ContactList({ contacts: initialContacts }: ContactListProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [open, setOpen] = useState(false);
  const { profile } = useProfile();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    companyIds: [] as string[],
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [availableCompanies, setAvailableCompanies] = useState<{ id: string, name: string }[]>([]);

  useEffect(() => {
    setContacts(initialContacts);
  }, [initialContacts]);

  useEffect(() => {
    async function fetchCompanies() {
      if (!profile?.organization_id) return;
      const { data } = await supabase
        .from('companies')
        .select('id, name')
        .eq('organization_id', profile.organization_id)
        .order('name');
      if (data) setAvailableCompanies(data);
    }
    fetchCompanies();
  }, [profile?.organization_id]);

  const filteredContacts = contacts.filter(contact => {
    const searchLower = searchTerm.toLowerCase();
    const companyNamesMatch = contact.contact_companies?.some(
      cc => cc.companies?.name.toLowerCase().includes(searchLower)
    );

    return (
      (contact.name?.toLowerCase() || "").includes(searchLower) ||
      companyNamesMatch ||
      (contact.company?.toLowerCase() || "").includes(searchLower) ||
      (contact.email?.toLowerCase() || "").includes(searchLower)
    );
  });

  const resetForm = () => {
    setFormData({ name: "", email: "", phone: "", companyIds: [] });
    setEditingId(null);
  };

  const handleEdit = (contact: Contact) => {
    setFormData({
      name: contact.name || "",
      email: contact.email || "",
      phone: contact.phone || "",
      companyIds: contact.contact_companies?.map(cc => cc.companies?.id).filter(Boolean) as string[] || [],
    });
    setEditingId(contact.id);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("contacts").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir contato");
    } else {
      toast.success("Contato excluído");
      setContacts(prev => prev.filter(c => c.id !== id));
      router.refresh();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.organization_id) {
      toast.error("Organização não encontrada");
      return;
    }

    setLoading(true);
    try {
      let contactId = editingId;

      if (editingId) {
        const { error } = await supabase
          .from("contacts")
          .update({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
          })
          .eq("id", editingId);

        if (error) throw error;
        toast.success("Contato atualizado!");
      } else {
        const { data: newContact, error } = await supabase
          .from("contacts")
          .insert({
            organization_id: profile.organization_id,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            type: "customer",
          })
          .select()
          .single();

        if (error) throw error;
        contactId = newContact.id;
        toast.success("Contato criado!");
      }

      // 2. Handle Many-to-Many Companies
      if (contactId) {
        // First delete existing relations
        await supabase
          .from("contact_companies")
          .delete()
          .eq("contact_id", contactId);

        // Then insert new ones
        if (formData.companyIds.length > 0) {
          const companiesToInsert = formData.companyIds.map(companyId => ({
            contact_id: contactId,
            company_id: companyId,
            organization_id: profile.organization_id,
            is_primary: true
          }));

          const { error: relationError } = await supabase
            .from("contact_companies")
            .insert(companiesToInsert);

          if (relationError) throw relationError;
        }
      }

      setOpen(false);
      resetForm();
      router.refresh();

      // Local update for immediate feedback
      const { data: updatedData } = await supabase
        .from('contacts')
        .select('*, contact_companies(companies(name))')
        .eq('organization_id', profile.organization_id)
        .order('name', { ascending: true });

      if (updatedData) setContacts(updatedData);

    } catch (error: any) {
      console.error("Error saving contact:", error);
      toast.error("Erro ao salvar contato: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contatos</h1>
          <p className="text-muted-foreground">Gerencie seus leads e clientes em um só lugar</p>
        </div>

        <Dialog open={open && !editingId} onOpenChange={(val) => {
          if(!val) resetForm();
          setOpen(val);
        }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => { resetForm(); setOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Contato
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Contato" : "Novo Contato"}</DialogTitle>
              <DialogDescription>
                Preencha os dados básicos do seu contato.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
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
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Empresas</Label>
                <Select
                  isMulti
                  name="companies"
                  options={availableCompanies.map(c => ({ value: c.id, label: c.name }))}
                  className="basic-multi-select"
                  classNamePrefix="select"
                  placeholder="Selecione as empresas..."
                  value={availableCompanies
                    .filter(c => formData.companyIds.includes(c.id))
                    .map(c => ({ value: c.id, label: c.name }))}
                  onChange={(selected) =>
                    setFormData({ ...formData, companyIds: selected.map(s => s.value) })
                  }
                  noOptionsMessage={() => "Nenhuma empresa encontrada"}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingId ? "Salvar Alterações" : "Criar Contato"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={open && !!editingId} onOpenChange={(val) => {
          if(!val) resetForm();
          setOpen(val);
        }}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Editar Contato</DialogTitle>
              <DialogDescription>
                Atualize os dados básicos do seu contato.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Telefone</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-company">Empresas</Label>
                <Select
                  isMulti
                  name="edit-companies"
                  options={availableCompanies.map(c => ({ value: c.id, label: c.name }))}
                  className="basic-multi-select"
                  classNamePrefix="select"
                  placeholder="Selecione as empresas..."
                  value={availableCompanies
                    .filter(c => formData.companyIds.includes(c.id))
                    .map(c => ({ value: c.id, label: c.name }))}
                  onChange={(selected) =>
                    setFormData({ ...formData, companyIds: selected.map(s => s.value) })
                  }
                  noOptionsMessage={() => "Nenhuma empresa encontrada"}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar Alterações
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 md:w-1/3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar contatos..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contato</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={contact.avatar_url || ''} alt={contact.name} />
                      <AvatarFallback>
                        {contact.name?.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() || <User />}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{contact.name}</div>
                      <div className="text-[10px] uppercase font-bold text-muted-foreground">{contact.type || 'CLIENTE'}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {contact.contact_companies && contact.contact_companies.length > 0 ? (
                      contact.contact_companies.map((cc, idx) => (
                        <Badge key={idx} variant="outline" className="text-blue-600 border-blue-200">
                          {cc.companies.name}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground italic">{contact.company || '-'}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {contact.email || '-'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {contact.phone || '-'}
                  </div>
                </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(contact)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <ConfirmDialog
                          title="Excluir Contato"
                          description="Tem certeza que deseja excluir este contato? Esta ação não pode ser desfeita."
                          confirmLabel="Excluir"
                          onConfirm={() => handleDelete(contact.id)}
                          trigger={
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                              onSelect={(e) => e.preventDefault()}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          }
                        />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
              </TableRow>
            ))}
            {filteredContacts.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhum contato encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
