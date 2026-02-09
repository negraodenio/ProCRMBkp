"use client"

import { MessageCircle, Phone, Mail, FileText, User, Clock } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface ConversationItemProps {
  data: {
    id: string
    type: 'whatsapp' | 'note' | 'email' | 'call' | 'meeting' | 'system'
    direction?: 'inbound' | 'outbound' | 'internal'
    content: string
    created_at: string
    metadata?: any
  }
}

const typeConfig = {
  whatsapp: {
    icon: MessageCircle,
    label: 'WhatsApp',
    color: 'text-green-600',
    bg: 'bg-green-100'
  },
  note: {
    icon: FileText,
    label: 'Nota',
    color: 'text-blue-600',
    bg: 'bg-blue-100'
  },
  email: {
    icon: Mail,
    label: 'Email',
    color: 'text-purple-600',
    bg: 'bg-purple-100'
  },
  call: {
    icon: Phone,
    label: 'Ligação',
    color: 'text-orange-600',
    bg: 'bg-orange-100'
  },
  meeting: {
    icon: User,
    label: 'Reunião',
    color: 'text-pink-600',
    bg: 'bg-pink-100'
  },
  system: {
    icon: Clock,
    label: 'Sistema',
    color: 'text-gray-600',
    bg: 'bg-gray-100'
  }
}

export function ConversationItem({ data }: ConversationItemProps) {
  const config = typeConfig[data.type]
  const Icon = config.icon

  const isInbound = data.direction === 'inbound'
  const isInternal = data.direction === 'internal'

  return (
    <div className="relative">
      {/* Timeline dot */}
      <div className={cn(
        "absolute -left-[25px] top-2 w-3 h-3 rounded-full border-2 border-white",
        config.bg
      )} />

      {/* Content */}
      <div className={cn(
        "p-4 rounded-lg border transition-all hover:shadow-md",
        isInbound && "bg-blue-50 border-blue-200",
        isInternal && "bg-gray-50 border-gray-200",
        !isInbound && !isInternal && "bg-white border-gray-200"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={cn("p-1.5 rounded-lg", config.bg)}>
              <Icon className={cn("h-4 w-4", config.color)} />
            </div>
            <span className="text-sm font-medium">{config.label}</span>
            {data.direction && (
              <span className="text-xs text-muted-foreground">
                {data.direction === 'inbound' && '← Recebida'}
                {data.direction === 'outbound' && '→ Enviada'}
                {data.direction === 'internal' && '📝 Interna'}
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {format(new Date(data.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </span>
        </div>

        {/* Content */}
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {data.content}
        </div>

        {/* Metadata */}
        {data.metadata && Object.keys(data.metadata).length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {Object.entries(data.metadata).map(([key, value]) => (
                <span key={key} className="text-xs text-muted-foreground">
                  <strong>{key}:</strong> {String(value)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
