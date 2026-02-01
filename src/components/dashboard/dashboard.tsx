"use client";

import { useState } from "react";
import {
  Users,
  TrendingUp,
  DollarSign,
  Target,
  Clock,
  Activity,
  PieChart,
  Zap,
  CalendarDays,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KPICard } from "./kpi-card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// Mock Data - Replace with Supabase queries
const primaryMetrics = [
  {
    title: "Leads Este Mês",
    value: "47",
    trend: 23,
    description: "vs mês anterior",
    icon: Users,
    variant: "primary" as const,
  },
  {
    title: "Taxa de Conversão",
    value: "12.5%",
    trend: -2,
    description: "Meta: 15%",
    icon: TrendingUp,
    variant: "success" as const,
    progress: 83,
  },
  {
    title: "Valor Pipeline",
    value: "R$ 125.000",
    trend: 15,
    description: "8 deals ativos",
    icon: DollarSign,
    variant: "primary" as const,
  },
  {
    title: "Ticket Médio",
    value: "R$ 8.500",
    trend: 0,
    description: "0 vendas fechadas",
    icon: Target,
    variant: "warning" as const,
  },
];

const secondaryMetrics = [
  {
    title: "Leads Hoje",
    value: "3",
    description: "Captação diária",
    icon: Zap,
    variant: "default" as const,
  },
  {
    title: "Taxa Qualificação",
    value: "45%",
    description: "de leads qualificados",
    icon: PieChart,
    variant: "default" as const,
  },
  {
    title: "Atividades Semana",
    value: "12",
    description: "Interações registradas",
    icon: Activity,
    variant: "default" as const,
  },
  {
    title: "Tempo Resposta",
    value: "2.5h",
    description: "Média de atendimento",
    icon: Clock,
    variant: "default" as const,
  },
];

const funnelData = [
  { name: "Leads Totais", value: 47, fill: "#3B82F6" },
  { name: "Qualificados", value: 28, fill: "#22C55E" },
  { name: "Propostas", value: 15, fill: "#F59E0B" },
  { name: "Negociação", value: 8, fill: "#8B5CF6" },
  { name: "Fechados", value: 3, fill: "#10B981" },
];

export function Dashboard() {
  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground capitalize">{today}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <CalendarDays className="mr-2 h-4 w-4" />
            Últimos 30 dias
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filtrar
          </Button>
        </div>
      </div>

      {/* Primary KPIs - Row 1 */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {primaryMetrics.map((metric, index) => (
          <KPICard
            key={index}
            title={metric.title}
            value={metric.value}
            trend={metric.trend}
            description={metric.description}
            icon={metric.icon}
            variant={metric.variant}
            progress={metric.progress}
          />
        ))}
      </div>

      {/* Secondary KPIs - Row 2 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {secondaryMetrics.map((metric, index) => (
          <KPICard
            key={index}
            title={metric.title}
            value={metric.value}
            description={metric.description}
            icon={metric.icon}
            variant={metric.variant}
            size="compact"
          />
        ))}
      </div>

      {/* Funnel Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            Funil de Vendas
          </CardTitle>
          <Button variant="ghost" size="sm">
            Ver detalhes →
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {funnelData.map((item, index) => {
              const maxValue = funnelData[0].value;
              const percentage = Math.round((item.value / maxValue) * 100);
              return (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="font-medium">{item.value}</span>
                  </div>
                  <div className="h-6 w-full bg-slate-100 rounded overflow-hidden">
                    <div
                      className="h-full rounded transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: item.fill,
                      }}
                    />
                  </div>
                </div>
              );
            })}
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground">
                Taxa de Conversão Geral:{" "}
                <span className="font-bold text-foreground">
                  {((funnelData[4].value / funnelData[0].value) * 100).toFixed(1)}%
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}