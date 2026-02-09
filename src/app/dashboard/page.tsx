import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { redirect } from "next/navigation";
import { getDashboardMetrics } from "./actions";
import { MetricCard } from "@/components/dashboard/metric-card";
import { SourceDistribution } from "@/components/dashboard/source-distribution";
import { LeadsTimeline } from "@/components/dashboard/leads-timeline";
import { Users, Target, TrendingUp, DollarSign } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();

  if (!profile?.organization_id) {
    return redirect("/");
  }

  const dashboardData = await getDashboardMetrics(profile.organization_id);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col md:ml-64">
        <Header />
        <main className="flex-1 p-6 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Dashboard Analytics
            </h1>
            <p className="text-muted-foreground mt-1">
              Visão geral do seu funil de vendas e performance
            </p>
          </div>

          {/* Metrics Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total de Leads"
              value={dashboardData.metrics.totalLeads}
              change={12}
              icon={<Users className="h-5 w-5 text-blue-600" />}
              color="border-l-blue-500"
            />
            <MetricCard
              title="Taxa de Conversão"
              value={`${dashboardData.metrics.conversionRate}%`}
              change={5}
              icon={<Target className="h-5 w-5 text-green-600" />}
              color="border-l-green-500"
            />
            <MetricCard
              title="Receita Prevista"
              value={`R$ ${dashboardData.metrics.forecastRevenue.toLocaleString('pt-BR')}`}
              change={8}
              icon={<DollarSign className="h-5 w-5 text-purple-600" />}
              color="border-l-purple-500"
            />
            <MetricCard
              title="Deals Ganhos"
              value={dashboardData.metrics.wonDeals}
              change={-2}
              icon={<TrendingUp className="h-5 w-5 text-orange-600" />}
              color="border-l-orange-500"
            />
          </div>

          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            <LeadsTimeline data={dashboardData.leadsTimeline} />
            <SourceDistribution data={dashboardData.sourceDistribution} />
          </div>
        </main>
      </div>
    </div>
  );
}
