"use client"

import { useState } from "react"
import { ConversationItem } from "./conversation-item"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { addNote } from "@/app/leads/[id]/actions"

interface ConversationTimelineProps {
  contactId: string
  organizationId: string
  conversations: Array<{
    id: string
    type: 'whatsapp' | 'note' | 'email' | 'call' | 'meeting' | 'system'
    direction?: 'inbound' | 'outbound' | 'internal'
    content: string
    created_at: string
    metadata?: any
  }>
  onRefresh?: () => void
}

export function ConversationTimeline({
  contactId,
  organizationId,
  conversations,
  onRefresh
}: ConversationTimelineProps) {
  const [open, setOpen] = useState(false)
  const [noteContent, setNoteContent] = useState("")
  const [loading, setLoading] = useState(false)

  const handleAddNote = async () => {
    if (!noteContent.trim()) {
      toast.error("Digite uma nota")
      return
    }

    setLoading(true)
    try {
      await addNote(contactId, noteContent, organizationId)
      toast.success("Nota adicionada!")
      setNoteContent("")
      setOpen(false)
      onRefresh?.()
    } catch (error) {
      toast.error("Erro ao adicionar nota")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header com botão de adicionar nota */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Histórico de Conversas</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Nota
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Nota</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="Digite sua nota aqui..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                rows={5}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddNote} disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Salvar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Timeline */}
      {conversations.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>Nenhuma conversa registrada ainda.</p>
          <p className="text-sm mt-1">Adicione uma nota ou inicie uma conversa no WhatsApp.</p>
        </div>
      ) : (
        <div className="relative border-l-2 border-gray-200 pl-8 space-y-6">
          {conversations.map((conv) => (
            <ConversationItem key={conv.id} data={conv} />
          ))}
        </div>
      )}
    </div>
  )
}
