"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Target, TrendingUp, Clock, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface ClosePredictionProps {
  probability: number
  estimatedDays?: number
  factors?: {
    score: number
    engagement: number
    stage: number
    qualified: boolean
  }
}

export function ClosePrediction({ probability, estimatedDays, factors }: ClosePredictionProps) {
  const getColor = (prob: number) => {
    if (prob >= 70) return { bg: 'bg-green-50', border: 'border-green-500', text: 'text-green-600' }
    if (prob >= 40) return { bg: 'bg-orange-50', border: 'border-orange-500', text: 'text-orange-600' }
    return { bg: 'bg-red-50', border: 'border-red-500', text: 'text-red-600' }
  }

  const colors = getColor(probability)

  return (
    <Card className={cn("border-l-4", colors.border, colors.bg)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Previsão de Fechamento</CardTitle>
          <Target className={cn("h-5 w-5", colors.text)} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Probabilidade */}
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-sm text-muted-foreground">Probabilidade</span>
            <span className={cn("text-3xl font-bold", colors.text)}>
              {probability}%
            </span>
          </div>
          <Progress value={probability} className="h-2" />
        </div>

        {/* Estimativa de Tempo */}
        {estimatedDays && (
          <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Estimativa de Fechamento</p>
              <p className="text-xs text-muted-foreground">
                {estimatedDays} dias
              </p>
            </div>
          </div>
        )}

        {/* Fatores */}
        {factors && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">Fatores Considerados</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-white rounded border">
                <div className="flex items-center gap-1 mb-1">
                  <Zap className="h-3 w-3 text-purple-600" />
                  <span className="text-xs font-medium">Score</span>
                </div>
                <p className="text-sm font-bold">{factors.score}/100</p>
              </div>
              <div className="p-2 bg-white rounded border">
                <div className="flex items-center gap-1 mb-1">
                  <TrendingUp className="h-3 w-3 text-blue-600" />
                  <span className="text-xs font-medium">Engajamento</span>
                </div>
                <p className="text-sm font-bold">{factors.engagement}%</p>
              </div>
              <div className="p-2 bg-white rounded border">
                <div className="flex items-center gap-1 mb-1">
                  <Target className="h-3 w-3 text-green-600" />
                  <span className="text-xs font-medium">Etapa</span>
                </div>
                <p className="text-sm font-bold">{factors.stage}%</p>
              </div>
              <div className="p-2 bg-white rounded border">
                <div className="flex items-center gap-1 mb-1">
                  <Badge variant={factors.qualified ? "default" : "outline"} className="h-4 text-xs">
                    {factors.qualified ? "Qualificado" : "Não Qualificado"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recomendação */}
        <div className="pt-3 border-t">
          <p className="text-xs font-semibold text-muted-foreground mb-1">Recomendação</p>
          <p className="text-sm">
            {probability >= 70 && "Priorize este lead! Alta chance de conversão."}
            {probability >= 40 && probability < 70 && "Continue o follow-up. Chance moderada."}
            {probability < 40 && "Requalifique ou reavalie a abordagem."}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
