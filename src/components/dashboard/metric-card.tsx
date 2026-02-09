"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ReactNode
  color: string
}

export function MetricCard({ title, value, change, icon, color }: MetricCardProps) {
  const getTrendIcon = () => {
    if (!change) return <Minus className="h-4 w-4 text-gray-400" />
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />
    return <TrendingDown className="h-4 w-4 text-red-600" />
  }

  const getTrendColor = () => {
    if (!change) return "text-gray-600"
    return change > 0 ? "text-green-600" : "text-red-600"
  }

  return (
    <Card className={cn("border-l-4 transition-all hover:shadow-lg", color)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className={cn("p-2 rounded-lg", color.replace('border-l-', 'bg-').replace('-500', '-100'))}>
            {icon}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-3xl font-bold">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1">
              {getTrendIcon()}
              <span className={cn("text-sm font-medium", getTrendColor())}>
                {change > 0 ? '+' : ''}{change}% vs mês anterior
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
