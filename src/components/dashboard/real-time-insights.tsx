"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, TrendingUp, Clock, DollarSign } from "lucide-react"
import Link from "next/link"

interface RealTimeInsightsProps {
  hotLeads: number
  coldLeads: number
  closingDeals: number
  revenueAtRisk: number
}

export function RealTimeInsights({ hotLeads, coldLeads, closingDeals, revenueAtRisk }: RealTimeInsightsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
          Insights em Tempo Real
        </CardTitle>
        <p className="text-sm text-muted-foreground">Alertas e oportunidades que requerem sua atenção imediata.</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Leads Quentes */}
        <Link href="/leads?filter=hot">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Leads Quentes</p>
                <p className="text-xs text-muted-foreground">Score &gt; 70</p>
              </div>
            </div>
            <Badge className="bg-green-600">{hotLeads}</Badge>
          </div>
        </Link>

        {/* Leads Frios */}
        {coldLeads > 0 && (
          <Link href="/leads?filter=cold">
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded">
                  <Clock className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Sem Contato</p>
                  <p className="text-xs text-muted-foreground">Há 3+ dias</p>
                </div>
              </div>
              <Badge variant="outline" className="border-orange-600 text-orange-600">{coldLeads}</Badge>
            </div>
          </Link>
        )}

        {/* Deals Próximos de Fechar */}
        {closingDeals > 0 && (
          <Link href="/pipeline">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Em Negociação</p>
                  <p className="text-xs text-muted-foreground">Prestes a fechar</p>
                </div>
              </div>
              <Badge className="bg-blue-600">{closingDeals}</Badge>
            </div>
          </Link>
        )}

        {/* Receita em Risco */}
        {revenueAtRisk > 0 && (
          <Link href="/pipeline">
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded">
                  <DollarSign className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Receita em Negociação</p>
                  <p className="text-xs text-muted-foreground">Valor total</p>
                </div>
              </div>
              <span className="text-sm font-bold text-purple-600">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(revenueAtRisk)}
              </span>
            </div>
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
