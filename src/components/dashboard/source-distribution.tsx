"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

const COLORS = {
  whatsapp: '#10b981',
  instagram: '#ec4899',
  website: '#3b82f6',
  referral: '#8b5cf6',
  other: '#6b7280'
}

const LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  website: 'Site',
  referral: 'Indicação',
  other: 'Outro'
}

interface SourceDistributionProps {
  data: Record<string, number>
}

export function SourceDistribution({ data }: SourceDistributionProps) {
  const chartData = Object.entries(data).map(([key, value]) => ({
    name: LABELS[key] || key,
    value,
    color: COLORS[key as keyof typeof COLORS] || COLORS.other
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Leads por Origem</CardTitle>
        <p className="text-sm text-muted-foreground">Saiba de onde vêm seus leads (WhatsApp, Site, Redes Sociais).</p>
      </CardHeader>
      <CardContent>
        {Object.keys(data).length === 0 || Object.values(data).every(v => v === 0) ? (
            <div className="h-[300px] flex flex-col items-center justify-center text-center p-4 border-2 border-dashed border-slate-100 rounded-lg">
                <p className="text-sm text-muted-foreground font-medium">Sem dados de origem ainda.</p>
                <p className="text-xs text-slate-400 mt-1">Conecte o WhatsApp para começar a rastrear.</p>
            </div>
        ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
