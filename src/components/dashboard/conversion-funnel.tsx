"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingDown } from "lucide-react"

interface FunnelStage {
  name: string
  count: number
  percentage: number
  color: string
}

interface ConversionFunnelProps {
  stages: FunnelStage[]
}

export function ConversionFunnel({ stages }: ConversionFunnelProps) {
  const maxCount = stages[0]?.count || 1

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Funil de Conversão</CardTitle>
          <TrendingDown className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stages.map((stage, index) => {
            const width = (stage.count / maxCount) * 100
            const dropoff = index > 0
              ? ((stages[index - 1].count - stage.count) / stages[index - 1].count) * 100
              : 0

            return (
              <div key={stage.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{stage.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">{stage.count} leads</span>
                    {index > 0 && dropoff > 0 && (
                      <span className="text-xs text-red-600">
                        -{dropoff.toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="relative h-12 bg-gray-100 rounded-lg overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 flex items-center justify-center font-semibold text-white transition-all"
                    style={{
                      width: `${width}%`,
                      backgroundColor: stage.color,
                      minWidth: stage.count > 0 ? '60px' : '0'
                    }}
                  >
                    {stage.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Taxa de Conversão Total */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Taxa de Conversão Total</span>
            <span className="text-2xl font-bold text-green-600">
              {stages.length > 0
                ? ((stages[stages.length - 1].count / stages[0].count) * 100).toFixed(1)
                : 0}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            De {stages[0]?.count || 0} leads iniciais para {stages[stages.length - 1]?.count || 0} fechados
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
