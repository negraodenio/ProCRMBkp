"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface AISummaryProps {
  summary: {
    summary: string
    key_points: string[]
    sentiment: 'positive' | 'neutral' | 'negative'
    next_action: string
    confidence_score: number
    generated_at: string
    messages_analyzed: number
  } | null
  onRegenerate?: () => void
}

export function AISummary({ summary, onRegenerate }: AISummaryProps) {
  if (!summary) {
    return (
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardContent className="p-6 text-center">
          <Sparkles className="h-12 w-12 text-purple-400 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Nenhum resumo gerado ainda. Adicione conversas para gerar insights com IA.
          </p>
        </CardContent>
      </Card>
    )
  }

  const sentimentConfig = {
    positive: {
      color: 'text-green-600',
      bg: 'bg-green-100',
      icon: CheckCircle2,
      label: 'Positivo'
    },
    neutral: {
      color: 'text-gray-600',
      bg: 'bg-gray-100',
      icon: AlertCircle,
      label: 'Neutro'
    },
    negative: {
      color: 'text-red-600',
      bg: 'bg-red-100',
      icon: AlertCircle,
      label: 'Negativo'
    }
  }

  const config = sentimentConfig[summary.sentiment]
  const SentimentIcon = config.icon

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Sparkles className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Resumo por IA</CardTitle>
              <p className="text-xs text-muted-foreground">
                {summary.messages_analyzed} mensagens analisadas
              </p>
            </div>
          </div>
          <Badge variant="outline" className="gap-1">
            <TrendingUp className="h-3 w-3" />
            {Math.round(summary.confidence_score * 100)}% confiança
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Resumo */}
        <div>
          <p className="text-sm leading-relaxed">{summary.summary}</p>
        </div>

        {/* Pontos-chave */}
        {summary.key_points && summary.key_points.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-2">
              Pontos-chave
            </h4>
            <ul className="space-y-1">
              {summary.key_points.map((point, index) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Sentimento e Próxima Ação */}
        <div className="flex items-center gap-3 pt-3 border-t">
          <div className="flex items-center gap-2">
            <div className={cn("p-1.5 rounded-full", config.bg)}>
              <SentimentIcon className={cn("h-4 w-4", config.color)} />
            </div>
            <span className="text-sm font-medium">{config.label}</span>
          </div>
          <div className="flex-1" />
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Próxima ação</p>
            <p className="text-sm font-medium text-purple-700">{summary.next_action}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
