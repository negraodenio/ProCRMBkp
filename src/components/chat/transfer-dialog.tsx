"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Search, Users, Building2, MessageSquare, Loader2 } from "lucide-react";
import { getTransferData, transferConversation } from "@/app/chat/actions";
import { toast } from "sonner";

interface TransferDialogProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  onSuccess?: () => void;
}

export function TransferDialog({ isOpen, onClose, conversationId, onSuccess }: TransferDialogProps) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedDeptId, setSelectedDeptId] = useState<string>("");
  const [internalNote, setInternalNote] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    const data = await getTransferData();
    if (data.error) {
      toast.error(data.error);
    } else {
      setUsers(data.users || []);
      setDepartments(data.departments || []);
    }
    setLoading(false);
  };

  const handleTransfer = async () => {
    if (!selectedUserId && !selectedDeptId) {
      toast.error("Selecione um usuário ou setor para transferir");
      return;
    }

    setSubmitting(true);
    const result = await transferConversation(
      conversationId,
      selectedUserId || null,
      selectedDeptId || null,
      internalNote
    );

    if (result.success) {
      toast.success("Ticket transferido com sucesso!");
      onSuccess?.();
      onClose();
      // Reset
      setSelectedUserId("");
      setSelectedDeptId("");
      setInternalNote("");
    } else {
      toast.error(result.error);
    }
    setSubmitting(false);
  };

  const filteredUsers = users.filter(u =>
    u.full_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border shadow-2xl rounded-3xl p-0 overflow-hidden">
        <DialogHeader className="p-6 bg-muted/30 border-b">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Transferir Ticket
          </DialogTitle>
          <DialogDescription>
            Encaminhe esta conversa para outro atendente ou setor.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Carregando dados da equipe...</p>
            </div>
          ) : (
            <>
              {/* User Search & Select */}
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Users className="h-3 w-3" /> Buscar Usuário
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Digite o nome do atendente..."
                    className="pl-10 h-11 bg-muted/20 border-border focus:ring-primary/20"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger className="h-11 bg-muted/20 border-border">
                    <SelectValue placeholder="Selecione um atendente (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredUsers.map(u => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.full_name}
                      </SelectItem>
                    ))}
                    {filteredUsers.length === 0 && (
                      <p className="p-2 text-xs text-muted-foreground text-center">Nenhum usuário encontrado</p>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Department Select */}
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Building2 className="h-3 w-3" /> Transferir para Fila / Setor
                </Label>
                <Select value={selectedDeptId} onValueChange={setSelectedDeptId}>
                  <SelectTrigger className="h-11 bg-primary/5 border-primary/20 ring-1 ring-primary/10">
                    <SelectValue placeholder="Selecione um setor" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(d => (
                      <SelectItem key={d.id} value={d.id}>
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${d.color || 'bg-slate-400'}`} />
                          {d.name}
                        </div>
                      </SelectItem>
                    ))}
                    {departments.length === 0 && (
                      <p className="p-2 text-xs text-muted-foreground text-center">Nenhum setor cadastrado</p>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Internal Notes */}
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                   📝 Observações Internas
                </Label>
                <Textarea
                  placeholder="Mensagem interna para o próximo atendente (o cliente nío verá isso)"
                  className="min-h-[100px] bg-muted/10 border-border resize-none italic text-sm"
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter className="p-6 bg-muted/30 border-t flex flex-row gap-2 justify-end">
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            CANCELAR
          </Button>
          <Button
            className="bg-primary hover:bg-primary/90 text-white min-w-[140px] shadow-lg shadow-primary/20"
            onClick={handleTransfer}
            disabled={submitting || loading}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Transferindo...
              </>
            ) : "TRANSFERIR"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
