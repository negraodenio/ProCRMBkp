"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, AlertTriangle, Info, X, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface SmartAlertsProps {
  alerts: Array<{
    id: string
    type: string
    title: string
    description: string
    severity: 'info' | 'warning' | 'critical'
    contact_id?: string
    deal_id?: string
    metadata?: any
    created_at: string
  }>
  onDismiss?: (alertId: string) => void
}

const severityConfig = {
  info: {
    icon: Info,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200'
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200'
  },
  critical: {
    icon: AlertCircle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200'
  }
}

export function SmartAlerts({ alerts, onDismiss }: SmartAlertsProps) {
  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Alertas Inteligentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Info className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Nenhum alerta no momento</p>
            <p className="text-sm mt-1">Tudo sob controle! 🎉</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Alertas Inteligentes</CardTitle>
          <Badge variant="outline">{alerts.length} ativo{alerts.length > 1 ? 's' : ''}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => {
          const config = severityConfig[alert.severity]
          const Icon = config.icon

          return (
            <div
              key={alert.id}
              className={cn(
                "p-4 rounded-lg border transition-all hover:shadow-md",
                config.bg,
                config.border
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn("p-2 rounded-lg bg-white/50")}>
                  <Icon className={cn("h-5 w-5", config.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-sm">{alert.title}</h4>
                      {alert.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {alert.description}
                        </p>
                      )}
                    </div>
                    {onDismiss && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => onDismiss(alert.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {(alert.contact_id || alert.deal_id) && (
                    <div className="mt-3 flex gap-2">
                      {alert.contact_id && (
                        <Link href={`/leads/${alert.contact_id}`}>
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                            Ver Lead
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </Link>
                      )}
                      {alert.deal_id && (
                        <Link href={`/pipeline`}>
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                            Ver Pipeline
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
