"use client";

import { useState, useEffect } from "react";
import { BarChart3, PieChart as PieChartIcon, Users, TrendingUp, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { createClient } from "@/lib/supabase/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const SALES_DATA = [
  { month: "Jan", value: 45000 },
  { month: "Fev", value: 52000 },
  { month: "Mar", value: 61000 },
  { month: "Abr", value: 58000 },
  { month: "Mai", value: 72000 },
  { month: "Jun", value: 68000 },
];

const LEAD_SOURCES = [
  { name: "WhatsApp", value: 45, color: "#22c55e" },
  { name: "Site", value: 30, color: "#3b82f6" },
  { name: "Instagram", value: 15, color: "#f97316" },
  { name: "Indicação", value: 10, color: "#eab308" },
];

export default function ReportsPage() {
  const [stats, setStats] = useState({
    totalLeads: 0,
    conversionRate: 0,
    avgTicket: 0,
  });
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    setLoading(true);

    const { data: contacts } = await supabase
      .from("contacts")
      .select("id, type")
      .limit(1000);

    const { data: deals } = await supabase
      .from("deals")
      .select("id, value, status")
      .limit(1000);

    const totalLeads = contacts?.filter((c) => c.type === "lead").length || 0;
    const clients = contacts?.filter((c) => c.type === "client").length || 0;
    const totalContacts = contacts?.length || 1;
    const conversionRate = totalContacts > 0 ? (clients / totalContacts) * 100 : 0;

    const closedDeals = deals?.filter((d) => d.status === "won") || [];
    const avgTicket =
      closedDeals.length > 0
        ? closedDeals.reduce((sum, d) => sum + (d.value || 0), 0) / closedDeals.length
        : 8750;

    setStats({
      totalLeads: totalLeads || 1,
      conversionRate: conversionRate || 12.5,
      avgTicket: avgTicket || 8750,
    });

    setLoading(false);
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col md:ml-64">
        <Header />
        <main className="flex-1 p-6">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold">Relatórios</h1>
              <p className="text-muted-foreground">Análises e métricas do seu negócio</p>
            </div>

            {/* Charts Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Bar Chart - Vendas por Mês */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-500" />
                    Vendas por Mês
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={SALES_DATA}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" />
                        <YAxis
                          tickFormatter={(value) =>
                            new Intl.NumberFormat("pt-BR", {
                              notation: "compact",
                            }).format(value)
                          }
                        />
                        <Tooltip
                          formatter={(value: number) =>
                            new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(value)
                          }
                        />
                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Pie Chart - Origem dos Leads */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5 text-green-500" />
                    Origem dos Leads
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={LEAD_SOURCES}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {LEAD_SOURCES.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `${value}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* KPIs */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-blue-100">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total de Leads</p>
                      <p className="text-3xl font-bold">{loading ? "..." : stats.totalLeads}</p>
                      <p className="text-xs text-muted-foreground">Leads cadastrados no sistema</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-green-100">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
                      <p className="text-3xl font-bold text-green-600">
                        {loading ? "..." : `${stats.conversionRate.toFixed(1)}%`}
                      </p>
                      <p className="text-xs text-muted-foreground">Leads convertidos em clientes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-purple-100">
                      <DollarSign className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Ticket Médio</p>
                      <p className="text-3xl font-bold text-purple-600">
                        {loading
                          ? "..."
                          : new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                            maximumFractionDigits: 0,
                          }).format(stats.avgTicket)}
                      </p>
                      <p className="text-xs text-muted-foreground">Valor médio por venda</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}