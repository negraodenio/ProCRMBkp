"use client";

import { useState, useEffect } from "react";
import {
    BarChart3,
    PieChart as PieChartIcon,
    Users,
    TrendingUp,
    DollarSign,
    Briefcase,
    Calendar as CalendarIcon,
    Download,
    AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/reports/date-range-picker";
import { DateRange } from "react-day-picker";
import { startOfMonth, endOfMonth, subDays } from "date-fns";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";

import { getAdvancedReportsData, type DashboardStats } from "./actions";

export default function ReportsPage() {
  // Default to last 30 days
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Pass dates to server action
        const reportsData = await getAdvancedReportsData(date?.from, date?.to);
        setData(reportsData);
      } catch (error) {
        console.error("Erro ao carregar relatórios:", error);
        toast.error("Erro ao carregar dados", {
            description: "Não foi possível gerar o relatório. Tente novamente."
        });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [date]); // Reload when date changes

  // Format currency
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const formatCompact = (value: number) =>
    new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 }).format(value);

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col md:ml-64">
          <Header />
          <main className="flex-1 p-6 flex items-center justify-center">
             <div className="flex flex-col items-center gap-4">
               <div className="h-12 w-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
               <p className="text-muted-foreground animate-pulse">Gerando inteligência de vendas...</p>
             </div>
          </main>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
        <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col md:ml-64">
          <Header />
          <main className="flex-1 p-6 flex items-center justify-center">
             <div className="flex flex-col items-center gap-4 text-center">
               <div className="p-4 bg-red-100 rounded-full text-red-600">
                    <AlertTriangle className="h-8 w-8" />
               </div>
               <h3 className="text-lg font-semibold">Falha ao carregar relatórios</h3>
               <p className="text-muted-foreground max-w-sm">
                 Não foi possível obter os dados de vendas. Tente atualizar a página ou verifique sua conexão.
               </p>
               <Button onClick={() => window.location.reload()} variant="outline">
                 Tentar Novamente
               </Button>
             </div>
          </main>
        </div>
      </div>
    )
  }

  const stats = data;

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <Sidebar />
      <div className="flex flex-1 flex-col md:ml-64">
        <Header />
        <main className="flex-1 p-6 space-y-8">

          {/* Top Header */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Relatórios de Vendas (Live)</h1>
              <p className="text-muted-foreground">Visão estratégica de performance e receita.</p>
            </div>
            <div className="flex items-center gap-2">
                <DatePickerWithRange date={date} setDate={setDate} />
                <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" /> Exportar
                </Button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                <DollarSign className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.wonDealsCount} vendas no período
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pipeline Ativo</CardTitle>
                <Briefcase className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{formatCurrency(stats.activePipeline)}</div>
                <p className="text-xs text-muted-foreground">
                  Em negociação aberta
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{formatCurrency(stats.avgTicket)}</div>
                <p className="text-xs text-muted-foreground">
                  Por venda fechada
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversão</CardTitle>
                <Users className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">{stats.conversionRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  {stats.wonDealsCount} ganhos de {stats.totalLeads} leads
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Charts Row */}
          <div className="grid gap-4 md:grid-cols-7">

            {/* Revenue Trend (Big) */}
            <Card className="md:col-span-4 shadow-sm">
                <CardHeader>
                    <CardTitle>Tendência de Receita</CardTitle>
                    <CardDescription>Evolução diária de vendas ganhas no período</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.revenueTrend}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="date"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    minTickGap={30}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `R$${formatCompact(value)}`}
                                />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <Tooltip
                                    formatter={(value: number) => formatCurrency(value)}
                                    labelStyle={{ color: "#374151" }}
                                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Sales Funnel (Side) */}
            <Card className="md:col-span-3 shadow-sm">
                <CardHeader>
                    <CardTitle>Funil de Vendas (Atual)</CardTitle>
                    <CardDescription>Distribuição de negociações ativas</CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout="vertical"
                                data={stats.salesFunnel}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    width={100}
                                    tick={{fontSize: 12}}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    cursor={{fill: 'transparent'}}
                                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                                />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                    {stats.salesFunnel.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                   </div>
                </CardContent>
            </Card>
          </div>

          {/* Bottom Row: Lead Sources & More */}
          <div className="grid gap-4 md:grid-cols-3">
             <Card className="md:col-span-1 shadow-sm">
                <CardHeader>
                    <CardTitle>Origem de Receita</CardTitle>
                    <CardDescription>Valor gerado por canal (Pipeline)</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.leadSources}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {stats.leadSources.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
             </Card>

             <Card className="md:col-span-2 shadow-sm flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-indigo-500" />
                        Performance de Equipe
                    </CardTitle>
                    <CardDescription>Ranking de vendas por vendedor</CardDescription>
                </CardHeader>
                <CardContent>
                   {stats.leaderboard.length > 0 ? (
                       <div className="space-y-4">
                           {stats.leaderboard.map((user, index) => (
                               <div key={user.userId} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                   <div className="flex items-center gap-3">
                                       <div className={`
                                           flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm
                                           ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                             index === 1 ? 'bg-slate-200 text-slate-700' :
                                             index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'}
                                       `}>
                                           {index + 1}
                                       </div>
                                       <div>
                                           <p className="font-medium text-sm text-slate-900">{user.name}</p>
                                           <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <span>{user.deals} vendas</span>
                                                {/* <span>• {user.email}</span> */}
                                           </div>
                                       </div>
                                   </div>
                                   <div className="text-right">
                                       <p className="font-bold text-sm text-slate-900">{formatCurrency(user.value)}</p>
                                       {index === 0 && <span className="text-[10px] text-yellow-600 font-medium">🏆 Top 1</span>}
                                   </div>
                               </div>
                           ))}
                       </div>
                   ) : (
                       <div className="text-center py-8">
                           <p className="text-sm text-muted-foreground">Nenhuma venda registrada neste período.</p>
                       </div>
                   )}
                </CardContent>
             </Card>
          </div>

        </main>
      </div>
    </div>
  );
}
