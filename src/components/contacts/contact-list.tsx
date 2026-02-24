"use client";

import { useState, useEffect } from "react";
import { Plus, Search, MoreHorizontal, Phone, Mail, Edit, Trash2, User, Building2, Loader2 } from "lucide-react";
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

export interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  company_id: string | null;
  companies?: { name: string } | null;
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
    company: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setContacts(initialContacts);
  }, [initialContacts]);

  const filteredContacts = contacts.filter(contact =>
    (contact.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (contact.companies?.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (contact.company?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (contact.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({ name: "", email: "", phone: "", company: "" });
    setEditingId(null);
  };

  const handleEdit = (contact: Contact) => {
    setFormData({
      name: contact.name || "",
      email: contact.email || "",
      phone: contact.phone || "",
      company: contact.company || "",
    });
    setEditingId(contact.id);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este contato?")) return;

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
      if (editingId) {
        const { error } = await supabase
          .from("contacts")
          .update({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            company: formData.company,
          })
          .eq("id", editingId);

        if (error) throw error;
        toast.success("Contato atualizado!");
      } else {
        const { error } = await supabase
          .from("contacts")
          .insert({
            organization_id: profile.organization_id,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            company: formData.company,
            type: "customer",
          });

        if (error) throw error;
        toast.success("Contato criado!");
      }

      setOpen(false);
      resetForm();
      router.refresh();

      // Local update for immediate feedback
      const { data: updatedData } = await supabase
        .from('contacts')
        .select('*, companies(name)')
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

        <Dialog open={open} onOpenChange={(val) => { if(!val) resetForm(); setOpen(val); }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
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
                <Label htmlFor="company">Empresa</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
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
                      <div className="font-medium text-slate-800">{contact.name}</div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">{contact.type || 'CLIENTE'}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {contact.companies?.name ? (
                    <Badge variant="outline" className="text-blue-600 border-blue-200">
                      {contact.companies.name}
                    </Badge>
                  ) : (
                    <span className="text-slate-400 italic">{contact.company || '-'}</span>
                  )}
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
                      <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(contact.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
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
