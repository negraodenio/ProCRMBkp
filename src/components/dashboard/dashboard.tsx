"use client";

import { useState, useEffect } from "react";
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


import { createClient } from "@/lib/supabase/client";
import { useProfile } from "@/hooks/use-profile";

export function Dashboard() {
  const { profile, loading: profileLoading } = useProfile();
  const [metrics, setMetrics] = useState<any[]>([]);
  const [secondaryStats, setSecondaryStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!profile?.organization_id) return;
      
      const supabase = createClient();
      
      // Fetch Counts for current Org
      const [leadsRes, dealsRes, convsRes] = await Promise.all([
        supabase.from('leads').select('*', { count: 'exact', head: true }).eq('organization_id', profile.organization_id),
        supabase.from('deals').select('amount', { count: 'exact' }).eq('organization_id', profile.organization_id),
        supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('organization_id', profile.organization_id)
      ]);

      const leadCount = leadsRes.count || 0;
      const pipelineValue = dealsRes.data?.reduce((acc, d) => acc + (d.amount || 0), 0) || 0;
      const convCount = dealsRes.count || 0;

      setMetrics([
        {
          title: "Leads Totais",
          value: leadCount.toString(),
          trend: 0,
          description: "No funil atual",
          icon: Users,
          variant: "primary" as const,
        },
        {
          title: "Taxa de Conversão",
          value: "0%",
          trend: 0,
          description: "Meta: 15%",
          icon: TrendingUp,
          variant: "success" as const,
          progress: 0,
        },
        {
          title: "Valor Pipeline",
          value: `R$ ${pipelineValue.toLocaleString('pt-BR')}`,
          trend: 0,
          description: `${convCount} deals ativos`,
          icon: DollarSign,
          variant: "primary" as const,
        },
        {
          title: "Ticket Médio",
          value: "R$ 0",
          trend: 0,
          description: "0 vendas fechadas",
          icon: Target,
          variant: "warning" as const,
        },
      ]);

      setSecondaryStats([
        {
          title: "Leads Hoje",
          value: "0",
          description: "Captação diária",
          icon: Zap,
          variant: "default" as const,
        },
        {
          title: "Taxa Qualificação",
          value: "0%",
          description: "de leads qualificados",
          icon: PieChart,
          variant: "default" as const,
        },
        {
          title: "Atividades Semana",
          value: "0",
          description: "Interações registradas",
          icon: Activity,
          variant: "default" as const,
        },
        {
          title: "Tempo Resposta",
          value: "0h",
          description: "Média de atendimento",
          icon: Clock,
          variant: "default" as const,
        },
      ]);

      setLoading(false);
    }

    if (profile) fetchDashboardData();
  }, [profile]);

  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (profileLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

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
        {metrics.map((metric, index) => (
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
        {secondaryStats.map((metric, index) => (
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

      {/* Funnel Chart - Simplified placeholder for dynamic data */}
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
             <p className="text-sm text-muted-foreground italic">
               Gráfico de funil em tempo real sendo populado com base nos novos leads da {profile?.organizations?.name}...
             </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
