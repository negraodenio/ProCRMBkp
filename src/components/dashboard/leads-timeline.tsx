"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface LeadsTimelineProps {
  data: Array<{
    date: string
    new: number
    qualified: number
  }>
}

export function LeadsTimeline({ data }: LeadsTimelineProps) {
  const formattedData = data.map(item => ({
    ...item,
    dateLabel: format(new Date(item.date), 'dd/MM', { locale: ptBR })
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Evolução de Leads (Últimos 30 dias)</CardTitle>
        <p className="text-sm text-muted-foreground">Acompanhe a entrada de novos leads e qualificações ao longo do tempo.</p>
      </CardHeader>
      <CardContent>
        {data.length === 0 || data.every(d => d.new === 0 && d.qualified === 0) ? (
             <div className="h-[300px] flex flex-col items-center justify-center text-center p-4 border-2 border-dashed border-slate-100 rounded-lg">
                <p className="text-sm text-muted-foreground font-medium">Nenhum histórico de leads.</p>
                <p className="text-xs text-slate-400 mt-1">Os dados aparecerão aqui conforme novos leads entrarem.</p>
            </div>
        ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="dateLabel" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="new"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Novos"
              dot={{ fill: '#3b82f6' }}
            />
            <Line
              type="monotone"
              dataKey="qualified"
              stroke="#10b981"
              strokeWidth={2}
              name="Qualificados"
              dot={{ fill: '#10b981' }}
            />
          </LineChart>
        </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
